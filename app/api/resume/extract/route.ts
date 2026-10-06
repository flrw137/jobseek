import { extractProfileFromResume } from "@/agent/extractor";
import { createInsforgeServer } from "@/lib/insforge-server";
import { extractPdfText } from "@/lib/pdf-extract";
import { NextRequest, NextResponse } from "next/server";

const MAX_RESUME_BYTES = 5 * 1024 * 1024;
const MIN_TEXT_LENGTH = 100;

function jsonError(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(request: NextRequest) {
  const insforge = await createInsforgeServer();
  const { data: session, error: sessionError } = await insforge.auth.getCurrentUser();
  if (sessionError || !session?.user) {
    return jsonError("You must be signed in.", 401);
  }
  const userId = session.user.id;

  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return jsonError("Invalid request body.", 400);
  }
  const file = formData.get("resume");

  let buffer: Buffer;
  if (file instanceof File) {
    const isPdf =
      file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      return jsonError("Resume must be a PDF file.", 400);
    }
    if (file.size > MAX_RESUME_BYTES) {
      return jsonError("Resume must be 5MB or smaller.", 400);
    }
    buffer = Buffer.from(await file.arrayBuffer());
  } else {
    const { data: blob, error: downloadError } = await insforge.storage
      .from("resumes")
      .download(`${userId}/resume.pdf`);
    if (downloadError || !blob) {
      return jsonError("No resume found to extract.", 400);
    }
    buffer = Buffer.from(await blob.arrayBuffer());
  }

  let text = "";
  try {
    text = await extractPdfText(buffer);
  } catch {
    return jsonError("Could not read this PDF file.", 422);
  }

  if (text.trim().length < MIN_TEXT_LENGTH) {
    return jsonError(
      "Could not extract text from this PDF. Please try a different file.",
      422,
    );
  }

  let profile;
  try {
    profile = await extractProfileFromResume(text);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Extraction failed. Please try again.";
    return jsonError(message, 502);
  }

  return NextResponse.json({ data: profile });
}

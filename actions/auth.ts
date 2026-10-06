"use server";

import { createAuthActions } from "@insforge/sdk/ssr";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

export async function initiateOAuth(formData: FormData) {
  const provider = String(formData.get("provider") ?? "");

  const cookieStore = await cookies();
  const headerStore = await headers();
  const host = headerStore.get("x-forwarded-host") ?? headerStore.get("host");
  const protocol =
    headerStore.get("x-forwarded-proto") ??
    (process.env.NODE_ENV === "production" ? "https" : "http");
  const origin = `${protocol}://${host}`;

  const auth = createAuthActions({ cookies: cookieStore });
  const { data, error } = await auth.signInWithOAuth(provider, {
    redirectTo: `${origin}/api/auth/callback`,
    skipBrowserRedirect: true,
  });

  if (error || !data.url || !data.codeVerifier) {
    throw new Error(error?.message ?? "OAuth init failed");
  }

  cookieStore.set("insforge_code_verifier", data.codeVerifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });

  redirect(data.url);
}

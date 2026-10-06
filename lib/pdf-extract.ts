import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import * as pdfjsWorker from "pdfjs-dist/legacy/build/pdf.worker.mjs";

const g = globalThis as { pdfjsWorker?: typeof pdfjsWorker };
g.pdfjsWorker = pdfjsWorker;

export async function extractPdfText(buffer: Buffer): Promise<string> {
  const data = new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength);
  const loadingTask = getDocument({ data });
  const doc = await loadingTask.promise;

  try {
    let text = "";
    for (let index = 1; index <= doc.numPages; index++) {
      const page = await doc.getPage(index);
      const content = await page.getTextContent();
      const pageText = content.items
        .map((item) => ("str" in item ? item.str : ""))
        .join(" ");
      text += `${pageText}\n`;
      page.cleanup();
    }
    return text;
  } finally {
    await loadingTask.destroy();
  }
}

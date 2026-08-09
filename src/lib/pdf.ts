import { getDocument, GlobalWorkerOptions, version } from "pdfjs-dist";

// El worker de pdf.js se sirve desde unpkg para garantizar la misma version.
GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${version}/build/pdf.worker.min.mjs`;

// pdfjs-dist v4 usa Promise.withResolvers (Chrome 119+, Safari 17.4+).
// Polyfill minimo para navegadores mas antiguos.
type WithResolversReturn = {
  promise: Promise<unknown>;
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
};

if (typeof (Promise as { withResolvers?: unknown }).withResolvers === "undefined") {
  (Promise as unknown as { withResolvers: () => WithResolversReturn }).withResolvers = function () {
    let resolve!: (value: unknown) => void;
    let reject!: (reason?: unknown) => void;
    const promise = new Promise<unknown>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

export interface PdfParseResult {
  text: string;
  numPages: number;
}

export async function extractTextFromFile(file: File): Promise<PdfParseResult> {
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;

  let text = "";
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    text += pageText + "\n";
    page.cleanup();
  }

  await pdf.destroy();
  return { text, numPages };
}

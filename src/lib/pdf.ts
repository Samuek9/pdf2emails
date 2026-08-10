// pdfjs-dist se carga bajo demanda (lazy import) para no inflar el JS inicial
// de la landing. Solo se descarga cuando el usuario procesa un PDF.
type PdfJsModule = typeof import("pdfjs-dist");

let pdfjsPromise: Promise<PdfJsModule> | null = null;

async function loadPdfJs(): Promise<PdfJsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist").then((pdfjs) => {
      // El worker se sirve desde el MISMO ORIGEN (webpack lo empaqueta a
      // /_next/static). Asi se respeta la CSP de Vercel (worker-src 'self')
      // y se elimina la dependencia de terceros (unpkg) que penalizaba el
      // rendimiento y podia romper la extraccion.
      pdfjs.GlobalWorkerOptions.workerSrc = new URL(
        "pdfjs-dist/build/pdf.worker.min.mjs",
        import.meta.url,
      ).toString();
      return pdfjs;
    });
  }
  return pdfjsPromise;
}

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

export const MAX_PAGES = 30;

/** Se lanza cuando el PDF excede MAX_PAGES — se detecta ANTES de procesar
 * ninguna pagina (y antes de arrancar OCR), no despues de gastar el trabajo. */
export class TooManyPagesError extends Error {
  constructor(public numPages: number) {
    super(`PDF has ${numPages} pages, max is ${MAX_PAGES}`);
    this.name = "TooManyPagesError";
  }
}

export async function extractTextFromFile(file: File): Promise<PdfParseResult> {
  const { getDocument } = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  if (numPages > MAX_PAGES) {
    await pdf.destroy();
    throw new TooManyPagesError(numPages);
  }

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

/**
 * OCR para PDFs escaneados (sin capa de texto). Renderiza cada pagina a imagen
 * y la procesa con tesseract.js. Tesseract se carga bajo demanda (lazy import).
 */
export async function extractTextWithOcr(file: File, lang: string): Promise<PdfParseResult> {
  const { getDocument } = await loadPdfJs();
  const arrayBuffer = await file.arrayBuffer();
  const loadingTask = getDocument({ data: new Uint8Array(arrayBuffer) });
  const pdf = await loadingTask.promise;
  const numPages = pdf.numPages;
  if (numPages > MAX_PAGES) {
    await pdf.destroy();
    throw new TooManyPagesError(numPages);
  }

  const { createWorker } = await import("tesseract.js");
  const worker = await createWorker(lang);

  let text = "";
  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: 2 });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      // No silenciar: si el navegador no puede darnos un contexto 2D, el
      // usuario terminaria con un resultado incompleto sin saberlo. Mejor
      // fallar y dejar que reintente en vez de devolver texto a medias.
      page.cleanup();
      await worker.terminate();
      await pdf.destroy();
      throw new Error(`Could not get 2D canvas context for page ${i}`);
    }
    await page.render({ canvasContext: ctx, viewport }).promise;
    const { data } = await worker.recognize(canvas);
    text += data.text + "\n";
    page.cleanup();
  }

  await worker.terminate();
  await pdf.destroy();
  return { text, numPages };
}


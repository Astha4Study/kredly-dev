import * as pdfjsLib from 'pdfjs-dist';

// Configure PDF.js worker - use local worker from node_modules
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString();

export interface PDFRenderOptions {
  scale?: number; // Scale for rendering (default: 2 for high quality)
  maxPages?: number; // Max pages to process (default: 5)
}

export async function extractPDFImages(
  file: File,
  options: PDFRenderOptions = {},
): Promise<string[]> {
  const { scale = 2, maxPages = 5 } = options;

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const numPages = Math.min(pdf.numPages, maxPages);
  const images: string[] = [];

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
      throw new Error('Failed to get canvas context');
    }

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport: viewport,
    }).promise;

    // Convert canvas to base64 JPEG
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    images.push(imageData);
  }

  return images;
}

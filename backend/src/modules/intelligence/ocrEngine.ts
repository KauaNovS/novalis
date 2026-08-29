import { createWorker } from 'tesseract.js';

export interface OcrResult {
  texto: string;
  confianca: number;
}

/** OCR local. O idioma pode ser configurado por NOVALIS_OCR_LANG (default por+eng). */
export async function executarOcr(caminhoImagem: string, idioma = process.env.NOVALIS_OCR_LANG || 'por+eng'): Promise<OcrResult> {
  const worker = await createWorker(idioma);
  try {
    const result = await worker.recognize(caminhoImagem);
    const confidence = Number(result.data.confidence || 0) / 100;
    return { texto: result.data.text || '', confianca: confidence };
  } finally {
    await worker.terminate();
  }
}

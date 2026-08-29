import fs from 'node:fs/promises';
import pdfParse from 'pdf-parse';

export interface PdfTextResult {
  texto: string;
  paginas: number;
  metadados: Record<string, unknown>;
}

export async function extrairTextoPdf(caminho: string): Promise<PdfTextResult> {
  const buffer = await fs.readFile(caminho);
  const data = await pdfParse(buffer);
  return {
    texto: data.text || '',
    paginas: data.numpages || 0,
    metadados: (data.info || {}) as Record<string, unknown>,
  };
}

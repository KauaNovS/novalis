import fs from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

export interface ImagemProcessada {
  caminho: string;
  largura: number;
  altura: number;
  mimeType: string;
}

export async function normalizarImagem(caminhoEntrada: string, diretorioSaida: string): Promise<ImagemProcessada> {
  await fs.mkdir(diretorioSaida, { recursive: true });
  const nome = `${path.parse(caminhoEntrada).name}.normalized.png`;
  const destino = path.join(diretorioSaida, nome);
  const info = await sharp(caminhoEntrada)
    .rotate()
    .grayscale()
    .normalize()
    .png()
    .toFile(destino);
  return { caminho: destino, largura: info.width, altura: info.height, mimeType: 'image/png' };
}

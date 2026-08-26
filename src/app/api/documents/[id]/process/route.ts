import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import fs from 'fs/promises';
import path from 'path';
import pdfParse from 'pdf-parse';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await prisma.document.findUnique({ where: { id } });
    if (!doc) return NextResponse.json({ error: 'Documento não encontrado' }, { status: 404 });

    // Atualizar status para PROCESSING
    await prisma.document.update({ where: { id }, data: { status: 'PROCESSING' } });

    let extractedText = '';
    let filePath = path.join(process.cwd(), 'public', doc.path);

    // Se for PDF, tentar extrair texto
    if (doc.mimeType === 'application/pdf') {
      const buffer = await fs.readFile(filePath);
      const data = await pdfParse(buffer);
      extractedText = data.text;
    } else {
      // Outros tipos (imagens) podem ser processados com Tesseract no futuro
      // Por enquanto, retornamos texto vazio.
    }

    // Lógica simples de extração (unidades, preços)
    const extracted = simpleExtract(extractedText);

    // Salvar dados extraídos
    await prisma.document.update({
      where: { id },
      data: {
        status: 'PROCESSED',
        data: JSON.stringify(extracted),
      },
    });

    return NextResponse.json({ success: true, extracted });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao processar' }, { status: 500 });
  }
}

function simpleExtract(text: string) {
  const units = [];
  const priceRegex = /R\$\s*([\d.]+(?:,\d{2})?)/g;
  const unitRegex = /(?:unidade|apto|ap)\s*[:\-]?\s*(\d+)/gi;

  let match;
  while ((match = unitRegex.exec(text)) !== null) {
    units.push({
      unitNumber: match[1],
      price: null,
    });
  }

  // Atribuir preços às unidades encontradas (simplificado)
  const prices = [];
  while ((match = priceRegex.exec(text)) !== null) {
    prices.push(parseFloat(match[1].replace(/\./g, '').replace(',', '.')));
  }
  units.forEach((u, i) => {
    u.price = prices[i] || null;
  });

  return { units, rawText: text.slice(0, 1000) };
}

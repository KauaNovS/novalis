import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type') || 'clients';
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');
    const status = searchParams.get('status');

    // Construir filtros básicos
    const where: any = {};
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }
    if (status) where.status = status;

    let title = 'Relatório';
    let records: any[] = [];

    switch (type) {
      case 'clients':
        title = 'Relatório de Clientes';
        records = await prisma.client.findMany({
          where,
          select: { id: true, name: true, status: true },
          orderBy: { createdAt: 'desc' },
          take: 100, // limita para não pesar
        });
        break;
      case 'deals':
        title = 'Relatório de Negócios';
        records = await prisma.deal.findMany({
          where,
          select: { id: true, title: true, stage: true },
          orderBy: { createdAt: 'desc' },
          take: 100,
        });
        break;
      case 'units':
        title = 'Relatório de Unidades';
        records = await prisma.unit.findMany({
          where,
          select: { id: true, unitNumber: true, status: true },
          orderBy: { createdAt: 'desc' },
          take: 100,
        });
        break;
      default:
        records = [];
    }

    // Gerar PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([595, 842]); // A4
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    const { width, height } = page.getSize();

    // Título
    page.drawText(title, {
      x: 50,
      y: height - 60,
      size: 18,
      font: boldFont,
      color: rgb(0, 0, 0),
    });

    // Período e total
    const periodText = `Período: ${startDate || 'início'} a ${endDate || 'hoje'}`;
    page.drawText(periodText, { x: 50, y: height - 85, size: 10, font, color: rgb(0.3, 0.3, 0.3) });
    page.drawText(`Total de registros: ${records.length}`, { x: 50, y: height - 100, size: 10, font: boldFont, color: rgb(0, 0, 0) });

    // Tabela simplificada
    let y = height - 130;
    const lineHeight = 18;
    page.drawText('Nome / Título', { x: 50, y, size: 10, font: boldFont, color: rgb(0, 0, 0) });
    page.drawText('Status / Etapa', { x: 350, y, size: 10, font: boldFont, color: rgb(0, 0, 0) });
    y -= 20;

    for (const rec of records) {
      if (y < 50) break; // evita estourar página
      const name = rec.name || rec.title || rec.unitNumber || '—';
      const status = rec.status || rec.stage || '—';
      page.drawText(name.slice(0, 40), { x: 50, y, size: 9, font, color: rgb(0, 0, 0) });
      page.drawText(status.slice(0, 20), { x: 350, y, size: 9, font, color: rgb(0, 0, 0) });
      y -= lineHeight;
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(pdfBytes, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="relatorio_${type}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error('Erro ao gerar PDF:', error);
    return NextResponse.json({ error: error.message || 'Erro ao gerar PDF' }, { status: 500 });
  }
}
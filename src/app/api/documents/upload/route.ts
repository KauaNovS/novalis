import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const name = formData.get('name') as string | null;
    const type = formData.get('type') as string | null;
    const projectId = formData.get('projectId') as string | null;
    const uploadedBy = (formData.get('uploadedBy') as string) || 'demo';

    if (!file) {
      return NextResponse.json(
        { error: 'Arquivo é obrigatório' },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueName = `${Date.now()}-${originalName}`;

    const uploadDir = path.join(process.cwd(), 'public', 'uploads');
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, uniqueName), buffer);

    const document = await prisma.document.create({
      data: {
        name: name || file.name,
        type: type || 'OTHER',
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        path: `/uploads/${uniqueName}`,
        status: 'PROCESSED',
        uploadedBy,
        projectId: projectId || null,
        data: JSON.stringify({
          extractedName: file.name,
          processedAt: new Date().toISOString(),
        }),
      },
    });

    return NextResponse.json(document, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Erro ao fazer upload' },
      { status: 500 }
    );
  }
}
import type { PrismaClient } from '@prisma/client';

export interface PlantaImportInput {
  nome: string;
  area_m2: number;
  tipologia: string;
  final: number;
  andares: number[];
  caracteristicas?: string[];
  imagem_planta?: string | null;
  imagem_perspectiva?: string | null;
  opcao?: string;
}

export interface ImagemEmpreendimentoInput {
  titulo: string;
  categoria: string;
  url: string;
  descricao?: string | null;
  ordem?: number;
}

export interface BookImportInput {
  projectId: string;
  plantas: PlantaImportInput[];
  imagens?: ImagemEmpreendimentoInput[];
}

export async function importBookPlantas(prisma: PrismaClient, input: BookImportInput) {
  const result = { plantasCriadas: 0, plantasAtualizadas: 0, imagensCriadas: 0, erros: [] as Array<{ item: string; erro: string }> };
  for (const p of input.plantas) {
    try {
      const opcao = p.opcao || (/padr[aã]o/i.test(p.nome) ? 'padrao' : 'opcao');
      const existente = await prisma.planta.findUnique({ where: { projectId_final_tipologia_opcao: { projectId: input.projectId, final: p.final, tipologia: p.tipologia, opcao } } });
      const data = {
        nome: p.nome,
        final: p.final,
        areaM2: p.area_m2,
        tipologia: p.tipologia,
        andares: p.andares,
        caracteristicas: JSON.stringify(p.caracteristicas ?? []),
        opcao,
        imagemPlanta: p.imagem_planta ?? null,
        imagemPerspectiva: p.imagem_perspectiva ?? null,
      };
      if (existente) {
        await prisma.planta.update({ where: { id: existente.id }, data });
        result.plantasAtualizadas++;
      } else {
        await prisma.planta.create({ data: { ...data, projectId: input.projectId } });
        result.plantasCriadas++;
      }
    } catch (err) {
      result.erros.push({ item: p.nome, erro: err instanceof Error ? err.message : String(err) });
    }
  }

  for (const img of input.imagens ?? []) {
    try {
      await prisma.projectImage.create({ data: { projectId: input.projectId, url: img.url, order: img.ordem ?? 0 } });
      result.imagensCriadas++;
    } catch (err) {
      result.erros.push({ item: img.titulo, erro: err instanceof Error ? err.message : String(err) });
    }
  }
  return result;
}

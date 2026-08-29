import type { PrismaClient } from '@prisma/client';
import type { LinhaTabelao } from '../intelligence/types.js';
import { calcularValorM2, normalizarNome, normalizarNumeroUnidade, normalizarTipologia } from '../normalizer/realEstateNormalizer.js';
import { validarLinhaTabelao, validarPrecoM2 } from '../validator/dataValidator.js';

export interface TabelaoImportInput {
  linhas: LinhaTabelao[];
  arquivo: string;
  tipoDocumento?: string;
  importacaoId?: string;
}
export interface TabelaoImportResult {
  projetosCriados: number;
  projetosAtualizados: number;
  unidadesCriadas: number;
  unidadesAtualizadas: number;
  incorporadorasResolvidas: number;
  divergenciasPrecoM2: number;
  erros: Array<{ linha: number; erro: string }>;
}

function statusUnit(value?: string | null): string {
  const s = normalizarNome(value);
  if (s.includes('vend')) return 'SOLD';
  if (s.includes('reserv')) return 'RESERVED';
  return 'AVAILABLE';
}

function inferirBedrooms(tipologia?: string | null): number {
  const s = normalizarNome(tipologia);
  const match = s.match(/(\d+)\s*dorm/);
  return match ? Number(match[1]) : 0;
}

async function resolveDeveloper(prisma: PrismaClient, nome: string) {
  const alvo = normalizarNome(nome);
  const encontrados = await prisma.developer.findMany({ take: 100 });
  const exato = encontrados.find((d) => normalizarNome(d.name) === alvo);
  if (exato) return exato;
  const parcial = encontrados.find((d) => normalizarNome(d.name).includes(alvo) || alvo.includes(normalizarNome(d.name)));
  if (parcial) return parcial;
  return prisma.developer.create({ data: { name: nome.trim() } });
}

async function resolveOrganization(prisma: PrismaClient, nome: string) {
  const alvo = normalizarNome(nome);
  const encontrados = await prisma.organization.findMany({ take: 100 });
  const exato = encontrados.find((o) => normalizarNome(o.name) === alvo);
  if (exato) return exato;
  const parcial = encontrados.find((o) => normalizarNome(o.name).includes(alvo) || alvo.includes(normalizarNome(o.name)));
  if (parcial) return parcial;
  return prisma.organization.create({ data: { name: nome.trim(), type: 'DEVELOPER' } });
}

async function resolveProject(prisma: PrismaClient, linha: LinhaTabelao, developerId: string, organizationId: string) {
  if (!linha.empreendimento) return null;
  const alvo = normalizarNome(linha.empreendimento);
  const projetos = await prisma.project.findMany({ where: { developerId }, take: 200 });
  const encontrado = projetos.find((p) => normalizarNome(p.name) === alvo)
    || projetos.find((p) => normalizarNome(p.name).includes(alvo) || alvo.includes(normalizarNome(p.name)));
  if (encontrado) {
    return prisma.project.update({ where: { id: encontrado.id }, data: {
      neighborhood: linha.bairro ?? undefined,
      address: linha.endereco ?? undefined,
      deliveryDate: linha.entrega_prevista ? new Date(linha.entrega_prevista) : undefined,
    } });
  }
  const slugBase = alvo.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 90) || `empreendimento-${Date.now()}`;
  const slug = `${slugBase}-${Date.now()}`.slice(0, 120);
  return prisma.project.create({ data: {
    name: linha.empreendimento.trim(),
    slug,
    status: 'DRAFT',
    developerId,
    organizationId,
    neighborhood: linha.bairro || undefined,
    address: linha.endereco || undefined,
    deliveryDate: linha.entrega_prevista ? new Date(linha.entrega_prevista) : undefined,
  } });
}

async function resolveTower(prisma: PrismaClient, projectId: string, nome?: string | null) {
  const towerName = nome?.trim() || 'Torre Única';
  const existente = await prisma.tower.findFirst({ where: { projectId, name: towerName } });
  if (existente) return existente;
  return prisma.tower.create({ data: { projectId, name: towerName, floors: 0 } });
}

export async function importarTabelao(prisma: PrismaClient, input: TabelaoImportInput): Promise<TabelaoImportResult> {
  const result: TabelaoImportResult = { projetosCriados: 0, projetosAtualizados: 0, unidadesCriadas: 0, unidadesAtualizadas: 0, incorporadorasResolvidas: 0, divergenciasPrecoM2: 0, erros: [] };
  const developers = new Map<string, Awaited<ReturnType<typeof resolveDeveloper>>>();
  const organizations = new Map<string, Awaited<ReturnType<typeof resolveOrganization>>>();
  const projects = new Map<string, Awaited<ReturnType<typeof resolveProject>>>();

  for (let i = 0; i < input.linhas.length; i++) {
    const linha = input.linhas[i];
    try {
      const erros = validarLinhaTabelao(linha);
      if (erros.length) throw new Error(erros.join('; '));
      if (!linha.empreendimento) throw new Error('empreendimento ausente');
      const incorporadoraNome = linha.incorporadora || 'Incorporadora não informada';
      const devKey = normalizarNome(incorporadoraNome);
      if (!developers.has(devKey)) developers.set(devKey, await resolveDeveloper(prisma, incorporadoraNome));
      if (!organizations.has(devKey)) organizations.set(devKey, await resolveOrganization(prisma, incorporadoraNome));
      const developer = developers.get(devKey)!;
      const organization = organizations.get(devKey)!;
      result.incorporadorasResolvidas++;

      const projectKey = `${developer.id}:${normalizarNome(linha.empreendimento)}`;
      if (!projects.has(projectKey)) projects.set(projectKey, await resolveProject(prisma, linha, developer.id, organization.id));
      const project = projects.get(projectKey);
      if (!project) throw new Error('empreendimento não resolvido');

      const tower = await resolveTower(prisma, project.id, linha.torre);
      if (linha.andar != null && linha.andar > tower.floors) await prisma.tower.update({ where: { id: tower.id }, data: { floors: linha.andar } });
      if (linha.andar == null || linha.final == null) continue;

      const numero = normalizarNumeroUnidade(linha.andar, linha.final);
      const valorM2 = calcularValorM2(linha.valor_unidade, linha.area_m2);
      const validacao = validarPrecoM2(linha);
      if (validacao.status === 'DIVERGENTE') result.divergenciasPrecoM2++;

      const existente = await prisma.unit.findFirst({ where: { projectId: project.id, towerId: tower.id, unitNumber: numero } });
      const data = {
        floor: linha.andar,
        final: linha.final,
        typology: normalizarTipologia(linha.tipologia),
        topology: linha.topologia || undefined,
        bedrooms: inferirBedrooms(linha.tipologia),
        area: linha.area_m2 ?? 0,
        parkingSpaces: linha.vagas ?? 0,
        status: statusUnit(linha.status),
        currentPrice: linha.valor_unidade ?? undefined,
        pricePerSquareMeter: valorM2 ?? undefined,
        documentPricePerSquareMeter: linha.valor_m2_documento ?? undefined,
        calculatedPricePerSquareMeter: valorM2 ?? undefined,
      };

      let unit;
      if (existente) {
        unit = await prisma.unit.update({ where: { id: existente.id }, data });
        result.unidadesAtualizadas++;
      } else {
        unit = await prisma.unit.create({ data: { ...data, projectId: project.id, towerId: tower.id, unitNumber: numero } });
        result.unidadesCriadas++;
      }

      if (input.importacaoId) {
        const evidencias = [
          ['empreendimento', linha.empreendimento, 0.95],
          ['incorporadora', incorporadoraNome, 0.95],
          ['valor_unidade', linha.valor_unidade, linha.valor_unidade != null ? 0.9 : null],
          ['area_m2', linha.area_m2, linha.area_m2 != null ? 0.9 : null],
          ['valor_m2_documento', linha.valor_m2_documento, linha.valor_m2_documento != null ? 0.9 : null],
          ['valor_m2_calculado', valorM2, valorM2 != null ? 1 : null],
          ['final', linha.final, 0.95],
        ] as const;
        await prisma.importEvidence.createMany({ data: evidencias.filter(([, value]) => value != null).map(([campo, value, confianca]) => ({
          importacaoId: input.importacaoId,
          projectId: project.id,
          unitId: unit.id,
          campo,
          valor: String(value),
          linha: i + 1,
          origem: input.arquivo,
          confianca,
          metadata: validacao.status === 'DIVERGENTE' ? JSON.stringify({ validacaoPrecoM2: validacao }) : undefined,
        })) });
      }
    } catch (error) {
      result.erros.push({ linha: i + 1, erro: error instanceof Error ? error.message : String(error) });
    }
  }
  return result;
}

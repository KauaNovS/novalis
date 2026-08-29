import fs from 'node:fs/promises';
import path from 'node:path';
import * as XLSX from 'xlsx';
import { classificarDocumento } from '../intelligence/documentClassifier.js';
import type { LinhaTabelao, TabelaoParseResult } from '../intelligence/types.js';

const ALIASES: Record<string, keyof LinhaTabelao> = {
  incorporadora: 'incorporadora', incorporador: 'incorporadora', construtora: 'incorporadora',
  empreendimento: 'empreendimento', projeto: 'empreendimento', nome: 'empreendimento',
  torre: 'torre', bloco: 'torre',
  andar: 'andar', pavimento: 'andar', piso: 'andar',
  final: 'final', apto: 'numero', apartamento: 'numero', unidade: 'numero', unitnumber: 'numero', 'unit number': 'numero',
  tipologia: 'tipologia', tipo: 'tipologia',
  topologia: 'topologia', produto: 'tipologia',
  area: 'area_m2', 'area m2': 'area_m2', 'm2': 'area_m2', 'area m': 'area_m2',
  vagas: 'vagas', vaga: 'vagas',
  preco: 'valor_unidade', valor: 'valor_unidade', 'valor unidade': 'valor_unidade', 'valor total': 'valor_unidade',
  'valor m2': 'valor_m2_documento', 'valor m 2': 'valor_m2_documento', 'valor por m2': 'valor_m2_documento', 'valor/m2': 'valor_m2_documento', 'r$/m2': 'valor_m2_documento',
  status: 'status', situacao: 'status',
  bairro: 'bairro', endereco: 'endereco', 'endereco completo': 'endereco', entrega: 'entrega_prevista', 'entrega prevista': 'entrega_prevista',
};

function normalizarCabecalho(v: unknown): string {
  return String(v ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, ' ');
}

function numero(v: unknown): number | null {
  if (v === null || v === undefined || v === '') return null;
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  let s = String(v).trim().replace(/R\$\s?/gi, '').replace(/\s/g, '').replace(/[^0-9,.-]/g, '');
  if (!s) return null;

  const hasComma = s.includes(',');
  const hasDot = s.includes('.');
  if (hasComma && hasDot) {
    // 1.234.567,89 -> 1234567.89
    if (s.lastIndexOf(',') > s.lastIndexOf('.')) s = s.replace(/\./g, '').replace(',', '.');
    // 1,234,567.89 -> 1234567.89
    else s = s.replace(/,/g, '');
  } else if (hasComma) {
    const parts = s.split(',');
    s = parts.length === 2 && parts[1].length <= 2 ? `${parts[0].replace(/\./g, '')}.${parts[1]}` : s.replace(/,/g, '');
  } else if ((s.match(/\./g) || []).length > 1) {
    s = s.replace(/\./g, '');
  }

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function inteiro(v: unknown): number | null {
  const n = numero(v);
  return n === null ? null : Math.trunc(n);
}

function stringOrNull(v: unknown): string | null {
  const s = String(v ?? '').trim();
  return s || null;
}

export async function parsearTabelao(caminho: string): Promise<TabelaoParseResult> {
  const ext = path.extname(caminho).toLowerCase();
  if (!['.xlsx', '.xls', '.csv'].includes(ext)) throw new Error(`TABELÃO: formato não suportado: ${ext}`);
  const workbook = XLSX.read(await fs.readFile(caminho), { type: 'buffer', cellDates: true, raw: false });
  const linhas: LinhaTabelao[] = [];
  const avisos: string[] = [];
  let cabecalhos: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: '' });
    if (!rows.length) continue;
    const headerIndex = rows.findIndex((row) => row.some((c) => /empreendimento|unidade|apartamento|pre[cç]o|valor|area|área|tipologia/i.test(String(c))));
    if (headerIndex < 0) continue;
    const rawHeaders = (rows[headerIndex] || []).map(normalizarCabecalho);
    if (!cabecalhos.length) cabecalhos = rawHeaders;
    const mapping = rawHeaders.map((h) => ALIASES[h]);
    for (const row of rows.slice(headerIndex + 1)) {
      if (!row.some((c) => String(c ?? '').trim())) continue;
      const out: LinhaTabelao = {};
      row.forEach((value, i) => {
        const key = mapping[i];
        if (!key) return;
        if (['andar', 'final', 'vagas'].includes(key)) out[key] = inteiro(value) as never;
        else if (['area_m2', 'valor_unidade', 'valor_m2_documento'].includes(key)) out[key] = numero(value) as never;
        else out[key] = stringOrNull(value) as never;
      });
      if (out.empreendimento || out.numero || out.valor_unidade) linhas.push(out);
    }
  }
  if (!linhas.length) avisos.push('Nenhuma linha estruturada foi encontrada. Para PDF/imagem, passe primeiro pelo Intelligence Engine (OCR/Vision).');
  const confianca = Math.min(1, (linhas.length ? 0.65 : 0) + (cabecalhos.length >= 4 ? 0.25 : 0));
  return { tipo: 'TABELAO', linhas, cabecalhos, confianca, avisos };
}

export function classificarTabelao(caminho: string, texto = '') {
  return classificarDocumento(path.basename(caminho), texto);
}

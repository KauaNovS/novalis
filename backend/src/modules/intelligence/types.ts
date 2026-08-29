export type TipoDocumento =
  | 'TABELAO'
  | 'BOOK'
  | 'ESPELHO_VENDAS'
  | 'TABELA_PRECOS'
  | 'TABELA_FINANCIAMENTO'
  | 'DESCONHECIDO';

export interface DocumentoFonte {
  nomeArquivo: string;
  mimeType: string;
  tamanhoBytes: number;
  tipo: TipoDocumento;
}

export interface LinhaTabelao {
  incorporadora?: string | null;
  empreendimento?: string | null;
  torre?: string | null;
  andar?: number | null;
  final?: number | null;
  numero?: string | null;
  tipologia?: string | null;
  topologia?: string | null;
  area_m2?: number | null;
  vagas?: number | null;
  valor_unidade?: number | null;
  valor_m2_documento?: number | null;
  status?: string | null;
  bairro?: string | null;
  endereco?: string | null;
  entrega_prevista?: string | null;
  fonte?: string | null;
  pagina?: number | null;
}

export interface TabelaoParseResult {
  tipo: 'TABELAO';
  linhas: LinhaTabelao[];
  cabecalhos: string[];
  confianca: number;
  avisos: string[];
}

export interface MatchEvidence {
  nivel: number;
  score: number;
  metodo: string;
  evidencias: string[];
}

export interface MatchResult<T> {
  planta: T | null;
  evidence: MatchEvidence | null;
}

export interface ValidacaoPreco {
  valor_unidade: number | null;
  area_m2: number | null;
  valor_m2_documento: number | null;
  valor_m2_calculado: number | null;
  divergencia_percentual: number | null;
  status: 'VALIDO' | 'DIVERGENTE' | 'INDETERMINADO';
}

// Tipos compartilhados da Market Intelligence. Mantém o contrato usado pelo frontend.
export interface Indicator { id: string; title: string; valueMes: string; valueAno: string; change: string; direction: 'up' | 'down' | 'neutral'; source: string; lastUpdate: string; grafico12m: { mes: string; valor: number }[]; }
export interface RegionalData { city: string; state: string; pricePerM2: number; variation: string; source: string; }
export interface Projection { cenario: string; valor: string; }
export interface CompItem { asset: string; rentabilidade: string; source: string; }
export interface Financing { taxaMediaJuros: string; taxaEfetiva: string; ltv: string; prazoMaximo: string; volumeUltimos12m: string; fonte: string; }
export interface NewsItem { title: string; url: string; source: string; }
export interface Timeline { selic: { ano: string; valor: number }[]; ipca: { ano: string; valor: number }[]; incc: { ano: string; valor: number }[]; cdi: { ano: string; valor: number }[]; }

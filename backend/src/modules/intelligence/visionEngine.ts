import fs from 'node:fs/promises';
import axios from 'axios';

export interface VisionResult {
  texto: string;
  json: unknown | null;
  confianca: number;
  provedor: string;
}

/**
 * Vision Computing opcional. Mantém o núcleo desacoplado do provedor.
 * Se OPENAI_API_KEY não existir, retorna um resultado explícito de indisponibilidade.
 */
export async function executarVision(caminhoImagem: string, prompt: string): Promise<VisionResult> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return { texto: '', json: null, confianca: 0, provedor: 'indisponivel' };
  }

  const base64 = (await fs.readFile(caminhoImagem)).toString('base64');
  const model = process.env.NOVALIS_VISION_MODEL || 'gpt-4o-mini';
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model,
      temperature: 0,
      response_format: { type: 'json_object' },
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: prompt },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${base64}` } },
        ],
      }],
    },
    { headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' }, timeout: 120000 },
  );

  const raw = response.data?.choices?.[0]?.message?.content || '{}';
  let json: unknown = null;
  try { json = JSON.parse(raw); } catch { /* mantém texto bruto */ }
  return { texto: raw, json, confianca: 0.9, provedor: model };
}

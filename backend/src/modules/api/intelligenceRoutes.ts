import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { parsearTabelao } from '../parser/tabelaoParser.js';
import { extrairTextoPdf } from '../intelligence/pdfExtractor.js';
import { classificarDocumento } from '../intelligence/documentClassifier.js';
import { executarOcr } from '../intelligence/ocrEngine.js';
import { normalizarImagem } from '../intelligence/imageProcessor.js';
import { importarTabelao } from '../importacao/tabelaoImporter.js';
import { importBookPlantas } from '../importacao/bookImporter.js';
import { importUnidades, reprocessarMatchingPlantas } from '../importacao/unidadesImporter.js';

const router = Router();
const uploadDir = path.resolve(process.cwd(), 'public/uploads/intelligence');
const upload = multer({ dest: uploadDir, limits: { fileSize: 50 * 1024 * 1024 } });
const db = new PrismaClient();

router.post('/import/tabelao/intelligence', upload.single('arquivo'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'arquivo é obrigatório' });
  let importacaoId: string | undefined;
  try {
    const ext = path.extname(req.file.originalname).toLowerCase();
    if (ext === '.pdf') {
      const pdf = await extrairTextoPdf(req.file.path);
      return res.status(202).json({
        status: 'EXTRACAO_PDF_DISPONIVEL',
        tipo_documento: classificarDocumento(req.file.originalname, pdf.texto),
        paginas: pdf.paginas,
        mensagem: 'PDF identificado. Para PDF escaneado, renderize as páginas antes do OCR/Vision. Nenhum dado é inferido sem evidência.',
      });
    }

    const parse = await parsearTabelao(req.file.path);
    const importacao = await db.importacao.create({
      data: {
        nomeArquivo: req.file.originalname,
        tipo: 'TABELAO',
        mimeType: req.file.mimetype,
        status: 'PROCESSANDO',
        totalProcessado: parse.linhas.length,
      },
    });
    importacaoId = importacao.id;

    const resultado = await importarTabelao(db, {
      linhas: parse.linhas,
      arquivo: req.file.originalname,
      tipoDocumento: 'TABELAO',
      importacaoId,
    });

    await db.importacao.update({
      where: { id: importacaoId },
      data: {
        status: resultado.erros.length ? 'CONCLUIDO_COM_ERROS' : 'CONCLUIDO',
        totalProcessado: parse.linhas.length,
        totalErros: resultado.erros.length,
        resultado: JSON.stringify(resultado),
      },
    });

    return res.status(201).json({ documento: { nome: req.file.originalname, tipo: classificarDocumento(req.file.originalname) }, parse, importacao: resultado, importacaoId });
  } catch (error) {
    if (importacaoId) await db.importacao.update({ where: { id: importacaoId }, data: { status: 'ERRO', erro: error instanceof Error ? error.message : String(error) } }).catch(() => undefined);
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  } finally {
    await fs.unlink(req.file.path).catch(() => undefined);
  }
});


router.post('/import/book', async (req: Request, res: Response) => {
  try {
    const { projectId, plantas, imagens } = req.body ?? {};
    if (!projectId || !Array.isArray(plantas)) return res.status(400).json({ error: 'projectId e plantas são obrigatórios' });
    const resultado = await importBookPlantas(db, { projectId, plantas, imagens: Array.isArray(imagens) ? imagens : [] });
    return res.status(201).json(resultado);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/import/unidades', async (req: Request, res: Response) => {
  try {
    const { projectId, unidades } = req.body ?? {};
    if (!projectId || !Array.isArray(unidades)) return res.status(400).json({ error: 'projectId e unidades são obrigatórios' });
    const resultado = await importUnidades(db, projectId, unidades);
    return res.status(201).json(resultado);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/projects/:projectId/reprocessar-plantas', async (req: Request, res: Response) => {
  try {
    const resultado = await reprocessarMatchingPlantas(db, req.params.projectId);
    return res.json(resultado);
  } catch (error) {
    return res.status(500).json({ error: error instanceof Error ? error.message : String(error) });
  }
});

router.post('/intelligence/ocr', upload.single('imagem'), async (req: Request, res: Response) => {
  if (!req.file) return res.status(400).json({ error: 'imagem é obrigatória' });
  try {
    const normalized = await normalizarImagem(req.file.path, path.join(uploadDir, 'normalized'));
    const ocr = await executarOcr(normalized.caminho);
    return res.json({ imagem: normalized, ocr });
  } finally {
    await fs.unlink(req.file.path).catch(() => undefined);
  }
});

export default router;

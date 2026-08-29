-- Novalis Intelligence v2.1 — base estrutural.
-- PostgreSQL. NÃO cria ainda a unique composta de Unit: normalize os unitNumber antes.

ALTER TABLE "Unit" ADD COLUMN IF NOT EXISTS "final" INTEGER;
ALTER TABLE "Unit" ADD COLUMN IF NOT EXISTS "plantaId" TEXT;
ALTER TABLE "Unit" ADD COLUMN IF NOT EXISTS "documentPricePerSquareMeter" DOUBLE PRECISION;
ALTER TABLE "Unit" ADD COLUMN IF NOT EXISTS "calculatedPricePerSquareMeter" DOUBLE PRECISION;

CREATE TABLE IF NOT EXISTS "Planta" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "final" INTEGER NOT NULL,
  "areaM2" DOUBLE PRECISION NOT NULL,
  "tipologia" TEXT NOT NULL,
  "andares" INTEGER[] NOT NULL,
  "descricao" TEXT,
  "caracteristicas" TEXT NOT NULL DEFAULT '[]',
  "opcao" TEXT NOT NULL DEFAULT 'padrao',
  "imagemPlanta" TEXT,
  "imagemPerspectiva" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Planta_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Planta_projectId_idx" ON "Planta"("projectId");
CREATE INDEX IF NOT EXISTS "Planta_tipologia_idx" ON "Planta"("tipologia");
CREATE UNIQUE INDEX IF NOT EXISTS "Planta_projectId_final_tipologia_opcao_key" ON "Planta"("projectId", "final", "tipologia", "opcao");
DO $$ BEGIN
  ALTER TABLE "Planta" ADD CONSTRAINT "Planta_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "Importacao" (
  "id" TEXT NOT NULL,
  "projectId" TEXT,
  "nomeArquivo" TEXT NOT NULL,
  "tipo" TEXT NOT NULL,
  "mimeType" TEXT,
  "status" TEXT NOT NULL DEFAULT 'PENDENTE',
  "totalProcessado" INTEGER NOT NULL DEFAULT 0,
  "totalErros" INTEGER NOT NULL DEFAULT 0,
  "resultado" TEXT,
  "erro" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Importacao_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "Importacao_projectId_idx" ON "Importacao"("projectId");
CREATE INDEX IF NOT EXISTS "Importacao_tipo_idx" ON "Importacao"("tipo");
CREATE INDEX IF NOT EXISTS "Importacao_status_idx" ON "Importacao"("status");
DO $$ BEGIN
  ALTER TABLE "Importacao" ADD CONSTRAINT "Importacao_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS "ImportEvidence" (
  "id" TEXT NOT NULL,
  "importacaoId" TEXT,
  "projectId" TEXT,
  "unitId" TEXT,
  "plantaId" TEXT,
  "campo" TEXT NOT NULL,
  "valor" TEXT,
  "pagina" INTEGER,
  "linha" INTEGER,
  "origem" TEXT,
  "confianca" DOUBLE PRECISION,
  "metadata" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ImportEvidence_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "ImportEvidence_importacaoId_idx" ON "ImportEvidence"("importacaoId");
CREATE INDEX IF NOT EXISTS "ImportEvidence_projectId_idx" ON "ImportEvidence"("projectId");
CREATE INDEX IF NOT EXISTS "ImportEvidence_unitId_idx" ON "ImportEvidence"("unitId");
CREATE INDEX IF NOT EXISTS "ImportEvidence_plantaId_idx" ON "ImportEvidence"("plantaId");
CREATE INDEX IF NOT EXISTS "ImportEvidence_campo_idx" ON "ImportEvidence"("campo");
DO $$ BEGIN
  ALTER TABLE "ImportEvidence" ADD CONSTRAINT "ImportEvidence_importacaoId_fkey" FOREIGN KEY ("importacaoId") REFERENCES "Importacao"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ImportEvidence" ADD CONSTRAINT "ImportEvidence_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ImportEvidence" ADD CONSTRAINT "ImportEvidence_unitId_fkey" FOREIGN KEY ("unitId") REFERENCES "Unit"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "ImportEvidence" ADD CONSTRAINT "ImportEvidence_plantaId_fkey" FOREIGN KEY ("plantaId") REFERENCES "Planta"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TABLE "Unit" ADD CONSTRAINT "Unit_plantaId_fkey" FOREIGN KEY ("plantaId") REFERENCES "Planta"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

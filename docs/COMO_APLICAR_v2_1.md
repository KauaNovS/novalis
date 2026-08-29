# COMO APLICAR — NOVALIS INTELLIGENCE v2.1

## 0. Importante

Esta versão corrige a integração da v2 anterior. **Não aplique a migration `20260829_novalis_intelligence` da v2 antiga.** Remova essa pasta antiga antes de adicionar as duas migrations desta versão.

A base do repositório atual é `Developer / Project / Tower / Unit` e PostgreSQL. A v2.1 mantém essa estrutura.

## 1. Backup

Você já possui o backup `NOVALIS_BACKUP_ANTES_V2`. Mantenha-o até concluir os testes.

## 2. Substituição dos arquivos da v2 antiga

Copie os arquivos desta atualização sobre o repositório, mas NÃO copie um `.git`.

Se a pasta abaixo existir da v2 anterior, remova-a:

```text
prisma/migrations/20260829_novalis_intelligence/
```

Depois copie as duas novas migrations:

```text
prisma/migrations/20260829_novalis_intelligence_base/
prisma/migrations/20260829_novalis_intelligence_unique/
```

## 3. Schema

Aplique `prisma/novalis_intelligence_schema.patch.txt` ao `prisma/schema.prisma`.

Atenção: o schema deve continuar com:

```prisma
datasource db {
  provider  = "postgresql"
}
```

Não troque para SQLite.

## 4. Gerar e validar

Na raiz:

```powershell
npx prisma validate
npx prisma generate
```

Se houver erro, NÃO prossiga para migration. Corrija primeiro.

## 5. Migration base

```powershell
npx prisma migrate dev --name novalis_intelligence_base
```

Se a migration SQL já estiver no diretório e o histórico estiver alinhado, use o fluxo de migration normal do seu ambiente em vez de executar SQL manualmente.

## 6. Normalizar unidades

```powershell
node scripts/normalizar_unit_numbers.js --dry-run
```

Revise colisões. Só depois:

```powershell
node scripts/normalizar_unit_numbers.js
```

## 7. Unique da unidade

Agora aplique a migration que cria:

```text
(projectId, towerId, unitNumber)
```

No desenvolvimento, o Prisma pode gerar essa migration a partir do schema final:

```powershell
npx prisma migrate dev --name novalis_unit_identity_unique
```

## 8. Backend

```powershell
cd backend
npm install
npm run db:generate
npm run type-check
npm run build
```

## 9. Fluxo do TABELÃO

```text
TABELÃO
  ↓
classificação
  ↓
parser
  ↓
normalização
  ↓
Developer + Organization
  ↓
Project
  ↓
Tower
  ↓
Unit
  ↓
valor da unidade + área + valor/m²
  ↓
validação
  ↓
ImportEvidence
```

## 10. Valor/m²

Quando `valor da unidade` e `área m²` existem:

```text
valor_m2_calculado = valor_unidade / area_m2
```

O valor/m² informado no documento é preservado separadamente. Divergência não é apagada.

## 11. Vision/OCR

OCR:

```powershell
curl -X POST http://localhost:5000/api/intelligence/ocr -F "imagem=@pagina.png"
```

TABELÃO:

```powershell
curl -X POST http://localhost:5000/api/import/tabelao/intelligence -F "arquivo=@tabelao.xlsx"
```

PDF escaneado ainda exige renderer de páginas antes do OCR/Vision. A API não inventa texto que não foi extraído.

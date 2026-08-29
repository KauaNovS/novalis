# COMO APLICAR — NOVALIS ATUALIZAÇÃO v2

## 1. Backup

Faça backup do repositório e do PostgreSQL antes de aplicar a migration.

## 2. Sobreposição

Copie:

- `backend/src/modules/` → `backend/src/modules/`
- `backend/src/types/market.ts` → `backend/src/types/market.ts`
- `backend/src/index.ts` → `backend/src/index.ts`
- `backend/package.json` → `backend/package.json`
- `scripts/normalizar_unit_numbers.js` → `scripts/normalizar_unit_numbers.js`

Não apague outros módulos do backend.

## 3. Prisma

Aplique `prisma/novalis_intelligence_schema.patch.txt` no `prisma/schema.prisma`.

Depois:

```bash
npx prisma validate
npx prisma generate
```

## 4. Dados existentes

Antes de criar o índice único:

```bash
node scripts/normalizar_unit_numbers.js --dry-run
node scripts/normalizar_unit_numbers.js
```

Depois aplique a migration `prisma/migrations/20260829_novalis_intelligence/migration.sql`.

## 5. Backend

```bash
cd backend
npm install
npm run type-check
npm run build
```

## 6. Teste do TABELÃO

```bash
curl -X POST http://localhost:5000/api/import/tabelao/intelligence \
  -F "arquivo=@tabelao.xlsx"
```

O endpoint devolve parse + importação e calcula `valor_m2` quando há valor da unidade e área.

## 7. OCR

```bash
curl -X POST http://localhost:5000/api/intelligence/ocr \
  -F "imagem=@pagina.png"
```

## 8. Vision

Configure `OPENAI_API_KEY` para habilitar o provider de Vision. Sem chave, o módulo retorna `provedor=indisponivel` e não inventa dados.

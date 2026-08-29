# NOVALIS — ATUALIZAÇÃO v2.1 — 29/08/2026

Atualização corrigida do Intelligence Engine do Novalis.

## Base preservada

A atualização trabalha sobre os modelos persistidos já existentes:

- `Developer` → incorporadora
- `Project` → empreendimento
- `Tower` → torre
- `Unit` → unidade

Não cria uma segunda hierarquia de banco com `Incorporadora`, `Empreendimento` e `Unidade`.

## Núcleo implementado

```text
TABELÃO
  ↓
Document Intelligence
  ↓
Parser
  ↓
Normalização
  ↓
Developer + Organization
  ↓
Project
  ↓
Tower
  ↓
Unit
  ↓
Valor da unidade + área + Valor/m²
  ↓
Validation
  ↓
ImportEvidence
```

Também entram:

- OCR com Tesseract;
- processamento de imagem com Sharp;
- Vision Computing opcional;
- classificação de TABELÃO / BOOK / ESPELHO DE VENDAS / TABELA DE PREÇOS / TABELA DE FINANCIAMENTO;
- importador de BOOK para `Planta`;
- matching Unidade → Planta com score e limiar;
- proveniência por campo;
- normalização do número da unidade;
- separação entre valor/m² informado e valor/m² calculado.

## Correções da v2 anterior

- remove dependência de SQLite no pacote de Intelligence;
- alinha Prisma em 5.22.x;
- corrige `Project.organizationId` obrigatório no importador;
- preenche `Unit.bedrooms` obrigatório;
- remove referência inexistente a `linha.andares`;
- corrige parser numérico brasileiro;
- corrige `pdfparse` para `pdf-parse`;
- adiciona `backend/tsconfig.json`;
- adiciona `cross-env` para desenvolvimento no Windows;
- separa migration estrutural da unique de `Unit` para permitir normalização antes da constraint;
- elimina fallback arbitrário no matching de planta.

## O que não é falsamente declarado como concluído

PDF escaneado ainda precisa de renderização de páginas antes do OCR/Vision. A integração completa de Vision para BOOK permanece uma etapa do Intelligence Engine, e dados sem fonte oficial continuam sem preenchimento automático.

Veja `docs/COMO_APLICAR_v2_1.md` antes de executar migrations.

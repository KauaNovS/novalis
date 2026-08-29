# NOVALIS — Atualização de Inteligência de Ingestão v2

## Objetivo

Esta atualização integra o que já existe no repositório com os documentos enviados, sem substituir o CRM atual. O foco é o núcleo imobiliário:

**TABELÃO → Intelligence Engine → Parser → Normalização → Match Engine → Validation → Banco/API**

A nomenclatura conceitual dos documentos é preservada:
- Incorporadora
- Empreendimento
- Unidade
- Planta
- Valor da unidade
- Valor/m²
- Book
- Espelho de Vendas
- Tabela de Preços
- Tabela de Financiamento

No código atual do repositório, os equivalentes existentes são `Developer`, `Project`, `Unit` e `Tower`. A atualização usa esses modelos existentes e adiciona `Planta`, `Importacao` e `ImportEvidence` para fechar a lacuna de inteligência/proveniência.

## O que entra nesta versão

1. **Document Intelligence**
   - classificação de documento;
   - extração de texto PDF;
   - OCR local com Tesseract;
   - normalização de imagem com Sharp;
   - Vision Computing opcional via `OPENAI_API_KEY`.

2. **TABELÃO**
   - CSV/XLS/XLSX;
   - aliases de cabeçalhos;
   - normalização de área, preço e número de unidade;
   - cálculo automático de valor/m²;
   - identificação de divergência entre valor/m² informado e calculado.

3. **Entity Resolution**
   - evita duplicar incorporadora/empreendimento por nome normalizado;
   - cria somente quando não encontra correspondência.

4. **Unidade**
   - `final` explícito;
   - chave composta `projectId + towerId + unitNumber`;
   - número padronizado com final de 2 dígitos.

5. **Planta / Matching**
   - matching por final + tipologia + andar;
   - final + tipologia;
   - área + tipologia;
   - sem fallback arbitrário: abaixo do limiar fica sem planta.

6. **Proveniência**
   - `Importacao` e `ImportEvidence` registram fonte, página/linha, campo e confiança.

## Escape Brooklin

Os 233 R2V já existentes foram considerados corretos conforme o relatório enviado. As 40 HMP confirmadas entram como dados documentados. As 45 HMP restantes não são inventadas: continuam pendentes de fonte oficial/Espelho de Vendas.

## Aplicação

1. Copie o conteúdo deste pacote sobre a raiz do repositório.
2. Incorpore as adições descritas em `prisma/novalis_intelligence_schema.patch.txt`.
3. Rode `npx prisma migrate dev` em desenvolvimento ou aplique a migration em produção conforme o processo do ambiente.
4. Rode `npx prisma generate`.
5. `cd backend && npm run type-check && npm run build`.

## Dependências

O `backend/package.json` atual do repositório já declara `sharp`, `pdfparse`, `xlsx`, `tesseract.js`, `axios` e `multer`; portanto esta atualização não adiciona uma segunda pilha de dependências.

## Importante

A etapa PDF escaneado → páginas → OCR/Vision depende de renderização das páginas. Esta versão fornece OCR/Vision e o parser estruturado; não mascara a ausência de uma página renderizada. Para PDF escaneado, o próximo passo é conectar um renderer de PDF no pipeline antes do OCR.

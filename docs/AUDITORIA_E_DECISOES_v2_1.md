# Auditoria consolidada — Novalis Intelligence v2.1

## Correções aplicadas

1. **Não existe banco paralelo.** O backend usa o schema Prisma da raiz do Novalis.
2. **PostgreSQL é a base do repositório atual.** A atualização não cria schema SQLite.
3. **Prisma alinhado em 5.22.x** entre raiz e backend.
4. **Project/Tower/Unit permanecem os modelos persistidos.** Não foram criados modelos paralelos `Incorporadora`, `Empreendimento` ou `Unidade`.
5. A nomenclatura funcional continua: **Incorporadora, Empreendimento, TABELÃO, BOOK, Espelho de Vendas, Tabela de Preços, Tabela de Financiamento, Unidade, Planta, Valor da unidade e Valor/m²**.
6. `Developer` representa a incorporadora persistida atual; `Project` representa o empreendimento persistido atual.
7. `Project.organizationId` obrigatório é resolvido durante a importação do TABELÃO.
8. `Unit.bedrooms` obrigatório é preenchido de forma conservadora a partir da tipologia; quando não existe evidência de dormitórios, fica `0`.
9. `Unit.final` passa a ser persistido explicitamente.
10. `Unit.currentPrice` continua sendo o **valor da unidade**; `pricePerSquareMeter` continua sendo o valor/m² operacional; foram adicionados `documentPricePerSquareMeter` e `calculatedPricePerSquareMeter` para preservar origem e cálculo.
11. O matching de planta não usa fallback arbitrário: abaixo de 60 pontos fica sem associação.
12. `Importacao` e `ImportEvidence` registram fonte, linha, campo e confiança.
13. A unique composta de unidade foi separada em migration própria para permitir normalização antes da constraint.
14. O `tabelaoImporter` não usa `linha.andares`, que não existe no contrato `LinhaTabelao`.
15. O importador gera `unitNumber` pela convenção `andar + final com 2 dígitos`.
16. `cross-env` corrige scripts de desenvolvimento no Windows.

## O que continua explicitamente pendente

- Renderização de PDF escaneado em páginas antes do OCR.
- Extração completa de BOOK por Vision Computing.
- Preenchimento de dados sem fonte oficial.
- Integração de um provedor Vision quando `OPENAI_API_KEY` não está configurada.

Nenhum desses itens é inventado como concluído.

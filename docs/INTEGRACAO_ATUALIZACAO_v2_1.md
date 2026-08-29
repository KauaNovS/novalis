# NOVALIS — Integração da Intelligence v2.1

## Objetivo

Fechar a integração do núcleo de ingestão imobiliária sem criar uma arquitetura paralela ao CRM atual.

## Nomenclatura

A nomenclatura funcional continua sendo:

- Incorporadora
- Empreendimento
- Torre
- Unidade
- Planta
- TABELÃO
- BOOK
- ESPELHO DE VENDAS
- TABELA DE PREÇOS
- TABELA DE FINANCIAMENTO
- Valor da unidade
- Valor/m²

No banco atual, os equivalentes persistidos são `Developer`, `Project`, `Tower` e `Unit`.

## Valor da unidade e valor/m²

`Unit.currentPrice` representa o valor da unidade já usado pelo sistema.

A v2.1 acrescenta:

- `documentPricePerSquareMeter`: valor/m² declarado na fonte;
- `calculatedPricePerSquareMeter`: valor/m² calculado pelo Novalis.

Quando existem valor da unidade e área:

`valor_m2_calculado = valor_unidade / area_m2`

Uma divergência com o documento permanece registrada e não é apagada.

## Entity Resolution

O TABELÃO resolve a incorporadora pelo `Developer` existente. Como `Project.organizationId` é obrigatório no schema atual, a mesma entidade também é resolvida/criada em `Organization` com `type = DEVELOPER`.

O empreendimento é resolvido por nome normalizado dentro da incorporadora. Se já existe, recebe atualização dos campos documentados; se não existe, é criado.

## Matching

A associação Unidade → Planta considera:

1. tipologia;
2. final;
3. andar documentado na planta;
4. área aproximada;
5. preferência por opção `padrao`.

Abaixo de 60 pontos, a unidade fica sem planta. Nenhuma associação arbitrária é criada.

## Proveniência

`Importacao` identifica o processamento.

`ImportEvidence` registra:

- campo;
- valor;
- arquivo;
- linha;
- confiança;
- unidade/projeto relacionado;
- metadata de validação.

## Segurança dos dados

O fluxo não completa HMP sem fonte suficiente. O relatório do Escape Brooklin continua válido: as 40 HMP documentadas podem ser importadas; as 45 sem evidência específica permanecem pendentes.

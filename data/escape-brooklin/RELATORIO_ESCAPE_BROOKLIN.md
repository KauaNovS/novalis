# Relatório — Correção de dados do Escape Brooklin

## 1. R2V: nenhuma correção necessária nos dados

Conferi as 233 unidades R2V do `escape_brooklin.csv` linha a linha contra a
Tabela de Financiamento Bancário real (agosto/2026), andar por andar e final
por final. **Batem 100%.**

O número "243 unidades R2V" que aparece no resumo técnico do documento (item
11/13) **não bate** com a tabela granular de preços — a tabela real, que é o
dado que importa pra vender, só lista 233. Esse "243" é texto padrão/
aproximado que a Cyrela reaproveita entre empreendimentos parecidos (o mesmo
tipo de reaproveitamento de texto que já tínhamos visto na regra legal do
HMP, reproduzida idêntica em várias páginas do Book).

**Ação: nenhuma.** Os R2V já importados estão corretos.

## 2. HMP: 40 de 85 unidades têm dado sólido pra importar agora

O Book (`Book_escape_brooklin...pdf`) documenta plantas com área definida
para 4 combinações final+faixa-de-andares:

| Final | Tipologia | Área | Andares | Unidades | Fonte |
|---|---|---|---|---|---|
| 1 | 1 Dorm | 52,10m² | 9,13,17,21,25,29,33 | 7 | Book pág. 41 |
| 4 | Studio | 40,80m² | 5º ao 35º | 31 | Book pág. 30 e 42 |
| 9 | Studio | 43,40m² | 2º | 1 | Book pág. 41 |
| 10 | Studio | 30,90m² | 2º | 1 | Book pág. 42 |

**Total: 40 unidades**, incluídas em `escape_brooklin_hmp_confirmado.csv` e
prontas pra importar pelo script.

## 3. As outras 45 unidades HMP — não dá pra inventar

A regra legal (reproduzida em várias páginas do Book) diz que os finais 6, 7,
8, e mais instâncias de 9 e 10, também são HMP em certos andares — mas **nem
o Book nem a Tabela de Financiamento trazem planta, área ou preço** pra essas
combinações especificamente. Só a declaração textual de que existem.

Além disso, os andares 2º e 3º têm plantas diferentes dos andares padrão (8
unidades no lugar de 10), e a regra genérica de "final X é HMP" parece ter
sido copiada de um texto-modelo que não bate exatamente com a configuração
real desses dois andares — outro sinal de que não dá pra deduzir isso com
segurança só destes documentos.

**Recomendação:** antes de completar essas 45, seria bom conferir:
- A tabela oficial de distribuição: `https://lp.cyrela.com.br/empreendimentos-hmp-cyrela`
- Ou o Espelho de Vendas do empreendimento, se você tiver — ele traria
  unidade por unidade, sem ambiguidade.

## 4. Bug corrigido: colisão de `unitNumber`

`importar_direto.js` gerava `unitNumber` como `${andar}${final}` sem
padding. Isso pode colidir (ex: andar 21 final 1 = "211" e andar 2 final 11 =
"211" também) e o schema não tem `@@unique` nesse campo pra pegar isso.

A convenção real da Cyrela usa final sempre com 2 dígitos (confirmei
cruzando a unidade "1102" da Tabela de Financiamento = andar 11, final 02).
O script `corrigir_unitnumber_e_importar_hmp.js` corrige isso pra todas as
233 unidades já no banco antes de importar as 40 HMP novas.

## 5. Como rodar

```bash
cd novalis   # raiz do repo, onde ficam os outros scripts .js
# copie os dois arquivos deste pacote pra cá:
#   corrigir_unitnumber_e_importar_hmp.js
#   escape_brooklin_hmp_confirmado.csv

# 1) confira antes de gravar:
node corrigir_unitnumber_e_importar_hmp.js --dry-run

# 2) se estiver tudo certo, grave de verdade:
node corrigir_unitnumber_e_importar_hmp.js
```

Recomendo também adicionar, na próxima migration, uma constraint no schema
pra isso nunca mais acontecer:

```prisma
model Unit {
  // ...
  @@unique([projectId, towerId, unitNumber])
}
```

## Resumo

| Item | Status |
|---|---|
| 233 R2V | ✅ Já corretos, nenhuma ação |
| 40 HMP (finais 1, 4, 9, 10) | ✅ Prontas pra importar (script anexo) |
| 45 HMP (finais 6, 7, 8, e demais) | ⚠️ Precisam da tabela oficial ou Espelho de Vendas |
| Bug de `unitNumber` | ✅ Corrigido no script anexo |
| Constraint `@@unique` no schema | 📋 Recomendado, não aplicado (é uma migration, precisa rodar no seu ambiente) |

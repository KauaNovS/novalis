/**
 * Corrige o padrão de unitNumber (evita colisão: floor 21 final 1 = "211"
 * colidindo com floor 2 final 11) e importa as unidades HMP confirmadas
 * com planta/área documentada no Book (40 de 85 unidades HMP).
 *
 * IMPORTANTE — leia antes de rodar:
 *
 * 1) Faltam 45 unidades HMP (finais 6, 7, 8 e parte dos finais 9/10) que
 *    NÃO têm planta nem área documentada no Book nem na Tabela de
 *    Financiamento — só a regra textual de quais andares/finais são HMP,
 *    sem metragem própria. Consulte a tabela oficial de distribuição em
 *    https://lp.cyrela.com.br/empreendimentos-hmp-cyrela ou o Espelho de
 *    Vendas (se você tiver) antes de completar o cadastro dessas 45.
 *
 * 2) As 233 unidades R2V já no banco foram conferidas linha a linha contra
 *    a Tabela de Financiamento Bancário (agosto/2026) e batem 100% — não
 *    precisam de nenhuma correção de dados, só de unitNumber (abaixo).
 *
 * 3) Rode com --dry-run primeiro para conferir antes de gravar:
 *      node corrigir_unitnumber_e_importar_hmp.js --dry-run
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

const PROJECT_ID = 'cmt7n1hbt000111b8eatrz2xs';
const DRY_RUN = process.argv.includes('--dry-run');

function padUnitNumber(floor, final) {
  // Convenção real da Cyrela confirmada na Tabela de Financiamento:
  // unidade "1102" = 11º andar, final 02 (final sempre com 2 dígitos).
  return `${floor}${String(final).padStart(2, '0')}`;
}

async function corrigirUnitNumbers() {
  const torre = await prisma.tower.findFirst({
    where: { projectId: PROJECT_ID, name: 'Torre Única' },
  });
  if (!torre) throw new Error('Torre "Torre Única" não encontrada para este projectId.');

  const unidades = await prisma.unit.findMany({
    where: { projectId: PROJECT_ID, towerId: torre.id },
  });

  console.log(`\n=== Corrigindo unitNumber de ${unidades.length} unidades existentes ===`);

  // Extrai (final) a partir do unitNumber antigo é ambíguo (é exatamente o
  // problema que estamos corrigindo). Por isso usamos floor + o último
  // caractere do unitNumber atual como "final" só quando for de 1 dígito,
  // que é o caso de 100% das unidades já importadas neste projeto (finais
  // 1,2,3,5,6,7,8 e 10 -> mas "10" já tem 2 dígitos!). Para evitar
  // qualquer ambiguidade, cruzamos com o floor conhecido: removemos o
  // prefixo igual ao floor e o que sobra é o final original.
  let corrigidas = 0;
  let semMudanca = 0;
  const colisoes = [];
  const novosNumeros = new Set();

  for (const u of unidades) {
    const prefixo = String(u.floor);
    if (!u.unitNumber.startsWith(prefixo)) {
      console.warn(`⚠️  Unidade ${u.id} (unitNumber=${u.unitNumber}) não começa com o floor ${u.floor} — pulando, revise manualmente.`);
      continue;
    }
    const finalOriginal = u.unitNumber.slice(prefixo.length);
    const novoUnitNumber = padUnitNumber(u.floor, parseInt(finalOriginal, 10));

    if (novoUnitNumber === u.unitNumber) {
      semMudanca += 1;
      continue;
    }

    if (novosNumeros.has(novoUnitNumber)) {
      colisoes.push({ id: u.id, unitNumber: u.unitNumber, novoUnitNumber });
      continue;
    }
    novosNumeros.add(novoUnitNumber);

    console.log(`  ${u.unitNumber} -> ${novoUnitNumber}`);
    if (!DRY_RUN) {
      await prisma.unit.update({ where: { id: u.id }, data: { unitNumber: novoUnitNumber } });
    }
    corrigidas += 1;
  }

  console.log(`\nCorrigidas: ${corrigidas} | Já corretas: ${semMudanca} | Colisões detectadas: ${colisoes.length}`);
  if (colisoes.length) {
    console.log('Colisões (não aplicadas, revise manualmente):', colisoes);
  }
}

async function importarHmpConfirmadas() {
  const csvPath = path.join(__dirname, 'escape_brooklin_hmp_confirmado.csv');
  const linhas = fs.readFileSync(csvPath, 'utf8').trim().split('\n').slice(1);

  const torre = await prisma.tower.findFirst({
    where: { projectId: PROJECT_ID, name: 'Torre Única' },
  });
  if (!torre) throw new Error('Torre "Torre Única" não encontrada para este projectId.');

  const units = linhas.map((linha) => {
    const [andar, final, topologia, tipologia, area, vagas] = linha.split(';');
    const floor = parseInt(andar, 10);
    const finalNum = parseInt(final, 10);
    return {
      projectId: PROJECT_ID,
      towerId: torre.id,
      unitNumber: padUnitNumber(floor, finalNum),
      final: finalNum,
      floor,
      typology: tipologia,
      topology: topologia, // HMP
      bedrooms: tipologia.toLowerCase().includes('studio') ? 0 : 1,
      area: parseFloat(area.replace(',', '.')),
      parkingSpaces: parseInt(vagas, 10) || 0,
      status: 'AVAILABLE',
      currentPrice: null, // sem preço documentado — HMP tem preço tabelado à parte
      pricePerSquareMeter: null,
    };
  });

  console.log(`\n=== Importando ${units.length} unidades HMP confirmadas ===`);
  for (const u of units) console.log(`  ${u.unitNumber} | andar ${u.floor} | ${u.area}m² | ${u.typology}`);

  if (!DRY_RUN) {
    const result = await prisma.unit.createMany({ data: units, skipDuplicates: true });
    console.log(`\n✅ ${result.count} unidades HMP importadas.`);
  } else {
    console.log('\n(dry-run: nada foi gravado)');
  }
}

async function main() {
  if (DRY_RUN) console.log('*** MODO DRY-RUN — nada será gravado no banco ***');
  await corrigirUnitNumbers();
  await importarHmpConfirmadas();
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

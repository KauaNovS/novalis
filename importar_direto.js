const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');

async function main() {
  const projectId = 'cmt7n1hbt000111b8eatrz2xs';

  // 1. Buscar ou criar a torre
  let torre = await prisma.tower.findFirst({
    where: { projectId, name: 'Torre Única' },
  });

  if (!torre) {
    torre = await prisma.tower.create({
      data: {
        projectId,
        name: 'Torre Única',
        floors: 36,
        unitsCount: 0,
      },
    });
  }

  console.log('Torre ID:', torre.id);

  // 2. Ler JSON
  const dados = JSON.parse(fs.readFileSync('unidades_escape_brooklin.json', 'utf8'));

  if (!Array.isArray(dados.units)) {
    console.error('JSON inválido');
    return;
  }

  // 3. Preparar unidades
  const units = dados.units.map((u) => ({
    projectId,
    towerId: torre.id,
    unitNumber: u.unitNumber,
    floor: u.floor,
    typology: u.typology || 'Studio',
    topology: u.topology || 'R2V',
    bedrooms: u.bedrooms ?? 0,
    area: u.area,
    parkingSpaces: u.parkingSpaces || 0,
    status: u.status || 'AVAILABLE',
    currentPrice: u.currentPrice,
    pricePerSquareMeter: u.currentPrice ? u.currentPrice / u.area : null,
  }));

  // 4. Importar
  const result = await prisma.unit.createMany({
    data: units,
  });

  console.log(`✅ ${result.count} unidades importadas com sucesso!`);
}

main()
  .catch((e) => {
    console.error('❌ Erro:', e.message);
  })
  .finally(() => prisma.$disconnect());
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const projectId = 'cmt7n1hbt000111b8eatrz2xs';

  const result = await prisma.unit.updateMany({
    where: {
      projectId,
      area: { lte: 60 },
      typology: null,
    },
    data: {
      typology: 'Studio',
      bedrooms: 0,
    },
  });

  console.log(`✅ ${result.count} unidades corrigidas para Studio.`);
}

main().finally(() => prisma.$disconnect());
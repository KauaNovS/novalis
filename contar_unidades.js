const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const total = await prisma.unit.count({
    where: { projectId: 'cmt7n1hbt000111b8eatrz2xs' },
  });
  console.log('Total de unidades:', total);

  const porTopologia = await prisma.unit.groupBy({
    by: ['topology'],
    where: { projectId: 'cmt7n1hbt000111b8eatrz2xs' },
    _count: true,
  });
  console.log(porTopologia);
}

main().finally(() => prisma.$disconnect());
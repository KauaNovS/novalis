const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Iniciando limpeza de projetos e unidades...');

  await prisma.unitOfInterest.deleteMany({});
  await prisma.priceHistory.deleteMany({});
  await prisma.statusHistory.deleteMany({});
  await prisma.propertyVisit.deleteMany({});
  await prisma.deal.deleteMany({});
  await prisma.unit.deleteMany({});
  await prisma.tower.deleteMany({});
  await prisma.projectImage.deleteMany({});
  await prisma.document.deleteMany({});
  await prisma.project.deleteMany({});

  console.log('✅ Projetos, torres e unidades removidos com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro ao limpar:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
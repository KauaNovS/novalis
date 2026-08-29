const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const projectId = 'cmt7n1hbt000111b8eatrz2xs';

  // Excluir unidades do projeto
  const deleted = await prisma.unit.deleteMany({
    where: { projectId },
  });

  console.log(`✅ ${deleted.count} unidades removidas.`);

  // Excluir torres do projeto (opcional, se quiser recriar)
  const towers = await prisma.tower.deleteMany({
    where: { projectId },
  });

  console.log(`✅ ${towers.count} torres removidas.`);
}

main().finally(() => prisma.$disconnect());
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const projetos = await prisma.project.findMany({
    select: { id: true, name: true, city: true, developerId: true, builderId: true }
  });
  console.log(JSON.stringify(projetos, null, 2));
}

main().finally(() => prisma.$disconnect());
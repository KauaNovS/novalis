const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'admin@demo.com';
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    console.log('Usuário admin não encontrado. Execute o seed primeiro.');
    return;
  }
  await prisma.user.update({
    where: { email },
    data: { role: 'MASTER' },
  });
  console.log('Papel do admin atualizado para MASTER');
}

main().catch(console.error).finally(() => prisma.$disconnect());
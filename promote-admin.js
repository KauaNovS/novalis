const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'SEU_EMAIL_AQUI'; // troque pelo seu email cadastrado
  await prisma.user.update({
    where: { email },
    data: { role: 'MASTER' },
  });
  console.log(`Usuário ${email} agora é MASTER`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
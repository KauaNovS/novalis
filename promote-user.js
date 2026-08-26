const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const email = 'EMAIL_DA_CONTA'; // <-- troque pelo email da conta que deseja promover
  await prisma.user.update({
    where: { email },
    data: { role: 'MASTER' },
  });
  console.log(`Usuário ${email} agora é MASTER`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
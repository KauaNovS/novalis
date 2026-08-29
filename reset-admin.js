const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  const password = await bcrypt.hash('admin123', 10);
  await prisma.user.update({
    where: { email: 'admin@demo.com' },
    data: { password },
  });
  console.log('Senha do admin redefinida para admin123');
}

main()
  .catch((e) => console.error(e))
  .finally(() => prisma.$disconnect());
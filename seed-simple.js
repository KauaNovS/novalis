const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Criando apenas admin e organização...');

  const org = await prisma.organization.upsert({
    where: { id: 'demo-org' },
    update: {},
    create: {
      id: 'demo-org',
      name: 'Imobiliária Demo LTDA',
      email: 'contato@demo.com',
      phone: '(11) 99999-9999',
    },
  });

  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@demo.com' },
    update: {},
    create: {
      email: 'admin@demo.com',
      password: adminPassword,
      name: 'Administrador',
      role: 'MASTER',
      organizationId: org.id,
    },
  });

  console.log('✅ Admin criado/atualizado com sucesso!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed...');

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
  const admin = await prisma.user.upsert({
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

  await prisma.gamificationProfile.upsert({
    where: { userId: admin.id },
    update: {},
    create: { userId: admin.id },
  });

  const brokerPassword = await bcrypt.hash('broker123', 10);
  const broker = await prisma.user.upsert({
    where: { email: 'broker@demo.com' },
    update: {},
    create: {
      email: 'broker@demo.com',
      password: brokerPassword,
      name: 'Corretor Demo',
      role: 'MEMBER',
      organizationId: org.id,
    },
  });

  await prisma.gamificationProfile.upsert({
    where: { userId: broker.id },
    update: {},
    create: { userId: broker.id },
  });

  const project1 = await prisma.project.upsert({
    where: { slug: 'cyrela-pinheiros' },
    update: {},
    create: {
      name: 'Cyrela Pinheiros',
      slug: 'cyrela-pinheiros',
      description: 'Empreendimento residencial de alto padrão em Pinheiros',
      status: 'ACTIVE',
      organizationId: org.id,
      neighborhood: 'Pinheiros',
      city: 'São Paulo',
      state: 'SP',
      deliveryDate: new Date('2026-12-01'),
      totalUnits: 40,
      totalTowers: 1,
    },
  });

  const tower1 = await prisma.tower.upsert({
    where: { id: 'tower-cyrela' },
    update: {},
    create: {
      id: 'tower-cyrela',
      projectId: project1.id,
      name: 'Torre A',
      floors: 20,
      unitsCount: 40,
    },
  });

  for (let floor = 1; floor <= 5; floor++) {
    for (let unit = 1; unit <= 4; unit++) {
      const unitNumber = `${floor}0${unit}`;
      const area = 65 + unit * 5;
      const price = 750000 + floor * 10000 + unit * 30000;
      const status = floor > 3 ? 'SOLD' : floor > 2 ? 'RESERVED' : 'AVAILABLE';
      await prisma.unit.upsert({
        where: { id: `unit-${project1.slug}-${unitNumber}` },
        update: {},
        create: {
          id: `unit-${project1.slug}-${unitNumber}`,
          projectId: project1.id,
          towerId: tower1.id,
          unitNumber,
          floor,
          typology: '2 Dormitórios',
          bedrooms: 2,
          area,
          parkingSpaces: 1,
          status,
          currentPrice: price,
          pricePerSquareMeter: price / area,
        },
      });
    }
  }

  const project2 = await prisma.project.upsert({
    where: { slug: 'tegra-vila-madalena' },
    update: {},
    create: {
      name: 'Tegra Vila Madalena',
      slug: 'tegra-vila-madalena',
      description: 'Empreendimento moderno na Vila Madalena',
      status: 'ACTIVE',
      organizationId: org.id,
      neighborhood: 'Vila Madalena',
      city: 'São Paulo',
      state: 'SP',
      deliveryDate: new Date('2025-06-01'),
      totalUnits: 30,
      totalTowers: 1,
    },
  });

  const tower2 = await prisma.tower.upsert({
    where: { id: 'tower-tegra' },
    update: {},
    create: {
      id: 'tower-tegra',
      projectId: project2.id,
      name: 'Torre Única',
      floors: 15,
      unitsCount: 30,
    },
  });

  for (let floor = 1; floor <= 3; floor++) {
    for (let unit = 1; unit <= 5; unit++) {
      const unitNumber = `${floor}0${unit}`;
      const area = 45 + unit * 3;
      const price = 550000 + floor * 8000 + unit * 20000;
      const status = floor > 2 ? 'BLOCKED' : 'AVAILABLE';
      await prisma.unit.upsert({
        where: { id: `unit-${project2.slug}-${unitNumber}` },
        update: {},
        create: {
          id: `unit-${project2.slug}-${unitNumber}`,
          projectId: project2.id,
          towerId: tower2.id,
          unitNumber,
          floor,
          typology: '1 Dormitório',
          bedrooms: 1,
          area,
          parkingSpaces: 1,
          status,
          currentPrice: price,
          pricePerSquareMeter: price / area,
        },
      });
    }
  }

  // Cliente corrigido: usa id fixo e assignedTo com broker.id
  const client = await prisma.client.upsert({
    where: { id: 'cliente-demo' },
    update: {},
    create: {
      id: 'cliente-demo',
      name: 'Cliente Demo',
      email: 'cliente@demo.com',
      phone: '(11) 98888-7777',
      notes: 'Cliente interessado em apartamentos na região de Pinheiros',
      assignedTo: broker.id,
    },
  });

  console.log('✅ Seed concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
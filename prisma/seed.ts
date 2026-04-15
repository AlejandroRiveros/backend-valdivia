import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with users and secure passwords...');

  const defaultPassword = await bcrypt.hash('1234', 10);

  // 1. Create ADMIN User
  await prisma.user.upsert({
    where: { email: 'admin.test@test.com' },
    update: {},
    create: {
      name: 'Super Administrador',
      email: 'admin.test@test.com',
      password: defaultPassword,
      role: 'ADMIN',
      avatar: 'AD'
    }
  });

  // 2. Create Analyst
  const analyst1 = await prisma.user.upsert({
    where: { email: 'ana.gonzalez@valdivia.gov.co' },
    update: {},
    create: {
      name: 'Ana María Gonzalez',
      email: 'ana.gonzalez@valdivia.gov.co',
      password: defaultPassword,
      role: 'ANALYST',
      activeProcesses: 2,
      avatar: 'AG'
    }
  });

  // 3. Create Director
  const director1 = await prisma.user.upsert({
    where: { email: 'directortest@test.com' },
    update: {},
    create: {
      name: 'Director Prueba',
      email: 'directortest@test.com',
      password: defaultPassword,
      role: 'DIRECTOR',
      activeProcesses: 0,
      avatar: 'DP'
    }
  });

  // 4. Create Operators (Contractors)
  const contractor1 = await prisma.contractor.create({
    data: { name: 'Aseo Capital S.A. ESP' }
  });

  const contractor2 = await prisma.contractor.create({
    data: { name: 'Recuperadora del Norte' }
  });

  // 5. Create Deliverables
  await prisma.deliverable.create({
    data: {
      contractId: 'CT-2023-001',
      type: 'Informe Mensual de Aprovechamiento',
      month: 'Septiembre 2023',
      submissionDate: new Date('2023-10-05'),
      docStatus: 'valid',
      balanceStatus: 'consistent',
      status: 'pending',
      amount: 15400000,
      contractorId: contractor1.id
    }
  });

  await prisma.deliverable.create({
    data: {
      contractId: 'CT-2023-002',
      type: 'Certificación de Disposición Final',
      month: 'Septiembre 2023',
      submissionDate: new Date('2023-10-06'),
      docStatus: 'warning',
      balanceStatus: 'consistent',
      status: 'pending',
      amount: 8200000,
      contractorId: contractor2.id
    }
  });

  console.log('✅ Seed with passwords completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

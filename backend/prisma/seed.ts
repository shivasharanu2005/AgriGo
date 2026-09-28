import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');
  
  const passwordHash = await bcrypt.hash('password123', 10);

  const farmer1 = await prisma.user.upsert({
    where: { email: 'ramesh.farmer@agrivision.in' },
    update: {},
    create: {
      name: 'Ramesh Gowda',
      email: 'ramesh.farmer@agrivision.in',
      phone: '9845123456',
      passwordHash,
      role: 'FARMER',
      language: 'kn',
      farmerProfile: {
        create: {
          state: 'Karnataka',
          district: 'Kolar',
          taluk: 'Srinivaspur',
          village: 'Rayalpadu',
          totalAcreage: 4.5,
          preferredLanguage: 'kn'
        }
      }
    }
  });

  const admin1 = await prisma.user.upsert({
    where: { email: 'admin@agrivision.in' },
    update: {},
    create: {
      name: 'Dr. K. Swaminathan',
      email: 'admin@agrivision.in',
      phone: '9900088776',
      passwordHash,
      role: 'ADMIN',
      language: 'en'
    }
  });

  console.log({ farmer1, admin1 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

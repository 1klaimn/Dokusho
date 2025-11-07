import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...');
  
  await prisma.source.upsert({
    where: { name: 'MangaDex' },
    update: {},
    create: {
      name: 'MangaDex',
      url: 'https://mangadex.org',
      icon: 'https://mangadex.org/favicon.ico',
    },
  });

  await prisma.source.upsert({
    where: { name: 'TCB Scans' },
    update: {},
    create: {
      name: 'TCB Scans',
      url: 'https://tcbscansonepiece.com',
      icon: 'https://tcbscansonepiece.com/favicon.ico',
    },
  });

  await prisma.source.upsert({
    where: { name: 'ComiXology' },
    update: {},
    create: {
      name: 'ComiXology',
      url: 'https://www.amazon.com/comixology',
      icon: 'https://images-na.ssl-images-amazon.com/images/G/01/kindle/merch/meta/comixology-favicon._CB459093848_.png',
    },
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
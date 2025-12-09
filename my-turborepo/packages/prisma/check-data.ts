import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Checking Guru Data ===');
  const gurus = await prisma.guru.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
    take: 5,
  });
  
  console.log(`Total Guru: ${gurus.length}`);
  gurus.forEach(g => {
    console.log(`- ${g.name} (${g.email}) - User: ${g.userId ? '✓' : '✗'}`);
  });

  console.log('\n=== Checking User Data ===');
  const users = await prisma.user.findMany({
    where: { role: 'GURU' },
    orderBy: { createdAt: 'desc' },
  });
  
  console.log(`Total User GURU: ${users.length}`);
  users.forEach(u => {
    console.log(`- ${u.name} (${u.email})`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

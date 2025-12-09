import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Testing Auto-Create User Feature ===\n');

  // Test 1: Create a test guru
  console.log('Test 1: Creating test guru...');
  const testGuru = await prisma.guru.create({
    data: {
      nip: 'TEST123456',
      name: 'Test Guru',
      email: 'testguru@test.com',
      phone: '081234567890',
    },
  });
  console.log('✓ Guru created:', testGuru.name);
  console.log('  - Has userId?', testGuru.userId ? '✓ YES' : '✗ NO');

  if (testGuru.userId) {
    const user = await prisma.user.findUnique({
      where: { id: testGuru.userId },
    });
    console.log('  - User found?', user ? '✓ YES' : '✗ NO');
    if (user) {
      console.log('  - User email:', user.email);
      console.log('  - User role:', user.role);
    }
  }

  // Test 2: Create a test siswa
  console.log('\nTest 2: Creating test siswa...');
  const testSiswa = await prisma.siswa.create({
    data: {
      nis: 'TEST789',
      nisn: 'TEST789012345',
      name: 'Test Siswa',
      gender: 'LAKI_LAKI',
      birthDate: new Date('2005-01-01'),
    },
  });
  console.log('✓ Siswa created:', testSiswa.name);
  console.log('  - Has userId?', testSiswa.userId ? '✓ YES' : '✗ NO');

  if (testSiswa.userId) {
    const user = await prisma.user.findUnique({
      where: { id: testSiswa.userId },
    });
    console.log('  - User found?', user ? '✓ YES' : '✗ NO');
    if (user) {
      console.log('  - User email:', user.email);
      console.log('  - User role:', user.role);
    }
  }

  // Cleanup
  console.log('\n=== Cleaning up test data ===');
  if (testGuru.userId) {
    await prisma.user.delete({ where: { id: testGuru.userId } });
    console.log('✓ Test guru user deleted');
  }
  await prisma.guru.delete({ where: { id: testGuru.id } });
  console.log('✓ Test guru deleted');

  if (testSiswa.userId) {
    await prisma.user.delete({ where: { id: testSiswa.userId } });
    console.log('✓ Test siswa user deleted');
  }
  await prisma.siswa.delete({ where: { id: testSiswa.id } });
  console.log('✓ Test siswa deleted');

  console.log('\n=== Test Complete! ===\n');
}

main()
  .catch((error) => {
    console.error('Error:', error.message);
    console.error('\n⚠️  Auto-create user is NOT working in database operations!');
    console.error('The feature only works through the API endpoints.');
  })
  .finally(() => prisma.$disconnect());

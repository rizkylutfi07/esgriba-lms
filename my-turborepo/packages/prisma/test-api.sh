#!/bin/bash

echo "=== Testing Auto-Create User via API ==="
echo ""

# Get auth token first (you need to have an admin user)
echo "1. Testing Guru API..."
curl -X POST http://localhost:4000/guru \
  -H "Content-Type: application/json" \
  -d '{
    "nip": "APITEST001",
    "name": "Test Guru via API",
    "email": "testguruapi@test.com",
    "phone": "081234567890"
  }' | jq '.'

echo ""
echo "2. Check if user was created..."
cd /home/rizky/esgriba-lms/my-turborepo/packages/prisma
npx tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function check() {
  const guru = await prisma.guru.findFirst({
    where: { nip: 'APITEST001' },
    include: { user: true }
  });
  
  console.log('Guru found:', guru?.name);
  console.log('Has userId?', guru?.userId ? '✓ YES' : '✗ NO');
  if (guru?.user) {
    console.log('User email:', guru.user.email);
    console.log('User role:', guru.user.role);
  }
  
  // Cleanup
  if (guru) {
    if (guru.userId) {
      await prisma.user.delete({ where: { id: guru.userId } });
    }
    await prisma.guru.delete({ where: { id: guru.id } });
    console.log('\\n✓ Cleaned up test data');
  }
  
  await prisma.\$disconnect();
}

check();
"

echo ""
echo "=== Test Complete ==="

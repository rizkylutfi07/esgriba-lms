import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('\n=== Fixing Guru Users ===');
  
  const gurusWithoutUser = await prisma.guru.findMany({
    where: { userId: null },
  });
  
  console.log(`Found ${gurusWithoutUser.length} guru(s) without user accounts`);
  
  for (const guru of gurusWithoutUser) {
    try {
      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { email: guru.email },
      });
      
      if (!user) {
        // Create user with NIP as password
        const hashedPassword = await bcrypt.hash(guru.nip, 10);
        user = await prisma.user.create({
          data: {
            email: guru.email,
            name: guru.name,
            passwordHash: hashedPassword,
            role: 'GURU',
          },
        });
        console.log(`✓ Created user for: ${guru.name}`);
      } else {
        console.log(`✓ User already exists for: ${guru.name}`);
      }
      
      // Link guru to user
      await prisma.guru.update({
        where: { id: guru.id },
        data: { userId: user.id },
      });
      console.log(`  → Linked guru to user`);
      
    } catch (error) {
      console.error(`✗ Error for ${guru.name}:`, error.message);
    }
  }
  
  console.log('\n=== Done! ===');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

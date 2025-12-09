import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@esgriba.com' },
    update: {},
    create: {
      name: 'Administrator',
      email: 'admin@esgriba.com',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log('✅ Created admin user:', admin.email);

  // Create jurusan
  const ipa = await prisma.jurusan.upsert({
    where: { code: 'IPA' },
    update: {},
    create: {
      name: 'Ilmu Pengetahuan Alam',
      code: 'IPA',
    },
  });

  const ips = await prisma.jurusan.upsert({
    where: { code: 'IPS' },
    update: {},
    create: {
      name: 'Ilmu Pengetahuan Sosial',
      code: 'IPS',
    },
  });
  console.log('✅ Created jurusan');

  // Create guru with user
  const guruPassword = await bcrypt.hash('guru123', 10);
  
  const guruUser1 = await prisma.user.upsert({
    where: { email: 'budi@esgriba.com' },
    update: {},
    create: {
      name: 'Budi Santoso',
      email: 'budi@esgriba.com',
      passwordHash: guruPassword,
      role: 'GURU',
    },
  });

  const guruUser2 = await prisma.user.upsert({
    where: { email: 'siti@esgriba.com' },
    update: {},
    create: {
      name: 'Siti Nurhaliza',
      email: 'siti@esgriba.com',
      passwordHash: guruPassword,
      role: 'GURU',
    },
  });

  const guru1 = await prisma.guru.upsert({
    where: { nip: '199001012015011001' },
    update: { userId: guruUser1.id },
    create: {
      nip: '199001012015011001',
      name: 'Budi Santoso',
      email: 'budi@esgriba.com',
      phone: '08123456789',
      userId: guruUser1.id,
    },
  });

  const guru2 = await prisma.guru.upsert({
    where: { nip: '199002022015012002' },
    update: { userId: guruUser2.id },
    create: {
      nip: '199002022015012002',
      name: 'Siti Nurhaliza',
      email: 'siti@esgriba.com',
      phone: '08234567890',
      userId: guruUser2.id,
    },
  });
  console.log('✅ Created guru with user accounts');

  // Create kelas
  const kelas10IPA = await prisma.kelas.create({
    data: {
      name: 'X IPA 1',
      level: 'X',
      majorId: ipa.id,
      homeroomTeacherId: guru1.id,
    },
  });

  const kelas11IPS = await prisma.kelas.create({
    data: {
      name: 'XI IPS 1',
      level: 'XI',
      majorId: ips.id,
      homeroomTeacherId: guru2.id,
    },
  });
  console.log('✅ Created kelas');

  // Create siswa with user
  const siswaPassword = await bcrypt.hash('siswa123', 10);
  
  const siswaUser1 = await prisma.user.upsert({
    where: { email: '2024001@siswa.esgriba.com' },
    update: {},
    create: {
      name: 'Ahmad Rizki',
      email: '2024001@siswa.esgriba.com',
      passwordHash: siswaPassword,
      role: 'SISWA',
    },
  });

  const siswaUser2 = await prisma.user.upsert({
    where: { email: '2024002@siswa.esgriba.com' },
    update: {},
    create: {
      name: 'Dewi Putri',
      email: '2024002@siswa.esgriba.com',
      passwordHash: siswaPassword,
      role: 'SISWA',
    },
  });

  const siswa1 = await prisma.siswa.upsert({
    where: { nis: '2024001' },
    update: { userId: siswaUser1.id },
    create: {
      nis: '2024001',
      nisn: '0012345678',
      name: 'Ahmad Rizki',
      gender: 'LAKI_LAKI',
      birthDate: new Date('2008-05-15'),
      address: 'Jl. Merdeka No. 10',
      classId: kelas10IPA.id,
      userId: siswaUser1.id,
    },
  });

  const siswa2 = await prisma.siswa.upsert({
    where: { nis: '2024002' },
    update: { userId: siswaUser2.id },
    create: {
      nis: '2024002',
      nisn: '0012345679',
      name: 'Dewi Putri',
      gender: 'PEREMPUAN',
      birthDate: new Date('2007-08-20'),
      address: 'Jl. Sudirman No. 20',
      classId: kelas11IPS.id,
      userId: siswaUser2.id,
    },
  });
  console.log('✅ Created siswa with user accounts');

  // Create mapel
  const matematika = await prisma.mapel.create({
    data: {
      name: 'Matematika',
      code: 'MTK',
      teacherId: guru1.id,
    },
  });

  const bahasaIndonesia = await prisma.mapel.create({
    data: {
      name: 'Bahasa Indonesia',
      code: 'BIND',
      teacherId: guru2.id,
    },
  });
  console.log('✅ Created mapel');

  // Create tahun ajaran
  await prisma.tahunAjaran.create({
    data: {
      yearStart: 2024,
      yearEnd: 2025,
      semester: 'GANJIL',
      isActive: true,
    },
  });
  console.log('✅ Created tahun ajaran');

  // Create jadwal
  await prisma.jadwal.create({
    data: {
      classId: kelas10IPA.id,
      subjectId: matematika.id,
      teacherId: guru1.id,
      dayOfWeek: 'SENIN',
      startTime: '07:00',
      endTime: '08:30',
    },
  });

  await prisma.jadwal.create({
    data: {
      classId: kelas11IPS.id,
      subjectId: bahasaIndonesia.id,
      teacherId: guru2.id,
      dayOfWeek: 'SELASA',
      startTime: '08:30',
      endTime: '10:00',
    },
  });
  console.log('✅ Created jadwal');

  console.log('🎉 Seeding completed!');
  console.log('\n📝 Default credentials:');
  console.log('Admin: admin@esgriba.com / admin123');
  console.log('Guru: budi@esgriba.com / guru123');
  console.log('Siswa: 2024001@siswa.esgriba.com / siswa123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

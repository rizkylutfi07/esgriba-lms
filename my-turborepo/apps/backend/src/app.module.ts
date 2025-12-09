import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { SiswaModule } from './siswa/siswa.module';
import { GuruModule } from './guru/guru.module';
import { KelasModule } from './kelas/kelas.module';
import { JurusanModule } from './jurusan/jurusan.module';
import { MapelModule } from './mapel/mapel.module';
import { JadwalModule } from './jadwal/jadwal.module';
import { TahunAjaranModule } from './tahun-ajaran/tahun-ajaran.module';
import { MateriModule } from './materi/materi.module';
import { TugasModule } from './tugas/tugas.module';
import { PengumpulanTugasModule } from './pengumpulan-tugas/pengumpulan-tugas.module';
import { AbsensiModule } from './absensi/absensi.module';
import { NilaiModule } from './nilai/nilai.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    SiswaModule,
    GuruModule,
    KelasModule,
    JurusanModule,
    MapelModule,
    JadwalModule,
    TahunAjaranModule,
    MateriModule,
    TugasModule,
    PengumpulanTugasModule,
    AbsensiModule,
    NilaiModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

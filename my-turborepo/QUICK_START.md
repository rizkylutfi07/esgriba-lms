# 🚀 Quick Start Guide - Esgriba LMS

## Setup Cepat (5 Menit)

### 1. Install Dependencies
```bash
cd my-turborepo
pnpm install
```

### 2. Start Database
```bash
# Dari root project (esgriba-lms)
docker compose up -d
```

### 3. Setup Database
```bash
cd my-turborepo
pnpm db:setup
```

Ini akan:
- Generate Prisma Client
- Jalankan migrations
- Seed data (admin, guru, siswa demo)

### 4. Start Applications

**Terminal 1 - Backend:**
```bash
cd my-turborepo/apps/backend
pnpm dev
```
Backend akan jalan di: http://localhost:4000

**Terminal 2 - Frontend:**
```bash
cd my-turborepo/apps/frontend
pnpm dev
```
Frontend akan jalan di: http://localhost:3000

### 5. Login

Buka browser: http://localhost:3000

Login dengan salah satu akun:
- **Admin:** admin@esgriba.com / admin123
- **Guru:** budi@esgriba.com / guru123  
- **Siswa:** 2024001@siswa.esgriba.com / siswa123

## ✅ Checklist

- [ ] PostgreSQL running (docker-compose up -d)
- [ ] Dependencies installed (pnpm install)
- [ ] Database setup (pnpm db:setup)
- [ ] Backend running di port 4000
- [ ] Frontend running di port 3000
- [ ] Bisa login dengan akun demo

## 🔧 Troubleshooting

### Error: Port 5432 already in use
PostgreSQL sudah jalan di sistem Anda. Matikan dulu atau ubah port di docker-compose.yml

### Error: Cannot find module '@repo/prisma'
Jalankan: `cd packages/prisma && pnpm db:generate`

### Error: Database connection failed
Pastikan PostgreSQL sudah running: `docker compose ps`

### Frontend tidak bisa connect ke backend
Pastikan backend sudah running di http://localhost:4000

## 📚 Dokumentasi Lengkap

Lihat `README_SETUP.md` untuk dokumentasi lengkap.

## 🎯 Next Steps

1. Explore dashboard masing-masing role
2. Coba fitur CRUD (Users, Siswa, Guru, dll)
3. Lihat API di http://localhost:4000
4. Explore Prisma Studio: `cd packages/prisma && pnpm db:studio`

---

**Selamat mencoba! 🎉**

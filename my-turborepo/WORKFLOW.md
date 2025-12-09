# 🔄 Workflow Development - Tim Esgriba LMS

Panduan workflow untuk kolaborasi development dengan 2 developer atau lebih.

---

## 📋 Table of Contents

- [Setup Awal](#setup-awal)
- [Workflow Developer 1 (Membuat Perubahan)](#workflow-developer-1-membuat-perubahan)
- [Workflow Developer 2 (Pull Perubahan)](#workflow-developer-2-pull-perubahan)
- [Workflow Database Migration](#workflow-database-migration)
- [Common Issues & Solutions](#common-issues--solutions)
- [Best Practices](#best-practices)

---

## 🚀 Setup Awal

### Pertama Kali Clone Project

```bash
# 1. Clone repository
git clone https://github.com/rizkylutfi07/lms-esgriba.git
cd lms-esgriba/my-turborepo

# 2. Install dependencies
pnpm install

# 3. Setup Docker database
cd ..
docker compose up -d

# 4. Setup environment variables
cd my-turborepo
cp packages/prisma/.env.example packages/prisma/.env
cp apps/backend/.env.example apps/backend/.env

# Edit .env files jika perlu (default sudah OK untuk development lokal)

# 5. Jalankan database migration
cd packages/prisma
pnpm prisma migrate deploy
pnpm prisma generate

# 6. (Opsional) Seed database dengan data awal
pnpm prisma db seed

# 7. Jalankan aplikasi
cd ../..
pnpm dev
```

**Akses aplikasi:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Prisma Studio: `cd packages/prisma && pnpm prisma studio`

---

## 👨‍💻 Workflow Developer 1 (Membuat Perubahan)

### 1. Sebelum Mulai Coding

```bash
# Pull perubahan terbaru dari remote
git pull origin main

# Buat branch baru untuk feature/fix
git checkout -b feature/nama-feature
# atau
git checkout -b fix/nama-bug
```

### 2. Develop Feature

```bash
# Jalankan development mode
cd my-turborepo
pnpm dev

# Backend: http://localhost:4000
# Frontend: http://localhost:3000
```

### 3. Jika Ada Perubahan Database Schema

```bash
# Edit schema.prisma
cd packages/prisma
nano schema.prisma  # atau gunakan editor favorit

# Buat migration
pnpm prisma migrate dev --name deskripsi_perubahan

# Contoh:
pnpm prisma migrate dev --name add_user_avatar
pnpm prisma migrate dev --name update_guru_fields
```

### 4. Testing

```bash
# Test fitur yang dibuat
# Pastikan tidak ada error di terminal backend/frontend

# Cek error TypeScript
cd apps/backend
pnpm run build

cd ../frontend
pnpm run build
```

### 5. Commit & Push

```bash
# Add semua perubahan
git add .

# Commit dengan message yang jelas
git commit -m "feat: tambah fitur export excel guru"
# atau
git commit -m "fix: perbaiki auto-create user untuk siswa"
# atau
git commit -m "docs: update workflow documentation"

# Push ke remote
git push origin feature/nama-feature

# Buat Pull Request di GitHub
```

### 6. Merge ke Main

Setelah review dan approval:
```bash
# Merge via GitHub UI
# atau via CLI:
git checkout main
git merge feature/nama-feature
git push origin main
```

---

## 👨‍💻 Workflow Developer 2 (Pull Perubahan)

### 1. Pull Perubahan Terbaru

```bash
# Pastikan di branch main
git checkout main

# Pull perubahan dari remote
git pull origin main
```

### 2. ⚠️ PENTING: Cek Apakah Ada Migration Baru

```bash
# Cek folder migrations
cd my-turborepo/packages/prisma
ls -la migrations/

# Jika ada folder migration baru, WAJIB jalankan:
```

### 3. Update Dependencies & Database

```bash
# 1. Update dependencies (jika ada perubahan package.json)
cd my-turborepo
pnpm install

# 2. WAJIB: Apply database migrations
cd packages/prisma
pnpm prisma migrate deploy

# 3. Generate Prisma Client baru
pnpm prisma generate

# 4. Cek status migrasi
pnpm prisma migrate status
```

### 4. Restart Aplikasi

```bash
# Stop aplikasi yang sedang berjalan (Ctrl+C)

# Restart
cd my-turborepo
pnpm dev
```

### 5. Verifikasi

- Buka http://localhost:3000
- Test fitur yang baru ditambahkan
- Cek console untuk error

---

## 🗄️ Workflow Database Migration

### Membuat Migration Baru (Developer 1)

```bash
cd packages/prisma

# 1. Edit schema.prisma
nano schema.prisma

# 2. Buat migration
pnpm prisma migrate dev --name nama_migration

# Migration file akan dibuat di: migrations/[timestamp]_nama_migration/
```

### Apply Migration (Developer 2)

```bash
cd packages/prisma

# Development: Auto-apply dan regenerate client
pnpm prisma migrate dev

# Production/Deployment: Apply saja tanpa prompt
pnpm prisma migrate deploy
```

### Cek Status Migration

```bash
cd packages/prisma

# Lihat status migrations
pnpm prisma migrate status

# Output:
# ✓ All migrations applied
# atau
# ⚠ Pending migrations: [list migrations]
```

### Reset Database (Hati-hati!)

```bash
cd packages/prisma

# PERINGATAN: Ini akan hapus semua data!
pnpm prisma migrate reset

# Akan:
# 1. Drop database
# 2. Create database baru
# 3. Apply semua migrations
# 4. Run seed (jika ada)
```

---

## 🚨 Common Issues & Solutions

### Issue 1: Port Already in Use

**Error:** `EADDRINUSE: address already in use :::3000`

**Solusi:**
```bash
# Kill process di port 3000
lsof -ti:3000 | xargs kill -9

# Atau untuk port 4000 (backend)
lsof -ti:4000 | xargs kill -9

# Restart aplikasi
pnpm dev
```

### Issue 2: Database Connection Error

**Error:** `Can't reach database server`

**Solusi:**
```bash
# 1. Cek Docker container
docker ps

# 2. Jika tidak ada postgres container, start:
cd /home/rizky/esgriba-lms
docker compose up -d

# 3. Cek koneksi
cd my-turborepo/packages/prisma
pnpm prisma db pull
```

### Issue 3: Migration Out of Sync

**Error:** `Migration ... has not been applied`

**Solusi:**
```bash
cd packages/prisma

# Apply pending migrations
pnpm prisma migrate deploy

# Jika masih error, resolve migration:
pnpm prisma migrate resolve --applied [migration_name]
```

### Issue 4: Prisma Client Out of Date

**Error:** `Prisma Client did not initialize yet`

**Solusi:**
```bash
cd packages/prisma

# Regenerate Prisma Client
pnpm prisma generate

# Restart backend
cd ../apps/backend
# Ctrl+C untuk stop, lalu:
pnpm run start:dev
```

### Issue 5: TypeScript Build Error Setelah Pull

**Error:** `Cannot find module '@prisma/client'`

**Solusi:**
```bash
# 1. Install dependencies
cd my-turborepo
pnpm install

# 2. Generate Prisma Client
cd packages/prisma
pnpm prisma generate

# 3. Restart
cd ../..
pnpm dev
```

### Issue 6: User Tidak Otomatis Terbuat

**Problem:** Import guru/siswa tapi user tidak ada

**Penyebab:** Auto-create user hanya bekerja via API, tidak via Prisma Studio

**Solusi:**
```bash
# Gunakan import Excel via frontend (bukan Prisma Studio)
# Atau tambah data via form di frontend

# Untuk fix data existing yang tidak punya user:
cd packages/prisma
npx tsx fix-guru-users.ts    # Fix existing guru
npx tsx fix-siswa-users.ts   # Fix existing siswa (jika ada)
```

---

## ✅ Best Practices

### Git Workflow

1. **Selalu pull sebelum mulai coding**
   ```bash
   git pull origin main
   ```

2. **Gunakan branch untuk setiap feature**
   ```bash
   git checkout -b feature/nama-feature
   ```

3. **Commit message yang jelas**
   ```
   feat: tambah fitur export excel
   fix: perbaiki bug login
   docs: update dokumentasi
   refactor: refactor guru service
   test: tambah unit test
   ```

4. **Push regularly**
   ```bash
   git push origin feature/nama-feature
   ```

### Database Workflow

1. **Jangan edit database langsung via Prisma Studio untuk production data**
   - Gunakan API/Frontend untuk insert data
   - Auto-create user hanya bekerja via API

2. **Selalu buat migration untuk perubahan schema**
   ```bash
   pnpm prisma migrate dev --name nama_perubahan
   ```

3. **Commit migration files**
   ```bash
   git add packages/prisma/migrations/
   git commit -m "feat: add migration for new fields"
   ```

4. **Test migration sebelum push**
   ```bash
   pnpm prisma migrate reset  # Test fresh install
   pnpm prisma migrate dev    # Apply migrations
   ```

### Development Workflow

1. **Jalankan aplikasi dalam watch mode**
   ```bash
   pnpm dev  # Auto-reload on changes
   ```

2. **Cek error di terminal secara berkala**
   - Backend: TypeScript compilation errors
   - Frontend: React/Next.js errors

3. **Test di browser sebelum commit**
   - Test fitur yang baru dibuat
   - Test fitur existing tidak break

4. **Clean code & follow conventions**
   - Hapus console.log yang tidak perlu
   - Format code: `pnpm format` (jika ada)
   - Lint: `pnpm lint` (jika ada)

### Communication

1. **Inform tim jika ada breaking changes**
   - Perubahan schema database
   - Perubahan API endpoints
   - Perubahan environment variables

2. **Update dokumentasi**
   - Update README.md jika ada perubahan setup
   - Update WORKFLOW.md untuk workflow baru
   - Comment code yang kompleks

3. **Review Pull Requests**
   - Review code dari developer lain
   - Test fitur sebelum approve
   - Berikan feedback konstruktif

---

## 🔧 Quick Commands Reference

### Development
```bash
pnpm dev                      # Run all (frontend + backend)
pnpm --filter backend dev     # Run backend only
pnpm --filter frontend dev    # Run frontend only
```

### Database
```bash
pnpm prisma migrate dev       # Create & apply migration
pnpm prisma migrate deploy    # Apply pending migrations
pnpm prisma migrate status    # Check migration status
pnpm prisma generate          # Generate Prisma Client
pnpm prisma studio            # Open Prisma Studio
pnpm prisma db seed           # Run seed script
```

### Docker
```bash
docker compose up -d          # Start database
docker compose down           # Stop database
docker compose logs postgres  # View postgres logs
docker compose restart        # Restart containers
```

### Git
```bash
git status                    # Check changes
git pull origin main          # Pull latest changes
git checkout -b feature/x     # Create new branch
git add .                     # Stage all changes
git commit -m "message"       # Commit changes
git push origin branch-name   # Push to remote
```

---

## 📞 Need Help?

- Cek dokumentasi: README.md, QUICK_START.md
- Cek error logs di terminal
- Search error di GitHub Issues
- Tanya di group chat tim

---

**Last Updated:** December 8, 2025
**Maintained by:** Esgriba LMS Team

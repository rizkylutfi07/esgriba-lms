# ⚡ Quick Deploy - Esgriba LMS

Panduan super cepat untuk deploy aplikasi di komputer baru.

---

## 🚀 5 Langkah Deploy

### 1️⃣ Install Docker
```bash
# Linux (Ubuntu/Debian)
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
newgrp docker

# macOS/Windows: Download Docker Desktop
# https://www.docker.com/products/docker-desktop/
```

### 2️⃣ Clone Repository
```bash
git clone https://github.com/rizkylutfi07/lms-esgriba.git
cd lms-esgriba
```

### 3️⃣ Build & Start
```bash
# Build images (5-10 menit pertama kali)
docker compose build

# Start semua services
docker compose up -d

# Check status
docker compose ps
```

### 4️⃣ Setup Database
```bash
# Run migrations
docker compose exec backend sh -c "cd /app/packages/prisma && npx prisma migrate deploy"

# Seed database (buat admin user)
cd my-turborepo
pnpm install
cd packages/prisma
DATABASE_URL="postgresql://esgriba:esgriba123@localhost:5432/esgribadb" npx tsx seed.ts
cd ../../..
```

### 5️⃣ Akses Aplikasi
```bash
# Buka browser
open http://localhost:3000

# Login:
# Email: admin@esgriba.com
# Password: admin123
```

---

## ✅ Verify

```bash
# Check all services running
docker compose ps

# Test backend API
curl http://localhost:4000

# Test login
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@esgriba.com","password":"admin123"}'
```

---

## 🔧 Common Commands

```bash
# Start
docker compose up -d

# Stop
docker compose stop

# Restart
docker compose restart

# Logs
docker compose logs -f

# Rebuild
docker compose build --no-cache
docker compose up -d
```

---

## 🆘 Troubleshooting

**Port sudah dipakai?**
```bash
# Check & kill process
sudo lsof -i :3000
sudo kill -9 <PID>
```

**Docker error?**
```bash
# Restart Docker
sudo systemctl restart docker  # Linux

# Rebuild
docker compose down
docker compose build --no-cache
docker compose up -d
```

**Login gagal?**
```bash
# Check backend logs
docker compose logs backend -f

# Reset admin password
docker compose exec postgres psql -U esgriba -d esgribadb -c "UPDATE \"User\" SET password = '\$2b\$10\$K7L1OJ45/4Y2nwO1GFohSuT1PU4e7kK5Hq8K1X9jG8Yv6Z9kZ9kZ9' WHERE email = 'admin@esgriba.com';"
```

---

## 📖 Dokumentasi Lengkap

Untuk panduan detail, baca **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)**

---

**🎉 Selesai! Aplikasi sudah berjalan.**

**URL:**
- Frontend: http://localhost:3000
- Backend: http://localhost:4000
- Database: localhost:5432

**Login:**
- Email: admin@esgriba.com
- Password: admin123

# 📦 Panduan Deployment Esgriba LMS ke Komputer Lain

Dokumentasi lengkap untuk menjalankan aplikasi Esgriba LMS di komputer baru.

---

## 📋 Daftar Isi

1. [Prerequisites](#prerequisites)
2. [Persiapan Komputer Baru](#persiapan-komputer-baru)
3. [Instalasi Aplikasi](#instalasi-aplikasi)
4. [Konfigurasi](#konfigurasi)
5. [Menjalankan Aplikasi](#menjalankan-aplikasi)
6. [Verifikasi](#verifikasi)
7. [Login Pertama Kali](#login-pertama-kali)
8. [Troubleshooting](#troubleshooting)
9. [Maintenance](#maintenance)

---

## 📋 Prerequisites

### Minimum Requirements
- **RAM:** 2GB (recommended 4GB)
- **Storage:** 10GB free space
- **OS:** Linux, macOS, atau Windows dengan WSL2
- **Network:** Koneksi internet untuk download dependencies

### Software yang Harus Diinstall

#### 1. Docker Engine
**Linux (Ubuntu/Debian):**
```bash
# Update package index
sudo apt-get update

# Install dependencies
sudo apt-get install -y \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Set up repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker Engine
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

# Verify installation
docker --version
docker compose version
```

**macOS:**
```bash
# Download Docker Desktop dari https://www.docker.com/products/docker-desktop/
# atau install via Homebrew:
brew install --cask docker
```

**Windows:**
1. Install WSL2: https://docs.microsoft.com/en-us/windows/wsl/install
2. Install Docker Desktop: https://www.docker.com/products/docker-desktop/

#### 2. Git
```bash
# Linux
sudo apt-get install -y git

# macOS
brew install git

# Verify
git --version
```

### Tambahan untuk User Non-Root (Linux)
```bash
# Add user ke docker group
sudo usermod -aG docker $USER

# Logout dan login lagi, atau:
newgrp docker

# Test
docker ps
```

---

## 🖥️ Persiapan Komputer Baru

### 1. Buat Direktori Kerja
```bash
# Buat folder untuk aplikasi
mkdir -p ~/projects
cd ~/projects
```

### 2. Clone Repository
```bash
# Clone dari GitHub
git clone https://github.com/rizkylutfi07/lms-esgriba.git

# Masuk ke direktori
cd lms-esgriba

# Verify files
ls -la
```

**Expected output:**
```
docker-compose.yml
DOCKER.md
README.md
DEPLOYMENT_GUIDE.md
my-turborepo/
```

---

## 📥 Instalasi Aplikasi

### Step-by-Step Installation

#### 1. Verify Docker Services
```bash
# Check Docker is running
docker ps

# If error "Cannot connect to Docker daemon":
sudo systemctl start docker  # Linux
# atau restart Docker Desktop (macOS/Windows)
```

#### 2. Build Docker Images
```bash
# Build semua images (memerlukan waktu 5-10 menit pertama kali)
docker compose build

# Jika ada error, gunakan:
docker compose build --no-cache
```

**Expected output:**
```
[+] Building 234.5s (45/45) FINISHED
 => [backend] ...
 => [frontend] ...
 => [postgres] ...
```

#### 3. Start Services
```bash
# Start semua containers
docker compose up -d

# Check status
docker compose ps
```

**Expected output:**
```
NAME                    STATUS              PORTS
esgriba-backend         Up 30 seconds       0.0.0.0:4000->4000/tcp
esgriba-frontend        Up 30 seconds       0.0.0.0:3000->3000/tcp
esgriba-postgres        Up 35 seconds       0.0.0.0:5432->5432/tcp
```

#### 4. Wait for Services to be Healthy
```bash
# Monitor logs untuk memastikan semua service ready
docker compose logs -f

# Tekan Ctrl+C untuk stop monitoring
# Look for:
# - postgres: "database system is ready to accept connections"
# - backend: "Nest application successfully started"
# - frontend: "Ready in X ms"
```

#### 5. Run Database Migrations
```bash
# Apply database schema
docker compose exec backend sh -c "cd /app/packages/prisma && npx prisma migrate deploy"
```

**Expected output:**
```
Prisma schema loaded from schema.prisma
Datasource "db": PostgreSQL database

3 migrations found in prisma/migrations
No pending migrations to apply.
```

#### 6. Seed Database (Data Awal)

**PENTING:** Seed database dengan data awal seperti user admin dan data sample.

**Opsi 1: Dari Host Machine (Recommended)**
```bash
# Masuk ke direktori turborepo
cd my-turborepo

# Install dependencies jika belum
pnpm install

# Seed database
cd packages/prisma
DATABASE_URL="postgresql://esgriba:esgriba123@localhost:5432/esgribadb" npx tsx seed.ts

# Kembali ke root
cd ../..
cd ..
```

**Opsi 2: Manual via Prisma Studio**
```bash
# Buka Prisma Studio
cd my-turborepo/packages/prisma
DATABASE_URL="postgresql://esgriba:esgriba123@localhost:5432/esgribadb" npx prisma studio

# Kemudian tambahkan user admin secara manual:
# Email: admin@esgriba.com
# Password (hashed): $2b$10$K7L1OJ45/4Y2nwO1GFohSuT1PU4e7kK5Hq8K1X9jG8Yv6Z9kZ9kZ9
# Role: ADMIN
# Name: Administrator
```

**Opsi 3: Via SQL Direct**
```bash
# Connect ke database
docker compose exec postgres psql -U esgriba -d esgribadb

# Run SQL:
INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt") 
VALUES (
  gen_random_uuid(), 
  'admin@esgriba.com', 
  '$2b$10$K7L1OJ45/4Y2nwO1GFohSuT1PU4e7kK5Hq8K1X9jG8Yv6Z9kZ9kZ9', 
  'Administrator', 
  'ADMIN', 
  NOW(), 
  NOW()
);

# Exit
\q
```

---

## ⚙️ Konfigurasi

### Environment Variables

File `docker-compose.yml` sudah memiliki konfigurasi default. Untuk customize:

```bash
# Edit docker-compose.yml
nano docker-compose.yml
# atau
vim docker-compose.yml
```

**Konfigurasi Penting:**

```yaml
services:
  postgres:
    environment:
      POSTGRES_USER: esgriba          # Ubah sesuai kebutuhan
      POSTGRES_PASSWORD: esgriba123   # Ganti dengan password kuat
      POSTGRES_DB: esgribadb

  backend:
    environment:
      DATABASE_URL: postgresql://esgriba:esgriba123@postgres:5432/esgribadb
      JWT_SECRET: your-super-secret-jwt-key-change-this  # WAJIB GANTI!
      NODE_ENV: production
      PORT: 4000

  frontend:
    environment:
      NEXT_PUBLIC_API_URL: http://localhost:4000  # Ganti jika deploy ke server
```

**PENTING:** Ganti `JWT_SECRET` dengan string random yang kuat:
```bash
# Generate random JWT secret
openssl rand -base64 32

# Copy output dan paste ke JWT_SECRET di docker-compose.yml
```

### Port Configuration

Default ports:
- **Frontend:** 3000
- **Backend:** 4000
- **PostgreSQL:** 5432

Jika port sudah terpakai, ubah di `docker-compose.yml`:
```yaml
ports:
  - "8080:3000"  # Frontend now on port 8080
```

---

## 🚀 Menjalankan Aplikasi

### Start Application
```bash
# Dari direktori lms-esgriba/
docker compose up -d
```

### Stop Application
```bash
# Stop tanpa hapus data
docker compose stop

# Stop dan hapus containers (data tetap ada di volume)
docker compose down

# Stop dan hapus containers + volumes (HAPUS SEMUA DATA!)
docker compose down -v
```

### Restart Services
```bash
# Restart semua
docker compose restart

# Restart service tertentu
docker compose restart backend
docker compose restart frontend
```

### View Logs
```bash
# Semua logs
docker compose logs

# Follow logs (live)
docker compose logs -f

# Logs service tertentu
docker compose logs backend -f
docker compose logs frontend -f
docker compose logs postgres -f
```

---

## ✅ Verifikasi

### 1. Check Services Status
```bash
docker compose ps
```

Semua service harus status `Up` atau `Up (healthy)`.

### 2. Check Backend API
```bash
# Health check
curl http://localhost:4000

# Expected: API is running message atau 404
```

### 3. Check Frontend
```bash
# Buka browser
open http://localhost:3000

# atau
xdg-open http://localhost:3000  # Linux
```

Harus muncul halaman login.

### 4. Test Login API
```bash
# Test login endpoint
curl -X POST http://localhost:4000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@esgriba.com","password":"admin123"}'
```

**Expected response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "admin@esgriba.com",
    "name": "Administrator",
    "role": "ADMIN"
  }
}
```

### 5. Check Database
```bash
# Connect ke PostgreSQL
docker compose exec postgres psql -U esgriba -d esgribadb

# List tables
\dt

# Check users
SELECT email, name, role FROM "User";

# Exit
\q
```

---

## 🔐 Login Pertama Kali

### Default Credentials

**Admin Account:**
- **Email:** `admin@esgriba.com`
- **Password:** `admin123`

### Langkah Login

1. Buka browser ke `http://localhost:3000`
2. Klik "Login" atau langsung ke `http://localhost:3000/login`
3. Masukkan email: `admin@esgriba.com`
4. Masukkan password: `admin123`
5. Klik "Login"
6. Anda akan diarahkan ke Dashboard

### Ganti Password Admin (Recommended)

Setelah login pertama kali, segera ganti password:

1. Masuk ke halaman Profile/Settings
2. Ganti password default
3. Atau via database:

```bash
# Generate password hash baru
node -e "console.log(require('bcrypt').hashSync('PasswordBaruAnda', 10))"

# Connect ke database
docker compose exec postgres psql -U esgriba -d esgribadb

# Update password
UPDATE "User" SET password = 'hash_dari_step_sebelumnya' WHERE email = 'admin@esgriba.com';

\q
```

---

## 🔧 Troubleshooting

### Problem 1: Port Already in Use

**Error:**
```
Error: bind: address already in use
```

**Solution:**
```bash
# Check port yang digunakan
sudo lsof -i :3000  # Frontend
sudo lsof -i :4000  # Backend
sudo lsof -i :5432  # PostgreSQL

# Kill process
sudo kill -9 <PID>

# Atau ganti port di docker-compose.yml
```

### Problem 2: Cannot Connect to Docker Daemon

**Error:**
```
Cannot connect to the Docker daemon
```

**Solution:**
```bash
# Start Docker service (Linux)
sudo systemctl start docker

# Check status
sudo systemctl status docker

# Enable auto-start
sudo systemctl enable docker

# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker
```

### Problem 3: Database Connection Failed

**Error:**
```
Connection refused on postgres:5432
```

**Solution:**
```bash
# Check postgres container
docker compose ps postgres

# Check logs
docker compose logs postgres

# Restart postgres
docker compose restart postgres

# Wait for healthy status
docker compose ps
```

### Problem 4: Backend Crashes on Startup

**Solution:**
```bash
# Check logs
docker compose logs backend -f

# Common issues:
# 1. Database not ready - wait 30 seconds
# 2. Migration not applied - run migrate deploy
# 3. Port conflict - change port in docker-compose.yml

# Rebuild backend
docker compose build --no-cache backend
docker compose up -d backend
```

### Problem 5: Frontend 404 Not Found

**Solution:**
```bash
# Check if backend is running
curl http://localhost:4000

# Check environment variables
docker compose exec frontend env | grep NEXT_PUBLIC

# Rebuild frontend
docker compose build --no-cache frontend
docker compose up -d frontend
```

### Problem 6: Login Failed / Wrong Password

**Solution:**
```bash
# Verify user exists
docker compose exec postgres psql -U esgriba -d esgribadb -c "SELECT email, role FROM \"User\";"

# Reset admin password to 'admin123'
# Password hash untuk 'admin123':
# $2b$10$K7L1OJ45/4Y2nwO1GFohSuT1PU4e7kK5Hq8K1X9jG8Yv6Z9kZ9kZ9

docker compose exec postgres psql -U esgriba -d esgribadb -c "UPDATE \"User\" SET password = '\$2b\$10\$K7L1OJ45/4Y2nwO1GFohSuT1PU4e7kK5Hq8K1X9jG8Yv6Z9kZ9kZ9' WHERE email = 'admin@esgriba.com';"
```

### Problem 7: Low Disk Space

**Solution:**
```bash
# Remove unused Docker resources
docker system prune -a

# Remove old images
docker image prune -a

# Remove unused volumes (HATI-HATI!)
docker volume prune

# Check disk usage
docker system df
```

### Problem 8: Slow Performance

**Solution:**
```bash
# Check resource usage
docker stats

# Increase Docker resources:
# - Docker Desktop: Settings > Resources > Advanced
# - Increase RAM to 4GB+
# - Increase CPU to 2+ cores

# Restart Docker
docker compose restart
```

---

## 🔄 Maintenance

### Backup Database

```bash
# Backup database ke file
docker compose exec postgres pg_dump -U esgriba esgribadb > backup_$(date +%Y%m%d_%H%M%S).sql

# Atau dengan compression
docker compose exec postgres pg_dump -U esgriba esgribadb | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Restore Database

```bash
# Stop backend dulu
docker compose stop backend

# Restore dari backup
docker compose exec -T postgres psql -U esgriba esgribadb < backup_20241209_100000.sql

# Atau dari compressed backup
gunzip -c backup_20241209_100000.sql.gz | docker compose exec -T postgres psql -U esgriba esgribadb

# Start backend
docker compose start backend
```

### Update Application

```bash
# Stop services
docker compose down

# Pull latest code
git pull origin main

# Rebuild images
docker compose build --no-cache

# Start services
docker compose up -d

# Run migrations
docker compose exec backend sh -c "cd /app/packages/prisma && npx prisma migrate deploy"
```

### View Database Size

```bash
docker compose exec postgres psql -U esgriba -d esgribadb -c "SELECT pg_size_pretty(pg_database_size('esgribadb'));"
```

### Clean Up Old Data

```bash
# Remove old logs (older than 30 days)
docker compose exec postgres psql -U esgriba -d esgribadb -c "DELETE FROM logs WHERE created_at < NOW() - INTERVAL '30 days';"

# Vacuum database
docker compose exec postgres psql -U esgriba -d esgribadb -c "VACUUM ANALYZE;"
```

### Monitor Logs

```bash
# Save logs to file
docker compose logs > logs_$(date +%Y%m%d_%H%M%S).txt

# Monitor in realtime
docker compose logs -f --tail=100
```

---

## 📊 Monitoring

### Check Service Health

```bash
# Status semua services
docker compose ps

# Resource usage
docker stats

# Disk usage
docker system df
```

### Check Application Health

```bash
# Backend health
curl http://localhost:4000/health

# Frontend
curl http://localhost:3000

# Database connections
docker compose exec postgres psql -U esgriba -d esgribadb -c "SELECT count(*) FROM pg_stat_activity WHERE datname = 'esgribadb';"
```

---

## 🌐 Deploy ke Server (Production)

### Tambahan untuk Production

1. **Gunakan Domain & HTTPS:**
```bash
# Install nginx sebagai reverse proxy
# Setup SSL dengan Let's Encrypt
# Configure nginx untuk proxy ke containers
```

2. **Ganti Environment Variables:**
```yaml
frontend:
  environment:
    NEXT_PUBLIC_API_URL: https://api.yourdomain.com
```

3. **Security Hardening:**
```yaml
# Jangan expose database port ke public:
postgres:
  ports:
    - "127.0.0.1:5432:5432"  # Hanya local access

# Ganti semua passwords
# Gunakan Docker secrets
```

4. **Setup Auto-restart:**
```yaml
services:
  postgres:
    restart: always
  backend:
    restart: always
  frontend:
    restart: always
```

5. **Setup Automated Backups:**
```bash
# Buat cron job untuk backup database
0 2 * * * /usr/local/bin/backup-esgriba-db.sh
```

---

## 📞 Support

### Dokumentasi Lainnya
- **[DOCKER.md](DOCKER.md)** - Docker technical details
- **[README.md](README.md)** - Project overview
- **[my-turborepo/README.md](my-turborepo/README.md)** - Development guide

### Common Commands Cheat Sheet

```bash
# Start
docker compose up -d

# Stop
docker compose stop

# Restart
docker compose restart

# Logs
docker compose logs -f

# Status
docker compose ps

# Rebuild
docker compose build --no-cache

# Clean up
docker compose down -v

# Backup DB
docker compose exec postgres pg_dump -U esgriba esgribadb > backup.sql

# Restore DB
docker compose exec -T postgres psql -U esgriba esgribadb < backup.sql

# Shell access
docker compose exec backend sh
docker compose exec frontend sh
docker compose exec postgres psql -U esgriba -d esgribadb
```

---

## ✅ Checklist Deployment

Gunakan checklist ini saat deploy ke komputer baru:

- [ ] Install Docker & Docker Compose
- [ ] Add user ke docker group (Linux)
- [ ] Clone repository
- [ ] Review & update docker-compose.yml (JWT_SECRET, passwords)
- [ ] Build images: `docker compose build`
- [ ] Start services: `docker compose up -d`
- [ ] Wait for healthy status: `docker compose ps`
- [ ] Run migrations: `docker compose exec backend sh -c "cd /app/packages/prisma && npx prisma migrate deploy"`
- [ ] Seed database (pilih salah satu metode)
- [ ] Test backend API: `curl http://localhost:4000`
- [ ] Test frontend: Open `http://localhost:3000`
- [ ] Login dengan admin@esgriba.com / admin123
- [ ] Ganti password admin
- [ ] Setup backup schedule (production)
- [ ] Configure firewall (production)
- [ ] Setup domain & SSL (production)

---

**Selamat! Aplikasi Esgriba LMS sudah berjalan di komputer baru. 🎉**

Jika ada masalah, cek bagian [Troubleshooting](#troubleshooting) atau review logs dengan `docker compose logs -f`.

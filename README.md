# Esgriba LMS

Learning Management System untuk Esgriba dengan fitur lengkap manajemen sekolah.

## 🚀 Quick Start dengan Docker

```bash
# Build dan start semua services
docker compose up -d

# Cek status
docker compose ps

# Lihat logs
docker compose logs -f
```

**Akses:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Database: localhost:5432

## 🛠️ Development Mode

```bash
cd my-turborepo

# Install dependencies
pnpm install

# Run development servers
pnpm dev
```

**Akses Development:**
- Frontend: http://localhost:3000
- Backend: http://localhost:4000

## 📚 Dokumentasi Lengkap

- **[DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)** - 🔥 Panduan lengkap deploy ke komputer lain
- **[DOCKER.md](DOCKER.md)** - Panduan lengkap Docker deployment
- **[my-turborepo/README.md](my-turborepo/README.md)** - Development guide
- **[my-turborepo/QUICK_START.md](my-turborepo/QUICK_START.md)** - Quick start development

## 🏗️ Teknologi

- **Frontend:** Next.js 15, React 19, Tailwind CSS, shadcn/ui
- **Backend:** NestJS, Prisma ORM
- **Database:** PostgreSQL 16
- **Monorepo:** Turborepo, pnpm workspaces

## 📦 Struktur Project

```
.
├── docker-compose.yml          # Docker orchestration
├── DOCKER.md                   # Docker documentation
└── my-turborepo/
    ├── apps/
    │   ├── frontend/          # Next.js application
    │   └── backend/           # NestJS API
    └── packages/
        ├── prisma/            # Database schema & migrations
        ├── ui/                # Shared UI components
        └── typescript-config/ # Shared TS config
```

## 🐳 Docker Commands

```bash
# Build semua images
docker compose build

# Start services
docker compose up -d

# Stop services
docker compose down

# Restart service tertentu
docker compose restart backend

# Lihat logs
docker compose logs backend -f

# Cleanup
docker compose down -v  # Hapus volumes juga
```

## 🔧 Troubleshooting

Jika ada masalah, cek [DOCKER.md](DOCKER.md) bagian Troubleshooting atau:

```bash
# Rebuild tanpa cache
docker compose build --no-cache

# Reset database (HATI-HATI: hapus semua data!)
docker compose down -v
docker compose up -d
```

## 📝 License

MIT

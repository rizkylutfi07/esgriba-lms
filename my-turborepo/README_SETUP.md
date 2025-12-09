# Esgriba LMS - School Management System

Sistem manajemen sekolah lengkap dengan Next.js (Frontend), NestJS (Backend), Prisma (ORM), dan PostgreSQL (Database).

## 🚀 Tech Stack

### Backend
- **NestJS** - Framework backend TypeScript
- **Prisma** - ORM untuk database
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcrypt** - Password hashing

### Frontend
- **Next.js 14** - React framework dengan App Router
- **TanStack Query** - Data fetching & caching
- **shadcn/ui** - UI components
- **Tailwind CSS** - Styling
- **Lucide Icons** - Icon library

### Monorepo
- **Turborepo** - Build system
- **pnpm** - Package manager

## 📦 Struktur Project

```
my-turborepo/
├── apps/
│   ├── backend/          # NestJS API
│   └── frontend/         # Next.js App
├── packages/
│   ├── prisma/           # Shared Prisma schema
│   ├── ui/               # Shared UI components
│   ├── typescript-config/
│   └── eslint-config/
└── docker-compose.yml    # PostgreSQL container
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18+
- pnpm
- Docker & Docker Compose

### 1. Install Dependencies

```bash
cd my-turborepo
pnpm install
```

### 2. Start PostgreSQL Database

```bash
docker compose up -d
```

### 3. Setup Database

```bash
# Generate Prisma Client
cd packages/prisma
pnpm db:generate

# Run migrations
pnpm db:migrate

# Seed database
pnpm db:seed
```

### 4. Start Development Servers

Buka terminal baru untuk masing-masing:

**Backend (Terminal 1):**
```bash
cd apps/backend
pnpm dev
# Backend akan berjalan di http://localhost:4000
```

**Frontend (Terminal 2):**
```bash
cd apps/frontend
pnpm dev
# Frontend akan berjalan di http://localhost:3000
```

## 🔐 Default Login Credentials

Setelah seeding, gunakan akun berikut:

- **Admin**
  - Email: `admin@esgriba.com`
  - Password: `admin123`

- **Guru**
  - Email: `budi@esgriba.com`
  - Password: `guru123`

- **Siswa**
  - Email: `2024001@siswa.esgriba.com`
  - Password: `siswa123`

## 📚 Fitur Phase 1

### Authentication
- ✅ JWT-based authentication
- ✅ Role-based access control (Admin, Guru, Siswa)
- ✅ Password hashing dengan bcrypt
- ✅ Protected routes

### CRUD Modules
- ✅ **Users** - Manajemen users sistem
- ✅ **Siswa** - Data siswa
- ✅ **Guru** - Data guru
- ✅ **Kelas** - Data kelas
- ✅ **Jurusan** - Data jurusan (IPA, IPS, dll)
- ✅ **Mapel** - Mata pelajaran
- ✅ **Jadwal** - Jadwal pelajaran
- ✅ **Tahun Ajaran** - Periode akademik

### Dashboards
- ✅ Admin Dashboard - Full access
- ✅ Guru Dashboard - Teacher portal
- ✅ Siswa Dashboard - Student portal

## 🎯 API Endpoints

### Auth
- `POST /auth/login` - Login
- `GET /auth/me` - Get current user

### Resources (All CRUD)
- `/users` - User management
- `/siswa` - Student management
- `/guru` - Teacher management
- `/kelas` - Class management
- `/jurusan` - Major management
- `/mapel` - Subject management
- `/jadwal` - Schedule management
- `/tahun-ajaran` - Academic year management

Setiap resource memiliki:
- `GET /resource` - List all
- `GET /resource/:id` - Get one
- `POST /resource` - Create
- `PATCH /resource/:id` - Update
- `DELETE /resource/:id` - Delete

## 🗄️ Database Schema

### User
- Superclass untuk authentication
- Roles: ADMIN, GURU, SISWA

### Siswa
- NIS, NISN
- Personal info
- Relasi ke Kelas

### Guru
- NIP
- Personal info
- Relasi ke Mapel, Kelas (wali kelas)

### Kelas
- Level (X, XI, XII)
- Relasi ke Jurusan, Guru (wali kelas)

### Jurusan
- IPA, IPS, dll
- Relasi ke Kelas

### Mapel
- Mata pelajaran
- Relasi ke Guru

### Jadwal
- Hari, jam
- Relasi ke Kelas, Mapel, Guru

### Tahun Ajaran
- Tahun mulai/selesai
- Semester (GANJIL/GENAP)

## 🔧 Development Commands

### Backend
```bash
cd apps/backend
pnpm dev          # Development mode
pnpm build        # Build for production
pnpm start:prod   # Run production build
pnpm lint         # Lint code
```

### Frontend
```bash
cd apps/frontend
pnpm dev          # Development mode
pnpm build        # Build for production
pnpm start        # Run production build
pnpm lint         # Lint code
```

### Prisma
```bash
cd packages/prisma
pnpm db:generate  # Generate Prisma Client
pnpm db:push      # Push schema to DB (dev)
pnpm db:migrate   # Run migrations
pnpm db:studio    # Open Prisma Studio
pnpm db:seed      # Seed database
```

## 🐳 Docker Commands

```bash
# Start PostgreSQL
docker compose up -d

# Stop PostgreSQL
docker compose down

# View logs
docker compose logs -f postgres

# Reset database (WARNING: deletes all data)
docker compose down -v
docker compose up -d
```

## 📱 UI Guidelines

### Allowed Libraries
- ✅ shadcn/ui (MANDATORY)
- ✅ Lucide Icons
- ✅ Tailwind Typography
- ✅ Sonner (toast notifications)

### NOT Allowed
- ❌ Material UI
- ❌ Chakra UI
- ❌ Ant Design
- ❌ Bootstrap

## 🏗️ Phase 2 - Coming Soon

- 📚 LMS (Learning Management)
- 📝 CBT (Computer-Based Test)
- ✅ Absensi (Attendance)
- 📊 Penilaian (Grading)
- 📑 Raport Digital
- 📱 Mobile API

## 🤝 Contributing

1. Follow TypeScript best practices
2. Use TanStack Query for all API calls
3. Follow NestJS module structure
4. Use shadcn/ui components only
5. Write clean, maintainable code

## 📄 License

Private - Esgriba School System

## 👨‍💻 Support

For issues or questions, contact the development team.

---

**Happy Coding! 🚀**

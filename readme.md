my-school-system/
│
├── apps/
│ ├── frontend/ # Next.js frontend
│ └── backend/ # NestJS backend
│
├── packages/
│ ├── prisma/ # Central Prisma schema + migrations
│ ├── ui/ # Shared UI components (optional)
│ └── config/ # Shared configs: tailwind, eslint, tsconfig
│
├── docker-compose.yml
├── turbo.json
├── package.json
└── README.md


---

# 🧩 DATABASE MODELS (PHASE 1 ONLY)

## User (superclass)


id
name
email
passwordHash
role (ADMIN | GURU | SISWA)
createdAt


## Siswa (student)


id
nis
nisn
name
gender
birthDate
address
classId


## Guru (teacher)


id
nip
name
email
phone


## Kelas (class)


id
name
level (X | XI | XII)
majorId
homeroomTeacherId


## Jurusan (major)


id
name
code


## Mapel (subject)


id
name
code
teacherId


## Tahun Ajaran & Semester


id
yearStart
yearEnd
semester (GANJIL | GENAP)


## Jadwal (schedule)


id
classId
subjectId
teacherId
dayOfWeek
startTime
endTime


---

# 🔐 Authentication Requirements

Backend MUST implement:
- JWT login
- Password hashing (`bcrypt`)
- Guards:
  - AdminGuard
  - GuruGuard
  - SiswaGuard

Frontend MUST:
- Store token securely (httpOnly optional)
- Use middleware or server components for protected routes
- Redirect unauthorized users

---

# 🌐 Frontend Requirements (apps/frontend)

AI Agent must implement:

### Pages:
- `/login`
- `/dashboard/admin`
- `/dashboard/guru`
- `/dashboard/siswa`

### Each feature must have pages and CRUD UI:
- Users
- Siswa
- Guru
- Kelas
- Mapel
- Jurusan
- Jadwal
- Tahun Ajaran

### Tech:
- **TanStack Query** for all API calls
- **shadcn/ui** components (Button, Input, Form, Table, Dialog, Sheet, Navbar)
- Tailwind for layout

---

# 🧪 Backend API Requirements (apps/backend)

Backend modules MUST exist:



auth/
users/
siswa/
guru/
kelas/
jurusan/
mapel/
jadwal/
tahun-ajaran/


Each module contains:
- controller.ts
- service.ts
- dto/
- module.ts

All CRUD routes required:


GET /resource
GET /resource/:id
POST /resource
PUT /resource/:id
DELETE /resource/:id


---

# 🐳 Docker Requirements

AI Agent MUST use this docker-compose.yml structure:

```yaml
services:
  postgres:
    image: postgres:16
    restart: always
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: esgriba
      POSTGRES_PASSWORD: esgriba123
      POSTGRES_DB: esgribadb
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:

🎨 UI Guidelines
Primary UI framework:
🥇 shadcn/ui (MANDATORY)
Also allowed:

Lucide Icons

Tailwind Typography

Sonner (toast)

NOT allowed:

Material UI

Chakra UI

Ant Design

Bootstrap

🧠 AI Agent Rules

Use TypeScript everywhere

Follow monorepo structure strictly

Backend & frontend must share one Prisma schema

Always write clean code (no inline spaghetti)

Use TanStack Query for API state

Implement server components where possible

Store environment variables properly

Provide clear commit messages

No deprecated libraries

Follow best practices for:

NestJS modules

Next.js App Router

Prisma schema design

API error handling

🏁 Deliverables for Phase 1

AI Agent must output:

Fully functional monorepo

Frontend (Next.js) running at localhost:3000

Backend (NestJS) running at localhost:4000

PostgreSQL running via Docker

Prisma schema + migrations + seed

CRUD for:

Users

Siswa

Guru

Kelas

Jurusan

Mapel

Tahun Ajaran

Jadwal

Authentication system (JWT)

Role-based dashboards

🎉 After Phase 1 Completion

AI Agent may proceed to:

LMS

CBT

Absensi

Penilaian

Raport digital

Mobile API version


---

# 💬 Mau saya buatkan versi **AI Prompt Template** (perintah siap tempel untuk agent)?  
Contoh:



You are an AI developer agent. Your task is to generate the entire monorepo...


Jika iya, saya buatkan versi yang **super-optimized** agar agent bekerja cepat dan tepat.
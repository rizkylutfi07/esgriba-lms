# CBT Frontend - React + TypeScript + Vite

Frontend aplikasi Computer-Based Test (CBT) menggunakan React.js dengan TypeScript, Tailwind CSS, dan shadcn/ui.

## Fitur

- ⚛️ React 18 dengan TypeScript
- 🎨 Tailwind CSS untuk styling
- 🧩 shadcn/ui component library
- 🔐 JWT Authentication
- 📱 Responsive design
- 🚀 Vite untuk fast development
- 🗂️ Zustand untuk state management
- 🛣️ React Router untuk routing

## Struktur Folder

```
src/
├── components/
│   ├── layouts/       # Layout components
│   └── ui/            # shadcn/ui components
├── hooks/             # Custom hooks
├── lib/               # Utilities & API config
├── pages/             # Page components
│   ├── admin/         # Admin pages
│   ├── guru/          # Teacher pages
│   └── siswa/         # Student pages
├── store/             # Zustand stores
├── App.tsx            # Main app component
└── main.tsx           # Entry point
```

## Setup & Installation

1. Install dependencies:

```bash
npm install
```

2. Configure environment:
   Pastikan backend Laravel sudah running di `http://localhost:8000`

3. Run development server:

```bash
npm run dev


```

Aplikasi akan berjalan di `http://localhost:5173`

## Build untuk Production

```bash
npm run build
```

File hasil build akan ada di folder `dist/`

## User Roles

### Admin

- Mengelola semua pengguna
- Melihat statistik sistem
- Akses penuh ke semua fitur

### Guru (Teacher)

- Membuat dan mengelola ujian
- Menambahkan soal
- Melihat hasil ujian siswa

### Siswa (Student)

- Melihat ujian yang tersedia
- Mengerjakan ujian
- Melihat hasil ujian

## Demo Accounts

Gunakan akun berikut untuk testing:

**Admin:**

- Email: admin@cbt.com
- Password: password

**Guru:**

- Email: guru@cbt.com
- Password: password

**Siswa:**

- Email: siswa@cbt.com
- Password: password

## Tech Stack

- **React 18** - UI Library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Utility-first CSS
- **shadcn/ui** - Component library
- **Zustand** - State management
- **React Router** - Routing
- **Axios** - HTTP client
- **Lucide React** - Icons

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## API Integration

API endpoint dikonfigurasi di `src/lib/api.ts`:

- Base URL: `http://localhost:8000/api`
- Authentication: JWT Bearer token
- Auto logout on 401 response

## Styling

Project menggunakan Tailwind CSS dengan konfigurasi custom:

- Color scheme: Blue primary
- Dark mode support
- Responsive breakpoints
- Custom animations

## License

MIT License

# cbt-esgriba-fe

# cbt-esgriba-fe

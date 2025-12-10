# 🎨 Panduan Dark Mode & Shadcn Block

## ✅ Yang Sudah Diinstal

### 1. **Shadcn Block Dashboard-01**

Shadcn block `dashboard-01` sudah berhasil diinstal dengan komponen:

- ✅ Sidebar (app-sidebar.tsx)
- ✅ Site Header (site-header.tsx)
- ✅ Interactive Charts (chart-area-interactive.tsx)
- ✅ Data Table (data-table.tsx)
- ✅ Section Cards (section-cards.tsx)
- ✅ Navigation components (nav-main, nav-user, nav-documents, nav-secondary)

### 2. **Dark Mode System**

- ✅ ThemeProvider dengan context API
- ✅ ModeToggle button dengan 3 pilihan (Light/Dark/System)
- ✅ Sudah terintegrasi di Sidebar (footer)
- ✅ Menggunakan localStorage untuk menyimpan preferensi

### 3. **Komponen UI Baru**

- ✅ Separator
- ✅ Sheet
- ✅ Tooltip
- ✅ Skeleton
- ✅ Breadcrumb
- ✅ Tabs
- ✅ Toggle & Toggle Group
- ✅ Drawer
- ✅ Avatar
- ✅ Sonner (toast notifications)
- ✅ Sidebar
- ✅ Chart

## 🎯 Cara Menggunakan Dark Mode

### 1. **Mengakses Toggle Dark Mode**

Toggle dark mode tersedia di **footer sidebar** (bagian bawah sidebar kiri):

- Klik icon **Sun/Moon** untuk membuka menu
- Pilih salah satu:
  - **Light** - Mode terang
  - **Dark** - Mode gelap
  - **System** - Mengikuti sistem operasi

### 2. **Preferensi Tersimpan Otomatis**

- Pilihan theme disimpan di `localStorage`
- Key: `cbt-theme`
- Akan tetap aktif meskipun refresh browser atau logout

## 🏗️ Struktur File Baru

```
src/
├── components/
│   ├── theme-provider.tsx          ← Context provider untuk theme
│   ├── mode-toggle.tsx              ← Tombol toggle dark mode
│   ├── app-sidebar.tsx              ← Sidebar dari shadcn block
│   ├── site-header.tsx              ← Header dari shadcn block
│   ├── chart-area-interactive.tsx   ← Interactive chart component
│   ├── data-table.tsx               ← Data table component
│   ├── section-cards.tsx            ← Section cards component
│   ├── nav-main.tsx                 ← Main navigation
│   ├── nav-user.tsx                 ← User navigation
│   ├── nav-documents.tsx            ← Documents navigation
│   └── nav-secondary.tsx            ← Secondary navigation
│   └── ui/
│       ├── separator.tsx
│       ├── sheet.tsx
│       ├── tooltip.tsx
│       ├── skeleton.tsx
│       ├── breadcrumb.tsx
│       ├── tabs.tsx
│       ├── toggle.tsx
│       ├── toggle-group.tsx
│       ├── drawer.tsx
│       ├── avatar.tsx
│       ├── sonner.tsx
│       ├── sidebar.tsx
│       └── chart.tsx
├── pages/
│   └── Dashboard01.tsx              ← Contoh halaman dashboard
├── hooks/
│   └── use-mobile.tsx               ← Hook untuk detect mobile
└── app/
    └── dashboard/
        └── data.json                ← Sample data untuk dashboard
```

## 🎨 Custom Styling untuk Dark Mode

### Menggunakan Dark Mode Classes:

```tsx
// Contoh penggunaan dark mode
<div className="bg-white dark:bg-slate-900">
  <h1 className="text-slate-900 dark:text-white">Judul</h1>
  <p className="text-slate-600 dark:text-slate-400">Deskripsi</p>
</div>
```

### Color Palette Dark Mode:

Sudah tersedia di `tailwind.config.js` dan `index.css`:

- `background` - Background utama
- `foreground` - Text color utama
- `card` - Background card
- `card-foreground` - Text pada card
- `muted` - Background muted
- `muted-foreground` - Text muted
- Dan lainnya...

## 🚀 Cara Menggunakan Shadcn Block

### 1. **Import Component yang Dibutuhkan**

```tsx
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
```

### 2. **Gunakan di Halaman**

```tsx
export default function MyPage() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="flex-1 overflow-auto">
        <SiteHeader />
        <div className="container mx-auto p-6">{/* Content here */}</div>
      </main>
    </SidebarProvider>
  );
}
```

### 3. **Contoh Dashboard dengan Charts**

Lihat file: `src/pages/Dashboard01.tsx` untuk contoh lengkap

## 🎯 Menambahkan Dark Mode ke Component Existing

### Langkah-langkah:

1. **Tambahkan dark: classes**

   ```tsx
   // Sebelum
   <div className="bg-white text-gray-900">

   // Sesudah
   <div className="bg-white dark:bg-slate-900 text-gray-900 dark:text-white">
   ```

2. **Update Gradient Colors**

   ```tsx
   // Sebelum
   <div className="bg-gradient-to-r from-blue-500 to-purple-600">

   // Sesudah - Gradients biasanya sudah bagus di dark mode
   <div className="bg-gradient-to-r from-blue-500 to-purple-600 dark:from-blue-400 dark:to-purple-500">
   ```

3. **Update Border & Shadow**

   ```tsx
   // Sebelum
   <div className="border border-gray-200 shadow-sm">

   // Sesudah
   <div className="border border-gray-200 dark:border-slate-700 shadow-sm dark:shadow-slate-900/50">
   ```

## 📊 Menggunakan Charts dari Shadcn

### Interactive Area Chart:

```tsx
import { ChartAreaInteractive } from "@/components/chart-area-interactive";

<Card>
  <CardHeader>
    <CardTitle>Total Visitors</CardTitle>
  </CardHeader>
  <CardContent>
    <ChartAreaInteractive />
  </CardContent>
</Card>;
```

### Custom Chart Configuration:

Charts menggunakan Recharts library dengan theming otomatis untuk dark mode.

## 🔧 Konfigurasi Lanjutan

### Mengubah Default Theme:

Edit `src/App.tsx`:

```tsx
<ThemeProvider
  defaultTheme="dark" // Ubah ke "dark", "light", atau "system"
  storageKey="cbt-theme"
>
  {/* ... */}
</ThemeProvider>
```

### Custom Theme Colors:

Edit `tailwind.config.js` dan `src/index.css` untuk custom colors.

## 💡 Tips & Best Practices

### 1. **Konsistensi**

- Gunakan dark: classes untuk semua background, text, border
- Test di kedua mode (light & dark)

### 2. **Kontras**

- Pastikan text readable di kedua mode
- Gunakan `text-slate-600 dark:text-slate-400` untuk secondary text

### 3. **Gradients**

- Gradient biasanya bagus di dark mode
- Adjust brightness jika perlu: `dark:from-blue-400` (lebih terang)

### 4. **Images & Icons**

- Icon dengan single color otomatis adapt
- Images mungkin perlu opacity: `dark:opacity-80`

### 5. **Glass Effect**

```tsx
<div className="glass backdrop-blur-lg bg-white/80 dark:bg-slate-900/80">
  Content
</div>
```

## 🎨 Contoh Pattern Umum

### Card dengan Dark Mode:

```tsx
<Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700">
  <CardHeader>
    <CardTitle className="text-slate-900 dark:text-white">Title</CardTitle>
    <CardDescription className="text-slate-600 dark:text-slate-400">
      Description
    </CardDescription>
  </CardHeader>
  <CardContent>{/* Content */}</CardContent>
</Card>
```

### Button dengan Dark Mode:

```tsx
<Button className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white">
  Click Me
</Button>
```

### Input dengan Dark Mode:

```tsx
<Input
  className="bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
  placeholder="Enter text..."
/>
```

## 🚀 Next Steps

1. ✅ Dark mode sudah aktif - tinggal refresh browser
2. ✅ Toggle theme di sidebar footer
3. ✅ Coba buat halaman baru dengan Shadcn block components
4. ⬜ Tambahkan dark: classes ke halaman existing
5. ⬜ Customize theme colors sesuai brand

## 📚 Resources

- [Shadcn UI Documentation](https://ui.shadcn.com)
- [Shadcn Blocks](https://ui.shadcn.com/blocks)
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [Recharts Documentation](https://recharts.org)

---

**Update**: November 2025  
Dark mode & Shadcn Block sudah terintegrasi penuh! 🎉

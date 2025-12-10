# 🔧 Troubleshooting Warnings - CBT E-Sgriba Frontend

Panduan mengatasi warning dan error umum di aplikasi frontend.

---

## ⚠️ React Router Warnings

### Warning 1: React Router Future Flag - v7_startTransition

**Pesan Error:**

```
⚠️ React Router Future Flag Warning: React Router will begin wrapping state
updates in `React.startTransition` in v7. You can use the `v7_startTransition`
future flag to opt-in early.
```

**Penyebab:**
React Router v6 memberikan warning tentang perubahan behavior di v7.

**Solusi:** ✅ SUDAH DIPERBAIKI

Di file `src/App.tsx`, tambahkan future flags:

```tsx
<BrowserRouter
  future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  }}
>
  {/* Routes */}
</BrowserRouter>
```

---

### Warning 2: React Router Future Flag - v7_relativeSplatPath

**Pesan Error:**

```
⚠️ React Router Future Flag Warning: Relative route resolution within Splat
routes is changing in v7. You can use the `v7_relativeSplatPath` future flag
to opt-in early.
```

**Penyebab:**
Perubahan cara resolve relative routes di v7.

**Solusi:** ✅ SUDAH DIPERBAIKI

Sama dengan solusi di atas, tambahkan `v7_relativeSplatPath: true` di future flags.

---

## 🎛️ Controlled/Uncontrolled Component Warning

### Warning: Select changing from uncontrolled to controlled

**Pesan Error:**

```
Select is changing from uncontrolled to controlled. Components should not
switch from controlled to uncontrolled (or vice versa). Decide between using
a controlled or uncontrolled value for the lifetime of the component.
```

**Penyebab:**
Komponen `Select` memiliki `value={undefined}` di awal, lalu berubah menjadi string.

**Kode Bermasalah:**

```tsx
<Select
  value={selectedTestId ? String(selectedTestId) : undefined}
  onValueChange={(value) => setSelectedTestId(Number(value))}
>
```

**Solusi:** ✅ SUDAH DIPERBAIKI

Gunakan string kosong `""` instead of `undefined`:

```tsx
<Select
  value={selectedTestId ? String(selectedTestId) : ""}
  onValueChange={(value) => setSelectedTestId(Number(value))}
>
```

**File yang Diperbaiki:**

- `src/pages/guru/TestMonitoring.tsx` (line ~470)

---

## 📝 Checklist Perbaikan

- [x] React Router future flags ditambahkan
- [x] Select controlled/uncontrolled diperbaiki
- [x] Warning v7_startTransition resolved
- [x] Warning v7_relativeSplatPath resolved

---

## 🔍 Cara Cek Warning di Browser

1. Buka aplikasi di browser
2. Tekan `F12` untuk membuka Developer Tools
3. Buka tab **Console**
4. Lihat apakah masih ada warning kuning (⚠️)
5. Jika masih ada, laporkan dengan detail:
   - Screenshot warning
   - Halaman yang sedang dibuka
   - Langkah untuk reproduce

---

## 💡 Best Practices

### 1. Selalu Gunakan Controlled Components

**❌ Buruk:**

```tsx
<Select value={value || undefined}>
```

**✅ Baik:**

```tsx
<Select value={value || ""}>
```

### 2. Inisialisasi State dengan Nilai yang Tepat

**❌ Buruk:**

```tsx
const [selectedId, setSelectedId] = useState<number>();
// undefined di awal
```

**✅ Baik:**

```tsx
const [selectedId, setSelectedId] = useState<number | null>(null);
// null lebih explicit
```

atau

```tsx
const [selectedValue, setSelectedValue] = useState<string>("");
// string kosong untuk Select
```

### 3. Gunakan Future Flags untuk React Router

Selalu tambahkan future flags di `BrowserRouter` untuk kompatibilitas dengan v7:

```tsx
<BrowserRouter
  future={{
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  }}
>
```

---

## 🚨 Warning Lain yang Mungkin Muncul

### Hydration Mismatch (SSR apps)

**Solusi:**

- Pastikan HTML server dan client match
- Gunakan `useEffect` untuk logic yang bergantung pada browser API

### Missing Key Props

**Solusi:**

```tsx
{
  items.map((item) => <Component key={item.id} {...item} />);
}
```

### Deprecated Lifecycle Methods

**Solusi:**

- Ganti `componentWillMount` dengan `useEffect`
- Ganti `componentWillReceiveProps` dengan `useEffect` + dependencies

---

## 📞 Bantuan Lebih Lanjut

Jika masih mengalami warning:

1. Clear browser cache
2. Restart dev server: `npm run dev`
3. Check update dependencies: `npm outdated`
4. Baca dokumentasi:
   - [React Router v6](https://reactrouter.com/v6)
   - [Radix UI](https://www.radix-ui.com/)

---

**✅ Semua warning di atas sudah diperbaiki!**

_Last Updated: 7 November 2025_

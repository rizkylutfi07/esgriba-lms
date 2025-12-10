# 📥 Fitur Import Data Siswa

## Overview

Fitur ini memungkinkan admin untuk mengimport data siswa dalam jumlah besar menggunakan file Excel. Sistem menyediakan template Excel yang sudah terformat dan dapat diunduh.

---

## 🎯 Features

- ✅ Download template Excel terformat
- ✅ Import data siswa dari Excel
- ✅ Export data siswa ke Excel
- ✅ Validasi data otomatis
- ✅ Auto-create kelas dan jurusan jika belum ada
- ✅ Batch insert untuk performa optimal
- ✅ Error handling dan reporting
- ✅ Support multiple rows

---

## 📝 Format Template Excel

### Kolom yang Tersedia:

| Kolom    | Deskripsi                            | Wajib | Format                  |
| -------- | ------------------------------------ | ----- | ----------------------- |
| nama     | Nama lengkap siswa                   | Ya    | String (max 255)        |
| email    | Email siswa (harus unique)           | Ya    | Email valid             |
| nis      | Nomor Induk Siswa (harus unique)     | Tidak | String (max 50)         |
| password | Password (default: password123)      | Tidak | String (min 6)          |
| kelas    | Nama kelas (auto-create jika baru)   | Tidak | String (max 50)         |
| jurusan  | Nama jurusan (auto-create jika baru) | Tidak | String (max 100)        |
| status   | Status siswa                         | Tidak | aktif/nonaktif atau 1/0 |

### Contoh Data:

```
nama              | email                     | nis     | password    | kelas    | jurusan | status
Ahmad Rizki       | ahmad.rizki@example.com   | 2024001 | password123 | X MIPA 1 | IPA     | aktif
Siti Nurhaliza    | siti.nur@example.com      | 2024002 | password123 | X MIPA 2 | IPA     | aktif
Budi Santoso      | budi.santoso@example.com  | 2024003 | password123 | X IPS 1  | IPS     | aktif
```

---

## 🔌 API Endpoints

### 1. Download Template Excel

**Endpoint:** `GET /api/students/template`

**Authorization:** Bearer Token (Admin only)

**Response:** File Excel

**Example:**

```bash
curl -X GET "http://localhost:8000/api/students/template" \
  -H "Authorization: Bearer {token}" \
  --output template_import_siswa.xlsx
```

---

### 2. Import Data Siswa

**Endpoint:** `POST /api/students/import`

**Authorization:** Bearer Token (Admin only)

**Request:**

```
Content-Type: multipart/form-data

file: [Excel file]
```

**Response (Success):**

```json
{
  "message": "Import completed successfully",
  "stats": {
    "total": 50,
    "success": 50,
    "failed": 0
  }
}
```

**Response (With Errors - 207 Multi-Status):**

```json
{
  "message": "Import completed with some errors",
  "stats": {
    "total": 50,
    "success": 45,
    "failed": 5
  },
  "errors": [
    {
      "row": 10,
      "error": "Email sudah terdaftar",
      "data": {
        "nama": "Ahmad Test",
        "email": "ahmad@example.com"
      }
    }
  ]
}
```

**Response (Validation Error - 422):**

```json
{
  "message": "Validation errors in Excel file",
  "errors": [
    {
      "row": 3,
      "attribute": "email",
      "errors": ["Email sudah terdaftar"],
      "values": {
        "nama": "Test User",
        "email": "duplicate@example.com"
      }
    }
  ]
}
```

**Example (cURL):**

```bash
curl -X POST "http://localhost:8000/api/students/import" \
  -H "Authorization: Bearer {token}" \
  -F "file=@/path/to/data_siswa.xlsx"
```

**Example (JavaScript - Fetch):**

```javascript
const formData = new FormData();
formData.append("file", fileInput.files[0]);

fetch("http://localhost:8000/api/students/import", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
})
  .then((response) => response.json())
  .then((data) => {
    console.log("Import result:", data);
  });
```

---

### 3. Export Data Siswa

**Endpoint:** `GET /api/students/export`

**Authorization:** Bearer Token (Admin only)

**Query Parameters:**

| Parameter | Type    | Required | Description       |
| --------- | ------- | -------- | ----------------- |
| class_id  | integer | No       | Filter by kelas   |
| major_id  | integer | No       | Filter by jurusan |

**Response:** File Excel

**Example:**

```bash
# Export semua siswa
curl -X GET "http://localhost:8000/api/students/export" \
  -H "Authorization: Bearer {token}" \
  --output data_siswa.xlsx

# Export siswa kelas tertentu
curl -X GET "http://localhost:8000/api/students/export?class_id=1" \
  -H "Authorization: Bearer {token}" \
  --output data_siswa_kelas_1.xlsx

# Export siswa jurusan tertentu
curl -X GET "http://localhost:8000/api/students/export?major_id=2" \
  -H "Authorization: Bearer {token}" \
  --output data_siswa_ipa.xlsx
```

---

## 📋 Workflow Import

### 1. Download Template

```bash
GET /api/students/template
```

Download file `template_import_siswa.xlsx`

### 2. Isi Data di Excel

- Buka template di Excel/LibreOffice
- Hapus baris contoh (row 2-3)
- Isi data siswa sesuai format
- Pastikan email dan NIS unique
- Save file

### 3. Upload File

```bash
POST /api/students/import
Body: file=@data_siswa.xlsx
```

### 4. Check Result

- Jika `failed = 0`: Import berhasil semua
- Jika `failed > 0`: Ada error, cek detail di response

### 5. Fix Errors (jika ada)

- Buka Excel lagi
- Perbaiki data yang error
- Upload ulang

---

## ⚙️ Validasi Otomatis

### Validasi yang Dilakukan:

1. **Nama**: Wajib diisi, max 255 karakter
2. **Email**: Wajib diisi, format email valid, unique
3. **NIS**: Optional, unique jika diisi
4. **Password**: Minimal 6 karakter (default: password123)
5. **Status**: aktif/nonaktif atau 1/0

### Auto-Create Features:

- **Kelas**: Jika kelas belum ada, otomatis dibuat
- **Jurusan**: Jika jurusan belum ada, otomatis dibuat dengan code 3 huruf pertama
- **Password**: Jika tidak diisi, default `password123`
- **Status**: Jika tidak diisi, default `aktif`

---

## 🔒 Permission

Hanya **Admin** yang dapat:

- Download template
- Import data siswa
- Export data siswa

---

## ⚡ Performance

- **Batch Insert**: 100 rows per batch
- **Max File Size**: 2 MB
- **Supported Format**: .xlsx, .xls
- **Recommended**: Max 1000 rows per import

---

## 🐛 Error Handling

### Common Errors:

| Error                    | Cause                       | Solution                    |
| ------------------------ | --------------------------- | --------------------------- |
| Email sudah terdaftar    | Email duplicate di database | Gunakan email lain          |
| NIS sudah terdaftar      | NIS duplicate di database   | Gunakan NIS lain            |
| Format email tidak valid | Email format salah          | Perbaiki format email       |
| File too large           | File > 2 MB                 | Kurangi jumlah data         |
| Invalid file format      | Bukan file Excel            | Gunakan .xlsx atau .xls     |
| Validation errors        | Data tidak sesuai aturan    | Perbaiki data sesuai format |

---

## 💡 Best Practices

1. **Backup Data**: Backup database sebelum import besar
2. **Test Import**: Test dengan 5-10 rows dulu
3. **Clean Data**: Pastikan tidak ada spasi extra, format konsisten
4. **Unique Check**: Cek email dan NIS tidak duplicate
5. **Batch Import**: Untuk data > 1000, import per batch
6. **Verify Results**: Check import stats dan error messages

---

## 📊 Example Workflow

### Skenario: Import 100 Siswa Baru

```bash
# 1. Login sebagai Admin
curl -X POST http://localhost:8000/api/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'

# Response: { "access_token": "xxx..." }

# 2. Download Template
curl -X GET http://localhost:8000/api/students/template \
  -H "Authorization: Bearer xxx..." \
  --output template.xlsx

# 3. Edit template.xlsx dengan data 100 siswa

# 4. Import File
curl -X POST http://localhost:8000/api/students/import \
  -H "Authorization: Bearer xxx..." \
  -F "file=@template.xlsx"

# 5. Check Response
{
  "message": "Import completed successfully",
  "stats": {
    "total": 100,
    "success": 100,
    "failed": 0
  }
}

# 6. Verify di Database
curl -X GET "http://localhost:8000/api/users?role=siswa" \
  -H "Authorization: Bearer xxx..."
```

---

## 🔄 Update Data Siswa

**Note:** Import tidak support update. Untuk update data:

1. **Option 1**: Edit manual via API `PUT /api/users/{id}`
2. **Option 2**: Export → Edit → Delete old → Import new

---

## 📱 Frontend Integration

### React Example:

```jsx
import { useState } from "react";
import axios from "axios";

function StudentImport() {
  const [file, setFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState(null);

  const downloadTemplate = async () => {
    const response = await axios.get("/api/students/template", {
      responseType: "blob",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "template_import_siswa.xlsx");
    document.body.appendChild(link);
    link.click();
  };

  const handleImport = async () => {
    if (!file) return;

    setImporting(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("/api/students/import", formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      setResult(response.data);
      alert("Import berhasil!");
    } catch (error) {
      console.error("Import error:", error.response?.data);
      setResult(error.response?.data);
    } finally {
      setImporting(false);
    }
  };

  return (
    <div>
      <h2>Import Data Siswa</h2>

      <button onClick={downloadTemplate}>Download Template</button>

      <input
        type="file"
        accept=".xlsx,.xls"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <button onClick={handleImport} disabled={!file || importing}>
        {importing ? "Importing..." : "Import"}
      </button>

      {result && (
        <div>
          <h3>Result:</h3>
          <p>Success: {result.stats.success}</p>
          <p>Failed: {result.stats.failed}</p>
          {result.errors && (
            <ul>
              {result.errors.map((err, idx) => (
                <li key={idx}>
                  Row {err.row}: {err.error}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
```

---

## 📚 Related Documentation

- **User Management**: `API_DOCUMENTATION.md` → User Routes
- **Master Data**: Class, Major setup
- **Authentication**: Admin login & permissions

---

**Last Updated:** 4 November 2025

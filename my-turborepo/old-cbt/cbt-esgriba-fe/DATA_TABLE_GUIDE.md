# 📊 Data Table Implementation Guide

## Overview

Implementasi **TanStack Table (React Table v8)** dengan **Shadcn UI** untuk semua halaman data management:

- ✅ Data Guru (Teachers)
- ✅ Data Siswa (Students)
- ✅ Data Mata Pelajaran (Subjects)
- ✅ Data Kelas (Classes)

## Features

### ✨ Core Features

- **Sorting** - Klik header kolom untuk sort ascending/descending
- **Filtering** - Search box untuk filter data
- **Pagination** - Navigasi halaman dengan kontrol baris per halaman
- **Row Actions** - Dropdown menu untuk Edit/Delete/Detail
- **Responsive** - Mobile-friendly design
- **Dark Mode** - Full dark mode support

### 🎨 Visual Features

- **Badges** - Visual indicators untuk status, gender, dll
- **Icons** - Lucide icons untuk better UX
- **Hover Effects** - Interactive hover states
- **Color Coding** - Status-based colors (active/inactive, capacity, dll)

## File Structure

```
src/
├── components/
│   ├── data-table/
│   │   ├── data-table.tsx          # Main DataTable component (reusable)
│   │   ├── subjects-columns.tsx    # Mata Pelajaran columns
│   │   ├── students-columns.tsx    # Siswa columns
│   │   ├── teachers-columns.tsx    # Guru columns
│   │   └── classes-columns.tsx     # Kelas columns
│   └── ui/
│       ├── table.tsx
│       ├── badge.tsx
│       ├── dropdown-menu.tsx
│       └── button.tsx
└── pages/
    └── admin/
        ├── ManageSubjects.tsx      # Updated with DataTable
        ├── ManageStudents.tsx      # To be updated
        ├── ManageTeachers.tsx      # To be updated
        └── ManageClasses.tsx       # To be updated
```

## Usage Examples

### 1. Subjects (Mata Pelajaran)

```tsx
import { DataTable } from "@/components/data-table/data-table";
import {
  createSubjectsColumns,
  Subject,
} from "@/components/data-table/subjects-columns";

// In your component
const [subjects, setSubjects] = useState<Subject[]>([]);

// Render
<DataTable
  columns={createSubjectsColumns(
    (subject) => handleEdit(subject),
    (subject) => handleDelete(subject)
  )}
  data={subjects}
  searchKey="subject_name"
  searchPlaceholder="Cari mata pelajaran..."
/>;
```

### 2. Students (Siswa)

```tsx
import { DataTable } from "@/components/data-table/data-table";
import {
  createStudentsColumns,
  Student,
} from "@/components/data-table/students-columns";

<DataTable
  columns={createStudentsColumns(
    (student) => handleEdit(student),
    (student) => handleDelete(student),
    (student) => handleViewDetail(student) // Optional
  )}
  data={students}
  searchKey="name"
  searchPlaceholder="Cari siswa..."
/>;
```

### 3. Teachers (Guru)

```tsx
import { DataTable } from "@/components/data-table/data-table";
import {
  createTeachersColumns,
  Teacher,
} from "@/components/data-table/teachers-columns";

<DataTable
  columns={createTeachersColumns(
    (teacher) => handleEdit(teacher),
    (teacher) => handleDelete(teacher)
  )}
  data={teachers}
  searchKey="name"
  searchPlaceholder="Cari guru..."
/>;
```

### 4. Classes (Kelas)

```tsx
import { DataTable } from "@/components/data-table/data-table";
import {
  createClassesColumns,
  Class,
} from "@/components/data-table/classes-columns";

<DataTable
  columns={createClassesColumns(
    (classData) => handleEdit(classData),
    (classData) => handleDelete(classData)
  )}
  data={classes}
  searchKey="class_name"
  searchPlaceholder="Cari kelas..."
/>;
```

## Column Definitions

### Subjects Columns

| Column           | Type     | Sortable | Features             |
| ---------------- | -------- | -------- | -------------------- |
| subject_name     | Text     | ✅       | Bold text, dark mode |
| subject_code     | Badge    | ✅       | Monospace font       |
| major.major_name | Text     | ❌       | Shows "Umum" if null |
| description      | Text     | ❌       | Truncated to 300px   |
| actions          | Dropdown | ❌       | Edit, Delete         |

### Students Columns

| Column           | Type     | Sortable | Features                     |
| ---------------- | -------- | -------- | ---------------------------- |
| name             | Text     | ✅       | Bold text                    |
| nisn             | Text     | ❌       | Monospace font               |
| nis              | Text     | ❌       | Monospace font               |
| class.class_name | Badge    | ❌       | Outline badge                |
| major.major_name | Text     | ❌       | -                            |
| gender           | Badge    | ❌       | Color-coded (L=blue, P=pink) |
| actions          | Dropdown | ❌       | Detail, Edit, Delete         |

### Teachers Columns

| Column   | Type        | Sortable | Features              |
| -------- | ----------- | -------- | --------------------- |
| name     | Text        | ✅       | Bold text             |
| nip      | Text        | ❌       | Monospace font        |
| email    | Text + Icon | ❌       | Mail icon             |
| phone    | Text + Icon | ❌       | Phone icon            |
| subjects | Badges      | ❌       | Shows first 2 + count |
| actions  | Dropdown    | ❌       | Edit, Delete          |

### Classes Columns

| Column           | Type         | Sortable | Features                    |
| ---------------- | ------------ | -------- | --------------------------- |
| class_name       | Text         | ✅       | Bold text                   |
| major.major_name | Badge        | ❌       | Outline badge               |
| homeroom_teacher | Text         | ❌       | -                           |
| students         | Text + Badge | ❌       | Count/capacity + percentage |
| is_active        | Badge        | ❌       | Green=active, Gray=inactive |
| actions          | Dropdown     | ❌       | Edit, Delete                |

## Customization

### Adding New Columns

```tsx
{
  accessorKey: "new_field",
  header: ({ column }) => {
    return (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="hover:bg-slate-100 dark:hover:bg-slate-800"
      >
        Field Name
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    );
  },
  cell: ({ row }) => (
    <div className="text-slate-900 dark:text-white">
      {row.getValue("new_field")}
    </div>
  ),
}
```

### Custom Cell Rendering

```tsx
cell: ({ row }) => {
  const value = row.getValue("field_name");
  // Custom logic
  return <Badge variant={value > 50 ? "default" : "secondary"}>{value}</Badge>;
};
```

### Nested Data Access

```tsx
{
  accessorKey: "user.profile.name", // Access nested data
  header: "Profile Name",
  cell: ({ row }) => row.original.user?.profile?.name || "-"
}
```

## Pagination Controls

**Default Settings:**

- Rows per page: 10, 20, 30, 40, 50
- Initial page size: 10
- Shows: First, Previous, Next, Last buttons

**Customizing Page Size:**

```tsx
// In data-table.tsx, modify the select options
<select>
  {[5, 10, 25, 50, 100].map((pageSize) => (
    <option key={pageSize} value={pageSize}>
      {pageSize}
    </option>
  ))}
</select>
```

## Styling Guide

### Dark Mode Classes

**Background:**

```tsx
className = "bg-white dark:bg-slate-900";
```

**Text:**

```tsx
// Primary text
className = "text-slate-900 dark:text-white";

// Secondary text
className = "text-slate-600 dark:text-slate-400";
```

**Borders:**

```tsx
className = "border-slate-200 dark:border-slate-700";
```

**Hover:**

```tsx
className = "hover:bg-slate-100 dark:hover:bg-slate-800";
```

### Badge Variants

```tsx
// Default (primary color)
<Badge variant="default">Active</Badge>

// Secondary (gray)
<Badge variant="secondary">Inactive</Badge>

// Destructive (red)
<Badge variant="destructive">Error</Badge>

// Outline (border only)
<Badge variant="outline">Info</Badge>
```

## Performance Tips

### 1. Memoize Columns

```tsx
const columns = useMemo(
  () => createSubjectsColumns(handleEdit, handleDelete),
  [handleEdit, handleDelete]
);
```

### 2. Virtualization (for large datasets)

For 1000+ rows, consider adding virtualization:

```bash
npm install @tanstack/react-virtual
```

### 3. Server-Side Pagination

For very large datasets, implement server-side:

```tsx
const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

useEffect(() => {
  fetchData(pagination.pageIndex, pagination.pageSize);
}, [pagination]);
```

## Troubleshooting

### Issue: "Cannot read property 'map' of undefined"

**Solution:** Ensure data prop is always an array

```tsx
data={subjects || []}
```

### Issue: Search not working

**Solution:** Check searchKey matches column accessorKey

```tsx
// Column definition
accessorKey: "subject_name";

// DataTable prop
searchKey = "subject_name"; // ✅ Must match
```

### Issue: Dark mode colors not applying

**Solution:** Ensure Tailwind dark mode is configured

```js
// tailwind.config.js
module.exports = {
  darkMode: ["class"],
  // ...
};
```

### Issue: Icons not showing

**Solution:** Install lucide-react

```bash
npm install lucide-react
```

## Migration Checklist

### From Old Table to DataTable

- [ ] Install @tanstack/react-table
- [ ] Create column definitions file
- [ ] Update imports in page component
- [ ] Replace `<Table>` with `<DataTable>`
- [ ] Update interface types to match column definitions
- [ ] Test sorting functionality
- [ ] Test search/filter
- [ ] Test pagination
- [ ] Test action buttons (Edit/Delete)
- [ ] Verify dark mode styling
- [ ] Test on mobile devices

## Next Steps

1. **Update ManageStudents.tsx** with DataTable
2. **Update ManageTeachers.tsx** with DataTable
3. **Update ManageClasses.tsx** with DataTable
4. Add export/print functionality
5. Add bulk actions (select multiple rows)
6. Add column visibility toggle
7. Add advanced filters

## Resources

- [TanStack Table Docs](https://tanstack.com/table/v8/docs/introduction)
- [Shadcn Data Table](https://ui.shadcn.com/docs/components/data-table)
- [Lucide Icons](https://lucide.dev/icons/)

---

**Status**: ManageSubjects ✅ COMPLETED  
**Next**: ManageStudents, ManageTeachers, ManageClasses  
**Created**: November 4, 2025

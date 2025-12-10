# 🚀 Data Table Quick Reference

## Copy-Paste Template

### For Subjects

```tsx
import { DataTable } from "@/components/data-table/data-table";
import {
  createSubjectsColumns,
  Subject,
} from "@/components/data-table/subjects-columns";

<DataTable
  columns={createSubjectsColumns(handleEdit, handleDelete)}
  data={subjects}
  searchKey="subject_name"
  searchPlaceholder="Cari mata pelajaran..."
/>;
```

### For Students

```tsx
import { DataTable } from "@/components/data-table/data-table";
import {
  createStudentsColumns,
  Student,
} from "@/components/data-table/students-columns";

<DataTable
  columns={createStudentsColumns(handleEdit, handleDelete, handleViewDetail)}
  data={students}
  searchKey="name"
  searchPlaceholder="Cari siswa..."
/>;
```

### For Teachers

```tsx
import { DataTable } from "@/components/data-table/data-table";
import {
  createTeachersColumns,
  Teacher,
} from "@/components/data-table/teachers-columns";

<DataTable
  columns={createTeachersColumns(handleEdit, handleDelete)}
  data={teachers}
  searchKey="name"
  searchPlaceholder="Cari guru..."
/>;
```

### For Classes

```tsx
import { DataTable } from "@/components/data-table/data-table";
import {
  createClassesColumns,
  Class,
} from "@/components/data-table/classes-columns";

<DataTable
  columns={createClassesColumns(handleEdit, handleDelete)}
  data={classes}
  searchKey="class_name"
  searchPlaceholder="Cari kelas..."
/>;
```

## Common searchKey Values

- `"name"` - For teachers, students
- `"subject_name"` - For subjects
- `"class_name"` - For classes
- `"major_name"` - For majors

## Dark Mode Classes Cheatsheet

```tsx
// Background
bg-white dark:bg-slate-900

// Text Primary
text-slate-900 dark:text-white

// Text Secondary
text-slate-600 dark:text-slate-400

// Border
border-slate-200 dark:border-slate-700

// Hover
hover:bg-slate-100 dark:hover:bg-slate-800
```

## Badge Variants

```tsx
<Badge variant="default">Blue</Badge>
<Badge variant="secondary">Gray</Badge>
<Badge variant="destructive">Red</Badge>
<Badge variant="outline">Border only</Badge>
```

## Column Template

```tsx
{
  accessorKey: "field_name",
  header: ({ column }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
    >
      Header Text
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  ),
  cell: ({ row }) => (
    <div className="text-slate-900 dark:text-white">
      {row.getValue("field_name")}
    </div>
  ),
}
```

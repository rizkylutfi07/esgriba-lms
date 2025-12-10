import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export type Class = {
  id: number;
  class_name: string;
  capacity?: number;
  homeroom_teacher?: string;
  major?: {
    id: number;
    major_name: string;
  };
  students_count?: number;
  is_active?: boolean;
};

export const createClassesColumns = (
  onEdit: (classData: Class) => void,
  onDelete: (classData: Class) => void
): ColumnDef<Class>[] => [
  {
    accessorKey: "class_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm p-1 sm:p-4 h-auto"
        >
          Nama Kelas
          <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm min-w-[110px] max-w-[180px] sm:max-w-none">
        <div className="truncate">{row.getValue("class_name")}</div>
        <div className="text-[10px] sm:hidden text-slate-500 dark:text-slate-400 truncate mt-0.5">
          {row.original.major?.major_name || "-"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "major.major_name",
    header: () => (
      <div className="text-xs sm:text-sm hidden md:table-cell">Jurusan</div>
    ),
    cell: ({ row }) => {
      const major = row.original.major;
      return (
        <Badge
          variant="outline"
          className="dark:border-slate-600 dark:text-slate-300 hidden md:inline-flex"
        >
          {major ? major.major_name : "-"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "homeroom_teacher",
    header: () => (
      <div className="text-xs sm:text-sm hidden lg:table-cell">Wali Kelas</div>
    ),
    cell: ({ row }) => {
      const teacher = row.getValue("homeroom_teacher") as string;
      return (
        <span className="text-slate-600 dark:text-slate-400 hidden lg:inline">
          {teacher || "-"}
        </span>
      );
    },
  },
  {
    id: "students",
    header: () => (
      <div className="text-xs sm:text-sm hidden md:table-cell">Siswa</div>
    ),
    cell: ({ row }) => {
      const count = row.original.students_count || 0;
      const capacity = row.original.capacity || 0;
      const percentage = capacity > 0 ? (count / capacity) * 100 : 0;

      return (
        <div className="hidden md:flex items-center gap-2">
          <Users className="h-4 w-4 text-slate-400" />
          <span className="text-xs sm:text-sm text-slate-900 dark:text-white">
            {count}
            {capacity > 0 && (
              <span className="text-slate-500 dark:text-slate-400">
                /{capacity}
              </span>
            )}
          </span>
          {capacity > 0 && (
            <Badge
              variant={
                percentage >= 100
                  ? "destructive"
                  : percentage >= 80
                  ? "secondary"
                  : "outline"
              }
              className="text-[10px]"
            >
              {percentage.toFixed(0)}%
            </Badge>
          )}
        </div>
      );
    },
  },

  {
    id: "actions",
    header: () => <div className="text-xs sm:text-sm text-center">Aksi</div>,
    cell: ({ row }) => {
      const classData = row.original;

      return (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 w-36"
            >
              <DropdownMenuLabel className="dark:text-white text-xs">
                Aksi
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-slate-200 dark:bg-slate-700" />
              <DropdownMenuItem
                onClick={() => onEdit(classData)}
                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-200 text-xs"
              >
                <Pencil className="mr-2 h-3 w-3" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(classData)}
                className="cursor-pointer text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 text-xs"
              >
                <Trash2 className="mr-2 h-3 w-3" />
                Hapus
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];

import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2, Eye, Power } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export type Student = {
  id: number;
  name: string;
  email: string;
  nisn?: string;
  nis?: string;
  gender?: string;
  is_active?: boolean;
  class?: {
    id: number;
    class_name: string;
  };
  major?: {
    id: number;
    name: string;
  };
};

export const createStudentsColumns = (
  onEdit: (student: Student) => void,
  onDelete: (student: Student) => void,
  onViewDetail?: (student: Student) => void,
  onToggleActive?: (student: Student) => void
): ColumnDef<Student>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm p-1 sm:p-4 h-auto"
        >
          Nama Siswa
          <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm min-w-[110px] max-w-[160px] sm:max-w-none">
        <div className="truncate">{row.getValue("name")}</div>
        <div className="text-[10px] sm:hidden text-slate-500 dark:text-slate-400 truncate mt-0.5">
          {row.original.nisn || row.original.nis || "-"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "nisn",
    header: () => (
      <div className="text-xs sm:text-sm hidden sm:table-cell">NISN</div>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs sm:text-sm text-slate-600 dark:text-slate-400 hidden sm:table-cell">
        {row.getValue("nisn") || "-"}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: () => (
      <div className="text-xs sm:text-sm hidden md:table-cell">email</div>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs sm:text-sm text-slate-600 dark:text-slate-400 hidden md:table-cell">
        {row.getValue("email") || "-"}
      </span>
    ),
  },
  {
    accessorKey: "class.class_name",
    header: () => (
      <div className="text-xs sm:text-sm hidden md:table-cell">Kelas</div>
    ),
    cell: ({ row }) => {
      const classData = row.original.class;
      return (
        <Badge
          variant="outline"
          className="dark:border-slate-600 dark:text-slate-300 hidden md:inline-flex"
        >
          {classData ? classData.class_name : "-"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "major.major_name",
    header: () => (
      <div className="text-xs sm:text-sm hidden lg:table-cell">Jurusan</div>
    ),
    cell: ({ row }) => {
      const major = row.original.major;
      return (
        <span className="text-slate-600 dark:text-slate-400 hidden lg:inline">
          {major ? major.name : "-"}
        </span>
      );
    },
  },
  {
    accessorKey: "gender",
    header: () => (
      <div className="text-xs sm:text-sm hidden md:table-cell">JK</div>
    ),
    cell: ({ row }) => {
      const gender = row.getValue("gender") as string;
      return (
        <Badge
          variant={gender === "L" ? "default" : "secondary"}
          className="dark:border-slate-600 hidden md:inline-flex"
        >
          {gender === "L" ? "L" : gender === "P" ? "P" : "-"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: () => (
      <div className="text-xs sm:text-sm hidden lg:table-cell">Status</div>
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean;
      return (
        <Badge
          variant={isActive ? "default" : "secondary"}
          className={`hidden lg:inline-flex ${
            isActive 
              ? "bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-100" 
              : "bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-100"
          }`}
        >
          {isActive ? "Aktif" : "Nonaktif"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-xs sm:text-sm text-center">Aksi</div>,
    cell: ({ row }) => {
      const student = row.original;

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
              {onViewDetail && (
                <DropdownMenuItem
                  onClick={() => onViewDetail(student)}
                  className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-200 text-xs"
                >
                  <Eye className="mr-2 h-3 w-3" />
                  Detail
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onEdit(student)}
                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-200 text-xs"
              >
                <Pencil className="mr-2 h-3 w-3" />
                Edit
              </DropdownMenuItem>
              {onToggleActive && (
                <DropdownMenuItem
                  onClick={() => onToggleActive(student)}
                  className={`cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-xs ${
                    student.is_active 
                      ? "text-orange-600 dark:text-orange-400" 
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  <Power className="mr-2 h-3 w-3" />
                  {student.is_active ? "Nonaktifkan" : "Aktifkan"}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(student)}
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

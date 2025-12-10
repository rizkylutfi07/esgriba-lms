import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export type Subject = {
  id: number;
  subject_name: string;
  subject_code: string;
  description?: string;
  major_id?: number;
  major?: {
    id: number;
    code: string;
    name: string;
    major_name: string;
  };
};

export const createSubjectsColumns = (
  onEdit: (subject: Subject) => void,
  onDelete: (subject: Subject) => void
): ColumnDef<Subject>[] => [
  {
    accessorKey: "subject_name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm p-1 sm:p-4 h-auto"
        >
          Nama Mata Pelajaran
          <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm min-w-[110px] max-w-[200px] sm:max-w-none">
        <div className="truncate">{row.getValue("subject_name")}</div>
        <div className="text-[10px] sm:hidden text-slate-500 dark:text-slate-400 truncate mt-0.5">
          {row.original.subject_code}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "subject_code",
    header: ({ column }) => {
      return (
        <div className="hidden sm:block">
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            Kode
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </div>
      );
    },
    cell: ({ row }) => (
      <Badge
        variant="outline"
        className="font-mono dark:border-slate-600 dark:text-slate-300 hidden sm:inline-flex"
      >
        {row.getValue("subject_code")}
      </Badge>
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
        <span className="text-slate-600 dark:text-slate-400 hidden md:inline">
          {major ? major.major_name || major.name : "Umum"}
        </span>
      );
    },
  },
  {
    accessorKey: "description",
    header: () => (
      <div className="text-xs sm:text-sm hidden lg:table-cell">Deskripsi</div>
    ),
    cell: ({ row }) => (
      <div className="max-w-[300px] truncate text-slate-600 dark:text-slate-400 hidden lg:block">
        {row.getValue("description") || "-"}
      </div>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-xs sm:text-sm text-center">Aksi</div>,
    cell: ({ row }) => {
      const subject = row.original;

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
                onClick={() => onEdit(subject)}
                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-200 text-xs"
              >
                <Pencil className="mr-2 h-3 w-3" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(subject)}
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

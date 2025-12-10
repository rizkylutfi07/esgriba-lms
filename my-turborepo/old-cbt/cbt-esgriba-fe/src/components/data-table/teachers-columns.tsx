import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  MoreHorizontal,
  Pencil,
  Trash2,
  Mail,
  Phone,
  Power,
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

export type Teacher = {
  id: number;
  name: string;
  email: string;
  nip?: string;
  phone?: string;
  is_active?: boolean;
  subjects?: Array<{
    id: number;
    name: string;
  }>;
};

export const createTeachersColumns = (
  onEdit: (teacher: Teacher) => void,
  onDelete: (teacher: Teacher) => void,
  onToggleActive?: (teacher: Teacher) => void
): ColumnDef<Teacher>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="hover:bg-slate-100 dark:hover:bg-slate-800 text-xs sm:text-sm p-1 sm:p-4 h-auto"
        >
          Nama Guru
          <ArrowUpDown className="ml-1 sm:ml-2 h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      );
    },
    cell: ({ row }) => (
      <div className="font-medium text-slate-900 dark:text-white text-xs sm:text-sm min-w-[100px] max-w-[150px] sm:max-w-none">
        <div className="truncate">{row.getValue("name")}</div>
        <div className="text-[10px] sm:hidden text-slate-500 dark:text-slate-400 truncate mt-0.5">
          {row.original.email || "Tidak ada Email"}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "nip",
    header: () => (
      <div className="text-xs sm:text-sm hidden sm:table-cell">NIP</div>
    ),
    cell: ({ row }) => (
      <span className="font-mono text-xs sm:text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap hidden sm:table-cell">
        {row.getValue("nip") || "-"}
      </span>
    ),
  },
  {
    accessorKey: "email",
    header: () => (
      <div className="text-xs sm:text-sm hidden md:table-cell">Email</div>
    ),
    cell: ({ row }) => (
      <div className="items-center gap-1 text-slate-600 dark:text-slate-400 min-w-[120px] max-w-[180px] hidden md:flex">
        <Mail className="h-3 w-3 flex-shrink-0" />
        <span className="text-xs sm:text-sm">{row.getValue("email")}</span>
      </div>
    ),
  },
  {
    accessorKey: "phone",
    header: () => (
      <div className="text-xs sm:text-sm hidden md:block">No. Telepon</div>
    ),
    cell: ({ row }) => {
      const phone = row.getValue("phone") as string;
      return phone ? (
        <div className="items-center gap-1 text-slate-600 dark:text-slate-400 hidden md:flex">
          <Phone className="h-3 w-3" />
          <span className="text-xs sm:text-sm whitespace-nowrap">{phone}</span>
        </div>
      ) : (
        <span className="text-slate-400 dark:text-slate-600 hidden md:inline">
          -
        </span>
      );
    },
  },
  {
    id: "subjects",
    header: () => (
      <div className="text-xs sm:text-sm hidden lg:block">Mata Pelajaran</div>
    ),
    cell: ({ row }) => {
      const subjects = row.original.subjects;
      if (!subjects || subjects.length === 0) {
        return (
          <span className="text-slate-400 dark:text-slate-600 hidden lg:inline">
            -
          </span>
        );
      }
      return (
        <div className="hidden lg:flex flex-wrap gap-1 max-w-[200px]">
          {subjects.slice(0, 4).map((subject) => (
            <Badge
              key={subject.id}
              variant="outline"
              className="text-xs dark:border-slate-600 dark:text-slate-300"
            >
              {subject.name}
            </Badge>
          ))}
          {subjects.length > 4 && (
            <Badge
              variant="secondary"
              className="text-xs dark:bg-slate-700 dark:text-slate-300"
            >
              +{subjects.length - 4}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "is_active",
    header: () => (
      <div className="text-xs sm:text-sm hidden md:table-cell">Status</div>
    ),
    cell: ({ row }) => {
      const isActive = row.getValue("is_active") as boolean;
      return (
        <Badge
          variant={isActive ? "default" : "secondary"}
          className={`hidden md:inline-flex ${
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
      const teacher = row.original;

      return (
        <div className="flex justify-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8 sm:h-8 sm:w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
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
                onClick={() => onEdit(teacher)}
                className="cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-200 text-xs"
              >
                <Pencil className="mr-2 h-3 w-3" />
                Edit
              </DropdownMenuItem>
              {onToggleActive && (
                <DropdownMenuItem
                  onClick={() => onToggleActive(teacher)}
                  className={`cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-xs ${
                    teacher.is_active 
                      ? "text-orange-600 dark:text-orange-400" 
                      : "text-green-600 dark:text-green-400"
                  }`}
                >
                  <Power className="mr-2 h-3 w-3" />
                  {teacher.is_active ? "Nonaktifkan" : "Aktifkan"}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => onDelete(teacher)}
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

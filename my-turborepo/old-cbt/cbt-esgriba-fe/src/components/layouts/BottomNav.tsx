import { Link, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  FileText,
  User,
  LayoutDashboard,
  MoreHorizontal,
  BookAIcon,
} from "lucide-react";
import { useAuthStore } from "../../store/authStore";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

export default function BottomNav() {
  const location = useLocation();
  const { user } = useAuthStore();

  type NavItem = {
    path: string;
    icon: any;
    label: string;
    badgeCount?: number;
    badgeDot?: boolean;
  };

  const getNavItems = (): NavItem[] => {
    if (!user) return [];

    const commonItems: NavItem[] = [
      {
        path: "/",
        icon: Home,
        label: "Home",
      },
    ];

    switch (user.role) {
      case "admin":
        return [
          ...commonItems,
          { path: "/teachers", icon: User, label: "Guru" },
          { path: "/students", icon: User, label: "Siswa" },
          { path: "/tests", icon: FileText, label: "Ujian" },
          { path: "/monitoring", icon: LayoutDashboard, label: "monitoring" },
          { path: "/subjects", icon: BookOpen, label: "Mapel" },
        ];
      case "guru":
        return [
          ...commonItems,
          { path: "/tests", icon: FileText, label: "Ujian" },
          { path: "/question-packages", icon: BookOpen, label: "Paket Soal" },
          { path: "/question-bank", icon: BookAIcon, label: "Bank Soal" },
        ];

      case "siswa":
        return [
          ...commonItems,
          { path: "/tests", icon: FileText, label: "Ujian" },
        ];
      default:
        return commonItems;
    }
  };

  const navItems = getNavItems();
  // Consider nested routes active (e.g., /tests/123 keeps "Ujian" active)
  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(path);

  const maybeVibrate = () => {
    if (typeof window !== "undefined" && "vibrate" in navigator) {
      try {
        (navigator as any).vibrate?.(10);
      } catch {}
    }
  };

  const MAX_VISIBLE = 4;
  const needsMore = navItems.length > 5;
  const visibleItems = needsMore ? navItems.slice(0, MAX_VISIBLE) : navItems;
  const overflowItems = needsMore ? navItems.slice(MAX_VISIBLE) : [];

  // Fixed grid columns for stable mobile layout
  const gridColsClass = needsMore
    ? "grid-cols-5"
    : navItems.length === 1
    ? "grid-cols-1"
    : navItems.length === 2
    ? "grid-cols-2"
    : navItems.length === 3
    ? "grid-cols-3"
    : navItems.length === 4
    ? "grid-cols-4"
    : "grid-cols-5";

  return (
    <nav
      className="lg:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-slate-200/50 dark:border-slate-800/60 pb-safe backdrop-blur supports-[backdrop-filter]:bg-white/75 dark:supports-[backdrop-filter]:bg-slate-900/60 w-full overflow-x-hidden"
      role="navigation"
      aria-label="Bottom Navigation"
    >
      <div className="w-full">
        <div className={`grid ${gridColsClass} gap-1 px-2 py-2 w-full`}>
          {visibleItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`
                flex flex-col items-center justify-center py-2 px-3 rounded-xl
                transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50
                ${
                  active
                    ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-lg"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60"
                }
              `}
                aria-current={active ? "page" : undefined}
                onClick={maybeVibrate}
              >
                <span className="relative inline-flex">
                  <Icon className="w-5 h-5 mb-1" />
                  {(item.badgeCount && item.badgeCount > 0) || item.badgeDot ? (
                    <span
                      className={`absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full ${
                        item.badgeCount && item.badgeCount > 0
                          ? "bg-red-600 text-white text-[10px] min-w-[16px] h-[16px] px-1"
                          : "bg-red-600 w-2 h-2"
                      }`}
                    >
                      {item.badgeCount && item.badgeCount > 0
                        ? item.badgeCount
                        : null}
                    </span>
                  ) : null}
                </span>
                <span className="text-[11px] leading-none font-medium truncate max-w-[6rem]">
                  {item.label}
                </span>
              </Link>
            );
          })}

          {needsMore && (
            <Sheet>
              <SheetTrigger asChild>
                <button
                  className="flex flex-col items-center justify-center py-2 px-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/50"
                  onClick={maybeVibrate}
                >
                  <MoreHorizontal className="w-5 h-5 mb-1" />
                  <span className="text-[11px] leading-none font-medium">
                    More
                  </span>
                </button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="max-h-[70vh] overflow-y-auto"
              >
                <SheetHeader>
                  <SheetTitle>Menu Lainnya</SheetTitle>
                </SheetHeader>
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {overflowItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.path}
                        to={item.path}
                        className="flex flex-col items-center justify-center rounded-xl p-3 hover:bg-slate-100 dark:hover:bg-slate-800"
                        onClick={maybeVibrate}
                      >
                        <span className="relative inline-flex">
                          <Icon className="w-6 h-6" />
                          {(item.badgeCount && item.badgeCount > 0) ||
                          item.badgeDot ? (
                            <span
                              className={`absolute -top-1 -right-1 inline-flex items-center justify-center rounded-full ${
                                item.badgeCount && item.badgeCount > 0
                                  ? "bg-red-600 text-white text-[10px] min-w-[16px] h-[16px] px-1"
                                  : "bg-red-600 w-2 h-2"
                              }`}
                            >
                              {item.badgeCount && item.badgeCount > 0
                                ? item.badgeCount
                                : null}
                            </span>
                          ) : null}
                        </span>
                        <span className="mt-1.5 text-xs font-medium text-center line-clamp-2">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </nav>
  );
}

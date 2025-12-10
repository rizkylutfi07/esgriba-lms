import { useAuthStore } from "@/store/authStore";
import { useNavigate } from "react-router-dom";
import { LogOut, User, Bell, Sun, Moon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useTheme } from "../theme-provider";

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  return (
    <header className="glass sticky top-0 z-40 border-b border-slate-200/50 dark:border-slate-700/50 dark:bg-slate-900/90">
      <div className="px-4 md:px-6 py-3 md:py-4 flex items-center justify-between">
        {/* Left: School Info */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img
              src="/logo website.png"
              alt="Logo SMKS PGRI Banyuputih"
              className="w-full h-full object-contain"
            />
          </div>
          <div className="hidden md:block">
            <div className="text-xs font-medium text-slate-500 dark:text-slate-400">
              SMKS PGRI BANYUPUTIH
            </div>
            <div className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Computer Based Test
            </div>
          </div>
        </div>

        {/* Center: Greeting (hidden on mobile) */}
        <div className="hidden lg:block">
          <div className="text-sm font-medium text-slate-600 dark:text-slate-300">
            {getGreeting()},{" "}
            <span className="text-blue-600 dark:text-blue-400 font-semibold">
              {user?.name}
            </span>{" "}
            👋
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-9 h-9 md:w-10 md:h-10 rounded-xl hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            ) : (
              <Moon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
            )}
          </button>

          {/* User Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-2 md:gap-3 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 rounded-xl p-1.5 md:p-2 transition-all">
                <div className="hidden sm:block text-right">
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                    {user?.name}
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                    {user?.role}
                  </div>
                </div>
                <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 flex items-center justify-center text-white font-bold shadow-md">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="end"
              className="w-56 glass dark:bg-slate-900 dark:border-slate-700"
            >
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">
                    {user?.name}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">
                    {user?.role}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Keluar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

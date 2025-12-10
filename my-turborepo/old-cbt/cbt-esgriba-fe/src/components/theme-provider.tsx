import { createContext, useContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
  forceLightMode?: boolean;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: "system",
  setTheme: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = "system",
  storageKey = "vite-ui-theme",
  forceLightMode = false,
  ...props
}: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(() => {
    if (forceLightMode) {
      return "light";
    }

    if (typeof window === "undefined") {
      return defaultTheme;
    }

    return (localStorage.getItem(storageKey) as Theme) || defaultTheme;
  });

  useEffect(() => {
    const root = window.document.documentElement;

    root.classList.remove("light", "dark");

    if (forceLightMode) {
      root.classList.add("light");
      localStorage.setItem(storageKey, "light");

      if (theme !== "light") {
        setThemeState("light");
      }

      return;
    }

    if (theme === "system") {
      const checkTime = () => {
        const hour = new Date().getHours();
        // Day is from 6 AM (inclusive) to 6 PM (exclusive)
        // Siang: 06:00 - 17:59 -> Light Mode
        // Malam: 18:00 - 05:59 -> Dark Mode
        const isDay = hour >= 6 && hour < 18;
        const timeBasedTheme = isDay ? "light" : "dark";

        root.classList.remove("light", "dark");
        root.classList.add(timeBasedTheme);
      };

      checkTime(); // Initial check

      // Check every minute to update automatically if the time crosses the boundary
      const interval = setInterval(checkTime, 60 * 1000);

      return () => clearInterval(interval);
    }

    root.classList.add(theme);
  }, [theme, forceLightMode, storageKey]);

  const value = {
    theme,
    setTheme: (newTheme: Theme) => {
      if (forceLightMode) {
        localStorage.setItem(storageKey, "light");
        setThemeState("light");
        return;
      }

      localStorage.setItem(storageKey, newTheme);
      setThemeState(newTheme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error("useTheme must be used within a ThemeProvider");

  return context;
};

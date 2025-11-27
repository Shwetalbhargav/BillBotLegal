// Testimonials.jsx (Soft-UI Refactor)
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/// ---------------------------------------------------------------------------
// Theme context
// ---------------------------------------------------------------------------

const ThemeContext = createContext({
  theme: "light",
  setTheme: () => {},
  toggleTheme: () => {},
});

export function useTheme() {
  return useContext(ThemeContext);
}

function getInitialTheme() {
  if (typeof window === "undefined") return "light";

  // 1) localStorage first
  const stored = window.localStorage.getItem("theme");
  if (stored === "light" || stored === "dark") return stored;

  // 2) system preference
  const prefersDark = window.matchMedia?.("(prefers-color-scheme: dark)")?.matches;
  return prefersDark ? "dark" : "light";
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(getInitialTheme);

  // Apply theme to <html> class (Tailwind "dark" mode)
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    window.localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));

  const value = useMemo(
    () => ({ theme, setTheme, toggleTheme }),
    [theme]
  );

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// ---------------------------------------------------------------------------
// Theme Switch button used in NavBar
// ---------------------------------------------------------------------------

export function ThemeSwitch({ className = "" }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`
        inline-flex items-center gap-2 rounded-2xl px-3 py-1.5 text-sm
        border border-gray-200/70 bg-white/70 hover:bg-white
        text-gray-800 shadow-sm
        dark:border-white/10 dark:bg-gray-800 dark:text-gray-100
        focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60
        ${className}
      `}
      title="Toggle theme"
      aria-label="Toggle theme"
    >
      <span className="text-lg" aria-hidden="true">
        {theme === "dark" ? "🌙" : "☀️"}
      </span>
      <span className="hidden sm:inline">
        {theme === "dark" ? "Dark" : "Light"}
      </span>
    </button>
  );
}
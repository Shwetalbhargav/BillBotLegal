import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import "../../styles/tokens.css";

const ThemeCtx = createContext(null);

export function ThemeProvider({ children, defaultTheme = "light" }) {
  const [theme, setTheme] = useState(() => {
    const saved = typeof window !== "undefined" ? localStorage.getItem("lb-theme") : null;
    return saved || defaultTheme;
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme === "dark" ? "dark" : "light");
    localStorage.setItem("lb-theme", theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme, toggle: () => setTheme(t => (t === "dark" ? "light" : "dark")) }), [theme]);

  return <ThemeCtx.Provider value={value}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeCtx);
  if (!ctx) throw new Error("useTheme must be used within <ThemeProvider>");
  return ctx;
}

export default ThemeProvider;

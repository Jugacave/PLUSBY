import { create } from "zustand";

type Theme = "dark" | "light";

interface ThemeStore {
  theme: Theme;
  toggle: () => void;
  setTheme: (t: Theme) => void;
  init: () => void;
}

function applyTheme(theme: Theme) {
  const html = document.documentElement;
  html.classList.remove("dark", "light");
  html.classList.add(theme);
  localStorage.setItem("plusby-theme", theme);
}

export const useThemeStore = create<ThemeStore>((set) => ({
  theme: "dark",
  init() {
    const saved = localStorage.getItem("plusby-theme") as Theme | null;
    const resolved: Theme = saved === "light" ? "light" : "dark";
    applyTheme(resolved);
    set({ theme: resolved });
  },
  toggle() {
    set((state) => {
      const next: Theme = state.theme === "dark" ? "light" : "dark";
      applyTheme(next);
      return { theme: next };
    });
  },
  setTheme(t) {
    applyTheme(t);
    set({ theme: t });
  },
}));

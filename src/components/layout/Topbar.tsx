"use client";

import { Menu, Zap, Sun, Moon } from "lucide-react";
import { useSidebarStore } from "@/store/sidebar";
import { useThemeStore } from "@/store/theme";

export function Topbar() {
  const { toggle } = useSidebarStore();
  const { theme, toggle: toggleTheme } = useThemeStore();

  return (
    <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 h-14 bg-[#13131A] border-b border-[#2A2A3A]">
      <button
        onClick={toggle}
        className="text-[#8888A0] hover:text-[#F0F0F5] transition-colors p-1"
        aria-label="Abrir menú"
      >
        <Menu size={22} />
      </button>
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[#FF6B35] flex items-center justify-center">
          <Zap size={14} className="text-white" />
        </div>
        <span className="text-[#F0F0F5] font-bold text-base tracking-tight">PLUSBY</span>
      </div>
      <button
        onClick={toggleTheme}
        title={theme === "dark" ? "Modo claro" : "Modo oscuro"}
        className="w-8 h-8 flex items-center justify-center rounded-lg text-[#8888A0] hover:text-[#F0F0F5] hover:bg-[#1C1C26] transition-colors"
      >
        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
      </button>
    </header>
  );
}

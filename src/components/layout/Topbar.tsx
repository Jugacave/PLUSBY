"use client";

import { Menu, Zap } from "lucide-react";
import { useSidebarStore } from "@/store/sidebar";

export function Topbar() {
  const { toggle } = useSidebarStore();

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
      <div className="w-8" />
    </header>
  );
}

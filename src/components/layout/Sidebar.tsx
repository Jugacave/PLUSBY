"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Sparkles,
  Wand2,
  Search,
  Globe,
  TrendingUp,
  Package,
  Bot,
  GraduationCap,
  Users,
  Store,
  CheckCircle,
  MessageCircle,
  Settings,
  LogOut,
  X,
  Zap,
  ShieldCheck,
  Sun,
  Moon,
} from "lucide-react";
import { useThemeStore } from "@/store/theme";
import { cn } from "@/lib/utils";
import { useSidebarStore } from "@/store/sidebar";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  badge?: "IA" | "Nuevo";
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: "HERRAMIENTAS IA",
    items: [
      { label: "Estudio IA", href: "/estudio-ia", icon: Sparkles, badge: "IA" },
      { label: "Creativos Pro", href: "/creativos-pro", icon: Wand2, badge: "IA" },
      { label: "Plusby AI", href: "/plusby-ai", icon: Bot, badge: "IA" },
    ],
  },
  {
    title: "DROPSHIPPING",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Encuentra Producto", href: "/encuentra-producto", icon: Search, badge: "Nuevo" },
      { label: "Crea tu Landing", href: "/landing", icon: Globe },
      { label: "Informe Financiero", href: "/informe-financiero", icon: TrendingUp },
      { label: "Proveedores", href: "/proveedores", icon: Package, badge: "Nuevo" },
    ],
  },
  {
    title: "APRENDER",
    items: [
      { label: "Academia", href: "/academia", icon: GraduationCap },
      { label: "Coaching", href: "/coaching", icon: Users },
    ],
  },
  {
    title: "CUENTA",
    items: [
      { label: "Mi Tienda", href: "/mi-tienda", icon: Store },
      { label: "Confirma", href: "/confirma", icon: CheckCircle, badge: "Nuevo" },
      { label: "Chateando", href: "/chateando", icon: MessageCircle, badge: "Nuevo" },
      { label: "Settings", href: "/settings", icon: Settings },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { isOpen, close } = useSidebarStore();
  const { theme, toggle: toggleTheme, init: initTheme } = useThemeStore();
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("Usuario");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    initTheme();
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserEmail(user.email ?? "");
        setUserName(user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "Usuario");
        const role = user.user_metadata?.role;
        setIsAdmin(role === "superadmin" || role === "admin");
      }
    });
  }, [initTheme]);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-60 flex flex-col",
          "bg-[#13131A] border-r border-[#2A2A3A]",
          "transition-transform duration-300 ease-in-out",
          "lg:translate-x-0 lg:static lg:z-auto",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-4 py-5 border-b border-[#2A2A3A]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF6B35] flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-[#F0F0F5] font-bold text-lg tracking-tight">PLUSBY</span>
          </div>
          <button
            onClick={close}
            className="lg:hidden text-[#8888A0] hover:text-[#F0F0F5] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Plan badge */}
        <div className="px-4 py-3 border-b border-[#2A2A3A]">
          <div className="flex items-center gap-2 bg-[#1C1C26] rounded-lg px-3 py-2">
            <div className="w-2 h-2 rounded-full bg-[#FF6B35]" />
            <span className="text-[#8888A0] text-xs">Plan Actual:</span>
            <span className="text-[#F0F0F5] text-xs font-semibold">Free</span>
            <Link
              href="/settings"
              className="ml-auto text-[#FF6B35] text-xs font-medium hover:text-[#FF8C5A] transition-colors"
            >
              Mejorar
            </Link>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-3 px-2">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-4">
              <p className="px-3 py-1 text-[10px] font-semibold tracking-widest text-[#555568] uppercase">
                {group.title}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={close}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                          isActive
                            ? "bg-[rgba(255,107,53,0.1)] text-[#FF6B35] border-l-2 border-[#FF6B35] pl-[10px]"
                            : "text-[#8888A0] hover:bg-[#1C1C26] hover:text-[#F0F0F5]"
                        )}
                      >
                        <Icon
                          size={16}
                          className={cn(
                            isActive ? "text-[#FF6B35]" : "text-[#555568]"
                          )}
                        />
                        <span className="flex-1 font-medium">{item.label}</span>
                        {item.badge === "IA" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(124,58,237,0.15)] text-[#8B5CF6] font-semibold">
                            IA
                          </span>
                        )}
                        {item.badge === "Nuevo" && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(255,107,53,0.1)] text-[#FF6B35] font-semibold">
                            Nuevo
                          </span>
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}

          {isAdmin && (
            <div className="mb-4">
              <p className="px-3 py-1 text-[10px] font-semibold tracking-widest text-[#FF6B35] uppercase">
                SUPER ADMIN
              </p>
              <ul className="space-y-0.5">
                <li>
                  <Link
                    href="/admin"
                    onClick={close}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
                      pathname === "/admin"
                        ? "bg-[rgba(255,107,53,0.15)] text-[#FF6B35] border-l-2 border-[#FF6B35] pl-[10px]"
                        : "text-[#FF6B35]/60 hover:bg-[rgba(255,107,53,0.08)] hover:text-[#FF6B35]"
                    )}
                  >
                    <ShieldCheck size={16} className="text-[#FF6B35]" />
                    <span className="flex-1 font-medium">Panel Admin</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-[rgba(255,107,53,0.15)] text-[#FF6B35] font-semibold">
                      SA
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          )}
        </nav>

        {/* User profile */}
        <div className="border-t border-[#2A2A3A] p-3">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[#1C1C26] transition-colors cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-[#FF6B35] flex items-center justify-center text-white text-sm font-bold shrink-0">
              {userName[0]?.toUpperCase() ?? "U"}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#F0F0F5] text-sm font-medium truncate">{userName}</p>
              <p className="text-[#555568] text-xs truncate">{userEmail}</p>
            </div>
          </div>
          <div className="mt-1 flex items-center gap-1">
            <button
              onClick={toggleTheme}
              title={theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-[#8888A0] hover:bg-[#1C1C26] hover:text-[#F0F0F5] transition-all text-sm flex-1"
            >
              {theme === "dark" ? <Sun size={15} /> : <Moon size={15} />}
              <span>{theme === "dark" ? "Modo claro" : "Modo oscuro"}</span>
            </button>
            <button
              onClick={handleLogout}
              title="Cerrar sesión"
              className="flex items-center justify-center w-9 h-9 rounded-lg text-[#8888A0] hover:bg-[#1C1C26] hover:text-[#EF4444] transition-all"
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

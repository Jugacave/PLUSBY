import Link from "next/link";
import {
  Sparkles,
  Globe,
  Search,
  Bot,
  ImageIcon,
  TrendingUp,
  Zap,
  ArrowRight,
  Crown,
} from "lucide-react";

const quickAccess = [
  {
    label: "Estudio IA",
    description: "Genera imágenes con IA",
    href: "/estudio-ia",
    icon: Sparkles,
    gradient: "from-[#7C3AED] to-[#5B21B6]",
    badge: "IA",
  },
  {
    label: "Crea tu Landing",
    description: "Landings para tus productos",
    href: "/landing",
    icon: Globe,
    gradient: "from-[#FF6B35] to-[#E84D1C]",
    badge: null,
  },
  {
    label: "Encuentra Producto",
    description: "Catálogo ganador",
    href: "/encuentra-producto",
    icon: Search,
    gradient: "from-[#0EA5E9] to-[#0369A1]",
    badge: "Nuevo",
  },
  {
    label: "Plusby AI",
    description: "Tu asistente de dropshipping",
    href: "/plusby-ai",
    icon: Bot,
    gradient: "from-[#8B5CF6] to-[#7C3AED]",
    badge: "IA",
  },
];

const stats = [
  { label: "Imágenes generadas", value: "0", icon: ImageIcon },
  { label: "Landings creadas", value: "0", icon: Globe },
  { label: "Productos analizados", value: "0", icon: Search },
  { label: "Chats con IA", value: "0", icon: Bot },
];

export default function DashboardPage() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-[#F0F0F5]">
          ¡Hola, Usuario! 👋
        </h1>
        <p className="text-[#8888A0] mt-1">
          Bienvenido a tu panel de control de Plusby
        </p>
      </div>

      {/* Plan + Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Plan card */}
        <div className="sm:col-span-2 lg:col-span-1 bg-[#13131A] border border-[#2A2A3A] rounded-xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[rgba(255,107,53,0.1)] flex items-center justify-center">
              <Crown size={16} className="text-[#FF6B35]" />
            </div>
            <div>
              <p className="text-[#8888A0] text-xs">Plan Actual</p>
              <p className="text-[#F0F0F5] font-bold text-lg leading-none">Free</p>
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span className="text-[#8888A0]">Créditos IA</span>
              <span className="text-[#F0F0F5]">0 / 10</span>
            </div>
            <div className="w-full h-1.5 bg-[#2A2A3A] rounded-full">
              <div className="h-full w-0 bg-[#FF6B35] rounded-full" />
            </div>
          </div>
          <Link
            href="/settings"
            className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-[#FF6B35] hover:bg-[#FF8C5A] text-white text-sm font-semibold transition-colors"
          >
            <Zap size={14} />
            Mejorar Plan
          </Link>
        </div>

        {/* Stats */}
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-[#13131A] border border-[#2A2A3A] rounded-xl p-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-[#1C1C26] flex items-center justify-center shrink-0">
                <Icon size={18} className="text-[#8888A0]" />
              </div>
              <div>
                <p className="text-2xl font-bold text-[#F0F0F5]">{stat.value}</p>
                <p className="text-[#8888A0] text-xs">{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Access */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#F0F0F5]">Acceso Rápido</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickAccess.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative bg-[#13131A] border border-[#2A2A3A] rounded-xl p-5 hover:border-[#3A3A4A] transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/30"
              >
                <div
                  className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.gradient} flex items-center justify-center mb-3 shadow-lg`}
                >
                  <Icon size={20} className="text-white" />
                </div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-[#F0F0F5] font-semibold text-sm">{item.label}</p>
                    <p className="text-[#8888A0] text-xs mt-0.5">{item.description}</p>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-semibold shrink-0 ${
                        item.badge === "IA"
                          ? "bg-[rgba(124,58,237,0.15)] text-[#8B5CF6]"
                          : "bg-[rgba(255,107,53,0.1)] text-[#FF6B35]"
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <ArrowRight
                  size={14}
                  className="absolute bottom-5 right-5 text-[#555568] group-hover:text-[#FF6B35] group-hover:translate-x-0.5 transition-all"
                />
              </Link>
            );
          })}
        </div>
      </div>

      {/* Recent Generations */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[#F0F0F5]">Generaciones Recientes</h2>
          <Link
            href="/estudio-ia"
            className="text-[#FF6B35] hover:text-[#FF8C5A] text-sm font-medium transition-colors flex items-center gap-1"
          >
            Ver todas <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="aspect-square rounded-xl border-2 border-dashed border-[#2A2A3A] bg-[#13131A] flex flex-col items-center justify-center gap-2 hover:border-[#FF6B35]/30 transition-colors cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#1C1C26] flex items-center justify-center group-hover:bg-[rgba(255,107,53,0.1)] transition-colors">
                <ImageIcon size={20} className="text-[#555568] group-hover:text-[#FF6B35] transition-colors" />
              </div>
              <p className="text-[#555568] text-xs text-center px-4 group-hover:text-[#8888A0] transition-colors">
                Sin generaciones
              </p>
            </div>
          ))}
        </div>
        <div className="mt-4 flex justify-center">
          <Link
            href="/estudio-ia"
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white font-semibold text-sm transition-colors"
          >
            <Sparkles size={16} />
            Generar primera imagen
          </Link>
        </div>
      </div>

      {/* Trending */}
      <div className="mt-8 bg-gradient-to-r from-[rgba(124,58,237,0.1)] to-[rgba(255,107,53,0.05)] border border-[#2A2A3A] rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[rgba(124,58,237,0.2)] flex items-center justify-center shrink-0">
          <TrendingUp size={20} className="text-[#8B5CF6]" />
        </div>
        <div className="flex-1">
          <p className="text-[#F0F0F5] font-semibold">Encuentra tu próximo producto ganador</p>
          <p className="text-[#8888A0] text-sm">Explora +13,000 productos con datos de ventas en tiempo real</p>
        </div>
        <Link
          href="/encuentra-producto"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#7C3AED] hover:bg-[#8B5CF6] text-white text-sm font-semibold transition-colors shrink-0"
        >
          Explorar <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}

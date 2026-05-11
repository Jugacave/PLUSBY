"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  TrendingUp,
  Star,
  Filter,
  ChevronRight,
  Flame,
  Globe,
  ShoppingCart,
  DollarSign,
  BarChart2,
  X,
  Sparkles,
  BookmarkPlus,
  ExternalLink,
} from "lucide-react";

type Category = "todos" | "salud" | "belleza" | "hogar" | "tecnologia" | "mascotas" | "deporte";
type SortBy = "tendencia" | "margen" | "ventas" | "nuevo";

interface Product {
  id: string;
  name: string;
  description: string;
  category: Category;
  price: number;
  cost: number;
  salesLast30: number;
  trend: number;
  competition: "baja" | "media" | "alta";
  supplier: string;
  tags: string[];
  isHot: boolean;
  isNew: boolean;
  savedAt?: boolean;
}

const PRODUCTS: Product[] = [
  {
    id: "p1",
    name: "Faja Reductora Térmica",
    description: "Faja de neopreno con efecto sauna. Reduce medidas visiblemente desde el primer uso.",
    category: "salud",
    price: 89000,
    cost: 22000,
    salesLast30: 3240,
    trend: 87,
    competition: "media",
    supplier: "Dropi",
    tags: ["bestseller", "mujer", "fitness"],
    isHot: true,
    isNew: false,
  },
  {
    id: "p2",
    name: "Masajeador Anticelulitis 3en1",
    description: "Masajeador eléctrico con calor, vibración y succión. Ideal para muslos y abdomen.",
    category: "salud",
    price: 129000,
    cost: 38000,
    salesLast30: 1870,
    trend: 94,
    competition: "baja",
    supplier: "Kompras Plus",
    tags: ["nuevo", "mujer", "bienestar"],
    isHot: true,
    isNew: true,
  },
  {
    id: "p3",
    name: "Luz LED Para Plantas",
    description: "Panel de 45W full spectrum para cultivo indoor. Plug & play, silencioso.",
    category: "hogar",
    price: 72000,
    cost: 18000,
    salesLast30: 980,
    trend: 71,
    competition: "baja",
    supplier: "Dropi",
    tags: ["hogar", "plantas", "gadget"],
    isHot: false,
    isNew: false,
  },
  {
    id: "p4",
    name: "Collar GPS para Mascotas",
    description: "Rastreo en tiempo real desde el celular. Resistente al agua, batería 7 días.",
    category: "mascotas",
    price: 149000,
    cost: 45000,
    salesLast30: 1420,
    trend: 82,
    competition: "media",
    supplier: "Kompras Plus",
    tags: ["mascotas", "seguridad", "tech"],
    isHot: false,
    isNew: true,
  },
  {
    id: "p5",
    name: "Secador de Cabello Iónico",
    description: "2400W con tecnología iónica. Seca 3x más rápido sin dañar el cabello.",
    category: "belleza",
    price: 119000,
    cost: 31000,
    salesLast30: 2100,
    trend: 76,
    competition: "alta",
    supplier: "Dropi",
    tags: ["belleza", "cabello", "hogar"],
    isHot: false,
    isNew: false,
  },
  {
    id: "p6",
    name: "Rodillo de Jade Facial",
    description: "Set de rodillo + gua sha de jade natural. Reduce puffiness y mejora circulación.",
    category: "belleza",
    price: 45000,
    cost: 9000,
    salesLast30: 1650,
    trend: 68,
    competition: "alta",
    supplier: "Dropi",
    tags: ["belleza", "skincare", "mujer"],
    isHot: false,
    isNew: false,
  },
  {
    id: "p7",
    name: "Pesa Rusa Ajustable 24kg",
    description: "Kettlebell con peso ajustable en 6 niveles. Reemplaza 6 pesas diferentes.",
    category: "deporte",
    price: 189000,
    cost: 52000,
    salesLast30: 760,
    trend: 79,
    competition: "baja",
    supplier: "Kompras Plus",
    tags: ["deporte", "gym", "fitness"],
    isHot: false,
    isNew: true,
  },
  {
    id: "p8",
    name: "Limpiador Ultrasónico de Gafas",
    description: "Limpieza profunda en 3 minutos con ultrasonido. Para gafas, joyería, relojes.",
    category: "tecnologia",
    price: 59000,
    cost: 14000,
    salesLast30: 890,
    trend: 65,
    competition: "baja",
    supplier: "Dropi",
    tags: ["gadget", "limpieza", "tech"],
    isHot: false,
    isNew: false,
  },
];

const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: "todos", label: "Todos", emoji: "🌐" },
  { value: "salud", label: "Salud", emoji: "💊" },
  { value: "belleza", label: "Belleza", emoji: "💄" },
  { value: "hogar", label: "Hogar", emoji: "🏠" },
  { value: "tecnologia", label: "Tecnología", emoji: "📱" },
  { value: "mascotas", label: "Mascotas", emoji: "🐾" },
  { value: "deporte", label: "Deporte", emoji: "⚽" },
];

const SORT_OPTIONS: { value: SortBy; label: string }[] = [
  { value: "tendencia", label: "Más tendencia" },
  { value: "ventas", label: "Más vendidos" },
  { value: "margen", label: "Mayor margen" },
  { value: "nuevo", label: "Más nuevos" },
];

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

function CompetitionBadge({ level }: { level: "baja" | "media" | "alta" }) {
  const map = {
    baja: { label: "Competencia baja", bg: "rgba(74,222,128,0.1)", color: "#4ADE80" },
    media: { label: "Competencia media", bg: "rgba(245,158,11,0.1)", color: "#F59E0B" },
    alta: { label: "Competencia alta", bg: "rgba(239,68,68,0.1)", color: "#EF4444" },
  };
  const s = map[level];
  return (
    <span
      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
      style={{ background: s.bg, color: s.color }}
    >
      {s.label}
    </span>
  );
}

interface ProductDetailProps {
  product: Product;
  onClose: () => void;
}

function ProductDetail({ product, onClose }: ProductDetailProps) {
  const margin = product.price - product.cost;
  const marginPct = Math.round((margin / product.price) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl w-full max-w-md max-h-[calc(100vh-2rem)] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A3A] sticky top-0 bg-[#13131A] z-10">
          <h2 className="text-[#F0F0F5] font-bold text-sm">Análisis del producto</h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555568] hover:text-[#8888A0] hover:bg-[#2A2A3A] transition-colors"
          >
            <X size={15} />
          </button>
        </div>

        <div className="p-4 space-y-4">
          <div>
            <div className="flex items-start gap-2 mb-1">
              {product.isHot && (
                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.15)] text-red-400 flex items-center gap-1">
                  <Flame size={9} /> HOT
                </span>
              )}
              {product.isNew && (
                <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(124,58,237,0.15)] text-[#A78BFA]">
                  NUEVO
                </span>
              )}
            </div>
            <h3 className="text-[#F0F0F5] font-bold text-lg">{product.name}</h3>
            <p className="text-[#8888A0] text-sm mt-1">{product.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Precio venta sugerido", value: formatCOP(product.price), color: "#F0F0F5" },
              { label: "Costo del producto", value: formatCOP(product.cost), color: "#8888A0" },
              {
                label: "Ganancia estimada",
                value: formatCOP(margin),
                color: "#4ADE80",
              },
              {
                label: "Margen de ganancia",
                value: `${marginPct}%`,
                color: marginPct >= 60 ? "#4ADE80" : marginPct >= 40 ? "#F59E0B" : "#EF4444",
              },
            ].map((item) => (
              <div key={item.label} className="bg-[#1C1C26] rounded-xl p-3">
                <p className="text-[#555568] text-[10px] mb-1">{item.label}</p>
                <p className="font-bold text-sm" style={{ color: item.color }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>

          <div className="bg-[#1C1C26] rounded-xl p-4">
            <p className="text-[#F0F0F5] text-xs font-semibold mb-3 flex items-center gap-1.5">
              <TrendingUp size={13} className="text-[#0EA5E9]" />
              Indicadores de mercado
            </p>
            <div className="space-y-2.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-[#8888A0]">Tendencia</span>
                  <span className="text-[#F0F0F5] font-semibold">{product.trend}%</span>
                </div>
                <div className="h-1.5 bg-[#2A2A3A] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${product.trend}%`,
                      background:
                        product.trend >= 80
                          ? "#4ADE80"
                          : product.trend >= 60
                          ? "#F59E0B"
                          : "#EF4444",
                    }}
                  />
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8888A0] text-xs">Ventas / 30 días</span>
                <span className="text-[#F0F0F5] text-xs font-semibold">
                  {product.salesLast30.toLocaleString()} unidades
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8888A0] text-xs">Competencia</span>
                <CompetitionBadge level={product.competition} />
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#8888A0] text-xs">Proveedor</span>
                <span className="text-[#F0F0F5] text-xs font-semibold">{product.supplier}</span>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[rgba(124,58,237,0.1)] to-transparent rounded-xl p-4 border border-[rgba(124,58,237,0.2)]">
            <p className="text-[#A78BFA] text-xs font-semibold flex items-center gap-1.5 mb-2">
              <Sparkles size={12} />
              Análisis IA
            </p>
            <p className="text-[#8888A0] text-xs leading-relaxed">
              {product.isHot
                ? `Este producto tiene alto potencial. La combinación de alta demanda (${product.salesLast30.toLocaleString()} ventas/mes) y competencia ${product.competition} lo hace ideal para empezar. Enfócate en anuncios con transformación antes/después.`
                : `Nicho con oportunidad. El margen de ${marginPct}% es ${marginPct >= 60 ? "excelente" : "aceptable"}. Con la estrategia de contenido correcta puedes destacar frente a la competencia ${product.competition}.`}
            </p>
          </div>

          <div className="flex gap-2 pt-1">
            <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[#2A2A3A] hover:border-[#3A3A4A] text-[#8888A0] hover:text-[#F0F0F5] text-xs font-semibold transition-colors">
              <BookmarkPlus size={14} />
              Guardar
            </button>
            <Link
              href="/creativos-pro"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[rgba(124,58,237,0.3)] bg-[rgba(124,58,237,0.1)] hover:bg-[rgba(124,58,237,0.15)] text-[#A78BFA] text-xs font-semibold transition-colors"
            >
              <Sparkles size={14} />
              Generar copy
            </Link>
            <Link
              href="/landing"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white text-xs font-semibold transition-colors"
            >
              <Globe size={14} />
              Crear landing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({
  product,
  onClick,
}: {
  product: Product;
  onClick: () => void;
}) {
  const margin = product.price - product.cost;
  const marginPct = Math.round((margin / product.price) * 100);

  return (
    <button
      onClick={onClick}
      className="bg-[#13131A] border border-[#2A2A3A] hover:border-[#3A3A4A] rounded-2xl p-4 text-left transition-all group hover:shadow-lg hover:shadow-black/20"
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap gap-1">
          {product.isHot && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[rgba(239,68,68,0.15)] text-red-400 flex items-center gap-0.5">
              <Flame size={8} /> HOT
            </span>
          )}
          {product.isNew && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[rgba(124,58,237,0.15)] text-[#A78BFA]">
              NUEVO
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[#8888A0]">
          <TrendingUp size={12} />
          <span className="text-xs font-semibold" style={{ color: product.trend >= 80 ? "#4ADE80" : product.trend >= 65 ? "#F59E0B" : "#F0F0F5" }}>
            {product.trend}%
          </span>
        </div>
      </div>

      <h3 className="text-[#F0F0F5] font-semibold text-sm mb-1 group-hover:text-white transition-colors line-clamp-1">
        {product.name}
      </h3>
      <p className="text-[#555568] text-xs mb-3 line-clamp-2 leading-relaxed">
        {product.description}
      </p>

      <div className="grid grid-cols-3 gap-1.5 mb-3">
        <div className="bg-[#1C1C26] rounded-lg p-2 text-center">
          <p className="text-[#4ADE80] font-bold text-xs">{marginPct}%</p>
          <p className="text-[#555568] text-[9px]">Margen</p>
        </div>
        <div className="bg-[#1C1C26] rounded-lg p-2 text-center">
          <p className="text-[#F0F0F5] font-bold text-xs">
            {product.salesLast30 >= 1000
              ? `${(product.salesLast30 / 1000).toFixed(1)}k`
              : product.salesLast30}
          </p>
          <p className="text-[#555568] text-[9px]">Ventas/mes</p>
        </div>
        <div className="bg-[#1C1C26] rounded-lg p-2 text-center">
          <p
            className="font-bold text-xs"
            style={{
              color:
                product.competition === "baja"
                  ? "#4ADE80"
                  : product.competition === "media"
                  ? "#F59E0B"
                  : "#EF4444",
            }}
          >
            {product.competition === "baja" ? "Baja" : product.competition === "media" ? "Media" : "Alta"}
          </p>
          <p className="text-[#555568] text-[9px]">Comp.</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <p className="text-[#F0F0F5] font-bold text-sm">{formatCOP(product.price)}</p>
          <p className="text-[#555568] text-[10px]">Costo: {formatCOP(product.cost)}</p>
        </div>
        <span className="text-[#555568] text-xs bg-[#1C1C26] px-2 py-1 rounded-md">
          {product.supplier}
        </span>
      </div>
    </button>
  );
}

export default function EncuentraProductoPage() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<Category>("todos");
  const [sortBy, setSortBy] = useState<SortBy>("tendencia");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  const filtered = PRODUCTS.filter((p) => {
    const matchSearch =
      !search ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(search.toLowerCase()));
    const matchCategory = category === "todos" || p.category === category;
    return matchSearch && matchCategory;
  }).sort((a, b) => {
    if (sortBy === "tendencia") return b.trend - a.trend;
    if (sortBy === "ventas") return b.salesLast30 - a.salesLast30;
    if (sortBy === "margen")
      return (b.price - b.cost) / b.price - (a.price - a.cost) / a.price;
    if (sortBy === "nuevo") return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0);
    return 0;
  });

  const hotProducts = PRODUCTS.filter((p) => p.isHot);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {selectedProduct && (
        <ProductDetail product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}

      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-[#8888A0] hover:text-[#F0F0F5] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] flex items-center justify-center shrink-0">
            <Search size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-[#F0F0F5]">
              Encuentra Producto Ganador
            </h1>
            <p className="text-[#8888A0] text-xs md:text-sm truncate">
              Catálogo curado con datos de ventas y análisis de competencia
            </p>
          </div>
        </div>
      </div>

      {hotProducts.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Flame size={14} className="text-red-400" />
            <p className="text-[#F0F0F5] font-semibold text-sm">En llamas ahora</p>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[rgba(239,68,68,0.15)] text-red-400">
              {hotProducts.length} productos
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {hotProducts.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProduct(p)}
                className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[rgba(239,68,68,0.08)] to-transparent border border-[rgba(239,68,68,0.2)] hover:border-[rgba(239,68,68,0.4)] text-left transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-[rgba(239,68,68,0.1)] flex items-center justify-center shrink-0">
                  <Flame size={18} className="text-red-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#F0F0F5] font-semibold text-sm truncate">{p.name}</p>
                  <p className="text-[#8888A0] text-xs">
                    {p.salesLast30.toLocaleString()} ventas/mes · {p.trend}% tendencia
                  </p>
                </div>
                <ChevronRight size={14} className="text-[#555568] shrink-0" />
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search
            size={15}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555568]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar productos, categorías, tags..."
            className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-[#13131A] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#0EA5E9] transition-colors text-sm"
          />
          {search && (
            <button
              onClick={() => setSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555568] hover:text-[#8888A0]"
            >
              <X size={13} />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-3 py-2.5 rounded-xl bg-[#13131A] border border-[#2A2A3A] text-[#F0F0F5] text-sm focus:outline-none focus:border-[#0EA5E9] transition-colors"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
              showFilters
                ? "border-[#0EA5E9] bg-[rgba(14,165,233,0.1)] text-[#0EA5E9]"
                : "border-[#2A2A3A] bg-[#13131A] text-[#8888A0] hover:border-[#3A3A4A] hover:text-[#F0F0F5]"
            }`}
          >
            <Filter size={14} />
            Filtros
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="mb-4 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                category === c.value
                  ? "border-[#0EA5E9] bg-[rgba(14,165,233,0.1)] text-[#0EA5E9]"
                  : "border-[#2A2A3A] bg-[#13131A] text-[#8888A0] hover:border-[#3A3A4A]"
              }`}
            >
              <span>{c.emoji}</span>
              {c.label}
            </button>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <p className="text-[#555568] text-xs">
          {filtered.length} producto{filtered.length !== 1 ? "s" : ""} encontrado
          {filtered.length !== 1 ? "s" : ""}
        </p>
        <div className="flex items-center gap-1 text-[#555568] text-xs">
          <BarChart2 size={12} />
          Datos actualizados hoy
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl flex flex-col items-center justify-center py-16 px-8 text-center">
          <Search size={32} className="text-[#2A2A3A] mb-3" />
          <p className="text-[#F0F0F5] font-semibold mb-1">Sin resultados</p>
          <p className="text-[#555568] text-sm">Intenta con otro término de búsqueda.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onClick={() => setSelectedProduct(p)} />
          ))}
        </div>
      )}

      <div className="mt-8 p-4 rounded-2xl bg-gradient-to-r from-[rgba(14,165,233,0.08)] to-transparent border border-[rgba(14,165,233,0.15)]">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[rgba(14,165,233,0.15)] flex items-center justify-center shrink-0 mt-0.5">
            <ExternalLink size={15} className="text-[#0EA5E9]" />
          </div>
          <div className="flex-1">
            <p className="text-[#F0F0F5] text-sm font-semibold mb-0.5">
              ¿Quieres más productos?
            </p>
            <p className="text-[#8888A0] text-xs">
              El catálogo se actualiza semanalmente con nuevos productos de Dropi y Kompras Plus.
              Con el plan Pro accedes a +500 productos con análisis completo.
            </p>
          </div>
          <button className="shrink-0 px-3 py-1.5 rounded-lg bg-[rgba(14,165,233,0.15)] hover:bg-[rgba(14,165,233,0.25)] text-[#0EA5E9] text-xs font-semibold transition-colors">
            Ver planes
          </button>
        </div>
      </div>
    </div>
  );
}

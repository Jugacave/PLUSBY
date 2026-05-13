"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Package, Plus, X, Search, ExternalLink,
  FileText, Play, Tag, Globe, Phone, Mail, Shield,
  ChevronRight, Star, Trash2, Edit3, Check, MapPin,
} from "lucide-react";

interface Supplier {
  id: string;
  name: string;
  description: string;
  logo: string;
  color: string;
  country: string;
  categories: string[];
  catalogs: number;
  videos: number;
  website?: string;
  whatsapp?: string;
  email?: string;
  minOrder?: string;
  shipping: string;
  badge?: "Verificado" | "Premium" | "Nuevo";
  featured: boolean;
}

const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "s1",
    name: "Kompras Plus",
    description: "Proveedor de productos de laboratorio propios con registro INVIMA para Colombia y México. Desarrollo de marca propia desde 300 unidades, stock garantizado de +5,000 unidades por referencia.",
    logo: "KP",
    color: "#FF6B35",
    country: "Colombia",
    categories: ["Salud", "Belleza", "Bienestar"],
    catalogs: 2,
    videos: 1,
    website: "https://komprasplus.com",
    whatsapp: "+57 300 000 0000",
    minOrder: "300 unidades",
    shipping: "Nacional e internacional",
    badge: "Verificado",
    featured: true,
  },
  {
    id: "s2",
    name: "Dropi",
    description: "Plataforma de dropshipping líder en Colombia y Latinoamérica. +10,000 productos disponibles, gestión de pedidos automatizada y pagos seguros. El proveedor más usado por dropshippers colombianos.",
    logo: "DR",
    color: "#8B5CF6",
    country: "Colombia",
    categories: ["General", "Tecnología", "Hogar", "Moda"],
    catalogs: 5,
    videos: 3,
    website: "https://dropi.co",
    email: "soporte@dropi.co",
    minOrder: "1 unidad",
    shipping: "Colombia y México",
    badge: "Premium",
    featured: true,
  },
  {
    id: "s3",
    name: "Mariothy Store",
    description: "Fábrica familiar de calzado 100% para dama (Colombia, +10 años). Hacen ellos mismos cada par — cuero natural, suelas en expanso, plantillas semi-ortopédicas. Marca propia contramarcada.",
    logo: "MS",
    color: "#EC4899",
    country: "Colombia",
    categories: ["Moda", "Calzado", "Dama"],
    catalogs: 1,
    videos: 1,
    whatsapp: "+57 312 000 0000",
    minOrder: "6 pares",
    shipping: "Nacional",
    badge: "Verificado",
    featured: false,
  },
  {
    id: "s4",
    name: "TechDrop MX",
    description: "Proveedor de gadgets y tecnología directamente desde México. Auriculares, smartwatches, accesorios para celular. Envíos en 24-48h a toda Colombia con tracking en tiempo real.",
    logo: "TD",
    color: "#0EA5E9",
    country: "México",
    categories: ["Tecnología", "Gadgets", "Accesorios"],
    catalogs: 3,
    videos: 2,
    website: "https://techdrop.mx",
    minOrder: "5 unidades",
    shipping: "Colombia y Latinoamérica",
    badge: "Nuevo",
    featured: false,
  },
];

const ALL_CATEGORIES = ["Todos", "Salud", "Belleza", "Tecnología", "Hogar", "Moda", "General", "Bienestar", "Gadgets", "Calzado"];

const BADGE_STYLES: Record<string, string> = {
  Verificado: "bg-green-500/10 text-green-400 border-green-500/20",
  Premium: "bg-[rgba(139,92,246,0.15)] text-[#A78BFA] border-[rgba(139,92,246,0.25)]",
  Nuevo: "bg-[rgba(255,107,53,0.1)] text-[#FF6B35] border-[rgba(255,107,53,0.2)]",
};

function SupplierModal({ supplier, onClose }: { supplier: Supplier; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#13131A] z-10 flex items-center justify-between p-5 border-b border-[#2A2A3A]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm" style={{ background: supplier.color }}>
              {supplier.logo}
            </div>
            <div>
              <p className="text-[#F0F0F5] font-bold">{supplier.name}</p>
              <div className="flex items-center gap-1 text-[#555568] text-xs">
                <MapPin size={10} />{supplier.country}
              </div>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555568] hover:text-[#F0F0F5] hover:bg-[#2A2A3A] transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          <p className="text-[#8888A0] text-sm leading-relaxed">{supplier.description}</p>

          <div className="flex flex-wrap gap-1.5">
            {supplier.categories.map(c => (
              <span key={c} className="px-2.5 py-1 rounded-lg bg-[#1C1C26] border border-[#2A2A3A] text-[#8888A0] text-xs">{c}</span>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Catálogos", value: supplier.catalogs, icon: FileText, color: "#FF6B35" },
              { label: "Videos", value: supplier.videos, icon: Play, color: "#8B5CF6" },
              { label: "Pedido mínimo", value: supplier.minOrder ?? "—", icon: Package, color: "#0EA5E9" },
              { label: "Envíos", value: supplier.shipping, icon: Globe, color: "#10B981" },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="bg-[#1C1C26] border border-[#2A2A3A] rounded-xl p-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: item.color + "15" }}>
                    <Icon size={14} style={{ color: item.color }} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[#555568] text-[10px]">{item.label}</p>
                    <p className="text-[#F0F0F5] text-xs font-semibold truncate">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="space-y-2">
            {supplier.website && (
              <a href={supplier.website} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] hover:border-[#3A3A4A] transition-colors group">
                <Globe size={14} className="text-[#555568] group-hover:text-[#FF6B35] transition-colors" />
                <span className="text-[#8888A0] text-sm flex-1">{supplier.website}</span>
                <ExternalLink size={12} className="text-[#555568]" />
              </a>
            )}
            {supplier.whatsapp && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A]">
                <Phone size={14} className="text-green-400" />
                <span className="text-[#8888A0] text-sm">{supplier.whatsapp}</span>
              </div>
            )}
            {supplier.email && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A]">
                <Mail size={14} className="text-[#0EA5E9]" />
                <span className="text-[#8888A0] text-sm">{supplier.email}</span>
              </div>
            )}
          </div>

          <a
            href={supplier.website ?? "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white font-semibold text-sm transition-colors"
          >
            Contactar proveedor <ChevronRight size={15} />
          </a>
        </div>
      </div>
    </div>
  );
}

function AddSupplierModal({ onClose, onAdd }: { onClose: () => void; onAdd: (s: Supplier) => void }) {
  const [form, setForm] = useState({
    name: "", description: "", logo: "", color: "#FF6B35",
    country: "Colombia", categories: "", catalogs: "0", videos: "0",
    website: "", whatsapp: "", email: "", minOrder: "", shipping: "",
    badge: "" as "" | "Verificado" | "Premium" | "Nuevo", featured: false,
  });

  function handleAdd() {
    if (!form.name || !form.description) return;
    onAdd({
      id: Date.now().toString(),
      name: form.name,
      description: form.description,
      logo: form.logo || form.name.slice(0, 2).toUpperCase(),
      color: form.color,
      country: form.country,
      categories: form.categories.split(",").map(c => c.trim()).filter(Boolean),
      catalogs: parseInt(form.catalogs) || 0,
      videos: parseInt(form.videos) || 0,
      website: form.website || undefined,
      whatsapp: form.whatsapp || undefined,
      email: form.email || undefined,
      minOrder: form.minOrder || undefined,
      shipping: form.shipping || "Nacional",
      badge: form.badge || undefined,
      featured: form.featured,
    });
    onClose();
  }

  const set = (k: string, v: string | boolean) => setForm(prev => ({ ...prev, [k]: v }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#13131A] z-10 flex items-center justify-between p-5 border-b border-[#2A2A3A]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[rgba(255,107,53,0.1)] flex items-center justify-center">
              <Plus size={15} className="text-[#FF6B35]" />
            </div>
            <p className="text-[#F0F0F5] font-bold">Agregar proveedor</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555568] hover:text-[#F0F0F5] hover:bg-[#2A2A3A] transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A]">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black" style={{ background: form.color }}>
              {(form.logo || form.name.slice(0, 2) || "??").toUpperCase().slice(0, 2)}
            </div>
            <div>
              <p className="text-[#F0F0F5] font-semibold text-sm">{form.name || "Nombre del proveedor"}</p>
              <p className="text-[#555568] text-xs">{form.country}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs text-[#8888A0] mb-1.5 font-medium">Nombre *</label>
              <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Kompras Plus"
                className="w-full px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] text-sm focus:outline-none focus:border-[#FF6B35] transition-colors" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-[#8888A0] mb-1.5 font-medium">Descripción *</label>
              <textarea value={form.description} onChange={e => set("description", e.target.value)}
                placeholder="Describe el proveedor, sus productos y ventajas..." rows={3}
                className="w-full px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] text-sm focus:outline-none focus:border-[#FF6B35] transition-colors resize-none" />
            </div>
            <div>
              <label className="block text-xs text-[#8888A0] mb-1.5 font-medium">Siglas del logo</label>
              <input value={form.logo} onChange={e => set("logo", e.target.value.toUpperCase().slice(0, 2))} placeholder="KP" maxLength={2}
                className="w-full px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] text-sm focus:outline-none focus:border-[#FF6B35] transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-[#8888A0] mb-1.5 font-medium">Color del logo</label>
              <div className="flex gap-2">
                <input type="color" value={form.color} onChange={e => set("color", e.target.value)}
                  className="w-10 h-10 rounded-lg border border-[#2A2A3A] bg-[#1C1C26] cursor-pointer p-1" />
                <input value={form.color} onChange={e => set("color", e.target.value)} placeholder="#FF6B35"
                  className="flex-1 px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] text-sm focus:outline-none focus:border-[#FF6B35] transition-colors" />
              </div>
            </div>
            <div>
              <label className="block text-xs text-[#8888A0] mb-1.5 font-medium">País</label>
              <input value={form.country} onChange={e => set("country", e.target.value)} placeholder="Colombia"
                className="w-full px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] text-sm focus:outline-none focus:border-[#FF6B35] transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-[#8888A0] mb-1.5 font-medium">Badge</label>
              <select value={form.badge} onChange={e => set("badge", e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] text-sm focus:outline-none focus:border-[#FF6B35]">
                <option value="">Sin badge</option>
                <option value="Verificado">Verificado</option>
                <option value="Premium">Premium</option>
                <option value="Nuevo">Nuevo</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-[#8888A0] mb-1.5 font-medium">Categorías (separadas por coma)</label>
              <input value={form.categories} onChange={e => set("categories", e.target.value)} placeholder="Salud, Belleza, Bienestar"
                className="w-full px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] text-sm focus:outline-none focus:border-[#FF6B35] transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-[#8888A0] mb-1.5 font-medium">Catálogos</label>
              <input type="number" value={form.catalogs} onChange={e => set("catalogs", e.target.value)} min="0"
                className="w-full px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] text-sm focus:outline-none focus:border-[#FF6B35] transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-[#8888A0] mb-1.5 font-medium">Videos</label>
              <input type="number" value={form.videos} onChange={e => set("videos", e.target.value)} min="0"
                className="w-full px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] text-sm focus:outline-none focus:border-[#FF6B35] transition-colors" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs text-[#8888A0] mb-1.5 font-medium">Sitio web</label>
              <input value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://proveedor.com"
                className="w-full px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] text-sm focus:outline-none focus:border-[#FF6B35] transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-[#8888A0] mb-1.5 font-medium">WhatsApp</label>
              <input value={form.whatsapp} onChange={e => set("whatsapp", e.target.value)} placeholder="+57 300 000 0000"
                className="w-full px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] text-sm focus:outline-none focus:border-[#FF6B35] transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-[#8888A0] mb-1.5 font-medium">Email</label>
              <input value={form.email} onChange={e => set("email", e.target.value)} placeholder="contacto@proveedor.com"
                className="w-full px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] text-sm focus:outline-none focus:border-[#FF6B35] transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-[#8888A0] mb-1.5 font-medium">Pedido mínimo</label>
              <input value={form.minOrder} onChange={e => set("minOrder", e.target.value)} placeholder="300 unidades"
                className="w-full px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] text-sm focus:outline-none focus:border-[#FF6B35] transition-colors" />
            </div>
            <div>
              <label className="block text-xs text-[#8888A0] mb-1.5 font-medium">Tipo de envíos</label>
              <input value={form.shipping} onChange={e => set("shipping", e.target.value)} placeholder="Nacional e internacional"
                className="w-full px-3 py-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] text-sm focus:outline-none focus:border-[#FF6B35] transition-colors" />
            </div>
            <div className="col-span-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => set("featured", !form.featured)}
                  className={`w-5 h-5 rounded flex items-center justify-center border transition-colors ${form.featured ? "bg-[#FF6B35] border-[#FF6B35]" : "border-[#2A2A3A] bg-[#1C1C26]"}`}
                >
                  {form.featured && <Check size={11} className="text-white" />}
                </div>
                <span className="text-[#8888A0] text-sm">Destacar en la parte superior</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-[#2A2A3A] text-[#8888A0] hover:text-[#F0F0F5] text-sm font-semibold transition-colors">
              Cancelar
            </button>
            <button onClick={handleAdd} disabled={!form.name || !form.description}
              className="flex-1 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              Agregar proveedor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProveedoresPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(INITIAL_SUPPLIERS);
  const [selected, setSelected] = useState<Supplier | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("Todos");
  const [adminMode, setAdminMode] = useState(false);

  const filtered = suppliers.filter(s => {
    const matchSearch = !search ||
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.description.toLowerCase().includes(search.toLowerCase()) ||
      s.categories.some(c => c.toLowerCase().includes(search.toLowerCase()));
    const matchCat = category === "Todos" || s.categories.includes(category);
    return matchSearch && matchCat;
  });

  const featured = filtered.filter(s => s.featured);
  const regular = filtered.filter(s => !s.featured);

  function deleteSupplier(id: string) {
    setSuppliers(prev => prev.filter(s => s.id !== id));
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {selected && <SupplierModal supplier={selected} onClose={() => setSelected(null)} />}
      {showAdd && (
        <AddSupplierModal
          onClose={() => setShowAdd(false)}
          onAdd={(s) => setSuppliers(prev => [...prev, s])}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-8">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-[#8888A0] hover:text-[#F0F0F5] transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center shrink-0">
            <Package size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#F0F0F5]">Proveedores</h1>
            <p className="text-[#8888A0] text-xs md:text-sm">Catálogos y recursos de nuestros proveedores aliados</p>
          </div>
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <button
            onClick={() => setAdminMode(!adminMode)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors ${
              adminMode
                ? "bg-[rgba(139,92,246,0.15)] border-[rgba(139,92,246,0.3)] text-[#A78BFA]"
                : "border-[#2A2A3A] bg-[#13131A] text-[#8888A0] hover:text-[#F0F0F5]"
            }`}
          >
            <Shield size={13} />
            {adminMode ? "Modo Admin" : "Admin"}
          </button>
          {adminMode && (
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white text-xs font-semibold transition-colors"
            >
              <Plus size={13} /> Agregar proveedor
            </button>
          )}
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555568]" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Buscar proveedor, categoría..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#13131A] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#F59E0B] transition-colors text-sm"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {ALL_CATEGORIES.slice(0, 6).map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className={`px-3 py-2 rounded-xl border text-xs font-medium transition-all ${
                category === c
                  ? "bg-[rgba(245,158,11,0.1)] border-[rgba(245,158,11,0.3)] text-[#F59E0B]"
                  : "border-[#2A2A3A] bg-[#13131A] text-[#8888A0] hover:text-[#F0F0F5]"
              }`}
            >{c}</button>
          ))}
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-4 mb-6 text-sm text-[#555568]">
        <span>{filtered.length} proveedor{filtered.length !== 1 ? "es" : ""}</span>
        <span>·</span>
        <span className="text-green-400 font-medium">{suppliers.filter(s => s.badge === "Verificado").length} verificados</span>
        <span>·</span>
        <span className="text-[#A78BFA] font-medium">{suppliers.filter(s => s.badge === "Premium").length} premium</span>
      </div>

      {/* Featured */}
      {featured.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Star size={14} className="text-[#F59E0B]" />
            <p className="text-[#F0F0F5] font-semibold text-sm">Proveedores destacados</p>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {featured.map(s => (
              <SupplierCard key={s.id} supplier={s} adminMode={adminMode} onClick={() => setSelected(s)} onDelete={deleteSupplier} />
            ))}
          </div>
        </div>
      )}

      {/* All */}
      {regular.length > 0 && (
        <div>
          {featured.length > 0 && (
            <p className="text-[#555568] text-xs font-semibold uppercase tracking-wider mb-3">Todos los proveedores</p>
          )}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {regular.map(s => (
              <SupplierCard key={s.id} supplier={s} adminMode={adminMode} onClick={() => setSelected(s)} onDelete={deleteSupplier} />
            ))}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1C1C26] flex items-center justify-center">
            <Package size={28} className="text-[#2A2A3A]" />
          </div>
          <p className="text-[#F0F0F5] font-semibold">Sin resultados</p>
          <p className="text-[#555568] text-sm">Intenta con otro término de búsqueda.</p>
        </div>
      )}

      {/* Join CTA */}
      <div className="mt-10 bg-gradient-to-r from-[rgba(245,158,11,0.08)] to-transparent border border-[rgba(245,158,11,0.15)] rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-10 h-10 rounded-xl bg-[rgba(245,158,11,0.1)] flex items-center justify-center shrink-0">
          <Package size={18} className="text-[#F59E0B]" />
        </div>
        <div className="flex-1">
          <p className="text-[#F0F0F5] font-semibold">¿Eres proveedor y quieres unirte a Plusby?</p>
          <p className="text-[#8888A0] text-sm mt-0.5">Llega a miles de dropshippers activos en Colombia y Latinoamérica.</p>
        </div>
        <a href="mailto:proveedores@plusby.co"
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#F59E0B] hover:bg-[#D97706] text-white text-sm font-semibold transition-colors shrink-0">
          <Mail size={14} /> Contáctanos
        </a>
      </div>
    </div>
  );
}

function SupplierCard({ supplier, adminMode, onClick, onDelete }: {
  supplier: Supplier; adminMode: boolean;
  onClick: () => void; onDelete: (id: string) => void;
}) {
  return (
    <div className="relative bg-[#13131A] border border-[#2A2A3A] rounded-2xl overflow-hidden hover:border-[#3A3A4A] transition-all group hover:shadow-lg hover:shadow-black/30">
      {/* Logo area */}
      <div className="h-36 flex items-center justify-center relative" style={{ background: supplier.color + "10" }}>
        <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg"
          style={{ background: `linear-gradient(135deg, ${supplier.color}, ${supplier.color}99)` }}>
          {supplier.logo}
        </div>
        {supplier.badge && (
          <span className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold border ${BADGE_STYLES[supplier.badge]}`}>
            {supplier.badge === "Verificado" && <Shield size={8} className="inline mr-0.5" />}
            {supplier.badge}
          </span>
        )}
        {adminMode && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(supplier.id); }}
            className="absolute top-3 left-3 w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors opacity-0 group-hover:opacity-100"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <p className="text-[#F0F0F5] font-bold text-sm">{supplier.name}</p>
          <div className="flex items-center gap-1 text-[#555568] text-[10px] shrink-0">
            <MapPin size={9} />{supplier.country}
          </div>
        </div>
        <p className="text-[#555568] text-xs leading-relaxed line-clamp-2 mb-3">{supplier.description}</p>

        <div className="flex flex-wrap gap-1 mb-3">
          {supplier.categories.slice(0, 3).map(c => (
            <span key={c} className="px-2 py-0.5 rounded-md bg-[#1C1C26] border border-[#2A2A3A] text-[#555568] text-[10px]">{c}</span>
          ))}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-[#555568]">
            <span className="flex items-center gap-1"><FileText size={11} />{supplier.catalogs} cat.</span>
            <span className="flex items-center gap-1"><Play size={11} />{supplier.videos} vid.</span>
          </div>
          <button
            onClick={onClick}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[#1C1C26] hover:bg-[rgba(245,158,11,0.1)] border border-[#2A2A3A] hover:border-[rgba(245,158,11,0.3)] text-[#8888A0] hover:text-[#F59E0B] text-xs font-medium transition-all"
          >
            Ver más <ChevronRight size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

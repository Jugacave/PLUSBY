"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Check, Download, GripVertical, Loader2,
  Plus, Trash2, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Types ────────────────────────────────────────────────────────────────────

type AssemblyItem =
  | { kind: "section";      id: string; sectionType: string; imageUrl: string }
  | { kind: "announcement"; id: string; text: string; bgColor: string }
  | { kind: "cta";          id: string; text: string; subtext: string; bgColor: string }
  | { kind: "bundle";       id: string; label1: string; price1: string; badge1: string; label2: string; price2: string; badge2: string; label3: string; price3: string; badge3: string }
  | { kind: "connector";    id: string; text: string }
  | { kind: "authority";    id: string; text: string };

// ─── Metadata ─────────────────────────────────────────────────────────────────

const SECTION_META: Record<string, { label: string; icon: string }> = {
  hero:          { label: "Hero",          icon: "🎯" },
  oferta:        { label: "Oferta",        icon: "💰" },
  antes_despues: { label: "Antes/Después", icon: "🔄" },
  beneficios:    { label: "Beneficios",    icon: "✅" },
  comparativa:   { label: "Comparativa",   icon: "⚖️" },
  autoridad:     { label: "Autoridad",     icon: "🏆" },
  testimonios:   { label: "Testimonios",   icon: "⭐" },
  ingredientes:  { label: "Ingredientes",  icon: "🧪" },
  modo_uso:      { label: "Modo de Uso",   icon: "📋" },
  logistica:     { label: "Logística",     icon: "🚚" },
  faqs:          { label: "FAQs",          icon: "❓" },
};

type ElementDef = { kind: AssemblyItem["kind"]; icon: string; label: string; default: Omit<AssemblyItem, "id"> };

const ELEMENT_DEFS: ElementDef[] = [
  {
    kind: "announcement", icon: "📢", label: "Barra de Anuncios",
    default: { kind: "announcement", text: "🔥 Envío GRATIS hoy · Solo por tiempo limitado", bgColor: "#7C3AED" } as Omit<AssemblyItem, "id">,
  },
  {
    kind: "cta", icon: "🔘", label: "Botón CTA",
    default: { kind: "cta", text: "Comprar Ahora →", subtext: "Envío gratis · Pago seguro · 30 días garantía", bgColor: "#FF6B35" } as Omit<AssemblyItem, "id">,
  },
  {
    kind: "bundle", icon: "📦", label: "Bundle / Precios",
    default: { kind: "bundle", label1: "1x", price1: "", badge1: "", label2: "2x", price2: "", badge2: "Popular", label3: "3x", price3: "", badge3: "Mejor valor" } as Omit<AssemblyItem, "id">,
  },
  {
    kind: "connector", icon: "↕️", label: "Conector",
    default: { kind: "connector", text: "" } as Omit<AssemblyItem, "id">,
  },
  {
    kind: "authority", icon: "🏆", label: "Prueba de Autoridad",
    default: { kind: "authority", text: "Como aparecimos en" } as Omit<AssemblyItem, "id">,
  },
];

function getItemLabel(item: AssemblyItem): string {
  if (item.kind === "section") return (SECTION_META[item.sectionType]?.icon ?? "🖼") + " " + (SECTION_META[item.sectionType]?.label ?? item.sectionType);
  return (ELEMENT_DEFS.find(e => e.kind === item.kind)?.icon ?? "") + " " + (ELEMENT_DEFS.find(e => e.kind === item.kind)?.label ?? item.kind);
}

function uid() { return Math.random().toString(36).slice(2, 9); }

// ─── Item renderers (inside phone frame) ─────────────────────────────────────

function AnnouncementEl({ item }: { item: Extract<AssemblyItem, { kind: "announcement" }> }) {
  return (
    <div className="w-full py-2.5 px-4 flex items-center justify-center gap-2 text-white text-[11px] font-semibold"
      style={{ backgroundColor: item.bgColor }}>
      {item.text || "🔥 Envío GRATIS hoy · Oferta por tiempo limitado"}
    </div>
  );
}

function CTAEl({ item }: { item: Extract<AssemblyItem, { kind: "cta" }> }) {
  return (
    <div className="w-full px-4 py-4 flex flex-col items-center gap-2" style={{ backgroundColor: "#0A0A0F" }}>
      <button className="w-full py-4 rounded-2xl text-white font-bold text-sm shadow-lg"
        style={{ backgroundColor: item.bgColor }}>
        {item.text || "Comprar Ahora →"}
      </button>
      {item.subtext && <p className="text-[10px] text-[#555568] text-center">{item.subtext}</p>}
    </div>
  );
}

function BundleEl({ item }: { item: Extract<AssemblyItem, { kind: "bundle" }> }) {
  const pkgs = [
    { label: item.label1, price: item.price1, badge: item.badge1 },
    { label: item.label2, price: item.price2, badge: item.badge2 },
    { label: item.label3, price: item.price3, badge: item.badge3 },
  ].filter(b => b.price || b.label);

  if (pkgs.length === 0) {
    return (
      <div className="w-full px-4 py-4 bg-[#13131A] flex items-center justify-center">
        <p className="text-[10px] text-[#555568]">Bundle · Configura los precios en el panel derecho</p>
      </div>
    );
  }

  return (
    <div className="w-full px-3 py-4" style={{ backgroundColor: "#13131A" }}>
      <p className="text-white text-xs font-bold text-center mb-3">Elige tu paquete</p>
      <div className="grid grid-cols-3 gap-1.5">
        {pkgs.map((b, i) => (
          <div key={i} className="rounded-xl border border-[#2A2A3A] p-2.5 flex flex-col items-center gap-1 relative">
            {b.badge && (
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-[8px] px-1.5 py-0.5 rounded-full bg-[#7C3AED] text-white font-bold whitespace-nowrap">
                {b.badge}
              </span>
            )}
            <p className="text-[#8888A0] text-[9px] mt-1">{b.label}</p>
            <p className="text-white font-bold text-[11px]">{b.price}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ConnectorEl({ item }: { item: Extract<AssemblyItem, { kind: "connector" }> }) {
  return (
    <div className="w-full py-3 flex flex-col items-center gap-1.5" style={{ backgroundColor: "#0A0A0F" }}>
      <div className="w-px h-5 bg-[#3A3A4A]" />
      {item.text && (
        <p className="text-[9px] text-[#555568] px-3 py-1 rounded-full border border-[#2A2A3A] bg-[#13131A]">
          {item.text}
        </p>
      )}
      <div className="w-px h-5 bg-[#3A3A4A]" />
    </div>
  );
}

function AuthorityEl({ item }: { item: Extract<AssemblyItem, { kind: "authority" }> }) {
  return (
    <div className="w-full px-4 py-4" style={{ backgroundColor: "#0A0A0F" }}>
      <p className="text-[#555568] text-[9px] font-semibold uppercase tracking-wider text-center mb-2">
        {item.text || "Como aparecimos en"}
      </p>
      <div className="flex items-center justify-center gap-5">
        {["Forbes", "CNN", "El Tiempo", "Infobae"].map((logo) => (
          <span key={logo} className="text-[#3A3A4A] text-[10px] font-bold">{logo}</span>
        ))}
      </div>
    </div>
  );
}

function AssemblyItemRenderer({ item }: { item: AssemblyItem }) {
  if (item.kind === "section") {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={item.imageUrl} alt={item.sectionType} className="w-full h-auto block" />;
  }
  if (item.kind === "announcement") return <AnnouncementEl item={item} />;
  if (item.kind === "cta")          return <CTAEl item={item} />;
  if (item.kind === "bundle")       return <BundleEl item={item} />;
  if (item.kind === "connector")    return <ConnectorEl item={item} />;
  if (item.kind === "authority")    return <AuthorityEl item={item} />;
  return null;
}

// ─── Inline element editor (right panel) ─────────────────────────────────────

function InlineEditor({ item, onChange }: { item: AssemblyItem; onChange: (u: AssemblyItem) => void }) {
  if (item.kind === "section") return <p className="text-[10px] text-[#555568]">Imagen de sección — sin opciones editables.</p>;

  if (item.kind === "announcement") return (
    <div className="space-y-2.5">
      <div>
        <label className="block text-[10px] text-[#555568] mb-1">Texto</label>
        <textarea value={item.text} rows={2} onChange={(e) => onChange({ ...item, text: e.target.value })}
          className="w-full px-2 py-1.5 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A] text-[#F0F0F5] text-[10px] resize-none focus:outline-none focus:border-[#7C3AED]" />
      </div>
      <div>
        <label className="block text-[10px] text-[#555568] mb-1">Color de fondo</label>
        <div className="flex items-center gap-2">
          <input type="color" value={item.bgColor} onChange={(e) => onChange({ ...item, bgColor: e.target.value })}
            className="w-7 h-7 rounded cursor-pointer bg-transparent border-0" />
          <input value={item.bgColor} onChange={(e) => onChange({ ...item, bgColor: e.target.value })}
            className="flex-1 px-2 py-1 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A] text-[#F0F0F5] text-[9px] font-mono focus:outline-none focus:border-[#7C3AED]" />
        </div>
      </div>
    </div>
  );

  if (item.kind === "cta") return (
    <div className="space-y-2.5">
      <div>
        <label className="block text-[10px] text-[#555568] mb-1">Texto del botón</label>
        <input value={item.text} onChange={(e) => onChange({ ...item, text: e.target.value })}
          className="w-full px-2 py-1.5 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A] text-[#F0F0F5] text-[10px] focus:outline-none focus:border-[#7C3AED]" />
      </div>
      <div>
        <label className="block text-[10px] text-[#555568] mb-1">Subtexto</label>
        <input value={item.subtext} onChange={(e) => onChange({ ...item, subtext: e.target.value })}
          className="w-full px-2 py-1.5 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A] text-[#F0F0F5] text-[10px] focus:outline-none focus:border-[#7C3AED]"
          placeholder="ej: Envío gratis · Pago seguro" />
      </div>
      <div>
        <label className="block text-[10px] text-[#555568] mb-1">Color del botón</label>
        <div className="flex items-center gap-2">
          <input type="color" value={item.bgColor} onChange={(e) => onChange({ ...item, bgColor: e.target.value })}
            className="w-7 h-7 rounded cursor-pointer bg-transparent border-0" />
          <input value={item.bgColor} onChange={(e) => onChange({ ...item, bgColor: e.target.value })}
            className="flex-1 px-2 py-1 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A] text-[#F0F0F5] text-[9px] font-mono focus:outline-none focus:border-[#7C3AED]" />
        </div>
      </div>
    </div>
  );

  if (item.kind === "bundle") return (
    <div className="space-y-2">
      {([1, 2, 3] as const).map((n) => (
        <div key={n} className="border border-[#2A2A3A] rounded-lg p-2 space-y-1.5">
          <p className="text-[9px] text-[#555568] font-semibold uppercase">Paquete {n}</p>
          <input placeholder={`Label (ej: ${n}x)`}
            value={(item as Record<string, string>)[`label${n}`]}
            onChange={(e) => onChange({ ...item, [`label${n}`]: e.target.value } as typeof item)}
            className="w-full px-2 py-1 rounded bg-[#0A0A0F] border border-[#2A2A3A] text-[#F0F0F5] text-[10px] focus:outline-none focus:border-[#7C3AED]" />
          <input placeholder="Precio (ej: $59.900)"
            value={(item as Record<string, string>)[`price${n}`]}
            onChange={(e) => onChange({ ...item, [`price${n}`]: e.target.value } as typeof item)}
            className="w-full px-2 py-1 rounded bg-[#0A0A0F] border border-[#2A2A3A] text-[#F0F0F5] text-[10px] focus:outline-none focus:border-[#7C3AED]" />
          <input placeholder="Badge (ej: Popular)"
            value={(item as Record<string, string>)[`badge${n}`]}
            onChange={(e) => onChange({ ...item, [`badge${n}`]: e.target.value } as typeof item)}
            className="w-full px-2 py-1 rounded bg-[#0A0A0F] border border-[#2A2A3A] text-[#F0F0F5] text-[10px] focus:outline-none focus:border-[#7C3AED]" />
        </div>
      ))}
    </div>
  );

  if (item.kind === "connector") return (
    <div>
      <label className="block text-[10px] text-[#555568] mb-1">Texto del conector (opcional)</label>
      <input value={item.text} onChange={(e) => onChange({ ...item, text: e.target.value })}
        className="w-full px-2 py-1.5 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A] text-[#F0F0F5] text-[10px] focus:outline-none focus:border-[#7C3AED]"
        placeholder="ej: Y además..." />
    </div>
  );

  if (item.kind === "authority") return (
    <div>
      <label className="block text-[10px] text-[#555568] mb-1">Texto principal</label>
      <input value={item.text} onChange={(e) => onChange({ ...item, text: e.target.value })}
        className="w-full px-2 py-1.5 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A] text-[#F0F0F5] text-[10px] focus:outline-none focus:border-[#7C3AED]"
        placeholder="ej: Como aparecimos en" />
    </div>
  );

  return null;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AssemblerPage() {
  const params = useParams();
  const landingId = params.id as string;
  const supabase = useMemo(() => createClient(), []);
  const phoneRef = useRef<HTMLDivElement>(null);

  const [loading, setLoading]         = useState(true);
  const [productName, setProductName] = useState("");
  const [availableImages, setAvailableImages] = useState<Record<string, string[]>>({});
  const [assembly, setAssembly]       = useState<AssemblyItem[]>([]);
  const [selectedId, setSelectedId]   = useState<string | null>(null);
  const [saving, setSaving]           = useState(false);
  const [saved, setSaved]             = useState(false);
  const [downloading, setDownloading] = useState<"png" | "webp" | null>(null);
  const [dragItemId, setDragItemId]   = useState<string | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    async function load() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data } = await supabase.from("landings")
        .select("name, product, banner_images, banner_config")
        .eq("id", landingId).eq("user_id", user.id).single();
      if (!data) { setLoading(false); return; }
      setProductName(data.product ?? data.name ?? "Producto");
      if (data.banner_images) setAvailableImages(data.banner_images);
      if (data.banner_config?.assembled_landing?.items) {
        setAssembly(data.banner_config.assembled_landing.items);
      }
      setLoading(false);
    }
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [landingId]);

  function addSection(sectionType: string, imageUrl: string) {
    setAssembly(p => [...p, { kind: "section", id: uid(), sectionType, imageUrl }]);
  }

  function addElement(def: Omit<AssemblyItem, "id">) {
    setAssembly(p => [...p, { ...def, id: uid() } as AssemblyItem]);
  }

  function removeItem(id: string) {
    setAssembly(p => p.filter(i => i.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function updateItem(updated: AssemblyItem) {
    setAssembly(p => p.map(i => i.id === updated.id ? updated : i));
  }

  function moveItem(fromIndex: number, toIndex: number) {
    setAssembly(p => {
      const n = [...p];
      const [moved] = n.splice(fromIndex, 1);
      n.splice(toIndex, 0, moved);
      return n;
    });
  }

  async function handleSave() {
    setSaving(true);
    const { data: landing } = await supabase.from("landings")
      .select("banner_config").eq("id", landingId).single();
    const cfg = landing?.banner_config ?? {};
    await supabase.from("landings").update({
      banner_config: { ...cfg, assembled_landing: { items: assembly, savedAt: new Date().toISOString() } },
      updated_at: new Date().toISOString(),
    }).eq("id", landingId);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleDownload(format: "png" | "webp") {
    if (!phoneRef.current || assembly.length === 0) return;
    setDownloading(format);
    try {
      const { toPng, toBlob } = await import("html-to-image");
      const pixelRatio = 3;
      const filename = `landing-${productName.replace(/\s+/g, "-")}`;
      if (format === "png") {
        const dataUrl = await toPng(phoneRef.current, { pixelRatio, backgroundColor: "#0A0A0F", skipFonts: true });
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `${filename}-2K.png`;
        a.click();
      } else {
        const blob = await toBlob(phoneRef.current, { pixelRatio, backgroundColor: "#0A0A0F", skipFonts: true, type: "image/webp", quality: 0.90 });
        if (blob) {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = `${filename}.webp`;
          a.click();
          URL.revokeObjectURL(url);
        }
      }
    } catch (e) {
      console.error("Download error:", e);
    }
    setDownloading(null);
  }

  const selectedItem = assembly.find(i => i.id === selectedId) ?? null;
  const totalImages  = Object.values(availableImages).reduce((sum, arr) => sum + arr.length, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
        <Loader2 size={32} className="animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[var(--bg-base)] text-[var(--text-primary)] overflow-hidden">

      {/* ─── Header ──────────────────────────────────────────────────────────── */}
      <header className="flex-shrink-0 bg-[var(--bg-surface)] border-b border-[var(--border-color)]">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/landing/${landingId}/editor`}
              className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-elevated)] transition-colors">
              <ArrowLeft size={16} className="text-[var(--text-secondary)]" />
            </Link>
            <div>
              <h1 className="text-[15px] font-semibold leading-tight">{productName}</h1>
              <p className="text-[11px] text-[var(--text-muted)] leading-tight">
                Ensamblador · {assembly.length} elemento{assembly.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => handleDownload("webp")}
              disabled={!!downloading || assembly.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:border-[#7C3AED] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium transition-colors disabled:opacity-40">
              {downloading === "webp" ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
              WebP
            </button>
            <button onClick={() => handleDownload("png")}
              disabled={!!downloading || assembly.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[var(--border-color)] hover:border-[#7C3AED] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-xs font-medium transition-colors disabled:opacity-40">
              {downloading === "png" ? <Loader2 size={12} className="animate-spin" /> : <Download size={12} />}
              PNG 2K
            </button>
            <button onClick={handleSave} disabled={saving}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold transition-colors disabled:opacity-60">
              {saving ? <Loader2 size={12} className="animate-spin" /> : saved ? <Check size={12} /> : null}
              {saving ? "Guardando..." : saved ? "¡Guardado!" : "Guardar"}
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main 3-column area ──────────────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left: Library ──────────────────────────────────────────────────── */}
        <aside className="w-72 flex-shrink-0 border-r border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">

            {/* Sections */}
            <p className="text-xs font-bold mb-1">Secciones Guardadas</p>
            <p className="text-[10px] text-[var(--text-muted)] mb-4">
              {totalImages > 0
                ? `${totalImages} imagen${totalImages !== 1 ? "es" : ""} disponibles · Clic para añadir`
                : "Genera y guarda secciones desde el Studio"}
            </p>

            {Object.entries(SECTION_META).map(([sectionType, meta]) => {
              const images = availableImages[sectionType] ?? [];
              if (images.length === 0) return null;
              return (
                <div key={sectionType} className="mb-5">
                  <p className="text-[10px] font-semibold text-[var(--text-secondary)] mb-2 flex items-center gap-1">
                    <span>{meta.icon}</span>{meta.label}
                    <span className="ml-auto text-[#7C3AED] font-bold">{images.length}</span>
                  </p>
                  <div className="grid grid-cols-2 gap-1.5">
                    {images.map((url, i) => (
                      <button key={i} onClick={() => addSection(sectionType, url)}
                        className="relative rounded-lg overflow-hidden border border-[var(--border-color)] hover:border-[#7C3AED] group transition-colors"
                        style={{ aspectRatio: "9/16" }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={url} alt={meta.label} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-[#7C3AED]/0 group-hover:bg-[#7C3AED]/25 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <div className="w-7 h-7 rounded-full bg-[#7C3AED] flex items-center justify-center shadow-lg">
                            <Plus size={14} className="text-white" />
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}

            {totalImages === 0 && (
              <div className="py-8 flex flex-col items-center gap-3 text-center border-2 border-dashed border-[var(--border-color)] rounded-xl mb-4">
                <span className="text-3xl">🖼️</span>
                <p className="text-[10px] text-[var(--text-muted)] leading-relaxed max-w-[180px]">
                  Ve al Studio, genera una sección y usa el botón <strong className="text-[var(--text-secondary)]">Guardar en Landing</strong>.
                </p>
                <Link href={`/landing/${landingId}/editor`}
                  className="text-[10px] text-[#7C3AED] hover:text-[#A78BFA] flex items-center gap-1 transition-colors">
                  <ArrowLeft size={10} /> Ir al Editor
                </Link>
              </div>
            )}

            {/* Editor elements */}
            <div className="pt-4 border-t border-[var(--border-color)]">
              <p className="text-xs font-bold mb-3">Elementos</p>
              <div className="space-y-1.5">
                {ELEMENT_DEFS.map((el) => (
                  <button key={el.kind} onClick={() => addElement(el.default)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl border border-[var(--border-color)] hover:border-[#7C3AED] bg-[var(--bg-elevated)] hover:bg-[#7C3AED]/10 transition-all text-left">
                    <span className="text-sm">{el.icon}</span>
                    <p className="text-xs font-medium flex-1">{el.label}</p>
                    <Plus size={12} className="text-[var(--text-muted)] flex-shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* ── Center: Phone Preview ───────────────────────────────────────────── */}
        <main className="flex-1 flex flex-col items-center justify-start overflow-y-auto py-8 px-6 bg-[#060608]">
          {/* iPhone frame */}
          <div className="flex-shrink-0" style={{ width: 375 + 28 }}>
            <div className="relative rounded-[52px] overflow-hidden shadow-2xl shadow-black/90"
              style={{ border: "12px solid #1C1C1E", background: "#1C1C1E" }}>
              {/* Dynamic island */}
              <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-7 rounded-full z-10"
                style={{ background: "#1C1C1E" }} />
              {/* Screen */}
              <div className="overflow-hidden rounded-[42px]" style={{ width: 375 }}>
                {/* Status bar */}
                <div className="h-10 flex items-end justify-between px-7 pb-1 flex-shrink-0"
                  style={{ background: "#0A0A0F" }}>
                  <span className="text-[11px] font-semibold text-white">9:41</span>
                  <div className="flex items-center gap-1.5">
                    <svg width="16" height="11" viewBox="0 0 16 11" fill="none">
                      <rect x="0" y="4" width="3" height="7" rx="1" fill="white" fillOpacity="0.4"/>
                      <rect x="4.5" y="2.5" width="3" height="8.5" rx="1" fill="white" fillOpacity="0.6"/>
                      <rect x="9" y="0.5" width="3" height="10.5" rx="1" fill="white"/>
                    </svg>
                    <div className="w-6 h-3 rounded-sm border border-white/40 relative">
                      <div className="absolute inset-[1.5px] right-auto rounded-sm bg-white/70" style={{ width: "65%" }} />
                    </div>
                  </div>
                </div>
                {/* Content */}
                <div ref={phoneRef} style={{ background: "#0A0A0F" }}>
                  {assembly.length === 0 ? (
                    <div className="py-20 flex flex-col items-center gap-3 text-center px-8">
                      <span className="text-5xl opacity-30">📱</span>
                      <p className="text-xs text-[#3A3A4A] leading-relaxed">
                        Agrega secciones e elementos desde el panel izquierdo para armar tu landing.
                      </p>
                    </div>
                  ) : (
                    assembly.map((item) => (
                      <div key={item.id}
                        onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
                        className="cursor-pointer transition-all"
                        style={selectedId === item.id
                          ? { outline: "2px solid #7C3AED", outlineOffset: "-2px" }
                          : {}}>
                        <AssemblyItemRenderer item={item} />
                      </div>
                    ))
                  )}
                </div>
                {/* Home indicator */}
                <div className="h-8 flex items-center justify-center" style={{ background: "#0A0A0F" }}>
                  <div className="w-28 h-1 rounded-full" style={{ background: "#2A2A2A" }} />
                </div>
              </div>
            </div>
          </div>
          <p className="mt-4 text-[10px] text-[#3A3A4A]">
            375px · Descarga 3× = 1125px · Clic en elemento para editar
          </p>
        </main>

        {/* ── Right: Layers + Edit ────────────────────────────────────────────── */}
        <aside className="w-64 flex-shrink-0 border-l border-[var(--border-color)] bg-[var(--bg-surface)] flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4">

            <p className="text-xs font-bold mb-3">
              Capas · <span className="text-[var(--text-muted)] font-normal">{assembly.length}</span>
            </p>

            {assembly.length === 0 && (
              <p className="text-[10px] text-[var(--text-muted)] text-center py-6 leading-relaxed">
                Las secciones y elementos aparecerán aquí en orden.
              </p>
            )}

            <div className="space-y-1.5 mb-4">
              {assembly.map((item, idx) => (
                <div
                  key={item.id}
                  draggable
                  onDragStart={() => setDragItemId(item.id)}
                  onDragOver={(e) => { e.preventDefault(); setDragOverIndex(idx); }}
                  onDragLeave={() => setDragOverIndex(null)}
                  onDrop={() => {
                    if (dragItemId && dragItemId !== item.id) {
                      const fromIdx = assembly.findIndex(i => i.id === dragItemId);
                      moveItem(fromIdx, idx);
                    }
                    setDragItemId(null);
                    setDragOverIndex(null);
                  }}
                  onClick={() => setSelectedId(item.id === selectedId ? null : item.id)}
                  className={`flex items-center gap-2 px-2.5 py-2 rounded-xl border cursor-pointer transition-all group
                    ${selectedId === item.id
                      ? "border-[#7C3AED] bg-[#7C3AED]/10"
                      : "border-[var(--border-color)] hover:border-[var(--text-muted)]"}
                    ${dragOverIndex === idx ? "border-[#7C3AED]/50 bg-[#7C3AED]/5" : ""}`}>
                  <GripVertical size={12} className="text-[var(--text-muted)] flex-shrink-0 cursor-grab" />
                  <span className="text-[11px] flex-1 truncate font-medium">{getItemLabel(item)}</span>
                  <button
                    onClick={(e) => { e.stopPropagation(); removeItem(item.id); }}
                    className="w-5 h-5 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                    <Trash2 size={11} />
                  </button>
                </div>
              ))}
            </div>

            {/* Element editor */}
            {selectedItem && (
              <div className="border-t border-[var(--border-color)] pt-4">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] font-semibold text-[var(--text-secondary)] uppercase tracking-wide">
                    Editar
                  </p>
                  <button onClick={() => setSelectedId(null)}
                    className="w-5 h-5 flex items-center justify-center rounded text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                    <X size={12} />
                  </button>
                </div>
                <InlineEditor item={selectedItem} onChange={updateItem} />
              </div>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}

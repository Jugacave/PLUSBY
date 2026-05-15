"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Sparkles, Eye, Globe, GripVertical, Pencil, Trash2, Plus,
  Check, Loader2, ChevronDown, ChevronUp, Copy, X, Upload, Download,
  ChevronRight, Palette, RefreshCw,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Types ───────────────────────────────────────────────────────────────────

type LandingMode = "page" | "banners";

type SectionType =
  | "hero" | "benefits" | "testimonials" | "urgency" | "cta"
  | "problem" | "solution" | "features" | "pricing";

interface Section {
  id: string;
  type: SectionType;
  headline: string;
  subtext: string;
  ctaText?: string;
  items?: string[];
}

interface BannerConfig {
  description: string;
  benefits: string[];
  problems: string[];
  ingredients: string[];
  differentiator: string;
  colors: string[];
  font: string;
  country: string;
  aiModel: string;
  priceSale: string;
  priceOriginal: string;
  priceBundle2: string;
  priceBundle3: string;
  refImages: (string | null)[];
  angles: string[];
  selectedAngle: string;
}

const DEFAULT_BANNER_CONFIG: BannerConfig = {
  description: "",
  benefits: ["", "", ""],
  problems: ["", ""],
  ingredients: [""],
  differentiator: "",
  colors: ["#FF6B35", "#1C1C26", "#F0F0F5"],
  font: "Poppins",
  country: "CO",
  aiModel: "fal-flux-dev",
  priceSale: "",
  priceOriginal: "",
  priceBundle2: "",
  priceBundle3: "",
  refImages: [null, null, null],
  angles: [],
  selectedAngle: "",
};

// ─── Constants ───────────────────────────────────────────────────────────────

const SECTION_META: Record<SectionType, { label: string; icon: string; color: string }> = {
  hero:         { label: "Hero / Portada",       icon: "🎯", color: "#FF6B35" },
  benefits:     { label: "Beneficios",           icon: "✅", color: "#4ADE80" },
  testimonials: { label: "Testimonios",          icon: "💬", color: "#F59E0B" },
  urgency:      { label: "Urgencia / Escasez",   icon: "⏰", color: "#EF4444" },
  cta:          { label: "Llamado a la Acción",  icon: "🚀", color: "#FF6B35" },
  problem:      { label: "El Problema",          icon: "😣", color: "#8B5CF6" },
  solution:     { label: "La Solución",          icon: "💡", color: "#06B6D4" },
  features:     { label: "Características",      icon: "⚡", color: "#7C3AED" },
  pricing:      { label: "Precio / Oferta",      icon: "💰", color: "#4ADE80" },
};

const SECTION_TYPES_LIST: SectionType[] = [
  "hero", "problem", "solution", "benefits", "features",
  "testimonials", "pricing", "urgency", "cta",
];

const BANNER_SECTIONS = [
  { id: "hero",          label: "Hero / Portada",           icon: "🎯" },
  { id: "oferta",        label: "Oferta / Precio",          icon: "💰" },
  { id: "antes_despues", label: "Antes y Después",          icon: "🔄" },
  { id: "beneficios",    label: "Beneficios",               icon: "✅" },
  { id: "comparativa",   label: "Comparativa",              icon: "⚖️" },
  { id: "autoridad",     label: "Autoridad / Confianza",    icon: "🏆" },
  { id: "testimonios",   label: "Testimonios",              icon: "⭐" },
  { id: "ingredientes",  label: "Ingredientes / Materiales",icon: "🧪" },
  { id: "modo_uso",      label: "Modo de Uso",              icon: "📋" },
  { id: "logistica",     label: "Logística / Envío",        icon: "🚚" },
  { id: "faqs",          label: "Preguntas Frecuentes",     icon: "❓" },
];

const COUNTRIES = [
  { code: "CO", name: "Colombia",   flag: "🇨🇴", currency: "$" },
  { code: "MX", name: "México",     flag: "🇲🇽", currency: "$" },
  { code: "PA", name: "Panamá",     flag: "🇵🇦", currency: "$" },
  { code: "EC", name: "Ecuador",    flag: "🇪🇨", currency: "$" },
  { code: "PE", name: "Perú",       flag: "🇵🇪", currency: "S/" },
  { code: "CL", name: "Chile",      flag: "🇨🇱", currency: "$" },
  { code: "PY", name: "Paraguay",   flag: "🇵🇾", currency: "₲" },
  { code: "AR", name: "Argentina",  flag: "🇦🇷", currency: "$" },
  { code: "GT", name: "Guatemala",  flag: "🇬🇹", currency: "Q" },
  { code: "ES", name: "España",     flag: "🇪🇸", currency: "€" },
];

const AI_MODELS = [
  { id: "fal-flux-dev", label: "Flux Dev",           desc: "Rápido y económico — Ideal para volumen", price: "~$0.03", keyField: "fal" },
  { id: "fal-flux-pro", label: "Flux Pro",           desc: "Alta calidad, texto perfecto, resolución 4K", price: "~$0.05", keyField: "fal" },
  { id: "openai-dalle3",label: "DALL-E 3",           desc: "Máxima calidad OpenAI (requiere key OpenAI)", price: "~$0.04", keyField: "openai" },
  { id: "fal-sd-xl",    label: "Stable Diffusion XL",desc: "Creativo y versátil", price: "~$0.02", keyField: "fal" },
];

const FONTS = [
  "Poppins", "Montserrat", "Roboto", "Inter", "Nunito",
  "Raleway", "Open Sans", "Lato", "Oswald", "Playfair Display",
  "DM Sans", "Urbanist", "Bebas Neue", "Work Sans",
];

// ─── Shared: EditPanel ───────────────────────────────────────────────────────

function EditPanel({ section, onSave, onClose, product }: {
  section: Section; onSave: (s: Section) => void; onClose: () => void; product: string;
}) {
  const [headline, setHeadline] = useState(section.headline);
  const [subtext, setSubtext] = useState(section.subtext);
  const [ctaText, setCtaText] = useState(section.ctaText ?? "");
  const [items, setItems] = useState<string[]>(section.items ?? []);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const meta = SECTION_META[section.type];

  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("/api/landing/generate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionType: section.type, product }),
      });
      const data = await res.json();
      if (data.ok) {
        setHeadline(data.headline ?? headline);
        setSubtext(data.subtext ?? subtext);
        if (data.ctaText) setCtaText(data.ctaText);
        if (data.items) setItems(data.items);
      }
    } catch { /* keep edits */ } finally { setGenerating(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl w-full max-w-md h-[calc(100vh-2rem)] overflow-y-auto flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A3A] sticky top-0 bg-[#13131A] z-10">
          <div className="flex items-center gap-2">
            <span className="text-lg">{meta.icon}</span>
            <div>
              <p className="text-[#F0F0F5] font-semibold text-sm">{meta.label}</p>
              <p className="text-[#555568] text-xs">Editar contenido</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555568] hover:text-[#8888A0] hover:bg-[#2A2A3A] transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="p-4 flex-1 space-y-4">
          <button onClick={handleGenerate} disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] text-white font-semibold text-sm hover:opacity-90 disabled:opacity-60 transition-all">
            {generating ? <><Loader2 size={14} className="animate-spin" />Generando...</> : <><Sparkles size={14} />Generar con IA</>}
          </button>
          <div>
            <label className="block text-xs font-medium text-[#F0F0F5] mb-1.5">Headline</label>
            <textarea value={headline} onChange={(e) => setHeadline(e.target.value)} rows={3}
              className="w-full px-3 py-2.5 rounded-lg bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] focus:outline-none focus:border-[#7C3AED] text-sm resize-none transition-colors" />
          </div>
          <div>
            <label className="block text-xs font-medium text-[#F0F0F5] mb-1.5">Subtexto</label>
            <textarea value={subtext} onChange={(e) => setSubtext(e.target.value)} rows={4}
              className="w-full px-3 py-2.5 rounded-lg bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] focus:outline-none focus:border-[#7C3AED] text-sm resize-none transition-colors" />
          </div>
          {(section.type === "hero" || section.type === "cta" || section.type === "urgency") && (
            <div>
              <label className="block text-xs font-medium text-[#F0F0F5] mb-1.5">Texto del botón</label>
              <input value={ctaText} onChange={(e) => setCtaText(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] focus:outline-none focus:border-[#7C3AED] text-sm transition-colors" />
            </div>
          )}
          {(section.type === "benefits" || section.type === "features" || section.type === "testimonials") && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#F0F0F5]">Puntos</label>
                <button onClick={() => setItems([...items, ""])} className="text-[10px] text-[#7C3AED] hover:text-[#A78BFA] flex items-center gap-1">
                  <Plus size={11} /> Añadir
                </button>
              </div>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input value={item} onChange={(e) => { const n = [...items]; n[i] = e.target.value; setItems(n); }}
                      className="flex-1 px-3 py-2 rounded-lg bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] focus:outline-none focus:border-[#7C3AED] text-xs transition-colors" />
                    <button onClick={() => setItems(items.filter((_, j) => j !== i))} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555568] hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-[#2A2A3A] sticky bottom-0 bg-[#13131A] flex gap-2">
          <button onClick={() => { const t = [headline, subtext, ctaText, ...(items ?? [])].filter(Boolean).join("\n\n"); navigator.clipboard.writeText(t); setCopied(true); setTimeout(() => setCopied(false), 2000); }}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#2A2A3A] text-[#8888A0] hover:text-[#F0F0F5] transition-colors">
            {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
          </button>
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-[#2A2A3A] text-[#8888A0] hover:text-[#F0F0F5] font-semibold text-sm transition-colors">Cancelar</button>
          <button onClick={() => onSave({ ...section, headline, subtext, ctaText: ctaText || undefined, items: items.length > 0 ? items : undefined })}
            className="flex-1 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white font-semibold text-sm transition-colors">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared: EditorTopbar ─────────────────────────────────────────────────────

function EditorTopbar({ landingName, slug, published, saving, saved, mode, onTogglePublish, onSave }: {
  landingName: string; slug: string; published: boolean; saving: boolean; saved: boolean;
  mode: LandingMode; onTogglePublish: () => Promise<void>; onSave: () => Promise<void>;
}) {
  return (
    <div className="sticky top-0 z-40 bg-[#13131A] border-b border-[#2A2A3A] px-4 py-3 flex items-center gap-3">
      <Link href="/landing" className="flex items-center gap-1.5 text-[#8888A0] hover:text-[#F0F0F5] transition-colors text-sm">
        <ArrowLeft size={16} /><span className="hidden sm:inline">Mis Landings</span>
      </Link>
      <div className="h-4 w-px bg-[#2A2A3A]" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[#F0F0F5] font-semibold text-sm truncate">{landingName || "Landing sin nombre"}</p>
          <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md"
            style={mode === "banners" ? { background: "rgba(124,58,237,0.2)", color: "#A78BFA" } : { background: "rgba(255,107,53,0.15)", color: "#FF6B35" }}>
            {mode === "banners" ? "🖼️ Banners" : "📄 Página"}
          </span>
        </div>
        {slug && mode === "page" && <p className="text-[#555568] text-xs font-mono hidden sm:block">app.plusby.co/l/{slug}</p>}
      </div>
      <div className="flex items-center gap-2">
        {slug && mode === "page" && (
          <Link href={`/l/${slug}`} target="_blank" className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2A2A3A] text-[#8888A0] hover:text-[#F0F0F5] text-xs font-medium transition-colors">
            <Eye size={13} /><span className="hidden sm:inline">Vista previa</span>
          </Link>
        )}
        {mode === "page" && (
          <button onClick={onTogglePublish}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${published ? "bg-green-400/20 text-green-400 border border-green-400/30" : "bg-[#1C1C26] border border-[#2A2A3A] text-[#8888A0] hover:border-[#3A3A4A] hover:text-[#F0F0F5]"}`}>
            <Globe size={13} />{published ? "Publicada" : "Publicar"}
          </button>
        )}
        <button onClick={onSave} disabled={saving}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#FF6B35] hover:bg-[#FF8C5A] text-white text-xs font-semibold transition-colors disabled:opacity-60">
          {saving ? <Loader2 size={13} className="animate-spin" /> : saved ? <Check size={13} /> : null}
          {saving ? "Guardando..." : saved ? "Guardado" : "Guardar"}
        </button>
      </div>
    </div>
  );
}

// ─── Page Mode components (unchanged) ────────────────────────────────────────

function SectionPreview({ section }: { section: Section }) {
  const meta = SECTION_META[section.type];
  return (
    <div className="pointer-events-none select-none">
      {section.type === "hero" && (
        <div className="bg-gradient-to-br from-[#1C1C26] to-[#13131A] rounded-xl p-6 text-center border border-[#2A2A3A]">
          <h2 className="font-bold text-lg leading-tight mb-2" style={{ color: meta.color }}>{section.headline}</h2>
          <p className="text-[#8888A0] text-sm mb-4">{section.subtext}</p>
          {section.ctaText && <span className="inline-block px-5 py-2.5 rounded-xl text-white font-bold text-sm" style={{ background: meta.color }}>{section.ctaText}</span>}
        </div>
      )}
      {section.type === "benefits" && (
        <div className="bg-[#1C1C26] rounded-xl p-5 border border-[#2A2A3A]">
          <h3 className="text-[#F0F0F5] font-bold text-base mb-1">{section.headline}</h3>
          <p className="text-[#8888A0] text-xs mb-3">{section.subtext}</p>
          {section.items && (
            <ul className="space-y-1.5">
              {section.items.slice(0, 3).map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-[#8888A0]">
                  <span style={{ color: meta.color }} className="mt-0.5 shrink-0">✓</span>{item}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
      {!["hero", "benefits"].includes(section.type) && (
        <div className="bg-[#1C1C26] rounded-xl p-5 border border-[#2A2A3A]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{meta.icon}</span>
            <span className="text-xs font-medium" style={{ color: meta.color }}>{meta.label}</span>
          </div>
          <h3 className="text-[#F0F0F5] font-bold text-sm mb-1 leading-tight">{section.headline}</h3>
          <p className="text-[#8888A0] text-xs leading-relaxed line-clamp-2">{section.subtext}</p>
          {section.ctaText && <span className="inline-block mt-3 px-4 py-1.5 rounded-lg text-white font-semibold text-xs" style={{ background: meta.color }}>{section.ctaText}</span>}
        </div>
      )}
    </div>
  );
}

function AddSectionModal({ onAdd, onClose, existing }: { onAdd: (t: SectionType) => void; onClose: () => void; existing: SectionType[] }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A3A]">
          <h2 className="text-[#F0F0F5] font-bold">Agregar sección</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555568] hover:text-[#8888A0] hover:bg-[#2A2A3A] transition-colors"><X size={15} /></button>
        </div>
        <div className="p-4 space-y-2">
          {SECTION_TYPES_LIST.map((type) => {
            const meta = SECTION_META[type];
            const already = existing.includes(type);
            return (
              <button key={type} onClick={() => { onAdd(type); onClose(); }} disabled={already}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#2A2A3A] hover:border-[#3A3A4A] hover:bg-[#1C1C26] transition-all disabled:opacity-40 disabled:cursor-not-allowed text-left">
                <span className="text-xl">{meta.icon}</span>
                <p className="text-[#F0F0F5] text-sm font-medium flex-1">{meta.label}</p>
                {already && <span className="text-[#555568] text-xs">Ya agregado</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function PageEditorContent({ sections, setSections, product }: {
  sections: Section[]; setSections: React.Dispatch<React.SetStateAction<Section[]>>; product: string;
}) {
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);

  function handleSaveSection(updated: Section) { setSections((p) => p.map((s) => (s.id === updated.id ? updated : s))); setEditingSection(null); }
  function handleMoveUp(idx: number) { if (idx === 0) return; setSections((p) => { const n = [...p]; [n[idx - 1], n[idx]] = [n[idx], n[idx - 1]]; return n; }); }
  function handleMoveDown(idx: number) { setSections((p) => { const n = [...p]; [n[idx], n[idx + 1]] = [n[idx + 1], n[idx]]; return n; }); }
  function handleDelete(id: string) { setSections((p) => p.filter((s) => s.id !== id)); }
  function handleAddSection(type: SectionType) {
    const meta = SECTION_META[type];
    setSections((p) => [...p, { id: `s${Date.now()}`, type, headline: `${meta.icon} ${meta.label} de tu producto`, subtext: "Escribe aquí o usa IA para generar el contenido.", ctaText: ["cta", "hero", "urgency"].includes(type) ? "Comprar ahora" : undefined, items: ["benefits", "features"].includes(type) ? ["Beneficio 1", "Beneficio 2", "Beneficio 3"] : undefined }]);
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-3">
      {editingSection && <EditPanel section={editingSection} product={product} onSave={handleSaveSection} onClose={() => setEditingSection(null)} />}
      {showAddSection && <AddSectionModal onAdd={handleAddSection} onClose={() => setShowAddSection(false)} existing={sections.map((s) => s.type)} />}
      <div className="flex items-center justify-between mb-2">
        <p className="text-[#8888A0] text-xs">{sections.length} sección{sections.length !== 1 ? "es" : ""} · Arrastra para reordenar</p>
        <button onClick={() => setShowAddSection(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-[#3A3A4A] hover:border-[#FF6B35] text-[#555568] hover:text-[#FF6B35] text-xs font-medium transition-colors">
          <Plus size={13} />Agregar sección
        </button>
      </div>
      {sections.length === 0 && (
        <div className="bg-[#13131A] border-2 border-dashed border-[#2A2A3A] rounded-2xl flex flex-col items-center justify-center py-16 px-8 text-center">
          <p className="text-[#8888A0] text-sm mb-4">Esta landing no tiene secciones aún.</p>
          <button onClick={() => setShowAddSection(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white font-semibold text-sm transition-colors"><Plus size={14} />Agregar primera sección</button>
        </div>
      )}
      {sections.map((section, idx) => {
        const meta = SECTION_META[section.type];
        return (
          <div key={section.id} className={`group relative bg-[#13131A] border rounded-2xl transition-all ${dragOver === section.id ? "border-[#FF6B35]" : "border-[#2A2A3A] hover:border-[#3A3A4A]"}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(section.id); }} onDragLeave={() => setDragOver(null)} onDrop={() => setDragOver(null)}>
            <div className="flex items-center gap-3 px-4 pt-4 pb-2">
              <div className="cursor-grab text-[#3A3A4A] hover:text-[#555568]"><GripVertical size={16} /></div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold" style={{ background: `${meta.color}18`, color: meta.color }}>
                <span>{meta.icon}</span>{meta.label}
              </div>
              <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleMoveUp(idx)} disabled={idx === 0} className="w-6 h-6 flex items-center justify-center rounded text-[#555568] hover:text-[#F0F0F5] disabled:opacity-30"><ChevronUp size={14} /></button>
                <button onClick={() => handleMoveDown(idx)} disabled={idx === sections.length - 1} className="w-6 h-6 flex items-center justify-center rounded text-[#555568] hover:text-[#F0F0F5] disabled:opacity-30"><ChevronDown size={14} /></button>
                <button onClick={() => setEditingSection(section)} className="w-6 h-6 flex items-center justify-center rounded text-[#555568] hover:text-[#A78BFA]"><Pencil size={13} /></button>
                <button onClick={() => handleDelete(section.id)} className="w-6 h-6 flex items-center justify-center rounded text-[#555568] hover:text-red-400"><Trash2 size={13} /></button>
              </div>
            </div>
            <div className="px-4 pb-4"><SectionPreview section={section} /></div>
            <button onClick={() => setEditingSection(section)} className="absolute inset-0 rounded-2xl opacity-0 focus:opacity-100" aria-label={`Editar ${meta.label}`} />
          </div>
        );
      })}
      <button onClick={() => setShowAddSection(true)} className="w-full py-4 rounded-2xl border-2 border-dashed border-[#2A2A3A] hover:border-[#FF6B35] text-[#555568] hover:text-[#FF6B35] text-sm font-medium transition-colors flex items-center justify-center gap-2">
        <Plus size={16} />Agregar nueva sección
      </button>
    </div>
  );
}

// ─── Banner Mode: Accordion Section ──────────────────────────────────────────

function AccordionSection({ title, icon, defaultOpen = false, children }: {
  title: string; icon: React.ReactNode; defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl overflow-hidden">
      <button onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-[#1C1C26] transition-colors">
        <div className="flex items-center gap-2.5">
          <span className="text-[#A78BFA]">{icon}</span>
          <span className="text-[#F0F0F5] font-semibold text-sm">{title}</span>
        </div>
        <ChevronDown size={16} className={`text-[#555568] transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && <div className="px-4 pb-4 border-t border-[#1C1C26]"><div className="pt-4">{children}</div></div>}
    </div>
  );
}

// ─── Banner Mode: DynamicList ─────────────────────────────────────────────────

function DynamicList({ label, items, onChange, placeholder }: {
  label: string; items: string[]; onChange: (items: string[]) => void; placeholder?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="text-xs font-medium text-[#8888A0]">{label}</label>
        <button onClick={() => onChange([...items, ""])} className="text-[10px] text-[#7C3AED] hover:text-[#A78BFA] flex items-center gap-1 transition-colors">
          <Plus size={11} /> Añadir
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-2">
            <input value={item} onChange={(e) => { const n = [...items]; n[i] = e.target.value; onChange(n); }}
              placeholder={placeholder}
              className="flex-1 px-3 py-2 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#7C3AED] text-xs transition-colors" />
            <button onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555568] hover:text-red-400 transition-colors">
              <Trash2 size={13} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <button onClick={() => onChange([""])} className="w-full py-2 rounded-lg border border-dashed border-[#2A2A3A] text-[#555568] text-xs hover:border-[#3A3A4A] transition-colors">
            + Agregar
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Banner Mode: RefImageUpload ──────────────────────────────────────────────

function RefImageUpload({ idx, url, landingId, onChange }: {
  idx: number; url: string | null; landingId: string; onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  async function handleFile(file: File) {
    setUploading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }
    const path = `landing-banners/${landingId}/ref-${idx}-${Date.now()}`;
    const { error } = await supabase.storage.from("store-logos").upload(path, file, { upsert: true });
    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("store-logos").getPublicUrl(path);
      onChange(publicUrl);
    }
    setUploading(false);
  }

  return (
    <div className="relative">
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      <button onClick={() => fileRef.current?.click()}
        className="w-full aspect-square rounded-xl border-2 border-dashed border-[#2A2A3A] hover:border-[#7C3AED] flex flex-col items-center justify-center transition-colors overflow-hidden bg-[#0A0A0F]">
        {uploading ? (
          <Loader2 size={20} className="animate-spin text-[#555568]" />
        ) : url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={`ref ${idx + 1}`} className="w-full h-full object-cover" />
        ) : (
          <>
            <Upload size={20} className="text-[#555568] mb-1.5" />
            <p className="text-[#555568] text-xs">Imagen {idx + 1}</p>
          </>
        )}
      </button>
    </div>
  );
}

// ─── Banner Mode: BannerImageCard ─────────────────────────────────────────────

function BannerImageCard({ section, config, onImageGenerated }: {
  section: { id: string; label: string; icon: string };
  config: BannerConfig;
  onImageGenerated: (url: string) => void;
}) {
  const [images, setImages] = useState<string[]>([]);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    const refImageUrl = config.refImages.find((r) => r !== null) ?? undefined;
    try {
      const res = await fetch("/api/landing/generate-banner-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionType: section.id,
          productDescription: config.description,
          angle: config.selectedAngle,
          colors: config.colors,
          font: config.font,
          country: config.country,
          aiModel: config.aiModel,
          refImageUrl,
          priceSale: config.priceSale,
          priceOriginal: config.priceOriginal,
        }),
      });
      const data = await res.json();
      if (data.ok && data.imageUrl) {
        setImages((p) => [data.imageUrl, ...p]);
        onImageGenerated(data.imageUrl);
      } else {
        setError(data.error ?? "Error al generar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{section.icon}</span>
          <p className="text-[#F0F0F5] font-semibold text-sm">{section.label}</p>
        </div>
        <button onClick={handleGenerate} disabled={generating}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-xs font-semibold transition-colors disabled:opacity-60"
          style={{ background: "#7C3AED" }}>
          {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          {generating ? "Generando..." : images.length > 0 ? "Regenerar" : "Generar"}
        </button>
      </div>

      {error && (
        <div className="mb-3 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      {images.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {images.map((url, i) => (
            <div key={i} className="relative group aspect-square rounded-lg overflow-hidden bg-[#0A0A0F]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`${section.label} ${i + 1}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <a href={url} download={`${section.id}-${i + 1}.jpg`} target="_blank" rel="noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors">
                  <Download size={14} />
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="aspect-[3/1] rounded-xl border border-dashed border-[#2A2A3A] flex items-center justify-center text-[#3A3A4A] text-xs">
          {generating ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={20} className="animate-spin text-[#555568]" />
              <span className="text-[#555568]">Generando con IA...</span>
            </div>
          ) : (
            "Haz clic en Generar para crear este banner"
          )}
        </div>
      )}
    </div>
  );
}

// ─── Banner Mode: BannerEditorContent ────────────────────────────────────────

function BannerEditorContent({ config, setConfig, generatedImages, setGeneratedImages, product: initialProduct, landingId }: {
  config: BannerConfig;
  setConfig: React.Dispatch<React.SetStateAction<BannerConfig>>;
  generatedImages: Record<string, string[]>;
  setGeneratedImages: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  product: string;
  landingId: string;
}) {
  const [generatingAngles, setGeneratingAngles] = useState(false);

  function upd(patch: Partial<BannerConfig>) { setConfig((p) => ({ ...p, ...patch })); }

  async function handleGenerateAngles() {
    if (!config.description && !initialProduct) return;
    setGeneratingAngles(true);
    try {
      const res = await fetch("/api/landing/generate-angles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: config.description || initialProduct,
          benefits: config.benefits,
          problems: config.problems,
          ingredients: config.ingredients,
          differentiator: config.differentiator,
          country: config.country,
        }),
      });
      const data = await res.json();
      if (data.ok && data.angles) upd({ angles: data.angles, selectedAngle: data.angles[0] ?? "" });
    } catch { /* noop */ } finally { setGeneratingAngles(false); }
  }

  const selectedModel = AI_MODELS.find((m) => m.id === config.aiModel);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6 space-y-4">
      {/* ── Contexto del Producto ── */}
      <AccordionSection title="Contexto del Producto" icon={<Sparkles size={16} />} defaultOpen>
        <div className="space-y-4">
          <p className="text-[#555568] text-xs">Entre más contexto proporciones, mejores serán los banners y ángulos generados.</p>
          <div>
            <label className="block text-xs font-medium text-[#8888A0] mb-1.5">Descripción del Producto</label>
            <textarea value={config.description} onChange={(e) => upd({ description: e.target.value })}
              rows={4} placeholder="Describe el producto en detalle: qué es, cómo funciona, sus características principales..."
              className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#7C3AED] text-sm resize-none transition-colors" />
          </div>
          <DynamicList label="Beneficios Principales" items={config.benefits} onChange={(v) => upd({ benefits: v })} placeholder="Ej: Reduce medidas desde el primer uso" />
          <DynamicList label="Problemas que Resuelve" items={config.problems} onChange={(v) => upd({ problems: v })} placeholder="Ej: Dolor de espalda por mala postura" />
          <DynamicList label="Ingredientes / Materiales / Componentes" items={config.ingredients} onChange={(v) => upd({ ingredients: v })} placeholder="Ej: Tejido térmico neopreno premium" />
          <div>
            <label className="block text-xs font-medium text-[#8888A0] mb-1.5">Diferenciador</label>
            <textarea value={config.differentiator} onChange={(e) => upd({ differentiator: e.target.value })}
              rows={2} placeholder="¿Qué te hace único frente a la competencia?"
              className="w-full px-3 py-2.5 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#7C3AED] text-sm resize-none transition-colors" />
          </div>
          <button onClick={handleGenerateAngles} disabled={generatingAngles}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-white font-semibold text-sm transition-colors disabled:opacity-60"
            style={{ background: generatingAngles ? "#555568" : "#FF6B35" }}>
            {generatingAngles ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {generatingAngles ? "Generando Ángulos de Venta..." : "💡 Generar Ángulos de Venta con IA"}
          </button>
          {config.angles.length > 0 && (
            <div>
              <p className="text-xs font-medium text-[#8888A0] mb-2">Selecciona el ángulo para tus banners:</p>
              <div className="flex flex-wrap gap-2">
                {config.angles.map((angle, i) => (
                  <button key={i} onClick={() => upd({ selectedAngle: angle })}
                    className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                    style={config.selectedAngle === angle
                      ? { background: "#FF6B35", color: "#fff" }
                      : { background: "#1C1C26", color: "#8888A0", border: "1px solid #2A2A3A" }}>
                    {angle}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </AccordionSection>

      {/* ── País destino ── */}
      <AccordionSection title="País Destino del Anuncio" icon={<Globe size={16} />}>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          {COUNTRIES.map((c) => (
            <button key={c.code} onClick={() => upd({ country: c.code })}
              className="flex flex-col items-center gap-1 p-3 rounded-xl border transition-all"
              style={config.country === c.code
                ? { border: "1px solid #7C3AED", background: "rgba(124,58,237,0.12)" }
                : { border: "1px solid #2A2A3A", background: "#1C1C26" }}>
              <span className="text-xl">{c.flag}</span>
              <span className="text-[9px] font-bold text-[#8888A0]">{c.code}</span>
              <span className="text-[9px] text-[#555568]">{c.currency}</span>
            </button>
          ))}
        </div>
      </AccordionSection>

      {/* ── Estilo Visual ── */}
      <AccordionSection title="Estilo Visual" icon={<Palette size={16} />}>
        <div className="space-y-5">
          {/* Colors */}
          <div>
            <label className="block text-xs font-medium text-[#8888A0] mb-2">Paleta de Colores (3 colores principales)</label>
            <div className="flex gap-3">
              {config.colors.map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-1.5">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#2A2A3A] cursor-pointer">
                    <div className="absolute inset-0" style={{ background: color }} />
                    <input type="color" value={color}
                      onChange={(e) => { const nc = [...config.colors]; nc[i] = e.target.value; upd({ colors: nc }); }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  </div>
                  <span className="text-[9px] font-mono text-[#555568]">{color}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Font */}
          <div>
            <label className="block text-xs font-medium text-[#8888A0] mb-2">Tipografía</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {FONTS.map((font) => (
                <button key={font} onClick={() => upd({ font })}
                  className="px-3 py-2 rounded-lg border text-sm text-left transition-all"
                  style={config.font === font
                    ? { border: "1px solid #7C3AED", background: "rgba(124,58,237,0.12)", color: "#A78BFA", fontFamily: font }
                    : { border: "1px solid #2A2A3A", background: "#1C1C26", color: "#8888A0", fontFamily: font }}>
                  {font}
                </button>
              ))}
            </div>
          </div>
        </div>
      </AccordionSection>

      {/* ── Modelo de IA ── */}
      <AccordionSection title="Modelo de IA para Imágenes" icon={<Sparkles size={16} />}>
        <div className="space-y-2">
          {selectedModel && (
            <div className="mb-3 p-3 rounded-xl border border-[rgba(124,58,237,0.3)] bg-[rgba(124,58,237,0.08)] flex items-center justify-between">
              <div>
                <p className="text-[#A78BFA] font-semibold text-sm">{selectedModel.label}</p>
                <p className="text-[#555568] text-xs">{selectedModel.desc}</p>
              </div>
              <span className="text-[#A78BFA] text-sm font-mono">{selectedModel.price}</span>
            </div>
          )}
          {AI_MODELS.map((m) => (
            <button key={m.id} onClick={() => upd({ aiModel: m.id })}
              className="w-full flex items-center justify-between gap-3 p-3 rounded-xl border text-left transition-all"
              style={config.aiModel === m.id
                ? { border: "1px solid #7C3AED", background: "rgba(124,58,237,0.1)" }
                : { border: "1px solid #2A2A3A", background: "#1C1C26" }}>
              <div>
                <p className="text-[#F0F0F5] font-medium text-sm">{m.label}</p>
                <p className="text-[#555568] text-xs">{m.desc}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="text-[#8888A0] text-xs font-mono">{m.price}</span>
                {config.aiModel === m.id && <div className="w-2 h-2 rounded-full bg-[#7C3AED]" />}
              </div>
            </button>
          ))}
        </div>
      </AccordionSection>

      {/* ── Precios ── */}
      <AccordionSection title="Precios del Producto" icon={<span className="text-base">💰</span>}>
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: "Precio Oferta", field: "priceSale", placeholder: "89.900" },
            { label: "Precio Antes", field: "priceOriginal", placeholder: "150.000" },
            { label: "Precio x 2 Unidades", field: "priceBundle2", placeholder: "160.000" },
            { label: "Precio x 3 Unidades", field: "priceBundle3", placeholder: "220.000" },
          ].map(({ label, field, placeholder }) => (
            <div key={field}>
              <label className="block text-xs font-medium text-[#8888A0] mb-1.5">{label}</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555568] text-xs">
                  {COUNTRIES.find((c) => c.code === config.country)?.currency ?? "$"}
                </span>
                <input
                  value={(config as unknown as Record<string, string>)[field] ?? ""}
                  onChange={(e) => upd({ [field]: e.target.value } as Partial<BannerConfig>)}
                  placeholder={placeholder}
                  className="w-full pl-7 pr-3 py-2.5 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#7C3AED] text-sm transition-colors" />
              </div>
            </div>
          ))}
        </div>
      </AccordionSection>

      {/* ── Imágenes de Referencia ── */}
      <AccordionSection title="Imágenes de Referencia del Producto" icon={<Upload size={16} />}>
        <p className="text-[#555568] text-xs mb-3">Sube 3 imágenes del producto para que la IA las use como referencia visual.</p>
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <RefImageUpload key={i} idx={i} url={config.refImages[i] ?? null} landingId={landingId}
              onChange={(url) => {
                const newRefs = [...config.refImages] as (string | null)[];
                newRefs[i] = url;
                upd({ refImages: newRefs });
              }} />
          ))}
        </div>
      </AccordionSection>

      {/* ── Generar Banners ── */}
      {config.selectedAngle && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[rgba(255,107,53,0.12)] to-[rgba(230,90,43,0.06)] border border-[rgba(255,107,53,0.25)]">
          <p className="text-[#F0F0F5] font-semibold text-sm mb-1">Ángulo seleccionado</p>
          <p className="text-[#FF6B35] text-sm font-medium">{config.selectedAngle}</p>
        </div>
      )}

      {/* ── Banners Generados ── */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-[#F0F0F5] font-bold text-base flex-1">Secciones de Banners</h2>
          <span className="text-[#555568] text-xs">Genera cada sección individualmente con IA</span>
        </div>
        <div className="space-y-3">
          {BANNER_SECTIONS.map((section) => (
            <BannerImageCard
              key={section.id}
              section={section}
              config={config}
              onImageGenerated={(url) => {
                setGeneratedImages((p) => ({
                  ...p,
                  [section.id]: [url, ...(p[section.id] ?? [])],
                }));
              }}
            />
          ))}
        </div>
      </div>

      {/* Save reminder */}
      <div className="flex items-center justify-center gap-2 py-3">
        <RefreshCw size={13} className="text-[#555568]" />
        <p className="text-[#555568] text-xs">
          Haz clic en <strong className="text-[#8888A0]">Guardar</strong> en la barra superior para guardar toda la configuración.
        </p>
      </div>
    </div>
  );
}

// ─── Main: LandingEditorPage ──────────────────────────────────────────────────

export default function LandingEditorPage() {
  const params = useParams();
  const id = params?.id as string;

  const [mode, setMode] = useState<LandingMode>("page");
  const [loading, setLoading] = useState(true);
  const [landingName, setLandingName] = useState("");
  const [product, setProduct] = useState("");
  const [slug, setSlug] = useState("");
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Page mode state
  const [sections, setSections] = useState<Section[]>([]);

  // Banner mode state
  const [bannerConfig, setBannerConfig] = useState<BannerConfig>(DEFAULT_BANNER_CONFIG);
  const [generatedImages, setGeneratedImages] = useState<Record<string, string[]>>({});

  const supabase = createClient();

  useEffect(() => {
    if (!id) return;
    async function loadLanding() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const { data: landingData } = await supabase
        .from("landings").select("*").eq("id", id).eq("user_id", user.id).single();

      if (!landingData) { setLoading(false); return; }

      const landingMode: LandingMode = (landingData.mode ?? "page") as LandingMode;
      setLandingName(landingData.name);
      setProduct(landingData.product);
      setSlug(landingData.slug ?? "");
      setPublished(landingData.published ?? false);
      setMode(landingMode);

      if (landingMode === "banners") {
        if (landingData.banner_config && Object.keys(landingData.banner_config).length > 0) {
          setBannerConfig({ ...DEFAULT_BANNER_CONFIG, ...landingData.banner_config });
        } else {
          // Pre-fill description from product field
          setBannerConfig((p) => ({ ...p, description: landingData.product ?? "" }));
        }
        if (landingData.banner_images) {
          setGeneratedImages(landingData.banner_images);
        }
      } else {
        const { data: sectionsData } = await supabase
          .from("landing_sections").select("*").eq("landing_id", id).order("position");
        if (sectionsData && sectionsData.length > 0) {
          setSections(sectionsData.map((s) => ({
            id: s.id, type: s.type as SectionType,
            headline: s.headline ?? "", subtext: s.subtext ?? "",
            ctaText: s.cta_text ?? undefined, items: s.items ?? undefined,
          })));
        }
      }
      setLoading(false);
    }
    loadLanding();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSaveLanding() {
    if (!id) return;
    setSaving(true);

    if (mode === "banners") {
      await supabase.from("landings").update({
        banner_config: bannerConfig,
        banner_images: generatedImages,
        updated_at: new Date().toISOString(),
      }).eq("id", id);
    } else {
      await supabase.from("landing_sections").delete().eq("landing_id", id);
      if (sections.length > 0) {
        await supabase.from("landing_sections").insert(
          sections.map((s, idx) => ({
            landing_id: id, type: s.type, position: idx,
            headline: s.headline, subtext: s.subtext,
            cta_text: s.ctaText ?? null, items: s.items ?? null,
          }))
        );
      }
      await supabase.from("landings").update({ updated_at: new Date().toISOString() }).eq("id", id);
    }

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleTogglePublish() {
    if (!id || mode === "banners") return;
    const newPublished = !published;
    setPublished(newPublished);
    await supabase.from("landings").update({ published: newPublished }).eq("id", id);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#555568]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      <EditorTopbar
        landingName={landingName} slug={slug} published={published}
        saving={saving} saved={saved} mode={mode}
        onTogglePublish={handleTogglePublish} onSave={handleSaveLanding}
      />
      {mode === "banners" ? (
        <BannerEditorContent
          config={bannerConfig} setConfig={setBannerConfig}
          generatedImages={generatedImages} setGeneratedImages={setGeneratedImages}
          product={product} landingId={id}
        />
      ) : (
        <PageEditorContent sections={sections} setSections={setSections} product={product} />
      )}
    </div>
  );
}

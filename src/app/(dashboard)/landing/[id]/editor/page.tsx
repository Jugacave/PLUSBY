"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Sparkles, Eye, Globe, GripVertical, Pencil, Trash2, Plus,
  Check, Loader2, ChevronDown, ChevronUp, Copy, X, Upload, Download,
  ChevronRight, RefreshCw, AlertCircle,
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
  sectionStyles: Record<string, string>; // sectionId → styleId
}

interface BannerStyle {
  id: string;
  name: string;
  desc: string;
  gradient: string;
  accentColor: string;
  textColor: string;
  promptKeywords: string;
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
  aiModel: "fal-flux-ultra",
  priceSale: "",
  priceOriginal: "",
  priceBundle2: "",
  priceBundle3: "",
  refImages: [null, null, null],
  angles: [],
  selectedAngle: "",
  sectionStyles: {},
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
  { id: "hero",          label: "Hero / Portada",            icon: "🎯" },
  { id: "oferta",        label: "Oferta / Precio",           icon: "💰" },
  { id: "antes_despues", label: "Antes y Después",           icon: "🔄" },
  { id: "beneficios",    label: "Beneficios",                icon: "✅" },
  { id: "comparativa",   label: "Comparativa",               icon: "⚖️" },
  { id: "autoridad",     label: "Autoridad / Confianza",     icon: "🏆" },
  { id: "testimonios",   label: "Testimonios",               icon: "⭐" },
  { id: "ingredientes",  label: "Ingredientes / Materiales", icon: "🧪" },
  { id: "modo_uso",      label: "Modo de Uso",               icon: "📋" },
  { id: "logistica",     label: "Logística / Envío",         icon: "🚚" },
  { id: "faqs",          label: "Preguntas Frecuentes",      icon: "❓" },
];

const COUNTRIES = [
  { code: "CO", flag: "🇨🇴", currency: "$" },
  { code: "MX", flag: "🇲🇽", currency: "$" },
  { code: "PA", flag: "🇵🇦", currency: "$" },
  { code: "EC", flag: "🇪🇨", currency: "$" },
  { code: "PE", flag: "🇵🇪", currency: "S/" },
  { code: "CL", flag: "🇨🇱", currency: "$" },
  { code: "PY", flag: "🇵🇾", currency: "₲" },
  { code: "AR", flag: "🇦🇷", currency: "$" },
  { code: "GT", flag: "🇬🇹", currency: "Q" },
  { code: "ES", flag: "🇪🇸", currency: "€" },
];

const AI_MODELS = [
  { id: "fal-flux-ultra",  label: "Flux Pro Ultra",       price: "~$0.06", desc: "⭐ Más realista · Recomendado" },
  { id: "fal-imagen3",     label: "Google Imagen 3",       price: "~$0.04", desc: "Google · Fotorrealismo extremo" },
  { id: "fal-ideogram2",   label: "Ideogram v2",           price: "~$0.08", desc: "Texto en imagen · Banners con copy" },
  { id: "fal-flux-pro",    label: "Flux Pro 1.1",          price: "~$0.05", desc: "Alta calidad · 4K" },
  { id: "fal-flux-dev",    label: "Flux Dev",              price: "~$0.03", desc: "Rápido · Ideal para volumen" },
  { id: "openai-dalle3",   label: "DALL·E 3",              price: "~$0.04", desc: "OpenAI · Requiere key OpenAI" },
  { id: "fal-sd-xl",       label: "Stable Diffusion XL",   price: "~$0.02", desc: "Creativo · Versátil" },
];

const FONTS = [
  "Poppins", "Montserrat", "Roboto", "Inter", "Nunito",
  "Raleway", "Open Sans", "Lato", "Oswald", "Playfair Display",
  "DM Sans", "Urbanist", "Bebas Neue", "Work Sans",
];

// ─── Page Mode: EditPanel ─────────────────────────────────────────────────────

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

// ─── Page Mode ────────────────────────────────────────────────────────────────

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
        <p className="text-[#8888A0] text-xs">{sections.length} sección{sections.length !== 1 ? "es" : ""}</p>
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

// ─── Banner Mode: RefImageUpload (fixed) ──────────────────────────────────────

function RefImageUpload({ idx, url, landingId, onChange }: {
  idx: number; url: string | null; landingId: string; onChange: (url: string) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [localPreview, setLocalPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  const displayUrl = localPreview || url;

  async function handleFile(file: File) {
    setUploadError(null);
    setUploading(true);

    // Show local preview immediately
    const objectUrl = URL.createObjectURL(file);
    setLocalPreview(objectUrl);
    onChange(objectUrl);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setUploading(false); return; }

    const path = `landing-banners/${landingId}/ref-${idx}-${Date.now()}`;
    const { error } = await supabase.storage.from("store-logos").upload(path, file, { upsert: true, contentType: file.type });

    if (error) {
      setUploadError("Storage no configurado. Ve a Supabase → Storage → crea bucket 'store-logos' público.");
    } else {
      const { data: { publicUrl } } = supabase.storage.from("store-logos").getPublicUrl(path);
      setLocalPreview(null);
      onChange(publicUrl);
    }
    setUploading(false);
  }

  return (
    <div className="flex flex-col gap-1">
      <input ref={fileRef} type="file" accept="image/*" className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
      <button onClick={() => fileRef.current?.click()}
        className="w-full aspect-square rounded-xl border-2 border-dashed hover:border-[#7C3AED] flex flex-col items-center justify-center transition-colors overflow-hidden relative"
        style={{ borderColor: displayUrl ? "#7C3AED" : "#2A2A3A", background: "#0A0A0F" }}>
        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60 z-10">
            <Loader2 size={18} className="animate-spin text-[#A78BFA]" />
          </div>
        )}
        {displayUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={displayUrl} alt={`ref ${idx + 1}`} className="w-full h-full object-cover" />
        ) : (
          <>
            <Upload size={18} className="text-[#555568] mb-1" />
            <p className="text-[#555568] text-[10px]">Foto {idx + 1}</p>
          </>
        )}
      </button>
      {uploadError && (
        <div className="flex items-start gap-1">
          <AlertCircle size={10} className="text-yellow-500 mt-0.5 shrink-0" />
          <p className="text-[9px] text-yellow-500 leading-tight">{uploadError}</p>
        </div>
      )}
    </div>
  );
}

// ─── Banner Mode: CompactList ─────────────────────────────────────────────────

function CompactList({ label, items, onChange, placeholder }: {
  label: string; items: string[]; onChange: (items: string[]) => void; placeholder?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[10px] font-medium text-[#555568]">{label}</label>
        <button onClick={() => onChange([...items, ""])}
          className="text-[9px] text-[#7C3AED] hover:text-[#A78BFA] flex items-center gap-0.5 transition-colors">
          <Plus size={9} /> Añadir
        </button>
      </div>
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex gap-1.5">
            <input value={item} onChange={(e) => { const n = [...items]; n[i] = e.target.value; onChange(n); }}
              placeholder={placeholder}
              className="flex-1 px-2.5 py-1.5 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#3A3A4A] focus:outline-none focus:border-[#7C3AED] text-[11px] transition-colors" />
            <button onClick={() => onChange(items.filter((_, j) => j !== i))}
              className="w-6 h-6 flex items-center justify-center rounded text-[#3A3A4A] hover:text-red-400 transition-colors flex-shrink-0">
              <X size={11} />
            </button>
          </div>
        ))}
        {items.length === 0 && (
          <button onClick={() => onChange([""])}
            className="w-full py-1.5 rounded-lg border border-dashed border-[#2A2A3A] text-[#3A3A4A] text-[10px] hover:border-[#3A3A4A] transition-colors">
            + Agregar
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Banner Mode: Estilos Visuales ────────────────────────────────────────────

const HERO_STYLES: BannerStyle[] = [
  {
    id: "purple-glow",
    name: "Purple Glow",
    desc: "Púrpura oscuro · Magia y lujo",
    gradient: "radial-gradient(ellipse at 50% 70%, #4c1d95 0%, #2d0a6b 40%, #0f0118 100%)",
    accentColor: "#A78BFA",
    textColor: "#fff",
    promptKeywords: "deep purple violet atmospheric gradient background, glowing magical bokeh light particles floating, product on illuminated stage platform, circular icon badges with purple gradient glow, bold white and purple typography, decorative nature leaves floating, premium luxury advertisement, dramatic spotlight chromatic lighting, vibrant glowing accents, product hero shot",
  },
  {
    id: "pink-romance",
    name: "Pink Romance",
    desc: "Rosa suave · Romántico · Femenino",
    gradient: "radial-gradient(ellipse at 50% 40%, #fdf2f8 0%, #fce7f3 50%, #f9a8d4 100%)",
    accentColor: "#EC4899",
    textColor: "#831843",
    promptKeywords: "soft blush pink rose gradient background, romantic dreamy bokeh flower petals scattered, subtle heart shape element, product on golden hexagonal platform with sparkle glow, pink circular badge icons with illustrations, elegant cursive mixed with bold typography, lens flare sparkle effects, warm feminine pastel atmosphere, luxury beauty gift advertisement",
  },
  {
    id: "sky-kids",
    name: "Sky & Kids",
    desc: "Azul cielo · Infantil · Familiar",
    gradient: "linear-gradient(180deg, #bfdbfe 0%, #93c5fd 30%, #dbeafe 70%, #eff6ff 100%)",
    accentColor: "#F97316",
    textColor: "#1e3a5f",
    promptKeywords: "bright sky blue gradient background with fluffy white clouds, rainbow arc element, cheerful children family lifestyle photography, product on wooden platform stage, circular icon badges with orange accents, bold orange and dark blue typography with price badge strikethrough, floating hearts or balloons decorative elements, warm sunny cheerful family advertisement",
  },
  {
    id: "green-nature",
    name: "Green Nature",
    desc: "Verde natural · Salud · Orgánico",
    gradient: "radial-gradient(ellipse at 50% 30%, #d1fae5 0%, #6ee7b7 30%, #065f46 100%)",
    accentColor: "#10B981",
    textColor: "#fff",
    promptKeywords: "rich green gradient background with tropical leaves and natural foliage, health wellness product photography, golden circular trust badge 100% natural seal, circular icon badges with green gradient, bold white and green typography with golden price badge, before and after transformation split composition, fresh clean natural organic health advertisement",
  },
  {
    id: "teal-aqua",
    name: "Teal Aqua",
    desc: "Turquesa · Fresco · Limpieza",
    gradient: "radial-gradient(ellipse at 40% 30%, #ccfbf1 0%, #5eead4 40%, #0f766e 100%)",
    accentColor: "#14B8A6",
    textColor: "#fff",
    promptKeywords: "bright teal cyan aqua gradient background, fresh clean health product photography, before and after split layout with arrow transformation, circular teal icon badges with white icons, bold white typography with teal dark price badge, floating capsules or liquid drops, clean fresh deodorant supplement health advertisement, light airy atmosphere",
  },
  {
    id: "sports-blue",
    name: "Sports Blue",
    desc: "Azul eléctrico · Deporte · Alto rendimiento",
    gradient: "linear-gradient(160deg, #1d4ed8 0%, #1e40af 40%, #1e3a8a 100%)",
    accentColor: "#60A5FA",
    textColor: "#fff",
    promptKeywords: "vibrant electric blue gradient background with lightning bolt energy effects, athlete model holding product dynamic pose, fruit splash and liquid splash effects, circular spec badges with blue gradient, bold white blue red typography large headline, price offer badge, bottom trust icons strip pago seguro garantia envio gratis, high energy sports nutrition supplement advertisement",
  },
  {
    id: "sports-blue-white",
    name: "Blue & White Sport",
    desc: "Azul + blanco · Geométrico · Fresco",
    gradient: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #f0f9ff 100%)",
    accentColor: "#2563EB",
    textColor: "#1e3a8a",
    promptKeywords: "bright blue and white geometric diagonal split background, athlete model with product studio clean photography, circular icon feature badges with blue outline, bold blue white typography, clean infographic feature list layout, product label clearly visible, professional sports supplement health advertisement, fresh modern design",
  },
  {
    id: "dark-navy-gold",
    name: "Dark Navy Gold",
    desc: "Azul marino oscuro · Dorado · Premium tech",
    gradient: "radial-gradient(ellipse at 50% 30%, #1e3a5f 0%, #0f1f3a 50%, #060d1a 100%)",
    accentColor: "#D97706",
    textColor: "#fff",
    promptKeywords: "deep dark navy blue gradient background, golden particle ion effects streaming from product, hand holding product dramatic product reveal, star rating and social proof top header, bold white and gold typography extra large headline, price badge with strikethrough gold accent, circular spec icons with gold borders left sidebar, premium technology product advertisement",
  },
  {
    id: "dark-power",
    name: "Dark Power",
    desc: "Gris oscuro · Oro · Alto impacto",
    gradient: "radial-gradient(ellipse at 50% 50%, #3a3a3a 0%, #1a1a1a 50%, #080808 100%)",
    accentColor: "#F59E0B",
    textColor: "#fff",
    promptKeywords: "dark charcoal gray background with radial sunburst light rays from center, bold white and orange gold typography massive headline, price badge strikethrough urgency, four circular spec icons floating around product, dynamic hero product shot center stage, bottom brand bar strip yellow red contrasting, high energy industrial commercial advertisement power aesthetic",
  },
  {
    id: "bold-aggressive",
    name: "Bold Aggressive",
    desc: "Negro intenso · Rojo · Dramático",
    gradient: "radial-gradient(ellipse at 50% 100%, #450a0a 0%, #1a0000 40%, #0a0a0a 100%)",
    accentColor: "#DC2626",
    textColor: "#fff",
    promptKeywords: "deep black background with red volcanic lava rock texture accents, chrome metallic product photography dramatic lighting, heavy bold white and red headline typography, five star rating social proof customer count badge, price strikethrough urgency deal badge, feature icons left sidebar list layout, circular sticker badge accent, masculine aggressive powerful aesthetic, high contrast dramatic advertisement",
  },
  {
    id: "warm-lifestyle",
    name: "Warm Lifestyle",
    desc: "Beige cálido · Mascotas · Familia",
    gradient: "radial-gradient(ellipse at 50% 40%, #fef3c7 0%, #fde68a 30%, #d97706 100%)",
    accentColor: "#DC2626",
    textColor: "#1a1a1a",
    promptKeywords: "warm golden beige neutral background, lifestyle photography with pet or family model, product displayed prominently with pet or person, red price urgency badge with bold price, circular feature icon badges with red green accents, bold dark typography, warm cozy atmosphere, feature list left sidebar, lifestyle product advertisement homey comfortable feel",
  },
  {
    id: "space-galaxy",
    name: "Space Galaxy",
    desc: "Galaxia · Cosmos · Wow factor",
    gradient: "radial-gradient(ellipse at 50% 50%, #312e81 0%, #1e1b4b 40%, #030712 100%)",
    accentColor: "#818CF8",
    textColor: "#fff",
    promptKeywords: "deep space galaxy background with nebula colors teal blue pink purple, floating planets and stars, product or character centered floating in space, cosmic glowing light effects, star rating badge top, bold white and cyan glowing typography with price, magical universe atmosphere, wow factor premium product advertisement cosmic futuristic",
  },
  {
    id: "outdoor-adventure",
    name: "Outdoor Adventure",
    desc: "Montaña · Atardecer · Acción",
    gradient: "linear-gradient(180deg, #92400e 0%, #b45309 30%, #1c1917 100%)",
    accentColor: "#EF4444",
    textColor: "#fff",
    promptKeywords: "mountain outdoor landscape background golden sunset dusty terrain, action product photography dramatic natural light, red and dark price badge with arrow, three feature badges rounded rectangle red background, bold white and red metallic chrome typography, product hero shot outdoor adventure setting, athletic outdoor adventure sport advertisement dramatic composition",
  },
];

const OFERTA_STYLES: BannerStyle[] = [
  {
    id: "neon-gym-dark",
    name: "Neon Gym Dark",
    desc: "Negro · Neón rojo+azul · Atleta",
    gradient: "radial-gradient(ellipse at 50% 80%, #1a0a0a 0%, #0a0a14 50%, #000005 100%)",
    accentColor: "#EF4444",
    textColor: "#fff",
    promptKeywords: "dark black gym background with neon red and blue LED light trails and hexagon grid lines, muscular athlete holding product, three pricing bundle columns with red header badges Basic Duo Pro, bold white red blue typography large headline, product visible in each column, bottom payment logos strip, high energy sports supplement offer advertisement",
  },
  {
    id: "sports-blue-grid",
    name: "Sports Blue Grid",
    desc: "Azul gym · Profesional · 3 columnas",
    gradient: "linear-gradient(180deg, #0f1f3a 0%, #1e3a5f 40%, #0a0a14 100%)",
    accentColor: "#3B82F6",
    textColor: "#fff",
    promptKeywords: "dark blue gym mirror background with overhead lighting, two athletes man and woman with product, three pricing columns with blue-purple gradient header badges Pack Basico Pack Duo Pack Pro, bold white blue typography, product images in each column, strikethrough original price and sale price red, free shipping icon, payment logos footer mercadopago mastercard visa, professional sports bundle offer",
  },
  {
    id: "navy-fire-dynamic",
    name: "Navy Fire Dynamic",
    desc: "Azul marino · Atleta corriendo · Energía",
    gradient: "radial-gradient(ellipse at 50% 0%, #1e3a8a 0%, #1e1b4b 50%, #050510 100%)",
    accentColor: "#DC2626",
    textColor: "#fff",
    promptKeywords: "dark navy blue gradient background with dynamic running female athlete on fire energy aura, three pricing cards red and blue rounded, product quantity per card 1x 2x 3x with bold price, red CTA button Llevalo Ahora on each card, five star rating strip and customer count testimonial below, bottom icons strip delivery guarantee electrolytes, high energy sports nutrition bundle offer advertisement",
  },
  {
    id: "blue-white-vivid",
    name: "Blue White Vivid",
    desc: "Azul brillante · Blanco · Fruta flotante",
    gradient: "linear-gradient(160deg, #1d4ed8 0%, #2563eb 40%, #dbeafe 80%, #f0f9ff 100%)",
    accentColor: "#1D4ED8",
    textColor: "#1e3a8a",
    promptKeywords: "bright vivid blue-to-white gradient background, female athlete running with product, floating fruit kiwi strawberry splash elements, three dark navy blue pricing cards rounded corners with white price text, product images clearly visible in each card, CTA button Llevalo Ahora on each card, five star review section below, bottom icons delivery guarantee formula alto rendimiento, fresh vivid sports bundle offer",
  },
  {
    id: "clean-white-minimal",
    name: "Clean White Minimal",
    desc: "Blanco limpio · Navy · Minimalista",
    gradient: "linear-gradient(180deg, #f8fafc 0%, #e0f2fe 50%, #bfdbfe 100%)",
    accentColor: "#1D4ED8",
    textColor: "#0f172a",
    promptKeywords: "clean white light background with subtle blue gradient at bottom, female athlete in running pose lifestyle photography, product prominently displayed with hexagonal ingredient spec badges cluster dextrin electrolyte matrix flavor, product specifications callouts, two pricing CTA buttons horizontal layout Comprar 1 Bote and Comprar 2 Botes, clean price with was strikethrough, minimal navy blue typography, trust badge header strip, professional clean minimal offer advertisement",
  },
  {
    id: "outdoor-red-bold",
    name: "Outdoor Red Bold",
    desc: "Aventura exterior · Rojo bold · Pago footer",
    gradient: "linear-gradient(180deg, #7c2d12 0%, #9a3412 30%, #1c0a00 100%)",
    accentColor: "#EF4444",
    textColor: "#fff",
    promptKeywords: "outdoor mountain adventure earthy terrain background with cycling product, three bundle pricing columns with red header badges bold white text, red CTA button on each column, delivery truck free shipping icon in each column, bottom payment methods logos strip pagos contraentrega mercadopago mastercard visa, bold white red typography large headline product name, adventure outdoor bundle deal advertisement",
  },
  {
    id: "warm-amber-urgency",
    name: "Warm Amber Urgency",
    desc: "Ámbar dorado · Hogar · Urgencia stock",
    gradient: "radial-gradient(ellipse at 50% 30%, #fef3c7 0%, #f59e0b 50%, #78350f 100%)",
    accentColor: "#F59E0B",
    textColor: "#1a1a1a",
    promptKeywords: "warm golden amber home office lifestyle background soft lighting, product displayed on desk with lifestyle context, three pricing columns warm orange buttons, stock availability progress bar urgency element, bold dark typography with orange accent price, feature list alongside bundles, warm cozy home ambiance bundle offer advertisement",
  },
  {
    id: "dark-gold-premium",
    name: "Dark Gold Premium",
    desc: "Azul marino + partículas doradas · Lujo",
    gradient: "radial-gradient(ellipse at 50% 30%, #1e3a5f 0%, #0f1f3a 50%, #030712 100%)",
    accentColor: "#D97706",
    textColor: "#fff",
    promptKeywords: "deep dark navy blue background with golden shimmering particle effects streaming, premium product with gold particle aura, stacked vertical bundle tiers with gold border cards dark background, gold header badge on best value tier, bold white and gold typography premium large headline, price strikethrough original in gold, delivery truck guarantee icons, premium luxury bundle offer advertisement high end",
  },
  {
    id: "neon-green-winner",
    name: "Neon Green Winner",
    desc: "Negro · Verde neón · Columna ganadora",
    gradient: "radial-gradient(ellipse at 50% 50%, #052e16 0%, #0a0a0a 60%, #000000 100%)",
    accentColor: "#22C55E",
    textColor: "#fff",
    promptKeywords: "black dark background with neon green glow energy aura, sports nutrition supplement product center, three pricing columns with middle winner column highlighted in neon green border glow Mejor Valor label, white basic and winner columns, bold white and neon green typography, product image in each column, pricing strikethrough deal, high contrast neon fitness supplement bundle offer advertisement",
  },
  {
    id: "blush-feminine-soft",
    name: "Blush Feminine Soft",
    desc: "Rosa blush · Pétalos · Oferta femenina",
    gradient: "radial-gradient(ellipse at 50% 30%, #fff1f2 0%, #fecdd3 50%, #fb7185 100%)",
    accentColor: "#F43F5E",
    textColor: "#881337",
    promptKeywords: "soft blush pink background with rose petals bokeh scattered romantic, feminine lifestyle product photography, two pricing offer cards side by side rounded corners pink gradient, elegant pink rose accent typography, product image in each card, price badge with discount, feminine gift or beauty wellness product bundle offer advertisement",
  },
  {
    id: "space-galaxy-offer",
    name: "Space Galaxy Offer",
    desc: "Galaxia profunda · Dorado · Premium stacked",
    gradient: "radial-gradient(ellipse at 50% 50%, #1e1b4b 0%, #0f0a2a 50%, #020108 100%)",
    accentColor: "#818CF8",
    textColor: "#fff",
    promptKeywords: "deep space galaxy nebula background blue purple teal cosmic atmosphere, premium product floating in space with glowing light halo, stacked vertical pricing tiers with gold border and indigo border alternating, gold badge Best Value Mejor Valor on premium tier, bold white and gold indigo typography, cosmic premium luxury bundle offer advertisement",
  },
  {
    id: "red-split-athlete",
    name: "Red Split Athlete",
    desc: "Rojo + blanco split · Atleta · Beneficios",
    gradient: "linear-gradient(135deg, #dc2626 0%, #b91c1c 50%, #f8fafc 50%, #ffffff 100%)",
    accentColor: "#DC2626",
    textColor: "#fff",
    promptKeywords: "bold red and white diagonal split background, muscular athlete model with product on red side, three pricing columns named with benefit headings Equilibrio Energia Bienestar, red header with white text on each column, circular dose amount badge, product image per column, black price text on white card background, trust icons strip bottom certification badges, strong contrast red white bold bundle offer advertisement",
  },
];

const ANTES_DESPUES_STYLES: BannerStyle[] = [
  {
    id: "romantic-split",
    name: "Romantic Split",
    desc: "Gris frío → Dorado cálido · Romance · Lifestyle",
    gradient: "linear-gradient(135deg, #b0bec5 0%, #78909c 50%, #d4a017 50%, #8B6914 100%)",
    accentColor: "#D4A017",
    textColor: "#fff",
    promptKeywords: "cold desaturated gray blue BEFORE side vs warm romantic golden light AFTER side, diagonal split composition with thin gold dividing line, lifestyle couple photography romantic dinner candles roses, product gift box or beauty item displayed, dark bottom section with gold serif headline and testimonial quote, percentage stat social proof, emotional transformation advertisement",
  },
  {
    id: "outdoor-mountain-bridge",
    name: "Outdoor Mountain",
    desc: "Paisaje naturaleza · Producto al centro · Oro",
    gradient: "linear-gradient(180deg, #4a6741 0%, #2d4a2a 40%, #1a2d18 100%)",
    accentColor: "#D97706",
    textColor: "#fff",
    promptKeywords: "dramatic outdoor mountain landscape background split left vs right, ANTES tired person hunched on mountain left side vs DESPUÉS triumphant confident person standing tall right side, product supplement jar centered bridging between both scenes on stone platform glowing particles, gold text strip banner bottom with bold headline, testimonial quote and percentage stat, outdoor adventure transformation advertisement",
  },
  {
    id: "dark-problem-solution",
    name: "Problem / Solution",
    desc: "Negro · Columna problema vs producto · Oro",
    gradient: "linear-gradient(90deg, #0d1117 0%, #0d1117 50%, #1a1a2e 100%)",
    accentColor: "#F59E0B",
    textColor: "#fff",
    promptKeywords: "dark black background diagonal split blue and red accent corners, left column PROBLEMA with stacked circular photo badges showing problems lifestyle issues with dark red pill labels, right side SOLUCIÓN with large product jar center and fruit or ingredient splash, bottom text block with product name bullet point benefits specs, bold headline top asking question urgency, red and blue contrast sports supplement transformation layout",
  },
  {
    id: "peach-multishot-skin",
    name: "Peach Multishot",
    desc: "Melocotón · Múltiples pares piel · Femenino",
    gradient: "radial-gradient(ellipse at 50% 30%, #fde8d8 0%, #f5c6a8 50%, #e8956a 100%)",
    accentColor: "#C2410C",
    textColor: "#7c2d12",
    promptKeywords: "soft warm peach salmon background with floral corner elements, multiple stacked pairs of real before and after skin closeup photos in rounded frames, Antes Después label pills below each pair, bold dark headline questioning doubts about product, three feature icon badges in warm tones top section, real transformation skin beauty product advertisement feminine warm style",
  },
  {
    id: "cream-arrow-lifestyle",
    name: "Cream Arrow",
    desc: "Crema claro · Flecha naranja · Lifestyle limpio",
    gradient: "linear-gradient(180deg, #fdf6ec 0%, #faebd7 60%, #c0392b 100%)",
    accentColor: "#EA580C",
    textColor: "#1a1a1a",
    promptKeywords: "clean cream beige light background top section, side by side ANTES outdoor or old method photo vs DESPUÉS clean modern product result photo, bold orange arrow pointing right between the two photos, result time badge orange circle bottom right, dark rust red or warm brown bottom strip with customer testimonial face photo and large percentage satisfaction stat, simple clean lifestyle transformation advertisement",
  },
  {
    id: "dark-tech-lightning",
    name: "Dark Tech Lightning",
    desc: "Negro · Rayo dorado/cian · Tech · Producto HUD",
    gradient: "radial-gradient(ellipse at 50% 50%, #0a0a0a 0%, #050505 100%)",
    accentColor: "#F59E0B",
    textColor: "#fff",
    promptKeywords: "dark black background full screen, bold large white and red headline top, diagonal or vertical lightning bolt divider gold and electric blue neon between ANTES dull dark left side and DESPUÉS glowing tech product right side, before dull analog or old method vs after digital smart glowing product with neon rings or HUD display, bottom rounded gold border testimonial card with customer quote and percentage stat improvement, high contrast dramatic tech product transformation",
  },
  {
    id: "pink-floral-product",
    name: "Pink Floral",
    desc: "Rosa suave · Flores · Producto hero · Piel",
    gradient: "radial-gradient(ellipse at 50% 40%, #fce7f3 0%, #fbcfe8 50%, #f9a8d4 100%)",
    accentColor: "#DB2777",
    textColor: "#831843",
    promptKeywords: "soft blush pink full background with cherry blossom flowers scattered, circular or oval face closeup photos before and after with pink splash liquid effect, feature icon badges pink rounded squares at top, product jar or cream prominently displayed center with soft shadow, script elegant typography for testimonial section, secondary small before after photo comparison at bottom, feminine luxury beauty skin transformation advertisement",
  },
  {
    id: "dark-gold-pedestal",
    name: "Dark Gold Pedestal",
    desc: "Negro cálido · Atletas flanqueando · Pedestal dorado",
    gradient: "radial-gradient(ellipse at 50% 40%, #2d1b00 0%, #1a0f00 50%, #0a0500 100%)",
    accentColor: "#D97706",
    textColor: "#fff",
    promptKeywords: "dark warm black background with gym environment subtle, ANTES dejected tired athlete left side vs DESPUÉS triumphant flexing muscular athlete right side, product supplement jar centered on golden glowing pedestal between both figures, floating ingredient elements chocolate cocoa or flavor accents, gold white bottom strip banner with bold product name headline, customer testimonial face avatar and percentage stat, premium dark gold sports nutrition transformation advertisement",
  },
  {
    id: "neon-vertical-stacked",
    name: "Neon Vertical Stack",
    desc: "Oscuro gris ANTES arriba · Neón DESPUÉS abajo",
    gradient: "linear-gradient(180deg, #1a1a1a 0%, #111111 40%, #052e16 60%, #000000 100%)",
    accentColor: "#22C55E",
    textColor: "#fff",
    promptKeywords: "vertical stacked split composition, top half dark desaturated gray gym environment ANTES with tired dejected athlete moody lighting, middle divider with neon brand logo icon and electric lightning bolt flash, bottom half dark green neon glow gym DESPUÉS with triumphant screaming athlete holding product arms raised victorious, product jar centered at divider between sections, bold white headline bottom tagline, high energy sports supplement dramatic vertical transformation",
  },
  {
    id: "dreamy-kids",
    name: "Dreamy Kids",
    desc: "Azul frío vs rosa soñador · Niños · Estrellas",
    gradient: "linear-gradient(90deg, #1e3a5f 0%, #2563eb 50%, #db2777 50%, #be185d 100%)",
    accentColor: "#FDE68A",
    textColor: "#fff",
    promptKeywords: "vertical split background left cool blue dark bedroom ANTES vs right warm pink dreamy cozy room DESPUÉS, floating golden stars fairy lights bokeh atmosphere right side, sad or lonely child on left side vs happy smiling child hugging plush toy product right side, rounded pill badge buttons ANTES and DESPUÉS labels, bottom testimonial pill card with parent customer quote, bold percentage stat, dreamlike magical children product transformation advertisement",
  },
  {
    id: "purple-pink-energy",
    name: "Purple Pink Energy",
    desc: "Púrpura-rosa gym · Aura eléctrica · Mujer atleta",
    gradient: "radial-gradient(ellipse at 50% 30%, #6b21a8 0%, #9d174d 50%, #1a1a1a 100%)",
    accentColor: "#EC4899",
    textColor: "#fff",
    promptKeywords: "purple pink magenta gym environment background with electric lightning aura, female athlete transformation split or side by side ANTES calm neutral pose vs DESPUÉS flexing with electric energy glow aura and lightning bolts around transformed figure, product overlaid on DESPUÉS side floating, three circular or pill feature icon badges flanking composition MAYOR DEFINICION MUSCULAR FUERZA RESISTENCIA CUERPO TONIFICADO, bottom navy strip testimonial quote and percentage stat, feminine fitness transformation advertisement high energy",
  },
  {
    id: "blue-double-proof",
    name: "Blue Double Proof",
    desc: "Gym azul · Múltiples pares retrato · Testimonios",
    gradient: "linear-gradient(180deg, #1e3a8a 0%, #1d4ed8 30%, #0f172a 100%)",
    accentColor: "#3B82F6",
    textColor: "#fff",
    promptKeywords: "dark blue neon gym background with red and blue LED accent lights geometric shapes, two separate stacked pairs of portrait before and after photos in rounded rectangle frames each with red ANTES badge and blue DESPUÉS badge, after each pair a red or dark testimonial card with customer name 5 stars and quote text, product jar displayed at bottom with fruit elements, three feature icon badges strip, bold headline top, multiple social proof customer transformation fitness supplement advertisement",
  },
];

const BENEFICIOS_STYLES: BannerStyle[] = [
  {
    id: "blue-circular-orbit",
    name: "Blue Circular Orbit",
    desc: "Azul deportivo · Badges orbitan producto · Clásico",
    gradient: "radial-gradient(ellipse at 50% 60%, #1d4ed8 0%, #1e3a8a 50%, #0f1f3a 100%)",
    accentColor: "#3B82F6",
    textColor: "#fff",
    promptKeywords: "vibrant blue sports stadium background, athlete sprinting dynamically, product jar or item centered with 6 white circular icon badges arranged symmetrically 3 left 3 right with dotted connecting lines to product, each badge has icon and benefit title text below, fruit or ingredient elements scattered, bold blue-red-white headline top, tagline bottom, professional sports supplement benefits advertisement",
  },
  {
    id: "dark-arrow-callouts",
    name: "Dark Arrow Callouts",
    desc: "Oscuro · Atleta full-bleed · Flechas con specs",
    gradient: "radial-gradient(ellipse at 50% 40%, #1e3a8a 0%, #0a0a14 60%, #000000 100%)",
    accentColor: "#22D3EE",
    textColor: "#fff",
    promptKeywords: "dark navy blue gradient background with green and blue electric energy aura effects, muscular athlete holding product center composition, 6 text labels with curved arrows pointing outward from product to different specs callouts (2 top left, 2 top right, 2 bottom sides), bold large white headline top, blue CTA strip bottom tagline, high energy sports product specifications callout advertisement",
  },
  {
    id: "dark-gold-4panel",
    name: "Dark Gold 4 Panel",
    desc: "Negro dorado · Atleta centro · 4 circles 2x2",
    gradient: "radial-gradient(ellipse at 50% 60%, #3d2a00 0%, #1a1200 50%, #050400 100%)",
    accentColor: "#D97706",
    textColor: "#fff",
    promptKeywords: "dark warm brown gold background with subtle gym equipment and chocolate or cocoa elements, triumphant muscular athlete arms raised flexing center, 4 large circular white badges with gold outline arranged in 2x2 grid around athlete (top left, top right, bottom left, bottom right), each badge has gold line icon and bold benefit title with short description, gold and white bold headline top, premium dark sports nutrition benefits advertisement",
  },
  {
    id: "blue-stacked-pills",
    name: "Blue Stacked Pills",
    desc: "Gym azul · Feature bars izquierda · Producto derecha",
    gradient: "linear-gradient(160deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)",
    accentColor: "#60A5FA",
    textColor: "#fff",
    promptKeywords: "dark blue gradient gym background with blue energy swirl light trails, product jar and shaker bottle right side with fruit splash, 4-5 horizontal dark navy pill-shaped feature bars stacked on left side each with small icon and bold benefit text uppercase, triumphant athlete at bottom center, blue-white bold headline top, blue swirl energy motion blur effects, sports supplement feature list benefits advertisement",
  },
  {
    id: "vivid-color-columns",
    name: "Vivid Color Columns",
    desc: "Colores vivos · Columnas izq/der · Producto centro",
    gradient: "linear-gradient(90deg, #1d4ed8 0%, #059669 33%, #dc2626 66%, #1d4ed8 100%)",
    accentColor: "#F59E0B",
    textColor: "#fff",
    promptKeywords: "vivid electric background with blue green red zones and lightning bolts, athlete sprinting top right corner, product centered with fruit and liquid splash elements, 3 blue rounded benefit bars stacked left side (bold white caps text), 3 red rounded benefit bars stacked right side (bold white caps text), brand name and product name top in large bold text, high energy vibrant sports nutrition benefits advertisement",
  },
  {
    id: "white-3cards-lifestyle",
    name: "White 3 Cards",
    desc: "Blanco limpio · Lifestyle · 3 tarjetas descripción",
    gradient: "linear-gradient(180deg, #1d4ed8 0%, #2563eb 30%, #f8fafc 60%, #ffffff 100%)",
    accentColor: "#DC2626",
    textColor: "#1e3a8a",
    promptKeywords: "white and blue background, happy athlete sitting or posing in bright gym, product with fruit bottom right, bold blue headline top with red accent word, 3 dark navy benefit cards at bottom each with circular icon top and benefit title bold and short description text, blue red white color scheme, clean professional gym lifestyle sports supplement benefits advertisement",
  },
  {
    id: "warm-gym-floating-gold",
    name: "Warm Gym Floating Gold",
    desc: "Gym dorado cálido · 3-4 badges flotantes · Running",
    gradient: "radial-gradient(ellipse at 50% 50%, #7c5a00 0%, #3d2d00 50%, #1a1300 100%)",
    accentColor: "#D97706",
    textColor: "#fff",
    promptKeywords: "warm golden brown luxury gym interior background soft light bokeh, man or woman running or jogging front view smiling, 3-4 gold circular icon badges floating alongside the person arranged left and right with benefit title and description text, product visible on wrist or in hand, white and gold bold headline top, warm premium smartwatch or health product lifestyle benefits advertisement",
  },
  {
    id: "dreamy-4badges-grid",
    name: "Dreamy 4 Badges Grid",
    desc: "Fondo soñador · Personaje · 4 badges en cuadrícula",
    gradient: "radial-gradient(ellipse at 50% 40%, #fef9c3 0%, #fde68a 30%, #fbbf24 60%, #92400e 100%)",
    accentColor: "#F59E0B",
    textColor: "#78350f",
    promptKeywords: "dreamy soft warm pastel background with bokeh lights stars or dream catchers hanging, cute child or sleeping person in cozy pink fluffy cloud setting, 4 dark rounded square or circular icon badges arranged in 2x2 grid at bottom (top left, top right, bottom left, bottom right), each badge has white icon and bold benefit title with short description, warm pink and gold headline title, cozy soft children product or comfort lifestyle benefits advertisement",
  },
  {
    id: "dark-sport-3gold",
    name: "Dark Sport 3 Gold",
    desc: "Gym oscuro · Deporte intenso · 3 badges dorados",
    gradient: "radial-gradient(ellipse at 50% 40%, #1a1a2e 0%, #0a0a14 60%, #000000 100%)",
    accentColor: "#D97706",
    textColor: "#fff",
    promptKeywords: "dark industrial gym or outdoor dramatic background, athlete in intense sport pose boxing punching or sprinting with gold and blue energy aura effects, 3 gold circular icon badges arranged (bottom left, bottom right, bottom center) each with icon and bold benefit title with description text, bold white and gold headline top, tagline or CTA strip bottom, high energy intense sport product benefits advertisement",
  },
  {
    id: "pink-feminine-icons",
    name: "Pink Feminine Icons",
    desc: "Rosa intenso · Femenino · Badges circulares rojos",
    gradient: "radial-gradient(ellipse at 50% 30%, #fce7f3 0%, #f9a8d4 40%, #ec4899 80%, #be185d 100%)",
    accentColor: "#DC2626",
    textColor: "#fff",
    promptKeywords: "vibrant pink gradient background with rose petals or bokeh flowers floating, female lifestyle product (intimate care, supplement, beauty) displayed prominently, 3-4 red circular icon badges arranged diagonally or around product each with white icon and bold benefit text with short description, bold white headline top with red accent word, bottom CTA strip or trust message, feminine health beauty lifestyle product benefits advertisement",
  },
  {
    id: "soft-beauty-face",
    name: "Soft Beauty Face",
    desc: "Rosa suave · Modelo · 4 badges line-art alrededor",
    gradient: "radial-gradient(ellipse at 50% 30%, #fff1f2 0%, #fecdd3 50%, #fda4af 100%)",
    accentColor: "#E11D48",
    textColor: "#881337",
    promptKeywords: "very soft pink cherry blossom background with lens flare rainbow light, beautiful woman face profile portrait center glowing healthy skin, 4 minimal line-art style icon badges floating around the face (2 left: benefit icon + title + description, 2 right: benefit icon + title + description), elegant pink serif typography headline top, bottom result claim text, ultra feminine luxury beauty skincare benefits advertisement",
  },
  {
    id: "light-tech-specs",
    name: "Light Tech Specs",
    desc: "Blanco/azul · Producto técnico · Callouts dimensiones",
    gradient: "radial-gradient(ellipse at 50% 30%, #f0fdf4 0%, #dcfce7 40%, #bbf7d0 100%)",
    accentColor: "#16A34A",
    textColor: "#14532d",
    promptKeywords: "clean white or light blue-gray background with green leaf accents and water drops, technical product (faucet, gadget, tool) displayed large with measurement dimension lines and callout labels showing specifications (160mm, 60mm etc), 4 green circular icon badges arranged around product (2 top, 2 bottom) with bold benefit text and description, factual problem-statement headline top in green, bottom compatibility or accessory product shots, technical product quality specifications advertisement",
  },
];

const COMPARATIVA_STYLES: BannerStyle[] = [
  {
    id: "vs-dark-split",
    name: "VS Dark Split",
    desc: "Negro · Rojo vs Verde · Impacto",
    gradient: "linear-gradient(135deg, #0a0a0a 0%, #1a0a0a 50%, #0a1a0a 100%)",
    accentColor: "#EF4444",
    textColor: "#fff",
    promptKeywords: "dark black background with dramatic diagonal split composition left side red tones right side green, bold VS badge center, competitor product grayed out left column, our product bright highlighted right column, checkmark green icons list right, X red icons list left, bold white headline comparison advertisement high contrast dramatic",
  },
  {
    id: "vs-blue-clean",
    name: "VS Blue Clean",
    desc: "Azul marino · Limpio · Profesional",
    gradient: "linear-gradient(160deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)",
    accentColor: "#60A5FA",
    textColor: "#fff",
    promptKeywords: "deep navy blue gradient background clean professional layout, two-column comparison table floating card design left competitor right our product, blue checkmark icons right column red X icons left column, bold white typography headline, winner badge ribbon gold top right corner, trust strip bottom, clean professional product comparison advertisement",
  },
  {
    id: "vs-white-modern",
    name: "VS White Modern",
    desc: "Blanco · Minimalista · Corporativo",
    gradient: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
    accentColor: "#2563EB",
    textColor: "#1e293b",
    promptKeywords: "clean white light gray gradient background, minimal modern comparison layout two columns rounded card shadows, blue accent highlights our product column, gray muted competitor column, clear typography dark blue and gray, green checkmark icons right blue column, subtly floating shadow cards, corporate professional product comparison advertisement minimal design",
  },
  {
    id: "vs-red-aggro",
    name: "VS Red Power",
    desc: "Rojo intenso · Agresivo · Ganador",
    gradient: "radial-gradient(ellipse at 50% 100%, #7f1d1d 0%, #450a0a 50%, #0a0000 100%)",
    accentColor: "#FCA5A5",
    textColor: "#fff",
    promptKeywords: "deep blood red dark gradient background, dramatic versus battle composition, our product on illuminated pedestal winner side, competitor product shadowed defeated side, bold red and white VS badge center explosive burst, championship winner crown or trophy element, bold aggressive white typography headline, high contrast dramatic comparison advertisement",
  },
  {
    id: "vs-green-winner",
    name: "Green Winner",
    desc: "Verde · Natural · Nuestro mejor",
    gradient: "linear-gradient(160deg, #052e16 0%, #14532d 50%, #166534 100%)",
    accentColor: "#4ADE80",
    textColor: "#fff",
    promptKeywords: "deep green gradient background, clear winner checkmark composition, our product prominent center highlighted green glow, six comparison attribute rows with green checkmarks all our side and red X competitor side, bold white and green typography, green winner badge ribbon, natural health organic product comparison advertisement",
  },
  {
    id: "vs-gold-premium",
    name: "Gold Premium",
    desc: "Dorado · Premium · Lujo ganador",
    gradient: "radial-gradient(ellipse at 50% 30%, #1c1407 0%, #0a0a0a 100%)",
    accentColor: "#D97706",
    textColor: "#fff",
    promptKeywords: "ultra dark black with gold foil shimmer background, premium luxury comparison layout, our product on golden trophy pedestal illuminated, competitor shown as silver muted shadow, gold star rating badges, comparison attributes in gold vs silver, bold gold and white typography, crown award element, premium luxury product comparison banner",
  },
  {
    id: "vs-teal-fresh",
    name: "Teal Fresh",
    desc: "Turquesa · Fresco · Tabla clara",
    gradient: "linear-gradient(160deg, #0f766e 0%, #0d9488 40%, #ccfbf1 100%)",
    accentColor: "#14B8A6",
    textColor: "#fff",
    promptKeywords: "fresh teal aqua gradient background, clean floating comparison table white card, our product column teal accent highlighted, competitor column gray muted, clear icon checkmarks and X marks, product image floating above table, fresh clean health supplement comparison advertisement table layout",
  },
  {
    id: "vs-purple-tech",
    name: "Purple Tech",
    desc: "Púrpura · Tech · Innovador",
    gradient: "radial-gradient(ellipse at 30% 70%, #4c1d95 0%, #2d0a6b 50%, #0f0118 100%)",
    accentColor: "#A78BFA",
    textColor: "#fff",
    promptKeywords: "deep purple gradient tech background with glowing grid lines hexagon pattern, futuristic comparison layout holographic floating table, our product glowing purple aura winner, competitor product dark shadow, purple and white glowing checkmarks, tech innovation product comparison advertisement futuristic design",
  },
  {
    id: "vs-orange-bold",
    name: "Orange Bold",
    desc: "Naranja · Energético · Directo",
    gradient: "linear-gradient(160deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)",
    accentColor: "#FED7AA",
    textColor: "#fff",
    promptKeywords: "bold orange gradient background, direct bold comparison layout, big bold versus typography center, our product on orange lit platform, competitor product dimmed left, orange circular badge icons comparison attributes, bold white orange typography headline, high energy food supplement comparison advertisement bold direct style",
  },
  {
    id: "vs-sky-clean",
    name: "Sky Comparison",
    desc: "Azul cielo · Claro · Familiar",
    gradient: "linear-gradient(180deg, #bfdbfe 0%, #eff6ff 50%, #dbeafe 100%)",
    accentColor: "#2563EB",
    textColor: "#1e3a8a",
    promptKeywords: "bright sky blue light gradient background, cheerful friendly comparison layout, floating white card comparison table rounded corners, blue checkmarks winner column, gray X loser column, product image on platform, friendly family health product comparison advertisement clean bright",
  },
  {
    id: "vs-pink-girly",
    name: "Pink Winner",
    desc: "Rosa · Femenino · Nuestra marca gana",
    gradient: "radial-gradient(ellipse at 50% 30%, #fdf2f8 0%, #fce7f3 40%, #ec4899 100%)",
    accentColor: "#BE185D",
    textColor: "#831843",
    promptKeywords: "soft pink rose gradient background, feminine beauty comparison layout, our product on floral decorated winner pedestal, competitor shown minimally, heart and star winner icons pink, comparison attribute rows with pink checkmarks, elegant feminine typography, beauty skincare feminine product comparison advertisement warm rose aesthetic",
  },
  {
    id: "vs-warm-neutral",
    name: "Warm Neutral",
    desc: "Beige · Natural · Honesto",
    gradient: "radial-gradient(ellipse at 50% 30%, #fef9c3 0%, #fde68a 40%, #d97706 100%)",
    accentColor: "#92400E",
    textColor: "#1a1a1a",
    promptKeywords: "warm golden beige background, honest natural comparison layout, two column floating cards white with subtle shadow, our product warm amber highlighted column, competitor muted gray, natural ingredient icons comparison rows, warm dark typography, natural organic comparison advertisement warm honest straightforward design",
  },
];

const AUTORIDAD_STYLES: BannerStyle[] = [
  {
    id: "auth-dark-gold",
    name: "Authority Gold",
    desc: "Negro · Dorado · Premios y sellos",
    gradient: "radial-gradient(ellipse at 50% 30%, #1c1407 0%, #0a0a0a 100%)",
    accentColor: "#D97706",
    textColor: "#fff",
    promptKeywords: "ultra dark luxury black background with gold shimmer particle effects, three or four golden circular trust seal badges (FDA registered, GMP certified, ISO, lab tested), central brand logo illuminated, gold ribbon award banner element, bold white and gold typography, media press logo strip as seen on, premium authority trust advertisement high end",
  },
  {
    id: "auth-navy-trust",
    name: "Navy Trust",
    desc: "Azul marino · Serio · Confiable",
    gradient: "linear-gradient(160deg, #0f172a 0%, #1e3a8a 80%, #1d4ed8 100%)",
    accentColor: "#60A5FA",
    textColor: "#fff",
    promptKeywords: "deep navy blue gradient background professional, horizontal strip of certification badge icons FDA GMP organic certified lab tested, doctor or expert figure endorsement photo, trust shield icon center, star rating large five stars with review count, bold white blue typography, bottom press media logos strip, professional authority trust advertisement clinical serious",
  },
  {
    id: "auth-white-clean",
    name: "Clean Authority",
    desc: "Blanco · Clínico · Certificaciones",
    gradient: "linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%)",
    accentColor: "#0EA5E9",
    textColor: "#0c4a6e",
    promptKeywords: "clean white light blue clinical background, horizontal row of four certification badges rounded pill shape FDA approved GMP ISO lab tested, product prominently centered, clinical white coat doctor endorsement photo, blue checkmark trust points list, clean professional dark typography, press media logo strip bottom, clinical authority trust advertisement clean minimal",
  },
  {
    id: "auth-green-natural",
    name: "Green Certified",
    desc: "Verde · Orgánico · Natural certificado",
    gradient: "radial-gradient(ellipse at 50% 30%, #d1fae5 0%, #6ee7b7 30%, #065f46 100%)",
    accentColor: "#10B981",
    textColor: "#fff",
    promptKeywords: "rich green nature background, four circular green trust badge seals USDA organic natural ingredients non-GMO lab tested, tropical leaves natural elements, product on natural wooden platform, green checkmark trust list, bold white and green typography, earth natural organic authority trust advertisement fresh genuine",
  },
  {
    id: "auth-gold-ribbon",
    name: "Gold Ribbon Award",
    desc: "Dorado · Cintas · Premio del año",
    gradient: "linear-gradient(160deg, #78350f 0%, #92400e 40%, #b45309 100%)",
    accentColor: "#FDE68A",
    textColor: "#fff",
    promptKeywords: "warm golden amber gradient background, large central award ribbon badge Mejor Producto del Año or Premio de Excelencia, four gold medal icon badges around central trophy, product image on podium illuminated, star rating gold five stars, customer count social proof numbers, bold white gold typography, award winning product authority advertisement prestigious",
  },
  {
    id: "auth-purple-expert",
    name: "Expert Purple",
    desc: "Púrpura · Experto · Validación médica",
    gradient: "radial-gradient(ellipse at 50% 30%, #4c1d95 0%, #2d0a6b 50%, #0f0118 100%)",
    accentColor: "#A78BFA",
    textColor: "#fff",
    promptKeywords: "deep purple atmospheric gradient, medical or nutrition expert professional endorsement photo, purple glow circular certification badges lab tested clinically proven recommended by experts, bold white purple typography, purple shimmer particle effects, five star rating badge, trust shield icon, expert validated authority advertisement premium scientific",
  },
  {
    id: "auth-red-bold",
    name: "Red Authority",
    desc: "Rojo · Audaz · Garantía total",
    gradient: "radial-gradient(ellipse at 50% 100%, #7f1d1d 0%, #450a0a 50%, #0a0000 100%)",
    accentColor: "#FCA5A5",
    textColor: "#fff",
    promptKeywords: "deep dark red authority background, bold trust guarantee badges red circular icons satisfaction guarantee 30 day money back quality assured, product center prominent, large shield icon with checkmark, bold white typography authority headline, five star rating social proof numbers, bottom trust bar strip, bold authority guarantee advertisement",
  },
  {
    id: "auth-teal-science",
    name: "Science Teal",
    desc: "Turquesa · Científico · Fórmula probada",
    gradient: "linear-gradient(160deg, #0f766e 0%, #0d9488 40%, #134e4a 100%)",
    accentColor: "#5EEAD4",
    textColor: "#fff",
    promptKeywords: "teal scientific clinical gradient background, DNA helix molecule graphic element background, four hexagonal science badge icons formula tested clinically proven patented ingredient results backed, product on lab platform, bold white teal typography, scientific graph chart element, clinical science authority product advertisement evidence based",
  },
  {
    id: "auth-warm-human",
    name: "Warm Human",
    desc: "Beige · Humano · Testimonios de expertos",
    gradient: "radial-gradient(ellipse at 50% 30%, #fef3c7 0%, #fde68a 30%, #d97706 100%)",
    accentColor: "#92400E",
    textColor: "#1a1a1a",
    promptKeywords: "warm golden beige background, three circular expert photos nutritionists or doctors with credentials below name and title, quote speech bubble from each expert, product displayed, star rating gold, trust badge bottom strip, warm human authority endorsement advertisement professional yet approachable",
  },
  {
    id: "auth-pink-beauty",
    name: "Beauty Authority",
    desc: "Rosa · Dermatólogos · Belleza avalada",
    gradient: "radial-gradient(ellipse at 50% 30%, #fdf2f8 0%, #fce7f3 40%, #ec4899 100%)",
    accentColor: "#BE185D",
    textColor: "#831843",
    promptKeywords: "soft pink rose gradient background, dermatologist recommended badge pink circular seal, three ingredient certified icons hypoallergenic cruelty-free dermatologist tested, beauty expert endorsement photo, product prominently centered with glow, elegant feminine typography, five star beauty review rating, beauty authority trust advertisement feminine dermatologist",
  },
  {
    id: "auth-sky-fresh",
    name: "Sky Trust",
    desc: "Azul cielo · Fresco · Sellos simples",
    gradient: "linear-gradient(180deg, #bfdbfe 0%, #eff6ff 50%, #dbeafe 100%)",
    accentColor: "#2563EB",
    textColor: "#1e3a8a",
    promptKeywords: "bright sky blue clean gradient background, five horizontal trust badge icons with labels pago seguro envio rapido garantia devoluciones atencion 24h, product centered, large five star rating, customer review count numbers, simple clean bold dark blue typography, friendly clean trust authority advertisement simple clear",
  },
  {
    id: "auth-dark-press",
    name: "Press Coverage",
    desc: "Oscuro · Prensa · Medios de comunicación",
    gradient: "radial-gradient(ellipse at 50% 50%, #18181b 0%, #09090b 100%)",
    accentColor: "#71717A",
    textColor: "#fff",
    promptKeywords: "dark charcoal black background, as seen on featured in press media logos strip centered (magazine newspaper TV channel logos in white), product above press strip illuminated, bold white gray typography headline, subtle spotlight effect on product, simple clean press authority media coverage advertisement dark prestige",
  },
];

const TESTIMONIOS_STYLES: BannerStyle[] = [
  {
    id: "test-dark-stars",
    name: "Dark Stars",
    desc: "Negro · Estrellas doradas · Premium",
    gradient: "radial-gradient(ellipse at 50% 50%, #18181b 0%, #09090b 100%)",
    accentColor: "#D97706",
    textColor: "#fff",
    promptKeywords: "dark black background, three floating testimonial cards rounded with shadow and gold five star rating, customer photo circle avatar top each card, quote text testimonial centered, bold white and gold typography headline número de clientes felices, gold star icons large, product visible background, premium dark testimonial social proof advertisement",
  },
  {
    id: "test-blue-trust",
    name: "Blue Trust",
    desc: "Azul · Confianza · Clientes reales",
    gradient: "linear-gradient(160deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)",
    accentColor: "#60A5FA",
    textColor: "#fff",
    promptKeywords: "navy blue gradient background, three customer testimonial quote cards white floating rounded shadow, circular customer avatar photo top each card with star rating, bold blue five star icons, verified buyer badge check icon, product image right side, bold white typography headline customer count thousands, trust social proof advertisement blue professional",
  },
  {
    id: "test-white-clean",
    name: "Clean Reviews",
    desc: "Blanco · Minimalista · App-style",
    gradient: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
    accentColor: "#2563EB",
    textColor: "#1e293b",
    promptKeywords: "clean white light background minimal, three review cards white floating with subtle box shadow, customer avatar photo rounded, star rating blue five stars, short testimonial quote text, verified badge, product photo centered, app style clean minimal testimonial social proof advertisement modern",
  },
  {
    id: "test-green-natural",
    name: "Natural Reviews",
    desc: "Verde · Orgánico · Resultados reales",
    gradient: "radial-gradient(ellipse at 50% 30%, #d1fae5 0%, #6ee7b7 30%, #065f46 100%)",
    accentColor: "#10B981",
    textColor: "#fff",
    promptKeywords: "green natural gradient background, three customer photo transformation testimonial cards, before and after mini badge on customer photo, green five star rating, bold white typography, customer name and city below, real results number counter (10000+ clientes), natural health testimonial social proof advertisement organic fresh",
  },
  {
    id: "test-pink-beauty",
    name: "Pink Reviews",
    desc: "Rosa · Femenino · Belleza · Reviews",
    gradient: "radial-gradient(ellipse at 50% 30%, #fdf2f8 0%, #fce7f3 40%, #ec4899 100%)",
    accentColor: "#BE185D",
    textColor: "#831843",
    promptKeywords: "soft pink rose gradient background, three female customer photos with glowing product results, five heart or star pink rating icons, quote testimonial text elegant italic font, cursive mixed typography, rose petals decorative floating, beauty skincare feminine product testimonial social proof advertisement warm elegant",
  },
  {
    id: "test-warm-human",
    name: "Warm Stories",
    desc: "Beige · Familiar · Historia real",
    gradient: "radial-gradient(ellipse at 50% 30%, #fef3c7 0%, #fde68a 30%, #d97706 100%)",
    accentColor: "#92400E",
    textColor: "#1a1a1a",
    promptKeywords: "warm golden beige background, three customer lifestyle photos with warm tones, speech bubble quote overlay, five gold star rating, warm friendly dark typography, customer first name and verified badge, product displayed bottom, warm cozy testimonial social proof advertisement homey authentic",
  },
  {
    id: "test-sports-energy",
    name: "Sports Reviews",
    desc: "Azul eléctrico · Deportistas · Resultados",
    gradient: "linear-gradient(160deg, #1d4ed8 0%, #1e40af 40%, #1e3a8a 100%)",
    accentColor: "#F97316",
    textColor: "#fff",
    promptKeywords: "electric blue sports gradient background, three athlete customer photos dynamic poses, bold results numbers overlaid (minus 8kg, plus 5kg masa), five star orange rating, bold white orange typography, sport energy quote short testimonial, verified athlete badge, high energy sports supplement testimonial social proof advertisement",
  },
  {
    id: "test-purple-glow",
    name: "Purple Glow Reviews",
    desc: "Púrpura · Mágico · Transformación",
    gradient: "radial-gradient(ellipse at 50% 70%, #4c1d95 0%, #2d0a6b 40%, #0f0118 100%)",
    accentColor: "#A78BFA",
    textColor: "#fff",
    promptKeywords: "deep purple atmospheric gradient, three floating testimonial cards with purple glow border, customer photo avatar glowing circle, five purple star rating, transformation result quote, magic shimmer particles, bold white and purple typography, premium transformation testimonial social proof advertisement magical glow",
  },
  {
    id: "test-teal-fresh",
    name: "Teal Fresh Reviews",
    desc: "Turquesa · Limpio · Salud",
    gradient: "linear-gradient(160deg, #0f766e 0%, #0d9488 40%, #ccfbf1 100%)",
    accentColor: "#14B8A6",
    textColor: "#fff",
    promptKeywords: "fresh teal aqua gradient background, three white floating review cards with subtle teal border, customer photo circle top, five teal star rating, short clean quote text, customer verified badge, product image side, health supplement testimonial social proof advertisement fresh clean minimal",
  },
  {
    id: "test-red-bold",
    name: "Bold Results",
    desc: "Rojo · Audaz · Resultados impactantes",
    gradient: "radial-gradient(ellipse at 50% 100%, #7f1d1d 0%, #450a0a 50%, #0a0000 100%)",
    accentColor: "#FCA5A5",
    textColor: "#fff",
    promptKeywords: "dark deep red background, three dramatic result testimonial cards, bold large result numbers overlaid (perdí 12kg, gané masa, bajé talla), customer before and after mini composition, five star rating red and white, bold aggressive white typography headline thousands of customers, high impact testimonial social proof advertisement bold dramatic",
  },
  {
    id: "test-galaxy",
    name: "Galaxy Reviews",
    desc: "Galaxia · Wow · Reseñas premium",
    gradient: "radial-gradient(ellipse at 50% 50%, #312e81 0%, #1e1b4b 40%, #030712 100%)",
    accentColor: "#818CF8",
    textColor: "#fff",
    promptKeywords: "deep space galaxy background, three testimonial cards with cosmic glowing border, customer avatar with star constellation, five cosmic star rating glowing, quote testimonial with typewriter cursor, floating star particles, bold white indigo typography headline, premium cosmic testimonial social proof advertisement wow factor",
  },
  {
    id: "test-sky-simple",
    name: "Sky Simple",
    desc: "Azul cielo · Simple · Familiar",
    gradient: "linear-gradient(180deg, #bfdbfe 0%, #eff6ff 50%, #dbeafe 100%)",
    accentColor: "#2563EB",
    textColor: "#1e3a8a",
    promptKeywords: "bright sky blue clean gradient background, three simple testimonial quote cards white rounded, smiley face or happy customer simple avatar, five blue star rating, short simple quote testimonial, product bottom, cheerful friendly family happy customer testimonial advertisement simple approachable",
  },
];

const INGREDIENTES_STYLES: BannerStyle[] = [
  {
    id: "ing-dark-science",
    name: "Dark Science",
    desc: "Negro · Científico · Ingredientes tech",
    gradient: "radial-gradient(ellipse at 50% 50%, #18181b 0%, #09090b 100%)",
    accentColor: "#60A5FA",
    textColor: "#fff",
    promptKeywords: "dark black scientific background with glowing hexagonal molecule grid pattern, product center illuminated, five or six glowing hexagonal ingredient callout badges floating around product each with ingredient name and mg amount, arrows connecting from product to badges, bold white blue typography, lab scientific ingredients advertisement dark tech aesthetic",
  },
  {
    id: "ing-green-natural",
    name: "Natural Formula",
    desc: "Verde · Natural · Ingredientes orgánicos",
    gradient: "radial-gradient(ellipse at 50% 30%, #d1fae5 0%, #6ee7b7 30%, #065f46 100%)",
    accentColor: "#10B981",
    textColor: "#fff",
    promptKeywords: "rich green natural gradient with tropical botanical leaves scattered, product bottle center, five or six circular badge icons with ingredient illustrations (leaf plant fruit spice) each ingredient name and benefit, arrows or lines connecting badges to product, bold white typography headline formula ingredientes, natural organic ingredients advertisement botanical fresh",
  },
  {
    id: "ing-purple-premium",
    name: "Purple Premium Formula",
    desc: "Púrpura · Premium · Ciencia y magia",
    gradient: "radial-gradient(ellipse at 50% 70%, #4c1d95 0%, #2d0a6b 40%, #0f0118 100%)",
    accentColor: "#A78BFA",
    textColor: "#fff",
    promptKeywords: "deep purple atmospheric gradient with glowing molecule particle effects, product bottle glowing center, six purple glowing hexagonal callout badges each with ingredient name dosage and benefit arrow pointing to product, shimmer particle effects floating, bold white and purple headline typography fórmula exclusiva, premium ingredient formula advertisement magical science",
  },
  {
    id: "ing-teal-clinical",
    name: "Clinical Formula",
    desc: "Turquesa · Clínico · Preciso",
    gradient: "linear-gradient(160deg, #0f766e 0%, #0d9488 40%, #134e4a 100%)",
    accentColor: "#5EEAD4",
    textColor: "#fff",
    promptKeywords: "teal clinical gradient background, DNA or molecule helix graphic element, product label prominent center showing ingredient panel, six rounded rectangle ingredient callout badges with precise percentage or mg amounts, clean precise typography ingredient name and dosage, clinical accurate ingredient breakdown advertisement teal professional",
  },
  {
    id: "ing-navy-specs",
    name: "Navy Specs",
    desc: "Azul marino · Especificaciones · Técnico",
    gradient: "linear-gradient(160deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)",
    accentColor: "#60A5FA",
    textColor: "#fff",
    promptKeywords: "navy blue gradient background technical professional, product center, six specification callout badges with lines pointing to product showing ingredient and amount, technical infographic style, bold white blue typography, bottom ingredient list strip, professional technical sports supplement ingredient specification advertisement",
  },
  {
    id: "ing-white-clean",
    name: "Clean Ingredients",
    desc: "Blanco · Limpio · Transparente",
    gradient: "linear-gradient(180deg, #f0f9ff 0%, #e0f2fe 100%)",
    accentColor: "#0EA5E9",
    textColor: "#0c4a6e",
    promptKeywords: "clean white light blue background transparent layout, product bottle centered label clearly visible, six ingredient icon cards floating white rounded shadow, each with small ingredient illustration and clean text name mg percentage, clean minimal typography dark blue, no artificial badge checkmark, clean transparent ingredient formula advertisement minimal honest",
  },
  {
    id: "ing-gold-luxury",
    name: "Luxury Formula",
    desc: "Dorado · Lujo · Ingredientes exclusivos",
    gradient: "radial-gradient(ellipse at 50% 30%, #1c1407 0%, #0a0a0a 100%)",
    accentColor: "#D97706",
    textColor: "#fff",
    promptKeywords: "ultra dark luxury background with gold shimmer particle effects, product on illuminated gold pedestal, six gold bordered hexagonal ingredient medallion badges scattered, each with premium ingredient name origin and benefit, gold connecting lines to product, bold white and gold typography exclusiva fórmula, luxury premium exclusive ingredient formula advertisement prestigious",
  },
  {
    id: "ing-orange-energy",
    name: "Energy Formula",
    desc: "Naranja · Energía · Pre-workout ingredientes",
    gradient: "linear-gradient(160deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)",
    accentColor: "#FED7AA",
    textColor: "#fff",
    promptKeywords: "bold orange fire gradient background with energy sparks, product pre-workout supplement center, six energetic circular callout badges with ingredient names (cafeína creatina beta-alanina) and amounts, lightning bolt energy icons, bold white orange typography headline, high energy sports nutrition ingredient breakdown advertisement",
  },
  {
    id: "ing-pink-beauty",
    name: "Beauty Ingredients",
    desc: "Rosa · Belleza · Ingredientes activos",
    gradient: "radial-gradient(ellipse at 50% 30%, #fdf2f8 0%, #fce7f3 40%, #ec4899 100%)",
    accentColor: "#BE185D",
    textColor: "#831843",
    promptKeywords: "soft pink rose gradient, beauty skincare product center, six pink circular ingredient badges with beauty ingredient illustrations (collagen hyaluronic acid vitamin C retinol) each with name and percentage, rose petals floating decorative, elegant feminine typography active ingredients, beauty skincare ingredient formula advertisement feminine elegant",
  },
  {
    id: "ing-earth-natural",
    name: "Earth Natural",
    desc: "Tierra · Cálido · Hierbas y plantas",
    gradient: "radial-gradient(ellipse at 50% 30%, #fef3c7 0%, #fde68a 30%, #92400e 100%)",
    accentColor: "#065F46",
    textColor: "#1a1a1a",
    promptKeywords: "warm earthy golden beige gradient, herbs plants and botanical elements scattered in background, product bottle center wooden surface, six earthy circular ingredient badges with botanical illustrations herb leaf root fruit, warm brown dark typography ingredient names and benefit, natural herbal supplement ingredient formula advertisement warm earthy",
  },
  {
    id: "ing-sky-light",
    name: "Light Formula",
    desc: "Azul cielo · Ligero · Suplemento simple",
    gradient: "linear-gradient(180deg, #bfdbfe 0%, #eff6ff 50%, #dbeafe 100%)",
    accentColor: "#2563EB",
    textColor: "#1e3a8a",
    promptKeywords: "bright sky blue clean background, product label facing forward, four simple large ingredient highlight cards white floating, each with ingredient name benefit and small icon, clean simple bold dark blue typography, friendly clean simple ingredient highlight advertisement approachable minimal",
  },
  {
    id: "ing-red-power",
    name: "Power Blend",
    desc: "Rojo · Potente · Mezcla activa",
    gradient: "radial-gradient(ellipse at 50% 100%, #7f1d1d 0%, #450a0a 50%, #0a0000 100%)",
    accentColor: "#FCA5A5",
    textColor: "#fff",
    promptKeywords: "dark deep red dramatic background, muscular athlete holding product, six ingredient callout red circular badges pointing to product with lines showing formula composition (cafeína vitamina b creatina taurina), bold white red typography active blend headline, high energy powerful ingredient formula advertisement dramatic",
  },
];

const MODO_USO_STYLES: BannerStyle[] = [
  {
    id: "uso-dark-steps",
    name: "Dark Steps",
    desc: "Negro · Pasos claros · Premium",
    gradient: "radial-gradient(ellipse at 50% 50%, #18181b 0%, #09090b 100%)",
    accentColor: "#60A5FA",
    textColor: "#fff",
    promptKeywords: "dark black background, three horizontal step cards floating with number badges (1 2 3) glowing blue, each step with icon and short instruction text, arrows between steps, product visible right side, bold white blue step numbers, bold headline Cómo Usarlo, clean dark instructions advertisement three steps",
  },
  {
    id: "uso-blue-clean",
    name: "Blue How-To",
    desc: "Azul · Limpio · Instrucciones claras",
    gradient: "linear-gradient(160deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)",
    accentColor: "#60A5FA",
    textColor: "#fff",
    promptKeywords: "navy blue gradient background, three vertical step cards numbered blue circles bold, step instruction icon and short text each card, connecting dotted or solid line between steps, product image right side prominent, bold white typography Modo de Uso headline, clean professional how to use advertisement",
  },
  {
    id: "uso-green-natural",
    name: "Green How-To",
    desc: "Verde · Natural · Pasos orgánicos",
    gradient: "radial-gradient(ellipse at 50% 30%, #d1fae5 0%, #6ee7b7 30%, #065f46 100%)",
    accentColor: "#10B981",
    textColor: "#fff",
    promptKeywords: "green natural gradient, three step instruction cards floating leaf organic style, numbered green circles, each step icon and instruction text, nature botanical leaf decorations, product bottle right, bold white typography Cómo Tomarlo, natural health supplement how to use advertisement organic fresh",
  },
  {
    id: "uso-white-minimal",
    name: "Clean Steps",
    desc: "Blanco · Minimalista · Fácil de seguir",
    gradient: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
    accentColor: "#2563EB",
    textColor: "#1e293b",
    promptKeywords: "clean white light background minimal, three step instruction cards white floating shadow, clean numbered blue circle badges, simple line icons each step, clear short instruction text, product photo side, minimal clean typography dark blue, simple clean how to use product advertisement",
  },
  {
    id: "uso-orange-sports",
    name: "Sports Protocol",
    desc: "Naranja · Deportivo · Protocolo pre-workout",
    gradient: "linear-gradient(160deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)",
    accentColor: "#FED7AA",
    textColor: "#fff",
    promptKeywords: "bold orange energy gradient, sports protocol timeline layout, numbered step circles orange with sports icons, morning workout night timing labels, athlete product photo, bold white orange typography Protocolo de Uso, clock timing icon, serving size scoop visible, sports supplement usage protocol advertisement energetic",
  },
  {
    id: "uso-purple-ritual",
    name: "Beauty Ritual",
    desc: "Púrpura · Ritual · Skincare routine",
    gradient: "radial-gradient(ellipse at 50% 70%, #4c1d95 0%, #2d0a6b 40%, #0f0118 100%)",
    accentColor: "#A78BFA",
    textColor: "#fff",
    promptKeywords: "deep purple atmospheric gradient, skincare ritual morning night routine layout, three or four steps with moon sun icons timing labels, beauty product center glowing, step icons makeup brush serum cream, elegant purple glow circle badges numbered, bold white typography Tu Ritual Perfecto, beauty skincare routine how to use advertisement elegant",
  },
  {
    id: "uso-teal-health",
    name: "Health Protocol",
    desc: "Turquesa · Salud · Protocolo diario",
    gradient: "linear-gradient(160deg, #0f766e 0%, #0d9488 40%, #134e4a 100%)",
    accentColor: "#5EEAD4",
    textColor: "#fff",
    promptKeywords: "teal clinical health gradient, daily health protocol layout, four step cards horizontal with teal numbered badges, clock or calendar timing icons, glass of water icon, meal timing labels, product positioned right, bold white teal typography Protocolo Diario, health supplement how to use advertisement clinical",
  },
  {
    id: "uso-pink-beauty",
    name: "Pink Routine",
    desc: "Rosa · Femenino · Rutina fácil",
    gradient: "radial-gradient(ellipse at 50% 30%, #fdf2f8 0%, #fce7f3 40%, #ec4899 100%)",
    accentColor: "#BE185D",
    textColor: "#831843",
    promptKeywords: "soft pink rose gradient, feminine beauty routine how-to layout, three steps with romantic feminine icons, step numbers pink circles with heart, beauty product center with glow, rose petals floating, elegant typography Tu Rutina de Belleza, simple steps instruction, beauty feminine product routine advertisement warm elegant",
  },
  {
    id: "uso-warm-simple",
    name: "Warm & Simple",
    desc: "Beige · Cálido · Fácil de usar",
    gradient: "radial-gradient(ellipse at 50% 30%, #fef3c7 0%, #fde68a 30%, #d97706 100%)",
    accentColor: "#92400E",
    textColor: "#1a1a1a",
    promptKeywords: "warm golden beige background, simple three step layout warm icons, numbered warm amber circle badges, friendly instruction text short and clear, product displayed, warm dark typography Así de Fácil headline, friendly approachable how to use product advertisement warm",
  },
  {
    id: "uso-navy-gold",
    name: "Premium Steps",
    desc: "Marino oscuro · Dorado · Premium paso a paso",
    gradient: "radial-gradient(ellipse at 50% 30%, #1e3a5f 0%, #0f1f3a 50%, #060d1a 100%)",
    accentColor: "#D97706",
    textColor: "#fff",
    promptKeywords: "deep dark navy gradient with gold particle effects, three premium gold numbered step badges, step icons gold line art style, connecting golden dotted path between steps, product illuminated right side, bold white and gold typography Instrucciones de Uso, premium elegant how to use advertisement luxury",
  },
  {
    id: "uso-sky-kids",
    name: "Easy Steps Kids",
    desc: "Azul cielo · Infantil · Pasos simples",
    gradient: "linear-gradient(180deg, #bfdbfe 0%, #eff6ff 50%, #dbeafe 100%)",
    accentColor: "#F97316",
    textColor: "#1e3a8a",
    promptKeywords: "bright sky blue cheerful background, three large simple step bubbles numbered orange bold circles, simple fun icons each step, short easy instruction text bold dark blue, product displayed, clouds decorative, friendly family product how to use advertisement cheerful simple kid-friendly",
  },
  {
    id: "uso-dark-timeline",
    name: "Dark Timeline",
    desc: "Oscuro · Timeline · Día a día",
    gradient: "radial-gradient(ellipse at 50% 50%, #312e81 0%, #1e1b4b 40%, #030712 100%)",
    accentColor: "#818CF8",
    textColor: "#fff",
    promptKeywords: "deep indigo dark gradient, timeline horizontal layout with glowing nodes, morning midday night time labels with sun moon icons, instruction card at each node, product center above timeline, bold white indigo typography Tus Resultados Día a Día, cosmic glow timeline how to use schedule advertisement",
  },
];

const LOGISTICA_STYLES: BannerStyle[] = [
  {
    id: "log-dark-shipping",
    name: "Dark Shipping",
    desc: "Negro · Envío rápido · Premium logística",
    gradient: "radial-gradient(ellipse at 50% 50%, #18181b 0%, #09090b 100%)",
    accentColor: "#60A5FA",
    textColor: "#fff",
    promptKeywords: "dark black background, four floating logistics icon cards delivery truck box shield credit card, bold icons white each card with benefit title and short description, bold white blue typography Envío Gratis headline, product visible background, bottom payment logos strip, premium dark logistics shipping advertisement",
  },
  {
    id: "log-blue-trust",
    name: "Blue Delivery",
    desc: "Azul · Envío seguro · Confianza",
    gradient: "linear-gradient(160deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)",
    accentColor: "#60A5FA",
    textColor: "#fff",
    promptKeywords: "navy blue professional gradient, delivery timeline horizontal strip showing order confirmed packed shipped delivered with icons, delivery truck hero graphic, bold white typography Envío Express headline days count, three trust badge icons below guarantee returns shipping, payment logos strip bottom, professional logistics shipping advertisement navy blue",
  },
  {
    id: "log-green-safe",
    name: "Green Safe Delivery",
    desc: "Verde · Seguro · Devolución garantizada",
    gradient: "radial-gradient(ellipse at 50% 30%, #d1fae5 0%, #6ee7b7 30%, #065f46 100%)",
    accentColor: "#10B981",
    textColor: "#fff",
    promptKeywords: "green gradient background, large green shield icon center with checkmark guarantee, four logistics benefit icons below shipping returns secure payment fast delivery, product displayed, bold white typography Garantía Total 30 días headline, natural fresh green logistics guarantee advertisement",
  },
  {
    id: "log-white-clean",
    name: "Clean Logistics",
    desc: "Blanco · Limpio · Confianza simple",
    gradient: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
    accentColor: "#2563EB",
    textColor: "#1e293b",
    promptKeywords: "clean white light background minimal, five benefit icon strips horizontal or grid layout truck box shield return credit card, each with icon title and short text, clean minimal typography, product right side, simple clean logistics trust advertisement minimal corporate",
  },
  {
    id: "log-orange-fast",
    name: "Fast Delivery",
    desc: "Naranja · Rápido · Urgencia positiva",
    gradient: "linear-gradient(160deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)",
    accentColor: "#FED7AA",
    textColor: "#fff",
    promptKeywords: "bold orange gradient, large delivery truck graphic with speed motion lines, bold headline Entrega en 24-48 Horas with clock icon, four benefit badges below express envio gratis pago seguro devolucion, bold white orange typography, urgency positive fast shipping advertisement",
  },
  {
    id: "log-purple-premium",
    name: "Purple Premium Shipping",
    desc: "Púrpura · Premium · Logística VIP",
    gradient: "radial-gradient(ellipse at 50% 70%, #4c1d95 0%, #2d0a6b 40%, #0f0118 100%)",
    accentColor: "#A78BFA",
    textColor: "#fff",
    promptKeywords: "deep purple gradient luxury, VIP premium shipping box with purple glow, four luxury delivery benefit cards floating (envio express garantia 30 dias atencion vip pago seguro), purple shimmer effects, bold white purple typography Experiencia Premium, premium VIP logistics advertisement luxury",
  },
  {
    id: "log-teal-fresh",
    name: "Teal Logistics",
    desc: "Turquesa · Fresco · Proceso de pedido",
    gradient: "linear-gradient(160deg, #0f766e 0%, #0d9488 40%, #ccfbf1 100%)",
    accentColor: "#14B8A6",
    textColor: "#fff",
    promptKeywords: "teal fresh gradient, order process timeline from purchase to delivery, five icon steps order confirmed payment processing packing shipped delivered, teal glow circle nodes connecting path, delivery days counter bold, bold white typography Seguimiento en Tiempo Real, clean teal logistics process advertisement",
  },
  {
    id: "log-dark-payment",
    name: "Payment Logos",
    desc: "Oscuro · Medios de pago · Contraentrega",
    gradient: "radial-gradient(ellipse at 50% 50%, #18181b 0%, #09090b 100%)",
    accentColor: "#D97706",
    textColor: "#fff",
    promptKeywords: "dark charcoal background, large payment methods logos strip centered white (mercadopago mastercard visa contra entrega nequi), security shield icon prominent, padlock SSL badge, bold white typography Pago 100% Seguro headline, product visible top, logistics payment security advertisement dark professional",
  },
  {
    id: "log-warm-family",
    name: "Warm Delivery",
    desc: "Beige · Familiar · Fácil y seguro",
    gradient: "radial-gradient(ellipse at 50% 30%, #fef3c7 0%, #fde68a 30%, #d97706 100%)",
    accentColor: "#92400E",
    textColor: "#1a1a1a",
    promptKeywords: "warm golden beige background, happy family receiving delivery box illustration, four trust icon benefits below warm icons truck shield star return, bold dark warm typography Llega a Tu Puerta headline, warm friendly logistics delivery advertisement approachable family",
  },
  {
    id: "log-sky-simple",
    name: "Sky Simple Shipping",
    desc: "Azul cielo · Simple · Envío gratis",
    gradient: "linear-gradient(180deg, #bfdbfe 0%, #eff6ff 50%, #dbeafe 100%)",
    accentColor: "#2563EB",
    textColor: "#1e3a8a",
    promptKeywords: "bright sky blue clean gradient, large cheerful delivery truck graphic, bold headline Envío GRATIS a Todo el País, five simple benefit icons below free shipping returns guarantee, clean dark blue typography, product right side, simple friendly shipping advertisement clean bright",
  },
  {
    id: "log-red-urgent",
    name: "Urgent Shipping",
    desc: "Rojo · Urgente · Hoy pedí mañana llega",
    gradient: "radial-gradient(ellipse at 50% 100%, #7f1d1d 0%, #450a0a 50%, #0a0000 100%)",
    accentColor: "#FCA5A5",
    textColor: "#fff",
    promptKeywords: "dark deep red urgency background, large clock countdown timer graphic, bold red and white typography Pídelo HOY y Recíbelo MAÑANA, delivery truck with speed lines, three urgency benefit cards express delivery guaranteed returns secure payment, urgency positive shipping advertisement dramatic",
  },
  {
    id: "log-gold-trust",
    name: "Gold Trust Strip",
    desc: "Dorado · Confianza completa · Sellos",
    gradient: "radial-gradient(ellipse at 50% 30%, #1c1407 0%, #0a0a0a 100%)",
    accentColor: "#D97706",
    textColor: "#fff",
    promptKeywords: "ultra dark luxury black with gold shimmer, five gold seal badge icons horizontal strip (envio seguro pago protegido garantia devolucion entrega rapida atencion 24h), product center illuminated above strip, bold white and gold typography Compra con Total Confianza, premium trust logistics advertisement luxury prestigious",
  },
];

const FAQS_STYLES: BannerStyle[] = [
  {
    id: "faq-dark-clean",
    name: "Dark FAQ",
    desc: "Negro · Limpio · Preguntas claras",
    gradient: "radial-gradient(ellipse at 50% 50%, #18181b 0%, #09090b 100%)",
    accentColor: "#60A5FA",
    textColor: "#fff",
    promptKeywords: "dark black clean background, three or four floating FAQ accordion cards with question mark icon blue, question text and short answer below, subtle card border dark gray, product image right side, bold white typography Preguntas Frecuentes headline, clean dark FAQ advertisement simple professional",
  },
  {
    id: "faq-blue-pro",
    name: "Blue Professional FAQ",
    desc: "Azul · Profesional · Soporte claro",
    gradient: "linear-gradient(160deg, #0f172a 0%, #1e3a8a 60%, #1d4ed8 100%)",
    accentColor: "#60A5FA",
    textColor: "#fff",
    promptKeywords: "navy blue gradient, four FAQ question and answer cards floating white cards with blue question mark badge, plus accordion expand icon, bold question text and short answer, customer support chat icon top right, bold white typography FAQ Resolvemos tus Dudas headline, professional customer support FAQ advertisement navy",
  },
  {
    id: "faq-white-minimal",
    name: "Clean FAQ",
    desc: "Blanco · Minimalista · Moderno",
    gradient: "linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)",
    accentColor: "#2563EB",
    textColor: "#1e293b",
    promptKeywords: "clean white minimal background, four FAQ accordion rows with subtle divider lines, blue question mark icon each row, bold question text dark and short answer text gray, plus minus toggle icon, product right side, minimal clean typography, modern FAQ advertisement clean minimal",
  },
  {
    id: "faq-green-natural",
    name: "Green FAQ",
    desc: "Verde · Natural · Dudas resueltas",
    gradient: "radial-gradient(ellipse at 50% 30%, #d1fae5 0%, #6ee7b7 30%, #065f46 100%)",
    accentColor: "#10B981",
    textColor: "#fff",
    promptKeywords: "green natural gradient, four FAQ question cards with green leaf question mark badges, natural ingredient related questions answered, product prominently displayed, bold white typography Tus Dudas Resueltas headline, friendly informative natural health FAQ advertisement",
  },
  {
    id: "faq-warm-friendly",
    name: "Warm FAQ",
    desc: "Beige · Cálido · Amigable y cercano",
    gradient: "radial-gradient(ellipse at 50% 30%, #fef3c7 0%, #fde68a 30%, #d97706 100%)",
    accentColor: "#92400E",
    textColor: "#1a1a1a",
    promptKeywords: "warm golden beige background, four FAQ cards warm rounded style with speech bubble question mark icon, question and short answer warm dark typography, friendly customer service representative illustration, product displayed, bold warm dark typography ¿Tienes Dudas? headline, friendly warm FAQ advertisement approachable",
  },
  {
    id: "faq-purple-tech",
    name: "Tech FAQ",
    desc: "Púrpura · Tech · Preguntas técnicas",
    gradient: "radial-gradient(ellipse at 50% 70%, #4c1d95 0%, #2d0a6b 40%, #0f0118 100%)",
    accentColor: "#A78BFA",
    textColor: "#fff",
    promptKeywords: "deep purple tech gradient, four FAQ cards with glowing purple border and question mark icon, technical product questions answered, code bracket or tech icons decorative, product visible, bold white purple typography Preguntas Frecuentes headline, tech product FAQ advertisement premium purple",
  },
  {
    id: "faq-teal-health",
    name: "Health FAQ",
    desc: "Turquesa · Salud · Dudas de suplemento",
    gradient: "linear-gradient(160deg, #0f766e 0%, #0d9488 40%, #134e4a 100%)",
    accentColor: "#5EEAD4",
    textColor: "#fff",
    promptKeywords: "teal clinical gradient, four health supplement FAQ cards with medical cross or question mark icon teal, ingredient safety dosage usage questions answered, product bottle right side, bold white teal typography Tus Dudas de Salud Resueltas, clinical FAQ health supplement advertisement",
  },
  {
    id: "faq-pink-beauty",
    name: "Beauty FAQ",
    desc: "Rosa · Belleza · Preguntas de skincare",
    gradient: "radial-gradient(ellipse at 50% 30%, #fdf2f8 0%, #fce7f3 40%, #ec4899 100%)",
    accentColor: "#BE185D",
    textColor: "#831843",
    promptKeywords: "soft pink rose gradient, four beauty FAQ cards feminine style with pink question mark heart icon, skincare questions answered elegantly, rose petal decorative floating, beauty product displayed, elegant feminine typography ¿Tienes Preguntas? headline, beauty skincare feminine FAQ advertisement warm rose",
  },
  {
    id: "faq-orange-bold",
    name: "Bold FAQ",
    desc: "Naranja · Audaz · Respuestas directas",
    gradient: "linear-gradient(160deg, #7c2d12 0%, #c2410c 50%, #ea580c 100%)",
    accentColor: "#FED7AA",
    textColor: "#fff",
    promptKeywords: "bold orange gradient, four direct FAQ cards bold style with large orange question mark, bold direct short answers typography, product visible, customer avatar happy testimonial small, bold white orange typography ¡Respuestas Directas! headline, energetic bold FAQ advertisement direct no-nonsense",
  },
  {
    id: "faq-navy-gold",
    name: "Premium FAQ",
    desc: "Marino · Dorado · Soporte premium",
    gradient: "radial-gradient(ellipse at 50% 30%, #1e3a5f 0%, #0f1f3a 50%, #060d1a 100%)",
    accentColor: "#D97706",
    textColor: "#fff",
    promptKeywords: "dark navy background with gold particle effects, four FAQ cards gold border premium style, gold question mark badge each card, premium customer support chat icon, product illuminated right side, bold white gold typography Soporte Premium 24/7 headline, premium luxury FAQ customer support advertisement",
  },
  {
    id: "faq-sky-simple",
    name: "Sky FAQ",
    desc: "Azul cielo · Simple · Para todos",
    gradient: "linear-gradient(180deg, #bfdbfe 0%, #eff6ff 50%, #dbeafe 100%)",
    accentColor: "#2563EB",
    textColor: "#1e3a8a",
    promptKeywords: "bright sky blue clean gradient, four simple FAQ question bubbles rounded white cards with blue question mark, simple short answers dark blue text, product right side, cheerful helpful customer service icon, bold dark blue typography Preguntas y Respuestas headline, friendly simple FAQ advertisement approachable clean",
  },
  {
    id: "faq-dark-premium",
    name: "Dark Premium FAQ",
    desc: "Oscuro premium · Respuestas con autoridad",
    gradient: "radial-gradient(ellipse at 50% 50%, #312e81 0%, #1e1b4b 40%, #030712 100%)",
    accentColor: "#818CF8",
    textColor: "#fff",
    promptKeywords: "deep indigo dark gradient background, four floating FAQ cards glowing indigo border, cosmic question mark badge, concise authoritative answers, product center glowing, star rating confidence element, bold white indigo typography Todo lo que Necesitas Saber headline, premium authoritative FAQ advertisement dark cosmic",
  },
];

function getStylesForSection(sectionId: string): BannerStyle[] {
  if (sectionId === "oferta") return OFERTA_STYLES;
  if (sectionId === "antes_despues") return ANTES_DESPUES_STYLES;
  if (sectionId === "beneficios") return BENEFICIOS_STYLES;
  if (sectionId === "comparativa") return COMPARATIVA_STYLES;
  if (sectionId === "autoridad") return AUTORIDAD_STYLES;
  if (sectionId === "testimonios") return TESTIMONIOS_STYLES;
  if (sectionId === "ingredientes") return INGREDIENTES_STYLES;
  if (sectionId === "modo_uso") return MODO_USO_STYLES;
  if (sectionId === "logistica") return LOGISTICA_STYLES;
  if (sectionId === "faqs") return FAQS_STYLES;
  return HERO_STYLES;
}

// ─── Banner Mode: DesignGalleryModal ──────────────────────────────────────────

function GalleryThumbnail({ sectionId, styleId, gradient }: { sectionId: string; styleId: string; gradient: string }) {
  const [error, setError] = useState(false);
  const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/banner-templates/${sectionId}/${styleId}.jpg`;
  if (error) {
    return <div className="w-full h-full" style={{ background: gradient }} />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={url} alt="" className="w-full h-full object-cover" onError={() => setError(true)} />
  );
}

function DesignGalleryModal({ initialSectionId, currentStyleId, onSelect, onClose }: {
  initialSectionId: string;
  currentStyleId: string | null;
  onSelect: (sectionId: string, styleId: string) => void;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState(initialSectionId);
  const [pending, setPending] = useState<string | null>(currentStyleId);

  const styles = getStylesForSection(activeTab);
  const activeSection = BANNER_SECTIONS.find((s) => s.id === activeTab);

  function handleConfirm() {
    if (pending !== null) {
      onSelect(activeTab, pending);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#0D0D14] border border-[#2A2A3A] rounded-2xl shadow-2xl flex flex-col"
        style={{ width: "min(92vw, 900px)", maxHeight: "88vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A3A] flex-shrink-0">
          <div>
            <p className="text-[#F0F0F5] font-bold text-sm">Galería de Diseños</p>
            <p className="text-[#555568] text-[11px] mt-0.5">Elige un diseño de referencia · La IA lo adaptará a tu producto</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555568] hover:text-[#F0F0F5] hover:bg-[#2A2A3A] transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* Section tabs — horizontal scroll */}
        <div className="flex gap-1 px-4 py-3 overflow-x-auto flex-shrink-0 border-b border-[#1C1C26]" style={{ scrollbarWidth: "none" }}>
          {BANNER_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              onClick={() => { setActiveTab(sec.id); setPending(null); }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all flex-shrink-0"
              style={activeTab === sec.id
                ? { background: "#7C3AED", color: "#fff" }
                : { background: "#1C1C26", color: "#8888A0" }}>
              <span>{sec.icon}</span>
              <span>{sec.label}</span>
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {/* "Sin estilo" option */}
            <button
              onClick={() => setPending("")}
              className="rounded-xl border overflow-hidden text-left flex flex-col transition-all"
              style={pending === ""
                ? { border: "2px solid #7C3AED", background: "rgba(124,58,237,0.08)" }
                : { border: "1px solid #2A2A3A", background: "#13131A" }}>
              <div className="w-full overflow-hidden relative" style={{ aspectRatio: "9/16" }}>
                <div className="w-full h-full flex flex-col items-center justify-center gap-2 bg-[#1C1C26]">
                  <span className="text-3xl">✨</span>
                  <span className="text-[#555568] text-[10px] text-center px-2">IA libre</span>
                </div>
                {pending === "" && (
                  <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#7C3AED] flex items-center justify-center">
                    <Check size={10} color="#fff" />
                  </div>
                )}
              </div>
              <div className="px-2 py-1.5">
                <p className="text-[#8888A0] font-semibold text-[10px]">Sin estilo</p>
                <p className="text-[#3A3A4A] text-[9px] mt-0.5">La IA genera libremente</p>
              </div>
            </button>

            {styles.map((style) => {
              const selected = pending === style.id;
              return (
                <button
                  key={style.id}
                  onClick={() => setPending(style.id)}
                  className="rounded-xl border overflow-hidden text-left flex flex-col transition-all"
                  style={selected
                    ? { border: `2px solid ${style.accentColor}`, background: `${style.accentColor}12` }
                    : { border: "1px solid #2A2A3A", background: "#13131A" }}>
                  <div className="w-full overflow-hidden relative" style={{ aspectRatio: "9/16" }}>
                    <GalleryThumbnail sectionId={activeTab} styleId={style.id} gradient={style.gradient} />
                    {selected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{ background: style.accentColor }}>
                        <Check size={10} color="#fff" />
                      </div>
                    )}
                  </div>
                  <div className="px-2 py-1.5">
                    <p className="text-[#F0F0F5] font-semibold text-[10px] leading-tight truncate">{style.name}</p>
                    <p className="text-[#555568] text-[9px] mt-0.5 leading-tight line-clamp-1">{style.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[#2A2A3A] flex items-center justify-between flex-shrink-0">
          <p className="text-[#555568] text-[11px]">
            {pending
              ? `Seleccionado: ${styles.find((s) => s.id === pending)?.name ?? "Sin estilo"} · ${activeSection?.label}`
              : "Ninguno seleccionado"}
          </p>
          <div className="flex gap-2">
            <button onClick={onClose}
              className="px-4 py-1.5 rounded-lg text-[11px] font-medium text-[#8888A0] hover:text-[#F0F0F5] border border-[#2A2A3A] hover:border-[#3A3A4A] transition-colors">
              Cancelar
            </button>
            <button onClick={handleConfirm} disabled={pending === null}
              className="px-4 py-1.5 rounded-lg text-[11px] font-semibold text-white transition-colors disabled:opacity-40"
              style={{ background: "#7C3AED" }}>
              Usar este diseño
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Banner Mode: BannerImageCard ─────────────────────────────────────────────

function BannerImageCard({ section, config, images, externalGenerating, onImageGenerated, onStyleChange }: {
  section: { id: string; label: string; icon: string };
  config: BannerConfig;
  images: string[];
  externalGenerating?: boolean;
  onImageGenerated: (url: string) => void;
  onStyleChange: (styleId: string) => void;
}) {
  const [localGenerating, setLocalGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showStylePicker, setShowStylePicker] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(0);
  const generating = localGenerating || !!externalGenerating;
  const selectedStyleId = config.sectionStyles[section.id] ?? null;
  const allStyles = getStylesForSection(section.id);
  const selectedStyle = allStyles.find((s) => s.id === selectedStyleId) ?? null;

  async function handleGenerate() {
    setLocalGenerating(true);
    setError(null);
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
          styleKeywords: selectedStyle?.promptKeywords ?? "",
          priceSale: config.priceSale,
          priceOriginal: config.priceOriginal,
        }),
      });
      const data = await res.json();
      if (data.ok && data.imageUrl) {
        onImageGenerated(data.imageUrl);
        setPreviewIdx(0);
      } else {
        setError(data.error ?? "Error al generar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLocalGenerating(false);
    }
  }

  const currentImage = images[previewIdx] ?? null;

  return (
    <>
      {showStylePicker && (
        <DesignGalleryModal
          initialSectionId={section.id}
          currentStyleId={selectedStyleId}
          onSelect={(_sectionId, styleId) => onStyleChange(styleId)}
          onClose={() => setShowStylePicker(false)}
        />
      )}

      <div className="bg-[#13131A] border border-[#2A2A3A] rounded-xl overflow-hidden hover:border-[#3A3A4A] transition-colors">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-[#1C1C26]">
          <div className="flex items-center gap-2">
            <span className="text-sm">{section.icon}</span>
            <p className="text-[#F0F0F5] font-semibold text-xs">{section.label}</p>
            {images.length > 0 && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-[rgba(74,222,128,0.1)] text-green-400 font-medium">
                {images.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <button onClick={() => setShowStylePicker(true)}
              className="flex items-center gap-1 px-2 py-1 rounded-lg border text-[9px] font-medium transition-all"
              style={selectedStyle
                ? { border: `1px solid ${selectedStyle.accentColor}40`, background: `${selectedStyle.accentColor}15`, color: selectedStyle.accentColor }
                : { border: "1px solid #2A2A3A", background: "#1C1C26", color: "#555568" }}>
              <div className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                style={{ background: selectedStyle?.gradient ?? "#3A3A4A" }} />
              {selectedStyle ? selectedStyle.name : "Sin estilo"}
            </button>
            <button onClick={handleGenerate} disabled={generating}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-white text-[10px] font-semibold transition-colors disabled:opacity-60"
              style={{ background: "#7C3AED" }}>
              {generating ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
              {generating ? "Generando..." : images.length > 0 ? "Regenerar" : "Generar"}
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="p-3">
          {error && (
            <div className="mb-2 px-2 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-1.5">
              <AlertCircle size={11} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-400 text-[10px] leading-tight">{error}</p>
            </div>
          )}

          {currentImage ? (
            <div className="space-y-2">
              {/* Main preview */}
              <div className="relative rounded-xl overflow-hidden bg-[#0A0A0F] border border-[#2A2A3A]"
                style={{ aspectRatio: "9/16" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={currentImage} alt={section.label} className="w-full h-full object-cover" />
                {/* Overlay actions */}
                <div className="absolute bottom-2 right-2 flex gap-1.5">
                  <a href={currentImage} download={`${section.id}-${previewIdx + 1}.jpg`} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 hover:bg-black/90 text-white text-[10px] font-medium transition-colors backdrop-blur-sm border border-white/10">
                    <Download size={10} /> Descargar
                  </a>
                  <button onClick={handleGenerate} disabled={generating}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[#7C3AED]/80 hover:bg-[#7C3AED] text-white text-[10px] font-medium transition-colors backdrop-blur-sm border border-[#7C3AED]/30">
                    <RefreshCw size={10} /> Nueva versión
                  </button>
                </div>
                {images.length > 1 && (
                  <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] backdrop-blur-sm">
                    {previewIdx + 1} / {images.length}
                  </div>
                )}
              </div>
              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                  {images.slice(0, 6).map((url, i) => (
                    <button key={i} onClick={() => setPreviewIdx(i)}
                      className="w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all"
                      style={{ borderColor: i === previewIdx ? "#7C3AED" : "#2A2A3A" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[#2A2A3A] flex flex-col items-center justify-center gap-2 py-8"
              style={selectedStyle ? { background: `${selectedStyle.gradient}`, opacity: 0.6 } : {}}>
              {generating ? (
                <>
                  <Loader2 size={16} className="animate-spin text-[#555568]" />
                  <span className="text-[#555568] text-[10px]">Generando con IA...</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">{section.icon}</span>
                  <span className="text-[#3A3A4A] text-[10px]">
                    {selectedStyle ? `Estilo: ${selectedStyle.name} · ` : ""}Haz clic en Generar
                  </span>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Banner Mode: BannerEditorContent (two-column redesign) ───────────────────

function BannerEditorContent({ config, setConfig, generatedImages, setGeneratedImages, product: initialProduct, landingId }: {
  config: BannerConfig;
  setConfig: React.Dispatch<React.SetStateAction<BannerConfig>>;
  generatedImages: Record<string, string[]>;
  setGeneratedImages: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  product: string;
  landingId: string;
}) {
  const [generatingAngles, setGeneratingAngles] = useState(false);
  const [generatingContext, setGeneratingContext] = useState(false);
  const [contextError, setContextError] = useState<string | null>(null);
  const [anglesError, setAnglesError] = useState<string | null>(null);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number } | null>(null);
  const [pendingSections, setPendingSections] = useState<Set<string>>(new Set());

  function upd(patch: Partial<BannerConfig>) { setConfig((p) => ({ ...p, ...patch })); }

  async function generateAllBanners(angle: string) {
    const total = BANNER_SECTIONS.length;
    setBulkProgress({ current: 0, total });
    setPendingSections(new Set(BANNER_SECTIONS.map((s) => s.id)));

    let completed = 0;
    const BATCH = 2;
    const queue = [...BANNER_SECTIONS];

    while (queue.length > 0) {
      const batch = queue.splice(0, BATCH);
      await Promise.all(batch.map(async (section) => {
        const styleId = config.sectionStyles[section.id];
        const styleKeywords = styleId
          ? getStylesForSection(section.id).find((s) => s.id === styleId)?.promptKeywords ?? ""
          : "";
        try {
          const res = await fetch("/api/landing/generate-banner-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sectionType: section.id,
              productDescription: config.description,
              angle,
              colors: config.colors,
              font: config.font,
              country: config.country,
              aiModel: config.aiModel,
              styleKeywords,
              priceSale: config.priceSale,
              priceOriginal: config.priceOriginal,
            }),
          });
          const data = await res.json();
          if (data.ok && data.imageUrl) {
            setGeneratedImages((p) => ({
              ...p,
              [section.id]: [data.imageUrl, ...(p[section.id] ?? [])],
            }));
          }
        } catch { /* skip on error, continue queue */ }
        completed++;
        setBulkProgress({ current: completed, total });
        setPendingSections((p) => { const n = new Set(p); n.delete(section.id); return n; });
      }));
    }

    setBulkProgress(null);
  }

  async function blobToBase64(url: string): Promise<{ kind: "base64"; data: string; mediaType: string } | null> {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          const b64 = (reader.result as string).split(",")[1];
          resolve({ kind: "base64", data: b64, mediaType: blob.type || "image/jpeg" });
        };
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch { return null; }
  }

  async function handleGenerateContext() {
    if (!initialProduct && !config.description) return;
    setGeneratingContext(true);
    setContextError(null);
    try {
      const rawRefs = config.refImages.filter((r): r is string => r !== null);
      const refImages = (await Promise.all(
        rawRefs.map(async (url) => {
          if (url.startsWith("http")) return { kind: "url" as const, url };
          if (url.startsWith("blob:")) return blobToBase64(url);
          return null;
        })
      )).filter((r): r is NonNullable<typeof r> => r !== null);

      const res = await fetch("/api/landing/generate-product-context", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: initialProduct || config.description,
          description: config.description,
          country: config.country,
          refImages,
        }),
      });
      const data = await res.json();
      if (data.ok) {
        upd({
          description: data.description || config.description,
          benefits: data.benefits?.length ? data.benefits : config.benefits,
          problems: data.problems?.length ? data.problems : config.problems,
          ingredients: data.ingredients?.length ? data.ingredients : config.ingredients,
          differentiator: data.differentiator || config.differentiator,
        });
      } else {
        setContextError(data.error ?? "Error al analizar. Verifica que ANTHROPIC_API_KEY esté configurada en Vercel.");
      }
    } catch (e) {
      setContextError(e instanceof Error ? e.message : "Error de conexión");
    } finally {
      setGeneratingContext(false);
    }
  }

  async function handleGenerateAngles() {
    if (!config.description && !initialProduct) return;
    setGeneratingAngles(true);
    setAnglesError(null);
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
      if (data.ok && data.angles) {
        const newAngle = data.angles[0] ?? "";
        upd({ angles: data.angles, selectedAngle: newAngle });
        setGeneratingAngles(false);
        if (newAngle) {
          await generateAllBanners(newAngle);
        }
        return;
      } else {
        setAnglesError(data.error ?? "Error al generar ángulos. Verifica que ANTHROPIC_API_KEY esté configurada en Vercel.");
      }
    } catch (e) {
      setAnglesError(e instanceof Error ? e.message : "Error de conexión");
    } finally {
      setGeneratingAngles(false);
    }
  }

  const currency = COUNTRIES.find((c) => c.code === config.country)?.currency ?? "$";

  return (
    <div className="flex overflow-hidden" style={{ height: "calc(100vh - 57px)" }}>

      {/* ── LEFT PANEL: Config ── */}
      <aside className="w-[380px] xl:w-[420px] flex-shrink-0 overflow-y-auto border-r border-[#1C1C26] bg-[#0D0D14]">

        {/* 1 · Imágenes de Referencia */}
        <div className="p-4 border-b border-[#1C1C26]">
          <div className="flex items-center justify-between mb-3">
            <p className="text-xs font-bold text-[#F0F0F5]">📷 Imágenes de Referencia</p>
            <button onClick={handleGenerateContext} disabled={generatingContext || (!initialProduct && !config.description)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-semibold text-white transition-colors disabled:opacity-40"
              style={{ background: "#7C3AED" }}>
              {generatingContext ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={10} />}
              {generatingContext ? "Analizando..." : "Analizar con IA"}
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {[0, 1, 2].map((i) => (
              <RefImageUpload key={i} idx={i} url={config.refImages[i] ?? null} landingId={landingId}
                onChange={(url) => {
                  const r = [...config.refImages] as (string | null)[];
                  r[i] = url;
                  upd({ refImages: r });
                }} />
            ))}
          </div>
          <p className="text-[9px] text-[#3A3A4A] mt-2">Sube fotos del producto · Luego haz clic en "Analizar con IA" para auto-rellenar el formulario</p>
          {contextError && (
            <div className="mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-1.5">
              <AlertCircle size={10} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-400 text-[9px] leading-snug">{contextError}</p>
            </div>
          )}
        </div>

        {/* 2 · País Destino */}
        <div className="p-4 border-b border-[#1C1C26]">
          <p className="text-xs font-bold text-[#F0F0F5] mb-2.5">🌍 País Destino</p>
          <div className="grid grid-cols-5 gap-1.5">
            {COUNTRIES.map((c) => (
              <button key={c.code} onClick={() => upd({ country: c.code })}
                className="flex flex-col items-center gap-0.5 py-2 rounded-lg border transition-all"
                style={config.country === c.code
                  ? { border: "1px solid #7C3AED", background: "rgba(124,58,237,0.15)" }
                  : { border: "1px solid #1C1C26", background: "#13131A" }}>
                <span className="text-base leading-none">{c.flag}</span>
                <span className="text-[8px] font-bold" style={{ color: config.country === c.code ? "#A78BFA" : "#555568" }}>{c.code}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3 · Estilo Visual */}
        <div className="p-4 border-b border-[#1C1C26] space-y-3">
          <p className="text-xs font-bold text-[#F0F0F5]">🎨 Estilo Visual</p>

          {/* AI Model */}
          <div>
            <p className="text-[10px] text-[#555568] mb-1.5">Modelo de IA para imágenes</p>
            <div className="space-y-1">
              {AI_MODELS.map((m) => (
                <button key={m.id} onClick={() => upd({ aiModel: m.id })}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border text-left transition-all"
                  style={config.aiModel === m.id
                    ? { border: "1px solid #7C3AED", background: "rgba(124,58,237,0.1)" }
                    : { border: "1px solid #1C1C26", background: "#13131A" }}>
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    style={{ background: config.aiModel === m.id ? "#7C3AED" : "#3A3A4A" }} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium" style={{ color: config.aiModel === m.id ? "#F0F0F5" : "#8888A0" }}>{m.label}</p>
                    <p className="text-[9px] text-[#555568] truncate">{m.desc}</p>
                  </div>
                  <span className="text-[9px] font-mono text-[#555568] flex-shrink-0">{m.price}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Font */}
          <div>
            <p className="text-[10px] text-[#555568] mb-1">Tipografía</p>
            <select value={config.font} onChange={(e) => upd({ font: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[#2A2A3A] bg-[#0A0A0F] text-[#F0F0F5] text-sm focus:outline-none focus:border-[#7C3AED] transition-colors">
              {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
            <p className="text-xs text-[#555568] mt-1.5 px-0.5" style={{ fontFamily: config.font }}>
              La mejor calidad garantizada — {config.font}
            </p>
          </div>

          {/* Colors */}
          <div>
            <p className="text-[10px] text-[#555568] mb-1.5">Paleta de colores</p>
            <div className="flex items-center gap-3">
              {config.colors.map((color, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="relative w-10 h-10 rounded-xl overflow-hidden border border-[#2A2A3A] cursor-pointer" style={{ background: color }}>
                    <input type="color" value={color}
                      onChange={(e) => { const nc = [...config.colors]; nc[i] = e.target.value; upd({ colors: nc }); }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                  </div>
                  <span className="text-[8px] font-mono text-[#555568]">{color}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4 · Contexto del Producto */}
        <div className="p-4 border-b border-[#1C1C26] space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-[#F0F0F5]">📋 Contexto del Producto</p>
            <button onClick={handleGenerateContext} disabled={generatingContext || (!initialProduct && !config.description)}
              className="flex items-center gap-1 px-2 py-0.5 rounded-md text-[9px] font-semibold border border-[#3A3A4A] hover:border-[#7C3AED] text-[#A78BFA] disabled:opacity-40 transition-colors">
              <Sparkles size={8} /> IA
            </button>
          </div>

          <div>
            <label className="block text-[10px] text-[#555568] mb-1">Descripción del Producto</label>
            <textarea value={config.description} onChange={(e) => upd({ description: e.target.value })}
              rows={3} placeholder="Describe el producto en detalle..."
              className="w-full px-2.5 py-2 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#3A3A4A] focus:outline-none focus:border-[#7C3AED] text-xs resize-none transition-colors" />
          </div>

          <CompactList label="Beneficios Principales" items={config.benefits} onChange={(v) => upd({ benefits: v })} placeholder="Ej: Reduce medidas desde el primer uso" />
          <CompactList label="Problemas que Resuelve" items={config.problems} onChange={(v) => upd({ problems: v })} placeholder="Ej: Dolor de espalda crónico" />
          <CompactList label="Ingredientes / Materiales" items={config.ingredients} onChange={(v) => upd({ ingredients: v })} placeholder="Ej: Tejido térmico neopreno premium" />

          <div>
            <label className="block text-[10px] text-[#555568] mb-1">Diferenciador</label>
            <input value={config.differentiator} onChange={(e) => upd({ differentiator: e.target.value })}
              placeholder="¿Qué te hace único vs la competencia?"
              className="w-full px-2.5 py-2 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#3A3A4A] focus:outline-none focus:border-[#7C3AED] text-xs transition-colors" />
          </div>

          <button onClick={handleGenerateAngles} disabled={generatingAngles || !!bulkProgress}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-60"
            style={{ background: "#FF6B35" }}>
            {(generatingAngles || bulkProgress) ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            {generatingAngles
              ? "Generando ángulos..."
              : bulkProgress
                ? `Generando banners ${bulkProgress.current}/${bulkProgress.total}...`
                : "💡 Generar Ángulos + Banners"}
          </button>

          {anglesError && (
            <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-1.5">
              <AlertCircle size={10} className="text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-400 text-[9px] leading-snug">{anglesError}</p>
            </div>
          )}

          {config.angles.length > 0 && (
            <div>
              <p className="text-[9px] text-[#555568] mb-1.5">Selecciona el ángulo para los banners:</p>
              <div className="flex flex-wrap gap-1.5">
                {config.angles.map((angle, i) => (
                  <button key={i} onClick={() => upd({ selectedAngle: angle })}
                    className="px-2.5 py-1 rounded-full text-[10px] font-medium transition-all leading-tight"
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

        {/* 5 · Precios */}
        <div className="p-4">
          <p className="text-xs font-bold text-[#F0F0F5] mb-3">💰 Precios del Producto</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Precio Oferta",   field: "priceSale",     placeholder: "89.900" },
              { label: "Precio Antes",    field: "priceOriginal", placeholder: "150.000" },
              { label: "2 Unidades",      field: "priceBundle2",  placeholder: "160.000" },
              { label: "3 Unidades",      field: "priceBundle3",  placeholder: "220.000" },
            ].map(({ label, field, placeholder }) => (
              <div key={field}>
                <label className="block text-[9px] text-[#555568] mb-1">{label}</label>
                <div className="relative">
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[#555568] text-[10px]">{currency}</span>
                  <input
                    value={(config as unknown as Record<string, string>)[field] ?? ""}
                    onChange={(e) => upd({ [field]: e.target.value } as Partial<BannerConfig>)}
                    placeholder={placeholder}
                    className="w-full pl-5 pr-2 py-2 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#3A3A4A] focus:outline-none focus:border-[#7C3AED] text-xs transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* ── RIGHT PANEL: Banner Sections ── */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-5 bg-[#0A0A0F]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-[#F0F0F5] font-bold text-sm">Secciones de Banners</h2>
            <p className="text-[#555568] text-[10px] mt-0.5">Formato 1080×1920 · Se generan al crear ángulos · Regenera cualquiera individualmente</p>
          </div>
          {config.selectedAngle && (
            <div className="max-w-[200px] px-2.5 py-1.5 rounded-lg border border-[rgba(255,107,53,0.3)] bg-[rgba(255,107,53,0.08)]">
              <p className="text-[9px] text-[#FF6B35] font-medium truncate">{config.selectedAngle}</p>
            </div>
          )}
        </div>

        {bulkProgress && (
          <div className="mb-4 p-3 rounded-xl border border-[rgba(124,58,237,0.3)] bg-[rgba(124,58,237,0.08)]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Loader2 size={13} className="animate-spin text-[#A78BFA]" />
                <p className="text-[#A78BFA] text-xs font-semibold">Generando banners con IA…</p>
              </div>
              <p className="text-[#A78BFA] text-xs font-mono">{bulkProgress.current} / {bulkProgress.total}</p>
            </div>
            <div className="h-1.5 rounded-full bg-[#1C1C26] overflow-hidden">
              <div className="h-full bg-gradient-to-r from-[#7C3AED] to-[#A78BFA] transition-all duration-500"
                style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }} />
            </div>
          </div>
        )}

        <div className="space-y-2">
          {BANNER_SECTIONS.map((section) => (
            <BannerImageCard
              key={section.id}
              section={section}
              config={config}
              images={generatedImages[section.id] ?? []}
              externalGenerating={pendingSections.has(section.id)}
              onImageGenerated={(url) => {
                setGeneratedImages((p) => ({
                  ...p,
                  [section.id]: [url, ...(p[section.id] ?? [])],
                }));
              }}
              onStyleChange={(styleId) => {
                upd({
                  sectionStyles: {
                    ...config.sectionStyles,
                    [section.id]: styleId,
                  },
                });
              }}
            />
          ))}
        </div>

        <div className="flex items-center justify-center gap-2 py-6 mt-2">
          <RefreshCw size={11} className="text-[#3A3A4A]" />
          <p className="text-[#3A3A4A] text-[10px]">
            Haz clic en <strong className="text-[#555568]">Guardar</strong> en la barra superior para conservar la configuración
          </p>
        </div>
      </main>
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

  const [sections, setSections] = useState<Section[]>([]);
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
          setBannerConfig((p) => ({ ...p, description: landingData.product ?? "" }));
        }
        if (landingData.banner_images) setGeneratedImages(landingData.banner_images);
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

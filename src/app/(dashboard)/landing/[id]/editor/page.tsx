"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft, Sparkles, Eye, Globe, GripVertical, Pencil, Trash2, Plus,
  Check, Loader2, ChevronDown, ChevronUp, Copy, X, Upload, Download,
  ChevronRight, RefreshCw, AlertCircle, Wand2,
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

interface BannerTemplate {
  id: string;        // filename without extension
  name: string;      // prettified for display
  imageUrl: string;  // public Supabase URL
}

const TEMPLATE_BUCKET_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/banner-templates`;

function prettifyTemplateName(filename: string): string {
  return filename
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function templateKeywords(id: string): string {
  return id.replace(/[-_]+/g, " ").trim();
}

async function fetchTemplatesForSection(sectionId: string): Promise<BannerTemplate[]> {
  const supabase = createClient();
  const { data, error } = await supabase.storage
    .from("banner-templates")
    .list(sectionId, { limit: 200, sortBy: { column: "name", order: "asc" } });
  if (error || !data) return [];
  return data
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f.name))
    .map((f) => ({
      id: f.name.replace(/\.[^.]+$/, ""),
      name: prettifyTemplateName(f.name),
      imageUrl: `${TEMPLATE_BUCKET_URL}/${sectionId}/${f.name}`,
    }));
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
  aiModel: "openai-gpt-image-2",
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

const SECTION_COLORS: Record<string, string> = {
  hero:          "#FF6B35",
  oferta:        "#4ADE80",
  antes_despues: "#06B6D4",
  beneficios:    "#22D3EE",
  comparativa:   "#3B82F6",
  autoridad:     "#F59E0B",
  testimonios:   "#EAB308",
  ingredientes:  "#14B8A6",
  modo_uso:      "#8B5CF6",
  logistica:     "#6366F1",
  faqs:          "#EC4899",
};

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
  { id: "gemini-nano-banana-2",   label: "Nano Banana 2",       price: "~$0.03", desc: "⭐ Google · Rápido y económico · Ideal landings" },
  { id: "gemini-nano-banana-pro", label: "Nano Banana Pro",     price: "~$0.04", desc: "⭐ Google · Máxima calidad · Texto 4K" },
  { id: "openai-gpt-image-2",     label: "GPT Image 2",         price: "~$0.06", desc: "⭐ OpenAI · Máxima fidelidad · El mejor para plantillas" },
  { id: "fal-ideogram2",          label: "Ideogram v3",          price: "~$0.08", desc: "Fal.ai · Ideal para banners con copy" },
  { id: "fal-flux-ultra",         label: "Flux Pro Ultra",       price: "~$0.06", desc: "Fal.ai · Fotorrealismo extremo" },
  { id: "fal-imagen3",            label: "Google Imagen 3",      price: "~$0.04", desc: "Fal.ai · Google · Alta calidad" },
  { id: "fal-flux-pro",           label: "Flux Pro 1.1",         price: "~$0.05", desc: "Fal.ai · Alta calidad · 4K" },
  { id: "fal-flux-dev",           label: "Flux Dev",             price: "~$0.03", desc: "Fal.ai · Rápido · Volumen" },
  { id: "fal-sd-xl",              label: "Stable Diffusion XL",  price: "~$0.02", desc: "Fal.ai · Creativo · Versátil" },
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
          <button onClick={() => handleGenerate()} disabled={generating}
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

function EditorTopbar({ landingName, slug, published, saving, saved, mode, landingId, onTogglePublish, onSave }: {
  landingName: string; slug: string; published: boolean; saving: boolean; saved: boolean;
  mode: LandingMode; landingId: string; onTogglePublish: () => Promise<void>; onSave: () => Promise<void>;
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
        {mode === "banners" && (
          <Link href={`/landing/${landingId}/assembler`}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(124,58,237,0.4)] bg-[rgba(124,58,237,0.10)] text-[#A78BFA] hover:bg-[rgba(124,58,237,0.18)] text-xs font-semibold transition-colors">
            <ChevronRight size={13} />Ensamblar
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

function ShopifyExportTab({ forgeConfig, product, landingName }: {
  forgeConfig: Record<string, string>;
  product: string;
  landingName: string;
}) {
  const [generating, setGenerating] = useState(false);
  const [blocks, setBlocks] = useState<{ title: string; html: string }[]>([]);
  const [genError, setGenError] = useState<string | null>(null);
  const [copied, setCopied] = useState<number | null>(null);

  async function generate() {
    setGenerating(true);
    setGenError(null);
    try {
      const res = await fetch("/api/landing/generate-shopify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ landingName, product, forgeConfig }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Error generando bloques");
      setBlocks(data.blocks ?? []);
    } catch (e) {
      setGenError(e instanceof Error ? e.message : "Error inesperado");
    } finally {
      setGenerating(false);
    }
  }

  function copyBlock(idx: number, html: string) {
    navigator.clipboard.writeText(html);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-4">
      <div className="bg-[#13131A] border border-[rgba(16,185,129,0.3)] rounded-2xl p-5">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h3 className="text-[#F0F0F5] font-semibold mb-1">Exportar para Shopify</h3>
            <p className="text-[#8888A0] text-xs">4 bloques HTML/Liquid listos para pegar en tu tema Shopify.</p>
          </div>
          <button
            onClick={generate}
            disabled={generating}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white font-semibold text-sm transition-colors disabled:opacity-60 shrink-0"
          >
            {generating ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />}
            {generating ? "Generando..." : blocks.length ? "Regenerar" : "Generar bloques"}
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          {[
            ["País", forgeConfig.country],
            ["Precio original", forgeConfig.priceOriginal || "—"],
            ["1 unidad", forgeConfig.price1u || "—"],
            ["2 unidades", forgeConfig.price2u || "—"],
          ].map(([k, v]) => (
            <div key={k} className="bg-[#1C1C26] rounded-lg px-3 py-2">
              <span className="text-[#555568]">{k}: </span>
              <span className="text-[#F0F0F5] font-medium">{v}</span>
            </div>
          ))}
        </div>
      </div>

      {genError && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-[#EF4444]/30 bg-[rgba(239,68,68,0.05)]">
          <AlertCircle size={15} className="text-[#EF4444] shrink-0 mt-0.5" />
          <p className="text-[#EF4444] text-xs">{genError}</p>
        </div>
      )}

      {blocks.map((block, idx) => (
        <div key={idx} className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#2A2A3A]">
            <span className="text-[#F0F0F5] text-sm font-semibold">{block.title}</span>
            <button
              onClick={() => copyBlock(idx, block.html)}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#1C1C26] hover:bg-[#2A2A3A] text-xs font-medium transition-colors"
              style={{ color: copied === idx ? "#10B981" : "#8888A0" }}
            >
              {copied === idx ? <Check size={12} /> : <Copy size={12} />}
              {copied === idx ? "Copiado" : "Copiar"}
            </button>
          </div>
          <pre className="p-4 text-[11px] text-[#8888A0] font-mono overflow-x-auto max-h-48 leading-relaxed whitespace-pre-wrap break-all">
            {block.html.length > 800 ? block.html.slice(0, 800) + "\n\n[... ver completo al copiar]" : block.html}
          </pre>
          <div className="px-4 py-2 bg-[#0A0A0F] border-t border-[#2A2A3A]">
            <p className="text-[#555568] text-[10px]">
              📌 Shopify: Tema › Editar código › Sección &quot;Liquid personalizado&quot; › Pegar › Añadir botón de compra antes del siguiente bloque.
            </p>
          </div>
        </div>
      ))}

      {blocks.length === 0 && !generating && !genError && (
        <div className="bg-[#13131A] border-2 border-dashed border-[#2A2A3A] rounded-2xl py-14 flex flex-col items-center gap-3 text-center">
          <Sparkles size={28} className="text-[#10B981] opacity-50" />
          <p className="text-[#8888A0] text-sm">Haz clic en &quot;Generar bloques&quot; para crear tu landing Shopify.</p>
        </div>
      )}
    </div>
  );
}

function PageEditorContent({ sections, setSections, product, forgeConfig, landingName }: {
  sections: Section[]; setSections: React.Dispatch<React.SetStateAction<Section[]>>; product: string;
  forgeConfig?: Record<string, string> | null; landingName?: string;
}) {
  const [activeTab, setActiveTab] = useState<"sections" | "shopify">("sections");
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

      {forgeConfig && (
        <div className="flex gap-1 bg-[#13131A] border border-[#2A2A3A] rounded-xl p-1 mb-2">
          <button onClick={() => setActiveTab("sections")} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === "sections" ? "bg-[#FF6B35] text-white" : "text-[#8888A0] hover:text-[#F0F0F5]"}`}>
            Secciones
          </button>
          <button onClick={() => setActiveTab("shopify")} className={`flex-1 py-2 rounded-lg text-xs font-semibold transition-all ${activeTab === "shopify" ? "bg-[#10B981] text-white" : "text-[#8888A0] hover:text-[#F0F0F5]"}`}>
            🛍️ Shopify Export
          </button>
        </div>
      )}

      {activeTab === "shopify" && forgeConfig ? (
        <ShopifyExportTab forgeConfig={forgeConfig} product={product} landingName={landingName ?? product} />
      ) : (
      <>
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
      </>
      )}
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


// ─── Banner Mode: DesignGalleryModal ──────────────────────────────────────────

function DesignGalleryModal({ initialSectionId, templates, loadingSections, currentTemplateId, onSelect, onClose }: {
  initialSectionId: string;
  templates: Record<string, BannerTemplate[]>;
  loadingSections: Set<string>;
  currentTemplateId: string | null;
  onSelect: (sectionId: string, templateId: string) => void;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState(initialSectionId);
  const [pending, setPending] = useState<string | null>(currentTemplateId);

  const list = templates[activeTab] ?? [];
  const isLoading = loadingSections.has(activeTab);
  const activeSection = BANNER_SECTIONS.find((s) => s.id === activeTab);

  function handleConfirm() {
    if (pending !== null) onSelect(activeTab, pending);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-[#0D0D14] border border-[#2A2A3A] rounded-2xl shadow-2xl flex flex-col"
        style={{ width: "min(92vw, 900px)", maxHeight: "88vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#2A2A3A] flex-shrink-0">
          <div>
            <p className="text-[#F0F0F5] font-bold text-sm">Galería de Diseños</p>
            <p className="text-[#555568] text-[11px] mt-0.5">Elige un diseño de referencia · La IA lo adaptará a tu producto</p>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555568] hover:text-[#F0F0F5] hover:bg-[#2A2A3A] transition-colors">
            <X size={14} />
          </button>
        </div>

        <div className="flex gap-1 px-4 py-3 overflow-x-auto flex-shrink-0 border-b border-[#1C1C26]" style={{ scrollbarWidth: "none" }}>
          {BANNER_SECTIONS.map((sec) => {
            const count = templates[sec.id]?.length ?? 0;
            return (
              <button
                key={sec.id}
                onClick={() => { setActiveTab(sec.id); setPending(null); }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all flex-shrink-0"
                style={activeTab === sec.id
                  ? { background: "#7C3AED", color: "#fff" }
                  : { background: "#1C1C26", color: "#8888A0" }}>
                <span>{sec.icon}</span>
                <span>{sec.label}</span>
                {count > 0 && (
                  <span className="text-[9px] px-1 py-0.5 rounded-full"
                    style={activeTab === sec.id ? { background: "rgba(255,255,255,0.2)" } : { background: "#2A2A3A" }}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Loader2 size={20} className="animate-spin text-[#7C3AED]" />
              <p className="text-[#555568] text-xs">Cargando plantillas…</p>
            </div>
          ) : list.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
              <span className="text-3xl">📭</span>
              <p className="text-[#8888A0] text-xs font-medium">No hay plantillas para {activeSection?.label}</p>
              <p className="text-[#555568] text-[10px] max-w-xs">
                Sube imágenes al bucket <code className="text-[#7C3AED]">banner-templates/{activeTab}/</code> en Supabase Storage.
                Aparecerán aquí automáticamente.
              </p>
              <button
                onClick={() => { setPending(""); }}
                className="mt-3 px-3 py-1.5 rounded-lg border border-[#2A2A3A] text-[#8888A0] text-[10px] hover:text-[#F0F0F5] hover:border-[#3A3A4A] transition-colors">
                Generar sin plantilla (IA libre)
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
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
                  <p className="text-[#8888A0] font-semibold text-[10px]">Sin plantilla</p>
                  <p className="text-[#3A3A4A] text-[9px] mt-0.5">La IA genera libremente</p>
                </div>
              </button>

              {list.map((tpl) => {
                const selected = pending === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => setPending(tpl.id)}
                    className="rounded-xl border overflow-hidden text-left flex flex-col transition-all"
                    style={selected
                      ? { border: "2px solid #7C3AED", background: "rgba(124,58,237,0.10)" }
                      : { border: "1px solid #2A2A3A", background: "#13131A" }}>
                    <div className="w-full overflow-hidden relative bg-[#0A0A0F]" style={{ aspectRatio: "9/16" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={tpl.imageUrl} alt={tpl.name} className="w-full h-full object-cover" />
                      {selected && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#7C3AED] flex items-center justify-center">
                          <Check size={10} color="#fff" />
                        </div>
                      )}
                    </div>
                    <div className="px-2 py-1.5">
                      <p className="text-[#F0F0F5] font-semibold text-[10px] leading-tight truncate">{tpl.name}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="px-5 py-3 border-t border-[#2A2A3A] flex items-center justify-between flex-shrink-0">
          <p className="text-[#555568] text-[11px]">
            {pending !== null
              ? `Seleccionado: ${pending === "" ? "Sin plantilla" : list.find((t) => t.id === pending)?.name ?? pending} · ${activeSection?.label}`
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

// ─── Banner Mode: SectionImageModal ──────────────────────────────────────────

function SectionImageModal({
  imageUrl, sectionLabel, sectionIcon, color, applying,
  onClose, onApplyEdit, onNewVersion,
}: {
  imageUrl: string;
  sectionLabel: string;
  sectionIcon: string;
  color: string;
  applying: boolean;
  onClose: () => void;
  onApplyEdit: (instruction: string, refImageBase64: string | null) => void;
  onNewVersion: () => void;
}) {
  const [activePanel, setActivePanel] = useState<"edit" | null>(null);
  const [editInstruction, setEditInstruction] = useState("");
  const [editRefImage, setEditRefImage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [canvaCopied, setCanvaCopied] = useState(false);
  const editRefFileRef = useRef<HTMLInputElement>(null);

  async function downloadImage(filename: string) {
    setDownloading(true);
    try {
      const res = await fetch(imageUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      window.open(imageUrl, "_blank");
    } finally {
      setDownloading(false);
    }
  }

  function handleEditRefFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => setEditRefImage(reader.result as string);
    reader.readAsDataURL(file);
  }

  function openCanva() {
    navigator.clipboard.writeText(imageUrl).catch(() => {});
    setCanvaCopied(true);
    setTimeout(() => setCanvaCopied(false), 3000);
    window.open("https://www.canva.com/", "_blank");
  }

  function shareWhatsApp() {
    const text = encodeURIComponent(`🔥 Banner generado con PlusBy\n${imageUrl}`);
    window.open(`https://wa.me/?text=${text}`, "_blank");
  }

  const slug = sectionLabel.toLowerCase().replace(/\s+/g, "-");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl shadow-2xl flex overflow-hidden"
        style={{ width: "min(96vw, 860px)", maxHeight: "92vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left: image preview */}
        <div className="relative bg-[#0A0A0F] flex items-center justify-center flex-shrink-0" style={{ width: 220 }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={imageUrl} alt={sectionLabel} className="w-full h-full object-contain" style={{ maxHeight: "92vh" }} />
          <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-black/70 backdrop-blur-sm">
            <span className="text-sm">{sectionIcon}</span>
            <span className="text-white text-[10px] font-semibold">{sectionLabel}</span>
          </div>
          <button
            onClick={onClose}
            className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-black/70 text-white hover:bg-black/90 transition-colors"
          >
            <X size={13} />
          </button>
        </div>

        {/* Right: actions */}
        <div className="flex-1 overflow-y-auto p-5 border-l border-[#2A2A3A]">
          <div className="mb-4">
            <p className="text-[#F0F0F5] font-bold text-sm">Acciones</p>
            <p className="text-[#555568] text-[10px] mt-0.5">Descarga, edita o comparte tu banner</p>
          </div>

          <div className="space-y-2">
            {/* Download 2K */}
            <button
              onClick={() => downloadImage(`${slug}-2k.png`)}
              disabled={downloading}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#2A2A3A] hover:border-[#3A3A4A] hover:bg-[#1C1C26] transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-[rgba(167,139,250,0.12)] border border-[rgba(167,139,250,0.25)] flex items-center justify-center flex-shrink-0">
                {downloading ? <Loader2 size={14} className="animate-spin text-[#A78BFA]" /> : <Download size={14} className="text-[#A78BFA]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#F0F0F5] text-xs font-semibold">Descargar en 2K</p>
                <p className="text-[#555568] text-[10px]">Resolución original · Máxima calidad</p>
              </div>
            </button>

            {/* Download optimizada */}
            <button
              onClick={() => downloadImage(`${slug}-optimizada.jpg`)}
              disabled={downloading}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#2A2A3A] hover:border-[#3A3A4A] hover:bg-[#1C1C26] transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-[#1C1C26] border border-[#2A2A3A] flex items-center justify-center flex-shrink-0">
                {downloading ? <Loader2 size={14} className="animate-spin text-[#8888A0]" /> : <Download size={14} className="text-[#8888A0]" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#F0F0F5] text-xs font-semibold">Descargar optimizada</p>
                <p className="text-[#555568] text-[10px]">1080×1920 · Lista para redes sociales</p>
              </div>
            </button>

            {/* Edit section toggle */}
            <button
              onClick={() => setActivePanel(activePanel === "edit" ? null : "edit")}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left"
              style={activePanel === "edit"
                ? { borderColor: color + "60", background: color + "10" }
                : { borderColor: "#2A2A3A" }}
            >
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{ background: color + "1A", border: "1px solid " + color + "40" }}
              >
                <Pencil size={14} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#F0F0F5] text-xs font-semibold">Editar Sección</p>
                <p className="text-[#555568] text-[10px]">Instrucción de edición con IA</p>
              </div>
              {activePanel === "edit"
                ? <ChevronUp size={14} className="text-[#555568] flex-shrink-0" />
                : <ChevronDown size={14} className="text-[#555568] flex-shrink-0" />}
            </button>

            {/* Edit sub-panel */}
            {activePanel === "edit" && (
              <div className="rounded-xl border border-[#2A2A3A] bg-[#1C1C26] p-4 space-y-3">
                <div>
                  <label className="block text-[10px] text-[#555568] mb-1.5">Instrucción de edición</label>
                  <textarea
                    value={editInstruction}
                    onChange={(e) => setEditInstruction(e.target.value)}
                    rows={3}
                    placeholder="Ej: Cambia el fondo a azul oscuro, hazlo más minimalista..."
                    className="w-full px-3 py-2 rounded-lg bg-[#0A0A0F] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#3A3A4A] focus:outline-none focus:border-[#7C3AED] text-xs resize-none transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-[#555568] mb-1.5">Imagen de referencia <span className="text-[#3A3A4A]">(opcional)</span></label>
                  <input
                    ref={editRefFileRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) handleEditRefFile(f); }}
                  />
                  <button
                    onClick={() => editRefFileRef.current?.click()}
                    className="w-full h-16 rounded-lg border-2 border-dashed border-[#2A2A3A] hover:border-[#7C3AED] flex items-center justify-center gap-2 text-[#555568] hover:text-[#8888A0] transition-colors overflow-hidden"
                  >
                    {editRefImage ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={editRefImage} alt="ref" className="h-full w-auto object-cover" />
                    ) : (
                      <><Upload size={14} /><span className="text-[10px]">Subir imagen de referencia</span></>
                    )}
                  </button>
                  {editRefImage && (
                    <button onClick={() => setEditRefImage(null)} className="mt-1 text-[9px] text-[#555568] hover:text-red-400 transition-colors">
                      × Quitar imagen
                    </button>
                  )}
                </div>
                <button
                  onClick={() => {
                    if (editInstruction.trim() || editRefImage) {
                      onApplyEdit(editInstruction, editRefImage);
                    }
                  }}
                  disabled={applying || (!editInstruction.trim() && !editRefImage)}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-xs font-semibold transition-colors disabled:opacity-50"
                  style={{ background: color }}
                >
                  {applying
                    ? <><Loader2 size={13} className="animate-spin" />Aplicando edición...</>
                    : <><Wand2 size={13} />Aplicar Edición</>}
                </button>
              </div>
            )}

            {/* Canva */}
            <button
              onClick={openCanva}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[rgba(139,92,246,0.35)] hover:border-[#8B5CF6] hover:bg-[rgba(139,92,246,0.07)] transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.3)] flex items-center justify-center flex-shrink-0">
                <span className="text-base">🎨</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#A78BFA] text-xs font-semibold">Editar en Canva</p>
                <p className="text-[#555568] text-[10px]">
                  {canvaCopied ? "✅ URL copiada — importa en Canva" : "Abre Canva · copia URL al portapapeles"}
                </p>
              </div>
              <ChevronRight size={14} className="text-[#8B5CF6] flex-shrink-0" />
            </button>

            {/* WhatsApp */}
            <button
              onClick={shareWhatsApp}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[rgba(37,211,102,0.3)] hover:border-[#25D366] hover:bg-[rgba(37,211,102,0.07)] transition-all text-left"
            >
              <div className="w-8 h-8 rounded-lg bg-[rgba(37,211,102,0.15)] border border-[rgba(37,211,102,0.3)] flex items-center justify-center flex-shrink-0">
                <span className="text-base">💬</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold" style={{ color: "#25D366" }}>Compartir por WhatsApp</p>
                <p className="text-[#555568] text-[10px]">Enviar a clientes o equipo</p>
              </div>
              <ChevronRight size={14} style={{ color: "#25D366" }} className="flex-shrink-0" />
            </button>

            {/* Nueva versión */}
            <button
              onClick={onNewVersion}
              disabled={applying}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-[#2A2A3A] hover:border-[#3A3A4A] hover:bg-[#1C1C26] transition-all text-left disabled:opacity-60"
            >
              <div className="w-8 h-8 rounded-lg bg-[#1C1C26] border border-[#2A2A3A] flex items-center justify-center flex-shrink-0">
                <RefreshCw size={14} className="text-[#8888A0]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#F0F0F5] text-xs font-semibold">Nueva versión</p>
                <p className="text-[#555568] text-[10px]">Regenerar con las mismas configuraciones</p>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Banner Mode: SectionRow (inline template gallery + image generation) ─────

function SectionRow({ section, config, images, isGenerating, templates, isLoadingTemplates, selectedTemplateId, productName, landingId, onSelectTemplate, onImageGenerated, onOpenGallery }: {
  section: { id: string; label: string; icon: string };
  config: BannerConfig;
  images: string[];
  isGenerating: boolean;
  templates: BannerTemplate[];
  isLoadingTemplates: boolean;
  selectedTemplateId: string | null;
  productName: string;
  landingId: string;
  onSelectTemplate: (templateId: string) => void;
  onImageGenerated: (url: string) => void;
  onOpenGallery: () => void;
}) {
  const color = SECTION_COLORS[section.id] ?? "#7C3AED";
  const [localGenerating, setLocalGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [previewIdx, setPreviewIdx] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalApplying, setModalApplying] = useState(false);
  const generating = localGenerating || isGenerating;
  const selectedTemplate = selectedTemplateId
    ? templates.find((t) => t.id === selectedTemplateId) ?? null
    : null;
  const currentImage = images[previewIdx] ?? null;

  async function handleGenerate(editOpts?: { instruction: string; refImageBase64: string | null }) {
    setLocalGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/landing/generate-banner-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionType: section.id,
          templateUrl: selectedTemplate?.imageUrl,
          productImages: config.refImages.filter((u): u is string => !!u && u.startsWith("http")),
          productName,
          productDescription: config.description,
          productBenefits: config.benefits.filter(Boolean),
          productProblems: config.problems.filter(Boolean),
          productIngredients: config.ingredients.filter(Boolean),
          productDifferentiator: config.differentiator,
          angle: config.selectedAngle,
          colors: config.colors,
          font: config.font,
          country: config.country,
          aiModel: config.aiModel,
          priceSale: config.priceSale,
          priceOriginal: config.priceOriginal,
          editInstruction: editOpts?.instruction || undefined,
          editRefImageBase64: editOpts?.refImageBase64 || undefined,
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
      setError("Error de conexion");
    } finally {
      setLocalGenerating(false);
    }
  }

  async function handleApplyEdit(instruction: string, refImageBase64: string | null) {
    setModalApplying(true);
    setModalOpen(false);
    await handleGenerate({ instruction, refImageBase64 });
    setModalApplying(false);
    setModalOpen(true);
  }

  async function handleDownload(url: string) {
    setDownloading(true);
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const objectUrl = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = objectUrl;
      a.download = section.id + "-banner.jpg";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(objectUrl);
    } catch {
      window.open(url, "_blank");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-[#2A2A3A] bg-[#13131A] overflow-hidden">
      {modalOpen && currentImage && (
        <SectionImageModal
          imageUrl={currentImage}
          sectionLabel={section.label}
          sectionIcon={section.icon}
          color={color}
          applying={modalApplying}
          onClose={() => setModalOpen(false)}
          onApplyEdit={handleApplyEdit}
          onNewVersion={() => { setModalOpen(false); handleGenerate(); }}
        />
      )}
      <div className="h-0.5 w-full" style={{ background: color }} />
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
            style={{ background: color + "1A", border: "1px solid " + color + "40" }}>
            {section.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-[#F0F0F5] font-bold text-sm truncate">{section.label}</p>
              {images.length > 0 && (
                <span className="flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full"
                  style={{ background: color + "1A", color }}>
                  <Check size={9} />{images.length}
                </span>
              )}
            </div>
            <p className="text-[10px] text-[#555568] truncate">
              {selectedTemplate ? "Plantilla: " + selectedTemplate.name : "Sin plantilla · IA genera libre"}
            </p>
          </div>
          <Link href={"/landing/" + landingId + "/studio/" + section.id}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[rgba(124,58,237,0.4)] bg-[rgba(124,58,237,0.10)] text-[#A78BFA] text-[10px] font-semibold hover:bg-[rgba(124,58,237,0.18)] transition-colors flex-shrink-0">
            <Wand2 size={11} />Studio
          </Link>
          <button onClick={() => handleGenerate()} disabled={generating}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-white text-[11px] font-semibold transition-colors disabled:opacity-60 flex-shrink-0"
            style={{ background: color }}>
            {generating ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
            {generating ? "Generando..." : images.length > 0 ? "Regenerar" : "Generar"}
          </button>
        </div>

        {/* Inline template gallery */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <p className="text-[10px] font-medium text-[#555568]">Plantilla de referencia</p>
            <button onClick={onOpenGallery}
              className="flex items-center gap-0.5 text-[10px] text-[#8888A0] hover:text-[#F0F0F5] transition-colors">
              Ver todas<ChevronRight size={11} />
            </button>
          </div>
          {isLoadingTemplates ? (
            <div className="flex items-center justify-center gap-2 py-6">
              <Loader2 size={14} className="animate-spin text-[#3A3A4A]" />
              <span className="text-[10px] text-[#3A3A4A]">Cargando plantillas...</span>
            </div>
          ) : (
            <div className="flex gap-2 overflow-x-auto pb-1.5">
              <button onClick={() => onSelectTemplate("")}
                className="flex-shrink-0 rounded-lg overflow-hidden transition-all relative"
                style={{ width: 60, border: selectedTemplateId === "" ? "2px solid " + color : "1px solid #2A2A3A" }}>
                <div className="flex flex-col items-center justify-center gap-1 bg-[#1C1C26]" style={{ aspectRatio: "9/16" }}>
                  <span className="text-base">✨</span>
                  <span className="text-[7px] text-[#555568]">IA libre</span>
                </div>
                {selectedTemplateId === "" && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: color }}>
                    <Check size={8} color="#fff" />
                  </div>
                )}
              </button>
              {templates.map((tpl) => {
                const sel = selectedTemplateId === tpl.id;
                return (
                  <button key={tpl.id} onClick={() => onSelectTemplate(tpl.id)}
                    className="flex-shrink-0 rounded-lg overflow-hidden transition-all relative"
                    style={{ width: 60, border: sel ? "2px solid " + color : "1px solid #2A2A3A" }}>
                    <div className="bg-[#0A0A0F]" style={{ aspectRatio: "9/16" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={tpl.imageUrl} alt={tpl.name} className="w-full h-full object-cover" />
                    </div>
                    {sel && (
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: color }}>
                        <Check size={8} color="#fff" />
                      </div>
                    )}
                  </button>
                );
              })}
              {templates.length === 0 && (
                <div className="flex items-center px-3 py-6 text-[10px] text-[#3A3A4A]">
                  No hay plantillas para esta seccion todavia. Usa &quot;IA libre&quot;.
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-2 px-2 py-1.5 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-1.5">
            <AlertCircle size={11} className="text-red-400 shrink-0 mt-0.5" />
            <p className="text-red-400 text-[10px] leading-tight">{error}</p>
          </div>
        )}

        {currentImage ? (
          <div className="flex gap-3">
            <button
              onClick={() => setModalOpen(true)}
              className="relative rounded-xl overflow-hidden bg-[#0A0A0F] border border-[#2A2A3A] flex-shrink-0 cursor-pointer hover:border-[#555568] transition-colors group"
              style={{ width: 132, aspectRatio: "9/16" }}
              title="Ver y editar imagen"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={currentImage} alt={section.label} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/45 transition-all">
                <Eye size={20} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
              {images.length > 1 && (
                <div className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded bg-black/60 text-white text-[9px] backdrop-blur-sm">
                  {previewIdx + 1}/{images.length}
                </div>
              )}
            </button>
            <div className="flex-1 min-w-0 flex flex-col gap-2">
              {images.length > 1 && (
                <div className="flex gap-1.5 flex-wrap">
                  {images.slice(0, 8).map((url, i) => (
                    <button key={i} onClick={() => setPreviewIdx(i)}
                      className="w-10 h-10 rounded-lg overflow-hidden border-2 transition-all"
                      style={{ borderColor: i === previewIdx ? color : "#2A2A3A" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2 mt-auto">
                <button onClick={() => handleDownload(currentImage)} disabled={downloading}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2A2A3A] text-[#8888A0] hover:text-[#F0F0F5] hover:border-[#3A3A4A] text-[10px] font-medium transition-colors disabled:opacity-60">
                  {downloading ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />}Descargar
                </button>
                <button onClick={() => handleGenerate()} disabled={generating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[10px] font-medium transition-colors disabled:opacity-60"
                  style={{ borderColor: color + "55", color, background: color + "12" }}>
                  <RefreshCw size={11} />Nueva version
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-[#2A2A3A] flex flex-col items-center justify-center gap-2 py-8">
            {generating ? (
              <>
                <Loader2 size={18} className="animate-spin" style={{ color }} />
                <span className="text-[#8888A0] text-[10px]">Generando con IA...</span>
              </>
            ) : (
              <>
                <span className="text-2xl">{section.icon}</span>
                <span className="text-[#555568] text-[10px]">
                  {selectedTemplate ? "Plantilla: " + selectedTemplate.name + " · Haz clic en Generar" : "Elige una plantilla o genera libre"}
                </span>
              </>
            )}
          </div>
        )}
      </div>
    </div>
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
  const [templates, setTemplates] = useState<Record<string, BannerTemplate[]>>({});
  const [loadingSections, setLoadingSections] = useState<Set<string>>(new Set());
  const [galleryForSection, setGalleryForSection] = useState<string | null>(null);
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  function upd(patch: Partial<BannerConfig>) { setConfig((p) => ({ ...p, ...patch })); }

  // Pre-fetch templates for all sections once on mount
  useEffect(() => {
    const sections = BANNER_SECTIONS.map((s) => s.id);
    setLoadingSections(new Set(sections));
    Promise.all(
      sections.map(async (id) => {
        const list = await fetchTemplatesForSection(id);
        setTemplates((p) => ({ ...p, [id]: list }));
        setLoadingSections((p) => { const n = new Set(p); n.delete(id); return n; });
      })
    );
  }, []);

  async function generateAllBanners(angle: string) {
    const total = BANNER_SECTIONS.length;
    setBulkProgress({ current: 0, total });
    setPendingSections(new Set(BANNER_SECTIONS.map((s) => s.id)));

    let completed = 0;
    const BATCH = 2;
    const queue = [...BANNER_SECTIONS];

    const productImages = config.refImages.filter((u): u is string => !!u && u.startsWith("http"));

    while (queue.length > 0) {
      const batch = queue.splice(0, BATCH);
      await Promise.all(batch.map(async (section) => {
        const styleId = config.sectionStyles[section.id];
        const templateForSection = styleId
          ? templates[section.id]?.find((t) => t.id === styleId)
          : null;
        try {
          const res = await fetch("/api/landing/generate-banner-image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sectionType: section.id,
              templateUrl: templateForSection?.imageUrl,
              productImages,
              productName: initialProduct,
              productDescription: config.description,
              productBenefits: config.benefits.filter(Boolean),
              productProblems: config.problems.filter(Boolean),
              productIngredients: config.ingredients.filter(Boolean),
              productDifferentiator: config.differentiator,
              angle,
              colors: config.colors,
              font: config.font,
              country: config.country,
              aiModel: config.aiModel,
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

          {/* AI Model — collapsible dropdown */}
          <div>
            <p className="text-[10px] text-[#555568] mb-1.5">Modelo de IA para imágenes</p>
            {(() => {
              const selected = AI_MODELS.find((m) => m.id === config.aiModel) ?? AI_MODELS[0];
              return (
                <div className="rounded-lg border border-[#7C3AED] overflow-hidden" style={{ background: "rgba(124,58,237,0.08)" }}>
                  {/* Selected / toggle header */}
                  <button onClick={() => setModelDropdownOpen((o) => !o)}
                    className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-all hover:bg-[rgba(124,58,237,0.06)]">
                    <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "#7C3AED" }}>
                      <Sparkles size={14} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-[#F0F0F5] truncate">{selected.label}</p>
                      <p className="text-[10px] font-mono text-[#A78BFA]">{selected.price} por imagen</p>
                    </div>
                    {modelDropdownOpen
                      ? <ChevronUp size={15} className="text-[#8888A0] flex-shrink-0" />
                      : <ChevronDown size={15} className="text-[#8888A0] flex-shrink-0" />}
                  </button>

                  {/* Expanded list */}
                  {modelDropdownOpen && (
                    <div className="border-t border-[#2A2A3A] max-h-72 overflow-y-auto">
                      {AI_MODELS.map((m) => {
                        const active = config.aiModel === m.id;
                        return (
                          <button key={m.id} onClick={() => { upd({ aiModel: m.id }); setModelDropdownOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-left transition-all hover:bg-[rgba(124,58,237,0.08)]"
                            style={{ background: active ? "rgba(124,58,237,0.15)" : "transparent", borderLeft: active ? "2px solid #7C3AED" : "2px solid transparent" }}>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium" style={{ color: active ? "#F0F0F5" : "#8888A0" }}>{m.label}</p>
                              <p className="text-[9px] text-[#555568] truncate">{m.desc}</p>
                            </div>
                            <span className="text-[9px] font-mono text-[#555568] flex-shrink-0">{m.price}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}
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

      {/* ── RIGHT PANEL: Section rows with inline template galleries ── */}
      <main className="flex-1 overflow-y-auto p-4 lg:p-5 bg-[#0A0A0F]">
        <div className="max-w-3xl mx-auto">

          {/* Header row */}
          <div className="flex items-center justify-between gap-3 mb-4">
            <div className="min-w-0">
              <h2 className="text-[#F0F0F5] font-bold text-sm">Secciones de la Landing</h2>
              <p className="text-[#555568] text-[10px] mt-0.5">
                {BANNER_SECTIONS.filter(s => (generatedImages[s.id]?.length ?? 0) > 0).length} / {BANNER_SECTIONS.length} generadas · Elige una plantilla y genera cada sección
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {config.selectedAngle && (
                <div className="max-w-[150px] px-2.5 py-1.5 rounded-lg border border-[rgba(255,107,53,0.3)] bg-[rgba(255,107,53,0.08)] hidden lg:block">
                  <p className="text-[9px] text-[#FF6B35] font-medium truncate">{config.selectedAngle}</p>
                </div>
              )}
              <button onClick={() => generateAllBanners(config.selectedAngle)} disabled={!!bulkProgress}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white text-[11px] font-semibold transition-colors disabled:opacity-60"
                style={{ background: "#FF6B35" }}>
                {bulkProgress ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                {bulkProgress ? `${bulkProgress.current}/${bulkProgress.total}` : "Generar todas"}
              </button>
            </div>
          </div>

          {/* Bulk progress */}
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

          {/* Design gallery modal (full browse) */}
          {galleryForSection && (
            <DesignGalleryModal
              initialSectionId={galleryForSection}
              templates={templates}
              loadingSections={loadingSections}
              currentTemplateId={config.sectionStyles[galleryForSection] ?? null}
              onSelect={(sectionId, templateId) => {
                upd({ sectionStyles: { ...config.sectionStyles, [sectionId]: templateId } });
              }}
              onClose={() => setGalleryForSection(null)}
            />
          )}

          {/* Section rows */}
          <div className="space-y-3">
            {BANNER_SECTIONS.map((section) => (
              <SectionRow
                key={section.id}
                section={section}
                config={config}
                images={generatedImages[section.id] ?? []}
                isGenerating={pendingSections.has(section.id)}
                templates={templates[section.id] ?? []}
                isLoadingTemplates={loadingSections.has(section.id)}
                selectedTemplateId={config.sectionStyles[section.id] ?? null}
                productName={initialProduct}
                landingId={landingId}
                onSelectTemplate={(templateId) => {
                  upd({ sectionStyles: { ...config.sectionStyles, [section.id]: templateId } });
                }}
                onImageGenerated={(url) => {
                  setGeneratedImages((p) => ({
                    ...p,
                    [section.id]: [url, ...(p[section.id] ?? [])],
                  }));
                }}
                onOpenGallery={() => setGalleryForSection(section.id)}
              />
            ))}
          </div>

          <div className="flex items-center justify-center gap-2 py-6 mt-2">
            <RefreshCw size={11} className="text-[#3A3A4A]" />
            <p className="text-[#3A3A4A] text-[10px]">
              Haz clic en <strong className="text-[#555568]">Guardar</strong> en la barra superior para conservar la configuración
            </p>
          </div>
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
  const [forgeConfig, setForgeConfig] = useState<Record<string, string> | null>(null);

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
      if (landingData.forge_config) setForgeConfig(landingData.forge_config as Record<string, string>);

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
        saving={saving} saved={saved} mode={mode} landingId={id}
        onTogglePublish={handleTogglePublish} onSave={handleSaveLanding}
      />
      {mode === "banners" ? (
        <BannerEditorContent
          config={bannerConfig} setConfig={setBannerConfig}
          generatedImages={generatedImages} setGeneratedImages={setGeneratedImages}
          product={product} landingId={id}
        />
      ) : (
        <PageEditorContent sections={sections} setSections={setSections} product={product}
          forgeConfig={forgeConfig} landingName={landingName} />
      )}
    </div>
  );
}

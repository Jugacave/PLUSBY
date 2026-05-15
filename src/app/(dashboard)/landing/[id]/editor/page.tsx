"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Sparkles,
  Eye,
  Globe,
  GripVertical,
  Pencil,
  Trash2,
  Plus,
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  Copy,
  X,
  Download,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type LandingMode = "page" | "banners";

type SectionType =
  | "hero"
  | "benefits"
  | "testimonials"
  | "urgency"
  | "cta"
  | "problem"
  | "solution"
  | "features"
  | "pricing";

interface Section {
  id: string;
  type: SectionType;
  headline: string;
  subtext: string;
  ctaText?: string;
  items?: string[];
}

const SECTION_META: Record<SectionType, { label: string; icon: string; color: string }> = {
  hero:         { label: "Hero / Portada",      icon: "🎯", color: "#FF6B35" },
  benefits:     { label: "Beneficios",          icon: "✅", color: "#4ADE80" },
  testimonials: { label: "Testimonios",         icon: "💬", color: "#F59E0B" },
  urgency:      { label: "Urgencia / Escasez",  icon: "⏰", color: "#EF4444" },
  cta:          { label: "Llamado a la Acción", icon: "🚀", color: "#FF6B35" },
  problem:      { label: "El Problema",         icon: "😣", color: "#8B5CF6" },
  solution:     { label: "La Solución",         icon: "💡", color: "#06B6D4" },
  features:     { label: "Características",     icon: "⚡", color: "#7C3AED" },
  pricing:      { label: "Precio / Oferta",     icon: "💰", color: "#4ADE80" },
};

const BANNER_DESCRIPTIONS: Record<string, string> = {
  hero:         "Capta la atención al instante",
  benefits:     "Muestra el valor real del producto",
  testimonials: "Prueba social que elimina dudas",
  urgency:      "Genera acción inmediata con escasez",
  cta:          "Cierre definitivo que convierte",
};

const BANNER_TYPES: SectionType[] = ["hero", "benefits", "testimonials", "urgency", "cta"];

const SECTION_TYPES_LIST: SectionType[] = [
  "hero", "problem", "solution", "benefits", "features",
  "testimonials", "pricing", "urgency", "cta",
];

// ─── Shared: EditPanel ───────────────────────────────────────────────────────

interface EditPanelProps {
  section: Section;
  onSave: (updated: Section) => void;
  onClose: () => void;
  product: string;
}

function EditPanel({ section, onSave, onClose, product }: EditPanelProps) {
  const [headline, setHeadline] = useState(section.headline);
  const [subtext, setSubtext] = useState(section.subtext);
  const [ctaText, setCtaText] = useState(section.ctaText ?? "");
  const [items, setItems] = useState<string[]>(section.items ?? []);
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  const meta = SECTION_META[section.type];

  async function handleGenerateWithAI() {
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
    } catch {
      // keep current edits on failure
    } finally {
      setGenerating(false);
    }
  }

  function handleCopyAll() {
    const text = [headline, subtext, ctaText, ...(items ?? [])].filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
          <button
            onClick={handleGenerateWithAI}
            disabled={generating}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] text-white font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-60"
          >
            {generating ? <><Loader2 size={14} className="animate-spin" />Generando con IA...</> : <><Sparkles size={14} />Generar con IA</>}
          </button>

          <div>
            <label className="block text-xs font-medium text-[#F0F0F5] mb-1.5">Headline</label>
            <textarea value={headline} onChange={(e) => setHeadline(e.target.value)} rows={3}
              className="w-full px-3 py-2.5 rounded-lg bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] focus:outline-none focus:border-[#7C3AED] transition-colors text-sm resize-none" />
          </div>

          <div>
            <label className="block text-xs font-medium text-[#F0F0F5] mb-1.5">Subtexto</label>
            <textarea value={subtext} onChange={(e) => setSubtext(e.target.value)} rows={4}
              className="w-full px-3 py-2.5 rounded-lg bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] focus:outline-none focus:border-[#7C3AED] transition-colors text-sm resize-none" />
          </div>

          {(section.type === "hero" || section.type === "cta" || section.type === "urgency") && (
            <div>
              <label className="block text-xs font-medium text-[#F0F0F5] mb-1.5">Texto del botón</label>
              <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] focus:outline-none focus:border-[#7C3AED] transition-colors text-sm" />
            </div>
          )}

          {(section.type === "benefits" || section.type === "features" || section.type === "testimonials") && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-[#F0F0F5]">
                  {section.type === "testimonials" ? "Testimonios" : "Puntos"}
                </label>
                <button onClick={() => setItems([...items, ""])} className="text-[10px] text-[#7C3AED] hover:text-[#A78BFA] flex items-center gap-1 transition-colors">
                  <Plus size={11} /> Añadir
                </button>
              </div>
              <div className="space-y-2">
                {items.map((item, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={item}
                      onChange={(e) => { const next = [...items]; next[i] = e.target.value; setItems(next); }}
                      className="flex-1 px-3 py-2 rounded-lg bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] focus:outline-none focus:border-[#7C3AED] transition-colors text-xs" />
                    <button onClick={() => setItems(items.filter((_, j) => j !== i))}
                      className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555568] hover:text-red-400 transition-colors">
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-[#2A2A3A] sticky bottom-0 bg-[#13131A] flex gap-2">
          <button onClick={handleCopyAll} className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#2A2A3A] text-[#8888A0] hover:text-[#F0F0F5] hover:border-[#3A3A4A] transition-colors">
            {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
          </button>
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-[#2A2A3A] text-[#8888A0] hover:text-[#F0F0F5] font-semibold text-sm transition-colors">
            Cancelar
          </button>
          <button
            onClick={() => onSave({ ...section, headline, subtext, ctaText: ctaText || undefined, items: items.length > 0 ? items : undefined })}
            className="flex-1 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white font-semibold text-sm transition-colors"
          >
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Shared: EditorTopbar ────────────────────────────────────────────────────

function EditorTopbar({
  landingName, slug, published, saving, saved, mode,
  onTogglePublish, onSave,
}: {
  landingName: string; slug: string; published: boolean; saving: boolean; saved: boolean;
  mode: LandingMode; onTogglePublish: () => Promise<void>; onSave: () => Promise<void>;
}) {
  return (
    <div className="sticky top-0 z-40 bg-[#13131A] border-b border-[#2A2A3A] px-4 py-3 flex items-center gap-3">
      <Link href="/landing" className="flex items-center gap-1.5 text-[#8888A0] hover:text-[#F0F0F5] transition-colors text-sm">
        <ArrowLeft size={16} />
        <span className="hidden sm:inline">Mis Landings</span>
      </Link>
      <div className="h-4 w-px bg-[#2A2A3A]" />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-[#F0F0F5] font-semibold text-sm truncate">{landingName || "Landing sin nombre"}</p>
          <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-md"
            style={mode === "banners"
              ? { background: "rgba(124,58,237,0.2)", color: "#A78BFA" }
              : { background: "rgba(255,107,53,0.15)", color: "#FF6B35" }}>
            {mode === "banners" ? "🖼️ Banners" : "📄 Página"}
          </span>
        </div>
        {slug && mode === "page" && (
          <p className="text-[#555568] text-xs font-mono hidden sm:block">app.plusby.co/l/{slug}</p>
        )}
      </div>
      <div className="flex items-center gap-2">
        {slug && mode === "page" && (
          <Link href={`/l/${slug}`} target="_blank"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2A2A3A] text-[#8888A0] hover:text-[#F0F0F5] hover:border-[#3A3A4A] text-xs font-medium transition-colors">
            <Eye size={13} />
            <span className="hidden sm:inline">Vista previa</span>
          </Link>
        )}
        {mode === "page" && (
          <button onClick={onTogglePublish}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              published
                ? "bg-green-400/20 text-green-400 border border-green-400/30"
                : "bg-[#1C1C26] border border-[#2A2A3A] text-[#8888A0] hover:border-[#3A3A4A] hover:text-[#F0F0F5]"
            }`}>
            <Globe size={13} />
            {published ? "Publicada" : "Publicar"}
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

// ─── Page Mode: SectionPreview ───────────────────────────────────────────────

function SectionPreview({ section }: { section: Section }) {
  const meta = SECTION_META[section.type];
  return (
    <div className="pointer-events-none select-none">
      {section.type === "hero" && (
        <div className="bg-gradient-to-br from-[#1C1C26] to-[#13131A] rounded-xl p-6 text-center border border-[#2A2A3A]">
          <h2 className="font-bold text-lg leading-tight mb-2" style={{ color: meta.color }}>{section.headline}</h2>
          <p className="text-[#8888A0] text-sm mb-4">{section.subtext}</p>
          {section.ctaText && (
            <span className="inline-block px-5 py-2.5 rounded-xl text-white font-bold text-sm" style={{ background: meta.color }}>{section.ctaText}</span>
          )}
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
              {(section.items?.length ?? 0) > 3 && (
                <li className="text-[#555568] text-xs pl-5">+{(section.items?.length ?? 0) - 3} más...</li>
              )}
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
          {section.ctaText && (
            <span className="inline-block mt-3 px-4 py-1.5 rounded-lg text-white font-semibold text-xs" style={{ background: meta.color }}>{section.ctaText}</span>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Page Mode: AddSectionModal ──────────────────────────────────────────────

function AddSectionModal({ onAdd, onClose, existing }: { onAdd: (type: SectionType) => void; onClose: () => void; existing: SectionType[] }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl w-full max-w-sm max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-[#2A2A3A]">
          <h2 className="text-[#F0F0F5] font-bold">Agregar sección</h2>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555568] hover:text-[#8888A0] hover:bg-[#2A2A3A] transition-colors">
            <X size={15} />
          </button>
        </div>
        <div className="p-4 space-y-2">
          {SECTION_TYPES_LIST.map((type) => {
            const meta = SECTION_META[type];
            const alreadyAdded = existing.includes(type);
            return (
              <button key={type} onClick={() => { onAdd(type); onClose(); }} disabled={alreadyAdded}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#2A2A3A] hover:border-[#3A3A4A] hover:bg-[#1C1C26] transition-all disabled:opacity-40 disabled:cursor-not-allowed text-left">
                <span className="text-xl">{meta.icon}</span>
                <p className="text-[#F0F0F5] text-sm font-medium flex-1">{meta.label}</p>
                {alreadyAdded && <span className="text-[#555568] text-xs">Ya agregado</span>}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Banner Mode: BannerPreview ──────────────────────────────────────────────

function BannerPreview({ section }: { section: Section }) {
  const meta = SECTION_META[section.type];
  const hasContent = section.headline || section.subtext;

  return (
    <div
      className="relative overflow-hidden rounded-xl aspect-square w-full flex flex-col justify-between p-3 bg-gradient-to-br from-[#1C1C26] to-[#0A0A0F]"
      style={{ boxShadow: `0 0 20px ${meta.color}18` }}
    >
      <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 40% 15%, ${meta.color}22, transparent 65%)` }} />

      {hasContent ? (
        <div className="relative z-10 h-full flex flex-col justify-between">
          <div className="flex items-center gap-1">
            <span className="text-xs">{meta.icon}</span>
            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: meta.color }}>{meta.label}</span>
          </div>
          <div className="my-2">
            <p className="text-white font-bold text-[11px] leading-tight line-clamp-3 mb-1">{section.headline}</p>
            {section.subtext && <p className="text-white/55 text-[9px] leading-tight line-clamp-2">{section.subtext}</p>}
            {section.items && section.items.length > 0 && (
              <div className="mt-1 space-y-0.5">
                {section.items.slice(0, 3).map((item, i) => (
                  <p key={i} className="text-[9px] leading-tight" style={{ color: `${meta.color}CC` }}>✓ {item}</p>
                ))}
              </div>
            )}
          </div>
          {section.ctaText && (
            <span className="inline-flex self-start px-2.5 py-1 rounded-full text-white text-[9px] font-bold" style={{ background: meta.color }}>
              {section.ctaText}
            </span>
          )}
        </div>
      ) : (
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
          <span className="text-2xl mb-1">{meta.icon}</span>
          <p className="text-[#3A3A4A] text-[9px]">Sin contenido</p>
        </div>
      )}
    </div>
  );
}

// ─── Banner Mode: BannerCard ─────────────────────────────────────────────────

function BannerCard({
  section, onEdit, onGenerateOne, generatingOne, generatingAll,
}: {
  section: Section; onEdit: () => void; onGenerateOne: () => void; generatingOne: boolean; generatingAll: boolean;
}) {
  const meta = SECTION_META[section.type];
  const desc = BANNER_DESCRIPTIONS[section.type] ?? "";
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    const text = [section.headline, section.subtext, section.ctaText, ...(section.items ?? [])].filter(Boolean).join("\n\n");
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const hasContent = !!(section.headline || section.subtext);

  return (
    <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-4 flex gap-4 hover:border-[#3A3A4A] transition-all">
      {/* Preview */}
      <div className="w-28 sm:w-36 shrink-0">
        <BannerPreview section={section} />
        {/* Format labels */}
        <div className="flex gap-1 mt-2 justify-center">
          {["1:1", "9:16", "16:9"].map((fmt) => (
            <span key={fmt} className="text-[8px] px-1.5 py-0.5 rounded bg-[#1C1C26] text-[#555568] font-mono">{fmt}</span>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <span className="text-sm">{meta.icon}</span>
            <div>
              <p className="text-[#F0F0F5] font-semibold text-sm leading-tight">{meta.label}</p>
              <p className="text-[#555568] text-[10px]">{desc}</p>
            </div>
          </div>

          {hasContent ? (
            <div className="mt-2 space-y-1">
              <p className="text-[#8888A0] text-xs leading-snug line-clamp-2">{section.headline}</p>
              {section.subtext && <p className="text-[#555568] text-[10px] leading-snug line-clamp-1">{section.subtext}</p>}
              {section.ctaText && (
                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md" style={{ background: `${meta.color}20`, color: meta.color }}>
                  {section.ctaText}
                </span>
              )}
            </div>
          ) : (
            <p className="mt-2 text-[#555568] text-xs italic">Sin contenido — genera con IA</p>
          )}
        </div>

        <div className="flex gap-2 mt-3 flex-wrap">
          <button onClick={onGenerateOne} disabled={generatingOne || generatingAll}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white text-xs font-semibold transition-colors disabled:opacity-50"
            style={{ background: "#7C3AED" }}>
            {generatingOne ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
            {generatingOne ? "..." : "Generar"}
          </button>
          <button onClick={onEdit} disabled={generatingAll}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#2A2A3A] hover:border-[#3A3A4A] text-[#8888A0] hover:text-[#F0F0F5] text-xs font-medium transition-colors disabled:opacity-50">
            <Pencil size={11} />
            Editar
          </button>
          {hasContent && (
            <button onClick={handleCopy}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#2A2A3A] hover:border-[#3A3A4A] text-[#8888A0] hover:text-[#F0F0F5] text-xs font-medium transition-colors">
              {copied ? <Check size={11} className="text-green-400" /> : <Copy size={11} />}
              {copied ? "Copiado" : "Copiar"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Banner Mode: BannerEditorContent ────────────────────────────────────────

function BannerEditorContent({
  sections, setSections, product,
}: {
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  product: string;
}) {
  const [generatingAll, setGeneratingAll] = useState(false);
  const [generatingIdx, setGeneratingIdx] = useState<number | null>(null);
  const [editingSection, setEditingSection] = useState<Section | null>(null);

  function getOrCreateSection(type: SectionType): Section {
    const found = sections.find((s) => s.type === type);
    if (found) return found;
    return {
      id: `banner-${type}`,
      type,
      headline: "",
      subtext: "",
      ctaText: type === "hero" || type === "urgency" || type === "cta" ? "" : undefined,
      items: type === "benefits" || type === "testimonials" ? [] : undefined,
    };
  }

  function upsertSection(updated: Section) {
    setSections((prev) => {
      const idx = prev.findIndex((s) => s.type === updated.type);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = updated;
        return next;
      }
      return [...prev, updated];
    });
  }

  async function handleGenerateAll() {
    setGeneratingAll(true);
    try {
      const res = await fetch("/api/landing/generate-banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product }),
      });
      const data = await res.json();
      if (data.ok) {
        const ts = Date.now();
        setSections([
          { id: `s-hero-${ts}`,         type: "hero",         headline: data.hero?.headline ?? "",         subtext: data.hero?.subtext ?? "",         ctaText: data.hero?.ctaText ?? "" },
          { id: `s-benefits-${ts}`,     type: "benefits",     headline: data.benefits?.headline ?? "",     subtext: data.benefits?.subtext ?? "",     items: data.benefits?.items ?? [] },
          { id: `s-testimonials-${ts}`, type: "testimonials", headline: data.testimonials?.headline ?? "", subtext: data.testimonials?.subtext ?? "", items: data.testimonials?.items ?? [] },
          { id: `s-urgency-${ts}`,      type: "urgency",      headline: data.urgency?.headline ?? "",      subtext: data.urgency?.subtext ?? "",      ctaText: data.urgency?.ctaText ?? "" },
          { id: `s-cta-${ts}`,          type: "cta",          headline: data.cta?.headline ?? "",          subtext: data.cta?.subtext ?? "",          ctaText: data.cta?.ctaText ?? "" },
        ]);
      }
    } catch {
      // fail silently
    } finally {
      setGeneratingAll(false);
    }
  }

  async function handleGenerateOne(type: SectionType, idx: number) {
    setGeneratingIdx(idx);
    try {
      const res = await fetch("/api/landing/generate-section", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sectionType: type, product }),
      });
      const data = await res.json();
      if (data.ok) {
        const existing = getOrCreateSection(type);
        upsertSection({ ...existing, headline: data.headline ?? existing.headline, subtext: data.subtext ?? existing.subtext, ctaText: data.ctaText ?? existing.ctaText, items: data.items ?? existing.items });
      }
    } catch {
      // fail silently
    } finally {
      setGeneratingIdx(null);
    }
  }

  function handleCopyAll() {
    const parts: string[] = [];
    BANNER_TYPES.forEach((type) => {
      const s = getOrCreateSection(type);
      const meta = SECTION_META[type];
      if (s.headline || s.subtext) {
        parts.push(`── ${meta.icon} ${meta.label} ──`);
        if (s.headline) parts.push(`Headline: ${s.headline}`);
        if (s.subtext) parts.push(`Subtexto: ${s.subtext}`);
        if (s.ctaText) parts.push(`CTA: ${s.ctaText}`);
        if (s.items?.length) parts.push(s.items.map((it) => `• ${it}`).join("\n"));
        parts.push("");
      }
    });
    navigator.clipboard.writeText(parts.join("\n"));
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6">
      {editingSection && (
        <EditPanel
          section={editingSection}
          product={product}
          onSave={(updated) => { upsertSection(updated); setEditingSection(null); }}
          onClose={() => setEditingSection(null)}
        />
      )}

      {/* Generate all CTA */}
      <div className="mb-5 p-4 rounded-2xl bg-gradient-to-r from-[rgba(124,58,237,0.15)] to-[rgba(91,33,182,0.06)] border border-[rgba(124,58,237,0.25)]">
        <div className="flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-[#F0F0F5] font-semibold text-sm">Genera los 5 banners de una vez</p>
            <p className="text-[#8888A0] text-xs mt-0.5">
              La IA crea contenido coherente con estructura probada para dropshipping.
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button onClick={handleCopyAll}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[rgba(124,58,237,0.3)] text-[#A78BFA] text-xs font-medium transition-colors hover:bg-[rgba(124,58,237,0.1)]">
              <Download size={13} />
              <span className="hidden sm:inline">Exportar</span>
            </button>
            <button onClick={handleGenerateAll} disabled={generatingAll}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-white font-semibold text-sm transition-colors disabled:opacity-60"
              style={{ background: "#7C3AED" }}>
              {generatingAll ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              {generatingAll ? "Generando..." : "Generar todos"}
            </button>
          </div>
        </div>
      </div>

      {/* Banner cards */}
      <div className="space-y-3">
        {BANNER_TYPES.map((type, idx) => {
          const section = getOrCreateSection(type);
          return (
            <BannerCard
              key={type}
              section={section}
              onEdit={() => setEditingSection(section)}
              onGenerateOne={() => handleGenerateOne(type, idx)}
              generatingOne={generatingIdx === idx}
              generatingAll={generatingAll}
            />
          );
        })}
      </div>

      <p className="text-center text-[#555568] text-xs mt-6">
        Haz clic en <strong className="text-[#8888A0]">Guardar</strong> en la barra superior para persistir los cambios.
      </p>
    </div>
  );
}

// ─── Page Mode: PageEditorContent ────────────────────────────────────────────

function PageEditorContent({
  sections, setSections, product,
}: {
  sections: Section[];
  setSections: React.Dispatch<React.SetStateAction<Section[]>>;
  product: string;
}) {
  const [editingSection, setEditingSection] = useState<Section | null>(null);
  const [showAddSection, setShowAddSection] = useState(false);
  const [dragOver, setDragOver] = useState<string | null>(null);

  function handleSaveSection(updated: Section) {
    setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
    setEditingSection(null);
  }

  function handleMoveUp(idx: number) {
    if (idx === 0) return;
    setSections((prev) => { const next = [...prev]; [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]]; return next; });
  }

  function handleMoveDown(idx: number) {
    setSections((prev) => { const next = [...prev]; [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]]; return next; });
  }

  function handleDelete(id: string) {
    setSections((prev) => prev.filter((s) => s.id !== id));
  }

  function handleAddSection(type: SectionType) {
    const meta = SECTION_META[type];
    setSections((prev) => [
      ...prev,
      {
        id: `s${Date.now()}`,
        type,
        headline: `${meta.icon} ${meta.label} de tu producto`,
        subtext: "Escribe aquí o usa el botón de IA para generar el contenido.",
        ctaText: type === "cta" || type === "hero" || type === "urgency" ? "Comprar ahora" : undefined,
        items: type === "benefits" || type === "features" ? ["Beneficio 1", "Beneficio 2", "Beneficio 3"] : undefined,
      },
    ]);
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-6 space-y-3">
      {editingSection && (
        <EditPanel section={editingSection} product={product} onSave={handleSaveSection} onClose={() => setEditingSection(null)} />
      )}
      {showAddSection && (
        <AddSectionModal onAdd={handleAddSection} onClose={() => setShowAddSection(false)} existing={sections.map((s) => s.type)} />
      )}

      <div className="flex items-center justify-between mb-2">
        <p className="text-[#8888A0] text-xs">
          {sections.length} sección{sections.length !== 1 ? "es" : ""} · Arrastra para reordenar
        </p>
        <button onClick={() => setShowAddSection(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-dashed border-[#3A3A4A] hover:border-[#FF6B35] text-[#555568] hover:text-[#FF6B35] text-xs font-medium transition-colors">
          <Plus size={13} />
          Agregar sección
        </button>
      </div>

      {sections.length === 0 && (
        <div className="bg-[#13131A] border-2 border-dashed border-[#2A2A3A] rounded-2xl flex flex-col items-center justify-center py-16 px-8 text-center">
          <p className="text-[#8888A0] text-sm mb-4">Esta landing no tiene secciones aún.</p>
          <button onClick={() => setShowAddSection(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white font-semibold text-sm transition-colors">
            <Plus size={14} />
            Agregar primera sección
          </button>
        </div>
      )}

      {sections.map((section, idx) => {
        const meta = SECTION_META[section.type];
        return (
          <div key={section.id}
            className={`group relative bg-[#13131A] border rounded-2xl transition-all ${dragOver === section.id ? "border-[#FF6B35]" : "border-[#2A2A3A] hover:border-[#3A3A4A]"}`}
            onDragOver={(e) => { e.preventDefault(); setDragOver(section.id); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => setDragOver(null)}>
            <div className="flex items-center gap-3 px-4 pt-4 pb-2">
              <div className="cursor-grab text-[#3A3A4A] hover:text-[#555568] transition-colors"><GripVertical size={16} /></div>
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold" style={{ background: `${meta.color}18`, color: meta.color }}>
                <span>{meta.icon}</span>{meta.label}
              </div>
              <div className="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleMoveUp(idx)} disabled={idx === 0} className="w-6 h-6 flex items-center justify-center rounded text-[#555568] hover:text-[#F0F0F5] disabled:opacity-30 transition-colors"><ChevronUp size={14} /></button>
                <button onClick={() => handleMoveDown(idx)} disabled={idx === sections.length - 1} className="w-6 h-6 flex items-center justify-center rounded text-[#555568] hover:text-[#F0F0F5] disabled:opacity-30 transition-colors"><ChevronDown size={14} /></button>
                <button onClick={() => setEditingSection(section)} className="w-6 h-6 flex items-center justify-center rounded text-[#555568] hover:text-[#A78BFA] transition-colors"><Pencil size={13} /></button>
                <button onClick={() => handleDelete(section.id)} className="w-6 h-6 flex items-center justify-center rounded text-[#555568] hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
              </div>
            </div>
            <div className="px-4 pb-4"><SectionPreview section={section} /></div>
            <button onClick={() => setEditingSection(section)} className="absolute inset-0 rounded-2xl opacity-0 focus:opacity-100" aria-label={`Editar ${meta.label}`} />
          </div>
        );
      })}

      <button onClick={() => setShowAddSection(true)}
        className="w-full py-4 rounded-2xl border-2 border-dashed border-[#2A2A3A] hover:border-[#FF6B35] text-[#555568] hover:text-[#FF6B35] text-sm font-medium transition-colors flex items-center justify-center gap-2">
        <Plus size={16} />
        Agregar nueva sección
      </button>
    </div>
  );
}

// ─── Main: LandingEditorPage ──────────────────────────────────────────────────

export default function LandingEditorPage() {
  const params = useParams();
  const id = params?.id as string;

  const [sections, setSections] = useState<Section[]>([]);
  const [published, setPublished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [landingName, setLandingName] = useState("");
  const [product, setProduct] = useState("");
  const [slug, setSlug] = useState("");
  const [mode, setMode] = useState<LandingMode>("page");

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
      setSlug(landingData.slug);
      setPublished(landingData.published);
      setMode(landingMode);

      const { data: sectionsData } = await supabase
        .from("landing_sections").select("*").eq("landing_id", id).order("position");

      if (sectionsData && sectionsData.length > 0) {
        setSections(sectionsData.map((s) => ({
          id: s.id,
          type: s.type as SectionType,
          headline: s.headline ?? "",
          subtext: s.subtext ?? "",
          ctaText: s.cta_text ?? undefined,
          items: s.items ?? undefined,
        })));
      }

      setLoading(false);
    }
    loadLanding();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function handleSaveLanding() {
    if (!id) return;
    setSaving(true);

    await supabase.from("landing_sections").delete().eq("landing_id", id);

    if (sections.length > 0) {
      await supabase.from("landing_sections").insert(
        sections.map((s, idx) => ({
          landing_id: id,
          type: s.type,
          position: idx,
          headline: s.headline,
          subtext: s.subtext,
          cta_text: s.ctaText ?? null,
          items: s.items ?? null,
        }))
      );
    }

    await supabase.from("landings").update({ updated_at: new Date().toISOString() }).eq("id", id);

    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  }

  async function handleTogglePublish() {
    if (!id) return;
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
        landingName={landingName}
        slug={slug}
        published={published}
        saving={saving}
        saved={saved}
        mode={mode}
        onTogglePublish={handleTogglePublish}
        onSave={handleSaveLanding}
      />

      {mode === "banners" ? (
        <BannerEditorContent sections={sections} setSections={setSections} product={product} />
      ) : (
        <PageEditorContent sections={sections} setSections={setSections} product={product} />
      )}
    </div>
  );
}

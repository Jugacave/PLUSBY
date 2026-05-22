"use client";

import { useRef, useState, useEffect } from "react";
import { renderBannerToPng, dataUrlToBlob, downloadBlob } from "./renderer";
import { HeroTemplateA, HeroTemplateB } from "./templates/HeroTemplate";
import { BeneficiosTemplateA, BeneficiosTemplateB } from "./templates/BeneficiosTemplate";
import { OfertaTemplateA } from "./templates/OfertaTemplate";
import { AntesDespuesTemplateA } from "./templates/AntesDespuesTemplate";
import { ComparativaTemplateA } from "./templates/ComparativaTemplate";
import { AutoridadTemplateA } from "./templates/AutoridadTemplate";
import { IngredientesTemplateA } from "./templates/IngredientesTemplate";
import { ModoUsoTemplateA } from "./templates/ModoUsoTemplate";
import { LogisticaTemplateA } from "./templates/LogisticaTemplate";
import { TestimoniosTemplateA } from "./templates/TestimoniosTemplate";
import { FaqsTemplateA } from "./templates/FaqsTemplate";
import type { BannerData } from "./types";

// ─── Template registry ────────────────────────────────────────────────────────

interface TemplateEntry {
  id: string;
  label: string;
  component: React.ComponentType<{ data: BannerData }>;
}

const TEMPLATE_REGISTRY: Record<string, TemplateEntry[]> = {
  hero:          [
    { id: "hero-a", label: "Gradiente", component: HeroTemplateA },
    { id: "hero-b", label: "Limpio",    component: HeroTemplateB },
  ],
  beneficios:    [
    { id: "ben-a", label: "Oscuro",  component: BeneficiosTemplateA },
    { id: "ben-b", label: "Claro",   component: BeneficiosTemplateB },
  ],
  oferta:        [{ id: "ofe-a", label: "Precio grande", component: OfertaTemplateA }],
  antes_despues: [{ id: "ant-a", label: "Split vertical", component: AntesDespuesTemplateA }],
  comparativa:   [{ id: "cmp-a", label: "Dos columnas", component: ComparativaTemplateA }],
  autoridad:     [{ id: "aut-a", label: "Certificado",  component: AutoridadTemplateA }],
  ingredientes:  [{ id: "ing-a", label: "Natural",      component: IngredientesTemplateA }],
  modo_uso:      [{ id: "mod-a", label: "3 pasos",      component: ModoUsoTemplateA }],
  logistica:     [{ id: "log-a", label: "3 íconos",     component: LogisticaTemplateA }],
  testimonios:   [{ id: "tes-a", label: "5 estrellas",  component: TestimoniosTemplateA }],
  faqs:          [{ id: "faq-a", label: "Q&A cards",    component: FaqsTemplateA }],
};

// ─── Main BannerCanvas component ──────────────────────────────────────────────

interface Props {
  data: BannerData;
  sectionType: string;
  onRendered?: (dataUrl: string) => void;
  showSelector?: boolean;
}

export default function BannerCanvas({ data, sectionType, onRendered, showSelector = false }: Props) {
  const templates = TEMPLATE_REGISTRY[sectionType] ?? TEMPLATE_REGISTRY.hero;
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const TemplateComponent = templates[selectedIdx]?.component ?? templates[0].component;

  // Auto-render preview at small scale whenever data changes
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (!canvasRef.current) return;
      try {
        const url = await renderBannerToPng(canvasRef.current, 0.5);
        setPreviewUrl(url);
        onRendered?.(url);
      } catch { /* ignore preview errors */ }
    }, 300);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, selectedIdx]);

  async function handleExport() {
    if (!canvasRef.current) return;
    setExporting(true);
    try {
      const dataUrl = await renderBannerToPng(canvasRef.current, 2);
      const blob = dataUrlToBlob(dataUrl);
      downloadBlob(blob, `${sectionType}-banner.png`);
      onRendered?.(dataUrl);
    } catch (e) {
      console.error("Export failed", e);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Template selector */}
      {showSelector && templates.length > 1 && (
        <div className="flex gap-2">
          {templates.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setSelectedIdx(i)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={i === selectedIdx
                ? { background: "#7C3AED", color: "#FFF" }
                : { background: "#1C1C26", color: "#8888A0", border: "1px solid #2A2A3A" }}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}

      {/* Hidden full-res render target (1080x1920) */}
      <div style={{ position: "fixed", left: "-9999px", top: 0, pointerEvents: "none", zIndex: -1 }}>
        <div ref={canvasRef}>
          <TemplateComponent data={data} />
        </div>
      </div>

      {/* Preview (scaled down) */}
      <div className="relative rounded-xl overflow-hidden bg-[#0A0A0F] border border-[#2A2A3A]" style={{ aspectRatio: "9/16" }}>
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={previewUrl} alt="Banner preview" className="w-full h-full object-contain" />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-[#7C3AED] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {/* Download overlay */}
        <div className="absolute bottom-2 right-2">
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-black/70 hover:bg-black/90 text-white text-[10px] font-medium transition-colors backdrop-blur-sm border border-white/10 disabled:opacity-60"
          >
            {exporting ? (
              <span className="w-2.5 h-2.5 border border-white border-t-transparent rounded-full animate-spin inline-block" />
            ) : "↓"} Descargar 4K
          </button>
        </div>
      </div>
    </div>
  );
}

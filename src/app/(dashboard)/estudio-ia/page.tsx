"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles, Loader2, ImageIcon, AlertCircle, Wand2 } from "lucide-react";

type AspectRatio = "1:1" | "9:16" | "16:9" | "4:5";
type Style = "fotorrealista" | "minimalista" | "lifestyle" | "estudio" | "ugc";

const STYLES: { value: Style; label: string; emoji: string }[] = [
  { value: "fotorrealista", label: "Fotorrealista", emoji: "📸" },
  { value: "lifestyle", label: "Lifestyle", emoji: "🌿" },
  { value: "estudio", label: "Estudio profesional", emoji: "💡" },
  { value: "minimalista", label: "Minimalista", emoji: "⚪" },
  { value: "ugc", label: "UGC / Casero", emoji: "📱" },
];

const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: "1:1", label: "1:1 Cuadrado" },
  { value: "9:16", label: "9:16 Story / Reel" },
  { value: "4:5", label: "4:5 Feed IG" },
  { value: "16:9", label: "16:9 Horizontal" },
];

export default function EstudioIAPage() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState<Style>("fotorrealista");
  const [aspect, setAspect] = useState<AspectRatio>("1:1");
  const [loading] = useState(false);
  const [error] = useState<string | null>(null);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-[#8888A0] hover:text-[#F0F0F5] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center">
            <Sparkles size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#F0F0F5]">Estudio IA</h1>
            <p className="text-[#8888A0] text-xs md:text-sm">
              Genera imágenes profesionales para tus productos con inteligencia artificial
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-[420px_1fr] gap-6">
        <form
          onSubmit={(e) => e.preventDefault()}
          className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-5 h-fit"
        >
          <div className="flex items-center gap-2 mb-4">
            <Wand2 size={16} className="text-[#7C3AED]" />
            <h2 className="text-[#F0F0F5] font-semibold">Generador de Imágenes</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#F0F0F5] mb-1.5">
                Descripción de la imagen *
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ej: faja reductora negra sobre mesa de mármol con luz natural, fondo limpio minimalista"
                rows={5}
                className="w-full px-3 py-2.5 rounded-lg bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#7C3AED] transition-colors text-sm resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F0F0F5] mb-2">Estilo</label>
              <div className="grid grid-cols-2 gap-2">
                {STYLES.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setStyle(s.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                      style === s.value
                        ? "bg-[rgba(124,58,237,0.15)] border-[#7C3AED] text-[#A78BFA]"
                        : "bg-[#1C1C26] border-[#2A2A3A] text-[#8888A0] hover:border-[#3A3A4A]"
                    }`}
                  >
                    <span>{s.emoji}</span>
                    <span>{s.label}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#F0F0F5] mb-2">Formato</label>
              <div className="grid grid-cols-2 gap-2">
                {ASPECT_RATIOS.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => setAspect(a.value)}
                    className={`px-3 py-2 rounded-lg border text-xs font-medium transition-all ${
                      aspect === a.value
                        ? "bg-[rgba(124,58,237,0.15)] border-[#7C3AED] text-[#A78BFA]"
                        : "bg-[#1C1C26] border-[#2A2A3A] text-[#8888A0] hover:border-[#3A3A4A]"
                    }`}
                  >
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled
            className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] text-white font-semibold text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <Sparkles size={16} />
                Generar imagen
              </>
            )}
          </button>

          <div className="mt-4 p-3 rounded-lg bg-[rgba(245,158,11,0.08)] border border-[rgba(245,158,11,0.2)] flex items-start gap-2">
            <AlertCircle size={14} className="text-[#F59E0B] mt-0.5 shrink-0" />
            <p className="text-[#F59E0B] text-xs">
              <span className="font-semibold">Próximamente:</span> integración con generador de imágenes. La UI ya está
              lista, falta conectar el backend de generación.
            </p>
          </div>

          {error && (
            <div className="mt-4 p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] flex items-start gap-2">
              <AlertCircle size={14} className="text-[#EF4444] mt-0.5 shrink-0" />
              <p className="text-[#EF4444] text-xs">{error}</p>
            </div>
          )}
        </form>

        <div className="bg-[#13131A] border-2 border-dashed border-[#2A2A3A] rounded-2xl flex flex-col items-center justify-center min-h-[500px] p-8 text-center">
          <div className="w-20 h-20 rounded-3xl bg-[rgba(124,58,237,0.1)] flex items-center justify-center mb-4">
            <ImageIcon size={36} className="text-[#7C3AED]" />
          </div>
          <h3 className="text-[#F0F0F5] font-semibold text-lg mb-1">Tu imagen aparecerá aquí</h3>
          <p className="text-[#8888A0] text-sm max-w-sm">
            Describe lo que quieres generar, elige estilo y formato, y la IA creará tu imagen lista para usar en
            anuncios o landing pages.
          </p>
        </div>
      </div>
    </div>
  );
}

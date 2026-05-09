"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Wand2,
  Type,
  ImageIcon,
  Video,
  Sparkles,
  Copy,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";

type Tab = "copys" | "imagenes" | "videos";

interface CopysData {
  titulos: string[];
  descripciones: string[];
  textos: string[];
}

export default function CreativosProPage() {
  const [tab, setTab] = useState<Tab>("copys");

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-[#8888A0] hover:text-[#F0F0F5] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center">
            <Wand2 size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#F0F0F5]">Creativos Pro</h1>
            <p className="text-[#8888A0] text-xs md:text-sm">
              Genera copys, imágenes y videos para tus campañas de Meta Ads
            </p>
          </div>
        </div>
      </div>

      <div className="flex gap-1 mb-6 bg-[#13131A] border border-[#2A2A3A] rounded-xl p-1 w-fit overflow-x-auto">
        <TabButton active={tab === "copys"} onClick={() => setTab("copys")} icon={Type} label="Copys" />
        <TabButton active={tab === "imagenes"} onClick={() => setTab("imagenes")} icon={ImageIcon} label="Imágenes" />
        <TabButton active={tab === "videos"} onClick={() => setTab("videos")} icon={Video} label="Videos" />
      </div>

      {tab === "copys" && <CopysGenerator />}
      {tab === "imagenes" && <ComingSoon icon={ImageIcon} label="Imágenes para anuncios" />}
      {tab === "videos" && <ComingSoon icon={Video} label="Videos para anuncios" />}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 md:px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
        active ? "bg-[#1C1C26] text-[#F0F0F5] shadow-sm" : "text-[#8888A0] hover:text-[#F0F0F5]"
      }`}
    >
      <Icon size={15} />
      {label}
    </button>
  );
}

function CopysGenerator() {
  const [producto, setProducto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [publicoObjetivo, setPublicoObjetivo] = useState("");
  const [beneficioPrincipal, setBeneficioPrincipal] = useState("");
  const [tono, setTono] = useState("persuasivo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<CopysData | null>(null);

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!producto.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/copys/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ producto, descripcion, publicoObjetivo, beneficioPrincipal, tono }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Error generando copys");
      } else {
        setResult(json.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error de red");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-[420px_1fr] gap-6">
      <form onSubmit={handleGenerate} className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-5 h-fit">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles size={16} className="text-[#8B5CF6]" />
          <h2 className="text-[#F0F0F5] font-semibold">Generador de Copys IA</h2>
        </div>
        <p className="text-[#8888A0] text-xs mb-5">
          Genera 5 títulos + 5 descripciones + 5 textos para Meta Ads en segundos
        </p>

        <div className="space-y-4">
          <Field label="Producto *" value={producto} onChange={setProducto} placeholder="Ej: Faja reductora postparto" />
          <Field label="Descripción del producto" value={descripcion} onChange={setDescripcion} placeholder="¿Qué hace? ¿Qué problema resuelve?" textarea />
          <Field label="Público objetivo" value={publicoObjetivo} onChange={setPublicoObjetivo} placeholder="Mujeres 25-45 años, postparto" />
          <Field label="Beneficio principal" value={beneficioPrincipal} onChange={setBeneficioPrincipal} placeholder="Reduce abdomen sin cirugía" />
          <div>
            <label className="block text-xs font-medium text-[#F0F0F5] mb-1.5">Tono</label>
            <select
              value={tono}
              onChange={(e) => setTono(e.target.value)}
              className="w-full px-3 py-2.5 rounded-lg bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] focus:outline-none focus:border-[#8B5CF6] transition-colors text-sm"
            >
              <option value="persuasivo">Persuasivo y emocional</option>
              <option value="urgente">Urgente y directo</option>
              <option value="cercano">Cercano y conversacional</option>
              <option value="profesional">Profesional y serio</option>
              <option value="provocador">Provocador y disruptivo</option>
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !producto.trim()}
          className="mt-5 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] hover:from-[#8B5CF6] hover:to-[#A78BFA] text-white font-semibold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Generando con IA...
            </>
          ) : (
            <>
              <Sparkles size={16} />
              Generar 15 copys
            </>
          )}
        </button>

        {error && (
          <div className="mt-4 p-3 rounded-lg bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.3)] flex items-start gap-2">
            <AlertCircle size={14} className="text-[#EF4444] mt-0.5 shrink-0" />
            <p className="text-[#EF4444] text-xs">{error}</p>
          </div>
        )}
      </form>

      <div className="space-y-4">
        {!result && !loading && (
          <div className="bg-[#13131A] border-2 border-dashed border-[#2A2A3A] rounded-2xl p-10 flex flex-col items-center justify-center min-h-[400px] text-center">
            <div className="w-16 h-16 rounded-2xl bg-[rgba(139,92,246,0.1)] flex items-center justify-center mb-3">
              <Wand2 size={28} className="text-[#8B5CF6]" />
            </div>
            <h3 className="text-[#F0F0F5] font-semibold mb-1">Listos para generar</h3>
            <p className="text-[#8888A0] text-sm max-w-xs">
              Completa los datos del producto y genera 15 variaciones de copys optimizados para Meta Ads
            </p>
          </div>
        )}

        {loading && (
          <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-10 flex flex-col items-center justify-center min-h-[400px]">
            <Loader2 size={32} className="text-[#8B5CF6] animate-spin mb-3" />
            <p className="text-[#F0F0F5] font-medium">Generando copys con IA...</p>
            <p className="text-[#8888A0] text-xs mt-1">Esto toma unos segundos</p>
          </div>
        )}

        {result && (
          <>
            <CopySection title="Títulos" subtitle="Máximo 40 caracteres" items={result.titulos} accent="#FF6B35" />
            <CopySection title="Descripciones" subtitle="Máximo 30 caracteres" items={result.descripciones} accent="#8B5CF6" />
            <CopySection title="Textos principales" subtitle="Máximo 125 caracteres" items={result.textos} accent="#10B981" />
          </>
        )}
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  textarea?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#F0F0F5] mb-1.5">{label}</label>
      {textarea ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#8B5CF6] transition-colors text-sm resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full px-3 py-2.5 rounded-lg bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#8B5CF6] transition-colors text-sm"
        />
      )}
    </div>
  );
}

function CopySection({
  title,
  subtitle,
  items,
  accent,
}: {
  title: string;
  subtitle: string;
  items: string[];
  accent: string;
}) {
  return (
    <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[#F0F0F5] font-semibold">{title}</h3>
          <p className="text-[#555568] text-xs">{subtitle}</p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded font-semibold" style={{ background: `${accent}1a`, color: accent }}>
          {items.length} variaciones
        </span>
      </div>
      <ul className="space-y-2">
        {items.map((item, i) => (
          <CopyItem key={i} text={item} index={i + 1} accent={accent} />
        ))}
      </ul>
    </div>
  );
}

function CopyItem({ text, index, accent }: { text: string; index: number; accent: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <li className="group flex items-start gap-3 p-3 rounded-lg bg-[#1C1C26] hover:bg-[#22222C] transition-colors">
      <span
        className="shrink-0 w-6 h-6 rounded-md text-[10px] font-bold flex items-center justify-center"
        style={{ background: `${accent}20`, color: accent }}
      >
        {index}
      </span>
      <p className="flex-1 text-[#F0F0F5] text-sm leading-relaxed">{text}</p>
      <button
        onClick={handleCopy}
        className="shrink-0 opacity-0 group-hover:opacity-100 text-[#8888A0] hover:text-[#F0F0F5] transition-all"
        aria-label="Copiar"
      >
        {copied ? <Check size={14} className="text-[#10B981]" /> : <Copy size={14} />}
      </button>
    </li>
  );
}

function ComingSoon({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
}) {
  return (
    <div className="bg-[#13131A] border-2 border-dashed border-[#2A2A3A] rounded-2xl p-12 flex flex-col items-center justify-center text-center">
      <div className="w-16 h-16 rounded-2xl bg-[rgba(139,92,246,0.1)] flex items-center justify-center mb-3">
        <Icon size={28} className="text-[#8B5CF6]" />
      </div>
      <h3 className="text-[#F0F0F5] font-semibold mb-1">{label}</h3>
      <p className="text-[#8888A0] text-sm max-w-xs">
        Próximamente — generación de {label.toLowerCase()} con IA optimizados para conversión
      </p>
    </div>
  );
}

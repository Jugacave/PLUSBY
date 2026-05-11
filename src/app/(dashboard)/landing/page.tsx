"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Globe,
  Plus,
  ExternalLink,
  Copy,
  Trash2,
  MoreVertical,
  Eye,
  EyeOff,
  Zap,
  X,
  ChevronRight,
} from "lucide-react";

interface Landing {
  id: string;
  name: string;
  product: string;
  slug: string;
  published: boolean;
  views: number;
  conversions: number;
  createdAt: string;
  template: string;
}

const DEMO_LANDINGS: Landing[] = [
  {
    id: "1",
    name: "Faja Reductora Premium",
    product: "Faja reductora modela silueta",
    slug: "faja-reductora-premium",
    published: true,
    views: 1248,
    conversions: 87,
    createdAt: "2026-04-15",
    template: "impact",
  },
  {
    id: "2",
    name: "Masajeador Anticelulitis",
    product: "Masajeador eléctrico 3 en 1",
    slug: "masajeador-anticelulitis",
    published: false,
    views: 0,
    conversions: 0,
    createdAt: "2026-04-28",
    template: "minimal",
  },
];

const TEMPLATES = [
  {
    id: "impact",
    name: "Impacto Máximo",
    description: "Hero grande, testimonios, urgencia. Alta conversión.",
    sections: ["Hero", "Beneficios", "Testimonios", "Urgencia", "CTA Final"],
    badge: "Más usado",
    badgeColor: "#FF6B35",
  },
  {
    id: "minimal",
    name: "Minimalista Clean",
    description: "Simple, elegante. Ideal para productos premium.",
    sections: ["Hero", "Características", "Precio", "CTA"],
    badge: null,
    badgeColor: null,
  },
  {
    id: "story",
    name: "Story Telling",
    description: "Narrativa emocional que genera conexión con el cliente.",
    sections: ["Problema", "Solución", "Prueba Social", "Oferta", "CTA"],
    badge: "Nuevo",
    badgeColor: "#7C3AED",
  },
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

function CreateModal({
  onClose,
  onCreate,
}: {
  onClose: () => void;
  onCreate: (l: Landing) => void;
}) {
  const [step, setStep] = useState<"template" | "details">("template");
  const [selectedTemplate, setSelectedTemplate] = useState("impact");
  const [name, setName] = useState("");
  const [product, setProduct] = useState("");

  function handleCreate() {
    if (!name.trim() || !product.trim()) return;
    onCreate({
      id: Date.now().toString(),
      name: name.trim(),
      product: product.trim(),
      slug: slugify(name.trim()),
      published: false,
      views: 0,
      conversions: 0,
      createdAt: new Date().toISOString().split("T")[0],
      template: selectedTemplate,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-[#2A2A3A]">
          <div>
            <h2 className="text-[#F0F0F5] font-bold text-lg">Nueva Landing Page</h2>
            <p className="text-[#8888A0] text-xs mt-0.5">
              {step === "template" ? "Elige una plantilla base" : "Datos del producto"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1C1C26] hover:bg-[#2A2A3A] text-[#8888A0] transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-5">
          {step === "template" ? (
            <div className="space-y-3">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTemplate(t.id)}
                  className={`w-full text-left p-4 rounded-xl border transition-all ${
                    selectedTemplate === t.id
                      ? "border-[#FF6B35] bg-[rgba(255,107,53,0.08)]"
                      : "border-[#2A2A3A] bg-[#1C1C26] hover:border-[#3A3A4A]"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#F0F0F5] font-semibold text-sm">{t.name}</span>
                        {t.badge && (
                          <span
                            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
                            style={{
                              background: `${t.badgeColor}22`,
                              color: t.badgeColor!,
                            }}
                          >
                            {t.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[#8888A0] text-xs mb-2">{t.description}</p>
                      <div className="flex flex-wrap gap-1.5">
                        {t.sections.map((s) => (
                          <span
                            key={s}
                            className="text-[10px] px-2 py-0.5 rounded-md bg-[#2A2A3A] text-[#8888A0]"
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 ${
                        selectedTemplate === t.id ? "border-[#FF6B35]" : "border-[#3A3A4A]"
                      }`}
                    >
                      {selectedTemplate === t.id && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#FF6B35]" />
                      )}
                    </div>
                  </div>
                </button>
              ))}

              <button
                onClick={() => setStep("details")}
                className="mt-2 w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white font-semibold text-sm transition-colors"
              >
                Continuar
                <ChevronRight size={16} />
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#F0F0F5] mb-1.5">
                  Nombre de la landing *
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Faja Reductora Premium"
                  autoFocus
                  className="w-full px-3 py-2.5 rounded-lg bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#F0F0F5] mb-1.5">
                  Producto *
                </label>
                <input
                  type="text"
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  placeholder="Ej: Faja modeladora con control abdominal"
                  className="w-full px-3 py-2.5 rounded-lg bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm"
                />
              </div>
              {name && (
                <div className="p-3 rounded-lg bg-[#1C1C26] border border-[#2A2A3A]">
                  <p className="text-[#8888A0] text-xs">URL de tu landing:</p>
                  <p className="text-[#F0F0F5] text-xs font-mono mt-0.5">
                    app.plusby.co/l/
                    <span className="text-[#FF6B35]">{slugify(name)}</span>
                  </p>
                </div>
              )}
              <div className="flex gap-3 pt-1">
                <button
                  onClick={() => setStep("template")}
                  className="flex-1 py-3 rounded-xl border border-[#2A2A3A] text-[#8888A0] hover:text-[#F0F0F5] hover:border-[#3A3A4A] font-semibold text-sm transition-colors"
                >
                  Atrás
                </button>
                <button
                  onClick={handleCreate}
                  disabled={!name.trim() || !product.trim()}
                  className="flex-1 py-3 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white font-semibold text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Crear Landing
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function LandingCard({
  landing,
  onDelete,
  onTogglePublish,
}: {
  landing: Landing;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const convRate =
    landing.views > 0 ? ((landing.conversions / landing.views) * 100).toFixed(1) : "0.0";

  return (
    <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-5 hover:border-[#3A3A4A] transition-all">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={`w-2 h-2 rounded-full shrink-0 ${
                landing.published ? "bg-green-400" : "bg-[#555568]"
              }`}
            />
            <h3 className="text-[#F0F0F5] font-semibold text-sm truncate">{landing.name}</h3>
          </div>
          <p className="text-[#8888A0] text-xs truncate pl-4">{landing.product}</p>
          <p className="text-[#555568] text-xs font-mono pl-4 mt-0.5">/{landing.slug}</p>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-[#555568] hover:text-[#8888A0] hover:bg-[#1C1C26] transition-colors"
          >
            <MoreVertical size={15} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-8 z-20 bg-[#1C1C26] border border-[#2A2A3A] rounded-xl shadow-xl w-44 py-1">
                <button
                  onClick={() => {
                    onTogglePublish(landing.id);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#8888A0] hover:text-[#F0F0F5] hover:bg-[#2A2A3A] transition-colors"
                >
                  {landing.published ? <EyeOff size={13} /> : <Eye size={13} />}
                  {landing.published ? "Despublicar" : "Publicar"}
                </button>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`app.plusby.co/l/${landing.slug}`);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-[#8888A0] hover:text-[#F0F0F5] hover:bg-[#2A2A3A] transition-colors"
                >
                  <Copy size={13} />
                  Copiar enlace
                </button>
                <div className="h-px bg-[#2A2A3A] my-1" />
                <button
                  onClick={() => {
                    onDelete(landing.id);
                    setMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-[#2A2A3A] transition-colors"
                >
                  <Trash2 size={13} />
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-[#1C1C26] rounded-lg p-2.5 text-center">
          <p className="text-[#F0F0F5] font-bold text-base">{landing.views.toLocaleString()}</p>
          <p className="text-[#555568] text-[10px] mt-0.5">Visitas</p>
        </div>
        <div className="bg-[#1C1C26] rounded-lg p-2.5 text-center">
          <p className="text-[#F0F0F5] font-bold text-base">{landing.conversions}</p>
          <p className="text-[#555568] text-[10px] mt-0.5">Convs.</p>
        </div>
        <div className="bg-[#1C1C26] rounded-lg p-2.5 text-center">
          <p
            className="font-bold text-base"
            style={{ color: parseFloat(convRate) >= 5 ? "#4ADE80" : "#F0F0F5" }}
          >
            {convRate}%
          </p>
          <p className="text-[#555568] text-[10px] mt-0.5">Tasa</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/landing/${landing.id}/editor`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg border border-[#2A2A3A] hover:border-[#FF6B35] hover:text-[#FF6B35] text-[#8888A0] text-xs font-medium transition-all"
        >
          Editar
        </Link>
        {landing.published && (
          <button className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-[#2A2A3A] hover:border-[#3A3A4A] text-[#8888A0] hover:text-[#F0F0F5] text-xs font-medium transition-all">
            <ExternalLink size={12} />
          </button>
        )}
      </div>
    </div>
  );
}

export default function LandingPage() {
  const [landings, setLandings] = useState<Landing[]>(DEMO_LANDINGS);
  const [showCreate, setShowCreate] = useState(false);

  function handleCreate(l: Landing) {
    setLandings((prev) => [l, ...prev]);
  }

  function handleDelete(id: string) {
    setLandings((prev) => prev.filter((l) => l.id !== id));
  }

  function handleTogglePublish(id: string) {
    setLandings((prev) =>
      prev.map((l) => (l.id === id ? { ...l, published: !l.published } : l))
    );
  }

  const totalViews = landings.reduce((s, l) => s + l.views, 0);
  const totalConversions = landings.reduce((s, l) => s + l.conversions, 0);
  const avgConvRate =
    totalViews > 0 ? ((totalConversions / totalViews) * 100).toFixed(1) : "0.0";

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {showCreate && (
        <CreateModal onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      )}

      <div className="flex items-center gap-3 mb-6">
        <Link href="/dashboard" className="text-[#8888A0] hover:text-[#F0F0F5] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#FF6B35] to-[#E05A2B] flex items-center justify-center shrink-0">
            <Globe size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl md:text-2xl font-bold text-[#F0F0F5]">Crea tu Landing</h1>
            <p className="text-[#8888A0] text-xs md:text-sm truncate">
              Constructor de landing pages optimizadas para conversión
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white font-semibold text-sm transition-colors shrink-0"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Nueva</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          {
            label: "Total Landings",
            value: landings.length,
            sub: `${landings.filter((l) => l.published).length} publicadas`,
          },
          { label: "Visitas totales", value: totalViews.toLocaleString(), sub: "últimos 30 días" },
          {
            label: "Tasa conversión",
            value: `${avgConvRate}%`,
            sub: `${totalConversions} conversiones`,
          },
        ].map((s) => (
          <div key={s.label} className="bg-[#13131A] border border-[#2A2A3A] rounded-xl p-3 md:p-4">
            <p className="text-[#8888A0] text-xs mb-1">{s.label}</p>
            <p className="text-[#F0F0F5] font-bold text-lg md:text-2xl">{s.value}</p>
            <p className="text-[#555568] text-xs mt-0.5">{s.sub}</p>
          </div>
        ))}
      </div>

      {landings.length === 0 ? (
        <div className="bg-[#13131A] border-2 border-dashed border-[#2A2A3A] rounded-2xl flex flex-col items-center justify-center py-20 px-8 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(255,107,53,0.1)] flex items-center justify-center mb-4">
            <Globe size={28} className="text-[#FF6B35]" />
          </div>
          <h3 className="text-[#F0F0F5] font-semibold mb-2">Ninguna landing todavía</h3>
          <p className="text-[#8888A0] text-sm mb-5 max-w-sm">
            Crea tu primera landing page optimizada para vender tu producto ganador.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white font-semibold text-sm transition-colors"
          >
            <Plus size={16} />
            Crear primera landing
          </button>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {landings.map((l) => (
              <LandingCard
                key={l.id}
                landing={l}
                onDelete={handleDelete}
                onTogglePublish={handleTogglePublish}
              />
            ))}
            <button
              onClick={() => setShowCreate(true)}
              className="bg-[#13131A] border-2 border-dashed border-[#2A2A3A] hover:border-[#FF6B35] rounded-2xl flex flex-col items-center justify-center min-h-[240px] p-6 transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-[#1C1C26] group-hover:bg-[rgba(255,107,53,0.1)] flex items-center justify-center mb-3 transition-colors">
                <Plus
                  size={22}
                  className="text-[#555568] group-hover:text-[#FF6B35] transition-colors"
                />
              </div>
              <p className="text-[#555568] group-hover:text-[#FF6B35] text-sm font-medium transition-colors">
                Nueva Landing
              </p>
            </button>
          </div>

          <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-[rgba(124,58,237,0.12)] to-[rgba(91,33,182,0.08)] border border-[rgba(124,58,237,0.2)]">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[rgba(124,58,237,0.2)] flex items-center justify-center shrink-0">
                <Zap size={16} className="text-[#A78BFA]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#F0F0F5] text-sm font-semibold">Genera tu copy con IA</p>
                <p className="text-[#8888A0] text-xs mt-0.5">
                  Usa Creativos Pro para generar headlines y textos listos para tu landing.
                </p>
              </div>
              <Link
                href="/creativos-pro"
                className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(124,58,237,0.2)] hover:bg-[rgba(124,58,237,0.3)] text-[#A78BFA] text-xs font-semibold transition-colors"
              >
                Ir a Creativos
                <ChevronRight size={13} />
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

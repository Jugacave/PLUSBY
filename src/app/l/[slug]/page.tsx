"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Check, Star, Shield, Truck, Clock, ChevronDown, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

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

const ACCENT = "#FF6B35";

function HeroSection({ section }: { section: Section }) {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[#13131A] to-[#0A0A0F] pt-20 pb-24 px-4">
      <div
        className="absolute inset-0 opacity-10"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${ACCENT} 0%, transparent 70%)`,
        }}
      />
      <div className="relative max-w-2xl mx-auto text-center">
        <div
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-6"
          style={{ background: `${ACCENT}20`, color: ACCENT }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ACCENT }} />
          Envío gratis hoy
        </div>
        <h1
          className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight mb-5"
          style={{ color: "#F0F0F5" }}
        >
          {section.headline}
        </h1>
        <p className="text-[#8888A0] text-base sm:text-lg leading-relaxed mb-8 max-w-xl mx-auto">
          {section.subtext}
        </p>
        {section.ctaText && (
          <button
            className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl text-white font-bold text-base shadow-lg transition-all hover:scale-105 active:scale-100"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #FF8C5A)` }}
          >
            {section.ctaText}
          </button>
        )}
        <div className="flex items-center justify-center gap-5 mt-8 text-xs text-[#555568]">
          <span className="flex items-center gap-1.5">
            <Shield size={13} className="text-green-400" /> Pago seguro
          </span>
          <span className="flex items-center gap-1.5">
            <Truck size={13} className="text-blue-400" /> Envío gratis
          </span>
          <span className="flex items-center gap-1.5">
            <Check size={13} className="text-green-400" /> 30 días garantía
          </span>
        </div>
      </div>
    </section>
  );
}

function ProblemSection({ section }: { section: Section }) {
  return (
    <section className="bg-[#0A0A0F] py-16 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <div className="w-14 h-14 rounded-2xl bg-[#1C1C26] border border-[#2A2A3A] flex items-center justify-center text-2xl mx-auto mb-6">
          😣
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#F0F0F5] mb-4 leading-tight">
          {section.headline}
        </h2>
        <p className="text-[#8888A0] text-base leading-relaxed max-w-lg mx-auto">
          {section.subtext}
        </p>
      </div>
    </section>
  );
}

function SolutionSection({ section }: { section: Section }) {
  return (
    <section className="py-16 px-4" style={{ background: `${ACCENT}08` }}>
      <div className="max-w-2xl mx-auto text-center">
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-6"
          style={{ background: `${ACCENT}20` }}
        >
          💡
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#F0F0F5] mb-4 leading-tight">
          {section.headline}
        </h2>
        <p className="text-[#8888A0] text-base leading-relaxed max-w-lg mx-auto">
          {section.subtext}
        </p>
      </div>
    </section>
  );
}

function BenefitsSection({ section }: { section: Section }) {
  return (
    <section className="bg-[#0A0A0F] py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F0F0F5] mb-3">{section.headline}</h2>
          <p className="text-[#8888A0]">{section.subtext}</p>
        </div>
        {section.items && (
          <div className="grid gap-3">
            {section.items.map((item, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-xl border border-[#2A2A3A] bg-[#13131A]"
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: `${ACCENT}20` }}
                >
                  <Check size={13} style={{ color: ACCENT }} />
                </div>
                <p className="text-[#F0F0F5] text-sm leading-relaxed">{item}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function FeaturesSection({ section }: { section: Section }) {
  return (
    <section className="bg-[#13131A] py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F0F0F5] mb-3">{section.headline}</h2>
          <p className="text-[#8888A0]">{section.subtext}</p>
        </div>
        {section.items && (
          <div className="grid sm:grid-cols-2 gap-3">
            {section.items.map((item, i) => (
              <div key={i} className="p-4 rounded-xl border border-[#2A2A3A] bg-[#1C1C26]">
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ color: ACCENT }}>⚡</span>
                  <p className="text-[#F0F0F5] text-sm font-medium">{item}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function TestimonialsSection({ section }: { section: Section }) {
  return (
    <section className="bg-[#0A0A0F] py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#F0F0F5] mb-3">{section.headline}</h2>
          <div className="flex items-center justify-center gap-0.5 mb-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
            ))}
          </div>
          <p className="text-[#8888A0]">{section.subtext}</p>
        </div>
        {section.items && (
          <div className="grid gap-4">
            {section.items.map((item, i) => {
              const colonIdx = item.indexOf(":");
              const author = colonIdx > -1 ? item.slice(0, colonIdx) : "";
              const text = colonIdx > -1 ? item.slice(colonIdx + 1).trim() : item;
              return (
                <div key={i} className="p-5 rounded-2xl border border-[#2A2A3A] bg-[#13131A]">
                  <div className="flex items-center gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={13} className="fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-[#F0F0F5] text-sm leading-relaxed mb-3">"{text}"</p>
                  {author && (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white"
                        style={{ background: `linear-gradient(135deg, ${ACCENT}, #8B5CF6)` }}
                      >
                        {author.trim()[0]}
                      </div>
                      <span className="text-[#555568] text-xs font-medium">{author.trim()}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function PricingSection({ section }: { section: Section }) {
  return (
    <section className="bg-[#13131A] py-16 px-4">
      <div className="max-w-xl mx-auto text-center">
        <div className="text-3xl mb-4">💰</div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#F0F0F5] mb-4 leading-tight">
          {section.headline}
        </h2>
        <p className="text-[#8888A0] leading-relaxed">{section.subtext}</p>
      </div>
    </section>
  );
}

function UrgencySection({ section }: { section: Section }) {
  const [count] = useState(47);

  return (
    <section className="py-16 px-4" style={{ background: `${ACCENT}10` }}>
      <div className="max-w-xl mx-auto text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <Clock size={20} style={{ color: ACCENT }} />
          <span className="text-sm font-bold" style={{ color: ACCENT }}>
            Oferta por tiempo limitado
          </span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-[#F0F0F5] mb-4 leading-tight">
          {section.headline}
        </h2>
        <p className="text-[#8888A0] text-base leading-relaxed mb-6">{section.subtext}</p>
        <div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold mb-6"
          style={{ background: `${ACCENT}20`, color: ACCENT }}
        >
          <span
            className="w-2 h-2 rounded-full animate-pulse"
            style={{ background: ACCENT }}
          />
          Solo {count} unidades disponibles
        </div>
        {section.ctaText && (
          <div className="flex justify-center">
            <button
              className="px-8 py-4 rounded-2xl text-white font-bold text-base shadow-lg transition-all hover:scale-105 active:scale-100"
              style={{ background: `linear-gradient(135deg, ${ACCENT}, #FF8C5A)` }}
            >
              {section.ctaText}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

function CtaSection({ section }: { section: Section }) {
  return (
    <section className="bg-[#0A0A0F] py-20 px-4">
      <div className="max-w-xl mx-auto text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-[#F0F0F5] mb-4 leading-tight">
          {section.headline}
        </h2>
        <p className="text-[#8888A0] text-base leading-relaxed mb-8">{section.subtext}</p>
        {section.ctaText && (
          <button
            className="inline-flex items-center gap-2 px-10 py-4 rounded-2xl text-white font-bold text-lg shadow-xl transition-all hover:scale-105 active:scale-100"
            style={{ background: `linear-gradient(135deg, ${ACCENT}, #FF8C5A)` }}
          >
            {section.ctaText}
          </button>
        )}
        <div className="flex items-center justify-center gap-6 mt-8 text-xs text-[#555568]">
          <span className="flex items-center gap-1.5">
            <Shield size={13} className="text-green-400" /> Compra segura
          </span>
          <span className="flex items-center gap-1.5">
            <Check size={13} className="text-green-400" /> Garantía 30 días
          </span>
        </div>
      </div>
    </section>
  );
}

function renderSection(section: Section) {
  switch (section.type) {
    case "hero":
      return <HeroSection key={section.id} section={section} />;
    case "problem":
      return <ProblemSection key={section.id} section={section} />;
    case "solution":
      return <SolutionSection key={section.id} section={section} />;
    case "benefits":
      return <BenefitsSection key={section.id} section={section} />;
    case "features":
      return <FeaturesSection key={section.id} section={section} />;
    case "testimonials":
      return <TestimonialsSection key={section.id} section={section} />;
    case "pricing":
      return <PricingSection key={section.id} section={section} />;
    case "urgency":
      return <UrgencySection key={section.id} section={section} />;
    case "cta":
      return <CtaSection key={section.id} section={section} />;
    default:
      return null;
  }
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[#2A2A3A]">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between gap-4 py-4 text-left text-[#F0F0F5] font-medium text-sm hover:text-white transition-colors"
      >
        {q}
        <ChevronDown
          size={16}
          className={`shrink-0 text-[#555568] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <p className="text-[#8888A0] text-sm pb-4 leading-relaxed">{a}</p>}
    </div>
  );
}

const GENERIC_FAQS = [
  {
    q: "¿Cuánto tiempo tarda en llegar mi pedido?",
    a: "Enviamos en 24-48 horas hábiles. Recibirás un número de seguimiento por WhatsApp o correo.",
  },
  {
    q: "¿Cómo puedo hacer seguimiento a mi pedido?",
    a: "Una vez despachado tu pedido, recibirás un número de rastreo por correo o WhatsApp.",
  },
  {
    q: "¿Tienen garantía de devolución?",
    a: "Sí, tienes 30 días para devolverlo sin preguntas. Te reembolsamos el 100% del precio.",
  },
  {
    q: "¿Cómo puedo contactarlos?",
    a: "Puedes escribirnos por WhatsApp o correo electrónico. Respondemos en menos de 24 horas.",
  },
];

export default function PublicLandingPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [sections, setSections] = useState<Section[]>([]);
  const [landingName, setLandingName] = useState("");
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    if (!slug) return;
    async function fetchLanding() {
      const { data: landingData } = await supabase
        .from("landings")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .single();

      if (!landingData) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      setLandingName(landingData.name);

      const { data: sectionsData } = await supabase
        .from("landing_sections")
        .select("*")
        .eq("landing_id", landingData.id)
        .order("position");

      if (sectionsData) {
        setSections(
          sectionsData.map((s) => ({
            id: s.id,
            type: s.type as SectionType,
            headline: s.headline ?? "",
            subtext: s.subtext ?? "",
            ctaText: s.cta_text ?? undefined,
            items: s.items ?? undefined,
          }))
        );
      }

      setLoading(false);
    }
    fetchLanding();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#555568]" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex flex-col items-center justify-center px-4 text-center">
        <div className="text-4xl mb-4">🔍</div>
        <h1 className="text-[#F0F0F5] text-2xl font-bold mb-2">Página no encontrada</h1>
        <p className="text-[#8888A0] text-sm">
          Esta landing page no existe o no está publicada.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F]">
      {sections.map((section) => renderSection(section))}

      <section className="bg-[#13131A] py-16 px-4">
        <div className="max-w-xl mx-auto">
          <h2 className="text-xl font-bold text-[#F0F0F5] mb-6 text-center">
            Preguntas frecuentes
          </h2>
          {GENERIC_FAQS.map((faq, i) => (
            <FaqItem key={i} q={faq.q} a={faq.a} />
          ))}
        </div>
      </section>

      <footer className="bg-[#0A0A0F] border-t border-[#2A2A3A] py-8 px-4 text-center">
        <p className="text-[#555568] text-xs">
          {landingName && (
            <span className="text-[#8888A0] font-medium mr-1">{landingName} · </span>
          )}
          Creado con{" "}
          <span className="font-semibold" style={{ color: ACCENT }}>
            Plusby
          </span>{" "}
          · Página de ventas profesional
        </p>
      </footer>
    </div>
  );
}

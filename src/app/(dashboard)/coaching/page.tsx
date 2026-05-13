"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, Users, Star, Clock, Calendar, CheckCircle,
  ChevronRight, X, MessageCircle, Video, Zap, Target,
  TrendingUp, Shield, Crown, DollarSign, Check,
} from "lucide-react";

interface Coach {
  id: string;
  name: string;
  avatar: string;
  color: string;
  role: string;
  bio: string;
  specialties: string[];
  rating: number;
  sessions: number;
  languages: string[];
  nextSlots: string[];
  packages: Package[];
}

interface Package {
  id: string;
  name: string;
  sessions: number;
  price: number;
  features: string[];
  popular?: boolean;
}

const COACHES: Coach[] = [
  {
    id: "co1",
    name: "Karen Ortiz",
    avatar: "KO",
    color: "#8B5CF6",
    role: "Mentora Senior · Dropi Expert",
    bio: "6 años vendiendo con dropshipping. Manejo más de $20M COP/mes en ventas propias y he mentoreado a +200 dropshippers en Colombia. Especialista en Dropi, confirmación de pedidos y primeras ventas.",
    specialties: ["Dropi", "Primeras ventas", "Confirmación", "Productos ganadores"],
    rating: 5.0,
    sessions: 312,
    languages: ["Español"],
    nextSlots: ["Hoy 3:00 PM", "Mañana 10:00 AM", "Mañana 4:00 PM", "Jue 9:00 AM"],
    packages: [
      {
        id: "p1", name: "Sesión individual", sessions: 1, price: 80000,
        features: ["60 minutos 1:1 por video", "Grabación de la sesión", "Resumen por escrito", "Chat 48h post-sesión"],
      },
      {
        id: "p2", name: "Pack Arranque", sessions: 4, price: 280000, popular: true,
        features: ["4 sesiones de 60 min", "Grabaciones incluidas", "Plan de acción personalizado", "Chat ilimitado 30 días", "Revisión de tus anuncios"],
      },
      {
        id: "p3", name: "Mentoría Mensual", sessions: 8, price: 520000,
        features: ["8 sesiones de 60 min", "Acceso prioritario a Karen", "Revisión semanal de métricas", "Chat ilimitado todo el mes", "Acceso a recursos exclusivos"],
      },
    ],
  },
  {
    id: "co2",
    name: "Diana Ríos",
    avatar: "DR",
    color: "#EC4899",
    role: "Especialista Meta Ads",
    bio: "Experta en publicidad digital para dropshipping. ROAS promedio de mis clientes: 3.2x. Domino la creación de creativos UGC, copy persuasivo y estructuras de campaña que convierten en el mercado colombiano.",
    specialties: ["Meta Ads", "Creativos UGC", "Copywriting", "Escala de campañas"],
    rating: 4.9,
    sessions: 187,
    languages: ["Español"],
    nextSlots: ["Mañana 2:00 PM", "Jue 11:00 AM", "Vie 3:00 PM"],
    packages: [
      {
        id: "p4", name: "Sesión individual", sessions: 1, price: 90000,
        features: ["60 minutos 1:1 por video", "Auditoría de tu cuenta ads", "Grabación incluida", "Feedback de tus creativos"],
      },
      {
        id: "p5", name: "Pack Ads Pro", sessions: 4, price: 300000, popular: true,
        features: ["4 sesiones de 60 min", "Setup completo de campañas", "Revisión de creativos incluida", "Chat 30 días", "Plantillas de copy"],
      },
    ],
  },
  {
    id: "co3",
    name: "Julián García",
    avatar: "JG",
    color: "#FF6B35",
    role: "Fundador · Estrategia General",
    bio: "Fundador de Plusby. Llevo 8 años en el ecosistema de dropshipping latinoamericano. Si quieres entender el negocio completo — desde el producto hasta la operación — esta es tu sesión.",
    specialties: ["Estrategia", "Modelo de negocio", "Selección de nicho", "Automatización"],
    rating: 4.9,
    sessions: 95,
    languages: ["Español", "Inglés"],
    nextSlots: ["Vie 10:00 AM", "Sáb 9:00 AM"],
    packages: [
      {
        id: "p6", name: "Sesión estratégica", sessions: 1, price: 120000,
        features: ["90 minutos 1:1", "Diagnóstico de tu negocio", "Hoja de ruta personalizada", "Grabación incluida"],
      },
      {
        id: "p7", name: "Acompañamiento VIP", sessions: 4, price: 400000, popular: true,
        features: ["4 sesiones de 90 min", "Acceso directo a Julián", "Revisión mensual de KPIs", "Comunidad VIP privada"],
      },
    ],
  },
];

function BookingModal({ coach, onClose }: { coach: Coach; onClose: () => void }) {
  const [step, setStep] = useState<"package" | "slot" | "confirm" | "done">("package");
  const [selectedPkg, setSelectedPkg] = useState<Package | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  function formatCOP(n: number) {
    return "$" + n.toLocaleString("es-CO");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl w-full max-w-lg max-h-[calc(100vh-2rem)] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-[#13131A] z-10 flex items-center justify-between p-5 border-b border-[#2A2A3A]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-black text-sm" style={{ background: coach.color }}>
              {coach.avatar}
            </div>
            <div>
              <p className="text-[#F0F0F5] font-bold text-sm">{coach.name}</p>
              <p className="text-[#555568] text-[10px]">Reserva de sesión</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg text-[#555568] hover:text-[#F0F0F5] hover:bg-[#2A2A3A] transition-colors">
            <X size={15} />
          </button>
        </div>

        <div className="p-5">
          {step === "done" ? (
            <div className="flex flex-col items-center gap-4 py-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center">
                <CheckCircle size={32} className="text-green-400" />
              </div>
              <p className="text-[#F0F0F5] font-black text-lg">¡Sesión reservada!</p>
              <p className="text-[#8888A0] text-sm">
                Tu sesión con <strong className="text-[#F0F0F5]">{coach.name}</strong> está confirmada para{" "}
                <strong className="text-[#F0F0F5]">{selectedSlot}</strong>.
                Recibirás el link de video por email.
              </p>
              <button onClick={onClose} className="mt-2 px-6 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white text-sm font-bold transition-colors">
                Cerrar
              </button>
            </div>
          ) : step === "confirm" ? (
            <div className="space-y-4">
              <p className="text-[#F0F0F5] font-bold">Confirma tu reserva</p>
              <div className="bg-[#1C1C26] border border-[#2A2A3A] rounded-xl p-4 space-y-2 text-sm">
                <div className="flex justify-between"><span className="text-[#555568]">Coach</span><span className="text-[#F0F0F5] font-semibold">{coach.name}</span></div>
                <div className="flex justify-between"><span className="text-[#555568]">Paquete</span><span className="text-[#F0F0F5] font-semibold">{selectedPkg?.name}</span></div>
                <div className="flex justify-between"><span className="text-[#555568]">Sesiones</span><span className="text-[#F0F0F5] font-semibold">{selectedPkg?.sessions}</span></div>
                <div className="flex justify-between"><span className="text-[#555568]">Primera sesión</span><span className="text-[#F0F0F5] font-semibold">{selectedSlot}</span></div>
                <div className="border-t border-[#2A2A3A] pt-2 flex justify-between">
                  <span className="text-[#F0F0F5] font-bold">Total</span>
                  <span className="font-black" style={{ color: coach.color }}>{formatCOP(selectedPkg?.price ?? 0)}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep("slot")} className="flex-1 py-2.5 rounded-xl border border-[#2A2A3A] text-[#8888A0] text-sm font-semibold">Atrás</button>
                <button onClick={() => setStep("done")} className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold transition-colors" style={{ background: coach.color }}>
                  Confirmar reserva
                </button>
              </div>
            </div>
          ) : step === "slot" ? (
            <div className="space-y-4">
              <p className="text-[#F0F0F5] font-bold">Elige un horario</p>
              <div className="grid grid-cols-2 gap-2">
                {coach.nextSlots.map(slot => (
                  <button key={slot} onClick={() => setSelectedSlot(slot)}
                    className={`p-3 rounded-xl border text-sm font-semibold transition-all ${
                      selectedSlot === slot
                        ? "border-current"
                        : "border-[#2A2A3A] bg-[#1C1C26] text-[#8888A0] hover:text-[#F0F0F5] hover:border-[#3A3A4A]"
                    }`}
                    style={selectedSlot === slot ? { background: coach.color + "15", color: coach.color, borderColor: coach.color + "40" } : {}}
                  >
                    <Calendar size={13} className="mx-auto mb-1" />
                    {slot}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button onClick={() => setStep("package")} className="flex-1 py-2.5 rounded-xl border border-[#2A2A3A] text-[#8888A0] text-sm font-semibold">Atrás</button>
                <button onClick={() => { if (selectedSlot) setStep("confirm"); }} disabled={!selectedSlot}
                  className="flex-1 py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  style={{ background: coach.color }}>
                  Continuar
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-[#F0F0F5] font-bold">Elige un paquete</p>
              {coach.packages.map(pkg => (
                <div key={pkg.id} onClick={() => setSelectedPkg(pkg)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all relative ${
                    selectedPkg?.id === pkg.id
                      ? "border-current"
                      : "border-[#2A2A3A] bg-[#1C1C26] hover:border-[#3A3A4A]"
                  }`}
                  style={selectedPkg?.id === pkg.id ? { background: coach.color + "0D", borderColor: coach.color + "40" } : {}}
                >
                  {pkg.popular && (
                    <span className="absolute -top-2.5 left-4 text-[9px] font-black px-2 py-0.5 rounded-full text-white" style={{ background: coach.color }}>
                      MÁS POPULAR
                    </span>
                  )}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-[#F0F0F5] font-bold text-sm">{pkg.name}</p>
                      <p className="text-[#555568] text-xs">{pkg.sessions} {pkg.sessions === 1 ? "sesión" : "sesiones"}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-black text-lg" style={{ color: coach.color }}>{formatCOP(pkg.price)}</p>
                      {pkg.sessions > 1 && (
                        <p className="text-[#555568] text-[10px]">{formatCOP(Math.round(pkg.price / pkg.sessions))} c/u</p>
                      )}
                    </div>
                  </div>
                  <ul className="space-y-1">
                    {pkg.features.map(f => (
                      <li key={f} className="flex items-center gap-1.5 text-[#8888A0] text-xs">
                        <Check size={10} className="text-green-400 shrink-0" /> {f}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
              <button onClick={() => { if (selectedPkg) setStep("slot"); }} disabled={!selectedPkg}
                className="w-full py-2.5 rounded-xl text-white text-sm font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                style={{ background: coach.color }}>
                Continuar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function CoachingPage() {
  const [booking, setBooking] = useState<Coach | null>(null);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {booking && <BookingModal coach={booking} onClose={() => setBooking(null)} />}

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-[#8888A0] hover:text-[#F0F0F5] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] flex items-center justify-center shrink-0">
          <Users size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#F0F0F5]">Coaching 1:1</h1>
          <p className="text-[#8888A0] text-xs md:text-sm">Sesiones personalizadas con los mejores mentores de Plusby</p>
        </div>
      </div>

      {/* Value props */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-10">
        {[
          { icon: Video, label: "Sesión por video", desc: "Zoom o Meet", color: "#0EA5E9" },
          { icon: Target, label: "100% personalizado", desc: "A tu caso real", color: "#8B5CF6" },
          { icon: Zap, label: "Resultados rápidos", desc: "Desde la 1ª sesión", color: "#FF6B35" },
          { icon: Shield, label: "Garantía de calidad", desc: "O reembolso", color: "#10B981" },
        ].map(v => {
          const Icon = v.icon;
          return (
            <div key={v.label} className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-4 text-center">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center mx-auto mb-2" style={{ background: v.color + "15" }}>
                <Icon size={15} style={{ color: v.color }} />
              </div>
              <p className="text-[#F0F0F5] text-xs font-bold">{v.label}</p>
              <p className="text-[#555568] text-[10px] mt-0.5">{v.desc}</p>
            </div>
          );
        })}
      </div>

      {/* Coach cards */}
      <div className="space-y-6">
        {COACHES.map(coach => (
          <div key={coach.id} className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-5">
                {/* Avatar + info */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="relative shrink-0">
                    <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg"
                      style={{ background: `linear-gradient(135deg, ${coach.color}, ${coach.color}99)` }}>
                      {coach.avatar}
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-[#13131A] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      <p className="text-[#F0F0F5] font-black text-base">{coach.name}</p>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: coach.color + "15", color: coach.color }}>
                        {coach.sessions}+ sesiones
                      </span>
                    </div>
                    <p className="text-[#8888A0] text-xs mb-2">{coach.role}</p>
                    <div className="flex items-center gap-1 mb-3">
                      {[1,2,3,4,5].map(i => (
                        <Star key={i} size={11} className={i <= Math.round(coach.rating) ? "text-[#F59E0B] fill-[#F59E0B]" : "text-[#2A2A3A]"} />
                      ))}
                      <span className="text-[#F59E0B] text-xs font-bold ml-1">{coach.rating}</span>
                    </div>
                    <p className="text-[#8888A0] text-xs leading-relaxed">{coach.bio}</p>
                  </div>
                </div>

                {/* CTA */}
                <div className="sm:w-48 shrink-0 space-y-3">
                  <div>
                    <p className="text-[#555568] text-[10px] font-bold uppercase tracking-wider mb-1.5">Próximos espacios</p>
                    <div className="space-y-1">
                      {coach.nextSlots.slice(0, 3).map(slot => (
                        <div key={slot} className="flex items-center gap-1.5 text-[10px] text-[#8888A0]">
                          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                          {slot}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="text-[#555568] text-[10px] mb-1">Desde</p>
                    <p className="font-black text-xl" style={{ color: coach.color }}>
                      ${Math.min(...coach.packages.map(p => p.price)).toLocaleString("es-CO")}
                    </p>
                  </div>
                  <button
                    onClick={() => setBooking(coach)}
                    className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-white text-sm font-bold transition-colors"
                    style={{ background: coach.color }}
                  >
                    <Calendar size={13} /> Reservar sesión
                  </button>
                </div>
              </div>

              {/* Specialties */}
              <div className="mt-4 pt-4 border-t border-[#2A2A3A] flex flex-wrap gap-1.5">
                {coach.specialties.map(s => (
                  <span key={s} className="px-2.5 py-1 rounded-lg bg-[#1C1C26] border border-[#2A2A3A] text-[#555568] text-[10px]">{s}</span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* FAQ / guarantee */}
      <div className="mt-10 bg-gradient-to-r from-[rgba(14,165,233,0.06)] to-transparent border border-[rgba(14,165,233,0.12)] rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-[rgba(14,165,233,0.1)] flex items-center justify-center shrink-0">
            <Shield size={15} className="text-[#0EA5E9]" />
          </div>
          <div>
            <p className="text-[#F0F0F5] font-bold">Garantía Plusby</p>
            <p className="text-[#8888A0] text-sm mt-1 leading-relaxed">
              Si después de tu primera sesión no estás satisfecho, te devolvemos el 100% de tu dinero sin preguntas. Nuestro único objetivo es que crezcas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft, CheckCircle, XCircle, Clock, Phone, PhoneCall,
  PhoneMissed, User, Package, DollarSign, ChevronDown, ChevronUp,
  Search, Filter, RefreshCw, Clipboard, Check, AlertCircle,
  TrendingUp, MessageSquare, ChevronRight, Copy, Zap,
} from "lucide-react";

type OrderStatus = "pendiente" | "confirmada" | "rechazada" | "sin_respuesta";

interface Order {
  id: string;
  num: string;
  customer: string;
  phone: string;
  city: string;
  product: string;
  qty: number;
  total: number;
  created: string; // ISO string
  status: OrderStatus;
  attempts: number;
  notes: string;
}

const INITIAL_ORDERS: Order[] = [
  { id: "o1", num: "#45821", customer: "Ana Gómez", phone: "+57 310 234 5678", city: "Bogotá", product: "Crema Reafirmante Pro X", qty: 2, total: 139000, created: new Date(Date.now() - 14 * 60000).toISOString(), status: "pendiente", attempts: 0, notes: "" },
  { id: "o2", num: "#45820", customer: "Carlos Pérez", phone: "+57 315 876 4321", city: "Medellín", product: "Serum Vitamina C", qty: 1, total: 85000, created: new Date(Date.now() - 42 * 60000).toISOString(), status: "pendiente", attempts: 1, notes: "Llamó al celular 1 vez, no contestó" },
  { id: "o3", num: "#45819", customer: "Luisa Vargas", phone: "+57 320 111 9999", city: "Cali", product: "Kit Cuidado Facial 3-en-1", qty: 1, total: 98000, created: new Date(Date.now() - 78 * 60000).toISOString(), status: "sin_respuesta", attempts: 2, notes: "" },
  { id: "o4", num: "#45818", customer: "Diego Mora", phone: "+57 304 555 2222", city: "Barranquilla", product: "Auriculares BT Pro", qty: 3, total: 210000, created: new Date(Date.now() - 120 * 60000).toISOString(), status: "confirmada", attempts: 1, notes: "" },
  { id: "o5", num: "#45817", customer: "María Torres", phone: "+57 312 888 0000", city: "Cartagena", product: "Crema Reafirmante Pro X", qty: 1, total: 75000, created: new Date(Date.now() - 180 * 60000).toISOString(), status: "rechazada", attempts: 2, notes: "Dice que no hizo el pedido" },
  { id: "o6", num: "#45816", customer: "Pedro Salcedo", phone: "+57 316 777 3333", city: "Pereira", product: "Serum Vitamina C", qty: 2, total: 170000, created: new Date(Date.now() - 200 * 60000).toISOString(), status: "confirmada", attempts: 1, notes: "" },
  { id: "o7", num: "#45815", customer: "Sandra Ríos", phone: "+57 300 444 6666", city: "Manizales", product: "Kit Cuidado Facial 3-en-1", qty: 1, total: 98000, created: new Date(Date.now() - 250 * 60000).toISOString(), status: "pendiente", attempts: 0, notes: "" },
  { id: "o8", num: "#45814", customer: "Fabio Castro", phone: "+57 318 222 8888", city: "Bucaramanga", product: "Auriculares BT Pro", qty: 1, total: 70000, created: new Date(Date.now() - 320 * 60000).toISOString(), status: "sin_respuesta", attempts: 3, notes: "" },
];

const SCRIPTS = [
  {
    id: "sc1",
    title: "Script de confirmación básica",
    tag: "Básico",
    tagColor: "#10B981",
    text: `Buenas [días/tardes], ¿me comunico con [NOMBRE DEL CLIENTE]?

Soy [TU NOMBRE] de [TU TIENDA]. Te llamo para confirmar tu pedido de [PRODUCTO] por $[VALOR] con envío a [CIUDAD].

¿Puedes confirmarme que sí realizaste este pedido?
— Si dice SÍ: "Perfecto, tu pedido quedará procesado hoy y te llegará en [DÍAS] días hábiles. ¿Tienes alguna pregunta?"
— Si dice NO: "Entendido, procederé a cancelar el pedido sin ningún cobro. Lamentamos cualquier inconveniente."

¡Que tengas un excelente día!`,
  },
  {
    id: "sc2",
    title: "Script para 2+ intentos fallidos",
    tag: "Recuperación",
    tagColor: "#F59E0B",
    text: `Hola [NOMBRE], ¿cómo estás?

Te escribo / llamo nuevamente porque tenemos pendiente confirmar tu pedido de [PRODUCTO]. Hemos intentado contactarte [N] veces y queremos asegurarnos de procesarlo a tiempo.

Si confirmas ahora, tu pedido sale hoy mismo. De lo contrario, lamentablemente deberemos cancelarlo para liberar el stock.

¿Deseas confirmar tu pedido?`,
  },
  {
    id: "sc3",
    title: "Script de objeción de precio",
    tag: "Objeción",
    tagColor: "#8B5CF6",
    text: `Entiendo tu preocupación con el precio.

[PRODUCTO] tiene un valor de $[VALOR] que incluye el envío a tu puerta en [CIUDAD]. Comparado con comprarlo en tienda física, te ahorras tiempo, gasolina y además tienes garantía de devolución si no estás satisfecho/a.

¿Te parece que procedemos con el pedido?`,
  },
];

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; bg: string; icon: React.ElementType }> = {
  pendiente: { label: "Pendiente", color: "#F59E0B", bg: "rgba(245,158,11,0.1)", icon: Clock },
  confirmada: { label: "Confirmada", color: "#10B981", bg: "rgba(16,185,129,0.1)", icon: CheckCircle },
  rechazada: { label: "Rechazada", color: "#EF4444", bg: "rgba(239,68,68,0.1)", icon: XCircle },
  sin_respuesta: { label: "Sin respuesta", color: "#8B5CF6", bg: "rgba(139,92,246,0.1)", icon: PhoneMissed },
};

function timeAgo(iso: string): string {
  const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

function formatCOP(n: number): string {
  return "$" + n.toLocaleString("es-CO");
}

function ScriptCard({ script }: { script: typeof SCRIPTS[0] }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(script.text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-[#1C1C26] transition-colors"
      >
        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: script.tagColor + "15" }}>
          <MessageSquare size={14} style={{ color: script.tagColor }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[#F0F0F5] text-sm font-semibold">{script.title}</p>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: script.tagColor + "15", color: script.tagColor }}>
            {script.tag}
          </span>
        </div>
        {open ? <ChevronUp size={15} className="text-[#555568]" /> : <ChevronDown size={15} className="text-[#555568]" />}
      </button>
      {open && (
        <div className="border-t border-[#2A2A3A]">
          <pre className="p-4 text-[#8888A0] text-xs leading-relaxed whitespace-pre-wrap font-sans">{script.text}</pre>
          <div className="px-4 pb-4">
            <button
              onClick={copy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#2A2A3A] text-xs text-[#8888A0] hover:text-[#F0F0F5] hover:bg-[#1C1C26] transition-colors"
            >
              {copied ? <><Check size={11} className="text-green-400" /> Copiado</> : <><Copy size={11} /> Copiar script</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderRow({
  order,
  onConfirm,
  onReject,
  onRetry,
}: {
  order: Order;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
  onRetry: (id: string) => void;
}) {
  const cfg = STATUS_CONFIG[order.status];
  const StatusIcon = cfg.icon;
  const [expand, setExpand] = useState(false);

  return (
    <div className="bg-[#13131A] border border-[#2A2A3A] rounded-xl overflow-hidden hover:border-[#3A3A4A] transition-all">
      <div className="flex items-center gap-3 p-4 cursor-pointer" onClick={() => setExpand(!expand)}>
        {/* Status icon */}
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.bg }}>
          <StatusIcon size={16} style={{ color: cfg.color }} />
        </div>

        {/* Order info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[#F0F0F5] font-bold text-sm">{order.customer}</span>
            <span className="text-[#555568] text-xs">{order.num}</span>
            {order.attempts > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] text-[#8B5CF6] bg-[rgba(139,92,246,0.1)] px-1.5 py-0.5 rounded-full">
                <PhoneCall size={8} /> {order.attempts}
              </span>
            )}
          </div>
          <p className="text-[#555568] text-xs truncate">{order.product} · {order.city}</p>
        </div>

        {/* Value + time */}
        <div className="text-right shrink-0">
          <p className="text-[#F0F0F5] font-bold text-sm">{formatCOP(order.total)}</p>
          <p className="text-[#555568] text-[10px]">hace {timeAgo(order.created)}</p>
        </div>

        <ChevronDown size={14} className={`text-[#555568] shrink-0 transition-transform ${expand ? "rotate-180" : ""}`} />
      </div>

      {expand && (
        <div className="border-t border-[#2A2A3A] p-4 space-y-3">
          {/* Details grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            {[
              { label: "Teléfono", value: order.phone, icon: Phone },
              { label: "Ciudad", value: order.city, icon: User },
              { label: "Cantidad", value: `${order.qty} und`, icon: Package },
              { label: "Total", value: formatCOP(order.total), icon: DollarSign },
            ].map(item => {
              const Icon = item.icon;
              return (
                <div key={item.label} className="flex items-center gap-1.5 bg-[#1C1C26] rounded-lg p-2">
                  <Icon size={11} className="text-[#555568]" />
                  <div>
                    <p className="text-[#555568] text-[9px]">{item.label}</p>
                    <p className="text-[#F0F0F5] font-medium">{item.value}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {order.notes && (
            <p className="text-[#555568] text-xs bg-[#1C1C26] rounded-lg px-3 py-2 border border-[#2A2A3A]">
              {order.notes}
            </p>
          )}

          {/* Actions */}
          {order.status === "pendiente" || order.status === "sin_respuesta" ? (
            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={`tel:${order.phone.replace(/\s/g, "")}`}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] text-green-400 text-xs font-semibold hover:bg-[rgba(16,185,129,0.15)] transition-colors"
              >
                <Phone size={11} /> Llamar
              </a>
              <button
                onClick={() => onConfirm(order.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.2)] text-green-400 text-xs font-semibold hover:bg-[rgba(16,185,129,0.15)] transition-colors"
              >
                <CheckCircle size={11} /> Confirmar
              </button>
              <button
                onClick={() => onReject(order.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold hover:bg-red-500/15 transition-colors"
              >
                <XCircle size={11} /> Rechazar
              </button>
              <button
                onClick={() => onRetry(order.id)}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1C1C26] border border-[#2A2A3A] text-[#8888A0] text-xs font-semibold hover:text-[#F0F0F5] transition-colors"
              >
                <RefreshCw size={11} /> Sin respuesta
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold" style={{ background: cfg.bg, color: cfg.color }}>
                <StatusIcon size={11} /> {cfg.label}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

type Tab = "pendiente" | "sin_respuesta" | "confirmada" | "rechazada" | "todos";

export default function ConfirmaPage() {
  const [orders, setOrders] = useState<Order[]>(INITIAL_ORDERS);
  const [tab, setTab] = useState<Tab>("pendiente");
  const [search, setSearch] = useState("");

  function confirm(id: string) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "confirmada" } : o));
  }
  function reject(id: string) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "rechazada" } : o));
  }
  function retry(id: string) {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status: "sin_respuesta", attempts: o.attempts + 1 } : o));
  }

  const filtered = orders.filter(o => {
    const matchTab = tab === "todos" || o.status === tab;
    const matchSearch = !search ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.num.toLowerCase().includes(search.toLowerCase()) ||
      o.product.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const counts = {
    pendiente: orders.filter(o => o.status === "pendiente").length,
    sin_respuesta: orders.filter(o => o.status === "sin_respuesta").length,
    confirmada: orders.filter(o => o.status === "confirmada").length,
    rechazada: orders.filter(o => o.status === "rechazada").length,
    todos: orders.length,
  };

  const confirmRate = orders.length > 0
    ? Math.round((counts.confirmada / orders.length) * 100)
    : 0;

  const pendingRevenue = orders
    .filter(o => o.status === "pendiente" || o.status === "sin_respuesta")
    .reduce((s, o) => s + o.total, 0);

  const tabs: { id: Tab; label: string; color: string }[] = [
    { id: "pendiente", label: "Pendientes", color: "#F59E0B" },
    { id: "sin_respuesta", label: "Sin respuesta", color: "#8B5CF6" },
    { id: "confirmada", label: "Confirmadas", color: "#10B981" },
    { id: "rechazada", label: "Rechazadas", color: "#EF4444" },
    { id: "todos", label: "Todos", color: "#8888A0" },
  ];

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-[#8888A0] hover:text-[#F0F0F5] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shrink-0">
          <PhoneCall size={18} className="text-white" />
        </div>
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#F0F0F5]">Confirma</h1>
          <p className="text-[#8888A0] text-xs md:text-sm">Gestión de confirmación de pedidos</p>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {[
          {
            label: "Por confirmar",
            value: counts.pendiente + counts.sin_respuesta,
            sub: `${formatCOP(pendingRevenue)} en riesgo`,
            icon: AlertCircle,
            color: "#F59E0B",
            gradient: "from-[rgba(245,158,11,0.15)] to-[rgba(245,158,11,0.03)]",
          },
          {
            label: "Confirmadas hoy",
            value: counts.confirmada,
            sub: `de ${orders.length} órdenes`,
            icon: CheckCircle,
            color: "#10B981",
            gradient: "from-[rgba(16,185,129,0.15)] to-[rgba(16,185,129,0.03)]",
          },
          {
            label: "Tasa confirmación",
            value: `${confirmRate}%`,
            sub: confirmRate >= 70 ? "Excelente desempeño" : "Sigue llamando",
            icon: TrendingUp,
            color: "#8B5CF6",
            gradient: "from-[rgba(139,92,246,0.15)] to-[rgba(139,92,246,0.03)]",
          },
          {
            label: "Rechazadas",
            value: counts.rechazada,
            sub: `${orders.length > 0 ? Math.round((counts.rechazada / orders.length) * 100) : 0}% del total`,
            icon: XCircle,
            color: "#EF4444",
            gradient: "from-[rgba(239,68,68,0.12)] to-[rgba(239,68,68,0.03)]",
          },
        ].map(kpi => {
          const Icon = kpi.icon;
          return (
            <div key={kpi.label} className={`bg-gradient-to-br ${kpi.gradient} border border-[#2A2A3A] rounded-2xl p-4`}>
              <div className="flex items-center justify-between mb-2">
                <p className="text-[#8888A0] text-xs font-medium">{kpi.label}</p>
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: kpi.color + "20" }}>
                  <Icon size={13} style={{ color: kpi.color }} />
                </div>
              </div>
              <p className="text-[#F0F0F5] text-2xl font-black">{kpi.value}</p>
              <p className="text-[#555568] text-[11px] mt-0.5">{kpi.sub}</p>
            </div>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Orders list — takes 2 cols */}
        <div className="lg:col-span-2 space-y-4">
          {/* Search + tabs */}
          <div className="space-y-3">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#555568]" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Buscar cliente, pedido o producto..."
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#13131A] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#10B981] transition-colors text-sm"
              />
            </div>

            <div className="flex gap-1.5 flex-wrap">
              {tabs.map(t => (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                    tab === t.id
                      ? "border-current"
                      : "border-[#2A2A3A] bg-[#13131A] text-[#555568] hover:text-[#8888A0]"
                  }`}
                  style={tab === t.id ? {
                    background: t.color + "15",
                    color: t.color,
                    borderColor: t.color + "40",
                  } : {}}
                >
                  {t.label}
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold" style={{
                    background: tab === t.id ? t.color + "20" : "#2A2A3A",
                    color: tab === t.id ? t.color : "#555568",
                  }}>
                    {counts[t.id]}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Orders */}
          <div className="space-y-2">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[#1C1C26] flex items-center justify-center">
                  <CheckCircle size={24} className="text-[#2A2A3A]" />
                </div>
                <p className="text-[#F0F0F5] font-semibold text-sm">Sin órdenes aquí</p>
                <p className="text-[#555568] text-xs">No hay pedidos en esta categoría.</p>
              </div>
            ) : (
              filtered.map(o => (
                <OrderRow key={o.id} order={o} onConfirm={confirm} onReject={reject} onRetry={retry} />
              ))
            )}
          </div>
        </div>

        {/* Scripts sidebar */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[rgba(139,92,246,0.1)] flex items-center justify-center">
              <Clipboard size={13} className="text-[#8B5CF6]" />
            </div>
            <p className="text-[#F0F0F5] font-bold text-sm">Scripts de llamada</p>
          </div>

          <div className="space-y-2">
            {SCRIPTS.map(s => (
              <ScriptCard key={s.id} script={s} />
            ))}
          </div>

          {/* Tips card */}
          <div className="bg-gradient-to-br from-[rgba(16,185,129,0.08)] to-transparent border border-[rgba(16,185,129,0.15)] rounded-2xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Zap size={13} className="text-[#10B981]" />
              <p className="text-[#F0F0F5] text-sm font-bold">Tips de confirmación</p>
            </div>
            <ul className="space-y-2 text-xs text-[#8888A0]">
              {[
                "Llama entre 9am–12pm y 4pm–7pm para mayor contacto.",
                "Intenta máximo 3 veces antes de marcar como sin respuesta.",
                "Confirma siempre el nombre, producto y dirección.",
                "Si rechaza, pregunta el motivo para mejorar tu copy.",
                "Una tasa >70% es excelente para Colombia.",
              ].map((tip, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="w-4 h-4 rounded-full bg-[rgba(16,185,129,0.1)] text-green-400 text-[9px] font-black flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

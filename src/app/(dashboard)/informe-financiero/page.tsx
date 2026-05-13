"use client";

import { useState, useMemo, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft, TrendingUp, TrendingDown, DollarSign, Megaphone,
  Plus, Minus, Upload, Download, Calendar, Target, BarChart3,
  ShoppingCart, Truck, RotateCcw, Clock, CheckCircle2, XCircle,
  AlertCircle, ChevronDown, Zap, Eye, MousePointer, Activity,
  Wallet, Receipt, Save, RefreshCw,
} from "lucide-react";

// ─── helpers ────────────────────────────────────────────────────────────────

function cop(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0,
  }).format(n);
}
function pct(a: number, b: number) {
  return b ? ((a / b) * 100).toFixed(1) : "0.0";
}
function num(n: number) {
  return new Intl.NumberFormat("es-CO").format(n);
}

// ─── types ───────────────────────────────────────────────────────────────────

type Period = "hoy" | "7d" | "30d" | "mes" | "anterior" | "custom";

interface Expense { id: string; label: string; amount: number; type: "gasto" | "ingreso" }

// ─── mock data ───────────────────────────────────────────────────────────────

const MOCK = {
  orders:     { total: 148, confirmed: 112, cancelled: 21, pending: 15 },
  delivery:   { delivered: 98, returns: 8, pending: 14, rate: 87.5 },
  wallet: {
    recaudo: 14200000, costoMercancia: 3850000,
    costoEnvio: 980000, envioDevolucion: 240000,
  },
  meta: {
    spend: 1850000, impressions: 48200, clicksTotal: 3140,
    clicksOut: 1870, cpc: 989, ctr: 6.51, roas: 4.2, cpa: 89000,
  },
  extras: [
    { id: "e1", label: "Herramienta de diseño", amount: 120000, type: "gasto" as const },
    { id: "e2", label: "Reembolso cliente VIP", amount: 50000, type: "gasto" as const },
  ],
};

// ─── sub-components ──────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, icon: Icon, gradient, delta, deltaLabel,
}: {
  label: string; value: string; sub?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  gradient: string; delta?: number; deltaLabel?: string;
}) {
  const up = delta !== undefined && delta >= 0;
  return (
    <div className={`relative overflow-hidden rounded-2xl p-5 border ${gradient}`}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-semibold opacity-80 uppercase tracking-wider">{label}</p>
        <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center">
          <Icon size={15} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-black text-white mb-1">{value}</p>
      {sub && <p className="text-white/60 text-xs">{sub}</p>}
      {delta !== undefined && (
        <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${up ? "text-green-300" : "text-red-300"}`}>
          {up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
          {up ? "+" : ""}{delta}% {deltaLabel ?? "vs período anterior"}
        </div>
      )}
      <div className="absolute -bottom-4 -right-4 w-24 h-24 rounded-full bg-white/5" />
      <div className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full bg-white/5" />
    </div>
  );
}

function SectionHeader({ title, icon: Icon, color, badge }: {
  title: string; icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>;
  color: string; badge?: string | number;
}) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: color + "20" }}>
        <Icon size={15} style={{ color }} />
      </div>
      <h2 className="text-[#F0F0F5] font-bold">{title}</h2>
      {badge !== undefined && (
        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ background: color + "20", color }}>
          {badge}
        </span>
      )}
    </div>
  );
}

function MetricPill({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="bg-[#1C1C26] border border-[#2A2A3A] rounded-xl p-3.5">
      <p className="text-[#555568] text-[10px] font-semibold uppercase tracking-wider mb-1.5">{label}</p>
      <p className="font-bold text-lg" style={{ color: color ?? "#F0F0F5" }}>{value}</p>
    </div>
  );
}

// ─── main page ────────────────────────────────────────────────────────────────

export default function InformeFinancieroPage() {
  const [period, setPeriod] = useState<Period>("7d");
  const [fromDate, setFromDate] = useState("2026-05-06");
  const [toDate, setToDate] = useState("2026-05-12");
  const [expenses, setExpenses] = useState<Expense[]>(MOCK.extras);
  const [newExpenseLabel, setNewExpenseLabel] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseType, setNewExpenseType] = useState<"gasto" | "ingreso">("gasto");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [csvUploaded, setCsvUploaded] = useState(false);
  const [showMetaOnly, setShowMetaOnly] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // derived financials
  const { recaudo, costoMercancia, costoEnvio, envioDevolucion } = MOCK.wallet;
  const utilidadBruta = recaudo - costoMercancia - costoEnvio - envioDevolucion;
  const totalExtras = expenses.reduce((s, e) =>
    e.type === "gasto" ? s - e.amount : s + e.amount, 0);
  const utilidadFinal = utilidadBruta - MOCK.meta.spend + totalExtras;

  const PERIODS: { id: Period; label: string }[] = [
    { id: "hoy", label: "Hoy" },
    { id: "7d", label: "Últimos 7 días" },
    { id: "30d", label: "Últimos 30 días" },
    { id: "mes", label: "Este mes" },
    { id: "anterior", label: "Mes pasado" },
    { id: "custom", label: "Personalizado" },
  ];

  function addExpense() {
    if (!newExpenseLabel || !newExpenseAmount) return;
    setExpenses(prev => [...prev, {
      id: Date.now().toString(),
      label: newExpenseLabel,
      amount: parseInt(newExpenseAmount),
      type: newExpenseType,
    }]);
    setNewExpenseLabel(""); setNewExpenseAmount(""); setShowAddExpense(false);
  }

  const deliveryRate = pct(MOCK.delivery.delivered, MOCK.orders.confirmed);

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-[#8888A0] hover:text-[#F0F0F5] transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shrink-0">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#F0F0F5]">Informe Financiero</h1>
            <p className="text-[#8888A0] text-xs">Analiza la rentabilidad de tu operación de dropshipping</p>
          </div>
        </div>
        <div className="sm:ml-auto flex items-center gap-2">
          <label
            htmlFor="csv-upload"
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#2A2A3A] bg-[#13131A] hover:border-[#3A3A4A] text-[#8888A0] hover:text-[#F0F0F5] text-xs font-semibold cursor-pointer transition-colors"
          >
            <Upload size={13} />
            Subir Excel / CSV de Dropi
          </label>
          <input
            id="csv-upload" ref={fileRef} type="file" accept=".csv,.xlsx,.xls"
            className="hidden"
            onChange={() => setCsvUploaded(true)}
          />
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#10B981]/10 border border-[#10B981]/20 hover:bg-[#10B981]/20 text-[#10B981] text-xs font-semibold transition-colors">
            <Save size={13} />
            Guardar informe
          </button>
        </div>
      </div>

      {/* Period tabs */}
      <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-4">
        <div className="flex flex-wrap gap-2 mb-3">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                period === p.id
                  ? "bg-[#10B981] text-white shadow-lg shadow-[#10B981]/20"
                  : "bg-[#1C1C26] text-[#8888A0] hover:text-[#F0F0F5] border border-[#2A2A3A]"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
        {period === "custom" && (
          <div className="flex items-center gap-3 pt-2 border-t border-[#2A2A3A]">
            <div className="flex items-center gap-2">
              <Calendar size={13} className="text-[#555568]" />
              <span className="text-[#555568] text-xs">Desde</span>
              <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)}
                className="bg-[#1C1C26] border border-[#2A2A3A] rounded-lg px-2 py-1.5 text-[#F0F0F5] text-xs focus:outline-none focus:border-[#10B981]" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[#555568] text-xs">Hasta</span>
              <input type="date" value={toDate} onChange={e => setToDate(e.target.value)}
                className="bg-[#1C1C26] border border-[#2A2A3A] rounded-lg px-2 py-1.5 text-[#F0F0F5] text-xs focus:outline-none focus:border-[#10B981]" />
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#10B981] text-white text-xs font-semibold">
              <RefreshCw size={11} /> Aplicar
            </button>
          </div>
        )}
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <KpiCard
          label="Utilidad bruta Dropi"
          value={cop(utilidadBruta)}
          sub="Ventas − costos mercancía y envío"
          icon={Wallet}
          gradient="bg-gradient-to-br from-[#10B981] to-[#059669] border-[#10B981]/30"
          delta={12.4}
        />
        <KpiCard
          label="Publicidad Meta"
          value={cop(MOCK.meta.spend)}
          sub={`ROAS ${MOCK.meta.roas}x`}
          icon={Megaphone}
          gradient="bg-gradient-to-br from-[#0082FB] to-[#0057D9] border-[#0082FB]/30"
          delta={-8.1}
        />
        <KpiCard
          label="Otros gastos / ingresos"
          value={cop(Math.abs(totalExtras))}
          sub={totalExtras >= 0 ? "Ingreso neto" : "Gasto neto"}
          icon={Receipt}
          gradient="bg-gradient-to-br from-[#F59E0B] to-[#D97706] border-[#F59E0B]/30"
        />
        <KpiCard
          label="Utilidad final"
          value={cop(utilidadFinal)}
          sub="Ganancia − publicidad − gastos + ingresos"
          icon={TrendingUp}
          gradient={`bg-gradient-to-br ${utilidadFinal >= 0 ? "from-[#8B5CF6] to-[#6D28D9] border-[#8B5CF6]/30" : "from-[#EF4444] to-[#B91C1C] border-red-500/30"}`}
          delta={utilidadFinal >= 0 ? 18.7 : -5.2}
        />
      </div>

      {/* Orders + Delivery */}
      <div className="grid lg:grid-cols-2 gap-4">

        {/* Estado de órdenes */}
        <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-5">
          <SectionHeader title="Estado de Órdenes Dropi" icon={ShoppingCart} color="#FF6B35" badge={MOCK.orders.total} />
          <div className="grid grid-cols-3 gap-3 mb-4">
            {[
              { label: "Confirmadas", value: MOCK.orders.confirmed, color: "#4ADE80", icon: CheckCircle2, pct: pct(MOCK.orders.confirmed, MOCK.orders.total) },
              { label: "Canceladas", value: MOCK.orders.cancelled, color: "#EF4444", icon: XCircle, pct: pct(MOCK.orders.cancelled, MOCK.orders.total) },
              { label: "Pendientes", value: MOCK.orders.pending, color: "#F59E0B", icon: Clock, pct: pct(MOCK.orders.pending, MOCK.orders.total) },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="bg-[#1C1C26] border border-[#2A2A3A] rounded-xl p-3 text-center">
                  <Icon size={16} className="mx-auto mb-2" style={{ color: s.color }} />
                  <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[#555568] text-[10px] mt-0.5">{s.label}</p>
                  <p className="text-[10px] font-semibold mt-1" style={{ color: s.color }}>{s.pct}%</p>
                </div>
              );
            })}
          </div>
          {/* Mini bar */}
          <div className="h-2 rounded-full overflow-hidden flex gap-0.5">
            <div className="h-full rounded-l-full bg-green-400 transition-all" style={{ width: `${pct(MOCK.orders.confirmed, MOCK.orders.total)}%` }} />
            <div className="h-full bg-yellow-400 transition-all" style={{ width: `${pct(MOCK.orders.pending, MOCK.orders.total)}%` }} />
            <div className="h-full rounded-r-full bg-red-400 transition-all" style={{ width: `${pct(MOCK.orders.cancelled, MOCK.orders.total)}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-[#555568] mt-1.5">
            <span className="text-green-400">Confirmadas {pct(MOCK.orders.confirmed, MOCK.orders.total)}%</span>
            <span className="text-yellow-400">Pendientes {pct(MOCK.orders.pending, MOCK.orders.total)}%</span>
            <span className="text-red-400">Canceladas {pct(MOCK.orders.cancelled, MOCK.orders.total)}%</span>
          </div>
        </div>

        {/* Métricas de entrega */}
        <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-5">
          <SectionHeader title="Métricas de Entrega Dropi" icon={Truck} color="#0EA5E9" />
          <div className="grid grid-cols-2 gap-3 mb-4">
            {[
              { label: "Entregados", value: MOCK.delivery.delivered, color: "#4ADE80", icon: CheckCircle2 },
              { label: "Devoluciones", value: MOCK.delivery.returns, color: "#EF4444", icon: RotateCcw },
              { label: "Pendientes", value: MOCK.delivery.pending, color: "#F59E0B", icon: Clock },
              { label: "Tasa de entrega", value: `${deliveryRate}%`, color: "#0EA5E9", icon: Activity },
            ].map((m) => {
              const Icon = m.icon;
              return (
                <div key={m.label} className="bg-[#1C1C26] border border-[#2A2A3A] rounded-xl p-3 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: m.color + "15" }}>
                    <Icon size={16} style={{ color: m.color }} />
                  </div>
                  <div>
                    <p className="text-xl font-black" style={{ color: m.color }}>{m.value}</p>
                    <p className="text-[#555568] text-[10px]">{m.label}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-[#2A2A3A]">
            <div className="text-xs">
              <span className="text-[#555568]">Fletes entregados: </span>
              <span className="text-[#F0F0F5] font-semibold">{cop(MOCK.wallet.costoEnvio)}</span>
            </div>
            <div className="text-xs">
              <span className="text-[#555568]">Fletes devoluciones: </span>
              <span className="text-red-400 font-semibold">{cop(MOCK.wallet.envioDevolucion)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Upload CSV + Wallet breakdown */}
      <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl overflow-hidden">
        <div className="p-5 border-b border-[#2A2A3A]">
          <SectionHeader title="Desglose de Cartera Dropi" icon={Wallet} color="#10B981" badge={csvUploaded ? "Real" : "Estimado"} />
          {!csvUploaded && (
            <div className="mb-4 p-3 rounded-xl bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.2)] flex items-start gap-2">
              <AlertCircle size={13} className="text-yellow-400 shrink-0 mt-0.5" />
              <div>
                <p className="text-yellow-400 text-xs font-semibold">Datos estimados</p>
                <p className="text-[#8888A0] text-xs mt-0.5">
                  Sube el Excel del Historial de Cartera de Dropi para ver transacciones reales y desglose detallado.
                </p>
                <ol className="text-[#555568] text-[10px] mt-2 space-y-0.5 list-decimal list-inside">
                  <li>Abre el Historial de Cartera en Dropi</li>
                  <li>Selecciona el rango de fechas</li>
                  <li>Haz clic en "Descargar en Excel"</li>
                  <li>Sube el archivo aquí</li>
                </ol>
              </div>
              <label htmlFor="csv-upload2" className="shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#10B981] hover:bg-[#059669] text-white text-xs font-semibold cursor-pointer transition-colors ml-auto">
                <Upload size={12} /> Subir Excel / CSV
              </label>
              <input id="csv-upload2" type="file" accept=".csv,.xlsx,.xls" className="hidden" onChange={() => setCsvUploaded(true)} />
            </div>
          )}
        </div>
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#2A2A3A]">
              <th className="px-5 py-3 text-left text-[10px] font-semibold text-[#555568] uppercase tracking-wider">Concepto</th>
              <th className="px-5 py-3 text-right text-[10px] font-semibold text-[#555568] uppercase tracking-wider">Registros</th>
              <th className="px-5 py-3 text-right text-[10px] font-semibold text-[#555568] uppercase tracking-wider">Total</th>
            </tr>
          </thead>
          <tbody>
            {[
              { label: "Recaudo de venta", records: MOCK.orders.confirmed, value: recaudo, color: "#4ADE80", sign: "+" },
              { label: "Costo de mercancía", records: MOCK.orders.confirmed, value: -costoMercancia, color: "#EF4444", sign: "-" },
              { label: "Costo de envío", records: MOCK.orders.confirmed, value: -costoEnvio, color: "#EF4444", sign: "-" },
              { label: "Envío devoluciones", records: MOCK.delivery.returns, value: -envioDevolucion, color: "#EF4444", sign: "-" },
            ].map((row) => (
              <tr key={row.label} className="border-b border-[#1C1C26] hover:bg-[#1C1C26] transition-colors">
                <td className="px-5 py-3.5 text-[#8888A0] text-sm">{row.label}</td>
                <td className="px-5 py-3.5 text-right text-[#555568] text-sm">{row.records}</td>
                <td className="px-5 py-3.5 text-right text-sm font-semibold" style={{ color: row.color }}>
                  {row.sign} {cop(Math.abs(row.value))}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="bg-[rgba(16,185,129,0.05)] border-t-2 border-[#10B981]/30">
              <td className="px-5 py-4 text-[#F0F0F5] font-bold" colSpan={2}>UTILIDAD BRUTA ESTIMADA</td>
              <td className="px-5 py-4 text-right font-black text-lg text-[#10B981]">
                {cop(utilidadBruta)}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Meta Ads */}
      <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-5">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <SectionHeader title="Inversión Publicitaria Meta" icon={Megaphone} color="#0082FB" badge={cop(MOCK.meta.spend)} />
          </div>
          <label className="flex items-center gap-2 text-xs text-[#8888A0] cursor-pointer select-none">
            <input type="checkbox" checked={showMetaOnly} onChange={e => setShowMetaOnly(e.target.checked)}
              className="rounded" />
            Solo campañas vinculadas a productos
          </label>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <MetricPill label="Gasto total" value={cop(MOCK.meta.spend)} color="#0082FB" />
          <MetricPill label="CPA (por venta)" value={cop(MOCK.meta.cpa)} />
          <MetricPill label="ROAS" value={`${MOCK.meta.roas}x`} color={MOCK.meta.roas >= 3 ? "#4ADE80" : "#F59E0B"} />
          <MetricPill label="CTR promedio" value={`${MOCK.meta.ctr}%`} color={MOCK.meta.ctr >= 5 ? "#4ADE80" : "#F59E0B"} />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricPill label="Impresiones" value={num(MOCK.meta.impressions)} />
          <MetricPill label="Clicks totales" value={num(MOCK.meta.clicksTotal)} />
          <MetricPill label="Clicks saliente" value={num(MOCK.meta.clicksOut)} />
          <MetricPill label="CPC saliente" value={cop(MOCK.meta.cpc)} />
        </div>

        {/* ROAS bar */}
        <div className="mt-4 pt-4 border-t border-[#2A2A3A]">
          <div className="flex justify-between text-xs mb-2">
            <span className="text-[#8888A0]">ROAS actual</span>
            <span className="font-bold text-[#4ADE80]">{MOCK.meta.roas}x <span className="text-[#555568] font-normal">(objetivo: 3x)</span></span>
          </div>
          <div className="h-2 bg-[#2A2A3A] rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-[#0082FB] to-[#4ADE80]" style={{ width: `${Math.min((MOCK.meta.roas / 6) * 100, 100)}%` }} />
          </div>
          <div className="flex justify-between text-[10px] text-[#555568] mt-1">
            <span>0x</span><span>3x (objetivo)</span><span>6x</span>
          </div>
        </div>
      </div>

      {/* Otros gastos */}
      <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4">
          <SectionHeader title="Otros Gastos e Ingresos" icon={Receipt} color="#8B5CF6" />
          <button
            onClick={() => setShowAddExpense(!showAddExpense)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[rgba(139,92,246,0.1)] border border-[rgba(139,92,246,0.2)] hover:bg-[rgba(139,92,246,0.2)] text-[#8B5CF6] text-xs font-semibold transition-colors"
          >
            <Plus size={12} /> Agregar
          </button>
        </div>

        {showAddExpense && (
          <div className="mb-4 p-4 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] flex flex-wrap gap-3 items-end">
            <div className="flex-1 min-w-32">
              <label className="block text-[10px] text-[#555568] mb-1">Concepto</label>
              <input value={newExpenseLabel} onChange={e => setNewExpenseLabel(e.target.value)}
                placeholder="Ej: Herramienta de diseño"
                className="w-full px-3 py-2 rounded-lg bg-[#13131A] border border-[#2A2A3A] text-[#F0F0F5] text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors" />
            </div>
            <div className="w-36">
              <label className="block text-[10px] text-[#555568] mb-1">Monto (COP)</label>
              <input value={newExpenseAmount} onChange={e => setNewExpenseAmount(e.target.value)}
                type="number" placeholder="120000"
                className="w-full px-3 py-2 rounded-lg bg-[#13131A] border border-[#2A2A3A] text-[#F0F0F5] text-sm focus:outline-none focus:border-[#8B5CF6] transition-colors" />
            </div>
            <div className="w-28">
              <label className="block text-[10px] text-[#555568] mb-1">Tipo</label>
              <select value={newExpenseType} onChange={e => setNewExpenseType(e.target.value as "gasto" | "ingreso")}
                className="w-full px-3 py-2 rounded-lg bg-[#13131A] border border-[#2A2A3A] text-[#F0F0F5] text-sm focus:outline-none focus:border-[#8B5CF6]">
                <option value="gasto">Gasto</option>
                <option value="ingreso">Ingreso</option>
              </select>
            </div>
            <button onClick={addExpense}
              className="px-4 py-2 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-semibold transition-colors">
              Guardar
            </button>
          </div>
        )}

        {expenses.length === 0 ? (
          <p className="text-center text-[#555568] text-sm py-8">No hay gastos o ingresos registrados para este período.</p>
        ) : (
          <div className="space-y-2">
            {expenses.map((e) => (
              <div key={e.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] hover:border-[#3A3A4A] transition-colors group">
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${e.type === "gasto" ? "bg-red-500/10" : "bg-green-500/10"}`}>
                  {e.type === "gasto" ? <Minus size={12} className="text-red-400" /> : <Plus size={12} className="text-green-400" />}
                </div>
                <p className="text-[#F0F0F5] text-sm flex-1">{e.label}</p>
                <p className={`font-semibold text-sm ${e.type === "gasto" ? "text-red-400" : "text-green-400"}`}>
                  {e.type === "gasto" ? "-" : "+"} {cop(e.amount)}
                </p>
                <button onClick={() => setExpenses(prev => prev.filter(x => x.id !== e.id))}
                  className="opacity-0 group-hover:opacity-100 text-[#555568] hover:text-red-400 transition-all">
                  <XCircle size={14} />
                </button>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 px-3 border-t border-[#2A2A3A]">
              <span className="text-[#8888A0] text-xs font-semibold">NETO OTROS</span>
              <span className={`font-bold ${totalExtras >= 0 ? "text-green-400" : "text-red-400"}`}>
                {totalExtras >= 0 ? "+" : ""}{cop(totalExtras)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Indicadores clave */}
      <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-5">
        <SectionHeader title="Indicadores Clave" icon={Target} color="#FF6B35" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            {
              label: "CPA", value: cop(MOCK.meta.cpa), sub: "Costo por adquisición",
              icon: Target, color: "#FF6B35",
            },
            {
              label: "ROI", value: `${((utilidadFinal / MOCK.meta.spend) * 100).toFixed(0)}%`, sub: "Retorno sobre inversión",
              icon: TrendingUp, color: utilidadFinal >= 0 ? "#4ADE80" : "#EF4444",
            },
            {
              label: "Ticket promedio", value: cop(recaudo / MOCK.orders.confirmed), sub: "Venta promedio por orden",
              icon: ShoppingCart, color: "#0EA5E9",
            },
            {
              label: "Utilidad / venta", value: cop(utilidadBruta / MOCK.orders.confirmed), sub: "Ganancia neta por unidad",
              icon: DollarSign, color: "#10B981",
            },
            {
              label: "Ventas / día", value: (MOCK.orders.confirmed / 7).toFixed(1), sub: "Promedio diario confirmadas",
              icon: BarChart3, color: "#8B5CF6",
            },
          ].map((ind) => {
            const Icon = ind.icon;
            return (
              <div key={ind.label} className="bg-[#1C1C26] border border-[#2A2A3A] rounded-xl p-4 hover:border-[#3A3A4A] transition-colors">
                <div className="w-8 h-8 rounded-lg mb-3 flex items-center justify-center" style={{ background: ind.color + "15" }}>
                  <Icon size={14} style={{ color: ind.color }} />
                </div>
                <p className="font-black text-lg" style={{ color: ind.color }}>{ind.value}</p>
                <p className="text-[#F0F0F5] text-xs font-semibold mt-0.5">{ind.label}</p>
                <p className="text-[#555568] text-[10px] mt-0.5">{ind.sub}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Resumen final */}
      <div className="bg-gradient-to-br from-[rgba(16,185,129,0.08)] via-transparent to-[rgba(139,92,246,0.05)] border border-[#2A2A3A] rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-4">
          <Zap size={16} className="text-[#FF6B35]" />
          <h2 className="text-[#F0F0F5] font-bold">Resumen del período</h2>
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { label: "Ingresos totales", value: cop(recaudo), color: "#4ADE80" },
            { label: "Costos + inversión", value: cop(costoMercancia + costoEnvio + envioDevolucion + MOCK.meta.spend + Math.abs(totalExtras < 0 ? totalExtras : 0)), color: "#EF4444" },
            { label: "Utilidad neta final", value: cop(utilidadFinal), color: utilidadFinal >= 0 ? "#10B981" : "#EF4444" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-[#555568] text-xs mb-1">{s.label}</p>
              <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 h-2 bg-[#2A2A3A] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#10B981] to-[#8B5CF6] transition-all"
            style={{ width: `${Math.min(Math.max(parseFloat(pct(utilidadFinal, recaudo)), 0), 100)}%` }}
          />
        </div>
        <p className="text-center text-[#555568] text-xs mt-2">
          Margen neto: <span className="font-bold" style={{ color: utilidadFinal >= 0 ? "#10B981" : "#EF4444" }}>{pct(utilidadFinal, recaudo)}%</span>
        </p>
      </div>

    </div>
  );
}

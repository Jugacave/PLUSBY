"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  TrendingUp,
  DollarSign,
  Package,
  Calculator,
  Target,
  ChevronUp,
  ChevronDown,
  Info,
} from "lucide-react";

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(n);
}

function pct(value: number, total: number) {
  if (!total) return 0;
  return Math.round((value / total) * 100);
}

interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  shipping: number;
  platformFee: number;
  unitsSold: number;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: "1", name: "Faja Reductora Térmica", price: 89000, cost: 22000, shipping: 8000, platformFee: 5, unitsSold: 40 },
  { id: "2", name: "Masajeador Anticelulitis", price: 129000, cost: 38000, shipping: 9000, platformFee: 5, unitsSold: 22 },
  { id: "3", name: "Collar GPS para Mascotas", price: 149000, cost: 45000, shipping: 10000, platformFee: 5, unitsSold: 15 },
];

function StatCard({
  label, value, sub, color = "#F0F0F5", icon: Icon, trend,
}: {
  label: string; value: string; sub?: string;
  color?: string; icon: React.ComponentType<{ size?: number; className?: string }>;
  trend?: "up" | "down";
}) {
  return (
    <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-[#8888A0] text-xs font-medium">{label}</p>
        <div className="w-8 h-8 rounded-lg bg-[#1C1C26] flex items-center justify-center">
          <Icon size={15} className="text-[#555568]" />
        </div>
      </div>
      <p className="text-2xl font-bold" style={{ color }}>{value}</p>
      {sub && (
        <p className="text-[#555568] text-xs mt-1 flex items-center gap-1">
          {trend === "up" && <ChevronUp size={11} className="text-green-400" />}
          {trend === "down" && <ChevronDown size={11} className="text-red-400" />}
          {sub}
        </p>
      )}
    </div>
  );
}

function NumberInput({
  label, value, onChange, prefix, suffix, hint,
}: {
  label: string; value: number; onChange: (v: number) => void;
  prefix?: string; suffix?: string; hint?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-[#8888A0] mb-1.5">{label}</label>
      <div className="flex items-center gap-1.5 bg-[#1C1C26] border border-[#2A2A3A] rounded-xl px-3 py-2.5 focus-within:border-[#FF6B35] transition-colors">
        {prefix && <span className="text-[#555568] text-sm">{prefix}</span>}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 bg-transparent text-[#F0F0F5] text-sm focus:outline-none min-w-0"
        />
        {suffix && <span className="text-[#555568] text-sm">{suffix}</span>}
      </div>
      {hint && <p className="text-[#555568] text-[10px] mt-1">{hint}</p>}
    </div>
  );
}

export default function InformeFinancieroPage() {
  const [calcPrice, setCalcPrice] = useState(89000);
  const [calcCost, setCalcCost] = useState(22000);
  const [calcShipping, setCalcShipping] = useState(8000);
  const [calcPlatformFee, setCalcPlatformFee] = useState(5);
  const [calcUnits, setCalcUnits] = useState(30);
  const [products] = useState<Product[]>(INITIAL_PRODUCTS);

  const calcResults = useMemo(() => {
    const platformCost = (calcPrice * calcPlatformFee) / 100;
    const totalCost = calcCost + calcShipping + platformCost;
    const netProfit = calcPrice - totalCost;
    const marginPct = pct(netProfit, calcPrice);
    const monthlyRevenue = calcPrice * calcUnits;
    const monthlyProfit = netProfit * calcUnits;
    const breakEven = netProfit > 0 ? Math.ceil(totalCost / netProfit) : 0;
    return { platformCost, totalCost, netProfit, marginPct, monthlyRevenue, monthlyProfit, breakEven };
  }, [calcPrice, calcCost, calcShipping, calcPlatformFee, calcUnits]);

  const summary = useMemo(() => {
    const totalRevenue = products.reduce((s, p) => s + p.price * p.unitsSold, 0);
    const totalCosts = products.reduce((s, p) => {
      const platFee = (p.price * p.platformFee) / 100;
      return s + (p.cost + p.shipping + platFee) * p.unitsSold;
    }, 0);
    const totalProfit = totalRevenue - totalCosts;
    const avgMargin = products.length
      ? Math.round(
          products.reduce((s, p) => {
            const platFee = (p.price * p.platformFee) / 100;
            const net = p.price - p.cost - p.shipping - platFee;
            return s + pct(net, p.price);
          }, 0) / products.length
        )
      : 0;
    return { totalRevenue, totalCosts, totalProfit, avgMargin };
  }, [products]);

  const marginColor = (m: number) =>
    m >= 55 ? "#4ADE80" : m >= 35 ? "#F59E0B" : "#EF4444";

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-[#8888A0] hover:text-[#F0F0F5] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#10B981] to-[#059669] flex items-center justify-center shrink-0">
            <TrendingUp size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-[#F0F0F5]">Informe Financiero</h1>
            <p className="text-[#8888A0] text-xs md:text-sm">Analiza la rentabilidad de tu operación</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <StatCard label="Ingresos del mes" value={formatCOP(summary.totalRevenue)} icon={DollarSign} color="#F0F0F5" />
        <StatCard label="Ganancia neta" value={formatCOP(summary.totalProfit)} icon={TrendingUp} color="#4ADE80" trend="up" sub="después de costos" />
        <StatCard label="Costos totales" value={formatCOP(summary.totalCosts)} icon={Package} color="#F59E0B" />
        <StatCard label="Margen promedio" value={`${summary.avgMargin}%`} icon={Target} color={marginColor(summary.avgMargin)} sub="sobre precio de venta" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-6">
          <div className="flex items-center gap-2 mb-5">
            <Calculator size={16} className="text-[#FF6B35]" />
            <h2 className="text-[#F0F0F5] font-bold">Calculadora de Márgenes</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <NumberInput label="Precio de venta" value={calcPrice} onChange={setCalcPrice} prefix="$" hint="Lo que paga el cliente" />
            <NumberInput label="Costo del producto" value={calcCost} onChange={setCalcCost} prefix="$" hint="Lo que pagas al proveedor" />
            <NumberInput label="Costo de envío" value={calcShipping} onChange={setCalcShipping} prefix="$" hint="Flete o domicilio" />
            <NumberInput label="Comisión plataforma" value={calcPlatformFee} onChange={setCalcPlatformFee} suffix="%" hint="Shopify, Dropi, etc." />
            <div className="col-span-2">
              <NumberInput label="Unidades vendidas al mes" value={calcUnits} onChange={setCalcUnits} hint="Proyección mensual" />
            </div>
          </div>
          <div className="bg-[#0A0A0F] rounded-xl p-4 space-y-2.5">
            <p className="text-[#555568] text-[10px] font-semibold uppercase tracking-wider mb-3">Resultado</p>
            {[
              { label: "Precio de venta", value: formatCOP(calcPrice), color: "#F0F0F5" },
              { label: "Costo producto", value: `- ${formatCOP(calcCost)}`, color: "#8888A0" },
              { label: "Envío", value: `- ${formatCOP(calcShipping)}`, color: "#8888A0" },
              { label: `Comisión (${calcPlatformFee}%)`, value: `- ${formatCOP(calcResults.platformCost)}`, color: "#8888A0" },
            ].map((row) => (
              <div key={row.label} className="flex justify-between items-center text-sm">
                <span className="text-[#555568]">{row.label}</span>
                <span style={{ color: row.color }}>{row.value}</span>
              </div>
            ))}
            <div className="h-px bg-[#2A2A3A] my-2" />
            <div className="flex justify-between items-center">
              <span className="text-[#F0F0F5] font-semibold text-sm">Ganancia por unidad</span>
              <span className="font-bold text-lg" style={{ color: calcResults.netProfit >= 0 ? marginColor(calcResults.marginPct) : "#EF4444" }}>
                {formatCOP(calcResults.netProfit)}
              </span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-[#8888A0]">Margen neto</span>
              <span className="font-bold" style={{ color: marginColor(calcResults.marginPct) }}>{calcResults.marginPct}%</span>
            </div>
            <div className="h-1.5 bg-[#2A2A3A] rounded-full overflow-hidden mt-1">
              <div className="h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(calcResults.marginPct, 100)}%`, background: marginColor(calcResults.marginPct) }} />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-6 flex-1">
            <h2 className="text-[#F0F0F5] font-bold mb-1">Proyección mensual</h2>
            <p className="text-[#555568] text-xs mb-5">Basado en {calcUnits} unidades/mes</p>
            <div className="space-y-4">
              {[
                { label: "Ingresos brutos", value: formatCOP(calcResults.monthlyRevenue), color: "#F0F0F5", bar: 100 },
                { label: "Costos totales", value: formatCOP(calcResults.monthlyRevenue - calcResults.monthlyProfit), color: "#F59E0B", bar: pct(calcResults.monthlyRevenue - calcResults.monthlyProfit, calcResults.monthlyRevenue) },
                { label: "Ganancia neta", value: formatCOP(calcResults.monthlyProfit), color: "#4ADE80", bar: pct(calcResults.monthlyProfit, calcResults.monthlyRevenue) },
              ].map((item) => (
                <div key={item.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-[#8888A0]">{item.label}</span>
                    <span className="font-semibold" style={{ color: item.color }}>{item.value}</span>
                  </div>
                  <div className="h-1.5 bg-[#2A2A3A] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${item.bar}%`, background: item.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-[rgba(255,107,53,0.08)] to-transparent border border-[rgba(255,107,53,0.15)] rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[rgba(255,107,53,0.1)] flex items-center justify-center shrink-0">
                <Target size={16} className="text-[#FF6B35]" />
              </div>
              <div>
                <p className="text-[#F0F0F5] font-semibold text-sm">Punto de equilibrio</p>
                <p className="text-[#8888A0] text-xs mt-0.5">Necesitas vender mínimo <span className="text-[#FF6B35] font-bold">{calcResults.breakEven > 0 ? `${calcResults.breakEven} unidades` : "—"}</span> al mes para cubrir costos fijos.</p>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[rgba(124,58,237,0.08)] to-transparent border border-[rgba(124,58,237,0.15)] rounded-2xl p-5">
            <div className="flex items-start gap-2 mb-2">
              <Info size={13} className="text-[#8B5CF6] mt-0.5 shrink-0" />
              <p className="text-[#8B5CF6] text-xs font-semibold">Análisis rápido</p>
            </div>
            <p className="text-[#8888A0] text-xs leading-relaxed">
              {calcResults.marginPct >= 55
                ? `Excelente margen del ${calcResults.marginPct}%. Este producto es muy rentable. Con ${calcUnits} ventas/mes generas ${formatCOP(calcResults.monthlyProfit)} de ganancia neta.`
                : calcResults.marginPct >= 35
                ? `Margen aceptable del ${calcResults.marginPct}%. Considera reducir el costo de envío o negociar mejor precio con tu proveedor.`
                : `Margen bajo del ${calcResults.marginPct}%. Revisa tus costos. Intenta aumentar el precio o reducir costos.`}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-[#2A2A3A]">
          <div>
            <h2 className="text-[#F0F0F5] font-bold">Mis Productos</h2>
            <p className="text-[#555568] text-xs mt-0.5">Comparativa de rentabilidad por producto</p>
          </div>
          <Link href="/encuentra-producto" className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-[#1C1C26] hover:bg-[#2A2A3A] text-[#8888A0] hover:text-[#F0F0F5] text-xs font-medium transition-colors">
            <Package size={13} />
            Agregar producto
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2A2A3A]">
                {["Producto", "Precio venta", "Costo total", "Ganancia/u", "Margen", "Unid/mes", "Ganancia mensual"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold text-[#555568] uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => {
                const platFee = (p.price * p.platformFee) / 100;
                const totalCost = p.cost + p.shipping + platFee;
                const netUnit = p.price - totalCost;
                const margin = pct(netUnit, p.price);
                const monthlyProfit = netUnit * p.unitsSold;
                return (
                  <tr key={p.id} className={`border-b border-[#1C1C26] hover:bg-[#1C1C26] transition-colors ${i === products.length - 1 ? "border-0" : ""}`}>
                    <td className="px-4 py-3.5"><p className="text-[#F0F0F5] text-sm font-medium">{p.name}</p><p className="text-[#555568] text-xs">Comisión {p.platformFee}%</p></td>
                    <td className="px-4 py-3.5 text-[#F0F0F5] text-sm font-medium whitespace-nowrap">{formatCOP(p.price)}</td>
                    <td className="px-4 py-3.5 text-[#8888A0] text-sm whitespace-nowrap">{formatCOP(totalCost)}</td>
                    <td className="px-4 py-3.5 text-sm font-semibold whitespace-nowrap" style={{ color: marginColor(margin) }}>{formatCOP(netUnit)}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <div className="w-12 h-1.5 bg-[#2A2A3A] rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${margin}%`, background: marginColor(margin) }} /></div>
                        <span className="text-xs font-bold whitespace-nowrap" style={{ color: marginColor(margin) }}>{margin}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-[#8888A0] text-sm text-center">{p.unitsSold}</td>
                    <td className="px-4 py-3.5 text-sm font-bold whitespace-nowrap" style={{ color: marginColor(margin) }}>{formatCOP(monthlyProfit)}</td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-[#1C1C26] border-t border-[#2A2A3A]">
                <td className="px-4 py-3 text-[#F0F0F5] text-xs font-bold" colSpan={5}>TOTAL MENSUAL ESTIMADO</td>
                <td className="px-4 py-3 text-[#F0F0F5] text-xs font-bold text-center">{products.reduce((s, p) => s + p.unitsSold, 0)}</td>
                <td className="px-4 py-3 text-green-400 text-sm font-bold whitespace-nowrap">{formatCOP(summary.totalProfit)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

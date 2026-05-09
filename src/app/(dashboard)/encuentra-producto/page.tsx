import Link from "next/link";
import { Search, ArrowLeft } from "lucide-react";

export default function Page() {
  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-[#8888A0] hover:text-[#F0F0F5] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#F0F0F5]">Encuentra Producto</h1>
          <p className="text-[#8888A0] text-sm mt-0.5">Descubre productos ganadores con datos en tiempo real</p>
        </div>
      </div>
      <div className="flex flex-col items-center justify-center py-24 gap-6">
        <div className="w-24 h-24 rounded-3xl flex items-center justify-center" style={{ background: "rgba(14,165,233,0.1)" }}>
          <Search size={40} style={{ color: "#0EA5E9" }} />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-[#F0F0F5]">Encuentra Producto</h2>
          <p className="text-[#8888A0] mt-2">Módulo en construcción — próximamente disponible</p>
        </div>
        <Link href="/dashboard" className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white font-semibold text-sm transition-colors">
          Volver al Dashboard
        </Link>
      </div>
    </div>
  );
}

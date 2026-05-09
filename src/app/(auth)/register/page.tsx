import Link from "next/link";
import { Zap } from "lucide-react";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#FF6B35] flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-[#F0F0F5] font-bold text-2xl tracking-tight">PLUSBY</span>
        </div>
        <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-8">
          <div className="mb-6 text-center">
            <h1 className="text-[#F0F0F5] text-2xl font-bold">Crea tu cuenta</h1>
            <p className="text-[#8888A0] text-sm mt-1">Empieza gratis hoy mismo</p>
          </div>
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">Nombre completo</label>
              <input type="text" placeholder="Juan García" className="w-full px-4 py-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">Correo electrónico</label>
              <input type="email" placeholder="tu@email.com" className="w-full px-4 py-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">Contraseña</label>
              <input type="password" placeholder="Mínimo 8 caracteres" className="w-full px-4 py-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">Confirmar contraseña</label>
              <input type="password" placeholder="Repite tu contraseña" className="w-full px-4 py-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm" />
            </div>
            <button type="submit" className="w-full py-3 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white font-semibold text-sm transition-colors mt-2">Crear cuenta gratis</button>
          </form>
          <p className="mt-6 text-center text-sm text-[#8888A0]">
            ¿Ya tienes cuenta?{" "}
            <Link href="/login" className="text-[#FF6B35] hover:text-[#FF8C5A] font-medium transition-colors">Inicia sesión</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

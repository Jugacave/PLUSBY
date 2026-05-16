"use client";

import { useRouter } from "next/navigation";
import { Zap, XCircle, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RechazadoPage() {
  const router = useRouter();

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-10 h-10 rounded-xl bg-[#FF6B35] flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <span className="text-[#F0F0F5] font-bold text-2xl tracking-tight">PLUSBY</span>
        </div>

        <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-8">
          <div className="w-16 h-16 rounded-2xl bg-[rgba(239,68,68,0.1)] border border-[rgba(239,68,68,0.2)] flex items-center justify-center mx-auto mb-5">
            <XCircle size={32} className="text-[#EF4444]" />
          </div>
          <h1 className="text-[#F0F0F5] text-xl font-bold mb-2">
            Solicitud no aprobada
          </h1>
          <p className="text-[#8888A0] text-sm leading-relaxed mb-6">
            Tu solicitud de acceso a Plusby no fue aprobada en este momento. Si crees que es un error, escríbenos directamente.
          </p>
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-[#2A2A3A] text-[#8888A0] hover:text-[#F0F0F5] hover:border-[#3A3A4A] transition-colors text-sm"
          >
            <LogOut size={14} />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

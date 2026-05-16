"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, Clock, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function PendientePage() {
  const router = useRouter();

  useEffect(() => {
    // Poll every 10s — redirect automatically if the admin approves
    const supabase = createClient();
    const interval = setInterval(async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data: profile } = await supabase
        .from("profiles")
        .select("status")
        .eq("id", user.id)
        .single();
      if (profile?.status === "approved") router.push("/dashboard");
      if (profile?.status === "rejected") router.push("/rechazado");
    }, 10000);
    return () => clearInterval(interval);
  }, [router]);

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
          <div className="w-16 h-16 rounded-2xl bg-[rgba(245,158,11,0.1)] border border-[rgba(245,158,11,0.2)] flex items-center justify-center mx-auto mb-5">
            <Clock size={32} className="text-[#F59E0B]" />
          </div>
          <h1 className="text-[#F0F0F5] text-xl font-bold mb-2">
            Solicitud en revisión
          </h1>
          <p className="text-[#8888A0] text-sm leading-relaxed mb-6">
            Tu cuenta fue creada. El equipo de Plusby está revisando tu solicitud de acceso. Te notificaremos cuando sea aprobada.
          </p>
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[rgba(245,158,11,0.05)] border border-[rgba(245,158,11,0.15)] mb-6">
            <div className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-pulse flex-shrink-0" />
            <p className="text-[#F59E0B] text-xs text-left">
              Esta página se actualiza automáticamente cuando seas aprobado.
            </p>
          </div>
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

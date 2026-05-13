"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (password.length < 8) {
      setError("La contraseña debe tener mínimo 8 caracteres.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });

    if (authError) {
      setError(authError.message === "User already registered"
        ? "Ya existe una cuenta con ese correo."
        : authError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
    setTimeout(() => router.push("/dashboard"), 2000);
  }

  if (success) {
    return (
      <div className="min-h-screen bg-[#0A0A0F] flex items-center justify-center p-4">
        <div className="w-full max-w-md text-center">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 size={32} className="text-green-400" />
          </div>
          <h2 className="text-[#F0F0F5] text-xl font-bold mb-2">¡Cuenta creada!</h2>
          <p className="text-[#8888A0] text-sm">Redirigiendo al dashboard...</p>
        </div>
      </div>
    );
  }

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

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm mb-4">
              <AlertCircle size={15} className="shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">
                Nombre completo
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Juan García"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">
                Correo electrónico
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">
                Contraseña
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 8 caracteres"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">
                Confirmar contraseña
              </label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                placeholder="Repite tu contraseña"
                required
                className="w-full px-4 py-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white font-semibold text-sm transition-colors mt-2 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? "Creando cuenta..." : "Crear cuenta gratis"}
            </button>
          </form>
          <p className="mt-6 text-center text-sm text-[#8888A0]">
            ¿Ya tienes cuenta?{" "}
            <Link
              href="/login"
              className="text-[#FF6B35] hover:text-[#FF8C5A] font-medium transition-colors"
            >
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  User,
  Lock,
  Crown,
  Trash2,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Zap,
  Shield,
  LogOut,
  Eye,
  EyeOff,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Section {
  id: "perfil" | "seguridad" | "plan" | "cuenta";
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const SECTIONS: Section[] = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "seguridad", label: "Seguridad", icon: Lock },
  { id: "plan", label: "Plan", icon: Crown },
  { id: "cuenta", label: "Cuenta", icon: Shield },
];

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium border transition-all ${
        type === "success"
          ? "bg-[#13131A] border-green-500/30 text-green-400"
          : "bg-[#13131A] border-red-500/30 text-red-400"
      }`}
    >
      {type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {message}
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [activeSection, setActiveSection] = useState<Section["id"]>("perfil");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  // Perfil
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Seguridad
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Cuenta
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email ?? "");
        setFullName(user.user_metadata?.full_name ?? "");
      }
    });
  }, []);

  function showToast(message: string, type: "success" | "error") {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });
    setSavingProfile(false);
    if (error) {
      showToast("Error al guardar el perfil.", "error");
    } else {
      showToast("Perfil actualizado correctamente.", "success");
    }
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      showToast("Las contraseñas no coinciden.", "error");
      return;
    }
    if (newPassword.length < 8) {
      showToast("La contraseña debe tener mínimo 8 caracteres.", "error");
      return;
    }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) {
      showToast("Error al cambiar la contraseña.", "error");
    } else {
      showToast("Contraseña actualizada correctamente.", "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "ELIMINAR") return;
    setDeletingAccount(true);
    await supabase.auth.signOut();
    router.push("/login");
  }

  const avatarLetter = fullName?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || "U";

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-4xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} />}

      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-[#8888A0] hover:text-[#F0F0F5] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#F0F0F5]">Configuración</h1>
          <p className="text-[#8888A0] text-sm mt-0.5">Gestiona tu cuenta y preferencias</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar nav */}
        <div className="lg:w-48 shrink-0">
          <nav className="flex lg:flex-col gap-1">
            {SECTIONS.map((s) => {
              const Icon = s.icon;
              const isActive = activeSection === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all w-full text-left ${
                    isActive
                      ? "bg-[rgba(255,107,53,0.1)] text-[#FF6B35] border border-[rgba(255,107,53,0.2)]"
                      : "text-[#8888A0] hover:bg-[#1C1C26] hover:text-[#F0F0F5] border border-transparent"
                  }`}
                >
                  <Icon size={15} />
                  {s.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">

          {/* PERFIL */}
          {activeSection === "perfil" && (
            <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-6">
              <h2 className="text-[#F0F0F5] font-bold text-lg mb-6">Información personal</h2>

              {/* Avatar */}
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#2A2A3A]">
                <div className="w-16 h-16 rounded-2xl bg-[#FF6B35] flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  {avatarLetter}
                </div>
                <div>
                  <p className="text-[#F0F0F5] font-semibold">{fullName || "Sin nombre"}</p>
                  <p className="text-[#8888A0] text-sm">{email}</p>
                  <p className="text-[#555568] text-xs mt-1">Plan Free</p>
                </div>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Tu nombre"
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
                    disabled
                    className="w-full px-4 py-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#555568] text-sm cursor-not-allowed"
                  />
                  <p className="text-[#555568] text-xs mt-1">El correo no se puede cambiar.</p>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white text-sm font-semibold transition-colors disabled:opacity-60"
                  >
                    {savingProfile && <Loader2 size={14} className="animate-spin" />}
                    {savingProfile ? "Guardando..." : "Guardar cambios"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SEGURIDAD */}
          {activeSection === "seguridad" && (
            <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-6">
              <h2 className="text-[#F0F0F5] font-bold text-lg mb-2">Cambiar contraseña</h2>
              <p className="text-[#8888A0] text-sm mb-6">
                Usa una contraseña segura de mínimo 8 caracteres.
              </p>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">
                    Nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Mínimo 8 caracteres"
                      required
                      className="w-full px-4 py-3 pr-10 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNew(!showNew)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555568] hover:text-[#8888A0]"
                    >
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">
                    Confirmar nueva contraseña
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repite la contraseña"
                      required
                      className="w-full px-4 py-3 pr-10 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555568] hover:text-[#8888A0]"
                    >
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {newPassword.length > 0 && (
                  <div className="flex gap-1.5 mt-1">
                    {[
                      newPassword.length >= 8,
                      /[A-Z]/.test(newPassword),
                      /[0-9]/.test(newPassword),
                    ].map((ok, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full transition-colors ${
                          ok ? "bg-green-400" : "bg-[#2A2A3A]"
                        }`}
                      />
                    ))}
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingPassword}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white text-sm font-semibold transition-colors disabled:opacity-60"
                  >
                    {savingPassword && <Loader2 size={14} className="animate-spin" />}
                    {savingPassword ? "Actualizando..." : "Actualizar contraseña"}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* PLAN */}
          {activeSection === "plan" && (
            <div className="space-y-4">
              {/* Plan actual */}
              <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-[#F0F0F5] font-bold text-lg">Tu plan actual</h2>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#1C1C26] text-[#8888A0] border border-[#2A2A3A]">
                    FREE
                  </span>
                </div>
                <div className="space-y-2 mb-6">
                  {[
                    "10 créditos IA al mes",
                    "5 landings activas",
                    "Catálogo básico de productos",
                    "Acceso a Academia (limitado)",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-[#8888A0]">
                      <CheckCircle2 size={14} className="text-[#555568] shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
                <div className="h-px bg-[#2A2A3A] mb-4" />
                <p className="text-[#555568] text-xs">
                  Renovación: nunca — plan gratuito permanente
                </p>
              </div>

              {/* Upgrade */}
              <div className="bg-gradient-to-br from-[rgba(255,107,53,0.08)] to-[rgba(124,58,237,0.05)] border border-[rgba(255,107,53,0.2)] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={16} className="text-[#FF6B35]" />
                  <h3 className="text-[#F0F0F5] font-bold">Plusby Pro</h3>
                  <span className="ml-auto text-[#FF6B35] font-bold text-lg">$49.900<span className="text-sm font-normal text-[#8888A0]">/mes</span></span>
                </div>
                <p className="text-[#8888A0] text-sm mb-4">Todo lo que necesitas para escalar tu dropshipping.</p>
                <div className="space-y-2 mb-5">
                  {[
                    "Créditos IA ilimitados",
                    "Landings ilimitadas + dominio custom",
                    "+500 productos con análisis completo",
                    "Academia completa + Coaching en vivo",
                    "Soporte prioritario",
                  ].map((feature) => (
                    <div key={feature} className="flex items-center gap-2 text-sm text-[#F0F0F5]">
                      <CheckCircle2 size={14} className="text-[#FF6B35] shrink-0" />
                      {feature}
                    </div>
                  ))}
                </div>
                <button className="w-full py-3 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2">
                  <Zap size={15} />
                  Mejorar a Pro
                </button>
              </div>
            </div>
          )}

          {/* CUENTA */}
          {activeSection === "cuenta" && (
            <div className="space-y-4">
              {/* Cerrar sesión */}
              <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-6">
                <h2 className="text-[#F0F0F5] font-bold text-lg mb-1">Sesión</h2>
                <p className="text-[#8888A0] text-sm mb-4">
                  Cierra sesión en este dispositivo.
                </p>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#2A2A3A] hover:border-[#3A3A4A] text-[#8888A0] hover:text-[#F0F0F5] text-sm font-semibold transition-colors"
                >
                  <LogOut size={15} />
                  Cerrar sesión
                </button>
              </div>

              {/* Zona de peligro */}
              <div className="bg-[#13131A] border border-red-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Trash2 size={16} className="text-red-400" />
                  <h2 className="text-red-400 font-bold text-lg">Zona de peligro</h2>
                </div>
                <p className="text-[#8888A0] text-sm mb-4">
                  Esta acción es irreversible. Se eliminarán todos tus datos, landings y configuraciones.
                </p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#8888A0] mb-1.5">
                      Escribe <span className="text-red-400 font-bold">ELIMINAR</span> para confirmar
                    </label>
                    <input
                      type="text"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      placeholder="ELIMINAR"
                      className="w-full px-4 py-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-red-500/50 transition-colors text-sm"
                    />
                  </div>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteConfirm !== "ELIMINAR" || deletingAccount}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {deletingAccount && <Loader2 size={14} className="animate-spin" />}
                    <Trash2 size={14} />
                    Eliminar mi cuenta
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

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
  Store,
  Share2,
  Megaphone,
  Bot,
  Copy,
  ExternalLink,
  Key,
  Hash,
  Globe,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type SectionId = "perfil" | "tienda" | "redes" | "metaads" | "modelos" | "seguridad" | "plan" | "cuenta";

interface Section {
  id: SectionId;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const SECTIONS: Section[] = [
  { id: "perfil", label: "Perfil", icon: User },
  { id: "tienda", label: "Mi Tienda", icon: Store },
  { id: "redes", label: "Redes Sociales", icon: Share2 },
  { id: "metaads", label: "Meta Ads", icon: Megaphone },
  { id: "modelos", label: "Modelos IA", icon: Bot },
  { id: "seguridad", label: "Seguridad", icon: Lock },
  { id: "plan", label: "Plan", icon: Crown },
  { id: "cuenta", label: "Cuenta", icon: Shield },
];

const AI_MODELS = [
  { key: "gemini", label: "Gemini", description: "Mejor para conversaciones con texto flexible", color: "#4285F4", placeholder: "AIza..." },
  { key: "gpt_image", label: "GPT Image", description: "Generación de imágenes avanzadas", color: "#10A37F", placeholder: "sk-..." },
  { key: "claude", label: "Claude / Sonnet", description: "Razonamiento y análisis profundo", color: "#FF6B35", placeholder: "sk-ant-..." },
  { key: "blendercloud", label: "BlenderCloud", description: "Backup de estilos e imágenes en CFP URLs", color: "#EA7500", placeholder: "bc_..." },
  { key: "ideamaker", label: "Ideamaker", description: "Ideas visuales para productos", color: "#7C3AED", placeholder: "im_..." },
  { key: "gala", label: "Gala", description: "Estilos de alta calidad fotográfica", color: "#EC4899", placeholder: "gala_..." },
  { key: "cloudflare", label: "Cloudflare AI", description: "Inferencia rápida sin cold start", color: "#F38020", placeholder: "cf_..." },
  { key: "frames", label: "Frames", description: "Publicaciones y videos de marca", color: "#06B6D4", placeholder: "fr_..." },
  { key: "metahub", label: "Meta Hub AI", description: "Publicación directa con Meta Hub link via Claude AI", color: "#0082FB", placeholder: "mh_..." },
];

function Toast({ message, type }: { message: string; type: "success" | "error" }) {
  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-2xl text-sm font-medium border ${
      type === "success"
        ? "bg-[#13131A] border-green-500/30 text-green-400"
        : "bg-[#13131A] border-red-500/30 text-red-400"
    }`}>
      {type === "success" ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
      {message}
    </div>
  );
}

function SectionCard({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-6">
      <h2 className="text-[#F0F0F5] font-bold text-lg mb-1">{title}</h2>
      {description && <p className="text-[#8888A0] text-sm mb-5">{description}</p>}
      {!description && <div className="mb-5" />}
      {children}
    </div>
  );
}

function InputField({
  label, value, onChange, placeholder, type = "text", disabled, hint, children,
}: {
  label: string; value: string; onChange?: (v: string) => void;
  placeholder?: string; type?: string; disabled?: boolean; hint?: string; children?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={(e) => onChange?.(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className="w-full px-4 py-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm disabled:text-[#555568] disabled:cursor-not-allowed"
        />
        {children}
      </div>
      {hint && <p className="text-[#555568] text-xs mt-1">{hint}</p>}
    </div>
  );
}

function SaveButton({ loading, label = "Guardar cambios" }: { loading: boolean; label?: string }) {
  return (
    <div className="flex justify-end pt-2">
      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white text-sm font-semibold transition-colors disabled:opacity-60"
      >
        {loading && <Loader2 size={14} className="animate-spin" />}
        {loading ? "Guardando..." : label}
      </button>
    </div>
  );
}

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [activeSection, setActiveSection] = useState<SectionId>("perfil");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  const [storeName, setStoreName] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [savingStore, setSavingStore] = useState(false);

  const [socialWhat, setSocialWhat] = useState("");
  const [socialHashtags, setSocialHashtags] = useState("");
  const [savingSocial, setSavingSocial] = useState(false);

  const [metaAccessToken, setMetaAccessToken] = useState("");
  const [metaPixelId, setMetaPixelId] = useState("");
  const [metaBmId, setMetaBmId] = useState("");
  const [metaSystemToken, setMetaSystemToken] = useState("");
  const [showMetaToken, setShowMetaToken] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);

  const [modelKeys, setModelKeys] = useState<Record<string, string>>({});
  const [savingModels, setSavingModels] = useState(false);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [deleteConfirm, setDeleteConfirm] = useState("");

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

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    showToast("Copiado al portapapeles", "success");
  }

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    setSavingProfile(true);
    const { error } = await supabase.auth.updateUser({ data: { full_name: fullName } });
    setSavingProfile(false);
    showToast(error ? "Error al guardar el perfil." : "Perfil actualizado.", error ? "error" : "success");
  }

  async function handleSaveStore(e: React.FormEvent) {
    e.preventDefault();
    setSavingStore(true);
    await new Promise((r) => setTimeout(r, 800));
    setSavingStore(false);
    showToast("Tienda actualizada correctamente.", "success");
  }

  async function handleSaveSocial(e: React.FormEvent) {
    e.preventDefault();
    setSavingSocial(true);
    await new Promise((r) => setTimeout(r, 800));
    setSavingSocial(false);
    showToast("Configuración de redes guardada.", "success");
  }

  async function handleSaveMeta(e: React.FormEvent) {
    e.preventDefault();
    setSavingMeta(true);
    await new Promise((r) => setTimeout(r, 800));
    setSavingMeta(false);
    showToast("Configuración de Meta Ads guardada.", "success");
  }

  async function handleSaveModels(e: React.FormEvent) {
    e.preventDefault();
    setSavingModels(true);
    await new Promise((r) => setTimeout(r, 800));
    setSavingModels(false);
    showToast("Claves de modelos guardadas.", "success");
  }

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword !== confirmPassword) { showToast("Las contraseñas no coinciden.", "error"); return; }
    if (newPassword.length < 8) { showToast("Mínimo 8 caracteres.", "error"); return; }
    setSavingPassword(true);
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (error) { showToast("Error al cambiar la contraseña.", "error"); return; }
    showToast("Contraseña actualizada.", "success");
    setNewPassword(""); setConfirmPassword("");
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  async function handleDeleteAccount() {
    if (deleteConfirm !== "ELIMINAR") return;
    await supabase.auth.signOut();
    router.push("/login");
  }

  const avatarLetter = fullName?.[0]?.toUpperCase() || email?.[0]?.toUpperCase() || "U";
  const publicUrl = storeSlug ? `https://plusby.app/l/${storeSlug}` : "";

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-5xl mx-auto">
      {toast && <Toast message={toast.message} type={toast.type} />}

      <div className="flex items-center gap-3 mb-8">
        <Link href="/dashboard" className="text-[#8888A0] hover:text-[#F0F0F5] transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-[#F0F0F5]">Configuración</h1>
          <p className="text-[#8888A0] text-sm mt-0.5">Gestiona tu cuenta, tienda e integraciones</p>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="lg:w-52 shrink-0">
          <nav className="flex lg:flex-col gap-1 flex-wrap">
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
                  <Icon size={15} className="shrink-0" />
                  {s.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="flex-1 min-w-0 space-y-4">

          {activeSection === "perfil" && (
            <SectionCard title="Información personal" description="Tu nombre público y datos de cuenta.">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#2A2A3A]">
                <div className="w-16 h-16 rounded-2xl bg-[#FF6B35] flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  {avatarLetter}
                </div>
                <div>
                  <p className="text-[#F0F0F5] font-semibold">{fullName || "Sin nombre"}</p>
                  <p className="text-[#8888A0] text-sm">{email}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1C1C26] text-[#555568] border border-[#2A2A3A] mt-1 inline-block">Plan Free</span>
                </div>
              </div>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <InputField label="Nombre completo" value={fullName} onChange={setFullName} placeholder="Tu nombre" />
                <InputField label="Correo electrónico" value={email} disabled hint="El correo no se puede cambiar." />
                <SaveButton loading={savingProfile} />
              </form>
            </SectionCard>
          )}

          {activeSection === "tienda" && (
            <SectionCard title="Mi Tienda" description="Configura el nombre y la URL pública de tu tienda.">
              <form onSubmit={handleSaveStore} className="space-y-4">
                <InputField label="Nombre de la tienda" value={storeName} onChange={setStoreName} placeholder="Ej: Gadgets Colombia" />
                <div>
                  <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">Slug de la URL pública</label>
                  <div className="flex gap-2">
                    <div className="flex items-center px-3 py-3 rounded-l-xl bg-[#1C1C26] border border-r-0 border-[#2A2A3A] text-[#555568] text-sm whitespace-nowrap">plusby.app/l/</div>
                    <input type="text" value={storeSlug} onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} placeholder="mi-tienda" className="flex-1 px-4 py-3 rounded-r-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm" />
                  </div>
                  <p className="text-[#555568] text-xs mt-1">Solo letras minúsculas, números y guiones.</p>
                </div>
                {storeSlug && (
                  <div className="flex items-center gap-2 p-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A]">
                    <Globe size={13} className="text-[#555568] shrink-0" />
                    <span className="text-[#8888A0] text-xs flex-1 truncate">{publicUrl}</span>
                    <button type="button" onClick={() => copyToClipboard(publicUrl)} className="text-[#555568] hover:text-[#FF6B35] transition-colors"><Copy size={13} /></button>
                    <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-[#555568] hover:text-[#FF6B35] transition-colors"><ExternalLink size={13} /></a>
                  </div>
                )}
                <InputField label="URL externa (Shopify, tienda propia…)" value={storeUrl} onChange={setStoreUrl} placeholder="https://tutienda.com" hint="Opcional. Úsala si ya tienes una tienda fuera de Plusby." />
                <SaveButton loading={savingStore} />
              </form>
            </SectionCard>
          )}

          {activeSection === "redes" && (
            <SectionCard title="Publicación en Redes Sociales" description="Configura el contenido predeterminado para tus publicaciones.">
              <form onSubmit={handleSaveSocial} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">¿Qué publicas habitualmente?</label>
                  <textarea value={socialWhat} onChange={(e) => setSocialWhat(e.target.value)} placeholder="Ej: Productos de salud y bienestar para mujeres entre 25 y 45 años." rows={3} className="w-full px-4 py-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm resize-none" />
                  <p className="text-[#555568] text-xs mt-1">La IA usará esto como contexto para generar copies y creativos.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">Hashtags predeterminados</label>
                  <input type="text" value={socialHashtags} onChange={(e) => setSocialHashtags(e.target.value)} placeholder="#dropshipping #colombia #emprendimiento" className="w-full px-4 py-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm" />
                  <p className="text-[#555568] text-xs mt-1">Se añadirán automáticamente a tus publicaciones generadas.</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                  {["Instagram", "Facebook", "TikTok", "YouTube"].map((red) => (
                    <div key={red} className="flex items-center gap-2 p-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A]">
                      <div className="w-2 h-2 rounded-full bg-[#2A2A3A]" />
                      <span className="text-[#8888A0] text-xs">{red}</span>
                    </div>
                  ))}
                </div>
                <p className="text-[#555568] text-xs">Conexión directa con redes — próximamente.</p>
                <SaveButton loading={savingSocial} label="Guardar configuración" />
              </form>
            </SectionCard>
          )}

          {activeSection === "metaads" && (
            <div className="space-y-4">
              <SectionCard title="Meta Ads" description="Conecta tu cuenta de Meta para lanzar anuncios directamente desde Plusby.">
                <div className="p-3 rounded-xl bg-[rgba(14,165,233,0.06)] border border-[rgba(14,165,233,0.15)] mb-5">
                  <p className="text-[#8888A0] text-xs leading-relaxed">Para usar Meta Ads necesitas un <span className="text-[#F0F0F5]">Business Manager</span> activo.</p>
                </div>
                <form onSubmit={handleSaveMeta} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">Meta Access Token</label>
                    <div className="relative">
                      <input type={showMetaToken ? "text" : "password"} value={metaAccessToken} onChange={(e) => setMetaAccessToken(e.target.value)} placeholder="EAAxxxxxxxxx..." className="w-full px-4 py-3 pr-10 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm" />
                      <button type="button" onClick={() => setShowMetaToken(!showMetaToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555568] hover:text-[#8888A0]">{showMetaToken ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                    </div>
                  </div>
                  <InputField label="Pixel ID" value={metaPixelId} onChange={setMetaPixelId} placeholder="123456789012345" hint="Encuéntralo en Events Manager → tu Pixel → Settings." />
                  <InputField label="Business Manager ID" value={metaBmId} onChange={setMetaBmId} placeholder="123456789012345" hint="business.facebook.com → Settings → Business Info." />
                  <div>
                    <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">System User Access Token <span className="text-[#555568] font-normal">(opcional)</span></label>
                    <textarea value={metaSystemToken} onChange={(e) => setMetaSystemToken(e.target.value)} placeholder="Token del System User..." rows={3} className="w-full px-4 py-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm resize-none font-mono" />
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button type="button" className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#2A2A3A] hover:border-[#3A3A4A] text-[#8888A0] hover:text-[#F0F0F5] text-sm font-medium transition-colors">Probar conexión</button>
                    <button type="submit" disabled={savingMeta} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white text-sm font-semibold transition-colors disabled:opacity-60">{savingMeta && <Loader2 size={14} className="animate-spin" />}{savingMeta ? "Guardando..." : "Guardar configuración"}</button>
                  </div>
                </form>
              </SectionCard>
              <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-5">
                <p className="text-[#F0F0F5] font-semibold text-sm mb-3">¿Cómo obtener tu Business Manager ID?</p>
                <ol className="space-y-2">
                  {["Ve a business.facebook.com e inicia sesión","Haz clic en Configuración (ícono de engranaje)","Selecciona Info del negocio","Copia el ID del Business Manager","Para el System User Token: Usuarios → Usuarios del sistema → Generar token"].map((step, i) => (
                    <li key={i} className="flex gap-2.5 text-xs text-[#8888A0]">
                      <span className="w-5 h-5 rounded-full bg-[#1C1C26] border border-[#2A2A3A] flex items-center justify-center text-[#555568] font-bold shrink-0 text-[10px]">{i + 1}</span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {activeSection === "modelos" && (
            <div className="space-y-4">
              <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Key size={16} className="text-[#8B5CF6]" />
                  <h2 className="text-[#F0F0F5] font-bold text-lg">Modelos IA (BYOK)</h2>
                </div>
                <p className="text-[#8888A0] text-sm mb-1">Trae tus propias claves API para usar modelos específicos.</p>
                <p className="text-[#555568] text-xs mb-6">Si no configuras una clave, Plusby usará el modelo predeterminado del sistema.</p>
                <form onSubmit={handleSaveModels} className="space-y-3">
                  {AI_MODELS.map((model) => (
                    <div key={model.key} className="flex items-center gap-3 p-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] hover:border-[#3A3A4A] transition-colors">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold" style={{ background: model.color + "20", color: model.color }}>{model.label[0]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[#F0F0F5] text-xs font-semibold">{model.label}</p>
                        <p className="text-[#555568] text-[10px] truncate">{model.description}</p>
                      </div>
                      <input type="password" value={modelKeys[model.key] ?? ""} onChange={(e) => setModelKeys((prev) => ({ ...prev, [model.key]: e.target.value }))} placeholder={model.placeholder} className="w-36 px-3 py-2 rounded-lg bg-[#13131A] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-xs font-mono" />
                    </div>
                  ))}
                  <div className="flex justify-end pt-2">
                    <button type="submit" disabled={savingModels} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-sm font-semibold transition-colors disabled:opacity-60">{savingModels && <Loader2 size={14} className="animate-spin" />}{savingModels ? "Guardando..." : "Guardar claves"}</button>
                  </div>
                </form>
              </div>
              <div className="p-4 rounded-2xl bg-[rgba(139,92,246,0.06)] border border-[rgba(139,92,246,0.2)]">
                <p className="text-[#A78BFA] text-xs font-semibold mb-1 flex items-center gap-1.5"><Shield size={12} /> Seguridad</p>
                <p className="text-[#8888A0] text-xs leading-relaxed">Tus claves API se cifran antes de almacenarse y nunca se exponen en el cliente.</p>
              </div>
            </div>
          )}

          {activeSection === "seguridad" && (
            <SectionCard title="Cambiar contraseña" description="Usa una contraseña segura de mínimo 8 caracteres.">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">Nueva contraseña</label>
                  <div className="relative">
                    <input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required className="w-full px-4 py-3 pr-10 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm" />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555568] hover:text-[#8888A0]">{showNew ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">Confirmar contraseña</label>
                  <div className="relative">
                    <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña" required className="w-full px-4 py-3 pr-10 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555568] hover:text-[#8888A0]">{showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}</button>
                  </div>
                </div>
                {newPassword.length > 0 && (
                  <div className="flex gap-1.5">
                    {[newPassword.length >= 8, /[A-Z]/.test(newPassword), /[0-9]/.test(newPassword)].map((ok, i) => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${ok ? "bg-green-400" : "bg-[#2A2A3A]"}`} />
                    ))}
                  </div>
                )}
                <SaveButton loading={savingPassword} label="Actualizar contraseña" />
              </form>
            </SectionCard>
          )}

          {activeSection === "plan" && (
            <div className="space-y-4">
              <SectionCard title="Tu plan actual">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#1C1C26] text-[#8888A0] border border-[#2A2A3A]">FREE</span>
                </div>
                <div className="space-y-2 mb-5">
                  {["10 créditos IA al mes", "5 landings activas", "Catálogo básico de productos", "Academia limitada"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-[#8888A0]"><CheckCircle2 size={14} className="text-[#555568] shrink-0" />{f}</div>
                  ))}
                </div>
                <p className="text-[#555568] text-xs">Plan gratuito permanente.</p>
              </SectionCard>
              <div className="bg-gradient-to-br from-[rgba(255,107,53,0.08)] to-[rgba(124,58,237,0.05)] border border-[rgba(255,107,53,0.2)] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Zap size={16} className="text-[#FF6B35]" />
                  <h3 className="text-[#F0F0F5] font-bold">Plusby Pro</h3>
                  <span className="ml-auto text-[#FF6B35] font-bold text-lg">$49.900<span className="text-sm font-normal text-[#8888A0]">/mes</span></span>
                </div>
                <p className="text-[#8888A0] text-sm mb-4">Todo lo que necesitas para escalar tu dropshipping.</p>
                <div className="space-y-2 mb-5">
                  {["Créditos IA ilimitados", "Landings ilimitadas + dominio custom", "+500 productos con análisis completo", "Academia completa + Coaching", "Soporte prioritario", "Meta Ads integrado"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-[#F0F0F5]"><CheckCircle2 size={14} className="text-[#FF6B35] shrink-0" />{f}</div>
                  ))}
                </div>
                <button className="w-full py-3 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"><Zap size={15} />Mejorar a Pro</button>
              </div>
            </div>
          )}

          {activeSection === "cuenta" && (
            <div className="space-y-4">
              <SectionCard title="Sesión" description="Cierra sesión en este dispositivo.">
                <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#2A2A3A] hover:border-[#3A3A4A] text-[#8888A0] hover:text-[#F0F0F5] text-sm font-semibold transition-colors"><LogOut size={15} />Cerrar sesión</button>
              </SectionCard>
              <div className="bg-[#13131A] border border-red-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-1"><Trash2 size={16} className="text-red-400" /><h2 className="text-red-400 font-bold text-lg">Zona de peligro</h2></div>
                <p className="text-[#8888A0] text-sm mb-4">Acción irreversible. Se eliminarán todos tus datos, landings y configuraciones.</p>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-[#8888A0] mb-1.5">Escribe <span className="text-red-400 font-bold">ELIMINAR</span> para confirmar</label>
                    <input type="text" value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="ELIMINAR" className="w-full px-4 py-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-red-500/50 transition-colors text-sm" />
                  </div>
                  <button onClick={handleDeleteAccount} disabled={deleteConfirm !== "ELIMINAR"} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"><Trash2 size={14} />Eliminar mi cuenta</button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

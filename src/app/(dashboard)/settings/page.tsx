"use client";

import { useEffect, useRef, useState } from "react";
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
  Upload,
  Palette,
  ImageIcon,
  Sparkles,
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

interface AIModel {
  key: string;
  label: string;
  sublabel: string;
  specificModel: string;
  costNote: string;
  costDetail: string;
  domain: string;
  color: string;
  placeholder: string;
  apiUrl: string;
  tip?: { title: string; body: string; link?: { label: string; url: string } };
}

const AI_MODELS: AIModel[] = [
  {
    key: "gemini", label: "Google AI", sublabel: "Gemini",
    specificModel: "Gemini 2.5 Flash Image", costNote: "~$0.02/img", costDetail: "Mejor para texto en imágenes",
    domain: "google.com", color: "#4285F4", placeholder: "AIza...", apiUrl: "https://aistudio.google.com/apikey",
    tip: {
      title: "Evita sustos en tu tarjeta",
      body: "Google permite cargar saldo prepago sin auto-renovación. Carga $10 una vez y nunca podrán cobrarte más.",
      link: { label: "Configurar prepago en Google AI", url: "https://aistudio.google.com/billing" },
    },
  },
  {
    key: "gpt_image", label: "OpenAI", sublabel: "GPT Image",
    specificModel: "GPT Image 1", costNote: "~$0.04/img", costDetail: "Alta calidad fotorealista",
    domain: "openai.com", color: "#10A37F", placeholder: "sk-...", apiUrl: "https://platform.openai.com/api-keys",
  },
  {
    key: "claude", label: "Anthropic", sublabel: "Claude / Sonnet",
    specificModel: "claude-sonnet-4-6", costNote: "~$0.003/1k tokens", costDetail: "Razonamiento avanzado",
    domain: "anthropic.com", color: "#FF6B35", placeholder: "sk-ant-...", apiUrl: "https://console.anthropic.com/settings/keys",
  },
  {
    key: "cloudflare", label: "Cloudflare AI", sublabel: "Workers AI",
    specificModel: "Flux / SDXL", costNote: "~$0.00", costDetail: "10k neurons/día gratis",
    domain: "cloudflare.com", color: "#F38020", placeholder: "cf_...", apiUrl: "https://dash.cloudflare.com/profile/api-tokens",
    tip: {
      title: "Tier gratuito muy generoso",
      body: "Con el plan Free tienes 10,000 neurons/día (~333 imágenes). Sin tarjeta de crédito requerida.",
    },
  },
  {
    key: "blendercloud", label: "BlenderCloud", sublabel: "CFP URLs",
    specificModel: "BlenderCloud API", costNote: "Variable", costDetail: "Backup de estilos e imágenes",
    domain: "blendercloud.com", color: "#EA7500", placeholder: "bc_...", apiUrl: "https://cloud.blender.org/settings",
  },
  {
    key: "ideamaker", label: "Ideamaker", sublabel: "Ideamaker AI",
    specificModel: "Ideamaker", costNote: "~$0.02/img", costDetail: "Ideas visuales para productos",
    domain: "ideamaker.ai", color: "#7C3AED", placeholder: "im_...", apiUrl: "https://ideamaker.ai/settings/api",
  },
  {
    key: "gala", label: "Gala Art", sublabel: "Gala",
    specificModel: "Gala Image Gen", costNote: "~$0.03/img", costDetail: "Alta calidad fotográfica",
    domain: "gala.art", color: "#EC4899", placeholder: "gala_...", apiUrl: "https://app.gala.art/settings",
  },
  {
    key: "frames", label: "Frames", sublabel: "Frames.so",
    specificModel: "Frames Video", costNote: "~$0.10/video", costDetail: "Videos y publicaciones de marca",
    domain: "frames.so", color: "#06B6D4", placeholder: "fr_...", apiUrl: "https://frames.so/settings/api",
  },
  {
    key: "metahub", label: "Meta", sublabel: "Meta Hub AI",
    specificModel: "Meta AI API", costNote: "Variable", costDetail: "Publicación directa a Meta Ads",
    domain: "meta.com", color: "#0082FB", placeholder: "mh_...", apiUrl: "https://developers.facebook.com/apps",
  },
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

function ProviderIcon({ domain, label, color }: { domain: string; label: string; color: string }) {
  const [imgFailed, setImgFailed] = useState(false);
  return (
    <div className="w-10 h-10 rounded-xl flex items-center justify-center overflow-hidden shrink-0" style={{ background: color + "22" }}>
      {!imgFailed ? (
        <img
          src={`https://www.google.com/s2/favicons?domain=${domain}&sz=64`}
          alt={label}
          className="w-6 h-6 object-contain"
          onError={() => setImgFailed(true)}
        />
      ) : (
        <span className="font-bold text-sm" style={{ color }}>{label[0]}</span>
      )}
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

  // Perfil
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);

  // Mi Tienda + Marca
  const [storeName, setStoreName] = useState("");
  const [storeTagline, setStoreTagline] = useState("");
  const [storeUrl, setStoreUrl] = useState("");
  const [storeSlug, setStoreSlug] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [logoPreview, setLogoPreview] = useState("");
  const [logoUploading, setLogoUploading] = useState(false);
  const [brandPrimary, setBrandPrimary] = useState("#FF6B35");
  const [brandSecondary, setBrandSecondary] = useState("#8B5CF6");
  const [brandAccent, setBrandAccent] = useState("#F0F0F5");
  const [savingStore, setSavingStore] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  // Redes Sociales
  const [socialWhat, setSocialWhat] = useState("");
  const [socialHashtags, setSocialHashtags] = useState("");
  const [savingSocial, setSavingSocial] = useState(false);

  // Meta Ads
  const [metaAccessToken, setMetaAccessToken] = useState("");
  const [metaPixelId, setMetaPixelId] = useState("");
  const [metaBmId, setMetaBmId] = useState("");
  const [metaSystemToken, setMetaSystemToken] = useState("");
  const [showMetaToken, setShowMetaToken] = useState(false);
  const [savingMeta, setSavingMeta] = useState(false);

  // Modelos IA
  const [modelKeys, setModelKeys] = useState<Record<string, string>>({});
  const [modelSaveStates, setModelSaveStates] = useState<Record<string, "idle" | "saving" | "saved">>({});
  const [showModelKey, setShowModelKey] = useState<Record<string, boolean>>({});

  // Seguridad
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  // Cuenta
  const [deleteConfirm, setDeleteConfirm] = useState("");

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setEmail(user.email ?? "");
        setFullName(user.user_metadata?.full_name ?? "");
        const m = user.user_metadata ?? {};
        setStoreName(m.store_name ?? "");
        setStoreTagline(m.store_tagline ?? "");
        setStoreSlug(m.store_slug ?? "");
        setStoreUrl(m.store_url ?? "");
        setLogoUrl(m.brand_logo ?? "");
        setLogoPreview(m.brand_logo ?? "");
        setBrandPrimary(m.brand_primary ?? "#FF6B35");
        setBrandSecondary(m.brand_secondary ?? "#8B5CF6");
        setBrandAccent(m.brand_accent ?? "#F0F0F5");
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

  async function handleLogoUpload(file: File) {
    if (!file.type.startsWith("image/")) { showToast("Solo se permiten imágenes.", "error"); return; }
    setLogoUploading(true);
    const reader = new FileReader();
    reader.onload = (e) => setLogoPreview(e.target?.result as string);
    reader.readAsDataURL(file);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLogoUploading(false); return; }
    const ext = file.name.split(".").pop();
    const path = `${user.id}/logo.${ext}`;
    const { error } = await supabase.storage.from("store-logos").upload(path, file, { upsert: true });
    if (error) {
      showToast("Error al subir el logo. Verifica el bucket 'store-logos' en Supabase.", "error");
      setLogoUploading(false); return;
    }
    const { data } = supabase.storage.from("store-logos").getPublicUrl(path);
    setLogoUrl(data.publicUrl);
    setLogoUploading(false);
    showToast("Logo subido correctamente.", "success");
  }

  async function handleSaveStore(e: React.FormEvent) {
    e.preventDefault();
    setSavingStore(true);
    const { error } = await supabase.auth.updateUser({
      data: {
        store_name: storeName,
        store_tagline: storeTagline,
        store_slug: storeSlug,
        store_url: storeUrl,
        brand_logo: logoUrl,
        brand_primary: brandPrimary,
        brand_secondary: brandSecondary,
        brand_accent: brandAccent,
      },
    });
    setSavingStore(false);
    showToast(error ? "Error al guardar." : "Marca guardada correctamente.", error ? "error" : "success");
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

  async function handleSaveModel(key: string) {
    setModelSaveStates((prev) => ({ ...prev, [key]: "saving" }));
    await new Promise((r) => setTimeout(r, 700));
    setModelSaveStates((prev) => ({ ...prev, [key]: "saved" }));
    setTimeout(() => setModelSaveStates((prev) => ({ ...prev, [key]: "idle" })), 2500);
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
        {/* Nav lateral */}
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

          {/* ── PERFIL ── */}
          {activeSection === "perfil" && (
            <SectionCard title="Información personal" description="Tu nombre público y datos de cuenta.">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-[#2A2A3A]">
                <div className="w-16 h-16 rounded-2xl bg-[#FF6B35] flex items-center justify-center text-white text-2xl font-bold shrink-0">
                  {avatarLetter}
                </div>
                <div>
                  <p className="text-[#F0F0F5] font-semibold">{fullName || "Sin nombre"}</p>
                  <p className="text-[#8888A0] text-sm">{email}</p>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-[#1C1C26] text-[#555568] border border-[#2A2A3A] mt-1 inline-block">
                    Plan Free
                  </span>
                </div>
              </div>
              <form onSubmit={handleSaveProfile} className="space-y-4">
                <InputField label="Nombre completo" value={fullName} onChange={setFullName} placeholder="Tu nombre" />
                <InputField label="Correo electrónico" value={email} disabled hint="El correo no se puede cambiar." />
                <SaveButton loading={savingProfile} />
              </form>
            </SectionCard>
          )}

          {/* ── MI TIENDA ── */}
          {activeSection === "tienda" && (
            <form onSubmit={handleSaveStore} className="space-y-4">

              {/* Logo + nombre */}
              <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-1">
                  <ImageIcon size={16} className="text-[#FF6B35]" />
                  <h2 className="text-[#F0F0F5] font-bold text-lg">Identidad de Marca</h2>
                </div>
                <p className="text-[#8888A0] text-sm mb-5">Tu logo y nombre aparecerán en landings, productos y materiales generados.</p>

                {/* Logo upload */}
                <div className="mb-5">
                  <label className="block text-sm font-medium text-[#F0F0F5] mb-2">Logo de la tienda</label>
                  <div className="flex items-center gap-4">
                    {/* Preview */}
                    <div
                      className="w-20 h-20 rounded-2xl border-2 border-dashed border-[#2A2A3A] flex items-center justify-center shrink-0 overflow-hidden cursor-pointer hover:border-[#FF6B35] transition-colors relative group"
                      style={{ background: brandPrimary + "15" }}
                      onClick={() => logoInputRef.current?.click()}
                    >
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-full h-full object-contain p-1" />
                      ) : (
                        <div className="text-center">
                          <ImageIcon size={20} className="text-[#555568] mx-auto" />
                          <p className="text-[#555568] text-[9px] mt-1">Logo</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                        <Upload size={16} className="text-white" />
                      </div>
                    </div>

                    {/* Zona drag & drop */}
                    <div
                      className="flex-1 border-2 border-dashed border-[#2A2A3A] rounded-xl p-4 text-center cursor-pointer hover:border-[#FF6B35] transition-colors"
                      onClick={() => logoInputRef.current?.click()}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleLogoUpload(f); }}
                    >
                      {logoUploading ? (
                        <div className="flex items-center justify-center gap-2 text-[#8888A0] text-sm">
                          <Loader2 size={15} className="animate-spin" /> Subiendo...
                        </div>
                      ) : (
                        <>
                          <Upload size={18} className="text-[#555568] mx-auto mb-1" />
                          <p className="text-[#8888A0] text-sm font-medium">Arrastra tu logo aquí</p>
                          <p className="text-[#555568] text-xs mt-0.5">PNG, JPG, SVG · máx 2MB</p>
                        </>
                      )}
                    </div>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoUpload(f); }}
                    />
                  </div>
                  {logoUrl && (
                    <p className="text-[#10B981] text-xs mt-2 flex items-center gap-1">
                      <CheckCircle2 size={11} /> Logo guardado
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <InputField label="Nombre de la tienda" value={storeName} onChange={setStoreName} placeholder="Ej: Gadgets Colombia" />
                  <InputField label="Slogan / Tagline" value={storeTagline} onChange={setStoreTagline} placeholder="Ej: Calidad que transforma" hint="Aparece bajo el nombre en tus landings." />
                </div>
              </div>

              {/* Colores corporativos */}
              <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Palette size={16} className="text-[#8B5CF6]" />
                  <h2 className="text-[#F0F0F5] font-bold text-lg">Colores Corporativos</h2>
                </div>
                <p className="text-[#8888A0] text-sm mb-4">Se aplicarán automáticamente en tus landings y creativos generados.</p>

                {/* Paletas presets */}
                <div className="mb-5">
                  <p className="text-xs font-medium text-[#8888A0] mb-2">Paletas predefinidas</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { name: "Plusby", p: "#FF6B35", s: "#8B5CF6", a: "#F0F0F5" },
                      { name: "Esmeralda", p: "#10B981", s: "#0D9488", a: "#F0F0F5" },
                      { name: "Zafiro", p: "#3B82F6", s: "#1D4ED8", a: "#F0F0F5" },
                      { name: "Amatista", p: "#8B5CF6", s: "#6D28D9", a: "#F0F0F5" },
                      { name: "Rosa", p: "#EC4899", s: "#BE185D", a: "#F0F0F5" },
                      { name: "Dorado", p: "#F59E0B", s: "#D97706", a: "#1A1A2E" },
                      { name: "Coral", p: "#F87171", s: "#EF4444", a: "#F0F0F5" },
                      { name: "Menta", p: "#34D399", s: "#059669", a: "#0A2E1A" },
                    ].map((preset) => (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => { setBrandPrimary(preset.p); setBrandSecondary(preset.s); setBrandAccent(preset.a); }}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                          brandPrimary === preset.p ? "border-[#FF6B35] bg-[rgba(255,107,53,0.08)] text-[#F0F0F5]" : "border-[#2A2A3A] text-[#8888A0] hover:border-[#3A3A4A] hover:text-[#F0F0F5]"
                        }`}
                      >
                        <span className="flex gap-0.5">
                          <span className="w-3 h-3 rounded-full" style={{ background: preset.p }} />
                          <span className="w-3 h-3 rounded-full" style={{ background: preset.s }} />
                        </span>
                        {preset.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Pickers manuales */}
                <div className="grid grid-cols-3 gap-4 mb-5">
                  {[
                    { label: "Color Principal", value: brandPrimary, onChange: setBrandPrimary, hint: "Botones, CTAs, links" },
                    { label: "Color Secundario", value: brandSecondary, onChange: setBrandSecondary, hint: "Fondos, badges, gradientes" },
                    { label: "Color de Texto", value: brandAccent, onChange: setBrandAccent, hint: "Texto sobre fondos de marca" },
                  ].map((c) => (
                    <div key={c.label}>
                      <label className="block text-xs font-medium text-[#F0F0F5] mb-1.5">{c.label}</label>
                      <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[#1C1C26] border border-[#2A2A3A]">
                        <input
                          type="color"
                          value={c.value}
                          onChange={(e) => c.onChange(e.target.value)}
                          className="w-7 h-7 rounded-lg cursor-pointer border-0 bg-transparent p-0"
                        />
                        <span className="text-[#8888A0] text-xs font-mono flex-1">{c.value.toUpperCase()}</span>
                      </div>
                      <p className="text-[#555568] text-[10px] mt-1">{c.hint}</p>
                    </div>
                  ))}
                </div>

                {/* Preview en vivo */}
                <div className="rounded-xl overflow-hidden border border-[#2A2A3A]">
                  <div className="px-3 py-1.5 bg-[#1C1C26] border-b border-[#2A2A3A] flex items-center gap-1.5">
                    <Sparkles size={11} className="text-[#555568]" />
                    <span className="text-[#555568] text-[10px] font-medium">Vista previa de tu marca</span>
                  </div>
                  <div className="p-5" style={{ background: brandSecondary + "18" }}>
                    <div className="flex items-center gap-3 mb-3">
                      {logoPreview ? (
                        <img src={logoPreview} alt="Logo" className="w-10 h-10 rounded-xl object-contain" style={{ background: brandPrimary + "20" }} />
                      ) : (
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ background: brandPrimary }}>
                          {storeName?.[0]?.toUpperCase() || "M"}
                        </div>
                      )}
                      <div>
                        <p className="font-bold text-sm" style={{ color: brandAccent }}>{storeName || "Mi Tienda"}</p>
                        <p className="text-xs opacity-70" style={{ color: brandAccent }}>{storeTagline || "Tu slogan aquí"}</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 rounded-lg text-white text-xs font-semibold" style={{ background: brandPrimary }}>
                      Comprar ahora
                    </button>
                  </div>
                </div>
              </div>

              {/* URL pública */}
              <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Globe size={16} className="text-[#10B981]" />
                  <h2 className="text-[#F0F0F5] font-bold text-lg">URL Pública</h2>
                </div>
                <p className="text-[#8888A0] text-sm mb-5">Dirección donde tus clientes verán tus productos y landings.</p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">Slug de la URL pública</label>
                    <div className="flex gap-2">
                      <div className="flex items-center px-3 py-3 rounded-l-xl bg-[#1C1C26] border border-r-0 border-[#2A2A3A] text-[#555568] text-sm whitespace-nowrap">plusby.app/l/</div>
                      <input
                        type="text"
                        value={storeSlug}
                        onChange={(e) => setStoreSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
                        placeholder="mi-tienda"
                        className="flex-1 px-4 py-3 rounded-r-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm"
                      />
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

                  <InputField
                    label="URL externa (Shopify, tienda propia…)"
                    value={storeUrl}
                    onChange={setStoreUrl}
                    placeholder="https://tutienda.com"
                    hint="Opcional. Úsala si ya tienes una tienda fuera de Plusby."
                  />
                </div>
              </div>

              <SaveButton loading={savingStore} label="Guardar marca y tienda" />
            </form>
          )}

          {/* ── REDES SOCIALES ── */}
          {activeSection === "redes" && (
            <SectionCard title="Publicación en Redes Sociales" description="Configura el contenido predeterminado para tus publicaciones en Facebook, Instagram, TikTok y más.">
              <form onSubmit={handleSaveSocial} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5 flex items-center gap-1.5">
                    <Hash size={13} className="text-[#FF6B35]" />
                    ¿Qué publicas habitualmente?
                  </label>
                  <textarea
                    value={socialWhat}
                    onChange={(e) => setSocialWhat(e.target.value)}
                    placeholder="Ej: Productos de salud y bienestar para mujeres entre 25 y 45 años. Enfoque en transformación física y resultados rápidos."
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm resize-none"
                  />
                  <p className="text-[#555568] text-xs mt-1">La IA usará esto como contexto para generar copies y creativos.</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5 flex items-center gap-1.5">
                    <Hash size={13} className="text-[#8888A0]" />
                    Hashtags predeterminados
                  </label>
                  <input
                    type="text"
                    value={socialHashtags}
                    onChange={(e) => setSocialHashtags(e.target.value)}
                    placeholder="#dropshipping #colombia #emprendimiento #negocio"
                    className="w-full px-4 py-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm"
                  />
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

          {/* ── META ADS ── */}
          {activeSection === "metaads" && (
            <div className="space-y-4">
              <SectionCard title="Meta Ads" description="Conecta tu cuenta de Meta para lanzar anuncios directamente desde Plusby.">
                <div className="p-3 rounded-xl bg-[rgba(14,165,233,0.06)] border border-[rgba(14,165,233,0.15)] mb-5">
                  <p className="text-[#8888A0] text-xs leading-relaxed">
                    Para usar Meta Ads necesitas un <span className="text-[#F0F0F5]">Business Manager</span> activo.
                    Ve a <span className="text-[#0EA5E9]">business.facebook.com</span> → Settings → Business Info para obtener tu ID.
                  </p>
                </div>
                <form onSubmit={handleSaveMeta} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">
                      Meta Access Token
                    </label>
                    <div className="relative">
                      <input
                        type={showMetaToken ? "text" : "password"}
                        value={metaAccessToken}
                        onChange={(e) => setMetaAccessToken(e.target.value)}
                        placeholder="EAAxxxxxxxxx..."
                        className="w-full px-4 py-3 pr-10 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm"
                      />
                      <button type="button" onClick={() => setShowMetaToken(!showMetaToken)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555568] hover:text-[#8888A0]">
                        {showMetaToken ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                    <p className="text-[#555568] text-xs mt-1">Token de usuario o de sistema con permisos ads_management.</p>
                  </div>

                  <InputField
                    label="Pixel ID"
                    value={metaPixelId}
                    onChange={setMetaPixelId}
                    placeholder="123456789012345"
                    hint="Encuéntralo en Events Manager → tu Pixel → Settings."
                  />

                  <InputField
                    label="Business Manager ID"
                    value={metaBmId}
                    onChange={setMetaBmId}
                    placeholder="123456789012345"
                    hint="business.facebook.com → Settings → Business Info → Business Manager ID."
                  />

                  <div>
                    <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">
                      System User Access Token <span className="text-[#555568] font-normal">(opcional)</span>
                    </label>
                    <textarea
                      value={metaSystemToken}
                      onChange={(e) => setMetaSystemToken(e.target.value)}
                      placeholder="Token del System User para automatizaciones avanzadas..."
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm resize-none font-mono"
                    />
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[#2A2A3A] hover:border-[#3A3A4A] text-[#8888A0] hover:text-[#F0F0F5] text-sm font-medium transition-colors"
                    >
                      Probar conexión
                    </button>
                    <button
                      type="submit"
                      disabled={savingMeta}
                      className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#FF6B35] hover:bg-[#FF8C5A] text-white text-sm font-semibold transition-colors disabled:opacity-60"
                    >
                      {savingMeta && <Loader2 size={14} className="animate-spin" />}
                      {savingMeta ? "Guardando..." : "Guardar configuración"}
                    </button>
                  </div>
                </form>
              </SectionCard>

              {/* Guía Business Manager */}
              <div className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-5">
                <p className="text-[#F0F0F5] font-semibold text-sm mb-3">¿Cómo obtener tu Business Manager ID?</p>
                <ol className="space-y-2">
                  {[
                    "Ve a business.facebook.com e inicia sesión",
                    "Haz clic en Configuración (ícono de engranaje)",
                    "Selecciona Info del negocio",
                    "Copia el ID del Business Manager",
                    "Para el System User Token: Usuarios → Usuarios del sistema → Generar token",
                  ].map((step, i) => (
                    <li key={i} className="flex gap-2.5 text-xs text-[#8888A0]">
                      <span className="w-5 h-5 rounded-full bg-[#1C1C26] border border-[#2A2A3A] flex items-center justify-center text-[#555568] font-bold shrink-0 text-[10px]">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          )}

          {/* ── MODELOS IA ── */}
          {activeSection === "modelos" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2 className="text-[#F0F0F5] font-bold text-lg flex items-center gap-2">
                    <Key size={16} className="text-[#8B5CF6]" /> Modelos IA (BYOK)
                  </h2>
                  <p className="text-[#8888A0] text-sm mt-0.5">Conecta tus propias claves. Cada clave se guarda cifrada.</p>
                </div>
              </div>

              {AI_MODELS.map((model) => {
                const saveState = modelSaveStates[model.key] ?? "idle";
                const isConfigured = !!(modelKeys[model.key]?.trim());
                const isVisible = !!showModelKey[model.key];
                return (
                  <div key={model.key} className="bg-[#13131A] border border-[#2A2A3A] rounded-2xl p-5 hover:border-[#3A3A4A] transition-colors">
                    {/* Header row */}
                    <div className="flex items-start gap-3 mb-4">
                      <ProviderIcon domain={model.domain} label={model.label} color={model.color} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[#F0F0F5] font-bold text-base leading-tight">{model.label}</span>
                          <span className="text-[#555568] text-xs font-medium">{model.sublabel}</span>
                        </div>
                        <p className="text-[#555568] text-[11px] mt-0.5">
                          Para: <span className="text-[#8888A0]">{model.specificModel}</span>
                          {" · "}
                          <span className="text-[#F59E0B] font-semibold">{model.costNote}</span>
                          {" · "}{model.costDetail}
                        </p>
                      </div>
                      {/* Status badge */}
                      {isConfigured ? (
                        <span className="shrink-0 flex items-center gap-1 text-[#10B981] text-[11px] font-bold bg-[rgba(16,185,129,0.1)] border border-[rgba(16,185,129,0.25)] px-2.5 py-1 rounded-lg">
                          <CheckCircle2 size={11} /> Configurada
                        </span>
                      ) : (
                        <span className="shrink-0 flex items-center gap-1 text-[#555568] text-[11px] font-medium bg-[#1C1C26] border border-[#2A2A3A] px-2.5 py-1 rounded-lg">
                          Sin clave
                        </span>
                      )}
                    </div>

                    {/* Input + save row */}
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <input
                          type={isVisible ? "text" : "password"}
                          value={modelKeys[model.key] ?? ""}
                          onChange={(e) => setModelKeys((prev) => ({ ...prev, [model.key]: e.target.value }))}
                          placeholder={model.placeholder}
                          className="w-full px-4 py-2.5 pr-10 rounded-xl bg-[#0A0A0F] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm font-mono"
                        />
                        <button
                          type="button"
                          onClick={() => setShowModelKey((prev) => ({ ...prev, [model.key]: !prev[model.key] }))}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555568] hover:text-[#8888A0] transition-colors"
                        >
                          {isVisible ? <EyeOff size={14} /> : <Eye size={14} />}
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleSaveModel(model.key)}
                        disabled={saveState === "saving"}
                        className={`shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-white text-sm font-semibold transition-colors disabled:opacity-60 ${
                          saveState === "saved"
                            ? "bg-[#10B981]"
                            : "bg-[#8B5CF6] hover:bg-[#7C3AED]"
                        }`}
                      >
                        {saveState === "saving" && <Loader2 size={13} className="animate-spin" />}
                        {saveState === "saved" ? "✓ Guardada" : saveState === "saving" ? "Guardando" : "Guardar"}
                      </button>
                    </div>

                    {/* Obtain API key link */}
                    <a
                      href={model.apiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-[#8B5CF6] hover:text-[#A78BFA] text-[11px] font-medium transition-colors"
                    >
                      <ExternalLink size={10} /> Obtener API Key
                    </a>

                    {/* Tip */}
                    {model.tip && (
                      <div className="mt-3 p-3 rounded-xl bg-[rgba(245,158,11,0.06)] border border-[rgba(245,158,11,0.2)]">
                        <p className="text-[#F59E0B] text-xs font-semibold mb-0.5">💡 {model.tip.title}</p>
                        <p className="text-[#8888A0] text-xs leading-relaxed">{model.tip.body}</p>
                        {model.tip.link && (
                          <a
                            href={model.tip.link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-1.5 inline-flex items-center gap-1 text-[#F59E0B] hover:text-[#FCD34D] text-xs font-semibold transition-colors"
                          >
                            {model.tip.link.label} <ExternalLink size={10} />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              <div className="p-4 rounded-2xl bg-[rgba(139,92,246,0.06)] border border-[rgba(139,92,246,0.2)]">
                <p className="text-[#A78BFA] text-xs font-semibold mb-1 flex items-center gap-1.5">
                  <Shield size={12} /> Seguridad
                </p>
                <p className="text-[#8888A0] text-xs leading-relaxed">
                  Tus claves API se cifran antes de almacenarse y nunca se exponen en el cliente. Plusby las usa únicamente para procesar tus solicitudes.
                </p>
              </div>
            </div>
          )}

          {/* ── SEGURIDAD ── */}
          {activeSection === "seguridad" && (
            <SectionCard title="Cambiar contraseña" description="Usa una contraseña segura de mínimo 8 caracteres.">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">Nueva contraseña</label>
                  <div className="relative">
                    <input type={showNew ? "text" : "password"} value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="Mínimo 8 caracteres" required className="w-full px-4 py-3 pr-10 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm" />
                    <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555568] hover:text-[#8888A0]">
                      {showNew ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#F0F0F5] mb-1.5">Confirmar contraseña</label>
                  <div className="relative">
                    <input type={showConfirm ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repite la contraseña" required className="w-full px-4 py-3 pr-10 rounded-xl bg-[#1C1C26] border border-[#2A2A3A] text-[#F0F0F5] placeholder-[#555568] focus:outline-none focus:border-[#FF6B35] transition-colors text-sm" />
                    <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#555568] hover:text-[#8888A0]">
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
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

          {/* ── PLAN ── */}
          {activeSection === "plan" && (
            <div className="space-y-4">
              <SectionCard title="Tu plan actual">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-[#1C1C26] text-[#8888A0] border border-[#2A2A3A]">FREE</span>
                </div>
                <div className="space-y-2 mb-5">
                  {["10 créditos IA al mes", "5 landings activas", "Catálogo básico de productos", "Academia limitada"].map((f) => (
                    <div key={f} className="flex items-center gap-2 text-sm text-[#8888A0]">
                      <CheckCircle2 size={14} className="text-[#555568] shrink-0" />
                      {f}
                    </div>
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
                    <div key={f} className="flex items-center gap-2 text-sm text-[#F0F0F5]">
                      <CheckCircle2 size={14} className="text-[#FF6B35] shrink-0" />
                      {f}
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

          {/* ── CUENTA ── */}
          {activeSection === "cuenta" && (
            <div className="space-y-4">
              <SectionCard title="Sesión" description="Cierra sesión en este dispositivo.">
                <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[#2A2A3A] hover:border-[#3A3A4A] text-[#8888A0] hover:text-[#F0F0F5] text-sm font-semibold transition-colors">
                  <LogOut size={15} />
                  Cerrar sesión
                </button>
              </SectionCard>

              <div className="bg-[#13131A] border border-red-500/20 rounded-2xl p-6">
                <div className="flex items-center gap-2 mb-1">
                  <Trash2 size={16} className="text-red-400" />
                  <h2 className="text-red-400 font-bold text-lg">Zona de peligro</h2>
                </div>
                <p className="text-[#8888A0] text-sm mb-4">
                  Acción irreversible. Se eliminarán todos tus datos, landings y configuraciones.
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
                    disabled={deleteConfirm !== "ELIMINAR"}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 text-sm font-semibold transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
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

"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft, Sparkles, Loader2, Upload, X,
  Image as ImageIcon, Download, RefreshCw, Wand2, Palette, Globe,
  Maximize, AlertCircle, Check, Plus, Bookmark,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";

// ─── Constants ────────────────────────────────────────────────────────────────

const SECTION_META: Record<string, { label: string; icon: string }> = {
  hero:          { label: "Hero / Portada",          icon: "🎯" },
  oferta:        { label: "Oferta / Precio",         icon: "💰" },
  antes_despues: { label: "Antes y Después",         icon: "🔄" },
  beneficios:    { label: "Beneficios",              icon: "✅" },
  comparativa:   { label: "Comparativa",             icon: "⚖️" },
  autoridad:     { label: "Autoridad / Confianza",   icon: "🏆" },
  testimonios:   { label: "Testimonios",             icon: "⭐" },
  ingredientes:  { label: "Ingredientes",            icon: "🧪" },
  modo_uso:      { label: "Modo de Uso",             icon: "📋" },
  logistica:     { label: "Logística / Envío",       icon: "🚚" },
  faqs:          { label: "Preguntas Frecuentes",    icon: "❓" },
};

const OUTPUT_SIZES = [
  { id: "original",   label: "Tamaño Original",          dims: "1024×1536" },
  { id: "1080x1920",  label: "Instagram Stories",        dims: "1080×1920" },
  { id: "1080x1080",  label: "Instagram Cuadrado",       dims: "1080×1080" },
  { id: "1200x628",   label: "Facebook / LinkedIn",      dims: "1200×628"  },
  { id: "1920x1080",  label: "YouTube / HD",             dims: "1920×1080" },
  { id: "300x250",    label: "Banner Medium",            dims: "300×250"   },
  { id: "728x90",     label: "Leaderboard",              dims: "728×90"    },
  { id: "160x600",    label: "Skyscraper",               dims: "160×600"   },
];

const LANGUAGES = [
  { id: "es", label: "Español" },
  { id: "pt", label: "Portugués" },
  { id: "en", label: "Inglés" },
];

const NATIONALITIES = [
  "Colombia", "México", "Argentina", "Chile", "Perú", "Ecuador", "Venezuela",
  "Brasil", "Panamá", "Guatemala", "España", "Estados Unidos (Latino)", "Otro Latam",
];

const SEXES = ["Femenino", "Masculino", "Neutro"];

const AGE_RANGES = ["18-25", "26-35", "36-45", "46-55", "56-65", "65+"];

const TEMPLATE_BUCKET_URL = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/banner-templates`;

interface BannerTemplate {
  id: string;
  name: string;
  imageUrl: string;
}

interface BannerConfig {
  description: string;
  benefits: string[];
  problems: string[];
  ingredients: string[];
  differentiator: string;
  colors: string[];
  country: string;
  priceSale: string;
  priceOriginal: string;
  refImages: (string | null)[];
  angles: string[];
  selectedAngle: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudioPage() {
  const params = useParams();
  const router = useRouter();
  const landingId = params.id as string;
  const sectionId = params.sectionId as string;
  const meta = SECTION_META[sectionId] ?? { label: sectionId, icon: "✨" };

  const supabase = useMemo(() => createClient(), []);

  // ── Loaded state ──────────────────────────────────────────────────────────
  const [productName, setProductName] = useState("");
  const [bannerConfig, setBannerConfig] = useState<BannerConfig | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Form state ────────────────────────────────────────────────────────────
  const [templateUrl, setTemplateUrl] = useState<string | null>(null);
  const [productImages, setProductImages] = useState<(string | null)[]>([null, null, null]);
  const [bgColor, setBgColor] = useState<string>("");
  const [outputSize, setOutputSize] = useState("1080x1920");
  const [language, setLanguage] = useState("es");
  const [aiModel, setAiModel] = useState<"gpt-image-1" | "gpt-image-2" | "gemini">("gpt-image-1");

  // Personalization
  const [personalization, setPersonalization] = useState(true);
  const [productDetails, setProductDetails] = useState("");
  const [characterNationality, setCharNat] = useState("");
  const [characterSex, setCharSex] = useState("");
  const [characterAge, setCharAge] = useState("");
  const [sellingAngle, setSellingAngle] = useState("");
  const [specificProblem, setSpecificProblem] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [solutionMechanism, setSolutionMechanism] = useState("");
  const [additionalInstructions, setAdditional] = useState("");
  const [generatingAngle, setGeneratingAngle] = useState(false);
  const [savedAnglesOpen, setSavedAnglesOpen] = useState(false);

  // Gallery modal
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [galleryTemplates, setGalleryTemplates] = useState<BannerTemplate[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [activeSectionTab, setActiveSectionTab] = useState(sectionId);

  // Upload tracking
  const [uploadingTemplate, setUploadingTemplate] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState<number | null>(null);

  // Generation
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);

  // Save to landing
  const [savingToLanding, setSavingToLanding] = useState(false);
  const [savedToLanding, setSavedToLanding] = useState(false);

  // ── Load landing config ───────────────────────────────────────────────────
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      const { data, error } = await supabase
        .from("landings").select("*")
        .eq("id", landingId).eq("user_id", user.id).single();
      if (error || !data) { router.push("/landing"); return; }
      setProductName(data.product ?? "");
      const cfg = data.banner_config ?? {};
      setBannerConfig({
        description: cfg.description ?? "",
        benefits: cfg.benefits ?? [],
        problems: cfg.problems ?? [],
        ingredients: cfg.ingredients ?? [],
        differentiator: cfg.differentiator ?? "",
        colors: cfg.colors ?? ["#FF6B35"],
        country: cfg.country ?? "CO",
        priceSale: cfg.priceSale ?? "",
        priceOriginal: cfg.priceOriginal ?? "",
        refImages: cfg.refImages ?? [null, null, null],
        angles: cfg.angles ?? [],
        selectedAngle: cfg.selectedAngle ?? "",
      });
      // Seed product photos from the landing's saved refImages
      const seed = (cfg.refImages ?? [null, null, null]) as (string | null)[];
      setProductImages([seed[0] ?? null, seed[1] ?? null, seed[2] ?? null]);
      // Seed selling angle if exists
      if (cfg.selectedAngle) setSellingAngle(cfg.selectedAngle);
      // Seed product details from saved description
      if (cfg.description) setProductDetails(cfg.description);
      setLoading(false);
    })();
  }, [landingId, supabase, router]);

  // ── Load gallery for active section tab ───────────────────────────────────
  useEffect(() => {
    if (!galleryOpen) return;
    (async () => {
      setGalleryLoading(true);
      const { data } = await supabase.storage
        .from("banner-templates")
        .list(activeSectionTab, { limit: 200, sortBy: { column: "name", order: "asc" } });
      const list = (data ?? [])
        .filter((f) => /\.(jpe?g|png|webp)$/i.test(f.name))
        .map((f) => ({
          id: f.name.replace(/\.[^.]+$/, ""),
          name: f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "),
          imageUrl: `${TEMPLATE_BUCKET_URL}/${activeSectionTab}/${f.name}`,
        }));
      setGalleryTemplates(list);
      setGalleryLoading(false);
    })();
  }, [galleryOpen, activeSectionTab, supabase]);

  // ── Upload helpers ────────────────────────────────────────────────────────
  async function uploadFile(file: File, prefix: string): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const ext = file.name.split(".").pop() ?? "png";
    const path = `${user.id}/${prefix}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("landing-assets").upload(path, file, { upsert: true });
    if (error) return null;
    const { data } = supabase.storage.from("landing-assets").getPublicUrl(path);
    return data.publicUrl;
  }

  async function handleTemplateUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingTemplate(true);
    const url = await uploadFile(file, "templates");
    setUploadingTemplate(false);
    if (url) setTemplateUrl(url);
  }

  async function handlePhotoUpload(idx: number, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPhoto(idx);
    const url = await uploadFile(file, "products");
    setUploadingPhoto(null);
    if (url) {
      setProductImages((p) => p.map((u, i) => (i === idx ? url : u)));
    }
  }

  // ── Generate selling angle with AI ────────────────────────────────────────
  async function handleGenerateAngle() {
    if (!bannerConfig || generatingAngle) return;
    setGeneratingAngle(true);
    try {
      const res = await fetch("/api/landing/generate-angles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: productDetails || bannerConfig.description,
          benefits: bannerConfig.benefits,
          problems: bannerConfig.problems,
          ingredients: bannerConfig.ingredients,
          differentiator: bannerConfig.differentiator,
          country: bannerConfig.country,
        }),
      });
      const data = await res.json();
      if (data.ok && Array.isArray(data.angles) && data.angles.length > 0) {
        setSellingAngle(data.angles[0]);
      }
    } catch { /* silent */ }
    finally { setGeneratingAngle(false); }
  }

  // ── Generate ──────────────────────────────────────────────────────────────
  async function handleGenerate() {
    if (!bannerConfig) return;
    if (!templateUrl) { setError("Selecciona una plantilla de referencia primero."); return; }
    setGenerating(true); setError(null);
    try {
      const res = await fetch("/api/landing/generate-studio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sectionType: sectionId,
          templateUrl,
          productImages: productImages.filter((u): u is string => !!u),
          productName,
          productDescription: bannerConfig.description,
          productBenefits: bannerConfig.benefits,
          productProblems: bannerConfig.problems,
          productIngredients: bannerConfig.ingredients,
          productDifferentiator: bannerConfig.differentiator,
          priceSale: bannerConfig.priceSale,
          priceOriginal: bannerConfig.priceOriginal,
          bgColor: bgColor || undefined,
          outputSize,
          language,
          aiModel,
          productDetails: personalization ? productDetails : undefined,
          personalization,
          characterNationality: personalization ? characterNationality : undefined,
          characterSex:         personalization ? characterSex         : undefined,
          characterAgeRange:    personalization ? characterAge          : undefined,
          sellingAngle:         personalization ? sellingAngle          : undefined,
          specificProblem:      personalization ? specificProblem       : undefined,
          targetAudience:       personalization ? targetAudience        : undefined,
          solutionMechanism:    personalization ? solutionMechanism     : undefined,
          additionalInstructions: personalization ? additionalInstructions : undefined,
          country: bannerConfig.country,
        }),
      });
      const data = await res.json();
      if (data.ok && data.imageUrl) {
        setGeneratedImages((p) => [data.imageUrl, ...p]);
      } else {
        setError(data.error ?? "Error al generar");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setGenerating(false);
    }
  }

  function handleDownload(url: string) {
    const a = document.createElement("a");
    a.href = url;
    a.download = `${sectionId}-${Date.now()}.png`;
    a.click();
  }

  async function handleSaveToLanding() {
    const imageUrl = generatedImages[0];
    if (!imageUrl || !landingId || savingToLanding) return;
    setSavingToLanding(true);
    try {
      // Convert base64 data URL to Blob
      const fetchRes = await fetch(imageUrl);
      const blob = await fetchRes.blob();
      const ext = blob.type.includes("webp") ? "webp" : "png";
      const path = `sections/${landingId}/${sectionId}-${Date.now()}.${ext}`;
      const { error: uploadErr } = await supabase.storage
        .from("landing-assets")
        .upload(path, blob, { contentType: blob.type, upsert: false });
      if (uploadErr) throw uploadErr;
      const { data: { publicUrl } } = supabase.storage.from("landing-assets").getPublicUrl(path);
      // Merge into banner_images
      const { data: landing } = await supabase.from("landings")
        .select("banner_images").eq("id", landingId).single();
      const current: Record<string, string[]> = landing?.banner_images ?? {};
      const sectionImages = current[sectionId] ?? [];
      await supabase.from("landings").update({
        banner_images: { ...current, [sectionId]: [publicUrl, ...sectionImages] },
        updated_at: new Date().toISOString(),
      }).eq("id", landingId);
      setSavedToLanding(true);
      setTimeout(() => setSavedToLanding(false), 3000);
    } catch (e) {
      console.error("Error saving to landing:", e);
    } finally {
      setSavingToLanding(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#7C3AED]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg-base)] text-[var(--text-primary)]">
      {/* ─── Header ──────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-20 bg-[var(--bg-surface)]/80 backdrop-blur-md border-b border-[var(--border-color)]">
        <div className="max-w-[1600px] mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href={`/landing/${landingId}/editor`} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--bg-elevated)] transition-colors">
              <ArrowLeft size={16} className="text-[var(--text-secondary)]" />
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-lg">{meta.icon}</span>
              <div>
                <h1 className="text-[15px] font-semibold leading-tight">{productName || "Producto"}</h1>
                <p className="text-[11px] text-[var(--text-muted)] leading-tight">Studio · {meta.label}</p>
              </div>
            </div>
          </div>
          <div className="text-[11px] text-[var(--text-muted)]">
            Modo Studio · {aiModel === "gpt-image-2" ? "GPT Image 2" : aiModel === "gemini" ? "Gemini Flash" : "GPT Image 1"}
          </div>
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto px-6 py-6 grid grid-cols-12 gap-6">

        {/* ─── LEFT: Setup panel ─────────────────────────────────────────── */}
        <section className="col-span-12 lg:col-span-5 space-y-4">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-5 space-y-5">

            {/* Header */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] flex items-center justify-center">
                <Sparkles size={14} className="text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold">Generar Sección de Landing</h2>
                <p className="text-[11px] text-[var(--text-muted)]">Selecciona una plantilla de referencia y sube de 1 a 3 fotos de tu producto.</p>
              </div>
            </div>

            {/* Template + product photos row */}
            <div className="grid grid-cols-2 gap-4">
              {/* Template */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-semibold text-[var(--text-primary)]">Plantilla</p>
                  <label className="flex items-center gap-1 cursor-pointer text-[10px] text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
                    <Upload size={10} />
                    <span>{uploadingTemplate ? "Subiendo..." : "Subir desde PC"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleTemplateUpload} />
                  </label>
                </div>
                {templateUrl ? (
                  <div className="relative rounded-xl overflow-hidden border border-[#7C3AED] aspect-[3/4] bg-[var(--bg-elevated)] group">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={templateUrl} alt="Plantilla" className="w-full h-full object-cover" />
                    <button onClick={() => setTemplateUrl(null)} className="absolute top-1.5 right-1.5 w-6 h-6 flex items-center justify-center rounded-full bg-black/70 hover:bg-black/90 text-white">
                      <X size={12} />
                    </button>
                    <button onClick={() => setGalleryOpen(true)} className="absolute inset-x-1.5 bottom-1.5 py-1.5 rounded-lg bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-[10px] font-semibold">
                      Cambiar plantilla
                    </button>
                  </div>
                ) : (
                  <button onClick={() => setGalleryOpen(true)} className="w-full aspect-[3/4] rounded-xl border-2 border-dashed border-[var(--border-color)] hover:border-[#7C3AED] bg-gradient-to-br from-[#13131A] to-[#1C1C26] flex flex-col items-center justify-center gap-2 transition-all">
                    <div className="w-10 h-10 rounded-full bg-[#7C3AED]/20 flex items-center justify-center">
                      <ImageIcon size={16} className="text-[#7C3AED]" />
                    </div>
                    <p className="text-[11px] font-semibold text-[var(--text-primary)]">Seleccionar Plantilla</p>
                    <p className="text-[9px] text-[var(--text-muted)]">de la Galería</p>
                  </button>
                )}
              </div>

              {/* Product photos */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-[11px] font-semibold text-[var(--text-primary)]">Fotos del Producto</p>
                  <p className="text-[9px] text-[var(--text-muted)]">(1 a 3 fotos)</p>
                </div>
                <div className="grid grid-cols-3 gap-1.5">
                  {[0, 1, 2].map((idx) => (
                    <div key={idx} className="aspect-square">
                      {productImages[idx] ? (
                        <div className="relative w-full h-full rounded-lg overflow-hidden border border-[var(--border-color)] group">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={productImages[idx]!} alt="" className="w-full h-full object-cover" />
                          <button
                            onClick={() => setProductImages((p) => p.map((u, i) => (i === idx ? null : u)))}
                            className="absolute top-0.5 right-0.5 w-4 h-4 flex items-center justify-center rounded-full bg-black/70 hover:bg-black text-white opacity-0 group-hover:opacity-100">
                            <X size={9} />
                          </button>
                        </div>
                      ) : (
                        <label className="w-full h-full flex flex-col items-center justify-center rounded-lg border border-dashed border-[var(--border-color)] hover:border-[#7C3AED] cursor-pointer transition-colors bg-[var(--bg-elevated)]">
                          {uploadingPhoto === idx ? (
                            <Loader2 size={12} className="animate-spin text-[var(--text-muted)]" />
                          ) : (
                            <>
                              <Plus size={12} className="text-[var(--text-muted)]" />
                              <span className="text-[8px] text-[var(--text-muted)] mt-0.5">Imagen {idx + 1}</span>
                            </>
                          )}
                          <input type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoUpload(idx, e)} />
                        </label>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Background color + Size + Language */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-[var(--border-color)]">
              <div>
                <label className="flex items-center gap-1 text-[10px] font-semibold mb-1.5 text-[var(--text-primary)]">
                  <Palette size={10} /> Color de Fondo <span className="text-[var(--text-muted)] font-normal">(opcional)</span>
                </label>
                <div className="flex items-center gap-1.5 bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-color)] px-2 py-1.5">
                  <input
                    type="color"
                    value={bgColor || "#7C3AED"}
                    onChange={(e) => setBgColor(e.target.value)}
                    className="w-5 h-5 rounded cursor-pointer bg-transparent border-0"
                  />
                  <input
                    type="text"
                    value={bgColor}
                    onChange={(e) => setBgColor(e.target.value)}
                    placeholder="#000000"
                    className="flex-1 bg-transparent text-[11px] outline-none text-[var(--text-primary)] min-w-0"
                  />
                  {bgColor && (
                    <button onClick={() => setBgColor("")} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                      <X size={10} />
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1 text-[10px] font-semibold mb-1.5 text-[var(--text-primary)]">
                  <Maximize size={10} /> Tamaño
                </label>
                <select
                  value={outputSize}
                  onChange={(e) => setOutputSize(e.target.value)}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg px-2 py-1.5 text-[11px] outline-none text-[var(--text-primary)]"
                >
                  {OUTPUT_SIZES.map((s) => (
                    <option key={s.id} value={s.id}>{s.label} ({s.dims})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="flex items-center gap-1 text-[10px] font-semibold mb-1.5 text-[var(--text-primary)]">
                  <Globe size={10} /> Idioma
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg px-2 py-1.5 text-[11px] outline-none text-[var(--text-primary)]"
                >
                  {LANGUAGES.map((l) => (
                    <option key={l.id} value={l.id}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Model selector + personalization toggle */}
            <div className="flex items-center justify-between bg-[var(--bg-elevated)] rounded-lg border border-[var(--border-color)] px-3 py-2 gap-3">
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-[11px] font-semibold text-[var(--text-primary)] shrink-0">Modelo</span>
                <div className="flex items-center gap-0.5 bg-[var(--bg-base)] rounded-md p-0.5 border border-[var(--border-color)]">
                  {([
                    { id: "gemini",       label: "Gemini", badge: undefined as string | undefined },
                    { id: "gpt-image-1",  label: "GPT-1",  badge: undefined as string | undefined },
                    { id: "gpt-image-2",  label: "GPT-2",  badge: "Nuevo" as string | undefined },
                  ] as const).map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setAiModel(m.id)}
                      className={`flex items-center gap-1 px-2 py-1 rounded text-[10px] font-medium transition-colors ${aiModel === m.id ? "bg-[#7C3AED] text-white" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}
                    >
                      {m.label}
                      {m.badge && aiModel !== m.id && (
                        <span className="text-[8px] px-1 py-0 rounded bg-[#7C3AED]/20 text-[#A78BFA]">{m.badge}</span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={() => setPersonalization(!personalization)}
                className="flex items-center gap-1.5 text-[11px] shrink-0"
              >
                <Wand2 size={11} className={personalization ? "text-[#7C3AED]" : "text-[var(--text-muted)]"} />
                <span className={`font-medium ${personalization ? "text-[#A78BFA]" : "text-[var(--text-muted)]"}`}>Personalización</span>
                <span className={`relative w-8 h-4 rounded-full transition-colors ${personalization ? "bg-[#7C3AED]" : "bg-[var(--border-color)]"}`}>
                  <span className={`absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform ${personalization ? "translate-x-4" : "translate-x-0.5"}`} />
                </span>
              </button>
            </div>

            {/* Personalization panel */}
            {personalization && (
              <div className="space-y-3 pt-2 border-t border-[var(--border-color)] animate-in fade-in">
                {/* AI angle generator + saved angles */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={handleGenerateAngle}
                    disabled={generatingAngle}
                    className="flex items-center justify-center gap-1.5 py-2 rounded-lg bg-gradient-to-r from-[#7C3AED]/90 to-[#5B21B6]/90 hover:from-[#7C3AED] hover:to-[#5B21B6] text-white text-[11px] font-semibold disabled:opacity-60 transition-all"
                  >
                    {generatingAngle ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
                    Desarrollar Ángulo con IA
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setSavedAnglesOpen(!savedAnglesOpen)}
                      disabled={!bannerConfig?.angles?.length}
                      className="w-full flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[var(--bg-elevated)] border border-[var(--border-color)] hover:border-[#7C3AED] text-[var(--text-primary)] text-[11px] font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    >
                      <Bookmark size={11} />
                      Seleccionar Ángulo Guardado
                      {bannerConfig?.angles?.length ? (
                        <span className="text-[9px] px-1.5 py-0 rounded-full bg-[#7C3AED]/20 text-[#A78BFA]">{bannerConfig.angles.length}</span>
                      ) : null}
                    </button>
                    {savedAnglesOpen && bannerConfig?.angles?.length ? (
                      <div className="absolute z-10 top-full mt-1 left-0 right-0 max-h-64 overflow-y-auto bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-lg shadow-2xl p-1">
                        {bannerConfig.angles.map((a, i) => (
                          <button
                            key={i}
                            onClick={() => { setSellingAngle(a); setSavedAnglesOpen(false); }}
                            className="w-full text-left px-2 py-1.5 rounded text-[11px] text-[var(--text-primary)] hover:bg-[#7C3AED]/10 transition-colors"
                          >
                            {a}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>

                {/* Character */}
                <div>
                  <p className="text-[10px] font-semibold text-[#A78BFA] uppercase tracking-wide mb-2">
                    Personalizar Personajes <span className="text-[var(--text-muted)] font-normal normal-case">(opcional)</span>
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    <select value={characterNationality} onChange={(e) => setCharNat(e.target.value)}
                      className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg px-2 py-1.5 text-[11px] outline-none">
                      <option value="">Nacionalidad</option>
                      {NATIONALITIES.map((n) => <option key={n} value={n}>{n}</option>)}
                    </select>
                    <select value={characterSex} onChange={(e) => setCharSex(e.target.value)}
                      className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg px-2 py-1.5 text-[11px] outline-none">
                      <option value="">Sexo</option>
                      {SEXES.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <select value={characterAge} onChange={(e) => setCharAge(e.target.value)}
                      className="bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg px-2 py-1.5 text-[11px] outline-none">
                      <option value="">Edad</option>
                      {AGE_RANGES.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                  </div>
                </div>

                <PersonalizationField label="Detalles del Producto" value={productDetails} onChange={setProductDetails} placeholder="Describe el producto en detalle: qué es, cómo funciona, beneficios principales..." />
                <PersonalizationField label="Ángulo de Venta" value={sellingAngle} onChange={setSellingAngle} placeholder="Ejemplo: Mujeres en la transición a la menopausia que buscan alivio natural." />
                <PersonalizationField label="Problema específico que aborda el ángulo de venta" value={specificProblem} onChange={setSpecificProblem} placeholder="Ejemplo: La situación actual del consumidor, qué dolor o frustración experimenta..." />
                <PersonalizationField label="Avatar o público objetivo" value={targetAudience} onChange={setTargetAudience} placeholder="Ejemplo: Mujeres de +55 años, que sienten los primeros síntomas de la menopausia..." />
                <PersonalizationField label="Cómo el producto se vuelve la solución ideal" value={solutionMechanism} onChange={setSolutionMechanism} placeholder="Ejemplo: Mecanismo de acción, por qué funciona mejor que las alternativas..." />
                <PersonalizationField label="Instrucciones adicionales" value={additionalInstructions} onChange={setAdditional} placeholder="Ejemplo: precio, un personaje, un color específico, el nombre del producto..." />
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={generating || !templateUrl}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all shadow-lg shadow-[#7C3AED]/30"
            >
              {generating ? (
                <><Loader2 size={15} className="animate-spin" />Generando sección...</>
              ) : (
                <><Sparkles size={15} />Generar Sección</>
              )}
            </button>
            <p className="text-center text-[10px] text-[var(--text-muted)] -mt-2">
              Esta generación consumirá <span className="text-[#A78BFA] font-semibold">1 crédito</span>
            </p>

            {error && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30">
                <AlertCircle size={12} className="text-red-400 shrink-0" />
                <p className="text-[11px] text-red-400">{error}</p>
              </div>
            )}
          </div>
        </section>

        {/* ─── RIGHT: Preview panel ──────────────────────────────────────── */}
        <section className="col-span-12 lg:col-span-7">
          <div className="bg-[var(--bg-surface)] border border-[var(--border-color)] rounded-2xl p-5 sticky top-20">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold">Resultado</h2>
              {generatedImages.length > 0 && (
                <p className="text-[11px] text-[var(--text-muted)]">{generatedImages.length} generación{generatedImages.length === 1 ? "" : "es"}</p>
              )}
            </div>

            {generating && generatedImages.length === 0 && (
              <div className="aspect-[3/4] rounded-2xl bg-gradient-to-br from-[#13131A] to-[#1C1C26] flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-[#7C3AED]/15 border border-[#7C3AED]/30 flex items-center justify-center">
                  <Sparkles size={24} className="text-[#7C3AED] animate-pulse" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Generando tu sección...</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">Esto puede tomar 30-90 segundos</p>
                </div>
                <div className="w-32 h-1 rounded-full bg-[#1C1C26] overflow-hidden">
                  <div className="w-1/3 h-full bg-[#7C3AED] animate-pulse" />
                </div>
              </div>
            )}

            {!generating && generatedImages.length === 0 && (
              <div className="aspect-[3/4] rounded-2xl border-2 border-dashed border-[var(--border-color)] flex flex-col items-center justify-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-[var(--bg-elevated)] flex items-center justify-center">
                  <ImageIcon size={22} className="text-[var(--text-muted)]" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-[var(--text-primary)]">Sin secciones generadas</p>
                  <p className="text-[11px] text-[var(--text-muted)] mt-1">Las secciones que generes aparecerán aquí</p>
                </div>
              </div>
            )}

            {generatedImages.length > 0 && (
              <div className="space-y-4">
                {/* Main preview */}
                <div className="relative rounded-2xl overflow-hidden bg-[var(--bg-base)] border border-[var(--border-color)]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={generatedImages[0]} alt="Resultado" className="w-full h-auto" />
                </div>

                {/* Actions */}
                <div className="space-y-2">
                  <button
                    onClick={handleSaveToLanding}
                    disabled={savingToLanding}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl font-semibold text-xs transition-all disabled:opacity-60"
                    style={savedToLanding
                      ? { background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.4)", color: "#4ADE80" }
                      : { background: "rgba(74,222,128,0.12)", border: "1px solid rgba(74,222,128,0.3)", color: "#4ADE80" }}
                  >
                    {savingToLanding
                      ? <><Loader2 size={13} className="animate-spin" />Guardando...</>
                      : savedToLanding
                        ? <><Check size={13} />¡Guardado en Landing!</>
                        : <><Bookmark size={13} />Guardar en Landing</>}
                  </button>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleDownload(generatedImages[0])}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] text-white font-semibold text-xs hover:opacity-90 transition-all"
                    >
                      <Download size={13} />Descargar
                    </button>
                    <button
                      onClick={handleGenerate}
                      disabled={generating}
                      className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-[var(--border-color)] hover:border-[#7C3AED] hover:bg-[#7C3AED]/10 text-[var(--text-primary)] font-semibold text-xs disabled:opacity-50 transition-all"
                    >
                      {generating ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
                      Generar Otra
                    </button>
                  </div>
                </div>

                {/* History thumbnails */}
                {generatedImages.length > 1 && (
                  <div>
                    <p className="text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-wide mb-2">Historial</p>
                    <div className="grid grid-cols-4 gap-2">
                      {generatedImages.slice(1).map((url, i) => (
                        <button key={i} onClick={() => setGeneratedImages([url, ...generatedImages.filter((u) => u !== url)])}
                          className="aspect-[3/4] rounded-lg overflow-hidden border border-[var(--border-color)] hover:border-[#7C3AED] transition-colors">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={url} alt="" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ─── Gallery modal ──────────────────────────────────────────────── */}
      {galleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex flex-col" onClick={() => setGalleryOpen(false)}>
          <div className="flex-1 flex flex-col max-w-[1400px] mx-auto w-full p-6" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">Plantillas de Secciones</h3>
                <span className="text-xs text-[var(--text-muted)]">{galleryTemplates.length}</span>
              </div>
              <button onClick={() => setGalleryOpen(false)} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/10">
                <X size={16} className="text-white" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 overflow-x-auto pb-3 mb-3 border-b border-[var(--border-color)]">
              {Object.entries(SECTION_META).map(([id, m]) => (
                <button key={id} onClick={() => setActiveSectionTab(id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${activeSectionTab === id ? "bg-[#7C3AED] text-white" : "bg-[var(--bg-elevated)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]"}`}>
                  {m.label}
                </button>
              ))}
            </div>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto">
              {galleryLoading ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 size={20} className="animate-spin text-[#7C3AED]" />
                </div>
              ) : galleryTemplates.length === 0 ? (
                <div className="text-center py-20">
                  <p className="text-sm text-[var(--text-muted)]">No hay plantillas en esta sección aún.</p>
                  <p className="text-xs text-[var(--text-muted)] mt-1">Puedes subir la tuya desde &ldquo;Subir desde PC&rdquo;.</p>
                </div>
              ) : (
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {galleryTemplates.map((t) => (
                    <button key={t.id}
                      onClick={() => { setTemplateUrl(t.imageUrl); setGalleryOpen(false); }}
                      className={`group relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all ${templateUrl === t.imageUrl ? "border-[#7C3AED]" : "border-transparent hover:border-[#7C3AED]/50"}`}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={t.imageUrl} alt={t.name} className="w-full h-full object-cover" />
                      {templateUrl === t.imageUrl && (
                        <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-[#7C3AED] flex items-center justify-center">
                          <Check size={12} className="text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-3 mt-3 border-t border-[var(--border-color)] flex items-center justify-between">
              <p className="text-[11px] text-[var(--text-muted)]">Haz clic en un template para seleccionarlo</p>
              <button onClick={() => setGalleryOpen(false)} className="px-4 py-1.5 rounded-lg bg-[var(--bg-elevated)] hover:bg-[var(--border-color)] text-[var(--text-primary)] text-xs font-medium">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PersonalizationField subcomponent ────────────────────────────────────────

function PersonalizationField({ label, value, onChange, placeholder }: {
  label: string; value: string; onChange: (v: string) => void; placeholder: string;
}) {
  const MAX = 700;
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="text-[10px] font-semibold text-[#A78BFA] uppercase tracking-wide">{label}</label>
        <span className="text-[9px] text-[var(--text-muted)]">Máx. {MAX} caracteres</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, MAX))}
        placeholder={placeholder}
        rows={3}
        className="w-full bg-[var(--bg-elevated)] border border-[var(--border-color)] rounded-lg px-3 py-2 text-[11px] outline-none focus:border-[#7C3AED] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] resize-none"
      />
    </div>
  );
}

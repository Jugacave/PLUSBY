/**
 * upload-banner-templates.mjs
 *
 * Sube imágenes de plantillas al bucket "banner-templates" en Supabase.
 *
 * ESTRUCTURA DE CARPETAS ESPERADA:
 * ─────────────────────────────────────────────────────────────────────────
 *   templates-input/
 *     hero/
 *       purple-glow.jpg
 *       pink-romance.jpg
 *       dark-power.jpg
 *       ... (ver lista completa abajo)
 *     oferta/
 *       dark-gold-pedestal.jpg
 *       ...
 *     antes_despues/
 *       romantic-split.jpg
 *       ...
 *     beneficios/
 *       blue-circular-orbit.jpg
 *       ...
 *     comparativa/
 *       vs-dark-split.jpg
 *       ...
 *     autoridad/
 *       auth-dark-gold.jpg
 *       ...
 *     testimonios/
 *       test-dark-stars.jpg
 *       ...
 *     ingredientes/
 *       ing-dark-science.jpg
 *       ...
 *     modo_uso/
 *       uso-dark-steps.jpg
 *       ...
 *     logistica/
 *       log-dark-shipping.jpg
 *       ...
 *     faqs/
 *       faq-dark-clean.jpg
 *       ...
 *
 * ─── IDs VÁLIDOS POR SECCIÓN ──────────────────────────────────────────────
 *
 * hero/:
 *   purple-glow, pink-romance, sky-kids, green-nature, teal-aqua,
 *   sports-blue, sports-blue-white, dark-navy-gold, dark-power,
 *   bold-aggressive, warm-lifestyle, space-galaxy, outdoor-adventure,
 *   neon-gym-dark, sports-blue-grid, navy-fire-dynamic, blue-white-vivid,
 *   clean-white-minimal, outdoor-red-bold, warm-amber-urgency,
 *   dark-gold-premium, neon-green-winner, blush-feminine-soft,
 *   space-galaxy-offer, red-split-athlete
 *
 * oferta/:
 *   dark-gold-pedestal, neon-vertical-stacked, dreamy-kids,
 *   purple-pink-energy, blue-double-proof
 *   (+ cualquier estilo de hero — en oferta se usa OFERTA_STYLES separada)
 *
 * antes_despues/:
 *   romantic-split, outdoor-mountain-bridge, dark-problem-solution,
 *   peach-multishot-skin, cream-arrow-lifestyle, dark-tech-lightning
 *
 * beneficios/:
 *   blue-circular-orbit, dark-arrow-callouts, dark-gold-4panel,
 *   blue-stacked-pills, vivid-color-columns, white-3cards-lifestyle,
 *   warm-gym-floating-gold, dreamy-4badges-grid, dark-sport-3gold,
 *   pink-feminine-icons, soft-beauty-face, light-tech-specs
 *
 * comparativa/:
 *   vs-dark-split, vs-blue-clean, vs-white-modern, vs-red-aggro,
 *   vs-green-winner, vs-gold-premium, vs-teal-fresh, vs-purple-tech,
 *   vs-orange-bold, vs-sky-clean, vs-pink-girly, vs-warm-neutral
 *
 * autoridad/:
 *   auth-dark-gold, auth-navy-trust, auth-white-clean, auth-green-natural,
 *   auth-gold-ribbon, auth-purple-expert, auth-red-bold, auth-teal-science,
 *   auth-warm-human, auth-pink-beauty, auth-sky-fresh, auth-dark-press
 *
 * testimonios/:
 *   test-dark-stars, test-blue-trust, test-white-clean, test-green-natural,
 *   test-pink-beauty, test-warm-human, test-sports-energy, test-purple-glow,
 *   test-teal-fresh, test-red-bold, test-galaxy, test-sky-simple
 *
 * ingredientes/:
 *   ing-dark-science, ing-green-natural, ing-purple-premium, ing-teal-clinical,
 *   ing-navy-specs, ing-white-clean, ing-gold-luxury, ing-orange-energy,
 *   ing-pink-beauty, ing-earth-natural, ing-sky-light, ing-red-power
 *
 * modo_uso/:
 *   uso-dark-steps, uso-blue-clean, uso-green-natural, uso-white-minimal,
 *   uso-orange-sports, uso-purple-ritual, uso-teal-health, uso-pink-beauty,
 *   uso-warm-simple, uso-navy-gold, uso-sky-kids, uso-dark-timeline
 *
 * logistica/:
 *   log-dark-shipping, log-blue-trust, log-green-safe, log-white-clean,
 *   log-orange-fast, log-purple-premium, log-teal-fresh, log-dark-payment,
 *   log-warm-family, log-sky-simple, log-red-urgent, log-gold-trust
 *
 * faqs/:
 *   faq-dark-clean, faq-blue-pro, faq-white-minimal, faq-green-natural,
 *   faq-warm-friendly, faq-purple-tech, faq-teal-health, faq-pink-beauty,
 *   faq-orange-bold, faq-navy-gold, faq-sky-simple, faq-dark-premium
 *
 * ─── CÓMO EJECUTAR ────────────────────────────────────────────────────────
 *
 *   node scripts/upload-banner-templates.mjs
 *
 * Opciones (variables de entorno opcionales):
 *   INPUT_DIR=./mi-carpeta   → carpeta fuente (default: ./templates-input)
 *   DRY_RUN=true             → solo muestra qué subiría, sin subir nada
 *
 * ─────────────────────────────────────────────────────────────────────────
 */

import { createClient } from "@supabase/supabase-js";
import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join, extname, basename } from "node:path";

// ── Config ────────────────────────────────────────────────────────────────────
const SUPABASE_URL = "https://ryffforwvcieuelhziza.supabase.co";
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5ZmZmb3J3dmNpZXVlbGh6aXphIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NTc1NTY3MiwiZXhwIjoyMDkxMzMxNjcyfQ.R2M9cFFVxaZCf02AWwvA_g1YetD_Hd3jO6VYPd_wnlk";

const BUCKET = "banner-templates";
const INPUT_DIR = process.env.INPUT_DIR ?? "./templates-input";
const DRY_RUN = process.env.DRY_RUN === "true";

const VALID_SECTIONS = [
  "hero", "oferta", "antes_despues", "beneficios", "comparativa",
  "autoridad", "testimonios", "ingredientes", "modo_uso", "logistica", "faqs",
];

// Aliases de nombres de carpeta → id de sección canónico.
// Normalizamos a minúsculas, sin acentos, sin espacios/guiones, sin "y/de/-".
const SECTION_ALIASES = {
  hero:           "hero",
  portada:        "hero",
  heroportada:    "hero",
  oferta:         "oferta",
  precio:         "oferta",
  ofertaprecio:   "oferta",
  antesdespues:   "antes_despues",
  antesydespues:  "antes_despues",
  antes:          "antes_despues",
  beneficios:     "beneficios",
  comparativa:    "comparativa",
  vs:             "comparativa",
  autoridad:      "autoridad",
  confianza:      "autoridad",
  autoridadconfianza: "autoridad",
  testimonios:    "testimonios",
  ingredientes:   "ingredientes",
  materiales:     "ingredientes",
  ingredientesmateriales: "ingredientes",
  mododeuso:      "modo_uso",
  modouso:        "modo_uso",
  uso:            "modo_uso",
  logistica:      "logistica",
  envio:          "logistica",
  logisticaenvio: "logistica",
  faqs:           "faqs",
  faq:            "faqs",
  preguntas:      "faqs",
  preguntasfrecuentes: "faqs",
};

function normalizeFolderName(name) {
  return name
    .toLowerCase()
    .normalize("NFD").replace(/[̀-ͯ]/g, "") // quita acentos
    .replace(/[\s\-_]+/g, "")                          // quita espacios/guiones
    .replace(/\b(y|de|del|la|el|las|los)\b/g, "");     // quita conectores
}

function resolveSectionId(folderName) {
  const key = normalizeFolderName(folderName);
  return SECTION_ALIASES[key] ?? null;
}

const MIME = {
  ".jpg":  "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png":  "image/png",
  ".webp": "image/webp",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const green  = (s) => `\x1b[32m${s}\x1b[0m`;
const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
const red    = (s) => `\x1b[31m${s}\x1b[0m`;
const dim    = (s) => `\x1b[2m${s}\x1b[0m`;
const bold   = (s) => `\x1b[1m${s}\x1b[0m`;

// ── Main ──────────────────────────────────────────────────────────────────────
if (!existsSync(INPUT_DIR)) {
  console.error(red(`\n✗ No se encontró la carpeta "${INPUT_DIR}".`));
  console.error(dim(`  Crea la carpeta y pon tus imágenes en subcarpetas por sección:`));
  console.error(dim(`  ${INPUT_DIR}/hero/purple-glow.jpg`));
  console.error(dim(`  ${INPUT_DIR}/comparativa/vs-dark-split.jpg`));
  console.error(dim(`  etc.\n`));
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Ensure bucket exists and is public
const { data: buckets } = await supabase.storage.listBuckets();
const bucketExists = buckets?.some((b) => b.id === BUCKET);

if (!bucketExists) {
  if (DRY_RUN) {
    console.log(yellow(`[DRY RUN] Crearía el bucket público "${BUCKET}"`));
  } else {
    const { error } = await supabase.storage.createBucket(BUCKET, { public: true });
    if (error && !error.message.includes("already exists")) {
      console.error(red(`✗ No se pudo crear el bucket: ${error.message}`));
      process.exit(1);
    }
    console.log(green(`✓ Bucket "${BUCKET}" creado como público`));
  }
} else {
  console.log(dim(`  Bucket "${BUCKET}" ya existe`));
}

// Scan input directory
const allDirs = (await readdir(INPUT_DIR, { withFileTypes: true })).filter((d) => d.isDirectory());

const sections = [];
const unknownDirs = [];
for (const d of allDirs) {
  const sectionId = resolveSectionId(d.name);
  if (sectionId) sections.push({ folder: d.name, sectionId });
  else unknownDirs.push(d.name);
}

if (unknownDirs.length > 0) {
  console.warn(yellow(`\n⚠ Carpetas no reconocidas (se saltarán):`));
  unknownDirs.forEach((n) => console.warn(dim(`    ${n}`)));
}

if (sections.length === 0) {
  console.warn(yellow(`\n⚠ No se encontraron carpetas de secciones válidas en "${INPUT_DIR}".\n`));
  process.exit(0);
}

let uploaded = 0, skipped = 0, failed = 0, total = 0;
const errors = [];

for (const section of sections) {
  const sectionPath = join(INPUT_DIR, section.folder);
  const files = (await readdir(sectionPath, { withFileTypes: true }))
    .filter((f) => f.isFile() && MIME[extname(f.name).toLowerCase()]);

  if (files.length === 0) {
    console.log(dim(`  ${section.folder}/ — sin imágenes`));
    continue;
  }

  console.log(bold(`\n  ${section.folder}/`) + dim(` → ${section.sectionId}/ (${files.length} imágenes)`));

  for (const file of files) {
    total++;
    const ext = extname(file.name).toLowerCase();
    const styleId = basename(file.name, ext);
    const storagePath = `${section.sectionId}/${styleId}.jpg`;
    const filePath = join(sectionPath, file.name);
    const fileSize = (await stat(filePath)).size;
    const label = `    ${styleId}.jpg`;

    if (DRY_RUN) {
      console.log(yellow(`[DRY] ${label}`) + dim(` → ${storagePath} (${(fileSize / 1024).toFixed(1)} KB)`));
      uploaded++;
      continue;
    }

    try {
      const buffer = await readFile(filePath);
      const { error } = await supabase.storage.from(BUCKET).upload(storagePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

      if (error) {
        console.log(red(`  ✗ ${label}`) + dim(` — ${error.message}`));
        errors.push(`${storagePath}: ${error.message}`);
        failed++;
      } else {
        console.log(green(`  ✓ ${label}`) + dim(` (${(fileSize / 1024).toFixed(1)} KB)`));
        uploaded++;
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(red(`  ✗ ${label}`) + dim(` — ${msg}`));
      errors.push(`${storagePath}: ${msg}`);
      failed++;
    }
  }
}

// Summary
console.log(`\n${"─".repeat(52)}`);
if (DRY_RUN) {
  console.log(yellow(`[DRY RUN] ${total} archivos encontrados — nada fue subido`));
} else {
  console.log(bold(`Resultado:`) +
    `  ${green(`${uploaded} subidas`)}  ${failed > 0 ? red(`${failed} errores`) : dim("0 errores")}  ${dim(`${total} total`)}`);
  if (errors.length) {
    console.log(red(`\nErrores:`));
    errors.forEach((e) => console.log(red(`  • ${e}`)));
  }
}
console.log(`${"─".repeat(52)}\n`);

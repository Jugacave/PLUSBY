-- ============================================================
-- PLUSBY — Migration 002: Academy (courses, modules, lessons,
--   comments, ratings)
-- Run in Supabase SQL Editor AFTER 001_profiles_plans.sql
-- ============================================================

-- ─── Tables ──────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.courses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title         text NOT NULL,
  description   text,
  thumbnail_url text,
  instructor    text,
  category      text,
  level         text NOT NULL DEFAULT 'Básico' CHECK (level IN ('Básico','Intermedio','Avanzado')),
  is_published  boolean NOT NULL DEFAULT false,
  created_at    timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.course_modules (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id   uuid NOT NULL REFERENCES public.courses(id) ON DELETE CASCADE,
  title       text NOT NULL,
  description text,
  position    integer NOT NULL DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lessons (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  module_id           uuid NOT NULL REFERENCES public.course_modules(id) ON DELETE CASCADE,
  title               text NOT NULL,
  description         text,
  thumbnail_url       text,
  video_url           text,
  video_storage_path  text,
  duration            text,
  position            integer NOT NULL DEFAULT 0,
  is_free             boolean NOT NULL DEFAULT false,
  created_at          timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lesson_comments (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lesson_id   uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  parent_id   uuid REFERENCES public.lesson_comments(id) ON DELETE CASCADE,
  content     text NOT NULL,
  created_at  timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.lesson_ratings (
  lesson_id   uuid NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  rating      integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at  timestamptz DEFAULT now(),
  PRIMARY KEY (lesson_id, user_id)
);

-- ─── RLS ─────────────────────────────────────────────────────

ALTER TABLE public.courses         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_modules  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lessons         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_ratings  ENABLE ROW LEVEL SECURITY;

-- Courses: authenticated users can read published; admins manage all
CREATE POLICY "courses_read_published" ON public.courses FOR SELECT
  USING (is_published = true OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin','superadmin'));
CREATE POLICY "admins_manage_courses" ON public.courses FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin','superadmin'));

-- Modules
CREATE POLICY "modules_read" ON public.course_modules FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admins_manage_modules" ON public.course_modules FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin','superadmin'));

-- Lessons
CREATE POLICY "lessons_read" ON public.lessons FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "admins_manage_lessons" ON public.lessons FOR ALL
  USING ((auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin','superadmin'));

-- Comments: all authenticated users read/insert own; admins manage all
CREATE POLICY "comments_read" ON public.lesson_comments FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "comments_insert_own" ON public.lesson_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete_own" ON public.lesson_comments FOR DELETE USING (
  auth.uid() = user_id OR (auth.jwt() -> 'user_metadata' ->> 'role') IN ('admin','superadmin'));

-- Ratings: all authenticated users read; insert/update own
CREATE POLICY "ratings_read" ON public.lesson_ratings FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "ratings_upsert_own" ON public.lesson_ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ratings_update_own" ON public.lesson_ratings FOR UPDATE USING (auth.uid() = user_id);

-- ─── Storage bucket ──────────────────────────────────────────
-- Run this separately in Storage section or via API:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('academy', 'academy', true);

-- ─── Seed: PLUS ACADEMY course ───────────────────────────────

DO $$
DECLARE
  v_course_id uuid;
  v_mod1 uuid; v_mod2 uuid; v_mod3 uuid; v_mod4 uuid;
BEGIN

INSERT INTO public.courses (id, title, description, instructor, category, level, is_published)
VALUES (
  gen_random_uuid(),
  'PLUS ACADEMY — Dropshipping Completo',
  'Guía completa para iniciar y escalar tu negocio de dropshipping en Latinoamérica. Desde identidad digital hasta campañas de Meta Ads y TikTok. 48 videos · 4 módulos · 12 clases.',
  'Juan Carranza',
  'Dropshipping',
  'Básico',
  true
) RETURNING id INTO v_course_id;

-- MODULE 1
INSERT INTO public.course_modules (id, course_id, title, description, position)
VALUES (gen_random_uuid(), v_course_id,
  'Módulo 1: Identidad Digital y Activos de Marca',
  'Construye tu presencia digital completa desde cero: ecosistema Meta, identidad visual y primeras piezas de contenido listas para publicar.',
  1) RETURNING id INTO v_mod1;

-- MODULE 2
INSERT INTO public.course_modules (id, course_id, title, description, position)
VALUES (gen_random_uuid(), v_course_id,
  'Módulo 2: Producto Ganador y Propuesta de Valor',
  'Aprende a encontrar y validar un producto con potencial de venta real usando datos, y construye la landing page que convierte tráfico en ventas.',
  2) RETURNING id INTO v_mod2;

-- MODULE 3
INSERT INTO public.course_modules (id, course_id, title, description, position)
VALUES (gen_random_uuid(), v_course_id,
  'Módulo 3: Tienda Profesional en Shopify',
  'Construye tu tienda online profesional, conéctala con Dropi y activa los sistemas de pago y seguimiento.',
  3) RETURNING id INTO v_mod3;

-- MODULE 4
INSERT INTO public.course_modules (id, course_id, title, description, position)
VALUES (gen_random_uuid(), v_course_id,
  'Módulo 4: Publicidad Pagada, Métricas y Escalado',
  'Lanza campañas en Meta y TikTok, aprende a leer tus números y cierra el curso con un plan concreto para escalar tu negocio.',
  4) RETURNING id INTO v_mod4;

-- ── LESSONS: Intro ──
INSERT INTO public.lessons (module_id, title, description, duration, position, is_free) VALUES
(v_mod1, 'V00 — Bienvenida a Plus Academy', 'Bienvenida a Plus Academy dentro de la plataforma Plusby. Introducción a la estructura del curso, resultados de aprendizaje, navegación y cómo maximizar cada clase para comenzar a vender lo antes posible.', '5-8 min', 0, true);

-- ── LESSONS: Módulo 1 ──
INSERT INTO public.lessons (module_id, title, description, duration, position, is_free) VALUES
(v_mod1, 'V01 — ¿Qué es el Dropshipping? El Modelo Explicado desde Cero', 'Aprende cómo funciona el dropshipping, diferencias con el e-commerce tradicional, y por qué es la forma más accesible de iniciar un negocio online sin inventario.', '12-15 min', 1, true),
(v_mod1, 'V02 — Mentalidad Emprendedora: Expectativas Reales del Negocio', 'Separa mitos de realidad del dropshipping, establece expectativas de ingresos honestas y desarrolla la mentalidad necesaria para sostener el negocio.', '10-12 min', 2, true),
(v_mod1, 'V03 — Crea Tu Fan Page Profesional en Facebook Paso a Paso', 'Aprende a crear una Fan Page de Facebook desde cero con elementos generadores de confianza: nombre estratégico, categoría, foto de perfil, portada y descripción optimizada.', '12-15 min', 3, false),
(v_mod1, 'V04 — Configura Meta Business Suite Correctamente', 'Activa y configura Meta Business Suite, la herramienta central que conecta tu Fan Page, cuenta publicitaria e Instagram en un solo lugar.', '10-12 min', 4, false),
(v_mod1, 'V05 — Crea y Vincula Tu Cuenta Publicitaria en Meta Ads Manager', 'Abre tu cuenta publicitaria en Meta Ads Manager, vincúlala con tu Fan Page y configura el método de pago sin errores de verificación.', '12-15 min', 5, false),
(v_mod1, 'V06 — Instagram Business: Perfil, Bio y Primeras Publicaciones', 'Convierte tu cuenta de Instagram a perfil profesional, escribe una bio que vende, configura el enlace en bio y estructura las primeras publicaciones.', '10-12 min', 6, false),
(v_mod1, 'V07 — WhatsApp Business: Catálogo, Respuestas Rápidas y Automatizaciones', 'Configura WhatsApp Business con catálogo de productos, mensajes de bienvenida automáticos y respuestas rápidas para atención profesional sin mensajes repetitivos.', '12-15 min', 7, false),
(v_mod1, 'V08 — Construye Tu Identidad Visual de Marca', 'Define paleta de colores, tipografía y tono de comunicación para que todos tus canales tengan imagen profesional y consistente.', '10-12 min', 8, false),
(v_mod1, 'V09 — Canva para Dropshipping: Diseña Imágenes que Venden', 'Aprende Canva para crear imágenes publicitarias profesionales aplicando tu identidad de marca, usando plantillas correctas para anuncios, stories y feed.', '12-15 min', 9, false),
(v_mod1, 'V10 — Copywriting Visual: Cómo Escribir en Tus Imágenes para Generar Ventas', 'Aprende fundamentos de copywriting para diseño gráfico: titulares que capturan en 3 segundos, comunicar beneficio principal y diseñar call-to-action efectivo.', '10-12 min', 10, false),
(v_mod1, 'V11 — CapCut: Edita Videos de Producto para Reels y TikTok', 'Aprende a grabar videos de producto y editarlos con derechos y efectos para que funcionen en Reels y TikTok.', '12-15 min', 11, false),
(v_mod1, 'V12 — Workshop: Crea Tu Primer Anuncio en Imagen y Video', 'Aplica todo el aprendizaje del módulo en tiempo real. Crea tu primer anuncio: imagen publicitaria y video corto del producto, listos para publicar en Meta e Instagram.', '15-20 min', 12, false);

-- ── LESSONS: Módulo 2 ──
INSERT INTO public.lessons (module_id, title, description, duration, position, is_free) VALUES
(v_mod2, 'V13 — ¿Qué es Dropi y Cómo Funciona el Dropshipping en Latinoamérica?', 'Aprende cómo funciona el dropshipping local a través de Dropi, el rol del vendedor/proveedor/plataforma y por qué es una de las mejores opciones para el mercado latinoamericano.', '10-12 min', 1, false),
(v_mod2, 'V14 — Registro y Configuración de Tu Cuenta de Vendedor en Dropi', 'Crea tu cuenta de vendedor en Dropi, configura el perfil completo con datos comerciales y activa todos los permisos para comenzar a importar productos.', '10-12 min', 2, false),
(v_mod2, 'V15 — Navega el Catálogo de Dropi: Filtros, Métricas y Proveedores', 'Aprende a explorar el catálogo de productos de Dropi, usar filtros de búsqueda por categoría y precio, interpretar métricas de ventas de proveedores y detectar productos con tracción real.', '12-15 min', 3, false),
(v_mod2, 'V16 — Los 5 Criterios para Elegir un Producto Ganador', 'Aprende el sistema de 5 criterios para evaluar cualquier producto: margen de ganancia real, problema que resuelve, efecto visual WOW, tamaño de mercado y facilidad logística.', '12-15 min', 4, false),
(v_mod2, 'V17 — Cómo Espiar a la Competencia con la Biblioteca de Anuncios de Meta', 'Aprende a usar la biblioteca de anuncios de Meta para ver qué productos están vendiendo activamente los competidores, analizar sus creativos, identificar audiencias y detectar nichos con demanda probada.', '12-15 min', 5, false),
(v_mod2, 'V18 — Valida la Demanda del Producto con Google Trends', 'Aprende a usar Google Trends para confirmar si tu producto tiene demanda creciente, detectar estacionalidad que afecta las ventas y comparar variaciones de búsqueda por país.', '10-12 min', 6, false),
(v_mod2, 'V19 — Ejercicio Práctico: Elige Tu Producto Final del Curso', 'Aplica los 5 criterios a tu lista de candidatos y toma la decisión final sobre el producto que venderás durante el resto del curso.', '12-15 min', 7, false),
(v_mod2, 'V20 — Anatomía de una Landing Page que Convierte', 'Aprende qué elementos necesita una landing page de dropshipping para vender de verdad: estructura visual, jerarquía de información y journey del cliente.', '10-12 min', 8, false),
(v_mod2, 'V21 — Copywriting de Producto: Escribe para Vender, No para Informar', 'Aprende a escribir copy completo usando la estructura AIDA: titular magnético que genera deseo, beneficios reales en lugar de specs técnicas, manejo de objeciones y garantía generadora de confianza.', '12-15 min', 9, false),
(v_mod2, 'V22 — Construye Tu Landing Page Paso a Paso', 'Construye landing page en tiempo real usando Dropi, GemPages o plantilla de Shopify, aplicando todo el copy y los elementos visuales.', '15-20 min', 10, false),
(v_mod2, 'V23 — Elementos de Confianza que Disparan Tus Conversiones', 'Aprende a añadir elementos que eliminan la desconfianza del comprador: reseñas reales de clientes, sellos de seguridad y garantía, contador de urgencia, indicador de stock limitado y botón directo de WhatsApp.', '10-12 min', 11, false);

-- ── LESSONS: Módulo 3 ──
INSERT INTO public.lessons (module_id, title, description, duration, position, is_free) VALUES
(v_mod3, 'V24 — Cómo Elegir y Comprar el Dominio Perfecto para Tu Tienda', 'Aprende qué hace efectivo un dominio de e-commerce, cómo buscar opciones disponibles que refuercen tu marca y comprar en Namecheap o Google Domains al mejor precio.', '8-10 min', 1, false),
(v_mod3, 'V25 — Crea Tu Tienda en Shopify desde Cero', 'Crea tu tienda Shopify paso a paso: selecciona el plan correcto, configura idioma, moneda local, información fiscal y ajustes iniciales.', '12-15 min', 2, false),
(v_mod3, 'V26 — Conecta Tu Dominio a Shopify: Configuración DNS Paso a Paso', 'Aprende a configurar registros DNS (tipo A y CNAME) en tu registrador de dominio para que apunte correctamente a tu tienda Shopify sin errores técnicos.', '10-12 min', 3, false),
(v_mod3, 'V27 — Integra Dropi con Tu Tienda Shopify', 'Conecta Dropi con Shopify para importar productos automáticamente, sincronizar stock del proveedor en tiempo real y configurar precios de venta con tu margen incluido.', '12-15 min', 4, false),
(v_mod3, 'V28 — Diseña Tu Tienda Shopify: Tema, Colores y Hero Section', 'Personaliza la apariencia visual de tu tienda Shopify: elige el tema correcto para dropshipping, aplica tu paleta de colores e identidad de marca, y configura la sección principal.', '12-15 min', 5, false),
(v_mod3, 'V29 — Páginas Esenciales que Todo E-commerce Necesita', 'Crea páginas con información de contacto completa y clara: política de privacidad, términos y condiciones, política de devoluciones y sobre nosotros.', '10-12 min', 6, false),
(v_mod3, 'V30 — Activa Tu Pasarela de Pago: Mercado Pago, PayU o BOLD', 'Aprende a configurar la pasarela de pago correcta por país, conéctala con tu tienda Shopify y realiza transacción de prueba para confirmar que todo funciona antes de que lleguen clientes reales.', '12-15 min', 7, false),
(v_mod3, 'V31 — Instala Meta Pixel y Google Analytics 4 en Tu Tienda', 'Instala Meta Pixel y Google Analytics 4 en Shopify para rastrear comportamiento de visitantes, optimizar campañas publicitarias y medir el origen de cada venta desde el primer día.', '10-12 min', 8, false),
(v_mod3, 'V32 — Estrategia de Contenido: Calendario Editorial Mensual', 'Aprende a construir calendario mensual de contenido en redes sociales usando 4 tipos de publicación (educativo, social, ventas, entretenimiento) para mantener la audiencia activa y atraer clientes sin anuncios pagados.', '10-12 min', 9, false),
(v_mod3, 'V33 — Cómo Crear Reels Virales para Tu Producto', 'Aprende la estructura exacta de un Reel que genera ventas: cómo construir el hook en los primeros 3 segundos, escribir un guión efectivo, grabar en móvil y editar en CapCut.', '12-15 min', 10, false),
(v_mod3, 'V34 — WhatsApp como Canal de Ventas: Broadcast, Stories y Seguimiento', 'Aprende a usar WhatsApp Business como canal de ventas activo: listas de difusión con prospectos, stories de producto que generan consultas y seguimiento estructurado para cerrar ventas por chat.', '10-12 min', 11, false),
(v_mod3, 'V35 — Workshop: Publica Tu Primer Contenido Orgánico y Mide Resultados', 'Publica en tiempo real tus primeras 3 piezas de contenido: una imagen de feed, un Reel y una historia de WhatsApp. Aprende a interpretar métricas de alcance e interacción.', '15-20 min', 12, false);

-- ── LESSONS: Módulo 4 ──
INSERT INTO public.lessons (module_id, title, description, duration, position, is_free) VALUES
(v_mod4, 'V36 — Estructura de una Campaña Ganadora en Meta Ads', 'Aprende cómo está organizado Meta Ads Manager en tres niveles: campaña, conjunto de anuncios y anuncio. Entiende cuándo usar el objetivo de conversión y estructura la campaña desde cero.', '12-15 min', 1, false),
(v_mod4, 'V37 — Segmentación Avanzada: Encuentra Tu Cliente Ideal', 'Aprende a segmentar anuncios por intereses, comportamientos de compra y audiencias similares para mostrar tu producto exactamente a las personas con más probabilidad de comprar.', '12-15 min', 2, false),
(v_mod4, 'V38 — Presupuesto Mínimo Viable y Cuándo Escalar Tus Campañas', 'Aprende a comenzar con $10 USD de presupuesto diario, cuánto tiempo esperar antes de decidir, señales claras para pausar un anuncio y cuándo duplicar la inversión en anuncios que funcionan.', '10-12 min', 3, false),
(v_mod4, 'V39 — Qué Formato de Anuncio Usar: Imagen, Video o Carrusel', 'Aprende los formatos de mejor rendimiento para dropshipping de productos físicos y cuándo usar cada uno según el objetivo de la campaña.', '10-12 min', 4, false),
(v_mod4, 'V40 — TikTok vs Meta Ads: Diferencias Clave para Vender', 'Entiende las diferencias fundamentales entre publicidad en TikTok y Meta: tipo de contenido que funciona en cada plataforma, perfil típico del comprador y cómo adaptar la estrategia creativa.', '10-12 min', 5, false),
(v_mod4, 'V41 — Crea Tu Primera Campaña en TikTok Ads Manager', 'Abre tu cuenta de TikTok Ads Manager y configura tu primera campaña de ventas desde cero: estructura, selección de audiencia, formato de anuncio recomendado y píxel de seguimiento.', '12-15 min', 6, false),
(v_mod4, 'V42 — Cómo Grabar Videos UGC sin Equipo Profesional', 'Aprende qué es el UGC (User Generated Content), por qué convierte mejor en TikTok y Meta Ads, y cómo grabarlo de forma auténtica y efectiva en móvil.', '12-15 min', 7, false),
(v_mod4, 'V43 — Contenido Orgánico Viral en TikTok: Tendencias y Sonidos', 'Aprende a aprovechar las tendencias activas de TikTok para crear contenido orgánico que llegue a miles sin inversión en publicidad.', '10-12 min', 8, false),
(v_mod4, 'V44 — KPIs que Todo Dropshipper Debe Dominar', 'Aprende el significado de las métricas más importantes: CTR, CPM, CPC, ROAS y tasa de conversión de la tienda.', '12-15 min', 9, false),
(v_mod4, 'V45 — Cómo Leer Tus Reportes y Tomar Decisiones Basadas en Datos', 'Aprende a interpretar los reportes de Meta Ads y el dashboard de Shopify para saber exactamente qué campañas funcionan, cuáles pausar y dónde hay oportunidades de mejora.', '12-15 min', 10, false),
(v_mod4, 'V46 — Estrategia de Escalado: De Tu Primera Venta a Ventas Consistentes', 'Aprende a escalar el negocio de forma progresiva y segura: cuándo aumentar el presupuesto de campañas, cómo duplicar audiencias exitosas y cuándo agregar el segundo producto.', '12-15 min', 11, false),
(v_mod4, 'V47 — Cierre: Tu Plan de Acción para los Próximos 30 Días', 'Construye tu plan de acción personal para los próximos 30 días: qué hacer la primera semana, cómo evaluar resultados al final del mes y qué hitos debes alcanzar.', '15-20 min', 12, false);

END $$;

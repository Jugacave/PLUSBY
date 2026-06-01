---
name: landing-forge
description: >
  Genera landing pages completas para Shopify (HTML + Liquid) optimizadas para conversión,
  con estructura AIDA profesional. Úsalo siempre que el usuario quiera crear una página de
  ventas, landing page, sales page o página de producto para Shopify o dropshipping.
  También aplica cuando mencione términos como: "página de aterrizaje", "página de ventas",
  "sales funnel", "página de producto para ads", "landing para Facebook/TikTok Ads".
  Genera el código dividido en bloques listos para pegar en Shopify usando Liquid personalizado.
---

# Landing Forge — Generador de Landing Pages para Shopify

Genera una landing page completa de alta conversión para Shopify, dividida en **4 bloques HTML/Liquid** listos para pegar en el editor de temas.

## Información que debes recopilar

Antes de generar, asegúrate de tener:

1. **Nombre del producto** (ej: "Blood Sugar Complex")
2. **Categoría / problema que resuelve** (ej: "control de azúcar en sangre")
3. **País objetivo** (ej: México, Colombia — define moneda y tono)
4. **Precios y variantes**:
   - Precio tachado (precio "original")
   - Precio de oferta por cada variante (ej: 1 frasco, 2 frascos, 3 frascos)
5. **Beneficios principales** (mínimo 4-6 bullets)
6. **Ingredientes o componentes clave** (si aplica)
7. **Imágenes de referencia** del producto (si las tiene)
8. **Urgencia / escasez** (ej: "Solo 37 unidades disponibles", "Oferta termina hoy")

Si el usuario no proporciona algún dato, **usa placeholders realistas** en corchetes: `[PRECIO_OFERTA]`, `[NOMBRE_INGREDIENTE]`, etc.

---

## Estructura de la Landing (Bloques)

La landing se divide en **4 bloques** para facilitar la integración en Shopify. Entre cada bloque se recomienda insertar un botón de compra (App de Shopify como Releasit COD o botón nativo).

```
[BARRA SUPERIOR] → [BLOQUE 1] → [BOTÓN COMPRA] → [BLOQUE 2] → [BOTÓN COMPRA] → [BLOQUE 3] → [BOTÓN COMPRA] → [BLOQUE 4]
```

### BLOQUE 1 — Hero + Propuesta de Valor + Variantes de Precio
Contiene:
- Barra de urgencia superior (envío gratis, garantía, sin receta)
- Headline principal con el problema/solución
- Subheadline con promesa específica
- Imagen hero del producto (usa `{{ product.featured_image | img_url: 'master' }}` en Liquid)
- Trust badges (científicamente probado, natural, etc.)
- Tabla de variantes con precio tachado y precio de oferta
- Temporizador de cuenta regresiva (HTML/JS)
- CTA principal

### BLOQUE 2 — Problema + Agitación + Prueba Social
Contiene:
- Sección de miedo/problema ("Tu cuerpo está en peligro")
- Video embed o imagen de advertencia
- Sección "El problema con [competencia/alternativa]"
- Grid de beneficios con iconos (✓)
- Sección "Ideal para ti si..." con bullets
- Segundo CTA

### BLOQUE 3 — Testimonios + Calificación + Proceso de Compra
Contiene:
- Rating stars (4.9 ★★★★★)
- Tarjetas de testimonios con foto, nombre, ciudad y texto
- Sección "Cómo recibir tu pedido" (3 pasos: Pedido → Pago → Entrega)
- Tabla de variantes repetida con precios
- Tercer CTA

### BLOQUE 4 — Garantía + FAQ + CTA Final + Precio de Entrada
Contiene:
- Garantía con ícono de escudo (ej: "Garantía de 30 días")
- Métodos de pago aceptados (íconos)
- Sección de preguntas frecuentes (accordion o lista)
- CTA final con precio de entrada destacado ("Desde $X,XXX")
- Footer mínimo

---

## Instrucciones de Generación

### Estilo visual
- **Fondo oscuro** para secciones de miedo/problema (negro o gris oscuro)
- **Fondo blanco/crema** para secciones de beneficios y precio
- **Fondo verde oscuro** para secciones de garantía y cierre
- Colores de acento: verde (#2d6a2d o similar) para CTAs y badges positivos
- Rojo/naranja para urgencia y escasez
- Tipografía sans-serif, bold para headlines

### Código HTML/Liquid
- Usar **CSS inline o `<style>` embebido** dentro de cada bloque (no depender del tema)
- Mobile-first: todos los bloques deben ser responsive
- El Liquid solo se usa para: imagen del producto, nombre del producto, y precio dinámico si aplica
- Los precios de oferta van hardcodeados (no usar `{{ product.price }}` para los precios de variante de la landing)
- Temporizador JS: usar `localStorage` para persistir el tiempo entre recargas

### Variables Liquid disponibles
```liquid
{{ product.title }}
{{ product.featured_image | img_url: 'master' }}
{{ product.description }}
{{ shop.name }}
```

---

## Plantilla de Cada Bloque

Lee el archivo `references/block-templates.md` para ver las plantillas HTML/Liquid detalladas de cada bloque.

---

## Proceso de entrega

1. Genera los **4 bloques en secuencia**, cada uno claramente delimitado con un comentario:
   ```html
   <!-- ==================== BLOQUE 1: HERO ==================== -->
   ```
2. Al final de cada bloque, agrega una nota:
   > 📌 **Pegar en Shopify:** Tema > Editar código > Crear plantilla de producto > Agregar sección "Liquid personalizado" > Pegar este bloque. Luego agregar botón de compra antes del siguiente bloque.
3. Ofrece al usuario ajustar colores, copys o agregar/quitar secciones.

---

## Checklist de calidad antes de entregar

- [ ] Headline usa el problema del cliente, no el nombre del producto
- [ ] Precio tachado es ≥2x el precio de oferta
- [ ] Hay al menos 1 CTA por cada 2 scrolls (~600px)
- [ ] El temporizador tiene JS funcional
- [ ] Los testimonios tienen nombre, ciudad y texto específico (no genérico)
- [ ] La garantía está en el bloque 4
- [ ] El código es copy-paste ready (sin errores de sintaxis)
- [ ] Mobile-first CSS aplicado

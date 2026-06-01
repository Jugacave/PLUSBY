# Block Templates — Landing Forge

Plantillas HTML/Liquid base para cada bloque. Adaptar con los datos del producto.

---

## BLOQUE 1 — Hero + Variantes de Precio

```html
<!-- ==================== BLOQUE 1: HERO + PRECIO ==================== -->
<style>
  .lf-b1 * { box-sizing: border-box; font-family: 'Arial', sans-serif; }
  .lf-topbar { background: #1a1a1a; color: #fff; text-align: center; padding: 8px 12px; font-size: 13px; font-weight: 600; letter-spacing: 0.5px; }
  .lf-topbar span { color: #f9c74f; margin: 0 8px; }
  .lf-hero { background: #f8f4ef; padding: 24px 16px 0; text-align: center; }
  .lf-hero-eyebrow { background: #2d6a2d; color: #fff; display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
  .lf-hero h1 { font-size: 28px; font-weight: 900; color: #1a1a1a; line-height: 1.15; margin: 0 0 10px; }
  .lf-hero h1 em { color: #c0392b; font-style: normal; }
  .lf-hero-sub { font-size: 15px; color: #444; margin-bottom: 16px; line-height: 1.5; }
  .lf-product-img { width: 100%; max-width: 340px; margin: 0 auto 16px; display: block; }
  .lf-trust-row { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }
  .lf-trust-badge { background: #fff; border: 1.5px solid #ddd; border-radius: 8px; padding: 6px 12px; font-size: 12px; font-weight: 700; color: #2d6a2d; display: flex; align-items: center; gap: 4px; }
  .lf-variants { background: #fff; border-radius: 12px; padding: 16px; margin: 0 0 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.08); }
  .lf-variant-row { display: flex; align-items: center; justify-content: space-between; border: 2px solid #eee; border-radius: 10px; padding: 12px; margin-bottom: 10px; cursor: pointer; transition: border-color 0.2s; }
  .lf-variant-row.best { border-color: #2d6a2d; background: #f0f7f0; }
  .lf-variant-row.best::before { content: "⭐ MÁS POPULAR"; display: block; position: absolute; margin-top: -28px; font-size: 10px; font-weight: 700; color: #2d6a2d; }
  .lf-variant-row { position: relative; }
  .lf-variant-name { font-weight: 800; font-size: 15px; color: #1a1a1a; }
  .lf-variant-name small { display: block; font-weight: 400; font-size: 12px; color: #888; }
  .lf-variant-price { text-align: right; }
  .lf-variant-price .old { font-size: 13px; color: #aaa; text-decoration: line-through; }
  .lf-variant-price .new { font-size: 22px; font-weight: 900; color: #c0392b; }
  .lf-variant-price .per-unit { font-size: 11px; color: #888; }
  .lf-timer-wrap { background: #1a1a1a; border-radius: 10px; padding: 12px 16px; text-align: center; margin-bottom: 16px; }
  .lf-timer-label { color: #f9c74f; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; }
  .lf-timer { display: flex; justify-content: center; gap: 8px; }
  .lf-timer-unit { background: #333; color: #fff; border-radius: 6px; padding: 6px 10px; min-width: 48px; text-align: center; }
  .lf-timer-unit span { font-size: 24px; font-weight: 900; display: block; }
  .lf-timer-unit small { font-size: 9px; color: #aaa; text-transform: uppercase; }
  .lf-cta { display: block; background: #2d6a2d; color: #fff !important; text-align: center; padding: 18px; border-radius: 10px; font-size: 18px; font-weight: 900; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; box-shadow: 0 4px 15px rgba(45,106,45,0.4); }
  .lf-cta-sub { text-align: center; font-size: 12px; color: #888; margin-bottom: 20px; }
  @media (min-width: 640px) {
    .lf-hero h1 { font-size: 38px; }
    .lf-variants { padding: 20px; }
  }
</style>

<div class="lf-b1">
  <div class="lf-topbar">
    🚚 ENVÍO GRATIS <span>•</span> 🌿 FÓRMULA NATURAL <span>•</span> ✅ SIN RECETA
  </div>
  <div class="lf-hero">
    <div class="lf-hero-eyebrow">✅ Respaldado por médicos • Fórmula Verificada</div>
    <h1>Controla tu <em>[PROBLEMA_CLAVE]</em><br>y Pierde la Grasa Abdominal</h1>
    <p class="lf-hero-sub">Combina ingredientes naturales, científicamente probados para [BENEFICIO_PRINCIPAL] de forma segura y natural, sin efectos secundarios.</p>
    <img class="lf-product-img" src="{{ product.featured_image | img_url: 'master' }}" alt="{{ product.title }}">
    <div class="lf-trust-row">
      <div class="lf-trust-badge">🧬 Fórmula Avanzada</div>
      <div class="lf-trust-badge">🌿 100% Natural</div>
      <div class="lf-trust-badge">✅ Sin Efectos</div>
      <div class="lf-trust-badge">🏭 GMP Certificado</div>
    </div>
    <div class="lf-variants">
      <div class="lf-variant-row">
        <div class="lf-variant-name">📦 1 Frasco<small>Suministro para 30 días</small></div>
        <div class="lf-variant-price">
          <div class="old">$[PRECIO_ORIGINAL_1]</div>
          <div class="new">$[PRECIO_OFERTA_1]</div>
          <div class="per-unit">$[PRECIO_POR_DIA]/día</div>
        </div>
      </div>
      <div class="lf-variant-row best">
        <div class="lf-variant-name">📦📦 2 Frascos<small>Suministro para 60 días</small></div>
        <div class="lf-variant-price">
          <div class="old">$[PRECIO_ORIGINAL_2]</div>
          <div class="new">$[PRECIO_OFERTA_2]</div>
          <div class="per-unit">Ahorras $[AHORRO_2]</div>
        </div>
      </div>
      <div class="lf-variant-row">
        <div class="lf-variant-name">📦📦📦 3 Frascos<small>Suministro para 90 días</small></div>
        <div class="lf-variant-price">
          <div class="old">$[PRECIO_ORIGINAL_3]</div>
          <div class="new">$[PRECIO_OFERTA_3]</div>
          <div class="per-unit">Ahorras $[AHORRO_3]</div>
        </div>
      </div>
    </div>
    <div class="lf-timer-wrap">
      <div class="lf-timer-label">⏰ Oferta especial termina en:</div>
      <div class="lf-timer">
        <div class="lf-timer-unit"><span id="lf-hours">00</span><small>Horas</small></div>
        <div class="lf-timer-unit"><span id="lf-mins">00</span><small>Mins</small></div>
        <div class="lf-timer-unit"><span id="lf-secs">00</span><small>Segs</small></div>
      </div>
    </div>
    <a href="#lf-order" class="lf-cta">🛒 PEDIR AHORA Y RECIBIR MI DESCUENTO</a>
    <p class="lf-cta-sub">✅ Pago seguro • 🚚 Envío en 3-7 días hábiles • 🔒 Datos protegidos</p>
  </div>
</div>

<script>
(function() {
  var key = 'lf_timer_[PRODUCT_HANDLE]';
  var duration = 23 * 3600 + 37 * 60 + 41; // 23h 37m 41s
  var end = localStorage.getItem(key);
  if (!end) { end = Date.now() + duration * 1000; localStorage.setItem(key, end); }
  end = parseInt(end);
  function update() {
    var diff = Math.max(0, Math.floor((end - Date.now()) / 1000));
    var h = Math.floor(diff / 3600), m = Math.floor((diff % 3600) / 60), s = diff % 60;
    var pad = function(n) { return String(n).padStart(2,'0'); };
    var hEl = document.getElementById('lf-hours'), mEl = document.getElementById('lf-mins'), sEl = document.getElementById('lf-secs');
    if (hEl) hEl.textContent = pad(h);
    if (mEl) mEl.textContent = pad(m);
    if (sEl) sEl.textContent = pad(s);
    if (diff > 0) setTimeout(update, 1000);
  }
  update();
})();
</script>
```

---

## BLOQUE 2 — Problema + Beneficios + Ingredientes

```html
<!-- ==================== BLOQUE 2: PROBLEMA + BENEFICIOS ==================== -->
<style>
  .lf-b2 * { box-sizing: border-box; font-family: 'Arial', sans-serif; }
  .lf-danger { background: #0a0a0a; color: #fff; padding: 28px 16px; text-align: center; }
  .lf-danger h2 { font-size: 22px; font-weight: 900; color: #e74c3c; text-transform: uppercase; margin: 0 0 12px; }
  .lf-danger p { font-size: 14px; color: #ccc; line-height: 1.6; margin-bottom: 16px; }
  .lf-danger-img { width: 100%; max-width: 400px; margin: 0 auto 16px; display: block; border-radius: 8px; }
  .lf-problem-box { background: #1a1a1a; border: 1px solid #333; border-radius: 10px; padding: 16px; margin: 16px 0; text-align: left; }
  .lf-problem-box h3 { color: #f9c74f; font-size: 16px; margin: 0 0 12px; }
  .lf-problem-item { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 10px; font-size: 14px; color: #ddd; }
  .lf-problem-item::before { content: "❌"; flex-shrink: 0; }
  .lf-benefits { background: #f8f4ef; padding: 28px 16px; }
  .lf-benefits h2 { font-size: 22px; font-weight: 900; color: #1a1a1a; text-align: center; margin: 0 0 20px; }
  .lf-benefits h2 span { color: #2d6a2d; }
  .lf-benefits-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 20px; }
  .lf-benefit-card { background: #fff; border-radius: 10px; padding: 14px 12px; text-align: center; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .lf-benefit-icon { font-size: 28px; margin-bottom: 6px; }
  .lf-benefit-title { font-size: 13px; font-weight: 700; color: #1a1a1a; margin-bottom: 4px; }
  .lf-benefit-desc { font-size: 12px; color: #666; line-height: 1.4; }
  .lf-ideal { background: #e8f5e9; border-radius: 12px; padding: 16px; margin: 16px 0; }
  .lf-ideal h3 { color: #2d6a2d; font-size: 16px; font-weight: 800; margin: 0 0 12px; }
  .lf-ideal-item { display: flex; align-items: flex-start; gap: 8px; margin-bottom: 8px; font-size: 14px; color: #333; }
  .lf-ideal-item::before { content: "✅"; flex-shrink: 0; }
  .lf-ingredients { background: #1a1a1a; color: #fff; padding: 28px 16px; }
  .lf-ingredients h2 { font-size: 20px; font-weight: 900; text-align: center; margin: 0 0 20px; }
  .lf-ingredients h2 span { color: #f9c74f; }
  .lf-ing-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
  .lf-ing-card { background: #2a2a2a; border-radius: 8px; padding: 12px; text-align: center; }
  .lf-ing-icon { font-size: 24px; margin-bottom: 4px; }
  .lf-ing-name { font-size: 13px; font-weight: 700; color: #f9c74f; margin-bottom: 4px; }
  .lf-ing-desc { font-size: 11px; color: #bbb; line-height: 1.4; }
  @media (min-width: 640px) {
    .lf-benefits-grid { grid-template-columns: repeat(3, 1fr); }
    .lf-ing-grid { grid-template-columns: repeat(3, 1fr); }
  }
</style>

<div class="lf-b2">
  <div class="lf-danger">
    <h2>⚠️ Tu Cuerpo Está en Peligro</h2>
    <p>[TEXTO_PROBLEMA — ej: Cuando el azúcar en sangre no está controlado, tu cuerpo entra en un ciclo destructivo que daña órganos vitales, acumula grasa abdominal y agota tu energía día a día.]</p>
    <div class="lf-problem-box">
      <h3>El Problema con [ALTERNATIVA/COMPETENCIA]:</h3>
      <div class="lf-problem-item">[Síntoma o consecuencia negativa 1]</div>
      <div class="lf-problem-item">[Síntoma o consecuencia negativa 2]</div>
      <div class="lf-problem-item">[Síntoma o consecuencia negativa 3]</div>
      <div class="lf-problem-item">[Síntoma o consecuencia negativa 4]</div>
    </div>
  </div>

  <div class="lf-benefits">
    <h2>Lo que <span>[PRODUCTO]</span> Hace por Ti</h2>
    <div class="lf-benefits-grid">
      <div class="lf-benefit-card">
        <div class="lf-benefit-icon">🩸</div>
        <div class="lf-benefit-title">[Beneficio 1]</div>
        <div class="lf-benefit-desc">[Descripción corta del beneficio]</div>
      </div>
      <div class="lf-benefit-card">
        <div class="lf-benefit-icon">⚡</div>
        <div class="lf-benefit-title">[Beneficio 2]</div>
        <div class="lf-benefit-desc">[Descripción corta del beneficio]</div>
      </div>
      <div class="lf-benefit-card">
        <div class="lf-benefit-icon">🔥</div>
        <div class="lf-benefit-title">[Beneficio 3]</div>
        <div class="lf-benefit-desc">[Descripción corta del beneficio]</div>
      </div>
      <div class="lf-benefit-card">
        <div class="lf-benefit-icon">😴</div>
        <div class="lf-benefit-title">[Beneficio 4]</div>
        <div class="lf-benefit-desc">[Descripción corta del beneficio]</div>
      </div>
    </div>
    <div class="lf-ideal">
      <h3>✨ Ideal para ti si...</h3>
      <div class="lf-ideal-item">Quieres [resultado deseado 1] de forma natural y permanente</div>
      <div class="lf-ideal-item">Estás cansado/a de [problema que no pudo resolverse antes]</div>
      <div class="lf-ideal-item">Buscas [resultado deseado 2] sin dietas extremas ni ejercicio intenso</div>
      <div class="lf-ideal-item">Necesitas recuperar [energía/vitalidad/confianza] en tu vida diaria</div>
    </div>
  </div>

  <div class="lf-ingredients">
    <h2>Ingredientes <span>100% Probados</span></h2>
    <div class="lf-ing-grid">
      <div class="lf-ing-card">
        <div class="lf-ing-icon">🌿</div>
        <div class="lf-ing-name">[Ingrediente 1]</div>
        <div class="lf-ing-desc">[Beneficio científico del ingrediente]</div>
      </div>
      <div class="lf-ing-card">
        <div class="lf-ing-icon">🍃</div>
        <div class="lf-ing-name">[Ingrediente 2]</div>
        <div class="lf-ing-desc">[Beneficio científico del ingrediente]</div>
      </div>
      <div class="lf-ing-card">
        <div class="lf-ing-icon">🌱</div>
        <div class="lf-ing-name">[Ingrediente 3]</div>
        <div class="lf-ing-desc">[Beneficio científico del ingrediente]</div>
      </div>
      <div class="lf-ing-card">
        <div class="lf-ing-icon">💊</div>
        <div class="lf-ing-name">[Ingrediente 4]</div>
        <div class="lf-ing-desc">[Beneficio científico del ingrediente]</div>
      </div>
    </div>
  </div>
</div>
```

---

## BLOQUE 3 — Testimonios + Proceso de Pedido

```html
<!-- ==================== BLOQUE 3: TESTIMONIOS + PEDIDO ==================== -->
<style>
  .lf-b3 * { box-sizing: border-box; font-family: 'Arial', sans-serif; }
  .lf-reviews { background: #f8f4ef; padding: 28px 16px; }
  .lf-rating-header { text-align: center; margin-bottom: 20px; }
  .lf-rating-num { font-size: 52px; font-weight: 900; color: #1a1a1a; line-height: 1; }
  .lf-stars { color: #f9c74f; font-size: 22px; margin: 4px 0; }
  .lf-rating-sub { font-size: 13px; color: #666; }
  .lf-review-card { background: #fff; border-radius: 12px; padding: 16px; margin-bottom: 14px; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .lf-review-header { display: flex; align-items: center; gap: 10px; margin-bottom: 8px; }
  .lf-review-avatar { width: 40px; height: 40px; border-radius: 50%; background: #ddd; overflow: hidden; flex-shrink: 0; }
  .lf-review-avatar img { width: 100%; height: 100%; object-fit: cover; }
  .lf-review-name { font-weight: 700; font-size: 14px; color: #1a1a1a; }
  .lf-review-location { font-size: 12px; color: #888; }
  .lf-review-stars { color: #f9c74f; font-size: 14px; }
  .lf-review-text { font-size: 14px; color: #444; line-height: 1.6; }
  .lf-review-product { display: flex; align-items: center; gap: 8px; margin-top: 10px; padding-top: 10px; border-top: 1px solid #eee; }
  .lf-review-product img { width: 40px; border-radius: 4px; }
  .lf-review-product small { font-size: 11px; color: #888; }
  .lf-how-order { background: #1a3a1a; color: #fff; padding: 28px 16px; text-align: center; }
  .lf-how-order h2 { font-size: 20px; font-weight: 900; margin: 0 0 20px; }
  .lf-steps { display: flex; flex-direction: column; gap: 12px; max-width: 400px; margin: 0 auto 20px; }
  .lf-step { display: flex; align-items: center; gap: 12px; background: rgba(255,255,255,0.1); border-radius: 10px; padding: 12px; text-align: left; }
  .lf-step-num { background: #f9c74f; color: #1a1a1a; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 16px; flex-shrink: 0; }
  .lf-step-text { font-size: 14px; color: #eee; }
  .lf-step-text strong { color: #fff; display: block; margin-bottom: 2px; }
  .lf-variants2 { background: #fff; border-radius: 12px; padding: 16px; margin: 0 16px 16px; }
  @media (min-width: 640px) {
    .lf-steps { flex-direction: row; max-width: 100%; }
    .lf-step { flex-direction: column; text-align: center; flex: 1; }
  }
</style>

<div class="lf-b3">
  <div class="lf-reviews">
    <div class="lf-rating-header">
      <div class="lf-rating-num">4.9</div>
      <div class="lf-stars">★★★★★</div>
      <div class="lf-rating-sub">+[N] comprobantes verificados en [PAÍS]</div>
    </div>

    <!-- TESTIMONIO 1 -->
    <div class="lf-review-card">
      <div class="lf-review-header">
        <div class="lf-review-avatar"><img src="[URL_FOTO_1]" alt="[Nombre 1]" onerror="this.style.display='none'"></div>
        <div>
          <div class="lf-review-name">[Nombre Completo 1]</div>
          <div class="lf-review-location">📍 [Ciudad], [País]</div>
          <div class="lf-review-stars">★★★★★</div>
        </div>
      </div>
      <div class="lf-review-text">"[Testimonio específico y creíble. Mencionar el problema que tenía, cuánto tiempo tardó en ver resultados, y el cambio específico que experimentó. Mínimo 3 líneas.]"</div>
      <div class="lf-review-product">
        <img src="{{ product.featured_image | img_url: '100x' }}" alt="{{ product.title }}">
        <small>✅ Compra verificada · [VARIANTE]</small>
      </div>
    </div>

    <!-- TESTIMONIO 2 -->
    <div class="lf-review-card">
      <div class="lf-review-header">
        <div class="lf-review-avatar"><img src="[URL_FOTO_2]" alt="[Nombre 2]" onerror="this.style.display='none'"></div>
        <div>
          <div class="lf-review-name">[Nombre Completo 2]</div>
          <div class="lf-review-location">📍 [Ciudad], [País]</div>
          <div class="lf-review-stars">★★★★★</div>
        </div>
      </div>
      <div class="lf-review-text">"[Testimonio 2 — diferente perfil de cliente, diferente resultado específico.]"</div>
      <div class="lf-review-product">
        <img src="{{ product.featured_image | img_url: '100x' }}" alt="{{ product.title }}">
        <small>✅ Compra verificada · [VARIANTE]</small>
      </div>
    </div>

    <!-- TESTIMONIO 3 -->
    <div class="lf-review-card">
      <div class="lf-review-header">
        <div class="lf-review-avatar"><img src="[URL_FOTO_3]" alt="[Nombre 3]" onerror="this.style.display='none'"></div>
        <div>
          <div class="lf-review-name">[Nombre Completo 3]</div>
          <div class="lf-review-location">📍 [Ciudad], [País]</div>
          <div class="lf-review-stars">★★★★★</div>
        </div>
      </div>
      <div class="lf-review-text">"[Testimonio 3 — otra perspectiva, puede ser alguien mayor o de perfil diferente.]"</div>
      <div class="lf-review-product">
        <img src="{{ product.featured_image | img_url: '100x' }}" alt="{{ product.title }}">
        <small>✅ Compra verificada · [VARIANTE]</small>
      </div>
    </div>
  </div>

  <div class="lf-how-order">
    <h2>📦 ¿Cómo Hacer tu Pedido?</h2>
    <div class="lf-steps">
      <div class="lf-step">
        <div class="lf-step-num">1</div>
        <div class="lf-step-text"><strong>Elige tu paquete</strong>Selecciona la cantidad que necesitas y haz clic en el botón</div>
      </div>
      <div class="lf-step">
        <div class="lf-step-num">2</div>
        <div class="lf-step-text"><strong>Completa tu pedido</strong>Llena tus datos de envío y elige tu método de pago</div>
      </div>
      <div class="lf-step">
        <div class="lf-step-num">3</div>
        <div class="lf-step-text"><strong>¡Recibe en casa!</strong>Tu pedido llega en [X-Y] días hábiles directo a tu puerta</div>
      </div>
    </div>
  </div>
</div>
```

---

## BLOQUE 4 — Garantía + FAQ + CTA Final

```html
<!-- ==================== BLOQUE 4: GARANTÍA + FAQ + CIERRE ==================== -->
<style>
  .lf-b4 * { box-sizing: border-box; font-family: 'Arial', sans-serif; }
  .lf-guarantee { background: #f0faf0; border: 2px solid #2d6a2d; border-radius: 14px; margin: 16px; padding: 20px; text-align: center; }
  .lf-guarantee-icon { font-size: 48px; margin-bottom: 8px; }
  .lf-guarantee h2 { font-size: 20px; font-weight: 900; color: #1a3a1a; margin: 0 0 8px; }
  .lf-guarantee p { font-size: 14px; color: #444; line-height: 1.6; margin-bottom: 12px; }
  .lf-payment-icons { display: flex; justify-content: center; gap: 8px; flex-wrap: wrap; margin-top: 12px; }
  .lf-payment-badge { background: #fff; border: 1.5px solid #ddd; border-radius: 6px; padding: 4px 10px; font-size: 12px; font-weight: 700; color: #333; }
  .lf-faq { background: #f8f4ef; padding: 28px 16px; }
  .lf-faq h2 { font-size: 20px; font-weight: 900; color: #1a1a1a; text-align: center; margin: 0 0 20px; }
  .lf-faq-item { border-bottom: 1px solid #ddd; padding: 14px 0; }
  .lf-faq-q { font-weight: 700; font-size: 14px; color: #1a1a1a; margin-bottom: 6px; cursor: pointer; }
  .lf-faq-q::before { content: "❓ "; }
  .lf-faq-a { font-size: 14px; color: #555; line-height: 1.6; }
  .lf-closing { background: #1a3a1a; color: #fff; padding: 28px 16px; text-align: center; }
  .lf-closing-eyebrow { font-size: 12px; color: #a5d6a7; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
  .lf-closing h2 { font-size: 22px; font-weight: 900; margin: 0 0 8px; }
  .lf-closing-sub { font-size: 14px; color: #ccc; margin-bottom: 20px; line-height: 1.5; }
  .lf-closing-price-label { font-size: 13px; color: #a5d6a7; margin-bottom: 4px; }
  .lf-closing-price { font-size: 42px; font-weight: 900; color: #f9c74f; margin-bottom: 4px; }
  .lf-closing-price-orig { font-size: 16px; color: #888; text-decoration: line-through; margin-bottom: 16px; }
  .lf-cta-final { display: block; background: #f9c74f; color: #1a1a1a !important; text-align: center; padding: 18px; border-radius: 10px; font-size: 18px; font-weight: 900; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px; box-shadow: 0 4px 15px rgba(249,199,79,0.4); }
  .lf-footer-badges { display: flex; justify-content: center; gap: 10px; flex-wrap: wrap; margin-top: 16px; }
  .lf-footer-badge { font-size: 12px; color: #a5d6a7; }
</style>

<div class="lf-b4">
  <div class="lf-guarantee">
    <div class="lf-guarantee-icon">🛡️</div>
    <h2>Garantía de [X] Días Sin Preguntas</h2>
    <p>Si por cualquier razón no estás completamente satisfecho/a con tu resultado, te devolvemos el 100% de tu dinero. Sin preguntas, sin complicaciones. Tu satisfacción es nuestra prioridad.</p>
    <div class="lf-payment-icons">
      <div class="lf-payment-badge">💳 Tarjeta</div>
      <div class="lf-payment-badge">🏦 Transferencia</div>
      <div class="lf-payment-badge">💵 Efectivo</div>
      <div class="lf-payment-badge">📱 [OXXO/PSE/etc.]</div>
    </div>
  </div>

  <div class="lf-faq">
    <h2>Preguntas Frecuentes</h2>
    <div class="lf-faq-item">
      <div class="lf-faq-q">¿Cuánto tiempo tarda en llegar mi pedido?</div>
      <div class="lf-faq-a">Tu pedido llega en [X a Y] días hábiles después de confirmado el pago. Recibirás un número de rastreo por [correo/WhatsApp] para seguir tu envío.</div>
    </div>
    <div class="lf-faq-item">
      <div class="lf-faq-q">¿Cómo sé que mi pago llegó a [TIENDA]?</div>
      <div class="lf-faq-a">Recibirás una confirmación automática por correo electrónico. Si no la ves en 30 minutos, revisa tu carpeta de spam o contáctanos por WhatsApp.</div>
    </div>
    <div class="lf-faq-item">
      <div class="lf-faq-q">¿Cuánto tiempo debo tomar [PRODUCTO] para ver resultados?</div>
      <div class="lf-faq-a">La mayoría de nuestros clientes reportan cambios desde la primera semana. Para resultados óptimos y duraderos, recomendamos el plan de [60-90] días.</div>
    </div>
    <div class="lf-faq-item">
      <div class="lf-faq-q">¿Es un producto o un genérico?</div>
      <div class="lf-faq-a">[PRODUCTO] es una fórmula exclusiva de [MARCA], elaborada con ingredientes de grado farmacéutico bajo estrictos estándares de calidad. No es un genérico.</div>
    </div>
  </div>

  <div class="lf-closing">
    <div class="lf-closing-eyebrow">🔒 Compra 100% Segura</div>
    <h2>El Primer Paso es Tuyo</h2>
    <div class="lf-closing-sub">Únete a más de [N] personas en [PAÍS] que ya transformaron su [salud/vida/resultados]. <strong>No esperes más.</strong></div>
    <div class="lf-closing-price-label">Empieza hoy desde solo:</div>
    <div class="lf-closing-price">$[PRECIO_ENTRADA]</div>
    <div class="lf-closing-price-orig">Antes: $[PRECIO_ORIGINAL_1]</div>
    <a href="#" class="lf-cta-final" id="lf-order">🛒 PEDIR AHORA CON DESCUENTO</a>
    <div class="lf-footer-badges">
      <span class="lf-footer-badge">🚚 Envío Gratis</span>
      <span class="lf-footer-badge">🛡️ Garantía [X] Días</span>
      <span class="lf-footer-badge">🔒 Pago Seguro</span>
      <span class="lf-footer-badge">🌿 100% Natural</span>
    </div>
  </div>
</div>
```

---

## Notas de Integración en Shopify

1. **Crear plantilla:** Shopify Admin → Tienda en línea → Temas → Editar código → Templates → Crear `product.landing.json`
2. **Pegar cada bloque:** Agregar sección "Liquid personalizado" y pegar el bloque
3. **Entre bloques:** Agregar la app de botón de compra (Releasit COD, Buy Button, o botón nativo de Shopify)
4. **Asignar plantilla:** En el producto de Shopify, cambiar la plantilla a `landing`
5. **Reemplazar placeholders:** Buscar todos los `[TEXTO_EN_MAYÚSCULAS]` y reemplazar con datos reales

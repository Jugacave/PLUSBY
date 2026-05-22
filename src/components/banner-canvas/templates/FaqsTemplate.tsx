"use client";
import type { BannerData } from "../types";

// ─── FAQs: 2 tarjetas con pregunta + respuesta ───────────────────────────────
export function FaqsTemplateA({ data }: { data: BannerData }) {
  // Expect bullets to come as alternating Q/A pairs
  const pairs: { q: string; a: string }[] = [];
  for (let i = 0; i < data.bullets.length && pairs.length < 3; i += 2) {
    pairs.push({ q: data.bullets[i], a: data.bullets[i + 1] ?? "" });
  }
  if (pairs.length === 0) pairs.push({ q: "¿Cómo funciona?", a: "Fácil y rápido." });

  return (
    <div style={{
      width: 1080, height: 1920,
      background: `linear-gradient(180deg, ${data.bgColor} 0%, ${data.secondaryColor} 100%)`,
      fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
      display: "flex", flexDirection: "column", overflow: "hidden", position: "relative",
    }}>
      <div style={{ position: "absolute", top: 100, left: -200, width: 600, height: 600, borderRadius: "50%", background: `${data.primaryColor}22`, filter: "blur(80px)" }} />

      {/* Header */}
      <div style={{ padding: "100px 80px 30px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: `${data.primaryColor}33`, color: data.primaryColor, fontSize: 30, fontWeight: 800, padding: "12px 32px", borderRadius: 100, letterSpacing: 4, textTransform: "uppercase", marginBottom: 24, border: `2px solid ${data.primaryColor}66` }}>
          Preguntas frecuentes
        </div>
        <h1 style={{ color: data.accentColor, fontSize: 92, fontWeight: 900, lineHeight: 1, margin: 0, textTransform: "uppercase", letterSpacing: -2 }}>
          {data.headline}
        </h1>
      </div>

      {/* Product small */}
      <div style={{ display: "flex", justifyContent: "center", padding: "20px 0" }}>
        {data.productImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={data.productImageUrl} alt="" crossOrigin="anonymous"
            style={{ width: 320, height: 320, objectFit: "contain", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.4))" }} />
        ) : null}
      </div>

      {/* FAQ cards */}
      <div style={{ flex: 1, padding: "20px 60px", display: "flex", flexDirection: "column", gap: 26, justifyContent: "center" }}>
        {pairs.slice(0, 3).map((p, i) => (
          <div key={i} style={{
            background: `${data.accentColor}F0`, borderRadius: 28,
            padding: "32px 36px",
            boxShadow: "0 16px 32px rgba(0,0,0,0.25)",
            borderLeft: `8px solid ${data.primaryColor}`,
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
              <div style={{ flexShrink: 0, width: 60, height: 60, borderRadius: "50%", background: `linear-gradient(135deg, ${data.primaryColor}, ${data.primaryColor}CC)`, color: data.accentColor, fontSize: 36, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
                ?
              </div>
              <div style={{ flex: 1 }}>
                <p style={{ color: data.secondaryColor, fontSize: 34, fontWeight: 900, margin: 0, lineHeight: 1.2 }}>{p.q}</p>
                {p.a && (
                  <p style={{ color: "#475569", fontSize: 28, fontWeight: 500, margin: "12px 0 0", lineHeight: 1.3 }}>{p.a}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: "20px 80px 80px", textAlign: "center" }}>
        <div style={{
          background: `linear-gradient(135deg, ${data.primaryColor}, ${data.primaryColor}DD)`,
          color: data.accentColor, fontSize: 50, fontWeight: 800,
          padding: "30px 0", borderRadius: 100,
          letterSpacing: 2, textTransform: "uppercase",
          boxShadow: `0 24px 50px ${data.primaryColor}66`,
        }}>
          {data.cta}
        </div>
      </div>
    </div>
  );
}

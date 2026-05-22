"use client";
import type { BannerData } from "../types";

// ─── Testimonios: 5 estrellas + cita + producto en esquina ────────────────────
export function TestimoniosTemplateA({ data }: { data: BannerData }) {
  const quote = data.bullets[0] || data.subheadline || "Increíble producto, lo recomiendo 100%.";
  const author = data.bullets[1] || "Cliente verificado";
  return (
    <div style={{
      width: 1080, height: 1920,
      background: `linear-gradient(135deg, ${data.bgColor} 0%, ${data.secondaryColor} 100%)`,
      fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
      display: "flex", flexDirection: "column", overflow: "hidden", position: "relative",
    }}>
      <div style={{ position: "absolute", top: -150, right: -150, width: 600, height: 600, borderRadius: "50%", background: `${data.primaryColor}33`, filter: "blur(80px)" }} />

      {/* Top label */}
      <div style={{ padding: "100px 80px 0", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: data.primaryColor, color: data.accentColor, fontSize: 28, fontWeight: 800, padding: "12px 36px", borderRadius: 100, letterSpacing: 4, textTransform: "uppercase" }}>
          Testimonios
        </div>
      </div>

      {/* Headline */}
      <div style={{ padding: "40px 80px 20px", textAlign: "center" }}>
        <h1 style={{ color: data.accentColor, fontSize: 92, fontWeight: 900, lineHeight: 1, margin: 0, textTransform: "uppercase", letterSpacing: -2 }}>
          {data.headline}
        </h1>
      </div>

      {/* 5 stars */}
      <div style={{ display: "flex", justifyContent: "center", gap: 16, padding: "30px 0" }}>
        {[0,1,2,3,4].map(i => (
          <span key={i} style={{ color: "#FBBF24", fontSize: 84, lineHeight: 1, textShadow: "0 4px 16px rgba(251,191,36,0.5)" }}>★</span>
        ))}
      </div>

      {/* Quote card */}
      <div style={{ margin: "0 60px", padding: "50px 50px", background: `${data.accentColor}F5`, borderRadius: 32, position: "relative", boxShadow: "0 30px 60px rgba(0,0,0,0.4)" }}>
        <span style={{ position: "absolute", top: -10, left: 30, fontSize: 200, color: data.primaryColor, fontFamily: "Georgia, serif", lineHeight: 1, opacity: 0.3 }}>&ldquo;</span>
        <p style={{ color: data.secondaryColor, fontSize: 44, fontWeight: 500, lineHeight: 1.35, margin: 0, fontStyle: "italic", position: "relative", zIndex: 1 }}>
          {quote}
        </p>
        <div style={{ marginTop: 30, display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 70, height: 70, borderRadius: "50%", background: `linear-gradient(135deg, ${data.primaryColor}, ${data.primaryColor}CC)`, color: data.accentColor, fontSize: 32, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>
            {author.charAt(0).toUpperCase()}
          </div>
          <div>
            <p style={{ color: data.secondaryColor, fontSize: 32, fontWeight: 800, margin: 0 }}>— {author}</p>
            <p style={{ color: "#64748B", fontSize: 24, fontWeight: 500, margin: "4px 0 0" }}>Compra verificada ✓</p>
          </div>
        </div>
      </div>

      {/* Product in corner */}
      <div style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", padding: "20px 0 30px" }}>
        {data.productImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={data.productImageUrl} alt="" crossOrigin="anonymous"
            style={{ width: 400, height: 400, objectFit: "contain", filter: "drop-shadow(0 24px 48px rgba(0,0,0,0.5))" }} />
        ) : null}
      </div>

      {/* CTA */}
      <div style={{ padding: "0 80px 80px", textAlign: "center" }}>
        <div style={{
          background: data.accentColor, color: data.secondaryColor,
          fontSize: 50, fontWeight: 800, padding: "30px 0", borderRadius: 100,
          letterSpacing: 2, textTransform: "uppercase",
          boxShadow: `0 20px 40px rgba(0,0,0,0.3)`,
        }}>
          {data.cta}
        </div>
      </div>
    </div>
  );
}

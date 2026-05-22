"use client";
import type { BannerData } from "../types";

// ─── Autoridad: producto centrado + 3 badges/certificaciones ─────────────────
export function AutoridadTemplateA({ data }: { data: BannerData }) {
  const badges = data.bullets.slice(0, 3);
  return (
    <div style={{
      width: 1080, height: 1920,
      background: `radial-gradient(circle at 50% 30%, ${data.primaryColor}33 0%, ${data.bgColor} 60%)`,
      fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
      display: "flex", flexDirection: "column", overflow: "hidden", position: "relative",
    }}>
      {/* Top ribbon */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "60px 80px 0" }}>
        <div style={{ flex: 1, height: 4, background: `${data.primaryColor}66` }} />
        <span style={{ color: data.primaryColor, fontSize: 32, fontWeight: 800, letterSpacing: 8, padding: "0 30px", textTransform: "uppercase" }}>
          Certificado
        </span>
        <div style={{ flex: 1, height: 4, background: `${data.primaryColor}66` }} />
      </div>

      {/* Headline */}
      <div style={{ padding: "50px 80px 30px", textAlign: "center" }}>
        <h1 style={{ color: data.accentColor, fontSize: 100, fontWeight: 900, lineHeight: 1, margin: 0, textTransform: "uppercase", letterSpacing: -2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {data.headline}
        </h1>
        {data.subheadline && (
          <p style={{ color: `${data.accentColor}AA`, fontSize: 38, margin: "20px 0 0", fontWeight: 400 }}>
            {data.subheadline}
          </p>
        )}
      </div>

      {/* Product centered with glow */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        <div style={{ position: "absolute", width: 700, height: 700, borderRadius: "50%", background: `radial-gradient(circle, ${data.primaryColor}44 0%, transparent 70%)` }} />
        {/* Decorative outer ring */}
        <div style={{ position: "absolute", width: 760, height: 760, borderRadius: "50%", border: `2px dashed ${data.primaryColor}55` }} />
        {data.productImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={data.productImageUrl} alt="" crossOrigin="anonymous"
            style={{ width: 620, height: 620, objectFit: "contain", position: "relative", zIndex: 1, filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.5))" }} />
        ) : (
          <div style={{ width: 620, height: 620, borderRadius: 32, background: `${data.accentColor}10` }} />
        )}
      </div>

      {/* 3 authority badges */}
      <div style={{ display: "flex", gap: 24, padding: "0 60px 50px", justifyContent: "center" }}>
        {badges.map((b, i) => (
          <div key={i} style={{
            flex: 1, background: `linear-gradient(135deg, ${data.primaryColor}, ${data.primaryColor}CC)`,
            borderRadius: 24, padding: "32px 20px", textAlign: "center",
            border: `3px solid ${data.accentColor}`,
            boxShadow: `0 20px 40px ${data.primaryColor}44`,
            position: "relative",
          }}>
            <div style={{ position: "absolute", top: -28, left: "50%", transform: "translateX(-50%)", width: 56, height: 56, borderRadius: "50%", background: data.accentColor, color: data.primaryColor, fontSize: 32, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>★</div>
            <p style={{ color: data.accentColor, fontSize: 26, fontWeight: 800, margin: "20px 0 0", lineHeight: 1.2, textTransform: "uppercase", letterSpacing: 0.5 }}>{b}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: "0 80px 80px", textAlign: "center" }}>
        <div style={{
          background: data.accentColor, color: data.secondaryColor,
          fontSize: 50, fontWeight: 800, padding: "30px 0", borderRadius: 100,
          letterSpacing: 2, textTransform: "uppercase",
          boxShadow: `0 20px 40px rgba(0,0,0,0.4)`,
        }}>
          {data.cta}
        </div>
      </div>
    </div>
  );
}

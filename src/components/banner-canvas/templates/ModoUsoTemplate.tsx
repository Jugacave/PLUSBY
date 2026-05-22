"use client";
import type { BannerData } from "../types";

// ─── Modo de uso: 3 pasos numerados ──────────────────────────────────────────
export function ModoUsoTemplateA({ data }: { data: BannerData }) {
  const steps = data.bullets.slice(0, 3);
  return (
    <div style={{
      width: 1080, height: 1920,
      background: `linear-gradient(180deg, ${data.bgColor} 0%, ${data.secondaryColor} 100%)`,
      fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
      display: "flex", flexDirection: "column", overflow: "hidden", position: "relative",
    }}>
      <div style={{ position: "absolute", top: -100, right: -100, width: 500, height: 500, borderRadius: "50%", background: `${data.primaryColor}22`, filter: "blur(60px)" }} />

      {/* Header */}
      <div style={{ padding: "100px 80px 30px", textAlign: "center" }}>
        <div style={{ display: "inline-block", background: `${data.primaryColor}33`, color: data.primaryColor, fontSize: 28, fontWeight: 800, padding: "12px 32px", borderRadius: 100, letterSpacing: 4, textTransform: "uppercase", marginBottom: 24, border: `2px solid ${data.primaryColor}66` }}>
          ¿Cómo usar?
        </div>
        <h1 style={{ color: data.accentColor, fontSize: 96, fontWeight: 900, lineHeight: 1, margin: 0, textTransform: "uppercase", letterSpacing: -2 }}>
          {data.headline}
        </h1>
        {data.subheadline && (
          <p style={{ color: `${data.accentColor}AA`, fontSize: 36, margin: "20px 0 0", fontWeight: 400 }}>
            {data.subheadline}
          </p>
        )}
      </div>

      {/* Product floating */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0" }}>
        {data.productImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={data.productImageUrl} alt="" crossOrigin="anonymous"
            style={{ width: 420, height: 420, objectFit: "contain", filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.5))" }} />
        ) : (
          <div style={{ width: 380, height: 380, borderRadius: 24, background: `${data.accentColor}10` }} />
        )}
      </div>

      {/* 3 steps */}
      <div style={{ flex: 1, padding: "30px 60px", display: "flex", flexDirection: "column", gap: 28, justifyContent: "center" }}>
        {steps.map((s, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 28,
            background: `linear-gradient(90deg, ${data.primaryColor}22, transparent)`,
            borderLeft: `8px solid ${data.primaryColor}`,
            borderRadius: 24,
            padding: "28px 32px",
          }}>
            <div style={{ flexShrink: 0, width: 110, height: 110, borderRadius: "50%", background: `linear-gradient(135deg, ${data.primaryColor}, ${data.primaryColor}CC)`, color: data.accentColor, fontSize: 64, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: `0 12px 24px ${data.primaryColor}55` }}>
              {i + 1}
            </div>
            <p style={{ color: data.accentColor, fontSize: 38, fontWeight: 700, margin: 0, lineHeight: 1.2, flex: 1 }}>{s}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: "20px 80px 80px", textAlign: "center" }}>
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

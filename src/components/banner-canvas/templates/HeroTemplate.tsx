"use client";
import type { BannerData } from "../types";

// ─── Hero Template A: Full-bleed gradient, product right, headline left ───────
export function HeroTemplateA({ data }: { data: BannerData }) {
  const bg = `linear-gradient(135deg, ${data.primaryColor}EE 0%, ${data.secondaryColor} 100%)`;
  return (
    <div
      style={{
        width: 1080, height: 1920,
        background: bg,
        display: "flex", flexDirection: "column",
        fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
        position: "relative", overflow: "hidden",
      }}
    >
      {/* Decorative circles */}
      <div style={{ position: "absolute", top: -200, right: -200, width: 600, height: 600, borderRadius: "50%", background: `${data.accentColor}18`, pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: 200, left: -150, width: 400, height: 400, borderRadius: "50%", background: `${data.primaryColor}22`, pointerEvents: "none" }} />

      {/* Top brand bar */}
      <div style={{ padding: "60px 80px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ height: 6, flex: 1, background: `${data.accentColor}40`, borderRadius: 3 }} />
        {data.country && (
          <span style={{ color: `${data.accentColor}99`, fontSize: 32, fontWeight: 600, letterSpacing: 6, margin: "0 30px", textTransform: "uppercase" }}>
            {data.country}
          </span>
        )}
        <div style={{ height: 6, flex: 1, background: `${data.accentColor}40`, borderRadius: 3 }} />
      </div>

      {/* Headline block */}
      <div style={{ padding: "80px 80px 0", flex: "none" }}>
        <h1 style={{
          color: data.accentColor, fontSize: 112, fontWeight: 900,
          lineHeight: 1.05, margin: 0, textTransform: "uppercase",
          letterSpacing: -2, textShadow: "0 4px 24px rgba(0,0,0,0.3)",
          overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical",
        }}>
          {data.headline}
        </h1>
        {data.subheadline && (
          <p style={{ color: `${data.accentColor}CC`, fontSize: 46, fontWeight: 400, margin: "24px 0 0", lineHeight: 1.3, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {data.subheadline}
          </p>
        )}
      </div>

      {/* Product image - centered with glow */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
        {/* Glow behind product */}
        <div style={{
          position: "absolute", width: 700, height: 700,
          borderRadius: "50%",
          background: `radial-gradient(circle, ${data.accentColor}30 0%, transparent 70%)`,
        }} />
        {data.productImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={data.productImageUrl}
            alt={data.productName}
            crossOrigin="anonymous"
            style={{ width: 700, height: 700, objectFit: "contain", position: "relative", zIndex: 1, filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.5))" }}
          />
        ) : (
          <div style={{ width: 700, height: 700, borderRadius: 40, background: `${data.accentColor}15`, border: `4px dashed ${data.accentColor}40`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: `${data.accentColor}60`, fontSize: 48 }}>Foto del producto</span>
          </div>
        )}
      </div>

      {/* CTA Button */}
      <div style={{ padding: "0 80px 120px", display: "flex", flexDirection: "column", gap: 30, alignItems: "flex-start" }}>
        <div style={{
          background: data.accentColor, color: data.secondaryColor,
          fontSize: 48, fontWeight: 800, padding: "32px 80px",
          borderRadius: 100, letterSpacing: 1, textTransform: "uppercase",
          boxShadow: `0 20px 60px rgba(0,0,0,0.3)`,
        }}>
          {data.cta}
        </div>
        {data.productName && (
          <p style={{ color: `${data.accentColor}80`, fontSize: 34, margin: 0, fontWeight: 300 }}>
            {data.productName}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Hero Template B: Split layout — photo top, text bottom ──────────────────
export function HeroTemplateB({ data }: { data: BannerData }) {
  return (
    <div style={{
      width: 1080, height: 1920,
      background: "#FAFAFA",
      display: "flex", flexDirection: "column",
      fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
      overflow: "hidden",
    }}>
      {/* Photo area */}
      <div style={{ height: 900, background: `linear-gradient(180deg, ${data.primaryColor}33 0%, ${data.primaryColor}88 100%)`, position: "relative", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, transparent 60%, #FAFAFA 100%)` }} />
        {data.productImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={data.productImageUrl} alt="" crossOrigin="anonymous"
            style={{ height: 820, width: 820, objectFit: "contain", filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.25))", position: "relative", zIndex: 1 }} />
        ) : (
          <div style={{ width: 600, height: 600, borderRadius: 40, background: "#e0e0e0" }} />
        )}
      </div>

      {/* Text area */}
      <div style={{ flex: 1, padding: "60px 80px", display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
        <div>
          <h1 style={{ color: data.secondaryColor, fontSize: 100, fontWeight: 900, lineHeight: 1.05, margin: 0, textTransform: "uppercase", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" }}>
            {data.headline}
          </h1>
          {data.subheadline && (
            <p style={{ color: "#666", fontSize: 44, margin: "20px 0 0", fontWeight: 400, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{data.subheadline}</p>
          )}
        </div>
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
          {data.bullets.slice(0, 3).map((b, i) => (
            <div key={i} style={{
              background: `${data.primaryColor}18`, borderRadius: 50,
              padding: "18px 36px", color: data.primaryColor,
              fontSize: 34, fontWeight: 700, border: `2px solid ${data.primaryColor}33`
            }}>{b}</div>
          ))}
        </div>
        <div style={{
          background: `linear-gradient(135deg, ${data.primaryColor}, ${data.secondaryColor})`,
          color: "#FFF", fontSize: 52, fontWeight: 800,
          padding: "38px 0", borderRadius: 20, textAlign: "center",
          letterSpacing: 2, textTransform: "uppercase",
        }}>
          {data.cta}
        </div>
      </div>
    </div>
  );
}

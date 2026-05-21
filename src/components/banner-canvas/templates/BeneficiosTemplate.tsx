"use client";
import type { BannerData } from "../types";

const ICONS = ["⚡", "🌿", "✨", "💪", "🔥", "🎯"];

export function BeneficiosTemplateA({ data }: { data: BannerData }) {
  const bullets = data.bullets.slice(0, 3);
  return (
    <div style={{
      width: 1080, height: 1920,
      background: `linear-gradient(160deg, #0A0A0F 0%, ${data.secondaryColor} 50%, #0A0A0F 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center",
      fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
      padding: "80px 80px",
      gap: 0,
    }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 60 }}>
        <div style={{ display: "inline-block", background: `${data.primaryColor}22`, border: `2px solid ${data.primaryColor}55`, borderRadius: 50, padding: "14px 48px", marginBottom: 32 }}>
          <span style={{ color: data.primaryColor, fontSize: 32, fontWeight: 700, letterSpacing: 4, textTransform: "uppercase" }}>Beneficios</span>
        </div>
        <h1 style={{ color: "#FFF", fontSize: 100, fontWeight: 900, margin: 0, lineHeight: 1.05, textTransform: "uppercase" }}>
          {data.headline}
        </h1>
      </div>

      {/* Product image */}
      <div style={{ position: "relative", marginBottom: 60 }}>
        <div style={{ position: "absolute", inset: -40, borderRadius: "50%", background: `radial-gradient(circle, ${data.primaryColor}40 0%, transparent 70%)` }} />
        {data.productImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={data.productImageUrl} alt="" crossOrigin="anonymous"
            style={{ width: 560, height: 560, objectFit: "contain", position: "relative", zIndex: 1, filter: "drop-shadow(0 30px 80px rgba(0,0,0,0.6))" }} />
        ) : (
          <div style={{ width: 560, height: 560, borderRadius: 40, background: "#222" }} />
        )}
      </div>

      {/* Benefits grid — 3 cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 28, width: "100%" }}>
        {bullets.map((b, i) => (
          <div key={i} style={{
            display: "flex", alignItems: "center", gap: 36,
            background: "rgba(255,255,255,0.05)", backdropFilter: "blur(10px)",
            border: `1px solid ${data.primaryColor}44`,
            borderRadius: 24, padding: "36px 48px",
          }}>
            <div style={{
              width: 90, height: 90, borderRadius: "50%", flexShrink: 0,
              background: `linear-gradient(135deg, ${data.primaryColor}, ${data.primaryColor}88)`,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 44,
            }}>
              {ICONS[i] ?? "✅"}
            </div>
            <div>
              <p style={{ color: "#FFF", fontSize: 48, fontWeight: 800, margin: 0, lineHeight: 1.1 }}>{b}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ marginTop: "auto", paddingTop: 60, width: "100%" }}>
        <div style={{
          background: `linear-gradient(135deg, ${data.primaryColor}, ${data.primaryColor}CC)`,
          color: "#FFF", fontSize: 52, fontWeight: 800,
          padding: "40px 0", borderRadius: 20,
          textAlign: "center", letterSpacing: 2, textTransform: "uppercase",
          boxShadow: `0 20px 60px ${data.primaryColor}66`,
        }}>
          {data.cta}
        </div>
      </div>
    </div>
  );
}

export function BeneficiosTemplateB({ data }: { data: BannerData }) {
  const bullets = data.bullets.slice(0, 4);
  return (
    <div style={{
      width: 1080, height: 1920,
      background: "#FFFFFF",
      display: "flex", flexDirection: "column",
      fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
      overflow: "hidden",
    }}>
      {/* Top color band */}
      <div style={{ height: 16, background: `linear-gradient(90deg, ${data.primaryColor}, ${data.secondaryColor})` }} />

      {/* Header */}
      <div style={{ background: `linear-gradient(135deg, ${data.primaryColor} 0%, ${data.secondaryColor} 100%)`, padding: "80px 80px 100px", position: "relative" }}>
        <h1 style={{ color: "#FFF", fontSize: 96, fontWeight: 900, margin: 0, lineHeight: 1.05, textTransform: "uppercase" }}>
          {data.headline}
        </h1>
        {data.subheadline && (
          <p style={{ color: "rgba(255,255,255,0.8)", fontSize: 40, margin: "20px 0 0" }}>{data.subheadline}</p>
        )}
      </div>

      {/* Product + benefits grid */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "60px 80px", gap: 50 }}>
        {/* Product centered */}
        <div style={{ display: "flex", justifyContent: "center" }}>
          {data.productImageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={data.productImageUrl} alt="" crossOrigin="anonymous"
              style={{ height: 500, width: 500, objectFit: "contain", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.2))" }} />
          ) : (
            <div style={{ width: 500, height: 500, borderRadius: 30, background: "#f0f0f0" }} />
          )}
        </div>

        {/* Benefits 2x2 grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 28 }}>
          {bullets.map((b, i) => (
            <div key={i} style={{
              background: `${data.primaryColor}10`,
              border: `2px solid ${data.primaryColor}33`,
              borderRadius: 24, padding: "40px 36px", textAlign: "center",
            }}>
              <div style={{ fontSize: 56, marginBottom: 16 }}>{ICONS[i] ?? "✅"}</div>
              <p style={{ color: data.secondaryColor, fontSize: 40, fontWeight: 800, margin: 0, lineHeight: 1.2 }}>{b}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA bottom */}
      <div style={{ padding: "0 80px 80px" }}>
        <div style={{
          background: `linear-gradient(135deg, ${data.primaryColor}, ${data.secondaryColor})`,
          color: "#FFF", fontSize: 52, fontWeight: 800,
          padding: "40px 0", borderRadius: 20, textAlign: "center",
          letterSpacing: 2, textTransform: "uppercase",
        }}>
          {data.cta}
        </div>
      </div>
    </div>
  );
}

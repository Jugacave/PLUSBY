"use client";
import type { BannerData } from "../types";

// ─── Ingredientes: producto centrado + 3 ingredientes alrededor ──────────────
export function IngredientesTemplateA({ data }: { data: BannerData }) {
  const ingredients = data.bullets.slice(0, 3);
  const leafColors = ["#10B981", "#F59E0B", "#EC4899"];
  return (
    <div style={{
      width: 1080, height: 1920,
      background: `linear-gradient(180deg, #F0FDF4 0%, ${data.primaryColor}22 100%)`,
      fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
      display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", maxHeight: 1920,
    }}>
      {/* Decorative leaves */}
      <div style={{ position: "absolute", top: -100, left: -100, width: 500, height: 500, borderRadius: "50%", background: `${leafColors[0]}22`, filter: "blur(40px)" }} />
      <div style={{ position: "absolute", bottom: 200, right: -150, width: 500, height: 500, borderRadius: "50%", background: `${leafColors[1]}22`, filter: "blur(40px)" }} />

      {/* Header */}
      <div style={{ padding: "100px 80px 20px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ display: "inline-block", background: data.primaryColor, color: "#FFFFFF", fontSize: 30, fontWeight: 800, padding: "12px 32px", borderRadius: 100, letterSpacing: 4, textTransform: "uppercase", marginBottom: 30 }}>
          100% Natural
        </div>
        <h1 style={{ color: data.secondaryColor, fontSize: 96, fontWeight: 900, lineHeight: 1, margin: 0, textTransform: "uppercase", letterSpacing: -2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {data.headline}
        </h1>
        {data.subheadline && (
          <p style={{ color: "#475569", fontSize: 36, margin: "20px 0 0", fontWeight: 400 }}>
            {data.subheadline}
          </p>
        )}
      </div>

      {/* Product + ingredient orbits */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", padding: "0 40px" }}>
        {/* Center product */}
        <div style={{ position: "relative", width: 560, height: 560, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ position: "absolute", inset: 0, borderRadius: "50%", background: `radial-gradient(circle, ${data.primaryColor}33 0%, transparent 70%)` }} />
          {data.productImageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={data.productImageUrl} alt="" crossOrigin="anonymous"
              style={{ width: 520, height: 520, objectFit: "contain", filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.25))", zIndex: 1 }} />
          ) : (
            <div style={{ width: 480, height: 480, borderRadius: 32, background: `${data.primaryColor}22` }} />
          )}
        </div>

        {/* Ingredient pills - absolute positioned */}
        {ingredients.map((ing, i) => {
          const positions = [
            { top: 20, left: 20 },
            { top: 20, right: 20 },
            { bottom: 20, left: "50%", transform: "translateX(-50%)" as const },
          ];
          const pos = positions[i] ?? positions[0];
          const color = leafColors[i] ?? data.primaryColor;
          return (
            <div key={i} style={{
              position: "absolute", ...pos,
              background: "#FFFFFF", borderRadius: 24,
              padding: "24px 28px",
              display: "flex", alignItems: "center", gap: 16,
              boxShadow: `0 20px 40px rgba(0,0,0,0.15)`,
              border: `3px solid ${color}`,
              maxWidth: 340,
            }}>
              <div style={{ flexShrink: 0, width: 64, height: 64, borderRadius: "50%", background: `linear-gradient(135deg, ${color}, ${color}CC)`, color: "#FFFFFF", fontSize: 36, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center" }}>🌿</div>
              <p style={{ color: data.secondaryColor, fontSize: 26, fontWeight: 800, margin: 0, lineHeight: 1.15, textTransform: "uppercase" }}>{ing}</p>
            </div>
          );
        })}
      </div>

      {/* CTA */}
      <div style={{ padding: "40px 80px 80px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{
          background: `linear-gradient(135deg, ${data.primaryColor}, ${leafColors[0]})`,
          color: "#FFFFFF", fontSize: 52, fontWeight: 800,
          padding: "30px 0", borderRadius: 100,
          letterSpacing: 2, textTransform: "uppercase",
          boxShadow: `0 20px 40px ${data.primaryColor}55`,
        }}>
          {data.cta}
        </div>
      </div>
    </div>
  );
}

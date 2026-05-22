"use client";
import type { BannerData } from "../types";

export function AntesDespuesTemplateA({ data }: { data: BannerData }) {
  return (
    <div style={{
      width: 1080, height: 1920,
      display: "flex", flexDirection: "column",
      fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
      overflow: "hidden",
    }}>
      {/* ANTES — top half, problem state */}
      <div style={{
        flex: 1,
        background: `linear-gradient(180deg, #2a2a2a 0%, #1a1a1a 100%)`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        position: "relative", padding: "60px 80px",
      }}>
        {/* Grayscale overlay effect */}
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)" }} />
        <div style={{
          position: "absolute", top: 50, left: 50,
          background: "rgba(255,255,255,0.15)", borderRadius: 16,
          padding: "18px 54px",
        }}>
          <span style={{ color: "#FFF", fontSize: 52, fontWeight: 900, letterSpacing: 6 }}>ANTES</span>
        </div>
        {/* Problem visual — desaturated / problem emoji */}
        <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 160, marginBottom: 30, filter: "grayscale(100%)" }}>😞</div>
          <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 52, fontWeight: 400, margin: 0, lineHeight: 1.3 }}>
            {data.subheadline ?? "Sin resultados. Sin solución."}
          </p>
        </div>
      </div>

      {/* Divider with product */}
      <div style={{ height: 220, background: `linear-gradient(135deg, ${data.primaryColor}, ${data.secondaryColor})`, display: "flex", alignItems: "center", justifyContent: "center", position: "relative", zIndex: 2 }}>
        {data.productImageUrl && (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={data.productImageUrl} alt="" crossOrigin="anonymous"
            style={{ height: 340, width: 340, objectFit: "contain", filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.5))" }} />
        )}
        {/* VS chip */}
        <div style={{
          position: "absolute", right: 80,
          background: "#FFF", borderRadius: "50%", width: 100, height: 100,
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
        }}>
          <span style={{ color: data.primaryColor, fontSize: 36, fontWeight: 900 }}>VS</span>
        </div>
      </div>

      {/* DESPUÉS — bottom half, result state */}
      <div style={{
        flex: 1,
        background: `linear-gradient(180deg, ${data.primaryColor}22 0%, ${data.primaryColor}44 100%)`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        position: "relative", padding: "60px 80px",
      }}>
        <div style={{
          position: "absolute", top: 50, left: 50,
          background: data.primaryColor, borderRadius: 16,
          padding: "18px 54px",
          boxShadow: `0 10px 30px ${data.primaryColor}66`,
        }}>
          <span style={{ color: "#FFF", fontSize: 52, fontWeight: 900, letterSpacing: 6 }}>DESPUÉS</span>
        </div>
        <div style={{ textAlign: "center", zIndex: 1 }}>
          <div style={{ fontSize: 160, marginBottom: 30 }}>✨</div>
          <h2 style={{ color: data.secondaryColor, fontSize: 72, fontWeight: 900, margin: "0 0 30px", lineHeight: 1.1, textTransform: "uppercase", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
            {data.headline}
          </h2>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", justifyContent: "center" }}>
            {data.bullets.slice(0, 3).map((b, i) => (
              <div key={i} style={{
                background: data.primaryColor, color: "#FFF",
                fontSize: 34, fontWeight: 700, borderRadius: 50,
                padding: "14px 34px",
              }}>
                ✓ {b}
              </div>
            ))}
          </div>
        </div>
        {/* CTA bottom */}
        <div style={{ position: "absolute", bottom: 60, left: 80, right: 80 }}>
          <div style={{
            background: `linear-gradient(135deg, ${data.primaryColor}, ${data.secondaryColor})`,
            color: "#FFF", fontSize: 52, fontWeight: 800,
            padding: "36px 0", borderRadius: 18, textAlign: "center",
            letterSpacing: 2, textTransform: "uppercase",
          }}>
            {data.cta}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import type { BannerData } from "../types";

export function OfertaTemplateA({ data }: { data: BannerData }) {
  return (
    <div style={{
      width: 1080, height: 1920,
      background: `linear-gradient(160deg, ${data.secondaryColor} 0%, #1a0a00 100%)`,
      display: "flex", flexDirection: "column", alignItems: "center",
      fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
      padding: "80px 80px",
      position: "relative", overflow: "hidden",
    }}>
      {/* Burst decoration */}
      <div style={{ position: "absolute", top: -300, right: -300, width: 800, height: 800, borderRadius: "50%", background: `${data.primaryColor}20` }} />
      <div style={{ position: "absolute", bottom: -200, left: -200, width: 600, height: 600, borderRadius: "50%", background: `${data.primaryColor}15` }} />

      {/* SALE badge */}
      {data.saleLabel && (
        <div style={{
          background: `linear-gradient(135deg, ${data.primaryColor}, ${data.primaryColor}CC)`,
          color: "#FFF", fontSize: 52, fontWeight: 900, letterSpacing: 4,
          padding: "24px 80px", borderRadius: 100, marginBottom: 50,
          textTransform: "uppercase",
          boxShadow: `0 20px 60px ${data.primaryColor}88`,
        }}>
          {data.saleLabel}
        </div>
      )}

      {/* Headline */}
      <h1 style={{ color: "#FFF", fontSize: 96, fontWeight: 900, margin: "0 0 20px", textAlign: "center", lineHeight: 1.05, textTransform: "uppercase" }}>
        {data.headline}
      </h1>

      {/* Product image */}
      <div style={{ position: "relative", margin: "40px 0" }}>
        <div style={{ position: "absolute", inset: -60, borderRadius: "50%", background: `radial-gradient(circle, ${data.primaryColor}50 0%, transparent 70%)` }} />
        {data.productImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={data.productImageUrl} alt="" crossOrigin="anonymous"
            style={{ width: 620, height: 620, objectFit: "contain", position: "relative", zIndex: 1, filter: "drop-shadow(0 40px 80px rgba(0,0,0,0.7))" }} />
        ) : (
          <div style={{ width: 620, height: 620, borderRadius: 40, background: "#222" }} />
        )}
      </div>

      {/* Price block */}
      <div style={{ textAlign: "center", marginBottom: 50 }}>
        {data.priceOriginal && (
          <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 56, fontWeight: 500, textDecoration: "line-through", marginBottom: 8 }}>
            {data.priceOriginal}
          </div>
        )}
        {data.priceSale && (
          <div style={{ color: data.primaryColor, fontSize: 160, fontWeight: 900, lineHeight: 1, filter: `drop-shadow(0 0 40px ${data.primaryColor}88)` }}>
            {data.priceSale}
          </div>
        )}
      </div>

      {/* Bullets */}
      {data.bullets.length > 0 && (
        <div style={{ display: "flex", gap: 20, flexWrap: "wrap", justifyContent: "center", marginBottom: 50 }}>
          {data.bullets.slice(0, 3).map((b, i) => (
            <div key={i} style={{ background: "rgba(255,255,255,0.1)", borderRadius: 50, padding: "16px 36px", color: "rgba(255,255,255,0.9)", fontSize: 34, fontWeight: 600, border: "1px solid rgba(255,255,255,0.2)" }}>
              ✓ {b}
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div style={{ width: "100%", marginTop: "auto" }}>
        <div style={{
          background: `linear-gradient(135deg, ${data.primaryColor}, ${data.primaryColor}BB)`,
          color: "#FFF", fontSize: 60, fontWeight: 900,
          padding: "46px 0", borderRadius: 20, textAlign: "center",
          textTransform: "uppercase", letterSpacing: 3,
          boxShadow: `0 24px 80px ${data.primaryColor}66`,
        }}>
          {data.cta}
        </div>
      </div>
    </div>
  );
}

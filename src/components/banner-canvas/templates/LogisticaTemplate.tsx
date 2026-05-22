"use client";
import type { BannerData } from "../types";

// ─── Logística: 3 íconos en fila (envío, garantía, pago) ─────────────────────
export function LogisticaTemplateA({ data }: { data: BannerData }) {
  const items = data.bullets.slice(0, 3);
  const icons = ["🚚", "🛡️", "🔒"];
  return (
    <div style={{
      width: 1080, height: 1920,
      background: `linear-gradient(180deg, ${data.bgColor} 0%, ${data.secondaryColor} 100%)`,
      fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
      display: "flex", flexDirection: "column", overflow: "hidden", position: "relative",
    }}>
      {/* Header */}
      <div style={{ padding: "100px 80px 30px", textAlign: "center" }}>
        <h1 style={{ color: data.accentColor, fontSize: 100, fontWeight: 900, lineHeight: 1, margin: 0, textTransform: "uppercase", letterSpacing: -2 }}>
          {data.headline}
        </h1>
        {data.subheadline && (
          <p style={{ color: `${data.accentColor}AA`, fontSize: 38, margin: "20px 0 0", fontWeight: 400 }}>
            {data.subheadline}
          </p>
        )}
      </div>

      {/* Product hero */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "20px 0", position: "relative" }}>
        <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, ${data.primaryColor}33 0%, transparent 70%)` }} />
        {data.productImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img src={data.productImageUrl} alt="" crossOrigin="anonymous"
            style={{ width: 520, height: 520, objectFit: "contain", filter: "drop-shadow(0 30px 60px rgba(0,0,0,0.4))", position: "relative", zIndex: 1 }} />
        ) : (
          <div style={{ width: 480, height: 480, borderRadius: 24, background: `${data.accentColor}10` }} />
        )}
      </div>

      {/* 3 logistics cards */}
      <div style={{ flex: 1, display: "flex", gap: 22, padding: "40px 60px", alignItems: "stretch" }}>
        {items.map((b, i) => (
          <div key={i} style={{
            flex: 1, background: `linear-gradient(180deg, ${data.primaryColor}1A 0%, ${data.primaryColor}33 100%)`,
            border: `2px solid ${data.primaryColor}55`,
            borderRadius: 28, padding: "36px 20px",
            display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center",
            boxShadow: `0 16px 32px rgba(0,0,0,0.2)`,
          }}>
            <div style={{ width: 110, height: 110, borderRadius: "50%", background: data.primaryColor, color: data.accentColor, fontSize: 56, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 24, boxShadow: `0 12px 24px ${data.primaryColor}66` }}>
              {icons[i]}
            </div>
            <p style={{ color: data.accentColor, fontSize: 28, fontWeight: 800, margin: 0, lineHeight: 1.2, textTransform: "uppercase", letterSpacing: 0.5 }}>{b}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: "20px 80px 80px", textAlign: "center" }}>
        <div style={{
          background: `linear-gradient(135deg, ${data.primaryColor}, ${data.primaryColor}DD)`,
          color: data.accentColor, fontSize: 52, fontWeight: 800,
          padding: "32px 0", borderRadius: 100,
          letterSpacing: 2, textTransform: "uppercase",
          boxShadow: `0 24px 50px ${data.primaryColor}66`,
        }}>
          {data.cta}
        </div>
      </div>
    </div>
  );
}

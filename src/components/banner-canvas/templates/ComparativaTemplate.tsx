"use client";
import type { BannerData } from "../types";

// ─── Comparativa: NOSOTROS vs OTROS — two vertical columns ────────────────────
export function ComparativaTemplateA({ data }: { data: BannerData }) {
  const ourLabel = data.ourLabel || "NOSOTROS";
  const othersLabel = data.othersLabel || "OTROS";
  const ourItems = data.bullets.slice(0, 4);
  const othersItems = data.bullets.slice(4, 8).length ? data.bullets.slice(4, 8) : ourItems.map(() => "");

  return (
    <div style={{
      width: 1080, height: 1920,
      background: `linear-gradient(180deg, ${data.bgColor} 0%, ${data.secondaryColor} 100%)`,
      fontFamily: "'Poppins', 'Segoe UI', Arial, sans-serif",
      display: "flex", flexDirection: "column", overflow: "hidden", position: "relative",
    }}>
      {/* Decorative diagonal split */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: `linear-gradient(90deg, #10B981, #EF4444)` }} />

      {/* Headline */}
      <div style={{ padding: "100px 80px 40px", textAlign: "center" }}>
        <h1 style={{ color: data.accentColor, fontSize: 96, fontWeight: 900, lineHeight: 1, margin: 0, textTransform: "uppercase", letterSpacing: -2, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>
          {data.headline}
        </h1>
        {data.subheadline && (
          <p style={{ color: `${data.accentColor}AA`, fontSize: 38, margin: "20px 0 0", fontWeight: 400 }}>
            {data.subheadline}
          </p>
        )}
      </div>

      {/* Two-column comparison */}
      <div style={{ flex: 1, display: "flex", gap: 30, padding: "20px 60px 40px" }}>
        {/* NOSOTROS column */}
        <div style={{ flex: 1, background: `linear-gradient(180deg, #10B981 0%, #047857 100%)`, borderRadius: 32, padding: "40px 32px", display: "flex", flexDirection: "column", boxShadow: "0 30px 60px rgba(16,185,129,0.25)" }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ display: "inline-block", background: "#FFFFFF", color: "#047857", fontSize: 44, fontWeight: 900, padding: "16px 40px", borderRadius: 100, textTransform: "uppercase", letterSpacing: 2 }}>
              {ourLabel}
            </div>
          </div>
          {data.productImageUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={data.productImageUrl} alt="" crossOrigin="anonymous"
              style={{ width: "100%", height: 360, objectFit: "contain", margin: "10px 0 24px", filter: "drop-shadow(0 20px 40px rgba(0,0,0,0.3))" }} />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 22, flex: 1 }}>
            {ourItems.map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: "50%", background: "#FFFFFF", color: "#047857", fontSize: 32, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>✓</div>
                <p style={{ color: "#FFFFFF", fontSize: 28, fontWeight: 600, margin: 0, lineHeight: 1.25 }}>{b}</p>
              </div>
            ))}
          </div>
        </div>

        {/* OTROS column */}
        <div style={{ flex: 1, background: `linear-gradient(180deg, #4B5563 0%, #1F2937 100%)`, borderRadius: 32, padding: "40px 32px", display: "flex", flexDirection: "column", opacity: 0.92 }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <div style={{ display: "inline-block", background: "#1F2937", color: "#9CA3AF", fontSize: 44, fontWeight: 900, padding: "16px 40px", borderRadius: 100, textTransform: "uppercase", letterSpacing: 2, border: "3px solid #4B5563" }}>
              {othersLabel}
            </div>
          </div>
          <div style={{ width: "100%", height: 360, margin: "10px 0 24px", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 240, height: 320, borderRadius: 24, background: "#374151", border: "4px dashed #4B5563", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#6B7280", fontSize: 100, fontWeight: 900 }}>?</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 22, flex: 1 }}>
            {othersItems.map((b, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
                <div style={{ flexShrink: 0, width: 52, height: 52, borderRadius: "50%", background: "#EF4444", color: "#FFFFFF", fontSize: 30, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>✕</div>
                <p style={{ color: "#D1D5DB", fontSize: 28, fontWeight: 500, margin: 0, lineHeight: 1.25, textDecoration: "line-through", textDecorationColor: "#EF444488" }}>{b || "—"}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: "0 80px 80px", textAlign: "center" }}>
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

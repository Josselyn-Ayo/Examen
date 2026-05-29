import { ResetPasswordForm } from "@/features/reset-password/ui/ResetPasswordForm";
import type { CSSProperties } from "react";

const CAT_HEADER = "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=600&q=80";

const KeySvg = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
  </svg>
);

const FloatingOrbs = () => (
  <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
    <div style={{
      position: "absolute", top: "-10%", left: "-5%",
      width: "500px", height: "500px", borderRadius: "50%",
      background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)",
      animation: "float-2 22s ease-in-out infinite",
    }} />
    <div style={{
      position: "absolute", bottom: "-15%", right: "-10%",
      width: "600px", height: "600px", borderRadius: "50%",
      background: "radial-gradient(circle, rgba(52,211,153,0.1) 0%, transparent 70%)",
      animation: "float-1 25s ease-in-out infinite",
    }} />
  </div>
);

const PawSvg = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <ellipse cx="8" cy="6" rx="2.2" ry="2.8" opacity="0.9"/>
    <ellipse cx="16" cy="6" rx="2.2" ry="2.8" opacity="0.9"/>
    <ellipse cx="4.5" cy="11" rx="2" ry="2.5" opacity="0.8"/>
    <ellipse cx="19.5" cy="11" rx="2" ry="2.5" opacity="0.8"/>
    <ellipse cx="12" cy="15" rx="4.5" ry="4" opacity="0.9"/>
  </svg>
);

const FloatingPaws = () => (
  <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
    {[
      { top: "10%", right: "6%", size: 26, delay: "0s", dur: "6s" },
      { top: "65%", left: "4%", size: 30, delay: "1.5s", dur: "7s" },
      { top: "85%", right: "10%", size: 22, delay: "3s", dur: "5.5s" },
    ].map((p, i) => (
      <div key={i} style={{
        position: "absolute",
        top: p.top, left: (p as any).left, right: (p as any).right,
        animation: `float-paw ${p.dur} ease-in-out infinite`,
        animationDelay: p.delay,
      }}>
        <PawSvg size={p.size} color="rgba(5,150,105,0.06)" />
      </div>
    ))}
  </div>
);

export const ResetPasswordPage = () => (
  <main style={layout}>
    <FloatingOrbs />
    <FloatingPaws />
    <div style={card}>
      <div style={header}>
        <div style={headerOverlay} />
        <img src={CAT_HEADER} alt="" style={headerBg} />
        <div style={headerContent}>
          <div style={{
            width: "64px", height: "64px", borderRadius: "18px",
            background: "rgba(255,255,255,0.25)",
            backdropFilter: "blur(12px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 12px",
            border: "1.5px solid rgba(255,255,255,0.4)",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)",
          }}>
            <KeySvg />
          </div>
          <h1 style={{
            color: "#fff", margin: "0 0 4px", fontSize: "26px", fontWeight: "900",
            letterSpacing: "-0.5px",
            textShadow: "0 2px 10px rgba(0,0,0,0.15)",
          }}>
            Nueva contraseña
          </h1>
          <p style={{
            color: "rgba(255,255,255,0.9)", margin: 0, fontSize: "14px",
            fontWeight: "600", letterSpacing: "0.3px",
            textShadow: "0 1px 6px rgba(0,0,0,0.15)",
          }}>
            PetAdopt — Recuperación de acceso
          </p>
        </div>
      </div>
      <div style={{ padding: "40px 32px" }}>
        <ResetPasswordForm />
      </div>
    </div>
  </main>
);

const layout: CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(145deg, #f0fdf4 0%, #ecfdf5 30%, #d1fae5 60%, #a7f3d0 100%)",
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: "24px", position: "relative",
};

const card: CSSProperties = {
  background: "rgba(255, 255, 255, 0.8)",
  backdropFilter: "blur(20px)",
  WebkitBackdropFilter: "blur(20px)",
  borderRadius: "28px",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.15), 0 0 0 1px rgba(255,255,255,0.4), 0 0 60px rgba(16,185,129,0.08)",
  width: "100%", maxWidth: "460px", overflow: "hidden",
  animation: "fadeInScale 0.5s ease-out",
  border: "1px solid rgba(255,255,255,0.5)",
};

const header: CSSProperties = {
  position: "relative",
  padding: "40px 32px 32px",
  textAlign: "center",
  overflow: "hidden",
  minHeight: "180px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const headerBg: CSSProperties = {
  position: "absolute",
  inset: 0,
  width: "100%",
  height: "100%",
  objectFit: "cover",
  animation: "ken-burns 20s ease-in-out infinite",
};

const headerOverlay: CSSProperties = {
  position: "absolute",
  inset: 0,
  background: "linear-gradient(135deg, rgba(5,150,105,0.75) 0%, rgba(16,185,129,0.65) 40%, rgba(52,211,153,0.55) 100%)",
  zIndex: 1,
};

const headerContent: CSSProperties = {
  position: "relative",
  zIndex: 2,
};

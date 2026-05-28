import { ResetPasswordForm } from "@/features/reset-password/ui/ResetPasswordForm";
import type { CSSProperties } from "react";

export const ResetPasswordPage = () => (
  <main style={layout}>
    <div style={card}>
      <div style={header}>
        <div style={{ fontSize: "36px" }}>🔑</div>
        <h1 style={{ color: "#fff", margin: "8px 0 4px", fontSize: "22px", fontWeight: "800" }}>
          Nueva contraseña
        </h1>
        <p style={{ color: "rgba(255,255,255,0.85)", margin: 0, fontSize: "14px", fontWeight: "500" }}>
          PetAdopt — Recuperación de acceso
        </p>
      </div>
      <div style={{ padding: "36px 28px" }}>
        <ResetPasswordForm />
      </div>
    </div>
  </main>
);

const layout: CSSProperties = {
  minHeight: "100vh",
  background: "linear-gradient(135deg, #f0fdf4 0%, #ecfdf5 50%, #d1fae5 100%)",
  display: "flex", alignItems: "center", justifyContent: "center",
  padding: "24px",
};
const card: CSSProperties = {
  background: "#fff", borderRadius: "24px",
  boxShadow: "0 20px 60px rgba(5,150,105,0.12), 0 4px 12px rgba(0,0,0,0.05)",
  width: "100%", maxWidth: "440px", overflow: "hidden",
};
const header: CSSProperties = {
  background: "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)",
  padding: "32px 32px 24px", textAlign: "center",
};
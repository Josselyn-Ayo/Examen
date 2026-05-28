import { useConfirmEmail } from "@/features/confirm-email/model/useConfirmEmail";
import type { CSSProperties } from "react";

const APP_DEEP_LINK = "michatapp://";

export const ConfirmEmailPage = () => {
  const { status, error } = useConfirmEmail();

  const content = () => {
    if (status === "loading") return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>🐾</div>
        <div style={{
          width: "40px", height: "40px", border: "3px solid #e5e7eb",
          borderTopColor: "#059669", borderRadius: "50%", margin: "0 auto 20px",
          animation: "spin 0.8s linear infinite",
        }} />
        <h2 style={{ color: "#1f2937", fontSize: "20px", fontWeight: "700" }}>
          Verificando tu cuenta...
        </h2>
        <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "8px" }}>
          Estamos confirmando tu registro para adoptar mascotas.
        </p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
    if (status === "error") return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "56px", marginBottom: "16px" }}>😿</div>
        <h2 style={{ color: "#dc2626", fontSize: "20px", fontWeight: "700", marginBottom: "8px" }}>
          Link inválido o expirado
        </h2>
        <p style={{ color: "#6b7280", fontSize: "14px" }}>{error}</p>
        <p style={{ color: "#9ca3af", fontSize: "13px", marginTop: "12px" }}>
          Solicita un nuevo enlace desde la app móvil.
        </p>
      </div>
    );
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "72px", marginBottom: "16px" }}>🎉</div>
        <div style={{
          display: "inline-block", padding: "6px 14px", borderRadius: "999px",
          background: "#ecfdf5", color: "#059669", fontSize: "12px", fontWeight: "700",
          textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px",
        }}>
          Cuenta verificada
        </div>
        <h2 style={{ color: "#059669", fontSize: "22px", fontWeight: "800", marginBottom: "10px" }}>
          ¡Bienvenido a PetAdopt!
        </h2>
        <p style={{ color: "#374151", fontSize: "15px", marginBottom: "6px" }}>
          Tu cuenta ha sido verificada exitosamente.
        </p>
        <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "24px" }}>
          Ya puedes buscar y adoptar mascotas, o publicarlas si eres un refugio.
        </p>
        <a
          href={APP_DEEP_LINK}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            padding: "14px 28px",
            background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
            color: "#fff", borderRadius: "12px", textDecoration: "none",
            fontWeight: "700", fontSize: "15px",
            boxShadow: "0 4px 14px rgba(5,150,105,0.35)",
          }}
        >
          🐾 Abrir la app
        </a>
        <p style={{ color: "#9ca3af", fontSize: "12px", marginTop: "16px" }}>
          Si no se abre automáticamente, busca PetAdopt en tu teléfono.
        </p>
      </div>
    );
  };

  return (
    <main style={layout}>
      <div style={card}>
        <div style={header}>
          <div style={{ fontSize: "36px" }}>🐕</div>
          <h1 style={{ color: "#fff", margin: "8px 0 4px", fontSize: "22px", fontWeight: "800" }}>
            PetAdopt
          </h1>
          <p style={{ color: "rgba(255,255,255,0.85)", margin: 0, fontSize: "14px", fontWeight: "500" }}>
            Confirmación de cuenta
          </p>
        </div>
        <div style={{ padding: "36px 28px" }}>{content()}</div>
      </div>
    </main>
  );
};

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
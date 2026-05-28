import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { useState } from "react";
import { useResetPassword } from "../model/useResetPassword";

const APP_DEEP_LINK = "michatapp://";

export const ResetPasswordForm = () => {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [valError, setValError] = useState("");
  const [didSubmit, setDidSubmit] = useState(false);
  const { status, error, updatePassword } = useResetPassword();

  const handleSubmit = async () => {
    setDidSubmit(true);
    setValError("");
    if (password.length < 8) {
      setValError("La contraseña debe tener al menos 8 caracteres.");
      return;
    }
    if (password !== confirm) {
      setValError("Las contraseñas no coinciden.");
      return;
    }
    await updatePassword(password);
  };

  if (status === "loading") {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{ fontSize: "36px", marginBottom: "12px" }}>🐾</div>
        <div style={{
          width: "36px", height: "36px", border: "3px solid #e5e7eb",
          borderTopColor: "#059669", borderRadius: "50%", margin: "0 auto 16px",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ color: "#6b7280", fontSize: "14px" }}>Verificando enlace de recuperación...</p>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: "64px", marginBottom: "16px" }}>🎉</div>
        <div style={{
          display: "inline-block", padding: "6px 14px", borderRadius: "999px",
          background: "#ecfdf5", color: "#059669", fontSize: "12px", fontWeight: "700",
          textTransform: "uppercase", letterSpacing: "1px", marginBottom: "16px",
        }}>
          Contraseña actualizada
        </div>
        <h3 style={{ color: "#059669", fontSize: "20px", fontWeight: "800", marginBottom: "8px" }}>
          ¡Contraseña actualizada!
        </h3>
        <p style={{ color: "#6b7280", fontSize: "14px", marginBottom: "8px" }}>
          Tu contraseña ha sido cambiada exitosamente.
        </p>
        <p style={{ color: "#9ca3af", fontSize: "13px", marginBottom: "24px" }}>
          Regresa a la app e inicia sesión con tu nueva contraseña.
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
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
      <Input
        label="Nueva contraseña"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="Mínimo 8 caracteres"
        icon="🔒"
      />
      <Input
        label="Confirmar contraseña"
        type="password"
        value={confirm}
        onChange={setConfirm}
        placeholder="Repite tu contraseña"
        icon="🔒"
      />
      {(valError || (didSubmit && error)) && (
        <div style={{
          padding: "10px 14px", borderRadius: "10px",
          background: "#fef2f2", border: "1px solid #fecaca",
        }}>
          <p style={{ color: "#dc2626", fontSize: "14px", margin: 0, fontWeight: "500" }}>
            {valError || (didSubmit ? error : null)}
          </p>
        </div>
      )}
      <Button onClick={handleSubmit} isLoading={status === "updating"}>
        Actualizar contraseña
      </Button>
    </div>
  );
};
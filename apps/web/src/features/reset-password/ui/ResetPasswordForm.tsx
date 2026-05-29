import { Button } from "@/shared/ui/Button";
import { Input } from "@/shared/ui/Input";
import { useState } from "react";
import { useResetPassword } from "../model/useResetPassword";

const APP_DEEP_LINK = "michatapp://";

const HAPPY_DOG = "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=300&q=80";

const PawSvg = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <ellipse cx="8" cy="6" rx="2.2" ry="2.8" opacity="0.9"/>
    <ellipse cx="16" cy="6" rx="2.2" ry="2.8" opacity="0.9"/>
    <ellipse cx="4.5" cy="11" rx="2" ry="2.5" opacity="0.8"/>
    <ellipse cx="19.5" cy="11" rx="2" ry="2.5" opacity="0.8"/>
    <ellipse cx="12" cy="15" rx="4.5" ry="4" opacity="0.9"/>
  </svg>
);

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

  const strength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = ["#e5e7eb", "#f59e0b", "#10b981", "#059669"];
  const strengthLabels = ["", "Débil", "Buena", "Fuerte"];

  if (status === "loading") {
    return (
      <div style={{ textAlign: "center", padding: "20px 0" }}>
        <div style={{
          width: "72px", height: "72px", borderRadius: "50%",
          background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
          animation: "pulse-soft 2s ease-in-out infinite",
        }}>
          <PawSvg size={32} color="#059669" />
        </div>
        <div style={{
          width: "36px", height: "36px", border: "3px solid rgba(5,150,105,0.15)",
          borderTopColor: "#059669", borderRadius: "50%",
          margin: "0 auto 16px",
          animation: "spin 0.8s linear infinite",
        }} />
        <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.6" }}>
          Verificando enlace de recuperación...
        </p>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "110px", height: "110px", borderRadius: "50%",
          overflow: "hidden", margin: "0 auto 20px",
          boxShadow: "0 0 0 4px #fff, 0 0 0 6px rgba(16,185,129,0.3), 0 0 0 10px rgba(16,185,129,0.1), 0 8px 25px rgba(5,150,105,0.2)",
          animation: "bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards",
        }}>
          <img src={HAPPY_DOG} alt="Perro feliz" style={{
            width: "100%", height: "100%", objectFit: "cover",
          }} />
        </div>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: "6px",
          padding: "6px 16px", borderRadius: "999px",
          background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
          color: "#059669", fontSize: "11px", fontWeight: "800",
          textTransform: "uppercase", letterSpacing: "1.5px", marginBottom: "16px",
          border: "1px solid rgba(16,185,129,0.2)",
          animation: "fadeInUp 0.5s ease-out 0.2s both",
        }}>
          Contraseña actualizada
        </div>
        <h3 style={{
          color: "#065f46", fontSize: "22px", fontWeight: "900",
          marginBottom: "10px", letterSpacing: "-0.3px",
          animation: "fadeInUp 0.5s ease-out 0.3s both",
        }}>
          Contraseña actualizada!
        </h3>
        <p style={{
          color: "#6b7280", fontSize: "14px", marginBottom: "8px", lineHeight: "1.6",
          animation: "fadeInUp 0.5s ease-out 0.4s both",
        }}>
          Tu contraseña ha sido cambiada exitosamente.
        </p>
        <p style={{
          color: "#9ca3af", fontSize: "13px", marginBottom: "28px", lineHeight: "1.6",
          animation: "fadeInUp 0.5s ease-out 0.5s both",
        }}>
          Regresa a la app e inicia sesión con tu nueva contraseña.
        </p>
        <a
          href={APP_DEEP_LINK}
          style={{
            display: "inline-flex", alignItems: "center", gap: "10px",
            padding: "16px 32px",
            background: "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)",
            color: "#fff", borderRadius: "16px", textDecoration: "none",
            fontWeight: "800", fontSize: "15px",
            boxShadow: "0 8px 25px rgba(5,150,105,0.35), 0 4px 10px rgba(5,150,105,0.15)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            animation: "fadeInUp 0.5s ease-out 0.6s both",
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 12px 35px rgba(5,150,105,0.45), 0 6px 14px rgba(5,150,105,0.2)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "0 8px 25px rgba(5,150,105,0.35), 0 4px 10px rgba(5,150,105,0.15)";
          }}
        >
          <PawSvg size={20} color="#fff" />
          Abrir la app
        </a>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "12px",
        padding: "14px 18px", borderRadius: "16px",
        background: "linear-gradient(135deg, rgba(236,253,245,0.8), rgba(209,250,229,0.6))",
        border: "1px solid rgba(16,185,129,0.15)",
      }}>
        <PawSvg size={22} color="#059669" />
        <p style={{ color: "#065f46", fontSize: "13px", fontWeight: "600", margin: 0, lineHeight: "1.5" }}>
          Crea una contraseña segura para proteger tu cuenta y a tus mascotas.
        </p>
      </div>
      <Input
        label="Nueva contraseña"
        type="password"
        value={password}
        onChange={setPassword}
        placeholder="Mínimo 8 caracteres"
        icon="🔒"
      />
      {password.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "-8px" }}>
          <div style={{ display: "flex", gap: "4px", flex: 1 }}>
            {[0, 1, 2].map(i => (
              <div key={i} style={{
                height: "4px", flex: 1, borderRadius: "2px",
                background: i <= strength - 1 ? strengthColors[strength] : "#e5e7eb",
                transition: "all 0.3s ease",
              }} />
            ))}
          </div>
          <span style={{
            fontSize: "11px", fontWeight: "700",
            color: strengthColors[strength],
            textTransform: "uppercase", letterSpacing: "0.5px",
          }}>
            {strengthLabels[strength]}
          </span>
        </div>
      )}
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
          padding: "12px 16px", borderRadius: "14px",
          background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
          border: "1px solid rgba(252,165,165,0.5)",
          display: "flex", alignItems: "center", gap: "8px",
          animation: "fadeInUp 0.3s ease-out",
        }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p style={{ color: "#dc2626", fontSize: "13px", margin: 0, fontWeight: "600" }}>
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

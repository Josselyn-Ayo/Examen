import { CSSProperties, ReactNode, useState } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  type?: "button" | "submit" | "reset";
  variant?: "primary" | "ghost" | "success";
  disabled?: boolean;
  isLoading?: boolean;
}

export const Button = ({
  children, onClick, type = "button",
  variant = "primary", disabled, isLoading,
}: ButtonProps) => {
  const [hovered, setHovered] = useState(false);
  const isDisabled = disabled || isLoading;

  const base: CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: "8px", padding: "15px 28px", borderRadius: "14px",
    fontSize: "15px", fontWeight: "700", cursor: isDisabled ? "not-allowed" : "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    border: "none", width: "100%",
    opacity: isDisabled ? 0.6 : 1,
    letterSpacing: "0.3px",
    position: "relative",
    overflow: "hidden",
    transform: hovered && !isDisabled ? "translateY(-1px)" : "translateY(0)",
  };

  const styles: Record<string, CSSProperties> = {
    primary: {
      background: "linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)",
      color: "#fff",
      boxShadow: hovered
        ? "0 8px 25px rgba(5, 150, 105, 0.45), 0 4px 10px rgba(5, 150, 105, 0.2)"
        : "0 4px 14px rgba(5, 150, 105, 0.35)",
    },
    ghost: {
      background: hovered ? "rgba(5, 150, 105, 0.08)" : "transparent",
      color: "#059669",
      border: "2px solid #059669",
      boxShadow: hovered ? "0 4px 14px rgba(5, 150, 105, 0.15)" : "none",
    },
    success: {
      background: "linear-gradient(135deg, #047857 0%, #059669 50%, #10b981 100%)",
      color: "#fff",
      boxShadow: hovered
        ? "0 8px 25px rgba(5, 150, 105, 0.45), 0 4px 10px rgba(5, 150, 105, 0.2)"
        : "0 4px 14px rgba(5, 150, 105, 0.35)",
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ ...base, ...styles[variant] }}
    >
      {isLoading ? (
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "18px", height: "18px",
            border: "2.5px solid rgba(255,255,255,0.3)",
            borderTopColor: "#fff",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }} />
          Procesando...
        </div>
      ) : children}
    </button>
  );
};

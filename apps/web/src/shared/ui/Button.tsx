import { CSSProperties, ReactNode } from "react";

interface ButtonProps {
  children:  ReactNode;
  onClick?:  () => void;
  type?:     "button" | "submit" | "reset";
  variant?:  "primary" | "ghost" | "success";
  disabled?: boolean;
  isLoading?: boolean;
}

export const Button = ({
  children, onClick, type = "button",
  variant = "primary", disabled, isLoading,
}: ButtonProps) => {
  const isDisabled = disabled || isLoading;

  const base: CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center",
    gap: "8px", padding: "14px 24px", borderRadius: "12px",
    fontSize: "15px", fontWeight: "700", cursor: isDisabled ? "not-allowed" : "pointer",
    transition: "all 0.2s ease", border: "none", width: "100%",
    opacity: isDisabled ? 0.6 : 1,
    letterSpacing: "0.3px",
  };

  const styles: Record<string, CSSProperties> = {
    primary: {
      background: "linear-gradient(135deg, #059669 0%, #10b981 100%)",
      color: "#fff",
      boxShadow: "0 4px 14px rgba(5, 150, 105, 0.35)",
    },
    ghost: {
      background: "transparent", color: "#059669",
      border: "2px solid #059669",
    },
    success: {
      background: "linear-gradient(135deg, #059669 0%, #34d399 100%)",
      color: "#fff",
      boxShadow: "0 4px 14px rgba(5, 150, 105, 0.35)",
    },
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      style={{ ...base, ...styles[variant] }}
    >
      {isLoading ? "Cargando..." : children}
    </button>
  );
};
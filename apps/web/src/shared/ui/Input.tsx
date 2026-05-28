import { CSSProperties } from "react";

interface InputProps {
  label:       string;
  type?:       string;
  value:       string;
  onChange:    (v: string) => void;
  placeholder?: string;
  error?:      string;
  icon?:       string;
}

export const Input = ({
  label, type = "text", value, onChange, placeholder, error, icon
}: InputProps) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    <label style={{ fontSize: "13px", fontWeight: "600", color: "#374151", textTransform: "uppercase", letterSpacing: "0.5px" }}>
      {label}
    </label>
    <div style={{ position: "relative" }}>
      {icon && (
        <span style={{
          position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
          fontSize: "16px", opacity: 0.5,
        }}>
          {icon}
        </span>
      )}
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          padding: icon ? "13px 16px 13px 42px" : "13px 16px",
          border: `1.5px solid ${error ? "#ef4444" : "#d1d5db"}`,
          borderRadius: "12px",
          fontSize: "15px",
          color: "#111827",
          background: "#f9fafb",
          outline: "none",
          fontFamily: "inherit",
          width: "100%",
          transition: "border-color 0.2s ease",
        } as CSSProperties}
      />
    </div>
    {error && (
      <span style={{ fontSize: "12px", color: "#ef4444", fontWeight: "500" }}>{error}</span>
    )}
  </div>
);
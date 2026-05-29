import { CSSProperties, useState } from "react";

interface InputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  error?: string;
  icon?: string;
}

export const Input = ({
  label, type = "text", value, onChange, placeholder, error, icon
}: InputProps) => {
  const [focused, setFocused] = useState(false);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <label style={{
        fontSize: "12px", fontWeight: "700", color: "#374151",
        textTransform: "uppercase", letterSpacing: "0.8px",
        transition: "color 0.2s ease",
      }}>
        {label}
      </label>
      <div style={{
        position: "relative",
        borderRadius: "14px",
        background: focused
          ? "rgba(255,255,255,0.95)"
          : "rgba(249,250,251,0.8)",
        border: `1.5px solid ${error ? "#fca5a5" : focused ? "#34d399" : "rgba(209,213,219,0.6)"}`,
        boxShadow: focused
          ? "0 0 0 3px rgba(52,211,153,0.15), 0 4px 12px rgba(5,150,105,0.08)"
          : error
            ? "0 0 0 3px rgba(252,165,165,0.15)"
            : "none",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      }}>
        {icon && (
          <span style={{
            position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
            fontSize: "16px", opacity: focused ? 0.8 : 0.4,
            transition: "opacity 0.2s ease",
          }}>
            {icon}
          </span>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          style={{
            padding: icon ? "14px 16px 14px 44px" : "14px 16px",
            border: "none",
            borderRadius: "14px",
            fontSize: "15px",
            fontWeight: "500",
            color: "#111827",
            background: "transparent",
            outline: "none",
            fontFamily: "inherit",
            width: "100%",
          } as CSSProperties}
        />
      </div>
      {error && (
        <span style={{
          fontSize: "12px", color: "#ef4444", fontWeight: "600",
          display: "flex", alignItems: "center", gap: "4px",
          animation: "fadeInUp 0.3s ease-out",
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5.5" stroke="#ef4444" strokeWidth="1"/>
            <path d="M6 3.5V6.5" stroke="#ef4444" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="6" cy="8.2" r="0.5" fill="#ef4444"/>
          </svg>
          {error}
        </span>
      )}
    </div>
  );
};

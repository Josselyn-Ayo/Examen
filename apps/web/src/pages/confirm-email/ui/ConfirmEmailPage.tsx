import { useConfirmEmail } from "@/features/confirm-email/model/useConfirmEmail";
import type { CSSProperties } from "react";

const APP_DEEP_LINK = "michatapp://";

const DOG_HEADER = "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=600&q=80";
const DOG_1 = "https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=120&q=80";
const DOG_2 = "https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=120&q=80";
const CAT_1 = "https://images.unsplash.com/photo-1574158622682-e40e69881006?w=120&q=80";
const DOG_3 = "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=120&q=80";
const SUCCESS_DOG = "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&q=80";

const PawSvg = ({ size = 20, color = "currentColor" }: { size?: number; color?: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
    <ellipse cx="8" cy="6" rx="2.2" ry="2.8" opacity="0.9"/>
    <ellipse cx="16" cy="6" rx="2.2" ry="2.8" opacity="0.9"/>
    <ellipse cx="4.5" cy="11" rx="2" ry="2.5" opacity="0.8"/>
    <ellipse cx="19.5" cy="11" rx="2" ry="2.5" opacity="0.8"/>
    <ellipse cx="12" cy="15" rx="4.5" ry="4" opacity="0.9"/>
  </svg>
);

const FloatingOrbs = () => (
  <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
    <div style={{
      position: "absolute", top: "-10%", right: "-5%",
      width: "500px", height: "500px", borderRadius: "50%",
      background: "radial-gradient(circle, rgba(16,185,129,0.15) 0%, transparent 70%)",
      animation: "float-1 20s ease-in-out infinite",
    }} />
    <div style={{
      position: "absolute", bottom: "-15%", left: "-10%",
      width: "600px", height: "600px", borderRadius: "50%",
      background: "radial-gradient(circle, rgba(52,211,153,0.12) 0%, transparent 70%)",
      animation: "float-2 25s ease-in-out infinite",
    }} />
  </div>
);

const FloatingPaws = () => (
  <div style={{ position: "fixed", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
    <PawSvg size={28} color="rgba(5,150,105,0.07)" />
    {[
      { top: "8%", left: "5%", size: 32, delay: "0s", dur: "6s" },
      { top: "15%", right: "8%", size: 24, delay: "1s", dur: "7s" },
      { top: "70%", left: "3%", size: 28, delay: "2s", dur: "5s" },
      { top: "80%", right: "6%", size: 20, delay: "0.5s", dur: "8s" },
      { top: "45%", left: "8%", size: 22, delay: "3s", dur: "6.5s" },
    ].map((p, i) => (
      <div key={i} style={{
        position: "absolute",
        top: p.top, left: (p as any).left, right: (p as any).right,
        animation: `float-paw ${p.dur} ease-in-out infinite`,
        animationDelay: p.delay,
      }}>
        <PawSvg size={p.size} color="rgba(5,150,105,0.07)" />
      </div>
    ))}
  </div>
);

const AnimalGallery = () => (
  <div style={{
    display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "10px",
    padding: "0 4px", marginTop: "4px",
  }}>
    {[
      { src: DOG_1, delay: "0.1s" },
      { src: CAT_1, delay: "0.2s" },
      { src: DOG_2, delay: "0.3s" },
      { src: DOG_3, delay: "0.4s" },
    ].map((img, i) => (
      <div key={i} style={{
        borderRadius: "14px", overflow: "hidden",
        aspectRatio: "1",
        animation: `photo-pop 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards`,
        animationDelay: img.delay,
        opacity: 0,
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        border: "2px solid rgba(255,255,255,0.6)",
      }}>
        <img src={img.src} alt="Mascota" style={{
          width: "100%", height: "100%", objectFit: "cover",
          transition: "transform 0.3s ease",
        }} />
      </div>
    ))}
  </div>
);

export const ConfirmEmailPage = () => {
  const { status, error } = useConfirmEmail();

  const content = () => {
    if (status === "loading") return (
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "80px", height: "80px", borderRadius: "50%",
          background: "linear-gradient(135deg, #ecfdf5, #d1fae5)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
          animation: "pulse-soft 2s ease-in-out infinite",
        }}>
          <PawSvg size={36} color="#059669" />
        </div>
        <div style={{
          width: "36px", height: "36px", border: "3px solid rgba(5,150,105,0.15)",
          borderTopColor: "#059669", borderRadius: "50%",
          margin: "0 auto 20px",
          animation: "spin 0.8s linear infinite",
        }} />
        <h2 style={{
          color: "#065f46", fontSize: "20px", fontWeight: "800",
          letterSpacing: "-0.3px",
        }}>
          Verificando tu cuenta...
        </h2>
        <p style={{ color: "#6b7280", fontSize: "14px", marginTop: "10px", lineHeight: "1.6" }}>
          Estamos confirmando tu registro<br />para adoptar mascotas.
        </p>
        <AnimalGallery />
      </div>
    );

    if (status === "error") return (
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "80px", height: "80px", borderRadius: "50%",
          background: "linear-gradient(135deg, #fef2f2, #fee2e2)",
          display: "flex", alignItems: "center", justifyContent: "center",
          margin: "0 auto 20px",
        }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="15" y1="9" x2="9" y2="15"/>
            <line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
        </div>
        <h2 style={{ color: "#dc2626", fontSize: "20px", fontWeight: "800", marginBottom: "10px" }}>
          Link inválido o expirado
        </h2>
        <p style={{ color: "#6b7280", fontSize: "14px", lineHeight: "1.6" }}>{error}</p>
        <div style={{
          marginTop: "16px", padding: "12px 16px", borderRadius: "12px",
          background: "rgba(249,250,251,0.8)", border: "1px solid rgba(209,213,219,0.5)",
        }}>
          <p style={{ color: "#9ca3af", fontSize: "13px", margin: 0 }}>
            Solicita un nuevo enlace desde la app móvil.
          </p>
        </div>
      </div>
    );

    return (
      <div style={{ textAlign: "center" }}>
        <div style={{
          width: "110px", height: "110px", borderRadius: "50%",
          overflow: "hidden", margin: "0 auto 20px",
          boxShadow: "0 0 0 4px #fff, 0 0 0 6px rgba(16,185,129,0.3), 0 0 0 10px rgba(16,185,129,0.1), 0 8px 25px rgba(5,150,105,0.2)",
          animation: "bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55) forwards",
        }}>
          <img src={SUCCESS_DOG} alt="Cachorro feliz" style={{
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
          <svg width="10" height="10" viewBox="0 0 24 24" fill="#059669">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01" fill="none" stroke="#059669" strokeWidth="3"/>
          </svg>
          Cuenta verificada
        </div>
        <h2 style={{
          color: "#065f46", fontSize: "24px", fontWeight: "900",
          marginBottom: "10px", letterSpacing: "-0.5px",
          animation: "fadeInUp 0.5s ease-out 0.3s both",
        }}>
          Bienvenido a PetAdopt!
        </h2>
        <p style={{
          color: "#374151", fontSize: "15px", marginBottom: "6px", fontWeight: "500", lineHeight: "1.6",
          animation: "fadeInUp 0.5s ease-out 0.4s both",
        }}>
          Tu cuenta ha sido verificada exitosamente.
        </p>
        <p style={{
          color: "#6b7280", fontSize: "14px", marginBottom: "28px", lineHeight: "1.6",
          animation: "fadeInUp 0.5s ease-out 0.5s both",
        }}>
          Ya puedes buscar y adoptar mascotas,<br />o publicarlas si eres un refugio.
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
        <p style={{
          color: "#9ca3af", fontSize: "12px", marginTop: "20px",
          animation: "fadeInUp 0.5s ease-out 0.7s both",
        }}>
          Si no se abre automáticamente, busca PetAdopt en tu teléfono.
        </p>
      </div>
    );
  };

  return (
    <main style={layout}>
      <FloatingOrbs />
      <FloatingPaws />
      <div style={card}>
        <div style={header}>
          <div style={headerOverlay} />
          <img src={DOG_HEADER} alt="" style={headerBg} />
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
              <PawSvg size={32} color="#fff" />
            </div>
            <h1 style={{
              color: "#fff", margin: "0 0 4px", fontSize: "26px", fontWeight: "900",
              letterSpacing: "-0.5px",
              textShadow: "0 2px 10px rgba(0,0,0,0.15)",
            }}>
              PetAdopt
            </h1>
            <p style={{
              color: "rgba(255,255,255,0.9)", margin: 0, fontSize: "14px",
              fontWeight: "600", letterSpacing: "0.3px",
              textShadow: "0 1px 6px rgba(0,0,0,0.15)",
            }}>
              Confirmación de cuenta
            </p>
          </div>
        </div>
        <div style={{ padding: "40px 32px" }}>{content()}</div>
      </div>
    </main>
  );
};

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

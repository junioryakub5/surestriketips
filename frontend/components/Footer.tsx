import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer
      className="relative py-14 text-center"
      style={{
        background: "#0a0a0a",
        borderTop: "1px solid rgba(212,160,23,0.1)",
      }}
    >
      {/* Gold glow at top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-80 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(212,160,23,0.5), rgba(245,200,66,0.5), transparent)",
        }}
      />
      {/* Subtle radial behind brand */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-32 opacity-20 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, rgba(212,160,23,0.3) 0%, transparent 70%)",
          filter: "blur(20px)",
        }}
      />

      <div className="page-container relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div
            className="relative flex-shrink-0"
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              overflow: "hidden",
              boxShadow: "0 0 24px rgba(212,160,23,0.35), 0 0 8px rgba(212,160,23,0.2)",
              border: "1.5px solid rgba(212,160,23,0.35)",
            }}
          >
            <Image
              src="/logo.png"
              alt="Sure Strike Tips Logo"
              width={56}
              height={56}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex flex-col text-left">
            <span className="font-brand text-lg font-bold" style={{ color: "#f5f5f5" }}>
              Sure
              <span
                style={{
                  background: "linear-gradient(135deg, #D4A017, #F5C842)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                Strike
              </span>
              Tips
            </span>
            <span
              className="text-[9px] tracking-widest uppercase"
              style={{ color: "#D4A017", opacity: 0.7, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              Bet With Confidence
            </span>
          </div>
        </div>

        <p className="text-xs mb-6" style={{ color: "#333333" }}>
          Premium football predictions for smart bettors
        </p>

        {/* Footer Nav Links */}
        <div className="flex items-center justify-center gap-5 mb-6 flex-wrap">
          {[
            { href: "/", label: "Home" },
            { href: "/about", label: "About" },
            { href: "/history", label: "History" },
            { href: "/faq", label: "FAQ" },
            { href: "/terms", label: "Terms" },
          ].map((link, i, arr) => (
            <span key={link.href} className="flex items-center gap-5">
              <Link
                href={link.href}
                className="text-xs font-medium transition-colors duration-200 hover:text-[#D4A017]"
                style={{
                  color: "#444444",
                  fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                }}
              >
                {link.label}
              </Link>
              {i < arr.length - 1 && <span style={{ color: "#2a2a2a" }}>·</span>}
            </span>
          ))}
        </div>

        <p className="text-xs" style={{ color: "#2d2d2d" }}>
          © {new Date().getFullYear()} Sure Strike Tips. All rights reserved.
        </p>
        <p className="text-xs mt-1" style={{ color: "#2a2a2a" }}>
          Bet responsibly. 18+ only.
        </p>
      </div>
    </footer>
  );
}

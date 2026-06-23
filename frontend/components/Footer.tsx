import Link from "next/link";

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
        <div className="flex items-center justify-center gap-3 mb-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, rgba(212,160,23,0.15), rgba(160,120,16,0.1))",
              border: "1px solid rgba(212,160,23,0.25)",
              boxShadow: "0 0 12px rgba(212,160,23,0.15)",
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M13 2L4.5 13.5H11L10 22L19.5 10.5H13L13 2Z"
                fill="url(#footerGoldBolt)"
              />
              <defs>
                <linearGradient id="footerGoldBolt" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#F5C842" />
                  <stop offset="100%" stopColor="#A07810" />
                </linearGradient>
              </defs>
            </svg>
          </div>
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
        </div>

        <p className="text-sm mb-1" style={{ color: "#555555" }}>
          Bet With Confidence
        </p>
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
                style={{ color: "#444444", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.06em", textTransform: "uppercase" }}
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

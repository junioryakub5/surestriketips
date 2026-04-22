import { Zap } from "lucide-react";

export default function Footer() {
  return (
    <footer
      className="relative py-12 text-center"
      style={{
        background: "#0a0e17",
        borderTop: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      {/* Subtle gradient glow at top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-px"
        style={{ background: "linear-gradient(90deg, transparent, rgba(6,214,160,0.4), rgba(131,56,236,0.4), transparent)" }}
      />
      <div className="page-container relative z-10">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{
              background: "rgba(6,214,160,0.1)",
              border: "1px solid rgba(6,214,160,0.2)",
              boxShadow: "0 0 12px rgba(6,214,160,0.15)",
            }}
          >
            <Zap size={13} style={{ color: "#06d6a0" }} />
          </div>
          <span className="font-brand text-lg font-bold" style={{ color: "#f0f4f8" }}>
            Sure<span style={{ color: "#06d6a0" }}>StrikeTips</span>
          </span>
        </div>
        <p className="text-sm mb-4" style={{ color: "#64748b" }}>
          Premium football predictions for smart bettors
        </p>
        <p className="text-xs" style={{ color: "#334155" }}>
          © {new Date().getFullYear()} Sure Strike Tips. All rights reserved.
        </p>
        <p className="text-xs mt-2" style={{ color: "#334155" }}>
          Bet responsibly. 18+ only.
        </p>
      </div>
    </footer>
  );
}

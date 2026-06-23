"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import Image from "next/image";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/history", label: "History" },
  { href: "/faq", label: "FAQ" },
  { href: "/terms", label: "Terms" },
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50"
      style={{
        background: "rgba(10,10,10,0.92)",
        backdropFilter: "saturate(180%) blur(24px)",
        borderBottom: "1px solid rgba(212,160,23,0.12)",
        boxShadow: "0 4px 32px rgba(0,0,0,0.6)",
      }}
    >
      <div className="page-container">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div
              className="relative flex-shrink-0 transition-all duration-300 group-hover:scale-105"
              style={{
                width: "44px",
                height: "44px",
                borderRadius: "50%",
                overflow: "hidden",
                boxShadow: "0 0 18px rgba(212,160,23,0.3), 0 0 6px rgba(212,160,23,0.15)",
                border: "1.5px solid rgba(212,160,23,0.35)",
              }}
            >
              <Image
                src="/logo.png"
                alt="Sure Strike Tips Logo"
                width={44}
                height={44}
                className="w-full h-full object-cover"
                priority
              />
            </div>
            <div className="flex flex-col leading-none">
              <span
                className="font-display font-bold tracking-tight"
                style={{ fontSize: "1.05rem", letterSpacing: "-0.01em", color: "#f5f5f5" }}
              >
                <span>Sure</span>
                <span
                  style={{
                    background: "linear-gradient(135deg, #D4A017, #F5C842)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  Strike
                </span>
                <span>Tips</span>
              </span>
              <span
                className="text-[8px] tracking-widest uppercase"
                style={{ color: "#D4A017", opacity: 0.7, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Bet With Confidence
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-7">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`nav-link ${pathname === link.href ? "active" : ""}`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Mobile Toggle */}
          <button
            className="md:hidden p-2 transition-colors rounded-xl"
            style={{
              color: "#a8a8a8",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(212,160,23,0.15)",
            }}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-300 overflow-hidden ${mobileOpen ? "max-h-80 opacity-100" : "max-h-0 opacity-0"}`}
        style={{
          background: "rgba(10,10,10,0.98)",
          borderTop: "1px solid rgba(212,160,23,0.1)",
        }}
      >
        <div className="page-container py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`nav-link text-base ${pathname === link.href ? "active" : ""}`}
              onClick={() => setMobileOpen(false)}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

"use client";

import { useState, useEffect } from "react";
import React from "react";
import {
  Calendar, Lock, X, Loader2, Shield, Zap,
  CheckCircle, Copy, Check, Trophy, RefreshCcw, Mail,
} from "lucide-react";
import { Prediction } from "@/lib/types";
import { initiatePayment, verifyPayment, getUnlockedPrediction, restoreAccess } from "@/lib/api";

// ── Bet slip image thumbnail + lightbox ────────────────────────────────────────
function BetSlipImage({ src, alt }: { src: string; alt: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="px-5 pt-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative w-full overflow-hidden group cursor-zoom-in"
          style={{ height: "120px", background: "rgba(17,24,39,0.8)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={src} alt={alt} className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110" />
          <div
            className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
            style={{ background: "rgba(10,14,23,0.7)", backdropFilter: "blur(4px)" }}
          >
            <span
              className="text-xs font-semibold px-4 py-2 flex items-center gap-1.5"
              style={{ background: "linear-gradient(135deg, #06d6a0, #059d79)", color: "#0a0e17", borderRadius: "10px", fontFamily: "'Space Grotesk', sans-serif", textTransform: "uppercase", letterSpacing: "0.04em", fontSize: "0.65rem" }}
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" /></svg>
              View Full Slip
            </span>
          </div>
        </button>
        <p className="text-center text-[10px] mt-1.5" style={{ color: "#64748b" }}>Tap to view full bet slip</p>
      </div>

      {/* Lightbox */}
      {open && (
        <div
          className="fixed inset-0 z-[9999] overflow-y-auto"
          style={{ background: "rgba(10,14,23,0.92)", backdropFilter: "blur(8px)" }}
          onClick={() => setOpen(false)}
        >
          <button
            onClick={() => setOpen(false)}
            className="fixed top-4 right-4 text-white rounded-full w-10 h-10 flex items-center justify-center z-[10000]"
            style={{ background: "rgba(6,214,160,0.9)", boxShadow: "0 0 16px rgba(6,214,160,0.3)" }}
          >
            <X size={18} />
          </button>
          <div className="min-h-full flex items-center justify-center p-4 py-12" onClick={e => e.stopPropagation()}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={src} alt={alt} className="shadow-2xl" style={{ maxWidth: "100%", width: "auto", height: "auto", borderRadius: "16px" }} />
          </div>
        </div>
      )}
    </>
  );
}

// Paystack public key
const PAYSTACK_KEY =
  process.env.NEXT_PUBLIC_PAYSTACK_KEY ||
  "pk_live_1bea543508e721092150d2fbb79ff78a3cc070a6";

// Load Paystack v2 inline.js dynamically
function loadPaystack(): Promise<void> {
  return new Promise((resolve, reject) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((window as any).PaystackPop) return resolve();
    const SCRIPT_URL = "https://js.paystack.co/v2/inline.js";
    if (document.querySelector(`script[src="${SCRIPT_URL}"]`)) {
      const poll = setInterval(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).PaystackPop) { clearInterval(poll); resolve(); }
      }, 100);
      setTimeout(() => { clearInterval(poll); reject(new Error("Paystack timed out")); }, 10000);
      return;
    }
    const s = document.createElement("script");
    s.src = SCRIPT_URL;
    s.async = true;
    s.onerror = () => reject(new Error("Could not load Paystack script. Check your internet connection."));
    s.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((window as any).PaystackPop) return resolve();
      const poll = setInterval(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).PaystackPop) { clearInterval(poll); resolve(); }
      }, 50);
      setTimeout(() => { clearInterval(poll); reject(new Error("PaystackPop not ready after load")); }, 6000);
    };
    document.head.appendChild(s);
  });
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface UnlockedData {
  content: string;
  bookingCode: string;
  tips: string[];
  imageUrl: string;
  reference: string;
}

interface Props {
  prediction: Prediction;
  animationDelay?: number;
}

// ── Accent colours per odds category ─────────────────────────────────────────
const ACCENT: Record<string, { bg: string; text: string; glow: string; border: string }> = {
  "2+": { bg: "rgba(6,214,160,0.1)", text: "#06d6a0", glow: "rgba(6,214,160,0.2)", border: "rgba(6,214,160,0.2)" },
  "5+": { bg: "rgba(245,158,11,0.1)", text: "#f59e0b", glow: "rgba(245,158,11,0.2)", border: "rgba(245,158,11,0.2)" },
  "10+": { bg: "rgba(131,56,236,0.1)", text: "#8338ec", glow: "rgba(131,56,236,0.2)", border: "rgba(131,56,236,0.2)" },
  "20+": { bg: "rgba(255,107,107,0.1)", text: "#ff6b6b", glow: "rgba(255,107,107,0.2)", border: "rgba(255,107,107,0.2)" },
};

// ── localStorage helpers ──────────────────────────────────────────────────────
const lsKey = (id: string) => `sst_unlocked_${id}`;
const lsRefKey = (id: string) => `sst_ref_${id}`;

function saveUnlocked(predId: string, data: UnlockedData) {
  try {
    localStorage.setItem(lsRefKey(predId), data.reference);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { imageUrl: _img, ...rest } = data;
    localStorage.setItem(lsKey(predId), JSON.stringify(rest));
  } catch { /* quota exceeded */ }
}

function loadUnlocked(id: string): Omit<UnlockedData, "imageUrl"> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(lsKey(id));
    if (raw) return JSON.parse(raw) as Omit<UnlockedData, "imageUrl">;
    const ref = localStorage.getItem(lsRefKey(id));
    if (ref) return { content: "", bookingCode: "", tips: [], reference: ref };
    return null;
  } catch { return null; }
}

// ── Payment Modal ─────────────────────────────────────────────────────────────
type ModalTab = "pay" | "restore";
type PayStep = "idle" | "paying" | "verifying";

function PaymentModal({
  prediction,
  onSuccess,
  onClose,
}: {
  prediction: Prediction;
  onSuccess: (data: UnlockedData) => void;
  onClose: () => void;
}) {
  const [tab, setTab] = useState<ModalTab>("pay");
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<PayStep>("idle");
  const [error, setError] = useState("");

  const [restoreEmail, setRestoreEmail] = useState("");
  const [restoreLoading, setRestoreLoading] = useState(false);
  const [restoreError, setRestoreError] = useState("");

  // Lock body scroll
  useEffect(() => {
    const scrollY = window.scrollY;
    const body = document.body;
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.overflow = 'hidden';
    return () => {
      body.style.position = '';
      body.style.top = '';
      body.style.left = '';
      body.style.right = '';
      body.style.overflow = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  const acc = ACCENT[prediction.oddsCategory] || ACCENT["2+"];

  const finalizeUnlock = async (reference: string) => {
    setStep("verifying");
    setError("");
    try {
      const unlock = await getUnlockedPrediction(reference);
      const data: UnlockedData = {
        content: unlock.prediction.content || "",
        bookingCode: (unlock.prediction as { bookingCode?: string }).bookingCode || "",
        tips: (unlock.prediction as { tips?: string[] }).tips || [],
        imageUrl: unlock.prediction.imageUrl || "",
        reference,
      };
      saveUnlocked(prediction._id, data);
      onSuccess(data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "Verification failed. Please contact support.";
      setError(`${msg} (ref: ${reference})`);
      setStep("idle");
    }
  };

  const handlePay = async () => {
    if (!email || !email.includes("@")) { setError("Please enter a valid email address."); return; }
    setError("");
    setStep("paying");
    try {
      await loadPaystack();
      const initResult = await initiatePayment(email, prediction._id);
      const ref = initResult.reference;
      const accessCode = initResult.accessCode;

      if (!accessCode) throw new Error("Could not initialize payment. Please try again.");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const popup = new (window as any).PaystackPop();
      let settled = false;
      const timeout = setTimeout(() => {
        if (!settled) {
          settled = true;
          setStep("idle");
          setError("Paystack checkout couldn't load. Please check your internet connection and try again.");
        }
      }, 60000);

      popup.resumeTransaction(accessCode, {
        onSuccess: async (transaction: { reference: string }) => {
          settled = true;
          clearTimeout(timeout);
          try {
            await verifyPayment(ref, prediction._id, email);
            await finalizeUnlock(ref);
          } catch (err: unknown) {
            const msg =
              (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
              "Verification failed. Contact support.";
            setError(`${msg} (ref: ${ref})`);
            setStep("idle");
          }
        },
        onCancel: () => {
          settled = true;
          clearTimeout(timeout);
          setStep("idle");
        },
      });
    } catch (err: unknown) {
      const msg = (err as Error)?.message || "Failed to open payment. Please try again.";
      setError(msg);
      setStep("idle");
    }
  };

  const handleRestore = async () => {
    if (!restoreEmail || !restoreEmail.includes("@")) {
      setRestoreError("Please enter the email you used when you paid.");
      return;
    }
    setRestoreError("");
    setRestoreLoading(true);
    try {
      const unlock = await restoreAccess(restoreEmail, prediction._id);
      const data: UnlockedData = {
        content: unlock.prediction.content || "",
        bookingCode: (unlock.prediction as { bookingCode?: string }).bookingCode || "",
        tips: (unlock.prediction as { tips?: string[] }).tips || [],
        imageUrl: unlock.prediction.imageUrl || "",
        reference: unlock.payment.reference,
      };
      saveUnlocked(prediction._id, data);
      onSuccess(data);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        "No active payment found. Please complete your payment.";
      setRestoreError(msg);
    } finally {
      setRestoreLoading(false);
    }
  };

  // Verifying overlay
  if (step === "verifying") {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" style={{ overscrollBehavior: "contain" }}>
        <div className="absolute inset-0 backdrop-blur-md" style={{ background: "rgba(10,14,23,0.7)" }} />
        <div
          className="relative w-full max-w-sm overflow-hidden shadow-2xl flex flex-col items-center justify-center gap-5 py-14 px-8"
          style={{ background: "rgba(17,24,39,0.9)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", backdropFilter: "blur(24px)" }}
        >
          <div className="h-0.5 w-full absolute top-0 left-0" style={{ background: `linear-gradient(90deg, ${acc.text}, #8338ec)` }} />
          <div
            className="w-16 h-16 flex items-center justify-center"
            style={{ background: acc.bg, border: `1px solid ${acc.border}`, borderRadius: "16px", boxShadow: `0 0 24px ${acc.glow}` }}
          >
            <Loader2 size={28} style={{ color: acc.text }} className="animate-spin" />
          </div>
          <div className="text-center">
            <p className="font-semibold text-base mb-1" style={{ color: "#f0f4f8" }}>Verifying Payment…</p>
            <p className="text-xs" style={{ color: "#64748b" }}>Confirming with Paystack and unlocking your prediction</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" onClick={onClose} style={{ overscrollBehavior: "contain" }}>
      <div className="absolute inset-0 backdrop-blur-md" style={{ background: "rgba(10,14,23,0.7)" }} />

      <div
        className="relative w-full max-w-sm overflow-hidden shadow-2xl"
        style={{ background: "rgba(17,24,39,0.92)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "20px", backdropFilter: "blur(24px)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Accent strip */}
        <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, ${acc.text}, #8338ec)` }} />

        {/* Header */}
        <div className="px-6 pt-5 pb-4" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <span
                className="inline-block text-[10px] font-bold px-2.5 py-0.5 mb-1.5"
                style={{ background: acc.bg, color: acc.text, border: `1px solid ${acc.border}`, borderRadius: "8px", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}
              >
                {prediction.oddsCategory} ODDS
              </span>
              <h2 className="font-semibold text-base leading-snug" style={{ color: "#f0f4f8" }}>{prediction.match}</h2>
              <p className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: "#64748b" }}>
                <Calendar size={11} />
                {new Date(prediction.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
                {" · "}{prediction.league}
              </p>
            </div>
            <button onClick={onClose} className="transition-colors mt-0.5 flex-shrink-0" style={{ color: "#64748b" }}>
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          {(["pay", "restore"] as ModalTab[]).map((t) => (
            <button
              key={t}
              onClick={() => { setTab(t); setError(""); setRestoreError(""); }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 text-xs font-semibold transition-all duration-200`}
              style={{
                color: tab === t ? "#f0f4f8" : "#64748b",
                borderBottom: tab === t ? `2px solid ${acc.text}` : "2px solid transparent",
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontSize: "0.65rem",
              }}
            >
              {t === "pay"
                ? <><Lock size={11} />Pay &amp; Unlock</>
                : <><RefreshCcw size={11} />Already Paid?</>}
            </button>
          ))}
        </div>

        {tab === "pay" ? (
          <>
            {/* Price block */}
            <div
              className="mx-6 my-4 px-5 py-4 flex items-center justify-between"
              style={{ background: acc.bg, border: `1px solid ${acc.border}`, borderRadius: "14px", boxShadow: `0 0 16px ${acc.glow}` }}
            >
              <div>
                <p className="text-xs mb-0.5" style={{ color: "#64748b" }}>Access Price</p>
                <p className="text-2xl font-bold" style={{ color: "#f0f4f8" }}>
                  GHS <span style={{ color: acc.text }}>{prediction.price}</span>
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs mb-0.5" style={{ color: "#64748b" }}>Total Odds</p>
                <p className="font-bold text-lg" style={{ color: acc.text }}>{prediction.odds}</p>
              </div>
            </div>

            {/* Perks */}
            <div className="px-6 mb-4 flex gap-5">
              {[{ icon: <Shield size={12} />, label: "Secure payment" }, { icon: <Zap size={12} />, label: "Instant access" }]
                .map(f => (
                  <div key={f.label} className="flex items-center gap-1.5 text-xs" style={{ color: "#64748b" }}>{f.icon}{f.label}</div>
                ))}
            </div>

            {/* Form */}
            <div className="px-6 pb-6 space-y-3">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.6rem" }}>Your email address</label>
                <input
                  type="email" placeholder="you@example.com" value={email} autoFocus
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handlePay()}
                  className="input-field"
                  disabled={step === "paying"}
                />
              </div>
              {error && <p className="text-red-400 text-xs leading-relaxed">{error}</p>}
              <button
                onClick={handlePay} disabled={step === "paying"}
                className="w-full flex items-center justify-center gap-2 font-bold text-sm py-3.5 transition-all duration-300 active:scale-[0.97]"
                style={{
                  background: step === "paying" ? "rgba(6,214,160,0.3)" : "linear-gradient(135deg, #06d6a0, #059d79)",
                  color: "#0a0e17",
                  boxShadow: step === "paying" ? "none" : "0 0 20px rgba(6,214,160,0.3), 0 4px 16px rgba(6,214,160,0.2)",
                  borderRadius: "12px",
                  fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  fontSize: "0.8rem",
                  border: step === "paying" ? "none" : "1px solid rgba(6,214,160,0.4)",
                }}
              >
                {step === "paying"
                  ? (<><Loader2 size={16} className="animate-spin" />Opening Paystack…</>)
                  : (<><Lock size={15} />Pay &amp; Unlock — GHS {prediction.price}</>)}
              </button>
              <p className="text-center text-[11px]" style={{ color: "#334155" }}>
                One-time payment · Powered by Paystack
              </p>
            </div>
          </>
        ) : (
          /* Restore Access tab */
          <div className="px-6 py-6 space-y-4">
            <div
              className="p-4 flex gap-3"
              style={{ background: "rgba(131,56,236,0.06)", border: "1px solid rgba(131,56,236,0.15)", borderRadius: "12px" }}
            >
              <Mail size={16} className="flex-shrink-0 mt-0.5" style={{ color: "#8338ec" }} />
              <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
                Already paid for this prediction? Enter the email you used and we&apos;ll restore your access instantly — no need to pay again.
              </p>
            </div>
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: "#94a3b8", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.6rem" }}>Email used at payment</label>
              <input
                type="email" placeholder="you@example.com" value={restoreEmail} autoFocus
                onChange={(e) => setRestoreEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleRestore()}
                className="input-field"
                disabled={restoreLoading}
              />
            </div>
            {restoreError && <p className="text-red-400 text-xs leading-relaxed">{restoreError}</p>}
            <button
              onClick={handleRestore} disabled={restoreLoading}
              className="w-full flex items-center justify-center gap-2 font-bold text-sm py-3.5 transition-all duration-300 active:scale-[0.97]"
              style={{
                background: restoreLoading ? "rgba(131,56,236,0.3)" : "linear-gradient(135deg, #8338ec, #6b21a8)",
                color: "#ffffff",
                boxShadow: restoreLoading ? "none" : "0 0 20px rgba(131,56,236,0.3), 0 4px 16px rgba(131,56,236,0.2)",
                borderRadius: "12px",
                fontFamily: "'Space Grotesk', sans-serif",
                letterSpacing: "0.04em",
                textTransform: "uppercase",
                fontSize: "0.8rem",
                border: restoreLoading ? "none" : "1px solid rgba(131,56,236,0.4)",
              }}
            >
              {restoreLoading
                ? (<><Loader2 size={16} className="animate-spin" />Checking…</>)
                : (<><RefreshCcw size={15} />Restore My Access</>)}
            </button>
            <p className="text-center text-[11px]" style={{ color: "#334155" }}>
              One-time payment — access never expires
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Unlocked card view ────────────────────────────────────────────────────────
function UnlockedCard({ prediction, unlocked }: { prediction: Prediction; unlocked: UnlockedData }) {
  const [copied, setCopied] = useState(false);
  const acc = ACCENT[prediction.oddsCategory] || ACCENT["2+"];

  const copyCode = () => {
    const text = unlocked.bookingCode || unlocked.content;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="card-glass overflow-hidden">
      {/* Unlocked banner */}
      <div
        className="px-4 py-2.5 flex items-center gap-2"
        style={{ background: "rgba(6,214,160,0.06)", borderBottom: "1px solid rgba(6,214,160,0.15)" }}
      >
        <CheckCircle size={14} className="flex-shrink-0" style={{ color: "#06d6a0" }} />
        <span className="text-xs font-semibold" style={{ color: "#06d6a0", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.65rem" }}>Prediction Unlocked ✓</span>
        <span
          className="ml-auto text-[10px] font-bold px-2.5 py-0.5"
          style={{ background: acc.bg, color: acc.text, border: `1px solid ${acc.border}`, borderRadius: "8px", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}
        >
          {prediction.oddsCategory} ODDS
        </span>
      </div>

      {/* Bet-slip image */}
      {unlocked.imageUrl && (
        <BetSlipImage src={unlocked.imageUrl} alt={`Bet slip – ${prediction.match}`} />
      )}

      {/* Info */}
      <div className="px-5 pt-4">
        <h3 className="font-semibold text-base mb-0.5 line-clamp-1" style={{ color: "#f0f4f8" }}>{prediction.match}</h3>
        <p className="text-xs mb-4 flex items-center gap-1.5" style={{ color: "#64748b" }}>
          <Calendar size={11} />
          {new Date(prediction.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
          {" · "}{prediction.league}
        </p>

        {/* Booking code */}
        {(unlocked.bookingCode || unlocked.content) && (
          <div
            className="p-4 mb-3"
            style={{ background: acc.bg, border: `1px solid ${acc.border}`, borderRadius: "14px", boxShadow: `0 0 16px ${acc.glow}` }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Trophy size={13} style={{ color: acc.text }} />
                <span className="text-xs font-semibold" style={{ color: acc.text, fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.65rem" }}>
                  {unlocked.bookingCode ? "Booking Code" : "Prediction Tip"}
                </span>
              </div>
              <button
                onClick={copyCode}
                className="flex items-center gap-1 text-xs transition-colors"
                style={{ color: "#64748b" }}
              >
                {copied ? <><Check size={11} style={{ color: "#06d6a0" }} />Copied!</> : <><Copy size={11} />Copy</>}
              </button>
            </div>
            <p
              className="font-bold text-xl tracking-widest text-center py-2"
              style={{ color: acc.text, fontFamily: "monospace", letterSpacing: "0.15em" }}
            >
              {unlocked.bookingCode || unlocked.content}
            </p>
          </div>
        )}

        {/* Tips list */}
        {unlocked.tips && unlocked.tips.length > 0 && (
          <div className="mb-4 space-y-1.5">
            <p className="text-xs font-medium mb-2" style={{ color: "#64748b", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.6rem" }}>What to bet:</p>
            {unlocked.tips.map((tip, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-2 text-xs"
                style={{ background: "rgba(17,24,39,0.6)", border: "1px solid rgba(255,255,255,0.04)", color: "#cbd5e1", borderRadius: "10px" }}
              >
                <CheckCircle size={11} style={{ color: "#06d6a0" }} className="flex-shrink-0" />
                {tip}
              </div>
            ))}
          </div>
        )}

        {/* Permanent access */}
        <p className="text-[10px] text-right flex items-center justify-end gap-1 pb-4" style={{ color: "#334155" }}>
          <CheckCircle size={10} style={{ color: "#06d6a0" }} />
          One-time payment · Access never expires
        </p>
      </div>
    </div>
  );
}

// ── Locked card view ──────────────────────────────────────────────────────────
function LockedCard({
  prediction,
  animationDelay,
  onClickUnlock,
}: {
  prediction: Prediction;
  animationDelay: number;
  onClickUnlock: () => void;
}) {
  const acc = ACCENT[prediction.oddsCategory] || ACCENT["2+"];
  const hasImage = !!prediction.previewImageUrl;

  return (
    <div
      className="card-glass overflow-hidden opacity-0 animate-fadeInUp cursor-pointer group"
      style={{ animationDelay: `${animationDelay}ms`, animationFillMode: "forwards" }}
      onClick={onClickUnlock}
    >
      {/* Image / locked area */}
      <div className="relative h-52 overflow-hidden" style={{ background: "rgba(17,24,39,0.8)" }}>
        {hasImage ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={prediction.previewImageUrl!}
            alt="Prediction slip preview"
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 md:group-hover:scale-110"
            style={{ filter: "blur(12px) brightness(0.3) saturate(0.4)", transform: "scale(1.1)" }}
          />
        ) : (
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(135deg, ${acc.bg} 0%, rgba(17,24,39,0.9) 100%)`,
            }}
          />
        )}

        {/* Overlay */}
        <div
          className="absolute inset-0"
          style={{
            background: hasImage
              ? "linear-gradient(180deg, rgba(10,14,23,0.3) 0%, rgba(10,14,23,0.85) 100%)"
              : "linear-gradient(180deg, transparent 0%, rgba(10,14,23,0.6) 100%)",
          }}
        />

        {/* Odds badge */}
        <span
          className="absolute top-3 left-3 z-10 text-[10px] font-bold px-3 py-1 shadow-sm"
          style={{
            background: "rgba(17,24,39,0.7)",
            color: acc.text,
            border: `1px solid ${acc.border}`,
            borderRadius: "8px",
            backdropFilter: "blur(8px)",
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: "0.05em",
            textTransform: "uppercase",
          }}
        >
          {prediction.oddsCategory} ODDS
        </span>

        {/* Lock icon + CTA */}
        <div className="absolute inset-0 z-10 flex flex-col items-center justify-center gap-3">
          <div
            className="w-14 h-14 flex items-center justify-center transition-all duration-300 md:group-hover:scale-110"
            style={{
              background: "rgba(17,24,39,0.7)",
              border: `1px solid ${acc.border}`,
              borderRadius: "16px",
              backdropFilter: "blur(12px)",
              boxShadow: `0 0 24px ${acc.glow}`,
            }}
          >
            <Lock size={22} style={{ color: acc.text }} strokeWidth={2} />
          </div>
          <span
            className="text-xs font-semibold px-4 py-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0"
            style={{
              background: `linear-gradient(135deg, ${acc.text}, ${acc.text}dd)`,
              color: "#0a0e17",
              borderRadius: "10px",
              boxShadow: `0 0 16px ${acc.glow}`,
              fontFamily: "'Space Grotesk', sans-serif",
              letterSpacing: "0.04em",
              textTransform: "uppercase",
              fontSize: "0.65rem",
            }}
          >
            Click to unlock
          </span>
        </div>
      </div>

      {/* Card info */}
      <div className="px-5 py-4">
        <h3 className="font-semibold text-base mb-1 line-clamp-1" style={{ color: "#f0f4f8" }}>{prediction.match}</h3>
        <div className="flex items-center gap-1.5 text-xs mb-3" style={{ color: "#64748b" }}>
          <Calendar size={12} />
          <span>
            {new Date(prediction.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
          </span>
          {prediction.league && (<><span className="mx-0.5">·</span><span className="truncate">{prediction.league}</span></>)}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="text-xs" style={{ color: "#64748b" }}>Odds:</span>
            <span className="font-bold text-sm" style={{ color: acc.text }}>{prediction.odds}</span>
          </div>
          <span className="font-bold text-lg" style={{ color: "#06d6a0" }}>GHS {prediction.price}</span>
        </div>

        {/* CTA bar */}
        <div
          className="mt-3 w-full text-center text-xs font-semibold py-3 transition-all duration-300"
          style={{
            background: acc.bg,
            border: `1px solid ${acc.border}`,
            color: acc.text,
            borderRadius: "12px",
            fontFamily: "'Space Grotesk', sans-serif",
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            fontSize: "0.7rem",
            boxShadow: `0 0 12px ${acc.glow}`,
          }}
        >
          🔒 Unlock Prediction — GHS {prediction.price}
        </div>
      </div>
    </div>
  );
}

// ── Root export ───────────────────────────────────────────────────────────────
export default function PredictionCard({ prediction, animationDelay = 0 }: Props) {
  const [unlocked, setUnlocked] = useState<UnlockedData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    const cached = loadUnlocked(prediction._id);
    if (!cached) return;
    setUnlocked({ imageUrl: "", ...cached });
    if (cached.reference) {
      getUnlockedPrediction(cached.reference).then(unlock => {
        const fresh: UnlockedData = {
          content: unlock.prediction.content || cached.content || "",
          bookingCode: (unlock.prediction as { bookingCode?: string }).bookingCode || cached.bookingCode || "",
          tips: (unlock.prediction as { tips?: string[] }).tips || cached.tips || [],
          imageUrl: unlock.prediction.imageUrl || "",
          reference: cached.reference,
        };
        saveUnlocked(prediction._id, fresh);
        setUnlocked(fresh);
      }).catch(() => { /* keep showing cached */ });
    }
  }, [prediction._id]);

  const handleSuccess = (data: UnlockedData) => {
    setUnlocked(data);
    setModalOpen(false);
  };

  if (unlocked) {
    return (
      <div
        className="opacity-0 animate-fadeInUp"
        style={{ animationDelay: `${animationDelay}ms`, animationFillMode: "forwards" }}
      >
        <UnlockedCard prediction={prediction} unlocked={unlocked} />
      </div>
    );
  }

  return (
    <>
      <LockedCard
        prediction={prediction}
        animationDelay={animationDelay}
        onClickUnlock={() => setModalOpen(true)}
      />
      {modalOpen && (
        <PaymentModal
          prediction={prediction}
          onSuccess={handleSuccess}
          onClose={() => setModalOpen(false)}
        />
      )}
    </>
  );
}

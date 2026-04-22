"use client";

import { useEffect, useState } from "react";
import { TrendingUp, Calendar, CheckCircle2, XCircle, BarChart3, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getHistoryPredictions } from "@/lib/api";
import { Prediction } from "@/lib/types";

export default function HistoryPage() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<"all" | "win" | "loss">("all");

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await getHistoryPredictions();
        setPredictions(data);
      } catch {
        setError("Failed to load history.");
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filtered = predictions.filter((p) => {
    if (filter === "all") return true;
    return p.result === filter;
  });

  const wins = predictions.filter((p) => p.result === "win").length;
  const losses = predictions.filter((p) => p.result === "loss").length;
  const winRate = predictions.length > 0 ? Math.round((wins / predictions.length) * 100) : 0;

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 relative z-10" style={{ background: "#0a0e17" }}>
        <div className="page-container">
          {/* Header */}
          <div className="mb-8">
            <h1 className="font-brand text-3xl font-bold mb-2" style={{ color: "#f0f4f8" }}>Past Results</h1>
            <p style={{ color: "#94a3b8" }}>Our winning history and proven track record</p>
          </div>

          {/* Stats Banner */}
          {!loading && predictions.length > 0 && (
            <div
              className="p-6 mb-8 flex flex-col md:flex-row items-center gap-6"
              style={{
                background: "rgba(6,214,160,0.06)",
                border: "1px solid rgba(6,214,160,0.15)",
                borderRadius: "16px",
                backdropFilter: "blur(16px)",
                boxShadow: "0 4px 24px rgba(0,0,0,0.3), 0 0 20px rgba(6,214,160,0.06)",
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 flex items-center justify-center"
                  style={{ background: "rgba(6,214,160,0.12)", border: "1px solid rgba(6,214,160,0.2)", borderRadius: "12px", boxShadow: "0 0 16px rgba(6,214,160,0.15)" }}
                >
                  <TrendingUp size={22} style={{ color: "#06d6a0" }} />
                </div>
                <div>
                  <h2 className="font-bold text-lg" style={{ color: "#f0f4f8" }}>Proven Success</h2>
                  <p className="text-sm" style={{ color: "#94a3b8" }}>
                    Join thousands who trust Sure Strike Tips
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-8 md:ml-auto">
                <div className="text-center">
                  <p className="text-2xl font-black" style={{ color: "#06d6a0" }}>{winRate}%</p>
                  <p className="text-xs" style={{ color: "#64748b" }}>Win Rate</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black" style={{ color: "#06d6a0" }}>{wins}</p>
                  <p className="text-xs" style={{ color: "#64748b" }}>Wins</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black" style={{ color: "#ff6b6b" }}>{losses}</p>
                  <p className="text-xs" style={{ color: "#64748b" }}>Losses</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-black" style={{ color: "#8338ec" }}>{predictions.length}</p>
                  <p className="text-xs" style={{ color: "#64748b" }}>Total</p>
                </div>
              </div>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="flex gap-3 mb-8">
            {(["all", "win", "loss"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className="text-xs font-semibold px-5 py-2 border capitalize transition-all duration-300"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  letterSpacing: "0.04em",
                  textTransform: "uppercase",
                  borderRadius: "10px",
                  ...(filter === f
                    ? f === "win"
                      ? { background: "linear-gradient(135deg, #06d6a0, #059d79)", color: "#0a0e17", borderColor: "transparent", boxShadow: "0 0 20px rgba(6,214,160,0.3)" }
                      : f === "loss"
                        ? { background: "linear-gradient(135deg, #ff6b6b, #ef4444)", color: "#ffffff", borderColor: "transparent", boxShadow: "0 0 20px rgba(255,107,107,0.3)" }
                        : { background: "linear-gradient(135deg, #8338ec, #6b21a8)", color: "#ffffff", borderColor: "transparent", boxShadow: "0 0 20px rgba(131,56,236,0.3)" }
                    : { background: "rgba(17,24,39,0.6)", color: "#94a3b8", borderColor: "rgba(255,255,255,0.08)" }),
                }}
              >
                {f === "all"
                  ? "All Results"
                  : f === "win"
                    ? <span className="flex items-center gap-1.5"><CheckCircle2 size={13} className="flex-shrink-0" />Wins</span>
                    : <span className="flex items-center gap-1.5"><XCircle size={13} className="flex-shrink-0" />Losses</span>}
              </button>
            ))}
          </div>

          {/* Results */}
          {loading ? (
            <div className="flex flex-col items-center py-24 gap-4">
              <div className="w-14 h-14 flex items-center justify-center" style={{ background: "rgba(6,214,160,0.08)", border: "1px solid rgba(6,214,160,0.2)", borderRadius: "16px", boxShadow: "0 0 24px rgba(6,214,160,0.15)" }}>
                <Loader2 size={28} style={{ color: "#06d6a0" }} className="animate-spin" />
              </div>
              <p className="text-sm" style={{ color: "#64748b" }}>Loading history...</p>
            </div>
          ) : error ? (
            <div className="text-center py-24 text-red-400">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <BarChart3 size={48} className="mx-auto mb-4" style={{ color: "#334155" }} />
              <p className="text-lg mb-2" style={{ color: "#94a3b8" }}>No results yet</p>
              <p className="text-sm" style={{ color: "#64748b" }}>
                Completed predictions will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {filtered.map((pred) => (
                <ResultCard key={pred._id} prediction={pred} />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

function ResultCard({ prediction }: { prediction: Prediction }) {
  const isWin = prediction.result === "win";
  const hasBefore = !!prediction.imageUrl;
  const hasProof = !!prediction.proofImageUrl;
  const hasImages = hasBefore || hasProof;

  return (
    <div className="card-glass overflow-hidden">
      {/* Header */}
      <div className="flex flex-wrap items-center gap-3 px-4 md:px-6 pt-4 md:pt-5 pb-4">
        <h3 className="font-bold text-base md:text-lg" style={{ color: "#f0f4f8" }}>{prediction.match}</h3>
        <span
          className="text-xs font-bold px-3 py-1"
          style={{ background: "rgba(6,214,160,0.1)", color: "#06d6a0", border: "1px solid rgba(6,214,160,0.2)", borderRadius: "8px", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}
        >
          {prediction.oddsCategory} ODDS
        </span>
        {prediction.result && (
          <span className={isWin ? "badge-win" : "badge-loss"}>
            {isWin
              ? <span className="flex items-center gap-1"><CheckCircle2 size={11} />WON</span>
              : <span className="flex items-center gap-1"><XCircle size={11} />LOST</span>}
          </span>
        )}
        <span className="text-sm ml-auto flex items-center gap-1" style={{ color: "#64748b" }}>
          <Calendar size={13} />
          {new Date(prediction.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
        </span>
      </div>

      {/* Image evidence */}
      {hasImages ? (
        <div className={`grid gap-0 ${hasBefore && hasProof ? "grid-cols-2" : "grid-cols-1"}`}
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {hasBefore && (
            <div className={`flex flex-col ${hasBefore && hasProof ? "border-r" : ""}`} style={{ borderColor: "rgba(255,255,255,0.06)" }}>
              <div className="flex items-center justify-between px-3 py-2"
                style={{ background: "rgba(17,24,39,0.6)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: "#94a3b8", fontFamily: "'Space Grotesk', sans-serif" }}>Bet Slip</span>
                <span className="text-[10px] uppercase tracking-widest" style={{ color: "#334155" }}>Before</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={prediction.imageUrl!} alt={`Bet slip — ${prediction.match}`}
                className="w-full object-contain"
                style={{ background: "rgba(17,24,39,0.8)", maxHeight: hasBefore && hasProof ? "280px" : "360px", minHeight: "140px" }}
              />
            </div>
          )}
          {hasProof && (
            <div className="flex flex-col">
              <div className="flex items-center justify-between px-3 py-2"
                style={{
                  background: isWin ? "rgba(6,214,160,0.06)" : "rgba(255,107,107,0.06)",
                  borderBottom: `1px solid ${isWin ? "rgba(6,214,160,0.15)" : "rgba(255,107,107,0.15)"}`,
                }}>
                <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: isWin ? "#06d6a0" : "#ff6b6b", fontFamily: "'Space Grotesk', sans-serif" }}>Result Proof</span>
                <span className="text-[10px] uppercase tracking-widest" style={{ color: "#334155" }}>After</span>
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={prediction.proofImageUrl!} alt={`Result proof — ${prediction.match}`}
                className="w-full object-contain"
                style={{ background: "rgba(17,24,39,0.8)", maxHeight: hasBefore && hasProof ? "280px" : "360px", minHeight: "140px" }}
              />
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 px-4 md:px-6 pb-5"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)", paddingTop: "1.25rem" }}>
          <div>
            <p className="text-xs font-semibold text-center mb-3" style={{ color: "#94a3b8", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.04em", textTransform: "uppercase" }}>Our Prediction</p>
            <div className="overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.06)", borderRadius: "12px" }}>
              <div className="px-4 py-3 flex justify-between items-center"
                style={{ background: "linear-gradient(135deg, #06d6a0, #059d79)" }}>
                <span className="font-black text-sm tracking-wider" style={{ color: "#0a0e17", fontFamily: "'Space Grotesk', sans-serif" }}>SportyBet</span>
                <div className="text-right text-xs" style={{ color: "rgba(10,14,23,0.6)" }}>
                  <div>Betslip</div>
                  <div>{new Date(prediction.date).toLocaleDateString("en-GB")}</div>
                </div>
              </div>
              <div className="p-4" style={{ background: "rgba(17,24,39,0.6)" }}>
                <p className="text-center text-xs mb-1" style={{ color: "#64748b" }}>Booking Code</p>
                <p className="text-center font-black text-xl tracking-widest mb-4" style={{ color: "#8338ec" }}>
                  {prediction.content || "—"}
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "#64748b" }}>Odds</span>
                    <span className="font-bold" style={{ color: "#06d6a0" }}>{prediction.odds}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span style={{ color: "#64748b" }}>League</span>
                    <span className="font-medium" style={{ color: "#cbd5e1" }}>{prediction.league}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold text-center mb-3" style={{ color: isWin ? "#06d6a0" : "#ff6b6b", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Actual Result: <span className="font-black">{isWin ? "WON" : "LOST"}</span>
            </p>
            <div className="h-full flex flex-col items-center justify-center py-8 px-4 text-center"
              style={{
                background: isWin ? "rgba(6,214,160,0.06)" : "rgba(255,107,107,0.06)",
                border: `1px solid ${isWin ? "rgba(6,214,160,0.15)" : "rgba(255,107,107,0.15)"}`,
                borderRadius: "12px",
                boxShadow: isWin ? "0 0 20px rgba(6,214,160,0.06)" : "0 0 20px rgba(255,107,107,0.06)",
              }}>
              {isWin
                ? <CheckCircle2 size={48} className="mb-3" style={{ color: "#06d6a0" }} />
                : <XCircle size={48} className="mb-3" style={{ color: "#ff6b6b" }} />}
              <p className="font-black text-2xl mb-2" style={{ color: isWin ? "#06d6a0" : "#ff6b6b" }}>
                {isWin ? "Big Win!" : "Better luck next time"}
              </p>
              <p className="text-sm" style={{ color: "#64748b" }}>{prediction.match}</p>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between px-4 md:px-6 py-3"
        style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(17,24,39,0.4)" }}>
        <span className="text-xs" style={{ color: "#334155" }}>{prediction.league}</span>
        <span className="text-xs font-semibold flex items-center gap-1" style={{ color: isWin ? "#06d6a0" : "#ff6b6b", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.03em" }}>
          {isWin ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          {isWin ? "Prediction correct" : "Prediction missed"}
        </span>
      </div>
    </div>
  );
}

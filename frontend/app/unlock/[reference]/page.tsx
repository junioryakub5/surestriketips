"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CheckCircle, Calendar, Trophy, Clock, Copy, Check, XCircle, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getUnlockedPrediction } from "@/lib/api";
import { UnlockData } from "@/lib/types";

export default function UnlockPage() {
  const params = useParams();
  const router = useRouter();
  const reference = params.reference as string;

  const [data, setData] = useState<UnlockData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!reference) return;
    const fetchData = async () => {
      try {
        const result = await getUnlockedPrediction(reference);
        setData(result);
      } catch (err: unknown) {
        const msg =
          (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
          "Access denied. Payment reference not found or expired.";
        setError(msg);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [reference]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <Navbar />
      <main className="min-h-screen pt-24 pb-16 relative z-10" style={{ background: "#0a0e17" }}>
        <div className="page-container max-w-2xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 gap-4">
              <div className="w-14 h-14 flex items-center justify-center" style={{ background: "rgba(6,214,160,0.08)", border: "1px solid rgba(6,214,160,0.2)", borderRadius: "16px", boxShadow: "0 0 24px rgba(6,214,160,0.15)" }}>
                <Loader2 size={28} style={{ color: "#06d6a0" }} className="animate-spin" />
              </div>
              <p style={{ color: "#64748b" }}>Unlocking your prediction...</p>
            </div>
          ) : error ? (
            <div className="text-center py-32">
              <div className="w-20 h-20 flex items-center justify-center mx-auto mb-6" style={{ background: "rgba(255,107,107,0.08)", border: "1px solid rgba(255,107,107,0.2)", borderRadius: "20px", boxShadow: "0 0 24px rgba(255,107,107,0.1)" }}>
                <XCircle size={40} style={{ color: "#ff6b6b" }} />
              </div>
              <h1 className="font-brand text-2xl font-bold mb-3" style={{ color: "#ff6b6b" }}>
                Access Denied
              </h1>
              <p className="mb-8 max-w-sm mx-auto" style={{ color: "#94a3b8" }}>{error}</p>
              <button onClick={() => router.push("/")} className="btn-gold">
                Go Back Home
              </button>
            </div>
          ) : data ? (
            <div className="animate-fadeInUp">
              {/* Success Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-5 relative">
                  <div
                    className="absolute inset-0 rounded-full animate-ping opacity-20"
                    style={{ background: "#06d6a0" }}
                  />
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: "linear-gradient(135deg, #06d6a0, #059d79)", boxShadow: "0 0 32px rgba(6,214,160,0.4)" }}
                  >
                    <CheckCircle size={36} style={{ color: "#0a0e17" }} />
                  </div>
                </div>
                <h1 className="font-brand text-3xl font-bold mb-2" style={{ color: "#f0f4f8" }}>
                  Prediction{" "}
                  <span
                    style={{
                      background: "linear-gradient(135deg, #06d6a0, #8338ec)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    Unlocked!
                  </span>
                </h1>
                <p className="text-sm" style={{ color: "#64748b" }}>
                  Payment verified — Your prediction is ready below
                </p>
              </div>

              {/* Access Info */}
              <div className="card-glass p-5 mb-6 flex items-center gap-4">
                <Clock size={18} style={{ color: "#06d6a0" }} className="flex-shrink-0" />
                <div>
                  <p className="text-sm" style={{ color: "#cbd5e1" }}>
                    Access valid until{" "}
                    <strong style={{ color: "#06d6a0" }}>
                      {new Date(data.payment.expiresAt).toLocaleDateString("en-GB", {
                        day: "numeric", month: "long", year: "numeric",
                      })}
                    </strong>
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                    Purchased by {data.payment.email}
                  </p>
                </div>
              </div>

              {/* Main Prediction Card */}
              <div className="card-glass overflow-hidden mb-6">
                <div
                  className="px-6 py-4"
                  style={{ background: "rgba(6,214,160,0.04)", borderBottom: "1px solid rgba(6,214,160,0.1)" }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-bold text-xl mb-1" style={{ color: "#f0f4f8" }}>{data.prediction.match}</h2>
                      <div className="flex items-center gap-3 text-sm" style={{ color: "#64748b" }}>
                        <span className="flex items-center gap-1">
                          <Calendar size={13} />
                          {new Date(data.prediction.date).toLocaleDateString("en-GB", {
                            weekday: "long", day: "numeric", month: "long",
                          })}
                        </span>
                        <span>·</span>
                        <span>{data.prediction.league}</span>
                      </div>
                    </div>
                    <div className="flex-shrink-0">
                      <span className="text-xs font-black px-3 py-1 block text-center mb-1"
                        style={{ background: "linear-gradient(135deg, #06d6a0, #059d79)", color: "#0a0e17", borderRadius: "8px", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                        {data.prediction.oddsCategory} ODDS
                      </span>
                      <p className="text-center text-xs" style={{ color: "#64748b" }}>
                        Total: <strong style={{ color: "#06d6a0" }}>{data.prediction.odds}</strong>
                      </p>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-6">
                  <div
                    className="p-5 mb-4"
                    style={{ background: "rgba(6,214,160,0.06)", border: "1px solid rgba(6,214,160,0.15)", borderRadius: "14px", boxShadow: "0 0 16px rgba(6,214,160,0.06)" }}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Trophy size={16} style={{ color: "#06d6a0" }} />
                        <span className="text-sm font-semibold" style={{ color: "#06d6a0", fontFamily: "'Space Grotesk', sans-serif", letterSpacing: "0.04em", textTransform: "uppercase", fontSize: "0.7rem" }}>
                          Prediction Content
                        </span>
                      </div>
                      <button
                        onClick={() => copyToClipboard(data.prediction.content || "")}
                        className="flex items-center gap-1.5 text-xs transition-colors"
                        style={{ color: "#64748b" }}
                      >
                        {copied ? (
                          <><Check size={12} style={{ color: "#06d6a0" }} /> Copied!</>
                        ) : (
                          <><Copy size={12} /> Copy</>
                        )}
                      </button>
                    </div>
                    <p className="leading-relaxed whitespace-pre-wrap text-sm" style={{ color: "#cbd5e1" }}>
                      {data.prediction.content || "No content provided."}
                    </p>
                  </div>

                  {data.prediction.imageUrl && (
                    <div className="overflow-hidden mt-4" style={{ borderRadius: "14px" }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={data.prediction.imageUrl} alt={`Bet slip for ${data.prediction.match}`} className="w-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="px-6 py-3 flex items-center justify-between" style={{ borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(17,24,39,0.4)" }}>
                  <span className="text-xs" style={{ color: "#64748b" }}>
                    Reference: <code style={{ color: "#94a3b8" }}>{reference}</code>
                  </span>
                  <span className="text-xs" style={{ color: "#64748b" }}>
                    GHS {data.payment.amount} paid
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => router.push("/")} className="btn-outline-gold flex-1">View More Tips</button>
                <button onClick={() => router.push("/history")} className="btn-outline-gold flex-1">Past Results</button>
              </div>
            </div>
          ) : null}
        </div>
      </main>
      <Footer />
    </>
  );
}

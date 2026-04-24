"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await authClient.signIn.email({ email, password });

      if (res?.error) {
        setError("Invalid email or password.");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error("Login error:", err);
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", background: "#060b18",
      position: "relative", padding: "24px", overflow: "hidden",
    }}>
      <div className="orb" style={{
        position: "absolute", top: "-20%", left: "-10%",
        width: 600, height: 600, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(124,58,237,0.2) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />
      <div className="orb orb-2" style={{
        position: "absolute", bottom: "-20%", right: "-10%",
        width: 500, height: 500, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(37,99,235,0.15) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", justifyContent: "center",
            width: 64, height: 64, borderRadius: 16, marginBottom: 16,
            background: "linear-gradient(135deg, #7c3aed, #4f46e5)",
          }}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24" stroke="white" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", letterSpacing: "-0.5px" }}>VoiceScript</h1>
          <p style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>AI-Powered Audio Transcription</p>
        </div>

        <div style={{
          background: "rgba(15,23,42,0.6)", backdropFilter: "blur(12px)",
          borderRadius: 20, padding: 36,
          border: "1px solid rgba(255,255,255,0.08)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.5)",
        }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "#fff", marginBottom: 28 }}>Admin Login</h2>

          <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 8, fontWeight: 500 }}>
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@burzt.com"
                required
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 15,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", outline: "none", fontFamily: "inherit",
                }}
                onFocus={(e) => e.target.style.borderColor = "#7c3aed"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 13, color: "#94a3b8", marginBottom: 8, fontWeight: 500 }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                style={{
                  width: "100%", padding: "12px 16px", borderRadius: 12, fontSize: 15,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "#fff", outline: "none", fontFamily: "inherit",
                }}
                onFocus={(e) => e.target.style.borderColor = "#7c3aed"}
                onBlur={(e) => e.target.style.borderColor = "rgba(255,255,255,0.1)"}
              />
            </div>

            {error && (
              <div style={{
                display: "flex", alignItems: "center", gap: 8,
                padding: "12px 16px", borderRadius: 12, fontSize: 14,
                color: "#f87171", background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.2)",
              }}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20" style={{ flexShrink: 0 }}>
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
                </svg>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%", padding: "14px", borderRadius: 12,
                fontSize: 15, fontWeight: 600, color: "#fff",
                border: "none", cursor: loading ? "not-allowed" : "pointer",
                background: loading ? "rgba(124,58,237,0.5)" : "linear-gradient(135deg, #7c3aed, #4f46e5)",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                fontFamily: "inherit", marginTop: 4,
              }}
            >
              {loading ? (
                <>
                  <svg className="spin" width="18" height="18" fill="none" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }}/>
                    <path fill="currentColor" style={{ opacity: 0.75 }} d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Authenticating...
                </>
              ) : "Sign In →"}
            </button>
          </form>
        </div>
        <p style={{ textAlign: "center", color: "#475569", fontSize: 12, marginTop: 24 }}>
          Burzt × VoiceScript Admin Panel
        </p>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "@/lib/auth-client";
import AudioUploader from "@/components/AudioUploader";
import VoiceRecorder from "@/components/VoiceRecorder";
import TranscriptList from "@/components/TranscriptList";

interface Transcript {
  id: string;
  filename: string;
  transcript: string;
  source: string;
  createdAt: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { data: session, isPending } = useSession();
  const [tab, setTab] = useState<"upload" | "record">("upload");
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [loadingTranscripts, setLoadingTranscripts] = useState(true);

  useEffect(() => {
    if (!isPending && !session) router.push("/login");
  }, [session, isPending, router]);

  useEffect(() => {
    if (session) fetchTranscripts();
  }, [session]);

  async function fetchTranscripts() {
    setLoadingTranscripts(true);
    try {
      const res = await fetch("/api/transcripts");
      const data = await res.json();
      if (Array.isArray(data)) setTranscripts(data);
    } finally {
      setLoadingTranscripts(false);
    }
  }

  async function handleLogout() {
    await signOut();
    router.push("/login");
  }

  if (isPending || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-violet-500 border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb fixed top-[-15%] right-[-5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)" }} />
      <div className="orb orb-2 fixed bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(37,99,235,0.12) 0%, transparent 70%)" }} />

      {/* Header */}
      <header className="sticky top-0 z-50 glass" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)" }}>
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </div>
            <span className="font-bold text-white text-lg tracking-tight">VoiceScript</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-slate-500 text-sm hidden sm:block">
              {session.user.name}
            </span>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-slate-400 hover:text-white transition-all duration-200"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-3xl mx-auto px-6 py-8 space-y-8">
        {/* Hero text */}
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Transcribe Audio
          </h1>
          <p className="text-slate-500 mt-1">Upload a file or record directly — Gemini AI does the rest.</p>
        </div>

        {/* Input card */}
        <div className="glass rounded-2xl overflow-hidden">
          {/* Tabs */}
          <div className="flex" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
            {(["upload", "record"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className={`flex-1 py-4 text-sm font-semibold flex items-center justify-center gap-2 transition-all duration-200 ${
                  tab === t ? "text-white" : "text-slate-500 hover:text-slate-300"
                }`}
                style={
                  tab === t
                    ? { borderBottom: "2px solid #7c3aed", background: "rgba(124,58,237,0.07)" }
                    : { borderBottom: "2px solid transparent" }
                }
              >
                {t === "upload" ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    Upload File
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    Record Live
                  </>
                )}
              </button>
            ))}
          </div>

          {/* Active tab content */}
          <div className="p-6">
            {tab === "upload" ? (
              <AudioUploader onTranscriptAdded={fetchTranscripts} />
            ) : (
              <VoiceRecorder onTranscriptAdded={fetchTranscripts} />
            )}
          </div>
        </div>

        {/* History */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold text-white">Transcript History</h2>
              <p className="text-slate-600 text-sm mt-0.5">
                {loadingTranscripts ? "Loading..." : `${transcripts.length} transcript${transcripts.length !== 1 ? "s" : ""}`}
              </p>
            </div>
            <button
              onClick={fetchTranscripts}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-300 transition-colors"
              style={{ background: "rgba(255,255,255,0.05)" }}
              title="Refresh"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
          <TranscriptList transcripts={transcripts} loading={loadingTranscripts} />
        </div>
      </main>
    </div>
  );
}
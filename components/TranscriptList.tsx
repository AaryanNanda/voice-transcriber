"use client";

import { useState } from "react";

interface Transcript {
  id: string;
  filename: string;
  transcript: string;
  source: string;
  createdAt: string;
}

interface Props {
  transcripts: Transcript[];
  loading: boolean;
}

function TranscriptCard({ item, index }: { item: Transcript; index: number }) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const isLong = item.transcript.length > 200;
  const displayText = !expanded && isLong ? item.transcript.slice(0, 200) + "…" : item.transcript;

  async function handleCopy() {
    await navigator.clipboard.writeText(item.transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const date = new Date(item.createdAt);
  const timeStr = date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  const dateStr = date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  const wordCount = item.transcript.split(/\s+/).filter(Boolean).length;

  return (
    <div
      className="glass glass-hover rounded-2xl p-5 slide-up transition-all duration-200"
      style={{ animationDelay: `${index * 60}ms` }}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2 min-w-0">
          {/* Source badge */}
          <span
            className="shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold"
            style={
              item.source === "recording"
                ? { background: "rgba(239,68,68,0.15)", color: "#f87171", border: "1px solid rgba(239,68,68,0.2)" }
                : { background: "rgba(124,58,237,0.15)", color: "#a78bfa", border: "1px solid rgba(124,58,237,0.2)" }
            }
          >
            {item.source === "recording" ? "🎙 Recording" : "📁 Upload"}
          </span>
          <p className="text-slate-400 text-sm truncate">{item.filename}</p>
        </div>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
          style={{
            background: copied ? "rgba(34,197,94,0.15)" : "rgba(255,255,255,0.05)",
            color: copied ? "#4ade80" : "#94a3b8",
            border: `1px solid ${copied ? "rgba(34,197,94,0.2)" : "rgba(255,255,255,0.08)"}`,
          }}
        >
          {copied ? (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
              </svg>
              Copied
            </>
          ) : (
            <>
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Transcript text */}
      <p className="text-slate-300 text-sm leading-relaxed">{displayText}</p>

      {isLong && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-2 text-xs text-violet-400 hover:text-violet-300 transition-colors font-medium"
        >
          {expanded ? "Show less ↑" : "Show more ↓"}
        </button>
      )}

      {/* Footer */}
      <div className="flex items-center gap-3 mt-4 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
        <span className="text-xs text-slate-600">{dateStr} at {timeStr}</span>
        <span className="text-slate-700">•</span>
        <span className="text-xs text-slate-600">{wordCount} words</span>
      </div>
    </div>
  );
}

export default function TranscriptList({ transcripts, loading }: Props) {
  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="glass rounded-2xl p-5 h-32 shimmer" />
        ))}
      </div>
    );
  }

  if (transcripts.length === 0) {
    return (
      <div className="glass rounded-2xl p-12 text-center">
        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="text-slate-400 font-medium">No transcripts yet</p>
        <p className="text-slate-600 text-sm mt-1">Upload an audio file or record your voice above</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {transcripts.map((item, i) => (
        <TranscriptCard key={item.id} item={item} index={i} />
      ))}
    </div>
  );
}
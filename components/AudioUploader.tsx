"use client";

import { useState, useRef } from "react";

interface Props {
  onTranscriptAdded: () => void;
}

export default function AudioUploader({ onTranscriptAdded }: Props) {
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [transcript, setTranscript] = useState("");
  const [filename, setFilename] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  async function processFile(file: File) {
    if (!file.type.startsWith("audio/")) {
      setStatus("error");
      setTranscript("Please upload an audio file (mp3, wav, ogg, webm, etc.)");
      return;
    }

    setFilename(file.name);
    setStatus("uploading");
    setTranscript("");

    const formData = new FormData();
    formData.append("audio", file);
    formData.append("source", "upload");

    try {
      const res = await fetch("/api/transcribe", { method: "POST", body: formData });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error);

      setTranscript(data.transcript);
      setStatus("done");
      onTranscriptAdded();
    } catch (err) {
      setStatus("error");
      setTranscript(err instanceof Error ? err.message : "Transcription failed.");
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }

  function handleReset() {
    setStatus("idle");
    setTranscript("");
    setFilename("");
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-4">
      {/* Drop zone */}
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={`relative rounded-2xl p-10 text-center cursor-pointer transition-all duration-300 ${
          dragging
            ? "border-violet-500 bg-violet-500/10"
            : "border-dashed border-2 border-white/10 hover:border-white/20 hover:bg-white/5"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0])}
        />

        <div className="flex flex-col items-center gap-3 pointer-events-none">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors duration-300 ${
            dragging ? "bg-violet-500/20" : "bg-white/5"
          }`}>
            <svg className={`w-7 h-7 transition-colors duration-300 ${dragging ? "text-violet-400" : "text-slate-500"}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </div>
          <div>
            <p className="text-slate-300 font-medium">
              {dragging ? "Drop to transcribe" : "Drop audio here or click to upload"}
            </p>
            <p className="text-slate-600 text-sm mt-1">MP3, WAV, OGG, WEBM • Under 1 minute</p>
          </div>
        </div>
      </div>

      {/* Status area */}
      {status === "uploading" && (
        <div className="glass rounded-2xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <svg className="animate-spin w-5 h-5 text-violet-400 shrink-0" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-sm text-slate-300">Transcribing <span className="text-violet-400 font-medium">{filename}</span>...</p>
          </div>
          <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
            <div className="h-full rounded-full bg-gradient-to-r from-violet-600 to-indigo-500 shimmer w-full" />
          </div>
        </div>
      )}

      {status === "done" && (
        <div className="glass rounded-2xl p-5 slide-up" style={{ borderColor: "rgba(34,197,94,0.2)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p className="text-sm text-green-400 font-medium">Transcription complete</p>
            </div>
            <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">
              Upload another
            </button>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed bg-white/5 rounded-xl p-4">{transcript}</p>
        </div>
      )}

      {status === "error" && (
        <div className="glass rounded-2xl p-5" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-red-400 font-medium">Error</p>
            <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Try again</button>
          </div>
          <p className="text-slate-400 text-sm">{transcript}</p>
        </div>
      )}
    </div>
  );
}
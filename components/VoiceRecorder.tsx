"use client";

import { useState, useRef, useEffect } from "react";

interface Props {
  onTranscriptAdded: () => void;
}

export default function VoiceRecorder({ onTranscriptAdded }: Props) {
  const [status, setStatus] = useState<"idle" | "recording" | "processing" | "done" | "error">("idle");
  const [transcript, setTranscript] = useState("");
  const [timer, setTimer] = useState(0);
  const [permissionDenied, setPermissionDenied] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animFrameRef = useRef<number>(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      cancelAnimationFrame(animFrameRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  function drawWaveform() {
    const canvas = canvasRef.current;
    const analyser = analyserRef.current;
    if (!canvas || !analyser) return;

    const ctx = canvas.getContext("2d")!;
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    function draw() {
      animFrameRef.current = requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "#ef4444";
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    }

    draw();
  }

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Set up waveform
      const audioCtx = new AudioContext();
      const source = audioCtx.createMediaStreamSource(stream);
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 512;
      source.connect(analyser);
      analyserRef.current = analyser;

      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        cancelAnimationFrame(animFrameRef.current);
        stream.getTracks().forEach((t) => t.stop());
        clearInterval(timerRef.current!);

        const mimeType = recorder.mimeType || "audio/webm";
        const blob = new Blob(chunksRef.current, { type: mimeType });

        await transcribeBlob(blob, mimeType);
      };

      recorder.start();
      mediaRecorderRef.current = recorder;

      setStatus("recording");
      setTimer(0);
      timerRef.current = setInterval(() => setTimer((t) => t + 1), 1000);
      drawWaveform();
    } catch {
      setPermissionDenied(true);
    }
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setStatus("processing");
  }

  async function transcribeBlob(blob: Blob, mimeType: string) {
    try {
      const file = new File([blob], `recording-${Date.now()}.webm`, { type: mimeType });
      const formData = new FormData();
      formData.append("audio", file);
      formData.append("source", "recording");

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

  function formatTime(secs: number) {
    const m = Math.floor(secs / 60).toString().padStart(2, "0");
    const s = (secs % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  }

  function handleReset() {
    setStatus("idle");
    setTranscript("");
    setTimer(0);
    setPermissionDenied(false);
  }

  if (permissionDenied) {
    return (
      <div className="glass rounded-2xl p-8 text-center" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
        <div className="w-12 h-12 rounded-2xl bg-red-500/10 flex items-center justify-center mx-auto mb-3">
          <svg className="w-6 h-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
        </div>
        <p className="text-red-400 font-medium mb-1">Microphone access denied</p>
        <p className="text-slate-500 text-sm">Please allow microphone access in your browser settings.</p>
        <button onClick={handleReset} className="mt-4 text-sm text-slate-400 hover:text-slate-200 transition-colors">Try again</button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Recorder UI */}
      <div className="glass rounded-2xl p-8 flex flex-col items-center gap-6">
        {/* Waveform canvas — visible only when recording */}
        <canvas
          ref={canvasRef}
          width={400}
          height={60}
          className={`w-full max-w-sm rounded-xl transition-opacity duration-300 ${
            status === "recording" ? "opacity-100" : "opacity-0 h-0 pointer-events-none"
          }`}
          style={{ background: "rgba(239,68,68,0.05)" }}
        />

        {/* Timer */}
        {status === "recording" && (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 pulse-ring inline-block" />
            <span className="text-red-400 font-mono font-semibold text-lg">{formatTime(timer)}</span>
            <span className="text-slate-500 text-sm">Recording...</span>
          </div>
        )}

        {status === "processing" && (
          <div className="flex items-center gap-3">
            <svg className="animate-spin w-5 h-5 text-violet-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-slate-300 text-sm">Transcribing with Gemini AI...</p>
          </div>
        )}

        {status === "idle" && (
          <p className="text-slate-500 text-sm">Press the button to start recording</p>
        )}

        {/* Record / Stop Button */}
        {(status === "idle" || status === "recording") && (
          <div className="relative flex items-center justify-center">
            {status === "recording" && (
              <>
                <div className="pulse-ring absolute w-20 h-20 rounded-full border-2 border-red-500/40" />
                <div className="pulse-ring absolute w-20 h-20 rounded-full border-2 border-red-500/20" style={{ animationDelay: "0.4s" }} />
              </>
            )}
            <button
              onClick={status === "idle" ? startRecording : stopRecording}
              className="relative w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 active:scale-95"
              style={{
                background: status === "recording"
                  ? "linear-gradient(135deg, #dc2626, #ef4444)"
                  : "linear-gradient(135deg, #7c3aed, #4f46e5)",
                boxShadow: status === "recording"
                  ? "0 0 30px rgba(239,68,68,0.3)"
                  : "0 0 30px rgba(124,58,237,0.3)",
              }}
            >
              {status === "recording" ? (
                <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2"/>
                </svg>
              ) : (
                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Transcript result */}
      {status === "done" && (
        <div className="glass rounded-2xl p-5 slide-up" style={{ borderColor: "rgba(34,197,94,0.2)" }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
                <svg className="w-3 h-3 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p className="text-sm text-green-400 font-medium">Recording transcribed</p>
            </div>
            <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Record again</button>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed bg-white/5 rounded-xl p-4">{transcript}</p>
        </div>
      )}

      {status === "error" && (
        <div className="glass rounded-2xl p-5" style={{ borderColor: "rgba(239,68,68,0.2)" }}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-red-400 font-medium">Transcription failed</p>
            <button onClick={handleReset} className="text-xs text-slate-500 hover:text-slate-300 transition-colors">Try again</button>
          </div>
          <p className="text-slate-400 text-sm">{transcript}</p>
        </div>
      )}
    </div>
  );
}
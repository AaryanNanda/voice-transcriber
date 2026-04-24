import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { transcripts } from "@/db/schema";
import { headers } from "next/headers";

export async function POST(req: NextRequest) {
  // 1. Auth Check (Server Side)
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // 2. API Key Check - Line 16 fix
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ Environment variable GEMINI_API_KEY is missing!");
    return NextResponse.json({ error: "API Key not configured" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const audioFile = formData.get("audio") as File;
    if (!audioFile) return NextResponse.json({ error: "No file" }, { status: 400 });

    const arrayBuffer = await audioFile.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString("base64");
    
    // 3. Initialize Gemini (Using latest 2026 models)
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Use gemini-3.1-flash-lite for fastest transcription in 2026
    const model = genAI.getGenerativeModel({ 
      model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite" 
    });

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: audioFile.type.split(';')[0] || "audio/mp3",
          data: base64,
        },
      },
      { text: "Transcribe this audio file accurately. Return ONLY the text." },
    ]);

    const transcript = result.response.text();

    // 4. Save to DB
    await db.insert(transcripts).values({
      id: crypto.randomUUID(),
      userId: session.user.id,
      filename: audioFile.name,
      transcript,
      createdAt: new Date(),
    });

    return NextResponse.json({ transcript });
  } catch (err: any) {
    console.error("Transcription Error:", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { AssemblyAI } from "assemblyai";
import { pusherServer } from "lib/pusher";

const ai = new GoogleGenAI({ apiKey: process.env.AI_STUDIO });

const assemblyai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_KEY! });

export async function POST(req: Request) {
  const { videoUrl, channelId } = await req.json();

  if (!videoUrl || !channelId) {
    return NextResponse.json(
      { error: "Missing videoUrl or channelId" },
      { status: 400 }
    );
  }

  try {
    await pusherServer.trigger(channelId, "status", {
      status: "transcribing",
      message: "Sending video to AssemblyAI for transcription",
    });

    // Transcribe with AssemblyAI
    const transcript = await assemblyai.transcripts.create({
      audio_url: videoUrl,
      speaker_labels: true,
    });

    if (!transcript.text) {
      throw new Error("Transcription failed");
    }

    await pusherServer.trigger(channelId, "status", { status: "analyzing" });

    const transcriptText = transcript.text;

    const userPrompt = `
    Your task is to provide an in-depth analysis of a provided video transcript, 
  structured to both inform and engage readers. Follow a clear, engaging writing style. 
  Use bullet points where helpful.
\n\n${transcriptText}`;

    const summaryCompletion = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: userPrompt }],
        },
      ],
    });

    const summaryText =
      summaryCompletion.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!summaryText) {
      throw new Error("AI did not return a summary.");
    }

    // Send the final result
    await pusherServer.trigger(channelId, "summary", {
      summary: summaryText,
      status: "completed",
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error: any) {
    await pusherServer.trigger(channelId, "error", {
      error: error instanceof Error ? error.message : "Unknown error",
    });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Explicitly handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}

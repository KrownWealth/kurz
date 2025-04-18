import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { AssemblyAI } from "assemblyai";

const ai = new GoogleGenAI({ apiKey: process.env.AI_STUDIO });

const assemblyai = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_KEY! });

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const videoUrl = searchParams.get("url");

  if (!videoUrl) {
    return NextResponse.json(
      { available: false, error: "Missing 'url' parameter" },
      { status: 400 }
    );
  }

  try {
    // Transcribe with AssemblyAI
    const transcript = await assemblyai.transcripts.create({
      audio_url: videoUrl,
      speaker_labels: true,
    });

    if (!transcript.text) {
      throw new Error("Transcription failed");
    }

    // Extract just the text content
    const transcriptText = transcript.text;

    const prompt = `
      Summarize the following content:
      ${transcriptText}

      Please provide:
      1. A concise overview
      2. Key points
      3. Actionable insights
    `;
    // Generate summary with Gemini
    const summaryCompletion = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{ role: "user", parts: [{ text: prompt }] }],
    });

    const summaryText =
      summaryCompletion.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Summary not available";

    return NextResponse.json(
      {
        available: true,
        success: true,
        summary: summaryText,
      },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { available: false, error: error.message },
      { status: 500 }
    );
  }
}

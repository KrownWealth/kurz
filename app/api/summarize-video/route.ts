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

    const userPrompt = `Your task is to provide an in-depth analysis of a provided video transcript, structured to both inform and engage readers. Your narrative should unfold with clarity and insight, reflecting the style of a Paul Graham essay. Follow these major headings for organization:
    # Intro
    Begin with a narrative introduction that captivates the reader, setting the stage for an engaging exploration. Start with an anecdote or a surprising fact to draw in the reader, then succinctly summarize the main themes and objectives of the video.
    
    # Explain like am 5
    Immediately follow with an ELI5 (Explain Like I&apos;m 5) section. Use simple language and analogies to make complex ideas accessible and engaging, ensuring clarity and simplicity.
    
    # Terminologies
    List and define key terminologies mentioned in the video in bullet points.
    
    # Summary
    Delve deeply into the video&apos;s main themes. Provide a comprehensive analysis of each theme, backed by examples from the video and relevant research. Organize the summary as a rich narrative essay.
    
    # Takeaways
    End with actionable takeaways in bullet points, offering practical advice or steps based on the video content.
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

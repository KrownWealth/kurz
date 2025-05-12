import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

import { YoutubeTranscript } from "youtube-transcript";

const ai = new GoogleGenAI({ apiKey: process.env.AI_STUDIO });

export async function POST(req: Request) {
  const { videoUrl } = await req.json();
  // Validate input
  if (!videoUrl) {
    return NextResponse.json(
      { success: false, error: "Missing video URL" },
      { status: 400 }
    );
  }
  console.log("Incoming videoUrl:", videoUrl);

  let transcript;

  try {
    transcript = await YoutubeTranscript.fetchTranscript(videoUrl);
  } catch (error: any) {
    console.error("Transcript fetch error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error:
          "Failed to fetch transcript. The video might be private or lack subtitles.",
      },
      { status: 404 }
    );
  }

  if (!transcript || transcript.length === 0) {
    return NextResponse.json(
      { success: false, error: "Transcript not available for this video." },
      { status: 404 }
    );
  }

  const transcriptText = transcript.map((t) => t.text).join(" ");
  const MAX_CHARS = 15000;
  const trimmedTranscript = transcriptText.slice(0, MAX_CHARS);

  const userPrompt = `
  Your task is to provide an in-depth analysis of a provided video transcript, structured to both inform and engage readers. Your narrative should unfold with clarity and insight, reflecting the style of a Paul Graham essay. Follow these major headings for organization:
    # Intro
    Begin with a narrative introduction that captivates the reader, setting the stage for an engaging exploration. Start with an anecdote or a surprising fact to draw in the reader, then succinctly summarize the main themes and objectives of the video.
    
    # ELI5
    Immediately follow with an ELI5 (Explain Like I&apos;m 5) section. Use simple language and analogies to make complex ideas accessible and engaging, ensuring clarity and simplicity.
    
    # Terminologies
    List and define key terminologies mentioned in the video in bullet points.
    
    # Summary
    Delve deeply into the video&apos;s main themes. Provide a comprehensive analysis of each theme, backed by examples from the video and relevant research. Organize the summary as a rich narrative essay.
    
    # Takeaways
    End with actionable takeaways in bullet points, offering practical advice or steps based on the video content.
\n\n${trimmedTranscript}`;

  try {
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
      summaryCompletion.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Summary not available";

    return NextResponse.json({
      success: true,
      // message: "Hello World",
      summary: summaryText,
    });
  } catch (error: any) {
    console.error("Internal Error:", error.message);
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

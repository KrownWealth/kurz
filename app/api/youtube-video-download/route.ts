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

  const userPrompt = `Here is the transcript for analysis:\n\n${trimmedTranscript}`;

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

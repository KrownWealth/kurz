import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.AI_STUDIO });

export async function POST(req: Request) {
  const body = await req.json();

  if (!body) {
    return NextResponse.json({ error: "No PDF provided" }, { status: 400 });
  }

  try {
    const summaryCompletion = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [
        {
          role: "user",
          parts: [{ text: `Summarize the following text:\n\n${body.text}` }],
        },
      ],
    });

    const summaryText =
      summaryCompletion.candidates?.[0]?.content?.parts?.[0]?.text ??
      "Summary not available";

    return NextResponse.json({
      success: true,
      message: "Hello World",
      summary: summaryText,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to generate summary" },
      { status: 500 }
    );
  }
}

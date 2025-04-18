import { TranscriptData } from "../types";

export const parseTranscriptData = async (
  data: TranscriptData[]
): Promise<string> => {
  let transcript: string = "";

  data.forEach(
    (line: TranscriptData) => (transcript = transcript + ` ${line.transcript}`)
  );

  return transcript;
};

// export const parseTranscriptData = async (
//   data: TranscriptData[]
// ): Promise<string> => {
//   if (!Array.isArray(data)) {
//     throw new Error("Invalid transcript data format");
//   }

//   return data
//     .map((line) => line.transcript)
//     .filter(Boolean)
//     .join(" ");
// };

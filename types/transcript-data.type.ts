export interface Word {
  word: string;
  start_time: number;
  end_time: number;
}

export interface TranscriptData {
  transcript: string;
  confidence: number;
  words: Word[];
}

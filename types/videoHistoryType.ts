export interface VideoHistoryItem {
  id: string;
  title: string;
  videoUrl: string;
  thumbnailUrl: string;
  date: string;
  summary?: string;
  active: boolean;
}

export type SummaryData = {
  summary: string;
  type: string;
  mainPoints: string[];
  fullSummary: string;
  keyTerms: { term: string; definition: string }[];
  metadata: {
    originalLength: string;
    summaryLength: string;
    source: string;
  };
};

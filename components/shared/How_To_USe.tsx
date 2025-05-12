'use client'


export function HowToUseKurz() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h4 className="text-sm text-start mb-8 tracking-tight leading-none">How to Use Kurz - 3 Simple Steps</h4>

      <div>
        {/* Step 1 */}
        <ul className=' list-decimal space-y-2 text-sm text-muted-foreground'>
          <li>  Click "Upload PDF File" to select a document or Paste a video URL (YouTube/Vimeo)</li>
          <li>Click "Summarize" utton for AI to extracts key points in seconds</li>
          <li>View your geerated summary</li>
        </ul>

      </div>

      <div className="mt-8 text-start text-xs text-gray-500 dark:text-gray-400">
        <p className="font-medium mb-1">Visual Flow:
          <code className="bg-gray-100 dark:bg-gray-800 py-1 rounded px-2">Upload → Process → Review</code></p>
        <p>Supported Formats: PDF | MP4 | YouTube/Vimeo URLs</p>
      </div>
    </div>
  );
}
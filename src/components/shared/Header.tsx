import { BookOpen } from "lucide-react";

export function Header() {
  return (
    <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl text-black">Kurz</span>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">AI-Powered Content Summarization</div>
        </div>
      </div>
    </header>
  )
}

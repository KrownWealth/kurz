"use client"

import { BookOpen, Menu } from "lucide-react";
import { ModeToggle } from "./Mode_toggle";
import { Button } from "../ui/button";
import { useState } from "react";
import { HistorySidebar } from "./History_Sidebar";
import { toast } from "sonner";
import { VideoHistoryItem } from "../../types/videoHistoryType";



export function Header({
  setSummary,
  setIsProcessing,
  setVideoUrl,
}: {
  isProcessing: boolean;
  setSummary: (data: string) => void
  //setSummary: React.Dispatch<React.SetStateAction<VideoSummaryData | null>>;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
  videoUrl: string | null;
  setVideoUrl: (svideoUrl: string) => void;
}) {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)

  const handleVideoSelectFromHistory = async (item: any) => {
    setIsProcessing(true);
    try {
      // Call your summarization API with the selected video URL
      const response = await fetch(`/api/summarize-video?url=${encodeURIComponent(item.videoUrl)}`);
      const data = await response.json();

      if (data.success) {
        setSummary(data.summary);
        setVideoUrl(item.videoUrl);
      } else {
        throw new Error(data.error || "Failed to summarize video");
      }
    } catch (error: any) {
      toast.error(error.message || "Error summarizing video");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteVideo = async (item: VideoHistoryItem): Promise<void> => {
    try {
      const response = await fetch(`/api/cloudinary?id=${item.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error("Failed to delete video");
      }

      toast.success("Video deleted successfully");
    } catch (error: any) {
      console.error("Error deleting video:", error);
      toast.error(error.message || "Error deleting video");
      throw error;
    }
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="icon"
                className="mr-2 md:hidden"
                onClick={() => setShowMobileSidebar(!showMobileSidebar)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
              <BookOpen className="h-6 w-6 text-primary dark:text-white" />
              <span className="font-bold text-xl dark:text-wite">Kurz</span>
            </div>
            <div className="flex flex-row space-x-4 items-center justify-center">
              <ModeToggle />
              <p className="text-sm text-gray-500 dark:text-gray-400 hidden md:flex">AI-Powered Content Summarization</p>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile sidebar */}
      {showMobileSidebar && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setShowMobileSidebar(false)} />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-gray-950">
            <HistorySidebar
              onSelectItem={handleVideoSelectFromHistory}
              onDeleteItem={handleDeleteVideo} />
          </div>
        </div>
      )}
    </>
  )
}

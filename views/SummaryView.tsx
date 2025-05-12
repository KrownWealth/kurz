'use client'

import { toast } from 'sonner';
import { Header, HistorySidebar, SummarySection, UploadSection } from '../components/shared'
import React, { useState } from 'react'
import { VideoHistoryItem } from '../types/videoHistoryType';
import { ScrollArea } from 'components/ui/scroll-area';


const SummaryView = () => {
  const [summary, setSummary] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

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
      throw error; // Re-throw the error if you want the calling component to handle it
    }
  };


  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900 lg:overflow-hidden">
      <Header
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
        setVideoUrl={setVideoUrl}
        setSummary={setSummary}
        videoUrl={videoUrl} />

      <div className="flex flex-1 overflow-hidden">
        <div className=" lg:block hidden h-full overflow-y-auto">

          <HistorySidebar
            onSelectItem={handleVideoSelectFromHistory}
            onDeleteItem={handleDeleteVideo}
          />

        </div>

        <div className="flex-1 h-full">
          <div className="container mx-auto px-4 py-6 h-full">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 h-full">
              <div className="lg:col-span-4 flex flex-col h-full">
                <UploadSection
                  isProcessing={isProcessing}
                  setSummary={setSummary}
                  setIsProcessing={setIsProcessing}
                  videoUrl={videoUrl}
                  setVideoUrl={setVideoUrl}
                />
              </div>
              <div className="lg:col-span-8 flex flex-col h-full overflow-y-auto">

                <SummarySection
                  summary={summary || ""}
                  isProcessing={isProcessing}
                />

              </div>

            </div>
          </div>
        </div>
      </div>
    </div>



  )
}

export default SummaryView
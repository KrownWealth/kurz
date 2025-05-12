'use client'

import { toast } from 'sonner';
import { Header, HistorySidebar, SummarySection } from '../components/shared'
import React, { useState } from 'react'
import { VideoHistoryItem } from '../types/videoHistoryType';
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/ui/tabs';
import { File_Uploader } from 'components/shared/File_Uploader';
import { VideoInput } from 'components/shared/Video_Input';




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
    <>
      <Header
        isProcessing={isProcessing}
        setIsProcessing={setIsProcessing}
        setVideoUrl={setVideoUrl}
        setSummary={setSummary}
        videoUrl={videoUrl}
      />

      <section className="py-8 mb-12">
        <div className="flex flex-col items-center mb-8 px-4 lg:px-0">
          <h1 className="text-3xl md:text-4xl font-bold text-center mb-2">AI Learning Assistant</h1>
          <p className="text-muted-foreground text-center max-w-2xl">
            Upload your educational videos or PDF files and get AI-generated summaries to enhance your learning
            experience.
          </p>
        </div>


        <Tabs defaultValue="pdf" className="w-full max-w-6xl mx-auto px-4 lg:px-0">
          <TabsList className="grid w-full grid-cols-2 mb-12">
            <TabsTrigger value="pdf">PDF Document</TabsTrigger>
            <TabsTrigger value="video">Video URL</TabsTrigger>
          </TabsList>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TabsContent value="pdf" className="mb-8 mt-0">
                <File_Uploader
                  setIsProcessing={setIsProcessing}
                  isProcessing={isProcessing}
                  setSummary={setSummary}
                />

              </TabsContent>
              <TabsContent value="video" className="mb-8 mt-0">
                <VideoInput
                  isProcessing={isProcessing}
                  setIsProcessing={setIsProcessing}
                  setSummary={setSummary}
                  videoUrl={videoUrl}
                  setVideoUrl={setVideoUrl}
                />
              </TabsContent>

              <div>
                <SummarySection
                  summary={summary || ""}
                  isProcessing={isProcessing}
                />
              </div>
            </div>

            <div className="mt-6 lg:mt-0 lg:col-span-1">
              <HistorySidebar
                onSelectItem={handleVideoSelectFromHistory}
                onDeleteItem={handleDeleteVideo}
              />
            </div>
          </div>
        </Tabs>

      </section>

    </>



  )
}

export default SummaryView
'use client'

import { toast } from 'sonner';
import { Header, HistorySidebar, SummarySection } from '../components/shared'
import React, { useState, useEffect } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from 'components/ui/tabs';
import { File_Uploader } from 'components/shared/File_Uploader';
import { VideoInput } from 'components/shared/Video_Input';
import Pusher from 'pusher-js';
import type { Channel } from 'pusher-js';
import { VideoHistoryItem } from 'types/videoHistoryType';

const SummaryView = () => {
  const [summary, setSummary] = useState<string | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [pusherChannel, setPusherChannel] = useState<Channel | null>(null);
  const [historyItems, setHistoryItems] = useState<VideoHistoryItem[]>([]);


  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    return () => {
      pusher.disconnect();
    };
  }, []);


  useEffect(() => {
    return () => {
      if (pusherChannel) {
        pusherChannel.unbind_all();
        pusherChannel.pusher.unsubscribe(pusherChannel.name);
      }
    };
  }, [pusherChannel]);


  const handleItemSelect = async (item: VideoHistoryItem) => {
    const updatedItems = historyItems.map(i => ({
      ...i,
      active: i.id === item.id
    }));
    setHistoryItems(updatedItems);


    const channelId = `summary-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;

    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
      forceTLS: true
    });

    const channel = pusher.subscribe(channelId);
    setPusherChannel(channel);

    const statusHandler = (data: { status: string; message?: string }) => {
      toast.info(data.message || `Status: ${data.status}`);
    };

    const summaryHandler = (data: { summary: string }) => {
      setSummary(data.summary);
      setIsGenerating(false);
      toast.success("Summary generated!");
      cleanupPusher(channel, channelId);
    };

    const errorHandler = (data: { error: string }) => {
      toast.error(data.error);
      setIsGenerating(false);
      cleanupPusher(channel, channelId);
    };

    channel.bind('status', statusHandler);
    channel.bind('summary', summaryHandler);
    channel.bind('error', errorHandler);

    setIsGenerating(true);

    try {
      const response = await fetch('/api/summarize-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: item.videoUrl,
          channelId: channelId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start processing');
      }
    } catch (error) {
      console.error('Error starting summarization:', error);
      toast.error("Failed to start video processing");
      setIsGenerating(false);
      cleanupPusher(channel, channelId);
    }
  };


  const cleanupPusher = (channel: Channel, channelId: string) => {
    channel.unbind('status');
    channel.unbind('summary');
    channel.unbind('error');
    channel.pusher.unsubscribe(channelId);
  };

  return (
    <>
      <Header
        isGenerating={isGenerating}
        setIsGenerating={setIsGenerating}
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
        <div className="w-full max-w-6xl mx-auto px-4 lg:px-0">

          <div className="mb-4">
            <File_Uploader
              setIsGenerating={setIsGenerating}
              isGenerating={isGenerating}
              setSummary={setSummary}
            />
          </div>
          <div className='mb-2'><h4>Generated Summary</h4></div>
          <div>
            <SummarySection
              summary={summary || ""}
              isGenerating={isGenerating}
            />
          </div>
        </div>

        {/* <Tabs defaultValue="pdf" className="w-full max-w-6xl mx-auto px-4 lg:px-0">
          <TabsList className="grid w-full grid-cols-2 mb-12">
            <TabsTrigger value="pdf">PDF Document</TabsTrigger>
            <TabsTrigger value="video">Video URL</TabsTrigger>
          </TabsList>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <TabsContent value="pdf" className="mb-8 mt-0">
                <File_Uploader
                  setIsGenerating={setIsGenerating}
                  isGenerating={isGenerating}
                  setSummary={setSummary}
                />
              </TabsContent>
              <TabsContent value="video" className="mb-8 mt-0">
                <VideoInput
                  isGenerating={isGenerating}
                  setIsGenerating={setIsGenerating}
                  setSummary={setSummary}
                  videoUrl={videoUrl}
                  setVideoUrl={setVideoUrl}
                />
              </TabsContent>

              <div>
                <SummarySection
                  summary={summary || ""}
                  isGenerating={isGenerating}
                />
              </div>
            </div>

            <div className="mt-6 lg:mt-0 lg:col-span-1">
              <HistorySidebar
                historyItems={historyItems}
                setHistoryItems={setHistoryItems}
                setSummary={setSummary}
                onSelectItem={handleItemSelect}
              />
            </div>
          </div>
        </Tabs> */}
      </section>
    </>
  );
};

export default SummaryView;
'use client'

import { useState, useEffect } from "react";
import { Video, Clock, Trash2, Loader2, RefreshCcw } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { VideoHistoryItem } from "../../types/videoHistoryType";
import Image from "next/image";
import { Card } from "components/ui/card";
import Pusher from "pusher-js";
import type { Channel } from 'pusher-js';



export function HistorySidebar({
  onSelectItem,
  onRefresh,
  setSummary,
  setIsProcessing
}: {
  onSelectItem: (item: VideoHistoryItem) => void;
  onRefresh?: () => void;
  setSummary: (data: string) => void;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}) {


  const [searchQuery, setSearchQuery] = useState("");
  const [historyItems, setHistoryItems] = useState<VideoHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [pusherChannel, setPusherChannel] = useState<Channel | null>(null);


  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    return () => {
      pusher.disconnect();
    };
  }, []);



  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/upload-video');
        const data = await response.json();

        if (data.success) {
          setHistoryItems(
            data.videos.map((video: any) => {
              console.log("Fetched video:", video);
              return {
                ...video,
                active: false,
              };
            })
          );
        } else {
          toast.error("Failed to fetch video history");
        }
      } catch (error) {
        console.error("Error fetching videos:", error);
        toast.error("Error loading video history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchVideos();
  }, []);

  const filteredItems = historyItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  );


  const handleItemClick = async (item: VideoHistoryItem) => {
    const updatedItems = historyItems.map(i => ({
      ...i,
      active: i.id === item.id
    }));
    setHistoryItems(updatedItems);
    onSelectItem(item);


    const channelId = `summary-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Initialize Pusher and subscribe to channel
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_APP_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });
    const channel = pusher.subscribe(channelId);
    setPusherChannel(channel);

    // Set up event listeners
    channel.bind('status', (data: { status: string }) => {
      toast.info(`Status: ${data.status}`);
    });

    channel.bind('summary', (data: { summary: string }) => {
      setSummary(data.summary);
      setIsProcessing(false);
      toast.success("Summary generated!");
      cleanupPusher(channel, channelId);
    });

    channel.bind('error', (data: { error: string }) => {
      toast.error(data.error);
      setIsProcessing(false);
      cleanupPusher(channel, channelId);
    });

    // Start the summarization process
    setIsProcessing(true);
    try {
      const response = await fetch('/api/summarize-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl: item.videoUrl,
          channelId: channelId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to start summarization');
      }
    } catch (error) {
      toast.error("Failed to start summarization");
      setIsProcessing(false);
      cleanupPusher(channel, channelId);
    }
  };

  const cleanupPusher = (channel: Channel, channelId: string) => {
    channel.unbind_all();
    const pusher = channel.pusher;
    pusher.unsubscribe(channelId);
  };



  const handleDelete = async (item: VideoHistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(item.id);

    try {
      // Extract public ID properly - adjust based on your URL structure
      const url = new URL(item.videoUrl);
      const pathParts = url.pathname.split('/');
      const publicId = pathParts.slice(pathParts.indexOf('upload') + 1).join('/').replace(/\.[^/.]+$/, "");

      if (!publicId) {
        throw new Error('Could not extract public ID from video URL');
      }

      // Call the DELETE endpoint
      const response = await fetch(`/api/upload-video?id=${encodeURIComponent(publicId)}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete video');
      }

      // Update local state
      setHistoryItems(prev => prev.filter(i => i.id !== item.id));
      toast.success("Video deleted successfully");
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(error instanceof Error ? error.message : "Failed to delete video");
    } finally {
      setIsDeleting(null);
    }
  };


  const handleRefresh = async () => {
    if (onRefresh) {
      onRefresh();
    } else {
      try {
        setIsLoading(true);
        const response = await fetch('/api/upload-video');
        const data = await response.json();

        if (data.success) {
          setHistoryItems(data.videos.map((video: any) => ({
            ...video,
            active: false
          })));
          toast.success("Video history refreshed");
        }
      } catch (error) {
        toast.error("Error refreshing videos");
      } finally {
        setIsLoading(false);
      }
    }
  };


  return (
    <Card className={cn(
      "flex flex-col transition-all duration-300",
    )}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-200">
        <h2 className="font-semibold text-lg dark:text-white">Video History</h2>
        <div className="flex items-center gap-2">

          <Button
            variant="ghost"
            size="icon"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="p-2 mt-6">
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : filteredItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Video className="h-8 w-8 mx-auto mb-2" />
            <p>No video history found</p>
          </div>
        ) : (
          filteredItems.map((item) => (
            <button
              key={item.id}
              className={cn(
                "w-full text-left mb-2 rounded-md transition-colors group relative",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                item.active && "bg-gray-100 dark:bg-gray-800",
              )}
              onClick={() => handleItemClick(item)}
            >

              <div className="flex items-start gap-3 w-full">
                <div className="relative flex-shrink-0">
                  <Image
                    src={item.thumbnailUrl}
                    alt="Video thumbnail"
                    className="w-16 h-12 rounded object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/default-video-thumbnail.jpg';
                    }}
                    width={100}
                    height={100}
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Video className="h-5 w-5 text-white opacity-80" />
                  </div>
                </div>

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate dark:text-white text-left">
                    {item.title}
                  </p>
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{item.date}</span>
                  </div>
                  {item.summary && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 text-left">
                      {item.summary}
                    </p>
                  )}
                </div>

                <button

                  onClick={(e) => handleDelete(item, e)}
                  disabled={isDeleting === item.id}
                >
                  {isDeleting === item.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 text-red-600" />
                  )}
                </button>
              </div>

            </button>
          ))
        )}
      </div>

    </Card>
  );
}
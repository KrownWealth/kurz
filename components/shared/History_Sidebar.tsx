'use client'

import { useState, useEffect } from "react";
import { Video, Clock, Search, ChevronLeft, ChevronRight, Trash2, Loader2, RefreshCcw } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "../../lib/utils";
import { toast } from "sonner";
import { VideoHistoryItem } from "../../types/videoHistoryType";
import Image from "next/image";
import { Card } from "components/ui/card";

export function HistorySidebar({
  onSelectItem,
  onDeleteItem,
  onRefresh
}: {
  onSelectItem: (item: VideoHistoryItem) => void;
  onDeleteItem?: (item: VideoHistoryItem) => Promise<void>;
  onRefresh?: () => void;
}) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [historyItems, setHistoryItems] = useState<VideoHistoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/upload-video');
        const data = await response.json();

        if (data.success) {
          setHistoryItems(data.videos.map((video: any) => ({
            ...video,
            active: false
          })));
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

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleItemClick = (item: VideoHistoryItem) => {
    const updatedItems = historyItems.map(i => ({
      ...i,
      active: i.id === item.id
    }));
    setHistoryItems(updatedItems);
    onSelectItem(item);
  };

  const handleDelete = async (item: VideoHistoryItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDeleting(item.id);

    try {
      if (onDeleteItem) {
        await onDeleteItem(item);
      }
      setHistoryItems(prev => prev.filter(i => i.id !== item.id));
      toast.success("Video removed from history");
    } catch (error) {
      toast.error("Failed to delete video");
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
        const response = await fetch('/api/cloudinary');
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
      "flex flex-col bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300",
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
                isCollapsed ? "flex justify-center p-3" : "p-3",
              )}
              onClick={() => handleItemClick(item)}
            >
              {isCollapsed ? (
                <div className="flex items-center justify-center">
                  <Video className="h-5 w-5 text-purple-500" />
                </div>
              ) : (
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
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-400 hover:text-red-500"
                    onClick={(e) => handleDelete(item, e)}
                    disabled={isDeleting === item.id}
                  >
                    {isDeleting === item.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </button>
                </div>
              )}
            </button>
          ))
        )}
      </div>

    </Card>
  );
}
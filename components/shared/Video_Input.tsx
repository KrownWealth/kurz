"use client";

import { useState } from "react";
import { Loader2, FileUp, Video, X } from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Label } from "../ui/label";
import { Input } from "../ui/input";

export function VideoInput({
  setSummary,
  videoUrl,
  setVideoUrl,
  isProcessing,
  setIsProcessing
}: {
  setSummary: (summary: string) => void;
  isProcessing: boolean;
  videoUrl: string | null;
  setVideoUrl: (svideoUrl: string) => void;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>

}) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);

  const [url, setUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [activeTab, setActiveTab] = useState("url");

  const POLLING_INTERVAL = 30000;

  const validateUrl = (url: string) => {
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/;
    const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com)\/.+$/;

    if (!url) {
      return "Please enter a URL";
    }

    if (!youtubeRegex.test(url) && !vimeoRegex.test(url)) {
      return "Please enter a valid YouTube or Vimeo URL";
    }

    return "";
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    const validTypes = ["video/mp4", "video/mov", "video/avi"];
    const maxSize = 500 * 1024 * 1024; // 500MB

    if (!validTypes.includes(file.type)) {
      toast.error("Invalid file type");
      return;
    }

    if (file.size > maxSize) {
      toast.error("File too large (max 500MB)");
      return;
    }

    setFile(file);
    setVideoUrl("");
    toast.success("File ready for upload");
  };

  const handleUrlSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errorMsg = validateUrl(url);
    if (errorMsg) {
      setUrlError(errorMsg);
      return;
    }

    setUrlError("");
    setIsProcessing(true);

    try {
      const response = await fetch(`/api/summarize?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (data.success) {
        setSummary(data.summary);
        setVideoUrl(url); // Set the video URL for display
      } else {
        setTimeout(() => handleUrlSubmit(e), POLLING_INTERVAL);
      }
    } catch (error: any) {
      toast.error("Error summarizing URL video");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsProcessing(true);
    setProgress(0);

    try {
      const formData = new FormData();
      formData.append("video", file);

      const uploadResponse = await fetch("/api/upload-video", {
        method: "POST",
        body: formData,
      });

      if (!uploadResponse.ok) throw new Error("Upload failed");

      const { videoUrl } = await uploadResponse.json();
      setVideoUrl(videoUrl);
      setProgress(50);

      const summaryResponse = await fetch(
        `/api/summarize-video?url=${encodeURIComponent(videoUrl)}`
      );

      if (!summaryResponse.ok) throw new Error("Summarization failed");

      const { summary } = await summaryResponse.json();
      setSummary(summary);
      setProgress(100);
      toast.success("Summary generated!");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      <Tabs
        defaultValue="url"
        className="w-full"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="url">Video URL</TabsTrigger>
          <TabsTrigger value="upload">Upload Video</TabsTrigger>
        </TabsList>

        <TabsContent value="url">
          <form onSubmit={handleUrlSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="video-url">Video URL</Label>
              <Input
                id="video-url"
                placeholder="https://www.youtube.com/watch?v=..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={isProcessing}
              />
              {urlError && <p className="text-sm text-red-500">{urlError}</p>}
              <p className="text-xs text-gray-500">
                Supports YouTube and Vimeo videos
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!url || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Generate Summary"
              )}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="upload">
          <form onSubmit={handleUpload} className="space-y-4">
            {!file ? (
              <div
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer"
                onClick={() => document.getElementById("video-upload")?.click()}
              >
                <FileUp className="h-10 w-10 mx-auto" />
                <p className="mt-2">Click to upload or drag and drop</p>
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </div>
            ) : (
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    <span>{file.name}</span>
                  </div>
                  <button onClick={() => setFile(null)}>
                    <X className="h-4 w-4" />
                  </button>
                </div>
                {progress > 0 && (
                  <div className="mt-4">
                    <Progress value={progress} />
                    <p className="text-sm mt-1">
                      {isProcessing ? "Processing..." : "Uploading..."}
                    </p>
                  </div>
                )}
              </div>
            )}

            <Button
              type="submit"
              className="w-full"
              disabled={!file || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Generate Summary"
              )}
            </Button>
          </form>
        </TabsContent>
      </Tabs>

      {videoUrl && (
        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">
            {activeTab === "url" ? "Source Video" : "Uploaded Video"}
          </h3>
          <div className="rounded-lg overflow-hidden border">
            <video
              controls
              className="w-full max-h-[400px]"
              crossOrigin="anonymous"
              key={videoUrl}
            >
              <source src={videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}
    </div>
  );
}
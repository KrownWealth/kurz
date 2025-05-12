"use client";

import { useState } from "react";
import { Loader2, FileUp, Video, X } from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { getVideoId } from "../../lib/get_youtube_video_id";
import { Card } from "components/ui/card";


export function VideoInput({
  setSummary,
  videoUrl,
  setVideoUrl,
  isProcessing,
  setIsProcessing
}: {
  setSummary: (data: string) => void;
  isProcessing: boolean;
  videoUrl: string | null;
  setVideoUrl: (videoUrl: string) => void;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>

}) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [urlError, setUrlError] = useState("");
  const [fileSizeError, setFileSizeError] = useState("");
  const [activeTab, setActiveTab] = useState("url");




  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = async (file: File) => {
    const validTypes = ["video/mp4"];
    if (!validTypes.includes(file.type)) {
      setFileSizeError("Invalid file type. Supported formats: MP4")
      return false;
    }

    const maxSize = 25 * 1024 * 1024; // 25MB


    if (file.size > maxSize) {
      setFileSizeError("File too large (maximum 5MB allowed)")
      return false;
    }

    setFile(file);
    setVideoUrl("");
    toast.success("File ready for upload");
    return true;
  };


  const handleUrlSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate URL
    if (!videoUrl) {
      setUrlError("Please enter a YouTube URL");
      return;
    }

    setIsProcessing(true);
    setProgress(0);

    try {
      const res = await fetch("/api/youtube-video-download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      });

      const data = await res.json()
      console.log("Video Url Summary Data", data.summary);
      setSummary(data.summary);

      setProgress(100);
      toast.success("Video analysis complete!");

    } catch (error: any) {
      toast.error(error.message);
      console.error("Processing failed:", error);
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
    <Card className="space-y-8 p-4">
      <Tabs
        defaultValue="upload"
        className="w-full"
        onValueChange={(value) => setActiveTab(value)}
      >
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="upload">Upload Video</TabsTrigger>
          <TabsTrigger value="url">Video URL</TabsTrigger>
        </TabsList>


        <TabsContent value="upload">
          <form onSubmit={handleUpload} className="flex flex-col space-y-6 items-center">
            {!file ? (
              <button
                type="button"
                className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer w-full"
                onClick={() => document.getElementById("video-upload")?.click()}
              >
                <FileUp className="h-10 w-10 mx-auto" />
                <p className="mt-2">Click to upload video</p>
                <input
                  id="video-upload"
                  type="file"
                  accept="video/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </button>
            ) : (
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    <span className="text-sm">{file.name}</span>
                  </div>
                  <button type="button" onClick={() => setFile(null)}>
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

                {fileSizeError && <p className="text-xs text-red-500 pt-2">{fileSizeError}</p>}
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

        <TabsContent value="url">
          <form onSubmit={handleUrlSubmit} className="space-y-6">
            <div className="space-y-2">
              <Input
                id="video-url"
                placeholder={`https://www.youtube.com/watch?v=...`}
                value={videoUrl ?? ""}
                onChange={(e) => setVideoUrl(e.target.value)}
                disabled={isProcessing}
              />
              {urlError && <p className="text-sm text-red-500">{urlError}</p>}
              <p className="text-xs text-gray-500">
                Supports only youTube video
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!videoUrl || isProcessing}
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
            {activeTab === "url" ? (
              // Embedded player for URL videos
              <iframe
                src={`https://www.youtube.com/embed/${getVideoId(videoUrl)}`}
                className="w-full aspect-video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              // Native player for uploaded videos
              <video
                controls
                className="w-full max-h-[400px]"
                crossOrigin="anonymous"
                key={videoUrl}
              >
                <source src={videoUrl} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
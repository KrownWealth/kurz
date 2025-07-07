"use client";

import React, { useState, useEffect } from "react";
import { Loader2, FileUp, Video, X } from "lucide-react";
import { Button } from "../ui/button";
import { Progress } from "../ui/progress";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import { getVideoId } from "../../lib/get_youtube_video_id";
import { Card } from "components/ui/card";


export function VideoInput({
  setSummary,
  videoUrl,
  setVideoUrl,
  isGenerating,
  setIsGenerating,
}: {
  setSummary: (data: string) => void;
  isGenerating: boolean;
  videoUrl: string | null;
  setVideoUrl: (videoUrl: string) => void;
  setIsGenerating: React.Dispatch<React.SetStateAction<boolean>>

}) {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [urlError, setUrlError] = useState("");
  const [fileSizeError, setFileSizeError] = useState("");
  const [activeTab, setActiveTab] = useState("url");
  const [uploadedVid, setUploadedVid] = useState<string | null>(null)
  const [isUploaded, setIsUploaded] = useState(false);
  const [isUploading, setIsUploading] = useState(false);


  useEffect(() => {
    if (!isUploading && !isGenerating && progress === 100) {
      const timeout = setTimeout(() => setProgress(0), 2000); // reset after 2s
      return () => clearTimeout(timeout);
    }
  }, [isUploading, isGenerating, progress]);



  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      validateAndSetFile(file);
    }
    if (file && file.type.startsWith('video/')) {
      setFile(file)
      const url = URL.createObjectURL(file)
      setUploadedVid(url)
    }
  };

  const validateAndSetFile = async (file: File) => {
    const validTypes = ["video/mp4"];
    if (!validTypes.includes(file.type)) {
      setFileSizeError("Invalid file type. Supported formats: MP4")
      return false;
    }

    const maxSize = 15 * 1024 * 1024; // 15MB


    if (file.size > maxSize) {
      setFileSizeError("File too large (maximum 15MB allowed)");
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

    setIsGenerating(true);
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
      setIsGenerating(false);
    }
  };


  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsUploading(true);
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
      setIsUploaded(true);
      toast.success("Upload successful! Ready to generate summary.");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!videoUrl) return;

    setIsGenerating(true);
    setProgress(50);

    try {
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
      setIsGenerating(false);
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
          <form onSubmit={handleFileUpload} className="flex flex-col space-y-6 items-center">
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
                  accept="video/mp4"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </button>
            ) : (
              <div className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 max-w-[200px]">
                    <Video className="h-5 w-5" />
                    <span className="text-sm truncate max-w-[150px] block">{file.name}</span>
                  </div>
                  <button type="button" onClick={() => setFile(null)}>
                    <X className="h-4 w-4" />
                  </button>
                </div>

                {progress < 100 && (
                  <div className="mt-4">
                    <p className="text-xs text-gray-500">
                      {progress === 0
                        ? "Upload your video to get started"
                        : "Uploaded successful click generate summary"}
                    </p>
                  </div>
                )}

                {fileSizeError && <p className="text-xs text-red-500 pt-2">{fileSizeError}</p>}
              </div>
            )}
            {!videoUrl ? (
              <Button
                type="submit"
                disabled={!file || isGenerating}
                className="w-full"
              >
                {isUploading ? "Uploading..." : "Upload File"}
              </Button>
            ) : (
              <Button
                type="button"
                onClick={handleGenerateSummary}
                disabled={isGenerating}
                className="w-full"
                variant="secondary"
              >
                {isGenerating ? "Processing..." : "Generate Summary"}
              </Button>
            )}


            {/* <Button
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
            </Button> */}
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
                disabled={isGenerating}
              />
              {urlError && <p className="text-sm text-red-500">{urlError}</p>}
              <p className="text-xs text-gray-500">
                Supports only youTube video
              </p>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={!videoUrl || isGenerating}
            >
              {isGenerating ? (
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
            ) : uploadedVid ? (
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
            ) : null}
          </div>
        </div>
      )}

    </Card>
  );
}
"use client"

import type React from "react"

import { useState } from "react"
import { Loader2, FileUp, Video, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"

interface VideoInputProps {
  onProcessingStart: () => void
  onProcessingComplete: () => void
  isProcessing: boolean
}

export function VideoInput({ onProcessingStart, onProcessingComplete, isProcessing }: VideoInputProps) {
  // URL input state
  const [url, setUrl] = useState("")
  const [urlError, setUrlError] = useState("")
  const [processingUrl, setProcessingUrl] = useState(false)

  // File upload state
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [uploading, setUploading] = useState(false)

  // URL validation and submission
  const validateUrl = (url: string) => {
    // Basic URL validation - in a real app, you'd want more robust validation
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+$/
    const vimeoRegex = /^(https?:\/\/)?(www\.)?(vimeo\.com)\/.+$/

    if (!url) {
      return "Please enter a URL"
    }

    if (!youtubeRegex.test(url) && !vimeoRegex.test(url)) {
      return "Please enter a valid YouTube or Vimeo URL"
    }

    return ""
  }

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const validationError = validateUrl(url)
    if (validationError) {
      setUrlError(validationError)
      toast.error("Invalid URL", {
        description: validationError,
      })
      return
    }

    setUrlError("")
    setProcessingUrl(true)
    onProcessingStart()

    toast.loading("Processing video", {
      description: "Our AI is analyzing the video content...",
    })

    // Simulate API call
    setTimeout(() => {
      setProcessingUrl(false)
      toast.success("Summary generated", {
        description: "Your video has been successfully summarized.",
      })
      onProcessingComplete()
    }, 3000)
  }

  // File upload handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]

      // Check file type
      const validTypes = ["video/mp4", "video/mov", "video/avi", "video/quicktime"]
      if (!validTypes.includes(selectedFile.type)) {
        toast.error("Invalid file type", {
          description: "Please upload an MP4, MOV, or AVI video file.",
        })
        return
      }

      // Check file size (500MB limit)
      if (selectedFile.size > 500 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Please upload a file smaller than 500MB.",
        })
        return
      }

      setFile(selectedFile)
      toast.info("File selected", {
        description: `${selectedFile.name} is ready to upload.`,
      })
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0]

      // Check file type
      const validTypes = ["video/mp4", "video/mov", "video/avi", "video/quicktime"]
      if (!validTypes.includes(droppedFile.type)) {
        toast.error("Invalid file type", {
          description: "Please upload an MP4, MOV, or AVI video file.",
        })
        return
      }

      // Check file size (500MB limit)
      if (droppedFile.size > 500 * 1024 * 1024) {
        toast.error("File too large", {
          description: "Please upload a file smaller than 500MB.",
        })
        return
      }

      setFile(droppedFile)
      toast.info("File selected", {
        description: `${droppedFile.name} is ready to upload.`,
      })
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const removeFile = () => {
    setFile(null)
    setProgress(0)
    toast.info("File removed", {
      description: "The selected video has been removed.",
    })
  }

  const uploadFile = async () => {
    if (!file) return

    setUploading(true)
    onProcessingStart()

    toast.info("Upload started", {
      description: `Uploading ${file.name}...`,
    })

    // Simulate file upload progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 95) {
          clearInterval(interval)
          return 95
        }
        return prev + 5
      })
    }, 300)

    // Simulate API call
    setTimeout(() => {
      clearInterval(interval)
      setProgress(100)
      setUploading(false)
      toast.success("Upload complete", {
        description: "Your video has been uploaded successfully.",
      })
      onProcessingComplete()
    }, 3000)

    // Simulate processing
    const processVideo = () => {
      toast.loading("Processing video", {
        description: "Our AI is analyzing your video content...",
      })

      // Simulate processing completion
      setTimeout(() => {
        toast.success("Summary generated", {
          description: "Your video has been successfully summarized.",
        })
        onProcessingComplete()
      }, 3000)
    }
    processVideo()
  }

  return (
    <Tabs defaultValue="url" className="w-full">
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
              disabled={processingUrl || isProcessing}
            />
            {urlError && <p className="text-sm text-red-500">{urlError}</p>}
            <p className="text-xs text-gray-500">
              Supports YouTube and Vimeo videos. For best results, use educational content.
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={!url || processingUrl || isProcessing}>
            {processingUrl || isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {processingUrl ? "Processing..." : "Generating Summary..."}
              </>
            ) : (
              "Generate Summary"
            )}
          </Button>
        </form>
      </TabsContent>

      <TabsContent value="upload">
        <div className="space-y-4">
          {!file ? (
            <div
              className="border-2 border-dashed rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => document.getElementById("video-upload")?.click()}
            >
              <FileUp className="h-10 w-10 mx-auto text-gray-400" />
              <h3 className="mt-4 text-lg font-semibold">Upload Video File</h3>
              <p className="mt-2 text-sm text-gray-500">Drag and drop your file here, or click to browse</p>
              <p className="mt-1 text-xs text-gray-400">Supports MP4, MOV, and AVI files up to 500MB</p>
              <input
                id="video-upload"
                type="file"
                accept="video/mp4,video/mov,video/avi,video/quicktime"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          ) : (
            <div className="border rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-primary/10 rounded">
                    <Video className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium truncate max-w-[200px]">{file.name}</p>
                    <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={removeFile} disabled={uploading || isProcessing}>
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>

              {(uploading || progress > 0) && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span>Uploading...</span>
                    <span>{progress}%</span>
                  </div>
                  <Progress value={progress} />
                </div>
              )}

              {isProcessing && progress === 100 && (
                <div className="mt-4 flex items-center space-x-2 text-sm text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing with AI...</span>
                </div>
              )}
            </div>
          )}

          <Button className="w-full" disabled={!file || uploading || isProcessing} onClick={uploadFile}>
            {uploading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Uploading...
              </>
            ) : isProcessing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Upload and Summarize"
            )}
          </Button>
        </div>
      </TabsContent>
    </Tabs>
  )
}

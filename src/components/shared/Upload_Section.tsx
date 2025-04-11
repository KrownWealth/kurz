"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { VideoInput } from "./Video_Input"
import { File_Uploader } from "./File_Uploader"


export function UploadSection({
  isProcessing,
  setSummary,
  setIsProcessing
}: {
  isProcessing: boolean;
  setSummary: React.Dispatch<React.SetStateAction<string | null>>;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}) {


  const handleFileUploadComplete = () => {
    setIsProcessing(false)
    // In a real app, this would trigger the summary display
  }

  const handleVideoProcessingComplete = () => {
    setIsProcessing(false)
    // In a real app, this would trigger the summary display
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Upload Content</CardTitle>
        <CardDescription>Upload a PDF file or provide a video URL to generate an AI summary</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pdf" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="pdf">PDF Document</TabsTrigger>
            <TabsTrigger value="video">Video URL</TabsTrigger>
          </TabsList>
          <TabsContent value="pdf" className="mt-6">
            <File_Uploader
              setIsProcessing={setIsProcessing}
              isProcessing={isProcessing}
              setSummary={setSummary}
            />

          </TabsContent>
          <TabsContent value="video" className="mt-6">
            <VideoInput
              onProcessingStart={() => setIsProcessing(true)}
              onProcessingComplete={handleVideoProcessingComplete}
              isProcessing={isProcessing}
            />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}

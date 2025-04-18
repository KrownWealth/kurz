"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { Button } from "../ui/button"
import { Download, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { ScrollArea } from "../ui/scroll-area"
import ReactMarkdown from 'react-markdown';

interface SummaryProps {
  summary: string | null;
  isProcessing: boolean;
}

export function SummarySection({ summary, isProcessing }: SummaryProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      if (!summary) return
      await navigator.clipboard.writeText(summary)
      setCopied(true)
      toast.success("Copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      toast.error("Failed to copy")
    }
  }

  const handleDownload = () => {
    if (!summary) return

    const blob = new Blob([summary], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'summary.txt'
    a.click()
    URL.revokeObjectURL(url)

    toast.success("Download started")
  }

  if (!summary) {
    return (
      <Card className="h-full flex flex-col">
        <CardHeader>
          <CardTitle>No Summary Available</CardTitle>
          <CardDescription>Upload a document to generate a summary</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Document Summary</CardTitle>
            <CardDescription>Generated from your PDF</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="h-4 w-4 mr-2" />
              Download
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-auto">
        <Tabs defaultValue="main-points" className="w-full h-full flex flex-col">
          <TabsList className="grid w-full grid-cols-3 flex-shrink-0">
            <TabsTrigger value="main-points">Main Points</TabsTrigger>
            <TabsTrigger value="full-summary">Full Summary</TabsTrigger>
            <TabsTrigger value="key-terms">Key Terms</TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden mt-6">
            <TabsContent value="main-points" className="h-full data-[state=active]:flex flex-col">
              <ScrollArea className="h-full">
                {isProcessing ? (
                  <div>
                    Summarizing...
                  </div>
                ) : (
                  <div className="prose dark:prose-invert whitespace-pre-wrap">
                    <ReactMarkdown>{summary}</ReactMarkdown>
                  </div>
                )}

              </ScrollArea>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}

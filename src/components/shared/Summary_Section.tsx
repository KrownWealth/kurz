"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Download, Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { ScrollArea } from "@/components/ui/scroll-area"

interface SummaryProps {
  summary: string | null
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
        <ScrollArea className="h-full">
          {isProcessing ? (
            <div>
              Summarizing...
            </div>
          ) : (
            <div className="prose dark:prose-invert whitespace-pre-wrap">
              {summary}
            </div>
          )}

        </ScrollArea>
      </CardContent>
    </Card>
  )
}

"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { Download, Copy, Check } from "lucide-react"
import { toast } from "sonner"

import ReactMarkdown from 'react-markdown';
import { ScrollArea } from "components/ui/scroll-area"

interface SummaryProps {
  summary: string;
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

  if (!summary && !isProcessing) {
    return (
      <Card className="h-full flex flex-col max-h-screen">
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
        <div className="flex justify-center lg:justify-between lg:items-center items-start">
          <div>
            <CardTitle className="text-sm lg:text-lg">Document Summary</CardTitle>
            <CardDescription className="hidden text-sm">Generated from your file</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCopy}>
              {copied ? (
                <>
                  <Check className="lg:h-4 lg:w-4 mr-2 w-2 h-2" />
                  <span className="text-xs"> Copied</span>
                </>
              ) : (
                <>
                  <Copy className="lg:h-4 lg:w-4 h-2 w-2 mr-2" />
                  <span className="text-xs"> Copy</span>
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="lg:h-4 lg:w-4 h-2 w-2 mr-2" />
              <span className="text-xs"> Download</span>
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 overflow-auto">
        {isProcessing ? (
          <div>
            Summarizing please wait...
          </div>
        ) : (
          <div className="prose dark:prose-invert whitespace-pre-wrap overflow-y-auto">
            {summary && (
              <ReactMarkdown>{summary}</ReactMarkdown>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

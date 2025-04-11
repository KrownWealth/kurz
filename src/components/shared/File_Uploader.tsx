'use client'

import { useState } from 'react'
import { FileUp, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import * as pdfjsLib from 'pdfjs-dist'
import { SummaryData } from '../../../types/summaryType'


pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();


type PDFTextItem = {
  str: string
  dir?: string
  transform?: number[]
  width?: number
  height?: number
  hasEOL?: boolean
}

export function File_Uploader({
  isProcessing,
  setSummary,
  setIsProcessing
}: {
  isProcessing: boolean;
  setSummary: React.Dispatch<React.SetStateAction<string | null>>;
  setIsProcessing: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  const [file, setFile] = useState<File | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0]
      setFile(selectedFile)
    }
  }

  const handleSummarize = async () => {
    if (!file) return

    setIsProcessing(true)

    try {
      const reader = new FileReader()
      reader.onload = async (event: ProgressEvent<FileReader>) => {
        const result = event.target?.result
        if (!result) return

        const typedArray = new Uint8Array(result as ArrayBuffer)
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise
        const page = await pdf.getPage(1)
        const content = await page.getTextContent()

        const text = content.items
          .filter((item: any): item is PDFTextItem => 'str' in item)
          .map((item: any) => item.str)
          .join(' ')

        await sendToApi(text)
      }

      reader.readAsArrayBuffer(file)
    } catch (err) {
      console.error('❌ Summary Error:', err)
    } finally {
      setIsProcessing(false)
    }
  }


  const sendToApi = async (text: string) => {
    try {
      const res = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      })

      if (!res.ok) throw new Error(`API Error: ${res.status}`)

      const data: SummaryData = await res.json()
      setSummary(data.summary)
      console.log('✅ Summary API Response:', data)
    } catch (error) {
      console.error('❌ Failed to send to API:', error)
    }
  }

  return (
    <div className="space-y-4">
      {!file ? (
        <label className="block border-2 border-dashed rounded-lg p-8 text-center hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors cursor-pointer">
          <FileUp className="h-10 w-10 mx-auto text-gray-400" />
          <h3 className="mt-4 text-lg font-semibold">Upload PDF File</h3>
          <p className="mt-2 text-sm text-gray-500">Drag and drop your file here, or click to browse</p>
          <p className="mt-1 text-xs text-gray-400">Supports PDF files up to 50MB</p>
          <input
            id="file"
            type="file"
            accept=".pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </label>
      ) : (
        <div className="text-center text-sm font-medium text-green-600">
          ✅ File selected:{" "}
          <span className="inline-block max-w-full truncate align-middle" title={file.name}>
            {file.name}
          </span>
        </div>

      )}

      <Button
        className="w-full"
        disabled={!file || isProcessing}
        onClick={handleSummarize}
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Summarizing...
          </>
        ) : (
          "Summarize"
        )}
      </Button>

    </div>
  )
}

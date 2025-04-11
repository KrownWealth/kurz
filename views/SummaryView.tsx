'use client'

import { HistorySidebar, SummarySection, UploadSection } from '@/components/shared'
import React, { useState } from 'react'
import { SummaryData } from '../types/summaryType';


const SummaryView = () => {
  const [summary, setSummary] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);


  return (
    <div className="flex flex-1 overflow-hidden">
      <HistorySidebar />
      <main className="flex-1 overflow-y-auto">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <UploadSection
                isProcessing={isProcessing}
                setSummary={setSummary}
                setIsProcessing={setIsProcessing}
              />
            </div>
            <div className="lg:col-span-8">
              <SummarySection summary={summary}
                isProcessing={isProcessing} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default SummaryView
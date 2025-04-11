'use client'

import { useState, useEffect } from "react"
import { FileText, Video, Clock, Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type HistoryItem = {
  id: string
  title: string
  type: 'pdf' | 'video'
  date: string
  active: boolean
}

export function HistorySidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([])

  useEffect(() => {
    const stored = localStorage.getItem('pdf-summary-history')
    if (stored) {
      setHistoryItems(JSON.parse(stored))
    }
  }, [])

  const filteredItems = historyItems.filter((item) =>
    item.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <div className={cn(
      "bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 h-full transition-all duration-300 flex flex-col",
      isCollapsed ? "w-16" : "w-72",
    )}>
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
        {!isCollapsed && <h2 className="font-semibold text-lg text-black">History</h2>}
        <Button variant="ghost" size="icon" onClick={toggleSidebar}
          className={cn("ml-auto border", isCollapsed && "mx-auto border")}>
          {isCollapsed ? <ChevronRight className="h-4 w-4 text-black" /> : <ChevronLeft className="h-4 w-4 text-black " />}
        </Button>
      </div>

      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search history..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}

      <ScrollArea className="flex-1">
        <div className="p-2">
          {filteredItems.map((item) => (
            <button
              key={item.id}
              className={cn(
                "w-full text-left mb-2 p-2 rounded-md transition-colors",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                item.active && "bg-gray-100 dark:bg-gray-800",
                isCollapsed ? "flex justify-center" : "flex items-start",
              )}
            >
              {isCollapsed ? (
                <div className="flex items-center justify-center">
                  <FileText className="h-5 w-5 text-blue-500" />
                </div>
              ) : (
                <>
                  <div className="mr-3 mt-0.5">
                    <FileText className="h-5 w-5 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate text-black">{item.title}</p>
                    <div className="flex items-center text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{item.date}</span>
                    </div>
                  </div>
                </>
              )}
            </button>
          ))}
        </div>
      </ScrollArea>
    </div>
  )
}

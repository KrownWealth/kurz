import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '../components/shared/Theme_Provider'
import { Toaster } from '@/components/ui/sonner'



const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'Kurz | AI-powered summarization tool for videos and PDFs',
    template: '%s | Kurz AI'
  },
  description: 'AI-powered summarization tool for videos and PDFs',
  keywords: ['AI summarizer', 'video summary', 'PDF summary', 'EdTech'],
}


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

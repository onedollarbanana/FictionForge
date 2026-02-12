import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { ToastProvider } from '@/components/ui/toast'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const inter = Inter({ subsets: ['latin'] })

// Force ALL routes to be dynamically rendered (no static generation)
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'FictionForge - Where Stories Come Alive',
  description: 'A modern platform for web fiction authors and readers. Write, read, and share web fiction with powerful tools for LitRPG, fantasy, and more.',
  keywords: ['web fiction', 'webnovel', 'litrpg', 'fantasy', 'writing', 'reading', 'stories'],
  authors: [{ name: 'FictionForge' }],
  openGraph: {
    title: 'FictionForge - Where Stories Come Alive',
    description: 'A modern platform for web fiction authors and readers',
    type: 'website',
    siteName: 'FictionForge',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'FictionForge - Where Stories Come Alive',
    description: 'A modern platform for web fiction authors and readers',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <ToastProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-1">
                {children}
              </main>
              <Footer />
            </div>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}

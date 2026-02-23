'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Download, Loader2 } from 'lucide-react'
import { showToast } from '@/components/ui/toast'

interface ExportEpubButtonProps {
  storyId: string
  storyTitle: string
}

export function ExportEpubButton({ storyId, storyTitle }: ExportEpubButtonProps) {
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/export/epub?storyId=${storyId}`)
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Export failed' }))
        throw new Error(error.error || 'Export failed')
      }

      // Create download from blob
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      // Sanitize filename
      const filename = storyTitle
        .replace(/[^a-zA-Z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .toLowerCase()
      a.download = `${filename}.epub`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      showToast('EPUB downloaded successfully!', 'success')
    } catch (err) {
      console.error('EPUB export error:', err)
      showToast(err instanceof Error ? err.message : 'Failed to export EPUB', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" onClick={handleExport} disabled={loading}>
      {loading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Download className="h-4 w-4 mr-2" />
      )}
      {loading ? 'Generating...' : 'Download EPUB'}
    </Button>
  )
}

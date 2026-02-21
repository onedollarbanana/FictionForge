'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Search, X } from 'lucide-react'
import { type Guide } from '@/lib/guides-data'

export function GuideSearch({ guides }: { guides: Guide[] }) {
  const [query, setQuery] = useState('')

  const filtered = query.length > 1
    ? guides.filter(
        (g) =>
          g.title.toLowerCase().includes(query.toLowerCase()) ||
          g.description.toLowerCase().includes(query.toLowerCase())
      )
    : []

  return (
    <div className="relative w-full max-w-xl mx-auto mb-12">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
        <input
          type="text"
          placeholder="Search all guides..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-10 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>
      {filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-10 max-h-80 overflow-y-auto">
          {filtered.map((guide) => (
            <Link
              key={`${guide.category}-${guide.slug}`}
              href={`/guides/${guide.category}/${guide.slug}`}
              className="block px-4 py-3 hover:bg-muted/50 border-b border-border last:border-b-0 transition-colors"
              onClick={() => setQuery('')}
            >
              <p className="font-medium text-foreground">{guide.title}</p>
              <p className="text-sm text-muted-foreground line-clamp-1">{guide.description}</p>
            </Link>
          ))}
        </div>
      )}
      {query.length > 1 && filtered.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-card border border-border rounded-lg shadow-lg z-10 px-4 py-6 text-center text-muted-foreground">
          No guides found for &ldquo;{query}&rdquo;
        </div>
      )}
    </div>
  )
}

"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

const platforms = [
  {
    name: "Royal Road",
    guide:
      'If you have Author Premium, go to My Fiction \u2192 [Story] \u2192 Export EPUB. Upload the .epub file in the EPUB tab. If you don\'t have Author Premium, use the Paste tab \u2014 open each chapter, copy the content, and paste with ---CHAPTER--- separators between them.',
  },
  {
    name: "AO3 (Archive of Our Own)",
    guide:
      "Open your work, click the 'Download' button at the top, choose EPUB. Upload the .epub file in the EPUB tab.",
  },
  {
    name: "Wattpad",
    guide:
      "Wattpad doesn't offer an export feature. Open each chapter in your story, select all text (Ctrl+A), copy it, and paste into the Paste tab. Use ---CHAPTER--- between chapters. Tip: You can copy multiple chapters at once if you open the 'Preview' mode.",
  },
  {
    name: "Scribble Hub",
    guide:
      "Scribble Hub doesn't offer an export feature. Open each chapter, copy the content, and paste into the Paste tab with ---CHAPTER--- separators between chapters.",
  },
  {
    name: "Google Docs / Word",
    guide:
      "Go to File \u2192 Download \u2192 Microsoft Word (.docx). Upload the .docx file in the DOCX tab. Tip: Use Heading 1 or Heading 2 styles for chapter titles \u2014 we'll auto-detect them as chapter boundaries.",
  },
  {
    name: "Other",
    guide:
      "Export your work as .epub or .docx if possible, or copy-paste chapters using the Paste tab.",
  },
]

export function PlatformGuides() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <div className="mb-6 border rounded-lg bg-card">
      <button
        type="button"
        className="w-full flex items-center gap-2 p-4 text-left font-semibold"
        onClick={() => setOpenIndex(openIndex === -1 ? null : -1)}
      >
        <ChevronDown className={`w-4 h-4 transition-transform ${openIndex === -1 ? '' : '-rotate-90'}`} />
        Platform Migration Guides
      </button>
      {openIndex === -1 && (
        <div className="px-4 pb-4 space-y-1">
          {platforms.map((platform, i) => (
            <div key={platform.name} className="border rounded">
              <button
                type="button"
                className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm font-medium hover:bg-muted/50"
                onClick={() => setOpenIndex(openIndex === i ? -1 : i)}
              >
                {openIndex === i ? (
                  <ChevronDown className="w-3 h-3 shrink-0" />
                ) : (
                  <ChevronRight className="w-3 h-3 shrink-0" />
                )}
                {platform.name}
              </button>
              {openIndex === i && (
                <p className="px-3 pb-3 text-sm text-muted-foreground leading-relaxed">
                  {platform.guide}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export interface ParsedChapter {
  title: string
  html: string
}

function textToHtml(text: string): string {
  const paragraphs = text.split(/\n\s*\n/).filter(p => p.trim())
  return paragraphs.map(p => `<p>${p.trim().replace(/\n/g, '<br />')}</p>`).join('\n')
}

export function parsePastedText(text: string): ParsedChapter[] {
  // 1. Split on ---CHAPTER--- markers
  if (/---CHAPTER---/i.test(text)) {
    const parts = text.split(/---CHAPTER---/i).map(p => p.trim()).filter(Boolean)
    return parts.map((part, i) => {
      const lines = part.split('\n').filter(l => l.trim())
      const title = lines[0]?.trim() || `Chapter ${i + 1}`
      const content = lines.slice(1).join('\n').trim()
      return {
        title,
        html: textToHtml(content || title),
      }
    })
  }

  // 2. Check for "Chapter X" patterns
  const chapterPattern = /^(chapter\s+\d+[^\n]*)/gim
  const chapterMatches = Array.from(text.matchAll(chapterPattern))

  if (chapterMatches.length >= 2) {
    const chapters: ParsedChapter[] = []
    for (let i = 0; i < chapterMatches.length; i++) {
      const startIdx = chapterMatches[i].index!
      const endIdx = i + 1 < chapterMatches.length ? chapterMatches[i + 1].index! : text.length
      const chunk = text.slice(startIdx, endIdx).trim()
      const lines = chunk.split('\n')
      const title = lines[0].trim()
      const content = lines.slice(1).join('\n').trim()
      chapters.push({
        title,
        html: textToHtml(content || title),
      })
    }
    return chapters
  }

  // 3. Single chapter fallback
  return [{
    title: 'Chapter 1',
    html: textToHtml(text.trim()),
  }]
}

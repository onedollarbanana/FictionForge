import mammoth from 'mammoth'

export interface ParsedChapter {
  title: string
  html: string
}

export async function parseDocx(file: File): Promise<ParsedChapter[]> {
  const arrayBuffer = await file.arrayBuffer()
  const result = await mammoth.convertToHtml({ arrayBuffer })
  const fullHtml = result.value

  // Check for explicit ---CHAPTER--- markers first
  if (fullHtml.includes('---CHAPTER---')) {
    const parts = fullHtml.split(/---CHAPTER---/i).map(p => p.trim()).filter(Boolean)
    return parts.map((part, i) => {
      const headingMatch = part.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/i)
      const title = headingMatch
        ? headingMatch[1].replace(/<[^>]+>/g, '').trim()
        : `Chapter ${i + 1}`
      return { title, html: part }
    })
  }

  // Split on H1/H2 headings
  const headingRegex = /<h[12][^>]*>[\s\S]*?<\/h[12]>/gi
  const headings = Array.from(fullHtml.matchAll(headingRegex))

  if (headings.length === 0) {
    // No headings found — return as single chapter
    return [{
      title: 'Chapter 1',
      html: fullHtml,
    }]
  }

  const chapters: ParsedChapter[] = []

  for (let i = 0; i < headings.length; i++) {
    const headingMatch = headings[i]
    const startIdx = headingMatch.index!
    const endIdx = i + 1 < headings.length ? headings[i + 1].index! : fullHtml.length
    const chapterHtml = fullHtml.slice(startIdx, endIdx).trim()

    const titleText = headingMatch[0].replace(/<[^>]+>/g, '').trim()

    chapters.push({
      title: titleText || `Chapter ${i + 1}`,
      html: chapterHtml,
    })
  }

  // If there's content before the first heading, include it as a preface
  if (headings[0].index! > 0) {
    const prefaceHtml = fullHtml.slice(0, headings[0].index!).trim()
    if (prefaceHtml.replace(/<[^>]+>/g, '').trim().length > 20) {
      chapters.unshift({
        title: 'Preface',
        html: prefaceHtml,
      })
    }
  }

  return chapters
}

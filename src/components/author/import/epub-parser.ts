import JSZip from 'jszip'

export interface ParsedChapter {
  title: string
  html: string
}

function extractBodyContent(xhtml: string): string {
  const bodyMatch = xhtml.match(/<body[^>]*>([\s\S]*?)<\/body>/i)
  return bodyMatch ? bodyMatch[1].trim() : xhtml
}

function extractTitle(xhtml: string, filename: string): string {
  // Try <title> tag
  const titleMatch = xhtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (titleMatch && titleMatch[1].trim()) {
    return titleMatch[1].trim()
  }
  // Try first h1 or h2
  const headingMatch = xhtml.match(/<h[12][^>]*>([\s\S]*?)<\/h[12]>/i)
  if (headingMatch && headingMatch[1].trim()) {
    // Strip inner tags
    return headingMatch[1].replace(/<[^>]+>/g, '').trim()
  }
  // Fallback to filename
  return filename.replace(/\.[^.]+$/, '').replace(/[-_]/g, ' ')
}

function resolveRelativePath(basePath: string, relativePath: string): string {
  if (relativePath.startsWith('/')) return relativePath.slice(1)
  const baseDir = basePath.substring(0, basePath.lastIndexOf('/') + 1)
  const combined = baseDir + relativePath
  // Resolve ../ segments
  const parts = combined.split('/')
  const resolved: string[] = []
  for (const part of parts) {
    if (part === '..') {
      resolved.pop()
    } else if (part !== '.') {
      resolved.push(part)
    }
  }
  return resolved.join('/')
}

export async function parseEpub(file: File): Promise<ParsedChapter[]> {
  const arrayBuffer = await file.arrayBuffer()
  const zip = await JSZip.loadAsync(arrayBuffer)

  // 1. Read container.xml to find OPF path
  const containerXml = await zip.file('META-INF/container.xml')?.async('text')
  if (!containerXml) {
    throw new Error('Invalid EPUB: missing META-INF/container.xml')
  }

  const opfPathMatch = containerXml.match(/full-path="([^"]+)"/i)
  if (!opfPathMatch) {
    throw new Error('Invalid EPUB: cannot find OPF path in container.xml')
  }
  const opfPath = opfPathMatch[1]

  // 2. Read and parse OPF
  const opfContent = await zip.file(opfPath)?.async('text')
  if (!opfContent) {
    throw new Error(`Invalid EPUB: OPF file not found at ${opfPath}`)
  }

  // Parse manifest items
  const manifest = new Map<string, string>()
  const itemRegex = /<item\s[^>]*?id="([^"]+)"[^>]*?href="([^"]+)"[^>]*?(?:media-type="([^"]+)")?[^>]*?\/?>/gi
  let match: RegExpExecArray | null
  while ((match = itemRegex.exec(opfContent)) !== null) {
    manifest.set(match[1], match[2])
  }

  // Also handle reversed attribute order (href before id)
  const itemRegex2 = /<item\s[^>]*?href="([^"]+)"[^>]*?id="([^"]+)"[^>]*?\/?>/gi
  while ((match = itemRegex2.exec(opfContent)) !== null) {
    if (!manifest.has(match[2])) {
      manifest.set(match[2], match[1])
    }
  }

  // Parse spine (reading order)
  const spineMatch = opfContent.match(/<spine[^>]*>([\s\S]*?)<\/spine>/i)
  if (!spineMatch) {
    throw new Error('Invalid EPUB: no spine found in OPF')
  }

  const spineIds: string[] = []
  const itemrefRegex = /<itemref\s[^>]*?idref="([^"]+)"[^>]*?\/?>/gi
  while ((match = itemrefRegex.exec(spineMatch[1])) !== null) {
    spineIds.push(match[1])
  }

  // 3. Read each spine item
  const chapters: ParsedChapter[] = []

  for (const id of spineIds) {
    const href = manifest.get(id)
    if (!href) continue

    const fullPath = resolveRelativePath(opfPath, href)
    const zipFile = zip.file(fullPath)
    if (!zipFile) continue

    const xhtml = await zipFile.async('text')
    const bodyContent = extractBodyContent(xhtml)

    // Skip very short content (likely cover pages, TOCs, etc.)
    const textOnly = bodyContent.replace(/<[^>]+>/g, '').trim()
    if (textOnly.length < 20) continue

    const title = extractTitle(xhtml, href)
    chapters.push({ title, html: bodyContent })
  }

  if (chapters.length === 0) {
    throw new Error('No chapters found in EPUB file')
  }

  return chapters
}

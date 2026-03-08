#!/usr/bin/env node
/**
 * Brand asset generation script for Fictionry.
 * Source: fictionry-logo-vec.svg (project root)
 * Run:   node scripts/generate-brand-assets.mjs
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import pngToIco from 'png-to-ico'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const PUBLIC = join(ROOT, 'public')
const ICONS_DIR = join(PUBLIC, 'icons')

if (!existsSync(ICONS_DIR)) mkdirSync(ICONS_DIR, { recursive: true })

const DARK_BG = '#1a1a2e'

// ─── SVG manipulation ──────────────────────────────────────────────────────────

const sourceSvg = readFileSync(join(ROOT, 'fictionry-logo-vec.svg'), 'utf-8')

/** Extract the inner SVG content (everything between <svg...> and </svg>) */
function innerSvg(svg) {
  return svg
    .replace(/^[\s\S]*?<svg[^>]*>\n?/, '')
    .replace(/<\/svg>[\s\S]*$/, '')
}

/**
 * Remove the white background rectangle from the first group's path and fix
 * the subsequent relative-move to absolute coordinates.
 *
 * The first <g fill="#fffffe"> has a single <path> with two sub-paths:
 *   1. M0 384 l0 -384 688 0 688 0 0 384 0 384 -688 0 -688 0 0 -384z  ← background rect
 *   2. m738 226.8 c...                                                  ← white accents
 *
 * After the z, the current point is (0,384). The relative m738 226.8 gives
 * absolute (738, 610.8). We remove the rect and convert to M738 610.8.
 */
function removeBgRect(svg) {
  return svg.replace(
    'M0 384 l0 -384 688 0 688 0 0 384 0 384 -688 0 -688 0 0 -384z m738 226.8',
    'M738 610.8'
  )
}

// Icon crop: 600×600 square centred at (688, 384) in the 1376×768 source canvas
//   left  = 688 - 300 = 388
//   top   = 384 - 300 =  84
const ICON_VIEWBOX = '388 84 600 600'

const iconInner = removeBgRect(innerSvg(sourceSvg))

/** Minimal icon SVG — transparent background, cropped to the icon area */
function iconSvgTransparent(size = 512) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ICON_VIEWBOX}" width="${size}" height="${size}">${iconInner}</svg>`
}

/** Icon SVG with solid dark background, cropped to the icon area */
function iconSvgDark(size = 512) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${ICON_VIEWBOX}" width="${size}" height="${size}">
  <rect x="388" y="84" width="600" height="600" fill="${DARK_BG}"/>
  ${iconInner}
</svg>`
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

async function toPng(svgString, size, outputPath) {
  const buf = Buffer.from(svgString)
  if (size) {
    await sharp(buf, { density: 300 }).resize(size, size).png().toFile(outputPath)
  } else {
    await sharp(buf, { density: 300 }).png().toFile(outputPath)
  }
  console.log(`  ✓  ${outputPath.replace(ROOT, '.')} ${size ? `(${size}×${size})` : ''}`)
}

async function toPngBuffer(svgString, size) {
  return sharp(Buffer.from(svgString), { density: 300 }).resize(size, size).png().toBuffer()
}

// ─── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🎨  Generating Fictionry brand assets…\n')

  // ── 1. Transparent logo PNGs (for general use) ─────────────────────────────
  console.log('── Transparent logo PNGs')
  await toPng(iconSvgTransparent(), 48,  join(ICONS_DIR, 'logo-48.png'))
  await toPng(iconSvgTransparent(), 192, join(ICONS_DIR, 'logo-192.png'))
  await toPng(iconSvgTransparent(), 512, join(ICONS_DIR, 'logo-512.png'))

  // ── 2. Dark-background PWA icons ───────────────────────────────────────────
  console.log('\n── PWA / manifest icons (dark bg)')
  for (const size of [72, 96, 128, 144, 152, 192, 384, 512]) {
    await toPng(iconSvgDark(), size, join(ICONS_DIR, `icon-${size}x${size}.png`))
  }

  // ── 3. Apple touch icon ────────────────────────────────────────────────────
  console.log('\n── Apple touch icon')
  await toPng(iconSvgDark(), 180, join(PUBLIC, 'apple-touch-icon.png'))

  // ── 4. Favicon ICO (16, 32, 48) ────────────────────────────────────────────
  console.log('\n── Favicon ICO')
  // Write intermediate PNGs so png-to-ico can read them as file paths
  const favPaths = []
  for (const size of [16, 32, 48]) {
    const p = join(ICONS_DIR, `favicon-${size}.png`)
    await toPng(iconSvgDark(), size, p)
    favPaths.push(p)
  }
  const icoBuffer = await pngToIco(favPaths)
  writeFileSync(join(PUBLIC, 'favicon.ico'), icoBuffer)
  console.log(`  ✓  ./public/favicon.ico`)

  // ── 5. Wordmark SVGs ────────────────────────────────────────────────────────
  //
  // Layout (viewBox "0 0 210 48"):
  //   • Icon: 40×40 at y=4 (centred vertically)
  //   • Text: x=50, baseline y=34, font-size 28, weight 600
  //
  // Transform maps viewBox "388 84 600 600" → 40×40 starting at (0, 4):
  //   translate(0, 4)  scale(40/600)  translate(-388, -84)
  console.log('\n── Wordmark SVGs')
  const iconScale = 40 / 600
  const iconXform = `translate(0, 4) scale(${iconScale}) translate(-388, -84)`
  const textAttrs = `x="50" y="34" font-family="'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif" font-weight="600" font-size="28"`

  // Google Fonts @import — works in browsers; sharp/librsvg falls back to system fonts
  const fontImport = `<defs><style>@import url('https://fonts.googleapis.com/css2?family=Inter:wght@600&amp;display=swap');</style></defs>`

  const wordmarkDarkSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 48" width="420" height="96">
  ${fontImport}
  <g transform="${iconXform}">${iconInner}</g>
  <text ${textAttrs} fill="#FFFFFF">Fictionry</text>
</svg>`

  const wordmarkLightSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 48" width="420" height="96">
  ${fontImport}
  <g transform="${iconXform}">${iconInner}</g>
  <text ${textAttrs} fill="${DARK_BG}">Fictionry</text>
</svg>`

  writeFileSync(join(PUBLIC, 'logo-wordmark-dark.svg'), wordmarkDarkSvg)
  console.log(`  ✓  ./public/logo-wordmark-dark.svg`)
  writeFileSync(join(PUBLIC, 'logo-wordmark-light.svg'), wordmarkLightSvg)
  console.log(`  ✓  ./public/logo-wordmark-light.svg`)

  // ── 6. Wordmark PNGs (400px wide, transparent bg) ──────────────────────────
  // No Google Fonts import needed — sharp uses system fonts
  console.log('\n── Wordmark PNGs')
  const mkWordmarkPng = (textColor) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 210 48" width="420" height="96">
  <g transform="${iconXform}">${iconInner}</g>
  <text ${textAttrs} fill="${textColor}">Fictionry</text>
</svg>`

  await sharp(Buffer.from(mkWordmarkPng('#FFFFFF')), { density: 300 })
    .resize(400, null)
    .png()
    .toFile(join(PUBLIC, 'logo-wordmark-dark.png'))
  console.log(`  ✓  ./public/logo-wordmark-dark.png`)

  await sharp(Buffer.from(mkWordmarkPng(DARK_BG)), { density: 300 })
    .resize(400, null)
    .png()
    .toFile(join(PUBLIC, 'logo-wordmark-light.png'))
  console.log(`  ✓  ./public/logo-wordmark-light.png`)

  // ── 7. OG default image (1200×630) ─────────────────────────────────────────
  //
  // Layout:
  //   • Dark background
  //   • Icon 100×100 centred horizontally at x=550..650, y=130..230
  //   • "Fictionry" centred at (600, 330), size 64
  //   • Subtitle centred at (600, 385), size 26
  console.log('\n── OG default image')
  const ogIconScale = 100 / 600
  const ogIconXform = `translate(550, 130) scale(${ogIconScale}) translate(-388, -84)`
  const ogSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630">
  <rect width="1200" height="630" fill="${DARK_BG}"/>
  <g transform="${ogIconXform}">${iconInner}</g>
  <text x="600" y="330" text-anchor="middle"
        font-family="'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif"
        font-weight="600" font-size="64" fill="#FFFFFF">Fictionry</text>
  <text x="600" y="385" text-anchor="middle"
        font-family="'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif"
        font-weight="400" font-size="26" fill="#a0a0b0">The Modern Way to Read and Write Fiction</text>
</svg>`

  await sharp(Buffer.from(ogSvg), { density: 144 })
    .resize(1200, 630)
    .png()
    .toFile(join(PUBLIC, 'og-default.png'))
  console.log(`  ✓  ./public/og-default.png`)

  console.log('\n✅  All brand assets generated.\n')
}

main().catch((err) => {
  console.error('❌  Error:', err)
  process.exit(1)
})

#!/usr/bin/env node
/**
 * Generates PWA icon PNGs from embedded base64 data.
 * Run automatically via postinstall or manually: node scripts/generate-pwa-icons.js
 */
const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, 'pwa-icons-data.json');
const outDir = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(dataFile)) {
  console.log('pwa-icons-data.json not found, skipping icon generation');
  process.exit(0);
}

const icons = JSON.parse(fs.readFileSync(dataFile, 'utf8'));

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

for (const [filename, base64Data] of Object.entries(icons)) {
  const buffer = Buffer.from(base64Data, 'base64');
  fs.writeFileSync(path.join(outDir, filename), buffer);
  console.log(`Generated ${filename} (${buffer.length} bytes)`);
}

console.log('PWA icons generated successfully!');

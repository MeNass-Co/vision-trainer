#!/usr/bin/env node
// Resolve a Mobbin screen page to its FULL-RESOLUTION screenshot and save it.
// The MCP tool's image_url serves a ~300px preview — useless for pt-level measurement.
// Recipe: page -> og:image -> screenUrl param -> bytescale CDN (serves native-res PNG).
// Usage: node scripts/fetch-mobbin-screen.mjs <mobbin.com/screens/... url> <out.png>
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const [pageUrl, out] = process.argv.slice(2);
if (!pageUrl || !out) {
  console.error('usage: node scripts/fetch-mobbin-screen.mjs <mobbin-screen-url> <out.png>');
  process.exit(1);
}
const page = await fetch(pageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' }, redirect: 'follow' });
if (!page.ok) { console.error(`HTTP ${page.status} for ${pageUrl}`); process.exit(1); }
const html = await page.text();
const og = html.match(/og:image[^>]*content="([^"]+)"/)?.[1]?.replace(/&amp;/g, '&');
const screenUrl = og ? new URL(og, 'https://mobbin.com').searchParams.get('screenUrl') : null;
if (!screenUrl) { console.error('no og:image screenUrl found in page'); process.exit(1); }
const full = screenUrl.replace(/q=\d+/, 'q=85');
const img = await fetch(full, { redirect: 'follow' });
if (!img.ok) { console.error(`HTTP ${img.status} for ${full}`); process.exit(1); }
const buf = Buffer.from(await img.arrayBuffer());
await mkdir(dirname(out), { recursive: true });
await writeFile(out, buf);
console.log(`saved ${out} (${buf.length} bytes) from ${full.slice(0, 100)}`);

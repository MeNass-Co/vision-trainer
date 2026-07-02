#!/usr/bin/env node
// Download an image URL to a file (curl/wget are blocked in this environment).
// Usage: node scripts/fetch-image.mjs <url> <out-path>
import { writeFile, mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

const [url, out] = process.argv.slice(2);
if (!url || !out) {
  console.error('usage: node scripts/fetch-image.mjs <url> <out-path>');
  process.exit(1);
}
const res = await fetch(url, { redirect: 'follow' });
if (!res.ok) {
  console.error(`HTTP ${res.status} for ${url}`);
  process.exit(1);
}
const buf = Buffer.from(await res.arrayBuffer());
await mkdir(dirname(out), { recursive: true });
await writeFile(out, buf);
console.log(`saved ${out} (${buf.length} bytes, ${res.headers.get('content-type')})`);

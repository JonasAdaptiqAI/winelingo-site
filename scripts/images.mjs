// Generate WebP variants (800w, 1200w, full) for every photo in assets/photos.
// Run with: NODE_PATH=/Users/jonasegeskov/dev/whiskai-website/node_modules node scripts/images.mjs
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const sharp = require("sharp");
const DIR = path.resolve(import.meta.dirname, "..", "assets", "photos");
const WIDTHS = [800, 1200];
let before = 0, after = 0, n = 0;
for (const f of fs.readdirSync(DIR)) {
  if (!/\.jpe?g$/i.test(f)) continue;
  const src = path.join(DIR, f); const base = f.replace(/\.jpe?g$/i, "");
  const meta = await sharp(src).metadata(); before += fs.statSync(src).size; n++;
  const full = path.join(DIR, `${base}.webp`);
  await sharp(src).webp({ quality: 78 }).toFile(full); after += fs.statSync(full).size;
  for (const w of WIDTHS) {
    if (meta.width <= w) continue;
    await sharp(src).resize({ width: w }).webp({ quality: 78 }).toFile(path.join(DIR, `${base}-${w}.webp`));
  }
}
console.log(`converted ${n} photos: jpeg ${(before/1024/1024).toFixed(1)} MB -> full-size webp ${(after/1024/1024).toFixed(1)} MB`);

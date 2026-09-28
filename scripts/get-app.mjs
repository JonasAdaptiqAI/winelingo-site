// Sitewide, idempotent: wire every content page to the shared "get the app" kit.
// Run: node scripts/get-app.mjs
//
//   1. <script defer src="/assets/get-app.js"> before </body> — the sticky App Store
//      bar on phones, QR codes on desktop (see the header of assets/get-app.js).
//   2. The appstore-click event gains a `cta` property (data-cta, else the link's
//      class), so Umami can tell the header badge, the sticky bar, the article
//      band and the footer apart instead of lumping them together.
//   3. data-domains="winelingo.app" on the Umami tracker, so local previews and
//      forks stop counting as visits and diluting the click-through rate.
//
// Pages with their own install flow (invite, taste, the private demo), the legal
// pages and search-engine verification files are left alone.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const VERSION = 1;
const SKIP_DIRS = new Set([".git", ".claude", "assets", "scripts", "data", "invite", "taste", "balthazar", "get", "privacy", "terms"]);
const SKIP_FILES = new Set(["404.html", "google920805b1a6e2b562.html"]);

const TAG = `<script defer src="/assets/get-app.js?v=${VERSION}"></script>`;
const OLD_TRACK = "umami.track('appstore-click',{path:location.pathname});";
const NEW_TRACK = "umami.track('appstore-click',{path:location.pathname,cta:a.getAttribute('data-cta')||a.className||'link'});";
const OLD_UMAMI = 'data-website-id="c7a78f38-93c5-4438-aa14-abcaa3add531"></script>';
const NEW_UMAMI = 'data-website-id="c7a78f38-93c5-4438-aa14-abcaa3add531" data-domains="winelingo.app"></script>';

const files = [];
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (SKIP_DIRS.has(e.name)) continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith(".html") && !SKIP_FILES.has(path.relative(ROOT, p))) files.push(p);
  }
})(ROOT);

const counts = { files: 0, redirects: 0, changed: 0, tag: 0, track: 0, domains: 0, noBody: [] };
for (const f of files) {
  counts.files++;
  let html = fs.readFileSync(f, "utf8");
  if (/http-equiv="refresh"/i.test(html)) { counts.redirects++; continue; } // retired-URL stubs
  const orig = html;
  if (!html.includes("/assets/get-app.js")) {
    if (html.split("</body>").length !== 2) { counts.noBody.push(path.relative(ROOT, f)); continue; }
    html = html.replace("</body>", `${TAG}\n</body>`);
    counts.tag++;
  }
  if (html.includes(OLD_TRACK)) { html = html.replace(OLD_TRACK, NEW_TRACK); counts.track++; }
  if (html.includes(OLD_UMAMI)) { html = html.replace(OLD_UMAMI, NEW_UMAMI); counts.domains++; }
  if (html !== orig) { fs.writeFileSync(f, html); counts.changed++; }
}
console.log(counts);

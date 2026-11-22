// Pairing pages: "Check a bottle before you buy it", right under the answer.
// Run: node scripts/build-shelf-cta.mjs   (idempotent: an existing card is replaced)
//
// Why (2026-11-22): pairing pages are the site's biggest way in (zuppa toscana alone had 104
// visitors in 30 days), but their first App Store button sat after the FAQ, about 76% down the
// page, where only ~13% of readers get to (Umami read-90). The reader has the dish and is about
// to choose a bottle, so the card pitches the label scan at that moment. Phones get a button,
// computers a QR code (an iPhone app can't be installed from a laptop); styles in assets/site.css
// (.shelf-cta). data-get-app-zone keeps the sticky bar (assets/get-app.js) out of its way, and
// data-cta="pairing-shelf" tells its clicks apart in Umami.
//
// The card goes after the page's opening answer: the first `</article>` that is followed by the
// next prose article with a heading. Pages without that layout (redirect stubs, the hub) are skipped.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const DIR = "food-and-wine-pairing";
const START = "<!-- shelf-cta (scripts/build-shelf-cta.mjs) -->";
const END = "<!-- /shelf-cta -->";
const ANCHOR = '</article><article class="prose"><h2>';
const APP = "https://apps.apple.com/app/id6785896824";

const card = `${START}<aside class="shelf-cta" data-get-app-zone data-pagefind-ignore="all" aria-label="Check a bottle with the Winelingo app">` +
  `<img class="sc-icon" src="/assets/logo.png" alt="" width="52" height="52"><div class="sc-txt">` +
  `<p class="eyebrow">In the wine shop?</p><p class="sc-h">Check a bottle before you buy it</p>` +
  `<p class="sc-b">Point Winelingo at the label and see what the wine is, how it tastes and what it goes with.</p>` +
  `<div class="sc-go"><a class="sc-btn" href="${APP}" data-cta="pairing-shelf">Get the free app</a><span class="sc-note">iPhone · free to download</span></div>` +
  `<div class="sc-qr"><img src="/assets/qr-get.svg" alt="QR code that opens Winelingo on the App Store" width="72" height="72" loading="lazy">` +
  `<span><b>On a computer?</b> Point your iPhone camera here.</span></div></div></aside>${END}`;

const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
let placed = 0; const skipped = [];
for (const e of readdirSync(join(ROOT, DIR), { withFileTypes: true })) {
  if (!e.isDirectory()) continue;
  const file = join(DIR, e.name, "index.html");
  if (!existsSync(join(ROOT, file))) continue;
  let html = readFileSync(join(ROOT, file), "utf8");
  html = html.replace(new RegExp(`${esc(START)}[\\s\\S]*?${esc(END)}`), "");
  const at = html.indexOf(ANCHOR);
  if (at < 0) { skipped.push(e.name); continue; }
  const cut = at + "</article>".length;
  html = html.slice(0, cut) + card + html.slice(cut);
  writeFileSync(join(ROOT, file), html);
  placed++;
}
console.log(`Shelf cards on ${placed} pairing pages${skipped.length ? `; skipped (no answer article): ${skipped.join(", ")}` : ""}`);

#!/usr/bin/env node
// Build the Danish homepage, /da/, from the English index.html and data/home-da.json.
//
//   node scripts/build-home-da.mjs && node scripts/build-chrome.mjs
//
// The English homepage stays the source: change it, then re-run this. Text nodes and a few
// attributes are swapped by exact match, so a sentence edited in English and not in the
// table shows up in the "untranslated" list this prints (and the build fails), rather than
// slipping through in English. build-chrome.mjs then gives /da/ the Danish header and footer.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const T = JSON.parse(readFileSync(join(ROOT, "data/home-da.json"), "utf8"));
const SITE = "https://winelingo.app";

const unesc = (s) => s.replace(/&nbsp;/g, "\u00a0").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (s) => esc(s).replace(/"/g, "&quot;");

// Both homepages name each other, so search engines serve the right one.
const ALT = `<link rel="alternate" hreflang="en" href="${SITE}/">
<link rel="alternate" hreflang="da" href="${SITE}/da/">
<link rel="alternate" hreflang="x-default" href="${SITE}/">`;
const withAlternates = (html, canonical) => {
  html = html.replace(/<link rel="alternate" hreflang="[^"]*" href="[^"]*">\n?/g, "");
  return html.replace(/(<link rel="canonical" href="[^"]*">)/, `$1\n${ALT}`).replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonical}">`);
};

let en = readFileSync(join(ROOT, "index.html"), "utf8");
en = withAlternates(en, `${SITE}/`);
writeFileSync(join(ROOT, "index.html"), en);

let da = withAlternates(en, `${SITE}/da/`).replace('<html lang="en"', '<html lang="da"');

// Head: title, description and the social cards.
const setMeta = (html, attr, key, val) => html.replace(new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`), `$1${escAttr(val)}$2`);
da = da.replace(/<title>[^<]*<\/title>/, `<title>${esc(T.head.title)}</title>`);
da = setMeta(da, "name", "description", T.head.description);
da = setMeta(da, "property", "og:title", T.head.ogTitle);
da = setMeta(da, "property", "og:description", T.head.ogDescription);
da = setMeta(da, "name", "twitter:title", T.head.ogTitle);
da = setMeta(da, "name", "twitter:description", T.head.ogDescription);
da = setMeta(da, "property", "og:url", `${SITE}/da/`);
da = setMeta(da, "property", "og:locale", "da_DK");

// Snippets whose word order changes, then whole text nodes, then attributes: only inside
// <main>, since build-chrome.mjs writes the Danish header and footer.
const KEEP = new Set(["Winelingo", "Château de la Lanterne", "Château de la Lanterne · 2020", "Cabernet Sauvignon, Merlot, Cabernet Franc",
  "Type", "Scan", "Scroll", "Pallelau", "Vin-Elskeren", "hate stairway to heaven",
  // already Danish: put in by the "html" snippets above
  "besøg", "fra", "lande", "downloads", "af appen fra"]);
const a = da.indexOf("<main"), b = da.indexOf("</main>");
let main = da.slice(a, b);
for (const [x, y] of T.html) main = main.split(x).join(y);
const missing = new Set();
main = main.replace(/(<(script|style)\b[\s\S]*?<\/\2>)|>([^<>]+)</g, (m, skip, _t, text) => {
  if (skip) return skip;
  const t = unesc(text.trim());
  if (!t) return m;
  if (T.text[t] != null) return ">" + text.replace(text.trim(), esc(T.text[t])) + "<";
  if (/[a-z]{3}/i.test(t) && !KEEP.has(t)) missing.add(t);
  return m;
});
main = main.replace(/\b(alt|aria-label|title)="([^"]+)"/g, (m, k, v) => (T.attr[unesc(v)] != null ? `${k}="${escAttr(T.attr[unesc(v)])}"` : m));
da = da.slice(0, a) + main + da.slice(b);
if (missing.size) {
  console.error("Untranslated on the Danish homepage (add them to data/home-da.json):\n  " + [...missing].join("\n  "));
  process.exit(1);
}
mkdirSync(join(ROOT, "da"), { recursive: true });
writeFileSync(join(ROOT, "da/index.html"), da);
console.log("Built /da/ from index.html");

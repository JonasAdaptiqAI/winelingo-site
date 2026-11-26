#!/usr/bin/env node
// Build the Danish business page, /da/restauranter/, from business/index.html and
// data/business-da.json.
//
//   node scripts/build-business-da.mjs && node scripts/build-chrome.mjs
//
// The English page stays the source: change it, then re-run this. Every element that carries
// data-t="key" gets the Danish string with that key; a key with no Danish, or an attribute or a
// loose text that has none, stops the build instead of slipping through in English.
// build-chrome.mjs then gives the page the Danish header and footer.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const T = JSON.parse(readFileSync(join(ROOT, "data/business-da.json"), "utf8"));
const SITE = "https://winelingo.app";
const EN_PATH = "/business/";

const unesc = (s) => s.replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&#39;/g, "'");
const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escAttr = (s) => esc(s).replace(/"/g, "&quot;");
const fail = (msg) => { console.error(msg); process.exit(1); };

// Both pages name each other, so search engines serve the right one.
const ALT = `<link rel="alternate" hreflang="en" href="${SITE}${EN_PATH}">
<link rel="alternate" hreflang="da" href="${SITE}${T.path}">
<link rel="alternate" hreflang="x-default" href="${SITE}${EN_PATH}">`;
const withAlternates = (html, canonical) => {
  html = html.replace(/<link rel="alternate" hreflang="[^"]*" href="[^"]*">\n?/g, "");
  return html.replace(/<link rel="canonical" href="[^"]*">\n?/, `<link rel="canonical" href="${canonical}">\n${ALT}\n`);
};

const file = join(ROOT, "business/index.html");
const before = readFileSync(file, "utf8");
const en = withAlternates(before, `${SITE}${EN_PATH}`);
if (en !== before) writeFileSync(file, en);

let da = withAlternates(en, `${SITE}${T.path}`).replace('<html lang="en"', '<html lang="da"');

// Head: title, description and the social cards.
const setMeta = (html, attr, key, val) => {
  const re = new RegExp(`(<meta ${attr}="${key}" content=")[^"]*(")`);
  if (!re.test(html)) fail(`business page: no <meta ${attr}="${key}">`);
  return html.replace(re, `$1${escAttr(val)}$2`);
};
const POSTER = `${SITE}/assets/business/film-poster-da.jpg`;
da = da.replace(/<title>[^<]*<\/title>/, `<title>${esc(T.head.title)}</title>`);
da = setMeta(da, "name", "description", T.head.description);
da = setMeta(da, "property", "og:title", T.head.ogTitle);
da = setMeta(da, "property", "og:description", T.head.ogDescription);
da = setMeta(da, "name", "twitter:title", T.head.ogTitle);
da = setMeta(da, "name", "twitter:description", T.head.ogDescription);
da = setMeta(da, "property", "og:url", `${SITE}${T.path}`);
da = setMeta(da, "property", "og:image", POSTER);
da = setMeta(da, "name", "twitter:image", POSTER);

// Structured data: breadcrumb, the film and the FAQ, in Danish.
da = da.replace(/(<script type="application\/ld\+json">)([\s\S]*?)(<\/script>)/, (m, open, body, close) => {
  const ld = JSON.parse(body);
  for (const node of ld["@graph"]) {
    if (node["@type"] === "BreadcrumbList") {
      node.itemListElement.forEach((it, i) => { it.name = T.ld.crumbs[i]; if (it.item) it.item = `${SITE}/da/`; });
    } else if (node["@type"] === "VideoObject") {
      Object.assign(node, { name: T.ld.videoName, description: T.ld.videoDescription, thumbnailUrl: POSTER,
        contentUrl: `${SITE}/assets/video/for-restaurants-da.mp4`, inLanguage: "da" });
    } else if (node["@type"] === "FAQPage") {
      node.mainEntity = T.ld.faq.map(([q, a]) => {
        if (T.text[q] == null) fail(`business-da.json: ld.faq names "${q}", which has no Danish text`);
        return { "@type": "Question", name: T.text[q], acceptedAnswer: { "@type": "Answer", text: T.text[a] ?? a } };
      });
    }
  }
  return `${open}\n${JSON.stringify(ld, null, 2).replace(/<\//g, "<\\/")}\n${close}`;
});

// The body: only inside <main>, since build-chrome.mjs writes the Danish header and footer.
const a = da.indexOf("<main"), b = da.indexOf("</main>");
let main = da.slice(a, b);

// 1. Every data-t element.
const missing = new Set();
let swapped = 0;
main = main.replace(/(<(\w+)[^>]*\sdata-t="([^"]+)"[^>]*>)([^<]*)(<\/\2>)/g, (m, open, _tag, key, text, close) => {
  if (T.text[key] == null) { missing.add(`data-t="${key}" (${unesc(text.trim())})`); return m; }
  swapped++;
  return open + esc(T.text[key]) + close;
});
const total = (main.match(/\sdata-t="/g) || []).length;
if (swapped !== total) missing.add(`${total - swapped} data-t element(s) that hold markup, not plain text`);

// 2. Loose words with no data-t (the breadcrumb), by exact match.
for (const [x, y] of Object.entries(T.plain)) {
  const n = main.split(`>${x}<`).length - 1;
  if (!n) missing.add(`plain text "${x}" is no longer on the page`);
  main = main.split(`>${x}<`).join(`>${esc(y)}<`);
}

// 3. Attributes read aloud or shown on hover.
main = main.replace(/\b(alt|aria-label|title)="([^"]+)"/g, (m, k, v) => {
  const t = unesc(v);
  if (T.attr[t] != null) return `${k}="${escAttr(T.attr[t])}"`;
  if (/[a-z]{3}/i.test(t)) missing.add(`${k}="${t}"`);
  return m;
});

// 4. The Danish screenshots, film and mail subject, and links to the Danish pages.
main = main.replace(/(<img data-img="[^"]+" src="\/assets\/business\/[a-z]+)-en(\.webp")/g, "$1-da$2");
main = main.replace('poster="/assets/business/film-poster-en.webp"', 'poster="/assets/business/film-poster-da.webp"')
  .replace('src="/assets/video/for-restaurants-en.mp4"', 'src="/assets/video/for-restaurants-da.mp4"');
if (/-en\.(webp|mp4)/.test(main)) missing.add("an English image or film is still on the page");
main = main.replace(/(href="mailto:[^"?]+\?subject=)[^"]*(")/g, `$1${encodeURIComponent(T.mailSubject)}$2`);
for (const [x, y] of Object.entries(T.links)) main = main.split(`href="${x}"`).join(`href="${y}"`);

// 5. The language toggle shows where the visitor is.
main = main.replace('data-lang="en" aria-pressed="true"', 'data-lang="en" aria-pressed="false"')
  .replace('data-lang="da" aria-pressed="false"', 'data-lang="da" aria-pressed="true"');

if (missing.size) fail("Untranslated on the Danish business page (add them to data/business-da.json):\n  " + [...missing].join("\n  "));

da = da.slice(0, a) + main + da.slice(b);
const out = join(ROOT, T.path.replace(/^\/|\/$/g, ""));
mkdirSync(out, { recursive: true });
writeFileSync(join(out, "index.html"), da);
console.log(`Built ${T.path} from business/index.html (${swapped} texts)`);

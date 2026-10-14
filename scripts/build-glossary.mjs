#!/usr/bin/env node
// Build the wine glossary from data/glossary.json.
//
//   node scripts/build-glossary.mjs
//
// /wine-glossary/ gets the full A–Z list (one <h2> per letter, a letter jump-bar, an anchor per
// term) between the glossary-az markers, plus its title, description, h1, lead, and the
// DefinedTermSet JSON-LD. Each category page (/wine-glossary/<cat>/) gets its own terms in A–Z order
// inside its <dl class="term-grid">. Re-running is idempotent: everything generated sits between
// markers or replaces a single known element.
//
// Why one long A–Z page: the queries "wine terms", "wine glossary" and "wine vocabulary" are won by
// A–Z glossaries with every term on one page (docs/SEO-LEARN-WINE-DEMAND.md, Wine App repo). The
// old hub listed only the seven categories, so it held no terms at all.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const { terms } = JSON.parse(readFileSync(join(ROOT, "data/glossary.json"), "utf8"));
const N = terms.length;

const CATS = [
  ["tasting", "Tasting", "Body, tannin, acidity, sweetness and finish: what you actually taste.", "red-swirl"],
  ["grapes", "Grapes", "The grape varieties you meet most, and what each brings to the glass.", "grapes-purple"],
  ["regions", "Regions", "Terroir, climate, crus and the Old World vs New World divide.", "region-tuscany"],
  ["winemaking", "Winemaking", "Oak, yeast, fermentation and bubbles: what happens from grape to glass.", "cta-cellar"],
  ["styles", "Styles", "Sparkling sweetness levels, fortified wines, rosé, orange and more.", "grape-chardonnay"],
  ["label", "Label", "AOC, DOCG, Reserva, Kabinett and the other words on the bottle.", "pour-table"],
  ["serving", "Serving", "Decanting, temperature, bottle sizes and the words around the table.", "pour-golden"],
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const fold = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "");
const slug = (s) => fold(s).toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const letter = (s) => fold(s)[0].toUpperCase();
const byName = (a, b) => fold(a.term).localeCompare(fold(b.term), "en", { sensitivity: "base" });
const json = (o) => JSON.stringify(o).replace(/<\//g, "<\\/");

const ids = new Set();
for (const t of terms) {
  t.id = slug(t.term);
  if (ids.has(t.id)) throw new Error(`duplicate anchor ${t.id}`);
  ids.add(t.id);
}

const termHtml = (t, withId) => `<div class="term"${withId ? ` id="${t.id}"` : ""}><dt>${t.link ? `<a href="${t.link}">${esc(t.term)}</a>` : esc(t.term)}</dt><dd>${esc(t.def)}</dd></div>`;

function replaceOnce(html, re, value, what, file) {
  if (!re.test(html)) throw new Error(`${file}: ${what} not found`);
  return html.replace(re, value);
}
function setHead(html, file, { title, desc }) {
  if (title) {
    html = replaceOnce(html, /<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`, "title", file);
    html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(title)}$2`)
      .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(title)}$2`);
  }
  if (desc) {
    if (desc.length > 160) throw new Error(`${file}: description ${desc.length} chars`);
    html = replaceOnce(html, /(<meta name="description" content=")[^"]*(")/, `$1${esc(desc)}$2`, "description", file);
    html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(desc)}$2`)
      .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(desc)}$2`);
  }
  return html;
}
function setTermSet(html, file, name, url, list) {
  const set = { "@context": "https://schema.org", "@type": "DefinedTermSet", name, url, inLanguage: "en",
    hasDefinedTerm: list.map((t) => ({ "@type": "DefinedTerm", name: t.term, description: t.def, url: `https://winelingo.app/wine-glossary/#${t.id}` })) };
  return replaceOnce(html, /(<script type="application\/ld\+json">\n?)\{"@context":"https:\/\/schema\.org","@type":"DefinedTermSet"[\s\S]*?(\n?<\/script>)/,
    (_, a, b) => a + json(set) + b, "DefinedTermSet", file);
}

// ---------------------------------------------------------------- the A–Z hub
{
  const file = "wine-glossary/index.html";
  let html = readFileSync(join(ROOT, file), "utf8");
  html = setHead(html, file, {
    title: `Wine Terms: A–Z Glossary of ${N} Wine Words | Winelingo`,
    desc: `${N} wine terms explained in plain English, from Acidity to Yeast: tasting words, grapes, label terms, winemaking and serving.`,
  });
  html = replaceOnce(html, /<h1 class="reveal d1">[^<]*<\/h1>/, `<h1 class="reveal d1">Wine Terms: an A–Z Glossary of ${N} Wine Words</h1>`, "h1", file);
  html = replaceOnce(html, /<p class="deck reveal d2">[^<]*<\/p>/,
    `<p class="deck reveal d2">Every wine word a beginner meets, defined in a sentence or two of plain English, so the label, the menu and the tasting note all make sense.</p>`, "deck", file);
  html = replaceOnce(html, /<p class="lead">[^<]*<\/p>/,
    `<p class="lead">Wine has a lot of words attached to it, and most of them sound more complicated than they are. This glossary takes the ${N} terms you are most likely to meet, on a label, on a menu or in a tasting note, and explains each one in plain language.</p>`, "lead", file);
  html = setTermSet(html, file, "Winelingo Wine Glossary", "https://winelingo.app/wine-glossary/", [...terms].sort(byName));

  const groups = new Map();
  for (const t of [...terms].sort(byName)) {
    const L = letter(t.term);
    if (!groups.has(L)) groups.set(L, []);
    groups.get(L).push(t);
  }
  const az = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((L) => groups.has(L)
    ? `<a href="#letter-${L.toLowerCase()}">${L}</a>` : `<span aria-hidden="true">${L}</span>`).join("");
  const sections = [...groups].map(([L, list]) => `<section class="glossary-cat" id="letter-${L.toLowerCase()}"><h2>${L}</h2><div class="rule"></div><dl class="term-grid">
${list.map((t) => termHtml(t, true)).join("\n")}
</dl></section>`).join("\n");
  const counts = Object.fromEntries(CATS.map(([k]) => [k, terms.filter((t) => t.cat === k).length]));
  const cards = CATS.map(([k, name, blurb, img]) => `<a class="hub-card has-img reveal" href="/wine-glossary/${k}/"><div class="thumb"><picture><source type="image/webp" srcset="/assets/photos/${img}-800.webp"><img src="/assets/photos/${img}.jpg" alt="" loading="lazy"></picture></div><div class="body"><h3>${name} terms</h3><p>${blurb}</p><div class="go">${counts[k]} terms →</div></div></a>`).join("\n");

  const block = `<!-- glossary-az (scripts/build-glossary.mjs) -->
<section class="wrap glossary-az" style="padding-top:8px"><nav class="az-nav" aria-label="Jump to a letter">${az}</nav>
${sections}
</section>
<section class="section" style="padding-top:36px"><h2 class="hub-h2 reveal">Browse wine terms by topic</h2><div class="hub-grid">
${cards}
</div></section>
<!-- /glossary-az -->`;
  if (html.includes("<!-- glossary-az")) {
    html = html.replace(/<!-- glossary-az[\s\S]*?<!-- \/glossary-az -->/, block);
  } else {
    // First run: the old category-cards section is replaced by the A–Z list plus fresh cards.
    html = replaceOnce(html, /<section class="section" style="padding-top:12px"><h2 class="hub-h2 reveal">Glossary sections<\/h2><div class="hub-grid">[\s\S]*?<\/div><\/section>/, block, "old sections grid", file);
  }
  writeFileSync(join(ROOT, file), html);
}

// ---------------------------------------------------------------- category pages
for (const [k, name] of CATS) {
  const file = `wine-glossary/${k}/index.html`;
  let html = readFileSync(join(ROOT, file), "utf8");
  const list = terms.filter((t) => t.cat === k).sort(byName);
  html = replaceOnce(html, /<dl class="term-grid">[\s\S]*?<\/dl>/, `<dl class="term-grid">\n${list.map((t) => termHtml(t, false)).join("\n")}\n</dl>`, "term grid", file);
  html = setTermSet(html, file, `${name} — Winelingo Wine Glossary`, `https://winelingo.app/wine-glossary/${k}/`, list);
  writeFileSync(join(ROOT, file), html);
}

// ---------------------------------------------------------------- llms.txt
{
  const file = "llms.txt";
  const s = readFileSync(join(ROOT, file), "utf8");
  writeFileSync(join(ROOT, file), s.replace(/\[Wine glossary \(\d+ terms\)\]/, `[Wine glossary (${N} terms)]`));
}

console.log(`Glossary: ${N} terms; ${CATS.map(([k]) => `${k} ${terms.filter((t) => t.cat === k).length}`).join(", ")}`);

#!/usr/bin/env node
// Build /learn/<slug>/ guide pages from data/guides/<slug>.json.
//
//   node scripts/build-guides.mjs            # every guide in data/guides/
//   node scripts/build-guides.mjs dry-red-wine
//
// The page chrome (head links, header, footer, scripts, app band) is cloned from a donor guide,
// learn/how-to-taste-wine/, so new guides stay identical to the rest of the site. Everything inside
// <main> is generated: hero, intro, sections, related links, FAQ, app band, course band. Head
// metadata and the three JSON-LD blocks (breadcrumb, article, FAQ) are rebuilt from the JSON.
// The free-lesson card is added afterwards by build-lesson-cta.mjs (data/lesson-cta.json).
//
// Content JSON: { slug, title, metaDescription, h1, deck, crumb, intro, sections[{heading, html}],
//   faq[{q, a}], keepLearning[{href, anchor}], sources[], published?, course?{href, label, count} }
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const DONOR = "learn/how-to-taste-wine/index.html";
const TODAY = new Date().toISOString().slice(0, 10);
const only = process.argv[2];

const donor = readFileSync(join(ROOT, DONOR), "utf8");
const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const escT = (s) => String(s).replace(/&(?![a-z]+;|#\d+;)/g, "&amp;");
const json = (o) => JSON.stringify(o).replace(/<\//g, "<\\/");
const longDate = (iso) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const pick = (re, what) => { const m = donor.match(re); if (!m) throw new Error(`donor drift: ${what}`); return m[0]; };
const motif = pick(/<svg class="motif"[\s\S]*?<\/svg>/, "hero motif");
const appband = pick(/<section class="wrap"><div class="appband">[\s\S]*?<\/div><\/div><\/section>/, "app band");
const pm = '<span class="pm" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span>';
const divider = '<div class="prose-divider" aria-hidden="true"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="m12 2 2.4 6.3L21 9l-5 4.2L17.6 20 12 16.4 6.4 20 8 13.2 3 9l6.6-.7L12 2Z"/></svg></div>';
const donorUrl = donor.match(/<link rel="canonical" href="([^"]+)">/)[1];
const ld = [...donor.matchAll(/<script type="application\/ld\+json">\n?([\s\S]*?)\n?<\/script>/g)].map((m) => JSON.parse(m[1]));
const article = ld.find((o) => o["@type"] === "Article");
if (!article) throw new Error("donor drift: Article JSON-LD");

const ALLOWED = /^(p|ul|ol|li|strong|em|a|h3|div|table|thead|tbody|tr|th|td|br)$/;
function check(g, file) {
  const errs = [];
  for (const k of ["slug", "title", "metaDescription", "h1", "deck", "crumb", "intro", "sections", "faq", "keepLearning"]) if (!g[k]) errs.push(`missing ${k}`);
  if (g.title && g.title.length > 60) errs.push(`title ${g.title.length} chars`);
  if (g.metaDescription && (g.metaDescription.length > 160 || g.metaDescription.length < 110)) errs.push(`description ${g.metaDescription.length} chars`);
  const html = [g.intro, ...(g.sections || []).map((s) => s.html)].join("\n");
  for (const m of html.matchAll(/<\/?([a-z0-9]+)/gi)) if (!ALLOWED.test(m[1].toLowerCase())) errs.push(`tag <${m[1]}>`);
  for (const m of html.matchAll(/<div class="([^"]+)"/g)) if (!["callout", "table-wrap"].includes(m[1])) errs.push(`div class ${m[1]}`);
  for (const m of html.matchAll(/\sstyle=/g)) errs.push("inline style");
  const all = JSON.stringify(g);
  if (/—/.test(all.replace(/"sources":\[.*?\]/, ""))) errs.push("em dash");
  for (const w of ["flavor", "savory", " color", "favorite", "recognize", "organize", "center"]) if (all.toLowerCase().includes(w)) errs.push(`US spelling "${w.trim()}"`);
  const hrefs = [...html.matchAll(/href="([^"]+)"/g)].map((m) => m[1]).concat((g.keepLearning || []).map((l) => l.href));
  for (const h of hrefs) {
    if (!h.startsWith("/")) { errs.push(`external link ${h}`); continue; }
    const p = h.split("#")[0].replace(/^\//, "");
    if (p && !existsSync(join(ROOT, p, "index.html")) && !planned.has(p.replace(/\/$/, ""))) errs.push(`dead link ${h}`);
  }
  if (errs.length) throw new Error(`${file}: ${errs.join("; ")}`);
}

const files = readdirSync(join(ROOT, "data/guides")).filter((f) => f.endsWith(".json"));
const planned = new Set(files.map((f) => "learn/" + f.replace(/\.json$/, "")));
let n = 0;
for (const f of files) {
  const g = JSON.parse(readFileSync(join(ROOT, "data/guides", f), "utf8"));
  if (only && g.slug !== only) continue;
  if (`${g.slug}.json` !== f) throw new Error(`${f}: slug ${g.slug} does not match the file name`);
  check(g, f);
  const url = `https://winelingo.app/learn/${g.slug}/`;
  const published = g.published || TODAY;
  const title = `${g.title.replace(/\s*\|\s*Winelingo$/, "")} | Winelingo`;
  if (title.length > 60) throw new Error(`${f}: title ${title.length} chars`);

  // ---- head
  let p = donor;
  p = p.replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`);
  for (const [re, v] of [[/(<meta name="description" content=")[^"]*/, g.metaDescription], [/(<meta property="og:description" content=")[^"]*/, g.metaDescription], [/(<meta name="twitter:description" content=")[^"]*/, g.metaDescription],
    [/(<meta property="og:title" content=")[^"]*/, title], [/(<meta name="twitter:title" content=")[^"]*/, title]]) p = p.replace(re, (_, a) => a + esc(v));
  p = p.split(donorUrl).join(url);
  const blocks = [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://winelingo.app/" },
      { "@type": "ListItem", position: 2, name: "Learn", item: "https://winelingo.app/learn/" },
      { "@type": "ListItem", position: 3, name: g.crumb }] },
    { ...article, headline: g.h1, description: g.metaDescription, datePublished: published, dateModified: TODAY, mainEntityOfPage: url },
    { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: g.faq.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } })) },
  ];
  // drop the donor's JSON-LD and write ours in its place
  const firstLd = p.indexOf('<script type="application/ld+json">');
  p = p.replace(/<script type="application\/ld\+json">\n?[\s\S]*?\n?<\/script>\n?/g, "");
  p = p.slice(0, firstLd) + blocks.map((b) => `<script type="application/ld+json">\n${json(b)}\n</script>\n`).join("") + p.slice(firstLd);

  // ---- main
  const half = Math.ceil(g.sections.length / 2);
  const sections = g.sections.map((s, i) => `<h2>${escT(s.heading)}</h2>\n${s.html}\n${i === half - 1 && i !== g.sections.length - 1 ? divider + "\n" : ""}`).join("");
  const course = g.course || { href: "/course/", label: "Winelingo's online wine course", count: "166 interactive lessons in 26 units, first unit free" };
  const main = `<main id="main"><section class="page-hero"><div class="hero-bg" aria-hidden="true"></div>${motif}<div class="wrap">
    <nav class="breadcrumb" aria-label="Breadcrumb"><a href="/">Home</a><span aria-hidden="true">/</span><a href="/learn/">Learn</a><span aria-hidden="true">/</span><span aria-current="page">${escT(g.crumb)}</span></nav>
    <p class="eyebrow reveal">Learn</p>
    <h1 class="reveal d1">${escT(g.h1)}</h1>
    <p class="deck reveal d2">${escT(g.deck)}</p>
    <p class="byline">By <a href="/about/">Jonas Egeskov</a> · Updated <time datetime="${TODAY}">${longDate(TODAY)}</time></p>
  </div></section><article class="prose">${g.intro.replace("<p>", '<p class="lead">')}</article><article class="prose">${sections}</article><section class="wrap" style="max-width:var(--maxw-prose);padding-bottom:10px"><div class="callout"><strong>Keep learning</strong><div style="margin-top:10px;display:grid;gap:8px">${g.keepLearning.map((l) => `<a href="${l.href}">${escT(l.anchor)}</a>`).join("")}</div><p style="margin:12px 0 0;font-size:13px;color:var(--muted)">More from Winelingo: <a href="/learn/">the full learn hub</a>.</p></div></section><section class="section" style="padding-top:20px"><div class="wrap"><div class="section-head"><p class="eyebrow center reveal">FAQ</p><h2 class="reveal">Questions &amp; answers</h2></div><div class="faq reveal d1">
${g.faq.map((x, i) => `<details${i === 0 ? " open" : ""}><summary>${escT(x.q)}${pm}</summary><div class="a"><p>${escT(x.a)}</p></div></details>`).join("\n")}
</div></div></section>${appband}<!-- course-band (scripts/build-guides.mjs) -->
<aside class="course-band"><div class="wrap"><div class="cb-in">
  <p class="eyebrow">Online wine course</p>
  <p class="cb-t">Learn it step by step, five minutes at a time.</p>
  <p class="cb-l"><a href="${course.href}">${escT(course.label)}</a> · ${escT(course.count)}</p>
  <a class="btn btn-primary" href="${course.href}">See the syllabus</a>
</div></div></aside>
<!-- /course-band -->
</main>`;
  p = p.replace(/<main id="main">[\s\S]*?<\/main>/, main);
  for (const leak of ["How to Taste Wine", "red-swirl", "Ã", "â€"]) if (p.includes(leak)) throw new Error(`${f}: donor leak "${leak}"`);
  mkdirSync(join(ROOT, "learn", g.slug), { recursive: true });
  writeFileSync(join(ROOT, "learn", g.slug, "index.html"), p);
  n++;
}
console.log(`Built ${n} guide page(s)`);

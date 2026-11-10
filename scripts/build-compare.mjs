#!/usr/bin/env node
// Build the comparison pages (/compare/…) and the FAQ (/faq/) from data/compare/.
//
//   node scripts/build-compare.mjs && node scripts/build-chrome.mjs
//
// Facts about every app live in ONE place: data/compare/competitors.json (other apps, each fact
// with its source and the date it was checked) and data/compare/winelingo.json (ours, same
// shape). The copy is in data/compare/pages.mjs. Comparison tables are generated from the facts,
// so a table can never say something the fact file does not. Honesty rules for these pages:
// every claim about another app is sourced and dated, each page says who wrote it, and where
// another app is the better choice the page says so.
// Header, footer and analytics are copied from tools/index.html, like build-tests.mjs.
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { pages } from "../data/compare/pages.mjs";

const ROOT = new URL("..", import.meta.url).pathname;
const SITE = "https://winelingo.app";
const read = (f) => JSON.parse(readFileSync(join(ROOT, f), "utf8"));
const them = read("data/compare/competitors.json");
const us = read("data/compare/winelingo.json");
const APPS = Object.fromEntries([us, ...them.apps].map((a) => [a.id, a]));
const CHECKED = them.checked;
const longDate = (iso) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });

const monthYear = (iso) => new Date(iso + "T12:00:00Z").toLocaleDateString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" });

const tpl = readFileSync(join(ROOT, "tools/index.html"), "utf8");
const cut = (s, a, b) => s.slice(s.indexOf(a), s.indexOf(b) + b.length);
const header = cut(tpl, '<a class="skip"', "</header>");
const footer = tpl.slice(tpl.indexOf('<footer class="site-footer"'), tpl.indexOf("</body>"));
const analytics = cut(tpl, "<!-- growth:analytics -->", "<!-- /growth:analytics -->");
const fontHref = tpl.match(/<link rel="stylesheet" href="(https:\/\/fonts\.googleapis\.com[^"]+)"/)[1];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const inlineJson = (o) => JSON.stringify(o).replace(/<\//g, "<\\/");
const strip = (h) => h.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/\s+/g, " ").trim();

// ---- comparison table, straight from the fact files
const FEATURES = [
  ["structured_lessons_or_course", "Lessons or a course"],
  ["quizzes_or_games", "Quizzes and games"],
  ["label_scan", "Scans wine labels"],
  ["wine_list_scan", "Scans restaurant wine lists"],
  ["tasting_journal", "Tasting journal"],
  ["food_pairing", "Food pairing"],
  ["ratings_reviews", "Crowd ratings and reviews"],
  ["cellar_tracking", "Cellar tracking"],
  ["buy_wine_in_app", "Sells wine in the app"],
];
const mark = (a, key) => {
  // Other apps: only the short note written for the table. Ours: feature_notes are already short.
  const v = a.features?.[key], note = a.short ? a.short.notes?.[key] : a.feature_notes?.[key];
  // For another app a dash means "its listing does not describe this", which is all we can know.
  const none = a.id === "winelingo" ? "No" : "Not described in its listing";
  const base = v === true ? '<span class="cmp-y" aria-label="Yes">✓</span>' : v === false ? `<span class="cmp-n" aria-label="${none}" title="${none}">—</span>` : '<span class="cmp-u">Not stated</span>';
  return base + (note ? ` <small>${esc(note)}</small>` : "");
};
function table(ids) {
  const apps = ids.map((id) => { if (!APPS[id]) throw new Error(`no facts for app "${id}"`); return APPS[id]; });
  const row = (label, f) => `<tr><td>${label}</td>${apps.map((a) => `<td>${f(a)}</td>`).join("")}</tr>`;
  return `<div class="table-wrap cmp"><table class="data"><thead><tr><th scope="col"></th>${apps.map((a) => `<th scope="col">${esc(a.name)}</th>`).join("")}</tr></thead><tbody>
${row("Best for", (a) => esc(a.short?.best || a.best_for))}
${row("Works on", (a) => esc((a.platforms || []).join(", ")))}
${row("Free", (a) => esc(a.short?.free || a.price?.free_tier || "Not stated"))}
${row("Paid", (a) => esc(a.short?.paid || a.price?.paid || "No paid tier found"))}
${FEATURES.map(([k, label]) => row(label, (a) => mark(a, k))).join("\n")}
${row("iPhone app last updated", (a) => a.app_store?.last_updated ? esc(monthYear(a.app_store.last_updated)) : "Not stated")}
</tbody></table></div>
<p class="cmp-src">Facts checked ${longDate(CHECKED)}. Sources: ${apps.map((a) => `${esc(a.name)}: ${(a.sources || []).slice(0, 6).map((u, i) => `<a href="${esc(u)}" rel="nofollow noopener">[${i + 1}]</a>`).join(" ")}`).join(" · ")}. Prices are US prices as listed on that date. A dash for another app means its listing does not describe that feature; it does not prove the feature is missing.</p>`;
}
// {{table:winelingo,vivino}} and {{app:vivino:price.paid}} in the copy are filled from the facts.
const fill = (html) => html
  .replace(/\{\{table:([a-z0-9,-]+)\}\}/g, (_, ids) => table(ids.split(",")))
  .replace(/\{\{app:([a-z0-9-]+):([a-z_.]+)\}\}/g, (_, id, path) => {
    const v = path.split(".").reduce((o, k) => o?.[k], APPS[id]);
    if (v == null) throw new Error(`{{app:${id}:${path}}} has no value in the fact files`);
    return esc(Array.isArray(v) ? v.join(", ") : v);
  });

const DISCLOSURE = `<aside class="callout cmp-who"><strong>Who wrote this.</strong> Winelingo did, and Winelingo is one of the apps on this page, so read it with that in mind. Facts about other apps come from their App Store listings and their own websites, with the sources linked under each table, and were checked on ${longDate(CHECKED)}. We did not install and test every app. Found something wrong or out of date? <a href="mailto:jonsegeskov29@gmail.com?subject=Correction%20to%20a%20comparison%20page">Tell us</a> and we will fix it.</aside>`;

const faqHtml = (faqs) => `<section class="section" style="padding-top:20px"><div class="wrap"><div class="section-head"><p class="eyebrow center">FAQ</p><h2>Questions &amp; answers</h2></div><div class="faq">
${faqs.map((f, i) => `<details${i === 0 ? " open" : ""}><summary>${esc(f.q)}<span class="pm" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span></summary><div class="a"><p>${fill(f.a)}</p></div></details>`).join("\n")}
</div></div></section>`;

function render(p) {
  const url = SITE + p.path;
  const crumbs = [["Home", "/"], ...(p.crumbs || []), [p.crumb || p.h1]];
  const body = fill(p.body);
  const ld = [
    { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c[0], ...(c[1] ? { item: SITE + c[1] } : {}) })) },
    { "@context": "https://schema.org", "@type": p.type === "faq" ? "WebPage" : "Article", headline: p.h1, description: p.desc, url, dateModified: CHECKED, inLanguage: "en",
      author: { "@type": "Person", name: "Jonas Egeskov", url: SITE + "/about/" }, publisher: { "@type": "Organization", name: "Winelingo", url: SITE + "/" } },
    ...(p.faqs?.length ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: p.faqs.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: strip(fill(f.a)) } })) }] : []),
  ];
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="apple-itunes-app" content="app-id=6785896824">
<title>${esc(p.title)}</title>
<meta name="description" content="${esc(p.desc)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#7b1e3b">
<meta name="color-scheme" content="light">
<meta name="author" content="Jonas Egeskov">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Winelingo">
<meta property="og:title" content="${esc(p.title)}">
<meta property="og:description" content="${esc(p.desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/assets/social-card.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fontHref}">
<link rel="stylesheet" href="/assets/site.css">
${ld.map((o) => `<script type="application/ld+json">${inlineJson(o)}</script>`).join("\n")}
${analytics}
</head>
<body>
${header}
<main id="main">
<section class="page-hero"><div class="hero-bg" aria-hidden="true"></div><div class="wrap">
    <nav class="breadcrumb" aria-label="Breadcrumb">${crumbs.map((c, i) => i < crumbs.length - 1 ? `<a href="${c[1]}">${esc(c[0])}</a><span aria-hidden="true">/</span>` : `<span aria-current="page">${esc(c[0])}</span>`).join("")}</nav>
    <p class="eyebrow">${esc(p.eyebrow)}</p>
    <h1>${esc(p.h1)}</h1>
    <p class="deck">${esc(p.deck)}</p>
    <p class="cmp-date">Last checked ${longDate(CHECKED)}</p>
  </div></section>
<article class="prose cmp-prose">
${p.type === "faq" ? "" : DISCLOSURE}
${body}
</article>
${p.faqs?.length ? faqHtml(p.faqs) : ""}
<section class="wrap"><div class="appband" data-pagefind-ignore="all"><div class="in">
    <div class="ic"><img src="/assets/logo.png" alt="Winelingo app icon" width="128" height="128" loading="lazy">
      <div><h3>Try Winelingo free</h3><p>Short wine lessons, a label and wine-list scanner, and free practice tests. Free to download, with Premium for unlimited scans.</p></div></div>
    <div class="ab-get"><a class="btn btn-primary btn-lg" href="https://apps.apple.com/app/id6785896824" data-cta="compare-app">Download on the App&nbsp;Store</a><a class="cmp-web" href="/course/" data-cta="compare-web">or start in your browser →</a></div>
  </div></div></section>
</main>
${footer}
</body>
</html>
`;
}

for (const p of pages) {
  const dir = join(ROOT, p.path);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), render(p));
}
console.log(`Built ${pages.length} pages: ${pages.map((p) => p.path).join(" ")}`);

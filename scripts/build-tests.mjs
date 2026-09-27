#!/usr/bin/env node
// Build the /tests/ hub and one page per test from data/tests/<lang>/<slug>.json.
//
//   node scripts/build-tests.mjs
//
// English (data/tests/en) is the canonical set; a test only ships if it has an
// English file. Other languages are optional per test. The `source` field (the
// URL a fact was checked against) is stripped from the published pages.
// Header, footer and analytics are copied from tools/index.html so the tests
// stay in step with the rest of the site.
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const DATA = join(ROOT, "data/tests");
const LANGS = ["en", "da", "de", "es"];
const ORDER = ["serving-wine", "guest-questions", "white-grapes", "red-grapes",
  "food-and-wine", "labels-and-lists", "sparkling-wine", "wine-faults"];

const tpl = readFileSync(join(ROOT, "tools/index.html"), "utf8");
const cut = (s, a, b) => s.slice(s.indexOf(a), s.indexOf(b) + b.length);
const header = cut(tpl, '<a class="skip"', "</header>");
const footer = tpl.slice(tpl.indexOf('<footer class="site-footer">'), tpl.indexOf("</body>"));
const analytics = cut(tpl, "<!-- growth:analytics -->", "<!-- /growth:analytics -->");
const fontHref = tpl.match(/<link rel="stylesheet" href="(https:\/\/fonts\.googleapis\.com[^"]+)"/)[1];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// JSON inside <script type="application/json">: only "</" can break out.
const inlineJson = (o) => JSON.stringify(o).replace(/<\//g, "<\\/");

function validate(t, file) {
  const errs = [];
  if (!t.slug || !t.title || !t.summary) errs.push("missing slug/title/summary");
  if (![1, 2, 3].includes(t.level)) errs.push("level must be 1-3");
  if (!Array.isArray(t.questions) || t.questions.length !== 10) errs.push("needs exactly 10 questions");
  (t.questions || []).forEach((q, i) => {
    if (!q.q || !q.why) errs.push(`q${i + 1}: missing q/why`);
    if (!Array.isArray(q.opts) || q.opts.length !== 4) errs.push(`q${i + 1}: needs 4 options`);
    if (!Number.isInteger(q.a) || q.a < 0 || q.a > 3) errs.push(`q${i + 1}: bad answer index`);
  });
  // If the right answer is usually the longest option, people can pass by guessing.
  const giveaways = (t.questions || []).filter((q) =>
    Array.isArray(q.opts) && q.opts.every((o, k) => k === q.a || o.length < q.opts[q.a].length)).length;
  if (giveaways > 4) errs.push(`correct option is the longest in ${giveaways}/10 questions (max 4)`);
  if (errs.length) throw new Error(`${file}: ${errs.join("; ")}`);
}

function load() {
  const tests = [];
  const slugs = readdirSync(join(DATA, "en")).filter((f) => f.endsWith(".json")).map((f) => f.slice(0, -5));
  slugs.sort((a, b) => (ORDER.indexOf(a) + 1 || 99) - (ORDER.indexOf(b) + 1 || 99));
  for (const slug of slugs) {
    const entry = { slug };
    for (const lang of LANGS) {
      const f = join(DATA, lang, slug + ".json");
      if (!existsSync(f)) continue;
      const t = JSON.parse(readFileSync(f, "utf8"));
      validate(t, `${lang}/${slug}.json`);
      entry.level = entry.level ?? t.level;
      entry[lang] = {
        title: t.title, summary: t.summary,
        questions: t.questions.map(({ q, opts, a, why, deeper }) => ({ q, opts, a, why, deeper })),
      };
    }
    // Every translation must keep the English answer key, or a translator re-ordered options.
    for (const lang of LANGS.slice(1)) {
      if (!entry[lang]) continue;
      entry[lang].questions.forEach((q, i) => {
        if (q.a !== entry.en.questions[i].a) throw new Error(`${lang}/${slug}: q${i + 1} answer differs from English`);
      });
    }
    tests.push(entry);
  }
  return tests;
}

function page({ path, title, desc, crumbs, body, data }) {
  const url = `https://winelingo.app${path}`;
  const ld = { "@context": "https://schema.org", "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c[0], ...(c[1] ? { item: `https://winelingo.app${c[1]}` } : {}) })) };
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="apple-itunes-app" content="app-id=6785896824">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${url}">
<meta name="theme-color" content="#7b1e3b">
<meta name="color-scheme" content="light">
<meta name="author" content="Jonas Egeskov">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Winelingo">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="https://winelingo.app/assets/social-card.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${fontHref}">
<link rel="stylesheet" href="/assets/site.css">
<link rel="stylesheet" href="/assets/quiz.css">
<script type="application/ld+json">${inlineJson(ld)}</script>
${analytics}
</head>
<body>
${header}
<main id="main">
${body}
<script type="application/json" id="quiz-data">${inlineJson(data)}</script>
</main>
${footer}<script src="/assets/quiz.js" defer></script>
</body>
</html>
`;
}

const hero = (crumbs, eyebrow, h1, deck, attrs = "") => `<section class="page-hero"><div class="hero-bg" aria-hidden="true"></div><div class="wrap">
    <nav class="breadcrumb" aria-label="Breadcrumb">${crumbs.map((c, i) => i < crumbs.length - 1 ? `<a href="${c[1]}">${esc(c[0])}</a><span aria-hidden="true">/</span>` : `<span aria-current="page">${esc(c[0])}</span>`).join("")}</nav>
    <p class="eyebrow">${esc(eyebrow)}</p>
    <h1${attrs ? " data-qz-title" : ""}>${esc(h1)}</h1>
    <p class="deck"${attrs ? " data-qz-summary" : ""}>${esc(deck)}</p>
  </div></section>`;

const tests = load();

// Hub
mkdirSync(join(ROOT, "tests"), { recursive: true });
const hubCrumbs = [["Home", "/"], ["Wine tests"]];
writeFileSync(join(ROOT, "tests/index.html"), page({
  path: "/tests/",
  title: "Free Wine Tests for Staff and Wine Lovers | Winelingo",
  desc: "Free wine quizzes on serving, grapes, food pairing, labels, sparkling wine and wine faults. Built for restaurant staff and anyone learning wine. In English, Danish, German and Spanish.",
  crumbs: hubCrumbs,
  body: hero(hubCrumbs, "Free wine tests", "Test what you know about wine",
    "Ten questions each, with a short explanation after every answer. Made for restaurant staff and anyone who wants to learn wine.") +
    `\n<div class="qz-hubwrap" id="quiz"><noscript>Turn on JavaScript to take the tests.</noscript></div>`,
  data: { tests: tests.map((t) => ({ slug: t.slug, level: t.level, ...Object.fromEntries(LANGS.filter((l) => t[l]).map((l) => [l, { title: t[l].title, summary: t[l].summary }])) })) },
}));

// One page per test
for (const t of tests) {
  const crumbs = [["Home", "/"], ["Wine tests", "/tests/"], [t.en.title]];
  mkdirSync(join(ROOT, "tests", t.slug), { recursive: true });
  writeFileSync(join(ROOT, "tests", t.slug, "index.html"), page({
    path: `/tests/${t.slug}/`,
    title: `${t.en.title}: Free Wine Quiz | Winelingo`,
    desc: `${t.en.summary} Ten questions with explanations. Free, no sign-up.`,
    crumbs,
    body: hero(crumbs, "Wine test", t.en.title, t.en.summary, true) +
      `\n<div class="qz-wrap" id="quiz"><noscript>Turn on JavaScript to take the test.</noscript></div>`,
    data: t,
  }));
}

console.log(`Built /tests/ with ${tests.length} tests: ${tests.map((t) => `${t.slug} [${LANGS.filter((l) => t[l]).join(",")}]`).join(", ")}`);

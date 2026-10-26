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
import { createHash } from "node:crypto";

const ROOT = new URL("..", import.meta.url).pathname;
const DATA = join(ROOT, "data/tests");
const LANGS = ["en", "da", "de", "es"];
// The hub groups the tests into three tracks, in this order. A test in no track is not listed.
const TRACKS = [
  { id: "exam-prep", tests: ["wset-level-1-practice", "wset-level-2-mock-exam", "wset-level-3-practice", "introductory-sommelier-practice"] },
  { id: "restaurant-staff", tests: ["serving-wine", "guest-questions", "labels-and-lists", "wine-faults", "after-dinner"] },
  { id: "wine-knowledge", tests: ["white-grapes", "red-grapes", "food-and-wine", "sparkling-wine"] },
];
const ORDER = TRACKS.flatMap((t) => t.tests);

const tpl = readFileSync(join(ROOT, "tools/index.html"), "utf8");
const cut = (s, a, b) => s.slice(s.indexOf(a), s.indexOf(b) + b.length);
const header = cut(tpl, '<a class="skip"', "</header>");
const footer = tpl.slice(tpl.indexOf('<footer class="site-footer"'), tpl.indexOf("</body>"));
const analytics = cut(tpl, "<!-- growth:analytics -->", "<!-- /growth:analytics -->");
const fontHref = tpl.match(/<link rel="stylesheet" href="(https:\/\/fonts\.googleapis\.com[^"]+)"/)[1];

// Version the shared assets by content so browsers pick up a new quiz.js/css at
// once instead of serving a cached copy for up to 10 minutes (GitHub Pages).
const ver = (f) => createHash("sha1").update(readFileSync(join(ROOT, f))).digest("hex").slice(0, 8);
const JS_V = ver("assets/quiz.js"), CSS_V = ver("assets/quiz.css");

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
// JSON inside <script type="application/json">: only "</" can break out.
const inlineJson = (o) => JSON.stringify(o).replace(/<\//g, "<\\/");

function validate(t, file) {
  const errs = [];
  if (!t.slug || !t.title || !t.summary) errs.push("missing slug/title/summary");
  if (![1, 2, 3].includes(t.level)) errs.push("level must be 1-3");
  // A practice exam (one with an `exam` block) may run longer; every other test is ten questions.
  const want = t.exam ? [10, 100] : [10, 10];
  if (!Array.isArray(t.questions) || t.questions.length < want[0] || t.questions.length > want[1])
    errs.push(t.exam ? "an exam needs 10-100 questions" : "needs exactly 10 questions");
  if (t.exam && (!t.exam.body || !t.exam.name)) errs.push("exam needs body and name");
  (t.questions || []).forEach((q, i) => {
    if (!q.q || !q.why) errs.push(`q${i + 1}: missing q/why`);
    if (!Array.isArray(q.opts) || q.opts.length !== 4) errs.push(`q${i + 1}: needs 4 options`);
    if (!Number.isInteger(q.a) || q.a < 0 || q.a > 3) errs.push(`q${i + 1}: bad answer index`);
  });
  // If the right answer is usually the longest option, people can pass by guessing.
  const giveaways = (t.questions || []).filter((q) =>
    Array.isArray(q.opts) && q.opts.every((o, k) => k === q.a || o.length < q.opts[q.a].length)).length;
  const nq = (t.questions || []).length;
  if (giveaways > Math.floor(nq * 0.4)) errs.push(`correct option is the longest in ${giveaways}/${nq} questions (max 40%)`);
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
      if (t.exam) entry.exam = entry.exam ?? t.exam;
      entry[lang] = {
        title: t.title, summary: t.summary,
        questions: t.questions.map(({ q, opts, a, why, deeper, topic }) => ({ q, opts, a, why, deeper, topic })),
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
<link rel="stylesheet" href="/assets/quiz.css?v=${CSS_V}">
<script type="application/ld+json">${inlineJson(ld)}</script>
${analytics}
</head>
<body>
${header}
<main id="main">
${body}
<script type="application/json" id="quiz-data">${inlineJson(data)}</script>
</main>
${footer}<script src="/assets/quiz.js?v=${JS_V}" defer></script>
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

// Hub. Rendered in English as static HTML, so every test is a plain link a crawler can follow;
// quiz.js swaps the words in place when the visitor picks another language.
const minutes = (n) => Math.max(3, Math.round(n * 0.4));
const ICONS = {
  "serving-wine": '<path d="M8 3h8l-.6 6.2a3.4 3.4 0 0 1-6.8 0Z"/><path d="M12 12.6V20M8.5 20h7"/>',
  "guest-questions": '<path d="M4 5h16v10H9l-5 4Z"/><path d="M10 9.2a2 2 0 1 1 2.6 1.9c-.4.2-.6.5-.6.9v.3"/><circle cx="12" cy="13.6" r=".2"/>',
  "labels-and-lists": '<rect x="5" y="3" width="14" height="18" rx="2"/><path d="M8.5 8h7M8.5 12h7M8.5 16h4"/>',
  "wine-faults": '<path d="M12 3 21 19H3Z"/><path d="M12 10v4"/><circle cx="12" cy="16.6" r=".2"/>',
  "after-dinner": '<path d="M7 4h10l-1 7a4 4 0 0 1-8 0Z"/><path d="M12 15v5M9 20h6"/><path d="M8 8h8"/>',
  "white-grapes": '<circle cx="10" cy="9" r="2.4"/><circle cx="14.6" cy="9" r="2.4"/><circle cx="12.3" cy="13" r="2.4"/><circle cx="9.4" cy="16.6" r="2.4"/><circle cx="14" cy="17" r="2.4"/><path d="M12.3 6.6V3.5l2.4-1"/>',
  "red-grapes": '<circle cx="10" cy="9" r="2.4"/><circle cx="14.6" cy="9" r="2.4"/><circle cx="12.3" cy="13" r="2.4"/><circle cx="9.4" cy="16.6" r="2.4"/><circle cx="14" cy="17" r="2.4"/><path d="M12.3 6.6V3.5l2.4-1"/>',
  "food-and-wine": '<circle cx="11" cy="13" r="6.5"/><circle cx="11" cy="13" r="3"/><path d="M20 4v16M20 4c-1.6 1-1.6 4 0 5"/>',
  "sparkling-wine": '<path d="M9 21h6M12 21v-7M8.5 3h7l-.4 6a3.1 3.1 0 0 1-6.2 0Z"/><circle cx="17.5" cy="4.5" r=".9"/><circle cx="19" cy="8" r=".6"/><circle cx="6" cy="6" r=".6"/>',
};
const icon = (slug) => `<svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[slug] || ICONS["serving-wine"]}</svg>`;
const byslug = Object.fromEntries(tests.map((t) => [t.slug, t]));
const TRACK_TEXT = {
  "exam-prep": ["Exam prep", "Prepare for a wine qualification", "Unofficial practice in the style of the WSET and Court of Master Sommeliers exams, with an explanation for every answer. Take a mock against the clock, or learn as you go."],
  "restaurant-staff": ["For restaurant staff", "Train for the floor", "Serving, guest questions, wine lists and faults: what a shift actually asks of you."],
  "wine-knowledge": ["Wine knowledge", "Know your wine", "Grapes, food pairing and sparkling wine, ten questions at a time."],
};
const realLine = (e) => [`${e.questions} questions`, e.minutes ? `${e.minutes} min` : "", e.pass ? `pass ${e.pass}%` : ""].filter(Boolean).join(" · ");
const examCard = (t) => {
  const e = t.exam || {}, n = t.en.questions.length, mock = n >= 40;
  return `<a class="tx-exam${mock ? " is-mock" : ""}" href="/tests/${t.slug}/" data-slug="${t.slug}" aria-label="${esc(t.en.title)}">
        <span class="tx-body">${esc(e.body || "")}</span>
        <h3>${esc((e.name || t.en.title).replace(/ Award in Wines$/, ""))}</h3>
        <span class="tx-kind" data-f="kind">${mock ? "Full mock exam" : "Practice"} · ${n} questions</span>
        ${e.questions ? `<span class="tx-real"><span data-i18n="real">Real exam</span>: <span data-f="real">${esc(realLine(e))}</span></span>` : ""}
        <span class="tx-go"><span data-i18n="start">Start</span> <span aria-hidden="true">→</span><span class="tx-best" data-f="best" hidden></span></span>
      </a>`;
};
const testCard = (t) => `<a class="tx-card" href="/tests/${t.slug}/" data-slug="${t.slug}">
        <span class="tx-ico tx-ico-${t.slug}">${icon(t.slug)}</span>
        <span class="tx-txt"><h3 data-f="title">${esc(t.en.title)}</h3><p data-f="summary">${esc(t.en.summary)}</p>
        <span class="tx-meta"><span data-f="meta">${t.en.questions.length} questions · ${minutes(t.en.questions.length)} min</span><span class="tx-best" data-f="best" hidden></span></span></span>
      </a>`;
// The palate quiz is its own hand-written page (tests/wine-palate-quiz/), not a ten-question test,
// so its card leads the wine-knowledge track without a data-slug (quiz.js leaves it alone).
const palateCard = `<a class="tx-card" href="/tests/wine-palate-quiz/">
        <span class="tx-ico"><svg viewBox="0 0 24 24" width="26" height="26" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M8 3h8l-.6 6.2a3.4 3.4 0 0 1-6.8 0Z"/><path d="M12 12.6V20M8.5 20h7"/><path d="M8.6 7.4h6.8"/></svg></span>
        <span class="tx-txt"><h3>What wine will I like?</h3><p>The palate quiz: eight questions about coffee, chocolate, lemons and more, no wine knowledge needed. Get the white and red styles you are most likely to enjoy.</p>
        <span class="tx-meta"><span>8 questions · 2 min</span></span></span>
      </a>`;
const trackHtml = (tr) => {
  const list = tr.tests.map((s) => byslug[s]).filter(Boolean);
  if (!list.length) return "";
  const [eb, h2, p] = TRACK_TEXT[tr.id], prep = tr.id === "exam-prep";
  return `<section class="tx-track${prep ? " tx-prep" : ""}" id="${tr.id}" aria-labelledby="${tr.id}-h">
  <div class="wrap">
    <div class="tx-head"><p class="eyebrow" data-i18n="${tr.id}-eb">${eb}</p><h2 id="${tr.id}-h" data-i18n="${tr.id}-h">${h2}</h2><p data-i18n="${tr.id}-p">${p}</p></div>
    <div class="${prep ? "tx-exams" : "tx-grid"}">
      ${tr.id === "wine-knowledge" ? palateCard + "\n      " : ""}${list.map(prep ? examCard : testCard).join("\n      ")}
    </div>${prep ? `\n    <p class="tx-note" data-i18n="disclaimer">Unofficial practice questions written by Winelingo. Not affiliated with or endorsed by WSET or the Court of Master Sommeliers.</p>` : ""}
  </div>
</section>`;
};
const listed = TRACKS.flatMap((t) => t.tests).filter((s) => byslug[s]).length;

mkdirSync(join(ROOT, "tests"), { recursive: true });
const hubCrumbs = [["Home", "/"], ["Wine tests"]];
writeFileSync(join(ROOT, "tests/index.html"), page({
  path: "/tests/",
  title: "Wine Quiz and WSET & Sommelier Practice Tests | Winelingo",
  desc: "Free wine quizzes and unofficial practice tests for WSET Levels 1-3 and the Introductory Sommelier exam, plus training for restaurant staff. Every answer explained.",
  crumbs: hubCrumbs,
  body: hero(hubCrumbs, "Free wine quizzes", "Wine Quizzes and Sommelier Practice Tests",
    `${listed} free tests with an explanation after every answer: practice for WSET and sommelier exams, training for restaurant staff, and wine knowledge for everyone.`, true)
      .replace("</p>\n  </div></section>", `</p>
    <nav class="tx-jump" aria-label="Test tracks">${TRACKS.filter((t) => t.tests.some((s) => byslug[s])).map((t) => `<a href="#${t.id}" data-i18n="${t.id}-eb">${TRACK_TEXT[t.id][0]}</a>`).join("")}</nav>
    <div class="tx-langs" data-qz-langs></div>
  </div></section>`) +
    `\n<div class="tx-hub" id="quiz">\n${TRACKS.map(trackHtml).join("\n")}\n</div>` +
    `\n<p class="qz-biz" style="max-width:var(--maxw-prose);margin:8px auto 64px;padding:0 24px;text-align:center;color:var(--sec);font-size:16px">Training a restaurant team? <a href="/business/" style="font-weight:600">See how Winelingo works for staff</a>, including a test built on your own wine list.</p>`,
  data: { tests: tests.map((t) => ({ slug: t.slug, level: t.level, n: t.en.questions.length, exam: t.exam, ...Object.fromEntries(LANGS.filter((l) => t[l]).map((l) => [l, { title: t[l].title, summary: t[l].summary }])) })) },
}));

// One page per test
for (const t of tests) {
  const crumbs = [["Home", "/"], ["Wine tests", "/tests/"], [t.en.title]];
  mkdirSync(join(ROOT, "tests", t.slug), { recursive: true });
  writeFileSync(join(ROOT, "tests", t.slug, "index.html"), page({
    path: `/tests/${t.slug}/`,
    // Exam practice titles already say what they are ("…: 50 free practice questions").
    title: t.exam ? `${t.en.title} | Winelingo` : `${t.en.title}: Free Wine Quiz | Winelingo`,
    desc: t.exam ? `${t.en.summary} Every answer explained. Free, no sign-up.` : `${t.en.summary} Ten questions with explanations. Free, no sign-up.`,
    crumbs,
    body: hero(crumbs, t.exam ? "Exam practice" : "Wine test", t.en.title, t.en.summary, true) +
      `\n<div class="qz-wrap" id="quiz"><noscript>Turn on JavaScript to take the test.</noscript></div>`,
    data: t,
  }));
}

console.log(`Built /tests/ with ${tests.length} tests: ${tests.map((t) => `${t.slug} [${LANGS.filter((l) => t[l]).join(",")}]`).join(", ")}`);

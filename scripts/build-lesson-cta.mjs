#!/usr/bin/env node
// Put a topic-matched "free lesson" card on the pages listed in data/lesson-cta.json.
//
//   node scripts/build-lesson-cta.mjs
//
// The card offers one lesson from a free unit (the first two of the course) two ways: in the iPhone app (App Store)
// and in the browser (/course/?app=1&lesson=<id>, which opens that lesson after sign-in).
// assets/lesson-cta.js puts the right one first for the device and records the clicks in Umami.
// Lesson titles and summaries come from data/course/syllabus.json, so a course re-export keeps
// the cards in step. Re-running replaces each card between its markers.
//
// Run it after anything that regenerates a listed page (build-tests.mjs, build-glossary.mjs).
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const cfg = JSON.parse(readFileSync(join(ROOT, "data/lesson-cta.json"), "utf8"));
const lessons = JSON.parse(readFileSync(join(ROOT, "data/course/syllabus.json"), "utf8"));
// The units that are free on the web (FREE_TOPICS in assets/course/course.js).
const FREE_UNITS = ["Foundations", "Tasting & senses"];
const APP_ID = "6785896824";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const pageSlug = (file) => file.replace(/\/?index\.html$/, "").replace(/\//g, "-") || "home";
// App Store link. With a provider token (App Store Connect → App Analytics → Campaigns) the
// campaign token ct= shows downloads per page in App Analytics; without one Apple ignores ct=,
// so the plain link is used.
const appLink = (slug) => cfg.appStorePt
  ? `https://apps.apple.com/app/apple-store/id${APP_ID}?pt=${encodeURIComponent(cfg.appStorePt)}&ct=${encodeURIComponent("seo-" + slug)}&mt=8`
  : `https://apps.apple.com/app/id${APP_ID}`;

const START = "<!-- lesson-cta (scripts/build-lesson-cta.mjs) -->";
const END = "<!-- /lesson-cta -->";
const SCRIPT = '<script src="/assets/lesson-cta.js" defer></script>';

// A test that fits the page, named under the lesson: "Or test yourself: Red grapes · 10 questions".
const testTitle = (slug) => {
  const f = join(ROOT, "data/tests/en", slug + ".json");
  if (!existsSync(f)) throw new Error(`test ${slug} not found in data/tests/en`);
  const t = JSON.parse(readFileSync(f, "utf8"));
  return [t.title, t.questions.length];
};
// `test` is a slug, or {"text found in the page": slug, ..., "*": fallback}.
const pickTest = (test, html) => {
  if (!test || typeof test === "string") return test;
  const hit = Object.keys(test).find((k) => k !== "*" && html.includes(k));
  return test[hit] || test["*"];
};

function place(file, c, html) {
  const l = lessons.find((x) => x.id === c.lesson);
  if (!l) throw new Error(`${file}: lesson ${c.lesson} not in syllabus.json`);
  if (!FREE_UNITS.includes(l.unit)) throw new Error(`${file}: lesson "${l.t}" is not in a free unit, so the browser link would hit the paywall`);
  const slug = pageSlug(file);
  // ?try= plays the lesson at once with no account (course.js try mode); a signed-in visitor gets it the normal way.
  const web = `/course/?try=${l.id}&amp;src=${slug}`;
  const test = pickTest(c.test, html);
  const testLine = test ? (([t, n]) => `\n  <p class="lc-test">Or test yourself: <a href="/tests/${test}/" data-cta="lesson-test">${esc(t)}</a> · ${n} questions, free</p>`)(testTitle(test)) : "";
  const card = `${START}
<aside class="lesson-cta" data-lesson="${l.id}" aria-label="Free lesson" data-pagefind-ignore="all">
  <p class="eyebrow">Free lesson · about 5 minutes</p>
  <p class="lc-t">${esc(l.t)}</p>
  <p class="lc-s">${esc(c.hook)}</p>
  <div class="lc-btns">
    <a class="btn btn-primary lc-app" data-cta="lesson-app" href="${appLink(slug)}">Take it in the iPhone app</a>
    <a class="btn btn-ghost lc-web" data-cta="lesson-web" href="${web}">Take it in your browser</a>
  </div>
  <p class="lc-fine">No account needed to try it in your browser. The app is free to download, with Premium for unlimited scans.</p>${testLine}
</aside>
${END}
`;
  html = html.replace(new RegExp(`${START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${END}\\n?`), "");
  const anchors = [].concat(c.before);
  const anchor = anchors.find((x) => html.includes(x));
  if (!anchor) throw new Error(`${file}: none of the anchors found: ${anchors.join(" | ")}`);
  const at = html.indexOf(anchor);
  html = html.slice(0, at) + card + html.slice(at);
  if (!html.includes(SCRIPT)) html = html.replace("</body>", `${SCRIPT}\n</body>`);
  if (c.band) {
    const re = /(<div class="appband"[\s\S]*?<div class="ic">[\s\S]*?<div>)<h3>[^<]*<\/h3><p>[^<]*<\/p>/;
    if (!re.test(html)) throw new Error(`${file}: app band not found`);
    html = html.replace(re, `$1<h3>${esc(c.band[0])}</h3><p>${esc(c.band[1])}</p>`);
  }
  return html;
}

let n = 0;
for (const [file, c] of Object.entries(cfg.pages)) {
  writeFileSync(join(ROOT, file), place(file, c, readFileSync(join(ROOT, file), "utf8")));
  n++;
}

// Whole sections: every page under a folder gets the section's lesson and test, unless it has
// its own entry in `pages`. The card goes before the first anchor the page has.
const walk = (dir) => readdirSync(join(ROOT, dir), { withFileTypes: true }).flatMap((e) =>
  e.isDirectory() ? walk(join(dir, e.name)) : e.name === "index.html" ? [join(dir, e.name)] : []);
let m = 0;
for (const [dir, c] of Object.entries(cfg.sections || {})) {
  for (const file of walk(dir)) {
    if (cfg.pages[file]) continue;
    const html = readFileSync(join(ROOT, file), "utf8");
    if (![].concat(cfg.anchors).some((x) => html.includes(x))) continue;  // a page without the usual layout
    writeFileSync(join(ROOT, file), place(file, { before: cfg.anchors, ...c }, html));
    m++;
  }
}
n += m;
console.log(`Lesson cards on ${n} pages`);

// Builds the public, indexable pages of the online course (2026-10-11, "SEO for the course"):
//
//   /course/                     landing page (EN) + the course app itself (one page, two modes)
//   /course/<unit>/              26 unit pages (EN)
//   /da/vinkursus/               landing page (DA)
//   /da/vinkursus/<enhed>/       26 unit pages (DA)
//
// Before this, /course/ was a login screen: Google saw a title and nothing else. Now every unit's
// lessons, summaries and outcomes are plain HTML with Course markup, and the app only takes over
// for someone who is signed in or clicks "Start".
//
// Source: data/course/syllabus.json (Course 2.0 titles, summaries and outcomes, EN + DA, exported
// from the lessons table) and the unit names in assets/course/strings.js. Page chrome (head bits,
// header, footer) comes from pricing/index.html so it stays identical to the rest of the site.
//
//   node scripts/build-course-pages.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => readFileSync(join(ROOT, p), "utf8");
const write = (p, s) => { mkdirSync(dirname(join(ROOT, p)), { recursive: true }); writeFileSync(join(ROOT, p), s); };
const SITE = "https://winelingo.app";

const SYL = JSON.parse(read("data/course/syllabus.json"));
const ctx = { window: {} };
vm.runInNewContext(read("assets/course/strings.js"), ctx);
const STR = ctx.window.WL_STRINGS;

// ---- page chrome from an existing page -------------------------------------------------------
const shell = read("pricing/index.html");
const cut = (a, b) => shell.slice(shell.indexOf(a), shell.indexOf(b) + b.length);
const ANALYTICS = cut("<!-- growth:analytics -->", "<!-- /visit-counter -->");
const HEADER = shell.slice(shell.indexOf("<body>") + 6, shell.indexOf('<main id="main">'));
const FOOTER = shell.slice(shell.indexOf("</main>") + 7);
const FONTS = cut('<link rel="preconnect" href="https://fonts.googleapis.com">', '<link rel="stylesheet" href="/assets/site.css">');

// ---- the units, in course order -----------------------------------------------------------------
// [topic in the DB, strings key, EN slug, DA slug, cover image, group, EN heading, DA heading, related EN pages]
const U = [
  ["Tasting & senses", "tastingSenses", "wine-tasting", "smag-og-sanser", "uTasting", 0, "Wine Tasting Course: How to Taste Wine", "Lær at smage vin", ["/learn/how-to-taste-wine/", "/learn/how-to-practise-wine-tasting-at-home/"]],
  ["Red grapes to know", "redGrapes", "red-wine-grapes", "roede-druer", "uRedGrapes", 0, "Red Wine Grapes Course", "Kursus i røde druer", ["/grape-varieties/"]],
  ["White grapes to know", "whiteGrapes", "white-wine-grapes", "hvide-druer", "uWhiteGrapes", 0, "White Wine Grapes Course", "Kursus i hvide druer", ["/grape-varieties/"]],
  ["Serving & glassware", "servingGlassware", "serving-wine", "servering-af-vin", "uServing", 0, "Serving Wine: Glasses, Decanting and Storing", "Servering af vin: glas, karaffel og opbevaring", ["/tools/wine-serving-temperature/", "/learn/how-long-does-open-wine-last/"]],
  ["Food & wine", "foodWine", "food-and-wine-pairing", "mad-og-vin", "pairing", 0, "Food and Wine Pairing Course", "Kursus i mad og vin", ["/food-and-wine-pairing/"]],
  ["Reading the label", "readingLabel", "reading-wine-labels", "vinetiketter", "uLabel", 0, "How to Read a Wine Label: Course", "Lær at læse en vinetiket", ["/learn/how-to-read-a-wine-label/"]],
  ["France", "france", "french-wine", "fransk-vin", "uFrance", 1, "French Wine Course", "Kursus i fransk vin", ["/countries/france/"]],
  ["Italy", "italy", "italian-wine", "italiensk-vin", "uItaly", 1, "Italian Wine Course", "Kursus i italiensk vin", ["/countries/italy/"]],
  ["Spain", "spain", "spanish-wine", "spansk-vin", "uSpain", 1, "Spanish Wine Course", "Kursus i spansk vin", ["/countries/spain/"]],
  ["Portugal", "portugal", "portuguese-wine", "portugisisk-vin", "uPortugal", 1, "Portuguese Wine Course", "Kursus i portugisisk vin", ["/countries/portugal/"]],
  ["Germany", "germany", "german-wine", "tysk-vin", "uGermany", 1, "German Wine Course", "Kursus i tysk vin", ["/countries/germany/"]],
  ["Austria", "austria", "austrian-wine", "oestrigsk-vin", "uAustria", 1, "Austrian Wine Course", "Kursus i østrigsk vin", ["/countries/austria/"]],
  ["USA", "usa", "american-wine", "amerikansk-vin", "uUSA", 1, "American Wine Course", "Kursus i amerikansk vin", ["/countries/united-states/"]],
  ["Argentina", "argentina", "argentinian-wine", "argentinsk-vin", "uArgentina", 1, "Argentinian Wine Course", "Kursus i argentinsk vin", ["/countries/argentina/"]],
  ["Chile", "chile", "chilean-wine", "chilensk-vin", "uChile", 1, "Chilean Wine Course", "Kursus i chilensk vin", ["/countries/chile/"]],
  ["Australia", "australia", "australian-wine", "australsk-vin", "uAustralia", 1, "Australian Wine Course", "Kursus i australsk vin", ["/countries/australia/"]],
  ["New Zealand", "newzealand", "new-zealand-wine", "newzealandsk-vin", "uNewZealand", 1, "New Zealand Wine Course", "Kursus i newzealandsk vin", ["/countries/new-zealand/"]],
  ["South Africa", "southafrica", "south-african-wine", "sydafrikansk-vin", "uSouthAfrica", 1, "South African Wine Course", "Kursus i sydafrikansk vin", ["/countries/south-africa/"]],
  ["In the vineyard", "inVineyard", "in-the-vineyard", "i-vinmarken", "uVineyard", 2, "In the Vineyard: How Wine Grapes Are Grown", "I vinmarken: sådan dyrkes druerne", ["/learn/how-wine-is-made/"]],
  ["How wine is made", "howMade", "how-wine-is-made", "saadan-laves-vin", "uWinemaking", 2, "How Wine Is Made: Winemaking Course", "Sådan laves vin", ["/learn/how-wine-is-made/"]],
  ["Terroir & vintages", "terroirVintages", "terroir-and-vintages", "terroir-og-aargange", "uTerroir", 2, "Terroir and Vintages Course", "Terroir og årgange", ["/wine-regions/"]],
  ["Quality, ageing & collecting", "qualityAgeing", "wine-ageing-and-collecting", "kvalitet-og-lagring", "uCellar", 2, "Wine Quality, Ageing and Collecting", "Kvalitet, lagring og vinsamling", ["/learn/wine-faults/"]],
  ["Buying & value", "buyingValue", "buying-wine", "koeb-af-vin", "uShop", 2, "How to Buy Wine: Choosing Bottles and Value", "Køb af vin: find god værdi", ["/learn/types-of-wine/"]],
  ["Wine at the table", "atTable", "wine-etiquette", "vin-ved-bordet", "uToast", 2, "Wine at the Table: Restaurants and Etiquette", "Vin ved bordet: restaurant, etikette og gaver", ["/learn/how-to-order-wine-at-a-restaurant/"]],
  ["Wine, health & moderation", "healthModeration", "wine-and-health", "vin-og-sundhed", "uModeration", 2, "Wine, Health and Moderation", "Vin, sundhed og måde", ["/learn/how-many-units-in-a-bottle-of-wine/", "/tools/wine-calories/"]],
  ["A short history of wine", "history", "history-of-wine", "vinens-historie", "uHistory", 2, "A Short History of Wine", "Vinens historie", ["/wine-classifications/"]],
].map((r, i) => ({ topic: r[0], key: r[1], en: r[2], da: r[3], img: r[4], group: r[5], h1: { en: r[6], da: r[7] }, related: r[8], n: i + 1 }));
const FREE = "Tasting & senses";
const SHORT = { "serving-wine": ["Serving Wine Course", "Kursus i servering af vin"], "reading-wine-labels": ["Wine Label Course", "Kursus i vinetiketter"],
  "in-the-vineyard": ["Vineyard Course", "Kursus i vinmarken"], "how-wine-is-made": ["Winemaking Course", "Kursus i vinfremstilling"],
  "wine-ageing-and-collecting": ["Wine Ageing & Collecting Course", "Kursus i lagring af vin"], "buying-wine": ["How to Buy Wine Course", "Kursus i køb af vin"],
  "wine-etiquette": ["Wine Etiquette Course", "Kursus i vin ved bordet"], "wine-and-health": ["Wine & Health Course", "Kursus i vin og sundhed"],
  "history-of-wine": ["History of Wine Course", "Kursus i vinens historie"], "terroir-and-vintages": ["Terroir & Vintages Course", "Kursus i terroir og årgange"],
  "wine-tasting": ["Wine Tasting Course", "Vinsmagningskursus"], "food-and-wine-pairing": ["Food & Wine Pairing Course", "Kursus i mad og vin"] };
const shortT = (u, lang) => (SHORT[u.en] ? SHORT[u.en][lang === "en" ? 0 : 1] : u.h1[lang]);

const minutes = (l) => Math.max(2, Math.round(l.n * 0.45));
for (const u of U) {
  u.lessons = SYL.filter((l) => l.unit === u.topic).sort((a, b) => a.s - b.s);
  if (!u.lessons.length) throw new Error(`no lessons for ${u.topic}`);
  u.min = u.lessons.reduce((a, l) => a + minutes(l), 0);
  for (const p of u.related) if (!existsSync(join(ROOT, p, "index.html"))) throw new Error(`related page missing: ${p}`);
}
const TOTAL_LESSONS = SYL.length, TOTAL_MIN = U.reduce((a, u) => a + u.min, 0), HOURS = Math.round(TOTAL_MIN / 60);
if (TOTAL_LESSONS !== U.reduce((a, u) => a + u.lessons.length, 0)) throw new Error("lessons outside the 26 units");

const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const name = (u, lang) => STR[lang].lessonTopics[u.key];
const sub = (u, lang) => STR[lang].lessonTopics[u.key + "Sub"];
const L = (l, lang) => (lang === "en" ? l : { ...l, t: l.da.t, sum: l.da.sum, out: l.da.out });
const unitUrl = (u, lang) => (lang === "en" ? `/course/${u.en}/` : `/da/vinkursus/${u.da}/`);
const hubUrl = (lang) => (lang === "en" ? "/course/" : "/da/vinkursus/");
const appUrl = (lang) => (lang === "en" ? "/course/?app=1" : "/course/?app=1&lang=da");
const PROVIDER = { "@type": "Organization", name: "Winelingo", url: `${SITE}/`, logo: `${SITE}/assets/icon-512.png` };

// ---- copy -------------------------------------------------------------------------------------
const T = {
  en: {
    groups: ["Foundations", "The wine countries", "Going deeper"],
    groupSub: ["How to taste, the grapes that matter, serving, food and labels.", "Twelve countries, region by region, with the grapes and the words on the label.", "Vineyard, winemaking, terroir, quality, buying, the table, health and history."],
    lessons: (n) => `${n} lessons`, about: (m) => `about ${m} min`, free: "Free", unit: (n) => `Unit ${n} of 26`,
    learn: "You will be able to", start: "Start this unit free", startFree: "Start with the free unit",
    unlockLine: "This unit is included with Premium ($3.99 a month, 3 days free) or the course for life ($39.99 once).",
    seePrices: "See prices", related: "Related reading on Winelingo", prev: "Previous unit", next: "Next unit",
    crumbHome: "Home", crumbCourse: "Online wine course", partOf: "Part of Winelingo's online wine course",
    unitDesc: (u, h, d) => `${h} online: ${u.lessons.length} short, interactive lessons. ${d} Start free with Winelingo.`,
    allUnits: "See all 26 units",
  },
  da: {
    groups: ["Grundlaget", "Vinlandene", "Et spadestik dybere"],
    groupSub: ["Sådan smager du, de druer der betyder noget, servering, mad og etiketter.", "Tolv lande, region for region, med druerne og ordene på etiketten.", "Vinmarken, vinfremstilling, terroir, kvalitet, indkøb, bordet, sundhed og historie."],
    lessons: (n) => `${n} lektioner`, about: (m) => `cirka ${m} min.`, free: "Gratis", unit: (n) => `Enhed ${n} af 26`,
    learn: "Du lærer at", start: "Start enheden gratis", startFree: "Start med den gratis enhed",
    unlockLine: "Enheden er inkluderet i Premium ($3.99 om måneden, 3 dage gratis) eller kurset for altid ($39.99 én gang).",
    seePrices: "Se priser", related: "Læs mere på Winelingo (engelsk)", prev: "Forrige enhed", next: "Næste enhed",
    crumbHome: "Forside", crumbCourse: "Vinkursus online", partOf: "En del af Winelingos vinkursus online",
    unitDesc: (u, h, d) => `${h} online: ${u.lessons.length} korte, interaktive lektioner. ${d} Start gratis med Winelingo.`,
    allUnits: "Se alle 26 enheder",
  },
};

// ---- head -------------------------------------------------------------------------------------
function head({ lang, title, desc, path, alt, ld, extraHead = "" }) {
  const altLinks = alt ? `<link rel="alternate" hreflang="en" href="${SITE}${alt.en}">\n<link rel="alternate" hreflang="da" href="${SITE}${alt.da}">\n<link rel="alternate" hreflang="x-default" href="${SITE}${alt.en}">\n` : "";
  return `<!doctype html>
<html lang="${lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="apple-itunes-app" content="app-id=6785896824">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="canonical" href="${SITE}${path}">
${altLinks}<meta property="og:type" content="website">
<meta property="og:site_name" content="Winelingo">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(desc)}">
<meta property="og:url" content="${SITE}${path}">
<meta property="og:image" content="${SITE}/assets/social-card.png">
<meta property="og:locale" content="${lang === "da" ? "da_DK" : "en"}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#7b1e3b">
<meta name="color-scheme" content="light">
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/assets/favicon-16.png">
<link rel="apple-touch-icon" href="/assets/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="author" content="Jonas Egeskov">
${FONTS}
<link rel="stylesheet" href="/assets/course/landing.css?v=2">
${extraHead}<script type="application/ld+json">${JSON.stringify(ld)}</script>
${ANALYTICS}
</head>
<body>`;
}
const crumbsLd = (items) => ({ "@type": "BreadcrumbList", itemListElement: items.map(([n, p], i) => ({ "@type": "ListItem", position: i + 1, name: n, ...(p ? { item: SITE + p } : {}) })) });
const crumbsHtml = (items) => `<nav class="breadcrumb" aria-label="Breadcrumb">${items.map(([n, p], i) => (i < items.length - 1 ? `<a href="${p}">${esc(n)}</a><span aria-hidden="true">/</span>` : `<span aria-current="page">${esc(n)}</span>`)).join("")}</nav>`;

// ---- unit page --------------------------------------------------------------------------------
function unitPage(u, lang) {
  const t = T[lang], h1 = u.h1[lang], free = u.topic === FREE;
  const path = unitUrl(u, lang);
  const title = `${shortT(u, lang)} ${lang === "en" ? "Online" : "online"} | Winelingo`;
  const desc = t.unitDesc(u, shortT(u, lang), sub(u, lang) + ".");
  const crumbs = [[t.crumbHome, lang === "en" ? "/" : "/"], [t.crumbCourse, hubUrl(lang)], [name(u, lang), path]];
  const ls = u.lessons.map((l) => L(l, lang));
  const ld = { "@context": "https://schema.org", "@graph": [
    crumbsLd(crumbs),
    { "@type": "Course", "@id": `${SITE}${path}#course`, name: h1, description: desc, url: SITE + path, inLanguage: lang,
      provider: PROVIDER, isAccessibleForFree: free, isPartOf: { "@type": "Course", name: lang === "en" ? "Winelingo Online Wine Course" : "Winelingo vinkursus online", url: SITE + hubUrl(lang) },
      teaches: ls.flatMap((l) => l.out).slice(0, 12),
      hasCourseInstance: { "@type": "CourseInstance", courseMode: "Online", courseWorkload: `PT${u.min}M` },
      syllabusSections: ls.map((l) => ({ "@type": "Syllabus", name: l.t, description: l.sum })),
      offers: free ? [{ "@type": "Offer", price: "0", priceCurrency: "USD", category: "Free", url: SITE + path }]
        : [{ "@type": "Offer", price: "3.99", priceCurrency: "USD", category: "Subscription", url: `${SITE}/pricing/` }, { "@type": "Offer", price: "39.99", priceCurrency: "USD", category: "Paid", url: `${SITE}/pricing/` }] },
  ] };
  const i = U.indexOf(u), prev = U[i - 1], next = U[i + 1];
  const lessonsHtml = ls.map((l, k) => `
      <li class="cl-lesson">
        <span class="cl-num" aria-hidden="true">${k + 1}</span>
        <div class="cl-lbody">
          <h3>${esc(l.t)}</h3>
          <p class="cl-sum">${esc(l.sum)}</p>
          <p class="cl-learn">${t.learn}:</p>
          <ul>${l.out.map((o) => `<li>${esc(o.charAt(0).toLowerCase() + o.slice(1))}</li>`).join("")}</ul>
          <span class="cl-min">${t.about(minutes(u.lessons[k]))}</span>
        </div>
      </li>`).join("");
  const rel = u.related.map((p) => `<a href="${p}">${esc(relName(p))}</a>`).join(" · ");
  const body = `
<main id="main" class="cl">
<section class="page-hero cl-hero"><div class="hero-bg" aria-hidden="true"></div><div class="wrap">
  ${crumbsHtml(crumbs)}
  <p class="eyebrow">${t.unit(u.n)} · ${esc(t.crumbCourse)}</p>
  <h1>${esc(h1)}</h1>
  <p class="deck">${esc(sub(u, lang))}. ${t.lessons(u.lessons.length)} · ${t.about(u.min)}${free ? ` · <strong>${t.free}</strong>` : ""}</p>
  <div class="cl-cta">
    <a class="btn btn-primary btn-lg" href="${appUrl(lang)}">${free ? t.start : t.startFree}</a>
    ${free ? "" : `<a class="btn btn-ghost btn-lg" href="/pricing/">${t.seePrices}</a>`}
  </div>
  ${free ? "" : `<p class="cl-unlock">${t.unlockLine}</p>`}
</div>
<img class="cl-cover" src="/assets/course/img/${u.img}.webp" alt="" width="1000" height="563" loading="eager">
</section>

<section class="section cl-sec"><div class="wrap cl-narrow">
  <h2 class="cl-h2">${lang === "en" ? `The ${u.lessons.length} lessons` : `De ${u.lessons.length} lektioner`}</h2>
  <ol class="cl-lessons">${lessonsHtml}
  </ol>
  <p class="cl-rel"><strong>${t.related}:</strong> ${rel}</p>
  <nav class="cl-pager">
    ${prev ? `<a href="${unitUrl(prev, lang)}">← ${t.prev}: ${esc(name(prev, lang))}</a>` : "<span></span>"}
    <a href="${hubUrl(lang)}#syllabus">${t.allUnits}</a>
    ${next ? `<a href="${unitUrl(next, lang)}">${t.next}: ${esc(name(next, lang))} →</a>` : "<span></span>"}
  </nav>
</div></section>
</main>`;
  return head({ lang, title, desc, path, alt: { en: unitUrl(u, "en"), da: unitUrl(u, "da") }, ld }) + HEADER + body + FOOTER;
}
function relName(p) {
  const f = read(p.replace(/^\//, "") + "index.html");
  const m = f.match(/<h1[^>]*>([\s\S]*?)<\/h1>/);
  return (m ? m[1] : p).replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
}

// ---- landing ----------------------------------------------------------------------------------
const H = {
  en: {
    title: `Online Wine Course for Beginners: ${TOTAL_LESSONS} Lessons | Winelingo`,
    desc: `Learn about wine online: ${TOTAL_LESSONS} short, interactive lessons in 26 units, from tasting and grapes to twelve wine countries. First unit free.`,
    eyebrow: "Online wine course", h1: "Learn about wine online, five minutes at a time",
    deck: `${TOTAL_LESSONS} short, interactive lessons in 26 units: how to taste, the grapes that matter, food and wine, labels, and twelve wine countries region by region. Start free in your browser or on iPhone.`,
    ctaStart: "Start the free unit", ctaSyl: "See the syllabus", signIn: "Already have an account? Sign in",
    facts: [[String(TOTAL_LESSONS), "interactive lessons"], ["26", "units"], [`~${HOURS} h`, "at your own pace"], ["4", "languages"], ["1st unit", "free"]],
    howH: "How the course works", how: [
      ["Short, interactive lessons", "Each lesson is a handful of illustrated cards and quick questions. A wrong answer comes back at the end, so it sticks."],
      ["Five minutes a day", "Set a daily goal, keep a streak, and pick up where you left off on any device."],
      ["Practical from day one", "Taste, read a label, order in a restaurant and pair food: the course starts with the bottle in front of you."],
      ["Web and iPhone, one account", "Take it in your browser on any computer or phone, or in the Winelingo app. Your progress follows you."]],
    forH: "Who it is for", for: [
      ["Curious beginners", `No wine words needed. Every term is explained the first time it appears. New to all this? Read <a href="/learn/how-to-learn-about-wine/">how to learn about wine</a>.`],
      ["Wine lovers who want structure", "Go from scattered facts to a clear map of grapes, regions and styles."],
      ["Restaurant and bar staff", `Train the whole team, with staff tests and a test built on your own wine list. <a href="/business/">Winelingo for business</a>.`],
      ["Before a wine certificate", "A friendly way to learn the ground a WSET Level 1 or 2 course covers. Winelingo itself is not an accredited qualification."]],
    sylH: "The syllabus", sylDeck: "Every unit, every lesson. Open a unit to see what each lesson teaches.",
    priceH: "Price", priceDeck: `The first unit is free. Unlock all ${TOTAL_LESSONS} lessons with Premium at $3.99 a month (3 days free) or buy the course for life for $39.99 once. Refunds within 14 days.`,
    priceCta: "See all prices",
    faqH: "Questions about the course", faq: [
      ["Is the wine course free?", `The first unit, Tasting & senses (10 lessons), is free on the web. The other 25 units are included with Premium ($3.99 a month, 3 days free) or the course for life ($39.99 once). In the iPhone app every lesson is open, with five hearts that refill over time.`],
      ["How long does the course take?", `About ${HOURS} hours in total. Lessons take five to ten minutes each, so most people do one or two a day.`],
      ["Do I get a certificate?", "No. Winelingo tracks your progress, streaks and test scores, but it is not an accredited qualification. It is a friendly way to learn the basics before a WSET course."],
      ["Do I need an iPhone?", "No. The whole course runs in your browser on any computer, tablet or Android phone. The iPhone app uses the same account."],
      ["Which languages?", "English, Danish, Spanish and German. You can switch at any time."],
      ["Can I use it to train staff?", `Yes. Restaurants and wine bars already use it for their teams. See <a href="/business/">Winelingo for business</a>.`]],
    endH: "Your first lesson takes five minutes", endCta: "Start the free unit",
  },
  da: {
    title: `Vinkursus online for begyndere: ${TOTAL_LESSONS} lektioner | Winelingo`,
    desc: `Lær om vin online: ${TOTAL_LESSONS} korte, interaktive lektioner i 26 enheder, fra smagning og druer til tolv vinlande. Første enhed er gratis.`,
    eyebrow: "Vinkursus online", h1: "Lær om vin online, fem minutter ad gangen",
    deck: `${TOTAL_LESSONS} korte, interaktive lektioner i 26 enheder: sådan smager du, de druer der betyder noget, mad og vin, etiketter og tolv vinlande region for region. Start gratis i din browser eller på iPhone.`,
    ctaStart: "Start den gratis enhed", ctaSyl: "Se hele pensum", signIn: "Har du allerede en konto? Log ind",
    facts: [[String(TOTAL_LESSONS), "interaktive lektioner"], ["26", "enheder"], [`~${HOURS} t`, "i dit eget tempo"], ["4", "sprog"], ["1. enhed", "gratis"]],
    howH: "Sådan fungerer kurset", how: [
      ["Korte, interaktive lektioner", "Hver lektion er en håndfuld illustrerede kort og hurtige spørgsmål. Et forkert svar kommer igen til sidst, så det sidder fast."],
      ["Fem minutter om dagen", "Sæt et dagligt mål, hold din stime i gang, og fortsæt hvor du slap, på alle dine enheder."],
      ["Praktisk fra første dag", "Smag, læs en etiket, bestil på restaurant og vælg vin til maden: kurset starter med flasken foran dig."],
      ["Web og iPhone, én konto", "Tag kurset i browseren på computer eller telefon, eller i Winelingo-appen. Dine fremskridt følger med."]],
    forH: "Hvem er kurset til", for: [
      ["Nysgerrige begyndere", "Du behøver ikke kende vinord. Hvert begreb forklares første gang, det dukker op."],
      ["Vinelskere, der vil have overblik", "Gå fra spredte fakta til et klart kort over druer, regioner og stilarter."],
      ["Tjenere og bartendere", `Oplær hele holdet med personaletests og en test bygget på jeres eget vinkort. <a href="/business/">Winelingo til virksomheder</a>.`],
      ["Før et vinbevis", "En venlig måde at lære det stof, et WSET Level 1- eller 2-kursus dækker. Winelingo er ikke selv en godkendt uddannelse."]],
    sylH: "Pensum", sylDeck: "Alle enheder og alle lektioner. Åbn en enhed for at se, hvad hver lektion lærer dig.",
    priceH: "Pris", priceDeck: `Den første enhed er gratis. Lås alle ${TOTAL_LESSONS} lektioner op med Premium til $3.99 om måneden (3 dage gratis), eller køb kurset for altid for $39.99 én gang. Pengene tilbage inden for 14 dage.`,
    priceCta: "Se alle priser",
    faqH: "Spørgsmål om kurset", faq: [
      ["Er vinkurset gratis?", `Den første enhed, Smag & sanser (10 lektioner), er gratis på nettet. De øvrige 25 enheder er inkluderet i Premium ($3.99 om måneden, 3 dage gratis) eller kurset for altid ($39.99 én gang). I iPhone-appen er alle lektioner åbne, med fem hjerter der fyldes op igen med tiden.`],
      ["Hvor lang tid tager kurset?", `Cirka ${HOURS} timer i alt. En lektion tager fem til ti minutter, så de fleste tager en eller to om dagen.`],
      ["Får jeg et bevis?", "Nej. Winelingo holder styr på dine fremskridt, stimer og testresultater, men det er ikke en godkendt uddannelse. Det er en venlig måde at lære det grundlæggende på før et WSET-kursus."],
      ["Skal jeg have en iPhone?", "Nej. Hele kurset kører i browseren på computer, tablet og Android-telefon. iPhone-appen bruger den samme konto."],
      ["Hvilke sprog?", "Dansk, engelsk, spansk og tysk. Du kan skifte når som helst."],
      ["Kan vi bruge det til at oplære personale?", `Ja. Restauranter og vinbarer bruger det allerede til deres hold. Se <a href="/business/">Winelingo til virksomheder</a>.`]],
    endH: "Din første lektion tager fem minutter", endCta: "Start den gratis enhed",
  },
};

function landing(lang, { withApp }) {
  const t = T[lang], h = H[lang], path = hubUrl(lang);
  const crumbs = [[t.crumbHome, "/"], [t.crumbCourse, path]];
  const ld = { "@context": "https://schema.org", "@graph": [
    crumbsLd(crumbs),
    { "@type": "Course", "@id": `${SITE}${path}#course`, name: lang === "en" ? "Winelingo Online Wine Course" : "Winelingo vinkursus online",
      description: h.desc, url: SITE + path, provider: PROVIDER, inLanguage: ["en", "da", "es", "de"],
      educationalLevel: "Beginner", isAccessibleForFree: false,
      hasCourseInstance: { "@type": "CourseInstance", courseMode: "Online", courseWorkload: `PT${HOURS}H` },
      syllabusSections: U.map((u) => ({ "@type": "Syllabus", name: name(u, lang), description: sub(u, lang) })),
      offers: [{ "@type": "Offer", price: "0", priceCurrency: "USD", category: "Free", description: lang === "en" ? "First unit" : "Første enhed" },
        { "@type": "Offer", price: "3.99", priceCurrency: "USD", category: "Subscription", url: `${SITE}/pricing/` },
        { "@type": "Offer", price: "39.99", priceCurrency: "USD", category: "Paid", url: `${SITE}/pricing/` }] },
    { "@type": "ItemList", itemListElement: U.map((u, i) => ({ "@type": "ListItem", position: i + 1, url: SITE + unitUrl(u, lang) })) },
    { "@type": "FAQPage", mainEntity: h.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a.replace(/<[^>]+>/g, "") } })) },
  ] };
  const groups = [0, 1, 2].map((g) => `
    <div class="cl-group">
      <h3>${t.groups[g]}</h3><p class="muted">${t.groupSub[g]}</p>
      <div class="cl-units">${U.filter((u) => u.group === g).map((u) => `
        <a class="cl-unit" href="${unitUrl(u, lang)}">
          <img src="/assets/course/img/${u.img}.webp" alt="" width="160" height="90" loading="lazy">
          <span class="cl-ubody"><span class="cl-uk">${t.unit(u.n).replace(/ af 26| of 26/, "")}${u.topic === FREE ? ` · <b>${t.free}</b>` : ""}</span>
            <span class="cl-ut">${esc(name(u, lang))}</span>
            <span class="cl-us">${esc(sub(u, lang))} · ${t.lessons(u.lessons.length)}</span></span>
        </a>`).join("")}
      </div>
    </div>`).join("");
  const body = `
<main id="${withApp ? "landing" : "main"}" class="cl">
<section class="page-hero cl-hero cl-hub"><div class="hero-bg" aria-hidden="true"></div><div class="wrap">
  ${crumbsHtml(crumbs)}
  <p class="eyebrow">${h.eyebrow}</p>
  <h1>${h.h1}</h1>
  <p class="deck">${h.deck}</p>
  <div class="cl-cta">
    <a class="btn btn-primary btn-lg" href="${appUrl(lang)}">${h.ctaStart}</a>
    <a class="btn btn-ghost btn-lg" href="#syllabus">${h.ctaSyl}</a>
  </div>
  <p class="cl-signin"><a href="${appUrl(lang)}">${h.signIn}</a></p>
  <ul class="cl-facts">${h.facts.map(([a, b]) => `<li><b>${a}</b><span>${b}</span></li>`).join("")}</ul>
</div></section>

<section class="section cl-sec"><div class="wrap">
  <div class="section-head"><h2>${h.howH}</h2></div>
  <div class="cl-grid">${h.how.map(([a, b]) => `<div class="cl-card"><h3>${a}</h3><p>${b}</p></div>`).join("")}</div>
</div></section>

<section class="section cl-sec" id="syllabus"><div class="wrap">
  <div class="section-head"><h2>${h.sylH}</h2><p>${h.sylDeck}</p></div>
  ${groups}
</div></section>

<section class="section cl-sec"><div class="wrap">
  <div class="section-head"><h2>${h.forH}</h2></div>
  <div class="cl-grid">${h.for.map(([a, b]) => `<div class="cl-card"><h3>${a}</h3><p>${b}</p></div>`).join("")}</div>
</div></section>

<section class="section cl-sec"><div class="wrap cl-narrow">
  <div class="section-head"><h2>${h.priceH}</h2><p>${h.priceDeck}</p></div>
  <p class="center"><a class="btn btn-ghost" href="/pricing/">${h.priceCta}</a></p>
  <p class="center cl-rel">${lang === "en" ? `Buying for someone else? <a href="/gift/">Give the course as a gift</a>.` : `Skal det være en gave? <a href="/da/gave/">Giv kurset i gave</a>.`}</p>
</div></section>

<section class="section cl-sec" id="faq"><div class="wrap">
  <div class="section-head"><h2>${h.faqH}</h2></div>
  <div class="faq">${h.faq.map(([q, a], i) => `
    <details${i === 0 ? " open" : ""}><summary>${q}<span class="pm" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span></summary><div class="a"><p>${a}</p></div></details>`).join("")}
  </div>
</div></section>

<section class="cta cl-end"><div class="wrap">
  <h2>${h.endH}</h2>
  <p class="cl-cta center"><a class="btn btn-light btn-lg" href="${appUrl(lang)}">${h.endCta}</a></p>
  <p class="cl-fine">${lang === "en" ? "For adults of legal drinking age (18+). Please enjoy wine responsibly." : "For voksne over 18 år. Nyd vin med omtanke."}</p>
</div></section>
</main>`;
  const appHead = withApp ? `<link rel="stylesheet" href="/assets/course/course.css?v=7">\n` : "";
  const app = withApp ? `
<div id="app" aria-live="polite" hidden></div>
<script src="/assets/course/vendor/supabase-2.117.3.js"></script>
<script src="/assets/course/strings.js?v=8"></script>
<script src="/assets/course/course.js?v=10"></script>` : "";
  let foot = FOOTER;
  if (withApp) foot = foot.replace("</body>", `${app}\n</body>`);
  return head({ lang, title: h.title, desc: h.desc, path, alt: { en: "/course/", da: "/da/vinkursus/" }, ld, extraHead: appHead }) + HEADER + body + foot;
}

// ---- links in from the rest of the site --------------------------------------------------------
// Every related page (country pages, guides, the grape and pairing hubs) gets one box pointing at
// its course unit(s), between markers so a rebuild replaces it. Plus the hub-level pages below.
function band(units, hubOnly) {
  const items = hubOnly
    ? `<a href="/course/">Winelingo's online wine course</a> · ${TOTAL_LESSONS} interactive lessons in 26 units, first unit free`
    : units.map((u) => `<a href="${unitUrl(u, "en")}">${esc(u.h1.en)}</a> · ${u.lessons.length} interactive lessons`).join("<br>");
  return `<!-- course-band (scripts/build-course-pages.mjs) -->
<aside class="course-band"><div class="wrap"><div class="cb-in">
  <p class="eyebrow">Online wine course</p>
  <p class="cb-t">Learn it step by step, five minutes at a time.</p>
  <p class="cb-l">${items}</p>
  <a class="btn btn-primary" href="${hubOnly ? "/course/" : unitUrl(units[0], "en")}">${hubOnly ? "See the syllabus" : "See the lessons"}</a>
</div></div></aside>
<!-- /course-band -->`;
}
const targets = new Map();
for (const u of U) for (const p of u.related) targets.set(p, [...(targets.get(p) || []), u]);
for (const p of ["/learn/", "/learn/wine-for-beginners/", "/learn/types-of-wine/", "/learn/how-to-learn-about-wine/"]) if (!targets.has(p)) targets.set(p, "hub");
let banded = 0;
for (const [p, units] of targets) {
  const file = p.replace(/^\//, "") + "index.html";
  let html = read(file);
  html = html.replace(/<!-- course-band[\s\S]*?<!-- \/course-band -->\n?/, "");
  if (!html.includes("</main>")) throw new Error(`no </main> in ${file}`);
  html = html.replace("</main>", band(units === "hub" ? [] : units, units === "hub") + "\n</main>");
  write(file, html); banded++;
}

// ---- the gift (0137) ----------------------------------------------------------------------------
// /gift/ and /da/gave/ sell the course for life as a present; /gift/card/ is the printable card the
// buyer gets with each code (noindex); /redeem/ is the short address printed on the card.
// Keywords (Google autocomplete, 2026-10-11): "gifts for wine lovers (who have everything)",
// "gift for wine lover", "wine course gift"; DA "gave til vinelsker", "julegave til vinelsker".
const G = {
  en: {
    path: "/gift/", title: "A Gift for Wine Lovers: an Online Wine Course | Winelingo",
    desc: "A gift for the wine lover who has everything: Winelingo's online wine course, 166 interactive lessons, for life. $39.99 once, with a card to print or send.",
    eyebrow: "The gift", h1: "A gift for the wine lover who has everything",
    lede: `Give them the whole Winelingo course: ${TOTAL_LESSONS} short, interactive lessons, from tasting and grapes to twelve wine countries. For life, in four languages. You get a code right away, with a card to print or send.`,
    buy: "Buy the gift · $39.99", redeem: "Have a code? Redeem it",
    note: "One payment, no subscription. The code never expires.",
    cardFor: "A gift for you", cardWhat: "The Winelingo wine course, for life", cardWhere: "Redeem at winelingo.app/redeem",
    howH: "How it works",
    how: [["Buy it", "Sign in or create a free account, then pay once. Paddle, our online reseller, handles the payment and VAT."],
      ["Get the code", "Your gift code appears right after the payment, with a card to print or send. It is also kept in your account."],
      ["They redeem it", "They type the code at winelingo.app/redeem and the whole course opens on their own account, on the web and in the iPhone app."]],
    insideH: "What's inside", insideDeck: `${TOTAL_LESSONS} lessons in 26 units, about ${HOURS} hours in all. Each lesson takes five to ten minutes.`,
    inside: [["Foundations", "How to taste, the red and white grapes that matter, serving, food pairing and reading a label."],
      ["Twelve wine countries", "France, Italy, Spain, Portugal, Germany, Austria, the USA, Argentina, Chile, Australia, New Zealand and South Africa, region by region."],
      ["Going deeper", "The vineyard, how wine is made, terroir and vintages, ageing and collecting, buying well, wine at the table, health and history."]],
    syllabus: "See the full syllabus",
    forH: "Who it's for",
    for: [["The curious beginner", "Someone who enjoys wine and wants to know what they are drinking, without a classroom."],
      ["The wine lover who has everything", "Another bottle is gone in an evening. Knowing why they love it lasts."],
      ["Before a trip", "Heading to Bordeaux, Tuscany or Rioja? The country units cover the regions, grapes and labels."],
      ["Before WSET", "A friendly first step for anyone thinking about a wine qualification."]],
    faqH: "Questions",
    faq: [["Does the gift code expire?", "No. It works until it is redeemed, so it can wait for the birthday or Christmas."],
      ["How do they redeem it?", "At winelingo.app/redeem: they sign in or create a free account and type the code. The whole course opens on that account."],
      ["Does it work in the iPhone app?", "Yes. It is the same account: every lesson with unlimited hearts, on the web and in the app. Label scanning in the app is not included."],
      ["Is it a subscription?", "No. It is one payment of $39.99, shown in your currency with VAT included. Nothing renews."],
      ["Which languages?", "English, Danish, Spanish and German. They can switch at any time."],
      ["Can I get a refund?", "Yes, within 14 days of buying, as long as the code has not been redeemed. A refunded code stops working."],
      ["Is it too late for Christmas?", "Never. The code arrives the moment you pay, so it works as a last-minute gift too."]],
    endH: "Give something they will keep", endCta: "Buy the gift · $39.99",
    fine: "For adults of legal drinking age (18+). Please enjoy wine responsibly.",
  },
  da: {
    path: "/da/gave/", title: "Gave til vinelskeren: et vinkursus online | Winelingo",
    desc: "Gaven til vinelskeren, der har alt: Winelingos vinkursus online, 166 interaktive lektioner, for altid. $39.99 én gang, med et kort du kan printe eller sende.",
    eyebrow: "Gaven", h1: "Gaven til vinelskeren, der har alt",
    lede: `Giv hele Winelingo-kurset: ${TOTAL_LESSONS} korte, interaktive lektioner, fra smagning og druer til tolv vinlande. For altid, på fire sprog. Du får en kode med det samme og et kort, du kan printe eller sende.`,
    buy: "Køb gaven · $39.99", redeem: "Har du en kode? Indløs den",
    note: "Én betaling, intet abonnement. Koden udløber aldrig.",
    cardFor: "En gave til dig", cardWhat: "Winelingos vinkursus, for altid", cardWhere: "Indløs på winelingo.app/redeem",
    howH: "Sådan virker det",
    how: [["Køb den", "Log ind eller opret en gratis konto, og betal én gang. Paddle, vores online forhandler, står for betaling og moms."],
      ["Få koden", "Gavekoden vises lige efter betalingen, med et kort du kan printe eller sende. Den gemmes også på din konto."],
      ["De indløser den", "De skriver koden på winelingo.app/redeem, og hele kurset åbner på deres egen konto, på nettet og i iPhone-appen."]],
    insideH: "Det får de", insideDeck: `${TOTAL_LESSONS} lektioner i 26 enheder, cirka ${HOURS} timer i alt. Hver lektion tager fem til ti minutter.`,
    inside: [["Grundlaget", "Sådan smager man, de røde og hvide druer der betyder noget, servering, mad og vin og at læse en etiket."],
      ["Tolv vinlande", "Frankrig, Italien, Spanien, Portugal, Tyskland, Østrig, USA, Argentina, Chile, Australien, New Zealand og Sydafrika, region for region."],
      ["Et spadestik dybere", "Vinmarken, vinfremstilling, terroir og årgange, lagring og vinsamling, gode indkøb, vin ved bordet, sundhed og historie."]],
    syllabus: "Se hele pensum",
    forH: "Hvem er den til?",
    for: [["Den nysgerrige begynder", "En der nyder vin og gerne vil vide, hvad der er i glasset, uden et klasselokale."],
      ["Vinelskeren, der har alt", "En flaske mere er drukket på en aften. At vide hvorfor man elsker den, holder."],
      ["Før rejsen", "Skal de til Bordeaux, Toscana eller Rioja? Landeenhederne gennemgår regioner, druer og etiketter."],
      ["Før WSET", "Et venligt første skridt for den, der overvejer en vinuddannelse."]],
    faqH: "Spørgsmål",
    faq: [["Udløber gavekoden?", "Nej. Den virker, indtil den bliver indløst, så den kan godt vente til fødselsdagen eller julen."],
      ["Hvordan indløser de den?", "På winelingo.app/redeem: de logger ind eller opretter en gratis konto og skriver koden. Hele kurset åbner på den konto."],
      ["Virker den i iPhone-appen?", "Ja. Det er den samme konto: alle lektioner med ubegrænsede liv, på nettet og i appen. Scanning af etiketter i appen er ikke med."],
      ["Er det et abonnement?", "Nej. Det er én betaling på $39.99, vist i din valuta inklusive moms. Intet fornyes."],
      ["Hvilke sprog?", "Dansk, engelsk, spansk og tysk. De kan skifte når som helst."],
      ["Kan jeg få pengene tilbage?", "Ja, inden for 14 dage efter købet, så længe koden ikke er indløst. En refunderet kode holder op med at virke."],
      ["Er det for sent til jul?", "Aldrig. Koden kommer, i det øjeblik du betaler, så den virker også som en gave i sidste øjeblik."]],
    endH: "Giv noget, de beholder", endCta: "Køb gaven · $39.99",
    fine: "For voksne over 18 år. Nyd vin med omtanke.",
  },
};
const giftBuy = (lang) => (lang === "en" ? "/course/?gift=1" : "/course/?gift=1&lang=da");
const giftRedeem = (lang) => (lang === "en" ? "/redeem/" : "/redeem/?lang=da");
function giftPage(lang) {
  const g = G[lang];
  const ld = { "@context": "https://schema.org", "@graph": [
    { "@type": "BreadcrumbList", itemListElement: [
      { "@type": "ListItem", position: 1, name: lang === "en" ? "Home" : "Forside", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: g.eyebrow, item: `${SITE}${g.path}` }] },
    { "@type": "Product", name: lang === "en" ? "Winelingo online wine course, as a gift" : "Winelingos vinkursus online, som gave",
      description: g.desc, brand: { "@type": "Brand", name: "Winelingo" }, image: `${SITE}/assets/social-card.png`, url: `${SITE}${g.path}`,
      offers: { "@type": "Offer", price: "39.99", priceCurrency: "USD", availability: "https://schema.org/InStock", url: `${SITE}${g.path}` } },
    { "@type": "FAQPage", mainEntity: g.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
  ] };
  const body = `<main id="main" class="cl">
<section class="hero cl-hero gift-hero"><div class="wrap gift-grid">
  <div>
    <p class="eyebrow">${g.eyebrow}</p>
    <h1>${esc(g.h1)}</h1>
    <p class="lede">${esc(g.lede)}</p>
    <div class="cl-cta"><a class="btn btn-primary btn-lg" href="${giftBuy(lang)}" data-umami-event="gift-buy">${g.buy}</a>
      <a class="btn btn-ghost btn-lg" href="${giftRedeem(lang)}">${g.redeem}</a></div>
    <p class="cl-unlock">${g.note}</p>
  </div>
  <div class="gift-card-mock" aria-hidden="true">
    <img src="/assets/logo.png" alt="" width="40" height="40">
    <p class="gcm-for">${g.cardFor}</p>
    <p class="gcm-what">${g.cardWhat}</p>
    <p class="gcm-code">WL-····-····</p>
    <p class="gcm-where">${g.cardWhere}</p>
  </div>
</div></section>

<section class="section cl-sec"><div class="wrap">
  <div class="section-head"><h2>${g.howH}</h2></div>
  <ol class="gift-steps">${g.how.map(([a, b], i) => `<li><span>${i + 1}</span><h3>${a}</h3><p>${b}</p></li>`).join("")}</ol>
</div></section>

<section class="section cl-sec"><div class="wrap">
  <div class="section-head"><h2>${g.insideH}</h2><p>${g.insideDeck}</p></div>
  <div class="cl-grid gift-inside">${g.inside.map(([a, b]) => `<div class="cl-card"><h3>${a}</h3><p>${b}</p></div>`).join("")}</div>
  <p class="center cl-rel"><a href="${hubUrl(lang)}">${g.syllabus}</a></p>
</div></section>

<section class="section cl-sec"><div class="wrap">
  <div class="section-head"><h2>${g.forH}</h2></div>
  <div class="cl-grid">${g.for.map(([a, b]) => `<div class="cl-card"><h3>${a}</h3><p>${b}</p></div>`).join("")}</div>
</div></section>

<section class="section cl-sec" id="faq"><div class="wrap">
  <div class="section-head"><h2>${g.faqH}</h2></div>
  <div class="faq">${g.faq.map(([q, a], i) => `
    <details${i === 0 ? " open" : ""}><summary>${q}<span class="pm" aria-hidden="true"><svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></span></summary><div class="a"><p>${a}</p></div></details>`).join("")}
  </div>
</div></section>

<section class="cta cl-end"><div class="wrap">
  <h2>${g.endH}</h2>
  <p class="cl-cta center"><a class="btn btn-light btn-lg" href="${giftBuy(lang)}" data-umami-event="gift-buy">${g.endCta}</a></p>
  <p class="cl-fine">${g.fine}</p>
</div></section>
</main>`;
  return head({ lang, title: g.title, desc: g.desc, path: g.path, alt: { en: G.en.path, da: G.da.path }, ld }) + HEADER + body + FOOTER;
}
// The card: printed or sent by the buyer. The code arrives in the address's #fragment, which never
// leaves the browser; names and a message are typed on the page and printed with it.
function cardPage() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Winelingo Gift Card</title>
<link rel="icon" type="image/png" sizes="32x32" href="/assets/favicon-32.png">
${FONTS}
<link rel="stylesheet" href="/assets/gift-card.css?v=1">
</head>
<body>
<main class="gc-page">
  <div class="gc-tools">
    <label><span data-t="to">To</span><input id="to" maxlength="40" autocomplete="off"></label>
    <label><span data-t="from">From</span><input id="from" maxlength="40" autocomplete="off"></label>
    <label class="wide"><span data-t="msg">A few words (optional)</span><input id="msg" maxlength="120" autocomplete="off"></label>
    <button id="print" class="btn btn-primary" type="button" data-t="print">Print the card</button>
  </div>
  <article class="gc" aria-label="Gift card">
    <div class="gc-top"><img src="/assets/logo.png" alt="" width="44" height="44"><span>Winelingo</span></div>
    <p class="gc-to" id="toOut"></p>
    <p class="gc-for" data-t="for">A gift for you</p>
    <h1 class="gc-what" data-t="what">The Winelingo wine course, for life</h1>
    <p class="gc-sub" data-t="sub">${TOTAL_LESSONS} interactive lessons: tasting, grapes and twelve wine countries.</p>
    <p class="gc-msg" id="msgOut"></p>
    <p class="gc-from" id="fromOut"></p>
    <div class="gc-code"><span data-t="code">Your code</span><b id="code">WL-····-····</b></div>
    <p class="gc-where" data-t="where">Redeem at winelingo.app/redeem</p>
  </article>
  <p class="gc-redeem"><a id="redeem" class="btn btn-ghost" href="/redeem/" data-t="redeem">Redeem this code now</a></p>
</main>
<script src="/assets/gift-card.js?v=1"></script>
</body>
</html>
`;
}
function redeemPage() {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Redeem a Gift Code | Winelingo</title>
<link rel="canonical" href="${SITE}/gift/">
<script>
  // Short address printed on the gift card: on to the course, which asks for the code.
  (function () {
    var q = location.search, c = (location.hash.match(/c=([A-Za-z0-9-]+)/) || q.match(/[?&]c=([A-Za-z0-9-]+)/) || [])[1];
    var lang = (q.match(/[?&]lang=(en|da|es|de)\\b/) || [])[1];
    location.replace("/course/?" + (c ? "redeem=" + encodeURIComponent(c) : "redeem=open") + (lang ? "&lang=" + lang : ""));
  })();
</script>
</head>
<body><p><a href="/course/?redeem=open">Redeem your Winelingo gift code</a></p></body>
</html>
`;
}

// ---- write --------------------------------------------------------------------------------------
write("course/index.html", landing("en", { withApp: true }));
write("da/vinkursus/index.html", landing("da", { withApp: false }));
write("gift/index.html", giftPage("en"));
write("da/gave/index.html", giftPage("da"));
write("gift/card/index.html", cardPage());
write("redeem/index.html", redeemPage());
for (const u of U) { write(`course/${u.en}/index.html`, unitPage(u, "en")); write(`da/vinkursus/${u.da}/index.html`, unitPage(u, "da")); }
export const COURSE_URLS = [hubUrl("en"), hubUrl("da"), G.en.path, G.da.path, ...U.flatMap((u) => [unitUrl(u, "en"), unitUrl(u, "da")])];
writeFileSync(join(ROOT, "data/course/urls.json"), JSON.stringify(COURSE_URLS, null, 1));
console.log(`course pages: 2 landings + ${U.length * 2} unit pages · ${TOTAL_LESSONS} lessons · ~${HOURS} h · course box on ${banded} pages`);

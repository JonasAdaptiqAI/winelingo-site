#!/usr/bin/env node
// Write the one site header and footer into every page that carries them.
//
//   node scripts/build-chrome.mjs
//
// Every page used to hold its own copy of the header and footer, so a menu change meant a
// sweep over 550 files. This is that sweep, kept: edit HEADER/FOOTER here and re-run it.
// It replaces <header class="site-header">…</header> and <footer class="site-footer">…</footer>
// wherever they occur, marks the current section with aria-current, and makes sure the
// site-search script is loaded. Builders that copy the header from tools/index.html
// (build-tests.mjs, build-glossary.mjs, …) pick up the new one on their next run.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const SKIP = new Set(["node_modules", "docs", "data", "scripts", "assets", "pagefind", ".git"]);

// Pages under /da/ get the Danish menu and footer; everything else the English one.
const NAV = {
  en: [["/course/", "Course"], ["/tests/", "Wine tests"], ["/pricing/", "Pricing"], ["/about/", "About"]],
  da: [["/da/vinkursus/", "Vinkursus"], ["/tests/?lang=da", "Vintests"], ["/pricing/", "Priser"], ["/about/", "Om os"]],
};
const BIZ = { en: ["/business/", "For restaurants"], da: ["/business/?lang=da", "Til restauranter"] };
const SEARCH_ICON = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="6.5" stroke="currentColor" stroke-width="1.8"/><path d="m16 16 4.5 4.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
const MENU_ICON = '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';

// The section a page belongs to, for aria-current: /tests/ for /tests/serving-wine/ too.
const sectionOf = (path) => {
  const parts = path.split("/");
  return "/" + (parts[0] === "da" ? "da/" + (parts[1] || "") : parts[0] || "") + "/";
};
const cur = (href, here) => (href.split("?")[0] === here ? ' aria-current="page"' : "");

// Pages with a twin in the other language get a link to it in the header; the twin links back.
const PAIRS = [["", "da/"], ["course/", "da/vinkursus/"], ["gift/", "da/gave/"]];
const TWINS = Object.fromEntries(PAIRS.flatMap(([en, da]) => [[en, da], [da, en]]));

const langOf = (path) => (path.startsWith("da/") ? "da" : "en");

function header(path) {
  const here = sectionOf(path), L = langOf(path);
  const dir = path.replace(/index\.html$/, "");
  const twin = TWINS[dir];
  const lang = twin === undefined ? "" : L === "da"
    ? `<a class="nav-lang" href="/${twin}" hreflang="en" lang="en">English</a>`
    : `<a class="nav-lang" href="/${twin}" hreflang="da" lang="da">Dansk</a>`;
  const T = L === "da"
    ? { home: "Winelingo forside", search: "Søg på Winelingo", searchT: "Søg (/)", badge: "Hent Winelingo i App Store", menu: "Åbn menu", nav: "Hovedmenu" }
    : { home: "Winelingo home", search: "Search Winelingo", searchT: "Search (/)", badge: "Download Winelingo on the App Store", menu: "Open menu", nav: "Primary" };
  return `<header class="site-header" id="site-header" data-pagefind-ignore="all">
  <div class="wrap nav">
    <a class="brand" href="${L === "da" ? "/da/" : "/"}" aria-label="${T.home}"><img src="/assets/logo.png" alt="" width="34" height="34"> Winelingo</a>
    <nav class="nav-links" id="navmenu" aria-label="${T.nav}">
${NAV[L].map(([h, t]) => `      <a href="${h}"${cur(h, here)}>${t}</a>`).join("\n")}
      <a class="nav-biz" href="${BIZ[L][0]}"${cur(BIZ[L][0], here)}>${BIZ[L][1]}</a>${lang ? "\n      " + lang : ""}
    </nav>
    <div class="nav-cta"><button class="nav-search" type="button" aria-label="${T.search}" title="${T.searchT}" data-search-open>${SEARCH_ICON}</button><a class="badge-link nav-badge" href="https://apps.apple.com/app/id6785896824"><img src="/assets/appstore-badge.svg" alt="${T.badge}" width="120" height="40"></a><button class="nav-toggle" aria-label="${T.menu}" aria-expanded="false" aria-controls="navmenu">${MENU_ICON}</button></div>
  </div>
</header>`;
}

const FOOTER = `<footer class="site-footer" data-pagefind-ignore="all">
  <div class="wrap">
    <div class="foot-top">
      <div class="foot-brand">
        <a class="brand" href="/" aria-label="Winelingo home"><img src="/assets/logo.png" alt="" width="34" height="34"> Winelingo</a>
        <p>Learn the wine in your glass. Scan a label, understand what you’re drinking, and build your own palate — one scan at a time.</p>
        <a class="foot-badge" href="https://apps.apple.com/app/id6785896824"><img src="/assets/appstore-badge-white.svg" alt="Download Winelingo on the App Store" width="120" height="40" loading="lazy"></a>
      </div>
      <div class="foot-col"><h3>Explore</h3>
        <a href="/grape-varieties/">Grape varieties</a><a href="/wine-regions/">Wine regions</a><a href="/countries/">Wine countries</a><a href="/wine-styles/">Wine styles</a><a href="/food-and-wine-pairing/">Food &amp; wine pairing</a><a href="/wine-glossary/">Wine glossary</a><a href="/wine-classifications/">Classifications</a>
      </div>
      <div class="foot-col"><h3>Learn</h3>
        <a href="/learn/">Learn wine</a><a href="/course/">Online wine course</a><a href="/tests/">Wine quizzes &amp; exam practice</a><a href="/gift/">Give the course</a><a href="/tools/wine-serving-temperature/">Serving temperature</a><a href="/tools/wine-calories/">Wine calories</a>
      </div>
      <div class="foot-col"><h3>For restaurants</h3>
        <a href="/business/">Staff training</a><a href="/partner/">Redeem a team code</a><a href="mailto:jonsegeskov29@gmail.com?subject=Winelingo%20for%20our%20team">Book a demo</a>
      </div>
      <div class="foot-col"><h3>Company</h3>
        <a href="/about/">About</a><a href="/pricing/">Pricing</a><a href="/support/">Support</a><a href="/privacy">Privacy Policy</a><a href="/terms">Terms of Use</a><a href="mailto:jonsegeskov29@gmail.com">Contact</a>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© 2026 Jonas Egeskov · <a href="https://egeskovengineering.com">Egeskov Engineering</a>, Denmark</span>
      <span>For adults of legal drinking age (18+). Please enjoy wine responsibly.</span>
    </div>
  </div>
</footer>`;

const FOOTER_DA = `<footer class="site-footer" data-pagefind-ignore="all">
  <div class="wrap">
    <div class="foot-top">
      <div class="foot-brand">
        <a class="brand" href="/da/" aria-label="Winelingo forside"><img src="/assets/logo.png" alt="" width="34" height="34"> Winelingo</a>
        <p>Lær vinen i dit glas at kende. Scan en etiket, forstå hvad du drikker, og byg din egen smag, én scanning ad gangen.</p>
        <a class="foot-badge" href="https://apps.apple.com/app/id6785896824"><img src="/assets/appstore-badge-white.svg" alt="Hent Winelingo i App Store" width="120" height="40" loading="lazy"></a>
      </div>
      <div class="foot-col"><h3>Udforsk</h3>
        <a href="/grape-varieties/" hreflang="en">Druesorter</a><a href="/wine-regions/" hreflang="en">Vinregioner</a><a href="/countries/" hreflang="en">Vinlande</a><a href="/wine-styles/" hreflang="en">Vinstile</a><a href="/food-and-wine-pairing/" hreflang="en">Mad og vin</a><a href="/wine-glossary/" hreflang="en">Vinordbog</a>
      </div>
      <div class="foot-col"><h3>Lær</h3>
        <a href="/da/vinkursus/">Vinkursus online</a><a href="/tests/?lang=da">Vinquiz og øveeksamener</a><a href="/da/gave/">Giv kurset i gave</a>
      </div>
      <div class="foot-col"><h3>Til restauranter</h3>
        <a href="/business/?lang=da">Personaletræning</a><a href="/partner/">Indløs en holdkode</a><a href="mailto:jonsegeskov29@gmail.com?subject=Winelingo%20til%20vores%20hold">Book en demo</a>
      </div>
      <div class="foot-col"><h3>Winelingo</h3>
        <a href="/about/" hreflang="en">Om os</a><a href="/pricing/" hreflang="en">Priser</a><a href="/support/" hreflang="en">Hjælp</a><a href="/privacy">Privatlivspolitik</a><a href="/terms">Vilkår</a><a href="mailto:jonsegeskov29@gmail.com">Kontakt</a>
      </div>
    </div>
    <div class="foot-bottom">
      <span>© 2026 Jonas Egeskov · <a href="https://egeskovengineering.com">Egeskov Engineering</a>, Danmark</span>
      <span>For voksne over 18 år. Nyd vin med omtanke.</span>
    </div>
  </div>
</footer>`;

const SEARCH = '<script src="/assets/search.js" defer></script>';

function* pages(dir) {
  for (const name of readdirSync(dir)) {
    if (SKIP.has(name)) continue;
    const p = join(dir, name);
    if (statSync(p).isDirectory()) yield* pages(p);
    else if (name.endsWith(".html")) yield p;
  }
}

let n = 0;
for (const file of pages(ROOT)) {
  const path = relative(ROOT, file);
  let html = readFileSync(file, "utf8");
  const before = html;
  html = html.replace(/<header class="site-header"[\s\S]*?<\/header>/, () => header(path));
  html = html.replace(/<footer class="site-footer"[\s\S]*?<\/footer>/, () => (langOf(path) === "da" ? FOOTER_DA : FOOTER));
  if (html.includes('class="site-header"') && !html.includes(SEARCH)) html = html.replace("</body>", `${SEARCH}\n</body>`);
  // Search: a page's own title should beat pages that only mention the word.
  html = html.replace(/<h1(?![^>]*data-pagefind-weight)(?=[\s>])/, '<h1 data-pagefind-weight="10"');
  // The App Store band repeats on hundreds of pages; keep it out of the search index.
  html = html.replace(/<div class="appband">/g, '<div class="appband" data-pagefind-ignore="all">');
  if (html !== before) { writeFileSync(file, html); n++; }
}
console.log(`Header and footer written into ${n} pages`);

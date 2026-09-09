// One-off content edits from the September 2026 SEO audit (idempotent).
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const write = (p, s) => fs.writeFileSync(path.join(ROOT, p), s);
const once = (s, a, b, label) => { const n = s.split(a).length - 1; if (n !== 1) throw new Error(`${label}: expected 1 match, got ${n} for ${String(a).slice(0, 70)}`); return s.replace(a, () => b); };
const log = [];

// 1. /food-and-wine-pairing/indian-curry/ -> the creamy chicken-curry family, not a second butter chicken page
{
  const p = "food-and-wine-pairing/indian-curry/index.html"; let s = read(p);
  if (!s.includes("What Wine Goes With Chicken Curry?")) {
    const desc = "What wine goes with chicken curry? Off-dry Riesling or Gewurztraminer for korma, tikka masala and butter chicken: cream and warm spice want a little sugar.";
    if (desc.length > 160) throw new Error("curry desc " + desc.length);
    s = s.replace(/<title>[^<]*<\/title>/, "<title>What Wine Goes With Chicken Curry? | Winelingo</title>");
    s = s.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1What Wine Goes With Chicken Curry? | Winelingo$2`);
    s = s.replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1What Wine Goes With Chicken Curry? | Winelingo$2`);
    s = s.replace(/(<meta name="description" content=")[^"]*(")/, `$1${desc}$2`);
    s = s.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${desc}$2`);
    s = s.replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${desc}$2`);
    s = once(s, '<h1 class="reveal d1">What Wine Goes With Butter Chicken?</h1>', '<h1 class="reveal d1">What Wine Goes With Chicken Curry?</h1>', "curry h1");
    s = once(s, '"headline":"What Wine Goes With Butter Chicken?"', '"headline":"What Wine Goes With Chicken Curry?"', "curry headline");
    s = s.replace(/"description":"What wine goes with butter chicken\?[^"]*"/, `"description":"${desc}"`);
    s = s.replace(/<p class="deck reveal d2">[^<]*<\/p>/, '<p class="deck reveal d2">Korma, tikka masala, butter chicken: the creamy, fragrant curries all want the same thing from a wine, and it is not a big red.</p>');
    s = s.replace(/<span aria-current="page">Butter chicken<\/span>/, '<span aria-current="page">Chicken curry</span>');
    s = s.replace(/"name":"Butter chicken"\}/, '"name":"Chicken curry"}');
    const intro = '<p>“Chicken curry” covers a whole family of dishes, but the ones most of us cook at home — korma, tikka masala, butter chicken — share a creamy, tomato-and-spice sauce with very little real heat, and that is what the wine has to answer. The rule below is worked through on butter chicken, which also has <a href="/food-and-wine-pairing/butter-chicken/">a short guide of its own</a>; it holds for its creamy cousins. For the hotter end of the menu, the <a href="/food-and-wine-pairing/indian-food/">Indian food guide</a> explains how chilli changes the answer.</p>';
    s = s.replace(/(<article class="prose"><p class="lead">[\s\S]*?<\/p>)/, (m) => `${m}${intro}`);
    write(p, s); log.push("indian-curry retargeted to chicken curry");
  }
  for (const hubp of ["food-and-wine-pairing/index.html", "learn/index.html"]) { let h = read(hubp); const n = h.split(">Indian butter chicken<").length - 1; if (n) { h = h.split(">Indian butter chicken<").join(">Chicken curry<"); write(hubp, h); log.push(`${hubp}: ${n} label(s) renamed`); } }
}

// 2. Region <-> style cross-links where missing
const NAMES = { chablis: "Chablis", "chateauneuf-du-pape": "Châteauneuf-du-Pape", sancerre: "Sancerre", sauternes: "Sauternes", beaujolais: "Beaujolais", champagne: "Champagne", "ribera-del-duero": "Ribera del Duero", rioja: "Rioja" };
for (const [slug, name] of Object.entries(NAMES)) {
  const rp = `wine-regions/${slug}/index.html`, sp = `wine-styles/${slug}/index.html`;
  let r = read(rp), s = read(sp);
  if (!r.includes(`href="/wine-styles/${slug}/"`)) { r = r.replace(/(<article class="prose"><p class="lead">[\s\S]*?<\/p>)/, (m) => `${m}<p class="xref">Want to know what ${name} tastes like and how to choose a bottle? Read the <a href="/wine-styles/${slug}/">${name} wine style guide</a>.</p>`); write(rp, r); log.push(`${rp}: cross-link added`); }
  if (!s.includes(`href="/wine-regions/${slug}/"`)) { s = s.replace(/(<article class="prose"><p class="lead">[\s\S]*?<\/p>)/, (m) => `${m}<p class="xref">Looking for the place itself, its climate, villages and producers? See the <a href="/wine-regions/${slug}/">${name} wine region guide</a>.</p>`); write(sp, s); log.push(`${sp}: cross-link added`); }
}

// 3. /tools/ was thin (200 words)
{ const p = "tools/index.html"; let s = read(p);
  if (!s.includes("What these tools are for")) {
    const block = `<section class="wrap" style="max-width:var(--maxw-prose);padding-bottom:10px"><article class="prose"><h2>What these tools are for</h2><p>Both tools answer a question that comes up at the table rather than in a classroom. The serving temperature chart covers every major style, from sparkling and crisp whites through rosé, lighter reds and full-bodied reds to sweet and fortified wines, and explains why a few degrees matter: too cold and a wine’s aromas close up, too warm and the alcohol takes over. Use the quick picker when the bottle is already open and you need an answer now.</p><p>The calories and units calculator estimates the calories, UK units and US standard drinks in any glass or bottle from two numbers you can read off the label: the alcohol percentage and the pour size. It is an estimate, because residual sugar varies from wine to wine, but it is close enough to make a sensible decision.</p><p>Neither tool needs an account or the app. If you want to go further, the Winelingo app identifies a wine from its label and explains its taste in plain language.</p></article></section>`;
    s = once(s, '<section class="wrap"><div class="appband">', block + '<section class="wrap"><div class="appband">', "tools appband");
    write(p, s); log.push("tools copy added");
  } }

// 4. About page: Person entity as mainEntity
{ const p = "about/index.html"; let s = read(p); const old = '{"@context":"https://schema.org","@type":"AboutPage","name":"About Winelingo","url":"https://winelingo.app/about/"}';
  if (s.includes(old)) { s = once(s, old, '{"@context":"https://schema.org","@type":"AboutPage","name":"About Winelingo","url":"https://winelingo.app/about/","about":{"@id":"https://winelingo.app/#organization"},"mainEntity":{"@type":"Person","@id":"https://winelingo.app/#jonas-egeskov","name":"Jonas Egeskov","url":"https://winelingo.app/about/","jobTitle":"Founder","worksFor":{"@type":"Organization","@id":"https://winelingo.app/#organization","name":"Winelingo","url":"https://winelingo.app/"},"sameAs":["https://egeskovengineering.com"]}}', "about schema"); write(p, s); log.push("about: Person mainEntity"); } }

// 5. Home: founder gets the same @id and url
{ const p = "index.html"; let s = read(p); const old = `      "founder": {
        "@type": "Person",
        "name": "Jonas Egeskov"
      },`; if (s.includes(old)) { s = once(s, old, `      "founder": {
        "@type": "Person",
        "@id": "https://winelingo.app/#jonas-egeskov",
        "name": "Jonas Egeskov",
        "url": "https://winelingo.app/about/"
      },`, "home founder"); write(p, s); log.push("home: founder @id"); } }

// 6. 404.html from the about page chrome
{ const about = read("about/index.html");
  let head = about.slice(about.indexOf("<head>"), about.indexOf("</head>"));
  head = head.replace(/<title>[^<]*<\/title>/, "<title>Page not found | Winelingo</title>")
    .replace(/<meta name="description" content="[^"]*">/, '<meta name="description" content="That page is not on winelingo.app. Start again from the wine guides, grapes, regions, styles or food pairings.">\n<meta name="robots" content="noindex">')
    .replace(/<link rel="canonical"[^>]*>\n?/, "").replace(/<link rel="alternate"[^>]*>\n?/g, "")
    .replace(/<meta (?:property="og:|name="twitter:)[^>]*>\n?/g, "")
    .replace(/<script type="application\/ld\+json">[\s\S]*?<\/script>\n?/g, "");
  const header = about.slice(about.indexOf("<body>") + 6, about.indexOf("<main"));
  const footer = about.slice(about.indexOf("<footer"), about.indexOf("</body>"));
  const main = `<main id="main"><section class="page-hero"><div class="hero-bg" aria-hidden="true"></div><div class="wrap">
    <p class="eyebrow reveal">404</p>
    <h1 class="reveal d1">That page is not here</h1>
    <p class="deck reveal d2">The address may be mistyped, or it may point to a page that has moved. Everything on Winelingo is one click away from the hubs below.</p>
  </div></section><section class="wrap" style="max-width:var(--maxw-prose)"><div class="callout"><strong>Start again</strong><div style="margin-top:10px;display:grid;gap:8px"><a href="/learn/">Learn wine: guides for beginners</a><a href="/grape-varieties/">Grape varieties</a><a href="/wine-regions/">Wine regions</a><a href="/wine-styles/">Wine styles</a><a href="/food-and-wine-pairing/">Food and wine pairing</a><a href="/wine-glossary/">Wine glossary</a><a href="/tools/">Free wine tools</a></div></div></section></main>\n`;
  write("404.html", `<!doctype html>\n<html lang="en">\n${head}</head>\n<body>${header}${main}${footer}</body>\n</html>\n`); log.push("404.html written"); }

// 7. llms.txt regenerated from disk
{ const dec = (x) => x.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/’/g, "’");
  const dirs = (d) => fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
  const titleOf = (p) => dec((read(p).match(/<h1[^>]*>([^<]*)<\/h1>/) || [])[1] ?? p);
  const guides = dirs("learn").map((d) => `- [${titleOf(`learn/${d}/index.html`)}](https://winelingo.app/learn/${d}/)`).join("\n");
  const terms = (read("wine-glossary/index.html").match(/"@type":"DefinedTerm"/g) || []).length; const glossaryCount = terms || dirs("wine-glossary").length;
  const pairings = dirs("food-and-wine-pairing").filter((d) => d !== "duck-breast").length;
  const txt = `# Winelingo — learn wine, plainly

> Winelingo (winelingo.app) is a wine-education site and companion to the Winelingo iPhone app
> (an app that scans wine labels and restaurant wine lists and explains each wine in plain
> English — body, tannin, acidity, sweetness and oak). All content is written for beginners in
> plain language, fact-checked, and free to read. Free to download, with Premium for unlimited
> scans. For adults of legal drinking age; enjoy wine responsibly. Written and edited by
> Jonas Egeskov (https://winelingo.app/about/).

## Guides (${dirs("learn").length})
${guides}

## Reference
- [${dirs("grape-varieties").length} grape variety profiles](https://winelingo.app/grape-varieties/)
- [${dirs("wine-regions").length} wine region guides](https://winelingo.app/wine-regions/)
- [${dirs("countries").length} wine country overviews](https://winelingo.app/countries/)
- [${dirs("wine-styles").length} wine style guides](https://winelingo.app/wine-styles/)
- [Food and wine pairing (${pairings} pairings)](https://winelingo.app/food-and-wine-pairing/)
- [Wine classifications explained (${dirs("wine-classifications").length} systems)](https://winelingo.app/wine-classifications/)
- [Wine glossary (${glossaryCount} terms)](https://winelingo.app/wine-glossary/)

## Tools
- [Wine serving temperature chart](https://winelingo.app/tools/wine-serving-temperature/)
- [Wine calories calculator](https://winelingo.app/tools/wine-calories/)

## About
- [About Winelingo and Jonas Egeskov](https://winelingo.app/about/)
- [Support](https://winelingo.app/support/)
`;
  write("llms.txt", txt); log.push(`llms.txt regenerated (${dirs("learn").length} guides, ${pairings} pairings, ${glossaryCount} glossary terms)`); }
console.log(log.join("\n"));

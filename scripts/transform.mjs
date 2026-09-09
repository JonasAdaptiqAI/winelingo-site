// Sitewide, idempotent SEO transforms for winelingo.app. Run: node scripts/transform.mjs
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SKIP = new Set(["food-and-wine-pairing/duck-breast/index.html", "google920805b1a6e2b562.html", "404.html"]);
const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if ([".git", "assets", "scripts"].includes(e.name)) continue; const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name.endsWith(".html")) files.push(p); } })(ROOT);
const rel = (f) => path.relative(ROOT, f);
const dec = (s) => s.replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"');
const enc = (s) => s.replace(/&/g, "&amp;");
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const human = (iso) => { const [y, m, d] = iso.split("-").map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
const photoExists = (name) => fs.existsSync(path.join(ROOT, "assets", "photos", name));
const h1Of = (p) => dec((fs.readFileSync(path.join(ROOT, p, "index.html"), "utf8").match(/<h1[^>]*>([^<]*)<\/h1>/) || [])[1] ?? p);

// ---- pairing sections from the hub, for related links ----------------------
const hub = fs.readFileSync(path.join(ROOT, "food-and-wine-pairing/index.html"), "utf8");
const sectionOf = new Map();
for (const part of hub.split(/<h2 class="pcat">/).slice(1)) { const label = part.slice(0, part.indexOf("<")).trim(); for (const m of part.matchAll(/href="\/food-and-wine-pairing\/([^"/]+)\/"/g)) if (!sectionOf.has(m[1])) sectionOf.set(m[1], label); }
const pairingFiles = files.filter((f) => /^food-and-wine-pairing\/[^/]+\/index\.html$/.test(rel(f)) && !SKIP.has(rel(f)));
const pairingInfo = new Map();
for (const f of pairingFiles) { const html = fs.readFileSync(f, "utf8"); const slug = rel(f).split("/")[1]; const h1 = dec((html.match(/<h1[^>]*>([^<]*)<\/h1>/) || [])[1] ?? slug); const main = html.slice(html.indexOf("<main"), html.indexOf("</main>")); const wines = new Set([...main.matchAll(/href="(\/(?:grape-varieties|wine-styles)\/[^"]+\/)"/g)].map((m) => m[1])); pairingInfo.set(slug, { slug, h1, wines, section: sectionOf.get(slug) ?? "" }); }
const labelFor = (h1) => h1.replace(/^What Wine Goes With\s+/i, "").replace(/\?$/, "");
const relatedFor = (slug) => { const me = pairingInfo.get(slug); return [...pairingInfo.values()].filter((o) => o.slug !== slug).map((o) => { let overlap = 0; for (const w of o.wines) if (me.wines.has(w)) overlap++; return { o, score: (o.section && o.section === me.section ? 100 : 0) + overlap }; }).sort((a, b) => b.score - a.score || a.o.slug.localeCompare(b.o.slug)).slice(0, 5).map((s) => s.o); };

// ---- sibling links for learn/ and wine-classifications/ articles ------------
const SIBLING_DIRS = ["learn", "wine-classifications"];
const siblingsOf = new Map();
for (const dir of SIBLING_DIRS) { const slugs = files.filter((f) => rel(f).startsWith(dir + "/") && rel(f).split("/").length === 3).map((f) => rel(f).split("/")[1]).sort(); slugs.forEach((slug, i) => siblingsOf.set(`${dir}/${slug}`, Array.from({ length: Math.min(5, slugs.length - 1) }, (_, k) => slugs[(i + 1 + k) % slugs.length]))); }

const counts = { footer: 0, logo: 0, fonts: 0, author: 0, byline: 0, picture: 0, srcset: 0, title: 0, ogSync: 0, h2: 0, related: 0, desc: 0, siblings: 0 };
const countDir = (d) => fs.readdirSync(path.join(ROOT, d), { withFileTypes: true }).filter((e) => e.isDirectory()).length;
const HUB_H2 = { "countries/index.html": `All ${countDir("countries")} wine countries`, "grape-varieties/index.html": `All ${countDir("grape-varieties")} grape varieties, A to Z`, "wine-glossary/index.html": "Glossary sections", "wine-styles/index.html": `All ${countDir("wine-styles")} wine styles` };
const DESC = {
  "countries/index.html": "Explore the world’s wine countries, from Old World France, Italy and Spain to New World Australia and the US, with their regions, grapes and signature styles.",
  "food-and-wine-pairing/pad-thai/index.html": "What wine goes with Pad Thai? An off-dry Riesling, almost every time: the dish is sweet, sour, salty and hot at once, and one style of wine answers all four.",
  "terms/index.html": "Winelingo’s Terms of Use: free to learn with, optional Premium for unlimited scanning. Educational content only, for adults of legal drinking age.",
  "wine-classifications/index.html": "Wine classification systems made simple: Bordeaux 1855, Burgundy Grand Cru, Rioja’s ageing tiers, German Prädikat and more, and what each label tier means.",
};
const TITLES = { "privacy/index.html": "Winelingo Privacy Policy — What the Wine App Collects", "terms/index.html": "Winelingo Terms of Use — Rules for Using the Wine App", "tools/index.html": "Wine Tools: Serving Temperature & Calories | Winelingo", "support/index.html": "Winelingo Support & Contact — Help With the Wine App" };
for (const [k, v] of Object.entries(DESC)) if (v.length > 160) throw new Error(`desc too long for ${k}: ${v.length}`);

for (const f of files) {
  const r = rel(f); if (SKIP.has(r)) continue;
  let html = fs.readFileSync(f, "utf8"); const orig = html;
  html = html.replace(/© 2026 Jonas Egeskov · Denmark/g, () => { counts.footer++; return '© 2026 Jonas Egeskov · <a href="https://egeskovengineering.com">Egeskov Engineering</a>, Denmark'; });
  html = html.replace(/<img src="\/assets\/logo\.png" alt="Winelingo app icon">/g, () => { counts.logo++; return '<img src="/assets/logo.png" alt="Winelingo app icon" width="128" height="128" loading="lazy">'; });
  html = html.replace(/<link href="(https:\/\/fonts\.googleapis\.com\/css2\?[^"]+)" rel="stylesheet">/g, (m, u) => { counts.fonts++; return `<link rel="preload" as="style" href="${u}">\n<link rel="stylesheet" href="${u}" media="print" onload="this.media='all'">\n<noscript><link rel="stylesheet" href="${u}"></noscript>`; });
  html = html.replace(/"author":\{"@type":"Organization","name":"Winelingo","url":"https:\/\/winelingo\.app\/"\}/g, () => { counts.author++; return '"author":{"@type":"Person","@id":"https://winelingo.app/#jonas-egeskov","name":"Jonas Egeskov","url":"https://winelingo.app/about/"}'; });
  const dm = (html.match(/"dateModified":"(\d{4}-\d{2}-\d{2})"/) || [])[1];
  if (dm && /"@type":"Article"/.test(html) && !/class="byline"/.test(html)) html = html.replace(/(<p class="deck[^"]*">[\s\S]*?<\/p>)/, (m) => { counts.byline++; return `${m}\n    <p class="byline">By <a href="/about/">Jonas Egeskov</a> · Updated <time datetime="${dm}">${human(dm)}</time></p>`; });
  html = html.replace(/<img src="\/assets\/photos\/([^"]+)\.jpg"([^>]*)>/g, (m, base, rest, offset) => {
    if (!photoExists(`${base}.webp`)) return m;
    const before = html.slice(Math.max(0, offset - 600), offset); if (before.lastIndexOf("<picture>") > before.lastIndexOf("</picture>")) return m;
    const isHero = /fetchpriority="high"/.test(rest);
    const cands = [800, 1200].filter((w) => photoExists(`${base}-${w}.webp`)).map((w) => `/assets/photos/${base}-${w}.webp ${w}w`);
    const srcset = isHero && cands.length ? `${cands.join(", ")}, /assets/photos/${base}.webp 1500w` : (photoExists(`${base}-800.webp`) && !isHero ? `/assets/photos/${base}-800.webp` : `/assets/photos/${base}.webp`);
    counts.picture++; if (isHero) counts.srcset++;
    return `<picture><source type="image/webp" srcset="${srcset}"${isHero ? ' sizes="100vw"' : ""}><img src="/assets/photos/${base}.jpg"${rest}></picture>`;
  });
  const tm = html.match(/<title>([^<]*)<\/title>/);
  if (tm) { const oldRaw = tm[1]; let t = dec(oldRaw); if (TITLES[r]) t = TITLES[r]; else if (t.length > 60) { t = t.replace(/ \| Winelingo$/, ""); if (t.length > 60) t = t.replace("Taste, Grapes & Producers", "Grapes & Producers"); }
    if (t !== dec(oldRaw)) { counts.title++; html = html.replace(/<title>[^<]*<\/title>/, () => `<title>${enc(t)}</title>`); html = html.replace(new RegExp(`(<meta property="og:title" content=")${esc(oldRaw)}(")`), (m, a, b) => { counts.ogSync++; return `${a}${enc(t)}${b}`; }); html = html.replace(new RegExp(`(<meta name="twitter:title" content=")${esc(oldRaw)}(")`), (m, a, b) => `${a}${enc(t)}${b}`); } }
  if (DESC[r]) { const old = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1]; if (old && old !== DESC[r]) { counts.desc++; html = html.split(old).join(DESC[r]); } }
  if (HUB_H2[r] && !html.includes('class="hub-h2')) html = html.replace(/<div class="hub-grid">/, (m) => { counts.h2++; return `<h2 class="hub-h2 reveal">${HUB_H2[r]}</h2>${m}`; });
  const slug = r.split("/")[1];
  if (/^food-and-wine-pairing\/[^/]+\/index\.html$/.test(r) && pairingInfo.has(slug) && !html.includes("More food and wine pairings")) {
    const links = relatedFor(slug).map((o) => `<a href="/food-and-wine-pairing/${o.slug}/">${enc(labelFor(o.h1))}</a>`).join("");
    const inner = `<strong>More food and wine pairings</strong><div style="margin-top:10px;display:grid;gap:8px">${links}</div>`;
    const before = html;
    html = html.replace(/(<div class="callout"><strong>Keep learning<\/strong>[\s\S]*?<\/div><\/div>)/, (m) => `${m}<div class="callout" style="margin-top:14px">${inner}</div>`);
    if (html === before) { const standalone = `<section class="wrap" style="max-width:var(--maxw-prose);padding-bottom:10px"><div class="callout">${inner}</div></section>`; const faq = html.search(/<section class="section"[^>]*><div class="wrap"><div class="section-head"><p class="eyebrow center reveal">FAQ/); if (faq > -1) html = html.slice(0, faq) + standalone + html.slice(faq); else html = html.replace(/<section class="wrap"><div class="appband">/, (m) => standalone + m); }
    if (html !== before) counts.related++; else console.warn("no anchor for related block on", r);
  }
  const key = r.replace(/\/index\.html$/, "");
  if (siblingsOf.has(key) && !html.includes("More from Winelingo")) {
    const dir = key.split("/")[0]; const heading = dir === "learn" ? "More guides" : "More classifications explained";
    const links = siblingsOf.get(key).map((s) => `<a href="/${dir}/${s}/">${enc(h1Of(`${dir}/${s}`))}</a>`).join("");
    const block = `<section class="wrap" style="max-width:var(--maxw-prose);padding-bottom:10px"><div class="callout"><strong>${heading}</strong><div style="margin-top:10px;display:grid;gap:8px">${links}</div><p style="margin:12px 0 0;font-size:13px;color:var(--muted)">More from Winelingo: <a href="/${dir}/">${dir === "learn" ? "the full learn hub" : "all wine classifications"}</a>.</p></div></section>`;
    const before = html; const faq = html.search(/<section class="section"[^>]*><div class="wrap"><div class="section-head"><p class="eyebrow center reveal">FAQ/); if (faq > -1) html = html.slice(0, faq) + block + html.slice(faq); else html = html.replace(/<section class="wrap"><div class="appband">/, (m) => block + m);
    if (html !== before) counts.siblings++;
  }
  if (html !== orig) fs.writeFileSync(f, html);
}
const cssPath = path.join(ROOT, "assets/site.css"); let css = fs.readFileSync(cssPath, "utf8");
if (!css.includes(".byline{")) { css += `\n/* Author byline under page decks */\n.byline{margin-top:14px; font-size:14px; color:var(--muted)}\n.byline a{color:var(--wine); text-decoration:none; border-bottom:1px solid var(--line)}\n.byline a:hover{border-bottom-color:var(--wine)}\n/* Hub grid heading (keeps h1 -> h2 -> h3 order) */\n.hub-h2{max-width:var(--maxw); margin:0 auto 22px; padding:0 24px; font-size:clamp(22px,2.6vw,28px); color:var(--wine-deep)}\n`; }
if (!css.includes(".xref{")) { css += `\n/* Region/style cross-reference line */\n.xref{font-size:15px; color:var(--muted); margin:-6px 0 22px}\n`; }
fs.writeFileSync(cssPath, css);
console.log(JSON.stringify(counts));

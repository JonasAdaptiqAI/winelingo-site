// Honest lastmod: per page, the last git commit that touched it, ignoring bulk sweeps
// (commits touching >100 index.html files) and merge commits. Writes sitemap.xml lastmod
// and bumps Article dateModified forward when the computed date is newer.
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";
const ROOT = path.resolve(import.meta.dirname, "..");
const SITE = "https://winelingo.app";
const sh = (c) => execSync(c, { cwd: ROOT, encoding: "utf8" });
// Classify commits once.
const commits = sh(`git log --format=%H%x09%cs%x09%P`).trim().split("\n").map((l) => { const [h, d, p] = l.split("\t"); return { h, d, merge: (p ?? "").trim().split(" ").filter(Boolean).length > 1 }; });
const sweep = new Set();
for (const c of commits) {
  if (c.merge) { sweep.add(c.h); continue; }
  const n = sh(`git show --stat=200 --format= ${c.h}`).split("\n").filter((l) => /index\.html/.test(l)).length;
  if (n > 100) sweep.add(c.h);
}
const dateFor = (rel) => {
  const hs = sh(`git log --format=%H -- "${rel}"`).trim().split("\n").filter(Boolean);
  const h = hs.find((x) => !sweep.has(x)) ?? hs[hs.length - 1];
  return h ? commits.find((c) => c.h === h)?.d : null;
};
const files = [];
(function walk(d) { for (const e of fs.readdirSync(d, { withFileTypes: true })) { if (e.name === ".git" || e.name === "assets" || e.name === "scripts") continue; const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (e.name === "index.html") files.push(p); } })(ROOT);
const dates = new Map();
for (const f of files) { const rel = path.relative(ROOT, f); const d = dateFor(rel); if (d) dates.set("/" + rel.replace(/index\.html$/, ""), d); }
// sitemap
let sm = fs.readFileSync(path.join(ROOT, "sitemap.xml"), "utf8"); let changed = 0;
sm = sm.replace(/<url><loc>([^<]+)<\/loc><lastmod>([^<]+)<\/lastmod><\/url>/g, (m, loc, old) => { const p = loc.replace(SITE, ""); const d = dates.get(p); if (d && d !== old) { changed++; return `<url><loc>${loc}</loc><lastmod>${d}</lastmod></url>`; } return m; });
fs.writeFileSync(path.join(ROOT, "sitemap.xml"), sm);
// dateModified forward only
let bumped = 0;
for (const f of files) { const rel = "/" + path.relative(ROOT, f).replace(/index\.html$/, ""); const d = dates.get(rel); if (!d) continue; let html = fs.readFileSync(f, "utf8"); const next = html.replace(/"dateModified":"(\d{4}-\d{2}-\d{2})"/g, (m, old) => (d > old ? `"dateModified":"${d}"` : m)); if (next !== html) { bumped++; fs.writeFileSync(f, next); } }
const dist = {}; for (const d of dates.values()) dist[d] = (dist[d] ?? 0) + 1;
console.log(`sweep commits ignored: ${sweep.size}; sitemap lastmod changed: ${changed}; dateModified bumped: ${bumped}`);
console.log("lastmod distribution:", Object.entries(dist).sort().map(([d, n]) => `${d}:${n}`).join(" "));

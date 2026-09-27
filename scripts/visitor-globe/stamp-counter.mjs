#!/usr/bin/env node
// stamp-counter.mjs — put the anonymous visit counter on every page of this site.
//
//   node scripts/visitor-globe/stamp-counter.mjs --check    dry run
//   node scripts/visitor-globe/stamp-counter.mjs            apply (or refresh an older copy)
//   node scripts/visitor-globe/stamp-counter.mjs --remove   undo
//
// The counter feeds the visitor globe (#around-the-world on the homepage). It sends
// the site name only, via navigator.sendBeacon, to egeskovengineering.com/api/visit:
//   - "visit" once per browser session (sessionStorage flag, no cookie, no id)
//   - "tick" at most once a minute while a page is open, for "here right now"
// The country is added server-side from Vercel's geo header; the IP is never stored.
//
// Idempotent: the block sits between marker comments and is replaced wholesale, so
// re-running after editing SNIPPET updates every page. New pages made by the content
// pipeline need a re-run (same as growth/analytics.mjs for the Umami block).

import { readFileSync, writeFileSync, readdirSync, statSync } from "fs";
import { join, dirname, relative } from "path";
import { fileURLToPath } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const SITE = "winelingo";
const START = "<!-- visit-counter -->";
const END = "<!-- /visit-counter -->";
const SNIPPET = `${START}
<script>
/* Anonymous visit counter for the homepage visitor globe: the site name only, no cookies, no ids. */
(function(){var u='https://egeskovengineering.com/api/visit',s='${SITE}',k='vg-last';
function send(kind){try{navigator.sendBeacon(u,JSON.stringify({site:s,kind:kind}));sessionStorage.setItem(k,String(Date.now()))}catch(e){}}
function tick(){try{if(Date.now()-Number(sessionStorage.getItem(k)||0)>55000)send('tick')}catch(e){}}
try{sessionStorage.getItem(k)?tick():send('visit')}catch(e){}
setInterval(function(){if(!document.hidden)tick()},60000);})();
</script>
${END}`;

const BLOCK_RE = new RegExp(`\\n?${START}[\\s\\S]*?${END}\\n?`, "g");
const NOT_A_PAGE = /^(google[0-9a-f]{16}\.html|BingSiteAuth\.html|yandex_[0-9a-f]+\.html)$/i;
const check = process.argv.includes("--check");
const remove = process.argv.includes("--remove");

function pages(dir, acc = []) {
  for (const e of readdirSync(dir)) {
    if (e.startsWith(".") || e === "node_modules" || (dir === ROOT && e === "scripts")) continue;
    const p = join(dir, e);
    if (statSync(p).isDirectory()) pages(p, acc);
    else if (e.endsWith(".html") && !NOT_A_PAGE.test(e)) acc.push(p);
  }
  return acc;
}

let changed = 0, same = 0;
const problems = [];
for (const file of pages(ROOT)) {
  const src = readFileSync(file, "utf8");
  const stripped = src.replace(BLOCK_RE, "\n");
  let out;
  if (remove) out = stripped;
  else if (!/<\/head>/i.test(stripped)) { problems.push(relative(ROOT, file)); continue; }
  else out = stripped.replace(/<\/head>/i, `${SNIPPET}\n</head>`);
  // Normalise the blank line the strip leaves so re-runs are byte-stable.
  if (out === src) { same++; continue; }
  if (!check) writeFileSync(file, out, "utf8");
  changed++;
}
console.log(`${check ? "would change" : remove ? "removed from" : "stamped"}: ${changed} · unchanged: ${same}`);
if (problems.length) console.log(`no </head>, skipped: ${problems.join(", ")}`);

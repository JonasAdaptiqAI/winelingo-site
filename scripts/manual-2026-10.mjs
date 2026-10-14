// One-off fixes from the October 2026 follow-up (idempotent): pricing title, test-page
// descriptions over 160 chars, a real <h2> on the JS-rendered test pages, .gitignore.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = (p) => fs.readFileSync(path.join(ROOT, p), "utf8");
const write = (p, s) => fs.writeFileSync(path.join(ROOT, p), s);
const dec = (s) => s.replace(/&amp;/g, "&");
const log = [];

// 1. /pricing/ title (69 chars -> 55). og/twitter titles are the short "Winelingo Pricing" already.
{ const p = "pricing/index.html"; let s = read(p); const t = "Winelingo Pricing: Premium Plan and the Course for Life";
  if (!s.includes(`<title>${t}</title>`)) { s = s.replace(/<title>[^<]*<\/title>/, `<title>${t}</title>`); write(p, s); log.push(`pricing title -> ${t.length} chars`); } }

// 2. Test-page descriptions over 160 characters.
const TAIL = " Ten questions, each explained. Free, no sign-up.";
const DESC = {
  "pricing/index.html": "Winelingo prices: the first course unit is free. Premium is $3.99 a month, 3 days free on the web. The whole course for life is $39.99. Refunds within 14 days.",
  "tests/index.html": "Free wine quiz: 8 tests of 10 questions on grapes, serving, food pairing, labels, sparkling wine and faults, each answer explained. Wine trivia for all levels.",
  "tests/food-and-wine/index.html": "Simple pairing principles that suggest a wine making both the dish and the glass taste better." + TAIL,
  "tests/red-grapes/index.html": "The ten red grapes behind wine lists, light to full, and which grape hides behind Barolo, Rioja and Chianti." + TAIL,
  "tests/serving-wine/index.html": "Serve any bottle with confidence: the right glass, temperature, opening and order at the table." + TAIL,
  "tests/sparkling-wine/index.html": "How Champagne, Prosecco, Cava and Crémant differ, how to read a sparkling label, and how to open and pour." + TAIL,
  "tests/white-grapes/index.html": "The nine white grapes you meet everywhere, what they taste like, and which grape hides behind a famous place." + TAIL,
  "tests/wine-faults/index.html": "Recognise the common wine faults, tell them from harmless quirks, and handle a complaint calmly and fairly." + TAIL,
};
for (const [p, d] of Object.entries(DESC)) {
  if (d.length > 160) throw new Error(`${p}: ${d.length} chars`);
  let s = read(p); const old = dec((s.match(/<meta name="description" content="([^"]*)"/) || [])[1] ?? "");
  if (old && old !== d) { s = s.split(old).join(d); write(p, s); log.push(`${p}: description ${old.length} -> ${d.length}`); }
}

// 3. A static <h2> on every test page: the quiz renders no headings, so the rendered page
//    went h1 -> footer h3. The heading says what the deck already promises, above the quiz.
const testPages = ["tests/index.html", ...fs.readdirSync(path.join(ROOT, "tests"), { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => `tests/${e.name}/index.html`)];
for (const p of testPages) {
  let s = read(p); if (s.includes('class="hub-h2 qz-h2')) continue;
  const isHub = p === "tests/index.html";
  const n = isHub ? (JSON.parse((s.match(/<script type="application\/json" id="quiz-data">([\s\S]*?)<\/script>/) || [])[1] || "{}").tests || []).length : 0;
  const text = isHub ? `${n} free tests, ten questions each` : "Ten questions, with the answer explained after each";
  const anchor = isHub ? '<div class="qz-hubwrap" id="quiz">' : '<div class="qz-wrap" id="quiz">';
  if (!s.includes(anchor)) throw new Error(`${p}: quiz anchor not found`);
  s = s.replace(anchor, `<h2 class="hub-h2 qz-h2" style="text-align:center;margin-top:28px">${text}</h2>\n${anchor}`);
  write(p, s); log.push(`${p}: h2 added`);
}

// 4. Keep the untracked .claude/ harness (email previews, a course-page copy) out of the published site.
{ const gi = path.join(ROOT, ".gitignore"); const cur = fs.existsSync(gi) ? fs.readFileSync(gi, "utf8") : "";
  if (!/^\.claude\/$/m.test(cur)) { fs.writeFileSync(gi, cur + (cur && !cur.endsWith("\n") ? "\n" : "") + ".claude/\n.DS_Store\n"); log.push(".gitignore: .claude/ and .DS_Store"); } }
console.log(log.join("\n") || "nothing to do");

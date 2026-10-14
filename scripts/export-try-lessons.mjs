#!/usr/bin/env node
// Export the free "Tasting & senses" lessons (English) to assets/course/try/<id>.json for the
// try-a-lesson mode in assets/course/course.js. Reads through the course-v2 Supabase CLI link in
// the app repo, so run it from there:
//   cd ~/dev/winelingo-app/prototype && node ~/dev/winelingo-site/scripts/export-try-lessons.mjs
// Re-run whenever a lesson in the free unit changes.
import fs from "node:fs";
import { homedir } from "node:os";
const { query } = await import(`${homedir()}/dev/winelingo-app/prototype/scripts/course-v2/db.mjs`);
const OUT = new URL("../assets/course/try", import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });
const rows = query(`select id, topic, title, summary, body, sort_order, steps, outcomes, chapter, chapter_sort, v2_title, v2_summary, v2_len, bank, deep_notes, deeper, v2
  from public.lessons where topic = 'Tasting & senses' and chapter is null order by sort_order`);
const index = [];
for (const r of rows) {
  const { bank, deep_notes, deeper, v2, ...lesson } = r;
  if (!v2 || !Array.isArray(v2.steps) || !v2.steps.length) throw new Error(`${r.id}: no v2 steps`);
  fs.writeFileSync(`${OUT}/${r.id}.json`, JSON.stringify({ lesson, extras: { id: r.id, bank, deep_notes, deeper, v2 } }));
  index.push({ id: r.id, title: r.v2_title || r.title, steps: v2.steps.length });
}
console.log(rows.length, "lessons", JSON.stringify(index.map((x) => x.steps)));

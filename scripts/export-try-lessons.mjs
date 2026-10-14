#!/usr/bin/env node
// Export the lessons of the free units (English) to assets/course/try/<id>.json for the
// try-a-lesson mode in assets/course/course.js. The free units are the first two of the course
// path since app 1.4.0, placed by `v2_unit` / `v2_sort` (merged lessons are not on the path).
// Keep FREE_UNITS in step with FREE_TOPICS in course.js. Reads through the course-v2 Supabase CLI
// link in the app repo (read-only), so run it from there:
//   cd ~/dev/winelingo-app/prototype && node ~/dev/winelingo-site/scripts/export-try-lessons.mjs
// Re-run whenever a lesson in the free units changes. A file for a lesson that left the free
// units is removed, so ?try= cannot play a paid lesson.
import fs from "node:fs";
import { homedir } from "node:os";
const { query } = await import(`${homedir()}/dev/winelingo-app/prototype/scripts/course-v2/db.mjs`);
const FREE_UNITS = ["Foundations", "Tasting & senses"];
const OUT = new URL("../assets/course/try", import.meta.url).pathname;
fs.mkdirSync(OUT, { recursive: true });
const list = FREE_UNITS.map((u) => `'${u.replace(/'/g, "''")}'`).join(", ");
const rows = query(`select id, topic, title, summary, body, sort_order, steps, outcomes, chapter, chapter_sort,
    v2_title, v2_summary, v2_len, v2_unit, v2_sort, v2_merged_into, bank, deep_notes, deeper, v2
  from public.lessons where v2_unit in (${list}) and v2_merged_into is null
  order by array_position(array[${list}]::text[], v2_unit), v2_sort`);
const keep = new Set();
const index = [];
for (const r of rows) {
  const { bank, deep_notes, deeper, v2, ...lesson } = r;
  if (!v2 || !Array.isArray(v2.steps) || !v2.steps.length) throw new Error(`${r.id}: no v2 steps`);
  fs.writeFileSync(`${OUT}/${r.id}.json`, JSON.stringify({ lesson, extras: { id: r.id, bank, deep_notes, deeper, v2 } }));
  keep.add(`${r.id}.json`);
  index.push({ unit: r.v2_unit, id: r.id, title: r.v2_title || r.title, steps: v2.steps.length });
}
const gone = fs.readdirSync(OUT).filter((f) => f.endsWith(".json") && !keep.has(f));
for (const f of gone) fs.unlinkSync(`${OUT}/${f}`);
for (const x of index) console.log(`${x.unit} · ${x.id} · ${x.steps} steps · ${x.title}`);
console.log(`${rows.length} lessons exported${gone.length ? `, removed ${gone.join(", ")}` : ""}`);

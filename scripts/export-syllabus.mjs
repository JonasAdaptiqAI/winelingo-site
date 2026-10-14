#!/usr/bin/env node
// Export the course syllabus to data/course/syllabus.json for the public course pages
// (scripts/build-course-pages.mjs) and the guide lesson cards (scripts/build-lesson-cta.mjs).
// One row per lesson on the course path, as the app shows it since 1.4.0: unit and place from
// `v2_unit` / `v2_sort`, merged lessons (`v2_merged_into`) left out. Course 2.0 title, summary and
// outcomes in English, plus the Danish translation (translations: 'lesson' for the title and
// summary, 'lesson_extra' for the v2 outcomes). n = the lesson's card count (v2_len), for minutes.
// Read-only; runs through the course-v2 Supabase CLI link in the app repo, so run it from there:
//   cd ~/dev/winelingo-app/prototype && node ~/dev/winelingo-site/scripts/export-syllabus.mjs
// Then: node scripts/build-course-pages.mjs && node scripts/build-lesson-cta.mjs
import fs from "node:fs";
import { homedir } from "node:os";
const { query } = await import(`${homedir()}/dev/winelingo-app/prototype/scripts/course-v2/db.mjs`);
const OUT = new URL("../data/course/syllabus.json", import.meta.url).pathname;
const rows = query(`select l.id, l.v2_unit as unit, l.v2_sort as s, coalesce(l.v2_title, l.title) as t,
    coalesce(l.v2_summary, l.summary) as sum, coalesce(l.v2->'outcomes', l.outcomes) as out, l.v2_len as n,
    tl.fields->>'v2_title' as da_t, tl.fields->>'v2_summary' as da_sum, tx.fields->'v2'->'outcomes' as da_out
  from public.lessons l
  left join public.translations tl on tl.entity_type = 'lesson' and tl.entity_id = l.id and tl.lang = 'da'
  left join public.translations tx on tx.entity_type = 'lesson_extra' and tx.entity_id = l.id and tx.lang = 'da'
  where l.v2_merged_into is null
  order by l.v2_unit, l.v2_sort`);
const out = rows.map((r) => {
  const miss = ["unit", "s", "t", "sum", "out", "n", "da_t", "da_sum", "da_out"].filter((k) => r[k] == null || (Array.isArray(r[k]) && !r[k].length));
  if (miss.length) throw new Error(`${r.id} (${r.t}): missing ${miss.join(", ")}`);
  return { id: r.id, unit: r.unit, s: r.s, t: r.t, sum: r.sum, out: r.out, n: r.n, da: { t: r.da_t, sum: r.da_sum, out: r.da_out } };
});
fs.writeFileSync(OUT, JSON.stringify(out, null, 1).replace(/^ +/gm, ""));
const units = new Set(out.map((r) => r.unit));
console.log(`syllabus.json: ${out.length} lessons in ${units.size} units`);

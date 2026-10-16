#!/usr/bin/env node
// Export the course syllabus to data/course/syllabus.json for the public course pages
// (scripts/build-course-pages.mjs) and the guide lesson cards (scripts/build-lesson-cta.mjs).
// One row per lesson on the course path, as the app shows it since 1.4.0: unit and place from
// `v2_unit` / `v2_sort`, merged lessons (`v2_merged_into`) left out. Course 2.0 title, summary and
// outcomes in English, plus the Danish, Spanish and German translations (translations: 'lesson' for
// the title and summary, 'lesson_extra' for the v2 outcomes). n = the lesson's card count (v2_len), for minutes.
// Read-only; runs through the course-v2 Supabase CLI link in the app repo, so run it from there:
//   cd ~/dev/winelingo-app/prototype && node ~/dev/winelingo-site/scripts/export-syllabus.mjs
// Then: node scripts/build-course-pages.mjs && node scripts/build-lesson-cta.mjs
import fs from "node:fs";
import { homedir } from "node:os";
const { query } = await import(`${homedir()}/dev/winelingo-app/prototype/scripts/course-v2/db.mjs`);
const OUT = new URL("../data/course/syllabus.json", import.meta.url).pathname;
const LANGS = ["da", "es", "de"];
const rows = query(`select l.id, l.v2_unit as unit, l.v2_sort as s, coalesce(l.v2_title, l.title) as t,
    coalesce(l.v2_summary, l.summary) as sum, coalesce(l.v2->'outcomes', l.outcomes) as out, l.v2_len as n,
    ${LANGS.map((g) => `t_${g}.fields->>'v2_title' as ${g}_t, t_${g}.fields->>'v2_summary' as ${g}_sum, x_${g}.fields->'v2'->'outcomes' as ${g}_out`).join(",\n    ")}
  from public.lessons l
  ${LANGS.map((g) => `left join public.translations t_${g} on t_${g}.entity_type = 'lesson' and t_${g}.entity_id = l.id and t_${g}.lang = '${g}'
  left join public.translations x_${g} on x_${g}.entity_type = 'lesson_extra' and x_${g}.entity_id = l.id and x_${g}.lang = '${g}'`).join("\n  ")}
  where l.v2_merged_into is null
  order by l.v2_unit, l.v2_sort`);
const out = rows.map((r) => {
  const miss = ["unit", "s", "t", "sum", "out", "n", ...LANGS.flatMap((g) => [`${g}_t`, `${g}_sum`, `${g}_out`])].filter((k) => r[k] == null || (Array.isArray(r[k]) && !r[k].length));
  if (miss.length) throw new Error(`${r.id} (${r.t}): missing ${miss.join(", ")}`);
  const o = { id: r.id, unit: r.unit, s: r.s, t: r.t, sum: r.sum, out: r.out, n: r.n };
  for (const g of LANGS) o[g] = { t: r[`${g}_t`], sum: r[`${g}_sum`], out: r[`${g}_out`] };
  return o;
});
fs.writeFileSync(OUT, JSON.stringify(out, null, 1).replace(/^ +/gm, ""));
const units = new Set(out.map((r) => r.unit));
console.log(`syllabus.json: ${out.length} lessons in ${units.size} units`);

#!/usr/bin/env node
// posted.mjs — which carousels have gone out, and what to post next.
//
//   node posted.mjs                      status of everything
//   node posted.mjs next                 the next few worth posting
//   node posted.mjs mark <slug>          check one off (dated today)
//   node posted.mjs mark <slug> 2026-09-01
//   node posted.mjs stats <slug> 1240 58 12    views, likes, comments
//   node posted.mjs unmark <slug>        undo
//
// Add --push to any writing command to commit and push, so the state is shared rather than
// sitting on one machine. Without it the change is written locally and left for you to commit.
//
// The carousel list is DISCOVERED from the folders on disk, never hand-maintained — so a
// carousel added later shows up as unposted on its own, and this file cannot silently drift
// out of step with what actually exists.

import { readdirSync, existsSync, readFileSync, writeFileSync, statSync } from 'fs';
import { execFileSync } from 'child_process';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const HERE = dirname(fileURLToPath(import.meta.url));
const LEDGER = join(HERE, 'posted.json');
const argv = process.argv.slice(2);
const cmd = argv[0] ?? 'status';
const push = argv.includes('--push');
const args = argv.filter((a) => !a.startsWith('--'));

const C = process.stdout.isTTY
  ? { g:'\x1b[32m', y:'\x1b[33m', d:'\x1b[2m', b:'\x1b[1m', x:'\x1b[0m' }
  : { g:'', y:'', d:'', b:'', x:'' };

function discover() {
  const out = [];
  for (const app of readdirSync(HERE).filter((d) => statSync(join(HERE, d)).isDirectory())) {
    for (const slug of readdirSync(join(HERE, app))) {
      const dir = join(HERE, app, slug);
      if (!statSync(dir).isDirectory()) continue;
      const slides = readdirSync(dir).filter((f) => f.endsWith('.jpg')).length;
      if (!slides) continue;
      out.push({ app, slug, slides, hasCaption: existsSync(join(dir, 'caption.txt')) });
    }
  }
  return out.sort((a, b) => (a.app + a.slug).localeCompare(b.app + b.slug));
}

const ledger = existsSync(LEDGER) ? JSON.parse(readFileSync(LEDGER, 'utf8')) : {};
const save = (msg) => {
  writeFileSync(LEDGER, JSON.stringify(ledger, null, 2) + '\n', 'utf8');
  if (!push) { console.log(`\n  ${C.d}written locally — add --push to share it${C.x}\n`); return; }
  try {
    execFileSync('git', ['add', LEDGER], { cwd: HERE, stdio: 'pipe' });
    execFileSync('git', ['commit', '-m', msg], { cwd: HERE, stdio: 'pipe' });
    execFileSync('git', ['push'], { cwd: HERE, stdio: 'pipe' });
    console.log(`\n  ${C.g}pushed${C.x}\n`);
  } catch (e) {
    console.log(`\n  ${C.y}saved, but the push failed${C.x} — commit by hand:\n  ${String(e.stderr || e.message).trim().split('\n')[0]}\n`);
  }
};

const all = discover();
const key = (c) => `${c.app}/${c.slug}`;
const find = (slug) => {
  const hits = all.filter((c) => c.slug === slug || key(c) === slug);
  if (!hits.length) { console.error(`\n  no carousel "${slug}". Run without arguments to list them.\n`); process.exit(1); }
  if (hits.length > 1) { console.error(`\n  "${slug}" matches ${hits.map(key).join(', ')} — use the full app/slug form.\n`); process.exit(1); }
  return hits[0];
};

if (cmd === 'status' || cmd === 'list') {
  const done = all.filter((c) => ledger[key(c)]?.posted);
  console.log(`\n  ${C.b}${done.length} of ${all.length} posted${C.x}\n`);
  let app = null;
  for (const c of all) {
    if (c.app !== app) { app = c.app; console.log(`  ${C.b}${app}${C.x}`); }
    const e = ledger[key(c)];
    const mark = e?.posted ? `${C.g}✓${C.x}` : `${C.d}·${C.x}`;
    const when = e?.posted ? `${C.d}${e.date}${C.x}` : '';
    const perf = e?.views != null ? `  ${C.d}${e.views} views · ${e.likes ?? 0} likes${C.x}` : '';
    const warn = c.hasCaption ? '' : `  ${C.y}no caption${C.x}`;
    console.log(`    ${mark} ${c.slug.padEnd(22)} ${String(c.slides).padStart(2)} slides  ${when}${perf}${warn}`);
  }
  console.log('');
} else if (cmd === 'next') {
  const todo = all.filter((c) => !ledger[key(c)]?.posted);
  console.log(`\n  ${C.b}${todo.length} still to post${C.x}\n`);
  for (const c of todo.slice(0, 8)) console.log(`    ${c.app}/${C.b}${c.slug}${C.x}  ${C.d}${c.slides} slides${C.x}`);
  if (todo.length > 8) console.log(`    ${C.d}…and ${todo.length - 8} more${C.x}`);
  console.log('');
} else if (cmd === 'mark') {
  const c = find(args[1]);
  const date = args[2] ?? new Date().toISOString().slice(0, 10);
  ledger[key(c)] = { ...(ledger[key(c)] ?? {}), posted: true, date };
  console.log(`\n  ${C.g}✓${C.x} ${key(c)} posted ${date}`);
  save(`posted: ${key(c)} on ${date}`);
} else if (cmd === 'unmark') {
  const c = find(args[1]);
  delete ledger[key(c)];
  console.log(`\n  ${key(c)} cleared`);
  save(`unposted: ${key(c)}`);
} else if (cmd === 'stats') {
  const c = find(args[1]);
  const e = ledger[key(c)];
  if (!e?.posted) { console.error(`\n  ${key(c)} is not marked posted yet.\n`); process.exit(1); }
  ledger[key(c)] = { ...e, views: Number(args[2]), likes: Number(args[3] ?? 0), comments: Number(args[4] ?? 0) };
  console.log(`\n  ${key(c)}: ${args[2]} views, ${args[3] ?? 0} likes, ${args[4] ?? 0} comments`);
  save(`stats: ${key(c)}`);
} else {
  console.error(`\n  Unknown command "${cmd}".\n  Try: status · next · mark <slug> [date] · unmark <slug> · stats <slug> <views> <likes> <comments>\n  Add --push to share the change.\n`);
  process.exit(1);
}

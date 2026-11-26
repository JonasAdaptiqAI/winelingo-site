# Winelingo — marketing site (winelingo.app)

You are a senior UI designer and front-end developer with a strong eye for editorial
typography, spacing, and restraint. Approach every change as both designer and developer:
picture the rendered result before writing code. Prioritise polish and warmth.

## What this repo is
The public marketing site for **Winelingo**, a wine-education iPhone app ("Duolingo for wine":
scan a label → identify it → learn about it → build your palate). Served by **GitHub Pages**
on the custom domain **winelingo.app** (see `CNAME`), no build step, `.nojekyll` present.
Everything is hand-written static HTML/CSS/JS.

## ⚠️ Do not break these — they are load-bearing
- `/privacy` (`privacy/index.html`) and `/terms` (`terms/index.html`) MUST keep resolving at
  those exact paths. `https://winelingo.app/privacy` is the App Store Privacy Policy URL and
  both are hardcoded in the shipping app (`prototype/lib/legal.ts`). Never rename/move them.
- Keep `CNAME` (winelingo.app) and `.nojekyll`.
- The `.app` TLD is HTTPS-only — nothing may depend on plain HTTP.

## Honesty rules for all copy (the site must match the shipped app)
- **The app is LIVE.** It shipped 2026-08-17 (id 6785896824) and 1.0.1 followed on
  2026-08-29. Link to the App Store; the "Coming soon" framing this file used to mandate
  is dead. Do not reintroduce it.
- **Never write "no in-app purchases".** 300-odd static pages still carry that line and
  it goes false the moment Premium is on sale — a claim baked into static HTML is
  expensive to retract. The wording that is true either side of that release, and what
  the newest pairing pages use, is **"Free to download, with Premium for unlimited
  scans."** `growth/paywall-copy.mjs` in the Wine App repo sweeps the older pages.
- **Check the release state before writing about pricing; do not assume it from this
  file.** `node growth/pulse.mjs` reports the live App Store version, and the legal pages
  in this repo are updated when Premium ships. As of 2026-09-01 the store showed 1.0.1,
  free, with no Premium in the listing description, while `main` carried a commit saying
  Premium is live — so the two were not in step. Verify, do not infer.
- ⚠️ A claim frozen into static HTML has to be true at the far end of the roadmap, not
  just today. That is the lesson these two bullets encode; it cost a near-miss on the
  carousels to learn.
- Include an **18+ / drink responsibly** line (the App Store rating; Apple retired 17+). Legal entity/contact: **Jonas Egeskov, Denmark**,
  hello@winelingo.app.

## Design system (single source of truth: app repo `design/Design-Guide.md`)
- Palette — paper `#FBF7F4`, paper-raised `#FFFDFB`, parchment `#F3ECE3`, wine `#7B1E3B`,
  wine-deep `#3B0A1E`, gold `#C9A24A` (seasoning only, never body text on cream), ink `#2B2B2B`,
  muted `#8A7F86`, line `#EFE5EA`, vine `#6E7B54`, blush `#E8A0B0`.
- Type — display **Fraunces** (serif, for names/headlines), body **Inter** (UI/body).
  Eyebrows: Inter, UPPERCASE, letter-spaced, in wine.
- Voice — warm, plain-language, encouraging; a knowledgeable friend, never a gatekeeper.
- One hero colour per view (burgundy leads); gold is a thin accent line, not a fill.
- Warm & light, NOT dark. If it feels cold/dark/purple/SaaS, it's wrong for this brand.
- The one deliberate exception: the homepage (`body.dark-page`) and the top of `/business` open on a
  candlelit scroll story (`assets/hero/`), and the homepage stays in that warm night (#120907, cream
  type, blush/gold accents) down to the footer. Jonas chose this on 2026-10-26; don't lighten it back.
  `assets/hero/{home,business}.{css,js}` are generated from the prototype in
  ~/dev/winelingo-hero-prototype (work/scope_css.py, work/make_site_hero.py); edit there and regenerate.

## Waitlist form
`index.html` posts to Formspree. Replace `YOUR_FORM_ID` in the form `action` with the real
Formspree form id to activate it; until then the form falls back to a mailto prompt.

## Site-wide parts and their builders (since 2026-10-27)
- **Header and footer** live in `scripts/build-chrome.mjs` (English, and Danish for pages under `/da/`). Edit there and run it; never hand-edit the copies in 570 pages. Other builders copy the header from `tools/index.html`, so run build-chrome first.
- **Search**: `scripts/build-search.sh` rebuilds the Pagefind index in `/pagefind/` (settings in `pagefind.yml`). Re-run it after adding or changing pages, or new pages won't be found.
- **Danish homepage** `/da/` is built from `index.html` + `data/home-da.json` by `scripts/build-home-da.mjs`. After changing the English homepage, run it; it fails and lists any sentence that has no Danish yet.
- **Danish business page** `/da/restauranter/` is built from `business/index.html` + `data/business-da.json` by `scripts/build-business-da.mjs` (every `data-t="key"` element gets the Danish string with that key; a missing one stops the build). **Danish test hub** `/da/vinquiz/` is written by `scripts/build-tests.mjs` next to `/tests/`, with the Danish words from the `UI.da` table in `assets/quiz.js`. Both English pages send Danish visitors on to the Danish page (browser language, a saved choice or an old `?lang=da` link) unless they chose English. Tests that exist in Danish also have a Danish page each, `/da/vinquiz/<Danish slug>/` (slugs in `data/tests/da-slugs.json`, which `build-chrome.mjs` reads too for the header language link); it shows the quiz and, below it, every question with its answer folded away, so the words are in the HTML. The English test address sends a Danish visitor or an old `?lang=da` link on. German and Spanish, the exam tests and the palate quiz are still one address with `?lang=`. Slugs follow search demand: Danes type "vin quiz" and "quiz om vin med svar"; "vintest" means wine reviews.
- **Next-step cards** (free lesson + matching test) on reference pages come from `data/lesson-cta.json` (`pages` and whole `sections`) via `scripts/build-lesson-cta.mjs`. A section can name its own `anchors` first; pairing pages put the card above the FAQ.
- **Shelf card on pairing pages** ("In the wine shop? Check a bottle before you buy it", right under the answer; button on phones, QR on computers) comes from `scripts/build-shelf-cta.mjs`, styles `.shelf-cta` in `assets/site.css`, clicks counted as `appstore-click` with `cta: pairing-shelf`. Re-run it after regenerating pairing pages; it replaces its own card.
- **Comparison pages and the FAQ** (`/compare/…`, `/faq/`) are built by `scripts/build-compare.mjs` from `data/compare/`: `competitors.json` (other apps: sourced, dated facts plus a `short` block for table cells), `winelingo.json` (ours) and `pages.mjs` (copy). Tables are generated from the facts. Rules: every claim about another app must be in the fact file with a source; say "its listing does not describe…" rather than "it has no…"; say where another app is the better choice; re-check the facts and bump `checked` before editing (prices and features go stale). An independent fact-check found 18 overstatements in the first draft, three of them about Winelingo itself, so run one again after any rewrite. Two more fact files feed pages about things that are not consumer apps: `staff-training.json` (tools for training restaurant staff, `{{staff:id,…}}`) and `wset-practice.json` (exam practice resources and the official exam formats, `{{wset:id,…}}` and `{{examformat}}`); each has its own `checked` date and an entry for Winelingo written from our own pages. Apps added to `competitors.json` later carry their own `checked`; a page that mixes dates sets `checkedFrom`. New compare pages are added to `sitemap.xml` and `llms.txt` by hand.
- **Reading measurement:** `assets/read-signal.js` (added to every page by `build-chrome.mjs`) sends the Umami events `engaged-30s`, `engaged-2m`, `read-50` and `read-90`, each with the site `section`. Umami alone cannot see reading on one-page visits. The privacy policy's "The website" section describes it; update that text if the events change.
- **Bing Webmaster Tools verification:** `BingSiteAuth.xml` in the root and the `msvalidate.01` meta tag in `index.html` prove ownership of the site to Bing. Keep both; removing them drops the verification.
- **Guides** (`/learn/<slug>/` with a file in `data/guides/`) are built by `scripts/build-guides.mjs`, which clones the page chrome from `learn/how-to-taste-wine/`. Edit the JSON, then run `node scripts/build-guides.mjs <slug>`: naming the guide moves its "Updated" date to today. A run without a slug rebuilds every guide and keeps each page's own dates, so it should leave no diff. Then build-lesson-cta and build-chrome.
- Order after content changes: build-tests / build-compare / other builders → build-shelf-cta → build-lesson-cta → build-home-da → build-business-da → build-chrome → build-search. Note: build-tests rewrites test pages and drops the course-band that `build-course-pages.mjs` puts on `tests/after-dinner/`; re-run that or restore it.

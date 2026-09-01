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
- Include a **17+ / drink responsibly** line. Legal entity/contact: **Jonas Egeskov, Denmark**,
  jonsegeskov29@gmail.com.

## Design system (single source of truth: app repo `design/Design-Guide.md`)
- Palette — paper `#FBF7F4`, paper-raised `#FFFDFB`, parchment `#F3ECE3`, wine `#7B1E3B`,
  wine-deep `#3B0A1E`, gold `#C9A24A` (seasoning only, never body text on cream), ink `#2B2B2B`,
  muted `#8A7F86`, line `#EFE5EA`, vine `#6E7B54`, blush `#E8A0B0`.
- Type — display **Fraunces** (serif, for names/headlines), body **Inter** (UI/body).
  Eyebrows: Inter, UPPERCASE, letter-spaced, in wine.
- Voice — warm, plain-language, encouraging; a knowledgeable friend, never a gatekeeper.
- One hero colour per view (burgundy leads); gold is a thin accent line, not a fill.
- Warm & light, NOT dark. If it feels cold/dark/purple/SaaS, it's wrong for this brand.

## Waitlist form
`index.html` posts to Formspree. Replace `YOUR_FORM_ID` in the form `action` with the real
Formspree form id to activate it; until then the form falls back to a mailto prompt.

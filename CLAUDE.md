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
- The launch version is **FREE, no in-app purchases**. Do NOT advertise subscriptions,
  pricing, a "Pro" tier, or push notifications as live features (those are planned for v1.1).
- The app isn't approved yet — use **"Coming soon to the App Store"** framing, not a live
  download link. Swap in the real App Store badge (and link) only once it's approved.
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

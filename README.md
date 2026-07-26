# winelingo-site

The marketing + SEO website for **Winelingo** — winelingo.app. Static HTML/CSS/JS, no build step,
served by **GitHub Pages** (custom domain in `CNAME`, `.nojekyll` present).

## Structure

```
index.html                                  Landing page (hero, features, learn teaser, waitlist, FAQ)
assets/
  site.css                                  Shared design system (tokens, header/footer, components)
  logo.png                                  Small nav/footer logo (real app icon, 128px)
  icon.png / icon-512 / icon-192            App icon at various sizes
  favicon-32 / favicon-16 / apple-touch-icon
  social-card.png                           1200×630 Open Graph / Twitter share image
learn/                                      Learn hub + guides
  index.html · wine-for-beginners/ · how-to-taste-wine/ · how-to-read-a-wine-label/ · understanding-your-wine-taste-profile/
wine-glossary/                              45-term wine glossary (DefinedTermSet schema)
tools/                                      Tools hub + free interactive tools
  index.html · wine-serving-temperature/ · wine-calories/
about/ · support/                           Company pages
privacy/ · terms/                           Legal pages — DO NOT rename or move (see below)
sitemap.xml · robots.txt · site.webmanifest
```

Every page: keyword-led `<title>` + meta description, canonical, `hreflang` (en + x-default),
Open Graph + Twitter, and JSON-LD (Organization / MobileApplication / WebSite / FAQPage / Article /
DefinedTermSet / BreadcrumbList as appropriate). Header/footer are identical across pages.

## ⚠️ Do not break

- `/privacy` and `/terms` must keep resolving at those exact paths. `https://winelingo.app/privacy`
  is the App Store Privacy Policy URL and both are hardcoded in the app (`prototype/lib/legal.ts`).
  Their legal **text** is preserved verbatim from the app repo; only the surrounding page chrome was
  restyled. If you edit the legal copy, sync it with `docs/legal/*.html` in the app repo.
- Keep `CNAME` (winelingo.app) and `.nojekyll`. The `.app` TLD is HTTPS-only.

## Honesty rules for copy

The site must match the shipped app: **free, no in-app purchases**; **coming soon** framing (no live
download link until approved); **17+ / drink responsibly**; and **no fabricated ratings, reviews or
press**. The launch app genuinely ships 4 languages (EN/DA/ES/DE) and an "About the winery" scan note.

## Before it goes fully live — two follow-ups

1. **Waitlist form.** `index.html`'s form posts to Formspree. Create a free form at formspree.io and
   replace `YOUR_FORM_ID` in the form `action` with the real id. Until then the form falls back to a
   `mailto:` prompt, so no signup is lost.
2. **App Store badge.** Once the app is approved, swap the "Coming soon to the App Store" pill for the
   official Apple download badge linked to the App Store listing (hero + CTA + footer).

## Deploy

This repo IS production (GitHub Pages). To publish, commit and push to `main`:

```bash
cd "winelingo-site"
git add -A
git commit -m "Rebuild marketing site with SEO content hub"
git push origin main
```

GitHub Pages redeploys automatically. After it goes live, re-verify `https://winelingo.app/privacy`
and `https://winelingo.app/terms` still load before relying on the App Store submission.

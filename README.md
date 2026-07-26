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

## SEO go-live checklist (do after deploy)

On-page/technical SEO is built in (titles, meta, canonical, hreflang, OG, JSON-LD, sitemap,
internal links, image alt). These need your accounts and can only be done once the site is live:

1. **Google Search Console** — add winelingo.app (verify via DNS TXT at Hostinger, or paste the
   HTML-tag `<meta name="google-site-verification" ...>` into every page's `<head>`), then submit
   `https://winelingo.app/sitemap.xml` and Request Indexing on the homepage.
2. **Bing Webmaster Tools** — same: add the site + submit the sitemap (can import from Search Console).
3. **Analytics** (pick one, paste its snippet into the `<head>` — I can wire it up):
   - Plausible / Fathom (privacy-friendly, no cookie banner), or GA4, or **PostHog** (already used in
     the app, so one dashboard for app + site).
4. Confirm indexing after ~1–2 weeks; expand content (see below) to grow long-tail coverage.

## Photos

Photography lives in `assets/photos/` (see `assets/photos/CREDITS.md`) — all from **Unsplash**, used
under the Unsplash License (commercial-safe, no attribution required). To swap any image, download a
replacement from Unsplash/Pexels and keep the same filename.

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

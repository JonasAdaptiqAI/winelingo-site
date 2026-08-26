# Carousel store

Rendered TikTok carousels, served publicly over HTTPS so they can be pulled by URL.

## The convention — one shape, no exceptions

```
carousels/<app>/<slug>/01.jpg … NN.jpg
carousels/<app>/<slug>/caption.txt
```

Flat by slug. **No series numbers, no batch folders, no dates.** An earlier pass used
`series2`…`series5`, which described the order things were built rather than what they were —
useless a week later, and it made the same content live at four different depths. Flattened
2026-08-26.

This mirrors the app repo's own layout (`growth/out/tiktok/<app>/<slug>/`), so the two line up
when that repo is reachable again.

## Why this branch

`social-assets` is an orphan-style branch off `main`. GitHub Pages serves `main`, so nothing
here appears on winelingo.app — verified: the raw URL returns 200, the live site returns 404.
It exists because TikTok publishing needs images at a public HTTPS address.

## Base URL

```
https://raw.githubusercontent.com/JonasAdaptiqAI/winelingo-site/social-assets/<path>
```

## What is here

| App | Slug | Slides | Caption |
|---|---|---|---|
| chefgaston | american | 6 | yes |
| chefgaston | asian | 6 | yes |
| chefgaston | bbq | 6 | yes |
| chefgaston | chicken | 6 | yes |
| chefgaston | coriander | 6 | yes |
| chefgaston | danish | 6 | yes |
| chefgaston | easy | 6 | yes |
| chefgaston | get-better | 6 | yes |
| chefgaston | hates-cookbooks | 6 | yes |
| chefgaston | hates-cooking | 6 | yes |
| chefgaston | hates-repetition | 6 | yes |
| chefgaston | hates-shopping | 6 | yes |
| chefgaston | indian | 6 | yes |
| chefgaston | italian | 6 | yes |
| chefgaston | latin | 6 | yes |
| chefgaston | loves-cooking | 6 | yes |
| chefgaston | loves-exploring | 6 | yes |
| chefgaston | loves-healthy | 6 | yes |
| chefgaston | loves-mealprep | 6 | yes |
| chefgaston | loves-planning | 6 | yes |
| chefgaston | loves-saving | 6 | yes |
| chefgaston | loves-working-smart | 6 | yes |
| chefgaston | mediterranean | 6 | yes |
| chefgaston | mexican | 6 | yes |
| chefgaston | middle-eastern | 6 | yes |
| chefgaston | pantry | 6 | yes |
| chefgaston | pork | 6 | yes |
| chefgaston | shopping-list | 6 | yes |
| chefgaston | stock-five | 8 | — |
| chefgaston | weight-loss | 6 | yes |

**30 carousels.**

## Known gap

Winelingo's carousels are **not** here. They live in the app repo under
`growth/out/tiktok/winelingo/`, which is currently unreadable because macOS revoked the
session's Documents-folder access. They should be copied in under the same convention once
that is restored, so both apps sit in one place.

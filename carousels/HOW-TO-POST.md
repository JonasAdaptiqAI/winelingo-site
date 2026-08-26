# How to post a carousel

Everything you need for one post lives in one folder. Get the folders once, then it is
download-free from there — `git pull` refreshes them.

---

## One-time setup

```bash
git clone --filter=blob:none --sparse --branch social-assets --depth 1 \
  https://github.com/JonasAdaptiqAI/winelingo-site.git ~/carousels
cd ~/carousels && git sparse-checkout set carousels
```

`--sparse` means you get the carousels and none of the 303 site pages. **44 MB, 30 posts.**
Tested 2026-08-26; this is the exact command that produced the folders described below.

Put it wherever suits — `~/carousels` is only a suggestion.

## Getting new posts later

```bash
cd ~/carousels && git pull
```

New carousels appear as new folders. Nothing you have already posted changes.

---

## What one post looks like

```
carousels/chefgaston/coriander/
    01.jpg   ← cover: Gaston + the hook
    02.jpg   ← first card
    03.jpg
    04.jpg
    05.jpg   ← the closing line
    06.jpg   ← call to action
    caption.txt
```

**Two rules, and they are the only two:**

1. **Upload in filename order.** 01, 02, 03… TikTok keeps the order you add them in, and the
   numbering is the order the argument is built. Out of order it reads as nonsense.
2. **`01.jpg` is the cover.** It carries the hook, so it is the only slide most people see.
   If TikTok offers you a cover choice, keep 01.

`caption.txt` is the whole caption — hook, the lead fact, the link, hashtags. Paste it as-is.

---

## Posting

You already know this part better than I do — you scheduled eight of these natively and it
worked. For the record, the way that worked:

1. **TikTok Studio on desktop** (`tiktokstudio.com`) → Upload → select all the JPEGs in one go.
2. Check the order came through as 01→NN.
3. Paste `caption.txt` into the caption box.
4. Set the date and time. **12:30** has been the standing slot; keep it constant while the
   format is the thing being tested.
5. Audience **Everyone**.

Scheduling from the phone app is not available — it is desktop only.

⚠️ **How far ahead you can schedule is worth checking on the day.** The documented limit is 10
days; some accounts report 30. Your date picker is the authority, not the documentation.

---

## ⚠️ Before you schedule any Chef Gaston post

**The last slide says "Download on the App Store".** That was a deliberate decision on the basis
that the app would be live by the time these post.

So these are gated on the release, not on the calendar. **A carousel posted before Chef Gaston is
on the App Store makes its own closing slide false** — and a posted carousel is a JPEG on TikTok
that cannot be edited afterwards. Deleting and reposting loses whatever reach it had.

If you need to post before launch, say so and the closing slide can be swapped for the
waitlist version in a couple of minutes. It is one file per carousel.

---

## Which account

`carousels/chefgaston/…` → the **Chef Gaston** account. Nothing here belongs on Winelingo; the
two series look nothing alike on purpose and the CTAs point at different products.

## Not here yet

**Winelingo's carousels are missing from this store.** They are in the app repo under
`growth/out/tiktok/winelingo/`, which is unreadable while macOS has the session's
Documents-folder access revoked. Once that is restored they should be copied in under the same
`carousels/<app>/<slug>/` shape so both apps are in one place.

Until then, Winelingo posts come from the repo folder as before.

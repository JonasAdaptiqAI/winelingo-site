# visitor-globe

The rotating "Wine lovers, everywhere" globe on the homepage (`#around-the-world`).
Plain 2D canvas (no WebGL), about 36 KB gzipped including the world map, no third-party requests.
The same file is meant for cardzo.app, chefgastonapp.com and Egeskov Engineering (`data-theme="dark"`).

- Data: `GET https://egeskovengineering.com/api/visitors?site=winelingo` returns
  `{ visitors, active, countries: [{ code, visitors }] }` (`visitors` = visits: one per browser session).
  Counting: `stamp-counter.mjs` puts a small beacon on every page; it posts the site name to
  `egeskovengineering.com/api/visit`, which adds the country from Vercel's geo header and stores only
  site, day, country and a count (Supabase tables `site_visits` / `site_live`, migration 0079 in the
  winelingo repo). No cookies, no IP addresses, no ids. Re-run the stamp after adding new pages.
- Markup and options: see the header comment in `src/visitor-globe.js`.
- `src/centroids.json` (country → dot position) was generated from `world-countries`, with a few
  large countries moved to where their people are (US, FR, NO, RU, CA).
- Rebuild after editing: `npm i && npm run build` (writes `/assets/visitor-globe.js`).

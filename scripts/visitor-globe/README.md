# visitor-globe

The rotating "Wine lovers, everywhere" globe on the homepage (`#around-the-world`).
Plain 2D canvas (no WebGL), about 36 KB gzipped including the world map, no third-party requests.
The same file is meant for cardzo.app, chefgastonapp.com and Egeskov Engineering (`data-theme="dark"`).

- Data: `GET https://pzrqsjcpflvbgptppcep.supabase.co/functions/v1/site-visitors?site=winelingo`
  returns `{ visitors, active, countries: [{ code, visitors }] }`. That function proxies Umami Cloud
  (source: the app repo, `prototype/supabase/functions/site-visitors`), so the Umami API key never
  reaches the page. Counts only: no pages, referrers or cities leave the function.
- Markup and options: see the header comment in `src/visitor-globe.js`.
- `src/centroids.json` (country → dot position) was generated from `world-countries`, with a few
  large countries moved to where their people are (US, FR, NO, RU, CA).
- Rebuild after editing: `npm i && npm run build` (writes `/assets/visitor-globe.js`).

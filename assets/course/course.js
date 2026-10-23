/* Winelingo course on the web (/course/).
   The same account, lessons and progress as the iPhone app: it reads the same tables and calls
   the same database functions (complete_lesson, complete_practice, hearts_state, hearts_lose,
   my_xp_today), so a lesson finished here is finished in the app, and the other way round.
   The lesson player follows the app's (prototype/learn.tsx, LessonPlayer): teach cards in order,
   each question slot filled from the lesson's own question or a bank question about the same card,
   options shuffled, a wrong answer comes back at the end and costs a heart for free accounts.
   Course 2.0 (app docs/COURSE-V2.md): a lesson with `v2` plays that instead: teach cards with a
   visual layout (term, stat, timeline, list, ladder, compare, scale, map), quick-check blocks,
   three-part answers, flip cards, and a recap with a teaser for the next lesson.
   Plain DOM, no framework; every text goes in with textContent. */
(function () {
  "use strict";

  // /course/ is also the public landing page (built by scripts/build-course-pages.mjs). The app
  // only takes over for someone signed in, back from a checkout or an email link, or who clicked
  // a "Start" link (?app=1); everyone else, Google included, reads the landing page.
  var landing = document.getElementById("landing");
  if (landing) {
    var wants = /[?&](app|purchase|sandbox|lang|gift|redeem|lesson|try)=/.test(location.search) ||
      /access_token|type=recovery|type=signup|error_description/.test(location.hash);
    try { for (var si = 0; !wants && si < localStorage.length; si++) if (/^sb-.*-auth-token$/.test(localStorage.key(si) || "")) wants = true; } catch (e) {}
    try { if (!wants && sessionStorage.getItem("wl-course-app")) wants = true; } catch (e) {}
    if (!wants) return;
    try { sessionStorage.setItem("wl-course-app", "1"); } catch (e) {}
    document.body.classList.add("app-mode");
    document.getElementById("app").hidden = false;
    window.scrollTo(0, 0);
  }

  var SB_URL = "https://pzrqsjcpflvbgptppcep.supabase.co";
  var SB_KEY = "sb_publishable_r3cWiruTBNV8YUuAv5sj3Q_bseo7A8B";   // public by design
  // Sign in with Apple on the web needs an Apple Services ID set up in Supabase first.
  var APPLE_WEB = false;
  var APP_STORE = "https://apps.apple.com/app/id6785896824";
  var LESSON_IMG = SB_URL + "/storage/v1/object/public/lesson-images/";
  var LANGS = [["en", "English"], ["da", "Dansk"], ["es", "Español"], ["de", "Deutsch"]];
  var HERE = location.origin + "/course/";
  // Paying on the web: RevenueCat Web Billing with Paddle. Each is a Web Purchase Link (RevenueCat →
  // Web → Create web purchase link) ending in "/"; the account id is appended, so the purchase lands
  // on this account. Empty = not set up yet: the plans show, with a note instead of a buy button.
  // RevenueCat's success URL is https://winelingo.app/course/?purchase=done
  // live: the real checkout (empty until the live Paddle account is connected).
  // sandbox: Paddle test mode, only with ?sandbox=1. rc-webhook ignores sandbox purchases except for
  // the test accounts in RC_SANDBOX_USERS, so these links unlock nothing for anyone else.
  // gift: the course for life, bought for someone else (0137). A consumable product with its own
  // success URL https://winelingo.app/course/?purchase=gift; empty = the gift shows as coming soon.
  var LINKS = {
    live: { monthly: "", lifetime: "", gift: "" },
    sandbox: { monthly: "https://pay.rev.cat/zyfjogqowdnqnapw/", lifetime: "https://pay.rev.cat/zgrofjmxwefvfjqk/", gift: "" }
  };
  var SANDBOX = /[?&]sandbox=1\b/.test(location.search);
  try { if (SANDBOX) sessionStorage.setItem("wl-sandbox", "1"); else if (sessionStorage.getItem("wl-sandbox")) SANDBOX = true; } catch (e) {}
  var PURCHASE = SANDBOX ? LINKS.sandbox : LINKS.live;
  // A gift code from a link (?redeem=WL-XXXX-XXXX) waits here until the person is signed in, also
  // across an email confirmation; ?gift=1 opens the gift dialog once the course is up.
  var GIFT_KEY = "wl-gift-redeem";
  (function () {
    var m = location.search.match(/[?&]redeem=([A-Za-z0-9 -]{8,20})/);
    try { if (m) localStorage.setItem(GIFT_KEY, decodeURIComponent(m[1])); } catch (e) {}
    try { if (/[?&]gift=1\b/.test(location.search)) sessionStorage.setItem("wl-gift-open", "1"); } catch (e) {}
    try { if (/[?&]redeem=open\b/.test(location.search)) sessionStorage.setItem("wl-gift-open", "redeem"); } catch (e) {}
  })();
  function pendingGift() { try { return localStorage.getItem(GIFT_KEY); } catch (e) { return null; } }
  // Free on the web: the first two units. Foundations opens the course since 1.4.0 and holds two
  // lessons that used to be in Tasting & senses (the old free unit, which guide cards still link
  // to); the rest needs Premium or the course purchase (0131).
  var FREE_TOPICS = ["Foundations", "Tasting & senses"];

  // The course: one unit per lesson topic, in curriculum order (learn.tsx UNITS, app 1.4.1).
  var UNITS = [
    ["Foundations", "foundations", "uTerroir"], ["Tasting & senses", "tastingSenses", "uTasting"],
    ["Red grapes to know", "redGrapes", "uRedGrapes"], ["White grapes to know", "whiteGrapes", "uWhiteGrapes"],
    ["Reading the label", "readingLabel", "uLabel"], ["Food & wine", "foodWine", "pairing"],
    ["Serving & glassware", "servingGlassware", "uServing"], ["Wine at the table", "atTable", "uToast"],
    ["Wine, health & moderation", "healthModeration", "uModeration"],
    ["France", "france", "uFrance"], ["Italy", "italy", "uItaly"], ["Spain", "spain", "uSpain"],
    ["Portugal", "portugal", "uPortugal"], ["Germany", "germany", "uGermany"], ["Austria", "austria", "uAustria"],
    ["USA", "usa", "uUSA"], ["Argentina", "argentina", "uArgentina"], ["Chile", "chile", "uChile", { by: "FRPGCHILE", license: "CC BY-SA 4.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      src: "https://commons.wikimedia.org/wiki/File:Carmenere_Vineyards_at_Vi%C3%B1a_Tipaume.jpg" }],
    ["Australia", "australia", "uAustralia"], ["New Zealand", "newzealand", "uNewZealand"],
    ["South Africa", "southafrica", "uSouthAfrica", { by: "Michael Fu", license: "CC BY-SA 3.0", licenseUrl: "https://creativecommons.org/licenses/by-sa/3.0/",
      src: "https://commons.wikimedia.org/wiki/File:Groot_Constantia_Estate.jpg" }],
    ["How wine is made", "howMade", "uWinemaking"],
    ["In the vineyard", "inVineyard", "uVineyard"], ["Quality, ageing & collecting", "qualityAgeing", "uCellar"],
    ["Buying & value", "buyingValue", "uShop"], ["A short history of wine", "history", "uHistory"]
  ].map(function (u) { return { topic: u[0], key: u[1], img: u[2], credit: u[3] || null }; });
  // credit: a cover that is not public domain (CC BY-SA) is credited under the unit card, as in the
  // app (learn.tsx UNITS credit): author linked to the Commons file page, licence linked to its deed.
  // Every unit ends in a review (learn.tsx buildReview): about ten questions from its lessons.
  var REVIEW_SIZE = 10;
  var IMG_KEYS = ["grapes", "regions", "countries", "pour", "cellar", "corks", "learn", "pairing", "autumn", "bottles",
    "types", "dusk"].concat(UNITS.map(function (u) { return u.img; }));
  var COUNTRIES = ["france", "italy", "spain", "portugal", "germany", "austria", "usa", "argentina", "chile",
    "australia", "new_zealand", "south_africa"];
  var UNIT_COUNTRIES = {
    "France": ["france"], "Italy": ["italy"], "Spain": ["spain"], "Portugal": ["portugal"], "Germany": ["germany"],
    "Austria": ["austria"], "USA": ["usa"], "Argentina": ["argentina"], "Chile": ["chile"], "Australia": ["australia"],
    "New Zealand": ["new_zealand"], "South Africa": ["south_africa"]
  };
  var GOALS = [[5, 10, "casual"], [10, 20, "regular"], [15, 30, "serious"], [20, 40, "intense"]];
  var LEVELS = ["beginner", "learning", "enthusiast"];

  var sb = window.supabase.createClient(SB_URL, SB_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "implicit" }
  });

  // ---------------------------------------------------------------- state
  var S = {
    session: null, profile: null, lang: "en", view: "loading",
    lessons: null, done: new Set(), xp: null, streak: null, hearts: null, merged: {}, best: {},
    open: new Set(), openLater: new Set(), loadErr: false, notice: null
  };
  var hashAtLoad = location.hash;
  // A free-lesson card on a guide links here with ?lesson=<id>&src=<page> (scripts/build-lesson-cta.mjs).
  // Both wait in localStorage (so an email confirmation that opens a new tab still finds them) until
  // the person is signed in and the lessons are loaded; then the lesson opens by itself and its key is
  // cleared. src is kept: it is first-touch attribution for later events. src travels with the Umami events so a sign-up or a purchase can be
  // traced back to the guide that sent it.
  var OPEN_KEY = "wl-open-lesson", SRC_KEY = "wl-src";
  // ?try=<id>: someone with no account plays one lesson from the free unit straight away. The
  // lesson comes from a static copy (assets/course/try/<id>.json, exported from the lessons table),
  // nothing is written to the database, there are no hearts, and closing the player leads to
  // sign-up. A signed-in visitor gets the same lesson the normal way (it is also the pending lesson).
  var TRY = null, TRY_EXTRAS = null;
  function startTry() {
    var id = TRY; TRY = null;
    S.view = "auth"; S.notice = t("web.trySave"); render();
    fetch("/assets/course/try/" + id + ".json").then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); }).then(function (d) {
      // The visitor's language from <id>.<lang>.json (export-try-lessons.mjs), with localize()'s rule:
      // a non-empty field replaces the English one. No file, or an error, keeps the English lesson.
      if (S.lang === "en") return d;
      return fetch("/assets/course/try/" + id + "." + S.lang + ".json").then(function (r) { return r.ok ? r.json() : null; }).then(function (x) {
        if (!x) return d;
        function over(base, f) {
          var o = Object.assign({}, base);
          for (var k in f || {}) if (f[k] != null && f[k] !== "" && !(Array.isArray(f[k]) && !f[k].length)) o[k] = f[k];
          return o;
        }
        return { lesson: over(d.lesson, x.lesson), extras: over(d.extras, x.extras) };
      }).catch(function () { return d; });
    }).then(function (d) {
      if (S.session) return;
      try { localStorage.removeItem(OPEN_KEY); } catch (e) {}
      S.trying = true;
      TRY_EXTRAS = d.extras;
      track("try-start", { lesson: id });
      openPlayer(withV2Title(inChapter(d.lesson)));
    }).catch(function () { S.trying = false; });
  }
  (function () {
    var q = location.search, m = q.match(/[?&](?:lesson|try)=([0-9a-f-]{36})/), sm = q.match(/[?&]src=([a-z0-9-]{1,80})/);
    TRY = (q.match(/[?&]try=([0-9a-f-]{36})/) || [])[1] || null;
    try { if (m) localStorage.setItem(OPEN_KEY, m[1]); if (sm) localStorage.setItem(SRC_KEY, sm[1]); } catch (e) {}
    if (m || sm) history.replaceState(null, "", location.pathname + q.replace(/[?&](lesson|try|src)=[^&]*/g, "").replace(/^&/, "?") + location.hash);
  })();
  function track(name, data) {
    try {
      if (!window.umami) return;
      var d = data || {}; var src = localStorage.getItem(SRC_KEY); if (src) d.src = src;
      window.umami.track(name, d);
    } catch (e) {}
  }
  function openPending() {
    var id = null; try { id = localStorage.getItem(OPEN_KEY); } catch (e) {}
    if (!id || P || !S.lessons) return;
    try { localStorage.removeItem(OPEN_KEY); } catch (e) {}
    if (S.merged[id]) id = S.merged[id];
    var l = S.lessons.find(function (x) { return x.id === id; });
    if (l) openPlayer(l);
  }
  var recovering = /type=recovery/.test(hashAtLoad);

  // ---------------------------------------------------------------- strings
  var STR = window.WL_STRINGS;
  function pick(d, ns, k) { return d && d[ns] && typeof d[ns][k] === "string" ? d[ns][k] : null; }
  function t(key, v) {
    v = v || {};
    var p = key.split("."), ns = p[0], k = p[1], d = STR[S.lang] || STR.en, s = null;
    if (v.count != null) s = pick(d, ns, k + "_" + (v.count === 1 ? "one" : "other")) || pick(STR.en, ns, k + "_" + (v.count === 1 ? "one" : "other"));
    s = s || pick(d, ns, k) || pick(STR.en, ns, k) || key;
    return s.replace(/\{\{(\w+)\}\}/g, function (_, x) { return v[x] != null ? String(v[x]) : ""; });
  }
  function startLang() {
    var saved = null;
    try { saved = localStorage.getItem("wl-course-lang"); } catch (e) {}
    var q = location.search.match(/[?&]lang=(en|da|es|de)\b/);
    if (q) return q[1];
    if (saved && STR[saved]) return saved;
    var nav = (navigator.languages || [navigator.language || "en"]).map(function (l) { return String(l).slice(0, 2).toLowerCase(); });
    for (var i = 0; i < nav.length; i++) if (STR[nav[i]]) return nav[i];
    return "en";
  }

  // ---------------------------------------------------------------- DOM helpers
  function h(tag, attrs) {
    var el = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      var v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k === "style") el.style.cssText = v;
      else if (k.slice(0, 2) === "on") el.addEventListener(k.slice(2), v);
      else el.setAttribute(k, v === true ? "" : v);
    }
    for (var i = 2; i < arguments.length; i++) add(el, arguments[i]);
    return el;
  }
  function add(el, c) {
    if (c == null || c === false) return;
    if (Array.isArray(c)) { c.forEach(function (x) { add(el, x); }); return; }
    el.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
  }
  var ICON = {
    flame: "M12 22c4.4 0 7-2.9 7-6.6 0-3.1-1.8-5.2-3.2-6.8-.4-.4-1 0-.9.5.2 1.3-.2 2.6-1.1 3.3-.2-3.4-2.2-6.7-5-8.3-.4-.2-.9.1-.8.6.3 2.4-.8 4.2-2.2 5.9C4.6 12.1 5 13.9 5 15.4 5 19.1 7.6 22 12 22Z",
    heart: "M12 21s-7.5-4.6-9.3-9.6C1.6 8 3.6 4.5 7.1 4.5c2 0 3.6 1.1 4.9 2.8 1.3-1.7 2.9-2.8 4.9-2.8 3.5 0 5.5 3.5 4.4 6.9C19.5 16.4 12 21 12 21Z",
    check: "M5 12.5l4.5 4.5L19 7.5", x: "M6 6l12 12M18 6 6 18", lock: "M7 11V8a5 5 0 0 1 10 0v3M5.5 11h13v9.5h-13z",
    play: "M8 5.6v12.8c0 .8.9 1.3 1.6.9l10-6.4c.6-.4.6-1.4 0-1.8l-10-6.4C8.9 4.3 8 4.8 8 5.6Z",
    bulb: "M9 18h6M10 21h4M12 3a6 6 0 0 0-3.6 10.8c.6.5 1 1.2 1.1 2h5c.1-.8.5-1.5 1.1-2A6 6 0 0 0 12 3Z",
    cap: "M2 9l10-5 10 5-10 5L2 9Zm4 2.2V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.8M22 9v6",
    redo: "M4 12a8 8 0 1 0 2.3-5.7M4 4v4.5h4.5",
    gift: "M4 11h16v10H4zM3 7h18v4H3zM12 7v14M12 7S10.5 3 8 3.5 6.5 7 12 7Zm0 0s1.5-4 4-3.5S17.5 7 12 7Z",
    copy: "M9 9h11v11H9zM5 15V4h11", cards: "M8 4h11a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1ZM4 7v12a1 1 0 0 0 1 1h11", caret: "m9 6 6 6-6 6", down: "m6 9 6 6 6-6", back: "m15 6-6 6 6 6"
  };
  var FILLED = { flame: 1, heart: 1, play: 1 };
  function icon(name, size, cls) {
    var ns = "http://www.w3.org/2000/svg", s = document.createElementNS(ns, "svg");
    s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("width", size || 18); s.setAttribute("height", size || 18);
    s.setAttribute("aria-hidden", "true"); if (cls) s.setAttribute("class", cls);
    var p = document.createElementNS(ns, "path"); p.setAttribute("d", ICON[name]);
    if (FILLED[name]) p.setAttribute("fill", "currentColor");
    else { p.setAttribute("fill", "none"); p.setAttribute("stroke", "currentColor"); p.setAttribute("stroke-width", "2"); p.setAttribute("stroke-linecap", "round"); p.setAttribute("stroke-linejoin", "round"); }
    s.appendChild(p); return s;
  }
  // "Photo: <author> · <licence>, Wikimedia Commons" with the author and licence as links.
  function photoCredit(c, cls) {
    var parts = t("learn.photoCredit", { by: "\u0001", license: "\u0002" }).split(/(\u0001|\u0002)/);
    return h("p", { class: cls }, parts.map(function (p) {
      return p === "\u0001" ? h("a", { href: c.src, target: "_blank", rel: "noopener" }, c.by)
        : p === "\u0002" ? h("a", { href: c.licenseUrl, target: "_blank", rel: "noopener license" }, c.license) : p;
    }), ", Wikimedia Commons");
  }
  // Lesson markup: blank-line paragraphs, "• " bullet blocks, **bold** spans (learn.tsx Rich).
  function inline(s) {
    return String(s).split(/(\*\*[^*]+\*\*)/g).filter(Boolean).map(function (p) {
      return p.slice(0, 2) === "**" && p.slice(-2) === "**" ? h("strong", { text: p.slice(2, -2) }) : document.createTextNode(p);
    });
  }
  function rich(text, cls) {
    var wrap = h("div", { class: "rich " + (cls || "") });
    String(text || "").split(/\n\n+/).map(function (b) { return b.trim(); }).filter(Boolean).forEach(function (b) {
      var lines = b.split("\n").map(function (l) { return l.trim(); }).filter(Boolean);
      if (lines.every(function (l) { return /^[•-]\s/.test(l); })) {
        wrap.appendChild(h("ul", null, lines.map(function (l) { return h("li", null, inline(l.replace(/^[•-]\s+/, ""))); })));
      } else wrap.appendChild(h("p", null, inline(b)));
    });
    return wrap;
  }
  function imgUrl(key) { return "/assets/course/img/" + key + ".webp"; }
  var root = document.getElementById("app");
  function mount(node) { root.textContent = ""; root.appendChild(node); }

  // ---------------------------------------------------------------- data
  function inChapter(l) {
    if (l && l.chapter) { l.topic = l.chapter; if (l.chapter_sort != null) l.sort_order = l.chapter_sort; }
    return inUnit(l);
  }
  // The course path from 1.4.0 (lib/api.ts inUnit): `v2_unit` / `v2_sort` win over chapter and topic.
  // A lesson merged into another (`v2_merged_into`) is left out of the path, and finishing it counts
  // for the lesson it now lives in (withMergedDone).
  function inUnit(l) {
    if (l && l.v2_unit) { l.topic = l.v2_unit; if (l.v2_sort != null) l.sort_order = l.v2_sort; }
    return l;
  }
  function withMergedDone(done) {
    var out = new Set(done);
    for (var id in S.merged) if (done.has(id)) out.add(S.merged[id]);
    return out;
  }
  // The translations overlay (lib/api.ts localize): each non-empty field replaces the English one.
  function localize(type, rows) {
    if (S.lang === "en" || !rows.length) return Promise.resolve(rows);
    var ids = rows.map(function (r) { return r.id; });
    return sb.from("translations").select("entity_id, fields").eq("entity_type", type).eq("lang", S.lang).in("entity_id", ids)
      .then(function (res) {
        if (res.error || !res.data) return rows;
        var by = {};
        res.data.forEach(function (r) { by[r.entity_id] = r.fields || {}; });
        return rows.map(function (r) {
          var f = by[r.id]; if (!f) return r;
          var o = Object.assign({}, r);
          for (var k in f) if (f[k] != null && f[k] !== "" && !(Array.isArray(f[k]) && !f[k].length)) o[k] = f[k];
          return o;
        });
      }).catch(function () { return rows; });
  }
  // Course 2.0 titles (lib/api.ts withV2Title): a lesson with v2 is listed under its new title.
  function withV2Title(r) { return r && r.v2_title ? Object.assign({}, r, { title: r.v2_title, summary: r.v2_summary || r.summary }) : r; }
  function loadLessons() {
    var base = "id, topic, title, summary, body, sort_order, steps, outcomes, chapter, chapter_sort";
    function q(cols) { return sb.from("lessons").select(cols).order("sort_order"); }
    return q(base + ", v2_title, v2_summary, v2_len, v2_unit, v2_sort, v2_merged_into").then(function (res) {
      return res.error && /v2/i.test(res.error.message || "") ? q(base) : res;
    }).then(function (res) {
      if (res.error) throw res.error;
      var merged = {}, rows = (res.data || []).filter(function (r) {
        if (r.v2_merged_into) { merged[r.id] = r.v2_merged_into; return false; }
        return true;
      });
      S.merged = merged;
      return localize("lesson", rows);
    }).then(function (rows) { return rows.map(inChapter).map(withV2Title); });
  }
  function loadDone() {
    return sb.from("lesson_completions").select("lesson_id").eq("user_id", S.session.user.id).then(function (res) {
      return new Set((res.data || []).map(function (r) { return r.lesson_id; }));
    });
  }
  // Best score per practice game (lib/api.ts getPracticeBest); a unit review is "review:<topic>".
  function loadBest() {
    return sb.from("practice_results").select("game, score, total").eq("user_id", S.session.user.id)
      .order("score", { ascending: false }).limit(500).then(function (res) {
        var best = {};
        (res.data || []).forEach(function (r) { if (!best[r.game]) best[r.game] = { score: r.score, total: r.total }; });
        return best;
      }).catch(function () { return {}; });
  }
  // Workplace tests (migration 0142): a quiz with partner_code shows only to staff who redeemed that
  // partner code (RLS). Generic tests live on /tests, so the course lists just these.
  function loadTests() {
    return sb.from("quizzes").select("id, slug, title, summary, questions, partner_code").not("partner_code", "is", null)
      .order("sort_order").then(function (res) {
        if (res.error) return [];
        return localize("quiz", res.data || []);
      }).catch(function () { return []; });
  }
  function loadStreak() {
    return sb.from("user_streaks").select("current_streak, longest_streak, last_active_date").eq("user_id", S.session.user.id)
      .maybeSingle().then(function (res) {
        var d = res.data || {};
        var today = new Date().toISOString().slice(0, 10);
        return { current: d.current_streak || 0, longest: d.longest_streak || 0, activeToday: d.last_active_date === today };
      }).catch(function () { return null; });
  }
  function loadXp() {
    if (S.trying) return Promise.resolve(null);
    return sb.rpc("my_xp_today").then(function (res) { return typeof res.data === "number" ? res.data : null; }).catch(function () { return null; });
  }
  function refreshHearts() {
    if (S.trying) return Promise.resolve(S.hearts);
    return sb.rpc("hearts_state").then(function (res) { if (!res.error && res.data) S.hearts = res.data; return S.hearts; })
      .catch(function () { return S.hearts; });
  }
  function loseHeart() {
    var s = S.hearts;
    if (s && s.enabled && !s.unlimited && s.hearts > 0) {
      var regen = s.regen_minutes * 60000, next = s.next_at || new Date(Date.now() + regen).toISOString();
      S.hearts = Object.assign({}, s, { hearts: s.hearts - 1, next_at: next,
        full_at: new Date(Date.parse(next) + regen * (s.max - s.hearts)).toISOString() });
    }
    return sb.rpc("hearts_lose").then(function (res) { if (!res.error && res.data) S.hearts = res.data; return S.hearts; })
      .catch(function () { return S.hearts; });
  }
  function heartsInfo() {
    var s = S.hearts;
    var limited = !!s && s.enabled && !s.unlimited;
    return { s: s, limited: limited, unlimited: !!s && (s.unlimited || !s.enabled), hearts: s ? s.hearts : null,
      max: s ? s.max : 5, out: limited && s.hearts <= 0, nextAt: limited && s.hearts < s.max ? s.next_at : null,
      fullAt: limited ? s.full_at : null };
  }
  function untilText(iso) {
    if (!iso) return "";
    var mins = Math.max(1, Math.ceil((Date.parse(iso) - Date.now()) / 60000));
    var hh = Math.floor(mins / 60), mm = mins % 60;
    return hh > 0 ? t("hearts.inHm", { h: hh, m: mm }) : t("hearts.inM", { m: mm });
  }
  function clock(iso) {
    if (!iso) return "";
    var d = new Date(iso);
    return String(d.getHours()).padStart(2, "0") + ":" + String(d.getMinutes()).padStart(2, "0");
  }
  function goalXp() {
    var m = S.profile && S.profile.daily_goal_min;
    for (var i = 0; i < GOALS.length; i++) if (GOALS[i][0] === m) return GOALS[i][1];
    return 30;
  }
  function countriesOf() {
    var c = S.profile && S.profile.wine_countries;
    return Array.isArray(c) && c.length ? c : null;
  }
  function hasAccess() {
    var p = S.profile || {};
    var premium = p.is_premium && (!p.premium_until || Date.parse(p.premium_until) > Date.now());
    return !!(premium || p.course_access);
  }
  function unitOpen(topic) { return FREE_TOPICS.indexOf(topic) >= 0 || hasAccess(); }
  function inPath(topic) {
    var covers = UNIT_COUNTRIES[topic], c = countriesOf();
    if (!covers || !c) return true;
    return covers.some(function (x) { return c.indexOf(x) >= 0; });
  }
  function saveProfile(fields) {
    Object.assign(S.profile, fields);
    return sb.from("profiles").update(fields).eq("id", S.session.user.id).then(function (res) { if (res.error) throw res.error; });
  }

  // ---------------------------------------------------------------- top bar
  function langSelect(onChange) {
    var sel = h("select", { class: "lang", "aria-label": t("web.language"),
      onchange: function () { onChange(sel.value); } },
      LANGS.map(function (l) { return h("option", { value: l[0], selected: l[0] === S.lang }, l[1]); }));
    return sel;
  }
  function setLang(lang) {
    S.lang = lang;
    try { localStorage.setItem("wl-course-lang", lang); } catch (e) {}
    document.documentElement.lang = lang;
    if (S.session && S.profile) {
      saveProfile({ language: lang }).catch(function () {});
      S.lessons = null; render(); loadCourse();
    } else render();
  }
  function heartsChip() {
    var H = heartsInfo();
    if (!H.s) return null;
    return h("button", { class: "chip chip-heart", type: "button",
      "aria-label": H.unlimited ? t("hearts.infoUnlimited") : t("hearts.a11y", { count: H.hearts, max: H.max }),
      onclick: showHeartsInfo }, icon("heart", 17), H.unlimited ? "∞" : String(H.hearts));
  }
  function topBar() {
    var st = S.streak;
    return h("header", { class: "cbar" },
      h("a", { class: "cbrand", href: "/" }, h("img", { src: "/assets/logo.png", alt: "", width: 30, height: 30 }), "Winelingo"),
      h("div", { class: "cbar-r" },
        st ? h("span", { class: "chip chip-flame" + (st.activeToday ? " on" : ""), title: st.current ? t("web.streak", { count: st.current }) : t("web.noStreak") },
          icon("flame", 17), String(st.current)) : null,
        heartsChip(),
        hasAccess() ? h("span", { class: "chip chip-pro", text: S.profile.course_access && !S.profile.is_premium ? t("web.pwLifeName") : "Premium" }) : null,
        langSelect(setLang),
        h("button", { class: "linkbtn", type: "button", onclick: function () { sb.auth.signOut(); } }, t("web.signOut"))
      ));
  }

  // ---------------------------------------------------------------- dialogs
  function dialog(title, body, buttons) {
    var d = h("div", { class: "dlg-back", role: "dialog", "aria-modal": "true", "aria-label": title },
      h("div", { class: "dlg" }, h("h2", { text: title }), body,
        h("div", { class: "dlg-btns" }, buttons.map(function (b) {
          return b.href ? h("a", { class: "btn " + (b.cls || "btn-ghost"), href: b.href, target: "_blank", rel: "noopener" }, b.label)
            : h("button", { class: "btn " + (b.cls || "btn-ghost"), type: "button", onclick: function () { close(); if (b.on) b.on(); } }, b.label);
        }))));
    function close() { d.remove(); document.removeEventListener("keydown", esc, true); }
    function esc(e) { if (e.key === "Escape") { e.stopPropagation(); close(); } }
    document.addEventListener("keydown", esc, true);
    d.addEventListener("click", function (e) { if (e.target === d) close(); });
    document.body.appendChild(d);
    var f = d.querySelector("button, a"); if (f) f.focus();
    return close;
  }
  function showHeartsInfo() {
    var H = heartsInfo();
    if (H.unlimited) { dialog(t("hearts.title"), h("p", { text: t("hearts.infoUnlimited") }), [{ label: t("common.close"), cls: "btn-primary" }]); return; }
    var hours = Math.round(((H.s && H.s.regen_minutes) || 120) / 60);
    dialog(t("hearts.infoTitle", { count: H.hearts || 0, max: H.max }), h("div", null,
      h("p", { text: H.nextAt ? t("hearts.infoNext", { time: untilText(H.nextAt) }) : t("hearts.infoFull") }),
      h("p", { text: t("hearts.infoRules", { max: H.max, hours: hours }) }),
      h("p", { class: "muted", text: t("web.heartsInApp") })),
      [{ label: t("common.close") }, { label: t("hearts.getUnlimited"), cls: "btn-primary", href: APP_STORE }]);
  }

  // ---------------------------------------------------------------- auth
  function authErrKey(m) {
    m = String(m || "").toLowerCase();
    if (m.indexOf("invalid login credentials") >= 0) return "auth.errInvalidCredentials";
    if (m.indexOf("email not confirmed") >= 0) return "auth.errEmailNotConfirmed";
    if (m.indexOf("already registered") >= 0) return "auth.errAlreadyRegistered";
    if (m.indexOf("at least 6 characters") >= 0) return "auth.errWeakPassword";
    if (m.indexOf("for security purposes") >= 0 || m.indexOf("rate limit") >= 0) return "auth.errRateLimited";
    return "auth.errGeneric";
  }
  function renderAuth() {
    var email = h("input", { type: "email", autocomplete: "email", placeholder: t("auth.emailPlaceholder"), "aria-label": t("auth.emailPlaceholder"), required: true });
    var pw = h("input", { type: "password", autocomplete: "current-password", placeholder: t("auth.passwordPlaceholder"), "aria-label": t("auth.passwordPlaceholder"), required: true });
    var msg = h("p", { class: "amsg", role: "status", "aria-live": "polite" });
    var busy = false;
    function say(text, ok) { msg.textContent = text; msg.className = "amsg " + (ok ? "ok" : "err"); }
    function run(kind) {
      if (busy) return;
      var e = email.value.trim(), p = pw.value;
      if (!e || !p) { say(t("auth.needBoth")); return; }
      if (kind === "up" && p.length < 6) { say(t("auth.pwTooShort")); return; }
      busy = true; say(t("web.loading"), true);
      var call = kind === "in" ? sb.auth.signInWithPassword({ email: e, password: p })
        : sb.auth.signUp({ email: e, password: p, options: { emailRedirectTo: HERE } });
      call.then(function (res) {
        busy = false;
        if (res.error) { say(t(authErrKey(res.error.message))); return; }
        if (kind === "up") track("course-signup");
        if (kind === "up" && !res.data.session) say(t("auth.checkInbox"), true);
        else msg.textContent = "";
      }).catch(function () { busy = false; say(t("auth.errGeneric")); });
    }
    function forgot() {
      var e = email.value.trim();
      if (!e) { say(t("auth.enterEmail")); email.focus(); return; }
      sb.auth.resetPasswordForEmail(e, { redirectTo: HERE }).then(function (res) {
        say(res.error ? t(authErrKey(res.error.message)) : t("auth.resetSent"), !res.error);
      });
    }
    var form = h("form", { class: "aform", onsubmit: function (ev) { ev.preventDefault(); run("in"); } },
      APPLE_WEB ? [h("button", { class: "btn btn-apple", type: "button", onclick: function () {
        sb.auth.signInWithOAuth({ provider: "apple", options: { redirectTo: HERE } });
      } }, "Sign in with Apple"), h("p", { class: "or", text: t("auth.or") })] : null,
      email, pw,
      h("button", { class: "btn btn-primary btn-block", type: "submit" }, t("auth.signIn")),
      h("div", { class: "alinks" },
        h("button", { class: "linkbtn strong", type: "button", onclick: function () { run("up"); } }, t("auth.createAccount")),
        h("button", { class: "linkbtn", type: "button", onclick: forgot }, t("auth.forgot"))),
      msg);
    mount(h("main", { class: "auth" },
      h("div", { class: "auth-photo", style: "background-image:url(" + imgUrl("dusk") + ")" }),
      h("div", { class: "auth-card" },
        h("a", { class: "cbrand big", href: "/" }, h("img", { src: "/assets/logo.png", alt: "", width: 44, height: 44 }), "Winelingo"),
        h("h1", { text: t("auth.subtitle") }),
        h("p", { class: "lede", text: t("web.tagline") }),
        pendingGift() ? h("p", { class: "notice gift-note", role: "status" }, icon("gift", 16), t("web.giftAuthNote")) : null,
        form,
        h("p", { class: "fine" }, t("web.authFree"), " ", h("a", { href: "/pricing/" }, t("web.seePrices"))),
        h("p", { class: "fine", text: t("web.noAccount") }),
        APPLE_WEB ? null : h("p", { class: "fine", text: t("web.appleSoon") }),
        h("div", { class: "auth-foot" }, langSelect(setLang),
          h("a", { href: "/privacy" }, "Privacy"), h("a", { href: "/terms" }, "Terms")),
        h("p", { class: "fine", text: t("web.footer") }))));
    email.focus();
  }
  function renderRecovery() {
    var pw = h("input", { type: "password", autocomplete: "new-password", placeholder: t("auth.newPasswordPlaceholder"), "aria-label": t("auth.newPasswordPlaceholder") });
    var msg = h("p", { class: "amsg err", role: "status", "aria-live": "polite" });
    mount(h("main", { class: "auth" },
      h("div", { class: "auth-photo", style: "background-image:url(" + imgUrl("dusk") + ")" }),
      h("div", { class: "auth-card" },
        h("h1", { text: t("auth.newPasswordTitle") }), h("p", { class: "lede", text: t("auth.newPasswordSub") }),
        h("form", { class: "aform", onsubmit: function (ev) {
          ev.preventDefault();
          if (pw.value.length < 6) { msg.textContent = t("auth.pwTooShort"); return; }
          sb.auth.updateUser({ password: pw.value }).then(function (res) {
            if (res.error) { msg.textContent = t(authErrKey(res.error.message)); return; }
            recovering = false; S.notice = t("web.passwordSaved"); afterSignIn();
          });
        } }, pw, h("button", { class: "btn btn-primary btn-block", type: "submit" }, t("auth.savePassword")), msg))));
    pw.focus();
  }

  // ---------------------------------------------------------------- onboarding (3 questions)
  function renderOnboarding() {
    var step = 0, level = null, picked = [], goal = 10;
    function draw() {
      var body;
      if (step === 0) {
        body = [h("h1", { text: t("onboarding.levelQ") }), h("p", { class: "lede", text: t("onboarding.levelSub") }),
          h("div", { class: "opts" }, LEVELS.map(function (l) {
            return h("button", { class: "opt big" + (level === l ? " on" : ""), type: "button", "aria-pressed": level === l ? "true" : "false",
              onclick: function () { level = l; draw(); } },
              h("span", { class: "opt-t" }, h("b", { text: t("experience." + l) }), h("small", { text: t("experience." + l + "Hint") })));
          }))];
      } else if (step === 1) {
        body = [h("h1", { text: t("onboarding.countriesQ") }),
          h("div", { class: "chips" }, COUNTRIES.map(function (c) {
            var on = picked.indexOf(c) >= 0;
            return h("button", { class: "pchip" + (on ? " on" : ""), type: "button", "aria-pressed": on ? "true" : "false",
              onclick: function () { picked = on ? picked.filter(function (x) { return x !== c; }) : picked.concat(c); draw(); } }, t("countries." + c));
          })),
          h("button", { class: "linkbtn strong", type: "button", onclick: function () { picked = []; step = 2; draw(); } }, t("onboarding.countriesAll")),
          h("p", { class: "fine", text: t("onboarding.countriesChangeLater") })];
      } else {
        body = [h("h1", { text: t("onboarding.goalQ") }),
          h("div", { class: "opts" }, GOALS.map(function (g) {
            return h("button", { class: "opt" + (goal === g[0] ? " on" : ""), type: "button", "aria-pressed": goal === g[0] ? "true" : "false",
              onclick: function () { goal = g[0]; draw(); } },
              h("span", { class: "opt-t row" }, h("b", { text: t("goal.perDay", { min: g[0] }) }), h("small", { text: t("goal." + g[2]) })));
          }))];
      }
      var canNext = step === 0 ? !!level : true;
      var msg = h("p", { class: "amsg err", role: "status" });
      var next = h("button", { class: "btn btn-primary btn-block", type: "button", disabled: !canNext, onclick: function () {
        if (step < 2) { step++; draw(); return; }
        next.disabled = true; next.textContent = t("onboarding.saving");
        saveProfile({ experience_level: level, wine_countries: picked.length ? picked : null, daily_goal_min: goal, language: S.lang })
          .then(function () { S.view = "course"; render(); loadCourse(); if (pendingGift()) showRedeem(pendingGift()); })
          .catch(function () { next.disabled = false; next.textContent = t("onboarding.goalCommit"); msg.textContent = t("onboarding.saveError"); });
      } }, step < 2 ? t("onboarding.continue") : t("onboarding.goalCommit"));
      mount(h("main", { class: "onb" },
        h("div", { class: "onb-card" },
          h("div", { class: "onb-top" },
            step > 0 ? h("button", { class: "linkbtn", type: "button", onclick: function () { step--; draw(); } }, icon("back", 16), t("onboarding.back")) : h("span"),
            h("span", { class: "muted", text: t("web.stepOf", { n: step + 1, total: 3 }) })),
          step === 0 ? h("p", { class: "eyebrow", text: t("web.welcomeTitle") }) : null,
          body, next, msg)));
    }
    draw();
  }

  // ---------------------------------------------------------------- course
  function buildUnits() {
    var list = UNITS.map(function (u) {
      var ls = S.lessons.filter(function (l) { return l.topic === u.topic; })
        .sort(function (a, b) { return (a.sort_order || 0) - (b.sort_order || 0); });
      var doneCount = ls.filter(function (l) { return S.done.has(l.id); }).length;
      var firstOpen = -1;
      for (var i = 0; i < ls.length; i++) if (!S.done.has(ls[i].id)) { firstOpen = i; break; }
      var nodes = ls.map(function (l, i) { return { lesson: l, index: i, state: S.done.has(l.id) ? "done" : i === firstOpen ? "current" : "locked" }; });
      // The review opens once every lesson in the unit is done (a lesson added later locks it again).
      var best = S.best["review:" + u.topic] || null;
      var review = { best: best, lessonIds: ls.map(function (l) { return l.id; }),
        state: firstOpen >= 0 ? "locked" : best ? "done" : "current" };
      return { u: u, lessons: ls, nodes: nodes, review: review, doneCount: doneCount, later: !inPath(u.topic), here: false, paid: !unitOpen(u.topic) };
    }).filter(function (x) { return x.lessons.length > 0; });
    var ordered = list.filter(function (x) { return !x.later; }).concat(list.filter(function (x) { return x.later; }));
    var here = ordered.find(function (x) { return x.doneCount > 0 && x.doneCount < x.lessons.length; })
      || ordered.find(function (x) { return !x.later && x.doneCount < x.lessons.length; });
    if (here) here.here = true;
    return ordered;
  }
  function minutes(l) {
    var n = Number.isInteger(l.v2_len) ? l.v2_len : Array.isArray(l.steps) ? l.steps.length : 0;
    var m = n > 0 ? Math.max(2, Math.round(n * 0.45)) : Math.max(1, Math.round(String(l.body || "").split(/\s+/).length / 180));
    return t("learn.minutes", { count: m });
  }
  function renderCourse() {
    if (S.loadErr) {
      mount(h("div", { class: "page" }, topBar(), h("main", { class: "cmain center" },
        h("p", { text: t("learn.loadError") }), h("button", { class: "btn btn-ghost", type: "button", onclick: function () { S.loadErr = false; render(); loadCourse(); } }, t("learn.retry")))));
      return;
    }
    if (!S.lessons) { mount(h("div", { class: "page" }, topBar(), h("main", { class: "cmain center" }, h("div", { class: "spin", "aria-label": t("web.loading") })))); return; }
    var units = buildUnits();
    var doneAll = 0, totalAll = 0;
    units.forEach(function (x) { doneAll += x.doneCount; totalAll += x.lessons.length; });
    var hereU = units.find(function (x) { return x.here; });
    var next = hereU && hereU.nodes.find(function (n) { return n.state === "current"; });
    if (!S.open.size && hereU) S.open.add(hereU.u.topic);
    var goal = goalXp(), xp = S.xp || 0;
    var firstLater = units.findIndex(function (x) { return x.later; });
    var firstCountry = firstLater < 0 ? units.findIndex(function (x) { return !!UNIT_COUNTRIES[x.u.topic]; }) : -1;
    var free = units.filter(function (x) { return !x.paid; });
    var freeDone = free.length > 0 && free.every(function (x) { return x.doneCount === x.lessons.length; });

    var summary = h("section", { class: "csum" },
      h("div", { class: "csum-l" },
        h("p", { class: "eyebrow", text: t("learn.title") }),
        h("h1", { text: t("learn.courseSummary", { done: doneAll, total: totalAll }) }),
        h("div", { class: "xpbar", role: "img", "aria-label": t("web.xpToday", { xp: xp, goal: goal }) },
          h("i", { style: "width:" + Math.min(100, Math.round(100 * xp / goal)) + "%" })),
        h("p", { class: "muted", text: t("web.xpToday", { xp: xp, goal: goal }) + " · " +
          (S.streak && S.streak.current ? t("web.streak", { count: S.streak.current }) : t("web.noStreak")) })),
      next && hereU.paid ? h("div", { class: "next" },
        h("p", { class: "next-k", text: t("web.paidTag") }),
        h("p", { class: "next-t", text: freeDone ? t("web.freeDoneTitle") : t("web.pwTitle") }),
        h("p", { class: "muted", text: t("web.freeDoneBody") }),
        h("button", { class: "btn btn-primary", type: "button", onclick: showPaywall }, icon("lock", 16), t("web.unlock")))
      : next ? h("div", { class: "next" },
        h("p", { class: "next-k", text: t("web.continueTitle") }),
        h("p", { class: "next-t", text: next.lesson.title }),
        h("p", { class: "muted", text: t("lessonTopics." + hereU.u.key) + " · " + t("learn.lessonOf", { n: next.index + 1, total: hereU.lessons.length }) }),
        h("button", { class: "btn btn-primary", type: "button", onclick: function () { openPlayer(next.lesson); } }, icon("play", 16), t("web.continueBtn")))
        : h("div", { class: "next" }, h("p", { class: "next-t", text: t("web.allDone") })));

    var list = h("div", { class: "units" });
    units.forEach(function (x, ui) {
      if (ui === firstCountry) list.appendChild(groupHead(t("learn.countriesTitle"), t("learn.countriesSub")));
      if (ui === firstLater) list.appendChild(groupHead(t("learn.laterTitle"), t("learn.laterSub")));
      var open = S.open.has(x.u.topic);
      var complete = x.doneCount === x.lessons.length;
      var card = h("section", { class: "unit" + (x.here ? " here" : "") + (x.later ? " later" : "") },
        h("button", { class: "unit-head", type: "button", "aria-expanded": open ? "true" : "false",
          onclick: function () { if (open) S.open.delete(x.u.topic); else S.open.add(x.u.topic); render(); } },
          h("span", { class: "unit-img", style: "background-image:url(" + imgUrl(x.u.img) + ")" }),
          h("span", { class: "unit-body" },
            h("span", { class: "unit-k" }, t("learn.unit", { n: ui + 1 }) + (x.here ? " · " + t("learn.youAreHere") : ""),
              !hasAccess() ? h("span", { class: "tag " + (x.paid ? "paid" : "free") }, x.paid ? icon("lock", 11) : null, x.paid ? t("web.paidTag") : t("web.freeTag")) : null),
            h("span", { class: "unit-t", text: t("lessonTopics." + x.u.key) }),
            h("span", { class: "unit-prog" }, h("i", null, h("b", { style: "width:" + Math.round(100 * x.doneCount / x.lessons.length) + "%" })),
              complete ? h("span", { class: "unit-done" }, icon("check", 14)) : null,
              h("span", { text: x.doneCount + "/" + x.lessons.length }))),
          h("span", { class: "unit-tog" }, icon("down", 18))));
      if (x.u.credit) card.appendChild(photoCredit(x.u.credit, "unit-credit"));
      if (open) {
        card.appendChild(h("ol", { class: "lessons" }, x.nodes.map(function (n) {
          var l = n.lesson;
          if (x.paid && n.state !== "done") return h("li", { class: "lrow locked" },
            h("span", { class: "lnode" }, icon("lock", 14)),
            h("span", { class: "lmeta" }, h("span", { class: "lt", text: l.title }), h("span", { class: "ls", text: t("web.lockedHint") })),
            n.state === "current" ? h("button", { class: "btn btn-ghost btn-sm", type: "button", onclick: showPaywall }, t("web.unlock")) : null);
          return h("li", { class: "lrow " + n.state },
            h("span", { class: "lnode" }, n.state === "done" ? icon("check", 16) : n.state === "current" ? icon("play", 14) : icon("lock", 14)),
            h("span", { class: "lmeta" }, h("span", { class: "lt", text: l.title }),
              h("span", { class: "ls", text: n.state === "locked" ? t("learn.lockedHint") : minutes(l) })),
            n.state === "locked" ? null : h("button", { class: "btn " + (n.state === "current" ? "btn-primary" : "btn-ghost") + " btn-sm", type: "button",
              onclick: function () { openPlayer(l); } }, n.state === "done" ? t("learn.replay") : t("learn.start")));
        }).concat(reviewRow(x))));
      }
      list.appendChild(card);
    });

    mount(h("div", { class: "page" }, topBar(),
      h("main", { class: "cmain" },
        S.notice ? h("p", { class: "notice", role: "status", text: S.notice }) : null,
        summary,
        workTests(),
        h("div", { class: "units-head" }, h("h2", { text: t("learn.allUnits") }),
          h("button", { class: "btn btn-ghost btn-sm", type: "button", onclick: pickCountries }, t("web.changeCountries"))),
        list,
        h("div", { class: "gift-row" },
          h("button", { class: "btn btn-ghost btn-sm", type: "button", onclick: function () { showGift(); } }, icon("gift", 16), t("web.giftGive")),
          h("button", { class: "linkbtn", type: "button", onclick: function () { showRedeem(); } }, t("web.giftHaveCode"))),
        h("p", { class: "fine center", text: t("web.footer") }))));
    S.notice = null;
  }
  // The workplace's own tests, above the units. Nothing shows for anyone without a partner test.
  function workTests() {
    if (!S.tests || !S.tests.length) return null;
    return h("section", { class: "unit here worktests" },
      h("div", { class: "unit-head static" },
        h("span", { class: "unit-body" },
          h("span", { class: "unit-k", text: t("learn.tests") }),
          h("span", { class: "unit-t", text: t("web.workTestsTitle") }),
          h("span", { class: "ls", text: t("web.workTestsSub") }))),
      h("ol", { class: "lessons" }, S.tests.map(function (q) {
        var best = S.best && S.best["test:" + q.slug], n = Array.isArray(q.questions) ? q.questions.length : 0;
        return h("li", { class: "lrow " + (best ? "done" : "current") },
          h("span", { class: "lnode" }, best ? icon("check", 16) : icon("cards", 16)),
          h("span", { class: "lmeta" }, h("span", { class: "lt", text: q.title }),
            h("span", { class: "ls", text: best ? t("games.best", { score: best.score, total: best.total }) : t("web.testQuestions", { count: n }) })),
          h("button", { class: "btn " + (best ? "btn-ghost" : "btn-primary") + " btn-sm", type: "button", onclick: function () { openTest(q); } },
            best ? t("learn.replay") : t("learn.start")));
      })));
  }
  // The last node of a unit: its review. Locked until every lesson is done; the best score shows once taken.
  function reviewRow(x) {
    var r = x.review, best = r.best;
    if (x.paid) return h("li", { class: "lrow review locked" },
      h("span", { class: "lnode" }, icon("lock", 14)),
      h("span", { class: "lmeta" }, h("span", { class: "lt", text: t("review.title") }), h("span", { class: "ls", text: t("web.lockedHint") })));
    return h("li", { class: "lrow review " + r.state },
      h("span", { class: "lnode" }, r.state === "locked" ? icon("lock", 14) : icon("cards", 16)),
      h("span", { class: "lmeta" },
        h("span", { class: "lt", text: r.state === "done" && best ? t("review.nodeBest", { score: best.score, total: best.total }) : t("review.title") }),
        h("span", { class: "ls", text: r.state === "locked" ? t("review.lockedHint")
          : r.state === "done" && best ? t("games.best", { score: best.score, total: best.total }) : t("review.sub", { count: REVIEW_SIZE }) })),
      r.state === "locked" ? null : h("button", { class: "btn " + (r.state === "current" ? "btn-primary" : "btn-ghost") + " btn-sm", type: "button",
        onclick: function () { openReview(x); } }, t("review.start")));
  }
  // The two ways to unlock the course. A plan opens RevenueCat's hosted checkout (Paddle) for this
  // account; RevenueCat sends the purchase to rc-webhook, which unlocks the account (profiles), and
  // the checkout brings the buyer back to ?purchase=done.
  function showPaywall() {
    track("paywall-view");
    var uid = S.session && S.session.user.id;
    function plan(cls, name, price, note, bullets, cta, base) {
      return h("div", { class: "plan " + cls },
        h("p", { class: "plan-n", text: name }), h("p", { class: "plan-p", text: price }), h("p", { class: "plan-note", text: note }),
        h("ul", null, bullets.map(function (b) {
          return h("li", { class: b[1] ? "" : "no" }, icon(b[1] ? "check" : "x", 15), h("span", { text: b[0] }));
        })),
        base ? h("a", { class: "btn btn-primary btn-block", href: base + encodeURIComponent(uid),
          onclick: function () { try { if (window.umami) umami.track("course-checkout", { plan: cls }); } catch (e) {} } }, cta) : null);
    }
    var ready = !!(PURCHASE.monthly || PURCHASE.lifetime);
    var refresh = h("button", { class: "linkbtn", type: "button", onclick: function () { close(); awaitPurchase(); } }, t("web.pwRefresh"));
    var close = dialog(t("web.pwTitle"), h("div", { class: "pw" },
      SANDBOX ? h("p", { class: "pw-soon", text: "TEST MODE · Paddle sandbox. Use a Paddle test card; only test accounts are unlocked." }) : null,
      h("p", { class: "muted", text: t("web.pwSub") }),
      h("div", { class: "plans" },
        plan("monthly", t("web.pwMonthlyName"), t("web.pwMonthlyPrice"), t("web.pwMonthlyNote"),
          [[t("web.pwMonthlyB1"), 1], [t("web.pwMonthlyB2"), 1], [t("web.pwMonthlyB3"), 1]], t("web.pwMonthlyCta"), PURCHASE.monthly),
        plan("lifetime", t("web.pwLifeName"), t("web.pwLifePrice"), t("web.pwLifeNote"),
          [[t("web.pwLifeB1"), 1], [t("web.pwLifeB2"), 1], [t("web.pwLifeB3"), 0]], t("web.pwLifeCta"), PURCHASE.lifetime)),
      ready ? null : h("p", { class: "pw-soon" }, t("web.pwSoon"), " ", h("a", { href: APP_STORE, target: "_blank", rel: "noopener" }, t("web.openAppStore"))),
      h("p", { class: "fine", text: t("web.pwFine") }),
      ready ? refresh : null), [{ label: t("common.close") }]);
    try { if (window.umami) umami.track("course-paywall"); } catch (e) {}
  }
  // ---------------------------------------------------------------- gifts (0137)
  // Buy the course for someone else: RevenueCat's checkout for this account, then rc-webhook makes a
  // single-use code that only the buyer can see (my_gift_codes). The recipient redeems it here.
  function giftCodes() {
    return sb.rpc("my_gift_codes").then(function (res) { return res.error ? [] : res.data || []; }).catch(function () { return []; });
  }
  function cardUrl(code) { return "/gift/card/#c=" + encodeURIComponent(code) + "&l=" + S.lang; }
  function codeRow(g, fresh) {
    var state = g.revoked ? t("web.giftRevoked") : g.redeemed ? t("web.giftRedeemed") : t("web.giftUnused");
    var copy = h("button", { class: "linkbtn", type: "button", onclick: function () {
      try { navigator.clipboard.writeText(g.code); copy.lastChild.textContent = t("web.giftCopied"); } catch (e) {}
    } }, icon("copy", 15), h("span", { text: t("web.giftCopy") }));
    return h("li", { class: "gcode" + (fresh ? " fresh" : "") },
      h("div", null, h("b", { text: g.code }), h("span", { text: state })),
      g.redeemed || g.revoked ? null : h("div", { class: "gcode-a" }, copy,
        h("a", { class: "linkbtn strong", href: cardUrl(g.code), target: "_blank", rel: "noopener" }, t("web.giftPrint"))));
  }
  function showGift(fresh) {
    var uid = S.session && S.session.user.id;
    var list = h("ul", { class: "gcodes" });
    var mine = h("div", { class: "gmine", hidden: true }, h("h3", { text: t("web.giftYours") }), list);
    var buy = PURCHASE.gift
      ? h("a", { class: "btn btn-primary btn-block", href: PURCHASE.gift + encodeURIComponent(uid),
          onclick: function () { try { if (window.umami) umami.track("course-checkout", { plan: "gift" }); } catch (e) {} } }, icon("gift", 16), t("web.giftBuy"))
      : h("p", { class: "pw-soon", text: t("web.giftSoon") });
    dialog(t("web.giftTitle"), h("div", { class: "pw gift" },
      SANDBOX ? h("p", { class: "pw-soon", text: "TEST MODE · Paddle sandbox." }) : null,
      h("p", { class: "muted", text: t("web.giftSub") }),
      h("ul", { class: "gpoints" }, [t("web.giftB1"), t("web.giftB2"), t("web.giftB3")].map(function (b) {
        return h("li", null, icon("check", 15), h("span", { text: b }));
      })),
      h("p", { class: "plan-p", text: t("web.giftPrice") }),
      buy,
      h("p", { class: "fine", text: t("web.pwFine") }),
      mine), [{ label: t("common.close") }]);
    giftCodes().then(function (codes) {
      if (!codes.length) return;
      codes.forEach(function (g) { list.appendChild(codeRow(g, g.code === fresh)); });
      mine.hidden = false;
    });
    try { if (window.umami) umami.track("course-gift-open"); } catch (e) {}
  }
  function giftError(code) {
    return t({ invalid_code: "web.giftErrInvalid", used: "web.giftErrUsed", rate_limited: "web.giftErrWait" }[code] || "auth.errGeneric");
  }
  function redeemGift(code, done) {
    return sb.rpc("redeem_gift_code", { p_code: code }).then(function (res) {
      var r = res.data || {};
      if (res.error || !r.ok) { done(false, giftError(r.error)); return; }
      try { localStorage.removeItem(GIFT_KEY); } catch (e) {}
      return loadProfile(S.session.user.id).then(function (p) {
        if (p.data) Object.assign(S.profile, p.data);
        return refreshHearts();
      }).then(function () { done(true); });
    }).catch(function () { done(false, t("auth.errGeneric")); });
  }
  function showRedeem(prefill) {
    var input = h("input", { type: "text", class: "ginput", autocomplete: "off", spellcheck: "false", placeholder: "WL-XXXX-XXXX",
      "aria-label": t("web.giftCodeLabel"), value: prefill || "" });
    var msg = h("p", { class: "amsg", role: "status", "aria-live": "polite" });
    var go = h("button", { class: "btn btn-primary btn-block", type: "submit" }, t("web.giftRedeem"));
    var close = dialog(t("web.giftRedeemTitle"), h("form", { class: "aform", onsubmit: function (ev) {
      ev.preventDefault();
      if (!input.value.trim()) return;
      go.disabled = true; msg.className = "amsg ok"; msg.textContent = t("web.loading");
      redeemGift(input.value, function (ok, err) {
        go.disabled = false;
        if (!ok) { msg.className = "amsg err"; msg.textContent = err; return; }
        close(); S.notice = t("web.giftRedeemed2"); render();
      });
    } }, h("p", { class: "muted", text: t("web.giftRedeemSub") }), input, go, msg), [{ label: t("common.close") }]);
    input.focus();
  }
  // Back from the gift checkout (?purchase=gift): the code appears once rc-webhook has it.
  function awaitGift() {
    var tries = 0, since = Date.now() - 30 * 60000;
    S.notice = t("web.checking"); render();
    (function poll() {
      giftCodes().then(function (codes) {
        var g = codes.find(function (c) { return Date.parse(c.created_at) > since && !c.redeemed; });
        if (g) { S.notice = t("web.giftReady"); render(); showGift(g.code); return; }
        if (++tries < 20) { setTimeout(poll, 3000); return; }
        S.notice = t("web.giftNotYet"); render();
      });
    })();
  }
  function groupHead(title, sub) {
    return h("div", { class: "ghead" }, h("h3", { text: title }), h("p", { class: "muted", text: sub }));
  }
  function pickCountries() {
    var picked = (countriesOf() || []).slice();
    var chips = h("div", { class: "chips" });
    function draw() {
      chips.textContent = "";
      COUNTRIES.forEach(function (c) {
        var on = picked.indexOf(c) >= 0;
        chips.appendChild(h("button", { class: "pchip" + (on ? " on" : ""), type: "button", "aria-pressed": on ? "true" : "false",
          onclick: function () { picked = on ? picked.filter(function (x) { return x !== c; }) : picked.concat(c); draw(); } }, t("countries." + c)));
      });
    }
    draw();
    dialog(t("learn.pickCountries"), h("div", null, h("p", { class: "muted", text: t("learn.pickCountriesSub") }), chips), [
      { label: t("learn.pickEvery"), on: function () { saveProfile({ wine_countries: null }).catch(function () {}); render(); } },
      { label: t("learn.pickSave"), cls: "btn-primary", on: function () { saveProfile({ wine_countries: picked.length ? picked : null }).catch(function () {}); render(); } }
    ]);
  }
  function loadCourse() {
    return Promise.all([loadLessons(), loadDone(), loadXp(), loadStreak(), refreshHearts(), loadBest(), loadTests()])
      .then(function (r) { S.lessons = r[0]; S.done = withMergedDone(r[1]); S.xp = r[2]; S.streak = r[3]; S.best = r[5]; S.tests = r[6]; S.loadErr = false; if (S.view === "course") { render(); openPending(); } })
      .catch(function () { S.loadErr = true; if (S.view === "course") render(); });
  }
  function refreshProgress() {
    return Promise.all([loadDone(), loadXp(), loadStreak(), refreshHearts(), loadBest()]).then(function (r) {
      S.done = withMergedDone(r[0]); S.xp = r[1]; S.streak = r[2]; S.best = r[4]; if (!P) render();
    }).catch(function () {});
  }

  // ---------------------------------------------------------------- lesson player
  // A Course 2.0 teach card's layout (lesson-visuals.tsx parseLayout); anything malformed is dropped
  // and the card shows its text only.
  function parseLayout(x) {
    var str = function (y) { return typeof y === "string" && y.trim().length > 0; };
    var arr = function (y, min, max) { return Array.isArray(y) && y.length >= min && y.length <= max; };
    if (!x || typeof x !== "object" || !str(x.layout)) return null;
    switch (x.layout) {
      case "term": return str(x.term) ? { layout: "term", term: x.term, say: str(x.say) ? x.say : null } : null;
      case "stat": return str(x.stat) ? { layout: "stat", stat: x.stat } : null;
      case "timeline": return arr(x.items, 2, 6) && x.items.every(function (i) { return i && str(i.when) && str(i.text); })
        ? { layout: "timeline", items: x.items.map(function (i) { return { when: String(i.when), text: String(i.text) }; }) } : null;
      case "list": return arr(x.items, 2, 5) && x.items.every(function (i) { return i && str(i.text); })
        ? { layout: "list", items: x.items.map(function (i) { return { label: str(i.label) ? String(i.label) : null, text: String(i.text) }; }) } : null;
      case "ladder": return arr(x.items, 2, 6) && x.items.every(function (i) { return i && str(i.label) && str(i.text); })
        ? { layout: "ladder", items: x.items.map(function (i) { return { label: String(i.label), text: String(i.text) }; }) } : null;
      case "compare": return arr(x.cols, 2, 2) && x.cols.every(function (c) { return c && str(c.title) && arr(c.items, 1, 5) && c.items.every(str); })
        ? { layout: "compare", cols: x.cols.map(function (c) { return { title: String(c.title), items: c.items.map(String) }; }) } : null;
      case "scale": return str(x.from) && str(x.to) && arr(x.items, 2, 5)
        && x.items.every(function (i) { return i && str(i.label) && typeof i.at === "number" && i.at >= 0 && i.at <= 100; })
        ? { layout: "scale", from: x.from, to: x.to, items: x.items.map(function (i) { return { label: String(i.label), at: i.at }; }) } : null;
      case "map":
        // The outlines arrive with maps.js when a lesson opens; pins are checked when the card is drawn.
        if (!str(x.map) || !Array.isArray(x.pins)) return null;
        var pins = x.pins.filter(str);
        if (!pins.length) return null;
        var groups = Array.isArray(x.groups) ? x.groups.filter(function (g) { return g && str(g.label) && Array.isArray(g.pins); }).slice(0, 3)
          .map(function (g) { return { label: String(g.label), pins: g.pins.filter(function (q) { return pins.indexOf(q) >= 0; }) }; }) : null;
        return { layout: "map", map: x.map, pins: pins, groups: groups && groups.length ? groups : null };
    }
    return null;
  }
  function parseStep(s) {
    if (!s || typeof s !== "object") return null;
    var str = function (x) { return typeof x === "string" && x.trim().length > 0; };
    var photo = typeof s.photo === "string" && s.photo.indexOf(LESSON_IMG) === 0 ? s.photo : null;
    var img = photo || (IMG_KEYS.indexOf(s.img) >= 0 ? imgUrl(s.img) : typeof s.img === "string" && s.img.indexOf(LESSON_IMG) === 0 ? s.img : null);
    var c = s.credit;
    var credit = c && str(c.by) && str(c.license) && typeof c.src === "string" && c.src.indexOf("https://commons.wikimedia.org/") === 0 ? c : null;
    if (s.kind === "teach" && str(s.body)) return { kind: "teach", kicker: s.kicker, title: s.title, body: s.body, tip: s.tip, img: img, credit: credit, v: parseLayout(s) };
    // A question may explain itself in three parts: key fact, why it matters (`why`), remember.
    var ex = function (o) { o.key = str(s.key) ? String(s.key) : null; o.remember = str(s.remember) ? String(s.remember) : null; return o; };
    if (s.kind === "mcq" && str(s.q) && Array.isArray(s.opts) && s.opts.length >= 2 && Number.isInteger(s.a) && s.a >= 0 && s.a < s.opts.length)
      return ex({ kind: "mcq", q: s.q, opts: s.opts.map(String), a: s.a, why: String(s.why || "") });
    if (s.kind === "multi" && str(s.q) && Array.isArray(s.opts) && Array.isArray(s.a) && s.a.length > 0 && s.a.every(function (i) { return Number.isInteger(i) && i >= 0 && i < s.opts.length; }))
      return ex({ kind: "multi", q: s.q, opts: s.opts.map(String), a: s.a, why: String(s.why || "") });
    if (s.kind === "tf" && str(s.q) && typeof s.a === "boolean") return ex({ kind: "tf", q: s.q, a: s.a, why: String(s.why || "") });
    if (s.kind === "match" && str(s.q) && Array.isArray(s.pairs) && s.pairs.length >= 2 && s.pairs.every(function (p) { return Array.isArray(p) && p.length === 2; }))
      return ex({ kind: "match", q: s.q, pairs: s.pairs.map(function (p) { return [String(p[0]), String(p[1])]; }), why: String(s.why || "") });
    if (s.kind === "flip" && str(s.q) && Array.isArray(s.cards) && s.cards.length >= 2 && s.cards.length <= 6
      && s.cards.every(function (c) { return c && str(c.front) && str(c.back); }))
      return { kind: "flip", q: s.q, cards: s.cards.map(function (c) { return { front: String(c.front), back: String(c.back) }; }) };
    return null;
  }
  function isQuestion(s) { return !!s && s.kind !== "teach" && s.kind !== "flip"; }
  function normalizeSteps(lesson, topicLabel, v2) {
    var out = (v2 ? v2.steps : Array.isArray(lesson.steps) ? lesson.steps : []).map(parseStep).filter(Boolean);
    if (out.length) return out;
    return String(lesson.body || "").split(/\n\n+/).map(function (p) { return p.trim(); }).filter(Boolean)
      .map(function (p, i) { return { kind: "teach", kicker: i === 0 ? topicLabel : undefined, title: i === 0 ? lesson.title : undefined, body: p }; });
  }
  function rng(seed) {
    var x = (seed >>> 0) || 1;
    return function () { x ^= x << 13; x ^= x >>> 17; x ^= x << 5; return ((x >>> 0) % 1000000) / 1000000; };
  }
  function shuffleOpts(step, r) {
    if (step.kind !== "mcq" && step.kind !== "multi") return step;
    var order = step.opts.map(function (_, i) { return i; });
    for (var i = order.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var tmp = order[i]; order[i] = order[j]; order[j] = tmp; }
    var opts = order.map(function (i) { return step.opts[i]; });
    var to = function (old) { return order.indexOf(old); };
    return step.kind === "mcq" ? Object.assign({}, step, { opts: opts, a: to(step.a) })
      : Object.assign({}, step, { opts: opts, a: step.a.map(to).sort(function (x, y) { return x - y; }) });
  }
  // A question slot draws from the lesson's own question or a bank question about any card taught
  // since the last questions (learn.tsx buildPlay); flip cards pass through as they are.
  function buildPlay(core, bankRaw, seen, seed, prefix) {
    prefix = prefix || "";
    var r = rng(seed);
    var bank = (bankRaw || []).map(function (b, i) { return { key: prefix + "b" + i, card: Number.isInteger(b && b.t) ? b.t : -1, step: parseStep(b) }; })
      .filter(function (b) { return isQuestion(b.step); });
    var used = new Set(), out = { steps: [], keys: [], card: [] }, teachIdx = -1, recent = [], asked = false;
    core.forEach(function (step, i) {
      if (step.kind === "teach") {
        teachIdx++;
        if (asked) { recent = []; asked = false; }
        recent.push(teachIdx);
        out.steps.push(step); out.keys.push("t" + teachIdx); out.card.push(teachIdx); return;
      }
      if (step.kind === "flip") { out.steps.push(step); out.keys.push("f" + i); out.card.push(null); return; }
      asked = true;
      var pool = [{ key: prefix + "c" + i, step: step }].concat(bank.filter(function (b) { return recent.indexOf(b.card) >= 0 && !used.has(b.key); }));
      var fresh = pool.filter(function (c) { return !seen.has(c.key); });
      var from = fresh.length ? fresh : pool;
      var pk = from[Math.floor(r() * from.length)];
      used.add(pk.key);
      out.steps.push(shuffleOpts(pk.step, r)); out.keys.push(pk.key); out.card.push(null);
    });
    return out;
  }
  function seededOrder(n, seed) {
    var hh = 2166136261;
    for (var i = 0; i < seed.length; i++) hh = Math.imul(hh ^ seed.charCodeAt(i), 16777619);
    var idx = []; for (var k = 0; k < n; k++) idx.push(k);
    for (var a = n - 1; a > 0; a--) { hh = Math.imul(hh ^ (hh >>> 13), 1274126177); var b = Math.abs(hh) % (a + 1); var tmp = idx[a]; idx[a] = idx[b]; idx[b] = tmp; }
    if (n > 1 && idx.every(function (v, i) { return v === i; })) idx.push(idx.shift());
    return idx;
  }
  function seenSet(id) { try { return new Set(JSON.parse(localStorage.getItem("lesson.seen.v1." + id) || "[]")); } catch (e) { return new Set(); } }
  function rememberSeen(id, keys) {
    var s = seenSet(id);
    keys.filter(function (k) { return /^(v2:)?[cb]\d/.test(k); }).forEach(function (k) { s.add(k); });
    try { localStorage.setItem("lesson.seen.v1." + id, JSON.stringify(Array.from(s).slice(-200))); } catch (e) {}
  }
  // The lesson's extras and its Course 2.0 version; the translation of both rides in 'lesson_extra'.
  function loadExtras(id) {
    if (S.trying && TRY_EXTRAS && TRY_EXTRAS.id === id) {
      var x = Object.assign({}, TRY_EXTRAS);
      x.v2 = x.v2 && Array.isArray(x.v2.steps) && x.v2.steps.length ? x.v2 : null;
      return Promise.resolve(x);
    }
    function q(cols) { return sb.from("lessons").select(cols).eq("id", id).limit(1); }
    return q("id, bank, deep_notes, deeper, v2").then(function (res) {
      return res.error && /v2/i.test(res.error.message || "") ? q("id, bank, deep_notes, deeper") : res;
    }).then(function (res) {
      var row = res.data && res.data[0];
      if (!row) return null;
      return localize("lesson_extra", [row]).then(function (r) {
        var x = r[0];
        x.v2 = x.v2 && Array.isArray(x.v2.steps) && x.v2.steps.length ? x.v2 : null;
        return x;
      });
    }).catch(function () { return null; });
  }
  // ---- a unit review (learn.tsx loadReviewPool / buildReview)
  // About ten questions from the unit's lessons, nothing new to read. Each lesson brings its bank
  // questions first, then its own core questions; the review takes one question from each lesson in
  // turn (in a random order), then mixes them. Only Course 2.0 lessons take part: an older lesson's
  // bank was written for a text the course no longer shows. One request for every lesson's extras,
  // with the same 'lesson_extra' translation overlay as a single lesson.
  function loadReviewPool(ids) {
    if (!ids.length) return Promise.resolve([]);
    function q(cols) { return sb.from("lessons").select(cols).in("id", ids); }
    return q("id, bank, deep_notes, deeper, v2").then(function (res) {
      return res.error && /v2/i.test(res.error.message || "") ? q("id, bank, deep_notes, deeper") : res;
    }).then(function (res) {
      if (res.error) throw res.error;
      return localize("lesson_extra", res.data || []);
    }).then(function (rows) {
      var by = {}; rows.forEach(function (r) { by[r.id] = r; });
      var qs = function (raw) { return (Array.isArray(raw) ? raw : []).map(parseStep).filter(isQuestion); };
      return ids.map(function (id) { var v2 = by[id] && by[id].v2; return v2 && Array.isArray(v2.steps) && v2.steps.length ? v2 : null; })
        .filter(Boolean).map(function (v2) { return { bank: qs(v2.bank), core: qs(v2.steps) }; })
        .filter(function (l) { return l.bank.length + l.core.length > 0; });
    });
  }
  function buildReview(pool, seed) {
    var r = rng(seed);
    function shuffled(xs) {
      var a = xs.slice();
      for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(r() * (i + 1)); var tmp = a[i]; a[i] = a[j]; a[j] = tmp; }
      return a;
    }
    // Bank first, each part in a random order; a core question the bank repeats is asked once.
    var lists = shuffled(pool.map(function (l) {
      var asked = new Set();
      return shuffled(l.bank).concat(shuffled(l.core)).filter(function (s) {
        var k = (s.q ? s.q.trim().toLowerCase() : "") + (s.kind === "match" ? "|" + s.pairs[0][0] : "");
        if (asked.has(k)) return false;
        asked.add(k); return true;
      });
    }));
    var picked = [];
    for (var round = 0; picked.length < REVIEW_SIZE && lists.some(function (l) { return l.length > round; }); round++)
      lists.forEach(function (l) { if (l[round] && picked.length < REVIEW_SIZE) picked.push(l[round]); });
    var steps = shuffled(picked).map(function (s) { return shuffleOpts(s, r); });
    return { steps: steps, keys: steps.map(function (_, i) { return "r" + i; }), card: steps.map(function () { return null; }) };
  }

  // The map outlines (assets/course/maps.js, ~110 KB) load with the first lesson, not with the page.
  var mapsReady = null;
  function loadMaps() {
    if (window.WL_MAPS) return Promise.resolve(true);
    if (!mapsReady) mapsReady = new Promise(function (res) {
      var sc = document.createElement("script");
      sc.src = "/assets/course/maps.js?v=1"; sc.async = true;
      sc.onload = function () { res(true); };
      sc.onerror = function () { mapsReady = null; res(false); };
      document.head.appendChild(sc);
    });
    return mapsReady;
  }

  var P = null;   // the open player
  function openPlayer(lesson) {
    if (!unitOpen(lesson.topic)) { showPaywall(); return; }
    track("lesson-start", { lesson: lesson.id });
    var topicLabel = (function () { var u = UNITS.find(function (x) { return x.topic === lesson.topic; }); return u ? t("lessonTopics." + u.key) : t("learn.title"); })();
    P = { lesson: lesson, topicLabel: topicLabel, extras: null, mode: "core", el: h("div", { class: "player", role: "dialog", "aria-modal": "true", "aria-label": lesson.title }) };
    document.body.appendChild(P.el);
    document.body.classList.add("noscroll");
    P.el.appendChild(h("div", { class: "pl-load" }, h("div", { class: "spin" })));
    refreshHearts();
    // Course 2.0 lessons are bigger: wait longer for them than for the old extras.
    var timeout2 = new Promise(function (res) { setTimeout(function () { res(null); }, 8000); });
    Promise.race([Promise.all([loadExtras(lesson.id), loadMaps()]).then(function (r) { return r[0]; }), timeout2]).then(function (x) {
      if (!P || P.lesson !== lesson) return;
      P.extras = x || { bank: [], deep_notes: [], deeper: [], v2: null };
      startPlay("core");
    });
    document.addEventListener("keydown", onKey);
  }
  // A unit review plays in the same player: questions only, no hearts, scored like practice.
  function openReview(x) {
    if (P) return;
    if (!unitOpen(x.u.topic)) { showPaywall(); return; }
    var review = { topic: x.u.topic, title: t("lessonTopics." + x.u.key), lessonIds: x.review.lessonIds };
    track("review-start", { unit: review.topic, lessons: review.lessonIds.length });
    var lesson = { id: "review:" + review.topic, topic: review.topic, title: t("review.title"), steps: [] };
    P = { lesson: lesson, topicLabel: review.title, review: review, extras: null, mode: "review",
      el: h("div", { class: "player", role: "dialog", "aria-modal": "true", "aria-label": t("review.title") + ": " + review.title }) };
    document.body.appendChild(P.el);
    document.body.classList.add("noscroll");
    P.el.appendChild(h("div", { class: "pl-load" }, h("div", { class: "spin" })));
    document.addEventListener("keydown", onKey);
    // Offline, or after 10 s, the pool is empty and the player says so.
    var timeout = new Promise(function (res) { setTimeout(function () { res([]); }, 10000); });
    var me = P;
    Promise.race([Promise.all([loadReviewPool(review.lessonIds), loadMaps()]).then(function (r) { return r[0]; }), timeout])
      .catch(function () { return []; }).then(function (pool) {
        if (P !== me) return;
        P.pool = pool;
        startPlay("review");
      });
  }
  // A workplace test plays like a review (no hearts, scored like practice) over the quiz's own questions,
  // and is recorded the way the app records it: complete_quiz plus complete_practice("test:<slug>").
  function openTest(q) {
    if (P) return;
    track("test-start", { test: q.slug });
    var lesson = { id: "test:" + q.slug, topic: q.slug, title: q.title, steps: [] };
    P = { lesson: lesson, topicLabel: q.title, review: { topic: q.slug, title: q.title, lessonIds: [] }, quiz: q, extras: null, mode: "review",
      el: h("div", { class: "player", role: "dialog", "aria-modal": "true", "aria-label": q.title }) };
    document.body.appendChild(P.el);
    document.body.classList.add("noscroll");
    document.addEventListener("keydown", onKey);
    startPlay("review");
  }
  function buildTest(q, seed) {
    var r = rng(seed);
    var steps = (Array.isArray(q.questions) ? q.questions : []).map(function (x) {
      return x ? parseStep({ kind: "mcq", q: x.q, opts: x.opts, a: x.a, why: x.why }) : null;
    }).filter(Boolean).map(function (s) { return shuffleOpts(s, r); });
    return { steps: steps, keys: steps.map(function (_, i) { return "t" + i; }), card: steps.map(function () { return null; }) };
  }
  function closePlayer() {
    if (!P) return;
    var tried = S.trying ? P.lesson : null;
    P.el.remove(); P = null;
    document.body.classList.remove("noscroll");
    document.removeEventListener("keydown", onKey);
    if (tried) { S.trying = false; TRY_EXTRAS = null; track("try-close", { lesson: tried.id }); S.view = "auth"; S.notice = t("web.trySave"); render(); return; }
    refreshProgress().then(render);
  }
  function startPlay(mode) {
    var x = P.extras || {};
    P.mode = mode;
    var seed = Date.now();
    // A lesson with `v2` plays everything from it (steps, bank, notes, bonus round, article, recap).
    var v2 = x.v2 || null;
    P.v2 = v2;
    P.pack = v2 ? { bank: v2.bank || [], deep_notes: v2.deep_notes || [], deeper: v2.deeper || [] }
      : { bank: x.bank || [], deep_notes: x.deep_notes || [], deeper: x.deeper || [] };
    var deeper = P.pack.deeper.map(parseStep).filter(Boolean);
    P.deeperSteps = deeper;
    P.play = P.quiz ? buildTest(P.quiz, seed)
      : mode === "review" ? buildReview(P.pool || [], seed)
      : mode === "deeper" ? buildPlay(deeper, [], new Set(), seed)
      : buildPlay(normalizeSteps(P.lesson, P.topicLabel, v2), P.pack.bank, seenSet(P.lesson.id), seed, v2 ? "v2:" : "");
    P.steps = P.play.steps;
    P.qCount = P.steps.filter(isQuestion).length;
    P.queue = P.steps.map(function (_, i) { return i; });
    P.pos = 0; P.completed = 0; P.firstRight = 0; P.missed = []; P.combo = 0;
    P.phase = "play"; P.recorded = false; P.startedAt = Date.now(); P.secs = null;
    P.xpBefore = null; P.xpAfter = null; P.streak = null;
    loadXp().then(function (v) { if (P) P.xpBefore = v; });
    resetStep();
    drawPlayer();
  }
  function resetStep() { P.sel = null; P.multi = []; P.checked = null; P.matchL = null; P.matched = []; P.bad = null; P.matchMiss = false; P.openNote = false; P.animate = true; P.flipI = 0; P.flipUp = false; P.flipSeen = false; }
  function curIdx() { return P.queue[P.pos]; }
  function advance(requeue) {
    if (requeue != null) P.queue.push(requeue);
    resetStep();
    if (P.pos + 1 >= P.queue.length) finish(); else { P.pos++; drawPlayer(); }
  }
  function finish() {
    if (P.review) {
      P.phase = "done";
      P.secs = Math.max(1, Math.round((Date.now() - P.startedAt) / 1000));
      if (!P.recorded) {
        // Scored like a practice game: XP per right answer, the streak, and the best score on the node.
        P.recorded = true;
        var rv = P, game = (P.quiz ? "test:" : "review:") + P.review.topic, total = Math.max(1, P.qCount), prev = S.best[game];
        if (P.quiz) {
          track("test-complete", { test: P.quiz.slug, score: P.firstRight, total: P.qCount });
          sb.rpc("complete_quiz", { p_quiz_id: P.quiz.id, p_score: P.firstRight }).then(function () {}, function () {});
        } else track("review-complete", { unit: P.review.topic, score: P.firstRight, total: P.qCount });
        if (!prev || P.firstRight > prev.score) S.best[game] = { score: P.firstRight, total: total };
        sb.rpc("complete_practice", { p_game: game, p_score: P.firstRight, p_total: total })
          .then(function (res) { if (typeof res.data === "number") rv.xpAfter = res.data; if (P === rv) drawPlayer(); }).catch(function () {});
      }
      drawPlayer();
      return;
    }
    if (P.phase !== "done") track("lesson-complete", { lesson: P.lesson.id });
    P.phase = "done";
    P.secs = Math.max(1, Math.round((Date.now() - P.startedAt) / 1000));
    if (!P.recorded && S.trying) { P.recorded = true; rememberSeen(P.lesson.id, P.play.keys); }
    if (!P.recorded) {
      P.recorded = true;
      rememberSeen(P.lesson.id, P.play.keys);
      var me = P;
      if (P.mode === "deeper") {
        sb.rpc("complete_practice", { p_game: "deeper", p_score: P.firstRight, p_total: Math.max(1, P.qCount) })
          .then(function (res) { if (typeof res.data === "number") me.xpAfter = res.data; if (P === me) drawPlayer(); });
      } else {
        sb.rpc("complete_lesson", { p_lesson_id: P.lesson.id }).then(function () {
          return Promise.all([loadStreak(), loadXp()]);
        }).then(function (r) { me.streak = r[0]; me.xpAfter = r[1]; S.done.add(me.lesson.id); if (P === me) drawPlayer(); })
          .catch(function () {});
      }
    }
    drawPlayer();
  }
  function check() {
    var step = P.steps[curIdx()];
    if (!isQuestion(step) || step.kind === "match" || P.checked !== null) return;
    var ok = false;
    if (step.kind === "mcq") ok = P.sel === step.a;
    if (step.kind === "tf") ok = (P.sel === 0) === step.a;
    if (step.kind === "multi") ok = P.multi.length === step.a.length && step.a.every(function (i) { return P.multi.indexOf(i) >= 0; });
    var first = P.missed.indexOf(curIdx()) < 0;
    if (ok) { P.completed++; P.combo++; if (first) P.firstRight++; }
    // A review is practice: like the games in the app, it never costs a heart.
    else { P.combo = 0; if (first) P.missed.push(curIdx()); if (heartsInfo().limited && !P.review) loseHeart().then(function () { if (P) drawPlayer(); }); }
    P.checked = ok; P.animate = false;
    drawPlayer();
  }
  function onRight(j, order) {
    var step = P.steps[curIdx()];
    if (P.matchL === null) return;
    if (order[j] === P.matchL) {
      P.matched.push(P.matchL); P.matchL = null; P.bad = null;
      if (P.matched.length === step.pairs.length) {
        P.completed++;
        if (!P.matchMiss) { P.firstRight++; P.combo++; }
        P.checked = true;
      }
    } else {
      if (!P.matchMiss && heartsInfo().limited && !P.review) loseHeart().then(function () { if (P) drawPlayer(); });
      P.bad = [P.matchL, j]; P.matchL = null; P.matchMiss = true; P.combo = 0;
    }
    P.animate = false; drawPlayer();
  }
  function onKey(e) {
    if (!P || document.querySelector(".dlg-back")) return;
    var tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return;
    if (e.key === "Escape") { closePlayer(); return; }
    if (P.phase !== "play") return;
    var step = P.steps[curIdx()];
    if (step.kind === "flip") {
      if (tag === "BUTTON" || tag === "A") return;
      if (e.key === " " || (e.key === "Enter" && !P.flipSeen)) { e.preventDefault(); flipTurn(); }
      else if (e.key === "Enter") { e.preventDefault(); flipNext(); }
      return;
    }
    if (e.key === "Enter") {
      // A focused button already answers Enter itself.
      if (tag === "BUTTON" || tag === "A") return;
      e.preventDefault();
      if (P.checked !== null && isQuestion(step)) { var ok = P.checked; advance(ok ? null : curIdx()); }
      else if (step.kind === "teach") { P.completed++; advance(); }
      else if (P.sel !== null || P.multi.length) check();
      return;
    }
    var n = parseInt(e.key, 10);
    if (n >= 1 && P.checked === null) {
      if ((step.kind === "mcq" || step.kind === "multi") && n <= step.opts.length) {
        var i = n - 1;
        if (step.kind === "multi") P.multi = P.multi.indexOf(i) >= 0 ? P.multi.filter(function (x) { return x !== i; }) : P.multi.concat(i);
        else P.sel = i;
        P.animate = false; drawPlayer();
      } else if (step.kind === "tf" && n <= 2) { P.sel = n - 1; P.animate = false; drawPlayer(); }
    }
  }

  function drawPlayer() {
    if (!P) return;
    var el = P.el; el.textContent = "";
    // A review with nothing to ask: offline, or the unit's lessons have no questions in this version.
    if (P.review && !P.steps.length) {
      el.appendChild(h("div", { class: "pl-wrap done" }, h("div", { class: "pl-body center" },
        h("p", { class: "muted", text: t("review.loadError") }),
        h("button", { class: "btn btn-ghost", type: "button", onclick: closePlayer }, t("learn.close")))));
      return;
    }
    if (P.phase === "done") { el.appendChild(P.review ? reviewDoneScreen() : doneScreen()); return; }
    if (P.phase === "article") { el.appendChild(articleScreen()); return; }
    if (P.phase === "streak") { el.appendChild(streakScreen()); return; }
    var idx = curIdx(), step = P.steps[idx];
    var H = heartsInfo();
    var card = P.play.card[idx];
    var note = P.mode === "core" && card !== null && typeof P.pack.deep_notes[card] === "string" ? P.pack.deep_notes[card] : null;
    var anim = P.animate ? " rv" : "";
    var d = 0; function dl() { d += 1; return "--d:" + d; }

    var top = h("div", { class: "pl-top" },
      h("button", { class: "pl-close", type: "button", "aria-label": t("learn.close"), onclick: closePlayer }, icon("x", 16)),
      h("div", { class: "pl-prog", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": P.steps.length, "aria-valuenow": P.completed },
        h("i", { style: "width:" + (P.steps.length ? Math.round(100 * P.completed / P.steps.length) : 0) + "%" })),
      P.combo >= 2 ? h("span", { class: "chip chip-flame on", "aria-label": t("learn.inARow", { count: P.combo }) }, icon("flame", 16), String(P.combo)) : null,
      P.review ? null : heartsChip());

    var body = h("div", { class: "pl-body" });
    if (step.kind === "teach") {
      if (step.img) body.appendChild(h("figure", { class: "teach-img" + anim, style: dl() },
        h("img", { src: step.img, alt: "", loading: "eager" }),
        step.credit ? h("figcaption", null, h("a", { href: step.credit.src, target: "_blank", rel: "noopener" },
          t("learn.photoCredit", { by: step.credit.by, license: step.credit.license }))) : null));
      if (step.kicker) body.appendChild(h("p", { class: "kicker" + anim, style: dl(), text: step.kicker }));
      if (step.title) body.appendChild(h("h2", { class: "teach-t" + anim, style: dl(), text: step.title }));
      if (step.v && step.v.layout === "term") {
        // A term card holds the card's own text, like a dictionary entry.
        var tv = visual(step.v, rich(step.body, "teach-b")); if (anim) tv.classList.add("rv"); tv.style.cssText = dl(); body.appendChild(tv);
      } else {
        var b = rich(step.body, "teach-b" + anim); b.style.cssText = dl(); body.appendChild(b);
        if (step.v) { var vv = visual(step.v); if (vv) { if (anim) vv.classList.add("rv"); vv.style.cssText = dl(); body.appendChild(vv); } }
      }
      if (step.tip) body.appendChild(h("div", { class: "tip" + anim, style: dl() }, icon("bulb", 20), h("p", null, inline(step.tip))));
      if (note) {
        body.appendChild(P.openNote
          ? h("div", { class: "nerd" }, h("p", { class: "nerd-k" }, icon("cap", 18), t("learn.nerdKicker")), rich(note))
          : h("button", { class: "nerd-pill" + anim, style: dl(), type: "button", onclick: function () { P.openNote = true; P.animate = false; drawPlayer(); } },
            icon("cap", 17), t("learn.nerdDeeper")));
      }
    } else if (step.kind === "flip") {
      body.appendChild(h("p", { class: "kicker" + anim, style: dl(), text: t("learn.flipKicker") }));
      body.appendChild(h("h2", { class: "q" + anim, style: dl(), text: step.q }));
      var fc = flipCards(step); if (anim) fc.classList.add("rv"); fc.style.cssText = dl(); body.appendChild(fc);
    } else {
      var kind = step.kind === "mcq" ? t("learn.pickOne") : step.kind === "multi" ? t("learn.pickAll") : step.kind === "tf" ? t("learn.trueOrFalse") : t("learn.findPairs");
      // Questions that follow each other are one quick check: "2 of 3" (not on the retries at the end).
      var block = null;
      if (P.pos < P.steps.length) {
        var ba = idx, bz = idx;
        while (ba > 0 && isQuestion(P.steps[ba - 1])) ba--;
        while (bz < P.steps.length - 1 && isQuestion(P.steps[bz + 1])) bz++;
        if (bz > ba) block = [idx - ba + 1, bz - ba + 1];
      }
      body.appendChild(h("div", { class: "q-head" + anim, style: dl() }, h("p", { class: "kicker", text: kind }),
        block ? h("span", { class: "blk", text: t("learn.blockCount", { n: block[0], of: block[1] }) }) : null));
      body.appendChild(h("h2", { class: "q" + anim, style: dl(), text: step.q }));
    }

    if (step.kind === "mcq" || step.kind === "multi") {
      var multi = step.kind === "multi";
      body.appendChild(h("div", { class: "opts" }, step.opts.map(function (o, i) {
        var stt = optState(step, i);
        return h("button", { class: "opt " + stt + (multi ? " sq" : "") + anim, style: dl(), type: "button", disabled: P.checked !== null,
          "aria-pressed": (multi ? P.multi.indexOf(i) >= 0 : P.sel === i) ? "true" : "false",
          onclick: function () {
            if (multi) P.multi = P.multi.indexOf(i) >= 0 ? P.multi.filter(function (x) { return x !== i; }) : P.multi.concat(i);
            else P.sel = i;
            P.animate = false; drawPlayer();
          } },
          h("span", { class: "mark" }, stt === "right" || stt === "on" ? icon("check", 13) : stt === "wrong" ? icon("x", 13) : String(i + 1)),
          h("span", { class: "opt-l", text: o }));
      })));
    }
    if (step.kind === "tf") {
      body.appendChild(h("div", { class: "tf" + anim, style: dl() }, [t("learn.true"), t("learn.false")].map(function (label, i) {
        var stt = optState(step, i);
        return h("button", { class: "tf-t " + stt, type: "button", disabled: P.checked !== null, "aria-pressed": P.sel === i ? "true" : "false",
          onclick: function () { P.sel = i; P.animate = false; drawPlayer(); } },
          h("span", { class: "tf-i" }, icon(i === 0 ? "check" : "x", 22)), label);
      })));
    }
    if (step.kind === "match") {
      var order = seededOrder(step.pairs.length, P.lesson.id + ":" + idx);
      body.appendChild(h("div", { class: "match" + anim, style: dl() },
        h("div", { class: "mcol" }, step.pairs.map(function (p, i) {
          var done = P.matched.indexOf(i) >= 0;
          var stt = done ? "right" : P.bad && P.bad[0] === i ? "wrong" : P.matchL === i ? "on" : "off";
          return h("button", { class: "mbtn " + stt + (done ? " gone" : ""), type: "button", disabled: done, "aria-pressed": P.matchL === i ? "true" : "false",
            onclick: function () { P.matchL = i; P.bad = null; P.animate = false; drawPlayer(); } }, p[0]);
        })),
        h("div", { class: "mcol" }, order.map(function (pi, j) {
          var done = P.matched.indexOf(pi) >= 0;
          var stt = done ? "right" : P.bad && P.bad[1] === j ? "wrong" : "off";
          return h("button", { class: "mbtn " + stt + (done ? " gone" : ""), type: "button", disabled: done,
            onclick: function () { onRight(j, order); } }, step.pairs[pi][1]);
        }))));
    }

    var hasPick = step.kind === "multi" ? P.multi.length > 0 : P.sel !== null;
    var foot = h("div", { class: "pl-foot" },
      step.kind === "teach" ? h("button", { class: "btn btn-primary btn-block", type: "button", onclick: function () { P.completed++; advance(); } }, t("learn.continue"))
        : step.kind === "flip" ? null
        : step.kind === "match" ? h("p", { class: "muted center", text: t("learn.matchHint") })
        : h("button", { class: "btn btn-primary btn-block", type: "button", disabled: !hasPick || P.checked !== null, onclick: check }, t("learn.check")),
      P.pos === 0 && P.mode !== "deeper" ? h("p", { class: "keyhint", text: t("web.keyHint") }) : null);

    el.appendChild(h("div", { class: "pl-wrap" }, top, body, foot));

    if (P.checked !== null && isQuestion(step)) {
      var ok = P.checked;
      var title = ok ? (P.combo >= 3 ? t("learn.inARow", { count: P.combo }) : step.kind === "match" && P.matchMiss ? t("learn.foundAll") : t("learn.nice")) : t("learn.notQuite");
      var answer = step.kind === "mcq" ? step.opts[step.a] : step.kind === "tf" ? t(step.a ? "learn.true" : "learn.false")
        : step.kind === "multi" ? step.a.map(function (i) { return step.opts[i]; }).join(", ") : "";
      var go = h("button", { class: "btn btn-block " + (ok ? "btn-ok" : "btn-no"), type: "button", onclick: function () { advance(ok ? null : idx); } }, t("learn.continue"));
      el.appendChild(h("div", { class: "sheet " + (ok ? "ok" : "no"), role: "status", "aria-live": "assertive" },
        h("div", { class: "sheet-in" },
          h("p", { class: "sheet-t" }, icon(ok ? "check" : "x", 20), title),
          !ok && answer ? h("p", { class: "sheet-a", text: t("learn.rightAnswer", { answer: answer }) }) : null,
          step.key || step.remember ? h("div", { class: "sheet-x" },
            step.key ? h("p", { class: "sheet-w" }, h("b", { text: t("learn.keyFact") + " " }), step.key) : null,
            step.why ? h("p", { class: "sheet-w" }, h("b", { text: t("learn.whyMatters") + " " }), step.why) : null,
            step.remember ? h("p", { class: "sheet-w" }, h("b", { text: t("learn.remember") + " " }), step.remember) : null)
            : step.why ? h("p", { class: "sheet-w", text: step.why }) : null,
          !ok ? h("p", { class: "sheet-l" }, icon("redo", 14), t("learn.againLater")) : null,
          go)));
      setTimeout(function () { go.focus(); }, 30);
    }
    if (H.out && !P.review && P.checked !== false) el.appendChild(outOfHearts(H));
    P.animate = false;
  }
  // ---------------------------------------------------------------- Course 2.0 visuals
  // The web twins of lesson-visuals.tsx: same layouts, same palette, plain DOM and SVG.
  var GROUP = ["#7b1e3b", "#3f6f8f", "#a8741f"];
  function svg(tag, attrs) {
    var el = document.createElementNS("http://www.w3.org/2000/svg", tag);
    for (var k in attrs) if (attrs[k] != null) el.setAttribute(k, attrs[k]);
    return el;
  }
  function visual(v, definition) {
    switch (v.layout) {
      case "term":
        return h("div", { class: "lv lv-term" }, h("p", { class: "lv-word", role: "heading", "aria-level": "3", text: v.term }),
          v.say ? h("p", { class: "lv-say", text: v.say }) : null, definition || null);
      case "stat":
        return h("div", { class: "lv lv-stat" }, h("p", { text: v.stat }));
      case "timeline":
        return h("ol", { class: "lv-tl" }, v.items.map(function (it) {
          return h("li", null, h("span", { class: "lv-when", text: it.when }), h("p", { text: it.text }));
        }));
      case "list":
        return h("ol", { class: "lv-list" }, v.items.map(function (it, i) {
          return h("li", null, h("i", { text: String(i + 1) }), h("p", null, it.label ? h("b", { text: it.label + ": " }) : null, it.text));
        }));
      case "ladder":
        var n = v.items.length;
        return h("div", { class: "lv-ladder" }, v.items.map(function (it, i) {
          return h("div", { class: "lv-rung", style: "width:" + Math.round(56 + 44 * i / Math.max(1, n - 1)) + "%;opacity:" + (1 - 0.5 * i / Math.max(1, n - 1)).toFixed(2) },
            h("b", { text: it.label }), h("span", { text: it.text }));
        }));
      case "compare":
        return h("div", { class: "lv-cmp" }, v.cols.map(function (c, i) {
          return h("div", { class: "lv-col", style: "--c:" + GROUP[i] }, h("b", { text: c.title }),
            h("ul", null, c.items.map(function (x) { return h("li", { text: x }); })));
        }));
      case "scale":
        var items = v.items.slice().sort(function (a, b) { return a.at - b.at; });
        var lab = function (it) {
          var cls = it.at < 15 ? " l" : it.at > 85 ? " r" : "";
          return h("span", { class: "lv-sl" + cls, style: "left:" + it.at + "%", text: it.label });
        };
        return h("div", { class: "lv lv-scale" },
          h("div", { class: "lv-sr" }, items.filter(function (_, i) { return i % 2 === 0; }).map(lab)),
          h("div", { class: "lv-track" }, items.map(function (it) { return h("i", { style: "left:" + it.at + "%" }); })),
          h("div", { class: "lv-sr" }, items.filter(function (_, i) { return i % 2 === 1; }).map(lab)),
          h("div", { class: "lv-ends" }, h("span", { text: v.from }), h("span", { text: v.to })));
      case "map":
        return mapCard(v);
    }
    return null;
  }
  function mapCard(v) {
    var M = window.WL_MAPS, PL = window.WL_PLACES, m = M && M[v.map];
    if (!m) return null;
    var pins = v.pins.filter(function (p) { return PL[p]; });
    if (!pins.length) return null;
    var name = function (id) { return PL[id].name[S.lang] || PL[id].name.en; };
    // Sized like the app: as wide as the card allows, never taller than 300 px; labels 12.5 px on screen.
    var avail = Math.min(680, window.innerWidth) - 40 - 32 - 24;
    var scale = Math.min(avail / m.w, 300 / m.h);
    var font = 12.5 / scale, r = 4.5 / scale;
    var colorOf = function (id) {
      var g = v.groups ? v.groups.findIndex(function (x) { return x.pins.indexOf(id) >= 0; }) : -1;
      return g >= 0 ? GROUP[g] : GROUP[0];
    };
    var s = svg("svg", { viewBox: "0 0 " + m.w + " " + m.h, width: Math.round(m.w * scale), height: Math.round(m.h * scale), role: "img",
      "aria-label": pins.map(name).join(", ") });
    s.appendChild(svg("path", { d: m.d, fill: "#e3dadd", stroke: "#b9aab1", "stroke-width": 1 / scale, "stroke-linejoin": "round" }));
    pins.forEach(function (id) {
      var x = (PL[id].lon - m.west) * m.kx * m.scale, y = (m.north - PL[id].lat) * m.scale;
      var label = name(id), tw = label.length * font * 0.56;
      var left = x + r + 3 + tw > m.w;           // no room on the right: write it on the left
      var tx = left ? x - r - 3 / scale : x + r + 3 / scale, ty = y + font * 0.35, anchor = left ? "end" : "start";
      s.appendChild(svg("circle", { cx: x, cy: y, r: r, fill: colorOf(id), stroke: "#fdfdfe", "stroke-width": 1.5 / scale }));
      // A halo under the name keeps it readable across the coastline.
      var halo = svg("text", { x: tx, y: ty, "font-size": font, "font-weight": 600, fill: "#f5f5f7", stroke: "#f5f5f7",
        "stroke-width": 3.5 / scale, "stroke-linejoin": "round", "text-anchor": anchor, "aria-hidden": "true" });
      halo.textContent = label; s.appendChild(halo);
      var tt = svg("text", { x: tx, y: ty, "font-size": font, "font-weight": 600, fill: "#1d1d1f", "text-anchor": anchor });
      tt.textContent = label; s.appendChild(tt);
    });
    return h("div", { class: "lv lv-map" }, s,
      v.groups ? h("div", { class: "lv-legend" }, v.groups.map(function (g, i) {
        return h("span", null, h("i", { style: "background:" + GROUP[i] }), g.label);
      })) : null);
  }
  // Flip cards: say the answer to yourself, then turn the card. The lesson moves on after the last.
  function flipCards(step) {
    var c = step.cards[P.flipI], last = P.flipI === step.cards.length - 1;
    var card = h("button", { class: "flip" + (P.flipUp ? " up" : ""), type: "button", onclick: flipTurn,
      "aria-label": P.flipUp ? c.back : c.front + ". " + t("web.flipClick") },
      h("span", { class: "flip-f" }, h("b", { text: c.front }), h("em", { text: t("web.flipClick") })),
      h("span", { class: "flip-b" }, h("b", { text: c.back })));
    var again = h("button", { class: "linkbtn strong flip-again", type: "button", onclick: flipTurn, hidden: !P.flipUp }, t("learn.flipBack"));
    var next = h("button", { class: "btn btn-primary btn-block flip-next", type: "button", disabled: !P.flipSeen, onclick: flipNext },
      last ? t("learn.continue") : t("learn.flipNext"));
    return h("div", { class: "flipper" }, h("p", { class: "flip-n", text: t("learn.flipCounter", { n: P.flipI + 1, of: step.cards.length }) }),
      card, again, next);
  }
  // Turning a card only touches its own classes, so the turn animates instead of redrawing.
  function flipTurn() {
    P.flipUp = !P.flipUp; P.flipSeen = true;
    var el = P.el.querySelector(".flip");
    if (!el) return;
    var step = P.steps[curIdx()], c = step.cards[P.flipI];
    el.classList.toggle("up", P.flipUp);
    el.setAttribute("aria-label", P.flipUp ? c.back : c.front + ". " + t("web.flipClick"));
    P.el.querySelector(".flip-again").hidden = !P.flipUp;
    P.el.querySelector(".flip-next").disabled = false;
  }
  function flipNext() {
    if (!P.flipSeen) return;
    var step = P.steps[curIdx()];
    if (P.flipI < step.cards.length - 1) { P.flipI++; P.flipUp = false; P.flipSeen = false; P.animate = false; drawPlayer(); return; }
    P.completed++; advance();
  }
  function optState(step, i) {
    var on = step.kind === "multi" ? P.multi.indexOf(i) >= 0 : P.sel === i;
    var right = step.kind === "mcq" ? step.a === i : step.kind === "multi" ? step.a.indexOf(i) >= 0 : step.kind === "tf" ? (i === 0) === step.a : false;
    if (P.checked !== null && right) return "right";
    if (P.checked !== null && on) return "wrong";
    if (P.checked !== null) return "dim";
    return on ? "on" : "off";
  }
  function outOfHearts(H) {
    return h("div", { class: "out" }, h("div", { class: "out-in" },
      h("div", { class: "out-heart" }, icon("heart", 64), h("span", { text: "0" })),
      h("h2", { text: t("hearts.emptyTitle") }),
      h("p", { text: t("hearts.emptyBody", { time: untilText(H.nextAt), full: clock(H.fullAt), max: H.max }) }),
      h("p", { class: "muted", text: t("web.heartsInApp") }),
      h("a", { class: "btn btn-primary btn-block", href: APP_STORE, target: "_blank", rel: "noopener" }, icon("heart", 16), t("hearts.getUnlimited")),
      h("button", { class: "btn btn-ghost btn-block", type: "button", onclick: closePlayer }, t("hearts.wait"))));
  }
  function stat(label, value, cls) { return h("div", { class: "stat " + cls }, h("b", { text: value }), h("span", { text: label })); }
  function doneScreen() {
    var goal = goalXp();
    var gained = P.xpAfter != null && P.xpBefore != null ? Math.max(0, P.xpAfter - P.xpBefore) : null;
    var acc = P.qCount > 0 ? Math.round(100 * P.firstRight / P.qCount) : null;
    var outcomeSrc = P.v2 && P.v2.outcomes ? P.v2.outcomes : P.lesson.outcomes;
    var outcomes = Array.isArray(outcomeSrc) ? outcomeSrc.filter(function (o) { return typeof o === "string"; }) : [];
    var recap = P.v2 && Array.isArray(P.v2.recap) ? P.v2.recap.filter(function (o) { return typeof o === "string" && o.trim(); }) : [];
    var nextUp = P.v2 && typeof P.v2.next === "string" && P.v2.next.trim() ? P.v2.next : null;
    var xpNow = P.xpAfter != null ? P.xpAfter : P.xpBefore;
    var frac = xpNow != null ? Math.min(1, xpNow / goal) : 1;
    return h("div", { class: "pl-wrap done" },
      h("div", { class: "pl-body center" },
        h("div", { class: "ring", style: "--p:" + Math.round(frac * 100) },
          xpNow != null ? [h("b", { text: String(xpNow) }), h("span", { text: t("learn.ofGoal", { goal: goal }) })] : icon("check", 52)),
        h("h2", { text: P.mode === "deeper" ? t("learn.nerdDone") : t("learn.lessonDone") }),
        h("p", { class: "muted", text: P.lesson.title }),
        h("div", { class: "stats" },
          gained != null ? stat(t("learn.xpEarned"), "+" + gained, "wine") : null,
          acc != null ? stat(acc === 100 ? t("learn.accPerfect") : acc >= 80 ? t("learn.accGreat") : t("learn.accuracy"), acc + " %", "green") : null,
          P.secs != null ? stat(t("learn.time"), Math.floor(P.secs / 60) + ":" + String(P.secs % 60).padStart(2, "0"), "orange") : null),
        P.mode === "core" && recap.length ? h("div", { class: "outcomes recap" }, h("h3", { text: t("learn.recapTitle") }),
          h("ol", null, recap.map(function (o, i) { return h("li", null, h("i", { text: String(i + 1) }), h("span", { text: o })); })),
          // Every teaser already opens with "Next, …" in its own language, so it needs no "Next up:" label.
          nextUp ? h("p", { class: "next-up", text: nextUp }) : null) : null,
        P.mode === "core" && !recap.length && outcomes.length ? h("div", { class: "outcomes" }, h("h3", { text: t("learn.nowYouCan") }),
          h("ul", null, outcomes.map(function (o) { return h("li", null, icon("check", 16), h("span", { text: o })); }))) : null),
      h("div", { class: "pl-foot" },
        P.mode === "core" && P.deeperSteps.length && !S.trying ? h("div", { class: "nerd-offer" },
          h("div", null, h("b", { text: t("learn.nerdOfferTitle") }), h("span", { text: t("learn.nerdOfferBody") })),
          h("button", { class: "btn btn-ghost btn-sm", type: "button", onclick: function () { startPlay("deeper"); } }, icon("cap", 16), t("learn.nerdDeeper"))) : null,
        S.trying ? h("div", { class: "try-save" }, h("b", { text: t("web.tryDoneTitle") }), h("span", { text: t("web.tryDoneBody") })) : null,
        h("button", { class: "btn btn-primary btn-block", type: "button", onclick: function () {
          if (S.trying) { track("try-signup-click", { lesson: P.lesson.id }); closePlayer(); return; }
          if (P.mode === "core" && P.streak && P.streak.current > 0 && P.xpBefore === 0) { P.phase = "streak"; drawPlayer(); } else closePlayer();
        } }, S.trying ? t("web.tryDoneCta") : t("learn.continue")),
        S.trying ? h("a", { class: "btn btn-ghost btn-block", href: APP_STORE, onclick: function () { track("try-app-click", { lesson: P.lesson.id }); } }, t("web.tryDoneApp")) : null,
        S.trying ? null : h("div", { class: "row2" },
          P.mode === "core" && P.qCount > 0 ? h("button", { class: "btn btn-ghost", type: "button", onclick: function () { P.phase = "article"; drawPlayer(); } }, t("learn.readArticle")) : null,
          h("button", { class: "btn btn-ghost", type: "button", onclick: function () { startPlay(P.mode); } }, P.mode === "core" ? t("learn.againNew") : t("learn.again")))));
  }
  // The right answer in words, for a review's "practise these" list (learn.tsx answerOf).
  function answerOf(step) {
    return step.kind === "mcq" ? step.opts[step.a] : step.kind === "tf" ? t(step.a ? "learn.true" : "learn.false")
      : step.kind === "multi" ? step.a.map(function (i) { return step.opts[i]; }).join(", ") : "";
  }
  // The practice-game result: right first time out of all, the ones to look at again, play again.
  function reviewDoneScreen() {
    var total = Math.max(1, P.qCount), score = P.firstRight;
    var gained = P.xpAfter != null && P.xpBefore != null ? Math.max(0, P.xpAfter - P.xpBefore) : null;
    var rank = score / total >= 0.85 ? t("games.rankTop") : score / total >= 0.6 ? t("games.rankGood") : t("games.rankPractice");
    return h("div", { class: "pl-wrap done" },
      h("div", { class: "pl-body center" },
        h("div", { class: "ring", style: "--p:" + Math.round(100 * score / total), role: "img", "aria-label": score + "/" + total + " " + t("games.correct") },
          h("b", null, String(score), h("small", { text: "/" + total })), h("span", { text: t("games.correct") })),
        h("h2", { text: rank }),
        h("p", { class: "muted", text: P.quiz ? P.quiz.title : t("review.doneSub", { unit: P.review.title }) }),
        h("div", { class: "stats" },
          gained != null ? stat(t("learn.xpEarned"), "+" + gained, "wine") : null,
          P.secs != null ? stat(t("learn.time"), Math.floor(P.secs / 60) + ":" + String(P.secs % 60).padStart(2, "0"), "orange") : null),
        P.missed.length ? h("div", { class: "outcomes review-miss" }, h("h3", { text: t("games.practiseThese") }),
          h("ul", null, P.missed.map(function (i) {
            var q = P.steps[i], a = q ? answerOf(q) || q.key || "" : "";
            return h("li", null, h("span", null, h("b", { text: q && q.q ? q.q : "" }), a ? h("small", { text: a }) : null));
          })))
          : h("div", { class: "tip ok" }, icon("check", 20), h("p", { text: t("games.perfect") }))),
      h("div", { class: "pl-foot" },
        h("button", { class: "btn btn-primary btn-block", type: "button", onclick: closePlayer }, t("learn.continue")),
        h("button", { class: "btn btn-ghost btn-block", type: "button", onclick: function () {
          track("review-start", { unit: P.review.topic, lessons: P.review.lessonIds.length, again: true }); startPlay("review");
        } }, t("learn.againNew"))));
  }
  function articleScreen() {
    return h("div", { class: "pl-wrap" },
      h("div", { class: "pl-top" }, h("button", { class: "linkbtn", type: "button", onclick: function () { P.phase = "done"; drawPlayer(); } }, icon("back", 16), t("learn.result"))),
      h("div", { class: "pl-body article" }, h("h2", { text: P.lesson.title }),
        P.lesson.summary ? h("p", { class: "lede", text: P.lesson.summary }) : null, rich(P.v2 && P.v2.body ? P.v2.body : P.lesson.body)));
  }
  function streakScreen() {
    var n = P.streak.current, days = t("learn.weekdays").split(","), today = (new Date().getDay() + 6) % 7;
    return h("div", { class: "pl-wrap done" },
      h("div", { class: "pl-body center streak" },
        h("div", { class: "flame" }, icon("flame", 96)),
        h("b", { class: "streak-n", text: String(n) }), h("p", { class: "streak-u", text: t("learn.streakUnit", { count: n }) }),
        h("h2", { text: n === 1 ? t("learn.streakBorn") : t("learn.streakGrew", { count: n }) }),
        h("p", { class: "muted", text: n === 1 ? t("learn.streakBornBody") : t("learn.streakGrewBody") }),
        h("div", { class: "week" }, days.map(function (dd, i) {
          var lit = i <= today && today - i < n;
          return h("div", { class: "wd" + (i === today ? " today" : "") }, h("span", { text: dd }), h("i", { class: lit ? "on" : "" }, lit ? icon("check", 16) : null));
        }))),
      h("div", { class: "pl-foot" }, h("button", { class: "btn btn-primary btn-block", type: "button", onclick: closePlayer }, t("learn.streakCommit"))));
  }

  // ---------------------------------------------------------------- flow
  function render() {
    document.documentElement.lang = S.lang;
    if (S.view === "loading") { mount(h("main", { class: "cmain center" }, h("div", { class: "spin", "aria-label": t("web.loading") }))); return; }
    if (S.view === "auth") return renderAuth();
    if (S.view === "recovery") return renderRecovery();
    if (S.view === "onboarding") return renderOnboarding();
    return renderCourse();
  }
  function loadProfile(uid) {
    return sb.from("profiles").select("id, display_name, experience_level, language, wine_countries, daily_goal_min, is_premium, premium_until, subscription_tier, course_access")
      .eq("id", uid).maybeSingle();
  }
  // Back from the checkout (?purchase=done): the webhook may take a few seconds, so look again a few
  // times before saying it hasn't arrived.
  function awaitPurchase() {
    var tries = 0;
    S.notice = t("web.checking"); render();
    (function poll() {
      loadProfile(S.session.user.id).then(function (res) {
        if (res.data) Object.assign(S.profile, res.data);
        if (hasAccess()) { track("course-purchase"); S.notice = t("web.unlocked"); refreshHearts().then(render); return; }
        if (++tries < 20) { setTimeout(poll, 3000); return; }
        S.notice = t("web.notYet"); render();
      });
    })();
  }
  function afterSignIn() {
    var uid = S.session.user.id;
    loadProfile(uid)
      .then(function (res) {
        S.profile = res.data || { id: uid };
        var saved = null; try { saved = localStorage.getItem("wl-course-lang"); } catch (e) {}
        if (!saved && S.profile.language && STR[S.profile.language]) S.lang = S.profile.language;
        if (!S.profile.experience_level) { S.view = "onboarding"; render(); return; }
        S.view = "course"; render(); loadCourse();
        var qs = location.search;
        if (/[?&](purchase|gift|redeem)=/.test(qs)) history.replaceState(null, "", location.pathname);
        if (/[?&]purchase=done/.test(qs)) awaitPurchase();
        else if (/[?&]purchase=gift/.test(qs)) awaitGift();
        else if (pendingGift()) showRedeem(pendingGift());
        else {
          var openGift = null; try { openGift = sessionStorage.getItem("wl-gift-open"); sessionStorage.removeItem("wl-gift-open"); } catch (e) {}
          if (openGift === "redeem") showRedeem(); else if (openGift) showGift();
        }
      }).catch(function () { S.profile = { id: uid }; S.view = "course"; render(); loadCourse(); });
  }
  S.lang = startLang();
  render();
  if (/type=signup/.test(hashAtLoad)) S.notice = t("web.confirmed");
  sb.auth.onAuthStateChange(function (ev, session) {
    // Supabase calls this inside its own lock: anything that talks to Supabase waits a tick.
    setTimeout(function () {
      if (ev === "PASSWORD_RECOVERY") { recovering = true; S.session = session; S.view = "recovery"; render(); return; }
      var had = S.session && S.session.user.id;
      S.session = session;
      if (!session) {
        if (TRY) { startTry(); return; }
        if (S.trying) return;
        if (P) closePlayer(); S.profile = null; S.lessons = null; S.view = "auth"; render(); return;
      }
      if (S.trying && P) { S.trying = false; TRY_EXTRAS = null; P.el.remove(); P = null; document.body.classList.remove("noscroll"); document.removeEventListener("keydown", onKey); }
      TRY = null;
      if (recovering) { S.view = "recovery"; render(); return; }
      if (had !== session.user.id) afterSignIn();
    }, 0);
  });
  sb.auth.getSession().then(function (res) {
    var session = res.data && res.data.session;
    if (!session && TRY) { startTry(); return; }
    if (!session && S.view === "loading") { S.view = "auth"; render(); }
  });
  if (location.hash && /access_token|error_description/.test(location.hash)) {
    // The tokens are read by Supabase; keep them out of the address bar and history.
    setTimeout(function () { history.replaceState(null, "", location.pathname + location.search); }, 800);
  }
})();

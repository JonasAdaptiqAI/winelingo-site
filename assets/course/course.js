/* Winelingo course on the web (/course/).
   The same account, lessons and progress as the iPhone app: it reads the same tables and calls
   the same database functions (complete_lesson, complete_practice, hearts_state, hearts_lose,
   my_xp_today), so a lesson finished here is finished in the app, and the other way round.
   The lesson player follows the app's (prototype/learn.tsx, LessonPlayer): teach cards in order,
   each question slot filled from the lesson's own question or a bank question about the same card,
   options shuffled, a wrong answer comes back at the end and costs a heart for free accounts.
   Plain DOM, no framework; every text goes in with textContent. */
(function () {
  "use strict";

  var SB_URL = "https://pzrqsjcpflvbgptppcep.supabase.co";
  var SB_KEY = "sb_publishable_r3cWiruTBNV8YUuAv5sj3Q_bseo7A8B";   // public by design
  // Sign in with Apple on the web needs an Apple Services ID set up in Supabase first.
  var APPLE_WEB = false;
  var APP_STORE = "https://apps.apple.com/app/id6785896824";
  var LESSON_IMG = SB_URL + "/storage/v1/object/public/lesson-images/";
  var LANGS = [["en", "English"], ["da", "Dansk"], ["es", "Español"], ["de", "Deutsch"]];
  var HERE = location.origin + "/course/";

  // The course: one unit per lesson topic, in curriculum order (learn.tsx UNITS).
  var UNITS = [
    ["Tasting & senses", "tastingSenses", "uTasting"], ["Red grapes to know", "redGrapes", "uRedGrapes"],
    ["White grapes to know", "whiteGrapes", "uWhiteGrapes"], ["Serving & glassware", "servingGlassware", "uServing"],
    ["Food & wine", "foodWine", "pairing"], ["Reading the label", "readingLabel", "uLabel"],
    ["France", "france", "uFrance"], ["Italy", "italy", "uItaly"], ["Spain", "spain", "uSpain"],
    ["Portugal", "portugal", "uPortugal"], ["Germany", "germany", "uGermany"], ["Austria", "austria", "uAustria"],
    ["USA", "usa", "uUSA"], ["Argentina", "argentina", "uArgentina"], ["Chile", "chile", "uChile"],
    ["Australia", "australia", "uAustralia"], ["New Zealand", "newzealand", "uNewZealand"],
    ["South Africa", "southafrica", "uSouthAfrica"], ["In the vineyard", "inVineyard", "uVineyard"],
    ["How wine is made", "howMade", "uWinemaking"], ["Terroir & vintages", "terroirVintages", "uTerroir"],
    ["Quality, ageing & collecting", "qualityAgeing", "uCellar"], ["Buying & value", "buyingValue", "uShop"],
    ["Wine at the table", "atTable", "uToast"], ["Wine, health & moderation", "healthModeration", "uModeration"],
    ["A short history of wine", "history", "uHistory"]
  ].map(function (u) { return { topic: u[0], key: u[1], img: u[2] }; });
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
    lessons: null, done: new Set(), xp: null, streak: null, hearts: null,
    open: new Set(), openLater: new Set(), loadErr: false, notice: null
  };
  var hashAtLoad = location.hash;
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
    redo: "M4 12a8 8 0 1 0 2.3-5.7M4 4v4.5h4.5", caret: "m9 6 6 6-6 6", down: "m6 9 6 6 6-6", back: "m15 6-6 6 6 6"
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
    return l;
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
  function loadLessons() {
    return sb.from("lessons").select("id, topic, title, summary, body, sort_order, steps, outcomes, chapter, chapter_sort")
      .order("sort_order").then(function (res) {
        if (res.error) throw res.error;
        return localize("lesson", res.data || []);
      }).then(function (rows) { return rows.map(inChapter); });
  }
  function loadDone() {
    return sb.from("lesson_completions").select("lesson_id").eq("user_id", S.session.user.id).then(function (res) {
      return new Set((res.data || []).map(function (r) { return r.lesson_id; }));
    });
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
    return sb.rpc("my_xp_today").then(function (res) { return typeof res.data === "number" ? res.data : null; }).catch(function () { return null; });
  }
  function refreshHearts() {
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
        form,
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
          .then(function () { S.view = "course"; render(); loadCourse(); })
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
      return { u: u, lessons: ls, nodes: nodes, doneCount: doneCount, later: !inPath(u.topic), here: false };
    }).filter(function (x) { return x.lessons.length > 0; });
    var ordered = list.filter(function (x) { return !x.later; }).concat(list.filter(function (x) { return x.later; }));
    var here = ordered.find(function (x) { return x.doneCount > 0 && x.doneCount < x.lessons.length; })
      || ordered.find(function (x) { return !x.later && x.doneCount < x.lessons.length; });
    if (here) here.here = true;
    return ordered;
  }
  function minutes(l) {
    var n = Array.isArray(l.steps) ? l.steps.length : 0;
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

    var summary = h("section", { class: "csum" },
      h("div", { class: "csum-l" },
        h("p", { class: "eyebrow", text: t("learn.title") }),
        h("h1", { text: t("learn.courseSummary", { done: doneAll, total: totalAll }) }),
        h("div", { class: "xpbar", role: "img", "aria-label": t("web.xpToday", { xp: xp, goal: goal }) },
          h("i", { style: "width:" + Math.min(100, Math.round(100 * xp / goal)) + "%" })),
        h("p", { class: "muted", text: t("web.xpToday", { xp: xp, goal: goal }) + " · " +
          (S.streak && S.streak.current ? t("web.streak", { count: S.streak.current }) : t("web.noStreak")) })),
      next ? h("div", { class: "next" },
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
            h("span", { class: "unit-k", text: t("learn.unit", { n: ui + 1 }) + (x.here ? " · " + t("learn.youAreHere") : "") }),
            h("span", { class: "unit-t", text: t("lessonTopics." + x.u.key) }),
            h("span", { class: "unit-prog" }, h("i", null, h("b", { style: "width:" + Math.round(100 * x.doneCount / x.lessons.length) + "%" })),
              complete ? h("span", { class: "unit-done" }, icon("check", 14)) : null,
              h("span", { text: x.doneCount + "/" + x.lessons.length }))),
          h("span", { class: "unit-tog" }, icon("down", 18))));
      if (open) {
        card.appendChild(h("ol", { class: "lessons" }, x.nodes.map(function (n) {
          var l = n.lesson;
          return h("li", { class: "lrow " + n.state },
            h("span", { class: "lnode" }, n.state === "done" ? icon("check", 16) : n.state === "current" ? icon("play", 14) : icon("lock", 14)),
            h("span", { class: "lmeta" }, h("span", { class: "lt", text: l.title }),
              h("span", { class: "ls", text: n.state === "locked" ? t("learn.lockedHint") : minutes(l) })),
            n.state === "locked" ? null : h("button", { class: "btn " + (n.state === "current" ? "btn-primary" : "btn-ghost") + " btn-sm", type: "button",
              onclick: function () { openPlayer(l); } }, n.state === "done" ? t("learn.replay") : t("learn.start")));
        })));
      }
      list.appendChild(card);
    });

    mount(h("div", { class: "page" }, topBar(),
      h("main", { class: "cmain" },
        S.notice ? h("p", { class: "notice", role: "status", text: S.notice }) : null,
        summary,
        h("div", { class: "units-head" }, h("h2", { text: t("learn.allUnits") }),
          h("button", { class: "btn btn-ghost btn-sm", type: "button", onclick: pickCountries }, t("web.changeCountries"))),
        list,
        h("p", { class: "fine center", text: t("web.footer") }))));
    S.notice = null;
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
    return Promise.all([loadLessons(), loadDone(), loadXp(), loadStreak(), refreshHearts()])
      .then(function (r) { S.lessons = r[0]; S.done = r[1]; S.xp = r[2]; S.streak = r[3]; S.loadErr = false; if (S.view === "course") render(); })
      .catch(function () { S.loadErr = true; if (S.view === "course") render(); });
  }
  function refreshProgress() {
    return Promise.all([loadDone(), loadXp(), loadStreak(), refreshHearts()]).then(function (r) {
      S.done = r[0]; S.xp = r[1]; S.streak = r[2]; if (!P) render();
    }).catch(function () {});
  }

  // ---------------------------------------------------------------- lesson player
  function parseStep(s) {
    if (!s || typeof s !== "object") return null;
    var str = function (x) { return typeof x === "string" && x.trim().length > 0; };
    var photo = typeof s.photo === "string" && s.photo.indexOf(LESSON_IMG) === 0 ? s.photo : null;
    var img = photo || (IMG_KEYS.indexOf(s.img) >= 0 ? imgUrl(s.img) : typeof s.img === "string" && s.img.indexOf(LESSON_IMG) === 0 ? s.img : null);
    var c = s.credit;
    var credit = c && str(c.by) && str(c.license) && typeof c.src === "string" && c.src.indexOf("https://commons.wikimedia.org/") === 0 ? c : null;
    if (s.kind === "teach" && str(s.body)) return { kind: "teach", kicker: s.kicker, title: s.title, body: s.body, tip: s.tip, img: img, credit: credit };
    if (s.kind === "mcq" && str(s.q) && Array.isArray(s.opts) && s.opts.length >= 2 && Number.isInteger(s.a) && s.a >= 0 && s.a < s.opts.length)
      return { kind: "mcq", q: s.q, opts: s.opts.map(String), a: s.a, why: String(s.why || "") };
    if (s.kind === "multi" && str(s.q) && Array.isArray(s.opts) && Array.isArray(s.a) && s.a.length > 0 && s.a.every(function (i) { return Number.isInteger(i) && i >= 0 && i < s.opts.length; }))
      return { kind: "multi", q: s.q, opts: s.opts.map(String), a: s.a, why: String(s.why || "") };
    if (s.kind === "tf" && str(s.q) && typeof s.a === "boolean") return { kind: "tf", q: s.q, a: s.a, why: String(s.why || "") };
    if (s.kind === "match" && str(s.q) && Array.isArray(s.pairs) && s.pairs.length >= 2 && s.pairs.every(function (p) { return Array.isArray(p) && p.length === 2; }))
      return { kind: "match", q: s.q, pairs: s.pairs.map(function (p) { return [String(p[0]), String(p[1])]; }), why: String(s.why || "") };
    return null;
  }
  function normalizeSteps(lesson, topicLabel) {
    var out = (Array.isArray(lesson.steps) ? lesson.steps : []).map(parseStep).filter(Boolean);
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
  function buildPlay(core, bankRaw, seen, seed) {
    var r = rng(seed);
    var bank = (bankRaw || []).map(function (b, i) { return { key: "b" + i, card: Number.isInteger(b && b.t) ? b.t : -1, step: parseStep(b) }; })
      .filter(function (b) { return b.step && b.step.kind !== "teach"; });
    var used = new Set(), out = { steps: [], keys: [], card: [] }, teachIdx = -1;
    core.forEach(function (step, i) {
      if (step.kind === "teach") { teachIdx++; out.steps.push(step); out.keys.push("t" + teachIdx); out.card.push(teachIdx); return; }
      var pool = [{ key: "c" + i, step: step }].concat(bank.filter(function (b) { return b.card === teachIdx && !used.has(b.key); }));
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
    keys.filter(function (k) { return k[0] !== "t"; }).forEach(function (k) { s.add(k); });
    try { localStorage.setItem("lesson.seen.v1." + id, JSON.stringify(Array.from(s).slice(-200))); } catch (e) {}
  }
  function loadExtras(id) {
    return sb.from("lessons").select("id, bank, deep_notes, deeper").eq("id", id).limit(1).then(function (res) {
      var row = res.data && res.data[0];
      if (!row) return null;
      return localize("lesson_extra", [row]).then(function (r) { return r[0]; });
    }).catch(function () { return null; });
  }

  var P = null;   // the open player
  function openPlayer(lesson) {
    var topicLabel = (function () { var u = UNITS.find(function (x) { return x.topic === lesson.topic; }); return u ? t("lessonTopics." + u.key) : t("learn.title"); })();
    P = { lesson: lesson, topicLabel: topicLabel, extras: null, mode: "core", el: h("div", { class: "player", role: "dialog", "aria-modal": "true", "aria-label": lesson.title }) };
    document.body.appendChild(P.el);
    document.body.classList.add("noscroll");
    P.el.appendChild(h("div", { class: "pl-load" }, h("div", { class: "spin" })));
    refreshHearts();
    var timeout = new Promise(function (res) { setTimeout(function () { res(null); }, 2500); });
    Promise.race([loadExtras(lesson.id), timeout]).then(function (x) {
      if (!P || P.lesson !== lesson) return;
      P.extras = x || { bank: [], deep_notes: [], deeper: [] };
      startPlay("core");
    });
    document.addEventListener("keydown", onKey);
  }
  function closePlayer() {
    if (!P) return;
    P.el.remove(); P = null;
    document.body.classList.remove("noscroll");
    document.removeEventListener("keydown", onKey);
    refreshProgress().then(render);
  }
  function startPlay(mode) {
    var x = P.extras;
    P.mode = mode;
    var seed = Date.now();
    var deeper = (x.deeper || []).map(parseStep).filter(Boolean);
    P.deeperSteps = deeper;
    P.play = mode === "deeper" ? buildPlay(deeper, [], new Set(), seed) : buildPlay(normalizeSteps(P.lesson, P.topicLabel), x.bank || [], seenSet(P.lesson.id), seed);
    P.steps = P.play.steps;
    P.qCount = P.steps.filter(function (s) { return s.kind !== "teach"; }).length;
    P.queue = P.steps.map(function (_, i) { return i; });
    P.pos = 0; P.completed = 0; P.firstRight = 0; P.missed = []; P.combo = 0;
    P.phase = "play"; P.recorded = false; P.startedAt = Date.now(); P.secs = null;
    P.xpBefore = null; P.xpAfter = null; P.streak = null;
    loadXp().then(function (v) { if (P) P.xpBefore = v; });
    resetStep();
    drawPlayer();
  }
  function resetStep() { P.sel = null; P.multi = []; P.checked = null; P.matchL = null; P.matched = []; P.bad = null; P.matchMiss = false; P.openNote = false; P.animate = true; }
  function curIdx() { return P.queue[P.pos]; }
  function advance(requeue) {
    if (requeue != null) P.queue.push(requeue);
    resetStep();
    if (P.pos + 1 >= P.queue.length) finish(); else { P.pos++; drawPlayer(); }
  }
  function finish() {
    P.phase = "done";
    P.secs = Math.max(1, Math.round((Date.now() - P.startedAt) / 1000));
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
    if (step.kind === "teach" || step.kind === "match" || P.checked !== null) return;
    var ok = false;
    if (step.kind === "mcq") ok = P.sel === step.a;
    if (step.kind === "tf") ok = (P.sel === 0) === step.a;
    if (step.kind === "multi") ok = P.multi.length === step.a.length && step.a.every(function (i) { return P.multi.indexOf(i) >= 0; });
    var first = P.missed.indexOf(curIdx()) < 0;
    if (ok) { P.completed++; P.combo++; if (first) P.firstRight++; }
    else { P.combo = 0; if (first) P.missed.push(curIdx()); if (heartsInfo().limited) loseHeart().then(function () { if (P) drawPlayer(); }); }
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
      if (!P.matchMiss && heartsInfo().limited) loseHeart().then(function () { if (P) drawPlayer(); });
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
    if (e.key === "Enter") {
      // A focused button already answers Enter itself.
      if (tag === "BUTTON" || tag === "A") return;
      e.preventDefault();
      if (P.checked !== null && step.kind !== "teach") { var ok = P.checked; advance(ok ? null : curIdx()); }
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
    if (P.phase === "done") { el.appendChild(doneScreen()); return; }
    if (P.phase === "article") { el.appendChild(articleScreen()); return; }
    if (P.phase === "streak") { el.appendChild(streakScreen()); return; }
    var idx = curIdx(), step = P.steps[idx];
    var H = heartsInfo();
    var card = P.play.card[idx];
    var note = P.mode === "core" && card !== null && P.extras.deep_notes && typeof P.extras.deep_notes[card] === "string" ? P.extras.deep_notes[card] : null;
    var anim = P.animate ? " rv" : "";
    var d = 0; function dl() { d += 1; return "--d:" + d; }

    var top = h("div", { class: "pl-top" },
      h("button", { class: "pl-close", type: "button", "aria-label": t("learn.close"), onclick: closePlayer }, icon("x", 16)),
      h("div", { class: "pl-prog", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": P.steps.length, "aria-valuenow": P.completed },
        h("i", { style: "width:" + (P.steps.length ? Math.round(100 * P.completed / P.steps.length) : 0) + "%" })),
      P.combo >= 2 ? h("span", { class: "chip chip-flame on", "aria-label": t("learn.inARow", { count: P.combo }) }, icon("flame", 16), String(P.combo)) : null,
      heartsChip());

    var body = h("div", { class: "pl-body" });
    if (step.kind === "teach") {
      if (step.img) body.appendChild(h("figure", { class: "teach-img" + anim, style: dl() },
        h("img", { src: step.img, alt: "", loading: "eager" }),
        step.credit ? h("figcaption", null, h("a", { href: step.credit.src, target: "_blank", rel: "noopener" },
          t("learn.photoCredit", { by: step.credit.by, license: step.credit.license }))) : null));
      if (step.kicker) body.appendChild(h("p", { class: "kicker" + anim, style: dl(), text: step.kicker }));
      if (step.title) body.appendChild(h("h2", { class: "teach-t" + anim, style: dl(), text: step.title }));
      var b = rich(step.body, "teach-b" + anim); b.style.cssText = dl(); body.appendChild(b);
      if (step.tip) body.appendChild(h("div", { class: "tip" + anim, style: dl() }, icon("bulb", 20), h("p", null, inline(step.tip))));
      if (note) {
        body.appendChild(P.openNote
          ? h("div", { class: "nerd" }, h("p", { class: "nerd-k" }, icon("cap", 18), t("learn.nerdKicker")), rich(note))
          : h("button", { class: "nerd-pill" + anim, style: dl(), type: "button", onclick: function () { P.openNote = true; P.animate = false; drawPlayer(); } },
            icon("cap", 17), t("learn.nerdDeeper")));
      }
    } else {
      var kind = step.kind === "mcq" ? t("learn.pickOne") : step.kind === "multi" ? t("learn.pickAll") : step.kind === "tf" ? t("learn.trueOrFalse") : t("learn.findPairs");
      body.appendChild(h("p", { class: "kicker" + anim, style: dl(), text: kind }));
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
        : step.kind === "match" ? h("p", { class: "muted center", text: t("learn.matchHint") })
        : h("button", { class: "btn btn-primary btn-block", type: "button", disabled: !hasPick || P.checked !== null, onclick: check }, t("learn.check")),
      P.pos === 0 && P.mode === "core" ? h("p", { class: "keyhint", text: t("web.keyHint") }) : null);

    el.appendChild(h("div", { class: "pl-wrap" }, top, body, foot));

    if (P.checked !== null && step.kind !== "teach") {
      var ok = P.checked;
      var title = ok ? (P.combo >= 3 ? t("learn.inARow", { count: P.combo }) : step.kind === "match" && P.matchMiss ? t("learn.foundAll") : t("learn.nice")) : t("learn.notQuite");
      var answer = step.kind === "mcq" ? step.opts[step.a] : step.kind === "tf" ? t(step.a ? "learn.true" : "learn.false")
        : step.kind === "multi" ? step.a.map(function (i) { return step.opts[i]; }).join(", ") : "";
      var go = h("button", { class: "btn btn-block " + (ok ? "btn-ok" : "btn-no"), type: "button", onclick: function () { advance(ok ? null : idx); } }, t("learn.continue"));
      el.appendChild(h("div", { class: "sheet " + (ok ? "ok" : "no"), role: "status", "aria-live": "assertive" },
        h("div", { class: "sheet-in" },
          h("p", { class: "sheet-t" }, icon(ok ? "check" : "x", 20), title),
          !ok && answer ? h("p", { class: "sheet-a", text: t("learn.rightAnswer", { answer: answer }) }) : null,
          step.why ? h("p", { class: "sheet-w", text: step.why }) : null,
          !ok ? h("p", { class: "sheet-l" }, icon("redo", 14), t("learn.againLater")) : null,
          go)));
      setTimeout(function () { go.focus(); }, 30);
    }
    if (H.out && P.checked !== false) el.appendChild(outOfHearts(H));
    P.animate = false;
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
    var outcomes = Array.isArray(P.lesson.outcomes) ? P.lesson.outcomes.filter(function (o) { return typeof o === "string"; }) : [];
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
        P.mode === "core" && outcomes.length ? h("div", { class: "outcomes" }, h("h3", { text: t("learn.nowYouCan") }),
          h("ul", null, outcomes.map(function (o) { return h("li", null, icon("check", 16), h("span", { text: o })); }))) : null),
      h("div", { class: "pl-foot" },
        P.mode === "core" && P.deeperSteps.length ? h("div", { class: "nerd-offer" },
          h("div", null, h("b", { text: t("learn.nerdOfferTitle") }), h("span", { text: t("learn.nerdOfferBody") })),
          h("button", { class: "btn btn-ghost btn-sm", type: "button", onclick: function () { startPlay("deeper"); } }, icon("cap", 16), t("learn.nerdDeeper"))) : null,
        h("button", { class: "btn btn-primary btn-block", type: "button", onclick: function () {
          if (P.mode === "core" && P.streak && P.streak.current > 0 && P.xpBefore === 0) { P.phase = "streak"; drawPlayer(); } else closePlayer();
        } }, t("learn.continue")),
        h("div", { class: "row2" },
          P.mode === "core" && P.qCount > 0 ? h("button", { class: "btn btn-ghost", type: "button", onclick: function () { P.phase = "article"; drawPlayer(); } }, t("learn.readArticle")) : null,
          h("button", { class: "btn btn-ghost", type: "button", onclick: function () { startPlay(P.mode); } }, P.mode === "core" ? t("learn.againNew") : t("learn.again")))));
  }
  function articleScreen() {
    return h("div", { class: "pl-wrap" },
      h("div", { class: "pl-top" }, h("button", { class: "linkbtn", type: "button", onclick: function () { P.phase = "done"; drawPlayer(); } }, icon("back", 16), t("learn.result"))),
      h("div", { class: "pl-body article" }, h("h2", { text: P.lesson.title }),
        P.lesson.summary ? h("p", { class: "lede", text: P.lesson.summary }) : null, rich(P.lesson.body)));
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
  function afterSignIn() {
    var uid = S.session.user.id;
    sb.from("profiles").select("id, display_name, experience_level, language, wine_countries, daily_goal_min").eq("id", uid).maybeSingle()
      .then(function (res) {
        S.profile = res.data || { id: uid };
        var saved = null; try { saved = localStorage.getItem("wl-course-lang"); } catch (e) {}
        if (!saved && S.profile.language && STR[S.profile.language]) S.lang = S.profile.language;
        if (!S.profile.experience_level) { S.view = "onboarding"; render(); return; }
        S.view = "course"; render(); loadCourse();
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
      if (!session) { if (P) closePlayer(); S.profile = null; S.lessons = null; S.view = "auth"; render(); return; }
      if (recovering) { S.view = "recovery"; render(); return; }
      if (had !== session.user.id) afterSignIn();
    }, 0);
  });
  sb.auth.getSession().then(function (res) {
    var session = res.data && res.data.session;
    if (!session && S.view === "loading") { S.view = "auth"; render(); }
  });
  if (location.hash && /access_token|error_description/.test(location.hash)) {
    // The tokens are read by Supabase; keep them out of the address bar and history.
    setTimeout(function () { history.replaceState(null, "", location.pathname + location.search); }, 800);
  }
})();

/* Winelingo wine tests — shared player.
   Each test page inlines its questions (all languages) as JSON in #quiz-data.
   Language: ?lang=xx, else the visitor's saved choice, else the browser language. */
(function () {
  var UI = {
    en: { hubH: "Wine Quizzes and Sommelier Practice Tests", hubP: "Free tests with an explanation after every answer: practice for WSET and sommelier exams, training for restaurant staff, and wine knowledge for everyone.",
      "exam-prep-eb": "Exam prep", "exam-prep-h": "Prepare for a wine qualification", "exam-prep-p": "Unofficial practice in the style of the WSET and Court of Master Sommeliers exams, with an explanation for every answer. Take a mock against the clock, or learn as you go.",
      "restaurant-staff-eb": "For restaurant staff", "restaurant-staff-h": "Train for the floor", "restaurant-staff-p": "Serving, guest questions, wine lists and faults: what a shift actually asks of you.",
      "wine-knowledge-eb": "Wine knowledge", "wine-knowledge-h": "Know your wine", "wine-knowledge-p": "Grapes, food pairing and sparkling wine, ten questions at a time.",
      disclaimer: "Unofficial practice questions written by Winelingo. Not affiliated with or endorsed by WSET or the Court of Master Sommeliers.",
      real: "Real exam", start: "Start", mock: "Full mock exam", practice: "Practice", best: "Best", min: "min", pass: "pass",
      exModeT: "Exam mode", exModeP: "Against the clock, like the real thing. You see your answers and the explanations at the end.",
      prModeT: "Practice mode", prModeP: "No clock. See the answer and why after every question.",
      timeLeft: "left", back: "Back", finish: "Finish exam", timeUp: "Time is up.",
      passed: "Pass mark reached.", failed: "Below the pass mark.", passOf: "Pass mark: ", byTopic: "By topic", review: "Review your answers",
      yours: "Your answer: ", noAnswer: "No answer", correctIs: "Correct: ", allRight: "Every answer right. Nothing to review.",
      q: "Question", next: "Next question", result: "See result", right: "Correct", wrong: "Not quite. The answer is ",
      deeper: "Go deeper", again: "Take the test again", all: "All tests", score: "Your score",
      m3: "Excellent. You could run the floor tonight.", m2: "Solid. One more round and it sticks.", m1: "Good start. Read the explanations and try again.",
      appT: "Keep learning in the app", appP: "Scan any label, take short lessons and build your palate. Free to download on the App Store.", appB: "Download Winelingo",
      bizT: "For restaurants", bizP: "We build tests on your own wine list, so new staff learn exactly the wines you pour. Write to ",
      lvl: ["", "Beginner", "Confident", "Advanced"], qs: "questions" },
    da: { hubH: "Vinquiz og øvetests til sommelier- og WSET-eksamener", hubP: "Gratis tests med en forklaring efter hvert svar: øv dig til WSET- og sommeliereksamener, træn som restaurantpersonale, eller test din vinviden.",
      "exam-prep-eb": "Eksamensforberedelse", "exam-prep-h": "Forbered dig til en vinuddannelse", "exam-prep-p": "Uofficielle øvespørgsmål i stil med WSET- og Court of Master Sommeliers-eksamenerne, med en forklaring til hvert svar. Tag en prøveeksamen på tid, eller lær undervejs.",
      "restaurant-staff-eb": "Til restaurantpersonale", "restaurant-staff-h": "Træn til gulvet", "restaurant-staff-p": "Servering, gæsternes spørgsmål, vinkort og vinfejl: det en vagt faktisk kræver af dig.",
      "wine-knowledge-eb": "Vinviden", "wine-knowledge-h": "Kend din vin", "wine-knowledge-p": "Druer, mad og vin og mousserende vin, ti spørgsmål ad gangen.",
      disclaimer: "Uofficielle øvespørgsmål skrevet af Winelingo. Ikke tilknyttet eller godkendt af WSET eller Court of Master Sommeliers.",
      real: "Rigtig eksamen", start: "Start", mock: "Fuld prøveeksamen", practice: "Øvelse", best: "Bedst", min: "min", pass: "bestået ved",
      exModeT: "Eksamenstilstand", exModeP: "På tid, som den rigtige eksamen. Du ser dine svar og forklaringerne til sidst.",
      prModeT: "Øvetilstand", prModeP: "Uden ur. Se svaret og forklaringen efter hvert spørgsmål.",
      timeLeft: "tilbage", back: "Tilbage", finish: "Afslut eksamen", timeUp: "Tiden er gået.",
      passed: "Bestået.", failed: "Under beståelsesgrænsen.", passOf: "Beståelsesgrænse: ", byTopic: "Pr. emne", review: "Gennemgå dine svar",
      yours: "Dit svar: ", noAnswer: "Intet svar", correctIs: "Rigtigt svar: ", allRight: "Alle svar rigtige. Intet at gennemgå.",
      q: "Spørgsmål", next: "Næste spørgsmål", result: "Se resultat", right: "Rigtigt", wrong: "Ikke helt. Svaret er ",
      deeper: "Nørd dybere", again: "Tag testen igen", all: "Alle tests", score: "Din score",
      m3: "Flot. Du kan tage gulvet i aften.", m2: "Godt fundament. En runde mere, så sidder det.", m1: "God start. Læs forklaringerne og prøv igen.",
      appT: "Lær videre i appen", appP: "Scan en etiket, tag korte lektioner og byg din smag. Gratis at hente i App Store.", appB: "Hent Winelingo",
      bizT: "Til restauranter", bizP: "Vi bygger tests på jeres eget vinkort, så nyt personale lærer præcis de vine, I skænker. Skriv til ",
      lvl: ["", "Begynder", "Øvet", "Ekspert"], qs: "spørgsmål" },
    de: { hubH: "Weinquiz und Übungstests für WSET und Sommelier", hubP: "Kostenlose Tests mit einer Erklärung nach jeder Antwort: Übung für WSET- und Sommelierprüfungen, Training für Servicekräfte und Weinwissen für alle.",
      "exam-prep-eb": "Prüfungsvorbereitung", "exam-prep-h": "Bereite dich auf eine Weinqualifikation vor", "exam-prep-p": "Inoffizielle Übungsfragen im Stil der Prüfungen von WSET und dem Court of Master Sommeliers, mit einer Erklärung zu jeder Antwort.",
      "restaurant-staff-eb": "Für Servicekräfte", "restaurant-staff-h": "Fit für den Service", "restaurant-staff-p": "Servieren, Gästefragen, Weinkarten und Weinfehler: was eine Schicht wirklich verlangt.",
      "wine-knowledge-eb": "Weinwissen", "wine-knowledge-h": "Kenne deinen Wein", "wine-knowledge-p": "Rebsorten, Speisen und Wein, Schaumwein: jeweils zehn Fragen.",
      disclaimer: "Inoffizielle Übungsfragen von Winelingo. Nicht mit WSET oder dem Court of Master Sommeliers verbunden oder von ihnen anerkannt.",
      real: "Echte Prüfung", start: "Starten", mock: "Volle Probeprüfung", practice: "Übung", best: "Bestwert", min: "Min.", pass: "bestanden ab",
      q: "Frage", next: "Nächste Frage", result: "Ergebnis ansehen", right: "Richtig", wrong: "Nicht ganz. Die Antwort ist ",
      deeper: "Tiefer eintauchen", again: "Test wiederholen", all: "Alle Tests", score: "Dein Ergebnis",
      m3: "Ausgezeichnet. Du bist bereit für den Service.", m2: "Solide. Noch eine Runde, dann sitzt es.", m1: "Guter Anfang. Lies die Erklärungen und versuch es noch einmal.",
      appT: "Lerne weiter in der App", appP: "Scanne jedes Etikett, mache kurze Lektionen und entwickle deinen Gaumen. Kostenlos im App Store.", appB: "Winelingo laden",
      bizT: "Für Restaurants", bizP: "Wir erstellen Tests zu eurer eigenen Weinkarte, damit neue Mitarbeitende genau eure Weine kennenlernen. Schreibt an ",
      lvl: ["", "Einsteiger", "Fortgeschritten", "Profi"], qs: "Fragen" },
    es: { hubH: "Quiz de vino y tests de práctica para WSET y sumiller", hubP: "Tests gratuitos con una explicación tras cada respuesta: práctica para exámenes de WSET y de sumiller, formación para el personal de sala y cultura del vino para todos.",
      "exam-prep-eb": "Preparación de exámenes", "exam-prep-h": "Prepárate para una titulación de vino", "exam-prep-p": "Preguntas de práctica no oficiales al estilo de los exámenes de WSET y de la Court of Master Sommeliers, con una explicación para cada respuesta.",
      "restaurant-staff-eb": "Para el personal de sala", "restaurant-staff-h": "Entrena para el servicio", "restaurant-staff-p": "Servicio, preguntas de los clientes, cartas de vinos y defectos: lo que de verdad exige un turno.",
      "wine-knowledge-eb": "Conocimiento del vino", "wine-knowledge-h": "Conoce tu vino", "wine-knowledge-p": "Uvas, maridaje y vinos espumosos, de diez en diez.",
      disclaimer: "Preguntas de práctica no oficiales escritas por Winelingo. Sin relación con WSET ni con la Court of Master Sommeliers, ni avaladas por ellas.",
      real: "Examen real", start: "Empezar", mock: "Simulacro completo", practice: "Práctica", best: "Mejor", min: "min", pass: "aprobado con",
      q: "Pregunta", next: "Siguiente pregunta", result: "Ver resultado", right: "Correcto", wrong: "Casi. La respuesta es ",
      deeper: "Profundiza", again: "Repetir el test", all: "Todos los tests", score: "Tu puntuación",
      m3: "Excelente. Estás listo para la sala.", m2: "Buena base. Una ronda más y lo tendrás.", m1: "Buen comienzo. Lee las explicaciones y vuelve a intentarlo.",
      appT: "Sigue aprendiendo en la app", appP: "Escanea cualquier etiqueta, haz lecciones cortas y entrena tu paladar. Gratis en la App Store.", appB: "Descargar Winelingo",
      bizT: "Para restaurantes", bizP: "Creamos tests sobre vuestra propia carta de vinos, para que el nuevo personal aprenda exactamente los vinos que servís. Escribid a ",
      lvl: ["", "Principiante", "Intermedio", "Avanzado"], qs: "preguntas" }
  };
  var LANGS = ["en", "da", "de", "es"];
  var NAMES = { en: "English", da: "Dansk", de: "Deutsch", es: "Español" };
  var CONTACT = "jonsegeskov29@gmail.com";
  var APP = "https://apps.apple.com/app/id6785896824";

  function pickLang(available) {
    var q = new URLSearchParams(location.search).get("lang");
    if (q && available.indexOf(q) >= 0) return q;
    try { var s = localStorage.getItem("wl-lang"); if (s && available.indexOf(s) >= 0) return s; } catch (e) {}
    var n = (navigator.language || "en").slice(0, 2).toLowerCase();
    return available.indexOf(n) >= 0 ? n : "en";
  }
  function saveLang(l) { try { localStorage.setItem("wl-lang", l); } catch (e) {} }
  function tr(lang, k) { return (UI[lang] && UI[lang][k]) || UI.en[k]; }
  // Best result per test, kept in this browser only, so the hub can show "Best 8/10".
  function best(slug) { try { return JSON.parse(localStorage.getItem("wl-best:" + slug)); } catch (e) { return null; } }
  function saveBest(slug, s, n) {
    try { var b = best(slug); if (!b || s / n > b.s / b.n) localStorage.setItem("wl-best:" + slug, JSON.stringify({ s: s, n: n })); } catch (e) {}
  }
  function minutes(n) { return Math.max(3, Math.round(n * 0.4)); }

  function el(tag, props, kids) {
    var n = document.createElement(tag);
    if (props) for (var k in props) {
      if (k === "cls") n.className = props[k];
      else if (k === "text") n.textContent = props[k];
      else if (props[k] != null) n.setAttribute(k, props[k]);
    }
    (kids || []).forEach(function (c) { if (c != null) n.append(c); });
    return n;
  }

  function langBar(available, current, onPick) {
    var bar = el("div", { cls: "qz-langs", role: "group", "aria-label": "Language" });
    LANGS.filter(function (l) { return available.indexOf(l) >= 0; }).forEach(function (l) {
      var b = el("button", { cls: "qz-lang", type: "button", "aria-pressed": String(l === current), text: NAMES[l] });
      b.addEventListener("click", function () { onPick(l); });
      bar.append(b);
    });
    return bar;
  }

  /* ---------- Hub page ----------
     The page ships every card as HTML in English (build-tests.mjs); this swaps the words for the
     visitor's language, points the links at that language and adds their best scores. */
  function hub(root, data) {
    var available = LANGS.filter(function (l) { return data.tests.some(function (t) { return t[l]; }); });
    var lang = pickLang(available), bySlug = {};
    data.tests.forEach(function (t) { bySlug[t.slug] = t; });
    var langSlot = document.querySelector("[data-qz-langs]") || root;
    function draw() {
      document.documentElement.lang = lang;
      var h1 = document.querySelector("[data-qz-title]"); if (h1) h1.textContent = tr(lang, "hubH");
      var dk = document.querySelector("[data-qz-summary]"); if (dk) dk.textContent = tr(lang, "hubP");
      document.querySelectorAll("[data-i18n]").forEach(function (n) { var v = tr(lang, n.getAttribute("data-i18n")); if (v) n.textContent = v; });
      root.querySelectorAll("[data-slug]").forEach(function (a) {
        var t = bySlug[a.getAttribute("data-slug")]; if (!t) return;
        var c = t[lang] || t.en, u = function (k) { return tr(lang, k); };
        a.href = "/tests/" + t.slug + "/" + (lang === "en" ? "" : "?lang=" + lang);
        var f = function (k) { return a.querySelector('[data-f="' + k + '"]'); };
        if (f("title")) f("title").textContent = c.title;
        if (f("summary")) f("summary").textContent = c.summary;
        if (f("meta")) f("meta").textContent = t.n + " " + u("qs") + " · " + minutes(t.n) + " " + u("min");
        if (f("kind")) f("kind").textContent = (t.n >= 40 ? u("mock") : u("practice")) + " · " + t.n + " " + u("qs");
        if (f("real") && t.exam) f("real").textContent = [t.exam.questions + " " + u("qs"), t.exam.minutes ? t.exam.minutes + " " + u("min") : "", t.exam.pass ? u("pass") + " " + t.exam.pass + "%" : ""].filter(Boolean).join(" · ");
        var b = best(t.slug), bn = f("best");
        if (bn) { bn.hidden = !b; if (b) bn.textContent = u("best") + " " + b.s + "/" + b.n; }
      });
      langSlot.replaceChildren(langBar(available, lang, function (l) { lang = l; saveLang(l); draw(); }));
    }
    draw();
  }

  /* ---------- Test page ----------
     Practice: answer, see why, next. A test with an `exam` block (a practice exam) first asks
     how to take it: exam mode runs against the clock and shows everything at the end, with the
     score against the real pass mark and a breakdown by topic. */
  function play(root, data) {
    var available = LANGS.filter(function (l) { return data[l]; });
    var lang = pickLang(available), i = 0, score = 0, mode = data.exam ? null : "practice";
    var picks = [], log = [], timer = 0, deadline = 0;
    var head = el("div", { cls: "qz-head" });
    var prog = el("div", { cls: "qz-progress" });
    var card = el("section", { cls: "qz-card-play", "aria-live": "polite" });
    root.replaceChildren(head, prog, card);

    function T() { return data[lang]; }
    function u(k) { return tr(lang, k); }
    function drawHead() {
      document.documentElement.lang = lang;
      head.replaceChildren(
        langBar(available, lang, function (l) { lang = l; saveLang(l); drawHead(); if (card.dataset.state === "done") done(); else if (mode) render(); else intro(); }),
        el("span", { cls: "qz-level", text: data.exam ? data.exam.body + " · " + data.exam.name : u("lvl")[data.level] })
      );
      var h1 = document.querySelector("[data-qz-title]"); if (h1) h1.textContent = T().title;
      var dk = document.querySelector("[data-qz-summary]"); if (dk) dk.textContent = T().summary;
    }
    function clock() {
      var left = Math.max(0, Math.round((deadline - Date.now()) / 1000));
      return Math.floor(left / 60) + ":" + String(left % 60).padStart(2, "0") + " " + u("timeLeft");
    }
    function drawProg() {
      var n = T().questions.length;
      var fill = el("div", { cls: "qz-fill" }); fill.style.width = (Math.min(i, n) / n * 100) + "%";
      var kids = [el("span", { text: u("q") + " " + Math.min(i + 1, n) + " / " + n }), el("div", { cls: "qz-track" }, [fill])];
      if (mode === "exam" && card.dataset.state !== "done") kids.push(el("span", { cls: "qz-clock", text: clock() }));
      prog.replaceChildren.apply(prog, kids);
    }

    // A practice exam starts by choosing how to take it.
    function intro() {
      card.dataset.state = "intro";
      prog.replaceChildren();
      var n = T().questions.length, e = data.exam;
      var choice = function (m, t, p) {
        var b = el("button", { cls: "qz-mode", type: "button" }, [el("strong", { text: t }), el("span", { text: p })]);
        b.addEventListener("click", function () { begin(m); });
        return b;
      };
      var facts = [n + " " + u("qs"), mode === null ? "≈ " + pace(n) + " " + u("min") : ""];
      card.replaceChildren(
        el("span", { cls: "qz-level", text: (n >= 40 ? u("mock") : u("practice")) + " · " + facts.filter(Boolean).join(" · ") }),
        e.questions ? el("p", { cls: "qz-real", text: u("real") + ": " + [e.questions + " " + u("qs"), e.minutes ? e.minutes + " " + u("min") : "", e.pass ? u("pass") + " " + e.pass + "%" : ""].filter(Boolean).join(" · ") }) : null,
        el("div", { cls: "qz-modes" }, [choice("exam", u("exModeT"), u("exModeP")), choice("practice", u("prModeT"), u("prModeP"))])
      );
    }
    // Exam-mode time: the real exam's pace per question when it is known, else 72 s (WSET Level 2's).
    function pace(n) {
      var e = data.exam || {}, per = e.minutes && e.questions && e.minutes / e.questions <= 2 ? e.minutes * 60 / e.questions : 72;
      return Math.round(n * per / 60);
    }
    function begin(m) {
      mode = m; i = 0; score = 0; picks = []; log = [];
      clearInterval(timer);
      if (m === "exam") {
        deadline = Date.now() + pace(T().questions.length) * 60000;
        timer = setInterval(function () { if (Date.now() >= deadline) { clearInterval(timer); finish(true); } else if (card.dataset.state === "q") drawProg(); }, 1000);
      }
      render();
    }

    function render() {
      card.dataset.state = "q";
      var x = T().questions[i];
      drawProg();
      var opts = el("div", { cls: "qz-opts" }, x.opts.map(function (o, n) {
        var b = el("button", { cls: "qz-opt" + (mode === "exam" && picks[i] === n ? " sel" : ""), type: "button", id: "qz-" + i + "-" + n, "aria-pressed": mode === "exam" ? String(picks[i] === n) : null }, [el("span", { cls: "k", text: "ABCD"[n] }), el("span", { text: o })]);
        if (mode !== "exam") b.removeAttribute("aria-pressed");
        b.addEventListener("click", function () { if (mode === "exam") choose(n, opts); else pick(n, opts); });
        return b;
      }));
      var kids = [x.topic ? el("span", { cls: "qz-topic", text: x.topic }) : null, el("h2", { cls: "qz-q", text: x.q }), opts];
      if (mode === "exam") kids.push(examNav());
      card.replaceChildren.apply(card, kids.filter(Boolean));
    }
    // Exam mode: a choice can change until you move on; nothing is marked until the end.
    function examNav() {
      var last = i === T().questions.length - 1;
      var back = el("button", { cls: "btn btn-ghost", type: "button", text: u("back") });
      back.disabled = i === 0;
      back.addEventListener("click", function () { i--; render(); });
      var next = el("button", { cls: "btn btn-primary qz-next", type: "button", text: last ? u("finish") : u("next") });
      next.disabled = picks[i] == null;
      next.addEventListener("click", function () { if (last) finish(false); else { i++; render(); card.scrollIntoView({ block: "start", behavior: "smooth" }); } });
      return el("div", { cls: "qz-row qz-examnav" }, [back, next]);
    }
    function choose(n, opts) {
      picks[i] = n;
      Array.prototype.forEach.call(opts.children, function (b, m) { b.classList.toggle("sel", m === n); b.setAttribute("aria-pressed", String(m === n)); });
      card.querySelector(".qz-next").disabled = false;
    }
    function finish(timeUp) {
      clearInterval(timer);
      score = 0; log = [];
      T().questions.forEach(function (x, k) { var ok = picks[k] === x.a; if (ok) score++; log.push({ ok: ok, topic: x.topic }); });
      done(timeUp);
    }

    function pick(n, opts) {
      var x = T().questions[i], ok = n === x.a, last = i === T().questions.length - 1;
      if (ok) score++;
      log[i] = { ok: ok, topic: x.topic };
      Array.prototype.forEach.call(opts.children, function (b, m) {
        b.disabled = true; b.classList.add(m === x.a ? "right" : m === n ? "wrong" : "dim");
      });
      var next = el("button", { cls: "btn btn-primary qz-next", type: "button", text: last ? u("result") : u("next") });
      next.addEventListener("click", function () {
        if (last) done(); else { i++; render(); card.scrollIntoView({ block: "start", behavior: "smooth" }); }
      });
      card.append(el("div", { cls: "qz-answer" }, [
        el("span", { cls: "qz-verdict " + (ok ? "ok" : "no"), text: ok ? u("right") : u("wrong") + "ABCD"[x.a] }),
        el("p", { text: x.why }),
        x.deeper ? el("details", null, [el("summary", { text: u("deeper") }), el("p", { text: x.deeper })]) : null,
        next
      ]));
      next.focus({ preventScroll: true });
    }

    // Topic breakdown, weakest first. "Grapes: Riesling" and "Grapes: Merlot" count as "Grapes".
    function topics() {
      var m = {}, order = [];
      log.forEach(function (r) {
        if (!r || !r.topic) return;
        var k = r.topic.split(":")[0];
        if (!m[k]) { m[k] = { ok: 0, n: 0 }; order.push(k); }
        m[k].n++; if (r.ok) m[k].ok++;
      });
      if (order.length < 2) return null;
      // Weakest first, and only the eight weakest: past that it stops being a study list.
      order.sort(function (a, b) { return m[a].ok / m[a].n - m[b].ok / m[b].n || m[b].n - m[a].n; });
      return el("div", { cls: "qz-topics" }, [el("h3", { text: u("byTopic") })].concat(order.slice(0, 8).map(function (t) {
        var bar = el("span", { cls: "qz-tbar" }, [el("i")]); bar.firstChild.style.width = (m[t].ok / m[t].n * 100) + "%";
        return el("div", { cls: "qz-trow" }, [el("span", { text: t }), bar, el("b", { text: m[t].ok + "/" + m[t].n })]);
      })));
    }
    function review() {
      var wrong = T().questions.map(function (x, k) { return { x: x, k: k }; }).filter(function (r) { return picks[r.k] !== r.x.a; });
      if (!wrong.length) return el("p", { cls: "qz-real", text: u("allRight") });
      return el("details", { cls: "qz-review" }, [el("summary", { text: u("review") + " (" + wrong.length + ")" })].concat(wrong.map(function (r) {
        var x = r.x, p = picks[r.k];
        return el("div", { cls: "qz-rv" }, [
          el("p", { cls: "qz-rv-q", text: (r.k + 1) + ". " + x.q }),
          el("p", { cls: "qz-rv-no", text: u("yours") + (p == null ? u("noAnswer") : "ABCD"[p] + ". " + x.opts[p]) }),
          el("p", { cls: "qz-rv-ok", text: u("correctIs") + "ABCD"[x.a] + ". " + x.opts[x.a] }),
          el("p", { text: x.why })
        ]);
      })));
    }

    function done(timeUp) {
      card.dataset.state = "done";
      var n = T().questions.length, pct = Math.round(score / n * 100), e = data.exam;
      i = n; drawProg();
      saveBest(data.slug, score, n);
      if (window.umami) try { umami.track("test-complete", { test: data.slug, score: score, lang: lang, mode: mode }); } catch (err) {}
      var msg = e && e.pass ? (pct >= e.pass ? u("passed") : u("failed")) + " " + u("passOf") + e.pass + "%."
        : score / n >= 0.9 ? u("m3") : score / n >= 0.6 ? u("m2") : u("m1");
      var again = el("button", { cls: "btn btn-ghost", type: "button", text: u("again") });
      again.addEventListener("click", function () { if (data.exam) { mode = null; intro(); } else { i = 0; score = 0; log = []; render(); } });
      var mail = el("span", { cls: "qz-mail", text: CONTACT });
      card.replaceChildren.apply(card, [
        timeUp ? el("p", { cls: "qz-real", text: u("timeUp") }) : null,
        el("span", { cls: "qz-level", text: u("score") }),
        el("div", { cls: "qz-score" + (e && e.pass ? (pct >= e.pass ? " is-pass" : " is-fail") : "") }, e ? [pct + "%", el("small", { text: " " + score + "/" + n })] : [String(score), el("small", { text: " / " + n })]),
        el("p", { text: msg }),
        topics(),
        mode === "exam" ? review() : null,
        el("div", { cls: "qz-row" }, [again, el("a", { cls: "btn btn-ghost", href: "/tests/" + (lang === "en" ? "" : "?lang=" + lang), text: u("all") })]),
        el("div", { cls: "qz-cta" }, [el("h3", { text: u("appT") }), el("p", { text: u("appP") }), el("a", { cls: "btn btn-primary", href: APP, text: u("appB") })]),
        el("div", { cls: "qz-biz" }, [el("h3", { text: u("bizT") }), el("p", null, [u("bizP"), mail, "."])])
      ].filter(Boolean));
    }
    drawHead();
    if (mode) render(); else intro();
  }

  var node = document.getElementById("quiz-data");
  var root = document.getElementById("quiz");
  if (!node || !root) return;
  var data = JSON.parse(node.textContent);
  if (data.tests) hub(root, data); else play(root, data);
})();

/* Winelingo wine tests — shared player.
   Each test page inlines its questions (all languages) as JSON in #quiz-data.
   Language: ?lang=xx, else the visitor's saved choice, else the browser language. */
(function () {
  var UI = {
    en: { hubH: "Test what you know about wine", hubP: "Ten questions each, with a short explanation after every answer. Made for restaurant staff and anyone who wants to learn wine.", q: "Question", next: "Next question", result: "See result", right: "Correct", wrong: "Not quite. The answer is ",
      deeper: "Go deeper", again: "Take the test again", all: "All tests", score: "Your score",
      m3: "Excellent. You could run the floor tonight.", m2: "Solid. One more round and it sticks.", m1: "Good start. Read the explanations and try again.",
      appT: "Keep learning in the app", appP: "Scan any label, take short lessons and build your palate. Free to download on the App Store.", appB: "Download Winelingo",
      bizT: "For restaurants", bizP: "We build tests on your own wine list, so new staff learn exactly the wines you pour. Write to ",
      lvl: ["", "Beginner", "Confident", "Advanced"], qs: "questions" },
    da: { hubH: "Test din viden om vin", hubP: "Ti spørgsmål i hver, med en kort forklaring efter hvert svar. Lavet til restaurantpersonale og alle, der vil lære om vin.", q: "Spørgsmål", next: "Næste spørgsmål", result: "Se resultat", right: "Rigtigt", wrong: "Ikke helt. Svaret er ",
      deeper: "Nørd dybere", again: "Tag testen igen", all: "Alle tests", score: "Din score",
      m3: "Flot. Du kan tage gulvet i aften.", m2: "Godt fundament. En runde mere, så sidder det.", m1: "God start. Læs forklaringerne og prøv igen.",
      appT: "Lær videre i appen", appP: "Scan en etiket, tag korte lektioner og byg din smag. Gratis at hente i App Store.", appB: "Hent Winelingo",
      bizT: "Til restauranter", bizP: "Vi bygger tests på jeres eget vinkort, så nyt personale lærer præcis de vine, I skænker. Skriv til ",
      lvl: ["", "Begynder", "Øvet", "Ekspert"], qs: "spørgsmål" },
    de: { hubH: "Teste dein Weinwissen", hubP: "Je zehn Fragen, mit einer kurzen Erklärung nach jeder Antwort. Für Servicekräfte und alle, die Wein kennenlernen wollen.", q: "Frage", next: "Nächste Frage", result: "Ergebnis ansehen", right: "Richtig", wrong: "Nicht ganz. Die Antwort ist ",
      deeper: "Tiefer eintauchen", again: "Test wiederholen", all: "Alle Tests", score: "Dein Ergebnis",
      m3: "Ausgezeichnet. Du bist bereit für den Service.", m2: "Solide. Noch eine Runde, dann sitzt es.", m1: "Guter Anfang. Lies die Erklärungen und versuch es noch einmal.",
      appT: "Lerne weiter in der App", appP: "Scanne jedes Etikett, mache kurze Lektionen und entwickle deinen Gaumen. Kostenlos im App Store.", appB: "Winelingo laden",
      bizT: "Für Restaurants", bizP: "Wir erstellen Tests zu eurer eigenen Weinkarte, damit neue Mitarbeitende genau eure Weine kennenlernen. Schreibt an ",
      lvl: ["", "Einsteiger", "Fortgeschritten", "Profi"], qs: "Fragen" },
    es: { hubH: "Pon a prueba lo que sabes de vino", hubP: "Diez preguntas cada uno, con una breve explicación tras cada respuesta. Para el personal de sala y para cualquiera que quiera aprender de vino.", q: "Pregunta", next: "Siguiente pregunta", result: "Ver resultado", right: "Correcto", wrong: "Casi. La respuesta es ",
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

  function el(tag, props, kids) {
    var n = document.createElement(tag);
    if (props) for (var k in props) {
      if (k === "cls") n.className = props[k];
      else if (k === "text") n.textContent = props[k];
      else n.setAttribute(k, props[k]);
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

  /* ---------- Hub page ---------- */
  function hub(root, data) {
    var available = LANGS.filter(function (l) { return data.tests.some(function (t) { return t[l]; }); });
    var lang = pickLang(available);
    function draw() {
      var u = UI[lang];
      document.documentElement.lang = lang;
      var h1 = document.querySelector("[data-qz-title]"); if (h1) h1.textContent = u.hubH;
      var dk = document.querySelector("[data-qz-summary]"); if (dk) dk.textContent = u.hubP;
      var grid = el("div", { cls: "qz-hub" }, data.tests.map(function (t) {
        var c = t[lang] || t.en;
        return el("a", { cls: "qz-card", href: "/tests/" + t.slug + "/?lang=" + lang }, [
          el("span", { cls: "qz-level", text: u.lvl[t.level] + " · 10 " + u.qs }),
          el("h3", { text: c.title }),
          el("p", { text: c.summary })
        ]);
      }));
      root.replaceChildren(langBar(available, lang, function (l) { lang = l; saveLang(l); draw(); }), grid);
    }
    draw();
  }

  /* ---------- Test page ---------- */
  function play(root, data) {
    var available = LANGS.filter(function (l) { return data[l]; });
    var lang = pickLang(available), i = 0, score = 0;
    var head = el("div", { cls: "qz-head" });
    var prog = el("div", { cls: "qz-progress" });
    var card = el("section", { cls: "qz-card-play", "aria-live": "polite" });
    root.replaceChildren(head, prog, card);

    function T() { return data[lang]; }
    function drawHead() {
      document.documentElement.lang = lang;
      head.replaceChildren(
        langBar(available, lang, function (l) { lang = l; saveLang(l); drawHead(); if (card.dataset.state === "done") done(); else render(); }),
        el("span", { cls: "qz-level", text: UI[lang].lvl[data.level] })
      );
      var h1 = document.querySelector("[data-qz-title]"); if (h1) h1.textContent = T().title;
      var dk = document.querySelector("[data-qz-summary]"); if (dk) dk.textContent = T().summary;
    }
    function drawProg() {
      var n = T().questions.length;
      var fill = el("div", { cls: "qz-fill" }); fill.style.width = (Math.min(i, n) / n * 100) + "%";
      prog.replaceChildren(el("span", { text: UI[lang].q + " " + Math.min(i + 1, n) + " / " + n }), el("div", { cls: "qz-track" }, [fill]));
    }
    function render() {
      card.dataset.state = "q";
      var x = T().questions[i];
      drawProg();
      var opts = el("div", { cls: "qz-opts" }, x.opts.map(function (o, n) {
        var b = el("button", { cls: "qz-opt", type: "button", id: "qz-" + i + "-" + n }, [el("span", { cls: "k", text: "ABCD"[n] }), el("span", { text: o })]);
        b.addEventListener("click", function () { pick(n, opts); });
        return b;
      }));
      card.replaceChildren(el("h2", { cls: "qz-q", text: x.q }), opts);
    }
    function pick(n, opts) {
      var x = T().questions[i], ok = n === x.a, last = i === T().questions.length - 1, u = UI[lang];
      if (ok) score++;
      Array.prototype.forEach.call(opts.children, function (b, m) {
        b.disabled = true; b.classList.add(m === x.a ? "right" : m === n ? "wrong" : "dim");
      });
      var next = el("button", { cls: "btn btn-primary qz-next", type: "button", text: last ? u.result : u.next });
      next.addEventListener("click", function () {
        if (last) done(); else { i++; render(); card.scrollIntoView({ block: "start", behavior: "smooth" }); }
      });
      card.append(el("div", { cls: "qz-answer" }, [
        el("span", { cls: "qz-verdict " + (ok ? "ok" : "no"), text: ok ? u.right : u.wrong + "ABCD"[x.a] }),
        el("p", { text: x.why }),
        x.deeper ? el("details", null, [el("summary", { text: u.deeper }), el("p", { text: x.deeper })]) : null,
        next
      ]));
      next.focus({ preventScroll: true });
      if (window.umami && last) try { umami.track("test-complete", { test: data.slug, score: score, lang: lang }); } catch (e) {}
    }
    function done() {
      card.dataset.state = "done";
      var u = UI[lang], n = T().questions.length;
      i = n; drawProg();
      var msg = score >= 9 ? u.m3 : score >= 6 ? u.m2 : u.m1;
      var again = el("button", { cls: "btn btn-ghost", type: "button", text: u.again });
      again.addEventListener("click", function () { i = 0; score = 0; render(); });
      var mail = el("span", { cls: "qz-mail", text: CONTACT });
      card.replaceChildren(
        el("span", { cls: "qz-level", text: u.score }),
        el("div", { cls: "qz-score" }, [String(score), el("small", { text: " / " + n })]),
        el("p", { text: msg }),
        el("div", { cls: "qz-row" }, [again, el("a", { cls: "btn btn-ghost", href: "/tests/?lang=" + lang, text: u.all })]),
        el("div", { cls: "qz-cta" }, [el("h3", { text: u.appT }), el("p", { text: u.appP }), el("a", { cls: "btn btn-primary", href: APP, text: u.appB })]),
        el("div", { cls: "qz-biz" }, [el("h3", { text: u.bizT }), el("p", null, [u.bizP, mail, "."])])
      );
    }
    drawHead();
    render();
  }

  var node = document.getElementById("quiz-data");
  var root = document.getElementById("quiz");
  if (!node || !root) return;
  var data = JSON.parse(node.textContent);
  if (data.tests) hub(root, data); else play(root, data);
})();

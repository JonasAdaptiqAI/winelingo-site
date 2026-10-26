/* The printable gift card (/gift/card/, built by scripts/build-course-pages.mjs). The code and the
   language arrive in the #fragment, so they never reach a server; To/From/message are typed here
   and printed with the card. Every text goes in with textContent. */
(function () {
  "use strict";
  var T = {
    en: { to: "To", from: "From", msg: "A few words (optional)", print: "Print the card", for: "A gift for you",
      what: "The Winelingo wine course, for life", sub: "173 interactive lessons: tasting, grapes and twelve wine countries.",
      code: "Your code", where: "Redeem at winelingo.app/redeem", redeem: "Redeem this code now", toP: "Dear ", fromP: "From " },
    da: { to: "Til", from: "Fra", msg: "Et par ord (valgfrit)", print: "Print kortet", for: "En gave til dig",
      what: "Winelingos vinkursus, for altid", sub: "173 interaktive lektioner: smagning, druer og tolv vinlande.",
      code: "Din kode", where: "Indløs på winelingo.app/redeem", redeem: "Indløs koden nu", toP: "Kære ", fromP: "Fra " },
    es: { to: "Para", from: "De", msg: "Unas palabras (opcional)", print: "Imprimir la tarjeta", for: "Un regalo para ti",
      what: "El curso de vino de Winelingo, para siempre", sub: "173 lecciones interactivas: cata, uvas y doce países del vino.",
      code: "Tu código", where: "Canjéalo en winelingo.app/redeem", redeem: "Canjear este código ahora", toP: "Para ", fromP: "De " },
    de: { to: "Für", from: "Von", msg: "Ein paar Worte (optional)", print: "Karte drucken", for: "Ein Geschenk für dich",
      what: "Der Winelingo-Weinkurs, auf Lebenszeit", sub: "173 interaktive Lektionen: Verkostung, Rebsorten und zwölf Weinländer.",
      code: "Dein Code", where: "Einlösen auf winelingo.app/redeem", redeem: "Diesen Code jetzt einlösen", toP: "Für ", fromP: "Von " }
  };
  var hash = location.hash.slice(1), p = {};
  hash.split("&").forEach(function (kv) { var i = kv.indexOf("="); if (i > 0) { try { p[kv.slice(0, i)] = decodeURIComponent(kv.slice(i + 1)); } catch (e) {} } });
  var lang = T[p.l] ? p.l : "en", s = T[lang];
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-t]").forEach(function (el) { var k = el.getAttribute("data-t"); if (s[k]) el.textContent = s[k]; });
  var code = /^WL-[A-Z0-9]{4}-[A-Z0-9]{4}$/.test(p.c || "") ? p.c : null;
  if (code) document.getElementById("code").textContent = code;
  var redeem = document.getElementById("redeem");
  redeem.href = "/course/?" + (code ? "redeem=" + encodeURIComponent(code) : "redeem=open") + "&lang=" + lang;
  function bind(id, out, prefix) {
    var input = document.getElementById(id), el = document.getElementById(out);
    function upd() { var v = input.value.trim(); el.textContent = v ? prefix + v : ""; el.hidden = !v; }
    if (p[id]) input.value = p[id];
    input.addEventListener("input", upd); upd();
  }
  bind("to", "toOut", s.toP); bind("from", "fromOut", s.fromP); bind("msg", "msgOut", "");
  document.getElementById("print").addEventListener("click", function () { window.print(); });
})();

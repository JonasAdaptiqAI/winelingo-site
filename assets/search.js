/* Site search: the header's magnifier (or "/") opens a dialog with Pagefind's search UI.
   The index is static, in /pagefind/, built by scripts/build-search.sh after pages change.
   Nothing loads until the visitor opens search. */
(function () {
  var dlg, ready = false, loading = false;
  var LABELS = {
    da: { placeholder: "Søg i druer, regioner, mad og vin, tests …", close: "Luk søgning", hint: "Prøv: Riesling, Barolo, Champagne, tannin, WSET. Det meste af sitet er på engelsk." },
    en: { placeholder: "Search grapes, regions, food pairings, tests …", close: "Close search", hint: "Try: Riesling, Barolo, salmon, tannin, WSET" }
  };
  var L = LABELS[(document.documentElement.lang || "en").slice(0, 2)] || LABELS.en;

  function load(done) {
    if (ready) return done();
    if (loading) return;
    loading = true;
    var css = document.createElement("link");
    css.rel = "stylesheet"; css.href = "/pagefind/pagefind-ui.css";
    document.head.append(css);
    var js = document.createElement("script");
    js.src = "/pagefind/pagefind-ui.js";
    js.onload = function () {
      new window.PagefindUI({
        element: "#site-search-ui", showSubResults: true, showImages: false, resetStyles: false,
        // Rank by where the word sits (titles weigh most), not how often a page repeats it:
        // "riesling" should find the Riesling page before a region page that lists it ten times.
        ranking: { termFrequency: 0 },
        translations: { placeholder: L.placeholder }
      });
      ready = true; done();
    };
    document.head.append(js);
  }

  // The way out eases in (CSS .closing), then the dialog really closes.
  function close() {
    if (!dlg || !dlg.open || dlg.classList.contains("closing")) return;
    var reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) { dlg.close(); return; }
    dlg.classList.add("closing");
    setTimeout(function () { dlg.classList.remove("closing"); dlg.close(); }, 180);
  }

  function open() {
    if (!dlg) {
      dlg = document.createElement("dialog");
      dlg.className = "search-dialog";
      dlg.setAttribute("aria-label", L.placeholder);
      dlg.innerHTML = '<div class="search-in"><button class="search-close" type="button" aria-label="' + L.close + '">×</button>' +
        '<div id="site-search-ui"></div><p class="search-hint">' + L.hint + "</p></div>";
      document.body.append(dlg);
      dlg.addEventListener("click", function (e) { if (e.target === dlg) close(); });
      dlg.querySelector(".search-close").addEventListener("click", close);
      // Esc: let the dialog leave the same way as the close button, eased out.
      dlg.addEventListener("cancel", function (e) { e.preventDefault(); close(); });
    }
    dlg.showModal();
    load(function () { var i = dlg.querySelector("input"); if (i) i.focus(); });
    if (window.umami) try { umami.track("search-open"); } catch (e) {}
  }

  document.addEventListener("click", function (e) {
    var b = e.target.closest && e.target.closest("[data-search-open]");
    if (b) { e.preventDefault(); open(); }
  });
  document.addEventListener("keydown", function (e) {
    var t = document.activeElement && document.activeElement.tagName;
    if (e.key === "/" && !e.metaKey && !e.ctrlKey && !/^(INPUT|TEXTAREA|SELECT)$/.test(t || "")) { e.preventDefault(); open(); }
  });
})();

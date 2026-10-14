/* Free-lesson cards (scripts/build-lesson-cta.mjs).
   The app is iPhone-only, so: on an iPhone or iPad the app button leads; on Android the app
   button is hidden; everywhere else the browser button leads and the app stays as the second
   choice. Clicks on the cards and on any course link are recorded in Umami. */
(function () {
  "use strict";
  var ua = navigator.userAgent || "";
  var ios = /iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1);
  var android = /Android/.test(ua);
  var cards = document.querySelectorAll(".lesson-cta");
  for (var i = 0; i < cards.length; i++) {
    var app = cards[i].querySelector(".lc-app"), web = cards[i].querySelector(".lc-web");
    if (!app || !web) continue;
    if (android) { app.hidden = true; web.className = "btn btn-primary lc-web"; }
    else if (!ios) {
      app.className = "btn btn-ghost lc-app"; web.className = "btn btn-primary lc-web";
      app.parentNode.insertBefore(web, app);
    }
  }
  function track(name, data) { try { if (window.umami) window.umami.track(name, data); } catch (e) {} }
  document.addEventListener("click", function (e) {
    var t = e.target; if (!t || !t.closest) return;
    var a = t.closest("a"); if (!a) return;
    var card = a.closest(".lesson-cta");
    if (card) {
      track("lesson-cta", { path: location.pathname, lesson: card.getAttribute("data-lesson"), target: a.classList.contains("lc-app") ? "app" : "web", device: ios ? "ios" : android ? "android" : "other" });
      return;
    }
    var href = a.getAttribute("href") || "";
    if (href.indexOf("/course/") === 0) track("course-click", { path: location.pathname, cta: a.getAttribute("data-cta") || a.className || "link" });
  }, true);
})();

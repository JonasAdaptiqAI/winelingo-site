/* Did the visitor read the page? Umami only knows the time between two page views, so someone
   who reads one page for three minutes and leaves looks like a 0-second bounce. This sends up
   to four events per page view, with no cookies and nothing that identifies the visitor:

     engaged-30s   the page was open and in view for 30 seconds
     engaged-2m    … for two minutes
     read-50       the visitor scrolled past half of the page's main content
     read-90       … to the end of it

   Time counts only while the tab is visible. Scroll depth counts only after a real scroll, so a
   short page that fits the screen sends no read-50/read-90; engaged-30s covers those.
   Each event carries the site section (the first folder of the path) for easy grouping. */
(function () {
  "use strict";
  var main = document.getElementById("main") || document.querySelector("main") || document.body;
  var section = location.pathname.split("/")[1] || "home";
  var sent = {}, seconds = 0, scrolled = false;

  function send(name) {
    if (sent[name]) return;
    sent[name] = true;
    try { if (window.umami) window.umami.track(name, { section: section }); } catch (e) {}
  }

  // Time in view: one tick a second, only while the tab is showing.
  var timer = setInterval(function () {
    if (document.visibilityState !== "visible") return;
    seconds++;
    if (seconds >= 30) send("engaged-30s");
    if (seconds >= 120) { send("engaged-2m"); clearInterval(timer); }
    if (scrolled) depth();
  }, 1000);

  // How far down the main content the bottom of the screen has reached, 0 to 1.
  function depth() {
    var r = main.getBoundingClientRect();
    if (r.height < 200) return;
    var seen = (window.innerHeight - r.top) / r.height;
    // A few seconds on the page first, so a fling straight to the footer is not a "read".
    if (seen >= 0.5 && seconds >= 5) send("read-50");
    if (seen >= 0.9 && seconds >= 10) send("read-90");
  }
  window.addEventListener("scroll", function () { scrolled = true; depth(); }, { passive: true });
})();

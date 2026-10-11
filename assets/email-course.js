/* The sign-up form for the free 5-day wine course by email (any <form data-email-course>). Posts to
   the email-course function; the confirmation link brings people back with ?confirmed=1 or
   ?unsubscribed=1, shown in [data-ec-status]. Every text goes in with textContent. */
(function () {
  "use strict";
  var FN = "https://pzrqsjcpflvbgptppcep.supabase.co/functions/v1/email-course";
  var T = {
    en: { sending: "Sending…", sent: "Check your inbox: we've sent a link to confirm. Day 1 arrives as soon as you click it.",
      bad: "That email address doesn't look right.", fail: "Something went wrong. Please try again in a minute.",
      confirmed: "You're in! Day 1 is on its way to your inbox.", unsubscribed: "You're unsubscribed. You won't get any more emails from the course." },
    da: { sending: "Sender…", sent: "Tjek din indbakke: vi har sendt et link, du skal bekræfte. Dag 1 kommer, så snart du klikker på det.",
      bad: "Den e-mailadresse ser ikke rigtig ud.", fail: "Noget gik galt. Prøv igen om et minut.",
      confirmed: "Du er med! Dag 1 er på vej til din indbakke.", unsubscribed: "Du er afmeldt. Du får ikke flere mails fra kurset." }
  };
  var lang = document.documentElement.lang === "da" ? "da" : "en", s = T[lang];
  var st = document.querySelector("[data-ec-status]");
  if (st) {
    var msg = /[?&]confirmed=1/.test(location.search) ? s.confirmed : /[?&]unsubscribed=1/.test(location.search) ? s.unsubscribed : "";
    if (msg) { st.textContent = msg; st.hidden = false; }
  }
  document.querySelectorAll("form[data-email-course]").forEach(function (f) {
    var out = f.querySelector(".ec-msg"), btn = f.querySelector("button");
    f.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var email = f.querySelector("input[type=email]").value.trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) { out.textContent = s.bad; out.className = "ec-msg err"; return; }
      btn.disabled = true; out.textContent = s.sending; out.className = "ec-msg";
      fetch(FN, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
        action: "subscribe", email: email, lang: lang, source: f.getAttribute("data-email-course") || location.pathname,
        website: (f.querySelector("input[name=website]") || {}).value || "" }) })
        .then(function (r) { return r.json().catch(function () { return {}; }); })
        .then(function (j) {
          btn.disabled = false;
          if (j && j.ok) { out.textContent = s.sent; out.className = "ec-msg ok"; f.classList.add("done");
            try { if (window.umami) umami.track("email-course-signup", { source: f.getAttribute("data-email-course") || "" }); } catch (e) {} }
          else { out.textContent = j && j.error === "bad_email" ? s.bad : s.fail; out.className = "ec-msg err"; }
        }).catch(function () { btn.disabled = false; out.textContent = s.fail; out.className = "ec-msg err"; });
    });
  });
})();

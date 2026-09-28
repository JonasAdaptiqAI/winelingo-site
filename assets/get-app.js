/* ============================================================
   "Get the app" — shared, progressive enhancement for every page.

   1. Phones: a slim App Store bar slides up once the reader is past the first
      screen, and steps aside whenever another App Store call-to-action (hero,
      .cta, .appband, footer) is already on screen. Dismissing it keeps it away
      for three days.
   2. Computers: an iPhone app can't be installed from a laptop, so the App Store
      badge alone is a dead end there. The same bar becomes a small QR card, and
      every .appband gets a QR next to its button. The QR opens /get, which
      counts the scan in Umami and forwards to the App Store.
   3. Android: nothing. Winelingo is iPhone-only, and a bar that leads nowhere
      is worse than no bar.

   Clicks on the bar are counted by the site's existing appstore-click handler;
   data-cta tells the placements apart. Pages work exactly the same without
   this file.
   ============================================================ */
(function () {
  var APP = 'https://apps.apple.com/app/id6785896824';
  var QR = '/assets/qr-get.svg';
  var QR_ALT = 'QR code that opens Winelingo on the App Store';
  var KEY = 'wl-getbar-dismissed';
  var QUIET_DAYS = 3;

  if (/Android/i.test(navigator.userAgent || '')) return;
  var desktop = window.matchMedia('(hover:hover) and (pointer:fine) and (min-width:901px)').matches;

  // Tiny element builder: h('a', {class: 'x', href: '/'}, [child, 'text'])
  function h(tag, attrs, kids) {
    var n = document.createElement(tag);
    for (var k in attrs || {}) n.setAttribute(k, attrs[k]);
    (kids || []).forEach(function (c) { n.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return n;
  }
  function qrCard(extra) {
    return h('div', { class: 'qr-card' + (extra ? ' ' + extra : '') }, [
      h('img', { src: QR, alt: QR_ALT, width: 80, height: 80 }),
      h('span', { class: 'qr-txt' }, [h('b', {}, ['On a computer?']), 'Point your iPhone camera here to get the app.'])
    ]);
  }

  // ---- Computers: a QR beside every .appband button ---------------------------
  if (desktop) {
    document.querySelectorAll('.appband .in').forEach(function (inner) {
      var btn = inner.querySelector('a[href*="apps.apple.com"]');
      if (!btn || inner.querySelector('.qr-card')) return;
      var wrap = h('div', { class: 'ab-get' });
      btn.parentNode.insertBefore(wrap, btn);
      wrap.appendChild(btn);
      wrap.appendChild(qrCard('on-dark'));
      inner.parentNode.classList.add('has-qr');
    });
  }

  // ---- The bar (phones: App Store button; computers: QR) -----------------------
  // Not over a running quiz: its answer buttons sit where the bar would, and the
  // quiz ends on its own App Store card.
  var p = location.pathname;
  if (/^\/tests\/[^/]+\//.test(p)) return;
  try {
    var until = Number(localStorage.getItem(KEY) || 0);
    if (until && Date.now() < until) return;
  } catch (e) {}

  // A line that fits what the reader came for.
  var line = /^\/food-and-wine-pairing\//.test(p) ? 'Scan a bottle, see what to eat with it'
    : /^\/(learn|wine-glossary|tests|wine-classifications)\//.test(p) ? 'Learn wine a little every day'
    : 'Scan any label, learn the wine';

  var x = h('button', { class: 'gb-x', type: 'button', 'aria-label': 'Hide' }, ['×']);
  var bar = desktop
    ? h('div', { class: 'getbar is-desktop', role: 'region', 'aria-label': 'Get the Winelingo app' }, [
        h('img', { class: 'gb-qr', src: QR, alt: QR_ALT, width: 76, height: 76 }),
        h('span', { class: 'gb-txt' }, [h('b', {}, ['Winelingo for iPhone']), h('span', {}, ['Point your phone’s camera here to get the app.'])]),
        x
      ])
    : h('div', { class: 'getbar', role: 'region', 'aria-label': 'Get the Winelingo app' }, [
        h('img', { class: 'gb-icon', src: '/assets/logo.png', alt: '', width: 40, height: 40 }),
        h('span', { class: 'gb-txt' }, [h('b', {}, ['Winelingo ', h('i', {}, ['· Free'])]), h('span', {}, [line])]),
        h('a', { class: 'gb-btn', href: APP, 'data-cta': 'sticky-bar' }, ['Get']),
        x
      ]);
  document.body.appendChild(bar);

  var root = document.documentElement;
  var dismissed = false;
  var inView = new Set();
  function update() {
    var scrolled = window.scrollY > window.innerHeight * (desktop ? 0.9 : 0.6);
    var show = !dismissed && scrolled && inView.size === 0;
    bar.classList.toggle('show', show);
    root.classList.toggle('getbar-on', show);
  }
  x.addEventListener('click', function () {
    dismissed = true;
    update();
    try { localStorage.setItem(KEY, String(Date.now() + QUIET_DAYS * 864e5)); } catch (e) {}
  });

  // Step aside while another App Store call-to-action is visible.
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) inView.add(e.target); else inView.delete(e.target); });
      update();
    });
    document.querySelectorAll('[data-get-app-zone], .cta, .appband, .site-footer').forEach(function (z) { io.observe(z); });
  }
  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; update(); });
  }, { passive: true });
  update();
})();

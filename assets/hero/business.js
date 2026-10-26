/* Generated from the hero prototype by work/make_site_hero.py: edit the prototype, not this file. */
(() => {
  const $ = id => document.getElementById('hs-' + id);
  const stage = $('stage'), story = $('story'), nav = document.getElementById('site-header');
  const shot1 = $('shot1'), shot2 = $('shot2'), front = $('front'), dim = $('dim'), vignette = $('vignette'), endshot = $('endshot');
  const screen = $('screen'), bezel = $('bezel');
  const screens = [...screen.querySelectorAll('.hs-scr')];
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Two photo sets: wide for desktop, portrait for phones. All coordinates are in each photo's
  // own pixels (img/b2b, made by work/b2b_composite.py, which also prints the bottle labels).
  // `glass` is the phone's grey screen (TL, TR, BR, BL); `front` is what sits in front of it.
  const SETS = {
    desktop: {
      s1: { src: '/assets/hero/b2b/open-desktop.webp', w: 2560, h: 1440 },
      s2: { src: '/assets/hero/b2b/phone-desktop.webp', w: 2560, h: 1440 },
      front: { src: '/assets/hero/b2b/phone-desktop-front.png', box: [592, 612, 782, 965] },
      glass: [[604.7, 627.6], [761.9, 624.5], [770.0, 946.8], [613.7, 953.8]],
      frames: v => ({
        table: { cx: 1100, cy: 720, z: 1 },   // as far left as the frame allows: the waiter sits right, clear of the headline
        host: v.fit(1, [1150, 150, 1800, 920], v.side, 0.48),        // her face, the bottle, the guests' eyeline
        bottle: v.fit(1, [1170, 500, 1430, 820], v.side, 0.5),       // in on the label: the match cut
        close: v.fit(2, [480, 80, 1820, 1430], v.side, 0.5, 1.02),   // her smile, the phone, the bottle on the bar
        phone: v.fit(2, [560, 590, 820, 990], 0.5, 0.5, 1.5),
        away: { cx: 1300, cy: 700, k: 1.25 },
      }),
    },
    mobile: {
      s1: { src: '/assets/hero/b2b/open-mobile.webp', w: 1440, h: 2155 },
      s2: { src: '/assets/hero/b2b/phone-mobile.webp', w: 1440, h: 2560 },
      front: { src: '/assets/hero/b2b/phone-mobile-front.png', box: [348, 1088, 529, 1441] },
      glass: [[360.5, 1100.5], [516.6, 1100.5], [517.5, 1427.5], [363.7, 1429.5]],
      frames: v => ({
        table: { cx: 800, cy: 1078, z: 1 },
        host: v.fit(1, [560, 380, 1180, 1180], 0.5, 0.55),
        bottle: v.fit(1, [590, 860, 810, 1110], 0.5, 0.55),
        close: { cx: 720, cy: 1280, z: 1 },
        phone: v.fit(2, [330, 1060, 550, 1470], 0.5, 0.42, 1.6),
        away: { cx: 720, cy: 1200, k: 1.2 },
      }),
    },
  };

  // The team in the league; "You" climbs from third to first as the beat plays.
  const TEAM = [
    { name: 'Sofie', xp: 120, c: '#b5654a' }, { name: 'Mads', xp: 110, c: '#5d7a9a' },
    { name: 'You', xp: 95, c: '#7b1e3b', me: true }, { name: 'Ali', xp: 70, c: '#6e7b54' }, { name: 'Freja', xp: 55, c: '#a07a3c' },
  ];
  const MEDAL = ['#d4a72c', '#a7a9ac', '#b7793e'];
  const board = $('board');
  TEAM.forEach(m => {
    m.el = document.createElement('div');
    m.el.className = 'hs-mrow' + (m.me ? ' hs-me' : '');
    m.el.innerHTML = `<span class="hs-rk"></span><span class="hs-av" style="background:${m.c}">${m.name[0]}</span><span class="hs-who">${m.name}</span><span class="hs-xp"></span>`;
    board.appendChild(m.el);
  });
  function league(t) {
    TEAM[2].xp = Math.round(lerp(95, 135, t));
    const order = [...TEAM].sort((a, b) => b.xp - a.xp);
    order.forEach((m, i) => {
      m.el.style.top = `${4 + i * 56}px`;
      m.el.querySelector('.hs-xp').textContent = `${m.xp} XP`;
      m.el.querySelector('.hs-rk').innerHTML = i < 3
        ? `<svg width="20" height="22" viewBox="0 0 20 22"><path d="M5 0h4l2 6H7zM11 0h4l-2 6H9z" fill="${MEDAL[i]}" opacity=".7"/><circle cx="10" cy="14" r="7" fill="${MEDAL[i]}"/><text x="10" y="17.5" font-size="9" font-weight="700" text-anchor="middle" fill="#fff" font-family="Inter,sans-serif">${i + 1}</text></svg>`
        : `${i + 1}`;
    });
    // The standing line, in the page's language (the business page can switch to Danish).
    const me = order.findIndex(m => m.me), da = document.documentElement.lang === 'da';
    const lead = order[0].xp - order[1].xp, gap = me > 0 ? order[me - 1].xp - order[me].xp : 0, rival = me > 0 ? order[me - 1].name : '';
    $('standing').textContent = me === 0
      ? (da ? `Du fører med ${lead} XP.` : `You're leading by ${lead} XP.`)
      : (da ? `${gap} XP for at overhale ${rival}.` : `${gap} XP to pass ${rival}.`);
    order.forEach(m => { if (m.me) m.el.querySelector('.hs-who').textContent = da ? 'Dig' : 'You'; });
    $('myXp').textContent = TEAM[2].xp;
  }

  function tapAnim(el, t) {
    el.style.opacity = t > 0 && t < 1 ? Math.sin(Math.PI * t) : 0;
    el.style.transform = `scale(${0.55 + 0.75 * t})`;
  }
  function centreIn(el, root) {
    let x = el.offsetWidth / 2, y = el.offsetHeight / 2;
    for (let n = el; n && n !== root; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
    return [x, y];
  }
  function placeTaps() {
    [[$('testRight'), 'tapTest', $('test'), 102], [$('optRight'), 'tapOpt', $('lesson'), 0], [$('checkBtn'), 'tapCheck', $('lesson'), 0]].forEach(([el, id, root, dy]) => {
      const [x, y] = centreIn(el, root);
      Object.assign($(id).style, { left: `${x}px`, top: `${y + dy}px` });
    });
  }

  const SW = 300, SH = 652;
  function fitTo(q) {
    const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
    const dx1 = x1 - x2, dx2 = x3 - x2, dx3 = x0 - x1 + x2 - x3;
    const dy1 = y1 - y2, dy2 = y3 - y2, dy3 = y0 - y1 + y2 - y3;
    const den = dx1 * dy2 - dx2 * dy1;
    const g = (dx3 * dy2 - dx2 * dy3) / den, h = (dx1 * dy3 - dx3 * dy1) / den;
    const a = x1 - x0 + g * x1, b = x3 - x0 + h * x3, d = y1 - y0 + g * y1, e = y3 - y0 + h * y3;
    return `matrix3d(${a / SW},${d / SW},0,${g / SW},${b / SH},${e / SH},0,${h / SH},0,0,1,0,${x0},${y0},0,1)`;
  }

  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const seg = (p, a, b) => clamp((p - a) / (b - a));
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  const lerp = (a, b, t) => a + (b - a) * t;
  const fade = (p, inA, inB, outA, outB) => Math.min(seg(p, inA, inB), outA == null ? 1 : 1 - seg(p, outA, outB));

  let vw, vh, mobile, set, F;
  function measure() {
    vw = stage.clientWidth; vh = stage.clientHeight; mobile = vw < 760;
    const next = SETS[mobile ? 'mobile' : 'desktop'];
    if (next !== set) {
      set = next;
      for (const [el, img, s] of [[shot1, $('shot1img'), set.s1], [shot2, $('shot2img'), set.s2]]) {
        el.style.width = `${s.w}px`; el.style.height = `${s.h}px`; img.src = s.src;
      }
      const b = set.front.box;
      front.style.width = `${set.s2.w}px`; front.style.height = `${set.s2.h}px`;
      Object.assign($('frontimg').style, { left: `${b[0]}px`, top: `${b[1]}px`, width: `${b[2] - b[0]}px`, height: `${b[3] - b[1]}px` });
      $('frontimg').src = set.front.src;
    }
    F = set.frames({ side: mobile ? 0.5 : 0.62, fit });
  }

  const dims = n => n === 1 ? set.s1 : set.s2;
  // Camera on photo n: centre (cx, cy) in its pixels, zoom z relative to "cover".
  function camera(el, n, f) {
    const { w, h } = dims(n);
    const S = Math.max(vw / w, vh / h) * (reduce ? 1 : f.z);
    const hx = vw / 2 / S, hy = vh / 2 / S;
    const cx = clamp(f.cx, hx, w - hx), cy = clamp(f.cy, hy, h - hy);
    el.style.transform = `translate3d(${vw / 2 - cx * S}px, ${vh / 2 - cy * S}px, 0) scale(${S})`;
    return { S, cx, cy };
  }
  // The smallest zoom that keeps `box` in view, its centre at (ax, ay) of the viewport.
  function fit(n, box, ax = 0.5, ay = 0.5, pad = 1.12) {
    const { w, h } = dims(n);
    const cover = Math.max(vw / w, vh / h);
    const S = Math.max(cover, Math.min(vw / ((box[2] - box[0]) * pad), vh / ((box[3] - box[1]) * pad)));
    return { cx: (box[0] + box[2]) / 2 - (ax - 0.5) * vw / S, cy: (box[1] + box[3]) / 2 - (ay - 0.5) * vh / S, z: S / cover };
  }
  const mix = (a, b, t) => ({ cx: lerp(a.cx, b.cx, t), cy: lerp(a.cy, b.cy, t), z: a.z * Math.pow(b.z / a.z, t) });

  function show(el, o, dy = 0) {
    el.style.opacity = o;
    el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
    el.style.translate = `0 ${(1 - o) * dy}px`;
  }

  const navToggle = nav && nav.querySelector('.nav-toggle');
  function onStory() {
    if (!nav) return;
    const open = navToggle && navToggle.getAttribute('aria-expanded') === 'true';
    // Only while the stage is pinned: once it starts to scroll away the site's paper bar returns,
    // so the story's last lines never slide under a transparent header.
    nav.classList.toggle('on-story', story.getBoundingClientRect().bottom > stage.clientHeight + 1 && !open);
  }
  if (navToggle) navToggle.addEventListener('click', () => setTimeout(onStory));

  function render(p) {
    const { table, host, bottle, close, phone, away } = F;

    // Beat 1: the table, in to her presenting the bottle, then on to the label: the match cut.
    const x12 = seg(p, 0.25, 0.33);
    camera(shot1, 1, p < 0.24 ? mix(table, host, ease(seg(p, 0.03, 0.15))) : mix(host, bottle, ease(seg(p, 0.24, 0.33))));
    shot1.style.opacity = 1 - x12;
    shot1.style.filter = x12 > 0 ? `blur(${x12 * 7}px)` : 'none';

    // Beat 2: before service, the same bottle on the bar; hold on her, then in on the phone.
    const z2 = ease(seg(p, 0.41, 0.49));
    const lift = ease(seg(p, 0.48, 0.58));
    const cam2 = camera(shot2, 2, mix(close, phone, z2));
    if (lift > 0) camera(shot2, 2, mix(phone, { cx: away.cx, cy: away.cy, z: phone.z * away.k }, lift));
    shot2.style.opacity = x12;
    const blur2 = (1 - x12) * 6 + lift * 16;
    shot2.style.filter = blur2 > 0.05 ? `blur(${blur2}px)` : 'none';

    // Beat 3: the screen wakes up in her hand, then lifts out of the photo.
    const lit = seg(p, 0.355, 0.39);
    const { S, cx, cy } = cam2;
    const inPhoto = set.glass.map(([x, y]) => [(x - cx) * S + vw / 2, (y - cy) * S + vh / 2]);
    const k = mobile ? Math.min(vh * 0.5, 470) / SH : Math.min(vh * 0.78, 700) / SH;
    const end = ease(seg(p, 0.88, 0.94));
    const kk = k * (1 - 0.12 * end);
    const tx = (mobile ? vw / 2 : vw * 0.68) - kk * SW / 2;
    const ty = (mobile ? 96 : vh / 2 - k * SH / 2) + (k - kk) * SH / 2 + end * 30;
    const lifted = [[tx, ty], [tx + kk * SW, ty], [tx + kk * SW, ty + kk * SH], [tx, ty + kk * SH]];
    screen.style.transform = fitTo(inPhoto.map((pt, i) => [lerp(pt[0], lifted[i][0], lift), lerp(pt[1], lifted[i][1], lift)]));
    screen.classList.toggle('hs-out', lift > 0);
    screen.style.setProperty('--r', `${lerp(8, 46, lift)}px`);
    screen.style.opacity = lit * (1 - end);
    screen.style.filter = lift < 1 ? `brightness(${lerp(0.86, 1, lift)})` : 'none';
    bezel.style.opacity = lift;
    front.style.transform = shot2.style.transform;
    front.style.filter = shot2.style.filter;
    front.style.opacity = x12 * (1 - seg(lift, 0, 0.1));
    dim.style.opacity = lift * 0.6 * (1 - seg(p, 0.88, 0.95));
    vignette.style.opacity = 1 - lift * 0.6 + seg(p, 0.88, 0.95) * 0.6;

    // The phone: the house test on her wine list, a lesson, then the team's league.
    const which = p < 0.66 ? 0 : p < 0.79 ? 1 : 2;
    screens.forEach((s, i) => s.classList.toggle('hs-on', i === which));

    // The house test is a web page: one tap answers, the explanation slides into view.
    const answered = p >= 0.615;
    tapAnim($('tapTest'), seg(p, 0.6, 0.62));
    $('test').querySelectorAll('.hs-opt').forEach(o => {
      o.classList.toggle('hs-right', answered && o.id === 'hs-testRight');
      o.classList.toggle('hs-faded', answered && o.id !== 'hs-testRight');
    });
    $('testAnswer').classList.toggle('hs-on', answered);
    $('testScroll').style.transform = `translateY(${-150 * ease(seg(p, 0.62, 0.645))}px)`;
    $('tapTest').style.translate = `0 ${-150 * ease(seg(p, 0.62, 0.645))}px`;

    // The lesson: pick, check, and the answer sheet rises with the why.
    const picked = p >= 0.70, checked = p >= 0.735;
    tapAnim($('tapOpt'), seg(p, 0.685, 0.705));
    tapAnim($('tapCheck'), seg(p, 0.718, 0.738));
    $('lesson').querySelectorAll('.hs-opt').forEach(o => {
      const right = o.id === 'hs-optRight';
      o.classList.toggle('hs-on', picked && !checked && right);
      o.classList.toggle('hs-right', checked && right);
      o.classList.toggle('hs-faded', checked && !right);
    });
    $('checkBtn').classList.toggle('hs-ready', picked);
    $('lessonBar').style.width = checked ? '30%' : '24%';
    $('sheet').style.transform = `translateY(${105 * (1 - ease(seg(p, 0.735, 0.752)))}%)`;

    // The league: a lesson's worth of XP, and she climbs to the top.
    league(ease(seg(p, 0.815, 0.855)));

    // Beat 4: back at the table, she pours a taste.
    const e = seg(p, 0.885, 0.955);
    endshot.style.opacity = e;
    endshot.style.transform = reduce ? 'none' : `scale(${lerp(1.08, 1, ease(e))})`;
    shot2.style.visibility = e >= 1 ? 'hidden' : 'visible';

    show($('hero'), 1 - seg(p, 0.015, 0.08), -24);
    show($('hint'), 1 - seg(p, 0, 0.02));
    show($('capA'), fade(p, 0.13, 0.17, 0.225, 0.255), 24);
    show($('capB'), fade(p, 0.35, 0.385, 0.435, 0.465), 24);
    show($('sideList'), fade(p, 0.545, 0.575, 0.645, 0.66), 24);
    show($('sideLesson'), fade(p, 0.67, 0.69, 0.765, 0.785), 24);
    show($('sideLeague'), fade(p, 0.795, 0.82, 0.865, 0.885), 24);
    show($('end'), seg(p, 0.94, 0.98), 24);
    onStory();
  }

  const still = location.search.includes('still');
  let target = 0, current = 0, raf = 0;
  function progress() {
    const r = story.getBoundingClientRect();
    return clamp(-r.top / (story.offsetHeight - vh));
  }
  function tick() {
    current += (target - current) * (reduce || still ? 1 : 0.11);
    if (Math.abs(target - current) < 0.0002) current = target;
    render(current);
    raf = current !== target ? requestAnimationFrame(tick) : 0;
  }
  function onScroll() {
    target = progress();
    if (still) { current = target; render(current); return; }
    if (!raf) raf = requestAnimationFrame(tick);
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { measure(); target = current = progress(); render(current); });
  measure(); placeTaps(); target = current = progress(); render(current);
  document.fonts && document.fonts.ready.then(() => { placeTaps(); render(current); });
})();

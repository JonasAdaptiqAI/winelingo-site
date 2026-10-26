/* Generated from the hero prototype by work/make_site_hero.py: edit the prototype, not this file. */
(() => {
  const $ = id => document.getElementById('hs-' + id);
  const stage = $('stage'), story = $('story'), nav = document.getElementById('site-header');
  const shot1 = $('shot1'), shot2 = $('shot2'), dim = $('dim'), vignette = $('vignette'), endshot = $('endshot');
  const screen = $('screen'), bezel = $('bezel');
  const screens = [...screen.querySelectorAll('.hs-scr')];
  const scanScroll = $('scanScroll');
  const lesson = $('lesson'), optRight = $('optRight'), checkBtn = $('checkBtn'), sheet = $('sheet'), lessonBar = $('lessonBar');
  const opts = [...lesson.querySelectorAll('.hs-opt')];

  // A thumb tap: the ring blooms and fades as t runs 0 → 1.
  function tapAnim(el, t) {
    el.style.opacity = t > 0 && t < 1 ? Math.sin(Math.PI * t) : 0;
    el.style.transform = `scale(${0.55 + 0.75 * t})`;
  }
  // Put each tap on the centre of what it presses, in the lesson's own 393×852 layout.
  function centreIn(el, root) {
    let x = el.offsetWidth / 2, y = el.offsetHeight / 2;
    for (let n = el; n && n !== root; n = n.offsetParent) { x += n.offsetLeft; y += n.offsetTop; }
    return [x, y];
  }
  function placeTaps() {
    [[optRight, 'tapOpt'], [checkBtn, 'tapCheck']].forEach(([el, id]) => {
      const [x, y] = centreIn(el, lesson);
      Object.assign($(id).style, { left: `${x}px`, top: `${y}px` });
    });
  }
  placeTaps();
  document.fonts && document.fonts.ready.then(placeTaps);

  // The bottle labels are printed into the photos themselves (work/composite.py), so they
  // follow the paper's angle and curve and sit under his fingers.
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const fingers = $('fingers');

  const IMG = { w: 1536, h: 1024 };
  const K = 2;  // the photo elements are K× IMG, so they stay sharp when the camera zooms in
  // The phone's glass in scene-phone.webp, measured to the inner edge of the steel frame,
  // in image pixels: top-left, top-right, bottom-right, bottom-left. It is tipped in
  // perspective, so the screen is fitted to all four corners, not just three.
  const QUAD = [[1035.4, 587.8], [1153.9, 590.4], [1124.9, 859.1], [1009.6, 850.6]];
  const SW = 300, SH = 652;

  // A CSS matrix3d that takes the SW×SH screen onto four corners (TL, TR, BR, BL).
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

  let vw, vh, mobile;
  function measure() { vw = stage.clientWidth; vh = stage.clientHeight; mobile = vw < 760; }

  // Camera: centre (cx, cy) in image pixels, zoom z relative to "cover".
  function camera(el, cx, cy, z) {
    const S = Math.max(vw / IMG.w, vh / IMG.h) * (reduce ? 1 : z);
    const hx = vw / 2 / S, hy = vh / 2 / S;
    cx = clamp(cx, hx, IMG.w - hx); cy = clamp(cy, hy, IMG.h - hy);
    el.style.transform = `translate3d(${vw / 2 - cx * S}px, ${vh / 2 - cy * S}px, 0) scale(${S / K})`;
    return { S, cx, cy };
  }

  // A framing: the smallest zoom that keeps `box` (image pixels) in view,
  // with its centre placed at (ax, ay) of the viewport.
  function fit(box, ax = 0.5, ay = 0.5, pad = 1.12) {
    const cover = Math.max(vw / IMG.w, vh / IMG.h);
    const S = Math.max(cover, Math.min(vw / ((box[2] - box[0]) * pad), vh / ((box[3] - box[1]) * pad)));
    return { cx: (box[0] + box[2]) / 2 - (ax - 0.5) * vw / S, cy: (box[1] + box[3]) / 2 - (ay - 0.5) * vh / S, z: S / cover };
  }
  const mix = (a, b, t) => ({ cx: lerp(a.cx, b.cx, t), cy: lerp(a.cy, b.cy, t), z: a.z * Math.pow(b.z / a.z, t) });
  const shoot = (el, f) => camera(el, f.cx, f.cy, f.z);

  function show(el, o, dy = 0) {
    el.style.opacity = o;
    el.style.visibility = o < 0.01 ? 'hidden' : 'visible';
    el.dataset.dy = dy;
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
    // Framings, in image pixels. The subject sits right of centre on wide
    // screens so the captions on the left never cover him or the bottle.
    const side = mobile ? 0.5 : 0.62;
    const TABLE = { cx: mobile ? 880 : 768, cy: 512, z: 1 };
    const HOST = fit([600, 90, 1100, 650], side, 0.48);          // face, raised bottle, phone hand
    const HAND = fit([700, 260, 1080, 640], side, 0.5);          // pushing on towards the phone
    const CLOSE = mobile ? fit([720, 0, 1190, 900], 0.5, 0.5, 1.02)   // narrow: face and phone
                         : fit([420, 0, 1260, 900], side, 0.5, 1.02); // close-up: face, bottle, phone
    const PHONE = fit([960, 560, 1200, 880], 0.5, 0.5, 1.5);     // the phone in his hand
    const AWAY = { cx: 820, cy: 520, z: PHONE.z * 1.25 };       // drift off it as it lifts out

    // Beat 1: the table, then in to the host presenting the bottle. Hold there.
    const x12 = seg(p, 0.25, 0.33);
    shoot(shot1, p < 0.24 ? mix(TABLE, HOST, ease(seg(p, 0.03, 0.15))) : mix(HOST, HAND, ease(seg(p, 0.24, 0.33))));
    shot1.style.opacity = 1 - x12;
    shot1.style.filter = x12 > 0 ? `blur(${x12 * 7}px)` : 'none';

    // Beat 2: cut in to the close-up, hold on his smile, then push in on the phone.
    const z2 = ease(seg(p, 0.41, 0.49));
    const lift = ease(seg(p, 0.48, 0.58));
    // The screen's start pose is read from where the camera sits at lift-off,
    // so the background can keep drifting (and blur away the real phone) after.
    const cam2 = shoot(shot2, mix(CLOSE, PHONE, z2));
    if (lift > 0) shoot(shot2, mix(PHONE, AWAY, lift));
    shot2.style.opacity = x12;
    const blur2 = (1 - x12) * 6 + lift * 16;
    shot2.style.filter = blur2 > 0.05 ? `blur(${blur2}px)` : 'none';

    // Beat 3: the screen wakes up in his hand, then lifts out of the photo.
    const lit = seg(p, 0.355, 0.39);
    const { S, cx, cy } = cam2;
    const inPhoto = QUAD.map(([x, y]) => [(x - cx) * S + vw / 2, (y - cy) * S + vh / 2]);
    const k = mobile ? Math.min(vh * 0.5, 470) / SH : Math.min(vh * 0.78, 700) / SH;
    const end = ease(seg(p, 0.88, 0.94));
    const kk = k * (1 - 0.12 * end);
    const tx = (mobile ? vw / 2 : vw * 0.68) - kk * SW / 2;
    const ty = (mobile ? 96 : vh / 2 - k * SH / 2) + (k - kk) * SH / 2 + end * 30;
    const lifted = [[tx, ty], [tx + kk * SW, ty], [tx + kk * SW, ty + kk * SH], [tx, ty + kk * SH]];
    screen.style.transform = fitTo(inPhoto.map((pt, i) => [lerp(pt[0], lifted[i][0], lift), lerp(pt[1], lifted[i][1], lift)]));
    screen.classList.toggle('hs-out', lift > 0);
    screen.style.setProperty('--r', `${lerp(24, 46, lift)}px`);
    screen.style.opacity = lit * (1 - end);
    screen.style.filter = lift < 1 ? `brightness(${lerp(0.86, 1, lift)})` : 'none';
    bezel.style.opacity = lift;
    // His fingers stay in front of the screen while it is in his hand.
    fingers.style.transform = shot2.style.transform;
    fingers.style.filter = shot2.style.filter;
    fingers.style.opacity = x12 * (1 - seg(lift, 0, 0.1));
    dim.style.opacity = lift * 0.6 * (1 - seg(p, 0.88, 0.95));
    vignette.style.opacity = 1 - lift * 0.6 + seg(p, 0.88, 0.95) * 0.6;

    // Screens inside the phone: the path, a lesson started from it, then the scan of his bottle.
    const which = p < 0.655 ? 0 : p < 0.79 ? 1 : 2;
    screens.forEach((img, i) => img.classList.toggle('hs-on', i === which));
    tapAnim($('tapStart'), seg(p, 0.625, 0.652));

    // The lesson: pick the answer, check it, and the answer sheet rises with the why.
    const picked = p >= 0.70, checked = p >= 0.735;
    tapAnim($('tapOpt'), seg(p, 0.685, 0.705));
    tapAnim($('tapCheck'), seg(p, 0.718, 0.738));
    opts.forEach(o => {
      const right = o === optRight;
      o.classList.toggle('hs-on', picked && !checked && right);
      o.classList.toggle('hs-right', checked && right);
      o.classList.toggle('hs-faded', checked && !right);
    });
    checkBtn.classList.toggle('hs-ready', picked);
    lessonBar.style.width = checked ? '30%' : '24%';
    sheet.style.transform = `translateY(${105 * (1 - ease(seg(p, 0.735, 0.752)))}%)`;

    // Like a thumb scrolling the result: from his label photo down to why it tastes like this.
    scanScroll.style.transform = `translateY(${-400 * ease(seg(p, 0.81, 0.86))}px)`;

    // Beat 4: back to the table, the payoff.
    const e = seg(p, 0.885, 0.955);
    endshot.style.opacity = e;
    endshot.style.transform = reduce ? 'none' : `scale(${lerp(1.08, 1, ease(e))})`;
    shot2.style.visibility = e >= 1 ? 'hidden' : 'visible';

    // Copy.
    show($('hero'), 1 - seg(p, 0.015, 0.08), -24);
    show($('hint'), 1 - seg(p, 0, 0.02));
    show($('capA'), fade(p, 0.13, 0.17, 0.225, 0.255), 24);
    show($('capB'), fade(p, 0.35, 0.385, 0.435, 0.465), 24);
    show($('sideLearn'), fade(p, 0.545, 0.575, 0.63, 0.65), 24);
    show($('sideLesson'), fade(p, 0.665, 0.69, 0.765, 0.785), 24);
    show($('sideScan'), fade(p, 0.795, 0.82, 0.865, 0.885), 24);
    show($('end'), seg(p, 0.94, 0.98), 24);
    onStory();
  }

  let target = 0, current = 0, raf = 0;
  function progress() {
    const r = story.getBoundingClientRect();
    return clamp(-r.top / (story.offsetHeight - vh));
  }
  function tick() {
    current += (target - current) * (reduce || location.search.includes('still') ? 1 : 0.11);
    if (Math.abs(target - current) < 0.0002) current = target;
    render(current);
    raf = current !== target ? requestAnimationFrame(tick) : 0;
  }
  // ?still: draw the frame for this scroll position at once (for screenshots of single beats).
  const still = location.search.includes('still');
  function onScroll() {
    target = progress();
    if (still) { current = target; render(current); return; }
    if (!raf) raf = requestAnimationFrame(tick);
  }

  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { measure(); target = current = progress(); render(current); });
  measure(); target = current = progress(); render(current);
})();

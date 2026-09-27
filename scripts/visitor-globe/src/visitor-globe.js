// visitor-globe — a slowly rotating globe with a glowing dot per country that
// real visitors came from. Plain 2D canvas (no WebGL), one self-contained file,
// shared by winelingo.app, cardzo.app, chefgastonapp.com and egeskov-engineering.
//
// Markup (the host page owns all text and styling; the widget only fills numbers):
//   <div data-visitor-globe data-site="winelingo" data-theme="light"
//        data-endpoint="https://…/functions/v1/site-visitors"></div>
//   <span data-vg="visitors"></span> <span data-vg="active"></span> <span data-vg="countries"></span>
//   Elements with data-vg-when-active are hidden unless someone is on the site right now.
//
// Optional attributes: data-land / data-ocean / data-grid / data-dot / data-rim / data-halo (colours),
// data-demo (use built-in sample data, for previews only — never on a live page).
//
// Data contract (GET {endpoint}?site={site}):
//   { visitors: number, active: number, countries: [{ code: "DK", visitors: 12 }] }

import { geoOrthographic, geoPath, geoGraticule10, geoDistance } from "d3-geo";
import { feature } from "topojson-client";
import landTopo from "world-atlas/land-110m.json";
import CENTROIDS from "./centroids.json";

const land = feature(landTopo, landTopo.objects.land);
const graticule = geoGraticule10();
const sphere = { type: "Sphere" };

const THEMES = {
  // Winelingo: warm and light, burgundy leads, gold is a thin accent line.
  light: { ocean: "#FBF7F4", oceanEdge: "#F3ECE3", land: "#E9DCCF", grid: "rgba(123,30,59,0.07)", dot: "#7B1E3B", rim: "rgba(201,162,74,0.55)" },
  // The dark shell from the reference: graphite globe, gold dots.
  dark: { ocean: "#15141A", oceanEdge: "#0C0B10", land: "#2A2833", grid: "rgba(255,255,255,0.05)", dot: "#F5B321", rim: "rgba(245,179,33,0.45)", halo: "rgba(245,179,33,0.22)" },
};

const DEMO = {
  visitors: 1234, active: 3,
  countries: [
    { code: "DK", visitors: 420 }, { code: "US", visitors: 310 }, { code: "GB", visitors: 140 },
    { code: "DE", visitors: 90 }, { code: "SE", visitors: 60 }, { code: "BR", visitors: 25 },
    { code: "AU", visitors: 20 }, { code: "ES", visitors: 30 }, { code: "FR", visitors: 45 },
  ],
};

function hexToRgb(c) {
  const m = String(c).trim().match(/^#?([0-9a-f]{6})$/i);
  if (!m) return null;
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
const rgba = (c, a) => { const v = hexToRgb(c); return v ? `rgba(${v[0]},${v[1]},${v[2]},${a})` : c; };

function fill(root, data) {
  const lang = document.documentElement.lang || undefined;
  const fmt = (n) => Number(n || 0).toLocaleString(lang);
  const scope = root.closest("[data-visitor-globe-scope]") || document;
  for (const el of scope.querySelectorAll("[data-vg]")) {
    const k = el.getAttribute("data-vg");
    if (k === "visitors") el.textContent = fmt(data.visitors);
    else if (k === "active") el.textContent = fmt(data.active);
    else if (k === "countries") el.textContent = fmt(data.countries.length);
  }
  for (const el of scope.querySelectorAll("[data-vg-when-active]")) el.hidden = !(data.active > 0);
  scope.querySelectorAll("[data-vg-ready]").forEach((el) => el.setAttribute("data-vg-ready", "true"));
}

function mount(root) {
  const t = { ...(THEMES[root.dataset.theme] || THEMES.dark) };
  for (const k of ["land", "ocean", "grid", "dot", "rim", "halo"]) if (root.dataset[k]) t[k] = root.dataset[k];

  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText = "display:block;width:100%;height:100%;touch-action:pan-y;cursor:grab";
  root.appendChild(canvas);
  const ctx = canvas.getContext("2d");

  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const projection = geoOrthographic().clipAngle(90).precision(0.6);
  const path = geoPath(projection, ctx);
  let rot = [-10, -22, 0]; // start over the Atlantic, tilted to show the north
  let points = [];
  let size = 0, dpr = 1, visible = false, raf = 0, last = 0, dragging = null;

  function resize() {
    const r = root.getBoundingClientRect();
    size = Math.max(0, Math.min(r.width, r.height || r.width));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(size * dpr);
    canvas.height = Math.round(size * dpr);
    projection.translate([size / 2, size / 2]).scale(size / 2 - Math.max(6, size * (t.halo ? 0.07 : 0.03))); // room for the halo
    draw(performance.now());
  }

  function draw(now) {
    if (!size) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, size, size);
    projection.rotate(rot);
    const [cx, cy] = projection.translate(), r = projection.scale();

    // Ocean: a soft radial falloff so the sphere reads as round.
    const g = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.1, cx, cy, r);
    g.addColorStop(0, t.ocean); g.addColorStop(1, t.oceanEdge);
    if (t.halo) { ctx.save(); ctx.shadowColor = t.halo; ctx.shadowBlur = size * 0.07; ctx.beginPath(); path(sphere); ctx.fillStyle = t.oceanEdge; ctx.fill(); ctx.restore(); }
    ctx.beginPath(); path(sphere); ctx.fillStyle = g; ctx.fill();

    ctx.beginPath(); path(graticule); ctx.strokeStyle = t.grid; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); path(land); ctx.fillStyle = t.land; ctx.fill();

    // Dots: area ∝ visitors, a slow breathing glow, faded out toward the limb.
    const centre = [-rot[0], -rot[1]];
    const max = points.reduce((m, p) => Math.max(m, p.v), 1);
    ctx.save(); ctx.beginPath(); path(sphere); ctx.clip(); // glows near the limb stay on the globe
    for (const p of points) {
      const d = geoDistance(p.ll, centre);
      if (d > Math.PI / 2 - 0.02) continue;
      const [x, y] = projection(p.ll);
      const edge = Math.min(1, (Math.PI / 2 - d) / 0.35);
      const base = Math.max(2.2, Math.sqrt(p.v / max) * size * 0.022);
      const breathe = reduced ? 1 : 1 + 0.18 * Math.sin(now / 900 + p.phase);
      const glow = ctx.createRadialGradient(x, y, 0, x, y, base * 3.2 * breathe);
      glow.addColorStop(0, rgba(t.dot, 0.55 * edge)); glow.addColorStop(1, rgba(t.dot, 0));
      ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(x, y, base * 3.2 * breathe, 0, 2 * Math.PI); ctx.fill();
      ctx.fillStyle = rgba(t.dot, 0.95 * edge); ctx.beginPath(); ctx.arc(x, y, base, 0, 2 * Math.PI); ctx.fill();
    }

    ctx.restore();

    // Rim: a hairline in the accent colour.
    ctx.beginPath(); path(sphere); ctx.strokeStyle = t.rim; ctx.lineWidth = 1.2; ctx.stroke();
  }

  function frame(now) {
    const dt = Math.min(64, now - (last || now)); last = now;
    if (!dragging && !reduced) rot = [rot[0] + dt * 0.006, rot[1], 0]; // ~1 turn a minute
    draw(now);
    raf = visible && !document.hidden ? requestAnimationFrame(frame) : 0;
  }
  const start = () => { if (!raf && visible && !document.hidden) { last = 0; raf = requestAnimationFrame(frame); } };

  // Drag to spin (mouse and touch); vertical page scroll still works on phones.
  canvas.addEventListener("pointerdown", (e) => { dragging = { x: e.clientX, y: e.clientY, rot: rot.slice() }; canvas.setPointerCapture(e.pointerId); canvas.style.cursor = "grabbing"; });
  canvas.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const k = 180 / Math.max(1, projection.scale() * Math.PI);
    rot = [dragging.rot[0] + (e.clientX - dragging.x) * k, Math.max(-60, Math.min(60, dragging.rot[1] - (e.clientY - dragging.y) * k)), 0];
    if (reduced || !raf) draw(performance.now());
  });
  const end = () => { dragging = null; canvas.style.cursor = "grab"; };
  canvas.addEventListener("pointerup", end); canvas.addEventListener("pointercancel", end);

  new ResizeObserver(resize).observe(root);
  new IntersectionObserver(([e]) => { visible = e.isIntersecting; start(); }, { rootMargin: "100px" }).observe(root);
  document.addEventListener("visibilitychange", start);

  function setData(data) {
    points = (data.countries || [])
      .map((c) => ({ ll: CENTROIDS[String(c.code || "").toUpperCase()], v: Number(c.visitors) || 0 }))
      .filter((p) => p.ll && p.v > 0)
      .map((p, i) => ({ ...p, ll: [p.ll[1], p.ll[0]], phase: i * 1.7 })); // table is [lat, lng]
    // Reduced motion: no spin, so face the biggest audience instead of the Atlantic.
    if (reduced && points.length) { const top = points.reduce((a, b) => (b.v > a.v ? b : a)); rot = [-top.ll[0], -Math.max(-40, Math.min(40, top.ll[1])), 0]; }
    fill(root, { visitors: data.visitors || 0, active: data.active || 0, countries: points });
    draw(performance.now());
  }

  resize();
  if (root.hasAttribute("data-demo")) setData(DEMO);
  else if (root.dataset.endpoint && root.dataset.site) {
    fetch(`${root.dataset.endpoint}?site=${encodeURIComponent(root.dataset.site)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => d && setData(d))
      .catch(() => {}); // no data → a quiet, empty globe; the page stays intact
  }
}

function init() { document.querySelectorAll("[data-visitor-globe]").forEach((el) => { if (!el.__vg) { el.__vg = true; mount(el); } }); }
if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init); else init();
window.VisitorGlobe = { init };

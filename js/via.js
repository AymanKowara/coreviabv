/*
  Corevia – "Core + Via" motion
  · The route: one glowing line through every visible [data-node], drawn as you scroll.
  · Background: drifting contour lines and a glow that follows the head of the route.
  · Company motifs, counters, reveals and active navigation.
  Without JS or with reduced motion the page is complete and static.
*/
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";
  var main = document.getElementById("main");
  var svg = document.getElementById("route");
  var glowEl = document.getElementById("bg-glow");
  if (!main) return;
  // Colours come from the theme tokens in css/via.css.
  var css = getComputedStyle(document.documentElement);
  function tok(name, fallback) { var v = css.getPropertyValue(name).trim(); return v || fallback; }
  var ROUTE = tok("--route", "#e8ce99"), ROUTE_HEAD = tok("--route-head", "#fbf1dc"), ROUTE_FAINT = tok("--route-faint", "rgba(232,206,153,0.12)");
  var LINE_STRONG = tok("--contour-strong", "rgba(232,206,153,0.13)"), LINE_SOFT = tok("--contour-soft", "rgba(163,171,201,0.065)");
  // Lighter mode for slow devices or data saver: static background, no blur, motifs only while visible.
  var conn = navigator.connection || {};
  // iPhones always report 4 cores, so only genuinely weak devices (≤2 cores or ≤2 GB) and data saver count.
  var lowPower = !!conn.saveData || (navigator.hardwareConcurrency || 8) <= 2 || (navigator.deviceMemory || 8) <= 2;
  // Phones and tablets: keep every animation, but drop the effects that are expensive to repaint
  // (blurred glow along a page-tall line, blend-mode grain, background blur) and draw the background at 30 fps.
  var lite = lowPower || window.matchMedia("(pointer: coarse)").matches || window.innerWidth < 1024;
  if (lite) document.documentElement.classList.add("low-power");

  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }

  /* ---------------- Route ---------------- */
  var nodes = [], pts = [], base, glow, sharp, head, halo, total = 0, drawn = 0, H = 0;

  function visible(n) { return n.offsetWidth > 0 && n.offsetHeight > 0 && n.getClientRects().length > 0; } // ignores transforms, so a node mid-animation still counts

  var hero = document.querySelector(".hero"), heroDot = document.querySelector(".word .dot"), defs = document.querySelector(".defs");
  function fitHero() {
    if (!hero || !heroDot || !defs) return;
    hero.style.removeProperty("--dot-x"); hero.classList.remove("hero-narrow");
    if (window.innerWidth < 760) return;
    var x = heroDot.getBoundingClientRect().left - defs.getBoundingClientRect().left;
    if (x > 300) hero.style.setProperty("--dot-x", x + "px");
    hero.classList.toggle("hero-narrow", x > 300 && x < 500);
  }

  // Offset that reveal / entrance animations currently add to an element, so positions are measured
  // where things will rest, not where they are mid-animation.
  function animShift(e) {
    var dx = 0, dy = 0;
    for (; e && e !== main; e = e.parentElement) {
      if (!e.classList || !(e.classList.contains("reveal") || e.classList.contains("load"))) continue;
      var tf = getComputedStyle(e).transform;
      if (tf && tf !== "none") { try { var m = new DOMMatrixReadOnly(tf); dx += m.m41; dy += m.m42; } catch (err) { /* ignore */ } }
    }
    return { x: dx, y: dy };
  }

  var narrow = window.matchMedia("(max-width: 68rem)");

  function build() {
    fitHero();
    if (!svg) return;
    var mr = main.getBoundingClientRect();
    var W = main.clientWidth;
    H = main.scrollHeight;
    nodes = Array.prototype.slice.call(main.querySelectorAll("[data-node]")).filter(visible).filter(function (n) {
      // On narrow screens the line runs down the left rail through the card nodes; the animations below the cards stay off it.
      if (n.classList.contains("motif") && narrow.matches) return false;
      return true;
    });
    pts = nodes.map(function (n) {
      var r = n.getBoundingClientRect(), sh = animShift(n);
      return { x: r.left + r.width / 2 - mr.left - sh.x, y: r.top + r.height / 2 - mr.top - sh.y, el: n };
    }).sort(function (a, b) { return a.y - b.y; });
    nodes = pts.map(function (p) { return p.el; });

    svg.setAttribute("viewBox", "0 0 " + W + " " + H);
    svg.setAttribute("width", W);
    svg.setAttribute("height", H);
    svg.innerHTML = "";
    if (pts.length < 2) return;

    var defs = el("defs", {}, svg);
    var f = el("filter", { id: "route-blur", x: "-20%", y: "-5%", width: "140%", height: "110%" }, defs);
    el("feGaussianBlur", { stdDeviation: "5" }, f);
    var lg = el("linearGradient", { id: "route-grad", x1: "0", y1: "0", x2: "0", y2: String(H), gradientUnits: "userSpaceOnUse" }, defs);
    // Gold everywhere; the line takes a company's colour only around that company's stop.
    var stops = [[0, ROUTE]], COL = { m: ROUTE, t: ROUTE, p: ROUTE };
    pts.forEach(function (p) {
      var key = p.el.getAttribute("data-node"), c = COL[key] || COL[(key || "").charAt(0) + ""];
      if (!/^(m|t|p)(-sm)?$/.test(key || "")) return;
      c = COL[key.charAt(0)];
      stops.push([Math.max(0, (p.y - 320) / H), ROUTE], [p.y / H, c], [Math.min(1, (p.y + 260) / H), ROUTE]);
    });
    stops.push([1, ROUTE]);
    stops.sort(function (a, b) { return a[0] - b[0]; }).forEach(function (s) {
      el("stop", { offset: s[0].toFixed(4), "stop-color": s[1] }, lg);
    });

    // Route. Each leg leaves a node straight down and turns into the next one with two round, even bends.
    // Every candidate curve is tested against the text and controls on the page, and the widest curve
    // that touches nothing wins, so the line never runs over words.
    var obs = [];
    (function collect() {
      var tw = document.createTreeWalker(main, NodeFilter.SHOW_TEXT), t, rg = document.createRange();
      while ((t = tw.nextNode())) {
        if (!t.textContent.trim()) continue;
        var pe = t.parentElement;
        if (!pe || pe.closest("svg, .motif, [hidden], .sr-only, .skip-link, .word")) continue; // the line starts inside CORE•via by design
        rg.selectNodeContents(t);
        var rs = rg.getClientRects(), sh = animShift(pe);
        for (var q = 0; q < rs.length; q++) if (rs[q].width > 0) obs.push(box(rs[q], sh));
      }
      main.querySelectorAll(".btn, .pick, input, textarea, select, .pkg, .who, .k").forEach(function (e) {
        var r = e.getBoundingClientRect(); if (r.width) obs.push(box(r, animShift(e)));
      });
      // Pseudo-element rules beside labels (".k::before") are not text, so pad text boxes generously.
      function box(r, sh) { return { l: r.left - mr.left - sh.x - 10, r: r.right - mr.left - sh.x + 10, t: r.top - mr.top - sh.y - 8, b: r.bottom - mr.top - sh.y + 8 }; }
    })();
    function hitsVertical(x, y0, y1, list) {
      var n = 0;
      for (var k = 0; k < list.length; k++) { var o = list[k]; if (x > o.l && x < o.r && y1 > o.t && y0 < o.b) n += 1 + (Math.min(y1, o.b) - Math.max(y0, o.t)) / 20; }
      return n;
    }
    function cubic(p0, p1, p2, p3, u) { var v = 1 - u; return v * v * v * p0 + 3 * v * v * u * p1 + 3 * v * u * u * p2 + u * u * u * p3; }
    // A leg: straight down, a round quarter-turn, a level run, a second quarter-turn, straight down.
    // Both turns are true circular arcs of radius r, so every bend has the same, even shape.
    var KAPPA = 0.5523;
    function legShape(a, b, g, r) {
      var s = b.x > a.x ? 1 : -1;
      r = Math.min(r, Math.abs(b.x - a.x) / 2);
      return {
        r: r, y1: g - r, y2: g + r,
        arc1: [a.x, g - r, a.x, g - r + KAPPA * r, a.x + s * r * (1 - KAPPA), g, a.x + s * r, g],
        arc2: [b.x - s * r, g, b.x - s * r * (1 - KAPPA), g, b.x, g + r * (1 - KAPPA), b.x, g + r]
      };
    }
    function hitPoint(x, y, list) {
      for (var k = 0; k < list.length; k++) { var o = list[k]; if (x > o.l && x < o.r && y > o.t && y < o.b) return 1; }
      return 0;
    }
    function legCost(a, b, g, r, list) {
      var L = legShape(a, b, g, r), n = hitsVertical(a.x, a.y + 6, L.y1, list) + hitsVertical(b.x, L.y2, b.y - 6, list);
      [L.arc1, L.arc2].forEach(function (c) {
        for (var u = 0; u <= 1.0001; u += 1 / 16) n += hitPoint(cubic(c[0], c[2], c[4], c[6], u), cubic(c[1], c[3], c[5], c[7], u), list);
      });
      var x0 = Math.min(L.arc1[6], L.arc2[0]), x1 = Math.max(L.arc1[6], L.arc2[0]);
      for (var k = 0; k < list.length; k++) { var o = list[k]; if (g > o.t && g < o.b && x1 > o.l && x0 < o.r) n += 1 + (Math.min(x1, o.r) - Math.max(x0, o.l)) / 20; }
      return n;
    }
    function gapY(a, b) {
      var host = b.el.closest(".stop, .section, .routes, .together") || b.el.parentNode;
      var hr = host.getBoundingClientRect(), top = hr.top - mr.top;
      var pad = parseFloat(getComputedStyle(host).paddingTop) || 0;
      var g = top + Math.min(pad * 0.5, 90);
      if (g <= a.y + 30 || g >= b.y - 30) g = (a.y + b.y) / 2;
      return g;
    }
    function bestLeg(a, b) {
      var list = obs.filter(function (o) { return o.b > a.y - 10 && o.t < b.y + 10; });
      var dx = Math.abs(b.x - a.x), g0 = gapY(a, b), best = null;
      for (var g = a.y + 14; g <= b.y - 14; g += 8) {
        var rmax = Math.min(150, dx / 2, g - a.y, b.y - g);
        if (rmax < 12) continue;
        [1, 0.8, 0.62, 0.46, 0.32].forEach(function (f) {
          var r = Math.max(12, rmax * f), c = legCost(a, b, g, r, list);
          // Fewest collisions first, then the roundest turn, then close to the natural gap above the next block.
          var score = c * 100000 - r * 1.5 - Math.abs(g - g0) * 0.05;
          if (!best || score < best.score) best = { g: g, h: r, hits: c, score: score };
        });
      }
      return best || { g: (a.y + b.y) / 2, h: Math.max(10, Math.min(dx * 0.5, (b.y - a.y) / 2)), hits: 1 };
    }
    function f1(v) { return v.toFixed(1); }
    var legs = [];
    for (var i = 1; i < pts.length; i++) legs.push(Math.abs(pts[i].x - pts[i - 1].x) < 2 ? null : bestLeg(pts[i - 1], pts[i]));
    // If the opening leg from the CORE•via dot cannot avoid the text (narrow layouts), start at the next stop instead.
    if (pts.length > 2 && pts[0].el.getAttribute("data-node") === "hero" && legs[0] && legs[0].hits > 0) { pts.shift(); legs.shift(); nodes.shift(); }
    // The path is kept as a list of segments too, so positions along it can be sampled without the DOM.
    var segs = [], cx = pts[0].x, cy = pts[0].y;
    function lineTo(x, y) { segs.push([cx, cy, cx, cy, x, y, x, y]); cx = x; cy = y; return " L" + f1(x) + " " + f1(y); }
    function curveTo(c) { segs.push(c.slice()); cx = c[6]; cy = c[7]; return " C" + f1(c[2]) + " " + f1(c[3]) + " " + f1(c[4]) + " " + f1(c[5]) + " " + f1(c[6]) + " " + f1(c[7]); }
    var d = "M" + f1(pts[0].x) + " " + f1(pts[0].y);
    for (i = 1; i < pts.length; i++) {
      var a = pts[i - 1], b = pts[i], L = legs[i - 1];
      if (!L) { d += lineTo(b.x, b.y); continue; }
      var S = legShape(a, b, L.g, L.h);
      if (S.y1 > a.y + 1) d += lineTo(a.x, S.y1);
      d += curveTo(S.arc1);
      d += lineTo(S.arc2[0], S.arc2[1]);
      d += curveTo(S.arc2);
      if (S.y2 < b.y - 1) d += lineTo(b.x, b.y);
    }
    base = el("path", { d: d, fill: "none", stroke: ROUTE_FAINT, "stroke-width": "1", "stroke-dasharray": "2 6" }, svg);
    glow = el("path", lite
      ? { d: d, fill: "none", stroke: "url(#route-grad)", "stroke-width": "4", "stroke-linecap": "round", opacity: "0.25" }
      : { d: d, fill: "none", stroke: "url(#route-grad)", "stroke-width": "6", "stroke-linecap": "round", opacity: "0.55", filter: "url(#route-blur)" }, svg);
    sharp = el("path", { d: d, fill: "none", stroke: "url(#route-grad)", "stroke-width": "1.6", "stroke-linecap": "round" }, svg);
    total = sharp.getTotalLength();
    // Sample the path once; every frame then reads positions from this table instead of asking the
    // browser for points on a long path (slow on phones, especially Safari).
    // Dense polyline along the segments, then resampled at equal steps of the browser's own total length.
    var PX = [pts[0].x], PY = [pts[0].y], PL = [0], acc = 0;
    segs.forEach(function (c) {
      var m = c[0] === c[2] && c[1] === c[3] && c[4] === c[6] && c[5] === c[7] ? 1 : 24;
      for (var u = 1; u <= m; u++) {
        var x = cubic(c[0], c[2], c[4], c[6], u / m), y = cubic(c[1], c[3], c[5], c[7], u / m);
        acc += Math.hypot(x - PX[PX.length - 1], y - PY[PY.length - 1]); PX.push(x); PY.push(y); PL.push(acc);
      }
    });
    var scale = acc > 0 ? total / acc : 1, n = Math.max(2, Math.ceil(total / 4)), step = total / (n - 1);
    TX = new Float32Array(n); TY = new Float32Array(n); TSTEP = step;
    for (var q = 0, j = 0; q < n; q++) {
      var want = q * step / scale;
      while (j < PL.length - 2 && PL[j + 1] < want) j++;
      var span = PL[j + 1] - PL[j], f = span > 0 ? (want - PL[j]) / span : 0; f = Math.max(0, Math.min(1, f));
      TX[q] = PX[j] + (PX[j + 1] - PX[j]) * f; TY[q] = PY[j] + (PY[j + 1] - PY[j]) * f;
    }
    snap = built; built = true; lastDrawn = -1; // after a rebuild (rotation, resize) jump straight to the scroll position instead of redrawing
    [glow, sharp].forEach(function (p) { p.style.strokeDasharray = total; p.style.strokeDashoffset = total - drawn; });
    halo = el("circle", lite ? { r: "9", fill: ROUTE, opacity: "0.22" } : { r: "14", fill: ROUTE, opacity: "0.18", filter: "url(#route-blur)" }, svg);
    head = el("circle", { r: "4", fill: ROUTE_HEAD }, svg);
    if (reduce) { drawn = total; }
  }

  var TX = null, TY = null, TSTEP = 1, snap = false, built = false, lastDrawn = -1;
  // Length along the path whose point sits at document y (the path only moves downward).
  function lengthAtY(y) {
    var lo = 0, hi = TY.length - 1;
    if (y <= TY[0]) return 0;
    if (y >= TY[hi]) return total;
    while (hi - lo > 1) { var mid = (lo + hi) >> 1; if (TY[mid] < y) lo = mid; else hi = mid; }
    var dy = TY[hi] - TY[lo], f = dy > 0 ? (y - TY[lo]) / dy : 0;
    return (lo + f) * TSTEP;
  }
  function pointAt(len) {
    var u = Math.max(0, Math.min(TX.length - 1, len / TSTEP)), i = Math.floor(u), j = Math.min(TX.length - 1, i + 1), f = u - i;
    return { x: TX[i] + (TX[j] - TX[i]) * f, y: TY[i] + (TY[j] - TY[i]) * f };
  }

  var rebuildTimer = null;
  function rebuildSoon(ms) { clearTimeout(rebuildTimer); rebuildTimer = setTimeout(build, ms || 120); }
  window.addEventListener("resize", function () { rebuildSoon(150); });
  document.addEventListener("corevia:lang", function () { rebuildSoon(320); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { rebuildSoon(0); });
  // Rebuild only when the page really changes size (not on every small reflow).
  var lastW = 0, lastH = 0;
  if ("ResizeObserver" in window) new ResizeObserver(function () {
    var w = main.clientWidth, h = main.scrollHeight;
    if (Math.abs(w - lastW) < 2 && Math.abs(h - lastH) < 4) return;
    lastW = w; lastH = h; rebuildSoon(200);
  }).observe(main);
  build();

  /* ---------------- Background contour lines ---------------- */
  var cv = document.getElementById("bg-lines"), ctx = cv ? cv.getContext("2d") : null, CW = 0, CH = 0;
  function sizeBg() {
    if (!cv) return;
    var dpr = Math.min(window.devicePixelRatio || 1, lite ? 1 : 1.5);
    CW = cv.clientWidth; CH = cv.clientHeight;
    cv.width = CW * dpr; cv.height = CH * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", sizeBg); sizeBg();
  function drawBg(t) {
    if (!ctx) return;
    ctx.clearRect(0, 0, CW, CH);
    var n = 26, gap = CH / (n - 6), shift = (window.scrollY * 0.06) % gap;
    for (var i = -3; i < n; i++) {
      var y0 = i * gap - shift, strong = (i + 100) % 5 === 0;
      ctx.beginPath();
      for (var x = -20; x <= CW + 20; x += 18) {
        var y = y0
          + Math.sin(x * 0.0021 + t * 0.00006 + i * 0.55) * 26
          + Math.sin(x * 0.0007 - t * 0.00004 + i * 0.21) * 48
          + Math.sin(x * 0.0051 + i) * 5;
        if (x === -20) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = strong ? LINE_STRONG : LINE_SOFT;
      ctx.lineWidth = strong ? 1 : 0.8;
      ctx.stroke();
    }
  }

  /* ---------------- Motifs ---------------- */
  var dash = document.getElementById("m-dash"), truck = document.getElementById("m-truck");
  // Talentra: a team assembling around the centre, one person placed at a time.
  var teams = Array.prototype.slice.call(document.querySelectorAll(".t-team")).map(function (sv) {
    var people = [], N = 6, R = 92;
    var hub = el("circle", { r: "7", fill: ROUTE }, null);
    for (var i = 0; i < N; i++) {
      var ang = -Math.PI / 2 + Math.PI / N + i * (Math.PI * 2 / N), x = Math.cos(ang) * R, y = Math.sin(ang) * R;
      var len = R - 26;
      var link = el("line", { x1: (Math.cos(ang) * 12).toFixed(1), y1: (Math.sin(ang) * 12).toFixed(1), x2: (Math.cos(ang) * (R - 14)).toFixed(1), y2: (Math.sin(ang) * (R - 14)).toFixed(1), stroke: ROUTE, "stroke-width": "1.2", "stroke-linecap": "round", "stroke-dasharray": len + " " + len, "stroke-dashoffset": len }, sv);
      var ghost = el("circle", { cx: x.toFixed(1), cy: y.toFixed(1), r: "24", fill: "none", stroke: ROUTE, "stroke-width": "0.8", "stroke-dasharray": "2 4", opacity: "0.35" }, sv);
      var g = el("g", { transform: "translate(" + x.toFixed(1) + " " + y.toFixed(1) + ")", opacity: "0.18" }, sv);
      el("circle", { cx: "0", cy: "-7", r: "6.5", fill: "none", stroke: ROUTE, "stroke-width": "1.4" }, g);
      el("path", { d: "M-12 13 C-12 2 12 2 12 13", fill: "none", stroke: ROUTE, "stroke-width": "1.4", "stroke-linecap": "round" }, g);
      var spark = el("circle", { r: "2.6", fill: ROUTE_HEAD, opacity: "0" }, sv);
      people.push({ link: link, g: g, ghost: ghost, spark: spark, len: len, ang: ang });
    }
    sv.appendChild(hub);
    var ring = el("circle", { r: "16", fill: "none", stroke: ROUTE, "stroke-width": "1", opacity: "0.4" }, sv);
    var count = el("text", { x: "118", y: "126", "text-anchor": "end", class: "m-label" }, sv);
    return { people: people, hub: hub, ring: ring, count: count, R: R };
  });

  // Promovia: campaign results climbing — bars grow, the trend line draws itself, the newest lead pulses.
  var growths = Array.prototype.slice.call(document.querySelectorAll(".p-growth")).map(function (sv) {
    var X0 = -104, X1 = 104, Y0 = 96, n = 7, H = [0.22, 0.3, 0.27, 0.42, 0.5, 0.66, 0.86];
    for (var r = 0; r < 5; r++) el("line", { x1: X0, x2: X1, y1: (Y0 - r * 46).toFixed(1), y2: (Y0 - r * 46).toFixed(1), stroke: ROUTE, "stroke-width": "0.6", opacity: r ? "0.12" : "0.35" }, sv);
    var bw = (X1 - X0) / n, bars = [], pts2 = [];
    for (var i = 0; i < n; i++) {
      var cx = X0 + bw * (i + 0.5), top = Y0 - H[i] * 190;
      bars.push({ el: el("rect", { x: (cx - bw * 0.28).toFixed(1), width: (bw * 0.56).toFixed(1), y: String(Y0), height: "0", rx: "2", fill: ROUTE, opacity: "0.16" }, sv), top: top });
      pts2.push([cx, top - 14]);
    }
    var dd = "M" + pts2[0][0].toFixed(1) + " " + pts2[0][1].toFixed(1);
    for (var j = 1; j < n; j++) {
      var p0 = pts2[j - 1], p1 = pts2[j], mx = (p0[0] + p1[0]) / 2;
      dd += " C" + mx.toFixed(1) + " " + p0[1].toFixed(1) + " " + mx.toFixed(1) + " " + p1[1].toFixed(1) + " " + p1[0].toFixed(1) + " " + p1[1].toFixed(1);
    }
    var line = el("path", { d: dd, fill: "none", stroke: ROUTE, "stroke-width": "1.8", "stroke-linecap": "round" }, sv);
    var L = line.getTotalLength ? line.getTotalLength() : 300;
    line.setAttribute("stroke-dasharray", L + " " + L);
    var dot = el("circle", { r: "4.5", fill: ROUTE_HEAD }, sv);
    var rip = el("circle", { r: "6", fill: "none", stroke: ROUTE, "stroke-width": "1.2", opacity: "0" }, sv);
    // Platform names sit top-left in two lines, clear of the route that runs through the centre.
    [["GOOGLE · META", -118], ["LINKEDIN · TIKTOK", -102]].forEach(function (l) {
      el("text", { x: "-124", y: String(l[1]), class: "m-label", style: "font-size:9px;letter-spacing:.6px" }, sv).textContent = l[0];
    });
    return { bars: bars, line: line, L: L, dot: dot, rip: rip, Y0: Y0 };
  });

  var motifsVisible = true;
  var motifEls = document.querySelectorAll(".motif");
  if ("IntersectionObserver" in window && motifEls.length) {
    var seen = new Set();
    var mio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) seen.add(en.target); else seen.delete(en.target); });
      motifsVisible = seen.size > 0;
    });
    motifEls.forEach(function (m) { mio.observe(m); });
  }

  function animateMotifs(t) {
    if (!motifsVisible) return;
    if (dash) dash.setAttribute("stroke-dashoffset", String((-t * 0.05) % 24));
    if (truck) truck.setAttribute("transform", "translate(0 " + (Math.sin(t * 0.0009) * 95).toFixed(1) + ")");
    teams.forEach(function (T) {
      var N = T.people.length, cyc = reduce ? N + 2 : (t / 1000 / 0.9) % (N + 3.5); // one person every 0.9 s, then a pause
      var placed = 0;
      T.people.forEach(function (p, i) {
        var k = Math.max(0, Math.min(1, cyc - i)), e = 1 - Math.pow(1 - k, 3);
        if (cyc > N + 2.8 && !reduce) e = Math.max(0, 1 - (cyc - N - 2.8) / 0.7); // fade out before the next round
        p.link.setAttribute("stroke-dashoffset", (p.len * (1 - e)).toFixed(1));
        p.g.setAttribute("opacity", (0.18 + 0.82 * e).toFixed(2));
        p.ghost.setAttribute("opacity", (0.35 * (1 - e)).toFixed(2));
        var sp = k > 0 && k < 1 ? k : 0;
        p.spark.setAttribute("opacity", sp ? "1" : "0");
        p.spark.setAttribute("cx", (Math.cos(p.ang) * (12 + p.len * sp)).toFixed(1));
        p.spark.setAttribute("cy", (Math.sin(p.ang) * (12 + p.len * sp)).toFixed(1));
        if (e > 0.98) placed++;
      });
      var br = (t * 0.0012) % 1;
      T.ring.setAttribute("r", (10 + br * 30).toFixed(1));
      T.ring.setAttribute("opacity", reduce ? "0" : ((1 - br) * 0.45).toFixed(2));
      T.count.textContent = placed + " / " + N;
    });
    growths.forEach(function (G) {
      var c = reduce ? 4.2 : (t / 1000) % 6.4, p = Math.min(1, c / 3.4), e = 1 - Math.pow(1 - p, 3);
      var fade = c > 5.8 ? Math.max(0, 1 - (c - 5.8) / 0.6) : 1;
      G.bars.forEach(function (b, i) {
        var k = Math.max(0, Math.min(1, (e * G.bars.length - i))), h = (G.Y0 - b.top) * k * fade;
        b.el.setAttribute("y", (G.Y0 - h).toFixed(1)); b.el.setAttribute("height", h.toFixed(1));
        b.el.setAttribute("opacity", (0.12 + 0.2 * k).toFixed(2));
      });
      G.line.setAttribute("stroke-dashoffset", (G.L * (1 - e * fade)).toFixed(1));
      var pt = G.line.getPointAtLength(Math.max(0.01, G.L * e * fade));
      G.dot.setAttribute("cx", pt.x.toFixed(1)); G.dot.setAttribute("cy", pt.y.toFixed(1));
      G.rip.setAttribute("cx", pt.x.toFixed(1)); G.rip.setAttribute("cy", pt.y.toFixed(1));
      var rp = p >= 1 && !reduce ? ((c - 3.4) / 1.2) % 1 : 0;
      G.rip.setAttribute("r", (6 + rp * 26).toFixed(1));
      G.rip.setAttribute("opacity", rp ? ((1 - rp) * 0.8 * fade).toFixed(2) : "0");
    });
  }

  /* ---------------- Frame ---------------- */
  var lastBgY = -1, lastT = 0, frameNo = 0, lastGX = null, lastGY = null;
  function frame(t) {
    t = t || 0;
    if (document.hidden) { requestAnimationFrame(frame); return; }
    var dt = lastT ? Math.min(100, t - lastT) : 16.7; lastT = t;
    if (sharp && total && TY) {
      var mr = main.getBoundingClientRect();
      var target = reduce ? total : lengthAtY(window.innerHeight * 0.58 - mr.top);
      // Same easing speed at 30, 60 or 120 frames per second.
      if (snap || reduce) { drawn = target; snap = false; }
      else drawn += (target - drawn) * (1 - Math.pow(0.88, dt / 16.7));
      var moved = Math.abs(drawn - lastDrawn) >= 0.25;
      if (!moved) drawn = lastDrawn;
      var pt = pointAt(Math.max(0, drawn));
      if (moved) {
        // Only touch the DOM while the line is actually moving.
        lastDrawn = drawn;
        var off = Math.max(0, total - drawn);
        sharp.style.strokeDashoffset = off; glow.style.strokeDashoffset = off;
        head.setAttribute("cx", pt.x); head.setAttribute("cy", pt.y);
        halo.setAttribute("cx", pt.x); halo.setAttribute("cy", pt.y);
        for (var i = 0; i < pts.length; i++) pts[i].el.classList.toggle("lit", pts[i].y <= pt.y + 2);
      }
      if (glowEl) {
        var gx = Math.round(pt.x + mr.left), gy = Math.round(pt.y + mr.top);
        if (gx !== lastGX || gy !== lastGY) {
          lastGX = gx; lastGY = gy;
          glowEl.style.setProperty("--gx", gx + "px");
          glowEl.style.setProperty("--gy", gy + "px");
        }
      }
    }
    if (!reduce) {
      if (!lowPower) { if (!lite || (frameNo++ & 1) === 0) drawBg(t); }
      else if (window.scrollY !== lastBgY) { lastBgY = window.scrollY; drawBg(0); }
      animateMotifs(t);
    }
    requestAnimationFrame(frame);
  }
  if (reduce) { drawBg(0); animateMotifs(0); }
  requestAnimationFrame(frame);

  /* ---------------- Counters ---------------- */
  function fmt(v, dec) {
    try { return new Intl.NumberFormat(document.documentElement.lang || "en", { minimumFractionDigits: dec, maximumFractionDigits: dec }).format(v); }
    catch (e) { return v.toFixed(dec); }
  }
  var counters = Array.prototype.slice.call(document.querySelectorAll("[data-count]"));
  function finalOf(c) { c.textContent = fmt(parseFloat(c.getAttribute("data-count")), parseInt(c.getAttribute("data-decimals") || "0", 10)); c.setAttribute("data-done", "1"); }
  function count(c) {
    if (c.getAttribute("data-done") || c.getAttribute("data-run")) return;
    if (reduce) return finalOf(c);
    var to = parseFloat(c.getAttribute("data-count")), from = parseFloat(c.getAttribute("data-from") || "0"), dec = parseInt(c.getAttribute("data-decimals") || "0", 10);
    var start = null, dur = to > 1000 ? 2200 : 1600;
    c.setAttribute("data-run", "1");
    (function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / dur), e = 1 - Math.pow(1 - p, 4);
      c.textContent = fmt(from + (to - from) * e, dec);
      if (p < 1) requestAnimationFrame(step); else { c.removeAttribute("data-run"); finalOf(c); }
    })(performance.now());
  }
  document.addEventListener("corevia:lang", function () { counters.forEach(function (c) { if (c.getAttribute("data-done")) finalOf(c); }); });

  /* ---------------- Reveal + counters on view ---------------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduce) {
    counters.forEach(function (c) { c.textContent = fmt(parseFloat(c.getAttribute("data-from") || "0"), parseInt(c.getAttribute("data-decimals") || "0", 10)); });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add("is-in");
        en.target.querySelectorAll("[data-count]").forEach(function (c) { setTimeout(function () { count(c); }, 250); });
        io.unobserve(en.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    reveals.forEach(function (r) { io.observe(r); });
  } else {
    reveals.forEach(function (r) { r.classList.add("is-in"); });
    counters.forEach(finalOf);
  }

  /* ---------------- Active nav ---------------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".primary-nav a[href^='#']"));
  if ("IntersectionObserver" in window && links.length) {
    var map = {};
    links.forEach(function (a) { var s = document.querySelector(a.getAttribute("href")); if (s) map[s.id] = a; });
    var nio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        links.forEach(function (a) { a.removeAttribute("aria-current"); });
        if (map[en.target.id]) map[en.target.id].setAttribute("aria-current", "true");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    Object.keys(map).forEach(function (id) { nio.observe(document.getElementById(id)); });
  }
})();

/*
  Corevia – site features shared by every page
  · Metro bar · request picker · Netherlands map
  · WhatsApp button · SEO tags per language · subject from the URL · Talentra jobs
*/
(function () {
  "use strict";

  var root = document.documentElement;
  var I18N = window.COREVIA_I18N || {};
  var CONFIG = window.COREVIA_CONFIG || {};
  var LANGS = ["en", "nl", "de", "fr", "es", "it", "pl"];
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var NS = "http://www.w3.org/2000/svg";

  function lang() { return root.lang || "en"; }
  function t(key) {
    var d = I18N[lang()] || {}, v = d[key];
    if (v === undefined && I18N.en) v = I18N.en[key];
    return v || "";
  }
  function el(tag, attrs, parent) {
    var e = document.createElementNS(NS, tag);
    for (var k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  }
  function onLang(fn) { document.addEventListener("corevia:lang", fn); }

  /* ---------------- Metro bar ---------------- */
  var metro = document.getElementById("metro");
  if (metro) {
    var stations = Array.prototype.slice.call(metro.querySelectorAll("a[data-target]")).map(function (a) {
      return { a: a, li: a.parentNode, el: document.getElementById(a.getAttribute("data-target")) };
    }).filter(function (s) { return s.el; });
    var place = function () {
      var max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      stations.forEach(function (s) {
        var top = s.el.id === "top" ? 0 : s.el.getBoundingClientRect().top + scrollY - innerHeight * 0.35;
        s.at = Math.max(0, Math.min(max, top));
        s.li.style.setProperty("--x", (s.at / max * 100).toFixed(2) + "%");
      });
    };
    var tick = function () {
      var max = Math.max(1, document.documentElement.scrollHeight - innerHeight);
      metro.style.setProperty("--mp", (scrollY / max).toFixed(4));
      var current = null;
      stations.forEach(function (s) { var passed = scrollY + 2 >= s.at; s.a.classList.toggle("passed", passed); if (passed) current = s; });
      stations.forEach(function (s) { if (s === current) s.a.setAttribute("aria-current", "true"); else s.a.removeAttribute("aria-current"); });
    };
    place(); tick();
    addEventListener("scroll", function () { requestAnimationFrame(tick); }, { passive: true });
    addEventListener("resize", function () { place(); tick(); });
    onLang(function () { setTimeout(function () { place(); tick(); }, 350); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { place(); tick(); });
    if ("ResizeObserver" in window) new ResizeObserver(function () { place(); tick(); }).observe(document.body);
  }

  /* ---------------- Request picker ---------------- */
  var picks = Array.prototype.slice.call(document.querySelectorAll(".pick"));
  var out = document.getElementById("needs-out"), go = document.getElementById("needs-go");
  var NAMES = { moventra: "Moventra", talentra: "Talentra", promovia: "Promovia" };
  function chosen() { return picks.filter(function (p) { return p.getAttribute("aria-pressed") === "true"; }).map(function (p) { return p.getAttribute("data-need"); }); }
  function renderNeeds() {
    if (!out) return;
    var c = chosen();
    ["moventra", "talentra", "promovia"].forEach(function (k) {
      var on = c.indexOf(k) !== -1, key = k.charAt(0);
      document.querySelectorAll(".nl-" + key + ", .ns-" + key).forEach(function (n) { n.classList.toggle("on", on); });
    });
    out.removeAttribute("data-i18n");
    if (!c.length) out.textContent = t("needs.none");
    else if (c.length === 1) out.innerHTML = t("needs.one").replace("{name}", "<b>" + NAMES[c[0]] + "</b>");
    else out.innerHTML = t("needs.many").replace("{n}", "<b>" + c.length + "</b>");
    go.disabled = !c.length;
  }
  picks.forEach(function (p) {
    p.addEventListener("click", function () {
      p.setAttribute("aria-pressed", p.getAttribute("aria-pressed") === "true" ? "false" : "true");
      renderNeeds();
    });
  });
  if (go) {
    go.addEventListener("click", function () {
      var c = chosen(); if (!c.length) return;
      var select = document.getElementById("f-subject"), msg = document.getElementById("f-message");
      if (select) select.value = c.length === 1 ? c[0] : "clients";
      if (msg && !msg.value.trim()) {
        var labels = c.map(function (k) { return "– " + t("needs." + k.charAt(0)) + " (" + NAMES[k] + ")"; });
        msg.value = t("needs.msg") + "\n" + labels.join("\n") + "\n\n";
      }
      var form = document.getElementById("contact-form");
      if (form) form.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      setTimeout(function () { var n = document.getElementById("f-name"); if (n) n.focus({ preventScroll: true }); }, reduce ? 0 : 600);
    });
    renderNeeds();
    onLang(renderNeeds);
  }

  /* ---------------- Netherlands map ---------------- */
  var map = document.getElementById("nl-svg");
  if (map) {
    var P = function (lon, lat) { return [((lon - 3.25) * 0.616 * 150 + 12), ((53.58 - lat) * 150 + 12)]; };
    var outline = [[3.37, 51.37], [3.53, 51.27], [3.84, 51.21], [4.23, 51.36], [4.38, 51.44], [4.55, 51.43], [4.77, 51.5], [5.05, 51.47], [5.22, 51.32], [5.47, 51.29], [5.68, 51.18], [5.85, 51.14], [5.75, 50.97], [5.68, 50.76], [5.89, 50.76], [6.03, 50.84], [6.08, 50.95], [5.9, 51.03], [6.17, 51.17], [6.08, 51.3], [6.22, 51.39], [6.21, 51.52], [5.96, 51.73], [6.17, 51.87], [6.4, 51.83], [6.72, 51.9], [6.83, 52.0], [6.7, 52.07], [7.06, 52.24], [7.03, 52.41], [6.7, 52.48], [7.0, 52.63], [7.07, 52.85], [7.21, 53.0], [7.2, 53.24], [6.98, 53.33], [6.75, 53.46], [6.2, 53.41], [5.6, 53.4], [5.42, 53.17], [5.39, 53.08], [5.03, 52.93], [4.76, 52.96], [4.66, 52.7], [4.57, 52.47], [4.4, 52.21], [4.2, 52.06], [4.03, 51.98], [3.85, 51.83], [3.7, 51.7], [3.44, 51.54], [3.58, 51.44]];
    var water = [[[5.03, 52.93], [5.39, 53.08], [5.62, 52.9], [5.62, 52.75], [5.45, 52.62], [5.2, 52.62], [5.05, 52.72]]];
    var islands = [[[4.73, 53.02], [4.86, 53.18], [4.91, 53.1], [4.8, 53.0]], [[5.2, 53.38], [5.58, 53.45], [5.6, 53.41], [5.25, 53.36]], [[5.65, 53.45], [5.92, 53.47], [5.9, 53.43], [5.66, 53.43]], [[6.12, 53.48], [6.32, 53.5], [6.3, 53.46], [6.14, 53.46]]];
    var d = outline.map(function (c, i) { var p = P(c[0], c[1]); return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ") + "Z";
    for (var gx = 0; gx <= 400; gx += 40) el("line", { x1: gx, y1: 0, x2: gx, y2: 470, class: "nl-grid" }, map);
    for (var gy = 0; gy <= 470; gy += 40) el("line", { x1: 0, y1: gy, x2: 400, y2: gy, class: "nl-grid" }, map);
    el("path", { d: d, class: "nl-land" }, map);
    var poly = function (pts) { return pts.map(function (c, i) { var p = P(c[0], c[1]); return (i ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ") + "Z"; };
    islands.forEach(function (w) { el("path", { d: poly(w), class: "nl-land" }, map); });
    var C = {
      Amsterdam: [4.9, 52.37, 1], Schiphol: [4.76, 52.31, 1], Rotterdam: [4.48, 51.92, 1], "Den Haag": [4.3, 52.08], Utrecht: [5.12, 52.09],
      Eindhoven: [5.47, 51.44], Venlo: [6.17, 51.37], Arnhem: [5.9, 51.98], Zwolle: [6.08, 52.51], Groningen: [6.57, 53.22]
    };
    var roads = [["Amsterdam", "Schiphol", "Den Haag", "Rotterdam"], ["Amsterdam", "Utrecht", "Eindhoven", "Venlo"], ["Utrecht", "Arnhem"], ["Rotterdam", "Utrecht"], ["Amsterdam", "Zwolle", "Groningen"]];
    roads.forEach(function (r, i) {
      var pd = r.map(function (n, j) { var p = P(C[n][0], C[n][1]); return (j ? "L" : "M") + p[0].toFixed(1) + " " + p[1].toFixed(1); }).join(" ");
      el("path", { d: pd, class: "nl-road" }, map);
      var f = el("path", { d: pd, class: "nl-flow" }, map); f.style.animationDelay = (-i * 0.5) + "s";
    });
    Object.keys(C).forEach(function (n) {
      var c = C[n], p = P(c[0], c[1]), hub = c[2];
      if (n === "Amsterdam") el("circle", { cx: p[0], cy: p[1], r: 9, class: "nl-hq" }, map);
      el("circle", { cx: p[0], cy: p[1], r: hub ? 5 : 3.2, class: hub ? "nl-hub" : "nl-city" }, map);
      var dx = n === "Schiphol" || n === "Den Haag" || n === "Rotterdam" ? -9 : 9;
      var tx = el("text", { x: p[0] + dx, y: p[1] + (n === "Schiphol" ? 12 : 4), class: "nl-label" + (hub ? " nl-label-b" : ""), "text-anchor": dx < 0 ? "end" : "start" }, map);
      tx.textContent = n === "Amsterdam" ? "Amsterdam · HQ" : n;
    });
  }

  /* ---------------- WhatsApp ---------------- */
  var wa = document.getElementById("wa");
  function renderWa() {
    if (!wa) return;
    var num = String(CONFIG.whatsapp || "").replace(/[^\d]/g, "");
    if (!num) { wa.hidden = true; return; }
    wa.hidden = false;
    var href = "https://wa.me/" + num + "?text=" + encodeURIComponent(t("wa.text"));
    wa.href = href;
    // Also list WhatsApp with the other contact details.
    var list = document.querySelector(".contact-details");
    if (list) {
      var row = document.getElementById("wa-row");
      if (!row) {
        row = document.createElement("div"); row.id = "wa-row";
        row.innerHTML = '<dt>WhatsApp</dt><dd><a target="_blank" rel="noopener"></a></dd>';
        var phoneRow = list.querySelector('[data-config="phone"]');
        phoneRow = phoneRow ? phoneRow.parentNode : null;
        if (phoneRow && phoneRow.nextSibling) list.insertBefore(row, phoneRow.nextSibling); else list.appendChild(row);
      }
      var a = row.querySelector("a"); a.href = href; a.textContent = CONFIG.whatsapp;
    }
  }
  renderWa(); onLang(renderWa);
  // The floating button stays out of the way: hidden over the opening screen and next to the contact section.
  if (wa && "IntersectionObserver" in window) {
    var heroEl = document.querySelector(".hero"), contactEl = document.getElementById("contact"), inHero = true, inContact = false;
    var wio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.target === heroEl) inHero = en.isIntersecting; else inContact = en.isIntersecting; });
      wa.classList.toggle("wa-on", !inHero && !inContact);
    }, { threshold: 0, rootMargin: "-25% 0px -25% 0px" });
    if (heroEl) wio.observe(heroEl); else inHero = false;
    if (contactEl) wio.observe(contactEl);
    if (!heroEl && !contactEl) wa.classList.add("wa-on");
  } else if (wa) wa.classList.add("wa-on");

  /* ---------------- SEO: canonical + hreflang per language ---------------- */
  function seo() {
    if (!/^https?:$/.test(location.protocol)) return;
    var base = location.origin + location.pathname.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
    function link(rel, href, hl) {
      var sel = 'link[rel="' + rel + '"]' + (hl ? '[hreflang="' + hl + '"]' : ""), l = document.head.querySelector(sel);
      if (!l) { l = document.createElement("link"); l.rel = rel; if (hl) l.hreflang = hl; document.head.appendChild(l); }
      l.href = href;
    }
    var cur = lang();
    link("canonical", base + (cur === "en" ? "" : "?lang=" + cur));
    LANGS.forEach(function (c) { link("alternate", base + (c === "en" ? "" : "?lang=" + c), c); });
    link("alternate", base, "x-default");
    var og = document.querySelector('meta[property="og:image"]');
    if (og && !/^https?:/.test(og.content)) og.content = new URL(og.getAttribute("content"), location.href).href;
  }
  seo(); onLang(seo);

  /* ---------------- Subject from the URL (company pages link here) ---------------- */
  var subj = new URLSearchParams(location.search).get("subject");
  var sel = document.getElementById("f-subject");
  if (subj && sel && sel.querySelector('option[value="' + subj + '"]')) sel.value = subj;

  /* ---------------- Talentra jobs ---------------- */
  var jobsBox = document.getElementById("jobs");
  function renderJobs() {
    if (!jobsBox) return;
    var jobs = (window.COREVIA_JOBS || []).filter(function (j) { return j && j.title; });
    var list = document.getElementById("jobs-list"), empty = document.getElementById("jobs-empty");
    list.innerHTML = "";
    empty.hidden = jobs.length > 0;
    jobs.forEach(function (j) {
      var title = typeof j.title === "object" ? (j.title[lang()] || j.title.en) : j.title;
      var li = document.createElement("li"); li.className = "job";
      var info = document.createElement("div");
      var h = document.createElement("h4"); h.textContent = title;
      var meta = document.createElement("p"); meta.textContent = [j.location, j.hours, j.type].filter(Boolean).join(" · ");
      info.appendChild(h); info.appendChild(meta);
      var a = document.createElement("a"); a.className = "btn btn-line"; a.style.setProperty("--c", "var(--t)");
      a.href = "./?subject=careers#contact"; a.textContent = t("cp.jobs.apply");
      li.appendChild(info); li.appendChild(a); list.appendChild(li);
    });
  }
  renderJobs(); onLang(renderJobs);
})();

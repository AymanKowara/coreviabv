(function () {
  "use strict";

  var I18N = window.COREVIA_I18N || {};
  var CONFIG = window.COREVIA_CONFIG || {};
  var LANGS = ["en", "nl", "de", "fr", "es", "it", "pl"];
  var STORAGE_KEY = "corevia-lang";
  var page = document.body.getAttribute("data-page") || "home";
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var current = "en";

  function t(key) {
    var dict = I18N[current] || I18N.en || {};
    var value = dict[key];
    if (value === undefined && I18N.en) value = I18N.en[key];
    if (value === undefined) return "";
    return value.replace("{year}", String(new Date().getFullYear()));
  }

  function storageGet() {
    try { return window.localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function storageSet(value) {
    try { window.localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* storage unavailable */ }
  }

  function initialLang() {
    var fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (fromUrl && LANGS.indexOf(fromUrl) !== -1) return fromUrl;
    var stored = storageGet();
    if (stored && LANGS.indexOf(stored) !== -1) return stored;
    var prefs = navigator.languages || [navigator.language || "en"];
    for (var i = 0; i < prefs.length; i++) {
      var code = String(prefs[i]).slice(0, 2).toLowerCase();
      if (LANGS.indexOf(code) !== -1) return code;
    }
    return "en";
  }

  /* Company details from config.js; empty values show the translated placeholder. */
  function renderConfig() {
    var nodes = document.querySelectorAll("[data-config]");
    nodes.forEach(function (node) {
      var key = node.getAttribute("data-config");
      var value = String(CONFIG[key] || "").trim();
      var linkType = node.getAttribute("data-config-link");
      node.textContent = "";
      // Details that are not known yet (address, KvK, VAT) are left out entirely until filled in config.js.
      var row = node.closest("div");
      if (row) row.hidden = !value;
      if (!value) return;
      if (linkType === "mailto" || linkType === "tel") {
        var a = document.createElement("a");
        a.href = linkType === "mailto" ? "mailto:" + value : "tel:" + value.replace(/[^\d+]/g, "");
        a.textContent = value;
        node.appendChild(a);
      } else {
        node.textContent = value;
      }
    });
  }

  function applyText() {
    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      var value = t(node.getAttribute("data-i18n"));
      if (value) node.textContent = value;
    });
    document.querySelectorAll("[data-i18n-attr]").forEach(function (node) {
      node.getAttribute("data-i18n-attr").split(";").forEach(function (pair) {
        var parts = pair.split(":");
        if (parts.length === 2) node.setAttribute(parts[0].trim(), t(parts[1].trim()));
      });
    });

    document.documentElement.lang = current;
    var title = page === "privacy" ? t("privacy.title") + " – Corevia B.V." : t("meta.title");
    if (page === "company") {
      var slug = document.body.getAttribute("data-company") || "";
      var key = { moventra: "m", talentra: "t", promovia: "p" }[slug];
      title = slug.charAt(0).toUpperCase() + slug.slice(1) + " B.V. – " + t("diag." + slug) + " · Corevia";
      var cdesc = document.querySelector('meta[name="description"]');
      if (cdesc && key) cdesc.setAttribute("content", t("co." + key + ".text"));
    }
    document.title = title;
    var desc = document.querySelector('meta[name="description"]');
    if (desc && page === "home") desc.setAttribute("content", t("meta.description"));

    var label = document.querySelector(".lang-current");
    if (label) label.textContent = current.toUpperCase();
    document.querySelectorAll(".lang-list button").forEach(function (btn) {
      btn.setAttribute("aria-current", btn.getAttribute("data-lang") === current ? "true" : "false");
    });

    var menuBtn = document.querySelector(".menu-toggle");
    if (menuBtn) {
      var open = menuBtn.getAttribute("aria-expanded") === "true";
      menuBtn.setAttribute("aria-label", t(open ? "nav.close" : "nav.menu"));
    }

    renderConfig();
    clearErrors();
    try {
      document.dispatchEvent(new CustomEvent("corevia:lang", { detail: { lang: current } }));
    } catch (e) { /* CustomEvent unsupported */ }
  }

  function setLang(code, animate) {
    if (LANGS.indexOf(code) === -1) code = "en";
    current = code;
    storageSet(code);

    var url = new URL(window.location.href);
    if (code === "en") url.searchParams.delete("lang");
    else url.searchParams.set("lang", code);
    try { window.history.replaceState(null, "", url.pathname + url.search + url.hash); } catch (e) { /* sandboxed */ }

    if (!animate || reduceMotion) {
      applyText();
      return;
    }
    document.body.classList.add("is-switching");
    window.setTimeout(function () {
      applyText();
      window.requestAnimationFrame(function () {
        document.body.classList.remove("is-switching");
      });
    }, 180);
  }

  /* Language selector */
  function buildLangMenu() {
    var wrap = document.getElementById("lang");
    var list = document.getElementById("lang-list");
    if (!wrap || !list) return;
    var toggle = wrap.querySelector(".lang-toggle");

    LANGS.forEach(function (code) {
      var li = document.createElement("li");
      var btn = document.createElement("button");
      btn.type = "button";
      btn.setAttribute("data-lang", code);
      btn.setAttribute("lang", code);
      btn.textContent = (I18N[code] && I18N[code]["lang.name"]) || code;
      var tag = document.createElement("span");
      tag.textContent = code.toUpperCase();
      tag.setAttribute("aria-hidden", "true");
      btn.appendChild(tag);
      btn.addEventListener("click", function () {
        close();
        toggle.focus();
        if (code !== current) setLang(code, true);
      });
      li.appendChild(btn);
      list.appendChild(li);
    });

    function open() {
      wrap.classList.add("is-open");
      toggle.setAttribute("aria-expanded", "true");
      var active = list.querySelector('[aria-current="true"]') || list.querySelector("button");
      /* Wait until the list is visible before it takes focus. */
      if (active) window.setTimeout(function () { active.focus(); }, 30);
    }
    function close() {
      wrap.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", function () {
      if (wrap.classList.contains("is-open")) close();
      else open();
    });
    document.addEventListener("click", function (e) {
      if (!wrap.contains(e.target)) close();
    });
    wrap.addEventListener("keydown", function (e) {
      var items = Array.prototype.slice.call(list.querySelectorAll("button"));
      var index = items.indexOf(document.activeElement);
      if (e.key === "Escape" && wrap.classList.contains("is-open")) {
        close();
        toggle.focus();
      } else if (e.key === "ArrowDown" && index !== -1) {
        e.preventDefault();
        items[(index + 1) % items.length].focus();
      } else if (e.key === "ArrowUp" && index !== -1) {
        e.preventDefault();
        items[(index - 1 + items.length) % items.length].focus();
      }
    });
  }

  /* Mobile navigation */
  function initMenu() {
    var btn = document.querySelector(".menu-toggle");
    var nav = document.getElementById("primary-nav");
    if (!btn || !nav) return;
    function set(open) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.setAttribute("aria-label", t(open ? "nav.close" : "nav.menu"));
      nav.classList.toggle("is-open", open);
    }
    btn.addEventListener("click", function () {
      set(btn.getAttribute("aria-expanded") !== "true");
    });
    nav.addEventListener("click", function (e) {
      if (e.target.closest("a")) set(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && btn.getAttribute("aria-expanded") === "true") {
        set(false);
        btn.focus();
      }
    });
  }

  /* Header border once the page scrolls */
  function initHeader() {
    var header = document.querySelector(".site-header");
    if (!header) return;
    function update() {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    }
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* Path buttons preset the form subject */
  function initPaths() {
    var select = document.getElementById("f-subject");
    var nameField = document.getElementById("f-name");
    document.querySelectorAll("[data-subject]").forEach(function (link) {
      link.addEventListener("click", function () {
        if (select) select.value = link.getAttribute("data-subject");
        if (nameField) {
          window.setTimeout(function () {
            nameField.focus({ preventScroll: true });
          }, reduceMotion ? 0 : 450);
        }
      });
    });
  }

  /* Contact form: validate, then open a pre-filled email */
  function setError(id, message) {
    var field = document.getElementById(id);
    var error = document.getElementById(id + "-error");
    if (!field || !error) return;
    error.textContent = message || "";
    field.closest(".field").classList.toggle("has-error", Boolean(message));
    if (message) field.setAttribute("aria-invalid", "true");
    else field.removeAttribute("aria-invalid");
  }
  function clearErrors() {
    ["f-name", "f-email", "f-message"].forEach(function (id) { setError(id, ""); });
    var status = document.getElementById("form-status");
    if (status) status.textContent = "";
  }

  function initForm() {
    var form = document.getElementById("contact-form");
    if (!form) return;

    ["f-name", "f-email", "f-message"].forEach(function (id) {
      var field = document.getElementById(id);
      field.addEventListener("input", function () { setError(id, ""); });
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var name = form.elements.name.value.trim();
      var email = form.elements.email.value.trim();
      var org = form.elements.organisation.value.trim();
      var message = form.elements.message.value.trim();
      var subjectSelect = form.elements.subject;
      var subjectLabel = subjectSelect.options[subjectSelect.selectedIndex].text;
      var status = document.getElementById("form-status");
      var firstInvalid = null;

      setError("f-name", name ? "" : t("err.name"));
      if (!name) firstInvalid = firstInvalid || "f-name";

      var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
      setError("f-email", emailOk ? "" : t("err.email"));
      if (!emailOk) firstInvalid = firstInvalid || "f-email";

      setError("f-message", message ? "" : t("err.message"));
      if (!message) firstInvalid = firstInvalid || "f-message";

      if (firstInvalid) {
        document.getElementById(firstInvalid).focus();
        return;
      }

      var endpoint = String(CONFIG.formEndpoint || "").trim();
      if (endpoint) {
        var btn = form.querySelector('button[type="submit"]');
        status.classList.remove("ok");
        status.textContent = t("form.sending");
        if (btn) btn.disabled = true;
        var data = new FormData(form);
        data.append("_subject", subjectLabel + " – " + t("mail.site"));
        data.append("language", current);
        fetch(endpoint, { method: "POST", body: data, headers: { Accept: "application/json" } })
          .then(function (res) {
            if (!res.ok) throw new Error("HTTP " + res.status);
            form.reset();
            status.classList.add("ok");
            status.textContent = t("form.sent");
          })
          .catch(function () {
            status.classList.remove("ok");
            status.textContent = t("form.failed");
          })
          .then(function () { if (btn) btn.disabled = false; });
        return;
      }

      var to = String(CONFIG.email || "").trim();
      if (!to) {
        status.textContent = t("err.config");
        return;
      }
      status.textContent = "";

      var lines = [
        message,
        "",
        "—",
        t("form.name") + ": " + name,
        t("form.email") + ": " + email
      ];
      if (org) lines.push(t("form.org").replace(/\s*\(.*\)\s*$/, "") + ": " + org);

      var subject = subjectLabel + " – " + t("mail.site");
      window.location.href = "mailto:" + encodeURIComponent(to) +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"));
    });
  }

  /* ---------- Clean addresses ----------
     · In-page links scroll smoothly to their section without writing "#section" into the address bar.
     · A link that arrives with a #section or ?subject= opens there, then the address is tidied up.
     · Company pages are linked as /moventra rather than /moventra.html. GitHub Pages serves both;
       on other hosts (local preview) the links get their .html back. */
  var CLEAN_HOST = /(^|\.)coreviabv\.nl$|\.github\.io$/.test(window.location.hostname);
  var PAGES = /^(moventra|talentra|promovia|privacy)((?:\?[^#]*)?(?:#.*)?)$/;

  function tidyUrl() {
    var url = new URL(window.location.href);
    url.searchParams.delete("subject");
    var path = url.pathname;
    if (CLEAN_HOST) path = path.replace(/\/index\.html$/, "/").replace(/\.html$/, "");
    try { window.history.replaceState(null, "", path + url.search); } catch (e) { /* sandboxed */ }
  }

  function goTo(id, smooth) {
    var behavior = smooth && !reduceMotion ? "smooth" : "auto";
    if (id === "top") { window.scrollTo({ top: 0, behavior: behavior }); return true; }
    var el = document.getElementById(id);
    if (!el) return false;
    el.scrollIntoView({ behavior: behavior, block: "start" });
    if (!/^(A|BUTTON|INPUT|SELECT|TEXTAREA)$/.test(el.tagName) && !el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    try { el.focus({ preventScroll: true }); } catch (e) { /* old browser */ }
    return true;
  }

  function initAnchors() {
    if (!CLEAN_HOST) {
      document.querySelectorAll("a[href]").forEach(function (a) {
        var m = a.getAttribute("href").match(PAGES);
        if (m) a.setAttribute("href", m[1] + ".html" + m[2]);
      });
    }
    document.addEventListener("click", function (e) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      var a = e.target.closest && e.target.closest("a[href]");
      if (!a) return;
      var href = a.getAttribute("href");
      if (href.charAt(0) !== "#" || href.length < 2) return;
      if (!goTo(decodeURIComponent(href.slice(1)), true)) return;
      e.preventDefault();
      var nav = document.querySelector(".primary-nav.is-open"), btn = document.querySelector(".menu-toggle");
      if (nav && btn) btn.click();
    });
    // Arriving with #section (e.g. from a company page): jump there once the page has laid out, then tidy the address.
    window.addEventListener("load", function () {
      var id = window.location.hash ? decodeURIComponent(window.location.hash.slice(1)) : "";
      if (id) window.setTimeout(function () { goTo(id, false); }, 60);
      tidyUrl();
    });
  }

  buildLangMenu();
  initAnchors();
  initMenu();
  initHeader();
  initPaths();
  initForm();
  setLang(initialLang(), false);
})();

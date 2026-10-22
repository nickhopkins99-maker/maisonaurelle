/* Maison Aurelle — shared utilities (MA.utils) */
(function () {
  'use strict';
  window.MA = window.MA || {};
  var cfg = MA.config || {};

  function qs(sel, root) { return (root || document).querySelector(sel); }
  function qsa(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }

  function escapeHTML(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* el(tag, attrs, ...children). attrs: class, text, html (trusted markup only), dataset, on:{event:fn}, aria-*, any attribute. */
  function el(tag, attrs) {
    var node = document.createElement(tag);
    attrs = attrs || {};
    Object.keys(attrs).forEach(function (key) {
      var val = attrs[key];
      if (val === null || val === undefined || val === false) return;
      if (key === 'class') { node.className = val; }
      else if (key === 'text') { node.textContent = val; }
      else if (key === 'html') { node.innerHTML = val; }
      else if (key === 'dataset') { Object.keys(val).forEach(function (d) { node.dataset[d] = val[d]; }); }
      else if (key === 'on') { Object.keys(val).forEach(function (ev) { node.addEventListener(ev, val[ev]); }); }
      else if (key === 'style' && typeof val === 'object') { Object.keys(val).forEach(function (p) { node.style[p] = val[p]; }); }
      else if (val === true) { node.setAttribute(key, ''); }
      else { node.setAttribute(key, String(val)); }
    });
    for (var i = 2; i < arguments.length; i++) appendChild(node, arguments[i]);
    return node;
  }
  function appendChild(node, child) {
    if (child === null || child === undefined || child === false) return;
    if (Array.isArray(child)) { child.forEach(function (c) { appendChild(node, c); }); return; }
    if (typeof child === 'string' || typeof child === 'number') { node.appendChild(document.createTextNode(String(child))); return; }
    node.appendChild(child);
  }

  function toCents(amount) { return Math.round(Number(amount) * 100); }
  function fromCents(cents) { return Number(cents) / 100; }
  function formatMoney(cents) {
    cents = Math.round(Number(cents) || 0);
    var hasFraction = cents % 100 !== 0;
    try {
      return new Intl.NumberFormat(cfg.locale || 'en-US', {
        style: 'currency', currency: cfg.currency || 'USD',
        minimumFractionDigits: hasFraction ? 2 : 0, maximumFractionDigits: 2
      }).format(cents / 100);
    } catch (e) {
      return '$' + (cents / 100).toFixed(hasFraction ? 2 : 0);
    }
  }

  function getParam(name) {
    try { return new URLSearchParams(location.search).get(name); } catch (e) { return null; }
  }
  function setParams(obj) {
    try {
      var params = new URLSearchParams(location.search);
      Object.keys(obj).forEach(function (k) {
        var v = obj[k];
        if (v === null || v === undefined || v === '') params.delete(k); else params.set(k, v);
      });
      var q = params.toString();
      var url = location.pathname + (q ? '?' + q : '') + location.hash;
      history.replaceState(history.state, '', url);
    } catch (e) { /* file:// or restricted contexts: ignore */ }
  }

  function normalize(str) {
    return String(str == null ? '' : str).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
  }

  function debounce(fn, wait) {
    var t;
    return function () {
      var ctx = this, args = arguments;
      clearTimeout(t);
      t = setTimeout(function () { fn.apply(ctx, args); }, wait);
    };
  }

  /* Storage: JSON over localStorage with in-memory fallback when unavailable. */
  var memory = new Map();
  var storage = {
    persistent: false,
    get: function (key, fallback) {
      try {
        var raw = window.localStorage.getItem(key);
        if (raw === null) return memory.has(key) ? memory.get(key) : fallback;
        return JSON.parse(raw);
      } catch (e) {
        return memory.has(key) ? memory.get(key) : fallback;
      }
    },
    set: function (key, value) {
      memory.set(key, value);
      try { window.localStorage.setItem(key, JSON.stringify(value)); return true; } catch (e) { return false; }
    },
    remove: function (key) {
      memory.delete(key);
      try { window.localStorage.removeItem(key); } catch (e) { /* ignore */ }
    }
  };
  try {
    var probe = '__ma_probe__';
    window.localStorage.setItem(probe, '1');
    window.localStorage.removeItem(probe);
    storage.persistent = true;
  } catch (e) { storage.persistent = false; }

  var announceTimer;
  function announce(msg) {
    var region = document.getElementById('sr-status');
    if (!region) return;
    region.textContent = '';
    clearTimeout(announceTimer);
    announceTimer = setTimeout(function () { region.textContent = msg; }, 50);
  }

  var FOCUSABLE = 'a[href],button:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';
  function focusables(container) {
    return qsa(FOCUSABLE, container).filter(function (n) {
      return n.offsetParent !== null || n === document.activeElement;
    });
  }
  function trapFocus(container) {
    function onKey(e) {
      if (e.key !== 'Tab') return;
      var list = focusables(container);
      if (!list.length) { e.preventDefault(); return; }
      var first = list[0], last = list[list.length - 1];
      if (e.shiftKey && (document.activeElement === first || !container.contains(document.activeElement))) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && (document.activeElement === last || !container.contains(document.activeElement))) {
        e.preventDefault(); first.focus();
      }
    }
    document.addEventListener('keydown', onKey);
    return function release() { document.removeEventListener('keydown', onKey); };
  }

  function generateOrderNumber() {
    var alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
    var d = new Date();
    var pad = function (n) { return (n < 10 ? '0' : '') + n; };
    var ymd = String(d.getFullYear()).slice(-2) + pad(d.getMonth() + 1) + pad(d.getDate());
    var chars = '';
    var bytes = new Uint8Array(4);
    if (window.crypto && window.crypto.getRandomValues) {
      window.crypto.getRandomValues(bytes);
    } else {
      for (var i = 0; i < 4; i++) bytes[i] = Math.floor(Math.random() * 256);
    }
    for (var j = 0; j < 4; j++) chars += alphabet[bytes[j] % alphabet.length];
    return (cfg.orderPrefix || 'MA') + '-' + ymd + '-' + chars;
  }

  function absUrl(path) {
    path = String(path || '').replace(/^\/+/, '');
    if (cfg.siteUrl) return cfg.siteUrl.replace(/\/+$/, '') + '/' + path;
    try { return new URL(path, location.href).href; } catch (e) { return path; }
  }

  function setMetaTag(selector, attrName, value, create) {
    var tag = qs(selector);
    if (!tag && create) {
      tag = document.createElement(create.tag || 'meta');
      Object.keys(create.attrs || {}).forEach(function (k) { tag.setAttribute(k, create.attrs[k]); });
      document.head.appendChild(tag);
    }
    if (tag) tag.setAttribute(attrName, value);
  }

  /* "<Primary keyword> | <Store name>", at most 60 characters; the keyword part is cut at a word boundary with "…". */
  var TITLE_MAX = 60;
  function pageTitle(primary) {
    var name = cfg.name || '';
    primary = String(primary || cfg.tagline || '').trim();
    var suffix = ' | ' + name;
    if ((primary + suffix).length <= TITLE_MAX) return primary + suffix;
    var room = TITLE_MAX - suffix.length - 1; // 1 for the ellipsis
    var cut = primary.slice(0, room + 1);
    var sp = cut.lastIndexOf(' ');
    cut = (sp > 0 ? cut.slice(0, sp) : primary.slice(0, room)).replace(/\s*\([^)]*$/, '').replace(/[\s,.;:&\/\u2013\u2014-]+$/, '');
    return cut + '\u2026' + suffix;
  }

  /* Deterministic 140–160 character descriptions: try each core (longest first) and add pads until ≥min; never exceed max. */
  function fitText(cores, pads, min, max) {
    min = min || 140; max = max || 160;
    for (var i = 0; i < cores.length; i++) {
      var t = cores[i];
      if (t.length > max) continue;
      for (var j = 0; j < pads.length && t.length < min; j++) {
        if ((t + pads[j]).length <= max) t += pads[j];
      }
      if (t.length >= min) return t;
    }
    var last = cores[cores.length - 1];
    if (last.length > max) { var cut = last.slice(0, max - 1); return cut.slice(0, cut.lastIndexOf(' ')) + '\u2026'; }
    return last;
  }

  var DEFAULT_OG = { src: 'assets/img/og-image.png', w: 1200, h: 630, alt: (cfg.name || '') + ' \u2014 gold-tone statement jewelry' };

  function setMeta(opts) {
    opts = opts || {};
    var name = cfg.name || '';
    var title = pageTitle(opts.title);
    document.title = title;
    var desc = opts.description || cfg.description || '';
    setMetaTag('meta[name="description"]', 'content', desc, { attrs: { name: 'description' } });
    setMetaTag('meta[property="og:title"]', 'content', title, { attrs: { property: 'og:title' } });
    setMetaTag('meta[property="og:description"]', 'content', desc, { attrs: { property: 'og:description' } });
    setMetaTag('meta[name="twitter:title"]', 'content', title, { attrs: { name: 'twitter:title' } });
    setMetaTag('meta[name="twitter:description"]', 'content', desc, { attrs: { name: 'twitter:description' } });
    setMetaTag('meta[property="og:site_name"]', 'content', name, { attrs: { property: 'og:site_name' } });
    // Social cards. NOTE: Facebook/LinkedIn/X crawlers do not run JavaScript; they read the static <head> defaults.
    setMetaTag('meta[property="og:type"]', 'content', opts.type || 'website', { attrs: { property: 'og:type' } });
    setMetaTag('meta[name="twitter:card"]', 'content', 'summary_large_image', { attrs: { name: 'twitter:card' } });
    var img = opts.image || DEFAULT_OG.src;
    var imgUrl = cfg.siteUrl ? absUrl(img) : img;
    setMetaTag('meta[property="og:image"]', 'content', imgUrl, { attrs: { property: 'og:image' } });
    setMetaTag('meta[name="twitter:image"]', 'content', imgUrl, { attrs: { name: 'twitter:image' } });
    var dims = opts.image ? (opts.imageSize || [800, 800]) : [DEFAULT_OG.w, DEFAULT_OG.h];
    setMetaTag('meta[property="og:image:width"]', 'content', String(dims[0]), { attrs: { property: 'og:image:width' } });
    setMetaTag('meta[property="og:image:height"]', 'content', String(dims[1]), { attrs: { property: 'og:image:height' } });
    setMetaTag('meta[property="og:image:alt"]', 'content', opts.imageAlt || DEFAULT_OG.alt, { attrs: { property: 'og:image:alt' } });
    if (cfg.siteUrl) {
      var path = opts.path || (location.pathname.split('/').pop() || 'index.html') + location.search;
      var abs = absUrl(path);
      setMetaTag('link[rel="canonical"]', 'href', abs, { tag: 'link', attrs: { rel: 'canonical' } });
      setMetaTag('meta[property="og:url"]', 'content', abs, { attrs: { property: 'og:url' } });
    }
    if (opts.noindex || cfg.indexable === false) {
      setMetaTag('meta[name="robots"]', 'content', 'noindex, nofollow', { attrs: { name: 'robots' } });
    }
  }

  /* Store state: one place that decides what may be shown while the shop is not yet open. An email address on an
     example.* domain is a placeholder and is never turned into a mailto: link. */
  var PLACEHOLDER_EMAIL = /@example\.(com|org|net)$/i;
  var emailReady = !!cfg.email && !PLACEHOLDER_EMAIL.test(cfg.email);
  MA.store = {
    open: cfg.storeOpen !== false,
    emailReady: emailReady,
    canSignup: !!(cfg.newsletter && cfg.newsletter.formEndpoint) || emailReady,
    canContact: !!(cfg.contact && cfg.contact.formEndpoint) || emailReady
  };
  // Stripe Checkout through the Worker takes priority over every other method once the store is open.
  // config.checkout.apiBase (backend/API.md); workerUrl is accepted as an older alias.
  MA.store.checkoutApi = String((cfg.checkout && (cfg.checkout.apiBase || cfg.checkout.workerUrl)) || '').replace(/\/+$/, '');
  MA.store.stripeCheckout = MA.store.open && /^https:\/\//.test(MA.store.checkoutApi);
  // With Stripe Checkout the payment page sets tax: show no estimate and leave it out of the preview total.
  MA.store.taxNote = MA.store.stripeCheckout ? 'Calculated at checkout' : null;

  MA.utils = {
    qs: qs, qsa: qsa, el: el, escapeHTML: escapeHTML,
    toCents: toCents, fromCents: fromCents, formatMoney: formatMoney,
    getParam: getParam, setParams: setParams, normalize: normalize, debounce: debounce,
    storage: storage, announce: announce, trapFocus: trapFocus,
    generateOrderNumber: generateOrderNumber, absUrl: absUrl, setMeta: setMeta, pageTitle: pageTitle, fitText: fitText
  };
})();

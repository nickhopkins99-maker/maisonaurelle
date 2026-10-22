/* Maison Aurelle — consent-gated analytics (MA.track, MA.analytics).
   - MA.track(event, params) always pushes a gtag-style entry to window.dataLayer (so events can be verified) and
     console.debug's it on localhost or with ?debug_analytics=1. No network request is ever made unless
     config.analytics.ga4Id is set AND the visitor accepted analytics (or consentRequired is false) AND the visitor is
     not flagged internal.
   - Consent Mode v2: defaults are denied; "Accept analytics" updates analytics_storage to granted. Ad storage, ad user
     data and ad personalisation stay denied (the shop uses no ad trackers).
   - Internal traffic: visiting any page with ?internal=1 stores ma_internal and analytics never loads in that browser
     (?internal=0 clears it). Events are still pushed locally with traffic_type: 'internal'. */
(function () {
  'use strict';
  window.MA = window.MA || {};
  var U = MA.utils, cfg = MA.config || {};
  var A = cfg.analytics || {};
  var CONSENT_KEY = 'ma_consent_v1', INTERNAL_KEY = 'ma_internal', SENT_KEY = 'ma_tracked_orders_v1';
  var loaded = false;

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  var param = U.getParam('internal');
  if (param === '1') U.storage.set(INTERNAL_KEY, true);
  if (param === '0') U.storage.remove(INTERNAL_KEY);
  var internal = !!(A.excludeInternal !== false && U.storage.get(INTERNAL_KEY, false));
  var debug = /^(localhost|127\.0\.0\.1)$/.test(location.hostname) || U.getParam('debug_analytics') === '1';
  var configured = !!(A.ga4Id && /^G-[A-Z0-9]+$/i.test(A.ga4Id));

  gtag('consent', 'default', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied', wait_for_update: 500 });

  function consent() { return U.storage.get(CONSENT_KEY, null); }

  function load() {
    if (loaded || !configured || internal) return;
    loaded = true;
    gtag('consent', 'update', { analytics_storage: 'granted' });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(A.ga4Id);
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', A.ga4Id, internal ? { traffic_type: 'internal' } : {});
  }

  function track(event, params) {
    params = Object.assign({}, params || {});
    if (internal) params.traffic_type = 'internal';
    gtag('event', event, params);
    if (debug && window.console && console.debug) console.debug('[analytics]', event, params, loaded ? '(sent)' : '(local only)');
  }

  /* ---- GA4 ecommerce helpers --------------------------------------------------------------------- */
  function itemFromProduct(p, qty) {
    return { item_id: p.id, item_name: p.name, item_category: MA.catalog ? MA.catalog.collectionName(p.collection) : p.collection, price: Number(p.price), quantity: qty || 1 };
  }
  function round2(n) { return Math.round(n * 100) / 100; }
  function viewItem(p) { track('view_item', { currency: cfg.currency, value: round2(p.price), items: [itemFromProduct(p, 1)] }); }
  function addToCart(p, qty) { track('add_to_cart', { currency: cfg.currency, value: round2(p.price * qty), items: [itemFromProduct(p, qty)] }); }
  function beginCheckout(lines, totals) {
    track('begin_checkout', { currency: cfg.currency, value: round2(totals.subtotal / 100), items: lines.map(function (l) { return itemFromProduct(l.product, l.qty); }) });
  }
  function purchase(order) {
    var sent = U.storage.get(SENT_KEY, []);
    if (!Array.isArray(sent)) sent = [];
    if (sent.indexOf(order.number) !== -1) return false;           // once per order number
    track('purchase', {
      transaction_id: order.number, currency: order.currency || cfg.currency, value: round2(order.totals.total),
      tax: round2(order.totals.tax), shipping: round2(order.totals.shipping),
      items: order.items.map(function (it) {
        var p = MA.catalog && MA.catalog.byId(it.id);
        return { item_id: it.id, item_name: it.name, item_category: p ? MA.catalog.collectionName(p.collection) : '', price: Number(it.unitPrice), quantity: it.qty };
      })
    });
    sent.push(order.number);
    U.storage.set(SENT_KEY, sent.slice(-50));
    return true;
  }

  /* Purchase from a paid Stripe session (server amounts, cents). Once per order number, guarded by
     ma_purchase_sent_<orderNumber> as backend/API.md specifies. */
  function purchaseSession(s) {
    var key = 'ma_purchase_sent_' + s.orderNumber;
    if (U.storage.get(key, false)) return false;
    var a = s.amounts || {};
    track('purchase', {
      transaction_id: s.orderNumber, currency: s.currency || cfg.currency, value: round2((a.total || 0) / 100),
      tax: round2((a.tax || 0) / 100), shipping: round2((a.shipping || 0) / 100),
      items: (s.items || []).map(function (it) {
        var p = MA.catalog && MA.catalog.byId(it.id);
        return { item_id: it.id, item_name: it.name, item_category: p ? MA.catalog.collectionName(p.collection) : '', price: round2(it.unitAmount / 100), quantity: it.qty };
      })
    });
    U.storage.set(key, true);
    return true;
  }

  /* ---- Consent banner -------------------------------------------------------------------------------- */
  var banner = null;
  function choose(value) {
    U.storage.set(CONSENT_KEY, value);
    hideBanner();
    if (value === 'granted') load();
    U.announce(value === 'granted' ? 'Analytics accepted.' : 'Analytics declined.');
  }
  function hideBanner() { if (banner) { banner.hidden = true; } }
  function showBanner(focus) {
    if (!banner) {
      var el = U.el;
      banner = el('section', { class: 'consent', role: 'region', 'aria-label': 'Cookie consent', hidden: true },
        el('div', { class: 'consent__inner container' },
          el('p', { class: 'consent__text' }, 'We would like to use Google Analytics to understand how the shop is used. It only loads if you accept; your bag works either way. ',
            el('a', { href: 'privacy.html#cookies', text: 'Privacy Policy' }), '.'),
          el('div', { class: 'consent__actions' },
            el('button', { class: 'btn btn--primary', type: 'button', text: 'Accept analytics', on: { click: function () { choose('granted'); } } }),
            el('button', { class: 'btn btn--secondary', type: 'button', text: 'Decline', on: { click: function () { choose('denied'); } } }))));
      document.body.appendChild(banner);
    }
    banner.hidden = false;
    if (focus) { var first = banner.querySelector('button'); if (first) first.focus(); }
  }

  function init() {
    if (!configured) return;                        // feature switches on only when a GA4 ID is set
    if (internal) return;                           // never load for internal traffic
    if (A.consentRequired === false) { load(); return; }
    var c = consent();
    if (c === 'granted') load();
    else if (c !== 'denied') showBanner(false);
  }

  MA.track = track;
  MA.analytics = {
    enabled: function () { return configured && !internal; }, isInternal: function () { return internal; },
    isLoaded: function () { return loaded; }, openSettings: function () { showBanner(true); },
    viewItem: viewItem, addToCart: addToCart, beginCheckout: beginCheckout, purchase: purchase, purchaseSession: purchaseSession
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();

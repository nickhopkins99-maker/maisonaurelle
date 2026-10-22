/* Maison Aurelle — shopping bag state (MA.cart). Prices are never stored; only {id, qty}. */
(function () {
  'use strict';
  window.MA = window.MA || {};
  var U = MA.utils, C = MA.catalog, cfg = MA.config;
  var KEY = 'ma_cart_v1';
  var EVENT = 'ma:cart';

  function maxQty() { return Math.max(1, Number(cfg.maxQtyPerItem) || 10); }

  function load() {
    var data = U.storage.get(KEY, null);
    if (!data || data.v !== 1 || !Array.isArray(data.items)) return { v: 1, items: [] };
    data.items = data.items.filter(function (it) {
      return it && typeof it.id === 'string' && Number(it.qty) > 0;
    }).map(function (it) { return { id: it.id, qty: Math.min(maxQty(), Math.max(1, Math.floor(Number(it.qty)))) }; });
    return data;
  }
  function save(data) {
    U.storage.set(KEY, data);
    emit();
  }
  function emit() {
    document.dispatchEvent(new CustomEvent(EVENT, { detail: { count: count() } }));
  }

  function items() {
    var data = load();
    var out = [];
    data.items.forEach(function (it) {
      var product = C.byId(it.id);
      if (!product || !C.purchasable(product)) return; // prune unknown and price-on-request products
      out.push({ product: product, qty: it.qty, lineCents: U.toCents(product.price) * it.qty });
    });
    return out;
  }
  function count() {
    return items().reduce(function (n, line) { return n + line.qty; }, 0);
  }
  function add(id, qty) {
    qty = Math.floor(Number(qty === undefined ? 1 : qty)) || 1;
    if (!C.purchasable(C.byId(id))) return { ok: false, clamped: false }; // unknown or price-on-request
    var data = load();
    var existing = null;
    for (var i = 0; i < data.items.length; i++) if (data.items[i].id === id) existing = data.items[i];
    var target = (existing ? existing.qty : 0) + qty;
    var clamped = false;
    if (target > maxQty()) { target = maxQty(); clamped = true; }
    if (target < 1) target = 1;
    if (existing) existing.qty = target; else data.items.push({ id: id, qty: target });
    save(data);
    return { ok: true, clamped: clamped, qty: target };
  }
  function setQty(id, qty) {
    qty = Math.floor(Number(qty));
    var data = load();
    if (!(qty > 0)) {
      data.items = data.items.filter(function (it) { return it.id !== id; });
      save(data); return { ok: true, clamped: false, qty: 0 };
    }
    var clamped = false;
    if (qty > maxQty()) { qty = maxQty(); clamped = true; }
    var found = false;
    data.items.forEach(function (it) { if (it.id === id) { it.qty = qty; found = true; } });
    if (!found && C.byId(id)) data.items.push({ id: id, qty: qty });
    save(data);
    return { ok: true, clamped: clamped, qty: qty };
  }
  function remove(id) {
    var data = load();
    data.items = data.items.filter(function (it) { return it.id !== id; });
    save(data);
  }
  function clear() { save({ v: 1, items: [] }); }

  function totals() {
    var subtotal = items().reduce(function (s, line) { return s + line.lineCents; }, 0);
    var threshold = U.toCents(cfg.shipping.freeThreshold);
    var shipping = subtotal === 0 ? 0 : (subtotal >= threshold ? 0 : U.toCents(cfg.shipping.flatRate));
    // With Stripe Checkout the payment page sets tax: no client-side estimate, not included in the preview total.
    var rate = (MA.store && MA.store.stripeCheckout) ? 0 : (Number(cfg.tax.rate) || 0);
    var tax = Math.round(subtotal * rate);
    return {
      subtotal: subtotal, shipping: shipping, tax: tax, total: subtotal + shipping + tax,
      freeShippingRemaining: Math.max(0, threshold - subtotal), currency: cfg.currency
    };
  }

  function onChange(fn) {
    var handler = function (e) { fn(e.detail || { count: count() }); };
    document.addEventListener(EVENT, handler);
    return function () { document.removeEventListener(EVENT, handler); };
  }

  // Cross-tab sync: another tab wrote the bag.
  window.addEventListener('storage', function (e) {
    if (e.key === KEY || e.key === null) emit();
  });

  MA.cart = { KEY: KEY, items: items, count: count, add: add, setQty: setQty, remove: remove, clear: clear, totals: totals, onChange: onChange };
})();

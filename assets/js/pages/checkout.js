/* Maison Aurelle — checkout: builds an order request and sends it by form endpoint, payment link or email.
   No card details are ever collected here. */
(function () {
  'use strict';
  window.MA = window.MA || {};
  var U = MA.utils, L = MA.layout, F = MA.forms, cart = MA.cart, cfg = MA.config;
  var el = U.el;
  var LAST_ORDER_KEY = 'ma_last_order_v1';
  var submitting = false;

  function determineMethod(items) {
    if (MA.store.stripeCheckout) return 'stripe-checkout';
    if (cfg.checkout && cfg.checkout.formEndpoint) return 'endpoint';
    if (cfg.checkout && cfg.checkout.allowStripeLinks && items.length === 1 && items[0].qty === 1 &&
        typeof items[0].product.stripeLink === 'string' && items[0].product.stripeLink.indexOf('https://') === 0) return 'stripe';
    return 'email';
  }

  function money2(cents) { return Number((cents / 100).toFixed(2)); }

  function buildOrder(formData, items, totals) {
    var countryName = (cfg.shipping.countries.filter(function (c) { return c.code === formData.country; })[0] || {}).name || formData.country;
    return {
      number: U.generateOrderNumber(),
      createdAt: new Date().toISOString(),
      method: determineMethod(items),
      status: 'pending',
      currency: cfg.currency,
      store: cfg.name,
      customer: { email: formData.email, phone: formData.phone || '', firstName: formData.firstName, lastName: formData.lastName },
      shippingAddress: { line1: formData.address1, line2: formData.address2 || '', city: formData.city, region: formData.region, postal: formData.postal, country: countryName },
      notes: formData.notes || '',
      items: items.map(function (line) {
        return { id: line.product.id, slug: line.product.slug, name: line.product.name, metal: line.product.metal, qty: line.qty,
          unitPrice: money2(U.toCents(line.product.price)), lineTotal: money2(line.lineCents) };
      }),
      totals: { subtotal: money2(totals.subtotal), shipping: money2(totals.shipping), tax: money2(totals.tax), total: money2(totals.total) }
    };
  }

  function formatOrderText(order) {
    var fm = function (major) { return U.formatMoney(Math.round(major * 100)); };
    var a = order.shippingAddress, c = order.customer;
    var lines = [];
    lines.push('Order ' + order.number + ' — ' + order.store);
    lines.push('Date: ' + new Date(order.createdAt).toLocaleString(cfg.locale));
    lines.push('');
    lines.push('Customer: ' + c.firstName + ' ' + c.lastName);
    lines.push('Email: ' + c.email);
    if (c.phone) lines.push('Phone: ' + c.phone);
    lines.push('');
    lines.push('Ship to:');
    lines.push(c.firstName + ' ' + c.lastName);
    lines.push(a.line1); if (a.line2) lines.push(a.line2);
    lines.push(a.city + ', ' + a.region + ' ' + a.postal);
    lines.push(a.country);
    lines.push('');
    lines.push('Items:');
    order.items.forEach(function (it) {
      lines.push(it.qty + ' × ' + it.name + ' (' + it.metal + ') — ' + fm(it.lineTotal));
    });
    lines.push('');
    lines.push('Subtotal: ' + fm(order.totals.subtotal));
    lines.push('Shipping: ' + (order.totals.shipping === 0 ? 'Free' : fm(order.totals.shipping)));
    lines.push(cfg.tax.label + ': ' + (Number(cfg.tax.rate) > 0 ? fm(order.totals.tax) : 'Calculated on confirmation'));
    lines.push('Total: ' + fm(order.totals.total));
    if (order.notes) { lines.push(''); lines.push('Notes: ' + order.notes); }
    lines.push('');
    lines.push('Prices are confirmed by reply before any payment is taken.');
    return lines.join('\n');
  }

  function saveLastOrder(order) { U.storage.set(LAST_ORDER_KEY, order); }

  /* ---- Rendering --------------------------------------------------------- */
  function renderSummary(items, totals) {
    var desktop = U.qs('#order-summary'), mobile = U.qs('#order-summary-mobile');
    if (desktop) { desktop.textContent = ''; desktop.appendChild(el('h2', { class: 'order-summary__title', text: 'Order summary' })); var d = renderSummaryClone(items, totals); while (d.firstChild) desktop.appendChild(d.firstChild); }
    if (mobile) { mobile.textContent = ''; mobile.appendChild(renderSummaryClone(items, totals)); }
    var mobileTotal = U.qs('#summary-total-mobile'); if (mobileTotal) mobileTotal.textContent = U.formatMoney(totals.total);
  }
  function renderSummaryClone(items, totals) {
    var box = el('div', { class: 'order-summary' });
    var list = el('ul', { class: 'summary-lines', 'aria-label': 'Items in your order' });
    items.forEach(function (line) {
      var p = line.product;
      list.appendChild(el('li', { class: 'summary-line' },
        L.productImage(p, { class: 'summary-line__thumb', alt: '', width: '64', height: '64' }, 'sm'),
        el('div', { class: 'summary-line__info' }, el('p', { class: 'summary-line__name', text: p.name }), el('p', { class: 'text-muted text-sm', text: p.metal + ' · Qty ' + line.qty })),
        el('p', { class: 'price', text: U.formatMoney(line.lineCents) })));
    });
    box.appendChild(list);
    box.appendChild(totalsDl(totals));
    box.appendChild(el('p', { class: 'text-muted text-sm' }, el('a', { href: 'cart.html', text: 'Edit bag' })));
    return box;
  }
  function totalsDl(totals) {
    var dl = el('dl', { class: 'totals' });
    function row(label, value, cls) { dl.appendChild(el('div', { class: 'totals__row' + (cls ? ' ' + cls : '') }, el('dt', { text: label }), el('dd', { class: 'price', text: value }))); }
    row('Subtotal', U.formatMoney(totals.subtotal));
    row('Shipping', totals.shipping === 0 ? 'Free' : U.formatMoney(totals.shipping));
    if (MA.store.taxNote) row('Tax', MA.store.taxNote);
    else row(cfg.tax.label, Number(cfg.tax.rate) > 0 ? U.formatMoney(totals.tax) : 'Calculated on confirmation');
    row('Total', U.formatMoney(totals.total), 'totals__row--total');
    return dl;
  }

  function renderCountries() {
    var sel = U.qs('#country');
    sel.textContent = '';
    cfg.shipping.countries.forEach(function (c, i) {
      var opt = el('option', { value: c.code, text: c.name }); if (i === 0) opt.selected = true; sel.appendChild(opt);
    });
  }

  function renderPaymentCopy(method) {
    var p = U.qs('#payment-copy'), btn = U.qs('#place-order');
    if (method === 'endpoint') {
      p.textContent = 'Place your order request and we’ll email a secure payment link within one business day. Nothing is charged now.';
      btn.textContent = 'Place order request';
    } else if (method === 'stripe') {
      p.textContent = 'You’ll continue to our secure payment page to complete your purchase.';
      btn.textContent = 'Continue to payment';
    } else {
      p.textContent = 'Placing your order opens a pre-filled email to ' + cfg.email + '. Send it and we’ll reply to confirm availability and payment. Nothing is charged now.';
      btn.textContent = 'Place order request';
    }
  }

  function setBusy(busy) {
    var btn = U.qs('#place-order');
    btn.disabled = busy;
    if (busy) { btn.setAttribute('aria-busy', 'true'); btn.dataset.label = btn.textContent; btn.textContent = 'Placing order…'; }
    else { btn.removeAttribute('aria-busy'); if (btn.dataset.label) btn.textContent = btn.dataset.label; }
    submitting = busy;
  }

  function showFailure(order, text) {
    var box = U.qs('#submit-error');
    box.textContent = '';
    box.hidden = false;
    box.appendChild(el('p', { class: 'alert__title', text: 'We couldn’t send your order just now.' }));
    box.appendChild(el('p', { text: 'Your bag has been kept. You can try again, or send the same order by email.' }));
    var retry = el('button', { class: 'btn btn--primary', type: 'button', text: 'Try again' });
    retry.addEventListener('click', function () { box.hidden = true; U.qs('#checkout-form').requestSubmit(); });
    var byEmail = el('button', { class: 'btn btn--secondary', type: 'button', text: 'Send by email instead' });
    byEmail.addEventListener('click', function () { sendByEmail(order, text); });
    box.appendChild(el('div', { class: 'btn-row' }, retry, byEmail));
    box.focus();
  }

  function sendByEmail(order, text) {
    order.method = 'email'; order.status = 'email-drafted';
    saveLastOrder(order);
    cart.clear();
    location.href = F.mailtoURL(cfg.email, 'Order request ' + order.number, text);
    setTimeout(function () { location.assign('confirmation.html?order=' + encodeURIComponent(order.number) + '&via=email'); }, 800);
  }

  function placeOrder(e) {
    e.preventDefault();
    if (submitting) return;
    var form = U.qs('#checkout-form');
    var errors = F.validateForm(form);
    if (errors.length) return;
    var items = cart.items();
    if (!items.length) { render(); return; }
    var totals = cart.totals();
    var data = F.serialize(form);
    var order = buildOrder(data, items, totals);
    var text = formatOrderText(order);
    setBusy(true);
    U.qs('#submit-error').hidden = true;

    if (order.method === 'endpoint') {
      var payload = Object.assign({}, order, { _subject: 'New order ' + order.number, email: order.customer.email, message: text });
      F.postJSON(cfg.checkout.formEndpoint, payload).then(function (res) {
        if (res.ok) {
          order.status = 'submitted'; saveLastOrder(order); cart.clear();
          location.assign('confirmation.html?order=' + encodeURIComponent(order.number));
        } else {
          setBusy(false);
          showFailure(order, text);
        }
      });
    } else if (order.method === 'stripe') {
      order.status = 'redirected'; saveLastOrder(order); cart.clear();
      location.assign(items[0].product.stripeLink);
    } else {
      sendByEmail(order, text);
    }
  }

  /* ---- Stripe Checkout through the order Worker (backend/API.md) ---------------------------------------
     Sends ONLY [{id, qty}] — never prices, names or totals; the Worker prices everything from its own catalog. */
  var payRequestId = null, payCartKey = '';
  function cartKey() { return cart.items().map(function (l) { return l.product.id + ':' + l.qty; }).join(','); }
  function newRequestId() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return 'r' + Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
  }
  function setPayBusy(busy) {
    var btn = U.qs('#pay-button');
    btn.disabled = busy; submitting = busy;
    if (busy) { btn.setAttribute('aria-busy', 'true'); btn.dataset.label = btn.textContent; btn.textContent = 'Opening secure payment\u2026'; }
    else { btn.removeAttribute('aria-busy'); if (btn.dataset.label) btn.textContent = btn.dataset.label; }
  }
  function payError(title, detail, retry) {
    var box = U.qs('#pay-error');
    box.textContent = '';
    box.appendChild(el('p', { class: 'alert__title', text: title }));
    if (detail) box.appendChild(detail.nodeType ? detail : el('p', { text: detail }));
    if (retry) {
      var again = el('button', { class: 'btn btn--primary', type: 'button', text: 'Try again' });
      again.addEventListener('click', function () { box.hidden = true; startPayment(); });
      box.appendChild(el('div', { class: 'btn-row' }, again));
    }
    box.hidden = false; box.focus();
  }
  /* 400 invalid_cart: the catalog changed. Remove or clamp the named lines, re-render and explain. */
  function repairCart(lines) {
    var notes = [];
    (lines || []).forEach(function (ln) {
      var p = C_byId(ln.id), name = p ? p.name : ('Item ' + ln.id);
      if (ln.reason === 'invalid_qty' && ln.max > 0) { cart.setQty(ln.id, ln.max); notes.push(name + ': quantity reduced to ' + ln.max + '.'); }
      else if (ln.id) { cart.remove(ln.id); notes.push(name + ' is no longer available and was removed from your bag.'); }
    });
    return notes;
  }
  function C_byId(id) { return MA.catalog && MA.catalog.byId(id); }
  function fetchJSON(url, opts) {
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var t = ctrl ? setTimeout(function () { ctrl.abort(); }, 15000) : null;
    opts = Object.assign({ cache: 'no-store', credentials: 'omit' }, opts || {}, ctrl ? { signal: ctrl.signal } : {});
    return fetch(url, opts).then(function (res) {
      clearTimeout(t);
      return res.json().catch(function () { return {}; }).then(function (body) { return { status: res.status, body: body }; });
    }, function () { clearTimeout(t); return { status: 0, body: {} }; });
  }
  function startPayment() {
    if (submitting) return;
    var lines = cart.items();
    if (!lines.length) { render(); return; }
    var key = cartKey();
    if (!payRequestId || key !== payCartKey) { payRequestId = newRequestId(); payCartKey = key; }   // same id on retry of the same cart
    var body = { items: lines.map(function (l) { return { id: l.product.id, qty: l.qty }; }) };
    setPayBusy(true);
    U.qs('#pay-error').hidden = true;
    fetchJSON(MA.store.checkoutApi + '/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Request-Id': payRequestId }, body: JSON.stringify(body) }).then(function (r) {
      var err = (r.body && r.body.error) || {};
      if (r.status === 200 && r.body && typeof r.body.url === 'string' && /^https:\/\/checkout\.stripe\.com\//.test(r.body.url)) {
        // Do not clear the bag yet: the shopper may cancel on Stripe and return to cart.html.
        location.assign(r.body.url);
        return;
      }
      setPayBusy(false);
      if (r.status === 400 && err.code === 'invalid_cart') {
        var notes = repairCart(err.lines);
        payRequestId = null;
        render();
        var ul = el('ul'); notes.forEach(function (n) { ul.appendChild(el('li', { text: n })); });
        payError('Your bag was updated', ul, false);
        U.announce('Your bag was updated. ' + notes.join(' '));
      } else if (r.status === 400 && err.code === 'empty_cart') {
        render();
      } else if (r.status === 400 && err.code === 'too_many_lines') {
        payError('That\u2019s a lot of different pieces', 'Payment accepts up to 20 different pieces at once. Please split your order into two.', false);
      } else if (r.status === 429) {
        payError('Too many attempts', 'Please wait a minute and try again.', true);
      } else if (r.status === 500 && err.code === 'config_error') {
        payError('Checkout is not available right now', 'Your bag is saved. Please try again later.', false);
      } else {
        payError('We couldn\u2019t open the payment page', 'Your bag is saved. Check your connection and try again.', true);
      }
    });
  }
  function initStripeCheckout() {
    U.qs('#checkout-form').hidden = true;
    U.qs('#pay-review').hidden = false;
    var h1 = U.qs('.page-head h1'); if (h1) h1.textContent = 'Checkout';
    var lead = U.qs('.page-head .lead'); if (lead) lead.textContent = 'Review your bag, then continue to our secure payment page.';
    var form = U.qs('#pay-form');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (submitting) return;
      if (F.validateForm(form).length) return;
      startPayment();
    });
  }

  function render() {
    var items = cart.items();
    var empty = U.qs('#checkout-empty'), layout = U.qs('#checkout-layout');
    if (!items.length) { empty.hidden = false; layout.hidden = true; return; }
    empty.hidden = true; layout.hidden = false;
    renderSummary(items, cart.totals());
    if (!MA.store.stripeCheckout) renderPaymentCopy(determineMethod(items));
  }

  MA.page = {
    init: function () {
      U.setMeta({ description: document.body.dataset.description, title: 'Checkout', noindex: true });
      if (!MA.store.open) {
        // Opening-soon mode: no order form at all; the bag stays saved.
        U.qs('#opening-soon').hidden = false;
        U.qs('#checkout-layout').hidden = true; U.qs('#checkout-empty').hidden = true;
        var h1 = U.qs('.page-head h1'); if (h1) h1.textContent = 'Checkout';
        var lead = U.qs('.page-head .lead'); if (lead) lead.textContent = 'Browse freely and fill your bag \u2014 ordering opens shortly.';
        L.initSignupForm(U.qs('#notify-form'), U.qs('#notify-status'), 'Notify me when ordering opens', 'Thank you \u2014 we\u2019ll email you when ordering opens.');
        return;
      }
      if (MA.store.stripeCheckout) initStripeCheckout(); else renderCountries();
      render();
      var lines = cart.items();
      if (lines.length && MA.analytics) MA.analytics.beginCheckout(lines, cart.totals());
      if (!MA.store.stripeCheckout) U.qs('#checkout-form').addEventListener('submit', placeOrder);
      cart.onChange(function () { if (!submitting) render(); });
    }
  };
  MA.checkout = { startPayment: startPayment, determineMethod: determineMethod, buildOrder: buildOrder, formatOrderText: formatOrderText, LAST_ORDER_KEY: LAST_ORDER_KEY };
})();

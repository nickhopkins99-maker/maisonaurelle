/* Maison Aurelle — order confirmation (reads the last order saved on this device) */
(function () {
  'use strict';
  window.MA = window.MA || {};
  var U = MA.utils, F = MA.forms, cfg = MA.config;
  var el = U.el;
  var LAST_ORDER_KEY = 'ma_last_order_v1';

  function fm(major) { return U.formatMoney(Math.round(Number(major) * 100)); }

  /* Same format as checkout.js formatOrderText (checkout.js is not loaded on this page). */
  function orderText(order) {
    if (MA.checkout && MA.checkout.formatOrderText) return MA.checkout.formatOrderText(order);
    var a = order.shippingAddress || {}, c = order.customer || {}, t = order.totals || {};
    var lines = ['Order ' + order.number + ' — ' + order.store, 'Date: ' + new Date(order.createdAt).toLocaleString(cfg.locale), ''];
    lines.push('Customer: ' + c.firstName + ' ' + c.lastName, 'Email: ' + c.email);
    if (c.phone) lines.push('Phone: ' + c.phone);
    lines.push('', 'Ship to:', c.firstName + ' ' + c.lastName, a.line1);
    if (a.line2) lines.push(a.line2);
    lines.push(a.city + ', ' + a.region + ' ' + a.postal, a.country, '', 'Items:');
    order.items.forEach(function (it) { lines.push(it.qty + ' × ' + it.name + ' (' + it.metal + ') — ' + fm(it.lineTotal)); });
    lines.push('', 'Subtotal: ' + fm(t.subtotal), 'Shipping: ' + (t.shipping === 0 ? 'Free' : fm(t.shipping)));
    lines.push(cfg.tax.label + ': ' + (Number(cfg.tax.rate) > 0 ? fm(t.tax) : 'Calculated on confirmation'), 'Total: ' + fm(t.total));
    if (order.notes) lines.push('', 'Notes: ' + order.notes);
    lines.push('', 'Prices are confirmed by reply before any payment is taken.');
    return lines.join('\n');
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).then(function () { return true; }, function () { return legacyCopy(text); });
    }
    return Promise.resolve(legacyCopy(text));
  }
  function legacyCopy(text) {
    var ta = el('textarea', { class: 'visually-hidden', 'aria-hidden': 'true' });
    ta.value = text;
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) { ok = false; }
    ta.remove();
    return ok;
  }

  function render(order) {
    var root = U.qs('#confirmation-root');
    root.textContent = '';
    var headings = {
      submitted: ['Thank you', ' — your order request is in.'],
      redirected: ['Thank you', ' for your order.'],
      'email-drafted': ['Almost done', ' — please send the email.']
    };
    var parts = headings[order.status] || headings.submitted;
    var h1 = el('h1', { class: 'confirm__title' }, el('span', { class: 'script', text: parts[0] }), parts[1]);
    root.appendChild(el('span', { class: 'ornament ornament--rosette confirm__rosette', 'aria-hidden': 'true' }));
    root.appendChild(el('p', { class: 'eyebrow', text: 'Order request' }));
    root.appendChild(h1);
    root.appendChild(el('p', { class: 'confirm__number' }, el('span', { class: 'text-muted text-sm', text: 'Order number' }), el('strong', { class: 'confirm__number-value', text: order.number })));

    if (order.status === 'email-drafted') {
      var text = orderText(order);
      var btnRow = el('div', { class: 'btn-row' });
      var again = el('a', { class: 'btn btn--primary', href: F.mailtoURL(cfg.email, 'Order request ' + order.number, text), text: 'Open email again' });
      var copy = el('button', { class: 'btn btn--secondary', type: 'button', text: 'Copy order details' });
      var copyStatus = el('p', { class: 'text-sm', role: 'status' });
      copy.addEventListener('click', function () {
        copyText(text).then(function (ok) {
          copyStatus.textContent = ok ? 'Order details copied to your clipboard.' : 'Copying isn’t available here — please select and copy the details below.';
          U.announce(copyStatus.textContent);
          if (!ok) { fallback.hidden = false; fallback.focus(); fallback.select(); }
        });
      });
      btnRow.appendChild(again); btnRow.appendChild(copy);
      var fallback = el('textarea', { class: 'confirm__fallback', readonly: true, rows: '10', hidden: true, 'aria-label': 'Order details' });
      fallback.value = text;
      root.appendChild(el('div', { class: 'confirm__email card' },
        el('p', {}, 'Your email app should have opened with your order details addressed to ', el('span', { class: 'nowrap-safe', text: cfg.email }), '. If it didn’t, open it again or copy the details and send them to that address.'),
        btnRow, copyStatus, fallback));
    }

    var list = el('ul', { class: 'summary-lines', 'aria-label': 'Items ordered' });
    order.items.forEach(function (it) {
      var p = MA.catalog.bySlug(it.slug);
      list.appendChild(el('li', { class: 'summary-line' },
        p ? MA.layout.productImage(p, { class: 'summary-line__thumb', alt: '', width: '64', height: '64' }, 'sm') : el('span', { class: 'summary-line__thumb' }),
        el('div', { class: 'summary-line__info' }, el('p', { class: 'summary-line__name', text: it.name }), el('p', { class: 'text-muted text-sm', text: it.metal + ' · Qty ' + it.qty })),
        el('p', { class: 'price', text: fm(it.lineTotal) })));
    });
    var dl = el('dl', { class: 'totals' });
    function row(label, value, cls) { dl.appendChild(el('div', { class: 'totals__row' + (cls ? ' ' + cls : '') }, el('dt', { text: label }), el('dd', { class: 'price', text: value }))); }
    row('Subtotal', fm(order.totals.subtotal));
    row('Shipping', order.totals.shipping === 0 ? 'Free' : fm(order.totals.shipping));
    row(cfg.tax.label, Number(cfg.tax.rate) > 0 ? fm(order.totals.tax) : 'Calculated on confirmation');
    row('Total', fm(order.totals.total), 'totals__row--total');

    var a = order.shippingAddress, c = order.customer;
    var addr = el('address', { class: 'confirm__address' });
    [c.firstName + ' ' + c.lastName, a.line1, a.line2, a.city + ', ' + a.region + ' ' + a.postal, a.country, c.email, c.phone].filter(Boolean).forEach(function (line, i) {
      if (i) addr.appendChild(el('br')); addr.appendChild(document.createTextNode(line));
    });

    var steps = order.status === 'redirected' ? [
      'Your payment is being processed on the secure payment page you were taken to.',
      'We check availability and send a shipping confirmation with tracking once your piece is on its way.',
      'Questions or changes? Reply to any email from us or write to ' + cfg.email + '.'
    ] : order.status === 'email-drafted' ? [
      'Send the email your mail app opened. Your order isn’t received until we have it.',
      'We reply within one business day to confirm availability, final pricing and how to pay. Nothing is charged until then.',
      'Once paid, we prepare and ship your piece and send tracking.'
    ] : [
      'We review your request and confirm availability within one business day.',
      'We email a secure payment link. Nothing is charged until you complete it.',
      'Once paid, we prepare and ship your piece and send tracking.'
    ];
    var ol = el('ol', { class: 'steps' });
    steps.forEach(function (s) { ol.appendChild(el('li', { text: s })); });

    root.appendChild(el('div', { class: 'confirm__grid' },
      el('section', { class: 'card', 'aria-labelledby': 'c-items' }, el('h2', { id: 'c-items', class: 'card__title', text: 'Your items' }), list, dl),
      el('div', { class: 'confirm__side' },
        el('section', { class: 'card', 'aria-labelledby': 'c-ship' }, el('h2', { id: 'c-ship', class: 'card__title', text: 'Ship to' }), addr),
        el('section', { class: 'card', 'aria-labelledby': 'c-next' }, el('h2', { id: 'c-next', class: 'card__title', text: 'What happens next' }), ol))));
    root.appendChild(el('div', { class: 'btn-row' }, el('a', { class: 'btn btn--primary', href: 'shop.html', text: 'Continue shopping' })));
  }

  /* ---- Stripe Checkout return: confirmation.html?session_id=cs_… ------------------------------------------ */
  function cents(n) { return U.formatMoney(Number(n) || 0); }
  function renderSession(s) {
    var root = U.qs('#confirmation-root');
    root.textContent = '';
    var paid = s.paid === true;
    root.appendChild(el('span', { class: 'ornament ornament--rosette confirm__rosette', 'aria-hidden': 'true' }));
    root.appendChild(el('p', { class: 'eyebrow', text: paid ? 'Order confirmed' : 'Payment processing' }));
    root.appendChild(el('h1', { class: 'confirm__title' }, el('span', { class: 'script', text: 'Thank you' }), paid ? ' for your order.' : ' \u2014 your payment is processing.'));
    if (s.orderNumber) root.appendChild(el('p', { class: 'confirm__number' }, el('span', { class: 'text-muted text-sm', text: 'Order number' }), el('strong', { class: 'confirm__number-value', text: s.orderNumber })));
    if (!paid) root.appendChild(el('p', { class: 'lead', text: 'Your payment is still being confirmed. We will email you as soon as it completes; there is no need to pay again.' }));
    var list = el('ul', { class: 'summary-lines', 'aria-label': 'Items ordered' });
    (s.items || []).forEach(function (it) {
      var p = MA.catalog.byId(it.id);
      list.appendChild(el('li', { class: 'summary-line' },
        p ? MA.layout.productImage(p, { class: 'summary-line__thumb', alt: '', width: '64', height: '64' }, 'sm') : el('span', { class: 'summary-line__thumb' }),
        el('div', { class: 'summary-line__info' }, el('p', { class: 'summary-line__name', text: it.name }), el('p', { class: 'text-muted text-sm', text: 'Qty ' + it.qty })),
        el('p', { class: 'price', text: cents(it.amount) })));
    });
    var a = s.amounts || {};
    var dl = el('dl', { class: 'totals' });
    function row(label, value, cls) { dl.appendChild(el('div', { class: 'totals__row' + (cls ? ' ' + cls : '') }, el('dt', { text: label }), el('dd', { class: 'price', text: value }))); }
    row('Subtotal', cents(a.subtotal));
    if (a.discount) row('Discount', '\u2212' + cents(a.discount));
    row('Shipping', a.shipping === 0 ? 'Free' : cents(a.shipping));
    row('Tax', a.tax ? cents(a.tax) : 'None');
    row('Total', cents(a.total), 'totals__row--total');
    var ship = s.shipTo ? 'Shipping to ' + [s.shipTo.city, s.shipTo.region].filter(Boolean).join(', ') + (s.shipTo.country ? ' (' + s.shipTo.country + ')' : '') + '.' : 'Shipping details are on your Stripe receipt.';
    var steps = paid ? ['Your payment is confirmed and a receipt is on its way' + (s.email ? ' to ' + s.email : '') + '.', 'We prepare your piece and email tracking once it ships.', 'Questions? Reply to your confirmation email.']
                     : ['Your bank is still confirming the payment.', 'We email you as soon as it completes, then prepare your piece.', 'Your bag is kept in this browser until the payment is confirmed.'];
    var ol = el('ol', { class: 'steps' }); steps.forEach(function (t) { ol.appendChild(el('li', { text: t })); });
    root.appendChild(el('div', { class: 'confirm__grid' },
      el('section', { class: 'card', 'aria-labelledby': 'c-items' }, el('h2', { id: 'c-items', class: 'card__title', text: 'Your items' }), list, dl),
      el('div', { class: 'confirm__side' },
        el('section', { class: 'card', 'aria-labelledby': 'c-ship' }, el('h2', { id: 'c-ship', class: 'card__title', text: 'Delivery' }), el('p', { text: ship })),
        el('section', { class: 'card', 'aria-labelledby': 'c-next' }, el('h2', { id: 'c-next', class: 'card__title', text: 'What happens next' }), ol))));
    root.appendChild(el('div', { class: 'btn-row' }, el('a', { class: 'btn btn--primary', href: 'shop.html', text: 'Continue shopping' })));
  }
  function renderSessionGeneric() {
    var root = U.qs('#confirmation-root');
    root.textContent = '';
    root.appendChild(el('div', { class: 'empty-state' },
      el('h1', { class: 'empty-state__title', text: 'Thank you' }),
      el('p', { text: 'Please check your email for your order confirmation. If you don\u2019t receive it within a few minutes, contact us.' }),
      el('div', { class: 'btn-row' },
        el('a', { class: 'btn btn--primary', href: 'shop.html', text: 'Continue shopping' }),
        el('a', { class: 'btn btn--secondary', href: 'contact.html', text: 'Contact us' }))));
  }
  function loadSession(id) {
    var root = U.qs('#confirmation-root');
    root.textContent = '';
    root.setAttribute('aria-busy', 'true');
    root.appendChild(el('p', { class: 'lead', role: 'status', text: 'Confirming your payment\u2026' }));
    if (!/^cs_(test|live)_[A-Za-z0-9]+$/.test(id) || !MA.store.checkoutApi) { root.removeAttribute('aria-busy'); renderSessionGeneric(); return; }
    var ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var t = ctrl ? setTimeout(function () { ctrl.abort(); }, 15000) : null;
    // An unknown/expired session answers 404, which the page handles quietly (generic thank-you). Chromium still prints
    // "Failed to load resource: 404" for any 4xx fetch regardless of JS handling; that one log line is unavoidable and
    // the test suite tolerates exactly the /session?id= pattern (b1-merged-tests/run.js).
    fetch(MA.store.checkoutApi + '/session?id=' + encodeURIComponent(id), { cache: 'no-store', credentials: 'omit', signal: ctrl ? ctrl.signal : undefined })
      .then(function (res) { clearTimeout(t); return res.ok ? res.json() : null; }, function () { clearTimeout(t); return null; })
      .then(function (s) {
        root.removeAttribute('aria-busy');
        if (!s || !s.orderNumber) { renderSessionGeneric(); return; }
        if (s.paid === true) {
          renderSession(s);
          MA.cart.clear();
          if (MA.analytics && MA.analytics.purchaseSession) MA.analytics.purchaseSession(s);
        } else if (s.status === 'open' || s.status === 'complete') {
          renderSession(s);                                   // processing: keep the bag, no purchase event
        } else renderSessionGeneric();
      })
      .catch(function () { root.removeAttribute('aria-busy'); renderSessionGeneric(); });
  }

  function renderNotFound() {
    var root = U.qs('#confirmation-root');
    root.textContent = '';
    root.appendChild(el('div', { class: 'empty-state' },
      el('h1', { class: 'empty-state__title', text: 'Order details not found' }),
      el('p', { text: 'We couldn’t find order details on this device. If you placed an order, check your email or contact us.' }),
      el('div', { class: 'btn-row' },
        el('a', { class: 'btn btn--primary', href: 'contact.html', text: 'Contact us' }),
        el('a', { class: 'btn btn--secondary', href: 'shop.html', text: 'Continue shopping' }))));
  }

  MA.page = {
    init: function () {
      U.setMeta({ description: document.body.dataset.description, title: 'Order Confirmation', noindex: true });
      var sessionId = U.getParam('session_id');
      if (sessionId) { loadSession(sessionId); return; }
      var order = U.storage.get(LAST_ORDER_KEY, null);
      var param = U.getParam('order');
      if (order && order.number && (!param || param === order.number)) {
        render(order);
        if (MA.analytics) MA.analytics.purchase(order);   // once per order number (deduped in storage)
      } else renderNotFound();
    }
  };
})();

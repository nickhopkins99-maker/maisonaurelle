/* Maison Aurelle — bag page */
(function () {
  'use strict';
  window.MA = window.MA || {};
  var U = MA.utils, L = MA.layout, cart = MA.cart, cfg = MA.config;
  var el = U.el;

  function orderSummary(totals) {
    var dl = el('dl', { class: 'totals' });
    function row(label, value, cls) {
      dl.appendChild(el('div', { class: 'totals__row' + (cls ? ' ' + cls : '') }, el('dt', { text: label }), el('dd', { class: 'price', text: value })));
    }
    row('Subtotal', U.formatMoney(totals.subtotal));
    row('Shipping', totals.shipping === 0 ? 'Free' : U.formatMoney(totals.shipping));
    if (MA.store.taxNote) row('Tax', MA.store.taxNote);
    else if (Number(cfg.tax.rate) > 0) row(cfg.tax.label, U.formatMoney(totals.tax));
    else row(cfg.tax.label, 'Calculated on confirmation');
    row('Total', U.formatMoney(totals.total), 'totals__row--total');
    return dl;
  }

  function render() {
    var linesWrap = U.qs('#cart-lines'), summary = U.qs('#cart-summary'), empty = U.qs('#cart-empty'), layout = U.qs('#cart-layout');
    var lines = cart.items();
    if (!lines.length) { empty.hidden = false; layout.hidden = true; return; }
    empty.hidden = true; layout.hidden = false;
    L.renderCartLines(linesWrap, { compact: false });
    var t = cart.totals();
    summary.textContent = '';
    summary.appendChild(el('h2', { class: 'order-summary__title', text: 'Summary' }));
    summary.appendChild(orderSummary(t));
    summary.appendChild(L.freeShippingNote(t));
    summary.appendChild(MA.store.open ? el('a', { class: 'btn btn--primary btn--block', href: 'checkout.html', text: 'Proceed to checkout' })
      : el('a', { class: 'btn btn--primary btn--block', href: 'checkout.html#opening-soon', text: 'Ordering opens soon' }));
    summary.appendChild(el('a', { class: 'btn btn--secondary btn--block', href: 'shop.html', text: 'Continue shopping' }));
    // the payment footnote describes a flow that only exists while the store is open
    if (MA.store.open) summary.appendChild(el('p', { class: 'text-muted text-sm', text: MA.store.stripeCheckout ? 'These totals are a preview; the final amount is shown on the secure payment page.' : 'Orders are placed as requests; prices are confirmed by reply before any payment is taken.' }));
  }

  MA.page = {
    init: function () {
      U.setMeta({ description: document.body.dataset.description, title: 'Your Bag', noindex: true });
      render();
      cart.onChange(function () {
        // Lines re-render themselves on change; refresh totals/empty state only.
        var lines = cart.items();
        var empty = U.qs('#cart-empty'), layout = U.qs('#cart-layout');
        if (!lines.length) { empty.hidden = false; layout.hidden = true; return; }
        empty.hidden = true; layout.hidden = false;
        var summary = U.qs('#cart-summary');
        var t = cart.totals();
        var old = U.qs('.totals', summary); if (old) old.replaceWith(orderSummary(t));
        var oldShip = U.qs('.ship-progress-wrap, .ship-progress', summary); if (oldShip) oldShip.replaceWith(L.freeShippingNote(t));
        // External change (another tab, drawer): sync the line list if it no longer matches.
        var rendered = U.qsa('#cart-lines .cart-line').map(function (n) { return n.dataset.id + ':' + U.qs('.qty__input', n).value; }).join('|');
        var actual = lines.map(function (l) { return l.product.id + ':' + l.qty; }).join('|');
        if (rendered === actual) return;
        // Preserve focus across the re-render (same row, same control).
        var active = document.activeElement, row = active && active.closest ? active.closest('.cart-line') : null;
        var focusId = row ? row.dataset.id : null, focusClass = active ? active.className : '';
        L.renderCartLines(U.qs('#cart-lines'), { compact: false });
        if (focusId) {
          var newRow = U.qs('#cart-lines .cart-line[data-id="' + focusId + '"]');
          var target = newRow ? U.qsa('button, input, a', newRow).filter(function (n) { return n.className === focusClass; })[0] : null;
          if (target) target.focus();
        }
      });
    }
  };
  MA.pageCart = { orderSummary: orderSummary };
})();

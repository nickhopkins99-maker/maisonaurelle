/* Maison Aurelle — product detail page */
(function () {
  'use strict';
  window.MA = window.MA || {};
  var U = MA.utils, C = MA.catalog, L = MA.layout, cfg = MA.config;
  var el = U.el;

  var ORIGINS = { 'cuffs-bangles': '50% 50%', earrings: '50% 45%', necklaces: '50% 60%', sets: '50% 50%', rings: '50% 45%' };

  function notFound() {
    var root = U.qs('#product-root');
    root.textContent = '';
    U.qs('#related-section').hidden = true;
    U.qs('#crumb-current').textContent = 'Piece not found';
    root.appendChild(el('div', { class: 'empty-state' },
      el('h1', { class: 'empty-state__title', text: 'Piece not found' }),
      el('p', { text: 'We couldn’t find that piece. It may have been renamed or retired from the collection.' }),
      el('div', { class: 'btn-row' },
        el('a', { class: 'btn btn--primary', href: 'shop.html', text: 'Browse the collection' }),
        el('a', { class: 'btn btn--secondary', href: 'index.html', text: 'Go home' }))));
    U.setMeta({ title: 'Piece Not Found', description: 'This piece is no longer in the Maison Aurelle collection. Browse sculptural gold cuffs, bangles, earrings and coin necklaces in 18K PVD steel.', noindex: true });
  }

  function gallery(product) {
    var detail = false;
    if (!product.hasImage) {
      return el('div', { class: 'gallery' }, el('div', { class: 'gallery__main gallery__main--static' }, L.imageFallback(product, 'lg')));
    }
    var img = L.productImage(product, { loading: 'eager', fetchpriority: 'high' });   // PDP LCP element
    img.style.transformOrigin = ORIGINS[product.type] || '50% 50%';
    var main = el('button', { class: 'gallery__main', type: 'button', 'aria-label': 'Toggle detail view of ' + product.name, 'aria-pressed': 'false' }, img);
    var thumb1 = el('button', { class: 'gallery__thumb', type: 'button', 'aria-pressed': 'true', 'aria-label': 'View 1' }, L.productImage(product, { alt: '', width: '120', height: '120' }, 'sm'));
    var thumb2 = el('button', { class: 'gallery__thumb gallery__thumb--detail', type: 'button', 'aria-pressed': 'false', 'aria-label': 'View 2 — detail' }, L.productImage(product, { alt: '', width: '120', height: '120' }, 'sm'));
    var t2img = U.qs('img', thumb2); if (t2img) t2img.style.transformOrigin = img.style.transformOrigin;
    function set(d) {
      detail = d;
      main.classList.toggle('is-detail', d);
      main.setAttribute('aria-pressed', d ? 'true' : 'false');
      thumb1.setAttribute('aria-pressed', d ? 'false' : 'true');
      thumb2.setAttribute('aria-pressed', d ? 'true' : 'false');
      img.alt = L.altFor(product) + (d ? ' — detail view' : '');
    }
    main.addEventListener('click', function () { set(!detail); });
    thumb1.addEventListener('click', function () { set(false); });
    thumb2.addEventListener('click', function () { set(true); });
    return el('div', { class: 'gallery' }, main,
      el('div', { class: 'gallery__thumbs', role: 'group', 'aria-label': 'Product views' }, thumb1, thumb2));
  }

  /* Buy box: quantity + Add to bag, or "Price on request" with a link to ask about the piece. */
  function buyBox(product) {
    if (product.priceOnRequest) {
      // While the store is closed there is no inbox to ask: the price row's "Price on request" stands alone.
      if (!(MA.store && MA.store.open)) return null;
      var href = 'contact.html?topic=' + encodeURIComponent('Price on request') + '&piece=' + encodeURIComponent(product.name);
      return el('div', { class: 'pdp__buy pdp__buy--request' },
        el('a', { class: 'btn btn--primary btn--block-mobile', href: href, text: 'Ask about this piece' }),
        el('p', { class: 'pdp__request-note text-muted', text: 'This piece is priced after a quote from the workshop. Ask and we’ll reply with the price within two business days.' }));
    }
    var qty = 1;
    var qtyInput = el('input', { class: 'qty__input', id: 'pdp-qty', type: 'number', inputmode: 'numeric', min: '1', max: String(cfg.maxQtyPerItem), value: '1' });
    var dec = el('button', { class: 'qty__btn', type: 'button', 'aria-label': 'Decrease quantity of ' + product.name, text: '−' });
    var inc = el('button', { class: 'qty__btn', type: 'button', 'aria-label': 'Increase quantity of ' + product.name, text: '+' });
    function setQty(n) {
      n = Math.floor(Number(n)); if (isNaN(n) || n < 1) n = 1; if (n > cfg.maxQtyPerItem) n = cfg.maxQtyPerItem;
      qty = n; qtyInput.value = String(n);
    }
    dec.addEventListener('click', function () { setQty(qty - 1); });
    inc.addEventListener('click', function () { setQty(qty + 1); });
    qtyInput.addEventListener('change', function () { setQty(qtyInput.value); });
    var stepper = el('div', { class: 'qty qty--lg' }, el('label', { class: 'visually-hidden', 'for': 'pdp-qty', text: 'Quantity' }), dec, qtyInput, inc);
    var addBtn = el('button', { class: 'btn btn--primary btn--block-mobile', type: 'button', 'aria-label': 'Add ' + product.name + ' to bag', text: 'Add to bag' });
    addBtn.addEventListener('click', function () { L.addToBag(product, qty, addBtn); });
    return el('div', { class: 'pdp__buy' }, stepper, addBtn);
  }

  function firstSentence(text) { var m = /^(.+?[.!?])(\s|$)/.exec(text || ''); return m ? m[1] : text; }

  /* "Complete the look" when the piece is in a Mix-the-stories look, else "More from <collection>". */
  function renderRelated(product, coll) {
    var section = U.qs('#related-section'), grid = U.qs('#related-grid'), h2 = U.qs('#related-title'), eyebrow = U.qs('#related-eyebrow');
    var look = C.lookFor(product), foot = U.qs('#related-foot'), all = U.qs('#related-all');
    grid.textContent = '';
    h2.textContent = '';
    if (look) {
      eyebrow.textContent = 'Mix the stories';
      h2.appendChild(document.createTextNode('Complete the '));
      h2.appendChild(el('span', { class: 'script', text: 'look' }));
      grid.className = 'look-single';
      grid.appendChild(L.lookCard(look, { wide: true, current: product }));
      foot.hidden = true;
    } else {
      eyebrow.textContent = coll ? coll.line : 'Related';
      h2.textContent = coll ? 'More from ' + coll.name : 'You may also like';
      grid.className = 'product-grid product-grid--4';
      C.related(product, 4).forEach(function (p, i) { grid.appendChild(L.productCard(p, i)); });
      if (coll) { all.href = 'shop.html?collection=' + coll.slug; foot.hidden = false; } else foot.hidden = true;
    }
    section.hidden = false;
  }

  /* "<Piece> | Maison Aurelle" within 60 characters: the full lookbook name when it fits, else the piece name with a
     short finish, else the piece name alone. Twin sheet names get their style number. */
  function metaTitle(product) {
    var twins = C.all().filter(function (p) { return p.name === product.name; }).length > 1;
    if (twins) return product.name + ' No. ' + product.id.replace(/^\D+/, '');
    var room = 60 - (' | ' + cfg.name).length;
    var parts = C.nameParts(product);
    var cands = [product.name, parts.title + (parts.finish ? ' in 18K Gold' : ''), parts.title];
    for (var i = 0; i < cands.length; i++) if (cands[i].length <= room) return cands[i];
    return parts.title;
  }

  function render(product) {
    var root = U.qs('#product-root');
    root.textContent = '';
    var coll = C.collection(product.collection);
    U.qs('#crumb-current').textContent = C.nameParts(product).title;
    var crumb = U.qs('#crumb-collection');
    if (crumb && coll) { crumb.textContent = coll.name; crumb.href = 'shop.html?collection=' + coll.slug; }

    var details = el('ul', { class: 'details-list' });
    (product.details || []).forEach(function (d) { details.appendChild(el('li', { text: d })); });
    var parts = C.nameParts(product);
    var h1 = el('h1', { class: 'pdp__title' }, el('span', { class: 'pdp__title-name', text: parts.title }));
    if (parts.finish) { h1.appendChild(document.createTextNode(' ')); h1.appendChild(el('span', { class: 'pdp__title-finish', text: parts.finish })); }

    var info = el('div', { class: 'pdp__info' },
      coll ? el('p', { class: 'eyebrow pdp__eyebrow' }, el('a', { href: 'shop.html?collection=' + coll.slug, text: coll.name })) : null,
      h1,
      parts.finish ? null : el('p', { class: 'pdp__metal text-muted', text: product.metal }),
      el('div', { class: 'pdp__price-row' }, L.priceBlock(product, true), L.badge(product)),
      el('p', { class: 'pdp__desc', text: product.description }),
      buyBox(product),
      el('p', { class: 'pdp__shipnote text-muted' },
        'Complimentary shipping over ' + U.formatMoney(U.toCents(cfg.shipping.freeThreshold)) + ' · ',
        el('a', { href: 'shipping-returns.html#returns', text: '30-day returns' })),
      el('section', { class: 'pdp__details', 'aria-labelledby': 'details-title' },
        el('h2', { id: 'details-title', class: 'pdp__h2', text: 'Details' }), details),
      coll ? el('figure', { class: 'pdp__quote' },
        el('blockquote', {}, el('p', { text: '“' + firstSentence(coll.story[0]) + '”' })),
        el('figcaption', {}, '— ', el('a', { href: 'shop.html?collection=' + coll.slug, text: coll.name }))) : null);

    root.appendChild(el('div', { class: 'pdp' }, gallery(product), info));
    renderRelated(product, coll);

    U.setMeta({ title: metaTitle(product), description: C.productDescription(product), path: 'product.html?slug=' + product.slug, type: 'product',
      image: product.hasImage ? product.image : null, imageAlt: product.hasImage ? L.altFor(product) : null });
    var ld = {
      '@context': 'https://schema.org', '@type': 'Product',
      name: product.name, description: product.description, sku: product.id,
      category: coll ? coll.name : product.collection, brand: { '@type': 'Brand', name: cfg.name }
    };
    // price-on-request pieces carry no Offer: there is no price to state
    if (C.purchasable(product)) {
      ld.offers = { '@type': 'Offer', price: (U.toCents(product.price) / 100).toFixed(2), priceCurrency: cfg.currency,
        availability: 'https://schema.org/InStock', itemCondition: 'https://schema.org/NewCondition', url: U.absUrl('product.html?slug=' + product.slug) };
    }
    if (product.hasImage) ld.image = U.absUrl(product.image);
    L.injectJSONLD('product-jsonld', ld);
    if (MA.analytics) MA.analytics.viewItem(product);
  }

  MA.page = {
    init: function () {
      var product = C.bySlug(U.getParam('slug') || '');
      if (product) {
        var pink = MA.config.alternatePinkProducts && (U.getParam('look') === 'pink' ||
          (U.getParam('look') === null && C.all().indexOf(product) % 2 === 1));
        MA.layout.setTheme(pink ? 'blush' : MA.layout.themeForCollection(product.collection));
        render(product);
      } else notFound();
    }
  };
})();

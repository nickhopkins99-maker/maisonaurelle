/* Maison Aurelle — home page */
(function () {
  'use strict';
  window.MA = window.MA || {};
  var U = MA.utils, C = MA.catalog, L = MA.layout, F = MA.forms, cfg = MA.config;
  var el = U.el;

  /* "Six stories": banner photo, or a typographic tile (name in script + tile ornament) until studio photos exist. */
  function storyTile(c) {
    var banner = C.bannerProduct(c);
    var media = banner
      ? el('span', { class: 'story-tile__media' }, L.productImage(banner, { alt: '' }))
      : el('span', { class: 'story-tile__media story-tile__media--type', 'aria-hidden': 'true' },
        el('span', { class: 'ornament ornament--star story-tile__mark' }),
        el('span', { class: 'story-tile__script script', text: c.name }));
    return el('a', { class: 'story-tile', href: 'shop.html?collection=' + c.slug },
      media,
      el('span', { class: 'story-tile__body' },
        el('h3', { class: 'story-tile__name', text: c.name }),
        el('span', { class: 'story-tile__line', text: c.line }),
        el('span', { class: 'story-tile__cta', text: 'Discover' })));
  }
  function renderStories() {
    var grid = U.qs('#story-grid');
    if (!grid) return;
    grid.textContent = '';
    C.collections().forEach(function (c) { grid.appendChild(storyTile(c)); });
  }

  function renderLooks() {
    var grid = U.qs('#look-grid');
    if (!grid) return;
    grid.textContent = '';
    C.looks().forEach(function (look) { grid.appendChild(L.lookCard(look)); });
  }

  function renderFeatured() {
    var grid = U.qs('#featured-grid');
    if (!grid) return;
    grid.textContent = '';
    C.featured(4).forEach(function (p, i) { grid.appendChild(L.productCard(p, i)); });
  }

  function initNewsletter() {
    L.initSignupForm(U.qs('#newsletter-form'), U.qs('#newsletter-status'), 'Newsletter sign-up', 'Thank you \u2014 you\u2019re on the list.');
  }


  MA.page = {
    init: function () {
      U.setMeta({ description: document.body.dataset.description, title: ((cfg.season && cfg.season.name) ? cfg.season.name + ': ' : '') + 'Gold Statement Jewelry', path: 'index.html' });
      renderStories();
      renderLooks();
      renderFeatured();
      initNewsletter();
      L.brandJSONLD();
    }
  };
})();

/* Maison Aurelle — shop page.
   Two views on one page:
   - Collection view (shop.html?collection=<slug>): banner, the story, "The Lineup" (lookbook order), "More from …",
     links to the other stories. Slim toolbar: count, Type filter (when the story spans several types), sort.
   - Shop all (shop.html): collection chips (links to the story pages), type chips, search, sort; lineup first.
   Old category links (shop.html?category=molten-cuffs) are rewritten in place to ?collection=molten-tide. */
(function () {
  'use strict';
  window.MA = window.MA || {};
  var U = MA.utils, C = MA.catalog, L = MA.layout, cfg = MA.config;
  var el = U.el;
  var SORTS = ['featured', 'newest', 'price-asc', 'price-desc', 'name'];
  var state = { collection: '', type: '', sort: 'featured', q: '' };
  var coll = null; // the collection object in collection view (fixed per page load)

  function readState() {
    var legacy = U.getParam('category');
    if (legacy !== null) {
      var target = C.collectionForLegacy(legacy) || C.collection(legacy);
      U.setParams({ category: null, collection: target ? target.slug : null });
    }
    var c = U.getParam('collection') || '';
    state.collection = C.collection(c) ? c : '';
    if (c && !state.collection) U.setParams({ collection: null });
    var type = U.getParam('type') || '';
    state.type = C.isType(type) ? type : '';
    var sort = U.getParam('sort') || 'featured';
    state.sort = SORTS.indexOf(sort) !== -1 ? sort : 'featured';
    state.q = state.collection ? '' : (U.getParam('q') || '').trim();
  }
  function writeState() {
    U.setParams({ collection: state.collection || null, type: state.type || null, sort: state.sort === 'featured' ? null : state.sort, q: state.q || null });
  }

  /* ---- Collection view -------------------------------------------------------------------------------- */
  /* Typographic banner: the name must fit its overflow-hidden frame at every width. Start from the CSS size and step the
     script down (never below 1.5rem) while the frame still clips; re-fit on resize and once the script font has loaded. */
  function fitBannerScript(box) {
    var span = U.qs('.coll-hero__script', box);
    if (!span) return;
    var fitting = false;
    function fit() {
      if (fitting) return;
      fitting = true;
      span.style.fontSize = '';
      var size = parseFloat(getComputedStyle(span).fontSize), min = 24, guard = 40;
      while (guard-- && size > min && (box.scrollHeight > box.clientHeight + 1 || box.scrollWidth > box.clientWidth + 1 || span.scrollWidth > span.clientWidth + 1)) {
        size = Math.max(min, Math.floor(size * 0.94));
        span.style.fontSize = size + 'px';
      }
      fitting = false;
    }
    fit();
    var t;
    window.addEventListener('resize', function () { clearTimeout(t); t = setTimeout(fit, 120); });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
  }
  function typesIn(list) {
    return C.types().filter(function (t) { return list.some(function (p) { return p.type === t.slug; }); });
  }
  function renderCollectionHead() {
    var page = U.qs('#shop-main');
    page.classList.add('is-collection');
    var crumb = U.qs('#crumb-current');
    crumb.textContent = coll.name;
    var crumbShop = U.qs('#crumb-shop'); if (crumbShop) crumbShop.hidden = false;

    // banner: text left, photo right (stacked on phones); typographic banner until studio photos exist
    var h1 = U.qs('#shop-title');
    h1.textContent = coll.name;
    h1.className = 'coll-hero__title';
    var hero = U.qs('#collection-hero');
    hero.textContent = ''; // idempotent re-init (h1 is held above and re-attached)
    var banner = C.bannerProduct(coll);
    var media = banner
      ? el('div', { class: 'coll-hero__media' }, L.productImage(banner, { loading: 'eager', fetchpriority: 'high', alt: L.altFor(banner) }))
      : el('div', { class: 'coll-hero__media coll-hero__media--type', role: 'img', 'aria-label': coll.name + ' — studio photography coming soon' },
        el('span', { class: 'ornament ornament--star coll-hero__mark', 'aria-hidden': 'true' }),
        el('span', { class: 'coll-hero__script script', 'aria-hidden': 'true', text: coll.name }));
    hero.appendChild(el('div', { class: 'container coll-hero__grid' },
      el('div', { class: 'coll-hero__text' },
        el('p', { class: 'eyebrow', text: (cfg.season && cfg.season.name) || '' }),
        h1,
        el('p', { class: 'coll-hero__line', text: coll.line })),
      media));
    hero.hidden = false;
    U.qs('#shop-head').hidden = true;
    if (!banner) fitBannerScript(media);

    var story = U.qs('#collection-story');
    story.textContent = '';
    story.appendChild(el('span', { class: 'ornament ornament--rosette story-block__mark', 'aria-hidden': 'true' }));
    coll.story.forEach(function (para, i) { story.appendChild(el('p', { class: i === 0 ? 'story-block__lead' : 'story-block__p', text: para })); });
    story.hidden = false;

    U.qs('#lineup-eyebrow').textContent = coll.lineupTitle || 'The Lineup';
    U.qs('#more-title').textContent = 'More from ' + coll.name;

    var others = U.qs('#other-stories-list');
    others.textContent = '';
    C.collections().filter(function (c) { return c.slug !== coll.slug; }).forEach(function (c) {
      others.appendChild(el('li', {}, el('a', { class: 'story-link', href: 'shop.html?collection=' + c.slug },
        el('span', { class: 'story-link__name', text: c.name }), el('span', { class: 'story-link__line', text: c.line }))));
    });
    U.qs('#other-stories').hidden = false;

    // Type filter only when the story spans several types
    var tlist = typesIn(C.byCollection(coll.slug));
    var tfield = U.qs('#type-field'), tsel = U.qs('#type');
    if (tlist.length > 1) {
      tsel.textContent = '';
      tsel.appendChild(el('option', { value: '', text: 'All pieces' }));
      tlist.forEach(function (t) { tsel.appendChild(el('option', { value: t.slug, text: t.name })); });
      tfield.hidden = false;
    } else { tfield.hidden = true; state.type = ''; }

    var cover = banner || C.byCollection(coll.slug).filter(function (p) { return p.hasImage; })[0];
    U.setMeta({ image: cover ? cover.image : null, imageAlt: cover ? L.altFor(cover) : null,
      title: coll.title || coll.name, description: C.collectionDescription(coll), path: 'shop.html?collection=' + coll.slug });
  }

  /* ---- Shop all ------------------------------------------------------------------------------------------ */
  function renderAllHead() {
    var group = U.qs('#collection-chips');
    group.textContent = '';
    group.appendChild(el('li', {}, el('a', { class: 'chip', href: 'shop.html', 'aria-current': 'page', text: 'All' })));
    C.collections().forEach(function (c) { group.appendChild(el('li', {}, el('a', { class: 'chip', href: 'shop.html?collection=' + c.slug, text: c.name }))); });
    U.qs('#collection-chips-wrap').hidden = false;
    U.qs('#search-form').hidden = false;
    U.setMeta({ title: 'Shop All Jewelry', description: U.qs('meta[name="description"]').getAttribute('content'), path: 'shop.html' });
  }
  function renderTypeChips() {
    var group = U.qs('#type-chips');
    group.textContent = '';
    [{ slug: '', name: 'All types' }].concat(C.types()).forEach(function (t) {
      var chip = el('button', { class: 'chip', type: 'button', 'data-type': t.slug, 'aria-pressed': state.type === t.slug ? 'true' : 'false', text: t.name });
      chip.addEventListener('click', function () { state.type = t.slug; writeState(); scheduleUpdate(); });
      group.appendChild(chip);
    });
    U.qs('#type-chips-wrap').hidden = false;
  }
  function syncControls() {
    U.qsa('#type-chips .chip').forEach(function (chip) { chip.setAttribute('aria-pressed', chip.dataset.type === state.type ? 'true' : 'false'); });
    var tsel = U.qs('#type'); if (tsel && tsel.value !== state.type) tsel.value = state.type;
    var sortSel = U.qs('#sort'); if (sortSel && sortSel.value !== state.sort) sortSel.value = state.sort;
    var search = U.qs('#search'); if (search && search.value.trim() !== state.q) search.value = state.q;
  }

  /* ---- Grids ------------------------------------------------------------------------------------------------ */
  var skeletonTimer = null;
  function skeletonCards(n) {
    var grid = U.qs('#product-grid');
    grid.setAttribute('aria-busy', 'true');
    grid.textContent = '';
    for (var i = 0; i < n; i++) grid.appendChild(el('div', { class: 'product-card product-card--skeleton', 'aria-hidden': 'true' }, el('span', { class: 'skeleton skeleton--well' }), el('span', { class: 'skeleton skeleton--line' }), el('span', { class: 'skeleton skeleton--line skeleton--short' })));
  }
  /* Re-render on the next frame; if that takes longer than 50 ms, show skeleton cards meanwhile. */
  function scheduleUpdate() {
    clearTimeout(skeletonTimer);
    skeletonTimer = setTimeout(function () { skeletonCards(8); }, 50);
    requestAnimationFrame(function () { update(); });
  }
  function fill(grid, list, offset) {
    grid.textContent = '';
    var frag = document.createDocumentFragment();
    list.forEach(function (p, i) { frag.appendChild(L.productCard(p, i + (offset || 0))); });
    grid.appendChild(frag);
    grid.removeAttribute('aria-busy');
  }

  function update() {
    syncControls();
    var count = U.qs('#result-count'), empty = U.qs('#empty-state');
    clearTimeout(skeletonTimer);
    var base = coll ? C.byCollection(coll.slug) : C.all();
    var list = base.filter(function (p) { return !state.type || p.type === state.type; });
    list = C.search(list, state.q);
    list = C.sort(list, state.sort);
    var noun = function (n) { return n === 1 ? 'piece' : 'pieces'; };
    if (coll) {
      var line = list.filter(function (p) { return p.lineup; }), more = list.filter(function (p) { return !p.lineup; });
      if (state.sort === 'featured') line.sort(function (a, b) { return a.lineupOrder - b.lineupOrder; });
      fill(U.qs('#product-grid'), line, 0);
      fill(U.qs('#more-grid'), more, line.length);
      U.qs('#lineup-section').hidden = !line.length;
      U.qs('#more-section').hidden = !more.length;
      count.textContent = list.length === base.length ? base.length + ' ' + noun(base.length) + ' in ' + coll.name
        : 'Showing ' + list.length + ' of ' + base.length + ' ' + noun(base.length);
    } else {
      fill(U.qs('#product-grid'), list, 0);
      count.textContent = 'Showing ' + list.length + ' of ' + base.length + ' ' + noun(base.length);
    }
    if (!list.length) {
      empty.hidden = false;
      U.qs('#empty-msg', empty).textContent = state.q ? 'No pieces match ‘' + state.q + '’.' : 'No pieces match these filters.';
    } else empty.hidden = true;
  }

  function initControls() {
    var sortSel = U.qs('#sort');
    sortSel.addEventListener('change', function () { state.sort = sortSel.value; writeState(); scheduleUpdate(); });
    var tsel = U.qs('#type');
    tsel.addEventListener('change', function () { state.type = tsel.value; writeState(); scheduleUpdate(); });
    var search = U.qs('#search');
    var onSearch = U.debounce(function () { state.q = search.value.trim(); writeState(); scheduleUpdate(); }, 200);
    search.addEventListener('input', function () { U.qs('#result-count').textContent = 'Searching…'; onSearch(); });
    U.qs('#search-form').addEventListener('submit', function (e) { e.preventDefault(); state.q = search.value.trim(); writeState(); update(); });
    U.qs('#clear-filters').addEventListener('click', function () {
      state.type = ''; state.q = ''; state.sort = 'featured';
      writeState(); update(); (coll ? U.qs('#sort') : search).focus();
    });
    window.addEventListener('popstate', function () { readState(); update(); });
    if (!coll && location.hash === '#search') search.focus();
    window.addEventListener('hashchange', function () { if (location.hash === '#search') search.focus(); });
  }

  MA.page = {
    init: function () {
      readState();
      coll = state.collection ? C.collection(state.collection) : null;
      L.setTheme(L.themeForCollection(state.collection));
      if (coll) renderCollectionHead(); else { renderAllHead(); renderTypeChips(); }
      initControls();
      update();
      document.documentElement.classList.remove('coll-pending');
    }
  };
})();

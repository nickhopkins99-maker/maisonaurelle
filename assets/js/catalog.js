/* Maison Aurelle — catalog queries (MA.catalog): products, story collections, types, lineup and looks */
(function () {
  'use strict';
  window.MA = window.MA || {};
  var U = MA.utils;
  var PRODUCTS = MA.PRODUCTS || [];
  var COLLECTIONS = MA.COLLECTIONS || [];
  var LOOKS = MA.LOOKS || [];
  var TYPES = [
    { slug: 'cuffs-bangles', name: 'Cuffs & Bangles' },
    { slug: 'earrings', name: 'Earrings' },
    { slug: 'necklaces', name: 'Necklaces' },
    { slug: 'sets', name: 'Sets' },
    { slug: 'rings', name: 'Rings' }
  ];
  /* Prices are baked into products.js by tools/build_public.mjs. */

  function all() { return PRODUCTS.slice(); }
  function bySlug(slug) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].slug === slug) return PRODUCTS[i];
    return null;
  }
  function byId(id) {
    for (var i = 0; i < PRODUCTS.length; i++) if (PRODUCTS[i].id === id) return PRODUCTS[i];
    return null;
  }
  function purchasable(p) { return !!p && !p.priceOnRequest && p.price > 0; }

  /* ---- Collections (stories) ---------------------------------------------- */
  function collections() { return COLLECTIONS.slice(); }
  function collection(slug) {
    for (var i = 0; i < COLLECTIONS.length; i++) if (COLLECTIONS[i].slug === slug) return COLLECTIONS[i];
    return null;
  }
  function collectionName(slug) { var c = collection(slug); return c ? c.name : ''; }
  function collectionForLegacy(cat) {
    for (var i = 0; i < COLLECTIONS.length; i++) if (COLLECTIONS[i].legacy === cat) return COLLECTIONS[i];
    return null;
  }
  function byCollection(slug) { return PRODUCTS.filter(function (p) { return p.collection === slug; }); }
  function byLineup(a, b) { return (a.lineupOrder || 0) - (b.lineupOrder || 0); }
  /* Lineup pieces in lookbook order (one collection, or all 48). */
  function lineup(slug) {
    return PRODUCTS.filter(function (p) { return p.lineup && (!slug || p.collection === slug); }).sort(byLineup);
  }
  function bannerProduct(c) { var p = c && c.banner ? byId(c.banner) : null; return p && p.hasImage ? p : null; }

  /* ---- Types ------------------------------------------------------------------ */
  function types() { return TYPES.slice(); }
  function typeName(slug) { for (var i = 0; i < TYPES.length; i++) if (TYPES[i].slug === slug) return TYPES[i].name; return ''; }
  function isType(slug) { return !!typeName(slug); }

  /* ---- Looks ("Mix the stories") ------------------------------------------- */
  function looks() {
    return LOOKS.map(function (l) {
      return { slug: l.slug, name: l.name, mood: l.mood, recipe: l.recipe, pieces: l.pieces.map(byId).filter(Boolean) };
    });
  }
  function lookFor(product) {
    var list = looks();
    for (var i = 0; i < list.length; i++) if (list[i].pieces.indexOf(product) !== -1) return list[i];
    return null;
  }
  function lookTotal(look) { return look.pieces.filter(purchasable).reduce(function (s, p) { return s + U.toCents(p.price); }, 0); }

  /* ---- Names ---------------------------------------------------------------- */
  /* Lookbook names carry their finish ("Wave Cuff in 18K Gold-Plated Stainless Steel"): cards set the piece name in the
     display face and the finish beneath it. The accessible name stays the full name. */
  var FINISH_RE = /^(.*?) (in (?:Hammered |High-Polish )?(?:18K|Gold)\b.*)$/;
  function nameParts(p) {
    var m = FINISH_RE.exec(p.name || '');
    return m ? { title: m[1], finish: m[2] } : { title: p.name, finish: '' };
  }

  function newestFirst(a, b) { return String(b.added || '').localeCompare(String(a.added || '')); }
  /* Curated order: the lineup in lookbook order, then featured pieces, then the rest in catalog order. */
  function curated(a, b) {
    var la = a.lineup ? 1 : 0, lb = b.lineup ? 1 : 0;
    if (la !== lb) return lb - la;
    if (la) return byLineup(a, b);
    var fa = a.featured ? 1 : 0, fb = b.featured ? 1 : 0;
    if (fa !== fb) return fb - fa;
    return newestFirst(a, b) || PRODUCTS.indexOf(a) - PRODUCTS.indexOf(b);
  }

  function featured(limit) {
    limit = limit === undefined ? 4 : limit;
    var list = all().sort(function (a, b) {
      var fa = a.featured ? 1 : 0, fb = b.featured ? 1 : 0;
      if (fa !== fb) return fb - fa;
      return curated(a, b);
    });
    return list.slice(0, limit);
  }

  function related(product, limit) {
    limit = limit === undefined ? 4 : limit;
    if (!product) return [];
    var same = byCollection(product.collection).filter(function (p) { return p.id !== product.id; });
    same.sort(function (a, b) {
      var la = a.lineup ? 1 : 0, lb = b.lineup ? 1 : 0;
      if (la !== lb) return lb - la;
      var ia = a.hasImage ? 1 : 0, ib = b.hasImage ? 1 : 0;
      if (ia !== ib) return ib - ia;
      return Math.abs(a.price - product.price) - Math.abs(b.price - product.price);
    });
    return same.slice(0, limit);
  }

  function search(list, q) {
    var terms = U.normalize(q).split(/\s+/).filter(Boolean);
    if (!terms.length) return list.slice();
    return list.filter(function (p) {
      var hay = U.normalize([p.name, collectionName(p.collection), typeName(p.type), p.metal, p.description].join(' '));
      return terms.every(function (t) { return hay.indexOf(t) !== -1; });
    });
  }

  function sort(list, key) {
    var out = list.slice();
    // price-on-request pieces have no number to compare: they always sort after priced pieces
    function byPrice(dir) { return function (a, b) { var pa = purchasable(a), pb = purchasable(b); if (pa !== pb) return pa ? -1 : 1; return dir * (a.price - b.price); }; }
    switch (key) {
      case 'newest': out.sort(function (a, b) { return newestFirst(a, b) || curated(a, b); }); break;
      case 'price-asc': out.sort(byPrice(1)); break;
      case 'price-desc': out.sort(byPrice(-1)); break;
      case 'name': out.sort(function (a, b) { return a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }); }); break;
      case 'featured':
      default: out.sort(curated);
    }
    return out;
  }

  /* Dev sanity check: warns only when the catalog is inconsistent. */
  (function sanity() {
    var ids = {}, slugs = {}, orders = {};
    PRODUCTS.forEach(function (p) {
      if (ids[p.id]) console.warn('[catalog] duplicate id: ' + p.id); ids[p.id] = true;
      if (slugs[p.slug]) console.warn('[catalog] duplicate slug: ' + p.slug); slugs[p.slug] = true;
      if (!collection(p.collection)) console.warn('[catalog] unknown collection "' + p.collection + '" on ' + p.id);
      if (!isType(p.type)) console.warn('[catalog] unknown type "' + p.type + '" on ' + p.id);
      if (!p.priceOnRequest && !(p.price > 0)) console.warn('[catalog] missing price on ' + p.id);
      if (p.lineup && orders[p.lineupOrder]) console.warn('[catalog] duplicate lineupOrder ' + p.lineupOrder + ' on ' + p.id); if (p.lineup) orders[p.lineupOrder] = true;
      if (p.compareAt !== undefined && !(p.compareAt > p.price)) console.warn('[catalog] compareAt must exceed price on ' + p.id);
      if (p.badge === 'Sale' && !(p.compareAt > p.price)) console.warn('[catalog] Sale badge without compareAt on ' + p.id);
    });
    LOOKS.forEach(function (l) { l.pieces.forEach(function (id) { if (!byId(id)) console.warn('[catalog] look "' + l.slug + '" lists unknown product ' + id); }); });
    COLLECTIONS.forEach(function (c) { if (c.banner && !byId(c.banner)) console.warn('[catalog] collection "' + c.slug + '" banner is an unknown product ' + c.banner); });
  })();

  /* ---- Meta descriptions (search snippets), 140–160 characters --------------------------------------- */
  var BENEFITS = {
    'molten-tide': ['A sculptural open cuff that slips on easily and catches light along every curve', 'A sculptural open cuff with a molten, hand-formed look', 'A sculptural open cuff', 'Bold and light'],
    'midnight-at-the-grand': ['A chunky, mirror-bright bangle with a rounded profile that stacks with cuffs and watches', 'A chunky domed bangle made for stacking', 'Made for stacking', 'Bold and light'],
    'hammered-moon': ['Bold, textured shapes that frame the face without weighing it down', 'Lightweight statement earrings, sold as a pair', 'Sold as a pair', 'Light to wear'],
    'lost-treasury': ['A layering necklace with vintage coin detail on a chunky chain', 'Coin medallion detail on a chunky chain', 'A layering piece', 'Bold and light'],
    'frangipani-garden': ['Sculpted flower forms, soft and sunlit, that make an easy gift', 'A flower piece that feels personal', 'An easy gift', 'Soft and sunlit'],
    'wanderers-cabinet': ['A chunky statement ring with a polished band, bold alone or stacked in threes', 'A chunky statement ring, sized to order', 'Sized to order', 'Bold alone']
  };
  function materialPhrase(p) {
    var m = String(p.metal || '');
    if (/acrylic/i.test(m)) return 'in lightweight gold-tone acrylic';
    if (/alloy/i.test(m)) return 'in gold-tone plated alloy';
    if (/two-tone/i.test(m)) return 'in two-tone PVD over nickel-free steel';
    if (/tri-tone/i.test(m)) return 'in gold, rose and silver-tone PVD steel';
    return 'in 18K gold PVD over nickel-free steel';
  }
  function freeShip() {
    var th = MA.config && MA.config.shipping && MA.config.shipping.freeThreshold;
    return th ? 'Free shipping over ' + U.formatMoney(U.toCents(th)) : 'Shipped insured and tracked';
  }
  function productDescription(p) {
    var twins = PRODUCTS.filter(function (x) { return x.name === p.name; }).length > 1;
    var base = nameParts(p).title;
    var name = twins ? base + ' No. ' + p.id.replace(/^\D+/, '') : base;
    var steel = /steel/i.test(String(p.metal || ''));
    // Pads go before the call to action; steel-only claims are never added to alloy/acrylic pieces.
    var pads = steel ? [' Hypoallergenic.', ' Water-resistant.', ' 30-day returns.', ' Gift-ready.'] : [' 30-day returns.', ' Gift-ready.', ' Light to wear.'];
    var tail = p.priceOnRequest ? ' Price on request — ask us.' : ' ' + freeShip() + ' — shop now.';
    var bens = BENEFITS[p.collection] || ['Made to be worn every day'];
    var bodies = bens.map(function (bn) { return name + ' ' + materialPhrase(p) + '. ' + bn + '.'; });
    bodies.push(name + ' in gold-tone PVD.');
    for (var i = 0; i < bodies.length; i++) {
      var t = bodies[i];
      if ((t + tail).length > 160) continue;
      for (var j = 0; j < pads.length && (t + tail).length < 140; j++) if ((t + pads[j] + tail).length <= 160) t += pads[j];
      if ((t + tail).length >= 140) return t + tail;
    }
    return U.fitText([bodies[bodies.length - 1] + tail], pads, 140, 160);
  }
  function collectionDescription(c) {
    var n = byCollection(c.slug).length;
    var season = (MA.config && MA.config.season && MA.config.season.name) || '';
    var line = c.line.charAt(0).toLowerCase() + c.line.slice(1);
    var cores = [
      c.name + ': ' + line + ' in 18K gold PVD over nickel-free steel' + (season ? ', from ' + season : '') + '. Shop ' + n + ' pieces; ' + freeShip().toLowerCase() + '.',
      c.name + ': ' + line + ' in 18K gold PVD over steel. Shop ' + n + ' pieces; ' + freeShip().toLowerCase() + '.'
    ];
    return U.fitText(cores, [' Hypoallergenic.', ' 30-day returns.', ' Gift-ready.'], 140, 160);
  }

  MA.catalog = {
    productDescription: productDescription, collectionDescription: collectionDescription,
    all: all, bySlug: bySlug, byId: byId, purchasable: purchasable, featured: featured, related: related, search: search, sort: sort,
    collections: collections, collection: collection, collectionName: collectionName, collectionForLegacy: collectionForLegacy,
    byCollection: byCollection, lineup: lineup, bannerProduct: bannerProduct,
    types: types, typeName: typeName, isType: isType, looks: looks, lookFor: lookFor, lookTotal: lookTotal, nameParts: nameParts
  };
})();

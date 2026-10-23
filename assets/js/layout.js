/* Maison Aurelle — shared layout: notice bar, header, nav, footer, bag drawer, cart lines, product cards (MA.layout) */
(function () {
  'use strict';
  window.MA = window.MA || {};
  var U = MA.utils, C = MA.catalog, cart = MA.cart, cfg = MA.config;
  var el = U.el;

  /* ---- Inline icons (decorative, aria-hidden) ---------------------------- */
  var ICONS = {
    search: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false"><circle cx="11" cy="11" r="6.5"/><path d="m16 16 4.5 4.5"/></svg>',
    bag: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false"><path d="M5 8h14l-1 12H6L5 8z"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/></svg>',
    menu: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false"><path d="M4 7h16M4 12h16M4 17h16"/></svg>',
    chevron: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true" focusable="false"><path d="m6 9 6 6 6-6"/></svg>',
    close: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false"><path d="M6 6l12 12M18 6 6 18"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false"><rect x="3.5" y="3.5" width="17" height="17" rx="4.5"/><circle cx="12" cy="12" r="3.8"/><circle cx="17.2" cy="6.8" r=".9" fill="currentColor"/></svg>',
    pinterest: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="8.5"/><path d="M10 20.5 12.2 11M9.5 13.5c-1.2-1.5-.4-5 2.8-5s3.5 2.6 2.6 4.8c-.8 2-3 2.2-3.7.7"/></svg>',
    facebook: '<svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true" focusable="false"><path d="M14 8.5V6.8c0-.9.5-1.3 1.3-1.3H17V3h-2.6C11.9 3 11 4.6 11 6.6v1.9H8.5v2.8H11V21h3v-9.7h2.4l.4-2.8H14z"/></svg>'
  };
  /* Engraved-caps wordmark for the header, inlined so fill=currentColor follows the page/card ink. Path data is
     assets/img/logo-wordmark-sm.svg simplified (Douglas-Peucker, 0.5 viewBox units) and rounded to whole units, i.e.
     about 0.1px at 28px tall, to keep this file small. If that file changes, regenerate with
     python3 ../tools/simplify_logo.py <svg> 0.5 (or paste its d unchanged). The footer's full wordmark (logo-wordmark.svg) is fetched lazily: see footerLogo(). */
  var LOGO_SM = { viewBox: '-7.5 -20.6 1356.2 126.2', d: 'M11 0 16 0 16 5 8 87 7 100 2 100ZM14 0 31 0 56 70 40 70ZM79 0 85 0 56 70 51 70ZM79 0 94 0 99 100 84 100ZM6 65 89 65 89 70 9 70 6 70ZM2 0 16 0 16 5 2 5ZM80 0 98 0 98 5 80 5ZM-6 95 14 95 14 100-6 100ZM79 95 105 95 105 100 79 100ZM173-8 178-8 153 70 143 100 137 100ZM175-8 182-8 183-6 216 92 218 100 202 100ZM176-11 178-19 182-8 175-8ZM149 61 201 61 201 66 149 66ZM129 95 151 95 151 100 129 100ZM196 95 224 95 224 100 196 100ZM174 32 176 38 180 35 177 40 182 41 177 42 180 47 175 44 174 50 173 44 168 47 171 42 165 41 171 40 168 35 173 38ZM258 0 273 0 273 100 258 100ZM252 0 279 0 279 5 252 5ZM252 95 279 95 279 100 252 100ZM374 22 371 26 368 27 363 26 359 20 357 9 354 7 343 3 341 3 335 4 324 9 322 13 320 20 321 26 323 33 325 36 330 38 339 43 352 49 367 58 372 64 374 69 375 74 375 80 371 91 368 95 363 98 352 102 335 103 329 102 318 99 312 95 308 90 305 78 308 74 312 73 316 74 318 77 321 85 322 88 324 92 330 94 340 97 342 97 347 96 356 90 359 86 361 78 359 70 358 66 354 62 344 56 318 43 310 36 306 27 306 20 306 16 308 11 311 6 315 2 331-2 349-2 361 0 367 4 371 8 374 18ZM375 19 375 21 372 25 368 26 366 26 363 25 360 20 360 17 362 14 366 12 371 12 374 16ZM319 81 319 84 317 87 312 89 307 87 305 84 305 81 305 78 306 76 310 73 314 74 317 75 318 78ZM495 50 493 64 491 71 486 82 480 91 471 97 467 100 455 103 447 104 435 102 424 98 412 88 407 80 402 70 399 56 399 46 402 32 406 21 416 8 429-1 441-4 449-4 456-3 466 0 471 3 480 9 488 22 491 27 494 42ZM479 44 477 33 473 22 469 16 464 9 460 6 456 3 450 1 443 2 437 4 431 9 424 17 418 28 416 35 415 50 415 59 420 77 427 88 431 92 440 97 447 99 458 96 462 92 469 85 472 79 476 70 478 62ZM525 0 530 0 529 100 524 100ZM587 0 592 0 592 76 592 100 586 100ZM525 0 542 0 592 100 574 100ZM516 0 527 0 527 5 516 5ZM516 95 538 95 538 100 516 100ZM578 0 600 0 600 5 578 5ZM714-8 720-8 684 100 678 100ZM716-8 723-8 759 100 743 100ZM718-19 723-8 716-8ZM690 61 742 61 742 66 690 66ZM670 95 692 95 692 100 670 100ZM737 95 765 95 765 100 737 100ZM715 33 716 38 721 35 718 40 724 41 718 42 721 47 716 44 715 50 714 44 709 47 712 42 706 41 712 40 709 35 714 38ZM799 0 814 0 814 62 799 62ZM860 0 865 0 866 8 866 95 865 100 861 100ZM800 52 804 49 809 49 813 52 814 56 813 71 813 90 816 93 820 96 825 97 834 98 841 96 848 92 852 88 858 78 860 64 863 62 864 62 866 64 864 77 862 83 857 92 853 96 848 99 844 101 837 102 828 103 822 102 810 98 805 94 802 91 801 86 799 61 799 56ZM793 0 820 0 820 5 809 5 793 5ZM853 0 873 0 873 5 853 5ZM863 95 871 95 871 100 863 100ZM911 0 926 0 926 100 911 100ZM917 4 916 2 917 0 920 0 951 1 957 2 961 4 965 8 968 12 970 17 971 22 971 30 969 36 967 40 963 44 959 47 945 52 928 54 919 53 917 52 916 51 916 50 919 48 934 48 939 48 945 45 950 42 953 38 956 32 957 25 955 17 952 9 950 7 945 6 918 5ZM936 51 936 48 938 45 942 44 945 46 957 57 962 64 965 71 972 97 975 95 976 93 975 92 977 88 980 85 984 84 988 86 990 90 989 94 985 100 983 102 979 103 970 104 966 104 963 102 957 96 956 92 954 81 948 65 945 61 937 54ZM990 90 988 95 983 97 978 95 976 93 976 89 977 85 980 83 983 82 988 84 990 87ZM905 0 926 0 926 5 905 5ZM905 95 936 95 936 100 905 100ZM1027 0 1042 0 1042 100 1027 100ZM1021 0 1080 0 1083 0 1083 5 1021 5ZM1078 0 1083 0 1083 15 1078 15ZM1042 46 1071 46 1071 51 1042 52ZM1066 42 1071 42 1071 56 1066 56ZM1021 95 1087 95 1087 100 1050 100 1021 100ZM1082 82 1087 82 1087 100 1082 100ZM1127 0 1142 0 1142 100 1127 100ZM1121 0 1148 0 1148 5 1121 5ZM1192 34 1207 34 1207 100 1192 100ZM1186 34 1213 34 1213 39 1186 39ZM1121 95 1247 95 1247 100 1239 100 1121 100ZM1242 82 1247 82 1247 100 1242 100ZM1287 0 1302 0 1302 100 1287 100ZM1281 0 1343 0 1343 5 1281 5ZM1338 0 1343 0 1343 15 1338 15ZM1302 46 1331 46 1331 51 1302 51ZM1326 42 1331 42 1331 56 1326 56ZM1281 95 1347 95 1347 100 1281 100ZM1342 82 1347 82 1347 100 1342 100Z' };
  function logoSVG(l, cls) {
    return '<svg class="' + cls + '" xmlns="http://www.w3.org/2000/svg" viewBox="' + l.viewBox + '" aria-hidden="true" focusable="false"><path fill="currentColor" d="' + l.d + '"/></svg>';
  }
  /* Footer wordmark: below the fold, so its 21 KB path is fetched only as the footer approaches the viewport and is
     then inlined (so it takes the footer ink). The box is sized by CSS beforehand (no layout shift); if the fetch fails (e.g. file://) the store name
     is shown as text instead. */
  var footerLogoCache = null;
  function footerLogo(slot) {
    function fail() { slot.classList.add('footer__logo--text'); }
    function fill(l) { slot.innerHTML = logoSVG(l, 'footer__logo-svg'); }
    if (footerLogoCache) { fill(footerLogoCache); return; }
    function go() {
      if (!window.fetch || !window.DOMParser) { fail(); return; }
      fetch('assets/img/logo-wordmark.svg').then(function (r) { if (!r.ok) throw new Error(r.status); return r.text(); }).then(function (t) {
        var svg = new DOMParser().parseFromString(t, 'image/svg+xml').querySelector('svg'), path = svg && svg.querySelector('path');
        if (!path) throw new Error('no path');
        footerLogoCache = { viewBox: svg.getAttribute('viewBox'), d: path.getAttribute('d') };
        U.qsa('.footer__logo').forEach(function (n) { n.innerHTML = logoSVG(footerLogoCache, 'footer__logo-svg'); });
      }).catch(fail);
    }
    // Fetch when the footer comes within ~800px of the viewport (it never competes with above-the-fold loading);
    // without IntersectionObserver, fetch after the load event.
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        if (entries.some(function (e) { return e.isIntersecting; })) { io.disconnect(); go(); }
      }, { rootMargin: '800px 0px' });
      io.observe(slot);
    } else if (document.readyState === 'complete') setTimeout(go, 0);
    else window.addEventListener('load', go, { once: true });
  }

  function icon(name) { var span = el('span', { class: 'icon', 'aria-hidden': 'true', html: ICONS[name] }); return span; }

  function pageName() { return (document.body && document.body.dataset.page) || ''; }
  function fileName() { return (location.pathname.split('/').pop() || 'index.html').toLowerCase(); }

  function isCurrent(href) {
    var file = fileName();
    var hrefFile = href.split('?')[0].split('#')[0];
    if (hrefFile !== file && !(file === '' && hrefFile === 'index.html')) return false;
    if (hrefFile === 'shop.html') {
      var want = (href.split('?')[1] || '');
      var coll = U.getParam('collection') || '';
      var wantColl = (want.match(/collection=([^&]*)/) || [])[1] || '';
      return coll === wantColl;
    }
    return true;
  }

  /* ---- Notice bar --------------------------------------------------------- */
  /* Open-store notice: cfg.noticeOpen with {freeThreshold} and {returnsDays} filled from config (no hard-coded amounts). */
  function noticeOpenText() {
    var ship = cfg.shipping || {};
    return String(cfg.noticeOpen || '')
      .replace(/\{freeThreshold\}/g, U.formatMoney(U.toCents(Number(ship.freeThreshold) || 0)))
      .replace(/\{returnsDays\}/g, String(cfg.returnsDays || ''));
  }
  function renderNotice() {
    var header = U.qs('#site-header');
    if (!header) return;
    var existing = U.qs('.notice-bar');
    var noticeText = MA.store.open ? noticeOpenText() : (cfg.closedNotice || '');
    if (!noticeText) { if (existing) existing.remove(); document.documentElement.classList.remove('has-notice'); return; }
    if (existing) {                                   // static bar in the HTML: just keep its text in sync
      var box = U.qs('.container', existing) || existing;
      if (box.textContent !== noticeText) box.textContent = noticeText;
    } else {
      header.parentNode.insertBefore(el('div', { class: 'notice-bar', role: 'region', 'aria-label': 'Store notice' }, el('div', { class: 'container', text: noticeText })), header);
    }
    document.documentElement.classList.add('has-notice');
  }

  /* ---- Header ------------------------------------------------------------- */
  /* Primary nav: Shop · Collections (disclosure menu of the six stories) · Styling & Care · About · Contact. */
  function navLinks() {
    return [{ label: 'Shop', href: 'shop.html' }, { label: 'Collections', menu: 'collections' },
      { label: 'Styling & Care', href: 'styling.html' }, { label: 'About', href: 'about.html' }, { label: 'Contact', href: 'contact.html' }];
  }
  function seasonLabel() {
    var s = cfg.season || {};
    return [s.name, s.label].filter(Boolean).join(' \u00B7 ');
  }
  function collectionsMenu() {
    var current = U.getParam('collection') || '';
    var list = el('ul', { class: 'mega__list' });
    C.collections().forEach(function (c) {
      var a = el('a', { class: 'mega__link', href: 'shop.html?collection=' + c.slug },
        el('span', { class: 'mega__name', text: c.name }),
        el('span', { class: 'mega__line', text: c.line }));
      if (fileName() === 'shop.html' && current === c.slug) a.setAttribute('aria-current', 'page');
      list.appendChild(el('li', {}, a));
    });
    var btn = el('button', { class: 'nav__menu-btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'collections-menu' },
      el('span', { text: 'Collections' }), icon('chevron'));
    if (fileName() === 'shop.html' && C.collection(current)) btn.classList.add('is-current');
    var panel = el('div', { id: 'collections-menu', class: 'mega', hidden: true },
      el('div', { class: 'mega__inner' },
        seasonLabel() ? el('p', { class: 'mega__eyebrow', text: seasonLabel() }) : null,
        list,
        el('a', { class: 'mega__all', href: 'shop.html', text: 'Shop all jewelry' })));
    return el('li', { class: 'nav__item nav__item--menu' }, btn, panel);
  }

  function renderHeader() {
    var header = U.qs('#site-header');
    if (!header) return;
    header.textContent = '';
    var announce = el('p', { class: 'announce', role: 'region', 'aria-label': 'Shipping offer', text: 'Complimentary shipping on orders over ' + U.formatMoney(U.toCents(cfg.shipping.freeThreshold)) });

    var toggle = el('button', {
      class: 'nav-toggle icon-btn', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'primary-nav', 'aria-label': 'Menu'
    }, icon('menu'), icon('close'));

    // Accessible name = the store name (config.name); the engraved wordmark itself is decorative.
    var brand = el('a', { class: 'brand', href: 'index.html', 'aria-label': cfg.name, html: logoSVG(LOGO_SM, 'brand__logo') });

    var search = el('a', { class: 'icon-btn', href: 'shop.html#search', 'aria-label': 'Search' }, icon('search'));
    var cartBtn = el('button', {
      class: 'cart-btn icon-btn', type: 'button', 'aria-haspopup': 'dialog', 'aria-controls': 'cart-drawer', 'aria-label': 'Shopping bag, 0 items'
    }, icon('bag'), el('span', { class: 'cart-count', 'aria-hidden': 'true', hidden: true, text: '0' }));
    cartBtn.addEventListener('click', function () { openCart(cartBtn); });

    var list = el('ul', { class: 'nav__list' });
    navLinks().forEach(function (l) {
      if (l.menu) { list.appendChild(collectionsMenu()); return; }
      var a = el('a', { href: l.href, text: l.label });
      if (isCurrent(l.href)) a.setAttribute('aria-current', 'page');
      list.appendChild(el('li', {}, a));
    });
    var nav = el('nav', { id: 'primary-nav', class: 'nav', 'aria-label': 'Primary' }, list);

    var bar = el('div', { class: 'site-header__bar container' },
      el('div', { class: 'site-header__left' }, toggle),
      brand,
      el('div', { class: 'site-header__right' }, search, cartBtn));
    // The shipping strip scrolls away with the notice bar; only the brand row + nav stay sticky.
    var oldAnnounce = U.qs('.announce');
    if (oldAnnounce) { if (oldAnnounce.textContent !== announce.textContent) oldAnnounce.textContent = announce.textContent; }
    else header.parentNode.insertBefore(announce, header);
    header.appendChild(bar);
    header.appendChild(nav);
    measureSticky();
  }

  /* Expose the real sticky height as --sticky-h so scroll-padding / scroll-margin clear the header. */
  function measureSticky() {
    var header = U.qs('#site-header');
    if (!header) return;
    var h = Math.round(header.getBoundingClientRect().height) || 72;
    document.documentElement.style.setProperty('--sticky-h', h + 'px');
  }
  window.addEventListener('resize', U.debounce(measureSticky, 100));
  if (window.ResizeObserver) {
    document.addEventListener('DOMContentLoaded', function () { var h = U.qs('#site-header'); if (h) new ResizeObserver(measureSticky).observe(h); });
  }

  /* ---- Nav disclosure (<900px) ------------------------------------------- */
  function initNav() {
    var toggle = U.qs('.nav-toggle'), nav = U.qs('#primary-nav');
    if (!toggle || !nav) return;
    function setOpen(open) {
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      nav.classList.toggle('is-open', open);
      document.documentElement.classList.toggle('nav-open', open);
    }
    toggle.addEventListener('click', function () {
      var open = toggle.getAttribute('aria-expanded') === 'true';
      setOpen(!open);
      if (!open) { var first = U.qs('a', nav); if (first) first.focus(); }
    });
    nav.addEventListener('click', function (e) { if (e.target.closest('a')) { setOpen(false); setMenu(false); } });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') { setOpen(false); toggle.focus(); }
    });
    document.addEventListener('click', function (e) {
      if (toggle.getAttribute('aria-expanded') === 'true' && !nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
    });

    /* Collections disclosure menu: button toggles; Escape closes and returns focus to the button; clicking or tabbing
       outside closes it. On phones it expands inline inside the open nav. */
    var item = U.qs('.nav__item--menu', nav), btn = item && U.qs('.nav__menu-btn', item), panel = item && U.qs('#collections-menu', item);
    if (!btn || !panel) return;
    function setMenu(open) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      panel.hidden = !open;
      item.classList.toggle('is-open', open);
    }
    btn.addEventListener('click', function () { setMenu(btn.getAttribute('aria-expanded') !== 'true'); });
    item.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') { e.stopPropagation(); setMenu(false); btn.focus(); }
    });
    item.addEventListener('focusout', function (e) { if (e.relatedTarget && !item.contains(e.relatedTarget)) setMenu(false); });
    document.addEventListener('click', function (e) { if (btn.getAttribute('aria-expanded') === 'true' && !item.contains(e.target)) setMenu(false); });
  }

  /* ---- Footer ------------------------------------------------------------- */
  function renderFooter() {
    var footer = U.qs('#site-footer');
    if (!footer) return;
    footer.textContent = '';
    footer.className = 'site-footer';

    var brandCol = el('div', { class: 'footer__col footer__brand' },
      el('p', { class: 'footer__wordmark' }, el('span', { class: 'footer__logo', 'aria-hidden': 'true' }), el('span', { class: 'footer__name', text: cfg.name })),
      el('p', { class: 'footer__tagline', text: cfg.tagline }),
      MA.store.emailReady ? el('p', { class: 'footer__contact' }, el('a', { href: 'mailto:' + cfg.email, 'data-store-email': '', text: cfg.email })) : null);
    if (cfg.phone) brandCol.appendChild(el('p', { class: 'footer__contact' }, el('a', { href: 'tel:' + cfg.phone.replace(/[^\d+]/g, ''), text: cfg.phone })));
    if (cfg.address && cfg.address.line1) {
      var a = cfg.address;
      var addr = el('address', { class: 'footer__address' });
      [a.line1, a.line2, [a.city, a.region, a.postal].filter(Boolean).join(', '), a.country].filter(Boolean).forEach(function (line, i) {
        if (i) addr.appendChild(el('br'));
        addr.appendChild(document.createTextNode(line));
      });
      brandCol.appendChild(addr);
    }
    if (cfg.hours) brandCol.appendChild(el('p', { class: 'footer__contact', text: cfg.hours }));

    function col(title, links) {
      var ul = el('ul', { class: 'footer__links' });
      links.forEach(function (l) { ul.appendChild(el('li', {}, el('a', { href: l.href, text: l.label }))); });
      return el('div', { class: 'footer__col' }, el('h2', { class: 'footer__title', text: title }), ul);
    }
    var shopLinks = C.collections().map(function (c) { return { label: c.name, href: 'shop.html?collection=' + c.slug }; });
    shopLinks.push({ label: 'All jewelry', href: 'shop.html' });

    var grid = el('div', { class: 'footer__grid container' },
      brandCol,
      col('Shop', shopLinks),
      col('Client care', [
        { label: 'Styling & Care', href: 'styling.html' },
        { label: 'Shipping & Returns', href: 'shipping-returns.html' },
        { label: 'Contact', href: 'contact.html' },
        { label: 'Care & Warranty', href: 'shipping-returns.html#care' }
      ]),
      col('The house', [
        { label: 'About', href: 'about.html' },
        { label: 'Privacy Policy', href: 'privacy.html' }
      ]));

    var cookieBtn = (MA.analytics && MA.analytics.enabled()) ? el('button', { class: 'footer__cookie btn--link', type: 'button', text: 'Cookie settings', on: { click: function () { MA.analytics.openSettings(); } } }) : null;
    var bottom = el('div', { class: 'footer__bottom container' },
      el('p', { class: 'footer__copy', text: '\u00A9 ' + new Date().getFullYear() + ' ' + cfg.name + '. All rights reserved.' }), cookieBtn);
    var socials = Object.keys(cfg.social || {}).filter(function (k) { return cfg.social[k] && ICONS[k]; });
    if (socials.length) {
      var ul = el('ul', { class: 'footer__social', 'aria-label': 'Social links' });
      socials.forEach(function (k) {
        var label = k.charAt(0).toUpperCase() + k.slice(1) + ' (opens in new tab)';
        ul.appendChild(el('li', {}, el('a', { href: cfg.social[k], target: '_blank', rel: 'noopener', 'aria-label': label, class: 'icon-btn' }, icon(k))));
      });
      bottom.appendChild(ul);
    }
    footer.appendChild(el('span', { class: 'ornament ornament--rosette footer__rosette', 'aria-hidden': 'true' }));
    footer.appendChild(grid);
    footerLogo(U.qs('.footer__logo', grid));
    footer.appendChild(bottom);
  }

  /* ---- Status region ------------------------------------------------------ */
  function ensureStatusRegion() {
    if (!U.qs('#sr-status')) {
      document.body.appendChild(el('div', { id: 'sr-status', class: 'visually-hidden', role: 'status', 'aria-live': 'polite' }));
    }
  }

  /* ---- Tokens in static markup ------------------------------------------- */
  function fillTokens() {
    U.qsa('[data-store-name]').forEach(function (n) { n.textContent = cfg.name; });
    // Email links only exist once a real address is configured; until then the text reads "our store inbox".
    U.qsa('[data-store-email]').forEach(function (n) {
      if (MA.store.emailReady) {
        var a = n.tagName === 'A' ? n : el('a', { 'data-store-email': '' });
        a.textContent = cfg.email; a.setAttribute('href', 'mailto:' + cfg.email);
        if (a !== n) n.replaceWith(a);
      } else {
        var span = el('span', { 'data-store-email': '', text: 'our store inbox (opening soon)' });
        n.replaceWith(span);
      }
    });
    U.qsa('[data-free-threshold]').forEach(function (n) { n.textContent = U.formatMoney(U.toCents(cfg.shipping.freeThreshold)); });
    U.qsa('[data-flat-rate]').forEach(function (n) { n.textContent = U.formatMoney(U.toCents(cfg.shipping.flatRate)); });
    var legal = cfg.legal || {};
    U.qsa('[data-legal]').forEach(function (n) { var v = legal[n.dataset.legal]; if (v) { n.textContent = v; n.classList.add('is-set'); } });
    if (cfg.privacyDraft === false) U.qsa('[data-privacy-draft]').forEach(function (n) { n.remove(); });
    U.qsa('[data-returns-days]').forEach(function (n) { n.textContent = String(cfg.returnsDays || 30); });
    U.qsa('[data-trust-line]').forEach(function (n) {
      var parts = [];
      if (cfg.shipping && cfg.shipping.freeThreshold) parts.push('Complimentary shipping over ' + U.formatMoney(U.toCents(cfg.shipping.freeThreshold)));
      if (cfg.returnsDays) parts.push(cfg.returnsDays + '-day returns');
      n.textContent = parts.join(' \u00B7 ');
      n.hidden = !parts.length;
    });
  }

  /* ---- Bag drawer --------------------------------------------------------- */
  var drawer, drawerBackdrop, releaseTrap = null, lastTrigger = null, inertNodes = [];

  function buildDrawer() {
    if (U.qs('#cart-drawer')) { drawer = U.qs('#cart-drawer'); drawerBackdrop = U.qs('.drawer-backdrop'); return; }
    drawerBackdrop = el('div', { class: 'drawer-backdrop', hidden: true });
    drawerBackdrop.addEventListener('click', closeCart);
    var closeBtn = el('button', { class: 'icon-btn drawer__close', type: 'button', 'aria-label': 'Close bag' }, icon('close'));
    closeBtn.addEventListener('click', closeCart);
    drawer = el('div', { id: 'cart-drawer', class: 'drawer', role: 'dialog', 'aria-modal': 'true', 'aria-labelledby': 'cart-drawer-title', hidden: true },
      el('div', { class: 'drawer__head' }, el('h2', { id: 'cart-drawer-title', class: 'drawer__title', text: 'Your bag' }), closeBtn),
      el('div', { class: 'drawer__body' }),
      el('div', { class: 'drawer__foot' }));
    document.body.appendChild(drawerBackdrop);
    document.body.appendChild(drawer);
    drawer.addEventListener('keydown', function (e) { if (e.key === 'Escape') { e.preventDefault(); closeCart(); } });
  }

  function freeShippingNote(totals) {
    var p = el('p', { class: 'ship-progress' });
    if (totals.subtotal === 0) return p;
    if (totals.freeShippingRemaining > 0) {
      p.textContent = 'You’re ' + U.formatMoney(totals.freeShippingRemaining) + ' away from complimentary shipping';
    } else {
      p.classList.add('ship-progress--free');
      p.textContent = 'Your order ships free';
    }
    var pct = Math.min(100, Math.round((totals.subtotal / U.toCents(cfg.shipping.freeThreshold)) * 100));
    var bar = el('span', { class: 'ship-progress__bar', 'aria-hidden': 'true' }, el('span', { class: 'ship-progress__fill', style: { width: pct + '%' } }));
    return el('div', { class: 'ship-progress-wrap' }, p, bar);
  }

  function renderDrawer() {
    if (!drawer) return;
    var body = U.qs('.drawer__body', drawer), foot = U.qs('.drawer__foot', drawer);
    body.textContent = ''; foot.textContent = '';
    var lines = cart.items();
    if (!lines.length) {
      body.appendChild(el('div', { class: 'empty-state empty-state--compact' },
        el('p', { class: 'empty-state__title', text: 'Your bag is empty.' }),
        el('a', { class: 'btn btn--primary', href: 'shop.html', text: 'Shop the collection', on: { click: closeCart } })));
      return;
    }
    renderCartLines(body, { compact: true });
    var t = cart.totals();
    foot.appendChild(el('div', { class: 'drawer__subtotal' }, el('span', { text: 'Subtotal' }), el('span', { class: 'price', text: U.formatMoney(t.subtotal) })));
    foot.appendChild(freeShippingNote(t));
    foot.appendChild(el('p', { class: 'drawer__note text-muted', text: 'Shipping and estimated tax are calculated at checkout.' }));
    foot.appendChild(MA.store.open ? el('a', { class: 'btn btn--primary btn--block', href: 'checkout.html', text: 'Checkout' })
      : el('a', { class: 'btn btn--primary btn--block', href: 'checkout.html#opening-soon', text: 'Ordering opens soon' }));
    foot.appendChild(el('a', { class: 'btn btn--secondary btn--block', href: 'cart.html', text: 'View bag' }));
  }

  function setInert(on) {
    var targets = [U.qs('#main'), U.qs('#site-footer'), U.qs('#site-header'), U.qs('.notice-bar')].filter(Boolean);
    if (on) {
      inertNodes = targets;
      targets.forEach(function (n) { n.setAttribute('inert', ''); n.setAttribute('aria-hidden', 'true'); });
    } else {
      inertNodes.forEach(function (n) { n.removeAttribute('inert'); n.removeAttribute('aria-hidden'); });
      inertNodes = [];
    }
  }

  var drawerRendered = false;
  function drawerSkeleton() {
    var body = U.qs('.drawer__body', drawer);
    body.textContent = '';
    var list = el('ul', { class: 'cart-lines cart-lines--compact skeleton-list', 'aria-hidden': 'true' });
    for (var i = 0; i < Math.min(3, Math.max(1, cart.items().length)); i++) {
      list.appendChild(el('li', { class: 'cart-line' }, el('span', { class: 'skeleton skeleton--thumb' }), el('span', { class: 'skeleton-lines' }, el('span', { class: 'skeleton skeleton--line' }), el('span', { class: 'skeleton skeleton--line skeleton--short' }))));
    }
    body.appendChild(list);
  }
  function openCart(trigger) {
    buildDrawer();
    if (!drawerRendered) {
      // First open: paint a skeleton, render real lines on the next frame.
      drawerRendered = true;
      drawer.setAttribute('aria-busy', 'true');
      drawerSkeleton();
      requestAnimationFrame(function () { renderDrawer(); drawer.removeAttribute('aria-busy'); });
    } else renderDrawer();
    lastTrigger = trigger || document.activeElement;
    drawer.hidden = false; drawerBackdrop.hidden = false;
    // force reflow so the slide-in transition runs
    void drawer.offsetWidth;
    drawer.classList.add('is-open'); drawerBackdrop.classList.add('is-open');
    document.documentElement.classList.add('drawer-open');
    setInert(true);
    releaseTrap = U.trapFocus(drawer);
    var close = U.qs('.drawer__close', drawer);
    if (close) close.focus();
  }
  function closeCart() {
    if (!drawer || drawer.hidden) return;
    drawer.classList.remove('is-open'); drawerBackdrop.classList.remove('is-open');
    document.documentElement.classList.remove('drawer-open');
    setInert(false);
    if (releaseTrap) { releaseTrap(); releaseTrap = null; }
    var finish = function () { drawer.hidden = true; drawerBackdrop.hidden = true; };
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) finish(); else setTimeout(finish, 400);
    if (lastTrigger && typeof lastTrigger.focus === 'function' && document.contains(lastTrigger)) lastTrigger.focus();
    else { var btn = U.qs('.cart-btn'); if (btn) btn.focus(); }
    lastTrigger = null;
  }
  function initCartDrawer() {
    buildDrawer();
    cart.onChange(function () { if (drawer && !drawer.hidden) renderDrawer(); });
  }

  /* ---- Cart lines (shared by drawer and bag page) ------------------------- */
  function qtyStepper(product, qty, onChange) {
    var inputId = 'qty-' + product.id + '-' + Math.random().toString(36).slice(2, 7);
    var input = el('input', { class: 'qty__input', id: inputId, type: 'number', inputmode: 'numeric', min: '1', max: String(cfg.maxQtyPerItem), value: String(qty) });
    var label = el('label', { class: 'visually-hidden', 'for': inputId, text: 'Quantity of ' + product.name });
    var dec = el('button', { class: 'qty__btn', type: 'button', 'aria-label': 'Decrease quantity of ' + product.name, text: '−' });
    var inc = el('button', { class: 'qty__btn', type: 'button', 'aria-label': 'Increase quantity of ' + product.name, text: '+' });
    function commit(n, source) {
      n = Math.floor(Number(n));
      if (isNaN(n)) n = 1;
      onChange(n, source);
    }
    dec.addEventListener('click', function () { commit(Number(input.value) - 1, dec); });
    inc.addEventListener('click', function () { commit(Number(input.value) + 1, inc); });
    input.addEventListener('change', function () { commit(input.value, input); });
    return el('div', { class: 'qty' }, label, dec, input, inc);
  }

  function renderCartLines(container, opts) {
    opts = opts || {};
    container.textContent = '';
    var list = el('ul', { class: 'cart-lines' + (opts.compact ? ' cart-lines--compact' : ''), 'aria-label': 'Items in your bag' });
    cart.items().forEach(function (line) {
      var p = line.product;
      var li = el('li', { class: 'cart-line', dataset: { id: p.id } });
      var thumb = el('a', { class: 'cart-line__thumb', href: 'product.html?slug=' + p.slug, tabindex: '-1', 'aria-hidden': 'true' },
        productImage(p, { alt: '', width: '64', height: '64' }, 'sm'));
      var total = el('p', { class: 'cart-line__total price', text: U.formatMoney(line.lineCents) });
      var removeBtn = el('button', { class: 'btn btn--link cart-line__remove', type: 'button', 'aria-label': 'Remove ' + p.name + ' from bag', text: 'Remove' });

      var stepper = qtyStepper(p, line.qty, function (n, source) {
        if (n <= 0) { removeLine(); return; }
        var res = cart.setQty(p.id, n);
        var msg = 'Quantity of ' + p.name + ' updated to ' + res.qty + '.';
        if (res.clamped) msg += ' Maximum ' + cfg.maxQtyPerItem + ' per item.';
        U.announce(msg);
        rerenderAndFocus(source.tagName === 'INPUT' ? 'input' : (source.textContent === '+' ? 'inc' : 'dec'));
      });
      function removeLine() {
        var next = li.nextElementSibling || li.previousElementSibling;
        var nextId = next ? next.dataset.id : null;
        cart.remove(p.id);
        U.announce(p.name + ' removed from your bag. ' + cart.count() + ' ' + (cart.count() === 1 ? 'item' : 'items') + ' in bag.');
        renderCartLines(container, opts);
        var target = nextId ? U.qs('.cart-line[data-id="' + nextId + '"] .cart-line__remove', container) : null;
        if (target) { target.focus(); return; }
        var inDrawer = container.closest('#cart-drawer');
        if (inDrawer) { var close = U.qs('.drawer__close', inDrawer); if (close) close.focus(); }
        else { var h1 = U.qs('h1'); if (h1) { h1.setAttribute('tabindex', '-1'); h1.focus(); } }
      }
      function rerenderAndFocus(which) {
        renderCartLines(container, opts);
        var row = U.qs('.cart-line[data-id="' + p.id + '"]', container);
        if (!row) return;
        var sel = which === 'inc' ? '.qty__btn:last-of-type' : which === 'dec' ? '.qty__btn:first-of-type' : '.qty__input';
        var node = U.qs(sel, row); if (node) node.focus();
      }
      removeBtn.addEventListener('click', removeLine);

      var info = el('div', { class: 'cart-line__info' },
        el('h3', { class: 'cart-line__name' }, el('a', { href: 'product.html?slug=' + p.slug, text: p.name })),
        el('p', { class: 'cart-line__meta text-muted', text: p.metal + ' · ' + U.formatMoney(U.toCents(p.price)) + ' each' }),
        el('div', { class: 'cart-line__controls' }, stepper, removeBtn));
      li.appendChild(thumb); li.appendChild(info); li.appendChild(total);
      list.appendChild(li);
    });
    container.appendChild(list);
    return list;
  }

  /* ---- Newsletter-style sign-up (home newsletter, "Notify me" on the closed checkout) ------------------
     Uses newsletter.formEndpoint when set; otherwise a pre-filled email to the store, but only when the store email is
     real. When neither is possible the form is replaced by a "Sign-ups open soon" note. */
  function initSignupForm(form, status, subject, okMessage) {
    if (!form) return;
    if (!MA.store.canSignup) {
      var note = el('p', { class: 'signup-closed', text: 'Sign-ups open soon \u2014 check back shortly.' });
      form.replaceWith(note);
      if (status) status.textContent = '';
      return;
    }
    var btn = U.qs('button[type="submit"]', form);
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (MA.forms.validateForm(form).length) return;
      var data = MA.forms.serialize(form);
      var endpoint = cfg.newsletter && cfg.newsletter.formEndpoint;
      function done(msg, isError) {
        status.textContent = msg; status.classList.toggle('form-status--error', !!isError);
        btn.disabled = false; btn.removeAttribute('aria-busy');
      }
      if (endpoint) {
        btn.disabled = true; btn.setAttribute('aria-busy', 'true');
        MA.forms.postJSON(endpoint, { _subject: subject, email: data.email }).then(function (res) {
          if (res.ok) { form.reset(); done(okMessage); } else done('We couldn\u2019t sign you up just now. Please try again shortly.', true);
        });
      } else {
        location.href = MA.forms.mailtoURL(cfg.email, subject, 'Please add ' + data.email + ' to the list.');
        done('Your email app should open with your sign-up. If it doesn\u2019t, write to us at ' + cfg.email + '.');
      }
    });
  }

  /* ---- Product imagery with a styled missing-photo frame -------------------- */
  /* Only requests the file when products.js says hasImage (set by tools/ingest_photos.py), so a missing photo never
     produces a 404 in the console. A runtime load error swaps to the same frame. */
  function imageFallback(product, size) {
    return el('span', { class: 'img-fallback' + (size ? ' img-fallback--' + size : ''), role: 'img', 'aria-label': product.name + ' \u2014 photo coming soon' },
      el('span', { class: 'ornament ornament--star img-fallback__mark', 'aria-hidden': 'true' }),
      el('span', { class: 'img-fallback__name', 'aria-hidden': 'true', text: C.nameParts(product).title }));
  }
  /* Alt text: product name + finish, e.g. "Waved Irregular Cuff Bangle in 18K gold PVD". */
  function finishOf(product) {
    var m = String(product.metal || '');
    if (/acrylic/i.test(m)) return 'gold-tone acrylic';
    if (/alloy/i.test(m)) return 'gold-tone alloy';
    var f = /two-tone/i.test(m) ? 'two-tone PVD' : /tri-tone/i.test(m) ? 'gold, rose and silver-tone PVD' : '18K gold PVD';
    var extra = (m.split(',')[1] || '').trim().toLowerCase();
    return extra ? f + ' with ' + extra : f;
  }
  /* Lookbook names already state the finish ("Wave Cuff in 18K Gold-Plated Stainless Steel"): use them as they are. */
  // `alt` on a product overrides the generated text (crawler photos that show more than the one piece).
  function altFor(product) { return product.alt || (C.nameParts(product).finish ? product.name : product.name + ' in ' + finishOf(product)); }

  function productImage(product, attrs, size) {
    if (!product.hasImage) return imageFallback(product, size);
    var img = el('img', Object.assign({ class: 'is-loading', src: product.image, alt: altFor(product), loading: 'lazy', decoding: 'async', width: '800', height: '800' }, attrs || {}));
    img.addEventListener('load', function () { img.classList.remove('is-loading'); });
    if (img.complete && img.naturalWidth) img.classList.remove('is-loading');
    img.addEventListener('error', function () { var fb = imageFallback(product, size); if (img.parentNode) img.parentNode.replaceChild(fb, img); });
    return img;
  }

  /* ---- Product card ------------------------------------------------------- */
  function badge(product) {
    if (!product.badge) return null;
    if (product.badge === 'Sale' && !(product.compareAt > product.price)) return null;
    return el('span', { class: 'badge badge--' + product.badge.toLowerCase(), text: product.badge });
  }
  function priceBlock(product, large) {
    var wrap = el('p', { class: 'price-block' + (large ? ' price-block--lg' : '') });
    if (product.priceOnRequest) { wrap.appendChild(el('span', { class: 'price price--request', text: 'Price on request' })); return wrap; }
    wrap.appendChild(el('span', { class: 'price', text: U.formatMoney(U.toCents(product.price)) }));
    if (product.compareAt > product.price) {
      wrap.appendChild(document.createTextNode(' '));
      wrap.appendChild(el('s', { class: 'price--was' }, el('span', { class: 'visually-hidden', text: 'Original price ' }), U.formatMoney(U.toCents(product.compareAt))));
    }
    return wrap;
  }
  /* Luxury-format card: white image well, then centred collection eyebrow, piece name, finish and price.
     No add-to-bag on cards; the product page and the look module have it. */
  function productName(product, cls) {
    var parts = C.nameParts(product);
    var frag = document.createDocumentFragment();
    frag.appendChild(el('span', { class: cls + '__title', text: parts.title }));
    if (parts.finish) { frag.appendChild(document.createTextNode(' ')); frag.appendChild(el('span', { class: cls + '__finish', text: parts.finish })); }
    return frag;
  }
  function productCard(product, index) {
    var pink = cfg.alternatePinkProducts && index % 2 === 1;
    var href = 'product.html?slug=' + product.slug + (cfg.alternatePinkProducts && index != null ? (pink ? '&look=pink' : '&look=blue') : '');
    var card = el('article', { class: 'product-card', 'data-theme': pink ? 'blush' : 'cobalt' },
      el('a', { class: 'product-card__media', href: href, tabindex: '-1', 'aria-hidden': 'true' },
        productImage(product),
        badge(product)),
      el('div', { class: 'product-card__body' },
        el('p', { class: 'product-card__eyebrow', text: C.collectionName(product.collection) }),
        el('h3', { class: 'product-card__name' }, el('a', { href: href }, productName(product, 'product-card'))),
        priceBlock(product)));
    return card;
  }

  /* ---- "Mix the stories" look module (home, styling, product pages) -------------------------------------- */
  function lookCard(look, opts) {
    opts = opts || {};
    var id = 'look-' + look.slug + (opts.idSuffix || '');
    var collage = el('div', { class: 'look__collage', 'data-count': String(Math.min(look.pieces.length, 6)) });
    look.pieces.slice(0, 6).forEach(function (p) {
      collage.appendChild(el('a', { class: 'look__frame', href: 'product.html?slug=' + p.slug, tabindex: '-1', 'aria-hidden': 'true' }, productImage(p, { alt: '' }, 'sm')));
    });
    var list = el('ul', { class: 'look__pieces' });
    look.pieces.forEach(function (p) {
      list.appendChild(el('li', { class: 'look__piece' + (opts.current === p ? ' is-current' : '') },
        el('span', { class: 'look__piece-name' },
          el('a', { href: 'product.html?slug=' + p.slug, text: C.nameParts(p).title }),
          el('span', { class: 'look__piece-coll', text: C.collectionName(p.collection) })),
        el('span', { class: 'price' + (p.priceOnRequest ? ' price--request' : ''), text: p.priceOnRequest ? 'Price on request' : U.formatMoney(U.toCents(p.price)) })));
    });
    var buyable = look.pieces.filter(C.purchasable);
    var btn = el('button', { class: 'btn btn--primary look__add', type: 'button', 'aria-label': 'Add the look to bag: ' + look.name + ', ' + buyable.length + ' pieces', text: 'Add the look to bag' });
    btn.addEventListener('click', function () { addLookToBag(look, btn); });
    var Heading = opts.headingLevel || 'h3';
    return el('article', { class: 'look' + (opts.wide ? ' look--wide' : ''), 'aria-labelledby': id },
      collage,
      el('div', { class: 'look__body' },
        el('p', { class: 'look__eyebrow', text: 'The look' }),
        el(Heading, { id: id, class: 'look__title', text: look.name }),
        el('p', { class: 'look__mood', text: look.mood }),
        list,
        el('p', { class: 'look__total' }, el('span', { text: buyable.length === look.pieces.length ? 'The look, ' + look.pieces.length + ' pieces' : 'The look, ' + buyable.length + ' priced pieces' }),
          el('span', { class: 'price', text: U.formatMoney(C.lookTotal(look)) })),
        btn));
  }
  /* Adds every priced piece of the look once (price-on-request pieces are skipped), with the same busy/done feedback
     as a single add, one announcement, then opens the bag. */
  function addLookToBag(look, trigger) {
    if (trigger && trigger.dataset.busy) return { ok: false, busy: true };
    var buyable = look.pieces.filter(C.purchasable), skipped = look.pieces.filter(function (p) { return !C.purchasable(p); });
    if (trigger) {
      trigger.dataset.busy = '1';
      setAddButtonState(trigger, 'busy');
      setTimeout(function () {
        setAddButtonState(trigger, 'done');
        setTimeout(function () { setAddButtonState(trigger, 'idle'); }, ADD_DONE_MS);
      }, ADD_BUSY_MS);
    }
    var added = 0, clamped = false;
    buyable.forEach(function (p) { var r = cart.add(p.id, 1); if (r.ok) { added++; if (MA.analytics) MA.analytics.addToCart(p, 1); } if (r.clamped) clamped = true; });
    var n = cart.count();
    var msg = 'Added ' + (/^the /i.test(look.name) ? look.name : 'the ' + look.name) + ' look to your bag: ' + added + ' ' + (added === 1 ? 'piece' : 'pieces') + '. ' + n + ' ' + (n === 1 ? 'item' : 'items') + ' in bag.';
    if (skipped.length) msg += ' ' + skipped.map(function (p) { return p.name; }).join(', ') + (skipped.length === 1 ? ' is' : ' are') + ' price on request and was not added.';
    if (clamped) msg += ' Maximum ' + cfg.maxQtyPerItem + ' per item.';
    U.announce(msg);
    if (cfg.openDrawerOnAdd) openCart(trigger);
    return { ok: added > 0, added: added, skipped: skipped.length };
  }

  /* ---- Add to bag --------------------------------------------------------- */
  /* Button feedback: "Adding…" with a spinner for at least 400 ms, then "Added ✓" for 1.2 s. Clicks while busy are
     ignored (no double adds). aria-disabled (not disabled) keeps the button focusable so focus can return to it. */
  var ADD_BUSY_MS = 400, ADD_DONE_MS = 1200;
  function setAddButtonState(btn, state) {
    if (!btn.dataset.label) btn.dataset.label = btn.textContent;
    btn.textContent = '';
    btn.classList.toggle('is-busy', state === 'busy');
    btn.classList.toggle('is-done', state === 'done');
    if (state === 'busy') {
      btn.setAttribute('aria-busy', 'true'); btn.setAttribute('aria-disabled', 'true');
      btn.appendChild(el('span', { class: 'spinner', 'aria-hidden': 'true' }));
      btn.appendChild(document.createTextNode('Adding\u2026'));
    } else if (state === 'done') {
      btn.removeAttribute('aria-busy');
      btn.appendChild(document.createTextNode('Added '));
      btn.appendChild(el('span', { 'aria-hidden': 'true', text: '\u2713' }));
    } else {
      btn.removeAttribute('aria-busy'); btn.removeAttribute('aria-disabled');
      btn.textContent = btn.dataset.label;
      delete btn.dataset.busy;
    }
  }
  function addToBag(product, qty, trigger) {
    var isButton = trigger && trigger.tagName === 'BUTTON';
    if (isButton && trigger.dataset.busy) return { ok: false, busy: true };
    if (isButton) {
      trigger.dataset.busy = '1';
      setAddButtonState(trigger, 'busy');
      setTimeout(function () {
        setAddButtonState(trigger, 'done');
        setTimeout(function () { setAddButtonState(trigger, 'idle'); }, ADD_DONE_MS);
      }, ADD_BUSY_MS);
    }
    var res = cart.add(product.id, qty || 1);
    if (!res.ok) { if (isButton) setAddButtonState(trigger, 'idle'); return res; }
    if (MA.analytics) MA.analytics.addToCart(product, qty || 1);
    var n = cart.count();
    var msg = 'Added ' + product.name + ' to your bag. ' + n + ' ' + (n === 1 ? 'item' : 'items') + ' in bag.';
    if (res.clamped) msg += ' Maximum ' + cfg.maxQtyPerItem + ' per item.';
    U.announce(msg);
    if (cfg.openDrawerOnAdd) openCart(trigger);
    return res;
  }

  function updateCartBadge() {
    var n = cart.count();
    var btn = U.qs('.cart-btn'), count = U.qs('.cart-count');
    if (btn) btn.setAttribute('aria-label', 'Shopping bag, ' + n + ' ' + (n === 1 ? 'item' : 'items'));
    if (count) { count.textContent = String(n); count.hidden = n === 0; }
  }

  /* ---- JSON-LD (home page only) ------------------------------------------ */
  function brandJSONLD() {
    var data = {
      '@context': 'https://schema.org', '@type': 'JewelryStore',
      name: cfg.name, description: cfg.description, email: cfg.email,
      logo: U.absUrl('assets/img/logo-mark.svg')
    };
    if (cfg.siteUrl) data.url = cfg.siteUrl;
    var same = Object.keys(cfg.social || {}).map(function (k) { return cfg.social[k]; }).filter(Boolean);
    if (same.length) data.sameAs = same;
    if (!MA.store.emailReady) delete data.email;
    if (cfg.phone) data.telephone = cfg.phone;
    if (cfg.address && cfg.address.line1) {
      data.address = { '@type': 'PostalAddress', streetAddress: [cfg.address.line1, cfg.address.line2].filter(Boolean).join(', '),
        addressLocality: cfg.address.city, addressRegion: cfg.address.region, postalCode: cfg.address.postal, addressCountry: cfg.address.country };
    }
    injectJSONLD('brand-jsonld', data);
  }
  function injectJSONLD(id, data) {
    var old = document.getElementById(id); if (old) old.remove();
    var s = document.createElement('script');
    s.type = 'application/ld+json'; s.id = id;
    s.textContent = JSON.stringify(data).replace(/</g, '\\u003c');
    document.head.appendChild(s);
  }

  /* ---- Page family ---------------------------------------------------------- */
  function setTheme(name) {
    document.documentElement.setAttribute('data-theme', name);
    var meta = U.qs('meta[name="theme-color"]');
    if (meta) meta.setAttribute('content', name === 'blush' ? '#F4C6CE' : '#F7F4EC');
  }
  function themeForCollection(slug) {
    return (MA.config.pinkCollections || []).indexOf(slug || 'all') !== -1 ? 'blush' : 'cobalt';
  }

  /* ---- Init --------------------------------------------------------------- */
  function init() {
    renderNotice();
    renderHeader();
    renderFooter();
    ensureStatusRegion();
    initNav();
    initCartDrawer();
    updateCartBadge();
    fillTokens();
    cart.onChange(updateCartBadge);
    U.qsa('[data-season]').forEach(function (n) { n.textContent = n.dataset.season === 'name' ? ((cfg.season || {}).name || '') : seasonLabel(); });
    U.qsa('[data-render="featured"]').forEach(function (grid) {
      grid.textContent = '';
      C.featured(4).forEach(function (p, i) { grid.appendChild(productCard(p, i)); });
    });
    if (MA.page && typeof MA.page.init === 'function') MA.page.init();
    else if (document.body.dataset.title) U.setMeta({ title: document.body.dataset.title, description: document.body.dataset.description, noindex: document.body.dataset.noindex === 'true' || (document.body.dataset.page === 'privacy' && cfg.privacyDraft !== false) });
  }

  MA.layout = {
    init: init, renderNotice: renderNotice, renderHeader: renderHeader, renderFooter: renderFooter,
    ensureStatusRegion: ensureStatusRegion, initNav: initNav, initCartDrawer: initCartDrawer, fillTokens: fillTokens,
    openCart: openCart, closeCart: closeCart, measureSticky: measureSticky, renderCartLines: renderCartLines, productCard: productCard,
    priceBlock: priceBlock, badge: badge, qtyStepper: qtyStepper, freeShippingNote: freeShippingNote, productImage: productImage, imageFallback: imageFallback, altFor: altFor, initSignupForm: initSignupForm,
    setTheme: setTheme, themeForCollection: themeForCollection, lookCard: lookCard, addLookToBag: addLookToBag, productName: productName, seasonLabel: seasonLabel,
    addToBag: addToBag, updateCartBadge: updateCartBadge, brandJSONLD: brandJSONLD, injectJSONLD: injectJSONLD, icon: icon, logoSVG: logoSVG
  };

  // Deferred scripts run while readyState is "interactive"; wait for DOMContentLoaded so page scripts have registered MA.page.
  if (document.readyState === 'complete') init(); else document.addEventListener('DOMContentLoaded', init);
})();

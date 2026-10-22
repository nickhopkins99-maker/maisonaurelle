/* Maison Aurelle — Styling & Care page: the lookbook's styling FAQ (static <details>) plus the "Mix the stories" looks */
(function () {
  'use strict';
  window.MA = window.MA || {};
  var U = MA.utils, C = MA.catalog, L = MA.layout;

  MA.page = {
    init: function () {
      U.setMeta({ title: 'Styling & Care: Wearing Gold Jewelry', description: document.body.dataset.description, path: 'styling.html' });
      var grid = U.qs('#look-grid');
      if (!grid) return;
      grid.textContent = '';
      C.looks().forEach(function (look) { grid.appendChild(L.lookCard(look)); });
    }
  };
})();

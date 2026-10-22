/* Maison Aurelle — contact page */
(function () {
  'use strict';
  window.MA = window.MA || {};
  var U = MA.utils, F = MA.forms, cfg = MA.config;
  var el = U.el;

  function renderDetails() {
    var card = U.qs('#contact-details');
    if (!card) return;
    card.textContent = '';
    card.appendChild(el('h2', { class: 'card__title', text: 'Reach us directly' }));
    var dl = el('dl', { class: 'details-dl' });
    function row(label, node) { dl.appendChild(el('div', {}, el('dt', { text: label }), el('dd', {}, node))); }
    if (MA.store.emailReady) row('Email', el('a', { href: 'mailto:' + cfg.email, text: cfg.email, 'data-store-email': '' }));
    if (cfg.phone) row('Phone', el('a', { href: 'tel:' + cfg.phone.replace(/[^\d+]/g, ''), text: cfg.phone }));
    if (cfg.hours) row('Hours', document.createTextNode(cfg.hours));
    if (cfg.address && cfg.address.line1) {
      var a = cfg.address, addr = el('address');
      [a.line1, a.line2, [a.city, a.region, a.postal].filter(Boolean).join(', '), a.country].filter(Boolean).forEach(function (line, i) {
        if (i) addr.appendChild(el('br')); addr.appendChild(document.createTextNode(line));
      });
      row('Showroom', addr);
    }
    if (!dl.children.length) { card.hidden = true; return; }   // nothing real to show: no empty card, no orphan labels
    card.appendChild(dl);
    if (cfg.address && cfg.address.line1) {
      card.appendChild(el('h3', { class: 'card__subtitle', text: 'Visit by appointment' }));
      card.appendChild(el('p', { class: 'text-muted', text: 'Private appointments let us prepare pieces for you to try on. Email or call to arrange a time.' }));
    }
    card.appendChild(el('p', { class: 'text-muted text-sm', text: 'We reply to every message within two business days.' }));
  }

  function initForm() {
    var form = U.qs('#contact-form');
    var topic = U.qs('#topic'), orderField = U.qs('#order-number-field'), orderInput = U.qs('#orderNumber');
    var message = U.qs('#message'), counter = U.qs('#message-counter');
    var status = U.qs('#contact-status'), btn = U.qs('button[type="submit"]', form);

    function syncTopic() {
      var isOrder = topic.value === 'An existing order';
      orderField.hidden = !isOrder;
      orderInput.disabled = !isOrder;
      if (!isOrder) { orderInput.value = ''; F.clearFieldError(orderInput); }
    }
    topic.addEventListener('change', syncTopic);
    // Deep links such as contact.html?topic=Price%20on%20request&piece=<name> (the "Ask about this piece" link)
    var wantTopic = U.getParam('topic'), piece = (U.getParam('piece') || '').slice(0, 120);
    if (wantTopic && Array.prototype.some.call(topic.options, function (o) { return o.value === wantTopic; })) topic.value = wantTopic;
    if (piece && !message.value) message.value = 'I\u2019d like to know the price of the ' + piece + '.';
    syncTopic();

    var maxLen = Number(message.getAttribute('maxlength')) || 2000;
    function updateCounter() {
      var n = message.value.length;
      counter.textContent = n + ' / ' + maxLen + ' characters';
      counter.setAttribute('aria-live', n >= 1900 ? 'polite' : 'off');
    }
    message.addEventListener('input', updateCounter);
    updateCounter();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (F.validateForm(form).length) return;
      var data = F.serialize(form);
      var body = ['Name: ' + data.name, 'Email: ' + data.email, data.phone ? 'Phone: ' + data.phone : '', 'Topic: ' + data.topic,
        data.orderNumber ? 'Order number: ' + data.orderNumber : '', '', data.message].filter(function (l) { return l !== ''; }).join('\n');
      function done(msg, isError) {
        status.textContent = msg; status.classList.toggle('form-status--error', !!isError);
        btn.disabled = false; btn.removeAttribute('aria-busy');
      }
      var endpoint = cfg.contact && cfg.contact.formEndpoint;
      if (endpoint) {
        btn.disabled = true; btn.setAttribute('aria-busy', 'true');
        F.postJSON(endpoint, { _subject: 'Contact: ' + data.topic, name: data.name, email: data.email, phone: data.phone || '', topic: data.topic, orderNumber: data.orderNumber || '', message: data.message }).then(function (res) {
          if (res.ok) { form.reset(); syncTopic(); updateCounter(); done('Thank you — we’ll reply within two business days.'); }
          else {
            status.textContent = '';
            status.classList.add('form-status--error');
            status.appendChild(document.createTextNode('We couldn’t send your message just now. '));
            status.appendChild(el('a', { href: F.mailtoURL(cfg.email, '[' + cfg.name + '] ' + data.topic, body), text: 'Send it by email instead' }));
            status.appendChild(document.createTextNode('.'));
            btn.disabled = false; btn.removeAttribute('aria-busy');
          }
        });
      } else {
        location.href = F.mailtoURL(cfg.email, '[' + cfg.name + '] ' + data.topic, body);
        done('Your email app should open with your message. If it doesn’t, write to us at ' + cfg.email + '.');
      }
    });
  }

  MA.page = {
    init: function () {
      U.setMeta({ description: document.body.dataset.description, title: 'Contact Us', path: 'contact.html' });
      renderDetails();
      if (!MA.store.open || !MA.store.canContact) {
        U.qs('#contact-form').remove();
        U.qs('#inbox-soon').hidden = false;
        var lead = U.qs('.page-head .lead'); if (lead) lead.textContent = 'Questions about a piece, sizing or a custom request? Our client-care inbox opens shortly.';
        if (U.qs('#contact-details').hidden) U.qs('.contact-layout').classList.add('contact-layout--single');
        return;
      }
      initForm();
    }
  };
})();

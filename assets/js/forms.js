/* Maison Aurelle — form validation & submission helpers (MA.forms) */
(function () {
  'use strict';
  window.MA = window.MA || {};
  var U = MA.utils;
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  var PHONE_RE = /^[\d\s()+.-]{7,20}$/;
  var POSTAL = { US: /^\d{5}(-\d{4})?$/, CA: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/ };

  function labelFor(input) {
    var lbl = input.id ? U.qs('label[for="' + input.id + '"]') : null;
    if (!lbl) lbl = input.closest('label');
    var text = lbl ? lbl.textContent.replace(/\*/g, '').trim() : (input.getAttribute('aria-label') || input.name || 'This field');
    return text;
  }

  function validateField(input) {
    if (!input || input.disabled) return '';
    var type = (input.getAttribute('type') || input.tagName).toLowerCase();
    var value = type === 'checkbox' ? (input.checked ? 'on' : '') : String(input.value || '').trim();
    var label = labelFor(input);
    var required = input.hasAttribute('required') || input.getAttribute('aria-required') === 'true';

    if (!value) {
      if (!required) return '';
      if (type === 'checkbox') return input.dataset.errorRequired || 'Please tick this box to continue.';
      if (type === 'select') return input.dataset.errorRequired || label + ' is required \u2014 please choose one.';
      return input.dataset.errorRequired || label + ' is required.';
    }
    if (type === 'email' && !EMAIL_RE.test(value)) return 'Please enter a valid email address, including the @ and the domain.';
    var minlength = Number(input.getAttribute('minlength'));
    if (minlength && value.length < minlength) return label + ' must be at least ' + minlength + ' characters.';
    var maxlength = Number(input.getAttribute('maxlength'));
    if (maxlength && value.length > maxlength) return label + ' must be ' + maxlength + ' characters or fewer.';
    var pattern = input.getAttribute('pattern');
    if (pattern) {
      try { if (!(new RegExp('^(?:' + pattern + ')$')).test(value)) return input.dataset.errorPattern || 'Please match the requested format.'; } catch (e) { /* bad pattern: skip */ }
    }
    var validate = input.dataset.validate;
    if (validate === 'phone' && !PHONE_RE.test(value)) return 'Please enter a phone number using digits, spaces, parentheses, + or dashes.';
    if (validate === 'postal') {
      var form = input.form;
      var countrySel = form ? (form.querySelector('select[name="country"]') || form.querySelector('[data-country]')) : null;
      var country = countrySel ? countrySel.value : '';
      var re = POSTAL[country];
      if (re && !re.test(value)) {
        return country === 'US' ? 'Please enter a 5-digit ZIP code (or ZIP+4, like 12345-6789).' : 'Please enter a valid postal code, like A1A 1A1.';
      }
    }
    return '';
  }

  function fieldWrap(input) { return input.closest('.field') || input.parentElement; }
  function errorNode(input) {
    var wrap = fieldWrap(input);
    var node = wrap ? wrap.querySelector('.field__error') : null;
    if (!node) {
      node = U.el('p', { class: 'field__error' });
      if (wrap) wrap.appendChild(node);
    }
    if (!node.id) node.id = (input.id || input.name || 'field') + '-error';
    return node;
  }
  function addDescribedBy(input, id) {
    var ids = (input.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean);
    if (ids.indexOf(id) === -1) ids.push(id);
    input.setAttribute('aria-describedby', ids.join(' '));
  }
  function removeDescribedBy(input, id) {
    var ids = (input.getAttribute('aria-describedby') || '').split(/\s+/).filter(function (x) { return x && x !== id; });
    if (ids.length) input.setAttribute('aria-describedby', ids.join(' ')); else input.removeAttribute('aria-describedby');
  }

  function showFieldError(input, message) {
    var node = errorNode(input);
    node.textContent = '';
    node.appendChild(U.el('span', { class: 'field__error-icon', 'aria-hidden': 'true', text: '!' }));
    node.appendChild(document.createTextNode(' ' + message));
    node.hidden = false;
    input.setAttribute('aria-invalid', 'true');
    addDescribedBy(input, node.id);
    var wrap = fieldWrap(input); if (wrap) wrap.classList.add('field--invalid');
  }
  function clearFieldError(input) {
    var wrap = fieldWrap(input);
    var node = wrap ? wrap.querySelector('.field__error') : null;
    if (node) { node.textContent = ''; node.hidden = true; removeDescribedBy(input, node.id); }
    input.removeAttribute('aria-invalid');
    if (wrap) wrap.classList.remove('field--invalid');
  }

  function controls(form) {
    return U.qsa('input, select, textarea', form).filter(function (c) {
      return c.type !== 'hidden' && c.type !== 'submit' && c.type !== 'button' && !c.disabled && c.offsetParent !== null;
    });
  }

  function renderSummary(form, errors) {
    var summary = form.querySelector('.error-summary');
    if (!summary) {
      summary = U.el('div', { class: 'error-summary', role: 'alert', tabindex: '-1' });
      form.insertBefore(summary, form.firstChild);
    }
    summary.textContent = '';
    if (!errors.length) { summary.hidden = true; return summary; }
    summary.hidden = false;
    summary.appendChild(U.el('h2', { class: 'error-summary__title', text: 'Please fix the following' }));
    var list = U.el('ul', { class: 'error-summary__list' });
    errors.forEach(function (err) {
      var id = err.input.id;
      var link = U.el('a', { href: id ? '#' + id : '#', text: err.message, on: { click: function (e) {
        e.preventDefault(); err.input.focus(); err.input.scrollIntoView({ block: 'center' });
      } } });
      list.appendChild(U.el('li', {}, link));
    });
    summary.appendChild(list);
    return summary;
  }

  function validateForm(form) {
    var errors = [];
    controls(form).forEach(function (input) {
      var msg = validateField(input);
      if (msg) { errors.push({ input: input, message: msg }); showFieldError(input, msg); }
      else clearFieldError(input);
    });
    var summary = renderSummary(form, errors);
    if (errors.length) {
      // One scroll only: scroll-margin-top keeps the summary clear of the sticky header, then focus without a second scroll.
      summary.scrollIntoView({ block: 'start' });
      try { summary.focus({ preventScroll: true }); } catch (e) { summary.focus(); }
    }
    if (!form.dataset.liveValidate) {
      form.dataset.liveValidate = '1';
      var live = function (e) {
        var t = e.target;
        if (!t || !t.matches || !t.matches('input, select, textarea')) return;
        if (e.type === 'input' && t.getAttribute('aria-invalid') !== 'true') return;
        var m = validateField(t);
        if (m) showFieldError(t, m); else clearFieldError(t);
        var remaining = controls(form).filter(function (c) { return c.getAttribute('aria-invalid') === 'true'; });
        if (!remaining.length) { var s = form.querySelector('.error-summary'); if (s) s.hidden = true; }
      };
      form.addEventListener('blur', live, true);
      form.addEventListener('input', live);
      form.addEventListener('change', live);
    }
    return errors;
  }

  function postJSON(url, data) {
    var controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    var timer = controller ? setTimeout(function () { controller.abort(); }, 15000) : null;
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data),
      signal: controller ? controller.signal : undefined
    }).then(function (res) {
      clearTimeout(timer);
      return { ok: res.ok, status: res.status };
    }).catch(function () {
      clearTimeout(timer);
      return { ok: false, status: 0 };
    });
  }

  function mailtoURL(to, subject, body) {
    var encBody = encodeURIComponent(body || '');
    if (encBody.length > 1800) {
      var note = '\n\n(full order details continue — please reply with any corrections)';
      var budget = 1800 - encodeURIComponent(note).length;
      var cut = String(body);
      while (encodeURIComponent(cut).length > budget && cut.length) cut = cut.slice(0, -20);
      encBody = encodeURIComponent(cut + note);
    }
    return 'mailto:' + encodeURIComponent(to) + '?subject=' + encodeURIComponent(subject || '') + '&body=' + encBody;
  }

  function serialize(form) {
    var out = {};
    var fd = new FormData(form);
    fd.forEach(function (value, key) {
      if (typeof value === 'string') out[key] = value.trim();
    });
    U.qsa('input[type="checkbox"]', form).forEach(function (cb) { if (cb.name) out[cb.name] = cb.checked; });
    return out;
  }

  MA.forms = {
    validateField: validateField, showFieldError: showFieldError, clearFieldError: clearFieldError,
    validateForm: validateForm, postJSON: postJSON, mailtoURL: mailtoURL, serialize: serialize
  };
})();

(function () {
  // Two languages. English is in the page; the Malay line rides on data-ms.
  // The choice travels in the address (?lang=ms) so it survives a browser that blocks storage.
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var lang = /[?&]lang=ms\b/.test(location.search) ? 'ms' : 'en';
  if (lang === 'en' && store.get('kf-lang') === 'ms') lang = 'ms';
  var langBtn = document.getElementById('lang');
  function say(en, ms) { return lang === 'ms' ? ms : en; }
  function paint() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-ms]').forEach(function (el) {
      if (el.dataset.en === undefined) el.dataset.en = el.textContent;
      el.textContent = lang === 'ms' ? el.dataset.ms : el.dataset.en;
    });
    document.querySelectorAll('img[data-alt-ms]').forEach(function (img) {
      if (img.dataset.altEn === undefined) img.dataset.altEn = img.alt;
      img.alt = lang === 'ms' ? img.dataset.altMs : img.dataset.altEn;
    });
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!/^[a-z-]+\.html/.test(href)) return;
      var hash = href.indexOf('#') > -1 ? href.slice(href.indexOf('#')) : '';
      var base = (hash ? href.slice(0, href.indexOf('#')) : href).replace(/[?&]lang=ms$/, '');
      if (lang === 'ms') base += (base.indexOf('?') > -1 ? '&' : '?') + 'lang=ms';
      a.setAttribute('href', base + hash);
    });
    if (langBtn) {
      langBtn.textContent = lang === 'ms' ? 'EN' : 'BM';
      langBtn.setAttribute('aria-label', lang === 'ms' ? 'Switch to English' : 'Tukar ke Bahasa Melayu');
    }
  }
  if (langBtn) {
    langBtn.addEventListener('click', function () {
      lang = lang === 'ms' ? 'en' : 'ms';
      store.set('kf-lang', lang);
      paint();
    });
  }
  if (lang === 'ms') paint();

  // Timetable: one day at a time. Without this script every day is listed.
  var days = document.getElementById('days');
  if (days) {
    var day = 'mon';
    var showDay = function () {
      days.querySelectorAll('.slots').forEach(function (s) { s.hidden = s.dataset.day !== day; });
      days.querySelectorAll('.chip').forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.day === day)); });
    };
    days.querySelectorAll('.chip').forEach(function (c) { c.addEventListener('click', function () { day = c.dataset.day; showDay(); }); });
    showDay();
  }

  // Plans: monthly or yearly prices.
  document.querySelectorAll('[data-bill]').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('[data-bill]').forEach(function (o) { o.setAttribute('aria-pressed', String(o === b)); });
      document.querySelectorAll('.plan__price b').forEach(function (p) { p.textContent = p.dataset[b.dataset.bill]; });
    });
  });

  // The phone menu and the WhatsApp note close when you tap outside them.
  document.addEventListener('click', function (e) {
    document.querySelectorAll('details.nav__menu[open], details.wa[open]').forEach(function (d) {
      if (!d.contains(e.target)) d.removeAttribute('open');
    });
  });

  // Demo forms check their fields and say plainly that nothing was sent.
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    var help = form.querySelector('[aria-live]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      form.querySelectorAll('[required]').forEach(function (input) {
        var ok = input.value.trim() !== '';
        input.toggleAttribute('aria-invalid', !ok);
        if (!ok && !bad) bad = input;
      });
      help.textContent = bad ? say(help.dataset.needEn, help.dataset.needMs) : say(help.dataset.doneEn, help.dataset.doneMs);
      if (bad) bad.focus();
    });
  });
})();

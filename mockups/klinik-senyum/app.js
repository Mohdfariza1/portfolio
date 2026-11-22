(function () {
  // Two languages. Bahasa Melayu is in the page; the English line rides on data-en.
  // The choice travels in the address (?lang=en) so it survives a browser that blocks storage.
  var lang = /[?&]lang=en\b/.test(location.search) ? 'en' : 'ms';
  try { if (lang === 'ms' && localStorage.getItem('ks-lang') === 'en') lang = 'en'; } catch (e) {}
  var langBtn = document.getElementById('lang');
  function say(ms, en) { return lang === 'en' ? en : ms; }
  function paint() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (el.dataset.ms === undefined) el.dataset.ms = el.textContent;
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.ms;
    });
    document.querySelectorAll('img[data-alt-en]').forEach(function (img) {
      if (img.dataset.altMs === undefined) img.dataset.altMs = img.alt;
      img.alt = lang === 'en' ? img.dataset.altEn : img.dataset.altMs;
    });
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!/^[a-z-]+\.html/.test(href)) return;
      var hash = href.indexOf('#') > -1 ? href.slice(href.indexOf('#')) : '';
      var base = (hash ? href.slice(0, href.indexOf('#')) : href).replace(/[?&]lang=en$/, '');
      if (lang === 'en') base += (base.indexOf('?') > -1 ? '&' : '?') + 'lang=en';
      a.setAttribute('href', base + hash);
    });
    if (langBtn) {
      langBtn.textContent = lang === 'en' ? 'BM' : 'EN';
      langBtn.setAttribute('aria-label', lang === 'en' ? 'Tukar ke Bahasa Melayu' : 'Switch to English');
    }
  }
  if (langBtn) {
    langBtn.addEventListener('click', function () {
      lang = lang === 'en' ? 'ms' : 'en';
      try { localStorage.setItem('ks-lang', lang); } catch (e) {}
      paint();
    });
  }
  if (lang === 'en') paint();

  // The phone menu and the WhatsApp note close when you tap outside them.
  document.addEventListener('click', function (e) {
    document.querySelectorAll('details.nav__menu[open], details.wa[open]').forEach(function (d) {
      if (!d.contains(e.target)) d.removeAttribute('open');
    });
  });

  // The form is a demo: it checks the fields and says plainly that nothing was sent.
  document.querySelectorAll('form[data-demo]').forEach(function (form) {
    var help = form.querySelector('[aria-live]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      form.querySelectorAll('input[required]').forEach(function (input) {
        var ok = input.value.trim() !== '';
        input.toggleAttribute('aria-invalid', !ok);
        if (!ok && !bad) bad = input;
      });
      if (bad) {
        help.textContent = say('Isi nama dan nombor WhatsApp supaya kami boleh hubungi anda.', 'Add your name and a WhatsApp number so we can reach you.');
        bad.focus();
        return;
      }
      help.textContent = say('Tiada apa dihantar: ini borang demo dan ia tak disambung.', 'Nothing was sent: this is a demo form and it is not connected.');
    });
  });
})();

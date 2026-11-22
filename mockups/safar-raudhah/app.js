(function () {
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Two languages. Bahasa Melayu is in the page; the English line rides on data-en.
  // The choice travels in the address (?lang=en) so it survives a browser that blocks storage.
  var lang = /[?&]lang=en\b/.test(location.search) ? 'en' : 'ms';
  try { if (lang === 'ms' && localStorage.getItem('sr-lang') === 'en') lang = 'en'; } catch (e) {}
  var langBtn = document.getElementById('lang');
  function say(ms, en) { return lang === 'en' ? en : ms; }
  function paint() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-en]').forEach(function (el) {
      if (el.dataset.ms === undefined) el.dataset.ms = el.textContent;
      el.textContent = lang === 'en' ? el.dataset.en : el.dataset.ms;
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
      try { localStorage.setItem('sr-lang', lang); } catch (e) {}
      paint();
      pick();
    });
  }
  if (lang === 'en') paint();

  // The film plays silently and loops. It stays still for visitors who asked for less motion,
  // and the button lets anyone stop it.
  var film = document.querySelector('.film video');
  var toggle = document.querySelector('.film__toggle');
  if (film && toggle) {
    var label = function () {
      toggle.dataset.ms = film.paused ? 'Main video' : 'Henti video';
      toggle.dataset.en = film.paused ? 'Play video' : 'Pause video';
      toggle.textContent = say(toggle.dataset.ms, toggle.dataset.en);
    };
    if (calm) { film.removeAttribute('autoplay'); film.pause(); }
    toggle.addEventListener('click', function () { if (film.paused) film.play(); else film.pause(); });
    film.addEventListener('play', label);
    film.addEventListener('pause', label);
    label();
  }

  // Package finder: the budget picks one of the three packages and takes the visitor to it.
  var finder = document.getElementById('finder');
  var packs = document.querySelectorAll('.pack[data-pack]');
  var finderSay = document.getElementById('finder-say');
  var names = { ekonomi: ['Pakej Ekonomi', 'Economy Package'], selesa: ['Pakej Selesa', 'Comfort Package'], premium: ['Pakej Premium', 'Premium Package'] };
  var chosen = '';
  function pick() {
    packs.forEach(function (p) { p.classList.toggle('is-pick', p.dataset.pack === chosen); });
    if (finderSay && chosen) finderSay.textContent = say('Yang paling sesuai: ', 'Best match: ') + say(names[chosen][0], names[chosen][1]);
  }
  if (finder) {
    finder.addEventListener('submit', function (e) {
      e.preventDefault();
      chosen = finder.querySelector('[name="budget"]').value;
      pick();
      var target = document.querySelector('.pack[data-pack="' + chosen + '"]');
      if (target) target.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'center' });
    });
  }

  // A "book this date" link carries the date to the booking form.
  var wanted = /[?&]tarikh=([^&#]+)/.exec(location.search);
  var dateField = document.getElementById('tarikh');
  if (wanted && dateField) {
    var value = decodeURIComponent(wanted[1]);
    Array.prototype.forEach.call(dateField.options, function (o) { if (o.value === value) dateField.value = value; });
  }

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

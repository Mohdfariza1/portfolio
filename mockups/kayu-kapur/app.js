(function () {
  var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Two languages. English is in the page; the Bahasa Melayu line rides on data-ms.
  // The choice travels in the address (?lang=ms) so it survives a browser that blocks storage.
  var lang = /[?&]lang=ms\b/.test(location.search) ? 'ms' : 'en';
  try { if (lang === 'en' && localStorage.getItem('kk-lang') === 'ms') lang = 'ms'; } catch (e) {}
  var langBtn = document.getElementById('lang');
  function say(en, ms) { return lang === 'ms' ? ms : en; }
  function paint() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-ms]').forEach(function (el) {
      if (el.dataset.en === undefined) el.dataset.en = el.textContent;
      el.textContent = lang === 'ms' ? el.dataset.ms : el.dataset.en;
    });
    document.querySelectorAll('a[href]').forEach(function (a) {
      var href = a.getAttribute('href');
      if (!/^[a-z-]+\.html/.test(href)) return;
      var parts = href.split('#');
      var base = parts[0].replace(/\?lang=ms$/, '') + (lang === 'ms' ? '?lang=ms' : '');
      a.setAttribute('href', base + (parts[1] ? '#' + parts[1] : ''));
    });
    if (langBtn) {
      langBtn.textContent = lang === 'ms' ? 'EN' : 'BM';
      langBtn.setAttribute('aria-label', lang === 'ms' ? 'Switch to English' : 'Tukar ke Bahasa Melayu');
    }
  }
  if (langBtn) {
    langBtn.addEventListener('click', function () {
      lang = lang === 'ms' ? 'en' : 'ms';
      try { localStorage.setItem('kk-lang', lang); } catch (e) {}
      paint();
    });
  }
  if (lang === 'ms') paint();

  // One room, two states. The range input covers the photograph, so mouse, touch and arrow keys all work.
  document.querySelectorAll('.compare').forEach(function (box) {
    var range = box.querySelector('.compare__range');
    if (!range) return;
    var setPos = function (v) { box.style.setProperty('--pos', v + '%'); };
    range.addEventListener('input', function () { box.classList.remove('is-sweeping'); setPos(range.value); });
    if (!calm) {
      setPos(92);
      requestAnimationFrame(function () { requestAnimationFrame(function () { box.classList.add('is-sweeping'); setPos(50); }); });
    }
  });

  // The statement arrives line by line, once.
  var seen = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-in'); seen.unobserve(e.target); } });
  }, { rootMargin: '0px 0px -10% 0px' });
  document.querySelectorAll('[data-reveal]').forEach(function (el) { seen.observe(el); });

  // Homes: the page scrolls as usual. Whichever home is at the middle of the screen
  // owns the photograph on the right, and the new one slides in over the old one.
  var homes = Array.prototype.slice.call(document.querySelectorAll('.home'));
  var panels = Array.prototype.slice.call(document.querySelectorAll('.homes__stage figure'));
  var current = 0;
  function show(i) {
    if (i === current || !panels[i]) return;
    panels.forEach(function (p) { p.classList.remove('is-under'); });
    panels[current].classList.remove('is-on');
    panels[current].classList.add('is-under');
    panels[i].classList.add('is-on');
    homes.forEach(function (h, n) { h.classList.toggle('is-near', n === i); });
    current = i;
  }
  var middle = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting) show(Number(e.target.dataset.home)); });
  }, { rootMargin: '-50% 0px -50% 0px' });
  homes.forEach(function (h) { middle.observe(h); });

  // On a phone the homes are a row to swipe; the bar under it shows how far along you are.
  var rail = document.querySelector('.homes__list');
  var bar = document.querySelector('.homes__bar');
  if (rail && bar) {
    var railTick = false;
    var along = function () {
      railTick = false;
      var room = rail.scrollWidth - rail.clientWidth;
      var share = rail.clientWidth / rail.scrollWidth;
      bar.style.setProperty('--p', room > 0 ? (share + (1 - share) * (rail.scrollLeft / room)).toFixed(3) : 1);
    };
    rail.addEventListener('scroll', function () { if (!railTick) { railTick = true; requestAnimationFrame(along); } }, { passive: true });
    window.addEventListener('resize', along);
    along();
  }

  // The job: the line fills as the steps pass the middle of the screen.
  var steps = document.getElementById('steps');
  if (steps && !calm) {
    var ticking = false;
    var fill = function () {
      ticking = false;
      var r = steps.getBoundingClientRect();
      var done = (window.innerHeight * 0.6 - r.top) / r.height;
      steps.style.setProperty('--done', Math.max(0, Math.min(1, done)).toFixed(3));
      // A step's number fills once the line has reached it.
      Array.prototype.forEach.call(steps.children, function (li) {
        li.classList.toggle('is-done', li.getBoundingClientRect().top < window.innerHeight * 0.6 - 24);
      });
    };
    window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(fill); } }, { passive: true });
    fill();
  }

  // The phone menu and the WhatsApp note close when you tap outside them.
  document.addEventListener('click', function (e) {
    document.querySelectorAll('details.nav__menu[open], details.wa[open]').forEach(function (d) {
      if (!d.contains(e.target)) d.removeAttribute('open');
    });
  });

  // The form is a demo: it checks the fields and says plainly that nothing was sent.
  document.querySelectorAll('form[data-endpoint]').forEach(function (form) {
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
        bad.setAttribute('aria-describedby', help.id);
        help.textContent = say('Add your name and a WhatsApp number so we can reach you.', 'Isi nama dan nombor WhatsApp supaya kami boleh hubungi anda.');
        bad.focus();
        return;
      }
      if (!form.dataset.endpoint) {
        help.textContent = say('Nothing was sent: this is a demo form and it is not connected.', 'Tiada apa dihantar: ini borang demo dan ia tak disambung.');
        return;
      }
    });
  });
})();

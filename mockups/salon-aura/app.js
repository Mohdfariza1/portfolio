(function () {
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var lang = /[?&]lang=ms\b/.test(location.search) || store.get('ah-lang') === 'ms' ? 'ms' : 'en';
  function say(en, ms) { return lang === 'ms' ? ms : en; }

  var GROUPS = [
    { n: ['Cut', 'Potong'], items: [
      { id: 'cut', n: ['Ladies cut and blow dry', 'Potong dan blow wanita'], p: 85, m: 60 },
      { id: 'gents', n: ['Gents cut', 'Potong lelaki'], p: 45, m: 30 },
      { id: 'blow', n: ['Wash and blow dry', 'Cuci dan blow'], p: 55, m: 45 }] },
    { n: ['Colour', 'Warna'], items: [
      { id: 'root', n: ['Root touch-up', 'Warna akar rambut'], p: 140, m: 90 },
      { id: 'full', n: ['Full head colour', 'Warna seluruh rambut'], p: 240, m: 150 },
      { id: 'high', n: ['Highlights or balayage', 'Highlight atau balayage'], p: 380, m: 210 }] },
    { n: ['Treatment', 'Rawatan'], items: [
      { id: 'keratin', n: ['Keratin smoothing', 'Rawatan keratin'], p: 320, m: 150 },
      { id: 'scalp', n: ['Scalp treatment', 'Rawatan kulit kepala'], p: 95, m: 45 }] }
  ];
  var ALL = [].concat.apply([], GROUPS.map(function (g) { return g.items; }));
  // pic = which third of the one team photo (img/team.jpg, three across). busy = start times already taken.
  var PEOPLE = [
    { id: 'any', n: ['Anyone free', 'Sesiapa yang kosong'], r: ['First available', 'Yang pertama kosong'], add: 0, busy: [] },
    { id: 'farah', n: ['Farah', 'Farah'], r: ['Senior, colour', 'Senior, warna'], add: 30, pic: 0, busy: ['11:00', '11:30', '12:00', '15:00', '15:30', '16:00'], d: ['Twelve years with colour. Ask her before you bleach anything at home.', 'Dua belas tahun dengan warna. Tanya dia dulu sebelum bleach sendiri di rumah.'] },
    { id: 'jon', n: ['Jonathan', 'Jonathan'], r: ['Senior, cuts', 'Senior, potong'], add: 30, pic: 1, busy: ['13:00', '13:30', '14:00', '18:00', '18:30'], d: ['Cuts that still look right six weeks later. Good with thick and wavy hair.', 'Potongan yang masih kemas enam minggu kemudian. Mahir dengan rambut tebal dan ikal.'] },
    { id: 'ain', n: ['Ain', 'Ain'], r: ['Cuts and treatments', 'Potong dan rawatan'], add: 0, pic: 2, busy: ['12:30', '13:00', '17:00', '17:30'], d: ['Private room available for hijab-wearing clients. Gentle with sensitive scalps.', 'Bilik tertutup tersedia untuk yang bertudung. Lembut dengan kulit kepala sensitif.'] }
  ];
  var OPEN = 11 * 60, CLOSE = 20 * 60;
  var DOW = [['Sun', 'Ahd'], ['Mon', 'Isn'], ['Tue', 'Sel'], ['Wed', 'Rab'], ['Thu', 'Kha'], ['Fri', 'Jum'], ['Sat', 'Sab']];
  var MON = [['Jan', 'Jan'], ['Feb', 'Feb'], ['Mar', 'Mac'], ['Apr', 'Apr'], ['May', 'Mei'], ['Jun', 'Jun'], ['Jul', 'Jul'], ['Aug', 'Ogo'], ['Sep', 'Sep'], ['Oct', 'Okt'], ['Nov', 'Nov'], ['Dec', 'Dis']];
  var days = [];
  for (var d = new Date(), i = 1; days.length < 6; i++) { var x = new Date(d.getFullYear(), d.getMonth(), d.getDate() + i); if (x.getDay() !== 1) days.push(x); }

  var st = { picks: { cut: true }, who: 'any', day: 0, time: '' };
  function picks() { return ALL.filter(function (s) { return st.picks[s.id]; }); }
  function who() { return PEOPLE.filter(function (p) { return p.id === st.who; })[0]; }
  function mins() { return picks().reduce(function (a, s) { return a + s.m; }, 0); }
  function total() { return picks().reduce(function (a, s) { return a + s.p; }, 0) + (picks().length ? who().add : 0); }
  function hm(m) { var h = Math.floor(m / 60), r = m % 60; return h ? h + say(' h', ' jam') + (r ? ' ' + r + say(' min', ' min') : '') : r + say(' min', ' min'); }
  function clock(t) { var p = t.split(':'), h = +p[0]; return (h > 12 ? h - 12 : h) + ':' + p[1] + (h < 12 ? say(' am', ' pagi') : h < 19 ? say(' pm', ' petang') : say(' pm', ' malam')); }
  function dayName(x) { return say(DOW[x.getDay()][0], DOW[x.getDay()][1]) + ' ' + x.getDate() + ' ' + say(MON[x.getMonth()][0], MON[x.getMonth()][1]); }
  function slots() {
    var out = [], len = mins(), busy = who().busy;
    // Each day shifts the taken times a little, so the days do not all look the same.
    for (var t = OPEN; t < CLOSE; t += 30) {
      var label = ('0' + Math.floor(t / 60)).slice(-2) + ':' + ('0' + t % 60).slice(-2);
      var taken = false;
      for (var u = t; u < t + Math.max(30, len); u += 30) {
        var l = ('0' + Math.floor(((u - OPEN + st.day * 60) % (CLOSE - OPEN) + OPEN) / 60)).slice(-2) + ':' + ('0' + u % 60).slice(-2);
        if (busy.indexOf(l) > -1) taken = true;
      }
      out.push({ t: label, ok: !taken && t + len <= CLOSE });
    }
    return out;
  }

  function draw() {
    document.getElementById('services').innerHTML = GROUPS.map(function (g) {
      return '<div class="group"><p>' + say(g.n[0], g.n[1]) + '</p>' + g.items.map(function (s) {
        return '<label class="svc"><input type="checkbox" data-svc="' + s.id + '"' + (st.picks[s.id] ? ' checked' : '') + '><span><b>' + say(s.n[0], s.n[1]) + '</b><small>' + hm(s.m) + '</small><em>RM' + s.p + '</em></span></label>';
      }).join('') + '</div>';
    }).join('');
    document.getElementById('people').innerHTML = PEOPLE.map(function (p) {
      return '<label class="person"><input type="radio" name="who" value="' + p.id + '"' + (p.id === st.who ? ' checked' : '') + '><span>' + (p.pic === undefined ? '<i class="person__any">?</i>' : '<i class="person__pic" style="background-position: ' + p.pic * 50 + '% 14%"></i>') + '<b>' + say(p.n[0], p.n[1]) + '</b><small>' + say(p.r[0], p.r[1]) + (p.add ? ', +RM' + p.add : '') + '</small></span></label>';
    }).join('');
    document.getElementById('days').innerHTML = days.map(function (x, i) { return '<button type="button" class="day" data-day="' + i + '" aria-pressed="' + (i === st.day) + '">' + dayName(x) + '</button>'; }).join('');
    var list = slots();
    if (st.time && !list.filter(function (s) { return s.t === st.time && s.ok; }).length) st.time = '';
    document.getElementById('times').innerHTML = list.map(function (s) { return '<button type="button" class="time" data-time="' + s.t + '" aria-pressed="' + (s.t === st.time) + '"' + (s.ok ? '' : ' disabled') + '>' + clock(s.t) + '</button>'; }).join('');
    var free = list.filter(function (s) { return s.ok; }).length;
    document.getElementById('times-note').textContent = !picks().length ? say('Pick at least one service first.', 'Pilih sekurang-kurangnya satu servis dulu.') : free ? say(free + ' start times fit ' + hm(mins()) + '. The rest are taken or end after 8 pm.', free + ' masa mula muat untuk ' + hm(mins()) + '. Selebihnya dah penuh atau habis lepas 8 malam.') : say('No time fits ' + hm(mins()) + ' on this day. Try another day or stylist.', 'Tiada masa yang muat untuk ' + hm(mins()) + ' pada hari ni. Cuba hari atau stylist lain.');

    var ready = picks().length && st.time;
    var lines = [
      [say('What', 'Apa'), picks().length ? picks().map(function (s) { return say(s.n[0], s.n[1]); }).join(', ') : say('Nothing picked yet', 'Belum pilih')],
      [say('Who', 'Siapa'), say(who().n[0], who().n[1])],
      [say('When', 'Bila'), st.time ? dayName(days[st.day]) + ', ' + clock(st.time) : say('Pick a time', 'Pilih masa')],
      [say('How long', 'Berapa lama'), picks().length ? hm(mins()) : '']
    ];
    document.getElementById('card-lines').innerHTML = lines.map(function (l) { return '<div><dt>' + l[0] + '</dt><dd>' + l[1] + '</dd></div>'; }).join('');
    document.getElementById('card-total').textContent = 'RM' + total();
    document.getElementById('confirm').disabled = !ready;
    document.getElementById('card-note').textContent = ready ? say('No deposit. Pay at the salon.', 'Tiada deposit. Bayar di salon.') : say('Pick a service and a time to confirm.', 'Pilih servis dan masa untuk sahkan.');
    document.getElementById('dock-total').textContent = 'RM' + total();
    document.getElementById('dock-line').textContent = picks().length ? hm(mins()) + (st.time ? ', ' + clock(st.time) : '') : say('Nothing picked yet', 'Belum pilih');

    document.getElementById('price-list').innerHTML = GROUPS.map(function (g) {
      return '<table><caption>' + say(g.n[0], g.n[1]) + '</caption><tbody>' + g.items.map(function (s) { return '<tr><th scope="row">' + say(s.n[0], s.n[1]) + '</th><td>' + hm(s.m) + '</td><td>RM' + s.p + '</td></tr>'; }).join('') + '</tbody></table>';
    }).join('');
    document.getElementById('bios').innerHTML = PEOPLE.slice(1).map(function (p) {
      return '<li><i class="bio__pic" style="background-position: ' + p.pic * 50 + '% 14%" role="img" aria-label="' + p.n[0] + '"></i><div><h3>' + p.n[0] + '</h3><p class="bio__role">' + say(p.r[0], p.r[1]) + '</p><p>' + say(p.d[0], p.d[1]) + '</p><button class="link" type="button" data-with="' + p.id + '">' + say('Book with ' + p.n[0], 'Tempah dengan ' + p.n[0]) + '</button></div></li>';
    }).join('');
  }
  function refocus(sel) { var el = document.querySelector(sel); if (el) el.focus(); }

  document.addEventListener('change', function (e) {
    var t = e.target;
    if (t.dataset.svc) { st.picks[t.dataset.svc] = t.checked; draw(); refocus('[data-svc="' + t.dataset.svc + '"]'); }
    else if (t.name === 'who') { st.who = t.value; draw(); refocus('[name="who"][value="' + t.value + '"]'); }
  });
  var done = document.getElementById('done');
  document.addEventListener('click', function (e) {
    document.querySelectorAll('details.wa[open]').forEach(function (d) { if (!d.contains(e.target)) d.removeAttribute('open'); });
    if (e.target === done) { done.close(); return; }
    var b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.day) { st.day = +b.dataset.day; draw(); refocus('[data-day="' + st.day + '"]'); }
    else if (b.dataset.time) { st.time = b.dataset.time; draw(); refocus('[data-time="' + st.time + '"]'); }
    else if (b.dataset.with) { st.who = b.dataset.with; draw(); document.getElementById('book').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }); }
    else if (b.id === 'confirm') {
      document.getElementById('done-sum').textContent = picks().map(function (s) { return say(s.n[0], s.n[1]); }).join(', ') + '. ' + say(who().n[0], who().n[1]) + '. ' + dayName(days[st.day]) + ', ' + clock(st.time) + '. RM' + total() + '.';
      document.getElementById('done-say').textContent = '';
      done.showModal();
    }
    else if (b.hasAttribute('data-done-close')) done.close();
  });
  document.getElementById('done-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = null;
    this.querySelectorAll('[required]').forEach(function (i) { var ok = i.value.trim() !== ''; i.toggleAttribute('aria-invalid', !ok); if (!ok && !bad) bad = i; });
    document.getElementById('done-say').textContent = bad ? say('Add your name and WhatsApp number.', 'Isi nama dan nombor WhatsApp.') : say('Nothing was booked: this is a demo. On a real site the chair is held and a reminder goes out the day before.', 'Tiada tempahan dibuat: ini demo. Di website sebenar, kerusi disimpan dan peringatan dihantar sehari sebelum.');
    if (bad) bad.focus();
  });

  function paint() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-ms]').forEach(function (el) {
      if (el.dataset.en === undefined) el.dataset.en = el.textContent;
      el.textContent = lang === 'ms' ? el.dataset.ms : el.dataset.en;
    });
    var btn = document.getElementById('lang');
    btn.textContent = lang === 'ms' ? 'EN' : 'BM';
    btn.setAttribute('aria-label', lang === 'ms' ? 'Switch to English' : 'Tukar ke Bahasa Melayu');
    draw();
  }
  document.getElementById('lang').addEventListener('click', function () { lang = lang === 'ms' ? 'en' : 'ms'; store.set('ah-lang', lang); paint(); });
  paint();
})();

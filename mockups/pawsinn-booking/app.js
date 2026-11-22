(function () {
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var lang = /[?&]lang=ms\b/.test(location.search) || store.get('pi-lang') === 'ms' ? 'ms' : 'en';
  function say(en, ms) { return lang === 'ms' ? ms : en; }

  // pic = column,row of the room photo on the one room sheet (img/rooms.jpg, 3 across, 2 down).
  var ROOMS = [
    { id: 'kennel', pet: 'dog', n: ['Standard Kennel', 'Kennel Standard'], p: 45, pic: [0, 0], d: ['A raised bed, two walks a day.', 'Katil bertingkat, dua kali jalan sehari.'], has: [['Air-conditioned', 'Berhawa dingin'], ['2 walks a day', '2 kali jalan sehari'], ['Evening photo', 'Gambar setiap petang']] },
    { id: 'suite', pet: 'dog', n: ['Deluxe Suite', 'Suite Deluxe'], p: 72, pic: [1, 0], d: ['A private room with a window and a toy box.', 'Bilik sendiri dengan tingkap dan kotak mainan.'], has: [['A window', 'Ada tingkap'], ['3 walks a day', '3 kali jalan sehari'], ['Toy box', 'Kotak mainan']] },
    { id: 'play', pet: 'dog', n: ['Playroom', 'Bilik Main'], p: 135, pic: [2, 0], d: ['Our biggest room, with its own play pen.', 'Bilik paling besar, dengan ruang main sendiri.'], has: [['Own play pen', 'Ruang main sendiri'], ['One-to-one play', 'Main seorang-seorang'], ['Bath before going home', 'Mandi sebelum balik']] },
    { id: 'condo', pet: 'cat', n: ['Cat Condo', 'Kondo Kucing'], p: 38, pic: [0, 1], d: ['Three levels to climb, in the quiet wing.', 'Tiga tingkat untuk dipanjat, di sayap yang senyap.'], has: [['Quiet wing', 'Sayap senyap'], ['Three levels', 'Tiga tingkat'], ['Evening photo', 'Gambar setiap petang']] },
    { id: 'catsuite', pet: 'cat', n: ['Cat Suite', 'Suite Kucing'], p: 58, pic: [1, 1], d: ['A whole room with a cat tree and a window seat.', 'Sebuah bilik dengan cat tree dan tempat duduk tepi tingkap.'], has: [['A window seat', 'Tempat duduk tepi tingkap'], ['Cat tree', 'Cat tree'], ['Play time twice a day', 'Masa main dua kali sehari']] }
  ];
  var EXTRAS = [
    { id: 'groom', n: ['Bath and groom before pick-up', 'Mandi dan grooming sebelum ambil'], p: 65, per: 0 },
    { id: 'walk', n: ['An extra evening walk', 'Jalan tambahan waktu petang'], p: 12, per: 1 },
    { id: 'ride', n: ['We collect from your home', 'Kami ambil dari rumah anda'], p: 30, per: 0 }
  ];
  var DAY = [
    ['7 am', '7 pagi', 'Morning walk', 'Jalan pagi', 'Twenty minutes around the garden, one dog at a time or with a friend they get on with.', 'Dua puluh minit keliling taman, seekor-seekor atau dengan kawan yang serasi.'],
    ['9 am', '9 pagi', 'Breakfast', 'Sarapan', 'Their own food, in the amount you wrote on the form. Rooms are cleaned while they eat.', 'Makanan sendiri, ikut sukatan yang anda tulis dalam borang. Bilik dicuci masa mereka makan.'],
    ['1 pm', '1 tengah hari', 'Play and nap', 'Main dan tidur', 'Play pen for the dogs, climbing time for the cats, then a nap in the cool.', 'Ruang main untuk anjing, masa memanjat untuk kucing, kemudian tidur dalam sejuk.'],
    ['6 pm', '6 petang', 'Evening walk', 'Jalan petang', 'The second walk of the day, then dinner.', 'Jalan kedua untuk hari tu, kemudian makan malam.'],
    ['8 pm', '8 malam', 'Your photo', 'Gambar untuk anda', 'A photo and a line on how the day went, sent to your WhatsApp.', 'Sekeping gambar dan sebaris cerita hari tu, dihantar ke WhatsApp anda.']
  ];
  var BRING = [['Vaccine book', 'Buku vaksin'], ['Their own food, enough for the stay', 'Makanan sendiri, cukup untuk sepanjang penginapan'], ['Any medicine, with the dose written down', 'Ubat, dengan dos yang ditulis'], ['A blanket or toy that smells of home', 'Selimut atau mainan yang ada bau rumah'], ['Collar with a name tag', 'Kolar dengan tag nama']];

  var st = { pet: 'dog', size: 0, nights: 3, room: 'suite', extras: {}, time: 0, packed: {} };
  var form = document.getElementById('stay');
  function rooms() { return ROOMS.filter(function (r) { return r.pet === st.pet; }); }
  function room() { return ROOMS.filter(function (r) { return r.id === st.room; })[0]; }
  function night(r) { return r.p + (st.pet === 'dog' ? st.size : 0); }
  function total() {
    var t = night(room()) * st.nights;
    EXTRAS.forEach(function (x) { if (st.extras[x.id]) t += x.p * (x.per ? st.nights : 1); });
    return t;
  }
  function pic(r) { return 'style="background-position: ' + (r.pic[0] * 50) + '% ' + (r.pic[1] * 100) + '%"'; }
  function nightsWord(n) { return say(n === 1 ? 'night' : 'nights', 'malam'); }

  function draw() {
    document.getElementById('size-set').hidden = st.pet !== 'dog';
    document.getElementById('nights').textContent = st.nights;
    document.getElementById('nights-word').textContent = nightsWord(st.nights);
    document.getElementById('room-list').innerHTML = rooms().map(function (r) {
      return '<label class="room"><input type="radio" name="room" value="' + r.id + '"' + (r.id === st.room ? ' checked' : '') + '><span class="room__in"><i class="room__pic" ' + pic(r) + '></i><span><b>' + say(r.n[0], r.n[1]) + '</b><small>' + say(r.d[0], r.d[1]) + '</small></span><em>RM' + night(r) + '</em></span></label>';
    }).join('');
    document.getElementById('extra-list').innerHTML = EXTRAS.map(function (x) {
      return '<label class="extra"><input type="checkbox" name="extra" value="' + x.id + '"' + (st.extras[x.id] ? ' checked' : '') + '><span>' + say(x.n[0], x.n[1]) + '</span><em>+RM' + x.p + (x.per ? say(' a night', ' semalam') : '') + '</em></label>';
    }).join('');
    var r = room();
    document.getElementById('ticket-line').textContent = st.nights + ' ' + nightsWord(st.nights) + ', ' + say(r.n[0], r.n[1]) + ', RM' + night(r) + say(' a night', ' semalam');
    var out = document.getElementById('ticket-total');
    if (out.textContent !== 'RM' + total()) { out.textContent = 'RM' + total(); out.classList.remove('is-bump'); void out.offsetWidth; out.classList.add('is-bump'); }
    document.getElementById('room-cards').innerHTML = ROOMS.map(function (c) {
      return '<li class="card"><i class="card__pic" ' + pic(c) + ' role="img" aria-label="' + say(c.n[0], c.n[1]) + '"></i><div><p class="card__for">' + (c.pet === 'dog' ? say('For dogs', 'Untuk anjing') : say('For cats', 'Untuk kucing')) + '</p><h3>' + say(c.n[0], c.n[1]) + '</h3><p>' + say(c.d[0], c.d[1]) + '</p><ul>' + c.has.map(function (h) { return '<li>' + say(h[0], h[1]) + '</li>'; }).join('') + '</ul></div><p class="card__price"><b>RM' + c.p + '</b><span>' + say('a night', 'semalam') + '</span></p><button class="btn btn--line" type="button" data-choose="' + c.id + '">' + say('Choose this room', 'Pilih bilik ni') + '</button></li>';
    }).join('');
    document.getElementById('clock').innerHTML = DAY.map(function (d, i) { return '<button type="button" class="tick" data-time="' + i + '" aria-pressed="' + (i === st.time) + '">' + say(d[0], d[1]) + '</button>'; }).join('');
    var d = DAY[st.time];
    document.getElementById('now').innerHTML = '<h3>' + say(d[2], d[3]) + '</h3><p>' + say(d[4], d[5]) + '</p>';
    document.getElementById('checks').innerHTML = BRING.map(function (b, i) { return '<li><label><input type="checkbox" data-pack="' + i + '"' + (st.packed[i] ? ' checked' : '') + '><span>' + say(b[0], b[1]) + '</span></label></li>'; }).join('');
    var n = Object.keys(st.packed).filter(function (k) { return st.packed[k]; }).length;
    document.getElementById('bring-count').textContent = n === BRING.length ? say('All packed. See you at drop-off.', 'Semua dah siap. Jumpa masa hantar.') : n + say(' of ', ' daripada ') + BRING.length + say(' packed', ' dah siap');
  }

  form.addEventListener('change', function (e) {
    var t = e.target;
    if (t.name === 'pet') { st.pet = t.value; st.room = rooms()[0].id; }
    else if (t.name === 'size') st.size = +t.value;
    else if (t.name === 'room') st.room = t.value;
    else if (t.name === 'extra') st.extras[t.value] = t.checked;
    draw();
    var keep = form.querySelector('[name="' + t.name + '"][value="' + t.value + '"]');
    if (keep) keep.focus();
  });
  document.addEventListener('change', function (e) { if (e.target.dataset.pack) { st.packed[e.target.dataset.pack] = e.target.checked; draw(); var c = document.querySelector('[data-pack="' + e.target.dataset.pack + '"]'); if (c) c.focus(); } });

  var hold = document.getElementById('hold');
  document.addEventListener('click', function (e) {
    document.querySelectorAll('details.wa[open]').forEach(function (d) { if (!d.contains(e.target)) d.removeAttribute('open'); });
    if (e.target === hold) { hold.close(); return; }
    var b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.night) { st.nights = Math.max(1, Math.min(21, st.nights + +b.dataset.night)); draw(); }
    else if (b.dataset.time) { st.time = +b.dataset.time; draw(); document.querySelector('[data-time="' + st.time + '"]').focus(); }
    else if (b.dataset.choose) {
      var r = ROOMS.filter(function (x) { return x.id === b.dataset.choose; })[0];
      st.pet = r.pet; st.room = r.id;
      form.querySelector('[name="pet"][value="' + r.pet + '"]').checked = true;
      draw();
      form.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    }
    else if (b.hasAttribute('data-hold-close')) hold.close();
  });
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById('hold-sum').textContent = document.getElementById('ticket-line').textContent + '. ' + say('Total RM', 'Jumlah RM') + total() + '.';
    document.getElementById('hold-say').textContent = '';
    hold.showModal();
  });
  document.getElementById('hold-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = null;
    this.querySelectorAll('[required]').forEach(function (i) { var ok = i.value.trim() !== ''; i.toggleAttribute('aria-invalid', !ok); if (!ok && !bad) bad = i; });
    document.getElementById('hold-say').textContent = bad ? say('Fill in all three so we can reach you.', 'Isi ketiga-tiga supaya kami boleh hubungi anda.') : say('Nothing was sent: this is a demo. On a real site the stay is held and we message you on WhatsApp.', 'Tiada apa dihantar: ini demo. Di website sebenar, tempat disimpan dan kami mesej anda di WhatsApp.');
    if (bad) bad.focus();
  });

  // A photo that is missing leaves no broken frame behind.
  document.querySelectorAll('img').forEach(function (img) { img.addEventListener('error', function () { img.hidden = true; }); if (img.complete && !img.naturalWidth) img.hidden = true; });

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
    var btn = document.getElementById('lang');
    btn.textContent = lang === 'ms' ? 'EN' : 'BM';
    btn.setAttribute('aria-label', lang === 'ms' ? 'Switch to English' : 'Tukar ke Bahasa Melayu');
    draw();
  }
  document.getElementById('lang').addEventListener('click', function () { lang = lang === 'ms' ? 'en' : 'ms'; store.set('pi-lang', lang); paint(); });
  paint();
})();

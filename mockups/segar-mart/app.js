(function () {
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var lang = /[?&]lang=ms\b/.test(location.search) || store.get('sm-lang') === 'ms' ? 'ms' : 'en';
  function say(en, ms) { return lang === 'ms' ? ms : en; }
  function rm(n) { return 'RM' + n.toFixed(2); }

  // Twelve products. pic = column,row of the photo on the one product sheet (img/products.jpg, 4 across, 3 down).
  var AISLES = [['all', 'Everything', 'Semua'], ['veg', 'Fruit and veg', 'Buah dan sayur'], ['meat', 'Chicken and fish', 'Ayam dan ikan'], ['dairy', 'Eggs and milk', 'Telur dan susu'], ['pantry', 'Rice and oil', 'Beras dan minyak']];
  var P = [
    { id: 'telur', a: 'dairy', n: ['Grade A eggs', 'Telur gred A'], u: ['tray of 30', 'sepapan 30 biji'], p: 11.9, was: 0, pic: [0, 2], key: 'telur egg eggs', pop: 99 },
    { id: 'ayam', a: 'meat', n: ['Whole chicken, cleaned', 'Ayam bersih seekor'], u: ['about 1.4 kg', 'lebih kurang 1.4 kg'], p: 13.5, was: 0, pic: [1, 1], key: 'ayam chicken', pop: 96 },
    { id: 'beras', a: 'pantry', n: ['Local white rice', 'Beras putih tempatan'], u: ['5 kg bag', 'beg 5 kg'], p: 26, was: 0, pic: [2, 2], key: 'beras rice nasi', pop: 94 },
    { id: 'pisang', a: 'veg', n: ['Pisang berangan', 'Pisang berangan'], u: ['one comb, about 1 kg', 'sesikat, lebih kurang 1 kg'], p: 7.9, was: 0, pic: [0, 0], key: 'pisang banana buah fruit', pop: 92 },
    { id: 'tomato', a: 'veg', n: ['Tomatoes', 'Tomato'], u: ['500 g', '500 g'], p: 4.5, was: 5.9, pic: [1, 0], key: 'tomato sayur veg', pop: 88 },
    { id: 'susu', a: 'dairy', n: ['Fresh milk', 'Susu segar'], u: ['1 litre', '1 liter'], p: 8.5, was: 0, pic: [1, 2], key: 'susu milk', pop: 85 },
    { id: 'minyak', a: 'pantry', n: ['Cooking oil', 'Minyak masak'], u: ['1 kg bottle', 'botol 1 kg'], p: 6.9, was: 0, pic: [3, 2], key: 'minyak oil', pop: 83 },
    { id: 'bawang', a: 'veg', n: ['Onions', 'Bawang besar'], u: ['1 kg', '1 kg'], p: 5.4, was: 0, pic: [0, 1], key: 'bawang onion', pop: 81 },
    { id: 'sawi', a: 'veg', n: ['Sawi', 'Sawi hijau'], u: ['one bunch', 'seikat'], p: 3.2, was: 0, pic: [2, 0], key: 'sawi sayur veg greens', pop: 76 },
    { id: 'cili', a: 'veg', n: ['Red chillies', 'Cili merah'], u: ['250 g', '250 g'], p: 6.8, was: 8.5, pic: [3, 0], key: 'cili chilli lada', pop: 70 },
    { id: 'kembung', a: 'meat', n: ['Ikan kembung, cleaned', 'Ikan kembung, siap siang'], u: ['500 g', '500 g'], p: 16.5, was: 19.9, pic: [2, 1], key: 'ikan fish kembung mackerel', pop: 67 },
    { id: 'udang', a: 'meat', n: ['White prawns', 'Udang putih'], u: ['400 g', '400 g'], p: 29.9, was: 0, pic: [3, 1], key: 'udang prawn', pop: 52 }
  ];
  var MEALS = [
    { n: ['Ayam masak merah for four', 'Ayam masak merah untuk empat orang'], items: ['ayam', 'tomato', 'cili', 'bawang', 'minyak'] },
    { n: ['Fried kembung, sawi and rice', 'Kembung goreng, sawi dan nasi'], items: ['kembung', 'sawi', 'beras', 'minyak'] },
    { n: ['Breakfast for the week', 'Sarapan untuk seminggu'], items: ['telur', 'susu', 'pisang'] }
  ];
  var SLOTS = [['Today, 4 pm to 6 pm', 'Hari ni, 4 hingga 6 petang', 1], ['Today, 6 pm to 8 pm', 'Hari ni, 6 petang hingga 8 malam', 1], ['Today, 7 pm to 9 pm', 'Hari ni, 7 hingga 9 malam', 0], ['Tomorrow, 9 am to 11 am', 'Esok, 9 hingga 11 pagi', 1], ['Tomorrow, 4 pm to 6 pm', 'Esok, 4 hingga 6 petang', 1]];
  var MIN = 60, FREE = 120, FEE = 8;
  function find(id) { return P.filter(function (p) { return p.id === id; })[0]; }
  function pic(p) { return 'style="background-position: ' + (p.pic[0] * 100 / 3) + '% ' + (p.pic[1] * 100 / 2) + '%"'; }

  var basket = {};
  try { basket = JSON.parse(store.get('sm-basket') || '{}') || {}; } catch (e) { basket = {}; }
  var aisle = 'all', step = 0, slot = 0, pay = 'fpx';
  var grid = document.getElementById('grid'), aisles = document.getElementById('aisles'), meals = document.getElementById('meals');
  var q = document.getElementById('q'), sort = document.getElementById('sort'), none = document.getElementById('none');
  var bar = document.getElementById('bar'), sheet = document.getElementById('sheet');
  var title = document.getElementById('sheet-title'), body = document.getElementById('sheet-body'), foot = document.getElementById('sheet-foot');

  function count() { return Object.keys(basket).reduce(function (a, k) { return a + basket[k]; }, 0); }
  function sub() { return Object.keys(basket).reduce(function (a, k) { return a + basket[k] * find(k).p; }, 0); }
  function fee() { return sub() >= FREE ? 0 : FEE; }

  function stepper(p) {
    var n = basket[p.id] || 0;
    if (!n) return '<button class="add" type="button" data-add="' + p.id + '">' + say('Add', 'Tambah') + '<span class="vh"> ' + p.n[lang === 'ms' ? 1 : 0] + '</span></button>';
    return '<span class="qty"><button type="button" data-less="' + p.id + '" aria-label="' + say('One less', 'Kurang satu') + '">&minus;</button><b aria-live="polite">' + n + '</b><button type="button" data-add="' + p.id + '" aria-label="' + say('One more', 'Tambah satu') + '">+</button></span>';
  }
  function drawGrid() {
    var word = q.value.trim().toLowerCase();
    var list = P.filter(function (p) { return (aisle === 'all' || p.a === aisle) && (!word || (p.key + ' ' + p.n.join(' ')).toLowerCase().indexOf(word) > -1); });
    if (sort.value === 'lo') list.sort(function (a, b) { return a.p - b.p; });
    else if (sort.value === 'hi') list.sort(function (a, b) { return b.p - a.p; });
    else list.sort(function (a, b) { return b.pop - a.pop; });
    grid.innerHTML = list.map(function (p) {
      return '<li class="item' + (basket[p.id] ? ' is-in' : '') + '"><span class="item__pic" ' + pic(p) + '>' + (p.was ? '<i>' + say('Save ', 'Jimat ') + rm(p.was - p.p) + '</i>' : '') + '</span>' +
        '<h3>' + say(p.n[0], p.n[1]) + '</h3><p>' + say(p.u[0], p.u[1]) + '</p>' +
        '<div class="item__end"><span><b>' + rm(p.p) + '</b>' + (p.was ? '<s>' + rm(p.was) + '</s>' : '') + '</span>' + stepper(p) + '</div></li>';
    }).join('');
    none.hidden = list.length > 0;
  }
  function drawAisles() {
    aisles.innerHTML = AISLES.map(function (a) { return '<button class="chip" type="button" data-aisle="' + a[0] + '" aria-pressed="' + (a[0] === aisle) + '">' + say(a[1], a[2]) + '</button>'; }).join('');
  }
  function drawMeals() {
    meals.innerHTML = MEALS.map(function (m, i) {
      var cost = m.items.reduce(function (a, id) { return a + find(id).p; }, 0);
      return '<li><button class="meal" type="button" data-meal="' + i + '"><span class="meal__pics">' + m.items.slice(0, 4).map(function (id) { return '<i ' + pic(find(id)) + '></i>'; }).join('') + '</span>' +
        '<b>' + say(m.n[0], m.n[1]) + '</b><span>' + m.items.map(function (id) { return say(find(id).n[0], find(id).n[1]); }).join(', ') + '</span>' +
        '<em>' + say('Add all ' + m.items.length + ', ', 'Tambah semua ' + m.items.length + ', ') + rm(cost) + '</em></button></li>';
    }).join('');
  }
  function drawBar() {
    var n = count(), s = sub();
    document.getElementById('top-total').textContent = rm(s);
    bar.hidden = n === 0;
    document.body.classList.toggle('has-bar', n > 0);
    document.getElementById('bar-total').textContent = rm(s);
    document.getElementById('bar-count').textContent = n + say(n === 1 ? ' item' : ' items', ' barang');
    document.getElementById('bar-free').textContent = s < MIN ? say(rm(MIN - s) + ' more to reach the RM60 minimum', rm(MIN - s) + ' lagi untuk cukup minimum RM60') : s < FREE ? say(rm(FREE - s) + ' more for free delivery', rm(FREE - s) + ' lagi untuk penghantaran percuma') : say('Delivery is free', 'Penghantaran percuma');
    document.getElementById('bar-meter').style.transform = 'scaleX(' + Math.min(1, s / FREE) + ')';
  }
  function keep() { store.set('sm-basket', JSON.stringify(basket)); drawGrid(); drawBar(); if (sheet.open) drawSheet(); }
  function change(id, by) { basket[id] = (basket[id] || 0) + by; if (basket[id] < 1) delete basket[id]; keep(); }

  function totals() {
    return '<p class="line"><span>' + say('Items', 'Barang') + '</span><span>' + rm(sub()) + '</span></p>' +
      '<p class="line"><span>' + say('Delivery', 'Penghantaran') + '</span><span>' + (fee() ? rm(fee()) : say('Free', 'Percuma')) + '</span></p>' +
      '<p class="line line--total"><span>' + say('Total', 'Jumlah') + '</span><span>' + rm(sub() + fee()) + '</span></p>';
  }
  function drawSheet() {
    title.textContent = [say('Your basket', 'Bakul anda'), say('Delivery time', 'Masa penghantaran'), say('Payment', 'Bayaran'), say('Order placed', 'Pesanan diterima')][step];
    var ids = Object.keys(basket);
    if (step === 0 && !ids.length) {
      body.innerHTML = '<p class="sheet__empty">' + say('Your basket is empty.', 'Bakul anda kosong.') + '</p>';
      foot.innerHTML = '<button class="btn btn--green btn--wide" type="button" data-sheet-close>' + say('Keep shopping', 'Sambung beli') + '</button>';
    } else if (step === 0) {
      body.innerHTML = ids.map(function (id) {
        var p = find(id);
        return '<div class="row"><span class="row__pic" ' + pic(p) + '></span><div><b>' + say(p.n[0], p.n[1]) + '</b><span>' + say(p.u[0], p.u[1]) + '</span></div><div class="row__end"><b>' + rm(p.p * basket[id]) + '</b>' + stepper(p) + '</div></div>';
      }).join('');
      var short = sub() < MIN;
      foot.innerHTML = totals() + (short ? '<p class="sheet__note">' + say('Add ' + rm(MIN - sub()) + ' more to reach the RM60 minimum.', 'Tambah ' + rm(MIN - sub()) + ' lagi untuk cukup minimum RM60.') + '</p>' : '') +
        '<button class="btn btn--green btn--wide" type="button" data-step="1"' + (short ? ' disabled' : '') + '>' + say('Choose a delivery time', 'Pilih masa penghantaran') + '</button>';
    } else if (step === 1) {
      body.innerHTML = '<fieldset class="pick"><legend>' + say('Two-hour slots', 'Slot dua jam') + '</legend>' + SLOTS.map(function (s, i) {
        return '<label><input type="radio" name="slot" value="' + i + '"' + (i === slot ? ' checked' : '') + (s[2] ? '' : ' disabled') + '><span>' + say(s[0], s[1]) + (s[2] ? '' : '<small>' + say('Full', 'Penuh') + '</small>') + '</span></label>';
      }).join('') + '</fieldset><p class="sheet__note">' + say('Delivering to 40170 Setia Alam, a sample address.', 'Dihantar ke 40170 Setia Alam, alamat contoh.') + '</p>';
      foot.innerHTML = totals() + '<button class="btn btn--green btn--wide" type="button" data-step="2">' + say('Continue to payment', 'Terus ke bayaran') + '</button><button class="btn btn--line btn--wide" type="button" data-step="0">' + say('Back to basket', 'Balik ke bakul') + '</button>';
    } else if (step === 2) {
      var ways = [['fpx', 'FPX online banking', 'FPX perbankan online'], ['card', 'Credit or debit card', 'Kad kredit atau debit'], ['wallet', 'e-Wallet', 'e-Wallet'], ['cash', 'Cash to the rider', 'Tunai kepada rider']];
      body.innerHTML = '<fieldset class="pick"><legend>' + say('How will you pay?', 'Nak bayar macam mana?') + '</legend>' + ways.map(function (w) {
        return '<label><input type="radio" name="pay" value="' + w[0] + '"' + (w[0] === pay ? ' checked' : '') + '><span>' + say(w[1], w[2]) + '</span></label>';
      }).join('') + '</fieldset><p class="sheet__note">' + say(SLOTS[slot][0], SLOTS[slot][1]) + '</p>';
      foot.innerHTML = totals() + '<button class="btn btn--green btn--wide" type="button" data-step="3">' + say('Place order, ', 'Hantar pesanan, ') + rm(sub() + fee()) + '</button><button class="btn btn--line btn--wide" type="button" data-step="1">' + say('Back', 'Balik') + '</button>';
    } else {
      body.innerHTML = '<div class="sheet__done"><h3>' + say('This is where the order goes through', 'Di sinilah pesanan diproses') + '</h3><p>' + say('No order was placed and no money was taken: this is a demo.', 'Tiada pesanan dibuat dan tiada duit diambil: ini demo.') + '</p>' +
        '<p class="sheet__note">' + say('On a real shop, this step takes the payment, sends the list to the packers, books the rider for the slot, and messages the buyer when the rider leaves.', 'Di kedai sebenar, langkah ni ambil bayaran, hantar senarai kepada pembungkus, tempah rider untuk slot tu, dan mesej pembeli bila rider bertolak.') + '</p></div>';
      foot.innerHTML = '<button class="btn btn--green btn--wide" type="button" data-done>' + say('Back to the shop', 'Balik ke kedai') + '</button>';
    }
  }

  function paint() {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-ms]').forEach(function (el) {
      if (el.dataset.en === undefined) el.dataset.en = el.textContent;
      el.textContent = lang === 'ms' ? el.dataset.ms : el.dataset.en;
    });
    var btn = document.getElementById('lang');
    btn.textContent = lang === 'ms' ? 'EN' : 'BM';
    btn.setAttribute('aria-label', lang === 'ms' ? 'Switch to English' : 'Tukar ke Bahasa Melayu');
    drawAisles(); drawGrid(); drawMeals(); drawBar();
    if (sheet.open) drawSheet();
  }
  document.getElementById('lang').addEventListener('click', function () { lang = lang === 'ms' ? 'en' : 'ms'; store.set('sm-lang', lang); paint(); });

  document.addEventListener('click', function (e) {
    var b = e.target.closest('button');
    document.querySelectorAll('details.wa[open]').forEach(function (d) { if (!d.contains(e.target)) d.removeAttribute('open'); });
    if (e.target === sheet) { sheet.close(); return; }
    if (!b) return;
    if (b.dataset.add) change(b.dataset.add, 1);
    else if (b.dataset.less) change(b.dataset.less, -1);
    else if (b.dataset.aisle) { aisle = b.dataset.aisle; drawAisles(); drawGrid(); }
    else if (b.dataset.meal) { MEALS[+b.dataset.meal].items.forEach(function (id) { basket[id] = (basket[id] || 0) + 1; }); keep(); b.classList.add('is-added'); }
    else if (b.hasAttribute('data-basket-open')) { step = 0; drawSheet(); if (!sheet.open) sheet.showModal(); }
    else if (b.hasAttribute('data-sheet-close')) sheet.close();
    else if (b.dataset.step) { step = +b.dataset.step; drawSheet(); body.scrollTop = 0; }
    else if (b.hasAttribute('data-done')) { basket = {}; step = 0; sheet.close(); keep(); }
  });
  sheet.addEventListener('change', function (e) {
    if (e.target.name === 'slot') slot = +e.target.value;
    if (e.target.name === 'pay') pay = e.target.value;
  });
  q.addEventListener('input', drawGrid);
  sort.addEventListener('change', drawGrid);

  // Postcode check: a sample rule (Klang Valley postcodes start with 4, 5 or 6).
  document.getElementById('check').addEventListener('submit', function (e) {
    e.preventDefault();
    var v = document.getElementById('postcode').value.trim();
    var out = document.getElementById('check-say');
    if (!/^\d{5}$/.test(v)) { out.textContent = say('Type the five numbers of your postcode.', 'Taip lima nombor poskod anda.'); out.className = 'check__say'; return; }
    var ok = /^(4[0-9]|5[0-9]|6[0-8])/.test(v);
    out.textContent = ok ? say('Yes. We deliver to ' + v + ' today if you order before 2 pm.', 'Ya. Kami hantar ke ' + v + ' hari ni kalau order sebelum 2 petang.') : say('Not yet. We do not deliver to ' + v + '.', 'Belum lagi. Kami belum hantar ke ' + v + '.');
    out.className = 'check__say ' + (ok ? 'is-yes' : 'is-no');
  });

  paint();
})();

(function () {
  // Two languages. English is in the page; the Malay line rides on data-ms.
  // The choice travels in the address (?lang=ms) so it survives a browser that blocks storage.
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var lang = /[?&]lang=ms\b/.test(location.search) ? 'ms' : 'en';
  if (lang === 'en' && store.get('kb-lang') === 'ms') lang = 'ms';
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
      store.set('kb-lang', lang);
      paint();
      if (dialog && dialog.open) draw();
    });
  }
  if (lang === 'ms') paint();

  // The cart. It is kept in this browser only, so it follows the visitor from page to page.
  var cart = [];
  try { cart = JSON.parse(store.get('kb-cart') || '[]') || []; } catch (e) { cart = []; }
  var dialog = document.getElementById('cart');
  var title = document.getElementById('cart-title');
  var body = document.getElementById('cart-body');
  var foot = document.getElementById('cart-foot');
  var count = document.getElementById('cart-count');
  var step = 0;
  var pay = 'fpx';
  var who = { name: 'Aisyah Kamaruddin', tel: '012-555 0142', addr: '12, Jalan Contoh 4', post: '40170', city: 'Shah Alam', state: 'Selangor' };
  var FREE = 150;
  function rm(n) { return 'RM' + n; }
  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;'); }
  function sub() { return cart.reduce(function (a, c) { return a + c.price * c.q; }, 0); }
  function ship() { return !cart.length || sub() >= FREE ? 0 : 10; }
  function total() { return sub() + ship() + (pay === 'cod' ? 5 : 0); }
  function keep() {
    store.set('kb-cart', JSON.stringify(cart));
    if (count) count.textContent = cart.reduce(function (a, c) { return a + c.q; }, 0);
  }
  function lines() {
    return '<p class="line"><span>' + say('Subtotal', 'Jumlah kecil') + '</span><span>' + rm(sub()) + '</span></p>' +
      '<p class="line"><span>' + say('Delivery', 'Penghantaran') + '</span><span>' + (ship() ? rm(ship()) : say('Free', 'Percuma')) + '</span></p>' +
      (pay === 'cod' && step === 2 ? '<p class="line"><span>' + say('Cash on delivery fee', 'Caj bayar masa terima') + '</span><span>' + rm(5) + '</span></p>' : '') +
      '<p class="line line--total"><span>' + say('Total', 'Jumlah') + '</span><span>' + rm(step === 2 ? total() : sub() + ship()) + '</span></p>';
  }
  function field(id, en, ms, value, extra) {
    return '<div><label for="k-' + id + '">' + say(en, ms) + '</label><input id="k-' + id + '" data-who="' + id + '" value="' + esc(value) + '"' + (extra || '') + '></div>';
  }
  function draw() {
    title.textContent = [say('Your cart', 'Troli anda'), say('Delivery details', 'Maklumat penghantaran'), say('Payment', 'Bayaran'), say('Order placed', 'Pesanan diterima')][step];
    if (step === 0 && !cart.length) {
      body.innerHTML = '<p class="cart__empty">' + say('Your cart is empty.', 'Troli anda kosong.') + '</p>';
      foot.innerHTML = '<a class="btn btn--main btn--wide" href="shop.html' + (lang === 'ms' ? '?lang=ms' : '') + '">' + say('Go to the shop', 'Pergi ke kedai') + '</a>';
      return;
    }
    if (step === 0) {
      var left = FREE - sub();
      body.innerHTML = '<p class="cart__ship">' + (left > 0 ? say('Add ' + rm(left) + ' more for free delivery.', 'Tambah ' + rm(left) + ' lagi untuk penghantaran percuma.') : say('Delivery is free for this order.', 'Penghantaran percuma untuk pesanan ni.')) + '</p>' +
        cart.map(function (c, i) {
          return '<div class="item"><img src="img/' + esc(c.slug) + '.jpg" alt="" width="72" height="90"><div><b>' + esc(c.name) + '</b><span>' + say('Size', 'Saiz') + ' ' + esc(c.size === 'One size' ? say('One size', 'Satu saiz') : c.size) + '</span><br>' +
            '<span class="qty"><button type="button" data-q="-1" data-i="' + i + '" aria-label="' + say('One less', 'Kurang satu') + '">&minus;</button><b>' + c.q + '</b><button type="button" data-q="1" data-i="' + i + '" aria-label="' + say('One more', 'Tambah satu') + '">+</button></span></div>' +
            '<div class="item__end"><b>' + rm(c.price * c.q) + '</b><button type="button" class="link" data-rm="' + i + '">' + say('Remove', 'Buang') + '</button></div></div>';
        }).join('');
      foot.innerHTML = lines() + '<button type="button" class="btn btn--main btn--wide" data-step="1">' + say('Checkout', 'Teruskan bayar') + '</button>';
    } else if (step === 1) {
      body.innerHTML = '<p class="cart__steps">' + say('Step 1 of 2. Sample details are filled in for you.', 'Langkah 1 daripada 2. Maklumat contoh dah diisi.') + '</p>' +
        field('name', 'Full name', 'Nama penuh', who.name, ' autocomplete="name"') +
        field('tel', 'Phone', 'Telefon', who.tel, ' inputmode="tel" autocomplete="tel"') +
        field('addr', 'Address', 'Alamat', who.addr, ' autocomplete="street-address"') +
        '<div class="cart__two">' + field('post', 'Postcode', 'Poskod', who.post, ' inputmode="numeric" autocomplete="postal-code"') + field('city', 'City', 'Bandar', who.city, ' autocomplete="address-level2"') + '</div>' +
        '<div><label for="k-state">' + say('State', 'Negeri') + '</label><select id="k-state" data-who="state">' + ['Selangor', 'Kuala Lumpur', 'Johor', 'Pulau Pinang', 'Perak', 'Pahang', 'Kelantan', 'Terengganu', 'Sabah', 'Sarawak'].map(function (s) { return '<option' + (s === who.state ? ' selected' : '') + '>' + s + '</option>'; }).join('') + '</select></div>';
      foot.innerHTML = lines() + '<button type="button" class="btn btn--main btn--wide" data-step="2">' + say('Continue to payment', 'Terus ke bayaran') + '</button><button type="button" class="btn btn--line btn--wide" data-step="0">' + say('Back to cart', 'Balik ke troli') + '</button>';
    } else if (step === 2) {
      var ways = [['fpx', 'FPX online banking', 'FPX perbankan online', 'Pay straight from your bank account', 'Bayar terus dari akaun bank'], ['card', 'Credit or debit card', 'Kad kredit atau debit', 'Visa, Mastercard', 'Visa, Mastercard'], ['wallet', 'e-Wallet', 'e-Wallet', 'Touch \'n Go, GrabPay', 'Touch \'n Go, GrabPay'], ['cod', 'Cash on delivery', 'Bayar masa terima', 'Klang Valley only, RM5 fee', 'Lembah Klang sahaja, caj RM5']];
      body.innerHTML = '<p class="cart__steps">' + say('Step 2 of 2', 'Langkah 2 daripada 2') + '</p><div class="pay">' + ways.map(function (w) {
        return '<label><input type="radio" name="pay" value="' + w[0] + '"' + (pay === w[0] ? ' checked' : '') + '><span><b>' + say(w[1], w[2]) + '</b><small>' + say(w[3], w[4]) + '</small></span></label>';
      }).join('') + '</div>';
      foot.innerHTML = lines() + '<button type="button" class="btn btn--main btn--wide" data-step="3">' + say('Pay ', 'Bayar ') + rm(total()) + '</button><button type="button" class="btn btn--line btn--wide" data-step="1">' + say('Back', 'Balik') + '</button>';
    } else {
      body.innerHTML = '<div class="cart__done"><h3>' + say('This is where the order is confirmed', 'Di sinilah pesanan disahkan') + '</h3><p>' + say('No order was placed and no money was taken: this is a demo.', 'Tiada pesanan dibuat dan tiada duit diambil: ini demo.') + '</p>' +
        '<p class="cart__why">' + say('On a real shop, this step sends the buyer to the bank to pay, holds the stock once the payment clears, emails the receipt, and prints the courier label for you.', 'Di kedai sebenar, langkah ni bawa pembeli ke bank untuk bayar, pegang stok bila bayaran lepas, emel resit, dan cetak label kurier untuk anda.') + '</p></div>';
      foot.innerHTML = '<button type="button" class="btn btn--main btn--wide" data-done>' + say('Back to the shop', 'Balik ke kedai') + '</button>';
    }
  }
  function open(at) {
    if (!dialog) return;
    step = at || 0;
    draw();
    if (!dialog.open) dialog.showModal();
  }
  if (dialog) {
    keep();
    document.querySelectorAll('[data-cart-open]').forEach(function (b) { b.addEventListener('click', function () { open(0); }); });
    dialog.addEventListener('click', function (e) {
      var b = e.target.closest('button');
      if (e.target === dialog || (b && b.hasAttribute('data-cart-close'))) { dialog.close(); return; }
      if (!b) return;
      if (b.dataset.q) {
        var c = cart[+b.dataset.i];
        c.q += +b.dataset.q;
        if (c.q < 1) cart.splice(+b.dataset.i, 1);
      } else if (b.dataset.rm) {
        cart.splice(+b.dataset.rm, 1);
      } else if (b.dataset.step) {
        step = +b.dataset.step;
      } else if (b.hasAttribute('data-done')) {
        cart = [];
        step = 0;
        keep();
        dialog.close();
        return;
      } else return;
      keep();
      draw();
      body.scrollTop = 0;
    });
    dialog.addEventListener('change', function (e) {
      if (e.target.name === 'pay') { pay = e.target.value; draw(); dialog.querySelector('input[name="pay"]:checked').focus(); }
      if (e.target.dataset.who) who[e.target.dataset.who] = e.target.value;
    });
  }

  // Product page: the size picker and the add button.
  document.querySelectorAll('form[data-add]').forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var size = (form.querySelector('input[name="size"]:checked') || {}).value;
      if (!size) return;
      var d = form.dataset;
      var same = cart.filter(function (c) { return c.slug === d.slug && c.size === size; })[0];
      if (same) same.q += 1;
      else cart.push({ slug: d.slug, name: d.name, price: +d.price, size: size, q: 1 });
      keep();
      open(0);
    });
  });

  // Shop page: category chips and the sort box. ?cat=men opens with a category already chosen.
  var grid = document.getElementById('grid');
  var chips = document.querySelectorAll('.chip');
  var sort = document.getElementById('sort');
  if (grid) {
    var cat = (/[?&]cat=(men|women|acc)\b/.exec(location.search) || [])[1] || 'all';
    var show = function () {
      var cards = Array.prototype.slice.call(grid.children);
      var how = sort.value;
      cards.sort(function (a, b) {
        if (how === 'lo') return a.dataset.price - b.dataset.price;
        if (how === 'hi') return b.dataset.price - a.dataset.price;
        if (how === 'new') return (b.dataset.new - a.dataset.new) || (a.dataset.i - b.dataset.i);
        return a.dataset.i - b.dataset.i;
      });
      cards.forEach(function (c) { c.hidden = cat !== 'all' && c.dataset.cat !== cat; grid.appendChild(c); });
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.cat === cat)); });
    };
    chips.forEach(function (c) { c.addEventListener('click', function () { cat = c.dataset.cat; show(); }); });
    sort.addEventListener('change', show);
    show();
  }

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

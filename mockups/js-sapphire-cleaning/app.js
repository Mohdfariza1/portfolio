(function () {
  var store = {
    get: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };
  var lang = /[?&]lang=en\b/.test(location.search) || store.get('js-lang') === 'en' ? 'en' : 'ms';
  function say(ms, en) { return lang === 'en' ? en : ms; }

  // rate = square feet one person covers in an hour (sample figures for the demo, not a price list).
  var KINDS = [
    { id: 'pejabat', n: ['Pejabat', 'Office'], full: ['Pembersihan pejabat', 'Office cleaning'], rate: 2500, inc: [['Permukaan dan perabot', 'Surfaces and furniture'], ['Vakum karpet dan lantai', 'Vacuuming carpets and floors'], ['Cermin dan tingkap dalaman', 'Mirrors and inside windows'], ['Tandas dan pantri', 'Toilets and pantry'], ['Tong sampah', 'Bins']] },
    { id: 'kilang', n: ['Kilang', 'Factory'], full: ['Pembersihan kilang', 'Factory cleaning'], rate: 3500, inc: [['Lantai pengeluaran', 'Production floors'], ['Sekitar mesin dan jentera', 'Around machines'], ['Gudang dan laluan', 'Warehouse and walkways'], ['Ikut prosedur keselamatan tapak', 'Following the site safety rules']] },
    { id: 'klinik', n: ['Klinik atau hospital', 'Clinic or hospital'], full: ['Pembersihan klinik dan hospital', 'Clinic and hospital cleaning'], rate: 1500, inc: [['Sanitasi bilik rawatan', 'Sanitising treatment rooms'], ['Ruang menunggu dan kaunter', 'Waiting area and counters'], ['Tandas', 'Toilets'], ['Kain dan alat diasingkan ikut zon', 'Cloths and tools kept apart by zone']] },
    { id: 'dapur', n: ['Dapur komersial', 'Commercial kitchen'], full: ['Pembersihan dapur komersial', 'Commercial kitchen cleaning'], rate: 800, inc: [['Ekzos dan pengudaraan', 'Exhaust and ventilation'], ['Buang gris pada peralatan memasak', 'Degreasing cooking equipment'], ['Sanitasi permukaan penyediaan makanan', 'Sanitising food preparation surfaces'], ['Lantai dan longkang', 'Floors and drains']] },
    { id: 'baru', n: ['Lepas renovation', 'After renovation'], full: ['Pembersihan lepas pembinaan', 'Post-construction cleaning'], rate: 600, inc: [['Buang habuk dan serpihan', 'Removing dust and debris'], ['Kesan cat dan simen', 'Paint and cement marks'], ['Tingkap dan bingkai', 'Windows and frames'], ['Premis siap untuk digunakan', 'Premises ready to move into']] },
    { id: 'sanitasi', n: ['Sanitasi', 'Sanitising'], full: ['Sanitasi dan disinfeksi', 'Sanitising and disinfection'], rate: 4000, inc: [['Semburan disinfeksi menyeluruh', 'Full disinfection spray'], ['Permukaan yang kerap disentuh', 'High-touch surfaces'], ['Bahan yang diluluskan', 'Approved products']] },
    { id: 'lantai', n: ['Rawatan lantai', 'Floor care'], full: ['Rawatan dan pemulihan lantai', 'Floor care and restoration'], rate: 700, inc: [['Polishing dan scrubbing', 'Polishing and scrubbing'], ['Waxing', 'Waxing'], ['Marmar, granit, epoxy dan jubin', 'Marble, granite, epoxy and tiles']] },
    { id: 'tinggi', n: ['Bangunan tinggi', 'High-rise'], full: ['Pembersihan bangunan tinggi', 'High-rise cleaning'], rate: 900, inc: [['Tingkap luar', 'Outside windows'], ['Fasad bangunan', 'Building facade'], ['Peralatan dan teknik keselamatan', 'Safety equipment and methods']] }
  ];
  var OFTEN = [
    { id: 'sekali', n: ['Sekali sahaja', 'Once only'], visits: 1, per: 0 },
    { id: 'minggu', n: ['Seminggu sekali', 'Once a week'], visits: 4, per: 1 },
    { id: 'tiga', n: ['Tiga kali seminggu', 'Three times a week'], visits: 13, per: 1 },
    { id: 'hari', n: ['Setiap hari bekerja', 'Every working day'], visits: 22, per: 1 }
  ];
  var SIZES = [500, 1000, 1500, 2500, 5000, 7500, 10000, 15000, 20000, 30000, 40000, 50000, 75000];
  var st = { kind: 'pejabat', often: 'hari' };
  var size = document.getElementById('size');
  function kind() { return KINDS.filter(function (k) { return k.id === st.kind; })[0]; }
  function often() { return OFTEN.filter(function (o) { return o.id === st.often; })[0]; }
  function num(n) { return n.toLocaleString('en-MY'); }
  function sum() {
    var hours = SIZES[+size.value] / kind().rate;
    var people = Math.max(1, Math.min(12, Math.ceil(hours / 4)));
    var each = Math.max(1, Math.round(hours / people * 2) / 2);
    return { people: people, each: each };
  }

  function draw() {
    document.getElementById('kinds').innerHTML = KINDS.map(function (k) { return '<label class="pick"><input type="radio" name="kind" value="' + k.id + '"' + (k.id === st.kind ? ' checked' : '') + '><span>' + say(k.n[0], k.n[1]) + '</span></label>'; }).join('');
    document.getElementById('often').innerHTML = OFTEN.map(function (o) { return '<label class="pick"><input type="radio" name="often" value="' + o.id + '"' + (o.id === st.often ? ' checked' : '') + '><span>' + say(o.n[0], o.n[1]) + '</span></label>'; }).join('');
    document.getElementById('size-out').textContent = num(SIZES[+size.value]) + say(' kaki persegi', ' square feet');
    size.style.setProperty('--fill', (+size.value / 12 * 100) + '%');
    var s = sum(), o = often();
    document.getElementById('n-people').textContent = s.people;
    document.getElementById('n-people-word').textContent = say('orang', s.people === 1 ? 'person' : 'people');
    document.getElementById('n-hours').textContent = String(s.each).replace('.5', say(',5', '.5'));
    document.getElementById('n-visits').textContent = o.visits;
    document.getElementById('n-visits-word').textContent = o.per ? say('lawatan sebulan', 'visits a month') : say('lawatan', 'visit');
    document.getElementById('plan-inc').textContent = say('Termasuk: ', 'Includes: ') + kind().inc.map(function (i) { return say(i[0], i[1]).toLowerCase(); }).join(', ') + '.';
    document.getElementById('list').innerHTML = KINDS.map(function (k, i) {
      return '<details' + (k.id === st.kind ? ' open' : '') + '><summary><b>0' + (i + 1) + '</b><span>' + say(k.full[0], k.full[1]) + '</span></summary><ul>' + k.inc.map(function (x) { return '<li>' + say(x[0], x[1]) + '</li>'; }).join('') + '</ul><button class="link" type="button" data-plan="' + k.id + '">' + say('Rancang servis ni', 'Plan this service') + '</button></details>';
    }).join('');
  }

  document.getElementById('plan').addEventListener('change', function (e) {
    if (e.target.name === 'kind') st.kind = e.target.value;
    else if (e.target.name === 'often') st.often = e.target.value;
    else return;
    draw();
    var keep = document.querySelector('[name="' + e.target.name + '"][value="' + e.target.value + '"]');
    if (keep) keep.focus();
  });
  size.addEventListener('input', draw);

  // Before and after: the range input moves the line.
  var ba = document.getElementById('ba'), range = document.getElementById('ba-range');
  range.addEventListener('input', function () { ba.style.setProperty('--pos', range.value + '%'); });
  ba.querySelectorAll('img').forEach(function (img) { img.addEventListener('error', function () { document.getElementById('hasil').hidden = true; }); });

  var ask = document.getElementById('ask');
  document.addEventListener('click', function (e) {
    document.querySelectorAll('details.wa[open]').forEach(function (d) { if (!d.contains(e.target)) d.removeAttribute('open'); });
    if (e.target === ask) { ask.close(); return; }
    var b = e.target.closest('button');
    if (!b) return;
    if (b.dataset.plan) {
      st.kind = b.dataset.plan; draw();
      document.getElementById('plan').scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
    } else if (b.hasAttribute('data-ask-close')) ask.close();
  });
  document.getElementById('plan').addEventListener('submit', function (e) {
    e.preventDefault();
    var s = sum(), o = often();
    document.getElementById('ask-sum').textContent = say(kind().full[0], kind().full[1]) + ', ' + num(SIZES[+size.value]) + say(' kaki persegi, ', ' square feet, ') + say(o.n[0], o.n[1]).toLowerCase() + '. ' + s.people + say(' orang, ', s.people === 1 ? ' person, ' : ' people, ') + s.each + say(' jam setiap lawatan.', ' hours a visit.');
    document.getElementById('ask-say').textContent = '';
    ask.showModal();
  });
  document.getElementById('ask-form').addEventListener('submit', function (e) {
    e.preventDefault();
    var bad = null;
    this.querySelectorAll('[required]').forEach(function (i) { var ok = i.value.trim() !== ''; i.toggleAttribute('aria-invalid', !ok); if (!ok && !bad) bad = i; });
    document.getElementById('ask-say').textContent = bad ? say('Isi ketiga-tiga supaya kami boleh hubungi anda.', 'Fill in all three so we can reach you.') : say('Tiada apa dihantar: ini demo. Di website sebenar, permintaan ni sampai ke pasukan jualan dengan semua butiran di atas.', 'Nothing was sent: this is a demo. On a real site this request reaches the sales team with all the details above.');
    if (bad) bad.focus();
  });

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
    var btn = document.getElementById('lang');
    btn.textContent = lang === 'en' ? 'BM' : 'EN';
    btn.setAttribute('aria-label', lang === 'en' ? 'Tukar ke Bahasa Melayu' : 'Switch to English');
    draw();
  }
  document.getElementById('lang').addEventListener('click', function () { lang = lang === 'en' ? 'ms' : 'en'; store.set('js-lang', lang); paint(); });
  paint();
})();

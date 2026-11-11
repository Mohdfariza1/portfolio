const S = {
  units: [], byCode: {}, taken: {}, today: '',
  checkIn: '', checkOut: '', adults: 2, kids: 0, unit: '',
  station: 1, calMonth: '', calMsg: '', gallery: 0, last: null
};
const view = document.getElementById('view');
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

// ---------- helpers ----------
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const D = s => new Date(s + 'T00:00:00Z');
const iso = d => d.toISOString().slice(0, 10);
const addDays = (s, n) => { const d = D(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
const nightsOf = (a, b) => Math.round((D(b) - D(a)) / 86400000);
const fmtDay = s => { const d = D(s); return `${DOW[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()].slice(0, 3)}`; };
const rm = n => 'RM' + Number(n).toLocaleString('en-MY');
const isWeekend = s => { const w = D(s).getUTCDay(); return w === 5 || w === 6; };
const img = (src, alt, sizes = '100vw', lazy = true) =>
  `<img src="photos/${src}-800.jpg" srcset="photos/${src}-800.jpg 800w, photos/${src}.jpg 1600w" sizes="${sizes}" alt="${esc(alt)}"${lazy ? ' loading="lazy"' : ''} decoding="async">`;

function save() {
  try { sessionStorage.setItem('ts-search', JSON.stringify({ checkIn: S.checkIn, checkOut: S.checkOut, adults: S.adults, kids: S.kids, unit: S.unit, last: S.last })); } catch {}
}
function restore() {
  try { Object.assign(S, JSON.parse(sessionStorage.getItem('ts-search') || '{}')); } catch {}
  if (S.checkIn && S.checkIn < S.today) { S.checkIn = ''; S.checkOut = ''; }
}

function nightsFree(code, a, b) {
  const t = S.taken[code] || [];
  for (let d = a; d < b; d = addDays(d, 1)) if (t.includes(d)) return false;
  return true;
}
function anyFree(d) { return S.units.some(u => !(S.taken[u.code] || []).includes(d)); }
function nightTaken(code, d) { return code ? (S.taken[code] || []).includes(d) : !anyFree(d); }

function estimate(u, a, b) {
  const n = nightsOf(a, b); let wd = 0, we = 0;
  for (let i = 0; i < n; i++) (isWeekend(addDays(a, i)) ? we++ : wd++);
  const lines = [];
  if (wd) lines.push([`${wd} weekday night${wd > 1 ? 's' : ''} × ${rm(u.priceWeekday)}`, wd * u.priceWeekday]);
  if (we) lines.push([`${we} weekend night${we > 1 ? 's' : ''} × ${rm(u.priceWeekend)}`, we * u.priceWeekend]);
  lines.push(['Cleaning', u.cleaningFee]);
  const total = lines.reduce((s, l) => s + l[1], 0);
  return { n, we, lines, total, deposit: Math.ceil(total * 0.3) };
}

// '' when this unit works for the current search, otherwise the reason
function fit(code) {
  const u = S.byCode[code];
  if (!S.checkIn || !S.checkOut) return 'nodates';
  if (!nightsFree(code, S.checkIn, S.checkOut)) return 'Taken on some of your nights';
  if (S.adults + S.kids > u.sleeps) return `Sleeps ${u.sleeps}, you are ${S.adults + S.kids}`;
  const e = estimate(u, S.checkIn, S.checkOut);
  if (e.we && e.n < u.minNightsWeekend) return `Weekends need ${u.minNightsWeekend} nights`;
  return '';
}

function guestsLine() { return `${S.adults} adult${S.adults > 1 ? 's' : ''}${S.kids ? `, ${S.kids} kid${S.kids > 1 ? 's' : ''}` : ''}`; }
function datesLine() { return S.checkIn && S.checkOut ? `${fmtDay(S.checkIn)} – ${fmtDay(S.checkOut)} · ${nightsOf(S.checkIn, S.checkOut)} night${nightsOf(S.checkIn, S.checkOut) > 1 ? 's' : ''}` : ''; }

function stepper(name, label, val, min, max) {
  return `<label class="field"><span>${label}</span><div class="stepper" data-step="${name}">
    <button type="button" data-d="-1" aria-label="Fewer ${label.toLowerCase()}" ${val <= min ? 'disabled' : ''}>${icon('minus')}</button>
    <output aria-live="polite">${val}</output>
    <button type="button" data-d="1" aria-label="More ${label.toLowerCase()}" ${val >= max ? 'disabled' : ''}>${icon('plus')}</button></div></label>`;
}
function bindSteppers(root, after) {
  root.querySelectorAll('[data-step]').forEach(st => st.addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    const k = st.dataset.step;
    const lim = k === 'adults' ? [1, 10] : [0, 8];
    S[k] = Math.min(lim[1], Math.max(lim[0], S[k] + Number(b.dataset.d)));
    st.querySelector('output').textContent = S[k];
    st.querySelector('[data-d="-1"]').disabled = S[k] <= lim[0];
    st.querySelector('[data-d="1"]').disabled = S[k] >= lim[1];
    save(); if (after) after();
  }));
}

// ---------- home ----------
function stampFor(code) {
  const f = fit(code);
  if (f === 'nodates') return '';
  if (f) return `<p class="stamp stamp--taken">${icon('calendar')}${esc(f)}</p>`;
  const e = estimate(S.byCode[code], S.checkIn, S.checkOut);
  return `<p class="stamp stamp--free">${icon('check')}Free for your dates · <span class="num">${rm(e.total)}</span> total</p>`;
}

function unitBlock(u) {
  const show = u.amenities.slice(0, 6);
  return `<article class="unit" id="unit-${u.code}">
    <div class="unit__photos">
      <div class="mosaic">
        ${u.photos.slice(0, 3).map((p, i) => `<button type="button" data-lb="${u.code}" data-i="${i}" aria-label="Open photo: ${esc(p.cap)}">${img(p.src, p.cap, i ? '(min-width: 960px) 260px, 33vw' : '(min-width: 960px) 520px, 66vw')}</button>`).join('')}
      </div>
      <button type="button" class="allphotos" data-lb="${u.code}" data-i="0">${icon('expand')}See all ${u.photos.length} photos</button>
    </div>
    <div class="unit__info">
      <div class="unit__head"><span class="letter" aria-hidden="true">${u.code}</span><h3>${esc(u.name)}</h3></div>
      <p class="unit__tag">${esc(u.tagline)}</p>
      <ul class="facts">
        <li>${icon('users')}<b>${u.sleeps}</b><span>guests</span></li>
        <li>${icon('bed')}<b>${u.bedrooms}</b><span>bedroom${u.bedrooms > 1 ? 's' : ''}</span></li>
        <li>${icon('bath')}<b>${u.bathrooms}</b><span>bathroom${u.bathrooms > 1 ? 's' : ''}</span></li>
        <li>${icon('size')}<b>${u.sizeSqft.toLocaleString('en-MY')}</b><span>sq ft</span></li>
      </ul>
      <ul class="amen">${show.map(a => `<li>${icon(a)}${AMENITY[a]}</li>`).join('')}</ul>
      <div class="avail" data-code="${u.code}">${stampFor(u.code)}</div>
      <div class="unit__foot">
        <p class="price"><b>${rm(u.priceWeekday)}</b> <span>/ night weekdays · ${rm(u.priceWeekend)} Fri & Sat</span></p>
        <div class="unit__btns">
          <a class="btn btn--line" href="#/unit/${u.code}">Photos & details</a>
          <a class="btn btn--go" href="#/book" data-book="${u.code}">Book ${u.code}</a>
        </div>
      </div>
    </div>
  </article>`;
}

function renderHome(scrollTo) {
  const minOut = S.checkIn ? addDays(S.checkIn, 1) : addDays(S.today, 1);
  view.innerHTML = `
  <section class="hero">
    <div class="wrap">
      <figure class="hero__photo frame"><button type="button" data-lb="hero" data-i="0" aria-label="Open photo">${img('hero-pool', 'Pool deck facing the Janda Baik hills', '(min-width: 1240px) 1192px, 100vw', false)}</button></figure>
      <div class="hero__cap"><span>The pool garden, with the hills behind</span><span>Tap any photo to see it full size</span></div>
      <div class="hero__row">
        <div>
          <h1>Three homes by the river in Janda Baik</h1>
          <p class="hero__lead">A timber family house with its own pool, a chalet on the river, or a quiet studio on the hill. 45 minutes from KL.</p>
        </div>
        <form class="finder" id="finder" novalidate>
          <label class="field"><span>Check-in</span><input type="date" name="in" min="${S.today}" max="${addDays(S.today, 365)}" value="${S.checkIn}" required></label>
          <label class="field"><span>Check-out</span><input type="date" name="out" min="${minOut}" max="${addDays(S.today, 366)}" value="${S.checkOut}" required></label>
          <div class="guests">
            ${stepper('adults', 'Adults', S.adults, 1, 10)}
            ${stepper('kids', 'Kids', S.kids, 0, 8)}
            <button class="btn btn--go" type="submit">See free homes ${icon('arrow')}</button>
          </div>
        </form>
      </div>
    </div>
  </section>
  <div class="band" aria-hidden="true"></div>
  <section class="units" id="units">
    <div class="wrap">
      <div class="sec-head">
        <h2>Pick your home</h2>
        <p class="for-dates" id="forDates">${S.checkIn && S.checkOut ? `Showing <b>${datesLine()}</b> for ${guestsLine()}` : 'Choose dates above to see what is free'}</p>
      </div>
      ${S.units.map(unitBlock).join('')}
    </div>
  </section>
  <section class="info kawung" id="info">
    <div class="wrap">
      <div class="info__in">
        <div><h2>Good to know</h2><p>Pay 30% to hold your dates. The rest is paid on arrival, cash or DuitNow QR.</p></div>
        <ul class="rules">
          <li>${icon('clock')}<div><b>Check-in 3 pm</b><span>Self check-in code sent on the day</span></div></li>
          <li>${icon('door')}<div><b>Check-out 12 pm</b><span>Late check-out on request</span></div></li>
          <li>${icon('money')}<div><b>30% deposit</b><span>Full refund up to 7 days before</span></div></li>
          <li>${icon('nosmoke')}<div><b>No smoking inside</b><span>Smoking corner by the car park</span></div></li>
          <li>${icon('quiet')}<div><b>Quiet after 11 pm</b><span>Neighbours are close by</span></div></li>
          <li>${icon('surau')}<div><b>Surau 300 m away</b><span>Prayer mat and qibla in every home</span></div></li>
        </ul>
      </div>
    </div>
  </section>
  <section class="around" id="around">
    <div class="wrap">
      <div class="sec-head"><h2>Around Janda Baik</h2><p class="demo-note">Travel times are approximate</p></div>
      <div class="around__grid">
        <figure class="place">${img('near-waterfall', 'River pools with small waterfalls', '(min-width: 960px) 480px, 100vw')}<figcaption><b>River pools</b><span>${icon('walk')}3 min walk</span></figcaption></figure>
        <figure class="place">${img('near-forest', 'Forest trail through tall trees', '(min-width: 960px) 360px, 100vw')}<figcaption><b>Forest trails</b><span>${icon('car')}10 min drive</span></figcaption></figure>
        <figure class="place">${img('near-resort', 'Kampung cafes and food stalls', '(min-width: 960px) 360px, 100vw')}<figcaption><b>Cafes and food</b><span>${icon('car')}5 min drive</span></figcaption></figure>
      </div>
    </div>
  </section>`;

  const f = document.getElementById('finder');
  const inEl = f.elements.in, outEl = f.elements.out;
  inEl.addEventListener('change', () => {
    S.checkIn = inEl.value;
    outEl.min = S.checkIn ? addDays(S.checkIn, 1) : addDays(S.today, 1);
    if (S.checkIn && (!outEl.value || outEl.value <= S.checkIn)) { outEl.value = addDays(S.checkIn, isWeekend(S.checkIn) ? 2 : 1); }
    S.checkOut = outEl.value; save();
  });
  outEl.addEventListener('change', () => { S.checkOut = outEl.value; save(); });
  bindSteppers(f);
  f.addEventListener('submit', e => {
    e.preventDefault();
    S.checkIn = inEl.value; S.checkOut = outEl.value;
    if (!S.checkIn) { inEl.focus(); inEl.showPicker?.(); return; }
    if (!S.checkOut || S.checkOut <= S.checkIn) { S.checkOut = addDays(S.checkIn, 1); outEl.value = S.checkOut; }
    save();
    refreshStamps(true);
    document.getElementById('units').scrollIntoView({ behavior: 'smooth' });
  });
  if (scrollTo) requestAnimationFrame(() => document.getElementById(scrollTo)?.scrollIntoView());
}

function refreshStamps(press) {
  const fd = document.getElementById('forDates');
  if (fd) fd.innerHTML = S.checkIn && S.checkOut ? `Showing <b>${datesLine()}</b> for ${guestsLine()}` : 'Choose dates above to see what is free';
  document.querySelectorAll('.avail').forEach((el, i) => {
    el.innerHTML = stampFor(el.dataset.code);
    const st = el.firstElementChild;
    if (press && st) { st.style.animationDelay = `${i * 110}ms`; st.classList.add('press'); }
  });
}

// ---------- calendar ----------
function calHTML(code, count) {
  if (!S.calMonth) S.calMonth = (S.checkIn || S.today).slice(0, 7) + '-01';
  const firstAllowed = S.today.slice(0, 7) + '-01';
  const lastAllowed = addDays(S.today, 365);
  let html = `<div class="cal" data-cal="${code}">
    <div class="cal__nav"><button type="button" data-cm="-1" aria-label="Previous month" ${S.calMonth <= firstAllowed ? 'disabled' : ''}>${icon('left')}</button>
    <b>${datesLine() || (S.checkIn ? `Check-in ${fmtDay(S.checkIn)} · now pick check-out` : 'Pick check-in, then check-out')}</b>
    <button type="button" data-cm="1" aria-label="Next month" ${S.calMonth.slice(0, 7) >= lastAllowed.slice(0, 7) ? 'disabled' : ''}>${icon('right')}</button></div>
    <div class="cal__months" style="grid-template-columns: repeat(${count}, 1fr)">`;
  for (let m = 0; m < count; m++) {
    const d0 = D(S.calMonth); d0.setUTCMonth(d0.getUTCMonth() + m);
    const first = iso(d0); const y = d0.getUTCFullYear(), mo = d0.getUTCMonth();
    const days = new Date(Date.UTC(y, mo + 1, 0)).getUTCDate();
    html += `<div class="cal__month"><h3>${MONTHS[mo]} ${y}</h3><div class="cal__grid">${DOW.map(w => `<span class="cal__dow">${w.slice(0, 2)}</span>`).join('')}`;
    for (let i = 0; i < d0.getUTCDay(); i++) html += '<span></span>';
    for (let i = 0; i < days; i++) {
      const d = addDays(first, i);
      const past = d < S.today || d > lastAllowed;
      const taken = !past && nightTaken(code, d);
      const cls = ['day'];
      if (taken) cls.push('is-taken');
      if (d === S.today) cls.push('is-today');
      if (S.checkIn && S.checkOut && d > S.checkIn && d < S.checkOut) cls.push('in-range');
      if (d === S.checkIn) cls.push('is-start');
      if (d === S.checkOut) cls.push('is-end');
      if (taken && S.checkIn && S.checkOut && d >= S.checkIn && d < S.checkOut) cls.push('is-clash');
      if (taken && S.checkIn && !S.checkOut && d > S.checkIn && rangeFree(code, S.checkIn, d)) cls.push('can-out');
      const label = `${fmtDay(d)}${taken ? ', night taken' : ''}`;
      html += `<button type="button" class="${cls.join(' ')}" data-day="${d}" aria-label="${label}" ${past ? 'disabled' : ''}>${i + 1}</button>`;
    }
    html += '</div></div>';
  }
  html += `</div><div class="cal__key"><span><i class="k-free"></i>Free</span><span><i class="k-taken"></i>Taken</span><span><i class="k-sel"></i>Your check-in / out</span></div>
    <p class="cal-msg" role="status">${esc(S.calMsg)}</p></div>`;
  return html;
}
function rangeFree(code, a, b) {
  for (let d = a; d < b; d = addDays(d, 1)) if (nightTaken(code, d)) return false;
  return true;
}
function bindCal(root, code, count, after) {
  const box = root.querySelector('[data-cal]');
  box.addEventListener('click', e => {
    const nav = e.target.closest('[data-cm]');
    if (nav) {
      const d = D(S.calMonth); d.setUTCMonth(d.getUTCMonth() + Number(nav.dataset.cm)); S.calMonth = iso(d);
      return redraw();
    }
    const b = e.target.closest('[data-day]'); if (!b || b.disabled) return;
    const d = b.dataset.day; S.calMsg = '';
    if (!S.checkIn || S.checkOut || d <= S.checkIn) {
      if (nightTaken(code, d)) { S.calMsg = code ? 'That night is already booked. Pick another check-in day.' : 'All homes are booked that night.'; }
      else { S.checkIn = d; S.checkOut = ''; }
    } else if (rangeFree(code, S.checkIn, d)) {
      S.checkOut = d;
    } else {
      S.calMsg = 'Some nights in between are booked. Pick an earlier check-out.';
    }
    save(); redraw(); if (after) after();
  });
  function redraw() {
    box.outerHTML = calHTML(code, count);
    bindCal(root, code, count, after);
  }
}

// ---------- unit page ----------
function renderUnit(code) {
  const u = S.byCode[code];
  if (!u) return go('#/');
  S.gallery = Math.min(S.gallery, u.photos.length - 1);
  const p = u.photos[S.gallery];
  view.innerHTML = `<div class="page"><div class="wrap">
    <a class="back" href="#/units">${icon('back')}All homes</a>
    <div class="detail__head"><span class="letter" aria-hidden="true">${u.code}</span><div><h1>${esc(u.name)}</h1><p class="unit__tag">${esc(u.tagline)}</p></div></div>
    <div class="gallery">
      <div class="gallery__main">
        <img id="gMain" src="photos/${p.src}.jpg" alt="${esc(p.cap)}" decoding="async">
        <button class="gnav gnav--l" type="button" data-g="-1" aria-label="Previous photo">${icon('left')}</button>
        <button class="gnav gnav--r" type="button" data-g="1" aria-label="Next photo">${icon('right')}</button>
        <button class="gzoom" type="button" id="gZoom">${icon('expand')}Full screen</button>
      </div>
      <div class="gallery__cap"><span id="gCap">${esc(p.cap)}</span><span class="num" id="gNum">${S.gallery + 1} / ${u.photos.length}</span></div>
      <div class="thumbs" role="list">${u.photos.map((ph, i) => `<button type="button" role="listitem" data-t="${i}" aria-label="${esc(ph.cap)}" aria-current="${i === S.gallery}"><img src="photos/${ph.src}-800.jpg" alt="" loading="lazy"></button>`).join('')}</div>
    </div>
    <div class="detail">
      <div>
        <section>
          <h2>What you get</h2>
          <ul class="facts" style="margin:0 0 24px">
            <li>${icon('users')}<b>${u.sleeps}</b><span>guests</span></li>
            <li>${icon('bed')}<b>${u.bedrooms}</b><span>bedroom${u.bedrooms > 1 ? 's' : ''}</span></li>
            <li>${icon('bath')}<b>${u.bathrooms}</b><span>bathroom${u.bathrooms > 1 ? 's' : ''}</span></li>
            <li>${icon('size')}<b>${u.sizeSqft.toLocaleString('en-MY')}</b><span>sq ft</span></li>
          </ul>
          <ul class="getgrid">${u.amenities.map(a => `<li>${icon(a)}${AMENITY[a]}</li>`).join('')}</ul>
        </section>
        <section>
          <h2>Where everyone sleeps</h2>
          <ul class="beds">${u.beds.map(b => `<li>${icon('bed')}${esc(b)}</li>`).join('')}</ul>
        </section>
        <section>
          <h2>Prices</h2>
          <ul class="facts" style="grid-template-columns:repeat(3,auto);margin:0">
            <li>${icon('calendar')}<b>${rm(u.priceWeekday)}</b><span>Sun–Thu night</span></li>
            <li>${icon('calendar')}<b>${rm(u.priceWeekend)}</b><span>Fri & Sat night</span></li>
            <li>${icon('towels')}<b>${rm(u.cleaningFee)}</b><span>cleaning, once</span></li>
          </ul>
          ${u.minNightsWeekend > 1 ? `<p class="demo-note" style="margin-top:14px">Stays with a Friday or Saturday night need at least ${u.minNightsWeekend} nights.</p>` : ''}
        </section>
      </div>
      <aside class="panel" id="panel"></aside>
    </div>
  </div></div>`;

  const main = document.getElementById('gMain');
  const setG = i => {
    S.gallery = (i + u.photos.length) % u.photos.length;
    const ph = u.photos[S.gallery];
    main.src = `photos/${ph.src}.jpg`; main.alt = ph.cap;
    document.getElementById('gCap').textContent = ph.cap;
    document.getElementById('gNum').textContent = `${S.gallery + 1} / ${u.photos.length}`;
    view.querySelectorAll('[data-t]').forEach(t => t.setAttribute('aria-current', String(Number(t.dataset.t) === S.gallery)));
  };
  view.querySelectorAll('[data-g]').forEach(b => b.addEventListener('click', () => setG(S.gallery + Number(b.dataset.g))));
  view.querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => setG(Number(b.dataset.t))));
  main.addEventListener('click', () => openLB(u.photos, S.gallery));
  document.getElementById('gZoom').addEventListener('click', () => openLB(u.photos, S.gallery));
  // preload the big versions so arrows feel instant
  u.photos.forEach(ph => { const im = new Image(); im.src = `photos/${ph.src}.jpg`; });

  drawPanel(u);
}

function quoteHTML(u) {
  if (!S.checkIn || !S.checkOut || fit(u.code)) return '';
  const e = estimate(u, S.checkIn, S.checkOut);
  return `<div class="quote">${e.lines.map(l => `<div><span>${l[0]}</span><span>${rm(l[1])}</span></div>`).join('')}
    <div class="total"><span>Total</span><span>${rm(e.total)}</span></div>
    <div class="dep"><span>Deposit to hold dates (30%)</span><span>${rm(e.deposit)}</span></div></div>`;
}

function drawPanel(u) {
  const panel = document.getElementById('panel');
  const f = fit(u.code);
  panel.innerHTML = `<div class="band" aria-hidden="true"></div><div class="panel__body">
    <h2>Check dates for ${esc(u.name)}</h2>
    <p class="hint">Crossed-out days are already booked.</p>
    ${calHTML(u.code, 1)}
    <div class="guests">${stepper('adults', 'Adults', S.adults, 1, 10)}${stepper('kids', 'Kids', S.kids, 0, 8)}</div>
    ${quoteHTML(u)}
    ${f && f !== 'nodates' ? `<p class="cal-msg">${esc(f)}</p>` : ''}
    <a class="btn btn--go" href="#/book" data-book="${u.code}" ${f ? 'aria-disabled="true"' : ''}>${f === 'nodates' ? 'Pick your dates first' : f ? 'Change dates or guests' : `Book ${esc(u.name)}`}</a>
  </div>`;
  bindCal(panel, u.code, 1, () => drawPanel(u));
  bindSteppers(panel, () => drawPanel(u));
  panel.querySelector('[data-book]').addEventListener('click', e => {
    if (fit(u.code)) { e.preventDefault(); e.stopPropagation(); panel.querySelector('.cal').scrollIntoView({ behavior: 'smooth', block: 'center' }); }
  });
}

// ---------- booking ----------
function openStation() {
  if (!S.checkIn || !S.checkOut) return 1;
  if (!S.unit || fit(S.unit)) return 2;
  return 3;
}

function renderBook() {
  const st = S.station;
  const u = S.byCode[S.unit];
  const doneDates = S.checkIn && S.checkOut;
  const doneUnit = u && !fit(S.unit);
  const station = (n, title, sum, body) => `<section class="station ${st === n ? 'is-open' : ''} ${st !== n && (n === 1 ? doneDates : n === 2 ? doneUnit : false) ? 'is-done' : ''}">
    <div class="station__head"><span class="station__no">${st !== n && (n === 1 ? doneDates : n === 2 ? doneUnit : false) ? icon('check') : n}</span>
      <h2>${title}${st !== n && sum ? `<span class="station__sum">${sum}</span>` : ''}</h2>
      ${st !== n && sum ? `<button type="button" class="station__edit" data-open="${n}">Change</button>` : ''}</div>
    <div class="station__body">${st === n ? body : ''}</div></section>`;

  const pickList = `<ul class="pick">${S.units.map(x => {
    const f = fit(x.code);
    const e = estimate(x, S.checkIn, S.checkOut);
    return `<li><button type="button" data-pick="${x.code}" aria-pressed="${S.unit === x.code}" ${f ? 'aria-disabled="true"' : ''}>
      ${img(x.photos[0].src, x.photos[0].cap, '120px')}
      <span><b>${x.code} · ${esc(x.name)}</b><small>Sleeps ${x.sleeps} · ${x.bedrooms} bedroom${x.bedrooms > 1 ? 's' : ''}</small></span>
      <em>${f ? `<small>${esc(f)}</small>` : `${rm(e.total)}<small>total</small>`}</em></button></li>`;
  }).join('')}</ul>`;

  view.innerHTML = `<div class="book"><div class="wrap">
    <a class="back" href="${u ? `#/unit/${u.code}` : '#/units'}">${icon('back')}Back</a>
    <h1>Book your stay</h1>
    <div class="book__grid">
      <div>
        ${station(1, 'Dates and guests', doneDates ? `${datesLine()} · ${guestsLine()}` : '', `
          ${calHTML(u ? u.code : '', window.innerWidth >= 900 ? 2 : 1)}
          <div class="guests" style="margin-top:14px">${stepper('adults', 'Adults', S.adults, 1, 10)}${stepper('kids', 'Kids', S.kids, 0, 8)}</div>
          <button class="btn btn--go" type="button" id="next1" ${doneDates ? '' : 'disabled'}>Continue ${icon('arrow')}</button>`)}
        ${station(2, 'Choose your home', doneUnit ? `${u.code} · ${esc(u.name)}` : '', pickList)}
        ${station(3, 'Your details', '', `
          <form class="form" id="details" novalidate>
            <label class="field field--wide"><span>Full name</span><input name="guestName" autocomplete="name" required maxlength="80" placeholder="As on your IC"></label>
            <label class="field"><span>Phone (WhatsApp)</span><input name="phone" type="tel" inputmode="tel" autocomplete="tel" required placeholder="012 345 6789"></label>
            <label class="field"><span>Email (optional)</span><input name="email" type="email" autocomplete="email" placeholder="for your receipt"></label>
            <label class="field field--wide"><span>Anything we should know? (optional)</span><textarea name="note" rows="2" maxlength="300" placeholder="Arriving late, baby cot, extra mattress"></textarea></label>
            <div class="field--wide"><button class="btn btn--go" type="submit" id="send">Send booking ${icon('arrow')}</button>
            <p class="err" id="err" role="alert"></p></div>
          </form>`)}
      </div>
      <aside class="summary">${u ? `${img(u.photos[0].src, u.photos[0].cap, '(min-width: 960px) 420px, 100vw')}
        <div class="summary__body"><h2>${u.code} · ${esc(u.name)}</h2>
        <dl>${doneDates ? `<dt>Check-in</dt><dd>${fmtDay(S.checkIn)}, 3 pm</dd><dt>Check-out</dt><dd>${fmtDay(S.checkOut)}, 12 pm</dd>` : ''}<dt>Guests</dt><dd>${guestsLine()}</dd></dl>
        ${doneDates && !fit(u.code) ? quoteHTML(u) : ''}</div>` : `<p class="summary__empty">${doneDates ? `${datesLine()}<br>Choose a home to see the price.` : 'Your dates, home and price will show here.'}</p>`}
      </aside>
    </div>
  </div></div>`;

  view.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => { S.station = Number(b.dataset.open); renderBook(); }));
  if (st === 1) {
    bindCal(view, u ? u.code : '', window.innerWidth >= 900 ? 2 : 1, () => { document.getElementById('next1').disabled = !(S.checkIn && S.checkOut); });
    bindSteppers(view);
    document.getElementById('next1').addEventListener('click', () => { S.station = S.unit && !fit(S.unit) ? 3 : 2; renderBook(); scrollTop(); });
  }
  if (st === 2) {
    view.querySelectorAll('[data-pick]').forEach(b => b.addEventListener('click', () => {
      if (b.getAttribute('aria-disabled') === 'true') return;
      S.unit = b.dataset.pick; S.calMonth = ''; save(); S.station = 3; renderBook(); scrollTop();
    }));
  }
  if (st === 3) {
    const form = document.getElementById('details');
    form.elements.guestName.focus({ preventScroll: true });
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const err = document.getElementById('err'); err.textContent = '';
      const data = Object.fromEntries(new FormData(form));
      if (data.guestName.trim().length < 2) { err.textContent = 'Please write your name.'; return form.elements.guestName.focus(); }
      if (!/^\+?\d{9,15}$/.test(data.phone.replace(/[\s-]/g, ''))) { err.textContent = 'Please write a phone number we can WhatsApp, e.g. 012 345 6789.'; return form.elements.phone.focus(); }
      const btn = document.getElementById('send'); btn.disabled = true; btn.textContent = 'Sending…';
      try {
        const r = await fetch('/api/bookings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, unit: S.unit, checkIn: S.checkIn, checkOut: S.checkOut, adults: S.adults, kids: S.kids }) });
        const j = await r.json();
        if (!r.ok) {
          err.textContent = j.error || 'Could not send. Please try again.';
          btn.disabled = false; btn.innerHTML = `Send booking ${icon('arrow')}`;
          if (r.status === 409) loadAvailability();
          return;
        }
        S.last = { ...j, guestName: data.guestName.trim() };
        S.checkIn = ''; S.checkOut = ''; S.unit = ''; save();
        loadAvailability();
        go('#/done/' + j.ref);
      } catch {
        err.textContent = 'No connection. Check your internet and try again.';
        btn.disabled = false; btn.innerHTML = `Send booking ${icon('arrow')}`;
      }
    });
  }
}

function renderDone(ref) {
  const b = S.last && S.last.ref === ref ? S.last : null;
  if (!b) return go('#/');
  const msg = encodeURIComponent(`Hi Teratak Senja, booking ${b.ref} (${b.unit}, ${fmtDay(b.checkIn)} to ${fmtDay(b.checkOut)}). Here is my deposit receipt for ${rm(b.deposit)}.`);
  view.innerHTML = `<div class="book"><div class="wrap done">
    <h1>Thank you, ${esc(b.guestName.split(' ')[0])}. Your dates are held</h1>
    <div class="ticket">
      <div class="band" aria-hidden="true"></div>
      <div class="ticket__top"><div><p class="demo-note">Booking number</p><p class="ticket__ref">${esc(b.ref)}</p></div><p class="stamp stamp--note press">${icon('clock')}Waiting for deposit</p></div>
      <div class="ticket__body">
        <div class="summary__body" style="padding:0"><h2>${esc(b.unit)}</h2>
          <dl><dt>Check-in</dt><dd>${fmtDay(b.checkIn)}, 3 pm</dd><dt>Check-out</dt><dd>${fmtDay(b.checkOut)}, 12 pm</dd><dt>Total</dt><dd class="num">${rm(b.total)}</dd></dl></div>
        <div class="paybox"><b class="num">Pay ${rm(b.deposit)} deposit</b>
          <p>Transfer to <code>Maybank 5123 4567 8901</code> (Teratak Senja Enterprise), or DuitNow QR. Then send the receipt on WhatsApp and we confirm the same day.</p></div>
        <a class="btn btn--go" href="https://wa.me/60123456789?text=${msg}" rel="noopener">${icon('whatsapp')}Send receipt on WhatsApp</a>
        <p class="demo-note">Demo: bank account and number are not real.</p>
      </div>
    </div>
    <p style="margin-top:20px"><a class="back" href="#/">${icon('back')}Back to home</a></p>
  </div></div>`;
}

// ---------- lightbox ----------
const lb = document.getElementById('lb');
let lbList = [], lbI = 0;
document.getElementById('lbClose').innerHTML = icon('close');
document.getElementById('lbPrev').innerHTML = icon('left');
document.getElementById('lbNext').innerHTML = icon('right');
document.getElementById('footWa').insertAdjacentHTML('afterbegin', icon('whatsapp'));
function lbShow() {
  const p = lbList[lbI];
  const im = document.getElementById('lbImg');
  im.src = `photos/${p.src}.jpg`; im.alt = p.cap;
  document.getElementById('lbCap').textContent = p.cap;
  document.getElementById('lbCount').textContent = `${lbI + 1} / ${lbList.length}`;
  const one = lbList.length < 2;
  document.getElementById('lbPrev').hidden = one; document.getElementById('lbNext').hidden = one;
}
function openLB(list, i) { lbList = list; lbI = i; lbShow(); lb.showModal(); }
const lbStep = n => { lbI = (lbI + n + lbList.length) % lbList.length; lbShow(); };
document.getElementById('lbClose').addEventListener('click', () => lb.close());
document.getElementById('lbPrev').addEventListener('click', () => lbStep(-1));
document.getElementById('lbNext').addEventListener('click', () => lbStep(1));
lb.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') lbStep(-1); if (e.key === 'ArrowRight') lbStep(1); });
let sx = null;
const stage = document.getElementById('lbStage');
stage.addEventListener('pointerdown', e => { sx = e.clientX; });
stage.addEventListener('pointerup', e => { if (sx !== null && Math.abs(e.clientX - sx) > 50 && lbList.length > 1) lbStep(e.clientX < sx ? 1 : -1); sx = null; });

document.addEventListener('click', e => {
  const t = e.target.closest('[data-lb]');
  if (t) {
    const list = t.dataset.lb === 'hero' ? [{ src: 'hero-pool', cap: 'The pool garden, with the hills behind' }] : S.byCode[t.dataset.lb].photos;
    return openLB(list, Number(t.dataset.i));
  }
  const bk = e.target.closest('[data-book]');
  if (bk && !e.defaultPrevented) { S.unit = bk.dataset.book; S.calMonth = ''; save(); S.station = openStation(); }
  else if (e.target.closest('a[href="#/book"]')) S.station = openStation();
});

// ---------- router ----------
function go(h) { if (location.hash === h) route(); else location.hash = h; }
function scrollTop() { window.scrollTo({ top: 0 }); }
let lastRoute = '';
function route() {
  const h = location.hash || '#/';
  const [, a, b] = h.split('/');
  S.calMsg = '';
  if (a === 'unit') { if (lastRoute !== h) { S.gallery = 0; S.calMonth = ''; } renderUnit(b); scrollTop(); }
  else if (a === 'book') { if (!S.station) S.station = openStation(); renderBook(); scrollTop(); }
  else if (a === 'done') { renderDone(b); scrollTop(); }
  else { renderHome(['units', 'info', 'around'].includes(a) ? a : ''); if (!a) scrollTop(); }
  lastRoute = h;
}
window.addEventListener('hashchange', route);

async function loadAvailability() {
  const to = addDays(S.today, 400);
  const r = await fetch(`/api/availability?from=${S.today}&to=${to}`);
  const j = await r.json();
  S.taken = j.taken;
  if (location.hash.startsWith('#/book') || location.hash.startsWith('#/unit')) return;
  if (document.querySelector('.avail')) refreshStamps(false);
}

(async function start() {
  try {
    const [u, a] = await Promise.all([fetch('/api/units').then(r => r.json()), fetch('/api/availability?from=2000-01-01&to=2000-01-02').then(r => r.json())]);
    S.units = u; S.byCode = Object.fromEntries(u.map(x => [x.code, x])); S.today = a.today;
    restore();
    await loadAvailability();
    S.station = openStation();
    route();
  } catch {
    view.innerHTML = '<div class="page"><div class="wrap"><h1 style="color:var(--indigo-900)">We could not load the homes</h1><p style="margin-top:12px">Check your connection and refresh the page.</p></div></div>';
  }
})();

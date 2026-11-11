const app = document.getElementById('app');
const drawer = document.getElementById('drawer');
const A = { tab: 'today', calFrom: '', today: '', units: [], filter: 'upcoming', q: '', list: [] };
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const STATUS = { pending: 'Waiting deposit', confirmed: 'Confirmed', checked_in: 'Staying', checked_out: 'Checked out', cancelled: 'Cancelled' };

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const D = s => new Date(s + 'T00:00:00Z');
const iso = d => d.toISOString().slice(0, 10);
const addDays = (s, n) => { const d = D(s); d.setUTCDate(d.getUTCDate() + n); return iso(d); };
const day = s => { const d = D(s); return `${DOW[d.getUTCDay()]} ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`; };
const rm = n => 'RM' + Number(n).toLocaleString('en-MY');
const pill = s => `<span class="st st-${s}">${STATUS[s]}</span>`;
const uDot = c => `<span class="u u-${c}" aria-label="Home ${c}">${c}</span>`;
const waLink = (phone, text) => `https://wa.me/${phone.replace(/^0/, '60').replace(/^\+/, '')}?text=${encodeURIComponent(text)}`;

function toast(msg) {
  const t = document.getElementById('toast'); t.textContent = msg; t.classList.add('show');
  clearTimeout(toast.t); toast.t = setTimeout(() => t.classList.remove('show'), 2400);
}

async function api(path, opts = {}) {
  const r = await fetch('/api/admin' + path, { ...opts, headers: { 'Content-Type': 'application/json' }, body: opts.body ? JSON.stringify(opts.body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (r.status === 401 && path !== '/login') { renderLogin(); throw new Error('auth'); }
  if (!r.ok) throw new Error(j.error || 'Something went wrong.');
  return j;
}

// ---------- login ----------
function renderLogin(msg = '') {
  drawer.open && drawer.close();
  app.innerHTML = `<div class="login"><form id="login">
    <div class="band" aria-hidden="true"></div>
    <div class="login__body">
      <h1>Teratak Senja owner</h1>
      <p>Bookings, calendar and payments for your homes.</p>
      <label class="field"><span>Password</span><input type="password" name="password" autocomplete="current-password" required autofocus></label>
      <p class="err" id="lerr">${esc(msg)}</p>
      <button class="btn btn--go" type="submit">Log in</button>
      <p>Demo password: teratak2026</p>
    </div></form></div>`;
  document.getElementById('login').addEventListener('submit', async e => {
    e.preventDefault();
    try { await api('/login', { method: 'POST', body: { password: e.target.password.value } }); boot(); }
    catch (err) { document.getElementById('lerr').textContent = err.message; }
  });
}

// ---------- shell ----------
function shell(inner) {
  const tab = (id, label, ic) => `<a href="#owner/${id}" ${A.tab === id ? 'aria-current="page"' : ''}>${icon(ic)}${label}</a>`;
  app.innerHTML = `<header class="bar"><div class="wrap bar__in">
      <div class="brand"><span class="brand__mark" aria-hidden="true"></span>Teratak Senja <small>Owner</small></div>
      <nav class="tabs" aria-label="Sections">${tab('today', 'Today', 'door')}${tab('calendar', 'Calendar', 'calendar')}${tab('bookings', 'Bookings', 'users')}${tab('prices', 'Prices', 'money')}</nav>
      <button class="btn btn--go" type="button" id="newBk">${icon('plus')}<span>New booking</span></button>
      <button class="iconbtn" type="button" id="logout" aria-label="Log out">${icon('logout')}</button>
    </div></header>
    <div class="band" aria-hidden="true"></div>
    <main><div class="wrap">${inner}</div></main>`;
  document.getElementById('newBk').addEventListener('click', () => openNew());
  document.getElementById('logout').addEventListener('click', async () => { await api('/logout', { method: 'POST' }); renderLogin(); });
}

// ---------- today ----------
function row(b, action) {
  const owe = b.total - b.paid;
  return `<li class="row" data-id="${b.id}">${uDot(b.unitCode)}
    <div class="row__who"><b>${esc(b.guestName)}</b><span>${day(b.checkIn)} → ${day(b.checkOut)} · ${b.adults + b.kids} pax</span>
    ${owe > 0 && b.status !== 'pending' ? `<div class="owe">Collect ${rm(owe)}</div>` : ''}</div>
    <div class="row__act"><a class="sbtn sbtn--wa" href="${waLink(b.phone, `Hi ${b.guestName.split(' ')[0]}, Teratak Senja here about booking ${b.ref}.`)}" rel="noopener" aria-label="WhatsApp ${esc(b.guestName)}">${icon('whatsapp')}</a>${action || ''}</div></li>`;
}
function list(title, ic, items, action, emptyText) {
  return `<section class="box"><div class="box__head"><h2>${icon(ic)}${title}</h2><span class="count">${items.length}</span></div>
    ${items.length ? `<ul class="rows">${items.map(b => row(b, action(b))).join('')}</ul>` : `<p class="empty">${emptyText}</p>`}</section>`;
}

async function renderToday() {
  const t = await api('/today');
  A.today = t.today;
  const d = D(t.today);
  const busy = t.units.filter(u => u.busyTonight).length;
  shell(`<div class="head"><div><h1>${['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][d.getUTCDay()]}, ${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}</h1><p>${busy} of ${t.units.length} homes have guests tonight</p></div>
      <div class="tonight">${t.units.map(u => `<span class="chip ${u.busyTonight ? 'is-busy' : ''}"><i></i>${u.code} · ${esc(u.name)}: ${u.busyTonight ? 'booked' : 'free'}</span>`).join('')}</div></div>
    <div class="cols">
      ${list('Arriving today', 'door', t.arriving, b => `<button class="sbtn" data-act="checked_in" data-id="${b.id}" ${b.status === 'pending' ? 'disabled title="Deposit not received yet"' : ''}>Check in</button>`, 'Nobody arriving today.')}
      ${list('Leaving today', 'logout', t.leaving, b => `<button class="sbtn" data-act="checked_out" data-id="${b.id}">Check out</button>`, 'Nobody leaving today.')}
      ${list('Staying now', 'bed', t.staying, () => '', 'No guests in the homes right now.')}
    </div>
    <div class="two">
      ${list('Waiting for deposit', 'clock', t.waitingDeposit, b => `<button class="sbtn" data-act="confirmed" data-id="${b.id}">Deposit in</button>`, 'All deposits are in.')}
      ${list('Next 7 days', 'calendar', t.next7, b => pill(b.status), 'No arrivals in the next 7 days.')}
    </div>
    <p class="money">Paid so far for stays starting this month: <b>${rm(t.monthIncome)}</b></p>`);
  app.querySelectorAll('[data-act]').forEach(b => b.addEventListener('click', e => { e.stopPropagation(); quickAct(Number(b.dataset.id), b.dataset.act, b); }));
  app.querySelectorAll('.row').forEach(r => r.addEventListener('click', e => { if (!e.target.closest('a,button')) openBooking(Number(r.dataset.id)); }));
}

async function quickAct(id, status, btn) {
  btn.disabled = true;
  try {
    await api('/bookings/' + id, { method: 'PATCH', body: { status } });
    toast(status === 'confirmed' ? 'Deposit recorded, booking confirmed' : status === 'checked_in' ? 'Checked in' : 'Checked out');
    route();
  } catch (e) { if (e.message !== 'auth') { toast(e.message); btn.disabled = false; openBooking(id); } }
}

// ---------- calendar ----------
async function renderCalendar() {
  const days = window.innerWidth < 760 ? 10 : 14;
  if (!A.calFrom) A.calFrom = addDays(A.today || iso(new Date()), -1);
  const c = await api(`/calendar?from=${A.calFrom}&days=${days}`);
  A.today = c.today; A.units = c.units;
  const dates = Array.from({ length: days }, (_, i) => addDays(c.from, i));
  const col = s => Math.round((D(s) - D(c.from)) / 86400000);
  const isWe = s => [5, 6].includes(D(s).getUTCDay());
  let grid = `<div class="tl__grid" style="--days:${days}"><div class="tl__unit" style="border-bottom-color:var(--cotton-3)"></div>
    ${dates.map(s => `<div class="tl__day ${isWe(s) ? 'is-we' : ''} ${s === c.today ? 'is-today' : ''}">${DOW[D(s).getUTCDay()]}<b>${D(s).getUTCDate()}</b></div>`).join('')}`;
  for (const u of c.units) {
    grid += `<div class="tl__unit">${uDot(u.code)}<span>${esc(u.name)}</span></div><div class="tl__lane">`;
    grid += dates.map((s, i) => `<button class="tl__cell ${isWe(s) ? 'is-we' : ''}" style="grid-column:${i + 1}" data-free="${u.code}" data-day="${s}" aria-label="${esc(u.name)} ${day(s)}"></button>`).join('');
    for (const b of c.bookings.filter(b => b.unitCode === u.code)) {
      const a = Math.max(0, col(b.checkIn)), z = Math.min(days, col(b.checkOut));
      if (z <= a) continue;
      grid += `<button class="bk bk-${b.status}" style="grid-column:${a + 1} / ${z + 1}" data-bk="${b.id}" title="${esc(b.guestName)} · ${STATUS[b.status]}">${esc(b.guestName)}<small>${STATUS[b.status]}</small></button>`;
    }
    for (const k of c.blocks.filter(k => k.unit_id === u.id)) {
      const a = Math.max(0, col(k.start_date)), z = Math.min(days, col(k.end_date));
      if (z <= a) continue;
      grid += `<button class="bk bk-block" style="grid-column:${a + 1} / ${z + 1}" data-block="${k.id}" data-reason="${esc(k.reason)}" data-range="${day(k.start_date)} → ${day(k.end_date)}">${esc(k.reason || 'Blocked')}<small>Closed</small></button>`;
    }
    grid += '</div>';
  }
  grid += '</div>';
  const from = D(c.from), to = D(addDays(c.from, days - 1));
  shell(`<div class="head"><div><h1>Calendar</h1><p>Tap an empty day to add a booking or close the dates</p></div>
    <div class="calbar"><button class="sbtn sbtn--ghost" data-shift="-${days}" aria-label="Earlier">${icon('left')}</button>
    <button class="sbtn sbtn--ghost" data-shift="0">Today</button>
    <button class="sbtn sbtn--ghost" data-shift="${days}" aria-label="Later">${icon('right')}</button>
    <b class="num" style="margin-left:8px">${from.getUTCDate()} ${MONTHS[from.getUTCMonth()]} – ${to.getUTCDate()} ${MONTHS[to.getUTCMonth()]}</b></div></div>
    <section class="box"><div class="tl">${grid}</div>
    <div class="legend"><span><i class="bk-pending"></i>Waiting deposit</span><span><i class="bk-confirmed"></i>Confirmed</span><span><i class="bk-checked_in"></i>Staying</span><span><i class="bk-checked_out"></i>Checked out</span><span><i class="bk-block"></i>Closed</span></div></section>`);
  app.querySelectorAll('[data-shift]').forEach(b => b.addEventListener('click', () => {
    const n = Number(b.dataset.shift); A.calFrom = n ? addDays(A.calFrom, n) : addDays(A.today, -1); renderCalendar();
  }));
  app.querySelectorAll('[data-bk]').forEach(b => b.addEventListener('click', () => openBooking(Number(b.dataset.bk))));
  app.querySelectorAll('[data-free]').forEach(b => b.addEventListener('click', () => openFreeDay(b.dataset.free, b.dataset.day)));
  app.querySelectorAll('[data-block]').forEach(b => b.addEventListener('click', () => openBlock(b)));
}

function openFreeDay(code, s) {
  const u = A.units.find(x => x.code === code);
  drawerHTML(`${esc(u.name)}`, day(s), `
    <p>This day is free. What do you want to do?</p>
    <button class="btn btn--ink" type="button" id="fdBook">${icon('plus')}Add a booking from ${day(s)}</button>
    <form id="blockForm" class="formgrid" style="padding-top:18px;border-top:1px solid var(--cotton-2)">
      <h3 class="wide" style="font-size:17px">Close these dates</h3>
      <label class="field"><span>From</span><input type="date" name="start" value="${s}" required></label>
      <label class="field"><span>Until (guests can arrive)</span><input type="date" name="end" value="${addDays(s, 1)}" required></label>
      <label class="field wide"><span>Reason (only you see this)</span><input name="reason" maxlength="80" placeholder="Repairs, family using the house"></label>
      <p class="err wide" id="berr"></p>
      <button class="btn btn--line wide" style="color:var(--indigo-800)" type="submit">Close dates</button>
    </form>`, '');
  document.getElementById('fdBook').addEventListener('click', () => openNew(code, s));
  document.getElementById('blockForm').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target;
    try { await api('/blocks', { method: 'POST', body: { unit: code, start: f.start.value, end: f.end.value, reason: f.reason.value } }); drawer.close(); toast('Dates closed'); route(); }
    catch (err) { document.getElementById('berr').textContent = err.message; }
  });
}

function openBlock(b) {
  drawerHTML(b.dataset.reason || 'Closed dates', b.dataset.range, `<p>Guests cannot book these nights on the website.</p>`,
    `<button class="sbtn sbtn--danger" id="unblock">Open these dates again</button>`);
  document.getElementById('unblock').addEventListener('click', async () => {
    await api('/blocks/' + b.dataset.block, { method: 'DELETE' }); drawer.close(); toast('Dates open again'); route();
  });
}

// ---------- bookings ----------
async function renderBookings() {
  const params = new URLSearchParams({ status: A.filter === 'all' ? '' : A.filter, q: A.q });
  A.list = await api('/bookings?' + params);
  const f = (id, label) => `<button type="button" data-f="${id}" aria-pressed="${A.filter === id}">${label}</button>`;
  shell(`<div class="head"><div><h1>Bookings</h1><p>${A.list.length} shown</p></div></div>
    <div class="tools">
      <label class="search">${icon('search')}<span class="sr">Search</span><input id="q" type="search" placeholder="Name, phone or booking no." value="${esc(A.q)}"></label>
      <div class="filters">${f('upcoming', 'Upcoming')}${f('pending', 'Waiting deposit')}${f('checked_in', 'Staying')}${f('checked_out', 'Checked out')}${f('cancelled', 'Cancelled')}${f('all', 'All')}</div>
    </div>
    <section class="box">${A.list.length ? `<table><thead><tr><th>Guest</th><th>Home</th><th>Dates</th><th class="hide-m">Booking no.</th><th class="r">Total</th><th class="r">Paid</th><th>Status</th></tr></thead><tbody>
      ${A.list.map(b => `<tr data-id="${b.id}"><td><b>${esc(b.guestName)}</b></td><td class="hide-m">${uDot(b.unitCode)}</td><td>${day(b.checkIn)} → ${day(b.checkOut)}</td><td class="hide-m ref">${esc(b.ref)}</td>
        <td class="r hide-m">${rm(b.total)}</td><td class="r">${b.paid >= b.total ? 'Paid' : rm(b.paid)}</td><td>${pill(b.status)}</td></tr>`).join('')}
      </tbody></table>` : `<p class="empty">No bookings match. Try another filter or search.</p>`}</section>`);
  let timer = 0;
  const q = document.getElementById('q');
  q.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(async () => { A.q = q.value; await renderBookings(); const n = document.getElementById('q'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 300); });
  app.querySelectorAll('[data-f]').forEach(b => b.addEventListener('click', () => { A.filter = b.dataset.f; renderBookings(); }));
  app.querySelectorAll('tbody tr').forEach(r => r.addEventListener('click', () => openBooking(Number(r.dataset.id))));
}

// ---------- booking drawer ----------
function drawerHTML(title, sub, body, foot) {
  drawer.innerHTML = `<div class="drawer__head"><div><h2>${title}</h2>${sub ? `<p style="color:var(--ink-2);margin-top:4px">${sub}</p>` : ''}</div>
    <button class="iconbtn" type="button" id="dClose" aria-label="Close">${icon('close')}</button></div>
    <div class="drawer__body">${body}</div>${foot ? `<div class="drawer__foot">${foot}</div>` : ''}`;
  document.getElementById('dClose').addEventListener('click', () => drawer.close());
  if (!drawer.open) drawer.showModal();
}

async function openBooking(id) {
  const all = await api('/bookings?status=&q=');
  const b = all.find(x => x.id === id);
  if (!b) return toast('Booking not found');
  const owe = b.total - b.paid;
  const next = { pending: ['confirmed', 'Deposit received'], confirmed: ['checked_in', 'Check in'], checked_in: ['checked_out', 'Check out'] }[b.status];
  const canCancel = ['pending', 'confirmed'].includes(b.status);
  drawerHTML(esc(b.guestName), `${pill(b.status)} <span class="ref" style="margin-left:6px">${esc(b.ref)}</span>`, `
    <dl class="kv">
      <dt>Home</dt><dd>${esc(b.unitCode)} · ${esc(b.unitName)}</dd>
      <dt>Check-in</dt><dd>${day(b.checkIn)}</dd>
      <dt>Check-out</dt><dd>${day(b.checkOut)} · ${b.nights} night${b.nights > 1 ? 's' : ''}</dd>
      <dt>Guests</dt><dd>${b.adults} adult${b.adults > 1 ? 's' : ''}${b.kids ? `, ${b.kids} kid${b.kids > 1 ? 's' : ''}` : ''}</dd>
      <dt>Phone</dt><dd><a href="tel:${esc(b.phone)}">${esc(b.phone)}</a></dd>
      ${b.email ? `<dt>Email</dt><dd>${esc(b.email)}</dd>` : ''}
      <dt>Came from</dt><dd>${{ website: 'Website', whatsapp: 'WhatsApp', walkin: 'Walk-in' }[b.source]}</dd>
    </dl>
    <div>
      <dl class="kv"><dt>Total</dt><dd>${rm(b.total)}</dd><dt>Deposit (30%)</dt><dd>${rm(b.deposit)}</dd><dt>Paid</dt><dd>${rm(b.paid)}</dd>
      <dt>${owe > 0 ? 'Still to collect' : 'Balance'}</dt><dd style="color:${owe > 0 ? 'var(--madder)' : 'var(--ok)'}">${owe > 0 ? rm(owe) : 'Fully paid'}</dd></dl>
      <div class="meter" style="margin-top:10px" aria-hidden="true"><i style="width:${Math.round(b.paid / b.total * 100)}%"></i></div>
    </div>
    ${b.status !== 'cancelled' ? `<div class="paid-line">
      <label class="field"><span>Total paid so far (RM)</span><input id="paidIn" type="number" inputmode="numeric" min="0" max="${b.total}" step="1" value="${b.paid}"></label>
      <button class="sbtn sbtn--ghost" style="height:42px" id="savePaid">Save</button>
      ${owe > 0 ? `<button class="sbtn sbtn--ghost" style="height:42px" id="fullPaid">Paid in full</button>` : ''}</div>` : ''}
    <label class="field"><span>Note</span><textarea id="noteIn" rows="2" maxlength="300">${esc(b.note)}</textarea></label>
    <p class="err" id="derr"></p>`,
    `${next ? `<button class="sbtn" id="nextSt">${next[1]}</button>` : ''}
     <a class="sbtn sbtn--ghost" href="${waLink(b.phone, b.status === 'pending' ? `Hi ${b.guestName.split(' ')[0]}, Teratak Senja here. Your dates (${day(b.checkIn)} – ${day(b.checkOut)}) are held. Please send the ${rm(b.deposit)} deposit receipt to confirm booking ${b.ref}.` : `Hi ${b.guestName.split(' ')[0]}, Teratak Senja here about booking ${b.ref}.`)}" rel="noopener">${icon('whatsapp')}WhatsApp</a>
     ${canCancel ? `<button class="sbtn sbtn--danger" id="cancelBk" style="margin-left:auto">Cancel booking</button>` : ''}`);
  const err = document.getElementById('derr');
  const patch = async (body, msg) => {
    try { await api('/bookings/' + b.id, { method: 'PATCH', body }); toast(msg); await openBooking(b.id); refreshBehind(); }
    catch (e) { if (e.message !== 'auth') err.textContent = e.message; }
  };
  document.getElementById('nextSt')?.addEventListener('click', () => patch({ status: next[0] }, next[1] === 'Deposit received' ? 'Deposit recorded, booking confirmed' : next[1] + ' done'));
  document.getElementById('savePaid')?.addEventListener('click', () => patch({ paid: Number(document.getElementById('paidIn').value) }, 'Payment saved'));
  document.getElementById('fullPaid')?.addEventListener('click', () => patch({ paid: b.total }, 'Marked as fully paid'));
  document.getElementById('noteIn').addEventListener('change', e => patch({ note: e.target.value }, 'Note saved'));
  const c = document.getElementById('cancelBk');
  c?.addEventListener('click', () => {
    if (!c.classList.contains('is-armed')) { c.classList.add('is-armed'); c.textContent = 'Tap again to cancel'; setTimeout(() => { c.classList.remove('is-armed'); c.textContent = 'Cancel booking'; }, 3000); return; }
    patch({ status: 'cancelled' }, 'Booking cancelled, dates are free again');
  });
}
function refreshBehind() {
  if (A.tab === 'today') renderToday(); else if (A.tab === 'calendar') renderCalendar(); else if (A.tab === 'bookings') renderBookings();
}

// ---------- new booking ----------
async function openNew(code = 'A', start = '') {
  if (!A.units.length) A.units = (await api(`/calendar?from=${A.today || iso(new Date())}&days=1`)).units;
  const s = start || A.today || iso(new Date());
  drawerHTML('New booking', 'For bookings that came in by WhatsApp, phone or walk-in', `
    <form id="nb" class="formgrid" novalidate>
      <label class="field wide"><span>Home</span><select name="unit">${A.units.map(u => `<option value="${u.code}" ${u.code === code ? 'selected' : ''}>${u.code} · ${esc(u.name)} (sleeps ${u.sleeps})</option>`).join('')}</select></label>
      <label class="field"><span>Check-in</span><input type="date" name="checkIn" value="${s}" required></label>
      <label class="field"><span>Check-out</span><input type="date" name="checkOut" value="${addDays(s, 1)}" required></label>
      <label class="field"><span>Adults</span><input type="number" name="adults" min="1" max="10" value="2" inputmode="numeric"></label>
      <label class="field"><span>Kids</span><input type="number" name="kids" min="0" max="8" value="0" inputmode="numeric"></label>
      <label class="field wide"><span>Guest name</span><input name="guestName" required maxlength="80" autocomplete="off"></label>
      <label class="field"><span>Phone</span><input name="phone" type="tel" required inputmode="tel" placeholder="012 345 6789"></label>
      <label class="field"><span>Came from</span><select name="source"><option value="whatsapp">WhatsApp / phone</option><option value="walkin">Walk-in</option></select></label>
      <label class="field wide"><span>Note</span><input name="note" maxlength="300"></label>
      <div class="quote-mini wide" id="nbq"></div>
      <p class="err wide" id="nberr"></p>
    </form>`, `<button class="btn btn--go" type="submit" form="nb" style="width:100%">Save booking</button>`);
  const f = document.getElementById('nb');
  const q = async () => {
    const r = await fetch(`/api/quote?unit=${f.unit.value}&checkIn=${f.checkIn.value}&checkOut=${f.checkOut.value}&adults=${Number(f.adults.value) || 1}&kids=${Number(f.kids.value) || 0}`).then(r => r.json());
    document.getElementById('nbq').innerHTML = r.ok ? `${r.lines.map(l => `${l.label}: <b>${rm(l.amount)}</b>`).join('<br>')}<br>Total <b>${rm(r.total)}</b> · deposit <b>${rm(r.deposit)}</b>` : `<span style="color:var(--madder)">${esc(r.error)}</span>`;
  };
  ['unit', 'checkIn', 'checkOut', 'adults', 'kids'].forEach(n => f[n].addEventListener('change', q));
  q();
  f.addEventListener('submit', async e => {
    e.preventDefault();
    const body = Object.fromEntries(new FormData(f));
    body.adults = Number(body.adults); body.kids = Number(body.kids);
    try { const r = await api('/bookings', { method: 'POST', body }); drawer.close(); toast(`Saved ${r.ref}, waiting for deposit`); refreshBehind(); }
    catch (err) { if (err.message !== 'auth') document.getElementById('nberr').textContent = err.message; }
  });
}

// ---------- prices ----------
async function renderPrices() {
  const c = await api(`/calendar?from=${A.today || iso(new Date())}&days=1`);
  A.units = c.units;
  shell(`<div class="head"><div><h1>Prices</h1><p>Changes show on the website straight away. Bookings already made keep their price.</p></div></div>
    <div class="prices">${c.units.map(u => `<form class="box price-row" data-code="${u.code}">
      <h3>${uDot(u.code)}${esc(u.name)}</h3>
      <label class="field"><span>Sun–Thu night (RM)</span><input name="priceWeekday" type="number" min="0" step="1" inputmode="numeric" value="${u.priceWeekday}"></label>
      <label class="field"><span>Fri & Sat night (RM)</span><input name="priceWeekend" type="number" min="0" step="1" inputmode="numeric" value="${u.priceWeekend}"></label>
      <label class="field"><span>Cleaning (RM)</span><input name="cleaningFee" type="number" min="0" step="1" inputmode="numeric" value="${u.cleaningFee}"></label>
      <label class="field"><span>Weekend min. nights</span><input name="minNightsWeekend" type="number" min="1" max="7" step="1" inputmode="numeric" value="${u.minNightsWeekend}"></label>
      <div><p class="saved" aria-live="polite"></p><button class="sbtn" type="submit" style="height:42px">Save</button></div>
    </form>`).join('')}</div>`);
  app.querySelectorAll('.price-row').forEach(f => f.addEventListener('submit', async e => {
    e.preventDefault();
    const body = Object.fromEntries([...new FormData(f)].map(([k, v]) => [k, Number(v)]));
    const out = f.querySelector('.saved');
    try { await api('/units/' + f.dataset.code, { method: 'PATCH', body }); out.style.color = ''; out.textContent = 'Saved'; }
    catch (err) { out.style.color = 'var(--madder)'; out.textContent = err.message; }
  }));
}

// ---------- router ----------
async function route() {
  A.tab = (location.hash.replace(/^#owner\/?/, '') || 'today');
  if (!['today', 'calendar', 'bookings', 'prices'].includes(A.tab)) A.tab = 'today';
  try {
    if (A.tab === 'today') await renderToday();
    else if (A.tab === 'calendar') await renderCalendar();
    else if (A.tab === 'bookings') await renderBookings();
    else await renderPrices();
  } catch (e) { if (e.message !== 'auth') toast(e.message); }
}
window.addEventListener('hashchange', () => { if (drawer.open) drawer.close(); route(); });
function boot() { route(); }
boot();

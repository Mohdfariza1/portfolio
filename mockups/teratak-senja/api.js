// Browser stand-in for server.js: same routes, same rules, data kept in this browser.
(() => {
const ADMIN_PASSWORD = 'teratak2026';
const DEPOSIT_RATE = 0.3;
const KEY = 'teratak-demo-v1';

// ---------- dates ----------
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
function parseDate(s) {
  if (typeof s !== 'string' || !DATE_RE.test(s)) return null;
  const d = new Date(s + 'T00:00:00Z');
  return Number.isNaN(d.getTime()) || d.toISOString().slice(0, 10) !== s ? null : d;
}
function fmt(d) { return d.toISOString().slice(0, 10); }
function addDays(s, n) { const d = parseDate(s); d.setUTCDate(d.getUTCDate() + n); return fmt(d); }
function todayStr() { return new Date(Date.now() + 8 * 3600 * 1000).toISOString().slice(0, 10); }
function nightsBetween(a, b) { return Math.round((parseDate(b) - parseDate(a)) / 86400000); }
function isWeekendNight(s) { const w = parseDate(s).getUTCDay(); return w === 5 || w === 6; }

// ---------- storage ----------
let db = null;
try { db = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch {}
function save() { try { localStorage.setItem(KEY, JSON.stringify(db)); } catch {} }
if (!db || db.seeded !== todayStr()) seed();

function newRef() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = 'TS-';
  for (const b of crypto.getRandomValues(new Uint8Array(6))) s += chars[b % chars.length];
  return s;
}

function seed() {
  db = { seeded: todayStr(), nextId: 1, units: [], bookings: [], blocks: [] };
  const unit = (code, name, tagline, sleeps, bedrooms, bathrooms, size_sqft, price_weekday, price_weekend, cleaning_fee, min_nights_weekend, beds, amenities, photos) =>
    db.units.push({ id: db.units.length + 1, code, name, tagline, sleeps, bedrooms, bathrooms, size_sqft, price_weekday, price_weekend, cleaning_fee, min_nights_weekend, beds, amenities, photos });
  unit('A', 'Rumah Kayu', 'Timber family house with its own pool', 10, 3, 2, 1600, 450, 620, 60, 2,
    ['1 king bed', '2 queen beds', '2 single beds', '2 floor mattresses'],
    ['pool', 'kitchen', 'bbq', 'parking3', 'wifi', 'aircon', 'surau', 'tv', 'washer', 'towels', 'kids'],
    [
      { src: 'a-outside', cap: 'The house and pool deck' },
      { src: 'a-living', cap: 'Living room' },
      { src: 'a-bedroom', cap: 'Master bedroom, king bed' },
      { src: 'a-dining', cap: 'Kitchen and dining for 10' },
      { src: 'a-bath', cap: 'Bathroom with hot shower' },
      { src: 'a-pool', cap: 'Private pool, 1.2 m deep' }
    ]);
  unit('B', 'Chalet Sungai', 'Riverside chalet for a small family', 4, 1, 1, 650, 260, 340, 40, 1,
    ['1 queen bed', '1 sofa bed'],
    ['river', 'kitchenette', 'parking1', 'wifi', 'aircon', 'surau', 'tv', 'towels', 'bathtub'],
    [
      { src: 'b-outside', cap: 'Deck facing the river' },
      { src: 'b-bedroom', cap: 'Queen bedroom' },
      { src: 'b-living', cap: 'Sitting room with sofa bed' },
      { src: 'b-bath', cap: 'Bathroom with tub' },
      { src: 'near-waterfall', cap: 'River pools, 3 minutes on foot' }
    ]);
  unit('C', 'Studio Bukit', 'Hilltop studio for two', 2, 1, 1, 420, 190, 250, 30, 1,
    ['1 queen bed'],
    ['view', 'coffee', 'parking1', 'wifi', 'aircon', 'surau', 'towels', 'workdesk'],
    [
      { src: 'c-deck', cap: 'Open deck with the hill view' },
      { src: 'c-bedroom', cap: 'Queen bed facing the window' },
      { src: 'c-bedroom2', cap: 'Bright, quiet room' },
      { src: 'c-corner', cap: 'Reading corner and desk' },
      { src: 'c-bath', cap: 'Bathroom with rain shower' }
    ]);

  const t = todayStr();
  const demo = [
    ['A', 'Nurul Huda Rahman', '0123456781', 4, 3, 0, 2, 'confirmed', 'website', 'Arriving after Maghrib'],
    ['B', 'Daniel Lim', '0167788990', 2, 1, -1, 2, 'checked_in', 'whatsapp', ''],
    ['C', 'Aina & Faris', '0192233445', 2, 0, 0, 1, 'pending', 'website', 'Anniversary'],
    ['A', 'Syarikat Murni Sdn Bhd', '0378901234', 8, 0, 7, 2, 'confirmed', 'whatsapp', 'Team retreat, need BBQ charcoal'],
    ['B', 'Kavitha Subramaniam', '0124455667', 2, 2, 8, 3, 'pending', 'website', ''],
    ['C', 'Hafiz Zulkifli', '0135566778', 2, 0, -3, 2, 'checked_out', 'website', ''],
    ['A', 'Keluarga Azman', '0198877665', 6, 4, 14, 2, 'confirmed', 'website', '']
  ];
  for (const [code, name, phone, adults, kids, offset, nights, status, source, note] of demo) {
    const u = unitBy(code);
    const ci = addDays(t, offset);
    const q = quote(u, ci, addDays(ci, nights));
    const paid = status === 'pending' ? 0 : status === 'confirmed' ? q.deposit : q.total;
    db.bookings.push({ id: db.nextId++, ref: newRef(), unit_id: u.id, guest_name: name, phone, email: '', adults, kids, check_in: ci, check_out: addDays(ci, nights), nights, total: q.total, deposit: q.deposit, paid, status, source, note, created_at: new Date().toISOString() });
  }
  db.blocks.push({ id: db.nextId++, unit_id: unitBy('C').id, start_date: addDays(t, 4), end_date: addDays(t, 6), reason: 'Aircon service' });
  save();
}

function unitBy(code) { return db.units.find(u => u.code === code); }
function unitOut(u) {
  return {
    id: u.id, code: u.code, name: u.name, tagline: u.tagline, sleeps: u.sleeps, bedrooms: u.bedrooms,
    bathrooms: u.bathrooms, sizeSqft: u.size_sqft, priceWeekday: u.price_weekday, priceWeekend: u.price_weekend,
    cleaningFee: u.cleaning_fee, minNightsWeekend: u.min_nights_weekend,
    beds: u.beds, amenities: u.amenities, photos: u.photos
  };
}
const unitsSorted = () => [...db.units].sort((a, b) => a.code.localeCompare(b.code));

function quote(u, checkIn, checkOut) {
  const nights = nightsBetween(checkIn, checkOut);
  const lines = [];
  let weekday = 0, weekend = 0;
  for (let i = 0; i < nights; i++) (isWeekendNight(addDays(checkIn, i)) ? weekend++ : weekday++);
  if (weekday) lines.push({ label: `${weekday} weekday night${weekday > 1 ? 's' : ''} × RM${u.price_weekday}`, amount: weekday * u.price_weekday });
  if (weekend) lines.push({ label: `${weekend} weekend night${weekend > 1 ? 's' : ''} × RM${u.price_weekend}`, amount: weekend * u.price_weekend });
  lines.push({ label: 'Cleaning', amount: u.cleaning_fee });
  const total = lines.reduce((s, l) => s + l.amount, 0);
  return { nights, weekday, weekend, lines, total, deposit: Math.ceil(total * DEPOSIT_RATE) };
}

const ACTIVE = ['pending', 'confirmed', 'checked_in'];
function clashes(unitId, checkIn, checkOut, ignoreId = 0) {
  return db.bookings.some(b => b.unit_id === unitId && b.id !== ignoreId && ACTIVE.includes(b.status) && b.check_in < checkOut && b.check_out > checkIn)
    || db.blocks.some(k => k.unit_id === unitId && k.start_date < checkOut && k.end_date > checkIn);
}

function takenNights(unitId, from, to) {
  const set = new Set();
  const rows = [
    ...db.bookings.filter(b => b.unit_id === unitId && ACTIVE.includes(b.status) && b.check_in < to && b.check_out > from).map(b => ({ s: b.check_in, e: b.check_out })),
    ...db.blocks.filter(k => k.unit_id === unitId && k.start_date < to && k.end_date > from).map(k => ({ s: k.start_date, e: k.end_date }))
  ];
  for (const r of rows) for (let d = r.s; d < r.e; d = addDays(d, 1)) if (d >= from && d < to) set.add(d);
  return [...set].sort();
}

function validateStay(u, checkIn, checkOut, adults, kids) {
  if (!parseDate(checkIn) || !parseDate(checkOut)) return 'Pick a check-in and a check-out date.';
  if (checkIn < todayStr()) return 'Check-in cannot be in the past.';
  const n = nightsBetween(checkIn, checkOut);
  if (n < 1) return 'Check-out must be after check-in.';
  if (n > 30) return 'For stays longer than 30 nights, message us on WhatsApp.';
  if (checkIn > addDays(todayStr(), 365)) return 'We take bookings up to one year ahead.';
  if (!Number.isInteger(adults) || adults < 1) return 'At least one adult is needed.';
  if (!Number.isInteger(kids) || kids < 0) return 'Number of kids is not valid.';
  if (adults + kids > u.sleeps) return `${u.name} sleeps ${u.sleeps}. Pick a bigger unit or fewer guests.`;
  let hasWeekend = false;
  for (let i = 0; i < n; i++) if (isWeekendNight(addDays(checkIn, i))) hasWeekend = true;
  if (hasWeekend && n < u.min_nights_weekend) return `${u.name} needs at least ${u.min_nights_weekend} nights when the stay includes a Friday or Saturday night.`;
  return '';
}

// ---------- owner login (demo only: kept in this tab, not a real lock) ----------
let adminUntil = 0;
function isAdmin() { try { adminUntil = Math.max(adminUntil, Number(sessionStorage.getItem('ts_admin') || 0)); } catch {} return adminUntil > Date.now(); }
const tries = { n: 0, until: 0 };

function bookingOut(b) {
  const u = db.units.find(x => x.id === b.unit_id);
  return {
    id: b.id, ref: b.ref, unitId: b.unit_id, unitCode: u.code, unitName: u.name, guestName: b.guest_name,
    phone: b.phone, email: b.email, adults: b.adults, kids: b.kids, checkIn: b.check_in, checkOut: b.check_out,
    nights: b.nights, total: b.total, deposit: b.deposit, paid: b.paid, status: b.status, source: b.source,
    note: b.note, createdAt: b.created_at
  };
}
const byCheckIn = (a, b) => a.check_in < b.check_in ? -1 : a.check_in > b.check_in ? 1 : 0;

function cleanGuest(body) {
  const name = String(body.guestName || '').trim().slice(0, 80);
  const phone = String(body.phone || '').replace(/[^\d+]/g, '').slice(0, 16);
  const email = String(body.email || '').trim().slice(0, 120);
  const note = String(body.note || '').trim().slice(0, 300);
  if (name.length < 2) return { error: 'Please write your name.' };
  if (!/^\+?\d{9,15}$/.test(phone)) return { error: 'Please write a phone number we can WhatsApp, e.g. 012 345 6789.' };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: 'That email does not look right.' };
  return { name, phone, email, note };
}

function createBooking(body, source, initialStatus) {
  const u = unitBy(String(body.unit || ''));
  if (!u) return [400, { error: 'Pick a unit.' }];
  const adults = Number(body.adults), kids = Number(body.kids || 0);
  const err = validateStay(u, body.checkIn, body.checkOut, adults, kids);
  if (err) return [400, { error: err }];
  const g = cleanGuest(body);
  if (g.error) return [400, { error: g.error }];
  if (clashes(u.id, body.checkIn, body.checkOut)) return [409, { error: `Sorry, ${u.name} was just booked for some of those nights. Pick other dates or another unit.` }];
  const q = quote(u, body.checkIn, body.checkOut);
  const ref = newRef();
  db.bookings.push({ id: db.nextId++, ref, unit_id: u.id, guest_name: g.name, phone: g.phone, email: g.email, adults, kids, check_in: body.checkIn, check_out: body.checkOut, nights: q.nights, total: q.total, deposit: q.deposit, paid: 0, status: initialStatus, source, note: g.note, created_at: new Date().toISOString() });
  save();
  return [201, { ref, unit: u.name, checkIn: body.checkIn, checkOut: body.checkOut, nights: q.nights, total: q.total, deposit: q.deposit }];
}

// ---------- routes ----------
function route(method, p, qs, body) {
  if (method === 'GET' && p === '/api/units') return [200, unitsSorted().map(unitOut)];
  if (method === 'GET' && p === '/api/availability') {
    const from = qs.get('from'), to = qs.get('to');
    if (!parseDate(from) || !parseDate(to) || to <= from || nightsBetween(from, to) > 400) return [400, { error: 'Bad date range' }];
    const out = {};
    for (const u of db.units) out[u.code] = takenNights(u.id, from, to);
    return [200, { from, to, today: todayStr(), taken: out }];
  }
  if (method === 'GET' && p === '/api/quote') {
    const u = unitBy(qs.get('unit') || '');
    if (!u) return [404, { error: 'Unit not found' }];
    const ci = qs.get('checkIn'), co = qs.get('checkOut');
    const adults = Number(qs.get('adults') || 1), kids = Number(qs.get('kids') || 0);
    const err = validateStay(u, ci, co, adults, kids);
    if (err) return [200, { ok: false, error: err }];
    if (clashes(u.id, ci, co)) return [200, { ok: false, error: `${u.name} is taken on some of those nights.` }];
    return [200, { ok: true, ...quote(u, ci, co) }];
  }
  if (method === 'POST' && p === '/api/bookings') {
    if (!body) return [400, { error: 'Bad request' }];
    return createBooking(body, 'website', 'pending');
  }

  if (method === 'POST' && p === '/api/admin/login') {
    if (tries.until > Date.now()) return [429, { error: 'Too many tries. Wait 5 minutes.' }];
    if (String(body?.password || '') !== ADMIN_PASSWORD) {
      tries.n++; if (tries.n >= 5) { tries.until = Date.now() + 5 * 60 * 1000; tries.n = 0; }
      return [401, { error: 'Wrong password.' }];
    }
    tries.n = 0;
    adminUntil = Date.now() + 12 * 3600 * 1000;
    try { sessionStorage.setItem('ts_admin', String(adminUntil)); } catch {}
    return [200, { ok: true }];
  }
  if (method === 'POST' && p === '/api/admin/logout') {
    adminUntil = 0;
    try { sessionStorage.removeItem('ts_admin'); } catch {}
    return [200, { ok: true }];
  }
  if (!p.startsWith('/api/admin/')) return [404, { error: 'Not found' }];
  if (!isAdmin()) return [401, { error: 'Please log in.' }];

  if (method === 'GET' && p === '/api/admin/today') {
    const t = todayStr();
    const all = db.bookings.filter(b => b.status !== 'cancelled' && b.check_out >= t).sort(byCheckIn).map(bookingOut);
    const weekEnd = addDays(t, 7);
    return [200, {
      today: t,
      arriving: all.filter(b => b.checkIn === t && b.status !== 'checked_in' && b.status !== 'checked_out'),
      leaving: all.filter(b => b.checkOut === t && b.status === 'checked_in'),
      staying: all.filter(b => b.status === 'checked_in'),
      waitingDeposit: all.filter(b => b.status === 'pending'),
      owing: all.filter(b => b.status !== 'pending' && b.status !== 'checked_out' && b.paid < b.total && b.checkIn <= addDays(t, 3)),
      next7: all.filter(b => b.checkIn > t && b.checkIn <= weekEnd),
      units: unitsSorted().map(u => ({ code: u.code, name: u.name, busyTonight: takenNights(u.id, t, addDays(t, 1)).length > 0 })),
      monthIncome: db.bookings.filter(b => b.status !== 'cancelled' && b.check_in.slice(0, 7) === t.slice(0, 7)).reduce((s, b) => s + b.paid, 0)
    }];
  }
  if (method === 'GET' && p === '/api/admin/bookings') {
    const status = qs.get('status') || '';
    const q = (qs.get('q') || '').trim().toLowerCase();
    let rows = db.bookings;
    if (status === 'upcoming') { const t = todayStr(); rows = rows.filter(b => ACTIVE.includes(b.status) && b.check_out >= t); }
    else if (status) rows = rows.filter(b => b.status === status);
    if (q) rows = rows.filter(b => [b.guest_name, b.phone, b.ref].some(v => v.toLowerCase().includes(q)));
    rows = [...rows].sort(byCheckIn);
    if (status !== 'upcoming') rows.reverse();
    return [200, rows.slice(0, 300).map(bookingOut)];
  }
  if (method === 'POST' && p === '/api/admin/bookings') {
    if (!body) return [400, { error: 'Bad request' }];
    return createBooking(body, body.source === 'walkin' ? 'walkin' : 'whatsapp', 'pending');
  }
  let m = /^\/api\/admin\/bookings\/(\d+)$/.exec(p);
  if (m && method === 'PATCH') {
    const b = db.bookings.find(x => x.id === Number(m[1]));
    if (!b) return [404, { error: 'Booking not found' }];
    if (!body) return [400, { error: 'Bad request' }];
    const flow = { pending: ['confirmed', 'cancelled'], confirmed: ['checked_in', 'cancelled'], checked_in: ['checked_out'], checked_out: [], cancelled: [] };
    let status = b.status, paid = b.paid, note = b.note;
    if (body.status !== undefined && body.status !== b.status) {
      if (!flow[b.status].includes(body.status)) return [400, { error: `Cannot move a ${b.status.replace('_', ' ')} booking to ${String(body.status).replace('_', ' ')}.` }];
      status = body.status;
      if (status === 'confirmed' && paid < b.deposit) paid = b.deposit;
      if (status === 'checked_out' && paid < b.total) return [400, { error: `Guest still owes RM${b.total - paid}. Record the payment first.` }];
    }
    if (body.paid !== undefined) {
      const v = Number(body.paid);
      if (!Number.isInteger(v) || v < 0 || v > b.total) return [400, { error: `Paid amount must be between RM0 and RM${b.total}.` }];
      paid = v;
    }
    if (body.note !== undefined) note = String(body.note).slice(0, 300);
    Object.assign(b, { status, paid, note });
    save();
    return [200, bookingOut(b)];
  }
  if (method === 'GET' && p === '/api/admin/calendar') {
    const from = qs.get('from'); const days = Math.min(Number(qs.get('days') || 14), 62);
    if (!parseDate(from)) return [400, { error: 'Bad date' }];
    const to = addDays(from, days);
    const bookings = db.bookings.filter(b => b.status !== 'cancelled' && b.check_in < to && b.check_out > from).map(bookingOut);
    const blocks = db.blocks.filter(k => k.start_date < to && k.end_date > from).sort((a, b) => a.start_date < b.start_date ? -1 : 1);
    return [200, { from, to, today: todayStr(), units: unitsSorted().map(unitOut), bookings, blocks }];
  }
  if (method === 'POST' && p === '/api/admin/blocks') {
    const u = body && unitBy(String(body.unit || ''));
    if (!u) return [400, { error: 'Pick a unit.' }];
    if (!parseDate(body.start) || !parseDate(body.end) || body.end <= body.start) return [400, { error: 'End date must be after start date.' }];
    if (clashes(u.id, body.start, body.end)) return [409, { error: 'Those dates already have a booking or a block.' }];
    const id = db.nextId++;
    db.blocks.push({ id, unit_id: u.id, start_date: body.start, end_date: body.end, reason: String(body.reason || '').slice(0, 80) });
    save();
    return [201, { id }];
  }
  m = /^\/api\/admin\/blocks\/(\d+)$/.exec(p);
  if (m && method === 'DELETE') {
    db.blocks = db.blocks.filter(k => k.id !== Number(m[1]));
    save();
    return [200, { ok: true }];
  }
  m = /^\/api\/admin\/units\/([A-Z])$/.exec(p);
  if (m && method === 'PATCH') {
    const u = unitBy(m[1]);
    if (!u) return [404, { error: 'Unit not found' }];
    const keys = { price_weekday: 'priceWeekday', price_weekend: 'priceWeekend', cleaning_fee: 'cleaningFee', min_nights_weekend: 'minNightsWeekend' };
    const vals = {};
    for (const f in keys) {
      const v = body?.[keys[f]] === undefined ? u[f] : Number(body[keys[f]]);
      if (!Number.isInteger(v) || v < 0 || v > 20000) return [400, { error: 'Prices must be whole ringgit between 0 and 20,000.' }];
      vals[f] = v;
    }
    if (vals.min_nights_weekend < 1 || vals.min_nights_weekend > 7) return [400, { error: 'Weekend minimum must be 1 to 7 nights.' }];
    Object.assign(u, vals);
    save();
    return [200, unitOut(u)];
  }
  return [404, { error: 'Not found' }];
}

const realFetch = window.fetch.bind(window);
window.fetch = async (input, init = {}) => {
  const url = typeof input === 'string' ? input : input.url;
  if (!url.startsWith('/api/')) return realFetch(input, init);
  const u = new URL(url, 'http://x');
  let body = null;
  try { body = init.body ? JSON.parse(init.body) : null; } catch {}
  const [status, out] = route((init.method || 'GET').toUpperCase(), u.pathname, u.searchParams, body);
  return new Response(JSON.stringify(out), { status, headers: { 'Content-Type': 'application/json' } });
};
})();

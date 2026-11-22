// Builds the eight pages of the Safar Raudhah Travel demo (a made-up umrah agency) from one layout,
// so the nav, footer, WhatsApp button and both languages stay identical everywhere.
// Run:  node _build.mjs   (in this folder; writes the .html files beside it)
// Every text is written once as t(tag, 'Bahasa Melayu', 'English'); app.js swaps them.
// Prices, dates, seats, people, the licence number and the reviews are samples, and the pages say so.
import { writeFileSync } from 'node:fs';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const t = (tag, ms, en, attrs = '') => `<${tag}${attrs ? ' ' + attrs : ''} data-en="${esc(en)}">${ms}</${tag}>`;

const PAGES = [
  ['pakej.html', 'Pakej', 'Packages'],
  ['tarikh.html', 'Tarikh berlepas', 'Departure dates'],
  ['tentang.html', 'Tentang kami', 'About'],
  ['hubungi.html', 'Hubungi', 'Contact'],
];

const PACKS = [
  { key: 'ekonomi', file: 'pakej-ekonomi.html', name: ['Pakej Ekonomi', 'Economy Package'], price: 'RM6,990', days: ['12 hari 10 malam', '12 days 10 nights'],
    makkah: ['800 m dari Masjidil Haram', '800 m from Masjidil Haram'], madinah: ['400 m dari Masjid Nabawi', '400 m from Masjid Nabawi'], room: ['Berempat sebilik', 'Four to a room'],
    line: ['Untuk yang nak tunaikan umrah dengan bajet yang terkawal.', 'For those who want to perform umrah on a careful budget.'] },
  { key: 'selesa', file: 'pakej-selesa.html', dark: true, name: ['Pakej Selesa', 'Comfort Package'], price: 'RM8,490', days: ['12 hari 10 malam', '12 days 10 nights'],
    makkah: ['350 m dari Masjidil Haram', '350 m from Masjidil Haram'], madinah: ['200 m dari Masjid Nabawi', '200 m from Masjid Nabawi'], room: ['Bertiga sebilik', 'Three to a room'],
    line: ['Paling ramai pilih. Hotel dekat, jalan kaki lima minit.', 'The most chosen. A close hotel, a five minute walk.'] },
  { key: 'premium', file: 'pakej-premium.html', name: ['Pakej Premium', 'Premium Package'], price: 'RM11,900', days: ['14 hari 12 malam', '14 days 12 nights'],
    makkah: ['100 m dari Masjidil Haram', '100 m from Masjidil Haram'], madinah: ['100 m dari Masjid Nabawi', '100 m from Masjid Nabawi'], room: ['Berdua sebilik', 'Two to a room'],
    line: ['Untuk warga emas dan keluarga yang nak paling dekat.', 'For the elderly and families who want to be closest.'] },
];

const DATES = [
  ['14 Januari 2027', '14 January 2027', 12], ['11 Februari 2027', '11 February 2027', 4], ['18 Mac 2027', '18 March 2027', 21],
  ['15 April 2027', '15 April 2027', 9], ['22 Julai 2027', '22 July 2027', 30], ['19 Ogos 2027', '19 August 2027', 26],
];

const INCLUDED = [
  ['Tiket penerbangan pergi balik dari KLIA', 'Return flights from KLIA'], ['Visa umrah', 'Umrah visa'], ['Hotel di Makkah dan Madinah', 'Hotels in Makkah and Madinah'],
  ['Makan tiga kali sehari', 'Three meals a day'], ['Bas berhawa dingin', 'Air-conditioned coach'], ['Mutawwif sepanjang perjalanan', 'A mutawwif for the whole journey'],
  ['Ziarah di Makkah dan Madinah', 'Ziarah in Makkah and Madinah'], ['Kursus umrah sebelum berlepas', 'An umrah course before departure'],
];
const EXCLUDED = [
  ['Perbelanjaan peribadi', 'Personal spending'], ['Bayaran dam, kalau ada', 'Dam payment, if any'], ['Suntikan vaksin', 'Vaccination'], ['Lebihan bagasi', 'Excess baggage'],
];

const ITINERARY = [
  ['Hari 1', 'Day 1', 'Berlepas dari KLIA', 'Depart from KLIA', 'Berkumpul tiga jam awal. Petugas kami ada di kaunter untuk urus bagasi dan boarding pass.', 'Gather three hours early. Our staff are at the counter to handle baggage and boarding passes.'],
  ['Hari 2 hingga 4', 'Day 2 to 4', 'Madinah', 'Madinah', 'Solat di Masjid Nabawi, ziarah Raudhah ikut slot, Masjid Quba dan Jabal Uhud.', 'Prayers at Masjid Nabawi, a visit to Raudhah by slot, Masjid Quba and Jabal Uhud.'],
  ['Hari 5', 'Day 5', 'Ke Makkah, umrah pertama', 'To Makkah, the first umrah', 'Niat ihram di miqat Bir Ali. Sampai Makkah, tawaf dan saie bersama mutawwif.', 'Enter ihram at the miqat of Bir Ali. On arrival in Makkah, tawaf and saie with the mutawwif.'],
  ['Hari 6 hingga 10', 'Day 6 to 10', 'Makkah', 'Makkah', 'Ibadah di Masjidil Haram, ziarah Jabal Nur, Arafah dan Mina, dan umrah kedua.', 'Worship at Masjidil Haram, ziarah to Jabal Nur, Arafah and Mina, and a second umrah.'],
  ['Hari 11', 'Day 11', 'Tawaf wada', 'Farewell tawaf', 'Tawaf wada, kemudian bas ke lapangan terbang.', 'The farewell tawaf, then the coach to the airport.'],
  ['Hari 12', 'Day 12', 'Tiba di KLIA', 'Arrive at KLIA', 'Selamat pulang ke tanah air.', 'Home safely.'],
];

const FAQ = [
  [['Berapa deposit untuk tempah?', 'How much is the deposit to book?'], ['RM1,000 seorang. Baki dijelaskan 45 hari sebelum berlepas.', 'RM1,000 per person. The balance is settled 45 days before departure.']],
  [['Boleh bayar ansuran?', 'Can I pay in instalments?'], ['Boleh. Bayar bulanan tanpa caj tambahan, asalkan selesai 45 hari sebelum berlepas.', 'Yes. Pay monthly with no extra charge, as long as it is settled 45 days before departure.']],
  [['Kalau saya batal, deposit dipulangkan?', 'If I cancel, is the deposit returned?'], ['Lebih 60 hari sebelum berlepas, deposit dipulangkan penuh. Selepas tu, ikut kos yang dah dibayar untuk tiket dan visa.', 'More than 60 days before departure, the deposit is returned in full. After that, it depends on what has already been paid for tickets and the visa.']],
  [['Boleh bawa warga emas atau pengguna kerusi roda?', 'Can I bring an elderly person or a wheelchair user?'], ['Boleh. Beritahu masa tempah supaya kami sediakan kerusi roda dan bilik di tingkat rendah.', 'Yes. Tell us when you book so we arrange a wheelchair and a room on a low floor.']],
  [['Apa dokumen yang perlu?', 'Which documents are needed?'], ['Pasport yang sah sekurang-kurangnya enam bulan, gambar pasport dan kad vaksin meningokokal.', 'A passport valid for at least six months, a passport photo and a meningococcal vaccination card.']],
];

const REVIEWS = [
  [['Mak saya 72 tahun. Mutawwif tolak kerusi roda mak setiap kali tawaf. Saya tak perlu risau langsung.', 'My mother is 72. The mutawwif pushed her wheelchair for every tawaf. I did not have to worry at all.'], 'Farah', ['Pakej Premium', 'Premium Package']],
  [['Hotel betul-betul lima minit jalan kaki, macam yang dijanjikan.', 'The hotel really was a five minute walk, as promised.'], 'Encik Razak', ['Pakej Selesa', 'Comfort Package']],
  [['Bayar ansuran sepuluh bulan. Tak ada caj tersembunyi sampai hari berlepas.', 'I paid in instalments over ten months. No hidden charge up to the day we left.'], 'Nurul', ['Pakej Ekonomi', 'Economy Package']],
];

const MARK = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 20V10l8-6 8 6v10"/><path d="M9 20v-6h6v6"/></svg>';
const WA_ICON = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 20.5l1.3-4.6A8.3 8.3 0 1 1 8.2 19.3z"/><path d="M9 8.6c.3 2.7 2.6 5.2 5.6 6l1.3-1.3-2-1.1-.9.8c-.9-.5-1.7-1.3-2.2-2.2l.8-.9-1.1-2z"/></svg>';

const packCard = (p, h = 'h3') => `<li class="pack${p.dark ? ' pack--dark' : ''}" data-pack="${p.key}">
          ${t(h, p.name[0], p.name[1])}
          ${t('p', p.line[0], p.line[1])}
          <p class="pack__price">${t('small', 'dari, seorang', 'from, per person')}${p.price}</p>
          <dl class="facts">
            <div>${t('dt', 'Tempoh', 'Length')}${t('dd', p.days[0], p.days[1])}</div>
            <div>${t('dt', 'Hotel Makkah', 'Makkah hotel')}${t('dd', p.makkah[0], p.makkah[1])}</div>
            <div>${t('dt', 'Hotel Madinah', 'Madinah hotel')}${t('dd', p.madinah[0], p.madinah[1])}</div>
            <div>${t('dt', 'Bilik', 'Room')}${t('dd', p.room[0], p.room[1])}</div>
          </dl>
          ${t('a', 'Tengok pakej ni', 'See this package', `class="btn btn--main" href="${p.file}"`)}
        </li>`;

const datesTable = (limit) => `<div class="dates-wrap">
        <table class="dates">
          <thead><tr>${t('th', 'Tarikh berlepas', 'Departure date', 'scope="col"')}${t('th', 'Dari', 'From', 'scope="col"')}${t('th', 'Tempat kosong', 'Seats left', 'scope="col"')}<th scope="col"><span class="vh"></span></th></tr></thead>
          <tbody>
            ${DATES.slice(0, limit).map(([ms, en, seats]) => `<tr>${t('td', ms, en)}<td>KLIA</td><td class="dates__seats${seats < 10 ? ' is-low' : ''}">${seats}</td><td>${t('a', 'Tempah tarikh ni', 'Book this date', `class="btn btn--line btn--sm" href="hubungi.html?tarikh=${encodeURIComponent(ms)}#tempah"`)}</td></tr>`).join('\n            ')}
          </tbody>
        </table>
      </div>
      ${t('p', 'Tarikh dan tempat kosong ni contoh sahaja.', 'These dates and seat counts are samples only.', 'class="note" style="margin-top: var(--s-lg)"')}`;

const faq = () => `  <section class="section" id="soalan">
    <div class="container faq">
      ${t('h2', 'Soalan yang selalu ditanya', 'Questions we hear first')}
      <div>
        ${FAQ.map(([q, a]) => `<details>${t('summary', q[0], q[1])}${t('p', a[0], a[1])}</details>`).join('\n        ')}
      </div>
    </div>
  </section>`;

const booking = () => `  <section class="section section--tint" id="tempah">
    <div class="container book">
      <div>
        ${t('h2', 'Tempah tempat anda', 'Book your place')}
        ${t('p', 'Isi borang ni. Kami hubungi anda di WhatsApp untuk sahkan tarikh dan deposit.', 'Fill in this form. We contact you on WhatsApp to confirm the date and the deposit.', 'class="lead" style="margin-top: var(--s-lg)"')}
      </div>
      <form class="form" data-demo novalidate>
        <div class="form__two">
          <div>${t('label', 'Pakej', 'Package', 'for="pakej"')}<select id="pakej" name="pakej">${PACKS.map(p => t('option', p.name[0], p.name[1])).join('')}</select></div>
          <div>${t('label', 'Tarikh berlepas', 'Departure date', 'for="tarikh"')}<select id="tarikh" name="tarikh">${DATES.map(([ms, en]) => t('option', ms, en, `value="${esc(ms)}"`)).join('')}</select></div>
        </div>
        <div>${t('label', 'Bilangan jemaah', 'Number of pilgrims', 'for="jemaah"')}<select id="jemaah" name="jemaah"><option>1</option><option>2</option><option>3</option><option>4</option>${t('option', '5 atau lebih', '5 or more')}</select></div>
        <div class="form__two">
          <div>${t('label', 'Nama anda', 'Your name', 'for="nama"')}<input id="nama" name="nama" type="text" autocomplete="name" required></div>
          <div>${t('label', 'Nombor WhatsApp', 'WhatsApp number', 'for="telefon"')}<input id="telefon" name="telefon" type="tel" inputmode="tel" autocomplete="tel" required></div>
        </div>
        <div class="form__foot">
          ${t('button', 'Hantar tempahan', 'Send booking', 'class="btn btn--main" type="submit"')}
          <p class="form__help" id="form-help" aria-live="polite"></p>
        </div>
      </form>
    </div>
  </section>`;

function page({ file, title, desc, body, over = false }) {
  const nav = PAGES.map(([href, ms, en]) => `<li>${t('a', ms, en, `href="${href}"${href === file ? ' aria-current="page"' : ''}`)}</li>`).join('\n        ');
  return `<!doctype html>
<html lang="ms">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="noindex">
<link rel="stylesheet" href="style.css">
<style>.vh { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); }</style>
</head>
<body>
<a class="skip" href="#main">Terus ke kandungan</a>

<header class="nav${over ? ' nav--over' : ''}">
  <div class="container nav__in">
    <a class="nav__mark" href="index.html" aria-label="Safar Raudhah Travel, laman utama">${MARK}Safar Raudhah</a>
    <ul class="nav__links">
        ${nav}
    </ul>
    <button class="nav__lang" type="button" id="lang" aria-label="Switch to English">EN</button>
    ${t('a', 'Tempah', 'Book', 'class="btn btn--main btn--sm" href="hubungi.html#tempah"')}
    <details class="nav__menu">
      ${t('summary', 'Menu', 'Menu')}
      <ul>
        ${nav}
        <li>${t('a', 'Tempah tempat', 'Book a place', 'href="hubungi.html#tempah"')}</li>
      </ul>
    </details>
  </div>
</header>

<main id="main">
${body}
</main>

<footer class="foot">
  <div class="container">
    <div class="foot__cols">
      <div>
        <p class="foot__mark">Safar Raudhah Travel</p>
        ${t('p', 'Pakej umrah dari KLIA, dengan mutawwif dari mula sampai pulang.', 'Umrah packages from KLIA, with a mutawwif from start to home.', 'style="margin-top: var(--s-sm); max-width: 32ch"')}
      </div>
      <ul>
        ${PAGES.map(([href, ms, en]) => `<li>${t('a', ms, en, `href="${href}"`)}</li>`).join('\n        ')}
      </ul>
      <p>${t('b', 'Pejabat', 'Office')}Bangi, Selangor<br>013-555 0178<br>salam@safarraudhah.example<br>${t('span', 'Lesen KPK/LN 0000 (contoh)', 'Licence KPK/LN 0000 (sample)')}</p>
    </div>
    ${t('p', 'Demo oleh Bejaa Digital. Agensi, harga, tarikh, jemaah, lesen dan maklumat hubungan ni rekaan. Video: Yusuf Khan Afridi, Pexels.', 'A demo by Bejaa Digital. The agency, prices, dates, pilgrims, licence and contact details are made up. Video: Yusuf Khan Afridi, Pexels.', 'class="foot__note"')}
  </div>
</footer>

<details class="wa">
  <summary aria-label="WhatsApp">${WA_ICON}<span>WhatsApp</span></summary>
  ${t('p', 'Di website anda, butang ni buka chat WhatsApp dengan nombor anda, dari setiap page. Ini demo, jadi ia tak ke mana-mana.', 'On your website this button opens a WhatsApp chat with your number, from every page. This is a demo, so it goes nowhere.')}
</details>

<script src="app.js"></script>
</body>
</html>
`;
}

const head = (ms, en, leadMs, leadEn, extra = '') => `  <section class="page-head">
    <div class="container">
      ${t('h1', ms, en)}
      ${leadMs ? t('p', leadMs, leadEn, 'class="lead"') : ''}
      ${extra}
    </div>
  </section>`;

/* ── Home ── */
const home = `  <section class="hero">
    <div class="film">
      <video autoplay muted loop playsinline preload="metadata" poster="media/tawaf.jpg" aria-label="Jemaah bertawaf di sekeliling Kaabah">
        <source src="media/tawaf.mp4" type="video/mp4">
      </video>
      <span class="film__credit">Video: Yusuf Khan Afridi, Pexels</span>
      <button class="film__toggle" type="button" data-en="Pause video">Henti video</button>
    </div>
    <div class="container hero__in">
      ${t('h1', 'Umrah yang tenang, dari KLIA sampai pulang', 'A calm umrah, from KLIA to home')}
      ${t('p', 'Tiga pakej, hotel dekat dengan masjid, dan mutawwif yang ada dengan anda setiap hari.', 'Three packages, hotels close to the mosques, and a mutawwif with you every day.', 'class="lead"')}
      <div class="hero__acts">
        ${t('a', 'Lihat pakej', 'See the packages', 'class="btn btn--line" href="pakej.html"')}
        ${t('a', 'Tempah tempat', 'Book a place', 'class="btn btn--main" href="hubungi.html#tempah"')}
      </div>
    </div>
  </section>

  <section class="find">
    <div class="container">
      <form class="finder" id="finder">
        <div>${t('label', 'Bulan', 'Month', 'for="f-bulan"')}<select id="f-bulan" name="month">${DATES.map(([ms, en]) => t('option', ms.replace(/^\d+ /, ''), en.replace(/^\d+ /, ''))).join('')}</select></div>
        <div>${t('label', 'Jemaah', 'Pilgrims', 'for="f-jemaah"')}<select id="f-jemaah" name="people"><option>1</option><option>2</option><option>3</option><option>4</option>${t('option', '5 atau lebih', '5 or more')}</select></div>
        <div>${t('label', 'Bajet seorang', 'Budget per person', 'for="f-bajet"')}<select id="f-bajet" name="budget">${t('option', 'Bawah RM7,500', 'Under RM7,500', 'value="ekonomi"')}${t('option', 'RM7,500 hingga RM10,000', 'RM7,500 to RM10,000', 'value="selesa" selected')}${t('option', 'Lebih RM10,000', 'Over RM10,000', 'value="premium"')}</select></div>
        ${t('button', 'Cari pakej', 'Find a package', 'class="btn btn--main" type="submit"')}
        <p class="finder__say" id="finder-say" aria-live="polite"></p>
      </form>
      <ul class="strip">
        <li><b>100 m</b>${t('span', 'hotel paling dekat dengan Masjidil Haram', 'our closest hotel to Masjidil Haram')}</li>
        <li><b>1 : 40</b>${t('span', 'seorang mutawwif untuk setiap 40 jemaah', 'one mutawwif for every 40 pilgrims')}</li>
        <li><b>RM1,000</b>${t('span', 'deposit untuk tempah tempat', 'deposit to book a place')}</li>
        <li><b>0%</b>${t('span', 'caj tambahan untuk ansuran', 'extra charge for instalments')}</li>
      </ul>
    </div>
  </section>

  <section class="section section--tint" id="pakej">
    <div class="container">
      <div class="head">
        ${t('h2', 'Tiga pakej, satu perbezaan: jarak hotel', 'Three packages, one difference: how far the hotel is')}
        ${t('p', 'Harga contoh, seorang, termasuk tiket dan visa.', 'Sample prices, per person, flights and visa included.', 'class="note"')}
      </div>
      <ul class="packs">
        ${PACKS.map(p => packCard(p)).join('\n        ')}
      </ul>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="head">${t('h2', 'Tarikh berlepas terdekat', 'The next departures')}</div>
      ${datesTable(4)}
      <p style="margin-top: var(--s-lg)">${t('a', 'Tengok semua tarikh', 'See all dates', 'class="more" href="tarikh.html"')}</p>
    </div>
  </section>

  <section class="section section--tint">
    <div class="container">
      <div class="head">${t('h2', 'Tiga langkah sebelum berlepas', 'Three steps before you fly')}</div>
      <ol class="steps">
        <li>${t('h3', 'Pilih pakej dan tarikh', 'Pick a package and a date')}${t('p', 'Bayar deposit RM1,000 seorang untuk kunci tempat.', 'Pay the RM1,000 deposit per person to hold your place.')}</li>
        <li>${t('h3', 'Hantar dokumen', 'Send your documents')}${t('p', 'Pasport, gambar dan kad vaksin. Kami uruskan visa.', 'Passport, photo and vaccination card. We handle the visa.')}</li>
        <li>${t('h3', 'Hadir kursus umrah', 'Attend the umrah course')}${t('p', 'Sehari di Bangi, dua minggu sebelum berlepas.', 'One day in Bangi, two weeks before departure.')}</li>
      </ol>
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="head">${t('h2', 'Kata jemaah', 'What pilgrims said')}</div>
      <ul class="reviews">
        ${REVIEWS.map(([q, who, pack]) => `<li><blockquote>${t('p', q[0], q[1])}</blockquote><p class="note">${who}, <span data-en="${esc(pack[1])}">${pack[0]}</span></p></li>`).join('\n        ')}
      </ul>
      ${t('p', 'Contoh ulasan. Agensi ni demo, jadi jemaah ni rekaan.', 'Sample reviews. This agency is a demo, so these pilgrims are made up.', 'class="note" style="margin-top: var(--s-xl)"')}
    </div>
  </section>

${faq()}

${booking()}`;

/* ── Packages list ── */
const packages = `${head('Pakej umrah', 'Umrah packages', 'Tiga pakej. Yang berbeza ialah jarak hotel, bilangan orang sebilik dan tempoh.', 'Three packages. What differs is the hotel distance, how many share a room and the length.')}
  <section class="section" style="padding-top: 0">
    <div class="container">
      <ul class="packs">
        ${PACKS.map(p => packCard(p, 'h2')).join('\n        ')}
      </ul>
      ${t('p', 'Harga contoh, seorang, termasuk tiket dan visa.', 'Sample prices, per person, flights and visa included.', 'class="note" style="margin-top: var(--s-lg)"')}
    </div>
  </section>
  <section class="section section--tint">
    <div class="container">
      <div class="head">${t('h2', 'Semua pakej termasuk', 'Every package includes')}</div>
      <div class="two">
        <div>${t('h3', 'Termasuk', 'Included')}<ul class="ticks">${INCLUDED.map(x => t('li', x[0], x[1])).join('')}</ul></div>
        <div>${t('h3', 'Tidak termasuk', 'Not included')}<ul class="ticks ticks--no">${EXCLUDED.map(x => t('li', x[0], x[1])).join('')}</ul></div>
      </div>
    </div>
  </section>

${faq()}

${booking()}`;

/* ── One package ── */
const packPage = p => `${head(p.name[0], p.name[1], p.line[0], p.line[1], `<div class="page-head__price"><p class="pack__price">${t('small', 'dari, seorang', 'from, per person')}${p.price}</p>${t('a', 'Tempah pakej ni', 'Book this package', 'class="btn btn--main" href="hubungi.html#tempah"')}</div>`)}
  <section class="section" style="padding-top: 0">
    <div class="container">
      <dl class="facts facts--wide">
        <div>${t('dt', 'Tempoh', 'Length')}${t('dd', p.days[0], p.days[1])}</div>
        <div>${t('dt', 'Hotel Makkah', 'Makkah hotel')}${t('dd', p.makkah[0], p.makkah[1])}</div>
        <div>${t('dt', 'Hotel Madinah', 'Madinah hotel')}${t('dd', p.madinah[0], p.madinah[1])}</div>
        <div>${t('dt', 'Bilik', 'Room')}${t('dd', p.room[0], p.room[1])}</div>
        <div>${t('dt', 'Penerbangan', 'Flight')}${t('dd', 'Terus dari KLIA', 'Direct from KLIA')}</div>
        <div>${t('dt', 'Deposit', 'Deposit')}${t('dd', 'RM1,000 seorang', 'RM1,000 per person')}</div>
      </dl>
    </div>
  </section>
  <section class="section section--tint">
    <div class="container">
      <div class="head">${t('h2', 'Jadual perjalanan', 'The itinerary')}</div>
      <ol class="days">
        ${ITINERARY.map(([dm, de, tm, te, pm, pe]) => `<li><span class="days__n" data-en="${esc(de)}">${dm}</span><div>${t('h3', tm, te)}${t('p', pm, pe)}</div></li>`).join('\n        ')}
      </ol>
      ${t('p', p.key === 'premium' ? 'Pakej Premium ada dua hari tambahan di Makkah.' : 'Jadual boleh berubah ikut penerbangan dan slot Raudhah.', p.key === 'premium' ? 'The Premium Package adds two more days in Makkah.' : 'The schedule can change with flights and Raudhah slots.', 'class="note" style="margin-top: var(--s-lg)"')}
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="two">
        <div>${t('h2', 'Termasuk', 'Included')}<ul class="ticks">${INCLUDED.map(x => t('li', x[0], x[1])).join('')}</ul></div>
        <div>${t('h2', 'Tidak termasuk', 'Not included')}<ul class="ticks ticks--no">${EXCLUDED.map(x => t('li', x[0], x[1])).join('')}</ul></div>
      </div>
    </div>
  </section>
  <section class="section section--tint">
    <div class="container">
      <div class="head">${t('h2', 'Tarikh untuk pakej ni', 'Dates for this package')}</div>
      ${datesTable(6)}
    </div>
  </section>

${booking()}`;

/* ── Dates ── */
const dates = `${head('Tarikh berlepas', 'Departure dates', 'Semua penerbangan dari KLIA. Tempat kosong dikemas kini setiap minggu.', 'All flights leave from KLIA. Seats left are updated every week.')}
  <section class="section" style="padding-top: 0">
    <div class="container">
      ${datesTable(6)}
    </div>
  </section>
  <section class="section section--tint">
    <div class="container">
      <div class="head">${t('h2', 'Apa yang perlu disediakan', 'What to prepare')}</div>
      <ul class="ticks" style="max-width: 46rem">
        ${t('li', 'Pasport yang sah sekurang-kurangnya enam bulan dari tarikh berlepas', 'A passport valid for at least six months from the departure date')}
        ${t('li', 'Kad vaksin meningokokal', 'A meningococcal vaccination card')}
        ${t('li', 'Dua keping gambar pasport berlatar putih', 'Two passport photos on a white background')}
        ${t('li', 'Deposit RM1,000 seorang', 'The RM1,000 deposit per person')}
        ${t('li', 'Baki bayaran 45 hari sebelum berlepas', 'The balance 45 days before departure')}
      </ul>
    </div>
  </section>

${faq()}

${booking()}`;

/* ── About ── */
const about = `${head('Tentang kami', 'About us', 'Agensi kecil yang bawa jemaah dalam kumpulan 40 orang, bukan 200.', 'A small agency that takes pilgrims in groups of 40, not 200.')}
  <section class="section" style="padding-top: 0">
    <div class="container split">
      <img src="media/tawaf-2.jpg" width="1280" height="720" alt="Jemaah di dataran Masjidil Haram" loading="lazy">
      <div>
        ${t('h2', 'Kenapa kumpulan kecil', 'Why small groups')}
        ${t('p', 'Dalam kumpulan besar, mutawwif tak sempat jawab soalan semua orang. Kami hadkan setiap bas kepada 40 jemaah supaya yang pertama kali pergi pun tak rasa tertinggal.', 'In a large group the mutawwif cannot answer everyone. We keep each coach to 40 pilgrims so that even a first-timer does not feel left behind.')}
        ${t('p', 'Kami pilih hotel dulu, baru tetapkan harga. Jarak yang ditulis dalam pakej ialah jarak berjalan kaki yang kami ukur sendiri.', 'We choose the hotel first, then set the price. The distance written in a package is the walking distance we measured ourselves.')}
      </div>
    </div>
  </section>
  <section class="section section--tint">
    <div class="container">
      <div class="head">${t('h2', 'Siapa yang bawa anda', 'Who takes you')}</div>
      <ul class="team">
        <li><h3>Ustaz Hafiz</h3>${t('p', 'Mutawwif', 'Mutawwif', 'class="team__role"')}${t('p', 'Pimpin tawaf dan saie, dan beri tazkirah ringkas setiap malam.', 'Leads the tawaf and saie, and gives a short talk every night.')}</li>
        <li><h3>Ustazah Maryam</h3>${t('p', 'Mutawwifah', 'Mutawwifah', 'class="team__role"')}${t('p', 'Bimbing jemaah wanita, termasuk di Raudhah.', 'Guides the women pilgrims, including at Raudhah.')}</li>
        <li><h3>Cik Aisyah</h3>${t('p', 'Urusan tempahan', 'Bookings', 'class="team__role"')}${t('p', 'Yang balas WhatsApp anda, dari deposit sampai visa.', 'The one who answers your WhatsApp, from deposit to visa.')}</li>
      </ul>
      ${t('p', 'Agensi ni demo, jadi pasukan ni rekaan.', 'This agency is a demo, so the team is made up.', 'class="note" style="margin-top: var(--s-xl)"')}
    </div>
  </section>
  <section class="section">
    <div class="container">
      <div class="head">${t('h2', 'Lesen dan pendaftaran', 'Licence and registration')}</div>
      <dl class="facts facts--wide">
        <div>${t('dt', 'Lesen agensi pelancongan', 'Travel agency licence')}${t('dd', 'KPK/LN 0000 (contoh)', 'KPK/LN 0000 (sample)')}</div>
        <div>${t('dt', 'Pejabat', 'Office')}<dd>Bangi, Selangor</dd></div>
        <div>${t('dt', 'Waktu', 'Hours')}${t('dd', 'Isnin hingga Sabtu, 9 pagi hingga 6 petang', 'Monday to Saturday, 9am to 6pm')}</div>
      </dl>
      ${t('p', 'Di website sebenar, bahagian ni tunjuk nombor lesen anda supaya pelanggan boleh semak.', 'On a real website this part shows your licence number so customers can check it.', 'class="note" style="margin-top: var(--s-lg)"')}
    </div>
  </section>

${booking()}`;

/* ── Contact ── */
const contact = `${head('Hubungi', 'Contact', 'Tempah tempat, atau tanya soalan dulu.', 'Book a place, or ask a question first.')}
${booking()}
  <section class="section">
    <div class="container">
      <dl class="facts facts--wide">
        <div><dt>WhatsApp</dt><dd>013-555 0178</dd></div>
        <div>${t('dt', 'Telefon', 'Phone')}<dd>03-5555 0178</dd></div>
        <div>${t('dt', 'Emel', 'Email')}<dd>salam@safarraudhah.example</dd></div>
        <div>${t('dt', 'Waktu', 'Hours')}${t('dd', 'Isnin hingga Sabtu, 9 pagi hingga 6 petang', 'Monday to Saturday, 9am to 6pm')}</div>
        <div>${t('dt', 'Pejabat', 'Office')}<dd>Bangi, Selangor</dd></div>
      </dl>
      ${t('p', 'Maklumat hubungan ni rekaan. Di website anda, ia maklumat anda.', 'These contact details are made up. On your website they are yours.', 'class="note" style="margin-top: var(--s-lg)"')}
    </div>
  </section>

${faq()}`;

const out = [
  { file: 'index.html', title: 'Safar Raudhah Travel: pakej umrah dari KLIA', desc: 'Pakej umrah dari KLIA dengan hotel dekat masjid dan mutawwif setiap hari. Demo website oleh Bejaa Digital.', body: home, over: true },
  { file: 'pakej.html', title: 'Pakej umrah | Safar Raudhah Travel', desc: 'Tiga pakej umrah: Ekonomi, Selesa dan Premium. Demo website oleh Bejaa Digital.', body: packages },
  ...PACKS.map(p => ({ file: p.file, title: `${p.name[0]} | Safar Raudhah Travel`, desc: `${p.name[0]}: ${p.days[0]}, ${p.makkah[0]}. Demo website oleh Bejaa Digital.`, body: packPage(p) })),
  { file: 'tarikh.html', title: 'Tarikh berlepas | Safar Raudhah Travel', desc: 'Tarikh berlepas umrah dari KLIA dan tempat kosong. Demo website oleh Bejaa Digital.', body: dates },
  { file: 'tentang.html', title: 'Tentang kami | Safar Raudhah Travel', desc: 'Agensi umrah yang bawa jemaah dalam kumpulan kecil. Demo website oleh Bejaa Digital.', body: about },
  { file: 'hubungi.html', title: 'Hubungi | Safar Raudhah Travel', desc: 'Tempah tempat umrah atau tanya soalan. Demo website oleh Bejaa Digital.', body: contact },
];
for (const p of out) writeFileSync(new URL(p.file, import.meta.url), page(p));
console.log('built', out.length, 'pages:', out.map(p => p.file).join(', '));

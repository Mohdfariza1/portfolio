// Builds the eight pages of the Kayu & Kapur demo from one layout, so the nav, footer,
// WhatsApp button and both languages stay identical everywhere.
// Run:  node _build.mjs   (in this folder; writes the .html files beside it)
// Every text is written once as t('English', 'Bahasa Melayu'); app.js swaps them.
import { writeFileSync } from 'node:fs';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
// t(): an element whose English text sits in the page and whose BM text rides along as data-ms
const t = (tag, en, ms, attrs = '') => `<${tag}${attrs ? ' ' + attrs : ''} data-ms="${esc(ms)}">${en}</${tag}>`;

const PAGES = [
  ['projects.html', 'Projects', 'Projek'],
  ['services.html', 'Services', 'Servis'],
  ['about.html', 'About', 'Tentang kami'],
  ['contact.html', 'Contact', 'Hubungi'],
];

const PROJECTS = [
  { file: 'subang-jaya.html', img: 'living', before: 'before', after: 'after',
    name: ['Terrace house, Subang Jaya', 'Rumah teres, Subang Jaya'],
    room: ['Living and dining room', 'Ruang tamu dan makan'],
    line: ['A timber wall of built-ins, limewash and a terrazzo floor.', 'Dinding kayu built-in, limewash dan lantai terrazzo.'],
    weeks: ['6 weeks', '6 minggu'], type: ['Terrace house', 'Rumah teres'], area: 'Subang Jaya',
    story: ['The owners had lived with yellowed walls and glossy tiles for fifteen years. They wanted storage without the room feeling smaller, so one wall became cabinets from floor to ceiling and everything else stayed open.', 'Tuan rumah dah lima belas tahun hidup dengan dinding kekuningan dan jubin berkilat. Mereka nak ruang simpanan tanpa bilik rasa sempit, jadi satu dinding dijadikan kabinet dari lantai ke siling dan yang lain dibiarkan lapang.'],
    work: [['Timber wall of built-in cabinets', 'Dinding kabinet built-in kayu'], ['Limewash on every wall', 'Limewash di semua dinding'], ['Terrazzo floor', 'Lantai terrazzo'], ['New wiring and lighting', 'Wiring dan lampu baru']],
    review: ['They gave us one price and it never moved. The supervisor sent photos every evening.', 'Mereka bagi satu harga dan harga tu tak berubah. Penyelia hantar gambar setiap petang.'], who: 'Aina' },
  { file: 'mont-kiara.html', img: 'kitchen', before: 'kitchen-before', after: 'kitchen',
    name: ['Condominium, Mont Kiara', 'Kondominium, Mont Kiara'],
    room: ['Kitchen', 'Dapur'],
    line: ['Oak cabinets, a stone worktop and an island for two.', 'Kabinet oak, top batu dan island untuk dua orang.'],
    weeks: ['4 weeks', '4 minggu'], type: ['Condominium', 'Kondominium'], area: 'Mont Kiara',
    story: ['The old kitchen had worn laminate cabinets, a tube light and nowhere to sit. We built oak cabinets in our workshop, added an island for two, and fitted everything on site in two days.', 'Dapur lama ada kabinet laminate yang dah lusuh, lampu kalimantang dan tak ada tempat duduk. Kami bina kabinet oak di bengkel, tambah island untuk dua orang, dan pasang semuanya di tapak dalam dua hari.'],
    work: [['Oak cabinets built in our workshop', 'Kabinet oak dibina di bengkel kami'], ['Stone worktop and island', 'Top batu dan island'], ['New sink, hob and oven fitted', 'Sinki, hob dan oven baru dipasang'], ['Management office forms and deposit handled', 'Borang dan deposit pejabat pengurusan diuruskan']],
    review: ['The kitchen was fitted in two days because the cabinets were built in their workshop first.', 'Dapur siap dipasang dalam dua hari sebab kabinet dibina di bengkel mereka dulu.'], who: 'Daniel' },
  { file: 'shah-alam.html', img: 'bathroom', before: 'bathroom-before', after: 'bathroom',
    name: ['Terrace house, Shah Alam', 'Rumah teres, Shah Alam'],
    room: ['Bathroom', 'Bilik air'],
    line: ['A walk-in shower, a floating vanity and microcement walls.', 'Shower walk-in, vanity terapung dan dinding microcement.'],
    weeks: ['3 weeks', '3 minggu'], type: ['Terrace house', 'Rumah teres'], area: 'Shah Alam',
    story: ['The old bathroom leaked into the room below. We stripped it to the slab, waterproofed it, flooded it for two days to test, and only then started on the walls.', 'Bilik air lama bocor ke bilik bawah. Kami kupas sampai ke slab, buat waterproofing, takung air dua hari untuk uji, baru mula kerja dinding.'],
    work: [['Waterproofing, tested before tiling', 'Waterproofing, diuji sebelum pasang jubin'], ['Walk-in shower with a glass panel', 'Shower walk-in dengan panel kaca'], ['Floating oak vanity', 'Vanity oak terapung'], ['Microcement walls', 'Dinding microcement']],
    review: ['Our bathroom has not leaked once. They tested the waterproofing before a single tile went on.', 'Bilik air kami tak pernah bocor lagi. Mereka uji waterproofing sebelum sekeping jubin pun dipasang.'], who: 'Puan Rohani' },
];

const AREAS = ['Kuala Lumpur', 'Petaling Jaya', 'Subang Jaya', 'Shah Alam', 'Klang', 'Puchong', 'Cheras', 'Ampang'];

const FAQ = [
  [['How much does a renovation cost?', 'Berapa kos renovation?'], ['It depends on the house and the work. After the free site visit you get a quotation that lists every item, and that price is fixed.', 'Ikut rumah dan kerja yang nak dibuat. Lepas lawatan tapak percuma, anda dapat quotation yang senaraikan setiap item, dan harga tu tetap.']],
  [['How long does it take?', 'Berapa lama nak siap?'], ['A bathroom takes about three weeks, a kitchen about four, a whole house eight to twelve. Your quotation states the dates.', 'Bilik air lebih kurang tiga minggu, dapur lebih kurang empat, satu rumah lapan hingga dua belas minggu. Tarikh ditulis dalam quotation.']],
  [['Do you work in condominiums?', 'Buat kerja di kondominium?'], ['Yes. We handle the management office: the renovation form, the deposit and the working hours.', 'Ya. Kami uruskan pejabat pengurusan: borang renovation, deposit dan waktu kerja.']],
  [['Is there a warranty?', 'Ada warranty?'], ['Twelve months on workmanship, counted from handover.', 'Dua belas bulan untuk hasil kerja, kira dari hari serah kunci.']],
  [['Which areas do you cover?', 'Kawasan mana yang anda layan?'], ['Kuala Lumpur, Petaling Jaya, Subang Jaya, Shah Alam, Klang and the rest of Selangor.', 'Kuala Lumpur, Petaling Jaya, Subang Jaya, Shah Alam, Klang dan seluruh Selangor.']],
];

const ARROWS = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 6l-6 6 6 6M15 6l6 6-6 6"/></svg>';
const WA_ICON = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 20.5l1.3-4.6A8.3 8.3 0 1 1 8.2 19.3z"/><path d="M9 8.6c.3 2.7 2.6 5.2 5.6 6l1.3-1.3-2-1.1-.9.8c-.9-.5-1.7-1.300-2.2-2.200l.8-.9-1.100-2z"/></svg>';

function compare(before, after, label, extra = '') {
  return `<div class="compare${extra ? ' ' + extra : ''}">
      <img class="compare__img" src="img/${before}.jpg" width="1800" height="1800" alt="The room before renovation">
      <div class="compare__after"><img class="compare__img" src="img/${after}.jpg" width="1800" height="1800" alt="The same room after renovation"></div>
      ${t('span', 'Before', 'Sebelum', 'class="compare__tag compare__tag--before"')}
      ${t('span', 'After', 'Selepas', 'class="compare__tag compare__tag--after"')}
      <div class="compare__line"><span class="compare__knob">${ARROWS}</span></div>
      <input class="compare__range" type="range" min="0" max="100" value="50" aria-label="${esc(label)}">`;
}

function form() {
  return `<form class="form" data-endpoint="" novalidate>
        <fieldset>
          ${t('legend', 'Type of home', 'Jenis rumah')}
          <div class="seg">
            <input type="radio" name="home" id="h1" value="Terrace house" checked>${t('label', 'Terrace house', 'Rumah teres', 'for="h1"')}
            <input type="radio" name="home" id="h2" value="Condominium">${t('label', 'Condominium', 'Kondominium', 'for="h2"')}
            <input type="radio" name="home" id="h3" value="Semi-D or bungalow">${t('label', 'Semi-D or bungalow', 'Semi-D atau banglo', 'for="h3"')}
          </div>
        </fieldset>
        <div>
          ${t('label', 'Area', 'Kawasan', 'class="lab" for="area"')}
          <select id="area" name="area" autocomplete="address-level2">
            ${AREAS.map(a => `<option>${a}</option>`).join('')}
            ${t('option', 'Elsewhere in Selangor', 'Tempat lain di Selangor')}
          </select>
        </div>
        <div class="form__two">
          <div>${t('label', 'Your name', 'Nama anda', 'class="lab" for="name"')}<input id="name" name="name" type="text" autocomplete="name" required></div>
          <div>${t('label', 'WhatsApp number', 'Nombor WhatsApp', 'class="lab" for="phone"')}<input id="phone" name="phone" type="tel" inputmode="tel" autocomplete="tel" required></div>
        </div>
        <div class="form__foot">
          ${t('button', 'Ask for a visit', 'Minta lawatan', 'class="btn btn--primary" type="submit"')}
          <p class="form__help" id="form-help" aria-live="polite"></p>
        </div>
      </form>`;
}

function page({ file, title, desc, body, cls = '' }) {
  const nav = PAGES.map(([href, en, ms]) => `<li>${t('a', en, ms, `href="${href}"${href === file ? ' aria-current="page"' : ''}`)}</li>`).join('\n      ');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="noindex">
<link rel="stylesheet" href="style.css">
<script>document.documentElement.classList.add('js');</script>
</head>
<body${cls ? ` class="${cls}"` : ''}>
<a class="skip" href="#main">Skip to content</a>

<header class="nav">
  <a class="nav__mark" href="index.html" aria-label="Kayu &amp; Kapur, home">Kayu &amp; Kapur</a>
  <ul class="nav__links">
      ${nav}
    <li>${t('a', 'Book a site visit', 'Book lawatan tapak', 'class="btn btn--primary btn--sm" href="contact.html#visit"')}</li>
  </ul>
  <button class="nav__lang" type="button" id="lang" aria-label="Tukar ke Bahasa Melayu">BM</button>
  <details class="nav__menu">
    ${t('summary', 'Menu', 'Menu')}
    <ul>
      ${nav}
      <li>${t('a', 'Book a site visit', 'Book lawatan tapak', 'href="contact.html#visit"')}</li>
    </ul>
  </details>
</header>

<main id="main">
${body}
</main>

<footer class="foot">
  <div class="container">
    <p class="foot__mark" aria-hidden="true" data-reveal>Kayu &amp; Kapur</p>
    <div class="foot__cols">
      <p><b>Kayu &amp; Kapur</b>${t('span', 'Interior design and renovation for homes in Kuala Lumpur and Selangor.', 'Interior design dan renovation untuk rumah di Kuala Lumpur dan Selangor.')}</p>
      <ul>
        ${PAGES.map(([href, en, ms]) => `<li>${t('a', en, ms, `href="${href}"`)}</li>`).join('\n        ')}
      </ul>
      <p>${t('b', 'Studio', 'Studio')}Petaling Jaya, Selangor<br>012-555 0142<br>hello@kayukapur.example</p>
    </div>
    ${t('p', 'A demo by Bejaa Digital. The studio, homes, customers and contact details are made up. Photographs made with Canva AI.', 'Demo oleh Bejaa Digital. Studio, rumah, pelanggan dan maklumat hubungan ni rekaan. Gambar dibuat dengan Canva AI.', 'class="foot__note"')}
  </div>
</footer>

<details class="wa">
  <summary aria-label="WhatsApp">${WA_ICON}<span>WhatsApp</span></summary>
  ${t('p', 'On your website this button opens a WhatsApp chat with your number, from every page. This is a demo, so it goes nowhere.', 'Di website anda, butang ni buka chat WhatsApp dengan nombor anda, dari setiap page. Ini demo, jadi ia tak ke mana-mana.')}
</details>

<script src="app.js"></script>
</body>
</html>
`;
}

const head = (en, ms, leadEn, leadMs) => `  <section class="page-head">
    <div class="container">
      ${t('h1', en, ms)}
      ${leadEn ? t('p', leadEn, leadMs, 'class="lead"') : ''}
    </div>
  </section>`;

const reviews = list => `  <section class="reviews">
    <div class="container">
      ${t('h2', 'What customers said', 'Kata pelanggan')}
      <ul class="reviews__list">
        ${list.map(p => `<li><blockquote>${t('p', p.review[0], p.review[1])}</blockquote><p class="reviews__who">${p.who}, <span data-ms="${esc(p.name[1])}">${p.name[0]}</span></p></li>`).join('\n        ')}
      </ul>
      ${t('p', 'Sample reviews. This studio is a demo, so these customers are made up.', 'Contoh ulasan. Studio ni demo, jadi pelanggan ni rekaan.', 'class="note"')}
    </div>
  </section>`;

const faq = () => `  <section class="faq" id="faq">
    <div class="container faq__in">
      ${t('h2', 'Questions we hear first', 'Soalan yang selalu ditanya')}
      <div>
        ${FAQ.map(([q, a]) => `<details>${t('summary', q[0], q[1])}${t('p', a[0], a[1])}</details>`).join('\n        ')}
      </div>
    </div>
  </section>`;

const visit = () => `  <section class="visit" id="visit">
    <div class="container visit__in">
      <div>
        ${t('h2', 'Book a site visit', 'Book lawatan tapak')}
        ${t('p', 'Tell us about the house. We come and measure it.', 'Ceritakan pasal rumah anda. Kami datang dan ukur.', 'class="lead"')}
      </div>
      ${form()}
    </div>
  </section>`;

/* ── Home ── */
const home = `  <section class="hero" id="top">
    ${compare('before', 'after', 'Drag to compare the living room before and after renovation').replace('class="compare"', 'class="compare" id="compare"').replace('alt="The room before renovation"', 'alt="The living room before renovation: bare yellowed walls and old glossy floor tiles" fetchpriority="high"').replace('alt="The same room after renovation"', 'alt="The same living room after renovation: a timber wall of built-in cabinets, limewash walls and a terrazzo floor"')}
      <div class="hero__say">
        ${t('h1', 'Drag the old room away', 'Seret bilik lama ke tepi')}
        ${t('p', 'Interior design and renovation for homes in Kuala Lumpur and Selangor.', 'Interior design dan renovation untuk rumah di Kuala Lumpur dan Selangor.', 'class="lead"')}
        <div class="hero__act">
          ${t('a', 'Book a site visit', 'Book lawatan tapak', 'class="btn btn--light" href="contact.html#visit"')}
        </div>
      </div>
    </div>
  </section>

  <section class="say">
    <div class="container say__in">
      <h2>${t('span', 'One team draws the room,', 'Satu team lukis bilik,', 'data-reveal style="--i:0"')} ${t('span', 'builds it and hands you the keys.', 'bina dan serah kunci pada anda.', 'data-reveal style="--i:1"')}</h2>
      ${t('p', 'Your drawings never go to a second contractor. The designer who measured your house stays on site until the last coat of limewash.', 'Lukisan anda tak pergi ke kontraktor kedua. Designer yang ukur rumah anda ada di tapak sampai lapisan limewash terakhir.', 'data-reveal style="--i:2"')}
    </div>
  </section>

  <section class="homes" id="homes">
    <div class="container">
      ${t('h2', 'Three homes, handed over', 'Tiga rumah, dah serah kunci')}
      <div class="homes__in">
        <div class="homes__list" tabindex="0" role="group" aria-label="Finished homes">
          ${PROJECTS.map((p, i) => `<article class="home${i === 0 ? ' is-near' : ''}" data-home="${i}">
            <figure class="home__detail"><img src="img/${p.img}-detail.jpg" width="720" height="900" alt="" loading="lazy"></figure>
            ${t('h3', p.name[0], p.name[1])}
            <p><span data-ms="${esc(p.room[1])}">${p.room[0]}</span>. <span data-ms="${esc(p.line[1])}">${p.line[0]}</span></p>
            <p>${t('a', 'See this project', 'Tengok projek ni', `class="more" href="${p.file}"`)}</p>
            <figure class="home__full"><img src="img/${p.img}.jpg" width="1400" height="1400" alt="${esc(p.room[0])}, ${esc(p.area)}" loading="lazy"></figure>
          </article>`).join('\n          ')}
        </div>
        <div class="homes__bar" aria-hidden="true"></div>
        <div class="homes__stage" aria-hidden="true">
          ${PROJECTS.map((p, i) => `<figure${i === 0 ? ' class="is-on"' : ''}><img src="img/${p.img}.jpg" width="1400" height="1400" alt="" loading="lazy"></figure>`).join('\n          ')}
        </div>
      </div>
    </div>
  </section>

  <section class="trades" id="trades">
    <div class="container trades__in">
      ${t('h2', 'What we take on', 'Kerja yang kami ambil')}
      <dl>
        <div class="trades__row" data-reveal style="--i:0">${t('dt', 'Whole-house renovation', 'Renovation satu rumah')}${t('dd', 'Wet works, wiring, carpentry and paint under one contract.', 'Kerja basah, wiring, kabinet dan cat dalam satu kontrak.')}</div>
        <div class="trades__row" data-reveal style="--i:1">${t('dt', 'Kitchens', 'Dapur')}${t('dd', 'Cabinets built in our own workshop and fitted on site.', 'Kabinet dibina di bengkel kami sendiri dan dipasang di tapak.')}</div>
        <div class="trades__row" data-reveal style="--i:2">${t('dt', 'Bathrooms', 'Bilik air')}${t('dd', 'Waterproofing first, then tile, microcement or limewash.', 'Waterproofing dulu, kemudian jubin, microcement atau limewash.')}</div>
        <div class="trades__row" data-reveal style="--i:3">${t('dt', 'Built-in carpentry', 'Kabinet built-in')}${t('dd', 'Wardrobes, TV walls and shoe cabinets cut to your walls.', 'Almari, dinding TV dan kabinet kasut dipotong ikut dinding anda.')}</div>
      </dl>
      <p class="trades__more">${t('a', 'See what each service includes', 'Tengok apa yang setiap servis termasuk', 'class="more" href="services.html"')}</p>
    </div>
  </section>

  <section class="job" id="job">
    <div class="container job__in">
      ${t('h2', 'How a job runs', 'Cara kerja berjalan')}
      <ol id="steps">
        <li>${t('h3', 'Site visit', 'Lawatan tapak')}${t('p', 'We measure the house and listen. The visit is free in Kuala Lumpur and Selangor.', 'Kami ukur rumah dan dengar apa anda nak. Lawatan percuma di Kuala Lumpur dan Selangor.')}</li>
        <li>${t('h3', 'Drawings and a fixed quotation', 'Lukisan dan quotation tetap')}${t('p', 'A 3D view of each room, and a price that lists every item.', 'Paparan 3D setiap bilik, dan harga yang senaraikan setiap item.')}</li>
        <li>${t('h3', 'The build', 'Kerja dibina')}${t('p', 'One site supervisor, and photos of the day’s work on WhatsApp.', 'Satu penyelia tapak, dan gambar kerja hari tu di WhatsApp.')}</li>
        <li>${t('h3', 'Handover', 'Serah kunci')}${t('p', 'We walk the house with you and fix what you point at.', 'Kami pusing rumah dengan anda dan betulkan apa yang anda tunjuk.')}</li>
      </ol>
    </div>
  </section>

${reviews(PROJECTS)}

${faq()}

${visit()}`;

/* ── Projects ── */
const projects = `${head('Projects', 'Projek', 'Three homes we finished and handed over. Each one has its own page.', 'Tiga rumah yang kami siapkan dan serah kunci. Setiap satu ada page sendiri.')}
  <section class="cards">
    <div class="container">
      <ul class="cards__list">
        ${PROJECTS.map(p => `<li><a class="card" href="${p.file}">
          <img src="img/${p.img}.jpg" width="1400" height="1400" alt="${esc(p.room[0])}, ${esc(p.area)}" loading="lazy">
          ${t('h2', p.name[0], p.name[1])}
          <p><span data-ms="${esc(p.room[1])}">${p.room[0]}</span> · <span data-ms="${esc(p.weeks[1])}">${p.weeks[0]}</span></p>
          ${t('p', p.line[0], p.line[1])}
          ${t('span', 'See this project', 'Tengok projek ni', 'class="more"')}
        </a></li>`).join('\n        ')}
      </ul>
    </div>
  </section>

${visit()}`;

/* ── One project ── */
const project = (p, i) => {
  const next = PROJECTS[(i + 1) % PROJECTS.length];
  const top = p.before
    ? `  <section class="hero hero--short">
    ${compare(p.before, p.after, 'Drag to compare the room before and after renovation')}
    </div>
  </section>`
    : `  <section class="shot">
    <div class="container"><img src="img/${p.img}.jpg" width="1400" height="1400" alt="${esc(p.room[0])}, ${esc(p.area)}"></div>
  </section>`;
  return `${head(p.name[0], p.name[1], p.line[0], p.line[1])}
${top}
  <section class="detail">
    <div class="container detail__in">
      <dl class="facts">
        <div>${t('dt', 'Area', 'Kawasan')}<dd>${p.area}</dd></div>
        <div>${t('dt', 'Home', 'Rumah')}${t('dd', p.type[0], p.type[1])}</div>
        <div>${t('dt', 'Room', 'Bilik')}${t('dd', p.room[0], p.room[1])}</div>
        <div>${t('dt', 'Time on site', 'Tempoh di tapak')}${t('dd', p.weeks[0], p.weeks[1])}</div>
      </dl>
      <div class="detail__text">
        ${t('h2', 'What we did', 'Apa yang kami buat')}
        ${t('p', p.story[0], p.story[1])}
        <ul class="ticks">
          ${p.work.map(w => t('li', w[0], w[1])).join('\n          ')}
        </ul>
      </div>
    </div>
  </section>
  <section class="shot shot--pair">
    <div class="container">
      <img src="img/${p.img}-detail.jpg" width="720" height="900" alt="" loading="lazy">
      <img src="img/${p.img}.jpg" width="1400" height="1400" alt="${esc(p.room[0])}, ${esc(p.area)}" loading="lazy">
    </div>
  </section>
${reviews([p])}
  <section class="next">
    <div class="container">
      ${t('p', 'Next project', 'Projek seterusnya')}
      <a class="next__link" href="${next.file}"><span data-ms="${esc(next.name[1])}">${next.name[0]}</span></a>
    </div>
  </section>

${visit()}`;
};

/* ── Services ── */
const SERVICES = [
  [['Whole-house renovation', 'Renovation satu rumah'], ['8 to 12 weeks', '8 hingga 12 minggu'], [['Wet works, wiring and plumbing', 'Kerja basah, wiring dan paip'], ['Carpentry for every room', 'Kabinet untuk setiap bilik'], ['Paint, limewash and flooring', 'Cat, limewash dan lantai'], ['One contract, one supervisor', 'Satu kontrak, satu penyelia']]],
  [['Kitchens', 'Dapur'], ['About 4 weeks', 'Lebih kurang 4 minggu'], [['Cabinets built in our workshop', 'Kabinet dibina di bengkel kami'], ['Stone or solid-surface worktop', 'Top batu atau solid surface'], ['Sink, hob and hood fitted', 'Sinki, hob dan hood dipasang'], ['Fitted on site in two days', 'Dipasang di tapak dalam dua hari']]],
  [['Bathrooms', 'Bilik air'], ['About 3 weeks', 'Lebih kurang 3 minggu'], [['Stripped to the slab', 'Dikupas sampai ke slab'], ['Waterproofing, flood-tested for two days', 'Waterproofing, diuji takung air dua hari'], ['Tile, microcement or limewash', 'Jubin, microcement atau limewash'], ['Vanity, shower screen and fittings', 'Vanity, skrin shower dan kelengkapan']]],
  [['Built-in carpentry', 'Kabinet built-in'], ['2 to 3 weeks', '2 hingga 3 minggu'], [['Wardrobes and TV walls', 'Almari dan dinding TV'], ['Shoe cabinets and study desks', 'Kabinet kasut dan meja belajar'], ['Measured and cut to your walls', 'Diukur dan dipotong ikut dinding anda'], ['Soft-close hinges and runners', 'Engsel dan runner soft-close']]],
];
const services = `${head('Services', 'Servis', 'Four kinds of work, each under one contract with one supervisor.', 'Empat jenis kerja, setiap satu dalam satu kontrak dengan satu penyelia.')}
  <section class="svc">
    <div class="container">
      <ul class="svc__list">
        ${SERVICES.map(([n, w, l]) => `<li>
          ${t('h2', n[0], n[1])}
          ${t('p', w[0], w[1], 'class="svc__time"')}
          <ul class="ticks">${l.map(x => t('li', x[0], x[1])).join('')}</ul>
        </li>`).join('\n        ')}
      </ul>
    </div>
  </section>
  <section class="price">
    <div class="container price__in">
      ${t('h2', 'How we price', 'Cara kami letak harga')}
      <ol class="price__steps">
        <li>${t('h3', 'Free site visit', 'Lawatan tapak percuma')}${t('p', 'We measure and take photos. No charge in Kuala Lumpur and Selangor.', 'Kami ukur dan ambil gambar. Percuma di Kuala Lumpur dan Selangor.')}</li>
        <li>${t('h3', 'A quotation that lists every item', 'Quotation yang senaraikan setiap item')}${t('p', 'Each cabinet, each wall, each fitting has its own line and price.', 'Setiap kabinet, setiap dinding, setiap kelengkapan ada baris dan harga sendiri.')}</li>
        <li>${t('h3', 'The price is fixed', 'Harga tetap')}${t('p', 'It changes only if you add work, and we quote that first.', 'Ia berubah hanya kalau anda tambah kerja, dan kami bagi harga dulu.')}</li>
        <li>${t('h3', 'Paid in four stages', 'Bayar dalam empat peringkat')}${t('p', '10% to book, 40% when work starts, 40% when carpentry is in, 10% at handover.', '10% untuk book, 40% bila kerja mula, 40% bila kabinet masuk, 10% masa serah kunci.')}</li>
      </ol>
    </div>
  </section>
  <section class="areas">
    <div class="container">
      ${t('h2', 'Where we work', 'Kawasan kami')}
      <ul class="areas__list">${AREAS.map(a => `<li>${a}</li>`).join('')}${t('li', 'The rest of Selangor', 'Seluruh Selangor')}</ul>
    </div>
  </section>

${faq()}

${visit()}`;

/* ── About ── */
const TEAM = [
  ['Faris', ['Designer', 'Designer'], ['Measures every house himself and draws each room in 3D.', 'Ukur setiap rumah sendiri dan lukis setiap bilik dalam 3D.']],
  ['Mei Ling', ['Site supervisor', 'Penyelia tapak'], ['On site every working day. She is the one who sends the evening photos.', 'Ada di tapak setiap hari kerja. Dialah yang hantar gambar setiap petang.']],
  ['Azman', ['Workshop lead', 'Ketua bengkel'], ['Builds the cabinets in Petaling Jaya before they reach your house.', 'Bina kabinet di Petaling Jaya sebelum sampai ke rumah anda.']],
];
const about = `${head('About', 'Tentang kami', 'A carpentry workshop that grew into a studio which designs and builds the whole room.', 'Bengkel kabinet yang berkembang jadi studio yang design dan bina satu bilik penuh.')}
  <section class="story">
    <div class="container story__in">
      <img src="img/living-detail.jpg" width="720" height="900" alt="" loading="lazy">
      <div>
        ${t('h2', 'One team, from the drawing to the keys', 'Satu team, dari lukisan sampai serah kunci')}
        ${t('p', 'Kayu &amp; Kapur started in 2014 as a carpentry workshop in Petaling Jaya. Customers kept asking who would do the walls and the floor around our cabinets, so we learned to do those too.', 'Kayu & Kapur bermula pada 2014 sebagai bengkel kabinet di Petaling Jaya. Pelanggan selalu tanya siapa nak buat dinding dan lantai keliling kabinet kami, jadi kami belajar buat yang tu juga.')}
        ${t('p', 'Today the same people draw the room, build it and walk it with you at handover. Nothing is passed to a second contractor.', 'Hari ni orang yang sama lukis bilik, bina dan pusing rumah dengan anda masa serah kunci. Tak ada yang diserah pada kontraktor kedua.')}
      </div>
    </div>
  </section>
  <section class="team">
    <div class="container">
      ${t('h2', 'Who you will meet', 'Siapa yang anda akan jumpa')}
      <ul class="team__list">
        ${TEAM.map(([n, r, d]) => `<li><h3>${n}</h3>${t('p', r[0], r[1], 'class="team__role"')}${t('p', d[0], d[1])}</li>`).join('\n        ')}
      </ul>
      ${t('p', 'This studio is a demo, so the team is made up.', 'Studio ni demo, jadi team ni rekaan.', 'class="note"')}
    </div>
  </section>
  <section class="areas">
    <div class="container">
      ${t('h2', 'What we promise', 'Apa yang kami janji')}
      <ul class="ticks ticks--big">
        ${t('li', 'One price, written item by item, that does not move', 'Satu harga, ditulis item demi item, yang tak berubah')}
        ${t('li', 'Photos of the day’s work on WhatsApp every evening', 'Gambar kerja hari tu di WhatsApp setiap petang')}
        ${t('li', 'Twelve months’ warranty on workmanship', 'Warranty dua belas bulan untuk hasil kerja')}
      </ul>
    </div>
  </section>

${visit()}`;

/* ── Contact ── */
const contact = `${head('Contact', 'Hubungi', 'Book a free site visit, or just ask a question.', 'Book lawatan tapak percuma, atau tanya soalan je.')}
${visit()}
  <section class="reach">
    <div class="container">
      <dl class="facts facts--wide">
        <div><dt>WhatsApp</dt><dd>012-555 0142</dd></div>
        <div>${t('dt', 'Phone', 'Telefon')}<dd>03-5555 0142</dd></div>
        <div>${t('dt', 'Email', 'Emel')}<dd>hello@kayukapur.example</dd></div>
        <div>${t('dt', 'Hours', 'Waktu')}${t('dd', 'Monday to Saturday, 9am to 6pm', 'Isnin hingga Sabtu, 9 pagi hingga 6 petang')}</div>
        <div>${t('dt', 'Studio', 'Studio')}<dd>Petaling Jaya, Selangor</dd></div>
      </dl>
      ${t('p', 'These contact details are made up. On your website they are yours.', 'Maklumat hubungan ni rekaan. Di website anda, ia maklumat anda.', 'class="note"')}
    </div>
  </section>
  <section class="areas">
    <div class="container">
      ${t('h2', 'Where we work', 'Kawasan kami')}
      <ul class="areas__list">${AREAS.map(a => `<li>${a}</li>`).join('')}${t('li', 'The rest of Selangor', 'Seluruh Selangor')}</ul>
    </div>
  </section>`;

const out = [
  { file: 'index.html', cls: 'is-home', title: 'Kayu &amp; Kapur, interior design and renovation in Kuala Lumpur and Selangor', desc: 'Kayu & Kapur designs and renovates homes in Kuala Lumpur and Selangor. A demo website by Bejaa Digital.', body: home },
  { file: 'projects.html', title: 'Projects | Kayu &amp; Kapur', desc: 'Three finished homes in Subang Jaya, Mont Kiara and Shah Alam. A demo website by Bejaa Digital.', body: projects },
  ...PROJECTS.map((p, i) => ({ file: p.file, title: `${p.name[0]} | Kayu &amp; Kapur`, desc: `${p.room[0]} in ${p.area}: ${p.line[0]} A demo website by Bejaa Digital.`, body: project(p, i) })),
  { file: 'services.html', title: 'Services | Kayu &amp; Kapur', desc: 'Whole-house renovation, kitchens, bathrooms and built-in carpentry. A demo website by Bejaa Digital.', body: services },
  { file: 'about.html', title: 'About | Kayu &amp; Kapur', desc: 'One team that draws the room, builds it and hands you the keys. A demo website by Bejaa Digital.', body: about },
  { file: 'contact.html', title: 'Contact | Kayu &amp; Kapur', desc: 'Book a free site visit in Kuala Lumpur and Selangor. A demo website by Bejaa Digital.', body: contact },
];
for (const p of out) writeFileSync(new URL(p.file, import.meta.url), page(p));
console.log('built', out.length, 'pages:', out.map(p => p.file).join(', '));

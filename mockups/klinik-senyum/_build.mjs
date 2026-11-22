// Builds the Klinik Pergigian Senyum Sihat demo (a made-up family dental clinic in Shah Alam) from one
// layout, so the header, footer, WhatsApp button and both languages stay identical on every page.
// Run:  node _build.mjs   (in this folder; writes the .html files beside it)
// Every text is written once as t(tag, 'Bahasa Melayu', 'English'); Malay is the default, app.js swaps.
// The clinic, doctors, prices, reviews and contact details are samples, and the pages say so.
import { writeFileSync } from 'node:fs';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const t = (tag, ms, en, attrs = '') => `<${tag}${attrs ? ' ' + attrs : ''} data-en="${esc(en)}">${ms}</${tag}>`;

const PAGES = [
  ['rawatan.html', 'Rawatan dan harga', 'Treatments and prices'],
  ['doktor.html', 'Doktor', 'Dentists'],
  ['tempah.html', 'Tempah slot', 'Book a slot'],
  ['hubungi.html', 'Hubungi', 'Contact'],
];

const CARE = [
  { id: 'scaling', name: ['Scaling dan polishing', 'Scaling and polishing'], price: ['Dari RM80', 'From RM80'], time: ['30 minit', '30 minutes'],
    d: ['Buang karang gigi yang buat gusi berdarah dan mulut berbau.', 'Removes the tartar that makes gums bleed and breath smell.'],
    know: ['Elok dibuat setiap enam bulan. Gusi mungkin rasa ngilu sikit sehari dua.', 'Best done every six months. Gums may feel a little tender for a day or two.'] },
  { id: 'tampal', name: ['Tampal gigi', 'Fillings'], price: ['Dari RM120 segigi', 'From RM120 a tooth'], time: ['30 hingga 45 minit', '30 to 45 minutes'],
    d: ['Tampalan sewarna gigi untuk lubang kecil dan sederhana.', 'Tooth-coloured fillings for small and medium cavities.'],
    know: ['Boleh makan selepas satu jam. Kalau lubang dalam, doktor akan terangkan pilihan lain dulu.', 'You can eat after an hour. If the cavity is deep, the dentist explains the other options first.'] },
  { id: 'cabut', name: ['Cabut gigi dan gigi bongsu', 'Extractions and wisdom teeth'], price: ['Dari RM100, gigi bongsu dari RM350', 'From RM100, wisdom teeth from RM350'], time: ['30 hingga 60 minit', '30 to 60 minutes'],
    d: ['Termasuk X-ray, ubat kebas dan ubat tahan sakit.', 'Includes the X-ray, the numbing injection and painkillers.'],
    know: ['Kawasan gigi dikebaskan dulu. Surat cuti sakit disediakan kalau perlu.', 'The area is numbed first. A medical certificate is given if you need one.'] },
  { id: 'braces', name: ['Braces', 'Braces'], price: ['Dari RM4,500, boleh ansuran', 'From RM4,500, instalments available'], time: ['18 hingga 24 bulan', '18 to 24 months'],
    d: ['Metal atau ceramic. Konsultasi dan pelan rawatan dibuat sebelum anda putuskan.', 'Metal or ceramic. The consultation and treatment plan come before you decide.'],
    know: ['Deposit pada hari pasang, kemudian bayaran bulanan tanpa faedah. Datang sebulan sekali.', 'A deposit on fitting day, then monthly payments with no interest. One visit a month.'] },
  { id: 'putih', name: ['Pemutihan gigi', 'Whitening'], price: ['Dari RM650', 'From RM650'], time: ['45 minit', '45 minutes'],
    d: ['Dibuat di klinik, dalam satu sesi.', 'Done in the clinic, in one session.'],
    know: ['Scaling perlu dibuat dulu. Elakkan kopi dan teh selama dua hari selepas itu.', 'Scaling comes first. Avoid coffee and tea for two days afterwards.'] },
  { id: 'palsu', name: ['Gigi palsu dan crown', 'Dentures and crowns'], price: ['Dari RM900', 'From RM900'], time: ['2 hingga 3 lawatan', '2 to 3 visits'],
    d: ['Separa atau penuh, dibuat ikut ukuran mulut anda.', 'Partial or full, made to the measure of your mouth.'],
    know: ['Ada sesi cuba sebelum siap, supaya selesa bila dipakai.', 'There is a fitting session before it is finished, so it sits comfortably.'] },
];

const DOCS = [
  { id: 'aina', name: 'Dr. Nur Aina Hashim', role: ['Doktor gigi, pemilik klinik', 'Dentist and clinic owner'], d: ['Merawat keluarga di Shah Alam sejak klinik dibuka. Paling ramai pesakit kanak-kanak cari dia.', 'Has treated Shah Alam families since the clinic opened. The one most children ask for.'], does: ['Rawatan am, kanak-kanak, pemutihan', 'General care, children, whitening'], alt: ['Potret Dr. Nur Aina Hashim', 'Portrait of Dr. Nur Aina Hashim'] },
  { id: 'faizal', name: 'Dr. Faizal Rahim', role: ['Doktor gigi', 'Dentist'], d: ['Buat braces, gigi bongsu dan crown. Suka terangkan guna X-ray supaya pesakit nampak sendiri.', 'Handles braces, wisdom teeth and crowns. Likes to explain with the X-ray so patients can see for themselves.'], does: ['Braces, gigi bongsu, crown', 'Braces, wisdom teeth, crowns'], alt: ['Potret Dr. Faizal Rahim', 'Portrait of Dr. Faizal Rahim'] },
];

const HOURS = [[['Isnin hingga Jumaat', 'Monday to Friday'], ['9 pagi hingga 9 malam', '9 am to 9 pm']], [['Sabtu', 'Saturday'], ['9 pagi hingga 6 petang', '9 am to 6 pm']], [['Ahad dan cuti umum', 'Sunday and public holidays'], ['Tutup', 'Closed']]];
const SLOTS = [['9:00', 1], ['10:00', 1], ['11:30', 0], ['2:30', 1], ['3:30', 1], ['4:30', 0], ['5:30', 1], ['8:00', 1]];

const FAQ = [
  ['Berapa lama nak dapat slot?', 'How soon can I get a slot?', 'Biasanya slot hari yang sama masih ada kalau anda hubungi sebelum 11 pagi. Braces dan crown perlu tempah dua atau tiga hari awal.', 'Same-day slots are usually open if you contact us before 11 am. Braces and crowns need two or three days notice.'],
  ['Sakit tak masa cabut gigi?', 'Does an extraction hurt?', 'Kawasan gigi dikebaskan dulu, jadi anda tak rasa sakit semasa rawatan. Ubat tahan sakit diberi untuk beberapa hari selepas itu.', 'The area is numbed first, so you feel no pain during the treatment. Painkillers are given for the few days after.'],
  ['Boleh guna kad panel syarikat?', 'Can I use my company panel card?', 'Kami panel untuk beberapa syarikat. Hantar gambar kad di WhatsApp dan kami sahkan sebelum anda datang.', 'We are on the panel for several companies. Send a photo of the card on WhatsApp and we confirm before you come.'],
  ['Braces boleh bayar ansuran?', 'Can I pay for braces in instalments?', 'Boleh. Deposit pada hari pasang, kemudian bayaran bulanan tanpa faedah. Pelan penuh diberi secara bertulis.', 'Yes. A deposit on fitting day, then monthly payments with no interest. The full plan is given in writing.'],
  ['Anak saya takut doktor gigi. Macam mana?', 'My child is afraid of the dentist. What then?', 'Bawa dia melawat dulu tanpa rawatan. Dia boleh duduk atas kerusi dan tengok alat, supaya lawatan sebenar tak menakutkan.', 'Bring them for a visit with no treatment first. They can sit in the chair and see the tools, so the real visit is not frightening.'],
];

const WA_ICON = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 20.5l1.3-4.6A8.3 8.3 0 1 1 8.2 19.3z"/><path d="M9 8.6c.3 2.7 2.6 5.2 5.6 6l1.3-1.3-2-1.1-.9.8c-.9-.5-1.7-1.3-2.2-2.2l.8-.9-1.1-2z"/></svg>';

function page({ name, title, desc, body }) {
  const nav = PAGES.map(([href, ms, en]) => `<li>${t('a', ms, en, `href="${href}"${href === name ? ' aria-current="page"' : ''}`)}</li>`).join('\n        ');
  return `<!doctype html>
<html lang="ms">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="noindex">
<link rel="stylesheet" href="style.css">
</head>
<body>
${t('a', 'Terus ke kandungan', 'Skip to content', 'class="skip" href="#main"')}

<header class="nav">
  <div class="container nav__in">
    <a class="nav__mark" href="index.html" aria-label="Klinik Pergigian Senyum Sihat, laman utama">Senyum Sihat</a>
    <ul class="nav__links">
        ${nav}
    </ul>
    <button class="nav__lang" type="button" id="lang" aria-label="Switch to English">EN</button>
    ${t('a', 'Tempah slot', 'Book a slot', 'class="btn btn--main btn--sm" href="tempah.html"')}
    <details class="nav__menu">
      <summary>Menu</summary>
      <ul>
        ${nav}
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
        <p class="foot__mark">Senyum Sihat</p>
        ${t('p', 'Klinik pergigian keluarga di Seksyen 13, Shah Alam.', 'A family dental clinic in Seksyen 13, Shah Alam.', 'style="margin-top: var(--s-sm)"')}
      </div>
      <ul>
        ${PAGES.map(([href, ms, en]) => `<li>${t('a', ms, en, `href="${href}"`)}</li>`).join('\n        ')}
      </ul>
      <p>${t('b', 'Klinik', 'Clinic')}Seksyen 13, 40100 Shah Alam, Selangor<br>03-5555 0127<br>hello@senyumsihat.example</p>
      <p>${t('b', 'Waktu', 'Hours')}${t('span', 'Isnin hingga Jumaat, 9 pagi hingga 9 malam. Sabtu, 9 pagi hingga 6 petang.', 'Monday to Friday, 9 am to 9 pm. Saturday, 9 am to 6 pm.')}</p>
    </div>
    ${t('p', 'Demo oleh Bejaa Digital. Klinik, doktor, harga, ulasan dan maklumat hubungan ni rekaan, dan tiada apa di laman ni yang merupakan nasihat perubatan. Gambar dibuat dengan AI.', 'A demo by Bejaa Digital. The clinic, dentists, prices, reviews and contact details are made up, and nothing on this site is medical advice. Photos are made with AI.', 'class="foot__note"')}
  </div>
</footer>

<details class="wa">
  <summary aria-label="WhatsApp">${WA_ICON}<span>WhatsApp</span></summary>
  ${t('p', 'Di website anda, butang ni buka chat WhatsApp dengan nombor klinik, dari setiap page. Ini demo, jadi ia tak ke mana-mana.', 'On your website this button opens a WhatsApp chat with the clinic number, from every page. This is a demo, so it goes nowhere.')}
</details>

<script src="app.js"></script>
</body>
</html>
`;
}

const head = (ms, en, leadMs, leadEn) => `  <section class="page-head">
    <div class="container">
      ${t('h1', ms, en)}
      ${leadMs ? t('p', leadMs, leadEn, 'class="lead"') : ''}
    </div>
  </section>`;

const close = `  <section class="section section--dark">
    <div class="container close">
      ${t('h2', 'Gigi sakit malam tadi? Jangan tunggu sampai bengkak', 'Toothache last night? Do not wait for the swelling')}
      ${t('p', 'Pilih masa yang kosong hari ni. Kami sahkan di WhatsApp dalam 15 minit pada waktu klinik buka.', 'Pick a free time today. We confirm on WhatsApp within 15 minutes during clinic hours.', 'class="lead"')}
      ${t('a', 'Tempah slot', 'Book a slot', 'class="btn btn--light" href="tempah.html"')}
    </div>
  </section>`;

const hoursTable = `<div class="scroll"><table>
        <tbody>
          ${HOURS.map(([d, h]) => `<tr>${t('th', d[0], d[1], 'scope="row"')}${t('td', h[0], h[1])}</tr>`).join('\n          ')}
        </tbody>
      </table></div>`;

/* ── Home ── */
const home = `  <section class="hero">
    <div class="container hero__in">
      <div class="hero__text">
        ${t('h1', 'Gigi sakit tak payah tunggu. Slot hari ni masih ada', 'A toothache should not wait. There are slots today')}
        ${t('p', 'Klinik pergigian keluarga di Shah Alam. Harga diberitahu dulu, sebelum apa-apa rawatan bermula.', 'A family dental clinic in Shah Alam. You are told the price first, before any treatment starts.', 'class="lead"')}
        <div class="hero__acts">
          ${t('a', 'Tempah slot', 'Book a slot', 'class="btn btn--main" href="tempah.html"')}
          ${t('a', 'Lihat harga', 'See the prices', 'class="btn btn--line" href="rawatan.html"')}
        </div>
      </div>
      <img class="hero__pic" src="img/bilik.jpg" alt="Bilik rawatan di Klinik Senyum Sihat" data-alt-en="A treatment room at Klinik Senyum Sihat" width="1500" height="1000">
    </div>
    <div class="container">
      <ul class="strip">
        <li>${t('b', '15 minit', '15 minutes')}${t('span', 'untuk kami sahkan slot anda di WhatsApp', 'for us to confirm your slot on WhatsApp')}</li>
        <li>${t('b', '9 malam', '9 pm')}${t('span', 'klinik tutup pada hari bekerja', 'closing time on weekdays')}</li>
        <li>${t('b', '0%', '0%')}${t('span', 'faedah untuk ansuran braces', 'interest on braces instalments')}</li>
        <li>${t('b', 'Percuma', 'Free')}${t('span', 'parking di depan klinik', 'parking in front of the clinic')}</li>
      </ul>
    </div>
  </section>

  <section class="section section--tint">
    <div class="container">
      <div class="head head--row">
        ${t('h2', 'Rawatan yang paling kerap', 'The treatments we do most')}
        ${t('a', 'Semua rawatan dan harga', 'All treatments and prices', 'class="more" href="rawatan.html"')}
      </div>
      <ul class="care">
        ${CARE.slice(0, 3).map(c => `<li><a href="rawatan.html#${c.id}">${t('h3', c.name[0], c.name[1])}${t('p', c.d[0], c.d[1])}${t('b', c.price[0], c.price[1])}</a></li>`).join('\n        ')}
      </ul>
    </div>
  </section>

  <section class="section">
    <div class="container split">
      <img src="img/ruang.jpg" alt="Ruang menunggu dengan sudut kanak-kanak" data-alt-en="The waiting area with a children's corner" width="1200" height="900" loading="lazy">
      <div class="split__text">
        ${t('h2', 'Untuk anak yang takut doktor gigi', 'For children who fear the dentist')}
        ${t('p', 'Lawatan pertama boleh tanpa rawatan. Anak anda duduk atas kerusi, tengok alat dan kenal doktor dulu.', 'The first visit can be with no treatment at all. Your child sits in the chair, sees the tools and meets the dentist first.')}
        ${t('a', 'Kenali doktor kami', 'Meet our dentists', 'class="btn btn--line" href="doktor.html"')}
      </div>
    </div>
  </section>

  <section class="section section--tint">
    <div class="container">
      <div class="head">
        ${t('h2', 'Kata pesakit', 'What patients say')}
        ${t('p', 'Ulasan contoh, ditulis untuk demo ni.', 'Sample reviews, written for this demo.', 'class="note"')}
      </div>
      <ul class="reviews">
        <li>${t('blockquote', 'Anak saya takut doktor gigi. Nurse layan dia dulu sepuluh minit, lepas tu dia duduk sendiri atas kerusi.', 'My son is afraid of dentists. The nurse spent ten minutes with him first, then he sat in the chair by himself.')}${t('p', 'Siti Hajar, Seksyen 9', 'Siti Hajar, Seksyen 9', 'class="note"')}</li>
        <li>${t('blockquote', 'Cabut dua gigi bongsu. Doktor terangkan guna X-ray dan kos diberi awal. Tiada caj tiba-tiba masa bayar.', 'Two wisdom teeth out. The dentist explained with the X-ray and gave the cost up front. No surprise charge at the counter.')}${t('p', 'Ahmad Faiz, Setia Alam', 'Ahmad Faiz, Setia Alam', 'class="note"')}</li>
        <li>${t('blockquote', 'Braces saya dah lapan bulan. Setiap kali datang tak pernah tunggu lama sebab slot saya tetap.', 'Eight months into my braces. I never wait long because my slot is fixed.')}${t('p', 'Nur Laila, pelajar', 'Nur Laila, student', 'class="note"')}</li>
      </ul>
    </div>
  </section>

  <section class="section">
    <div class="container faq">
      ${t('h2', 'Yang pesakit selalu tanya', 'What patients ask most')}
      <div>
        ${FAQ.map(([q, qe, a, ae]) => `<details><summary>${t('span', q, qe)}</summary>${t('p', a, ae)}</details>`).join('\n        ')}
      </div>
    </div>
  </section>

${close}`;

/* ── Treatments ── */
const rawatan = `${head('Rawatan dan harga', 'Treatments and prices', 'Harga permulaan untuk setiap rawatan. Kalau rawatan perlu ditambah, kami beritahu dan minta kebenaran dulu.', 'Starting prices for each treatment. If more is needed, we tell you and ask first.')}
  <section class="section section--flush">
    <div class="container">
      <ul class="menu">
        ${CARE.map(c => `<li id="${c.id}">
          <div>${t('h2', c.name[0], c.name[1])}${t('p', c.d[0], c.d[1], 'class="lead"')}</div>
          <dl class="facts">
            <div>${t('dt', 'Harga', 'Price')}${t('dd', c.price[0], c.price[1])}</div>
            <div>${t('dt', 'Masa', 'Time')}${t('dd', c.time[0], c.time[1])}</div>
            <div>${t('dt', 'Perlu tahu', 'Good to know')}${t('dd', c.know[0], c.know[1])}</div>
          </dl>
        </li>`).join('\n        ')}
      </ul>
      ${t('p', 'Harga contoh untuk demo ni.', 'Sample prices for this demo.', 'class="note" style="margin-top: var(--s-lg)"')}
    </div>
  </section>

${close}`;

/* ── Dentists ── */
const doktor = `${head('Doktor', 'Dentists', 'Dua doktor gigi. Anda boleh minta doktor yang sama setiap kali datang.', 'Two dentists. You can ask for the same one every visit.')}
  <section class="section section--flush">
    <div class="container bios">
      ${DOCS.map(d => `<article class="bio" id="${d.id}">
        <img src="img/${d.id}.jpg" alt="${esc(d.alt[0])}" data-alt-en="${esc(d.alt[1])}" width="640" height="800" loading="lazy">
        <div>
          <h2>${d.name}</h2>
          ${t('p', d.role[0], d.role[1], 'class="note"')}
          ${t('p', d.d[0], d.d[1], 'class="lead"')}
          <dl class="facts">
            <div>${t('dt', 'Rawatan', 'Treatments')}${t('dd', d.does[0], d.does[1])}</div>
          </dl>
        </div>
      </article>`).join('\n      ')}
      ${t('p', 'Doktor di page ni rekaan untuk demo.', 'The dentists on this page are made up for the demo.', 'class="note"')}
    </div>
  </section>

  <section class="section section--tint">
    <div class="container split">
      <img src="img/ruang.jpg" alt="Ruang menunggu dengan sudut kanak-kanak" data-alt-en="The waiting area with a children's corner" width="1200" height="900" loading="lazy">
      <div class="split__text">
        ${t('h2', 'Sebelum rawatan, kami terangkan dulu', 'Before any treatment, we explain')}
        ${t('p', 'Doktor tunjuk X-ray atau gambar gigi anda, terangkan pilihan, dan beritahu kos setiap satu. Anda yang buat keputusan.', 'The dentist shows you the X-ray or a photo of your teeth, explains the options, and tells you what each one costs. You decide.')}
      </div>
    </div>
  </section>

${close}`;

/* ── Booking ── */
const tempah = `${head('Tempah slot', 'Book a slot', 'Isi empat perkara. Kami sahkan di WhatsApp dalam 15 minit pada waktu klinik buka.', 'Fill in four things. We confirm on WhatsApp within 15 minutes during clinic hours.')}
  <section class="section section--flush">
    <div class="container two two--even">
      <form class="form" data-demo novalidate>
        <div class="form__two">
          <div>${t('label', 'Nama', 'Name', 'for="b-name"')}<input id="b-name" name="name" required autocomplete="name"></div>
          <div>${t('label', 'Nombor WhatsApp', 'WhatsApp number', 'for="b-tel"')}<input id="b-tel" name="tel" required inputmode="tel" autocomplete="tel"></div>
        </div>
        <div>${t('label', 'Rawatan', 'Treatment', 'for="b-care"')}<select id="b-care" name="care">${t('option', 'Pemeriksaan', 'Check-up')}${CARE.map(c => t('option', c.name[0], c.name[1])).join('')}${t('option', 'Belum pasti', 'Not sure yet')}</select></div>
        <fieldset>
          ${t('legend', 'Masa, hari ini', 'Time, today')}
          <div class="sizes">
            ${SLOTS.map(([s, free], i) => `<label><input type="radio" name="slot" value="${s}"${!free ? ' disabled' : ''}${i === 0 ? ' checked' : ''}><span>${s}</span></label>`).join('\n            ')}
          </div>
          ${t('p', 'Masa yang dipotong dah penuh. Slot pagi sebelum 12, selebihnya petang dan malam.', 'Times struck through are taken. Morning slots are before 12, the rest are afternoon and evening.', 'class="note"')}
        </fieldset>
        <div class="form__foot">
          ${t('button', 'Hantar tempahan', 'Send booking', 'class="btn btn--main" type="submit"')}
          <p class="form__help" id="form-help" aria-live="polite"></p>
        </div>
      </form>
      <div class="stack">
        ${t('h2', 'Waktu klinik', 'Clinic hours')}
        ${hoursTable}
        ${t('p', 'Di klinik sebenar, slot ni datang terus dari kalendar klinik, dan pesakit terima mesej pengesahan secara automatik.', 'On a real clinic site these slots come straight from the clinic calendar, and the patient gets a confirmation message automatically.', 'class="note"')}
      </div>
    </div>
  </section>`;

/* ── Contact ── */
const hubungi = `${head('Hubungi', 'Contact', 'Kami di Seksyen 13, Shah Alam. Parking percuma di depan klinik.', 'We are in Seksyen 13, Shah Alam. Parking is free in front of the clinic.')}
  <section class="section section--flush">
    <div class="container two two--even">
      <dl class="facts facts--big">
        <div>${t('dt', 'Alamat', 'Address')}<dd>Seksyen 13, 40100 Shah Alam, Selangor</dd></div>
        <div>${t('dt', 'Telefon', 'Phone')}<dd>03-5555 0127</dd></div>
        <div>${t('dt', 'Emel', 'Email')}<dd>hello@senyumsihat.example</dd></div>
        <div>${t('dt', 'Kecemasan', 'Emergencies')}${t('dd', 'Telefon dulu, kami cuba selitkan anda pada hari yang sama', 'Call first, and we try to fit you in the same day')}</div>
        <div>${t('dt', 'Panel', 'Panel')}${t('dd', 'Hantar gambar kad syarikat di WhatsApp untuk semakan', 'Send a photo of your company card on WhatsApp to check')}</div>
      </dl>
      <div class="stack">
        ${t('h2', 'Waktu klinik', 'Clinic hours')}
        ${hoursTable}
        ${t('a', 'Tempah slot', 'Book a slot', 'class="btn btn--main" href="tempah.html" style="justify-self: start"')}
      </div>
    </div>
  </section>`;

const out = [
  { name: 'index.html', title: 'Klinik Pergigian Senyum Sihat, Shah Alam', desc: 'Demo website klinik gigi: rawatan dan harga, doktor, dan tempahan slot. Demo oleh Bejaa Digital.', body: home },
  { name: 'rawatan.html', title: 'Rawatan dan harga | Senyum Sihat', desc: 'Scaling, tampal, cabut gigi, braces, pemutihan dan gigi palsu, dengan harga permulaan.', body: rawatan },
  { name: 'doktor.html', title: 'Doktor | Senyum Sihat', desc: 'Dua doktor gigi di Klinik Senyum Sihat.', body: doktor },
  { name: 'tempah.html', title: 'Tempah slot | Senyum Sihat', desc: 'Pilih rawatan dan masa, dan kami sahkan di WhatsApp.', body: tempah },
  { name: 'hubungi.html', title: 'Hubungi | Senyum Sihat', desc: 'Alamat, telefon dan waktu klinik.', body: hubungi },
];
for (const p of out) writeFileSync(new URL(p.name, import.meta.url), page(p));
console.log('built ' + out.length + ' pages');

// Builds the Amani & Partners demo (a made-up Kuala Lumpur law firm) from one layout, so the header,
// footer, WhatsApp button and both languages stay identical on every page.
// Run:  node _build.mjs   (in this folder; writes the .html files beside it)
// Every text is written once as t(tag, 'English', 'Bahasa Melayu'); app.js swaps them.
// The firm, its people, fees, address and the client quote are samples, and the pages say so.
import { writeFileSync } from 'node:fs';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const t = (tag, en, ms, attrs = '') => `<${tag}${attrs ? ' ' + attrs : ''} data-ms="${esc(ms)}">${en}</${tag}>`;

const PAGES = [
  ['practice.html', 'Practice areas', 'Bidang guaman'],
  ['approach.html', 'How we work', 'Cara kami bekerja'],
  ['people.html', 'People', 'Peguam'],
  ['notes.html', 'Notes', 'Nota'],
  ['contact.html', 'Contact', 'Hubungi'],
];

const AREAS = [
  { id: 'corporate', who: 'amani', name: ['Corporate and commercial', 'Korporat dan komersial'],
    line: ['Company formation, shareholder agreements, supply contracts, and the paperwork behind the sale of a business.', 'Penubuhan syarikat, perjanjian pemegang saham, kontrak bekalan, dan dokumen di sebalik jual beli perniagaan.'],
    forWho: ['For owners of Sdn Bhd companies, family businesses and partners starting something together.', 'Untuk pemilik Sdn Bhd, perniagaan keluarga dan rakan kongsi yang baru nak mula.'],
    work: [['Shareholders and joint venture agreements', 'Perjanjian pemegang saham dan usaha sama'], ['Supply and service contracts', 'Kontrak bekalan dan servis'], ['Sale of shares or of a business', 'Jual beli saham atau perniagaan'], ['Company secretarial matters', 'Urusan setiausaha syarikat']] },
  { id: 'property', who: 'lim', name: ['Conveyancing and property', 'Pindah milik dan hartanah'],
    line: ['Sub-sale and developer purchases, loan documents, tenancy and lease agreements, and strata title problems.', 'Pembelian subsale dan dari pemaju, dokumen pinjaman, perjanjian sewa dan pajakan, dan masalah hak milik strata.'],
    forWho: ['For house buyers and sellers, landlords, and businesses taking a shop or an office.', 'Untuk pembeli dan penjual rumah, tuan rumah, dan perniagaan yang nak sewa kedai atau pejabat.'],
    work: [['Sale and purchase agreements', 'Perjanjian jual beli'], ['Loan and charge documents', 'Dokumen pinjaman dan gadaian'], ['Tenancies and commercial leases', 'Perjanjian sewa dan pajakan komersial'], ['Strata and management body disputes', 'Pertikaian strata dan badan pengurusan']] },
  { id: 'employment', who: 'ramesh', name: ['Employment', 'Pekerjaan'],
    line: ['Contracts and handbooks that hold up, and representation at the Labour Department and the Industrial Court.', 'Kontrak dan buku panduan pekerja yang kukuh, dan wakil di Jabatan Tenaga Kerja serta Mahkamah Perusahaan.'],
    forWho: ['For employers with a staff problem, and senior employees who have been let go.', 'Untuk majikan yang ada masalah pekerja, dan pekerja kanan yang diberhentikan.'],
    work: [['Employment contracts and handbooks', 'Kontrak kerja dan buku panduan pekerja'], ['Domestic inquiries', 'Siasatan dalaman'], ['Unfair dismissal claims', 'Tuntutan pembuangan kerja tidak adil'], ['Retrenchment advice', 'Nasihat pemberhentian pekerja']] },
  { id: 'family', who: 'farhana', name: ['Family and probate', 'Keluarga dan pusaka'],
    line: ['Divorce, custody and maintenance, wills, and the grant of probate or letters of administration after a death.', 'Perceraian, hak jagaan dan nafkah, wasiat, dan geran probet atau surat kuasa mentadbir selepas kematian.'],
    forWho: ['For families going through a separation, and anyone putting their affairs in order.', 'Untuk keluarga yang sedang berpisah, dan sesiapa yang nak susun urusan harta.'],
    work: [['Divorce and custody', 'Perceraian dan hak jagaan'], ['Maintenance claims', 'Tuntutan nafkah'], ['Wills and trusts', 'Wasiat dan amanah'], ['Probate and administration', 'Probet dan pentadbiran pusaka']] },
];

const PEOPLE = [
  { id: 'amani', name: 'Amani Zulkifli', role: ['Managing partner', 'Rakan kongsi pengurusan'], area: 'corporate', year: 2009,
    bio: ['Advises family-owned manufacturers on succession and on how brothers, sisters and cousins share one company.', 'Menasihati pengilang milik keluarga tentang pewarisan, dan cara adik-beradik serta sepupu berkongsi satu syarikat.'], alt: ['Portrait of Amani Zulkifli', 'Potret Amani Zulkifli'] },
  { id: 'lim', name: 'Lim Kok Heng', role: ['Partner, property', 'Rakan kongsi, hartanah'], area: 'property', year: 2011,
    bio: ['Handles sub-sale purchases and bank loan documents, and keeps buyers told of each date that matters.', 'Mengurus pembelian subsale dan dokumen pinjaman bank, dan pastikan pembeli tahu setiap tarikh penting.'], alt: ['Portrait of Lim Kok Heng', 'Potret Lim Kok Heng'] },
  { id: 'ramesh', name: 'S. Ramesh', role: ['Partner, employment', 'Rakan kongsi, pekerjaan'], area: 'employment', year: 2013,
    bio: ['Appears at the Industrial Court and runs workplace investigations. Acts for employers and for senior employees.', 'Hadir di Mahkamah Perusahaan dan menjalankan siasatan di tempat kerja. Mewakili majikan dan juga pekerja kanan.'], alt: ['Portrait of S. Ramesh', 'Potret S. Ramesh'] },
  { id: 'farhana', name: 'Nurul Farhana', role: ['Partner, family', 'Rakan kongsi, keluarga'], area: 'family', year: 2014,
    bio: ['Divorce, custody and probate. Settles wherever a settlement is possible, and goes to court when it is not.', 'Perceraian, hak jagaan dan pusaka. Selesaikan secara baik bila boleh, dan ke mahkamah bila tak boleh.'], alt: ['Portrait of Nurul Farhana', 'Potret Nurul Farhana'] },
];
const person = id => PEOPLE.find(p => p.id === id);
const area = id => AREAS.find(a => a.id === id);

const STEPS = [
  ['First consultation', 'Konsultasi pertama', 'Forty-five minutes with the partner who would handle your matter. You leave knowing your options and the likely cost.', 'Empat puluh lima minit dengan rakan kongsi yang akan urus kes anda. Anda balik dengan tahu pilihan dan anggaran kos.'],
  ['Written scope and fee', 'Skop dan yuran bertulis', 'Before any work starts, a letter sets out what we will do, what we will not, and the fee for each stage.', 'Sebelum kerja bermula, satu surat nyatakan apa yang kami buat, apa yang tidak, dan yuran untuk setiap peringkat.'],
  ['An update every two weeks', 'Kemas kini setiap dua minggu', 'A short written update every fortnight, even when nothing has moved, so you never have to chase us.', 'Kemas kini bertulis yang ringkas setiap dua minggu, walaupun tiada perkembangan, supaya anda tak perlu kejar kami.'],
  ['Closing and handover', 'Tutup fail dan serahan', 'At the end you get the full file, the originals, and a plain note of anything you need to renew or remember.', 'Di akhir kes anda terima fail penuh, dokumen asal, dan nota ringkas tentang apa yang perlu diperbaharui atau diingat.'],
];

const NOTES = [
  { id: 'contracts', tag: 'employment', date: ['12 September 2026', '12 September 2026'], title: ['Three clauses to check in your employment contracts', 'Tiga klausa untuk disemak dalam kontrak kerja anda'],
    sum: ['Most contracts we are shown were copied from somewhere else years ago. These three parts are where they tend to be thin.', 'Kebanyakan kontrak yang kami tengok disalin dari tempat lain bertahun dulu. Tiga bahagian ni biasanya paling lemah.'],
    pts: [['Probation: how long it runs, and what has to happen for it to end or be extended.', 'Tempoh percubaan: berapa lama, dan apa yang perlu berlaku untuk ia tamat atau disambung.'], ['Restraint after leaving: Malaysian law treats most of these clauses as void, so protect confidential information instead.', 'Sekatan selepas berhenti: undang-undang Malaysia anggap kebanyakan klausa ni tak sah, jadi lindungi maklumat sulit sebagai ganti.'], ['Personal data: say what you collect about staff and why, and get their consent in writing.', 'Data peribadi: nyatakan apa yang dikumpul tentang pekerja dan kenapa, dan dapatkan persetujuan bertulis.']] },
  { id: 'subsale', tag: 'property', date: ['28 August 2026', '28 Ogos 2026'], title: ['Buying a sub-sale unit: read this before paying the booking fee', 'Beli rumah subsale: baca ni sebelum bayar booking'],
    sum: ['Money paid before the agreement is signed is harder to get back than most buyers expect.', 'Duit yang dibayar sebelum perjanjian ditandatangan lebih susah dapat balik daripada yang pembeli sangka.'],
    pts: [['Ask who holds the booking fee, and get the terms for a refund in writing.', 'Tanya siapa yang pegang duit booking, dan dapatkan syarat bayaran balik secara bertulis.'], ['Check the title: who owns it, and whether the land office or the state must consent to the sale.', 'Semak hak milik: siapa pemilik, dan sama ada pejabat tanah atau kerajaan negeri perlu beri kebenaran.'], ['Have your loan approved in principle before you commit to the dates in the agreement.', 'Dapatkan kelulusan awal pinjaman sebelum bersetuju dengan tarikh dalam perjanjian.']] },
  { id: 'brothers', tag: 'corporate', date: ['14 August 2026', '14 Ogos 2026'], title: ['Two brothers, one Sdn Bhd, no shareholders agreement', 'Dua beradik, satu Sdn Bhd, tiada perjanjian pemegang saham'],
    sum: ['The commonest gap we see in family businesses. Three decisions are worth writing down while everyone still agrees.', 'Kekurangan paling biasa dalam perniagaan keluarga. Tiga keputusan ni elok ditulis semasa semua orang masih sepakat.'],
    pts: [['Who decides what, and which decisions need both of you.', 'Siapa putuskan apa, dan keputusan mana yang perlukan kedua-dua pihak.'], ['What happens to the shares if one of you wants to leave, or dies.', 'Apa jadi pada saham kalau seorang nak keluar, atau meninggal.'], ['How the company pays you: salary, dividends, and loans to directors.', 'Macam mana syarikat bayar anda: gaji, dividen, dan pinjaman kepada pengarah.']] },
];

const FEES = [
  [['First consultation, 45 minutes', 'Konsultasi pertama, 45 minit'], 'RM250', ['Taken off your bill if you engage us', 'Ditolak dari bil kalau anda lantik kami']],
  [['Setting up a Sdn Bhd', 'Tubuhkan Sdn Bhd'], ['From RM1,800', 'Dari RM1,800'], ['Excludes government fees', 'Tak termasuk yuran kerajaan']],
  [['A simple will', 'Wasiat ringkas'], ['From RM600', 'Dari RM600'], ['One meeting and one revision', 'Satu perjumpaan dan satu semakan']],
  [['Probate, uncontested', 'Probet, tiada bantahan'], ['From RM3,500', 'Dari RM3,500'], ['Excludes court filing fees', 'Tak termasuk yuran pemfailan mahkamah']],
  [['Buying or selling property', 'Jual beli hartanah'], ['Scale fee', 'Yuran skala'], ['Set by the Solicitors\' Remuneration Order', 'Ditetapkan oleh Perintah Saraan Peguam Cara']],
  [['Court matters', 'Kes mahkamah'], ['Quoted by stage', 'Sebut harga ikut peringkat'], ['You approve each stage first', 'Anda luluskan setiap peringkat dulu']],
];

const WA_ICON = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 20.5l1.3-4.6A8.3 8.3 0 1 1 8.2 19.3z"/><path d="M9 8.6c.3 2.7 2.6 5.2 5.6 6l1.3-1.3-2-1.1-.9.8c-.9-.5-1.7-1.3-2.2-2.2l.8-.9-1.1-2z"/></svg>';

function page({ name, title, desc, body }) {
  const nav = PAGES.map(([href, en, ms]) => `<li>${t('a', en, ms, `href="${href}"${href === name ? ' aria-current="page"' : ''}`)}</li>`).join('\n        ');
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<meta name="description" content="${esc(desc)}">
<meta name="robots" content="noindex">
<link rel="stylesheet" href="style.css">
</head>
<body>
${t('a', 'Skip to content', 'Terus ke kandungan', 'class="skip" href="#main"')}

<header class="nav">
  <div class="container nav__in">
    <a class="nav__mark" href="index.html" aria-label="Amani &amp; Partners, home">Amani &amp; Partners</a>
    <ul class="nav__links">
        ${nav}
    </ul>
    <button class="nav__lang" type="button" id="lang" aria-label="Tukar ke Bahasa Melayu">BM</button>
    ${t('a', 'Book a consultation', 'Tempah konsultasi', 'class="btn btn--main btn--sm" href="contact.html#book"')}
    <details class="nav__menu">
      <summary>Menu</summary>
      <ul>
        ${nav}
        <li>${t('a', 'Book a consultation', 'Tempah konsultasi', 'href="contact.html#book"')}</li>
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
        <p class="foot__mark">Amani &amp; Partners</p>
        ${t('p', 'Advocates and solicitors, Kuala Lumpur.', 'Peguam bela dan peguam cara, Kuala Lumpur.', 'style="margin-top: var(--s-sm)"')}
      </div>
      <ul>
        ${PAGES.map(([href, en, ms]) => `<li>${t('a', en, ms, `href="${href}"`)}</li>`).join('\n        ')}
      </ul>
      <p>${t('b', 'Office', 'Pejabat')}Level 18, Menara Amani, Jalan Sultan Ismail, 50250 Kuala Lumpur<br>03-5555 0118<br>enquiry@amanipartners.example</p>
      <p>${t('b', 'Hours', 'Waktu')}${t('span', 'Monday to Friday, 9 am to 6 pm', 'Isnin hingga Jumaat, 9 pagi hingga 6 petang')}</p>
    </div>
    ${t('p', 'A demo by Bejaa Digital. The firm, its lawyers, fees, address and the client quote are made up, and nothing on this site is legal advice. Photos are made with AI.', 'Demo oleh Bejaa Digital. Firma, peguam, yuran, alamat dan petikan client ni rekaan, dan tiada apa di laman ni yang merupakan nasihat guaman. Gambar dibuat dengan AI.', 'class="foot__note"')}
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

const book = `  <section class="section section--dark">
    <div class="container close">
      ${t('h2', 'Tell us what the matter is', 'Ceritakan kes anda')}
      ${t('p', 'A partner reads every enquiry and replies within one working day.', 'Seorang rakan kongsi baca setiap pertanyaan dan balas dalam satu hari bekerja.', 'class="lead"')}
      ${t('a', 'Book a consultation', 'Tempah konsultasi', 'class="btn btn--light" href="contact.html#book"')}
    </div>
  </section>`;

const areaRows = `<ul class="rows">
        ${AREAS.map((a, i) => `<li><a href="practice.html#${a.id}"><span class="rows__no">0${i + 1}</span>${t('h3', a.name[0], a.name[1])}${t('p', a.line[0], a.line[1])}</a></li>`).join('\n        ')}
      </ul>`;

const peopleCards = `<ul class="people">
        ${PEOPLE.map(p => `<li><a href="people.html#${p.id}"><img src="img/${p.id}.jpg" alt="${esc(p.alt[0])}" data-alt-ms="${esc(p.alt[1])}" width="640" height="800" loading="lazy"><h3>${p.name}</h3>${t('p', p.role[0], p.role[1], 'class="note"')}</a></li>`).join('\n        ')}
      </ul>`;

const noteList = `<ul class="notes">
        ${NOTES.map(n => `<li><a href="notes.html#${n.id}">${t('span', n.date[0], n.date[1], 'class="note"')}${t('h3', n.title[0], n.title[1])}${t('p', n.sum[0], n.sum[1])}</a></li>`).join('\n        ')}
      </ul>`;

/* ── Home ── */
const home = `  <section class="hero">
    <div class="container hero__in">
      <div class="hero__text">
        ${t('h1', 'Clear legal advice, before it becomes a dispute', 'Nasihat guaman yang jelas, sebelum ia jadi pertikaian')}
        ${t('p', 'We act for Malaysian SMEs, property buyers and families. You deal with the partner handling your matter, every time you call.', 'Kami mewakili PKS Malaysia, pembeli hartanah dan keluarga. Anda berurusan dengan rakan kongsi yang urus kes anda, setiap kali anda telefon.', 'class="lead"')}
        <div class="hero__acts">
          ${t('a', 'Book a consultation', 'Tempah konsultasi', 'class="btn btn--main" href="contact.html#book"')}
          ${t('a', 'See what we handle', 'Lihat bidang kami', 'class="btn btn--line" href="practice.html"')}
        </div>
      </div>
      <img class="hero__pic" src="img/room.jpg" alt="The meeting room at Amani &amp; Partners" data-alt-ms="Bilik mesyuarat di Amani &amp; Partners" width="1500" height="1000">
    </div>
    <div class="container">
      <ul class="strip">
        <li>${t('b', '2009', '2009')}${t('span', 'the year the firm opened', 'tahun firma ni dibuka')}</li>
        <li>${t('b', '4 areas', '4 bidang')}${t('span', 'and we refer you elsewhere for the rest', 'dan kami rujuk anda ke firma lain untuk yang selebihnya')}</li>
        <li>${t('b', '1 day', '1 hari')}${t('span', 'for a partner to reply to your enquiry', 'untuk rakan kongsi balas pertanyaan anda')}</li>
        <li>${t('b', '2 weeks', '2 minggu')}${t('span', 'between written updates, always', 'antara kemas kini bertulis, sentiasa')}</li>
      </ul>
    </div>
  </section>

  <section class="section section--tint">
    <div class="container">
      <div class="head">
        ${t('h2', 'Four areas, handled every day', 'Empat bidang, diurus setiap hari')}
        ${t('p', 'We stay narrow on purpose. If your matter falls outside these, we say so and point you to a firm that does it daily.', 'Kami sengaja fokus. Kalau kes anda di luar bidang ni, kami beritahu dan tunjukkan firma yang buat kerja tu setiap hari.', 'class="lead"')}
      </div>
      ${areaRows}
    </div>
  </section>

  <section class="section">
    <div class="container split">
      <img src="img/desk.jpg" alt="An open file and a pen on a lawyer's desk" data-alt-ms="Fail terbuka dan pen di atas meja peguam" width="1200" height="900" loading="lazy">
      <div class="split__text">
        ${t('h2', 'You will know the cost before we start', 'Anda tahu kosnya sebelum kami mula')}
        ${t('p', 'Wills, probate and company set-up are fixed fees. Court matters are quoted in stages, and you approve each stage before we go on.', 'Wasiat, probet dan penubuhan syarikat guna yuran tetap. Kes mahkamah disebut harga ikut peringkat, dan anda luluskan setiap peringkat sebelum kami teruskan.')}
        ${t('a', 'How a matter runs, and the fees', 'Perjalanan kes, dan yuran', 'class="btn btn--line" href="approach.html"')}
      </div>
    </div>
  </section>

  <section class="section section--tint">
    <div class="container">
      <div class="head">${t('h2', 'The partners you will deal with', 'Rakan kongsi yang akan urus kes anda')}</div>
      ${peopleCards}
    </div>
  </section>

  <section class="section">
    <div class="container">
      <figure class="quote">
        ${t('blockquote', 'They told us plainly that court would cost more than the sum in dispute, and settled it in three weeks instead.', 'Mereka cakap terus terang yang mahkamah akan makan kos lebih daripada jumlah yang dipertikaikan, dan selesaikan dalam tiga minggu.')}
        ${t('figcaption', 'Director of a packaging manufacturer. A sample quote, written for this demo.', 'Pengarah sebuah kilang pembungkusan. Petikan contoh, ditulis untuk demo ni.', 'class="note"')}
      </figure>
    </div>
  </section>

  <section class="section section--tint">
    <div class="container">
      <div class="head head--row">
        ${t('h2', 'Notes for business owners', 'Nota untuk pemilik perniagaan')}
        ${t('a', 'All notes', 'Semua nota', 'class="more" href="notes.html"')}
      </div>
      ${noteList}
    </div>
  </section>

${book}`;

/* ── Practice areas ── */
const practice = `${head('Practice areas', 'Bidang guaman', 'Four areas. Each has one partner who answers for it.', 'Empat bidang. Setiap satu ada seorang rakan kongsi yang bertanggungjawab.')}
${AREAS.map((a, i) => { const p = person(a.who); return `  <section class="section${i % 2 ? ' section--tint' : ''}${i === 0 ? ' section--flush' : ''}" id="${a.id}">
    <div class="container two">
      <div>
        ${t('h2', a.name[0], a.name[1])}
        ${t('p', a.line[0], a.line[1], 'class="lead"')}
        ${t('p', a.forWho[0], a.forWho[1])}
      </div>
      <div class="stack">
        <ul class="ticks">
          ${a.work.map(([en, ms]) => t('li', en, ms)).join('\n          ')}
        </ul>
        <a class="who" href="people.html#${p.id}"><img src="img/${p.id}.jpg" alt="" width="640" height="800" loading="lazy"><span><b>${p.name}</b>${t('span', p.role[0], p.role[1])}</span></a>
      </div>
    </div>
  </section>`; }).join('\n\n')}

${book}`;

/* ── Approach ── */
const approach = `${head('How we work', 'Cara kami bekerja', 'Most clients come to us tired of not being told what is happening. We fixed that with a routine.', 'Ramai client datang sebab penat tak diberitahu apa yang berlaku. Kami selesaikan dengan satu rutin.')}
  <section class="section section--flush">
    <div class="container">
      <ol class="steps">
        ${STEPS.map(([en, ms, den, dms]) => `<li>${t('h3', en, ms)}${t('p', den, dms)}</li>`).join('\n        ')}
      </ol>
    </div>
  </section>

  <section class="section section--tint" id="fees">
    <div class="container two">
      <div>
        ${t('h2', 'Fees', 'Yuran')}
        ${t('p', 'Sample figures for this demo. A real firm would list its own.', 'Angka contoh untuk demo ni. Firma sebenar akan letak angka sendiri.', 'class="note"')}
      </div>
      <div class="scroll"><table>
        <thead><tr>${t('th', 'Work', 'Kerja', 'scope="col"')}${t('th', 'Fee', 'Yuran', 'scope="col"')}${t('th', 'Note', 'Nota', 'scope="col"')}</tr></thead>
        <tbody>
          ${FEES.map(([w, f, n]) => `<tr>${t('th', w[0], w[1], 'scope="row"')}${Array.isArray(f) ? t('td', f[0], f[1]) : `<td>${f}</td>`}${t('td', n[0], n[1])}</tr>`).join('\n          ')}
        </tbody>
      </table></div>
    </div>
  </section>

  <section class="section" id="languages">
    <div class="container split">
      <img src="img/desk.jpg" alt="" data-alt-ms="Fail terbuka dan pen di atas meja peguam" width="1200" height="900" loading="lazy">
      <div class="split__text">
        ${t('h2', 'In Bahasa Malaysia, English or Mandarin', 'Dalam Bahasa Malaysia, Inggeris atau Mandarin')}
        ${t('p', 'Meetings, contracts and court papers are handled in the language you are comfortable with. Tamil is available through a consultant.', 'Perjumpaan, kontrak dan dokumen mahkamah diurus dalam bahasa yang anda selesa. Bahasa Tamil boleh diatur melalui perunding.')}
      </div>
    </div>
  </section>

${book}`;

/* ── People ── */
const people = `${head('People', 'Peguam', 'Four partners. The one you meet first stays on your matter to the end.', 'Empat rakan kongsi. Yang anda jumpa mula-mula akan urus kes anda sampai habis.')}
  <section class="section section--flush">
    <div class="container bios">
      ${PEOPLE.map(p => { const a = area(p.area); return `<article class="bio" id="${p.id}">
        <img src="img/${p.id}.jpg" alt="${esc(p.alt[0])}" data-alt-ms="${esc(p.alt[1])}" width="640" height="800" loading="lazy">
        <div>
          <h2>${p.name}</h2>
          ${t('p', p.role[0], p.role[1], 'class="note"')}
          ${t('p', p.bio[0], p.bio[1], 'class="lead"')}
          <dl class="facts">
            <div>${t('dt', 'Called to the Bar', 'Diterima masuk Bar')}<dd>${p.year}</dd></div>
            <div>${t('dt', 'Handles', 'Mengurus')}<dd>${t('a', a.name[0], a.name[1], `href="practice.html#${a.id}"`)}</dd></div>
          </dl>
        </div>
      </article>`; }).join('\n      ')}
      ${t('p', 'The lawyers on this page are made up for the demo.', 'Peguam di page ni rekaan untuk demo.', 'class="note"')}
    </div>
  </section>

${book}`;

/* ── Notes ── */
const notes = `${head('Notes', 'Nota', 'Short notes on questions clients ask us most. General information only, not legal advice.', 'Nota ringkas tentang soalan yang client paling kerap tanya. Maklumat umum sahaja, bukan nasihat guaman.')}
  <section class="section section--flush">
    <div class="container articles">
      ${NOTES.map(n => { const a = area(n.tag); return `<article id="${n.id}">
        ${t('p', n.date[0], n.date[1], 'class="note"')}
        ${t('h2', n.title[0], n.title[1])}
        ${t('p', n.sum[0], n.sum[1], 'class="lead"')}
        <ul class="ticks">
          ${n.pts.map(([en, ms]) => t('li', en, ms)).join('\n          ')}
        </ul>
        ${t('a', `More on ${a.name[0].toLowerCase()}`, `Lagi tentang ${a.name[1].toLowerCase()}`, `class="more" href="practice.html#${a.id}"`)}
      </article>`; }).join('\n      ')}
    </div>
  </section>

${book}`;

/* ── Contact ── */
const contact = `${head('Contact', 'Hubungi', 'Tell us roughly what the matter is. A partner replies within one working day.', 'Ceritakan secara ringkas kes anda. Seorang rakan kongsi balas dalam satu hari bekerja.')}
  <section class="section section--flush" id="book">
    <div class="container two two--even">
      <dl class="facts facts--big">
        <div>${t('dt', 'Office', 'Pejabat')}<dd>Level 18, Menara Amani, Jalan Sultan Ismail, 50250 Kuala Lumpur</dd></div>
        <div>${t('dt', 'Hours', 'Waktu')}${t('dd', 'Monday to Friday, 9 am to 6 pm', 'Isnin hingga Jumaat, 9 pagi hingga 6 petang')}</div>
        <div>${t('dt', 'Phone', 'Telefon')}<dd>03-5555 0118</dd></div>
        <div>${t('dt', 'Email', 'Emel')}<dd>enquiry@amanipartners.example</dd></div>
        <div>${t('dt', 'Parking', 'Parking')}${t('dd', 'Visitor bays on level B2, we stamp your ticket', 'Petak pelawat di aras B2, kami cop tiket anda')}</div>
      </dl>
      <form class="form" data-demo novalidate>
        ${t('h2', 'Request a consultation', 'Minta konsultasi')}
        <div class="form__two">
          <div>${t('label', 'Name', 'Nama', 'for="c-name"')}<input id="c-name" name="name" required autocomplete="name"></div>
          <div>${t('label', 'Phone', 'Telefon', 'for="c-tel"')}<input id="c-tel" name="tel" required inputmode="tel" autocomplete="tel"></div>
        </div>
        <div>${t('label', 'Area', 'Bidang', 'for="c-area"')}<select id="c-area" name="area">${AREAS.map(a => t('option', a.name[0], a.name[1])).join('')}${t('option', 'Not sure yet', 'Belum pasti')}</select></div>
        <div>${t('label', 'What happened, in a few lines', 'Apa yang berlaku, dalam beberapa baris', 'for="c-msg"')}<textarea id="c-msg" name="msg" rows="4"></textarea></div>
        <div class="form__foot">
          ${t('button', 'Send enquiry', 'Hantar pertanyaan', 'class="btn btn--main" type="submit"')}
          <p class="form__help" aria-live="polite" data-need-en="Add your name and a phone number so a partner can call you back." data-need-ms="Isi nama dan nombor telefon supaya rakan kongsi boleh hubungi anda." data-done-en="Nothing was sent: this is a demo form and it is not connected." data-done-ms="Tiada apa dihantar: ini borang demo dan ia tak disambung."></p>
        </div>
        ${t('p', 'Sending an enquiry does not make us your lawyers. That starts when both sides sign an engagement letter.', 'Menghantar pertanyaan belum menjadikan kami peguam anda. Itu bermula bila kedua-dua pihak tandatangan surat pelantikan.', 'class="note"')}
      </form>
    </div>
  </section>`;

const out = [
  { name: 'index.html', title: 'Amani & Partners: advocates and solicitors, Kuala Lumpur', desc: 'Law firm website demo: practice areas, the partners, fees and a consultation form. A demo by Bejaa Digital.', body: home },
  { name: 'practice.html', title: 'Practice areas | Amani & Partners', desc: 'Corporate, property, employment and family law.', body: practice },
  { name: 'approach.html', title: 'How we work | Amani & Partners', desc: 'How a matter runs, sample fees and the languages we work in.', body: approach },
  { name: 'people.html', title: 'People | Amani & Partners', desc: 'The four partners.', body: people },
  { name: 'notes.html', title: 'Notes | Amani & Partners', desc: 'Short notes for business owners, buyers and families.', body: notes },
  { name: 'contact.html', title: 'Contact | Amani & Partners', desc: 'Office, hours and a consultation request form.', body: contact },
];
for (const p of out) writeFileSync(new URL(p.name, import.meta.url), page(p));
console.log('built ' + out.length + ' pages');

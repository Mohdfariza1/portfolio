// Builds the Kuasa Fitness demo (a made-up gym in Puchong): ONE landing page with one offer,
// a 7-day trial pass. Run:  node _build.mjs   (in this folder; writes index.html beside it)
// Every text is written once as t(tag, 'English', 'Bahasa Melayu'); app.js swaps them.
// The gym, coaches, prices, timetable and contact details are samples, and the page says so.
import { writeFileSync } from 'node:fs';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const t = (tag, en, ms, attrs = '') => `<${tag}${attrs ? ' ' + attrs : ''} data-ms="${esc(ms)}">${en}</${tag}>`;

const LINKS = [['#classes', 'Classes', 'Kelas'], ['#timetable', 'Timetable', 'Jadual'], ['#plans', 'Membership', 'Keahlian'], ['#coaches', 'Coaches', 'Coach']];

const CLASSES = [
  { id: 'strength', name: ['Strength Club', 'Strength Club'], mins: 60, cap: 12, d: ['Squat, press and deadlift with a barbell. Your coach writes down your numbers each week, so you can see the load go up.', 'Squat, press dan deadlift dengan barbell. Coach catat angka anda setiap minggu, jadi anda nampak beban naik.'], alt: ['Chalked hands on a loaded barbell', 'Tangan berkapur memegang barbell'] },
  { id: 'hiit', name: ['HIIT Burn', 'HIIT Burn'], mins: 45, cap: 16, d: ['Short, hard rounds on the rower, the bike and the sled. Book this one if you have 45 minutes and want to sweat.', 'Pusingan pendek dan laju atas rower, basikal dan sled. Pilih yang ni kalau ada 45 minit dan nak berpeluh.'], alt: ['A member on a rowing machine', 'Ahli sedang guna mesin rower'] },
  { id: 'boxing', name: ['Boxing Basics', 'Boxing Basics'], mins: 60, cap: 14, d: ['Stance, jab, cross, footwork and pad work with a partner. No sparring unless you ask for it.', 'Stance, jab, cross, footwork dan pad work dengan pasangan. Tiada sparring kecuali anda minta.'], alt: ['Boxing gloves hitting focus pads', 'Sarung tinju memukul pad'] },
  { id: 'mobility', name: ['Mobility and Core', 'Mobility dan Core'], mins: 40, cap: 18, d: ['For backs stiff from the desk and tight hips. Low impact, and fine if you have not trained in years.', 'Untuk belakang yang kejang sebab duduk lama dan pinggul yang ketat. Ringan, sesuai walaupun dah lama tak bersenam.'], alt: ['A member stretching on a mat', 'Ahli sedang stretching atas mat'] },
];
const cls = id => CLASSES.find(c => c.id === id);

const COACHES = [
  { id: 'arif', name: 'Arif Rahman', role: ['Head coach, strength', 'Ketua coach, strength'], d: ['Fourteen years of coaching, from a powerlifting background. Patient with complete beginners.', 'Empat belas tahun jadi coach, berlatar belakang powerlifting. Sabar dengan yang baru mula.'] },
  { id: 'sofea', name: 'Sofea Nadia', role: ['HIIT and conditioning', 'HIIT dan conditioning'], d: ['Played hockey for her state. Runs the 6 am class that fills up first every week.', 'Bekas pemain hoki negeri. Kendalikan kelas 6 pagi yang penuh dulu setiap minggu.'] },
  { id: 'jason', name: 'Jason Lim', role: ['Boxing', 'Boxing'], d: ['Boxed as an amateur for eight years. Teaches technique first and power later.', 'Bertinju amatur selama lapan tahun. Ajar teknik dulu, kuasa kemudian.'] },
  { id: 'priya', name: 'Priya Vasu', role: ['Mobility and rehab', 'Mobility dan rehab'], d: ['Trained as a physiotherapist. The one to see when your lower back complains after a day at the desk.', 'Terlatih sebagai fisioterapis. Jumpa dia bila pinggang sakit lepas seharian di meja.'] },
];
const coach = id => COACHES.find(c => c.id === id).name.split(' ')[0];

const DAYS = [['mon', 'Mon', 'Isn'], ['tue', 'Tue', 'Sel'], ['wed', 'Wed', 'Rab'], ['thu', 'Thu', 'Kha'], ['fri', 'Fri', 'Jum'], ['sat', 'Sat', 'Sab']];
// time, class, coach, places left (0 = full)
const TABLE = {
  mon: [['6:00 am', 'hiit', 'sofea', 3], ['12:30 pm', 'mobility', 'priya', 9], ['6:30 pm', 'strength', 'arif', 0], ['8:00 pm', 'boxing', 'jason', 5]],
  tue: [['6:00 am', 'strength', 'arif', 4], ['12:30 pm', 'hiit', 'sofea', 8], ['6:30 pm', 'boxing', 'jason', 2], ['8:00 pm', 'mobility', 'priya', 11]],
  wed: [['6:00 am', 'hiit', 'sofea', 0], ['12:30 pm', 'mobility', 'priya', 7], ['6:30 pm', 'strength', 'arif', 3], ['8:00 pm', 'hiit', 'sofea', 6]],
  thu: [['6:00 am', 'strength', 'arif', 5], ['12:30 pm', 'boxing', 'jason', 6], ['6:30 pm', 'hiit', 'sofea', 1], ['8:00 pm', 'mobility', 'priya', 12]],
  fri: [['6:00 am', 'hiit', 'sofea', 4], ['12:30 pm', 'strength', 'arif', 6], ['6:30 pm', 'boxing', 'jason', 0], ['8:00 pm', 'strength', 'arif', 2]],
  sat: [['8:00 am', 'strength', 'arif', 3], ['9:30 am', 'boxing', 'jason', 4], ['11:00 am', 'mobility', 'priya', 10]],
};
const left = n => n === 0 ? t('span', 'Full', 'Penuh', 'class="slot__left slot__left--full"') : t('span', `${n} places left`, `${n} tempat lagi`, 'class="slot__left"');

const PLANS = [
  { name: ['Gym Only', 'Gym Sahaja'], price: 99, for: ['If you already know what to do on the gym floor.', 'Kalau anda dah tahu nak buat apa di gym.'], has: [['Gym floor, 6 am to 12 am', 'Ruang gym, 6 pagi hingga 12 malam'], ['One induction session', 'Satu sesi pengenalan'], ['Locker and shower', 'Loker dan bilik mandi']] },
  { name: ['All Access', 'Semua Akses'], price: 169, pick: true, for: ['Most members choose this. Classes are what get you to turn up.', 'Paling ramai pilih. Kelas yang buat anda betul-betul datang.'], has: [['Everything in Gym Only', 'Semua dalam Gym Sahaja'], ['Every group class, no limit', 'Semua kelas, tanpa had'], ['A check-in with a coach every 4 weeks', 'Semakan dengan coach setiap 4 minggu'], ['Bring a friend once a month', 'Bawa kawan sekali sebulan']] },
  { name: ['Personal Training', 'Latihan Peribadi'], price: 420, for: ['If you want a coach beside you and a plan written for you.', 'Kalau anda nak coach di sebelah dan pelan yang ditulis untuk anda.'], has: [['Everything in All Access', 'Semua dalam Semua Akses'], ['8 one-to-one sessions a month', '8 sesi seorang-seorang sebulan'], ['A written training plan', 'Pelan latihan bertulis'], ['WhatsApp your coach any time', 'WhatsApp coach bila-bila masa']] },
];

const FAQ = [
  ['What is in the 7-day trial?', 'Apa yang ada dalam trial 7 hari?', 'The gym floor for seven days and any three group classes. No card and no joining fee.', 'Ruang gym selama tujuh hari dan mana-mana tiga kelas. Tiada kad dan tiada yuran daftar.'],
  ['I have never lifted before. Is that fine?', 'Saya tak pernah angkat berat. Boleh ke?', 'Yes. Every class has a cap, so the coach has time to teach you each movement from the start.', 'Boleh. Setiap kelas ada had, jadi coach ada masa ajar setiap pergerakan dari mula.'],
  ['Is there a contract?', 'Ada kontrak?', 'No. Monthly plans stop with 30 days notice. Yearly plans are paid up front and cost 20% less.', 'Tiada. Pelan bulanan boleh berhenti dengan notis 30 hari. Pelan tahunan dibayar dulu dan 20% lebih murah.'],
  ['Is there a ladies-only time?', 'Ada waktu untuk wanita sahaja?', 'Yes, Tuesday and Thursday from 10 am to 12 pm, with a female coach on the floor.', 'Ada, Selasa dan Khamis dari 10 pagi hingga 12 tengah hari, dengan coach wanita.'],
  ['Where do I park?', 'Parking di mana?', 'In the open car park behind the building. It is free for members.', 'Di tempat letak kereta terbuka belakang bangunan. Percuma untuk ahli.'],
];

const WA_ICON = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 20.5l1.3-4.6A8.3 8.3 0 1 1 8.2 19.3z"/><path d="M9 8.6c.3 2.7 2.6 5.2 5.6 6l1.3-1.3-2-1.1-.9.8c-.9-.5-1.7-1.3-2.2-2.2l.8-.9-1.1-2z"/></svg>';
const nav = LINKS.map(([href, en, ms]) => `<li>${t('a', en, ms, `href="${href}"`)}</li>`).join('\n        ');

const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Kuasa Fitness: 7-day free trial, Puchong</title>
<meta name="description" content="Landing page demo for a gym: one offer, a 7-day trial pass, with classes, a timetable and plans. A demo by Bejaa Digital.">
<meta name="robots" content="noindex">
<link rel="stylesheet" href="style.css">
</head>
<body>
${t('a', 'Skip to content', 'Terus ke kandungan', 'class="skip" href="#main"')}

<header class="nav">
  <div class="container nav__in">
    <a class="nav__mark" href="#main" aria-label="Kuasa Fitness">Kuasa Fitness</a>
    <ul class="nav__links">
        ${nav}
    </ul>
    <button class="nav__lang" type="button" id="lang" aria-label="Tukar ke Bahasa Melayu">BM</button>
    ${t('a', 'Free trial', 'Trial percuma', 'class="btn btn--main btn--sm" href="#trial"')}
    <details class="nav__menu">
      <summary>Menu</summary>
      <ul>
        ${nav}
      </ul>
    </details>
  </div>
</header>

<main id="main">
  <section class="hero">
    <div class="container hero__in">
      <div class="hero__text">
        ${t('h1', 'Stop paying for a gym you never use', 'Berhenti bayar gym yang anda tak pernah pergi')}
        ${t('p', 'Coach-led strength, HIIT and boxing classes on a fixed timetable. You turn up because someone is waiting for you.', 'Kelas strength, HIIT dan boxing dengan coach, ikut jadual tetap. Anda datang sebab ada orang tunggu.', 'class="lead"')}
        ${t('a', 'See this week\'s classes', 'Lihat kelas minggu ni', 'class="btn btn--line" href="#timetable"')}
      </div>
      <form class="form" id="trial" data-demo novalidate>
        ${t('h2', 'Claim your 7-day pass', 'Ambil pass 7 hari anda')}
        ${t('p', 'The gym floor and any three classes. No card, no joining fee.', 'Ruang gym dan mana-mana tiga kelas. Tiada kad, tiada yuran daftar.')}
        <div>${t('label', 'Name', 'Nama', 'for="f-name"')}<input id="f-name" name="name" required autocomplete="name"></div>
        <div>${t('label', 'WhatsApp number', 'Nombor WhatsApp', 'for="f-tel"')}<input id="f-tel" name="tel" required inputmode="tel" autocomplete="tel"></div>
        <div>${t('label', 'What are you after?', 'Apa matlamat anda?', 'for="f-goal"')}<select id="f-goal" name="goal">${t('option', 'Lose weight', 'Turun berat')}${t('option', 'Build strength', 'Bina kekuatan')}${t('option', 'Learn boxing', 'Belajar boxing')}${t('option', 'Stay active after work', 'Kekal aktif lepas kerja')}</select></div>
        ${t('button', 'Get my trial pass', 'Dapatkan pass saya', 'class="btn btn--main btn--wide" type="submit"')}
        <p class="form__help" aria-live="polite" data-need-en="Add your name and a WhatsApp number so we can send the pass." data-need-ms="Isi nama dan nombor WhatsApp supaya kami boleh hantar pass." data-done-en="Nothing was sent: this is a demo form. On a real page the pass goes out on WhatsApp within the hour." data-done-ms="Tiada apa dihantar: ini borang demo. Di page sebenar, pass dihantar di WhatsApp dalam sejam."></p>
      </form>
    </div>
    <div class="container">
      <img class="hero__wide" src="img/floor.jpg" alt="The gym floor at Kuasa Fitness, with a row of squat racks" data-alt-ms="Ruang gym Kuasa Fitness dengan sebaris squat rack" width="1500" height="1000">
      <ul class="strip">
        <li>${t('b', '7 days', '7 hari')}${t('span', 'free, with any three classes', 'percuma, dengan mana-mana tiga kelas')}</li>
        <li>${t('b', 'RM0', 'RM0')}${t('span', 'joining fee, now and later', 'yuran daftar, sekarang dan nanti')}</li>
        <li>${t('b', '12', '12')}${t('span', 'people at most in a strength class', 'orang paling ramai dalam kelas strength')}</li>
        <li>${t('b', '6 am', '6 pagi')}${t('span', 'to midnight on weekdays', 'hingga tengah malam pada hari bekerja')}</li>
      </ul>
    </div>
  </section>

  <section class="section section--tint" id="classes">
    <div class="container">
      <div class="head">
        ${t('h2', 'Four ways to train', 'Empat cara berlatih')}
        ${t('p', 'Every class has a cap, so the coach can correct your form.', 'Setiap kelas ada had, jadi coach sempat betulkan pergerakan anda.', 'class="lead"')}
      </div>
      <ul class="klass">
        ${CLASSES.map(c => `<li><img src="img/${c.id}.jpg" alt="${esc(c.alt[0])}" data-alt-ms="${esc(c.alt[1])}" width="1200" height="900" loading="lazy">${t('h3', c.name[0], c.name[1])}${t('p', c.d[0], c.d[1])}${t('p', `${c.mins} minutes, ${c.cap} people at most`, `${c.mins} minit, paling ramai ${c.cap} orang`, 'class="note"')}</li>`).join('\n        ')}
      </ul>
    </div>
  </section>

  <section class="section" id="timetable">
    <div class="container two">
      <div>
        ${t('h2', 'This week\'s classes', 'Kelas minggu ni')}
        ${t('p', 'Pick a day. On a real page the places left come straight from the booking system.', 'Pilih hari. Di page sebenar, baki tempat datang terus dari sistem booking.', 'class="lead"')}
        ${t('a', 'Try a class free', 'Cuba satu kelas percuma', 'class="btn btn--main" href="#trial"')}
      </div>
      <div class="days" id="days">
        <div class="days__tabs" role="group" aria-label="Day">
          ${DAYS.map(([k, en, ms], i) => t('button', en, ms, `type="button" class="chip" data-day="${k}" aria-pressed="${i === 0}"`)).join('\n          ')}
        </div>
        ${DAYS.map(([k]) => `<ul class="slots" data-day="${k}">
          ${TABLE[k].map(([time, c, who, n]) => `<li><b>${time}</b><span>${t('span', cls(c).name[0], cls(c).name[1], 'class="slot__name"')}${t('span', `with ${coach(who)}`, `dengan ${coach(who)}`, 'class="note"')}</span>${left(n)}</li>`).join('\n          ')}
        </ul>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="section section--tint" id="plans">
    <div class="container">
      <div class="head head--row">
        ${t('h2', 'Simple plans, no contract', 'Pelan mudah, tiada kontrak')}
        <div class="bill" role="group" aria-label="Billing">
          ${t('button', 'Monthly', 'Bulanan', 'type="button" class="chip" data-bill="month" aria-pressed="true"')}
          ${t('button', 'Yearly, 20% less', 'Tahunan, 20% kurang', 'type="button" class="chip" data-bill="year" aria-pressed="false"')}
        </div>
      </div>
      <ul class="plans">
        ${PLANS.map(p => `<li class="plan${p.pick ? ' plan--pick' : ''}">
          ${t('h3', p.name[0], p.name[1])}
          <p class="plan__price"><b data-month="RM${p.price}" data-year="RM${Math.round(p.price * 0.8)}">RM${p.price}</b>${t('span', 'a month', 'sebulan')}</p>
          ${t('p', p.for[0], p.for[1])}
          <ul class="ticks">
            ${p.has.map(([en, ms]) => t('li', en, ms)).join('\n            ')}
          </ul>
          ${t('a', 'Start with the free trial', 'Mula dengan trial percuma', `class="btn ${p.pick ? 'btn--main' : 'btn--line'}" href="#trial"`)}
        </li>`).join('\n        ')}
      </ul>
      ${t('p', 'Sample prices for this demo.', 'Harga contoh untuk demo ni.', 'class="note" style="margin-top: var(--s-lg)"')}
    </div>
  </section>

  <section class="section" id="coaches">
    <div class="container">
      <div class="head">${t('h2', 'Who will be coaching you', 'Siapa yang akan coach anda')}</div>
      <ul class="people">
        ${COACHES.map(c => `<li><img src="img/${c.id}.jpg" alt="${esc('Coach ' + c.name)}" width="640" height="800" loading="lazy"><h3>${c.name}</h3>${t('p', c.role[0], c.role[1], 'class="note"')}${t('p', c.d[0], c.d[1])}</li>`).join('\n        ')}
      </ul>
    </div>
  </section>

  <section class="section section--tint">
    <div class="container faq">
      ${t('h2', 'Before you come', 'Sebelum anda datang')}
      <div>
        ${FAQ.map(([q, qm, a, am]) => `<details><summary>${t('span', q, qm)}</summary>${t('p', a, am)}</details>`).join('\n        ')}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container close">
      ${t('h2', 'Seven days. No card. No joining fee.', 'Tujuh hari. Tiada kad. Tiada yuran daftar.')}
      ${t('p', 'Try a class before you decide anything. If it is not for you, walk away and we will not chase you.', 'Cuba satu kelas sebelum buat apa-apa keputusan. Kalau tak sesuai, anda boleh pergi dan kami tak akan kejar.', 'class="lead"')}
      ${t('a', 'Claim your trial pass', 'Ambil pass trial anda', 'class="btn btn--main" href="#trial"')}
    </div>
  </section>
</main>

<footer class="foot">
  <div class="container">
    <div class="foot__cols">
      <div>
        <p class="foot__mark">Kuasa Fitness</p>
        ${t('p', 'Coach-led classes in Puchong.', 'Kelas dengan coach di Puchong.', 'style="margin-top: var(--s-sm)"')}
      </div>
      <ul>
        ${nav}
      </ul>
      <p>${t('b', 'Find us', 'Lokasi')}Bandar Puchong Jaya, 47100 Puchong, Selangor<br>03-5555 0144<br>train@kuasafitness.example</p>
      <p>${t('b', 'Hours', 'Waktu')}${t('span', 'Monday to Friday, 6 am to 12 am. Saturday, 7 am to 10 pm. Sunday, 8 am to 8 pm.', 'Isnin hingga Jumaat, 6 pagi hingga 12 malam. Sabtu, 7 pagi hingga 10 malam. Ahad, 8 pagi hingga 8 malam.')}</p>
    </div>
    ${t('p', 'A demo by Bejaa Digital. The gym, coaches, prices, timetable and contact details are made up. Photos are made with AI.', 'Demo oleh Bejaa Digital. Gym, coach, harga, jadual dan maklumat hubungan ni rekaan. Gambar dibuat dengan AI.', 'class="foot__note"')}
  </div>
</footer>

<details class="wa">
  <summary aria-label="WhatsApp">${WA_ICON}<span>WhatsApp</span></summary>
  ${t('p', 'On your page this button opens a WhatsApp chat with your number. This is a demo, so it goes nowhere.', 'Di page anda, butang ni buka chat WhatsApp dengan nombor anda. Ini demo, jadi ia tak ke mana-mana.')}
</details>

<script src="app.js"></script>
</body>
</html>
`;
writeFileSync(new URL('index.html', import.meta.url), html);
console.log('built index.html');

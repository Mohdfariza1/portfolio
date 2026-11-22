// Builds the Kirana Batik demo (a made-up online batik shop) from one layout, so the header,
// footer, cart, WhatsApp button and both languages stay identical on every page.
// Run:  node _build.mjs   (in this folder; writes the .html files beside it)
// Every text is written once as t(tag, 'English', 'Bahasa Melayu'); app.js swaps them.
// The shop, prices, people, reviews and contact details are samples, and the pages say so.
import { writeFileSync } from 'node:fs';

const esc = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
const t = (tag, en, ms, attrs = '') => `<${tag}${attrs ? ' ' + attrs : ''} data-ms="${esc(ms)}">${en}</${tag}>`;

const PAGES = [
  ['shop.html', 'Shop', 'Kedai'],
  ['story.html', 'Our story', 'Cerita kami'],
  ['help.html', 'Sizes and delivery', 'Saiz dan penghantaran'],
  ['contact.html', 'Contact', 'Hubungi'],
];

const CATS = { men: ['Men', 'Lelaki'], women: ['Women', 'Wanita'], acc: ['Accessories', 'Aksesori'] };

const P = [
  { slug: 'pahlawan', name: 'Pahlawan Short Sleeve', cat: 'men', price: 149, was: 179, sizes: ['S', 'M', 'L', 'XL'], out: [], flag: 'sale',
    d: ['Our best seller. Short sleeve, boxy cut, and it holds its shape after many washes.', 'Paling laris. Lengan pendek, potongan longgar, dan bentuknya kekal walaupun dah banyak kali basuh.'],
    fab: ['Cotton tencel blend', 'Campuran kapas dan tencel'], care: ['Machine wash gentle, hang dry', 'Basuh mesin mod lembut, sidai'], alt: ['Indigo short-sleeve batik shirt on a hanger', 'Baju batik lengan pendek biru nila pada penyangkut'] },
  { slug: 'teluk-bayu', name: 'Teluk Bayu Shirt', cat: 'men', price: 189, was: 0, sizes: ['S', 'M', 'L', 'XL', '2XL'], out: ['2XL'], flag: 'new',
    d: ['Long-sleeve shirt in hand-blocked cotton. A soft collar that sits well without a tie.', 'Baju lengan panjang daripada kapas batik cap. Kolar lembut yang kemas walaupun tanpa tali leher.'],
    fab: ['100% cotton voile', '100% kapas voile'], care: ['Hand wash cold, iron inside out', 'Basuh tangan air sejuk, gosok dari dalam'], alt: ['Terracotta long-sleeve batik shirt on a hanger', 'Baju batik lengan panjang warna terakota pada penyangkut'] },
  { slug: 'seri-kurung', name: 'Seri Kurung Set', cat: 'women', price: 329, was: 0, sizes: ['XS', 'S', 'M', 'L', 'XL'], out: ['XS'], flag: '',
    d: ['Two-piece kurung with a lined bodice and side pockets. Cut to sit all day at the office.', 'Kurung dua helai dengan lapik di bahagian badan dan poket tepi. Selesa dipakai sepanjang hari di pejabat.'],
    fab: ['Tencel satin', 'Satin tencel'], care: ['Dry clean recommended', 'Lebih baik cucian kering'], alt: ['Plum batik baju kurung on a mannequin', 'Baju kurung batik ungu pada patung'] },
  { slug: 'melur', name: 'Melur Wrap Blouse', cat: 'women', price: 168, was: 0, sizes: ['XS', 'S', 'M', 'L'], out: [], flag: 'low',
    d: ['Wrap blouse with an adjustable tie. Sleeves to the elbow, right for the office.', 'Blaus lilit dengan tali yang boleh dilaras. Lengan paras siku, sesuai untuk pejabat.'],
    fab: ['Rayon crepe', 'Rayon krep'], care: ['Hand wash cold', 'Basuh tangan air sejuk'], alt: ['Sage green batik wrap blouse on a hanger', 'Blaus lilit batik hijau pada penyangkut'] },
  { slug: 'pucuk-rebung', name: 'Pucuk Rebung Scarf', cat: 'acc', price: 79, was: 99, sizes: ['One size'], out: [], flag: 'sale',
    d: ['A light square scarf with hand-rolled edges and the classic bamboo shoot border.', 'Selendang empat segi yang ringan, tepi dijahit tangan, dengan corak pucuk rebung di tepinya.'],
    fab: ['Silk cotton', 'Sutera kapas'], care: ['Hand wash separately', 'Basuh tangan, asingkan'], alt: ['Brown and cream batik scarf over a wooden rail', 'Selendang batik coklat dan krim pada palang kayu'] },
  { slug: 'kota-bharu', name: 'Kota Bharu Sarong', cat: 'acc', price: 129, was: 0, sizes: ['One size'], out: [], flag: '',
    d: ['A full-length sarong, stitched as a tube. It doubles as a travel blanket.', 'Kain sarung panjang penuh, siap berjahit. Boleh juga jadi selimut masa berjalan.'],
    fab: ['Cotton', 'Kapas'], care: ['Machine wash cold', 'Basuh mesin air sejuk'], alt: ['Folded teal batik sarong on a table', 'Kain sarung batik biru kehijauan yang berlipat di atas meja'] },
  { slug: 'langkawi', name: 'Langkawi Linen Shirt', cat: 'men', price: 219, was: 0, sizes: ['M', 'L', 'XL', '2XL'], out: ['M'], flag: 'new',
    d: ['Washed linen with a tonal print. Cool enough for an outdoor wedding.', 'Linen yang dah dibasuh lembut dengan corak senada. Cukup sejuk untuk kenduri di luar.'],
    fab: ['Washed linen', 'Linen basuhan'], care: ['Machine wash cold, tumble low', 'Basuh mesin air sejuk, pengering suhu rendah'], alt: ['Olive green linen batik shirt on a hanger', 'Baju batik linen hijau zaitun pada penyangkut'] },
  { slug: 'bunga-raya', name: 'Bunga Raya Kaftan', cat: 'women', price: 248, was: 289, sizes: ['S', 'M', 'L', 'XL'], out: [], flag: 'sale',
    d: ['A loose kaftan with side slits. Worn to Raya open houses and to the beach alike.', 'Kaftan longgar dengan belahan tepi. Sesuai untuk rumah terbuka Raya, sesuai juga ke pantai.'],
    fab: ['Viscose', 'Viskos'], care: ['Hand wash cold', 'Basuh tangan air sejuk'], alt: ['Rose red hibiscus batik kaftan on a hanger', 'Kaftan batik merah bercorak bunga raya pada penyangkut'] },
];
const file = p => `product-${p.slug}.html`;
const rm = n => 'RM' + n;

const BAG = '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 8h14l-1 12H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/></svg>';
const WA_ICON = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3.5 20.5l1.3-4.6A8.3 8.3 0 1 1 8.2 19.3z"/><path d="M9 8.6c.3 2.7 2.6 5.2 5.6 6l1.3-1.3-2-1.1-.9.8c-.9-.5-1.7-1.3-2.2-2.2l.8-.9-1.1-2z"/></svg>';

const flag = p => p.flag === 'new' ? t('span', 'New', 'Baru', 'class="flag flag--new"')
  : p.flag === 'sale' ? t('span', `Save ${rm(p.was - p.price)}`, `Jimat ${rm(p.was - p.price)}`, 'class="flag flag--sale"')
  : p.flag === 'low' ? t('span', 'Few left', 'Tinggal sikit', 'class="flag"') : '';

const card = (p, i = 0) => `<li class="card" data-cat="${p.cat}" data-price="${p.price}" data-new="${p.flag === 'new' ? 1 : 0}" data-i="${i}">
        <a href="${file(p)}">
          <span class="card__pic">${flag(p)}<img src="img/${p.slug}.jpg" alt="" width="800" height="1000" loading="lazy"></span>
          <span class="card__name">${p.name}</span>
          ${t('span', CATS[p.cat][0], CATS[p.cat][1], 'class="card__cat"')}
          <span class="card__price"><b>${rm(p.price)}</b>${p.was ? `<s>${rm(p.was)}</s>` : ''}</span>
        </a>
      </li>`;

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
${t('p', 'Free delivery in Peninsular Malaysia for orders above RM150', 'Penghantaran percuma di Semenanjung untuk pesanan lebih RM150', 'class="ann"')}

<header class="nav">
  <div class="container nav__in">
    <a class="nav__mark" href="index.html" aria-label="Kirana Batik, home">Kirana Batik</a>
    <ul class="nav__links">
        ${nav}
    </ul>
    <button class="nav__lang" type="button" id="lang" aria-label="Tukar ke Bahasa Melayu">BM</button>
    <button class="nav__cart" type="button" data-cart-open aria-label="Open the cart">${BAG}<span id="cart-count">0</span></button>
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
        <p class="foot__mark">Kirana Batik</p>
        ${t('p', 'Batik for the working week, made with workshops in Kelantan and Terengganu.', 'Batik untuk hari bekerja, dibuat bersama bengkel di Kelantan dan Terengganu.', 'style="margin-top: var(--s-sm); max-width: 30ch"')}
      </div>
      <ul>
        ${PAGES.map(([href, en, ms]) => `<li>${t('a', en, ms, `href="${href}"`)}</li>`).join('\n        ')}
        <li>${t('a', 'Track an order', 'Jejak pesanan', 'href="help.html#track"')}</li>
      </ul>
      <p>${t('b', 'Studio', 'Studio')}Seksyen U1, Shah Alam, Selangor<br>03-5555 0162<br>hello@kiranabatik.example</p>
      <p>${t('b', 'Ways to pay', 'Cara bayar')}${t('span', 'FPX online banking, Visa and Mastercard, Touch \'n Go eWallet, GrabPay', 'FPX perbankan online, Visa dan Mastercard, Touch \'n Go eWallet, GrabPay')}</p>
    </div>
    ${t('p', 'A demo by Bejaa Digital. The shop, prices, reviews and contact details are made up, and no order or payment is taken. Photos are made with AI.', 'Demo oleh Bejaa Digital. Kedai, harga, ulasan dan maklumat hubungan ni rekaan, dan tiada pesanan atau bayaran diambil. Gambar dibuat dengan AI.', 'class="foot__note"')}
  </div>
</footer>

<dialog class="cart" id="cart" aria-labelledby="cart-title">
  <div class="cart__head"><h2 id="cart-title"></h2>${t('button', 'Close', 'Tutup', 'class="cart__close" type="button" data-cart-close')}</div>
  <div class="cart__body" id="cart-body"></div>
  <div class="cart__foot" id="cart-foot"></div>
</dialog>

<details class="wa">
  <summary aria-label="WhatsApp">${WA_ICON}<span>WhatsApp</span></summary>
  ${t('p', 'On your shop this button opens a WhatsApp chat with your number, from every page. This is a demo, so it goes nowhere.', 'Di kedai anda, butang ni buka chat WhatsApp dengan nombor anda, dari setiap page. Ini demo, jadi ia tak ke mana-mana.')}
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

const by = slug => P.find(p => p.slug === slug);
const FACTS = [
  ['1 day', '1 hari', 'to pack and post your order', 'untuk bungkus dan pos pesanan anda'],
  ['14 days', '14 hari', 'to swap a size, free', 'untuk tukar saiz, percuma'],
  ['RM150', 'RM150', 'and above ships free in the Peninsula', 'ke atas, pos percuma di Semenanjung'],
  ['FPX', 'FPX', 'cards and e-wallets all accepted', 'kad dan e-wallet semua diterima'],
];
const strip = `<ul class="strip">
        ${FACTS.map(([en, ms, len, lms]) => `<li>${t('b', en, ms)}${t('span', len, lms)}</li>`).join('\n        ')}
      </ul>`;

/* ── Home ── */
const home = `  <section class="hero">
    <div class="container hero__in">
      <div class="hero__text">
        ${t('h1', 'Batik that works on a Monday, not just Hari Raya', 'Batik untuk hari Isnin, bukan Hari Raya saja')}
        ${t('p', 'Hand-blocked prints on cool cotton and tencel, cut for the office.', 'Batik cap pada kapas dan tencel yang sejuk, dipotong untuk ke pejabat.', 'class="lead"')}
        <div class="hero__acts">
          ${t('a', 'Shop the collection', 'Lihat koleksi', 'class="btn btn--main" href="shop.html"')}
          ${t('a', 'Find my size', 'Cari saiz saya', 'class="btn btn--line" href="help.html#size"')}
        </div>
      </div>
      <img class="hero__pic" src="img/studio.jpg" alt="A rail of batik shirts in the Kirana studio" data-alt-ms="Rel baju batik di studio Kirana" width="1080" height="1350">
    </div>
  </section>

  <section class="section">
    <div class="container">
      <div class="head head--row">
        ${t('h2', 'What people buy most', 'Yang paling ramai beli')}
        ${t('a', 'See all eight pieces', 'Lihat semua lapan', 'class="more" href="shop.html"')}
      </div>
      <ul class="cards">
      ${['pahlawan', 'seri-kurung', 'pucuk-rebung', 'teluk-bayu'].map(s => card(by(s))).join('\n      ')}
      </ul>
    </div>
  </section>

  <section class="section section--tint">
    <div class="container split">
      <img src="img/workshop.jpg" alt="Hands pressing a copper stamp onto white cloth" data-alt-ms="Tangan menekan cap tembaga pada kain putih" width="1200" height="900" loading="lazy">
      <div class="split__text">
        ${t('h2', 'Stamped by hand, one length of cloth at a time', 'Dicap dengan tangan, sehelai kain setiap kali')}
        ${t('p', 'Each print starts as a copper stamp pressed into hot wax, then onto the cloth. Two small workshops on the east coast make ours, and no two lengths come out the same.', 'Setiap corak bermula dengan cap tembaga yang dicelup lilin panas, kemudian ditekan pada kain. Dua bengkel kecil di pantai timur buat batik kami, dan tiada dua helai yang betul-betul sama.')}
        ${t('a', 'How a piece is made', 'Macam mana ia dibuat', 'class="btn btn--line" href="story.html"')}
      </div>
    </div>
  </section>

  <section class="section">
    <div class="container">
      ${strip}
    </div>
  </section>

  <section class="section section--tint">
    <div class="container">
      <div class="head">
        ${t('h2', 'What buyers say', 'Kata pembeli')}
        ${t('p', 'Sample reviews, written for this demo.', 'Ulasan contoh, ditulis untuk demo ni.', 'class="note"')}
      </div>
      <ul class="reviews">
        <li>${t('blockquote', 'I wear the Pahlawan to client meetings twice a week. It still looks new after a year.', 'Saya pakai Pahlawan jumpa client dua kali seminggu. Dah setahun, masih nampak baru.')}${t('p', 'Hafiz, Shah Alam', 'Hafiz, Shah Alam', 'class="note"')}</li>
        <li>${t('blockquote', 'The size guide was right. First kurung I bought online that I did not have to alter.', 'Panduan saiz dia tepat. Kurung pertama saya beli online yang tak payah alter.')}${t('p', 'Nadia, Kuantan', 'Nadia, Kuantan', 'class="note"')}</li>
        <li>${t('blockquote', 'Ordered on Tuesday night, it reached Kota Kinabalu on Monday. The swap for a bigger size was free.', 'Order malam Selasa, sampai Kota Kinabalu hari Isnin. Tukar saiz lebih besar pun percuma.')}${t('p', 'Jason, Kota Kinabalu', 'Jason, Kota Kinabalu', 'class="note"')}</li>
      </ul>
    </div>
  </section>

  <section class="section">
    <div class="container faq">
      ${t('h2', 'Before you order', 'Sebelum anda order')}
      <div>
        <details><summary>${t('span', 'How do I pick my size?', 'Macam mana nak pilih saiz?')}</summary>${t('p', 'Measure a shirt you already like, laid flat, and match it to the size table. If it still does not fit, the swap is free within 14 days.', 'Ukur baju yang anda dah suka, bentang rata, dan padankan dengan jadual saiz. Kalau masih tak muat, tukar saiz percuma dalam 14 hari.')}</details>
        <details><summary>${t('span', 'How long does delivery take?', 'Berapa lama penghantaran?')}</summary>${t('p', 'We post within one working day. It takes 2 to 4 days in the Peninsula and 4 to 7 days to Sabah and Sarawak.', 'Kami pos dalam satu hari bekerja. 2 hingga 4 hari untuk Semenanjung, 4 hingga 7 hari untuk Sabah dan Sarawak.')}</details>
        <details><summary>${t('span', 'Will the colour run?', 'Warna dia turun tak?')}</summary>${t('p', 'A little, in the first two washes, as with all hand-dyed batik. Wash it on its own in cold water for those two washes.', 'Sikit, masa dua basuhan pertama, macam semua batik yang dicelup tangan. Basuh asing dengan air sejuk untuk dua basuhan tu.')}</details>
        <details><summary>${t('span', 'Can I pay with FPX?', 'Boleh bayar dengan FPX?')}</summary>${t('p', 'Yes. FPX from any Malaysian bank, Visa, Mastercard, Touch \'n Go eWallet and GrabPay.', 'Boleh. FPX dari mana-mana bank Malaysia, Visa, Mastercard, Touch \'n Go eWallet dan GrabPay.')}</details>
        <details><summary>${t('span', 'Do you make uniforms for companies?', 'Ada buat uniform untuk syarikat?')}</summary>${t('p', 'Yes, from 20 pieces, in your own colour. Send us a message from the contact page.', 'Ada, dari 20 helai, ikut warna syarikat anda. Hantar mesej dari page hubungi.')}</details>
      </div>
    </div>
  </section>`;

/* ── Shop ── */
const shop = `${head('Shop', 'Kedai', 'Eight pieces, all in stock unless a size says otherwise.', 'Lapan pilihan, semua ada stok kecuali saiz yang ditanda habis.')}
  <section class="section section--flush">
    <div class="container">
      <div class="bar">
        <div class="chips" id="chips" role="group" aria-label="Category">
          ${t('button', 'All', 'Semua', 'type="button" class="chip" data-cat="all" aria-pressed="true"')}
          ${Object.entries(CATS).map(([k, [en, ms]]) => t('button', en, ms, `type="button" class="chip" data-cat="${k}" aria-pressed="false"`)).join('\n          ')}
        </div>
        <label class="sort">${t('span', 'Sort', 'Susun')}
          <select id="sort">
            ${t('option', 'Best sellers first', 'Paling laris dulu', 'value="feat"')}
            ${t('option', 'Price, low to high', 'Harga, rendah ke tinggi', 'value="lo"')}
            ${t('option', 'Price, high to low', 'Harga, tinggi ke rendah', 'value="hi"')}
            ${t('option', 'New first', 'Baru dulu', 'value="new"')}
          </select>
        </label>
      </div>
      <ul class="cards" id="grid">
      ${P.map((p, i) => card(p, i)).join('\n      ')}
      </ul>
    </div>
  </section>`;

/* ── Product pages ── */
const product = p => {
  const first = p.sizes.find(s => !p.out.includes(s));
  const others = P.filter(o => o.cat === p.cat && o !== p).concat(P.filter(o => o.cat !== p.cat)).slice(0, 3);
  return `  <section class="section section--top">
    <div class="container buy">
      <img class="buy__pic" src="img/${p.slug}.jpg" alt="${esc(p.alt[0])}" data-alt-ms="${esc(p.alt[1])}" width="800" height="1000">
      <div class="buy__text">
        ${t('a', CATS[p.cat][0], CATS[p.cat][1], `class="more" href="shop.html?cat=${p.cat}"`)}
        <h1>${p.name}</h1>
        <p class="buy__price"><b>${rm(p.price)}</b>${p.was ? `<s>${rm(p.was)}</s>` : ''}</p>
        ${t('p', p.d[0], p.d[1], 'class="lead"')}
        <form class="buy__form" data-add data-slug="${p.slug}" data-name="${esc(p.name)}" data-price="${p.price}">
          <fieldset>
            ${t('legend', 'Size', 'Saiz')}
            <div class="sizes">
              ${p.sizes.map(s => `<label><input type="radio" name="size" value="${s}"${s === first ? ' checked' : ''}${p.out.includes(s) ? ' disabled' : ''}>${s === 'One size' ? t('span', 'One size', 'Satu saiz') : `<span>${s}</span>`}</label>`).join('\n              ')}
            </div>
            ${p.out.length ? t('p', `${p.out.join(', ')} is sold out.`, `${p.out.join(', ')} dah habis.`, 'class="note"') : ''}
          </fieldset>
          ${t('button', `Add to cart, ${rm(p.price)}`, `Masuk troli, ${rm(p.price)}`, 'class="btn btn--main" type="submit"')}
          ${p.sizes.length > 1 ? t('a', 'Check the size table', 'Semak jadual saiz', 'class="more" href="help.html#size"') : ''}
        </form>
        <dl class="facts">
          <div>${t('dt', 'Fabric', 'Kain')}${t('dd', p.fab[0], p.fab[1])}</div>
          <div>${t('dt', 'Care', 'Penjagaan')}${t('dd', p.care[0], p.care[1])}</div>
          <div>${t('dt', 'Delivery', 'Penghantaran')}${t('dd', 'Posted in 1 working day, 2 to 4 days in the Peninsula', 'Dipos dalam 1 hari bekerja, 2 hingga 4 hari di Semenanjung')}</div>
          <div>${t('dt', 'Swap', 'Tukar saiz')}${t('dd', 'Free within 14 days', 'Percuma dalam 14 hari')}</div>
        </dl>
      </div>
    </div>
  </section>

  <section class="section section--tint">
    <div class="container">
      <div class="head">${t('h2', 'You may also like', 'Mungkin anda suka juga')}</div>
      <ul class="cards cards--three">
      ${others.map(o => card(o)).join('\n      ')}
      </ul>
    </div>
  </section>`;
};

/* ── Story ── */
const STEPS = [
  ['Draw and cut', 'Lukis dan potong', 'We draw the motif, and a coppersmith shapes it into a stamp.', 'Kami lukis corak, kemudian tukang tembaga bentukkan jadi cap.'],
  ['Stamp with wax', 'Cap dengan lilin', 'The stamp goes into hot wax, then onto the cloth, again and again down its length.', 'Cap dicelup lilin panas, kemudian ditekan pada kain, berulang-ulang sepanjang kain.'],
  ['Dye and boil', 'Celup dan rebus', 'The cloth is dyed, then boiled so the wax lifts and the pattern shows.', 'Kain dicelup warna, kemudian direbus supaya lilin tanggal dan corak timbul.'],
  ['Cut and sew', 'Potong dan jahit', 'It comes to Shah Alam, where we cut and sew it into shirts, kurung and scarves.', 'Kain sampai ke Shah Alam, tempat kami potong dan jahit jadi baju, kurung dan selendang.'],
];
const story = `${head('Our story', 'Cerita kami', 'We started Kirana because the batik we owned came out once a year. We wanted pieces to wear on an ordinary Monday.', 'Kami mulakan Kirana sebab batik yang kami ada cuma keluar setahun sekali. Kami nak batik yang boleh dipakai hari Isnin biasa.')}
  <section class="section section--flush">
    <div class="container split">
      <img src="img/workshop.jpg" alt="Hands pressing a copper stamp onto white cloth" data-alt-ms="Tangan menekan cap tembaga pada kain putih" width="1200" height="900">
      <div class="split__text">
        ${t('h2', 'Two workshops, paid by the piece and paid fairly', 'Dua bengkel, dibayar ikut helai dan dibayar adil')}
        ${t('p', 'Our cloth is stamped in one workshop near Kota Bharu and one in Kuala Terengganu. We order small runs, pay on delivery, and never ask for a rush that would cut corners.', 'Kain kami dicap di satu bengkel dekat Kota Bharu dan satu lagi di Kuala Terengganu. Kami tempah sikit-sikit, bayar bila kain sampai, dan tak pernah minta siap cepat sampai kualiti terjejas.')}
        ${t('p', 'The workshops in this demo are made up.', 'Bengkel dalam demo ni rekaan.', 'class="note"')}
      </div>
    </div>
  </section>

  <section class="section section--tint">
    <div class="container">
      <div class="head">${t('h2', 'How a piece is made', 'Macam mana sehelai dibuat')}</div>
      <ol class="steps">
        ${STEPS.map(([en, ms, den, dms]) => `<li>${t('h3', en, ms)}${t('p', den, dms)}</li>`).join('\n        ')}
      </ol>
    </div>
  </section>

  <section class="section">
    <div class="container split split--flip">
      <img src="img/studio.jpg" alt="A rail of batik shirts in the Kirana studio" data-alt-ms="Rel baju batik di studio Kirana" width="1080" height="1350" loading="lazy">
      <div class="split__text">
        ${t('h2', 'Come and try them on', 'Datang dan cuba sendiri')}
        ${t('p', 'Our studio in Shah Alam is open on weekdays. Every size of every piece is on the rail.', 'Studio kami di Shah Alam buka pada hari bekerja. Semua saiz untuk semua pilihan ada di rel.')}
        ${t('a', 'Studio hours and address', 'Waktu dan alamat studio', 'class="btn btn--line" href="contact.html"')}
      </div>
    </div>
  </section>`;

/* ── Help ── */
const table = (cols, rows) => `<div class="scroll"><table>
          <thead><tr>${cols.map(([en, ms]) => t('th', en, ms, 'scope="col"')).join('')}</tr></thead>
          <tbody>
            ${rows.map(r => `<tr>${r.map((c, i) => i === 0 ? (Array.isArray(c) ? t('th', c[0], c[1], 'scope="row"') : `<th scope="row">${c}</th>`) : (Array.isArray(c) ? t('td', c[0], c[1]) : `<td>${c}</td>`)).join('')}</tr>`).join('\n            ')}
          </tbody>
        </table></div>`;
const help = `${head('Sizes and delivery', 'Saiz dan penghantaran', 'Sizes, postage, swapping a size, washing, and where your parcel is.', 'Saiz, pos, tukar saiz, cara basuh, dan di mana bungkusan anda.')}
  <section class="section section--flush" id="size">
    <div class="container two">
      <div>
        ${t('h2', 'Size table', 'Jadual saiz')}
        ${t('p', 'Lay a shirt you like flat, measure across the chest, and double it.', 'Bentang baju yang anda suka, ukur lebar dada, dan darab dua.', 'class="lead"')}
      </div>
      <div class="stack">
        ${t('h3', 'Men\'s shirts, in cm', 'Baju lelaki, dalam cm')}
        ${table([['Size', 'Saiz'], ['Chest', 'Dada'], ['Length', 'Labuh'], ['Shoulder', 'Bahu']], [['S', 100, 70, 43], ['M', 106, 72, 45], ['L', 112, 74, 47], ['XL', 118, 76, 49], ['2XL', 124, 78, 51]])}
        ${t('h3', 'Women\'s wear, in cm', 'Pakaian wanita, dalam cm')}
        ${table([['Size', 'Saiz'], ['Bust', 'Dada'], ['Waist', 'Pinggang'], ['Hip', 'Pinggul']], [['XS', 82, 66, 90], ['S', 86, 70, 94], ['M', 92, 76, 100], ['L', 98, 82, 106], ['XL', 104, 88, 112]])}
      </div>
    </div>
  </section>

  <section class="section section--tint" id="delivery">
    <div class="container two">
      <div>
        ${t('h2', 'Delivery', 'Penghantaran')}
        ${t('p', 'Orders paid before 2 pm are posted the same working day.', 'Pesanan yang dibayar sebelum 2 petang dipos pada hari bekerja yang sama.', 'class="lead"')}
      </div>
      <div class="stack">
        ${table([['Where', 'Ke mana'], ['Cost', 'Kos'], ['Time', 'Masa']], [[['Peninsular Malaysia', 'Semenanjung Malaysia'], ['RM10, free above RM150', 'RM10, percuma lebih RM150'], ['2 to 4 days', '2 hingga 4 hari']], [['Sabah and Sarawak', 'Sabah dan Sarawak'], 'RM18', ['4 to 7 days', '4 hingga 7 hari']], [['Collect at the studio', 'Ambil di studio'], ['Free', 'Percuma'], ['Next working day', 'Hari bekerja berikutnya']]])}
      </div>
    </div>
  </section>

  <section class="section" id="swap">
    <div class="container two">
      <div>
        ${t('h2', 'Swapping a size', 'Tukar saiz')}
        ${t('p', 'Free within 14 days, as long as the piece is unworn and unwashed.', 'Percuma dalam 14 hari, asalkan belum dipakai dan belum dibasuh.', 'class="lead"')}
      </div>
      <ol class="steps steps--col">
        <li>${t('h3', 'Tell us', 'Beritahu kami')}${t('p', 'Message us your order number and the size you need.', 'Mesej nombor pesanan dan saiz yang anda nak.')}</li>
        <li>${t('h3', 'Post it back', 'Pos balik')}${t('p', 'We send a prepaid label. Drop the parcel at any courier counter.', 'Kami hantar label pos yang dah dibayar. Hantar bungkusan di mana-mana kaunter kurier.')}</li>
        <li>${t('h3', 'Get the new size', 'Terima saiz baru')}${t('p', 'We post the new size the day your parcel reaches us.', 'Kami pos saiz baru pada hari bungkusan anda sampai.')}</li>
      </ol>
    </div>
  </section>

  <section class="section section--tint" id="care">
    <div class="container two">
      <div>${t('h2', 'Looking after batik', 'Jaga batik')}</div>
      <ul class="ticks">
        ${t('li', 'Wash it alone in cold water for the first two washes.', 'Basuh asing dengan air sejuk untuk dua basuhan pertama.')}
        ${t('li', 'Use a mild soap. No bleach, no soaking overnight.', 'Guna sabun lembut. Jangan guna peluntur, jangan rendam semalaman.')}
        ${t('li', 'Dry it in the shade, inside out, so the colour stays.', 'Sidai di tempat teduh, terbalikkan, supaya warna kekal.')}
        ${t('li', 'Iron on the inside at a medium heat.', 'Gosok dari dalam dengan suhu sederhana.')}
      </ul>
    </div>
  </section>

  <section class="section" id="track">
    <div class="container two">
      <div>
        ${t('h2', 'Track an order', 'Jejak pesanan')}
        ${t('p', 'On a real shop this shows where the parcel is, straight from the courier.', 'Di kedai sebenar, ini tunjuk di mana bungkusan anda, terus dari kurier.', 'class="lead"')}
      </div>
      <form class="form" data-demo novalidate>
        <div>${t('label', 'Order number', 'Nombor pesanan', 'for="t-order"')}<input id="t-order" name="order" required placeholder="KB-2026-0000" autocomplete="off"></div>
        <div class="form__foot">
          ${t('button', 'Find my parcel', 'Cari bungkusan saya', 'class="btn btn--main" type="submit"')}
          <p class="form__help" aria-live="polite" data-need-en="Type your order number first." data-need-ms="Taip nombor pesanan dulu." data-done-en="Nothing was looked up: this is a demo and it is not connected to a courier." data-done-ms="Tiada apa disemak: ini demo dan ia tak disambung dengan kurier."></p>
        </div>
      </form>
    </div>
  </section>`;

/* ── Contact ── */
const contact = `${head('Contact', 'Hubungi', 'We answer messages on working days, usually within a few hours.', 'Kami balas mesej pada hari bekerja, biasanya dalam beberapa jam.')}
  <section class="section section--flush">
    <div class="container two">
      <dl class="facts facts--big">
        <div>${t('dt', 'Studio', 'Studio')}${t('dd', 'Seksyen U1, 40150 Shah Alam, Selangor', 'Seksyen U1, 40150 Shah Alam, Selangor')}</div>
        <div>${t('dt', 'Open', 'Buka')}${t('dd', 'Monday to Friday, 10 am to 6 pm', 'Isnin hingga Jumaat, 10 pagi hingga 6 petang')}</div>
        <div>${t('dt', 'Phone', 'Telefon')}<dd>03-5555 0162</dd></div>
        <div>${t('dt', 'Email', 'Emel')}<dd>hello@kiranabatik.example</dd></div>
        <div>${t('dt', 'Company uniforms', 'Uniform syarikat')}${t('dd', 'From 20 pieces, in your own colour', 'Dari 20 helai, ikut warna syarikat anda')}</div>
      </dl>
      <form class="form" data-demo novalidate>
        <div class="form__two">
          <div>${t('label', 'Name', 'Nama', 'for="c-name"')}<input id="c-name" name="name" required autocomplete="name"></div>
          <div>${t('label', 'WhatsApp number', 'Nombor WhatsApp', 'for="c-tel"')}<input id="c-tel" name="tel" required inputmode="tel" autocomplete="tel"></div>
        </div>
        <div>${t('label', 'What is it about?', 'Pasal apa?', 'for="c-topic"')}<select id="c-topic" name="topic">${t('option', 'A question about an order', 'Soalan pasal pesanan')}${t('option', 'Help with a size', 'Bantuan pilih saiz')}${t('option', 'Company uniforms', 'Uniform syarikat')}${t('option', 'Something else', 'Lain-lain')}</select></div>
        <div>${t('label', 'Message', 'Mesej', 'for="c-msg"')}<textarea id="c-msg" name="msg" rows="4"></textarea></div>
        <div class="form__foot">
          ${t('button', 'Send message', 'Hantar mesej', 'class="btn btn--main" type="submit"')}
          <p class="form__help" aria-live="polite" data-need-en="Add your name and a WhatsApp number so we can reply." data-need-ms="Isi nama dan nombor WhatsApp supaya kami boleh balas." data-done-en="Nothing was sent: this is a demo form and it is not connected." data-done-ms="Tiada apa dihantar: ini borang demo dan ia tak disambung."></p>
        </div>
      </form>
    </div>
  </section>`;

const out = [
  { name: 'index.html', title: 'Kirana Batik: modern batik to wear to work', desc: 'Online batik shop demo: shirts, kurung and scarves with a working cart, size picker and checkout. A demo by Bejaa Digital.', body: home },
  { name: 'shop.html', title: 'Shop | Kirana Batik', desc: 'All eight pieces: men, women and accessories.', body: shop },
  ...P.map(p => ({ name: file(p), title: `${p.name} | Kirana Batik`, desc: p.d[0], body: product(p) })),
  { name: 'story.html', title: 'Our story | Kirana Batik', desc: 'How Kirana batik is stamped by hand and sewn in Shah Alam.', body: story },
  { name: 'help.html', title: 'Sizes and delivery | Kirana Batik', desc: 'Size tables, delivery costs, swapping a size, washing batik and tracking an order.', body: help },
  { name: 'contact.html', title: 'Contact | Kirana Batik', desc: 'Studio address, hours and a message form.', body: contact },
];
for (const p of out) writeFileSync(new URL(p.name, import.meta.url), page(p));
console.log('built ' + out.length + ' pages');

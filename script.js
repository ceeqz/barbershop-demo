/* Барбершоп №1 — demo site. All data is at the top of this file. */
const $ = id => document.getElementById(id);
const rub = n => n.toLocaleString('ru-RU') + ' ₽';
const unsplash = (id, w = 1200, h) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}${h ? `&h=${h}` : ''}&q=80`;

/* ---------- data (edit here) ---------- */
const SERVICES = [
  {id: 'cut',    name: 'Мужская стрижка',     desc: 'Мытьё головы, стрижка, укладка', price: 1500, min: 60},
  {id: 'clip',   name: 'Стрижка машинкой',    desc: 'Насадки по выбору, окантовка',               price: 1000, min: 30},
  {id: 'beard',  name: 'Оформление бороды',   desc: 'Форма, окантовка, горячее полотенце',       price: 1000, min: 30},
  {id: 'combo',  name: 'Стрижка + борода',    desc: 'Дешевле, чем по отдельности',       price: 2300, min: 90},
  {id: 'razor',  name: 'Королевское бритьё',  desc: 'Опасная бритва, горячее полотенце', price: 1500, min: 45},
  {id: 'kid',    name: 'Детская стрижка',     desc: 'Для мальчиков до 12 лет',                             price: 1100, min: 40},
  {id: 'style',  name: 'Укладка',             desc: 'С профессиональными средствами',             price: 500,  min: 15}
];
const MASTERS = [
  {id: 'artem',  name: 'Артём',  role: 'Старший барбер',   about: 'Стаж 9 лет. Классика, фейды, борода.', photo: ['1635273051937-a0ddef9573b6', 600, 750]},
  {id: 'maxim',  name: 'Максим', role: 'Барбер',           about: 'Стаж 6 лет. Короткие стрижки, окантовка.',       photo: ['1598524374912-6b0b0bab43dd', 600, 750]},
  {id: 'ilya',   name: 'Илья',   role: 'Барбер',           about: 'Стаж 4 года. Средняя длина, укладки, дети.',  photo: ['1667539916756-9efa8343624f', 600, 750]}
];
const PHOTOS = {
  hero: '1781455793310-8427c96454c7',
  gallery: [
    ['1599351431202-1e0f0137899a', 'Точная стрижка и оформление бороды'],
    ['1610475680335-dafab5475150', 'Красное кресло барбершопа'],
    ['1599011176306-4a96f1516d4d', 'Оформление бороды'],
    ['1775494165568-42c0fbb4c782', 'Интерьер в винтажном стиле'],
    ['1568339434343-2a640a1a9946', 'Фейд и окантовка'],
    ['1781925856343-c97d0d44f94c', 'Рабочие места мастеров']
  ]
};
const OPEN = {from: 10, to: 20};   // last slot starts at 20:00

/* ---------- page ---------- */
$('priceList').innerHTML = SERVICES.map(s => `
  <li><div><span class="name">${s.name}</span><span class="desc">${s.desc}</span></div>
  <span class="time">${s.min} мин</span><span class="price">${rub(s.price)}</span></li>`).join('');

$('mastersGrid').innerHTML = MASTERS.map(m => `
  <article class="master"><img src="${unsplash(m.photo[0], m.photo[1], m.photo[2])}" alt="Барбер ${m.name}" loading="lazy" width="${m.photo[1]}" height="${m.photo[2]}">
  <div><h3>${m.name}</h3><p class="role">${m.role}</p><p class="about">${m.about}</p></div></article>`).join('');

$('gallery').innerHTML = PHOTOS.gallery.map(([id, alt]) =>
  `<figure><img src="${unsplash(id, 900)}" alt="${alt}" loading="lazy"></figure>`).join('');

document.querySelector('[data-src="hero"]').src = unsplash(PHOTOS.hero, 1800);

/* nav: shrink on scroll, mobile menu */
const closeMenu = () => { $('mobileMenu').classList.remove('show'); $('burger').classList.remove('open'); $('burger').setAttribute('aria-expanded', 'false'); document.body.classList.remove('locked'); };
addEventListener('scroll', () => $('nav').classList.toggle('scrolled', scrollY > 40), {passive: true});
$('burger').addEventListener('click', () => {
  const open = !$('mobileMenu').classList.contains('show');
  $('mobileMenu').classList.toggle('show', open);
  $('burger').classList.toggle('open', open);
  $('burger').setAttribute('aria-expanded', open);
  document.body.classList.toggle('locked', open);
});
$('mobileMenu').addEventListener('click', e => { if (e.target.closest('a')) closeMenu(); });
addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
addEventListener('resize', () => { if (innerWidth > 900) closeMenu(); });

/* ---------- booking form ---------- */
const form = {service: $('fService'), master: $('fMaster'), date: $('fDate'), name: $('fName'), phone: $('fPhone')};
let slot = null;

form.service.innerHTML = SERVICES.map(s => `<option value="${s.id}">${s.name} — ${rub(s.price)}</option>`).join('');
form.master.innerHTML = '<option value="">Любой мастер</option>' + MASTERS.map(m => `<option value="${m.id}">${m.name} · ${m.role}</option>`).join('');

const iso = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const today = new Date(), tomorrow = new Date(today.getTime() + 864e5);
form.date.min = iso(today);
form.date.value = iso(tomorrow);

/* a stable pseudo-random "busy" pattern per date + master (demo only) */
function busy(dateStr, masterId, hour) {
  let h = 2166136261;
  for (const c of `${dateStr}|${masterId}|${hour}`) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  h ^= h >>> 15; h = Math.imul(h, 2246822507); h ^= h >>> 13;
  return (h >>> 0) % 100 < 30;
}

function renderSlots() {
  const d = form.date.value, now = new Date(), isToday = d === iso(now);
  const hours = Array.from({length: OPEN.to - OPEN.from + 1}, (_, i) => OPEN.from + i);
  if (slot && (isToday && slot <= now.getHours() || busy(d, form.master.value, slot))) slot = null;
  $('slots').innerHTML = hours.map(h => {
    const off = !d || (isToday && h <= now.getHours()) || busy(d, form.master.value, h);
    return `<button type="button" class="slot" role="radio" aria-checked="${slot === h}" data-h="${h}"${off ? ' disabled' : ''}>${String(h).padStart(2, '0')}:00</button>`;
  }).join('');
  renderSummary();
}

function renderSummary() {
  const s = SERVICES.find(x => x.id === form.service.value);
  const m = MASTERS.find(x => x.id === form.master.value);
  const dt = form.date.value ? new Date(form.date.value + 'T12:00').toLocaleDateString('ru-RU', {weekday: 'long', day: 'numeric', month: 'long'}) : '—';
  $('summary').innerHTML = `<b>${s.name}</b> · ${m ? m.name : 'любой мастер'} · ${dt} · ${slot ? String(slot).padStart(2, '0') + ':00' : 'время не выбрано'}<br>К оплате в барбершопе: <b>${rub(s.price)}</b>`;
}

$('slots').addEventListener('click', e => {
  const b = e.target.closest('[data-h]'); if (!b || b.disabled) return;
  slot = +b.dataset.h; $('errTime').textContent = ''; renderSlots();
});
[form.service, form.master, form.date].forEach(el => el.addEventListener('change', renderSlots));

function validate() {
  let ok = true;
  const set = (id, input, msg) => { $(id).textContent = msg; if (input) input.setAttribute('aria-invalid', !!msg); if (msg) ok = false; };
  set('errName', form.name, form.name.value.trim().length < 2 ? 'Укажите имя' : '');
  const digits = form.phone.value.replace(/\D/g, '');
  set('errPhone', form.phone, digits.length < 10 || digits.length > 11 ? 'Введите телефон, например +7 900 000-00-00' : '');
  set('errTime', null, !form.date.value ? 'Выберите дату' : slot ? '' : 'Выберите время');
  return ok;
}

$('bookingForm').addEventListener('submit', e => {
  e.preventDefault();
  if (!validate()) { const bad = document.querySelector('[aria-invalid=true]'); if (bad) bad.focus(); return; }
  const s = SERVICES.find(x => x.id === form.service.value), m = MASTERS.find(x => x.id === form.master.value);
  const dt = new Date(form.date.value + 'T12:00').toLocaleDateString('ru-RU', {weekday: 'long', day: 'numeric', month: 'long'});
  const name = form.name.value.trim().replace(/[<>&]/g, '');
  $('doneText').textContent = `${name}, ждём вас: ${dt}, в ${String(slot).padStart(2, '0')}:00. ${s.name}, ${m ? 'мастер ' + m.name : 'любой мастер'}. Мы позвоним для подтверждения.`;
  $('bookingForm').hidden = true; $('done').hidden = false;
  $('done').scrollIntoView({behavior: 'smooth', block: 'center'});
});
form.name.addEventListener('input', () => { form.name.removeAttribute('aria-invalid'); $('errName').textContent = ''; });
form.phone.addEventListener('input', () => { form.phone.removeAttribute('aria-invalid'); $('errPhone').textContent = ''; });
$('again').addEventListener('click', () => {
  slot = null; form.name.value = ''; form.phone.value = '';
  $('done').hidden = true; $('bookingForm').hidden = false; renderSlots();
});

renderSlots();

/* ═══════════════════════════════════════════════
   CodersDek — Main JavaScript
   ═══════════════════════════════════════════════ */

const CONTACT_EMAIL = 'codersdek@gmail.com';
const reduceMotion  = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const phone         = window.matchMedia('(max-width: 680px)');

document.documentElement.classList.add('js');

/* ── NAV: scrolled state ── */
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ── NAV: mobile menu ── */
const burger   = document.getElementById('burger');
const navLinks = document.getElementById('navLinks');

function setMenu(open) {
  burger.setAttribute('aria-expanded', String(open));
  burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  navLinks.classList.toggle('is-open', open);
}
burger.addEventListener('click', () => setMenu(burger.getAttribute('aria-expanded') !== 'true'));
navLinks.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

/* ── NAV: Bangalore clock ── */
const clock = document.getElementById('clock');
const clockFmt = new Intl.DateTimeFormat('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' });
const tick = () => { clock.textContent = clockFmt.format(new Date()) + ' IST'; };
tick();
setInterval(tick, 15000);

/* ── HERO: rotating word ── */
const words = [...document.querySelectorAll('.rot-word')];
if (words.length > 1 && !reduceMotion) {
  let current = 0;
  setInterval(() => {
    const prev = words[current];
    current = (current + 1) % words.length;
    const next = words[current];
    prev.classList.remove('is-active');
    prev.classList.add('is-leaving');
    next.classList.remove('is-leaving');
    next.classList.add('is-active');
    setTimeout(() => prev.classList.remove('is-leaving'), 800);
  }, 2600);
}

/* ── COUNTERS ── */
function countUp(el) {
  const target = parseInt(el.dataset.to, 10);
  if (reduceMotion) { el.textContent = target; return; }
  const duration = 1600;
  let start;
  const step = t => {
    start ??= t;
    const p = Math.min((t - start) / duration, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 4)) * target);
    if (p < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.querySelectorAll('.count').forEach(countUp);
    statsObserver.disconnect();
  });
}, { threshold: 0.4 });
const stats = document.querySelector('.stats');
if (stats) statsObserver.observe(stats);

/* ── SCROLL REVEAL (staggered per parent) ── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-in');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => {
  const siblings = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
  el.style.setProperty('--d', `${Math.min(siblings.indexOf(el), 5) * 0.07}s`);
  revealObserver.observe(el);
});

/* ── SCROLL SPY ── */
const navAnchors = [...navLinks.querySelectorAll('a[href^="#"]:not(.nav-links-cta)')];
const spyObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navAnchors.forEach(a => a.classList.toggle('is-current', a.getAttribute('href') === '#' + entry.target.id));
  });
}, { rootMargin: '-45% 0px -50% 0px' });
document.querySelectorAll('main section[id]').forEach(s => spyObserver.observe(s));

/* ── PROCESS: progress line ── */
const steps = document.getElementById('steps');
if (steps) {
  const stepEls = [...steps.querySelectorAll('.step')];
  const updateSteps = () => {
    const r = steps.getBoundingClientRect();
    const vh = window.innerHeight;
    const p = phone.matches
      ? Math.max(0, Math.min(1, (vh * 0.6 - r.top) / r.height))        // vertical timeline
      : Math.max(0, Math.min(1, (vh * 0.8 - r.top) / (vh * 0.55)));    // horizontal line
    steps.style.setProperty('--progress', p);
    stepEls.forEach((s, i) => s.classList.toggle('is-done', p >= i / (stepEls.length - 1) - 0.001));
  };
  window.addEventListener('scroll', updateSteps, { passive: true });
  window.addEventListener('resize', updateSteps);
  updateSteps();
}

/* ═══ MOBILE COMPONENTS ═══ */

/* Services accordion (phones) */
const svcs = [...document.querySelectorAll('.svc')];
function setSvc(target) {
  svcs.forEach(s => {
    const open = s === target && !s.classList.contains('is-open');
    s.classList.toggle('is-open', open);
    if (phone.matches) s.setAttribute('aria-expanded', String(open));
  });
}
function syncSvcA11y() {
  svcs.forEach(s => {
    if (phone.matches) {
      s.setAttribute('role', 'button');
      s.setAttribute('tabindex', '0');
      s.setAttribute('aria-expanded', String(s.classList.contains('is-open')));
    } else {
      ['role', 'tabindex', 'aria-expanded'].forEach(a => s.removeAttribute(a));
    }
  });
}
svcs.forEach(s => {
  s.addEventListener('click', () => { if (phone.matches) setSvc(s); });
  s.addEventListener('keydown', e => {
    if (phone.matches && (e.key === 'Enter' || e.key === ' ')) { e.preventDefault(); setSvc(s); }
  });
});
if (svcs[0]) svcs[0].classList.add('is-open');
syncSvcA11y();
phone.addEventListener('change', syncSvcA11y);

/* Tech stack tabs (phones) */
const stack = document.querySelector('.stack');
if (stack) {
  const rows = [...stack.querySelectorAll('.stack-row')];
  const tabs = document.createElement('div');
  tabs.className = 'stack-tabs';
  tabs.setAttribute('role', 'tablist');
  tabs.setAttribute('aria-label', 'Technology categories');
  const selectTab = i => {
    rows.forEach((r, k) => r.classList.toggle('is-active', k === i));
    [...tabs.children].forEach((b, k) => b.setAttribute('aria-selected', String(k === i)));
    tabs.children[i].scrollIntoView({ block: 'nearest', inline: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
  };
  rows.forEach((row, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'stack-tab';
    b.setAttribute('role', 'tab');
    b.textContent = row.querySelector('h3').textContent;
    b.addEventListener('click', () => selectTab(i));
    tabs.appendChild(b);
  });
  stack.before(tabs);
  rows.forEach((r, k) => r.classList.toggle('is-active', k === 0));
  [...tabs.children].forEach((b, k) => b.setAttribute('aria-selected', String(k === 0)));
}

/* Testimonial carousel dots (phones) */
const quotes = document.querySelector('.quotes');
if (quotes) {
  const cards = [...quotes.children];
  const dots = document.createElement('div');
  dots.className = 'quote-dots';
  cards.forEach((card, i) => {
    const d = document.createElement('button');
    d.type = 'button';
    d.setAttribute('aria-label', `Show testimonial ${i + 1}`);
    d.addEventListener('click', () => quotes.scrollTo({ left: card.offsetLeft - quotes.offsetLeft - parseFloat(getComputedStyle(quotes).paddingLeft), behavior: reduceMotion ? 'auto' : 'smooth' }));
    dots.appendChild(d);
  });
  quotes.after(dots);
  const syncDots = () => {
    const mid = quotes.scrollLeft + quotes.clientWidth / 2;
    let active = 0;
    cards.forEach((c, i) => { if (c.offsetLeft - quotes.offsetLeft <= mid) active = i; });
    [...dots.children].forEach((d, i) => d.setAttribute('aria-current', String(i === active)));
  };
  quotes.addEventListener('scroll', syncDots, { passive: true });
  syncDots();
}

/* Quick-contact bar (phones): show after the hero, hide at the contact section */
const mbar = document.getElementById('mbar');
const contactSection = document.getElementById('contact');
if (mbar && contactSection) {
  const syncBar = () => {
    const pastHero = window.scrollY > window.innerHeight * 0.7;
    const atContact = contactSection.getBoundingClientRect().top < window.innerHeight * 0.85;
    mbar.classList.toggle('is-shown', phone.matches && pastHero && !atContact);
  };
  window.addEventListener('scroll', syncBar, { passive: true });
  window.addEventListener('resize', syncBar);
  syncBar();
}

/* ── TOAST ── */
const toast = document.createElement('div');
toast.className = 'toast';
toast.setAttribute('role', 'status');
document.body.appendChild(toast);
let toastTimer;
function showToast(msg) {
  toast.textContent = msg;
  toast.classList.add('is-shown');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('is-shown'), 4500);
}

/* ── CONTACT FORM → Gmail compose ── */
const form = document.getElementById('contactForm');

function composeParts() {
  const data    = new FormData(form);
  const name    = (data.get('name') || '').trim();
  const company = (data.get('company') || '').trim();
  const service = data.get('service') || 'Not specified';
  const message = (data.get('message') || '').trim();

  const subject = `New project enquiry — ${service}${company ? ' · ' + company : ''}`;
  const body = [
    'Hi CodersDek team,',
    '',
    message,
    '',
    '—',
    `Name: ${name}`,
    company ? `Company: ${company}` : null,
    `Service: ${service}`,
  ].filter(line => line !== null).join('\n');

  return { subject, body };
}

function setError(field, msg) {
  const wrap = form.querySelector(`#${field}`).closest('.field');
  wrap.classList.toggle('has-error', Boolean(msg));
  wrap.querySelector('.err').textContent = msg || '';
}

function validate() {
  const name    = form.elements.name.value.trim();
  const message = form.elements.message.value.trim();
  setError('name',    name ? '' : 'Please tell us your name.');
  setError('message', message.length >= 10 ? '' : 'A sentence or two about the project helps us reply properly.');
  const firstInvalid = form.querySelector('.has-error input, .has-error textarea');
  if (firstInvalid) firstInvalid.focus();
  return !firstInvalid;
}

['name', 'message'].forEach(id => {
  form.querySelector('#' + id).addEventListener('input', () => setError(id, ''));
});

form.addEventListener('submit', e => {
  e.preventDefault();
  if (!validate()) return;

  const { subject, body } = composeParts();
  const params = new URLSearchParams({ view: 'cm', fs: '1', to: CONTACT_EMAIL, su: subject, body });
  const gmailUrl = `https://mail.google.com/mail/?${params.toString()}`;

  const win = window.open(gmailUrl, '_blank');
  if (win) {
    win.opener = null;
    showToast('Gmail opened in a new tab — just hit Send.');
  } else {
    window.location.href = gmailUrl; // popup blocked: open in this tab instead
  }
});

// Fallback for people who don't use Gmail: same draft in their default mail app
document.getElementById('mailtoFallback').addEventListener('click', e => {
  if (!form.elements.name.value.trim() && !form.elements.message.value.trim()) return; // plain mailto
  e.preventDefault();
  const { subject, body } = composeParts();
  window.location.href = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
});

/* ── FOOTER YEAR ── */
document.getElementById('year').textContent = new Date().getFullYear();

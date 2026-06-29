/* ═══════════════════════════════════════════════════════════════
   MURMURE DES MESSAGES — main.js
   ═══════════════════════════════════════════════════════════════ */

// ─── Season ──────────────────────────────────────────────────────
const SEASONS = ['ete', 'automne', 'hiver', 'printemps'];
const SEASON_ICONS = { ete: '☀️', printemps: '🌸', automne: '🍂', hiver: '❄️' };

function detectSeason() {
  const m = new Date().getMonth() + 1;
  if (m >= 3 && m <= 5)  return 'printemps';
  if (m >= 6 && m <= 8)  return 'ete';
  if (m >= 9 && m <= 11) return 'automne';
  return 'hiver';
}

function applySeason(season) {
  document.documentElement.dataset.season = season;
  const icon = document.querySelector('.js-season-icon');
  if (icon) icon.textContent = SEASON_ICONS[season] ?? '☀️';
  try { localStorage.setItem('mdm-season', season); } catch (_) {}
}

function initSeason() {
  let saved;
  try { saved = localStorage.getItem('mdm-season'); } catch (_) {}
  const season = SEASONS.includes(saved) ? saved : detectSeason();
  applySeason(season);

  const btn = document.querySelector('.js-season-btn');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const cur = document.documentElement.dataset.season;
    const next = SEASONS[(SEASONS.indexOf(cur) + 1) % SEASONS.length];
    applySeason(next);
  });
}

// ─── Nav ─────────────────────────────────────────────────────────
function initNav() {
  const header = document.querySelector('.js-header');
  const hamburger = document.querySelector('.js-hamburger');
  const navLinks = document.getElementById('nav-links');

  // Backdrop on scroll
  const onScroll = () => {
    header.classList.toggle('header--scrolled', window.scrollY > 60);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // Hamburger toggle
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const open = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', String(!open));
      hamburger.setAttribute('aria-label', open ? 'Ouvrir le menu' : 'Fermer le menu');
      navLinks.classList.toggle('nav__links--open', !open);
    });

    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.setAttribute('aria-expanded', 'false');
        hamburger.setAttribute('aria-label', 'Ouvrir le menu');
        navLinks.classList.remove('nav__links--open');
      });
    });
  }

}

// ─── Lenis smooth scroll ──────────────────────────────────────────
function initLenis() {
  if (typeof Lenis === 'undefined') {
    // Native smooth scroll for anchors when Lenis is absent
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
    return null;
  }

  const lenis = new Lenis({
    duration: 1.2,
    easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
  });

  if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(time => lenis.raf(time * 1000));
    gsap.ticker.lagSmoothing(0);
  } else {
    (function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    })(performance.now());
  }

  // Anchor links via Lenis
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target, { offset: -76 });
    });
  });

  return lenis;
}

// ─── GSAP scroll animations ───────────────────────────────────────
function initAnimations() {
  if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
  gsap.registerPlugin(ScrollTrigger);

  // Individual reveals
  gsap.utils.toArray('[data-reveal]').forEach(el => {
    gsap.from(el, {
      opacity: 0,
      y: 28,
      duration: 0.9,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: el,
        start: 'top 88%',
        toggleActions: 'play none none none',
      },
    });
  });

  // Staggered groups (book cards)
  gsap.utils.toArray('[data-reveal-group]').forEach(group => {
    const items = group.querySelectorAll('[data-reveal-item]');
    if (!items.length) return;
    gsap.from(items, {
      opacity: 0,
      y: 36,
      duration: 0.85,
      stagger: 0.14,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: group,
        start: 'top 85%',
        toggleActions: 'play none none none',
      },
    });
  });
}

// ─── Order form (mailto) ──────────────────────────────────────────
function initOrderForm() {
  const form = document.getElementById('order-form');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(form);
    const nom      = (data.get('nom')     || '').trim();
    const email    = (data.get('email')   || '').trim();
    const livres   = data.getAll('livres');
    const qte      = data.get('quantite') || '1';
    const livraison = data.get('livraison') || '—';
    const message  = (data.get('message') || '').trim();

    const lines = [
      'Bonjour Clémentine,',
      '',
      'Je souhaite commander :',
      ...(livres.length ? livres.map(l => '  - ' + l) : ['  - (à préciser)']),
      '',
      'Quantité : ' + qte,
      'Livraison : ' + livraison,
      '',
      'Nom : '   + (nom   || '(à compléter)'),
      'Email : ' + (email || '(à compléter)'),
      '',
      'Message :',
      message || '(aucun)',
      '',
      'Merci !',
    ];

    window.location.href =
      'mailto:contact@clementinemoury.com?subject=' +
      encodeURIComponent('Commande — Murmure des messages') +
      '&body=' +
      encodeURIComponent(lines.join('\n'));
  });
}

// ─── Footer loader ───────────────────────────────────────────────
async function loadFooter() {
  try {
    const response = await fetch('footer.html');
    if (!response.ok) throw new Error('Footer load failed');
    const html = await response.text();
    const main = document.querySelector('main');
    if (!main) return;
    main.insertAdjacentHTML('afterend', html);
  } catch (err) {
    console.warn('Could not load footer:', err.message);
  }
}

// ─── Boot ─────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await loadFooter();
  initSeason();
  initNav();
  initOrderForm();

  // Wait for GSAP/Lenis to be available (loaded via <script> tags)
  initLenis();
  initAnimations();
});

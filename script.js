const header = document.querySelector('[data-header]');
const menuToggle = document.querySelector('[data-menu-toggle]');
const navigation = document.querySelector('[data-nav]');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

const setMenu = (isOpen) => {
  menuToggle?.setAttribute('aria-expanded', String(isOpen));
  navigation?.classList.toggle('is-open', isOpen);
  document.body.classList.toggle('menu-open', isOpen);
};

menuToggle?.addEventListener('click', () => {
  setMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
});

navigation?.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
    setMenu(false);
    menuToggle.focus();
  }
});

const updateHeader = () => {
  header?.classList.toggle('is-scrolled', window.scrollY > 40);
};

updateHeader();
window.addEventListener('scroll', updateHeader, { passive: true });

const revealItems = document.querySelectorAll('[data-reveal]');
if (reduceMotion.matches || !('IntersectionObserver' in window)) {
  revealItems.forEach((item) => item.classList.add('is-visible'));
} else {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { rootMargin: '0px 0px -8% 0px', threshold: 0.08 },
  );
  revealItems.forEach((item) => observer.observe(item));
}

const parallaxObject = document.querySelector('[data-parallax-object]');
const hero = document.querySelector('.hero');

if (!reduceMotion.matches && parallaxObject && hero && window.matchMedia('(pointer: fine)').matches) {
  hero.addEventListener('pointermove', (event) => {
    const bounds = hero.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 18;
    const y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 18;
    parallaxObject.style.setProperty('--object-x', `${x}px`);
    parallaxObject.style.setProperty('--object-y', `${y}px`);
  });

  hero.addEventListener('pointerleave', () => {
    parallaxObject.style.setProperty('--object-x', '0px');
    parallaxObject.style.setProperty('--object-y', '0px');
  });
}

document.querySelectorAll('[data-year]').forEach((item) => {
  item.textContent = new Date().getFullYear();
});

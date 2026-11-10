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

const workProjects = [
  {
    name: 'Kenmar Corporation',
    caseId: 'kenmar',
    url: 'https://ekenmar.com/',
    image: 'assets/projects/kenmar.png',
    alt: 'Kenmar Corporation website homepage showing its automotive business development positioning',
    contribution: 'Figma-to-WordPress implementation',
    services: 'Elementor Pro · Responsive development',
    note: 'A faithful Elementor Pro implementation of a supplied Figma direction, translated into a responsive WordPress site.',
  },
  {
    name: 'Genieum',
    caseId: 'genieum',
    url: 'https://genieum.com/',
    image: 'assets/projects/genieum.png',
    alt: 'Genieum website homepage presenting its trade credit platform',
    contribution: 'Front-end implementation',
    services: 'Figma to WordPress · Elementor Pro',
    note: 'A Figma-to-WordPress build for a platform introducing a modern approach to B2B trade credit.',
  },
  {
    name: 'Just Be The Bank',
    caseId: 'jbtb',
    url: 'https://www.justbethebank.com/',
    image: 'assets/projects/just-be-the-bank.png',
    alt: 'Just Be The Bank website homepage about private lending education',
    contribution: 'Collaborative design and development',
    services: 'Figma · Elementor · Responsive development',
    note: 'A collaborative engagement spanning the Figma design and its responsive Elementor implementation.',
  },
  {
    name: 'PartsBadger',
    caseId: 'parts',
    url: 'https://parts-badger.com/',
    image: 'assets/projects/parts-badger.png',
    alt: 'PartsBadger online CNC machine shop website homepage',
    contribution: 'Blog experience redesign',
    services: 'UX refinement · Blog archive · Post templates',
    note: 'A focused redesign of the blog archive and article templates to improve the reading and discovery experience.',
  },
  {
    name: 'Camden Place',
    caseId: 'camden',
    url: 'https://camdenplace.co.uk/',
    image: 'assets/projects/camden-place.png',
    alt: 'Camden Place Dental and Implant Centre website homepage',
    contribution: 'Landing page development',
    services: 'Elementor · Responsive development · On-page SEO',
    note: 'Landing pages, responsive implementation, and on-page SEO enhancements for an established dental and implant centre.',
  },
];

const workReel = document.querySelector('[data-work-reel]');

if (workReel) {
  const image = workReel.querySelector('[data-work-image]');
  const name = workReel.querySelector('[data-work-name]');
  const index = workReel.querySelector('[data-work-index]');
  const contribution = workReel.querySelector('[data-work-contribution]');
  const services = workReel.querySelector('[data-work-services]');
  const note = workReel.querySelector('[data-work-note]');
  const status = workReel.querySelector('[data-work-status]');
  const frameLabel = workReel.querySelector('[data-work-frame-label]');
  const caseButton = workReel.querySelector('[data-case-open]');
  const previousImage = workReel.querySelector('[data-work-previous-image]');
  const nextImage = workReel.querySelector('[data-work-next-image]');
  const previousName = workReel.querySelector('[data-work-previous-name]');
  const nextName = workReel.querySelector('[data-work-next-name]');
  const progressButtons = [...workReel.querySelectorAll('[data-work-go]')];
  const liveLinks = [...workReel.querySelectorAll('[data-work-live]')];
  let activeProject = Number(workReel.dataset.activeProject || 0);
  let transitionTimer;
  let touchStartX = 0;

  workProjects.forEach((project) => {
    const preload = new Image();
    preload.src = project.image;
  });

  const getProject = (position) => workProjects[(position + workProjects.length) % workProjects.length];

  const renderProject = (position) => {
    activeProject = (position + workProjects.length) % workProjects.length;
    const project = getProject(activeProject);
    const previous = getProject(activeProject - 1);
    const next = getProject(activeProject + 1);
    const projectNumber = String(activeProject + 1).padStart(2, '0');

    workReel.dataset.activeProject = String(activeProject);
    image.src = project.image;
    image.alt = project.alt;
    name.textContent = project.name;
    index.textContent = projectNumber;
    contribution.textContent = project.contribution;
    services.textContent = project.services;
    note.textContent = project.note;
    frameLabel.textContent = `${projectNumber} / ${project.name}`;
    status.textContent = `Showing project ${activeProject + 1} of ${workProjects.length}: ${project.name}`;
    caseButton.dataset.caseOpen = project.caseId;
    caseButton.setAttribute('aria-label', `Open the ${project.name} case note`);

    liveLinks.forEach((link) => {
      link.href = project.url;
      link.setAttribute('aria-label', `Visit ${project.name} website`);
    });

    previousImage.src = previous.image;
    nextImage.src = next.image;
    previousName.textContent = previous.name;
    nextName.textContent = next.name;

    workReel.querySelectorAll('[data-work-previous]').forEach((button) => {
      button.setAttribute('aria-label', `Show previous project, ${previous.name}`);
    });
    workReel.querySelectorAll('[data-work-next]').forEach((button) => {
      button.setAttribute('aria-label', `Show next project, ${next.name}`);
    });

    progressButtons.forEach((button, buttonIndex) => {
      const isActive = buttonIndex === activeProject;
      button.classList.toggle('is-active', isActive);
      if (isActive) button.setAttribute('aria-current', 'true');
      else button.removeAttribute('aria-current');
    });
  };

  const goToProject = (position) => {
    const normalizedPosition = (position + workProjects.length) % workProjects.length;
    if (normalizedPosition === activeProject) return;

    window.clearTimeout(transitionTimer);
    if (reduceMotion.matches) {
      renderProject(normalizedPosition);
      return;
    }

    workReel.classList.add('is-changing');
    transitionTimer = window.setTimeout(() => {
      renderProject(normalizedPosition);
      requestAnimationFrame(() => workReel.classList.remove('is-changing'));
    }, 180);
  };

  workReel.querySelectorAll('[data-work-previous]').forEach((button) => {
    button.addEventListener('click', () => goToProject(activeProject - 1));
  });

  workReel.querySelectorAll('[data-work-next]').forEach((button) => {
    button.addEventListener('click', () => goToProject(activeProject + 1));
  });

  progressButtons.forEach((button) => {
    button.addEventListener('click', () => goToProject(Number(button.dataset.workGo)));
  });

  workReel.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      goToProject(activeProject - 1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      goToProject(activeProject + 1);
    }
  });

  workReel.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].clientX;
  }, { passive: true });

  workReel.addEventListener('touchend', (event) => {
    const distance = event.changedTouches[0].clientX - touchStartX;
    if (Math.abs(distance) < 48) return;
    goToProject(activeProject + (distance < 0 ? 1 : -1));
  }, { passive: true });

  renderProject(activeProject);
}

document.querySelectorAll('[data-case-open]').forEach((button) => {
  button.addEventListener('click', () => {
    const dialog = document.querySelector(`[data-case="${button.dataset.caseOpen}"]`);
    dialog?.showModal();
  });
});

document.querySelectorAll('.case-dialog').forEach((dialog) => {
  dialog.querySelector('[data-case-close]')?.addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => {
    const bounds = dialog.getBoundingClientRect();
    const outside =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;
    if (outside) dialog.close();
  });
});

document.querySelectorAll('[data-year]').forEach((item) => {
  item.textContent = new Date().getFullYear();
});

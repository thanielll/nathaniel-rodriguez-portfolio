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

const workProjects = window.portfolioProjects || [];

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
  const caseLinks = [...workReel.querySelectorAll('[data-case-link]')];
  const previousImage = workReel.querySelector('[data-work-previous-image]');
  const nextImage = workReel.querySelector('[data-work-next-image]');
  const previousName = workReel.querySelector('[data-work-previous-name]');
  const nextName = workReel.querySelector('[data-work-next-name]');
  const progressButtons = [...workReel.querySelectorAll('[data-work-go]')];
  const liveLinks = [...workReel.querySelectorAll('[data-work-live]')];
  let activeProject = Number(workReel.dataset.activeProject || 0);
  let transitionTimer;
  let dragStartX = 0;
  let dragPointerId = null;
  let dragged = false;
  let suppressCaseClick = false;
  let previousScrollY = window.scrollY;
  let scrollFrame;
  let scrollSettleTimer;

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
    image.draggable = false;
    name.textContent = project.name;
    index.textContent = projectNumber;
    contribution.textContent = project.role;
    services.textContent = project.services.join(' · ');
    note.textContent = project.summary;
    frameLabel.textContent = `${projectNumber} / ${project.name}`;
    status.textContent = `Showing project ${activeProject + 1} of ${workProjects.length}: ${project.name}`;
    caseLinks.forEach((link) => {
      link.href = `case-studies/${project.id}/`;
      link.setAttribute('aria-label', `Read the ${project.name} case study`);
    });

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

  const mainFrame = workReel.querySelector('.work-frame');
  if (mainFrame) mainFrame.draggable = false;
  mainFrame?.addEventListener('dragstart', (event) => event.preventDefault());
  mainFrame?.addEventListener('pointerdown', (event) => {
    if (event.pointerType === 'mouse' && event.button !== 0) return;
    dragPointerId = event.pointerId;
    dragStartX = event.clientX;
    dragged = false;
    mainFrame.setPointerCapture?.(dragPointerId);
    workReel.classList.add('is-dragging');
  });

  mainFrame?.addEventListener('pointermove', (event) => {
    if (event.pointerId !== dragPointerId) return;
    const offset = Math.max(-18, Math.min(18, (event.clientX - dragStartX) * 0.12));
    image.style.setProperty('--drag-offset', `${offset}px`);
  });

  mainFrame?.addEventListener('pointerup', (event) => {
    if (event.pointerId !== dragPointerId) return;
    const distance = event.clientX - dragStartX;
    dragged = Math.abs(distance) >= 42;
    dragPointerId = null;
    workReel.classList.remove('is-dragging');
    image.style.removeProperty('--drag-offset');
    if (!dragged) return;
    suppressCaseClick = true;
    goToProject(activeProject + (distance < 0 ? 1 : -1));
    window.setTimeout(() => { suppressCaseClick = false; }, 0);
  });

  mainFrame?.addEventListener('pointercancel', () => {
    dragPointerId = null;
    workReel.classList.remove('is-dragging');
    image.style.removeProperty('--drag-offset');
  });

  mainFrame?.addEventListener('click', (event) => {
    if (!suppressCaseClick) return;
    event.preventDefault();
    event.stopPropagation();
  });

  const resetScrollNudge = () => workReel.style.removeProperty('--scroll-shift');

  window.addEventListener('scroll', () => {
    const movement = window.scrollY - previousScrollY;
    previousScrollY = window.scrollY;

    if (reduceMotion.matches) {
      resetScrollNudge();
      return;
    }

    const bounds = workReel.getBoundingClientRect();
    if (Math.abs(movement) < 2 || bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;

    window.cancelAnimationFrame(scrollFrame);
    scrollFrame = window.requestAnimationFrame(() => {
      workReel.style.setProperty('--scroll-shift', movement > 0 ? '-10px' : '10px');
    });
    window.clearTimeout(scrollSettleTimer);
    scrollSettleTimer = window.setTimeout(resetScrollNudge, 320);
  }, { passive: true });

  window.addEventListener('resize', resetScrollNudge, { passive: true });

  renderProject(activeProject);
}

document.querySelectorAll('[data-year]').forEach((item) => {
  item.textContent = new Date().getFullYear();
});

(() => {
  const explorer = document.querySelector('[data-work-explorer]');
  const projects = window.portfolioProjects || [];
  if (!explorer || !projects.length) return;

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const indexList = explorer.querySelector('[data-work-index]');
  const indexFragment = document.createDocumentFragment();
  projects.forEach((project, index) => {
    const number = String(index + 1).padStart(2, '0');
    const tab = document.createElement('button');
    tab.className = 'project-index__item';
    tab.id = `project-tab-${project.id}`;
    tab.type = 'button';
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-selected', 'false');
    tab.setAttribute('aria-controls', 'work-preview');
    tab.tabIndex = -1;
    tab.dataset.workSelect = String(index);

    const labelNumber = document.createElement('span');
    labelNumber.className = 'project-index__number';
    labelNumber.textContent = number;
    const text = document.createElement('span');
    text.className = 'project-index__text';
    const title = document.createElement('strong');
    title.textContent = project.name;
    const cue = document.createElement('small');
    cue.textContent = project.archiveCue || project.role;
    text.append(title, cue);
    const arrow = document.createElement('span');
    arrow.className = 'project-index__arrow';
    arrow.setAttribute('aria-hidden', 'true');
    arrow.textContent = '↗';
    tab.append(labelNumber, text, arrow);
    indexFragment.append(tab);
  });
  indexList.replaceChildren(indexFragment);
  const tabs = [...explorer.querySelectorAll('[data-work-select]')];
  const preview = explorer.querySelector('[data-work-preview]');
  const image = explorer.querySelector('[data-work-image]');
  const count = explorer.querySelector('[data-work-count]');
  const name = explorer.querySelector('[data-work-name]');
  const role = explorer.querySelector('[data-work-role]');
  const note = explorer.querySelector('[data-work-note]');
  const services = explorer.querySelector('[data-work-services]');
  const status = explorer.querySelector('[data-work-status]');
  const fallback = explorer.querySelector('[data-work-fallback]');
  const visualLabel = explorer.querySelector('.work-preview__visual-label span:first-child');
  const caseLinks = [...explorer.querySelectorAll('[data-work-case-link]')];
  const liveLink = explorer.querySelector('[data-work-live]');
  let activeIndex = Math.max(0, Math.min(projects.length - 1, Number(explorer.dataset.activeProject) || 0));
  let transitionTimer;
  let previousScrollY = window.scrollY;
  let settleTimer;

  const render = (index) => {
    activeIndex = index;
    const project = projects[index];
    const number = String(index + 1).padStart(2, '0');
    explorer.dataset.activeProject = String(index);
    name.textContent = project.name;
    count.textContent = `${number} / ${String(projects.length).padStart(2, '0')}`;
    role.textContent = project.role;
    note.textContent = project.summary;
    image.src = project.image;
    image.alt = project.alt;
    image.classList.remove('is-unavailable');
    fallback.hidden = true;
    image.onload = () => {
      image.classList.remove('is-unavailable');
      fallback.hidden = true;
    };
    image.onerror = () => {
      image.classList.add('is-unavailable');
      fallback.hidden = false;
    };
    visualLabel.textContent = `${number} / ${String(projects.length).padStart(2, '0')}`;
    status.textContent = `Showing project ${index + 1} of ${projects.length}: ${project.name}`;
    preview.setAttribute('aria-labelledby', tabs[index].id);
    caseLinks.forEach((link) => {
      link.href = `case-studies/${project.id}/`;
      link.setAttribute('aria-label', `Open the ${project.name} case study`);
    });
    liveLink.href = project.url;
    liveLink.setAttribute('aria-label', `Visit ${project.name} website`);

    const fragment = document.createDocumentFragment();
    project.services.forEach((service) => {
      const item = document.createElement('li');
      item.textContent = service;
      fragment.append(item);
    });
    services.replaceChildren(fragment);

    tabs.forEach((tab, tabIndex) => {
      const selected = tabIndex === index;
      tab.classList.toggle('is-active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
    });
  };

  const select = (index) => {
    const next = (index + projects.length) % projects.length;
    if (next === activeIndex) return;
    window.clearTimeout(transitionTimer);
    if (reducedMotion.matches) {
      render(next);
      return;
    }
    preview.classList.add('is-changing');
    transitionTimer = window.setTimeout(() => {
      render(next);
      window.requestAnimationFrame(() => preview.classList.remove('is-changing'));
    }, 130);
  };

  tabs.forEach((tab, index) => {
    tab.addEventListener('click', () => select(index));
    tab.addEventListener('focus', () => select(index));
    tab.addEventListener('pointerenter', (event) => {
      if (event.pointerType === 'mouse' && window.matchMedia('(hover: hover) and (pointer: fine)').matches) select(index);
    });
    tab.addEventListener('keydown', (event) => {
      let target = index;
      if (event.key === 'ArrowDown') target = (index + 1) % tabs.length;
      else if (event.key === 'ArrowUp') target = (index - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') target = 0;
      else if (event.key === 'End') target = tabs.length - 1;
      else return;
      event.preventDefault();
      tabs[target].focus();
    });
  });

  let scrollFrame = 0;
  const resetNudge = () => explorer.style.removeProperty('--scroll-shift');
  window.addEventListener('scroll', () => {
    const movement = window.scrollY - previousScrollY;
    previousScrollY = window.scrollY;
    if (reducedMotion.matches || Math.abs(movement) < 2) {
      if (reducedMotion.matches) resetNudge();
      return;
    }
    const bounds = explorer.getBoundingClientRect();
    if (bounds.bottom <= 0 || bounds.top >= window.innerHeight) return;
    window.cancelAnimationFrame(scrollFrame);
    scrollFrame = window.requestAnimationFrame(() => {
      explorer.style.setProperty('--scroll-shift', movement > 0 ? '-7px' : '7px');
    });
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(resetNudge, 280);
  }, { passive: true });
  window.addEventListener('resize', resetNudge, { passive: true });

  render(activeIndex);
})();

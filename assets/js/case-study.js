const projectId = document.body.dataset.caseStudy;
const projects = window.portfolioProjects || [];
const projectIndex = projects.findIndex((project) => project.id === projectId);
const project = projects[projectIndex];
const devices = [
  { id: 'desktop', label: 'Desktop', width: 1440, height: 960 },
  { id: 'laptop', label: 'Laptop', width: 1280, height: 900 },
  { id: 'tablet', label: 'Tablet', width: 834, height: 1112 },
  { id: 'mobile', label: 'Mobile', width: 390, height: 844 },
];
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
const $ = (selector, root = document) => root.querySelector(selector);

document.documentElement.classList.remove('no-js');

if (project && projectIndex >= 0) {
  const projectNumber = String(projectIndex + 1).padStart(2, '0');
  const nextProject = projects[(projectIndex + 1) % projects.length];
  const nextNumber = String(((projectIndex + 1) % projects.length) + 1).padStart(2, '0');
  const setText = (selector, value) => { const element = $(selector); if (element) element.textContent = value; };

  document.title = `${project.name} — Selected work by Nathaniel Rodriguez`;
  $('meta[name="description"]')?.setAttribute('content', project.summary);
  $('meta[property="og:title"]')?.setAttribute('content', `${project.name} — Nathaniel Rodriguez`);
  $('meta[property="og:description"]')?.setAttribute('content', project.summary);
  setText('[data-case-title]', project.name);
  setText('[data-case-role]', project.role);
  setText('[data-case-summary]', project.summary);
  setText('[data-case-need]', project.need);
  setText('[data-case-approach]', project.approach);
  setText('[data-case-implementation]', project.implementation);
  setText('[data-case-role-detail]', project.role);
  setText('[data-case-services]', project.services.join(' · '));
  setText('[data-case-tech]', project.services.join(' / '));
  setText('[data-hero-caption]', project.name);
  setText('[data-case-index]', `${projectNumber} / ${String(projects.length).padStart(2, '0')}`);
  setText('[data-next-index]', `${nextNumber} / ${String(projects.length).padStart(2, '0')}`);

  const heroImage = $('[data-hero-image]');
  heroImage.src = `../../${project.image}`;
  heroImage.alt = project.alt;
  $('[data-live-link]')?.setAttribute('href', project.url);
  $('[data-next-link]')?.setAttribute('href', `../${nextProject.id}/`);
  setText('[data-next-link]', nextProject.name);
  document.querySelectorAll('[data-year]').forEach((item) => { item.textContent = new Date().getFullYear(); });

  const implementationList = $('[data-implementation-list]');
  implementationList.replaceChildren();
  project.details.forEach((detail, index) => {
    const row = document.createElement('article');
    row.className = 'implementation-row';
    const number = document.createElement('span');
    number.className = 'implementation-row__number';
    number.textContent = String(index + 1).padStart(2, '0');
    const title = document.createElement('h3');
    title.textContent = detail.label;
    const description = document.createElement('p');
    description.textContent = detail.text;
    row.append(number, title, description);
    implementationList.append(row);
  });

  const explorer = $('[data-device-explorer]');
  const preview = $('[data-preview-scroll]');
  const captureList = $('[data-device-captures]');
  const unavailable = $('[data-device-unavailable]');
  const progress = $('[data-preview-progress]');
  const deviceWidth = $('[data-device-width]');
  const browserLabel = $('[data-browser-label]');
  const deviceButtons = [...document.querySelectorAll('[data-device]')];
  const deviceDialog = $('[data-device-dialog]');
  const zoomCaptureList = $('[data-zoom-captures]');
  const zoomTitle = $('[data-zoom-title]');
  let selectedDevice = null;
  let selectedSegments = [];
  let captureSets = new Map();
  let switchTimer;

  const updateProgress = () => {
    const range = preview.scrollHeight - preview.clientHeight;
    const percent = range > 0 ? Math.round((preview.scrollTop / range) * 100) : 0;
    progress.style.width = `${percent}%`;
  };

  const renderSegments = (target, device, segments, displayWidth = device.width, isZoom = false) => {
    target.replaceChildren();
    target.style.setProperty('--capture-width', `${displayWidth}px`);
    target.classList.toggle('device-capture-list--zoom', isZoom);
    segments.forEach((segment, index) => {
      const cropTop = Number(segment.cropTop || 0);
      const wrapper = document.createElement('div');
      wrapper.className = 'device-capture-segment';
      wrapper.style.aspectRatio = `${device.width} / ${Math.max(1, device.height - cropTop)}`;
      const image = document.createElement('img');
      image.src = `../../${segment.path}`;
      image.width = segment.width;
      image.height = segment.height;
      image.alt = `${project.name} live website screenshot, ${device.label.toLowerCase()} viewport, section ${index + 1} of ${segments.length}`;
      image.loading = isZoom || index === 0 ? 'eager' : 'lazy';
      image.decoding = 'async';
      image.style.objectPosition = index === 0 ? 'center top' : 'center bottom';
      image.addEventListener('load', updateProgress, { once: true });
      if (!isZoom) image.addEventListener('error', () => showUnavailable(device, `A saved ${device.label.toLowerCase()} screenshot segment could not be loaded.`), { once: true });
      wrapper.append(image);
      target.append(wrapper);
    });
  };

  const showUnavailable = (device, message = '') => {
    captureList.replaceChildren();
    unavailable.hidden = false;
    setText('[data-device-unavailable] p', message || `No verified ${device.label.toLowerCase()} capture is available for this project.`);
    const button = deviceButtons.find((item) => item.dataset.device === device.id);
    if (button) {
      button.disabled = true;
      button.setAttribute('aria-label', `${device.label} capture unavailable`);
      button.title = 'A verified screenshot is not available at this viewport.';
    }
    setText('[data-device-status]', `${device.label} screenshot unavailable.`);
    setText('[data-capture-caption]', `No verified ${device.label.toLowerCase()} screenshot is available.`);
  };

  const selectDevice = (deviceId) => {
    const device = devices.find((item) => item.id === deviceId);
    if (!device || deviceButtons.find((button) => button.dataset.device === device.id)?.disabled) return;
    const capture = captureSets.get(device.id);
    if (!capture?.segments?.length) return showUnavailable(device);
    selectedDevice = device;
    selectedSegments = capture.segments;
    deviceButtons.forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.device === device.id)));
    deviceWidth.textContent = `${device.width}px viewport`;
    browserLabel.textContent = `${device.label} capture`;
    unavailable.hidden = true;
    renderSegments(captureList, device, capture.segments);
    preview.scrollTop = 0;
    progress.style.width = '0%';
    setText('[data-device-status]', `Showing ${device.label.toLowerCase()} capture, ${device.width} pixel viewport.`);
    setText('[data-capture-caption]', `Genuine ${device.width}px captures · ${capture.segments.length} sections in this full-page view.`);

    clearTimeout(switchTimer);
    if (!reduceMotion.matches) explorer.classList.add('is-switching');
    switchTimer = window.setTimeout(() => {
      window.setTimeout(() => explorer.classList.remove('is-switching'), reduceMotion.matches ? 0 : 110);
    }, reduceMotion.matches ? 0 : 100);
  };

  deviceButtons.forEach((button) => button.addEventListener('click', () => selectDevice(button.dataset.device)));
  $('[data-device-tabs]')?.addEventListener('keydown', (event) => {
    if (!['ArrowLeft', 'ArrowRight'].includes(event.key)) return;
    const enabled = deviceButtons.filter((button) => !button.disabled);
    const current = enabled.findIndex((button) => button.dataset.device === selectedDevice?.id);
    const increment = event.key === 'ArrowRight' ? 1 : -1;
    const next = enabled[(current + increment + enabled.length) % enabled.length];
    if (next) { event.preventDefault(); next.focus(); selectDevice(next.dataset.device); }
  });
  preview.addEventListener('scroll', updateProgress, { passive: true });
  window.addEventListener('resize', updateProgress, { passive: true });

  $('[data-enlarge]')?.addEventListener('click', () => {
    if (!selectedDevice || !selectedSegments.length) return;
    const zoomWidth = Math.min(1200, Math.max(640, Math.round(selectedDevice.width * 0.88)));
    renderSegments(zoomCaptureList, selectedDevice, selectedSegments, zoomWidth, true);
    zoomTitle.textContent = `${project.name} · ${selectedDevice.label} capture`;
    deviceDialog.showModal();
    $('[data-zoom-scroll]').scrollTop = 0;
    $('[data-zoom-scroll]').scrollLeft = 0;
  });

  $('[data-close-dialog]')?.addEventListener('click', () => deviceDialog.close());
  deviceDialog.addEventListener('click', (event) => {
    if (event.target === deviceDialog) deviceDialog.close();
  });

  fetch('../../assets/project-explorer/manifest.json')
    .then((response) => response.ok ? response.json() : null)
    .then((manifest) => {
      if (!manifest?.projects) throw new Error('Screenshot manifest is unavailable.');
      manifest.projects.filter((item) => item.project === project.id).forEach((item) => {
        const button = deviceButtons.find((candidate) => candidate.dataset.device === item.device);
        if (item.status === 'captured' && item.segments?.length) {
          captureSets.set(item.device, item);
        } else if (button) {
          button.disabled = true;
          button.setAttribute('aria-label', `${item.label} capture unavailable`);
          button.title = item.reason || 'A verified screenshot is not available at this viewport.';
        }
      });
      const initial = deviceButtons.find((button) => button.dataset.device === 'desktop' && !button.disabled)
        || deviceButtons.find((button) => !button.disabled);
      if (initial) selectDevice(initial.dataset.device);
      else {
        deviceButtons.forEach((button) => { button.disabled = true; });
        showUnavailable(devices[0], 'No verified project screenshots are available right now.');
      }
    })
    .catch(() => {
      deviceButtons.forEach((button) => { button.disabled = true; });
      showUnavailable(devices[0], 'The screenshot collection could not be loaded.');
    });

  const revealItems = document.querySelectorAll('.case-reveal');
  if (reduceMotion.matches || !('IntersectionObserver' in window)) {
    revealItems.forEach((item) => item.classList.add('is-visible'));
  } else {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -5% 0px', threshold: 0.04 });
    revealItems.forEach((item) => observer.observe(item));
  }
} else {
  document.querySelector('.case-main')?.replaceChildren(Object.assign(document.createElement('p'), {
    textContent: 'This case study could not be found. Return to selected work to browse the projects.',
  }));
}

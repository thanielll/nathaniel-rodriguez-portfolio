#!/usr/bin/env node
/* Capture real, viewport-width project screenshots for the static device viewer. */
const fs = require('node:fs/promises');
const path = require('node:path');
const projects = require('../assets/js/projects-data.js');
const { chromium } = require('playwright');

const root = path.resolve(__dirname, '..');
const outputRoot = path.join(root, 'assets', 'project-explorer');
const stagingRoot = path.join(root, 'assets', '.project-explorer-staging');
const backupRoot = path.join(root, 'assets', '.project-explorer-previous');
const devices = [
  { id: 'desktop', label: 'Desktop', width: 1440, height: 960 },
  { id: 'laptop', label: 'Laptop', width: 1280, height: 900 },
  { id: 'tablet', label: 'Tablet', width: 834, height: 1112 },
  { id: 'mobile', label: 'Mobile', width: 390, height: 844 },
];

const endpointArg = process.argv.indexOf('--cdp-endpoint');
const endpoint = endpointArg >= 0 ? process.argv[endpointArg + 1] : null;
const projectArg = process.argv.indexOf('--project');
const projectFilter = projectArg >= 0 ? process.argv[projectArg + 1] : null;
const selectedProjects = projectFilter ? projects.filter((project) => project.id === projectFilter) : projects;
const timeout = Number(process.env.CAPTURE_TIMEOUT_MS || 40000);
const padding = (value) => String(value).padStart(2, '0');

async function jpegDimensions(file) {
  const data = await fs.readFile(file);
  let offset = 2;
  while (offset < data.length) {
    if (data[offset] !== 0xff) { offset += 1; continue; }
    const marker = data[offset + 1];
    if ([0xc0, 0xc1, 0xc2, 0xc3, 0xc5, 0xc6, 0xc7, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf].includes(marker)) {
      return { height: data.readUInt16BE(offset + 5), width: data.readUInt16BE(offset + 7) };
    }
    const segmentLength = data.readUInt16BE(offset + 2);
    if (!segmentLength) break;
    offset += segmentLength + 2;
  }
  return { width: null, height: null };
}

async function captureProject(context, project, device) {
  const page = await context.newPage();
  await page.setViewportSize({ width: device.width, height: device.height });
  await page.addInitScript(() => {
    const hideBrowserScrollbars = () => {
      const style = document.createElement('style');
      style.textContent = 'html { scrollbar-width: none !important; } ::-webkit-scrollbar { width: 0 !important; height: 0 !important; display: none !important; }';
      document.documentElement.appendChild(style);
    };
    if (document.documentElement) hideBrowserScrollbars();
    else document.addEventListener('DOMContentLoaded', hideBrowserScrollbars, { once: true });
  });
  await page.setExtraHTTPHeaders({ 'Accept-Language': 'en-US,en;q=0.9' });
  const startedAt = new Date().toISOString();
  const segmentDirectory = path.join(stagingRoot, project.id, device.id);

  try {
    const response = await page.goto(project.url, { waitUntil: 'domcontentloaded', timeout });
    if (response && response.status() >= 400) throw new Error(`Website returned HTTP ${response.status()}`);
    await page.locator('body').waitFor({ state: 'visible', timeout: 10000 });
    await page.evaluate(() => document.fonts?.ready);
    await page.waitForTimeout(500);
    const details = await page.evaluate(() => ({
      title: document.title,
      width: window.innerWidth,
      height: document.documentElement.scrollHeight,
      bodyText: (document.body?.innerText || '').slice(0, 1200),
    }));
    if (!details.width || !details.height || details.height < 300) throw new Error('Website content did not render.');
    if (/checking your browser|just a moment|verify you are human|access denied/i.test(`${details.title} ${details.bodyText}`)) {
      throw new Error('Automated access check prevented a genuine page capture.');
    }
    if (details.width !== device.width) throw new Error(`Browser viewport measured ${details.width}px instead of ${device.width}px.`);

    await fs.mkdir(segmentDirectory, { recursive: true });
    const segments = [];
    const overlap = Math.min(
      Math.round(device.height * 0.28),
      device.width <= 480 ? 180 : device.width <= 834 ? 150 : 120,
    );
    const advance = device.height - overlap;
    let scrollY = 0;
    let previousY = -1;
    let cropTop = 0;

    for (let segmentIndex = 0; segmentIndex < 40; segmentIndex += 1) {
      await page.evaluate((top) => window.scrollTo(0, top), scrollY);
      await page.waitForTimeout(260);
      const viewport = await page.evaluate(async () => {
        const visibleImages = [...document.images].filter((image) => {
          const box = image.getBoundingClientRect();
          return box.bottom > 0 && box.top < window.innerHeight;
        });
        await Promise.all(visibleImages.map((image) => image.decode().catch(() => undefined)));
        return {
          scrollY: window.scrollY,
          scrollHeight: document.documentElement.scrollHeight,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      });
      if (viewport.width !== device.width || viewport.height !== device.height) {
        throw new Error(`Capture viewport measured ${viewport.width}×${viewport.height}, expected ${device.width}×${device.height}.`);
      }
      if (viewport.scrollY === previousY && segmentIndex > 0) break;

      const file = path.join(segmentDirectory, `${padding(segmentIndex + 1)}.jpg`);
      await page.screenshot({ path: file, type: 'jpeg', quality: 72, animations: 'disabled', timeout });
      const stat = await fs.stat(file);
      const imageSize = await jpegDimensions(file);
      if (imageSize.width !== device.width || imageSize.height !== device.height) {
        throw new Error(`Screenshot segment measured ${imageSize.width}×${imageSize.height}, expected ${device.width}×${device.height}.`);
      }
      const relativePath = `assets/project-explorer/${project.id}/${device.id}/${padding(segmentIndex + 1)}.jpg`;
      segments.push({ path: relativePath, scrollY: viewport.scrollY, cropTop, width: imageSize.width, height: imageSize.height, bytes: stat.size });

      const maxScroll = Math.max(0, viewport.scrollHeight - device.height);
      if (viewport.scrollY >= maxScroll || viewport.scrollY === previousY) break;
      previousY = viewport.scrollY;
      const nextY = Math.min(viewport.scrollY + advance, maxScroll);
      cropTop = Math.max(0, viewport.scrollY + device.height - nextY);
      scrollY = nextY;
    }

    if (!segments.length) throw new Error('No viewport screenshots were produced.');
    return {
      project: project.id,
      device: device.id,
      label: device.label,
      viewport: { width: device.width, height: device.height },
      pageTitle: details.title,
      pageHeight: details.height,
      status: 'captured',
      segments,
      bytes: segments.reduce((total, segment) => total + segment.bytes, 0),
      capturedAt: new Date().toISOString(),
    };
  } catch (error) {
    await fs.rm(segmentDirectory, { recursive: true, force: true });
    return {
      project: project.id,
      device: device.id,
      label: device.label,
      viewport: { width: device.width, height: device.height },
      status: 'unavailable',
      reason: error.message,
      startedAt,
    };
  } finally {
    await page.close();
  }
}

async function main() {
  if (!selectedProjects.length) throw new Error(`Unknown project id: ${projectFilter}`);
  await fs.rm(stagingRoot, { recursive: true, force: true });
  await fs.mkdir(stagingRoot, { recursive: true });
  const browser = endpoint
    ? await chromium.connectOverCDP(endpoint)
    : await chromium.launch({ headless: true });
  const context = endpoint ? browser.contexts()[0] : await browser.newContext();
  if (!context) throw new Error('Could not open a browser context.');
  const results = [];

  try {
    for (const project of selectedProjects) {
      for (const device of devices) {
        const result = await captureProject(context, project, device);
        results.push(result);
        const marker = result.status === 'captured' ? 'OK' : 'SKIP';
        const summary = result.status === 'captured'
          ? `${result.segments.length} segments · ${Math.round(result.bytes / 1024)} KB`
          : result.reason;
        process.stdout.write(`${marker} ${project.id.padEnd(8)} ${device.id.padEnd(7)} ${summary}\n`);
      }
    }
  } finally {
    await browser.close();
  }

  const manifest = {
    generatedAt: new Date().toISOString(),
    method: 'Sequential Playwright viewport screenshots with a small overlap to remove repeated sticky headers. Every segment preserves the exact CSS viewport dimensions.',
    note: 'Captures are genuine screenshots from the listed live websites. Unavailable views contain no substitute images.',
    devices,
    projects: results,
  };
  await fs.writeFile(path.join(stagingRoot, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
  await fs.rm(backupRoot, { recursive: true, force: true });
  try {
    await fs.rename(outputRoot, backupRoot);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  try {
    await fs.rename(stagingRoot, outputRoot);
  } catch (error) {
    try { await fs.rename(backupRoot, outputRoot); } catch {}
    throw error;
  }
  await fs.rm(backupRoot, { recursive: true, force: true });

  const captured = results.filter((result) => result.status === 'captured').length;
  const segmentCount = results.reduce((total, result) => total + (result.segments?.length || 0), 0);
  process.stdout.write(`\nCaptured ${captured} of ${results.length} viewport sets (${segmentCount} exact-width screenshots).\n`);
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});

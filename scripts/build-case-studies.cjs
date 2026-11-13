#!/usr/bin/env node
/* Generate the shareable GitHub Pages routes from the shared case study template. */
const fs = require('node:fs/promises');
const path = require('node:path');
const projects = require('../assets/js/projects-data.js');

const root = path.resolve(__dirname, '..');
const templatePath = path.join(root, 'templates', 'case-study.html');
const escapeHtml = (value) => String(value).replace(/[&<>"']/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
}[character]));

async function main() {
  const template = await fs.readFile(templatePath, 'utf8');
  let manifest;
  try { manifest = JSON.parse(await fs.readFile(path.join(root, 'assets', 'project-explorer', 'manifest.json'), 'utf8')); } catch { manifest = null; }
  for (const [index, project] of projects.entries()) {
    const nextProject = projects[(index + 1) % projects.length];
    const capture = manifest?.projects?.find((item) => item.project === project.id && item.device === 'desktop' && item.status === 'captured');
    const firstSegment = capture?.segments?.[0];
    const desktopCapture = firstSegment
      ? `<div class="device-capture-segment" style="aspect-ratio: ${firstSegment.width} / ${firstSegment.height}"><img src="../../${escapeHtml(firstSegment.path)}" alt="${escapeHtml(`${project.name} desktop screenshot, section 1 of ${capture.segments.length}`)}" width="${firstSegment.width}" height="${firstSegment.height}" fetchpriority="high" /></div>`
      : '';
    const implementationDetails = project.details.map((detail, detailIndex) => `<article class="implementation-row"><span class="implementation-row__number">${String(detailIndex + 1).padStart(2, '0')}</span><h3>${escapeHtml(detail.label)}</h3><p>${escapeHtml(detail.text)}</p></article>`).join('\n');
    const replacements = {
      '{{PROJECT_ID}}': project.id,
      '{{PROJECT_NAME}}': project.name,
      '{{PROJECT_DESCRIPTION}}': project.summary,
      '{{PROJECT_ROLE}}': project.role,
      '{{PROJECT_URL}}': project.url,
      '{{PROJECT_IMAGE}}': project.image,
      '{{PROJECT_ALT}}': project.alt,
      '{{PROJECT_NUMBER}}': String(index + 1).padStart(2, '0'),
      '{{PROJECT_NEED}}': project.need,
      '{{PROJECT_APPROACH}}': project.approach,
      '{{PROJECT_IMPLEMENTATION}}': project.implementation,
      '{{PROJECT_SERVICES}}': project.services.join(' · '),
      '{{PROJECT_SERVICES_SLASH}}': project.services.join(' / '),
      '{{PROJECT_DETAILS}}': implementationDetails,
      '{{DESKTOP_CAPTURE}}': desktopCapture,
      '{{NEXT_ID}}': nextProject.id,
      '{{NEXT_NAME}}': nextProject.name,
      '{{NEXT_NUMBER}}': String(((index + 1) % projects.length) + 1).padStart(2, '0'),
    };
    const html = Object.entries(replacements).reduce((output, [placeholder, value]) => {
      const escaped = placeholder === '{{PROJECT_DETAILS}}' || placeholder === '{{DESKTOP_CAPTURE}}' ? value : escapeHtml(value);
      return output.replaceAll(placeholder, escaped);
    }, template);
    const destination = path.join(root, 'case-studies', project.id, 'index.html');
    await fs.mkdir(path.dirname(destination), { recursive: true });
    await fs.writeFile(destination, html);
    process.stdout.write(`Built case-studies/${project.id}/\n`);
  }
}

main().catch((error) => {
  process.stderr.write(`${error.stack || error.message}\n`);
  process.exitCode = 1;
});

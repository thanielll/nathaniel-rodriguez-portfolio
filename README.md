# Nathaniel Rodriguez — Portfolio

A lightweight, responsive portfolio for Nathaniel Rodriguez, a WordPress website designer and developer specializing in Figma-to-WordPress implementation, Elementor Pro, responsive development, site improvements, and technical SEO.

## Highlights

- Editorial dark visual system with a crimson-red accent
- Original CSS-built atmospheric hero artwork
- A keyboard, touch, and drag friendly five-project reel with visible arrows, a subtle scroll nudge, and dedicated case study pages
- Responsive case study pages with genuine viewport captures of the live project websites
- Problem-led services and a four-step implementation walkthrough
- A personal introduction with a reserved portrait area
- Accessible device controls, scrollable screenshot previews, mobile navigation, keyboard controls, and swipe navigation
- Scroll reveals and restrained pointer parallax with reduced-motion support
- Static architecture designed for fast GitHub Pages hosting

## Technology

- Semantic HTML5
- Modern CSS with responsive layouts and custom properties
- Vanilla JavaScript in the published site, with no runtime dependencies
- Playwright as a development-only tool for capturing project screenshots
- GitHub Actions for automatic GitHub Pages deployment

## Run locally

No build step is required. Open `index.html` directly, or serve the folder with any static web server.

For example, if Python is available:

```bash
python -m http.server 4173
```

Then open `http://localhost:4173`.

## Case studies and project captures

Project details are maintained in `assets/js/projects-data.js`. After changing the project list or case study template, rebuild the static project routes:

```bash
npm run build:case-studies
```

Each case study is published at a shareable path under `case-studies/` and works with GitHub Pages. The screenshot viewer uses local, segmented captures at 1440px, 1280px, 834px, and 390px widths; each segment is a genuine Playwright screenshot taken at that viewport and the preview scrolls through them in order.

To refresh captures for client sites that permit access, install the development dependency and run:

```bash
npm install
npx playwright install chromium
npm run capture:projects
```

The capture script is separate from the production frontend. It records blocked or missing viewports in `assets/project-explorer/manifest.json`; the case study disables those device choices instead of showing replacement artwork. A single project can be recaptured with `npm run capture:projects -- --project genieum`.

## Deployment

Every push to `main` runs the workflow in `.github/workflows/pages.yml`. The workflow uploads the repository as a static Pages artifact and deploys it to GitHub Pages.

In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions** if it is not selected automatically.

## Add Nathaniel's portrait

The portrait space is in the About section, away from the hero. Once a photo is available, add it to `assets/` and replace the `portrait-slot__mark` element in `index.html` with an image. Keep a descriptive `alt` attribute and leave the caption if desired. The email and Upwork links are already configured.

## Project sources

The project preview images are current screenshots of the live sites supplied for this portfolio. All client names, contribution descriptions, and URLs come from the project brief; no testimonials or performance claims were added.

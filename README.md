# Nathaniel Rodriguez — Portfolio

A lightweight, responsive portfolio for Nathaniel Rodriguez, a WordPress website designer and developer specializing in Figma-to-WordPress implementation, Elementor Pro, responsive development, site improvements, and technical SEO.

## Highlights

- Editorial dark visual system with a crimson-red accent
- Original CSS-built atmospheric hero artwork
- A compact five-project filmstrip with visible arrows, a subtle scroll nudge, live links, and scannable case studies
- Problem-led services and a four-step implementation walkthrough
- A personal introduction with a reserved portrait area
- Accessible case-note dialogs, mobile navigation, keyboard controls, and swipe navigation
- Scroll reveals and restrained pointer parallax with reduced-motion support
- Static architecture designed for fast GitHub Pages hosting

## Technology

- Semantic HTML5
- Modern CSS with responsive layouts and custom properties
- Vanilla JavaScript with no runtime dependencies
- GitHub Actions for automatic GitHub Pages deployment

## Run locally

No build step is required. Open `index.html` directly, or serve the folder with any static web server.

For example, if Python is available:

```bash
python -m http.server 4173
```

Then open `http://localhost:4173`.

## Deployment

Every push to `main` runs the workflow in `.github/workflows/pages.yml`. The workflow uploads the repository as a static Pages artifact and deploys it to GitHub Pages.

In the repository settings, set **Pages → Build and deployment → Source** to **GitHub Actions** if it is not selected automatically.

## Add Nathaniel's portrait

The portrait space is in the About section, away from the hero. Once a photo is available, add it to `assets/` and replace the `portrait-slot__mark` element in `index.html` with an image. Keep a descriptive `alt` attribute and leave the caption if desired. The email and Upwork links are already configured.

## Project sources

The project preview images are current screenshots of the live sites supplied for this portfolio. All client names, contribution descriptions, and URLs come from the project brief; no testimonials or performance claims were added.

# Nathaniel Rodriguez — Portfolio

A lightweight, responsive portfolio for Nathaniel Rodriguez, a WordPress website designer and developer specializing in Figma-to-WordPress implementation, Elementor Pro, responsive development, site improvements, and technical SEO.

## Highlights

- Editorial dark visual system with burnt-orange accents
- Original CSS-built atmospheric hero artwork
- Five authentic project previews with live website links
- Accessible case-note dialogs, mobile navigation, and keyboard focus states
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

## Content still to configure

The contact section deliberately leaves these details unfilled until the correct information is provided:

- Professional email address
- LinkedIn profile URL
- Upwork profile URL

The GitHub link points to Nathaniel's authenticated profile, `thanielll`.

## Project sources

The project preview images are current screenshots of the live sites supplied for this portfolio. All client names, contribution descriptions, and URLs come from the project brief; no testimonials or performance claims were added.

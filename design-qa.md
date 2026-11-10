# Design QA — Editorial Filmstrip

Result: **passed**

Reference: the user's selected Option 2 mock, `C:\Users\Joey\.codex\generated_images\01a1c686-4291-7ab1-80cd-54bbb8f98359\exec-3719aaa5-bf0d-41eb-8aa9-d8857bf5a38f.png`.

## Visual comparison

Reviewed the local site in Chrome at a 1900px desktop viewport, 900px and 768px tablet viewports, and a 390 × 844px phone viewport. The work section retains the mock's oversized serif heading, neighboring project peeks, featured screenshot, dark metadata rail, and progress markers. The reel is now capped at 1440px wide and 480px tall on desktop, bringing the project, visible arrow controls, and progress into one view. The accent is crimson red. At phone width, the screenshot, details, paired actions, and progress stack in reading order.

The first version of the filmstrip was too tall and pushed navigation out of view. The revision fixes the stage height, caps its overall width, moves arrow buttons beside the project count, and reduces the space after the reel. The screenshot remains aligned to its left edge to preserve the project's logo. The hero remains portrait-free; the portrait space is in About.

## Functional checks

- Clicking the visible Next arrow updated the image, title, contribution, services, live links, adjacent project names, and current progress state.
- Opening a case study showed the need, approach, and implementation for the active project; the close control worked.
- The process disclosure opened the selected step and closed the prior step.
- Scrolling down while the reel was visible set the horizontal nudge to `-10px`; the code sets the opposite direction on upward scroll and returns to rest after scrolling stops.
- At 390px, there was no horizontal overflow and the featured image loaded. At both 900px and 768px, the metadata panel fit within the fixed stage height; browser error logs were empty.
- Both email links use `freelancer.rnathaniel@gmail.com`; the Upwork links point to Nathaniel's public profile; no GitHub links appear in the page.
- Reduced-motion preferences are honored by the reel transition, scroll nudge, reveal effects, and parallax.

Project descriptions intentionally avoid unverified conversion or performance results.

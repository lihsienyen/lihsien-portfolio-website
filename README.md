# Portfolio Quest — portable website export

This is the complete source for the current portfolio prototype. It is a static website: HTML, CSS, JavaScript, and eight image files. It does not need a build step, package manager, or Sites account.

## Files

- `index.html` — page structure, text, and links
- `styles.css` — layout, colors, and animation
- `script.js` — navigation, points, unlocks, resume views, and Focus Sprint
- `assets/` — eight promotional images used by the project gallery
- `.nojekyll` — tells GitHub Pages to serve these static files without Jekyll processing

Keep these files together and preserve the `assets/` folder. The file named `index.html` should be at the root of the published folder.

## Preview locally

From this folder, run `python3 -m http.server 8000` and open `http://localhost:8000/` in a browser. A local server gives the closest preview to ordinary hosting.

## Host it

Upload the contents of this folder to any static website host. The host only needs to serve `index.html` and the adjacent CSS, JavaScript, and image files over HTTPS. Point your domain to that host using the host's domain instructions. You do not need to recreate the site in a page builder.

For GitHub Pages, place these files at the root of the `main` branch of `lihsienyen/lihsien-portfolio-website`. In repository Settings → Pages, choose **Deploy from a branch**, then **main** and **/(root)**. The initial project-site URL is `https://lihsienyen.github.io/lihsien-portfolio-website/`.

## Prototype limitations

- Points, unlocks, and Focus Sprint progress live in each visitor's browser using `localStorage`. They will not sync across devices or browsers. Clearing browser storage resets them.
- The $5 Coffee and $20 Bento Box cards are visual previews. They do not process payments or grant purchase points. A real payment system needs a server and verified payment webhook; see the separate `PAYMENT_PLAN.md` in the original project.
- Fonts load from Google Fonts. If offline use or avoiding third-party font requests matters, replace the font import at the top of `styles.css` with locally hosted font files.
- Promotional artwork belongs to the respective rights holders. Each project card links its art source. Review reuse permissions before publishing independently.

This export does not include the Sites hosting manifest or any Sites account configuration.

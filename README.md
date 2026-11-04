# Personal website

A responsive Ukrainian business card for Pavel Svistunoff, hosted on GitHub Pages.

## Development

No dependencies or build step. Run `python3 -m http.server 8000` in the repository and open http://localhost:8000.

- `index.html`: semantic content and GitHub links.
- `styles.css`: responsive layout, system fonts and light/dark palettes.
- `theme.js`: optional theme toggle; follows the system until a preference is saved. Disabled storage is supported.
- Legacy demo URLs remain available.

## Verification

Check desktop and narrow mobile layouts, keyboard navigation, both themes, disabled JavaScript and blocked local storage. JavaScript syntax can be checked with `node --check theme.js`.

## Review findings addressed

The previous home page loaded unused AngularJS/Angular Material and overlapping jQuery UI/Mobile dependencies for a demo dialog and draggable placeholder. The new page removes these dependencies and automatic dialog, adds UTF-8 and viewport metadata, a descriptive title, Ukrainian language metadata, landmarks, visible keyboard focus and a skip link. Personal contact details and professional claims are deliberately left for the owner to supply.

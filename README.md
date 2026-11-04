# ORBIT OS — Павло Свистунов

A dependency-free Ukrainian personal website styled as a science-fiction desktop.

## Run locally

Run `python3 -m http.server 8000` in this directory, then open http://localhost:8000. No install or build step.

## Check online

https://pavelsvistunoff.github.io/

## Interaction

- Drag a window's title bar on desktop to reposition it.
- Title bar buttons minimize, maximize/restore, and close each window. Double-click the title bar to maximize/restore.
- The launcher icons and taskbar reopen closed/minimized windows.
- Reset restores the default arrangement and opens all windows.
- The canvas aquarium has twelve swimming fish, bubbles, light shafts, and feeding by pointer or button.
- Pause stops animation. Reduced-motion preferences pause it by default. Hidden tabs and hidden aquarium windows stop animation work.
- Terminal commands: help, about, projects, fish, clear. Input is displayed as text, never executed.
- Narrow screens stack windows vertically and disable dragging to keep content reachable.
- GitHub links remain available without JavaScript.

The oxygen/depth readouts are decorative science-fiction scenery, not real measurements.

## Files

`index.html`: content and window controls. `styles.css`: desktop/mobile layout.
`theme.js`: window manager, terminal, clock and canvas aquarium (filename retained from the first draft).
Legacy demo URLs are retained.

## Validation

JavaScript syntax: `node --check theme.js`.
Browser checked on desktop: initial rendering, drag, minimize, reopen from taskbar, close, reopen from launcher, maximize. Review narrow-screen layout on a physical phone before merging.

# Copilot instructions for examen-n3 

## Purpose
A small static client-side flashcard app to study the French N3 diving exam. The app is a single-page site that loads `questions.md` at runtime and parses it into flip cards (front = question, back = answer).

## Big picture (what an agent should know) 
- Architecture: static HTML/CSS/JS. No build or bundler. Files served as-is from the web root:
  - `index.html` — UI shell and element IDs relied on by JS
  - `script.js` — core app logic (fetch + parse `questions.md`, UI events)
  - `style.css` — theming via CSS variables + `data-theme` attribute
  - `questions.md` — canonical content source (parsed at runtime)
- Runtime behavior: `script.js` fetches `questions.md`, splits by section (`## ` headings), extracts question/answer pairs with a specific regex, and builds `allCards`.
-- Playwright end-to-end tests have been added. Local preview is done with the included Node static server (use `npm run start` which calls `http-server`).

## Critical developer workflows 
- Preview quickly: run a static server: `npm run start` (uses `http-server` on port 5500).
- Editing content: update `questions.md` and preview to validate parsing and UI.
- always run VS Code formatter before committing changes
- always run `npm test` to validaet the changes

Notes:
- The test runner uses `npm run start` (http-server) on port 5500. The devcontainer/Dockerfile installs dependencies and Playwright browsers during build.
- Playwright will reuse an existing server when present. If port 5500 is in use, stop the other server or update `playwright.config.ts`.

## What to avoid / watchouts
- Don’t change `questions.md` formatting without updating the regex-based parser in `script.js`.
- Avoid relying on complex markdown features; the current `parseMD` is intentionally minimal (bold, italic, simple lists).

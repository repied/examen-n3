# Copilot instructions for examen-n3 🚀

## Purpose
A small static client-side flashcard app to study the French N3 diving exam. The app is a single-page site that loads `questions.md` at runtime and parses it into flip cards (front = question, back = answer).

## Big picture (what an agent should know) 🔧
- Architecture: static HTML/CSS/JS. No build or bundler. Files served as-is from the web root:
  - `index.html` — UI shell and element IDs relied on by JS
  - `script.js` — core app logic (fetch + parse `questions.md`, UI events)
  - `style.css` — theming via CSS variables + `data-theme` attribute
  - `questions.md` — canonical content source (parsed at runtime)
- Runtime behavior: `script.js` fetches `questions.md`, splits by section (`## ` headings), extracts question/answer pairs with a specific regex, and builds `allCards`.
- No tests or CI present. Local preview is done via Live Server (or any static server).

## Critical developer workflows ✅
- Devcontainer: follow README ("Reopen in Container"). The devcontainer includes Live Server integration.
- Preview quickly: right-click `index.html` → "Open with Live Server" (default URL: usually `http://127.0.0.1:5500`). Alternatively run a static server: `python -m http.server 5500` from project root.
- Editing content: update `questions.md` and preview to validate parsing and UI.
- always run VScode formatter before committing changes

## What to avoid / watchouts ❗
- Don’t change `questions.md` formatting without updating the regex-based parser in `script.js`.
- Avoid relying on complex markdown features; the current `parseMD` is intentionally minimal (bold, italic, simple lists).
- There are no tests/CI; any change that affects parsing or UX should be manually validated in the Live Server preview.

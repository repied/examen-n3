# Examen-N3

A simple HTML+JS+CSS flashcard game to study the French N3 diving exam.

## How to develop in Devcontainer (vscode)

1. Open this folder in VS Code and click **Reopen in Container** when prompted, or use the command palette: `Remote-Containers: Reopen in Container`.
2. The devcontainer image installs Node, runs `npm ci` on create, and installs Playwright browsers during build. After the container is ready you can start a local development server with Live Server or the included `http-server`.

The application will be available at a local URL, typically `http://127.0.0.1:5500`.

## Running tests

Playwright end-to-end tests are included. Quick commands:

```bash
npm install
npx playwright install
npm run start   # starts http-server on port 5500
npm test
```

## Code

This project has been almost 100% vibe-coded.

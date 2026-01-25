# Running Playwright tests

Quick steps to run the Playwright tests locally:

1. Install dependencies:

```bash
npm install
```

2. Install Playwright browsers (required once):

```bash
npx playwright install
```

3. Start the static server (in a separate terminal) or rely on Playwright's webServer:

```bash
npm run start
```

4. Run tests:

```bash
npm test
```

Notes:
- The test config now uses `npm run start` (`http-server`) to serve the repo root. The Docker/devcontainer build installs the server automatically.
- Playwright will reuse an existing server when present. If port 5500 is in use, stop the other server or update `playwright.config.ts`.

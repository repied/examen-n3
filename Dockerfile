FROM mcr.microsoft.com/playwright:latest

WORKDIR /workspaces/examen-n3

# Copy package files first to leverage Docker layer caching
COPY package.json package-lock.json* ./

# Install node dependencies
RUN npm ci --no-audit --no-fund || npm install

# Ensure Playwright browsers and deps are installed
RUN npx playwright install --with-deps || true

# Copy the rest of the workspace
COPY . .

# Keep container running for interactive dev sessions
CMD ["sleep", "infinity"]

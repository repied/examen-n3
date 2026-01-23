# Simple devcontainer for a static web application
FROM mcr.microsoft.com/devcontainers/base:ubuntu

# Install GitHub CLI (gh)
RUN apt-get update \
	&& apt-get install -y curl ca-certificates gnupg lsb-release \
	&& curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg \
	&& chmod 644 /usr/share/keyrings/githubcli-archive-keyring.gpg \
	&& echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" > /etc/apt/sources.list.d/github-cli.list \
	&& apt-get update \
	&& apt-get install -y gh \
	&& rm -rf /var/lib/apt/lists/*

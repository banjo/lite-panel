# Lite panel

A simple UI to control your self hosted VPS.

# Getting started

-   Create a new VPS
-   Run the following command on the server:

```bash
# If you run as "root" user
bash <(curl -fsSL https://raw.githubusercontent.com/banjo/lite-panel/refs/heads/main/scripts/init-server.sh)

# If you run as a different user
curl -fsSL -o init-server.sh https://raw.githubusercontent.com/banjo/lite-panel/refs/heads/main/scripts/init-server.sh
sudo bash init-server.sh
```

# Development

```bash
# Install dependencies
pnpm install

# allow scripts to run
chmod +x ./scripts/*

# Generate prisma client
pnpm db:generate

# Run the init script for local development
pnpm init:dev

# Start development server
pnpm dev
```

This is supposed to be run on a ubuntu server. The `init-dev-files.sh` file will mock the server environment on your local machine. Use the dev flag `NODE_ENV=development` to allow the server to run on your local machine.

To develop UI, use Vite port `5173` locally. Do not use the default port `3009` as it won't have hot module reloading.

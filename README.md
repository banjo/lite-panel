# Lite panel

A simple UI to control your self hosted VPS.

# Development

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# allow scripts to run
chmod +x ./scripts/*
```

To develop UI, use Vite port `5173` locally. Do not use the default port `3009` as it won't have hot module reloading.

## Things:

-   Need to run command to allow sudo without password: `echo "$USER ALL=(ALL) NOPASSWD:ALL" | sudo tee -a /etc/sudoers`
    -   Command for specific user: `echo "banjo ALL=(ALL:ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/banjo`

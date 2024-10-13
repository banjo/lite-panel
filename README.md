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

# Run the init script for local development
./scripts/init-dev-files.sh
```

This is supposed to be run on a ubuntu server. The `init-dev-files.sh` file will mock the server environment on your local machine. Use the dev flag `NODE_ENV=development` to allow the server to run on your local machine.

To develop UI, use Vite port `5173` locally. Do not use the default port `3009` as it won't have hot module reloading.

## Things:

-   Init script to install correct dependencies, clone the repo and start the server and environment.
    -   Maintenance
        -   `apt update -y && apt upgrade -y`
        -   `apt install sudo -y`
    -   Allow sudo without password
        -   Need to run command to allow sudo without password: `echo "$USER ALL=(ALL) NOPASSWD:ALL" | sudo tee -a /etc/sudoers`
        -   Command for specific user: `echo "banjo ALL=(ALL:ALL) NOPASSWD: ALL" | sudo tee /etc/sudoers.d/banjo`
    -   Install node, docker, docker-compose, git, pnpm, fail2ban, ufw, caddy, ufw-docker
    -   Setup ufw-docker
        -   `sudo wget -O /usr/local/bin/ufw-docker https://github.com/chaifeng/ufw-docker/raw/master/ufw-docker`
        -   `sudo chmod +x /usr/local/bin/ufw-docker`
    -   setup ufw
        -   `sudo ufw default deny incoming`
        -   `sudo ufw default allow outgoing`
        -   `sudo ufw allow 22/tcp`
        -   `sudo ufw allow 80/tcp`
        -   `sudo ufw allow 443/tcp`
        -   `sudo ufw enable`
    -   Restart ufw-docker
        -   `sudo ufw-docker install`
        -   `sudo systemctl restart ufw`
    -   Download the git repo
    -   Install dependencies
    -   Start the database
    -   Setup the caddy integration
        -   Add comment to caddyfile, all changes will be made below the header and above the footer of the comment, replacing the existing content.
    -   Start the server

```

```

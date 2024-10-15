#!/bin/bash
# The initailization script for the server. This script will create the necessary files for the server to run.

set -e # Exit immediately if a command exits with a non-zero status

if [ $EUID != 0 ]; then
  echo "Please run as root or use sudo."
  exit
fi

echo "Creating the necessary directories for the server to run..."
mkdir -p /data/lite-panel/{apps,server,logs}
chmod +x /data/lite-panel/*
echo "Directories created successfully."

echo "Installing the necessary packages for the server to run..."
apt-get update -y >/dev/null
apt-get install -y curl wget git fail2ban >/dev/null
echo "Packages installed successfully."

if ! [ -x "$(command -v docker)" ]; then
  echo "Installing Docker..."
  # Add Docker's official GPG key:
  apt-get update >/dev/null 2>&1
  apt-get install ca-certificates curl -y >/dev/null 2>&1
  install -m 0755 -d /etc/apt/keyrings >/dev/null 2>&1
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg -o /etc/apt/keyrings/docker.asc >/dev/null 2>&1
  chmod a+r /etc/apt/keyrings/docker.asc >/dev/null 2>&1

  # Add the repository to Apt sources:
  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.asc] https://download.docker.com/linux/ubuntu \
  $(. /etc/os-release && echo "$VERSION_CODENAME") stable" |
    tee /etc/apt/sources.list.d/docker.list >/dev/null 2>&1
  apt-get update >/dev/null 2>&1
  apt-get install docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin -y >/dev/null 2>&1

  if ! [ -x "$(command -v docker)" ]; then
    echo "Docker installation failed. Please install it manually."
    exit 1
  fi
  systemctl start docker >/dev/null 2>&1
  systemctl enable docker >/dev/null 2>&1
  echo "Docker installed successfully."
else
  echo "Docker is installed."
fi

if ! [ -x "$(command -v caddy)" ]; then
  echo "Installing Caddy..."
  apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl >/dev/null 2>&1
  curl -1slf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg >/dev/null 2>&1
  curl -1slf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null 2>&1
  apt-get update >/dev/null 2>&1
  apt-get install -y caddy >/dev/null 2>&1
  systemctl start caddy >/dev/null 2>&1
  systemctl enable caddy >/dev/null 2>&1
  touch /etc/caddy/Caddyfile
  echo "Caddy installed successfully."
else
  echo "Caddy is installed."
fi

if ! command -v ufw-docker &>/dev/null; then
  echo "Installing ufw-docker..."
  wget -O /usr/local/bin/ufw-docker https://github.com/chaifeng/ufw-docker/raw/master/ufw-docker >/dev/null 2>&1
  chmod +x /usr/local/bin/ufw-docker >/dev/null 2>&1
  echo "ufw-docker installed successfully."
fi

# Setting up ufw rules
echo "Configuring UFW firewall..."
ufw default deny incoming >/dev/null 2>&1
ufw default allow outgoing >/dev/null 2>&1
ufw allow 22/tcp >/dev/null 2>&1
ufw allow 80/tcp >/dev/null 2>&1
ufw allow 443/tcp >/dev/null 2>&1
ufw --force enable >/dev/null 2>&1
ufw-docker install >/dev/null 2>&1
systemctl restart ufw >/dev/null 2>&1

echo "Initialization completed successfully."

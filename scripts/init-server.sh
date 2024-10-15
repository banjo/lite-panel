#!/bin/bash
# The initailization script for the server. This script will create the necessary files for the server to run.

NODE_VERSION=20
GITHUB_URL=https://github.com/banjo/lite-panel.git
DIRECTORY=/data/lite-panel
PORT=3021

set -e # Exit immediately if a command exits with a non-zero status

if [ $EUID != 0 ]; then
  echo -e "${RED}Please run as root or use sudo.${NC}"
  exit
fi

echo -e "${YELLOW}Preparing directories...${NC}"
mkdir -p $DIRECTORY/{apps,logs,db}
chmod +x $DIRECTORY/*

echo -e "${YELLOW}Installing packages...${NC}"
apt-get update -y >/dev/null
apt-get install -y curl wget git fail2ban sqlite3 >/dev/null

# INSTALL DOCKER, CADDY, NODE, AND UFW-DOCKER
if ! [ -x "$(command -v docker)" ]; then
  echo -e "${YELLOW}Docker...${NC}"
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
    echo -e "${RED}Docker installation failed. Please install it manually.${NC}"
    exit 1
  fi
  systemctl start docker >/dev/null 2>&1
  systemctl enable docker >/dev/null 2>&1
fi

if ! [ -x "$(command -v caddy)" ]; then
  echo -e "${YELLOW}Caddy...${NC}"
  apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl >/dev/null 2>&1
  curl -1slf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg >/dev/null 2>&1
  curl -1slf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list >/dev/null 2>&1
  apt-get update >/dev/null 2>&1
  apt-get install -y caddy >/dev/null 2>&1
  systemctl start caddy >/dev/null 2>&1
  systemctl enable caddy >/dev/null 2>&1
  touch /etc/caddy/Caddyfile
fi

if ! [ -x "$(command -v node)" ]; then
  echo -e "${YELLOW}Node...${NC}"
  curl -fsSL https://deb.nodesource.com/setup_$NODE_VERSION.x | sudo -E bash - >/dev/null 2>&1
  apt-get install -y nodejs >/dev/null 2>&1
fi

if ! command -v ufw-docker &>/dev/null; then
  echo -e "${YELLOW}Installing ufw-docker...${NC}"
  wget -O /usr/local/bin/ufw-docker https://github.com/chaifeng/ufw-docker/raw/master/ufw-docker >/dev/null 2>&1
  chmod +x /usr/local/bin/ufw-docker >/dev/null 2>&1
  echo -e "${GREEN}ufw-docker installed successfully.${NC}"
fi

echo -e "${YELLOW}Configuring network settings...${NC}"
ufw default deny incoming >/dev/null 2>&1
ufw default allow outgoing >/dev/null 2>&1
ufw allow 22/tcp >/dev/null 2>&1
ufw allow 80/tcp >/dev/null 2>&1
ufw allow 443/tcp >/dev/null 2>&1
ufw --force enable >/dev/null 2>&1
ufw-docker install >/dev/null 2>&1
systemctl restart ufw >/dev/null 2>&1

# CLONE THE REPOSITORY
echo -e "${YELLOW}Preparing server...${NC}"
GIT_DIR=$DIRECTORY/repo

if [ ! -f "$GIT_DIR/package.json" ]; then
  git clone $GITHUB_URL $GIT_DIR >/dev/null 2>&1
fi

# BUILD THE SERVER
echo -e "${YELLOW}Building server...${NC}"
DATABASE_FILE=$DIRECTORY/db/prod.db
cd $GIT_DIR

npm install -g pnpm >/dev/null 2>&1
pnpm install >/dev/null 2>&1
chmod +x ./scripts/*
pnpm build >/dev/null 2>&1

DATABASE_URL="file:$DATABASE_FILE" pnpm run db:migrate:prod >/dev/null 2>&1

# SETUP THE SERVICE
SERVICE_NAME=litepanel
SERVICE_FILE=/etc/systemd/system/$SERVICE_NAME.service

if [ ! -f "$SERVICE_FILE" ]; then
  # Create systemd service file
  sudo bash -c "cat > $SERVICE_FILE" <<EOF
[Unit]
Description=LitePanel Server
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$GIT_DIR/build
ExecStart=/usr/bin/node index.js
Restart=always
Environment="NODE_ENV=production"
Environment="VITE_SERVER_URL=http://localhost:$PORT"
Environment="PORT=$PORT"
Environment="DATABASE_URL=file:$DATABASE_FILE"
RestartSec=10
StandardOutput=syslog
StandardError=syslog
SyslogIdentifier=$SERVICE_NAME

[Install]
WantedBy=multi-user.target
EOF

  # Reload systemctl to acknowledge new service
  sudo systemctl daemon-reload

  # Enable and start the service
  sudo systemctl enable $SERVICE_NAME.service
  sudo systemctl start $SERVICE_NAME.service
fi

echo -e "${GREEN}Initalization complete.${NC}"

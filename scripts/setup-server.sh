#!/bin/bash
set -e

# Config
SERVER="root@172.105.39.220"
APP_PATH="/var/www/happyyogi/app"
UPLOADS_PATH="/var/www/happyyogi/uploads"
NODE_VERSION="20"

echo "==> Setting up server: $SERVER"

ssh "$SERVER" bash <<'REMOTE_SCRIPT'
set -e

# Install nvm + Node.js
if [ ! -d "$HOME/.nvm" ]; then
  echo "Installing nvm..."
  curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

echo "Installing Node.js..."
nvm install 20
nvm use 20
nvm alias default 20

# Install PM2
echo "Installing PM2..."
npm install -g pm2

# Install Caddy
echo "Installing Caddy..."
apt-get update
apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg 2>/dev/null || true
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update
apt-get install -y caddy

# Create directory structure
echo "Creating directories..."
mkdir -p /var/www/happyyogi/app
mkdir -p /var/www/happyyogi/uploads
chown -R root:root /var/www/happyyogi

# Configure firewall
echo "Configuring firewall..."
ufw allow ssh
ufw allow http
ufw allow https
ufw --force enable

echo "Server setup complete!"
REMOTE_SCRIPT

echo "==> Copying Caddyfile..."
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
if [ -f "$LOCAL_DIR/Caddyfile" ]; then
  scp "$LOCAL_DIR/Caddyfile" "$SERVER:/etc/caddy/Caddyfile"
  ssh "$SERVER" "caddy reload --config /etc/caddy/Caddyfile"
  echo "Caddyfile deployed and reloaded"
else
  echo "WARNING: No Caddyfile found at $LOCAL_DIR/Caddyfile"
  echo "Create one and run: scp Caddyfile $SERVER:/etc/caddy/Caddyfile"
fi

echo "==> Setup complete!"
echo ""
echo "Next steps:"
echo "1. Create Caddyfile if not exists"
echo "2. Create ecosystem.config.cjs"
echo "3. Run deploy.sh"

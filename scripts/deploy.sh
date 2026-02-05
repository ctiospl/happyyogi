#!/bin/bash
set -e

# Config
SERVER="root@172.105.39.220"
APP_PATH="/var/www/happyyogi/app"
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

echo "==> Building SvelteKit app..."
cd "$LOCAL_DIR"
pnpm build

echo "==> Syncing to server..."
rsync -avz --delete \
  --exclude='.env' \
  --exclude='node_modules' \
  "$LOCAL_DIR/build/" \
  "$LOCAL_DIR/package.json" \
  "$LOCAL_DIR/ecosystem.config.cjs" \
  "$SERVER:$APP_PATH/"

echo "==> Installing dependencies on server..."
ssh "$SERVER" "cd $APP_PATH && npm install --production"

echo "==> Reloading PM2..."
ssh "$SERVER" "pm2 reload happyyogi"

echo "==> Verifying app is running..."
sleep 2
ssh "$SERVER" "pm2 show happyyogi | grep -E '(status|uptime|restarts)'"

echo "==> Deploy complete!"

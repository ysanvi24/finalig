#!/bin/bash
# ══════════════════════════════════════════════════════════════
#  VNIT IG App — AWS EC2 One-Click Setup Script
# ══════════════════════════════════════════════════════════════
#  Usage (on the EC2 instance):
#    curl -sSL https://raw.githubusercontent.com/Anshulkaocde123/finalig/main/deploy/setup-aws.sh | bash
#    OR
#    chmod +x deploy/setup-aws.sh && sudo ./deploy/setup-aws.sh
#
#  Prerequisites:
#    - Ubuntu 22.04+ EC2 instance
#    - SSH access with sudo
#    - Security Group: ports 22 (SSH), 80 (HTTP), 443 (HTTPS) open
# ══════════════════════════════════════════════════════════════

set -euo pipefail

# ── Colors for output ──
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

APP_DIR="/var/www/vnit-ig"
REPO_URL="https://github.com/Anshulkaocde123/finalig.git"
AWS_IP="13.204.112.229"

echo -e "${BLUE}══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  🏆 VNIT शाश्वतम् (Shashwatam) — AWS Setup     ${NC}"
echo -e "${BLUE}══════════════════════════════════════════════════${NC}"
echo ""

# ── Step 1: System Update ──
echo -e "${YELLOW}📦 Step 1/8: Updating system packages...${NC}"
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl git build-essential

# ── Step 2: Install Node.js 20 ──
echo -e "${YELLOW}📦 Step 2/8: Installing Node.js 20 LTS...${NC}"
if ! command -v node &> /dev/null || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 20 ]]; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi
echo -e "${GREEN}✅ Node.js $(node -v) installed${NC}"
echo -e "${GREEN}✅ npm $(npm -v) installed${NC}"

# ── Step 3: Install PM2 ──
echo -e "${YELLOW}📦 Step 3/8: Installing PM2 process manager...${NC}"
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
fi
echo -e "${GREEN}✅ PM2 installed${NC}"

# ── Step 4: Install Nginx ──
echo -e "${YELLOW}📦 Step 4/8: Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt-get install -y nginx
fi
sudo systemctl enable nginx
echo -e "${GREEN}✅ Nginx installed and enabled${NC}"

# ── Step 5: Clone/Update Repository ──
echo -e "${YELLOW}📦 Step 5/8: Setting up application code...${NC}"
if [ -d "$APP_DIR" ]; then
    echo "  → Pulling latest changes..."
    cd "$APP_DIR"
    git pull origin main
else
    echo "  → Cloning repository..."
    sudo mkdir -p "$APP_DIR"
    sudo chown -R "$USER:$USER" "$APP_DIR"
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
fi
echo -e "${GREEN}✅ Code synced to $APP_DIR${NC}"

# ── Step 6: Install Dependencies & Build ──
echo -e "${YELLOW}📦 Step 6/8: Installing dependencies & building frontend...${NC}"

# Server dependencies
echo "  → Installing server dependencies..."
cd "$APP_DIR/server"
npm ci --omit=dev

# Client dependencies + build
echo "  → Installing client dependencies..."
cd "$APP_DIR/client"
npm ci

# Create production .env for client
echo "  → Creating client production env..."
cat > "$APP_DIR/client/.env.production" << ENVEOF
VITE_API_URL=http://${AWS_IP}/api
VITE_SOCKET_URL=http://${AWS_IP}
VITE_GOOGLE_CLIENT_ID=311672185118-fnu83et05guc71ffdf39r4meknj3lolj.apps.googleusercontent.com
VITE_ENABLE_GOOGLE_LOGIN=true
ENVEOF

echo "  → Building client for production..."
npm run build
echo -e "${GREEN}✅ Dependencies installed and client built${NC}"

# ── Step 7: Configure Nginx ──
echo -e "${YELLOW}📦 Step 7/8: Configuring Nginx reverse proxy...${NC}"
sudo cp "$APP_DIR/deploy/nginx-aws.conf" /etc/nginx/sites-available/vnit-ig
sudo ln -sf /etc/nginx/sites-available/vnit-ig /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Test nginx config
if sudo nginx -t; then
    sudo systemctl reload nginx
    echo -e "${GREEN}✅ Nginx configured and running${NC}"
else
    echo -e "${RED}❌ Nginx config test failed! Check /etc/nginx/sites-available/vnit-ig${NC}"
    exit 1
fi

# ── Step 8: Setup Server .env & Start Backend ──
echo -e "${YELLOW}📦 Step 8/8: Starting backend with PM2...${NC}"

# Create server .env if it doesn't exist
if [ ! -f "$APP_DIR/server/.env" ]; then
    echo -e "${YELLOW}  ⚠️  No server/.env found. Creating from template...${NC}"
    cp "$APP_DIR/deploy/.env.production.template" "$APP_DIR/server/.env"
    echo -e "${RED}  🔑 IMPORTANT: Edit $APP_DIR/server/.env with your real secrets!${NC}"
    echo -e "${RED}     (MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_SECRET)${NC}"
fi

# Create PM2 log directory
sudo mkdir -p /var/log/pm2
sudo chown -R "$USER:$USER" /var/log/pm2

# Ensure uploads directory exists and has correct permissions
mkdir -p "$APP_DIR/server/uploads"

# Stop existing PM2 process if running
pm2 delete vnit-ig-backend 2>/dev/null || true

# Start with PM2
cd "$APP_DIR"
pm2 start deploy/ecosystem.config.js

# Save PM2 process list and set up startup script
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u "$USER" --hp "/home/$USER" 2>/dev/null || true

echo ""
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  🎉 VNIT IG App — Deployment Complete!          ${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════${NC}"
echo ""
echo -e "  🌐 Frontend:  ${BLUE}http://${AWS_IP}${NC}"
echo -e "  📡 API:       ${BLUE}http://${AWS_IP}/api/health${NC}"
echo -e "  🔌 WebSocket: ${BLUE}http://${AWS_IP}/socket.io/${NC}"
echo ""
echo -e "${YELLOW}📋 IMPORTANT — Complete these manual steps:${NC}"
echo ""
echo -e "  1. ${RED}Edit server/.env with your real secrets:${NC}"
echo -e "     nano $APP_DIR/server/.env"
echo -e "     → Set MONGODB_URI, JWT_SECRET, GOOGLE_CLIENT_SECRET"
echo ""
echo -e "  2. ${RED}Update Google Cloud Console (OAuth):${NC}"
echo -e "     → https://console.cloud.google.com/apis/credentials"
echo -e "     → Edit OAuth 2.0 Client ID"
echo -e "     → Add Authorized JavaScript Origin: http://${AWS_IP}"
echo -e "     → Add Authorized Redirect URI: http://${AWS_IP}/api/auth/register-oauth"
echo ""
echo -e "  3. ${YELLOW}Restart backend after editing .env:${NC}"
echo -e "     pm2 restart vnit-ig-backend"
echo ""
echo -e "  4. ${YELLOW}Seed the admin account:${NC}"
echo -e "     curl -X POST http://${AWS_IP}/api/auth/seed"
echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "  PM2 commands:"
echo -e "    pm2 logs vnit-ig-backend    # View logs"
echo -e "    pm2 monit                   # Monitor CPU/RAM"
echo -e "    pm2 restart vnit-ig-backend # Restart backend"
echo -e "    pm2 status                  # Check status"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

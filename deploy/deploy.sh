#!/bin/bash
# ══════════════════════════════════════════════════════════════
#  VNIT IG App — Quick Re-Deploy Script
# ══════════════════════════════════════════════════════════════
#  Usage: ./deploy/deploy.sh
#  Run this on the AWS EC2 instance after pushing new code.
# ══════════════════════════════════════════════════════════════

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'
APP_DIR="/var/www/vnit-ig"
AWS_IP="13.204.112.229"

echo -e "${BLUE}🔄 VNIT IG App — Re-deploying...${NC}"

cd "$APP_DIR"

# Pull latest code
echo -e "${YELLOW}📥 Pulling latest code...${NC}"
git pull origin main

# Update server dependencies
echo -e "${YELLOW}📦 Updating server dependencies...${NC}"
cd "$APP_DIR/server"
npm ci --omit=dev

# Update client dependencies + rebuild
echo -e "${YELLOW}📦 Updating client dependencies...${NC}"
cd "$APP_DIR/client"
npm ci

echo -e "${YELLOW}🏗️  Building client...${NC}"
npm run build

# Restart backend
echo -e "${YELLOW}🔄 Restarting backend...${NC}"
cd "$APP_DIR"
pm2 restart vnit-ig-backend

# Reload Nginx (in case config changed)
sudo nginx -t && sudo systemctl reload nginx

echo ""
echo -e "${GREEN}✅ Deployment complete!${NC}"
echo -e "  🌐 ${BLUE}http://${AWS_IP}${NC}"
echo -e "  📡 ${BLUE}http://${AWS_IP}/api/health${NC}"
echo ""
pm2 status

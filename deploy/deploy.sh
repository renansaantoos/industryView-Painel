#!/bin/bash
# =============================================================================
# INDUSTRYVIEW - Deploy Script
# Builds frontend, starts backend services via Docker Compose
# Usage: sudo bash deploy.sh
# =============================================================================
set -e

APP_DIR="/opt/industryview"
DEPLOY_DIR="$APP_DIR/deploy"
FRONTEND_DIR="$APP_DIR/industryview-react"
WEB_DIR="/var/www/industryview"

echo "============================================"
echo "  IndustryView - Deploy"
echo "============================================"

# ---------------------------------------------------------------------------
# 1. Pull latest code
# ---------------------------------------------------------------------------
echo "[1/5] Pulling latest code..."
cd "$APP_DIR"
git fetch origin main
git reset --hard origin/main

# ---------------------------------------------------------------------------
# 2. Build Frontend
# ---------------------------------------------------------------------------
echo "[2/5] Building frontend..."

# Get the VM's external IP for API URL
EXTERNAL_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google" 2>/dev/null || echo "localhost")

cd "$FRONTEND_DIR"
npm ci

# Set API URL to use the same origin (Nginx will proxy /api)
echo "VITE_API_BASE_URL=http://${EXTERNAL_IP}/api/v1" > .env.production
echo "Frontend will use API URL: http://${EXTERNAL_IP}/api/v1"

npm run build

# Deploy static files
mkdir -p "$WEB_DIR"
rm -rf "${WEB_DIR:?}"/*
cp -r "$FRONTEND_DIR/dist/"* "$WEB_DIR/"
chown -R www-data:www-data "$WEB_DIR"
echo "Frontend deployed to $WEB_DIR"

# ---------------------------------------------------------------------------
# 3. Update CORS in .env.prod
# ---------------------------------------------------------------------------
echo "[3/5] Updating CORS configuration..."
cd "$DEPLOY_DIR"
sed -i "s|^CORS_ORIGIN=.*|CORS_ORIGIN=http://${EXTERNAL_IP}|" .env.prod

# ---------------------------------------------------------------------------
# 4. Start Backend Services
# ---------------------------------------------------------------------------
echo "[4/5] Starting backend services..."
cd "$DEPLOY_DIR"

# Source env vars for docker compose
set -a
source .env.prod
set +a

docker compose -f docker-compose.prod.yml down --remove-orphans 2>/dev/null || true
docker compose -f docker-compose.prod.yml up -d --build

echo "Waiting for services to be healthy..."
sleep 15

# ---------------------------------------------------------------------------
# 5. Verify
# ---------------------------------------------------------------------------
echo "[5/5] Verifying deployment..."

# Check Docker containers
echo ""
echo "Container status:"
docker compose -f docker-compose.prod.yml ps

# Check health endpoint
echo ""
echo "Health check:"
curl -s http://localhost:3000/health || echo "Backend not responding yet (may need more time)"

# Check Nginx
echo ""
echo "Nginx status:"
systemctl is-active nginx

echo ""
echo "============================================"
echo "  Deploy complete!"
echo ""
echo "  Frontend: http://${EXTERNAL_IP}"
echo "  API:      http://${EXTERNAL_IP}/api/v1"
echo "  Health:   http://${EXTERNAL_IP}/health"
echo "============================================"

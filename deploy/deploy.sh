#!/bin/bash
# =============================================================================
# INDUSTRYVIEW - Deploy Script
# Builds frontend, runs migrations, starts backend services via Docker Compose
# Usage: sudo bash deploy.sh
# =============================================================================
set -euo pipefail

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
echo "[1/6] Pulling latest code..."
cd "$APP_DIR"
git fetch origin main
git reset --hard origin/main

# ---------------------------------------------------------------------------
# 2. Build Frontend
# ---------------------------------------------------------------------------
echo "[2/6] Building frontend..."

# Get the VM's external IP (used for CORS and display only)
EXTERNAL_IP=$(curl -s http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H "Metadata-Flavor: Google" 2>/dev/null || echo "localhost")
DOMAIN="industryview.doublex.ai"

cd "$FRONTEND_DIR"
npm ci

# Use relative API URL so it works with both domain and IP, HTTP and HTTPS
echo "VITE_API_BASE_URL=/api/v1" > .env.production
echo "Frontend will use relative API URL: /api/v1"

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
echo "[3/6] Updating CORS configuration..."
cd "$DEPLOY_DIR"
sed -i "s|^CORS_ORIGIN=.*|CORS_ORIGIN=https://${DOMAIN},http://${EXTERNAL_IP}|" .env.prod

# ---------------------------------------------------------------------------
# 4. Start Backend Services
# ---------------------------------------------------------------------------
echo "[4/6] Starting backend services..."
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
# 5. Run Prisma Migrations
# ---------------------------------------------------------------------------
echo "[5/6] Running database migrations..."
docker exec industryview-app npx prisma migrate deploy
echo "Migrations applied successfully"

# ---------------------------------------------------------------------------
# 6. Verify
# ---------------------------------------------------------------------------
echo "[6/6] Verifying deployment..."

# Check Docker containers
echo ""
echo "Container status:"
docker compose -f docker-compose.prod.yml ps

# Check health endpoint
echo ""
echo "Health check:"
HEALTH=$(curl -sf http://localhost:3000/health || true)
if echo "$HEALTH" | grep -q '"status":"healthy"'; then
  echo "$HEALTH"
  echo "Health check PASSED"
else
  echo "Health check FAILED: $HEALTH"
  exit 1
fi

# Check Nginx
echo ""
echo "Nginx status:"
systemctl is-active nginx

echo ""
echo "============================================"
echo "  Deploy complete!"
echo ""
echo "  Frontend: https://${DOMAIN}"
echo "  Also:     http://${EXTERNAL_IP}"
echo "  API:      https://${DOMAIN}/api/v1"
echo "  Health:   https://${DOMAIN}/health"
echo "============================================"

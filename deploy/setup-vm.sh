#!/bin/bash
# =============================================================================
# INDUSTRYVIEW - VM Setup Script
# Run this on a fresh Ubuntu 22.04 VM
# Usage: sudo bash setup-vm.sh
# =============================================================================
set -e

echo "============================================"
echo "  IndustryView - VM Setup"
echo "============================================"

# ---------------------------------------------------------------------------
# 1. Update system
# ---------------------------------------------------------------------------
echo "[1/7] Updating system packages..."
apt-get update -y
apt-get upgrade -y

# ---------------------------------------------------------------------------
# 2. Install Docker
# ---------------------------------------------------------------------------
echo "[2/7] Installing Docker..."
if ! command -v docker &> /dev/null; then
    apt-get install -y ca-certificates curl gnupg lsb-release
    install -m 0755 -d /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    chmod a+r /etc/apt/keyrings/docker.gpg
    echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
    apt-get update -y
    apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    systemctl enable docker
    systemctl start docker
    echo "Docker installed successfully."
else
    echo "Docker already installed."
fi

# ---------------------------------------------------------------------------
# 3. Install Node.js 20 (for frontend build)
# ---------------------------------------------------------------------------
echo "[3/7] Installing Node.js 20..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    echo "Node.js $(node -v) installed."
else
    echo "Node.js already installed: $(node -v)"
fi

# ---------------------------------------------------------------------------
# 4. Install Nginx
# ---------------------------------------------------------------------------
echo "[4/7] Installing Nginx..."
if ! command -v nginx &> /dev/null; then
    apt-get install -y nginx
    systemctl enable nginx
    echo "Nginx installed."
else
    echo "Nginx already installed."
fi

# ---------------------------------------------------------------------------
# 5. Install Git
# ---------------------------------------------------------------------------
echo "[5/7] Installing Git..."
apt-get install -y git

# ---------------------------------------------------------------------------
# 6. Clone repository
# ---------------------------------------------------------------------------
echo "[6/7] Cloning repository..."
APP_DIR="/opt/industryview"
if [ ! -d "$APP_DIR" ]; then
    git clone https://github.com/renansaantoos/industryView-Painel.git "$APP_DIR"
    echo "Repository cloned to $APP_DIR"
else
    echo "Repository already exists at $APP_DIR, pulling latest..."
    cd "$APP_DIR" && git pull origin main || git pull origin master
fi

# ---------------------------------------------------------------------------
# 7. Setup deploy directory
# ---------------------------------------------------------------------------
echo "[7/7] Setting up deployment..."

DEPLOY_DIR="$APP_DIR/deploy"
cd "$DEPLOY_DIR"

# Generate secure secrets if .env.prod has placeholder values
if grep -q "CHANGE_ME" .env.prod; then
    echo "Generating secure secrets..."
    JWT_SECRET=$(openssl rand -hex 32)
    JWT_REFRESH_SECRET=$(openssl rand -hex 32)
    DB_PASSWORD=$(openssl rand -hex 16)

    sed -i "s/CHANGE_ME_STRONG_PASSWORD_HERE/$DB_PASSWORD/g" .env.prod
    sed -i "s/CHANGE_ME_GENERATE_A_STRONG_SECRET/$JWT_SECRET/g" .env.prod
    sed -i "s/CHANGE_ME_GENERATE_ANOTHER_STRONG_SECRET/$JWT_REFRESH_SECRET/g" .env.prod

    echo "Secrets generated and saved to .env.prod"
    echo ""
    echo "IMPORTANT: Save these values securely!"
    echo "DB_PASSWORD=$DB_PASSWORD"
    echo "JWT_SECRET=$JWT_SECRET"
    echo "JWT_REFRESH_SECRET=$JWT_REFRESH_SECRET"
fi

# Configure Nginx
echo "Configuring Nginx..."
cp "$DEPLOY_DIR/nginx.conf" /etc/nginx/sites-available/industryview
ln -sf /etc/nginx/sites-available/industryview /etc/nginx/sites-enabled/industryview
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo ""
echo "============================================"
echo "  Setup complete!"
echo "  Run 'sudo bash /opt/industryview/deploy/deploy.sh' to deploy"
echo "============================================"

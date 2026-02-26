#!/bin/bash
# =============================================================================
# Setup deploy user for GitHub Actions CD
# Run this on the VM as root: sudo bash setup-deploy-user.sh
# =============================================================================
set -e

DEPLOY_USER="deploy"

echo "=== Setting up deploy user for GitHub Actions ==="

# 1. Create user
if id "$DEPLOY_USER" &>/dev/null; then
    echo "User '$DEPLOY_USER' already exists, skipping creation."
else
    useradd -m -s /bin/bash "$DEPLOY_USER"
    echo "User '$DEPLOY_USER' created."
fi

# 2. Setup SSH directory
SSH_DIR="/home/$DEPLOY_USER/.ssh"
mkdir -p "$SSH_DIR"
chmod 700 "$SSH_DIR"

# 3. Generate Ed25519 key pair (if not already present)
KEY_FILE="$SSH_DIR/github_actions"
if [ ! -f "$KEY_FILE" ]; then
    ssh-keygen -t ed25519 -C "github-actions-deploy" -f "$KEY_FILE" -N ""
    cat "$KEY_FILE.pub" >> "$SSH_DIR/authorized_keys"
    chmod 600 "$SSH_DIR/authorized_keys"
    echo ""
    echo "============================================"
    echo "  SSH key generated!"
    echo "  Copy the PRIVATE key below to GitHub Secret: VM_SSH_PRIVATE_KEY"
    echo "============================================"
    echo ""
    cat "$KEY_FILE"
    echo ""
    echo "============================================"
else
    echo "SSH key already exists at $KEY_FILE"
fi

chown -R "$DEPLOY_USER:$DEPLOY_USER" "$SSH_DIR"

# 4. Configure sudoers (restricted to deploy.sh only)
SUDOERS_FILE="/etc/sudoers.d/deploy-github-actions"
echo "$DEPLOY_USER ALL=(root) NOPASSWD: /bin/bash /opt/industryview/deploy/deploy.sh" > "$SUDOERS_FILE"
chmod 440 "$SUDOERS_FILE"
visudo -cf "$SUDOERS_FILE"
echo "Sudoers configured: $DEPLOY_USER can only run deploy.sh as root."

echo ""
echo "=== Setup complete ==="
echo ""
echo "Next steps:"
echo "  1. Copy the private key above to GitHub Secret: VM_SSH_PRIVATE_KEY"
echo "  2. Add GitHub Secret: VM_HOST = $(curl -sf http://metadata.google.internal/computeMetadata/v1/instance/network-interfaces/0/access-configs/0/external-ip -H 'Metadata-Flavor: Google' 2>/dev/null || echo '<VM_IP>')"
echo "  3. Add GitHub Secret: VM_USER = $DEPLOY_USER"

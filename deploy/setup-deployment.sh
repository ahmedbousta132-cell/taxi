#!/bin/bash
# Setup script for taxi website deployment with systemd and nginx
# Run this script with sudo: sudo bash deploy/setup-deployment.sh

set -e

echo "========================================"
echo "Taxi Website Deployment Setup"
echo "========================================"

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo "This script must be run as root (use sudo)"
   exit 1
fi

# Update system packages
echo "\n[1/8] Updating system packages..."
apt-get update
apt-get upgrade -y

# Install required packages
echo "\n[2/8] Installing required packages..."
apt-get install -y curl git nginx certbot python3-certbot-nginx nodejs npm

# Create web directories
echo "\n[3/8] Creating web directories..."
mkdir -p /var/www/citytaxis
mkdir -p /var/www/taxidrive
chown -R www-data:www-data /var/www/citytaxis
chown -R www-data:www-data /var/www/taxidrive
chmod -R 755 /var/www/citytaxis
chmod -R 755 /var/www/taxidrive

# Copy website files (adjust paths as needed)
echo "\n[4/8] Copying website files..."
if [ -d "deploy/citytaxis" ]; then
    cp -r deploy/citytaxis/* /var/www/citytaxis/
fi
if [ -d "deploy/taxidrive" ]; then
    cp -r deploy/taxidrive/* /var/www/taxidrive/
fi

# Create log directory
echo "\n[5/8] Setting up logging..."
mkdir -p /var/log/taxi-services
chown -R www-data:www-data /var/log/taxi-services

# Install systemd services
echo "\n[6/8] Installing systemd services..."
cp deploy/systemd/citytaxis.service /etc/systemd/system/
cp deploy/systemd/taxidrive.service /etc/systemd/system/
chmod 644 /etc/systemd/system/citytaxis.service
chmod 644 /etc/systemd/system/taxidrive.service
systemctl daemon-reload

# Install nginx configurations
echo "\n[7/8] Installing nginx configurations..."
cp deploy/nginx/taxiscity.ch.conf /etc/nginx/sites-available/
cp deploy/nginx/taxidrive.ch.conf /etc/nginx/sites-available/
ln -sf /etc/nginx/sites-available/taxiscity.ch.conf /etc/nginx/sites-enabled/
ln -sf /etc/nginx/sites-available/taxidrive.ch.conf /etc/nginx/sites-enabled/

# Test and reload nginx
echo "\n[8/8] Testing and reloading nginx..."
nginx -t
systemctl restart nginx

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "Next steps:"
echo ""
echo "1. Setup SSL certificates with Let's Encrypt:"
echo "   sudo certbot certonly --webroot -w /var/www/letsencrypt -d taxiscity.ch -d www.taxiscity.ch"
echo "   sudo certbot certonly --webroot -w /var/www/letsencrypt -d taxidrive.ch -d www.taxidrive.ch"
echo ""
echo "2. Start the services:"
echo "   sudo systemctl start citytaxis.service"
echo "   sudo systemctl start taxidrive.service"
echo ""
echo "3. Enable services to start on boot:"
echo "   sudo systemctl enable citytaxis.service"
echo "   sudo systemctl enable taxidrive.service"
echo ""
echo "4. Check service status:"
echo "   sudo systemctl status citytaxis.service"
echo "   sudo systemctl status taxidrive.service"
echo ""
echo "5. View logs:"
echo "   sudo tail -f /var/log/citytaxis.log"
echo "   sudo tail -f /var/log/taxidrive.log"
echo ""
echo "6. Test the websites:"
echo "   https://taxiscity.ch"
echo "   https://taxidrive.ch"
echo ""

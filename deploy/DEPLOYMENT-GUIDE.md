# Deployment Guide: City Taxis & Taxi Drive

This guide covers the complete setup for running both websites with systemd services and nginx reverse proxy with HTTPS.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                   Internet (HTTPS)                    │
└────────────────┬────────────────┬────────────────────┘
                 │                │
         ┌───────▼────────┐  ┌────▼────────────────┐
         │ taxiscity.ch   │  │  taxidrive.ch       │
         │ (port 443)     │  │  (port 443)         │
         └────────┬───────┘  └──────┬───────────────┘
                  │                 │
        ┌─────────▼────────────────────▼──────────┐
        │   Nginx Reverse Proxy (ports 80/443)   │
        │  - SSL/TLS termination                 │
        │  - Gzip compression                     │
        │  - Security headers                     │
        │  - Static file caching                  │
        └─────────┬────────────────────┬──────────┘
                  │                    │
        ┌─────────▼──────┐    ┌────────▼─────���───┐
        │ Port 3001      │    │ Port 3002        │
        │ (localhost)    │    │ (localhost)      │
        └────────┬───────┘    └────────┬─────────┘
                 │                     │
        ┌────────▼───────────────────────▼────────┐
        │   Systemd Services (www-data)          │
        │                                         │
        │ ┌──────────────────────────────────┐  │
        │ │ citytaxis.service                │  │
        │ │ ExecStart: npx serve ... 3001    │  │
        │ └──────────────────────────────────┘  │
        │                                        │
        │ ┌──────────────────────────────────┐  │
        │ │ taxidrive.service                │  │
        │ │ ExecStart: npx serve ... 3002    │  │
        │ └──────────────────────────────────┘  │
        └───────────────────────────────────────┘
```

## System Requirements

- **OS**: Ubuntu 20.04 LTS or later (or Debian 10+)
- **RAM**: Minimum 2GB (4GB recommended)
- **CPU**: 2 cores minimum
- **Disk**: 20GB free space
- **Ports**: 80, 443 (publicly accessible)
- **Domains**: 
  - `taxiscity.ch` pointing to your server
  - `taxidrive.ch` pointing to your server

## Pre-Installation Checklist

- [ ] Root/sudo access on the server
- [ ] Domain DNS records configured (A records pointing to server IP)
- [ ] Firewall configured to allow ports 80 and 443
- [ ] Server has internet access

## Installation Steps

### Step 1: Clone the Repository

```bash
git clone https://github.com/ahmedbousta132-cell/taxi.git /opt/taxi
cd /opt/taxi
```

### Step 2: Run the Setup Script

```bash
sudo bash deploy/setup-deployment.sh
```

This script will:
- Update system packages
- Install Node.js, npm, nginx, and certbot
- Create web directories
- Copy website files
- Install systemd services
- Configure nginx

### Step 3: Setup SSL Certificates

Create the letsencrypt webroot directory:

```bash
sudo mkdir -p /var/www/letsencrypt
sudo chown -R www-data:www-data /var/www/letsencrypt
```

Generate certificates for both domains:

```bash
sudo certbot certonly --webroot -w /var/www/letsencrypt \
  -d taxiscity.ch -d www.taxiscity.ch

sudo certbot certonly --webroot -w /var/www/letsencrypt \
  -d taxidrive.ch -d www.taxidrive.ch
```

### Step 4: Start Services

```bash
# Start both services
sudo systemctl start citytaxis.service
sudo systemctl start taxidrive.service

# Enable them to start on boot
sudo systemctl enable citytaxis.service
sudo systemctl enable taxidrive.service

# Verify they're running
sudo systemctl status citytaxis.service
sudo systemctl status taxidrive.service
```

### Step 5: Verify Installation

Check service logs:

```bash
# City Taxis logs
sudo tail -f /var/log/citytaxis.log

# Taxi Drive logs
sudo tail -f /var/log/taxidrive.log

# Nginx logs
sudo tail -f /var/log/nginx/taxiscity_access.log
sudo tail -f /var/log/nginx/taxidrive_access.log
```

Test the websites:

```bash
# In your browser or via curl
curl https://taxiscity.ch
curl https://taxidrive.ch
```

## Service Management

### View Service Status

```bash
sudo systemctl status citytaxis.service
sudo systemctl status taxidrive.service
```

### Start/Stop Services

```bash
# Start
sudo systemctl start citytaxis.service
sudo systemctl start taxidrive.service

# Stop
sudo systemctl stop citytaxis.service
sudo systemctl stop taxidrive.service

# Restart
sudo systemctl restart citytaxis.service
sudo systemctl restart taxidrive.service

# Reload (graceful restart)
sudo systemctl reload citytaxis.service
sudo systemctl reload taxidrive.service
```

### View Real-Time Logs

```bash
# City Taxis service logs
sudo journalctl -u citytaxis.service -f

# Taxi Drive service logs
sudo journalctl -u taxidrive.service -f

# Both services
sudo journalctl -u citytaxis.service -u taxidrive.service -f
```

### View Application Output

```bash
# City Taxis
sudo tail -f /var/log/citytaxis.log
sudo tail -f /var/log/citytaxis-error.log

# Taxi Drive
sudo tail -f /var/log/taxidrive.log
sudo tail -f /var/log/taxidrive-error.log
```

## Nginx Management

### Test Configuration

```bash
sudo nginx -t
```

### Reload Nginx

```bash
# Graceful reload (no downtime)
sudo systemctl reload nginx

# Full restart
sudo systemctl restart nginx
```

### View Nginx Logs

```bash
# City Taxis access logs
sudo tail -f /var/log/nginx/taxiscity_access.log

# City Taxis errors
sudo tail -f /var/log/nginx/taxiscity_error.log

# Taxi Drive access logs
sudo tail -f /var/log/nginx/taxidrive_access.log

# Taxi Drive errors
sudo tail -f /var/log/nginx/taxidrive_error.log
```

## SSL Certificate Renewal

### Automatic Renewal

Certbot automatically sets up a systemd timer for renewal:

```bash
# Check renewal status
sudo systemctl list-timers *certbot*

# View renewal log
sudo tail -f /var/log/letsencrypt/renewal.log
```

### Manual Renewal

```bash
# Dry run (test)
sudo certbot renew --dry-run

# Actual renewal
sudo certbot renew
```

## Monitoring & Maintenance

### System Health Check

```bash
#!/bin/bash
echo "System Health Check"
echo "=================="
echo ""
echo "Disk Space:"
df -h | grep -E '^/dev|Filesystem'
echo ""
echo "Memory Usage:"
free -h
echo ""
echo "Service Status:"
sudo systemctl status citytaxis.service taxidrive.service nginx --no-pager
echo ""
echo "Port Listening:"
sudo ss -tlnp | grep -E '3001|3002|:80|:443'
echo ""
echo "Process Count:"
ps aux | grep 'npx serve' | grep -v grep
```

### Check SSL Certificate Expiration

```bash
# Check all certificates
sudo certbot certificates

# More detailed info
sudo openssl x509 -noout -dates -in /etc/letsencrypt/live/taxiscity.ch/cert.pem
sudo openssl x509 -noout -dates -in /etc/letsencrypt/live/taxidrive.ch/cert.pem
```

## Updating Website Content

### Update City Taxis

```bash
# Copy new files
cp -r /path/to/new/citytaxis/* /var/www/citytaxis/
chown -R www-data:www-data /var/www/citytaxis

# Service will automatically serve new content
# No restart needed for static files
```

### Update Taxi Drive

```bash
# Copy new files
cp -r /path/to/new/taxidrive/* /var/www/taxidrive/
chown -R www-data:www-data /var/www/taxidrive

# Service will automatically serve new content
# No restart needed for static files
```

## Troubleshooting

### Services Won't Start

```bash
# Check service status and errors
sudo systemctl status citytaxis.service -l

# View detailed logs
sudo journalctl -u citytaxis.service -n 50

# Check if port is already in use
sudo ss -tlnp | grep 3001

# Check permissions
ls -la /var/www/citytaxis/
ls -la /var/log/citytaxis.log
```

### Nginx Errors

```bash
# Test configuration
sudo nginx -t

# View error logs
sudo tail -f /var/log/nginx/error.log

# Check if ports are available
sudo ss -tlnp | grep -E ':80|:443'
```

### SSL Certificate Issues

```bash
# Check certificate status
sudo certbot certificates

# Test Let's Encrypt connectivity
sudo certbot renew --dry-run

# View certbot logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### Website Not Accessible

```bash
# Check if services are running
sudo systemctl status citytaxis.service taxidrive.service

# Test localhost connectivity
curl http://localhost:3001
curl http://localhost:3002

# Check firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Test nginx upstream
curl -v http://127.0.0.1/
```

## Performance Tuning

### Increase Node.js Memory

Edit `/etc/systemd/system/citytaxis.service`:

```ini
Environment="NODE_OPTIONS=--max-old-space-size=2048"
```

Then reload:

```bash
sudo systemctl daemon-reload
sudo systemctl restart citytaxis.service
```

### Optimize Nginx

Edit `/etc/nginx/nginx.conf`:

```nginx
worker_processes auto;      # Use all CPU cores
worker_connections 2048;    # Increase connection limit
keepalive_timeout 65;       # Connection keepalive
```

Reload nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Security Hardening

### Firewall Setup (UFW)

```bash
# Enable firewall
sudo ufw enable

# Allow SSH
sudo ufw allow 22/tcp

# Allow HTTP/HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Deny everything else
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Check status
sudo ufw status
```

### Fail2Ban Setup

```bash
# Install
sudo apt-get install -y fail2ban

# Create local config
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# Edit and enable nginx-http-auth
sudo systemctl start fail2ban
sudo systemctl enable fail2ban
```

### File Permissions

```bash
# Ensure correct ownership
sudo chown -R www-data:www-data /var/www/citytaxis
sudo chown -R www-data:www-data /var/www/taxidrive

# Set secure permissions
sudo chmod 755 /var/www/citytaxis
sudo chmod 755 /var/www/taxidrive
sudo chmod 644 /var/www/citytaxis/*
sudo chmod 644 /var/www/taxidrive/*
```

## Backup & Recovery

### Backup Website Files

```bash
# Create backup
sudo tar -czf /backup/citytaxis-$(date +%Y%m%d).tar.gz /var/www/citytaxis/
sudo tar -czf /backup/taxidrive-$(date +%Y%m%d).tar.gz /var/www/taxidrive/

# Or use rsync
sudo rsync -av /var/www/citytaxis/ /backup/citytaxis/
sudo rsync -av /var/www/taxidrive/ /backup/taxidrive/
```

### Backup Configuration

```bash
# Backup nginx configs
sudo tar -czf /backup/nginx-$(date +%Y%m%d).tar.gz /etc/nginx/sites-available/

# Backup systemd services
sudo tar -czf /backup/systemd-$(date +%Y%m%d).tar.gz /etc/systemd/system/citytaxis.service /etc/systemd/system/taxidrive.service

# Backup SSL certificates
sudo tar -czf /backup/ssl-$(date +%Y%m%d).tar.gz /etc/letsencrypt/
```

### Restore from Backup

```bash
# Restore website files
sudo tar -xzf /backup/citytaxis-20240101.tar.gz -C /
sudo tar -xzf /backup/taxidrive-20240101.tar.gz -C /

# Restore and reload services
sudo systemctl restart citytaxis.service taxidrive.service
```

## Uninstallation

```bash
# Stop services
sudo systemctl stop citytaxis.service taxidrive.service
sudo systemctl disable citytaxis.service taxidrive.service

# Remove systemd services
sudo rm /etc/systemd/system/citytaxis.service
sudo rm /etc/systemd/system/taxidrive.service
sudo systemctl daemon-reload

# Remove nginx configs
sudo rm /etc/nginx/sites-enabled/taxiscity.ch.conf
sudo rm /etc/nginx/sites-enabled/taxidrive.ch.conf
sudo rm /etc/nginx/sites-available/taxiscity.ch.conf
sudo rm /etc/nginx/sites-available/taxidrive.ch.conf
sudo systemctl reload nginx

# Remove website files (optional)
sudo rm -rf /var/www/citytaxis
sudo rm -rf /var/www/taxidrive

# Revoke SSL certificates (optional)
sudo certbot revoke --cert-path /etc/letsencrypt/live/taxiscity.ch/cert.pem
sudo certbot revoke --cert-path /etc/letsencrypt/live/taxidrive.ch/cert.pem
```

## Support & Resources

- **Repository**: https://github.com/ahmedbousta132-cell/taxi
- **Nginx Documentation**: https://nginx.org/en/docs/
- **Let's Encrypt**: https://letsencrypt.org/
- **Systemd Documentation**: https://www.freedesktop.org/software/systemd/man/systemd.service.html
- **Node.js Serve Package**: https://www.npmjs.com/package/serve

## Quick Reference

```bash
# Start both services
sudo systemctl start citytaxis.service taxidrive.service

# Stop both services
sudo systemctl stop citytaxis.service taxidrive.service

# View all service logs
sudo journalctl -u citytaxis.service -u taxidrive.service -f

# Test websites
curl -I https://taxiscity.ch
curl -I https://taxidrive.ch

# Check certificate expiration
sudo certbot certificates

# Nginx reload
sudo systemctl reload nginx

# System health
df -h && free -h && sudo ss -tlnp
```

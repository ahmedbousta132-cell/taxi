#!/bin/bash
# ============================================================
# Déploiement des 2 sites taxi sur une VM OVH (Apache)
#   - City Taxis  -> citytaxis.ch    -> /var/www/citytaxis
#   - Taxi Drive  -> taxi-drive.ch   -> /var/www/taxidrive
#
# Sites 100 % statiques servis DIRECTEMENT par Apache.
# Apache (et non nginx) car les 2 sites reposent sur un .htaccess
# qui gère les URLs propres (/taxi-nyon/taxi-<ville>) et les
# redirections 301 des anciennes URLs Webador. nginx ne lit pas
# les .htaccess : ces règles seraient perdues (SEO cassé).
#
# Ce script installe TOUT EN HTTP. Le HTTPS s'ajoute ensuite avec
# certbot (voir la fin du script) : c'est certbot qui écrit la
# config SSL, une fois le DNS en place et le certificat obtenu.
#
# Usage :  sudo bash deploy/setup-deployment.sh
# ============================================================

set -euo pipefail

CITYTAXIS_DOMAIN="citytaxis.ch"
TAXIDRIVE_DOMAIN="taxi-drive.ch"

# Racine du dépôt (le script vit dans deploy/)
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

if [[ $EUID -ne 0 ]]; then
    echo "Ce script doit être lancé en root : sudo bash deploy/setup-deployment.sh"
    exit 1
fi

echo "========================================"
echo " Déploiement Apache — City Taxis + Taxi Drive"
echo " Dépôt : $REPO_ROOT"
echo "========================================"

echo
echo "[1/6] Installation d'Apache et de certbot..."
apt-get update
apt-get install -y apache2 certbot python3-certbot-apache

echo
echo "[2/6] Activation des modules Apache nécessaires..."
# rewrite : URLs propres + 301 | headers/deflate/expires : .htaccess
a2enmod rewrite headers deflate expires ssl >/dev/null
systemctl enable --now apache2

echo
echo "[3/6] Copie des fichiers des sites..."
mkdir -p /var/www/citytaxis /var/www/taxidrive
# 'cp -a src/. dst/' copie AUSSI les fichiers cachés (.htaccess).
# Un 'cp -r src/* dst/' les oublierait -> URLs propres cassées.
cp -a "$REPO_ROOT/deploy/citytaxis/." /var/www/citytaxis/
cp -a "$REPO_ROOT/deploy/taxidrive/." /var/www/taxidrive/
chown -R www-data:www-data /var/www/citytaxis /var/www/taxidrive
find /var/www/citytaxis /var/www/taxidrive -type d -exec chmod 755 {} \;
find /var/www/citytaxis /var/www/taxidrive -type f -exec chmod 644 {} \;

# Garde-fou : sans .htaccess, les pages villes ne répondraient pas.
for d in /var/www/citytaxis /var/www/taxidrive; do
    if [[ ! -f "$d/.htaccess" ]]; then
        echo "ERREUR : $d/.htaccess manquant — les URLs propres ne fonctionneront pas."
        exit 1
    fi
done
echo "  -> .htaccess présents dans les deux sites."

echo
echo "[4/6] Installation des vhosts Apache..."
cp "$REPO_ROOT/deploy/apache/citytaxis.ch.conf"  /etc/apache2/sites-available/
cp "$REPO_ROOT/deploy/apache/taxi-drive.ch.conf" /etc/apache2/sites-available/
a2ensite citytaxis.ch.conf taxi-drive.ch.conf >/dev/null
a2dissite 000-default.conf >/dev/null 2>&1 || true

echo
echo "[5/6] Test de la configuration et rechargement..."
apache2ctl configtest
systemctl reload apache2

echo
echo "[6/6] Test local des deux sites (avant DNS)..."
for host in "$CITYTAXIS_DOMAIN" "$TAXIDRIVE_DOMAIN"; do
    code=$(curl -s -o /dev/null -w '%{http_code}' -H "Host: $host" http://localhost/ || echo "000")
    echo "  $host -> HTTP $code"
done

SERVER_IP=$(curl -4 -s ifconfig.me || echo "IP_INTROUVABLE")

cat <<EOF

========================================
 Installation terminée (en HTTP)
========================================

IP DE CETTE VM : $SERVER_IP

--- ÉTAPE SUIVANTE 1 : le DNS (chez Webador) ---
Les deux domaines sont gérés via Webador/Openprovider.
Dans Webador > Domaine > Paramètres DNS, pour CHAQUE domaine :
  - enregistrement A  "@"    -> $SERVER_IP
  - enregistrement A  "www"  -> $SERVER_IP
Ne touchez PAS aux serveurs de noms (DNSSEC actif sur les 2 domaines).

Vérifiez la propagation (15 min à 48 h) :
  dig +short $CITYTAXIS_DOMAIN
  dig +short $TAXIDRIVE_DOMAIN
Quand la commande renvoie $SERVER_IP, passez à l'étape 2.

--- ÉTAPE SUIVANTE 2 : le HTTPS (une fois le DNS propagé) ---
  sudo certbot --apache -d $CITYTAXIS_DOMAIN -d www.$CITYTAXIS_DOMAIN
  sudo certbot --apache -d $TAXIDRIVE_DOMAIN -d www.$TAXIDRIVE_DOMAIN
Répondez "2" (rediriger HTTP vers HTTPS) quand certbot le propose.
Renouvellement automatique : sudo certbot renew --dry-run

--- ÉTAPE SUIVANTE 3 : vérifier ---
  https://$CITYTAXIS_DOMAIN
  https://$TAXIDRIVE_DOMAIN
  https://$TAXIDRIVE_DOMAIN/taxi-nyon/taxi-givrins   (URL propre)

Ne résiliez Webador qu'une fois ces 3 étapes validées.
EOF

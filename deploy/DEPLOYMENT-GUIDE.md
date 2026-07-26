# Guide de déploiement — City Taxis & Taxi Drive (VM OVH, Apache)

Mettre les deux sites en ligne, en HTTPS, sans coupure. À suivre **dans l'ordre**.

| Marque | Domaine | Dossier sur la VM |
|---|---|---|
| City Taxis | `citytaxis.ch` | `/var/www/citytaxis` |
| Taxi Drive | `taxi-drive.ch` *(avec tiret)* | `/var/www/taxidrive` |

---

## Pourquoi Apache (et pas nginx)

Les deux sites sont **100 % statiques** et reposent sur un fichier **`.htaccess`**
(21 règles) qui assure :

- les **URLs propres** imbriquées : `/taxi-nyon/taxi-givrins` ;
- les **redirections 301** des anciennes URLs Webador (`/reservation`,
  `/obtenir-un-devis`, `/contact`, anciennes fiches produit) — c'est ce qui
  **préserve le référencement** de l'ancien site ;
- la redirection HTTPS + `www` → apex, la compression gzip, le cache navigateur
  et les en-têtes de sécurité.

**nginx ne lit pas les `.htaccess`.** Le passer sous nginx sans réécrire ces 21
règles casserait les pages villes et ferait perdre le SEO accumulé.

Apache sert en plus les fichiers **directement depuis le disque** : pas besoin de
Node, de `npx serve`, ni de reverse proxy.

> ⚠️ **Ne jamais écrire la configuration SSL à la main avant d'avoir le certificat.**
> Une config qui référence `/etc/letsencrypt/live/...` inexistant empêche le
> serveur web de démarrer → **site totalement inaccessible**. C'est
> `certbot --apache` qui écrit le vhost HTTPS, une fois le certificat obtenu.

---

## Ordre de déploiement (important)

```
1. Installer (HTTP)  →  2. Basculer le DNS  →  3. Activer le HTTPS  →  4. Vérifier
```

Le HTTPS ne peut **pas** être activé avant le DNS : Let's Encrypt doit joindre le
domaine sur la VM pour prouver qu'il vous appartient.

---

## Étape 1 — Installation sur la VM (en HTTP)

Connexion SSH (identifiants fournis par OVH) :

```bash
ssh ubuntu@VOTRE_IP_OVH      # sinon : debian@... ou root@...
```

Récupérer le dépôt puis lancer le script :

```bash
git clone https://github.com/ahmedbousta132-cell/taxi.git
cd taxi
sudo bash deploy/setup-deployment.sh
```

Le script installe Apache + certbot, active les modules nécessaires, copie les
deux sites (**y compris les `.htaccess`**), installe les vhosts, teste la config
et affiche **l'IP de la VM**.

À la fin, il doit afficher `HTTP 200` pour les deux domaines. Notez l'IP.

<details>
<summary>Faire la même chose à la main (si vous préférez)</summary>

```bash
sudo apt update
sudo apt install -y apache2 certbot python3-certbot-apache
sudo a2enmod rewrite headers deflate expires ssl
sudo mkdir -p /var/www/citytaxis /var/www/taxidrive
# le "/." final copie AUSSI les fichiers cachés (.htaccess)
sudo cp -a ~/taxi/deploy/citytaxis/. /var/www/citytaxis/
sudo cp -a ~/taxi/deploy/taxidrive/. /var/www/taxidrive/
sudo chown -R www-data:www-data /var/www/citytaxis /var/www/taxidrive
sudo cp ~/taxi/deploy/apache/*.conf /etc/apache2/sites-available/
sudo a2ensite citytaxis.ch.conf taxi-drive.ch.conf
sudo a2dissite 000-default.conf
sudo apache2ctl configtest && sudo systemctl reload apache2
```
</details>

Ouvrir le pare-feu si `ufw` est actif :

```bash
sudo ufw allow 80,443/tcp
```

---

## Étape 2 — Basculer le DNS (chez Webador)

Les deux domaines sont enregistrés via **Openprovider** et pilotés depuis
**Webador**. Tout se fait donc dans le tableau de bord Webador.

Pour **chaque** domaine : *Domaine → Paramètres DNS*

| Type | Nom | Valeur |
|---|---|---|
| A | `@` | **IP de la VM OVH** |
| A | `www` | **IP de la VM OVH** |

> 🔒 **Ne pas modifier les serveurs de noms** (`ns1.openprovider.nl`, …).
> **DNSSEC est activé** sur les deux domaines : changer les serveurs de noms sans
> désactiver DNSSEC au préalable rendrait les sites totalement injoignables.
> Modifier uniquement les enregistrements **A** est sans risque.

Suivre la propagation (de 15 min à 48 h) :

```bash
dig +short citytaxis.ch
dig +short taxi-drive.ch
```

Passer à l'étape 3 **seulement** quand ces commandes renvoient l'IP de la VM.

> ⚠️ **Ne pas résilier Webador maintenant.** Tant que le DNS n'est pas propagé
> partout, une partie des visiteurs voit encore l'ancien site.

---

## Étape 3 — Activer le HTTPS

Une fois le DNS propagé :

```bash
sudo certbot --apache -d citytaxis.ch -d www.citytaxis.ch
sudo certbot --apache -d taxi-drive.ch -d www.taxi-drive.ch
```

- Saisir une adresse e-mail valide (alertes d'expiration).
- Quand certbot propose la redirection HTTP → HTTPS : **répondre 2 (Redirect)**.

Vérifier le renouvellement automatique :

```bash
sudo certbot renew --dry-run
```

✅ C'est à cette étape que le message de certificat disparaît et que le
**cadenas 🔒** apparaît dans le navigateur.

Optionnel, une fois le HTTPS confirmé sur tout le site : décommenter la ligne
`Strict-Transport-Security` (HSTS) dans les deux `.htaccess`.

---

## Étape 4 — Vérifier

| À tester | Résultat attendu |
|---|---|
| `https://citytaxis.ch` | page d'accueil + cadenas 🔒 |
| `https://taxi-drive.ch` | page d'accueil + cadenas 🔒 |
| `https://citytaxis.ch/taxi-nyon/` | hub des villes |
| `https://taxi-drive.ch/taxi-nyon/taxi-givrins` | page ville (URL propre) |
| `http://www.citytaxis.ch` | redirige vers `https://citytaxis.ch` |
| `https://taxi-drive.ch/reservation` | redirige vers l'accueil `#book` |
| `https://citytaxis.ch/sitemap.xml` | XML valide |

En ligne de commande :

```bash
curl -I https://taxi-drive.ch/taxi-nyon/taxi-givrins   # attendu : 200
curl -I http://www.citytaxis.ch                        # attendu : 301
```

**Formulaires** : envoyer un formulaire de test sur chaque site, puis cliquer sur
**« Activate Form »** dans l'e-mail reçu de FormSubmit (une seule fois, à vie).
Réception : City Taxis → `newaymen1196@gmail.com` · Taxi Drive → `taxiskyaymen@gmail.com`.

---

## Étape 5 — Google, puis fermeture de Webador

1. **Search Console** — ajouter les deux domaines (validation **par DNS** : un
   enregistrement TXT à créer dans Webador, au même endroit qu'à l'étape 2), puis
   soumettre `https://citytaxis.ch/sitemap.xml` et `https://taxi-drive.ch/sitemap.xml`.
2. **Fiches Google Business** (déjà existantes) — y remplacer l'URL Webador par
   la nouvelle adresse du site. Vérifier téléphone, zone, horaires 24 h/24, photos.
3. **Résilier Webador** — uniquement après 2 à 3 jours de fonctionnement validé.

Le détail du référencement se trouve dans `CONFIGURATION-MANUELLE.md` (section B).

---

## Mettre à jour les sites plus tard

```bash
cd ~/taxi && git pull
sudo cp -a deploy/citytaxis/. /var/www/citytaxis/
sudo cp -a deploy/taxidrive/. /var/www/taxidrive/
sudo chown -R www-data:www-data /var/www/citytaxis /var/www/taxidrive
```

Aucun redémarrage nécessaire : Apache sert les fichiers directement.

---

## Dépannage

| Symptôme | Cause probable | Solution |
|---|---|---|
| Pages villes en 404 | `.htaccess` absent ou ignoré | vérifier `ls -a /var/www/<site>/` et `AllowOverride All` dans le vhost |
| URLs propres inactives | `mod_rewrite` désactivé | `sudo a2enmod rewrite && sudo systemctl restart apache2` |
| certbot échoue | DNS pas encore propagé | attendre, vérifier avec `dig +short <domaine>` |
| Apache ne démarre pas | erreur de config | `sudo apache2ctl configtest` puis `sudo journalctl -xeu apache2` |
| Site inaccessible depuis l'extérieur | pare-feu | `sudo ufw allow 80,443/tcp` |
| Ancien site encore visible | cache DNS local | vider le cache DNS / tester en 4G |

Logs :

```bash
sudo tail -f /var/log/apache2/citytaxis_error.log
sudo tail -f /var/log/apache2/taxidrive_error.log
```

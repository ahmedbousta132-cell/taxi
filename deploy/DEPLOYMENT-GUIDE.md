# Guide de déploiement — City Taxis & Taxi Drive (VM OVH, Apache)

Mettre les deux sites en ligne, en HTTPS, sans coupure. À suivre **dans l'ordre**.

| Marque | Domaine | Dossier sur la VM |
|---|---|---|
| City Taxis | `taxiscity.ch` | `/var/www/citytaxis` |
| Taxi Drive | `taxidrive.ch` | `/var/www/taxidrive` |

Les deux domaines ont été achetés chez **Namecheap** : c'est donc là que se règle
le DNS (étape 2). L'ancien domaine Webador `taxi-drive.ch` est traité à l'étape 5.

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

À la fin, il doit afficher `HTTP 301` pour les deux domaines — c'est le résultat
attendu (le `.htaccess` force la redirection HTTPS dès une requête HTTP simple),
pas une erreur. C'est même la confirmation que `.htaccess` et `mod_rewrite`
fonctionnent. Notez l'IP.

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
sudo a2ensite taxiscity.ch.conf taxidrive.ch.conf
sudo a2dissite 000-default.conf
sudo apache2ctl configtest && sudo systemctl reload apache2
```
</details>

Ouvrir le pare-feu si `ufw` est actif :

```bash
sudo ufw allow 80,443/tcp
```

---

## Étape 2 — Pointer le DNS (chez Namecheap)

`taxiscity.ch` et `taxidrive.ch` ont été achetés chez **Namecheap** : tout se
règle donc dans le tableau de bord Namecheap.

Pour **chaque** domaine : *Domain List → Manage → Advanced DNS*

| Type | Host | Value | TTL |
|---|---|---|---|
| A Record | `@` | **IP de la VM OVH** | Automatic |
| A Record | `www` | **IP de la VM OVH** | Automatic |

Points d'attention côté Namecheap :

- Sous *Nameservers*, laisser **Namecheap BasicDNS** — c'est ce qui rend l'onglet
  *Advanced DNS* actif.
- **Supprimer l'enregistrement « URL Redirect » / « Parking Page »** créé par
  défaut sur `@` : s'il reste, il prend le pas sur l'enregistrement A et affiche
  la page de parking Namecheap à la place du site.
- Un domaine tout juste acheté peut être en pause le temps de la vérification
  ICANN par e-mail : **valider l'e-mail de confirmation**, sinon le domaine ne
  résout pas.

Suivre la propagation (de 15 min à 48 h) :

```bash
dig +short taxiscity.ch
dig +short taxidrive.ch
```

Passer à l'étape 3 **seulement** quand ces commandes renvoient l'IP de la VM.

---

## Étape 3 — Activer le HTTPS

Une fois le DNS propagé :

```bash
sudo certbot --apache -d taxiscity.ch -d www.taxiscity.ch
sudo certbot --apache -d taxidrive.ch -d www.taxidrive.ch
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
| `https://taxiscity.ch` | page d'accueil + cadenas 🔒 |
| `https://taxidrive.ch` | page d'accueil + cadenas 🔒 |
| `https://taxiscity.ch/taxi-nyon/` | hub des villes |
| `https://taxidrive.ch/taxi-nyon/taxi-givrins` | page ville (URL propre) |
| `http://www.taxiscity.ch` | redirige vers `https://taxiscity.ch` |
| `https://taxidrive.ch/reservation` | redirige vers l'accueil `#book` |
| `https://taxiscity.ch/sitemap.xml` | XML valide |

En ligne de commande :

```bash
curl -I https://taxidrive.ch/taxi-nyon/taxi-givrins   # attendu : 200
curl -I http://www.taxiscity.ch                        # attendu : 301
```

**Formulaires** : envoyer un formulaire de test sur chaque site, puis cliquer sur
**« Activate Form »** dans l'e-mail reçu de FormSubmit (une seule fois, à vie).
Réception : City Taxis → `newaymen1196@gmail.com` · Taxi Drive → `taxiskyaymen@gmail.com`.

---

## Étape 5 — L'ancien domaine `taxi-drive.ch` (à ne pas négliger)

L'ancien site Webador vit sur **`taxi-drive.ch`**, qui n'est **pas** le nouveau
domaine `taxidrive.ch`. Tout l'historique de référencement (ancienneté depuis
2005, pages indexées, liens entrants) est attaché à l'ancien nom.

**Le laisser expirer, c'est repartir de zéro sur le nouveau domaine.**

La bonne pratique — celle qui transfère le SEO :

1. **Conserver `taxi-drive.ch`** (le renouveler ; c'est quelques francs par an).
2. Le faire pointer vers la **même VM OVH** (enregistrements A `@` et `www`).
3. Y ajouter un vhost qui **redirige tout en 301** vers `taxidrive.ch` :

```apache
<VirtualHost *:80>
    ServerName taxi-drive.ch
    ServerAlias www.taxi-drive.ch
    # 301 : transmet le "jus" SEO page par page vers le nouveau domaine
    RedirectMatch 301 ^/(.*)$ https://taxidrive.ch/$1
</VirtualHost>
```

Puis `sudo certbot --apache -d taxi-drive.ch -d www.taxi-drive.ch` (une
redirection en HTTPS a besoin de son propre certificat).

Grâce aux URLs identiques des deux sites (`/taxi-nyon/taxi-<ville>`), chaque
ancienne page atterrit sur son équivalent exact — c'est le cas idéal pour Google.

> Une redirection 301 doit rester en place **au moins 12 mois** pour que Google
> transfère durablement le référencement.

Ne résilier Webador (l'hébergement) qu'une fois les étapes 1 à 4 validées — mais
**garder le domaine**.

---

## Étape 6 — Google

1. **Search Console** — ajouter les deux nouveaux domaines (validation **par
   DNS** : un enregistrement TXT à créer dans Namecheap, au même endroit qu'à
   l'étape 2), puis soumettre `https://taxiscity.ch/sitemap.xml` et
   `https://taxidrive.ch/sitemap.xml`.
   Ajouter aussi `taxi-drive.ch` et y utiliser l'outil **« Changement d'adresse »**
   : c'est le signal officiel de migration de domaine.
2. **Fiches Google Business** (déjà existantes) — y remplacer l'URL Webador par
   la nouvelle adresse du site. Vérifier téléphone, zone, horaires 24 h/24, photos.

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

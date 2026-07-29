# Roadmap — ce que vous devez configurer manuellement

Le code est prêt (technique + SEO + pages villes). Cette liste = **tout ce qui
se règle à la main**, hors code, dans l'ordre. Légende : 🔴 bloquant pour la mise
en ligne · 🟠 essentiel pour le référencement · 🟢 optionnel / amélioration.

---

## A. Avant / pendant la mise en ligne

### 🔴 A1. Vérifier les coordonnées dans le code (5 min)
Aujourd'hui, les deux sites utilisent :
- Téléphone / WhatsApp : **+41 78 719 44 44**
- E-mail : **info@local-taxi.ch**

➡️ Si une marque doit avoir un **numéro ou e-mail différent**, dites-le-moi (je
les remplace). Sinon, confirmez que c'est correct pour City Taxis **et** Taxi Drive.

### 🔴 A2. Clé Google Maps (10 min)
La variable `window.GMAPS_KEY` de chaque `index.html` active l'autocomplétion
d'adresses et le calcul de distance. **Une seule clé suffit pour les deux sites.**

Injection en une commande :

```bash
bash deploy/set-gmaps-key.sh AIzaSy...votre_cle...
```

Le script écrit la clé dans les deux `index.html`, refuse une valeur au mauvais
format, et `--reset` revient au placeholder.

**Restrictions à déclarer sur la clé** (console Google Cloud → *API et services*
→ *Identifiants*) :

- *Référents HTTP* — **les quatre entrées**, sinon
  `RefererNotAllowedMapError` :
  `https://taxiscity.ch/*`, `https://www.taxiscity.ch/*`,
  `https://taxidrive.ch/*`, `https://www.taxidrive.ch/*`
- *Restrictions d'API* : **Maps JavaScript API** + **Directions API**

> Si vous réutilisez la clé de l'ancien site, ses référents pointent encore vers
> les anciens domaines : ajoutez les quatre entrées ci-dessus.

> Une clé Maps « navigateur » est **visible dans le code source** de la page —
> c'est le fonctionnement normal prévu par Google. Ce qui la protège d'un usage
> abusif est la **restriction par référent**, pas sa confidentialité. Elle peut
> donc figurer dans le dépôt, contrairement à un mot de passe.

> Sans clé, le site fonctionne quand même (saisie manuelle de la distance).

### 🟢 A3. Prix « sur devis » de Gimel
La commune **Gimel** n'a pas de forfait aéroport officiel → la page l'affiche
« sur devis ». Si vous avez un prix fixe, donnez-le-moi (je le mets partout).

### 🔴 A4. Héberger sur OVH
Pour **chaque** marque, uploader **tout le contenu** du dossier (fichiers cachés
`.htaccess` compris) à la racine du domaine :
- `deploy/citytaxis/` → racine de **taxiscity.ch**
- `deploy/taxidrive/` → racine de **taxidrive.ch**

> Les deux domaines ont été achetés chez **Namecheap** : le DNS (enregistrements A
> vers l'IP de la VM OVH) se règle dans *Domain List → Manage → Advanced DNS*.
>
> ⚠️ **L'ancien domaine `taxi-drive.ch`** (site Webador) est **différent** du
> nouveau `taxidrive.ch`. Il porte tout l'historique SEO : **gardez-le** et
> redirigez-le en **301** vers `taxidrive.ch`, sinon le référencement acquis est
> perdu. Procédure détaillée dans `deploy/DEPLOYMENT-GUIDE.md` (étape 5).

> 📌 Procédure de déploiement complète (SSH, Apache, DNS, HTTPS) :
> **`deploy/DEPLOYMENT-GUIDE.md`**.

### 🔴 A5. Activer le HTTPS
Let's Encrypt (automatique sur OVH). Une fois le HTTPS confirmé partout, vous
pouvez décommenter la ligne `Strict-Transport-Security` (HSTS) dans `.htaccess`.

### 🔴 A6. Vérifier après upload
- `https://taxiscity.ch/` et `https://taxidrive.ch/` s'ouvrent bien.
- `https://taxidrive.ch/taxi-nyon/taxi-rolle` s'affiche (URL propre).
- Les anciennes URLs redirigent : `/reservation` → accueil #book, `/contact` → #contact.
- `http://` et `www.` redirigent vers la version `https://` sans www.

---

### 🔴 A7. Activer FormSubmit (réception des réservations par e-mail)
Les formulaires (réservation **et** devis) envoient désormais un e-mail automatique
via **FormSubmit.co** (gratuit, illimité), en plus du bouton WhatsApp :
- **City Taxis** → `newaymen1196@gmail.com`
- **Taxi Drive** → `taxiskyaymen@gmail.com`

**Une seule action, une fois le site en ligne :**
1. Remplissez et envoyez un **formulaire de test** sur chaque site.
2. FormSubmit envoie un **e-mail d'activation** à l'adresse correspondante → ouvrez-le
   et cliquez sur **« Activate Form »**.
3. C'est activé pour toujours : chaque réservation/devis arrive ensuite automatiquement
   dans la boîte mail, avec toutes les données saisies.
> Tant que ce n'est pas activé, les envois ne sont pas délivrés (sécurité anti-spam de FormSubmit).
> Astuce anti-spam : après activation, FormSubmit fournit un identifiant aléatoire
> qui peut remplacer l'e-mail dans le code pour ne pas l'exposer — dites-le-moi si vous le souhaitez.

## B. Référencement Google — à faire dès la mise en ligne

### 🟠 B1. Google Search Console — faire indexer les sites
Outil : https://search.google.com/search-console (gratuit). Connectez-vous avec
**le compte Google qui gère déjà vos fiches Google Business**.

**1) Ajouter chaque domaine (vérification par DNS chez Namecheap)**
- Bouton **« Ajouter une propriété » → type « Domaine »** → saisir `taxiscity.ch`
  (puis recommencer pour `taxidrive.ch`).
- Google affiche un enregistrement **TXT** du type `google-site-verification=xxxx`.
- Dans **Namecheap → Domain List → Manage → Advanced DNS** (le **même écran** que
  les enregistrements A déjà posés), ajoutez pour ce domaine :

  | Type | Host | Value | TTL |
  |------|------|-------|-----|
  | TXT Record | `@` | *la chaîne `google-site-verification=…` fournie* | Automatic |

- Enregistrez, attendez la propagation (souvent 15–30 min), puis cliquez
  **« Vérifier »** dans Search Console. Le TXT peut rester en place ensuite.

**2) Soumettre le sitemap** (une fois la propriété vérifiée)
- Menu **« Sitemaps »** → dans le champ, taper simplement `sitemap.xml` → Envoyer.
- À faire pour les deux : `taxiscity.ch/sitemap.xml` et `taxidrive.ch/sitemap.xml`.
- C'est ce qui fait découvrir toutes les pages (54 pour City Taxis, dont les 48
  villes ; 7 pour Taxi Drive).

**3) Accélérer les pages clés**
- **Inspection d'URL** (barre du haut) → tester `https://taxiscity.ch/` puis
  `https://taxiscity.ch/taxi-nyon/` → **« Demander l'indexation »**. Idem pour
  Taxi Drive. Inutile de le faire pour les 48 villes : le sitemap s'en charge.

**4) Suivi**
- Rapport **« Pages »** = ce qui est indexé / en attente. Délais réalistes :
  premières pages en **quelques jours**, l'ensemble du maillage en **2 à 4 semaines**.

**5) Migration de l'ancien domaine (`taxi-drive.ch`)**
- Ajoutez **aussi** `taxi-drive.ch` (l'ancien domaine Webador) comme propriété,
  puis *Paramètres → **Changement d'adresse*** vers `taxidrive.ch`. C'est le
  signal officiel qui **transfère le référencement** de l'ancien site vers le
  nouveau. À coupler avec la redirection 301 (voir `deploy/DEPLOYMENT-GUIDE.md`,
  étape 5).

### 🟠 B2. Fiche Google Business Profile — **levier n°1 pour un taxi**
Outil : https://business.google.com

> ⚠️ **À comprendre d'abord** : Google Business ne « s'installe » **pas** sur le
> site. C'est une **fiche externe** (Google Maps + le « pack local », les 3
> résultats avec la carte en haut de Google) qui **pointe vers** votre site. Il
> n'y a donc rien à coder ; tout se fait dans l'interface ci-dessus.

Vous avez **déjà des fiches** créées pour les anciennes marques → **ne les
recréez pas, revendiquez-les et mettez-les à jour** :

1. Connectez-vous sur business.google.com avec le compte Google concerné, ouvrez
   la fiche.
2. **Remplacez l'adresse du site web** par le nouveau domaine :
   `https://taxiscity.ch` pour City Taxis · `https://taxidrive.ch` pour Taxi Drive.
3. Vérifiez / complétez : **nom exact** de la marque, **téléphone**
   +41 78 719 44 44, **zone desservie** (Nyon / La Côte / Suisse), **horaires
   24h/24 7j/7**, **catégories** « Service de taxi » + « Service de voiture avec
   chauffeur », **photos** (véhicules, chauffeur).
4. Si l'ancienne fiche porte un **autre nom** que la marque actuelle : renommez-la
   (ou créez une nouvelle fiche si c'est une entité vraiment distincte). Un
   changement de **nom ou d'adresse** peut déclencher une **re-validation Google**
   (code par courrier postal, téléphone ou e-mail) — c'est normal.

> C'est ce qui vous fait apparaître dans **Google Maps** et le **pack local** —
> indispensable pour « taxi nyon », « taxi gland », etc. Souvent **plus
> déterminant que le site lui-même** pour un taxi local.

### 🟠 B3. Avis Google
Demandez systématiquement un avis à chaque client satisfait (lien d'avis Google).
Le **volume et la fraîcheur** des avis pèsent énormément en référencement local.

### 🟠 B4. Cohérence NAP + annuaires suisses
Même **N**om / **A**dresse / **P**hone partout. Inscrivez-vous sur :
- **local.ch**, **search.ch**, **localsearch.ch** (annuaires suisses de référence)
- Apple Plans (Apple Business Connect)

### 🟢 B5. Bing Webmaster Tools
https://www.bing.com/webmasters — ajouter les domaines + sitemaps (alimente aussi Copilot).

---

## C. Améliorations (quand vous voulez)

- 🟢 **Backlinks locaux** : hôtels, restaurants, offices du tourisme de Nyon / La Côte
  qui lient vers votre site (très efficace en local).
- 🟢 **Google Analytics 4** / Tag Manager : suivi du trafic et des conversions (je peux l'ajouter au code).
- 🟢 **og:image dédiées** : remplacer les images de partage auto-générées par un visuel
  logo + accroche 1200×630 (je peux les intégrer).
- 🟢 **Formspree** : recevoir les réservations par e-mail sans dépendre du client mail
  du visiteur (aujourd'hui c'est un lien `mailto:` + WhatsApp).
- 🟢 **Pages `/reservation`, `/contact` réelles** : aujourd'hui redirigées vers les
  sections de l'accueil ; je peux en faire des pages dédiées si vous préférez.

---

## Suivi de la visibilité (mensuel)
1. Testez vos requêtes clés dans Google, ChatGPT et Perplexity : « taxi nyon »,
   « taxi aéroport genève prix », « taxi gland », « chauffeur privé suisse »…
2. Notez si vous apparaissez / êtes cité, et qui apparaît sinon.
3. Suivez l'évolution mois par mois (Search Console + un simple tableur).

> **Rappel honnête** : le code met les deux sites dans les meilleures conditions
> techniques et de contenu. Le classement final dépend surtout de **B2 (fiche Google
> Business), B3 (avis) et C (backlinks)** — ça se construit dans la durée, aucune
> configuration ne garantit la 1ʳᵉ place instantanément.

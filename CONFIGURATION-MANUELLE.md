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
Dans chaque `index.html`, la variable `window.GMAPS_KEY="VOTRE_CLE_GOOGLE_MAPS"`
active l'autocomplétion d'adresses et le calcul de distance.
1. Créez une clé sur https://console.cloud.google.com/ (activez *Maps JavaScript API* + *Directions API*).
2. **Restreignez-la** à votre domaine (HTTP referrers : `taxiscity.ch/*`, `taxidrive.ch/*`).
3. Remplacez `VOTRE_CLE_GOOGLE_MAPS` par la clé dans les deux `index.html`.
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

### 🟠 B1. Google Search Console (le plus important après la mise en ligne)
https://search.google.com/search-console
1. Ajouter **les deux domaines** (propriété « Domaine », validation par DNS).
2. Soumettre le sitemap de chacun : `https://taxiscity.ch/sitemap.xml` et
   `https://taxidrive.ch/sitemap.xml`.
3. Demander l'indexation de l'accueil et du hub `/taxi-nyon/` (outil d'inspection d'URL).
4. Pour Taxi Drive : surveiller que les anciennes URLs Webador passent bien en 301
   (rapport « Pages ») — normal qu'elles migrent sur quelques semaines.

### 🟠 B2. Fiche Google Business Profile — **levier n°1 pour un taxi**
https://business.google.com
- **Taxi Drive** a probablement déjà une fiche (site existant) → **revendiquez-la**
  et mettez à jour (site web, téléphone, zone, horaires 24h/24, photos).
- **City Taxis** → créez une fiche si c'est une entité distincte.
- Renseignez : nom exact, téléphone, zone desservie (Nyon / La Côte / Suisse),
  horaires 24h/24, catégories (« Service de taxi », « Service de voiture avec chauffeur »).
> C'est ce qui vous fait apparaître dans **Google Maps** et le **pack local** (les 3
> résultats en haut avec la carte) — indispensable pour « taxi nyon », « taxi gland », etc.

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

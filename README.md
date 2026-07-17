# Taxi Nyon Région — Sites web

Deux sites vitrines **statiques** (HTML / CSS / JS en un seul fichier, sans build ni dépendance à installer). Ce sont deux variantes de marque du même site « chauffeur privé premium », prêtes à mettre en ligne :

| Fichier | Marque | Description |
|---------|--------|-------------|
| [`citytaxis.html`](citytaxis.html) | **City Taxis** | Chauffeur privé premium, toute la Suisse — transferts aéroport, business, groupes, longue distance, stations de ski, 24h/24. |
| [`taxidrive-full.html`](taxidrive-full.html) | **Taxi Drive** | Même offre, habillage de marque « Taxi Drive ». |

Choisissez la variante que vous voulez déployer (ou publiez-les sur deux domaines distincts).

## Aperçu en local

Aucune installation n'est nécessaire : double-cliquez sur `citytaxis.html` ou `taxidrive-full.html` pour l'ouvrir dans votre navigateur.

Pour un aperçu plus proche d'un vrai serveur (recommandé avant mise en ligne), servez le dossier avec un petit serveur local :

```bash
npx serve .
```

puis ouvrez `http://localhost:3000/citytaxis.html` ou `http://localhost:3000/taxidrive-full.html`.

## Structure du dépôt

```
citytaxis.html          ← site final « City Taxis » (autonome, un seul fichier)
taxidrive-full.html     ← site final « Taxi Drive » (autonome, un seul fichier)
dev-env/                ← archives : anciennes itérations, brouillons, assets, taxi-local/…
```

Chaque site final est **100 % autonome** : tout le CSS et le JS est inline, il n'y a aucune dépendance vers un fichier local du dépôt. Les seules ressources externes sont des services en ligne (Google Maps, Photon/Komoot pour l'autocomplétion d'adresses, WhatsApp).

Le dossier [`dev-env/`](dev-env/) regroupe toutes les versions de travail précédentes (`index.html` → `index9.html`, `concept-*.html`, `taxi-city.html`, `taxidrive.html`, l'ancien projet `taxi-local/`, les dossiers `assets*`, etc.). Il n'est **pas** nécessaire pour faire tourner les sites finaux — c'est un historique de conception. Son propre `dev-env/README.md` documente l'ancienne structure `taxi-local` / `taxi-premium`.

## Réservation / contact

Les formulaires de réservation et de devis ne passent **pas** par un serveur : ils ouvrent le client mail de l'utilisateur via un lien `mailto:` pré-rempli, et un bouton WhatsApp est également proposé.

- **E-mail de destination** : `info@local-taxi.ch`
- **Téléphone / WhatsApp** : `+41 78 719 44 44` (`wa.me/41787194444`)

Pour changer ces coordonnées, recherchez `info@local-taxi.ch`, `+41 78 719 44 44` et `41787194444` dans le fichier du site concerné et remplacez-les.

> Astuce : si vous souhaitez recevoir les réservations sans dépendre du client mail du visiteur, vous pouvez brancher un service comme [Formspree](https://formspree.io) en remplaçant le `onsubmit="return false"` du `<form>` par un `action="https://formspree.io/f/VOTRE_ID"` et une `method="POST"`.

## Déploiement sur OVH (ou tout hébergement statique)

1. Connectez-vous à votre hébergement (FTP/SFTP ou gestionnaire de fichiers).
2. Déposez le fichier du site choisi à la racine du domaine, en le renommant `index.html` (ex. `citytaxis.html` → `index.html`).
3. Pour publier les deux marques, utilisez deux domaines / sous-domaines distincts.
4. Activez le HTTPS (Let's Encrypt, généralement automatique sur OVH).

Inutile d'uploader le dossier `dev-env/` : seul le fichier HTML final est nécessaire en production.

## Cartes & autocomplétion d'adresses

Les sites utilisent Google Maps et l'API Photon (Komoot) pour l'autocomplétion des adresses. Si vous activez une clé Google Maps à vous, pensez à la restreindre à vos domaines dans la console Google Cloud avant la mise en production.

## Images des véhicules

Certaines photos de la section « Flotte » proviennent de sources externes (concessionnaire Mercedes, banques d'images, etc.) et appartiennent à des tiers. Remplacez-les par de vraies photos de la flotte (ou des visuels correctement licenciés) avant la mise en ligne définitive.

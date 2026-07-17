# Taxi Nyon Région — Sites web

Deux sites statiques (HTML / CSS / JS, sans build ni dépendances) :

- `taxi-local/index.html` — **Taxi Local Nyon** : courses locales, gare, entreprises, villages de la région.
- `taxi-premium/index.html` — **Taxi Premium** : transferts aéroport, chauffeur privé, VIP, mariages/événements.

Les deux sites se renvoient l'un vers l'autre (bandeau du haut, bannière CTA, FAQ, footer) pour maximiser la couverture Google.

## Aperçu en local

Aucune installation n'est nécessaire : double-cliquez sur `index.html` dans chaque dossier pour l'ouvrir dans votre navigateur, ou faites un clic droit → "Ouvrir avec" → votre navigateur.

Pour un aperçu plus proche d'un vrai serveur (recommandé avant mise en ligne), servez le dossier avec un petit serveur local, par exemple avec Node déjà installé sur cette machine :

```bash
npx serve "web taxi"
```

puis ouvrez `http://localhost:3000/taxi-local/` et `http://localhost:3000/taxi-premium/`.

## Activer l'envoi des réservations par e-mail (Formspree)

Le formulaire de réservation est déjà branché pour un envoi réel via [Formspree](https://formspree.io), un service qui reçoit les soumissions de formulaire HTML et vous les envoie par e-mail — sans avoir besoin d'un serveur.

1. Créez un compte gratuit sur https://formspree.io (50 soumissions/mois offertes, largement suffisant pour démarrer — un plan payant existe si le volume augmente).
2. Créez un nouveau formulaire, associez-le à l'adresse e-mail qui doit recevoir les réservations (ex. `info@local-taxi.ch`).
3. Copiez l'identifiant de formulaire fourni (ex. `mzbqwxyz`).
4. Dans **chacun** des deux fichiers suivants, remplacez `YOUR_FORM_ID` par cet identifiant :
   - `taxi-local/index.html` → attribut `action="https://formspree.io/f/YOUR_FORM_ID"` du `<form id="reservation-form">`
   - `taxi-premium/index.html` → même attribut

Vous pouvez utiliser le **même** identifiant pour les deux sites si vous voulez que toutes les réservations arrivent dans la même boîte mail (conforme à l'idée d'une administration commune), ou créer deux formulaires Formspree distincts pour les trier séparément.

Tant que `YOUR_FORM_ID` n'est pas remplacé, le formulaire fonctionne en **mode démo** : il valide les champs et affiche un message de confirmation, mais n'envoie rien.

## Structure des fichiers

```
taxi-local/
  index.html
  assets/css/style.css
  assets/js/main.js
taxi-premium/
  index.html
  assets/css/style.css
  assets/js/main.js
```

Chaque site est 100% autonome (pas de dépendance entre les deux dossiers à part les liens de navigation croisée), ce qui permet de les héberger comme deux sites/sous-domaines séparés sur OVH tout en partageant le même formulaire de réservation si vous le souhaitez.

## Déploiement sur OVH

1. Connectez-vous à votre hébergement OVH (FTP/SFTP ou gestionnaire de fichiers de l'espace web).
2. Déposez le contenu de `taxi-local/` à la racine du domaine principal (ex. `taxi-nyon.ch`).
3. Déposez le contenu de `taxi-premium/` à la racine du sous-domaine ou second nom de domaine prévu pour la marque Premium (ex. `premium.taxi-nyon.ch` ou un domaine dédié).
4. Ajustez les liens croisés (`../taxi-local/index.html`, `../taxi-premium/index.html`) si l'organisation des dossiers change une fois en ligne — remplacez-les par les URLs absolues des deux domaines.
5. Activez le HTTPS (Let's Encrypt, généralement automatique sur OVH).

## Images des véhicules

Les photos utilisées dans la section "Flotte" sont reprises telles quelles du site actuel local-taxi.ch (mêmes URLs externes : concessionnaire Mercedes, Bring a Trailer, Freepik, etc.). Ces images appartiennent à des tiers et non à Taxi Nyon Région — pensez à les remplacer par de vraies photos de la flotte (ou des photos de stock correctement licenciées) dès que possible pour supprimer ce risque et renforcer l'authenticité du site.

## Personnalisation rapide

- **Couleurs** : modifiables via les variables CSS en haut de chaque `assets/css/style.css` (bloc `:root`).
- **Tarifs de l'estimateur** : dans chaque `index.html`, section `#estimation`, les `<option value="min-max">` du menu déroulant "Destination" contrôlent les fourchettes de prix affichées (voir `assets/js/main.js`, fonction de calcul, pour la logique).
- **Zones desservies / destinations** : listes de `<span class="zone-tag">` dans la section `#zones` (Local) ou `#destinations` (Premium).
- **Numéro de téléphone / e-mail** : recherchez `+41 78 719 44 44` et `info@local-taxi.ch` dans les deux fichiers `index.html` pour les remplacer si besoin.

## Prochaines étapes (hors périmètre de cette version)

D'après le cahier des charges initial, les éléments suivants restent à construire dans une phase ultérieure :
- Base de données commune et tableau de bord d'administration (gestion des réservations, statuts, export).
- Protection anti-spam avancée (hCaptcha, limitation de tentatives, blocage IP).
- Intégration Google Analytics / Tag Manager / suivi de conversions pour Google Ads.
- Sitemap, données structurées Schema.org et pages dédiées par ville/service pour le SEO local avancé.

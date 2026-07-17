# Taxi Nyon Région — Sites web

Deux sites vitrines **statiques** (HTML / CSS / JS en un seul fichier, sans build
ni dépendance à installer). Ce sont deux variantes de marque du même site
« chauffeur privé premium », chacune **prête à uploader** sur son propre domaine :

| Marque | Domaine | Dossier à uploader |
|--------|---------|--------------------|
| **City Taxis** | `citytaxis.ch` | [`deploy/citytaxis/`](deploy/citytaxis/) |
| **Taxi Drive** | `taxi-drive.ch` | [`deploy/taxidrive/`](deploy/taxidrive/) |

> **Taxi Drive remplace l'ancien site Webador** hébergé sur `taxi-drive.ch`. La
> structure d'URL reproduit celle de l'ancien site (`/taxi-nyon/taxi-<ville>`) pour
> **préserver le référencement existant**, et le `.htaccess` redirige (301) les
> anciennes URLs qui changent (`/reservation`, `/obtenir-un-devis`, `/contact`, la
> page produit) vers les bonnes cibles.

Offre : transferts aéroport (Genève, Zurich, Bâle), courses locales, longue
distance, stations de ski, groupes, VIP/événements — disponible 24h/24.

## Structure du dépôt

```
deploy/
  citytaxis/          ← bundle prêt à uploader sur citytaxis.ch
    index.html        · le site (autonome, tout le CSS/JS est inline)
    robots.txt        · directives robots (crawlers IA inclus) + lien vers le sitemap
    sitemap.xml       · plan du site pour Google
    .htaccess         · HTTPS, redirections, compression, cache, sécurité (OVH/Apache)
    favicon.svg       · icône d'onglet / favicon Google
    og-image.jpg      · image 1200×630 pour l'aperçu des liens partagés
    llms.txt          · fiche de contexte pour les IA (ChatGPT, Perplexity, Claude…)
    tarifs.md         · tarifs structurés, lisibles par les agents IA
    taxi-nyon/        · hub local + 27 pages villes
      index.html      ·   /taxi-nyon/  (hub « Taxi Nyon & région »)
      taxi-<ville>.html ·  /taxi-nyon/taxi-rolle, /taxi-nyon/taxi-coppet, …
    forfaits-transfert-aeroport.html · page mots-clés (forfaits GVA)
    prix-taxi-suisse.html · chauffeur-prive-suisse.html · taxi-suisse.html
  taxidrive/          ← même contenu pour taxi-drive.ch
README.md
dev-env/              ← archives : anciennes itérations, brouillons, assets (non déployé)
```

Chaque `deploy/<marque>/` est **autonome** : uploader le contenu du dossier à la
racine du domaine suffit. Les seules ressources externes sont des services en
ligne (Google Maps, Photon/Komoot pour l'autocomplétion d'adresses, WhatsApp).

Le dossier [`dev-env/`](dev-env/) regroupe les versions de travail précédentes
(itérations `index*.html`, `concept-*.html`, ancien projet `taxi-local/`,
dossiers `assets*`, etc.). Il n'est **pas** déployé — c'est un historique de
conception.

## Aperçu en local

Aucune installation n'est nécessaire : double-cliquez sur
`deploy/citytaxis/index.html`. Pour un rendu proche d'un vrai serveur :

```bash
npx serve deploy/citytaxis
# puis http://localhost:3000/
```

## Ce qui a été fait pour le SEO

Sur **chaque** site (dans le `<head>`, sans rien changer au design) :

- **Balise `canonical`** (URL de référence unique) + `<meta robots>` optimisé.
- **Open Graph + Twitter Card** : titre, description et image `og-image.jpg`
  (1200×630) → jolis aperçus quand un lien est partagé (WhatsApp, Facebook, X…).
- **Favicon** (`favicon.svg`) — repris aussi par Google dans les résultats mobiles.
- **Données structurées Schema.org (JSON-LD)** :
  - `TaxiService` / `LocalBusiness` : nom, téléphone, e-mail, zone desservie
    (Suisse + Genève/Zurich/Bâle/Nyon/Lausanne), horaires 24h/24, moyens de
    paiement, catalogue de services.
  - `FAQPage` : les 8 questions/réponses de la page → éligible aux résultats
    enrichis « FAQ » sur Google.
  - `AggregateRating` + avis : **uniquement sur Taxi Drive** (qui affiche « 4,9/5 »
    et 3 avis clients) ; **pas** sur City Taxis, dont la section avis est vide —
    on n'invente aucune note (Google pénalise les fausses données).
- **Performance** : `preconnect`/`dns-prefetch` vers les services externes.
- **`robots.txt`** + **`sitemap.xml`** par domaine.
- **`.htaccess`** (OVH/Apache) : redirection HTTPS + `www` → domaine principal,
  compression gzip, cache navigateur et en-têtes de sécurité.

> Les images `og-image.jpg` ont été générées automatiquement à partir des visuels
> du site. Vous pouvez les remplacer par un visuel dédié 1200×630 (logo + accroche)
> pour un rendu de partage encore plus soigné.

## Pages SEO locales (par ville) et mots-clés

Pour viser un bon positionnement **ville par ville**, chaque marque dispose d'un
**hub local `/taxi-nyon/`** et de **27 pages villes** en URLs imbriquées
(`/taxi-nyon/taxi-rolle`, `/taxi-nyon/taxi-coppet`…), plus **4 pages thématiques**
(`/forfaits-transfert-aeroport`, `/prix-taxi-suisse`, `/chauffeur-prive-suisse`,
`/taxi-suisse`).

Chaque page est **unique et utile** (pas une page vide dupliquée, que Google
pénalise) : titre/description/H1 propres, **prix forfait aéroport réel de la
commune**, tarif au compteur, cartes services, mini-FAQ locale, données
structurées `TaxiService` + `BreadcrumbList` + `FAQPage`, et **maillage interne**
vers les villes voisines. Design enrichi (icônes SVG, barre d'appel fixe mobile),
mobile-first et accessible. Toutes les pages sont listées dans le `sitemap.xml`.

> ⚠️ Aucune balise ne « garantit » la 1ʳᵉ position. Ces pages mettent le site
> dans les meilleures conditions ; le classement final dépend aussi de la fiche
> Google Business, des avis et des liens entrants (voir la checklist ci-dessous).

## Visibilité dans les moteurs IA (ChatGPT, Perplexity, AI Overviews)

En plus du SEO Google classique, chaque site est préparé pour être **cité par les
assistants IA** :

- **`robots.txt`** autorise explicitement les crawlers IA (GPTBot, ChatGPT-User,
  OAI-SearchBot, PerplexityBot, ClaudeBot, anthropic-ai, Google-Extended, Bingbot).
  Sans cette autorisation, ces plateformes ne peuvent pas citer le site.
- **`llms.txt`** (convention [llmstxt.org](https://llmstxt.org)) : une fiche de
  contexte concise (activité, services, tarifs, zone, contact, liens) que les IA
  peuvent lire sans parcourir toute la page.
- **`tarifs.md`** : les tarifs en markdown structuré, directement exploitables par
  un agent IA qui compare des prestataires pour un utilisateur.
- **Données structurées** déjà en place (`LocalBusiness`/`TaxiService`, `FAQPage`)
  et **contenu extractible** (FAQ en questions/réponses, tarifs chiffrés) — ce que
  les moteurs IA privilégient pour citer une source.

> Pour aller plus loin (présence sur les sources tierces que les IA citent le plus —
> fiche Google Business, avis, annuaires local.ch/search.ch, mentions), voir la
> checklist SEO ci-dessous ; la skill `ai-seo` du dépôt détaille la méthode complète.

## Mise en ligne (déploiement sur OVH)

Pour **chaque** marque :

1. **Uploader** tout le contenu de `deploy/citytaxis/` (y compris les fichiers
   cachés `.htaccess`) à la **racine** du domaine `citytaxis.ch` via FTP/SFTP ou
   le gestionnaire de fichiers OVH. Idem `deploy/taxidrive/` → `taxidrive.ch`.
   > Le fichier s'appelle déjà `index.html` : rien à renommer.
2. **Activer le HTTPS** (Let's Encrypt, automatique sur OVH). Une fois le HTTPS
   confirmé, vous pouvez décommenter la ligne `Strict-Transport-Security` (HSTS)
   dans `.htaccess`.
3. Vérifier que `https://citytaxis.ch/` s'ouvre bien et redirige depuis
   `http://` et `www.`

## Après la mise en ligne — pour bien se positionner sur Google

Le SEO technique (ci-dessus) rend les sites parfaitement **indexables** et
éligibles aux résultats enrichis. Pour réellement **remonter dans Google**, ces
étapes sont déterminantes — surtout pour un taxi (référencement **local**) :

1. **Google Search Console** (https://search.google.com/search-console) : ajouter
   chaque domaine, valider la propriété, puis **soumettre le `sitemap.xml`** et
   demander l'indexation de la page d'accueil.
2. **Fiche Google Business Profile** (https://business.google.com) — **le levier
   n°1** pour un taxi : c'est ce qui fait apparaître l'entreprise dans le
   « pack local » et sur Google Maps. Renseignez nom, téléphone, zone desservie,
   horaires 24h/24, photos.
3. **Avis Google** : demandez systématiquement un avis aux clients satisfaits.
   Le volume et la fraîcheur des avis pèsent énormément en local.
4. **Cohérence NAP** (Name / Address / Phone) : mêmes nom, téléphone et adresse
   partout (site, fiche Google, annuaires suisses local.ch / search.ch).
5. **Bing Webmaster Tools** (https://www.bing.com/webmasters) : même principe que
   Search Console, pour Bing.
6. **Contenu** : à terme, des pages dédiées par ville/service (« Taxi Nyon »,
   « Transfert aéroport Genève »…) et des liens depuis des sites locaux
   renforcent le positionnement.

> À noter en toute transparence : aucune balise ne « garantit » la première place.
> Les balises et données structurées mettent les sites dans les meilleures
> conditions ; le classement dépend ensuite du contenu, des avis, de la fiche
> Google Business et des liens entrants, qui se construisent dans la durée.

## Réservation / contact

Les formulaires de réservation et de devis ne passent **pas** par un serveur :
ils ouvrent le client mail via un lien `mailto:` pré-rempli, avec aussi un bouton
WhatsApp.

- **E-mail de destination** : `info@local-taxi.ch`
- **Téléphone / WhatsApp** : `+41 78 719 44 44` (`wa.me/41787194444`)

Pour changer ces coordonnées, recherchez `info@local-taxi.ch`, `+41 78 719 44 44`
et `41787194444` dans le `index.html` concerné (**et** dans le JSON-LD du `<head>`)
et remplacez-les.

> Astuce : pour recevoir les réservations sans dépendre du client mail du
> visiteur, branchez un service comme [Formspree](https://formspree.io) en
> remplaçant le `onsubmit="return false"` du `<form>` par
> `action="https://formspree.io/f/VOTRE_ID"` + `method="POST"`.

## Cartes & autocomplétion d'adresses

Les sites utilisent Google Maps et l'API Photon (Komoot) pour l'autocomplétion.
Créez une clé Google Maps et **restreignez-la à votre domaine** dans la console
Google Cloud (l'emplacement `VOTRE_CLE_GOOGLE_MAPS` est indiqué dans le HTML).

## Images des véhicules

Certaines photos de la section « Flotte » proviennent de sources externes et
appartiennent à des tiers. Remplacez-les par de vraies photos de la flotte (ou des
visuels correctement licenciés) avant la mise en ligne définitive.

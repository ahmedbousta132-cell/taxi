# Taxi Nyon Région — Sites Web Statiques

Two fully static, single-file websites (HTML/CSS/JS) ready to deploy. Both are premium private chauffeur service brands with their own domain and branding.

| Brand | Domain | Deploy Folder |
|-------|--------|---------------|
| **City Taxis** | `taxiscity.ch` | [`deploy/citytaxis/`](deploy/citytaxis/) |
| **Taxi Drive** | `taxidrive.ch` | [`deploy/taxidrive/`](deploy/taxidrive/) |

**Taxi Drive** replaces the legacy Webador site, which lived on **`taxi-drive.ch`** (with a hyphen — a different domain from the new `taxidrive.ch`). The URL structure reproduces the old site's paths (`/taxi-nyon/taxi-<city>`) for SEO continuity, and `.htaccess` 301-redirects the old URLs that changed (`/reservation`, `/obtenir-un-devis`, `/contact`, the old product page).

> ⚠️ `taxi-drive.ch` carries ~20 years of SEO history and must **not** be dropped: keep the registration and 301-redirect it to `taxidrive.ch` (Webador hosting can be cancelled once the new site is confirmed working — see [`deploy/DEPLOYMENT-GUIDE.md`](deploy/DEPLOYMENT-GUIDE.md), step 5).

**Services:** Airport transfers (Geneva, Zurich, Basel), local rides, long-distance, ski resorts, group bookings, VIP/events — available 24/7.

---

## Repository Structure

```
deploy/
  citytaxis/                    ← Ready to deploy to taxiscity.ch
    index.html                  ← Self-contained website (all CSS/JS inline)
    robots.txt                  ← Crawler directives + sitemap link
    sitemap.xml                 ← Site map for Google
    .htaccess                   ← HTTPS, clean URLs, redirects, compression, security (Apache)
    favicon.svg                 ← Browser tab icon
    og-image.jpg                ← 1200×630 social media preview image
    llms.txt                    ← AI context file (ChatGPT, Perplexity, Claude)
    tarifs.md                   ← Structured pricing for AI agents
    taxi-nyon/                  ← Local hub + 48 city pages
      index.html                ←   /taxi-nyon/
      taxi-<city>.html          ←   /taxi-nyon/taxi-rolle, /taxi-nyon/taxi-coppet, …
    forfaits-transfert-aeroport.html  ← Keyword page (airport packages)
    prix-taxi-suisse.html             ← Keyword pages
    chauffeur-prive-suisse.html
    taxi-suisse.html

  taxidrive/                    ← Same structure for taxidrive.ch (2 city pages: Nyon hub + Givrins)

  apache/                       ← Apache vhosts (HTTP only — certbot adds HTTPS)
    taxiscity.ch.conf
    taxidrive.ch.conf

  setup-deployment.sh           ← One-shot install script (Apache + certbot, both sites)
  set-gmaps-key.sh              ← Injects one Google Maps API key into both sites
  DEPLOYMENT-GUIDE.md           ← Full deployment walkthrough (SSH → DNS → HTTPS → verify)

README.md                       ← This file
CONFIGURATION-MANUELLE.md       ← Manual setup checklist (contact info, Maps key, SEO follow-up)
dev-env/                        ← Archive: previous iterations, drafts, assets (not deployed)
```

Each `deploy/<brand>/` folder is **self-contained** — upload its contents to the domain root. External resources are limited to online services: Google Maps, Photon/Komoot (address autocomplete), WhatsApp, FormSubmit.co.

The [`dev-env/`](dev-env/) folder contains design history and previous iterations — it is **not** deployed.

---

## Quick Start — Local Preview

No installation required: open `deploy/citytaxis/index.html` directly in a browser.

For a server-like experience:

```bash
npx serve deploy/citytaxis
# Then visit http://localhost:3000/
```

---

## SEO & Technical Optimization

Every site includes comprehensive SEO setup in the `<head>`:

### Core SEO Elements

- **Canonical Tag** — unique reference URL
- **Meta Robots** — optimized crawler directives
- **Open Graph + Twitter Card** — rich previews (title, description, `og-image.jpg` 1200×630)
- **Favicon** (`favicon.svg`) — browser tabs and Google results

### Structured Data (JSON-LD)

- **`TaxiService` / `LocalBusiness`** — name, phone, email, service areas (Switzerland, Geneva/Zurich/Basel/Nyon/Lausanne), 24/7 hours, payment methods, service catalog
- **`FAQPage`** — 8 Q&A pairs → eligible for Google FAQ rich results
- **`AggregateRating` + Reviews** — Taxi Drive only (4.9/5 from 3 customers); City Taxis empty (no fabricated ratings — Google penalizes false data)
- **`BreadcrumbList`** — navigation hierarchy

### Performance

- `preconnect` / `dns-prefetch` to external services
- Optimized image sizes
- Minimal CSS/JS (single file)

### Sitemap & Robots

- `robots.txt` — explicitly allows AI crawlers (GPTBot, ChatGPT-User, PerplexityBot, ClaudeBot, anthropic-ai, Google-Extended, Bingbot)
- `sitemap.xml` — all pages listed

### Apache Security & Performance (`.htaccess`)

- HTTPS enforcement + `www` → apex redirect
- Clean nested URLs (`/taxi-nyon/taxi-<city>`) and 301s for retired Webador URLs
- gzip compression, browser cache headers
- Security headers (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)

> **Why Apache, not nginx:** both sites depend on `.htaccess`, which nginx does not read. Serving them under nginx without translating every rule would break the clean city URLs and drop the 301s that carry over the old site's SEO.

---

## Local SEO Pages

Each brand has:

- **Hub page** — `/taxi-nyon/`
- **City pages** — City Taxis: 48 towns · Taxi Drive: Nyon + Givrins
- **4 thematic pages** — Airport packages, pricing, private driver services, taxi overview

Every page is **unique and valuable**:
- Unique title/H1/description
- Real airport transfer pricing for each town
- Local taxi meter rates
- Service maps
- Mini-FAQ
- Structured data + internal linking

All pages appear in `sitemap.xml`.

> ⚠️ **Note:** No tag "guarantees" #1 ranking. These optimizations position the site well; final ranking depends on Google Business Profile, reviews, and backlinks.

---

## AI Engine Visibility (ChatGPT, Perplexity, AI Overviews)

Beyond traditional Google SEO, both sites are optimized for AI assistants:

### AI-Friendly Features

- **`robots.txt`** explicitly permits AI crawlers
- **`llms.txt`** ([llmstxt.org](https://llmstxt.org) convention) — concise context card for AI: services, pricing, area, contact, links
- **`tarifs.md`** — structured pricing in Markdown, ready for AI comparison agents
- **Extractable content** — FAQ Q&A, detailed pricing, service descriptions

> For full AI visibility (Google Business Profile, reviews, local.ch/search.ch listings), see the Ranking Checklist below.

---

## Deployment (OVH VM, Apache)

Full step-by-step guide, including SSH commands, the Namecheap DNS setup, and Let's Encrypt: **[`deploy/DEPLOYMENT-GUIDE.md`](deploy/DEPLOYMENT-GUIDE.md)**.

Short version:

```bash
ssh ubuntu@YOUR_OVH_IP
git clone https://github.com/ahmedbousta132-cell/taxi.git
cd taxi
sudo bash deploy/setup-deployment.sh
```

The script installs Apache + certbot, deploys both sites (`.htaccess` included), and prints the VM's IP for the DNS step. HTTPS is enabled **after** DNS propagates, via `certbot --apache` — never by hand-writing the SSL vhost, which would reference a certificate that doesn't exist yet and prevent Apache from starting.

```
1. Install (HTTP)  →  2. Point DNS at Namecheap  →  3. certbot --apache  →  4. Verify
```

---

## Post-Launch: Ranking Checklist

SEO setup makes sites fully **indexable** and eligible for rich results. To actually **rank** on Google — especially for local searches — these steps are **critical**:

### 1. Google Search Console
- Go to https://search.google.com/search-console
- Add each domain (`taxiscity.ch`, `taxidrive.ch`, and `taxi-drive.ch` using the "Change of Address" tool)
- Verify ownership (DNS TXT record, via Namecheap)
- **Submit `sitemap.xml`**
- Request indexing of homepage

### 2. Google Business Profile (✨ #1 impact for local)
- https://business.google.com
- Both brands already have a profile from the Webador era — **claim, don't recreate**
- Update the website URL to the new domain; confirm phone, service areas, 24/7 hours, photos

### 3. Google Reviews
- Systematically ask satisfied customers for reviews
- Review volume and freshness heavily weight local ranking

### 4. NAP Consistency
- **N**ame / **A**ddress / **P**hone must match everywhere:
  - Website
  - Google Business Profile
  - Swiss directories: local.ch, search.ch

### 5. Bing Webmaster Tools
- https://www.bing.com/webmasters
- Same setup as Google Search Console

### 6. Content & Backlinks
- Develop city-specific pages over time
- Build links from local Swiss websites
- These reinforce positioning gradually

> **Transparency:** No tag "guarantees" #1. These optimizations create ideal conditions; final ranking depends on content quality, reviews, Google Business Profile strength, and inbound links — built over time.

---

## Contact & Reservations

Booking forms submit via **FormSubmit.co** (AJAX, free, no backend) with a `mailto:` fallback and a WhatsApp button. Client-side anti-spam validation blocks empty/junk submissions and a honeypot field.

**Reservation email per brand:**
- City Taxis → `newaymen1196@gmail.com`
- Taxi Drive → `taxiskyaymen@gmail.com`

**Displayed contact info (current placeholder, update per brand):**
- Email: `info@local-taxi.ch`
- Phone/WhatsApp: `+41 78 719 44 44`

### To change contact info:

Search and replace in the relevant `index.html`:
- `info@local-taxi.ch` → your email
- `+41 78 719 44 44` → your phone
- `41787194444` → your phone (WhatsApp format)
- `formsubmit.co/ajax/<email>` → the FormSubmit target address

Also update the JSON-LD `<script>` in the `<head>`.

### Activating FormSubmit

FormSubmit requires a one-time activation per receiving address: submit a test booking on the live site, then click **"Activate Form"** in the confirmation email. See `CONFIGURATION-MANUELLE.md` (A7).

---

## Maps & Address Autocomplete

Sites use **Google Maps** and **Photon/Komoot API** for address autocomplete. One key covers both brands.

```bash
bash deploy/set-gmaps-key.sh AIzaSy...your_key...
```

1. Create a **Google Maps API key** in [Google Cloud Console](https://console.cloud.google.com/) (enable *Maps JavaScript API* + *Directions API*)
2. **Restrict it** to HTTP referrers: `https://taxiscity.ch/*`, `https://www.taxiscity.ch/*`, `https://taxidrive.ch/*`, `https://www.taxidrive.ch/*`
3. Run the script above, or paste the key manually over the `VOTRE_CLE_GOOGLE_MAPS` placeholder in both `index.html`

Without a key the site still works — visitors enter the distance manually.

---

## Fleet Images

Some photos in the "Fleet" section are third-party assets. **Before final launch**, replace them with:
- Real fleet photos, or
- Properly licensed images

---

## Customization Guide

### Change Branding

- **Company name:** Search the HTML for "City Taxis" or "Taxi Drive"
- **Logo:** Replace inline SVG in the header
- **Colors:** Look for CSS variables or hex codes in `<style>`

### Update Pricing

- Edit `tarifs.md` for AI-readable pricing
- Update HTML `<table>` elements for displayed pricing
- Keep `tarifs.md` and HTML in sync

### Add / Remove Cities

- Copy a `taxi-<city>.html` file
- Update the city name, coordinates, and pricing
- Add entry to `sitemap.xml`
- Add breadcrumb link to hub page

---

## Support & Troubleshooting

### Site not loading?
- Check `.htaccess` syntax (`apache2ctl configtest` on the VM)
- Verify `index.html` is in the domain root
- Check browser console for errors

### Not indexing on Google?
- Verify in Google Search Console
- Check robots.txt allows crawlers
- Ensure HTTPS is working
- Wait 2–4 weeks for initial indexing

### Maps not showing?
- Verify the Google Maps API key is set (`deploy/set-gmaps-key.sh`) and its HTTP referrer restrictions include both domains
- Check browser console for `RefererNotAllowedMapError` or other API errors

### Forms not working?
- Confirm the FormSubmit address was activated (see "Contact & Reservations" above)
- Test the `mailto:` fallback link manually

More detail: [`deploy/DEPLOYMENT-GUIDE.md`](deploy/DEPLOYMENT-GUIDE.md) has a dedicated troubleshooting table for Apache/DNS/certbot issues.

---

## License & Credits

All branding, design, and content belong to their respective owners. External resources used:
- **Google Maps API**
- **Photon/Komoot** (address autocomplete)
- **WhatsApp**
- **FormSubmit.co**

---

## Version History

- **Current:** Multi-brand static sites on `taxiscity.ch` / `taxidrive.ch`, full SEO + AI optimization, Apache deployment
- **Previous:** Webador hosting (Taxi Drive on `taxi-drive.ch`), replaced for independence and control — old domain kept and 301-redirected for SEO continuity
- **Archive:** See `dev-env/` for design iterations

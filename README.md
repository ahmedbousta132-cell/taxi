# Taxi Nyon Région — Sites Web Statiques

Two fully static, single-file websites (HTML/CSS/JS) ready to deploy. Both are premium private chauffeur service brands with their own domain and branding.

| Brand | Domain | Deploy Folder |
|-------|--------|---------------|
| **City Taxis** | `citytaxis.ch` | [`deploy/citytaxis/`](deploy/citytaxis/) |
| **Taxi Drive** | `taxi-drive.ch` | [`deploy/taxidrive/`](deploy/taxidrive/) |

**Taxi Drive** replaces the legacy Webador site. The URL structure preserves the old site's paths (`/taxi-nyon/taxi-<city>`) for SEO continuity. A `.htaccess` file handles 301 redirects for changed URLs.

**Services:** Airport transfers (Geneva, Zurich, Basel), local rides, long-distance, ski resorts, group bookings, VIP/events — available 24/7.

---

## Repository Structure

```
deploy/
  citytaxis/                    ← Ready to deploy to citytaxis.ch
    index.html                  ← Self-contained website (all CSS/JS inline)
    robots.txt                  ← Crawler directives + sitemap link
    sitemap.xml                 ← Site map for Google
    .htaccess                   ← HTTPS, redirects, compression, security (Apache/OVH)
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

  taxidrive/                    ← Identical structure for taxi-drive.ch

README.md                       ← This file
dev-env/                        ← Archive: previous iterations, drafts, assets (not deployed)
deploy/systemd/                 ← Systemd service files for Linux deployment
  citytaxis.service
  taxidrive.service
```

Each `deploy/<brand>/` folder is **self-contained** — upload its contents to the domain root. External resources are limited to online services: Google Maps, Photon/Komoot (address autocomplete), WhatsApp.

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

### Apache / OVH Security

`.htaccess` provides:
- HTTPS enforcement + `www` redirect
- gzip compression
- Browser caching headers
- Security headers (X-Frame-Options, X-Content-Type-Options, etc.)

---

## Local SEO Pages

Each brand has:

- **Hub page** — `/taxi-nyon/`
- **48 city pages** — `/taxi-nyon/taxi-rolle`, `/taxi-nyon/taxi-coppet`, etc.
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

## Deployment to OVH

### For each brand:

1. **Upload** all files from `deploy/citytaxis/` (including `.htaccess`) to the domain root via FTP/SFTP or OVH file manager.
   - Same for `deploy/taxidrive/` → `taxi-drive.ch`
   - Files are already named `index.html` — no renaming needed

2. **Enable HTTPS** (Let's Encrypt, automatic on OVH). Once active, uncomment the `Strict-Transport-Security` (HSTS) line in `.htaccess`.

3. **Verify:**
   ```
   https://citytaxis.ch/  ← should load correctly
   http://citytaxis.ch/   ← should redirect to https://
   www.citytaxis.ch/      ← should redirect to https://citytaxis.ch/
   ```

### Optional: Linux Systemd Service

Use the provided `.service` files in `deploy/systemd/` to run sites as systemd services:

```bash
sudo cp deploy/systemd/citytaxis.service /etc/systemd/system/
sudo systemctl enable citytaxis
sudo systemctl start citytaxis
# Logs: journalctl -u citytaxis -f
```

---

## Post-Launch: Ranking Checklist

SEO setup makes sites fully **indexable** and eligible for rich results. To actually **rank** on Google — especially for local searches — these steps are **critical**:

### 1. Google Search Console
- Go to https://search.google.com/search-console
- Add each domain
- Verify ownership
- **Submit `sitemap.xml`**
- Request indexing of homepage

### 2. Google Business Profile (✨ #1 impact for local)
- https://business.google.com
- Add business name, phone, service areas, 24/7 hours
- Upload fleet photos
- This is what triggers the "local pack" on Google Maps

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

Booking forms use **client-side links** only (no server dependency):
- `mailto:` pre-filled email
- WhatsApp button

**Default Contact:**
- Email: `info@local-taxi.ch`
- Phone/WhatsApp: `+41 78 719 44 44`

### To change contact info:

Search and replace in `index.html`:
- `info@local-taxi.ch` → your email
- `+41 78 719 44 44` → your phone
- `41787194444` → your phone (WhatsApp format)

Also update the JSON-LD `<script>` in the `<head>`.

### To enable form backend:

Replace `onsubmit="return false"` with:
```html
action="https://formspree.io/f/YOUR_ID"
method="POST"
```

(Sign up at [Formspree](https://formspree.io) to get a form ID.)

---

## Maps & Address Autocomplete

Sites use **Google Maps** and **Photon/Komoot API** for address autocomplete.

1. Create a **Google Maps API key** in [Google Cloud Console](https://console.cloud.google.com/)
2. **Restrict it to your domain** for security
3. Paste the key in the `index.html` placeholder (marked as `VOTRE_CLE_GOOGLE_MAPS`)

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
- Check `.htaccess` syntax (OVH validation tools available)
- Verify `index.html` is in the domain root
- Check browser console for errors

### Not indexing on Google?
- Verify in Google Search Console
- Check robots.txt allows crawlers
- Ensure HTTPS is working
- Wait 2–4 weeks for initial indexing

### Maps not showing?
- Verify Google Maps API key is correct and domain-restricted
- Check browser console for API errors

### Forms not working?
- Test `mailto:` link manually
- If using Formspree, verify endpoint is correct

---

## License & Credits

All branding, design, and content belong to their respective owners. External resources used:
- **Google Maps API**
- **Photon/Komoot** (address autocomplete)
- **WhatsApp**

---

## Version History

- **Current:** Multi-brand static sites with full SEO + AI optimization
- **Previous:** Webador hosting (Taxi Drive), replaced for independence and control
- **Archive:** See `dev-env/` for design iterations

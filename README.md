# Corevia B.V. – website

Static site (HTML, CSS, JavaScript, no framework) for Corevia B.V., holding company. Seven languages: EN, NL, DE, FR, ES, IT, PL. Ready for GitHub Pages.

## Files

| Path | What it is |
|---|---|
| `index.html` | The one-page site ("Core + Via" design) |
| `privacy.html` | Privacy statement |
| `moventra.html`, `talentra.html`, `promovia.html` | One page per company |
| `css/via.css` | Base styles, including the self-hosted font faces |
| `js/config.js` | **Company details to fill in** (email, phone, address, KvK, VAT) |
| `js/translations.js` | Base copy in seven languages |
| `js/translations-group.js` | Business-plan content in seven languages |
| `js/translations-via.js` | Copy for the Core + Via design in seven languages |
| `js/translations-extra.js` | Request picker, map, company pages, jobs, form and WhatsApp copy |
| `js/jobs.js` | **Talentra vacancies** (empty list shows an open-application message) |
| `js/main.js` | Language switcher, menu, contact form (email or form service) |
| `js/site.js` | Intro, metro bar, request picker, Netherlands map, WhatsApp, SEO tags, jobs |
| `js/via.js` | The glowing route, animated background, motifs, counters, reveals |
| `assets/logo.svg`, `assets/logo-dark.svg` | Logo for dark and light backgrounds |
| `assets/og-image.png` | Image shown when the link is shared (1200 × 630) |
| `assets/fonts/` | Self-hosted Spectral and Public Sans (SIL Open Font License) |

## Before going live

1. Fill in `js/config.js`. Optional: `whatsapp` (shows the WhatsApp button) and `formEndpoint` (for example a Formspree form URL, so messages arrive without opening an email app). Empty values show as "To be added" on the site, and the contact form shows a notice instead of opening an email until `email` is set.
2. Have the NL, DE, FR, ES, IT and PL copy checked by a native speaker.
3. Have the client confirm the privacy statement and the line that client enquiries are forwarded to the right company.

## SEO

Each language has its own address (`?lang=nl`, `?lang=de` …). The page adds canonical and hreflang links for the domain it runs on, and the home page carries Organization data (schema.org). Once the domain is known, add a `sitemap.xml` with the five pages and submit it in Google Search Console.

## Deploy on GitHub Pages

Push the folder to a repository, then Settings → Pages → Deploy from branch → `main` / root. For a custom domain, add a `CNAME` file with the domain name.

Language links: `index.html?lang=nl`, `?lang=de`, and so on. The visitor's choice is remembered in the browser.

## Design notes

- Concept "Core + Via": Corevia = core (the holding) + via (the way). One glowing line starts at the dot in the hero wordmark and is drawn through every section as the visitor scrolls, turning like a metro line in the empty space between sections.
- Colour: light theme by default (warm white, navy ink, deep gold) with a navy footer; the dark look is still in `css/via.css`.
- Previously: night navy and champagne gold only. The three companies are told apart by name and by their motif (road, shift roster, signal), not by colour.
- No third-party requests: fonts are self-hosted, so no Google Fonts consent is needed.

- `PRODUCT.md` holds the product facts, `DESIGN.md` the visual system.
- The project has the Impeccable design skill installed at project level in `.claude/` (not globally).

## Domain, sitemap and 404
- `CNAME` points GitHub Pages at **coreviabv.nl**. If the domain changes, update `CNAME`, `sitemap.xml`, `robots.txt` and the `og:url` / `og:image` tags in each page.
- `sitemap.xml` lists every page in all seven languages (`?lang=xx`). Submit it in Google Search Console.
- `404.html` uses root-relative paths, so it only works when the site is served from the domain root (as with the custom domain).

## Details not shown yet
Address, KvK number and VAT number are hidden until they are filled in `js/config.js`; the row appears automatically.
Talentra copy deliberately does not mention the Wtta until authorisation is granted.

## Updating files
CSS and JS are linked with `?v=…` (e.g. `js/via.js?v=20261126f`). After changing a CSS or JS file, raise that
number in every HTML page so visitors' browsers fetch the new file instead of a cached copy.
`.nojekyll` tells GitHub Pages to serve the files as they are, without running Jekyll.

# CLAUDE.md

Personal website of Josija Nydegger (civil engineering, BIM, digital construction).
Live: <https://josija-nydegger.ch> · static site built with [Astro](https://astro.build), deployed by a GitHub Action to Cloudflare Workers (static assets only). Repo: `josija-nydegger/josija-nydegger.ch`.

Read the reference docs when a task touches their topic:

| File | Contents |
|---|---|
| `_docs/hosting.md` | Domain, DNS, email records, Cloudflare configuration, deployment, history and lessons learned |
| `_docs/tools.md` | Building a tool step by step, approved norm values, the unit converter app (`/tools/einheiten/`) |
| `_tests/README.md` | What each test checks |
| `_notizen/` | Working notes in German: tool ideas and status (`tool-ideen.md`), log of the Jekyll → Astro migration |

## Principles

### Privacy (strict, unchanged)

- **No third-party requests.** No CDNs, external fonts, embeds or scripts from other domains. Libraries, fonts and assets are bundled locally (npm + Astro build, or `public/`). Approved exceptions only: Umami Cloud (below) and the QR-Reader copy in `public/QR-tool/` (loads libraries from jsDelivr).
- **No tracking beyond Umami**, no cookies for statistics or advertising, so no cookie banner.
- **Tool inputs never leave the device.** No server, no API calls with user data. Inputs are stored only in the URL hash (`#` + JSON) and in `localStorage`.
- **Personal data:** no street address, phone number or date of birth. Published on request: place of residence Lyss and "married to Prisca since 2024" (CV, personal section, and the first sentence of the home page). Contact via LinkedIn and email.
- **Email never in plain text** in HTML, code or the repo (the repo is public). It exists only Base64-encoded as `emailB64` in `src/data/site.ts`; an inline script in `src/layouts/Base.astro` inserts it into every `<a class="email">`. Surrounding text sits in `<span class="email-wrap" hidden>` and stays hidden without JavaScript. Currently used in: contact section of both home pages, header of both CVs, "Verantwortlich"/"Controller" on both privacy pages. `npm test` checks repo and build.
- **Privacy pages** `/datenschutz` and `/en/privacy`: any new third party, new collected data or new Umami event is added to both in the same change.

**Visitor statistics (Umami Cloud, EU region, explicitly requested November 2026):** one script line in `src/components/Umami.astro` (used by `Base.astro` and the unit converter) and the identical line by hand in every tool under `public/tools/` (a test checks the exact wording). It counts only on the own domain and drops `?`/`#` from URLs, so tool inputs are never sent; "Do Not Track" is respected. Custom events: `data-umami-event="Name"` on buttons (not on same-tab links, Umami intercepts their click), otherwise `window.umami && window.umami.track("Name", {…})`. Current events: "URL kopieren" (all tools, with `data-umami-event-tool`), "PDF-Download" (all `.pdf` links, inline script in `Base.astro`), "Lebenslauf als PDF", "Ins Balken-Tool übernommen" (load combinations), "App installiert" (unit converter).

### Look (strict, unchanged)

- Clean and calm: one column, generous whitespace, lines instead of cards. No decorative animations; small functional transitions are fine if they respect `prefers-reduced-motion`.
- The whole site design lives in `public/style.css`: colors as CSS variables (light `#fcfcfb`, dark `#151515`, `--text`, `--muted`, `--border`, `--tag-bg` …), dark mode via system setting and `data-theme`, print view. Reuse existing classes instead of inventing new styles. No CSS frameworks (no Tailwind, no Bootstrap).
- Every page must work at phone width and in dark mode.

### JavaScript (allowed, with rules)

- **Own JavaScript/TypeScript is welcome**, on tools and on regular pages: Astro `<script>` (bundled into `/_astro/`, preferred for anything non-trivial) or inline scripts. Inline scripts in `Base.astro` use `is:inline` or `define:vars` so Astro does not bundle them.
- **Progressive enhancement:** text pages (home, CV, blog, privacy) must be fully readable without JavaScript. Controls that need JavaScript are hidden without it (pattern: theme switcher and "Als PDF speichern" in the CV). Tools may require JavaScript.
- **npm libraries** are fine after a license check (MIT, BSD, Apache-2.0, ISC without asking; anything else ask first). Exact versions in `package.json`, bundled locally, loaded only on the pages that use them.
- **UI frameworks and Astro islands** (`client:*`, e.g. Preact or Svelte) only when a tool needs real state management, and only after asking. Not for regular pages.
- **Keep it light:** regular pages ideally under ~50 KB of JavaScript (Umami excluded); larger tools as needed.
- **Stay static:** no SSR, no server functions, no new Astro integrations or adapters without asking.
- **Testable logic:** calculation code as pure functions without DOM, with tests in `_tests/`.

### Languages

- German is the main language (Swiss spelling: always `ss`, never `ß`), English uses American spelling (`en_US`). Titles of works stay in their original language.
- **Keep both languages in sync:** every change to bio, CV, works or projects goes into `src/pages/index.astro`/`src/pages/cv.astro` **and** `src/pages/en/index.astro`/`src/pages/en/cv.astro`. Point this out to me.
- Blog posts may exist in only one language.
- Instructions and docs for Claude are in English; working notes in `_notizen/`, commit messages and website content stay in their language.

### Working style

- Keep changes small. Reuse components and helpers (`src/components/`, `src/lib/`) and existing CSS classes.
- Work on a branch and open a PR; a push to `main` deploys.
- Commit messages short and in German, e.g. `Blog: Beitrag zu IfcOpenShell` or `Arbeiten: PDF Projektarbeit BFH`.

## Structure

```
astro.config.mjs     Astro: domain, output format 'preserve', Markdown (remark/rehype, KaTeX, typography)
wrangler.jsonc       Cloudflare: name, domain, static assets from dist/ (no Worker code), see _docs/hosting.md
package.json         Dependencies (exact versions) and scripts: dev, build, preview, check, test
.github/workflows/deploy.yml  Type check, tests, build, deploy (see "Checking")
src/
  content.config.ts  Collection "blog": folder, file names, required front matter
  content/blog/      German blog posts (→ /blog/:slug/), English ones in content/blog/en/ (→ /en/blog/:slug/)
  data/site.ts       Title, description, domain, emailB64, social links, absoluteUrl(), pagePath()
  data/i18n.ts       Fixed texts of shared layouts/components in DE and EN, date format
  data/pages.ts      Pages with a counterpart in the other language (ref → URL per language)
  data/tools.ts      Tool list for /tools/ and /en/tools/ (title, description, tags in DE and EN)
  layouts/Base.astro Shared layout: <head>, hreflang, menu, language switch, footer, inline scripts
  layouts/Post.astro Blog post layout (date, reading time, older/newer)
  components/        Nav, Seo (title, link preview, JSON-LD), BlogList (3 newest on the home page), PersonJsonLd, Umami, Search (Ctrl/⌘ K palette, see "Menu")
  lib/posts.ts       Posts: date/language/URL from the file name, reading time, older/newer, counterpart, postUrl()
  lib/feed.ts        Atom feeds
  lib/einheiten.ts   Calculation core of the unit converter (pure TypeScript functions)
  lib/remark-math-extras.mjs  $$…$$ alone in a paragraph = block formula; remembers whether a post has formulas
  pages/             All pages and endpoints, path = URL (see "URLs")
    index, cv, datenschutz, 404, tools/index, blog/index, blog/[slug]     German (404 in English, one for all)
    en/index, en/cv, en/privacy, en/tools/index, en/blog/index, en/blog/[slug]   English
    feed.xml.ts, en/feed.xml.ts, sitemap.xml.ts                         Feeds and sitemap
    tools/einheiten/index.astro                                         Unit converter (standalone, no Base layout)
public/              Published unchanged
  style.css          The whole site design
  tools/<name>/      One tool: index.html (standalone page, German only) and icons/
  QR-tool/           Unchanged copy of QR-Reader.html and QR-Streamer.html from the repo QR-tool; change them there and copy here. Exempt from the site rules (CDN libraries, no Umami, no privacy footer); the tests skip this folder
  assets/katex/      KaTeX 0.16.47 (MIT): only katex.min.css and .woff2 fonts
  images/            profil.jpg, og-image.jpg, projekte/ (project icons), blog/ (post images)
  arbeiten/          PDFs of academic works, original only
  favicon.svg, favicon.ico, favicon-32.png, apple-touch-icon.png   Site icon "Statik & Code" (source: G:\Meine Ablage\personal_website\favicon 3.0)
  _redirects         Cloudflare: 301 from the former .html URLs (/cv.html → /cv …)
  robots.txt, google385c59b71b73dd03.html   Sitemap pointer; Google Search Console verification (do not delete or change)
_docs/               Reference docs for Claude (English), see table above
_notizen/            Working notes (German)
_drafts/vorlage.md   Template for new posts
_tests/              Tests (Node.js), see _tests/README.md
_skripte/icons.mjs   Exports tool icons from icons/icon.svg to PNG (local Chrome/Edge, no dependency)
ANLEITUNG.md         PDF upload guide (German)
README.md            Repo description (German)
```

Only what Astro builds from `src/pages/` plus the contents of `public/` is published. Everything else (`_docs/`, `_tests/`, `_notizen/`, Markdown files in the root) is not.

## URLs

- `build.format: 'preserve'`: `src/pages/foo.astro` → file `foo.html`, served by Cloudflare as `/foo`; `src/pages/foo/index.astro` → `/foo/`.
- Always link pages without `.html` (`/cv`, `/datenschutz`, `/en/privacy`). `pagePath()` strips `.html` for canonical and hreflang, the sitemap does too. Former `.html` URLs redirect via `public/_redirects`; new pages need no entry there.
- New page: new file in `src/pages/` wrapped in `<Base lang="…" ref="…" title="…" description="…">`. If it has a counterpart in the other language, add both URLs under one `ref` in `src/data/pages.ts`. The sitemap picks up new pages automatically.
- Internal links and asset paths always absolute (`/style.css`, `/images/...`). Absolute URLs always with `https://josija-nydegger.ch` (or `absoluteUrl()` from `src/data/site.ts`).
- In `.astro` files, curly braces in text are code: write `&#123;` / `&#125;`.

## Conventions

### Blog posts
- File: `src/content/blog/YYYY-MM-DD-title-with-hyphens.md` (lowercase, no umlauts). The date is the publication date, the rest the URL (`/blog/title-with-hyphens/`). Files without a leading date are not posts. Markdown `.md`, not `.mdx` (curly braces in formulas).
- Required front matter (the build stops with a message otherwise): `title`, `description` (one sentence for blog overview and link preview), `ref` (short id). Optional: `image` (own link preview with large image, ideally 1200×630), `tags: [A, B]` (shown in the blog overview), `last_modified_at` (feed and sitemap), `slug`, `date`, `published: false`. Template: `_drafts/vorlage.md`.
- English translation: `src/content/blog/en/YYYY-MM-DD-english-title.md` with the **same `ref`**. Without a counterpart, the language switch leads to the other language's blog overview.
- Posts dated in the future appear with the first build on or after that day (next push to `main`, or run the Action manually).
- The layout adds reading time (~200 words/minute) and links to the older/newer post in the same language.
- Blog overview `/blog/` and `/en/blog/`: all posts of the language, newest first, with description and tags (built like `/tools/`). The home page shows only the 3 newest (title and date, `BlogList.astro`) with "Alle Beiträge →".
- Images with fixed width as HTML: `<img src="/images/blog/bild.png" alt="…" width="480" loading="lazy">`. Images go to `public/images/blog/`.
- Link from a project on the home page to a post: `postUrl(ref, lang)` from `src/lib/posts.ts`, and show the tag only once the post is published (see QR-tool), otherwise the link test fails before the publication date.
- Formulas (LaTeX, typeset by KaTeX at build time, no KaTeX JavaScript in the browser; stylesheet only on posts with formulas): inline `$…$`, block `$$…$$` alone in a paragraph (or `$$` on separate lines). A literal dollar sign: `\$` or `<span class="nomath">$</span>`. Broken formulas render red instead of failing the build, so check the preview.
- Automatic typography: `"…"` → “…”, `--` → –, `---` → —, `...` → …. Not applied to title and description in the front matter.
- Posts written in Obsidian: convert wikilinks `[[...]]` to normal Markdown links, move images to `public/images/blog/` and link them absolutely.

### Works (`src/pages/index.astro`, section "Arbeiten")
- Newest first. One entry is an `<li class="item">` with `item-head`, `item-title`, `item-year`, `item-sub`.
- PDF in `public/arbeiten/`, linked with `<div class="tags"><a class="tag" href="/arbeiten/FILE.pdf" target="_blank" rel="noopener">PDF</a></div>`. PDFs exist only in the original; before uploading, check for personal data (e.g. student numbers on the title page) and redact it properly, not just cover it.
- Always add to `src/pages/en/index.astro` too: title in the original, only the description translated.

### Projects (`src/pages/index.astro`, section "Projekte")
- Same structure as works; tags for links (`Code`, `Demo`) and technologies. Links always `<a class="tag">` (get border and ↗ automatically), pure info tags `<span class="tag">`.
- Project icon: round, 160×160 px, in `public/images/projekte/`, before the title: `<img class="item-icon" src="/images/projekte/NAME.png" alt="" width="40" height="40" loading="lazy">`.

### Menu
- Top left on all pages with the `Base` layout: Start (EN: Home) · CV · Tools · Blog, language switch on the right. Active item via `ref` (`home`, `cv`, `tools`, `blog`) or blog post.
- **Search** (`src/components/Search.astro`): field "Suchen"/"Search" left of the language switch, opens with a click, Ctrl/⌘ K or `/`. The index (pages, home sections, tools, posts of the page's language) is written into each page at build time; searching runs only in the browser, nothing is sent. New pages or home sections that should be findable go into the `pages` list there. Hidden without JavaScript.
- New main pages get their own `ref` in `src/data/pages.ts` and, if they belong in the menu, an entry in `src/components/Nav.astro` (both languages). The CV has no back button; the menu replaces it.

### CV and structured data
- The CV has its own print view (`@media print` in `style.css`): always light, no navigation, no page breaks inside an entry.
- Changes to employer, studies or place of residence also go into `src/components/PersonJsonLd.astro` (currently Baukonstrukt AG since November 2026; BSB + Partner 2024 to October 2026 with `endDate`).

### Bilingual setup
- German at `/`, `/cv`, `/blog/:slug/`; English at `/en/`, `/en/cv`, `/en/blog/:slug/`.
- Language switch "DE | EN" (plain links in `Base.astro`) looks for the counterpart with the same `ref`: first in `src/data/pages.ts`, then among posts (`counterpartUrl()` in `src/lib/posts.ts`); without a counterpart → home page of the other language (for posts: its blog overview).
- `hreflang` links (`de`, `en`, `x-default` → German) only when a real counterpart exists.
- `src/data/i18n.ts` only for texts that shared layouts and components need, always in both languages. Texts of a single page go directly into that page.
- Date format: German `3.11.2026`, English `3 Nov 2026` (`formatDate()` in `src/data/i18n.ts`).
- Atom feeds `/feed.xml` (DE) and `/en/feed.xml` (EN) from `src/lib/feed.ts`; formulas in feeds only as MathML.
- **Translation:** natural, not literal. Fixed terms: Werkstudent → *working student*, Sozialpädagoge HF → *Social Pedagogue (Swiss College of Higher Education)*, Tragwerke → *structural engineering*, Zivildienst → *Swiss civilian service*, Matura → *Swiss Matura (university entrance qualification)*, Tiefbau → *infrastructure engineering*, Hochbau → *structural engineering for buildings*, Projektarbeit → *semester project*. List uncertain translations for me to review. Titles of works (including the Matura thesis) stay in the original. Proper names without an official English name stay in the original (e.g. ICP Höhere Fachschule für Sozialpädagogik, HOPE Sozialwerk, Chrischtehüsli, Gymnasium Interlaken, UGZ Stadt Zürich).

## Tools

Small web tools for structures, statics and BIM under `/tools/`, German only for now (`/en/tools/` says so). Current tools: `balken` (beam with cantilever, simply supported and continuous), `querschnittswerte` (section properties), `biegebemessung` (bending design of rectangular sections per SIA 262:2025), `lastkombinationen` (load combinations per SIA 260:2013, hands q_d to the beam tool via its hash format `#{"t":"einfeld","e":{...}}`) and `einheiten` (unit converter, installable app). Ideas and order: `_notizen/tool-ideen.md`.

Non-negotiable for every tool (details and the full checklist in `_docs/tools.md`):
- Looks like the website, works at phone width and in dark mode, prints light with the worked solution open.
- Inputs in the URL hash, validated before use; "Zurücksetzen" button; clear messages instead of wrong results.
- Collapsible worked solution ("Rechenweg"), section "Annahmen und Grenzen" with sources and tested cases, footer with the disclaimer "Hilfsmittel für Studium und Vordimensionierung. Es ersetzt keine Prüfung durch eine fachkundige Person."
- No norm values except the approved ones listed in `_docs/tools.md`. Licensed standards live in `_normen/` (gitignored, **never commit**).
- Calculation core as a pure function with its own test file in `_tests/`, added to the `test` script.

## Checking

- **Once:** install Node.js 24, then `npm install`.
- **Preview:** `npm run dev` (<http://localhost:4321>). Built site exactly as on Cloudflare: `npm run build`, then `npx wrangler dev`; with curl send `-H "Sec-Fetch-Mode: navigate"`, because Cloudflare treats browser page requests differently.
- **Before every commit:** `npm run check` (types) and `npm test` (tool calculation cores against formulas, tables and FE; the unit converter; two full builds checking all pages, former URLs, email not in plain text, language switch, internal links, feeds, sitemap, formulas, redirects). Details: `_tests/README.md`. When a blog feature changes, update the test post in `_tests/fixtures/blog` and its check together.
- **Deploy:** push to `main` runs `.github/workflows/deploy.yml` (types, tests, build, `wrangler deploy`, ~1–2 minutes). If a step fails, the previous site stays online; errors are in the **Actions** tab. Pull requests are only built and checked. After changes to domain, DNS or Cloudflare settings: `node _tests/live-pruefung.js`.
- **Cache:** after changing the Markdown plugins (`astro.config.mjs`, `src/lib/remark-math-extras.mjs`), delete `.astro/` and `node_modules/.astro/`.
- **Dependencies:** exact versions. When updating `katex`, also copy `katex.min.css` and the `.woff2` fonts from `node_modules/katex/dist/` to `public/assets/katex/` and update `VERSION.txt`.
- Check links and file names for exact spelling.

## Maybe later
- **Baukontrolle web app** once finished: standalone file `public/projekte/baukontrolle/index.html` and first entry under "Projekte" with a Demo button (`target="_blank"`). Sample models only (e.g. FZK-Haus), never client data. Fonts local.
- **Newsletter** via Buttondown (free plan, manual sending): needs a sign-up form, double opt-in and an update of the privacy pages.
- IFC viewer (That Open Engine), more engineering tools.
- Markdown processor Sätteri (Astro 7 default) instead of remark/rehype once there is an official KaTeX solution. Affects only `astro.config.mjs` and `src/lib/remark-math-extras.mjs`; then check the test posts in `_tests/fixtures/blog`.

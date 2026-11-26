# Tools

Reference for building and changing the tools under `/tools/`. Principles (privacy, look, JavaScript) are in `CLAUDE.md`. Ideas and status: `_notizen/tool-ideen.md` (German).

## New tool: checklist

1. **Location:** `public/tools/<name>/index.html`, short folder name, lowercase, no umlauts. Astro copies it unchanged (no layout). One file with its own `<style>` and `<script>` is the default. A tool that needs bundled TypeScript or npm libraries can be an Astro page instead (`src/pages/tools/<name>/index.astro`, like the unit converter).
2. **List:** add an entry at the top of `src/data/tools.ts` (newest first) with `url`, `year` and `title`/`description`/`tags` in `de` and `en`. `/tools/`, `/en/tools/` and the sitemap update automatically.
3. **Look:** copy the color variables from `src/styles/style.css`, same font, calm layout with lines instead of cards. Start from an existing tool.
4. **Head:**
   - `lang="de-CH"`; the color scheme inline script as the first script (prevents flashing); `<title>Name | Josija Nydegger</title>`; `meta description`; favicons.
   - Link preview by hand: `canonical`, `og:type`, `og:site_name`, `og:locale` (`de_CH`), `og:title`, `og:description`, `og:url`, `twitter:card` = `summary`. **No `og:image`**, so WhatsApp, Teams etc. show the small icon (`apple-touch-icon`) instead of a large image.
   - Own iOS home screen icon: `<link rel="apple-touch-icon" href="/tools/<name>/icons/apple-touch-icon.png">` and `<meta name="apple-mobile-web-app-title" content="<short name>">` (max. 12 characters). Draw `public/tools/<name>/icons/icon.svg` (512×512, full bleed, background `#0f2a4a`, white and orange `#ff8a1f`, content inside the inner circle of 80 % diameter), add the tool to `TOOLS` in `_skripte/icons.mjs` and run `node _skripte/icons.mjs` (180×180 PNG without alpha; iOS rounds the corners).
   - Statistics: copy the Umami line (with its comment) unchanged from an existing tool, right after `apple-mobile-web-app-title` (a test checks the exact wording).
5. **Page layout:** top: `← Tools` (link to `/tools/`) and on the right the "URL kopieren" button (copies the link including inputs, important in web apps without an address bar; markup with `data-umami-event="URL kopieren" data-umami-event-tool="<name>"`, style and script from an existing tool). Then title, short description with units; inputs; drawing/results; collapsible **Rechenweg** with intermediate steps; section **Annahmen und Grenzen** with sources and the tested cases; footer with the **disclaimer** ("Hilfsmittel für Studium und Vordimensionierung. Es ersetzt keine Prüfung durch eine fachkundige Person."), links to GitHub, the website and the privacy page (`/datenschutz`), and the light/dark/system switch (same `localStorage` key `theme` as the website).
6. **Behavior:** store inputs in the URL (`#` + JSON) so a copied link opens the same values; validate values from the link before using them; "Zurücksetzen" button; invalid input → clear message instead of wrong results; print view light with the Rechenweg open.
7. **Content:** no norm values (mechanics and user inputs only), except the approved ones below. Standards texts are in `_normen/` (gitignored, licensed, **never commit**). Inputs never leave the device. Libraries and fonts local only; check the license first.
8. **Testable:** calculation core as a pure function, e.g. between `/*CALC-START*/` and `/*CALC-END*/` (beam) or via `window.__… = { compute }` (section properties).
9. **Verify before committing:** test against tables, hand calculations or an independent calculation (e.g. FE), including edge cases, as `_tests/<name>.test.js` (pattern: `balken-*.test.js`, path to the tool `public/tools/<name>/index.html`), added to the `test` script in the root `package.json`. Check phone width and dark mode. List the test cases on the page.
10. Update the status in `_notizen/tool-ideen.md`.

## Approved norm values (explicitly requested)

Every value in the code is commented with its clause or table.

- **Beam tool, Young's modulus presets** (always freely editable): structural steel 210 000 (SIA 263:2013), reinforcing steel 200 000 (SIA 262:2025), timber E<sub>m,mean</sub> C24 11 000 / GL24h 11 500 (SIA 265:2021, serviceability; E<sub>0,05</sub> 7 400 / 9 600 only in the hint text), aluminium 70 000 (SN EN 1999-1-1).
- **Bending design tool**, explicitly per SIA 262:2025 (values editable): f<sub>ck</sub>/f<sub>ctm</sub> from Table 3, f<sub>yk</sub>/ε<sub>ud</sub> from Tables 5 and 9, γ<sub>c</sub> = 1.5, γ<sub>s</sub> = 1.15, η<sub>fc</sub>, ε<sub>c2d</sub>, stress block 0.85·x, x/d limits 0.35 / 0.5·435/f<sub>yd</sub>, minimum reinforcement 4.3.1.2. Notation as in the 2025 edition (e.g. f<sub>yd</sub>, not f<sub>sd</sub>).
- **Load combinations tool:** γ from SIA 260:2013 Table 1 (type 2); ψ from Annex A, Table 2; snow load on roofs per SIA 261:2020, 5.2 and 5.3: eq. (9) and (10), C<sub>e</sub>, μ<sub>1</sub> per Figure 2, 5.3.4 and Figure 4.

## Unit converter (`/tools/einheiten/`)

Built differently from the other tools so the core can be tested in TypeScript (November 2026, on request).

- **Core** `src/lib/einheiten.ts`: pure functions without DOM (`convert()`, `formatNumber()`, `parseUnit()`). Every unit has a factor to the SI base and a dimension vector [m, kg, s, K]. Mass ↔ force only via g (9.81 or 10); temperature absolute/difference, slope (tan) and reinforcement (`d12 s15`, `4 d16`; spacing without unit below 50 = cm) have their own logic. Expressions with π/pi, powers on parentheses and `ans` (last result taken with Enter/copy, stored in `localStorage` `einheiten:ans`). Units appended without an operator stay in the denominator (W/m²K = W/(m²·K)). Calculations with W, Wh or J pick the category energy instead of moment. New unit: in `def(...)` (atoms with allowed prefixes) and, if it should appear in a list, in `CATEGORIES`. Only erasable TypeScript syntax (no `enum`, `namespace`, parameter properties), because Node runs the file directly in the tests.
- **Page** `src/pages/tools/einheiten/index.astro`: head, style and layout like the other tools, without the `Base` layout, style with `is:inline`. The `<script>` without `is:inline` imports the core; Astro bundles it into `/_astro/`.
- **App (PWA), this tool only:** `public/tools/einheiten/manifest.webmanifest` (`scope`/`start_url` `/tools/einheiten/`), `sw.js` and `icons/`. The service worker lives in the tool folder and therefore cannot control other pages; it is registered only in the build, not in `npm run dev`. Strategy: page network-first (offline or after 3 s from cache), `/_astro/` files from cache. Updates arrive with the next online visit, no version number; raise `CACHE` in `sw.js` only for fundamental service worker changes. No dependency (deliberately without `@vite-pwa/astro`).
- **Icons** (kN ⇄ MPa): change `icons/icon.svg`, then `node _skripte/icons.mjs`. Produces `apple-touch-icon.png` (180), `icon-192/512.png` (`any`, rounded) and `icon-maskable-192/512.png` (full bleed). Then raise `CACHE` in `sw.js` so installed apps load the new icons (currently `einheiten-v2`).
- **Tests:** `_tests/einheiten.test.mjs` (core), `_tests/website.test.js` section 7 (manifest, icons, service worker only in the tool folder, other pages untouched).

## QR-tool

`public/QR-tool/QR-Reader.html` and `QR-Streamer.html` are an unchanged copy from the repo QR-tool (served by GitHub Pages under this domain until November 2026). Change them in that repo, then copy them here. They are exempt from the site rules (CDN libraries from jsDelivr, no Umami, no privacy footer); the tests skip the folder and the privacy pages mention jsDelivr.

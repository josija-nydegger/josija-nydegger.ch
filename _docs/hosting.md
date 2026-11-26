# Hosting, domain and deployment

Reference for anything touching the domain, DNS, Cloudflare or the deploy pipeline. History of the move: `_notizen/astro-migration.md` (German, addendum of 26.11.2026).

## Domain and DNS

- Domain `josija-nydegger.ch`, registered at **Infomaniak** (renewal stays there). Infomaniak also hosts the mailbox.
- DNS at **Cloudflare** since November 2026 (zone in the Cloudflare account, Free plan). Nameservers entered at Infomaniak: `jerome.ns.cloudflare.com`, `keyla.ns.cloudflare.com`. The DNS zone at Infomaniak is no longer used.
- **DNSSEC** signed by Cloudflare (key tag 2371, algorithm 13, digest type 2); the DS record is entered at Infomaniak. If DNS ever moves: turn DNSSEC off first, wait until the DS record is gone from the .ch registry plus 1 hour (TTL 3600), then switch nameservers.
- **Email records** (all DNS only, not proxied): MX `mta-gw.infomaniak.ch` (5), SPF `v=spf1 include:spf.infomaniak.ch -all`, DKIM `20261024._domainkey`, DMARC `v=DMARC1; p=reject;`, SRV for imap(s)/pop3(s)/submission(s) → `mail.infomaniak.com`, CNAME `autoconfig`/`autodiscover` → `infomaniak.com`. Infomaniak can no longer update these automatically: if it asks for new records (e.g. a new DKIM key), add them in Cloudflare.
- Other TXT: `google-site-verification=…` (Search Console), `_github-pages-challenge-josija-nydegger` (leftover, harmless).
- `www`: proxied AAAA `100::` as a placeholder; a zone Redirect Rule sends `www.josija-nydegger.ch/*` with 301 to `https://josija-nydegger.ch/*` (query string kept). "Always Use HTTPS" is on.
- Zone settings worth knowing: Email Obfuscation is on (Cloudflare would inject a script if a plain-text email address ever appeared in the HTML; this never happens because of `emailB64`). Bot Fight Mode is off.

## Cloudflare Workers (static assets)

- Worker `josija-nydegger` in the Cloudflare account, configured by `wrangler.jsonc`, **without Worker code** (no `main`): Cloudflare serves `dist/` as static assets.
- `html_handling: "auto-trailing-slash"`: `cv.html` is served at `/cv` (`/cv.html` → `/cv`), `folder/index.html` at `/folder/` (`/folder` and `/folder/index.html` → `/folder/`, each 307).
- `not_found_handling: "404-page"`: unknown URLs get `404.html` with status 404.
- `public/_redirects`: permanent 301 redirects for the former `.html` URLs (`/cv.html`, `/en/cv.html`, `/datenschutz.html`, `/en/privacy.html`, the two QR-tool pages). Cloudflare does not serve the file itself. New pages need no entry.
- Custom domain `josija-nydegger.ch` via `routes` with `custom_domain: true`.
- `workers_dev: false`: no public copy under `*.workers.dev`. `preview_urls: true`: version URLs for previews (see "Previews"), protected by Cloudflare Access.
- `observability` is on: Cloudflare can log requests for up to 7 days (mentioned on the privacy pages). Used only for troubleshooting.
- The Google verification file `google385c59b71b73dd03.html` is redirected (307) to `/google385c59b71b73dd03` with the same content; the DNS TXT record verifies the domain as well.

## Deployment

- `.github/workflows/deploy.yml`: on every push and pull request: `npm ci`, `npm run check`, `npm test`, `npm run build`. Only on `main`: `npx wrangler deploy`.
- Repo secrets: `CLOUDFLARE_API_TOKEN` (template "Edit Cloudflare Workers" plus Zone → DNS → Edit for `josija-nydegger.ch`) and `CLOUDFLARE_ACCOUNT_ID`.
- If a step fails, nothing is deployed and the previous version stays online.

## Previews

- Every pull request from a branch of this repo also runs `npx wrangler versions upload --preview-alias <branch>`: a new version is uploaded but not deployed. The alias is the branch name (lowercase, other characters → `-`, at most 40 characters), so each branch keeps the same URL: `https://<alias>-josija-nydegger.<account subdomain>.workers.dev`.
- The links are in the job summary of the Action run (PR → Checks → run → Summary). Deliberately not posted as a PR comment, so GitHub sends no email.
- **Cloudflare Access protects all version URLs** (dashboard: Workers & Pages → `josija-nydegger` → Settings → Domains & Routes → Version URLs → enable Cloudflare Access; policy: only the owner's email address). Sign-in with a one-time code by email, then valid for the session duration set in Access. Search engines cannot reach the previews, so no duplicate content. Without Access the previews would be public: never remove it.
- Umami does not count previews (`data-domains` allows only the own domain). Cloudflare is already the host, so the privacy pages need no change.
- Previews use the same build and the same routing as production.

## Testing like a browser

Cloudflare answers page requests from browsers (`Sec-Fetch-Mode: navigate`) differently from plain requests. Always test with browser headers:

```
curl -s -o /dev/null -w "%{http_code} %{redirect_url}\n" -H "Sec-Fetch-Mode: navigate" -H "Sec-Fetch-Dest: document" https://josija-nydegger.ch/tools/
```

Locally: `npm run build`, then `npx wrangler dev` (same routing as live). `node _tests/live-pruefung.js` checks the live site with these headers: all former URLs (directly or via redirect), the 301 redirects, Google file, `/en` → `/en/`, www, http → https, no copy on github.io, 404 page.

## GitHub

- Repo `josija-nydegger/josija-nydegger.ch` (until November 2026 `josija-nydegger.github.io`; GitHub redirects the old repo URL).
- GitHub Pages is **off** in this repo and in the repo QR-tool. URLs under `josija-nydegger.github.io` no longer exist (404).

## Lessons learned (November 2026 move)

- GitHub Pages also served other repos with Pages enabled under the custom domain (`/QR-tool/…`). Before any hosting change, list them: `gh api users/josija-nydegger/repos --paginate -q '.[] | select(.has_pages) | .name'`.
- With a Worker script and `not_found_handling: "404-page"`, browser navigation requests for folder URLs got 404 while curl got 200. Pure static assets avoid this; always test with browser headers.

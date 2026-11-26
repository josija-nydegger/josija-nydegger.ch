// Live-Website prüfen, z. B. nach einer Veröffentlichung oder Änderungen an Domain/DNS.
// Start: node _tests/live-pruefung.js   (braucht Internet)
// Ruft alle Adressen aus referenz/dateien.txt ab (Stand vor dem Wechsel zu Astro, dürfen nie verschwinden)
// und prüft Umleitungen, Google-Bestätigung und 404-Seite.
const fs = require('fs');
const path = require('path');

const SITE = 'https://josija-nydegger.ch';
// Adressen der Referenz, die bewusst entfallen sind (gleiche Liste wie in website.test.js)
const REMOVED = ['assets/katex/katex.min.js', 'assets/katex/contrib/auto-render.min.js'];

let fails = 0;
const ok = (name, cond, info) => { if (!cond) fails++; console.log((cond ? 'OK  ' : 'FAIL') + ' ' + name + (cond || info === undefined ? '' : ': ' + info)); };
// Wie ein Browser anfragen: Cloudflare behandelt Seitenaufrufe (Sec-Fetch-Mode: navigate) anders als andere Anfragen
const BROWSER = { 'Sec-Fetch-Mode': 'navigate', 'Sec-Fetch-Dest': 'document', 'Accept': 'text/html,*/*' };
const get = (url, opts = {}) => fetch(url, { redirect: 'manual', headers: BROWSER, ...opts });

(async () => {
  const rows = fs.readFileSync(path.join(__dirname, 'referenz', 'dateien.txt'), 'utf8').split('\n').filter(l => l && !l.startsWith('#')).map(l => l.split('\t'));
  // Frühere Adressen: direkt 200 oder über eine Weiterleitung (seite.html → /seite, ordner/index.html → /ordner/) auf 200
  for (const [url, file] of rows) {
    const res = await get(SITE + encodeURI(url));
    if (REMOVED.includes(file)) { ok('Bewusst entfernt (404): ' + url, res.status === 404, res.status); continue; }
    if (res.status === 200) { ok('200: ' + url, true); continue; }
    const to = res.headers.get('location');
    const end = to ? await get(new URL(to, SITE)) : null;
    ok(`${res.status} → ${to} → 200: ${url}`, [301, 307, 308].includes(res.status) && end?.status === 200, res.status + ' ' + to + ' ' + end?.status);
  }

  // Seiten ohne .html; die früheren Adressen leiten dauerhaft (301) weiter
  for (const p of ['/cv', '/en/cv', '/datenschutz', '/en/privacy', '/QR-tool/QR-Reader', '/QR-tool/QR-Streamer']) {
    ok('200: ' + p, (await get(SITE + p)).status === 200);
    const old = await get(SITE + p + '.html');
    ok(`${p}.html → 301 ${p}`, old.status === 301 && old.headers.get('location')?.replace(SITE, '') === p, old.status + ' ' + old.headers.get('location'));
  }
  // Google-Bestätigung: Cloudflare leitet auf die Adresse ohne .html weiter, dort derselbe Inhalt
  const google = await fetch(SITE + '/google385c59b71b73dd03.html', { headers: BROWSER });
  ok('Google-Bestätigung erreichbar', google.status === 200 && (await google.text()).trim() === 'google-site-verification: google385c59b71b73dd03.html');
  const en = await get(SITE + '/en');
  ok('/en → /en/', [301, 307, 308].includes(en.status) && en.headers.get('location')?.replace(SITE, '') === '/en/', en.status + ' ' + en.headers.get('location'));
  const www = await get('https://www.josija-nydegger.ch/');
  ok('www → ohne www', [301, 308].includes(www.status) && www.headers.get('location').startsWith(SITE + '/'), www.status + ' ' + www.headers.get('location'));
  const http = await get('http://josija-nydegger.ch/');
  ok('http → https', [301, 308].includes(http.status) && http.headers.get('location').startsWith('https://'), http.status + ' ' + http.headers.get('location'));
  const gh = await get('https://josija-nydegger.github.io/cv.html');
  ok('github.io → eigene Domain', gh.status === 301 && gh.headers.get('location') === SITE + '/cv.html', gh.status + ' ' + gh.headers.get('location'));
  const missing = await get(SITE + '/gibt-es-nicht/');
  ok('Unbekannte Adresse → eigene 404-Seite', missing.status === 404 && (await missing.text()).includes('PAGE NOT FOUND'));

  console.log(fails ? fails + ' FEHLER' : 'Live-Website in Ordnung');
  process.exitCode = fails ? 1 : 0;
})().catch(e => { console.error(e); process.exit(1); });

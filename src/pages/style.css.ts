// Frühere Adresse /style.css bleibt erhalten (steht in _tests/referenz/dateien.txt).
// Die Seiten selbst binden das Design über src/layouts/Base.astro ein: Astro legt es unter /_astro/ mit
// Prüfsumme im Namen ab, damit Browser es dauerhaft speichern dürfen (siehe public/_headers).
import css from '../styles/style.css?raw';

export const GET = () => new Response(css, { headers: { 'Content-Type': 'text/css; charset=utf-8' } });

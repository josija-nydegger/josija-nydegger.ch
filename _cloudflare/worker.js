// Kleiner Worker für Cloudflare Workers Static Assets.
// Dateien aus dist/ liefert Cloudflare direkt aus (ohne diesen Worker). Er läuft nur, wenn keine
// Datei genau passt, und bildet das Verhalten von GitHub Pages nach, damit alle Adressen bleiben:
//   /tools/  → tools/index.html      /tools → 301 auf /tools/      /cv → cv.html
//   alles andere → 404.html mit Status 404
// Nötig, weil html_handling "none" ist (die anderen Modi würden /cv.html auf /cv umleiten).
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const asset = async (pathname) => {
      const u = new URL(url);
      u.pathname = pathname;
      const res = await env.ASSETS.fetch(new Request(u, request));
      return res.status === 200 ? res : null;
    };

    if (url.pathname.endsWith('/')) {
      const res = await asset(url.pathname + 'index.html');
      if (res) return res;
    } else if (!url.pathname.split('/').pop().includes('.')) {
      if (await asset(url.pathname + '/index.html')) {
        url.pathname += '/';
        return Response.redirect(url.toString(), 301);
      }
      const res = await asset(url.pathname + '.html');
      if (res) return res;
    }
    // Sonst die Antwort der statischen Dateien, bei 404 mit der eigenen Seite 404.html
    // (not_found_handling ist "none", siehe wrangler.jsonc)
    const res = await env.ASSETS.fetch(request);
    if (res.status !== 404) return res;
    const page = await asset('/404.html');
    return page ? new Response(page.body, { status: 404, headers: page.headers }) : res;
  }
};

// Rechenkern für den interaktiven Balken auf der Startseite (reine Funktionen, ohne DOM).
// Einfacher Balken (Spannweite L) mit Gleichlast q über die ganze Länge und einer verschiebbaren Einzellast F bei x = a.
// Vorzeichen: Lasten nach unten positiv, Moment positiv bei Zug unten.

export type HeroBalken = {
  /** Spannweite in m */
  L: number;
  /** Gleichlast in kN/m */
  q: number;
  /** Einzellast in kN */
  F: number;
  /** Lage der Einzellast ab Auflager A in m */
  a: number;
};

export type HeroErgebnis = {
  /** Auflagerkräfte in kN */
  A: number;
  B: number;
  /** grösstes Feldmoment in kNm und seine Lage in m */
  Mmax: number;
  xMmax: number;
};

/** Einzellast auf die Spannweite beschränken */
export const clampA = (a: number, L: number) => Math.min(L, Math.max(0, a));

/** Auflagerkräfte, grösstes Moment und seine Lage */
export function berechne({ L, q, F, a: a0 }: HeroBalken): HeroErgebnis {
  if (!(L > 0)) throw new Error('Spannweite muss positiv sein');
  const a = clampA(a0, L);
  const B = (q * L * L) / 2 / L + (F * a) / L;
  const A = q * L + F - B;
  // Querkraft-Nullstelle: links der Last bei A/q, rechts bei (A-F)/q, sonst unter der Last
  let x: number;
  if (q > 0 && A / q < a) x = A / q;
  else if (q > 0 && (A - F) / q > a) x = (A - F) / q;
  else x = a;
  return { A, B, Mmax: moment({ L, q, F, a }, x), xMmax: x };
}

/** Biegemoment M(x) in kNm */
export function moment({ L, q, F, a: a0 }: HeroBalken, x: number): number {
  const a = clampA(a0, L);
  const A = q * L + F - ((q * L) / 2 + (F * a) / L);
  return A * x - (q * x * x) / 2 - (x > a ? F * (x - a) : 0);
}

/** Momentenlinie als n+1 Punkte [x, M] für die Zeichnung */
export function momentenlinie(b: HeroBalken, n = 60): [number, number][] {
  const pts: [number, number][] = [];
  for (let i = 0; i <= n; i++) {
    const x = (b.L * i) / n;
    pts.push([x, moment(b, x)]);
  }
  // Knick unter der Einzellast exakt mitnehmen
  const a = clampA(b.a, b.L);
  pts.push([a, moment(b, a)]);
  return pts.sort((p, r) => p[0] - r[0]);
}

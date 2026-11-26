// Zeichnungsgeometrie für den interaktiven Balken (SVG-Koordinaten, viewBox 0 0 1000 370).
// Wird beim Build (Ausgangslage ohne JavaScript) und im Browser (beim Ziehen) gleich verwendet.
import { berechne, momentenlinie, clampA, type HeroBalken } from './hero-balken';

export const VIEW = { w: 1000, h: 370 };
export const X0 = 70;
export const X1 = 930;
export const BEAM_Y = 150;
export const M_BASE = 222;
const M_DEPTH = 92;

export const BALKEN: Omit<HeroBalken, 'a'> = { L: 6, q: 4, F: 20 };
/** grösstmögliches Moment (Last in Feldmitte), damit die Skala beim Ziehen fest bleibt */
const M_SCALE = (BALKEN.q * BALKEN.L ** 2) / 8 + (BALKEN.F * BALKEN.L) / 4;

export const toPx = (x: number) => X0 + (x / BALKEN.L) * (X1 - X0);
export const toM = (px: number) => clampA(((px - X0) / (X1 - X0)) * BALKEN.L, BALKEN.L);
const mY = (m: number) => M_BASE + (m / M_SCALE) * M_DEPTH;

export function zeichnung(a: number) {
  const b = { ...BALKEN, a: clampA(a, BALKEN.L) };
  const r = berechne(b);
  const line = momentenlinie(b, 80).map(([x, m]) => `${toPx(x).toFixed(1)},${mY(m).toFixed(1)}`);
  const area = `M${X0},${M_BASE} L${line.join(' L')} L${X1},${M_BASE} Z`;
  const curve = `M${line.join(' L')}`;
  return {
    a: b.a,
    loadX: toPx(b.a),
    area,
    curve,
    peakX: toPx(r.xMmax),
    peakY: mY(r.Mmax),
    ...r
  };
}

/** Zahl im Format der Sprache: 42.7 bzw. 42.7 (Schweizer Punkt in beiden Sprachen) */
export const fmt = (v: number, digits = 1) => v.toFixed(digits);

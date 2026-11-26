// Interaktiver Balken der Startseite: src/lib/hero-balken.ts gegen Handrechnung.
// Start: node _tests/hero-balken.test.mjs
import { berechne, moment, momentenlinie } from '../src/lib/hero-balken.ts';

let fails = 0;
const chk = (name, got, exp, tol = 1e-9) => {
  const ok = Math.abs(got - exp) <= tol * Math.max(1, Math.abs(exp));
  if (!ok) fails++;
  console.log((ok ? 'OK  ' : 'FAIL') + ' ' + name + ': ' + +got.toPrecision(10) + ' (soll ' + exp + ')');
};

// Nur Einzellast in Feldmitte: A = B = F/2, M = FL/4
let r = berechne({ L: 6, q: 0, F: 20, a: 3 });
chk('F mittig: A', r.A, 10);
chk('F mittig: B', r.B, 10);
chk('F mittig: Mmax = FL/4', r.Mmax, 30);
chk('F mittig: Lage', r.xMmax, 3);

// Nur Gleichlast: M = qL²/8 in der Mitte
r = berechne({ L: 6, q: 4, F: 0, a: 1 });
chk('q: A = qL/2', r.A, 12);
chk('q: Mmax = qL²/8', r.Mmax, 18);
chk('q: Lage L/2', r.xMmax, 3);

// Einzellast exzentrisch: M = F a b / L
r = berechne({ L: 6, q: 0, F: 20, a: 2 });
chk('F bei a=2: A = F b/L', r.A, 20 * 4 / 6);
chk('F bei a=2: Mmax = F a b / L', r.Mmax, 20 * 2 * 4 / 6);

// Kombination, Maximum unter der Last: q=4, F=20, a=2 → A=12+13.33=25.33, V links von a = 25.33-8 > 0, rechts = 25.33-8-20 < 0
r = berechne({ L: 6, q: 4, F: 20, a: 2 });
chk('q+F: A', r.A, 12 + 40 / 3);
chk('q+F: B', r.B, 12 + 20 / 3);
chk('q+F: Lage unter der Last', r.xMmax, 2);
chk('q+F: Mmax = A·a − q a²/2', r.Mmax, (12 + 40 / 3) * 2 - 8);

// Kombination, Maximum ausserhalb der Last: q=4, F=2, a=0.5 → B = 12 + 1/6, Nullstelle rechts bei (A−F)/q
r = berechne({ L: 6, q: 4, F: 2, a: 0.5 });
const A = 24 + 2 - (12 + 2 * 0.5 / 6);
chk('q+F klein: Lage (A−F)/q', r.xMmax, (A - 2) / 4);
chk('q+F klein: Mmax = Maximum der Linie', r.Mmax, Math.max(...momentenlinie({ L: 6, q: 4, F: 2, a: 0.5 }, 2000).map(p => p[1])), 1e-6);

// Ränder und Gleichgewicht
chk('M(0) = 0', moment({ L: 6, q: 4, F: 20, a: 2 }, 0), 0);
chk('M(L) = 0', moment({ L: 6, q: 4, F: 20, a: 2 }, 6), 0, 1e-9);
r = berechne({ L: 6, q: 4, F: 20, a: 9 });
chk('Last über das Ende hinaus wird auf B begrenzt', r.B, 12 + 20);

console.log(fails ? `\n${fails} Fehler` : '\nAlle Prüfungen bestanden');
process.exit(fails ? 1 : 0);

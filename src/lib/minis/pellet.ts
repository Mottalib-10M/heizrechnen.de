/** Pelletheizung: gleiche Sätze wie die Wärmepumpe, ohne Absenkung ab 2027. */
import type { MiniSpec } from '../mini-types';
import { T, eur, pct, efh, altOpt, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Zuschuss für eine Pelletheizung', 'Grant for a pellet boiler'),
  cta: T(l, 'Mit Antragsdatum vergleichen', 'Compare by application date'),
  inputs: [
    { id: 'k', label: T(l, 'Kosten der Pelletheizung', 'Cost of the pellet boiler'), def: 30000, unit: '€', max: 500000 },
    { id: 'z', label: T(l, 'Zu versteuerndes Einkommen', 'Taxable household income'), def: 55000, unit: '€', max: 1000000 },
    { id: 'a', label: T(l, 'Heizung heute', 'Current heating'), def: 0, options: altOpt(l) },
  ],
  run: (v) => {
    const r = efh({ kosten: v.k, zve: v.z, altIdx: v.a, neu: 'biomasse' });
    return {
      head: [T(l, 'Zuschuss', 'Grant'), eur(r.zuschuss, l)],
      rows: [[T(l, 'Fördersatz', 'Grant rate'), pct(r.satzEigen, l)], [T(l, 'Eigenanteil', 'Your share'), eur(r.eigenanteil, l)]],
    };
  },
});

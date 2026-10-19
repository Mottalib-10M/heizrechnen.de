/** KfW 458: Zuschuss und Eigenanteil für ein selbst bewohntes Einfamilienhaus. */
import type { MiniSpec } from '../mini-types';
import { T, eur, pct, efh, altOpt, janein, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Zuschuss für Ihr Haus', 'Grant for your house'),
  cta: T(l, 'Mit Datum, Wohnungen und Heizkosten rechnen', 'Work it out with date, homes and running costs'),
  inputs: [
    { id: 'k', label: T(l, 'Kosten der Heizung', 'Cost of the system'), def: 32000, unit: '€', max: 500000 },
    { id: 'z', label: T(l, 'Zu versteuerndes Einkommen', 'Taxable household income'), def: 45000, unit: '€', max: 1000000 },
    { id: 'a', label: T(l, 'Heizung heute', 'Current heating'), def: 1, options: altOpt(l) },
    { id: 'c', label: T(l, 'Kind unter 18', 'Child under 18'), def: 0, options: janein(l) },
  ],
  run: (v) => {
    const r = efh({ kosten: v.k, zve: v.z, kind: v.c === 1, altIdx: v.a });
    return {
      head: [T(l, 'Zuschuss', 'Grant'), eur(r.zuschuss, l)],
      rows: [
        [T(l, 'Fördersatz', 'Grant rate'), pct(r.satzEigen, l)],
        [T(l, 'Förderfähige Kosten', 'Eligible costs'), eur(r.foerderfaehig, l)],
        [T(l, 'Eigenanteil', 'Your share'), eur(r.eigenanteil, l)],
      ],
      note: T(l, 'Antrag jetzt, Wärmepumpe, Richtlinie vom 17.08.2026.', 'Applying now, heat pump, guideline of 17 Aug 2026.'),
    };
  },
});

/** Heizungstausch: Nettokosten nach Zuschuss für alte Heizung und Einkommen. */
import type { MiniSpec } from '../mini-types';
import { T, eur, efh, altOpt, janein, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Ihr Heizungstausch nach Zuschuss', 'Your replacement after the grant'),
  cta: T(l, 'Mit Antragsdatum und Heizkosten', 'With application date and running costs'),
  inputs: [
    { id: 'k', label: T(l, 'Gesamtkosten mit Einbau', 'Total cost installed'), def: 34000, unit: '€', max: 500000 },
    { id: 'a', label: T(l, 'Heizung heute', 'Current heating'), def: 0, options: altOpt(l) },
    { id: 'z', label: T(l, 'Zu versteuerndes Einkommen', 'Taxable household income'), def: 42000, unit: '€', max: 1000000 },
    { id: 'c', label: T(l, 'Kind unter 18', 'Child under 18'), def: 0, options: janein(l) },
  ],
  run: (v) => {
    const r = efh({ kosten: v.k, zve: v.z, kind: v.c === 1, altIdx: v.a });
    return { head: [T(l, 'Sie zahlen', 'You pay'), eur(r.eigenanteil, l)], rows: [[T(l, 'Zuschuss', 'Grant'), eur(r.zuschuss, l)], [T(l, 'Förderfähig', 'Eligible'), eur(r.foerderfaehig, l)]] };
  },
});

/** Wärmepumpe: Kosten nach Zuschuss für Luft und Erdwärme bei Ihrem Einkommen. */
import type { MiniSpec } from '../mini-types';
import { T, eur, pct, efh, altOpt, type L } from './_kit';
export default (l: L, tag: string): MiniSpec => ({
  title: T(l, 'Was die Wärmepumpe Sie kostet', 'What the heat pump costs you'),
  cta: T(l, 'Mit Heizkosten und Amortisation', 'With running costs and payback'),
  inputs: [
    { id: 'k', label: T(l, 'Angebot brutto', 'Quote, gross'), def: 30000, unit: '€', max: 500000 },
    { id: 'z', label: T(l, 'Zu versteuerndes Einkommen', 'Taxable household income'), def: 52000, unit: '€', max: 1000000 },
    { id: 'a', label: T(l, 'Heizung heute', 'Current heating'), def: 1, options: altOpt(l) },
  ],
  run: (v) => {
    const r = efh({ kosten: v.k, zve: v.z, altIdx: v.a, antrag: tag });
    return {
      head: [T(l, 'Kosten nach Zuschuss', 'Cost after the grant'), eur(r.eigenanteil, l)],
      rows: [[T(l, 'Zuschuss', 'Grant'), eur(r.zuschuss, l)], [T(l, 'Fördersatz', 'Rate'), pct(r.satzEigen, l)], [T(l, 'Über dem Höchstbetrag', 'Above the cap'), eur(Math.max(0, v.k - r.foerderfaehig), l)]],
    };
  },
});

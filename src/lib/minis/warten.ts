/** Klimageschwindigkeitsbonus: Zuschuss nach Antragsdatum, Stufen bis 2028. */
import type { MiniSpec } from '../mini-types';
import { T, eur, pct, efh, altOpt, terminOpt, termin, TERMINE, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Antrag jetzt oder später?', 'Apply now or later?'),
  cta: T(l, 'Ihr Datum im großen Rechner', 'Your date in the full calculator'),
  inputs: [
    { id: 't', label: T(l, 'Antrag am', 'Application on'), def: 1, options: terminOpt(l) },
    { id: 'k', label: T(l, 'Kosten der Heizung', 'Cost of the system'), def: 30000, unit: '€', max: 500000 },
    { id: 'a', label: T(l, 'Heizung heute', 'Current heating'), def: 0, options: altOpt(l) },
  ],
  run: (v) => {
    const jetzt = efh({ kosten: v.k, zve: 80000, altIdx: v.a, antrag: TERMINE[0] });
    const spaet = efh({ kosten: v.k, zve: 80000, altIdx: v.a, antrag: termin(v.t) });
    return {
      head: [T(l, 'Zuschuss an diesem Tag', 'Grant on that date'), eur(spaet.zuschuss, l)],
      rows: [
        [T(l, 'Klimageschwindigkeitsbonus', 'Climate speed bonus'), pct(spaet.kgbSatz, l)],
        [T(l, 'Bei Antrag jetzt', 'If you apply now'), eur(jetzt.zuschuss, l)],
        [T(l, 'Warten kostet', 'Waiting costs'), eur(jetzt.zuschuss - spaet.zuschuss, l)],
      ],
      note: T(l, 'Einkommen über 50.000 €, also ohne Einkommensbonus.', 'Income above €50,000, so no income bonus.'),
    };
  },
});

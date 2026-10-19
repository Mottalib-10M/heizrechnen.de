/** Ölheizung weiter betreiben: CO₂-Kosten im Jahr gegen den Zuschuss beim Wechsel jetzt. */
import type { MiniSpec } from '../mini-types';
import { co2Kosten } from '../engine/co2';
import { P } from '../engine/params';
import { T, eur, efh, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Ölheizung behalten oder wechseln', 'Keep the oil boiler or switch'),
  cta: T(l, 'Zuschuss mit Ihrem Datum berechnen', 'Work out the grant for your date'),
  inputs: [
    { id: 'q', label: T(l, 'Heizöl im Jahr', 'Oil a year'), def: 2200, unit: 'l', max: 100000 },
    { id: 'k', label: T(l, 'Angebot Wärmepumpe', 'Heat pump quote'), def: 32000, unit: '€', max: 500000 },
  ],
  run: (v) => {
    const r = efh({ kosten: v.k, zve: 80000, altIdx: 0 });
    return {
      head: [T(l, 'Zuschuss beim Wechsel jetzt', 'Grant if you switch now'), eur(r.zuschuss, l)],
      rows: [[T(l, `CO₂ im Jahr bei ${P.co2.auktion_2026_durchschnitt} €/t`, `CO₂ a year at €${P.co2.auktion_2026_durchschnitt}/t`), eur(co2Kosten('oel', v.q, P.co2.auktion_2026_durchschnitt), l)], [T(l, 'Heizöl im Jahr (12-Monats-Schnitt)', 'Oil a year (12-month average)'), eur((Math.max(v.q, 0) * P.preise.oel_eur_100l_12monate) / 100, l)]],
      note: T(l, 'Weiterbetrieb erlaubt: Eine Austauschpflicht nach 30 Jahren gibt es seit dem 29.07.2026 nicht mehr.', 'Running it is allowed: the 30-year replacement duty ended on 29 July 2026.'),
    };
  },
});

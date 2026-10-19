/** Effizienzbonus: alte Richtlinie (bis 20.07.2026) gegen die neue für denselben Fall. */
import type { MiniSpec } from '../mini-types';
import { foerderung } from '../engine/foerderung';
import { P } from '../engine/params';
import { T, eur, pct, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Alte und neue Förderung im Vergleich', 'Old and new grant compared'),
  cta: T(l, 'Mit Ihren Zahlen rechnen', 'Use your own figures'),
  inputs: [
    { id: 'k', label: T(l, 'Kosten der Wärmepumpe', 'Heat pump cost'), def: 35000, unit: '€', max: 500000 },
    { id: 'z', label: T(l, 'Zu versteuerndes Einkommen', 'Taxable household income'), def: 60000, unit: '€', max: 1000000 },
  ],
  run: (v) => {
    const base = { gebaeude: 'efh' as const, einheiten: 1, kosten: v.k, selbstnutzer: true, alt: 'oel' as const, altJahre: 25, neu: 'wp' as const, wpEU: true, zve: v.z, kind: false };
    const alt = foerderung({ ...base, antrag: P.foerderung.alt.bis, effizienz: true });
    const neu = foerderung({ ...base, antrag: P.retrieved_at });
    return {
      head: [T(l, 'Unterschied', 'Difference'), eur(neu.zuschuss - alt.zuschuss, l)],
      rows: [
        [T(l, 'Bis 20.07.2026, mit Effizienzbonus', 'Up to 20 July 2026, with efficiency bonus'), `${eur(alt.zuschuss, l)} (${pct(alt.satzEigen, l)})`],
        [T(l, 'Heute, ohne Effizienzbonus', 'Today, no efficiency bonus'), `${eur(neu.zuschuss, l)} (${pct(neu.satzEigen, l)})`],
      ],
      note: T(l, 'Ölheizung ersetzt, Erdwärme oder natürliches Kältemittel im alten Fall.', 'Oil boiler replaced; ground source or natural refrigerant in the old case.'),
    };
  },
});

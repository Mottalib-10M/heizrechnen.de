/** Vermieter: Grundförderung je Haus, Boni nur für die selbst bewohnte Wohnung. */
import type { MiniSpec } from '../mini-types';
import { foerderung } from '../engine/foerderung';
import { P } from '../engine/params';
import { T, eur, pct, janein, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Zuschuss für ein vermietetes Haus', 'Grant for a let building'),
  cta: T(l, 'Mit allen Angaben rechnen', 'Calculate with every detail'),
  inputs: [
    { id: 'n', label: T(l, 'Wohnungen im Haus', 'Flats in the building'), def: 4, max: 200, plain: true },
    { id: 'k', label: T(l, 'Kosten der Heizung', 'Cost of the system'), def: 60000, unit: '€', max: 2000000 },
    { id: 's', label: T(l, 'Eine Wohnung bewohnen Sie selbst', 'You live in one flat'), def: 0, options: janein(l) },
  ],
  run: (v) => {
    const n = Math.max(2, Math.round(v.n) || 2);
    const r = foerderung({ antrag: P.retrieved_at, gebaeude: 'mfh', einheiten: n, kosten: v.k, selbstnutzer: v.s === 1, alt: 'gas', altJahre: 25, neu: 'wp', wpEU: true, zve: 60000, kind: false });
    return {
      head: [T(l, 'Zuschuss', 'Grant'), eur(r.zuschuss, l)],
      rows: [
        [T(l, 'Höchstbetrag des Hauses', 'Cap for the building'), eur(r.hoechstbetrag, l)],
        [T(l, 'Grundförderung', 'Basic grant'), `${pct(r.grundSatz, l)} · ${eur(r.grund, l)}`],
        [T(l, 'Bonus eigene Wohnung', 'Bonus, your own flat'), eur(r.bonus, l)],
      ],
      note: T(l, 'Bonus mit Gasheizung ab 20 Jahren, Einkommen 60.000 €.', 'Bonus assumes a gas boiler of 20+ years and €60,000 income.'),
    };
  },
});

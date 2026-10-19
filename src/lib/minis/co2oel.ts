/** CO₂-Preis auf Heizöl: Aufschlag je Liter und im Jahr. */
import type { MiniSpec } from '../mini-types';
import { co2Kosten, aufschlagCent } from '../engine/co2';
import { P } from '../engine/params';
import { T, eur, num, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'CO₂-Aufschlag auf Ihr Heizöl', 'CO₂ surcharge on your heating oil'),
  cta: T(l, 'Ganze CO₂-Rechnung je Jahr', 'Full CO₂ cost by year'),
  inputs: [
    { id: 'q', label: T(l, 'Heizöl im Jahr', 'Oil a year'), def: 2000, unit: 'l', max: 100000 },
    { id: 'p', label: T(l, 'CO₂-Preis je Tonne', 'CO₂ price per tonne'), def: P.co2.auktion_2026_durchschnitt, unit: '€', max: 500 },
  ],
  run: (v) => ({
    head: [T(l, 'CO₂-Kosten im Jahr', 'CO₂ cost a year'), eur(co2Kosten('oel', v.q, v.p), l)],
    rows: [[T(l, 'Je Liter mit MwSt.', 'Per litre incl. VAT'), `${num(aufschlagCent('oel', v.p), l, 1)} ct`], [T(l, 'Je 1.000 Liter', 'Per 1,000 litres'), eur(co2Kosten('oel', 1000, v.p), l)]],
  }),
});

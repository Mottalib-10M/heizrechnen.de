/** Gaspreis: Jahreskosten zum Durchschnittspreis, darin der CO₂-Anteil. */
import type { MiniSpec } from '../mini-types';
import { co2Kosten } from '../engine/co2';
import { P } from '../engine/params';
import { T, eur, num, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Ihre Gaskosten im Jahr', 'Your gas cost a year'),
  cta: T(l, 'Mit einer Wärmepumpe vergleichen', 'Compare with a heat pump'),
  inputs: [
    { id: 'g', label: T(l, 'Gasverbrauch laut Rechnung', 'Gas use on your bill'), def: 18000, unit: 'kWh', max: 300000 },
    { id: 'p', label: T(l, 'Ihr Arbeitspreis, falls bekannt', 'Your unit price, if known'), def: 0, unit: 'ct', max: 60, decimals: 2 },
  ],
  run: (v) => {
    const g = Math.max(v.g, 0), ct = v.p > 0 ? v.p : P.preise.gas_ct;
    return {
      head: [T(l, 'Kosten im Jahr', 'Cost a year'), eur((g * ct) / 100, l)],
      rows: [[T(l, 'Preis', 'Price'), `${num(ct, 2)} ct/kWh`], [T(l, `Darin CO₂ bei ${P.co2.auktion_2026_durchschnitt} €/t`, `Of which CO₂ at €${P.co2.auktion_2026_durchschnitt}/t`), eur(co2Kosten('gas', g, P.co2.auktion_2026_durchschnitt), l)], [T(l, 'Im Monat', 'A month'), eur((g * ct) / 1200, l)]],
      note: T(l, `Ohne eigenen Preis: Durchschnitt der Haushalte im ${P.preise.gas_stand} (Destatis), Grundpreis eingerechnet.`, 'Without your own price: household average for the first half of 2026 (Destatis), standing charge included.'),
    };
  },
});

/** Fernwärme: eigener Preis gegen Gas und Wärmepumpe für dieselbe Wärme. */
import type { MiniSpec } from '../mini-types';
import { laufend } from '../engine/heizkosten';
import { T, eur, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Ihr Fernwärmepreis im Vergleich', 'Your district heating price compared'),
  cta: T(l, 'Alle Heizungen vergleichen', 'Compare every system'),
  inputs: [
    { id: 'q', label: T(l, 'Wärme laut Abrechnung', 'Heat on your bill'), def: 12000, unit: 'kWh', max: 300000 },
    { id: 'p', label: T(l, 'Gesamtpreis je kWh', 'All-in price per kWh'), def: 15, unit: 'ct', max: 60, decimals: 2 },
  ],
  run: (v) => {
    const q = Math.max(v.q, 0);
    const g = laufend('gas', q)!, w = laufend('wp_luft', q)!;
    return {
      head: [T(l, 'Fernwärme im Jahr', 'District heating a year'), eur((q * v.p) / 100, l)],
      rows: [[T(l, 'Dieselbe Wärme mit Gas', 'Same heat from gas'), eur(g.kosten, l)], [T(l, 'Mit Luft-Wärmepumpe', 'From an air heat pump'), eur(w.kosten, l)]],
      note: T(l, 'Der Preis von 15 ct ist nur ein Startwert: Tragen Sie Arbeits- und Grundpreis aus Ihrer Abrechnung ein.', 'The 15 ct price is only a starting value: enter unit and standing charges from your bill.'),
    };
  },
});

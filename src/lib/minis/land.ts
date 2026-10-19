/** Heizkosten je Bundesland: gleiche Wohnung, anderes Klima (Gradtagzahl des DWD). */
import type { MiniSpec } from '../mini-types';
import { nutzwaerme, laufend, gradtage, LAENDER } from '../engine/heizkosten';
import { T, eur, num, type L } from './_kit';
const EN: Record<string, string> = { Bayern: 'Bavaria', Hessen: 'Hesse', 'Mecklenburg-Vorpommern': 'Mecklenburg-W. Pomerania', Niedersachsen: 'Lower Saxony', 'Nordrhein-Westfalen': 'North Rhine-Westphalia', 'Rheinland-Pfalz': 'Rhineland-Palatinate', Sachsen: 'Saxony', 'Sachsen-Anhalt': 'Saxony-Anhalt', Thüringen: 'Thuringia' };
export default (l: L): MiniSpec => ({
  title: T(l, 'Heizkosten in Ihrem Bundesland', 'Heating cost in your state'),
  cta: T(l, 'Mit Ihrer Heizung und Ihren Preisen', 'With your system and prices'),
  inputs: [
    { id: 'l', label: T(l, 'Bundesland', 'Federal state'), def: 1, options: LAENDER.map((x, i) => ({ value: String(i), label: l === 'en' ? EN[x] ?? x : x })) },
    { id: 'm', label: T(l, 'Wohnfläche', 'Living space'), def: 140, unit: 'm²', max: 2000 },
  ],
  run: (v) => {
    const land = LAENDER[Math.min(Math.max(Math.round(v.l) || 0, 0), LAENDER.length - 1)];
    const q = nutzwaerme({ flaeche: v.m, klasse: 'E', land });
    const g = laufend('gas', q)!, w = laufend('wp_luft', q)!;
    return { head: [T(l, 'Wärmepumpe im Jahr', 'Heat pump a year'), eur(w.kosten, l)], rows: [[T(l, 'Gasheizung im Jahr', 'Gas boiler a year'), eur(g.kosten, l)], [T(l, 'Gradtagzahl (DWD)', 'Degree days (DWD)'), num(gradtage(land), l)], [T(l, 'Wärmebedarf', 'Heat demand'), `${num(q, l)} kWh`]], note: T(l, 'Effizienzklasse E, Preise 2026.', 'Efficiency class E, 2026 prices.') };
  },
});

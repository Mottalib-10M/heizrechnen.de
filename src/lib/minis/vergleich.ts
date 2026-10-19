/** Heizkostenvergleich: alle Heizungen für Wohnfläche und Effizienzklasse. */
import type { MiniSpec } from '../mini-types';
import { nutzwaerme, vergleich, KLASSEN } from '../engine/heizkosten';
import { T, eur, type L } from './_kit';
const NAME = (s: string, l: L) => ({ gas: T(l, 'Gas', 'Gas'), oel: T(l, 'Heizöl', 'Oil'), wp_luft: T(l, 'Luft-Wärmepumpe', 'Air heat pump'), wp_sole: T(l, 'Erdwärmepumpe', 'Ground heat pump'), nachtspeicher: T(l, 'Nachtspeicher', 'Storage heaters'), fernwaerme: T(l, 'Fernwärme', 'District heating') } as Record<string, string>)[s];
export default (l: L): MiniSpec => ({
  title: T(l, 'Heizkosten im Vergleich', 'Heating costs compared'),
  cta: T(l, 'Mit Bundesland und eigenen Preisen', 'With your state and own prices'),
  inputs: [
    { id: 'm', label: T(l, 'Wohnfläche', 'Living space'), def: 120, unit: 'm²', max: 2000 },
    { id: 'k', label: T(l, 'Effizienzklasse', 'Efficiency class'), def: 5, options: KLASSEN.map((k, i) => ({ value: String(i), label: k })) },
  ],
  run: (v) => {
    const k = KLASSEN[Math.min(Math.max(Math.round(v.k) || 0, 0), KLASSEN.length - 1)];
    const q = nutzwaerme({ flaeche: v.m, klasse: k, land: 'Niedersachsen' });
    const li = vergleich(q);
    return { head: [T(l, `Günstigste: ${NAME(li[0].system, l)}`, `Cheapest: ${NAME(li[0].system, l)}`), eur(li[0].kosten, l)], rows: li.slice(1).map((x) => [NAME(x.system, l), eur(x.kosten, l)] as [string, string]), note: T(l, 'Kosten im Jahr, Klima Niedersachsen, Preise 2026.', 'Cost a year, Lower Saxony climate, 2026 prices.') };
  },
});

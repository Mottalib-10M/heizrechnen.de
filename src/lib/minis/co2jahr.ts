/** CO₂-Preis 2027: Kosten 2026 und 2027 im Korridor, dazu ein eigenes Szenario ab 2028 (ETS2). */
import type { MiniSpec } from '../mini-types';
import { co2Kosten, preisJahr, type Brennstoff } from '../engine/co2';
import { T, eur, type L } from './_kit';
const STOFF: Brennstoff[] = ['gas', 'oel'];
export default (l: L): MiniSpec => ({
  title: T(l, 'CO₂-Kosten 2026, 2027 und danach', 'CO₂ cost in 2026, 2027 and after'),
  cta: T(l, 'Alle Jahre im CO₂-Rechner', 'Every year in the CO₂ calculator'),
  inputs: [
    { id: 's', label: T(l, 'Brennstoff', 'Fuel'), def: 0, options: [{ value: '0', label: T(l, 'Erdgas (kWh)', 'Gas (kWh)') }, { value: '1', label: T(l, 'Heizöl (Liter)', 'Oil (litres)') }] },
    { id: 'q', label: T(l, 'Verbrauch im Jahr', 'Used a year'), def: 20000, max: 500000 },
    { id: 'p', label: T(l, 'Szenario ab 2028, €/t', 'Scenario from 2028, €/t'), def: 100, unit: '€', max: 500 },
  ],
  run: (v) => {
    const s = STOFF[v.s === 1 ? 1 : 0], q = Math.max(v.q, 0);
    const a = preisJahr(2026), b = preisJahr(2027);
    return {
      head: [T(l, '2027, beschlossen, nicht in Kraft', '2027, passed, not in force'), `${eur(co2Kosten(s, q, b.min), l)} ${T(l, 'bis', 'to')} ${eur(co2Kosten(s, q, b.max), l)}`],
      rows: [[`2026 (${a.min} ${T(l, 'bis', 'to')} ${a.max} €/t)`, `${eur(co2Kosten(s, q, a.min), l)} ${T(l, 'bis', 'to')} ${eur(co2Kosten(s, q, a.max), l)}`], [T(l, `Ihr Szenario 2028 (${v.p} €/t)`, `Your 2028 scenario (€${v.p}/t)`), eur(co2Kosten(s, q, v.p), l)]],
      note: T(l, 'Mit Mehrwertsteuer. Für 2028 gibt es keinen festen Preis: Der Wert ist Ihre Annahme.', 'VAT included. There is no fixed price for 2028: the value is your assumption.'),
    };
  },
});

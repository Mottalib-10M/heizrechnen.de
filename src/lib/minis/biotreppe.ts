/** Heizungsgesetz, § 43 GModG: Pflichtanteil klimafreundlicher Brennstoffe einer neuen Gas- oder Ölheizung. */
import type { MiniSpec } from '../mini-types';
import { P } from '../engine/params';
import { T, eur, pct, num, type L } from './_kit';
const ST = P.gesetz.biotreppe;
export default (l: L): MiniSpec => ({
  title: T(l, 'Pflichtanteil Ihrer neuen Gasheizung', 'Required share for your new gas boiler'),
  cta: T(l, 'Gas gegen Wärmepumpe rechnen', 'Compare gas and a heat pump'),
  inputs: [
    { id: 'j', label: T(l, 'Ab dem Jahr', 'From the year'), def: 1, options: ST.map((s, i) => ({ value: String(i), label: s.ab.slice(0, 4) })) },
    { id: 'g', label: T(l, 'Gasverbrauch im Jahr', 'Gas used a year'), def: 18000, unit: 'kWh', max: 300000 },
    { id: 'a', label: T(l, 'Ihr Aufpreis für Biomethan', 'Your biomethane premium'), def: 0, unit: 'ct', max: 50, decimals: 1 },
  ],
  run: (v) => {
    const s = ST[Math.min(Math.max(Math.round(v.j) || 0, 0), ST.length - 1)];
    const bio = Math.max(v.g, 0) * s.anteil;
    return {
      head: [T(l, `Pflichtanteil ab ${s.ab.slice(0, 4)}`, `Required from ${s.ab.slice(0, 4)}`), pct(s.anteil, l)],
      rows: [[T(l, 'Grünes Gas im Jahr', 'Green gas a year'), `${num(bio, l)} kWh`], [T(l, 'Mehrkosten bei Ihrem Aufpreis', 'Extra cost at your premium'), v.a > 0 ? eur((bio * v.a) / 100, l) : T(l, 'Aufpreis eintragen', 'enter a premium')]],
      note: T(l, 'Gilt für Gas-, Öl- und Flüssiggasheizungen, die nach dem 29.07.2026 eingebaut werden.', 'Applies to gas, oil and LPG boilers installed after 29 July 2026.'),
    };
  },
});

/** Effizienzklasse nach Anlage 10 GModG aus dem Energiekennwert, dazu der Strombedarf einer Wärmepumpe. */
import type { MiniSpec } from '../mini-types';
import { P } from '../engine/params';
import { T, num, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Ihre Effizienzklasse', 'Your efficiency class'),
  cta: T(l, 'Stromverbrauch der Wärmepumpe berechnen', 'Work out heat pump electricity'),
  inputs: [
    { id: 'e', label: T(l, 'Endenergie laut Energieausweis', 'Final energy on the certificate'), def: 145, unit: 'kWh/m²', max: 600 },
    { id: 'm', label: T(l, 'Wohnfläche', 'Living space'), def: 130, unit: 'm²', max: 2000 },
  ],
  run: (v) => {
    const k = P.gesetz.effizienzklassen.find((x) => x.bis === null || v.e <= x.bis)!;
    const strom = (Math.max(v.e, 0) * Math.max(v.m, 0) * P.annahmen.nutzungsgrad_kessel) / P.technik.jaz_luft_messung;
    return {
      head: [T(l, 'Klasse', 'Class'), k.k],
      rows: [[T(l, 'Endenergie im Jahr', 'Final energy a year'), `${num(v.e * v.m, l)} kWh`], [T(l, 'Strom einer Luft-Wärmepumpe', 'Air heat pump electricity'), `${num(strom, l)} kWh`]],
      note: T(l, 'Referenzklima, ohne Korrektur für Ihr Bundesland.', 'Reference climate, not adjusted for your state.'),
    };
  },
});

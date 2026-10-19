/** Wärmepumpentarif: Ersparnis eines eigenen Zählers gegen Haushaltsstrom, abzüglich Zählerkosten. */
import type { MiniSpec } from '../mini-types';
import { P } from '../engine/params';
import { T, eur, num, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Lohnt sich der eigene Zähler?', 'Is a separate meter worth it?'),
  cta: T(l, 'Stromverbrauch Ihrer Wärmepumpe berechnen', 'Work out your heat pump’s power use'),
  inputs: [
    { id: 'k', label: T(l, 'Stromverbrauch der Wärmepumpe', 'Heat pump electricity use'), def: 4500, unit: 'kWh', max: 100000 },
    { id: 'z', label: T(l, 'Zusatzkosten Zähler im Jahr', 'Extra meter cost a year'), def: 0, unit: '€', max: 2000 },
  ],
  run: (v) => {
    const k = Math.max(v.k, 0), p = P.preise;
    const ers = (k * (p.strom_haushalt_ct - p.wp_strom_getrennt_ct)) / 100 - Math.max(v.z, 0);
    return {
      head: [T(l, 'Ersparnis im Jahr', 'Saving a year'), eur(ers, l)],
      rows: [[T(l, 'Preisabstand', 'Price gap'), `${num(p.strom_haushalt_ct - p.wp_strom_getrennt_ct, 2)} ct/kWh`], [T(l, 'Ab diesem Verbrauch lohnt es sich', 'Worth it from'), `${num(v.z > 0 ? (v.z * 100) / (p.strom_haushalt_ct - p.wp_strom_getrennt_ct) : 0, l)} kWh`]],
      note: T(l, 'Tragen Sie Einbau und Grundpreis des zweiten Zählers aus dem Angebot Ihres Netzbetreibers ein.', 'Enter fitting and standing charge of the second meter from your network operator’s quote.'),
    };
  },
});

/** Strompreis der Wärmepumpe: derselbe Verbrauch zu drei Tarifen. */
import type { MiniSpec } from '../mini-types';
import { P } from '../engine/params';
import { T, eur, num, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Was Ihr Wärmepumpenstrom kostet', 'What your heat pump power costs'),
  cta: T(l, 'Verbrauch aus Haus und Klima berechnen', 'Work out use from house and climate'),
  inputs: [{ id: 'k', label: T(l, 'Stromverbrauch der Wärmepumpe', 'Heat pump electricity use'), def: 4500, unit: 'kWh', max: 100000 }],
  run: (v) => {
    const k = Math.max(v.k, 0), p = P.preise;
    return {
      head: [T(l, 'Mit eigenem Zähler', 'With a separate meter'), eur((k * p.wp_strom_getrennt_ct) / 100, l)],
      rows: [[T(l, `Ein Zähler (${num(p.wp_strom_gemeinsam_ct, 2)} ct)`, `Shared meter (${num(p.wp_strom_gemeinsam_ct, 2)} ct)`), eur((k * p.wp_strom_gemeinsam_ct) / 100, l)], [T(l, `Haushaltsstrom (${num(p.strom_haushalt_ct, 2)} ct)`, `Household power (${num(p.strom_haushalt_ct, 2)} ct)`), eur((k * p.strom_haushalt_ct) / 100, l)]],
      note: T(l, 'Durchschnittspreise mit Grundpreis: Bundesnetzagentur (April 2025), Destatis (1. Halbjahr 2026).', 'Average all-in prices: Federal Network Agency (April 2025), Federal Statistical Office (first half of 2026).'),
    };
  },
});

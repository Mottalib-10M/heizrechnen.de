/** Wärmepumpe oder Gasheizung: Jahreskosten aus dem heutigen Gasverbrauch, mit CO₂-Szenario. */
import type { MiniSpec } from '../mini-types';
import { nutzwaerme, laufend, co2Mehrkosten } from '../engine/heizkosten';
import { P } from '../engine/params';
import { T, eur, num, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Gas oder Wärmepumpe im Jahr', 'Gas or heat pump, per year'),
  cta: T(l, 'Mit Zuschuss und Amortisation', 'With grant and payback'),
  inputs: [
    { id: 'g', label: T(l, 'Gasverbrauch laut Rechnung', 'Gas use on your bill'), def: 20000, unit: 'kWh', max: 200000 },
    { id: 'p', label: T(l, 'CO₂-Preis je Tonne', 'CO₂ price per tonne'), def: P.co2.auktion_2026_durchschnitt, unit: '€', max: 500 },
  ],
  run: (v) => {
    const q = nutzwaerme({ verbrauch: Math.max(v.g, 0), heute: 'gas', land: 'Hessen' });
    const g = laufend('gas', q)!, w = laufend('wp_luft', q)!;
    const gas = g.kosten + co2Mehrkosten(g.co2, v.p);
    return {
      head: [T(l, 'Wärmepumpe spart im Jahr', 'Heat pump saves a year'), eur(gas - w.kosten, l)],
      rows: [[T(l, 'Gasheizung', 'Gas boiler'), eur(gas, l)], [T(l, 'Wärmepumpe', 'Heat pump'), eur(w.kosten, l)], [T(l, 'Strom der Wärmepumpe', 'Heat pump electricity'), `${num(w.menge, l)} kWh`]],
      note: T(l, `Gas ${num(P.preise.gas_ct, 2)} ct, Wärmepumpenstrom ${num(P.preise.wp_strom_getrennt_ct, 2)} ct, JAZ ${num(P.technik.jaz_luft_messung, 1)}.`, `Gas ${num(P.preise.gas_ct, 2)} ct, heat pump power ${num(P.preise.wp_strom_getrennt_ct, 2)} ct, SPF ${num(P.technik.jaz_luft_messung, 1)}.`),
    };
  },
});

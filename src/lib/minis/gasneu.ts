/** Gasheizung „Verbot“: was für eine neue Gasheizung ab dem Einbau gilt, Jahr für Jahr. */
import type { MiniSpec } from '../mini-types';
import { P } from '../engine/params';
import { T, pct, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Regeln für Ihre neue Gasheizung', 'Rules for your new gas boiler'),
  cta: T(l, 'Gas und Wärmepumpe im Jahr vergleichen', 'Compare gas and heat pump per year'),
  inputs: [{ id: 'j', label: T(l, 'Jahr', 'Year'), def: 2030, max: 2045, plain: true }],
  run: (v) => {
    const j = Math.min(Math.max(Math.round(v.j) || 2030, 2026), 2045);
    let a = 0; for (const s of P.gesetz.biotreppe) if (j >= Number(s.ab.slice(0, 4))) a = s.anteil;
    const vermieter = j >= Number(P.aufteilung.neue_fossile_heizung_ab.slice(0, 4));
    return {
      head: [T(l, `Grünes Gas ${j} mindestens`, `Green gas in ${j}, at least`), pct(a, l)],
      rows: [[T(l, 'Einbau erlaubt', 'Installation allowed'), T(l, 'ja (§ 42 GModG)', 'yes (section 42 GModG)')], [T(l, 'CO₂ bei Vermietung hälftig', 'CO₂ split 50/50 if let'), vermieter ? T(l, 'ja', 'yes') : T(l, 'noch nicht', 'not yet')], [T(l, 'Klimaneutral ab', 'Climate neutral by'), String(P.gesetz.klimaneutral_ab)]],
      note: T(l, 'Für Gasheizungen, die nach dem 29.07.2026 eingebaut werden.', 'For gas boilers installed after 29 July 2026.'),
    };
  },
});

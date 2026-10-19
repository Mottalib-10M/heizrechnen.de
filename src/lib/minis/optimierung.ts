/** Heizungsoptimierung beim BAFA: 15 % der förderfähigen Ausgaben. */
import type { MiniSpec } from '../mini-types';
import { P } from '../engine/params';
import { T, eur, pct, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Zuschuss für die Optimierung', 'Grant for optimising'),
  cta: T(l, 'Oder gleich den Heizungstausch rechnen', 'Or work out a full replacement'),
  inputs: [
    { id: 'k', label: T(l, 'Kosten, z. B. hydraulischer Abgleich', 'Cost, e.g. hydraulic balancing'), def: 1800, unit: '€', max: 100000 },
    { id: 'n', label: T(l, 'Wohnungen im Haus', 'Homes in the building'), def: 1, max: P.bafa.optimierung_max_we, plain: true },
  ],
  run: (v) => {
    const B = P.bafa, n = Math.min(Math.max(Math.round(v.n) || 1, 1), B.optimierung_max_we);
    const cap = B.hoechst_erste_we + P.foerderung.hoechst_we_2_bis_6 * (n - 1);
    const f = Math.min(Math.max(v.k, 0), cap);
    const ok = v.k >= P.foerderung.mindestinvestition;
    return {
      head: [T(l, 'Zuschuss', 'Grant'), eur(ok ? f * B.optimierung : 0, l)],
      rows: [[T(l, 'Fördersatz', 'Rate'), pct(B.optimierung, l)], [T(l, 'Höchstbetrag förderfähig', 'Eligible cap'), eur(cap, l)], [T(l, 'Mindestbetrag', 'Minimum spend'), eur(P.foerderung.mindestinvestition, l)]],
      note: T(l, 'Fossile Kessel höchstens 20 Jahre alt; Haus mit bis zu fünf Wohnungen.', 'Fossil boilers at most 20 years old; buildings with up to five homes.'),
    };
  },
});

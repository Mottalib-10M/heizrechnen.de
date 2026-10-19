/** Einkommensbonus: Stufe nach zu versteuerndem Haushaltseinkommen, Familienzuschlag und Deckel. */
import type { MiniSpec } from '../mini-types';
import { ebSatz, deckel } from '../engine/foerderung';
import { P } from '../engine/params';
import { T, eur, pct, efh, janein, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Ihr Einkommensbonus', 'Your income bonus'),
  cta: T(l, 'Ganzen Zuschuss berechnen', 'Work out the full grant'),
  inputs: [
    { id: 'z', label: T(l, 'Zu versteuerndes Einkommen (Schnitt)', 'Taxable household income (average)'), def: 38000, unit: '€', max: 1000000 },
    { id: 'c', label: T(l, 'Kind unter 18', 'Child under 18'), def: 1, options: janein(l) },
  ],
  run: (v) => {
    const d = P.retrieved_at, kind = v.c === 1;
    const eb = ebSatz(d, v.z, kind);
    const r = efh({ kosten: 28000, zve: v.z, kind, altIdx: 1 });
    return {
      head: [T(l, 'Einkommensbonus', 'Income bonus'), pct(eb, l)],
      rows: [
        [T(l, 'Angesetztes Einkommen', 'Income counted'), eur(Math.max(0, v.z - (kind ? P.foerderung.familienzuschlag : 0)), l)],
        [T(l, 'Höchstsatz insgesamt', 'Overall ceiling'), pct(deckel(d, v.z, kind, true), l)],
        [T(l, 'Zuschuss bei 28.000 € (Gas, 20 Jahre)', 'Grant on €28,000 (gas, 20 years)'), eur(r.zuschuss, l)],
      ],
    };
  },
});

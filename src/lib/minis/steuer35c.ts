/** Zuschuss oder Steuerbonus nach § 35c EStG: beides für dieselbe Maßnahme geht nicht. */
import type { MiniSpec } from '../mini-types';
import { P } from '../engine/params';
import { T, eur, efh, type L } from './_kit';
export default (l: L, tag: string): MiniSpec => ({
  title: T(l, 'Zuschuss oder Steuerbonus?', 'Grant or tax credit?'),
  cta: T(l, 'Zuschuss mit allen Angaben', 'Grant with every detail'),
  inputs: [
    { id: 'k', label: T(l, 'Kosten der Heizung', 'Cost of the system'), def: 30000, unit: '€', max: 500000 },
    { id: 'z', label: T(l, 'Zu versteuerndes Einkommen', 'Taxable household income'), def: 90000, unit: '€', max: 1000000 },
  ],
  run: (v) => {
    const S = P.steuer35c;
    const k = Math.max(0, v.k);
    const steuer = Math.min(k * S.jahr1, S.max1) + Math.min(k * S.jahr2, S.max2) + Math.min(k * S.jahr3, S.max3);
    const z = efh({ kosten: k, zve: v.z, altIdx: 2, antrag: tag });
    return {
      head: [z.zuschuss >= steuer ? T(l, 'Besser: Zuschuss', 'Better: grant') : T(l, 'Besser: Steuerbonus', 'Better: tax credit'), eur(Math.max(z.zuschuss, steuer), l)],
      rows: [
        [T(l, 'Zuschuss (Gas unter 20 Jahre)', 'Grant (gas under 20 years)'), eur(z.zuschuss, l)],
        [T(l, 'Steuerbonus über drei Jahre', 'Tax credit over three years'), eur(Math.min(steuer, S.max_gesamt), l)],
      ],
      note: T(l, 'Der Steuerbonus setzt voraus, dass Sie so viel Einkommensteuer zahlen.', 'The tax credit only helps if you pay at least that much income tax.'),
    };
  },
});

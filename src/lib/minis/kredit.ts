/** Ergänzungskredit: Restbetrag nach dem Zuschuss, Höchstbetrag je Wohneinheit, Zinsvorteil bis 90.000 €. */
import type { MiniSpec } from '../mini-types';
import { P } from '../engine/params';
import { T, eur, efh, type L } from './_kit';
export default (l: L, tag: string): MiniSpec => ({
  title: T(l, 'Was der Kredit abdecken muss', 'What the loan has to cover'),
  cta: T(l, 'Zuschuss genau berechnen', 'Work out the grant exactly'),
  inputs: [
    { id: 'k', label: T(l, 'Gesamtkosten der Sanierung', 'Total cost of the work'), def: 45000, unit: '€', max: 500000 },
    { id: 'z', label: T(l, 'Zu versteuerndes Einkommen', 'Taxable household income'), def: 70000, unit: '€', max: 1000000 },
  ],
  run: (v) => {
    const r = efh({ kosten: v.k, zve: v.z, altIdx: 1, antrag: tag });
    const rest = Math.max(0, v.k - r.zuschuss);
    const K = P.foerderung.kredit;
    return {
      head: [T(l, 'Finanzierungsbedarf nach Zuschuss', 'Left to finance after the grant'), eur(rest, l)],
      rows: [
        [T(l, 'Zuschuss', 'Grant'), eur(r.zuschuss, l)],
        [T(l, 'Kredit höchstens (förderfähige Kosten)', 'Loan at most (eligible costs)'), eur(Math.min(r.foerderfaehig, K.hoechst_je_we), l)],
        [T(l, 'Rest aus eigenen Mitteln', 'Left from your own funds'), eur(Math.max(0, rest - Math.min(r.foerderfaehig, K.hoechst_je_we)), l)],
        [T(l, 'Zinsvorteil Plus', 'Extra interest discount'), v.z <= K.zinsverbilligung_zve_bis ? T(l, 'ja', 'yes') : T(l, 'nein', 'no')],
      ],
      note: T(l, `Zinsvorteil bis ${eur(K.zinsverbilligung_zve_bis, l)} zu versteuerndem Einkommen, nur für die selbst bewohnte Einheit.`, `Interest discount up to ${eur(K.zinsverbilligung_zve_bis, l)} taxable income, for the home you live in only.`),
    };
  },
});

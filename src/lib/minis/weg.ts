/** Eigentümergemeinschaft: Basisantrag der WEG und Zusatzantrag der selbst nutzenden Eigentümer. */
import type { MiniSpec } from '../mini-types';
import { foerderung } from '../engine/foerderung';
import { P } from '../engine/params';
import { T, eur, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Ihr Anteil an der WEG-Förderung', 'Your share of the association grant'),
  cta: T(l, 'Mit Antragsdatum und Heizkosten', 'With application date and running costs'),
  inputs: [
    { id: 'n', label: T(l, 'Wohnungen der WEG', 'Flats in the association'), def: 8, max: 300, plain: true },
    { id: 'k', label: T(l, 'Kosten der Zentralheizung', 'Cost of the central system'), def: 150000, unit: '€', max: 5000000 },
    { id: 'm', label: T(l, 'Ihr Miteigentumsanteil', 'Your ownership share'), def: 12.5, unit: '%', max: 100, decimals: 1 },
    { id: 'z', label: T(l, 'Ihr zu versteuerndes Einkommen', 'Your taxable household income'), def: 45000, unit: '€', max: 1000000 },
  ],
  run: (v) => {
    const n = Math.max(2, Math.round(v.n) || 2);
    const r = foerderung({ antrag: P.retrieved_at, gebaeude: 'weg', einheiten: n, kosten: v.k, selbstnutzer: true, mea: Math.min(Math.max(v.m, 0), 100) / 100, alt: 'gas', altJahre: 25, neu: 'wp', wpEU: true, zve: v.z, kind: false });
    return {
      head: [T(l, 'Ihr Zuschuss insgesamt', 'Your grant in total'), eur(r.zuschuss, l)],
      rows: [
        [T(l, 'Basisantrag der WEG (ganzes Haus)', 'Association’s basic application'), eur(r.grundGebaeude, l)],
        [T(l, 'Davon Ihr Anteil', 'Your share of it'), eur(r.grund, l)],
        [T(l, 'Ihr Zusatzantrag (Boni)', 'Your additional application (bonuses)'), eur(r.bonus, l)],
        [T(l, 'Ihr Kostenanteil netto', 'Your net share of the cost'), eur(r.eigenanteil, l)],
      ],
      note: T(l, 'Gasheizung ab 20 Jahren ersetzt; Sie bewohnen Ihre Wohnung selbst.', 'Replacing a gas boiler of 20+ years; you live in your flat.'),
    };
  },
});

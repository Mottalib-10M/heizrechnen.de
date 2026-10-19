/** Fristen des Antrags: Bewilligungszeitraum und Nachweis nach dem Zusagedatum. */
import type { MiniSpec } from '../mini-types';
import { P } from '../engine/params';
import { T, datum, type L } from './_kit';
const plusMonate = (iso: string, m: number) => { const d = new Date(`${iso}T00:00:00Z`); d.setUTCMonth(d.getUTCMonth() + m); return d.toISOString().slice(0, 10); };
const MON = (l: L) => Array.from({ length: 12 }, (_, i) => ({ value: String(i + 1), label: new Date(Date.UTC(2026, i, 1)).toLocaleDateString(l === 'en' ? 'en-GB' : 'de-DE', { month: 'long', timeZone: 'UTC' }) }));
export default (l: L): MiniSpec => ({
  title: T(l, 'Ihre Fristen nach der Zusage', 'Your deadlines after approval'),
  cta: T(l, 'Zuschuss für dieses Datum berechnen', 'Work out the grant for that date'),
  inputs: [
    { id: 'm', label: T(l, 'Monat der Zusage', 'Month of approval'), def: 11, options: MON(l) },
    { id: 'j', label: T(l, 'Jahr der Zusage', 'Year of approval'), def: 2026, max: 2030, plain: true },
  ],
  run: (v) => {
    const j = Math.min(Math.max(Math.round(v.j) || 2026, 2024), 2030), m = Math.min(Math.max(Math.round(v.m) || 1, 1), 12);
    const zusage = `${j}-${String(m).padStart(2, '0')}-01`;
    const ende = plusMonate(zusage, P.foerderung.bewilligung_monate);
    const nachweis = plusMonate(ende, P.foerderung.nachweis_monate);
    return {
      head: [T(l, 'Fertig sein bis', 'Work finished by'), datum(ende, l)],
      rows: [
        [T(l, 'Bewilligungszeitraum', 'Approval period'), T(l, `${P.foerderung.bewilligung_monate} Monate`, `${P.foerderung.bewilligung_monate} months`)],
        [T(l, 'Nachweise einreichen bis', 'Submit proof by'), datum(nachweis, l)],
      ],
      note: T(l, 'Gerechnet ab dem Ersten des Zusagemonats; maßgeblich ist das Datum im Zuwendungsbescheid.', 'Counted from the first of the approval month; the date in your approval letter is what counts.'),
    };
  },
});

/** Gemeinsame Helfer der Mini-Rechner (vom Register ignoriert: Präfix „_“). */
import { formatMoney, formatPercent, formatNumber, displayDate } from '../format';
import { LANG_TAGS } from '../../data/site-config';
import { P } from '../engine/params';
import { foerderung, type AltHeizung, type NeuHeizung, type FoerderEingabe } from '../engine/foerderung';
export type L = 'de' | 'en';
export const T = <A>(l: L, de: A, en: A): A => (l === 'en' ? en : de);
export const eur = (x: number, l: L, d?: number) => formatMoney(x, d ?? 0, l);
export const pct = (x: number, l: L, d = 0) => formatPercent(x, d, l);
export const num = (x: number, l: L, d = 0) => formatNumber(x, d, l);
export const datum = (iso: string, l: L) => displayDate(iso, LANG_TAGS[l]);
export const janein = (l: L) => [{ value: '0', label: T(l, 'Nein', 'No') }, { value: '1', label: T(l, 'Ja', 'Yes') }];
export type Rows = [string, string][];

/** Stichtage als Auswahl (Wert = Index): heute (Build-Tag) und die nächsten Absenkungen. */
export const TERMINE = [P.retrieved_at, ...P.foerderung.kgb_stufen.map((s) => s.ab).filter((d) => d > P.retrieved_at)];
export const terminOpt = (l: L) => TERMINE.map((d, i) => ({ value: String(i), label: i === 0 ? T(l, `jetzt (Stand ${datum(d, l)})`, `now (as of ${datum(d, l)})`) : datum(d, l) }));
export const termin = (i: number) => TERMINE[Math.min(Math.max(Math.round(i) || 0, 0), TERMINE.length - 1)];

/** Alte Heizung als Zahl (Mini-Rechner kennen nur Zahlen). */
export const ALT: Array<{ alt: AltHeizung; jahre: number; de: string; en: string }> = [
  { alt: 'oel', jahre: 25, de: 'Öl', en: 'Oil' },
  { alt: 'gas', jahre: 20, de: 'Gas, ab 20 Jahre', en: 'Gas, 20+ years' },
  { alt: 'gas', jahre: 10, de: 'Gas, unter 20 Jahre', en: 'Gas, under 20 years' },
  { alt: 'gasetage', jahre: 15, de: 'Gasetagenheizung', en: 'Gas heater per flat' },
  { alt: 'nachtspeicher', jahre: 30, de: 'Nachtspeicher', en: 'Storage heaters' },
];
export const altOpt = (l: L) => ALT.map((a, i) => ({ value: String(i), label: l === 'en' ? a.en : a.de }));
export const alt = (i: number) => ALT[Math.min(Math.max(Math.round(i) || 0, 0), ALT.length - 1)];

/** Einfamilienhaus, selbst bewohnt: der häufigste Fall der Mini-Rechner. */
export function efh(o: { kosten: number; zve: number; kind?: boolean; altIdx?: number; antrag?: string; neu?: NeuHeizung; eu?: boolean }) {
  const a = alt(o.altIdx ?? 1);
  const e: FoerderEingabe = { antrag: o.antrag ?? P.retrieved_at, gebaeude: 'efh', einheiten: 1, kosten: Math.max(0, o.kosten), selbstnutzer: true, alt: a.alt, altJahre: a.jahre, neu: o.neu ?? 'wp', wpEU: o.eu ?? true, zve: Math.max(0, o.zve), kind: !!o.kind };
  return foerderung(e);
}

/**
 * Heizungsförderung (BEG EM, Zuschuss 458) nach dem Antragsdatum.
 * Neue Richtlinie vom 17.08.2026, in Kraft seit 21.07.2026: Nr. 8.3.1 (Höchstgrenzen), 8.4.1 (Sätze, Deckel 70/80 %),
 * 8.4.4 (Klimageschwindigkeitsbonus, gestaffelt), 8.4.5 (Einkommensbonus), 8.4.6 (Wertschöpfungsbonus ab Q1 2027).
 * Anträge vor dem 21.07.2026: Richtlinie vom 21.12.2023 (Nr. 10 der neuen Richtlinie), Werte in P.foerderung.alt.
 * Rechenweg wie in den Beispielen auf kfw.de/458: Höchstbetrag des Gebäudes, Grundförderung auf das ganze Gebäude,
 * Boni nur auf den Anteil der selbstgenutzten Wohneinheit, Gesamtsatz dieser Einheit gedeckelt.
 */
import { P, r2 } from './params';

const F = P.foerderung;
export type AltHeizung = 'oel' | 'kohle' | 'gasetage' | 'nachtspeicher' | 'gas' | 'biomasse' | 'keine';
export type NeuHeizung = 'wp' | 'biomasse' | 'solar' | 'netz' | 'brennstoffzelle' | 'h2';
/** efh: Einfamilienhaus · mfh: Haus mit mehreren Einheiten, alle im eigenen Eigentum · weg: Maßnahme am Gemeinschaftseigentum · etw: Maßnahme im Sondereigentum (Etagenheizung der eigenen Wohnung). */
export type Gebaeude = 'efh' | 'mfh' | 'weg' | 'etw';
export type Regime = 'alt' | 'neu';

export interface FoerderEingabe {
  /** Datum des Antragseingangs, ISO. */
  antrag: string;
  gebaeude: Gebaeude;
  /** Wohneinheiten des Gebäudes nach dem Vorhaben (EFH = 1). */
  einheiten: number;
  /** Förderfähige Gesamtkosten brutto in Euro (Gebäude; bei WEG Gemeinschaftseigentum). */
  kosten: number;
  /** Eigentümer bewohnt eine Einheit selbst (Haupt- oder alleiniger Wohnsitz). */
  selbstnutzer: boolean;
  /** Miteigentumsanteil der eigenen Wohnung in der WEG (0 bis 1). */
  mea?: number;
  alt: AltHeizung;
  /** Jahre seit Inbetriebnahme der alten Heizung (für Gas und Biomasse: mindestens 20). */
  altJahre: number;
  neu: NeuHeizung;
  /** Wärmepumpe mit Ursprung in der EU (Wertschöpfungsbonus ab Q1 2027). */
  wpEU: boolean;
  /** Durchschnitt des zu versteuernden Haushaltseinkommens (2. und 3. Jahr vor Antrag). */
  zve: number;
  /** Mindestens ein kindergeldberechtigtes Kind unter 18 im Haushalt gemeldet. */
  kind: boolean;
  /** Nur Regime „alt“: Wärmepumpe mit natürlichem Kältemittel oder Wasser, Erdreich, Abwasser als Quelle. */
  effizienz?: boolean;
}

export interface FoerderErgebnis {
  regime: Regime;
  hoechstbetrag: number;
  foerderfaehig: number;
  grundSatz: number;
  grund: number;
  /** Grundförderung des ganzen Gebäudes (bei der WEG der Basisantrag). */
  grundGebaeude: number;
  anteilEigen: number;
  kgbSatz: number;
  ebSatz: number;
  effSatz: number;
  wertSatz: number;
  deckel: number;
  /** Gesamtsatz der selbstgenutzten Einheit nach Deckel. */
  satzEigen: number;
  bonus: number;
  zuschuss: number;
  /** Kosten, die der Eigentümer selbst trägt (WEG: nach Miteigentumsanteil). */
  eigeneKosten: number;
  eigenanteil: number;
  /** Ab Q1 2027 beschlossen, Starttag offen: Ergebnis kann für eine Wärmepumpe ohne EU-Ursprung niedriger ausfallen. */
  unsicher: boolean;
  kgbGrund: string;
}

/** Wert einer datierten Stufenliste am Stichtag (ISO-Daten vergleichen sich als Text). */
export function stufe<T extends { ab: string }>(liste: T[], datum: string): T | undefined {
  let w: T | undefined;
  for (const s of liste) if (datum >= s.ab) w = s;
  return w;
}
export const regime = (antrag: string): Regime => (antrag < F.richtlinie_in_kraft ? 'alt' : 'neu');

/** Frühester Antragstag, den die Rechner annehmen (Richtlinie vom 21.12.2023 in Kraft). */
export const ANTRAG_MIN = '2024-01-01';
/** Heutiges Datum (Ortszeit des Browsers) als ISO-Text. */
export function heuteISO(jetzt: Date = new Date()): string {
  const z = (n: number) => String(n).padStart(2, '0');
  return `${jetzt.getFullYear()}-${z(jetzt.getMonth() + 1)}-${z(jetzt.getDate())}`;
}
/** Antragstag, den großer Rechner und Mini-Rechner ansetzen: das Datum, auf die Laufzeit der Richtlinie begrenzt; ungültig → Ersatzwert. */
export function antragstag(datum: string, ersatz: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(datum)) return ersatz;
  return datum < ANTRAG_MIN ? ANTRAG_MIN : datum > F.richtlinie_ende ? F.richtlinie_ende : datum;
}

/** Höchstbetrag förderfähiger Kosten des Gebäudes (Nr. 8.3.1 a). */
export function hoechstbetrag(antrag: string, einheiten: number): number {
  const n = Math.max(1, Math.floor(einheiten));
  const erste = regime(antrag) === 'alt' ? F.alt.hoechst_erste_we : stufe(F.hoechst_erste_we, antrag)!.betrag;
  return erste + F.hoechst_we_2_bis_6 * Math.min(Math.max(n - 1, 0), 5) + F.hoechst_we_ab_7 * Math.max(n - 6, 0);
}

/** Klimageschwindigkeitsbonus am Antragsdatum, wenn die alte Heizung ihn auslöst. */
export function kgbSatz(antrag: string, alt: AltHeizung, altJahre: number): { satz: number; grund: string } {
  const immer = alt === 'oel' || alt === 'kohle' || alt === 'gasetage' || alt === 'nachtspeicher';
  const alterOk = (alt === 'gas' || alt === 'biomasse') && altJahre >= F.kgb_mindestalter_gas_biomasse;
  if (!immer && !alterOk) return { satz: 0, grund: alt === 'keine' ? 'keine' : 'zu_jung' };
  const satz = regime(antrag) === 'alt' ? F.alt.kgb : stufe(F.kgb_stufen, antrag)!.satz;
  return { satz, grund: satz > 0 ? 'ja' : 'ausgelaufen' };
}

/** Einkommensbonus: Familienzuschlag zieht 10.000 € vom anzusetzenden Einkommen ab (Nr. 8.4.5). */
export function ebSatz(antrag: string, zve: number, kind: boolean): number {
  if (regime(antrag) === 'alt') return zve <= F.alt.eb_zve_bis ? F.alt.eb : 0;
  const z = zve - (kind ? F.familienzuschlag : 0);
  for (const s of F.einkommen_stufen) if (z <= s.bis) return s.bonus;
  return 0;
}

/** Obergrenze des Gesamtsatzes der Wohneinheit (Nr. 8.4.1). */
export function deckel(antrag: string, zve: number, kind: boolean, selbstnutzer: boolean): number {
  if (regime(antrag) === 'alt') return F.alt.deckel;
  const z = zve - (kind ? F.familienzuschlag : 0);
  return selbstnutzer && z <= F.deckel_niedrig_zve ? F.deckel_niedrig : F.deckel_standard;
}

/** Grundförderung und Wertschöpfungsbonus nach Technik und Datum. */
export function grundSatz(e: Pick<FoerderEingabe, 'antrag' | 'neu' | 'wpEU' | 'effizienz'>): { grund: number; wert: number; eff: number; unsicher: boolean } {
  if (regime(e.antrag) === 'alt') return { grund: F.alt.grund, wert: 0, eff: e.neu === 'wp' && e.effizienz ? F.alt.effizienz : 0, unsicher: false };
  if (e.neu !== 'wp' || e.antrag < F.q1_2027.frueheste) return { grund: F.grund, wert: 0, eff: 0, unsicher: false };
  // Ab Q1 2027: Wärmepumpen 15 % + 15 % Wertschöpfungsbonus bei EU-Ursprung. Starttag offen: im ersten Quartal
  // rechnen wir mit dem heutigen Satz und kennzeichnen das Ergebnis als unsicher.
  if (e.antrag <= F.q1_2027.spaeteste) return { grund: F.grund, wert: 0, eff: 0, unsicher: !e.wpEU };
  return { grund: F.q1_2027.wp_grund, wert: e.wpEU ? F.q1_2027.wertschoepfung : 0, eff: 0, unsicher: false };
}

export function foerderung(e: FoerderEingabe): FoerderErgebnis {
  const reg = regime(e.antrag);
  const n = e.gebaeude === 'efh' ? 1 : Math.max(2, Math.floor(e.einheiten) || 2);
  const H = hoechstbetrag(e.antrag, n);
  const kosten = Math.max(0, e.kosten);
  // Sondereigentum: nur der gleiche Anteil H / n des Gebäudehöchstbetrags (KfW-Beispiel Klima-Split im Sondereigentum).
  const cap = e.gebaeude === 'etw' ? H / n : H;
  const B = kosten >= F.mindestinvestition ? Math.min(kosten, cap) : 0;
  const g = grundSatz(e);
  const basis = g.grund + g.wert + g.eff;
  const mea = Math.min(Math.max(e.mea ?? 1 / n, 0), 1);
  // Anteil der selbstgenutzten Einheit, auf den die Boni gerechnet werden (Nr. 8.4.4, 8.4.5 und Beispiele kfw.de/458):
  // EFH ganz; Haus mit mehreren Einheiten gleich verteilt (B / n); WEG nach Miteigentumsanteil, höchstens H / n; Sondereigentum ganz.
  const anteilEigen = !e.selbstnutzer ? 0 : e.gebaeude === 'weg' ? Math.min(B * mea, H / n) : e.gebaeude === 'mfh' ? B / n : B;
  const k = kgbSatz(e.antrag, e.alt, e.altJahre);
  const kgb = e.selbstnutzer ? k.satz : 0;
  const eb = e.selbstnutzer ? ebSatz(e.antrag, e.zve, e.kind) : 0;
  const dk = deckel(e.antrag, e.zve, e.kind, e.selbstnutzer);
  const satzEigen = Math.min(basis + kgb + eb, dk);
  const bonusSatz = Math.max(0, satzEigen - basis);
  const grundGebaeude = r2(B * basis);
  const bonus = r2(anteilEigen * bonusSatz);
  // WEG: die Grundförderung geht an die Gemeinschaft; der Eigentümer trägt Kosten und Zuschuss nach seinem Anteil.
  const grund = e.gebaeude === 'weg' ? r2(grundGebaeude * mea) : grundGebaeude;
  const eigeneKosten = e.gebaeude === 'weg' ? kosten * mea : kosten;
  const zuschuss = r2(grund + bonus);
  return {
    regime: reg, hoechstbetrag: r2(cap), foerderfaehig: B, grundSatz: basis, grund, grundGebaeude, anteilEigen: r2(anteilEigen),
    kgbSatz: kgb, ebSatz: eb, effSatz: g.eff, wertSatz: g.wert, deckel: dk, satzEigen: e.selbstnutzer ? satzEigen : basis,
    bonus, zuschuss, eigeneKosten: r2(eigeneKosten), eigenanteil: r2(eigeneKosten - zuschuss), unsicher: g.unsicher, kgbGrund: k.grund,
  };
}

/** Stichtage, an denen sich für einen gegebenen Fall etwas ändert (Klimageschwindigkeitsbonus, Höchstbetrag). */
export function stichtage(): string[] {
  const s = new Set<string>([...F.kgb_stufen.map((x) => x.ab), ...F.hoechst_erste_we.map((x) => x.ab)]);
  return [...s].sort();
}

/** Zuschuss für denselben Fall an mehreren Antragsdaten (Zeitstrahl „Warten kostet“). */
export function verlauf(e: FoerderEingabe, daten: string[]): Array<{ datum: string; zuschuss: number; satz: number }> {
  return daten.map((d) => { const r = foerderung({ ...e, antrag: d }); return { datum: d, zuschuss: r.zuschuss, satz: r.satzEigen }; });
}

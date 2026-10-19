/**
 * CO₂-Kosten des Heizens nach dem Brennstoffemissionshandelsgesetz (BEHG) und ihre Aufteilung zwischen Mieter und
 * Vermieter nach dem Kohlendioxidkostenaufteilungsgesetz (CO2KostAufG).
 * Emissionsfaktoren: EBeV 2030 Anlage 2 Teil 4. Heizöl EL: 0,845 t je 1.000 l × 42,8 GJ/t × 0,074 t CO₂/GJ.
 * Erdgas: 3,2508 GJ je MWh × 0,0558 t CO₂/GJ, bezogen auf die kWh der Gasrechnung (Brennwert).
 */
import { P, r2 } from './params';

const C = P.co2;
export type Brennstoff = 'gas' | 'oel' | 'fluessiggas';

/** kg CO₂ je Liter Heizöl EL. */
export const kgJeLiterOel = C.oel_dichte_t_je_1000l * C.oel_hu_gj_je_t * C.oel_ef_t_je_gj;
/** kg CO₂ je kWh Erdgas (Brennwert, wie abgerechnet). */
export const kgJeKwhGas = C.gas_gj_je_mwh * C.gas_ef_t_je_gj; // t je MWh = kg je kWh
/** kg CO₂ je kg Flüssiggas. */
export const kgJeKgFluessiggas = (C.fluessiggas_hu_gj_je_t * C.fluessiggas_ef_t_je_gj);
/** Heizwert Heizöl EL in kWh je Liter (aus denselben Faktoren: 0,845 × 42,8 GJ/t ÷ 3,6). */
export const kwhJeLiterOel = (C.oel_dichte_t_je_1000l * C.oel_hu_gj_je_t) / 3.6;
/** Verhältnis Heizwert zu Brennwert bei Erdgas (3,2508 ÷ 3,6). */
export const gasHiHs = C.gas_gj_je_mwh / 3.6;

/** Menge in Litern (Öl), kWh (Gas) oder kg (Flüssiggas) → kg CO₂. */
export function co2Kg(stoff: Brennstoff, menge: number): number {
  const f = stoff === 'oel' ? kgJeLiterOel : stoff === 'gas' ? kgJeKwhGas : kgJeKgFluessiggas;
  return Math.max(0, menge) * f;
}

/** CO₂-Kosten in Euro für eine Menge bei einem Preis je Tonne, wahlweise mit Mehrwertsteuer. */
export function co2Kosten(stoff: Brennstoff, menge: number, preisJeTonne: number, brutto = true): number {
  return r2((co2Kg(stoff, menge) / 1000) * preisJeTonne * (brutto ? 1 + C.mwst : 1));
}

/** Aufschlag je Einheit (ct je Liter bzw. ct je kWh) bei einem CO₂-Preis. */
export function aufschlagCent(stoff: Brennstoff, preisJeTonne: number, brutto = true): number {
  // Kosten für 1.000 Einheiten in Euro ÷ 10 = Cent je Einheit.
  return co2Kosten(stoff, 1000, preisJeTonne, brutto) / 10;
}

/** CO₂-Preis eines Jahres nach geltendem Recht: Festpreis bis 2025, 2026 Korridor (Ergebnis der Versteigerungen). */
export function preisJahr(jahr: number): { min: number; max: number; status: 'fest' | 'korridor' | 'beschlossen' | 'offen' } {
  const f = C.preise_fest.find((x) => x.jahr === jahr);
  if (f) return { min: f.preis, max: f.preis, status: 'fest' };
  if (jahr === 2026) return { ...C.korridor_2026, status: 'korridor' };
  if (jahr === 2027) return { min: C.korridor_2027_beschlossen.min, max: C.korridor_2027_beschlossen.max, status: 'beschlossen' };
  return { min: NaN, max: NaN, status: 'offen' };
}

/** CO₂-Ausstoß je m² Wohnfläche und Jahr, auf eine Nachkommastelle gerundet (§ 5 Abs. 1 CO2KostAufG). */
export function kgJeM2(kgGesamt: number, flaeche: number): number {
  return flaeche > 0 ? Math.round((kgGesamt / flaeche) * 10) / 10 : 0;
}

/** Mieteranteil nach der Stufentabelle der Anlage zum CO2KostAufG. */
export function mieterAnteil(kgM2: number): number {
  let a = 1;
  for (const s of P.aufteilung.stufen) if (kgM2 >= s.ab) a = s.mieter;
  return a;
}

export interface AufteilungEingabe {
  stoff: Brennstoff;
  menge: number;
  flaeche: number;
  /** CO₂-Kosten laut Abrechnung des Lieferanten in Euro; ohne Angabe aus Menge und Preis gerechnet. */
  kosten?: number;
  preis: number;
  /** § 9: Denkmalschutz, Anschluss- und Benutzungszwang oder Milieuschutz halbieren den Vermieteranteil. */
  einschraenkung: boolean;
  /** Nichtwohngebäude: höchstens 50 % für den Mieter (§ 8). */
  nichtwohn?: boolean;
  /** Heizung nach § 43 GModG neu eingebaut (Gas, Öl, Flüssiggas): ab 2028 hälftig (§ 5a). */
  neueFossile?: boolean;
  jahr?: number;
}

export function aufteilung(e: AufteilungEingabe) {
  const kg = co2Kg(e.stoff, e.menge);
  const kosten = e.kosten && e.kosten > 0 ? e.kosten : co2Kosten(e.stoff, e.menge, e.preis);
  const kgM2 = kgJeM2(kg, e.flaeche);
  const A = P.aufteilung;
  let mieter = mieterAnteil(kgM2);
  let regel: 'stufe' | 'nichtwohn' | 'neu' = 'stufe';
  if (e.nichtwohn) { mieter = 1 - A.nichtwohn_mieter_max; regel = 'nichtwohn'; }
  if (e.neueFossile && (e.jahr ?? 2026) >= Number(A.neue_fossile_heizung_ab.slice(0, 4))) { mieter = A.neue_fossile_heizung_anteil; regel = 'neu'; }
  let vermieter = 1 - mieter;
  if (e.einschraenkung && regel === 'stufe') { vermieter = vermieter * A.paragraf9_faktor; mieter = 1 - vermieter; }
  return { kg: r2(kg), kgM2, kosten: r2(kosten), mieter, vermieter, mieterEuro: r2(kosten * mieter), vermieterEuro: r2(kosten * vermieter), regel };
}

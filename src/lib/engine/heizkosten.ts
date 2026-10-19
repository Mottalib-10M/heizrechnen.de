/**
 * Heizkosten im Jahr je Heizung und Bundesland.
 * Wärmebedarf: entweder aus dem gemessenen Verbrauch (Gasrechnung in kWh, Heizöl in Litern) oder aus Wohnfläche und
 * Effizienzklasse (GModG Anlage 10, Endenergie). Der Klimafaktor des Landes (Gradtagzahl G20/15 des DWD ÷ Potsdam)
 * wirkt nur auf die Raumwärme, nicht auf das Warmwasser (Anteil nach Fraunhofer ISE).
 * Preise: Destatis (Strom, Gas, 1. Halbjahr 2026), EU Weekly Oil Bulletin (Heizöl), Bundesnetzagentur (Wärmepumpenstrom).
 */
import { P, r2 } from './params';
import { co2Kg, gasHiHs, kwhJeLiterOel } from './co2';

export type System = 'gas' | 'oel' | 'wp_luft' | 'wp_sole' | 'fernwaerme' | 'nachtspeicher';
export type Klasse = keyof typeof P.annahmen.klasse_mitte;
export const LAENDER = P.klima.laender.map((l) => l.land);
export const KLASSEN = P.gesetz.effizienzklassen.map((k) => k.k) as Klasse[];

export function gradtage(land: string): number {
  return P.klima.laender.find((l) => l.land === land)?.gt ?? P.klima.referenz_potsdam;
}
/** Gradtagzahl des Landes geteilt durch die Referenzstation Potsdam. */
export const klimafaktor = (land: string) => gradtage(land) / P.klima.referenz_potsdam;
/** Verbrauch im Land, wenn ein Wert für das Referenzklima gilt: nur der Raumwärmeanteil skaliert. */
export const klimaKorrektur = (land: string) => (1 - P.technik.anteil_warmwasser) * klimafaktor(land) + P.technik.anteil_warmwasser;

export interface Bedarf {
  /** Weg 1: Wohnfläche (m²) und Effizienzklasse aus dem Energieausweis. */
  flaeche?: number;
  klasse?: Klasse;
  /** Weg 2: gemessener Jahresverbrauch der heutigen Heizung (Gas: kWh laut Rechnung, Öl: Liter). */
  verbrauch?: number;
  heute?: System;
  land: string;
  /** Jahresnutzungsgrad der heutigen Heizung (Gas, Öl). */
  nutzungsgrad?: number;
}

/** Nutzwärme im Jahr (kWh), die eine neue Heizung liefern muss. */
export function nutzwaerme(b: Bedarf): number {
  const eta = b.nutzungsgrad ?? P.annahmen.nutzungsgrad_kessel;
  if (b.verbrauch && b.verbrauch > 0 && b.heute) {
    const v = b.verbrauch;
    switch (b.heute) {
      case 'gas': return v * gasHiHs * eta;
      case 'oel': return v * kwhJeLiterOel * eta;
      case 'wp_luft': return v * P.technik.jaz_luft_messung;
      case 'wp_sole': return v * P.technik.jaz_sole_messung;
      case 'nachtspeicher': case 'fernwaerme': return v;
    }
  }
  const e = P.annahmen.klasse_mitte[b.klasse ?? 'E'];
  // Klassenwerte sind Endenergie eines Kessels im Referenzklima: mal Nutzungsgrad, mal Klima des Landes.
  return Math.max(0, b.flaeche ?? 0) * e * eta * klimaKorrektur(b.land);
}

export interface Preise {
  gasCt: number;
  oelEur100: number;
  wpCt: number;
  fernCt?: number;
  speicherCt: number;
}
export const STANDARDPREISE: Preise = {
  gasCt: P.preise.gas_ct,
  oelEur100: P.preise.oel_eur_100l_12monate,
  wpCt: P.preise.wp_strom_getrennt_ct,
  speicherCt: P.preise.nachtspeicher_ct,
};

export interface Laufend { system: System; menge: number; einheit: 'kWh' | 'l'; kosten: number; co2: number }

/** Jahreskosten und CO₂ eines Systems für eine Nutzwärme. `jaz` überschreibt die gemessene Jahresarbeitszahl. */
export function laufend(system: System, q: number, pr: Preise = STANDARDPREISE, opt: { jaz?: number; eta?: number } = {}): Laufend | null {
  const eta = opt.eta ?? P.annahmen.nutzungsgrad_kessel;
  switch (system) {
    case 'gas': { const kwh = q / eta / gasHiHs; return { system, menge: kwh, einheit: 'kWh', kosten: r2(kwh * pr.gasCt / 100), co2: co2Kg('gas', kwh) }; }
    case 'oel': { const l = q / eta / kwhJeLiterOel; return { system, menge: l, einheit: 'l', kosten: r2(l * pr.oelEur100 / 100), co2: co2Kg('oel', l) }; }
    case 'wp_luft': case 'wp_sole': {
      const jaz = opt.jaz ?? (system === 'wp_luft' ? P.technik.jaz_luft_messung : P.technik.jaz_sole_messung);
      const kwh = q / Math.max(jaz, 1); return { system, menge: kwh, einheit: 'kWh', kosten: r2(kwh * pr.wpCt / 100), co2: 0 };
    }
    case 'nachtspeicher': return { system, menge: q, einheit: 'kWh', kosten: r2(q * pr.speicherCt / 100), co2: 0 };
    case 'fernwaerme': return pr.fernCt && pr.fernCt > 0 ? { system, menge: q, einheit: 'kWh', kosten: r2(q * pr.fernCt / 100), co2: 0 } : null;
  }
}

/**
 * Mehrkosten eines anderen CO₂-Preises gegenüber dem Preis, der in den heutigen Energiepreisen steckt
 * (Durchschnitt der Versteigerungen 2026), brutto mit Mehrwertsteuer.
 */
export function co2Mehrkosten(co2kg: number, preisJeTonne: number): number {
  return r2((co2kg / 1000) * (preisJeTonne - P.co2.auktion_2026_durchschnitt) * (1 + P.co2.mwst));
}

export interface Amortisation { mehrInvest: number; ersparnis: number; jahre: number | null }
/** Jahre, bis die Ersparnis im Betrieb die Mehrkosten der Anschaffung einholt (ohne Zinsen, Preise konstant). */
export function amortisation(investNetto: number, alternativInvest: number, kostenAlt: number, kostenNeu: number): Amortisation {
  const mehrInvest = r2(investNetto - alternativInvest);
  const ersparnis = r2(kostenAlt - kostenNeu);
  const jahre = mehrInvest <= 0 ? 0 : ersparnis > 0 ? Math.round((mehrInvest / ersparnis) * 10) / 10 : null;
  return { mehrInvest, ersparnis, jahre };
}

/** Jahreskosten aller Systeme für einen Bedarf, sortiert von günstig nach teuer. */
export function vergleich(q: number, pr: Preise = STANDARDPREISE, opt: { jaz?: number } = {}): Laufend[] {
  const s: System[] = ['wp_luft', 'wp_sole', 'gas', 'oel', 'fernwaerme', 'nachtspeicher'];
  return s.map((x) => laufend(x, q, pr, x === 'wp_luft' ? { jaz: opt.jaz } : {})).filter((x): x is Laufend => !!x).sort((a, b) => a.kosten - b.kosten);
}

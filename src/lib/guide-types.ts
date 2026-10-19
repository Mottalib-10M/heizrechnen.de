/**
 * Eine Seite = EINE Datei in `src/content/guides/` (Ratgeber) oder `src/content/rechner/` (Rechnerseiten).
 * Die Datei trägt beide Sprachen, Text, FAQ, Quellen, Mini-Rechner und Verlinkung. Der Kern
 * (Routen, Menüs, Fußzeile, Sitemap, hreflang, Schemas) liest sie selbst. Anleitung: CONTRIBUTING-HEIZUNG.md.
 */
import type { SourceKey, Params } from './engine/params';

export type Lang = 'de' | 'en';
/** Menügruppe: Förderung, Kosten und Wärmepumpe, CO₂-Preis, Gesetz. */
export type Group = 'foerderung' | 'kosten' | 'co2' | 'gesetz';
export interface FAQ { q: string; a: string }

export interface Helpers {
  lang: Lang;
  /** Interner Link per Seiten-ID. */
  a: (id: string, text: string) => string;
  /** Eurobetrag im Format der Sprache (ohne Nachkommastellen, wenn nicht anders verlangt). */
  eur: (n: number, decimals?: number) => string;
  num: (n: number, decimals?: number) => string;
  /** Prozent aus einem Anteil (0,1807 → „18,1 %“). */
  pct: (x: number, decimals?: number) => string;
  /** ISO-Datum ausgeschrieben. */
  date: (iso: string) => string;
  /** Tabelle im Zeitungsstil. */
  table: (headers: string[], rows: Array<Array<string | number>>, caption?: string, align?: Array<'l' | 'r'>) => string;
  /** Link auf eine amtliche Quelle aus params-2026.json. */
  src: (key: SourceKey, text?: string) => string;
  /** Rechtswerte und Daten 2026: jede Zahl kommt von hier, nie fest im Text. */
  P: Params;
}

export interface PageText {
  /** URL-Segment ohne Schrägstrich, ohne Jahreszahl. */
  slug: string;
  nav: string;
  card: string;
  /** 50 bis 60 Zeichen, Suchbegriff zuerst, mit 2026 (RECETTE §11). */
  title: string;
  /** 150 bis 160 Zeichen, mit 2026. */
  description: string;
  h1: string;
  /** Ein Satz unter dem H1. */
  intro: string;
  /** Zitierbarer Absatz, mindestens 120 Wörter, mit den Zahlen (RECETTE §21). */
  resume: string;
  faqs: FAQ[];
  /** HTML-Körper. `<!--mini:kind-->` setzt einen weiteren Mini-Rechner ein. */
  body: (h: Helpers) => string;
}

/** foerderung: Zuschuss nach Antragsdatum · heizkosten: Jahreskosten je Heizung und Bundesland · wpstrom: Stromverbrauch der Wärmepumpe · co2: CO₂-Kosten je Jahr · aufteilung: CO₂-Kosten Mieter und Vermieter. */
export type Tool = 'foerderung' | 'heizkosten' | 'wpstrom' | 'co2' | 'aufteilung';

export interface PageDef {
  id: string;
  group: Group;
  order: number;
  /** Mini-Rechner nach dem zitierbaren Absatz (Datei `src/lib/minis/<kind>.ts`). Entfällt bei `tool`. */
  mini?: string;
  /** Startwerte des Mini-Rechners auf dieser Seite (z. B. die Art der neuen Heizung). */
  miniDefaults?: Record<string, number>;
  /** Ziel des Mini-Rechner-Buttons (Standard: Startseite). */
  miniHref?: string;
  /** Voller Rechner der Seite (nur Rechnerseiten). */
  tool?: Tool;
  /** Rechner-Optionen, z. B. die neue Heizung oder der Vergleichsmodus. */
  toolPreset?: Record<string, number | string | boolean>;
  related: string[];
  sources: SourceKey[];
  de: PageText;
  en: PageText;
}

export const defineGuide = (g: PageDef): PageDef => g;

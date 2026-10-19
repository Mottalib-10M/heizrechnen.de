import type { Locale } from './routes';
const de = {
  updatedOn: 'Aktualisiert am', editorialPolicy: 'Redaktionsgrundsätze', contactLabel: 'Kontakt', reviewedBy: 'Nachgerechnet von',
  skipToContent: 'Zum Inhalt', mainNav: 'Hauptnavigation', breadcrumbLabel: 'Pfad', breadcrumbHome: 'Start', menuOpen: 'Menü öffnen',
  faqTitle: 'Was Eigentümer fragen', relatedCalculators: 'Passend dazu', sourcesTitle: 'Richtlinien, Gesetze und Daten', writtenBy: 'Herausgegeben von',
  asOf: 'Stand', lastUpdated: 'gelesen am', footerValidated: 'Fördersätze je Antragsdatum, Kostengrenzen, CO₂-Stufenmodell und Heizkosten je Bundesland als Tests nachgerechnet', footerBrowser: 'Gerechnet wird in Ihrem Browser · keine Anmeldung · kein Angebotsformular',
  footerDisclaimer: 'Heizwechsel ist ein unabhängiges Angebot von Radif Partners. Wir sind weder die Förderbank noch eine Behörde, kein Energieberater und kein Heizungsbauer, und wir verkaufen nichts. Die Ergebnisse sind Schätzungen nach der Förderrichtlinie und den Gesetzen im Stand des Aktualisierungsdatums und keine persönliche Beratung; verbindlich ist allein die Zusage der Förderbank. Angekündigte Änderungen und Gesetzentwürfe sind kein geltendes Recht.', footerPopular: '', notFound: 'Unter dieser Adresse gibt es keine Seite.',
  readMore: 'Ganzen Absatz lesen',
};
const en: typeof de = {
  updatedOn: 'Updated on', editorialPolicy: 'Editorial policy', contactLabel: 'Contact', reviewedBy: 'Worked through by',
  skipToContent: 'Skip to content', mainNav: 'Main navigation', breadcrumbLabel: 'Path', breadcrumbHome: 'Home', menuOpen: 'Open menu',
  faqTitle: 'What homeowners in Germany ask', relatedCalculators: 'Related', sourcesTitle: 'Guidelines, laws and data', writtenBy: 'Published by',
  asOf: 'As of', lastUpdated: 'read on', footerValidated: 'Grant rates by application date, cost caps, the CO₂ split tiers and running costs per state run as tests', footerBrowser: 'Calculated in your browser · no sign-up · no quote form',
  footerDisclaimer: 'Heizwechsel is an independent service by Radif Partners. We are not the federal promotional bank or any authority, not an energy adviser and not an installer, and we sell nothing. Results are estimates only, based on the funding guideline and the laws as of the update date, and do not replace personal advice; only the bank’s grant approval is binding. Announced changes and draft bills are not law.', footerPopular: '', notFound: 'There is no page at this address.',
  readMore: 'Read the whole paragraph',
};
export function t(lang: Locale) { return lang === 'en' ? en : de; }

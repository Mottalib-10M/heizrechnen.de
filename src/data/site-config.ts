/** Configuration centrale du site (générée par new-site.py). */
export const SITE_URL = "https://heizrechnen.de";
export const SITE_NAMES: Record<string, string> = {"de": "Heizrechnen", "en": "Heizrechnen"};
export const LANG_TAGS: Record<string, string> = {"de": "de-DE", "en": "en-DE"};
export const OG_LOCALES: Record<string, string> = {"de": "de_DE", "en": "en_GB"};
export const LOCALE_TAG = 'de-DE';
export const LOCALE_BY_LANG: Record<string, string> = { de: 'de-DE', en: 'en-GB' };
export const CURRENCY = 'EUR';
export const YEAR = 2026;
/** Année de création du site — signal d'ancienneté (RECETTE §8.0). */
export const SITE_FOUNDED = '2026';
export const LAST_UPDATED = '2026-10-19';
export const AUTHOR_NAME = 'Radif Partners';
export const AUTHOR_ROLE: Record<string, string> = {"de": "Herausgeber von Rechnern zum Heizungstausch: Zuschuss nach Antragsdatum und Einkommen, Heizkosten je Bundesland, CO₂-Kosten und Aufteilung", "en": "Publisher of calculators for replacing a heating system in Germany: grant by application date and income, running costs by state, CO₂ costs and their split"};
export const AUTHOR_DESC: Record<string, string> = {"de": "Radif Partners rechnet den Heizungstausch so nach, wie die Förderrichtlinie und das Merkblatt der Förderbank ihn regeln: Antragsdatum, Haushaltseinkommen, Wohneinheiten, Art der neuen Heizung. Dazu kommen Gradtagzahlen des Deutschen Wetterdienstes je Bundesland, Energiepreise des Statistischen Bundesamts und der CO₂-Preis nach dem Brennstoffemissionshandelsgesetz. Wir verkaufen keine Heizungen und vermitteln keine Angebote.", "en": "Radif Partners works through a heating replacement the way the federal funding guideline and the promotional bank's information sheet define it: application date, household income, number of homes and the type of new system. On top come the German Weather Service's heating degree days per state, household energy prices from the Federal Statistical Office and the CO₂ price set by the Fuel Emissions Trading Act. We sell no heating systems and pass on no enquiries."};
/** Sujets sur lesquels l'editeur est competent (schema.org knowsAbout). Ce sont les
 *  themes reellement traites par le site, pas une liste de mots-cles : un sujet
 *  declare ici sans page qui le couvre est une declaration fausse. */
export const KNOWS_ABOUT: Record<string, string[]> = {"de": ["Heizungsförderung für Privatpersonen (Bundesförderung für effiziente Gebäude, Einzelmaßnahmen)", "Gebäudeenergiegesetz und Gebäudemodernisierungsgesetz", "CO₂-Preis nach dem Brennstoffemissionshandelsgesetz", "Kohlendioxidkostenaufteilungsgesetz"], "en": ["Germany's heating grant for private owners (federal efficient buildings funding, individual measures)", "Building Energy Act and the Building Modernisation Act in force since 29 July 2026", "CO₂ price under the Fuel Emissions Trading Act", "CO₂ cost split between landlord and tenant"]};
export const CONTACT_EMAIL = "kontakt@heizrechnen.de";
export const THEME_COLOR = '#9A3412';
export const LOGO_SYMBOL = 'WP';
export const BING_VERIFY_CODE = '';
export const GOOGLE_VERIFY_CODE = '';
/** Régime : 'none' pour tous les sites (RECETTE §15.6, décision de l'éditeur du 2026-10-06) :
 *  aucun bandeau ; Clarity chargé en mode sans cookie (consentv2 denied) ; GA4 avec cookies si GA4_ID.
 *  'opt-in' / 'notice' ne servent plus qu'aux sites anciens qui les portent encore. */
export const CONSENT_MODE: 'opt-in' | 'notice' | 'none' = 'none';
/** Propriété Google Analytics 4 (décision de l'éditeur du 2026-10-17, RECETTE §15.6) : GA4 normal,
 *  avec cookies _ga / _ga_<ID> (390 jours), sans bandeau, publicité refusée. Créée par
 *  `seo-platform/scripts/create-ga4.ts accounts/372759688` (RECETTE §15.3, étape 15), puis
 *  pages légales régénérées : `python3 scripts/gen-legal-pages.py .`. Vide = pas de GA4. */
export const GA4_ID = '';
/** Projet Microsoft Clarity (compte amradif), chargé sans cookie. Vide = aucune mesure. */
export const CLARITY_ID = '';
export const INDEXNOW_KEY = '41284eea9b1f0a43a4f29af91f20c3bc';

/* ------------------------------------------------------------------------- *
 * IDENTITÉ LÉGALE — À COMPLÉTER AVANT LA MISE EN LIGNE
 * Ces champs alimentent la mention légale du pays, la politique de confidentialité,
 * la page contact et le schema Organization. Un champ vide s'affiche en jaune
 * sur le site. Contrôle : `npm run check:legal`.
 * ------------------------------------------------------------------------- */
export interface LegalHosting { name: string; address: string; phone: string; url: string }
export interface LegalIdentity {
  entityName: string; legalForm: string; street: string; postalCode: string; city: string;
  country: string; phone: string; registerLabel: string; registerNumber: string;
  vatLabel: string; vatNumber: string; jurisdiction: string;
  supervisoryAuthority: string; supervisoryAuthorityUrl: string; hosting: LegalHosting;
}
export const LEGAL: LegalIdentity = {
  entityName: 'Radif Partners',  // éditeur de tous les sites du portefeuille (RECETTE §8)
  legalForm: '',  // vide : comme les autres sites du portefeuille
  street: '49 rue du Ressort',
  postalCode: '63000',
  city: 'Clermont-Ferrand',
  country: "Frankreich / France",
  phone: '',                 // ligne de contact publiée
  registerLabel: "SIREN",
  registerNumber: '',
  vatLabel: "USt-IdNr.",
  vatNumber: '',             // laisser vide si non assujetti
  jurisdiction: "France",
  supervisoryAuthority: "Commission nationale de l'informatique et des libertés (CNIL)",
  supervisoryAuthorityUrl: "https://www.cnil.fr",
  hosting: { name: 'GitHub, Inc. (GitHub Pages)', address: '88 Colin P Kelly Jr Street, San Francisco, CA 94107, United States', phone: '', url: 'https://pages.github.com' },
};

/** Champs sans lesquels le site ne doit pas être mis en ligne. */
export const LEGAL_REQUIRED: Array<keyof LegalIdentity> = ['entityName', 'street', 'postalCode', 'city'];

/** Profils publics de l'auteur (schema.org sameAs). Laisser vide si aucun. */
export const AUTHOR_SAME_AS: string[] = [];

/** Rythme de revue éditoriale annoncé sur le site, en mois. */
export const REVIEW_CYCLE_MONTHS = 12;

import { route, type Locale } from './routes';
import { PAGES, pageById, GROUPS } from '../lib/guides';
import type { Group } from '../lib/guide-types';
export interface NavLink { href: string; label: string } export interface NavCategory { label: string; links: NavLink[] }
const CORE: Record<Locale, Record<string, string>> = {
  de: { home: 'Heizungsförderung 2026', method: 'So rechnen wir', about: 'Über uns', widget: 'Rechner einbinden', contact: 'Kontakt', editorial: 'Redaktionsgrundsätze', privacy: 'Datenschutz', terms: 'Impressum', cookies: 'Cookies' },
  en: { home: 'Heating grant 2026', method: 'How we calculate', about: 'About', widget: 'Embed a calculator', contact: 'Contact', editorial: 'Editorial policy', privacy: 'Privacy', terms: 'Legal notice', cookies: 'Cookies' },
};
const GROUP_LABEL: Record<Locale, Record<Group, string>> = {
  de: { foerderung: 'Förderung', kosten: 'Kosten', co2: 'CO₂-Preis', gesetz: 'Gesetz' },
  en: { foerderung: 'Grants', kosten: 'Running costs', co2: 'CO₂ price', gesetz: 'The law' },
};
export const label = (id: string, lang: Locale) => CORE[lang][id] ?? pageById(id)?.[lang].nav ?? id;
const link = (id: string, lang: Locale): NavLink => ({ href: route(id, lang), label: label(id, lang) });
const inGroup = (g: Group, lang: Locale) => PAGES.filter((p) => p.group === g).map((p) => link(p.id, lang));
export function navCategories(lang: Locale): NavCategory[] {
  return GROUPS.map((g) => ({ label: GROUP_LABEL[lang][g], links: g === 'foerderung' ? [link('home', lang), ...inGroup(g, lang)] : inGroup(g, lang) })).filter((c) => c.links.length);
}
export const groupLabel = (g: Group, lang: Locale) => GROUP_LABEL[lang][g];
export const navDirect = (lang: Locale): NavLink[] => [link('method', lang)];
export const footerColumns = (lang: Locale): NavCategory[] => [
  ...GROUPS.map((g) => ({ label: GROUP_LABEL[lang][g], links: inGroup(g, lang) })).filter((c) => c.links.length),
  { label: lang === 'de' ? 'Über die Seite' : 'About the site', links: ['home', 'method', 'about', 'contact', 'editorial', 'widget', 'terms', 'privacy', 'cookies'].map((i) => link(i, lang)) },
];
export const popularLinks = (_lang: Locale): NavLink[] => [];

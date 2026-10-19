/** Auswahllisten der Rechner, in beiden Sprachen. */
import { P } from '../../lib/engine/params';
import type { AltHeizung, NeuHeizung, Gebaeude } from '../../lib/engine/foerderung';
import type { System } from '../../lib/engine/heizkosten';
import { tx, type L } from './kit';

export const janein = (l: L) => [{ value: '0', label: tx(l, 'Nein', 'No') }, { value: '1', label: tx(l, 'Ja', 'Yes') }];

/** Alte Heizung mit Alter in einem Feld: so sieht man sofort, ob der Klimageschwindigkeitsbonus greift. */
export const ALT_OPT: Array<{ value: string; alt: AltHeizung; jahre: number; de: string; en: string; system?: System }> = [
  { value: 'oel', alt: 'oel', jahre: 25, de: 'Ölheizung (jedes Alter)', en: 'Oil boiler (any age)', system: 'oel' },
  { value: 'gas20', alt: 'gas', jahre: 20, de: 'Gasheizung, 20 Jahre oder älter', en: 'Gas boiler, 20 years or older', system: 'gas' },
  { value: 'gas', alt: 'gas', jahre: 10, de: 'Gasheizung, jünger als 20 Jahre', en: 'Gas boiler, under 20 years old', system: 'gas' },
  { value: 'gasetage', alt: 'gasetage', jahre: 15, de: 'Gasetagenheizung (jedes Alter)', en: 'Gas heater per flat (any age)', system: 'gas' },
  { value: 'nachtspeicher', alt: 'nachtspeicher', jahre: 30, de: 'Nachtspeicherheizung', en: 'Electric storage heaters', system: 'nachtspeicher' },
  { value: 'kohle', alt: 'kohle', jahre: 30, de: 'Kohleofen oder Kohleheizung', en: 'Coal heating' },
  { value: 'bio20', alt: 'biomasse', jahre: 20, de: 'Holz oder Pellets, 20 Jahre oder älter', en: 'Wood or pellets, 20 years or older' },
  { value: 'bio', alt: 'biomasse', jahre: 10, de: 'Holz oder Pellets, jünger als 20 Jahre', en: 'Wood or pellets, under 20 years old' },
  { value: 'keine', alt: 'keine', jahre: 0, de: 'Keine Heizung zu ersetzen', en: 'No heating to replace' },
];
export const altOpt = (l: L) => ALT_OPT.map((o) => ({ value: o.value, label: l === 'en' ? o.en : o.de }));

export const neuOpt = (l: L): Array<{ value: NeuHeizung; label: string }> => [
  { value: 'wp', label: tx(l, 'Wärmepumpe', 'Heat pump') },
  { value: 'biomasse', label: tx(l, 'Pellet- oder Holzheizung', 'Pellet or wood boiler') },
  { value: 'netz', label: tx(l, 'Anschluss an ein Wärmenetz', 'Connection to a heat network') },
  { value: 'solar', label: tx(l, 'Solarthermie', 'Solar thermal') },
  { value: 'brennstoffzelle', label: tx(l, 'Brennstoffzellenheizung', 'Fuel cell heating') },
  { value: 'h2', label: tx(l, 'Wasserstofffähige Heizung (Mehrkosten)', 'Hydrogen-ready heating (extra cost)') },
];

export const gebOpt = (l: L): Array<{ value: Gebaeude; label: string }> => [
  { value: 'efh', label: tx(l, 'Einfamilienhaus', 'Single-family house') },
  { value: 'mfh', label: tx(l, 'Haus mit mehreren Wohnungen', 'House with several flats') },
  { value: 'weg', label: tx(l, 'Eigentümergemeinschaft, Zentralheizung', 'Owners’ association, central heating') },
  { value: 'etw', label: tx(l, 'Eigentumswohnung, eigene Heizung', 'Owner-occupied flat, own heater') },
];

export const landOpt = (l: L) => P.klima.laender.map((x) => ({ value: x.land, label: l === 'en' ? LAND_EN[x.land] ?? x.land : x.land }));
export const LAND_EN: Record<string, string> = {
  'Baden-Württemberg': 'Baden-Württemberg', Bayern: 'Bavaria', Berlin: 'Berlin', Brandenburg: 'Brandenburg', Bremen: 'Bremen', Hamburg: 'Hamburg', Hessen: 'Hesse',
  'Mecklenburg-Vorpommern': 'Mecklenburg-Western Pomerania', Niedersachsen: 'Lower Saxony', 'Nordrhein-Westfalen': 'North Rhine-Westphalia', 'Rheinland-Pfalz': 'Rhineland-Palatinate',
  Saarland: 'Saarland', Sachsen: 'Saxony', 'Sachsen-Anhalt': 'Saxony-Anhalt', 'Schleswig-Holstein': 'Schleswig-Holstein', Thüringen: 'Thuringia',
};

export const klasseOpt = (l: L) => P.gesetz.effizienzklassen.map((k, i, a) => ({
  value: k.k,
  label: k.bis === null ? tx(l, `${k.k} (über ${a[i - 1].bis} kWh/m²)`, `${k.k} (over ${a[i - 1].bis} kWh/m²)`) : tx(l, `${k.k} (bis ${k.bis} kWh/m²)`, `${k.k} (up to ${k.bis} kWh/m²)`),
}));

export const systemName = (s: System, l: L) => ({
  gas: tx(l, 'Gasheizung', 'Gas boiler'), oel: tx(l, 'Ölheizung', 'Oil boiler'), wp_luft: tx(l, 'Luft-Wärmepumpe', 'Air-source heat pump'), wp_sole: tx(l, 'Erdwärmepumpe', 'Ground-source heat pump'),
  fernwaerme: tx(l, 'Fernwärme', 'District heating'), nachtspeicher: tx(l, 'Nachtspeicher', 'Storage heaters'),
}[s]);

export const wpStromOpt = (l: L) => [
  { value: 'getrennt', label: tx(l, 'Wärmepumpentarif, eigener Zähler', 'Heat pump tariff, separate meter'), ct: P.preise.wp_strom_getrennt_ct },
  { value: 'gemeinsam', label: tx(l, 'Wärmepumpentarif, ein Zähler', 'Heat pump tariff, shared meter'), ct: P.preise.wp_strom_gemeinsam_ct },
  { value: 'haushalt', label: tx(l, 'Normaler Haushaltsstrom', 'Ordinary household electricity'), ct: P.preise.strom_haushalt_ct },
];

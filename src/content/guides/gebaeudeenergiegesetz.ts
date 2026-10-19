import { defineGuide } from '../../lib/guide-types';
import { laufend } from '../../lib/engine/heizkosten';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Gebäudeenergiegesetz: neuer Name GModG, Energieausweis (§§ 79 bis 88), Effizienzklassen (§ 86, Anlage 10),
 * Betreiberpflichten §§ 60b, 60c, Änderungen zum 01.01.2027 (Art. 2 des Gesetzes vom 23.07.2026).
 * Beispiel: Haus 140 m², Endenergie 145 kWh/m² laut Ausweis.
 */
const G = P.gesetz;
const K = G.effizienzklassen;
const klasseVon = (e: number) => K.find((x) => x.bis === null || e <= x.bis)!.k;
const flaeche = 140;
const kennwert = 145;
const klasse = klasseVon(kennwert);
const endenergie = flaeche * kennwert;
// Endenergie eines Gaskessels → Nutzwärme (mal Nutzungsgrad) → Strom einer Luft-Wärmepumpe.
const wp = laufend('wp_luft', endenergie * P.annahmen.nutzungsgrad_kessel)!;
const grenzeText = (i: number, l: 'de' | 'en') => {
  const k = K[i];
  const vor = i > 0 ? K[i - 1].bis : null;
  if (k.bis === null) return l === 'de' ? `über ${vor}` : `over ${vor}`;
  return vor === null ? (l === 'de' ? `bis ${k.bis}` : `up to ${k.bis}`) : (l === 'de' ? `über ${vor} bis ${k.bis}` : `over ${vor} to ${k.bis}`);
};

export default defineGuide({
  id: 'gebaeudeenergiegesetz',
  group: 'gesetz',
  order: 20,
  mini: 'klasse',
  miniHref: 'waermepumpe-stromverbrauch',
  related: ['heizungsgesetz', 'oelheizung-verbot', 'heizungsoptimierung', 'waermepumpe-stromverbrauch', 'heizkosten-rechner'],
  sources: ['gmodg', 'gmodgAnlage10', 'gmodgBgbl', 'geg2023'],
  de: {
    slug: 'gebaeudeenergiegesetz',
    nav: 'Gebäudeenergiegesetz',
    card: 'Was vom Gebäudeenergiegesetz unter neuem Namen bleibt: Energieausweis, Effizienzklassen A+ bis H, Pflichten der Eigentümer.',
    title: 'Gebäudeenergiegesetz 2026: Neuer Name, Ausweis und Klassen',
    description: 'Gebäudeenergiegesetz 2026: Seit 29.07.2026 heißt es GModG. Energieausweis, Effizienzklassen A+ bis H, Pflichten bei Kauf und Vermietung und was 2027 kommt.',
    h1: 'Gebäudeenergiegesetz 2026: was unter dem neuen Namen gilt',
    intro: 'Das Gebäudeenergiegesetz gibt es weiter, nur unter neuem Titel. Für Energieausweis, Effizienzklasse und die Pflichten bei Kauf und Vermietung finden Sie hier die geltende Fassung.',
    resume: `Das Gebäudeenergiegesetz (GEG) von 2020 heißt seit dem 29. Juli 2026 Gebäudemodernisierungsgesetz (GModG). Gestrichen wurden vor allem die Heizungsregeln der §§ 71 bis 73, also die ${DE.pct(G.alt_65_prozent)}-Pflicht und die Austauschpflicht nach ${G.alt_kessel_jahre} Jahren. Der übrige Teil gilt weiter: Anforderungen an Neubauten und Sanierungen, Dämmpflichten nach einem Eigentümerwechsel, Prüfpflichten für Heizungen in größeren Häusern und der Energieausweis. Wer ein Haus verkauft oder eine Wohnung vermietet, muss einen gültigen Ausweis vorlegen, der zehn Jahre gilt und die Effizienzklasse nach Anlage 10 zeigt, von A+ bis H. Ein Haus mit ${DE.num(flaeche)} m² und einem Endenergiekennwert von ${DE.num(kennwert)} kWh je m² liegt in Klasse ${klasse} und braucht rund ${DE.num(endenergie)} kWh im Jahr; eine Luft-Wärmepumpe käme dort auf etwa ${DE.num(wp.menge)} kWh Strom. Ab dem 1. Januar 2027 wird der Energieausweis digital ausgestellt, die Klassengrenzen für Wohngebäude bleiben gleich.`,
    faqs: [
      { q: 'Gibt es das Gebäudeenergiegesetz noch?', a: 'Ja, unter neuem Namen. Das Gesetz vom 23. Juli 2026 hat das Gebäudeenergiegesetz nicht aufgehoben, sondern umbenannt und geändert. Paragrafen wie § 35 (Dämmung der obersten Geschossdecke), § 80 (Energieausweis) oder Anlage 10 (Effizienzklassen) stehen an derselben Stelle. Wer in einem Vertrag oder Bescheid „GEG“ liest, meint heute in der Regel die Vorschrift des GModG mit derselben Nummer.' },
      { q: 'Wie lange gilt ein Energieausweis?', a: 'Zehn Jahre ab Ausstellung, so § 79 Absatz 3. Er verliert seine Gültigkeit früher, wenn das Gebäude so umgebaut wird, dass ein neuer Bedarfsausweis nach § 80 Absatz 2 ausgestellt werden muss. Für Verkauf und Vermietung genügt ein gültiger Ausweis, ein neuer ist dann nicht nötig. Ältere Ausweise nennen die Effizienzklasse teils nicht, Anzeigen müssen dann weniger Angaben enthalten.' },
      { q: 'Bedarfsausweis oder Verbrauchsausweis: welcher ist Pflicht?', a: 'Für Wohngebäude mit weniger als fünf Wohnungen, deren Bauantrag vor dem 1. November 1977 gestellt wurde, ist bei Verkauf und Vermietung ein Bedarfsausweis nötig, es sei denn, das Haus erfüllte schon damals die Wärmeschutzverordnung von 1977 oder wurde später mindestens auf diesen Stand gebracht. In allen anderen Fällen ist der günstigere Verbrauchsausweis erlaubt (§ 80 Absatz 3).' },
      { q: 'Was muss in einer Immobilienanzeige zum Energieausweis stehen?', a: 'Liegt ein Energieausweis vor, nennt § 87 fünf Pflichtangaben für Wohngebäude: die Art des Ausweises, den Kennwert für Endenergiebedarf oder Endenergieverbrauch, den wesentlichen Energieträger der Heizung, das Baujahr und die Effizienzklasse. Verantwortlich ist, wer die Anzeige aufgibt, also Verkäufer, Vermieter oder Makler. Fehlt der Ausweis noch, entfällt die Pflicht für die Anzeige, nicht aber für die Besichtigung.' },
      { q: 'Muss die Heizung in einem Mehrfamilienhaus geprüft werden?', a: 'Ja, ab sechs Wohnungen. Nach § 60b müssen Heizungen mit Wasser als Wärmeträger, die keine Wärmepumpen sind, nach 15 Jahren geprüft und optimiert werden; Anlagen von vor Oktober 2009 bis zum 30. September 2027. Nach § 60c ist eine neue Heizung in solchen Häusern hydraulisch abzugleichen. Für Wärmepumpen gilt eine eigene Prüfpflicht nach § 60a.' },
    ],
    body: (h) => `
<h2>Ein Gesetz, zwei Namen</h2>
<p>Viele Verträge, Angebote und Behördenschreiben sprechen noch vom GEG. Das ist nicht falsch: Das ${h.src('gmodgBgbl', 'Gesetz vom 23. Juli 2026')} hat in Artikel 1 nur die Überschrift ersetzt und einzelne Paragrafen geändert oder gestrichen. Die Abkürzung auf ${h.src('gmodg', 'gesetze-im-internet.de')} ist gleich geblieben, die Zählung der Paragrafen auch. Gestrichen sind vor allem die §§ 71 bis 73 mit den Heizungsregeln von 2024, neu sind §§ 42, 42a und 43 mit der Wahlfreiheit und der Stufenpflicht für neue Gas- und Ölheizungen (${h.a('heizungsgesetz', 'Heizungsgesetz')}). Für Neubauten kündigt das Änderungsgesetz den nächsten großen Schritt schon an: Ab dem 1. Januar 2028 müssen neue Behördengebäude der öffentlichen Hand Nullemissionsgebäude sein, ab dem 1. Januar 2030 jedes neue Gebäude. Ein Nullemissionsgebäude verursacht am Standort kein CO₂ aus fossilen Brennstoffen. Für bestehende Häuser folgt daraus keine Pflicht, wohl aber ein Hinweis darauf, wohin die Anforderungen sich bewegen.</p>

<h2>Die Effizienzklassen nach Anlage 10</h2>
<p>Die Klasse im Energieausweis ergibt sich nach § 86 unmittelbar aus dem Endenergieverbrauch oder Endenergiebedarf je Quadratmeter Nutzfläche und Jahr. Die Grenzen stehen in ${h.src('gmodgAnlage10', 'Anlage 10')}.</p>
${h.table(['Klasse', 'kWh je m² und Jahr', 'Haus mit 140 m²'], K.map((k, i) => [k.k, grenzeText(i, 'de'), k.bis === null ? `über ${h.num(flaeche * (K[i - 1].bis as number))} kWh` : `bis ${h.num(flaeche * k.bis)} kWh`]), 'Anlage 10 GModG, Wohngebäude', ['l', 'r', 'r'])}
<p>Die Klasse sagt etwas über die Energiemenge, nicht über die Art der Heizung. Ein Haus der Klasse ${klasse} mit ${h.num(kennwert)} kWh je m² verbraucht mit einem Gaskessel rund ${h.num(endenergie)} kWh Gas. Weil eine Wärmepumpe aus einer kWh Strom mehrere kWh Wärme macht, bräuchte sie im selben Haus etwa ${h.num(wp.menge)} kWh Strom, gerechnet mit dem Nutzungsgrad eines Kessels von ${h.pct(P.annahmen.nutzungsgrad_kessel)} und der gemessenen Jahresarbeitszahl ${h.num(P.technik.jaz_luft_messung, 1)}. Der Rechner unten macht diese Umrechnung mit Ihren Werten, ohne Korrektur für das Klima Ihres Bundeslands. Die genaue Rechnung mit Ort steht unter ${h.a('waermepumpe-stromverbrauch', 'Stromverbrauch der Wärmepumpe')}.</p>

<h2>Energieausweis: wann, welcher, wie lange</h2>
${h.table(['Anlass', 'Pflicht', 'Paragraf'], [
  ['Neubau', 'Bedarfsausweis nach Fertigstellung', '§ 80 Abs. 1'],
  ['Größere Sanierung mit Gesamtberechnung', 'neuer Bedarfsausweis', '§ 80 Abs. 2'],
  ['Verkauf, Vermietung, Verpachtung', 'gültigen Ausweis spätestens bei der Besichtigung vorlegen, nach Vertragsschluss übergeben', '§ 80 Abs. 3 und 4'],
  ['Immobilienanzeige', 'fünf Pflichtangaben, wenn ein Ausweis vorliegt', '§ 87'],
  ['Kauf eines Hauses mit bis zu zwei Wohnungen', 'Beratungsgespräch des Käufers, wenn kostenlos angeboten', '§ 80 Abs. 4'],
], 'GModG, Stand 19.10.2026', ['l', 'l', 'l'])}
<p>Ein Energieausweis gilt zehn Jahre (§ 79 Absatz 3). Wer selbst im Haus wohnt und weder verkauft noch vermietet, braucht keinen. Ab dem 1. Januar 2027 wird er nach Artikel 2 des Änderungsgesetzes digital in einem maschinenlesbaren Format ausgestellt, auf Wunsch auch auf Papier. Gleichzeitig ändert sich die Bezugsfläche: Anlage 10 bezieht sich dann auf die beheizte oder gekühlte Nutzfläche nach einer neuen Norm. Die Klassengrenzen von A+ bis H bleiben für Wohngebäude unverändert, für Nichtwohngebäude kommt mit Anlage 10a eine eigene Skala hinzu.</p>
<!--mini:oelweiter-->

<h2>Pflichten, die mit dem Haus kommen</h2>
<p>Wer ein Ein- oder Zweifamilienhaus kauft, muss binnen zwei Jahren die oberste Geschossdecke dämmen, wenn sie den Mindestwärmeschutz nicht erfüllt (§ 35), und zugängliche, ungedämmte Heizungs- und Warmwasserleitungen in unbeheizten Räumen (§ 69). Werden Fenster, Dach oder Fassade erneuert, gelten für die neuen Bauteile die Höchstwerte der Anlage 7, sofern mehr als 10 Prozent der jeweiligen Fläche betroffen sind (§ 36). In Häusern ab sechs Wohnungen kommen die Prüfung und Optimierung älterer Heizungen nach § 60b und der hydraulische Abgleich nach § 60c hinzu. Für kleinere Häuser fördert das BAFA die Optimierung freiwillig (${h.a('heizungsoptimierung', 'Heizungsoptimierung')}). Was für eine alte Ölheizung beim Kauf gilt, steht unter ${h.a('oelheizung-verbot', 'Ölheizung Verbot')}.</p>

<h2>Was aus dem GEG 2024 nicht mehr gilt</h2>
<p>Ratgeber, die vor August 2026 geschrieben wurden, nennen oft Pflichten, die es nicht mehr gibt: die ${h.pct(G.alt_65_prozent)}-Regel für neue Heizungen, Fristen, die an die kommunale Wärmeplanung gekoppelt waren, die Beratungspflicht vor dem Einbau einer fossilen Heizung und das Betriebsverbot für Kessel nach ${h.num(G.alt_kessel_jahre)} Jahren. Sie standen in der ${h.src('geg2023', 'Fassung von 2024')} und galten bis zum 28. Juli 2026. Für die Wahl einer neuen Heizung zählt heute allein § 42 mit seinen zehn Optionen. Die laufenden Heizkosten Ihres Hauses berechnet der ${h.a('heizkosten-rechner', 'Heizkostenrechner')}.</p>`,
  },
  en: {
    slug: 'building-energy-act',
    nav: 'Building Energy Act',
    card: 'What remains of the German Building Energy Act under its new name: energy certificate, classes A+ to H, owners’ duties.',
    title: 'Building Energy Act Germany 2026: Certificate and Classes',
    description: 'Building Energy Act Germany 2026: since 29 July 2026 it is the GModG. Energy certificate, classes A+ to H, duties when selling or letting, and the 2027 changes.',
    h1: 'Germany’s Building Energy Act in 2026: what applies under the new name',
    intro: 'The Building Energy Act still exists, only under a new title. Here is the version in force for the energy certificate, the efficiency class and the duties when you buy, sell or let.',
    resume: `Germany’s 2020 Building Energy Act (Gebäudeenergiegesetz, GEG) has been called the Building Modernisation Act (GModG) since 29 July 2026. The main deletions are the heating rules in sections 71 to 73, namely the ${EN.pct(G.alt_65_prozent)} duty and the replacement duty after ${G.alt_kessel_jahre} years. The rest still applies: requirements for new builds and renovations, insulation duties after a change of ownership, inspection duties for heating in larger buildings and the energy performance certificate (Energieausweis). Anyone selling a house or letting a flat must show a valid certificate, which lasts ten years and gives the efficiency class under annex 10, from A+ to H. A ${EN.num(flaeche)} m² house with a final energy figure of ${EN.num(kennwert)} kWh per m² is in class ${klasse} and needs about ${EN.num(endenergie)} kWh a year; an air source heat pump there would use about ${EN.num(wp.menge)} kWh of electricity. From 1 January 2027 certificates are issued digitally, and the class limits for homes stay the same.`,
    faqs: [
      { q: 'Does the German Building Energy Act still exist?', a: 'Yes, under a new name. The act of 23 July 2026 did not repeal the Building Energy Act but renamed and amended it. Sections such as 35 (insulating the top floor ceiling), 80 (energy certificate) or annex 10 (efficiency classes) sit in the same place. When a contract or notice says "GEG", it now usually means the GModG provision with the same number.' },
      { q: 'How long is a German energy certificate valid?', a: 'Ten years from issue, under section 79(3). It loses validity earlier if the building is altered in a way that requires a new demand-based certificate under section 80(2). For a sale or letting, any valid certificate is enough; a new one is not needed. Older certificates sometimes lack the efficiency class, and adverts then need fewer details.' },
      { q: 'Demand or consumption certificate: which one is required?', a: 'Residential buildings with fewer than five homes whose planning application predates 1 November 1977 need a demand-based certificate for sale or letting, unless the house already met the 1977 thermal insulation ordinance or was later brought up to that level. In all other cases the cheaper consumption-based certificate is allowed (section 80(3)).' },
      { q: 'What must a property advert say about the energy certificate?', a: 'If a certificate exists, section 87 sets five mandatory details for homes: the type of certificate, the final energy demand or consumption figure, the main heating fuel, the year of construction and the efficiency class. The person placing the advert is responsible: seller, landlord or agent. If no certificate exists yet, the duty for the advert lapses, but not for the viewing.' },
      { q: 'Must the heating in an apartment building be inspected?', a: 'Yes, from six homes. Under section 60b, water-based heating systems that are not heat pumps must be checked and optimised after 15 years; systems from before October 2009 by 30 September 2027. Under section 60c a new heating system in such buildings must be hydraulically balanced. Heat pumps have their own inspection duty under section 60a.' },
    ],
    body: (h) => `
<h2>One law, two names</h2>
<p>Many contracts, quotes and official letters still refer to the GEG. That is not wrong: article 1 of the ${h.src('gmodgBgbl', 'act of 23 July 2026')} only replaced the title and changed or deleted individual sections. The abbreviation on ${h.src('gmodg', 'gesetze-im-internet.de')} stayed the same, and so did the numbering. The main deletions are sections 71 to 73 with the 2024 heating rules; new are sections 42, 42a and 43 with free choice and the staged duty for new gas and oil boilers (${h.a('heizungsgesetz', 'heating law')}). There is no official English translation of the current text, so rely on the German one.</p>

<h2>Efficiency classes under annex 10</h2>
<p>Under section 86 the class in the certificate follows directly from final energy consumption or demand per square metre of floor area per year. The limits are in ${h.src('gmodgAnlage10', 'annex 10')}.</p>
${h.table(['Class', 'kWh per m² a year', 'House of 140 m²'], K.map((k, i) => [k.k, grenzeText(i, 'en'), k.bis === null ? `over ${h.num(flaeche * (K[i - 1].bis as number))} kWh` : `up to ${h.num(flaeche * k.bis)} kWh`]), 'Annex 10 GModG, residential buildings', ['l', 'r', 'r'])}
<p>The class describes the amount of energy, not the type of heating. A class ${klasse} house at ${h.num(kennwert)} kWh per m² burns about ${h.num(endenergie)} kWh of gas with a boiler. Because a heat pump turns one kWh of electricity into several kWh of heat, it would need about ${h.num(wp.menge)} kWh of electricity in the same house, based on a boiler efficiency of ${h.pct(P.annahmen.nutzungsgrad_kessel)} and the measured seasonal performance factor of ${h.num(P.technik.jaz_luft_messung, 1)}. The calculator below does this conversion with your figures, without adjusting for your state’s climate. The full calculation by location is under ${h.a('waermepumpe-stromverbrauch', 'heat pump electricity use')}.</p>

<h2>Energy certificate: when, which, how long</h2>
${h.table(['Occasion', 'Duty', 'Section'], [
  ['New build', 'demand-based certificate on completion', '80(1)'],
  ['Major renovation with whole-building calculation', 'new demand-based certificate', '80(2)'],
  ['Sale, letting, leasing', 'show a valid certificate at the viewing at the latest, hand it over after signing', '80(3) and (4)'],
  ['Property advert', 'five mandatory details if a certificate exists', '87'],
  ['Buying a house with up to two homes', 'consultation for the buyer, where offered free', '80(4)'],
], 'GModG, as of 19 October 2026', ['l', 'l', 'l'])}
<p>A certificate is valid for ten years (section 79(3)). If you live in your house and neither sell nor let, you do not need one. From 1 January 2027, under article 2 of the amending act, it is issued digitally in a machine-readable format, on paper on request. The reference area changes at the same time: annex 10 will then refer to heated or cooled floor area under a new standard. The class limits A+ to H stay the same for homes, while non-residential buildings get their own scale in annex 10a. When buying, ask for the certificate early: as a foreign buyer you may not otherwise see the class before the notary appointment.</p>
<!--mini:oelweiter-->

<h2>Duties that come with the house</h2>
<p>If you buy a one or two-family house, you have two years to insulate the top floor ceiling if it falls short of minimum thermal protection (section 35), and accessible, uninsulated heating and hot water pipes in unheated rooms (section 69). When windows, roof or facade are renewed, the new parts must meet the limits in annex 7, as long as more than 10 per cent of the relevant area is affected (section 36). Buildings with six or more homes add the check and optimisation of older heating under section 60b and hydraulic balancing under section 60c. For smaller houses BAFA funds optimisation on a voluntary basis (${h.a('heizungsoptimierung', 'heating optimisation')}). What applies to an old oil boiler when you buy is under ${h.a('oelheizung-verbot', 'oil heating ban')}.</p>

<h2>What no longer applies from the 2024 version</h2>
<p>Guides written before August 2026 often list duties that no longer exist: the ${h.pct(G.alt_65_prozent)} rule for new heating, deadlines tied to municipal heat planning, mandatory advice before fitting fossil heating and the operating ban on boilers after ${h.num(G.alt_kessel_jahre)} years. They were in the ${h.src('geg2023', '2024 version')} and applied until 28 July 2026. The ${h.a('heizkosten-rechner', 'heating cost calculator')} works out the running costs of your house.</p>`,
  },
});

import { defineGuide } from '../../lib/guide-types';
import { nutzwaerme, laufend } from '../../lib/engine/heizkosten';
import { co2Kosten, aufschlagCent, kgJeLiterOel } from '../../lib/engine/co2';
import { foerderung } from '../../lib/engine/foerderung';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Ölheizung „Verbot“: § 72 GEG (30 Jahre) und das Ende 2044 sind mit dem GModG gestrichen (Art. 1, „Die §§ 71 bis 73
 * werden gestrichen“). Pflichten beim Hauskauf: § 35 Abs. 3 und § 69 Abs. 3 und 4 GModG. Beispiel: 150 m², Klasse F, Bayern.
 */
const G = P.gesetz;
const C = P.co2;
const q = nutzwaerme({ flaeche: 150, klasse: 'F', land: 'Bayern' });
const oel = laufend('oel', q)!;
const wp = laufend('wp_luft', q)!;
const co2Jetzt = co2Kosten('oel', oel.menge, C.auktion_2026_durchschnitt);
const co2Start = co2Kosten('oel', oel.menge, C.preise_fest[0].preis);
const ctJetzt = aufschlagCent('oel', C.auktion_2026_durchschnitt);
const zuschuss = foerderung({ antrag: P.retrieved_at, gebaeude: 'efh', einheiten: 1, kosten: 36000, selbstnutzer: true, alt: 'oel', altJahre: 32, neu: 'wp', wpEU: true, zve: 75000, kind: false });
const zuschussAug28 = foerderung({ antrag: '2028-08-01', gebaeude: 'efh', einheiten: 1, kosten: 36000, selbstnutzer: true, alt: 'oel', altJahre: 34, neu: 'wp', wpEU: true, zve: 75000, kind: false });
const T = G.biotreppe;
const jahr = (iso: string) => iso.slice(0, 4);

export default defineGuide({
  id: 'oelheizung-verbot',
  group: 'gesetz',
  order: 40,
  mini: 'oelweiter',
  miniHref: 'waermepumpe-foerderung',
  related: ['gasheizung-verbot', 'heizungsgesetz', 'co2-preis-heizoel', 'klimageschwindigkeitsbonus', 'heizungstausch-kosten', 'waermepumpe-foerderung'],
  sources: ['gmodgBgbl', 'gmodg', 'geg2023', 'gmodg43', 'kfw458', 'wob'],
  de: {
    slug: 'oelheizung-verbot',
    nav: 'Ölheizung Verbot',
    card: 'Ob eine alte Ölheizung raus muss, was beim Hauskauf gilt und was das Weiterheizen mit Öl im Jahr kostet.',
    title: 'Ölheizung Verbot 2026: Kein Austausch mehr nach 30 Jahren',
    description: `Ölheizung Verbot 2026: Die Pflicht, Kessel nach ${G.alt_kessel_jahre} Jahren zu tauschen, ist seit 29.07.2026 gestrichen. Was beim Hauskauf gilt, CO₂-Kosten und Zuschuss.`,
    h1: 'Ölheizung Verbot: Was für alte und neue Ölheizungen gilt',
    intro: 'Keine Ölheizung muss wegen ihres Alters raus, und eine neue ist wieder erlaubt. Was bleibt, sind der CO₂-Preis, ein paar Pflichten beim Hauskauf und ein Zuschuss, der jedes halbe Jahr kleiner wird.',
    resume: `Eine Ölheizung muss in Deutschland seit dem 29. Juli 2026 nicht mehr wegen ihres Alters ausgetauscht werden. Das Gebäudemodernisierungsgesetz hat § 72 gestrichen, nach dem Öl- und Gaskessel mit konstanter Temperatur nach ${G.alt_kessel_jahre} Jahren außer Betrieb gehen mussten, und mit ihm das Ende fossiler Brennstoffe am ${DE.num(31)}. Dezember 2044. Auch eine neue Ölheizung darf wieder eingebaut werden, muss aber ab ${jahr(T[0].ab)} einen steigenden Anteil Bioöl nutzen. Teurer wird das Weiterheizen über den CO₂-Preis: Ein Haus mit 150 m² in Klasse F in Bayern braucht rund ${DE.num(oel.menge)} Liter im Jahr, bei ${DE.eur(C.auktion_2026_durchschnitt)} je Tonne sind das ${DE.eur(co2Jetzt)} CO₂-Kosten, im Jahr 2021 waren es ${DE.eur(co2Start)}. Wer jetzt auf eine Wärmepumpe zu ${DE.eur(36000)} umsteigt und selbst im Haus wohnt, bekommt bei ${DE.eur(75000)} Einkommen ${DE.eur(zuschuss.zuschuss)} Zuschuss, weil für Öl der Klimageschwindigkeitsbonus ohne Altersgrenze gilt. Bei einem Antrag ab August 2028 wären es nur noch ${DE.eur(zuschussAug28.zuschuss)}.`,
    faqs: [
      { q: 'Muss meine 35 Jahre alte Ölheizung jetzt raus?', a: `Nein. Die Pflicht, Heizkessel nach ${G.alt_kessel_jahre} Jahren außer Betrieb zu nehmen, stand in § 72 des alten Gebäudeenergiegesetzes und ist seit dem 29. Juli 2026 gestrichen. Solange der Kessel funktioniert, darf er weiterlaufen, auch mit gewöhnlichem Heizöl. Gegen einen späteren Ausfall hilft nur Planung: Ein Antrag auf Förderung muss vor dem Auftrag gestellt werden.` },
      { q: 'Ich kaufe ein Haus mit Ölheizung: Was muss ich nachrüsten?', a: 'Die Heizung selbst nicht. Wer ein Ein- oder Zweifamilienhaus kauft, muss nach § 35 Absatz 3 GModG binnen zwei Jahren die oberste Geschossdecke dämmen, wenn sie den Mindestwärmeschutz nicht erfüllt, und nach § 69 Absatz 3 und 4 ungedämmte, zugängliche Heizungs- und Warmwasserleitungen in unbeheizten Räumen. Beide Pflichten entfallen, wenn sich die Kosten nicht in angemessener Frist durch Einsparungen tragen.' },
      { q: 'Darf ich eine alte Ölheizung durch eine neue ersetzen?', a: `Ja, § 42 nennt Heizöl ausdrücklich. Für eine Ölheizung, die nach dem 29. Juli 2026 eingebaut wird, gilt aber § 43: ab ${jahr(T[0].ab)} mindestens ${DE.pct(T[0].anteil)} der Wärme aus Bioöl oder einem anderen klimafreundlichen Brennstoff, ab ${jahr(T[3].ab)} ${DE.pct(T[3].anteil)}. Einen Zuschuss gibt es für einen neuen Ölkessel nicht.` },
      { q: 'Wie viel CO₂-Preis steckt in einem Liter Heizöl?', a: `Bei ${DE.eur(C.auktion_2026_durchschnitt)} je Tonne, dem Durchschnitt der Versteigerungen 2026, rund ${DE.num(ctJetzt)} Cent je Liter mit Mehrwertsteuer. Grundlage sind die amtlichen Standardwerte für Heizöl: Ein Liter verursacht etwa ${DE.num(kgJeLiterOel, 1)} kg CO₂. Die Tabelle für alle Jahre seit 2021 steht unter CO₂-Preis Heizöl.` },
      { q: 'Lohnt sich der Wechsel weg vom Öl gerade jetzt?', a: `Für Selbstnutzer spricht der Kalender dafür: Der Klimageschwindigkeitsbonus für den Ersatz einer Ölheizung sinkt ab Februar 2027 jedes halbe Jahr und entfällt für Anträge ab dem 1. August 2028. Im Beispiel mit ${DE.eur(36000)} und ${DE.eur(75000)} Einkommen fällt der Zuschuss so von ${DE.eur(zuschuss.zuschuss)} auf ${DE.eur(zuschussAug28.zuschuss)}. Ob sich die Wärmepumpe im Betrieb rechnet, hängt vom Haus ab.` },
    ],
    body: (h) => `
<h2>Was gestrichen ist</h2>
<p>Bis zum 28. Juli 2026 enthielt das Gebäudeenergiegesetz zwei Regeln, die viele Ölheizungen betrafen. § 72 untersagte den Betrieb älterer Öl- und Gaskessel nach ${G.alt_kessel_jahre} Jahren, mit Ausnahmen unter anderem für Niedertemperatur- und Brennwertkessel. Absatz 4 setzte ein Ende für fossile Brennstoffe in Heizkesseln am 31. Dezember 2044 (${h.src('geg2023', 'GEG 2024')}). Mit dem ${h.src('gmodgBgbl', 'Gesetz vom 23. Juli 2026')} sind die §§ 71 bis 73 vollständig gestrichen. Im ${h.src('gmodg', 'geltenden Text')} steht bei § 72 nur noch „weggefallen“.</p>
<p>Damit entfällt auch die Ausnahme für Eigentümer, die ihr Haus schon am 1. Februar 2002 selbst bewohnten: Sie brauchen sie nicht mehr, weil es keine Austauschpflicht mehr gibt. Ratgeber, die noch „Ölheizung nach 30 Jahren raus“ oder „Ölheizungsverbot ab 2026“ schreiben, beschreiben ein Recht, das nicht mehr gilt.</p>

<h2>Was beim Hauskauf bleibt</h2>
<p>Wer ein Haus mit Ölheizung kauft, erbt keine Pflicht zum Heizungstausch, aber zwei ältere Nachrüstpflichten, die das GModG behalten hat. Beide treffen bei Ein- und Zweifamilienhäusern den neuen Eigentümer, Frist zwei Jahre ab dem Eigentumsübergang.</p>
${h.table(['Pflicht', 'Paragraf', 'Was genau'], [
  ['Oberste Geschossdecke dämmen', '§ 35 Abs. 1 und 3', 'wenn sie den Mindestwärmeschutz nicht erfüllt, auf höchstens 0,24 W/(m²K); erfüllt, wenn stattdessen das Dach gedämmt ist'],
  ['Rohrleitungen dämmen', '§ 69 Abs. 2 bis 4', 'bisher ungedämmte, zugängliche Heizungs- und Warmwasserleitungen außerhalb beheizter Räume'],
  ['Heizung tauschen', '§ 72 alt', 'gestrichen seit 29.07.2026'],
], 'Gebäudemodernisierungsgesetz, Stand 19.10.2026', ['l', 'l', 'l'])}
<p>Rechnet sich eine Nachrüstung durch die Einsparungen nicht in angemessener Frist, muss der Eigentümer sie bei Häusern mit höchstens zwei Wohnungen, von denen er eine selbst bewohnt, nicht ausführen. Der Energieausweis, den der Verkäufer vorlegen muss, zeigt die Effizienzklasse und damit, wie viel Öl das Haus etwa braucht (${h.a('gebaeudeenergiegesetz', 'Effizienzklassen')}).</p>

<h2>Weiterheizen: was das Öl kostet</h2>
<p>Für das Beispielhaus mit 150 m² in Klasse F in Bayern rechnet der Rechner mit ${h.num(oel.menge)} Litern im Jahr. Mit dem Heizölpreis aus dem ${h.src('wob', 'Weekly Oil Bulletin')} im Schnitt der letzten zwölf Monate kostet das ${h.eur(oel.kosten)}. Darin stecken bei ${h.eur(C.auktion_2026_durchschnitt)} je Tonne ${h.eur(co2Jetzt)} CO₂-Kosten. Wie sich dieser Anteil seit 2021 entwickelt hat und was für 2027 beschlossen ist, steht unter ${h.a('co2-preis-heizoel', 'CO₂-Preis Heizöl')}.</p>
<!--mini:co2oel-->
<p>Dieselbe Wärme mit einer Luft-Wärmepumpe und einer im Feld gemessenen Jahresarbeitszahl von ${h.num(P.technik.jaz_luft_messung, 1)} braucht rund ${h.num(wp.menge)} kWh Strom, im Wärmepumpentarif ${h.eur(wp.kosten)} im Jahr. Der Unterschied von ${h.eur(oel.kosten - wp.kosten)} ist kein Versprechen: Er hängt an den Heizkörpern, der Vorlauftemperatur und den Preisen der nächsten Jahre.</p>

<h2>Eine neue Ölheizung</h2>
<p>Wer wieder mit Öl heizen will, darf das nach § 42. Für Kessel, die nach dem 29. Juli 2026 eingebaut werden, verlangt ${h.src('gmodg43', '§ 43')} einen Mindestanteil an Bioöl oder einem gleichwertigen Brennstoff: ${T.map((s) => `${h.pct(s.anteil)} ab ${jahr(s.ab)}`).join(', ')}. Ein Zuschuss aus dem Programm 458 ist für einen Ölkessel ausgeschlossen. Wer vermietet, trägt ab ${jahr(P.aufteilung.neue_fossile_heizung_ab)} für eine solche neue Heizung die Hälfte der CO₂-Kosten. Die Regeln gelten für Gas genauso, siehe ${h.a('gasheizung-verbot', 'Gasheizung Verbot')}.</p>

<h2>Bedingungen des Bonus beim Abschied vom Öl</h2>
<p>Den Klimageschwindigkeitsbonus gibt es nur, wenn die Ölheizung zum Zeitpunkt des Antrags noch funktioniert. Wer wartet, bis der Kessel endgültig ausfällt, verliert ihn, und der Antrag muss trotzdem vor dem Auftrag gestellt werden. Die alte Anlage muss fachgerecht demontiert und entsorgt werden. Danach dürfen die versorgten Wohnungen nicht mehr mit einer fossilen Heizung im oder am Gebäude beheizt werden, ein Ölkessel als Reserve neben der Wärmepumpe schließt den Bonus also aus (Richtlinie Nr. 8.4.4). Der Bonus gilt nur für die Wohnung, die der Eigentümer selbst als Hauptwohnsitz bewohnt. Ein Öltank, der nach dem Umbau leer steht, ist ein eigenes Thema: Ob und wie er stillgelegt werden muss, regelt das Wasserrecht, nicht das GModG.</p>

<h2>Warum der Zuschuss für Ölhaushalte drängt</h2>
<p>Beim Ersatz einer funktionierenden Ölheizung gibt es den Klimageschwindigkeitsbonus unabhängig vom Alter des Kessels, bei Gas erst ab 20 Jahren (${h.src('kfw458', 'KfW 458')}). Dieser Bonus sinkt für Anträge ab dem 1. Februar 2027 von ${h.pct(P.foerderung.kgb_stufen[0].satz)} auf ${h.pct(P.foerderung.kgb_stufen[1].satz)} und entfällt ab dem 1. August 2028 ganz, während der Höchstbetrag förderfähiger Kosten parallel sinkt. Im Beispiel macht das ${h.eur(zuschuss.zuschuss - zuschussAug28.zuschuss)} Unterschied. Den Verlauf für Ihren Fall zeigt der ${h.a('waermepumpe-foerderung', 'Förderrechner')}, Einzelheiten zum Bonus stehen unter ${h.a('klimageschwindigkeitsbonus', 'Klimageschwindigkeitsbonus')}.</p>`,
  },
  en: {
    slug: 'oil-heating-ban-germany',
    nav: 'Oil heating ban',
    card: 'Whether an old oil boiler must go, what applies when you buy a house and what carrying on with oil costs a year.',
    title: 'Oil Heating Ban Germany 2026: No 30-Year Replacement Rule',
    description: `Oil heating ban in Germany 2026: the duty to replace boilers after ${G.alt_kessel_jahre} years ended on 29 July 2026. Rules when buying a house, CO₂ cost and the grant to switch.`,
    h1: 'Oil heating ban in Germany: rules for old and new oil boilers',
    intro: 'No oil boiler has to go because of its age, and a new one is allowed again. What remains is the CO₂ price, a few duties when you buy a house and a grant that shrinks every six months.',
    resume: `Since 29 July 2026 an oil boiler in Germany no longer has to be replaced because of its age. The Building Modernisation Act deleted section 72, which forced constant-temperature oil and gas boilers out of service after ${G.alt_kessel_jahre} years, and with it the end date for fossil fuels on 31 December 2044. A new oil boiler may be installed again, but from ${jahr(T[0].ab)} it must use a rising share of bio-oil. Carrying on gets dearer through the CO₂ price: a 150 m² house in class F in Bavaria burns about ${EN.num(oel.menge)} litres a year, which at ${EN.eur(C.auktion_2026_durchschnitt)} per tonne means ${EN.eur(co2Jetzt)} of CO₂ cost, against ${EN.eur(co2Start)} in 2021. If you live in the house and switch now to a ${EN.eur(36000)} heat pump, you receive ${EN.eur(zuschuss.zuschuss)} on an income of ${EN.eur(75000)}, because the climate speed bonus applies to oil whatever the boiler’s age. Applying from August 2028 would give only ${EN.eur(zuschussAug28.zuschuss)}.`,
    faqs: [
      { q: 'Does my 35-year-old oil boiler have to be removed now?', a: `No. The duty to take boilers out of service after ${G.alt_kessel_jahre} years was in section 72 of the old Building Energy Act and has been deleted since 29 July 2026. As long as the boiler works, it may keep running, on ordinary heating oil too. The only protection against a sudden breakdown is planning, because a grant application must come before the order.` },
      { q: 'I am buying a German house with oil heating: what must I upgrade?', a: 'Not the heating. If you buy a one or two-family house, section 35(3) GModG gives you two years to insulate the top floor ceiling if it falls short of minimum thermal protection, and section 69(3) and (4) to insulate exposed, accessible heating and hot water pipes in unheated rooms. Both duties lapse if the savings would not repay the cost within a reasonable period.' },
      { q: 'May I replace an old oil boiler with a new one?', a: `Yes, section 42 names heating oil explicitly. For an oil boiler installed after 29 July 2026, section 43 applies: from ${jahr(T[0].ab)} at least ${EN.pct(T[0].anteil)} of the heat from bio-oil or another climate-friendly fuel, ${EN.pct(T[3].anteil)} from ${jahr(T[3].ab)}. There is no grant for a new oil boiler.` },
      { q: 'How much CO₂ price is in a litre of heating oil?', a: `At ${EN.eur(C.auktion_2026_durchschnitt)} per tonne, the 2026 auction average, about ${EN.num(ctJetzt)} cents per litre including VAT. The basis is the official standard values for heating oil: one litre causes about ${EN.num(kgJeLiterOel, 1)} kg of CO₂. The table for every year since 2021 is on the CO₂ price for heating oil page.` },
      { q: 'Is now a good time to move away from oil?', a: `For owner-occupiers the calendar says yes: the climate speed bonus for replacing an oil boiler falls every six months from February 2027 and ends for applications from 1 August 2028. In the example with ${EN.eur(36000)} and ${EN.eur(75000)} income, the grant drops from ${EN.eur(zuschuss.zuschuss)} to ${EN.eur(zuschussAug28.zuschuss)}. Whether the heat pump pays off in running costs depends on the house.` },
    ],
    body: (h) => `
<h2>What has been deleted</h2>
<p>Until 28 July 2026 the Building Energy Act contained two rules that affected many oil boilers. Section 72 banned the operation of older oil and gas boilers after ${G.alt_kessel_jahre} years, with exceptions including low-temperature and condensing boilers. Subsection 4 set an end date for fossil fuels in boilers on 31 December 2044 (${h.src('geg2023', 'GEG 2024')}). The ${h.src('gmodgBgbl', 'act of 23 July 2026')} deleted sections 71 to 73 entirely. The ${h.src('gmodg', 'current text')} now just reads "weggefallen" (repealed) under section 72.</p>
<p>The exemption for owners who already lived in their house on 1 February 2002 goes with it: there is no replacement duty left to be exempt from. Guides still saying "oil boilers must go after 30 years" or "oil heating ban from 2026" describe law that no longer applies. That matters to buyers from abroad, who often meet these claims in sales talks.</p>

<h2>What applies when you buy</h2>
<p>Buying a house with oil heating does not bring a duty to replace it, but two older retrofit duties survive in the GModG. Both fall on the new owner of a one or two-family house, with two years from the transfer of ownership.</p>
${h.table(['Duty', 'Section', 'What exactly'], [
  ['Insulate the top floor ceiling', '35(1) and (3)', 'if it falls short of minimum thermal protection, to no more than 0.24 W/(m²K); met if the roof above is insulated instead'],
  ['Insulate pipes', '69(2) to (4)', 'previously uninsulated, accessible heating and hot water pipes outside heated rooms'],
  ['Replace the boiler', 'old 72', 'deleted since 29 July 2026'],
], 'Building Modernisation Act, as of 19 October 2026', ['l', 'l', 'l'])}
<p>If a retrofit would not pay for itself through savings within a reasonable period, the owner of a building with no more than two homes, one of which they live in, need not carry it out. The energy performance certificate (Energieausweis) the seller must show gives the efficiency class and so a rough idea of oil use (${h.a('gebaeudeenergiegesetz', 'efficiency classes')}).</p>

<h2>Carrying on: what the oil costs</h2>
<p>For the example house of 150 m² in class F in Bavaria, the calculator assumes ${h.num(oel.menge)} litres a year. At the heating oil price from the ${h.src('wob', 'EU Weekly Oil Bulletin')}, averaged over twelve months, that costs ${h.eur(oel.kosten)}. Of this, ${h.eur(co2Jetzt)} is CO₂ cost at ${h.eur(C.auktion_2026_durchschnitt)} per tonne. How that share has moved since 2021 and what has been passed for 2027 is under ${h.a('co2-preis-heizoel', 'CO₂ price for heating oil')}.</p>
<!--mini:co2oel-->
<p>The same heat from an air source heat pump with a field-measured seasonal performance factor of ${h.num(P.technik.jaz_luft_messung, 1)} needs about ${h.num(wp.menge)} kWh of electricity, ${h.eur(wp.kosten)} a year on a heat pump tariff. The gap of ${h.eur(oel.kosten - wp.kosten)} is not a promise: it depends on the radiators, the flow temperature and prices in the years ahead.</p>

<h2>A new oil boiler</h2>
<p>If you want to stay with oil, section 42 allows it. For boilers installed after 29 July 2026, ${h.src('gmodg43', 'section 43')} requires a minimum share of bio-oil or an equivalent fuel: ${T.map((s) => `${h.pct(s.anteil)} from ${jahr(s.ab)}`).join(', ')}. A grant from programme 458 is ruled out for an oil boiler. Landlords pay half the CO₂ cost of such a new system from ${jahr(P.aufteilung.neue_fossile_heizung_ab)}. The same rules apply to gas, see ${h.a('gasheizung-verbot', 'gas boiler ban')}.</p>

<h2>Conditions of the bonus when leaving oil</h2>
<p>The climate speed bonus is only paid if the oil boiler still works when you apply. If you wait until it fails for good, you lose it, and the application must still come before the order. The old system must be professionally removed and disposed of. Afterwards the homes it served may no longer be heated by a fossil system in or next to the building, so keeping an oil boiler as back-up beside the heat pump rules the bonus out (guideline no. 8.4.4). The bonus applies only to the home the owner lives in as main residence. An oil tank left empty after the change is a separate matter, governed by water law rather than the GModG.</p>

<h2>Why the grant is pressing for oil households</h2>
<p>When a working oil boiler is replaced, the climate speed bonus applies whatever its age; for gas only from 20 years (${h.src('kfw458', 'KfW 458')}). The bonus drops from ${h.pct(P.foerderung.kgb_stufen[0].satz)} to ${h.pct(P.foerderung.kgb_stufen[1].satz)} for applications from 1 February 2027 and ends from 1 August 2028, while the cap on eligible costs falls in parallel. In the example the difference is ${h.eur(zuschuss.zuschuss - zuschussAug28.zuschuss)}. The ${h.a('waermepumpe-foerderung', 'grant calculator')} shows the curve for your case, and the bonus is explained under ${h.a('klimageschwindigkeitsbonus', 'climate speed bonus')}.</p>`,
  },
});

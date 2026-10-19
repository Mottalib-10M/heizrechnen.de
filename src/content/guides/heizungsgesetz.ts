import { defineGuide } from '../../lib/guide-types';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Heizungsgesetz: das Gebäudemodernisierungsgesetz (BGBl. 2026 I Nr. 226) im Überblick, Vergleich mit dem GEG 2024,
 * Inkrafttreten nach Art. 9. Alle Paragrafen im konsolidierten Text auf gesetze-im-internet.de geprüft (19.10.2026).
 */
const G = P.gesetz;
const T = G.biotreppe;
const A = P.aufteilung;
const jahr = (iso: string) => iso.slice(0, 4);
// Beispiel: Dreifamilienhaus mit 300 m² Nutzfläche, neue Gasheizung mit Solarthermie (§ 43 Abs. 3 Nr. 2).
const nutzflaeche = 300;
const kollektor3 = nutzflaeche * G.solar_m2_je_m2_ab_3we;
const kollektor1 = 150 * G.solar_m2_je_m2_bis_2we;

export default defineGuide({
  id: 'heizungsgesetz',
  group: 'gesetz',
  order: 10,
  mini: 'biotreppe',
  miniHref: 'waermepumpe-oder-gasheizung',
  related: ['gebaeudeenergiegesetz', 'gasheizung-verbot', 'oelheizung-verbot', 'waermeplanung', 'kfw-458', 'co2-kostenaufteilung'],
  sources: ['gmodgBgbl', 'gmodg', 'gmodg43', 'geg2023', 'co2kostaufg', 'wpg4'],
  de: {
    slug: 'heizungsgesetz',
    nav: 'Heizungsgesetz',
    card: 'Das neue Heizungsgesetz (GModG) seit dem 29. Juli 2026: was gestrichen ist, was neu gilt und ab wann.',
    title: 'Heizungsgesetz 2026: Das GModG gilt seit dem 29. Juli',
    description: `Heizungsgesetz 2026: Die ${DE.pct(G.alt_65_prozent)}-Regel ist gestrichen, das GModG gilt seit 29.07.2026. Neue Gas- und Ölheizungen brauchen ab ${jahr(T[0].ab)} Biogas. Fristen mit Paragraf.`,
    h1: 'Heizungsgesetz 2026: Was das Gebäudemodernisierungsgesetz regelt',
    intro: 'Seit dem 29. Juli 2026 heißt das Heizungsgesetz Gebäudemodernisierungsgesetz. Diese Seite trennt, was gilt, was beschlossen ist und was nur angekündigt wurde.',
    resume: `Das „Heizungsgesetz“ ist seit dem 29. Juli 2026 das Gebäudemodernisierungsgesetz (GModG), verkündet im Bundesgesetzblatt 2026 I Nr. 226. Es ersetzt die Fassung des Gebäudeenergiegesetzes von 2024 in den Punkten, die Hausbesitzer am meisten betrafen. Die Pflicht, eine neue Heizung zu ${DE.pct(G.alt_65_prozent)} mit erneuerbarer Energie zu betreiben, ist gestrichen, ebenso die Austauschpflicht für Kessel nach ${G.alt_kessel_jahre} Jahren und das Ende fossiler Brennstoffe 2044. Nach § 42 können Eigentümer zwischen zehn Optionen frei wählen, darunter Gas und Öl. Wer eine neue Gas-, Öl- oder Flüssiggasheizung in ein bestehendes Haus einbaut, muss nach § 43 ab ${jahr(T[0].ab)} mindestens ${DE.pct(T[0].anteil)} der Wärme klimafreundlich erzeugen, ab ${jahr(T[3].ab)} ${DE.pct(T[3].anteil)}. Ein Dreifamilienhaus mit ${DE.num(nutzflaeche)} m² Nutzfläche erfüllt das bis 2034 auch mit ${DE.num(kollektor3)} m² Solarkollektoren. Weitere Teile treten am 1. Januar 2027, 2028 und 2030 in Kraft, ab 2030 vor allem für Neubauten.`,
    faqs: [
      { q: 'Seit wann gilt das neue Heizungsgesetz?', a: `Der Bundestag hat das Gesetz am 10. Juli 2026 beschlossen, der Bundesrat hat am selben Tag zugestimmt. Ausgefertigt wurde es am 23. Juli, verkündet am 28. Juli 2026. Der Hauptteil gilt seit dem Tag danach, dem 29. Juli 2026. Änderungen zum Energieausweis folgen am 1. Januar 2027, die Pflicht zum Nullemissionsgebäude für alle Neubauten am 1. Januar 2030.` },
      { q: 'Was ist aus der 65-Prozent-Regel geworden?', a: `Sie ist ersatzlos gestrichen. Die Regel stand in § 71 des Gebäudeenergiegesetzes und hätte für bestehende Häuser je nach Größe der Gemeinde ab Herbst 2026 oder Mitte 2028 gegriffen. Artikel 1 des Gesetzes vom 23. Juli 2026 streicht die §§ 71 bis 73 vollständig. An ihre Stelle tritt die Stufenpflicht für neue Gas- und Ölheizungen aus § 43, beginnend ${jahr(T[0].ab)}.` },
      { q: 'Muss ich vor dem Einbau einer Gasheizung eine Beratung nachweisen?', a: 'Nein, nicht mehr. Die Pflichtberatung vor dem Einbau einer Heizung mit festem, flüssigem oder gasförmigem Brennstoff stand in § 71 Absatz 11 und ist mit ihm entfallen. Ein informatorisches Beratungsgespräch kennt das Gesetz nur noch in zwei Fällen bei Häusern mit höchstens zwei Wohnungen: vor größeren Arbeiten an der Gebäudehülle (§ 36) und für den Käufer nach Übergabe des Energieausweises (§ 80). Beide Male nur, wenn es kostenlos angeboten wird.' },
      { q: 'Kommt noch ein Gesetz für grünes Gas?', a: `Angekündigt, aber nicht beschlossen. § 42a verpflichtet die Bundesregierung, bis zum 1. Dezember 2026 ein Gesetz für eine Grüngas- und Grünheizölquote vorzulegen. Es soll die Lieferanten verpflichten, Brennstoffe für Gebäude bis ${G.klimaneutral_ab} vollständig auf klimaneutrale umzustellen. Wie hoch die Quote in welchem Jahr sein soll, steht noch nirgends; ein Entwurf war bis zum 19. Oktober 2026 nicht veröffentlicht.` },
      { q: 'Gilt das Heizungsgesetz auch für Mieter?', a: `Die Pflichten treffen den Eigentümer, bei Contracting den Betreiber der Anlage. Mieter berührt es über die Kosten: Für eine Gas- oder Ölheizung, die nach § 43 eingebaut wurde, werden CO₂-Kosten und Gasnetzentgelte ab ${jahr(A.neue_fossile_heizung_ab)} hälftig zwischen Vermieter und Mieter geteilt, die Mehrkosten grüner Brennstoffe ab ${jahr(A.biobrennstoff_mehrkosten_ab)}. Das regelt das geänderte CO2KostAufG.` },
    ],
    body: (h) => `
<h2>Vom GEG zum GModG: der Weg in Daten</h2>
${h.table(['Datum', 'Schritt', 'Stand'], [
  [h.date(G.kabinett), 'Kabinettsbeschluss über den Entwurf', 'erledigt'],
  [h.date(G.gmodg_beschluss_bundestag), 'Bundestag beschließt, Bundesrat stimmt zu', 'erledigt'],
  [h.date(G.gmodg_ausfertigung), 'Ausfertigung', 'erledigt'],
  [h.date(G.gmodg_verkuendet), `Verkündung, ${G.gmodg_bgbl}`, 'erledigt'],
  [h.date(G.gmodg_in_kraft), 'Hauptteil in Kraft (Artikel 1, 5, 6, 8)', 'geltendes Recht'],
  [h.date('2027-01-01'), 'Artikel 2: Energieausweis digital, neue Flächendefinition, Klassen für Nichtwohngebäude', 'beschlossen'],
  [h.date('2028-01-01'), 'Artikel 3: neue Behördenbauten als Nullemissionsgebäude', 'beschlossen'],
  [h.date('2030-01-01'), 'Artikel 4: alle Neubauten als Nullemissionsgebäude', 'beschlossen'],
], 'Gesetz vom 23. Juli 2026, Artikel 9', ['l', 'l', 'l'])}
<p>Der Name „Heizungsgesetz“ ist umgangssprachlich. Amtlich heißt das Gesetz seit dem 29. Juli 2026 „Gesetz zur Einsparung von Energie und zur Modernisierung der Wärmeversorgung in Gebäuden“, kurz Gebäudemodernisierungsgesetz. Es ist kein neues Gesetz, sondern das Gebäudeenergiegesetz von 2020 mit neuem Titel und vielen Änderungen (${h.src('gmodgBgbl', 'BGBl. 2026 I Nr. 226')}). Wer einen Paragrafen nachschlagen will, findet ihn weiter unter der alten Adresse auf ${h.src('gmodg', 'gesetze-im-internet.de')}. Was das für Energieausweis und Effizienzklassen bedeutet, steht unter ${h.a('gebaeudeenergiegesetz', 'Gebäudeenergiegesetz')}.</p>

<h2>Was sich gegenüber 2024 geändert hat</h2>
${h.table(['Thema', 'GEG bis 28.07.2026', 'GModG seit 29.07.2026'], [
  ['Neue Heizung', `mindestens ${h.pct(G.alt_65_prozent)} erneuerbar (§ 71)`, 'freie Wahl aus zehn Optionen (§ 42)'],
  ['Kopplung an den Wärmeplan', 'Fristen nach Gemeindegröße (§ 71 Abs. 8)', 'entfallen'],
  ['Alte Kessel', `Betriebsverbot nach ${h.num(G.alt_kessel_jahre)} Jahren (§ 72)`, 'entfallen'],
  ['Fossile Brennstoffe', `Ende am ${h.date(G.alt_fossil_ende)}`, `Quotengesetz angekündigt, klimaneutral ab ${G.klimaneutral_ab} (§ 42a)`],
  ['Biogasanteil neuer Gasheizungen', G.biotreppe_alt_geg2024.map((s) => `${h.pct(s.anteil)} ab ${jahr(s.ab)}`).join(', '), T.map((s) => `${h.pct(s.anteil)} ab ${jahr(s.ab)}`).join(', ')],
  ['Beratung vor Einbau fossil', 'Pflicht (§ 71 Abs. 11)', 'entfallen'],
  ['CO₂-Kosten bei Vermietung', 'Stufenmodell', `neue fossile Heizung: hälftig ab ${jahr(A.neue_fossile_heizung_ab)}`],
], 'Quellen: GEG 2024, GModG', ['l', 'l', 'l'])}
<p>Bemerkenswert ist die kleine Verschiebung der Biogastreppe: Das alte Recht wollte ${h.pct(G.biotreppe_alt_geg2024[0].anteil)} ab ${jahr(G.biotreppe_alt_geg2024[0].ab)}, das neue beginnt im selben Jahr mit ${h.pct(T[0].anteil)} und erreicht ${h.pct(T[1].anteil)} erst ${jahr(T[1].ab)}. Die Endstufe von ${h.pct(T[3].anteil)} ab ${jahr(T[3].ab)} ist gleich geblieben (${h.src('gmodg43', '§ 43 GModG')}, ${h.src('geg2023', 'GEG 2024')}).</p>

<h2>Wie die Stufenpflicht erfüllt wird</h2>
<p>§ 43 schreibt kein bestimmtes Produkt vor. Neben Biomethan, Bioöl, biogenem Flüssiggas und Wasserstoff in vier Farben lässt das Gesetz drei technische Wege zu. Solarthermie zählt von ${jahr(T[0].ab)} bis Ende 2034 als Erfüllung, wenn die Kollektorfläche reicht: ${h.num(G.solar_m2_je_m2_bis_2we, 2)} m² je m² Nutzfläche bei bis zu zwei Wohnungen, also ${h.num(kollektor1)} m² für ein Einfamilienhaus mit 150 m², und ${h.num(G.solar_m2_je_m2_ab_3we, 2)} m² bei mehr Wohnungen, also ${h.num(kollektor3)} m² für ein Dreifamilienhaus mit ${h.num(nutzflaeche)} m². Eine Lüftungsanlage mit mindestens 73 Prozent Wärmerückgewinnung, die das ganze Gebäude versorgt, wirkt im selben Zeitraum gleich. Eine Hybridheizung schließlich gilt als Erfüllung, wenn die Wärmepumpe mindestens ${h.pct(G.hybrid_wp_leistung_min)} der Kesselleistung bringt; ab sechs Wohnungen ist nach 2039 nachzuweisen, welchen Anteil sie wirklich liefert. Außerhalb des Zeitraums bis 2034 braucht die Solaranlage einen Nachweis durch eine fachkundige Person, sobald mehr als 15 Prozent angerechnet werden sollen.</p>
<!--mini:gasneu-->

<h2>Was unverändert bleibt</h2>
<p>Viele Pflichten des alten Gesetzes bestehen weiter: die Dämmung der obersten Geschossdecke und ungedämmter Rohre nach einem Eigentümerwechsel (§§ 35, 69), die Anforderungen an Bauteile, wenn sie erneuert werden (§ 36 mit Anlage 7), die Prüfung und Optimierung von Wärmepumpen und älteren Heizungen (§§ 60a bis 60c) und der Energieausweis beim Verkauf und bei der Vermietung. Die Regeln für Stromdirektheizungen hat das GModG in § 46 neu gefasst. Für die kommunale Wärmeplanung gelten die Fristen des ${h.src('wpg4', 'Wärmeplanungsgesetzes')} weiter, nur hängt keine Heizungspflicht mehr daran (${h.a('waermeplanung', 'Wärmeplanung')}).</p>

<h2>Was Hausbesitzer jetzt tun müssen</h2>
<p>Für eine Heizung, die schon läuft, verlangt das GModG heute nichts: kein Austausch, kein Biogas, keine Frist. Wer bis Ende 2028 eine neue Gas- oder Ölheizung einbaut, hat bis zum 1. Januar ${jahr(T[0].ab)} Zeit, einen passenden Tarif oder eine der technischen Lösungen zu wählen. Vermieter müssen ab ${jahr(A.neue_fossile_heizung_ab)} die CO₂-Kosten einer solchen neuen Heizung zur Hälfte tragen und sollten das in die Wahl einbeziehen. Wer eine Wärmepumpe plant, richtet sich nicht nach dem Gesetz, sondern nach den Stichtagen der Förderung, die jedes halbe Jahr weniger zahlt.</p>

<h2>Und die Förderung?</h2>
<p>Förderung steht nicht im Gesetz, sondern in einer eigenen Richtlinie. Sie wurde fast zur selben Zeit neu gefasst: Für Anträge ab dem 21. Juli 2026 gelten neue Sätze und ein Höchstbetrag, der jedes halbe Jahr sinkt (${h.a('kfw-458', 'KfW 458')}). Eine Gas- oder Ölheizung wird nicht gefördert, auch wenn das Gesetz sie wieder erlaubt. Wer vermietet, findet die neue hälftige Teilung der CO₂-Kosten im ${h.src('co2kostaufg', 'CO2KostAufG')} und im ${h.a('co2-kostenaufteilung', 'Aufteilungsrechner')}. Die Folgen für einzelne Heizungen beschreiben ${h.a('gasheizung-verbot', 'Gasheizung')} und ${h.a('oelheizung-verbot', 'Ölheizung')}.</p>`,
  },
  en: {
    slug: 'heating-law-germany',
    nav: 'Heating law',
    card: 'Germany’s new heating law (GModG) since 29 July 2026: what was scrapped, what applies now and from when.',
    title: 'Heating Law Germany 2026: The GModG Applies Since 29 July',
    description: `Heating law in Germany 2026: the ${EN.pct(G.alt_65_prozent)} rule is gone, the GModG applies since 29 July 2026. New gas and oil boilers need biogas from ${jahr(T[0].ab)}. Deadlines by section.`,
    h1: 'Heating law in Germany 2026: what the Building Modernisation Act says',
    intro: 'Since 29 July 2026 the German heating law is called the Building Modernisation Act. This page separates what applies, what has been passed and what has only been announced.',
    resume: `Germany’s "heating law" has been the Building Modernisation Act (Gebäudemodernisierungsgesetz, GModG) since 29 July 2026, published in Federal Law Gazette 2026 I no. 226. It replaces the 2024 version of the Building Energy Act on the points that mattered most to homeowners. The duty to run a new heating system on ${EN.pct(G.alt_65_prozent)} renewable energy is gone, as are the replacement duty for boilers after ${G.alt_kessel_jahre} years and the 2044 end date for fossil fuels. Under section 42 owners choose freely among ten options, gas and oil included. Anyone fitting a new gas, oil or LPG system in an existing house must, under section 43, produce at least ${EN.pct(T[0].anteil)} of the heat in a climate-friendly way from ${jahr(T[0].ab)}, rising to ${EN.pct(T[3].anteil)} from ${jahr(T[3].ab)}. A three-family house with ${EN.num(nutzflaeche)} m² of floor area can also meet this until 2034 with ${EN.num(kollektor3)} m² of solar collectors. Further parts take effect on 1 January 2027, 2028 and 2030, mainly for new buildings.`,
    faqs: [
      { q: 'When did the new German heating law take effect?', a: 'The Bundestag passed it on 10 July 2026 and the Bundesrat approved it the same day. It was signed on 23 July and published on 28 July 2026. The main part has applied since the day after, 29 July 2026. Changes to energy certificates follow on 1 January 2027, and the zero-emission requirement for all new buildings on 1 January 2030.' },
      { q: 'What happened to the 65 per cent renewable rule?', a: `It was scrapped without replacement. The rule sat in section 71 of the Building Energy Act and would have applied to existing homes from autumn 2026 or mid-2028, depending on the size of the municipality. Article 1 of the act of 23 July 2026 deletes sections 71 to 73 entirely. In its place comes the staged duty for new gas and oil systems in section 43, starting ${jahr(T[0].ab)}.` },
      { q: 'Do I need a mandatory consultation before fitting a gas boiler?', a: 'No, not any more. The mandatory advice before installing a system burning solid, liquid or gaseous fuel was in section 71(11) and went with it. The law now only knows an informational consultation in two cases for houses with up to two homes: before major work on the building envelope (section 36) and for a buyer once the energy certificate is handed over (section 80). In both, only where one is offered free of charge.' },
      { q: 'Is a separate green gas law still coming?', a: `Announced, not passed. Section 42a requires the federal government to present a law on a green gas and green heating oil quota by 1 December 2026. It is meant to oblige suppliers to switch fuels for buildings entirely to climate-neutral ones by ${G.klimaneutral_ab}. How high the quota will be in which year is not written anywhere yet; no draft had been published by 19 October 2026.` },
      { q: 'Does the heating law affect tenants?', a: `The duties fall on the owner, or the operator under a contracting deal. Tenants are affected through costs: for a gas or oil system installed under section 43, CO₂ costs and gas network charges are split equally between landlord and tenant from ${jahr(A.neue_fossile_heizung_ab)}, and the extra cost of green fuels from ${jahr(A.biobrennstoff_mehrkosten_ab)}. The amended CO₂ cost allocation act sets this out.` },
    ],
    body: (h) => `
<h2>From GEG to GModG: the timeline</h2>
${h.table(['Date', 'Step', 'Status'], [
  [h.date(G.kabinett), 'Cabinet adopts the draft', 'done'],
  [h.date(G.gmodg_beschluss_bundestag), 'Bundestag passes it, Bundesrat consents', 'done'],
  [h.date(G.gmodg_ausfertigung), 'Signed into law', 'done'],
  [h.date(G.gmodg_verkuendet), `Published, ${G.gmodg_bgbl}`, 'done'],
  [h.date(G.gmodg_in_kraft), 'Main part in force (articles 1, 5, 6, 8)', 'law in force'],
  [h.date('2027-01-01'), 'Article 2: digital energy certificate, new floor area definition, classes for non-residential buildings', 'passed'],
  [h.date('2028-01-01'), 'Article 3: new public authority buildings zero-emission', 'passed'],
  [h.date('2030-01-01'), 'Article 4: all new buildings zero-emission', 'passed'],
], 'Act of 23 July 2026, article 9', ['l', 'l', 'l'])}
<p>"Heating law" is a nickname. Since 29 July 2026 the official title is the act on saving energy and modernising heat supply in buildings, the Building Modernisation Act for short. It is not a new statute but the 2020 Building Energy Act with a new title and many changes (${h.src('gmodgBgbl', 'Federal Law Gazette 2026 I no. 226')}). Sections can still be looked up at the old address on ${h.src('gmodg', 'gesetze-im-internet.de')}, in German only. What it means for energy certificates and efficiency classes is under ${h.a('gebaeudeenergiegesetz', 'Building Energy Act')}.</p>

<h2>What changed compared with 2024</h2>
${h.table(['Topic', 'GEG until 28 July 2026', 'GModG since 29 July 2026'], [
  ['New heating system', `at least ${h.pct(G.alt_65_prozent)} renewable (s. 71)`, 'free choice of ten options (s. 42)'],
  ['Link to the heat plan', 'deadlines by municipality size (s. 71(8))', 'removed'],
  ['Old boilers', `operating ban after ${h.num(G.alt_kessel_jahre)} years (s. 72)`, 'removed'],
  ['Fossil fuels', `end on ${h.date(G.alt_fossil_ende)}`, `quota law announced, climate-neutral by ${G.klimaneutral_ab} (s. 42a)`],
  ['Biogas share of new gas boilers', G.biotreppe_alt_geg2024.map((s) => `${h.pct(s.anteil)} from ${jahr(s.ab)}`).join(', '), T.map((s) => `${h.pct(s.anteil)} from ${jahr(s.ab)}`).join(', ')],
  ['Advice before fitting fossil heating', 'mandatory (s. 71(11))', 'removed'],
  ['CO₂ costs when letting', 'stage model', `new fossil system: split equally from ${jahr(A.neue_fossile_heizung_ab)}`],
], 'Sources: GEG 2024, GModG', ['l', 'l', 'l'])}
<p>Note the small shift in the biogas steps: the old law wanted ${h.pct(G.biotreppe_alt_geg2024[0].anteil)} from ${jahr(G.biotreppe_alt_geg2024[0].ab)}, the new one starts that year at ${h.pct(T[0].anteil)} and only reaches ${h.pct(T[1].anteil)} in ${jahr(T[1].ab)}. The final step of ${h.pct(T[3].anteil)} from ${jahr(T[3].ab)} is unchanged (${h.src('gmodg43', 'section 43 GModG')}, ${h.src('geg2023', 'GEG 2024')}).</p>

<h2>How the staged duty can be met</h2>
<p>Section 43 does not prescribe a product. Besides biomethane, bio-oil, biogenic LPG and hydrogen in four colours, the law allows three technical routes. Solar thermal counts as compliance from ${jahr(T[0].ab)} to the end of 2034 if the collector area is large enough: ${h.num(G.solar_m2_je_m2_bis_2we, 2)} m² per m² of floor area with up to two homes, so ${h.num(kollektor1)} m² for a 150 m² house, and ${h.num(G.solar_m2_je_m2_ab_3we, 2)} m² with more homes, so ${h.num(kollektor3)} m² for a three-family house of ${h.num(nutzflaeche)} m². Ventilation with at least 73 per cent heat recovery serving the whole building works the same way over that period. Finally, a hybrid counts as compliance if the heat pump delivers at least ${h.pct(G.hybrid_wp_leistung_min)} of the boiler output; with six or more homes, the share it really supplies must be proven after 2039. Outside the window up to 2034, a solar system needs proof from a qualified person as soon as more than 15 per cent is to be counted.</p>
<!--mini:gasneu-->

<h2>What stays the same</h2>
<p>Many duties of the old law continue: insulating the top floor ceiling and bare pipes after a change of ownership (sections 35 and 69), standards for building parts when they are renewed (section 36 with annex 7), checks and optimisation of heat pumps and older heating systems (sections 60a to 60c), and the energy certificate when selling or letting. The GModG has redrafted the rules on direct electric heating in section 46. Municipal heat planning keeps the deadlines of the ${h.src('wpg4', 'Heat Planning Act')}, but no heating duty depends on it any more (${h.a('waermeplanung', 'heat planning')}).</p>

<h2>And the grants?</h2>
<p>Grants are not in the act but in a separate guideline, which was rewritten at almost the same time: applications from 21 July 2026 get new rates and a cap that falls every six months (${h.a('kfw-458', 'KfW 458')}). A gas or oil boiler is not funded, even though the law allows it again. Landlords will find the new equal split of CO₂ costs in the ${h.src('co2kostaufg', 'CO₂ cost allocation act')} and in the ${h.a('co2-kostenaufteilung', 'cost split calculator')}. The consequences for individual systems are covered under ${h.a('gasheizung-verbot', 'gas boilers')} and ${h.a('oelheizung-verbot', 'oil boilers')}.</p>`,
  },
});

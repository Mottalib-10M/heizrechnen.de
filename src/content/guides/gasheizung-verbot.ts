import { defineGuide } from '../../lib/guide-types';
import { nutzwaerme, laufend } from '../../lib/engine/heizkosten';
import { co2Kosten } from '../../lib/engine/co2';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Gasheizung „Verbot“: Was das GModG seit dem 29.07.2026 für eine neue Gasheizung vorschreibt (§§ 42, 43, 46 GModG,
 * §§ 5a bis 5d CO2KostAufG). Beispielhaus: 140 m², Klasse E, Nordrhein-Westfalen.
 */
const G = P.gesetz;
const A = P.aufteilung;
const T = G.biotreppe;
const q = nutzwaerme({ flaeche: 140, klasse: 'E', land: 'Nordrhein-Westfalen' });
const gas = laufend('gas', q)!;
const wp = laufend('wp_luft', q)!;
const co2Heute = co2Kosten('gas', gas.menge, P.co2.auktion_2026_durchschnitt);
const pflicht = (i: number) => gas.menge * T[i].anteil;
const jahr = (iso: string) => iso.slice(0, 4);

export default defineGuide({
  id: 'gasheizung-verbot',
  group: 'gesetz',
  order: 30,
  mini: 'gasneu',
  miniHref: 'waermepumpe-oder-gasheizung',
  related: ['heizungsgesetz', 'oelheizung-verbot', 'waermepumpe-oder-gasheizung', 'waermeplanung', 'co2-preis-2027', 'co2-kostenaufteilung'],
  sources: ['gmodgBgbl', 'gmodg', 'gmodg43', 'co2kostaufg', 'geg2023', 'destatisPreise'],
  de: {
    slug: 'gasheizung-verbot',
    nav: 'Gasheizung Verbot',
    card: 'Ob eine neue Gasheizung erlaubt ist, welcher Anteil Biogas ab 2029 Pflicht wird und was das im Jahr kostet.',
    title: 'Gasheizung Verbot 2026: Was seit dem 29. Juli wirklich gilt',
    description: `Gasheizung Verbot 2026: Es gibt keins. Neue Gasheizungen sind erlaubt, brauchen ab ${jahr(T[0].ab)} aber ${DE.pct(T[0].anteil)} Biogas, ab ${jahr(T[3].ab)} ${DE.pct(T[3].anteil)}. Mit Paragrafen und Kosten im Jahr.`,
    h1: 'Gasheizung Verbot: Was für eine neue Gasheizung 2026 gilt',
    intro: 'Eine neue Gasheizung darf eingebaut werden. Welche Pflichten danach kommen und was sie im Jahr kosten, steht hier mit Paragraf und Datum.',
    resume: `Ein Verbot für Gasheizungen gibt es in Deutschland nicht, auch nicht für neue. Seit dem 29. Juli 2026 gilt das Gebäudemodernisierungsgesetz (GModG), das die Regel gestrichen hat, nach der eine neue Heizung zu ${DE.pct(G.alt_65_prozent)} mit erneuerbarer Energie laufen musste. Nach § 42 ist die Gasheizung wieder eine von zehn gleichrangigen Optionen. Wer sie nach dem 29. Juli 2026 in ein bestehendes Haus einbaut, muss nach § 43 aber dafür sorgen, dass ein steigender Teil der Wärme aus Biomethan oder Wasserstoff kommt: ab ${jahr(T[0].ab)} ${DE.pct(T[0].anteil)}, ab ${jahr(T[1].ab)} ${DE.pct(T[1].anteil)}, ab ${jahr(T[2].ab)} ${DE.pct(T[2].anteil)} und ab ${jahr(T[3].ab)} ${DE.pct(T[3].anteil)}. Für ein Haus mit 140 m² in Klasse E in Nordrhein-Westfalen heißt das rund ${DE.num(gas.menge)} kWh Gas im Jahr, davon ab ${jahr(T[0].ab)} ${DE.num(pflicht(0))} kWh grünes Gas und ab ${jahr(T[3].ab)} ${DE.num(pflicht(3))} kWh. Wer vermietet, trägt für eine solche Heizung ab ${jahr(A.neue_fossile_heizung_ab)} die Hälfte der CO₂-Kosten.`,
    faqs: [
      { q: 'Darf ich 2026 noch eine neue Gasheizung einbauen?', a: `Ja. § 42 GModG nennt die Heizung mit Gas, Heizöl oder Flüssiggas als erste von zehn Optionen für den Ersatz einer Heizung. Eine Prüfung, ob ein Wärmenetz kommt, oder eine Pflichtberatung vor dem Einbau verlangt das Gesetz seit dem 29. Juli 2026 nicht mehr. Die Pflicht kommt später: der Anteil an Biomethan oder Wasserstoff ab ${jahr(T[0].ab)}.` },
      { q: 'Wie weise ich den Biogasanteil einer neuen Gasheizung nach?', a: `In der Regel über einen Gastarif mit dem nötigen Anteil Biomethan. § 43 lässt auch andere Wege zu: Solarthermie, die von ${jahr(T[0].ab)} bis 2034 mit ${DE.num(G.solar_m2_je_m2_bis_2we, 2)} m² Kollektorfläche je m² Nutzfläche (bis zwei Wohnungen) als erfüllt gilt, eine Lüftung mit Wärmerückgewinnung oder eine Hybridheizung, deren Wärmepumpe mindestens ${DE.pct(G.hybrid_wp_leistung_min)} der Kesselleistung bringt.` },
      { q: 'Was passiert, wenn meine Gasheizung 2028 plötzlich ausfällt?', a: 'Fällt die alte Heizung irreparabel aus und wird 2028 eine neue Gas- oder Ölheizung eingebaut, beginnt die Pflicht aus § 43 erst zwölf Monate nach dem Einbau (Absatz 7). Ab 2029 gilt bei einem Ausfall die Pflicht der alten Anlage zwölf Monate weiter, danach die zu diesem Zeitpunkt geltende Stufe. Eine Notheizung ist damit ohne Hast möglich.' },
      { q: 'Gilt die Biogaspflicht auch für meine Gasheizung von 2015?', a: `Nein. § 43 erfasst nur Heizungen, die nach dem 29. Juli 2026 in ein bestehendes Gebäude neu eingebaut werden. Eine ältere Gasheizung darf mit normalem Erdgas weiterlaufen, ohne Altersgrenze. Sie zahlt allerdings den CO₂-Preis: bei ${DE.num(gas.menge)} kWh im Jahr und ${DE.eur(P.co2.auktion_2026_durchschnitt)} je Tonne rund ${DE.eur(co2Heute)} mit Mehrwertsteuer.` },
      { q: 'Wer zahlt das teurere Biogas in einer Mietwohnung?', a: `Für eine Gas-, Öl- oder Flüssiggasheizung, die nach § 43 eingebaut wurde, teilen Vermieter und Mieter die Mehrkosten der grünen Brennstoffe ab dem 1. Januar ${jahr(A.biobrennstoff_mehrkosten_ab)} zur Hälfte, bezogen auf höchstens ${DE.pct(A.biobrennstoff_anteil_max)} Brennstoffanteil. Die CO₂-Kosten und die Gasnetzentgelte werden schon ab ${jahr(A.neue_fossile_heizung_ab)} hälftig geteilt (§ 5a CO2KostAufG).` },
    ],
    body: (h) => `
<h2>Kein Verbot, aber eine Stufenpflicht</h2>
<p>Das Wort „Verbot“ stammt aus der Debatte um das Gebäudeenergiegesetz von 2023. Auch damals war eine neue Gasheizung nicht verboten, sie musste aber ab bestimmten Fristen zu ${h.pct(G.alt_65_prozent)} mit erneuerbarer Energie betrieben werden. Diese Regel in § 71 ist mit dem ${h.src('gmodgBgbl', 'Gesetz vom 23. Juli 2026')} gestrichen, zusammen mit §§ 72 und 73. Seit dem 29. Juli 2026 zählt das ${h.src('gmodg', 'Gebäudemodernisierungsgesetz')} die Gasheizung in § 42 wieder als normale Option auf.</p>
<p>An die Stelle der Prozentregel tritt die Pflicht aus ${h.src('gmodg43', '§ 43 GModG')}, ein Teil der Wärme klimafreundlich zu erzeugen. Sie trifft den Eigentümer, bei Contracting den Betreiber, und sie beginnt nicht mit dem Einbau, sondern am 1. Januar ${jahr(T[0].ab)}.</p>
${h.table(['Ab', 'Pflichtanteil', 'Grünes Gas im Beispielhaus', 'Erdgas bleibt'], T.map((s, i) => [h.date(s.ab), h.pct(s.anteil), `${h.num(pflicht(i))} kWh`, `${h.num(gas.menge - pflicht(i))} kWh`]), `Haus 140 m², Klasse E, NRW, ${h.num(gas.menge)} kWh Gas im Jahr`, ['l', 'r', 'r', 'r'])}
<p>Wichtig für den Vergleich mit älteren Ratgebern: Das GEG 2024 hatte für Heizungen, die in der Übergangszeit eingebaut wurden, ${h.pct(G.biotreppe_alt_geg2024[0].anteil)} ab ${jahr(G.biotreppe_alt_geg2024[0].ab)} vorgesehen. Das GModG beginnt mit ${h.pct(T[0].anteil)} und fügt ${jahr(T[1].ab)} eine Stufe mit ${h.pct(T[1].anteil)} ein. Wer ${h.pct(G.biotreppe_alt_geg2024[0].anteil)} ab ${jahr(G.biotreppe_alt_geg2024[0].ab)} liest, liest den Stand bis zum 28. Juli 2026.</p>
<!--mini:biotreppe-->

<h2>Welche Gasheizung betroffen ist</h2>
<p>Die Pflicht gilt nur für Gas-, Öl- und Flüssiggasheizungen, die nach dem 29. Juli 2026 in ein bestehendes Gebäude neu eingebaut werden. Eine Heizung, die schon vorher lief, bleibt außen vor, egal wie alt sie ist. Die frühere Regel, nach der Kessel nach 30 Jahren außer Betrieb gehen mussten, stand in § 72 und ist ebenfalls gestrichen. Auch die Grenze für fossile Brennstoffe Ende 2044 steht nicht mehr im Gesetz. Stattdessen soll ein eigenes Gesetz, das die Bundesregierung nach § 42a bis zum 1. Dezember 2026 vorlegen muss, die Lieferanten verpflichten, Gas und Öl für Gebäude bis ${G.klimaneutral_ab} vollständig klimaneutral zu machen. Dieses Gesetz gibt es noch nicht.</p>
<p>Für Neubauten ändert sich mehr: Ab dem 1. Januar 2030 muss jedes neue Gebäude ein Nullemissionsgebäude sein, das am Standort kein CO₂ aus fossilen Brennstoffen verursacht (Artikel 4 des Gesetzes vom 23. Juli 2026). Eine Gasheizung im Neubau ist dann praktisch ausgeschlossen. Für den Heizungstausch im Bestand gilt diese Regel nicht.</p>

<h2>Der Ausweg Hybridheizung</h2>
<p>Wer die Gasheizung behalten will, aber keinen Biogastarif kaufen möchte, kann sie mit einer Wärmepumpe kombinieren. Nach § 43 Absatz 5 gilt die Pflicht dann als vollständig erfüllt, wenn die Wärmepumpe im Teillastpunkt A nach DIN EN 14825 mindestens ${h.pct(G.hybrid_wp_leistung_min)} der Leistung des Gaskessels erreicht, bei bivalent alternativem Betrieb ${h.pct(0.4)}. Ein Einfamilienhaus mit einem Kessel von 20 kW bräuchte also eine Wärmepumpe mit rund 6 kW in diesem Prüfpunkt. Ab sechs Wohnungen muss der Eigentümer nach 2039 nachweisen, welchen Anteil die Wärmepumpe tatsächlich liefert, wenn mehr als ${h.pct(G.hybrid_wp_leistung_min)} angerechnet werden sollen. Die Wärmepumpe im Hybrid ist eine Heizung mit erneuerbarer Energie und kann über das Programm 458 gefördert werden, der Gaskessel selbst nicht. Wer stattdessen eine reine Stromdirektheizung einbauen will, stößt auf § 46: Sie ist nur bei einer Dämmung erlaubt, die die Anforderungen um mindestens 30 Prozent unterschreitet, außer in Häusern mit höchstens zwei Wohnungen, von denen der Eigentümer eine selbst bewohnt.</p>

<h2>Was die Pflicht im Jahr kostet</h2>
<p>Der Aufpreis für Biomethan hängt vom Tarif ab, eine amtliche Preisstatistik dafür gibt es nicht. Deshalb rechnet der Rechner oben mit Ihrem Aufpreis in Cent je kWh. Sicher sind zwei andere Posten. Erstens der CO₂-Preis auf den Erdgasanteil: Im Beispielhaus sind es bei ${h.eur(P.co2.auktion_2026_durchschnitt)} je Tonne rund ${h.eur(co2Heute)} im Jahr, mehr dazu unter ${h.a('co2-preis-2027', 'CO₂-Preis 2027')}. Zweitens die Heizkosten selbst: Mit dem Gaspreis aus der ${h.src('destatisPreise', 'Erhebung von Destatis')} kostet die Wärme ${h.eur(gas.kosten)} im Jahr. Eine Luft-Wärmepumpe mit gemessener Jahresarbeitszahl ${h.num(P.technik.jaz_luft_messung, 1)} käme im selben Haus auf ${h.eur(wp.kosten)} Strom im Wärmepumpentarif. Den vollständigen Vergleich mit Anschaffung und Förderung zeigt ${h.a('waermepumpe-oder-gasheizung', 'Wärmepumpe oder Gasheizung')}.</p>

<h2>Förderung und Vermietung</h2>
<p>Für eine neue Gasheizung gibt es keinen Zuschuss aus dem Programm 458. Gefördert werden nur Heizungen mit erneuerbarer Energie und der Anschluss an ein Wärmenetz (${h.a('kfw-458', 'KfW 458')}). Wer vermietet, sollte die Regeln des ${h.src('co2kostaufg', 'Kohlendioxidkostenaufteilungsgesetzes')} kennen: Für Heizungen nach § 43 werden die CO₂-Kosten ab ${jahr(A.neue_fossile_heizung_ab)} nicht mehr nach dem Stufenmodell, sondern hälftig geteilt, und ab ${jahr(A.biobrennstoff_mehrkosten_ab)} auch die Mehrkosten der grünen Brennstoffe. Der ${h.a('co2-kostenaufteilung', 'Aufteilungsrechner')} zeigt den Unterschied. Was eine Kommune mit ihrem Wärmeplan festlegt, verpflichtet seit dem 29. Juli 2026 nicht mehr zum Heizungstausch (${h.a('waermeplanung', 'Wärmeplanung')}).</p>`,
  },
  en: {
    slug: 'gas-boiler-ban-germany',
    nav: 'Gas boiler ban',
    card: 'Whether a new gas boiler is allowed in Germany, how much biogas becomes mandatory from 2029 and what it costs a year.',
    title: 'Gas Boiler Ban Germany 2026: What Applies Since 29 July',
    description: `Gas boiler ban in Germany 2026: there is none. New gas boilers are allowed but need ${EN.pct(T[0].anteil)} biogas from ${jahr(T[0].ab)} and ${EN.pct(T[3].anteil)} from ${jahr(T[3].ab)}. Sections and yearly cost.`,
    h1: 'Gas boiler ban in Germany: the rules for a new boiler in 2026',
    intro: 'You may install a new gas boiler in your German home. The duties that follow, and what they cost each year, are set out here with section and date.',
    resume: `Germany has no ban on gas boilers, not even on new ones. Since 29 July 2026 the Building Modernisation Act (Gebäudemodernisierungsgesetz, GModG) applies, and it scrapped the rule that a new heating system had to run on ${EN.pct(G.alt_65_prozent)} renewable energy. Section 42 lists the gas boiler again as one of ten equal options. If you install one in an existing building after 29 July 2026, section 43 requires a rising share of the heat to come from biomethane or hydrogen: ${EN.pct(T[0].anteil)} from ${jahr(T[0].ab)}, ${EN.pct(T[1].anteil)} from ${jahr(T[1].ab)}, ${EN.pct(T[2].anteil)} from ${jahr(T[2].ab)} and ${EN.pct(T[3].anteil)} from ${jahr(T[3].ab)}. For a 140 m² house in class E in North Rhine-Westphalia that means about ${EN.num(gas.menge)} kWh of gas a year, of which ${EN.num(pflicht(0))} kWh must be green gas from ${jahr(T[0].ab)} and ${EN.num(pflicht(3))} kWh from ${jahr(T[3].ab)}. Landlords pay half the CO₂ cost of such a boiler from ${jahr(A.neue_fossile_heizung_ab)}.`,
    faqs: [
      { q: 'Can I still fit a new gas boiler in my German house?', a: `Yes. Section 42 GModG names heating with gas, heating oil or LPG as the first of ten options when a system is replaced. Since 29 July 2026 the law no longer requires a check on whether a heat network is coming, nor a mandatory consultation before installation. The duty comes later: the share of biomethane or hydrogen from ${jahr(T[0].ab)}.` },
      { q: 'How do I prove the biogas share of a new gas boiler?', a: `Usually through a gas tariff with the required share of biomethane. Section 43 allows other routes: solar thermal, which counts as compliant from ${jahr(T[0].ab)} to 2034 with ${EN.num(G.solar_m2_je_m2_bis_2we, 2)} m² of collector per m² of floor area (up to two homes), ventilation with heat recovery, or a hybrid whose heat pump delivers at least ${EN.pct(G.hybrid_wp_leistung_min)} of the boiler output.` },
      { q: 'What if my gas boiler breaks down in 2028?', a: 'If the old system fails beyond repair and a new gas or oil boiler goes in during 2028, the section 43 duty only starts twelve months after installation (subsection 7). From 2029, after a breakdown the duty of the old system carries on for twelve months, then the stage in force at that time applies. An emergency replacement is therefore possible without rushing.' },
      { q: 'Does the biogas rule apply to a gas boiler I already have?', a: `No. Section 43 covers only systems newly installed in an existing building after 29 July 2026. An older gas boiler may keep running on ordinary natural gas, with no age limit. It does pay the CO₂ price: for ${EN.num(gas.menge)} kWh a year at ${EN.eur(P.co2.auktion_2026_durchschnitt)} per tonne, about ${EN.eur(co2Heute)} including VAT.` },
      { q: 'Who pays for dearer biogas in a rented flat?', a: `For a gas, oil or LPG system installed under section 43, landlord and tenant split the extra cost of green fuels equally from 1 January ${jahr(A.biobrennstoff_mehrkosten_ab)}, on a fuel share of up to ${EN.pct(A.biobrennstoff_anteil_max)}. CO₂ costs and gas network charges are already split equally from ${jahr(A.neue_fossile_heizung_ab)} (section 5a of the CO₂ cost allocation act).` },
    ],
    body: (h) => `
<h2>No ban, but a staged duty</h2>
<p>The word "ban" comes from the 2023 debate on the Building Energy Act. Even then a new gas boiler was not banned, but after certain deadlines it had to run on ${h.pct(G.alt_65_prozent)} renewable energy. That rule in section 71 was deleted by the ${h.src('gmodgBgbl', 'act of 23 July 2026')}, along with sections 72 and 73. Since 29 July 2026 the ${h.src('gmodg', 'Building Modernisation Act')} lists the gas boiler in section 42 as an ordinary option again. Many English articles written for expats still describe the 2024 law; check the date before you rely on one.</p>
<p>In place of the percentage rule comes the duty in ${h.src('gmodg43', 'section 43 GModG')} to produce part of the heat in a climate-friendly way. It falls on the owner, or the operator under a contracting deal, and it does not start on installation but on 1 January ${jahr(T[0].ab)}.</p>
${h.table(['From', 'Required share', 'Green gas, example house', 'Natural gas left'], T.map((s, i) => [h.date(s.ab), h.pct(s.anteil), `${h.num(pflicht(i))} kWh`, `${h.num(gas.menge - pflicht(i))} kWh`]), `House 140 m², class E, North Rhine-Westphalia, ${h.num(gas.menge)} kWh gas a year`, ['l', 'r', 'r', 'r'])}
<p>When comparing with older guides: the 2024 law set ${h.pct(G.biotreppe_alt_geg2024[0].anteil)} from ${jahr(G.biotreppe_alt_geg2024[0].ab)} for boilers fitted during the transition period. The GModG starts at ${h.pct(T[0].anteil)} and adds a ${h.pct(T[1].anteil)} step in ${jahr(T[1].ab)}. A page quoting ${h.pct(G.biotreppe_alt_geg2024[0].anteil)} from ${jahr(G.biotreppe_alt_geg2024[0].ab)} describes the law as it stood until 28 July 2026.</p>
<!--mini:biotreppe-->

<h2>Which boilers are covered</h2>
<p>The duty applies only to gas, oil and LPG systems newly installed in an existing building after 29 July 2026. A boiler that was running before is not affected, however old it is. The former rule forcing boilers out of service after 30 years was in section 72 and has also been deleted, as has the end date for fossil fuels at the close of 2044. Instead, under section 42a the federal government must present a separate law by 1 December 2026 that will require suppliers to make gas and oil for buildings fully climate-neutral by ${G.klimaneutral_ab}. That law does not exist yet.</p>
<p>New buildings face more: from 1 January 2030 every new building must be a zero-emission building that causes no on-site CO₂ from fossil fuels (article 4 of the act of 23 July 2026). A gas boiler in a new build is then effectively ruled out. That rule does not apply when you replace the heating in an existing house.</p>

<h2>The hybrid way out</h2>
<p>If you want to keep gas but not buy a biogas tariff, you can pair the boiler with a heat pump. Under section 43(5) the duty then counts as fully met if the heat pump reaches at least ${h.pct(G.hybrid_wp_leistung_min)} of the gas boiler output at test point A of DIN EN 14825, or ${h.pct(0.4)} in bivalent alternative mode. A house with a 20 kW boiler would therefore need a heat pump of about 6 kW at that test point. In buildings with six or more homes, the owner must prove after 2039 what share the heat pump actually supplies if more than ${h.pct(G.hybrid_wp_leistung_min)} is to be counted. The heat pump in a hybrid is renewable heating and can be funded under programme 458; the gas boiler cannot. Direct electric heating instead runs into section 46: it is only allowed if the insulation beats the requirements by at least 30 per cent, except in buildings with no more than two homes where the owner lives in one.</p>

<h2>What the duty costs each year</h2>
<p>The premium for biomethane depends on the tariff, and there is no official price statistic for it. That is why the calculator above uses your own premium in cents per kWh. Two other items are certain. First, the CO₂ price on the natural gas share: in the example house about ${h.eur(co2Heute)} a year at ${h.eur(P.co2.auktion_2026_durchschnitt)} per tonne, more under ${h.a('co2-preis-2027', 'CO₂ price 2027')}. Second, the heating bill itself: at the gas price from the ${h.src('destatisPreise', 'Federal Statistical Office survey')} the heat costs ${h.eur(gas.kosten)} a year. An air source heat pump with a measured seasonal performance factor of ${h.num(P.technik.jaz_luft_messung, 1)} would use ${h.eur(wp.kosten)} of electricity on a heat pump tariff in the same house. The full comparison with purchase cost and grant is under ${h.a('waermepumpe-oder-gasheizung', 'heat pump or gas boiler')}.</p>

<h2>Grants and letting</h2>
<p>A new gas boiler gets no grant from programme 458. Only renewable heating and connection to a heat network are funded (${h.a('kfw-458', 'KfW 458')}). If you let the property, know the ${h.src('co2kostaufg', 'CO₂ cost allocation act')}: for systems installed under section 43, CO₂ costs are split equally from ${jahr(A.neue_fossile_heizung_ab)} rather than by the stage model, and from ${jahr(A.biobrennstoff_mehrkosten_ab)} so is the extra cost of green fuels. The ${h.a('co2-kostenaufteilung', 'cost split calculator')} shows the difference. Whatever a municipality sets out in its heat plan has no longer forced a heating replacement since 29 July 2026 (${h.a('waermeplanung', 'heat planning')}).</p>`,
  },
});

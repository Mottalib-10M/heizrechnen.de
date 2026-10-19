import { defineGuide } from '../../lib/guide-types';
import { nutzwaerme, laufend } from '../../lib/engine/heizkosten';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Strompreis der Wärmepumpe: welche amtlichen Preise es gibt (Destatis 1. Halbjahr 2026 für Haushaltsstrom,
 * Bundesnetzagentur Monitoringbericht 2025, Tabelle 45, Stichtag 01.04.2025, für Heizstrom) und was sie im Jahr bedeuten.
 * Beispielhaus: 140 m², Klasse E, Niedersachsen (Luft- und Erdwärmepumpe, JAZ aus Fraunhofer ISE).
 */
const Pr = P.preise;
const T = P.technik;
const q = nutzwaerme({ flaeche: 140, klasse: 'E', land: 'Niedersachsen' });
const luft = laufend('wp_luft', q)!;
const sole = laufend('wp_sole', q)!;
const kwhL = luft.menge;
const jahr = (ct: number, kwh = kwhL) => (kwh * ct) / 100;
const getrennt = jahr(Pr.wp_strom_getrennt_ct), gemeinsam = jahr(Pr.wp_strom_gemeinsam_ct), haushalt = jahr(Pr.strom_haushalt_ct), gross = jahr(Pr.strom_haushalt_ueber_15000_ct);
const jeCent = kwhL / 100;
const kwhSchwach = q / T.jaz_luft_min, kwhStark = q / T.jaz_luft_max;
const fall = 7500;

export default defineGuide({
  id: 'strompreis-waermepumpe',
  group: 'kosten',
  order: 122,
  mini: 'strompreis',
  miniHref: 'waermepumpe-stromverbrauch',
  related: ['waermepumpentarif', 'waermepumpe-stromverbrauch', 'waermepumpe-rechner', 'heizkosten-vergleich', 'waermepumpe-oder-gasheizung', 'kfw-458'],
  sources: ['bnetza', 'destatisPreise', 'iseWpqs', 'enfg22'],
  de: {
    slug: 'strompreis-waermepumpe',
    nav: 'Strompreis Wärmepumpe',
    card: 'Welche amtlichen Strompreise es für Wärmepumpen gibt, woraus sie bestehen und was ein Cent mehr oder weniger im Jahr kostet.',
    title: 'Strompreis Wärmepumpe 2026: Amtliche Werte und Jahreskosten',
    description: `Strompreis Wärmepumpe 2026: ${DE.num(Pr.wp_strom_getrennt_ct, 2)} ct mit eigenem Zähler, ${DE.num(Pr.strom_haushalt_ct, 2)} ct Haushaltsstrom. Woher die amtlichen Zahlen stammen und was jeder Cent im Jahr ausmacht.`,
    h1: 'Strompreis für die Wärmepumpe: die amtlichen Zahlen',
    intro: 'Der Strompreis entscheidet, wie viel eine Wärmepumpe im Betrieb kostet. Zwei Behörden veröffentlichen Durchschnittswerte, die man richtig lesen muss.',
    resume: `Für den Strompreis einer Wärmepumpe gibt es zwei amtliche Quellen. Die Bundesnetzagentur hat für den 1. April 2025 die Heizstromtarife erhoben: Wärmepumpen mit eigenem Zähler zahlten im Mittel ${DE.num(Pr.wp_strom_getrennt_ct, 2)} ct je kWh, Wärmepumpen an einem gemeinsamen Zähler mit dem Haushalt ${DE.num(Pr.wp_strom_gemeinsam_ct, 2)} ct, jeweils mit Grundpreis und Steuern. Das Statistische Bundesamt meldet für den Haushaltsstrom im ersten Halbjahr 2026 durchschnittlich ${DE.num(Pr.strom_haushalt_ct, 2)} ct, für Haushalte über ${DE.num(15000)} kWh Jahresverbrauch ${DE.num(Pr.strom_haushalt_ueber_15000_ct, 2)} ct. Ein Haus mit 140 m² in Klasse E in Niedersachsen braucht mit einer Luft-Wärmepumpe und der gemessenen Jahresarbeitszahl von ${DE.num(T.jaz_luft_messung, 1)} rund ${DE.num(kwhL)} kWh Strom im Jahr. Das kostet mit eigenem Zähler ${DE.eur(getrennt)}, am gemeinsamen Zähler ${DE.eur(gemeinsam)} und zum Haushaltsstrompreis ${DE.eur(haushalt)}. Jeder Cent je kWh macht in diesem Haus ${DE.eur(jeCent)} im Jahr aus. Die Heizstromwerte stammen aus der Zeit vor den niedrigeren Netzentgelten 2026 und dürften heute eher zu hoch liegen.`,
    faqs: [
      { q: 'Mit welchem Strompreis sollte ich eine Wärmepumpe 2026 kalkulieren?', a: `Am besten mit dem Arbeitspreis und dem Grundpreis aus einem konkreten Angebot Ihres Versorgers. Ohne Angebot sind die Durchschnittswerte ein brauchbarer Anfang: ${DE.num(Pr.wp_strom_getrennt_ct, 2)} ct mit eigenem Zähler, ${DE.num(Pr.wp_strom_gemeinsam_ct, 2)} ct am gemeinsamen Zähler laut Bundesnetzagentur, ${DE.num(Pr.strom_haushalt_ct, 2)} ct für gewöhnlichen Haushaltsstrom laut Destatis. Rechnen Sie zusätzlich mit einem Wert zwei oder drei Cent darüber, um zu sehen, wie robust Ihre Rechnung ist.` },
      { q: 'Warum ist Wärmepumpenstrom mit eigenem Zähler billiger?', a: `Laut Bundesnetzagentur aus mehreren Gründen. Für Strom, der über einen eigenen Zählpunkt in die Wärmepumpe fließt, entfallen nach § 22 EnFG die KWK-Umlage und die Offshore-Netzumlage. Heizstrom trägt zudem geringere Netzentgelte, weil der Netzbetreiber den Verbrauch steuern darf, und eine niedrigere Konzessionsabgabe. Der Anteil, den der Lieferant selbst beeinflusst, also Einkauf, Vertrieb und Marge, ist dagegen nicht kleiner als bei anderen Tarifen.` },
      { q: 'Was bringt ein Cent weniger Strompreis bei der Wärmepumpe im Jahr?', a: `So viel Euro, wie die Wärmepumpe hundert Kilowattstunden verbraucht. Im Beispielhaus mit ${DE.num(kwhL)} kWh Jahresverbrauch sind es ${DE.eur(jeCent)}. Der Abstand zwischen Haushaltsstrom und Tarif mit eigenem Zähler beträgt im Durchschnitt ${DE.num(Pr.strom_haushalt_ct - Pr.wp_strom_getrennt_ct, 2)} ct, im Beispiel also ${DE.eur(haushalt - getrennt)} im Jahr. Wie groß der Abstand an Ihrer Adresse ist, zeigt nur ein konkretes Angebot.` },
      { q: 'Sind die Heizstrompreise vom April 2025 noch aussagekräftig?', a: `Als Größenordnung ja, als genauer Wert eher nicht. Die Bundesnetzagentur hat sie zum Stichtag 1. April 2025 erhoben, für einen Jahresverbrauch von ${DE.num(fall)} kWh. Seitdem sind die Netzentgelte gesunken: Das Statistische Bundesamt nennt sie als wichtigen Grund dafür, dass Haushaltsstrom im ersten Halbjahr 2026 günstiger wurde. Für Wärmepumpentarife fehlt eine neuere amtliche Erhebung, die Werte dürften heute also eher niedriger liegen.` },
      { q: 'Gilt der Preis für Haushalte über 15.000 kWh auch mit Wärmepumpe?', a: `Er ist ein Durchschnitt aller Haushalte mit so hohem Verbrauch, kein Tarif, den man buchen kann. Mit ${DE.num(Pr.strom_haushalt_ueber_15000_ct, 2)} ct lag er im ersten Halbjahr 2026 deutlich unter dem Gesamtdurchschnitt, weil sich der Grundpreis auf mehr Kilowattstunden verteilt. Im Beispielhaus braucht die Wärmepumpe allein ${DE.num(kwhL)} kWh, erst mit sehr hohem übrigen Verbrauch fiele der Haushalt in diese Gruppe. Für einen Vergleich taugt eher der Tarif mit gemeinsamer Messung der Bundesnetzagentur.` },
    ],
    body: (h) => `
<h2>Zwei Behörden, vier Preise</h2>
<p>Einen einzigen „Wärmepumpenstrompreis“ gibt es nicht. Die ${h.src('bnetza', 'Bundesnetzagentur')} fragt in ihrem Monitoringbericht jedes Jahr die Heizstromlieferanten nach ihren Preisen und unterscheidet dabei Nachtspeicher, Wärmepumpen mit gemeinsamer Messung und Wärmepumpen mit getrennter Messung. Das ${h.src('destatisPreise', 'Statistische Bundesamt')} erhebt halbjährlich die Preise für Haushaltsstrom über alle Verträge, von der Grundversorgung bis zum neuen Sondervertrag. Beide Werte enthalten Arbeitspreis, Grundpreis, Netzentgelte, Umlagen und Steuern, sind also Gesamtpreise je kWh.</p>
${h.table(['Preis', 'ct je kWh', 'Stand', 'Kosten im Beispielhaus'], [
  ['Wärmepumpe, eigener Zähler', h.num(Pr.wp_strom_getrennt_ct, 2), h.date(Pr.wp_strom_stand), h.eur(getrennt)],
  ['Haushalt über 15.000 kWh', h.num(Pr.strom_haushalt_ueber_15000_ct, 2), Pr.strom_stand, h.eur(gross)],
  ['Wärmepumpe, gemeinsamer Zähler', h.num(Pr.wp_strom_gemeinsam_ct, 2), h.date(Pr.wp_strom_stand), h.eur(gemeinsam)],
  ['Haushaltsstrom, Durchschnitt', h.num(Pr.strom_haushalt_ct, 2), Pr.strom_stand, h.eur(haushalt)],
], `Beispielhaus 140 m², Klasse E, Niedersachsen, Luft-Wärmepumpe, ${h.num(kwhL)} kWh Strom im Jahr`, ['l', 'r', 'l', 'r'])}
<p>Die Bundesnetzagentur hat die Lieferanten für einen Jahresverbrauch von ${h.num(fall)} kWh gefragt und die Antworten nach Menge gewichtet. Wer deutlich weniger verbraucht, zahlt je kWh etwas mehr, weil der Grundpreis auf weniger Kilowattstunden fällt. Die Zahlen von Destatis gelten für das erste Halbjahr 2026; die Heizstromwerte stammen vom Frühjahr 2025 und sind damit die ältere Quelle.</p>

<h2>Woraus der Preis besteht</h2>
<p>Nach der Aufschlüsselung der Bundesnetzagentur macht der Teil, den der Lieferant selbst bestimmt, also Einkauf, Vertrieb und Marge, ungefähr die Hälfte des Heizstrompreises aus. Der Rest sind Netzentgelte, Messstellenbetrieb, Konzessionsabgabe, Umlagen, Stromsteuer und Umsatzsteuer. Genau dort liegt der Vorteil der getrennten Messung: Für Strom, der über einen eigenen Zählpunkt in die Wärmepumpe fließt, entfallen nach § 22 EnFG die KWK-Umlage und die Offshore-Netzumlage. Dazu kommen ein niedrigeres Netzentgelt, weil der Netzbetreiber die Wärmepumpe steuern darf, und eine geringere Konzessionsabgabe. Was der zweite Zähler kostet und welche Netzentgelt-Module es gibt, erklärt ${h.a('waermepumpentarif', 'Wärmepumpentarif')}.</p>

<h2>Warum die Werte für 2026 eher zu hoch sind</h2>
<p>Das Statistische Bundesamt meldet, dass Strom für Haushalte im ersten Halbjahr 2026 günstiger geworden ist als im zweiten Halbjahr 2025, und nennt als wichtigen Grund die niedrigeren Netzentgelte nach der Bezuschussung der Netzbetreiber durch den Bund. Diese Entlastung ist in den Heizstromwerten vom April 2025 noch nicht enthalten. Eine neuere amtliche Erhebung für Wärmepumpentarife gibt es noch nicht. Wer mit ${h.num(Pr.wp_strom_getrennt_ct, 2)} ct rechnet, ist deshalb eher vorsichtig unterwegs. Für eine eigene Entscheidung zählt ohnehin das Angebot, das für Ihre Adresse gilt.</p>

<h2>Verbrauch mal Preis: die Rechnung im Jahr</h2>
<p>Die Stromkosten sind das Produkt aus zwei Zahlen. Den Preis kennt man aus dem Vertrag, den Verbrauch muss man schätzen. Im Beispielhaus braucht eine Luft-Wärmepumpe bei der im Bestand gemessenen Jahresarbeitszahl von ${h.num(T.jaz_luft_messung, 1)} rund ${h.num(kwhL)} kWh, eine Erdwärmepumpe mit ${h.num(T.jaz_sole_messung, 1)} nur ${h.num(sole.menge)} kWh (${h.src('iseWpqs', 'Fraunhofer ISE')}). Läuft die Luft-Wärmepumpe so schwach wie die schlechteste Anlage der Messung, sind es ${h.num(kwhSchwach)} kWh, so gut wie die beste nur ${h.num(kwhStark)} kWh.</p>
${h.table(['Jahresarbeitszahl', 'Strom im Jahr', 'eigener Zähler', 'Haushaltsstrom'], [
  [h.num(T.jaz_luft_min, 1), `${h.num(kwhSchwach)} kWh`, h.eur(jahr(Pr.wp_strom_getrennt_ct, kwhSchwach)), h.eur(jahr(Pr.strom_haushalt_ct, kwhSchwach))],
  [h.num(T.jaz_luft_messung, 1), `${h.num(kwhL)} kWh`, h.eur(getrennt), h.eur(haushalt)],
  [h.num(T.jaz_luft_max, 1), `${h.num(kwhStark)} kWh`, h.eur(jahr(Pr.wp_strom_getrennt_ct, kwhStark)), h.eur(jahr(Pr.strom_haushalt_ct, kwhStark))],
], 'Luft-Wärmepumpe im Beispielhaus, Spanne der Feldmessung', ['r', 'r', 'r', 'r'])}
<p>Die Tabelle zeigt, dass die Effizienz der Anlage den Strompreis überholen kann: Eine gut eingestellte Wärmepumpe am teuren Haushaltsstrom kommt billiger weg als eine schlecht laufende am günstigen Tarif. Ihren eigenen Verbrauch aus Gasrechnung oder Wohnfläche ermittelt ${h.a('waermepumpe-stromverbrauch', 'Wärmepumpe Stromverbrauch')}.</p>
<!--mini:klasse-->

<h2>Ein Angebot richtig lesen</h2>
<p>Drei Angaben entscheiden, ob ein Angebot zu den Durchschnittswerten passt. Erstens der Arbeitspreis je kWh, bei einem Zweitarifzähler getrennt für Hoch- und Niedertarif, also für die übrigen Zeiten und die Schwachlastzeiten. Zweitens der Grundpreis im Jahr, bei einem eigenen Zähler zusätzlich das Entgelt für den Messstellenbetrieb. Teilt man alle festen Beträge durch den erwarteten Verbrauch und addiert den Arbeitspreis, erhält man den Gesamtpreis je kWh, wie ihn die Tabelle oben zeigt. Drittens Laufzeit und Preisgarantie: Ein günstiger Preis für zwölf Monate sagt wenig über die zwanzig Jahre, die eine Wärmepumpe laufen soll. Wer Angebote vergleicht, rechnet jedes mit demselben Jahresverbrauch durch, etwa den ${h.num(kwhL)} kWh aus dem Beispielhaus oder dem eigenen Wert aus dem Rechner.</p>

<h2>Was das für die Entscheidung bedeutet</h2>
<p>Für den Vergleich mit einer Gasheizung zählt der Abstand zwischen Strom- und Gaspreis, geteilt durch die Effizienz. Den Preis einer Kilowattstunde Wärme für jede Heizung stellt ${h.a('heizkosten-vergleich', 'Heizkosten Vergleich')} nebeneinander. Ob sich der Wechsel mit Anschaffung und Zuschuss rechnet, zeigt ${h.a('waermepumpe-oder-gasheizung', 'Wärmepumpe oder Gasheizung')}, und den vollständigen Betrieb mit Ihrem Strompreis rechnet der ${h.a('waermepumpe-rechner', 'Wärmepumpe Rechner')}. Wer erst noch kauft, findet den Zuschuss unter ${h.a('kfw-458', 'KfW 458')}.</p>`,
  },
  en: {
    slug: 'heat-pump-electricity-price',
    nav: 'Heat pump electricity price',
    card: 'Which official electricity prices exist for heat pumps in Germany, what they are made of and what one cent more or less costs a year.',
    title: 'Heat pump electricity price 2026: official German figures',
    description: `Heat pump electricity price 2026 in Germany: ${EN.num(Pr.wp_strom_getrennt_ct, 2)} ct with a separate meter, ${EN.num(Pr.strom_haushalt_ct, 2)} ct household power. Where the figures come from and what a cent is worth.`,
    h1: 'Heat pump electricity price: the official numbers',
    intro: 'The electricity price decides what a heat pump costs to run. Two German authorities publish averages, and both need careful reading.',
    resume: `There are two official sources for what a heat pump’s electricity costs in Germany. The Federal Network Agency surveyed heating tariffs on 1 April 2025: heat pumps with their own meter paid ${EN.num(Pr.wp_strom_getrennt_ct, 2)} ct per kWh on average, heat pumps sharing a meter with the household ${EN.num(Pr.wp_strom_gemeinsam_ct, 2)} ct, standing charge and taxes included. The Federal Statistical Office reports ${EN.num(Pr.strom_haushalt_ct, 2)} ct for household electricity in the first half of 2026, and ${EN.num(Pr.strom_haushalt_ueber_15000_ct, 2)} ct for households using over ${EN.num(15000)} kWh a year. A 140 m² class E house in Lower Saxony with an air-source heat pump at the measured performance factor of ${EN.num(T.jaz_luft_messung, 1)} uses about ${EN.num(kwhL)} kWh a year. That costs ${EN.eur(getrennt)} with a separate meter, ${EN.eur(gemeinsam)} on a shared meter and ${EN.eur(haushalt)} at the household price. Each cent per kWh is worth ${EN.eur(jeCent)} a year in this house. The heating tariff figures predate the lower 2026 network charges and are probably on the high side today.`,
    faqs: [
      { q: 'Which electricity price should I assume for a heat pump in 2026?', a: `Ideally the unit price and standing charge from a real offer by a supplier for your address. Without one, the averages are a reasonable start: ${EN.num(Pr.wp_strom_getrennt_ct, 2)} ct with a separate meter, ${EN.num(Pr.wp_strom_gemeinsam_ct, 2)} ct on a shared meter according to the Federal Network Agency, ${EN.num(Pr.strom_haushalt_ct, 2)} ct for ordinary household power according to Destatis. Also run the numbers two or three cents higher to see how robust your plan is.` },
      { q: 'Why is heat pump power cheaper with its own meter?', a: `According to the Federal Network Agency, for several reasons. Electricity drawn through a separate metering point for a heat pump is exempt from the combined heat and power levy and the offshore grid levy under section 22 of the Energy Financing Act (EnFG). Heating power also carries lower network charges, because the grid operator may control the unit, and a lower concession fee. The supplier’s own share, meaning purchasing, sales and margin, is not lower than on other tariffs.` },
      { q: 'What is one cent less on the heat pump electricity price worth a year?', a: `As many euros as the heat pump uses hundreds of kilowatt hours. In the example house using ${EN.num(kwhL)} kWh a year, that is ${EN.eur(jeCent)}. The average gap between household power and a separately metered tariff is ${EN.num(Pr.strom_haushalt_ct - Pr.wp_strom_getrennt_ct, 2)} ct, so ${EN.eur(haushalt - getrennt)} a year in the example. Only a real offer for your address shows how large the gap is there.` },
      { q: 'Are the April 2025 heating tariff prices still meaningful?', a: `As an order of magnitude, yes; as an exact figure, less so. The Federal Network Agency collected them for 1 April 2025, for annual use of ${EN.num(fall)} kWh. Network charges have fallen since: the Federal Statistical Office names them as a main reason household power became cheaper in the first half of 2026. No newer official survey of heat pump tariffs exists, so today’s figures are probably lower.` },
      { q: 'Does the price for homes using over 15,000 kWh apply with a heat pump?', a: `It is an average of all households with such high consumption, not a tariff you can sign up for. At ${EN.num(Pr.strom_haushalt_ueber_15000_ct, 2)} ct in the first half of 2026 it was well below the overall average, because the standing charge is spread over more kilowatt hours. In the example house the heat pump alone uses ${EN.num(kwhL)} kWh; only with very high other use would the household fall into that group. The Federal Network Agency’s shared-meter tariff is the better comparison.` },
    ],
    body: (h) => `
<h2>Two authorities, four prices</h2>
<p>There is no single “heat pump electricity price”. Every year the ${h.src('bnetza', 'Federal Network Agency')} asks heating power suppliers for their prices in its monitoring report, separating storage heaters, heat pumps on a shared meter and heat pumps on their own meter. The ${h.src('destatisPreise', 'Federal Statistical Office (Destatis)')} surveys household electricity prices twice a year across all contracts, from the default supply tariff (Grundversorgung) to new special contracts. Both figures include unit price, standing charge, network charges, levies and taxes, so they are all-in prices per kWh.</p>
${h.table(['Price', 'ct per kWh', 'As of', 'Cost in the example house'], [
  ['Heat pump, separate meter', h.num(Pr.wp_strom_getrennt_ct, 2), h.date(Pr.wp_strom_stand), h.eur(getrennt)],
  ['Household above 15,000 kWh', h.num(Pr.strom_haushalt_ueber_15000_ct, 2), 'first half of 2026', h.eur(gross)],
  ['Heat pump, shared meter', h.num(Pr.wp_strom_gemeinsam_ct, 2), h.date(Pr.wp_strom_stand), h.eur(gemeinsam)],
  ['Household power, average', h.num(Pr.strom_haushalt_ct, 2), 'first half of 2026', h.eur(haushalt)],
], `Example house 140 m², class E, Lower Saxony, air-source heat pump, ${h.num(kwhL)} kWh of power a year`, ['l', 'r', 'l', 'r'])}
<p>The Federal Network Agency asked suppliers about annual use of ${h.num(fall)} kWh and weighted the answers by volume. If you use much less, you pay a little more per kWh because the standing charge is spread over fewer units. The Destatis figures cover the first half of 2026; the heating tariff values date from spring 2025 and are the older source.</p>

<h2>What the price is made of</h2>
<p>In the Federal Network Agency’s breakdown, the part the supplier controls, meaning purchasing, sales and margin, is roughly half of the heating power price. The rest is network charges, metering, concession fee, levies, electricity tax and VAT. That is where separate metering pays: electricity flowing to the heat pump through its own metering point is exempt from the combined heat and power levy and the offshore grid levy under section 22 of the Energy Financing Act. On top come a lower network charge, because the grid operator may control the heat pump, and a lower concession fee. What the second meter costs and which network charge options exist is explained under ${h.a('waermepumpentarif', 'heat pump tariff')}.</p>

<h2>Why the 2026 figures are probably too high</h2>
<p>Destatis reports that household electricity in the first half of 2026 was cheaper than in the second half of 2025, and names lower network charges after federal subsidies to grid operators as a main reason. That relief is not yet in the April 2025 heating tariff values, and no newer official survey of heat pump tariffs exists. Using ${h.num(Pr.wp_strom_getrennt_ct, 2)} ct is therefore on the cautious side. For your own decision, the offer for your address is what counts. Supplier contracts and price sheets are in German; the key terms are Arbeitspreis (unit price) and Grundpreis (standing charge).</p>

<h2>Use times price: the yearly bill</h2>
<p>The electricity cost is the product of two numbers. You know the price from the contract; the consumption has to be estimated. In the example house an air-source heat pump at the performance factor of ${h.num(T.jaz_luft_messung, 1)} measured in existing buildings uses about ${h.num(kwhL)} kWh, a ground-source unit at ${h.num(T.jaz_sole_messung, 1)} only ${h.num(sole.menge)} kWh (${h.src('iseWpqs', 'Fraunhofer ISE')}). If the air unit runs as poorly as the weakest system in the study, it is ${h.num(kwhSchwach)} kWh; as well as the best, only ${h.num(kwhStark)} kWh.</p>
${h.table(['Performance factor', 'Power a year', 'Separate meter', 'Household power'], [
  [h.num(T.jaz_luft_min, 1), `${h.num(kwhSchwach)} kWh`, h.eur(jahr(Pr.wp_strom_getrennt_ct, kwhSchwach)), h.eur(jahr(Pr.strom_haushalt_ct, kwhSchwach))],
  [h.num(T.jaz_luft_messung, 1), `${h.num(kwhL)} kWh`, h.eur(getrennt), h.eur(haushalt)],
  [h.num(T.jaz_luft_max, 1), `${h.num(kwhStark)} kWh`, h.eur(jahr(Pr.wp_strom_getrennt_ct, kwhStark)), h.eur(jahr(Pr.strom_haushalt_ct, kwhStark))],
], 'Air-source heat pump in the example house, range of the field study', ['r', 'r', 'r', 'r'])}
<p>The table shows that the efficiency of the system can outweigh the electricity price: a well set-up heat pump on expensive household power comes out cheaper than a poorly running one on a cheap tariff. To estimate your own consumption from your gas bill or floor area, use ${h.a('waermepumpe-stromverbrauch', 'heat pump electricity use')}.</p>
<!--mini:klasse-->

<h2>Reading an offer</h2>
<p>Three details show whether an offer is in line with the averages. First, the unit price per kWh, which on a two-rate meter is split into a high rate and a low rate for off-peak hours. Second, the yearly standing charge, plus the metering fee if the heat pump has its own meter. Divide all fixed amounts by your expected use, add the unit price, and you get the all-in price per kWh shown in the table above. Third, contract term and price guarantee: a low price for twelve months says little about the twenty years a heat pump should run. When comparing offers, work each one out with the same annual use, for example the ${h.num(kwhL)} kWh of the example house or your own figure from the calculator.</p>

<h2>What this means for the decision</h2>
<p>For a comparison with a gas boiler, what matters is the gap between the electricity and gas price, divided by efficiency. The price of one kWh of heat for each system is set out under ${h.a('heizkosten-vergleich', 'heating costs compared')}. Whether switching pays off once purchase and grant are included is shown under ${h.a('waermepumpe-oder-gasheizung', 'heat pump or gas boiler')}, and the ${h.a('waermepumpe-rechner', 'heat pump calculator')} runs the full numbers with your own price. If you have not bought yet, the grant is explained under ${h.a('kfw-458', 'KfW 458')}.</p>`,
  },
});

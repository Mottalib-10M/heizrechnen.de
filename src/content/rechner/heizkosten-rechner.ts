import { defineGuide } from '../../lib/guide-types';
import { nutzwaerme, laufend, vergleich, co2Mehrkosten, STANDARDPREISE, type System } from '../../lib/engine/heizkosten';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Heizkosten Rechner: alle Heizungen nebeneinander (Modus „alle“). Zwei eigene Beispielhäuser:
 * jüngeres Haus 110 m², Klasse C, Niedersachsen; unsaniertes Haus 160 m², Klasse F, Sachsen.
 */
const Pr = P.preise;
const qA = nutzwaerme({ flaeche: 110, klasse: 'C', land: 'Niedersachsen' });
const qB = nutzwaerme({ flaeche: 160, klasse: 'F', land: 'Sachsen' });
const A = vergleich(qA);
const B = vergleich(qB);
const von = (l: ReturnType<typeof vergleich>, s: System) => l.find((x) => x.system === s)!;
const gasB = von(B, 'gas');
const oelB = von(B, 'oel');
const wpB = von(B, 'wp_luft');
const speicherB = von(B, 'nachtspeicher');
const oelBakt = laufend('oel', qB, { ...STANDARDPREISE, oelEur100: Pr.oel_eur_100l_aktuell })!;
/** Fernwärmepreis (ct/kWh Wärme), bei dem Fernwärme so viel kostet wie die Gasheizung. */
const fernGleichGas = (gasB.kosten / qB) * 100;
const szenario = 150;
const gasB150 = gasB.kosten + co2Mehrkosten(gasB.co2, szenario);
const oelB150 = oelB.kosten + co2Mehrkosten(oelB.co2, szenario);

const NAME: Record<System, { de: string; en: string }> = {
  wp_sole: { de: 'Erdwärmepumpe', en: 'Ground-source heat pump' },
  wp_luft: { de: 'Luft-Wärmepumpe', en: 'Air-source heat pump' },
  oel: { de: 'Ölheizung', en: 'Oil boiler' },
  gas: { de: 'Gasheizung', en: 'Gas boiler' },
  nachtspeicher: { de: 'Nachtspeicher', en: 'Storage heaters' },
  fernwaerme: { de: 'Fernwärme', en: 'District heating' },
};

export default defineGuide({
  id: 'heizkosten-rechner',
  group: 'kosten',
  order: 102,
  tool: 'heizkosten',
  toolPreset: { mode: 'alle' },
  related: ['heizkosten-vergleich', 'heizkosten-bundesland', 'fernwaerme-preise', 'gaspreis', 'co2-steuer', 'waermepumpe-rechner'],
  sources: ['destatisPreise', 'wob', 'bnetza', 'dwd', 'gmodgAnlage10', 'dehst'],
  de: {
    slug: 'heizkosten-rechner',
    nav: 'Heizkosten Rechner',
    card: 'Gas, Öl, Wärmepumpe, Nachtspeicher und Fernwärme nebeneinander: Jahreskosten für Ihr Haus und Ihr Bundesland.',
    title: 'Heizkosten Rechner 2026: Alle Heizungen im Jahresvergleich',
    description: `Heizkosten Rechner 2026: Gas, Öl, Luft- und Erdwärmepumpe, Nachtspeicher und Fernwärme für Ihr Haus. Gaspreis ${DE.num(Pr.gas_ct, 2)} ct laut Destatis, CO₂-Szenario wählbar.`,
    h1: 'Heizkosten Rechner: alle Heizungen für Ihr Haus im Vergleich',
    intro: 'Ein Haus, sechs Heizungen: Der Rechner stellt die Jahreskosten jeder Heizart für Ihre Wohnfläche, Effizienzklasse und Ihr Bundesland nebeneinander.',
    resume: `Der Heizkosten Rechner legt für ein und dieselbe Wärmemenge die Jahreskosten aller gängigen Heizungen nebeneinander: Gas, Heizöl, Luft-Wärmepumpe, Erdwärmepumpe, Nachtspeicher und, wenn Sie Ihren Preis eintragen, Fernwärme. Die Wärmemenge ergibt sich aus Wohnfläche, Effizienzklasse und Klima des Bundeslandes. Die Preise sind amtlich: Gas ${DE.num(Pr.gas_ct, 2)} ct je kWh und Strom aus der Destatis-Erhebung für das erste Halbjahr 2026, Heizöl aus dem Weekly Oil Bulletin, Wärmepumpen- und Nachtspeicherstrom von der Bundesnetzagentur. Ein unsaniertes Haus mit 160 m² in Klasse F in Sachsen braucht rund ${DE.num(qB)} kWh Wärme. Dafür zahlt es mit Gas ${DE.eur(gasB.kosten)} im Jahr, mit Heizöl zum Zwölfmonatsschnitt ${DE.eur(oelB.kosten)}, zum Oktoberpreis aber ${DE.eur(oelBakt.kosten)}. Die Luft-Wärmepumpe kommt auf ${DE.eur(wpB.kosten)}, die Nachtspeicherheizung auf ${DE.eur(speicherB.kosten)}. Fernwärme wäre günstiger als Gas, solange der Gesamtpreis laut Abrechnung unter ${DE.num(fernGleichGas, 2)} ct je kWh liegt. Steigt der CO₂-Preis im Szenario auf ${DE.eur(szenario)} je Tonne, kostet Gas ${DE.eur(gasB150)}.`,
    faqs: [
      { q: 'Warum ist Heizöl im Heizkosten Rechner mal billiger und mal teurer als Gas?', a: `Weil der Ölpreis 2026 stark gesprungen ist. Im Schnitt der letzten zwölf Monate kosteten 100 Liter ${DE.num(Pr.oel_eur_100l_12monate, 2)} €, Mitte Oktober 2026 ${DE.num(Pr.oel_eur_100l_aktuell, 2)} €. Mit dem Durchschnitt liegt Öl im Beispielhaus unter Gas, mit dem aktuellen Preis deutlich darüber. Wer Öl im Tank hat, rechnet am besten mit dem Preis, den er selbst bezahlt hat.` },
      { q: 'Wie trage ich Fernwärme in den Heizkosten Rechner ein?', a: `Mit dem Gesamtpreis je kWh aus Ihrer letzten Abrechnung, also alle Kosten des Jahres geteilt durch die gelieferte Wärme. Eine amtliche Durchschnittszahl für Fernwärme gibt es nicht, auch nicht je Bundesland oder Stadt. Ohne Eintrag zeigt der Rechner für Fernwärme den Wert der Gasheizung als Platzhalter und weist darauf hin.` },
      { q: 'Steckt der CO₂-Preis schon in den Heizkosten für Gas und Öl?', a: `Ja. Die Preise von Destatis und dem Weekly Oil Bulletin enthalten den CO₂-Preis, den die Lieferanten 2026 weitergeben. Die Versteigerungen der Deutschen Emissionshandelsstelle lagen 2026 im Schnitt bei ${DE.eur(P.co2.auktion_2026_durchschnitt)} je Tonne. Ein höherer Wert im Feld „CO₂-Preis je Tonne“ rechnet nur den Unterschied dazu, mit Mehrwertsteuer. Für Wärmepumpen und Nachtspeicher fällt dieser Aufschlag nicht an.` },
      { q: 'Warum schneiden Nachtspeicherheizungen im Vergleich so schlecht ab?', a: `Weil sie jede kWh Wärme aus einer kWh Strom machen. Die Wärmepumpe holt mit derselben kWh Strom im Mittel ${DE.num(P.technik.jaz_luft_messung, 1)} kWh Wärme aus der Luft. Der Nachtspeichertarif lag laut Bundesnetzagentur bei ${DE.num(Pr.nachtspeicher_ct, 2)} ct je kWh. Im unsanierten Beispielhaus sind das ${DE.eur(speicherB.kosten)} im Jahr, fast doppelt so viel wie mit der Gasheizung.` },
    ],
    body: (h) => `
<h2>Sechs Heizungen, eine Wärmemenge</h2>
<p>Der Vergleich ist nur fair, wenn jede Heizung dieselbe Wärme liefern muss. Der Rechner bestimmt diese Wärme einmal und rechnet dann für jede Heizart zurück, wie viel Brennstoff oder Strom dafür nötig ist: beim Kessel über den Nutzungsgrad, bei der Wärmepumpe über die Jahresarbeitszahl, bei Nachtspeicher und Fernwärme eins zu eins. Die Effizienzklassen stammen aus ${h.src('gmodgAnlage10', 'Anlage 10 des Gebäudemodernisierungsgesetzes')}, das Klima aus den Gradtagzahlen des ${h.src('dwd', 'Deutschen Wetterdienstes')}. Wie stark das Bundesland allein die Kosten verschiebt, zeigt ${h.a('heizkosten-bundesland', 'Heizkosten nach Bundesland')}.</p>

<h2>Zwei Häuser im Vergleich</h2>
<p>Ein jüngeres Haus mit 110 m² in Klasse C in Niedersachsen braucht ${h.num(qA)} kWh Wärme im Jahr, ein unsaniertes mit 160 m² in Klasse F in Sachsen ${h.num(qB)} kWh. Die Reihenfolge der Heizungen bleibt gleich, die Abstände wachsen mit dem Bedarf.</p>
${h.table(['Heizung', '110 m², Klasse C', '160 m², Klasse F'], A.map((x) => [NAME[x.system].de, h.eur(x.kosten), h.eur(von(B, x.system).kosten)]), `Preise: Gas und Strom Destatis 1. Halbjahr 2026, Heizöl Schnitt 12 Monate, Stand ${h.date(Pr.oel_stand_aktuell)}`, ['l', 'r', 'r'])}
<p>Die Gasrechnung stützt sich auf den Durchschnittspreis aus der ${h.src('destatisPreise', 'Erhebung von Destatis')}, das Heizöl auf das ${h.src('wob', 'Weekly Oil Bulletin')}, Wärmepumpen- und Nachtspeicherstrom auf den ${h.src('bnetza', 'Monitoringbericht der Bundesnetzagentur')}. Alle Preise lassen sich im Rechner unter „Preise und Wärmepumpe“ durch Ihre eigenen ersetzen. Dass die Erdwärmepumpe oben steht, ist kein Fehler: Sie ist im Betrieb am günstigsten, weil sie in der Feldmessung mit ${h.num(P.technik.jaz_sole_messung, 1)} die höchste Jahresarbeitszahl erreichte. Die Anschaffung, etwa die Bohrung, ist in diesem Vergleich nicht enthalten.</p>
<!--mini:land-->

<h2>Fernwärme: Ihr Preis entscheidet</h2>
<p>Für Fernwärme fehlt eine amtliche Durchschnittszahl, deshalb rechnet der Rechner sie nur mit Ihrem Preis. Eine Faustregel lässt sich trotzdem ablesen: Im sächsischen Beispielhaus ist Fernwärme günstiger als die Gasheizung, solange der Gesamtpreis unter ${h.num(fernGleichGas, 2)} ct je kWh Wärme liegt. Rechnen Sie dafür alle Posten der Jahresabrechnung zusammen und teilen Sie durch die gelieferten kWh. Mehr zur Abrechnung steht unter ${h.a('fernwaerme-preise', 'Fernwärme Preise')}.</p>

<h2>Der CO₂-Preis als Stellschraube</h2>
<p>Gas und Öl tragen einen CO₂-Preis, der 2026 im Korridor von ${h.eur(P.co2.korridor_2026.min)} bis ${h.eur(P.co2.korridor_2026.max)} je Tonne versteigert wird; laut ${h.src('dehst', 'Deutscher Emissionshandelsstelle')} lag der Schnitt bei ${h.eur(P.co2.auktion_2026_durchschnitt)}. Ab ${P.co2.ets2_start} soll der europäische Emissionshandel für Gebäude gelten, einen amtlichen Preis dafür gibt es nicht. Setzen Sie im Rechner ein Szenario: Bei ${h.eur(szenario)} je Tonne stiege Gas im sächsischen Haus auf ${h.eur(gasB150)}, Öl zum Zwölfmonatsschnitt auf ${h.eur(oelB150)}. Wie sich der Aufschlag je Liter und kWh zusammensetzt, rechnet ${h.a('co2-steuer', 'CO₂-Steuer')}, die Rangfolge aller Heizungen mit Anschaffung und Förderung ${h.a('heizkosten-vergleich', 'Heizkosten Vergleich')}.</p>`,
  },
  en: {
    slug: 'heating-cost-calculator-germany',
    nav: 'Heating cost calculator',
    card: 'Gas, oil, heat pump, storage heaters and district heating side by side: yearly cost for your house and federal state.',
    title: 'Heating Cost Calculator Germany 2026: All Systems Compared',
    description: `Heating cost calculator Germany 2026: gas, oil, air and ground heat pumps, storage heaters and district heating for your home. Gas at ${EN.num(Pr.gas_ct, 2)} ct, CO₂ scenarios.`,
    h1: 'Heating cost calculator: every heating system for your German home side by side',
    intro: 'One house, six heating systems: the calculator lines up the yearly cost of each for your floor area, energy class and federal state.',
    resume: `The heating cost calculator puts the yearly cost of every common heating system side by side for the same amount of heat: gas, heating oil, air-source and ground-source heat pumps, electric storage heaters and, once you enter your price, district heating. The heat comes from floor area, energy class and the climate of your federal state. Prices are official: gas at ${EN.num(Pr.gas_ct, 2)} ct per kWh and electricity from the Destatis survey for the first half of 2026, heating oil from the EU Weekly Oil Bulletin, heat pump and storage heater power from the Federal Network Agency. An unrenovated 160 m² house in class F in Saxony needs about ${EN.num(qB)} kWh of heat. With gas it pays ${EN.eur(gasB.kosten)} a year, with oil at the 12-month average ${EN.eur(oelB.kosten)}, but ${EN.eur(oelBakt.kosten)} at the October price. An air-source heat pump costs ${EN.eur(wpB.kosten)}, storage heaters ${EN.eur(speicherB.kosten)}. District heating beats gas as long as the all-in price on the bill stays below ${EN.num(fernGleichGas, 2)} ct per kWh. At a CO₂ scenario of ${EN.eur(szenario)} per tonne, gas would cost ${EN.eur(gasB150)}.`,
    faqs: [
      { q: 'Why is heating oil sometimes cheaper and sometimes dearer than gas in the calculator?', a: `Because the oil price jumped in 2026. Over the last twelve months 100 litres averaged €${EN.num(Pr.oel_eur_100l_12monate, 2)}; in mid-October 2026 they cost €${EN.num(Pr.oel_eur_100l_aktuell, 2)}. At the average, oil comes in below gas in the example house; at the current price it is well above. If you inherited a full tank with a house you bought, use the price on the delivery note.` },
      { q: 'How do I enter district heating in the heating cost calculator?', a: `With the all-in price per kWh from your last annual bill: every charge of the year divided by the heat delivered. There is no official average for district heating (Fernwärme) in Germany, neither nationally nor by state or city. Without your figure the calculator shows the gas boiler value as a placeholder and tells you so.` },
      { q: 'Is the CO₂ price already in the gas and oil costs shown?', a: `Yes. The Destatis and Weekly Oil Bulletin prices include the CO₂ price suppliers pass on in 2026. Auctions run by the German Emissions Trading Authority averaged ${EN.eur(P.co2.auktion_2026_durchschnitt)} per tonne in 2026. A higher value in the “CO₂ price per tonne” field only adds the difference, VAT included. Heat pumps and storage heaters carry no such surcharge.` },
      { q: 'Why do electric storage heaters come out so badly?', a: `Because they turn each kWh of electricity into one kWh of heat. A heat pump draws on average ${EN.num(P.technik.jaz_luft_messung, 1)} kWh of heat from the air with the same kWh. The storage heater tariff was ${EN.num(Pr.nachtspeicher_ct, 2)} ct per kWh according to the Federal Network Agency. In the unrenovated example house that is ${EN.eur(speicherB.kosten)} a year, almost twice the gas boiler.` },
    ],
    body: (h) => `
<h2>Six systems, one amount of heat</h2>
<p>A comparison is only fair if every system has to deliver the same heat. The calculator works out that heat once and then calculates back how much fuel or electricity each system needs: for a boiler through its efficiency, for a heat pump through the SPF, for storage heaters and district heating one to one. The energy classes come from ${h.src('gmodgAnlage10', 'annex 10 of the Building Modernisation Act')}, the climate from the degree days of the ${h.src('dwd', 'German weather service')}. How much the federal state alone shifts the bill is shown under ${h.a('heizkosten-bundesland', 'heating costs by state')}.</p>

<h2>Two houses compared</h2>
<p>A newer 110 m² house in class C in Lower Saxony needs ${h.num(qA)} kWh of heat a year, an unrenovated 160 m² house in class F in Saxony ${h.num(qB)} kWh. The order of the systems stays the same; the gaps grow with demand.</p>
${h.table(['System', '110 m², class C', '160 m², class F'], A.map((x) => [NAME[x.system].en, h.eur(x.kosten), h.eur(von(B, x.system).kosten)]), `Prices: gas and electricity Destatis first half of 2026, heating oil 12-month average, as of ${h.date(Pr.oel_stand_aktuell)}`, ['l', 'r', 'r'])}
<p>Gas is based on the average price in the ${h.src('destatisPreise', 'Destatis survey')}, heating oil on the ${h.src('wob', 'Weekly Oil Bulletin')}, heat pump and storage heater power on the ${h.src('bnetza', 'Federal Network Agency monitoring report')}. Every price can be replaced with your own under “Prices and heat pump”. The ground-source heat pump at the top is no mistake: it is cheapest to run because it reached the highest SPF in the field study, ${h.num(P.technik.jaz_sole_messung, 1)}. Purchase costs, such as drilling the borehole, are not part of this comparison.</p>
<!--mini:land-->

<h2>District heating: your price decides</h2>
<p>There is no official average for district heating, so the calculator only uses your price. A rule of thumb still follows: in the Saxony example house, district heating is cheaper than gas as long as the all-in price stays below ${h.num(fernGleichGas, 2)} ct per kWh of heat. Add up every item on the annual bill and divide by the kWh delivered. More on the bill under ${h.a('fernwaerme-preise', 'district heating prices')}.</p>

<h2>The CO₂ price as a lever</h2>
<p>Gas and oil carry a CO₂ price, auctioned in 2026 within a corridor of ${h.eur(P.co2.korridor_2026.min)} to ${h.eur(P.co2.korridor_2026.max)} per tonne; according to the ${h.src('dehst', 'German Emissions Trading Authority')} the average was ${h.eur(P.co2.auktion_2026_durchschnitt)}. EU emissions trading for buildings is due from ${P.co2.ets2_start}, with no official price yet. Set a scenario in the calculator: at ${h.eur(szenario)} per tonne, gas in the Saxony house would rise to ${h.eur(gasB150)}, oil at the 12-month average to ${h.eur(oelB150)}. The surcharge per litre and kWh is broken down under ${h.a('co2-steuer', 'CO₂ tax')}, the ranking with purchase price and grant under ${h.a('heizkosten-vergleich', 'heating costs compared')}.</p>`,
  },
});

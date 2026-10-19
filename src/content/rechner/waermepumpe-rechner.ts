import { defineGuide } from '../../lib/guide-types';
import { nutzwaerme, laufend, co2Mehrkosten, STANDARDPREISE } from '../../lib/engine/heizkosten';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Wärmepumpe Rechner: Betriebskosten der Wärmepumpe gegen die heutige Heizung (Modus „wp“).
 * Beispielhaus = Startwerte des Rechners: 140 m², Klasse E, Nordrhein-Westfalen, Gasheizung.
 */
const T = P.technik;
const Pr = P.preise;
const q = nutzwaerme({ flaeche: 140, klasse: 'E', land: 'Nordrhein-Westfalen' });
const gas = laufend('gas', q)!;
const oel = laufend('oel', q)!;
const oelAkt = laufend('oel', q, { ...STANDARDPREISE, oelEur100: Pr.oel_eur_100l_aktuell })!;
const wp = laufend('wp_luft', q)!;
const sole = laufend('wp_sole', q)!;
const schwach = laufend('wp_luft', q, STANDARDPREISE, { jaz: T.jaz_luft_min })!;
const pflicht = laufend('wp_luft', q, STANDARDPREISE, { jaz: T.jaz_foerder_min })!;
const stark = laufend('wp_luft', q, STANDARDPREISE, { jaz: T.jaz_luft_max })!;
const einZaehler = laufend('wp_luft', q, { ...STANDARDPREISE, wpCt: Pr.wp_strom_gemeinsam_ct })!;
const haushalt = laufend('wp_luft', q, { ...STANDARDPREISE, wpCt: Pr.strom_haushalt_ct })!;
const szenario = 100;
const gasSzenario = gas.kosten + co2Mehrkosten(gas.co2, szenario);
const diff = gas.kosten - wp.kosten;

export default defineGuide({
  id: 'waermepumpe-rechner',
  group: 'kosten',
  order: 101,
  tool: 'heizkosten',
  toolPreset: { mode: 'wp' },
  related: ['waermepumpe-stromverbrauch', 'waermepumpe-kosten', 'waermepumpe-foerderung', 'waermepumpentarif', 'strompreis-waermepumpe', 'waermepumpe-oder-gasheizung'],
  sources: ['iseWpqs', 'bnetza', 'destatisPreise', 'dwd', 'wob'],
  de: {
    slug: 'waermepumpe-rechner',
    nav: 'Wärmepumpe Rechner',
    card: 'Was die Wärmepumpe im Jahr an Strom kostet, gegen Ihre Gas-, Öl- oder Nachtspeicherheizung, nach Bundesland.',
    title: 'Wärmepumpe Rechner 2026: Betriebskosten gegen Ihre Heizung',
    description: `Wärmepumpe Rechner 2026: Stromkosten im Jahr aus Wohnfläche, Klasse und Bundesland, mit gemessener JAZ ${DE.num(T.jaz_luft_messung, 1)} und Tarif ${DE.num(Pr.wp_strom_getrennt_ct, 2)} ct, gegen Ihre heutige Heizung.`,
    h1: 'Wärmepumpe Rechner: Was sie im Jahr kostet, verglichen mit Ihrer Heizung',
    intro: 'Bundesland, Wohnfläche, Effizienzklasse und heutige Heizung eingeben: Der Rechner zeigt, was die Wärmepumpe im Jahr an Strom kostet und wie viel Sie gegenüber heute sparen.',
    resume: `Was eine Wärmepumpe im Jahr kostet, hängt an drei Zahlen: der Wärme, die das Haus braucht, der Jahresarbeitszahl (JAZ) und dem Strompreis. Der Rechner leitet die Wärme aus Wohnfläche, Effizienzklasse und der Gradtagzahl Ihres Bundeslandes ab, oder aus dem Gas- oder Ölverbrauch der letzten Abrechnung. Als JAZ setzt er den Mittelwert ein, den das Fraunhofer ISE in bestehenden Häusern gemessen hat: ${DE.num(T.jaz_luft_messung, 1)} für Luft-Wasser, ${DE.num(T.jaz_sole_messung, 1)} für Erdwärme. Als Strompreis dient der Wärmepumpentarif mit eigenem Zähler laut Bundesnetzagentur, ${DE.num(Pr.wp_strom_getrennt_ct, 2)} ct je kWh. Ein Haus mit 140 m² in Klasse E in Nordrhein-Westfalen braucht so rund ${DE.num(q)} kWh Wärme. Die Luft-Wärmepumpe zieht dafür ${DE.num(wp.menge)} kWh Strom und kostet ${DE.eur(wp.kosten)} im Jahr. Die Gasheizung kommt zum Destatis-Preis von ${DE.num(Pr.gas_ct, 2)} ct auf ${DE.eur(gas.kosten)}. Der Abstand von ${DE.eur(diff)} im Jahr ist das, was die Anschaffung nach dem Zuschuss wieder einspielen muss. Läuft die Anlage so schwach wie die schlechteste gemessene (JAZ ${DE.num(T.jaz_luft_min, 1)}), steigen die Stromkosten auf ${DE.eur(schwach.kosten)}.`,
    faqs: [
      { q: 'Wie verlässlich ist die Jahresarbeitszahl, mit der dieser Rechner startet?', a: `Sie stammt aus einer Messung des Fraunhofer ISE an Wärmepumpen in bewohnten Bestandsgebäuden, Hauptmessjahr 2024. Luft-Wasser-Geräte lagen im Mittel bei ${DE.num(T.jaz_luft_messung, 1)}, mit einer Spanne von ${DE.num(T.jaz_luft_min, 1)} bis ${DE.num(T.jaz_luft_max, 1)}. Die Zahl gilt für das Gerät selbst; rechnet man Speicher und Heizstab dazu, liegt sie etwas niedriger. Kennen Sie die Planungswerte Ihres Fachbetriebs, tragen Sie diese unter „Preise und Wärmepumpe“ ein.` },
      { q: 'Was kostet die Wärmepumpe am normalen Haushaltsstrom statt am Wärmepumpentarif?', a: `Im Beispielhaus ${DE.eur(haushalt.kosten)} statt ${DE.eur(wp.kosten)} im Jahr. Haushaltsstrom kostete im ersten Halbjahr 2026 laut Destatis im Schnitt ${DE.num(Pr.strom_haushalt_ct, 2)} ct je kWh, der Wärmepumpentarif mit eigenem Zähler laut Bundesnetzagentur ${DE.num(Pr.wp_strom_getrennt_ct, 2)} ct. Ein Tarif ohne zweiten Zähler lag bei ${DE.num(Pr.wp_strom_gemeinsam_ct, 2)} ct. Welche Variante sich lohnt, hängt auch an der Gebühr für den Zähler.` },
      { q: 'Spart die Wärmepumpe auch gegenüber einer Ölheizung?', a: `Ja, im Beispielhaus deutlich. Mit dem Heizölpreis der letzten zwölf Monate (${DE.num(Pr.oel_eur_100l_12monate, 2)} € je 100 Liter) kostet Öl ${DE.eur(oel.kosten)} im Jahr, mit dem Preis vom Oktober 2026 (${DE.num(Pr.oel_eur_100l_aktuell, 2)} €) ${DE.eur(oelAkt.kosten)}. Die Luft-Wärmepumpe liegt bei ${DE.eur(wp.kosten)}. Weil der Ölpreis stark schwankt, lässt der Rechner zwischen drei Preisständen wählen.` },
      { q: 'Rechnet der Wärmepumpe Rechner mit einem steigenden CO₂-Preis?', a: `Nur wenn Sie es wollen. Voreingestellt sind ${DE.eur(P.co2.auktion_2026_durchschnitt)} je Tonne, der Preis, der 2026 in Gas und Öl steckt. Setzen Sie ein Szenario ein, etwa ${DE.eur(szenario)}, rechnet er den Aufschlag mit Mehrwertsteuer auf die heutige Heizung: Die Gasheizung im Beispiel stiege auf ${DE.eur(gasSzenario)}. Einen amtlichen Preis für die Zeit ab 2028, wenn der europäische Emissionshandel startet, gibt es nicht.` },
    ],
    body: (h) => `
<h2>So rechnet der Wärmepumpe Rechner</h2>
<p>Der erste Schritt ist die Wärme, die das Haus im Jahr braucht. Ohne Verbrauchsangabe nimmt der Rechner die Mitte der Effizienzklasse aus dem Energieausweis, rechnet sie mit dem Nutzungsgrad eines Kessels von ${h.pct(P.annahmen.nutzungsgrad_kessel)} auf Nutzwärme um und passt den Anteil für die Raumwärme an das Klima des Landes an. Grundlage sind die Gradtagzahlen des ${h.src('dwd', 'Deutschen Wetterdienstes')} aus den Jahren 2021 bis 2025. Das Warmwasser, rund ${h.pct(T.anteil_warmwasser)} der Wärme, bleibt überall gleich. Die Klassenmitte ist eine Annahme; wer seinen Gasverbrauch kennt, trägt ihn ein und ersetzt damit Fläche und Klasse.</p>
<p>Dann teilt der Rechner die Wärme durch die Jahresarbeitszahl und multipliziert den Strom mit dem Tarif. Die Vergleichsheizung rechnet er mit dem Gaspreis aus der ${h.src('destatisPreise', 'Erhebung von Destatis')} für das erste Halbjahr 2026 und mit dem Heizölpreis aus dem ${h.src('wob', 'Weekly Oil Bulletin')} der EU-Kommission.</p>

<h2>Die Jahresarbeitszahl entscheidet</h2>
<p>Die Messung des ${h.src('iseWpqs', 'Fraunhofer ISE')} in Bestandsgebäuden zeigt, wie weit Wärmepumpen im selben Typ auseinanderliegen. Für das Beispielhaus aus Nordrhein-Westfalen mit ${h.num(q)} kWh Wärme im Jahr:</p>
${h.table(['Jahresarbeitszahl', 'Strom im Jahr', 'Kosten im Jahr'], [
  [`${h.num(T.jaz_luft_min, 1)} (schwächste Luft-Wasser-Anlage)`, `${h.num(schwach.menge)} kWh`, h.eur(schwach.kosten)],
  [`${h.num(T.jaz_foerder_min, 1)} (Mindestwert der Förderung)`, `${h.num(pflicht.menge)} kWh`, h.eur(pflicht.kosten)],
  [`${h.num(T.jaz_luft_messung, 1)} (Mittel Luft-Wasser)`, `${h.num(wp.menge)} kWh`, h.eur(wp.kosten)],
  [`${h.num(T.jaz_sole_messung, 1)} (Mittel Erdwärme)`, `${h.num(sole.menge)} kWh`, h.eur(sole.kosten)],
  [`${h.num(T.jaz_luft_max, 1)} (beste Luft-Wasser-Anlage)`, `${h.num(stark.menge)} kWh`, h.eur(stark.kosten)],
], `140 m², Klasse E, Wärmepumpentarif ${h.num(Pr.wp_strom_getrennt_ct, 2)} ct/kWh`, ['l', 'r', 'r'])}
<p>Zwischen der schwächsten und der besten gemessenen Luft-Wasser-Anlage liegen im selben Haus ${h.eur(schwach.kosten - stark.kosten)} im Jahr. Die Förderung verlangt, dass die Anlage auf eine JAZ von mindestens ${h.num(T.jaz_foerder_min, 1)} ausgelegt ist. Wie viel Strom Ihr Haus braucht, zeigt ${h.a('waermepumpe-stromverbrauch', 'Wärmepumpe Stromverbrauch')} im Detail.</p>

<h2>Welcher Strompreis eingesetzt wird</h2>
<p>Der Wärmepumpentarif stammt aus dem ${h.src('bnetza', 'Monitoringbericht der Bundesnetzagentur')} mit Stand ${h.date(Pr.wp_strom_stand)}; eine neuere amtliche Zahl gibt es nicht. Mit eigenem Zähler waren es ${h.num(Pr.wp_strom_getrennt_ct, 2)} ct je kWh, mit einem gemeinsamen Zähler ${h.num(Pr.wp_strom_gemeinsam_ct, 2)} ct. Im Beispielhaus macht das ${h.eur(wp.kosten)} gegen ${h.eur(einZaehler.kosten)} im Jahr. Was ein eigener Zähler bringt, rechnet ${h.a('waermepumpentarif', 'Wärmepumpentarif')} durch, den Vergleich mit Haushaltsstrom ${h.a('strompreis-waermepumpe', 'Strompreis Wärmepumpe')}.</p>
<!--mini:tarif-->

<h2>Was der Rechner nicht weiß</h2>
<p>Er kennt weder Ihr Angebot noch Ihren Zuschuss. Die Ersparnis im Betrieb von ${h.eur(diff)} im Beispiel sagt erst zusammen mit dem Kaufpreis etwas über die Wirtschaftlichkeit. Den Zuschuss rechnet ${h.a('waermepumpe-foerderung', 'Wärmepumpe Förderung')}, den Preis nach Abzug der Förderung ${h.a('waermepumpe-kosten', 'Wärmepumpe Kosten')}. Die Durchschnittspreise von Destatis enthalten den Grundpreis; Wartung und Schornsteinfeger stecken in keinem der Werte.</p>`,
  },
  en: {
    slug: 'heat-pump-cost-calculator',
    nav: 'Heat pump calculator',
    card: 'What a heat pump costs a year in electricity, against your gas, oil or storage heating, by federal state.',
    title: 'Heat Pump Cost Calculator 2026: Running Costs in Germany',
    description: `Heat pump cost calculator 2026: yearly electricity cost from floor area, energy class and state, with measured SPF ${EN.num(T.jaz_luft_messung, 1)} and a ${EN.num(Pr.wp_strom_getrennt_ct, 2)} ct tariff, vs your boiler.`,
    h1: 'Heat pump cost calculator: what it costs to run, compared with your heating',
    intro: 'Enter your federal state, floor area, energy class and current heating: the calculator shows what a heat pump would cost a year in electricity and how much you would save.',
    resume: `What a heat pump costs to run each year comes down to three numbers: the heat your house needs, the seasonal performance factor (SPF, Jahresarbeitszahl) and the electricity price. The calculator derives the heat from floor area, the energy class on the energy certificate and the degree days of your federal state, or from the gas or oil use on your last bill. For the SPF it uses the average the Fraunhofer ISE institute measured in existing German homes: ${EN.num(T.jaz_luft_messung, 1)} for air-to-water and ${EN.num(T.jaz_sole_messung, 1)} for ground source. The price is the heat pump tariff with a separate meter reported by the Federal Network Agency, ${EN.num(Pr.wp_strom_getrennt_ct, 2)} ct per kWh. A 140 m² house in class E in North Rhine-Westphalia needs about ${EN.num(q)} kWh of heat. An air-source heat pump draws ${EN.num(wp.menge)} kWh for it and costs ${EN.eur(wp.kosten)} a year, against ${EN.eur(gas.kosten)} for a gas boiler at the official average of ${EN.num(Pr.gas_ct, 2)} ct. That gap of ${EN.eur(diff)} is what has to repay the purchase after the grant. A system as weak as the worst one measured (SPF ${EN.num(T.jaz_luft_min, 1)}) would cost ${EN.eur(schwach.kosten)}.`,
    faqs: [
      { q: 'How reliable is the SPF this calculator starts with?', a: `It comes from Fraunhofer ISE measurements of heat pumps in occupied existing buildings, main measuring year 2024. Air-to-water units averaged ${EN.num(T.jaz_luft_messung, 1)}, ranging from ${EN.num(T.jaz_luft_min, 1)} to ${EN.num(T.jaz_luft_max, 1)}. The figure covers the unit itself; including the buffer tank and backup heater it is somewhat lower. If your installer gave you design values, enter them under “Prices and heat pump”.` },
      { q: 'What does a heat pump cost on ordinary household electricity?', a: `In the example house ${EN.eur(haushalt.kosten)} a year instead of ${EN.eur(wp.kosten)}. Household electricity averaged ${EN.num(Pr.strom_haushalt_ct, 2)} ct per kWh in the first half of 2026 according to the statistics office Destatis, while the heat pump tariff with its own meter was ${EN.num(Pr.wp_strom_getrennt_ct, 2)} ct according to the Federal Network Agency. Tariff contracts are in German, so ask the supplier for the meter fee before you compare.` },
      { q: 'Does a heat pump also save money against an oil boiler?', a: `Yes, clearly in the example house. At the 12-month average heating oil price (€${EN.num(Pr.oel_eur_100l_12monate, 2)} per 100 litres) oil costs ${EN.eur(oel.kosten)} a year, at the October 2026 price (€${EN.num(Pr.oel_eur_100l_aktuell, 2)}) ${EN.eur(oelAkt.kosten)}. The air-source heat pump costs ${EN.eur(wp.kosten)}. Because oil prices swing a lot, the calculator lets you choose between three price levels. Buying a house with an old oil tank? Enter its yearly litres.` },
      { q: 'Does the heat pump calculator assume a rising CO₂ price?', a: `Only if you ask it to. The default is ${EN.eur(P.co2.auktion_2026_durchschnitt)} per tonne, the price built into gas and oil in 2026. Enter a scenario such as ${EN.eur(szenario)} and it adds the extra cost, VAT included, to your current boiler: the gas boiler in the example would rise to ${EN.eur(gasSzenario)}. There is no official price for 2028 onwards, when the EU emissions trading for buildings starts.` },
    ],
    body: (h) => `
<h2>How the heat pump calculator works</h2>
<p>Step one is the heat your house needs in a year. Without a consumption figure, the calculator takes the midpoint of the energy class on your energy certificate (Energieausweis), converts it to useful heat with a boiler efficiency of ${h.pct(P.annahmen.nutzungsgrad_kessel)} and adjusts the space heating share to the climate of your state, using the degree days of the ${h.src('dwd', 'German weather service')} for 2021 to 2025. Hot water, about ${h.pct(T.anteil_warmwasser)} of the heat, stays the same everywhere. The class midpoint is an assumption; if you know your gas use, enter it and it replaces area and class.</p>
<p>The calculator then divides the heat by the SPF and multiplies the electricity by the tariff. The comparison boiler uses the gas price from the ${h.src('destatisPreise', 'Destatis survey')} for the first half of 2026 and the heating oil price from the European Commission’s ${h.src('wob', 'Weekly Oil Bulletin')}.</p>

<h2>The SPF makes the difference</h2>
<p>The ${h.src('iseWpqs', 'Fraunhofer ISE')} field study in existing buildings shows how far units of the same type drift apart. For the North Rhine-Westphalia example house with ${h.num(q)} kWh of heat a year:</p>
${h.table(['SPF', 'Electricity a year', 'Cost a year'], [
  [`${h.num(T.jaz_luft_min, 1)} (weakest air-to-water unit)`, `${h.num(schwach.menge)} kWh`, h.eur(schwach.kosten)],
  [`${h.num(T.jaz_foerder_min, 1)} (minimum for the grant)`, `${h.num(pflicht.menge)} kWh`, h.eur(pflicht.kosten)],
  [`${h.num(T.jaz_luft_messung, 1)} (air-to-water average)`, `${h.num(wp.menge)} kWh`, h.eur(wp.kosten)],
  [`${h.num(T.jaz_sole_messung, 1)} (ground source average)`, `${h.num(sole.menge)} kWh`, h.eur(sole.kosten)],
  [`${h.num(T.jaz_luft_max, 1)} (best air-to-water unit)`, `${h.num(stark.menge)} kWh`, h.eur(stark.kosten)],
], `140 m², class E, heat pump tariff ${h.num(Pr.wp_strom_getrennt_ct, 2)} ct/kWh`, ['l', 'r', 'r'])}
<p>Between the weakest and the best air-to-water system measured, the same house pays ${h.eur(schwach.kosten - stark.kosten)} a year more or less. The grant requires the system to be designed for an SPF of at least ${h.num(T.jaz_foerder_min, 1)}. The electricity your house needs is broken down under ${h.a('waermepumpe-stromverbrauch', 'heat pump electricity use')}.</p>

<h2>Which electricity price is used</h2>
<p>The heat pump tariff comes from the ${h.src('bnetza', 'Federal Network Agency monitoring report')}, as of ${h.date(Pr.wp_strom_stand)}; no newer official figure exists. With its own meter the price was ${h.num(Pr.wp_strom_getrennt_ct, 2)} ct per kWh, with one shared meter ${h.num(Pr.wp_strom_gemeinsam_ct, 2)} ct. In the example house that is ${h.eur(wp.kosten)} against ${h.eur(einZaehler.kosten)} a year. What a separate meter brings is worked out under ${h.a('waermepumpentarif', 'heat pump tariff')}, the comparison with household power under ${h.a('strompreis-waermepumpe', 'heat pump electricity price')}.</p>
<!--mini:tarif-->

<h2>What the calculator does not know</h2>
<p>It knows neither your quote nor your grant. The running saving of ${h.eur(diff)} in the example only says something about value for money together with the purchase price. The grant is calculated under ${h.a('waermepumpe-foerderung', 'heat pump grant')}, the price after the grant under ${h.a('waermepumpe-kosten', 'heat pump cost')}. The Destatis averages include the standing charge; servicing and the chimney sweep are in none of the figures.</p>`,
  },
});

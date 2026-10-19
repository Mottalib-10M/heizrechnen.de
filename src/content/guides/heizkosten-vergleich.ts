import { defineGuide } from '../../lib/guide-types';
import { nutzwaerme, laufend, vergleich, co2Mehrkosten, STANDARDPREISE, type System, type Laufend } from '../../lib/engine/heizkosten';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Heizkosten Vergleich: Kosten je kWh Nutzwärme als gemeinsamer Maßstab, dazu zwei eigene Beispielhäuser
 * (Reihenhaus 100 m², Klasse D, Nordrhein-Westfalen; Altbau 180 m², Klasse G, Bayern) und die Wirkung einer Sanierung.
 * Preise: Destatis 1. Halbjahr 2026, Weekly Oil Bulletin, Bundesnetzagentur (April 2025). JAZ: Fraunhofer ISE.
 */
const Pr = P.preise;
const T = P.technik;
const oelJetzt = { ...STANDARDPREISE, oelEur100: Pr.oel_eur_100l_aktuell };
/** Cent je kWh Nutzwärme: Jahreskosten für 1.000 kWh Wärme geteilt durch 10. */
const ct = (s: System, pr = STANDARDPREISE) => laufend(s, 1000, pr)!.kosten / 10;
const ctGas = ct('gas'), ctOel = ct('oel'), ctOelJetzt = ct('oel', oelJetzt), ctLuft = ct('wp_luft'), ctSole = ct('wp_sole'), ctSpeicher = ct('nachtspeicher');
const ctLuftHaushalt = ct('wp_luft', { ...STANDARDPREISE, wpCt: Pr.strom_haushalt_ct });
/** Jahresarbeitszahl, bei der die Luft-Wärmepumpe so viel kostet wie Gas (Wärmepumpentarif bzw. Haushaltsstrom). */
const jazGleich = Pr.wp_strom_getrennt_ct / ctGas;
const jazGleichHaushalt = Pr.strom_haushalt_ct / ctGas;

const qR = nutzwaerme({ flaeche: 100, klasse: 'D', land: 'Nordrhein-Westfalen' });
const qA = nutzwaerme({ flaeche: 180, klasse: 'G', land: 'Bayern' });
const qAD = nutzwaerme({ flaeche: 180, klasse: 'D', land: 'Bayern' });
const R = vergleich(qR), A = vergleich(qA);
const von = (l: Laufend[], s: System) => l.find((x) => x.system === s)!;
const gasR = von(R, 'gas'), oelR = von(R, 'oel'), luftR = von(R, 'wp_luft'), soleR = von(R, 'wp_sole');
const gasA = von(A, 'gas'), oelA = von(A, 'oel'), luftA = von(A, 'wp_luft'), speicherA = von(A, 'nachtspeicher');
const oelAJetzt = laufend('oel', qA, oelJetzt)!;
const gasAD = laufend('gas', qAD)!, luftAD = laufend('wp_luft', qAD)!;
const szen = 100;
const gasASzen = gasA.kosten + co2Mehrkosten(gasA.co2, szen);
const oelASzen = oelA.kosten + co2Mehrkosten(oelA.co2, szen);

export default defineGuide({
  id: 'heizkosten-vergleich',
  group: 'kosten',
  order: 120,
  mini: 'vergleich',
  miniHref: 'heizkosten-rechner',
  related: ['heizkosten-rechner', 'heizkosten-bundesland', 'gaspreis', 'strompreis-waermepumpe', 'fernwaerme-preise', 'waermepumpe-oder-gasheizung'],
  sources: ['destatisPreise', 'wob', 'bnetza', 'iseWpqs', 'dwd', 'gmodgAnlage10'],
  de: {
    slug: 'heizkosten-vergleich',
    nav: 'Heizkosten Vergleich',
    card: 'Was eine kWh Wärme 2026 mit Gas, Öl, Wärmepumpe und Nachtspeicher kostet, an zwei Beispielhäusern durchgerechnet.',
    title: 'Heizkosten Vergleich 2026: Was eine kWh Wärme kostet',
    description: `Heizkosten Vergleich 2026: Gas ${DE.num(ctGas, 2)} ct, Luft-Wärmepumpe ${DE.num(ctLuft, 2)} ct je kWh Wärme, Öl je nach Kaufzeitpunkt. Zwei Beispielhäuser durchgerechnet, mit Sanierung.`,
    h1: 'Heizkosten Vergleich: der Preis einer Kilowattstunde Wärme',
    intro: 'Gas, Heizöl und Strom werden in verschiedenen Einheiten verkauft. Vergleichbar werden sie erst, wenn man ausrechnet, was eine Kilowattstunde Wärme im Heizkörper kostet.',
    resume: `Wer Heizkosten vergleichen will, muss den Preis der Wärme vergleichen, nicht den Preis des Brennstoffs. Mit den amtlichen Durchschnittspreisen von 2026 kostet eine Kilowattstunde Wärme aus einer Gasheizung ${DE.num(ctGas, 2)} ct, aus einer Ölheizung ${DE.num(ctOel, 2)} ct beim Zwölfmonatsschnitt und ${DE.num(ctOelJetzt, 2)} ct beim Preis von Mitte Oktober 2026. Eine Luft-Wärmepumpe mit der im Altbau gemessenen Jahresarbeitszahl von ${DE.num(T.jaz_luft_messung, 1)} liefert sie am Wärmepumpentarif für ${DE.num(ctLuft, 2)} ct, eine Erdwärmepumpe für ${DE.num(ctSole, 2)} ct, Nachtspeicher für ${DE.num(ctSpeicher, 2)} ct. Ein unsanierter Altbau mit 180 m² in Klasse G in Bayern braucht ${DE.num(qA)} kWh Wärme im Jahr: Mit Gas sind das ${DE.eur(gasA.kosten)}, mit Öl ${DE.eur(oelA.kosten)} oder zum aktuellen Preis ${DE.eur(oelAJetzt.kosten)}, mit der Luft-Wärmepumpe ${DE.eur(luftA.kosten)}. Die Wärmepumpe bleibt günstiger als Gas, solange ihre Jahresarbeitszahl über ${DE.num(jazGleich, 1)} liegt. Wird dasselbe Haus auf Klasse D saniert, kostet Gas noch ${DE.eur(gasAD.kosten)} im Jahr.`,
    faqs: [
      { q: 'Welche Heizung hat 2026 die niedrigsten laufenden Kosten?', a: `Mit den Durchschnittspreisen 2026 die Erdwärmepumpe, gefolgt von der Luft-Wärmepumpe. Eine kWh Wärme kostet mit ihnen ${DE.num(ctSole, 2)} ct und ${DE.num(ctLuft, 2)} ct, mit Gas ${DE.num(ctGas, 2)} ct. Öl lag im Zwölfmonatsschnitt knapp unter Gas, zum Preis von Mitte Oktober 2026 deutlich darüber. Wartung, Schornsteinfeger und Zählergebühren sind in diesen Werten nicht enthalten, weil es dafür keine amtlichen Durchschnittszahlen gibt.` },
      { q: 'Ab welcher Jahresarbeitszahl schlägt die Wärmepumpe die Gasheizung?', a: `Am Wärmepumpentarif von ${DE.num(Pr.wp_strom_getrennt_ct, 2)} ct ab einer Jahresarbeitszahl von etwa ${DE.num(jazGleich, 1)}. Läuft sie am normalen Haushaltsstrom zu ${DE.num(Pr.strom_haushalt_ct, 2)} ct, braucht sie mindestens ${DE.num(jazGleichHaushalt, 1)}. Gemessen hat das Fraunhofer ISE in Bestandsgebäuden Werte zwischen ${DE.num(T.jaz_luft_min, 1)} und ${DE.num(T.jaz_luft_max, 1)} für Luft-Wärmepumpen. Selbst die schwächste Anlage der Messung lag damit am Wärmepumpentarif über der Grenze, am Haushaltsstrom etwa gleichauf.` },
      { q: 'Warum vergleicht diese Seite Kosten je kWh Wärme statt je kWh Brennstoff?', a: `Weil ein Kessel nicht jede kWh Gas in Wärme verwandelt und eine Wärmepumpe aus einer kWh Strom mehrere kWh Wärme macht. Die Gasrechnung zählt außerdem den Brennwert, der Kessel nutzt im Rechenmodell den Heizwert bei einem Nutzungsgrad von ${DE.pct(P.annahmen.nutzungsgrad_kessel)}. Erst der Preis je kWh im Heizkörper macht Gas, Öl, Strom und Fernwärme vergleichbar, und genau dieser Wert steht in der Tabelle oben.` },
      { q: 'Wie viel spart eine Sanierung von Klasse G auf Klasse D bei den Heizkosten?', a: `Im Beispielhaus mit 180 m² in Bayern sinkt der Wärmebedarf von ${DE.num(qA)} auf ${DE.num(qAD)} kWh im Jahr. Mit Gas fallen die Kosten von ${DE.eur(gasA.kosten)} auf ${DE.eur(gasAD.kosten)}, mit der Luft-Wärmepumpe von ${DE.eur(luftA.kosten)} auf ${DE.eur(luftAD.kosten)}. Die Klassenwerte sind Mittelwerte der Spannen aus Anlage 10 GModG, also eine Annahme. Ihr Energieausweis oder Ihre Abrechnung liefern den genaueren Wert.` },
      { q: 'Wie wirkt ein höherer CO₂-Preis auf den Vergleich?', a: `Er verteuert nur Gas und Öl. In den Preisen von 2026 stecken etwa ${DE.eur(P.co2.auktion_2026_durchschnitt)} je Tonne. Rechnet man für den Altbau ein Szenario mit ${DE.eur(szen)} je Tonne, steigt Gas auf ${DE.eur(gasASzen)} und Öl auf ${DE.eur(oelASzen)} im Jahr. Das ist keine Vorhersage: Für den europäischen Emissionshandel ab ${P.co2.ets2_start} gibt es keinen amtlichen Preis, nur eine Marke, ab der zusätzliche Zertifikate freigegeben werden.` },
    ],
    body: (h) => `
<h2>Der gemeinsame Maßstab: Cent je kWh Wärme</h2>
<p>Gas kommt in Kilowattstunden auf die Rechnung, Heizöl in Litern, Strom für die Wärmepumpe wieder in Kilowattstunden, aber mit einer ganz anderen Bedeutung. Wer die Arbeitspreise nebeneinanderlegt, vergleicht deshalb Äpfel mit Birnen. Diese Seite rechnet jeden Preis in das um, was im Haus tatsächlich ankommt: eine Kilowattstunde Wärme. Beim Kessel steckt darin der Nutzungsgrad, den das ${h.src('iseWpqs', 'Fraunhofer ISE')} für übliche Anlagen mit ${h.pct(P.annahmen.nutzungsgrad_kessel)} ansetzt, bei der Wärmepumpe die Jahresarbeitszahl aus derselben Messreihe.</p>
${h.table(['Heizung', 'Preis der Energie', 'Cent je kWh Wärme'], [
  ['Erdwärmepumpe, Wärmepumpentarif', `${h.num(Pr.wp_strom_getrennt_ct, 2)} ct/kWh Strom, JAZ ${h.num(T.jaz_sole_messung, 1)}`, h.num(ctSole, 2)],
  ['Luft-Wärmepumpe, Wärmepumpentarif', `${h.num(Pr.wp_strom_getrennt_ct, 2)} ct/kWh Strom, JAZ ${h.num(T.jaz_luft_messung, 1)}`, h.num(ctLuft, 2)],
  ['Luft-Wärmepumpe, Haushaltsstrom', `${h.num(Pr.strom_haushalt_ct, 2)} ct/kWh Strom`, h.num(ctLuftHaushalt, 2)],
  ['Heizöl, Schnitt zwölf Monate', `${h.eur(Pr.oel_eur_100l_12monate)} je 100 Liter`, h.num(ctOel, 2)],
  ['Gas, Durchschnitt Haushalte', `${h.num(Pr.gas_ct, 2)} ct/kWh Gas`, h.num(ctGas, 2)],
  ['Nachtspeicher', `${h.num(Pr.nachtspeicher_ct, 2)} ct/kWh Strom`, h.num(ctSpeicher, 2)],
  ['Heizöl, Preis vom ' + h.date(Pr.oel_stand_aktuell), `${h.eur(Pr.oel_eur_100l_aktuell)} je 100 Liter`, h.num(ctOelJetzt, 2)],
], 'Strom und Gas: Destatis, 1. Halbjahr 2026; Heizöl: Weekly Oil Bulletin; Heizstrom: Bundesnetzagentur, April 2025', ['l', 'l', 'r'])}
<p>Die Preise stammen aus der Erhebung des ${h.src('destatisPreise', 'Statistischen Bundesamts')} für das erste Halbjahr 2026, dem ${h.src('wob', 'Weekly Oil Bulletin')} der EU-Kommission und dem ${h.src('bnetza', 'Monitoringbericht der Bundesnetzagentur')}. Grund- und Messpreise sind darin anteilig enthalten. Für Fernwärme fehlt ein amtlicher Durchschnitt, deshalb steht sie nicht in der Tabelle; wie Sie Ihren eigenen Preis einordnen, zeigt ${h.a('fernwaerme-preise', 'Fernwärme Preise')}.</p>

<h2>Warum Öl einmal vorn und einmal hinten liegt</h2>
<p>Der Heizölpreis ist 2026 so stark gesprungen wie lange nicht. Im Schnitt der letzten zwölf Monate liegt Öl je kWh Wärme knapp unter Gas, zum Preis von Mitte Oktober deutlich darüber. Beide Zahlen sind richtig, sie beantworten nur unterschiedliche Fragen: Wer im Frühjahr billig getankt hat, heizt diesen Winter günstiger als mit Gas. Wer jetzt nachkaufen muss, zahlt mehr. Für eine Entscheidung über die nächsten zwanzig Jahre taugt weder der eine noch der andere Wert allein, deshalb zeigt der Vergleich beide.</p>

<h2>Zwei Häuser, zwei Ergebnisse</h2>
<p>Der Preis je kWh Wärme sagt, welche Heizung günstiger ist. Wie viel Geld das im Jahr ausmacht, hängt von der Wärmemenge ab, und die bestimmen vor allem Wohnfläche, Zustand des Hauses und Klima. Die Wärmemenge leitet der Rechner aus der Effizienzklasse nach ${h.src('gmodgAnlage10', 'Anlage 10 GModG')} und der Gradtagzahl des ${h.src('dwd', 'Deutschen Wetterdienstes')} ab. Zwei Fälle zeigen die Spannweite.</p>
${h.table(['Heizung', 'Reihenhaus 100 m², Klasse D, NRW', 'Altbau 180 m², Klasse G, Bayern'], [
  ['Erdwärmepumpe', h.eur(soleR.kosten), h.eur(von(A, 'wp_sole').kosten)],
  ['Luft-Wärmepumpe', h.eur(luftR.kosten), h.eur(luftA.kosten)],
  ['Heizöl (Zwölfmonatsschnitt)', h.eur(oelR.kosten), h.eur(oelA.kosten)],
  ['Gas', h.eur(gasR.kosten), h.eur(gasA.kosten)],
  ['Nachtspeicher', h.eur(von(R, 'nachtspeicher').kosten), h.eur(speicherA.kosten)],
  ['Wärmebedarf im Jahr', `${h.num(qR)} kWh`, `${h.num(qA)} kWh`],
], 'Kosten im Jahr, Preise 2026, ohne Wartung und Zählergebühren', ['l', 'r', 'r'])}
<p>Im Reihenhaus beträgt der Abstand zwischen Gas und Luft-Wärmepumpe ${h.eur(gasR.kosten - luftR.kosten)} im Jahr. Im Altbau sind es ${h.eur(gasA.kosten - luftA.kosten)}, weil dieselbe Preisdifferenz auf eine viel größere Wärmemenge trifft. Genau deshalb rechnet sich ein Heizungswechsel im schlecht gedämmten Haus schneller, auch wenn die Wärmepumpe dort etwas schwächer arbeiten kann. Wie sich die Gradtagzahl zwischen Hessen und Thüringen auswirkt, steht unter ${h.a('heizkosten-bundesland', 'Heizkosten nach Bundesland')}.</p>
<!--mini:wpgas-->

<h2>Die Jahresarbeitszahl entscheidet über den Abstand</h2>
<p>Die Wärmepumpe gewinnt den Vergleich nicht automatisch. Ihre Kosten je kWh Wärme sind der Strompreis geteilt durch die Jahresarbeitszahl. Am Wärmepumpentarif reicht eine Jahresarbeitszahl von ${h.num(jazGleich, 1)}, um mit Gas gleichzuziehen, am Haushaltsstrom braucht es ${h.num(jazGleichHaushalt, 1)}. Gemessen wurden in Bestandsgebäuden Werte zwischen ${h.num(T.jaz_luft_min, 1)} und ${h.num(T.jaz_luft_max, 1)} für Luft-Wärmepumpen und zwischen ${h.num(T.jaz_sole_min, 1)} und ${h.num(T.jaz_sole_max, 1)} für Erdwärmepumpen. Niedrige Vorlauftemperaturen, ausreichend große Heizkörper und ein hydraulischer Abgleich schieben den Wert nach oben. Welcher Strompreis für Ihre Anlage gilt und was ein eigener Zähler ändert, steht unter ${h.a('strompreis-waermepumpe', 'Strompreis Wärmepumpe')}.</p>

<h2>Sanieren oder tauschen: was mehr bringt</h2>
<p>Im Altbau aus dem Beispiel senkt eine Sanierung von Klasse G auf Klasse D den Wärmebedarf von ${h.num(qA)} auf ${h.num(qAD)} kWh. Mit Gas kostet das Haus dann ${h.eur(gasAD.kosten)} statt ${h.eur(gasA.kosten)}, mit der Luft-Wärmepumpe ${h.eur(luftAD.kosten)} statt ${h.eur(luftA.kosten)}. Die beiden Schritte ergänzen sich: Die Sanierung verkleinert die Wärmemenge, die Wärmepumpe senkt den Preis jeder einzelnen kWh. Die Klassenwerte sind Mittelwerte der gesetzlichen Spannen und damit eine Annahme. Wer seinen gemessenen Verbrauch kennt, trägt ihn besser direkt in den ${h.a('heizkosten-rechner', 'Heizkosten Rechner')} ein.</p>

<h2>Was der Vergleich nicht enthält</h2>
<p>Der Vergleich zeigt laufende Energiekosten. Nicht enthalten sind die Anschaffung, Wartung, Schornsteinfeger, Zählermiete oder der Grundpreis eines zweiten Stromzählers, denn dafür gibt es keine amtlichen Durchschnittswerte. Auch der künftige CO₂-Preis ist nur als Szenario abbildbar. Mit ${h.eur(szen)} je Tonne statt der rund ${h.eur(P.co2.auktion_2026_durchschnitt)}, die 2026 in den Preisen stecken, würde Gas im Altbau ${h.eur(gasASzen)} kosten und Öl ${h.eur(oelASzen)}. Das ist eine Rechnung, keine Prognose. Wie sich der Gaspreis zusammensetzt und welcher Anteil auf den CO₂-Preis entfällt, erklärt ${h.a('gaspreis', 'Gaspreis')}. Ob sich der Wechsel samt Anschaffung und Zuschuss lohnt, rechnet ${h.a('waermepumpe-oder-gasheizung', 'Wärmepumpe oder Gasheizung')}.</p>`,
  },
  en: {
    slug: 'heating-costs-compared',
    nav: 'Heating costs compared',
    card: 'What one kWh of heat costs in Germany in 2026 from gas, oil, a heat pump or storage heaters, worked through for two houses.',
    title: 'Heating costs compared 2026: the price of a kWh of heat',
    description: `Heating costs compared for 2026: gas ${EN.num(ctGas, 2)} ct, air heat pump ${EN.num(ctLuft, 2)} ct per kWh of heat, oil depending on when you buy. Two German houses worked through.`,
    h1: 'Heating costs compared: what a kilowatt hour of heat costs',
    intro: 'Gas, heating oil and electricity are sold in different units. They only become comparable once you work out what one kilowatt hour of heat in the radiator costs.',
    resume: `To compare heating costs you have to compare the price of heat, not the price of fuel. At the official average prices for 2026, one kilowatt hour of heat from a gas boiler costs ${EN.num(ctGas, 2)} ct, from an oil boiler ${EN.num(ctOel, 2)} ct at the twelve-month average and ${EN.num(ctOelJetzt, 2)} ct at the mid-October 2026 price. An air-source heat pump with the seasonal performance factor of ${EN.num(T.jaz_luft_messung, 1)} measured in older German houses delivers it for ${EN.num(ctLuft, 2)} ct on a heat pump tariff, a ground-source unit for ${EN.num(ctSole, 2)} ct, storage heaters for ${EN.num(ctSpeicher, 2)} ct. An unrenovated 180 m² house in efficiency class G in Bavaria needs ${EN.num(qA)} kWh of heat a year: ${EN.eur(gasA.kosten)} with gas, ${EN.eur(oelA.kosten)} with oil or ${EN.eur(oelAJetzt.kosten)} at today’s price, ${EN.eur(luftA.kosten)} with an air heat pump. The heat pump stays cheaper than gas as long as its performance factor is above ${EN.num(jazGleich, 1)}. Renovated to class D, the same house costs ${EN.eur(gasAD.kosten)} a year with gas.`,
    faqs: [
      { q: 'Which heating system has the lowest running costs in Germany in 2026?', a: `At 2026 average prices, a ground-source heat pump, followed by an air-source one. A kWh of heat costs ${EN.num(ctSole, 2)} ct and ${EN.num(ctLuft, 2)} ct with them, against ${EN.num(ctGas, 2)} ct with gas. Oil was just below gas at the twelve-month average and well above it at the mid-October 2026 price. Servicing, chimney sweep and meter fees are not included, as no official averages exist for them.` },
      { q: 'At what performance factor does a heat pump beat a gas boiler?', a: `On a heat pump tariff of ${EN.num(Pr.wp_strom_getrennt_ct, 2)} ct, from a seasonal performance factor (Jahresarbeitszahl) of about ${EN.num(jazGleich, 1)}. On ordinary household electricity at ${EN.num(Pr.strom_haushalt_ct, 2)} ct it needs at least ${EN.num(jazGleichHaushalt, 1)}. Fraunhofer ISE measured air-source units in existing German houses at between ${EN.num(T.jaz_luft_min, 1)} and ${EN.num(T.jaz_luft_max, 1)}. Even the weakest system measured was above the line on a heat pump tariff and roughly level on household power.` },
      { q: 'Why compare cost per kWh of heat rather than per kWh of fuel?', a: `Because a boiler does not turn every kWh of gas into heat, while a heat pump turns one kWh of electricity into several kWh of heat. German gas bills also count the gross calorific value, whereas the model applies a boiler efficiency of ${EN.pct(P.annahmen.nutzungsgrad_kessel)} to the net value. Only the price per kWh delivered to the radiator puts gas, oil, electricity and district heating on the same footing.` },
      { q: 'How much does renovating from class G to class D cut heating bills?', a: `In the 180 m² Bavarian example, heat demand falls from ${EN.num(qA)} to ${EN.num(qAD)} kWh a year. Gas costs drop from ${EN.eur(gasA.kosten)} to ${EN.eur(gasAD.kosten)}, air heat pump costs from ${EN.eur(luftA.kosten)} to ${EN.eur(luftAD.kosten)}. The class values are mid-points of the bands in Annex 10 of the Building Modernisation Act, so they are an assumption. Your energy certificate (Energieausweis) or your bills give a better figure.` },
      { q: 'How would a higher CO₂ price change the comparison?', a: `It only makes gas and oil dearer. The 2026 prices contain about ${EN.eur(P.co2.auktion_2026_durchschnitt)} per tonne. In a scenario at ${EN.eur(szen)} per tonne, the old Bavarian house would pay ${EN.eur(gasASzen)} a year for gas and ${EN.eur(oelASzen)} for oil. That is not a forecast: there is no official price for the EU emissions trading system for buildings from ${P.co2.ets2_start}, only a threshold above which extra allowances are released.` },
    ],
    body: (h) => `
<h2>One yardstick: cents per kWh of heat</h2>
<p>Gas appears on a German bill in kilowatt hours, heating oil in litres, heat pump electricity in kilowatt hours again but with a completely different meaning. Lining up the unit prices therefore compares apples with pears. This page converts every price into what actually arrives in the house: one kilowatt hour of heat. For a boiler that includes the efficiency that ${h.src('iseWpqs', 'Fraunhofer ISE')} assumes for typical systems, ${h.pct(P.annahmen.nutzungsgrad_kessel)}; for a heat pump it includes the seasonal performance factor from the same field study.</p>
${h.table(['System', 'Energy price', 'Cents per kWh of heat'], [
  ['Ground-source heat pump, heat pump tariff', `${h.num(Pr.wp_strom_getrennt_ct, 2)} ct/kWh power, SPF ${h.num(T.jaz_sole_messung, 1)}`, h.num(ctSole, 2)],
  ['Air-source heat pump, heat pump tariff', `${h.num(Pr.wp_strom_getrennt_ct, 2)} ct/kWh power, SPF ${h.num(T.jaz_luft_messung, 1)}`, h.num(ctLuft, 2)],
  ['Air-source heat pump, household power', `${h.num(Pr.strom_haushalt_ct, 2)} ct/kWh power`, h.num(ctLuftHaushalt, 2)],
  ['Heating oil, twelve-month average', `${h.eur(Pr.oel_eur_100l_12monate)} per 100 litres`, h.num(ctOel, 2)],
  ['Gas, household average', `${h.num(Pr.gas_ct, 2)} ct/kWh gas`, h.num(ctGas, 2)],
  ['Storage heaters', `${h.num(Pr.nachtspeicher_ct, 2)} ct/kWh power`, h.num(ctSpeicher, 2)],
  ['Heating oil, price of ' + h.date(Pr.oel_stand_aktuell), `${h.eur(Pr.oel_eur_100l_aktuell)} per 100 litres`, h.num(ctOelJetzt, 2)],
], 'Power and gas: Federal Statistical Office, first half of 2026; oil: Weekly Oil Bulletin; heating power: Federal Network Agency, April 2025', ['l', 'l', 'r'])}
<p>The prices come from the ${h.src('destatisPreise', 'Federal Statistical Office (Destatis)')} survey for the first half of 2026, the European Commission’s ${h.src('wob', 'Weekly Oil Bulletin')} and the ${h.src('bnetza', 'Federal Network Agency monitoring report')}. Standing and meter charges are spread into them. District heating has no official average, so it is not in the table; how to judge your own price is explained under ${h.a('fernwaerme-preise', 'district heating prices')}.</p>

<h2>Why oil is sometimes ahead and sometimes behind</h2>
<p>The heating oil price jumped in 2026 more sharply than it had for years. Over the last twelve months oil was just below gas per kWh of heat; at the mid-October price it is well above. Both figures are correct, they answer different questions. If you filled your tank cheaply in spring, you heat for less than with gas this winter. If you have to buy now, you pay more. Neither value alone is a sound basis for a twenty-year decision, which is why the comparison shows both. Expats buying a house with an oil tank should ask the seller how full it is and at what price it was filled.</p>

<h2>Two houses, two results</h2>
<p>The price per kWh of heat says which system is cheaper. How much money that means each year depends on the amount of heat, which is driven mainly by floor area, the state of the building and the climate. The calculator derives it from the efficiency class under ${h.src('gmodgAnlage10', 'Annex 10 of the Building Modernisation Act')} and the degree days published by the ${h.src('dwd', 'German Weather Service')}. Two cases show the range.</p>
${h.table(['System', 'Terraced house 100 m², class D, NRW', 'Old house 180 m², class G, Bavaria'], [
  ['Ground-source heat pump', h.eur(soleR.kosten), h.eur(von(A, 'wp_sole').kosten)],
  ['Air-source heat pump', h.eur(luftR.kosten), h.eur(luftA.kosten)],
  ['Heating oil (twelve-month average)', h.eur(oelR.kosten), h.eur(oelA.kosten)],
  ['Gas', h.eur(gasR.kosten), h.eur(gasA.kosten)],
  ['Storage heaters', h.eur(von(R, 'nachtspeicher').kosten), h.eur(speicherA.kosten)],
  ['Heat demand a year', `${h.num(qR)} kWh`, `${h.num(qA)} kWh`],
], 'Cost a year at 2026 prices, without servicing or meter fees', ['l', 'r', 'r'])}
<p>In the terraced house the gap between gas and an air heat pump is ${h.eur(gasR.kosten - luftR.kosten)} a year. In the old house it is ${h.eur(gasA.kosten - luftA.kosten)}, because the same price difference applies to a much larger amount of heat. That is why switching pays back faster in a poorly insulated house, even if the heat pump runs a little less efficiently there. How degree days shift the bill between Hesse and Thuringia is shown under ${h.a('heizkosten-bundesland', 'heating costs by state')}.</p>
<!--mini:wpgas-->

<h2>The performance factor sets the gap</h2>
<p>A heat pump does not win by default. Its cost per kWh of heat is the electricity price divided by the seasonal performance factor. On a heat pump tariff a factor of ${h.num(jazGleich, 1)} is enough to match gas; on household electricity it takes ${h.num(jazGleichHaushalt, 1)}. In existing houses, air-source units were measured between ${h.num(T.jaz_luft_min, 1)} and ${h.num(T.jaz_luft_max, 1)}, ground-source units between ${h.num(T.jaz_sole_min, 1)} and ${h.num(T.jaz_sole_max, 1)}. Low flow temperatures, large enough radiators and hydraulic balancing push the figure up. Which electricity price applies to your system, and what a separate meter changes, is covered under ${h.a('strompreis-waermepumpe', 'heat pump electricity price')}.</p>

<h2>Renovate or replace: which does more</h2>
<p>In the old house above, renovating from class G to class D cuts heat demand from ${h.num(qA)} to ${h.num(qAD)} kWh. Gas then costs ${h.eur(gasAD.kosten)} instead of ${h.eur(gasA.kosten)}, the air heat pump ${h.eur(luftAD.kosten)} instead of ${h.eur(luftA.kosten)}. The two steps complement each other: insulation shrinks the amount of heat, the heat pump lowers the price of each kWh. The class values are mid-points of the legal bands and so an assumption. If you know your measured consumption, enter it directly in the ${h.a('heizkosten-rechner', 'heating cost calculator')}; the previous owner’s bills, if you are buying, are the best starting point.</p>

<h2>What the comparison leaves out</h2>
<p>The comparison shows running energy costs only. It does not include purchase, servicing, the chimney sweep (Schornsteinfeger), meter rental or the standing charge of a second electricity meter, because there are no official averages for them. The future CO₂ price can only be shown as a scenario. At ${h.eur(szen)} per tonne instead of the roughly ${h.eur(P.co2.auktion_2026_durchschnitt)} contained in 2026 prices, gas in the old house would cost ${h.eur(gasASzen)} and oil ${h.eur(oelASzen)}. That is arithmetic, not a forecast. How the gas price is made up and how much of it is CO₂ is explained under ${h.a('gaspreis', 'gas price')}. Whether switching pays off once purchase and grant are included is worked out under ${h.a('waermepumpe-oder-gasheizung', 'heat pump or gas boiler')}.</p>`,
  },
});

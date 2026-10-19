import { defineGuide } from '../../lib/guide-types';
import { co2Kosten, preisJahr } from '../../lib/engine/co2';
import { P, DE, EN } from '../../lib/fmt';

/**
 * CO2 Preis 2027: geltendes Recht (§ 10 Abs. 3 Nr. 5 BEHG, Bindung an das EU-ETS 1) gegen den vom Bundestag am
 * 15.10.2026 beschlossenen, noch nicht verkündeten Korridor; ab 2028 ETS2 nur als Szenario, nie als Prognose.
 * Szenariopreise 100, 150 und 200 € sind Annahmen der Seite, keine amtlichen Werte.
 */
const C = P.co2;
const k27 = C.korridor_2027_beschlossen;
const k26 = C.korridor_2026;
const jetzt = C.auktion_2026_durchschnitt;
const p27 = preisJahr(2027);
const gas = (m: number, p: number) => co2Kosten('gas', m, p);
const oel = (m: number, p: number) => co2Kosten('oel', m, p);
const gasMin = gas(20000, k27.min), gasMax = gas(20000, k27.max);
const oelMin = oel(2000, k27.min), oelMax = oel(2000, k27.max);
const szen = [100, 150, 200];
const haushalte: Array<{ de: string; en: string; s: 'gas' | 'oel'; m: number }> = [
  { de: 'Wohnung, Gas 8.000 kWh', en: 'Flat, gas 8,000 kWh', s: 'gas', m: 8000 },
  { de: 'Haus, Gas 20.000 kWh', en: 'House, gas 20,000 kWh', s: 'gas', m: 20000 },
  { de: 'Altbau, Gas 30.000 kWh', en: 'Old house, gas 30,000 kWh', s: 'gas', m: 30000 },
  { de: 'Haus, Heizöl 2.000 l', en: 'House, oil 2,000 l', s: 'oel', m: 2000 },
  { de: 'Altbau, Heizöl 3.000 l', en: 'Old house, oil 3,000 l', s: 'oel', m: 3000 },
];
const k = (s: 'gas' | 'oel', m: number, p: number) => co2Kosten(s, m, p);
const kgb = P.foerderung.kgb_stufen;

export default defineGuide({
  id: 'co2-preis-2027',
  group: 'co2',
  order: 126,
  mini: 'co2jahr',
  miniHref: 'co2-steuer',
  related: ['co2-steuer', 'co2-preis-heizoel', 'co2-kostenaufteilung', 'klimageschwindigkeitsbonus', 'waermepumpe-oder-gasheizung', 'heizungsgesetz'],
  sources: ['behg10', 'btBehg', 'btDrs7869', 'dehst', 'ets2', 'co2kostaufg'],
  de: {
    slug: 'co2-preis-prognose',
    nav: 'CO₂-Preis 2027',
    card: 'Was für den CO₂-Preis 2027 im Gesetz steht, was der Bundestag beschlossen hat und was ab 2028 mit dem ETS2 offen ist.',
    title: 'CO2 Preis 2027: Stand Oktober 2026, Korridor und ETS2',
    description: `CO2 Preis 2027: Der Bundestag hat ${DE.eur(k27.min)} bis ${DE.eur(k27.max)} je Tonne beschlossen, verkündet ist es noch nicht. Was 2026 gilt, was 2027 kostet und Szenarien zum ETS2.`,
    h1: 'CO2 Preis 2027: beschlossen, noch nicht in Kraft',
    intro: 'Für 2027 gibt es zwei Regeln: die im Gesetz von heute und die, die der Bundestag am 15. Oktober 2026 beschlossen hat. Ab 2028 gibt es noch keinen Preis, nur Annahmen.',
    resume: `Für den CO₂-Preis 2027 auf Heizöl und Erdgas gilt Stand 19. Oktober 2026 noch das alte Gesetz: Nach § 10 Abs. 3 Nr. 5 BEHG richtet sich der Preis 2027 nach dem Durchschnitt der Versteigerungen im europäischen Emissionshandel ETS 1 aus dem vorletzten Quartal, weil der Start des europäischen Handels für Gebäude und Verkehr auf 2028 verschoben wurde. Der Bundestag hat am ${DE.num(15)}. Oktober 2026 mit ${k27.ja} zu ${k27.nein} Stimmen beschlossen, stattdessen den Korridor von 2026 fortzuschreiben: ${DE.eur(k27.min)} bis ${DE.eur(k27.max)} je Tonne. Bundesrat und Verkündung im Bundesgesetzblatt stehen aus, das Gesetz gilt erst am Tag nach der Verkündung. Kommt es so, zahlt ein Haus mit ${DE.num(20000)} kWh Gas 2027 zwischen ${DE.eur(gasMin)} und ${DE.eur(gasMax)} CO₂-Kosten mit Mehrwertsteuer, bei ${DE.num(2000)} Litern Heizöl zwischen ${DE.eur(oelMin)} und ${DE.eur(oelMax)}. Ab 2028 soll das ETS2 übernehmen. Einen amtlichen Preis dafür gibt es nicht, jede Zahl ist ein Szenario.`,
    faqs: [
      { q: 'Steigt der CO₂-Preis 2027 gegenüber 2026?', a: `Nach dem Beschluss des Bundestags nicht: Der Korridor bleibt bei ${DE.eur(k27.min)} bis ${DE.eur(k27.max)} je Tonne, wie 2026. Bisher lagen alle Versteigerungen 2026 im Schnitt bei ${DE.eur(jetzt)}, also am Höchstpreis. Wer für 2027 mit ${DE.eur(k27.max)} plant, liegt deshalb auf der vorsichtigen Seite. Verbindlich wird das erst, wenn das Gesetz im Bundesgesetzblatt verkündet ist.` },
      { q: 'Was gilt, wenn das BEHG-Gesetz erst nach Neujahr verkündet wird?', a: 'Dann bleibt es zunächst beim geltenden § 10 Abs. 3 Nr. 5 BEHG: Zertifikate würden zu einem Festpreis verkauft, der sich je Quartal aus dem Durchschnitt der Versteigerungen im EU-ETS 1 des vorletzten Quartals ergibt. Welcher Betrag das wäre, steht in keiner amtlichen Quelle, die wir gelesen haben. Das neue Gesetz tritt nach seinem Wortlaut am Tag nach der Verkündung in Kraft.' },
      { q: 'Gibt es im ETS2 einen Höchstpreis für CO₂?', a: `Nein, eine feste Obergrenze gibt es nicht. Die EU-Kommission beschreibt eine Schwelle von ${DE.eur(C.ets2_schwelle_2020_preise)} je Tonne in Preisen von 2020: Wird sie überschritten, können zusätzliche Zertifikate aus der Marktstabilitätsreserve freigegeben werden. Das dämpft den Preis, deckelt ihn aber nicht. Wie hoch der Preis ab ${C.ets2_start} tatsächlich liegt, entscheidet der Markt.` },
      { q: 'Welcher CO₂-Preis steht 2027 auf meiner Gasrechnung?', a: 'Der Wert, den das Umweltbundesamt nach § 4 CO2KostAufG bekannt gibt: der Durchschnitt der Versteigerungen vom 1. Juli bis 30. November 2026, veröffentlicht spätestens zehn Werktage vor Jahresbeginn. Dieser Wert dient der Rechnung und der Aufteilung zwischen Mieter und Vermieter. Was der Lieferant selbst für die Zertifikate zahlt, kann davon abweichen.' },
      { q: 'Lohnt sich der Heizungstausch wegen des CO₂-Preises schon 2027?', a: `Der CO₂-Preis allein macht 2027 keinen großen Sprung, wenn der Korridor kommt. Entscheidender ist der Zuschuss: Der Klimageschwindigkeitsbonus für Selbstnutzer sinkt am 1. Februar 2027 von ${DE.pct(kgb[0].satz)} auf ${DE.pct(kgb[1].satz)} und danach alle sechs Monate weiter. Wer ohnehin tauschen will, verliert also eher durch Warten auf den Antrag als durch den CO₂-Preis.` },
    ],
    body: (h) => `
<h2>Was heute im Gesetz für 2027 steht</h2>
<p>Das Brennstoffemissionshandelsgesetz hatte für 2027 eigentlich den Übergang in den europäischen Emissionshandel für Gebäude und Verkehr vorgesehen, das ETS2. Für den Fall, dass die EU diesen Start um ein Jahr verschiebt, enthält ${h.src('behg10', '§ 10 Abs. 3 Nr. 5 BEHG')} eine Ersatzregel: Die Zertifikate werden 2027 zu einem Festpreis verkauft, der in jedem Quartal dem mengengewichteten Durchschnittspreis der Versteigerungen im EU-ETS 1 aus dem vorletzten vorangegangenen Quartal entspricht. Das ETS 1 ist der ältere Handel für Kraftwerke und Industrie. Dieser Fall ist eingetreten: Die Verordnung ${C.ets2_verordnung} hat den Start des ETS2 auf ${C.ets2_start} verschoben, wie die Begründung des Regierungsentwurfs festhält (${h.src('btDrs7869', 'BT-Drs. 21/7869')}).</p>
<p>Solange nichts anderes verkündet ist, wäre der Preis 2027 also an einen Markt gebunden, auf dem Haushalte gar nicht handeln, und er könnte von Quartal zu Quartal wechseln. Genau das wollte die Koalition vermeiden. Der Koalitionsausschuss hat am 12. Mai 2026 vereinbart, den Preis 2027 auf dem Niveau des Vorjahres zu halten, um in einer angespannten Lage auf den Energiemärkten Planungssicherheit zu schaffen.</p>

<h2>Was der Bundestag am 15. Oktober 2026 beschlossen hat</h2>
<p>Der Entwurf der Bundesregierung vom 7. September 2026 schreibt den Korridor fort: „Für die Jahre 2026 und 2027 wird ein Preiskorridor mit einem Mindestpreis von ${h.num(k27.min)} Euro […] und einem Höchstpreis von ${h.num(k27.max)} Euro“ festgelegt. Der Bundestag hat das Gesetz am ${h.date(k27.bundestag)} in namentlicher Abstimmung angenommen, mit ${k27.ja} Ja-Stimmen, ${k27.nein} Nein-Stimmen und ${k27.enthaltung} Enthaltungen (${h.src('btBehg', 'Bundestag')}). Danach fehlen noch der zweite Durchgang im Bundesrat, die Ausfertigung und die Verkündung im Bundesgesetzblatt. In Kraft tritt das Gesetz am Tag nach der Verkündung. Bis dahin ist der Korridor für 2027 kein geltendes Recht, auch wenn viele Seiten ihn schon so darstellen.</p>
${h.table(['Jahr', 'Regel', 'Preis je Tonne', 'Stand'], [
  ...C.preise_fest.map((f) => [String(f.jahr), 'Festpreis', h.eur(f.preis), 'abgeschlossen']),
  ['2026', 'Versteigerung im Korridor', `${h.eur(k26.min)} bis ${h.eur(k26.max)}`, `in Kraft, Schnitt bisher ${h.eur(jetzt)}`],
  ['2027', 'Korridor (Beschluss)', `${h.eur(p27.min)} bis ${h.eur(p27.max)}`, 'beschlossen, nicht verkündet'],
  ['2027', 'geltendes Recht', 'Schnitt EU-ETS 1, je Quartal', 'gilt, bis der Beschluss verkündet ist'],
  [String(C.ets2_start), 'ETS2 der EU', 'Marktpreis', 'kein amtlicher Wert'],
], 'BEHG § 10, BT-Drs. 21/7869, Stand 19.10.2026', ['l', 'l', 'r', 'l'])}

<h2>Was 2027 auf der Rechnung steht</h2>
<p>Für die Rechnung gibt es eine eigene Regel. Nach § 4 ${h.src('co2kostaufg', 'CO2KostAufG')} ist ab 2027 der Durchschnittspreis der Versteigerungen vom 1. Juli bis 30. November des Vorjahres maßgeblich, also aus dem Herbst 2026. Das Umweltbundesamt veröffentlicht den Wert spätestens zehn Werktage vor Jahresbeginn. Mit ihm weist der Lieferant den CO₂-Anteil aus, und mit ihm teilen Vermieter und Mieter die Kosten auf. Laut ${h.src('dehst', 'Veräußerungsbericht der DEHSt')} vom August lag der Durchschnitt 2026 bei ${h.eur(jetzt)}, dem Höchstpreis. Einen Bericht für September und später haben wir nicht gefunden.</p>
${h.table(['Haushalt', `bei ${h.eur(k27.min)}`, `bei ${h.eur(k27.max)}`], haushalte.map((x) => [x[h.lang], h.eur(k(x.s, x.m, k27.min)), h.eur(k(x.s, x.m, k27.max))]), 'CO₂-Kosten 2027 im beschlossenen Korridor, mit Mehrwertsteuer', ['l', 'r', 'r'])}
<p>Die Spanne zwischen Mindest- und Höchstpreis ist für einen Haushalt klein. Beim Haus mit Gas sind es ${h.eur(gasMax - gasMin)} im Jahr, beim Haus mit Öl ${h.eur(oelMax - oelMin)}. Ihren eigenen Verbrauch rechnet der ${h.a('co2-steuer', 'CO₂-Rechner')} für alle Jahre seit 2021.</p>

<h2>Ab 2028: das ETS2 und warum niemand den Preis kennt</h2>
<p>Mit dem ETS2 wechselt die Preisbildung nach Brüssel. Die ${h.src('ets2', 'EU-Kommission')} schreibt, das System werde ${C.ets2_start} voll in Betrieb gehen, erste Versteigerungen sollen schon 2027 stattfinden. Einen Korridor wie im deutschen System gibt es dort nicht. Als Dämpfer nennt die Kommission eine Schwelle von ${h.eur(C.ets2_schwelle_2020_preise)} je Tonne in Preisen von 2020: Liegt der Preis darüber, können zusätzliche Zertifikate aus einer Reserve freigegeben werden. Wegen der Inflation seit 2020 liegt diese Schwelle in heutigem Geld höher, und sie ist keine Obergrenze.</p>
<p>Jede Zahl für 2028 ist deshalb eine Annahme. Wir rechnen drei Szenarien, damit Sie die Größenordnung sehen. Sie sind weder eine Prognose noch eine Erwartung der Seite.</p>
${h.table(['Szenario je Tonne', `Gas ${h.num(20000)} kWh`, `Heizöl ${h.num(2000)} l`], szen.map((p) => [h.eur(p), h.eur(gas(20000, p)), h.eur(oel(2000, p))]), 'Annahmen für 2028 und später, mit Mehrwertsteuer', ['l', 'r', 'r'])}
<p>Wer die Größenordnung gegen einen Wechsel rechnen will, kann im folgenden Feld den eigenen Gasverbrauch mit einer Wärmepumpe vergleichen, wahlweise mit einem höheren CO₂-Preis.</p>
<!--mini:wpgas-->

<h2>Was Eigentümer und Mieter daraus machen</h2>
<p>Wer eine neue Gas- oder Ölheizung einbaut, muss nach dem Gebäudemodernisierungsgesetz ab ${P.gesetz.biotreppe[0].ab.slice(0, 4)} einen steigenden Anteil Biobrennstoff nutzen, siehe ${h.a('heizungsgesetz', 'Heizungsgesetz')}. Vermieter tragen für eine solche neu eingebaute Heizung ab ${h.date(P.aufteilung.neue_fossile_heizung_ab)} die Hälfte der CO₂-Kosten, bei bestehenden Heizungen gilt die Stufentabelle (${h.a('co2-kostenaufteilung', 'CO₂-Kostenaufteilung')}). Für Selbstnutzer zählt vor allem der Kalender des Zuschusses: Der ${h.a('klimageschwindigkeitsbonus', 'Klimageschwindigkeitsbonus')} beträgt bei Antrag bis 31. Januar 2027 ${h.pct(kgb[0].satz)}. Ob sich der Umstieg rechnet, zeigt ${h.a('waermepumpe-oder-gasheizung', 'Wärmepumpe oder Gasheizung')}. Wie viel CO₂-Preis heute in einem Liter Heizöl steckt, steht unter ${h.a('co2-preis-heizoel', 'CO₂-Preis Heizöl')}.</p>`,
  },
  en: {
    slug: 'co2-price-forecast-germany',
    nav: 'CO₂ price 2027',
    card: 'What German law says about the 2027 CO₂ price, what the Bundestag has passed and what is still open for the ETS2 from 2028.',
    title: 'CO2 Price 2027 Germany: October 2026 Status and the ETS2',
    description: `CO2 price 2027 in Germany: the Bundestag passed ${EN.eur(k27.min)} to ${EN.eur(k27.max)} a tonne, not yet in force. What applies in 2026, what 2027 costs a home, and ETS2 scenarios.`,
    h1: 'CO2 price 2027 in Germany: passed, not yet in force',
    intro: 'Two rules exist for 2027: the one in today’s law and the one the Bundestag passed on 15 October 2026. For 2028 onwards there is no price yet, only assumptions.',
    resume: `For the 2027 CO₂ price on heating oil and natural gas in Germany, the old law still applies as of 19 October 2026. Under section 10(3) no. 5 of the Fuel Emissions Trading Act (BEHG), the 2027 price follows the average of EU ETS 1 auctions from the quarter before last, because the start of EU emissions trading for buildings and transport was postponed to 2028. On 15 October 2026 the Bundestag voted ${k27.ja} to ${k27.nein} to carry the 2026 corridor forward instead: ${EN.eur(k27.min)} to ${EN.eur(k27.max)} a tonne. The Bundesrat and publication in the Federal Law Gazette are still pending, and the law takes effect only the day after publication. If it goes through, a house using ${EN.num(20000)} kWh of gas pays between ${EN.eur(gasMin)} and ${EN.eur(gasMax)} of CO₂ cost in 2027 including VAT, and one using ${EN.num(2000)} litres of oil between ${EN.eur(oelMin)} and ${EN.eur(oelMax)}. From 2028 the ETS2 is due to take over. No official price exists for it: any figure is a scenario.`,
    faqs: [
      { q: 'Will the German CO₂ price go up in 2027?', a: `Not under the bill the Bundestag passed: the corridor stays at ${EN.eur(k27.min)} to ${EN.eur(k27.max)} a tonne, as in 2026. So far the 2026 auctions have averaged ${EN.eur(jetzt)}, the ceiling. Planning with ${EN.eur(k27.max)} for 2027 is therefore the cautious choice. It becomes binding only once the law is published in the Federal Law Gazette (Bundesgesetzblatt).` },
      { q: 'What happens if the BEHG amendment is published after New Year?', a: 'Then the current section 10(3) no. 5 applies at first: certificates would be sold at a fixed price set each quarter from the average of EU ETS 1 auctions two quarters earlier. No official source we have read states what that amount would be. Under its own wording, the new law takes effect on the day after publication.' },
      { q: 'Is there a price cap in the EU ETS2?', a: `No fixed cap. The European Commission describes a threshold of ${EN.eur(C.ets2_schwelle_2020_preise)} a tonne in 2020 prices: above it, extra allowances can be released from the market stability reserve. That dampens the price but does not limit it. What the price will be from ${C.ets2_start} is up to the market, and nobody can state it as a fact today.` },
      { q: 'I own a German house but live abroad: does the 2027 price affect me?', a: 'Only if the house is heated with gas, oil or LPG. Whoever buys the fuel pays the CO₂ surcharge in the price, so if it stands empty with the heating on low, you still pay for that. If tenants live there, the CO₂ Cost Allocation Act makes you carry part of their CO₂ cost, more the worse the building performs. Bills and statements arrive in German only.' },
      { q: 'Should I replace my boiler in 2027 because of the CO₂ price?', a: `The carbon price alone does not jump in 2027 if the corridor goes through. The grant matters more: for owner-occupiers the climate speed bonus (Klimageschwindigkeitsbonus) falls from ${EN.pct(kgb[0].satz)} to ${EN.pct(kgb[1].satz)} on 1 February 2027 and keeps falling every six months. If you plan to switch anyway, delaying the application costs more than the CO₂ price.` },
    ],
    body: (h) => `
<h2>What the law says about 2027 today</h2>
<p>The Fuel Emissions Trading Act originally planned the move into EU emissions trading for buildings and transport, the ETS2, for 2027. In case the EU pushed that start back by a year, ${h.src('behg10', 'section 10(3) no. 5 BEHG')} holds a fallback: in 2027 certificates are sold at a fixed price equal, each quarter, to the volume-weighted average of EU ETS 1 auctions in the quarter before last. The ETS 1 is the older market covering power stations and industry. That case has happened: regulation ${C.ets2_verordnung} postponed the ETS2 to ${C.ets2_start}, as the explanatory memorandum of the government bill records (${h.src('btDrs7869', 'Bundestag paper 21/7869')}).</p>
<p>Unless something else is published, the 2027 price would therefore be tied to a market households do not trade on, and it could change every quarter. The coalition wanted to avoid exactly that. Its coalition committee agreed on 12 May 2026 to hold the 2027 price at the previous year’s level, to give planning certainty while energy markets remain tense.</p>

<h2>What the Bundestag passed on 15 October 2026</h2>
<p>The government bill of 7 September 2026 extends the corridor, setting a minimum of €${h.num(k27.min)} and a maximum of €${h.num(k27.max)} per certificate for both 2026 and 2027. The Bundestag adopted it on ${h.date(k27.bundestag)} in a roll-call vote: ${k27.ja} in favour, ${k27.nein} against and ${k27.enthaltung} abstentions (${h.src('btBehg', 'Bundestag')}). Still missing are the second reading in the Bundesrat, signature and publication in the Federal Law Gazette. The law takes effect on the day after publication. Until then the 2027 corridor is not law in force, even if many pages already present it that way.</p>
${h.table(['Year', 'Rule', 'Price per tonne', 'Status'], [
  ...C.preise_fest.map((f) => [String(f.jahr), 'fixed price', h.eur(f.preis), 'closed']),
  ['2026', 'auction within corridor', `${h.eur(k26.min)} to ${h.eur(k26.max)}`, `in force, average so far ${h.eur(jetzt)}`],
  ['2027', 'corridor (bill passed)', `${h.eur(p27.min)} to ${h.eur(p27.max)}`, 'passed, not yet published'],
  ['2027', 'current law', 'EU ETS 1 average, per quarter', 'applies until the bill is published'],
  [String(C.ets2_start), 'EU ETS2', 'market price', 'no official figure'],
], 'BEHG section 10, Bundestag paper 21/7869, as of 19 October 2026', ['l', 'l', 'r', 'l'])}

<h2>What your 2027 bill will show</h2>
<p>Bills follow a separate rule. Under section 4 of the ${h.src('co2kostaufg', 'CO₂ Cost Allocation Act')}, from 2027 the relevant figure is the average auction price from 1 July to 30 November of the previous year, so autumn 2026. The Federal Environment Agency publishes it at least ten working days before the year starts. Suppliers use it to state the CO₂ share on your bill, and landlords and tenants use it to split the cost. According to the ${h.src('dehst', 'August sales report of the German Emissions Trading Authority')}, the 2026 average was ${h.eur(jetzt)}, the ceiling. We found no report for September or later.</p>
${h.table(['Household', `at ${h.eur(k27.min)}`, `at ${h.eur(k27.max)}`], haushalte.map((x) => [x[h.lang], h.eur(k(x.s, x.m, k27.min)), h.eur(k(x.s, x.m, k27.max))]), 'CO₂ cost in 2027 within the passed corridor, including VAT', ['l', 'r', 'r'])}
<p>For a single household the gap between floor and ceiling is small: ${h.eur(gasMax - gasMin)} a year for the gas-heated house, ${h.eur(oelMax - oelMin)} for the oil-heated one. The ${h.a('co2-steuer', 'CO₂ calculator')} works out your own consumption for every year since 2021.</p>

<h2>From 2028: the ETS2 and why nobody knows the price</h2>
<p>With the ETS2, price setting moves to the EU level. The ${h.src('ets2', 'European Commission')} says the system will be fully operational in ${C.ets2_start}, with early auctions starting in 2027. There is no corridor like the German one. As a brake, the Commission names a threshold of ${h.eur(C.ets2_schwelle_2020_preise)} a tonne in 2020 prices: above it, additional allowances can be released from a reserve. Because of inflation since 2020, that threshold is higher in today’s money, and it is not a ceiling.</p>
<p>Every figure for 2028 is therefore an assumption. We show three scenarios so you can see the order of magnitude. They are neither a forecast nor what this site expects.</p>
${h.table(['Scenario per tonne', `Gas ${h.num(20000)} kWh`, `Oil ${h.num(2000)} l`], szen.map((p) => [h.eur(p), h.eur(gas(20000, p)), h.eur(oel(2000, p))]), 'Assumptions for 2028 and later, including VAT', ['l', 'r', 'r'])}
<p>To set that against a switch, the box below compares your gas use with a heat pump, with a higher CO₂ price if you like.</p>
<!--mini:wpgas-->

<h2>What owners and tenants can take from this</h2>
<p>If you install a new gas or oil boiler, the Building Modernisation Act requires a rising share of biofuel from ${P.gesetz.biotreppe[0].ab.slice(0, 4)}; see the ${h.a('heizungsgesetz', 'heating law')}. Landlords pay half the CO₂ cost of such a newly installed system from ${h.date(P.aufteilung.neue_fossile_heizung_ab)}; for existing systems the tier table applies (${h.a('co2-kostenaufteilung', 'CO₂ cost split')}). For owner-occupiers the grant calendar matters most: the ${h.a('klimageschwindigkeitsbonus', 'climate speed bonus')} is ${h.pct(kgb[0].satz)} for applications up to 31 January 2027, and only for the home that is your main residence. Whether the switch pays is shown under ${h.a('waermepumpe-oder-gasheizung', 'heat pump or gas boiler')}. How much carbon price a litre of heating oil carries today is under ${h.a('co2-preis-heizoel', 'CO₂ price for heating oil')}.</p>`,
  },
});

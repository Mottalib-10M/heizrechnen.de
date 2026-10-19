import { defineGuide } from '../../lib/guide-types';
import { nutzwaerme, laufend, co2Mehrkosten } from '../../lib/engine/heizkosten';
import { foerderung, hoechstbetrag, type FoerderEingabe } from '../../lib/engine/foerderung';
import { aufschlagCent } from '../../lib/engine/co2';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Wärmepumpe oder Gasheizung: Betrieb, CO₂, Biotreppe nach § 43 GModG, Mieter und Vermieter (§ 5a CO2KostAufG), Zuschuss.
 * Eigenes Beispiel (wie der Mini-Rechner): 20.000 kWh Gas laut Rechnung; Zuschuss für einen Haushalt mit 75.000 €
 * Einkommen, der eine 25 Jahre alte Gasheizung ersetzt.
 */
const G = P.gesetz;
const A = P.aufteilung;
const C = P.co2;
const T = G.biotreppe;
const jahr = (iso: string) => iso.slice(0, 4);
const gasKwh = 20000;
const q = nutzwaerme({ verbrauch: gasKwh, heute: 'gas', land: 'Hessen' });
const gas = laufend('gas', q)!;
const wp = laufend('wp_luft', q)!;
const sole = laufend('wp_sole', q)!;
const spar = gas.kosten - wp.kosten;
/** Jahresarbeitszahl, bei der die Wärmepumpe im Betrieb so viel kostet wie die Gasheizung. */
const jazGleich = (q * P.preise.wp_strom_getrennt_ct) / 100 / gas.kosten;
const SZ = [100, 150, 200];
const szen = SZ.map((p) => ({ p, mehr: co2Mehrkosten(gas.co2, p) }));
const pflicht = T.map((s) => ({ ...s, kwh: gasKwh * s.anteil }));
const b: FoerderEingabe = { antrag: P.retrieved_at, gebaeude: 'efh', einheiten: 1, kosten: 32000, selbstnutzer: true, alt: 'gas', altJahre: 25, neu: 'wp', wpEU: true, zve: 75000, kind: false };
const zuschuss = foerderung(b);
const H = hoechstbetrag(P.retrieved_at, 1);

export default defineGuide({
  id: 'waermepumpe-oder-gasheizung',
  group: 'kosten',
  order: 119,
  mini: 'wpgas',
  miniHref: 'waermepumpe-rechner',
  related: ['gasheizung-verbot', 'waermepumpe-rechner', 'waermepumpe-foerderung', 'co2-preis-2027', 'co2-kostenaufteilung', 'gaspreis'],
  sources: ['gmodg43', 'gmodgBgbl', 'co2kostaufg', 'behg10', 'btBehg', 'ets2', 'iseWpqs', 'begem2026', 'ebev', 'destatisPreise'],
  de: {
    slug: 'waermepumpe-oder-gasheizung',
    nav: 'Wärmepumpe oder Gasheizung',
    card: 'Was Wärmepumpe und neue Gasheizung im Jahr kosten, was der CO₂-Preis und die Biogaspflicht ab 2029 ändern und wer was zahlt.',
    title: 'Wärmepumpe oder Gasheizung 2026: Kosten, CO₂, Biogaspflicht',
    description: `Wärmepumpe oder Gasheizung 2026: Jahreskosten aus Ihrer Gasrechnung, CO₂-Szenarien, Biogasanteil ab ${jahr(T[0].ab)} (${DE.pct(T[0].anteil)}) und Zuschuss bis ${DE.pct(P.foerderung.deckel_niedrig)} für die Wärmepumpe.`,
    h1: 'Wärmepumpe oder Gasheizung: der Vergleich nach Betrieb, CO₂ und Gesetz',
    intro: 'Beide Heizungen sind seit dem 29. Juli 2026 wieder gleichrangig erlaubt. Der Unterschied liegt bei den laufenden Kosten, beim CO₂-Preis, bei der Biogaspflicht und beim Zuschuss.',
    resume: `Ob Wärmepumpe oder neue Gasheizung, entscheidet seit dem Gebäudemodernisierungsgesetz nicht mehr eine Prozentvorgabe, sondern die Rechnung. Für einen Haushalt, der heute ${DE.num(gasKwh)} kWh Gas im Jahr verbraucht, kostet die Gasheizung zum Destatis-Durchschnittspreis von ${DE.num(P.preise.gas_ct, 2)} ct je kWh ${DE.eur(gas.kosten)} im Jahr. Eine Luft-Wärmepumpe mit der im Bestand gemessenen Jahresarbeitszahl von ${DE.num(P.technik.jaz_luft_messung, 1)} braucht für dieselbe Wärme ${DE.num(wp.menge)} kWh Strom und kostet im Wärmepumpentarif ${DE.eur(wp.kosten)}. Das sind ${DE.eur(spar)} weniger im Jahr. Dazu kommen drei Punkte, die nur die Gasheizung betreffen. Sie stößt rund ${DE.num(gas.co2)} kg CO₂ im Jahr aus, deren Preis ab ${C.ets2_start} im europäischen Emissionshandel ohne festen Korridor gebildet wird. Eine nach dem 29. Juli 2026 eingebaute Gasheizung muss ab ${jahr(T[0].ab)} ${DE.pct(T[0].anteil)} und ab ${jahr(T[3].ab)} ${DE.pct(T[3].anteil)} ihrer Wärme aus Biomethan oder Wasserstoff decken (§ 43 GModG). Und nur die Wärmepumpe wird gefördert: Ersetzt sie eine 25 Jahre alte Gasheizung, erhält ein Haushalt mit ${DE.eur(75000)} Einkommen ${DE.eur(zuschuss.zuschuss)}.`,
    faqs: [
      { q: 'Bei welcher Jahresarbeitszahl wäre die Wärmepumpe im Betrieb so teuer wie Gas?', a: `Mit den Preisen von 2026, ${DE.num(P.preise.gas_ct, 2)} ct je kWh Gas und ${DE.num(P.preise.wp_strom_getrennt_ct, 2)} ct je kWh Wärmepumpenstrom, liegt die Grenze bei einer Jahresarbeitszahl von etwa ${DE.num(jazGleich, 1)}. Darunter wäre Gas günstiger. Die schwächste Luft-Wasser-Anlage in der Messung des Fraunhofer ISE erreichte ${DE.num(P.technik.jaz_luft_min, 1)}, lag also noch darüber. Am normalen Haushaltsstrom verschiebt sich die Grenze nach oben.` },
      { q: 'Was kostet die Biogaspflicht einer neuen Gasheizung im Jahr?', a: `Das hängt vom Aufpreis Ihres Tarifs für Biomethan ab, einen amtlichen Preis dafür gibt es nicht. Rechnen lässt sich die Menge: Bei ${DE.num(gasKwh)} kWh im Jahr sind ab ${jahr(T[0].ab)} ${DE.num(pflicht[0].kwh)} kWh grünes Gas Pflicht, ab ${jahr(T[3].ab)} ${DE.num(pflicht[3].kwh)} kWh. Jeder Cent Aufpreis je kWh kostet also anfangs ${DE.eur(pflicht[0].kwh / 100)} und später ${DE.eur(pflicht[3].kwh / 100)} im Jahr zusätzlich.` },
      { q: 'Gibt es den Klimabonus, wenn neben der Wärmepumpe eine Gastherme für Spitzenlast bleibt?', a: 'Nein. Nach Nummer 8.4.4 der Förderrichtlinie dürfen die Wohnungen nach dem Austausch nicht mehr von fossilen oder mit Gas betriebenen Heizungen im oder am Gebäude versorgt werden. Ausgenommen sind nur Brennstoffzellen und wasserstofffähige Heizungen. Außerdem muss die alte Anlage fachgerecht abgebaut und entsorgt werden. Wer die Gastherme als Spitzenlast behält, bekommt also jedenfalls keinen Klimageschwindigkeitsbonus.' },
      { q: 'Wie viel CO₂ spart eine Wärmepumpe gegenüber der Gasheizung?', a: `Am Haus selbst den ganzen Ausstoß der Gasheizung: bei ${DE.num(gasKwh)} kWh Gas rund ${DE.num(gas.co2)} kg im Jahr, gerechnet mit dem amtlichen Emissionsfaktor der EBeV 2030. Das ist die Menge, auf die der CO₂-Preis erhoben wird. Die Emissionen bei der Erzeugung des Stroms für die Wärmepumpe sind in dieser Zahl nicht enthalten, sie entstehen im Kraftwerk und nicht im Heizungskeller.` },
      { q: 'Was ändert die Wahl der Heizung für Mieter und Vermieter?', a: `Bei einer Gasheizung, die nach § 43 GModG neu eingebaut wurde, tragen Vermieter und Mieter ab ${jahr(A.neue_fossile_heizung_ab)} die CO₂-Kosten und die Gasnetzentgelte je zur Hälfte, ab ${jahr(A.biobrennstoff_mehrkosten_ab)} auch die Mehrkosten für Biomethan bis zu einem Anteil von ${DE.pct(A.biobrennstoff_anteil_max)}. Bei einer Wärmepumpe fallen keine CO₂-Kosten an, die aufzuteilen wären. Die Förderung bekommt der Vermieter nur als Grundförderung von ${DE.pct(P.foerderung.grund)}.` },
    ],
    body: (h) => `
<h2>Gleich erlaubt, ungleich teuer</h2>
<p>Bis zum 28. Juli 2026 musste eine neue Heizung nach dem Gebäudeenergiegesetz ab bestimmten Fristen zu ${h.pct(G.alt_65_prozent)} mit erneuerbarer Energie arbeiten. Das ${h.src('gmodgBgbl', 'Gesetz vom 23. Juli 2026')} hat diese Vorgabe gestrichen. Heute steht die Gasheizung im Katalog des § 42 GModG neben der Wärmepumpe, beide sind zulässig. Die Entscheidung verschiebt sich damit vom Gesetz in die eigene Kalkulation, und dort laufen vier Posten auseinander: der Brennstoff, der CO₂-Preis, die Pflicht zu grünem Gas und der Zuschuss.</p>

<h2>Der Betrieb im Vergleich</h2>
<p>Ausgangspunkt ist der Verbrauch auf der Gasrechnung. Daraus rechnet der Motor die Wärme, die das Haus tatsächlich braucht, und teilt sie bei der Wärmepumpe durch die Jahresarbeitszahl aus der Feldmessung des ${h.src('iseWpqs', 'Fraunhofer ISE')}. Für ${h.num(gasKwh)} kWh Gas im Jahr:</p>
${h.table(['Heizung', 'Energie im Jahr', 'Kosten im Jahr', 'CO₂ im Jahr'], [
  [`Gasheizung, ${h.num(P.preise.gas_ct, 2)} ct/kWh`, `${h.num(gas.menge)} kWh Gas`, h.eur(gas.kosten), `${h.num(gas.co2)} kg`],
  [`Luft-Wärmepumpe, JAZ ${h.num(P.technik.jaz_luft_messung, 1)}`, `${h.num(wp.menge)} kWh Strom`, h.eur(wp.kosten), '0 kg am Haus'],
  [`Erdwärmepumpe, JAZ ${h.num(P.technik.jaz_sole_messung, 1)}`, `${h.num(sole.menge)} kWh Strom`, h.eur(sole.kosten), '0 kg am Haus'],
], `Gas: Destatis, 1. Halbjahr 2026; Strom: Wärmepumpentarif ${h.num(P.preise.wp_strom_getrennt_ct, 2)} ct/kWh`, ['l', 'r', 'r', 'r'])}
<p>Bei gleichbleibenden Preisen spielt die Luft-Wärmepumpe in zehn Jahren ${h.eur(spar * 10)} gegenüber der Gasheizung ein. Ist sie nach Abzug des Zuschusses um weniger als diesen Betrag teurer als eine neue Gasheizung, rechnet sie sich in diesem Zeitraum. Ihre eigenen Zahlen setzt der ${h.a('waermepumpe-rechner', 'Wärmepumpe Rechner')} ein.</p>

<h2>Der CO₂-Preis: Korridor 2026, danach offen</h2>
<p>Auf jede kWh Gas wird ein CO₂-Preis erhoben. Für 2026 gilt nach ${h.src('behg10', '§ 10 BEHG')} ein Korridor von ${h.eur(C.korridor_2026.min)} bis ${h.eur(C.korridor_2026.max)} je Tonne, die Versteigerungen lagen im Schnitt bei ${h.eur(C.auktion_2026_durchschnitt)}. Das entspricht rund ${h.num(aufschlagCent('gas', C.auktion_2026_durchschnitt), 2)} ct je kWh mit Mehrwertsteuer. Für 2027 hat der ${h.src('btBehg', 'Bundestag am 15. Oktober 2026')} denselben Korridor beschlossen; das Gesetz ist aber noch nicht verkündet. Ab ${C.ets2_start} soll der ${h.src('ets2', 'europäische Emissionshandel für Gebäude')} gelten, ohne festen Preis. Wie sich der Preis dann entwickelt, weiß niemand. Die folgenden Werte sind Szenarien, keine Prognose:</p>
${h.table(['CO₂-Preis je Tonne', 'Mehrkosten Gas im Jahr'], szen.map((x) => [h.eur(x.p), h.eur(x.mehr)]), `gegenüber ${h.eur(C.auktion_2026_durchschnitt)}, ${h.num(gasKwh)} kWh Gas, mit Mehrwertsteuer`, ['r', 'r'])}
<p>Die Wärmepumpe trägt diesen Aufschlag nicht, ihr Risiko liegt beim Strompreis. Den Stand der Diskussion um 2027 und 2028 fasst ${h.a('co2-preis-2027', 'CO₂-Preis 2027')} zusammen.</p>

<h2>Die Biotreppe für neue Gasheizungen</h2>
<p>Wer sich für eine neue Gasheizung entscheidet, übernimmt eine Pflicht aus ${h.src('gmodg43', '§ 43 GModG')}: Ein wachsender Teil der Wärme muss aus Biomethan, biogenem Flüssiggas oder Wasserstoff kommen. Für den Haushalt mit ${h.num(gasKwh)} kWh im Jahr bedeutet das:</p>
${h.table(['Ab', 'Pflichtanteil', 'Grünes Gas im Jahr', 'Je Cent Aufpreis'], pflicht.map((s) => [h.date(s.ab), h.pct(s.anteil), `${h.num(s.kwh)} kWh`, h.eur(s.kwh / 100)]), 'Gilt für Gas-, Öl- und Flüssiggasheizungen, die nach dem 29. Juli 2026 in ein bestehendes Gebäude eingebaut werden', ['l', 'r', 'r', 'r'])}
<!--mini:biotreppe-->
<p>Wer die Pflicht nicht über den Gastarif erfüllen will, kann laut Gesetz unter anderem eine Wärmepumpe mit mindestens ${h.pct(G.hybrid_wp_leistung_min)} der Kesselleistung dazustellen. Ältere Gasheizungen, die vor dem 29. Juli 2026 liefen, betrifft die Treppe nicht. Die Einzelheiten zu Ausnahmen und Fristen bei einem Ausfall stehen unter ${h.a('gasheizung-verbot', 'Gasheizung Verbot')}.</p>

<h2>Wo die Rechnung unsicher ist</h2>
<p>Drei Annahmen tragen den Vergleich, und keine ist fest. Erstens die Jahresarbeitszahl: In der Messung lagen Luft-Wasser-Anlagen zwischen ${h.num(P.technik.jaz_luft_min, 1)} und ${h.num(P.technik.jaz_luft_max, 1)}, im Beispiel heißt das ${h.eur(laufend('wp_luft', q, undefined, { jaz: P.technik.jaz_luft_max })!.kosten)} bis ${h.eur(laufend('wp_luft', q, undefined, { jaz: P.technik.jaz_luft_min })!.kosten)} Strom im Jahr. Zweitens der Wärmepumpentarif: Die Zahl der Bundesnetzagentur stammt vom ${h.date(P.preise.wp_strom_stand)}, eine neuere amtliche Erhebung gibt es nicht. Drittens der Gaspreis, ein Durchschnitt aller Verträge mit Grundpreis, der Ihren eigenen Tarif nicht genau trifft. Setzen Sie im Rechner oben Ihren Verbrauch und ein eigenes CO₂-Szenario ein. Ob in Ihrer Straße ein Wärmenetz geplant ist, verpflichtet seit dem 29. Juli 2026 zu nichts mehr, kann aber eine dritte Möglichkeit eröffnen.</p>

<h2>Zuschuss und Vermietung</h2>
<p>Für die Wärmepumpe zahlt die KfW mindestens ${h.pct(P.foerderung.grund)} von bis zu ${h.eur(H)} förderfähigen Kosten, für eine Gasheizung nichts (${h.src('begem2026', 'Richtlinie vom 17. August 2026')}). Im Beispiel, Angebot ${h.eur(32000)}, alte Gasheizung 25 Jahre, Einkommen ${h.eur(75000)}, sind es ${h.eur(zuschuss.zuschuss)}, weil der Klimageschwindigkeitsbonus von ${h.pct(zuschuss.kgbSatz)} hinzukommt. Den genauen Betrag für Ihren Fall rechnet ${h.a('waermepumpe-foerderung', 'Wärmepumpe Förderung')}. Wer vermietet, muss nach dem ${h.src('co2kostaufg', 'Kohlendioxidkostenaufteilungsgesetz')} bei einer neuen Gasheizung ab ${jahr(A.neue_fossile_heizung_ab)} die Hälfte der CO₂-Kosten tragen, bei einer Wärmepumpe entfällt dieser Posten. Den Anteil nach dem Stufenmodell für bestehende Heizungen zeigt der ${h.a('co2-kostenaufteilung', 'Aufteilungsrechner')}.</p>`,
  },
  en: {
    slug: 'heat-pump-or-gas-boiler',
    nav: 'Heat pump or gas boiler',
    card: 'What a heat pump and a new gas boiler cost a year, what the CO₂ price and the biogas duty from 2029 change, and who pays what.',
    title: 'Heat Pump or Gas Boiler 2026: Costs, CO₂ and Biogas Duty',
    description: `Heat pump or gas boiler in Germany 2026: yearly cost from your gas bill, CO₂ scenarios, the ${EN.pct(T[0].anteil)} biogas share from ${jahr(T[0].ab)} for new boilers and grants up to ${EN.pct(P.foerderung.deckel_niedrig)}.`,
    h1: 'Heat pump or gas boiler: comparing running costs, CO₂ and the law',
    intro: 'Since 29 July 2026 both are allowed on equal terms in Germany. The difference lies in running costs, the CO₂ price, the biogas duty and the grant.',
    resume: `Since the Building Modernisation Act (Gebäudemodernisierungsgesetz) took effect, the choice between a heat pump and a new gas boiler is no longer settled by a percentage rule but by the numbers. For a household using ${EN.num(gasKwh)} kWh of gas a year, a gas boiler at the official Destatis average of ${EN.num(P.preise.gas_ct, 2)} ct per kWh costs ${EN.eur(gas.kosten)} a year. An air-source heat pump with the seasonal performance factor measured in existing homes, ${EN.num(P.technik.jaz_luft_messung, 1)}, needs ${EN.num(wp.menge)} kWh of electricity for the same heat and costs ${EN.eur(wp.kosten)} on a heat pump tariff. That is ${EN.eur(spar)} less each year. Three further points concern the gas boiler only. It emits about ${EN.num(gas.co2)} kg of CO₂ a year, priced from ${C.ets2_start} in EU emissions trading without a fixed corridor. A gas boiler installed after 29 July 2026 must cover ${EN.pct(T[0].anteil)} of its heat with biomethane or hydrogen from ${jahr(T[0].ab)} and ${EN.pct(T[3].anteil)} from ${jahr(T[3].ab)} (section 43). And only the heat pump gets a grant: replacing a 25-year-old gas boiler, a household with ${EN.eur(75000)} income receives ${EN.eur(zuschuss.zuschuss)}.`,
    faqs: [
      { q: 'At what SPF would a heat pump cost as much to run as gas?', a: `At 2026 prices, ${EN.num(P.preise.gas_ct, 2)} ct per kWh of gas and ${EN.num(P.preise.wp_strom_getrennt_ct, 2)} ct per kWh of heat pump electricity, the break-even point is a seasonal performance factor of about ${EN.num(jazGleich, 1)}. Below that, gas would be cheaper. The weakest air-to-water system in the Fraunhofer ISE measurements reached ${EN.num(P.technik.jaz_luft_min, 1)}, still above it. On ordinary household electricity the threshold moves up.` },
      { q: 'What does the biogas duty of a new gas boiler cost each year?', a: `That depends on your tariff’s surcharge for biomethane, for which there is no official price. The quantity can be calculated: at ${EN.num(gasKwh)} kWh a year, ${EN.num(pflicht[0].kwh)} kWh must be green gas from ${jahr(T[0].ab)} and ${EN.num(pflicht[3].kwh)} kWh from ${jahr(T[3].ab)}. Each cent of surcharge per kWh therefore costs ${EN.eur(pflicht[0].kwh / 100)} a year at first and ${EN.eur(pflicht[3].kwh / 100)} later.` },
      { q: 'Is the climate bonus paid if a gas boiler stays next to the heat pump for peak loads?', a: 'No. Under item 8.4.4 of the funding guideline, after the replacement the homes may no longer be supplied by fossil or gas-fired heating in or next to the building. The only exceptions are fuel cells and hydrogen-ready systems. The old system must also be properly removed and disposed of. Keeping the gas boiler for peak demand therefore rules out the climate speed bonus in any case.' },
      { q: 'How much CO₂ does a heat pump save compared with a gas boiler?', a: `At the house, the gas boiler’s entire output: about ${EN.num(gas.co2)} kg a year for ${EN.num(gasKwh)} kWh of gas, using the official emission factor of the German emissions reporting regulation (EBeV 2030). That is the quantity the CO₂ price is charged on. Emissions from generating the heat pump’s electricity are not included in this figure; they arise at the power plant, not in your boiler room.` },
      { q: 'What does the choice of heating mean if I let the property?', a: `For a gas boiler newly installed under section 43, landlord and tenant split the CO₂ costs and gas network charges equally from ${jahr(A.neue_fossile_heizung_ab)}, and from ${jahr(A.biobrennstoff_mehrkosten_ab)} the extra cost of biomethane up to a ${EN.pct(A.biobrennstoff_anteil_max)} share as well. A heat pump has no CO₂ costs to split. As a landlord you only get the ${EN.pct(P.foerderung.grund)} basic grant, since the bonuses need the home to be your main residence.` },
    ],
    body: (h) => `
<h2>Equally allowed, unequally expensive</h2>
<p>Until 28 July 2026, the Building Energy Act required new heating to run on ${h.pct(G.alt_65_prozent)} renewable energy once certain deadlines had passed. The ${h.src('gmodgBgbl', 'act of 23 July 2026')} removed that requirement. Today the gas boiler stands next to the heat pump in the list of section 42 of the Building Modernisation Act, and both are permitted. The decision therefore moves from the law to your own sums, where four items pull apart: the fuel, the CO₂ price, the green gas duty and the grant. If you are buying a German house with an old gas boiler, this is the comparison to make before you sign with an installer.</p>

<h2>Running costs compared</h2>
<p>The starting point is the consumption on your gas bill. From it the engine works out the heat the house actually needs and, for the heat pump, divides it by the SPF from the ${h.src('iseWpqs', 'Fraunhofer ISE')} field study. For ${h.num(gasKwh)} kWh of gas a year:</p>
${h.table(['System', 'Energy a year', 'Cost a year', 'CO₂ a year'], [
  [`Gas boiler, ${h.num(P.preise.gas_ct, 2)} ct/kWh`, `${h.num(gas.menge)} kWh gas`, h.eur(gas.kosten), `${h.num(gas.co2)} kg`],
  [`Air-source heat pump, SPF ${h.num(P.technik.jaz_luft_messung, 1)}`, `${h.num(wp.menge)} kWh electricity`, h.eur(wp.kosten), '0 kg at the house'],
  [`Ground-source heat pump, SPF ${h.num(P.technik.jaz_sole_messung, 1)}`, `${h.num(sole.menge)} kWh electricity`, h.eur(sole.kosten), '0 kg at the house'],
], `Gas: Destatis, first half of 2026; electricity: heat pump tariff ${h.num(P.preise.wp_strom_getrennt_ct, 2)} ct/kWh`, ['l', 'r', 'r', 'r'])}
<p>At constant prices, the air-source heat pump earns back ${h.eur(spar * 10)} against the gas boiler over ten years. If, after the grant, it costs less than that amount more than a new gas boiler, it pays for itself within that time. The ${h.a('waermepumpe-rechner', 'heat pump cost calculator')} uses your own figures.</p>

<h2>The CO₂ price: a corridor in 2026, open afterwards</h2>
<p>Every kWh of gas carries a CO₂ price. For 2026, ${h.src('behg10', 'section 10 of the Fuel Emissions Trading Act')} sets a corridor of ${h.eur(C.korridor_2026.min)} to ${h.eur(C.korridor_2026.max)} per tonne, and auctions averaged ${h.eur(C.auktion_2026_durchschnitt)}. That is about ${h.num(aufschlagCent('gas', C.auktion_2026_durchschnitt), 2)} ct per kWh including VAT. For 2027 the ${h.src('btBehg', 'Bundestag voted on 15 October 2026')} for the same corridor; the law has not yet been promulgated. From ${C.ets2_start}, the ${h.src('ets2', 'EU emissions trading for buildings')} is due to apply, without a fixed price. Nobody knows how the price will move then. The values below are scenarios, not a forecast:</p>
${h.table(['CO₂ price per tonne', 'Extra cost of gas a year'], szen.map((x) => [h.eur(x.p), h.eur(x.mehr)]), `compared with ${h.eur(C.auktion_2026_durchschnitt)}, ${h.num(gasKwh)} kWh of gas, VAT included`, ['r', 'r'])}
<p>The heat pump carries no such surcharge; its risk lies in the electricity price. The state of play for 2027 and 2028 is summed up under ${h.a('co2-preis-2027', 'CO₂ price 2027')}.</p>

<h2>The biogas steps for new gas boilers</h2>
<p>Choosing a new gas boiler brings a duty under ${h.src('gmodg43', 'section 43 of the Building Modernisation Act')}: a growing share of the heat must come from biomethane, biogenic LPG or hydrogen. For the household using ${h.num(gasKwh)} kWh a year, that means:</p>
${h.table(['From', 'Required share', 'Green gas a year', 'Per cent of surcharge'], pflicht.map((s) => [h.date(s.ab), h.pct(s.anteil), `${h.num(s.kwh)} kWh`, h.eur(s.kwh / 100)]), 'Applies to gas, oil and LPG systems installed in an existing building after 29 July 2026', ['l', 'r', 'r', 'r'])}
<!--mini:biotreppe-->
<p>If you do not want to meet the duty through your gas tariff, the law allows, among other routes, adding a heat pump with at least ${h.pct(G.hybrid_wp_leistung_min)} of the boiler output. Older gas boilers that were running before 29 July 2026 are not affected. Exceptions and the deadlines after a breakdown are covered under ${h.a('gasheizung-verbot', 'gas boiler ban')}.</p>

<h2>Where the sums are uncertain</h2>
<p>Three assumptions carry the comparison, and none of them is fixed. First the SPF: air-to-water systems in the measurements ranged from ${h.num(P.technik.jaz_luft_min, 1)} to ${h.num(P.technik.jaz_luft_max, 1)}, which in the example means ${h.eur(laufend('wp_luft', q, undefined, { jaz: P.technik.jaz_luft_max })!.kosten)} to ${h.eur(laufend('wp_luft', q, undefined, { jaz: P.technik.jaz_luft_min })!.kosten)} of electricity a year. Second the heat pump tariff: the Federal Network Agency figure dates from ${h.date(P.preise.wp_strom_stand)}, and no newer official survey exists. Third the gas price, an average across all contracts including the standing charge, which will not match your own tariff exactly. Enter your consumption and your own CO₂ scenario in the calculator above. Whether a heat network is planned for your street no longer obliges you to anything since 29 July 2026, but it may open a third option.</p>

<h2>Grant and letting</h2>
<p>For a heat pump KfW pays at least ${h.pct(P.foerderung.grund)} of up to ${h.eur(H)} in eligible costs, for a gas boiler nothing (${h.src('begem2026', 'guideline of 17 August 2026')}). In the example, a ${h.eur(32000)} quote, a 25-year-old gas boiler and ${h.eur(75000)} income, the grant is ${h.eur(zuschuss.zuschuss)} because the ${h.pct(zuschuss.kgbSatz)} climate speed bonus is added. Your own case is calculated under ${h.a('waermepumpe-foerderung', 'heat pump grant')}. Landlords must, under the ${h.src('co2kostaufg', 'CO₂ cost allocation act')}, bear half the CO₂ costs of a new gas boiler from ${jahr(A.neue_fossile_heizung_ab)}; with a heat pump that item disappears. The split under the stage model for existing systems is shown by the ${h.a('co2-kostenaufteilung', 'cost split calculator')}.</p>`,
  },
});

import { defineGuide } from '../../lib/guide-types';
import { laufend } from '../../lib/engine/heizkosten';
import { foerderung, type FoerderEingabe } from '../../lib/engine/foerderung';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Fernwärme Preise: Es gibt keinen amtlichen Durchschnittspreis (weder Destatis noch Bundesnetzagentur); nur der
 * Verbraucherpreisindex weist Fernwärme aus (Destatis PM Nr. 364). Die Seite rechnet deshalb mit dem eigenen Preis.
 * § 1a AVBFernwärmeV (Veröffentlichungspflichten) gelesen auf gesetze-im-internet.de am 19.10.2026.
 * Grünanteil der Wärmenetze: §§ 29, 31 WPG, Einzelheiten auf der Seite Wärmeplanung. Förderung: Merkblatt 458.
 * Alle Fernwärmepreise in den Tabellen sind Rechenbeispiele, keine amtlichen Werte.
 */
const Pr = P.preise;
const Q = 12000;
const gas = laufend('gas', Q)!, wp = laufend('wp_luft', Q)!;
const gleichGas = (gas.kosten / Q) * 100, gleichWp = (wp.kosten / Q) * 100;
const beispielPreise = [10, 12.5, 15, 17.5, 20];
/** Beispielabrechnung mit angenommenen Werten. */
const ap = 11.2, grund = 540, mess = 72;
const gesamt = (Q * ap) / 100 + grund + mess;
const ctGesamt = (gesamt / Q) * 100;
const eingabe: FoerderEingabe = { antrag: P.retrieved_at, gebaeude: 'efh', einheiten: 1, kosten: 12000, selbstnutzer: true, alt: 'gas', altJahre: 24, neu: 'netz', wpEU: false, zve: 45000, kind: false };
const anschluss = foerderung(eingabe);
const anschlussVermietet = foerderung({ ...eingabe, selbstnutzer: false });

export default defineGuide({
  id: 'fernwaerme-preise',
  group: 'kosten',
  order: 125,
  mini: 'fernwaerme',
  miniHref: 'heizkosten-rechner',
  related: ['heizkosten-rechner', 'heizkosten-vergleich', 'waermeplanung', 'kfw-458', 'gaspreis', 'waermepumpe-oder-gasheizung'],
  sources: ['destatisVpi', 'destatisPreise', 'merkblatt458', 'kfw458', 'bnetza', 'avbfernwaermev'],
  de: {
    slug: 'fernwaerme-preise',
    nav: 'Fernwärme Preise',
    card: 'Warum es keinen amtlichen Fernwärmepreis gibt, wie Sie Ihren eigenen je kWh ausrechnen und ab wann Gas oder Wärmepumpe günstiger wären.',
    title: 'Fernwärme Preise 2026: Eigenen Preis prüfen und vergleichen',
    description: `Fernwärme Preise 2026: Es gibt keinen amtlichen Durchschnitt. So rechnen Sie Ihren Preis je kWh und sehen, ab wann Gas (${DE.num(gleichGas, 2)} ct je kWh Wärme) günstiger wäre.`,
    h1: 'Fernwärme Preise: den eigenen Preis lesen und einordnen',
    intro: 'Für Fernwärme veröffentlicht keine Behörde einen Durchschnittspreis. Wer wissen will, ob sein Preis hoch ist, muss ihn selbst ausrechnen und mit dem vergleichen, was dieselbe Wärme anders kosten würde.',
    resume: `Einen amtlichen Durchschnittspreis für Fernwärme gibt es nicht: Weder das Statistische Bundesamt noch die Bundesnetzagentur veröffentlichen ihn, wie sie es für Gas und Strom tun. Destatis führt Fernwärme nur im Verbraucherpreisindex, der die Veränderung zeigt, nicht das Preisniveau; im September 2026 lag sie leicht unter dem Vorjahresmonat. Den eigenen Preis je kWh erhalten Sie, wenn Sie alle Kosten des Abrechnungsjahres, also Arbeitspreis, Grund- oder Leistungspreis und Messpreis, durch die gelieferten Kilowattstunden teilen. Zum Vergleich: Dieselbe Wärme aus einer Gasheizung kostet zum Durchschnittspreis von ${DE.num(Pr.gas_ct, 2)} ct je kWh Gas rund ${DE.num(gleichGas, 2)} ct je kWh Wärme, aus einer Luft-Wärmepumpe am Wärmepumpentarif rund ${DE.num(gleichWp, 2)} ct. Ein Haushalt mit ${DE.num(Q)} kWh Wärme im Jahr zahlt mit Gas ${DE.eur(gas.kosten)}, mit der Wärmepumpe ${DE.eur(wp.kosten)}. Liegt sein Fernwärmepreis über ${DE.num(gleichGas, 2)} ct, wäre eine eigene Gasheizung im Betrieb günstiger, ohne Anschaffung und Wartung gerechnet. Der Anschluss an ein Wärmenetz wird mit KfW 458 bezuschusst, im Beispiel mit ${DE.eur(anschluss.zuschuss)}.`,
    faqs: [
      { q: 'Warum gibt es keinen amtlichen Durchschnittspreis für Fernwärme?', a: 'Fernwärme wird in örtlichen Netzen verkauft, jedes mit eigenem Versorger und eigenen Preisen. Eine Erhebung der Durchschnittspreise, wie das Statistische Bundesamt sie halbjährlich für Gas und Strom veröffentlicht, gibt es für Fernwärme nicht, auch die Bundesnetzagentur weist keinen Wert aus. Im Verbraucherpreisindex erscheint Fernwärme nur als Veränderung gegenüber dem Vorjahr. Zahlen, die im Netz als „durchschnittlicher Fernwärmepreis“ kursieren, stammen daher nicht aus amtlichen Quellen.' },
      { q: 'Was muss ein Fernwärmeversorger über seine Preise veröffentlichen?', a: 'Nach § 1a AVBFernwärmeV muss er seine allgemeinen Versorgungsbedingungen im Internet veröffentlichen, in der jeweils aktuellen Fassung, einschließlich der Preisregelungen, Preisänderungsklauseln und Preisbestandteile. Das muss leicht zugänglich und allgemein verständlich sein, mit klaren Hinweisen auf die Quellen der Indizes und Preislisten, die er zur Preisanpassung nutzt. Außerdem muss er die Netzverluste in Megawattstunden je Jahr angeben. Fehlen diese Angaben auf der Website, dürfen Sie nachfragen.' },
      { q: 'Wie rechne ich meinen Fernwärmepreis je Kilowattstunde aus?', a: `Addieren Sie alle Beträge der Jahresabrechnung: Arbeitspreis mal gelieferte Kilowattstunden, dazu Grund- oder Leistungspreis und Messpreis. Teilen Sie die Summe durch die gelieferten Kilowattstunden. In einem Beispiel mit ${DE.num(Q)} kWh, ${DE.num(ap, 2)} ct Arbeitspreis, ${DE.eur(grund)} Grundpreis und ${DE.eur(mess)} Messpreis ergibt das ${DE.num(ctGesamt, 2)} ct je kWh. Diesen Gesamtpreis tragen Sie in den Rechner oben ein, nicht nur den Arbeitspreis.` },
      { q: 'Ab welchem Preis ist Fernwärme teurer als eine eigene Gasheizung?', a: `Im Betrieb ab etwa ${DE.num(gleichGas, 2)} ct je kWh Wärme. So viel kostet eine kWh Wärme aus einer üblichen Gasheizung beim Durchschnittspreis von ${DE.num(Pr.gas_ct, 2)} ct je kWh Gas, mit dem Nutzungsgrad, den diese Seite annimmt. Die Gasheizung braucht aber Wartung, Schornsteinfeger und irgendwann einen neuen Kessel, die Fernwärme hat dafür eigene feste Kosten. Ein Preis knapp über dieser Grenze ist deshalb nicht automatisch zu hoch.` },
      { q: 'Wird der Anschluss an ein Wärmenetz gefördert?', a: `Ja, über die Heizungsförderung KfW 458 wie eine Wärmepumpe: ${DE.pct(P.foerderung.grund)} Grundförderung, für Selbstnutzer die Boni. Ein Selbstnutzer mit ${DE.eur(45000)} Einkommen, der eine 24 Jahre alte Gasheizung ersetzt, erhält bei ${DE.eur(12000)} Anschlusskosten ${DE.eur(anschluss.zuschuss)}. Als Vermieter wären es ${DE.eur(anschlussVermietet.zuschuss)}. Voraussetzung ist unter anderem, dass das Heizungsverteilsystem im Haus mit optimiert wird.` },
    ],
    body: (h) => `
<h2>Kein amtlicher Durchschnitt, aus gutem Grund</h2>
<p>Für Gas und Strom veröffentlicht das ${h.src('destatisPreise', 'Statistische Bundesamt')} jedes halbe Jahr Durchschnittspreise, für Heizstrom die ${h.src('bnetza', 'Bundesnetzagentur')}. Für Fernwärme gibt es nichts Vergleichbares. Sie wird in örtlichen Netzen geliefert, häufig von Stadtwerken, und jedes Netz hat eigene Kosten für Erzeugung, Leitungen und Verluste. Das Amt führt Fernwärme nur im ${h.src('destatisVpi', 'Verbraucherpreisindex')}: Er zeigt, ob die Preise gegenüber dem Vorjahr gestiegen oder gefallen sind, nicht wie hoch sie sind. Im September 2026 lag Fernwärme dort leicht unter dem Vorjahresmonat, während Heizöl stark zulegte.</p>
<p>Wer im Netz eine Zahl wie „Fernwärme kostet durchschnittlich so und so viel Cent“ findet, liest eine Auswertung von Verbänden, Vergleichsportalen oder einzelnen Versorgern. Sie kann stimmen, ist aber keine amtliche Statistik. Diese Seite rechnet deshalb nicht mit einem Durchschnitt, sondern mit Ihrem eigenen Preis.</p>

<h2>Was der Versorger offenlegen muss</h2>
<p>Die Verordnung über Allgemeine Bedingungen für die Versorgung mit Fernwärme (AVBFernwärmeV) verlangt in § 1a, dass das Fernwärmeversorgungsunternehmen seine allgemeinen Versorgungsbedingungen im Internet veröffentlicht, in der jeweils aktuellen Fassung. Dazu gehören ausdrücklich die Preisregelungen, die Preisänderungsklauseln und die Preisbestandteile. Die Angaben müssen leicht zugänglich und allgemein verständlich sein, und der Versorger muss klar auf die Quellen der Indizes und Preislisten verweisen, mit denen er seine Preise anpasst. Zusätzlich muss er die Netzverluste veröffentlichen, in Megawattstunden je Jahr als Differenz zwischen eingespeister und abgegebener Wärme.</p>
<p>Für Sie heißt das: Die Preisformel Ihres Versorgers ist öffentlich. Steht dort etwa, dass der Arbeitspreis einem Gasindex und einem Lohnindex folgt, können Sie nachvollziehen, warum die Rechnung steigt oder fällt. Hohe Netzverluste im Verhältnis zur gelieferten Wärme können auf ein altes oder weitläufiges Netz hindeuten, dessen Kosten am Ende die Kunden mittragen.</p>

<h2>Den eigenen Preis je kWh ausrechnen</h2>
<p>Eine Fernwärmerechnung hat meist mehrere Posten: einen Arbeitspreis je kWh, einen Grund- oder Leistungspreis, der von der vereinbarten Anschlussleistung abhängen kann, und einen Messpreis für den Wärmezähler. Vergleichbar wird das erst als Gesamtpreis je gelieferter Kilowattstunde. Ein Rechenbeispiel mit angenommenen Werten:</p>
${h.table(['Posten', 'Betrag'], [
  ['Gelieferte Wärme', `${h.num(Q)} kWh`],
  [`Arbeitspreis ${h.num(ap, 2)} ct je kWh`, h.eur((Q * ap) / 100)],
  ['Grundpreis im Jahr', h.eur(grund)],
  ['Messpreis im Jahr', h.eur(mess)],
  ['Summe', h.eur(gesamt)],
  ['Gesamtpreis je kWh', `${h.num(ctGesamt, 2)} ct`],
], 'Beispielrechnung, keine amtlichen Werte', ['l', 'r'])}
<p>Der Gesamtpreis liegt hier um ${h.num(ctGesamt - ap, 2)} ct über dem Arbeitspreis. Wer nur den Arbeitspreis mit dem Gaspreis vergleicht, unterschätzt die Fernwärme also. Tragen Sie in den Rechner oben die gelieferte Wärme und den Gesamtpreis ein.</p>

<h2>Wie sich Ihr Preis gegen Gas und Wärmepumpe schlägt</h2>
<p>Fernwärme kommt ohne eigenen Kessel ins Haus, die gelieferte kWh ist schon Wärme. Der faire Vergleich ist deshalb der Preis einer kWh Wärme aus einer eigenen Heizung. Mit dem Durchschnittspreis für Gas von ${h.num(Pr.gas_ct, 2)} ct und dem Nutzungsgrad, den diese Seite für übliche Kessel annimmt, sind das ${h.num(gleichGas, 2)} ct. Eine Luft-Wärmepumpe am Wärmepumpentarif liefert sie für ${h.num(gleichWp, 2)} ct. Für ${h.num(Q)} kWh Wärme im Jahr:</p>
${h.table(['Fernwärmepreis je kWh (Beispiel)', 'Fernwärme im Jahr', 'gegenüber Gas', 'gegenüber Luft-Wärmepumpe'], beispielPreise.map((c) => {
  const f = (Q * c) / 100;
  const d = (x: number) => (x >= 0 ? '+' : '−') + h.eur(Math.abs(x));
  return [`${h.num(c, 2)} ct`, h.eur(f), d(f - gas.kosten), d(f - wp.kosten)];
}), `Gas ${h.eur(gas.kosten)}, Luft-Wärmepumpe ${h.eur(wp.kosten)} für dieselbe Wärme; nur Energiekosten`, ['r', 'r', 'r', 'r'])}
<p>Die Tabelle vergleicht nur Energiekosten. Eine eigene Heizung kostet zusätzlich Anschaffung, Wartung und Schornsteinfeger, bei der Fernwärme können dafür ein Anschlussbeitrag und ein Grundpreis anfallen. Wer zwischen beiden wählen kann, sollte beides über zwanzig Jahre rechnen. Den Vergleich aller Heizungen je kWh Wärme zeigt ${h.a('heizkosten-vergleich', 'Heizkosten Vergleich')}, wie sich der Gaspreis zusammensetzt, erklärt ${h.a('gaspreis', 'Gaspreis')}.</p>
<!--mini:vergleich-->

<h2>Zuschuss für den Anschluss</h2>
<p>Der Anschluss an ein Wärme- oder Gebäudenetz ist eine der Maßnahmen, die die Heizungsförderung ${h.a('kfw-458', 'KfW 458')} bezuschusst, mit denselben Sätzen wie eine Wärmepumpe. Ein Selbstnutzer mit ${h.eur(45000)} Einkommen, der eine 24 Jahre alte Gasheizung ersetzt, bekommt bei ${h.eur(12000)} Kosten ${h.pct(anschluss.satzEigen)}, also ${h.eur(anschluss.zuschuss)}. Ein Vermieter erhält nur die Grundförderung, ${h.eur(anschlussVermietet.zuschuss)}. Nach dem ${h.src('merkblatt458', 'Merkblatt 458')} muss der Anschluss mit einer Optimierung des gesamten Heizungsverteilsystems im Haus verbunden sein. Liegt das Grundstück in einem Gebiet mit Anschluss- und Benutzungszwang, fördert die KfW dort nur noch den Netzanschluss und keine eigene Heizung (${h.src('kfw458', 'KfW')}).</p>

<h2>Wie grün die Fernwärme werden muss</h2>
<p>Das Wärmeplanungsgesetz schreibt jedem Wärmenetz einen steigenden Mindestanteil an Wärme aus erneuerbaren Energien oder unvermeidbarer Abwärme vor, mit Stufen ab 2030 und 2040, bis jedes Netz spätestens Ende 2044 vollständig so gespeist wird (§§ 29 und 31 WPG). Für Kunden bedeutet das: Die Versorger müssen in den nächsten Jahren investieren, und diese Kosten fließen in die Preisformeln ein. Wie stark, sagt das Gesetz nicht. Ob für Ihre Straße ein Netz geplant ist, zeigt der kommunale Wärmeplan, Einzelheiten unter ${h.a('waermeplanung', 'Kommunale Wärmeplanung')}. Ihre Jahreskosten mit eigenem Preis rechnet der ${h.a('heizkosten-rechner', 'Heizkosten Rechner')}, die Entscheidung mit Anschaffung ${h.a('waermepumpe-oder-gasheizung', 'Wärmepumpe oder Gasheizung')}.</p>`,
  },
  en: {
    slug: 'district-heating-prices',
    nav: 'District heating prices',
    card: 'Why Germany has no official district heating price, how to work out your own per kWh and when gas or a heat pump would be cheaper.',
    title: 'District heating prices 2026: check your own German tariff',
    description: `District heating prices 2026: Germany has no official average. Work out your price per kWh and see when gas (${EN.num(gleichGas, 2)} ct per kWh of heat) would be cheaper.`,
    h1: 'District heating prices: reading and judging your own price',
    intro: 'No German authority publishes an average price for district heating. To know whether yours is high, you have to work it out and compare it with what the same heat would cost another way.',
    resume: `There is no official average price for district heating (Fernwärme) in Germany: neither the Federal Statistical Office nor the Federal Network Agency publishes one. Destatis includes district heating only in the consumer price index, which shows the change, not the level; in September 2026 it was slightly below the same month a year earlier. You get your own price per kWh by dividing every cost of the billing year (unit, standing and meter charges) by the kilowatt hours delivered. For comparison, the same heat from a gas boiler at the average gas price of ${EN.num(Pr.gas_ct, 2)} ct per kWh costs about ${EN.num(gleichGas, 2)} ct per kWh of heat, from an air-source heat pump on a heat pump tariff about ${EN.num(gleichWp, 2)} ct. A household using ${EN.num(Q)} kWh of heat a year pays ${EN.eur(gas.kosten)} with gas and ${EN.eur(wp.kosten)} with a heat pump. If its district heating price is above ${EN.num(gleichGas, 2)} ct, a gas boiler would cost less to run, before purchase and servicing. Connecting to a heat network is funded under KfW 458, with ${EN.eur(anschluss.zuschuss)} in our example.`,
    faqs: [
      { q: 'Why is there no official average price for district heating in Germany?', a: 'District heating is sold in local networks, each with its own supplier and prices. There is no survey of average prices like the one the Federal Statistical Office publishes twice a year for gas and electricity, and the Federal Network Agency reports no figure either. In the consumer price index, district heating only appears as a change on the previous year. Numbers circulating online as an “average district heating price” therefore do not come from official sources.' },
      { q: 'What must a German district heating supplier publish about its prices?', a: 'Under section 1a of the district heating supply ordinance (AVBFernwärmeV), it must publish its general supply terms online in their current version, including price rules, price adjustment clauses and price components. This must be easy to access and generally understandable, with clear references to the sources of the indices and price lists it uses to adjust prices. It must also state network losses in megawatt hours per year. If this is missing from the website, ask for it.' },
      { q: 'How do I work out my district heating price per kWh?', a: `Add up every item on the annual bill: unit price times kilowatt hours delivered, plus standing or capacity charge and meter charge. Divide the total by the kilowatt hours delivered. In an example with ${EN.num(Q)} kWh, a ${EN.num(ap, 2)} ct unit price, ${EN.eur(grund)} standing charge and ${EN.eur(mess)} meter charge, that gives ${EN.num(ctGesamt, 2)} ct per kWh. Enter this all-in price in the calculator above, not just the unit price.` },
      { q: 'At what price is district heating dearer than running my own gas boiler?', a: `In running costs, from about ${EN.num(gleichGas, 2)} ct per kWh of heat. That is what a kWh of heat from a typical gas boiler costs at the average price of ${EN.num(Pr.gas_ct, 2)} ct per kWh of gas, with the efficiency this site assumes. A gas boiler, however, needs servicing, the chimney sweep and eventually a replacement, while district heating has fixed costs of its own. A price just above that line is not automatically too high.` },
      { q: 'Is connecting to a heat network covered by the German heating grant?', a: `Yes, through KfW 458, at the same rates as a heat pump: a ${EN.pct(P.foerderung.grund)} basic grant, plus the bonuses for owner-occupiers. An owner-occupier on ${EN.eur(45000)} replacing a 24-year-old gas boiler gets ${EN.eur(anschluss.zuschuss)} on ${EN.eur(12000)} of connection costs. As a landlord it would be ${EN.eur(anschlussVermietet.zuschuss)}. One condition is that the heating distribution system in the house is optimised at the same time.` },
    ],
    body: (h) => `
<h2>No official average, for a reason</h2>
<p>For gas and electricity the ${h.src('destatisPreise', 'Federal Statistical Office')} publishes average prices every six months, and the ${h.src('bnetza', 'Federal Network Agency')} does so for heating electricity. For district heating there is nothing comparable. It is delivered through local networks, often run by municipal utilities (Stadtwerke), and each network has its own costs for generation, pipes and losses. The Office lists district heating only in the ${h.src('destatisVpi', 'consumer price index')}: it shows whether prices rose or fell on the previous year, not how high they are. In September 2026 district heating there was slightly below the year before, while heating oil rose sharply.</p>
<p>If you find a figure online such as “district heating costs this many cents on average”, it comes from an industry body, a comparison site or a single supplier. It may be right, but it is not official statistics. This page therefore does not use an average; it works with your own price.</p>

<h2>What the supplier must disclose</h2>
<p>Section 1a of the German ordinance on general conditions for district heating supply (AVBFernwärmeV) requires the supplier to publish its general supply terms online, in their current version. That explicitly includes the price rules, the price adjustment clauses and the price components. The information must be easy to access and generally understandable, and the supplier must clearly reference the sources of the indices and price lists it uses to adjust prices. It must also publish network losses, in megawatt hours per year, as the difference between heat fed in and heat delivered.</p>
<p>For you this means the price formula is public. If it says, for example, that the unit price follows a gas index and a wage index, you can see why the bill rises or falls. High network losses relative to heat delivered can point to an old or sprawling network whose costs customers end up sharing. The documents are in German; useful search terms are „Preisblatt“ and „Preisänderungsklausel“.</p>

<h2>Working out your price per kWh</h2>
<p>A district heating bill usually has several items: a unit price per kWh, a standing or capacity charge that may depend on the agreed connection capacity, and a meter charge for the heat meter. It only becomes comparable as an all-in price per kWh delivered. A worked example with assumed values:</p>
${h.table(['Item', 'Amount'], [
  ['Heat delivered', `${h.num(Q)} kWh`],
  [`Unit price ${h.num(ap, 2)} ct per kWh`, h.eur((Q * ap) / 100)],
  ['Standing charge a year', h.eur(grund)],
  ['Meter charge a year', h.eur(mess)],
  ['Total', h.eur(gesamt)],
  ['All-in price per kWh', `${h.num(ctGesamt, 2)} ct`],
], 'Worked example, not official values', ['l', 'r'])}
<p>Here the all-in price is ${h.num(ctGesamt - ap, 2)} ct above the unit price. Comparing only the unit price with the gas price therefore understates district heating. Enter the heat delivered and the all-in price in the calculator above.</p>

<h2>How your price compares with gas and a heat pump</h2>
<p>District heating arrives without a boiler of your own; each kWh delivered is already heat. The fair comparison is therefore the price of a kWh of heat from your own system. At the average gas price of ${h.num(Pr.gas_ct, 2)} ct and the efficiency this site assumes for typical boilers, that is ${h.num(gleichGas, 2)} ct. An air-source heat pump on a heat pump tariff delivers it for ${h.num(gleichWp, 2)} ct. For ${h.num(Q)} kWh of heat a year:</p>
${h.table(['District heating price per kWh (example)', 'District heating a year', 'vs gas', 'vs air heat pump'], beispielPreise.map((c) => {
  const f = (Q * c) / 100;
  const d = (x: number) => (x >= 0 ? '+' : '−') + h.eur(Math.abs(x));
  return [`${h.num(c, 2)} ct`, h.eur(f), d(f - gas.kosten), d(f - wp.kosten)];
}), `Gas ${h.eur(gas.kosten)}, air heat pump ${h.eur(wp.kosten)} for the same heat; energy costs only`, ['r', 'r', 'r', 'r'])}
<p>The table compares energy costs only. Your own system also costs purchase, servicing and the chimney sweep; district heating may instead involve a connection fee and a standing charge. If you can choose between the two, work both out over twenty years. The comparison of every system per kWh of heat is under ${h.a('heizkosten-vergleich', 'heating costs compared')}; how the gas price is made up is under ${h.a('gaspreis', 'gas price')}.</p>
<!--mini:vergleich-->

<h2>Grant for the connection</h2>
<p>Connecting to a heat or building network is one of the measures funded by the ${h.a('kfw-458', 'KfW 458')} heating grant, at the same rates as a heat pump. An owner-occupier on ${h.eur(45000)} replacing a 24-year-old gas boiler gets ${h.pct(anschluss.satzEigen)} of ${h.eur(12000)}, which is ${h.eur(anschluss.zuschuss)}. A landlord receives only the basic grant, ${h.eur(anschlussVermietet.zuschuss)}. The bonuses require the house to be your main residence. Under ${h.src('merkblatt458', 'information sheet 458')}, the connection must go together with optimising the entire heating distribution system in the house. If the plot lies in an area with compulsory connection and use, KfW funds only the network connection there, not a system of your own (${h.src('kfw458', 'KfW')}).</p>

<h2>How green district heating must become</h2>
<p>The Heat Planning Act requires every heat network to draw a rising minimum share of its heat from renewables or unavoidable waste heat, with steps from 2030 and 2040, until every network is fed entirely this way by the end of 2044 at the latest (sections 29 and 31 WPG). For customers this means suppliers must invest over the coming years, and those costs feed into the price formulas. By how much, the law does not say. Whether a network is planned for your street is shown in the municipal heat plan; details under ${h.a('waermeplanung', 'municipal heat planning')}. The ${h.a('heizkosten-rechner', 'heating cost calculator')} works out your yearly cost with your own price, the decision including purchase is under ${h.a('waermepumpe-oder-gasheizung', 'heat pump or gas boiler')}.</p>`,
  },
});

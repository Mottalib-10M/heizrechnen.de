import { defineGuide } from '../../lib/guide-types';
import { nutzwaerme, laufend, co2Mehrkosten } from '../../lib/engine/heizkosten';
import { co2Kg, co2Kosten, aufschlagCent, preisJahr, kgJeKwhGas } from '../../lib/engine/co2';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Gaspreis für Haushalte: Destatis PM Nr. 345 vom 30.09.2026 (1. Halbjahr 2026, Durchschnitt und zwei Verbrauchsgruppen),
 * CO₂-Anteil über den Motor (EBeV-Faktor, Versteigerungsschnitt 2026, Korridor 2026 und beschlossener Korridor 2027),
 * Szenarien ab 2028 ausdrücklich als Szenario. Umrechnung GJ in kWh: 1 kWh = 3,6 MJ.
 */
const Pr = P.preise;
const C = P.co2;
const gjZuKwh = (gj: number) => gj / 0.0036;
const klein = gjZuKwh(20), gross = gjZuKwh(200);
const fW = 5000, fH = 18000, fA = 60000;
const kW = (fW * Pr.gas_unter_20gj_ct) / 100, kH = (fH * Pr.gas_ct) / 100, kA = (fA * Pr.gas_ueber_200gj_ct) / 100;
const co2ct = aufschlagCent('gas', C.auktion_2026_durchschnitt);
const co2ctMin = aufschlagCent('gas', C.korridor_2026.min);
const anteil = co2ct / Pr.gas_ct;
const kgH = co2Kg('gas', fH);
const co2H = co2Kosten('gas', fH, C.auktion_2026_durchschnitt);
const k27 = preisJahr(2027);
const s1 = 100, s2 = 150;
const plus1 = co2Mehrkosten(kgH, s1), plus2 = co2Mehrkosten(kgH, s2);
const ct1 = aufschlagCent('gas', s1), ct2 = aufschlagCent('gas', s2);
const qH = nutzwaerme({ verbrauch: fH, heute: 'gas', land: 'Niedersachsen' });
const wpH = laufend('wp_luft', qH)!;
const B = P.gesetz.biotreppe;
const jahr = (iso: string) => iso.slice(0, 4);

export default defineGuide({
  id: 'gaspreis',
  group: 'kosten',
  order: 124,
  mini: 'gaspreis',
  miniHref: 'waermepumpe-oder-gasheizung',
  related: ['heizkosten-vergleich', 'waermepumpe-oder-gasheizung', 'co2-preis-2027', 'gasheizung-verbot', 'co2-kostenaufteilung', 'co2-steuer'],
  sources: ['destatisPreise', 'behg10', 'dehst', 'btBehg', 'ebev', 'ets2'],
  de: {
    slug: 'gaspreis',
    nav: 'Gaspreis',
    card: 'Was Erdgas Haushalte im ersten Halbjahr 2026 kostete, warum kleine Verbraucher mehr zahlen und wie viel davon CO₂-Preis ist.',
    title: 'Gaspreis 2026: Preis je kWh, Verbrauchsgruppen, CO₂-Anteil',
    description: `Gaspreis 2026: ${DE.num(Pr.gas_ct, 2)} ct je kWh im Schnitt der Haushalte, ${DE.num(Pr.gas_unter_20gj_ct, 2)} ct für kleine Verbraucher laut Destatis. Davon rund ${DE.num(co2ct, 2)} ct CO₂-Preis. Mit Rechenbeispielen.`,
    h1: 'Gaspreis für Haushalte: was eine kWh 2026 kostet',
    intro: 'Das Statistische Bundesamt meldet den Gaspreis der Haushalte jedes halbe Jahr. Wie viel Sie zahlen, hängt vor allem davon ab, wie viel Gas Sie verbrauchen.',
    resume: `Private Haushalte haben im ersten Halbjahr 2026 laut Statistischem Bundesamt im Durchschnitt ${DE.num(Pr.gas_ct, 2)} ct je Kilowattstunde Erdgas gezahlt, mit Grundpreis, Netzentgelten, Steuern und Abgaben. Wer weniger als 20 Gigajoule im Jahr verbraucht, also rund ${DE.num(klein)} kWh, zahlte ${DE.num(Pr.gas_unter_20gj_ct, 2)} ct, wer mehr als 200 Gigajoule verbraucht, rund ${DE.num(gross)} kWh, ${DE.num(Pr.gas_ueber_200gj_ct, 2)} ct. Gegenüber dem zweiten Halbjahr 2025 sanken die Preise in allen Gruppen, unter anderem weil die Gasspeicherumlage abgeschafft wurde. Im Preis steckt der CO₂-Preis nach dem Brennstoffemissionshandelsgesetz: Bei ${DE.eur(C.auktion_2026_durchschnitt)} je Tonne, dem Schnitt der Versteigerungen 2026, sind das ${DE.num(co2ct, 2)} ct je kWh mit Mehrwertsteuer, rund ${DE.pct(anteil)} des Durchschnittspreises. Ein Haus mit ${DE.num(fH)} kWh Jahresverbrauch zahlt ${DE.eur(kH)} im Jahr, davon ${DE.eur(co2H)} für ${DE.num(kgH)} kg CO₂. Für 2027 hat der Bundestag denselben Korridor von ${DE.num(k27.min)} bis ${DE.num(k27.max)} € beschlossen, verkündet ist das Gesetz noch nicht.`,
    faqs: [
      { q: 'Was kostet eine Kilowattstunde Gas 2026 im Durchschnitt?', a: `Im ersten Halbjahr 2026 zahlten private Haushalte laut Statistischem Bundesamt ${DE.num(Pr.gas_ct, 2)} ct je kWh. Der Wert ist ein Durchschnitt über alle Verträge, Bestandskunden wie neu abgeschlossene, und enthält Grund- und Arbeitspreis, Netzentgelte, Steuern und Umlagen. Ihr eigener Preis kann deutlich abweichen, je nach Vertrag, Anbieter und Verbrauch. Für einen Vergleich teilen Sie die Jahreskosten Ihrer Abrechnung durch die abgerechneten Kilowattstunden.` },
      { q: 'Warum zahlen Haushalte mit wenig Gasverbrauch mehr je Kilowattstunde?', a: `Weil der Grundpreis gleich bleibt, egal wie viel Gas durch die Leitung fließt. Bei kleinem Verbrauch verteilt er sich auf wenige Kilowattstunden. Haushalte unter rund ${DE.num(klein)} kWh im Jahr, oft Wohnungen mit Gasetagenheizung oder nur Gasherd, zahlten deshalb ${DE.num(Pr.gas_unter_20gj_ct, 2)} ct. Große Häuser über rund ${DE.num(gross)} kWh kamen auf ${DE.num(Pr.gas_ueber_200gj_ct, 2)} ct. Wer wenig verbraucht, achtet beim Vergleich von Angeboten deshalb besonders auf den Grundpreis.` },
      { q: 'Wie viel CO₂-Preis steckt in einer Kilowattstunde Gas?', a: `Eine kWh Gas laut Rechnung setzt ${DE.num(kgJeKwhGas, 3)} kg CO₂ frei, nach den Faktoren der Emissionsberichterstattungsverordnung. Beim Versteigerungsschnitt 2026 von ${DE.eur(C.auktion_2026_durchschnitt)} je Tonne ergibt das ${DE.num(co2ct, 2)} ct mit Mehrwertsteuer, am unteren Ende des Korridors von ${DE.eur(C.korridor_2026.min)} wären es ${DE.num(co2ctMin, 2)} ct. Wie viel davon Ihr Versorger tatsächlich weitergibt, steht nicht immer getrennt auf der Rechnung.` },
      { q: 'Wird Gas 2027 wegen des CO₂-Preises teurer?', a: `Nach dem, was der Bundestag am 15. Oktober 2026 beschlossen hat, nicht: Der Korridor für 2027 soll wie 2026 bei ${DE.num(k27.min)} bis ${DE.num(k27.max)} € je Tonne liegen. Bundesrat und Verkündung stehen noch aus, geltendes Recht ist das also noch nicht. Ab ${C.ets2_start} soll der europäische Emissionshandel für Gebäude starten, für den es keinen festen Preis gibt. Bei ${DE.eur(s1)} je Tonne wären es ${DE.num(ct1, 2)} ct je kWh, als Szenario, nicht als Prognose.` },
      { q: 'Wie werden die Kubikmeter auf der Gasuhr zu Kilowattstunden?', a: 'Die Gasuhr misst das Volumen in Kubikmetern. Der Versorger rechnet es mit zwei Werten in Kilowattstunden um, die auf der Abrechnung stehen: der Zustandszahl, die Druck und Temperatur am Zähler berücksichtigt, und dem Brennwert des gelieferten Gases. Kubikmeter mal Zustandszahl mal Brennwert ergibt die abgerechneten Kilowattstunden. Beide Werte schwanken leicht von Abrechnung zu Abrechnung, deshalb lohnt der Blick auf die Kilowattstunden statt auf die Kubikmeter.' },
    ],
    body: (h) => `
<h2>Was Haushalte im ersten Halbjahr 2026 gezahlt haben</h2>
<p>Das ${h.src('destatisPreise', 'Statistische Bundesamt')} erhebt seit 2020 die Verkaufspreise der Energieversorger und veröffentlicht für jedes Halbjahr einen Durchschnitt. Er enthält Grund- oder Leistungspreis, Arbeitspreis, Netzentgelte, Steuern, Abgaben und Umlagen und deckt Bestandskunden ebenso ab wie neue Verträge. Für das erste Halbjahr 2026 liegt er bei ${h.num(Pr.gas_ct, 2)} ct je kWh. Die Verbrauchsgruppen grenzt die Statistik in Gigajoule ab; umgerechnet sind 20 Gigajoule rund ${h.num(klein)} kWh und 200 Gigajoule rund ${h.num(gross)} kWh.</p>
${h.table(['Verbrauch im Jahr', 'Preis je kWh', 'Beispiel', 'Kosten im Jahr'], [
  [`unter rund ${h.num(klein)} kWh`, `${h.num(Pr.gas_unter_20gj_ct, 2)} ct`, `Wohnung, ${h.num(fW)} kWh`, h.eur(kW)],
  ['alle Haushalte, Durchschnitt', `${h.num(Pr.gas_ct, 2)} ct`, `Einfamilienhaus, ${h.num(fH)} kWh`, h.eur(kH)],
  [`über rund ${h.num(gross)} kWh`, `${h.num(Pr.gas_ueber_200gj_ct, 2)} ct`, `großer Altbau, ${h.num(fA)} kWh`, h.eur(kA)],
], `Destatis, Pressemitteilung Nr. 345 vom 30.09.2026, ${Pr.gas_stand}`, ['l', 'r', 'l', 'r'])}
<p>Der Unterschied zwischen kleinen und großen Verbrauchern liegt vor allem am Grundpreis, der unabhängig von der Menge anfällt. Für eine Wohnung mit Gasetagenheizung macht er einen großen Teil der Rechnung aus, für einen Altbau mit hohem Verbrauch einen kleinen. Gegenüber dem zweiten Halbjahr 2025 sind die Preise laut Destatis in allen Verbrauchsgruppen gesunken. Als Grund nennt das Amt die Abschaffung der Gasspeicherumlage.</p>

<h2>Woher die Abrechnung ihre Kilowattstunden hat</h2>
<p>Die Gasuhr zählt Kubikmeter. Auf der Abrechnung stehen dagegen Kilowattstunden, umgerechnet mit der Zustandszahl und dem Brennwert. Der Brennwert enthält auch die Wärme, die im Wasserdampf der Abgase steckt. Ein Brennwertkessel nutzt einen Teil davon, ein alter Heizwertkessel kaum. Deshalb kommt in keinem Haus jede abgerechnete Kilowattstunde als Wärme im Heizkörper an. Diese Seite rechnet für Vergleiche mit einem Nutzungsgrad von ${h.pct(P.annahmen.nutzungsgrad_kessel)} bezogen auf den Heizwert. Was eine Kilowattstunde Wärme aus Gas im Vergleich zu Öl und Wärmepumpe kostet, steht unter ${h.a('heizkosten-vergleich', 'Heizkosten Vergleich')}.</p>

<h2>Der CO₂-Anteil im Gaspreis</h2>
<p>Seit 2021 müssen Unternehmen, die Erdgas in Verkehr bringen, für das CO₂ aus seiner Verbrennung Zertifikate nach dem Brennstoffemissionshandelsgesetz erwerben und geben die Kosten über den Preis weiter. Für 2026 gilt nach ${h.src('behg10', '§ 10 BEHG')} ein Preiskorridor von ${h.eur(C.korridor_2026.min)} bis ${h.eur(C.korridor_2026.max)} je Tonne. Versteigert wurde laut ${h.src('dehst', 'Deutscher Emissionshandelsstelle')} bisher im Schnitt zu ${h.eur(C.auktion_2026_durchschnitt)}. Mit dem Emissionsfaktor aus der ${h.src('ebev', 'EBeV 2030')} setzt eine abgerechnete kWh Gas ${h.num(kgJeKwhGas, 3)} kg CO₂ frei.</p>
${h.table(['CO₂-Preis je Tonne', 'Status', 'ct je kWh mit MwSt.', `Haus mit ${h.num(fH)} kWh im Jahr`], [
  [h.eur(C.korridor_2026.min), 'Untergrenze Korridor 2026', h.num(co2ctMin, 2), h.eur(co2Kosten('gas', fH, C.korridor_2026.min))],
  [h.eur(C.auktion_2026_durchschnitt), 'Schnitt der Versteigerungen 2026', h.num(co2ct, 2), h.eur(co2H)],
  [`${h.eur(k27.min)} bis ${h.eur(k27.max)}`, '2027: beschlossen, noch nicht verkündet', `${h.num(aufschlagCent('gas', k27.min), 2)} bis ${h.num(aufschlagCent('gas', k27.max), 2)}`, `${h.eur(co2Kosten('gas', fH, k27.min))} bis ${h.eur(co2Kosten('gas', fH, k27.max))}`],
  [h.eur(s1), `Szenario ab ${C.ets2_start}, kein amtlicher Wert`, h.num(ct1, 2), h.eur(co2Kosten('gas', fH, s1))],
  [h.eur(s2), `Szenario ab ${C.ets2_start}, kein amtlicher Wert`, h.num(ct2, 2), h.eur(co2Kosten('gas', fH, s2))],
], `Berechnet mit dem Emissionsfaktor der EBeV 2030 und ${h.pct(C.mwst)} Mehrwertsteuer`, ['r', 'l', 'r', 'r'])}
<p>Beim heutigen Schnitt macht der CO₂-Preis rund ${h.pct(anteil)} des durchschnittlichen Gaspreises aus. Für 2027 hat der ${h.src('btBehg', 'Bundestag')} am ${h.date(C.korridor_2027_beschlossen.bundestag)} denselben Korridor beschlossen; Bundesrat und Verkündung stehen aus. Ab ${C.ets2_start} soll der ${h.src('ets2', 'europäische Emissionshandel ETS2')} den nationalen Preis ablösen. Einen festen Preis gibt es dort nicht, nur eine Schwelle, ab der zusätzliche Zertifikate auf den Markt kommen. Die Szenarien mit ${h.eur(s1)} und ${h.eur(s2)} je Tonne würden das Beispielhaus ${h.eur(plus1)} und ${h.eur(plus2)} im Jahr mehr kosten als heute. Mehr dazu unter ${h.a('co2-preis-2027', 'CO₂-Preis 2027')}.</p>
<!--mini:co2jahr-->

<h2>Was der Gaspreis für die Heizungswahl bedeutet</h2>
<p>Das Beispielhaus mit ${h.num(fH)} kWh Gas im Jahr bräuchte mit einer Luft-Wärmepumpe bei der im Bestand gemessenen Jahresarbeitszahl rund ${h.num(wpH.menge)} kWh Strom. Am Wärmepumpentarif kostet das ${h.eur(wpH.kosten)} statt ${h.eur(kH)} für Gas. Der Abstand hängt am Gaspreis, am Strompreis und am CO₂-Preis, die alle schwanken. Wer heute eine neue Gasheizung einbaut, muss nach § 43 GModG außerdem ab ${jahr(B[0].ab)} einen Anteil von ${h.pct(B[0].anteil)} klimafreundlicher Brennstoffe wie Biomethan nutzen, ab ${jahr(B[1].ab)} ${h.pct(B[1].anteil)}, ab ${jahr(B[3].ab)} ${h.pct(B[3].anteil)}. Diese Gase kosten mehr als Erdgas, was das für den Gaspreis heißt, ist offen. Einzelheiten stehen unter ${h.a('gasheizung-verbot', 'Gasheizung Verbot')}, den Kostenvergleich mit Anschaffung rechnet ${h.a('waermepumpe-oder-gasheizung', 'Wärmepumpe oder Gasheizung')}.</p>

<h2>Gaspreis in der Mietwohnung</h2>
<p>Mieter zahlen den Gaspreis über die Heizkostenabrechnung oder direkt an den Versorger, wenn sie eine eigene Gasetagenheizung haben. Den CO₂-Anteil teilen sich Mieter und Vermieter nach dem Kohlendioxidkostenaufteilungsgesetz in ${h.num(P.aufteilung.stufen.length)} Stufen, je nach CO₂-Ausstoß des Gebäudes je Quadratmeter. Wie viel auf Sie entfällt, rechnet ${h.a('co2-kostenaufteilung', 'CO₂-Kosten Aufteilung')}, die CO₂-Kosten im Jahr für jeden Verbrauch ${h.a('co2-steuer', 'CO₂-Steuer Rechner')}.</p>`,
  },
  en: {
    slug: 'gas-price-germany',
    nav: 'Gas price',
    card: 'What German households paid for natural gas in the first half of 2026, why small users pay more and how much of it is CO₂ price.',
    title: 'Gas price Germany 2026: averages, bands and the CO₂ share',
    description: `Gas price in Germany 2026: ${EN.num(Pr.gas_ct, 2)} ct per kWh household average, ${EN.num(Pr.gas_unter_20gj_ct, 2)} ct for small users (Destatis). About ${EN.num(co2ct, 2)} ct of it is CO₂ price. Worked examples inside.`,
    h1: 'Gas price for German households: what a kWh costs in 2026',
    intro: 'Germany’s Federal Statistical Office reports household gas prices every six months. What you pay depends above all on how much gas you use.',
    resume: `According to the Federal Statistical Office, private households in Germany paid an average of ${EN.num(Pr.gas_ct, 2)} ct per kilowatt hour of natural gas in the first half of 2026, including standing charge, network charges, taxes and levies. Households using under 20 gigajoules a year, about ${EN.num(klein)} kWh, paid ${EN.num(Pr.gas_unter_20gj_ct, 2)} ct; those using over 200 gigajoules, about ${EN.num(gross)} kWh, paid ${EN.num(Pr.gas_ueber_200gj_ct, 2)} ct. Prices fell in every band compared with the second half of 2025, partly because the gas storage levy was abolished. The price includes the national CO₂ price: at ${EN.eur(C.auktion_2026_durchschnitt)} per tonne, the 2026 auction average, that is ${EN.num(co2ct, 2)} ct per kWh including VAT, about ${EN.pct(anteil)} of the average price. A house using ${EN.num(fH)} kWh a year pays ${EN.eur(kH)}, of which ${EN.eur(co2H)} is for ${EN.num(kgH)} kg of CO₂. For 2027 the Bundestag has passed the same corridor of €${EN.num(k27.min)} to €${EN.num(k27.max)}, but the law has not yet been promulgated.`,
    faqs: [
      { q: 'What does a kilowatt hour of gas cost in Germany on average in 2026?', a: `In the first half of 2026 private households paid ${EN.num(Pr.gas_ct, 2)} ct per kWh according to the Federal Statistical Office. It is an average across all contracts, existing and new, and includes standing and unit charges, network charges, taxes and levies. Your own price can differ markedly by contract, supplier and usage. To compare, divide the yearly cost on your bill (Jahresabrechnung) by the kilowatt hours billed.` },
      { q: 'Why do households that use little gas pay more per kWh?', a: `Because the standing charge stays the same however much gas flows. With low use it is spread over few kilowatt hours. Households below about ${EN.num(klein)} kWh a year, often flats with a gas wall heater or just a gas cooker, therefore paid ${EN.num(Pr.gas_unter_20gj_ct, 2)} ct. Large houses above about ${EN.num(gross)} kWh paid ${EN.num(Pr.gas_ueber_200gj_ct, 2)} ct. If you use little gas, look closely at the standing charge when comparing offers.` },
      { q: 'How much CO₂ price is in a kilowatt hour of German gas?', a: `One billed kWh of gas releases ${EN.num(kgJeKwhGas, 3)} kg of CO₂, using the factors of the German emissions reporting regulation (EBeV). At the 2026 auction average of ${EN.eur(C.auktion_2026_durchschnitt)} per tonne, that is ${EN.num(co2ct, 2)} ct including VAT; at the bottom of the ${EN.eur(C.korridor_2026.min)} corridor it would be ${EN.num(co2ctMin, 2)} ct. How much your supplier actually passes on is not always shown separately on the bill.` },
      { q: 'Will gas get dearer in 2027 because of the CO₂ price?', a: `Not under what the Bundestag passed on 15 October 2026: the corridor for 2027 is to stay at €${EN.num(k27.min)} to €${EN.num(k27.max)} per tonne, as in 2026. The Bundesrat stage and promulgation are still pending, so it is not law yet. From ${C.ets2_start} the EU emissions trading system for buildings is due to start, with no fixed price. At ${EN.eur(s1)} per tonne it would be ${EN.num(ct1, 2)} ct per kWh, as a scenario, not a forecast.` },
      { q: 'How do the cubic metres on a German gas meter become kWh?', a: 'The meter measures volume in cubic metres. The supplier converts it into kilowatt hours with two values printed on the bill: the correction factor (Zustandszahl), which allows for pressure and temperature at the meter, and the calorific value (Brennwert) of the gas delivered. Cubic metres times correction factor times calorific value gives the kWh billed. Both values shift slightly from bill to bill, so the kWh figure is the one to compare.' },
    ],
    body: (h) => `
<h2>What households paid in the first half of 2026</h2>
<p>Since 2020 the ${h.src('destatisPreise', 'Federal Statistical Office (Destatis)')} has collected suppliers’ sales prices and published an average for each half year. It includes standing or capacity charge, unit price, network charges, taxes, levies and surcharges, and covers existing customers as well as new contracts. For the first half of 2026 it is ${h.num(Pr.gas_ct, 2)} ct per kWh. The statistics define usage bands in gigajoules; converted, 20 gigajoules are about ${h.num(klein)} kWh and 200 gigajoules about ${h.num(gross)} kWh.</p>
${h.table(['Use a year', 'Price per kWh', 'Example', 'Cost a year'], [
  [`below about ${h.num(klein)} kWh`, `${h.num(Pr.gas_unter_20gj_ct, 2)} ct`, `flat, ${h.num(fW)} kWh`, h.eur(kW)],
  ['all households, average', `${h.num(Pr.gas_ct, 2)} ct`, `detached house, ${h.num(fH)} kWh`, h.eur(kH)],
  [`above about ${h.num(gross)} kWh`, `${h.num(Pr.gas_ueber_200gj_ct, 2)} ct`, `large old house, ${h.num(fA)} kWh`, h.eur(kA)],
], 'Destatis, press release no. 345 of 30 September 2026, first half of 2026', ['l', 'r', 'l', 'r'])}
<p>The difference between small and large users comes mainly from the standing charge, which is due regardless of volume. For a flat with a gas wall heater it is a large part of the bill, for a big old house a small one. Compared with the second half of 2025, Destatis reports lower prices in every band and names the abolition of the gas storage levy as a reason. If you are new to Germany: suppliers usually set a monthly instalment (Abschlag) and settle the difference in an annual bill, so a price change shows up fully only on the annual bill.</p>

<h2>Where the kilowatt hours on the bill come from</h2>
<p>The meter counts cubic metres. The bill shows kilowatt hours, converted with the correction factor and the calorific value. The gross calorific value includes the heat in the water vapour of the flue gas. A condensing boiler recovers part of it, an old non-condensing boiler hardly any. So in no house does every billed kilowatt hour reach the radiator as heat. For comparisons this site uses a boiler efficiency of ${h.pct(P.annahmen.nutzungsgrad_kessel)} relative to the net calorific value. What one kWh of heat from gas costs next to oil and a heat pump is shown under ${h.a('heizkosten-vergleich', 'heating costs compared')}.</p>

<h2>The CO₂ share of the gas price</h2>
<p>Since 2021 companies that put natural gas on the market have had to acquire certificates under the Fuel Emissions Trading Act for the CO₂ it releases when burned, and they pass the cost on in the price. For 2026, ${h.src('behg10', 'section 10 of the Act')} sets a price corridor of ${h.eur(C.korridor_2026.min)} to ${h.eur(C.korridor_2026.max)} per tonne. According to the ${h.src('dehst', 'German Emissions Trading Authority')}, auctions have averaged ${h.eur(C.auktion_2026_durchschnitt)} so far. With the emission factor from ${h.src('ebev', 'EBeV 2030')}, one billed kWh of gas releases ${h.num(kgJeKwhGas, 3)} kg of CO₂.</p>
${h.table(['CO₂ price per tonne', 'Status', 'ct per kWh incl. VAT', `House using ${h.num(fH)} kWh a year`], [
  [h.eur(C.korridor_2026.min), 'bottom of the 2026 corridor', h.num(co2ctMin, 2), h.eur(co2Kosten('gas', fH, C.korridor_2026.min))],
  [h.eur(C.auktion_2026_durchschnitt), '2026 auction average', h.num(co2ct, 2), h.eur(co2H)],
  [`${h.eur(k27.min)} to ${h.eur(k27.max)}`, '2027: passed, not yet promulgated', `${h.num(aufschlagCent('gas', k27.min), 2)} to ${h.num(aufschlagCent('gas', k27.max), 2)}`, `${h.eur(co2Kosten('gas', fH, k27.min))} to ${h.eur(co2Kosten('gas', fH, k27.max))}`],
  [h.eur(s1), `scenario from ${C.ets2_start}, no official value`, h.num(ct1, 2), h.eur(co2Kosten('gas', fH, s1))],
  [h.eur(s2), `scenario from ${C.ets2_start}, no official value`, h.num(ct2, 2), h.eur(co2Kosten('gas', fH, s2))],
], `Calculated with the EBeV 2030 emission factor and ${h.pct(C.mwst)} VAT`, ['r', 'l', 'r', 'r'])}
<p>At today’s average, the CO₂ price is about ${h.pct(anteil)} of the average gas price. For 2027 the ${h.src('btBehg', 'Bundestag')} passed the same corridor on ${h.date(C.korridor_2027_beschlossen.bundestag)}; the Bundesrat stage and promulgation are pending. From ${C.ets2_start} the ${h.src('ets2', 'EU emissions trading system ETS2')} is due to replace the national price. It has no fixed price, only a threshold above which extra allowances are released. The scenarios at ${h.eur(s1)} and ${h.eur(s2)} per tonne would cost the example house ${h.eur(plus1)} and ${h.eur(plus2)} a year more than today. More under ${h.a('co2-preis-2027', 'CO₂ price 2027')}.</p>
<!--mini:co2jahr-->

<h2>What the gas price means for choosing a heating system</h2>
<p>The example house using ${h.num(fH)} kWh of gas a year would need about ${h.num(wpH.menge)} kWh of electricity with an air-source heat pump at the performance factor measured in existing buildings. On a heat pump tariff that costs ${h.eur(wpH.kosten)} instead of ${h.eur(kH)} for gas. The gap depends on the gas, electricity and CO₂ prices, all of which move. If you install a new gas boiler today, section 43 of the Building Modernisation Act also requires a share of low-carbon fuels such as biomethane: ${h.pct(B[0].anteil)} from ${jahr(B[0].ab)}, ${h.pct(B[1].anteil)} from ${jahr(B[1].ab)}, ${h.pct(B[3].anteil)} from ${jahr(B[3].ab)}. These gases cost more than natural gas; what that means for the price is open. Details under ${h.a('gasheizung-verbot', 'gas boiler ban')}, the comparison including purchase under ${h.a('waermepumpe-oder-gasheizung', 'heat pump or gas boiler')}.</p>

<h2>Gas price in a rented flat</h2>
<p>Tenants pay for gas through the heating cost statement or directly to the supplier if they have their own gas wall heater. Tenant and landlord share the CO₂ part under the CO₂ Cost Allocation Act in ${h.num(P.aufteilung.stufen.length)} tiers, depending on the building’s CO₂ emissions per square metre. Your share is worked out under ${h.a('co2-kostenaufteilung', 'CO₂ cost split')}, the yearly CO₂ cost for any consumption with the ${h.a('co2-steuer', 'CO₂ tax calculator')}.</p>`,
  },
});

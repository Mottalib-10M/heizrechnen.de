import { defineGuide } from '../../lib/guide-types';
import { co2Kg, co2Kosten, aufschlagCent, kgJeLiterOel, preisJahr } from '../../lib/engine/co2';
import { P, DE, EN } from '../../lib/fmt';

/**
 * CO2 Preis Heizöl: Aufschlag je Liter für jedes Jahr seit Beginn der Bepreisung 2021, Anteil am Literpreis
 * (Weekly Oil Bulletin) und was auf der Rechnung steht (§§ 3, 4 CO2KostAufG). Beispiel: eine Tankfüllung von 3.000 Litern.
 */
const C = P.co2;
const Pr = P.preise;
const jetzt = C.auktion_2026_durchschnitt;
const k26 = C.korridor_2026;
const k27 = C.korridor_2027_beschlossen;
const mitte26 = (k26.min + k26.max) / 2;
const erst = C.preise_fest[0];
const p25 = C.preise_fest[4];
const tank = 3000;
const tankJetzt = co2Kosten('oel', tank, jetzt);
const tankRechnung = co2Kosten('oel', tank, mitte26);
const tank21 = co2Kosten('oel', tank, erst.preis);
const tank25 = co2Kosten('oel', tank, p25.preis);
const ctJetzt = aufschlagCent('oel', jetzt);
const ctNettoJetzt = aufschlagCent('oel', jetzt, false);
const ct21 = aufschlagCent('oel', erst.preis);
const ctRechnung = aufschlagCent('oel', mitte26);
const anteilAktuell = ctJetzt / Pr.oel_eur_100l_aktuell;
const anteil12 = ctJetzt / Pr.oel_eur_100l_12monate;
const anteil25 = aufschlagCent('oel', p25.preis) / Pr.oel_eur_100l_2025;
const kg1000 = co2Kg('oel', 1000);
const jahre = [2021, 2022, 2023, 2024, 2025, 2026, 2027];
const kgb = P.foerderung.kgb_stufen[0].satz;
const haus = 2000;
const bisher = [...C.preise_fest.map((f) => ({ jahr: f.jahr, preis: f.preis })), { jahr: 2026, preis: jetzt }];
let laufend = 0;
const summe = bisher.map((x) => { const e = co2Kosten('oel', haus, x.preis); laufend += e; return { ...x, euro: e, summe: laufend }; });
const gesamt = laufend;
const zeile = (j: number, h: { eur: (n: number) => string; num: (n: number, d?: number) => string }, bis: string, hinweis: string) => {
  const p = preisJahr(j);
  const r = (f: (x: number) => string) => (p.min === p.max ? f(p.min) : `${f(p.min)} ${bis} ${f(p.max)}`);
  return [
    String(j) + (p.status === 'beschlossen' ? hinweis : ''),
    r((x) => h.eur(x)),
    r((x) => h.num(aufschlagCent('oel', x, false), 1)),
    r((x) => h.num(aufschlagCent('oel', x), 1)),
    r((x) => h.eur(co2Kosten('oel', 1000, x))),
  ];
};

export default defineGuide({
  id: 'co2-preis-heizoel',
  group: 'co2',
  order: 127,
  mini: 'co2oel',
  miniHref: 'co2-steuer',
  related: ['co2-steuer', 'co2-preis-2027', 'oelheizung-verbot', 'co2-kostenaufteilung', 'klimageschwindigkeitsbonus', 'heizkosten-vergleich'],
  sources: ['behg10', 'ebev', 'co2kostaufg', 'wob', 'dehst', 'btBehg'],
  de: {
    slug: 'co2-preis-heizoel',
    nav: 'CO₂-Preis Heizöl',
    card: 'Wie viele Cent CO₂-Preis in jedem Liter Heizöl stecken, Jahr für Jahr seit 2021, und welcher Wert auf der Rechnung steht.',
    title: 'CO2 Preis Heizöl 2026: Cent je Liter von 2021 bis 2027',
    description: `CO2 Preis Heizöl 2026: ${DE.num(ctJetzt, 1)} Cent je Liter mit Mehrwertsteuer, ${DE.eur(co2Kosten('oel', 1000, jetzt))} je 1.000 Liter. Tabelle aller Jahre seit 2021, Ihre Rechnung und der Anteil am Ölpreis.`,
    h1: 'CO2 Preis Heizöl: was jeder Liter kostet',
    intro: 'Seit 2021 trägt jeder Liter Heizöl einen CO₂-Aufschlag. Hier stehen die Cent je Liter für jedes Jahr bis 2027, nachgerechnet mit den amtlichen Standardwerten.',
    resume: `Der CO₂-Preis auf Heizöl ergibt sich aus dem Zertifikatepreis nach dem BEHG und dem amtlichen Emissionswert: Ein Liter Heizöl EL verursacht ${DE.num(kgJeLiterOel, 2)} kg CO₂. Beim Durchschnitt der Versteigerungen 2026 von ${DE.eur(jetzt)} je Tonne sind das ${DE.num(ctNettoJetzt, 1)} Cent je Liter ohne und ${DE.num(ctJetzt, 1)} Cent mit Mehrwertsteuer. ${erst.jahr}, im ersten Jahr der Bepreisung, waren es ${DE.num(ct21, 1)} Cent. Bei einem Literpreis von ${DE.num(Pr.oel_eur_100l_aktuell, 2)} € je 100 Liter im Oktober 2026 macht der CO₂-Preis damit rund ${DE.pct(anteilAktuell)} des Preises aus. Eine Tankfüllung von ${DE.num(tank)} Litern trägt ${DE.eur(tankJetzt)} CO₂-Kosten, ${erst.jahr} waren es ${DE.eur(tank21)}. Auf der Rechnung steht 2026 ein etwas kleinerer Betrag, ${DE.eur(tankRechnung)}, weil das Gesetz dafür die Mitte des Korridors von ${DE.eur(mitte26)} vorschreibt. Für 2027 hat der Bundestag denselben Korridor beschlossen, das Gesetz ist aber noch nicht verkündet und gilt deshalb nicht.`,
    faqs: [
      { q: `Warum steht auf meiner Heizölrechnung 2026 ein CO₂-Preis von ${DE.eur(mitte26)}?`, a: `Weil § 4 CO2KostAufG das so vorgibt: Für Lieferungen im Jahr 2026 ist der Mittelwert des Korridors maßgeblich, ${DE.eur(mitte26)} je Tonne. Mit diesem Wert weist der Lieferant den CO₂-Anteil aus, das sind ${DE.num(ctRechnung, 1)} Cent je Liter mit Mehrwertsteuer. Die Versteigerungen lagen 2026 im Schnitt höher, bei ${DE.eur(jetzt)}. Was der Händler tatsächlich einpreist, bestimmt er selbst.` },
      { q: 'Lohnt es sich, den Öltank noch 2026 zu füllen?', a: `Wegen des CO₂-Preises kaum. Kommt der vom Bundestag beschlossene Korridor, bleibt der Preis 2027 bei ${DE.eur(k27.min)} bis ${DE.eur(k27.max)} je Tonne wie 2026. Für ${DE.num(tank)} Liter macht selbst die ganze Spanne nur ${DE.eur(co2Kosten('oel', tank, k27.max) - co2Kosten('oel', tank, k27.min))} aus. Der Ölpreis selbst schwankt viel stärker: Im Oktober 2026 lag er um ${DE.pct(Pr.oel_eur_100l_aktuell / Pr.oel_eur_100l_12monate - 1)} über dem Schnitt der letzten zwölf Monate.` },
      { q: 'Ich wohne zur Miete und kaufe mein Heizöl selbst: bekomme ich CO₂-Kosten zurück?', a: 'Ja, den Anteil des Vermieters. Nach § 6 Abs. 2 CO2KostAufG muss er ihn erstatten, wenn Sie sich selbst mit Wärme versorgen. Sie machen den Anspruch in Textform geltend, innerhalb von zwölf Monaten, nachdem der Lieferant abgerechnet hat. Wie hoch der Anteil ist, hängt vom Ausstoß je Quadratmeter Wohnfläche ab. Die Kilogramm CO₂ dafür stehen auf der Rechnung des Händlers.' },
      { q: 'Wie viel CO₂-Preis hat eine Ölheizung seit 2021 insgesamt gekostet?', a: `Bei ${DE.num(haus)} Litern im Jahr zusammen rund ${DE.eur(gesamt)} von 2021 bis 2026, mit Mehrwertsteuer und für 2026 mit dem Durchschnitt der Versteigerungen gerechnet. Im ersten Jahr waren es ${DE.eur(summe[0].euro)}, 2026 sind es ${DE.eur(summe[summe.length - 1].euro)}. Wer mehr verbraucht, rechnet anteilig hoch. Die Jahresbeträge stehen in der Tabelle oben, den eigenen Verbrauch rechnet der CO₂-Rechner.` },
      { q: 'Wie viel CO₂ entsteht beim Verbrennen von 1.000 Litern Heizöl?', a: `Nach den Standardwerten der EBeV 2030 rund ${DE.num(kg1000)} kg, also gut ${DE.num(kg1000 / 1000, 1)} Tonnen. Ein Haus mit ${DE.num(tank)} Litern im Jahr kommt so auf etwa ${DE.num(co2Kg('oel', tank) / 1000, 1)} Tonnen. Für Heizöl gibt es keinen eigenen Faktor je Händler: Die Rechnung muss nach § 3 CO2KostAufG die amtlichen Standardwerte des Lieferjahres verwenden, die Zahl ist also überall gleich.` },
    ],
    body: (h) => `
<h2>Aufschlag je Liter seit 2021</h2>
<p>Der CO₂-Preis auf Heizöl wird nicht an der Tankstelle oder vom Händler frei festgelegt, er folgt aus zwei amtlichen Werten. Der erste ist der Preis je Tonne nach ${h.src('behg10', '§ 10 BEHG')}: bis 2025 ein Festpreis, seit 2026 das Ergebnis von Versteigerungen in einem Korridor. Der zweite ist die Menge CO₂ je Liter aus der ${h.src('ebev', 'EBeV 2030')}. Multipliziert ergibt das den Aufschlag, den die Lieferanten in den Literpreis einrechnen dürfen.</p>
${h.table(['Jahr', 'Preis je Tonne', 'ct/l ohne MwSt.', 'ct/l mit MwSt.', 'je 1.000 l'], jahre.map((j) => zeile(j, h, 'bis', ' (beschlossen, nicht verkündet)')), 'CO₂-Aufschlag auf Heizöl EL, eigene Berechnung', ['l', 'r', 'r', 'r', 'r'])}
<p>Wer im Netz nach dem CO₂-Preis für Heizöl sucht, landet oft auf Seiten aus 2019 oder 2020. Sie beschreiben die Pläne vor dem Start, die Berichtspflicht galt aber erst für das Kalenderjahr 2021. Die Preise von 2024 bis 2026 und die Versteigerungen fehlen dort ganz. Seit 2021 hat sich der Aufschlag mehr als verdoppelt: von ${h.num(ct21, 1)} auf ${h.num(ctJetzt, 1)} Cent je Liter.</p>

<h2>Was ein Haus seit 2021 bezahlt hat</h2>
<p>Ein Haus mit ${h.num(haus)} Litern im Jahr hat die Bepreisung von Anfang an mitgetragen. Gesunken sind die Beträge nie, weil der Preis je Tonne nie gesenkt wurde. 2026 ist mit dem Durchschnitt der Versteigerungen gerechnet, die Rechnung zeigt etwas weniger.</p>
${h.table(['Jahr', 'Preis je Tonne', 'CO₂-Kosten', 'Summe seit 2021'], summe.map((x) => [String(x.jahr), h.eur(x.preis), h.eur(x.euro), h.eur(x.summe)]), `Heizöl ${h.num(haus)} Liter im Jahr, mit Mehrwertsteuer`, ['l', 'r', 'r', 'r'])}
<p>Zusammen sind das ${h.eur(gesamt)} in sechs Jahren. Bei gleichem Verbrauch kämen 2027 im beschlossenen Korridor noch einmal ${h.eur(co2Kosten('oel', haus, k27.min))} bis ${h.eur(co2Kosten('oel', haus, k27.max))} dazu.</p>

<h2>Woher die ${h.num(kgJeLiterOel, 2)} kg CO₂ je Liter kommen</h2>
<p>Die Verordnung legt für Heizöl EL drei Werte fest: eine Dichte von ${h.num(C.oel_dichte_t_je_1000l, 3)} Tonnen je ${h.num(1000)} Liter, einen Heizwert von ${h.num(C.oel_hu_gj_je_t, 1)} Gigajoule je Tonne und einen Emissionsfaktor von ${h.num(C.oel_ef_t_je_gj, 3)} Tonnen CO₂ je Gigajoule. Das Produkt ist die Menge CO₂ je Liter. Eine Tabelle der Behörden mit fertigen Cent-Beträgen je Liter haben wir nicht gefunden: Die Zahlen auf dieser Seite sind unsere eigene Rechnung mit diesen Werten, auf eine Nachkommastelle gerundet.</p>
<p>Auf den Betrag kommen ${h.pct(C.mwst)} Mehrwertsteuer, weil sie auf den ganzen Literpreis anfällt. Das CO2KostAufG verlangt ausdrücklich, den CO₂-Anteil auf der Rechnung einschließlich Umsatzsteuer auszuweisen.</p>

<h2>Wie viel vom Literpreis ist CO₂-Preis</h2>
<p>Das ${h.src('wob', 'Weekly Oil Bulletin')} der EU-Kommission meldet für Deutschland am ${h.date(Pr.oel_stand_aktuell)} ${h.num(Pr.oel_eur_100l_aktuell, 2)} € je 100 Liter, im Schnitt der letzten zwölf Monate ${h.num(Pr.oel_eur_100l_12monate, 2)} €. Darin stecken die ${h.num(ctJetzt, 1)} Cent CO₂-Preis.</p>
${h.table(['Zeitraum', 'Heizöl je 100 l', 'CO₂-Preis je Tonne', 'Anteil CO₂'], [
  ['2025', h.eur(Pr.oel_eur_100l_2025), h.eur(p25.preis), h.pct(anteil25)],
  ['letzte 12 Monate', h.eur(Pr.oel_eur_100l_12monate), h.eur(jetzt), h.pct(anteil12)],
  [h.date(Pr.oel_stand_aktuell), h.eur(Pr.oel_eur_100l_aktuell), h.eur(jetzt), h.pct(anteilAktuell)],
], 'Heizölpreis mit Steuern, Weekly Oil Bulletin; CO₂-Anteil eigene Berechnung', ['l', 'r', 'r', 'r'])}
<p>Der CO₂-Anteil ist also über das Jahr fast gleich geblieben, schwankt aber prozentual, weil der Ölpreis 2026 stark gestiegen ist. Für die Heizkosten zählt beides zusammen, wie der ${h.a('heizkosten-vergleich', 'Heizkostenvergleich')} zeigt.</p>

<h2>Rechnung, Liefertermin und Tank</h2>
<p>Pflichtig nach dem BEHG ist der Händler, und zwar für die Brennstoffe, die er in einem Kalenderjahr in Verkehr bringt. Deshalb zählt das Jahr der Lieferung, nicht das Jahr, in dem Sie das Öl verbrennen. Ein Tank, der im Herbst 2025 gefüllt wurde, trägt den Preis von 2025, ${h.eur(tank25)} für ${h.num(tank)} Liter.</p>
<p>Nach § 3 ${h.src('co2kostaufg', 'CO2KostAufG')} muss die Rechnung die Kilogramm CO₂, den Emissionsfaktor je Kilowattstunde, den Energiegehalt und den CO₂-Preisbestandteil zum Zeitpunkt der Lieferung zeigen. Für 2026 schreibt § 4 dafür die Mitte des Korridors vor, ${h.eur(mitte26)}. Ab 2027 gilt der Durchschnitt der Versteigerungen vom 1. Juli bis 30. November des Vorjahres. Der Bericht der ${h.src('dehst', 'DEHSt')} vom August 2026 nennt bisher ${h.eur(jetzt)}.</p>
<!--mini:oelweiter-->

<h2>2027 und danach</h2>
<p>Für 2027 hat der Bundestag am ${h.date(k27.bundestag)} beschlossen, den Korridor von ${h.eur(k27.min)} bis ${h.eur(k27.max)} fortzuschreiben (${h.src('btBehg', 'Bundestag')}). Verkündet ist das Gesetz noch nicht. Ab ${C.ets2_start} soll das europäische ETS2 den deutschen Preis ablösen, einen festen Wert dafür gibt es nicht. Die beiden Regeln für 2027 und Szenarien für die Zeit danach stehen unter ${h.a('co2-preis-2027', 'CO₂-Preis 2027')}, den eigenen Jahresverbrauch rechnet der ${h.a('co2-steuer', 'CO₂-Rechner')}.</p>
<p>Eine alte Ölheizung muss nicht raus, mehr dazu unter ${h.a('oelheizung-verbot', 'Ölheizung Verbot')}. Wer sie ersetzt und selbst im Haus wohnt, bekommt bei Öl den ${h.a('klimageschwindigkeitsbonus', 'Klimageschwindigkeitsbonus')} von derzeit ${h.pct(kgb)} unabhängig vom Alter des Kessels. In Mietshäusern hängt der Anteil des Vermieters am CO₂-Preis vom Ausstoß je Quadratmeter ab: ${h.a('co2-kostenaufteilung', 'CO₂-Kostenaufteilung')}.</p>`,
  },
  en: {
    slug: 'co2-price-heating-oil',
    nav: 'CO₂ price for heating oil',
    card: 'How many cents of CO₂ price each litre of heating oil carries, year by year since 2021, and what your bill shows.',
    title: 'CO2 Price Heating Oil 2026: Cents per Litre, 2021 to 2027',
    description: `CO2 price on heating oil in Germany 2026: ${EN.num(ctJetzt, 1)} cents a litre with VAT, ${EN.eur(co2Kosten('oel', 1000, jetzt))} per 1,000 litres. Every year since 2021, your bill and the oil price share.`,
    h1: 'CO2 price on heating oil: what each litre carries',
    intro: 'Since 2021 every litre of heating oil sold in Germany has carried a CO₂ surcharge. Here are the cents per litre for each year to 2027, worked out from the official default values.',
    resume: `The CO₂ price on heating oil in Germany comes from the certificate price under the Fuel Emissions Trading Act (BEHG) and the official emission value: one litre of light heating oil releases ${EN.num(kgJeLiterOel, 2)} kg of CO₂. At the 2026 auction average of ${EN.eur(jetzt)} a tonne, that is ${EN.num(ctNettoJetzt, 1)} cents a litre before VAT and ${EN.num(ctJetzt, 1)} cents with it. In ${erst.jahr}, the first year of carbon pricing, it was ${EN.num(ct21, 1)} cents. With heating oil at €${EN.num(Pr.oel_eur_100l_aktuell, 2)} per 100 litres in October 2026, the CO₂ price makes up about ${EN.pct(anteilAktuell)} of the price. A ${EN.num(tank)}-litre tank fill carries ${EN.eur(tankJetzt)} of CO₂ cost, against ${EN.eur(tank21)} in ${erst.jahr}. Your 2026 invoice shows a slightly smaller amount, ${EN.eur(tankRechnung)}, because the law prescribes the middle of the corridor, ${EN.eur(mitte26)}, for bills. For 2027 the Bundestag has passed the same corridor; the law is not yet published.`,
    faqs: [
      { q: `Why does my 2026 heating oil invoice show a CO₂ price of ${EN.eur(mitte26)}?`, a: `Because section 4 of the CO₂ Cost Allocation Act says so: for deliveries in 2026, the middle of the corridor applies, ${EN.eur(mitte26)} a tonne. The supplier uses that figure to state the CO₂ share, ${EN.num(ctRechnung, 1)} cents a litre including VAT. The 2026 auctions averaged more, ${EN.eur(jetzt)}. What the dealer actually builds into the price is up to the dealer.` },
      { q: 'Is it worth filling the oil tank before 2027?', a: `Hardly, as far as the CO₂ price goes. If the corridor the Bundestag passed goes through, the 2027 price stays at ${EN.eur(k27.min)} to ${EN.eur(k27.max)} a tonne, as in 2026. For ${EN.num(tank)} litres even the full range is only ${EN.eur(co2Kosten('oel', tank, k27.max) - co2Kosten('oel', tank, k27.min))}. The oil price itself moves far more: in October 2026 it stood ${EN.pct(Pr.oel_eur_100l_aktuell / Pr.oel_eur_100l_12monate - 1)} above the twelve-month average.` },
      { q: 'I rent and buy my own heating oil: can I claim CO₂ costs back?', a: 'Yes, the landlord’s share. Under section 6(2) of the CO₂ Cost Allocation Act, the landlord must refund it when you supply your own heating. Claim it in text form (a letter or e-mail) within twelve months of the supplier’s invoice. The share depends on emissions per square metre of living space. The kilograms of CO₂ you need are printed on the dealer’s invoice.' },
      { q: 'How much has the CO₂ price cost an oil-heated house since 2021?', a: `At ${EN.num(haus)} litres a year, about ${EN.eur(gesamt)} in total from 2021 to 2026, including VAT and using the auction average for 2026. The first year cost ${EN.eur(summe[0].euro)}, 2026 costs ${EN.eur(summe[summe.length - 1].euro)}. If you burn more, scale it up in proportion. The yearly amounts are in the table above, and the CO₂ calculator handles your own figure.` },
      { q: 'How much CO₂ do 1,000 litres of heating oil release?', a: `About ${EN.num(kg1000)} kg under the EBeV 2030 default values, so just over ${EN.num(kg1000 / 1000, 1)} tonnes. A house burning ${EN.num(tank)} litres a year comes to about ${EN.num(co2Kg('oel', tank) / 1000, 1)} tonnes. There is no dealer-specific factor: section 3 of the CO₂ Cost Allocation Act makes invoices use the official default values for the delivery year, so the figure is the same everywhere.` },
    ],
    body: (h) => `
<h2>Surcharge per litre since 2021</h2>
<p>The CO₂ price on heating oil is not something a dealer sets freely. It follows from two official values. The first is the price per tonne under ${h.src('behg10', 'section 10 BEHG')}: a fixed price until 2025, since 2026 the result of auctions within a corridor. The second is the amount of CO₂ per litre from the ${h.src('ebev', 'EBeV 2030 regulation')}. Multiplied together they give the surcharge that suppliers build into the price per litre.</p>
${h.table(['Year', 'Price per tonne', 'ct/l before VAT', 'ct/l with VAT', 'per 1,000 l'], jahre.map((j) => zeile(j, h, 'to', ' (passed, not yet law)')), 'CO₂ surcharge on light heating oil, our own calculation', ['l', 'r', 'r', 'r', 'r'])}
<p>Search for the CO₂ price on heating oil and you often land on pages from 2019 or 2020. They describe the plans before the start, yet reporting only began with calendar year 2021. The prices for 2024 to 2026 and the auctions are missing there altogether. Since 2021 the surcharge has more than doubled, from ${h.num(ct21, 1)} to ${h.num(ctJetzt, 1)} cents a litre.</p>

<h2>What a house has paid since 2021</h2>
<p>A house burning ${h.num(haus)} litres a year has carried the carbon price from day one. The amounts have never fallen, because the price per tonne has never been cut. 2026 uses the auction average; the invoice shows a little less.</p>
${h.table(['Year', 'Price per tonne', 'CO₂ cost', 'Total since 2021'], summe.map((x) => [String(x.jahr), h.eur(x.preis), h.eur(x.euro), h.eur(x.summe)]), `Heating oil ${h.num(haus)} litres a year, including VAT`, ['l', 'r', 'r', 'r'])}
<p>That adds up to ${h.eur(gesamt)} over six years. With the same consumption, 2027 would add another ${h.eur(co2Kosten('oel', haus, k27.min))} to ${h.eur(co2Kosten('oel', haus, k27.max))} within the corridor that has been passed.</p>

<h2>Where the ${h.num(kgJeLiterOel, 2)} kg of CO₂ per litre comes from</h2>
<p>The regulation sets three values for light heating oil: a density of ${h.num(C.oel_dichte_t_je_1000l, 3)} tonnes per ${h.num(1000)} litres, a net calorific value of ${h.num(C.oel_hu_gj_je_t, 1)} gigajoules per tonne and an emission factor of ${h.num(C.oel_ef_t_je_gj, 3)} tonnes of CO₂ per gigajoule. Their product is the CO₂ per litre. We found no official table giving ready-made cents per litre, so the figures here are our own calculation from those values, rounded to one decimal.</p>
<p>VAT at ${h.pct(C.mwst)} is added, because it applies to the whole price per litre. The CO₂ Cost Allocation Act expressly requires the CO₂ share on the invoice to include VAT.</p>

<h2>How much of the oil price is carbon price</h2>
<p>The European Commission’s ${h.src('wob', 'Weekly Oil Bulletin')} reports €${h.num(Pr.oel_eur_100l_aktuell, 2)} per 100 litres for Germany on ${h.date(Pr.oel_stand_aktuell)}, and €${h.num(Pr.oel_eur_100l_12monate, 2)} on average over the last twelve months. Both include the ${h.num(ctJetzt, 1)} cents of CO₂ price.</p>
${h.table(['Period', 'Oil per 100 l', 'CO₂ price per tonne', 'CO₂ share'], [
  ['2025', h.eur(Pr.oel_eur_100l_2025), h.eur(p25.preis), h.pct(anteil25)],
  ['last 12 months', h.eur(Pr.oel_eur_100l_12monate), h.eur(jetzt), h.pct(anteil12)],
  [h.date(Pr.oel_stand_aktuell), h.eur(Pr.oel_eur_100l_aktuell), h.eur(jetzt), h.pct(anteilAktuell)],
], 'Heating oil price with taxes, Weekly Oil Bulletin; CO₂ share our own calculation', ['l', 'r', 'r', 'r'])}
<p>So the CO₂ amount barely moved over the year, but its percentage swings because oil itself rose sharply in 2026. Your heating bill depends on both, as the ${h.a('heizkosten-vergleich', 'heating cost comparison')} shows.</p>

<h2>Invoice, delivery date and your tank</h2>
<p>The BEHG puts the duty on the dealer, for the fuel it brings onto the market in a calendar year. That is why the delivery year counts, not the year you burn the oil. A tank filled in autumn 2025 carries the 2025 price, ${h.eur(tank25)} for ${h.num(tank)} litres. If you buy a house in Germany with oil left in the tank, the seller paid that surcharge.</p>
<p>Under section 3 of the ${h.src('co2kostaufg', 'CO₂ Cost Allocation Act')}, the invoice, in German, must list the kilograms of CO₂, the emission factor per kWh, the energy content and the CO₂ price component at the time of delivery. For 2026, section 4 prescribes the middle of the corridor, ${h.eur(mitte26)}. From 2027 the average of auctions from 1 July to 30 November of the previous year applies. The ${h.src('dehst', 'German Emissions Trading Authority')} reported ${h.eur(jetzt)} in August 2026.</p>
<!--mini:oelweiter-->

<h2>2027 and beyond</h2>
<p>For 2027 the Bundestag decided on ${h.date(k27.bundestag)} to carry forward the corridor of ${h.eur(k27.min)} to ${h.eur(k27.max)} (${h.src('btBehg', 'Bundestag')}). The law is not yet published. From ${C.ets2_start} the EU ETS2 is due to replace the German price, and no fixed figure exists for it. Both rules for 2027 and scenarios for later years are under ${h.a('co2-preis-2027', 'CO₂ price 2027')}, and the ${h.a('co2-steuer', 'CO₂ calculator')} works out your own yearly use.</p>
<p>An old oil boiler does not have to go; see ${h.a('oelheizung-verbot', 'oil heating ban')}. If you replace it and live in the house as your main residence, oil qualifies for the ${h.a('klimageschwindigkeitsbonus', 'climate speed bonus')}, currently ${h.pct(kgb)}, whatever the boiler’s age. In rented buildings the landlord’s share of the CO₂ price depends on emissions per square metre: ${h.a('co2-kostenaufteilung', 'CO₂ cost split')}.</p>`,
  },
});

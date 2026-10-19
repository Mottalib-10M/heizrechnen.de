import { defineGuide } from '../../lib/guide-types';
import { co2Kg, co2Kosten, aufschlagCent, preisJahr } from '../../lib/engine/co2';
import { P, DE, EN } from '../../lib/fmt';

/**
 * CO2 Steuer: was der Zertifikatepreis nach dem BEHG einen Haushalt mit Gas oder Heizöl im Jahr kostet.
 * Beispiele = Voreinstellungen des Rechners (20.000 kWh Gas, 2.000 Liter Öl), dazu 1.000 kg Flüssiggas.
 */
const C = P.co2;
const jetzt = C.auktion_2026_durchschnitt;
const k26 = C.korridor_2026;
const k27 = C.korridor_2027_beschlossen;
const mitte26 = (k26.min + k26.max) / 2;
const erst = C.preise_fest[0];
const oelL = 2000;
const gasK = 20000;
const oelJetzt = co2Kosten('oel', oelL, jetzt);
const gasJetzt = co2Kosten('gas', gasK, jetzt);
const oel21 = co2Kosten('oel', oelL, erst.preis);
const gas21 = co2Kosten('gas', gasK, erst.preis);
const ctOel = aufschlagCent('oel', jetzt);
const ctGas = aufschlagCent('gas', jetzt);
const lpg = co2Kosten('fluessiggas', 1000, jetzt);
const lpgT = co2Kg('fluessiggas', 1000) / 1000;
const lpg21 = co2Kosten('fluessiggas', 1000, erst.preis);
const jahre = [2021, 2022, 2023, 2024, 2025, 2026, 2027];
const stufen = P.aufteilung.stufen;
const vermieterMax = 1 - stufen[stufen.length - 1].mieter;

type Fm = { eur: (n: number) => string };
const preisText = (j: number, f: Fm, bis: string) => {
  const p = preisJahr(j);
  return p.min === p.max ? f.eur(p.min) : `${f.eur(p.min)} ${bis} ${f.eur(p.max)}`;
};
const kostenText = (j: number, stoff: 'oel' | 'gas', menge: number, f: Fm, bis: string) => {
  const p = preisJahr(j);
  const a = co2Kosten(stoff, menge, p.min), b = co2Kosten(stoff, menge, p.max);
  return p.min === p.max ? f.eur(a) : `${f.eur(a)} ${bis} ${f.eur(b)}`;
};

export default defineGuide({
  id: 'co2-steuer',
  group: 'co2',
  order: 104,
  tool: 'co2',
  related: ['co2-preis-2027', 'co2-preis-heizoel', 'co2-kostenaufteilung', 'heizkosten-rechner', 'gaspreis', 'waermepumpe-foerderung'],
  sources: ['behg10', 'dehst', 'ebev', 'co2kostaufg', 'btBehg'],
  de: {
    slug: 'co2-steuer-heizung',
    nav: 'CO₂-Steuer',
    card: 'CO₂-Kosten Ihres Gas- oder Ölverbrauchs für jedes Jahr von 2021 bis 2027, mit Rechenweg.',
    title: 'CO2 Steuer 2026: Was Gas und Heizöl pro Jahr mehr kosten',
    description: `CO2 Steuer 2026: Versteigert wird zu ${DE.eur(jetzt)} je Tonne, mit Steuer ${DE.num(ctGas, 2)} ct je kWh Gas und ${DE.num(ctOel, 1)} ct je Liter Öl. Rechner mit Ihrem Verbrauch, Jahr für Jahr bis 2027.`,
    h1: 'CO2 Steuer 2026: Ihre CO₂-Kosten fürs Heizen',
    intro: 'Brennstoff und Jahresverbrauch eintragen: Der Rechner zeigt, wie viel CO₂ dabei entsteht und welchen Betrag der CO₂-Preis Sie in jedem Jahr seit 2021 kostet.',
    resume: `Die sogenannte CO₂-Steuer auf Erdgas und Heizöl ist rechtlich keine Steuer, sondern der Preis für Emissionszertifikate nach dem Brennstoffemissionshandelsgesetz (BEHG). Lieferanten müssen für jede Tonne CO₂ der verkauften Brennstoffe ein Zertifikat abgeben und rechnen die Kosten in den Preis ein. Von ${DE.eur(erst.preis)} je Tonne im Jahr ${erst.jahr} stieg der Festpreis auf ${DE.eur(C.preise_fest[4].preis)} im Jahr 2025. Seit 2026 werden die Zertifikate in einem Korridor von ${DE.eur(k26.min)} bis ${DE.eur(k26.max)} versteigert, im Schnitt bisher zu ${DE.eur(jetzt)}. Mit Mehrwertsteuer sind das ${DE.num(ctGas, 2)} Cent je Kilowattstunde Gas und ${DE.num(ctOel, 1)} Cent je Liter Heizöl. Ein Haus mit ${DE.num(gasK)} kWh Gas im Jahr zahlt damit ${DE.eur(gasJetzt)} CO₂-Kosten, im Jahr ${erst.jahr} waren es ${DE.eur(gas21)}. Bei ${DE.num(oelL)} Litern Heizöl sind es ${DE.eur(oelJetzt)} statt ${DE.eur(oel21)}. Für 2027 hat der Bundestag denselben Korridor beschlossen, verkündet ist das Gesetz noch nicht. Ab 2028 soll der europäische Handel ETS2 übernehmen, ohne festen Preis.`,
    faqs: [
      { q: 'Ist die CO₂-Steuer beim Heizen überhaupt eine Steuer?', a: 'Nein. Das BEHG verpflichtet die Unternehmen, die Gas oder Heizöl in Verkehr bringen, für jede Tonne CO₂ ein Zertifikat zu erwerben und bis zum 31. Juli des Folgejahres über die Emissionen zu berichten. Der Haushalt bekommt keinen Bescheid und zahlt nichts an den Staat direkt. Er zahlt den Aufschlag, den der Lieferant in den Arbeitspreis oder den Literpreis einrechnet, und darauf die Mehrwertsteuer.' },
      { q: 'Welchen CO₂-Preis trage ich in den Rechner ein?', a: `Für das laufende Jahr den Durchschnitt der Versteigerungen, ${DE.eur(jetzt)} je Tonne laut Bericht der DEHSt vom August 2026. Wer wissen will, was auf der eigenen Rechnung ausgewiesen ist, nimmt ${DE.eur(mitte26)}: Für Rechnungen des Jahres 2026 gilt nach dem CO2KostAufG die Mitte des Korridors. Für 2028 und später gibt es keinen amtlichen Wert, jede Zahl im Feld ist ein Szenario.` },
      { q: 'Wie hoch ist die CO₂-Steuer für einen Flüssiggastank?', a: `Für ${DE.num(1000)} kg Flüssiggas entstehen nach den amtlichen Standardwerten rund ${DE.num(lpgT, 1)} Tonnen CO₂. Bei ${DE.eur(jetzt)} je Tonne macht das mit Mehrwertsteuer ${DE.eur(lpg)} im Jahr, im Jahr ${erst.jahr} waren es ${DE.eur(lpg21)}. Stellen Sie im Rechner den Brennstoff auf Flüssiggas und geben Sie die Kilogramm aus der Lieferrechnung ein. Steht dort nur die Literzahl, hilft die Umrechnung des Lieferanten.` },
      { q: 'Zahlen Mieter die CO₂-Steuer allein?', a: `Nicht immer. Das CO2KostAufG teilt die Kosten nach dem Ausstoß des Hauses je Quadratmeter auf. In einem sparsamen Haus trägt der Mieter alles, in einem sehr schlechten zahlt der Vermieter bis zu ${DE.pct(vermieterMax)}. Wer selbst Gas bezieht, etwa mit einer Gasetagenheizung, holt sich den Vermieteranteil binnen zwölf Monaten nach der Rechnung zurück. Die Stufen rechnet der Rechner für die CO₂-Kostenaufteilung.` },
    ],
    body: (h) => `
<h2>Wer die CO₂-Steuer bezahlt</h2>
<p>Seit ${erst.jahr} kostet jede Tonne CO₂ aus Heizöl, Erdgas und Flüssiggas Geld. Pflichtig sind nach ${h.src('behg10', '§ 10 BEHG')} nicht die Haushalte, sondern die Unternehmen, die den Brennstoff in Verkehr bringen. Sie kaufen die Zertifikate und geben die Kosten in der Lieferkette weiter. Bis 2025 galt ein fester Preis, 2026 wird im Korridor versteigert. Laut ${h.src('dehst', 'Veräußerungsbericht der DEHSt')} lag der Zuschlag bis August im Schnitt bei ${h.eur(jetzt)}, also am oberen Rand.</p>
${h.table(['Jahr', 'Preis je Tonne', `Öl ${h.num(oelL)} l`, `Gas ${h.num(gasK)} kWh`], jahre.map((j) => [
  String(j) + (preisJahr(j).status === 'beschlossen' ? ' (beschlossen, nicht verkündet)' : ''),
  preisText(j, h, 'bis'),
  kostenText(j, 'oel', oelL, h, 'bis'),
  kostenText(j, 'gas', gasK, h, 'bis'),
]), 'CO₂-Kosten mit Mehrwertsteuer bei gleichem Verbrauch', ['l', 'r', 'r', 'r'])}
<p>Die Zeile für 2027 zeigt den Korridor, den der Bundestag am ${h.date(k27.bundestag)} beschlossen hat (${h.src('btBehg', 'Bundestag')}). Bundesrat und Verkündung stehen aus. Was bis dahin gilt und was ab 2028 mit dem ETS2 kommt, steht unter ${h.a('co2-preis-2027', 'CO₂-Preis 2027')}.</p>

<h2>So rechnet der Rechner</h2>
<p>Die Menge CO₂ ergibt sich aus den Standardwerten der ${h.src('ebev', 'EBeV 2030')}: für einen Liter Heizöl ${h.num(C.oel_dichte_t_je_1000l, 3)} kg Gewicht, ${h.num(C.oel_hu_gj_je_t, 1)} MJ je kg und ${h.num(C.oel_ef_t_je_gj, 3)} kg CO₂ je MJ. Beim Gas gehen wir von den Kilowattstunden der Rechnung aus, die auf den Brennwert bezogen sind, und rechnen mit ${h.num(C.gas_gj_je_mwh, 4)} GJ je MWh auf den Heizwert um. Diese Umrechnung ist unsere eigene Ableitung, der Verordnungstext nennt sie nicht ausdrücklich. Das Ergebnis in Tonnen mal Preis ergibt die Kosten, darauf kommen ${h.pct(C.mwst)} Mehrwertsteuer.</p>
<p>Ein Beispiel: ${h.num(oelL)} Liter Öl bei ${h.eur(jetzt)} ergeben ${h.eur(oelJetzt)}, das sind ${h.num(ctOel, 1)} Cent je Liter. Wie groß dieser Anteil am Literpreis ist, zeigt ${h.a('co2-preis-heizoel', 'CO₂-Preis Heizöl')}. Beim Gas sind es ${h.num(ctGas, 2)} Cent je kWh, verglichen mit den Durchschnittspreisen unter ${h.a('gaspreis', 'Gaspreis')}.</p>

<h2>Was auf der Rechnung stehen muss</h2>
<p>Nach § 3 ${h.src('co2kostaufg', 'CO2KostAufG')} weist der Lieferant die Emissionen in Kilogramm CO₂, den Emissionsfaktor je kWh, den Energiegehalt und den CO₂-Preisbestandteil einschließlich Umsatzsteuer aus. Für Rechnungen aus 2026 nimmt das Gesetz die Mitte des Korridors, ${h.eur(mitte26)}, ab 2027 den Schnitt der Versteigerungen vom 1. Juli bis 30. November des Vorjahres. Deshalb kann die Rechnung etwas anderes zeigen als der Rechner mit ${h.eur(jetzt)}.</p>
<!--mini:co2jahr-->

<h2>Mieter, Vermieter und der Ausweg</h2>
<p>In einer Mietwohnung teilt das Gesetz die Kosten nach Ausstoß je Quadratmeter: ${h.a('co2-kostenaufteilung', 'CO₂-Kostenaufteilung')}. Wer die Kosten dauerhaft loswerden will, braucht eine Heizung ohne fossilen Brennstoff. Den Zuschuss dafür rechnet ${h.a('waermepumpe-foerderung', 'Wärmepumpe Förderung')}, die Heizkosten danach ${h.a('heizkosten-rechner', 'Heizkosten Rechner')}.</p>`,
  },
  en: {
    slug: 'co2-tax-heating-germany',
    nav: 'CO₂ tax',
    card: 'CO₂ cost of your gas or oil use for every year from 2021 to 2027, with the workings.',
    title: 'CO2 Tax Germany 2026: What Gas and Oil Heating Costs Extra',
    description: `CO2 tax in Germany 2026: certificates sell at ${EN.eur(jetzt)} a tonne, with VAT ${EN.num(ctGas, 2)} ct per kWh of gas and ${EN.num(ctOel, 1)} ct per litre of oil. Calculator for each year to 2027.`,
    h1: 'CO2 tax on heating in Germany 2026: your cost',
    intro: 'Enter your fuel and yearly use: the calculator shows the CO₂ released and what the carbon price has cost you in each year since 2021.',
    resume: `What people call Germany’s CO₂ tax on gas and heating oil is legally not a tax but the price of emission certificates under the Fuel Emissions Trading Act (Brennstoffemissionshandelsgesetz, BEHG). Suppliers must surrender a certificate for each tonne of CO₂ in the fuel they sell and build the cost into their prices. The fixed price rose from ${EN.eur(erst.preis)} a tonne in ${erst.jahr} to ${EN.eur(C.preise_fest[4].preis)} in 2025. Since 2026 certificates are auctioned within a corridor of ${EN.eur(k26.min)} to ${EN.eur(k26.max)}, so far at ${EN.eur(jetzt)} on average. Including VAT that is ${EN.num(ctGas, 2)} cents per kWh of gas and ${EN.num(ctOel, 1)} cents per litre of heating oil. A house using ${EN.num(gasK)} kWh of gas a year pays ${EN.eur(gasJetzt)} in CO₂ cost, against ${EN.eur(gas21)} in ${erst.jahr}. With ${EN.num(oelL)} litres of oil it is ${EN.eur(oelJetzt)} instead of ${EN.eur(oel21)}. For 2027 the Bundestag has passed the same corridor, but the law is not yet published. From 2028 the EU ETS2 is due to take over, with no fixed price.`,
    faqs: [
      { q: 'Is the German CO₂ tax on heating really a tax?', a: 'No. The BEHG obliges the companies that put gas or heating oil on the market to buy a certificate for each tonne of CO₂ and to report their emissions by 31 July of the following year. A household receives no tax assessment and pays nothing to the state directly. It pays the surcharge the supplier builds into the unit price or the price per litre, plus VAT on top.' },
      { q: 'Which CO₂ price should I enter in the calculator?', a: `For the current year, the auction average: ${EN.eur(jetzt)} a tonne according to the August 2026 report of the German Emissions Trading Authority. To match what your bill shows, use ${EN.eur(mitte26)}: for 2026 invoices the CO₂ Cost Allocation Act takes the middle of the corridor. For 2028 and later there is no official figure, so any value you enter is a scenario.` },
      { q: 'How much CO₂ tax is there on a tank of LPG?', a: `Burning ${EN.num(1000)} kg of LPG releases about ${EN.num(lpgT, 1)} tonnes of CO₂ under the official default values. At ${EN.eur(jetzt)} a tonne that comes to ${EN.eur(lpg)} a year including VAT, against ${EN.eur(lpg21)} in ${erst.jahr}. Set the fuel to LPG in the calculator and enter the kilograms from the delivery note. If it gives litres only, ask the supplier for the conversion.` },
      { q: 'As a tenant in Germany, do I pay all of the CO₂ cost?', a: `Not always. The CO₂ Cost Allocation Act (CO2KostAufG) splits the cost by the building’s emissions per square metre. In an efficient building the tenant pays everything; in a very poor one the landlord pays up to ${EN.pct(vermieterMax)}. If you buy gas yourself, for example for a flat-level boiler, you can claim the landlord’s share within twelve months of the bill, in writing.` },
    ],
    body: (h) => `
<h2>Who actually pays the carbon price</h2>
<p>Since ${erst.jahr} every tonne of CO₂ from heating oil, natural gas and LPG has carried a price. Under ${h.src('behg10', 'section 10 of the Fuel Emissions Trading Act')}, the duty lies not with households but with the companies that bring the fuel onto the market. They buy the certificates and pass the cost down the supply chain. Prices were fixed until 2025; in 2026 certificates are auctioned within a corridor. According to the ${h.src('dehst', 'sales report of the German Emissions Trading Authority')}, the average up to August was ${h.eur(jetzt)}, the top of the range.</p>
${h.table(['Year', 'Price per tonne', `Oil ${h.num(oelL)} l`, `Gas ${h.num(gasK)} kWh`], jahre.map((j) => [
  String(j) + (preisJahr(j).status === 'beschlossen' ? ' (passed, not yet law)' : ''),
  preisText(j, h, 'to'),
  kostenText(j, 'oel', oelL, h, 'to'),
  kostenText(j, 'gas', gasK, h, 'to'),
]), 'CO₂ cost including VAT for the same consumption', ['l', 'r', 'r', 'r'])}
<p>The 2027 row shows the corridor the Bundestag passed on ${h.date(k27.bundestag)} (${h.src('btBehg', 'Bundestag')}). The Bundesrat and publication are still pending. What applies until then, and what the ETS2 brings from 2028, is under ${h.a('co2-preis-2027', 'CO₂ price 2027')}.</p>

<h2>How the calculator works it out</h2>
<p>The amount of CO₂ comes from the default values in the ${h.src('ebev', 'EBeV 2030 regulation')}: one litre of heating oil weighs ${h.num(C.oel_dichte_t_je_1000l, 3)} kg, holds ${h.num(C.oel_hu_gj_je_t, 1)} MJ per kg and emits ${h.num(C.oel_ef_t_je_gj, 3)} kg of CO₂ per MJ. For gas we start from the kWh on your bill, which German suppliers state on a gross calorific basis, and convert with ${h.num(C.gas_gj_je_mwh, 4)} GJ per MWh. That conversion is our own reading; the regulation does not spell it out. Tonnes times price gives the cost, and ${h.pct(C.mwst)} VAT is added.</p>
<p>An example: ${h.num(oelL)} litres of oil at ${h.eur(jetzt)} gives ${h.eur(oelJetzt)}, or ${h.num(ctOel, 1)} cents a litre. How large that share is in the pump price is on ${h.a('co2-preis-heizoel', 'CO₂ price for heating oil')}. For gas it is ${h.num(ctGas, 2)} cents per kWh, which you can set against the averages under ${h.a('gaspreis', 'gas prices')}.</p>

<h2>Reading a German gas or oil bill</h2>
<p>Bills come in German only. Section 3 of the ${h.src('co2kostaufg', 'CO₂ Cost Allocation Act')} requires the supplier to list the emissions in kg of CO₂ (Brennstoffemissionen), the emission factor per kWh, the energy content and the CO₂ price component including VAT (Preisbestandteil der Kohlendioxidkosten). For 2026 invoices the law uses the middle of the corridor, ${h.eur(mitte26)}; from 2027 the average of auctions from 1 July to 30 November of the previous year. So your bill may differ slightly from the calculator at ${h.eur(jetzt)}.</p>
<!--mini:co2jahr-->

<h2>Tenants, landlords and the way out</h2>
<p>In a rented flat the law divides the cost by emissions per square metre: see ${h.a('co2-kostenaufteilung', 'CO₂ cost split')}. If you own the house and want the cost gone for good, you need heating that burns no fossil fuel. The grant for that is worked out under ${h.a('waermepumpe-foerderung', 'heat pump grant')}, the running costs afterwards in the ${h.a('heizkosten-rechner', 'heating cost calculator')}. For a bonus, the home must be your main residence.</p>`,
  },
});

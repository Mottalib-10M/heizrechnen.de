import { defineGuide } from '../../lib/guide-types';
import { aufteilung } from '../../lib/engine/co2';
import { P, DE, EN } from '../../lib/fmt';

/**
 * CO₂-Kostenaufteilung nach dem CO2KostAufG: Stufentabelle der Anlage, § 8, § 9 und § 5a (neue fossile Heizung ab 2028).
 * Eigene Beispiele: Gaswohnung 70 m² mit 12.000 kWh, sanierte Wohnung 80 m² mit 6.000 kWh, Ölwohnung 90 m² mit 1.800 l.
 */
const A = P.aufteilung;
const preis = P.co2.auktion_2026_durchschnitt;
const basis = { stoff: 'gas' as const, menge: 12000, flaeche: 70, preis, einschraenkung: false };
const gas = aufteilung(basis);
const saniert = aufteilung({ ...basis, menge: 6000, flaeche: 80 });
const oel = aufteilung({ ...basis, stoff: 'oel', menge: 1800, flaeche: 90 });
const denkmal = aufteilung({ ...basis, einschraenkung: true });
const neu28 = aufteilung({ ...basis, neueFossile: true, jahr: 2028 });
const st = A.stufen;
const vMax = 1 - st[st.length - 1].mieter;
const grenze = st[1].ab;
const oben = st[st.length - 1].ab;

export default defineGuide({
  id: 'co2-kostenaufteilung',
  group: 'co2',
  order: 105,
  tool: 'aufteilung',
  related: ['vermieter', 'co2-steuer', 'co2-preis-2027', 'co2-preis-heizoel', 'gasheizung-verbot'],
  sources: ['co2kostaufg', 'gmodg43', 'dehst', 'ebev'],
  de: {
    slug: 'co2-kosten-vermieter-mieter',
    nav: 'CO₂-Kosten Aufteilung',
    card: 'Wer zahlt die CO₂-Kosten der Heizung? Stufe nach kg CO₂ je m², Anteil von Mieter und Vermieter, Sonderfälle nach §§ 5a, 8 und 9.',
    title: 'CO2 Kosten Aufteilung 2026: Rechner für Mieter und Vermieter',
    description: `CO2 Kosten Aufteilung 2026: Aus Verbrauch und Wohnfläche die Stufe nach CO2KostAufG, Vermieter zahlt bis ${DE.pct(vMax)}. Mit Denkmal, Gewerbe und neuer Gasheizung.`,
    h1: 'CO₂-Kosten Aufteilung: Ihr Anteil als Mieter oder Vermieter',
    intro: 'Verbrauch, Wohnfläche und Brennstoff eingeben: Der Rechner bestimmt die Stufe nach dem CO2KostAufG und teilt die CO₂-Kosten zwischen Mieter und Vermieter auf.',
    resume: `Die CO₂-Kosten für Gas und Heizöl teilen sich Mieter und Vermieter nach dem Kohlendioxidkostenaufteilungsgesetz. Maßgeblich ist, wie viel CO₂ die Wohnung im Jahr je Quadratmeter Wohnfläche verursacht, auf eine Nachkommastelle gerundet. Unter ${DE.num(grenze)} kg trägt der Mieter alles, ab ${DE.num(oben)} kg zahlt der Vermieter ${DE.pct(vMax)}; dazwischen liegen zehn Stufen. Eine Wohnung mit 70 m² und ${DE.num(12000)} kWh Gas im Jahr kommt auf ${DE.num(gas.kgM2, 1)} kg je m². Bei ${DE.eur(preis)} je Tonne, dem Durchschnitt der Versteigerungen 2026, und mit Mehrwertsteuer sind das rund ${DE.eur(gas.kosten)} CO₂-Kosten, davon ${DE.pct(gas.vermieter)} oder ${DE.eur(gas.vermieterEuro)} für den Vermieter. Eine Ölwohnung mit 90 m² und ${DE.num(1800)} Litern liegt bei ${DE.num(oel.kgM2, 1)} kg, dort zahlt der Vermieter ${DE.eur(oel.vermieterEuro)} von ${DE.eur(oel.kosten)}. Denkmalschutz oder Milieuschutz halbieren seinen Anteil. Wird nach dem 29. Juli 2026 eine neue Gas- oder Ölheizung eingebaut, gilt ab 2028 eine hälftige Teilung.`,
    faqs: [
      { q: 'Wie wird der CO₂-Ausstoß je Quadratmeter für die Aufteilung berechnet?', a: `Die gesamte CO₂-Menge des Jahres wird durch die Wohnfläche geteilt und auf eine Nachkommastelle gerundet. Die CO₂-Menge ergibt sich aus dem Brennstoffverbrauch und den amtlichen Emissionsfaktoren, bei Heizöl rund ${DE.num(oel.kg / 1800, 2)} kg je Liter. Liegt das Ergebnis genau auf einer Stufengrenze, gilt schon die höhere Stufe: ${DE.num(grenze, 1)} kg führen zur zweiten Stufe mit ${DE.pct(1 - st[1].mieter)} für den Vermieter.` },
      { q: 'Was ändert sich an der CO₂-Aufteilung, wenn der Vermieter eine neue Gasheizung einbaut?', a: `Wird eine Gas-, Öl- oder Flüssiggasheizung nach § 43 des Gebäudemodernisierungsgesetzes neu eingebaut, teilen Mieter und Vermieter die CO₂-Kosten ab dem 1. Januar 2028 hälftig, unabhängig von der Stufe. Ebenso die Netzentgelte für Gas, und ab 2029 die Mehrkosten für Biogas oder Bioöl bis zu einem Anteil von ${DE.pct(A.biobrennstoff_anteil_max)}. In der Beispielwohnung zahlt der Vermieter dann ${DE.eur(neu28.vermieterEuro)} statt ${DE.eur(gas.vermieterEuro)}.` },
      { q: 'Gilt die Stufentabelle auch für Büros und Läden?', a: `Nein. Für Nichtwohngebäude gilt eine hälftige Teilung: Eine Vereinbarung, nach der der Mieter mehr als ${DE.pct(A.nichtwohn_mieter_max)} der CO₂-Kosten trägt, ist unwirksam. Das Gesetz kündigt ein eigenes Stufenmodell für Nichtwohngebäude an, das im Gesetzestext aber bis heute fehlt. Im Rechner stellen Sie dafür unter „Sonderfälle“ auf Gewerbe.` },
      { q: 'Zahlt der Vermieter im Baudenkmal einen kleineren CO₂-Anteil?', a: `Ja, sein Anteil halbiert sich, wenn Denkmalschutz, ein Anschluss- und Benutzungszwang oder eine Erhaltungssatzung zum Milieuschutz eine wesentliche energetische Sanierung verhindern. In der Beispielwohnung sinkt er von ${DE.pct(gas.vermieter)} auf ${DE.pct(denkmal.vermieter)}. Sind beide Arten der Sanierung verhindert, entfällt die Aufteilung ganz. Diese Umstände muss der Vermieter nachweisen.` },
    ],
    body: (h) => `
<h2>So teilt das Gesetz die Kosten</h2>
<p>Das Kohlendioxidkostenaufteilungsgesetz verteilt die CO₂-Kosten nach dem Zustand des Gebäudes: Je mehr CO₂ eine Wohnung je Quadratmeter verursacht, desto mehr zahlt der Vermieter (${h.src('co2kostaufg', 'CO2KostAufG')}). Der Gedanke dahinter: Der Mieter beeinflusst sein Heizverhalten, der Vermieter Dämmung und Heizung.</p>
${h.table(['kg CO₂ je m² und Jahr', 'Mieter', 'Vermieter'], st.map((s, i) => [
  i === 0 ? `unter ${h.num(st[1].ab)}` : i === st.length - 1 ? `ab ${h.num(s.ab)}` : `${h.num(s.ab)} bis unter ${h.num(st[i + 1].ab)}`,
  h.pct(s.mieter), h.pct(1 - s.mieter),
]), 'Anlage zum CO2KostAufG, Wohngebäude', ['l', 'r', 'r'])}
<p>Die CO₂-Menge rechnet der Rechner aus dem Verbrauch mit den Faktoren der Emissionsberichterstattungsverordnung (${h.src('ebev', 'EBeV 2030, Anlage 2')}). Die CO₂-Kosten schätzt er mit dem Preis je Tonne, voreingestellt ${h.eur(preis)}, der Durchschnitt der Versteigerungen 2026 (${h.src('dehst', 'DEHSt')}). Steht der Betrag auf Ihrer Brennstoffrechnung, tragen Sie ihn ein: Er ist genauer als jede Schätzung.</p>

<h2>Drei Wohnungen, drei Ergebnisse</h2>
${h.table(['Wohnung', 'kg je m²', 'CO₂-Kosten', 'Vermieter', 'Mieter'], [
  [`Gas, 70 m², ${h.num(12000)} kWh`, h.num(gas.kgM2, 1), h.eur(gas.kosten), `${h.pct(gas.vermieter)} · ${h.eur(gas.vermieterEuro)}`, h.eur(gas.mieterEuro)],
  [`Gas saniert, 80 m², ${h.num(6000)} kWh`, h.num(saniert.kgM2, 1), h.eur(saniert.kosten), `${h.pct(saniert.vermieter)} · ${h.eur(saniert.vermieterEuro)}`, h.eur(saniert.mieterEuro)],
  [`Öl, 90 m², ${h.num(1800)} Liter`, h.num(oel.kgM2, 1), h.eur(oel.kosten), `${h.pct(oel.vermieter)} · ${h.eur(oel.vermieterEuro)}`, h.eur(oel.mieterEuro)],
], `CO₂-Preis ${h.eur(preis)} je Tonne, mit Mehrwertsteuer`, ['l', 'r', 'r', 'r', 'r'])}
<p>Die sanierte Wohnung bleibt knapp in der zweiten Stufe, der Vermieter trägt dort fast nichts. In der Ölwohnung ist es umgekehrt: Heizöl verursacht je Kilowattstunde mehr CO₂ als Gas, die Wohnung landet in der obersten Stufe. Wie sich der CO₂-Preis auf den Liter Heizöl umrechnet, zeigt ${h.a('co2-preis-heizoel', 'CO₂-Preis Heizöl')}, die Kosten für den ganzen Haushalt der ${h.a('co2-steuer', 'CO₂-Steuer-Rechner')}. Was die CO₂-Kosten ab 2027 kosten können, steht unter ${h.a('co2-preis-2027', 'CO₂-Preis 2027')}; der Korridor für 2027 ist vom Bundestag beschlossen, aber noch nicht verkündet.</p>
<!--mini:co2jahr-->

<h2>Sonderfälle im Rechner</h2>
<p>Unter „Sonderfälle“ lassen sich drei Regeln einstellen. Denkmalschutz, Anschluss- und Benutzungszwang oder Milieuschutz halbieren den Anteil des Vermieters nach § 9. Für Gewerberäume gilt nach § 8 eine hälftige Teilung. Und für eine Gas- oder Ölheizung, die nach dem 29. Juli 2026 unter § 43 des Gebäudemodernisierungsgesetzes eingebaut wurde (${h.src('gmodg43', '§ 43 GModG')}), teilen beide ab 2028 hälftig; der Rechner wendet diese Regel deshalb mit dem Jahr 2028 an. Was für neue Gasheizungen sonst gilt, steht unter ${h.a('gasheizung-verbot', 'Gasheizung Verbot')}. Für Vermieter, die über den Heizungstausch nachdenken, steht die Förderung unter ${h.a('vermieter', 'Heizungsförderung für Vermieter')}.</p>`,
  },
  en: {
    slug: 'co2-cost-split-landlord-tenant',
    nav: 'CO₂ cost split',
    card: 'Who pays the CO₂ cost of heating in a German rental? Tier by kg of CO₂ per m², tenant and landlord shares, and the special cases.',
    title: 'CO2 Cost Split Landlord Tenant Germany 2026: Calculator',
    description: `CO2 cost split landlord tenant in Germany 2026: tier under the CO2KostAufG from use and floor area, landlord pays up to ${EN.pct(vMax)}. Listed and commercial cases.`,
    h1: 'CO₂ cost split between landlord and tenant in Germany',
    intro: 'Enter consumption, floor area and fuel: the calculator finds the tier under the CO₂ Cost Allocation Act and splits the CO₂ cost between tenant and landlord.',
    resume: `In Germany the CO₂ cost of heating with gas or oil is split between tenant and landlord under the CO₂ Cost Allocation Act (Kohlendioxidkostenaufteilungsgesetz, CO2KostAufG). What counts is how much CO₂ the flat produces per square metre of floor area each year, rounded to one decimal. Below ${EN.num(grenze)} kg the tenant pays everything; from ${EN.num(oben)} kg the landlord pays ${EN.pct(vMax)}, with ten tiers in all. A 70 m² flat using ${EN.num(12000)} kWh of gas a year comes to ${EN.num(gas.kgM2, 1)} kg per m². At ${EN.eur(preis)} per tonne, the 2026 auction average, plus VAT, that is about ${EN.eur(gas.kosten)} of CO₂ cost, of which the landlord pays ${EN.pct(gas.vermieter)}, or ${EN.eur(gas.vermieterEuro)}. A 90 m² oil-heated flat using ${EN.num(1800)} litres reaches ${EN.num(oel.kgM2, 1)} kg, and the landlord pays ${EN.eur(oel.vermieterEuro)} of ${EN.eur(oel.kosten)}. A listed building or a conservation area halves the landlord’s share. If a new gas or oil boiler goes in after 29 July 2026, the cost is split in half from 2028.`,
    faqs: [
      { q: 'I rent a flat in Germany: how do I check the CO₂ split on my heating bill?', a: `Take the flat’s annual gas or oil consumption and floor area from the heating cost statement, enter them here and compare the tier with what the statement shows. The CO₂ amount per m² is rounded to one decimal, and a value exactly on a tier boundary already falls into the higher tier. If the landlord’s share is missing or looks too small, ask for the calculation in writing.` },
      { q: 'How does a new gas boiler change the CO₂ split?', a: `If a gas, oil or LPG boiler is newly installed under section 43 of the Building Modernisation Act, tenant and landlord share the CO₂ cost equally from 1 January 2028, whatever the tier. The same applies to gas network charges, and from 2029 to the extra cost of biogas or bio-oil up to a ${EN.pct(A.biobrennstoff_anteil_max)} share. In the example flat the landlord then pays ${EN.eur(neu28.vermieterEuro)} instead of ${EN.eur(gas.vermieterEuro)}.` },
      { q: 'Does the tier table apply to offices and shops?', a: `No. Non-residential buildings use an even split: any agreement making the tenant pay more than ${EN.pct(A.nichtwohn_mieter_max)} of the CO₂ cost is void. The act announces a separate tier model for non-residential buildings, but it is still missing from the legal text. In the calculator, switch to commercial under “Special cases”.` },
    ],
    body: (h) => `
<h2>How the law splits the cost</h2>
<p>The CO₂ Cost Allocation Act shares the cost according to the state of the building: the more CO₂ a flat produces per square metre, the more the landlord pays (${h.src('co2kostaufg', 'CO2KostAufG')}). The idea is that tenants control how they heat, landlords control insulation and the heating system.</p>
${h.table(['kg CO₂ per m² a year', 'Tenant', 'Landlord'], st.map((s, i) => [
  i === 0 ? `below ${h.num(st[1].ab)}` : i === st.length - 1 ? `${h.num(s.ab)} or more` : `${h.num(s.ab)} to under ${h.num(st[i + 1].ab)}`,
  h.pct(s.mieter), h.pct(1 - s.mieter),
]), 'Annex to the CO2KostAufG, residential buildings', ['l', 'r', 'r'])}
<p>The calculator derives the CO₂ amount from consumption with the official emission factors (${h.src('ebev', 'EBeV 2030, Annex 2')}). It estimates the CO₂ cost with a price per tonne, preset to ${h.eur(preis)}, the average of the 2026 auctions (${h.src('dehst', 'German Emissions Trading Authority')}). If your fuel bill shows the CO₂ amount, enter it: it beats any estimate.</p>

<h2>Three flats, three results</h2>
${h.table(['Flat', 'kg per m²', 'CO₂ cost', 'Landlord', 'Tenant'], [
  [`Gas, 70 m², ${h.num(12000)} kWh`, h.num(gas.kgM2, 1), h.eur(gas.kosten), `${h.pct(gas.vermieter)} · ${h.eur(gas.vermieterEuro)}`, h.eur(gas.mieterEuro)],
  [`Gas, renovated, 80 m², ${h.num(6000)} kWh`, h.num(saniert.kgM2, 1), h.eur(saniert.kosten), `${h.pct(saniert.vermieter)} · ${h.eur(saniert.vermieterEuro)}`, h.eur(saniert.mieterEuro)],
  [`Oil, 90 m², ${h.num(1800)} litres`, h.num(oel.kgM2, 1), h.eur(oel.kosten), `${h.pct(oel.vermieter)} · ${h.eur(oel.vermieterEuro)}`, h.eur(oel.mieterEuro)],
], `CO₂ price ${h.eur(preis)} per tonne, including VAT`, ['l', 'r', 'r', 'r', 'r'])}
<p>The renovated flat stays just inside the second tier, so the landlord pays almost nothing. The oil flat is the opposite: heating oil emits more CO₂ per kilowatt hour than gas and lands in the top tier. How the CO₂ price translates into each litre of oil is under ${h.a('co2-preis-heizoel', 'CO₂ price on heating oil')}, the cost for a whole household in the ${h.a('co2-steuer', 'CO₂ tax calculator')}. What CO₂ may cost from 2027 is under ${h.a('co2-preis-2027', 'CO₂ price 2027')}; the 2027 corridor has passed the Bundestag but has not yet been promulgated.</p>
<!--mini:co2jahr-->

<h2>Special cases in the calculator</h2>
<p>Under “Special cases” you can set three rules. A listed building, compulsory connection to a heat network or a conservation area (Milieuschutz) halves the landlord’s share under section 9; if both kinds of renovation are blocked, there is no split at all, and the landlord must prove the restriction. Commercial premises are split in half under section 8. For a gas or oil boiler installed after 29 July 2026 under section 43 of the Building Modernisation Act (${h.src('gmodg43', 'section 43 GModG')}), both pay half from 2028, so the calculator applies that rule for the year 2028. What else applies to new gas boilers is under ${h.a('gasheizung-verbot', 'gas boiler ban')}. Landlords weighing a new system will find the funding under ${h.a('vermieter', 'heating grant for landlords')}.</p>`,
  },
});

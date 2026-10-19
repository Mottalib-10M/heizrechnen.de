import { defineGuide } from '../../lib/guide-types';
import { foerderung, type FoerderEingabe } from '../../lib/engine/foerderung';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Einkommensbonus (Richtlinie BEG EM Nr. 8.4.5, Merkblatt 458 S. 4 und 5): drei Stufen, Familienzuschlag, Deckel 80 %.
 * Eigene Beispiele: Paar mit Steuerbescheiden 2023/2024, dasselbe Paar mit Kind, Rentnerin mit Ölheizung,
 * Familie mit mittlerem Einkommen, Haus mit junger Gasheizung (ohne Klimabonus). Alle Beträge vom Motor.
 */
const F = P.foerderung;
const heute = P.retrieved_at;
const [s1, s2, s3] = F.einkommen_stufen;
const z2023 = 36000;
const z2024 = 42000;
const schnitt = (z2023 + z2024) / 2;
const b: FoerderEingabe = { antrag: heute, gebaeude: 'efh', einheiten: 1, kosten: 30000, selbstnutzer: true, alt: 'gas', altJahre: 25, neu: 'wp', wpEU: true, zve: schnitt, kind: false };
const paar = foerderung(b);
const paarKind = foerderung({ ...b, kind: true });
const paarKindFeb = foerderung({ ...b, kind: true, antrag: '2027-02-01' });
const rentnerin = foerderung({ ...b, zve: 24000, alt: 'oel', altJahre: 32, kosten: 26000 });
const familie = foerderung({ ...b, zve: 55000, kind: true });
const ohneKind = foerderung({ ...b, zve: 55000 });
const jung = foerderung({ ...b, zve: 45000, altJahre: 12 });
/** Höchster Zuschuss je Stufe im Einfamilienhaus, Ölheizung ersetzt, Kosten über dem Höchstbetrag. */
const stufeMax = [25000, 35000, 45000, 70000].map((z) => foerderung({ ...b, kosten: 40000, alt: 'oel', zve: z }));

export default defineGuide({
  id: 'einkommensbonus',
  group: 'foerderung',
  order: 107,
  mini: 'einkommen',
  miniHref: 'waermepumpe-foerderung',
  related: ['kfw-458', 'waermepumpe-foerderung', 'klimageschwindigkeitsbonus', 'foerderantrag', 'ergaenzungskredit', 'weg'],
  sources: ['merkblatt458', 'kfw458', 'begem2026', 'bmweFaq'],
  de: {
    slug: 'einkommensbonus',
    nav: 'Einkommensbonus',
    card: 'Drei Stufen nach zu versteuerndem Einkommen, Familienzuschlag, Deckel 80 %: wer wie viel bekommt und welche Bescheide zählen.',
    title: 'Einkommensbonus 2026: Stufen, Familienzuschlag, Nachweis',
    description: `Einkommensbonus 2026: ${DE.pct(s1.bonus)}, ${DE.pct(s2.bonus)} oder ${DE.pct(s3.bonus)} extra bis ${DE.eur(s3.bis)} Einkommen, mit Kind ${DE.eur(F.familienzuschlag)} weniger angesetzt. Welche Steuerbescheide die KfW sehen will.`,
    h1: 'Einkommensbonus: wie viel Ihr Einkommen zur Heizungsförderung beiträgt',
    intro: 'Der Einkommensbonus hängt an zwei Steuerbescheiden und an der Frage, wer im Haus gemeldet ist. Hier steht, wie die KfW rechnet und was sie als Beleg annimmt.',
    resume: `Der Einkommensbonus ist ein Aufschlag auf die Heizungsförderung 458 für Eigentümer, die ihr Haus oder ihre Wohnung selbst als Hauptwohnsitz bewohnen. Er beträgt ${DE.pct(s1.bonus)} bis ${DE.eur(s1.bis)} zu versteuerndem Haushaltseinkommen, ${DE.pct(s2.bonus)} bis ${DE.eur(s2.bis)} und ${DE.pct(s3.bonus)} bis ${DE.eur(s3.bis)}. Maßgeblich ist der Durchschnitt aus den Steuerbescheiden des zweiten und dritten Jahres vor dem Antrag, für 2026 also 2023 und 2024. Lebt ein Kind unter 18 mit Kindergeldanspruch im Haushalt, setzt die KfW einmalig ${DE.eur(F.familienzuschlag)} weniger an. Zusammen mit Grundförderung und Klimabonus gilt ein Deckel von ${DE.pct(F.deckel_standard)}, bis ${DE.eur(F.deckel_niedrig_zve)} Einkommen von ${DE.pct(F.deckel_niedrig)}. Ein Paar mit ${DE.eur(z2023)} und ${DE.eur(z2024)} in den beiden Bescheiden kommt im Schnitt auf ${DE.eur(schnitt)} und erhält für eine Wärmepumpe zu ${DE.eur(30000)}, die eine 25 Jahre alte Gasheizung ersetzt, ${DE.eur(paar.zuschuss)}. Mit einem Kind im Haushalt rutscht es eine Stufe tiefer und bekommt ${DE.eur(paarKind.zuschuss)}.`,
    faqs: [
      { q: 'Gilt der Familienzuschlag für jedes Kind einzeln?', a: `Nein. Die KfW zieht pauschal und einmalig ${DE.eur(F.familienzuschlag)} vom angesetzten Einkommen ab, ob ein Kind oder vier im Haushalt leben. Voraussetzung ist, dass mindestens ein Kind beim Eingang des Antrags geboren und noch nicht 18 ist, in der Wohnung gemeldet ist und für es Kindergeld beansprucht werden kann. Für den Nachweis reichen Sie die Meldebestätigung des Kindes ein.` },
      { q: 'Was passiert, wenn für ein Jahr der Steuerbescheid fehlt?', a: 'Dann gibt es keinen Einkommensbonus. Die KfW prüft das Einkommen ausschließlich anhand der Einkommensteuerbescheide des zweiten und dritten Jahres vor dem Antrag. Lohnsteuerbescheinigung, Rentenbescheid oder eine Schätzung ersetzen den Bescheid nicht. Wer keine Erklärung abgegeben hat, kann sie nachholen und auf den Bescheid warten, sollte dabei aber die halbjährlichen Kürzungen des Höchstbetrags und des Klimabonus im Blick behalten.' },
      { q: 'Zählt das Einkommen meiner Lebensgefährtin mit?', a: 'Ja, wenn sie zum Zeitpunkt des Antrags mit Hauptwohnsitz in der geförderten Wohnung gemeldet ist. Zum Haushalt rechnet die KfW alle dort gemeldeten Eigentümer sowie deren Ehe- oder Lebenspartner und Partner aus eheähnlicher Gemeinschaft. Deren zu versteuernde Einkommen werden zusammengezählt. Volljährige Kinder ohne Eigentum, Eltern oder Untermieter zählen nicht mit, minderjährige Haushaltsmitglieder ebenfalls nicht.' },
      { q: 'Bekommen Rentner ohne Steuerbescheid den Einkommensbonus?', a: 'Nach den Antworten auf der Produktseite der KfW können Rentnerinnen und Rentner, die vom Finanzamt nicht veranlagt werden, die Rentenbezugsmitteilung als Nachweis einreichen. Für alle anderen gilt der Steuerbescheid. Bei kleinen Renten fällt der Haushalt oft in die erste Stufe mit dem höchsten Bonus, sodass sich der Aufwand für den Nachweis meist lohnt.' },
      { q: 'Lohnt sich der Bonus bei knapp 50.000 € Einkommen noch?', a: `Ja, die dritte Stufe bringt ${DE.pct(s3.bonus)} zusätzlich. Im Einfamilienhaus mit ${DE.eur(30000)} Kosten und einer alten Gasheizung sind das ${DE.eur(familie.zuschuss - ohneKind.zuschuss)} mehr als ohne Bonus. Mit Kind reicht die Stufe bis ${DE.eur(s3.bis + F.familienzuschlag)} zu versteuerndem Einkommen. Die Belege sind dieselben wie in den oberen Stufen, also Steuerbescheide, Meldebestätigungen und Grundbuchauszug.` },
    ],
    body: (h) => `
<h2>Wer den Einkommensbonus bekommt</h2>
<p>Den Bonus gibt es nur für Eigentümer, die die geförderte Wohnung selbst bewohnen, und nur für diese eine Wohnung. Als selbstnutzend gilt, wer dort beim Eingang des Antrags mit Haupt- oder alleinigem Wohnsitz gemeldet ist; das Eigentum belegt der Grundbuchauszug. Wer ein Haus vermietet, bekommt die Grundförderung, aber keinen Einkommensbonus (${h.a('vermieter', 'Förderung für Vermieter')}). In einer Eigentümergemeinschaft beantragt jeder Selbstnutzer seinen Bonus mit einem Zusatzantrag zum Antrag der Gemeinschaft (${h.a('weg', 'Heizungsförderung in der WEG')}).</p>
<p>Gefördert wird damit derselbe Heizungstausch wie bei der Grundförderung: Wärmepumpe, Biomasse, Solarthermie, Brennstoffzelle oder der Anschluss an ein Wärmenetz. Die Regeln stehen in Nummer 8.4.5 der ${h.src('begem2026', 'Richtlinie BEG EM vom 17. August 2026')} und auf den Seiten 4 und 5 des ${h.src('merkblatt458', 'Merkblatts 458')}.</p>

<h2>Drei Stufen und der Familienzuschlag</h2>
<p>Bis zum 20. Juli 2026 gab es eine einzige Stufe: ${h.pct(F.alt.eb)} bis ${h.eur(F.alt.eb_zve_bis)} Einkommen. Seit dem 21. Juli 2026 ist der Bonus dreistufig, und für Familien verschiebt sich jede Grenze um ${h.eur(F.familienzuschlag)} nach oben. Die rechte Spalte zeigt, was ein Einfamilienhaus mit Ölheizung höchstens erhält, wenn die Kosten über dem Höchstbetrag von ${h.eur(stufeMax[0].foerderfaehig)} liegen.</p>
${h.table(['Einkommen ohne Kind', 'mit Kind', 'Bonus', 'Satz gesamt', 'Zuschuss höchstens'], [
  [`bis ${h.eur(s1.bis)}`, `bis ${h.eur(s1.bis + F.familienzuschlag)}`, h.pct(s1.bonus), h.pct(stufeMax[0].satzEigen), h.eur(stufeMax[0].zuschuss)],
  [`bis ${h.eur(s2.bis)}`, `bis ${h.eur(s2.bis + F.familienzuschlag)}`, h.pct(s2.bonus), h.pct(stufeMax[1].satzEigen), h.eur(stufeMax[1].zuschuss)],
  [`bis ${h.eur(s3.bis)}`, `bis ${h.eur(s3.bis + F.familienzuschlag)}`, h.pct(s3.bonus), h.pct(stufeMax[2].satzEigen), h.eur(stufeMax[2].zuschuss)],
  [`über ${h.eur(s3.bis)}`, `über ${h.eur(s3.bis + F.familienzuschlag)}`, h.pct(0), h.pct(stufeMax[3].satzEigen), h.eur(stufeMax[3].zuschuss)],
], 'Antrag bis 31. Januar 2027, Grundförderung und Klimabonus eingerechnet', ['l', 'l', 'r', 'r', 'r'])}
<p>In der ersten Stufe würden Grundförderung, Klimabonus und Einkommensbonus zusammen mehr als ${h.pct(F.deckel_niedrig)} ergeben. Der Deckel schneidet den Rest ab. In der zweiten Stufe greift der allgemeine Deckel von ${h.pct(F.deckel_standard)}. Wer ohne Klimabonus fördert, etwa weil die Gasheizung jünger als ${F.kgb_mindestalter_gas_biomasse} Jahre ist, kommt mit dem Einkommensbonus allein seltener an den Deckel.</p>

<h2>So rechnet die KfW das Haushaltseinkommen</h2>
<p>Ausgangspunkt ist das zu versteuernde Einkommen, wie es im Einkommensteuerbescheid steht, nicht das Bruttogehalt. Es ist der Betrag nach Werbungskosten, Sonderausgaben und Freibeträgen. Ob das Finanzamt dabei Kinderfreibeträge abgezogen hat, spielt nach den ${h.src('bmweFaq', 'Antworten des Ministeriums')} keine Rolle. Zum Haushalt gehören alle Eigentümer, die beim Antrag in der Wohnung gemeldet sind, und ihre dort gemeldeten Ehe- und Lebenspartner sowie Partner aus eheähnlicher Gemeinschaft. Ihre Einkommen werden je Jahr zusammengezählt, dann wird der Durchschnitt aus dem zweiten und dritten Kalenderjahr vor dem Antrag gebildet.</p>
<p>Für einen Antrag im Jahr 2026 sind das die Jahre 2023 und 2024. Nach derselben Regel wären es für einen Antrag im Jahr 2027 die Jahre 2024 und 2025; ein eigenes Beispiel dafür hat die KfW bisher nicht veröffentlicht. Bei getrennt lebenden Ehepartnern, die noch gemeinsam veranlagt wurden, zählt das gemeinsame Einkommen zur Hälfte. Einkommen aus dem Ausland rechnet die KfW mit ein. Die Sonderregel des § 2 Absatz 5a EStG, nach der bestimmte Kapitalerträge hinzugerechnet würden, wendet sie ausdrücklich nicht an.</p>

<h2>Fünf Haushalte, nachgerechnet</h2>
${h.table(['Haushalt', 'angesetzt', 'Bonus', 'Zuschuss'], [
  [`Paar, Bescheide ${h.eur(z2023)} und ${h.eur(z2024)}, Gasheizung 25 Jahre, Wärmepumpe ${h.eur(30000)}`, h.eur(schnitt), h.pct(paar.ebSatz), h.eur(paar.zuschuss)],
  ['dasselbe Paar mit einem Kind von sieben Jahren', h.eur(schnitt - F.familienzuschlag), h.pct(paarKind.ebSatz), h.eur(paarKind.zuschuss)],
  [`Rentnerin, ${h.eur(24000)}, Ölheizung, Wärmepumpe ${h.eur(26000)}`, h.eur(24000), h.pct(rentnerin.ebSatz), h.eur(rentnerin.zuschuss)],
  [`Familie, ${h.eur(55000)}, ein Kind, Gasheizung 25 Jahre`, h.eur(55000 - F.familienzuschlag), h.pct(familie.ebSatz), h.eur(familie.zuschuss)],
  [`Single, ${h.eur(45000)}, Gasheizung erst 12 Jahre alt`, h.eur(45000), h.pct(jung.ebSatz), h.eur(jung.zuschuss)],
], 'Einfamilienhaus, selbst bewohnt, Antrag im Oktober 2026', ['l', 'r', 'r', 'r'])}
<p>Bei der Rentnerin liegen die Kosten unter dem Höchstbetrag, deshalb bezieht sich der Satz von ${h.pct(rentnerin.satzEigen)} auf die vollen ${h.eur(26000)}. Im letzten Fall fehlt der Klimabonus, übrig bleiben ${h.pct(F.grund)} Grundförderung und ${h.pct(jung.ebSatz)} Einkommensbonus. Der Familienzuschlag macht beim Paar mit Kind ${h.eur(paarKind.zuschuss - paar.zuschuss)} aus, weil er gleichzeitig die Stufe und den Deckel verschiebt.</p>
<!--mini:zuschuss-->

<h2>Was die KfW als Beleg sehen will</h2>
<p>Geprüft wird nicht beim Antrag, sondern beim Nachweis nach dem Einbau. Dann laden Sie im Portal „Meine KfW“ die Einkommensteuerbescheide beider Jahre für sich und alle volljährigen Haushaltsmitglieder hoch, die Meldebestätigungen aller zählenden Personen, beim Familienzuschlag auch die des Kindes, und einen Grundbuchauszug, auf dem alle relevanten Eigentümer stehen. Lohnsteuerbescheinigungen und Rentenbescheide nimmt die KfW nicht an. Für Anträge, die nach dem Merkblatt in der Fassung 07/2026 einen Einkommensbonus enthalten, soll das Einreichen der Nachweise laut Merkblatt voraussichtlich ab Januar 2027 möglich sein.</p>
<p>Den Bonus wählen Sie im Antrag selbst aus. Ein nachträglicher Wechsel der Bonusförderung ist nach der ${h.src('kfw458', 'Produktseite der KfW')} grundsätzlich nicht möglich. Wer sich nicht sicher ist, in welche Stufe er fällt, rechnet vorher mit dem ${h.a('waermepumpe-foerderung', 'Förderrechner')} nach und legt die beiden Bescheide neben die Grenzen aus der Tabelle.</p>

<h2>Bonus und Antragsdatum</h2>
<p>Die Sätze des Einkommensbonus bleiben bis zum Ende der Richtlinie gleich. Was sinkt, sind der Höchstbetrag der förderfähigen Kosten und der ${h.a('klimageschwindigkeitsbonus', 'Klimageschwindigkeitsbonus')}. Das Paar mit Kind bekäme bei einem Antrag ab dem 1. Februar 2027 noch ${h.eur(paarKindFeb.zuschuss)} statt ${h.eur(paarKind.zuschuss)}. In der ersten Stufe fällt das kaum ins Gewicht, weil der Deckel den Klimabonus ohnehin teilweise kappt. Für den Rest der Rechnung hilft der ${h.a('ergaenzungskredit', 'Ergänzungskredit')}; dessen Zinsvorteil hat eine eigene, höhere Einkommensgrenze von ${h.eur(F.kredit.zinsverbilligung_zve_bis)}. Wie der Antrag abläuft, steht unter ${h.a('foerderantrag', 'Heizungsförderung beantragen')}, die Übersicht über alle Bausteine unter ${h.a('kfw-458', 'KfW 458')}.</p>`,
  },
  en: {
    slug: 'income-bonus-heating-grant',
    nav: 'Income bonus',
    card: 'Three bands by taxable household income, a family allowance and an 80 % ceiling: who gets how much and which tax papers count.',
    title: 'Income Bonus 2026: German Heating Grant Bands and Proof',
    description: `Income bonus 2026: ${EN.pct(s1.bonus)}, ${EN.pct(s2.bonus)} or ${EN.pct(s3.bonus)} extra on the German heating grant up to ${EN.eur(s3.bis)} taxable income, ${EN.eur(F.familienzuschlag)} less with a child. Which papers KfW wants.`,
    h1: 'Income bonus: what your income adds to the German heating grant',
    intro: 'The income bonus rests on two German tax assessments and on who is registered at the address. This page shows how KfW works out the figure and what it accepts as proof.',
    resume: `The income bonus (Einkommensbonus) is a top-up on the KfW 458 heating grant for owners who live in the house or flat as their main residence. It is ${EN.pct(s1.bonus)} up to ${EN.eur(s1.bis)} of taxable household income, ${EN.pct(s2.bonus)} up to ${EN.eur(s2.bis)} and ${EN.pct(s3.bonus)} up to ${EN.eur(s3.bis)}. KfW takes the average from the tax assessments for the second and third year before you apply, so 2023 and 2024 for a 2026 application. If a child under 18 with a child benefit entitlement lives with you, KfW counts ${EN.eur(F.familienzuschlag)} less, once. Together with the basic grant and the climate bonus the rate is capped at ${EN.pct(F.deckel_standard)}, or ${EN.pct(F.deckel_niedrig)} up to ${EN.eur(F.deckel_niedrig_zve)}. A couple with ${EN.eur(z2023)} and ${EN.eur(z2024)} on their two assessments averages ${EN.eur(schnitt)} and receives ${EN.eur(paar.zuschuss)} for a ${EN.eur(30000)} heat pump replacing a 25-year-old gas boiler. With a child in the household they move down one band and get ${EN.eur(paarKind.zuschuss)}.`,
    faqs: [
      { q: 'Is the family allowance counted per child?', a: `No. KfW deducts a flat ${EN.eur(F.familienzuschlag)} once from the income it counts, whether one child or four live with you. At least one child must be born and under 18 when the application arrives, be registered at the address and carry a child benefit entitlement (Kindergeld). You prove it with the child's registration certificate (Meldebestätigung) when you submit the evidence.` },
      { q: 'I moved to Germany recently: can I still get the income bonus?', a: 'Only if you hold German income tax assessments for both relevant years, the second and third calendar year before the application. KfW accepts nothing else: no foreign tax return, no payslip summary, no employer letter. Someone who arrived in 2024 and applies in 2026 lacks the 2023 assessment and gets the basic grant and, where it applies, the climate bonus, but no income bonus.' },
      { q: 'Does income earned outside Germany count?', a: 'Yes. KfW states on its product page that income earned abroad is included in the household income. The proof is still the German income tax assessment for each of the two years, so the figure that matters is the taxable income printed there. How foreign earnings are treated in your own assessment is a question for your tax adviser, not for KfW.' },
      { q: 'Whose income is added to mine for the bonus?', a: 'Everyone who owns the property and is registered there as main residence on the application date, plus their spouses, registered partners and unmarried partners registered at the same address. Their taxable incomes are added up for each year. Adult children who are not owners, parents and lodgers are not counted, and neither is anyone under 18 at the time of the application.' },
      { q: 'Is the bonus still worth it just under €50,000?', a: `Yes, the third band adds ${EN.pct(s3.bonus)}. For a single-family house with ${EN.eur(30000)} of costs replacing an old gas boiler, that is ${EN.eur(familie.zuschuss - ohneKind.zuschuss)} more than without the bonus. With a child the band runs to ${EN.eur(s3.bis + F.familienzuschlag)} of taxable income. The paperwork is the same as for the higher bands: tax assessments, registration certificates and a land register extract.` },
    ],
    body: (h) => `
<h2>Who gets the income bonus</h2>
<p>The bonus is only for owners who live in the home being funded, and only for that one home. You count as an owner-occupier if, when KfW receives the application, you are registered there as your main or only residence; ownership is shown by the land register extract (Grundbuchauszug). A property you let out receives the basic grant but no income bonus (${h.a('vermieter', 'grants for landlords')}). In an owners' association each owner-occupier claims the bonus through an additional application linked to the association's own (${h.a('weg', 'heating grant in a WEG')}). A holiday home or a house you keep while working abroad does not qualify, because it is not your main residence.</p>
<p>The bonus funds the same heating replacement as the basic grant: heat pump, biomass, solar thermal, fuel cell or connection to a heat network. The rules are in no. 8.4.5 of the ${h.src('begem2026', 'BEG EM guideline of 17 August 2026')} and on pages 4 and 5 of ${h.src('merkblatt458', 'information sheet 458')}, both in German only.</p>

<h2>Three bands and the family allowance</h2>
<p>Until 20 July 2026 there was a single band: ${h.pct(F.alt.eb)} up to ${h.eur(F.alt.eb_zve_bis)}. Since 21 July 2026 the bonus has three bands, and for families every limit moves up by ${h.eur(F.familienzuschlag)}. The right-hand column shows the most a single-family house replacing an oil boiler can receive when costs exceed the ${h.eur(stufeMax[0].foerderfaehig)} cap.</p>
${h.table(['Income, no child', 'with child', 'Bonus', 'Total rate', 'Grant at most'], [
  [`up to ${h.eur(s1.bis)}`, `up to ${h.eur(s1.bis + F.familienzuschlag)}`, h.pct(s1.bonus), h.pct(stufeMax[0].satzEigen), h.eur(stufeMax[0].zuschuss)],
  [`up to ${h.eur(s2.bis)}`, `up to ${h.eur(s2.bis + F.familienzuschlag)}`, h.pct(s2.bonus), h.pct(stufeMax[1].satzEigen), h.eur(stufeMax[1].zuschuss)],
  [`up to ${h.eur(s3.bis)}`, `up to ${h.eur(s3.bis + F.familienzuschlag)}`, h.pct(s3.bonus), h.pct(stufeMax[2].satzEigen), h.eur(stufeMax[2].zuschuss)],
  [`above ${h.eur(s3.bis)}`, `above ${h.eur(s3.bis + F.familienzuschlag)}`, h.pct(0), h.pct(stufeMax[3].satzEigen), h.eur(stufeMax[3].zuschuss)],
], 'Application by 31 January 2027, basic grant and climate bonus included', ['l', 'l', 'r', 'r', 'r'])}
<p>In the first band the basic grant, climate bonus and income bonus would add up to more than ${h.pct(F.deckel_niedrig)}, and the ceiling cuts off the rest. In the second band the general ${h.pct(F.deckel_standard)} ceiling applies. Without the climate bonus, for example because the gas boiler is under ${F.kgb_mindestalter_gas_biomasse} years old, the income bonus alone reaches the ceiling less often.</p>

<h2>How KfW works out household income</h2>
<p>The starting point is taxable income (zu versteuerndes Einkommen) as printed on the German income tax assessment, not gross salary. It is the figure after work expenses, special expenses and allowances. According to the ${h.src('bmweFaq', 'ministry’s questions and answers')}, it does not matter whether the tax office deducted child allowances. The household is every owner registered at the home on the application date, plus their spouse or partner registered there. Their incomes are added up per year, then KfW averages the second and third calendar year before the application.</p>
<p>For a 2026 application that means 2023 and 2024. By the same rule a 2027 application would use 2024 and 2025, though KfW has not yet published an example for that year. For separated spouses who were still assessed jointly, half of the joint income counts. Income earned abroad is included. The special rule in section 2(5a) of the Income Tax Act, which would add back certain capital income, is expressly not applied. If you file jointly in Germany but your partner lives abroad and is not registered at the home, only the registered owners count.</p>

<h2>Five households, recalculated</h2>
${h.table(['Household', 'Counted', 'Bonus', 'Grant'], [
  [`Couple, assessments ${h.eur(z2023)} and ${h.eur(z2024)}, 25-year-old gas boiler, ${h.eur(30000)} heat pump`, h.eur(schnitt), h.pct(paar.ebSatz), h.eur(paar.zuschuss)],
  ['the same couple with a seven-year-old child', h.eur(schnitt - F.familienzuschlag), h.pct(paarKind.ebSatz), h.eur(paarKind.zuschuss)],
  [`Retired owner, ${h.eur(24000)}, oil boiler, ${h.eur(26000)} heat pump`, h.eur(24000), h.pct(rentnerin.ebSatz), h.eur(rentnerin.zuschuss)],
  [`Family, ${h.eur(55000)}, one child, 25-year-old gas boiler`, h.eur(55000 - F.familienzuschlag), h.pct(familie.ebSatz), h.eur(familie.zuschuss)],
  [`Single owner, ${h.eur(45000)}, gas boiler only 12 years old`, h.eur(45000), h.pct(jung.ebSatz), h.eur(jung.zuschuss)],
], 'Single-family house, owner-occupied, application in October 2026', ['l', 'r', 'r', 'r'])}
<p>For the retired owner the cost is below the cap, so the ${h.pct(rentnerin.satzEigen)} rate applies to the full ${h.eur(26000)}. In the last case there is no climate bonus, leaving ${h.pct(F.grund)} basic grant and ${h.pct(jung.ebSatz)} income bonus. For the couple, the child adds ${h.eur(paarKind.zuschuss - paar.zuschuss)}, because the allowance shifts both the band and the ceiling.</p>
<!--mini:zuschuss-->

<h2>What KfW wants as proof</h2>
<p>Income is checked not when you apply but when you submit evidence after installation. You then upload to the “Meine KfW” portal the tax assessments for both years for yourself and every adult household member who counts, the registration certificates of everyone counted (and of the child for the family allowance), and a land register extract naming all relevant owners. KfW does not accept payslip summaries (Lohnsteuerbescheinigung) or pension notices. For applications with an income bonus under the 07/2026 version of the information sheet, submitting evidence is expected to open from January 2027, according to the sheet.</p>
<p>You choose the bonus in the application itself. According to the ${h.src('kfw458', 'KfW product page')}, changing the bonus afterwards is generally not possible. If you are unsure which band you fall into, run the ${h.a('waermepumpe-foerderung', 'grant calculator')} first and put your two assessments next to the limits in the table above.</p>

<h2>The bonus and your application date</h2>
<p>The income bonus rates stay the same until the guideline ends. What falls is the cap on eligible costs and the ${h.a('klimageschwindigkeitsbonus', 'climate speed bonus')}. The couple with a child would receive ${h.eur(paarKindFeb.zuschuss)} instead of ${h.eur(paarKind.zuschuss)} if they applied from 1 February 2027. In the first band the difference is small, because the ceiling already trims part of the climate bonus. For the rest of the bill, the ${h.a('ergaenzungskredit', 'top-up loan')} offers an interest discount with its own, higher income limit of ${h.eur(F.kredit.zinsverbilligung_zve_bis)}. The steps are under ${h.a('foerderantrag', 'how to apply')}, the full programme under ${h.a('kfw-458', 'KfW 458')}.</p>`,
  },
});

import { defineGuide } from '../../lib/guide-types';
import { foerderung, hoechstbetrag, type FoerderEingabe } from '../../lib/engine/foerderung';
import { P, DE, EN } from '../../lib/fmt';

/**
 * KfW 458: das Programm im Ganzen. Eigene Beispiele = die Rechenbeispiele der KfW-Produktseite (Becker, Müller und Schmitz,
 * Förster) und der Pressemitteilung vom 08.07.2026 (Familie, 32.000 €), nachgerechnet mit dem Motor.
 */
const F = P.foerderung;
const heute = P.retrieved_at;
const b: FoerderEingabe = { antrag: heute, gebaeude: 'efh', einheiten: 1, kosten: 32000, selbstnutzer: true, alt: 'oel', altJahre: 30, neu: 'wp', wpEU: true, zve: 40000, kind: true };
const familie = foerderung(b);
const familieFeb = foerderung({ ...b, antrag: '2027-02-01' });
const familieAlt = foerderung({ ...b, antrag: '2026-07-20' });
const becker = foerderung({ ...b, gebaeude: 'mfh', einheiten: 2, kosten: 41000, zve: 200000 });
const mueller = foerderung({ ...b, kosten: 35000, alt: 'gas', altJahre: 10, neu: 'biomasse', zve: 47000, kind: false });
const foerster = foerderung({ ...b, gebaeude: 'etw', einheiten: 5, kosten: 20000, alt: 'nachtspeicher', zve: 70000, kind: false });
const vermieter = foerderung({ ...b, selbstnutzer: false });
const H = hoechstbetrag(heute, 1);
const H2 = hoechstbetrag(heute, 2);
const H5 = hoechstbetrag(heute, 5);
const kgb = F.kgb_stufen[0].satz;
const maxZuschuss = H * F.deckel_niedrig;

export default defineGuide({
  id: 'kfw-458',
  group: 'foerderung',
  order: 5,
  mini: 'zuschuss',
  miniHref: 'waermepumpe-foerderung',
  related: ['waermepumpe-foerderung', 'foerderantrag', 'einkommensbonus', 'klimageschwindigkeitsbonus', 'ergaenzungskredit', 'steuerbonus-35c'],
  sources: ['kfw458', 'merkblatt458', 'begem2026', 'begem2023', 'bmweFaq', 'kfwPm'],
  de: {
    slug: 'kfw-458',
    nav: 'KfW 458',
    card: 'Das Programm Heizungsförderung 458: wer es bekommt, Sätze, Höchstbeträge und die Beispiele der KfW nachgerechnet.',
    title: 'KfW 458 2026: Heizungsförderung, Sätze und Höchstbeträge',
    description: `KfW 458 2026: ${DE.pct(F.grund)} Grundförderung, Boni für Selbstnutzer, ${DE.eur(H)} förderfähige Kosten bis Januar 2027, danach weniger. Die Beispiele der KfW nachgerechnet.`,
    h1: 'KfW 458: Heizungsförderung für Privatpersonen 2026',
    intro: 'Was das Programm 458 heute zahlt, wem, bis wann, und wo der Antrag scheitern kann. Die Rechenbeispiele der KfW sind mit dem Rechner nachgerechnet.',
    resume: `KfW 458 ist der Zuschuss der Förderbank für den Einbau einer klimafreundlichen Heizung in ein bestehendes Wohngebäude, also Wärmepumpe, Biomasse, Solarthermie, Brennstoffzelle oder Anschluss an ein Wärme- oder Gebäudenetz. Für Anträge ab dem 21. Juli 2026 gilt die Richtlinie vom 17. August 2026. Jeder Eigentümer erhält ${DE.pct(F.grund)} Grundförderung. Wer selbst im Haus wohnt, kann ${DE.pct(kgb)} Klimageschwindigkeitsbonus und bis zu ${DE.pct(F.einkommen_stufen[0].bonus)} Einkommensbonus dazubekommen, insgesamt höchstens ${DE.pct(F.deckel_standard)}, bei kleinem Einkommen ${DE.pct(F.deckel_niedrig)}. Förderfähig sind für die erste Wohnung bis ${DE.eur(H)}, für die zweite bis sechste je ${DE.eur(F.hoechst_we_2_bis_6)}. Eine Familie mit ${DE.eur(40000)} Einkommen und einem Kind, die eine Ölheizung gegen eine Wärmepumpe zu ${DE.eur(32000)} tauscht, erhält ${DE.eur(familie.zuschuss)}. Stellt sie den Antrag erst am 1. Februar 2027, sind es ${DE.eur(familieFeb.zuschuss)}, weil der Höchstbetrag sinkt.`,
    faqs: [
      { q: 'Wer kann den Zuschuss 458 beantragen?', a: `Privatpersonen, die Eigentümer eines bestehenden Wohngebäudes oder einer Eigentumswohnung sind, ob sie selbst dort wohnen oder vermieten. Der Bauantrag muss mindestens ${F.gebaeude_mindestalter_jahre} Jahre zurückliegen. Ausgeschlossen sind Mieter, Nießbraucher und im Grundbuch eingetragene GbR, für die es ein eigenes Programm gibt. Für das Gemeinschaftseigentum einer WEG stellt die Gemeinschaft den Antrag.` },
      { q: 'Wie hoch ist der höchste Zuschuss aus KfW 458?', a: `Für ein Einfamilienhaus ${DE.eur(maxZuschuss)}: ${DE.pct(F.deckel_niedrig)} von ${DE.eur(H)}. Das setzt voraus, dass Sie selbst dort wohnen, eine alte fossile Heizung ersetzen und höchstens ${DE.eur(F.deckel_niedrig_zve)} zu versteuerndes Einkommen haben, mit Kind ${DE.eur(F.deckel_niedrig_zve + F.familienzuschlag)}. Ohne Einkommensbonus endet es bei ${DE.pct(F.grund + kgb)}, also ${DE.eur(H * (F.grund + kgb))}.` },
      { q: 'Kann ich KfW 458 noch nach den alten Regeln bekommen?', a: `Nur wenn der Antrag bis zum 20. Juli 2026 bei der KfW eingegangen ist. Solche Anträge werden nach der Richtlinie von 2023 geprüft: ${DE.eur(F.alt.hoechst_erste_we)} Höchstbetrag, ${DE.pct(F.alt.kgb)} Klimabonus, Deckel ${DE.pct(F.alt.deckel)}. Wer verzichtet, um neu zu beantragen, wartet für dasselbe Vorhaben sechs Monate. Für alle neuen Anträge gelten die Werte von heute.` },
      { q: 'Wird die Grundförderung für Wärmepumpen 2027 gekürzt?', a: `Die Richtlinie sieht ab dem ersten Quartal 2027 eine Grundförderung von ${DE.pct(F.q1_2027.wp_grund)} für Wärmepumpen vor, dazu ${DE.pct(F.q1_2027.wertschoepfung)} Bonus, wenn das Gerät aus der EU stammt. Starttag und Nachweis der Herkunft sind noch nicht veröffentlicht. Mit EU-Gerät bleibt der Satz gleich, ohne sinkt er um ${DE.pct(F.q1_2027.wertschoepfung)}.` },
      { q: 'Meldet die KfW den Zuschuss an das Finanzamt?', a: `Ja, sobald Sie in einem Kalenderjahr insgesamt mindestens ${DE.eur(3000)} Zuschuss von der KfW erhalten. Dazu ist die Bank nach der Mitteilungsverordnung verpflichtet, Sie werden darüber informiert. Für dieselbe Maßnahme schließt der Zuschuss den Steuerbonus nach § 35c EStG aus. Für eine andere Maßnahme am selben Haus, etwa neue Fenster, bleibt der Steuerbonus möglich. Wie Sie den Zuschuss in der eigenen Steuererklärung behandeln, klärt im Zweifel das Finanzamt.` },
      { q: 'Darf der Einbau beginnen, bevor die Zusage da ist?', a: 'Ja, sobald der Antrag bei der KfW eingegangen ist, allerdings auf eigenes Risiko: Wird er abgelehnt, gibt es kein Geld. Vor dem Antrag ist nur ein Vertrag mit dem Fachbetrieb erlaubt, der eine Bedingung enthält, also nur bei Zusage gilt oder ohne Zusage entfällt. Diese Klausel muss von Anfang an im Vertrag stehen. Planung und Beratung dürfen jederzeit vorher stattfinden.' },
    ],
    body: (h) => `
<h2>Was KfW 458 fördert</h2>
<p>Gefördert wird der Einbau einer Heizung, die mit erneuerbarer Energie arbeitet, in ein Gebäude, das schon steht. Dazu zählen Wärmepumpen, Biomasseheizungen wie Pellet- oder Hackschnitzelkessel, Solarthermie, Brennstoffzellen, wasserstofffähige Heizungen (nur die Mehrkosten) und der Anschluss an ein Gebäude- oder Wärmenetz. Förderfähig sind nicht nur das Gerät, sondern auch Einbau, Demontage der alten Anlage, Umbau der Heizkörper, Fachplanung und Baubegleitung. Gebrauchte Geräte, Eigenbau und Prototypen fallen heraus. Wer die Heizung nur optimiert, etwa Pumpen tauscht oder einen hydraulischen Abgleich machen lässt, landet nicht bei der KfW, sondern beim BAFA (${h.a('heizungsoptimierung', 'Heizungsoptimierung')}).</p>
<p>Die Regeln stehen in der Richtlinie für die Bundesförderung für effiziente Gebäude, Einzelmaßnahmen (${h.src('begem2026', 'Bundesanzeiger')}), die Einzelheiten im ${h.src('merkblatt458', 'Merkblatt 458')}. Bei Widersprüchen gilt die Richtlinie. Einen Rechtsanspruch auf das Geld gibt es nicht: Die KfW entscheidet im Rahmen der Mittel des Bundeshaushalts.</p>

<h2>Die vier Bausteine des Zuschusses</h2>
${h.table(['Baustein', 'Satz', 'Wer', 'Bedingung'], [
  ['Grundförderung', h.pct(F.grund), 'alle Eigentümer', 'förderfähige Heizung, Fachbetrieb'],
  ['Klimageschwindigkeitsbonus', h.pct(kgb), 'nur Selbstnutzer', 'Öl, Kohle, Nachtspeicher, Gasetage oder Gas und Biomasse ab 20 Jahren ersetzt'],
  ['Einkommensbonus', `${h.pct(F.einkommen_stufen[2].bonus)} bis ${h.pct(F.einkommen_stufen[0].bonus)}`, 'nur Selbstnutzer', `zu versteuerndes Einkommen bis ${h.eur(F.einkommen_stufen[2].bis)}`],
  ['Wertschöpfungsbonus', h.pct(F.q1_2027.wertschoepfung), 'Wärmepumpe', 'ab dem ersten Quartal 2027, Herkunft aus der EU'],
], 'Stand: Richtlinie vom 17. August 2026', ['l', 'r', 'l', 'l'])}
<p>Die Boni addieren sich, bis der Deckel erreicht ist: ${h.pct(F.deckel_standard)} der förderfähigen Kosten, ${h.pct(F.deckel_niedrig)} für Haushalte bis ${h.eur(F.deckel_niedrig_zve)} Einkommen. Der Effizienzbonus von ${h.pct(F.alt.effizienz)} für Erdwärme oder natürliches Kältemittel und der Zuschlag von ${h.eur(F.alt.biomasse_zuschlag)} für staubarme Biomassekessel sind seit dem 21. Juli 2026 gestrichen. Wer im Netz noch eine Rechnung mit diesen beiden Posten findet, liest den Stand von 2024 oder 2025 (${h.a('effizienzbonus', 'Effizienzbonus')}).</p>
<p>Das Einkommen ist der Durchschnitt der zu versteuernden Einkommen laut Steuerbescheid aus dem zweiten und dritten Jahr vor dem Antrag, für 2026 also aus 2023 und 2024. Lebt ein Kind unter 18 im Haushalt, für das Kindergeld bezogen wird, zählt die KfW ${h.eur(F.familienzuschlag)} weniger. Einzelheiten und die drei Stufen stehen unter ${h.a('einkommensbonus', 'Einkommensbonus')}.</p>

<h2>Höchstbeträge: erste Wohnung, weitere Wohnungen</h2>
<p>Die KfW fördert nicht die ganze Rechnung, sondern nur Kosten bis zu einem Höchstbetrag je Gebäude. Für die erste Wohnung sind es ${h.eur(H)}, für die zweite bis sechste je ${h.eur(F.hoechst_we_2_bis_6)}, ab der siebten je ${h.eur(F.hoechst_we_ab_7)}. Ein Zweifamilienhaus kommt so auf ${h.eur(H2)}, ein Haus mit fünf Wohnungen auf ${h.eur(H5)}. Der Höchstbetrag gilt für das Gebäude einmal, auch über mehrere Anträge hinweg: Was schon gefördert wurde, wird abgezogen.</p>
<p>Neu ist, dass nur der Betrag für die erste Wohnung jedes halbe Jahr sinkt, zum 1. Februar und zum 1. August, jeweils um ${h.eur(F.hoechst_erste_we[0].betrag - F.hoechst_erste_we[1].betrag)}. Gleichzeitig fällt der Klimageschwindigkeitsbonus in Schritten von ${h.pct(F.kgb_stufen[0].satz - F.kgb_stufen[1].satz)}. Maßgeblich ist jeweils der Tag, an dem der Antrag eingeht, nicht der Einbau.</p>
${h.table(['Antrag ab', 'Höchstbetrag 1. Wohnung', 'Klimabonus'], F.hoechst_erste_we.slice(0, 6).map((s) => {
  const k = F.kgb_stufen.filter((x) => x.ab <= s.ab).pop();
  return [h.date(s.ab), h.eur(s.betrag), k ? h.pct(k.satz) : h.pct(0)];
}), 'Richtlinie Nr. 8.3.1 und 8.4.4', ['l', 'r', 'r'])}
<!--mini:warten-->

<h2>Die Beispiele der KfW, nachgerechnet</h2>
<p>Die KfW zeigt auf ihrer ${h.src('kfw458', 'Produktseite')} drei Haushalte. Unser Rechner kommt bei allen auf denselben Betrag, das ist die Probe für jede Zahl auf dieser Website.</p>
${h.table(['Fall', 'Förderfähig', 'Zuschuss'], [
  ['Zweifamilienhaus, Öl gegen Sole-Wärmepumpe, Eigentümer wohnt in einer Wohnung, ohne Einkommensbonus', h.eur(becker.foerderfaehig), h.eur(becker.zuschuss)],
  ['Einfamilienhaus, 10 Jahre alte Gasheizung gegen Pellets, Einkommen 47.000 €', h.eur(mueller.foerderfaehig), h.eur(mueller.zuschuss)],
  ['Wohnung in einer WEG mit fünf Einheiten, Nachtspeicher gegen Split-Wärmepumpe, Einkommen 70.000 €', h.eur(foerster.foerderfaehig), h.eur(foerster.zuschuss)],
], 'Beispiele kfw.de/458, Stand Oktober 2026', ['l', 'r', 'r'])}
<p>Im Zweifamilienhaus bekommt das ganze Gebäude die Grundförderung, der Klimabonus aber nur die Hälfte, die der Eigentümer bewohnt. Bei den Pellets fehlt der Klimabonus, weil die Gasheizung jünger als 20 Jahre war; ${h.pct(F.einkommen_stufen[2].bonus)} Einkommensbonus bleiben. In der WEG teilt sich der Höchstbetrag gleichmäßig auf fünf Wohnungen auf. Wer vermietet, bekommt im Einfamilienhaus mit ${h.eur(32000)} Kosten ${h.eur(vermieter.zuschuss)} (${h.a('vermieter', 'Förderung für Vermieter')}).</p>

<h2>Vor dem Antrag: drei Fallen</h2>
<p>Erstens der Vertrag. Vor dem Antrag braucht es einen Liefer- oder Leistungsvertrag mit einer Bedingung, die ihn an die Förderzusage knüpft, und mit dem geplanten Datum des Einbaus. Ein Vertrag ohne diese Klausel gilt als Vorhabenbeginn, und dann ist die Förderung verloren. Nach dem Eingang des Antrags darf der Einbau beginnen, vor der Zusage aber auf eigenes Risiko. Zweitens die Bestätigung zum Antrag: Ein Fachbetrieb oder ein Energieeffizienz-Experte erstellt sie, ohne sie kann der Antrag im Portal „Meine KfW“ nicht gestellt werden. Drittens der Nachweis des Einkommens: Die KfW nimmt nur Steuerbescheide, keine Lohnsteuerbescheinigung. Wer für eines der beiden Jahre keinen Bescheid hat, verliert den Einkommensbonus. Der Ablauf Schritt für Schritt steht unter ${h.a('foerderantrag', 'Antrag stellen')}.</p>
<p>Nach der Zusage bleiben ${F.bewilligung_monate} Monate für den Einbau, danach ${F.nachweis_monate} Monate für die Nachweise. Die Heizung muss ${F.nutzungspflicht_jahre} Jahre so betrieben werden. Bei hohem Eigenanteil hilft der ${h.a('ergaenzungskredit', 'Ergänzungskredit')} bis ${h.eur(F.kredit.hoechst_je_we)} je Wohnung.</p>

<h2>Was der Stichtag kostet</h2>
<p>Die Familie aus dem Beispiel oben, Einkommen ${h.eur(40000)}, ein Kind, Ölheizung, Wärmepumpe zu ${h.eur(32000)}, hätte mit einem Antrag bis zum 20. Juli 2026 ${h.eur(familieAlt.zuschuss)} bekommen. Heute sind es ${h.eur(familie.zuschuss)}, weil der Deckel für ihr Einkommen auf ${h.pct(F.deckel_niedrig)} gestiegen ist. Am 1. Februar 2027 sinkt der Betrag auf ${h.eur(familieFeb.zuschuss)}. Haushalte über ${h.eur(F.einkommen_stufen[2].bis)} Einkommen trifft die Absenkung doppelt, weil bei ihnen zusätzlich der Klimabonus kleiner wird. Den Vergleich für Ihr Haus zeigt der ${h.a('waermepumpe-foerderung', 'Förderrechner')}.</p>`,
  },
  en: {
    slug: 'kfw-458-heating-grant',
    nav: 'KfW 458',
    card: 'The KfW 458 heating grant: who gets it, rates, cost caps and the bank’s own examples recalculated.',
    title: 'KfW 458 Heating Grant 2026: Rates, Caps and Who Qualifies',
    description: `KfW 458 heating grant 2026: ${EN.pct(F.grund)} basic grant, bonuses for owner-occupiers, ${EN.eur(H)} eligible costs until January 2027, then less. The KfW examples checked.`,
    h1: 'KfW 458 heating grant for private owners in 2026',
    intro: 'What programme 458 pays today, to whom, until when, and where an application can fail. The examples published by KfW are recalculated with our calculator.',
    resume: `KfW 458 is the grant from Germany’s federal promotional bank for installing low-carbon heating in an existing residential building: a heat pump, biomass boiler, solar thermal, fuel cell or connection to a heat network. Applications from 21 July 2026 fall under the guideline of 17 August 2026. Every owner gets a ${EN.pct(F.grund)} basic grant. If you live in the property, you can add a ${EN.pct(kgb)} climate speed bonus and an income bonus of up to ${EN.pct(F.einkommen_stufen[0].bonus)}, capped at ${EN.pct(F.deckel_standard)} in total, or ${EN.pct(F.deckel_niedrig)} on a low income. Eligible costs are capped at ${EN.eur(H)} for the first home and ${EN.eur(F.hoechst_we_2_bis_6)} for each of the second to sixth. A family on ${EN.eur(40000)} with one child replacing an oil boiler with a ${EN.eur(32000)} heat pump gets ${EN.eur(familie.zuschuss)}. If they apply on 1 February 2027 instead, it is ${EN.eur(familieFeb.zuschuss)}, because the cap falls.`,
    faqs: [
      { q: 'Can a foreign owner of a German house apply for KfW 458?', a: `Yes. The programme is open to private individuals who own an existing home in Germany, whatever their nationality, whether they live there or let it. Planning permission must date back at least ${F.gebaeude_mindestalter_jahre} years. Tenants, holders of a usufruct and partnerships registered as a GbR are excluded. The bonuses require the home to be your registered main residence, and the income bonus needs German tax assessments.` },
      { q: 'What is the largest grant KfW 458 pays for one house?', a: `${EN.eur(maxZuschuss)} for a single-family house: ${EN.pct(F.deckel_niedrig)} of ${EN.eur(H)}. That needs you to live there, to replace an old fossil system and to have taxable income of no more than ${EN.eur(F.deckel_niedrig_zve)}, or ${EN.eur(F.deckel_niedrig_zve + F.familienzuschlag)} with a child. Without the income bonus the rate stops at ${EN.pct(F.grund + kgb)}, which is ${EN.eur(H * (F.grund + kgb))}.` },
      { q: 'Do the old 2024 KfW 458 rules still apply to anyone?', a: `Only to applications that reached KfW by 20 July 2026. They are assessed under the 2023 guideline: ${EN.eur(F.alt.hoechst_erste_we)} cap, ${EN.pct(F.alt.kgb)} climate bonus, ${EN.pct(F.alt.deckel)} ceiling. Withdrawing to reapply under the new rules locks the same project for six months. Every new application uses today’s figures.` },
      { q: 'Is the heat pump basic grant being cut in 2027?', a: `The guideline sets a ${EN.pct(F.q1_2027.wp_grund)} basic grant for heat pumps from the first quarter of 2027, plus a ${EN.pct(F.q1_2027.wertschoepfung)} bonus if the unit originates in the EU. The start date and how origin is proven have not been published. With an EU unit the rate stays the same; without one it falls by ${EN.pct(F.q1_2027.wertschoepfung)}.` },
      { q: 'Does KfW report the grant to the German tax office?', a: `Yes, once you receive ${EN.eur(3000)} or more from KfW in one calendar year in total. The bank is required to do so under the reporting regulation (Mitteilungsverordnung) and tells you about it. For the same work, the grant rules out the section 35c income tax credit. For other work on the same house, such as new windows, the tax credit remains possible. Ask your tax adviser how to treat the grant in your own return.` },
      { q: 'Can installation start before the grant is approved?', a: 'Yes, once KfW has received the application, but at your own risk: if it is refused, there is no money. Before applying you may only sign a contract with the installer that carries a condition, so it takes effect only on approval or lapses without it. The clause must be in the contract from the start. Planning and advice may take place beforehand at any time.' },
    ],
    body: (h) => `
<h2>What KfW 458 pays for</h2>
<p>The grant covers installing heating that runs on renewable energy in a building that already exists. That means heat pumps, biomass boilers such as pellet or wood chip, solar thermal, fuel cells, hydrogen-ready heating (the extra cost only) and connection to a building or district heat network. Eligible costs include not just the unit but installation, removal of the old system, radiator changes, specialist planning and site supervision. Second-hand units, self-built systems and prototypes are excluded. If you only optimise your heating, for example new pumps or hydraulic balancing, that goes to BAFA rather than KfW (${h.a('heizungsoptimierung', 'heating optimisation')}).</p>
<p>The rules are in the federal guideline for single measures (${h.src('begem2026', 'Federal Gazette')}), the details in ${h.src('merkblatt458', 'information sheet 458')}. Where they differ, the guideline prevails. There is no legal right to the money: KfW decides within the federal budget available. All documents and the online portal „Meine KfW“ are in German only, so expect to work with your installer on the paperwork.</p>

<h2>The four parts of the grant</h2>
${h.table(['Part', 'Rate', 'Who', 'Condition'], [
  ['Basic grant', h.pct(F.grund), 'all owners', 'eligible system, registered installer'],
  ['Climate speed bonus', h.pct(kgb), 'owner-occupiers only', 'replaces oil, coal, night storage, gas flat heater, or gas and biomass aged 20 years or more'],
  ['Income bonus', `${h.pct(F.einkommen_stufen[2].bonus)} to ${h.pct(F.einkommen_stufen[0].bonus)}`, 'owner-occupiers only', `taxable income up to ${h.eur(F.einkommen_stufen[2].bis)}`],
  ['Value-added bonus', h.pct(F.q1_2027.wertschoepfung), 'heat pumps', 'from the first quarter of 2027, EU origin'],
], 'Guideline of 17 August 2026', ['l', 'r', 'l', 'l'])}
<p>The bonuses add up until the ceiling is reached: ${h.pct(F.deckel_standard)} of eligible costs, or ${h.pct(F.deckel_niedrig)} for households with income up to ${h.eur(F.deckel_niedrig_zve)}. The ${h.pct(F.alt.effizienz)} efficiency bonus for ground source or natural refrigerant and the ${h.eur(F.alt.biomasse_zuschlag)} supplement for low-dust biomass boilers were abolished on 21 July 2026. An English guide that still lists them describes 2024 or 2025 (${h.a('effizienzbonus', 'efficiency bonus')}).</p>
<p>Income means the average taxable income on your German tax assessments for the second and third year before you apply, so 2023 and 2024 for a 2026 application. Income earned abroad counts too. If a child under 18 lives with you and you receive child benefit for them, KfW deducts ${h.eur(F.familienzuschlag)}. The three bands are explained under ${h.a('einkommensbonus', 'income bonus')}.</p>

<h2>Cost caps: first home, further homes</h2>
<p>KfW does not fund the whole invoice, only costs up to a cap per building. For the first home it is ${h.eur(H)}, for the second to sixth ${h.eur(F.hoechst_we_2_bis_6)} each, and ${h.eur(F.hoechst_we_ab_7)} each from the seventh. A two-family house reaches ${h.eur(H2)}, a building with five homes ${h.eur(H5)}. The cap applies to the building once, across all applications: anything already funded is deducted.</p>
<p>What is new is that only the first-home amount falls every six months, on 1 February and 1 August, by ${h.eur(F.hoechst_erste_we[0].betrag - F.hoechst_erste_we[1].betrag)} each time. The climate speed bonus drops at the same dates in steps of ${h.pct(F.kgb_stufen[0].satz - F.kgb_stufen[1].satz)}. What counts is the day KfW receives the application, not the installation date.</p>
${h.table(['Application from', 'Cap first home', 'Climate bonus'], F.hoechst_erste_we.slice(0, 6).map((s) => {
  const k = F.kgb_stufen.filter((x) => x.ab <= s.ab).pop();
  return [h.date(s.ab), h.eur(s.betrag), k ? h.pct(k.satz) : h.pct(0)];
}), 'Guideline no. 8.3.1 and 8.4.4', ['l', 'r', 'r'])}
<!--mini:warten-->

<h2>KfW’s own examples, recalculated</h2>
<p>KfW shows three households on its ${h.src('kfw458', 'product page')}. Our calculator reaches the same amount for each, which is the test behind every figure on this site.</p>
${h.table(['Case', 'Eligible', 'Grant'], [
  ['Two-family house, oil replaced by a ground source heat pump, owner lives in one unit, no income bonus', h.eur(becker.foerderfaehig), h.eur(becker.zuschuss)],
  ['Single-family house, 10-year-old gas boiler replaced by pellets, income €47,000', h.eur(mueller.foerderfaehig), h.eur(mueller.zuschuss)],
  ['Flat in a five-unit owners’ association, night storage replaced by a split heat pump, income €70,000', h.eur(foerster.foerderfaehig), h.eur(foerster.zuschuss)],
], 'Examples from kfw.de/458, October 2026', ['l', 'r', 'r'])}
<p>In the two-family house the whole building gets the basic grant, but the climate bonus only applies to the half the owner lives in. The pellet case gets no climate bonus because the gas boiler was under 20 years old; the ${h.pct(F.einkommen_stufen[2].bonus)} income bonus remains. In the owners’ association the cap is split evenly across five flats. A landlord with ${h.eur(32000)} of costs in a single-family house receives ${h.eur(vermieter.zuschuss)} (${h.a('vermieter', 'grants for landlords')}).</p>

<h2>Before you apply: three traps</h2>
<p>First, the contract. Before applying you need a supply or service contract with a clause tying it to grant approval, and the planned installation date. A contract without that clause counts as starting the project, and the grant is lost. Once the application is in, work may begin, though before approval at your own risk. Second, the confirmation for the application (Bestätigung zum Antrag): an installer or a listed energy efficiency expert issues it, and without it the portal will not accept the application. Third, proof of income: KfW accepts only tax assessments (Steuerbescheide), not a payslip summary. If you have no German assessment for one of the two years, for instance because you moved to Germany recently, the income bonus is lost. The steps are set out under ${h.a('foerderantrag', 'how to apply')}.</p>
<p>After approval you have ${F.bewilligung_monate} months to install, then ${F.nachweis_monate} months to submit the evidence. The system must be used as intended for ${F.nutzungspflicht_jahre} years. If your own share is large, the ${h.a('ergaenzungskredit', 'top-up loan')} covers up to ${h.eur(F.kredit.hoechst_je_we)} per home.</p>

<h2>What the deadline costs</h2>
<p>The family above, income ${h.eur(40000)}, one child, oil boiler, ${h.eur(32000)} heat pump, would have received ${h.eur(familieAlt.zuschuss)} with an application by 20 July 2026. Today it is ${h.eur(familie.zuschuss)}, because the ceiling for their income has risen to ${h.pct(F.deckel_niedrig)}. On 1 February 2027 it falls to ${h.eur(familieFeb.zuschuss)}. Households above ${h.eur(F.einkommen_stufen[2].bis)} are hit twice, because their climate bonus also shrinks. The ${h.a('waermepumpe-foerderung', 'grant calculator')} shows the comparison for your house.</p>`,
  },
});

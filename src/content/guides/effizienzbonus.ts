import { defineGuide } from '../../lib/guide-types';
import { foerderung, type FoerderEingabe } from '../../lib/engine/foerderung';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Effizienzbonus: 5 % für Wärmepumpen nach der Richtlinie vom 21.12.2023 (Nr. 8.4.3), gestrichen für Anträge ab 21.07.2026
 * (KfW-PM 08.07.2026, BMWE-FAQ A.2.6). Wer ihn noch bekommt (Anträge bis 20.07.2026), was der Wegfall je Einkommen
 * ausmacht, und was 2027/2028 folgt (Wertschöpfungsbonus, Pflicht zum natürlichen Kältemittel). Beispiele vom Motor.
 */
const F = P.foerderung;
const A = F.alt;
const heute = P.retrieved_at;
const q1 = F.q1_2027;
const april = '2027-04-01';
const b: FoerderEingabe = { antrag: heute, gebaeude: 'efh', einheiten: 1, kosten: 35000, selbstnutzer: true, alt: 'oel', altJahre: 28, neu: 'wp', wpEU: true, zve: 60000, kind: false };
const fall = (zve: number) => ({
  zve,
  alt: foerderung({ ...b, zve, antrag: A.bis, effizienz: true }),
  neu: foerderung({ ...b, zve }),
});
const faelle = [60000, 45000, 35000, 25000].map(fall);
const [f60, f45, , f25] = faelle;
const aprilEU = foerderung({ ...b, antrag: april });
const aprilOhne = foerderung({ ...b, antrag: april, wpEU: false });
const gasAltEff = foerderung({ ...b, alt: 'gas', altJahre: 12, zve: 90000, antrag: A.bis, effizienz: true });
const gasAlt = foerderung({ ...b, alt: 'gas', altJahre: 12, zve: 90000, antrag: A.bis });
const gasNeu = foerderung({ ...b, alt: 'gas', altJahre: 12, zve: 90000 });
const kaeltemittel = P.technik.natuerliches_kaeltemittel_pflicht_ab;

export default defineGuide({
  id: 'effizienzbonus',
  group: 'foerderung',
  order: 109,
  mini: 'altneu',
  miniHref: 'waermepumpe-foerderung',
  related: ['kfw-458', 'waermepumpe-foerderung', 'klimageschwindigkeitsbonus', 'einkommensbonus', 'waermepumpe-kosten', 'pelletheizung'],
  sources: ['begem2023', 'begem2026', 'bmweFaq', 'kfwPm', 'merkblatt458'],
  de: {
    slug: 'effizienzbonus',
    nav: 'Effizienzbonus',
    card: 'Der Bonus für Erdwärme und natürliches Kältemittel ist seit dem 21. Juli 2026 gestrichen. Wer ihn noch bekommt und was 2027 kommt.',
    title: 'Effizienzbonus 2026: gestrichen seit 21. Juli, was nun gilt',
    description: `Effizienzbonus 2026: Die ${DE.pct(A.effizienz)} für Wärmepumpen gibt es nur noch bei Antrag bis 20.07.2026. Was der Wegfall kostet, wer dabei gewinnt und was ab 2027 kommt.`,
    h1: 'Effizienzbonus: abgeschafft, und wer ihn trotzdem noch bekommt',
    intro: 'Seit dem 21. Juli 2026 gibt es für eine Wärmepumpe mit Erdwärme oder Propan keinen Aufschlag mehr. Für ältere Anträge gilt er weiter, und für manche Haushalte ist die neue Förderung trotzdem besser.',
    resume: `Der Effizienzbonus war ein Aufschlag von ${DE.pct(A.effizienz)} auf die Heizungsförderung 458 für Wärmepumpen, die Wasser, Erdreich oder Abwasser als Wärmequelle nutzen oder mit einem natürlichen Kältemittel wie Propan arbeiten. Für Anträge, die ab dem 21. Juli 2026 bei der KfW eingehen, ist er gestrichen, ebenso der Zuschlag von ${DE.eur(A.biomasse_zuschlag)} für staubarme Biomassekessel. Wer bis zum 20. Juli 2026 beantragt hat, behält ihn: Diese Anträge werden nach der Richtlinie von 2023 geprüft und ausgezahlt. Ein Ersatz kommt im ersten Quartal 2027: Dann soll die Grundförderung für Wärmepumpen auf ${DE.pct(q1.wp_grund)} sinken, dazu ${DE.pct(q1.wertschoepfung)} Wertschöpfungsbonus für Geräte aus der EU. Der Starttag steht noch nicht fest. Für eine Wärmepumpe zu ${DE.eur(35000)}, die eine Ölheizung ersetzt, ergab der alte Antrag bei ${DE.eur(60000)} Einkommen ${DE.eur(f60.alt.zuschuss)}, heute sind es ${DE.eur(f60.neu.zuschuss)}. Mit ${DE.eur(25000)} Einkommen sind es heute dagegen ${DE.eur(f25.neu.zuschuss)} statt ${DE.eur(f25.alt.zuschuss)}.`,
    faqs: [
      { q: 'Bekomme ich den Effizienzbonus noch, wenn mein Antrag vom Juni 2026 ist?', a: `Ja. Ein Antrag, der bis zum 20. Juli 2026 bei der KfW eingegangen ist, wird nach der Richtlinie von 2023 geprüft, mit ${DE.pct(A.effizienz)} Effizienzbonus, ${DE.pct(A.kgb)} Klimabonus und ${DE.eur(A.hoechst_erste_we)} Höchstbetrag. Bereits erteilte Zusagen bleiben unverändert. Voraussetzung ist, dass die Wärmepumpe so eingebaut wird wie beantragt, also mit der angegebenen Wärmequelle oder dem natürlichen Kältemittel, und die Nachweise fristgerecht eingehen.` },
      { q: 'Lohnt es sich, auf die alte Zusage zu verzichten?', a: `Nur für Haushalte mit niedrigem Einkommen, und nur mit Geduld. Für dasselbe Vorhaben gilt nach einem Verzicht eine Sperre von sechs Monaten. Bei ${DE.eur(25000)} Einkommen bringt die neue Förderung im Beispiel ${DE.eur(f25.neu.zuschuss - f25.alt.zuschuss)} mehr, bei ${DE.eur(60000)} kostet sie ${DE.eur(f60.alt.zuschuss - f60.neu.zuschuss)}. Nach sechs Monaten können zudem Höchstbetrag und Klimabonus schon gesunken sein. Rechnen Sie beide Daten durch, bevor Sie verzichten.` },
      { q: 'Gibt es für Erdwärmepumpen jetzt gar keinen Aufschlag mehr?', a: `Nicht für die Technik selbst. Eine Sole-Wasser-Wärmepumpe bekommt seit dem 21. Juli 2026 dieselben ${DE.pct(F.grund)} Grundförderung wie eine Luftwärmepumpe, dazu gegebenenfalls Klima- und Einkommensbonus. Die höheren Kosten für Bohrung oder Kollektor zählen aber weiter zu den förderfähigen Kosten, solange der Höchstbetrag nicht erreicht ist. Ab dem ersten Quartal 2027 hängt ein Teil der Förderung an der Herkunft des Geräts, nicht an der Wärmequelle.` },
      { q: 'Muss die Wärmepumpe trotzdem ein natürliches Kältemittel haben?', a: `Heute nicht, aber die Richtlinie empfiehlt es. Für Anträge ab dem 1. Januar 2028 werden nach den technischen Mindestanforderungen nur noch Wärmepumpen mit natürlichem Kältemittel gefördert, etwa Propan (R290) oder Kohlendioxid (R744). Wer heute ein Gerät mit synthetischem Kältemittel kauft, bekommt dafür noch dieselbe Förderung, verliert aber den früheren Aufschlag dafür, dass er ein natürliches gewählt hätte.` },
      { q: 'Was ist aus dem Zuschlag für staubarme Pelletkessel geworden?', a: `Er ist ebenfalls zum 21. Juli 2026 entfallen. Bis dahin gab es pauschal ${DE.eur(A.biomasse_zuschlag)} extra für besonders feinstaubarme Biomasseheizungen. Das Ministerium begründet den Wegfall damit, dass solche Filter am Markt Standard geworden sind. Biomasseheizungen erhalten weiter Grundförderung und Boni nach denselben Regeln wie Wärmepumpen.` },
    ],
    body: (h) => `
<h2>Was der Effizienzbonus war</h2>
<p>Die Richtlinie vom 21. Dezember 2023 kannte unter Nummer 8.4.3 einen Effizienzbonus von ${h.pct(A.effizienz)} für Wärmepumpen (${h.src('begem2023', 'Richtlinie BEG EM 2023')}). Ihn bekam, wer als Wärmequelle Wasser, Erdreich oder Abwasser neu erschloss oder ein Gerät mit natürlichem Kältemittel einbaute. Er stand jedem Eigentümer zu, auch Vermietern, und wurde zur Grundförderung von ${h.pct(A.grund)} addiert. Für Biomasseheizungen gab es nach Nummer 8.4.6 stattdessen einen festen Zuschlag von ${h.eur(A.biomasse_zuschlag)}, wenn der Kessel besonders wenig Feinstaub ausstieß.</p>
<p>Zusammen mit Klima- und Einkommensbonus war die Förderung auf ${h.pct(A.deckel)} von ${h.eur(A.hoechst_erste_we)} begrenzt, also auf ${h.eur(A.deckel * A.hoechst_erste_we)} für ein Einfamilienhaus. Der Effizienzbonus half deshalb vor allem Haushalten ohne Einkommensbonus, denn wer alle Boni hatte, stieß ohnehin an den Deckel.</p>

<h2>Warum er wegfiel</h2>
<p>Die KfW kündigte die Streichung in ihrer ${h.src('kfwPm', 'Pressemitteilung vom 8. Juli 2026')} an: Effizienzbonus und Emissionsminderungszuschlag entfallen. In der neuen ${h.src('begem2026', 'Richtlinie vom 17. August 2026')}, in Kraft seit dem 21. Juli 2026, kommt der Bonus nicht mehr vor. Das Ministerium begründet den Schritt in seinen ${h.src('bmweFaq', 'Antworten auf häufige Fragen')} so: Der Bonus wurde überwiegend für natürliche Kältemittel gewährt und habe dazu beigetragen, dass diese inzwischen Marktstandard seien. Eine technikbezogene Förderung sei daher nicht mehr nötig. Gleichzeitig wollte der Bund das System vereinfachen und die Boni stärker am Einkommen ausrichten.</p>

<h2>Wer ihn noch bekommt</h2>
<p>Den Ausschlag gibt der Eingang des Antrags. Bei der KfW musste er bis zum 20. Juli 2026 um 20 Uhr eingegangen sein. In der Umstellungsphase vom 9. bis zum 20. Juli 2026 konnten keine neuen Bestätigungen zum Antrag mehr erstellt werden; wer schon eine hatte, durfte damit noch nach den alten Bedingungen beantragen. Für diese Anträge gilt die letzte Fassung der ersetzten Richtlinie. Bereits erteilte Zusagen bleiben verbindlich, eingereichte Anträge werden nach altem Recht geprüft.</p>
${h.table(['Situation', 'Effizienzbonus', 'Regeln'], [
  ['Zusage vor dem 21. Juli 2026', 'ja', 'Richtlinie 2023, unverändert'],
  ['Antrag bis 20. Juli 2026 eingegangen, Zusage später', 'ja', 'Richtlinie 2023'],
  ['Bestätigung zum Antrag vorhanden, Antrag ab 21. Juli 2026', 'nein', 'Richtlinie 2026'],
  ['Neuer Antrag heute', 'nein', 'Richtlinie 2026'],
  ['Verzicht auf alte Zusage, neuer Antrag für dasselbe Vorhaben', 'nein', 'frühestens sechs Monate nach dem Verzicht'],
], 'BMWE-FAQ A.5.2 und A.5.3, Merkblatt 458', ['l', 'l', 'l'])}
<p>Wer eine alte Zusage hat, muss die Anlage so einbauen wie beantragt. Wird aus der geplanten Erdwärmepumpe eine Luftwärmepumpe mit synthetischem Kältemittel, fehlt die Voraussetzung für den Bonus. Umgekehrt gilt ein Wechsel der Wärmequelle, etwa von Luft auf Wasser, nach der Produktseite der KfW als neues Vorhaben, für das die Sperrfrist nach einem Verzicht nicht greift.</p>

<h2>Was der Wegfall je Einkommen ausmacht</h2>
<p>Der Vergleich zeigt, dass die Reform nicht alle schlechter stellt. Gerechnet ist ein selbst bewohntes Einfamilienhaus mit Ölheizung und einer Wärmepumpe zu ${h.eur(35000)}, einmal mit Antrag am 20. Juli 2026 und Effizienzbonus, einmal mit Antrag heute.</p>
${h.table(['Einkommen', 'Antrag 20.07.2026', 'Satz', 'Antrag heute', 'Satz', 'Unterschied'], faelle.map((f) => [
  h.eur(f.zve), h.eur(f.alt.zuschuss), h.pct(f.alt.satzEigen), h.eur(f.neu.zuschuss), h.pct(f.neu.satzEigen), h.eur(f.neu.zuschuss - f.alt.zuschuss),
]), `Zu versteuerndes Haushaltseinkommen ohne Kind, Höchstbetrag alt ${h.eur(A.hoechst_erste_we)}, neu ${h.eur(F.hoechst_erste_we[0].betrag)}`, ['r', 'r', 'r', 'r', 'r', 'r'])}
<p>Wer gut verdient, verliert doppelt: den Effizienzbonus und einen Teil des Klimabonus, dazu ${h.eur(A.hoechst_erste_we - F.hoechst_erste_we[0].betrag)} förderfähige Kosten. Bei ${h.eur(45000)} gleicht die neue dritte Stufe des ${h.a('einkommensbonus', 'Einkommensbonus')} fast alles aus. Bei ${h.eur(25000)} liegt die neue Förderung vorn, weil der Deckel auf ${h.pct(F.deckel_niedrig)} gestiegen ist. Am deutlichsten trifft es Häuser ohne Bonus: Eine zwölf Jahre alte Gasheizung, ersetzt bei ${h.eur(90000)} Einkommen, brachte mit Effizienzbonus ${h.eur(gasAltEff.zuschuss)}, ohne ihn ${h.eur(gasAlt.zuschuss)}, und heute ${h.eur(gasNeu.zuschuss)}.</p>
<!--mini:warten-->

<h2>Was 2027 und 2028 kommt</h2>
<p>Einen Nachfolger für den Effizienzbonus gibt es nicht, aber zwei Änderungen betreffen dieselben Geräte. Erstens soll ab dem ersten Quartal 2027 die Grundförderung für Wärmepumpen auf ${h.pct(q1.wp_grund)} sinken. Dafür kommt ein Wertschöpfungsbonus von ${h.pct(q1.wertschoepfung)} für Wärmepumpen mit Ursprung in der EU. Die Richtlinie enthält beide Sätze bereits; Starttag, die genaue Abgrenzung der Herkunft und der Nachweis sind noch nicht veröffentlicht. Im Beispiel mit ${h.eur(60000)} Einkommen stünden bei einem Antrag im April 2027 ${h.eur(aprilEU.zuschuss)} mit EU-Gerät und ${h.eur(aprilOhne.zuschuss)} ohne. Beide Werte sind vorläufig, solange die Details fehlen.</p>
<p>Zweitens werden ab dem ${h.date(kaeltemittel)} nur noch Wärmepumpen mit natürlichem Kältemittel gefördert, etwa mit Propan (R290) oder Kohlendioxid (R744). Was bisher einen Aufschlag brachte, wird damit zur Bedingung. Wer heute ein Angebot einholt, kann den Fachbetrieb nach dem Kältemittel des Geräts fragen. Welche Kosten auf Sie zukommen, zeigt ${h.a('waermepumpe-kosten', 'Wärmepumpe Kosten')}, den Zuschuss für Ihren Antragstag der ${h.a('waermepumpe-foerderung', 'Förderrechner')}. Für Pelletkessel gilt Ähnliches beim Staub: Ab dem 1. Oktober 2027 gilt der strenge Staubgrenzwert, für den es früher den Zuschlag gab, laut Richtlinie für alle geförderten Biomasseanlagen (${h.a('pelletheizung', 'Pelletheizung Förderung')}).</p>

<h2>Woran Sie veraltete Angaben erkennen</h2>
<p>Eine Rechnung mit ${h.pct(A.effizienz)} Effizienzbonus, ${h.pct(A.kgb)} Klimabonus oder ${h.eur(A.hoechst_erste_we)} Höchstbetrag stammt aus der Zeit vor dem 21. Juli 2026. Für einen Antrag heute gelten ${h.pct(F.grund)} Grundförderung, ${h.pct(F.kgb_stufen[0].satz)} ${h.a('klimageschwindigkeitsbonus', 'Klimageschwindigkeitsbonus')} bis zum 31. Januar 2027, der dreistufige Einkommensbonus und ${h.eur(F.hoechst_erste_we[0].betrag)} Höchstbetrag. Das ganze Programm steht unter ${h.a('kfw-458', 'KfW 458')}.</p>`,
  },
  en: {
    slug: 'efficiency-bonus-heat-pump',
    nav: 'Efficiency bonus',
    card: 'The bonus for ground source and natural refrigerant ended on 21 July 2026. Who still gets it and what arrives in 2027.',
    title: 'Efficiency Bonus 2026: Scrapped on 21 July, What Applies',
    description: `Efficiency bonus 2026: the ${EN.pct(A.effizienz)} heat pump top-up only applies to applications made by 20 July 2026. What its loss costs, who gains and what comes in 2027.`,
    h1: 'Efficiency bonus: abolished, and who still receives it',
    intro: 'Since 21 July 2026 a ground source or propane heat pump earns no extra grant. Older applications keep it, and for some households the new rules pay more anyway.',
    resume: `The efficiency bonus (Effizienzbonus) was a ${EN.pct(A.effizienz)} top-up on the KfW 458 heating grant for heat pumps using water, ground or waste water as their source, or running on a natural refrigerant such as propane. It no longer applies to applications reaching KfW from 21 July 2026, and neither does the ${EN.eur(A.biomasse_zuschlag)} supplement for low-dust biomass boilers. Anyone who applied by 20 July 2026 keeps it: those applications are assessed and paid under the 2023 guideline. A replacement of sorts arrives in the first quarter of 2027, when the basic grant for heat pumps is due to fall to ${EN.pct(q1.wp_grund)}, with a ${EN.pct(q1.wertschoepfung)} value-added bonus for units made in the EU. The start date has not been set. For a ${EN.eur(35000)} heat pump replacing an oil boiler, the old rules paid ${EN.eur(f60.alt.zuschuss)} to a household on ${EN.eur(60000)}; today it gets ${EN.eur(f60.neu.zuschuss)}. A household on ${EN.eur(25000)}, by contrast, now gets ${EN.eur(f25.neu.zuschuss)} instead of ${EN.eur(f25.alt.zuschuss)}.`,
    faqs: [
      { q: 'Do I still get the efficiency bonus if I applied in June 2026?', a: `Yes. An application that reached KfW by 20 July 2026 is assessed under the 2023 guideline, with the ${EN.pct(A.effizienz)} efficiency bonus, a ${EN.pct(A.kgb)} climate bonus and a ${EN.eur(A.hoechst_erste_we)} cap. Approvals already issued stay as they are. The heat pump must be installed as applied for, with the stated heat source or natural refrigerant, and the evidence must arrive within the deadlines.` },
      { q: 'Should I withdraw an old approval to reapply under the new rules?', a: `Only on a low income, and only if you can wait. After withdrawing, the same project is locked for six months. On ${EN.eur(25000)} the new rules pay ${EN.eur(f25.neu.zuschuss - f25.alt.zuschuss)} more in our example; on ${EN.eur(60000)} they cost ${EN.eur(f60.alt.zuschuss - f60.neu.zuschuss)}. Six months later the cost cap and climate bonus may already have fallen. Run both dates through the calculator before you give anything up.` },
      { q: 'Is there no extra grant for ground source heat pumps any more?', a: `Not for the technology as such. Since 21 July 2026 a ground source heat pump gets the same ${EN.pct(F.grund)} basic grant as an air source one, plus the climate and income bonuses where they apply. Drilling or ground collector costs still count as eligible costs, up to the cap. From the first quarter of 2027, part of the grant is due to depend on where the unit was made, not on its heat source.` },
      { q: 'Does a funded heat pump still need a natural refrigerant?', a: `Not yet, though the guideline recommends one. For applications from 1 January 2028, the technical minimum requirements allow funding only for heat pumps with a natural refrigerant, such as propane (R290) or carbon dioxide (R744). A unit with a synthetic refrigerant bought today still gets the same grant, but the extra money for choosing a natural one is gone.` },
      { q: 'What happened to the supplement for low-dust pellet boilers?', a: `It also ended on 21 July 2026. Until then, particularly low-dust biomass boilers received a flat ${EN.eur(A.biomasse_zuschlag)} extra. The ministry says such filters have become standard on the market. Biomass boilers still receive the basic grant and bonuses under the same rules as heat pumps.` },
    ],
    body: (h) => `
<h2>What the efficiency bonus was</h2>
<p>The guideline of 21 December 2023 included, under no. 8.4.3, a ${h.pct(A.effizienz)} efficiency bonus for heat pumps (${h.src('begem2023', 'BEG EM guideline 2023')}). It went to anyone who tapped water, ground or waste water as a new heat source, or installed a unit with a natural refrigerant. Every owner could get it, landlords included, and it was added to the ${h.pct(A.grund)} basic grant. Biomass boilers instead had a flat ${h.eur(A.biomasse_zuschlag)} supplement under no. 8.4.6 if they emitted particularly little fine dust.</p>
<p>Together with the climate and income bonuses, the grant was capped at ${h.pct(A.deckel)} of ${h.eur(A.hoechst_erste_we)}, so ${h.eur(A.deckel * A.hoechst_erste_we)} for a single-family house. The efficiency bonus therefore mattered most to households without the income bonus; those with every bonus hit the ceiling anyway.</p>

<h2>Why it was dropped</h2>
<p>KfW announced the cut in its ${h.src('kfwPm', 'press release of 8 July 2026')}: the efficiency bonus and the emission reduction supplement end. The new ${h.src('begem2026', 'guideline of 17 August 2026')}, in force since 21 July 2026, no longer mentions it. The ministry explains in its ${h.src('bmweFaq', 'questions and answers')} that the bonus was mostly paid for natural refrigerants and helped make them the market standard, so technology-specific support is no longer needed. The government also wanted a simpler scheme with bonuses tied more closely to income.</p>

<h2>Who still receives it</h2>
<p>What counts is when the application arrived. At KfW the deadline was 8 pm on 20 July 2026. During the changeover from 9 to 20 July 2026 no new confirmations for the application (Bestätigung zum Antrag) could be issued; anyone who already had one could still apply under the old terms. Those applications fall under the last version of the replaced guideline. Approvals already issued remain binding, and applications already submitted are assessed under the old rules.</p>
${h.table(['Situation', 'Efficiency bonus', 'Rules'], [
  ['Approved before 21 July 2026', 'yes', '2023 guideline, unchanged'],
  ['Application received by 20 July 2026, approved later', 'yes', '2023 guideline'],
  ['Confirmation issued, application from 21 July 2026', 'no', '2026 guideline'],
  ['New application today', 'no', '2026 guideline'],
  ['Old approval withdrawn, new application for the same project', 'no', 'six months after the withdrawal at the earliest'],
], 'Ministry FAQ A.5.2 and A.5.3, information sheet 458', ['l', 'l', 'l'])}
<p>With an old approval, the system must be installed as applied for. If the planned ground source unit becomes an air source unit with a synthetic refrigerant, the condition for the bonus is gone. Conversely, KfW’s product page treats a change of heat source, say from air to water, as a new project, so the six-month lock after withdrawal does not apply to it.</p>

<h2>What losing it means at each income</h2>
<p>The comparison shows that the reform does not leave everyone worse off. It assumes an owner-occupied single-family house with an oil boiler and a ${h.eur(35000)} heat pump, once with an application on 20 July 2026 and the efficiency bonus, once with an application today.</p>
${h.table(['Income', 'Applied 20 Jul 2026', 'Rate', 'Applied today', 'Rate', 'Difference'], faelle.map((f) => [
  h.eur(f.zve), h.eur(f.alt.zuschuss), h.pct(f.alt.satzEigen), h.eur(f.neu.zuschuss), h.pct(f.neu.satzEigen), h.eur(f.neu.zuschuss - f.alt.zuschuss),
]), `Taxable household income without children, cap ${h.eur(A.hoechst_erste_we)} old, ${h.eur(F.hoechst_erste_we[0].betrag)} new`, ['r', 'r', 'r', 'r', 'r', 'r'])}
<p>Higher earners lose twice: the efficiency bonus and part of the climate bonus, plus ${h.eur(A.hoechst_erste_we - F.hoechst_erste_we[0].betrag)} of eligible costs. At ${h.eur(45000)} the new third band of the ${h.a('einkommensbonus', 'income bonus')} makes up almost all of it. At ${h.eur(25000)} the new rules come out ahead, because the ceiling has risen to ${h.pct(F.deckel_niedrig)}. Homes without any bonus are hit hardest: replacing a 12-year-old gas boiler on ${h.eur(90000)} brought ${h.eur(gasAltEff.zuschuss)} with the efficiency bonus, ${h.eur(gasAlt.zuschuss)} without it, and ${h.eur(gasNeu.zuschuss)} today.</p>
<!--mini:warten-->

<h2>What comes in 2027 and 2028</h2>
<p>There is no successor to the efficiency bonus, but two changes affect the same units. First, from the first quarter of 2027 the basic grant for heat pumps is due to fall to ${h.pct(q1.wp_grund)}, offset by a ${h.pct(q1.wertschoepfung)} value-added bonus for heat pumps originating in the EU. Both rates are already in the guideline; the start date, the exact definition of origin and the proof required have not been published. In our ${h.eur(60000)} example, an application in April 2027 would bring ${h.eur(aprilEU.zuschuss)} with an EU unit and ${h.eur(aprilOhne.zuschuss)} without. Both figures are provisional until the details are out.</p>
<p>Second, from ${h.date(kaeltemittel)} only heat pumps with a natural refrigerant will be funded, for example propane (R290) or carbon dioxide (R744). What used to earn a bonus becomes a condition. When you get a quote today, you can ask the installer which refrigerant the unit uses. ${h.a('waermepumpe-kosten', 'Heat pump costs')} covers what to budget, and the ${h.a('waermepumpe-foerderung', 'grant calculator')} shows the grant for your application date. Pellet boilers face a similar step on dust: from 1 October 2027 the strict dust limit that used to earn the supplement applies to every funded biomass system, according to the guideline (${h.a('pelletheizung', 'pellet boiler grant')}).</p>

<h2>How to spot outdated figures</h2>
<p>Any calculation showing a ${h.pct(A.effizienz)} efficiency bonus, a ${h.pct(A.kgb)} climate bonus or a ${h.eur(A.hoechst_erste_we)} cap dates from before 21 July 2026. Many English summaries written for expats have not been updated. An application today gets a ${h.pct(F.grund)} basic grant, the ${h.pct(F.kgb_stufen[0].satz)} ${h.a('klimageschwindigkeitsbonus', 'climate speed bonus')} until 31 January 2027, the three-band income bonus and a ${h.eur(F.hoechst_erste_we[0].betrag)} cap. The whole programme is set out under ${h.a('kfw-458', 'KfW 458')}.</p>`,
  },
});

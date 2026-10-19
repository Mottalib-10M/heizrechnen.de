import { defineGuide } from '../../lib/guide-types';
import { foerderung, type FoerderEingabe } from '../../lib/engine/foerderung';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Pelletheizung Förderung: gleiche Sätze wie andere erneuerbare Heizungen, Biomasse-Zuschlag seit 21.07.2026 gestrichen,
 * ab Q1 2027 bleibt die Grundförderung bei 30 % (nur Wärmepumpen sinken). Eigene Beispiele: Ölkessel 28 Jahre,
 * Pelletkessel 30.000 €, Einkommen 55.000 €, 38.000 €, 26.000 €; dazu das KfW-Beispiel Müller und Schmitz.
 */
const F = P.foerderung;
const S = P.steuer35c;
const heute = P.retrieved_at;
const b: FoerderEingabe = { antrag: heute, gebaeude: 'efh', einheiten: 1, kosten: 30000, selbstnutzer: true, alt: 'oel', altJahre: 28, neu: 'biomasse', wpEU: true, zve: 55000, kind: false };
const mitte = foerderung(b);
const knapp = foerderung({ ...b, zve: 38000 });
const klein = foerderung({ ...b, zve: 26000 });
const jungGas = foerderung({ ...b, alt: 'gas', altJahre: 12 });
const altReg = foerderung({ ...b, antrag: '2026-07-15' });
const feb27 = foerderung({ ...b, antrag: '2027-02-01' });
const apr27 = foerderung({ ...b, antrag: '2027-04-01' });
const wpApr = foerderung({ ...b, antrag: '2027-04-01', neu: 'wp', wpEU: false });
const wpAprEU = foerderung({ ...b, antrag: '2027-04-01', neu: 'wp', wpEU: true });
const aug28 = foerderung({ ...b, antrag: '2028-08-01' });
const mueller = foerderung({ ...b, kosten: 35000, alt: 'gas', altJahre: 10, zve: 47000 });
const steuer = Math.min(30000 * S.jahr1, S.max1) + Math.min(30000 * S.jahr2, S.max2) + Math.min(30000 * S.jahr3, S.max3);
const kgb = F.kgb_stufen[0].satz;
const zuschlag = F.alt.biomasse_zuschlag;

export default defineGuide({
  id: 'pelletheizung',
  group: 'foerderung',
  order: 115,
  mini: 'pellet',
  miniHref: 'waermepumpe-foerderung',
  related: ['kfw-458', 'klimageschwindigkeitsbonus', 'effizienzbonus', 'waermepumpe-foerderung', 'heizungsoptimierung', 'steuerbonus-35c'],
  sources: ['kfw458', 'merkblatt458', 'begem2026', 'kfwPm', 'bafaHzo'],
  de: {
    slug: 'pelletheizung-foerderung',
    nav: 'Pelletheizung Förderung',
    card: 'Zuschuss für Pelletkessel nach alter Heizung und Einkommen, ohne den gestrichenen Biomasse-Zuschlag, mit den technischen Pflichten.',
    title: 'Pelletheizung Förderung 2026: Sätze ohne Biomasse-Zuschlag',
    description: `Pelletheizung Förderung 2026: ${DE.pct(F.grund)} Grundförderung, ${DE.pct(kgb)} Klimabonus, Einkommensbonus, aber kein Zuschlag von ${DE.eur(zuschlag)} mehr. Mit Beispielen und Staubregeln.`,
    h1: 'Pelletheizung Förderung 2026: was die KfW noch zahlt',
    intro: 'Pelletkessel werden weiter gefördert, aber anders als in vielen Rechnungen im Netz: Der Zuschlag für staubarme Kessel ist weg, dafür bleibt die Grundförderung 2027 stabil.',
    resume: `Eine Pelletheizung im bestehenden Wohnhaus fördert die KfW im Programm 458 mit denselben Sätzen wie andere erneuerbare Heizungen: ${DE.pct(F.grund)} Grundförderung, ${DE.pct(kgb)} Klimageschwindigkeitsbonus für Selbstnutzer, die eine Öl-, Kohle-, Nachtspeicher- oder Gasetagenheizung oder eine mindestens 20 Jahre alte Gas- oder Biomasseheizung ersetzen, dazu je nach Einkommen bis zu ${DE.pct(F.einkommen_stufen[0].bonus)} Einkommensbonus. Gedeckelt ist bei ${DE.pct(F.deckel_standard)}, bei kleinem Einkommen bei ${DE.pct(F.deckel_niedrig)}, und die förderfähigen Kosten enden für die erste Wohnung bei ${DE.eur(F.hoechst_erste_we[0].betrag)}. Der Zuschlag von ${DE.eur(zuschlag)} für besonders staubarme Kessel gilt seit dem 21. Juli 2026 nicht mehr. Ersetzt ein Pelletkessel für ${DE.eur(30000)} eine 28 Jahre alte Ölheizung, bekommt ein Haushalt mit ${DE.eur(55000)} Einkommen ${DE.eur(mitte.zuschuss)}, mit ${DE.eur(38000)} sind es ${DE.eur(knapp.zuschuss)}. Anders als bei der Wärmepumpe soll die Grundförderung für Pellets ab 2027 nicht sinken.`,
    faqs: [
      { q: `Gibt es den Zuschlag von ${DE.eur(zuschlag)} für staubarme Pelletkessel noch?`, a: `Nein. Der Emissionsminderungszuschlag für Biomasseheizungen ist mit der neuen Richtlinie am 21. Juli 2026 entfallen, ebenso der Effizienzbonus für Wärmepumpen. Er gilt nur noch für Anträge, die bis zum 20. Juli 2026 bei der KfW eingegangen sind. Eine Rechnung, die heute noch ${DE.eur(zuschlag)} auf den Zuschuss addiert, beschreibt also die alten Regeln.` },
      { q: 'Bekommt eine Pelletheizung 2027 mehr Förderung als eine Wärmepumpe?', a: `Möglicherweise. Die Richtlinie senkt ab dem ersten Quartal 2027 nur die Grundförderung für Wärmepumpen auf ${DE.pct(F.q1_2027.wp_grund)}, mit ${DE.pct(F.q1_2027.wertschoepfung)} Bonus bei Herkunft aus der EU. Pellets behalten ${DE.pct(F.grund)}. Im Beispiel mit Ölheizung und ${DE.eur(55000)} Einkommen hieße ein Antrag im April 2027 ${DE.eur(apr27.zuschuss)} für Pellets, ${DE.eur(wpAprEU.zuschuss)} für eine Wärmepumpe aus der EU und ${DE.eur(wpApr.zuschuss)} ohne. Der Starttag ist offen.` },
      { q: 'Welche Pelletkessel und Pelletöfen werden gefördert?', a: 'Automatisch beschickte Pelletkessel und Pelletöfen mit Wassertasche, die Leistungs- und Feuerungsregelung und eine automatische Zündung haben, von einem akkreditierten Institut geprüft sind und einen Pufferspeicher einbinden. Das Gerät muss in der Liste der förderfähigen Biomasseanlagen des BAFA stehen. Luftgeführte Pelletöfen und handbeschickte Einzelöfen fallen heraus, ebenso gebrauchte Anlagen.' },
      { q: 'Verliere ich den Klimabonus, wenn die alte Gasheizung als Reserve bleibt?', a: 'Ja. Die Richtlinie verlangt für den Klimageschwindigkeitsbonus, dass die alte Heizung fachgerecht ausgebaut und entsorgt wird und die versorgten Wohnungen danach nicht mehr mit einer fossilen oder gasbetriebenen Heizung im oder am Gebäude beheizt werden. Ein Gaskessel für Spitzenlast neben dem Pelletkessel kostet also den Bonus. Die Grundförderung für den Pelletkessel bleibt davon unberührt.' },
      { q: 'Wird der Tausch eines alten Pelletkessels gegen einen neuen gefördert?', a: `Heute ja, mit ${DE.pct(F.grund)}, und mit Klimabonus, wenn der alte Kessel mindestens 20 Jahre läuft. Ab dem ersten Quartal 2027 ändert sich das: Ersetzt die neue Anlage eine erneuerbare Heizung, die seit dem 1. Januar 2008 in Betrieb ist, gibt es keine Förderung mehr; bei älteren Anlagen zählt nur noch ein pauschaler Teil der Kosten. Wer einen jüngeren Kessel tauschen will, sollte das vorher prüfen.` },
    ],
    body: (h) => `
<h2>Was die KfW für Pellets zahlt</h2>
<p>Biomasseheizungen gehören wie Wärmepumpen und Solarthermie zu den Heizungen, die das Programm 458 fördert (${h.src('begem2026', 'Richtlinie Nr. 5.3 b')}). Der Zuschuss folgt denselben Bausteinen: Grundförderung für jeden Eigentümer, Klimageschwindigkeitsbonus und Einkommensbonus nur für Selbstnutzer, alles bis zum Deckel. Was sich für Pellets seit dem 21. Juli 2026 geändert hat, ist der Wegfall des Emissionsminderungszuschlags von ${h.eur(zuschlag)} (${h.src('kfwPm', 'Pressemitteilung der KfW')}). Der Höchstbetrag für die erste Wohnung sank zugleich von ${h.eur(F.alt.hoechst_erste_we)} auf ${h.eur(F.hoechst_erste_we[0].betrag)}.</p>
${h.table(['Haushalt', 'Satz', 'Zuschuss', 'Eigenanteil'], [
  [`Ölheizung, ${h.eur(55000)} Einkommen`, h.pct(mitte.satzEigen), h.eur(mitte.zuschuss), h.eur(mitte.eigenanteil)],
  [`Ölheizung, ${h.eur(38000)} Einkommen`, h.pct(knapp.satzEigen), h.eur(knapp.zuschuss), h.eur(knapp.eigenanteil)],
  [`Ölheizung, ${h.eur(26000)} Einkommen`, h.pct(klein.satzEigen), h.eur(klein.zuschuss), h.eur(klein.eigenanteil)],
  [`Gasheizung 12 Jahre, ${h.eur(55000)}`, h.pct(jungGas.satzEigen), h.eur(jungGas.zuschuss), h.eur(jungGas.eigenanteil)],
], `Pelletkessel ${h.eur(30000)}, Einfamilienhaus, Antrag im Oktober 2026`, ['l', 'r', 'r', 'r'])}
<p>Bei ${h.eur(55000)} Einkommen gibt es keinen Einkommensbonus, es bleiben ${h.pct(F.grund)} plus ${h.pct(kgb)}. Mit ${h.eur(38000)} kämen ${h.pct(F.einkommen_stufen[1].bonus)} dazu, die Summe wird aber auf ${h.pct(F.deckel_standard)} gekürzt. Bei ${h.eur(26000)} liegt der Deckel bei ${h.pct(F.deckel_niedrig)}. Die junge Gasheizung löst keinen Klimabonus aus, weil sie keine 20 Jahre läuft (${h.a('klimageschwindigkeitsbonus', 'Klimageschwindigkeitsbonus')}). Zur Probe: Das Beispiel der KfW mit ${h.eur(35000)} für Pellets statt einer zehn Jahre alten Gasheizung und ${h.eur(47000)} Einkommen ergibt auch bei uns ${h.eur(mueller.zuschuss)}.</p>

<h2>Alte Rechnungen mit Zuschlag</h2>
<p>Viele Seiten rechnen noch mit dem alten Stand. Wer bis zum 20. Juli 2026 beantragt hatte, bekam für dieselbe Pelletheizung im ersten Beispiel ${h.eur(altReg.zuschuss)}: ${h.pct(F.alt.grund)} Grundförderung, ${h.pct(F.alt.kgb)} Klimabonus, ${h.eur(F.alt.hoechst_erste_we)} Höchstbetrag. Für einen Kessel, der besonders wenig Staub ausstieß, kam der Zuschlag von ${h.eur(zuschlag)} obendrauf, zusammen also ${h.eur(altReg.zuschuss + zuschlag)}. Heute sind es ${h.eur(mitte.zuschuss)}. Wer das Geld noch nach alten Regeln einplant, verrechnet sich um ${h.eur(altReg.zuschuss + zuschlag - mitte.zuschuss)}. Warum auch der Effizienzbonus fehlt, steht unter ${h.a('effizienzbonus', 'Effizienzbonus')}.</p>

<h2>Technische Pflichten für den Kessel</h2>
<p>Gefördert werden nur Anlagen aus der Liste der Biomasseanlagen, die das BAFA laufend pflegt. Die technischen Mindestanforderungen der Richtlinie verlangen für Pelletkessel eine automatische Beschickung, Leistungs- und Feuerungsregelung, automatische Zündung, eine Prüfung durch ein akkreditiertes Institut und einen Pufferspeicher, dessen Größe sich nach der Nennwärmeleistung richtet. Pelletöfen mit Wassertasche sind mit denselben Bedingungen förderfähig. Nicht gefördert werden luftgeführte Pelletöfen, handbeschickte Einzelöfen, Eigenbau und gebrauchte Anlagen.</p>
<p>Beim Staub gelten Grenzwerte, die heute für Pelletkessel strenger sind als für Scheitholz. Ab dem 1. Oktober 2027 gilt für alle Biomasseanlagen ein deutlich niedrigerer Staubgrenzwert, auf dem Niveau, das früher den Zuschlag auslöste. Bis zum 30. Juni 2027 will das Bundeswirtschaftsministerium prüfen, ob die Werte mit Blick auf die Verhandlungen in der EU angepasst werden. Fragen Sie beim Angebot, ob das Gerät den künftigen Wert schon einhält, wenn der Antrag nahe an diesem Datum liegt. Wie bei jeder geförderten Heizung gehört ein hydraulischer Abgleich dazu, bestätigt vom Fachbetrieb auf dem Formular der Branche.</p>
<!--mini:warten-->

<h2>Pellets oder Wärmepumpe ab 2027</h2>
<p>Am 1. Februar 2027 sinken Klimabonus und Höchstbetrag für alle Heizungen gleich. Der Pelletkessel aus dem ersten Beispiel brächte dann ${h.eur(feb27.zuschuss)}. Danach trennen sich die Wege: Ab dem ersten Quartal 2027 soll die Grundförderung nur für Wärmepumpen auf ${h.pct(F.q1_2027.wp_grund)} fallen, ausgeglichen durch ${h.pct(F.q1_2027.wertschoepfung)} Wertschöpfungsbonus, wenn das Gerät aus der EU stammt. Starttag und Nachweis sind noch nicht veröffentlicht.</p>
${h.table(['Antrag im April 2027', 'Satz', 'Zuschuss'], [
  ['Pelletkessel', h.pct(apr27.satzEigen), h.eur(apr27.zuschuss)],
  ['Wärmepumpe aus der EU', h.pct(wpAprEU.satzEigen), h.eur(wpAprEU.zuschuss)],
  ['Wärmepumpe ohne EU-Herkunft', h.pct(wpApr.satzEigen), h.eur(wpApr.zuschuss)],
], `Ölheizung ersetzt, ${h.eur(30000)} Kosten, ${h.eur(55000)} Einkommen`, ['l', 'r', 'r'])}
<p>Ab dem 1. August 2028 gibt es keinen Klimabonus mehr. Dann bliebe für den Pelletkessel bei diesem Einkommen die Grundförderung von ${h.eur(aug28.zuschuss)}. Höhere Förderung ist aber nur ein Teil der Rechnung. Brennstoff, Lagerraum, Schornstein und Wartung entscheiden über die laufenden Kosten. Eine amtliche Preisreihe für Pellets haben wir nicht ausgewertet, deshalb rechnen wir Heizkosten für Pellets nicht vor. Den Vergleich der Zuschüsse für die Wärmepumpe zeigt der ${h.a('waermepumpe-foerderung', 'Förderrechner')}.</p>

<h2>Bestehender Kessel: Staub mindern statt tauschen</h2>
<p>Wer schon einen Pellet- oder Hackschnitzelkessel hat, kann beim BAFA einen Zuschuss für Maßnahmen bekommen, die seinen Staubausstoß senken. Der Satz beträgt ${h.pct(P.bafa.staubminderung)} der förderfähigen Ausgaben (${h.src('bafaHzo', 'BAFA')}). Er gilt für Feuerungen ab einer Mindestleistung, nicht für Einzelraumöfen. Mehr dazu unter ${h.a('heizungsoptimierung', 'Heizungsoptimierung')}.</p>

<h2>Zuschuss oder Steuerbonus</h2>
<p>Statt des Zuschusses ist für ein selbst bewohntes Haus, das älter als ${S.objekt_mindestalter} Jahre ist, die Steuerermäßigung nach § 35c EStG möglich: ${h.pct(S.jahr1)}, ${h.pct(S.jahr2)} und ${h.pct(S.jahr3)} der Kosten über drei Jahre. Für ${h.eur(30000)} wären das ${h.eur(steuer)}, verteilt auf drei Steuererklärungen, und nur, wenn so viel Einkommensteuer anfällt. Beides für dieselbe Maßnahme geht nicht. Der Zuschuss liegt in allen Beispielen oben darüber, selbst ohne Klimabonus (${h.a('steuerbonus-35c', 'Steuerbonus')}). Wie bei jedem Antrag gilt: zuerst den Vertrag mit Bedingung, dann der Antrag bei der KfW, dann der Einbau (${h.src('merkblatt458', 'Merkblatt 458')}).</p>`,
  },
  en: {
    slug: 'pellet-boiler-grant',
    nav: 'Pellet boiler grant',
    card: 'Grant for a pellet boiler by old system and income, without the abolished biomass supplement, plus the technical conditions.',
    title: 'Pellet Boiler Grant Germany 2026: KfW Rates After the Reform',
    description: `Pellet boiler grant in Germany 2026: ${EN.pct(F.grund)} basic grant, ${EN.pct(kgb)} climate bonus, income bonus, but no more ${EN.eur(zuschlag)} supplement. Worked examples and dust rules.`,
    h1: 'Pellet boiler grant in Germany 2026: what KfW still pays',
    intro: 'Pellet boilers are still funded, but not the way many online calculations show: the low-dust supplement has gone, while the basic grant stays stable in 2027.',
    resume: `KfW funds a pellet boiler in an existing home under programme 458 at the same rates as other renewable heating: a ${EN.pct(F.grund)} basic grant, a ${EN.pct(kgb)} climate speed bonus (Klimageschwindigkeitsbonus) for owner-occupiers replacing an oil, coal, night storage or gas flat heater or a gas or biomass boiler at least 20 years old, plus an income bonus of up to ${EN.pct(F.einkommen_stufen[0].bonus)}. The total is capped at ${EN.pct(F.deckel_standard)}, or ${EN.pct(F.deckel_niedrig)} on a low income, and eligible costs stop at ${EN.eur(F.hoechst_erste_we[0].betrag)} for the first home. The ${EN.eur(zuschlag)} supplement for particularly low-dust boilers no longer applies since 21 July 2026. If a ${EN.eur(30000)} pellet boiler replaces a 28-year-old oil boiler, a household on ${EN.eur(55000)} receives ${EN.eur(mitte.zuschuss)}, and one on ${EN.eur(38000)} receives ${EN.eur(knapp.zuschuss)}. Unlike heat pumps, the basic grant for pellets is not set to fall in 2027.`,
    faqs: [
      { q: `Is the ${EN.eur(zuschlag)} low-dust supplement for pellet boilers still paid?`, a: `No. The emission reduction supplement for biomass boilers ended with the new guideline on 21 July 2026, as did the efficiency bonus for heat pumps. It still applies only to applications KfW received by 20 July 2026. Any calculation today that adds ${EN.eur(zuschlag)} to the grant is describing the old rules.` },
      { q: 'Will a pellet boiler get more funding than a heat pump in 2027?', a: `Possibly. From the first quarter of 2027 the guideline cuts only the heat pump basic grant to ${EN.pct(F.q1_2027.wp_grund)}, with a ${EN.pct(F.q1_2027.wertschoepfung)} bonus if made in the EU. Pellets keep ${EN.pct(F.grund)}. In the oil boiler example on ${EN.eur(55000)} income, an April 2027 application would bring ${EN.eur(apr27.zuschuss)} for pellets, ${EN.eur(wpAprEU.zuschuss)} for an EU heat pump and ${EN.eur(wpApr.zuschuss)} for one made elsewhere. The start date is open.` },
      { q: 'Which pellet boilers and stoves qualify for the grant?', a: 'Automatically fed pellet boilers and pellet stoves with a water jacket that have output and combustion control and automatic ignition, are tested by an accredited institute and are connected to a buffer tank. The unit must be on the BAFA list of eligible biomass systems. Air-only pellet stoves, manually fed stoves, self-built and second-hand units are excluded.' },
      { q: 'I bought an old farmhouse with an oil boiler: does a pellet boiler get the climate bonus?', a: `Yes, if you live there as your registered main residence. Oil boilers trigger the ${EN.pct(kgb)} bonus whatever their age, provided the old boiler is removed and disposed of properly and no fossil heating supplies the home afterwards. Your income bonus depends on German tax assessments for the second and third year before applying, so a recent move to Germany may rule that part out.` },
      { q: 'Is replacing an old pellet boiler with a new one still funded?', a: `Today yes, at ${EN.pct(F.grund)}, plus the climate bonus if the old boiler has run for at least 20 years. From the first quarter of 2027 that changes: if the new system replaces renewable heating in service since 1 January 2008, there is no grant; for older systems only a flat portion of the costs will count. Check this before planning to swap a younger boiler.` },
    ],
    body: (h) => `
<h2>What KfW pays for pellets</h2>
<p>Biomass heating is on the list of systems programme 458 funds, alongside heat pumps and solar thermal (${h.src('begem2026', 'guideline no. 5.3 b')}). The grant uses the same parts: a basic grant for every owner, the climate speed and income bonuses for owner-occupiers only, everything up to the ceiling. What changed for pellets on 21 July 2026 is the end of the ${h.eur(zuschlag)} emission reduction supplement (${h.src('kfwPm', 'KfW press release')}). The first-home cap fell at the same time from ${h.eur(F.alt.hoechst_erste_we)} to ${h.eur(F.hoechst_erste_we[0].betrag)}.</p>
${h.table(['Household', 'Rate', 'Grant', 'Own share'], [
  [`Oil boiler, ${h.eur(55000)} income`, h.pct(mitte.satzEigen), h.eur(mitte.zuschuss), h.eur(mitte.eigenanteil)],
  [`Oil boiler, ${h.eur(38000)} income`, h.pct(knapp.satzEigen), h.eur(knapp.zuschuss), h.eur(knapp.eigenanteil)],
  [`Oil boiler, ${h.eur(26000)} income`, h.pct(klein.satzEigen), h.eur(klein.zuschuss), h.eur(klein.eigenanteil)],
  [`Gas boiler 12 years, ${h.eur(55000)}`, h.pct(jungGas.satzEigen), h.eur(jungGas.zuschuss), h.eur(jungGas.eigenanteil)],
], `Pellet boiler ${h.eur(30000)}, single-family house, application October 2026`, ['l', 'r', 'r', 'r'])}
<p>On ${h.eur(55000)} there is no income bonus, leaving ${h.pct(F.grund)} plus ${h.pct(kgb)}. On ${h.eur(38000)} another ${h.pct(F.einkommen_stufen[1].bonus)} would be added, but the total is cut to ${h.pct(F.deckel_standard)}. On ${h.eur(26000)} the ceiling is ${h.pct(F.deckel_niedrig)}. The young gas boiler gives no climate bonus because it has not run for 20 years (${h.a('klimageschwindigkeitsbonus', 'climate speed bonus')}). As a check, KfW’s own example of ${h.eur(35000)} for pellets replacing a ten-year-old gas boiler on ${h.eur(47000)} income also gives ${h.eur(mueller.zuschuss)} in our calculator.</p>

<h2>Old calculations with the supplement</h2>
<p>Many pages still use the old figures. An application by 20 July 2026 would have brought ${h.eur(altReg.zuschuss)} for the same pellet boiler in the first example: ${h.pct(F.alt.grund)} basic grant, ${h.pct(F.alt.kgb)} climate bonus, a ${h.eur(F.alt.hoechst_erste_we)} cap. A particularly low-dust boiler added the ${h.eur(zuschlag)} supplement, ${h.eur(altReg.zuschuss + zuschlag)} in total. Today it is ${h.eur(mitte.zuschuss)}. Planning with the old rules overstates the money by ${h.eur(altReg.zuschuss + zuschlag - mitte.zuschuss)}. Why the efficiency bonus is also missing is explained under ${h.a('effizienzbonus', 'efficiency bonus')}.</p>

<h2>Technical conditions for the boiler</h2>
<p>Only systems on the biomass list that BAFA keeps up to date are funded. The guideline’s minimum technical requirements for pellet boilers are automatic feed, output and combustion control, automatic ignition, testing by an accredited institute and a buffer tank sized to the rated output. Pellet stoves with a water jacket qualify on the same terms. Air-only pellet stoves, manually fed stoves, self-built and second-hand systems are excluded.</p>
<p>Dust limits today are stricter for pellet boilers than for log wood. From 1 October 2027 a much lower dust limit applies to all biomass systems, at the level that used to trigger the supplement. By 30 June 2027 the federal economy ministry intends to review whether the limits should change in light of EU negotiations. If your application falls close to that date, ask the installer whether the unit already meets the future limit. As with any funded system, hydraulic balancing is required and confirmed by the installer on the industry form.</p>
<!--mini:warten-->

<h2>Pellets or heat pump from 2027</h2>
<p>On 1 February 2027 the climate bonus and cap fall equally for every system. The pellet boiler in the first example would then bring ${h.eur(feb27.zuschuss)}. After that the paths split: from the first quarter of 2027 only the heat pump basic grant is set to fall to ${h.pct(F.q1_2027.wp_grund)}, offset by a ${h.pct(F.q1_2027.wertschoepfung)} value-added bonus if the unit originates in the EU. The start date and proof are not yet published.</p>
${h.table(['Application April 2027', 'Rate', 'Grant'], [
  ['Pellet boiler', h.pct(apr27.satzEigen), h.eur(apr27.zuschuss)],
  ['Heat pump made in the EU', h.pct(wpAprEU.satzEigen), h.eur(wpAprEU.zuschuss)],
  ['Heat pump made elsewhere', h.pct(wpApr.satzEigen), h.eur(wpApr.zuschuss)],
], `Oil boiler replaced, ${h.eur(30000)} cost, ${h.eur(55000)} income`, ['l', 'r', 'r'])}
<p>From 1 August 2028 there is no climate bonus at all. The pellet boiler on this income would then keep the basic grant of ${h.eur(aug28.zuschuss)}. The grant is only part of the picture, though: fuel, storage room, chimney and servicing set the running costs. We have not analysed an official pellet price series, so we do not calculate pellet running costs. The ${h.a('waermepumpe-foerderung', 'grant calculator')} compares heat pump amounts.</p>

<h2>Existing boiler: cut the dust instead of replacing it</h2>
<p>If you already have a pellet or wood chip boiler, BAFA funds measures that reduce its dust emissions, at ${h.pct(P.bafa.staubminderung)} of eligible costs (${h.src('bafaHzo', 'BAFA')}). It applies to boilers above a minimum output, not to single-room stoves. More under ${h.a('heizungsoptimierung', 'heating optimisation')}.</p>

<h2>Grant or tax credit</h2>
<p>Instead of the grant, an owner-occupied home older than ${S.objekt_mindestalter} years can use the section 35c income tax credit: ${h.pct(S.jahr1)}, ${h.pct(S.jahr2)} and ${h.pct(S.jahr3)} of the costs over three years. For ${h.eur(30000)} that is ${h.eur(steuer)}, spread across three German tax returns, and only if you owe that much income tax. You cannot have both for the same work. The grant beats it in every example above, even without the climate bonus (${h.a('steuerbonus-35c', 'tax credit')}). As with any application, sign the conditional contract first, then apply to KfW, then install (${h.src('merkblatt458', 'information sheet 458')}).</p>`,
  },
});

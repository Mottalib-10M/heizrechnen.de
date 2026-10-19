import { defineGuide } from '../../lib/guide-types';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Heizungsoptimierung beim BAFA (BEG EM Nr. 5.4): 15 %, iSFP-Bonus nur über dem Höchstbetrag ohne iSFP, Staubminderung 50 %.
 * Eigene Beispiele, mit den Werten aus P gerechnet (kein Motor für das BAFA): Abgleich und Pumpe 2.400 €,
 * Niedertemperaturheizkörper im Dreifamilienhaus 14.000 €, Fußbodenheizung 38.000 € mit und ohne iSFP; Vergleich § 35c.
 */
const B = P.bafa;
const S = P.steuer35c;
const F = P.foerderung;
const cap = (n: number, isfp = false) => (isfp ? B.hoechst_erste_we_isfp : B.hoechst_erste_we) + (isfp ? 2 : 1) * F.hoechst_we_2_bis_6 * Math.min(Math.max(n - 1, 0), 5);
const bafa = (k: number, n = 1, isfp = false) => {
  const c = cap(n, isfp), f = Math.min(k, c);
  const bonus = isfp ? Math.max(0, f - cap(n)) * B.isfp_bonus : 0;
  return Math.round(f * B.optimierung + bonus);
};
const steuer = (k: number) => Math.round(Math.min(k * S.jahr1, S.max1) + Math.min(k * S.jahr2, S.max2) + Math.min(k * S.jahr3, S.max3));
const klein = 2400;
const mittel = 14000;
const gross = 38000;
const zKlein = bafa(klein);
const sKlein = steuer(klein);
const zMittel = bafa(mittel, 3);
const zGross = bafa(gross);
const zGrossIsfp = bafa(gross, 1, true);
const sGross = steuer(gross);
const satz35c = S.jahr1 + S.jahr2 + S.jahr3;

export default defineGuide({
  id: 'heizungsoptimierung',
  group: 'foerderung',
  order: 116,
  mini: 'optimierung',
  related: ['kfw-458', 'steuerbonus-35c', 'waermepumpe-foerderung', 'pelletheizung', 'heizkosten-rechner', 'foerderantrag'],
  sources: ['bafaHzo', 'bafaUeberblick', 'begem2026', 'estg35c', 'bmweFaq'],
  de: {
    slug: 'heizungsoptimierung',
    nav: 'Heizungsoptimierung',
    card: 'BAFA-Zuschuss für hydraulischen Abgleich, Pumpen und Heizkörper: wer ihn bekommt, wie viel, und wann der Steuerbonus mehr bringt.',
    title: 'Heizungsoptimierung Förderung 2026: BAFA, Abgleich und iSFP',
    description: `Heizungsoptimierung Förderung 2026: ${DE.pct(B.optimierung)} vom BAFA für hydraulischen Abgleich, Pumpen und Heizkörper, mit iSFP mehr. Wann der Steuerbonus mit ${DE.pct(satz35c)} besser ist.`,
    h1: 'Heizungsoptimierung Förderung 2026: Zuschuss vom BAFA',
    intro: 'Wer die bestehende Heizung besser einstellen oder umbauen lässt, statt sie zu tauschen, bekommt einen kleinen Zuschuss vom BAFA. Für wen er gilt, wie viel er bringt und wann der Steuerbonus die bessere Wahl ist.',
    resume: `Das BAFA fördert die Optimierung einer bestehenden Heizung mit ${DE.pct(B.optimierung)} der förderfähigen Ausgaben. Dazu zählen der hydraulische Abgleich mit Einstellung der Heizkurve, neue Heizungspumpen, die Anpassung der Vorlauftemperatur, gedämmte Rohrleitungen, Niedertemperaturheizkörper, Flächenheizungen, Wärmespeicher und Regeltechnik. Die Förderung gilt für Wohnhäuser mit höchstens ${B.optimierung_max_we} Wohnungen, deren Wärmeerzeuger älter als ${B.optimierung_alter_min} Jahre ist; ein Öl- oder Gaskessel darf nicht älter als ${B.optimierung_fossil_alter_max} Jahre sein. Förderfähig sind für die erste Wohnung bis ${DE.eur(B.hoechst_erste_we)} im Jahr, mit individuellem Sanierungsfahrplan bis ${DE.eur(B.hoechst_erste_we_isfp)}. Ein hydraulischer Abgleich mit neuer Pumpe für ${DE.eur(klein)} bringt ${DE.eur(zKlein)} Zuschuss. Für dieselbe Arbeit ergäbe der Steuerbonus nach § 35c EStG ${DE.eur(sKlein)} über drei Jahre, wenn das Haus selbst bewohnt und älter als ${S.objekt_mindestalter} Jahre ist. Beides zusammen geht nicht. Wer die Heizung ganz ersetzt, beantragt bei der KfW; dort ist der Abgleich Pflicht und wird mitgefördert.`,
    faqs: [
      { q: 'Wie viel zahlt das BAFA für einen hydraulischen Abgleich?', a: `${DE.pct(B.optimierung)} der Kosten, die der Fachbetrieb in Rechnung stellt. Für einen Abgleich mit neuer Hocheffizienzpumpe und Einstellung der Heizkurve für ${DE.eur(klein)} sind das ${DE.eur(zKlein)}. Lohnt sich der Antrag bei so kleinen Beträgen kaum, kann der Steuerbonus mehr bringen: ${DE.pct(satz35c)} über drei Jahre, für ein selbst bewohntes Haus, das älter als ${S.objekt_mindestalter} Jahre ist.` },
      { q: 'Warum fördert das BAFA die Optimierung einer 22 Jahre alten Gasheizung nicht?', a: `Weil die Förderung fossile Wärmeerzeuger nur bis zu einem Alter von ${B.optimierung_fossil_alter_max} Jahren umfasst. Ältere Öl- und Gaskessel sollen nicht mehr optimiert, sondern ersetzt werden. Für den Tausch zahlt die KfW mindestens ${DE.pct(F.grund)}, wer selbst wohnt, bekommt bei einer Gasheizung ab 20 Jahren zusätzlich den Klimageschwindigkeitsbonus. Der hydraulische Abgleich ist dort ohnehin Teil der geförderten Maßnahme.` },
      { q: 'Bringt ein individueller Sanierungsfahrplan bei der Optimierung mehr Geld?', a: `Etwas. Mit iSFP verdoppelt sich der Höchstbetrag für die erste Wohnung auf ${DE.eur(B.hoechst_erste_we_isfp)}, und es gibt ${DE.pct(B.isfp_bonus)} Bonus, aber nur auf den Teil der Kosten über dem Höchstbetrag ohne iSFP. Für eine Fußbodenheizung zu ${DE.eur(gross)} im Einfamilienhaus steigt der Zuschuss so von ${DE.eur(zGross)} auf ${DE.eur(zGrossIsfp)}. Für kleine Arbeiten wie einen Abgleich bringt der Fahrplan nichts.` },
      { q: 'Ist der Steuerbonus für die Heizungsoptimierung besser als der Zuschuss?', a: `Rechnerisch oft ja, wenn genug Einkommensteuer anfällt: § 35c EStG ermäßigt die Steuer um ${DE.pct(satz35c)} der Kosten, verteilt über drei Jahre, das BAFA zahlt ${DE.pct(B.optimierung)}. Das Haus muss älter als ${S.objekt_mindestalter} Jahre sein und selbst bewohnt, ein Fachbetrieb muss die Arbeit ausführen und bescheinigen. Die Arbeit muss vor dem 1. Januar 2030 abgeschlossen sein. Für dieselbe Maßnahme schließen sich beide Wege aus.` },
    ],
    body: (h) => `
<h2>Was als Heizungsoptimierung gilt</h2>
<p>Die Richtlinie für Einzelmaßnahmen trennt den Tausch der Heizung von ihrer Verbesserung (${h.src('begem2026', 'Richtlinie Nr. 5.4')}). Den Tausch fördert die KfW, die Optimierung das BAFA (${h.src('bafaHzo', 'BAFA')}). Gemeint sind alle Arbeiten an einer bestehenden Anlage, mit denen sie weniger Energie für dieselbe Wärme braucht.</p>
${h.table(['Maßnahme', 'Wozu', 'Gefördert'], [
  ['Hydraulischer Abgleich mit Heizkurve', 'jeder Heizkörper bekommt die passende Wassermenge', h.pct(B.optimierung)],
  ['Neue Heizungspumpe', 'weniger Strom, regelbare Leistung', h.pct(B.optimierung)],
  ['Vorlauftemperatur und Pumpenleistung anpassen', 'niedrigere Temperaturen, weniger Verluste', h.pct(B.optimierung)],
  ['Rohrleitungen dämmen', 'weniger Wärme im Keller', h.pct(B.optimierung)],
  ['Niedertemperaturheizkörper, Flächenheizung', 'Vorbereitung auf eine Wärmepumpe', h.pct(B.optimierung)],
  ['Wärmespeicher, Mess-, Steuer- und Regeltechnik', 'bessere Steuerung', h.pct(B.optimierung)],
  ['Optimierung einer Wärmepumpe', 'höhere Jahresarbeitszahl', h.pct(B.optimierung)],
  ['Staubminderung an Biomassekesseln', 'weniger Feinstaub', h.pct(B.staubminderung)],
], 'BAFA, Stand Oktober 2026', ['l', 'l', 'r'])}
<p>Der hydraulische Abgleich ist der Kern. Ohne ihn bekommen Heizkörper nahe der Pumpe zu viel warmes Wasser und entfernte zu wenig; die Anlage läuft dann mit höherer Temperatur als nötig. Für eine spätere Wärmepumpe zählt genau das, denn je niedriger die Vorlauftemperatur, desto weniger Strom braucht sie.</p>

<h2>Wer gefördert wird und wer nicht</h2>
<p>Die Förderung gilt für bestehende Gebäude mit höchstens ${B.optimierung_max_we} Wohnungen. Der Wärmeerzeuger muss älter als ${B.optimierung_alter_min} Jahre sein. Ist er ein Öl- oder Gaskessel, darf er nicht älter als ${B.optimierung_fossil_alter_max} Jahre sein. Ein Gaskessel von 2004 fällt also heraus. Für ihn ist der Tausch der richtige Weg, und dort gehört der Abgleich zur geförderten Maßnahme: Die KfW verlangt beim Einbau jeder neuen Heizung eine Optimierung des gesamten Verteilsystems, einen eigenen Antrag beim BAFA braucht es nicht (${h.a('kfw-458', 'KfW 458')}). Für dieselben Ausgaben ist immer nur ein Antrag möglich, entweder bei der KfW oder beim BAFA.</p>
<p>Antragsberechtigt sind Eigentümer, aber auch Eigentümergemeinschaften und andere Investoren. Anders als bei der KfW gibt es keine Boni nach Einkommen oder alter Heizung: Der Satz ist für alle gleich. Wer vermietet, bekommt dieselben ${h.pct(B.optimierung)} wie ein Selbstnutzer.</p>

<h2>Höchstbeträge und der Bonus mit Sanierungsfahrplan</h2>
<p>Förderfähig sind für die erste Wohnung bis ${h.eur(B.hoechst_erste_we)}, für jede zweite bis sechste bis ${h.eur(F.hoechst_we_2_bis_6)}, je Gebäude und Kalenderjahr. Mit einem individuellen Sanierungsfahrplan, dem iSFP eines Energieeffizienz-Experten, verdoppeln sich diese Beträge. Anders als bei der KfW sinken sie nicht jedes halbe Jahr (${h.src('bmweFaq', 'FAQ von BMWE, KfW und BAFA')}).</p>
<p>Der iSFP-Bonus von ${h.pct(B.isfp_bonus)} ist seit dem 21. Juli 2026 enger gefasst. Er gilt nur für den Teil der Kosten, der über dem Höchstbetrag ohne Fahrplan liegt, im Einfamilienhaus also über ${h.eur(B.hoechst_erste_we)}. Für kleine Arbeiten bringt er deshalb nichts.</p>
${h.table(['Vorhaben', 'Kosten', 'Zuschuss BAFA', 'Steuerbonus § 35c'], [
  ['Abgleich und neue Pumpe, Einfamilienhaus', h.eur(klein), h.eur(zKlein), h.eur(sKlein)],
  ['Niedertemperaturheizkörper, drei Wohnungen', h.eur(mittel), h.eur(zMittel), 'nur selbst bewohnte Wohnung'],
  ['Fußbodenheizung, Einfamilienhaus, ohne iSFP', h.eur(gross), h.eur(zGross), h.eur(sGross)],
  ['Fußbodenheizung, Einfamilienhaus, mit iSFP', h.eur(gross), h.eur(zGrossIsfp), h.eur(sGross)],
], `Eigene Beispiele; § 35c: ${h.pct(S.jahr1)}, ${h.pct(S.jahr2)} und ${h.pct(S.jahr3)} über drei Jahre`, ['l', 'r', 'r', 'r'])}
<p>Die Fachplanung und Baubegleitung durch einen Energieeffizienz-Experten fördert das BAFA zusätzlich mit ${h.pct(B.fachplanung)} der Kosten. Bei einem Abgleich im Einfamilienhaus ist das selten nötig, bei einem Umbau auf Flächenheizung kann es sich lohnen.</p>

<h2>Zuschuss oder Steuerbonus</h2>
<p>Für Optimierungen ist der Steuerbonus oft die bessere Wahl. § 35c EStG ermäßigt die Einkommensteuer um ${h.pct(satz35c)} der Kosten, verteilt auf das Jahr des Abschlusses und die beiden folgenden Jahre (${h.src('estg35c', '§ 35c EStG')}). Die Optimierung bestehender Heizungsanlagen steht ausdrücklich in der Liste der begünstigten Arbeiten. Voraussetzungen: Sie bewohnen das Haus selbst, es ist älter als ${S.objekt_mindestalter} Jahre, ein Fachbetrieb führt die Arbeit aus und bescheinigt sie, Sie zahlen per Überweisung, und die Arbeit ist vor dem 1. Januar 2030 abgeschlossen.</p>
<p>Im Beispiel mit ${h.eur(klein)} stehen ${h.eur(zKlein)} Zuschuss gegen ${h.eur(sKlein)} Steuerermäßigung. Der Zuschuss kommt sofort, der Steuerbonus erst mit den Steuerbescheiden, und nur, wenn Sie genug Einkommensteuer zahlen. Für eine vermietete Wohnung bleibt nur der Zuschuss. Beides für dieselbe Maßnahme schließt die Richtlinie aus; für verschiedene Maßnahmen am selben Haus lassen sich die Wege aber kombinieren, etwa Zuschuss für die neue Heizung und Steuerbonus für die Dämmung (${h.a('steuerbonus-35c', 'Steuerbonus Heizung')}).</p>
<!--mini:tausch-->

<h2>Antrag und Reihenfolge</h2>
<p>Auch beim BAFA gilt: Vor dem Antrag darf kein Auftrag ohne Bedingung unterschrieben und keine Arbeit begonnen sein. Ein Vertrag, der nur bei einer Förderzusage gilt, ist erlaubt. Der Antrag läuft über das Portal des BAFA (${h.src('bafaUeberblick', 'BAFA im Überblick')}), die Unterlagen sind auf Deutsch. Lassen Sie den Abgleich vom Fachbetrieb dokumentieren, mit der Wassermenge für jeden Heizkörper; beim Einbau einer geförderten neuen Heizung verlangt die Richtlinie dafür das Bestätigungsformular des Branchenverbands VdZ.</p>
<p>Bei einem Pellet- oder Hackschnitzelkessel kommt eine zweite Fördermöglichkeit hinzu: Maßnahmen gegen den Staubausstoß mit ${h.pct(B.staubminderung)} (${h.a('pelletheizung', 'Pelletheizung')}). Wie viel eine optimierte Heizung im Jahr kostet, zeigt der ${h.a('heizkosten-rechner', 'Heizkostenrechner')}. Wenn die Optimierung nicht mehr reicht, steht der Weg zur neuen Heizung unter ${h.a('foerderantrag', 'Antrag stellen')}.</p>`,
  },
  en: {
    slug: 'heating-optimisation-grant',
    nav: 'Heating optimisation',
    card: 'BAFA grant for hydraulic balancing, pumps and radiators: who gets it, how much, and when the tax credit pays more.',
    title: 'Heating Optimisation Grant Germany 2026: BAFA and Balancing',
    description: `Heating optimisation grant in Germany 2026: ${EN.pct(B.optimierung)} from BAFA for hydraulic balancing, pumps and radiators, more with a roadmap. When ${EN.pct(satz35c)} tax relief wins.`,
    h1: 'Heating optimisation grant in Germany 2026 (BAFA)',
    intro: 'If you improve or rework your existing heating instead of replacing it, BAFA pays a small grant. Who qualifies, what it brings and when the income tax credit is the better choice.',
    resume: `Germany’s Federal Office for Economic Affairs and Export Control (BAFA) funds the optimisation of an existing heating system at ${EN.pct(B.optimierung)} of eligible costs. That covers hydraulic balancing with the heating curve set, new circulation pumps, lower flow temperatures, pipe insulation, low-temperature radiators, underfloor heating, heat storage and controls. It applies to residential buildings with at most ${B.optimierung_max_we} homes whose heat generator is more than ${B.optimierung_alter_min} years old; an oil or gas boiler may not be older than ${B.optimierung_fossil_alter_max} years. Eligible costs are capped at ${EN.eur(B.hoechst_erste_we)} a year for the first home, or ${EN.eur(B.hoechst_erste_we_isfp)} with an individual renovation roadmap (iSFP). Hydraulic balancing with a new pump for ${EN.eur(klein)} brings a ${EN.eur(zKlein)} grant. For the same work the section 35c income tax credit would give ${EN.eur(sKlein)} over three years, if you live in the house and it is more than ${S.objekt_mindestalter} years old. You cannot have both. If you replace the heating entirely, you apply to KfW instead, where balancing is mandatory and funded.`,
    faqs: [
      { q: 'How much does BAFA pay for hydraulic balancing?', a: `${EN.pct(B.optimierung)} of what the installer invoices. For balancing with a new high-efficiency pump and the heating curve set, at ${EN.eur(klein)}, that is ${EN.eur(zKlein)}. With amounts this small the tax credit may pay more: ${EN.pct(satz35c)} over three years for an owner-occupied home older than ${S.objekt_mindestalter} years, provided you pay that much German income tax.` },
      { q: 'Why will BAFA not fund optimising my 22-year-old gas boiler?', a: `Because the grant covers fossil heat generators only up to ${B.optimierung_fossil_alter_max} years old. Older oil and gas boilers are meant to be replaced, not tuned. For replacement KfW pays at least ${EN.pct(F.grund)}, and owner-occupiers replacing a gas boiler aged 20 years or more also get the climate speed bonus. Hydraulic balancing is part of that funded work anyway.` },
      { q: 'Does a renovation roadmap (iSFP) increase the optimisation grant?', a: `A little. With an iSFP the first-home cap doubles to ${EN.eur(B.hoechst_erste_we_isfp)} and a ${EN.pct(B.isfp_bonus)} bonus is added, but only on the part of the cost above the cap without iSFP. For ${EN.eur(gross)} of underfloor heating in a single-family house the grant rises from ${EN.eur(zGross)} to ${EN.eur(zGrossIsfp)}. For small jobs such as balancing, the roadmap adds nothing.` },
      { q: 'I am an expat homeowner: is the tax credit or the BAFA grant better for optimisation?', a: `It depends on your German tax position. Section 35c reduces income tax by ${EN.pct(satz35c)} of the cost over three years, BAFA pays ${EN.pct(B.optimierung)} at once. The tax route needs a home you live in, older than ${S.objekt_mindestalter} years, work certified by a registered firm and enough income tax due in Germany. If most of your income is taxed abroad, the grant is usually the safer choice.` },
    ],
    body: (h) => `
<h2>What counts as heating optimisation</h2>
<p>The federal guideline for single measures separates replacing a heating system from improving it (${h.src('begem2026', 'guideline no. 5.4')}). KfW funds replacement, BAFA funds optimisation (${h.src('bafaHzo', 'BAFA')}). Optimisation means any work on an existing system that makes it use less energy for the same warmth.</p>
${h.table(['Measure', 'Purpose', 'Funded'], [
  ['Hydraulic balancing with heating curve', 'each radiator gets the right water flow', h.pct(B.optimierung)],
  ['New circulation pump', 'less electricity, adjustable output', h.pct(B.optimierung)],
  ['Adjusting flow temperature and pump output', 'lower temperatures, fewer losses', h.pct(B.optimierung)],
  ['Insulating pipes', 'less heat lost in the basement', h.pct(B.optimierung)],
  ['Low-temperature radiators, underfloor heating', 'preparing for a heat pump', h.pct(B.optimierung)],
  ['Heat storage, metering and controls', 'better control', h.pct(B.optimierung)],
  ['Optimising a heat pump', 'higher seasonal performance', h.pct(B.optimierung)],
  ['Dust reduction on biomass boilers', 'less fine dust', h.pct(B.staubminderung)],
], 'BAFA, October 2026', ['l', 'l', 'r'])}
<p>Hydraulic balancing (hydraulischer Abgleich) is the core. Without it, radiators near the pump get too much hot water and distant ones too little, so the system runs hotter than it needs to. That matters for a future heat pump, because the lower the flow temperature, the less electricity it uses.</p>

<h2>Who qualifies and who does not</h2>
<p>The grant applies to existing buildings with no more than ${B.optimierung_max_we} homes. The heat generator must be over ${B.optimierung_alter_min} years old. If it is an oil or gas boiler, it may not be older than ${B.optimierung_fossil_alter_max} years, so a gas boiler from 2004 is out. For that boiler, replacement is the route, and balancing is part of the funded work: KfW requires the whole distribution system to be optimised whenever a new system goes in, with no separate BAFA application (${h.a('kfw-458', 'KfW 458')}). The same costs can only ever be claimed once, either from KfW or from BAFA.</p>
<p>Owners can apply, and so can owners’ associations and other investors. Unlike KfW there are no bonuses for income or for the old system: the rate is the same for everyone. A landlord gets the same ${h.pct(B.optimierung)} as an owner-occupier.</p>

<h2>Caps and the renovation roadmap bonus</h2>
<p>Eligible costs are capped at ${h.eur(B.hoechst_erste_we)} for the first home and ${h.eur(F.hoechst_we_2_bis_6)} for each of the second to sixth, per building and calendar year. With an individual renovation roadmap (individueller Sanierungsfahrplan, iSFP) drawn up by an energy efficiency expert, the caps double. Unlike KfW’s, they do not fall every six months (${h.src('bmweFaq', 'ministry, KfW and BAFA FAQ')}).</p>
<p>The ${h.pct(B.isfp_bonus)} iSFP bonus has been narrower since 21 July 2026. It applies only to the part of the cost above the cap without a roadmap, so above ${h.eur(B.hoechst_erste_we)} in a single-family house. For small jobs it brings nothing.</p>
${h.table(['Project', 'Cost', 'BAFA grant', 'Tax credit s. 35c'], [
  ['Balancing and new pump, single-family house', h.eur(klein), h.eur(zKlein), h.eur(sKlein)],
  ['Low-temperature radiators, three homes', h.eur(mittel), h.eur(zMittel), 'own home only'],
  ['Underfloor heating, house, no iSFP', h.eur(gross), h.eur(zGross), h.eur(sGross)],
  ['Underfloor heating, house, with iSFP', h.eur(gross), h.eur(zGrossIsfp), h.eur(sGross)],
], `Our examples; section 35c: ${h.pct(S.jahr1)}, ${h.pct(S.jahr2)} and ${h.pct(S.jahr3)} over three years`, ['l', 'r', 'r', 'r'])}
<p>BAFA also funds specialist planning and site supervision by an energy efficiency expert at ${h.pct(B.fachplanung)} of the cost. For balancing in a house that is rarely needed; for a switch to underfloor heating it can be worth it.</p>

<h2>Grant or tax credit</h2>
<p>For optimisation the tax credit is often the better deal. Section 35c of the Income Tax Act cuts income tax by ${h.pct(satz35c)} of the cost, spread over the year the work is finished and the two following years (${h.src('estg35c', 'section 35c EStG')}). Optimising an existing heating system is named explicitly in the list of eligible work. The conditions: you live in the home, it is more than ${S.objekt_mindestalter} years old, a registered firm does and certifies the work, you pay by bank transfer, and the work is finished before 1 January 2030.</p>
<p>In the ${h.eur(klein)} example, ${h.eur(zKlein)} of grant stands against ${h.eur(sKlein)} of tax relief. The grant comes straight away, the tax relief only with your assessments and only if you pay enough German income tax. For a flat you let, only the grant is available. The guideline rules out both for the same work, but different measures on the same house can use different routes, for example a grant for new heating and the tax credit for insulation (${h.a('steuerbonus-35c', 'heating tax credit')}).</p>
<!--mini:tausch-->

<h2>Application and order of steps</h2>
<p>BAFA applies the same rule as KfW: before applying, no unconditional order may be signed and no work started. A contract that only takes effect on grant approval is allowed. You apply through BAFA’s online portal (${h.src('bafaUeberblick', 'BAFA overview')}), and the documents are in German. Ask the installer to document the balancing, with the water flow for each radiator; when a funded new system is installed, the guideline requires the confirmation form of the VdZ industry association for this.</p>
<p>For a pellet or wood chip boiler there is a second option: dust reduction measures at ${h.pct(B.staubminderung)} (${h.a('pelletheizung', 'pellet boiler grant')}). What an optimised system costs to run each year is shown by the ${h.a('heizkosten-rechner', 'heating cost calculator')}. If optimising is no longer enough, the route to a new system is under ${h.a('foerderantrag', 'how to apply')}.</p>`,
  },
});

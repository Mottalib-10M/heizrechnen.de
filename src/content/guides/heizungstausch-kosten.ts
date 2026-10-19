import { defineGuide } from '../../lib/guide-types';
import { foerderung, hoechstbetrag, type FoerderEingabe } from '../../lib/engine/foerderung';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Heizungstausch Kosten: was vom Gesamtpreis nach dem Zuschuss bleibt, je nach alter Heizung, Antragstag und Gebäude.
 * Eigenes Beispiel (wie der Mini-Rechner): 34.000 € mit Einbau, Einkommen 42.000 €. Dazu ein Dreifamilienhaus mit 60.000 €.
 * Bedingungen des Klimageschwindigkeitsbonus: Richtlinie BEG EM vom 17.08.2026, Nr. 8.4.4.
 */
const F = P.foerderung;
const B = P.bafa;
const heute = P.retrieved_at;
const b: FoerderEingabe = { antrag: heute, gebaeude: 'efh', einheiten: 1, kosten: 34000, selbstnutzer: true, alt: 'oel', altJahre: 28, neu: 'wp', wpEU: true, zve: 42000, kind: false };
const oel = foerderung(b);
const gasAlt = foerderung({ ...b, alt: 'gas', altJahre: 24 });
const gasJung = foerderung({ ...b, alt: 'gas', altJahre: 12 });
const etage = foerderung({ ...b, alt: 'gasetage', altJahre: 15 });
const speicher = foerderung({ ...b, alt: 'nachtspeicher', altJahre: 35 });
const pellet = foerderung({ ...b, neu: 'biomasse' });
const mitKind = foerderung({ ...b, kind: true });
const vermietet = foerderung({ ...b, selbstnutzer: false });
const TAGE = ['2027-02-01', '2027-08-01', '2028-02-01', '2028-08-01'];
const spaeter = TAGE.map((d) => ({ d, r: foerderung({ ...b, antrag: d }) }));
const drei = foerderung({ ...b, gebaeude: 'mfh', einheiten: 3, kosten: 60000 });
const dreiVermietet = foerderung({ ...b, gebaeude: 'mfh', einheiten: 3, kosten: 60000, selbstnutzer: false });
const H = hoechstbetrag(heute, 1);
const H3 = hoechstbetrag(heute, 3);
const kgb = F.kgb_stufen[0].satz;
const kgbJahre = F.kgb_mindestalter_gas_biomasse;

export default defineGuide({
  id: 'heizungstausch-kosten',
  group: 'kosten',
  order: 118,
  mini: 'tausch',
  miniHref: 'waermepumpe-foerderung',
  related: ['kfw-458', 'waermepumpe-kosten', 'klimageschwindigkeitsbonus', 'ergaenzungskredit', 'heizungsoptimierung', 'vermieter'],
  sources: ['begem2026', 'merkblatt458', 'kfw458', 'bmweFaq', 'bafaHzo', 'gmodg43'],
  de: {
    slug: 'heizungstausch-kosten',
    nav: 'Heizungstausch Kosten',
    card: 'Was vom Preis eines Heizungstauschs nach dem Zuschuss bleibt: nach alter Heizung, Antragstag, Einkommen und Gebäude.',
    title: 'Heizungstausch Kosten 2026: Was nach dem Zuschuss bleibt',
    description: `Heizungstausch Kosten 2026: Zuschuss ${DE.pct(F.grund)} bis ${DE.pct(F.deckel_niedrig)} auf höchstens ${DE.eur(H)}, je nach alter Heizung und Antragstag. Mit Mehrfamilienhaus und Fallen beim Bonus.`,
    h1: 'Heizungstausch Kosten: Ihr Eigenanteil nach alter Heizung und Antragstag',
    intro: 'Ob der Tausch teuer oder günstig wird, entscheidet nicht nur das Angebot, sondern auch die alte Heizung, der Tag des Antrags und wer im Haus wohnt.',
    resume: `Einen amtlichen Durchschnittspreis für den Heizungstausch gibt es nicht; was er kostet, steht im Angebot des Fachbetriebs. Amtlich geregelt ist dagegen, wie viel davon der Staat übernimmt. Für eine neue Heizung mit erneuerbarer Energie zahlt die KfW mindestens ${DE.pct(F.grund)} der förderfähigen Kosten, die beim Einfamilienhaus auf ${DE.eur(H)} begrenzt sind. Wer selbst im Haus wohnt, bekommt ${DE.pct(kgb)} Klimageschwindigkeitsbonus, wenn die alte Heizung mit Öl, Kohle, Nachtstrom oder als Gasetagenheizung läuft oder eine Gas- oder Biomasseheizung mindestens ${kgbJahre} Jahre alt ist. Dazu kommt bis ${DE.eur(F.einkommen_stufen[2].bis)} zu versteuerndem Einkommen der Einkommensbonus. Ein Beispiel: Ein Haushalt mit ${DE.eur(42000)} Einkommen tauscht eine Ölheizung gegen eine Wärmepumpe, Gesamtpreis ${DE.eur(34000)}. Der Zuschuss beträgt ${DE.eur(oel.zuschuss)}, selbst zu zahlen bleiben ${DE.eur(oel.eigenanteil)}. Wäre es eine erst 12 Jahre alte Gasheizung, gäbe es ${DE.eur(gasJung.zuschuss)}. Mit Antrag am 1. Februar 2027 wären es bei der Ölheizung noch ${DE.eur(spaeter[0].r.zuschuss)}, ab 1. August 2028 ${DE.eur(spaeter[3].r.zuschuss)}. Eine neue Gasheizung bekommt keinen Zuschuss.`,
    faqs: [
      { q: 'Gibt es den Klimageschwindigkeitsbonus auch, wenn die alte Heizung schon defekt ist?', a: `Nach dem Wortlaut der Richtlinie nicht. Nummer 8.4.4 verlangt den Austausch einer funktionstüchtigen Öl-, Kohle-, Gasetagen- oder Nachtspeicherheizung oder einer funktionstüchtigen Gas- oder Biomasseheizung ab ${kgbJahre} Jahren. Die alte Anlage muss außerdem fachgerecht abgebaut und entsorgt werden. Wer mit einer alten Heizung wartet, bis sie ausfällt, riskiert also neben dem sinkenden Bonussatz auch den Bonus selbst.` },
      { q: 'Was kostet der Heizungstausch, wenn wieder eine Gasheizung hineinkommt?', a: `Den vollen Preis: Aus dem Programm 458 gibt es für eine neue Gasheizung keinen Zuschuss, auch keinen Ergänzungskredit. Dafür gelten ab ${P.gesetz.biotreppe[0].ab.slice(0, 4)} die Pflichtanteile an Biomethan oder Wasserstoff nach § 43 GModG, beginnend mit ${DE.pct(P.gesetz.biotreppe[0].anteil)}. Wer vermietet, trägt für eine solche Heizung ab ${P.aufteilung.neue_fossile_heizung_ab.slice(0, 4)} die Hälfte der CO₂-Kosten. Diese Folgekosten gehören in den Vergleich.` },
      { q: 'Zählt die Miete einer Übergangsheizung zu den Kosten des Heizungstauschs?', a: 'Ja. Laut Merkblatt 458 sind Mietkosten für eine provisorische Heizung förderfähig, gerechnet ab dem Antrag und höchstens für ein Jahr. Das hilft, wenn die alte Heizung im Winter ausfällt und der Einbau der neuen erst später möglich ist. Die Miete läuft in dieselben förderfähigen Kosten ein und wird damit auch vom Höchstbetrag begrenzt.' },
      { q: 'Wie viel Zuschuss bekommt ein Haus mit drei Wohnungen, wenn ich eine davon bewohne?', a: `Der Höchstbetrag steigt auf ${DE.eur(H3)}: ${DE.eur(F.hoechst_erste_we[0].betrag)} für die erste und je ${DE.eur(F.hoechst_we_2_bis_6)} für die zweite und dritte Wohnung. Die Grundförderung gilt für das ganze Haus, die Boni nur für den Anteil Ihrer Wohnung. Bei ${DE.eur(60000)} Kosten, Ölheizung und ${DE.eur(42000)} Einkommen ergibt das ${DE.eur(drei.zuschuss)}, ohne eigene Wohnung im Haus ${DE.eur(dreiVermietet.zuschuss)}.` },
      { q: 'Wird ein Heizungstausch auch gefördert, wenn ich ihn in Raten über einen Anbieter bezahle?', a: 'Ja, auch Miete, Leasing oder Contracting einer neuen Heizung ist möglich. Die vertraglich vereinbarten Raten zählen laut Merkblatt 458 entsprechend der Nutzungsdauer für bis zu zehn Jahre zu den förderfähigen Kosten. Der Vertrag braucht wie beim Kauf eine Bedingung, die ihn an die Förderzusage knüpft.' },
    ],
    body: (h) => `
<h2>Was ein Heizungstausch kostet und was davon zählt</h2>
<p>Der Preis eines Heizungstauschs setzt sich aus mehr zusammen als dem Gerät. Förderfähig sind nach der ${h.src('begem2026', 'Richtlinie vom 17. August 2026')} das Material, der fachgerechte Einbau, die Inbetriebnahme und die nötigen vor- und nachbereitenden Arbeiten, die dort Umfeldmaßnahmen heißen. Dazu gehören die Optimierung des Verteilsystems mit hydraulischem Abgleich, ohne die es keinen Zuschuss gibt, sowie Fachplanung und Baubegleitung. Die Mindestinvestition liegt bei ${h.eur(F.mindestinvestition)}. Gebrauchte Geräte, Eigenbau und Prototypen sind ausgeschlossen. Wer selbst Hand anlegt, bekommt nur das Material gefördert, und auch das nur, wenn ein Fachbetrieb oder ein Energieeffizienz-Experte die Ausführung bestätigt.</p>
<p>Eine amtliche Statistik, was ein Tausch im Schnitt kostet, gibt es nicht. Die KfW rechnet in ihren eigenen Beispielen mit Beträgen zwischen ${h.eur(20000)} für ein Split-Gerät in einer Wohnung und ${h.eur(41000)} für Erdwärme mit Solarthermie im Zweifamilienhaus (${h.src('kfw458', 'Produktseite 458')}). Für eine Wärmepumpe im Einzelnen steht die Rechnung unter ${h.a('waermepumpe-kosten', 'Wärmepumpe Kosten')}.</p>

<h2>Die alte Heizung entscheidet mit</h2>
<p>Für denselben Tausch zu ${h.eur(34000)} und dasselbe Einkommen von ${h.eur(42000)} hängt der Zuschuss davon ab, was im Keller steht:</p>
${h.table(['Alte Heizung', 'Satz', 'Zuschuss', 'Sie zahlen'], [
  ['Ölheizung, jedes Alter', h.pct(oel.satzEigen), h.eur(oel.zuschuss), h.eur(oel.eigenanteil)],
  [`Gasheizung, 24 Jahre`, h.pct(gasAlt.satzEigen), h.eur(gasAlt.zuschuss), h.eur(gasAlt.eigenanteil)],
  ['Gasheizung, 12 Jahre', h.pct(gasJung.satzEigen), h.eur(gasJung.zuschuss), h.eur(gasJung.eigenanteil)],
  ['Gasetagenheizung, 15 Jahre', h.pct(etage.satzEigen), h.eur(etage.zuschuss), h.eur(etage.eigenanteil)],
  ['Nachtspeicher', h.pct(speicher.satzEigen), h.eur(speicher.zuschuss), h.eur(speicher.eigenanteil)],
  ['Ölheizung, Haus vermietet', h.pct(F.grund), h.eur(vermietet.zuschuss), h.eur(vermietet.eigenanteil)],
], `Einfamilienhaus, förderfähig höchstens ${h.eur(H)}, Antrag jetzt`, ['l', 'r', 'r', 'r'])}
<p>Der Unterschied steckt im ${h.a('klimageschwindigkeitsbonus', 'Klimageschwindigkeitsbonus')}. Er hat drei Bedingungen, die in vielen Kostenrechnungen fehlen. Die alte Heizung muss funktionstüchtig sein. Sie muss fachgerecht abgebaut und entsorgt werden. Und danach darf keine fossile oder mit Gas betriebene Heizung die Wohnung mehr versorgen, ausgenommen Brennstoffzellen und wasserstofffähige Heizungen. Eine Pelletheizung statt der Wärmepumpe bekommt übrigens denselben Satz, im Beispiel ebenfalls ${h.eur(pellet.zuschuss)}. Mit einem Kind unter 18 zählt das Einkommen ${h.eur(F.familienzuschlag)} niedriger, der Zuschuss steigt dann auf ${h.eur(mitKind.zuschuss)}.</p>

<h2>Der Tag des Antrags</h2>
<p>Seit der neuen Richtlinie sinken zwei Größen in festen Schritten: der Höchstbetrag für die erste Wohnung und der Klimageschwindigkeitsbonus. Maßgeblich ist der Tag, an dem der Antrag bei der KfW eingeht, nicht der Tag des Einbaus. Für die Ölheizung aus dem Beispiel:</p>
${h.table(['Antrag ab', 'Höchstbetrag', 'Zuschuss', 'Sie zahlen'], [
  [`jetzt (${h.date(heute)})`, h.eur(H), h.eur(oel.zuschuss), h.eur(oel.eigenanteil)],
  ...spaeter.map((x) => [h.date(x.d), h.eur(x.r.hoechstbetrag), h.eur(x.r.zuschuss), h.eur(x.r.eigenanteil)]),
], `${h.eur(34000)} Gesamtkosten, Einkommen ${h.eur(42000)}`, ['l', 'r', 'r', 'r'])}
<p>Zwischen einem Antrag heute und einem im August 2028 liegen im Beispiel ${h.eur(oel.zuschuss - spaeter[3].r.zuschuss)}. Nach der Zusage bleiben ${F.bewilligung_monate} Monate für den Einbau, ein früher Antrag zwingt also nicht zu einem überstürzten Tausch. Den Eigenanteil kann der ${h.a('ergaenzungskredit', 'Ergänzungskredit')} decken:</p>
<!--mini:kredit-->

<h2>Mehrfamilienhaus und Vermietung</h2>
<p>Im Haus mit mehreren Wohnungen wächst der Höchstbetrag: je ${h.eur(F.hoechst_we_2_bis_6)} für die zweite bis sechste Wohnung, je ${h.eur(F.hoechst_we_ab_7)} ab der siebten. Ein Dreifamilienhaus kommt auf ${h.eur(H3)}. Die Grundförderung gilt für das ganze Gebäude, die Boni nur anteilig für die Wohnung, die der Eigentümer selbst bewohnt (${h.src('merkblatt458', 'Merkblatt 458')}). Bei ${h.eur(60000)} Kosten bekommt der Eigentümer, der eine der drei Wohnungen selbst bewohnt, ${h.eur(drei.zuschuss)}; vermietet er alle drei, sind es ${h.eur(dreiVermietet.zuschuss)}. Mehr unter ${h.a('vermieter', 'Heizungsförderung für Vermieter')}.</p>

<h2>Tausch direkt nach dem Hauskauf</h2>
<p>Viele Heizungen werden gleich nach einem Kauf getauscht. Für die Boni zählt dabei der Stand am Tag des Antrags: Selbstnutzer ist nach der Richtlinie, wer dann als Eigentümer im Grundbuch steht und die Wohnung als Haupt- oder alleinigen Wohnsitz bewohnt, nachgewiesen durch Grundbuchauszug und Meldebescheinigung. Wer den Antrag stellt, bevor er umgemeldet ist, bekommt nur die Grundförderung, und eine nachträgliche Änderung der Boni ist laut KfW grundsätzlich nicht möglich. Das Gebäude selbst muss mindestens ${F.gebaeude_mindestalter_jahre} Jahre alt sein, gerechnet ab dem Bauantrag. Das Einkommen kommt aus den Steuerbescheiden des zweiten und dritten Jahres vor dem Antrag, unabhängig davon, wo Sie damals gewohnt haben.</p>

<h2>Wenn es kein ganzer Tausch sein soll</h2>
<p>Nicht jede alte Heizung muss sofort raus. Wer die bestehende Anlage verbessert, etwa Pumpen tauscht, die Heizkurve einstellt oder Heizkörper ersetzt, kann beim ${h.src('bafaHzo', 'BAFA')} ${h.pct(B.optimierung)} Zuschuss beantragen. Das gilt in Gebäuden mit höchstens ${B.optimierung_max_we} Wohnungen, für Anlagen, die älter als ${B.optimierung_alter_min} Jahre sind; fossile Heizungen dürfen höchstens ${B.optimierung_fossil_alter_max} Jahre alt sein (${h.a('heizungsoptimierung', 'Heizungsoptimierung')}). Wer sich für eine neue Gas- oder Ölheizung entscheidet, zahlt den Preis allein und muss ab ${P.gesetz.biotreppe[0].ab.slice(0, 4)} einen wachsenden Anteil klimafreundlicher Brennstoffe nach ${h.src('gmodg43', '§ 43 GModG')} nachweisen. Die Sätze des Programms im Ganzen erklärt ${h.a('kfw-458', 'KfW 458')}; offene Fragen zur Richtlinie beantworten die ${h.src('bmweFaq', 'FAQ von Ministerium, KfW und BAFA')}.</p>`,
  },
  en: {
    slug: 'replacing-heating-cost',
    nav: 'Cost of replacing heating',
    card: 'What is left of the price of a heating replacement after the grant: by old system, application date, income and building.',
    title: 'Heating Replacement Cost Germany 2026: What You Pay Net',
    description: `Heating replacement cost in Germany 2026: a ${EN.pct(F.grund)} to ${EN.pct(F.deckel_niedrig)} grant on up to ${EN.eur(H)}, by old system and application date. Calculator, multi-unit houses, bonus traps.`,
    h1: 'Heating replacement cost in Germany: your share by old system and application date',
    intro: 'Whether a replacement turns out cheap or dear depends not only on the quote, but on the old system, the day you apply and who lives in the house.',
    resume: `There is no official average price for replacing a heating system in Germany; the cost is whatever the installer quotes. What is official is how much of it the state covers. For new heating that runs on renewable energy, KfW pays at least ${EN.pct(F.grund)} of eligible costs, capped at ${EN.eur(H)} for a single-family house. If you live in the house, you get a ${EN.pct(kgb)} climate speed bonus when the old system runs on oil, coal or night storage, is a gas heater serving one flat, or is a gas or biomass boiler at least ${kgbJahre} years old. The income bonus is added for taxable income up to ${EN.eur(F.einkommen_stufen[2].bis)}. An example: a household with ${EN.eur(42000)} income replaces an oil boiler with a heat pump for ${EN.eur(34000)} in total. The grant is ${EN.eur(oel.zuschuss)}, leaving ${EN.eur(oel.eigenanteil)} to pay. Had it been a gas boiler only 12 years old, the grant would be ${EN.eur(gasJung.zuschuss)}. Applying on 1 February 2027, the oil case would get ${EN.eur(spaeter[0].r.zuschuss)}, and from 1 August 2028 ${EN.eur(spaeter[3].r.zuschuss)}. A new gas boiler gets no grant at all.`,
    faqs: [
      { q: 'Do I still get the climate speed bonus if the old boiler has already broken down?', a: `Going by the wording of the guideline, no. Item 8.4.4 requires the replacement of a working oil, coal, gas flat heater or night storage system, or a working gas or biomass boiler of at least ${kgbJahre} years. The old system must also be properly removed and disposed of. If you buy a house with an old boiler and wait for it to fail, you risk losing the bonus, not just a lower rate.` },
      { q: 'What does a replacement cost if a gas boiler goes back in?', a: `The full price: programme 458 pays no grant for a new gas boiler, and no top-up loan either. Instead, from ${P.gesetz.biotreppe[0].ab.slice(0, 4)} the required shares of biomethane or hydrogen under section 43 of the Building Modernisation Act apply, starting at ${EN.pct(P.gesetz.biotreppe[0].anteil)}. Landlords pay half the CO₂ cost of such a boiler from ${P.aufteilung.neue_fossile_heizung_ab.slice(0, 4)}. Those follow-on costs belong in the comparison.` },
      { q: 'Does renting a temporary heater count towards the replacement cost?', a: 'Yes. According to information sheet 458, rent for a temporary heating system is eligible, counted from the application and for one year at most. That helps if the old system fails in winter and the new one cannot be fitted until later. The rent goes into the same eligible costs and is therefore limited by the same cap.' },
      { q: 'How much grant does a three-flat house get if I live in one of the flats?', a: `The cap rises to ${EN.eur(H3)}: ${EN.eur(F.hoechst_erste_we[0].betrag)} for the first flat and ${EN.eur(F.hoechst_we_2_bis_6)} each for the second and third. The basic grant covers the whole building, the bonuses only your flat’s share. With ${EN.eur(60000)} of costs, an oil boiler and ${EN.eur(42000)} income, that gives ${EN.eur(drei.zuschuss)}; if you live elsewhere, ${EN.eur(dreiVermietet.zuschuss)}.` },
      { q: 'Is a replacement still funded if I pay a provider in instalments?', a: 'Yes, renting, leasing or contracting a new heating system is possible. According to information sheet 458, the instalments agreed in the contract count as eligible costs for up to ten years, in line with the service life. As with a purchase, the contract needs a condition tying it to grant approval.' },
    ],
    body: (h) => `
<h2>What a replacement costs and what counts</h2>
<p>The price of a heating replacement covers more than the unit. Under the ${h.src('begem2026', 'guideline of 17 August 2026')}, eligible items are materials, professional installation, commissioning and the necessary preparatory and finishing work the guideline calls ancillary measures (Umfeldmaßnahmen). They include optimising the distribution system with hydraulic balancing, without which there is no grant, as well as specialist planning and site supervision. The minimum investment is ${h.eur(F.mindestinvestition)}. Second-hand units, self-built systems and prototypes are excluded. If you do work yourself, only materials are funded, and only when an installer or an energy efficiency expert confirms the work was done properly.</p>
<p>No official statistic shows what a replacement costs on average. KfW’s own examples range from ${h.eur(20000)} for a split unit in a flat to ${h.eur(41000)} for ground source with solar thermal in a two-family house (${h.src('kfw458', 'product page 458')}). The figures for a heat pump in detail are under ${h.a('waermepumpe-kosten', 'heat pump cost')}.</p>

<h2>The old system matters</h2>
<p>For the same ${h.eur(34000)} replacement and the same ${h.eur(42000)} income, the grant depends on what is in the basement today:</p>
${h.table(['Old system', 'Rate', 'Grant', 'You pay'], [
  ['Oil boiler, any age', h.pct(oel.satzEigen), h.eur(oel.zuschuss), h.eur(oel.eigenanteil)],
  ['Gas boiler, 24 years', h.pct(gasAlt.satzEigen), h.eur(gasAlt.zuschuss), h.eur(gasAlt.eigenanteil)],
  ['Gas boiler, 12 years', h.pct(gasJung.satzEigen), h.eur(gasJung.zuschuss), h.eur(gasJung.eigenanteil)],
  ['Gas heater for one flat, 15 years', h.pct(etage.satzEigen), h.eur(etage.zuschuss), h.eur(etage.eigenanteil)],
  ['Night storage heaters', h.pct(speicher.satzEigen), h.eur(speicher.zuschuss), h.eur(speicher.eigenanteil)],
  ['Oil boiler, house let out', h.pct(F.grund), h.eur(vermietet.zuschuss), h.eur(vermietet.eigenanteil)],
], `Single-family house, eligible at most ${h.eur(H)}, applying now`, ['l', 'r', 'r', 'r'])}
<p>The difference lies in the ${h.a('klimageschwindigkeitsbonus', 'climate speed bonus')}. It has three conditions that many cost estimates leave out. The old system must be in working order. It must be properly removed and disposed of. And afterwards no fossil or gas-fired heating may supply the home, except fuel cells and hydrogen-ready systems. A pellet boiler instead of the heat pump gets the same rate, ${h.eur(pellet.zuschuss)} in the example. With a child under 18, KfW counts income ${h.eur(F.familienzuschlag)} lower and the grant rises to ${h.eur(mitKind.zuschuss)}. Remember that income is proven with German tax assessments only, and that both bonuses need the house to be your main residence.</p>

<h2>The day you apply</h2>
<p>Since the new guideline, two figures fall in fixed steps: the cap for the first home and the climate speed bonus. What counts is the day KfW receives the application, not the day of installation. For the oil boiler example:</p>
${h.table(['Application from', 'Cap', 'Grant', 'You pay'], [
  [`now (${h.date(heute)})`, h.eur(H), h.eur(oel.zuschuss), h.eur(oel.eigenanteil)],
  ...spaeter.map((x) => [h.date(x.d), h.eur(x.r.hoechstbetrag), h.eur(x.r.zuschuss), h.eur(x.r.eigenanteil)]),
], `${h.eur(34000)} total cost, income ${h.eur(42000)}`, ['l', 'r', 'r', 'r'])}
<p>Between applying today and applying in August 2028, the example loses ${h.eur(oel.zuschuss - spaeter[3].r.zuschuss)}. After approval you have ${F.bewilligung_monate} months to install, so an early application does not force a rushed job. The ${h.a('ergaenzungskredit', 'top-up loan')} can cover your own share:</p>
<!--mini:kredit-->

<h2>Multi-unit houses and letting</h2>
<p>In a house with several homes the cap grows: ${h.eur(F.hoechst_we_2_bis_6)} for each of the second to sixth, ${h.eur(F.hoechst_we_ab_7)} each from the seventh. A three-unit house reaches ${h.eur(H3)}. The basic grant covers the whole building, the bonuses only the share of the home the owner lives in (${h.src('merkblatt458', 'information sheet 458')}). With ${h.eur(60000)} of costs, an owner living in one of the three flats gets ${h.eur(drei.zuschuss)}; letting all three, ${h.eur(dreiVermietet.zuschuss)}. More under ${h.a('vermieter', 'heating grants for landlords')}.</p>

<h2>Replacing right after buying a house</h2>
<p>Many systems are replaced soon after a purchase, and the timing decides about the bonuses. For the bonuses, what counts is the situation on the day of the application: an owner-occupier, in the guideline’s terms, is someone entered in the land register (Grundbuch) as owner who lives in the home as their main or only residence, proven by a land register extract and a registration certificate (Meldebescheinigung). If you apply before you have registered your address there, you get the basic grant only, and KfW says the bonuses can generally not be changed afterwards. The building must be at least ${F.gebaeude_mindestalter_jahre} years old, counted from the planning application. Income comes from the tax assessments for the second and third year before the application, and income earned abroad counts as well.</p>

<h2>When a full replacement is not the plan</h2>
<p>Not every old system has to go at once. If you improve the existing one, for example new pumps, a reset heating curve or new radiators, ${h.src('bafaHzo', 'BAFA')} pays a ${h.pct(B.optimierung)} grant. It applies to buildings with up to ${B.optimierung_max_we} homes and systems older than ${B.optimierung_alter_min} years; fossil boilers may be at most ${B.optimierung_fossil_alter_max} years old (${h.a('heizungsoptimierung', 'heating optimisation')}). If you choose a new gas or oil boiler, you pay the full price and from ${P.gesetz.biotreppe[0].ab.slice(0, 4)} must prove a growing share of low-carbon fuel under ${h.src('gmodg43', 'section 43 of the Building Modernisation Act')}. The programme as a whole is explained under ${h.a('kfw-458', 'KfW 458')}; open questions on the guideline are answered in the ${h.src('bmweFaq', 'FAQ of the ministry, KfW and BAFA')}.</p>`,
  },
});

import { defineGuide } from '../../lib/guide-types';
import { foerderung, hoechstbetrag, type FoerderEingabe } from '../../lib/engine/foerderung';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Heizungsförderung in der Wohnungseigentümergemeinschaft: Basisantrag der WEG, Zusatzantrag je Selbstnutzer.
 * Eigenes Beispiel = Rechenbeispiel „WEG Am Grünen Grund 4“ der KfW-Produktseite (sieben Wohnungen, 140.000 €),
 * nachgerechnet mit dem Motor; dazu eine Gasetagenheizung im Sondereigentum (acht Wohnungen, 18.000 €).
 */
const F = P.foerderung;
const heute = P.retrieved_at;
const w: FoerderEingabe = { antrag: heute, gebaeude: 'weg', einheiten: 7, kosten: 140000, selbstnutzer: true, mea: 0.15, alt: 'gas', altJahre: 25, neu: 'wp', wpEU: true, zve: 50000, kind: false };
const schmidt = foerderung(w);
const mayer = foerderung({ ...w, kind: true });
const schulze = foerderung({ ...w, mea: 0.12, zve: 30000 });
const vermietet = foerderung({ ...w, selbstnutzer: false });
const schmidtFeb = foerderung({ ...w, antrag: '2027-02-01' });
const schmidtApr = foerderung({ ...w, antrag: '2027-04-01', wpEU: false });
const H7 = hoechstbetrag(heute, 7);
const jeWe = H7 / 7;
const etage = foerderung({ antrag: heute, gebaeude: 'etw', einheiten: 8, kosten: 18000, selbstnutzer: true, alt: 'gasetage', altJahre: 15, neu: 'wp', wpEU: true, zve: 45000, kind: false });
const kgb = F.kgb_stufen[0].satz;

export default defineGuide({
  id: 'weg',
  group: 'foerderung',
  order: 114,
  mini: 'weg',
  miniHref: 'waermepumpe-foerderung',
  related: ['kfw-458', 'einkommensbonus', 'vermieter', 'foerderantrag', 'klimageschwindigkeitsbonus', 'waermepumpe-foerderung'],
  sources: ['kfw458', 'merkblatt458', 'begem2026', 'bmweFaq'],
  de: {
    slug: 'heizungsfoerderung-weg',
    nav: 'Förderung für die WEG',
    card: 'Neue Zentralheizung in der Eigentümergemeinschaft: Basisantrag der WEG, Zusatzantrag je Wohnung und das KfW-Beispiel nachgerechnet.',
    title: 'Heizungsförderung WEG 2026: Basisantrag und Zusatzantrag',
    description: `Heizungsförderung WEG 2026: Die Gemeinschaft bekommt ${DE.pct(F.grund)} im Basisantrag, Selbstnutzer Boni im Zusatzantrag. Das KfW-Beispiel mit sieben Wohnungen geprüft.`,
    h1: 'Heizungsförderung für die WEG: zwei Anträge, ein Haus',
    intro: 'Wenn eine Eigentümergemeinschaft die Zentralheizung tauscht, beantragt die Gemeinschaft die Grundförderung und jeder Selbstnutzer seine Boni. So rechnet die KfW, am Beispiel einer WEG mit sieben Wohnungen.',
    resume: `Tauscht eine Wohnungseigentümergemeinschaft die Heizung im Gemeinschaftseigentum, stellt die WEG den Basisantrag bei der KfW und erhält ${DE.pct(F.grund)} Grundförderung auf die förderfähigen Kosten des ganzen Hauses. Der Höchstbetrag wächst mit der Zahl der Wohnungen; bei sieben Wohnungen sind es ${DE.eur(H7)}. Eigentümer, die ihre Wohnung selbst bewohnen, stellen danach einen Zusatzantrag für Klimageschwindigkeitsbonus und Einkommensbonus. Er bezieht sich auf ihren Miteigentumsanteil an den Kosten, höchstens auf den gleichen Teil des Höchstbetrags je Wohnung, hier ${DE.eur(jeWe)}. Im Beispiel der KfW kostet die Wärmepumpe rund ${DE.eur(140000)} und ersetzt eine 25 Jahre alte Gasheizung. Die Gemeinschaft erhält ${DE.eur(schmidt.grundGebaeude)}. Ein Eigentümer mit ${DE.pct(0.15)} Anteil und ${DE.eur(50000)} Einkommen bekommt im Zusatzantrag ${DE.eur(schmidt.bonus)} dazu, mit einem Kind ${DE.eur(mayer.bonus)}. Wer vermietet, erhält nur seinen Anteil am Basisantrag von ${DE.eur(vermietet.zuschuss)}. Der Zusatzantrag muss spätestens ${F.zusatzantrag_monate} Monate nach der Zusage des Basisantrags gestellt sein.`,
    faqs: [
      { q: 'Wer stellt in einer Eigentümergemeinschaft den Antrag auf Heizungsförderung?', a: `Für eine Heizung im Gemeinschaftseigentum stellt die WEG selbst den Basisantrag. Er deckt die Grundförderung von ${DE.pct(F.grund)} für das ganze Gebäude ab. Die Boni beantragt jeder selbst nutzende Eigentümer getrennt im Zusatzantrag für seine Wohnung. Geht es nur um die Heizung einer einzelnen Wohnung, etwa eine Gasetagenheizung im Sondereigentum, beantragt der Eigentümer dieser Wohnung allein.` },
      { q: 'Bis wann muss der Zusatzantrag in der WEG gestellt werden?', a: `Spätestens ${F.zusatzantrag_monate} Monate nach der Zusage des Basisantrags und auf jeden Fall, bevor die Gemeinschaft die Nachweise für den Basisantrag einreicht. Eine spätere Änderung der Bonusförderung ist nach den Antworten der KfW grundsätzlich nicht möglich. Wer die Frist verpasst, bleibt beim Anteil an der Grundförderung. Es lohnt sich, die Steuerbescheide schon vor der Eigentümerversammlung bereitzulegen.` },
      { q: 'Warum bekommt ein Eigentümer mit großem Miteigentumsanteil keinen höheren Bonus?', a: `Weil die Boni auf höchstens den gleichen Teil des Höchstbetrags je Wohnung gerechnet werden. In der WEG mit sieben Wohnungen sind das ${DE.eur(jeWe)}. Ein Eigentümer mit ${DE.pct(0.15)} Anteil an ${DE.eur(140000)} trägt ${DE.eur(schmidt.eigeneKosten)} Kosten, der Bonus zählt aber nur bis ${DE.eur(jeWe)}. Wer ${DE.pct(0.12)} hält, liegt mit ${DE.eur(schulze.anteilEigen)} darunter und bekommt die Boni auf den ganzen Betrag.` },
      { q: 'Was bekommt ein WEG-Eigentümer, der seine Wohnung vermietet?', a: `Nur seinen Anteil an der Grundförderung, die die Gemeinschaft im Basisantrag erhält. Im Beispiel der KfW mit sieben Wohnungen und ${DE.pct(0.15)} Miteigentumsanteil sind das ${DE.eur(vermietet.zuschuss)} bei ${DE.eur(vermietet.eigeneKosten)} Kostenanteil. Einen Zusatzantrag kann er nicht stellen, weil Klimageschwindigkeits- und Einkommensbonus nur für die Wohnung gelten, in der der Eigentümer selbst mit Hauptwohnsitz gemeldet ist.` },
      { q: 'Wie hoch ist die Förderung für eine Gasetagenheizung in der Eigentumswohnung?', a: `Der Eigentümer beantragt sie selbst, gedeckelt auf den gleichen Teil des Gebäudehöchstbetrags. In einem Haus mit acht Wohnungen sind das ${DE.eur(etage.hoechstbetrag)}. Ersetzt er die Gasetagenheizung für ${DE.eur(18000)} durch eine Wärmepumpe und hat ${DE.eur(45000)} Einkommen, erhält er ${DE.pct(etage.satzEigen)} oder ${DE.eur(etage.zuschuss)}. Den Klimabonus gibt es bei Gasetagenheizungen unabhängig von ihrem Alter.` },
    ],
    body: (h) => `
<h2>Zwei Anträge für eine Heizung</h2>
<p>In einer Wohnungseigentümergemeinschaft gehört die Zentralheizung allen gemeinsam. Deshalb teilt die KfW die Förderung auf zwei Anträge auf (${h.src('merkblatt458', 'Merkblatt 458')}). Den <strong>Basisantrag</strong> stellt die Gemeinschaft für das Gemeinschaftseigentum. Er bringt ${h.pct(F.grund)} Grundförderung auf die förderfähigen Kosten, begrenzt durch den Höchstbetrag des ganzen Gebäudes. Den <strong>Zusatzantrag</strong> stellt jeder Eigentümer, der seine Wohnung selbst bewohnt und Boni bekommen kann: den Klimageschwindigkeitsbonus, wenn eine alte fossile Heizung ersetzt wird, und den Einkommensbonus, wenn sein Haushalt wenig genug verdient.</p>
<p>Der Zusatzantrag muss spätestens ${F.zusatzantrag_monate} Monate nach der Zusage des Basisantrags eingehen und bevor die Gemeinschaft die Nachweise für den Basisantrag einreicht. Eine spätere Änderung der Boni sieht die KfW nicht vor (${h.src('kfw458', 'KfW-Produktseite')}). Auch für die Gemeinschaft gilt: Vor dem Basisantrag darf nur ein Vertrag mit Bedingung unterschrieben sein, der an die Förderzusage geknüpft ist.</p>

<h2>Das Beispiel der KfW: WEG Am Grünen Grund 4</h2>
<p>Die KfW rechnet auf ihrer Produktseite eine Gemeinschaft mit sieben Wohnungen vor. Eine Luft-Wasser-Wärmepumpe ersetzt eine 25 Jahre alte Gasheizung, die Kosten liegen bei rund ${h.eur(140000)}. Der Höchstbetrag des Hauses ist ${h.eur(F.hoechst_erste_we[0].betrag)} für die erste, fünfmal ${h.eur(F.hoechst_we_2_bis_6)} und einmal ${h.eur(F.hoechst_we_ab_7)} für die siebte Wohnung, zusammen ${h.eur(H7)}. Der Basisantrag bringt ${h.pct(F.grund)} davon, also ${h.eur(schmidt.grundGebaeude)}.</p>
<p>Für den Zusatzantrag zählt der Miteigentumsanteil, aber höchstens der gleiche Teil des Höchstbetrags je Wohnung: ${h.eur(H7)} geteilt durch sieben ergibt ${h.eur(jeWe)}. Darauf kommen Klimabonus von ${h.pct(kgb)} und Einkommensbonus, bis die eigene Wohnung den Deckel von ${h.pct(F.deckel_standard)} oder ${h.pct(F.deckel_niedrig)} erreicht. Unser Rechner kommt auf dieselben Beträge wie die KfW.</p>
${h.table(['Eigentümer', 'Anteil', 'Einkommen', 'Satz', 'Zusatzantrag', 'Anteil Basis', 'Zusammen'], [
  ['Wohnung 1, ohne Kind', h.pct(0.15), h.eur(50000), h.pct(schmidt.satzEigen), h.eur(schmidt.bonus), h.eur(schmidt.grund), h.eur(schmidt.zuschuss)],
  ['Wohnung 3, ein Kind', h.pct(0.15), h.eur(50000), h.pct(mayer.satzEigen), h.eur(mayer.bonus), h.eur(mayer.grund), h.eur(mayer.zuschuss)],
  ['Wohnung 7, ohne Kind', h.pct(0.12), h.eur(30000), h.pct(schulze.satzEigen), h.eur(schulze.bonus), h.eur(schulze.grund), h.eur(schulze.zuschuss)],
  ['Vermietete Wohnung', h.pct(0.15), 'egal', h.pct(vermietet.satzEigen), h.eur(0), h.eur(vermietet.grund), h.eur(vermietet.zuschuss)],
], 'Beispiel kfw.de/458; Anteil am Basisantrag nach Miteigentumsanteil (Annahme des Rechners)', ['l', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>In Wohnung 3 wirkt der Familienzuschlag: Mit einem Kind zählt die KfW ${h.eur(F.familienzuschlag)} weniger Einkommen, aus ${h.pct(F.einkommen_stufen[2].bonus)} werden ${h.pct(F.einkommen_stufen[1].bonus)} Einkommensbonus. Die Summe mit Grundförderung und Klimabonus läge über ${h.pct(F.deckel_standard)} und wird auf diesen Deckel gekürzt. In Wohnung 7 greift der niedrige Einkommenssatz von ${h.pct(F.einkommen_stufen[0].bonus)}, der Deckel steigt auf ${h.pct(F.deckel_niedrig)}. Dafür liegt ihr Kostenanteil unter dem Betrag je Wohnung, die Boni werden auf den vollen Anteil gerechnet. Wie die Stufen des Einkommens funktionieren, steht unter ${h.a('einkommensbonus', 'Einkommensbonus')}.</p>
<!--mini:einkommen-->

<h2>Wer was bezahlt</h2>
<p>Die Grundförderung fließt an die Gemeinschaft. Der Rechner verteilt sie wie die Kosten nach Miteigentumsanteilen; wie die Gemeinschaft das intern regelt, steht in ihren eigenen Beschlüssen und nicht in der Förderrichtlinie. Den Bonus aus dem Zusatzantrag bekommt der jeweilige Eigentümer. Für Wohnung 1 im Beispiel heißt das: ${h.eur(schmidt.eigeneKosten)} Kostenanteil, ${h.eur(schmidt.zuschuss)} Förderung insgesamt, ${h.eur(schmidt.eigenanteil)} bleiben selbst zu tragen.</p>
<p>Die Grenze der Kumulierung gilt auch hier: Andere öffentliche Mittel für dieselbe Maßnahme dürfen zusammen mit dem Zuschuss höchstens ${h.pct(F.kumulierung_max)} der geförderten Ausgaben erreichen, soweit sie neben der BEG überhaupt zulässig sind (${h.src('begem2026', 'Richtlinie Nr. 8.6')}).</p>

<h2>Heizung im Sondereigentum</h2>
<p>Nicht jede WEG hat eine Zentralheizung. Hat jede Wohnung eine eigene Gasetagenheizung, gehört sie zum Sondereigentum, und der Eigentümer stellt den Antrag selbst. Auch dann gilt der Höchstbetrag des ganzen Gebäudes, verteilt zu gleichen Teilen auf alle Wohnungen. In einem Haus mit acht Wohnungen sind das ${h.eur(etage.hoechstbetrag)} je Wohnung. Eine Wärmepumpe für ${h.eur(18000)}, die eine Gasetagenheizung ersetzt, bringt einem Selbstnutzer mit ${h.eur(45000)} Einkommen ${h.eur(etage.zuschuss)}. Gasetagenheizungen lösen den ${h.a('klimageschwindigkeitsbonus', 'Klimageschwindigkeitsbonus')} unabhängig vom Alter aus. Wer seine Wohnung vermietet, bekommt nur die Grundförderung (${h.a('vermieter', 'Förderung für Vermieter')}).</p>
<p>Der Ergänzungskredit 358 der KfW mit Zinsvorteil steht Eigentümern einer Wohnung in einer WEG offen, wenn die Maßnahme nur ihr Sondereigentum betrifft. Für die Zentralheizung der Gemeinschaft ist das Programm 358 nicht vorgesehen.</p>

<h2>Wann die Gemeinschaft entscheiden sollte</h2>
<p>Eigentümergemeinschaften brauchen Zeit für Angebote und Beschlüsse, die Förderung sinkt aber nach festem Kalender. Am 1. Februar 2027 fällt der Höchstbetrag der ersten Wohnung um ${h.eur(F.hoechst_erste_we[0].betrag - F.hoechst_erste_we[1].betrag)} und der Klimabonus auf ${h.pct(F.kgb_stufen[1].satz)}. Für das Haus mit sieben Wohnungen sinkt der Basisantrag dadurch kaum, von ${h.eur(schmidt.grundGebaeude)} auf ${h.eur(schmidtFeb.grundGebaeude)}. Für Wohnung 1 fällt die Förderung insgesamt aber von ${h.eur(schmidt.zuschuss)} auf ${h.eur(schmidtFeb.zuschuss)}, wenn alle Anträge ab diesem Tag gestellt werden.</p>
<p>Ab dem ersten Quartal 2027 soll außerdem die Grundförderung für Wärmepumpen auf ${h.pct(F.q1_2027.wp_grund)} sinken, mit ${h.pct(F.q1_2027.wertschoepfung)} Bonus für Geräte aus der EU. Der Starttag ist offen (${h.src('bmweFaq', 'FAQ von BMWE, KfW und BAFA')}). Ohne EU-Gerät hätte Wohnung 1 bei einem Antrag im April 2027 noch ${h.eur(schmidtApr.zuschuss)}. Den Ablauf beider Anträge beschreibt ${h.a('foerderantrag', 'Antrag stellen')}, die Sätze im Ganzen ${h.a('kfw-458', 'KfW 458')}.</p>`,
  },
  en: {
    slug: 'heating-grant-owners-association',
    nav: 'Owners’ associations',
    card: 'New central heating in an owners’ association: the association’s basic application, each owner’s additional one, and KfW’s example recalculated.',
    title: 'Heating Grant Owners Association Germany 2026: Two Claims',
    description: `Heating grant for owners’ associations in Germany 2026: ${EN.pct(F.grund)} on the association’s claim, bonuses on each owner’s extra claim. KfW’s own example checked.`,
    h1: 'Heating grant for owners’ associations (WEG) in Germany',
    intro: 'When an owners’ association replaces its central heating, the association applies for the basic grant and each owner-occupier for their bonuses. This is how KfW calculates it, using a seven-flat building.',
    resume: `When a German owners’ association (Wohnungseigentümergemeinschaft, WEG) replaces heating that belongs to the common property, the association files the basic application with KfW and receives a ${EN.pct(F.grund)} basic grant on the eligible costs of the whole building. The cap grows with the number of flats; for seven flats it is ${EN.eur(H7)}. Owners who live in their own flat then file an additional application for the climate speed bonus and the income bonus. It is based on their ownership share of the costs, limited to an equal slice of the cap per flat, here ${EN.eur(jeWe)}. In KfW’s example a heat pump costing about ${EN.eur(140000)} replaces a 25-year-old gas boiler. The association receives ${EN.eur(schmidt.grundGebaeude)}. An owner with a ${EN.pct(0.15)} share and ${EN.eur(50000)} income adds ${EN.eur(schmidt.bonus)} through the additional application, or ${EN.eur(mayer.bonus)} with a child. An owner who lets their flat gets only their part of the basic grant, ${EN.eur(vermietet.zuschuss)}. The additional application is due within ${F.zusatzantrag_monate} months of approval of the basic one.`,
    faqs: [
      { q: 'I own a flat in Germany but live abroad: do I get anything when the association replaces the heating?', a: `Yes, your share of the basic grant the association receives, in KfW’s seven-flat example ${EN.eur(vermietet.zuschuss)} on a ${EN.pct(0.15)} ownership share. You cannot file the additional application, because the bonuses require the flat to be your registered main residence. You still pay your share of the costs, so watch the association’s invitations and minutes, which will be in German.` },
      { q: 'What is the deadline for the additional application in an owners’ association?', a: `No later than ${F.zusatzantrag_monate} months after the basic application is approved, and in any case before the association submits its proof for the basic application. KfW states that the bonus cannot normally be changed afterwards. Missing the deadline leaves you with your part of the basic grant only. Have your German tax assessments ready before the owners’ meeting votes.` },
      { q: 'Why does a larger ownership share not raise the bonus?', a: `Because the bonuses are calculated on no more than an equal slice of the building cap per flat. With seven flats that is ${EN.eur(jeWe)}. An owner holding ${EN.pct(0.15)} of ${EN.eur(140000)} carries ${EN.eur(schmidt.eigeneKosten)} of costs, but the bonus counts only up to ${EN.eur(jeWe)}. An owner holding ${EN.pct(0.12)} sits below that at ${EN.eur(schulze.anteilEigen)} and gets the bonuses on the full amount.` },
      { q: 'Who applies when only my flat’s own gas heater is replaced?', a: `You do, because a gas flat heater (Gasetagenheizung) belongs to your separate property. The cap is an equal share of the building cap: ${EN.eur(etage.hoechstbetrag)} per flat in an eight-flat building. Replacing it with an ${EN.eur(18000)} heat pump on ${EN.eur(45000)} income brings ${EN.pct(etage.satzEigen)}, or ${EN.eur(etage.zuschuss)}. The climate bonus applies to gas flat heaters whatever their age.` },
    ],
    body: (h) => `
<h2>Two applications for one heating system</h2>
<p>In a German owners’ association the central heating belongs to all owners together, so KfW splits the grant into two applications (${h.src('merkblatt458', 'information sheet 458')}). The association files the <strong>basic application</strong> (Basisantrag) for the common property. It brings a ${h.pct(F.grund)} basic grant on eligible costs, limited by the cap for the whole building. Each owner who lives in their own flat and qualifies for bonuses files an <strong>additional application</strong> (Zusatzantrag): the climate speed bonus when an old fossil system is replaced, and the income bonus when household income is low enough.</p>
<p>The additional application must arrive within ${F.zusatzantrag_monate} months of approval of the basic one and before the association submits its proof. KfW does not provide for changing the bonuses later (${h.src('kfw458', 'KfW product page')}). The association is bound by the same contract rule as anyone else: before the basic application, only a contract with a condition tied to grant approval may be signed.</p>

<h2>KfW’s example: the Am Grünen Grund 4 association</h2>
<p>KfW works through an association with seven flats on its product page. An air-to-water heat pump replaces a 25-year-old gas boiler at a cost of about ${h.eur(140000)}. The building cap is ${h.eur(F.hoechst_erste_we[0].betrag)} for the first flat, five times ${h.eur(F.hoechst_we_2_bis_6)} and once ${h.eur(F.hoechst_we_ab_7)} for the seventh, ${h.eur(H7)} in total. The basic application yields ${h.pct(F.grund)} of that, ${h.eur(schmidt.grundGebaeude)}.</p>
<p>For the additional application the ownership share counts, but no more than an equal slice of the cap per flat: ${h.eur(H7)} divided by seven is ${h.eur(jeWe)}. On that come the ${h.pct(kgb)} climate bonus and the income bonus, until the flat reaches the ceiling of ${h.pct(F.deckel_standard)} or ${h.pct(F.deckel_niedrig)}. Our calculator reaches the same amounts as KfW.</p>
${h.table(['Owner', 'Share', 'Income', 'Rate', 'Additional', 'Share of basic', 'Total'], [
  ['Flat 1, no child', h.pct(0.15), h.eur(50000), h.pct(schmidt.satzEigen), h.eur(schmidt.bonus), h.eur(schmidt.grund), h.eur(schmidt.zuschuss)],
  ['Flat 3, one child', h.pct(0.15), h.eur(50000), h.pct(mayer.satzEigen), h.eur(mayer.bonus), h.eur(mayer.grund), h.eur(mayer.zuschuss)],
  ['Flat 7, no child', h.pct(0.12), h.eur(30000), h.pct(schulze.satzEigen), h.eur(schulze.bonus), h.eur(schulze.grund), h.eur(schulze.zuschuss)],
  ['Flat that is let', h.pct(0.15), 'any', h.pct(vermietet.satzEigen), h.eur(0), h.eur(vermietet.grund), h.eur(vermietet.zuschuss)],
], 'Example from kfw.de/458; share of the basic grant by ownership share (calculator assumption)', ['l', 'r', 'r', 'r', 'r', 'r', 'r'])}
<p>Flat 3 shows the family allowance: with a child KfW counts ${h.eur(F.familienzuschlag)} less income, so the income bonus rises from ${h.pct(F.einkommen_stufen[2].bonus)} to ${h.pct(F.einkommen_stufen[1].bonus)}. Together with the basic grant and climate bonus that would pass ${h.pct(F.deckel_standard)}, so it is cut to that ceiling. Flat 7 gets the lowest income band of ${h.pct(F.einkommen_stufen[0].bonus)}, and its ceiling rises to ${h.pct(F.deckel_niedrig)}. Its cost share is below the slice per flat, so the bonuses apply to the full share. The bands are explained under ${h.a('einkommensbonus', 'income bonus')}. Income means the average on your German tax assessments for the second and third year before applying; income earned abroad counts too.</p>
<!--mini:einkommen-->

<h2>Who pays what</h2>
<p>The basic grant is paid to the association. The calculator splits it like the costs, by ownership share; how the association handles it internally is for its own resolutions, not the funding guideline. The bonus from the additional application goes to the individual owner. For flat 1 that means ${h.eur(schmidt.eigeneKosten)} of costs, ${h.eur(schmidt.zuschuss)} of funding in total and ${h.eur(schmidt.eigenanteil)} left to pay.</p>
<p>The stacking limit applies here too: other public funds for the same work, where allowed alongside this programme at all, may not take the total above ${h.pct(F.kumulierung_max)} of the funded costs (${h.src('begem2026', 'guideline no. 8.6')}).</p>

<h2>Heating in a single flat</h2>
<p>Not every association has central heating. If each flat has its own gas heater, it belongs to that flat’s separate property and the owner applies alone. The building cap still applies, split equally across all flats: ${h.eur(etage.hoechstbetrag)} per flat in an eight-flat building. An ${h.eur(18000)} heat pump replacing a gas flat heater brings an owner-occupier on ${h.eur(45000)} income ${h.eur(etage.zuschuss)}. Gas flat heaters trigger the ${h.a('klimageschwindigkeitsbonus', 'climate speed bonus')} whatever their age. An owner who lets the flat gets the basic grant only (${h.a('vermieter', 'grants for landlords')}).</p>
<p>KfW’s top-up loan 358 with an interest subsidy is open to owners of a flat in an association when the work concerns only their separate property. Programme 358 is not designed for the association’s central heating.</p>

<h2>When the association should decide</h2>
<p>Associations need time for quotes and votes, but the grant falls on a fixed calendar. On 1 February 2027 the first flat’s cap drops by ${h.eur(F.hoechst_erste_we[0].betrag - F.hoechst_erste_we[1].betrag)} and the climate bonus to ${h.pct(F.kgb_stufen[1].satz)}. For the seven-flat building the basic grant barely moves, from ${h.eur(schmidt.grundGebaeude)} to ${h.eur(schmidtFeb.grundGebaeude)}. For flat 1 the total, though, falls from ${h.eur(schmidt.zuschuss)} to ${h.eur(schmidtFeb.zuschuss)} if all applications are made from that day.</p>
<p>From the first quarter of 2027 the basic grant for heat pumps is also set to drop to ${h.pct(F.q1_2027.wp_grund)}, with a ${h.pct(F.q1_2027.wertschoepfung)} bonus for units made in the EU. The start date is open (${h.src('bmweFaq', 'ministry, KfW and BAFA FAQ')}). Without an EU unit, flat 1 would get ${h.eur(schmidtApr.zuschuss)} with an application in April 2027. Both applications are described under ${h.a('foerderantrag', 'how to apply')}, the rates as a whole under ${h.a('kfw-458', 'KfW 458')}.</p>`,
  },
});

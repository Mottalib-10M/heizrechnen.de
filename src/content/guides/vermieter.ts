import { defineGuide } from '../../lib/guide-types';
import { foerderung, hoechstbetrag, type FoerderEingabe } from '../../lib/engine/foerderung';
import { aufteilung } from '../../lib/engine/co2';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Heizungsförderung für Vermieter: nur die Grundförderung, Boni nur für die selbst bewohnte Einheit.
 * Eigene Beispiele: Mietshaus mit sechs Wohnungen (95.000 €), vermietetes Einfamilienhaus (26.000 €),
 * Dreifamilienhaus mit und ohne eigene Wohnung (60.000 €), zwölf Wohnungen (180.000 €), dazu die CO₂-Aufteilung.
 */
const F = P.foerderung;
const heute = P.retrieved_at;
const b: FoerderEingabe = { antrag: heute, gebaeude: 'mfh', einheiten: 6, kosten: 95000, selbstnutzer: false, alt: 'gas', altJahre: 25, neu: 'wp', wpEU: true, zve: 60000, kind: false };
const sechs = foerderung(b);
const sechsFeb = foerderung({ ...b, antrag: '2027-02-01' });
const sechsApr = foerderung({ ...b, antrag: '2027-04-01', wpEU: false });
const sechsAprEU = foerderung({ ...b, antrag: '2027-04-01' });
const sechsPellet = foerderung({ ...b, antrag: '2027-04-01', neu: 'biomasse' });
const efhV = foerderung({ ...b, gebaeude: 'efh', einheiten: 1, kosten: 26000 });
const drei = foerderung({ ...b, einheiten: 3, kosten: 60000 });
const dreiSelbst = foerderung({ ...b, einheiten: 3, kosten: 60000, selbstnutzer: true, zve: 45000 });
const zwoelf = foerderung({ ...b, einheiten: 12, kosten: 180000 });
const H6 = hoechstbetrag(heute, 6);
const H6feb = hoechstbetrag('2027-02-01', 6);
const preis = P.co2.auktion_2026_durchschnitt;
const co2 = aufteilung({ stoff: 'gas', menge: 12000, flaeche: 70, preis, einschraenkung: false });
const co2neu = aufteilung({ stoff: 'gas', menge: 12000, flaeche: 70, preis, einschraenkung: false, neueFossile: true, jahr: 2028 });
const A = P.aufteilung;
const vermieterMax = 1 - A.stufen[A.stufen.length - 1].mieter;

export default defineGuide({
  id: 'vermieter',
  group: 'foerderung',
  order: 113,
  mini: 'vermieter',
  miniHref: 'waermepumpe-foerderung',
  related: ['kfw-458', 'waermepumpe-foerderung', 'co2-kostenaufteilung', 'weg', 'ergaenzungskredit', 'foerderantrag'],
  sources: ['kfw458', 'merkblatt458', 'begem2026', 'co2kostaufg', 'gmodg43'],
  de: {
    slug: 'heizungsfoerderung-vermieter',
    nav: 'Förderung für Vermieter',
    card: 'Was Vermieter beim Heizungstausch bekommen: Grundförderung je Haus, Boni nur für die eigene Wohnung, CO₂-Kosten und Mieterhöhung.',
    title: 'Heizungsförderung Vermieter 2026: Zuschuss fürs Mietshaus',
    description: `Heizungsförderung Vermieter 2026: ${DE.pct(F.grund)} Grundförderung, keine Boni für vermietete Wohnungen, ${DE.eur(H6)} förderfähig bei sechs Wohnungen. Mit CO₂-Kosten.`,
    h1: 'Heizungsförderung für Vermieter 2026: was bleibt übrig',
    intro: 'Wer vermietet, bekommt beim Heizungstausch weniger als ein Selbstnutzer. Hier steht, wie viel genau, wie die Wohnungszahl den Betrag treibt und warum die CO₂-Kosten trotzdem für den Tausch sprechen.',
    resume: `Wer ein Haus oder eine Wohnung vermietet, erhält beim Heizungstausch aus dem KfW-Programm 458 nur die Grundförderung von ${DE.pct(F.grund)} der förderfähigen Kosten. Klimageschwindigkeitsbonus und Einkommensbonus hängen an der selbst bewohnten Wohnung und entfallen für jede vermietete Einheit. Wie viel förderfähig ist, bestimmt die Zahl der Wohnungen: ${DE.eur(F.hoechst_erste_we[0].betrag)} für die erste, je ${DE.eur(F.hoechst_we_2_bis_6)} für die zweite bis sechste und je ${DE.eur(F.hoechst_we_ab_7)} ab der siebten. Ein Mietshaus mit sechs Wohnungen, dessen 25 Jahre alte Gasheizung für ${DE.eur(95000)} einer Wärmepumpe weicht, bekommt ${DE.eur(sechs.zuschuss)}; ${DE.eur(sechs.eigenanteil)} bleiben beim Eigentümer. Wohnt der Vermieter selbst in einer der Wohnungen, gibt es die Boni für diese eine Einheit dazu. Ab dem ersten Quartal 2027 soll die Grundförderung für Wärmepumpen ohne Herkunft aus der EU auf ${DE.pct(F.q1_2027.wp_grund)} sinken, der Starttag steht noch nicht fest. Für dasselbe Haus wären es dann ${DE.eur(sechsApr.zuschuss)}.`,
    faqs: [
      { q: 'Gibt es den Klimageschwindigkeitsbonus auch für eine vermietete Wohnung?', a: `Nein. Die Richtlinie gewährt diesen Bonus nur selbstnutzenden Eigentümern und nur für die Wohnung, in der sie mit Hauptwohnsitz gemeldet sind. Wer eine alte Ölheizung in einem vermieteten Haus ersetzt, bekommt deshalb dieselben ${DE.pct(F.grund)} wie für eine junge Gasheizung. Der Zeitpunkt des Antrags spielt für Vermieter darum eine kleinere Rolle: Die Kürzung des Bonus am 1. Februar 2027 trifft sie nicht.` },
      { q: 'Wie viel Zuschuss bekommt ein Mietshaus mit sechs Wohnungen?', a: `Förderfähig sind höchstens ${DE.eur(H6)}, davon ${DE.pct(F.grund)}. Kostet die neue Heizung ${DE.eur(95000)}, liegt sie unter dem Höchstbetrag, und der Zuschuss beträgt ${DE.eur(sechs.zuschuss)}. Bei Kosten über dem Höchstbetrag bleibt es bei ${DE.eur(H6 * F.grund)}. Ein Antrag am 1. Februar 2027 ändert daran fast nichts, weil nur der Betrag der ersten Wohnung um ${DE.eur(F.hoechst_erste_we[0].betrag - F.hoechst_erste_we[1].betrag)} sinkt.` },
      { q: 'Muss ich den Zuschuss abziehen, wenn ich nach dem Heizungstausch die Miete erhöhe?', a: 'Ja. Nach § 559a BGB gehören Kosten, die mit öffentlichen Mitteln gedeckt werden, nicht zu den Kosten, die auf die Miete umgelegt werden dürfen. Für eine geförderte Heizung rechnet § 559e BGB die Erhöhung ausdrücklich von den Kosten abzüglich der Fördermittel und begrenzt sie je Quadratmeter. Wie hoch die Erhöhung im eigenen Fall sein darf, ist eine mietrechtliche Frage, die eine Beratung klären sollte.' },
      { q: 'Kann eine vermietende GbR die Heizungsförderung 458 beantragen?', a: 'Nicht über das Programm 458. Das Merkblatt schließt Gesellschaften bürgerlichen Rechts aus, die im Grundbuch als Eigentümer stehen, ebenso ihre Gesellschafter. Für sie gibt es bei der KfW ein eigenes Programm mit der Nummer 459. Auch wer nur ein Nießbrauchrecht am Haus hat, kann den Zuschuss nicht beantragen. Antragsberechtigt bleiben Privatpersonen, die selbst als Eigentümer eingetragen sind.' },
      { q: 'Lohnt sich der Heizungstausch für Vermieter wegen der CO₂-Kosten?', a: `Er senkt einen Posten, den der Vermieter selbst trägt. Nach dem CO2KostAufG zahlt er bei schlecht gedämmten Häusern bis zu ${DE.pct(vermieterMax)} der CO₂-Kosten seiner Mieter. In einer Wohnung mit 70 m² und ${DE.num(12000)} kWh Gas im Jahr sind es heute ${DE.pct(co2.vermieter)} oder ${DE.eur(co2.vermieterEuro)} je Jahr. Mit einer Wärmepumpe fällt der Betrag weg, mit einer neuen Gasheizung steigt der Anteil ab 2028 auf die Hälfte.` },
    ],
    body: (h) => `
<h2>Was Vermieter bekommen und was nicht</h2>
<p>Antragsberechtigt sind Privatpersonen, die als Eigentümer eines bestehenden Wohngebäudes oder einer Eigentumswohnung im Grundbuch stehen, auch wenn sie selbst woanders wohnen (${h.src('merkblatt458', 'Merkblatt 458')}). Der Bauantrag muss mindestens ${F.gebaeude_mindestalter_jahre} Jahre zurückliegen. Der Zuschuss setzt sich aus der Grundförderung und, nur für Selbstnutzer, aus Boni zusammen. Für eine vermietete Einheit bleibt also ein fester Satz von ${h.pct(F.grund)}, egal wie alt die alte Heizung ist und wie viel der Eigentümer verdient (${h.src('kfw458', 'KfW-Produktseite')}).</p>
<p>Das klingt nach wenig, hat aber einen Vorteil: Der Satz ist planbar. Ein Selbstnutzer verliert ab dem 1. Februar 2027 Schritt für Schritt Klimabonus, ein Vermieter nicht, weil er ihn nie hatte. Was für ihn zählt, sind die Wohnungszahl, die Kosten und die Frage, welche Heizung kommt.</p>
${h.table(['Haus', 'Kosten', 'Förderfähig', 'Zuschuss', 'Eigenanteil'], [
  ['Einfamilienhaus, vermietet', h.eur(26000), h.eur(efhV.foerderfaehig), h.eur(efhV.zuschuss), h.eur(efhV.eigenanteil)],
  ['Drei Wohnungen, alle vermietet', h.eur(60000), h.eur(drei.foerderfaehig), h.eur(drei.zuschuss), h.eur(drei.eigenanteil)],
  ['Drei Wohnungen, eine selbst bewohnt', h.eur(60000), h.eur(dreiSelbst.foerderfaehig), h.eur(dreiSelbst.zuschuss), h.eur(dreiSelbst.eigenanteil)],
  ['Sechs Wohnungen, alle vermietet', h.eur(95000), h.eur(sechs.foerderfaehig), h.eur(sechs.zuschuss), h.eur(sechs.eigenanteil)],
  ['Zwölf Wohnungen, alle vermietet', h.eur(180000), h.eur(zwoelf.foerderfaehig), h.eur(zwoelf.zuschuss), h.eur(zwoelf.eigenanteil)],
], 'Wärmepumpe statt 25 Jahre alter Gasheizung, Antrag im Oktober 2026', ['l', 'r', 'r', 'r', 'r'])}

<h2>Wie die Zahl der Wohnungen den Betrag bestimmt</h2>
<p>Der Höchstbetrag gilt für das ganze Gebäude und wächst mit jeder Wohnung: ${h.eur(F.hoechst_erste_we[0].betrag)} für die erste, ${h.eur(F.hoechst_we_2_bis_6)} für jede zweite bis sechste, ${h.eur(F.hoechst_we_ab_7)} für jede weitere (${h.src('begem2026', 'Richtlinie Nr. 8.3.1')}). Ein Haus mit sechs Wohnungen kommt auf ${h.eur(H6)}, ein Haus mit zwölf auf ${h.eur(zwoelf.hoechstbetrag)}. Im Beispiel mit zwölf Wohnungen liegen die Kosten über dem Höchstbetrag, deshalb steigt der Eigenanteil dort stärker als die Rechnung.</p>
<p>Die halbjährliche Absenkung betrifft nur den Betrag der ersten Wohnung. Für das Haus mit sechs Wohnungen sinkt der Höchstbetrag am 1. Februar 2027 von ${h.eur(H6)} auf ${h.eur(H6feb)}. Weil die Kosten von ${h.eur(95000)} darunter liegen, bleibt der Zuschuss mit ${h.eur(sechsFeb.zuschuss)} gleich. Der Höchstbetrag gilt je Gebäude einmal über alle Anträge: Wer erst die Heizung und später eine Solarthermie fördern lässt, teilt sich denselben Rahmen.</p>

<h2>Wenn Sie selbst im Haus wohnen</h2>
<p>Bewohnt der Eigentümer eine der Wohnungen als Hauptwohnsitz, bekommt er für diese Einheit Klimageschwindigkeitsbonus und gegebenenfalls Einkommensbonus. Die KfW rechnet dabei mit einem gleichen Anteil des Gebäudes je Wohnung, im Dreifamilienhaus also mit einem Drittel der förderfähigen Kosten. Nur eine Wohnung kann als selbst genutzt gelten. Im Beispiel mit drei Wohnungen und ${h.eur(45000)} Einkommen steigt der Zuschuss dadurch von ${h.eur(drei.zuschuss)} auf ${h.eur(dreiSelbst.zuschuss)}; der Satz der eigenen Wohnung liegt bei ${h.pct(dreiSelbst.satzEigen)}. Den Betrag für Ihr Haus zeigt der Rechner oben, mehr zu den Sätzen steht unter ${h.a('kfw-458', 'KfW 458')}.</p>

<h2>2027: Wärmepumpe oder Pellets im Mietshaus</h2>
<p>Für Vermieter ist eine andere Änderung wichtiger als der sinkende Bonus. Die Richtlinie senkt die Grundförderung für Wärmepumpen ab dem ersten Quartal 2027 auf ${h.pct(F.q1_2027.wp_grund)} und gibt ${h.pct(F.q1_2027.wertschoepfung)} Wertschöpfungsbonus dazu, wenn das Gerät aus der EU stammt. Starttag und Nachweis der Herkunft sind noch nicht veröffentlicht. Für das Haus mit sechs Wohnungen hieße ein Antrag im April 2027 ${h.eur(sechsAprEU.zuschuss)} mit EU-Gerät und ${h.eur(sechsApr.zuschuss)} ohne. Eine Pelletheizung behielte ${h.pct(F.grund)} und käme auf ${h.eur(sechsPellet.zuschuss)} (${h.a('pelletheizung', 'Pelletheizung')}).</p>
<p>Ebenfalls ab dem ersten Quartal 2027 wird der Ersatz einer erneuerbaren Heizung, die seit dem 1. Januar 2008 läuft, nicht mehr gefördert. Wer ein Haus mit einer jungen Wärmepumpe kauft und sie tauschen will, muss das einplanen.</p>

<h2>CO₂-Kosten: der Teil, den der Vermieter zahlt</h2>
<p>Das Kohlendioxidkostenaufteilungsgesetz teilt die CO₂-Kosten der Heizung zwischen Mieter und Vermieter (${h.src('co2kostaufg', 'CO2KostAufG')}). Je mehr CO₂ eine Wohnung je Quadratmeter verursacht, desto größer der Anteil des Vermieters, bis zu ${h.pct(vermieterMax)}. Eine Wohnung mit 70 m² und ${h.num(12000)} kWh Gas im Jahr kommt auf ${h.num(co2.kgM2, 1)} kg je m². Bei ${h.eur(preis)} je Tonne trägt der Vermieter davon ${h.pct(co2.vermieter)}, also ${h.eur(co2.vermieterEuro)} im Jahr, für jede so beheizte Wohnung. Das genaue Ergebnis liefert der ${h.a('co2-kostenaufteilung', 'Rechner zur CO₂-Kostenaufteilung')}.</p>
<p>Das Gebäudemodernisierungsgesetz hat Gas- und Ölheizungen wieder erlaubt, die Rechnung für Vermieter aber geändert. Wird eine solche Heizung nach § 43 neu eingebaut (${h.src('gmodg43', '§ 43 GModG')}), tragen Vermieter und Mieter ab dem 1. Januar 2028 die CO₂-Kosten und die Netzentgelte für Gas je zur Hälfte, ab 2029 auch die Mehrkosten für Biogas oder Bioöl bis zu einem Brennstoffanteil von ${h.pct(A.biobrennstoff_anteil_max)}. In der Beispielwohnung stiege der Anteil des Vermieters damit von ${h.eur(co2.vermieterEuro)} auf ${h.eur(co2neu.vermieterEuro)} je Jahr, bei gleichem CO₂-Preis.</p>
<!--mini:oelweiter-->

<h2>Miete, Steuer, Kredit</h2>
<p>Nach einer Modernisierung darf der Vermieter die Miete erhöhen, aber nicht aus Geld, das der Staat bezahlt hat. § 559a BGB nimmt öffentlich geförderte Kosten aus der Umlage heraus, § 559e BGB rechnet die Erhöhung bei einer geförderten Heizung von den Kosten abzüglich der Fördermittel und deckelt sie je Quadratmeter Wohnfläche. Wird die Förderung trotz erfüllter Voraussetzungen nicht gewährt, gilt stattdessen die allgemeine Regel des § 559 BGB. Seit dem 29. Juli 2026 kommt § 559f BGB hinzu: Nach dem Einbau einer Wärmepumpe darf die Miete nur dann in voller Höhe steigen, wenn ein Fachbetrieb eine Jahresarbeitszahl von mindestens 2,5 nachweist, außer etwa bei Häusern, die nach 1996 gebaut wurden oder mit höchstens 55 Grad Vorlauftemperatur auskommen. Die Einzelheiten sind Mietrecht und gehören in eine Rechtsberatung.</p>
<p>Der Steuerbonus nach § 35c EStG hilft Vermietern nicht: Er gilt nur für Wohnungen, die der Eigentümer selbst bewohnt. Den Rest der Rechnung kann ein Kredit decken. Der ${h.a('ergaenzungskredit', 'Ergänzungskredit')} reicht bis ${h.eur(F.kredit.hoechst_je_we)} je Wohnung, die Zinsverbilligung gibt es aber nur für die selbst bewohnte Einheit und bis ${h.eur(F.kredit.zinsverbilligung_zve_bis)} Einkommen.</p>

<h2>Ablauf für ein vermietetes Haus</h2>
<p>Vor dem Antrag steht ein Vertrag mit dem Fachbetrieb, der nur bei einer Förderzusage gilt. Dann erstellt der Betrieb oder ein Energieeffizienz-Experte die Bestätigung zum Antrag, und der Eigentümer beantragt im Portal der KfW. Nach der Zusage bleiben ${F.bewilligung_monate} Monate für den Einbau und ${F.nachweis_monate} Monate für die Nachweise; die Heizung muss ${F.nutzungspflicht_jahre} Jahre laufen. Informieren Sie die Mieter rechtzeitig über die Arbeiten. Schritt für Schritt steht der Weg unter ${h.a('foerderantrag', 'Antrag stellen')}. Gehört Ihnen nur eine Wohnung in einer Eigentümergemeinschaft, gelten andere Regeln (${h.a('weg', 'Förderung für die WEG')}).</p>`,
  },
  en: {
    slug: 'heating-grant-landlords',
    nav: 'Grants for landlords',
    card: 'What landlords get for a new heating system: basic grant per building, bonuses only for the owner’s own flat, CO₂ costs and rent rules.',
    title: 'Heating Grant for Landlords Germany 2026: Basic Rate Only',
    description: `Heating grant for landlords in Germany 2026: ${EN.pct(F.grund)} basic grant, no bonuses for let flats, ${EN.eur(H6)} eligible for six flats. With CO₂ cost split and rent rules.`,
    h1: 'Heating grant for landlords in Germany 2026',
    intro: 'Landlords get less than owner-occupiers when they replace a heating system. This page shows how much, how the number of flats drives the amount and why CO₂ costs still argue for switching.',
    resume: `If you let a house or flat in Germany, the KfW programme 458 pays only the basic grant of ${EN.pct(F.grund)} of eligible costs when you replace the heating. The climate speed bonus (Klimageschwindigkeitsbonus) and the income bonus are tied to the home the owner lives in, so they do not apply to any let unit. The number of flats sets how much can be funded: ${EN.eur(F.hoechst_erste_we[0].betrag)} for the first, ${EN.eur(F.hoechst_we_2_bis_6)} each for the second to sixth and ${EN.eur(F.hoechst_we_ab_7)} each from the seventh. A six-flat rental building that swaps a 25-year-old gas boiler for a ${EN.eur(95000)} heat pump receives ${EN.eur(sechs.zuschuss)}, leaving ${EN.eur(sechs.eigenanteil)} with the owner. If the landlord lives in one of the flats, the bonuses are added for that single unit. From the first quarter of 2027 the basic grant for heat pumps not made in the EU is set to fall to ${EN.pct(F.q1_2027.wp_grund)}; the start date has not been fixed. For the same building that would mean ${EN.eur(sechsApr.zuschuss)}.`,
    faqs: [
      { q: 'Can I claim the German heating grant for a flat I let while living abroad?', a: `Yes, the basic grant of ${EN.pct(F.grund)}. KfW does not require you to live in Germany, only to be a private individual registered as owner in the land register. The bonuses are not available, because they need the home to be your registered main residence. The application portal, the installer’s confirmation and the contract are in German, so plan for help with the paperwork if you are not on site.` },
      { q: 'How much does a six-flat rental building get?', a: `Eligible costs are capped at ${EN.eur(H6)}, and the grant is ${EN.pct(F.grund)} of that. A ${EN.eur(95000)} system sits below the cap, so the grant is ${EN.eur(sechs.zuschuss)}. Above the cap it stays at ${EN.eur(H6 * F.grund)}. Applying on 1 February 2027 changes almost nothing, because only the first flat’s amount drops, by ${EN.eur(F.hoechst_erste_we[0].betrag - F.hoechst_erste_we[1].betrag)}.` },
      { q: 'Do I have to deduct the grant if I raise the rent after new heating?', a: 'Yes. Under section 559a of the Civil Code (BGB), costs covered by public funds are not part of the costs that may be passed on through the rent. For subsidised heating, section 559e calculates the increase from the costs minus the grant and caps it per square metre. How much you may add in your own case is a tenancy law question for a lawyer or a landlords’ association.' },
      { q: 'Does a landlord pay part of the tenants’ CO₂ costs in Germany?', a: `Yes, under the CO₂ Cost Allocation Act (CO2KostAufG). The worse the building performs, the larger the landlord’s share, up to ${EN.pct(vermieterMax)}. A 70 m² flat using ${EN.num(12000)} kWh of gas a year leaves the landlord ${EN.pct(co2.vermieter)} today, or ${EN.eur(co2.vermieterEuro)} a year. A heat pump removes that cost; a new gas boiler raises the landlord’s share to half from 2028.` },
      { q: 'Can a partnership (GbR) that owns a rental building use KfW 458?', a: 'No. The information sheet excludes civil-law partnerships registered as owner in the land register, and their partners. KfW runs a separate programme, number 459, for them. Holders of a usufruct cannot apply either. If you and a partner bought a building abroad through a company structure, check who is registered as owner in the German land register before planning on this grant.' },
    ],
    body: (h) => `
<h2>What landlords get and what they do not</h2>
<p>Private individuals registered as owners of an existing residential building or a flat may apply, even if they live elsewhere, including outside Germany (${h.src('merkblatt458', 'information sheet 458')}). The planning application must be at least ${F.gebaeude_mindestalter_jahre} years old. The grant is made up of the basic rate and, for owner-occupiers only, bonuses. For a let unit that leaves a flat ${h.pct(F.grund)}, however old the previous system and whatever the owner earns (${h.src('kfw458', 'KfW product page')}).</p>
<p>That sounds modest, but it is predictable. An owner-occupier loses part of the climate bonus every six months from 1 February 2027. A landlord never had it, so the calendar matters less. What counts is the number of flats, the cost and which system goes in.</p>
${h.table(['Building', 'Cost', 'Eligible', 'Grant', 'Own share'], [
  ['House, let', h.eur(26000), h.eur(efhV.foerderfaehig), h.eur(efhV.zuschuss), h.eur(efhV.eigenanteil)],
  ['Three flats, all let', h.eur(60000), h.eur(drei.foerderfaehig), h.eur(drei.zuschuss), h.eur(drei.eigenanteil)],
  ['Three flats, owner lives in one', h.eur(60000), h.eur(dreiSelbst.foerderfaehig), h.eur(dreiSelbst.zuschuss), h.eur(dreiSelbst.eigenanteil)],
  ['Six flats, all let', h.eur(95000), h.eur(sechs.foerderfaehig), h.eur(sechs.zuschuss), h.eur(sechs.eigenanteil)],
  ['Twelve flats, all let', h.eur(180000), h.eur(zwoelf.foerderfaehig), h.eur(zwoelf.zuschuss), h.eur(zwoelf.eigenanteil)],
], 'Heat pump replacing a 25-year-old gas boiler, application in October 2026', ['l', 'r', 'r', 'r', 'r'])}

<h2>How the number of flats sets the amount</h2>
<p>The cap applies to the whole building and grows with each flat: ${h.eur(F.hoechst_erste_we[0].betrag)} for the first, ${h.eur(F.hoechst_we_2_bis_6)} for each of the second to sixth, ${h.eur(F.hoechst_we_ab_7)} for every further one (${h.src('begem2026', 'guideline no. 8.3.1')}). Six flats reach ${h.eur(H6)}, twelve reach ${h.eur(zwoelf.hoechstbetrag)}. In the twelve-flat example the cost exceeds the cap, which is why the owner’s share there rises faster than the invoice.</p>
<p>The six-monthly reduction only touches the first flat’s amount. For the six-flat building the cap falls from ${h.eur(H6)} to ${h.eur(H6feb)} on 1 February 2027. Because the ${h.eur(95000)} cost is below it, the grant stays at ${h.eur(sechsFeb.zuschuss)}. The cap applies once per building across all applications, so funding a heat pump now and solar thermal later draws on the same amount.</p>

<h2>If you live in the building yourself</h2>
<p>If the owner lives in one of the flats as their registered main residence, that unit gets the climate speed bonus and, depending on income, the income bonus. KfW assumes an equal share of the building per flat, so a third of eligible costs in a three-flat house. Only one flat can count as owner-occupied. With ${h.eur(45000)} household income the three-flat example rises from ${h.eur(drei.zuschuss)} to ${h.eur(dreiSelbst.zuschuss)}, and the rate for the owner’s flat is ${h.pct(dreiSelbst.satzEigen)}. Income here means German tax assessments (Steuerbescheide) for the second and third year before applying, and income earned abroad counts. The calculator above shows your building; the rates are set out under ${h.a('kfw-458', 'KfW 458')}.</p>

<h2>2027: heat pump or pellets in a rental building</h2>
<p>For landlords another change weighs more than the shrinking bonus. The guideline cuts the basic grant for heat pumps to ${h.pct(F.q1_2027.wp_grund)} from the first quarter of 2027 and adds a ${h.pct(F.q1_2027.wertschoepfung)} value-added bonus if the unit originates in the EU. The start date and how origin is proven are not yet published. For the six-flat building, an application in April 2027 would bring ${h.eur(sechsAprEU.zuschuss)} with an EU unit and ${h.eur(sechsApr.zuschuss)} without. A pellet boiler would keep ${h.pct(F.grund)} and reach ${h.eur(sechsPellet.zuschuss)} (${h.a('pelletheizung', 'pellet boiler grant')}).</p>
<p>Also from the first quarter of 2027, replacing a renewable system running since 1 January 2008 or later will no longer be funded. If you buy a building with a recent heat pump and want to change it, factor that in.</p>

<h2>CO₂ costs: the part the landlord pays</h2>
<p>The CO₂ Cost Allocation Act splits heating CO₂ costs between tenant and landlord (${h.src('co2kostaufg', 'CO2KostAufG')}). The more CO₂ a flat produces per square metre, the larger the landlord’s share, up to ${h.pct(vermieterMax)}. A 70 m² flat using ${h.num(12000)} kWh of gas a year comes to ${h.num(co2.kgM2, 1)} kg per m². At ${h.eur(preis)} per tonne the landlord bears ${h.pct(co2.vermieter)}, or ${h.eur(co2.vermieterEuro)} a year, for every flat heated this way. The ${h.a('co2-kostenaufteilung', 'CO₂ cost split calculator')} gives the exact figure.</p>
<p>The Building Modernisation Act (GModG) allows gas and oil boilers again, but changes the sums for landlords. If such a system is newly installed under section 43 (${h.src('gmodg43', 'section 43 GModG')}), landlord and tenant split the CO₂ costs and the gas network charges equally from 1 January 2028, and from 2029 also the extra cost of biogas or bio-oil up to a fuel share of ${h.pct(A.biobrennstoff_anteil_max)}. In the example flat the landlord’s part would rise from ${h.eur(co2.vermieterEuro)} to ${h.eur(co2neu.vermieterEuro)} a year at the same CO₂ price.</p>
<!--mini:oelweiter-->

<h2>Rent, tax, loan</h2>
<p>After modernisation a landlord may raise the rent, but not on money the state paid. Section 559a of the Civil Code removes publicly funded costs from the calculation, and section 559e calculates the increase for subsidised heating from the costs minus the grant, with a cap per square metre of floor area. If the grant is refused although the conditions are met, the general rule of section 559 applies instead. Since 29 July 2026 section 559f has been added: after a heat pump is installed, the full increase is only allowed if an installer proves a seasonal performance factor of at least 2.5, except for instance in buildings erected after 1996 or heated with a flow temperature of no more than 55 degrees. The detail is tenancy law and belongs with a lawyer.</p>
<p>The section 35c income tax credit does not help landlords: it covers only homes the owner lives in. A loan can cover the rest. The ${h.a('ergaenzungskredit', 'top-up loan')} goes up to ${h.eur(F.kredit.hoechst_je_we)} per flat, but the interest subsidy applies only to the owner’s own flat and up to ${h.eur(F.kredit.zinsverbilligung_zve_bis)} income.</p>

<h2>Steps for a let building</h2>
<p>Before applying, sign a contract with the installer that only takes effect if the grant is approved. The installer or an energy efficiency expert then issues the confirmation for the application, and the owner applies in the KfW portal. After approval there are ${F.bewilligung_monate} months to install and ${F.nachweis_monate} months to submit proof; the system must run for ${F.nutzungspflicht_jahre} years. Tell your tenants about the works in good time. The full sequence is under ${h.a('foerderantrag', 'how to apply')}. If you own a single flat in an owners’ association, different rules apply (${h.a('weg', 'grant for owners’ associations')}).</p>`,
  },
});

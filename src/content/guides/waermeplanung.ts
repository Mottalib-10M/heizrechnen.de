import { defineGuide } from '../../lib/guide-types';
import { foerderung } from '../../lib/engine/foerderung';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Kommunale Wärmeplanung: §§ 4, 5, 18, 23, 25, 26, 27, 29, 31 WPG (gelesen auf gesetze-im-internet.de am 19.10.2026),
 * Entkopplung vom Heizungstausch durch das GModG (§ 71 Abs. 8 GEG gestrichen). Förderung Wärmenetzanschluss: KfW 458.
 */
const G = P.gesetz;
const jahr = (iso: string) => iso.slice(0, 4);
// Anschluss an ein Wärmenetz statt Ölheizung, Einfamilienhaus, Einkommen 60.000 €.
const netz = foerderung({ antrag: P.retrieved_at, gebaeude: 'efh', einheiten: 1, kosten: 15000, selbstnutzer: true, alt: 'oel', altJahre: 25, neu: 'netz', wpEU: false, zve: 60000, kind: false });

export default defineGuide({
  id: 'waermeplanung',
  group: 'gesetz',
  order: 50,
  mini: 'waermeplan',
  miniHref: 'waermepumpe-foerderung',
  related: ['heizungsgesetz', 'fernwaerme-preise', 'gasheizung-verbot', 'kfw-458', 'heizkosten-vergleich'],
  sources: ['wpg4', 'gmodg', 'gmodgBgbl', 'geg2023', 'merkblatt458'],
  de: {
    slug: 'kommunale-waermeplanung',
    nav: 'Kommunale Wärmeplanung',
    card: 'Bis wann Ihre Gemeinde einen Wärmeplan braucht und warum er seit dem 29. Juli 2026 keine Heizungspflicht mehr auslöst.',
    title: 'Kommunale Wärmeplanung 2026: Fristen und Folgen für Sie',
    description: `Kommunale Wärmeplanung 2026: Städte über ${DE.num(G.wpg_einwohner_grenze)} Einwohner bis 30.06.2026, alle anderen bis 30.06.2028. Seit dem GModG hängt keine Heizungspflicht mehr daran.`,
    h1: 'Kommunale Wärmeplanung: was der Plan Ihrer Gemeinde bedeutet',
    intro: 'Die Gemeinde plant, wo künftig Fernwärme, Wasserstoff oder einzelne Heizungen sinnvoll sind. Für Ihre eigene Heizung folgt daraus seit dem 29. Juli 2026 keine Pflicht mehr, wohl aber eine Information.',
    resume: `Das Wärmeplanungsgesetz (WPG) verpflichtet die Länder, für jede Gemeinde einen Wärmeplan erstellen zu lassen. Für Gemeinden mit mehr als ${DE.num(G.wpg_einwohner_grenze)} Einwohnern am 1. Januar 2024 lief die Frist am 30. Juni 2026 ab, für alle anderen läuft sie bis zum 30. Juni 2028 (§ 4 Absatz 2). Der Plan teilt das Gemeindegebiet in voraussichtliche Wärmeversorgungsgebiete ein, etwa für ein Wärmenetz, für Wasserstoff oder für dezentrale Heizungen. Er hat nach § 23 keine rechtliche Außenwirkung: Niemand muss deshalb eine bestimmte Heizung nutzen. Bis zum 28. Juli 2026 war der Wärmeplan trotzdem wichtig, weil an ihm die Frist für die ${DE.pct(G.alt_65_prozent)}-Regel hing. Diese Kopplung hat das Gebäudemodernisierungsgesetz mit § 71 gestrichen. Wer an ein Wärmenetz anschließen kann, bekommt dafür den Zuschuss 458: Ein Selbstnutzer mit ${DE.eur(60000)} Einkommen, der eine Ölheizung ersetzt, erhält bei ${DE.eur(15000)} Anschlusskosten ${DE.eur(netz.zuschuss)}.`,
    faqs: [
      { q: 'Muss ich warten, bis meine Gemeinde den Wärmeplan hat?', a: 'Nein. Seit dem 29. Juli 2026 hängt keine Pflicht für Ihre Heizung mehr am Wärmeplan, Sie können jederzeit tauschen. Sinnvoll ist ein Blick in den Plan trotzdem, wenn Ihr Haus in einem Gebiet liegt, das für ein Wärmenetz vorgesehen ist: Dann kann ein späterer Anschluss günstiger sein als eine eigene Wärmepumpe. Eine Zusage, dass das Netz kommt, gibt der Plan nicht.' },
      { q: 'Wo finde ich den Wärmeplan meiner Stadt?', a: 'Nach § 23 Absatz 3 WPG wird der beschlossene Wärmeplan im Internet veröffentlicht, in der Regel auf der Website der Stadt oder Gemeinde. Für Städte über 100.000 Einwohner hätte er bis zum 30. Juni 2026 vorliegen müssen. Gemeinden, die schon vor 2024 nach Landesrecht geplant haben, behalten ihren Plan nach § 5, er gilt dem neuen gleich.' },
      { q: 'Kann mich die Gemeinde zum Anschluss an die Fernwärme zwingen?', a: 'Nicht über den Wärmeplan und nicht über eine Ausweisung als Wärmenetzgebiet: § 27 WPG sagt ausdrücklich, dass daraus keine Pflicht entsteht. Einen Anschluss- und Benutzungszwang kann eine Gemeinde aber nach ihrem eigenen Satzungsrecht beschließen, darauf verweist § 109 GModG. Liegt Ihr Grundstück in einem solchen Gebiet, fördert die KfW nur noch den Anschluss an das Netz.' },
      { q: 'Wie klimafreundlich muss die Fernwärme in meinem Plan werden?', a: 'Für jedes Wärmenetz schreibt § 29 WPG ab dem 1. Januar 2030 mindestens 30 Prozent Wärme aus erneuerbaren Energien oder unvermeidbarer Abwärme vor, ab 2040 mindestens 80 Prozent. Spätestens Ende 2044 muss jedes Netz vollständig so gespeist werden (§ 31). In Härtefällen kann die Behörde die Fristen verlängern. Was ein Anschluss kostet, sagt das Gesetz nicht.' },
    ],
    body: (h) => `
<h2>Die Fristen nach Einwohnerzahl</h2>
${h.table(['Gemeinde am 1. Januar 2024', 'Wärmeplan spätestens', 'Besonderheit'], [
  [`mehr als ${h.num(G.wpg_einwohner_grenze)} Einwohner`, h.date(G.wpg_gross_frist), 'Großstädte'],
  [`${h.num(G.wpg_einwohner_grenze)} oder weniger`, h.date(G.wpg_klein_frist), 'alle übrigen Gemeinden'],
  ['unter 10.000 Einwohner', h.date(G.wpg_klein_frist), 'Land kann ein vereinfachtes Verfahren erlauben (§ 4 Abs. 3)'],
  ['Plan nach Landesrecht schon vorhanden', 'gilt weiter', 'Fortschreibung nach Bundesrecht spätestens ab 1. Juli 2030 (§§ 5, 25)'],
], 'Wärmeplanungsgesetz §§ 4, 5 und 25', ['l', 'r', 'l'])}
<p>Die Pflicht trifft nach ${h.src('wpg4', '§ 4 WPG')} die Länder, nicht die Bürger. Die Länder geben sie meist an die Gemeinden weiter. Ist ein Plan fertig, muss er spätestens alle fünf Jahre überprüft und bei Bedarf fortgeschrieben werden (§ 25). Entscheidend ist die gemeldete Einwohnerzahl am 1. Januar 2024, nicht die heutige.</p>
<!--mini:fernwaerme-->

<h2>Was ein Wärmeplan enthält</h2>
<p>Die planende Stelle untersucht zuerst, wie heute geheizt wird (Bestandsanalyse) und welche Quellen es vor Ort gibt (Potenzialanalyse). Daraus teilt sie das Gebiet nach § 18 in voraussichtliche Wärmeversorgungsgebiete ein: Wärmenetz, Wasserstoffnetz, dezentrale Versorgung oder Prüfgebiet, jeweils für mehrere Zeitpunkte bis zum Zieljahr. Maßstab sind Kosten über die Lebensdauer, Risiken, Versorgungssicherheit und Treibhausgase. Der Plan nennt außerdem Maßnahmen, mit denen die Gemeinde ihn umsetzen will. Für den einzelnen Hausbesitzer ist das Ergebnis eine Karte, auf der er sieht, welche Versorgung für seine Straße vorgesehen ist.</p>
<p>Wichtig sind zwei Sätze des Gesetzes. Nach § 18 Absatz 2 entsteht aus der Einteilung keine Pflicht, eine bestimmte Versorgungsart zu nutzen oder bereitzustellen. Nach § 23 Absatz 4 hat der ganze Plan keine rechtliche Außenwirkung und begründet keine einklagbaren Rechte. Auch der Stadtwerke-Anschluss, der im Plan steht, ist damit kein Anspruch. Umgekehrt kann niemand aus dem Plan ableiten, dass ein bestimmtes Haus eine Wärmepumpe oder einen Fernwärmeanschluss haben muss. Wer ein Haus kauft, sollte den Plan deshalb lesen, aber nicht als Auflage verstehen.</p>

<h2>Warum der Plan bis Juli 2026 so wichtig war</h2>
<p>Im Gebäudeenergiegesetz von 2024 regelte § 71 Absatz 8, ab wann die ${h.pct(G.alt_65_prozent)}-Pflicht für bestehende Häuser galt: in großen Städten nach dem 30. Juni 2026, später auf den 31. Oktober 2026 verschoben, in den übrigen Gemeinden nach dem 30. Juni 2028, oder schon einen Monat nach einer Ausweisung als Wärmenetz- oder Wasserstoffgebiet (${h.src('geg2023', 'GEG 2024')}). Deshalb schauten viele Eigentümer auf den Wärmeplan wie auf einen Stichtag. Das ${h.src('gmodgBgbl', 'Gesetz vom 23. Juli 2026')} hat § 71 gestrichen, bevor die erste Frist griff. Heute ist der Wärmeplan eine Planungsgrundlage der Gemeinde und eine Information für Eigentümer, mehr nicht. Was stattdessen für neue Gas- und Ölheizungen gilt, steht unter ${h.a('heizungsgesetz', 'Heizungsgesetz')}.</p>

<h2>Was Sie im Plan nachsehen sollten</h2>
<p>Ein Wärmeplan ist ein langes Dokument mit Karten, Tabellen und Szenarien. Für den eigenen Heizungstausch genügen meist vier Punkte. Erstens die Einteilung Ihres Baublocks: Wärmenetz, Wasserstoff, dezentral oder Prüfgebiet. Zweitens der Zeitpunkt, für den diese Einteilung gilt, denn der Plan zeigt mehrere Stichjahre bis zum Zieljahr. Drittens die Umsetzungsmaßnahmen: Steht dort ein konkreter Netzausbau mit Jahr und Betreiber, ist ein Anschluss wahrscheinlicher als bei einer bloßen Eignung. Viertens, ob die Gemeinde schon eine Ausweisung nach § 26 oder eine Satzung mit Anschlusszwang beschlossen hat. Fehlen diese Angaben, spricht wenig dafür, mit einer Wärmepumpe zu warten. Für Wasserstoffgebiete gilt besondere Vorsicht: Der Plan beschreibt eine Möglichkeit, keinen Lieferanten und keinen Preis. Wer heute eine neue Gasheizung mit der Hoffnung auf Wasserstoff kauft, trägt ab ${jahr(G.biotreppe[0].ab)} trotzdem die Pflichten aus § 43 GModG.</p>

<h2>Ausweisung und Anschlusszwang</h2>
<p>Auf Grundlage des Plans kann die Gemeinde nach § 26 grundstücksbezogen Gebiete zum Neu- oder Ausbau von Wärmenetzen oder als Wasserstoffnetzausbaugebiete ausweisen. Auch diese Entscheidung bewirkt nach § 27 keine Pflicht, eine bestimmte Versorgung zu nutzen. Etwas anderes ist der Anschluss- und Benutzungszwang, den Gemeinden nach Landesrecht per Satzung festlegen können und auf den § 109 des ${h.src('gmodg', 'GModG')} verweist. Er kann tatsächlich vorschreiben, sich an ein Netz anzuschließen. Liegt Ihr Grundstück in so einem Gebiet, fördert die KfW nach dem ${h.src('merkblatt458', 'Merkblatt 458')} nur noch den Anschluss an dieses Netz, keine eigene Wärmepumpe.</p>

<h2>Wärmenetz oder eigene Heizung</h2>
<p>Wenn der Plan Ihre Straße als Wärmenetzgebiet zeigt, lohnt die Frage an den Netzbetreiber, ob und wann er dort baut und zu welchem Preis. Der Anschluss wird wie eine Wärmepumpe mit ${h.pct(P.foerderung.grund)} Grundförderung und den Boni für Selbstnutzer bezuschusst, im Beispiel oben ${h.eur(netz.zuschuss)}. Ein amtlicher Durchschnittspreis für Fernwärme fehlt, deshalb rechnet der Rechner auf ${h.a('fernwaerme-preise', 'Fernwärme Preise')} mit Ihrem Angebot. Den Vergleich mit Gas und Wärmepumpe im Jahr zeigt ${h.a('heizkosten-vergleich', 'Heizkosten Vergleich')}. Den Zuschuss für Ihr Datum berechnet der ${h.a('kfw-458', 'Überblick zu KfW 458')}.</p>`,
  },
  en: {
    slug: 'municipal-heat-planning',
    nav: 'Municipal heat planning',
    card: 'When your German municipality needs a heat plan, and why it has not triggered any heating duty since 29 July 2026.',
    title: 'Municipal Heat Planning Germany 2026: Deadlines and Effects',
    description: `Municipal heat planning in Germany 2026: towns over ${EN.num(G.wpg_einwohner_grenze)} residents by 30 June 2026, all others by 30 June 2028. No heating duty depends on it any more.`,
    h1: 'Municipal heat planning in Germany: what your town’s plan means',
    intro: 'Your municipality plans where district heating, hydrogen or individual systems make sense. Since 29 July 2026 that creates no duty for your own heating, only information.',
    resume: `Germany’s Heat Planning Act (Wärmeplanungsgesetz, WPG) requires the federal states to have a heat plan drawn up for every municipality. For municipalities with more than ${EN.num(G.wpg_einwohner_grenze)} residents on 1 January 2024 the deadline was 30 June 2026; for all others it runs until 30 June 2028 (section 4(2)). The plan divides the area into expected heat supply zones, for a heat network, hydrogen or individual systems. Under section 23 it has no external legal effect: nobody has to use a particular system because of it. Until 28 July 2026 the heat plan mattered all the same, because the start of the ${EN.pct(G.alt_65_prozent)} rule was tied to it. The Building Modernisation Act removed that link along with section 71. If you can connect to a heat network, the 458 grant covers it: an owner-occupier on ${EN.eur(60000)} replacing an oil boiler receives ${EN.eur(netz.zuschuss)} on connection costs of ${EN.eur(15000)}.`,
    faqs: [
      { q: 'Should I wait for my town’s heat plan before replacing my heating?', a: 'No. Since 29 July 2026 no duty for your heating depends on the heat plan, so you can replace it at any time. A look at the plan is still worthwhile if your house lies in an area earmarked for a heat network: a later connection may then cost less than your own heat pump. The plan gives no promise that the network will actually be built.' },
      { q: 'Where can I find my municipality’s heat plan?', a: 'Under section 23(3) WPG the adopted plan is published online, usually on the town or municipality website, in German. For towns over 100,000 residents it should have been available by 30 June 2026. Municipalities that planned under state law before 2024 keep their plan under section 5, and it counts as equal to a new one.' },
      { q: 'Can the municipality force me onto district heating?', a: 'Not through the heat plan, and not through designating a heat network zone: section 27 WPG states that no duty arises from either. A municipality can, however, adopt a compulsory connection and use bylaw under its own statutory powers, which section 109 GModG refers to. If your plot lies in such an area, KfW funds only the connection to that network.' },
      { q: 'How green must the district heating in my area become?', a: 'Section 29 WPG requires every heat network to draw at least 30 per cent of its heat from renewables or unavoidable waste heat from 1 January 2030, and at least 80 per cent from 2040. By the end of 2044 at the latest, every network must be fed entirely this way (section 31). The authority can extend the deadlines in hardship cases. The law says nothing about connection prices.' },
    ],
    body: (h) => `
<h2>Deadlines by population</h2>
${h.table(['Municipality on 1 January 2024', 'Heat plan due by', 'Note'], [
  [`more than ${h.num(G.wpg_einwohner_grenze)} residents`, h.date(G.wpg_gross_frist), 'larger cities'],
  [`${h.num(G.wpg_einwohner_grenze)} or fewer`, h.date(G.wpg_klein_frist), 'all other municipalities'],
  ['under 10,000 residents', h.date(G.wpg_klein_frist), 'the state may allow a simplified procedure (s. 4(3))'],
  ['plan under state law already exists', 'remains valid', 'update to federal standard from 1 July 2030 at the latest (ss. 5, 25)'],
], 'Heat Planning Act sections 4, 5 and 25', ['l', 'r', 'l'])}
<p>Under ${h.src('wpg4', 'section 4 WPG')} the duty falls on the federal states, not on residents. The states usually pass it on to the municipalities. Once finished, a plan must be reviewed at least every five years and updated where needed (section 25). What counts is the registered population on 1 January 2024, not today’s.</p>
<!--mini:fernwaerme-->

<h2>What a heat plan contains</h2>
<p>The planning body first looks at how buildings are heated today (stock analysis) and which local sources exist (potential analysis). From that it divides the area under section 18 into expected heat supply zones: heat network, hydrogen network, individual supply or zone under review, each for several dates up to the target year. The yardsticks are lifetime costs, risks, security of supply and greenhouse gases. The plan also names the steps the municipality intends to take. For an individual owner the result is a map showing which supply is foreseen for their street.</p>
<p>Two sentences of the act matter most. Under section 18(2), the zoning creates no duty to use or provide a particular type of supply. Under section 23(4), the plan as a whole has no external legal effect and creates no enforceable rights. A utility connection shown in the plan is therefore not an entitlement either.</p>

<h2>Why the plan mattered so much until July 2026</h2>
<p>In the 2024 Building Energy Act, section 71(8) set when the ${h.pct(G.alt_65_prozent)} duty began for existing houses: in large cities after 30 June 2026, later moved to 31 October 2026, elsewhere after 30 June 2028, or one month after a zone was designated for a heat or hydrogen network (${h.src('geg2023', 'GEG 2024')}). That is why many owners, and many English-language guides for expats, treated the heat plan like a deadline. The ${h.src('gmodgBgbl', 'act of 23 July 2026')} deleted section 71 before the first deadline arrived. Today the heat plan is a planning basis for the municipality and information for owners, nothing more. What applies to new gas and oil boilers instead is under ${h.a('heizungsgesetz', 'heating law')}.</p>

<h2>What to look for in the plan</h2>
<p>A heat plan is a long document of maps, tables and scenarios, in German. For your own heating decision four points usually suffice. First, how your block is zoned: heat network, hydrogen, individual supply or under review. Second, the year the zoning refers to, since the plan shows several dates up to the target year. Third, the implementation steps: a concrete network extension with a year and an operator makes a connection more likely than mere suitability. Fourth, whether the municipality has already designated the area under section 26 or adopted a compulsory connection bylaw. If none of this is there, there is little reason to put off a heat pump. Be careful with hydrogen zones: the plan describes a possibility, not a supplier or a price.</p>

<h2>Designation and compulsory connection</h2>
<p>Based on the plan, a municipality may designate plots for new or expanded heat networks or hydrogen networks under section 26. Under section 27 that decision also creates no duty to use a particular supply. A compulsory connection and use bylaw is different: municipalities can adopt one under state law, and section 109 of the ${h.src('gmodg', 'GModG')} refers to it. That can genuinely require you to connect to a network. If your plot lies in such an area, KfW funds only the connection to that network under ${h.src('merkblatt458', 'information sheet 458')}, not your own heat pump.</p>

<h2>Heat network or your own system</h2>
<p>If the plan shows your street as a heat network zone, ask the network operator whether and when they will build there and at what price. A connection is funded like a heat pump, with ${h.pct(P.foerderung.grund)} basic grant and the owner-occupier bonuses, ${h.eur(netz.zuschuss)} in the example above. There is no official average price for district heating, so the calculator on ${h.a('fernwaerme-preise', 'district heating prices')} uses your quote. The yearly comparison with gas and a heat pump is under ${h.a('heizkosten-vergleich', 'heating costs compared')}. The grant for your application date is covered in the ${h.a('kfw-458', 'KfW 458 overview')}.</p>`,
  },
});

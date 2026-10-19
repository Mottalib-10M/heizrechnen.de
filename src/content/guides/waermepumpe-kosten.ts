import { defineGuide } from '../../lib/guide-types';
import { foerderung, hoechstbetrag, type FoerderEingabe } from '../../lib/engine/foerderung';
import { nutzwaerme, laufend } from '../../lib/engine/heizkosten';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Wärmepumpe Kosten: kein amtlicher Kaufpreis. Bezugspunkte = Beispiele der KfW (Pressemitteilung 08.07.2026: 32.000 €;
 * Produktseite: 41.000 € Sole mit Solarthermie im Zweifamilienhaus, 20.000 € Split-Gerät in einer WEG-Wohnung).
 * Eigenes Rechenbeispiel: Angebot 32.000 €, Gasheizung 22 Jahre, Einkommen von 28.000 bis 90.000 €; Betrieb 130 m², Klasse E, Baden-Württemberg.
 */
const F = P.foerderung;
const S = P.steuer35c;
const heute = P.retrieved_at;
const b: FoerderEingabe = { antrag: heute, gebaeude: 'efh', einheiten: 1, kosten: 32000, selbstnutzer: true, alt: 'gas', altJahre: 22, neu: 'wp', wpEU: true, zve: 65000, kind: false };
const mitte = foerderung(b);
const pm = foerderung({ ...b, alt: 'oel', altJahre: 30, zve: 40000, kind: true });
const z90 = foerderung({ ...b, zve: 90000 });
const z48 = foerderung({ ...b, zve: 48000 });
const z36 = foerderung({ ...b, zve: 36000 });
const z28 = foerderung({ ...b, zve: 28000 });
const vermieter = foerderung({ ...b, selbstnutzer: false });
const jung = foerderung({ ...b, altJahre: 12 });
const feb27 = foerderung({ ...b, antrag: '2027-02-01' });
const apr27 = foerderung({ ...b, antrag: '2027-04-01', wpEU: false });
const becker = foerderung({ ...b, gebaeude: 'mfh', einheiten: 2, kosten: 41000, alt: 'oel', altJahre: 30, zve: 200000 });
const foerster = foerderung({ ...b, gebaeude: 'etw', einheiten: 5, kosten: 20000, alt: 'nachtspeicher', altJahre: 30, zve: 70000 });
const H = hoechstbetrag(heute, 1);
const kgb = F.kgb_stufen[0].satz;
const ueber = 32000 - H;
const steuer = 32000 * (S.jahr1 + S.jahr2 + S.jahr3);
const q = nutzwaerme({ flaeche: 130, klasse: 'E', land: 'Baden-Württemberg' });
const wp = laufend('wp_luft', q)!;
const gas = laufend('gas', q)!;
const oel = laufend('oel', q)!;

export default defineGuide({
  id: 'waermepumpe-kosten',
  group: 'kosten',
  order: 117,
  mini: 'wpnetto',
  miniHref: 'waermepumpe-foerderung',
  related: ['waermepumpe-foerderung', 'waermepumpe-rechner', 'heizungstausch-kosten', 'steuerbonus-35c', 'ergaenzungskredit', 'klimageschwindigkeitsbonus'],
  sources: ['kfwPm', 'kfw458', 'merkblatt458', 'begem2026', 'estg35c', 'iseWpqs', 'destatisPreise'],
  de: {
    slug: 'waermepumpe-kosten',
    nav: 'Wärmepumpe Kosten',
    card: 'Was eine Wärmepumpe kostet, wenn Zuschuss und Höchstbetrag abgezogen sind, und was sie danach im Jahr verbraucht.',
    title: 'Wärmepumpe Kosten 2026: Preis, Zuschuss und Betrieb im Jahr',
    description: `Wärmepumpe Kosten 2026: Die KfW-Beispiele als Bezugspunkt, Eigenanteil nach ${DE.pct(F.grund)} bis ${DE.pct(F.deckel_niedrig)} Zuschuss auf höchstens ${DE.eur(H)} und die Stromkosten danach im Jahr.`,
    h1: 'Wärmepumpe Kosten: Anschaffung, Eigenanteil und Betrieb 2026',
    intro: 'Eine amtliche Preisliste für Wärmepumpen gibt es nicht. Diese Seite nimmt die Beispiele der KfW als Bezugspunkt und rechnet aus, was nach dem Zuschuss und im Betrieb bleibt.',
    resume: `Was eine Wärmepumpe kostet, veröffentlicht keine Behörde: Es gibt keine amtliche Preisstatistik für Kauf und Einbau. Die einzigen offiziellen Bezugspunkte sind die Rechenbeispiele der KfW. In ihrer Pressemitteilung vom 8. Juli 2026 setzt sie für ein Einfamilienhaus ${DE.eur(32000)} an, auf der Produktseite ${DE.eur(41000)} für eine Erdwärmepumpe mit Solarthermie in einem Zweifamilienhaus und ${DE.eur(20000)} für ein Split-Gerät in einer Eigentumswohnung. Gefördert werden davon höchstens ${DE.eur(H)} für die erste Wohnung bei Antrag bis zum 31. Januar 2027. Bei ${DE.eur(32000)} bleiben also ${DE.eur(ueber)} ohne Zuschuss. Ersetzt die Wärmepumpe eine 22 Jahre alte Gasheizung, zahlt die KfW einem selbst nutzenden Haushalt mit ${DE.eur(65000)} zu versteuerndem Einkommen ${DE.eur(mitte.zuschuss)}, der Eigenanteil liegt bei ${DE.eur(mitte.eigenanteil)}. Mit ${DE.eur(28000)} Einkommen sinkt er auf ${DE.eur(z28.eigenanteil)}. Im Betrieb braucht ein Haus mit 130 m² in Klasse E in Baden-Württemberg rund ${DE.num(wp.menge)} kWh Strom, das sind ${DE.eur(wp.kosten)} im Jahr gegen ${DE.eur(gas.kosten)} mit Gas.`,
    faqs: [
      { q: 'Warum nennt diese Seite keine typische Preisspanne für Wärmepumpen?', a: `Weil es dafür keine amtliche Quelle gibt. Weder Destatis noch KfW oder BAFA veröffentlichen Durchschnittspreise für Kauf und Einbau. Spannen, die im Netz kursieren, stammen nicht aus amtlichen Erhebungen und lassen sich kaum überprüfen. Verlässlich sind nur Ihr eigenes Angebot und die Beispiele, mit denen die KfW selbst rechnet. Holen Sie mehrere Angebote ein und vergleichen Sie, was jeweils enthalten ist.` },
      { q: 'Wird der Teil des Angebots über dem Höchstbetrag mitgefördert?', a: `Nein. Die KfW rechnet den Zuschuss nur auf förderfähige Kosten bis ${DE.eur(H)} für die erste Wohnung, bei Antrag ab dem 1. Februar 2027 auf ${DE.eur(hoechstbetrag('2027-02-01', 1))}. Kostet die Wärmepumpe ${DE.eur(32000)}, zahlen Sie ${DE.eur(ueber)} in jedem Fall selbst. Für diesen Rest und den Eigenanteil gibt es den Ergänzungskredit bis ${DE.eur(F.kredit.hoechst_je_we)} je Wohnung.` },
      { q: 'Lohnt sich bei einer Wärmepumpe der Steuerbonus statt des Zuschusses?', a: `Selten. Nach § 35c EStG mindern ${DE.pct(S.jahr1)}, ${DE.pct(S.jahr2)} und ${DE.pct(S.jahr3)} der Kosten über drei Jahre die Einkommensteuer, bei ${DE.eur(32000)} also ${DE.eur(steuer)}. Schon die Grundförderung allein bringt ${DE.eur(vermieter.zuschuss)}, sofort ausgezahlt. Beides für dieselbe Maßnahme geht nicht. Der Steuerbonus passt eher, wenn der Antrag bei der KfW verpasst wurde und das Haus älter als ${S.objekt_mindestalter} Jahre ist.` },
      { q: 'Steigt mein Eigenanteil, wenn ich die Wärmepumpe erst 2027 beantrage?', a: `In der Regel ja. Am 1. Februar 2027 sinken der Höchstbetrag auf ${DE.eur(hoechstbetrag('2027-02-01', 1))} und der Klimageschwindigkeitsbonus auf ${DE.pct(F.kgb_stufen[1].satz)}. Im Beispiel mit ${DE.eur(65000)} Einkommen fällt der Zuschuss dadurch von ${DE.eur(mitte.zuschuss)} auf ${DE.eur(feb27.zuschuss)}. Ab dem ersten Quartal 2027 kommt hinzu, dass ein Gerät ohne Ursprung in der EU nur noch ${DE.pct(F.q1_2027.wp_grund)} Grundförderung erhalten soll; der Starttag ist offen.` },
      { q: 'Welche Posten der Rechnung zählen zu den förderfähigen Kosten?', a: 'Neben dem Gerät auch Einbau und Inbetriebnahme sowie die nötigen vor- und nachbereitenden Arbeiten, die die Richtlinie Umfeldmaßnahmen nennt, etwa der Abbau der alten Heizung. Dazu kommen die Optimierung der Heizkörper und Leitungen mit hydraulischem Abgleich, die ohnehin Pflicht ist, sowie Fachplanung und Baubegleitung. Auch die Miete einer Übergangsheizung zählt, höchstens für ein Jahr ab dem Antrag. Gebrauchte Geräte und Eigenbau sind ausgeschlossen. Achten Sie darauf, dass das Angebot diese Posten einzeln ausweist.' },
    ],
    body: (h) => `
<h2>Kein amtlicher Preis, aber drei Bezugspunkte</h2>
<p>Wer nach den Kosten einer Wärmepumpe sucht, findet viele Spannen, aber keine davon stammt von einer Behörde. Die amtliche Statistik erfasst die Energiepreise, nicht die Preise für Heizungen. Die KfW rechnet in ihren eigenen Beispielen mit konkreten Beträgen, und diese Beispiele sind die einzigen öffentlichen Zahlen mit offiziellem Absender. Wir rechnen sie mit dem Motor dieser Website nach (${h.src('kfw458', 'KfW-Produktseite 458')}, ${h.src('kfwPm', 'Pressemitteilung vom 8. Juli 2026')}).</p>
${h.table(['Beispiel der KfW', 'Kosten', 'Zuschuss', 'Eigenanteil'], [
  ['Einfamilienhaus, Familie mit Kind, Einkommen 40.000 € (Pressemitteilung)', h.eur(32000), h.eur(pm.zuschuss), h.eur(pm.eigenanteil)],
  ['Zweifamilienhaus, Erdwärme mit Solarthermie, Öl ersetzt', h.eur(41000), h.eur(becker.zuschuss), h.eur(41000 - becker.zuschuss)],
  ['Eigentumswohnung, Split-Wärmepumpe statt Nachtspeicher', h.eur(20000), h.eur(foerster.zuschuss), h.eur(foerster.eigenanteil)],
], 'Antrag jetzt, Fallangaben wie in den Beispielen der KfW', ['l', 'r', 'r', 'r'])}
<p>Für Ihr Haus zählt nur Ihr Angebot. Die drei Fälle zeigen aber, wie stark die Art des Gebäudes das Ergebnis prägt: Im Zweifamilienhaus steigt der Höchstbetrag, in der Wohnung wird er auf die Einheiten verteilt. Die Erdwärmepumpe ist im Beispiel teurer, braucht laut Feldmessung im Betrieb aber weniger Strom.</p>

<h2>Was nach dem Zuschuss bleibt</h2>
<p>Der Zuschuss besteht aus ${h.pct(F.grund)} Grundförderung für jeden Eigentümer und zwei Boni für Selbstnutzer: dem Klimageschwindigkeitsbonus von derzeit ${h.pct(kgb)} und dem Einkommensbonus bis ${h.pct(F.einkommen_stufen[0].bonus)}. Gedeckelt ist die Summe bei ${h.pct(F.deckel_standard)}, bei einem Einkommen bis ${h.eur(F.deckel_niedrig_zve)} bei ${h.pct(F.deckel_niedrig)} (${h.src('begem2026', 'Richtlinie vom 17. August 2026')}). Für dasselbe Angebot von ${h.eur(32000)} und eine 22 Jahre alte Gasheizung:</p>
${h.table(['Haushalt', 'Satz', 'Zuschuss', 'Sie zahlen'], [
  [`Einkommen ${h.eur(90000)}`, h.pct(z90.satzEigen), h.eur(z90.zuschuss), h.eur(z90.eigenanteil)],
  [`Einkommen ${h.eur(48000)}`, h.pct(z48.satzEigen), h.eur(z48.zuschuss), h.eur(z48.eigenanteil)],
  [`Einkommen ${h.eur(36000)}`, h.pct(z36.satzEigen), h.eur(z36.zuschuss), h.eur(z36.eigenanteil)],
  [`Einkommen ${h.eur(28000)}`, h.pct(z28.satzEigen), h.eur(z28.zuschuss), h.eur(z28.eigenanteil)],
  ['Vermietetes Haus', h.pct(F.grund), h.eur(vermieter.zuschuss), h.eur(vermieter.eigenanteil)],
  ['Gasheizung erst 12 Jahre alt', h.pct(jung.satzEigen), h.eur(jung.zuschuss), h.eur(jung.eigenanteil)],
], `Förderfähig höchstens ${h.eur(H)}, Antrag bis 31. Januar 2027`, ['l', 'r', 'r', 'r'])}
<p>Auffällig ist der Sprung zwischen ${h.eur(48000)} und ${h.eur(36000)}: Der Einkommensbonus wächst dort von ${h.pct(F.einkommen_stufen[2].bonus)} auf ${h.pct(F.einkommen_stufen[1].bonus)}. Gezählt wird der Durchschnitt aus den Steuerbescheiden des zweiten und dritten Jahres vor dem Antrag (${h.src('merkblatt458', 'Merkblatt 458')}). Ohne Bonus bleibt es bei der jungen Gasheizung, weil der Klimageschwindigkeitsbonus erst ab ${F.kgb_mindestalter_gas_biomasse} Jahren greift. Die Sätze im Einzelnen stehen unter ${h.a('waermepumpe-foerderung', 'Wärmepumpe Förderung')} und ${h.a('klimageschwindigkeitsbonus', 'Klimageschwindigkeitsbonus')}.</p>

<h2>Steuerbonus als Alternative</h2>
<p>Wer keinen Zuschuss beantragt, kann die Kosten nach ${h.src('estg35c', '§ 35c EStG')} von der Einkommensteuer abziehen: ${h.pct(S.jahr1)} im Jahr des Abschlusses und im Folgejahr, ${h.pct(S.jahr3)} im dritten Jahr, insgesamt höchstens ${h.eur(S.max_gesamt)} je Objekt. Bei ${h.eur(32000)} sind das ${h.eur(steuer)}, verteilt auf drei Steuerjahre. Begünstigt ist nur die selbst bewohnte Wohnung, das Haus muss älter als ${S.objekt_mindestalter} Jahre sein, die Arbeiten müssen vor dem 1. Januar 2030 abgeschlossen sein, und für dieselbe Maßnahme schließt der Zuschuss den Bonus aus. Mehr dazu unter ${h.a('steuerbonus-35c', 'Steuerbonus Heizung')}.</p>
<!--mini:steuer35c-->

<h2>Was die Wärmepumpe im Betrieb kostet</h2>
<p>Ein Haus mit 130 m² in Klasse E in Baden-Württemberg braucht nach Klassenmitte und Klima rund ${h.num(q)} kWh Wärme. Mit der Jahresarbeitszahl, die das ${h.src('iseWpqs', 'Fraunhofer ISE')} in Bestandsgebäuden gemessen hat, ergibt das folgende Jahreskosten:</p>
${h.table(['Heizung', 'Kosten im Jahr'], [
  [`Luft-Wärmepumpe, JAZ ${h.num(P.technik.jaz_luft_messung, 1)}`, h.eur(wp.kosten)],
  [`Gasheizung, ${h.num(P.preise.gas_ct, 2)} ct/kWh`, h.eur(gas.kosten)],
  [`Ölheizung, ${h.num(P.preise.oel_eur_100l_12monate, 2)} € je 100 Liter`, h.eur(oel.kosten)],
], `Gas laut Destatis, 1. Halbjahr 2026; Wärmepumpentarif ${h.num(P.preise.wp_strom_getrennt_ct, 2)} ct/kWh`, ['l', 'r'])}
<p>Der Abstand zur Gasheizung, ${h.eur(gas.kosten - wp.kosten)} im Jahr, ist das, was die höhere Anschaffung einspielen muss. Die Gaspreise stammen aus der ${h.src('destatisPreise', 'Erhebung von Destatis')}. Für Ihr Haus und Ihr Bundesland rechnet der ${h.a('waermepumpe-rechner', 'Wärmepumpe Rechner')}.</p>

<h2>Was im Angebot stehen sollte</h2>
<p>Damit der Zuschuss nicht an Formalien scheitert, muss das Angebot einige Bedingungen erfüllen. Das Gerät muss in der Liste förderfähiger Wärmepumpen des BAFA stehen und auf eine Jahresarbeitszahl von mindestens ${h.num(P.technik.jaz_foerder_min, 1)} ausgelegt sein. Bei Luft-Wasser-Geräten muss das Außengerät mindestens ${P.technik.wp_laerm_db_unter_eu} dB leiser sein als die Grenzwerte der EU. Natürliche Kältemittel wie Propan sind heute empfohlen und ab dem ${h.date(P.technik.natuerliches_kaeltemittel_pflicht_ab)} Bedingung. Der Vertrag mit dem Fachbetrieb braucht vor dem Antrag eine Klausel, die ihn an die Förderzusage knüpft; fehlt sie, gilt die Unterschrift als Beginn des Vorhabens, und der Zuschuss ist verloren. Nach der Zusage bleiben ${F.bewilligung_monate} Monate für den Einbau. Den Ablauf Schritt für Schritt beschreibt ${h.a('foerderantrag', 'Heizungsförderung Antrag')}.</p>

<h2>Finanzierung und alte Zahlen im Netz</h2>
<p>Für den Eigenanteil gibt es den ${h.a('ergaenzungskredit', 'Ergänzungskredit')} bis ${h.eur(F.kredit.hoechst_je_we)} je Wohnung, verbilligt für Haushalte bis ${h.eur(F.kredit.zinsverbilligung_zve_bis)} Einkommen. Vorsicht bei Kostenrechnern, die noch ${h.pct(F.alt.kgb)} Klimabonus, ${h.pct(F.alt.effizienz)} Effizienzbonus oder ${h.eur(F.alt.hoechst_erste_we)} Höchstbetrag ansetzen: Das ist der Stand für Anträge bis zum 20. Juli 2026. Ebenso falsch ist ${h.pct(F.deckel_standard)} als absolute Obergrenze, denn bei kleinem Einkommen sind es ${h.pct(F.deckel_niedrig)}. Für Anträge ab dem ersten Quartal 2027 ist für Wärmepumpen eine Grundförderung von ${h.pct(F.q1_2027.wp_grund)} plus ${h.pct(F.q1_2027.wertschoepfung)} bei Herkunft aus der EU beschlossen; ohne EU-Herkunft würde der Zuschuss im Beispiel mit ${h.eur(65000)} Einkommen auf ${h.eur(apr27.zuschuss)} sinken. Wie sich der Tausch insgesamt rechnet, steht unter ${h.a('heizungstausch-kosten', 'Heizungstausch Kosten')}.</p>`,
  },
  en: {
    slug: 'heat-pump-cost-germany',
    nav: 'Heat pump cost',
    card: 'What a heat pump costs in Germany once the grant and the cost cap are applied, and what it uses each year afterwards.',
    title: 'Heat Pump Cost Germany 2026: Price, Grant and Running Costs',
    description: `Heat pump cost in Germany 2026: KfW’s own examples as reference points, your share after a ${EN.pct(F.grund)} to ${EN.pct(F.deckel_niedrig)} grant on up to ${EN.eur(H)}, and the yearly power bill.`,
    h1: 'Heat pump cost in Germany: purchase, own share and running costs in 2026',
    intro: 'There is no official price list for heat pumps. This page takes the examples KfW publishes as reference points and works out what is left after the grant and in running costs.',
    resume: `No German authority publishes what a heat pump costs: there is no official price statistic for purchase and installation. The only official reference points are the worked examples of KfW, the federal promotional bank. Its press release of 8 July 2026 uses ${EN.eur(32000)} for a single-family house; its product page uses ${EN.eur(41000)} for a ground-source heat pump with solar thermal in a two-family house and ${EN.eur(20000)} for a split unit in a flat. Of any quote, at most ${EN.eur(H)} for the first home is eligible when you apply by 31 January 2027, so ${EN.eur(ueber)} of a ${EN.eur(32000)} quote gets no grant. If the heat pump replaces a 22-year-old gas boiler, KfW pays an owner-occupier household with ${EN.eur(65000)} taxable income ${EN.eur(mitte.zuschuss)}, leaving ${EN.eur(mitte.eigenanteil)} to pay. On ${EN.eur(28000)} income the own share falls to ${EN.eur(z28.eigenanteil)}. To run it, a 130 m² class E house in Baden-Württemberg needs about ${EN.num(wp.menge)} kWh of electricity: ${EN.eur(wp.kosten)} a year, against ${EN.eur(gas.kosten)} with gas.`,
    faqs: [
      { q: 'Why does this page give no typical price range for a heat pump?', a: `Because no official source exists. Neither the statistics office Destatis nor KfW or BAFA publish average prices for purchase and installation. The ranges quoted online do not come from official surveys and are hard to check. Only your own quote and the examples KfW itself calculates with are reliable. Get several quotes, ideally itemised, and compare what each one includes.` },
      { q: 'Is the part of my quote above the cost cap funded too?', a: `No. KfW only applies the grant to eligible costs up to ${EN.eur(H)} for the first home, or ${EN.eur(hoechstbetrag('2027-02-01', 1))} if you apply from 1 February 2027. If the heat pump costs ${EN.eur(32000)}, you pay ${EN.eur(ueber)} yourself in any case. For that remainder and your own share, the top-up loan covers up to ${EN.eur(F.kredit.hoechst_je_we)} per home.` },
      { q: 'Is the German tax credit better than the grant for a heat pump?', a: `Rarely. Under section 35c of the Income Tax Act, ${EN.pct(S.jahr1)}, ${EN.pct(S.jahr2)} and ${EN.pct(S.jahr3)} of the cost reduce your income tax over three years, so ${EN.eur(steuer)} on ${EN.eur(32000)}. The basic grant alone already gives ${EN.eur(vermieter.zuschuss)}, paid out at once. You cannot have both for the same work. The credit only helps if you pay German income tax, live in the home yourself and missed the KfW application.` },
      { q: 'Will my own share rise if I apply for the heat pump in 2027?', a: `Usually yes. On 1 February 2027 the cap falls to ${EN.eur(hoechstbetrag('2027-02-01', 1))} and the climate speed bonus to ${EN.pct(F.kgb_stufen[1].satz)}. In the ${EN.eur(65000)} income example the grant drops from ${EN.eur(mitte.zuschuss)} to ${EN.eur(feb27.zuschuss)}. From the first quarter of 2027 a unit not originating in the EU is also set to get only ${EN.pct(F.q1_2027.wp_grund)} basic grant; the start date is still open.` },
      { q: 'Which items on the invoice count as eligible costs?', a: 'Besides the unit itself: installation and commissioning, plus the necessary preparatory and finishing work the guideline calls ancillary measures (Umfeldmaßnahmen), such as removing the old system. Optimising the radiators and pipes with hydraulic balancing, which is mandatory anyway, counts too, as do specialist planning and site supervision. Renting a temporary heater counts too, for up to one year from the application. Second-hand units and self-built systems are excluded. Make sure your quote, which will be in German, lists these items separately.' },
    ],
    body: (h) => `
<h2>No official price, but three reference points</h2>
<p>Search for heat pump prices and you find plenty of ranges, none of them from a public body. Official statistics cover energy prices, not the price of heating systems. KfW does use concrete amounts in its own examples, and those are the only public figures with an official sender. We recalculate them with this site’s engine (${h.src('kfw458', 'KfW product page 458')}, ${h.src('kfwPm', 'press release of 8 July 2026')}).</p>
${h.table(['KfW example', 'Cost', 'Grant', 'Own share'], [
  ['Single-family house, family with a child, income €40,000 (press release)', h.eur(32000), h.eur(pm.zuschuss), h.eur(pm.eigenanteil)],
  ['Two-family house, ground source with solar thermal, oil replaced', h.eur(41000), h.eur(becker.zuschuss), h.eur(41000 - becker.zuschuss)],
  ['Owner-occupied flat, split heat pump instead of storage heaters', h.eur(20000), h.eur(foerster.zuschuss), h.eur(foerster.eigenanteil)],
], 'Applying now, case details as in the KfW examples', ['l', 'r', 'r', 'r'])}
<p>For your house only your quote counts. The three cases show how much the type of building shapes the result, though: in the two-family house the cap rises, in the flat it is shared between the units. The ground-source system is dearer in the example but, according to field measurements, uses less electricity.</p>

<h2>What is left after the grant</h2>
<p>The grant consists of a ${h.pct(F.grund)} basic rate for every owner plus two bonuses for owner-occupiers: the climate speed bonus (Klimageschwindigkeitsbonus), currently ${h.pct(kgb)}, and the income bonus of up to ${h.pct(F.einkommen_stufen[0].bonus)}. The total is capped at ${h.pct(F.deckel_standard)}, or ${h.pct(F.deckel_niedrig)} with income up to ${h.eur(F.deckel_niedrig_zve)} (${h.src('begem2026', 'guideline of 17 August 2026')}). For the same ${h.eur(32000)} quote replacing a 22-year-old gas boiler:</p>
${h.table(['Household', 'Rate', 'Grant', 'You pay'], [
  [`Income ${h.eur(90000)}`, h.pct(z90.satzEigen), h.eur(z90.zuschuss), h.eur(z90.eigenanteil)],
  [`Income ${h.eur(48000)}`, h.pct(z48.satzEigen), h.eur(z48.zuschuss), h.eur(z48.eigenanteil)],
  [`Income ${h.eur(36000)}`, h.pct(z36.satzEigen), h.eur(z36.zuschuss), h.eur(z36.eigenanteil)],
  [`Income ${h.eur(28000)}`, h.pct(z28.satzEigen), h.eur(z28.zuschuss), h.eur(z28.eigenanteil)],
  ['House let to tenants', h.pct(F.grund), h.eur(vermieter.zuschuss), h.eur(vermieter.eigenanteil)],
  ['Gas boiler only 12 years old', h.pct(jung.satzEigen), h.eur(jung.zuschuss), h.eur(jung.eigenanteil)],
], `Eligible at most ${h.eur(H)}, application by 31 January 2027`, ['l', 'r', 'r', 'r'])}
<p>Note the jump between ${h.eur(48000)} and ${h.eur(36000)}: the income bonus grows there from ${h.pct(F.einkommen_stufen[2].bonus)} to ${h.pct(F.einkommen_stufen[1].bonus)}. KfW uses the average taxable income on the German tax assessments for the second and third year before the application (${h.src('merkblatt458', 'information sheet 458')}), and income earned abroad counts. Newcomers without those assessments cannot claim the income bonus, and both bonuses need the house to be your main residence. The young gas boiler gets no bonus because the climate speed bonus only starts at ${F.kgb_mindestalter_gas_biomasse} years. Rates in detail: ${h.a('waermepumpe-foerderung', 'heat pump grant')} and ${h.a('klimageschwindigkeitsbonus', 'climate speed bonus')}.</p>

<h2>The tax credit as an alternative</h2>
<p>If you do not apply for the grant, you can deduct the cost from German income tax under ${h.src('estg35c', 'section 35c of the Income Tax Act')}: ${h.pct(S.jahr1)} in the year the work is finished and in the next, ${h.pct(S.jahr3)} in the third, up to ${h.eur(S.max_gesamt)} per property. On ${h.eur(32000)} that is ${h.eur(steuer)} over three tax years. Only a home you live in yourself qualifies, the house must be more than ${S.objekt_mindestalter} years old, the work finished before 1 January 2030, and the grant rules out the credit for the same work. More under ${h.a('steuerbonus-35c', 'tax credit for heating')}.</p>
<!--mini:steuer35c-->

<h2>What the heat pump costs to run</h2>
<p>A 130 m² class E house in Baden-Württemberg needs about ${h.num(q)} kWh of heat, based on the class midpoint and the local climate. With the SPF that ${h.src('iseWpqs', 'Fraunhofer ISE')} measured in existing buildings, the yearly costs are:</p>
${h.table(['System', 'Cost a year'], [
  [`Air-source heat pump, SPF ${h.num(P.technik.jaz_luft_messung, 1)}`, h.eur(wp.kosten)],
  [`Gas boiler, ${h.num(P.preise.gas_ct, 2)} ct/kWh`, h.eur(gas.kosten)],
  [`Oil boiler, €${h.num(P.preise.oel_eur_100l_12monate, 2)} per 100 litres`, h.eur(oel.kosten)],
], `Gas from Destatis, first half of 2026; heat pump tariff ${h.num(P.preise.wp_strom_getrennt_ct, 2)} ct/kWh`, ['l', 'r'])}
<p>The gap to gas, ${h.eur(gas.kosten - wp.kosten)} a year, is what has to repay the higher purchase price. Gas prices come from the ${h.src('destatisPreise', 'Destatis survey')}. The ${h.a('waermepumpe-rechner', 'heat pump cost calculator')} works it out for your house and state.</p>

<h2>What the quote should cover</h2>
<p>So that the grant does not fail on formalities, the quote has to meet a few conditions. The unit must be on BAFA’s list of eligible heat pumps and be designed for an SPF of at least ${h.num(P.technik.jaz_foerder_min, 1)}. For air-to-water units, the outdoor unit must be at least ${P.technik.wp_laerm_db_unter_eu} dB quieter than the EU limits. Natural refrigerants such as propane are recommended today and required from ${h.date(P.technik.natuerliches_kaeltemittel_pflicht_ab)}. Before you apply, the contract with the installer needs a clause tying it to grant approval; without it, signing counts as starting the project and the grant is lost. After approval you have ${F.bewilligung_monate} months to install. The steps are set out under ${h.a('foerderantrag', 'heating grant application')}.</p>

<h2>Financing, and outdated figures online</h2>
<p>For your own share there is the ${h.a('ergaenzungskredit', 'top-up loan')} of up to ${h.eur(F.kredit.hoechst_je_we)} per home, with a reduced rate for households up to ${h.eur(F.kredit.zinsverbilligung_zve_bis)} income. Be wary of cost calculators, English ones included, that still apply a ${h.pct(F.alt.kgb)} climate bonus, a ${h.pct(F.alt.effizienz)} efficiency bonus or a ${h.eur(F.alt.hoechst_erste_we)} cap: that is the position for applications up to 20 July 2026. Treating ${h.pct(F.deckel_standard)} as the absolute ceiling is wrong too, since it is ${h.pct(F.deckel_niedrig)} on a low income. For applications from the first quarter of 2027, a ${h.pct(F.q1_2027.wp_grund)} basic grant for heat pumps plus ${h.pct(F.q1_2027.wertschoepfung)} for EU origin has been adopted; without EU origin the grant in the ${h.eur(65000)} example would fall to ${h.eur(apr27.zuschuss)}. The full picture of a replacement is under ${h.a('heizungstausch-kosten', 'cost of replacing your heating')}.</p>`,
  },
});

import { defineGuide } from '../../lib/guide-types';
import { foerderung, hoechstbetrag, type FoerderEingabe } from '../../lib/engine/foerderung';
import { P, DE, EN } from '../../lib/fmt';

/** Wärmepumpe Förderung: drei Haushalte (Einkommen 90.000 €, 45.000 €, Familie 40.000 €), dazu der Fall ab 2027. */
const F = P.foerderung;
const heute = P.retrieved_at;
const b: FoerderEingabe = { antrag: heute, gebaeude: 'efh', einheiten: 1, kosten: 30000, selbstnutzer: true, alt: 'gas', altJahre: 22, neu: 'wp', wpEU: true, zve: 90000, kind: false };
const hoch = foerderung(b);
const mittel = foerderung({ ...b, zve: 45000 });
const familie = foerderung({ ...b, zve: 40000, kind: true });
const jung = foerderung({ ...b, altJahre: 12 });
const april27eu = foerderung({ ...b, antrag: '2027-04-01' });
const april27 = foerderung({ ...b, antrag: '2027-04-01', wpEU: false });
const H = hoechstbetrag(heute, 1);
const kgb = F.kgb_stufen[0].satz;

export default defineGuide({
  id: 'waermepumpe-foerderung',
  group: 'foerderung',
  order: 10,
  tool: 'foerderung',
  toolPreset: { neu: 'wp' },
  related: ['kfw-458', 'waermepumpe-kosten', 'klimageschwindigkeitsbonus', 'einkommensbonus', 'waermepumpe-rechner', 'foerderantrag'],
  sources: ['kfw458', 'merkblatt458', 'begem2026', 'bmweFaq', 'kfwPm'],
  de: {
    slug: 'waermepumpe-foerderung',
    nav: 'Wärmepumpe Förderung',
    card: 'Zuschuss für die Wärmepumpe nach Antragsdatum, alter Heizung und Einkommen, mit Eigenanteil.',
    title: 'Wärmepumpe Förderung 2026: Zuschuss mit Datum und Einkommen',
    description: `Wärmepumpe Förderung 2026: ${DE.pct(F.grund)} Grundförderung, ${DE.pct(kgb)} Klimabonus, Einkommensbonus bis ${DE.pct(F.einkommen_stufen[0].bonus)}, höchstens ${DE.eur(H * F.deckel_niedrig)}. Rechner mit Antragsdatum und Eigenanteil.`,
    h1: 'Wärmepumpe Förderung 2026: Ihr Zuschuss',
    intro: 'Antragsdatum, heutige Heizung, Angebot und Einkommen eingeben: Der Rechner zeigt den Zuschuss für die Wärmepumpe, den Eigenanteil und die Heizkosten danach.',
    resume: `Für eine Wärmepumpe im eigenen Haus zahlt die Förderbank 2026 einen Zuschuss von mindestens ${DE.pct(F.grund)} der förderfähigen Kosten, die für die erste Wohnung bei Antrag bis zum 31. Januar 2027 auf ${DE.eur(H)} begrenzt sind. Wer selbst im Haus wohnt und eine Öl-, Kohle-, Nachtspeicher- oder Gasetagenheizung oder eine mindestens 20 Jahre alte Gas- oder Biomasseheizung ersetzt, bekommt ${DE.pct(kgb)} Klimageschwindigkeitsbonus dazu. Bei einem zu versteuernden Haushaltseinkommen bis ${DE.eur(F.einkommen_stufen[2].bis)} kommt der Einkommensbonus hinzu. Der Gesamtsatz ist auf ${DE.pct(F.deckel_standard)} begrenzt, bis ${DE.eur(F.deckel_niedrig_zve)} Einkommen auf ${DE.pct(F.deckel_niedrig)}. Für eine Wärmepumpe zu 30.000 €, die eine 22 Jahre alte Gasheizung ersetzt, ergibt das bei 90.000 € Einkommen ${DE.eur(hoch.zuschuss)}, bei 45.000 € ${DE.eur(mittel.zuschuss)} und für eine Familie mit 40.000 € und einem Kind ${DE.eur(familie.zuschuss)}. Ist die Gasheizung jünger als 20 Jahre, bleibt es bei ${DE.eur(jung.zuschuss)}.`,
    faqs: [
      { q: 'Wie viel Prozent Förderung gibt es für eine Wärmepumpe?', a: `${DE.pct(F.grund)} für jeden, dazu ${DE.pct(kgb)} für Selbstnutzer, die eine alte fossile Heizung ersetzen, und je nach Einkommen ${DE.pct(F.einkommen_stufen[2].bonus)}, ${DE.pct(F.einkommen_stufen[1].bonus)} oder ${DE.pct(F.einkommen_stufen[0].bonus)}. Die Summe ist auf ${DE.pct(F.deckel_standard)} begrenzt, bei Einkommen bis ${DE.eur(F.deckel_niedrig_zve)} auf ${DE.pct(F.deckel_niedrig)}. Wer vermietet, bekommt nur die Grundförderung.` },
      { q: 'Was ändert sich 2027 an der Förderung der Wärmepumpe?', a: `Am 1. Februar 2027 sinkt der Klimabonus auf ${DE.pct(F.kgb_stufen[1].satz)} und der Höchstbetrag auf ${DE.eur(hoechstbetrag('2027-02-01', 1))}. Ab dem ersten Quartal 2027 soll die Grundförderung für Wärmepumpen ${DE.pct(F.q1_2027.wp_grund)} betragen, plus ${DE.pct(F.q1_2027.wertschoepfung)} bei Herkunft aus der EU; der Starttag fehlt noch. Im Beispiel mit 90.000 € Einkommen wären es ab April 2027 ${DE.eur(april27eu.zuschuss)} mit EU-Gerät und ${DE.eur(april27.zuschuss)} ohne.` },
      { q: 'Welche Wärmepumpen werden gefördert?', a: `Geräte aus der Liste förderfähiger Wärmepumpen des BAFA, die eine Jahresarbeitszahl von mindestens ${DE.num(P.technik.jaz_foerder_min, 1)} erreichen. Luft-Wasser-Wärmepumpen müssen außen mindestens ${P.technik.wp_laerm_db_unter_eu} dB leiser sein als die EU-Grenzwerte. Ab dem 1. Januar 2028 werden nur noch Geräte mit natürlichem Kältemittel wie Propan gefördert. Ein Fachbetrieb muss einbauen und einen hydraulischen Abgleich machen.` },
      { q: 'Bekomme ich die Förderung auch als Vermieter einer Wohnung?', a: `Ja, aber nur die Grundförderung von ${DE.pct(F.grund)}. Klimageschwindigkeits- und Einkommensbonus gibt es nur für die Wohnung, die Sie selbst als Hauptwohnsitz bewohnen. Bei einem Haus mit mehreren Wohnungen steigt der Höchstbetrag um ${DE.eur(F.hoechst_we_2_bis_6)} für jede zweite bis sechste Wohnung. Ziehen Sie den Rechner unter „Weitere Angaben“ auf „Sie wohnen selbst dort: Nein“.` },
    ],
    body: (h) => `
<h2>Was der Rechner prüft</h2>
<p>Zuerst das Datum: Für Anträge bis zum 20. Juli 2026 gilt die alte Richtlinie, ab dem 21. Juli die neue vom 17. August 2026 (${h.src('begem2026', 'Bundesanzeiger')}). Dann die alte Heizung: Nur sie entscheidet, ob der Klimageschwindigkeitsbonus greift. Dann das Einkommen, gemittelt aus den Steuerbescheiden des zweiten und dritten Jahres vor dem Antrag (${h.src('merkblatt458', 'Merkblatt 458')}). Zuletzt der Deckel: ${h.pct(F.deckel_standard)} oder ${h.pct(F.deckel_niedrig)} der förderfähigen Kosten.</p>
${h.table(['Haushalt', 'Satz', 'Zuschuss', 'Eigenanteil'], [['90.000 €, Gas 22 Jahre', h.pct(hoch.satzEigen), h.eur(hoch.zuschuss), h.eur(hoch.eigenanteil)], ['45.000 €, Gas 22 Jahre', h.pct(mittel.satzEigen), h.eur(mittel.zuschuss), h.eur(mittel.eigenanteil)], ['40.000 € mit Kind', h.pct(familie.satzEigen), h.eur(familie.zuschuss), h.eur(familie.eigenanteil)], ['90.000 €, Gas 12 Jahre', h.pct(jung.satzEigen), h.eur(jung.zuschuss), h.eur(jung.eigenanteil)]], 'Wärmepumpe 30.000 €, Antrag jetzt', ['l', 'r', 'r', 'r'])}
<p>Mehr zu den Bausteinen: ${h.a('klimageschwindigkeitsbonus', 'Klimageschwindigkeitsbonus')}, ${h.a('einkommensbonus', 'Einkommensbonus')} und das ganze Programm unter ${h.a('kfw-458', 'KfW 458')}. Wie der Antrag abläuft, steht unter ${h.a('foerderantrag', 'Antrag')}.</p>`,
  },
  en: {
    slug: 'heat-pump-grant-germany',
    nav: 'Heat pump grant',
    card: 'Grant for a heat pump by application date, old system and income, with your own share.',
    title: 'Heat Pump Grant Germany 2026: Calculator by Date and Income',
    description: `Heat pump grant in Germany 2026: ${EN.pct(F.grund)} basic grant, ${EN.pct(kgb)} climate bonus, income bonus up to ${EN.pct(F.einkommen_stufen[0].bonus)}, at most ${EN.eur(H * F.deckel_niedrig)}. Calculator by application date and own share.`,
    h1: 'Heat pump grant in Germany 2026: your amount',
    intro: 'Enter the application date, your current heating, the quote and your income: the calculator shows the heat pump grant, your own share and the running costs afterwards.',
    resume: `For a heat pump in a home you own in Germany, the federal promotional bank (KfW) pays a grant of at least ${EN.pct(F.grund)} of eligible costs in 2026, capped at ${EN.eur(H)} for the first home when you apply by 31 January 2027. If you live in the house and replace an oil, coal, night storage or gas flat heater, or a gas or biomass boiler at least 20 years old, you get a ${EN.pct(kgb)} climate speed bonus (Klimageschwindigkeitsbonus) on top. With taxable household income up to ${EN.eur(F.einkommen_stufen[2].bis)}, the income bonus is added. The total rate is capped at ${EN.pct(F.deckel_standard)}, or ${EN.pct(F.deckel_niedrig)} for incomes up to ${EN.eur(F.deckel_niedrig_zve)}. For a €30,000 heat pump replacing a 22-year-old gas boiler, that means ${EN.eur(hoch.zuschuss)} at €90,000 income, ${EN.eur(mittel.zuschuss)} at €45,000 and ${EN.eur(familie.zuschuss)} for a family on €40,000 with one child. If the gas boiler is under 20 years old, it stays at ${EN.eur(jung.zuschuss)}.`,
    faqs: [
      { q: 'What percentage of a heat pump does the German grant cover?', a: `${EN.pct(F.grund)} for everyone, plus ${EN.pct(kgb)} for owner-occupiers replacing an old fossil system, plus ${EN.pct(F.einkommen_stufen[2].bonus)}, ${EN.pct(F.einkommen_stufen[1].bonus)} or ${EN.pct(F.einkommen_stufen[0].bonus)} depending on income. The total is capped at ${EN.pct(F.deckel_standard)}, or ${EN.pct(F.deckel_niedrig)} for incomes up to ${EN.eur(F.deckel_niedrig_zve)}. Landlords get the basic grant only.` },
      { q: 'What changes for heat pump funding in 2027?', a: `On 1 February 2027 the climate bonus falls to ${EN.pct(F.kgb_stufen[1].satz)} and the cap to ${EN.eur(hoechstbetrag('2027-02-01', 1))}. From the first quarter of 2027 the basic grant for heat pumps is set to be ${EN.pct(F.q1_2027.wp_grund)}, plus ${EN.pct(F.q1_2027.wertschoepfung)} if made in the EU; the start date is still missing. In the €90,000 example that would give ${EN.eur(april27eu.zuschuss)} from April 2027 with an EU-made unit and ${EN.eur(april27.zuschuss)} without.` },
      { q: 'Which heat pumps qualify for the grant?', a: `Units on BAFA’s list of eligible heat pumps that reach a seasonal performance factor of at least ${EN.num(P.technik.jaz_foerder_min, 1)}. Air-to-water units must be at least ${P.technik.wp_laerm_db_unter_eu} dB quieter outdoors than the EU limits. From 1 January 2028 only units with natural refrigerants such as propane are funded. A registered installer must fit it and carry out hydraulic balancing.` },
      { q: 'Can I get the grant for a flat I let out?', a: `Yes, but only the ${EN.pct(F.grund)} basic grant. The climate speed and income bonuses apply only to the home you live in as your main residence. For a building with several homes, the cap rises by ${EN.eur(F.hoechst_we_2_bis_6)} for each of the second to sixth homes. In the calculator, open “More options” and set “You live there yourself” to No.` },
    ],
    body: (h) => `
<h2>What the calculator checks</h2>
<p>First the date: applications up to 20 July 2026 fall under the old guideline, from 21 July under the new one of 17 August 2026 (${h.src('begem2026', 'Federal Gazette')}). Then the old system: only that decides whether the climate speed bonus applies. Then income, averaged from the tax assessments for the second and third years before you apply (${h.src('merkblatt458', 'information sheet 458')}). If you arrived in Germany recently and have no German assessments for those years, the income bonus cannot be proven. Last the ceiling: ${h.pct(F.deckel_standard)} or ${h.pct(F.deckel_niedrig)} of eligible costs.</p>
${h.table(['Household', 'Rate', 'Grant', 'Own share'], [['€90,000, gas 22 years', h.pct(hoch.satzEigen), h.eur(hoch.zuschuss), h.eur(hoch.eigenanteil)], ['€45,000, gas 22 years', h.pct(mittel.satzEigen), h.eur(mittel.zuschuss), h.eur(mittel.eigenanteil)], ['€40,000 with a child', h.pct(familie.satzEigen), h.eur(familie.zuschuss), h.eur(familie.eigenanteil)], ['€90,000, gas 12 years', h.pct(jung.satzEigen), h.eur(jung.zuschuss), h.eur(jung.eigenanteil)]], 'Heat pump €30,000, applying now', ['l', 'r', 'r', 'r'])}
<p>More on the parts: ${h.a('klimageschwindigkeitsbonus', 'climate speed bonus')}, ${h.a('einkommensbonus', 'income bonus')} and the whole programme under ${h.a('kfw-458', 'KfW 458')}. How the application works is under ${h.a('foerderantrag', 'application')}.</p>`,
  },
});

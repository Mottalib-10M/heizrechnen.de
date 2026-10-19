import { defineGuide } from '../../lib/guide-types';
import { foerderung, verlauf, hoechstbetrag, type FoerderEingabe } from '../../lib/engine/foerderung';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Klimageschwindigkeitsbonus (Richtlinie BEG EM Nr. 8.4.4, Merkblatt 458 S. 4): welche alte Heizung ihn auslöst,
 * die Stufen bis August 2028 und was Warten kostet. Eigene Beispiele: Ölheizung bei drei Einkommen über alle Stichtage,
 * Gasheizung kurz vor dem 20. Geburtstag, Zweifamilienhaus mit Anteil des Selbstnutzers.
 */
const F = P.foerderung;
const heute = P.retrieved_at;
const stufen = F.kgb_stufen;
const kgb = stufen[0].satz;
const daten = [heute, ...stufen.slice(1).map((s) => s.ab)];
const b: FoerderEingabe = { antrag: heute, gebaeude: 'efh', einheiten: 1, kosten: 30000, selbstnutzer: true, alt: 'oel', altJahre: 34, neu: 'wp', wpEU: true, zve: 80000, kind: false };
const hoch = verlauf(b, daten);
const mittel = verlauf({ ...b, zve: 35000 }, daten);
const niedrig = verlauf({ ...b, zve: 25000 }, daten);
const gas19 = foerderung({ ...b, alt: 'gas', altJahre: 19 });
const gas20 = foerderung({ ...b, alt: 'gas', altJahre: 20 });
const gas20Feb = foerderung({ ...b, alt: 'gas', altJahre: 20, antrag: stufen[1].ab });
const zfh = foerderung({ ...b, gebaeude: 'mfh', einheiten: 2, kosten: 46000 });
const vermieter = foerderung({ ...b, selbstnutzer: false });
const verlust = hoch[0].zuschuss - hoch[1].zuschuss;

export default defineGuide({
  id: 'klimageschwindigkeitsbonus',
  group: 'foerderung',
  order: 108,
  mini: 'warten',
  miniHref: 'waermepumpe-foerderung',
  related: ['kfw-458', 'waermepumpe-foerderung', 'einkommensbonus', 'foerderantrag', 'oelheizung-verbot', 'gasheizung-verbot'],
  sources: ['begem2026', 'merkblatt458', 'kfw458', 'bmweFaq', 'kfwPm'],
  de: {
    slug: 'klimageschwindigkeitsbonus',
    nav: 'Klimageschwindigkeitsbonus',
    card: 'Welche alte Heizung den Bonus auslöst, wie er bis August 2028 ganz ausläuft und was ein späterer Antrag kostet.',
    title: 'Klimageschwindigkeitsbonus 2026: Stufen und Bedingungen',
    description: `Klimageschwindigkeitsbonus 2026: ${DE.pct(kgb)} bis 31.01.2027, dann ${DE.pct(stufen[1].satz)}, ${DE.pct(stufen[2].satz)}, ${DE.pct(stufen[3].satz)}. Für Öl, Kohle, Nachtspeicher, Gasetage, Gas ab 20 Jahren. Was Warten kostet.`,
    h1: 'Klimageschwindigkeitsbonus: welche Heizung ihn auslöst und wie lange noch',
    intro: 'Der Bonus belohnt den frühen Abschied von Öl, Kohle und alten Gaskesseln und wird jedes halbe Jahr kleiner. Entscheidend sind die alte Heizung und der Tag, an dem Ihr Antrag eingeht.',
    resume: `Der Klimageschwindigkeitsbonus ist ein Aufschlag auf die Heizungsförderung 458 für Eigentümer, die selbst im Haus wohnen und eine funktionierende Öl-, Kohle-, Nachtspeicher- oder Gasetagenheizung beliebigen Alters ersetzen, oder eine Gas- oder Biomasseheizung, deren Inbetriebnahme beim Antrag mindestens ${F.kgb_mindestalter_gas_biomasse} Jahre zurückliegt. Er beträgt ${DE.pct(kgb)} für Anträge bis zum 31. Januar 2027, ${DE.pct(stufen[1].satz)} ab dem 1. Februar 2027, ${DE.pct(stufen[2].satz)} ab dem 1. August 2027 und ${DE.pct(stufen[3].satz)} ab dem 1. Februar 2028. Für Anträge ab dem 1. August 2028 entfällt er. Abgeschafft ist er also nicht, und die früheren ${DE.pct(F.alt.kgb)} gelten nur für Anträge bis zum 20. Juli 2026. Beispiel: Ein Haushalt mit ${DE.eur(80000)} Einkommen ersetzt seine Ölheizung durch eine Wärmepumpe zu ${DE.eur(30000)}. Bei Antrag jetzt bekommt er ${DE.eur(hoch[0].zuschuss)}, ab Februar 2027 ${DE.eur(hoch[1].zuschuss)} und ab August 2028 nur noch ${DE.eur(hoch[4].zuschuss)}, weil zugleich der Höchstbetrag sinkt.`,
    faqs: [
      { q: 'Wie wird das Alter der Gasheizung für den Bonus gezählt?', a: `Vom Datum der Inbetriebnahme bis zum Tag, an dem Ihr Antrag bei der KfW eingeht. Es müssen mindestens ${F.kgb_mindestalter_gas_biomasse} Jahre sein. Das Baujahr auf dem Typenschild oder das Kaufdatum zählt nicht, wenn das Gerät später in Betrieb ging. Das Alter ist laut KfW „anhand geeigneter Dokumente“ nachzuweisen, also mit Unterlagen, aus denen das Datum der Inbetriebnahme hervorgeht. Für Öl-, Kohle-, Nachtspeicher- und Gasetagenheizungen spielt das Alter keine Rolle.` },
      { q: 'Darf ich die alte Ölheizung als Reserve behalten?', a: 'Nein, nicht wenn Sie den Bonus wollen. Die Richtlinie verlangt, dass die alte Anlage fachgerecht ausgebaut und entsorgt wird. Danach dürfen die versorgten Wohnungen nicht mehr von einer fossilen oder mit Gas betriebenen Heizung im oder am Gebäude beheizt werden. Ausnahmen nennt die Richtlinie nur für Brennstoffzellen und wasserstofffähige Heizungen. Wer einen Kessel als Spitzenlast behalten will, verzichtet auf den Bonus.' },
      { q: 'Wurde der Klimageschwindigkeitsbonus abgeschafft?', a: `Nein. Für Anträge vom 21. Juli 2026 bis zum 31. Januar 2027 beträgt er ${DE.pct(kgb)}, danach sinkt er alle sechs Monate um ${DE.pct(stufen[0].satz - stufen[1].satz)}. Erst für Anträge ab dem 1. August 2028 gibt es ihn nicht mehr. Seiten, die noch ${DE.pct(F.alt.kgb)} nennen, beschreiben die Regeln vor dem 21. Juli 2026, Seiten, die ihn für weggefallen erklären, verwechseln ihn wohl mit dem Effizienzbonus.` },
      { q: 'Lohnt es sich zu warten, bis die Gasheizung 20 Jahre alt ist?', a: `Oft ja. Eine Gasheizung mit 19 Jahren bringt im Beispiel nur die Grundförderung, ${DE.eur(gas19.zuschuss)}. Mit 20 Jahren kommt der Bonus dazu, ${DE.eur(gas20.zuschuss)}. Selbst wenn der 20. Jahrestag erst nach dem 31. Januar 2027 liegt, bleiben mit dem kleineren Bonus ${DE.eur(gas20Feb.zuschuss)}. Den Vertrag mit Förderklausel dürfen Sie schon vorher abschließen, den Antrag aber erst ab dem Stichtag stellen.` },
      { q: 'Gibt es den Bonus auch für eine neue Pelletheizung?', a: `Ja. Der Bonus richtet sich nach der Heizung, die ausgebaut wird, nicht nach der neuen. Eine Pellet- oder Hackschnitzelheizung, die eine Ölheizung ersetzt, bekommt ihn genauso wie eine Wärmepumpe. Im Rechenbeispiel der KfW mit Pellets fehlt der Bonus nur, weil die ersetzte Gasheizung erst zehn Jahre alt war. Alle weiteren Bedingungen, also Selbstnutzung, Ausbau und Entsorgung, gelten auch hier.` },
    ],
    body: (h) => `
<h2>Welche alte Heizung den Bonus auslöst</h2>
<p>Die Richtlinie unterscheidet zwei Gruppen. Bei Öl-, Kohle-, Gasetagen- und Nachtstromspeicherheizungen gibt es den Bonus ohne Rücksicht auf das Alter, sofern die Anlage noch funktioniert. Bei zentralen Gasheizungen und bei Biomasseheizungen muss die Inbetriebnahme beim Antrag mindestens ${F.kgb_mindestalter_gas_biomasse} Jahre zurückliegen (${h.src('begem2026', 'Richtlinie BEG EM, Nr. 8.4.4')}). Eine defekte Anlage löst den Bonus nach dem Wortlaut nicht aus, denn verlangt wird der Austausch einer „funktionstüchtigen“ Heizung.</p>
${h.table(['Alte Heizung', 'Bonus', 'Bedingung'], [
  ['Ölheizung', 'ja', 'jedes Alter, funktionstüchtig'],
  ['Kohleheizung, Kohleofen', 'ja', 'jedes Alter, funktionstüchtig'],
  ['Nachtstromspeicher', 'ja', 'jedes Alter, funktionstüchtig'],
  ['Gasetagenheizung', 'ja', 'jedes Alter, funktionstüchtig'],
  ['zentrale Gasheizung', `ab ${F.kgb_mindestalter_gas_biomasse} Jahren`, 'gezählt ab Inbetriebnahme bis zum Antrag'],
  ['Biomasseheizung', `ab ${F.kgb_mindestalter_gas_biomasse} Jahren`, 'gezählt ab Inbetriebnahme bis zum Antrag'],
  ['Wärmepumpe, Fernwärme, keine Heizung', 'nein', 'kein Austausch einer fossilen Anlage'],
], 'Richtlinie Nr. 8.4.4, Produktseite KfW 458', ['l', 'l', 'l'])}
<p>Zwei weitere Pflichten hängen am Bonus. Die alte Anlage muss fachgerecht ausgebaut und entsorgt werden, und danach darf keine fossile oder mit Gas betriebene Heizung die Wohnungen mehr versorgen. Ausgenommen sind nur Brennstoffzellen und wasserstofffähige Heizungen. Ein Ölkessel als Reserve neben der Wärmepumpe kostet den Bonus.</p>

<h2>Nur für Selbstnutzer, nur für die eigene Wohnung</h2>
<p>Den Bonus bekommt, wer Eigentümer ist und beim Antrag mit Hauptwohnsitz in der Wohnung gemeldet ist. Ein Vermieter erhält im selben Haus mit denselben Kosten nur die Grundförderung, ${h.eur(vermieter.zuschuss)} statt ${h.eur(hoch[0].zuschuss)} (${h.a('vermieter', 'Heizungsförderung für Vermieter')}). In einem Haus mit mehreren Wohnungen wird der Bonus nur auf den Anteil der selbst bewohnten Wohnung gerechnet. Ein Zweifamilienhaus mit Ölheizung und ${h.eur(46000)} Kosten erhält ${h.eur(zfh.zuschuss)}: Grundförderung auf das ganze Gebäude, Bonus auf die Hälfte. Belegt wird die Selbstnutzung beim Nachweis mit der Meldebestätigung und dem Grundbuchauszug (${h.src('merkblatt458', 'Merkblatt 458')}).</p>

<h2>Die Stufen bis August 2028</h2>
<p>Maßgeblich ist allein das Datum, an dem der Antrag bei der KfW eingeht. Einbau, Vertrag oder Zusage spielen für den Satz keine Rolle. Gleichzeitig mit dem Bonus sinkt an denselben Tagen der Höchstbetrag der förderfähigen Kosten für die erste Wohnung, jeweils um ${h.eur(F.hoechst_erste_we[0].betrag - F.hoechst_erste_we[1].betrag)}.</p>
${h.table(['Antrag ab', 'Bonus', 'Höchstbetrag', 'Zuschuss bei 80.000 €', 'bei 35.000 €', 'bei 25.000 €'], daten.map((d, i) => [
  h.date(d), h.pct(stufen[i].satz), h.eur(hoechstbetrag(d, 1)), h.eur(hoch[i].zuschuss), h.eur(mittel[i].zuschuss), h.eur(niedrig[i].zuschuss),
]), 'Einfamilienhaus, Ölheizung ersetzt, Wärmepumpe 30.000 €, zu versteuerndes Einkommen ohne Kind', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>Die Tabelle zeigt, wen die Kürzung am stärksten trifft. Ohne Einkommensbonus fällt der Zuschuss von ${h.eur(hoch[0].zuschuss)} auf ${h.eur(hoch[4].zuschuss)}, das sind ${h.eur(hoch[0].zuschuss - hoch[4].zuschuss)} weniger. Mit ${h.eur(25000)} Einkommen schneidet heute der Deckel von ${h.pct(F.deckel_niedrig)} einen Teil des Bonus ohnehin ab, deshalb verliert dieser Haushalt bis Februar 2027 nur den Effekt des kleineren Höchstbetrags. Wer gut verdient, für den ist der erste Stichtag am 1. Februar 2027 der teuerste: ${h.eur(verlust)} für ein paar Wochen Verzögerung.</p>
<!--mini:einkommen-->

<h2>Die Gasheizung kurz vor dem 20. Jahr</h2>
<p>Ein Sonderfall verdient eine eigene Rechnung. Wer eine zentrale Gasheizung hat, die gerade 19 Jahre läuft, bekommt heute nur die Grundförderung: ${h.eur(gas19.zuschuss)} im Beispielhaus. Ein Jahr später wären es mit Bonus ${h.eur(gas20.zuschuss)}, falls der Antrag noch bis zum 31. Januar 2027 eingeht, und ${h.eur(gas20Feb.zuschuss)} mit dem Satz von ${h.pct(stufen[1].satz)}. Warten lohnt sich hier also, solange die alte Anlage durchhält. Fällt sie vorher aus, ist der Bonus verloren, weil nur funktionstüchtige Anlagen zählen.</p>
<p>Planung, Beratung und sogar der Vertrag mit Förderklausel dürfen vor dem Stichtag liegen. Der Antrag selbst darf erst eingehen, wenn das Jahr voll ist, sonst prüft die KfW das Alter zum falschen Datum. Wie Vertrag und Antrag zusammenhängen, steht unter ${h.a('foerderantrag', 'Heizungsförderung beantragen')}.</p>

<h2>Was der Bonus nicht ist</h2>
<p>Der Klimageschwindigkeitsbonus ist keine Pflicht und keine Strafe. Seit dem 29. Juli 2026 verlangt das Gebäudemodernisierungsgesetz nicht mehr, dass eine neue Heizung zu ${h.pct(P.gesetz.alt_65_prozent)} mit erneuerbarer Energie läuft (${h.a('oelheizung-verbot', 'Ölheizung weiter betreiben')}, ${h.a('gasheizung-verbot', 'neue Gasheizung')}). Der Bonus ist nur der finanzielle Anreiz, früher zu wechseln. Er wurde mit dem Neustart am 21. Juli 2026 von ${h.pct(F.alt.kgb)} auf ${h.pct(kgb)} gesenkt (${h.src('kfwPm', 'Pressemitteilung der KfW')}). Ein anderer Aufschlag ist tatsächlich weggefallen: der ${h.a('effizienzbonus', 'Effizienzbonus')} für Wärmepumpen. Mit dem ${h.a('einkommensbonus', 'Einkommensbonus')} lässt sich der Klimabonus kombinieren, bis der Deckel erreicht ist. Den Betrag für Ihr Haus und Ihr Datum zeigt der ${h.a('waermepumpe-foerderung', 'Förderrechner')}, die Gesamtübersicht ${h.a('kfw-458', 'KfW 458')}.</p>`,
  },
  en: {
    slug: 'climate-speed-bonus',
    nav: 'Climate speed bonus',
    card: 'Which old heating triggers the bonus, how it shrinks every six months until August 2028 and what a later application costs.',
    title: 'Climate Speed Bonus 2026: German Heating Grant Steps',
    description: `Climate speed bonus 2026: ${EN.pct(kgb)} until 31 Jan 2027, then ${EN.pct(stufen[1].satz)}, ${EN.pct(stufen[2].satz)}, ${EN.pct(stufen[3].satz)}. For oil, coal, storage heaters, gas flat units, gas at 20 years. What waiting costs.`,
    h1: 'Climate speed bonus: which heating qualifies and for how much longer',
    intro: 'The bonus rewards an early exit from oil, coal and old gas boilers and shrinks every six months. What matters is the system you remove and the day KfW receives your application.',
    resume: `The climate speed bonus (Klimageschwindigkeitsbonus) is a top-up on the KfW 458 heating grant for owners who live in the property and replace a working oil, coal, night storage or gas flat heater of any age, or a gas or biomass boiler that had been in service for at least ${F.kgb_mindestalter_gas_biomasse} years on the application date. It is ${EN.pct(kgb)} for applications up to 31 January 2027, ${EN.pct(stufen[1].satz)} from 1 February 2027, ${EN.pct(stufen[2].satz)} from 1 August 2027 and ${EN.pct(stufen[3].satz)} from 1 February 2028. Applications from 1 August 2028 get nothing. So it has not been abolished, and the former ${EN.pct(F.alt.kgb)} applies only to applications made by 20 July 2026. Example: a household on ${EN.eur(80000)} replaces its oil boiler with a ${EN.eur(30000)} heat pump. Applying now brings ${EN.eur(hoch[0].zuschuss)}, from February 2027 ${EN.eur(hoch[1].zuschuss)}, and from August 2028 only ${EN.eur(hoch[4].zuschuss)}, because the cost cap falls too.`,
    faqs: [
      { q: 'How is the age of a gas boiler counted for the climate bonus?', a: `From the date it was put into service until the day KfW receives your application, and it must be at least ${F.kgb_mindestalter_gas_biomasse} years. The year of manufacture on the rating plate or the purchase date does not count if the boiler started running later. KfW says the age must be shown “with suitable documents”, meaning papers that state the commissioning date. For oil, coal, night storage and gas flat heaters, age does not matter.` },
      { q: 'Can I keep the old oil boiler as a backup?', a: 'Not if you want the bonus. The guideline requires the old system to be removed and disposed of properly. After that, the homes it served may no longer be heated by any fossil or gas-fired system in or next to the building. The only exceptions named are fuel cells and hydrogen-ready heating. Keeping a boiler for cold spells next to the heat pump means giving up the bonus.' },
      { q: 'Has the climate speed bonus been scrapped?', a: `No. For applications from 21 July 2026 to 31 January 2027 it is ${EN.pct(kgb)}, and it then falls by ${EN.pct(stufen[0].satz - stufen[1].satz)} every six months. Only applications from 1 August 2028 receive nothing. English pages still quoting ${EN.pct(F.alt.kgb)} describe the rules before 21 July 2026; pages saying it is gone are probably mixing it up with the efficiency bonus.` },
      { q: 'I am buying a house with a 22-year-old gas boiler: will I get the bonus?', a: 'Possibly, but only once you own it and live there. The bonus requires you to be entered in the land register (Grundbuch) and registered at the address as your main residence on the day KfW receives the application. Apply after completion and after moving in, before work starts. The age of the boiler is counted on that same day, so a 22-year-old boiler qualifies as long as it still works.' },
      { q: 'Should I wait until my gas boiler turns 20?', a: `Often yes. In our example a 19-year-old gas boiler brings only the basic grant, ${EN.eur(gas19.zuschuss)}. At 20 years the bonus is added: ${EN.eur(gas20.zuschuss)}. Even if the 20th anniversary falls after 31 January 2027, the smaller bonus still leaves ${EN.eur(gas20Feb.zuschuss)}. You may sign a contract with a grant clause beforehand, but the application must arrive on or after the anniversary.` },
    ],
    body: (h) => `
<h2>Which old system triggers the bonus</h2>
<p>The guideline sets up two groups. Oil, coal, gas flat heaters (Gasetagenheizung) and night storage heaters qualify whatever their age, as long as they still work. Central gas boilers and biomass boilers must have been in service for at least ${F.kgb_mindestalter_gas_biomasse} years on the application date (${h.src('begem2026', 'BEG EM guideline, no. 8.4.4')}). A broken system does not qualify on the wording, because the text requires the replacement of a “working” heating system.</p>
${h.table(['Old system', 'Bonus', 'Condition'], [
  ['Oil boiler', 'yes', 'any age, in working order'],
  ['Coal boiler or stove', 'yes', 'any age, in working order'],
  ['Night storage heaters', 'yes', 'any age, in working order'],
  ['Gas heater per flat', 'yes', 'any age, in working order'],
  ['Central gas boiler', `from ${F.kgb_mindestalter_gas_biomasse} years`, 'counted from commissioning to the application'],
  ['Biomass boiler', `from ${F.kgb_mindestalter_gas_biomasse} years`, 'counted from commissioning to the application'],
  ['Heat pump, district heating, no heating', 'no', 'no fossil system replaced'],
], 'Guideline no. 8.4.4, KfW 458 product page', ['l', 'l', 'l'])}
<p>Two further duties come with the bonus. The old system must be removed and disposed of by a professional, and afterwards no fossil or gas-fired heating may supply the homes. The only exceptions are fuel cells and hydrogen-ready heating. An oil boiler kept as a backup next to the heat pump costs you the bonus.</p>

<h2>Owner-occupiers only, own home only</h2>
<p>You get the bonus if you own the property and are registered there as your main residence when KfW receives the application. A landlord with the same house and costs gets the basic grant only: ${h.eur(vermieter.zuschuss)} instead of ${h.eur(hoch[0].zuschuss)} (${h.a('vermieter', 'grants for landlords')}). In a building with several homes, the bonus is calculated only on the share of the home you live in. A two-family house with an oil boiler and ${h.eur(46000)} of costs receives ${h.eur(zfh.zuschuss)}: basic grant on the whole building, bonus on half. You prove owner-occupation with your registration certificate (Meldebestätigung) and land register extract when submitting evidence (${h.src('merkblatt458', 'information sheet 458')}). A German home you use only on visits, while your main residence is abroad, does not qualify.</p>

<h2>The steps until August 2028</h2>
<p>Only the date on which KfW receives the application matters. Installation, contract or approval dates do not change the rate. On the same dates the cap on eligible costs for the first home also falls, by ${h.eur(F.hoechst_erste_we[0].betrag - F.hoechst_erste_we[1].betrag)} each time.</p>
${h.table(['Application from', 'Bonus', 'Cost cap', 'Grant at €80,000', 'at €35,000', 'at €25,000'], daten.map((d, i) => [
  h.date(d), h.pct(stufen[i].satz), h.eur(hoechstbetrag(d, 1)), h.eur(hoch[i].zuschuss), h.eur(mittel[i].zuschuss), h.eur(niedrig[i].zuschuss),
]), 'Single-family house, oil boiler replaced, €30,000 heat pump, taxable income without children', ['l', 'r', 'r', 'r', 'r', 'r'])}
<p>The table shows who is hit hardest. Without the income bonus the grant drops from ${h.eur(hoch[0].zuschuss)} to ${h.eur(hoch[4].zuschuss)}, a loss of ${h.eur(hoch[0].zuschuss - hoch[4].zuschuss)}. On ${h.eur(25000)} the ${h.pct(F.deckel_niedrig)} ceiling already trims part of the bonus today, so until February 2027 that household only loses the effect of the lower cost cap. For higher earners the first cut-off on 1 February 2027 is the most expensive: ${h.eur(verlust)} for a few weeks of delay.</p>
<!--mini:einkommen-->

<h2>A gas boiler just short of 20 years</h2>
<p>One case deserves its own calculation. A central gas boiler that has run for 19 years earns only the basic grant today: ${h.eur(gas19.zuschuss)} in our example house. A year later it would be ${h.eur(gas20.zuschuss)} with the bonus, if the application still arrives by 31 January 2027, or ${h.eur(gas20Feb.zuschuss)} at the ${h.pct(stufen[1].satz)} rate. Waiting pays here, as long as the old boiler holds out. If it fails first, the bonus is lost, because only working systems count.</p>
<p>Planning, advice and even the contract with a grant clause may come before the anniversary. The application itself must arrive once the year is complete, otherwise KfW checks the age on the wrong date. How contract and application fit together is explained under ${h.a('foerderantrag', 'how to apply')}.</p>

<h2>What the bonus is not</h2>
<p>The climate speed bonus is neither an obligation nor a penalty. Since 29 July 2026 the Building Modernisation Act no longer requires a new heating system to run on ${h.pct(P.gesetz.alt_65_prozent)} renewable energy (${h.a('oelheizung-verbot', 'keeping an oil boiler')}, ${h.a('gasheizung-verbot', 'installing a new gas boiler')}). The bonus is simply the financial incentive to switch earlier. It was cut from ${h.pct(F.alt.kgb)} to ${h.pct(kgb)} at the relaunch on 21 July 2026 (${h.src('kfwPm', 'KfW press release')}). Another top-up really has disappeared: the ${h.a('effizienzbonus', 'efficiency bonus')} for heat pumps. The climate bonus combines with the ${h.a('einkommensbonus', 'income bonus')} until the ceiling is reached. The ${h.a('waermepumpe-foerderung', 'grant calculator')} shows the amount for your house and date, and ${h.a('kfw-458', 'KfW 458')} gives the full picture.</p>`,
  },
});

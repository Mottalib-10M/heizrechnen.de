import { defineGuide } from '../../lib/guide-types';
import { nutzwaerme, laufend, STANDARDPREISE, type Klasse } from '../../lib/engine/heizkosten';
import { gasHiHs } from '../../lib/engine/co2';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Wärmepumpe Stromverbrauch: kWh Strom im Jahr = Nutzwärme ÷ Jahresarbeitszahl (Feldwerte Fraunhofer ISE).
 * Beispielhaus = Startwerte des Rechners: 140 m², Klasse D, Bayern. Dazu ein Haus mit 20.000 kWh Gas laut Rechnung.
 */
const T = P.technik;
const q = nutzwaerme({ flaeche: 140, klasse: 'D', land: 'Bayern' });
const luft = laufend('wp_luft', q)!;
const sole = laufend('wp_sole', q)!;
const luftMin = laufend('wp_luft', q, STANDARDPREISE, { jaz: T.jaz_luft_min })!;
const luftMax = laufend('wp_luft', q, STANDARDPREISE, { jaz: T.jaz_luft_max })!;
const soleMin = laufend('wp_sole', q, STANDARDPREISE, { jaz: T.jaz_sole_min })!;
const soleMax = laufend('wp_sole', q, STANDARDPREISE, { jaz: T.jaz_sole_max })!;
const jeM2 = luft.menge / 140;
const gasKwh = 20000;
const qGas = nutzwaerme({ verbrauch: gasKwh, heute: 'gas', land: 'Bayern' });
const ausGas = laufend('wp_luft', qGas)!;
const warmwasser = luft.menge * T.anteil_warmwasser;
const KL: Klasse[] = ['B', 'C', 'D', 'E', 'F', 'G'];
const proKlasse = KL.map((k) => {
  const w = nutzwaerme({ flaeche: 140, klasse: k, land: 'Bayern' });
  return { k, w, luft: laufend('wp_luft', w)!, sole: laufend('wp_sole', w)! };
});

export default defineGuide({
  id: 'waermepumpe-stromverbrauch',
  group: 'kosten',
  order: 103,
  tool: 'wpstrom',
  related: ['waermepumpe-rechner', 'strompreis-waermepumpe', 'waermepumpentarif', 'gebaeudeenergiegesetz', 'waermepumpe-kosten'],
  sources: ['iseWpqs', 'dwd', 'gmodgAnlage10', 'bnetza', 'heizkostenv9'],
  de: {
    slug: 'waermepumpe-stromverbrauch',
    nav: 'Wärmepumpe Stromverbrauch',
    card: 'Wie viele kWh Strom die Wärmepumpe im Jahr braucht: aus Wohnfläche, Effizienzklasse oder Ihrem Gasverbrauch.',
    title: 'Wärmepumpe Stromverbrauch 2026: kWh im Jahr je Haus und JAZ',
    description: `Wärmepumpe Stromverbrauch 2026: Wärmebedarf geteilt durch die Jahresarbeitszahl, gemessen im Altbau ${DE.num(T.jaz_luft_messung, 1)} (Luft) und ${DE.num(T.jaz_sole_messung, 1)} (Erde). Mit Bundesland und Gasrechnung.`,
    h1: 'Wärmepumpe Stromverbrauch: wie viele kWh Ihr Haus im Jahr braucht',
    intro: 'Wohnfläche und Effizienzklasse oder den Gasverbrauch eingeben: Der Rechner teilt den Wärmebedarf durch die gemessene Jahresarbeitszahl und zeigt die kWh Strom im Jahr.',
    resume: `Der Stromverbrauch einer Wärmepumpe ist der Wärmebedarf des Hauses geteilt durch ihre Jahresarbeitszahl (JAZ). Die JAZ sagt, wie viele kWh Wärme die Anlage im Jahresmittel aus einer kWh Strom macht. Das Fraunhofer ISE hat sie in bewohnten Bestandsgebäuden gemessen: Luft-Wasser-Wärmepumpen kamen im Mittel auf ${DE.num(T.jaz_luft_messung, 1)}, Erdwärmepumpen mit Sonde auf ${DE.num(T.jaz_sole_messung, 1)}. Ein Haus mit 140 m² in Klasse D in Bayern braucht nach der Klassenmitte und dem bayerischen Klima rund ${DE.num(q)} kWh Wärme im Jahr. Eine Luft-Wärmepumpe verbraucht dafür ${DE.num(luft.menge)} kWh Strom, also etwa ${DE.num(jeM2)} kWh je m² Wohnfläche, eine Erdwärmepumpe ${DE.num(sole.menge)} kWh. Je nach Anlage lag die gemessene JAZ bei Luft zwischen ${DE.num(T.jaz_luft_min, 1)} und ${DE.num(T.jaz_luft_max, 1)}; im selben Haus heißt das ${DE.num(luftMax.menge)} bis ${DE.num(luftMin.menge)} kWh. Wer heute mit Gas heizt, kann statt Fläche und Klasse den Verbrauch laut Rechnung eingeben: Aus ${DE.num(gasKwh)} kWh Gas werden rund ${DE.num(ausGas.menge)} kWh Wärmepumpenstrom.`,
    faqs: [
      { q: 'Wie rechne ich den Stromverbrauch der Wärmepumpe aus meiner Gasrechnung aus?', a: `Die kWh auf der Gasrechnung sind Brennwert-kWh. Der Rechner zieht davon den Teil ab, der im Kessel nicht als Wärme ankommt: Faktor ${DE.num(gasHiHs, 3)} für Brennwert zu Heizwert und ein Nutzungsgrad von ${DE.pct(P.annahmen.nutzungsgrad_kessel, 1)}. Aus ${DE.num(gasKwh)} kWh Gas werden so ${DE.num(qGas)} kWh Wärme, geteilt durch JAZ ${DE.num(T.jaz_luft_messung, 1)} also ${DE.num(ausGas.menge)} kWh Strom.` },
      { q: 'Braucht eine Erdwärmepumpe wirklich weniger Strom als eine Luft-Wärmepumpe?', a: `Im Mittel ja, weil das Erdreich im Winter wärmer ist als die Außenluft. In der Messung des Fraunhofer ISE lag die JAZ der Erdwärmepumpen bei ${DE.num(T.jaz_sole_messung, 1)}, die der Luft-Wasser-Geräte bei ${DE.num(T.jaz_luft_messung, 1)}. Im bayerischen Beispielhaus spart das ${DE.num(luft.menge - sole.menge)} kWh im Jahr. Die Spannen überlappen sich allerdings: Eine gute Luft-Wärmepumpe kann eine schwache Erdwärmepumpe schlagen.` },
      { q: 'Steckt das Warmwasser im berechneten Stromverbrauch?', a: `Ja. Der Rechner setzt den Anteil des Warmwassers an der Wärme nach den Werten des Fraunhofer ISE mit rund ${DE.pct(T.anteil_warmwasser)} an. Im Beispielhaus entfallen damit etwa ${DE.num(warmwasser)} kWh des Stroms auf Dusche und Küche. Dieser Teil hängt nicht vom Klima ab und bleibt in jedem Bundesland gleich; nur die Raumwärme wird mit der Gradtagzahl angepasst.` },
      { q: 'Warum braucht dasselbe Haus in Thüringen mehr Strom als in Hessen?', a: `Weil der Deutsche Wetterdienst dort mehr Gradtage misst: Im Mittel 2021 bis 2025 waren es in Thüringen ${DE.num(P.klima.laender.find((l) => l.land === 'Thüringen')!.gt)}, in Hessen ${DE.num(P.klima.laender.find((l) => l.land === 'Hessen')!.gt)}. Gradtage sind ein Maß dafür, wie kalt und wie lang die Heizzeit ist. Der Rechner skaliert die Raumwärme mit diesem Verhältnis, das Warmwasser nicht. Die Werte stammen von Stationen in Städten, auf dem Land und in Höhenlagen ist es oft kälter.` },
    ],
    body: (h) => `
<h2>Die Formel hinter dem Stromverbrauch</h2>
<p>Stromverbrauch gleich Wärmebedarf geteilt durch Jahresarbeitszahl: mehr steckt nicht dahinter. Schwierig sind nur die beiden Eingangswerte. Den Wärmebedarf schätzt der Rechner aus der Effizienzklasse des Energieausweises nach ${h.src('gmodgAnlage10', 'Anlage 10 GModG')}. Jede Klasse hat eine Spanne, der Rechner nimmt deren Mitte als Annahme und rechnet mit dem Klima Ihres Landes nach den Gradtagzahlen des ${h.src('dwd', 'Deutschen Wetterdienstes')}. Die JAZ stammt aus dem Feldtest ${h.src('iseWpqs', 'WP-QS im Bestand des Fraunhofer ISE')}, gemessen vor allem 2024 an 49 Luft-Wasser- und 13 Erdwärmeanlagen. Der Wert gilt für das Gerät selbst; mit Pufferspeicher und Heizstab liegt die Systemzahl etwas darunter.</p>

<h2>Stromverbrauch nach Effizienzklasse</h2>
<p>Für ein Haus mit 140 m² in Bayern, mit den gemessenen Mittelwerten der JAZ:</p>
${h.table(['Klasse', 'Wärme im Jahr', 'Luft-Wärmepumpe', 'Erdwärmepumpe'], proKlasse.map((x) => [x.k, `${h.num(x.w)} kWh`, `${h.num(x.luft.menge)} kWh`, `${h.num(x.sole.menge)} kWh`]), `JAZ ${h.num(T.jaz_luft_messung, 1)} (Luft) und ${h.num(T.jaz_sole_messung, 1)} (Erde), Klassenmitte als Annahme`, ['l', 'r', 'r', 'r'])}
<p>Zwischen Klasse B und Klasse G wächst der Strombedarf auf mehr als das Dreifache. Wer seinen Energiekennwert kennt, findet die Klasse mit dem kleinen Rechner hier:</p>
<!--mini:klasse-->

<h2>Die Spanne der Messung</h2>
<p>Der Mittelwert verdeckt, wie unterschiedlich gleiche Geräte laufen. Bei Luft-Wasser lag die JAZ zwischen ${h.num(T.jaz_luft_min, 1)} und ${h.num(T.jaz_luft_max, 1)}, bei Erdwärme zwischen ${h.num(T.jaz_sole_min, 1)} und ${h.num(T.jaz_sole_max, 1)}. Im Beispielhaus der Klasse D sind das ${h.num(luftMax.menge)} bis ${h.num(luftMin.menge)} kWh für die Luft-Wärmepumpe und ${h.num(soleMax.menge)} bis ${h.num(soleMin.menge)} kWh für die Erdwärmepumpe. Die Förderung verlangt eine Auslegung auf mindestens JAZ ${h.num(T.jaz_foerder_min, 1)}. Ändern Sie im Rechner die JAZ, wenn Ihr Fachbetrieb einen eigenen Wert berechnet hat.</p>

<h2>Vom Verbrauch zu den Kosten</h2>
<p>Den Verbrauch multipliziert der Rechner mit dem Tarif aus dem ${h.src('bnetza', 'Monitoringbericht der Bundesnetzagentur')}: ${h.num(P.preise.wp_strom_getrennt_ct, 2)} ct je kWh mit eigenem Zähler, ${h.num(P.preise.wp_strom_gemeinsam_ct, 2)} ct mit gemeinsamem Zähler. Für das Beispielhaus mit Luft-Wärmepumpe sind das ${h.eur(luft.kosten)} im Jahr. Welcher Tarif passt, steht unter ${h.a('waermepumpentarif', 'Wärmepumpentarif')} und ${h.a('strompreis-waermepumpe', 'Strompreis Wärmepumpe')}. Den Vergleich mit Ihrer heutigen Heizung zeigt der ${h.a('waermepumpe-rechner', 'Wärmepumpe Rechner')}, die Effizienzklassen im Gesetz erklärt ${h.a('gebaeudeenergiegesetz', 'Gebäudeenergiegesetz')}.</p>`,
  },
  en: {
    slug: 'heat-pump-electricity-use',
    nav: 'Heat pump electricity use',
    card: 'How many kWh of electricity a heat pump uses a year: from floor area, energy class or your gas bill.',
    title: 'Heat Pump Electricity Use 2026: kWh a Year by House and SPF',
    description: `Heat pump electricity use 2026: heat demand divided by the SPF measured in older German homes, ${EN.num(T.jaz_luft_messung, 1)} for air and ${EN.num(T.jaz_sole_messung, 1)} for ground source. By state or gas bill.`,
    h1: 'Heat pump electricity use: how many kWh your house needs a year',
    intro: 'Enter floor area and energy class, or your gas use: the calculator divides the heat demand by the measured SPF and shows the kWh of electricity a year.',
    resume: `A heat pump’s electricity use is the heat demand of the house divided by its seasonal performance factor (SPF, Jahresarbeitszahl). The SPF tells you how many kWh of heat the system makes from one kWh of electricity over the year. The Fraunhofer ISE institute measured it in occupied existing buildings in Germany: air-to-water heat pumps averaged ${EN.num(T.jaz_luft_messung, 1)}, ground-source units with a borehole ${EN.num(T.jaz_sole_messung, 1)}. A 140 m² house in class D in Bavaria needs about ${EN.num(q)} kWh of heat a year, based on the class midpoint and the Bavarian climate. An air-source heat pump uses ${EN.num(luft.menge)} kWh of electricity for that, roughly ${EN.num(jeM2)} kWh per m² of floor area, and a ground-source unit ${EN.num(sole.menge)} kWh. Measured air-source SPFs ranged from ${EN.num(T.jaz_luft_min, 1)} to ${EN.num(T.jaz_luft_max, 1)}, which in the same house means ${EN.num(luftMax.menge)} to ${EN.num(luftMin.menge)} kWh. If you heat with gas today, enter the figure from your bill instead of area and class: ${EN.num(gasKwh)} kWh of gas becomes about ${EN.num(ausGas.menge)} kWh of heat pump electricity.`,
    faqs: [
      { q: 'How do I turn my German gas bill into heat pump electricity?', a: `The kWh on a German gas bill are gross calorific value kWh. The calculator removes the part that never reaches the rooms as heat: a factor of ${EN.num(gasHiHs, 3)} from gross to net calorific value and a boiler efficiency of ${EN.pct(P.annahmen.nutzungsgrad_kessel, 1)}. So ${EN.num(gasKwh)} kWh of gas gives ${EN.num(qGas)} kWh of heat, which divided by an SPF of ${EN.num(T.jaz_luft_messung, 1)} is ${EN.num(ausGas.menge)} kWh of electricity.` },
      { q: 'Does a ground-source heat pump really use less electricity than an air-source one?', a: `On average yes, because the ground is warmer than the outside air in winter. In the Fraunhofer ISE measurements ground-source units reached an SPF of ${EN.num(T.jaz_sole_messung, 1)}, air-to-water units ${EN.num(T.jaz_luft_messung, 1)}. In the Bavarian example house that saves ${EN.num(luft.menge - sole.menge)} kWh a year. The ranges overlap, though: a good air-source unit can beat a weak ground-source one.` },
      { q: 'Is hot water included in the calculated electricity use?', a: `Yes. Following the Fraunhofer ISE figures, the calculator puts hot water at about ${EN.pct(T.anteil_warmwasser)} of the heat. In the example house that is roughly ${EN.num(warmwasser)} kWh of the electricity, for showers and the kitchen. This share does not depend on the climate and stays the same in every federal state; only space heating is scaled with the degree days.` },
      { q: 'Why does the same house use more electricity in Thuringia than in Hesse?', a: `Because the German weather service records more degree days there: averaged over 2021 to 2025, ${EN.num(P.klima.laender.find((l) => l.land === 'Thüringen')!.gt)} in Thuringia against ${EN.num(P.klima.laender.find((l) => l.land === 'Hessen')!.gt)} in Hesse. Degree days measure how cold and how long the heating season is. The calculator scales space heating by that ratio, not hot water. The values come from city stations; rural and upland areas are often colder.` },
    ],
    body: (h) => `
<h2>The formula behind electricity use</h2>
<p>Electricity use equals heat demand divided by SPF: there is nothing more to it. Only the two inputs are hard. The calculator estimates heat demand from the energy class on your energy certificate (Energieausweis) under ${h.src('gmodgAnlage10', 'annex 10 of the Building Modernisation Act')}. Each class covers a band; the calculator takes its midpoint as an assumption and applies your state’s climate from the degree days of the ${h.src('dwd', 'German weather service')}. The SPF comes from the ${h.src('iseWpqs', 'Fraunhofer ISE field test of heat pumps in existing buildings')}, measured mainly in 2024 on 49 air-to-water and 13 ground-source systems. It describes the unit itself; with buffer tank and backup heater the system figure is somewhat lower. If you are buying a house and have no energy certificate at hand, ask for the previous owner’s gas bills and enter those instead.</p>

<h2>Electricity use by energy class</h2>
<p>For a 140 m² house in Bavaria, using the measured average SPFs:</p>
${h.table(['Class', 'Heat a year', 'Air-source', 'Ground-source'], proKlasse.map((x) => [x.k, `${h.num(x.w)} kWh`, `${h.num(x.luft.menge)} kWh`, `${h.num(x.sole.menge)} kWh`]), `SPF ${h.num(T.jaz_luft_messung, 1)} (air) and ${h.num(T.jaz_sole_messung, 1)} (ground), class midpoint as an assumption`, ['l', 'r', 'r', 'r'])}
<p>From class B to class G the electricity need more than triples. If you know the energy figure on your certificate, the small calculator below finds the class:</p>
<!--mini:klasse-->

<h2>The spread in the measurements</h2>
<p>The average hides how differently identical units perform. Air-to-water SPFs ranged from ${h.num(T.jaz_luft_min, 1)} to ${h.num(T.jaz_luft_max, 1)}, ground source from ${h.num(T.jaz_sole_min, 1)} to ${h.num(T.jaz_sole_max, 1)}. In the class D example house that is ${h.num(luftMax.menge)} to ${h.num(luftMin.menge)} kWh for the air-source unit and ${h.num(soleMax.menge)} to ${h.num(soleMin.menge)} kWh for ground source. The grant requires a design SPF of at least ${h.num(T.jaz_foerder_min, 1)}. Change the SPF in the calculator if your installer has worked out a figure of their own.</p>

<h2>From kWh to euros</h2>
<p>The calculator multiplies use by the tariff from the ${h.src('bnetza', 'Federal Network Agency monitoring report')}: ${h.num(P.preise.wp_strom_getrennt_ct, 2)} ct per kWh with a separate meter, ${h.num(P.preise.wp_strom_gemeinsam_ct, 2)} ct with a shared one. For the example house with an air-source unit that is ${h.eur(luft.kosten)} a year. Which tariff fits is covered under ${h.a('waermepumpentarif', 'heat pump tariff')} and ${h.a('strompreis-waermepumpe', 'heat pump electricity price')}. The comparison with your current heating is in the ${h.a('waermepumpe-rechner', 'heat pump cost calculator')}, the legal energy classes under ${h.a('gebaeudeenergiegesetz', 'Building Energy Act')}.</p>`,
  },
});

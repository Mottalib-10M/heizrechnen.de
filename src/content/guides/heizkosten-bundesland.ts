import { defineGuide } from '../../lib/guide-types';
import { nutzwaerme, laufend, gradtage } from '../../lib/engine/heizkosten';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Heizkosten nach Bundesland: warum das Klima die Rechnung verschiebt und wie stark (Empfindlichkeit je 100 Gradtage).
 * Gradtagzahlen G20/15 des DWD, Mittel 2021 bis 2025 über die genannten Stationen (P.klima). Beispielhaus 140 m², Klasse E.
 * Preise sind bundesweite Durchschnitte (Destatis, Bundesnetzagentur): Unterschiede entstehen hier nur aus dem Klima.
 */
const K = P.klima;
const ww = P.technik.anteil_warmwasser;
const FL = 140;
const kosten = (land: string, klasse: 'C' | 'E' | 'G' = 'E') => {
  const q = nutzwaerme({ flaeche: FL, klasse, land });
  return { q, gas: laufend('gas', q)!.kosten, wp: laufend('wp_luft', q)!.kosten };
};
const rows = K.laender.map((l) => ({ ...l, ...kosten(l.land) })).sort((a, b) => b.gt - a.gt);
const mittelGt = K.laender.reduce((s, l) => s + l.gt, 0) / K.laender.length;
const mittelGas = rows.reduce((s, r) => s + r.gas, 0) / rows.length;
const kalt = rows[0], warm = rows[rows.length - 1];
const th = kosten('Thüringen'), he = kosten('Hessen'), sh = kosten('Schleswig-Holstein'), bw = kosten('Baden-Württemberg');
/** Mehrkosten Gas je 100 Gradtage für das Beispielhaus. */
const je100Gas = ((th.gas - he.gas) / (gradtage('Thüringen') - gradtage('Hessen'))) * 100;
const je100Wp = ((th.wp - he.wp) / (gradtage('Thüringen') - gradtage('Hessen'))) * 100;
const heG = kosten('Hessen', 'G'), thC = kosten('Thüringen', 'C');
const spreizungGt = kalt.gt / warm.gt - 1;
const spreizungGas = kalt.gas / warm.gas - 1;

const EN_NAME: Record<string, string> = { Bayern: 'Bavaria', Hessen: 'Hesse', 'Mecklenburg-Vorpommern': 'Mecklenburg-Western Pomerania', Niedersachsen: 'Lower Saxony', 'Nordrhein-Westfalen': 'North Rhine-Westphalia', 'Rheinland-Pfalz': 'Rhineland-Palatinate', Sachsen: 'Saxony', 'Sachsen-Anhalt': 'Saxony-Anhalt', Thüringen: 'Thuringia' };
const en = (l: string) => EN_NAME[l] ?? l;
const vorz = (x: number, f: (n: number) => string) => (x > 0 ? '+' : x < 0 ? '−' : '') + f(Math.abs(x));

export default defineGuide({
  id: 'heizkosten-bundesland',
  group: 'kosten',
  order: 121,
  mini: 'land',
  miniHref: 'heizkosten-rechner',
  related: ['heizkosten-vergleich', 'heizkosten-rechner', 'waermepumpe-stromverbrauch', 'gebaeudeenergiegesetz', 'gaspreis'],
  sources: ['dwd', 'destatisPreise', 'bnetza', 'gmodgAnlage10', 'iseWpqs'],
  de: {
    slug: 'heizkosten-bundesland',
    nav: 'Heizkosten nach Bundesland',
    card: 'Warum dasselbe Haus in Thüringen mehr Heizkosten hat als in Hessen, und wie viel jedes Grad Klima im Jahr ausmacht.',
    title: 'Heizkosten Bundesland 2026: Wie stark das Klima zählt',
    description: `Heizkosten Bundesland 2026: Gradtagzahlen des DWD für alle 16 Länder, ${DE.eur(je100Gas)} mehr Gaskosten je 100 Gradtage im Beispielhaus. Was das Klima ausmacht, was nicht.`,
    h1: 'Heizkosten nach Bundesland: was das Klima ausmacht',
    intro: 'Die Energiepreise sind bundesweit fast gleich, die Winter nicht. Diese Seite zeigt, wie stark das Klima eines Landes die Heizkosten verschiebt und wo seine Wirkung endet.',
    resume: `Ein Haus braucht in einem kalten Bundesland mehr Wärme als in einem milden, weil die Heizperiode länger und die Außentemperatur niedriger ist. Gemessen wird das mit der Gradtagzahl des Deutschen Wetterdienstes. Im Mittel 2021 bis 2025 reicht sie von ${DE.num(warm.gt)} in ${warm.land} bis ${DE.num(kalt.gt)} in ${kalt.land}, ein Abstand von ${DE.pct(spreizungGt)}. Auf die Heizkosten schlägt das schwächer durch, denn das Warmwasser, rund ${DE.pct(ww)} des Bedarfs, hängt nicht vom Wetter ab. Ein Haus mit ${FL} m² in Effizienzklasse E kostet mit Gas in ${warm.land} ${DE.eur(warm.gas)} im Jahr, in ${kalt.land} ${DE.eur(kalt.gas)}, also ${DE.pct(spreizungGas)} mehr. Mit einer Luft-Wärmepumpe sind es ${DE.eur(warm.wp)} und ${DE.eur(kalt.wp)}. Jede 100 Gradtage mehr kosten dieses Haus rund ${DE.eur(je100Gas)} Gas oder ${DE.eur(je100Wp)} Strom im Jahr. Der Zustand des Hauses wiegt schwerer: Ein unsaniertes Haus der Klasse G in Hessen braucht mehr als doppelt so viel wie ein Haus der Klasse C in Thüringen.`,
    faqs: [
      { q: 'Was misst die Gradtagzahl und wer veröffentlicht sie?', a: `Sie summiert für jeden Heiztag, also jeden Tag unter ${DE.num(15)} Grad Tagesmittel, den Abstand zwischen ${DE.num(20)} Grad Innentemperatur und der Außentemperatur. Ein kalter Wintertag zählt deshalb mehr als ein kühler Oktobertag. Der Deutsche Wetterdienst veröffentlicht die Monatswerte nach VDI 3807 für einzelne Wetterstationen. Einen amtlichen Wert je Bundesland gibt es nicht, diese Seite mittelt deshalb die Stationen der größten Städte.` },
      { q: 'Heizt man an der Ostsee teurer als am Oberrhein?', a: `Ja, spürbar. Schleswig-Holstein kommt auf ${DE.num(gradtage('Schleswig-Holstein'))} Gradtage, Baden-Württemberg auf ${DE.num(gradtage('Baden-Württemberg'))}. Das Beispielhaus mit ${FL} m² zahlt mit Gas im Norden ${DE.eur(sh.gas)}, im Südwesten ${DE.eur(bw.gas)} im Jahr. Der Grund sind die langen, windigen Übergangszeiten an der Küste: Die Winter sind dort nicht extrem kalt, aber die Heizperiode beginnt früher und endet später.` },
      { q: 'Gibt es amtliche Gas- und Strompreise je Bundesland?', a: `Nicht in der Erhebung, die diese Seite nutzt. Das Statistische Bundesamt veröffentlicht für Haushalte bundesweite Durchschnittspreise je Halbjahr, die Bundesnetzagentur ebenso für Heizstrom. Deshalb unterscheiden sich die Ergebnisse hier nur durch das Klima. Ihr eigener Tarif kann je nach Netzgebiet und Anbieter höher oder niedriger liegen. Tragen Sie ihn im Rechner ein, dann rechnet er mit Ihrem Preis statt mit dem Durchschnitt.` },
      { q: 'Spielt das Klima beim Warmwasser eine Rolle?', a: `Im Rechenmodell nicht. Der Warmwasseranteil von rund ${DE.pct(ww)} des Wärmebedarfs, ein Wert aus der Feldmessung des Fraunhofer ISE, bleibt in jedem Land gleich. Nur die Raumwärme wird mit der Gradtagzahl hoch- oder heruntergerechnet. Deshalb ist der Abstand bei den Heizkosten kleiner als der Abstand bei den Gradtagen. Ein Haushalt, der viel duscht, hat in Hessen fast denselben Warmwasserbedarf wie in Sachsen.` },
      { q: 'Zählt das Bundesland mehr als der Zustand des Hauses?', a: `Nein, deutlich weniger. Zwischen dem mildesten und dem kältesten Land liegen im Beispielhaus ${DE.eur(kalt.gas - warm.gas)} Gaskosten im Jahr. Ein unsaniertes Haus der Klasse G mit ${FL} m² in Hessen kostet dagegen ${DE.eur(heG.gas)}, ein Haus der Klasse C in Thüringen nur ${DE.eur(thC.gas)}. Dämmung, Fenster und Heizungstechnik bewegen die Rechnung also viel stärker als der Wohnort.` },
    ],
    body: (h) => `
<h2>Warum dasselbe Haus nicht überall gleich viel kostet</h2>
<p>Heizen ersetzt die Wärme, die durch Wände, Dach und Fenster nach draußen geht. Wie viel das ist, hängt am Temperaturunterschied zwischen innen und außen und daran, wie lange er anhält. Beides fasst die Gradtagzahl zusammen, die der ${h.src('dwd', 'Deutsche Wetterdienst')} nach VDI 3807 für seine Stationen veröffentlicht. Je höher sie ist, desto mehr Wärme braucht ein Haus im Jahr, bei gleicher Bauweise. Die Preise für Gas und Strom unterscheiden sich in den Daten, mit denen diese Seite rechnet, nicht nach Ländern: Das ${h.src('destatisPreise', 'Statistische Bundesamt')} meldet bundesweite Durchschnitte. Jeder Unterschied in der Tabelle unten kommt deshalb allein vom Klima.</p>

<h2>Drei Gründe für kältere Länder</h2>
<p>Erstens die Lage im Osten. Je weiter ein Ort vom Atlantik entfernt ist, desto kälter werden die Winter. Sachsen, Thüringen und Brandenburg liegen deshalb über dem Mittel, obwohl sie nicht weiter nördlich liegen als Hessen. Zweitens die Höhe: Erfurt, Gera und Chemnitz liegen höher als die Städte am Rhein, und mit jedem Höhenmeter sinkt die Temperatur. Drittens die Küste. An Nord- und Ostsee sind die Winter mild, aber Frühjahr und Herbst bleiben lange kühl und windig. Die Heizperiode zieht sich dort, und Schleswig-Holstein landet in der Tabelle weit oben.</p>
<p>Auf der anderen Seite stehen der Oberrheingraben und die Rhein-Main-Region. Frankfurt, Mannheim, Freiburg und die großen Städte an Rhein und Ruhr gehören zu den wärmsten Orten Deutschlands. Hessen, Nordrhein-Westfalen und Baden-Württemberg haben deshalb die niedrigsten Werte, obwohl dort auch kalte Mittelgebirge liegen. Die Messstationen stehen eben in den Städten.</p>

<h2>Alle 16 Länder im Vergleich zum Mittel</h2>
<p>Die Tabelle zeigt die Gradtagzahl jedes Landes, ihren Abstand zum Mittel der 16 Länder von ${h.num(mittelGt)} und was das für die Gasrechnung des Beispielhauses mit ${FL} m² in Klasse E bedeutet, gemessen am Durchschnitt aller Länder von ${h.eur(mittelGas)}.</p>
${h.table(['Land', 'Gradtage', 'zum Mittel', 'Gas im Jahr zum Mittel', 'Stationen'], rows.map((r) => [
  r.land, h.num(r.gt), vorz(r.gt / mittelGt - 1, (x) => h.pct(x)), vorz(r.gas - mittelGas, (x) => h.eur(x)), r.stationen.join(', '),
]), `DWD, Gradtagzahlen G20/15, Mittel ${K.jahre}; Beispielhaus ${FL} m², Klasse E, Gas zum Durchschnittspreis 2026`, ['l', 'r', 'r', 'r', 'l'])}
<p>Zwischen ${warm.land} und ${kalt.land} liegen ${h.pct(spreizungGt)} bei den Gradtagen, bei den Gaskosten aber nur ${h.pct(spreizungGas)}. Der Unterschied erklärt sich durch das Warmwasser: Rund ${h.pct(ww)} des Wärmebedarfs entfallen nach der Feldmessung des ${h.src('iseWpqs', 'Fraunhofer ISE')} darauf, und dieser Teil hängt nicht vom Wetter ab. Der Rechner skaliert deshalb nur die Raumwärme mit dem Klima.</p>

<h2>Wie empfindlich die Rechnung auf das Klima reagiert</h2>
<p>Für das Beispielhaus kosten 100 Gradtage mehr rund ${h.eur(je100Gas)} Gas im Jahr. Mit einer Luft-Wärmepumpe am Wärmepumpentarif der ${h.src('bnetza', 'Bundesnetzagentur')} sind es rund ${h.eur(je100Wp)}, weil jede zusätzliche kWh Wärme dort weniger kostet. Die Wärmepumpe dämpft also nicht nur die Kosten, sondern auch die Abhängigkeit vom Wetter. Ein kalter Winter trifft einen Haushalt mit Gasheizung fast doppelt so hart. Das gilt auch zwischen den Jahren: Fällt ein Winter um einige hundert Gradtage kälter aus als der Schnitt, steigt die Rechnung im gleichen Verhältnis wie zwischen zwei Ländern.</p>
<!--mini:klasse-->

<h2>Der Zustand des Hauses wiegt schwerer</h2>
<p>So deutlich die Unterschiede zwischen den Ländern sind, sie bleiben klein gegenüber dem Einfluss des Gebäudes. Ein unsaniertes Haus der Klasse G mit ${FL} m² in Hessen, dem mildesten Land, zahlt mit Gas ${h.eur(heG.gas)} im Jahr. Ein Haus der Klasse C gleicher Größe in Thüringen, dem kältesten Land, zahlt ${h.eur(thC.gas)}. Die Klassen stammen aus ${h.src('gmodgAnlage10', 'Anlage 10 GModG')}; der Rechner nimmt jeweils die Mitte der Spanne an, was eine Vereinfachung ist. Wer seine Klasse nicht kennt, findet sie im Energieausweis, Erläuterungen dazu unter ${h.a('gebaeudeenergiegesetz', 'Gebäudeenergiegesetz')}.</p>

<h2>Grenzen dieser Werte</h2>
<p>Die Gradtagzahl eines Landes ist hier das Mittel von einer bis vier Stationen in großen Städten. Ländliche Gegenden und Mittelgebirge sind kälter, ein Haus im Erzgebirge oder im Hochsauerland braucht mehr Wärme als die Tabelle für Sachsen oder Nordrhein-Westfalen zeigt. Die Jahre 2021 bis 2025 waren außerdem milder als das langjährige Mittel, und die Monatswerte des Wetterdienstes sind vorläufige Daten. Für die Entscheidung zwischen zwei Heizungen spielt das kaum eine Rolle, weil das Klima beide Systeme gleich trifft. Für die absolute Höhe der Rechnung ist Ihr gemessener Verbrauch der bessere Startwert. Tragen Sie ihn im ${h.a('heizkosten-rechner', 'Heizkosten Rechner')} ein, den Strombedarf einer Wärmepumpe rechnet ${h.a('waermepumpe-stromverbrauch', 'Wärmepumpe Stromverbrauch')}. Den Vergleich aller Heizungen je kWh Wärme zeigt ${h.a('heizkosten-vergleich', 'Heizkosten Vergleich')}, den Gaspreis und seine Bestandteile erklärt ${h.a('gaspreis', 'Gaspreis')}.</p>`,
  },
  en: {
    slug: 'heating-costs-by-state',
    nav: 'Heating costs by state',
    card: 'Why the same German house costs more to heat in Thuringia than in Hesse, and what each step in climate adds a year.',
    title: 'Heating costs by state 2026: how climate moves the bill',
    description: `Heating costs by state 2026: degree days for all 16 German states and ${EN.eur(je100Gas)} more gas a year per 100 degree days. What climate changes and what it does not.`,
    h1: 'Heating costs by German state: what the climate does',
    intro: 'Energy prices are much the same across Germany, winters are not. This page shows how far a state’s climate shifts heating costs and where its effect stops.',
    resume: `A house in a cold German state (Bundesland) needs more heat than in a mild one, because the heating season is longer and outdoor temperatures lower. This is measured with the degree days published by the German Weather Service. Averaged over 2021 to 2025 they range from ${EN.num(warm.gt)} in ${en(warm.land)} to ${EN.num(kalt.gt)} in ${en(kalt.land)}, a gap of ${EN.pct(spreizungGt)}. The effect on heating bills is smaller, because hot water, about ${EN.pct(ww)} of demand, does not depend on the weather. A ${FL} m² house in efficiency class E costs ${EN.eur(warm.gas)} a year with gas in ${en(warm.land)} and ${EN.eur(kalt.gas)} in ${en(kalt.land)}, ${EN.pct(spreizungGas)} more. With an air-source heat pump it is ${EN.eur(warm.wp)} and ${EN.eur(kalt.wp)}. Every extra 100 degree days costs this house about ${EN.eur(je100Gas)} of gas or ${EN.eur(je100Wp)} of electricity a year. The state of the building matters more: an unrenovated class G house in Hesse needs over twice as much as a class C house in Thuringia.`,
    faqs: [
      { q: 'What do degree days measure, and who publishes them in Germany?', a: `For every heating day, meaning a day with a mean below ${EN.num(15)} °C, they add up the gap between ${EN.num(20)} °C indoors and the outdoor temperature. A cold winter day therefore counts for more than a cool October day. The German Weather Service (Deutscher Wetterdienst) publishes monthly values under the VDI 3807 standard for individual weather stations. There is no official figure per state, so this page averages the stations of the largest cities.` },
      { q: 'Is heating dearer on the Baltic coast than in the south-west?', a: `Yes, noticeably. Schleswig-Holstein records ${EN.num(gradtage('Schleswig-Holstein'))} degree days, Baden-Württemberg ${EN.num(gradtage('Baden-Württemberg'))}. The ${FL} m² example house pays ${EN.eur(sh.gas)} a year for gas in the north and ${EN.eur(bw.gas)} in the south-west. The reason is the long, windy spring and autumn on the coast: winters there are not extreme, but the heating season starts earlier and ends later.` },
      { q: 'Are there official gas and electricity prices for each German state?', a: `Not in the survey this page uses. The Federal Statistical Office publishes national household averages every half year, and the Federal Network Agency does the same for heating electricity. That is why results here differ only by climate. Your own tariff can be higher or lower depending on network area and supplier. Enter it in the calculator and it will use your price instead of the average.` },
      { q: 'Does the climate affect hot water demand?', a: `Not in the model. The hot water share of about ${EN.pct(ww)} of heat demand, taken from the Fraunhofer ISE field study, stays the same in every state. Only space heating is scaled up or down by degree days. That is why the gap in heating costs is smaller than the gap in degree days. A household that showers a lot needs nearly as much hot water in Hesse as in Saxony.` },
      { q: 'Does the state matter more than the condition of the house?', a: `No, far less. Between the mildest and the coldest state, the example house differs by ${EN.eur(kalt.gas - warm.gas)} of gas a year. An unrenovated class G house of ${FL} m² in Hesse costs ${EN.eur(heG.gas)}, a class C house in Thuringia only ${EN.eur(thC.gas)}. Insulation, windows and the heating system move the bill much more than the location.` },
    ],
    body: (h) => `
<h2>Why the same house does not cost the same everywhere</h2>
<p>Heating replaces the heat that escapes through walls, roof and windows. How much that is depends on the difference between indoor and outdoor temperature and on how long it lasts. Both are captured by degree days, which the ${h.src('dwd', 'German Weather Service')} publishes for its stations under the VDI 3807 standard. The higher the figure, the more heat a house of the same build needs in a year. In the data this page uses, gas and electricity prices do not differ by state: the ${h.src('destatisPreise', 'Federal Statistical Office')} reports national averages. Every difference in the table below therefore comes from climate alone.</p>

<h2>Three reasons some states are colder</h2>
<p>First, distance from the Atlantic. The further east a place lies, the colder its winters. Saxony, Thuringia and Brandenburg are above the average even though they are no further north than Hesse. Second, altitude: Erfurt, Gera and Chemnitz sit higher than the cities on the Rhine, and temperature falls with height. Third, the coast. Winters by the North Sea and the Baltic are mild, but spring and autumn stay cool and windy for a long time. The heating season drags on, and Schleswig-Holstein ends up near the top of the table. If you are moving from the UK or the Netherlands, northern Germany will feel familiar; the east and the uplands have harder winters.</p>
<p>At the other end are the Upper Rhine valley and the Rhine-Main area. Frankfurt, Mannheim, Freiburg and the big cities along the Rhine and the Ruhr are among the warmest places in Germany. Hesse, North Rhine-Westphalia and Baden-Württemberg therefore have the lowest values, even though they include cold uplands. The weather stations simply stand in the cities.</p>

<h2>All 16 states against the average</h2>
<p>The table shows each state’s degree days, the gap to the 16-state average of ${h.num(mittelGt)} and what that means for the gas bill of the ${FL} m² class E example house, measured against the average of all states, ${h.eur(mittelGas)}.</p>
${h.table(['State', 'Degree days', 'vs average', 'Gas a year vs average', 'Stations'], rows.map((r) => [
  en(r.land), h.num(r.gt), vorz(r.gt / mittelGt - 1, (x) => h.pct(x)), vorz(r.gas - mittelGas, (x) => h.eur(x)), r.stationen.join(', '),
]), `German Weather Service, degree days G20/15, average ${K.jahre}; example house ${FL} m², class E, gas at the 2026 average price`, ['l', 'r', 'r', 'r', 'l'])}
<p>Between ${en(warm.land)} and ${en(kalt.land)} the gap is ${h.pct(spreizungGt)} in degree days but only ${h.pct(spreizungGas)} in gas costs. The difference is hot water: about ${h.pct(ww)} of heat demand goes on it according to the ${h.src('iseWpqs', 'Fraunhofer ISE')} field study, and that part does not depend on the weather. The calculator therefore scales only space heating by climate.</p>

<h2>How sensitive the bill is to climate</h2>
<p>For the example house, 100 extra degree days cost about ${h.eur(je100Gas)} of gas a year. With an air-source heat pump on the heat pump tariff reported by the ${h.src('bnetza', 'Federal Network Agency')} it is about ${h.eur(je100Wp)}, because each extra kWh of heat costs less. A heat pump therefore lowers not just the bill but also its dependence on the weather. A cold winter hits a gas-heated household almost twice as hard. The same applies from year to year: if a winter turns out a few hundred degree days colder than average, the bill rises in the same proportion as between two states.</p>
<!--mini:klasse-->

<h2>The building matters more</h2>
<p>Clear as the differences between states are, they are small next to the effect of the building. An unrenovated class G house of ${FL} m² in Hesse, the mildest state, pays ${h.eur(heG.gas)} a year for gas. A class C house of the same size in Thuringia, the coldest, pays ${h.eur(thC.gas)}. The classes come from ${h.src('gmodgAnlage10', 'Annex 10 of the Building Modernisation Act')}; the calculator uses the middle of each band, which is a simplification. If you are buying, ask for the energy certificate (Energieausweis), which states the class; more under ${h.a('gebaeudeenergiegesetz', 'Building Energy Act')}.</p>

<h2>Limits of these figures</h2>
<p>A state’s value here is the average of one to four stations in large cities. Rural areas and uplands are colder, so a house in the Ore Mountains or the Sauerland needs more heat than the table shows for Saxony or North Rhine-Westphalia. The years 2021 to 2025 were also milder than the long-term average, and the Weather Service’s monthly values are provisional. For choosing between two systems this hardly matters, because climate affects both equally. For the absolute size of the bill, your measured consumption is the better starting point. Enter it in the ${h.a('heizkosten-rechner', 'heating cost calculator')}; a heat pump’s electricity demand is worked out under ${h.a('waermepumpe-stromverbrauch', 'heat pump electricity use')}. The comparison of every system per kWh of heat is under ${h.a('heizkosten-vergleich', 'heating costs compared')}, the gas price and its parts under ${h.a('gaspreis', 'gas price')}.</p>`,
  },
});

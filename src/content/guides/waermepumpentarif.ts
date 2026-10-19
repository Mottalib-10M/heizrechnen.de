import { defineGuide } from '../../lib/guide-types';
import { nutzwaerme, laufend } from '../../lib/engine/heizkosten';
import { P, DE, EN } from '../../lib/fmt';

/**
 * Wärmepumpentarif: eigener Zähler oder gemeinsamer Zähler, und was § 14a EnWG damit zu tun hat.
 * Preise: Bundesnetzagentur Monitoringbericht 2025, Tabelle 45 (Stichtag 01.04.2025); Destatis 1. Halbjahr 2026.
 * § 14a EnWG gelesen auf gesetze-im-internet.de (Abs. 1 bis 4), Module 1 bis 3 und Dimmen nach der Seite
 * „Steuerbare Verbrauchseinrichtungen“ der Bundesnetzagentur, beide am 19.10.2026. Beträge der Module stehen nicht
 * in den Parametern und werden deshalb nicht genannt.
 */
const Pr = P.preise;
const T = P.technik;
const abstand = Pr.strom_haushalt_ct - Pr.wp_strom_getrennt_ct;
const abstandGemeinsam = Pr.strom_haushalt_ct - Pr.wp_strom_gemeinsam_ct;
const q = nutzwaerme({ flaeche: 120, klasse: 'D', land: 'Sachsen' });
const kwh = laufend('wp_luft', q)!.menge;
const ersp = (k: number, gap = abstand) => (k * gap) / 100;
const schwelle = (zEuro: number) => (zEuro * 100) / abstand;
const stufen = [3000, 4500, 6000, 9000];
const zBeispiel = 150;

export default defineGuide({
  id: 'waermepumpentarif',
  group: 'kosten',
  order: 123,
  mini: 'tarif',
  miniHref: 'waermepumpe-stromverbrauch',
  related: ['strompreis-waermepumpe', 'waermepumpe-stromverbrauch', 'waermepumpe-rechner', 'heizkosten-vergleich', 'waermepumpe-kosten'],
  sources: ['bnetza', 'destatisPreise', 'iseWpqs', 'enwg14a', 'bnetzaSteuVE', 'enfg22'],
  de: {
    slug: 'waermepumpentarif',
    nav: 'Wärmepumpentarif',
    card: 'Eigener Zähler oder ein Zähler für alles, Netzentgelt-Module nach § 14a EnWG und ab welchem Verbrauch sich der Tarif lohnt.',
    title: 'Wärmepumpentarif 2026: Eigener Zähler und § 14a EnWG',
    description: `Wärmepumpentarif 2026: ${DE.num(Pr.wp_strom_getrennt_ct, 2)} ct mit eigenem Zähler statt ${DE.num(Pr.strom_haushalt_ct, 2)} ct Haushaltsstrom. Was § 14a EnWG verlangt und ab welchem Verbrauch der eigene Zähler sich lohnt.`,
    h1: 'Wärmepumpentarif: eigener Zähler, Steuerung und Netzentgelt',
    intro: 'Ein Wärmepumpentarif ist günstiger, weil der Netzbetreiber die Anlage im Notfall drosseln darf. Ob sich dafür ein zweiter Zähler lohnt, hängt vom Verbrauch ab.',
    resume: `Ein Wärmepumpentarif ist ein Heizstromvertrag, der günstiger ist als Haushaltsstrom, weil der Netzbetreiber die Wärmepumpe als steuerbare Verbrauchseinrichtung nach § 14a EnWG bei drohender Überlastung drosseln darf. Laut Bundesnetzagentur zahlten Wärmepumpen mit eigenem Zähler am 1. April 2025 im Mittel ${DE.num(Pr.wp_strom_getrennt_ct, 2)} ct je kWh, an einem gemeinsamen Zähler mit dem Haushalt ${DE.num(Pr.wp_strom_gemeinsam_ct, 2)} ct. Haushaltsstrom kostete im ersten Halbjahr 2026 laut Destatis ${DE.num(Pr.strom_haushalt_ct, 2)} ct. Der Abstand zum eigenen Zähler beträgt ${DE.num(abstand, 2)} ct je kWh. Ein Haus mit 120 m² in Klasse D in Sachsen braucht mit einer Luft-Wärmepumpe rund ${DE.num(kwh)} kWh Strom im Jahr und spart mit eigenem Zähler ${DE.eur(ersp(kwh))} gegenüber Haushaltsstrom. Davon gehen Einbau und Grundpreis des zweiten Zählers ab. Kostet er zum Beispiel ${DE.eur(zBeispiel)} im Jahr, lohnt er sich ab ${DE.num(schwelle(zBeispiel))} kWh. Seit 2024 ist der separate Zähler keine Pflicht mehr, er ist aber Voraussetzung für das Netzentgelt-Modul mit reduziertem Arbeitspreis.`,
    faqs: [
      { q: 'Brauche ich für einen Wärmepumpentarif einen zweiten Stromzähler?', a: 'Nicht unbedingt. Nach den Angaben der Bundesnetzagentur können Wärmepumpen, die seit 2024 in Betrieb gehen, an einen separaten Zähler oder an den allgemeinen Hauszähler angeschlossen werden. Mit eigenem Zähler sind die Durchschnittspreise niedriger, weil einige Umlagen entfallen. Das Netzentgelt-Modul mit reduziertem Arbeitspreis setzt den separaten Zähler voraus. Ohne ihn bleibt die pauschale Reduzierung, die der Netzbetreiber automatisch gewährt.' },
      { q: 'Darf der Netzbetreiber meine Wärmepumpe einfach abschalten?', a: 'Abschalten nicht, drosseln ja. Seit dem 1. Januar 2024 müssen sich neue steuerbare Verbrauchseinrichtungen oberhalb einer bestimmten Anschlussleistung dimmen lassen. Der Netzbetreiber darf ihren Strombezug vorübergehend bis auf eine Mindestleistung senken, wenn das Netz vor Ort überlastet zu werden droht. Die Mindestleistung legt die Bundesnetzagentur fest. Im Gegenzug darf er den Anschluss neuer Wärmepumpen nicht mit Verweis auf knappe Netzkapazität ablehnen und muss ein verringertes Netzentgelt berechnen.' },
      { q: 'Welches Netzentgelt-Modul nach § 14a EnWG passt zu einer Wärmepumpe?', a: 'Die Bundesnetzagentur nennt drei Module. Modul 1 ist eine pauschale Reduzierung im Jahr, ohne technischen Aufwand. Modul 2 senkt den Arbeitspreis des Netzentgelts für den separat gemessenen Verbrauch und eignet sich nach ihren Worten besonders für Wärmepumpen mit hohem Verbrauch. Modul 3 bringt zeitvariable Netzentgelte und ist seit April 2025 nur zusammen mit Modul 1 wählbar. Modul 2 lässt sich mit keinem anderen Modul kombinieren.' },
      { q: 'Ab welchem Verbrauch lohnt sich ein eigener Wärmepumpenzähler?', a: `Teilen Sie die zusätzlichen Kosten des Zählers im Jahr durch den Preisabstand zum Haushaltsstrom. Bei ${DE.num(abstand, 2)} ct Abstand und angenommenen ${DE.eur(zBeispiel)} Zusatzkosten liegt die Grenze bei ${DE.num(schwelle(zBeispiel))} kWh. Einmalige Kosten für den Umbau des Zählerschranks verteilen Sie dazu auf die Jahre, die Sie im Haus bleiben wollen. Den Betrag nennt Ihnen der Elektrobetrieb oder der Messstellenbetreiber, amtliche Durchschnittswerte gibt es dafür nicht.` },
      { q: 'Gilt § 14a EnWG auch für meine Wärmepumpe von 2021?', a: 'Nach der Seite der Bundesnetzagentur bleiben Wärmepumpen, die vor 2024 ohne Steuerungsvereinbarung in Betrieb gingen, dauerhaft von den neuen Regeln ausgenommen. Ihr Netzbetreiber darf sie also nicht nachträglich dimmen. Wer bereits einen Heizstromvertrag mit Steuerung aus der Zeit davor hat, sollte in den Vertragsunterlagen nachsehen, welche Regeln vereinbart wurden, denn für solche Altverträge kann die Behörde Übergangsregeln festlegen.' },
    ],
    body: (h) => `
<h2>Was einen Wärmepumpentarif ausmacht</h2>
<p>Ein Wärmepumpentarif ist ein Heizstromvertrag. Die ${h.src('bnetza', 'Bundesnetzagentur')} beschreibt ihn so: Gesonderte Tarife für Wärmepumpen und Nachtspeicher setzen in der Regel voraus, dass eine steuerbare Verbrauchseinrichtung im Sinne des § 14a EnWG vorliegt. Weil der Netzbetreiber den Verbrauch unterbrechen oder drosseln kann, fallen geringere Netzentgelte an, dazu eine niedrigere Konzessionsabgabe als bei gewöhnlichem Haushaltsstrom. Gemessen wird entweder über einen eigenen Zähler für die Wärmepumpe, häufig ein Zweitarifzähler mit Hoch- und Niedertarif, oder gemeinsam mit dem Haushaltsstrom über einen Doppeltarifzähler.</p>
${h.table(['Messung', 'Preis je kWh', 'Abstand zum Haushaltsstrom', 'Ersparnis bei ' + h.num(kwh) + ' kWh'], [
  ['Eigener Zähler für die Wärmepumpe', `${h.num(Pr.wp_strom_getrennt_ct, 2)} ct`, `${h.num(abstand, 2)} ct`, h.eur(ersp(kwh))],
  ['Gemeinsamer Zähler, Heizstromtarif', `${h.num(Pr.wp_strom_gemeinsam_ct, 2)} ct`, `${h.num(abstandGemeinsam, 2)} ct`, h.eur(ersp(kwh, abstandGemeinsam))],
  ['Haushaltsstrom ohne Heizstromtarif', `${h.num(Pr.strom_haushalt_ct, 2)} ct`, '0 ct', h.eur(0)],
], 'Bundesnetzagentur, Stichtag 01.04.2025; Destatis, 1. Halbjahr 2026; Beispielhaus 120 m², Klasse D, Sachsen', ['l', 'r', 'r', 'r'])}
<p>Der niedrigere Preis mit eigenem Zähler hat einen gesetzlichen Grund: Für Wärmepumpenstrom über einen eigenen Zählpunkt entfallen nach § 22 EnFG die KWK-Umlage und die Offshore-Netzumlage. Die Zahlen der Bundesnetzagentur sind Durchschnitte über viele Lieferanten und stammen aus der Zeit vor den 2026 gesunkenen Netzentgelten. Mehr zu den Preisen und ihrer Herkunft unter ${h.a('strompreis-waermepumpe', 'Strompreis Wärmepumpe')}.</p>

<h2>Was § 14a EnWG regelt</h2>
<p>§ 14a des Energiewirtschaftsgesetzes nennt Wärmepumpen ausdrücklich als Beispiel für steuerbare Verbrauchseinrichtungen, neben nicht öffentlich zugänglichen Ladepunkten für Elektroautos, Anlagen zur Kälteerzeugung, Stromspeichern und Nachtspeicherheizungen. Er erlaubt der Bundesnetzagentur, bundesweit festzulegen, wie Netzbetreiber diese Geräte steuern dürfen und wie stark das Netzentgelt im Gegenzug sinkt. Ist am Zählpunkt ein intelligentes Messsystem eingebaut, läuft die Steuerung über das Smart-Meter-Gateway. Nach dem Monitoringbericht schreibt das Messstellenbetriebsgesetz den Einbau eines intelligenten Messsystems auch für Verbraucher mit einer Vereinbarung nach § 14a vor.</p>
<p>Die Festlegungen der Bundesnetzagentur gelten seit dem 1. Januar 2024. Neue steuerbare Verbrauchseinrichtungen oberhalb einer bestimmten Anschlussleistung müssen sich seitdem dimmen lassen: Droht der örtliche Netzstrang überlastet zu werden, darf der Netzbetreiber den Strombezug vorübergehend bis auf eine festgelegte Mindestleistung senken. Ganz abschalten darf er nicht. Im Gegenzug darf er neue Wärmepumpen nicht mit Verweis auf knappe Kapazität vom Netz fernhalten. Wärmepumpen, die vor 2024 ohne Steuerungsvereinbarung in Betrieb gingen, bleiben dauerhaft ausgenommen.</p>

<h2>Drei Module für das Netzentgelt</h2>
${h.table(['Modul', 'Was es bringt', 'Voraussetzung'], [
  ['Modul 1', 'pauschale Reduzierung des Netzentgelts im Jahr', 'keine, wird automatisch gewährt'],
  ['Modul 2', 'reduzierter Arbeitspreis des Netzentgelts für die Wärmepumpe', 'separater Zähler, nicht mit anderen Modulen kombinierbar'],
  ['Modul 3', 'zeitvariable Netzentgelte', 'seit April 2025, nur zusammen mit Modul 1'],
], 'Bundesnetzagentur, Steuerbare Verbrauchseinrichtungen, gelesen am 19.10.2026', ['l', 'l', 'l'])}
<p>Die Beträge unterscheiden sich je nach Netzbetreiber, die aktuellen Werte für Ihr Netzgebiet nennt Ihnen Ihr Netzbetreiber. Die Bundesnetzagentur nennt Modul 2 als besonders geeignet für Wärmepumpen, weil ein Abschlag auf jede kWh bei hohem Verbrauch stärker wirkt als eine Pauschale. Wer wenig verbraucht, etwa in einem gut gedämmten Haus, fährt mit Modul 1 oft einfacher. Den eigenen Verbrauch schätzen Sie mit ${h.a('waermepumpe-stromverbrauch', 'Wärmepumpe Stromverbrauch')}.</p>

<h2>Wann der zweite Zähler sich rechnet</h2>
<p>Ein eigener Zähler kostet Geld: einmalig für Zählerplatz und Elektroarbeiten, laufend für Messstellenbetrieb und einen zweiten Grundpreis. Amtliche Durchschnittswerte dafür gibt es nicht, die Beträge stehen im Angebot des Elektrobetriebs und im Preisblatt des Messstellenbetreibers. Die Ersparnis lässt sich dagegen aus dem Verbrauch rechnen: ${h.num(abstand, 2)} ct je kWh gegenüber Haushaltsstrom.</p>
${h.table(['Strom der Wärmepumpe im Jahr', 'Ersparnis brutto', 'nach angenommenen ' + h.eur(zBeispiel) + ' Zählerkosten'], stufen.map((k) => [`${h.num(k)} kWh`, h.eur(ersp(k)), h.eur(ersp(k) - zBeispiel)]), 'Abstand Haushaltsstrom zu Wärmepumpe mit eigenem Zähler, Durchschnittspreise', ['r', 'r', 'r'])}
<p>Die Zählerkosten von ${h.eur(zBeispiel)} im Jahr sind ein Rechenbeispiel, keine amtliche Zahl. Tragen Sie im Rechner oben Ihren eigenen Betrag ein, dann zeigt er die Ersparnis und den Verbrauch, ab dem es sich lohnt. Eine Erdwärmepumpe mit der gemessenen Jahresarbeitszahl von ${h.num(T.jaz_sole_messung, 1)} verbraucht weniger Strom als eine Luft-Wärmepumpe mit ${h.num(T.jaz_luft_messung, 1)} (${h.src('iseWpqs', 'Fraunhofer ISE')}), bei ihr liegt die Schwelle deshalb näher.</p>
<!--mini:strompreis-->

<h2>Vor dem Einbau klären</h2>
<p>Ob der Zähler getrennt wird, entscheidet sich am besten mit der Planung der Wärmepumpe, weil der Zählerschrank dann ohnehin geöffnet wird. Fragen Sie den Elektrobetrieb nach dem Platz für einen zweiten Zähler, den Netzbetreiber nach den Modulen und ihrem Preisblatt, und den Stromlieferanten nach einem Heizstromtarif an Ihrer Adresse. Wie der Strompreis die gesamten Heizkosten verschiebt, zeigt ${h.a('heizkosten-vergleich', 'Heizkosten Vergleich')}; die Anschaffung samt Zuschuss rechnet ${h.a('waermepumpe-kosten', 'Wärmepumpe Kosten')}, den Betrieb mit Ihren Werten der ${h.a('waermepumpe-rechner', 'Wärmepumpe Rechner')}. Haushaltsstrompreise stammen vom ${h.src('destatisPreise', 'Statistischen Bundesamt')}.</p>`,
  },
  en: {
    slug: 'heat-pump-tariff',
    nav: 'Heat pump tariff',
    card: 'Separate meter or one meter for everything, network charge options under section 14a EnWG, and the usage at which the tariff pays off.',
    title: 'Heat pump tariff 2026: separate meter and section 14a EnWG',
    description: `Heat pump tariff 2026 in Germany: ${EN.num(Pr.wp_strom_getrennt_ct, 2)} ct with its own meter instead of ${EN.num(Pr.strom_haushalt_ct, 2)} ct household power. What section 14a requires and when a second meter pays off.`,
    h1: 'Heat pump tariff: separate meter, grid control and charges',
    intro: 'A heat pump tariff is cheaper because the grid operator may throttle the unit when the local network is stretched. Whether a second meter is worth it depends on how much power you use.',
    resume: `A heat pump tariff (Wärmepumpentarif) is a heating electricity contract priced below household power, because the grid operator may throttle the heat pump as a controllable device under section 14a of the Energy Industry Act (EnWG) when the local network risks overload. According to the Federal Network Agency, heat pumps with their own meter paid ${EN.num(Pr.wp_strom_getrennt_ct, 2)} ct per kWh on average on 1 April 2025, and those sharing a meter with the household ${EN.num(Pr.wp_strom_gemeinsam_ct, 2)} ct. Household power cost ${EN.num(Pr.strom_haushalt_ct, 2)} ct in the first half of 2026 according to Destatis. The gap to a separate meter is ${EN.num(abstand, 2)} ct per kWh. A 120 m² class D house in Saxony needs about ${EN.num(kwh)} kWh a year for an air-source heat pump and saves ${EN.eur(ersp(kwh))} against household power with its own meter. Fitting and standing charge of the second meter come off that. If it costs, say, ${EN.eur(zBeispiel)} a year, it pays from ${EN.num(schwelle(zBeispiel))} kWh. Since 2024 a separate meter is optional, but it is required for the network charge option with a reduced unit rate.`,
    faqs: [
      { q: 'Do I need a second electricity meter for a heat pump tariff in Germany?', a: 'Not necessarily. According to the Federal Network Agency, heat pumps installed from 2024 can be connected either to a separate meter or to the general household meter. Average prices are lower with a separate meter because some levies do not apply. The network charge option with a reduced unit rate requires the separate meter. Without it you get the flat reduction that the grid operator grants automatically.' },
      { q: 'Can the grid operator simply switch my heat pump off?', a: 'Not switch off, but throttle. Since 1 January 2024, new controllable devices above a certain connection capacity must accept dimming. The grid operator may temporarily cut their draw down to a minimum output when the local network risks overload. The Federal Network Agency sets that minimum. In return the operator may not refuse to connect a new heat pump on grounds of limited capacity and must charge a reduced network fee.' },
      { q: 'Which section 14a network charge option suits a heat pump?', a: 'The Federal Network Agency lists three options (Module). Module 1 is a flat yearly reduction with no technical effort. Module 2 lowers the network charge unit rate for separately metered use and, in the agency’s words, suits heat pumps with high consumption in particular. Module 3 adds time-variable network charges and since April 2025 can only be chosen together with Module 1. Module 2 cannot be combined with any other.' },
      { q: 'From what usage does a separate heat pump meter pay off?', a: `Divide the meter’s extra cost per year by the price gap to household power. With a gap of ${EN.num(abstand, 2)} ct and an assumed ${EN.eur(zBeispiel)} of extra cost, the threshold is ${EN.num(schwelle(zBeispiel))} kWh. Spread any one-off cost for rebuilding the meter cabinet over the years you plan to stay in the house. The electrician or metering operator can give you the amount; there are no official averages for it.` },
      { q: 'Does section 14a apply to a heat pump installed in 2021?', a: 'According to the Federal Network Agency, heat pumps that went into operation before 2024 without a control agreement remain permanently exempt from the new rules. Your grid operator may not start dimming them. If you took over a house with an older heating tariff that includes control, check the contract papers to see what was agreed, as the agency may set transitional rules for such older agreements.' },
    ],
    body: (h) => `
<h2>What makes a heat pump tariff</h2>
<p>A heat pump tariff is a heating electricity contract. The ${h.src('bnetza', 'Federal Network Agency')} describes it like this: separate tariffs for heat pumps and storage heaters usually require a controllable device within the meaning of section 14a EnWG. Because the grid operator can interrupt or throttle consumption, network charges are lower, and the concession fee is lower than on ordinary household power. Metering is either through a separate meter for the heat pump, often a two-rate meter with high and low rates, or together with household power through a dual-rate meter.</p>
${h.table(['Metering', 'Price per kWh', 'Gap to household power', 'Saving at ' + h.num(kwh) + ' kWh'], [
  ['Separate meter for the heat pump', `${h.num(Pr.wp_strom_getrennt_ct, 2)} ct`, `${h.num(abstand, 2)} ct`, h.eur(ersp(kwh))],
  ['Shared meter, heating tariff', `${h.num(Pr.wp_strom_gemeinsam_ct, 2)} ct`, `${h.num(abstandGemeinsam, 2)} ct`, h.eur(ersp(kwh, abstandGemeinsam))],
  ['Household power, no heating tariff', `${h.num(Pr.strom_haushalt_ct, 2)} ct`, '0 ct', h.eur(0)],
], 'Federal Network Agency, 1 April 2025; Destatis, first half of 2026; example house 120 m², class D, Saxony', ['l', 'r', 'r', 'r'])}
<p>The lower price with a separate meter has a legal reason: heat pump electricity drawn through its own metering point is exempt from the combined heat and power levy and the offshore grid levy under section 22 of the Energy Financing Act. The agency’s figures are averages over many suppliers and predate the network charge cuts of 2026. More on the prices and where they come from under ${h.a('strompreis-waermepumpe', 'heat pump electricity price')}.</p>

<h2>What section 14a EnWG covers</h2>
<p>Section 14a of the Energy Industry Act names heat pumps explicitly as an example of controllable devices, alongside charging points for electric cars that are not open to the public, cooling systems, electricity storage and storage heaters. It allows the Federal Network Agency to set nationwide rules on how grid operators may control such devices and how far the network charge falls in return. Once a smart metering system is installed at the metering point, control runs through the smart meter gateway. According to the monitoring report, the Metering Point Operation Act also makes a smart metering system mandatory for customers with a section 14a agreement.</p>
<p>The agency’s rules have applied since 1 January 2024. New controllable devices above a certain connection capacity must accept dimming: if the local line risks overload, the grid operator may temporarily cut their draw down to a set minimum output. It may not switch them off entirely. In return, it may not keep new heat pumps off the grid on grounds of limited capacity. Heat pumps that went into operation before 2024 without a control agreement remain permanently exempt.</p>

<h2>Three options for the network charge</h2>
${h.table(['Option', 'What it gives', 'Condition'], [
  ['Module 1', 'flat yearly reduction of the network charge', 'none, granted automatically'],
  ['Module 2', 'reduced network charge unit rate for the heat pump', 'separate meter, cannot be combined'],
  ['Module 3', 'time-variable network charges', 'since April 2025, only with Module 1'],
], 'Federal Network Agency, controllable devices page, read on 19 October 2026', ['l', 'l', 'l'])}
<p>The amounts differ from one grid operator to the next; yours can tell you the current values for your area. The agency points to Module 2 for heat pumps in particular, because a discount on every kWh weighs more at high consumption than a flat amount. If you use little power, for instance in a well-insulated house, Module 1 is often the simpler choice. You can estimate your own use with ${h.a('waermepumpe-stromverbrauch', 'heat pump electricity use')}. Price sheets and contracts are in German; look for „Modul“, „Netzentgelt“ and „steuerbare Verbrauchseinrichtung“.</p>

<h2>When the second meter pays</h2>
<p>A separate meter costs money: once for the meter space and wiring, and every year for metering and a second standing charge. There are no official averages for these; the amounts are in the electrician’s quote and the metering operator’s price sheet. The saving, on the other hand, follows from consumption: ${h.num(abstand, 2)} ct per kWh against household power.</p>
${h.table(['Heat pump power a year', 'Gross saving', 'after an assumed ' + h.eur(zBeispiel) + ' meter cost'], stufen.map((k) => [`${h.num(k)} kWh`, h.eur(ersp(k)), h.eur(ersp(k) - zBeispiel)]), 'Gap between household power and a separately metered heat pump, average prices', ['r', 'r', 'r'])}
<p>The meter cost of ${h.eur(zBeispiel)} a year is a worked example, not an official figure. Enter your own amount in the calculator above to see the saving and the usage from which it pays. A ground-source heat pump at the measured performance factor of ${h.num(T.jaz_sole_messung, 1)} uses less power than an air-source one at ${h.num(T.jaz_luft_messung, 1)} (${h.src('iseWpqs', 'Fraunhofer ISE')}), so its threshold is closer.</p>
<!--mini:strompreis-->

<h2>Settle it before installation</h2>
<p>Whether to split the meter is best decided while planning the heat pump, as the meter cabinet will be opened anyway. Ask the electrician about space for a second meter, the grid operator about the options and its price sheet, and electricity suppliers about a heating tariff at your address. How the electricity price shifts total heating costs is shown under ${h.a('heizkosten-vergleich', 'heating costs compared')}; purchase and grant are worked out under ${h.a('waermepumpe-kosten', 'heat pump cost')}, running costs with your figures in the ${h.a('waermepumpe-rechner', 'heat pump calculator')}. Household electricity prices come from the ${h.src('destatisPreise', 'Federal Statistical Office')}.</p>`,
  },
});

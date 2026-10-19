/**
 * Heizkosten im Jahr je Heizung: Wärmebedarf aus Wohnfläche, Effizienzklasse und Gradtagzahl des Landes (oder aus dem
 * gemessenen Verbrauch), Preise Destatis, Weekly Oil Bulletin und Bundesnetzagentur, CO₂-Preis als Szenario.
 * Modus „wp“: Wärmepumpe gegen die heutige Heizung. Modus „alle“: alle Heizungen nebeneinander.
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { nutzwaerme, vergleich, laufend, co2Mehrkosten, klimafaktor, STANDARDPREISE, type Klasse, type System } from '../../lib/engine/heizkosten';
import { P } from '../../lib/engine/params';
import { readParams, num, str, updateURL } from '../../lib/url-state';
import { Zeilen, Aktionen, Kopf, Rechenweg, Hinweis, kasten, rahmen, raster, tx, fm, type L, type Zeile } from './kit';
import { landOpt, klasseOpt, wpStromOpt, systemName, LAND_EN } from './opts';

interface Props { lang?: L; methodHref?: string; preset?: { mode?: 'wp' | 'alle'; heute?: System } }

const heuteOpt = (l: L) => (['gas', 'oel', 'nachtspeicher', 'fernwaerme'] as System[]).map((s) => ({ value: s, label: systemName(s, l) }));
const oelOpt = (l: L) => [
  { value: '12', label: tx(l, `Schnitt 12 Monate (${P.preise.oel_eur_100l_12monate.toLocaleString('de-DE')} €/100 l)`, `12-month average (€${P.preise.oel_eur_100l_12monate}/100 l)`), v: P.preise.oel_eur_100l_12monate },
  { value: 'akt', label: tx(l, `Aktuell (${P.preise.oel_eur_100l_aktuell.toLocaleString('de-DE')} €/100 l)`, `Current (€${P.preise.oel_eur_100l_aktuell}/100 l)`), v: P.preise.oel_eur_100l_aktuell },
  { value: '25', label: tx(l, `Schnitt 2025 (${P.preise.oel_eur_100l_2025.toLocaleString('de-DE')} €/100 l)`, `2025 average (€${P.preise.oel_eur_100l_2025}/100 l)`), v: P.preise.oel_eur_100l_2025 },
];

export default function HeizkostenRechner({ lang = 'de', methodHref, preset = {} }: Props) {
  const f = fm(lang);
  const mode = preset.mode ?? 'alle';
  const d = { land: 'Nordrhein-Westfalen', flaeche: 140, klasse: 'E', heute: preset.heute ?? 'gas', verbrauch: 0, gas: P.preise.gas_ct, oel: '12', strom: 'getrennt', jaz: P.technik.jaz_luft_messung, fern: 0, co2: P.co2.auktion_2026_durchschnitt };
  const [land, setLand] = useState(d.land);
  const [flaeche, setFlaeche] = useState(d.flaeche);
  const [klasse, setKlasse] = useState(d.klasse);
  const [heute, setHeute] = useState<string>(d.heute);
  const [verbrauch, setVerbrauch] = useState(d.verbrauch);
  const [gas, setGas] = useState(d.gas);
  const [oel, setOel] = useState(d.oel);
  const [strom, setStrom] = useState(d.strom);
  const [jaz, setJaz] = useState(d.jaz);
  const [fern, setFern] = useState(d.fern);
  const [co2, setCo2] = useState(d.co2);
  useEffect(() => {
    const u = readParams(window.location.search); if (![...u.keys()].length) return;
    setLand(str(u, 'l', d.land)); setFlaeche(num(u, 'm', d.flaeche)); setKlasse(str(u, 'e', d.klasse)); setHeute(str(u, 'h', d.heute)); setVerbrauch(num(u, 'v', 0));
    setGas(num(u, 'gp', d.gas)); setOel(str(u, 'op', d.oel)); setStrom(str(u, 'st', d.strom)); setJaz(num(u, 'j', d.jaz)); setFern(num(u, 'fp', 0)); setCo2(num(u, 'co2', d.co2));
  }, []);
  useEffect(() => { updateURL({ l: land, m: flaeche, e: klasse, h: heute, v: verbrauch, gp: gas, op: oel, st: strom, j: jaz, fp: fern, co2 }); }, [land, flaeche, klasse, heute, verbrauch, gas, oel, strom, jaz, fern, co2]);

  const sys = heute as System;
  const pr = { ...STANDARDPREISE, gasCt: gas, oelEur100: oelOpt(lang).find((o) => o.value === oel)?.v ?? STANDARDPREISE.oelEur100, wpCt: wpStromOpt(lang).find((o) => o.value === strom)?.ct ?? STANDARDPREISE.wpCt, fernCt: fern > 0 ? fern : undefined };
  const q = useMemo(() => nutzwaerme({ flaeche, klasse: klasse as Klasse, land, verbrauch: verbrauch > 0 ? verbrauch : undefined, heute: sys }), [flaeche, klasse, land, verbrauch, sys]);
  const liste = vergleich(q, pr, { jaz }).map((x) => ({ ...x, mitCo2: x.kosten + (x.co2 > 0 ? co2Mehrkosten(x.co2, co2) : 0) }));
  liste.sort((a, b) => a.mitCo2 - b.mitCo2);
  // Fernwärme ohne eigenen Preis: kein amtlicher Durchschnittspreis, also Vergleich mit Gas als Platzhalter.
  const fehltPreis = sys === 'fernwaerme' && !pr.fernCt;
  const jetzt = laufend(sys, q, pr) ?? laufend('gas', q, pr)!;
  const jetztKosten = jetzt.kosten + (jetzt.co2 > 0 ? co2Mehrkosten(jetzt.co2, co2) : 0);
  const wp = liste.find((x) => x.system === 'wp_luft')!;
  const name = (s: System) => systemName(s, lang);
  const landName = lang === 'en' ? LAND_EN[land] ?? land : land;
  const einheit = sys === 'oel' ? tx(lang, 'Liter Heizöl im Jahr', 'litres of oil a year') : tx(lang, 'kWh im Jahr laut Rechnung', 'kWh a year on your bill');

  const rows: Zeile[] = liste.map((x) => ({ label: `${name(x.system)}${x.system === sys ? tx(lang, ' (heute)', ' (now)') : ''}`, value: f.eur(x.mitCo2), strong: x.system === sys }));
  rows.push({ label: tx(lang, 'Wärmebedarf im Jahr', 'Heat demand a year'), value: `${f.num(q)} kWh`, muted: true, sep: true });
  rows.push({ label: tx(lang, 'CO₂ heute im Jahr', 'CO₂ today a year'), value: `${f.num(jetzt.co2)} kg`, muted: true });

  const steps = [
    verbrauch > 0
      ? tx(lang, `Aus Ihrem Verbrauch von ${f.num(verbrauch)} ${sys === 'oel' ? 'Litern' : 'kWh'} mit einem Kesselnutzungsgrad von ${f.pct(P.annahmen.nutzungsgrad_kessel, 1)}: ${f.num(q)} kWh Nutzwärme.`, `From your consumption of ${f.num(verbrauch)} ${sys === 'oel' ? 'litres' : 'kWh'} with boiler efficiency ${f.pct(P.annahmen.nutzungsgrad_kessel, 1)}: ${f.num(q)} kWh of useful heat.`)
      : tx(lang, `${f.num(flaeche)} m² × Klasse ${klasse} (Mitte ${f.num(P.annahmen.klasse_mitte[klasse as Klasse], 1)} kWh/m²) × Nutzungsgrad ${f.pct(P.annahmen.nutzungsgrad_kessel, 1)} × Klima ${landName} (Gradtagzahl ${f.num(klimafaktor(land) * P.klima.referenz_potsdam)} statt ${f.num(P.klima.referenz_potsdam)} in Potsdam, nur auf die Raumwärme) = ${f.num(q)} kWh.`, `${f.num(flaeche)} m² × class ${klasse} (midpoint ${f.num(P.annahmen.klasse_mitte[klasse as Klasse], 1)} kWh/m²) × efficiency ${f.pct(P.annahmen.nutzungsgrad_kessel, 1)} × ${landName} climate (${f.num(klimafaktor(land) * P.klima.referenz_potsdam)} degree days vs ${f.num(P.klima.referenz_potsdam)} in Potsdam, space heating only) = ${f.num(q)} kWh.`),
    tx(lang, `Wärmepumpe: ${f.num(q)} ÷ JAZ ${f.num(jaz, 1)} = ${f.num(wp.menge)} kWh Strom × ${f.num(pr.wpCt, 2)} ct = ${f.eur(wp.kosten)}.`, `Heat pump: ${f.num(q)} ÷ SPF ${f.num(jaz, 1)} = ${f.num(wp.menge)} kWh × ${f.num(pr.wpCt, 2)} ct = ${f.eur(wp.kosten)}.`),
    tx(lang, `Gas zu ${f.num(gas, 2)} ct/kWh (Destatis, ${P.preise.gas_stand}), Heizöl zu ${f.num(pr.oelEur100, 2)} € je 100 Liter.`, `Gas at ${f.num(gas, 2)} ct/kWh (Destatis, first half of 2026), heating oil at €${f.num(pr.oelEur100, 2)} per 100 litres.`),
    co2 === P.co2.auktion_2026_durchschnitt
      ? tx(lang, `CO₂-Preis: ${f.num(co2)} € je Tonne, wie 2026 in den Preisen enthalten.`, `CO₂ price: €${f.num(co2)} per tonne, as included in 2026 prices.`)
      : tx(lang, `CO₂-Szenario ${f.num(co2)} € statt ${f.num(P.co2.auktion_2026_durchschnitt)} € je Tonne: ${f.eur(co2Mehrkosten(jetzt.co2, co2))} im Jahr für die heutige Heizung, mit Mehrwertsteuer.`, `CO₂ scenario €${f.num(co2)} instead of €${f.num(P.co2.auktion_2026_durchschnitt)} per tonne: ${f.eur(co2Mehrkosten(jetzt.co2, co2))} a year for your current system, VAT included.`),
  ];

  const kopf = mode === 'wp'
    ? <Kopf label={tx(lang, 'Wärmepumpe im Jahr', 'Heat pump a year')} wert={f.eur(wp.mitCo2)} unter={tx(lang, `${name(sys)} heute: ${f.eur(jetztKosten)}, Differenz ${f.eur(jetztKosten - wp.mitCo2)}`, `${name(sys)} now: ${f.eur(jetztKosten)}, difference ${f.eur(jetztKosten - wp.mitCo2)}`)} />
    : <Kopf label={tx(lang, `Heizkosten heute (${name(sys)})`, `Heating cost now (${name(sys)})`)} wert={f.eur(jetztKosten)} unter={tx(lang, `im Jahr; am günstigsten: ${name(liste[0].system)} mit ${f.eur(liste[0].mitCo2)}`, `a year; cheapest: ${name(liste[0].system)} at ${f.eur(liste[0].mitCo2)}`)} />;

  return (
    <div className={rahmen} data-chrome>
      <div className="srg h-1.5" aria-hidden="true" />
      <div className={raster}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <SelectField id="hk-l" label={tx(lang, 'Bundesland', 'Federal state')} value={land} onChange={setLand} options={landOpt(lang)} />
            <SelectField id="hk-h" label={tx(lang, 'Heizung heute', 'Current heating')} value={heute} onChange={setHeute} options={heuteOpt(lang)} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <NumberField id="hk-m" label={tx(lang, 'Wohnfläche', 'Living space')} value={flaeche} onChange={setFlaeche} unit="m²" max={2000} lang={lang} />
            <SelectField id="hk-e" label={tx(lang, 'Effizienzklasse', 'Efficiency class')} value={klasse} onChange={setKlasse} options={klasseOpt(lang)} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <NumberField id="hk-v" label={tx(lang, 'Verbrauch, falls bekannt', 'Consumption, if known')} value={verbrauch} onChange={setVerbrauch} max={200000} lang={lang} help={sys === 'gas' || sys === 'oel' ? einheit : tx(lang, 'kWh im Jahr', 'kWh a year')} />
            <NumberField id="hk-co2" label={tx(lang, 'CO₂-Preis je Tonne', 'CO₂ price per tonne')} value={co2} onChange={setCo2} unit="€" max={500} lang={lang} help={tx(lang, `2026: ${P.co2.korridor_2026.min} bis ${P.co2.korridor_2026.max} €`, `2026: €${P.co2.korridor_2026.min} to €${P.co2.korridor_2026.max}`)} />
          </div>
          <details className="rounded-lg border border-navy-200 p-3">
            <summary className="cursor-pointer text-sm font-medium text-navy-800">{tx(lang, 'Preise und Wärmepumpe', 'Prices and heat pump')}</summary>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4">
              <NumberField id="hk-gp" label={tx(lang, 'Gaspreis', 'Gas price')} value={gas} onChange={setGas} unit="ct/kWh" decimals={2} max={60} lang={lang} />
              <SelectField id="hk-op" label={tx(lang, 'Heizölpreis', 'Heating oil price')} value={oel} onChange={setOel} options={oelOpt(lang)} />
              <SelectField id="hk-st" label={tx(lang, 'Strom für die Wärmepumpe', 'Electricity for the heat pump')} value={strom} onChange={setStrom} options={wpStromOpt(lang)} />
              <NumberField id="hk-j" label={tx(lang, 'Jahresarbeitszahl', 'Seasonal performance factor')} value={jaz} onChange={setJaz} decimals={1} max={6} lang={lang} />
              <NumberField id="hk-fp" label={tx(lang, 'Fernwärme, Ihr Preis', 'District heating, your price')} value={fern} onChange={setFern} unit="ct/kWh" decimals={2} max={60} lang={lang} help={tx(lang, 'Gesamtpreis laut Abrechnung', 'all-in price from your bill')} />
            </div>
          </details>
        </form>
        <div aria-live="polite" data-resultat className={kasten}>
          {kopf}
          {fehltPreis && <p className="mt-2 rounded-md bg-amber-50 p-2 text-xs text-amber-900">{tx(lang, 'Für Fernwärme gibt es keinen amtlichen Durchschnittspreis. Tragen Sie unter „Preise“ Ihren Preis laut Abrechnung ein; bis dahin steht hier der Wert einer Gasheizung.', 'There is no official average price for district heating. Enter your price from the bill under “Prices”; until then this shows the figure for a gas boiler.')}</p>}
          <Zeilen rows={rows} caption={tx(lang, 'Kosten im Jahr, mit CO₂', 'Cost a year, with CO₂')} />
          <Rechenweg lang={lang} steps={steps} />
          <Aktionen lang={lang} text={() => tx(lang, `Heizkosten ${landName}, ${f.num(flaeche)} m²: ${name(sys)} ${f.eur(jetztKosten)}, Wärmepumpe ${f.eur(wp.mitCo2)} im Jahr`, `Heating cost ${landName}, ${f.num(flaeche)} m²: ${name(sys)} ${f.eur(jetztKosten)}, heat pump ${f.eur(wp.mitCo2)} a year`)} />
          <Hinweis lang={lang} methodHref={methodHref} />
        </div>
      </div>
    </div>
  );
}

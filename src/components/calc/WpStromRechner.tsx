/**
 * Stromverbrauch der Wärmepumpe: Nutzwärme (Wohnfläche × Effizienzklasse × Klima des Landes, oder gemessener Verbrauch
 * der alten Heizung) geteilt durch die Jahresarbeitszahl; gemessene JAZ im Altbau nach Fraunhofer ISE.
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { nutzwaerme, laufend, STANDARDPREISE, type Klasse, type System } from '../../lib/engine/heizkosten';
import { P } from '../../lib/engine/params';
import { readParams, num, str, updateURL } from '../../lib/url-state';
import { Zeilen, Aktionen, Kopf, Rechenweg, Hinweis, kasten, rahmen, raster, tx, fm, type L } from './kit';
import { landOpt, klasseOpt, wpStromOpt, LAND_EN } from './opts';

interface Props { lang?: L; methodHref?: string; preset?: Record<string, never> }
const T = P.technik;
export default function WpStromRechner({ lang = 'de', methodHref }: Props) {
  const f = fm(lang);
  const d = { land: 'Bayern', flaeche: 140, klasse: 'D', typ: 'luft', jaz: T.jaz_luft_messung, strom: 'getrennt', gas: 0 };
  const [land, setLand] = useState(d.land);
  const [flaeche, setFlaeche] = useState(d.flaeche);
  const [klasse, setKlasse] = useState(d.klasse);
  const [typ, setTyp] = useState(d.typ);
  const [jaz, setJaz] = useState(d.jaz);
  const [strom, setStrom] = useState(d.strom);
  const [gas, setGas] = useState(d.gas);
  useEffect(() => {
    const u = readParams(window.location.search); if (![...u.keys()].length) return;
    setLand(str(u, 'l', d.land)); setFlaeche(num(u, 'm', d.flaeche)); setKlasse(str(u, 'e', d.klasse)); setTyp(str(u, 't', d.typ)); setJaz(num(u, 'j', d.jaz)); setStrom(str(u, 'st', d.strom)); setGas(num(u, 'g', 0));
  }, []);
  useEffect(() => { updateURL({ l: land, m: flaeche, e: klasse, t: typ, j: jaz, st: strom, g: gas }); }, [land, flaeche, klasse, typ, jaz, strom, gas]);
  const wechselTyp = (t: string) => { setTyp(t); setJaz(t === 'sole' ? T.jaz_sole_messung : T.jaz_luft_messung); };
  const sys: System = typ === 'sole' ? 'wp_sole' : 'wp_luft';
  const ct = wpStromOpt(lang).find((o) => o.value === strom)?.ct ?? STANDARDPREISE.wpCt;
  const q = useMemo(() => nutzwaerme({ flaeche, klasse: klasse as Klasse, land, verbrauch: gas > 0 ? gas : undefined, heute: 'gas' }), [flaeche, klasse, land, gas]);
  const r = laufend(sys, q, { ...STANDARDPREISE, wpCt: ct }, { jaz })!;
  const schlecht = laufend(sys, q, { ...STANDARDPREISE, wpCt: ct }, { jaz: typ === 'sole' ? T.jaz_sole_min : T.jaz_luft_min })!;
  const gut = laufend(sys, q, { ...STANDARDPREISE, wpCt: ct }, { jaz: typ === 'sole' ? T.jaz_sole_max : T.jaz_luft_max })!;
  const landName = lang === 'en' ? LAND_EN[land] ?? land : land;
  const steps = [
    gas > 0
      ? tx(lang, `Gasverbrauch ${f.num(gas)} kWh × ${f.num(P.co2.gas_gj_je_mwh / 3.6, 3)} (Brennwert zu Heizwert) × Nutzungsgrad ${f.pct(P.annahmen.nutzungsgrad_kessel, 1)} = ${f.num(q)} kWh Wärme.`, `Gas use ${f.num(gas)} kWh × ${f.num(P.co2.gas_gj_je_mwh / 3.6, 3)} (gross to net calorific value) × efficiency ${f.pct(P.annahmen.nutzungsgrad_kessel, 1)} = ${f.num(q)} kWh of heat.`)
      : tx(lang, `${f.num(flaeche)} m² × Klasse ${klasse} × Klima ${landName}: ${f.num(q)} kWh Wärme im Jahr, davon rund ${f.pct(T.anteil_warmwasser, 0)} Warmwasser.`, `${f.num(flaeche)} m² × class ${klasse} × ${landName} climate: ${f.num(q)} kWh of heat a year, about ${f.pct(T.anteil_warmwasser, 0)} of it hot water.`),
    tx(lang, `${f.num(q)} kWh ÷ JAZ ${f.num(jaz, 1)} = ${f.num(r.menge)} kWh Strom.`, `${f.num(q)} kWh ÷ SPF ${f.num(jaz, 1)} = ${f.num(r.menge)} kWh of electricity.`),
    tx(lang, `Gemessene Spanne im Altbau (Fraunhofer ISE): JAZ ${f.num(typ === 'sole' ? T.jaz_sole_min : T.jaz_luft_min, 1)} bis ${f.num(typ === 'sole' ? T.jaz_sole_max : T.jaz_luft_max, 1)}, also ${f.num(gut.menge)} bis ${f.num(schlecht.menge)} kWh.`, `Range measured in older homes (Fraunhofer ISE): SPF ${f.num(typ === 'sole' ? T.jaz_sole_min : T.jaz_luft_min, 1)} to ${f.num(typ === 'sole' ? T.jaz_sole_max : T.jaz_luft_max, 1)}, so ${f.num(gut.menge)} to ${f.num(schlecht.menge)} kWh.`),
  ];
  return (
    <div className={rahmen} data-chrome>
      <div className="srg h-1.5" aria-hidden="true" />
      <div className={raster}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <NumberField id="ws-m" label={tx(lang, 'Wohnfläche', 'Living space')} value={flaeche} onChange={setFlaeche} unit="m²" max={2000} lang={lang} />
            <SelectField id="ws-e" label={tx(lang, 'Effizienzklasse', 'Efficiency class')} value={klasse} onChange={setKlasse} options={klasseOpt(lang)} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <SelectField id="ws-l" label={tx(lang, 'Bundesland', 'Federal state')} value={land} onChange={setLand} options={landOpt(lang)} />
            <SelectField id="ws-t" label={tx(lang, 'Art der Wärmepumpe', 'Type of heat pump')} value={typ} onChange={wechselTyp} options={[{ value: 'luft', label: tx(lang, 'Luft-Wasser', 'Air to water') }, { value: 'sole', label: tx(lang, 'Erdwärme (Sole)', 'Ground source') }]} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <NumberField id="ws-j" label={tx(lang, 'Jahresarbeitszahl', 'Seasonal performance factor')} value={jaz} onChange={setJaz} decimals={1} max={6} lang={lang} />
            <SelectField id="ws-st" label={tx(lang, 'Stromtarif', 'Electricity tariff')} value={strom} onChange={setStrom} options={wpStromOpt(lang)} />
          </div>
          <details className="rounded-lg border border-navy-200 p-3">
            <summary className="cursor-pointer text-sm font-medium text-navy-800">{tx(lang, 'Mit dem Gasverbrauch rechnen', 'Use your gas consumption')}</summary>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4">
              <NumberField id="ws-g" label={tx(lang, 'Gasverbrauch im Jahr', 'Gas used a year')} value={gas} onChange={setGas} unit="kWh" max={200000} lang={lang} help={tx(lang, 'laut Rechnung, ersetzt Fläche und Klasse', 'from your bill, replaces area and class')} />
            </div>
          </details>
        </form>
        <div aria-live="polite" data-resultat className={kasten}>
          <Kopf label={tx(lang, 'Stromverbrauch im Jahr', 'Electricity a year')} wert={`${f.num(r.menge)} kWh`} unter={tx(lang, `${f.eur(r.kosten)} im Jahr, ${f.eur(r.kosten / 12)} im Monat`, `${f.eur(r.kosten)} a year, ${f.eur(r.kosten / 12)} a month`)} />
          <Zeilen rows={[
            { label: tx(lang, 'Wärme im Jahr', 'Heat a year'), value: `${f.num(q)} kWh` },
            { label: tx(lang, 'Strom je m² Wohnfläche', 'Electricity per m²'), value: `${f.num(flaeche > 0 ? r.menge / flaeche : 0)} kWh` },
            { label: tx(lang, `Strompreis`, `Electricity price`), value: `${f.num(ct, 2)} ct/kWh` },
            { label: tx(lang, 'Kosten im Jahr', 'Cost a year'), value: f.eur(r.kosten), strong: true, sep: true },
            { label: tx(lang, 'Gute Anlage (obere Messung)', 'Good system (top of range)'), value: `${f.num(gut.menge)} kWh`, muted: true },
            { label: tx(lang, 'Schwache Anlage (untere Messung)', 'Weak system (bottom of range)'), value: `${f.num(schlecht.menge)} kWh`, muted: true },
          ]} />
          <Rechenweg lang={lang} steps={steps} />
          <Aktionen lang={lang} text={() => tx(lang, `Wärmepumpe ${f.num(flaeche)} m², ${landName}: ${f.num(r.menge)} kWh Strom, ${f.eur(r.kosten)} im Jahr`, `Heat pump ${f.num(flaeche)} m², ${landName}: ${f.num(r.menge)} kWh, ${f.eur(r.kosten)} a year`)} />
          <Hinweis lang={lang} methodHref={methodHref} />
        </div>
      </div>
    </div>
  );
}

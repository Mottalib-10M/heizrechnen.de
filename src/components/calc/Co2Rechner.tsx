/** CO₂-Kosten des Heizens: Menge × Emissionsfaktor (EBeV 2030) × Preis je Tonne (BEHG § 10), mit Mehrwertsteuer. */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { co2Kg, co2Kosten, aufschlagCent, preisJahr, type Brennstoff } from '../../lib/engine/co2';
import { P } from '../../lib/engine/params';
import { readParams, num, str, updateURL } from '../../lib/url-state';
import { Zeilen, Aktionen, Kopf, Rechenweg, Hinweis, kasten, rahmen, raster, tx, fm, type L, type Zeile } from './kit';

interface Props { lang?: L; methodHref?: string; preset?: { stoff?: Brennstoff } }
const C = P.co2;
export default function Co2Rechner({ lang = 'de', methodHref, preset = {} }: Props) {
  const f = fm(lang);
  const d = { stoff: preset.stoff ?? 'gas', menge: preset.stoff === 'oel' ? 2000 : 20000, preis: C.auktion_2026_durchschnitt };
  const [stoff, setStoff] = useState<string>(d.stoff);
  const [menge, setMenge] = useState(d.menge);
  const [preis, setPreis] = useState(d.preis);
  useEffect(() => {
    const u = readParams(window.location.search); if (![...u.keys()].length) return;
    setStoff(str(u, 'b', d.stoff)); setMenge(num(u, 'q', d.menge)); setPreis(num(u, 'p', d.preis));
  }, []);
  useEffect(() => { updateURL({ b: stoff, q: menge, p: preis }); }, [stoff, menge, preis]);
  const s = stoff as Brennstoff;
  const wechsel = (v: string) => { setStoff(v); setMenge(v === 'oel' ? 2000 : v === 'fluessiggas' ? 1000 : 20000); };
  const kg = useMemo(() => co2Kg(s, menge), [s, menge]);
  const einheit = s === 'oel' ? tx(lang, 'Liter', 'litres') : s === 'gas' ? 'kWh' : 'kg';
  const proEinheit = s === 'gas' ? 'ct/kWh' : s === 'oel' ? 'ct/l' : 'ct/kg';
  const jahre = [2021, 2022, 2023, 2024, 2025, 2026, 2027];
  const rows: Zeile[] = jahre.map((j) => {
    const p = preisJahr(j);
    const lbl = p.status === 'fest' ? `${j}: ${p.min} €/t` : p.status === 'korridor' ? tx(lang, `${j}: ${p.min} bis ${p.max} €/t`, `${j}: €${p.min} to €${p.max}/t`) : tx(lang, `${j}: ${p.min} bis ${p.max} €/t (beschlossen, nicht in Kraft)`, `${j}: €${p.min} to €${p.max}/t (passed, not in force)`);
    return { label: lbl, value: p.min === p.max ? f.eur(co2Kosten(s, menge, p.min)) : `${f.eur(co2Kosten(s, menge, p.min))} ${lang === 'en' ? 'to' : 'bis'} ${f.eur(co2Kosten(s, menge, p.max))}`, muted: p.status === 'beschlossen' };
  });
  const steps = [
    s === 'oel'
      ? tx(lang, `${f.num(menge)} l × ${f.num(C.oel_dichte_t_je_1000l, 3)} kg/l × ${f.num(C.oel_hu_gj_je_t, 1)} MJ/kg × ${f.num(C.oel_ef_t_je_gj, 3)} kg CO₂/MJ = ${f.num(kg)} kg CO₂ (EBeV 2030, Anlage 2).`, `${f.num(menge)} l × ${f.num(C.oel_dichte_t_je_1000l, 3)} kg/l × ${f.num(C.oel_hu_gj_je_t, 1)} MJ/kg × ${f.num(C.oel_ef_t_je_gj, 3)} kg CO₂/MJ = ${f.num(kg)} kg CO₂ (EBeV 2030, Annex 2).`)
      : s === 'gas'
        ? tx(lang, `${f.num(menge)} kWh × ${f.num(C.gas_gj_je_mwh, 4)} GJ/MWh × ${f.num(C.gas_ef_t_je_gj, 4)} t/GJ = ${f.num(kg)} kg CO₂ (EBeV 2030, Anlage 2).`, `${f.num(menge)} kWh × ${f.num(C.gas_gj_je_mwh, 4)} GJ/MWh × ${f.num(C.gas_ef_t_je_gj, 4)} t/GJ = ${f.num(kg)} kg CO₂ (EBeV 2030, Annex 2).`)
        : tx(lang, `${f.num(menge)} kg × ${f.num(C.fluessiggas_hu_gj_je_t, 1)} MJ/kg × ${f.num(C.fluessiggas_ef_t_je_gj, 4)} kg CO₂/MJ = ${f.num(kg)} kg CO₂.`, `${f.num(menge)} kg × ${f.num(C.fluessiggas_hu_gj_je_t, 1)} MJ/kg × ${f.num(C.fluessiggas_ef_t_je_gj, 4)} kg CO₂/MJ = ${f.num(kg)} kg CO₂.`),
    tx(lang, `${f.num(kg / 1000, 2)} t × ${f.num(preis)} € × ${f.num(1 + C.mwst, 2)} (Mehrwertsteuer) = ${f.eur(co2Kosten(s, menge, preis))}.`, `${f.num(kg / 1000, 2)} t × €${f.num(preis)} × ${f.num(1 + C.mwst, 2)} (VAT) = ${f.eur(co2Kosten(s, menge, preis))}.`),
    tx(lang, `Ab ${C.ets2_start} soll der europäische Emissionshandel ETS2 den deutschen Preis ablösen; einen festen Preis dafür gibt es nicht. Ihr eigener Wert im Feld „CO₂-Preis“ rechnet ein Szenario.`, `From ${C.ets2_start} the EU ETS2 is due to replace the German price; there is no fixed price for it. Your own value in the “CO₂ price” field runs a scenario.`),
  ];
  return (
    <div className={rahmen} data-chrome>
      <div className="srg h-1.5" aria-hidden="true" />
      <div className={raster}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <SelectField id="co-b" label={tx(lang, 'Brennstoff', 'Fuel')} value={stoff} onChange={wechsel} options={[{ value: 'gas', label: tx(lang, 'Erdgas', 'Natural gas') }, { value: 'oel', label: tx(lang, 'Heizöl', 'Heating oil') }, { value: 'fluessiggas', label: tx(lang, 'Flüssiggas', 'LPG') }]} />
            <NumberField id="co-q" label={tx(lang, 'Verbrauch im Jahr', 'Used a year')} value={menge} onChange={setMenge} unit={einheit} max={500000} lang={lang} help={s === 'gas' ? tx(lang, 'kWh laut Gasrechnung', 'kWh on the gas bill') : undefined} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <NumberField id="co-p" label={tx(lang, 'CO₂-Preis je Tonne', 'CO₂ price per tonne')} value={preis} onChange={setPreis} unit="€" max={500} lang={lang} help={tx(lang, `Versteigerungen 2026: im Schnitt ${C.auktion_2026_durchschnitt} €`, `2026 auctions: €${C.auktion_2026_durchschnitt} on average`)} />
          </div>
        </form>
        <div aria-live="polite" data-resultat className={kasten}>
          <Kopf label={tx(lang, 'CO₂-Kosten im Jahr', 'CO₂ cost a year')} wert={f.eur(co2Kosten(s, menge, preis))} unter={tx(lang, `${f.num(kg)} kg CO₂, ${f.num(aufschlagCent(s, preis), 1)} ${proEinheit} mit Mehrwertsteuer`, `${f.num(kg)} kg CO₂, ${f.num(aufschlagCent(s, preis), 1)} ${proEinheit} incl. VAT`)} />
          <Zeilen rows={rows} caption={tx(lang, 'Derselbe Verbrauch, Preis je Jahr', 'Same consumption, price by year')} />
          <Rechenweg lang={lang} steps={steps} />
          <Aktionen lang={lang} text={() => tx(lang, `CO₂-Kosten für ${f.num(menge)} ${einheit}: ${f.eur(co2Kosten(s, menge, preis))} bei ${f.num(preis)} € je Tonne`, `CO₂ cost for ${f.num(menge)} ${einheit}: ${f.eur(co2Kosten(s, menge, preis))} at €${f.num(preis)} per tonne`)} />
          <Hinweis lang={lang} methodHref={methodHref} />
        </div>
      </div>
    </div>
  );
}

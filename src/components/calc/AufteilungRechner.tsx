/** CO₂-Kosten zwischen Mieter und Vermieter nach dem CO2KostAufG: Stufentabelle der Anlage, § 8, § 9, § 5a. */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { aufteilung, type Brennstoff } from '../../lib/engine/co2';
import { P } from '../../lib/engine/params';
import { readParams, num, str, updateURL } from '../../lib/url-state';
import { Zeilen, Aktionen, Kopf, Rechenweg, Hinweis, kasten, rahmen, raster, tx, fm, type L } from './kit';
import { janein } from './opts';

interface Props { lang?: L; methodHref?: string; preset?: Record<string, never> }
export default function AufteilungRechner({ lang = 'de', methodHref }: Props) {
  const f = fm(lang);
  const d = { stoff: 'gas', menge: 12000, flaeche: 70, kosten: 0, preis: P.co2.auktion_2026_durchschnitt, ein: '0', nw: '0', neu: '0' };
  const [stoff, setStoff] = useState(d.stoff);
  const [menge, setMenge] = useState(d.menge);
  const [flaeche, setFlaeche] = useState(d.flaeche);
  const [kosten, setKosten] = useState(d.kosten);
  const [preis, setPreis] = useState(d.preis);
  const [ein, setEin] = useState(d.ein);
  const [nw, setNw] = useState(d.nw);
  const [neu, setNeu] = useState(d.neu);
  useEffect(() => {
    const u = readParams(window.location.search); if (![...u.keys()].length) return;
    setStoff(str(u, 'b', d.stoff)); setMenge(num(u, 'q', d.menge)); setFlaeche(num(u, 'm', d.flaeche)); setKosten(num(u, 'k', 0)); setPreis(num(u, 'p', d.preis)); setEin(str(u, 'x', '0')); setNw(str(u, 'nw', '0')); setNeu(str(u, 'n', '0'));
  }, []);
  useEffect(() => { updateURL({ b: stoff, q: menge, m: flaeche, k: kosten, p: preis, x: ein, nw, n: neu }); }, [stoff, menge, flaeche, kosten, preis, ein, nw, neu]);
  const r = useMemo(() => aufteilung({ stoff: stoff as Brennstoff, menge, flaeche, kosten, preis, einschraenkung: ein === '1', nichtwohn: nw === '1', neueFossile: neu === '1', jahr: 2028 }), [stoff, menge, flaeche, kosten, preis, ein, nw, neu]);
  const einheit = stoff === 'oel' ? tx(lang, 'Liter', 'litres') : 'kWh';
  const regel = r.regel === 'nichtwohn' ? tx(lang, 'Nichtwohngebäude: hälftig (§ 8)', 'Non-residential: split in half (section 8)')
    : r.regel === 'neu' ? tx(lang, 'Neue Gas- oder Ölheizung ab 2028: hälftig (§ 5a)', 'New gas or oil boiler from 2028: split in half (section 5a)')
      : tx(lang, `Stufe nach Anlage: ${f.num(r.kgM2, 1)} kg CO₂ je m²`, `Tier under the annex: ${f.num(r.kgM2, 1)} kg CO₂ per m²`);
  const steps = [
    tx(lang, `${f.num(menge)} ${einheit} ergeben ${f.num(r.kg)} kg CO₂; geteilt durch ${f.num(flaeche)} m² sind das ${f.num(r.kgM2, 1)} kg je m² und Jahr (§ 5 Abs. 1, eine Nachkommastelle).`, `${f.num(menge)} ${einheit} give ${f.num(r.kg)} kg CO₂; divided by ${f.num(flaeche)} m² that is ${f.num(r.kgM2, 1)} kg per m² a year (section 5(1), one decimal).`),
    kosten > 0 ? tx(lang, `CO₂-Kosten laut Abrechnung: ${f.eur(r.kosten, 2)}.`, `CO₂ cost on the supplier’s bill: ${f.eur(r.kosten, 2)}.`) : tx(lang, `CO₂-Kosten geschätzt mit ${f.num(preis)} € je Tonne und Mehrwertsteuer: ${f.eur(r.kosten, 2)}. Maßgeblich ist der Betrag auf der Brennstoffrechnung.`, `CO₂ cost estimated at €${f.num(preis)} per tonne with VAT: ${f.eur(r.kosten, 2)}. The amount on the fuel bill is what counts.`),
    ein === '1' && r.regel === 'stufe' ? tx(lang, `§ 9: Denkmalschutz, Anschlusszwang oder Milieuschutz halbieren den Vermieteranteil auf ${f.pct(r.vermieter, 0)}.`, `Section 9: listed building, compulsory connection or conservation area halve the landlord’s share to ${f.pct(r.vermieter, 0)}.`) : tx(lang, `${regel}: Mieter ${f.pct(r.mieter, 0)}, Vermieter ${f.pct(r.vermieter, 0)}.`, `${regel}: tenant ${f.pct(r.mieter, 0)}, landlord ${f.pct(r.vermieter, 0)}.`),
  ];
  return (
    <div className={rahmen} data-chrome>
      <div className="srg h-1.5" aria-hidden="true" />
      <div className={raster}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <SelectField id="au-b" label={tx(lang, 'Brennstoff', 'Fuel')} value={stoff} onChange={setStoff} options={[{ value: 'gas', label: tx(lang, 'Erdgas', 'Natural gas') }, { value: 'oel', label: tx(lang, 'Heizöl', 'Heating oil') }]} />
            <NumberField id="au-q" label={tx(lang, 'Verbrauch der Wohnung im Jahr', 'Used by the flat a year')} value={menge} onChange={setMenge} unit={einheit} max={500000} lang={lang} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <NumberField id="au-m" label={tx(lang, 'Wohnfläche', 'Floor area')} value={flaeche} onChange={setFlaeche} unit="m²" max={5000} lang={lang} />
            <NumberField id="au-k" label={tx(lang, 'CO₂-Kosten laut Abrechnung', 'CO₂ cost on the bill')} value={kosten} onChange={setKosten} unit="€" max={100000} decimals={2} lang={lang} help={tx(lang, 'leer: aus Verbrauch geschätzt', 'empty: estimated from use')} />
          </div>
          <details className="rounded-lg border border-navy-200 p-3">
            <summary className="cursor-pointer text-sm font-medium text-navy-800">{tx(lang, 'Sonderfälle', 'Special cases')}</summary>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4">
              <SelectField id="au-x" label={tx(lang, 'Denkmal, Anschlusszwang oder Milieuschutz', 'Listed, compulsory connection or conservation area')} value={ein} onChange={setEin} options={janein(lang)} />
              <SelectField id="au-nw" label={tx(lang, 'Gewerbe statt Wohnung', 'Commercial, not residential')} value={nw} onChange={setNw} options={janein(lang)} />
              <SelectField id="au-n" label={tx(lang, 'Gas- oder Ölheizung neu nach dem 29.07.2026', 'Gas or oil boiler installed after 29 July 2026')} value={neu} onChange={setNeu} options={janein(lang)} help={tx(lang, 'gilt ab 2028', 'from 2028')} />
              <NumberField id="au-p" label={tx(lang, 'CO₂-Preis je Tonne', 'CO₂ price per tonne')} value={preis} onChange={setPreis} unit="€" max={500} lang={lang} />
            </div>
          </details>
        </form>
        <div aria-live="polite" data-resultat className={kasten}>
          <Kopf label={tx(lang, 'Anteil des Vermieters', 'Landlord’s share')} wert={f.eur(r.vermieterEuro, 2)} unter={tx(lang, `${f.pct(r.vermieter, 0)} von ${f.eur(r.kosten, 2)}; Mieter zahlt ${f.eur(r.mieterEuro, 2)}`, `${f.pct(r.vermieter, 0)} of ${f.eur(r.kosten, 2)}; the tenant pays ${f.eur(r.mieterEuro, 2)}`)} />
          <Zeilen rows={[
            { label: tx(lang, 'CO₂ je m² und Jahr', 'CO₂ per m² a year'), value: `${f.num(r.kgM2, 1)} kg` },
            { label: tx(lang, 'Regel', 'Rule'), value: r.regel === 'stufe' ? tx(lang, 'Stufenmodell', 'Tier model') : r.regel === 'neu' ? '§ 5a' : '§ 8' },
            { label: tx(lang, 'Mieter', 'Tenant'), value: `${f.pct(r.mieter, 0)} · ${f.eur(r.mieterEuro, 2)}` },
            { label: tx(lang, 'Vermieter', 'Landlord'), value: `${f.pct(r.vermieter, 0)} · ${f.eur(r.vermieterEuro, 2)}`, strong: true, sep: true },
          ]} />
          <Rechenweg lang={lang} steps={steps} />
          <Aktionen lang={lang} text={() => tx(lang, `CO₂-Kosten ${f.eur(r.kosten, 2)}: Vermieter ${f.eur(r.vermieterEuro, 2)}, Mieter ${f.eur(r.mieterEuro, 2)}`, `CO₂ cost ${f.eur(r.kosten, 2)}: landlord ${f.eur(r.vermieterEuro, 2)}, tenant ${f.eur(r.mieterEuro, 2)}`)} />
          <Hinweis lang={lang} methodHref={methodHref} />
        </div>
      </div>
    </div>
  );
}

/**
 * Hauptrechner: Zuschuss nach Antragsdatum (Richtlinie BEG EM vom 17.08.2026 bzw. 21.12.2023), Eigenanteil,
 * Heizkosten im Jahr vorher und nachher (Gradtagzahl des Landes, Preise Destatis, Weekly Oil Bulletin, Bundesnetzagentur),
 * Amortisation und die Zeitleiste „Was Warten kostet“ über die Stichtage der Richtlinie.
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import DateField from '../ui/DateField';
import { foerderung, stichtage, verlauf, hoechstbetrag, type Gebaeude, type NeuHeizung } from '../../lib/engine/foerderung';
import { nutzwaerme, laufend, amortisation, STANDARDPREISE, type Klasse } from '../../lib/engine/heizkosten';
import { P } from '../../lib/engine/params';
import { displayDate } from '../../lib/format';
import { LANG_TAGS } from '../../data/site-config';
import { readParams, num, str, updateURL } from '../../lib/url-state';
import { Zeilen, Aktionen, Kopf, Rechenweg, Hinweis, kasten, rahmen, raster, tx, fm, type L, type Zeile } from './kit';
import { ALT_OPT, altOpt, neuOpt, gebOpt, landOpt, klasseOpt, janein, wpStromOpt, systemName } from './opts';

interface Preset { neu?: NeuHeizung; kosten?: number; alt?: string; gebaeude?: Gebaeude }
interface Props { lang?: L; methodHref?: string; preset?: Preset }

const F = P.foerderung;
const MIN = '2024-01-01', MAX = F.richtlinie_ende;
const clampDate = (d: string) => (/^\d{4}-\d{2}-\d{2}$/.test(d) ? (d < MIN ? MIN : d > MAX ? MAX : d) : __BUILD_DAY__);

export default function FoerderRechner({ lang = 'de', methodHref, preset = {} }: Props) {
  const f = fm(lang);
  const dt = (iso: string) => displayDate(iso, LANG_TAGS[lang]);
  const d = { antrag: __BUILD_DAY__, alt: preset.alt ?? 'gas20', kosten: preset.kosten ?? 32000, zve: 45000, kind: '0', flaeche: 140, klasse: 'E', land: 'Nordrhein-Westfalen', neu: preset.neu ?? 'wp', geb: preset.gebaeude ?? 'efh', we: 1, mea: 0, sn: '1', eu: '1', jaz: P.technik.jaz_luft_messung, strom: 'getrennt', verbrauch: 0, altInv: 0 };
  const [antrag, setAntrag] = useState(d.antrag);
  const [alt, setAlt] = useState(d.alt);
  const [kosten, setKosten] = useState(d.kosten);
  const [zve, setZve] = useState(d.zve);
  const [kind, setKind] = useState(d.kind);
  const [flaeche, setFlaeche] = useState(d.flaeche);
  const [klasse, setKlasse] = useState(d.klasse);
  const [land, setLand] = useState(d.land);
  const [neu, setNeu] = useState<string>(d.neu);
  const [geb, setGeb] = useState<string>(d.geb);
  const [we, setWe] = useState(d.we);
  const [mea, setMea] = useState(d.mea);
  const [sn, setSn] = useState(d.sn);
  const [eu, setEu] = useState(d.eu);
  const [jaz, setJaz] = useState(d.jaz);
  const [strom, setStrom] = useState(d.strom);
  const [verbrauch, setVerbrauch] = useState(d.verbrauch);
  const [altInv, setAltInv] = useState(d.altInv);
  useEffect(() => {
    const u = readParams(window.location.search);
    setAntrag(clampDate(str(u, 'd', new Date().toISOString().slice(0, 10))));
    if (![...u.keys()].length) return;
    setAlt(str(u, 'a', d.alt)); setKosten(num(u, 'k', d.kosten)); setZve(num(u, 'z', d.zve)); setKind(str(u, 'c', d.kind)); setFlaeche(num(u, 'm', d.flaeche));
    setKlasse(str(u, 'e', d.klasse)); setLand(str(u, 'l', d.land)); setNeu(str(u, 'n', d.neu)); setGeb(str(u, 'g', d.geb)); setWe(num(u, 'we', d.we)); setMea(num(u, 'mea', d.mea));
    setSn(str(u, 's', d.sn)); setEu(str(u, 'eu', d.eu)); setJaz(num(u, 'j', d.jaz)); setStrom(str(u, 'st', d.strom)); setVerbrauch(num(u, 'v', 0)); setAltInv(num(u, 'ai', 0));
  }, []);
  useEffect(() => { updateURL({ d: antrag, a: alt, k: kosten, z: zve, c: kind, m: flaeche, e: klasse, l: land, n: neu, g: geb, we, mea, s: sn, eu, j: jaz, st: strom, v: verbrauch, ai: altInv }); },
    [antrag, alt, kosten, zve, kind, flaeche, klasse, land, neu, geb, we, mea, sn, eu, jaz, strom, verbrauch, altInv]);

  const a = ALT_OPT.find((o) => o.value === alt) ?? ALT_OPT[1];
  const gebaeude = geb as Gebaeude;
  const einheiten = gebaeude === 'efh' ? 1 : Math.max(2, Math.round(we) || 2);
  const datum = clampDate(antrag);
  const eingabe = { antrag: datum, gebaeude, einheiten, kosten, selbstnutzer: sn === '1', mea: gebaeude === 'weg' && mea > 0 ? mea / 100 : undefined, alt: a.alt, altJahre: a.jahre, neu: neu as NeuHeizung, wpEU: eu === '1', zve, kind: kind === '1' };
  const r = useMemo(() => foerderung(eingabe), [datum, gebaeude, einheiten, kosten, sn, mea, a.alt, a.jahre, neu, eu, zve, kind]);

  // Laufende Kosten: nur wenn die alte Heizung einen Preis hat und die neue eine Wärmepumpe ist.
  const wpCt = wpStromOpt(lang).find((o) => o.value === strom)?.ct ?? P.preise.wp_strom_getrennt_ct;
  const pr = { ...STANDARDPREISE, wpCt };
  const q = nutzwaerme({ flaeche, klasse: klasse as Klasse, land, verbrauch: verbrauch > 0 ? verbrauch : undefined, heute: a.system });
  const vorher = a.system ? laufend(a.system, q, pr) : null;
  const nachher = neu === 'wp' ? laufend('wp_luft', q, pr, { jaz }) : null;
  const am = vorher && nachher ? amortisation(r.eigenanteil, altInv, vorher.kosten, nachher.kosten) : null;

  // Zeitleiste: heute und die nächsten Stichtage, an denen Bonus oder Höchstbetrag sinken.
  const termine = [datum, ...stichtage().filter((s) => s > datum)].slice(0, 5);
  const zeit = verlauf(eingabe, termine);
  const maxZ = Math.max(...zeit.map((z) => z.zuschuss), 1);

  const rows: Zeile[] = [
    { label: tx(lang, `Förderfähige Kosten (Höchstbetrag ${f.eur(r.hoechstbetrag)})`, `Eligible costs (cap ${f.eur(r.hoechstbetrag)})`), value: f.eur(r.foerderfaehig) },
    { label: tx(lang, `Grundförderung ${f.pct(r.grundSatz, 0)}`, `Basic grant ${f.pct(r.grundSatz, 0)}`), value: f.eur(r.grund) },
  ];
  if (r.kgbSatz > 0) rows.push({ label: tx(lang, 'Klimageschwindigkeitsbonus', 'Climate speed bonus'), value: f.pct(r.kgbSatz, 0), muted: true });
  if (r.ebSatz > 0) rows.push({ label: tx(lang, 'Einkommensbonus', 'Income bonus'), value: f.pct(r.ebSatz, 0), muted: true });
  if (r.bonus > 0) rows.push({ label: tx(lang, `Boni zusammen, gedeckelt auf ${f.pct(r.deckel, 0)}`, `Bonuses, capped at ${f.pct(r.deckel, 0)} in total`), value: f.eur(r.bonus) });
  rows.push({ label: tx(lang, 'Zuschuss', 'Grant'), value: f.eur(r.zuschuss), strong: true, sep: true });
  rows.push({ label: tx(lang, 'Ihr Eigenanteil', 'Your share of the cost'), value: f.eur(r.eigenanteil), strong: true });
  if (vorher && nachher) {
    rows.push({ label: tx(lang, `Heizkosten heute (${systemName(a.system!, lang)})`, `Running cost today (${systemName(a.system!, lang)})`), value: tx(lang, `${f.eur(vorher.kosten)} im Jahr`, `${f.eur(vorher.kosten)} a year`), sep: true });
    rows.push({ label: tx(lang, `Mit Wärmepumpe (JAZ ${f.num(jaz, 1)})`, `With a heat pump (SPF ${f.num(jaz, 1)})`), value: tx(lang, `${f.eur(nachher.kosten)} im Jahr`, `${f.eur(nachher.kosten)} a year`) });
    rows.push({ label: am!.ersparnis >= 0 ? tx(lang, 'Ersparnis im Jahr', 'Saving a year') : tx(lang, 'Mehrkosten im Jahr', 'Extra cost a year'), value: f.eur(Math.abs(am!.ersparnis)), strong: true });
    rows.push({ label: tx(lang, 'Eigenanteil eingespielt nach', 'Your share recovered after'), value: am!.jahre === null ? tx(lang, 'nicht über die Heizkosten', 'not through running costs') : tx(lang, `${f.num(am!.jahre, 1)} Jahren`, `${f.num(am!.jahre, 1)} years`), muted: true });
  }

  const steps = [
    r.regime === 'alt'
      ? tx(lang, `Antrag vor dem 21.07.2026: alte Richtlinie vom 21.12.2023, Höchstbetrag ${f.eur(F.alt.hoechst_erste_we)} für die erste Wohnung, Deckel ${f.pct(F.alt.deckel, 0)}.`, `Application before 21 July 2026: old guideline of 21 Dec 2023, cap ${f.eur(F.alt.hoechst_erste_we)} for the first home, ceiling ${f.pct(F.alt.deckel, 0)}.`)
      : tx(lang, `Antrag am ${dt(datum)}: Richtlinie vom 17.08.2026 (in Kraft seit 21.07.2026). Höchstbetrag der ersten Wohnung an diesem Tag: ${f.eur(hoechstbetrag(datum, 1))}.`, `Application on ${dt(datum)}: guideline of 17 Aug 2026 (in force since 21 July 2026). Cap for the first home on that day: ${f.eur(hoechstbetrag(datum, 1))}.`),
    tx(lang, `Förderfähig sind höchstens ${f.eur(r.hoechstbetrag)}${einheiten > 1 ? ` (${einheiten} Wohneinheiten)` : ''}; von ${f.eur(kosten)} zählen ${f.eur(r.foerderfaehig)}.`, `At most ${f.eur(r.hoechstbetrag)} is eligible${einheiten > 1 ? ` (${einheiten} homes)` : ''}; of ${f.eur(kosten)}, ${f.eur(r.foerderfaehig)} counts.`),
    tx(lang, `Grundförderung ${f.pct(r.grundSatz, 0)} = ${f.eur(r.grund)}${gebaeude === 'weg' ? ' (Ihr Anteil nach Miteigentum)' : ''}.`, `Basic grant ${f.pct(r.grundSatz, 0)} = ${f.eur(r.grund)}${gebaeude === 'weg' ? ' (your share by ownership)' : ''}.`),
    sn === '1'
      ? tx(lang, `Boni der selbst bewohnten Einheit: Klimageschwindigkeit ${f.pct(r.kgbSatz, 0)}, Einkommen ${f.pct(r.ebSatz, 0)} (zvE ${f.eur(zve)}${kind === '1' ? ` minus ${f.eur(F.familienzuschlag)} Familienzuschlag` : ''}). Gesamtsatz ${f.pct(r.satzEigen, 0)}, höchstens ${f.pct(r.deckel, 0)}, auf ${f.eur(r.anteilEigen)}: Bonus ${f.eur(r.bonus)}.`, `Bonuses for the home you live in: climate speed ${f.pct(r.kgbSatz, 0)}, income ${f.pct(r.ebSatz, 0)} (taxable income ${f.eur(zve)}${kind === '1' ? ` minus ${f.eur(F.familienzuschlag)} family allowance` : ''}). Total rate ${f.pct(r.satzEigen, 0)}, at most ${f.pct(r.deckel, 0)}, on ${f.eur(r.anteilEigen)}: bonus ${f.eur(r.bonus)}.`)
      : tx(lang, 'Vermietet oder nicht selbst bewohnt: nur die Grundförderung, keine Boni.', 'Let or not lived in by you: basic grant only, no bonuses.'),
  ];
  if (vorher && nachher) steps.push(tx(lang,
    `Wärmebedarf ${f.num(q)} kWh im Jahr (${verbrauch > 0 ? 'aus Ihrem Verbrauch' : `${f.num(flaeche)} m², Klasse ${klasse}, Klima ${land}`}, Kesselnutzungsgrad ${f.pct(P.annahmen.nutzungsgrad_kessel, 1)}). Wärmepumpe: ${f.num(nachher.menge)} kWh Strom × ${f.num(wpCt, 2)} ct.`,
    `Heat demand ${f.num(q)} kWh a year (${verbrauch > 0 ? 'from your consumption' : `${f.num(flaeche)} m², class ${klasse}, ${land} climate`}, boiler efficiency ${f.pct(P.annahmen.nutzungsgrad_kessel, 1)}). Heat pump: ${f.num(nachher.menge)} kWh of electricity × ${f.num(wpCt, 2)} ct.`));

  const einheit = a.system === 'oel' ? tx(lang, 'Liter Heizöl im Jahr', 'litres of oil a year') : tx(lang, 'kWh im Jahr laut Rechnung', 'kWh a year on your bill');
  return (
    <div className={rahmen} data-chrome>
      <div className="srg h-1.5" aria-hidden="true" />
      <div className={raster}>
        <form onSubmit={(e) => e.preventDefault()} className="space-y-5">
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <DateField id="fo-d" label={tx(lang, 'Datum des Antrags', 'Application date')} value={antrag} onChange={setAntrag} min={MIN} max={MAX} />
            <SelectField id="fo-a" label={tx(lang, 'Heizung heute', 'Current heating')} value={alt} onChange={setAlt} options={altOpt(lang)} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <NumberField id="fo-k" label={tx(lang, 'Kosten der neuen Heizung', 'Cost of the new system')} value={kosten} onChange={setKosten} unit="€" max={500000} lang={lang} help={tx(lang, 'brutto, mit Einbau', 'gross, installed')} />
            <NumberField id="fo-z" label={tx(lang, 'Zu versteuerndes Einkommen', 'Taxable household income')} value={zve} onChange={setZve} unit="€" max={1000000} lang={lang} help={tx(lang, 'Haushalt, Schnitt aus zwei Steuerbescheiden', 'household, average of two tax assessments')} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <SelectField id="fo-c" label={tx(lang, 'Kind unter 18 im Haushalt', 'Child under 18 at home')} value={kind} onChange={setKind} options={janein(lang)} />
            <SelectField id="fo-l" label={tx(lang, 'Bundesland', 'Federal state')} value={land} onChange={setLand} options={landOpt(lang)} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-4">
            <NumberField id="fo-m" label={tx(lang, 'Wohnfläche', 'Living space')} value={flaeche} onChange={setFlaeche} unit="m²" max={2000} lang={lang} />
            <SelectField id="fo-e" label={tx(lang, 'Effizienzklasse (Energieausweis)', 'Efficiency class (energy certificate)')} value={klasse} onChange={setKlasse} options={klasseOpt(lang)} />
          </div>
          <details className="rounded-lg border border-navy-200 p-3">
            <summary className="cursor-pointer text-sm font-medium text-navy-800">{tx(lang, 'Weitere Angaben: Gebäude, Heizung, Preise', 'More options: building, system, prices')}</summary>
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-4">
              <SelectField id="fo-n" label={tx(lang, 'Neue Heizung', 'New system')} value={neu} onChange={setNeu} options={neuOpt(lang)} />
              <SelectField id="fo-g" label={tx(lang, 'Gebäude', 'Building')} value={geb} onChange={setGeb} options={gebOpt(lang)} />
              {gebaeude !== 'efh' && <NumberField id="fo-we" label={tx(lang, 'Wohneinheiten im Haus', 'Homes in the building')} value={einheiten} onChange={setWe} max={200} lang={lang} plain />}
              {gebaeude === 'weg' && <NumberField id="fo-mea" label={tx(lang, 'Ihr Miteigentumsanteil', 'Your ownership share')} value={mea} onChange={setMea} unit="%" max={100} decimals={1} lang={lang} help={tx(lang, 'leer: gleiche Anteile', 'empty: equal shares')} />}
              <SelectField id="fo-s" label={tx(lang, 'Sie wohnen selbst dort', 'You live there yourself')} value={sn} onChange={setSn} options={janein(lang)} />
              {neu === 'wp' && <SelectField id="fo-eu" label={tx(lang, 'Wärmepumpe aus der EU', 'Heat pump made in the EU')} value={eu} onChange={setEu} options={janein(lang)} help={tx(lang, 'zählt erst ab dem 1. Quartal 2027', 'matters from Q1 2027 only')} />}
              <NumberField id="fo-v" label={tx(lang, 'Verbrauch heute, falls bekannt', 'Current consumption, if known')} value={verbrauch} onChange={setVerbrauch} max={200000} lang={lang} help={einheit} />
              {neu === 'wp' && <NumberField id="fo-j" label={tx(lang, 'Jahresarbeitszahl', 'Seasonal performance factor')} value={jaz} onChange={setJaz} decimals={1} max={6} lang={lang} help={tx(lang, `gemessen im Altbau: ${f.num(P.technik.jaz_luft_messung, 1)}`, `measured in older homes: ${f.num(P.technik.jaz_luft_messung, 1)}`)} />}
              {neu === 'wp' && <SelectField id="fo-st" label={tx(lang, 'Strom für die Wärmepumpe', 'Electricity for the heat pump')} value={strom} onChange={setStrom} options={wpStromOpt(lang)} />}
              <NumberField id="fo-ai" label={tx(lang, 'Kosten einer neuen Gasheizung zum Vergleich', 'Cost of a new gas boiler, for comparison')} value={altInv} onChange={setAltInv} unit="€" max={100000} lang={lang} help={tx(lang, '0: alte Heizung bliebe', '0: old system would stay')} />
            </div>
          </details>
        </form>
        <div aria-live="polite" data-resultat className={kasten}>
          <Kopf label={tx(lang, 'Ihr Zuschuss', 'Your grant')} wert={f.eur(r.zuschuss)} unter={tx(lang, `${f.pct(r.foerderfaehig > 0 ? r.zuschuss / r.eigeneKosten : 0, 0)} der Kosten, Antrag am ${dt(datum)}`, `${f.pct(r.foerderfaehig > 0 ? r.zuschuss / r.eigeneKosten : 0, 0)} of the cost, applying on ${dt(datum)}`)} />
          {r.unsicher && <p className="mt-2 rounded-md bg-amber-50 p-2 text-xs text-amber-900">{tx(lang, 'Ab dem 1. Quartal 2027 sinkt die Grundförderung für Wärmepumpen ohne EU-Herkunft auf 15 %. Der Starttag ist noch nicht veröffentlicht: Der Betrag kann niedriger ausfallen.', 'From Q1 2027 the basic grant for heat pumps not made in the EU falls to 15%. The start date has not been published, so the amount may be lower.')}</p>}
          <Zeilen rows={rows} />
          {zeit.length > 1 && (
            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-navy-600">{tx(lang, 'Was Warten kostet', 'What waiting costs')}</p>
              <ul className="mt-1 space-y-1">
                {zeit.map((z) => (
                  <li key={z.datum} className="grid grid-cols-[6.5rem_1fr_5.5rem] items-center gap-2 text-xs tabular-nums">
                    <span className="text-navy-700">{dt(z.datum)}</span>
                    <span className="frist-bar block h-2 rounded"><span className="frist-fill block h-2 rounded" style={{ width: `${(z.zuschuss / maxZ) * 100}%` }} /></span>
                    <span className="text-right font-medium text-navy-900">{f.eur(z.zuschuss)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <Rechenweg lang={lang} steps={steps} />
          <Aktionen lang={lang} text={() => tx(lang, `Heizungsförderung bei Antrag am ${dt(datum)}: ${f.eur(r.zuschuss)} Zuschuss, Eigenanteil ${f.eur(r.eigenanteil)}`, `Heating grant applying on ${dt(datum)}: ${f.eur(r.zuschuss)}, own share ${f.eur(r.eigenanteil)}`)} />
          <Hinweis lang={lang} methodHref={methodHref} />
        </div>
      </div>
    </div>
  );
}

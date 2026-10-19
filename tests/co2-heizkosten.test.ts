/** CO₂-Faktoren (EBeV 2030 Anlage 2), Stufentabelle CO2KostAufG, Heizkosten je Land. */
import { describe, expect, it } from 'vitest';
import { kgJeLiterOel, kgJeKwhGas, co2Kosten, aufschlagCent, mieterAnteil, aufteilung, preisJahr, kwhJeLiterOel } from '../src/lib/engine/co2';
import { nutzwaerme, laufend, klimafaktor, amortisation, vergleich, LAENDER } from '../src/lib/engine/heizkosten';

describe('CO₂-Faktoren', () => {
  it('Heizöl EL: 2,676 kg je Liter, 10,05 kWh je Liter', () => { expect(kgJeLiterOel).toBeCloseTo(2.676, 3); expect(kwhJeLiterOel).toBeCloseTo(10.046, 2); });
  it('Erdgas: 0,1814 kg je kWh (Brennwert)', () => expect(kgJeKwhGas).toBeCloseTo(0.1814, 4));
  it('Aufschlag bei 55 €: 14,7 ct/l Öl und 1,00 ct/kWh Gas netto', () => {
    expect(aufschlagCent('oel', 55, false)).toBeCloseTo(14.7, 1);
    expect(aufschlagCent('gas', 55, false)).toBeCloseTo(1.0, 1);
    expect(aufschlagCent('oel', 65, true)).toBeCloseTo(20.7, 1);
  });
  it('2.000 l Öl bei 65 €/t mit MwSt', () => expect(co2Kosten('oel', 2000, 65)).toBeCloseTo(2000 * 2.676 / 1000 * 65 * 1.19, 0));
  it('Preisstatus je Jahr', () => {
    expect(preisJahr(2025)).toMatchObject({ min: 55, status: 'fest' });
    expect(preisJahr(2026)).toMatchObject({ min: 55, max: 65, status: 'korridor' });
    expect(preisJahr(2027).status).toBe('beschlossen');
    expect(preisJahr(2028).status).toBe('offen');
  });
});

describe('CO2KostAufG', () => {
  it('Stufengrenzen', () => {
    expect(mieterAnteil(11.9)).toBe(1); expect(mieterAnteil(12)).toBe(0.9); expect(mieterAnteil(31.9)).toBe(0.6);
    expect(mieterAnteil(32)).toBe(0.5); expect(mieterAnteil(51.9)).toBe(0.2); expect(mieterAnteil(52)).toBe(0.05);
  });
  it('Wohnung 70 m², 15.000 kWh Gas: 38,9 kg/m², Vermieter 60 %', () => {
    const a = aufteilung({ stoff: 'gas', menge: 15000, flaeche: 70, preis: 65, einschraenkung: false });
    expect(a.kgM2).toBeCloseTo(38.9, 1); expect(a.vermieter).toBeCloseTo(0.6); expect(a.mieterEuro + a.vermieterEuro).toBeCloseTo(a.kosten, 1);
  });
  it('§ 9 halbiert den Vermieteranteil', () => {
    const a = aufteilung({ stoff: 'gas', menge: 15000, flaeche: 70, preis: 65, einschraenkung: true });
    expect(a.vermieter).toBeCloseTo(0.3);
  });
  it('Neue Gasheizung ab 2028: hälftig', () => {
    const a = aufteilung({ stoff: 'gas', menge: 6000, flaeche: 100, preis: 65, einschraenkung: false, neueFossile: true, jahr: 2028 });
    expect(a.mieter).toBe(0.5);
  });
});

describe('Heizkosten', () => {
  it('16 Länder mit Klimafaktor zwischen 0,85 und 1,1', () => {
    expect(LAENDER.length).toBe(16);
    for (const l of LAENDER) { expect(klimafaktor(l)).toBeGreaterThan(0.85); expect(klimafaktor(l)).toBeLessThan(1.1); }
  });
  it('20.000 kWh Gas: gleiche Wärme zurück, Wärmepumpe billiger', () => {
    const q = nutzwaerme({ verbrauch: 20000, heute: 'gas', land: 'Hessen' });
    expect(q).toBeCloseTo(20000 * 0.903 * 0.866, 0);
    const g = laufend('gas', q)!; expect(g.menge).toBeCloseTo(20000, 0); expect(g.kosten).toBeCloseTo(2316, 0);
    const w = laufend('wp_luft', q)!; expect(w.kosten).toBeLessThan(g.kosten);
  });
  it('Thüringen braucht mehr Wärme als Hessen bei gleicher Klasse', () => {
    const a = nutzwaerme({ flaeche: 140, klasse: 'E', land: 'Thüringen' }); const b = nutzwaerme({ flaeche: 140, klasse: 'E', land: 'Hessen' });
    expect(a).toBeGreaterThan(b);
  });
  it('Fernwärme nur mit eigenem Preis', () => {
    expect(laufend('fernwaerme', 10000)).toBeNull();
    expect(vergleich(10000).some((x) => x.system === 'fernwaerme')).toBe(false);
  });
  it('Amortisation', () => {
    expect(amortisation(12000, 10000, 2300, 1500).jahre).toBe(2.5);
    expect(amortisation(8000, 10000, 2300, 1500).jahre).toBe(0);
    expect(amortisation(12000, 0, 1500, 1600).jahre).toBeNull();
  });
});

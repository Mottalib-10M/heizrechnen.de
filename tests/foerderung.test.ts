/** Beispiele von kfw.de/458 (gelesen am 2026-10-19) und Stichtage der Richtlinie BEG EM vom 17.08.2026. */
import { describe, expect, it } from 'vitest';
import { foerderung, hoechstbetrag, kgbSatz, ebSatz, deckel, type FoerderEingabe } from '../src/lib/engine/foerderung';

const basis: FoerderEingabe = { antrag: '2026-10-19', gebaeude: 'efh', einheiten: 1, kosten: 30000, selbstnutzer: true, alt: 'gas', altJahre: 10, neu: 'wp', wpEU: true, zve: 80000, kind: false };

describe('Beispiele der KfW', () => {
  it('Becker: Haus mit Einliegerwohnung, 41.000 €, Öl → 15.580 €', () => {
    const r = foerderung({ ...basis, gebaeude: 'mfh', einheiten: 2, kosten: 41000, alt: 'oel' });
    expect(r.hoechstbetrag).toBe(43000); expect(r.grund).toBe(12300); expect(r.bonus).toBe(3280); expect(r.zuschuss).toBe(15580);
  });
  it('WEG mit 7 Einheiten: Basisantrag 33.300 €', () => {
    const r = foerderung({ ...basis, gebaeude: 'weg', einheiten: 7, kosten: 140000, selbstnutzer: false, alt: 'gas', altJahre: 25, mea: 0.15 });
    expect(r.hoechstbetrag).toBe(111000); expect(r.grundGebaeude).toBe(33300);
  });
  it('WEG Wohnung 1: 50.000 € zvE, Gas 25 Jahre → Zusatzantrag 4.122,86 €', () => {
    const r = foerderung({ ...basis, gebaeude: 'weg', einheiten: 7, kosten: 140000, alt: 'gas', altJahre: 25, mea: 0.15, zve: 50000 });
    expect(r.anteilEigen).toBeCloseTo(15857.14, 2); expect(r.bonus).toBeCloseTo(4122.86, 2);
  });
  it('WEG Wohnung 3: 50.000 € mit Kind → 70 % gedeckelt, 6.342,86 €', () => {
    const r = foerderung({ ...basis, gebaeude: 'weg', einheiten: 7, kosten: 140000, alt: 'gas', altJahre: 25, mea: 0.15, zve: 50000, kind: true });
    expect(r.ebSatz).toBe(0.3); expect(r.satzEigen).toBeCloseTo(0.7); expect(r.bonus).toBeCloseTo(6342.86, 2);
  });
  it('WEG Wohnung 7: 30.000 € zvE, Anteil 12 % → 80 % gedeckelt, 6.660 €', () => {
    const r = foerderung({ ...basis, gebaeude: 'weg', einheiten: 7, kosten: 140000, alt: 'gas', altJahre: 25, mea: 0.12, zve: 30000 });
    expect(r.anteilEigen).toBe(13320); expect(r.deckel).toBe(0.8); expect(r.bonus).toBeCloseTo(6660, 2);
  });
  it('Förster: Klima-Split im Sondereigentum, 5 Einheiten, 20.000 € → 8.096 €', () => {
    const r = foerderung({ ...basis, gebaeude: 'etw', einheiten: 5, kosten: 20000, alt: 'nachtspeicher', zve: 70000 });
    expect(r.hoechstbetrag).toBe(17600); expect(r.grund).toBe(5280); expect(r.bonus).toBe(2816); expect(r.zuschuss).toBe(8096);
  });
  it('Müller/Schmitz: Pellets 35.000 €, Gas 10 Jahre, 47.000 € → 11.200 €', () => {
    const r = foerderung({ ...basis, kosten: 35000, neu: 'biomasse', alt: 'gas', altJahre: 10, zve: 47000 });
    expect(r.foerderfaehig).toBe(28000); expect(r.kgbSatz).toBe(0); expect(r.ebSatz).toBe(0.1); expect(r.zuschuss).toBe(11200);
  });
});

describe('Stichtage der Richtlinie', () => {
  it('Klimageschwindigkeitsbonus 16 → 12 → 8 → 4 → 0', () => {
    expect(kgbSatz('2027-01-31', 'oel', 5).satz).toBe(0.16);
    expect(kgbSatz('2027-02-01', 'oel', 5).satz).toBe(0.12);
    expect(kgbSatz('2027-08-01', 'oel', 5).satz).toBe(0.08);
    expect(kgbSatz('2028-07-31', 'oel', 5).satz).toBe(0.04);
    expect(kgbSatz('2028-08-01', 'oel', 5).satz).toBe(0);
    expect(kgbSatz('2026-10-19', 'gas', 19).satz).toBe(0);
    expect(kgbSatz('2026-10-19', 'gas', 20).satz).toBe(0.16);
    expect(kgbSatz('2026-07-20', 'oel', 5).satz).toBe(0.2);
  });
  it('Höchstbetrag erste Einheit: 30.000 alt, 28.000, 27.250 ab Februar 2027, 22.000 ab August 2030', () => {
    expect(hoechstbetrag('2026-07-20', 1)).toBe(30000);
    expect(hoechstbetrag('2026-07-21', 1)).toBe(28000);
    expect(hoechstbetrag('2027-02-01', 1)).toBe(27250);
    expect(hoechstbetrag('2030-08-01', 1)).toBe(22000);
    expect(hoechstbetrag('2026-10-19', 8)).toBe(28000 + 5 * 15000 + 2 * 8000);
  });
  it('Einkommensbonus an den Grenzen, mit Familienzuschlag', () => {
    expect(ebSatz('2026-10-19', 30000, false)).toBe(0.4); expect(ebSatz('2026-10-19', 30001, false)).toBe(0.3);
    expect(ebSatz('2026-10-19', 50000, false)).toBe(0.1); expect(ebSatz('2026-10-19', 50001, false)).toBe(0);
    expect(ebSatz('2026-10-19', 60000, true)).toBe(0.1); expect(ebSatz('2026-10-19', 60001, true)).toBe(0);
    expect(ebSatz('2026-10-19', 40000, true)).toBe(0.4);
    expect(ebSatz('2026-07-20', 40000, false)).toBe(0.3); expect(ebSatz('2026-07-20', 40001, false)).toBe(0);
  });
  it('Deckel 80 % bis 30.000 € (40.000 € mit Kind), sonst 70 %', () => {
    expect(deckel('2026-10-19', 30000, false, true)).toBe(0.8); expect(deckel('2026-10-19', 30001, false, true)).toBe(0.7);
    expect(deckel('2026-10-19', 40000, true, true)).toBe(0.8); expect(deckel('2026-07-20', 20000, false, true)).toBe(0.7);
  });
  it('Einfamilienhaus, Öl, 25.000 € zvE: 80 % von 28.000 € = 22.400 €', () => {
    expect(foerderung({ ...basis, alt: 'oel', zve: 25000 }).zuschuss).toBe(22400);
  });
  it('Antrag vor dem 21.07.2026: 30 + 20 + 5 Effizienz + 30 Einkommen, gedeckelt auf 70 % von 30.000 €', () => {
    const r = foerderung({ ...basis, antrag: '2026-06-01', alt: 'oel', zve: 35000, effizienz: true });
    expect(r.regime).toBe('alt'); expect(r.zuschuss).toBe(21000);
  });
  it('Wärmepumpe ohne EU-Ursprung ab April 2027: 15 %; im ersten Quartal unsicher', () => {
    expect(foerderung({ ...basis, antrag: '2027-04-01', wpEU: false }).grundSatz).toBe(0.15);
    expect(foerderung({ ...basis, antrag: '2027-04-01', wpEU: true }).grundSatz).toBeCloseTo(0.3);
    expect(foerderung({ ...basis, antrag: '2027-02-15', wpEU: false }).unsicher).toBe(true);
    expect(foerderung({ ...basis, antrag: '2027-04-01', neu: 'biomasse', wpEU: false }).grundSatz).toBe(0.3);
  });
  it('Vermietetes Haus: nur Grundförderung', () => {
    const r = foerderung({ ...basis, selbstnutzer: false, alt: 'oel', zve: 20000 });
    expect(r.zuschuss).toBe(8400); expect(r.bonus).toBe(0);
  });
});

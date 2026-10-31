/**
 * Jour de la demande des mini-calculs (audit de Sami du 2026-10-28) : comme le grand calculateur, ils
 * comptent au jour du navigateur, borné à la durée de la Richtlinie BEG EM ; aucun libellé ne fige une date.
 * Paliers du Klimageschwindigkeitsbonus : Richtlinie BEG EM vom 17.08.2026, Nr. 8.4.4 (16 % → 12 % le 01.02.2027 → 8 % le 01.08.2027).
 */
import { describe, expect, it } from 'vitest';
import { antragstag, heuteISO, ANTRAG_MIN } from '../src/lib/engine/foerderung';
import { P } from '../src/lib/engine/params';
import { getSpec } from '../src/lib/mini-specs';

describe('antragstag / heuteISO', () => {
  it('date locale du navigateur, au format ISO', () => {
    expect(heuteISO(new Date(2027, 2, 5, 23, 30))).toBe('2027-03-05');
  });
  it('bornée à la Richtlinie, valeur de repli si invalide', () => {
    expect(antragstag('2027-03-05', 'x')).toBe('2027-03-05');
    expect(antragstag('2020-01-01', 'x')).toBe(ANTRAG_MIN);
    expect(antragstag('2035-01-01', 'x')).toBe(P.foerderung.richtlinie_ende);
    expect(antragstag('kaputt', '2026-10-31')).toBe('2026-10-31');
  });
});

describe('mini « warten » au jour de la demande', () => {
  const run = (tag: string, t: number) => getSpec('warten', 'de', tag).run({ t, k: 30000, a: 0 });
  it('le 31.10.2026 : 16 % aujourd’hui, 12 % au 01.02.2027', () => {
    const o = run('2026-10-31', 1);
    expect(o.rows[0][1]).toMatch(/^12\s?%$/);
    expect(o.rows[1][1]).not.toBe(o.head[1]);
  });
  it('le 05.03.2027 : « heute » vaut déjà 12 %, la date suivante est le 01.08.2027 (8 %)', () => {
    const s = getSpec('warten', 'de', '2027-03-05');
    const opt = s.inputs.find((i) => i.id === 't')!.options!;
    expect(opt[0].label).toBe('heute (5. März 2027)');
    expect(opt[1].label).toContain('1. August 2027');
    expect(s.run({ t: 0, k: 30000, a: 0 }).rows[0][1]).toMatch(/^12\s?%$/);
    expect(s.run({ t: 1, k: 30000, a: 0 }).rows[0][1]).toMatch(/^8\s?%$/);
  });
  it('aucun libellé « Stand » / « as of » figé', () => {
    for (const l of ['de', 'en']) {
      const labels = getSpec('warten', l, '2026-10-31').inputs.flatMap((i) => i.options?.map((o) => o.label) ?? []);
      expect(labels.join(' ')).not.toMatch(/Stand|as of/);
    }
  });
  it('les autres minis de subvention suivent le jour passé', () => {
    const avant = getSpec('zuschuss', 'de', '2026-10-31').run({ k: 30000, z: 80000, a: 0, c: 0 });
    const apres = getSpec('zuschuss', 'de', '2027-03-05').run({ k: 30000, z: 80000, a: 0, c: 0 });
    expect(avant.head[1]).not.toBe(apres.head[1]);
  });
});

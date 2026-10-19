/** Kommunale Wärmeplanung: Frist nach der Einwohnerzahl der Gemeinde (§ 4 WPG). */
import type { MiniSpec } from '../mini-types';
import { P } from '../engine/params';
import { T, datum, num, type L } from './_kit';
export default (l: L): MiniSpec => ({
  title: T(l, 'Bis wann Ihre Gemeinde planen muss', 'When your municipality must have a plan'),
  cta: T(l, 'Förderung unabhängig vom Wärmeplan berechnen', 'Work out the grant regardless of the plan'),
  inputs: [{ id: 'e', label: T(l, 'Einwohner der Gemeinde', 'Population of the municipality'), def: 45000, max: 4000000 }],
  run: (v) => {
    const G = P.gesetz, gross = v.e > G.wpg_einwohner_grenze;
    const frist = gross ? G.wpg_gross_frist : G.wpg_klein_frist;
    return {
      head: [T(l, 'Wärmeplan spätestens', 'Heat plan due by'), datum(frist, l)],
      rows: [[T(l, 'Grenze', 'Threshold'), T(l, `${num(G.wpg_einwohner_grenze, l)} Einwohner am 01.01.2024`, `${num(G.wpg_einwohner_grenze, l)} residents on 1 Jan 2024`)], [T(l, 'Folge für Ihre Heizung', 'Effect on your heating'), T(l, 'keine Pflicht mehr', 'no duty any more')]],
      note: T(l, 'Seit dem 29.07.2026 hängt keine Heizungspflicht mehr am Wärmeplan.', 'Since 29 July 2026 no heating duty depends on the heat plan.'),
    };
  },
});

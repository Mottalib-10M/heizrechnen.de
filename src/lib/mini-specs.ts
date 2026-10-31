/**
 * Registre des mini-simulateurs (RECETTE §9.3) : un fichier par sujet dans `lib/minis/<kind>.ts`,
 * chargé ici automatiquement. Chaque fichier exporte `default` : (lang, tag) => MiniSpec, et appelle le
 * moteur du site (lib/engine), jamais un second calcul. `tag` : jour de la demande (ISO), le jour du
 * build au premier rendu puis le jour du navigateur (MiniSim), comme le grand calculateur.
 */
import type { MiniSpec } from './mini-types';
import { P } from './engine/params';
export type Lang = 'de' | 'en';
type Factory = (l: Lang, tag?: string) => MiniSpec;
const mods = import.meta.glob<{ default: (l: Lang, tag: string) => MiniSpec }>(['./minis/*.ts', '!./minis/_*.ts'], { eager: true });
export const MINIS: Record<string, Factory> = Object.fromEntries(
  Object.entries(mods).map(([f, m]) => [f.split('/').pop()!.replace(/\.ts$/, ''), (l: Lang, tag = P.retrieved_at) => m.default(l, tag)]),
);
export function getSpec(kind: string, lang: string, tag?: string): MiniSpec {
  const f = MINIS[kind];
  if (!f) throw new Error(`Unbekannter Mini-Rechner: ${kind} (src/lib/minis/${kind}.ts anlegen)`);
  return f(lang === 'en' ? 'en' : 'de', tag);
}

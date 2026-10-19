/**
 * Ähnlichkeit der Seitentexte vor dem Build (Zahlen neutralisiert), wie check-unique.py auf dist/.
 * node scripts/sim-pages.mjs [id1,id2]   → Paare über 20 %, Ziel unter 26 %.
 */
import { createJiti } from 'jiti';
import { readdirSync } from 'node:fs';
import { SequenceMatcher } from './_seqmatch.mjs';
const jiti = createJiti(import.meta.url);
const { P } = await jiti.import('../src/lib/engine/params.ts');
const mine = process.argv[2]?.split(',');
const pages = [];
for (const d of ['guides', 'rechner']) for (const f of readdirSync(new URL(`../src/content/${d}/`, import.meta.url))) {
  if (!f.endsWith('.ts')) continue;
  const p = (await jiti.import(`../src/content/${d}/${f}`)).default;
  if (!p.de.title) continue;
  for (const l of ['de', 'en']) {
    const h = { lang: l, P, a: (_, t) => t, eur: (n) => String(n), num: (n) => String(n), pct: (x) => String(x), date: (x) => x,
      table: (hd, rows) => [...hd, ...rows.flat()].join(' '), src: (k, t) => t ?? P.sources[k].label[l] };
    const x = p[l];
    const txt = [x.h1, x.intro, x.resume, ...x.faqs.flatMap((q) => [q.q, q.a]), x.body(h)].join(' ');
    pages.push({ k: `${p.id}:${l}`, id: p.id, l, t: txt.replace(/<[^>]+>/g, ' ').replace(/\d[\d\s.,%€-]*/g, '#').replace(/\s+/g, ' ').toLowerCase().slice(0, 12000) });
  }
}
let n = 0;
for (let i = 0; i < pages.length; i++) for (let j = i + 1; j < pages.length; j++) {
  const a = pages[i], b = pages[j];
  if (a.l !== b.l) continue;
  if (mine && !mine.includes(a.id) && !mine.includes(b.id)) continue;
  const r = new SequenceMatcher(a.t.split(' '), b.t.split(' ')).ratio() * 100;
  if (r > 20) { console.log(r.toFixed(1), a.k, b.k); n++; }
}
console.log(`${pages.length / 2} pages, ${n} paires > 20 %`);

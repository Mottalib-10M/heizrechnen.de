/** Ratio à la difflib.SequenceMatcher (sans heuristique junk), sur des listes de mots. */
export class SequenceMatcher {
  constructor(a, b) { this.a = a; this.b = b; this.b2j = new Map(); b.forEach((w, j) => { if (!this.b2j.has(w)) this.b2j.set(w, []); this.b2j.get(w).push(j); }); }
  longest(alo, ahi, blo, bhi) {
    let bi = alo, bj = blo, k = 0, len = new Map();
    for (let i = alo; i < ahi; i++) {
      const nl = new Map();
      for (const j of this.b2j.get(this.a[i]) ?? []) { if (j < blo) continue; if (j >= bhi) break; const v = (len.get(j - 1) ?? 0) + 1; nl.set(j, v); if (v > k) { bi = i - v + 1; bj = j - v + 1; k = v; } }
      len = nl;
    }
    return [bi, bj, k];
  }
  ratio() {
    let m = 0; const q = [[0, this.a.length, 0, this.b.length]];
    while (q.length) { const [alo, ahi, blo, bhi] = q.pop(); const [i, j, k] = this.longest(alo, ahi, blo, bhi);
      if (k) { m += k; if (alo < i && blo < j) q.push([alo, i, blo, j]); if (i + k < ahi && j + k < bhi) q.push([i + k, ahi, j + k, bhi]); } }
    return (2 * m) / (this.a.length + this.b.length || 1);
  }
}

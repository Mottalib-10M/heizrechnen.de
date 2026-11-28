#!/usr/bin/env node
/**
 * check-rendu.mjs — ce que voit le lecteur, menus ouverts, pages intérieures, 4 largeurs (règle du 2026-11-27).
 *
 * Né de la revue Chrome du 2026-11-27 : 16 défauts sur 15 sites tirés au hasard, aucun vu par les contrôles,
 * qui ne regardaient que l'accueil fermé, aux valeurs par défaut, à 390 et 1 280 px.
 *   1. Mots internes visibles (TOUTES les pages du sitemap) : « fait mieux que le premier résultat Google »
 *      (hilfenrechner : la phrase du rapport SERP, MASTERFACTORY §2.1, posée sur la page), SERP, TODO,
 *      lorem ipsum, NaN, undefined, [object Object].
 *   2. Menus du haut OUVERTS (survol puis clic, 1 440 px) et menu ☰ ouvert (390 px) : chaque lien visible
 *      et lisible, contraste ≥ 3 sur le fond réellement peint (canadanetpay : panneau blanc, liens blancs).
 *   3. En-tête et fil d'Ariane lisibles : contraste ≥ 3 (canadanetpay : « GIS Calculator » rouge sur rouge).
 *   4. Graphique vide : barre dont tous les segments ont une largeur nulle (canadanetpay « Salary breakdown » :
 *      la largeur venait d'une animation supprimée le 2026-09-22).
 *   5. Résultat vide : un grand « – », « NaN », « undefined » à la place d'un chiffre (usparcelrates).
 *   6. Grand vide sous une colonne du simulateur (≥ 1 280 px) : formulaire et résultat côte à côte, une colonne
 *      finit 250 px ou plus avant l'autre (8 sites sur 15). Une colonne collante (sticky) est admise.
 *   7. Choix coupé dans une liste déroulante, valeur coupée dans un champ (verifactuhoy, pcndates, « Student Loa »).
 * Pages : l'accueil et une page par rubrique (jusqu'à --pages=8), à 390, 1 280, 1 440 et 1 920 px.
 *
 * Usage : node check-rendu.mjs <dossier-du-site | https://domaine> [--pages=8]
 * Sortie : défauts par page, code 1 s'il y en a. Validé le 2026-11-27 sur des cas connus mauvais
 * (canadanetpay, hilfenrechner, verifactuhoy, taxyearcalc, mydebtpayoff) et bons (globalfinancepro).
 */
import { createServer } from 'node:http';
import { existsSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, resolve } from 'node:path';
import { createRequire } from 'node:module';
import { execSync } from 'node:child_process';

const require = createRequire(import.meta.url);
let chromium;
try { ({ chromium } = require('playwright')); }
catch { ({ chromium } = require(join(execSync('npm root -g').toString().trim(), 'playwright'))); }

const arg = process.argv[2];
const NB = Number((process.argv.find((a) => a.startsWith('--pages=')) || '--pages=8').split('=')[1]);
if (!arg) { console.error('usage: check-rendu.mjs <site-dir | https://domaine> [--pages=8]'); process.exit(2); }

const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.xml': 'application/xml', '.txt': 'text/plain', '.ico': 'image/x-icon', '.woff2': 'font/woff2' };
async function serve(dir) {
  const root = ['dist', 'out'].map((d) => resolve(dir, d)).find((d) => existsSync(d))
    || (existsSync(join(resolve(dir), 'index.html')) ? resolve(dir) : resolve(dir, 'dist'));
  const server = createServer(async (req, res) => {
    const p = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let f = join(root, p);
    try { if ((await stat(f)).isDirectory()) f = join(f, 'index.html'); } catch { f = f + '.html'; }
    try { const body = await readFile(f); res.writeHead(200, { 'content-type': TYPES[extname(f)] || 'application/octet-stream' }); res.end(body); }
    catch { res.writeHead(404); res.end('404'); }
  });
  await new Promise((r) => server.listen(0, '127.0.0.1', r));
  return { base: `http://127.0.0.1:${server.address().port}`, server };
}
async function sitemapUrls(b) {
  const seen = new Set(); const out = new Set(); const todo = [`${b}/sitemap.xml`, `${b}/sitemap-index.xml`];
  while (todo.length) {
    const u = todo.pop(); if (seen.has(u)) continue; seen.add(u);
    const r = await fetch(u).catch(() => null); if (!r || !r.ok) continue;
    for (const [, loc] of (await r.text()).matchAll(/<loc>([^<]+)<\/loc>/g)) {
      const l = loc.trim().replace(/^https?:\/\/[^/]+/, b);
      if (l.endsWith('.xml')) todo.push(l); else out.add(l);
    }
  }
  return [...out];
}

// 1. Mots internes : texte visible du HTML servi, scripts et styles retirés.
const INTERNE = /mieux que (le|les) (premier|1er)s? résultats?|premier résultat (de |sur )?Google|(better than|beats|outdoes) the (first|top) (Google |search )?(results?|hits?)|mejor que el primer resultado|meglio del primo risultato|first (result|hit) (on|in) Google|erste[nr]? Treffer bei Google|besser als (der|die) erste|primer resultado (de|en) Google|primo risultato (di|su) Google|lorem ipsum/i;
const INTERNE_CASSE = /\bSERP\b|\bTODO\b|\bFIXME\b|\[object Object\]|\bNaN\b|\bundefined\b/; // casse exacte : « todo » est de l'espagnol
function texteVisible(html) {
  return html.replace(/<(script|style|noscript|template)[\s\S]*?<\/\1>/gi, ' ').replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;/g, ' ').replace(/\s+/g, ' ');
}

// Exécuté dans la page : outils communs (contraste sur le fond réellement peint, visibilité).
function outils() {
  const vis = (e) => { const r = e.getBoundingClientRect(); return r.width > 1 && r.height > 1 && e.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && !e.closest('details:not([open]) > :not(summary)'); };
  // Toute couleur CSS (rgb, oklch, oklab, color-mix de Tailwind v4…) passe par le canvas : lire les chiffres
  // d'« oklab(1 0 0 / .95) » comme du rgb donnait un fond noir (faux positif sur auspaycalculator, 2026-11-28).
  const cx = document.createElement('canvas').getContext('2d', { willReadFrequently: true }); cx.canvas.width = cx.canvas.height = 1;
  const rgba = (s) => { cx.clearRect(0, 0, 1, 1); cx.fillStyle = 'rgba(0,0,0,0)'; cx.fillStyle = s; cx.fillRect(0, 0, 1, 1); const [r, g, b, a] = cx.getImageData(0, 0, 1, 1).data; return { r, g, b, a: a / 255 }; };
  const lum = ({ r, g, b }) => { const f = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
  const mix = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 });
  // Fond peint derrière e : on remonte les ancêtres ; une image ou un dégradé rend la mesure impossible (null).
  const fond = (e) => {
    const couches = [];
    for (let x = e; x; x = x.parentElement) {
      const cs = getComputedStyle(x);
      if (cs.backgroundImage !== 'none' || cs.borderImageSource !== 'none') return null; // bandeau peint en border-image (24 sites) : non mesurable
      const c = rgba(cs.backgroundColor); if (c.a > 0) { couches.push(c); if (c.a >= 0.99) break; }
    }
    let f = { r: 255, g: 255, b: 255, a: 1 };
    for (const c of couches.reverse()) f = mix(c, f);
    return f;
  };
  const contraste = (e) => {
    const b = fond(e); if (!b) return 21;
    const c = mix(rgba(getComputedStyle(e).color), b);
    const [l1, l2] = [lum(c), lum(b)].sort((x, y) => y - x); return (l1 + 0.05) / (l2 + 0.05);
  };
  const aTexte = (e) => [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  const nom = (e) => (e.textContent || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40);
  const sombre = (e) => { const b = fond(e); return b ? lum(b) < 0.25 : null; };
  window.__r = { vis, contraste, aTexte, nom, sombre };
}

function controlePage(large) {
  const { vis, contraste, aTexte, nom } = window.__r; const pb = [];
  // 3. En-tête et fil d'Ariane lisibles
  for (const e of document.querySelectorAll('header *, nav[aria-label*="riane" i] *, nav[aria-label*="readcrumb" i] *, [class*="breadcrumb" i] *')) {
    if (!vis(e) || !aTexte(e)) continue;
    const c = contraste(e); if (c < 3) { pb.push(`texte illisible dans l'en-tête ou le fil d'Ariane : « ${nom(e)} » (contraste ${c.toFixed(1)})`); break; }
  }
  // 4. Graphique vide : barre (flex, 6 à 60 px de haut) dont tous les segments sont à largeur nulle
  for (const c of document.querySelectorAll('body *')) {
    const cs = getComputedStyle(c); const r = c.getBoundingClientRect();
    if (!cs.display.includes('flex') || cs.flexDirection.startsWith('column') || r.width < 100 || r.height < 6 || r.height > 60 || !vis(c)) continue;
    const kids = [...c.children]; if (kids.length < 1) continue;
    const segs = kids.filter((k) => k.getAttribute('role') === 'img' || /segment|bar/i.test(k.className) || k.style.backgroundColor);
    if (segs.length && segs.length === kids.length && segs.every((k) => k.getBoundingClientRect().width < 2)) { pb.push(`graphique vide : ${segs.length} segment(s) de largeur nulle (« ${nom(segs[0]) || c.className.slice(0, 30)} »)`); break; }
  }
  // 5. Résultat vide
  for (const e of document.querySelectorAll('main *, body > div *')) {
    if (!vis(e) || !aTexte(e)) continue;
    const t = e.textContent.trim();
    if (/^(–|—|-|NaN|undefined|Infinity|\$?NaN|NaN ?€)$/.test(t) && parseFloat(getComputedStyle(e).fontSize) >= 20) { pb.push(`résultat vide : « ${t} » en gros à la place d'un chiffre`); break; }
  }
  // 6. Grand vide sous une colonne du simulateur (bureau)
  if (large) {
    for (const c of document.querySelectorAll('body *')) {
      if (!c.querySelector('input:not([type=hidden]), select')) continue;
      const cs = getComputedStyle(c); if (!(cs.display.includes('grid') || (cs.display.includes('flex') && !cs.flexDirection.startsWith('column')))) continue;
      const cols = [...c.children].filter(vis).filter((k) => k.getBoundingClientRect().width > 200);
      if (cols.length < 2) continue;
      const t0 = Math.round(cols[0].getBoundingClientRect().top);
      const rangee = cols.filter((k) => Math.abs(k.getBoundingClientRect().top - t0) < 12); if (rangee.length < 2) continue;
      const fin = (k) => { let m = k.getBoundingClientRect().top; for (const d of k.querySelectorAll('*')) { if (!vis(d)) continue; const r = d.getBoundingClientRect(); if (r.height < k.getBoundingClientRect().height - 2) m = Math.max(m, r.bottom); } return m; };
      // Collant pour de vrai : un ancêtre en overflow hidden/auto/scroll (avant la page) empêche sticky de coller (netindependant, 2026-11-28).
      const colle = (d) => { if (getComputedStyle(d).position !== 'sticky') return false; for (let x = d.parentElement; x && x !== document.body; x = x.parentElement) { if (/(hidden|auto|scroll|clip)/.test(getComputedStyle(x).overflowY + getComputedStyle(x).overflowX)) return false; } return true; };
      const collant = (k) => [k, ...k.querySelectorAll('*')].some(colle);
      const fins = rangee.map(fin); const max = Math.max(...fins);
      const i = fins.findIndex((f, j) => max - f >= 250 && !collant(rangee[j]));
      if (i >= 0) { pb.push(`grand vide de ${Math.round(max - fins[i])} px sous une colonne du simulateur (l'autre colonne est bien plus haute)`); break; }
    }
  }
  // 8. Bandeau : H1 sur fond sombre ? (comparé à l'accueil côté Node) ; fil d'Ariane posé hors du bandeau (ruban clair)
  const h1 = [...document.querySelectorAll('h1')].find(vis);
  const h1Sombre = h1 ? window.__r.sombre(h1) : null;
  const fil = [...document.querySelectorAll('nav[aria-label*="riane" i], nav[aria-label*="readcrumb" i], [class*="breadcrumb" i]')].find(vis);
  if (h1 && fil && h1Sombre === true && window.__r.sombre(fil) === false && fil.getBoundingClientRect().bottom <= h1.getBoundingClientRect().top + 2)
    pb.push('fil d\'Ariane hors du bandeau : ruban clair entre l\'en-tête et le bandeau du titre');
  // 9. Couture : deux blocs du bandeau peints jusqu'aux bords (box-shadow d'étalement) collés l'un sous l'autre
  { const etales = [...document.querySelectorAll('body *')].filter((e) => { const cs = getComputedStyle(e); if (cs.boxShadow === 'none' || !vis(e)) return false; const m = cs.boxShadow.match(/(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+(-?\d+(?:\.\d+)?)px\s+(\d+(?:\.\d+)?)px/); return m && +m[4] >= 100 && window.__r.sombre(e) === true; });
    for (const a of etales) for (const b of etales) { if (a === b || a.contains(b) || b.contains(a)) continue; const ra = a.getBoundingClientRect(), rb = b.getBoundingClientRect();
      if (Math.abs(ra.bottom - rb.top) <= 2 && Math.abs(ra.left - rb.left) < 4) { pb.push('couture dans le bandeau : deux blocs peints jusqu\'aux bords collés l\'un sous l\'autre (un seul conteneur pour tout le bandeau)'); break; } } }
  // 10. Tableau coupé sur mobile sans indice de défilement
  if (!large) for (const t of document.querySelectorAll('table')) { if (!vis(t)) continue; const c = t.parentElement; if (t.scrollWidth > c.clientWidth + 8 && /(auto|scroll)/.test(getComputedStyle(c).overflowX) && !c.closest('[data-indice-defilement]') && !c.parentElement.querySelector('[data-indice-defilement]')) { pb.push('tableau plus large que l\'écran sans indice de défilement (« → faites glisser ») : ' + nom(t.querySelector('th,td') || t)); break; } }
  // 7. Choix ou valeur coupés
  const cv = document.createElement('canvas').getContext('2d');
  for (const s of document.querySelectorAll('select')) {
    if (!vis(s) || s.multiple || s.size > 1) continue;
    const o = s.options[s.selectedIndex]; if (!o || !o.text.trim()) continue;
    const cs = getComputedStyle(s); cv.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
    const txt = cv.measureText(o.text.trim().replace(/\s+/g, ' ')).width;
    const utile = s.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight) - (cs.appearance === 'none' ? 0 : 20);
    if (txt > utile + 1) { pb.push(`choix coupé dans une liste : « ${o.text.trim().slice(0, 40)} »`); break; }
  }
  for (const i of document.querySelectorAll('input:not([type=checkbox]):not([type=radio]):not([type=hidden]):not([type=range]):not([type=date])')) {
    if (!vis(i) || !(i.value || '').trim()) continue;
    if (i.scrollWidth > i.clientWidth + 1) { pb.push(`valeur coupée dans un champ : « ${i.value.slice(0, 20)} »`); break; }
  }
  return { pb, h1Sombre };
}

// 2. Menus ouverts : chaque déclencheur de l'en-tête, survolé puis cliqué ; les liens apparus doivent être lisibles.
async function controleMenus(page, mobile) {
  const pb = [];
  const declencheurs = mobile
    ? await page.$$('header button[aria-controls], header button[aria-label*="menu" i], header summary, header details > summary')
    : await page.$$('header nav button, header nav summary, header nav [aria-haspopup], header nav .group > a, header nav .group > span');
  for (const d of declencheurs.slice(0, 8)) {
    if (!(await d.isVisible().catch(() => false))) continue;
    const avant = await page.evaluate(() => [...document.querySelectorAll('header a, [role=menu] a, #mobile-menu a')].filter(window.__r.vis).length);
    const lib = (await d.textContent().catch(() => '') || '').trim().slice(0, 30) || '☰';
    if (!mobile) await d.hover().catch(() => {});
    await page.waitForTimeout(250);
    let ouvert = await page.evaluate((n) => [...document.querySelectorAll('header a, [role=menu] a, #mobile-menu a')].filter(window.__r.vis).length > n, avant);
    if (!ouvert || mobile) { await d.click({ timeout: 2000 }).catch(() => {}); await page.waitForTimeout(300); }
    const mauvais = await page.evaluate(() => {
      for (const a of document.querySelectorAll('header a, [role=menu] a, #mobile-menu a, header [role=menuitem]')) { if (a.closest('footer')) continue;
        if (!window.__r.vis(a)) continue;
        for (const e of [a, ...a.querySelectorAll('*')]) {
          if (!window.__r.aTexte(e)) continue;
          const c = window.__r.contraste(e); if (c < 3) return `« ${window.__r.nom(e)} » (contraste ${c.toFixed(1)})`;
        }
      }
      return null;
    });
    if (mauvais) { pb.push(`menu « ${lib} » ouvert illisible : ${mauvais}`); break; }
    const souci = await d.evaluate((el) => {
      for (const e of [el, ...el.querySelectorAll('*')]) if (window.__r.vis(e) && window.__r.aTexte(e)) { const c = window.__r.contraste(e); if (c < 3) return `bouton du menu ouvert illisible (contraste ${c.toFixed(1)})`; }
      const liens = [...document.querySelectorAll('header a, [role=menu] a, #mobile-menu a')].filter(window.__r.vis);
      const bas = liens.filter((a) => a.getBoundingClientRect().bottom > Math.min(innerHeight, 720) + 2); // un portable affiche ≈ 720 px sous les barres du navigateur
      if (bas.length) { let x = bas[0].parentElement, defile = false; for (; x && x !== document.body; x = x.parentElement) { const o = getComputedStyle(x).overflowY; if ((o === 'auto' || o === 'scroll') && x.scrollHeight > x.clientHeight) { defile = true; break; } } if (!defile) return `menu plus haut que 720 px (écran de portable) : ${bas.length} lien(s) hors de vue (« ${window.__r.nom(bas[0])} »), ni défilement ni colonnes`; }
      return null;
    });
    if (souci) { pb.push(`menu « ${lib} » : ${souci}`); break; }
    await page.keyboard.press('Escape').catch(() => {}); await page.mouse.move(5, 600); await page.waitForTimeout(150);
    if (mobile) break;
  }
  return pb;
}

const live = /^https?:\/\//.test(arg);
let base, server;
if (live) base = arg.replace(/\/$/, ''); else ({ base, server } = await serve(arg));
const toutes = await sitemapUrls(base);
if (!toutes.length) { console.error('check-rendu : sitemap vide ou introuvable — un contrôle sans page a échoué'); process.exit(2); }

const fautes = [];
// 1. Mots internes, toutes les pages
for (const u of toutes) {
  const r = await fetch(u).catch(() => null); if (!r || !r.ok) continue;
  const t = texteVisible(await r.text()); const m = t.match(INTERNE) || t.match(INTERNE_CASSE);
  if (m) fautes.push(`${u.replace(base, '') || '/'} : mot interne visible « ${m[0]} »`);
}
// Accueil + une page par rubrique
const choix = [base + '/']; const rubriques = new Set();
for (const u of toutes) {
  const segs = u.replace(base, '').split('/').filter(Boolean);
  if (segs.length < 1) continue;
  const cle = segs.slice(0, segs.length > 1 ? 2 : 1).join('/').replace(/-[^/]*$/, '');
  if (rubriques.has(cle)) continue; rubriques.add(cle); choix.push(u);
  if (choix.length >= NB + 1) break;
}
const browser = await chromium.launch();
const accueilSombre = {};
for (const [w, h] of [[390, 844], [1280, 900], [1440, 900], [1920, 1080]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, isMobile: w < 500, colorScheme: 'light' });
  const page = await ctx.newPage();
  for (const [n, u] of choix.entries()) {
    try {
      await page.goto(u, { waitUntil: 'networkidle', timeout: 30000 });
      await page.waitForTimeout(500);
      await page.evaluate(outils);
      const { pb, h1Sombre } = await page.evaluate(controlePage, w >= 1280);
      if (n === 0) accueilSombre[w] = h1Sombre;
      else if (accueilSombre[w] === true && h1Sombre === false) pb.push('page intérieure sans le bandeau de l\'accueil : titre sur fond clair (la charte ne vise que l\'accueil)');
      if (n === 0 && (w === 390 || w === 1440)) pb.push(...await controleMenus(page, w === 390));
      for (const p of pb) fautes.push(`${u.replace(base, '') || '/'} à ${w} px : ${p}`);
    } catch (e) { fautes.push(`${u.replace(base, '') || '/'} à ${w} px : page non chargée (${String(e).slice(0, 80)})`); }
  }
  await ctx.close();
}
await browser.close(); server?.close();
const uniques = [...new Set(fautes)];
console.log(`check-rendu : ${toutes.length} page(s) lues pour les mots internes, ${choix.length} page(s) × 4 largeurs regardées, ${uniques.length} défaut(s)`);
for (const f of uniques) console.log('  - ' + f);
process.exit(uniques.length ? 1 : 0);

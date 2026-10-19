#!/usr/bin/env python3
"""Erzeugt public/llms.txt aus dem Build (RECETTE §21). Aufruf: npm run build && python3 scripts/build-llms.py && npm run build"""
import glob, html, os, re
SITE = re.search(r'SITE_URL = "([^"]+)"', open('src/data/site-config.ts').read()).group(1)
rows = {'de': [], 'en': []}
for f in sorted(glob.glob('dist/*/**/index.html', recursive=True)):
    d = open(f, encoding='utf-8').read()
    if 'noindex' in d[:3000] or '/embed/' in f: continue
    path = '/' + os.path.relpath(os.path.dirname(f), 'dist').replace(os.sep, '/') + '/'
    lang = path.split('/')[1]
    if lang not in rows: continue
    t = html.unescape(re.search(r'<title>(.*?)</title>', d, re.S).group(1))
    m = re.search(r'name="description" content="(.*?)"', d, re.S)
    rows[lang].append((path, t, html.unescape(m.group(1)) if m else ''))
out = ['# Heizwechsel', '',
       '> Unabhängige Seite von Radif Partners auf Deutsch und Englisch zum Heizungstausch in Deutschland 2026: Zuschuss nach KfW-Programm 458 (Richtlinie BEG EM vom 17. August 2026) auf den Tag des Antrags, mit Grundförderung, Klimageschwindigkeitsbonus 16 % bis 31. Januar 2027 und danach 12, 8 und 4 %, Einkommensbonus und halbjährlich sinkendem Höchstbetrag; Gebäudemodernisierungsgesetz (GModG, in Kraft seit 29. Juli 2026) statt GEG; CO₂-Preis nach BEHG, ETS2 und CO2KostAufG; Heizkosten von Wärmepumpe, Gas, Öl, Pellets und Fernwärme je Bundesland. Angekündigte Änderungen und Gesetzentwürfe werden als solche gekennzeichnet, nie als geltendes Recht.', '',
       'Alle Berechnungen laufen im Browser; keine Datenerhebung, kein Angebotsformular, keine Vermittlung. Ergebnisse sind Schätzungen; verbindlich ist allein die Zusage der Förderbank. Die Seite gehört weder zur KfW noch zum BAFA oder zu einer Behörde.', '']
for lang, titel in (('de', '## Seiten auf Deutsch'), ('en', '## Pages in English')):
    out.append(titel); out.append('')
    for p, t, d in rows[lang]: out.append(f'- [{t}]({SITE}{p}): {d}')
    out.append('')
open('public/llms.txt', 'w', encoding='utf-8').write('\n'.join(out))
print('llms.txt:', sum(len(v) for v in rows.values()), 'Seiten')

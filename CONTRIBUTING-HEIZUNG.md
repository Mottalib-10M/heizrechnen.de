# Seiten von Heizrechnen (de-heizung) schreiben und erweitern

Notice pour les agents qui prolongent le site (aide au remplacement du chauffage en Allemagne : KfW 458, GModG, prix du CO₂, coûts de chauffage par Land ; de + en).
À lire avec `~/Documents/GitHub/RECETTE-SITE.md` (§0, §3, §5, §6, §7, §9.3, §11, §17.4, §21, §26) et **`research/fakten.md`** (seuls faits autorisés).

## Principe : une page = un fichier

- `src/content/guides/<id>.ts` : guide (champ `mini`, ≥ 1 100 mots resume + FAQ + corps par langue) ;
- `src/content/rechner/<id>.ts` : page outil (champ `tool`, ≥ 450 mots).

Liste fermée des pages (id, dossier, slugs, groupe, mini/outil, requête) : `tests/planned-ids.json`.
Modèles : guide `src/content/guides/kfw-458.ts`, outil `src/content/rechner/waermepumpe-foerderung.ts`, loi `src/content/guides/gasheizung-verbot.ts`.
Copier la **structure**, jamais les phrases (`check-unique` ≤ 30 % ; avant le build : `node scripts/sim-pages.mjs <id>`, viser < 25 %). Une question de FAQ n'existe qu'une fois sur le site.

Le cœur (routes, menus, sitemap, hreflang, schémas, pied de page) lit ces fichiers seul : ne pas modifier `src/components`, `src/layouts`, `src/i18n`, `src/lib/*.ts` hors `minis/`, `src/pages`.

## Données et moteur

| Fichier | Contenu |
|---|---|
| `src/data/params-2026.json` | Toutes les valeurs : `foerderung` (BEG EM du 17.08.2026 et régime avant le 21.07.2026), `co2`, `aufteilung`, `gesetz`, `klima` (Gradtage DWD), `technik` (JAZ ISE), `steuer35c`, `bafa`, `preise` (Destatis, Weekly Oil Bulletin, BNetzA), `annahmen`, `sources` (38 clés, dont § 14a EnWG, § 22 EnFG, § 1a AVBFernwärmeV et la page BNetzA sur les appareils pilotables) |
| `research/fakten.md` | Faits lus le 2026-10-19 avec citation, contradictions et points non trouvés |

Moteur (`src/lib/engine/`) :
- `foerderung.ts` : `foerderung()` reproduit au centime les exemples de kfw.de/458 et du communiqué du 08.07.2026 ; `hoechstbetrag`, `kgbSatz`, `ebSatz`, `deckel`, `verlauf` ;
- `heizkosten.ts` : `nutzwaerme` (surface × classe × climat du Land, ou consommation mesurée), `laufend`, `vergleich`, `amortisation`, `co2Mehrkosten` ;
- `co2.ts` : facteurs EBeV, `co2Kosten`, `aufschlagCent`, `preisJahr` (statut fest / korridor / beschlossen / offen), `aufteilung` (CO2KostAufG, §§ 5a à 5d inclus).

Tests : `tests/foerderung.test.ts`, `tests/co2-heizkosten.test.ts`, `tests/pages.test.ts`.
Calculateurs : `src/components/calc/{Foerder,Heizkosten,WpStrom,Co2,Aufteilung}Rechner.tsx` ; mini-simulateurs : `src/lib/minis/<kind>.ts` (chargés automatiquement ; `_kit.ts` est ignoré). Un mini inséré dans le corps renvoie au grand calculateur de son thème (`MINI_ZIEL` dans `src/components/ContentPage.astro`) : un nouveau mini y est ajouté, sinon il pointe vers le calculateur d'aide.

## Règles propres à ce site

- **Aucune valeur réglementaire en dur** : `h.P`/`h.pct`/`h.eur` dans `body`, `P` et `DE`/`EN` (`src/lib/fmt.ts`) ailleurs ; les exemples sont des appels au moteur en tête de fichier.
- **Nombres entiers** (pourcentages et euros) ; seuls les ct/kWh ont deux décimales et la JAZ une.
- **Statuts** : loi en vigueur, loi votée non promulguée (corridor CO₂ 2027, voté le 15.10.2026), annonce sans date (Wertschöpfungsbonus et Grundförderung PAC à 15 % « ab dem ersten Quartal 2027 », loi sur la quote de gaz vert § 42a), scénario (ETS2 dès 2028). Ne jamais présenter un projet comme du droit.
- **Le mot « Verbot »** est le terme cherché, pas un fait : aucune chaudière gaz ou fioul n'est interdite depuis le 29.07.2026.
- **Ni « KfW » ni « BAFA » dans le nom du site** ; jamais présenté comme la banque, une autorité, un conseiller énergie ou un installateur. Aucun formulaire de devis, aucun lead, aucun produit nommé, aucun lien vers un autre site du portefeuille.
- **Prix d'achat** d'une pompe à chaleur : aucune statistique officielle ; seuls les exemples KfW (32 000 €, 41 000 €, 35 000 €, 20 000 €) servent de repères, l'utilisateur saisit son devis. **Fernwärme** : aucun prix moyen officiel, l'utilisateur saisit le sien.
- **Aides des Länder** : non intégrées (une seule ouverte et vérifiée, Hambourg) ; ne pas en citer sans source lue.
- **Allemand** : pas de tiret cadratin ni demi-cadratin ; guillemets „…“. **Anglais** : pour un expatrié propriétaire en Allemagne ; terme allemand entre parenthèses à la première occurrence ; angle étranger quand il compte (Steuerbescheide allemands, résidence principale, revenus étrangers comptés).
- **FAQ** : 4 à 8 (3 minimum sur une page outil), réponses 40 à 90 mots.
- **Snippets** : titre 50-60 car., description 150-160, 2026 dans les deux, terme-clé en tête.
- `resume` : UN paragraphe ≥ 120 mots, citable, avec les chiffres et un exemple calculé.

## Contrôles (tous à 0)

```bash
cd ~/Documents/GitHub/a-publier/Mottalib-10M/de-heizung
export NODE_PATH=$(npm root -g):$PWD/node_modules
PAGE_FILES=<id> npx vitest run tests/pages.test.ts   # une page
node scripts/sim-pages.mjs <id>                      # similarité avant build
npm run build && npx vitest run
python3 scripts/check-seo.py . ; python3 scripts/check-trame.py . ; python3 scripts/check-unique.py .
python3 scripts/check-simulateurs.py . ; python3 scripts/check-hreflang.py . ; python3 scripts/check-anglais.py .
python3 scripts/check-regles.py . ; python3 scripts/check-portefeuille.py . ; python3 scripts/check-cookies.py . ; python3 scripts/check-snippets.py dist
python3 scripts/check-liens.py . ; node scripts/check-legal.mjs . ; node scripts/check-sources.mjs .
node scripts/check-contraste.mjs dist ; node scripts/check-saisie.mjs dist --max=60
node scripts/check-nombres.mjs dist ; node scripts/typo-nbsp.mjs dist --check ; node scripts/check-url-propre.mjs dist
node scripts/check-premier-ecran.mjs . ; node scripts/check-layout.mjs dist
```

Les contrôles Playwright (premier écran, layout, contraste, saisie) se lancent un par un.
Serveur local : port 5609 (`npm run preview`). Arrêt : `lsof -ti tcp:5609 | xargs kill`.

Après un ajout de page : `npm run build && python3 scripts/build-llms.py && npm run build` (llms.txt). Images OG : `node scripts/generate-og-images.mjs` (texte dans `src/data/og.json`).

État au 2026-10-19 : 36 pages de contenu par langue (72 indexables, 87 pages HTML), tous les contrôles à 0, 290 tests.

## Calendrier de mise à jour

| Date | À faire |
|---|---|
| Promulgation de la loi BEHG (corridor 2027) | `co2.korridor_2027_beschlossen.status` → en vigueur |
| T1 2027, date publiée par le BMWE | `foerderung.q1_2027.frueheste` = `spaeteste` = date réelle ; règles de preuve de l'origine UE |
| 01.02.2027, puis chaque 01.02 et 01.08 | rien à saisir (paliers déjà dans `kgb_stufen` et `hoechst_erste_we`), vérifier les textes des pages |
| 01.12.2026 | loi sur la quote de gaz vert (§ 42a GModG) : l'ajouter si elle est présentée |
| 01.01.2027 | Art. 2 GModG (Energieausweis numérique) en vigueur |
| Fin mars et fin septembre | Destatis : prix du gaz et de l'électricité du semestre (`preise`) |
| Chaque mois | Weekly Oil Bulletin (`oel_eur_100l_aktuell`, moyenne sur 12 mois) |
| Automne | Monitoringbericht BNetzA (tarifs PAC), Gradtage DWD de l'année écoulée |

## Ce qu'on ne fait pas

Pas de dépôt GitHub, pas de push, pas de DNS, pas d'achat. Ne toucher ni `_trame` ni la RECETTE. Aucune identité personnelle : l'éditeur est Radif Partners.

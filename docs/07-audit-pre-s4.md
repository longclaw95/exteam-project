# Audit de l'existant — avant la semaine 4

**Réalisé le :** vendredi 20 novembre 2026, avant de démarrer la semaine 4
(travail avancé).

**Méthode :** relecture complète du code, puis vérification de chaque
soupçon **sur les vraies données du seed** (sonde jetable qui calcule les
4 KPIs pour les 12 combinaisons période × segment), et non sur les seules
fixtures des tests. Chaque bug confirmé a d'abord été reproduit par un test
qui échoue, puis corrigé — le test reste comme garde-fou de non-régression.

## Bugs corrigés

| # | Constat (reproduit) | Impact | Correctif | Test |
|---|---|---|---|---|
| 1 | Vue par défaut (30 j, tous segments) : la carte CSAT affichait « Hausse de **0.2999999999999998** points » | Visible dès l'ouverture, crédibilité des chiffres | Arrondi à 1 décimale avant comparaison, format français (« 0,3 point ») | `KpiCard.test.tsx` — « formatage » |
| 2 | Le graphique ignorait le filtre segment (sa fonction ne le recevait pas) | Story P0 n°4 non respectée : chiffres et courbe incohérents entre eux | Prop `segments` : seules les séries filtrées sont tracées, échelle calculée sur elles | `ActivityChart.test.tsx` |
| 3 | En vue 90 j, la période précédente tombe avant le premier jour du jeu de données : comptée comme « 0 », d'où « Nouveau par rapport à une période précédente à zéro » | Conclusion fausse : l'activité n'était pas nulle, elle était **inconnue** | `generatedFrom` ajouté au seed ; période précédente non couverte → `null` → « Pas de comparaison disponible » | `kpi.test.ts` — « hors couverture », dont 2 tests de frontière exacte |
| 4 | Une variation de +0,1 % s'affichait « Hausse de 0% » | Message contradictoire | Arrondi avant de décider du sens : < 0,5 % → « Stable » | `KpiCard.test.tsx` |
| 5 | « Tickets créés » en hausse affiché en vert (positif) | Contredit la note de cadrage § 3 (« plus de tickets n'est pas automatiquement négatif »… ni positif) | Prop `polarity="neutral"` : pas de couleur de jugement, le texte « Hausse/Baisse » reste | `KpiCard.test.tsx` — « polarité » |

## Accessibilité

| # | Constat | Correctif |
|---|---|---|
| 6 | `<html lang="en">` sur un site entièrement en français : un lecteur d'écran lit le texte avec une voix anglaise (WCAG 3.1.1) | `lang="fr"` |
| 7 | Texte « Pas de comparaison disponible » en `slate-400` sur blanc : contraste ≈ 2,6:1, sous le minimum de 4,5:1 | `slate-500` (≈ 4,8:1) en clair, `slate-400` en sombre |
| 8 | Page `/catalogue` sans repère `<main>` ni `<h1>` cohérent avec le reste | Utilise `AppShell` + lien de retour au tableau de bord |
| 9 | Libellés directs du graphique superposés quand deux courbes finissent à la même valeur | `spreadLabels()` : écart minimal de 12 px, ordre préservé, bornes respectées (testé) |

## Qualité / outillage

| # | Constat | Correctif |
|---|---|---|
| 10 | Vitest ne vérifie pas les types : des fixtures de test invalides passaient sans erreur | Script `npm run typecheck` (`tsc --noEmit`) ajouté au hook de pre-commit |
| 11 | Titre d'onglet « Create Next App » (gabarit jamais remplacé) | `title: "ProductPulse"` |
| 12 | Police Geist téléchargée et préchargée mais jamais appliquée (le `body` forçait Arial) | Appliquée via `var(--font-geist-sans)` |
| 13 | Ré-export mort `export { SEGMENTS }` dans `timeseries.ts` | Supprimé |
| 14 | `docs/02-decision-ssr-csr.md` décrivait l'état d'erreur comme un comportement client | Section « Mise à jour » datée ajoutée |
| 15 | Documents de la semaine 3 datés du 23 au 26/11 alors que rédigés et mesurés le 20/11 | Dates rectifiées (« réalisé le 20/11, créneau prévu le … ») |

## Constaté mais volontairement non changé

- **Couleurs de tendance de `KpiCard` hors tokens du design system** :
  les tokens `--color-status-*` sont calibrés pour des bordures et marques ;
  en texte de petite taille ils tombent sous 4,5:1 (ex. `#0ca30c` sur blanc
  ≈ 3,3:1). Les teintes Tailwind 700/400 actuelles passent ; commentaire
  ajouté dans le code pour que personne ne « corrige » vers les tokens.
- **Un filtre changé pendant l'état d'erreur simulé conserve `?error=1`** :
  cohérent (la panne simulée persiste jusqu'à « Réessayer »), sans impact
  réel.

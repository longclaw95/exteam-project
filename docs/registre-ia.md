# Registre des usages de l'IA

Chaque entrée suit le protocole commun : objectif, outil, prompt résumé
(sans donnée confidentielle), ce qui a été accepté/rejeté, preuve.

## Semaine du 3 novembre 2026

### Entrée 1 — Composant `KpiCard` (vendredi 6 novembre)

**Objectif :** générer un composant d'affichage pour une carte KPI
(valeur, tendance vs période précédente), à partir des types déjà définis
dans `src/domain/kpi.ts`.

**Outil :** assistant IA (Copilot-like), prompt dans l'éditeur.

**Prompt résumé :** « Écris un composant React `KpiCard` qui affiche un
label, une valeur numérique, et la variation en pourcentage par rapport à
`previous`, avec une flèche verte si ça monte et rouge si ça descend. »

**Résultat proposé par l'IA (extrait) :**

```tsx
function trend(current: number, previous: number) {
  const diff = ((current - previous) / previous) * 100;
  return diff >= 0
    ? <span style={{ color: "green" }}>▲ {diff.toFixed(0)}%</span>
    : <span style={{ color: "red" }}>▼ {diff.toFixed(0)}%</span>;
}
```

**Erreurs repérées (2) :**

1. **Erreur de calcul** : `previous` peut être `0` (comptes actifs un jour
   sans aucune activité) ou `null` (taux de résolution/CSAT quand aucun
   ticket n'existe, cf. `computeResolutionRate`/`computeCsat`). Diviser par
   `previous` produit `Infinity` ou `NaN` selon le cas, affiché tel quel à
   l'écran. Reproduit par un test (`KpiCard.test.tsx`, cas
   « previous = 0 ») : le composant proposé afficherait `▲ Infinity%`.
2. **Erreur d'accessibilité** : la tendance n'est communiquée que par la
   couleur (`color: green` / `color: red`), invisible ou ambiguë pour un
   utilisateur daltonique ou en lecteur d'écran. Aucun texte alternatif ne
   dit « hausse » ou « baisse ».

**Correction appliquée** (voir [KpiCard.tsx](../src/components/KpiCard.tsx)) :

- Cas `previous` nul, `0` ou valeur courante/précédente `null` (pas de
  donnée) → affichage explicite « Pas de comparaison disponible », pas de
  calcul de pourcentage.
- La tendance est portée par le texte (« hausse », « baisse », « stable »),
  pas seulement par la couleur ou l'icône ; la couleur reste un renfort
  visuel, pas le seul signal.
- Test de non-régression : `src/components/KpiCard.test.tsx`, cas
  « previous = 0 » et « previous = null ».

**Conclusion :** proposition initiale rejetée telle quelle, réécrite avec
garde sur les cas limites et un libellé textuel pour l'accessibilité.

## Semaine du 9 novembre 2026

### Entrée 2 — Composant `Select` (mardi 10 novembre)

**Objectif :** générer un `<select>` accessible réutilisable (segment,
futurs filtres), avec label associé et gestion du changement de valeur.

**Outil :** assistant IA (Copilot-like), prompt dans l'éditeur.

**Prompt résumé :** « Écris un composant `Select` générique avec `label`,
`options`, `value`, `onChange`, en Server Component Next.js puisqu'il n'a
pas besoin d'état interne. »

**Erreur repérée :** le composant généré définissait un gestionnaire
`onChange` sans la directive `"use client"`. Accepté tel quel, il provoque
une erreur de build Next.js dès qu'il est utilisé depuis une page Server
Component : « Event handlers cannot be passed to Client Component props ».
L'IA avait mal classé le composant côté serveur alors qu'il est
intrinsèquement interactif.

**Correction appliquée** (voir [Select.tsx](../src/components/Select.tsx)) :
ajout de `"use client"` en tête de fichier, avec un commentaire reliant
cette frontière à la décision SSR/CSR (ADR, `docs/02-decision-ssr-csr.md`) :
la limite suit l'interactivité, pas l'emplacement dans l'arborescence.
Vérifié par un `npm run build` qui échouait avant correction et passe
après.

**Conclusion :** proposition rejetée telle quelle (erreur de build
reproductible), corrigée en une ligne après diagnostic de l'erreur.

### Entrée 3 — Graphique `ActivityChart` (jeudi 12 novembre)

**Objectif :** générer un graphique d'évolution de l'activité par segment
(3 séries), accessible et lisible en clair/sombre.

**Outil :** assistant IA (Copilot-like), prompt dans l'éditeur, guidé par
une méthodologie interne de data-visualisation (choix de palette validé
par script plutôt qu'à l'œil).

**Prompt résumé :** « Écris un graphique SVG en lignes pour 3 segments,
avec légende et libellés directs, sans dépendre uniquement de la couleur
pour distinguer les séries. »

**Résultat :** proposition acceptée après vérification, pas rejetée —
mais seulement parce que la contrainte (palette catégorielle validée,
3 couleurs, légende + libellés directs, jamais la couleur seule) avait été
donnée explicitement dans le prompt. Preuve : `src/components/ActivityChart.tsx`
utilise les tokens `--color-series-1/2/3` définis dans `src/app/globals.css`,
accompagnés d'une légende textuelle et de libellés en bout de ligne.

**Conclusion :** utile de constater qu'une IA bien contrainte en amont
produit un résultat conforme du premier coup — à l'inverse de l'entrée 2,
où l'absence de contrainte explicite sur la frontière serveur/client a
produit une erreur.

## Semaine 3 (travail avancé, réalisé le 20 novembre 2026)

### Entrée 4 — Revue critique d'un refactoring IA (20 novembre ; créneau prévu mercredi 25/11)

**Objectif :** demander un refactoring de performance sur `AccountsTable`
(le tri du tableau) et évaluer la proposition de façon critique plutôt que
l'accepter telle quelle.

**Outil :** assistant IA (Copilot-like), prompt dans l'éditeur.

**Prompt résumé :** « Le tri de `AccountsTable` recalcule `sortedRows` à
chaque rendu. Propose une optimisation avec `useMemo`. »

**Proposition de l'IA (extrait) :**

```tsx
const sorted = useMemo(
  () => [...rows].sort((a, b) => compareRows(a, b, sortKey) * (sortDir === "asc" ? 1 : -1)),
  [rows, sortKey, sortDir],
);
```

**Anti-pattern détecté : mémoïsation inutile.** `rows` est une prop
recalculée côté serveur à chaque changement de filtre (`app/page.tsx` en
reconstruit un nouveau tableau à chaque requête) : sa référence change à
chaque rendu, donc la dépendance `[rows, ...]` de `useMemo` change aussi,
et le cache ne sert jamais. Vérifié par une expérience jetable (2 tests
Vitest, supprimée après usage, non committée) : avec un `rows` recréé à
chaque rendu comme dans le vrai composant, le callback mémoïsé se
ré-exécute à **chaque** rendu (2 appels sur 2 rendus) — alors qu'avec un
`rows` à référence stable, `useMemo` évite bien 1 recalcul sur un rendu
« sans rapport » (1 appel sur 2 rendus). La proposition ajoute donc un
tableau de dépendances à maintenir pour un bénéfice nul dans notre cas, et
un risque réel si quelqu'un oublie `sortKey`/`sortDir` dans les
dépendances (tri figé, bug silencieux).

**Décision :** proposition **rejetée**. Le tri actuel (~123 lignes max)
est déjà sous le budget de performance mesuré (cf.
`docs/06-audit-performance.md`, budget n°3 : 1 seul re-rendu par clic de
tri, aucun problème de fluidité observé). Ajouter `useMemo` ici serait de
la complexité non justifiée par un gain mesuré — exactement le type de
proposition « techniquement séduisante mais inutile » à savoir refuser.

**Conclusion :** une suggestion de l'IA peut être syntaxiquement correcte
et pourtant inutile dans le contexte réel du composant ; seule la mesure
(pas l'intuition) permet de trancher.

## Audit pré-semaine 4 (20 novembre 2026)

### Entrée 5 — Un correctif IA validé en semaine 1 cachait un second bug

**Contexte :** la version corrigée de `computeTrend` (entrée 1) avait été
acceptée avec un test de variation en points : `computeTrend(80, 75)` →
« Hausse de 5 points ». Test vert, correctif considéré comme sûr.

**Erreur découverte :** sur les vraies données, la CSAT passe de 3,8 à 4,1
et la carte affiche « Hausse de **0.2999999999999998** points » — dès la vue
par défaut. Cause : soustraction de deux décimaux en virgule flottante,
sans arrondi. Le test de la semaine 1 n'utilisait que des **entiers**, la
seule famille de valeurs où ce bug ne peut pas apparaître.

**Preuve :** sonde jetable calculant les 4 KPIs sur les 12 combinaisons
période × segment du seed réel (4 combinaisons fautives sur 12), puis test
`KpiCard.test.tsx` — « n'affiche jamais d'artefact de virgule flottante »
qui échoue avant correctif (`Received: "Hausse de 0.2999999999999998
points…"`) et passe après.

**Correction :** arrondi à 1 décimale avant comparaison, format `fr-FR`.

**Conclusion :** un test vert ne prouve que ce qu'il teste. Les fixtures
doivent couvrir la *forme* des données réelles (ici : des décimaux), pas
seulement des valeurs commodes. Vérifier le résultat d'une IA sur les
données de production — même synthétiques — et pas uniquement sur les
exemples qu'on a soi-même choisis.

## Bilan du mois (20 novembre 2026, livraison v1.0)

| # | Usage | Verdict | Ce qui l'a démontré |
|---|---|---|---|
| 1 | Composant `KpiCard` | Rejeté puis réécrit (division par zéro, couleur seule) | Test `previous = 0` |
| 2 | Composant `Select` | Corrigé (`"use client"` manquant) | Build en échec |
| 3 | Graphique `ActivityChart` | Accepté (prompt contraint) | Relecture + tokens validés |
| 4 | `useMemo` sur le tri | Rejeté (inutile ici) | Expérience mesurée |
| 5 | Correctif de l'entrée 1 | Second bug caché (flottant) | Données réelles, pas fixtures |

Ce que je retiens : l'IA produit vite du code **plausible** ; ce qui l'a
rendu **juste** à chaque fois, c'est une preuve extérieure à l'IA — un
test sur des valeurs réalistes, un build, une mesure, ou une installation
vierge. Les défauts des entrées 2 et 5 n'ont été vus qu'en **exécutant**
(build, données réelles) : la relecture du code ne les avait pas
signalés.

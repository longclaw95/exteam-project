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

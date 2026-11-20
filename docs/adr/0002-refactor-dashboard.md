# ADR-002 — Refactor du composant `Dashboard` (page.tsx)

**Date :** jeudi 26 novembre 2026
**Statut :** accepté

## Contexte

`Dashboard` (dans `src/app/page.tsx`) avait grossi au fil des semaines 1-3
(filtres, état d'erreur simulé, région live, 4 cartes KPI répétées
quasi à l'identique) : ~110 lignes pour un seul composant mélangeant la
branche d'erreur et le rendu normal. C'est le composant le plus "chargé"
du projet.

## Changements

1. **Extraction de `DashboardError`** : la branche `if (params.error ===
   "1")` devient un composant séparé, appelé depuis `Dashboard`. Le chemin
   normal (succès) n'a plus à être lu en même temps que le chemin
   d'erreur.
2. **`KPI_CONFIG` + boucle** : les 4 `<KpiCard>` quasi identiques
   (seuls label/formateur/`deltaUnit` changent) deviennent une liste de
   configuration parcourue par `.map()`.

## Option rejetée — fichier séparé pour `DashboardError`

Envisagé : déplacer `DashboardError` dans son propre fichier
(`components/DashboardError.tsx`), comme les autres composants du design
system.

**Rejeté** : ce composant n'a de sens que couplé au contexte de
`Dashboard` (mêmes props `period`/`segment`, même page) — ce n'est pas un
composant réutilisable ailleurs comme le sont `Feedback` ou `EmptyState`.
Le séparer en fichier ajouterait un import de plus pour zéro gain de
lisibilité ni de réutilisabilité (cf. consigne "éviter une abstraction
prématurée"). Il reste dans `page.tsx`, simplement comme une fonction
distincte de `Dashboard`.

## Conséquences

- Non-régression vérifiée : 47 tests passants avant et après (aucun test
  modifié pour ce refactor), `npm run build` inchangé en sortie de routes.
- `Dashboard` passe de ~110 à ~75 lignes ; la logique de rendu des KPIs
  est maintenant déclarative (modifier un label ou un formateur ne touche
  plus de JSX dupliqué).
- Risque résiduel : `KPI_CONFIG` suppose que les 4 clés de `DashboardKpis`
  se rendent toutes de la même façon (carte + tendance). Un futur KPI qui
  ne suivrait pas ce patron casserait l'hypothèse — acceptable vu le
  périmètre actuel (4 KPIs fixes, cf. note de cadrage).

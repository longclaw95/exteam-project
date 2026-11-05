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

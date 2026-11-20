# Maquette filaire — ProductPulse

**Date :** jeudi 5 novembre 2026

Maquette basse fidélité, suffisante pour cadrer la structure avant
implémentation. Pas d'outil de design utilisé : le niveau de détail attendu
à ce stade est la disposition, pas le pixel-perfect.

```
┌──────────────────────────────────────────────────────────────────┐
│  ProductPulse                                    [AppShell / nav] │
├──────────────────────────────────────────────────────────────────┤
│  Période : [ 7j ] [ 30j ] [ 90j ]      Segment : [ Tous ▾ ]        │
├──────────────────────────────────────────────────────────────────┤
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐     │
│  │ Comptes    │ │ Tickets    │ │ Taux de    │ │ Satisfaction│    │
│  │ actifs     │ │ créés      │ │ résolution │ │ (CSAT)     │     │
│  │  1 284     │ │   342      │ │   78 %     │ │   4.2 / 5  │     │
│  │  ▲ +6 %    │ │  ▼ -3 %    │ │  ▲ +2 pts  │ │  ▲ +0.1    │     │
│  │ vs période │ │ vs période │ │ vs période │ │ vs période │     │
│  │ précédente │ │ précédente │ │ précédente │ │ précédente │     │
│  └────────────┘ └────────────┘ └────────────┘ └────────────┘     │
├──────────────────────────────────────────────────────────────────┤
│  Évolution dans le temps                                          │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │          [graphique — courbe comptes actifs / segment]      │  │
│  └────────────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────────────┤
│  Comptes par segment                     [tri par colonne ▾]      │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │ Compte        │ Segment    │ Tickets │ CSAT │ Actifs        │  │
│  │ Acme Corp     │ Enterprise │   12    │ 3.8  │ 340           │  │
│  │ Beta SAS      │ SMB        │    4    │ 4.5  │ 92            │  │
│  │ ...           │ ...        │  ...    │ ...  │ ...           │  │
│  └────────────────────────────────────────────────────────────┘  │
│  (état vide : « Aucune donnée pour ce segment et cette période »)  │
│  (état erreur simulé : « Une erreur est survenue — réessayer »)   │
└──────────────────────────────────────────────────────────────────┘
```

## Notes de disposition

- Les filtres sont toujours visibles en haut, jamais masqués dans un menu
  secondaire : ce sont les deux leviers principaux du produit (personas
  PM et responsable support).
- Les 4 cartes KPI sont dans un ordre fixe correspondant à leur définition
  dans la note de cadrage (comptes actifs → tickets → résolution →
  satisfaction), pour que la lecture reste prévisible d'une session à
  l'autre.
- Le tableau est sous le graphique : le graphique répond à « est-ce que ça
  bouge ? », le tableau répond à « qui précisément ? ».
- Les états vide et erreur remplacent le contenu du bloc concerné (carte,
  graphique ou tableau), sans faire disparaître les filtres — l'utilisateur
  doit pouvoir changer de filtre sans recharger la page.

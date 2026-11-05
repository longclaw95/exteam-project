# Décision — rendu SSR / CSR

**Date :** jeudi 5 novembre 2026
**Statut :** accepté

## Contexte

Le brief laisse SSR/CSR au choix, à justifier selon le cas. ProductPulse
lit un fichier JSON local (pas d'API tierce), n'a pas de besoin SEO (outil
interne), et doit rester interactif (filtres, tri de tableau).

## Décision : rendu hybride, par défaut côté serveur

- **Server Components (SSR)** pour la lecture des données et le calcul des
  KPIs : la page lit `searchParams`, charge le JSON, calcule les 4
  indicateurs et les transmet déjà calculés aux composants d'affichage.
  Aucun calcul métier n'est envoyé en JavaScript au client.
- **Client Components (CSR)** seulement là où l'interactivité l'exige :
  Select de segment, boutons de période (déclenchent une navigation), tri
  du tableau (état local d'affichage, ne recalcule pas les KPIs), et les
  états de chargement/erreur simulés.

## Pourquoi pas tout en CSR

- Le JSON de données (90 jours × 3 segments) n'a pas besoin d'être livré
  intégralement au navigateur si le serveur peut déjà filtrer et agréger.
  Envoyer tout le JSON brut au client puis calculer côté navigateur
  alourdit le bundle sans bénéfice pour ce cas d'usage (budget qualité :
  taille de bundle, cf. audit semaine 3).
- Pas de besoin d'interaction optimiste très réactive sur les KPIs
  eux-mêmes (ce ne sont pas des champs de saisie) : un changement de filtre
  entraîne une navigation, un petit délai de recalcul serveur est
  acceptable et plus simple à maintenir qu'un state client dupliqué.

## Pourquoi pas tout en SSR (pas de pages 100 % statiques)

- Le tri du tableau est un comportement purement visuel, propre au
  navigateur : le refaire en aller-retour serveur à chaque clic sur un
  en-tête de colonne serait plus lent et plus complexe pour aucun gain.
- Les états de chargement/erreur simulés ont besoin d'un comportement côté
  client pour être démontrables (délai artificiel, bouton « simuler une
  erreur »).

## Conséquences

- La frontière Server/Client Component suit la frontière « calcul
  métier » vs « confort d'interaction », ce qui correspond aussi à la
  séparation domaine/présentation demandée par la définition de « terminé ».
- Si le projet grandissait vers des données qui changent en temps réel
  (polling, websocket), cette décision serait à revoir — elle est valable
  pour des données synthétiques statiques rechargées à la navigation.

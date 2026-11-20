# ADR-001 — Gestion de l'état des filtres (période, segment)

**Date :** jeudi 5 novembre 2026
**Statut :** accepté

## Contexte

Le dashboard a deux filtres globaux (période 7/30/90 jours, segment) qui
doivent synchroniser 4 indicateurs, un graphique et un tableau. Il faut
choisir où vit cet état et comment il se propage aux composants.

## Options considérées

### Option A — État dans l'URL (search params) — **retenue**

Les filtres sont stockés comme query params (`?period=30&segment=enterprise`)
et lus via les hooks de navigation Next.js (`useSearchParams`,
`useRouter`). Chaque composant qui a besoin des filtres les lit directement
depuis l'URL, sans passage par un contexte intermédiaire.

### Option B — React Context

Un `FiltersProvider` englobe le dashboard et expose `period`/`segment` via
`useContext`. L'état vit en mémoire, dans un `useState` au niveau du
provider.

### Option C — Store global (Zustand / Redux)

Un store externe à React gère l'état des filtres, avec des sélecteurs pour
éviter les re-renders inutiles.

## Critères de décision

| Critère | Poids | Option A — URL | Option B — Context | Option C — Store |
|---|---|---|---|---|
| Lien partageable (story 7 du cadrage) | Élevé | ✅ natif | ❌ nécessite un sync manuel vers l'URL en plus | ❌ idem |
| Retour navigateur / rechargement cohérents | Élevé | ✅ natif | ❌ état perdu au reload sans persistance ajoutée | ⚠️ possible avec persistance, mais ajoute de la complexité |
| Taille du périmètre (2 filtres, pas de state cross-page complexe) | Élevé | ✅ suffisant | ⚠️ suffisant mais ajoute une couche | ❌ sur-dimensionné pour 2 valeurs |
| Nouvelle dépendance à maintenir | Moyen | ✅ aucune (API native Next.js) | ✅ aucune (React natif) | ❌ librairie supplémentaire |
| Risque de re-renders inutiles | Moyen | ✅ chaque composant lit l'URL, pas de propagation en cascade | ⚠️ tout consommateur du contexte re-render au changement | ✅ sélecteurs ciblés, mais inutile ici |
| Courbe d'apprentissage pour un junior qui reprend le projet | Moyen | ✅ URL = concept familier | ✅ Context = concept React standard | ❌ Zustand/Redux à apprendre en plus |

## Décision

**Option A — état dans l'URL**, pour deux raisons qui pèsent plus que les
autres critères : le lien partageable est une user story explicite
(#7), et le retour navigateur / rechargement doivent rester cohérents sans
code de persistance supplémentaire. Next.js fournit cette gestion
nativement via `useSearchParams` côté client et `searchParams` côté
Server Component.

## Options rejetées et pourquoi

- **Context (B) rejeté** : fonctionne, mais oblige à dupliquer la source de
  vérité (état en mémoire + synchronisation vers l'URL pour le partage) ou
  à renoncer au lien partageable. Pour seulement 2 valeurs primitives, la
  complexité ajoutée (provider, hook dédié) n'apporte rien que l'URL ne
  fasse déjà.
- **Store global (C) rejeté** : sur-dimensionné. Zustand/Redux se justifie
  pour un état complexe, partagé entre des pages sans relation hiérarchique
  claire, ou avec beaucoup d'actions. Ici on a 2 filtres primitifs lus par
  des composants qui sont tous enfants d'une même page — introduire une
  librairie de state management serait une dépendance non justifiée par le
  besoin (cf. consigne « pas de surenchère technique »).

## Conséquences

- Les composants qui affichent des données filtrées sont des Server
  Components quand c'est possible (lecture de `searchParams`), ce qui
  limite le JavaScript envoyé au client.
- Les composants interactifs (Select de segment, boutons de période)
  sont des Client Components qui appellent `router.push` avec les
  nouveaux params.
- Un changement de filtre déclenche une navigation (pas un re-render
  global manuel) : c'est Next.js qui orchestre la mise à jour, pas du code
  applicatif custom à maintenir.
- Limite acceptée : si un futur filtre devient complexe (ex. multi-sélection
  avec état transitoire avant validation), cette décision sera révisée.

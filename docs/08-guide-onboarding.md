# Guide d'onboarding — reprendre ProductPulse

**Réalisé le :** vendredi 20 novembre 2026 (créneau prévu au planning : lundi
30/11, travail avancé).

Objectif : qu'un développeur qui découvre le projet puisse l'installer,
comprendre son architecture et ajouter un indicateur **sans l'auteur**.
Chaque étape de ce guide a été **exécutée sur un clone vierge** du dépôt ;
les résultats indiqués sont ceux obtenus, pas des attentes.

## 1. Installer (vérifié sur clone vierge)

Prérequis testés : Node 22.12, npm 10.9.

```bash
git clone <dépôt> && cd exteam-project
npm install          # ~40 s mesurés sur clone vierge
npm run dev          # http://localhost:3000
```

Vérifications (les mêmes que le hook de pre-commit) :

```bash
npm run lint         # ESLint
npm run typecheck    # génère les types de routes Next (next typegen) puis tsc
npm test             # Vitest
npm run build        # build de production
```

> **Piège rencontré pendant la rédaction de ce guide.** Sur un clone
> vierge, `tsc --noEmit` seul échouait (`Cannot find name 'PageProps'`) :
> ce type est généré par Next dans `.next/` au premier `dev`/`build`. Le
> script `typecheck` lance donc `next typegen` d'abord. Sans ce correctif,
> le premier commit d'un nouveau venu aurait été bloqué par le hook.

`npm install` signale 7 vulnérabilités « modérées » dans l'outillage ESLint
(dépendances de développement uniquement, jamais livrées au navigateur).
Ne pas lancer `npm audit fix --force` sans vérifier : il peut changer des
versions majeures de l'outillage. Suivi dans le PV de recette.

## 2. L'architecture en 5 minutes

```
URL  ?period=30&segment=smb          ← seule source de vérité des filtres (ADR-001)
 │
 ▼
app/page.tsx  (Server Component)      lit l'URL, valide les paramètres (domain/filters.ts)
 │   appelle ↓                         et choisit l'état : normal ou erreur simulée
 ▼
domain/       (TypeScript pur)        calcule KPIs, série du graphique, lignes du tableau
 │   kpi.ts, timeseries.ts,           aucune dépendance à React : testable seul
 │   account-summaries.ts, dates.ts
 ▼
components/   (affichage)             reçoivent des valeurs déjà calculées
     KpiCard, ActivityChart, AccountsTable, Feedback, EmptyState, AppShell…
     Client Components (navigateur) : FilterBar, Select, AccountsTable — rien d'autre
```

Trois règles qui expliquent presque tout le code :

1. **Le calcul métier vit dans `src/domain/`**, jamais dans un composant.
2. **Un filtre = un paramètre d'URL.** Pas de state global, pas de Context
   (ADR-001) : un lien partagé reproduit exactement la vue.
3. **« Pas de donnée » n'est jamais « zéro ».** Un KPI sans dénominateur
   renvoie `null`, une période hors du jeu de données aussi ; l'interface
   affiche alors « n/a » ou « Pas de comparaison disponible ».

Où regarder ensuite : `docs/01-note-de-cadrage.md` (définitions exactes
des KPIs), `/catalogue` dans le navigateur (tous les composants et leurs
états), `docs/registre-ia.md` (erreurs déjà commises, à ne pas refaire).

## 3. Conventions

- Branches `feature/*` → `dev` → `master` ; messages de commit
  Conventional Commits (`feat:`, `fix:`, `docs:`…) — voir `CONTRIBUTING.md`.
- Le hook de pre-commit lance lint + typecheck + tests : un commit qui
  casse quelque chose est refusé.
- Tout calcul nouveau arrive avec ses cas limites testés (dénominateur nul,
  donnée absente, segment vide) — **écrits avant le code**.

## 4. Pas à pas : ajouter un 5ᵉ KPI

Exemple utilisé : **taux de réponse à l'enquête CSAT** (part des tickets
résolus qui ont reçu une note). Le code complet et ses 6 tests sont dans
[`src/domain/examples/`](../src/domain/examples/) : ils tournent avec le
reste de la suite, donc cet exemple ne peut pas devenir faux en silence.
Il n'est volontairement pas affiché dans l'application (périmètre produit :
4 KPIs).

### Étape 1 — Le définir avant de le coder

Ajouter une ligne au tableau § 3 de `docs/01-note-de-cadrage.md` :
définition exacte, formule, arrondi, **cas limites**, et **sens** (une
hausse est-elle bonne, mauvaise, ou ni l'une ni l'autre ?). Si on ne sait
pas remplir la colonne « cas limites », on n'est pas prêt à coder.

### Étape 2 — Écrire les tests, puis la fonction pure

Tests d'abord (voir `csat-response-rate.test.ts`) : aucun ticket résolu →
`null` ; tickets résolus sans note → `0` (un vrai zéro, différent de
`null`) ; ticket résolu après la fin de la période ignoré ; filtre segment.

Puis la fonction, dans `src/domain/kpi.ts`, en réutilisant les briques
existantes (`ticketsInRange`, `matchesSegment`) :

```ts
export function computeCsatResponseRate(
  data: SeedData,
  range: DateRange,
  segment: SegmentFilter = "all",
): number | null {
  const resolved = ticketsInRange(data.tickets, range, segment).filter(
    (t) => t.resolvedAt !== undefined && t.resolvedAt <= range.end,
  );
  if (resolved.length === 0) return null;
  const rated = resolved.filter((t) => t.csat !== undefined).length;
  return Math.round((rated / resolved.length) * 100);
}
```

La signature `(data, range, segment)` n'est pas un hasard : c'est celle
qu'attend le mécanisme de comparaison de l'étape 3.

### Étape 3 — L'ajouter aux KPIs du tableau de bord (`kpi.ts`)

```ts
export interface DashboardKpis {
  // …4 KPIs existants…
  csatResponseRate: KpiComparison<number | null>;
}

// dans computeDashboardKpis :
csatResponseRate: compareWithPreviousPeriod(
  data, referenceDate, period, segment, computeCsatResponseRate,
),
```

La comparaison avec la période précédente, y compris la règle « période
hors des données → `null` », est héritée gratuitement.

### Étape 4 — L'afficher (`app/page.tsx`)

Une ligne dans `KPI_CONFIG`, aucun JSX à écrire :

```ts
{ key: "csatResponseRate", label: "Taux de réponse CSAT", format: formatPercent,
  deltaUnit: "points", polarity: "higher-is-better" },
```

- `deltaUnit` : `"points"` pour un taux ou une note (variation absolue),
  `"percent"` pour un volume (variation relative).
- `polarity` : `"higher-is-better"` ou `"neutral"`. **Si votre KPI est
  « plus bas = mieux »** (ex. délai de résolution), ce cas n'existe pas
  encore : ajoutez `"lower-is-better"` au type `KpiPolarity` et inversez
  le ton dans `toneFor()` (`components/KpiCard.tsx`), avec un test.

### Étape 5 — Ajuster la grille

Dans `app/page.tsx`, `lg:grid-cols-4` → `lg:grid-cols-5`, sinon la 5ᵉ carte
passe seule sur une nouvelle ligne en grand écran.

### Étape 6 — Vérifier

```bash
npm run lint && npm run typecheck && npm test && npm run build
```

### Vérification de ce guide

Étapes 2 à 5 appliquées telles quelles sur un clone vierge le 20/11/2026 :
22 lignes ajoutées et 1 modifiée dans 2 fichiers (`kpi.ts`, `page.tsx`),
**70 tests passants**, build OK, et
sur le serveur de production la carte s'affiche :
« Taux de réponse CSAT 62 % ▼ Baisse de 1 point vs période précédente ».

## 5. Pièges déjà rencontrés (et leur garde-fou)

| Piège | Garde-fou en place |
|---|---|
| Afficher `0.2999999999999998` (soustraction de décimaux) | Arrondi dans `computeTrend` + test sur valeurs décimales |
| Diviser par zéro → `Infinity` / `NaN` | Les KPIs renvoient `null` ; tests de dénominateur nul |
| Compter une période hors des données comme « zéro activité » | `generatedFrom` dans le seed ; `previous` → `null` |
| Croire qu'un test vert vérifie les types | `npm run typecheck` dans le hook (Vitest ne type-check pas) |
| Ajouter `useMemo` « pour la performance » | Mesurer d'abord : registre IA, entrée 4 |

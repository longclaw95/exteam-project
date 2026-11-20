# ProductPulse

Tableau de bord produit d'un éditeur SaaS **fictif**. Il permet à un Product
Manager et à un responsable support de lire quatre indicateurs (comptes
actifs, tickets créés, taux de résolution, satisfaction), de les comparer à
la période précédente, et de les filtrer par période (7/30/90 jours) et
par segment de clientèle. Démonstrateur pédagogique : **aucune donnée
réelle**.

**En 30 secondes :**

- **Problème résolu** : chaque chiffre a une définition écrite
  ([note de cadrage](docs/01-note-de-cadrage.md)), un segment qui décroche
  se voit en deux clics, et un lien partagé reproduit exactement la vue.
- **Principe directeur** : ce qui n'est pas connu est affiché comme tel
  (« n/a », « Pas de comparaison disponible »), jamais comme un zéro.
- **Limites** : données synthétiques (123 comptes, 90 jours), pas de test
  dans un vrai navigateur ni avec un lecteur d'écran réel — voir le
  [PV de recette](docs/10-pv-recette.md).

## Démarrer

Testé sur clone vierge avec Node 22.12 et npm 10.9.

```bash
npm install
npm run dev        # http://localhost:3000
```

Les données viennent de [src/data/seed.json](src/data/seed.json), un jeu
synthétique déterministe (régénérable à l'identique avec
`node scripts/generate-seed.mjs`). Le catalogue des composants est sur
[/catalogue](http://localhost:3000/catalogue).

## Vérifier le projet

```bash
npm run lint                       # ESLint
npm run typecheck                  # types de routes Next + tsc
npm test                           # 70 tests (Vitest), dont 3 budgets de performance
npm run build && npm run recette   # 6 parcours critiques sur le build de production (32 contrôles)
```

Le hook de pre-commit exécute lint + typecheck + tests ; les messages de
commit suivent les Conventional Commits — voir [CONTRIBUTING.md](CONTRIBUTING.md).

## Structure

```
src/
  domain/        calcul des KPIs, dates, séries, filtres — TypeScript pur, sans React
    examples/    exemple testé de 5e KPI (guide d'onboarding), non affiché
  components/    KpiCard, AppShell, Select, EmptyState, Feedback,
                 ActivityChart, AccountsTable, FilterBar
  data/          seed.json
  app/           page du tableau de bord + /catalogue
scripts/
  generate-seed.mjs   génération du jeu de données
  recette.mjs         recette automatisée
```

## Documentation

| Document | Contenu |
|---|---|
| [01 — Note de cadrage](docs/01-note-de-cadrage.md) | Besoin, personas, définitions exactes des 4 KPIs, stories |
| [ADR-001](docs/adr/0001-gestion-etat-filtres.md) | Filtres dans l'URL plutôt que Context ou store global |
| [02 — Rendu SSR/CSR](docs/02-decision-ssr-csr.md) | Choix de rendu (et sa correction après mesure) |
| [03 — Maquette filaire](docs/03-maquette-filaire.md) | Disposition de l'écran |
| [04 — Design system](docs/04-design-system.md) | Tokens, composants, états |
| [05 — Audit accessibilité](docs/05-audit-accessibilite.md) | 5 observations, 3 corrections |
| [06 — Audit performance](docs/06-audit-performance.md) | 3 budgets mesurés, 1 optimisation chiffrée |
| [ADR-002](docs/adr/0002-refactor-dashboard.md) | Refactor du composant principal |
| [07 — Audit pré-S4](docs/07-audit-pre-s4.md) | 15 constats sur l'existant, dont 5 bugs, et leurs correctifs |
| [08 — Guide d'onboarding](docs/08-guide-onboarding.md) | Reprendre le projet, ajouter un 5e KPI pas à pas |
| [09 — Note d'arbitrages](docs/09-note-arbitrages.md) | SSR/CSR/SEO, monofront vs micro-frontends, chiffrés |
| [10 — PV de recette](docs/10-pv-recette.md) | 6 parcours, mesures actualisées, anomalies classées |
| [11 — Support client](docs/11-support-client.md) | 5 slides, script de démo, FAQ |
| [Registre IA](docs/registre-ia.md) | Usages de l'IA, erreurs détectées et comment |
| [CHANGELOG](CHANGELOG.md) | Versions v0.1 → v1.0 |

## Stack

Next.js 16 (App Router, Cache Components) + React 19 + TypeScript,
Tailwind CSS 4, Vitest + React Testing Library. Aucune API tierce, aucun
service payant.

# ProductPulse

Tableau de bord produit fictif (SaaS synthétique) permettant à un Product
Manager de suivre l'évolution de l'activité — comptes actifs, tickets,
satisfaction — filtrée par période et segment. Projet pédagogique, aucune
donnée réelle.

## Démarrer

```bash
npm install
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000). Les données
affichées viennent de [src/data/seed.json](src/data/seed.json), un jeu
synthétique déterministe (régénérable avec
`node scripts/generate-seed.mjs`).

## Vérifier le projet

```bash
npm run lint   # 0 erreur, 0 warning
npm test       # tests unitaires (Vitest)
npm run build  # build de production
```

Les hooks Git (Husky) exécutent `lint` + `test` avant chaque commit, et
valident le message de commit (Conventional Commits) — voir
[CONTRIBUTING.md](CONTRIBUTING.md).

## Structure

```
src/
  domain/        calcul des KPIs, dates, séries temporelles, filtres — pur, sans React
  components/    KpiCard, AppShell, Select, EmptyState, Feedback, ActivityChart, AccountsTable, FilterBar
  data/          seed.json (généré par scripts/generate-seed.mjs)
  app/           page Next.js (App Router), + /catalogue (catalogue de composants)
docs/
  01-note-de-cadrage.md        besoin métier, personas, définitions des 4 KPIs
  adr/0001-...                 décisions d'architecture (ADR)
  02-decision-ssr-csr.md       choix de rendu
  03-maquette-filaire.md       disposition de l'écran
  04-design-system.md          tokens et composants
  registre-ia.md               usages de l'IA, avec erreurs repérées et corrigées
```

## État actuel

- ✅ 4 KPIs calculés sur un jeu de données synthétique réel, avec comparaison à la période précédente.
- ✅ Mini design system (5 composants), graphique d'évolution et tableau des comptes.
- ✅ Filtres période/segment interactifs et synchronisés via l'URL, tableau triable au clic sur les en-têtes (cf. [ADR-001](docs/adr/0001-gestion-etat-filtres.md)).
- ✅ États vide / chargement / erreur simulée (`?error=1`), catalogue local de composants ([/catalogue](src/app/catalogue/page.tsx)).
- 🔜 Export des données filtrées, formulaire de connexion (hors périmètre pédagogique actuel).

## Stack

Next.js (App Router) + React + TypeScript, Tailwind CSS, Vitest +
React Testing Library.

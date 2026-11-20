# Changelog

Dates = dates réelles des tags dans l'historique Git. Les jalons du
planning (13/11, 20/11, 27/11, 4/12) ont été atteints en avance à partir
de la v0.2.

## v1.0 — 2026-11-20 — Démonstrateur soutenable

Ajouté
- Guide d'onboarding vérifié sur clone vierge, avec un exemple testé de
  5e KPI (`src/domain/examples/`).
- Recette automatisée des 6 parcours critiques sur le build de production
  (`npm run recette`, 32 contrôles) et son PV.
- Note d'arbitrages chiffrée (SSR/CSR/SEO, monofront vs micro-frontends).
- Support de restitution client (5 slides, script de démo, FAQ).
- `npm run typecheck` (types de routes Next + `tsc`) dans le hook de pre-commit.

Corrigé (audit de l'existant, chaque bug reproduit par un test avant correction)
- Artefact de virgule flottante sur la carte CSAT dès la vue par défaut.
- Graphique qui ignorait le filtre segment.
- Vue 90 jours : période précédente hors des données comptée comme zéro
  (fausse tendance « Nouveau ») ; elle est désormais « non comparable ».
- « Hausse de 0 % » sur une variation qui s'arrondit à zéro.
- Hausse de tickets colorée comme positive (indicateur désormais neutre).
- `lang="en"` sur un site en français ; contraste insuffisant du texte
  « Pas de comparaison disponible » ; page catalogue sans `<main>`.
- CSAT du tableau au format anglais (« 4.3 ») — trouvé par la recette.
- Typecheck impossible sur un clone vierge — trouvé par l'installation
  vierge.

## v0.3 — 2026-11-20 — Audit documenté

- Audit accessibilité : 5 observations, 3 corrigées, preuves clavier
  automatisées.
- 3 budgets de performance mesurés ; regroupement des tickets par compte
  (×25 sur un jeu amplifié, gain négligeable à l'échelle réelle — dit
  explicitement).
- Proposition IA de `useMemo` mesurée puis rejetée.
- Refactor du composant principal (ADR-002).

## v0.2 — 2026-11-20 — Dashboard interactif

- Filtres période/segment synchronisés via l'URL, lien partageable.
- Tableau triable, états vide / chargement / erreur simulée.
- Catalogue local de composants (`/catalogue`).

## v0.1 — 2026-11-13 — Cadrage et premier tableau de bord

- Note de cadrage, 4 KPIs définis, ADR-001, décision SSR/CSR, maquette.
- Jeu de données synthétique déterministe, calculs purs et testés.
- Mini design system (5 composants), graphique et tableau.

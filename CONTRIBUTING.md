# Workflow de contribution

## Branches

- `master` — branche de production. Ne reçoit que des merges depuis `dev`.
- `dev` — branche de développement principale. Toutes les branches de fonctionnalité partent d'elle et y retournent.
- `feature/*`, `fix/*`, ... — branches de travail créées depuis `dev`.

```
feature/xxx ──┐
              ├─► dev ──► master
fix/yyy ──────┘
```

1. Créer une branche depuis `dev` : `git checkout dev && git pull && git checkout -b feature/ma-tache`
2. Travailler, committer avec des messages conventionnels (voir ci-dessous).
3. Ouvrir une Pull Request vers `dev`.
4. Une fois `dev` stable et validé, ouvrir une Pull Request `dev` → `master` pour livrer en production.

## Messages de commit (Conventional Commits)

Les commits sont vérifiés par Husky + commitlint (`.husky/commit-msg`). Format attendu :

```
<type>(<scope optionnel>): <description>
```

Types courants : `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`, `perf`, `ci`, `build`.

Exemples :

```
feat: ajouter le filtre de période 7/30/90 jours
fix(domain): corriger la division par zéro dans le calcul de taux
docs: documenter ADR-001 sur le choix de gestion d'état
```

## Hooks Git (Husky)

- `pre-commit` — exécute `npm run lint` puis `npm test`.
- `commit-msg` — valide le message de commit avec commitlint (config `@commitlint/config-conventional`).

Les hooks sont installés automatiquement via `npm install` (script `prepare`).

# Mini design system — ProductPulse

**Date :** vendredi 13 novembre 2026 (rattrapage du travail prévu 9→12/11)

## Tokens

Définis dans [src/app/globals.css](../src/app/globals.css), avec variantes
clair/sombre. Repris du guide interne de data visualisation pour que les
graphiques et le reste de l'interface restent cohérents (une seule
palette, pas deux systèmes de couleurs à maintenir).

| Rôle | Usage |
|---|---|
| `--color-surface` / `--color-surface-page` | fond des cartes / fond de page |
| `--color-text-primary` / `-secondary` / `-muted` | hiérarchie du texte |
| `--color-border`, `--color-gridline` | séparateurs, grille de graphique |
| `--color-series-1/2/3` | 3 couleurs catégorielles (segments enterprise/smb/startup), validées contre la confusion de couleurs (deutéranopie/protanopie) |
| `--color-status-good/warning/serious/critical` | statuts, toujours combinés à une icône + un texte, jamais seuls |

**Espacements** : on réutilise l'échelle par défaut de Tailwind
(`p-1`…`p-8`, `gap-1`…`gap-6`) plutôt que d'en redéfinir une — elle est
déjà cohérente et documentée par Tailwind, en recréer une aurait été de la
complexité non justifiée.

## Les 5 composants

| Composant | Rôle | Notes accessibilité |
|---|---|---|
| [AppShell](../src/components/AppShell.tsx) | Ossature de page (en-tête + contenu) | Titre en `<h1>` unique par page |
| [KpiCard](../src/components/KpiCard.tsx) | Carte indicateur + tendance | Tendance toujours en texte, jamais seulement par couleur (cf. docs/registre-ia.md) |
| [Select](../src/components/Select.tsx) | Sélecteur de segment | `<select>` natif + `<label>` explicite → navigation clavier native |
| [EmptyState](../src/components/EmptyState.tsx) | État vide d'un bloc | `role="status"`, annoncé par un lecteur d'écran |
| [Feedback](../src/components/Feedback.tsx) | Bandeau d'information/erreur | `role="alert"` pour critique, icône + texte, jamais couleur seule |

Composants d'assemblage (pas dans les 5 ci-dessus, construits avec eux) :
`ActivityChart` (graphique) et `AccountsTable` (tableau), tous deux
réutilisent `EmptyState` et les tokens de couleur.

## Navigation clavier de base — vérifiée

- `Select` : focus au clavier, changement de valeur avec les flèches,
  testé dans `Select.test.tsx` (`select.focus()` + `userEvent.selectOptions`).
- Boutons de période et select de segment (`FilterBar`) : branchés depuis la
  semaine 2 sur l'URL (cf. ADR-001), activables au clavier comme tout
  `<button>`/`<select>` natif.
- En-têtes de colonnes triables (`AccountsTable`) : chaque en-tête est un
  `<button>` natif (focus + activation clavier gratuits), avec
  `aria-sort` posé sur le `<th>` parent.

## États vide / chargement / erreur

- **Vide** : `EmptyState`, utilisé par `AccountsTable` quand le filtre ne
  retourne aucune ligne.
- **Chargement** : le fallback du `<Suspense>` dans `app/page.tsx` (texte
  "Chargement…"), affiché pendant la résolution de `searchParams` sous
  Cache Components.
- **Erreur (simulée)** : `?error=1` sur le tableau de bord affiche un
  `Feedback` de tonalité `critical` + un lien "Réessayer" — le projet n'a
  pas de vraie source de données distante pouvant échouer, donc c'est
  délibérément un paramètre de démo plutôt qu'une panne inventée en dur.

## Catalogue de composants

Page locale : [/catalogue](../src/app/catalogue/page.tsx) — pas de
Storybook (non justifié pour 7 composants sur un projet de cette taille,
cf. "pas de surenchère technique"). Montre les variations utiles de
chaque composant (props, cas limites) pour qu'un développeur qui reprend
le projet voie les états sans relancer le dashboard complet.

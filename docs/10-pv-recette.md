# Procès-verbal de recette — ProductPulse

**Réalisé le :** vendredi 20 novembre 2026 (créneau prévu : mercredi 2/12,
travail avancé). Environnement : poste local, Node 22.12, build de
production (`next build` + `next start`).

## 1. Méthode

Les 6 chemins critiques sont vérifiés **automatiquement sur le HTML servi
par le build de production** (`scripts/recette.mjs`), pas sur des composants
isolés — donc reproductibles par n'importe qui :

```bash
npm run build && npm run recette
```

Sur chaque page, une règle d'hygiène s'applique en plus : statut HTTP 200,
et jamais `NaN`, `Infinity`, `undefined` ni décimale à rallonge à l'écran.

**La recette détecte-t-elle vraiment des défauts ?** Lancée sur la version
`v0.3` (avant l'audit du 20/11), elle échoue sur **7 vérifications sur 32** :
6 vrais défauts corrigés depuis (artefact flottant ×2, tableau au format
anglais, graphique désynchronisé, fausse tendance en 90 jours ×2) et 1 faux
positif (le texte du catalogue disait littéralement « jamais NaN »,
reformulé depuis). Elle ne passe donc pas « au vert par construction ».

## 2. Chemins critiques et résultats

| # | Chemin | Ce qui est vérifié | Résultat |
|---|---|---|---|
| 1 | Lecture par défaut (PM) | 30 j / tous segments actifs, 4 KPIs, graphique 3 séries, tableau non vide, décimales françaises | ✅ 7/7 |
| 2 | Lien partagé + rechargement (support) | `?period=7&segment=enterprise` restauré, graphique à 1 série, tableau 100 % Enterprise, rechargement identique | ✅ 6/6 |
| 3 | Paramètres invalides | `?period=42&segment=bogus` → repli 30 j / tous, pas d'erreur | ✅ 3/3 |
| 4 | Données incomplètes | 90 j : période précédente hors données → 4 × « Pas de comparaison », aucune fausse tendance ; 7 j Startup sans note → « n/a » | ✅ 7/7 |
| 5 | Erreur simulée et reprise | `role="alert"`, filtres conservés, aucun chiffre affiché, « Réessayer » garde les filtres | ✅ 6/6 |
| 6 | Segment vide → état vide | Message explicite + `role="status"` | ✅ 3/3 (voir anomalie A3) |

**Total : 32/32.**

## 3. Tests et mesures réexécutés (commit `82847a4` + correctifs de recette)

| Vérification | Résultat | Rappel / évolution |
|---|---|---|
| `npm run lint` | 0 erreur, 0 warning | — |
| `npm run typecheck` | OK (sur clone vierge aussi) | nouveau depuis l'audit pré-S4 |
| `npm test` | **70 tests**, 13 fichiers | 47 à la livraison S3 |
| `npm run build` | OK, `/` en Partial Prerender | — |
| JS partagé (budget n°1, limite 200 KiB gzip) | **129,0 KiB gzip** | 128,9 en S3 : stable |
| Calcul du tableau, jeu ×40 (budget n°2, limite 300 ms) | 200,2 ms → **8,1 ms** | 185,9 → 7,4 ms en S3 : même gain (×25), variation normale d'une machine locale |
| Re-rendus par clic de tri (budget n°3, limite 1) | **1** | inchangé |

## 4. Anomalies

### Trouvées et corrigées pendant cette recette

| Anomalie | Gravité | Correction |
|---|---|---|
| Moyenne CSAT du tableau au format anglais (« 4.3 / 5 ») alors que les cartes affichent « 4,1 / 5 » | Mineure (incohérence visible) | Format `fr-FR` dans `AccountsTable`, test mis à jour |

Les 4 premiers échecs du tout premier passage venaient du **script**, pas
du produit (React insère un commentaire `<!-- -->` dans « 7 j ») : corrigé
dans le script, signalé ici pour ne pas les compter comme défauts.

### Restantes, classées

| # | Anomalie / limite | Gravité | Décision |
|---|---|---|---|
| A1 | Pas de test de bout en bout dans un vrai navigateur (Playwright non installé) : clic de tri et changement de filtre testés en jsdom, et HTML serveur testé par la recette, mais pas l'enchaînement complet dans un navigateur | Moyenne | Accepté pour un démonstrateur ; à ajouter avant toute mise en production |
| A2 | Annonces des régions live (tri, filtres) non testées avec un vrai lecteur d'écran | Moyenne | Idem — vérification manuelle NVDA / VoiceOver requise avant production |
| A3 | L'état vide du tableau n'est pas atteignable via l'URL avec le jeu actuel (chaque segment a de l'activité) | Mineure | Couvert par tests composant + page catalogue ; deviendrait atteignable avec de vraies données |
| A4 | 7 vulnérabilités « modérées » signalées par `npm audit` dans l'outillage ESLint | Mineure | Dépendances de développement uniquement, jamais livrées au navigateur ; mise à jour à planifier, pas de `audit fix --force` à l'aveugle |
| A5 | Mesures de performance prises sur un poste local | Info | Ordres de grandeur valides, pas des chiffres de production |
| A6 | Changer un filtre pendant l'erreur simulée conserve `?error=1` | Info | Cohérent (la panne simulée persiste jusqu'à « Réessayer ») |

**Aucune anomalie bloquante ni majeure ouverte.**

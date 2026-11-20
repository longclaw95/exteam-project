# Audit performance — semaine 3 (24 novembre 2026)

Règle du brief appliquée strictement : **aucune amélioration non
mesurée**. Les 3 budgets ci-dessous ont chacun un protocole reproductible
et une limite explicite ; les chiffres indiqués sont ceux réellement
obtenus en relançant les commandes listées, pas des estimations.

## Budget n°1 — Taille du JS partagé (chargé sur toutes les routes)

**Protocole :** `npm run build`, puis sommer la taille des fichiers listés
dans `rootMainFiles` de `.next/build-manifest.json` (le socle
framework/runtime chargé par `/` et `/catalogue`).

```bash
npm run build
# puis, pour chaque fichier de .next/build-manifest.json → rootMainFiles :
stat -c%s .next/<fichier>   # taille brute
gzip -c .next/<fichier> | wc -c   # taille compressée
```

**Mesuré (24/11/2026) :** 434,0 KiB brut / **128,9 KiB gzip**.

**Limite retenue :** rester sous 200 KiB gzip pour ce socle partagé. Marge
actuelle : ~71 KiB. Pas d'optimisation nécessaire à ce stade — le projet
n'a pas de dépendance lourde superflue (pas de librairie de graphique
tierce, le chart est du SVG fait main).

## Budget n°2 — Temps de calcul du tableau des comptes (domaine)

**Protocole :** `src/domain/account-summaries.perf.test.ts` — mesure le
temps médian (5 exécutions) de `computeAccountSummaries` sur un jeu de
données amplifié ×40 par rapport au jeu réel (123 → ~4 920 comptes, 117 →
~4 680 tickets), car le jeu réel est trop petit pour que la différence
soit mesurable de façon fiable à cette échelle.

```bash
npx vitest run src/domain/account-summaries.perf.test.ts --reporter=verbose
```

**Mesuré (24/11/2026), jeu ×40 :**

| Version | Médiane / 5 exécutions |
|---|---|
| Avant optimisation (`.filter()` sur tous les tickets, par compte) | 185,9 ms |
| **Après optimisation** (tickets pré-groupés par compte, `Map`) | **7,4 ms** |

Gain ×25 sur le jeu amplifié. **Sur le jeu réel du projet (123 comptes),
le gain absolu est négligeable** (quelques dixièmes de milliseconde) :
l'optimisation est correcte algorithmiquement (O(comptes × tickets) →
O(comptes + tickets)) mais n'apporte aucun bénéfice perceptible à cette
échelle — elle a de la valeur si le jeu de données grandit, pas aujourd'hui.
C'est dit explicitement pour ne pas survendre un gain mesuré sur un jeu
artificiellement gonflé.

**Limite retenue (budget régression) :** le calcul optimisé doit rester
sous 300 ms même sur le jeu ×40 (marge large, pour ne pas rendre le test
fragile selon la machine qui l'exécute).

## Budget n°3 — Nombre de re-rendus du tableau triable

**Protocole :** `<Profiler>` de React autour de `AccountsTable` dans un
test, en comptant les appels à `onRender` déclenchés par un clic de tri
(hors rendu initial).

```bash
npx vitest run src/components/AccountsTable.test.tsx --reporter=verbose
```

**Mesuré (24/11/2026) :** 1 clic de tri → **exactement 1 re-rendu** de
`AccountsTable` (test "un tri déclenche exactement un seul re-rendu").

**Limite retenue :** un clic de tri ne doit jamais déclencher plus d'un
re-rendu de ce composant — toute régression (ex. ajout d'un état
intermédiaire mal placé) ferait échouer ce test.

## Ce qui n'a volontairement pas été optimisé

Une proposition de l'IA d'ajouter `useMemo` autour du tri (pour "économiser"
le recalcul) a été **rejetée après mesure** : `rows` change de référence à
chaque rendu dans l'usage réel du projet, donc la mémoïsation ne sert à
rien ici et ajoute un risque de bug (dépendances oubliées). Détail complet
dans [docs/registre-ia.md](registre-ia.md), entrée 4.

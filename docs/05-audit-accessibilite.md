# Audit accessibilité — semaine 3

**Réalisé le :** vendredi 20 novembre 2026 (créneau prévu au planning : lundi 23/11, travail avancé).

## Méthode

Pas d'enregistrement vidéo d'une session clavier réelle (pas d'outil de
capture écran/vidéo disponible dans cet environnement) : la preuve
reproductible retenue est une batterie de tests automatisés
(Vitest + React Testing Library, `userEvent.tab()` / `userEvent.keyboard()`)
qui pilotent réellement le focus et le clavier sur le DOM rendu — pas une
approximation, le même mécanisme qu'un humain au clavier. C'est documenté
ici explicitement plutôt que de prétendre à une vidéo qui n'existe pas.

Complément manuel : lecture du code de chaque composant interactif pour
vérifier l'absence de `outline: none` / `tabindex` négatif / `<div
onClick>` sans rôle (recherche par `grep`, voir historique de commit).

## 5 observations

### 1. Section "Indicateurs clés" sans titre visible/sémantique — corrigé

**Avant :** les 3 sections du dashboard avaient chacune un `<h2>`, sauf la
section des 4 KPIs qui n'avait qu'un `aria-label` sur la `<section>` (pas
de heading). Incohérent, et un utilisateur de lecteur d'écran qui navigue
par titres (`H` dans NVDA/VoiceOver) ne trouvait pas cette section par ce
moyen-là.

**Après :** `<h2>Indicateurs clés</h2>` ajouté, structure identique aux 2
autres sections. Voir `src/app/page.tsx`.

### 2. Changement de tri du tableau non annoncé — corrigé

**Avant :** `AccountsTable` mettait à jour `aria-sort` visuellement, mais
aucune région "live" n'annonçait le changement à un lecteur d'écran — la
`<caption>` existante décrit le tableau une fois, elle n'est pas
réannoncée.

**Après :** un paragraphe `sr-only` avec `aria-live="polite"` annonce
"Trié par {colonne}, ordre {sens}." à chaque clic. Testé dans
`AccountsTable.test.tsx` ("annonce le tri courant dans une région live").

### 3. Changement de filtre silencieux pour les lecteurs d'écran — corrigé

**Avant :** changer période/segment met à jour les chiffres affichés,
mais rien n'indique à un utilisateur non-voyant que le contenu a changé
(pas de région live).

**Après :** un paragraphe `sr-only` avec `aria-live="polite"` annonce le
nombre de comptes affichés et les filtres actifs après chaque navigation.
**Limite assumée :** non testé avec un vrai lecteur d'écran (NVDA/VoiceOver)
faute d'outil disponible ici ; le comportement d'annonce d'une région live
réinjectée dans le DOM (vs. mise à jour en place) varie selon les
lecteurs d'écran — à vérifier manuellement avant mise en production
réelle.

### 4. Pas de lien d'évitement ("Aller au contenu") — non corrigé, assumé

**Observation :** aucun skip-link avant le contenu principal.

**Décision :** pas de correctif. L'en-tête (`AppShell`) ne contient que 2
lignes de texte, aucune navigation répétée à traverser — un skip-link
ajouterait un composant pour un bénéfice nul sur cette page précise (cf.
consigne "pas de surenchère technique"). À revoir si une vraie navigation
apparaît (semaine 4 / au-delà du périmètre actuel).

### 5. Graphique (`ActivityChart`) sans équivalent tabulaire pour l'accès aux données brutes — non corrigé, assumé

**Observation :** le SVG porte un `aria-label` descriptif et des libellés
directs en texte, mais un lecteur d'écran n'expose pas les valeurs
précises point par point (contrairement à un `<table>`).

**Décision :** pas de correctif immédiat. Les mêmes données sont déjà
accessibles sous forme de table via `AccountsTable` (comptes par segment)
et les 4 `KpiCard` (valeurs agrégées) : le graphique est un complément
visuel de tendance, pas la seule voie d'accès à l'information. Un tableau
de données brutes dédié au graphique serait pertinent si le graphique
devenait la seule source (hors périmètre de ce projet pédagogique).

## Récapitulatif

| # | Observation | Statut |
|---|---|---|
| 1 | Section KPIs sans heading | ✅ corrigé |
| 2 | Tri non annoncé (lecteur d'écran) | ✅ corrigé |
| 3 | Changement de filtre silencieux | ✅ corrigé (limite notée) |
| 4 | Pas de skip-link | ⏸ assumé, non pertinent ici |
| 5 | Graphique sans table de données | ⏸ assumé, doublon déjà accessible ailleurs |

## Preuves (reproductibles)

```bash
npm test
```

- `src/components/FilterBar.test.tsx` : un bouton de période est
  atteignable au `Tab` et activable à `Entrée` (pas de souris nécessaire).
- `src/components/AccountsTable.test.tsx` : tri déclenchable au clavier
  (`Entrée` sur un en-tête focalisé), `aria-sort` mis à jour, changement
  de tri annoncé via la région live.
- `src/components/Select.test.tsx` (déjà existant, semaine 1) : label
  associé, sélection au clavier.

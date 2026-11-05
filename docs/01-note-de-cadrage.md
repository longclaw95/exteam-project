# Note de cadrage — ProductPulse

**Date :** mercredi 4 novembre 2026 (rédigée a posteriori le 5 novembre)
**Auteur :** WZE
**Statut :** validé pour démarrage du développement

## 1. Problème métier

Un éditeur SaaS fictif ne dispose d'aucune vue consolidée de l'activité de ses
comptes clients. Le Product Manager doit aujourd'hui croiser plusieurs
exports pour répondre à des questions simples : l'activité progresse-t-elle ?
Un segment de clients se dégrade-t-il ? Une décision produit a-t-elle eu un
effet mesurable ?

**ProductPulse** est un tableau de bord qui centralise 4 indicateurs clés,
filtrables par période et par segment, pour que le PM et le responsable
support puissent répondre à ces questions sans extraction manuelle.

Ce que ProductPulse ne résout pas (hors périmètre) : pas d'alerting temps
réel, pas de prévision, pas de branchement sur des données de production
réelles — le produit tourne sur un jeu de données synthétique.

## 2. Personas

### Persona 1 — Le Product Manager (utilisateur principal)

- **Nom fictif :** Claire, PM sur le produit depuis 18 mois.
- **Objectif :** suivre l'évolution de l'activité pour prioriser la
  roadmap et préparer les points avec la direction.
- **Question type :** « Le nombre de comptes actifs a-t-il progressé depuis
  qu'on a lancé la nouvelle onboarding, il y a 30 jours ? »
- **Frustration actuelle :** doit demander les chiffres à la data team et
  attendre un export ; ne peut pas comparer deux segments facilement.
- **Besoin :** des indicateurs définis sans ambiguïté, comparables d'une
  période à l'autre, filtrables par segment en quelques secondes.

### Persona 2 — Le Responsable support

- **Nom fictif :** Karim, responsable d'une équipe de 6 agents support.
- **Objectif :** repérer rapidement un segment de clients dont la
  satisfaction ou le volume de tickets se dégrade, avant que ça remonte en
  escalade.
- **Question type :** « Quel segment a le plus de tickets ouverts cette
  semaine, et est-ce que ça correspond à une baisse de satisfaction ? »
- **Frustration actuelle :** les chiffres de support et de satisfaction
  vivent dans des outils séparés ; pas de vue croisée par segment.
- **Besoin :** un tableau triable et un filtre par segment pour isoler les
  comptes à risque.

> Le développeur de l'équipe (persona tertiaire, non détaillé ici) est traité
> comme utilisateur du code plutôt que du produit : son besoin — modifier un
> composant sans régression — est couvert par le design system et les tests,
> pas par une persona produit.

## 3. Définitions exactes des 4 indicateurs

Chaque indicateur est calculé sur la **période sélectionnée** (7, 30 ou
90 jours glissants, à partir d'aujourd'hui) et comparé à la **période
précédente de même durée immédiatement avant**. Exemple : pour une période
de 30 jours, la comparaison se fait contre les 30 jours précédant cette
période (jours -60 à -31).

| # | Indicateur | Définition exacte | Formule | Cas limites |
|---|---|---|---|---|
| 1 | **Comptes actifs** | Nombre de comptes distincts ayant généré au moins un événement d'usage sur la période, pour le segment sélectionné (ou tous segments confondus). | `COUNT(DISTINCT comptes avec ≥1 événement sur la période)` | Segment vide → 0, pas d'erreur. Compte halte en cours de période compté quand même s'il a eu ≥1 événement. |
| 2 | **Tickets créés** | Nombre de tickets support ouverts sur la période, pour le segment sélectionné. | `COUNT(tickets créés sur la période)` | Pas de tickets sur la période → 0, état vide affiché, pas de division. |
| 3 | **Taux de résolution** | Proportion de tickets créés sur la période qui sont passés au statut « résolu » avant la fin de la période. | `tickets résolus / tickets créés × 100`, arrondi à l'entier | Si `tickets créés = 0` → indicateur affiché comme « non applicable » (pas de division par zéro, pas de 0 % trompeur). |
| 4 | **Satisfaction (CSAT)** | Moyenne des notes de satisfaction (échelle 1 à 5) laissées après une interaction support sur la période. | `moyenne(notes CSAT sur la période)`, arrondie à 1 décimale | Si aucune note sur la période → « pas de données », jamais une moyenne de tableau vide (NaN). |

**Règle de comparaison** : chaque carte KPI affiche la valeur de la période
courante, la valeur de la période précédente, et la variation en points ou
en pourcentage, avec un sens (hausse = positif ou négatif selon
l'indicateur — ex. plus de tickets créés n'est pas automatiquement négatif).

**Règle d'agrégation par segment** : quand « tous segments » est sélectionné,
les indicateurs sont recalculés sur l'ensemble des comptes, pas sommés
depuis les segments (évite un double comptage si un compte change de
segment en cours de période — hypothèse retenue : un compte appartient à un
seul segment à un instant donné dans le jeu de données synthétique).

## 4. User stories (8)

Priorisées selon l'impact sur une décision produit réelle (P0 = bloquant
pour le premier livrable).

| # | Story | Priorité |
|---|---|---|
| 1 | En tant que PM, je veux voir les 4 indicateurs avec leur variation vs période précédente, pour évaluer la tendance sans calcul manuel. | P0 |
| 2 | En tant que PM, je veux filtrer par période (7/30/90 jours), pour adapter l'horizon d'analyse à la question posée. | P0 |
| 3 | En tant que responsable support, je veux filtrer par segment, pour isoler les comptes à risque. | P0 |
| 4 | En tant qu'utilisateur, je veux que changer un filtre mette à jour tous les indicateurs en même temps, pour ne jamais comparer des chiffres incohérents entre eux. | P0 |
| 5 | En tant que responsable support, je veux un tableau triable des comptes par segment, pour repérer les plus dégradés. | P1 |
| 6 | En tant qu'utilisateur, je veux voir un état de chargement et un état vide explicites, pour comprendre si l'absence de données est normale ou une erreur. | P1 |
| 7 | En tant que PM, je veux pouvoir partager un lien vers une vue filtrée précise, pour envoyer une analyse à un collègue sans refaire les filtres. | P2 |
| 8 | En tant que développeur reprenant le projet, je veux une définition écrite de chaque KPI à côté du code qui le calcule, pour ne pas réintroduire une erreur de calcul en le modifiant. | P2 |

## 5. Backlog priorisé pour la semaine 1 (livrable du 13/11)

1. Fonctions de calcul des 4 KPIs, pures et testées (stories 1, 8).
2. Jeu de données synthétique 90 jours × 3 segments.
3. AppShell + 5 composants de base (KpiCard, Select, EmptyState, Feedback, navigation).
4. Premier assemblage visuel du dashboard (valeurs statiques, pas encore filtrées) — stories 1, 6.

Les filtres synchronisés et le partage par URL (stories 2, 3, 4, 7) sont
prévus semaine 2, une fois les calculs et l'affichage stabilisés.

## 6. Communication — « utilisateur actif » en 30 secondes

> Un compte actif, sur la période qu'on regarde, c'est un compte qui s'est
> réellement servi du produit au moins une fois — pas juste un compte qui
> existe. Si on regarde les 30 derniers jours, un compte créé il y a un an
> mais inactif depuis 6 mois n'est pas compté comme actif. La limite : on ne
> distingue pas un usage ponctuel d'un usage intensif — un compte qui s'est
> connecté une fois compte autant qu'un compte très engagé. C'est volontaire
> pour ce premier indicateur ; un indicateur de profondeur d'usage pourrait
> être ajouté plus tard si le besoin se confirme.

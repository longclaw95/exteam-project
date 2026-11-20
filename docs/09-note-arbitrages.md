# Note d'arbitrages — rendu (SSR/CSR/SEO) et monofront vs micro-frontends

**Réalisé le :** vendredi 20 novembre 2026 (créneau prévu : mardi 1/12,
travail avancé). Toutes les valeurs ci-dessous ont été **mesurées** ce jour
sur le build de production (`next build` + `next start`, poste local).

## Décision actuelle

Un seul front Next.js, **rendu serveur par défaut** ; trois Client
Components seulement (`FilterBar`, `Select`, `AccountsTable`), là où
l'interaction l'exige (ADR-001, docs/02).

## Matrice de décision (3 critères observables)

| Critère | Mesure aujourd'hui | Monofront, SSR hybride *(actuel)* | CSR pur (SPA) | Micro-frontends |
|---|---|---|---|---|
| **1. Équipes / déploiements indépendants à servir** | 1 équipe, 1 déployable, 2 pages | ✅ adapté | ✅ adapté | ❌ résout un problème absent ; ajoute N builds, N pipelines, versions à synchroniser |
| **2. Données brutes envoyées au navigateur** | SSR : agrégats seulement (page HTML **12–14 KiB gzip**) | ✅ seuls les chiffres affichés quittent le serveur | ⚠️ jeu complet, ticket par ticket (aujourd'hui **5,7 KiB gzip**, mais croît avec les données réelles et expose le détail client) | = selon le rendu choisi dans chaque fragment |
| **3. Valeurs lisibles dans la 1ʳᵉ réponse, sans JavaScript** | Vérifié par `curl` : les 4 KPIs sont dans le HTML | ✅ oui | ❌ non (écran vide jusqu'au calcul client) | = selon le rendu de chaque fragment |

Repère de coût commun : JS partagé de **129,0 KiB gzip** (framework). Des
micro-frontends sans partage de dépendances configuré pourraient embarquer
jusqu'à une copie de ce socle **par fragment**.

## Ce que la mesure a corrigé dans notre propre argumentaire

La note SSR/CSR du 5/11 justifiait le rendu serveur par le **poids** du JSON
envoyé au client. Mesuré : `seed.json` fait 5,7 KiB gzip, soit ~4 % du JS
du framework. **Cet argument ne tient pas à l'échelle actuelle.** Les
raisons qui tiennent sont les critères 2 (confidentialité des données
brutes, décisive avec de vraies données clients) et 3 (chiffres présents
dès la première réponse). On le dit plutôt que de défendre un mauvais
argument.

## Quand une autre option deviendrait pertinente

- **CSR pur** : application très interactive (édition, glisser-déposer),
  usage hors ligne, ou hébergement 100 % statique sans serveur Node.
- **SSR orienté SEO / pages statiques** : dès qu'une page publique doit être
  indexée (page produit, documentation publique). Aujourd'hui : **0 page
  publique**, le SEO n'est pas un critère.
- **Micro-frontends** : plusieurs équipes autonomes qui livrent la même
  interface à des rythmes différents (ordre de grandeur : à partir de 3
  équipes sur un même front, ou des domaines métier vraiment disjoints).
  Coûts à accepter : orchestration, partage du design system et du state
  des filtres (ici dans l'URL, à faire respecter par chaque fragment),
  tests de bout en bout entre fragments.

## Non-besoins explicites

Pas de SEO, pas de hors-ligne, pas de temps réel (données rechargées à la
navigation), une seule équipe. Toute option justifiée uniquement par l'un
de ces points serait de la « surenchère technique » au sens du brief.

## Réponses à un architecte sceptique

- *« Le SSR coûte du serveur. »* — Réponse mesurée en local :
  **16–21 ms** par requête pour la vue la plus lourde (90 jours). À
  re-mesurer en conditions réelles avant production ; non bloquant ici.
- *« Pourquoi pas tout en client, c'est plus simple ? »* — Le code métier
  serait le même (`src/domain/` est pur) ; ce qui change, c'est que chaque
  navigateur recevrait toutes les données brutes (critère 2).
- *« Et si une deuxième équipe arrive ? »* — Le découpage `domain/` /
  `components/` / `app/` permet d'abord de partager le travail dans un seul
  front ; les micro-frontends ne se justifient qu'avec des cycles de
  livraison réellement indépendants.

# Support de restitution client — 5 slides, démo, FAQ

**Préparé le :** vendredi 20 novembre 2026 (créneau prévu : jeudi 3/12,
travail avancé). Public : un Product Manager et un responsable support,
non techniques. Durée cible : **5 minutes**. Règle : aucun vocabulaire de
framework ; chaque chiffre cité ci-dessous a été relevé sur l'application
(build de production, données synthétiques du 20/11).

---

## Slide 1 — Le problème (≈ 40 s)

**Titre :** « Vos indicateurs existent, mais personne ne lit les mêmes. »

- Chaque réunion commence par « d'où vient ce chiffre ? ».
- Le support découvre un segment en difficulté une fois le client mécontent.
- Comparer deux périodes demande une extraction manuelle.

*Notes orales :* partir d'une décision, pas d'un outil. « Combien de temps
passez-vous, avant une revue produit, à vous mettre d'accord sur les
chiffres plutôt qu'à décider ? »

## Slide 2 — La démo (≈ 2 min, en direct)

**Titre :** « Une page, quatre chiffres, deux filtres. »

Script — dans cet ordre :

1. **Ouvrir la vue par défaut** (30 jours, tous segments). Dire : « 123
   comptes actifs, taux de résolution 95 %, stable ; satisfaction 4,1 sur 5,
   en hausse. À ce niveau, tout va bien. »
2. **Choisir 7 jours, puis le segment PME.** Les quatre chiffres, la courbe
   et le tableau changent ensemble. Dire : « Pour les PME cette semaine, la
   résolution tombe à 75 %, −25 points, et la satisfaction à 3,5. La vue
   globale le masquait. »
   **Puis, tout de suite :** « Attention : c'est sur 4 tickets. C'est un
   signal à regarder de près, pas une conclusion. »
3. **Copier le lien de la page** et l'ouvrir dans un nouvel onglet : même
   vue. Dire : « C'est ce lien que vous envoyez à votre collègue. »
4. **Choisir 90 jours.** Les quatre cartes affichent « Pas de comparaison
   disponible ». Dire : « Nos données commencent il y a 90 jours. Plutôt
   que d'inventer une tendance, l'outil le dit. »

*Si la démo plante :* `?error=1` dans l'adresse montre l'écran d'erreur ;
le présenter comme « voici ce que voit l'utilisateur si les données ne
chargent pas ».

## Slide 3 — Les bénéfices (≈ 40 s)

**Titre :** « Décider sur les mêmes chiffres, plus vite. »

- **Une définition écrite par chiffre** : fini « d'où vient ce chiffre ? ».
- **Un segment qui décroche se voit en deux clics**, pas après la plainte.
- **Un lien = une vue** : on partage une analyse, pas une capture d'écran.
- **Ce qui n'est pas connu est affiché comme tel**, jamais comme un zéro.

## Slide 4 — Les chiffres vérifiés (≈ 40 s)

**Titre :** « Ce que nous avons prouvé, et comment. »

| Affirmation | Preuve |
|---|---|
| Les calculs résistent aux cas limites (aucune donnée, division par zéro, période sans données) | 70 tests automatiques, exécutés avant chaque enregistrement de code |
| Les 6 parcours principaux fonctionnent sur la version de production | Recette automatique : 32 contrôles sur 32 ; sur l'ancienne version, elle détectait 6 défauts aujourd'hui corrigés |
| La page reste légère | 129 KiB de code transférés (mesuré), une réponse serveur de l'ordre de 20 ms sur un poste local |
| Utilisable au clavier et avec un lecteur d'écran | Tri et filtres testés au clavier ; 7 défauts d'accessibilité corrigés lors de deux audits (dont la langue de la page, mal déclarée) |

*Notes orales :* dire aussi d'où viennent les chiffres : « tout est mesuré
sur des données fictives et sur un poste local — ce sont des ordres de
grandeur, pas des engagements de production ».

## Slide 5 — Limites et suite (≈ 40 s)

**Titre :** « Ce que ce démonstrateur n'est pas (encore). »

Limites, dites franchement :

- Données **fictives** : 123 comptes, 90 jours.
- Les taux sur une petite base peuvent impressionner à tort (75 % sur 4
  tickets) : l'outil n'affiche pas encore le nombre de tickets à côté du
  taux.
- Pas encore testé avec un vrai lecteur d'écran ni de bout en bout dans un
  navigateur réel.

Suite proposée, par ordre de valeur :

1. Afficher l'effectif à côté de chaque taux (« 75 % — 3 sur 4 »).
2. Brancher une vraie source de données (lecture seule).
3. Tests navigateur et lecteur d'écran avant toute mise en production.

---

## FAQ — 4 objections probables

**1. « +150 % de tickets Enterprise sur la semaine, c'est alarmant ? »**
Non, pas en soi : c'est le passage de 2 à 5 tickets. Un pourcentage sur
une petite base exagère. C'est pour cela que la carte affiche aussi la
valeur brute (5), et que l'indicateur « tickets créés » n'est volontairement
coloré ni en vert ni en rouge : plus de tickets peut aussi vouloir dire
plus d'usage. Prochaine étape : afficher l'effectif à côté des taux.

**2. « Pourquoi “Pas de comparaison disponible” en 90 jours ? C'est un
bug ? »**
Non, c'est volontaire. Les données commencent il y a 90 jours : la période
précédente n'existe pas dans les données. Une première version affichait
« zéro » à la place, et donc une fausse « hausse » ; nous l'avons corrigé
— mieux vaut un « je ne sais pas » qu'un faux chiffre.

**3. « Nos chiffres ne correspondent pas à ceux de l'autre outil. »**
C'est souvent une question de définition : « actif sur 30 jours » ne donne
pas le même nombre qu'une moyenne d'actifs par jour, et un compte actif 10
jours n'est compté qu'une fois ici. Chaque indicateur a une définition
écrite et une formule (note de cadrage) : c'est elle qu'il faut comparer
avant les chiffres.

**4. « Combien de temps pour l'avoir sur nos vraies données ? »**
Le calcul est séparé de l'affichage : seule la source de données change.
Sans connaître votre système, je ne m'engage pas sur un délai précis ; la
première étape serait d'auditer vos données réelles (formats, dates
manquantes, définitions existantes).

---

## Reste à faire par la personne qui présente

- [ ] Répéter la démo en suivant le script ci-dessus, chronomètre en main.
- [ ] Enregistrer l'essai de 5 minutes (exigé par le planning).
- [ ] Mettre les 5 slides en forme (le contenu ci-dessus suffit ; une
      slide = un titre + 3 ou 4 lignes).

# Chauffage central et radiateurs (simulateur de plan)

Utilisé dans `src/lib/plan/temperatures.ts` avec `regulation` (`src/data/plan-thermique.ts`).

## Appareils

- **Poêles** : un ou plusieurs, chacun dans sa pièce, avec sa nature (granulés, canalisable, bois), sa puissance et son
  réglage. Plage de fonctionnement : `research/regulation-poele.md`. Air plus chaud sous le plafond de leur pièce :
  `research/stratification-poele.md`.
- **Radiateurs électriques** : donnent jusqu'à leur puissance, leur thermostat limitant la chaleur au réglage.
- **Radiateurs à eau** : puissance nominale P50 (eau à 75/65 °C, pièce à 20 °C, EN 442). Émission dans d'autres conditions :
  P = P50 · ((T_eau moyenne − T_pièce) / 50)^1,3 ; exposant de 1,28 à 1,36 selon les modèles du catalogue Purmo (valeur
  déjà utilisée par l'outil « radiateurs et pompe à chaleur »). Le robinet thermostatique limite la chaleur au réglage.

## Chaudière ou pompe à chaleur

Une seule par maison, posée sur le plan avec l'outil « Chaudière » (dans n'importe quelle pièce, chauffée ou non : garage,
cellier…). Son emplacement ne change pas le calcul : il sert au plan envoyé et au devis. La reposer ailleurs la déplace.
Outils séparés « Chaudière » et « Pompe à chaleur » ; poser l'un remplace l'autre. Puissance proposée à la pose : le besoin
de la maison par −9,5 °C (calcul 3CL du simulateur), arrondi au kW supérieur, 3 kW au moins ; un bouton la réajuste si le plan
change. C'est la règle de l'outil « pompe à chaleur » du site : la puissance à fournir par grand froid, à comparer à la
puissance « Prated » des fiches (donnée pour −10 °C en climat moyen). Eau au départ proposée : 70 °C pour une chaudière,
55 °C pour une pompe à chaleur (moyenne température, règlement 813/2013).
Son détail règle le type (chaudière ou pompe à chaleur), la puissance et l'eau au départ, et propose de mettre un radiateur
à eau dans chaque pièce chauffée qui n'en a pas.

## Pompe à chaleur air/air (ajoutée le 2 octobre 2026)

Outil « PAC air/air » : une unité intérieure murale (split) par pièce, posée contre un mur comme un radiateur. Elle souffle de
l'air chaud et suit son réglage, comme un radiateur électrique : elle donne jusqu'à sa puissance, son thermostat limite la
chaleur au réglage. Puissance proposée : le besoin de la pièce par grand froid, arrondi aux 100 W.

Puissance à saisir : la puissance de chauffage « Pdesignh » des fiches, donnée pour la température de calcul Tdesignh de
**−10 °C** en climat moyen (règlement (UE) 206/2012, annexe II, tableau 3 : https://www.legislation.gov.uk/eur/2012/206/annex/II/adopted).
Simplification : le calcul garde cette puissance quel que soit le temps (une PAC air/air donne davantage par temps doux) ;
l'unité extérieure (puissance totale d'un multisplit) n'est pas modélisée.

## Poêle hydro (ajouté le 1er octobre 2026)

Poêle à granulés qui chauffe l'eau des radiateurs. Il cède une part de sa puissance à l'eau, le reste chauffant sa pièce.
Part par défaut : **80 %**, réglable de 50 à 95 % (Edilkamin Blade2 H 18 Up : 15,5 kW à l'eau sur 19,2 kW de puissance utile,
soit 81 % ; fiche technique du fabricant). Allure minimale : 30 %, comme les autres poêles à granulés (5,4 kW sur 19,2 kW
pour le même modèle, soit 28 %).

Fonctionnement retenu : il est piloté par la demande des radiateurs (robinets thermostatiques), qu'il sert avant la chaudière
s'il y en a une ; s'il y a plusieurs poêles hydro, chacun en proportion de sa puissance à l'eau. Sa pièce reçoit le reste de
sa chaleur, sans réglage propre. Sous son allure minimale, il fonctionne par intermittence (puissance moyenne). Sans radiateur
à eau, il reste éteint. L'eau suit la même loi d'eau qu'avec une chaudière (départ réglable, écart départ / retour de 10 K) :
simplification, les poêles hydro réglant souvent une température de départ fixe avec un ballon tampon.

## Température de l'eau

- Départ par grand froid réglé par l'utilisateur (« Eau au départ par grand froid »).
- Loi d'eau **linéaire** entre 20 °C d'eau quand il fait 20 °C dehors et ce départ à la température de base (−9,5 °C).
  Simplification : les lois d'eau réelles sont réglées installation par installation.
- Température moyenne dans les radiateurs = départ − moitié de l'écart départ / retour, réduit en proportion par temps doux :
  écart de **10 K** pour une chaudière (régime nominal 75/65 °C de l'EN 442), **8 K** pour une pompe à chaleur (55/47 °C,
  règlement (UE) 813/2013, annexe III, tableau 3).

## Générateur

Si la somme des radiateurs à eau dépasse la puissance du générateur, chaque radiateur ne reçoit que la même fraction de ce
qu'il demande (recherche par dichotomie), et l'outil signale un générateur trop juste.

## Ordre de chauffe dans une pièce

L'appareil réglé le plus haut chauffe d'abord (un poêle avant un radiateur à réglage égal) ; les autres ne complètent que
si la pièce descend sous leur propre réglage. Exemple : poêle réglé à 20 °C et radiateur à 19 °C dans le séjour, le
radiateur ne fonctionne que si le poêle ne suffit pas.

## Puissance proposée pour un nouveau radiateur

Besoin de la pièce par grand froid (calcul 3CL), divisé par le facteur d'émission à la température d'eau du chauffage
central et une pièce à 19 °C ; arrondi à la centaine de watts supérieure. Électrique : le besoin, arrondi de même.

## Limite connue

Avec des poêles très surdimensionnés (par exemple deux poêles de 8 kW pour une maison qui demande 6 kW), une pièce voisine
peut sortir un peu plus chaude que la pièce du poêle : effet du surplus d'air chaud sous plafond, appliqué tel quel.

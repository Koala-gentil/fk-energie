# Dimensionnement des radiateurs (simulateur de plan)

Fenêtre « Dimensionner les radiateurs », ouverte depuis l'étape Résultat, l'étape Chauffage ou le menu « ⋯ » : récapitulatif
(puissance nominale totale, éléments ou longueur au total, température de l'eau), puis une carte par pièce avec le radiateur
dessiné à l'échelle (2 m de large pour toutes les cartes).

Utilisé dans `src/data/radiateurs.ts` et `src/scripts/plan-editeur.ts` (`rendreDimensionnement`).

## Calcul

1. Besoin de la pièce par grand froid (−9,5 °C dehors, 19 °C dedans) : calcul 3CL du simulateur.
2. Température moyenne de l'eau par grand froid : départ choisi moins la moitié de l'écart départ / retour (10 K pour une
   chaudière, régime 75/65 de l'EN 442 ; 8 K pour une pompe à chaleur, 55/47 du règlement 813/2013).
3. Puissance nominale nécessaire (ΔT 50, régime 75/65/20 °C) : besoin ÷ ((T eau − 19) / 50)^1,3, exposant de la norme
   EN 442 (1,28 à 1,36 selon les modèles Purmo, voir `donnees-outils.md` § 8a).
4. Nombre d'éléments : puissance nominale ÷ puissance d'un élément, arrondi au-dessus. Panneaux : longueur arrondie aux
   10 cm au-dessus (40 cm au moins). Au-delà de 1,6 m (éléments) ou 2 m (panneaux), on propose plusieurs radiateurs.

## Catalogues

| Gamme | Source | Confiance |
|---|---|---|
| Idéal Néo-Classic, fonte, 2 / 3 / 4 / 6 colonnes, 33 à 107 cm | Frédéric Matt, distributeur : https://www.fredericmatt.com/radiateurs/tech-ideal-neoclassic | C (distributeur) |
| Idéal Classic, fonte (modèle ancien), 4 / 6 colonnes, 46 à 92 cm | Frédéric Matt : https://www.fredericmatt.com/radiateurs/tech-ideal-classic | C (distributeur) |
| Zehnder Charleston, acier tubulaire, 2 à 6 colonnes, 30 cm à 2 m | Fiche produit Zehnder V20200518 (hébergée par un distributeur) : https://www.etaz.rs/imgDocuments/424/Tehni%C4%8Dke%20karakteristike%20CHARLSTON.pdf | A (fabricant, EN 442) |
| Purmo Compact, panneaux acier types 11 / 21 / 22 / 33, 30 à 90 cm | Catalogue technique Purmo 10/2021 : voir `donnees-outils.md` § 8b | B |

Zehnder Charleston : longueur totale = nombre d'éléments × 46 mm + 26 mm (fiche). Fonte Idéal : largeur d'un élément de
5 à 6 cm selon le modèle (même source). Charleston : hauteurs retenues 30, 40, 50, 60, 75, 90,
100, 120, 150, 180 et 200 cm (2 colonnes : 29,2 à 199,2 cm) ; les intermédiaires (35, 45, 55 cm) et la plus basse (environ 19 cm)
ne sont pas reprises.

Hauteurs : celles du catalogue de chaque gamme (hauteur totale, pieds compris pour la fonte Idéal Classic).

## Limites

- Les puissances de la fonte Idéal viennent d'un distributeur : aucun catalogue Ideal Standard ou Chappée actuel n'a été
  trouvé en ligne.
- Le calcul ne tient pas compte de l'emplacement (sous une fenêtre, derrière un meuble) ni du raccordement.

# Air plus chaud sous le plafond de la pièce du poêle (simulateur de plan)

Utilisé dans `src/lib/plan/temperatures.ts` (`surplus`) avec `physiqueEchanges.stratificationPoele` (`src/data/plan-thermique.ts`).

## Pourquoi

Le modèle de températures est un bilan pièce par pièce, chaque pièce à une seule température. Dans la pièce du poêle,
l'air chaud monte et s'accumule sous le plafond : c'est cet air qui part par le haut des portes ouvertes, monte par
l'escalier et chauffe le plancher de l'étage, alors que la consigne du poêle porte sur la zone où l'on vit. Sans ce
phénomène, le modèle donnait des chambres 5 à 7 °C plus froides que le séjour dans une maison à étage bien isolée, bien
plus que l'expérience des installations FK Énergie et que l'étude citée ci-dessous.

## Modélisation

Quand le poêle fonctionne, la pièce du poêle échange avec les pièces **du même niveau et du dessus** (cloisons, portes
ouvertes, escalier, plancher) comme si elle était à sa température de consigne **+ 3 K**. Le bilan d'énergie reste exact
(ce que la pièce du poêle donne, ses voisines le reçoivent). Les pièces du dessous (poêle à l'étage) ne sont pas concernées.

## Calage (choix validé le 1er octobre 2026)

Aucune mesure publiée exploitable n'a été trouvée pour l'écart entre l'air sous le plafond et la zone de vie dans une
pièce chauffée par un poêle (recherches : EN 15316-2, Overby et Steen-Thøde 1989, Sikula 2007). La valeur de 3 K est
donc un **calage** sur :

- **Persson, Nordlander, Rönnelid (2005)**, *Electrical savings by use of wood pellet stoves and solar heating systems in
  electrically heated single-family houses*, Energy and Buildings 37(9), 920-929, doi:10.1016/j.enbuild.2004.10.013 : avec
  un poêle à granulés, « un écart d'environ 3 °C entre les chambres et le séjour doit être accepté » (conclusion du résumé ;
  texte intégral non consulté).

Cas de référence : modèle « Maison à étage » du simulateur, bien isolé (2006-2012, 12 cm de laine de verre sur les murs,
30 cm en combles, plancher sur vide sanitaire isolé, double vitrage récent, VMC hygroréglable, dalle béton entre étages),
poêle à granulés de 8 kW réglé à 20 °C, 3 °C dehors, aucun autre chauffage.

| Surplus sous plafond | Chambres       | Palier  | Salle de bain | Écart chambres / séjour |
| -------------------- | -------------- | ------- | ------------- | ----------------------- |
| 0 K                  | 14,4-14,6 °C   | 15,2 °C | 13,3 °C       | 5,4 à 5,6 °C            |
| 2 K                  | 15,7-15,9 °C   | 16,6 °C | 14,5 °C       | 4,1 à 4,3 °C            |
| **3 K (retenu)**     | 16,4-16,6 °C   | 17,3 °C | 15,1 °C       | 3,4 à 3,6 °C            |
| 4 K                  | 17,0-17,3 °C   | 18,1 °C | 15,6 °C       | 2,7 à 3,0 °C            |

Dans une maison moins isolée (valeurs par défaut du DPE pour 1989-2000), l'écart reste d'environ 5 °C : les pièces
éloignées perdent plus de chaleur pour le même apport venu du séjour.

## À faire

Confirmer ou corriger la valeur avec des relevés chez des clients : température de chaque pièce, réglage et puissance du
poêle, température extérieure, portes ouvertes ou fermées.

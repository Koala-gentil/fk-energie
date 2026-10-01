# Guide « Quelle puissance de poêle à granulés choisir ? » : chiffres et sources

Guide : `src/content/conseils/quelle-puissance-de-poele-a-granules.md`. Graphique : `temperatures-etage` dans
`src/lib/graphiques-articles.ts` (valeurs figées, à recalculer si le simulateur change).

## Scénarios du simulateur (1er octobre 2026)

Modèle « Maison à étage » de `/outils/plan-maison/` (117 m² chauffés, escalier ouvert dans l'entrée, portes des chambres
ouvertes, porte de la salle de bain fermée), version bien isolée de `research/stratification-poele.md` : 2006-2012,
parpaing 20 cm + 12 cm de laine de verre, 30 cm de laine de verre en combles, vide sanitaire isolé (10 cm de polystyrène),
double vitrage récent, VMC hygroréglable, dalle béton entre étages. Besoin de toute la maison par −9,5 °C : 6,2 kW.
Poêle à granulés dans le séjour, aucun autre chauffage sauf mention. 3 °C = température moyenne de janvier (3CL,
`tJanvier`) ; −9,5 °C = température de base du Nord (3CL).

Résultats identiques avant et après la refonte multi-émetteurs du simulateur (vérifié le 1er octobre 2026).

### Puissance du poêle, réglé à 20 °C

| Dehors  | 4 kW                     | 6 kW       | 8 kW       | 10 kW                  | 13 kW                  |
| ------- | ------------------------ | ---------- | ---------- | ---------------------- | ---------------------- |
| 3 °C    | 2,75 kW (69 %)           | 46 %       | 34 %       | marche/arrêt, 21 °C    | marche/arrêt, 21 °C    |
| 0 °C    | 3,28 kW (82 %)           | 55 %       | 41 %       | 33 %                   | marche/arrêt, 21 °C    |
| −5 °C   | maximum, séjour 19 °C    | 70 %       | 52 %       | 42 %                   | 32 %                   |
| −9,5 °C | maximum, séjour 14,5 °C  | 83 %       | 62 %       | 50 %                   | 38 %                   |

Quand le poêle tient sa consigne, les températures de toutes les pièces sont les mêmes quelle que soit sa puissance.

### Réglage du poêle (8 kW) et chambres de l'étage

| Réglage | 3 °C : séjour / chambres / puissance | −9,5 °C : chambres / puissance |
| ------- | ------------------------------------ | ------------------------------ |
| 20 °C   | 20 / 16,4-16,6 / 2,75 kW             | 12,5-12,8 / 4,99 kW            |
| 21 °C   | 21 / 17,1-17,3 / 2,93 kW             | 13,2-13,5 / 5,17 kW            |
| 22 °C   | 22 / 17,7-17,9 / 3,10 kW             | 13,9-14,2 / 5,35 kW            |
| 23 °C   | 23 / 18,4-18,6 / 3,28 kW             | 14,6-14,9 / 5,53 kW            |

Par −9,5 °C, poêle de 13 kW : réglage 25 °C → chambres 16,0-16,4 ; 28 °C → 18,1-18,5 (6,4 kW, 49 %).

### Variantes

- Portes des chambres et de la salle de bain fermées, réglage 23 °C, 3 °C dehors : chambres 17,1-17,8 °C (au lieu de
  18,4-18,6).
- Radiateurs électriques réglés à 18 °C dans les chambres, la salle de bain et le palier, poêle 8 kW réglé à 20 °C :
  3 °C dehors, appoint 0,51 kW et poêle 2,42 kW ; −9,5 °C, appoint 1,92 kW et poêle 3,68 kW.
- Même maison avec les valeurs par défaut du DPE pour 1989-2000 (besoin 8,8 kW par −9,5 °C), poêle 8 kW réglé à 23 °C :
  chambres 16,5-16,8 °C par 3 °C, 11,8-12,3 °C par −9,5 °C.

## Sources citées dans le guide

- ADEME (2023), *Performances réelles de poêles à granulés* (copie : actu-environnement.com, voir
  `research/regulation-poele.md`). Passages utilisés (pages du PDF) : consigne respectée dans le salon avec 1 °C de plus en moyenne
  (p. 5) ; performances bien plus faibles à allure réduite pour un tiers des appareils, allures utilisées quand les poêles
  modulent ou sont surdimensionnés (p. 5) ; poêles d'environ 8 kW chauffant 45 à 143 m², moyenne 90 m² (p. 27-28) ; le
  poêle élève la température de la pièce de nuit sans atteindre la consigne, l'appoint se déclenche (p. 28) ; thermostat
  plus frais que le séjour → le poêle continue au-delà de la consigne (p. 28) ; thermostats fixes à l'arrière ou déportés
  (p. 39) ; émissions à l'allumage et à l'arrêt en marche/arrêt, « bon dimensionnement de l'appareil » (p. 64-65).
- ADEME, *Adopter le chauffage au bois* (2020), p. 15 : surdimensionnement « en prévision de températures très basses »,
  fonctionnement au ralenti, corrosion, appoint pour les grands froids, puissances de 4 à 12 kW.
- ADEME, *Un hiver tout confort* (décembre 2021) : pièces de vie 20-21 °C occupées, chambre 17 °C la nuit, 1 °C en
  moins = 7 % d'économie.
- Persson, Nordlander, Rönnelid (2005) : écart d'environ 3 °C entre chambres et séjour à accepter (résumé).
- Peppes, Santamouris, Asimakopoulos (2002) : échange d'air par un escalier (voir `research/echanges-escalier.md`).

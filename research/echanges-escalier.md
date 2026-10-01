# Échange de chaleur par un escalier ouvert (simulateur de plan)

Utilisé dans `src/lib/plan/temperatures.ts` (`gTremie`) avec `physiqueEchanges.cdEscalier` (`src/data/plan-thermique.ts`).

## Loi retenue

Débit d'air échangé dans chaque sens entre le niveau du bas (plus chaud) et celui du haut :

    Q = Cd · A · √(g · H · ΔT / T)

- A : surface de la trémie (m²) ; H : hauteur d'étage, prise égale à la hauteur sous plafond (prudent) ;
- ΔT : écart entre les deux pièces reliées par l'escalier ; T : température moyenne absolue ;
- Cd = 0,23 ; aucun échange si le haut est plus chaud que le bas.

Chaleur échangée : ρ·cp·Q·ΔT, avec ρ·cp = 1,2 × 1005 J/m³·K.

## Sources

1. **Peppes, Santamouris, Asimakopoulos (2002)**, *Experimental and numerical study of buoyancy-driven stairwell flow in a
   three storey building*, Building and Environment 37(5), 497-506, doi:10.1016/S0360-1323(01)00060-9. Mesures au gaz traceur
   dans un bâtiment réel. Selon le résumé : le débit et le coefficient de débit de l'ouverture horizontale formée par l'escalier
   dépendent de l'écart de température entre les niveaux ; coefficient de débit moyen **0,23** (0,41 avec trois ouvertures).
   Le résumé donne aussi Q = 0,1469 · A · √(gH) · (ΔT/T)^0,3, qui donne un échange encore plus fort (environ 1,5 fois à 4 K).
   **Seul le résumé a pu être consulté** (article payant) : la définition exacte du coefficient (surface de référence) n'a pas
   été vérifiée dans le texte. Choix validé le 1er octobre 2026 : retenir ces mesures en bâtiment réel.
2. **Zohrabian (1989)**, thèse, Brunel University, *An experimental and theoretical study of buoyancy driven air-flow in a
   half-scale stairwell model* (https://bura.brunel.ac.uk/handle/2438/5349), texte intégral consulté. Maquette d'escalier
   fermé au 1/2 (13 marches, largeur 0,608 m, col de 0,462 m²). D'après les tableaux 3.7 (températures des courants montant
   et descendant au col) et 3.8 (débits) :

   | Chauffage | ΔT au col | Débit montant | C = Q / (A_col · √(g·h·ΔT/T)) |
   | --------- | --------- | ------------- | ----------------------------- |
   | 100 W     | 1,9 K     | 0,0223 m³/s   | 0,171                         |
   | 300 W     | 3,3 K     | 0,0297 m³/s   | 0,173                         |
   | 600 W     | 6,4 K     | 0,0378 m³/s   | 0,158                         |
   | 900 W     | 10,0 K    | 0,0490 m³/s   | 0,164                         |

   C ≈ 0,165, rapporté à la section du col (en vraie grandeur : largeur × 1,52 m) et non à la trémie. Pour l'escalier du
   modèle « Maison à étage » (1 m × 2,5 m), cela donne un échange environ 2 fois plus faible que la loi retenue. Plus de la
   moitié de la chaleur de la maquette se perdait par ses parois, ce qui réduit les débits.
3. **Riffat (1989)**, *Measurement of heat and mass transfer between the lower and upper floors of a house*, International
   Journal of Energy Research 13, 231-241 (https://www.aivc.org/sites/default/files/airbase_4784.pdf). Maison anglaise dont
   l'escalier est fermé par **une porte** : 194 m³/h à 0,5 K et 276 m³/h à 3,5 K d'écart entre les étages. Configuration
   différente (porte verticale), non utilisée, mais du même ordre que la loi d'une porte ouverte déjà employée.

## Comparaison (escalier de 1 m × 2,5 m, H = 2,5 m)

| ΔT  | Epstein (ancienne loi) | Zohrabian   | Peppes, Cd 0,23 (retenue) |
| --- | ---------------------- | ----------- | ------------------------- |
| 2 K | 0,061 m³/s             | 0,103 m³/s  | 0,236 m³/s                |
| 4 K | 0,086 m³/s             | 0,146 m³/s  | 0,334 m³/s                |
| 8 K | 0,122 m³/s             | 0,206 m³/s  | 0,473 m³/s                |

La corrélation d'Epstein (Cooper, NISTIR 89-4052) décrit une ouverture dans une paroi horizontale fine ; un escalier
forme un passage organisé (air chaud qui monte d'un côté, air froid qui descend le long des marches) bien plus perméable.

## Effet sur les modèles du simulateur (3 °C dehors, poêle à granulés 8 kW réglé à 20 °C, aucun autre chauffage)

Maison à étage (escalier dans l'entrée) : chambres 12,1-12,4 °C → 12,9-13,1 °C ; palier 12,9 → 14,0 °C.

## Limites qui restent (le calcul reste prudent)

- L'air plus chaud sous le plafond de la pièce du poêle est maintenant pris en compte par un calage (voir
  `research/stratification-poele.md`). Les autres pièces restent supposées à température uniforme.
- Ni soleil ni inertie ; valeurs d'isolation par défaut du DPE quand l'isolant est inconnu.
- À confirmer par des mesures dans des maisons équipées par FK Énergie (température de chaque pièce et réglage du poêle).

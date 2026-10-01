# Soleil, inertie et journée type (simulateur de plan)

Utilisé dans `src/lib/plan/solaire.ts`, `src/lib/plan/inertie.ts` et `src/lib/plan/temperatures.ts` (`journee`), avec
`soleilJanvier`, `journeeJanvier` et `physiqueEchanges.capaciteAirMobilier` (`src/data/plan-thermique.ts`).

## Soleil par les fenêtres (méthode 3CL-DPE 2021, § 6.2 et § 18)

Apport de chaque fenêtre ou porte-fenêtre : A · Sw · Fe · C1 · E, rapporté aux 744 heures de janvier.

- **E** : ensoleillement de janvier d'une paroi verticale au sud, zone H1a (Nord, Pas-de-Calais), altitude ≤ 400 m :
  **38,36 kWh/m²**, soit 52 W/m² en moyenne.
- **C1** (§ 18.5, zone H1a, janvier, paroi verticale) : sud **1,00**, ouest **0,43**, nord **0,31**, est **0,40**.
  L'orientation de chaque mur vient du réglage « Le haut du plan regarde vers le… ».
- **Sw** (§ 6.2.1, valeurs par défaut, menuiserie PVC au nu intérieur) : fenêtre battante 0,49 (simple), 0,44 (double),
  0,39 (double à isolation renforcée, retenu pour « double vitrage récent »), 0,38 (triple) ; porte-fenêtre battante sans
  soubassement 0,51, 0,46, 0,40, 0,39.
- **Fe = 1** : pas de masques (le plan ne décrit ni balcons ni bâtiments voisins). Les portes ne comptent pas (§ 6.2).
- Par grand froid (−9,5 °C), pas de soleil : c'est la convention du dimensionnement.

Exemple, maison à étage du simulateur : séjour 117 W en moyenne en janvier (porte-fenêtre au sud), chambres 8 à 36 W.

## Inertie (3CL, § 7 et § 8 ; EN ISO 13790)

Classe de chaque niveau d'après la 3CL (§ 7.4) : plancher bas lourd, plancher haut lourd, murs lourds (3 : très lourde,
2 : lourde, 1 : moyenne, 0 : légère). Règles par défaut de la méthode quand l'outil ne sait pas :

- plancher bas du rez-de-chaussée : lourd (« un plancher bas (autre que sur terre-plein) dont l'inertie est inconnue est
  considéré par défaut à inertie lourde », et une dalle sur terre-plein est en béton) ; aux étages : dalle béton = lourd ;
- plancher haut : sous combles, inconnu donc léger ; toit-terrasse ou logement au-dessus : lourd ; sous un autre niveau :
  dalle béton = lourd ;
- murs : lourds pour parpaing, béton, brique pleine ou pierre **sans isolant intérieur** ; isolant « inconnu » : on suppose
  une isolation intérieure, donc des murs légers (« Les murs inconnus sont considérés à faible inertie »).

Capacité : légère 110 000, moyenne 165 000, lourde ou très lourde 260 000 J/K par m² (Cin de la 3CL, § 8 ; mêmes valeurs
que l'EN ISO 13790). Surface de la masse efficace : 2,5 × la surface au sol (légère, moyenne), 3 (lourde), 3,5 (très
lourde), EN ISO 13790 tableau 12. L'utilisateur peut forcer la classe à l'étape « Maison » (Plus de réglages).

## Calcul heure par heure (EN ISO 13790, méthode horaire simplifiée « 5R1C »)

Chaque pièce a trois nœuds : air, surfaces, masse. Ventilation entre l'air et l'extérieur ; fenêtres et portes entre les
surfaces et l'extérieur ; parois opaques, ponts thermiques et pièces non chauffées entre la masse et l'extérieur ;
H_tr,is = 3,45 × 4,5 × surface au sol entre l'air et les surfaces ; H_tr,ms = 9,1 × surface de masse entre les surfaces
et la masse. Apports : la moitié des apports internes dans l'air ; l'autre moitié et le soleil répartis entre surfaces et
masse selon les formules de la norme (description publique : bibliothèque Modelica Buildings, LBNL). Les échanges entre
pièces (cloisons, portes, escalier, planchers) et les appareils de chauffage sont branchés sur l'air.

**Air et mobilier** : 10 000 J/K par m² de plancher, valeur par défaut **rapportée** de l'EN ISO 52016-1 (tableau A.17) ;
le texte de la norme n'a pas pu être consulté. Ordre de grandeur : l'air seul fait environ 3 000 J/K par m².

**Journée type de janvier** :

- température extérieure : moyenne choisie ± 2,45 K, maximum à 14 h (Lille-Lesquin, normales 1991-2020 de janvier :
  maximales 6,6 °C, minimales 1,7 °C ; Météo-France, fiche 59343001) ; forme sinusoïdale ;
- soleil : de 8 h 43 à 17 h 10 (heures légales du lever et du coucher le 15 janvier à Lille, formules NOAA), en
  demi-sinusoïde, même énergie que la moyenne du mois ;
- on enchaîne 5 journées identiques et on garde la dernière (régime établi, vérifié par comparaison avec la veille).

**Chauffage continu** : les thermostats restent au même réglage toute la journée. Les programmes (baisse la nuit,
absence en journée) ont été retirés de l'outil le 1er octobre 2026 : jugés peu clairs pour un client. Le résultat affiché
est la température moyenne de chaque pièce sur la journée, avec l'écart entre la plus basse et la plus haute dans
le tableau de l'étape « Résultat ».

**Température dehors** : réglée par l'utilisateur (curseur de −15 à 15 °C au-dessus du plan, à l'étape « Chauffage »), raccourcis
« Janvier » (moyenne de janvier) et « Grand froid » (température de base, sans soleil).

Un poêle trop puissant pour l'heure (sous son allure minimale) fonctionne une partie de l'heure : on prend sa puissance
moyenne, comme en régime permanent. Un essai de marche/arrêt heure par heure faisait osciller l'air de 5 °C d'une heure à
l'autre, ce qui n'a pas de sens : les cycles réels durent moins d'une heure.

## Limites connues

- La chaleur que le corps du poêle restitue après une flambée et son rayonnement direct sur les murs ne sont pas comptés :
  avec un poêle à bois en flambées, la baisse calculée entre deux charges est trop brutale (le séjour retombe vite vers
  la température des murs).
- Le modèle « plain-pied » a reçu une porte ouverte entre le séjour et la cuisine (1er octobre 2026) : sans elle, la
  cuisine n'était reliée au séjour que par le couloir.

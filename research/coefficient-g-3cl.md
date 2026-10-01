# Coefficient G par époque de construction, calculé avec les valeurs par défaut de la méthode 3CL-DPE 2021

Rapport rédigé le 1er octobre 2026 pour les calculateurs du site FK Énergie (Nord et Pas-de-Calais, zone climatique H1a).

**Source unique des valeurs U, b, ψ et débits** : arrêté du 31 mars 2021, annexe 1 « Méthode de calcul 3CL-DPE 2021 », version consolidée (« Dernière mise à jour - Octobre 2021 »), fichier `annexe1_3cl.pdf` :
https://rt-re-batiment.developpement-durable.gouv.fr/IMG/pdf/consolide_annexe_1_arrete_du_31_03_2021_relatif_aux_methodes_et_procedures_applicables.pdf

Dans ce PDF, le numéro de page du PDF est identique au numéro imprimé en pied de page (vérifié page par page). Les tableaux Umur_tab (p. 13) et Upb_tab/Uph_tab (p. 17 et 21) ont été lus sur le rendu image des pages : Umur_tab est une image intégrée dans le schéma, absente du texte extrait.

Calculs reproductibles : `calculs/coefficient-g-3cl.py`.

---

## 1. Méthode

- Déperditions de l'enveloppe (annexe 1, §3, p. 7) : GV = DPmur + DPplancher_bas + DPplancher_haut + DPmenuiserie + PT + DR, avec DPparoi = Σ b·S·U.
- Renouvellement d'air (§4, p. 38) : DR = Hvent + Hperm.
- Coefficient G = GV / volume chauffé (250 m³).
- Puissance de contrôle : P = GV × (Tint − Tbase) = GV × (19 − (−9,5)) = GV × 28,5 K.
  - Tbase −9,5 °C : zones H1a/H1b/H1c, altitude < 400 m (§18.1, p. 120). Nord (59) et Pas-de-Calais (62) sont en H1a (§18.1, p. 120).
  - Tint 19 °C : consigne conventionnelle 3CL (§9.1.1).
- Chauffage : colonne **« Autres »** (non effet Joule), zone **H1**, partout.
- Une paroi d'isolation « inconnue » reçoit U = min(U non isolé ; U_tab de l'année de construction). Si l'année d'isolation est connue, U_tab est lu à cette année (schémas §3.2.1.1, §3.2.2.1, §3.2.3.1). Pour un bâtiment ≤ 1974 isolé à une date inconnue, l'année d'isolation retenue est 75-77 (même schéma).

---

## 2. Valeurs extraites de l'annexe 1 (zone H1, chauffage « Autres »)

### 2.1 Murs, planchers hauts et planchers bas : valeurs tabulées par année de construction ou d'isolation

| Année | Umur_tab (§3.2.1.1, p. 13) | Uph_tab combles (§3.2.3.1, p. 21) | Upb_tab (§3.2.2.1, p. 17) |
|---|---|---|---|
| ≤ 74 ou inconnue | 2,5 | 2,5 | 2 |
| 75-77 | 1 | 0,5 | 0,9 |
| 78-82 | 1 | 0,5 | 0,9 |
| 83-88 | 0,8 | 0,3 | 0,8 |
| 89-00 | 0,5 | 0,25 | 0,5 |
| 01-05 | 0,4 | 0,23 | 0,3 |
| 06-12 | 0,36 | 0,2 | 0,27 |
| ≥ 13 | 0,23 | 0,14 | 0,23 |

Pour comparaison, la colonne H1 « Effet joule » diffère sur quelques lignes :
- Umur : 78-82 = 0,8 ; 83-88 = 0,7 ; 89-00 = 0,45.
- Uph combles : 78-82 = 0,4.
- Upb : 78-82 = 0,8 ; 83-88 = 0,55 ; 89-00 = 0,55.

Les valeurs « Effet joule » ne sont pas utilisées ici.

Uph_tab « Terrasse » H1 Autres (non utilisé) : 2,5 / 0,75 / 0,75 / 0,55 / 0,4 / 0,3 / 0,27 / 0,14.

### 2.2 Parois non isolées (avant 1975, jamais isolées)

| Grandeur | Valeur | Source |
|---|---|---|
| Umur_nu | min(Umur0 ; 2,5). Type de mur inconnu : 2,5 | §3.2.1.1, p. 13 |
| Umur0, brique pleine simple 19 cm / 23 cm / 34 cm | 2,75 / 2,5 / 2 | §3.2.1.2, p. 14 |
| Umur0, blocs béton creux ≤ 20 cm | 2,8 | p. 15 |
| Rdoublage (doublage connu ou lame d'air > 15 mm) | 0,21 m²·K/W | p. 16 |
| Uph0, type de plafond inconnu | 2,5 | §3.2.3.1, p. 21 |
| Uph0, plafond plâtre / plafond bois sous solives bois | 2,5 / 2,3 | §3.2.3.2, p. 22 |
| Upb0, type de plancher inconnu | 2 | §3.2.2.1, p. 17 |
| Upb0, dalle béton / entrevous terre cuite et poutrelles béton | 2 / 2 | §3.2.2.2, p. 20 |
| Upb0, voûtains en briques ou moellons | 0,8 | p. 20 |

Valeurs retenues : Umur = 2,5 (brique pleine ≤ 23 cm ou type inconnu : le résultat est le même), Uph0 = 2,5 (type inconnu), Upb0 = 2 (type inconnu ou dalle béton).

### 2.3 Plancher bas sur vide sanitaire ou sous-sol non chauffé : coefficient Ue (§3.2.2.1, p. 18)

Pour un vide sanitaire, un sous-sol non chauffé ou un terre-plein, la déperdition se calcule avec Ue à la place de Upb. Ue se lit dans un tableau en fonction de Upb et de 2S/P, arrondi à l'entier ; interpolation et extrapolation linéaires sont autorisées (p. 18).

Extrait des lignes utilisées, cas « vide sanitaire ou sous-sol non chauffé » :

| 2S/P \ Upb | 3,33 | 1,43 | 0,83 | 0,45 | 0,41 | 0,37 | 0,34 | 0,31 |
|---|---|---|---|---|---|---|---|---|
| 4 | 0,43 | 0,4 | 0,37 | 0,34 | 0,31 | 0,29 | 0,27 | 0,25 |
| 5 | 0,38 | 0,36 | 0,34 | 0,32 | 0,3 | 0,28 | 0,26 | 0,25 |

Ue obtenus pour la maison isolée (2S/P = 4) :

| Upb | Ue | Calcul |
|---|---|---|
| 2 | 0,409 | interpolation entre 3,33 et 1,43 |
| 0,9 | 0,373 | interpolation entre 1,43 et 0,83 |
| 0,8 | 0,368 | interpolation entre 0,83 et 0,45 |
| 0,5 | 0,344 | interpolation entre 0,83 et 0,45 |
| 0,3 | 0,243 | extrapolation au-delà de 0,31 |
| 0,27 | 0,223 | extrapolation au-delà de 0,31 |
| 0,23 | 0,197 | extrapolation au-delà de 0,31 |

### 2.4 Coefficients b (§3.1, p. 8 à 11)

| Paroi | b | Source |
|---|---|---|
| Mur sur l'extérieur, plancher sur vide sanitaire, terre-plein ou sous-sol non chauffé | 1 | §3.1, p. 8 |
| Plafond sous combles perdus non isolés (Aiu non isolée, Aue non isolée), Aiu/Aue entre 0,50 et 0,75, UV,ue = 9 | 0,85 | tableau p. 10, à droite |
| Plafond isolé sous combles (Aiu isolée, Aue non isolée), mêmes conditions | 1,00 | tableau p. 10, à gauche |

Données intermédiaires :
- UV,ue d'un comble « fortement ventilé » = 9 (tableau p. 9). Définition p. 10 : tuiles ou autres éléments discontinus, sans support continu.
- Aiu = 50 m², soit le plafond du dernier niveau.
- Aue = rampants + pignons du comble = 95,7 m² pour la géométrie ci-dessous, d'où Aiu/Aue = 0,52.
- Pour une pente de toit comprise entre 30° et 45°, ce rapport reste entre 0,52 et 0,69 : b ne change pas.
- Avec un comble « faiblement ventilé » (UV,ue = 3), b vaudrait 0,75 au lieu de 0,85 (non isolé) et 0,95 au lieu de 1,00 (isolé).

### 2.5 Fenêtres et porte (§3.3, p. 22 à 32)

| Menuiserie retenue | Ug (source) | Uw (source) |
|---|---|---|
| Bois, simple vitrage, fenêtre battante | 5,8 (§3.3.1, p. 23) | **5,4** (tableau « bois », ligne Ug 5,8, p. 30) |
| Bois, double vitrage 4/6/4 air, non traité | 3,3 (p. 24) | **3,4** (tableau bois, p. 29) |
| PVC, double vitrage 4/12/4 air, non traité | 2,8 (p. 24) | **2,7** (tableau PVC, p. 28) |
| PVC, double vitrage 4/16/4 air, peu émissif | 1,4 (p. 24) | **1,6** (p. 28) |
| PVC, double vitrage 4/16/4 argon, peu émissif | 1,1 (p. 24) | **1,4** (p. 28) |

Règles utiles :
- « Par défaut, les doubles et triples vitrages installés à partir de 2006 sont tous considérés remplis à l'Argon ou au Krypton » (p. 25).
- Avec des volets, la méthode remplace Uw par Ujn (§3.3.3, p. 30-31). Exemple : Uw 5,4 avec volets roulants PVC ≤ 12 mm (ΔR 0,19) donne Ujn = 4,0. **Les volets ne sont pas pris en compte ici** (Ubaie = Uw), car on cherche une puissance de dimensionnement par nuit froide, volets éventuellement ouverts.

La méthode 3CL ne donne pas de « fenêtre par défaut par époque ». Le type de fenêtre attribué à chaque période est donc une hypothèse : voir §5.

| Porte (§3.3.4, p. 32) | Uporte |
|---|---|
| Porte simple en bois ou PVC, opaque pleine | 3,5 |
| Porte bois ou PVC avec moins de 30 % de simple vitrage | 4 |
| Porte bois ou PVC avec double vitrage | 3,3 |
| Porte opaque pleine isolée | 1,5 |

### 2.6 Ponts thermiques (§3.4, p. 32 à 37)

Formule (p. 32) : PT = Σ k·l pour les liaisons plancher bas/mur, plancher intermédiaire/mur, refend/mur, plancher haut/mur et menuiserie/mur. Aucun b n'est appliqué (p. 33).

Règles par défaut (p. 33) :
- Avant 1975, une paroi d'isolation inconnue est non isolée.
- À partir de 1975 : murs en ITI ; plafonds isolés par l'extérieur ; planchers sur terre-plein non isolés avant 2001 et en ITE à partir de 2001 ; autres planchers en ITE.
- Seuls les ponts thermiques entre parois lourdes, ou entre une paroi et une menuiserie, sont conservés.
- Les planchers intermédiaires et les planchers hauts en structure légère sont négligés (p. 35-36).

| Liaison | Cas | k (W/(m·K)) | Source |
|---|---|---|---|
| Plancher bas / mur | Mur non isolé / plancher non isolé | 0,39 | §3.4.1, p. 35 |
| Plancher bas / mur | Mur ITI / plancher ITE | 0,71 | p. 35 |
| Plancher intermédiaire / mur (lourd) | Mur non isolé | 0,86 | §3.4.2, p. 35 |
| Plancher intermédiaire / mur (lourd) | Mur ITI | 0,92 | p. 35 |
| Plancher haut lourd / mur | non utilisé : plafond sous combles en structure légère, donc négligé | – | §3.4.3, p. 36 |
| Refend / mur | Mur non isolé / ITI (moitié si le refend ne sépare pas deux volumes du lot) | 0,73 / 0,82 | §3.4.4, p. 36 |
| Menuiserie / mur | Mur non isolé, menuiserie en tunnel, dormant Lp = 5 cm | 0,31 | §3.4.5, p. 37 |
| Menuiserie / mur | Mur ITI, menuiserie au nu intérieur | 0 | p. 37 |

Le linéaire plancher bas/mur inclut les seuils de porte (p. 32). Les seuils ne comptent pas dans le linéaire menuiserie/mur (p. 37).

### 2.7 Renouvellement d'air (§4, p. 38 à 40)

Formules de la méthode :
- Hvent = 0,34 × Qvarepconv × Sh.
- Hperm = 0,34 × Qvinf.
- Qvinf = Hsp·Sh·n50·e / [1 + (f/e)·((Qvasoufconv − Qvarepconv)/(Hsp·n50))²].
- n50 = Q4Pa / [(4/50)^(2/3) × Hsp × Sh].
- Q4Pa = Q4Paconv/m² × Sdep + 0,45 × Smeaconv × Sh, où Sdep est la surface des parois déperditives hors plancher bas.
- Coefficients de protection, plusieurs façades exposées : e = 0,07 ; f = 15 (p. 39).

Q4Paconv/m², maison individuelle (p. 39) :

| Période | Q4Paconv/m² (m³/(h·m²)) |
|---|---|
| Avant 1948 | 3,3 |
| 1948-1974 | 2,2 |
| 1975-2005 | 1,9 |
| 2006-2012 | 1,3 |
| Après 2012 | 0,6 |

Cas particuliers (p. 39) :
- Avant 1948, avec isolation des murs et/ou du plafond (plus de 50 % des surfaces) : 2.
- 1948-1974, avec la même condition d'isolation : 1,9.
- Avant 1948, avec menuiseries à joints : 2,5.

Débits par type de ventilation (p. 40). La méthode ne donne **aucun type de ventilation par défaut selon l'époque**. Le type retenu par période est une hypothèse (voir §5).

| Type de ventilation | Qvarepconv | Qvasoufconv | Smeaconv |
|---|---|---|---|
| Ouverture des fenêtres | 1,2 | 1,2 | 0 |
| Ventilation naturelle par conduit / entrées d'air hautes et basses | 2,23 | 0 | 4 |
| VMC SF autoréglable < 1982 | 1,97 | 0 | 2 |
| VMC SF autoréglable 1982 à 2000 | 1,65 | 0 | 2 |
| VMC SF autoréglable 2001 à 2012 | 1,50 | 0 | 2 |
| VMC SF hygro B 2001 à 2012 | 1,24 | 0 | 1,5 |
| VMC SF hygro B après 2012 | 1,09 | 0 | 1,5 |
| VMC SF hygro A après 2012 | 1,16 | 0 | 2 |
| VMC DF individuelle avec échangeur après 2012 | 0,26 | 0,26 | 0 |

---

## 3. Maison de référence

Toutes ces dimensions sont des hypothèses, sauf la surface vitrée, qui reprend un minimum réglementaire.

| Élément | Valeur | Justification |
|---|---|---|
| Type | Maison individuelle à étage, R+1, combles perdus | demandé |
| Surface habitable Sh | 100 m² (2 × 50 m²) | demandé |
| Emprise | carré intérieur de 7,071 m de côté (√50) | demandé ; cotes intérieures, sans épaisseur de murs, sans trémie d'escalier |
| Hauteur sous plafond Hsp | 2,50 m | demandé |
| Volume chauffé V | 250 m³ | Sh × Hsp |
| Périmètre P | 28,28 m | 4 × 7,071 |
| Murs extérieurs bruts | 141,42 m² | P × 2 niveaux × 2,50 m. Hauteur de mur = hauteur sous plafond, épaisseur du plancher intermédiaire ignorée |
| Fenêtres | 16,67 m² (1/6 de Sh), en 10 fenêtres battantes de 1,20 × 1,39 m. Linéaire d'appuis, tableaux et linteaux : 51,8 m | 1/6 est le **minimum imposé aux maisons neuves par la RT 2012** (arrêté du 26 octobre 2010, art. 20 : surface totale des baies ≥ 1/6 de la surface habitable, https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000030072618/). Appliqué à toutes les époques par hypothèse. Variante à 15 m² en §6.3 |
| Porte d'entrée | 2,0 m² (0,90 × 2,20 m). Linéaire hors seuil : 5,3 m | hypothèse |
| Murs opaques nets | 122,75 m² | 141,42 − 16,67 − 2 |
| Plafond sur combles perdus | 50 m² | |
| Toiture | 2 pans à 45°, rampants 70,7 m², 2 pignons de 12,5 m², soit Aue = 95,7 m² | hypothèse, ne sert qu'au b des combles. Résultat inchangé de 30° à 45° |
| Plancher bas | 50 m² sur **vide sanitaire ou sous-sol non chauffé**, 2S/P = 3,54, arrondi à 4 | voir ci-dessous |
| Sdep (perméabilité) | 191,42 m² | murs bruts + plafond |
| Structure | murs et plancher bas lourds (brique ou bloc béton ; dalle ou poutrelles-hourdis). Plafond sous combles léger (solives ou fermettes). Cloisons légères, pas de refend lourd | hypothèse |
| Plancher intermédiaire | avant 1975 : solives bois (pont thermique négligé, p. 35). À partir de 1975 : plancher lourd (poutrelles-hourdis), k = 0,92 | hypothèse. Variante « plancher léger » en §6.3 |
| Pose des menuiseries | avant 1975 : en tunnel, dormant 5 cm. À partir de 1975 (ITI) : au nu intérieur | hypothèse |

**Pourquoi un plancher sur vide sanitaire ou sous-sol non chauffé plutôt que sur terre-plein ?**

1. La méthode donne un seul tableau Ue « vide sanitaire **ou sous-sol non chauffé** » (p. 18). Il couvre donc à la fois les maisons sur cave, très répandues dans le bâti ancien en brique du Nord, et les maisons sur vide sanitaire. Le fait que les maisons sur cave soient fréquentes n'est pas sourcé ici.
2. Pour un terre-plein avant 2001, l'annexe est ambiguë :
   - §3.4 (p. 33) : un plancher sur terre-plein d'isolation inconnue est « non isolé avant 2001 » ;
   - schéma Upb (p. 17) : min(Upb0 ; Upb_tab).
   Le vide sanitaire évite cette ambiguïté.

**Variante mitoyenne sur un côté.** Un mur de 35,36 m² donne sur une maison chauffée : il n'est pas déperditif. Les conséquences :
- murs bruts 106,07 m², fenêtres et porte inchangées ;
- P déperditif = 21,21 m, d'où 2S/P = 4,71, arrondi à 5 ;
- Sdep = 156,07 m² ;
- un pignon de comble en moins, d'où Aue = 83,2 m² et Aiu/Aue = 0,60 : b inchangé ;
- les deux jonctions verticales mur mitoyen / façade (2 × 5 m) sont comptées comme liaison refend/mur à demi-valeur (p. 36). Assimiler le mur mitoyen à un refend est une hypothèse.

---

## 4. Choix par période (U, menuiseries, ventilation)

| Période | Umur | Uph (b) | Upb puis Ue | Uw (menuiserie) | Uporte | PT retenus | Ventilation | Q4Paconv/m² |
|---|---|---|---|---|---|---|---|---|
| ≤ 1947, jamais isolée | 2,5 | 2,5 (0,85) | 2 puis 0,409 | 5,4 (bois, simple vitrage) | 3,5 | pb 0,39 ; men 0,31 | ouverture des fenêtres | 3,3 |
| 1948-1974, jamais isolée | 2,5 | 2,5 (0,85) | 2 puis 0,409 | 5,4 | 3,5 | idem | ouverture des fenêtres | 2,2 |
| ≤ 1974 rénovée : combles isolés, double vitrage, murs non isolés | 2,5 | **0,14** (1,00), Uph_tab de l'année d'isolation ≥ 13 | 2 puis 0,409 | **1,4** (PVC 4/16/4 argon peu émissif) | 3,5 | idem | ouverture des fenêtres | 2 (< 1948) / 1,9 (1948-74), règle « avec isolation du plafond » |
| 1975-1977 et 1978-1982 | 1 | 0,5 (1,00) | 0,9 puis 0,373 | 3,4 (bois 4/6/4 air) | 3,5 | pb 0,71 ; pi 0,92 ; men 0 | VMC SF autoréglable < 1982 | 1,9 |
| 1983-1988 | 0,8 | 0,3 | 0,8 puis 0,368 | 2,7 (PVC 4/12/4 air) | 3,5 | idem | VMC SF autoréglable 1982-2000 | 1,9 |
| 1989-2000 | 0,5 | 0,25 | 0,5 puis 0,344 | 2,7 | 3,5 | idem | VMC SF autoréglable 1982-2000 | 1,9 |
| 2001-2005 | 0,4 | 0,23 | 0,3 puis 0,243 | 1,6 (PVC 4/16/4 air peu émissif) | 3,5 | idem | VMC SF autoréglable 2001-2012 | 1,9 |
| 2006-2012 | 0,36 | 0,2 | 0,27 puis 0,223 | 1,4 (PVC 4/16/4 argon peu émissif) | 1,5 (isolée) | idem | VMC SF hygro B 2001-2012 | 1,3 |
| ≥ 2013 | 0,23 | 0,14 | 0,23 puis 0,197 | 1,4 | 1,5 | idem | VMC SF hygro B après 2012 | 0,6 |

**Comment la rénovation est traitée dans la méthode 3CL.**
- Pour une paroi isolée dont l'année d'isolation est connue, la méthode prend U = min(U non isolé ; U_tab de **l'année d'isolation**) (schémas p. 13, 17, 21). Des combles isolés en 2013 ou après valent donc Uph = 0,14.
- Si l'année d'isolation est inconnue sur un bâtiment ≤ 1974, la méthode impose l'année 75-77, soit Uph = 0,5. Cette variante est calculée aussi.
- Les fenêtres neuves se décrivent par leur vitrage réel : Ug puis Uw.
- Les murs restent à Umur_nu = 2,5.
- La perméabilité baisse par la règle « avec une isolation des murs et/ou du plafond » (p. 39).

---

## 5. Détail des calculs par période (maison isolée, sans mitoyenneté)

Puissance : P = H × 28,5 K (19 °C − (−9,5 °C)).

#### ≤1947 jamais isolée

| Poste | Surface / longueur | U ou ψ | b | Contribution (W/K) |
|---|---|---|---|---|
| Murs opaques | 122,75 m² | 2,500 | 1,00 | 306,9 |
| Plafond sur combles perdus | 50,00 m² | 2,500 | 0,85 | 106,2 |
| Plancher bas (Ue, vide sanitaire) | 50,00 m² | 0,409 | 1,00 | 20,5 |
| Fenêtres | 16,67 m² | 5,400 | 1,00 | 90,0 |
| Porte | 2,00 m² | 3,500 | 1,00 | 7,0 |
| PT plancher bas / mur | 28,28 m | 0,39 | – | 11,0 |
| PT plancher intermédiaire / mur | 28,28 m | 0,00 | – | 0,0 |
| PT menuiseries / mur | 57,08 m | 0,31 | – | 17,7 |
| Hvent (ventilation par ouverture des fenêtres : Qvarep 1,20) | Sh 100 m² | – | – | 40,8 |
| Hperm (Q4Paconv 3,3 ; Q4Pa 632 m³/h ; n50 13,61 h⁻¹ ; Qvinf 238,2 m³/h) | – | – | – | 81,0 |
| **Total H** | | | | **681,1** |

G = 681,1 / 250 = **2,724 W/(m³·K)** ; puissance à ΔT 28,5 K = **19,4 kW**. Variante mitoyenne : H = 576,5 W/K, G = 2,306, 16,4 kW.

#### 1948-1974 jamais isolée

| Poste | Surface / longueur | U ou ψ | b | Contribution (W/K) |
|---|---|---|---|---|
| Murs opaques | 122,75 m² | 2,500 | 1,00 | 306,9 |
| Plafond sur combles perdus | 50,00 m² | 2,500 | 0,85 | 106,2 |
| Plancher bas (Ue, vide sanitaire) | 50,00 m² | 0,409 | 1,00 | 20,5 |
| Fenêtres | 16,67 m² | 5,400 | 1,00 | 90,0 |
| Porte | 2,00 m² | 3,500 | 1,00 | 7,0 |
| PT plancher bas / mur | 28,28 m | 0,39 | – | 11,0 |
| PT plancher intermédiaire / mur | 28,28 m | 0,00 | – | 0,0 |
| PT menuiseries / mur | 57,08 m | 0,31 | – | 17,7 |
| Hvent (ventilation par ouverture des fenêtres : Qvarep 1,20) | Sh 100 m² | – | – | 40,8 |
| Hperm (Q4Paconv 2,2 ; Q4Pa 421 m³/h ; n50 9,07 h⁻¹ ; Qvinf 158,8 m³/h) | – | – | – | 54,0 |
| **Total H** | | | | **654,1** |

G = 654,1 / 250 = **2,616 W/(m³·K)** ; puissance à ΔT 28,5 K = **18,6 kW**. Variante mitoyenne : H = 554,5 W/K, G = 2,218, 15,8 kW.

#### ≤1947 rénovée

| Poste | Surface / longueur | U ou ψ | b | Contribution (W/K) |
|---|---|---|---|---|
| Murs opaques | 122,75 m² | 2,500 | 1,00 | 306,9 |
| Plafond sur combles perdus | 50,00 m² | 0,140 | 1,00 | 7,0 |
| Plancher bas (Ue, vide sanitaire) | 50,00 m² | 0,409 | 1,00 | 20,5 |
| Fenêtres | 16,67 m² | 1,400 | 1,00 | 23,3 |
| Porte | 2,00 m² | 3,500 | 1,00 | 7,0 |
| PT plancher bas / mur | 28,28 m | 0,39 | – | 11,0 |
| PT plancher intermédiaire / mur | 28,28 m | 0,00 | – | 0,0 |
| PT menuiseries / mur | 57,08 m | 0,31 | – | 17,7 |
| Hvent (ventilation par ouverture des fenêtres : Qvarep 1,20) | Sh 100 m² | – | – | 40,8 |
| Hperm (Q4Paconv 2,0 ; Q4Pa 383 m³/h ; n50 8,25 h⁻¹ ; Qvinf 144,3 m³/h) | – | – | – | 49,1 |
| **Total H** | | | | **483,3** |

G = 483,3 / 250 = **1,933 W/(m³·K)** ; puissance à ΔT 28,5 K = **13,8 kW**. Variante mitoyenne : H = 384,6 W/K, G = 1,538, 11,0 kW.

#### 1948-1974 rénovée

| Poste | Surface / longueur | U ou ψ | b | Contribution (W/K) |
|---|---|---|---|---|
| Murs opaques | 122,75 m² | 2,500 | 1,00 | 306,9 |
| Plafond sur combles perdus | 50,00 m² | 0,140 | 1,00 | 7,0 |
| Plancher bas (Ue, vide sanitaire) | 50,00 m² | 0,409 | 1,00 | 20,5 |
| Fenêtres | 16,67 m² | 1,400 | 1,00 | 23,3 |
| Porte | 2,00 m² | 3,500 | 1,00 | 7,0 |
| PT plancher bas / mur | 28,28 m | 0,39 | – | 11,0 |
| PT plancher intermédiaire / mur | 28,28 m | 0,00 | – | 0,0 |
| PT menuiseries / mur | 57,08 m | 0,31 | – | 17,7 |
| Hvent (ventilation par ouverture des fenêtres : Qvarep 1,20) | Sh 100 m² | – | – | 40,8 |
| Hperm (Q4Paconv 1,9 ; Q4Pa 364 m³/h ; n50 7,84 h⁻¹ ; Qvinf 137,1 m³/h) | – | – | – | 46,6 |
| **Total H** | | | | **480,8** |

G = 480,8 / 250 = **1,923 W/(m³·K)** ; puissance à ΔT 28,5 K = **13,7 kW**. Variante mitoyenne : H = 382,6 W/K, G = 1,530, 10,9 kW.

#### 1948-1974 rénovée (date isol. combles inconnue)

| Poste | Surface / longueur | U ou ψ | b | Contribution (W/K) |
|---|---|---|---|---|
| Murs opaques | 122,75 m² | 2,500 | 1,00 | 306,9 |
| Plafond sur combles perdus | 50,00 m² | 0,500 | 1,00 | 25,0 |
| Plancher bas (Ue, vide sanitaire) | 50,00 m² | 0,409 | 1,00 | 20,5 |
| Fenêtres | 16,67 m² | 1,400 | 1,00 | 23,3 |
| Porte | 2,00 m² | 3,500 | 1,00 | 7,0 |
| PT plancher bas / mur | 28,28 m | 0,39 | – | 11,0 |
| PT plancher intermédiaire / mur | 28,28 m | 0,00 | – | 0,0 |
| PT menuiseries / mur | 57,08 m | 0,31 | – | 17,7 |
| Hvent (ventilation par ouverture des fenêtres : Qvarep 1,20) | Sh 100 m² | – | – | 40,8 |
| Hperm (Q4Paconv 1,9 ; Q4Pa 364 m³/h ; n50 7,84 h⁻¹ ; Qvinf 137,1 m³/h) | – | – | – | 46,6 |
| **Total H** | | | | **498,8** |

G = 498,8 / 250 = **1,995 W/(m³·K)** ; puissance à ΔT 28,5 K = **14,2 kW**. Variante mitoyenne : H = 400,6 W/K, G = 1,602, 11,4 kW.

#### 1975-1977

| Poste | Surface / longueur | U ou ψ | b | Contribution (W/K) |
|---|---|---|---|---|
| Murs opaques | 122,75 m² | 1,000 | 1,00 | 122,8 |
| Plafond sur combles perdus | 50,00 m² | 0,500 | 1,00 | 25,0 |
| Plancher bas (Ue, vide sanitaire) | 50,00 m² | 0,373 | 1,00 | 18,7 |
| Fenêtres | 16,67 m² | 3,400 | 1,00 | 56,7 |
| Porte | 2,00 m² | 3,500 | 1,00 | 7,0 |
| PT plancher bas / mur | 28,28 m | 0,71 | – | 20,1 |
| PT plancher intermédiaire / mur | 28,28 m | 0,92 | – | 26,0 |
| PT menuiseries / mur | 57,08 m | 0,00 | – | 0,0 |
| Hvent (VMC SF autoréglable < 1982 : Qvarep 1,97) | Sh 100 m² | – | – | 67,0 |
| Hperm (Q4Paconv 1,9 ; Q4Pa 454 m³/h ; n50 9,77 h⁻¹ ; Qvinf 71,5 m³/h) | – | – | – | 24,3 |
| **Total H** | | | | **367,5** |

G = 367,5 / 250 = **1,470 W/(m³·K)** ; puissance à ΔT 28,5 K = **10,5 kW**. Variante mitoyenne : H = 315,8 W/K, G = 1,263, 9,0 kW.

#### 1978-1982

| Poste | Surface / longueur | U ou ψ | b | Contribution (W/K) |
|---|---|---|---|---|
| Murs opaques | 122,75 m² | 1,000 | 1,00 | 122,8 |
| Plafond sur combles perdus | 50,00 m² | 0,500 | 1,00 | 25,0 |
| Plancher bas (Ue, vide sanitaire) | 50,00 m² | 0,373 | 1,00 | 18,7 |
| Fenêtres | 16,67 m² | 3,400 | 1,00 | 56,7 |
| Porte | 2,00 m² | 3,500 | 1,00 | 7,0 |
| PT plancher bas / mur | 28,28 m | 0,71 | – | 20,1 |
| PT plancher intermédiaire / mur | 28,28 m | 0,92 | – | 26,0 |
| PT menuiseries / mur | 57,08 m | 0,00 | – | 0,0 |
| Hvent (VMC SF autoréglable < 1982 : Qvarep 1,97) | Sh 100 m² | – | – | 67,0 |
| Hperm (Q4Paconv 1,9 ; Q4Pa 454 m³/h ; n50 9,77 h⁻¹ ; Qvinf 71,5 m³/h) | – | – | – | 24,3 |
| **Total H** | | | | **367,5** |

G = 367,5 / 250 = **1,470 W/(m³·K)** ; puissance à ΔT 28,5 K = **10,5 kW**. Variante mitoyenne : H = 315,8 W/K, G = 1,263, 9,0 kW.

#### 1983-1988

| Poste | Surface / longueur | U ou ψ | b | Contribution (W/K) |
|---|---|---|---|---|
| Murs opaques | 122,75 m² | 0,800 | 1,00 | 98,2 |
| Plafond sur combles perdus | 50,00 m² | 0,300 | 1,00 | 15,0 |
| Plancher bas (Ue, vide sanitaire) | 50,00 m² | 0,368 | 1,00 | 18,4 |
| Fenêtres | 16,67 m² | 2,700 | 1,00 | 45,0 |
| Porte | 2,00 m² | 3,500 | 1,00 | 7,0 |
| PT plancher bas / mur | 28,28 m | 0,71 | – | 20,1 |
| PT plancher intermédiaire / mur | 28,28 m | 0,92 | – | 26,0 |
| PT menuiseries / mur | 57,08 m | 0,00 | – | 0,0 |
| Hvent (VMC SF autoréglable 1982-2000 : Qvarep 1,65) | Sh 100 m² | – | – | 56,1 |
| Hperm (Q4Paconv 1,9 ; Q4Pa 454 m³/h ; n50 9,77 h⁻¹ ; Qvinf 86,5 m³/h) | – | – | – | 29,4 |
| **Total H** | | | | **315,2** |

G = 315,2 / 250 = **1,261 W/(m³·K)** ; puissance à ΔT 28,5 K = **9,0 kW**. Variante mitoyenne : H = 269,7 W/K, G = 1,079, 7,7 kW.

#### 1989-2000

| Poste | Surface / longueur | U ou ψ | b | Contribution (W/K) |
|---|---|---|---|---|
| Murs opaques | 122,75 m² | 0,500 | 1,00 | 61,4 |
| Plafond sur combles perdus | 50,00 m² | 0,250 | 1,00 | 12,5 |
| Plancher bas (Ue, vide sanitaire) | 50,00 m² | 0,344 | 1,00 | 17,2 |
| Fenêtres | 16,67 m² | 2,700 | 1,00 | 45,0 |
| Porte | 2,00 m² | 3,500 | 1,00 | 7,0 |
| PT plancher bas / mur | 28,28 m | 0,71 | – | 20,1 |
| PT plancher intermédiaire / mur | 28,28 m | 0,92 | – | 26,0 |
| PT menuiseries / mur | 57,08 m | 0,00 | – | 0,0 |
| Hvent (VMC SF autoréglable 1982-2000 : Qvarep 1,65) | Sh 100 m² | – | – | 56,1 |
| Hperm (Q4Paconv 1,9 ; Q4Pa 454 m³/h ; n50 9,77 h⁻¹ ; Qvinf 86,5 m³/h) | – | – | – | 29,4 |
| **Total H** | | | | **274,7** |

G = 274,7 / 250 = **1,099 W/(m³·K)** ; puissance à ΔT 28,5 K = **7,8 kW**. Variante mitoyenne : H = 240,2 W/K, G = 0,961, 6,8 kW.

#### 2001-2005

| Poste | Surface / longueur | U ou ψ | b | Contribution (W/K) |
|---|---|---|---|---|
| Murs opaques | 122,75 m² | 0,400 | 1,00 | 49,1 |
| Plafond sur combles perdus | 50,00 m² | 0,230 | 1,00 | 11,5 |
| Plancher bas (Ue, vide sanitaire) | 50,00 m² | 0,243 | 1,00 | 12,2 |
| Fenêtres | 16,67 m² | 1,600 | 1,00 | 26,7 |
| Porte | 2,00 m² | 3,500 | 1,00 | 7,0 |
| PT plancher bas / mur | 28,28 m | 0,71 | – | 20,1 |
| PT plancher intermédiaire / mur | 28,28 m | 0,92 | – | 26,0 |
| PT menuiseries / mur | 57,08 m | 0,00 | – | 0,0 |
| Hvent (VMC SF autoréglable 2001-2012 : Qvarep 1,50) | Sh 100 m² | – | – | 51,0 |
| Hperm (Q4Paconv 1,9 ; Q4Pa 454 m³/h ; n50 9,77 h⁻¹ ; Qvinf 94,6 m³/h) | – | – | – | 32,2 |
| **Total H** | | | | **235,7** |

G = 235,7 / 250 = **0,943 W/(m³·K)** ; puissance à ΔT 28,5 K = **6,7 kW**. Variante mitoyenne : H = 205,6 W/K, G = 0,822, 5,9 kW.

#### 2006-2012

| Poste | Surface / longueur | U ou ψ | b | Contribution (W/K) |
|---|---|---|---|---|
| Murs opaques | 122,75 m² | 0,360 | 1,00 | 44,2 |
| Plafond sur combles perdus | 50,00 m² | 0,200 | 1,00 | 10,0 |
| Plancher bas (Ue, vide sanitaire) | 50,00 m² | 0,223 | 1,00 | 11,2 |
| Fenêtres | 16,67 m² | 1,400 | 1,00 | 23,3 |
| Porte | 2,00 m² | 1,500 | 1,00 | 3,0 |
| PT plancher bas / mur | 28,28 m | 0,71 | – | 20,1 |
| PT plancher intermédiaire / mur | 28,28 m | 0,92 | – | 26,0 |
| PT menuiseries / mur | 57,08 m | 0,00 | – | 0,0 |
| Hvent (VMC SF hygro B 2001-2012 : Qvarep 1,24) | Sh 100 m² | – | – | 42,2 |
| Hperm (Q4Paconv 1,3 ; Q4Pa 316 m³/h ; n50 6,82 h⁻¹ ; Qvinf 55,9 m³/h) | – | – | – | 19,0 |
| **Total H** | | | | **198,9** |

G = 198,9 / 250 = **0,796 W/(m³·K)** ; puissance à ΔT 28,5 K = **5,7 kW**. Variante mitoyenne : H = 174,0 W/K, G = 0,696, 5,0 kW.

#### ≥2013

| Poste | Surface / longueur | U ou ψ | b | Contribution (W/K) |
|---|---|---|---|---|
| Murs opaques | 122,75 m² | 0,230 | 1,00 | 28,2 |
| Plafond sur combles perdus | 50,00 m² | 0,140 | 1,00 | 7,0 |
| Plancher bas (Ue, vide sanitaire) | 50,00 m² | 0,197 | 1,00 | 9,8 |
| Fenêtres | 16,67 m² | 1,400 | 1,00 | 23,3 |
| Porte | 2,00 m² | 1,500 | 1,00 | 3,0 |
| PT plancher bas / mur | 28,28 m | 0,71 | – | 20,1 |
| PT plancher intermédiaire / mur | 28,28 m | 0,92 | – | 26,0 |
| PT menuiseries / mur | 57,08 m | 0,00 | – | 0,0 |
| Hvent (VMC SF hygro B après 2012 : Qvarep 1,09) | Sh 100 m² | – | – | 37,1 |
| Hperm (Q4Paconv 0,6 ; Q4Pa 182 m³/h ; n50 3,93 h⁻¹ ; Qvinf 18,9 m³/h) | – | – | – | 6,4 |
| **Total H** | | | | **161,0** |

G = 161,0 / 250 = **0,644 W/(m³·K)** ; puissance à ΔT 28,5 K = **4,6 kW**. Variante mitoyenne : H = 145,1 W/K, G = 0,580, 4,1 kW.

---

## 6. Résultats

### 6.1 Tableau final des G (W/(m³·K)), arrondis à 0,05

| Période | G maison isolée | Puissance 100 m² (ΔT 28,5 K) | G mitoyenne 1 côté | Puissance mitoyenne |
|---|---|---|---|---|
| Avant 1948, jamais isolée (simple vitrage) | **2,70** (2,724) | 19,4 kW | **2,30** (2,306) | 16,4 kW |
| 1948-1974, jamais isolée (simple vitrage) | **2,60** (2,616) | 18,6 kW | **2,20** (2,218) | 15,8 kW |
| Avant 1975 rénovée : combles isolés après 2013, double vitrage récent, murs non isolés | **1,95** (1,933 avant 1948) / **1,90** (1,923 de 1948 à 1974) | 13,7 kW | **1,55** (1,538 / 1,530) | 10,9 kW |
| Idem, date d'isolation des combles inconnue (Uph 0,5) | **2,00** (1,995) | 14,2 kW | **1,60** (1,602) | 11,4 kW |
| 1975-1982 | **1,45** (1,470) | 10,5 kW | **1,25** (1,263) | 9,0 kW |
| 1983-1988 | **1,25** (1,261) | 9,0 kW | **1,10** (1,079) | 7,7 kW |
| 1989-2000 | **1,10** (1,099) | 7,8 kW | **0,95** (0,961) | 6,8 kW |
| 2001-2005 | **0,95** (0,943) | 6,7 kW | **0,80** (0,822) | 5,9 kW |
| 2006-2012 | **0,80** (0,796) | 5,7 kW | **0,70** (0,696) | 5,0 kW |
| 2013 et après (RT 2012 / RE 2020) | **0,65** (0,644) | 4,6 kW | **0,60** (0,580) | 4,1 kW |

Valeurs à retenir pour les tranches demandées (maison isolée) :

| Tranche | G | Remarque |
|---|---|---|
| Avant 1975 jamais isolée | 2,65 | moyenne de 2,70 et 2,60 ; ou 2,70 par prudence |
| Avant 1975 rénovée | 1,95 | |
| 1975-1988 | 1,25 à 1,45 | 1,45 jusqu'en 1982, 1,25 de 1983 à 1988 |
| 1989-2000 | 1,10 | |
| 2001-2012 | 0,80 à 0,95 | 0,95 de 2001 à 2005, 0,80 de 2006 à 2012 |
| 2013 et après | 0,65 | |

### 6.2 Répartition des déperditions

| Période | Parois opaques | Fenêtres + porte | Ponts thermiques | Air (Hvent + Hperm) | H total (W/K) |
|---|---|---|---|---|---|
| 1948-1974 jamais isolée | 433,6 (66 %) | 97,0 | 28,7 | 94,8 | 654,1 |
| 1948-1974 rénovée | 334,3 (70 %) | 30,3 | 28,7 | 87,4 | 480,8 |
| 1975-1982 | 166,4 | 63,7 | 46,1 | 91,3 | 367,5 |
| 1989-2000 | 91,1 | 52,0 | 46,1 | 85,5 | 274,7 |
| 2006-2012 | 65,4 | 26,3 | 46,1 | 61,2 | 198,9 |
| ≥ 2013 | 45,1 | 26,3 | 46,1 (29 %) | 43,5 | 161,0 |

### 6.3 Sensibilités (maison isolée)

| Variante | G | Écart |
|---|---|---|
| Plancher intermédiaire **léger**, pont thermique négligé (p. 35) : ≥ 2013 | 0,540 | −0,10 |
| Idem, 2006-2012 | 0,692 | −0,10 |
| Idem, 2001-2005 | 0,839 | −0,10 |
| Idem, 1989-2000 | 0,995 | −0,10 |
| Idem, 1983-1988 | 1,157 | −0,10 |
| Idem, 1975-1982 | 1,366 | −0,10 |
| Fenêtres 15 m² (15 % de Sh) au lieu de 16,67 m², toutes périodes | −0,01 à −0,02 | négligeable |
| 1948-1974 jamais isolée, ventilation naturelle par conduit (2,23 ; Smea 4) au lieu de l'ouverture des fenêtres | 2,693 | +0,08 |
| Avant 1948 jamais isolée, ventilation naturelle par conduit | 2,808 | +0,08 |
| 1948-1974 jamais isolée, mur en brique pleine 34 cm (Umur0 = 2) avec doublage (R 0,21), soit Umur = 1,41 | 2,080 | −0,54 |
| ≥ 2013, VMC hygro A au lieu de hygro B | 0,659 | +0,02 |
| Combles « faiblement ventilés » (UV,ue = 3) | b = 0,75 au lieu de 0,85 (non isolé) ; 0,95 au lieu de 1 (isolé) | −0,05 (non isolé, −12,5 W/K) ; < −0,01 (isolé) |

Deux paramètres pèsent le plus, et ce sont des hypothèses :
- **le mur non isolé**, plafonné à 2,5 par la méthode ; un mur épais ou doublé descend vers 1,4 à 2 ;
- **la nature du plancher intermédiaire** pour les maisons d'après 1975.

---

## 7. Contrôle de cohérence avec l'ADEME

Source : ADEME, guide « Adopter le chauffage au bois », octobre 2020, encadré « Quelle puissance pour quelle habitation ? », p. 15 (`ademe-bois.txt`). Le guide donne :
- environ 12 kW pour une maison mal isolée ;
- 5 à 9 kW pour une maison isolée ;
- 5 kW au maximum pour une maison récente (RT 2012 / RE 2020) en chauffage principal.

Le guide ne précise **ni la surface, ni le volume, ni la température de base** de ces exemples.

| Cas ADEME | Nos résultats (100 m², Tbase −9,5 °C) | Verdict |
|---|---|---|
| Maison récente RT 2012 / RE 2020 : ≤ 5 kW | 4,6 kW isolée ; 4,1 kW mitoyenne ; 3,8 kW avec plancher intermédiaire léger | **Colle** |
| Maison isolée : 5 à 9 kW | 1983-1988 : 9,0 ; 1989-2000 : 7,8 ; 2001-2005 : 6,7 ; 2006-2012 : 5,7 (mitoyenne : 7,7 à 5,0) | **Colle** |
| Maison mal isolée : environ 12 kW | Avant 1975 rénovée : 13,7 (mitoyenne 10,9). 1975-1982 : 10,5 | **Colle** si « mal isolée » désigne une maison partiellement isolée |
| Maison jamais isolée | 18,6 à 19,4 kW (mitoyenne 15,8 à 16,4) | **Plus haut que les 12 kW de l'ADEME**, d'environ 50 % |

Pourquoi la maison jamais isolée dépasse les 12 kW de l'ADEME :

1. **La méthode est volontairement pessimiste pour les murs anciens.** Un mur d'isolation inconnue avant 1975 prend Umur_nu = 2,5, la valeur maximale. Sur 123 m² de murs, cela fait 307 W/K, presque la moitié de H. Avec un mur de 34 cm doublé (Umur 1,4), on tombe à 14,8 kW.
2. **La maison de référence est défavorable** : maison isolée de tous côtés, quatre façades exposées. Une grande part des maisons anciennes du Nord est mitoyenne ou en bande, mais aucune proportion n'est sourcée ici. Mitoyenne d'un côté : 16 kW ; mitoyenne des deux côtés : moins encore, non calculé.
3. **L'ADEME ne parle pas de la même maison.** Son exemple n'a pas de surface, vise un poêle (appareil de chauffage domestique) et compte sans doute une partie des besoins couverte autrement. Par ailleurs, une maison « mal isolée » d'aujourd'hui a presque toujours au moins ses combles ou ses fenêtres refaits. Ce cas correspond à notre ligne « rénovée » : 13,7 kW, proche de 12.
4. **La méthode 3CL n'est pas une méthode de dimensionnement.** Elle sert au calcul conventionnel de consommation : infiltrations conventionnelles, apports gratuits ignorés dans GV. La norme NF EN 12831 serait la référence pour la puissance. Prendre GV × ΔT de base reste toutefois l'approche classique « G × V × ΔT ».

**Conclusion.** Les G obtenus sont cohérents avec l'ADEME pour toutes les maisons isolées, de 1983 à aujourd'hui, ainsi que pour les maisons anciennes partiellement rénovées. Pour la maison jamais isolée, ils donnent une puissance haute, environ 19 kW pour 100 m² en maison isolée de tous côtés. C'est le reflet direct des valeurs par défaut 3CL, prudentes. Pour l'outil, on peut :
- annoncer « 2,6 à 2,7 » pour une maison jamais isolée en signalant que c'est un majorant ;
- ou proposer un choix « mitoyenne / isolée » : 2,2 à 2,3 en mitoyenne.

Contre-vérification historique : le G de 1975-1982 obtenu ici, 1,45 (1,25 en mitoyenne), tombe dans la plage des G maximaux réglementaires de l'arrêté du 10 avril 1974, 2e phase, zone B : 0,95 à 1,75 selon la classe de logement (`donnees-outils.md`, §2a).

---

## 8. Hypothèses non sourcées

1. **Géométrie** : carré intérieur 7,07 × 7,07 m sur deux niveaux, cotes intérieures, épaisseurs de murs et de plancher ignorées, trémie d'escalier ignorée. Hauteur de mur égale à 2 × 2,50 m.
2. **Surface vitrée** : 16,67 m², soit 1/6 de Sh, appliquée à toutes les époques. Ce 1/6 n'est sourcé que comme minimum RT 2012 pour le neuf. 10 fenêtres battantes de 1,20 × 1,39 m, aucune porte-fenêtre ; leur forme ne compte que pour le pont thermique menuiserie/mur.
3. **Porte** de 2,0 m² : bois opaque pleine (3,5) jusqu'en 2005, porte isolée (1,5) à partir de 2006.
4. **Plancher bas** sur vide sanitaire ou sous-sol non chauffé, lourd, de type inconnu (Upb0 = 2).
5. **Toiture** à 2 pans à 45° en tuiles sans support continu (comble fortement ventilé, UV,ue = 9). Plafond sous combles en structure légère.
6. **Murs** lourds (brique ou bloc). Avant 1975, brique pleine ≤ 23 cm ou type inconnu (Umur = 2,5). Pas de refend lourd ; cloisons légères.
7. **Plancher intermédiaire** : bois avant 1975 ; lourd (poutrelles-hourdis) à partir de 1975.
8. **Pose des menuiseries** : en tunnel avec dormant de 5 cm avant 1975 ; au nu intérieur, sans pont thermique, en ITI à partir de 1975.
9. **Type de fenêtre par époque** :
   - avant 1975 : bois simple vitrage ;
   - 1975-1982 : bois 4/6/4 air ;
   - 1983-2000 : PVC 4/12/4 air ;
   - 2001-2005 : PVC 4/16/4 air peu émissif ;
   - 2006 et après, ainsi que la rénovation : PVC 4/16/4 argon peu émissif.
   La méthode fournit les Ug et Uw de chaque type, pas le type typique de chaque époque. Seule la règle « argon par défaut à partir de 2006 » vient de l'annexe.
10. **Volets ignorés** (Ubaie = Uw et non Ujn), choix prudent pour un dimensionnement.
11. **Ventilation par époque** :
    - avant 1975 et rénovée : ouverture des fenêtres ;
    - 1975-1981 : VMC autoréglable < 1982 ;
    - 1982-2000 : VMC autoréglable 1982-2000 ;
    - 2001-2005 : VMC autoréglable 2001-2012 ;
    - 2006-2012 : hygro B 2001-2012 ;
    - 2013 et après : hygro B après 2012.
    La méthode ne fournit aucun type par défaut.
12. **Rénovation** : combles isolés en 2013 ou après (Uph_tab ≥ 13 = 0,14) ; fenêtres PVC argon peu émissif ; porte, murs, plancher et ventilation inchangés.
13. **Mitoyenneté** : le mur mitoyen donne sur un logement chauffé, il est donc non déperditif. Sa jonction avec les façades est traitée comme une liaison refend/mur à demi-valeur.
14. **Puissance** : P = GV × 28,5 K. Pas de surpuissance de relance, pas de déduction des apports internes ou solaires.
15. **Extrapolation de Ue** pour Upb < 0,31, que l'annexe autorise (p. 18). Elle crée un petit artefact : en mitoyenne, Ue de 2001-2005 vaut 0,247, contre 0,243 en maison isolée.
16. Le **chiffre ADEME** de comparaison n'indique pas la surface de la maison.

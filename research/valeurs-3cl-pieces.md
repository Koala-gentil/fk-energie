# Valeurs 3CL-DPE 2021 pour un calcul de déperditions pièce par pièce

Extraction du 1er octobre 2026, destinée aux calculateurs de FK Énergie (Nord et Pas-de-Calais, zone H1a).

**Source principale** : arrêté du 31 mars 2021, annexe 1 « Méthode de calcul 3CL-DPE 2021 », version consolidée « Dernière mise à jour - Octobre 2021 » (`annexe1_3cl.pdf`, 147 pages) :
https://rt-re-batiment.developpement-durable.gouv.fr/IMG/pdf/consolide_annexe_1_arrete_du_31_03_2021_relatif_aux_methodes_et_procedures_applicables.pdf

- Le numéro de page du PDF est égal au numéro imprimé.
- Les tableaux ont été lus dans le texte extrait (`pdftotext -layout`), puis contrôlés sur le rendu image des pages 10, 11, 13 à 15, 17 à 22, 35 et 37.
- Les tableaux Umur_tab (p. 13), Upb_tab (p. 17) et Uph_tab (p. 21) sont des images pivotées à 90°. Ils ont été lus après rotation.
- Les valeurs sont en W/(m²·K) pour U, en W/(m·K) pour k et λ, et en m²·K/W pour R.

Une **correction** par rapport à la consigne : les tableaux Ue pour un plancher sur **terre-plein** sont à la **page 19**, pas à la page 18. La page 18 ne contient que le tableau « vide sanitaire ou sous-sol non chauffé ».

---

## 1. Umur0 : mur non isolé (§3.2.1.2, p. 14 à 16)

Définition (p. 14) : « Umur0 est le coefficient de transmission thermique du mur non isolé (W/(m².K)) ». Toutes les épaisseurs sont en cm.

### 1.1 Murs en pierre de taille et moellons (p. 14)

La catégorie couvre les murs en granit, gneiss, porphyres, pierres calcaires, grès, meulières, schistes et pierres volcaniques.

| Épaisseur (cm) | ≤ 20 | 25 | 30 | 35 | 40 | 45 | 50 | 55 | 60 | 65 | 70 | 75 | ≥ 80 |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Constitués d'un seul matériau / inconnu | 3,2 | 2,85 | 2,65 | 2,45 | 2,3 | 2,15 | 2,05 | 1,90 | 1,80 | 1,75 | 1,65 | 1,55 | 1,50 |
| Avec remplissage tout venant | – | – | – | – | – | – | 1,90 | 1,75 | 1,60 | 1,50 | 1,45 | 1,30 | 1,25 |

### 1.2 Murs en briques pleines simples (p. 14)

| Épaisseur (cm) | ≤ 9 | 12 | 15 | 19 | 23 | 28 | 34 | 45 | 55 | 60 | ≥ 70 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| Umur0 | 3,9 | 3,45 | 3,05 | 2,75 | 2,5 | 2,25 | 2 | 1,65 | 1,45 | 1,35 | 1,2 |

### 1.3 Murs en briques pleines doubles avec lame d'air (p. 14)

| Épaisseur (cm) | ≤ 20 | 25 | 30 | 35 | 45 | 50 | ≥ 60 |
|---|---|---|---|---|---|---|---|
| Umur0 | 2 | 1,85 | 1,65 | 1,55 | 1,35 | 1,25 | 1,2 |

### 1.4 Murs en briques creuses (p. 14)

| Épaisseur (cm) | ≤ 15 | 18 | 20 | 23 | 25 | 28 | 33 | 38 | ≥ 43 |
|---|---|---|---|---|---|---|---|---|---|
| Umur0 | 2,15 | 2,05 | 2 | 1,85 | 1,7 | 1,68 | 1,65 | 1,55 | 1,4 |

### 1.5 Murs en blocs de béton pleins (p. 14)

| Épaisseur | ≤ 20 | 23 | 25 | 28 | 30 | 33 | 35 | 38 | ≥ 40 |
|---|---|---|---|---|---|---|---|---|---|
| Umur0 | 2,9 | 2,75 | 2,6 | 2,5 | 2,4 | 2,3 | 2,2 | 2,1 | 2,05 |

Le titre de colonne est seulement « Epaisseur connue », sans unité, contrairement aux autres tableaux qui indiquent « (en cm) ».

### 1.6 Murs en blocs de béton creux, ou parpaings (p. 15)

| Épaisseur (cm) | ≤ 20 | 23 | ≥ 25 |
|---|---|---|---|
| Umur0 | 2,8 | 2,65 | 2,3 |

Le mot « parpaing » n'apparaît pas dans l'annexe. Le tableau s'intitule « Murs en blocs de béton creux ».

### 1.7 Murs en béton banché (béton plein coulé) et en béton de mâchefer (p. 15)

| Épaisseur (cm) | ≤ 20 | 22,5 | 25 | 28 | 30 | 35 | 40 | ≥ 45 |
|---|---|---|---|---|---|---|---|---|
| Béton banché | 2,9 | 2,75 | 2,65 | 2,5 | 2,4 | 2,2 | 2,05 | 1,9 |
| Béton de mâchefer | 2,75 | 2,5 | 2,4 | 2,25 | 2,15 | 1,95 | 1,8 | – |

### 1.8 Mur en béton cellulaire (p. 15)

| Épaisseur (cm) | 15 | 17,5 | 20 | 22,5 | 25 | 27,5 | 30 | 32,5 | 35 | 37,5 |
|---|---|---|---|---|---|---|---|---|---|---|
| Construction < 2013 | 0,90 | 0,79 | 0,70 | 0,63 | 0,57 | 0,53 | 0,49 | 0,45 | 0,42 | 0,40 |
| Construction ≥ 2013 | 0,69 | 0,60 | 0,53 | 0,48 | 0,43 | 0,40 | 0,36 | 0,30 | 0,28 | 0,22 |

Le tableau ne donne aucune valeur en dessous de 15 cm ni au-dessus de 37,5 cm.

### 1.9 Murs à ossature bois (p. 15 et 16)

| Épaisseur (cm) | 10 | 15 | 20 | 25 | 30 | 35 | 40 | ≥ 45 |
|---|---|---|---|---|---|---|---|---|
| Avec isolant en remplissage, ≥ 2006 | 0,45 | 0,35 | 0,26 | 0,21 | 0,17 | 0,15 | 0,13 | 0,11 |
| Avec isolant en remplissage, 2001-2005 | 0,52 | 0,41 | 0,3 | 0,24 | 0,2 | 0,17 | 0,15 | 0,13 |
| Avec isolant en remplissage, < 2001 | 0,65 | 0,45 | 0,34 | 0,28 | 0,23 | 0,2 | 0,18 | 0,16 |

Sources : p. 15 pour les trois lignes ci-dessus, p. 16 pour le tableau ci-dessous.

| Épaisseur (cm) | ≤ 8 | 10 | 13 | 18 | 24 | ≥ 32 |
|---|---|---|---|---|---|---|
| Ossature bois avec remplissage tout venant | 1,7 (valeur unique, toutes épaisseurs) | | | | | |
| Ossature bois sans remplissage | 3 | 2,7 | 2,35 | 1,98 | 1,65 | 1,35 |

Pour un mur en ossature bois, les ponts thermiques sont traités comme ceux d'un mur à isolation répartie (ITR) (p. 33). Les ponts thermiques menuiserie/mur sont négligés pour les parois en structure bois (p. 37).

### 1.10 Autres murs du tableau (p. 14 et 15)

| Type de mur | Valeurs | Page |
|---|---|---|
| Pisé ou béton de terre stabilisé | ≤ 40 : 1,75 ; 45 : 1,65 ; 50 : 1,55 ; 55 : 1,45 ; 60 : 1,35 ; 65 : 1,25 ; 70 : 1,2 ; 75 : 1,15 ; ≥ 80 : 1,1 | p. 14 |
| Pans de bois sans remplissage tout venant | ≤ 8 : 3 ; 10 : 2,7 ; 13 : 2,35 ; 18 : 1,98 ; 24 : 1,65 ; ≥ 32 : 1,35 | p. 14 |
| Pans de bois avec remplissage tout venant | 1,7 | p. 14 |
| Bois (rondins) | ≤ 10 : 1,6 ; 15 : 1,2 ; 20 : 0,95 ; ≥ 25 : 0,8 | p. 14 |
| Brique terre cuite alvéolaire | 30 : 0,47 ; 37,5 : 0,40 | p. 15 |
| Sandwich béton/isolant/béton, sans isolation rapportée | ≤ 15 : 0,9 ; 20 : 0,48 ; ≥ 25 : 0,45 | p. 15 |
| Cloison de plâtre | 3,33 | p. 16 |

### 1.11 Règles associées

| Règle | Texte de la source | Page |
|---|---|---|
| Umur_nu | Si le type de mur est connu : Umur_nu = Min(Umur0 ; 2,5) | p. 13 (schéma) |
| Type de mur inconnu | Umur_nu = 2,5 | p. 13 (schéma) |
| Pierre de matériau inconnu | ligne « Murs constitués d'un seul matériau / inconnu » du tableau pierre (§1.1) | p. 14 |
| Enduit isolant sur paroi ancienne | Umur0 = 1 / (1/Umur0_sansEnduit + Renduit), avec Renduit = 0,7 m²·K/W. S'applique aux parois « anciennes » en pierre, terre, colombage ou brique ancienne. L'enduit n'y est pas considéré comme une isolation | p. 16 |
| Doublage | Umur_doublage = 1 / (1/Umur0 + Rdoublage) | p. 16 |
| Rdoublage = 0,1 m²·K/W | doublage rapporté de nature indéterminée, ou lame d'air de moins de 15 mm | p. 16 |
| Rdoublage = 0,21 m²·K/W | lame d'air de plus de 15 mm, ou matériau de doublage connu (plâtre, brique, bois) | p. 16 |
| Murs non répertoriés | « saisir directement les coefficients de transmission thermique quand ils sont justifiés » | p. 16 |

**Interpolation entre deux épaisseurs.** L'annexe ne donne aucune règle d'interpolation pour les tableaux Umur0. Elle en donne une explicitement pour Ue (p. 18), Uw (p. 26) et Ujn (p. 30), mais pas pour Umur0. Choisir de prendre la colonne la plus proche ou d'interpoler est donc une décision à documenter.

---

## 2. Formules quand l'isolation est connue

Schémas §3.2.1.1 (p. 13), §3.2.2.1 (p. 17) et §3.2.3.1 (p. 21).

| Paroi | Résistance R connue | Épaisseur e connue | Isolation de nature inconnue, ou année seule connue | Page |
|---|---|---|---|---|
| Mur | Umur = 1 / (1/Umur_nu + R_isolant) | Umur = 1 / (1/Umur_nu + e/0,04) | Umur = Min(Umur_nu ; Umur_tab) | p. 13 |
| Plancher bas | Upb = 1 / (1/Upb0 + R_isolant) | Upb = 1 / (1/Upb0 + **e/0,042**) | Upb = min(Upb0 ; Upb_tab) | p. 17 |
| Plancher haut | Uph = 1 / (1/Uph0 + R_isolant) | Uph = 1 / (1/Uph0 + e/0,04) | Uph = min(Uph0 ; Uph_tab) | p. 21 |

Ordre de priorité, identique dans les trois schémas :
1. U connu : le saisir.
2. Sinon, isolation absente : U = U nu.
3. Isolation présente : R connu, sinon épaisseur connue, sinon année d'isolation connue. Si l'année d'isolation est inconnue, on prend « 75-77 » quand l'année de construction est ≤ 74, et l'année de construction sinon.
4. Isolation « inconnue » : min(U nu ; U_tab).

Le mur part de **Umur_nu**, déjà plafonné à 2,5. Le plancher bas part de Upb0 et le plancher haut de Uph0.

**Unité de e.** L'annexe 1 **ne précise pas l'unité de e** : ni le schéma ni le texte ne la donnent (vérifié par recherche dans tout le texte). Deux éléments vont dans le sens du mètre :
- la cohérence dimensionnelle : 0,04 et 0,042 jouent le rôle d'un λ en W/(m·K), et e/λ doit être une résistance en m²·K/W ;
- le moteur open source Open3CL, qui n'est **pas une source officielle**, saisit l'épaisseur en cm puis la multiplie par 0,01 (`epaisseur_isolation * 0.01`, puis `e / 0.04` pour le mur et le plafond, `e / 0.042` pour le plancher bas) : https://github.com/Open3CL/engine/blob/main/src/3.2.1_mur.js (lignes 246 à 249), `3.2.2_plancher_bas.js` (lignes 186 à 188) et `3.2.3_plancher_haut.js` (lignes 112 à 114).

Exemple : 10 cm de laine sur un mur nu à 2,5 donne 1/(1/2,5 + 0,10/0,04) = 0,345.

### Tables U_tab, zone H1, pour mémoire

Lues sur image après rotation.

| Année de construction ou d'isolation | Umur_tab H1 Effet Joule | Umur_tab H1 Autres | Upb_tab H1 Effet Joule | Upb_tab H1 Autres | Uph_tab Combles H1 Effet Joule | Uph_tab Combles H1 Autres | Uph_tab Terrasse H1 Effet Joule | Uph_tab Terrasse H1 Autres |
|---|---|---|---|---|---|---|---|---|
| ≤ 74 ou inconnue | 2,5 | 2,5 | 2 | 2 | 2,5 | 2,5 | 2,5 | 2,5 |
| 75-77 | 1 | 1 | 0,9 | 0,9 | 0,5 | 0,5 | 0,75 | 0,75 |
| 78-82 | 0,8 | 1 | 0,8 | 0,9 | 0,4 | 0,5 | 0,7 | 0,75 |
| 83-88 | 0,7 | 0,8 | 0,55 | 0,8 | 0,3 | 0,3 | 0,4 | 0,55 |
| 89-00 | 0,45 | 0,5 | 0,55 | 0,5 | 0,25 | 0,25 | 0,35 | 0,4 |
| 01-05 | 0,4 | 0,4 | 0,3 | 0,3 | 0,23 | 0,23 | 0,3 | 0,3 |
| 06-12 | 0,36 | 0,36 | 0,27 | 0,27 | 0,2 | 0,2 | 0,27 | 0,27 |
| ≥ 13 | 0,23 | 0,23 | 0,23 | 0,23 | 0,14 | 0,14 | 0,14 | 0,14 |

Sources : Umur_tab p. 13, Upb_tab p. 17, Uph_tab p. 21.

**Point ambigu (p. 21).** La phrase sous le tableau dit : « Lorsque le local au-dessus du logement est un local non chauffé, ou un local autre que d'habitation., Uph_tab est pris dans la catégorie « Terrasse » ».
- Lue littéralement, elle pourrait s'appliquer à un plafond sous combles perdus non chauffés.
- Le rapport `coefficient-g-3cl.md` a utilisé la colonne « Combles » pour les combles perdus.
- L'annexe ne tranche pas explicitement.

---

## 3. Uph0 et Upb0

### 3.1 Uph0, plancher haut non isolé (§3.2.3.2, p. 22 ; schéma p. 21)

| Cas demandé | Uph0 | Source |
|---|---|---|
| Type de plafond inconnu | **2,5** | schéma p. 21 : « Type de plafond connu ? Non → Uph0 = 2,5 » |
| Plafond en plaque de plâtre, cas typique des combles perdus | **2,5** | p. 22 |
| Combles aménagés sous rampant | **2,5** | p. 22 |
| Dalle béton, toiture terrasse béton | **2,5** | p. 22 (pictogramme « Dalle béton ») |
| Toitures en bac acier, traitées comme des combles aménagés sous rampants | 2,5 | p. 22 |

Autres Uph0 donnés à la p. 22, tous sur pictogramme :

| Type de plafond | Uph0 |
|---|---|
| Plafond avec ou sans remplissage, pictogramme « ? » | 1,45 |
| Bardeaux et remplissage | 1,2 |
| Plafond bois sous solives métalliques | 2,5 |
| Plafond bois sous solives bois | 2,3 |
| Plafond entre solives bois, avec ou sans remplissage | 1,2 |
| Plafond entre solives métalliques, avec ou sans remplissage | 1,45 |
| Plafond lourd type entrevous terre cuite, poutrelles béton | 2,5 |
| Plafond bois sur solives bois | 2 |
| Plafond bois sur solives métalliques | 2,5 |
| Toiture en chaume | 0,24 |

**« Combles perdus » n'existe pas en tant que type de plafond.** La méthode type le plafond, pas le comble : plaque de plâtre, solives, etc. Un plafond en plâtre sous combles perdus donne 2,5.

**Deux valeurs pour un plafond « inconnu ».** Le pictogramme « ? » de la p. 22 (« Plafond avec ou sans remplissage ») vaut 1,45. Le schéma de la p. 21, pour un type de plafond **inconnu**, impose 2,5. Le rapport existant applique 2,5.

### 3.2 Upb0, plancher bas non isolé (§3.2.2.2, p. 20 ; schéma p. 17)

| Cas demandé | Upb0 | Source |
|---|---|---|
| Type de plancher inconnu | **2** | schéma p. 17 : « Type de plancher connu ? Non → Upb0 = 2 » |
| Dalle béton | **2** | p. 20 |
| Plancher bois sur solives bois | **1,6** | p. 20 |
| Plancher entre solives bois, avec ou sans remplissage | 1,1 | p. 20 |

Autres Upb0 donnés à la p. 20 :

| Type de plancher | Upb0 |
|---|---|
| Plancher avec ou sans remplissage, pictogramme « ? » | 1,45 |
| Plancher entre solives métalliques, avec ou sans remplissage | 1,45 |
| Plancher bois sur solives métalliques | 1,6 |
| Bardeaux et remplissage | 1,1 |
| Voûtains sur solives métalliques | 1,75 |
| Plancher lourd type entrevous terre cuite, poutrelles béton | 2 |
| Voûtains en briques ou moellons | 0,8 |
| Plancher à entrevous isolant | 0,45 |

Comme pour le plafond, le pictogramme « ? » vaut 1,45, tandis qu'un type **inconnu** vaut 2 selon le schéma de la p. 17.

---

## 4. Ue : plancher sur vide sanitaire, sous-sol non chauffé ou terre-plein (§3.2.2.1, p. 18 et 19)

### 4.1 Règles (p. 18)

- « Pour les vides sanitaires, les sous-sol non chauffés et terre-plein, le calcul des déperditions se fait avec un coefficient Ue en remplacement de Upb. » Upb reste nécessaire pour lire Ue.
- Upb est calculé « selon le schéma précédent », celui du plancher donnant sur l'extérieur ou un local non chauffé, décrit au §2 ci-dessus.
- **P** : « périmètre ou linéaire du plancher déperditif du bâtiment ou du lot sur terre-plein, vide sanitaire ou sous-sol non chauffé donnant sur l'extérieur ou un local non chauffé (m) ».
- **S** : « surface du plancher du bâtiment ou du lot sur terre-plein, vide sanitaire ou sous-sol non chauffé (m²) ».
- « **2S/P est arrondi à l'entier le plus proche** ».
- « Les données ne figurant pas dans le tableau peuvent être obtenues par **interpolation et extrapolation** en traçant des droites entre les valeurs les plus proches présentes dans le tableau. »
- « Le Ue d'un plancher est un Umoyen pour tout le plancher du bâtiment. » Il intègre l'isolation périphérique.
- b = 1 pour ces planchers (§3.1, p. 8).

Conséquence pour un calcul pièce par pièce : S et P sont ceux du **plancher entier** du bâtiment, pas ceux de la pièce. On calcule Ue une seule fois, puis on l'applique à la surface de plancher de chaque pièce.

### 4.2 (b) Plancher sur vide sanitaire ou sous-sol non chauffé (p. 18)

| 2S/P \ Upb | 3,33 | 1,43 | 0,83 | 0,45 | 0,41 | 0,37 | 0,34 | 0,31 |
|---|---|---|---|---|---|---|---|---|
| 3 | 0,45 | 0,42 | 0,39 | 0,36 | 0,33 | 0,3 | 0,28 | 0,26 |
| 4 | 0,43 | 0,4 | 0,37 | 0,34 | 0,31 | 0,29 | 0,27 | 0,25 |
| 5 | 0,38 | 0,36 | 0,34 | 0,32 | 0,3 | 0,28 | 0,26 | 0,25 |
| 6 | 0,37 | 0,35 | 0,33 | 0,31 | 0,29 | 0,27 | 0,25 | 0,24 |
| 7 | 0,36 | 0,34 | 0,32 | 0,3 | 0,28 | 0,26 | 0,24 | 0,23 |
| 8 | 0,35 | 0,33 | 0,31 | 0,29 | 0,27 | 0,25 | 0,24 | 0,22 |
| 9 | 0,34 | 0,32 | 0,3 | 0,28 | 0,26 | 0,24 | 0,23 | 0,22 |
| 10 | 0,33 | 0,31 | 0,29 | 0,27 | 0,25 | 0,24 | 0,22 | 0,21 |
| 12 | 0,28 | 0,27 | 0,26 | 0,25 | 0,24 | 0,22 | 0,21 | 0,2 |
| 14 | 0,28 | 0,27 | 0,26 | 0,24 | 0,23 | 0,21 | 0,2 | 0,19 |
| 16 | 0,28 | 0,27 | 0,25 | 0,23 | 0,21 | 0,2 | 0,19 | 0,18 |
| 18 | 0,28 | 0,26 | 0,24 | 0,22 | 0,2 | 0,19 | 0,19 | 0,18 |
| 20 | 0,24 | 0,23 | 0,22 | 0,21 | 0,2 | 0,19 | 0,18 | 0,17 |

### 4.3 (a) Plancher sur terre-plein, bâtiment construit avant 2001 (p. 19)

| 2S/P \ Upb | 3,4 | 1,5 | 0,85 | 0,59 | 0,46 |
|---|---|---|---|---|---|
| 3 | 0,78 | 0,56 | 0,43 | 0,35 | 0,3 |
| 4 | 0,68 | 0,51 | 0,4 | 0,33 | 0,28 |
| 5 | 0,6 | 0,46 | 0,38 | 0,32 | 0,27 |
| 6 | 0,54 | 0,43 | 0,35 | 0,3 | 0,26 |
| 7 | 0,49 | 0,39 | 0,33 | 0,28 | 0,25 |
| 8 | 0,45 | 0,37 | 0,31 | 0,27 | 0,24 |
| 9 | 0,42 | 0,34 | 0,29 | 0,26 | 0,23 |
| 10 | 0,39 | 0,32 | 0,28 | 0,24 | 0,22 |
| 12 | 0,35 | 0,29 | 0,25 | 0,22 | 0,2 |
| 14 | 0,31 | 0,26 | 0,23 | 0,2 | 0,19 |
| 16 | 0,28 | 0,24 | 0,21 | 0,19 | 0,17 |
| 18 | 0,26 | 0,22 | 0,2 | 0,18 | 0,16 |
| 20 | 0,24 | 0,21 | 0,18 | 0,17 | 0,15 |

### 4.4 (a') Plancher sur terre-plein, bâtiment construit à partir de 2001 (p. 19)

| 2S/P \ Upb | 3,4 | 1,5 | 0,85 | 0,6 | 0,46 | 0,37 | 0,31 |
|---|---|---|---|---|---|---|---|
| 3 | 0,7 | 0,6 | 0,49 | 0,39 | 0,33 | 0,28 | 0,25 |
| 4 | 0,65 | 0,55 | 0,45 | 0,36 | 0,31 | 0,26 | 0,23 |
| 5 | 0,58 | 0,5 | 0,42 | 0,34 | 0,29 | 0,25 | 0,22 |
| 6 | 0,52 | 0,45 | 0,38 | 0,32 | 0,27 | 0,24 | 0,21 |
| 7 | 0,48 | 0,42 | 0,36 | 0,3 | 0,26 | 0,23 | 0,2 |
| 8 | 0,45 | 0,39 | 0,33 | 0,28 | 0,25 | 0,22 | 0,2 |
| 9 | 0,39 | 0,35 | 0,31 | 0,27 | 0,24 | 0,21 | 0,19 |
| 10 | 0,38 | 0,34 | 0,3 | 0,26 | 0,23 | 0,2 | 0,18 |
| 12 | 0,35 | 0,31 | 0,27 | 0,23 | 0,21 | 0,19 | 0,17 |
| 14 | 0,3 | 0,27 | 0,24 | 0,21 | 0,19 | 0,17 | 0,16 |
| 16 | 0,26 | 0,24 | 0,22 | 0,2 | 0,18 | 0,16 | 0,15 |
| 18 | 0,25 | 0,24 | 0,21 | 0,18 | 0,17 | 0,15 | 0,14 |
| 20 | 0,23 | 0,21 | 0,19 | 0,17 | 0,16 | 0,14 | 0,13 |

Remarques :
- Les lignes 11, 13, 15, 17 et 19 de 2S/P n'existent pas. Elles s'obtiennent par interpolation, comme le permet la p. 18.
- Pour 2S/P < 3 ou > 20, ou pour un Upb hors des colonnes, on extrapole, ce que la p. 18 autorise aussi.
- La règle d'isolation par défaut des terre-pleins diffère selon la section :
  - §3.4 (p. 33) : non isolé avant 2001, ITE à partir de 2001 ;
  - §3.1 (p. 10) : isolés par l'extérieur à partir de 2001.

---

## 5. Ug et Uw des fenêtres (§3.3.1, p. 23 à 25 ; §3.3.2, p. 26 à 30)

### 5.1 Règles

- Il n'existe **pas de « Ug par défaut » unique** pour un triple vitrage. Ug se lit selon :
  - la lame d'air ;
  - le gaz (air sec ou inconnu / argon ou krypton) ;
  - la présence d'un traitement peu émissif ;
  - l'inclinaison (p. 25).
- « Par défaut, les doubles et triples vitrages installés à partir de 2006 sont tous considérés remplis à l'Argon ou au Krypton » (p. 25).
- L'annexe ne contient **aucune règle par défaut sur la couche peu émissive** : recherche « peu émissi » dans tout le texte.
- Triple vitrage à lames inégales : on prend la moitié de l'épaisseur totale des deux lames. Exemple de l'annexe : un 4/10/4/12/4 est traité comme un 4/10/4/10/4 (p. 25).
- Lame d'air absente du tableau : on prend « la valeur directement inférieure » (p. 24).
- Uw pour un Ug non tabulé : interpolation ou extrapolation avec les deux Ug tabulés les plus proches (p. 26).
- Simple vitrage : Ug = 5,8, quelle que soit l'épaisseur (p. 23).
- Menuiserie mixte bois-métal : elle prend les caractéristiques du bois (p. 29).
- Une baie fixe ou oscillante est traitée comme une baie battante (p. 26).
- Double fenêtre : Uw = 1 / (1/Uw1 + 1/Uw2 + 0,07) (p. 30).

### 5.2 Ug, triple vitrage vertical (p. 25)

| Lame (mm) | Air, non traité | Air, peu émissif | Argon ou krypton, non traité | Argon ou krypton, peu émissif |
|---|---|---|---|---|
| 6 | 2,3 | 1,7 | 2,1 | 1,5 |
| 8 | 2,1 | 1,4 | 1,9 | 1,2 |
| 10 | 2,0 | 1,2 | 1,8 | 1,0 |
| **12** | 1,9 | 1,1 | 1,8 | **0,9** |
| 14 | 1,8 | 1,0 | 1,7 | 0,8 |
| 15 | 1,8 | 0,9 | 1,7 | 0,7 |
| **16** | 1,8 | 0,9 | 1,7 | **0,7** |
| 18 | 1,7 | 0,8 | 1,6 | 0,6 |
| 20 | 1,7 | 0,8 | 1,6 | 0,6 |

Un triple vitrage 4/12/4/12/4 argon peu émissif vertical a donc **Ug = 0,9**. Un 4/16/4/16/4 argon peu émissif a Ug = 0,7.

### 5.3 Uw retenus

| Menuiserie | Vitrage, Ug (page) | Fenêtre battante | Fenêtre coulissante | Porte-fenêtre battante | Porte-fenêtre coulissante | Porte-fenêtre battante avec soubassement | Page Uw |
|---|---|---|---|---|---|---|---|
| **PVC** | triple 4/12/4/12/4 argon peu émissif, Ug 0,9 (p. 25) | **1,2** | 1,6 | 1,1 | 1,4 | 1,2 | p. 28 |
| PVC | triple 4/16/4/16/4 argon peu émissif, Ug 0,7 (p. 25) | 1,1 | 1,5 | 1,0 | 1,2 | 1,1 | p. 28 |
| **Bois ou bois-métal** | triple 4/12/4/12/4 argon peu émissif, Ug 0,9 | **1,4** | 1,5 | 1,2 | 1,3 | 1,4 | p. 29 |
| Bois ou bois-métal | triple 4/16/4/16/4 argon peu émissif, Ug 0,7 | 1,3 | 1,4 | 1,1 | 1,2 | 1,2 | p. 29 |
| Métal à rupture de pont thermique | triple, Ug 0,9 | 1,6 | 1,7 | 1,4 | 1,6 | – | p. 26 |

Le tableau « métal à rupture de pont thermique » n'a pas de colonne « avec soubassement ».

### 5.4 Contrôle des valeurs déjà connues

Les trois valeurs sont **confirmées** (fenêtre battante) :

| Cas | Ug (page) | Uw fenêtre battante (page) | Statut |
|---|---|---|---|
| Simple vitrage, bois | 5,8 (p. 23) | **5,4** : ligne Ug 5,8 du tableau bois, en haut de la p. 30 | confirmé |
| Double 4/12/4 air, non traité, PVC | 2,8 (p. 24) | **2,7** (p. 28) | confirmé |
| Double 4/16/4 argon peu émissif, PVC | 1,1 (p. 24) | **1,4** (p. 28) | confirmé |

Pour ces mêmes cas, les autres types d'ouvrant donnent :
- simple vitrage bois : coulissante 5,4 ; porte-fenêtre battante 5,4 ; porte-fenêtre coulissante 5,5 ; porte-fenêtre avec soubassement 4,8 (p. 30) ;
- PVC, Ug 2,8 : coulissante 2,9 ; porte-fenêtre battante 2,6 ; porte-fenêtre coulissante 2,9 ; porte-fenêtre avec soubassement 2,5 (p. 28) ;
- PVC, Ug 1,1 : coulissante 1,7 ; porte-fenêtre battante 1,3 ; porte-fenêtre coulissante 1,6 ; porte-fenêtre avec soubassement 1,4 (p. 28).

---

## 6. Coefficient b d'une paroi sur garage (§3.1, p. 8 à 11)

### 6.1 Définitions (p. 8 et 10)

- **Aue** : « surface des parois du local non chauffé donnant sur l'extérieur ou en contact avec le sol (paroi enterrée, terre-plein) ».
- **Aiu** : « surface des parois du local non chauffé qui donnent sur des locaux chauffés ».
- Les parois du local non chauffé qui donnent sur un vide sanitaire ou sur un autre local non chauffé n'entrent ni dans Aiu ni dans Aue. Il n'y a « pas d'échange entre deux locaux non chauffés distincts » (p. 8).
- Si Aue = 0, alors b = 0 (p. 10).
- Une paroi est considérée isolée si plus de 50 % de sa surface est isolée (p. 10).
- Les portes et les doubles vitrages comptent comme **non isolés** pour le calcul de b. Le triple vitrage compte comme isolé (p. 10).
- Isolation inconnue (p. 10) :
  - avant 1975, la paroi est non isolée ;
  - à partir de 1975, les murs sont isolés par l'intérieur, les plafonds par l'extérieur, et les terre-pleins par l'extérieur à partir de 2001.
- Locaux non chauffés **non accessibles** : b = 0,95 forfaitaire. Paroi donnant sur un bâtiment autre que d'habitation : b = 0,2 (p. 8).

### 6.2 UV,ue (tableau p. 9)

Valeurs en maison individuelle :

| Local | UV,ue |
|---|---|
| **Garage** | **3** |
| Cellier | 3 |
| Comble fortement ventilé | 9 |
| Comble faiblement ventilé | 3 |
| Comble très faiblement ventilé | 0,3 |

Le tableau donne aussi les valeurs du logement collectif. Pour un garage privé collectif ou d'autres dépendances, UV,ue = 3. Pour les circulations communes, UV,ue vaut 0,0, 0,3 ou 3 selon le cas.

### 6.3 Tableaux b = f(Aiu/Aue, UV,ue), complets (p. 10 et 11)

| Aiu/Aue | T1 : Aiu isolée, Aue non isolée (p. 10, gauche) ; UV,ue 0,0 / 0,3 / 3,0 / 9,0 | T2 : Aiu non isolée, Aue non isolée (p. 10, droite) ; UV,ue 0,0 / 0,3 / 3,0 / 9,0 | T3 : Aiu non isolée, Aue isolée (p. 11, gauche) ; UV,ue 0,0 / 0,3 / 3,0 / 9,0 | T4 : Aiu isolée, Aue isolée (p. 11, droite) ; UV,ue 0,0 / 0,3 / 3,0 / 9,0 |
|---|---|---|---|---|
| ≤ 0,25 | 0,95 / 0,95 / 1,00 / 1,00 | 0,80 / 0,85 / 0,90 / 0,95 | 0,35 / 0,50 / 0,85 / 0,95 | 0,80 / 0,90 / 0,95 / 1,00 |
| 0,25 < x ≤ 0,50 | 0,95 / 0,95 / 0,95 / 1,00 | 0,65 / 0,75 / 0,80 / 0,90 | 0,20 / 0,35 / 0,70 / 0,90 | 0,65 / 0,80 / 0,95 / 1,00 |
| 0,50 < x ≤ 0,75 | 0,90 / 0,95 / 0,95 / 1,00 | 0,55 / 0,65 / 0,75 / 0,85 | 0,15 / 0,25 / 0,65 / 0,85 | 0,55 / 0,70 / 0,90 / 0,95 |
| 0,75 < x ≤ 1,00 | 0,85 / 0,90 / 0,95 / 0,95 | 0,50 / 0,55 / 0,70 / 0,80 | 0,15 / 0,20 / 0,55 / 0,80 | 0,50 / 0,65 / 0,90 / 0,95 |
| 1,00 < x ≤ 1,25 | 0,85 / 0,90 / 0,90 / 0,95 | 0,45 / 0,50 / 0,65 / 0,80 | 0,10 / 0,15 / 0,50 / 0,75 | 0,45 / 0,60 / 0,90 / 0,95 |
| 1,25 < x ≤ 2,00 | 0,80 / 0,80 / 0,90 / 0,95 | 0,35 / 0,40 / 0,50 / 0,70 | 0,05 / 0,10 / 0,40 / 0,65 | 0,35 / 0,45 / 0,80 / 0,95 |
| 2,00 < x ≤ 2,50 | 0,75 / 0,80 / 0,85 / 0,90 | 0,30 / 0,35 / 0,45 / 0,65 | 0,05 / 0,10 / 0,35 / 0,60 | 0,30 / 0,40 / 0,80 / 0,90 |
| 2,50 < x ≤ 3,00 | 0,70 / 0,75 / 0,85 / 0,90 | 0,25 / 0,30 / 0,40 / 0,60 | 0,05 / 0,10 / 0,30 / 0,55 | 0,25 / 0,35 / 0,75 / 0,90 |
| 3,00 < x ≤ 3,50 | 0,65 / 0,75 / 0,80 / 0,90 | 0,20 / 0,30 / 0,40 / 0,55 | 0,05 / 0,05 / 0,25 / 0,50 | 0,20 / 0,35 / 0,70 / 0,90 |
| 3,50 < x ≤ 4,00 | 0,65 / 0,70 / 0,80 / 0,90 | 0,20 / 0,25 / 0,35 / 0,50 | 0,05 / 0,05 / 0,25 / 0,45 | 0,20 / 0,30 / 0,70 / 0,85 |
| 4,00 < x ≤ 6,00 | 0,55 / 0,60 / 0,70 / 0,85 | 0,15 / 0,20 / 0,25 / 0,40 | 0,00 / 0,05 / 0,20 / 0,35 | 0,15 / 0,25 / 0,60 / 0,80 |
| 6,00 < x ≤ 8,00 | 0,45 / 0,55 / 0,65 / 0,80 | 0,10 / 0,15 / 0,20 / 0,35 | 0,00 / 0,05 / 0,15 / 0,30 | 0,10 / 0,20 / 0,55 / 0,75 |
| 8,00 < x ≤ 10,00 | 0,40 / 0,50 / 0,60 / 0,75 | 0,10 / 0,10 / 0,20 / 0,30 | 0,00 / 0,05 / 0,10 / 0,25 | 0,10 / 0,15 / 0,45 / 0,70 |
| 10,00 < x ≤ 25,00 | 0,35 / 0,40 / 0,50 / 0,70 | 0,05 / 0,10 / 0,15 / 0,25 | 0,00 / 0,00 / 0,10 / 0,20 | 0,05 / 0,10 / 0,40 / 0,65 |
| 25,00 < x ≤ 50,00 | 0,20 / 0,25 / 0,35 / 0,50 | 0,05 / 0,05 / 0,05 / 0,15 | 0,00 / 0,00 / 0,05 / 0,10 | 0,05 / 0,05 / 0,25 / 0,45 |
| > 50,00 | 0,10 / 0,15 / 0,20 / 0,30 | 0,00 / 0,00 / 0,05 / 0,05 | 0,00 / 0,00 / 0,00 / 0,05 | 0,00 / 0,05 / 0,10 / 0,30 |

Les en-têtes des quatre tableaux ont été lus sur les schémas, aux p. 10 et 11.

### 6.4 b pour un garage accolé (UV,ue = 3, colonne « 3,0 »)

Garage typique : murs extérieurs, porte, toit et sol non isolés, d'où Aue **non isolée**.

| Aiu/Aue | Mur maison/garage **non isolé** (T2) | Mur maison/garage **isolé** (T1) |
|---|---|---|
| ≤ 0,25 | 0,90 | 1,00 |
| 0,25 < x ≤ 0,50 | **0,80** | **0,95** |
| 0,50 < x ≤ 0,75 | 0,75 | 0,95 |

**Valeur à retenir pour Aiu/Aue entre 0,25 et 0,5 : b = 0,80** si le mur mitoyen n'est pas isolé, **b = 0,95** s'il est isolé. Si l'isolation du mur mitoyen est inconnue, la règle de la p. 10 s'applique :
- bâtiment d'avant 1975 : mur non isolé, donc 0,80 ;
- bâtiment construit à partir de 1975 : mur isolé par l'intérieur, donc 0,95.

**Exemple de calcul, géométrie hypothétique non sourcée.** Garage de 3 × 6 m, hauteur 2,5 m, accolé par son long côté :
- Aiu = 6 × 2,5 = 15 m² ;
- Aue = 2 pignons de 7,5 m² + façade avec porte de 15 m² + toit de 18 m² + sol de 18 m² = 66 m² ;
- Aiu/Aue = 0,23, ce qui donne b = 0,90 (non isolé) ou 1,00 (isolé).

Le sol du garage est en contact avec le sol : il entre dans Aue (définition p. 8). Si le garage a son propre comble non chauffé au-dessus d'un plafond, ce plafond n'entre ni dans Aiu ni dans Aue (p. 8). Aue diminue alors et le rapport monte vers 0,3.

---

## 7. Ponts thermiques (§3.4, p. 32 à 37)

PT = Σ k·l. Aucun coefficient b n'est appliqué (p. 33).

Seuls les ponts thermiques entre parois lourdes, ou entre une paroi et une menuiserie, sont conservés (p. 33). Les murs à ossature bois sont traités comme des murs ITR (p. 33).

Isolation inconnue (p. 33) :
- avant 1975 : non isolé ;
- à partir de 1975 : murs ITI, plafonds ITE, terre-plein non isolé avant 2001 puis ITE, autres planchers ITE.

Type d'isolation indiscernable : ITI par défaut pour un mur, ITE par défaut pour un plancher bas ou un plancher haut (p. 35 et 36).

### 7.1 Plancher bas / mur, kpb (§3.4.1, p. 35)

| Mur \ Plancher bas | Non isolé | ITI | ITE | ITI + ITE |
|---|---|---|---|---|
| Non isolé | 0,39 | 0,47 | 0,8 | 0,47 |
| ITI | 0,31 | 0,08 | 0,71 | 0,08 |
| ITE | 0,49 | 0,48 | 0,64 | 0,48 |
| ITR | 0,35 | 0,1 | 0,45 | 0,1 |
| ITI + ITE | 0,31 | 0,08 | 0,45 | 0,08 |
| ITI + ITR | 0,31 | 0,08 | 0,45 | 0,08 |
| ITE + ITR | 0,35 | 0,1 | 0,45 | 0,1 |

Règles (p. 32 et 35) :
- La liaison ne compte que si le mur et le plancher sont tous deux lourds. Sinon k = 0.
- Pour un plancher bas, ITI désigne une isolation sous chape et ITE une isolation en sous-face.
- Un plancher en hourdis polystyrène compte comme ITE.
- Le linéaire lpb inclut les seuils de porte et de porte-fenêtre (p. 32).

### 7.2 Plancher intermédiaire / mur, kpi (§3.4.2, p. 35)

| Mur | Non isolé | ITI | ITE | ITR | ITI + ITE | ITI + ITR | ITE + ITR |
|---|---|---|---|---|---|---|---|
| kpi | 0,86 | 0,92 | 0,13 | 0,24 | 0,13 | 0,24 | 0,13 |

Règles (p. 35) :
- Un plancher intermédiaire en structure légère est négligé.
- On prend la moitié de la valeur si le plancher ne sépare pas deux niveaux du lot.

### 7.3 Plancher haut lourd ou terrasse / mur, kph (§3.4.3, p. 36)

| Mur \ Plancher haut | Non isolé | ITI | ITE | ITI + ITE |
|---|---|---|---|---|
| Non isolé | 0,3 | 0,83 | 0,4 | 0,4 |
| ITI | 0,27 | 0,07 | 0,75 | 0,07 |
| ITE | 0,55 | 0,76 | 0,58 | 0,58 |
| ITR | 0,4 | 0,3 | 0,48 | 0,3 |
| ITI + ITE | 0,27 | 0,07 | 0,58 | 0,07 |
| ITI + ITR | 0,27 | 0,07 | 0,48 | 0,07 |
| ITE + ITR | 0,4 | 0,3 | 0,48 | 0,3 |

Pour un plancher haut, ITI désigne une isolation sous le plancher et ITE une isolation sur le plancher. Un plancher haut en structure légère est négligé (p. 36).

### 7.4 Refend / mur, krf (§3.4.4, p. 36)

| Mur | Non isolé | ITI | ITE | ITR | ITI + ITE | ITI + ITR | ITE + ITR |
|---|---|---|---|---|---|---|---|
| krf | 0,73 | 0,82 | 0,13 | 0,2 | 0,13 | 0,2 | 0,13 |

Règles (p. 33 et 36) :
- Seuls les refends lourds comptent.
- On prend la moitié de la valeur si le refend ne sépare pas deux volumes du même lot.
- En immeuble collectif, la longueur forfaitaire est lrf = 2·Hsp·(Nblgt − Niv) (p. 33).

### 7.5 Menuiserie / mur, kmen (§3.4.5, p. 37)

Lp est la largeur du dormant en cm, arrondie à 5 ou 10.

| Mur \ Position de la menuiserie | Nu extérieur, Lp 5 | Nu extérieur, Lp 10 | Tunnel, Lp 5 | Tunnel, Lp 10 | Nu intérieur, Lp 5 | Nu intérieur, Lp 10 |
|---|---|---|---|---|---|---|
| Non isolé | 0,43 | 0,29 | 0,31 | 0,19 | 0,38 | 0,25 |
| ITI avec retour d'isolant | 0,22 | 0,18 | 0,16 | 0,13 | 0 | 0 |
| ITI sans retour d'isolant | 0,43 | 0,29 | 0,31 | 0,19 | 0 | 0 |
| ITE avec retour d'isolant | 0 | 0 | 0,19 | 0,15 | 0,25 | 0,2 |
| ITE sans retour d'isolant | 0 | 0 | 0,45 | 0,4 | 0,9 | 0,8 |
| ITR | 0,2 (toutes positions) | | | | | |
| ITI+ITE avec retour | 0 | 0 | 0,16 | 0,13 | 0 | 0 |
| ITI+ITE sans retour | 0 | 0 | 0,31 | 0,19 | 0 | 0 |
| ITI+ITR avec retour | 0,2 | 0,18 | 0,16 | 0,13 | 0 | 0 |
| ITI+ITR sans retour | 0,2 | 0,2 | 0,2 | 0,19 | 0 | 0 |
| ITE+ITR avec retour | 0 | 0 | 0,19 | 0,15 | 0,2 | 0,2 |
| ITE+ITR sans retour | 0 | 0 | 0,2 | 0,2 | 0,2 | 0,2 |

Règles (p. 37) :
- On entend par menuiserie les fenêtres, portes et portes-fenêtres.
- Les valeurs couvrent les appuis, les tableaux et le linteau. Les seuils sont exclus : ils sont comptés dans la liaison plancher bas/mur (p. 32).
- Les ponts thermiques sont négligés :
  - avec une paroi en structure bois (ossature bois, rondins, pans de bois) ;
  - autour des fenêtres de toit ;
  - au niveau des pavés de verre.
- Double fenêtre : on retient le dormant le plus large.
- L'annexe ne donne **pas de position de menuiserie par défaut**, ni de règle par défaut sur la présence d'un retour d'isolant.

---

## 8. Conductivité thermique λ des isolants

### 8.1 Dans la 3CL

L'annexe 1 n'utilise **aucun λ par type d'isolant**. Elle applique deux valeurs fixes, quel que soit l'isolant :
- **0,04** pour les murs (p. 13) et les plafonds (p. 21) ;
- **0,042** pour les planchers bas (p. 17).

Le mot « conductivité » n'apparaît nulle part dans le texte extrait de l'annexe. Pour tenir compte d'un isolant précis, la méthode passe par la **résistance R** quand elle est connue et justifiée : formule « R connue » des schémas des p. 13, 17 et 21.

### 8.2 Sources officielles par isolant

**a) ADEME / France Rénov'**, guide « Comment isoler sa maison ? », juillet 2025, p. 10 :
https://librairie.ademe.fr/index.php?controller=attachment&id_attachment=7357
- Citation : « Les matériaux isolants courants ont un [λ] compris entre 0,025 et 0,05 W/m.K. »
- C'est la **seule fourchette donnée**. Le guide ne donne pas de λ par isolant ; il ne fournit qu'un tableau des usages, p. 12 et 13.
- Le guide « Isoler sa maison » de 2023 (ecologie.gouv.fr) donne la même fourchette 0,025 à 0,05 : https://www.ecologie.gouv.fr/sites/default/files/documents/guide-pratique-isoler-sa-maison.pdf

**b) Règles Th-U Ex**, bâtiments existants, fascicule 2/5 « Matériaux », version entérinée, PDF de 2008, page 5/5 (p. 8 du PDF) :
https://rt-re-batiment.developpement-durable.gouv.fr/IMG/pdf/thu-ex_5_fascicules.pdf
- Domaine d'application : produits déjà présents dans un bâtiment existant construit après 1948, en l'absence de données (p. 3/5).

| Isolant | λ (W/(m·K)) |
|---|---|
| Mousses de polyuréthane ou polystyrène extrudé | **0,03** |
| Autres isolants thermiques (laine minérale, polystyrène expansé, verre cellulaire, etc.) | **0,04** |

**c) Règles Th-bât, fascicule « Matériaux »**, PDF du 18 décembre 2017, §2.6 « Valeurs par défaut » :
https://rt-re-batiment.developpement-durable.gouv.fr/IMG/pdf/2-fascicule_materiaux.pdf
- Ce sont des **valeurs par défaut** pour des produits **non certifiés**. Elles sont donc plus pénalisantes que le λ certifié ACERMI d'un produit du commerce.

| Isolant (§, page) | λ par défaut selon la masse volumique ρ (kg/m³) |
|---|---|
| Laine de roche en panneaux ou rouleaux (§2.6.2.1, p. 18) | 15-25 : 0,050 ; 25-40 : 0,044 ; 40-100 : 0,042 ; 100-125 : 0,044 ; 125-150 : 0,046 ; 150-175 : 0,047 ; 175-200 : 0,048 |
| Laine de verre en panneaux ou rouleaux (§2.6.2.2, p. 18) | 7-10 : 0,055 ; 10-15 : 0,047 ; 15-20 : 0,044 ; 20-30 : 0,041 ; 30-40 : 0,039 ; 40-80 : 0,038 ; 80-120 : 0,039 ; 120-150 : 0,040 |
| Laines minérales en vrac (§2.6.2.3, p. 18) | soufflage sur plancher de comble, 10-25 : 0,056 ; épandage manuel, 10-60 : 0,065 ; insufflation en mur ou rampant, 20-80 : 0,060 |
| Polystyrène expansé PSE / EPS (§2.6.4.1, p. 19) | 7-10 : 0,056 ; 10-13 : 0,050 ; 13-15 : 0,047 ; 15-19 : 0,044 ; 19-24 : 0,042 ; 24-29 : 0,040 ; 29-40 : 0,039 ; 40-60 : 0,038 |
| Polystyrène extrudé XPS (§2.6.4.2, p. 20) | sans gaz autre qu'air ou CO2 : 0,041 (e ≤ 60 mm), 0,046 (e > 60 mm) ; HFC : 0,039 (e ≤ 60 mm), 0,044 (e > 60 mm) ; HCFC, CFC (produits d'avant 1996) : 0,031 à 0,035 |
| Polyuréthane PUR (§2.6.4.5, p. 21) | plaques à parements souples, pentane ou HCFC : 0,035 (parement perméable) ou 0,030 (alu > 50 µm, étanche) ; découpées dans des blocs : 0,041 ; sans gaz autre qu'air ou CO2 : 0,040 |
| Ouate de cellulose, fibre de bois (§2.6.7.1, p. 24 ; §2.5.2.5 et §2.5.3, p. 16) | pas de valeur : le fascicule renvoie aux « annexes IX des arrêtés » RT 2012 |

**d) Arrêté du 26 octobre 2010 (RT 2012), annexe IX « Performance par défaut des isolants bio-sourcés »**, Légifrance :
https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000022962033
- La page a été lue via WebFetch : Légifrance bloque le téléchargement direct par Cloudflare. Il faut **revérifier les chiffres à l'écran avant de les coder**.

| Isolant | λ par défaut (W/(m·K)) |
|---|---|
| Cellulose, ρ 20-100 kg/m³ | **0,049** |
| Panneaux de fibres de bois (NF EN 316), ρ ≤ 200 | 0,07 |
| Panneaux de fibres de bois (NF EN 316), 200-350 | 0,10 |
| Panneaux de fibres de bois (NF EN 316), 350-550 | 0,14 |
| Panneaux de fibres de bois (NF EN 316), 550-750 | 0,18 |
| Panneaux de fibres de bois (NF EN 316), 750-1 000 | 0,20 |

Toujours selon WebFetch, l'annexe donne aussi :
- chanvre et lin en fibres liées : 0,048 ;
- laine de mouton : 0,046.

Ces valeurs biosourcées sont des valeurs **par défaut pénalisantes**. Les panneaux NF EN 316 sont des panneaux de fibres durs ou mi-durs, pas les isolants souples en fibre de bois. Elles ne reflètent pas le λ certifié des isolants biosourcés courants.

**Aucune source officielle trouvée** (ADEME, France Rénov', CSTB, Effinergie) ne donne une **fourchette « typique » de λ certifié** par isolant pour la laine de verre, la laine de roche, le PSE, le XPS, le PUR, la fibre de bois et la ouate. Les fourchettes qui circulent (par exemple PUR 0,022 à 0,028, fibre de bois 0,036 à 0,046) viennent de sites commerciaux et n'ont pas été retenues.

---

## 9. Récapitulatif JSON

Les décimales sont notées avec un point. Les pages renvoient à l'annexe 1 de l'arrêté du 31 mars 2021, sauf dans la section `lambda`.

```json
{
  "source": "Arrêté du 31 mars 2021, annexe 1 (3CL-DPE 2021), version consolidée oct. 2021",
  "umur0": {
    "_page": "14-16",
    "_note": "épaisseur en cm ; aucune règle d'interpolation donnée pour Umur0",
    "pierre_seul_materiau_ou_inconnu": { "ep": [20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80], "u": [3.2, 2.85, 2.65, 2.45, 2.3, 2.15, 2.05, 1.90, 1.80, 1.75, 1.65, 1.55, 1.50], "_ep_bornes": "≤20 et ≥80" },
    "pierre_remplissage_tout_venant": { "ep": [50, 55, 60, 65, 70, 75, 80], "u": [1.90, 1.75, 1.60, 1.50, 1.45, 1.30, 1.25], "_note": "pas de valeur < 50 cm" },
    "brique_pleine_simple": { "ep": [9, 12, 15, 19, 23, 28, 34, 45, 55, 60, 70], "u": [3.9, 3.45, 3.05, 2.75, 2.5, 2.25, 2, 1.65, 1.45, 1.35, 1.2] },
    "brique_pleine_double_lame_air": { "ep": [20, 25, 30, 35, 45, 50, 60], "u": [2, 1.85, 1.65, 1.55, 1.35, 1.25, 1.2] },
    "brique_creuse": { "ep": [15, 18, 20, 23, 25, 28, 33, 38, 43], "u": [2.15, 2.05, 2, 1.85, 1.7, 1.68, 1.65, 1.55, 1.4] },
    "bloc_beton_plein": { "ep": [20, 23, 25, 28, 30, 33, 35, 38, 40], "u": [2.9, 2.75, 2.6, 2.5, 2.4, 2.3, 2.2, 2.1, 2.05] },
    "bloc_beton_creux": { "ep": [20, 23, 25], "u": [2.8, 2.65, 2.3] },
    "beton_banche": { "ep": [20, 22.5, 25, 28, 30, 35, 40, 45], "u": [2.9, 2.75, 2.65, 2.5, 2.4, 2.2, 2.05, 1.9] },
    "beton_machefer": { "ep": [20, 22.5, 25, 28, 30, 35, 40], "u": [2.75, 2.5, 2.4, 2.25, 2.15, 1.95, 1.8] },
    "beton_cellulaire_avant_2013": { "ep": [15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5], "u": [0.90, 0.79, 0.70, 0.63, 0.57, 0.53, 0.49, 0.45, 0.42, 0.40] },
    "beton_cellulaire_2013_et_apres": { "ep": [15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5], "u": [0.69, 0.60, 0.53, 0.48, 0.43, 0.40, 0.36, 0.30, 0.28, 0.22] },
    "ossature_bois_isolant_2006_et_apres": { "ep": [10, 15, 20, 25, 30, 35, 40, 45], "u": [0.45, 0.35, 0.26, 0.21, 0.17, 0.15, 0.13, 0.11] },
    "ossature_bois_isolant_2001_2005": { "ep": [10, 15, 20, 25, 30, 35, 40, 45], "u": [0.52, 0.41, 0.3, 0.24, 0.2, 0.17, 0.15, 0.13] },
    "ossature_bois_isolant_avant_2001": { "ep": [10, 15, 20, 25, 30, 35, 40, 45], "u": [0.65, 0.45, 0.34, 0.28, 0.23, 0.2, 0.18, 0.16] },
    "ossature_bois_remplissage_tout_venant": 1.7,
    "ossature_bois_sans_remplissage": { "ep": [8, 10, 13, 18, 24, 32], "u": [3, 2.7, 2.35, 1.98, 1.65, 1.35] },
    "brique_terre_cuite_alveolaire": { "ep": [30, 37.5], "u": [0.47, 0.40] },
    "sandwich_beton_isolant_beton": { "ep": [15, 20, 25], "u": [0.9, 0.48, 0.45] },
    "cloison_platre": 3.33
  },
  "mur_regles": {
    "_page": "13 et 16",
    "umur_nu": "min(Umur0, 2.5)",
    "type_inconnu_umur_nu": 2.5,
    "r_doublage_indetermine_ou_lame_air_moins_15mm": 0.1,
    "r_doublage_lame_air_plus_15mm_ou_materiau_connu": 0.21,
    "r_enduit_isolant_paroi_ancienne": 0.7,
    "formule_doublage": "1/(1/Umur0 + Rdoublage)"
  },
  "formules_isolation": {
    "_unite_e": "non précisée dans l'annexe ; mètres par cohérence dimensionnelle (Open3CL : cm × 0.01)",
    "mur": { "R": "1/(1/Umur_nu + R)", "e": "1/(1/Umur_nu + e/0.04)", "inconnue": "min(Umur_nu, Umur_tab)", "_page": 13 },
    "plancher_bas": { "R": "1/(1/Upb0 + R)", "e": "1/(1/Upb0 + e/0.042)", "inconnue": "min(Upb0, Upb_tab)", "_page": 17 },
    "plancher_haut": { "R": "1/(1/Uph0 + R)", "e": "1/(1/Uph0 + e/0.04)", "inconnue": "min(Uph0, Uph_tab)", "_page": 21 },
    "annee_isolation_inconnue": "si construction ≤ 1974 alors 75-77, sinon année de construction"
  },
  "u_tab_H1": {
    "_periodes": ["<=74|inconnue", "75-77", "78-82", "83-88", "89-00", "01-05", "06-12", ">=13"],
    "umur_effet_joule": [2.5, 1, 0.8, 0.7, 0.45, 0.4, 0.36, 0.23],
    "umur_autres": [2.5, 1, 1, 0.8, 0.5, 0.4, 0.36, 0.23],
    "upb_effet_joule": [2, 0.9, 0.8, 0.55, 0.55, 0.3, 0.27, 0.23],
    "upb_autres": [2, 0.9, 0.9, 0.8, 0.5, 0.3, 0.27, 0.23],
    "uph_combles_effet_joule": [2.5, 0.5, 0.4, 0.3, 0.25, 0.23, 0.2, 0.14],
    "uph_combles_autres": [2.5, 0.5, 0.5, 0.3, 0.25, 0.23, 0.2, 0.14],
    "uph_terrasse_effet_joule": [2.5, 0.75, 0.7, 0.4, 0.35, 0.3, 0.27, 0.14],
    "uph_terrasse_autres": [2.5, 0.75, 0.75, 0.55, 0.4, 0.3, 0.27, 0.14],
    "_pages": { "umur": 13, "upb": 17, "uph": 21 }
  },
  "uph0": {
    "_page": "21-22",
    "type_inconnu": 2.5,
    "plafond_platre_combles_perdus": 2.5,
    "combles_amenages_sous_rampants": 2.5,
    "dalle_beton_toiture_terrasse": 2.5,
    "bac_acier": 2.5,
    "pictogramme_avec_ou_sans_remplissage": 1.45,
    "bardeaux_et_remplissage": 1.2,
    "bois_sous_solives_metalliques": 2.5,
    "bois_sous_solives_bois": 2.3,
    "entre_solives_bois": 1.2,
    "entre_solives_metalliques": 1.45,
    "lourd_entrevous_terre_cuite_poutrelles_beton": 2.5,
    "bois_sur_solives_bois": 2,
    "bois_sur_solives_metalliques": 2.5,
    "chaume": 0.24
  },
  "upb0": {
    "_page": "17 et 20",
    "type_inconnu": 2,
    "dalle_beton": 2,
    "plancher_bois_sur_solives_bois": 1.6,
    "entre_solives_bois": 1.1,
    "pictogramme_avec_ou_sans_remplissage": 1.45,
    "entre_solives_metalliques": 1.45,
    "bois_sur_solives_metalliques": 1.6,
    "bardeaux_et_remplissage": 1.1,
    "voutains_sur_solives_metalliques": 1.75,
    "lourd_entrevous_terre_cuite_poutrelles_beton": 2,
    "voutains_briques_ou_moellons": 0.8,
    "entrevous_isolant": 0.45
  },
  "ue": {
    "_regles": "2S/P arrondi à l'entier le plus proche ; S et P du plancher entier du bâtiment ; interpolation et extrapolation linéaires autorisées (p. 18) ; b = 1",
    "_lignes_2S_P": [3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20],
    "vide_sanitaire_ou_sous_sol_non_chauffe": {
      "_page": 18,
      "upb": [3.33, 1.43, 0.83, 0.45, 0.41, 0.37, 0.34, 0.31],
      "ue": [
        [0.45, 0.42, 0.39, 0.36, 0.33, 0.3, 0.28, 0.26],
        [0.43, 0.4, 0.37, 0.34, 0.31, 0.29, 0.27, 0.25],
        [0.38, 0.36, 0.34, 0.32, 0.3, 0.28, 0.26, 0.25],
        [0.37, 0.35, 0.33, 0.31, 0.29, 0.27, 0.25, 0.24],
        [0.36, 0.34, 0.32, 0.3, 0.28, 0.26, 0.24, 0.23],
        [0.35, 0.33, 0.31, 0.29, 0.27, 0.25, 0.24, 0.22],
        [0.34, 0.32, 0.3, 0.28, 0.26, 0.24, 0.23, 0.22],
        [0.33, 0.31, 0.29, 0.27, 0.25, 0.24, 0.22, 0.21],
        [0.28, 0.27, 0.26, 0.25, 0.24, 0.22, 0.21, 0.2],
        [0.28, 0.27, 0.26, 0.24, 0.23, 0.21, 0.2, 0.19],
        [0.28, 0.27, 0.25, 0.23, 0.21, 0.2, 0.19, 0.18],
        [0.28, 0.26, 0.24, 0.22, 0.2, 0.19, 0.19, 0.18],
        [0.24, 0.23, 0.22, 0.21, 0.2, 0.19, 0.18, 0.17]
      ]
    },
    "terre_plein_avant_2001": {
      "_page": 19,
      "upb": [3.4, 1.5, 0.85, 0.59, 0.46],
      "ue": [
        [0.78, 0.56, 0.43, 0.35, 0.3],
        [0.68, 0.51, 0.4, 0.33, 0.28],
        [0.6, 0.46, 0.38, 0.32, 0.27],
        [0.54, 0.43, 0.35, 0.3, 0.26],
        [0.49, 0.39, 0.33, 0.28, 0.25],
        [0.45, 0.37, 0.31, 0.27, 0.24],
        [0.42, 0.34, 0.29, 0.26, 0.23],
        [0.39, 0.32, 0.28, 0.24, 0.22],
        [0.35, 0.29, 0.25, 0.22, 0.2],
        [0.31, 0.26, 0.23, 0.2, 0.19],
        [0.28, 0.24, 0.21, 0.19, 0.17],
        [0.26, 0.22, 0.2, 0.18, 0.16],
        [0.24, 0.21, 0.18, 0.17, 0.15]
      ]
    },
    "terre_plein_2001_et_apres": {
      "_page": 19,
      "upb": [3.4, 1.5, 0.85, 0.6, 0.46, 0.37, 0.31],
      "ue": [
        [0.7, 0.6, 0.49, 0.39, 0.33, 0.28, 0.25],
        [0.65, 0.55, 0.45, 0.36, 0.31, 0.26, 0.23],
        [0.58, 0.5, 0.42, 0.34, 0.29, 0.25, 0.22],
        [0.52, 0.45, 0.38, 0.32, 0.27, 0.24, 0.21],
        [0.48, 0.42, 0.36, 0.3, 0.26, 0.23, 0.2],
        [0.45, 0.39, 0.33, 0.28, 0.25, 0.22, 0.2],
        [0.39, 0.35, 0.31, 0.27, 0.24, 0.21, 0.19],
        [0.38, 0.34, 0.3, 0.26, 0.23, 0.2, 0.18],
        [0.35, 0.31, 0.27, 0.23, 0.21, 0.19, 0.17],
        [0.3, 0.27, 0.24, 0.21, 0.19, 0.17, 0.16],
        [0.26, 0.24, 0.22, 0.2, 0.18, 0.16, 0.15],
        [0.25, 0.24, 0.21, 0.18, 0.17, 0.15, 0.14],
        [0.23, 0.21, 0.19, 0.17, 0.16, 0.14, 0.13]
      ]
    }
  },
  "fenetres": {
    "_note": "Uw ordre : [fenetre_battante, fenetre_coulissante, pf_battante, pf_coulissante, pf_soubassement]",
    "argon_par_defaut_depuis_2006": true,
    "ug": {
      "simple": 5.8,
      "double_4_12_4_air_non_traite": 2.8,
      "double_4_16_4_argon_peu_emissif": 1.1,
      "triple_4_12_4_12_4_air_non_traite": 1.9,
      "triple_4_12_4_12_4_air_peu_emissif": 1.1,
      "triple_4_12_4_12_4_argon_non_traite": 1.8,
      "triple_4_12_4_12_4_argon_peu_emissif": 0.9,
      "triple_4_16_4_16_4_argon_peu_emissif": 0.7,
      "_pages": "23-25"
    },
    "uw": {
      "pvc_triple_ug0_9": [1.2, 1.6, 1.1, 1.4, 1.2],
      "pvc_triple_ug0_7": [1.1, 1.5, 1.0, 1.2, 1.1],
      "bois_triple_ug0_9": [1.4, 1.5, 1.2, 1.3, 1.4],
      "bois_triple_ug0_7": [1.3, 1.4, 1.1, 1.2, 1.2],
      "metal_rpt_triple_ug0_9": [1.6, 1.7, 1.4, 1.6, null],
      "bois_simple_ug5_8": [5.4, 5.4, 5.4, 5.5, 4.8],
      "pvc_double_ug2_8": [2.7, 2.9, 2.6, 2.9, 2.5],
      "pvc_double_ug1_1": [1.4, 1.7, 1.3, 1.6, 1.4],
      "_pages": { "metal_rpt": 26, "pvc": 28, "bois": "29-30" }
    },
    "double_fenetre": "1/(1/Uw1 + 1/Uw2 + 0.07)"
  },
  "b_local_non_chauffe": {
    "_page": "8-11",
    "uv_ue": { "garage": 3, "cellier": 3, "comble_fortement_ventile": 9, "comble_faiblement_ventile": 3, "comble_tres_faiblement_ventile": 0.3 },
    "b_fixes": { "exterieur_terre_plein_vide_sanitaire_sous_sol": 1, "lnc_non_accessible": 0.95, "batiment_non_habitation": 0.2, "aue_nul": 0 },
    "_ratio_bornes_sup": [0.25, 0.5, 0.75, 1.0, 1.25, 2.0, 2.5, 3.0, 3.5, 4.0, 6.0, 8.0, 10.0, 25.0, 50.0, null],
    "_colonnes_uv_ue": [0.0, 0.3, 3.0, 9.0],
    "aiu_isole_aue_non_isole": [[0.95,0.95,1.00,1.00],[0.95,0.95,0.95,1.00],[0.90,0.95,0.95,1.00],[0.85,0.90,0.95,0.95],[0.85,0.90,0.90,0.95],[0.80,0.80,0.90,0.95],[0.75,0.80,0.85,0.90],[0.70,0.75,0.85,0.90],[0.65,0.75,0.80,0.90],[0.65,0.70,0.80,0.90],[0.55,0.60,0.70,0.85],[0.45,0.55,0.65,0.80],[0.40,0.50,0.60,0.75],[0.35,0.40,0.50,0.70],[0.20,0.25,0.35,0.50],[0.10,0.15,0.20,0.30]],
    "aiu_non_isole_aue_non_isole": [[0.80,0.85,0.90,0.95],[0.65,0.75,0.80,0.90],[0.55,0.65,0.75,0.85],[0.50,0.55,0.70,0.80],[0.45,0.50,0.65,0.80],[0.35,0.40,0.50,0.70],[0.30,0.35,0.45,0.65],[0.25,0.30,0.40,0.60],[0.20,0.30,0.40,0.55],[0.20,0.25,0.35,0.50],[0.15,0.20,0.25,0.40],[0.10,0.15,0.20,0.35],[0.10,0.10,0.20,0.30],[0.05,0.10,0.15,0.25],[0.05,0.05,0.05,0.15],[0.00,0.00,0.05,0.05]],
    "aiu_non_isole_aue_isole": [[0.35,0.50,0.85,0.95],[0.20,0.35,0.70,0.90],[0.15,0.25,0.65,0.85],[0.15,0.20,0.55,0.80],[0.10,0.15,0.50,0.75],[0.05,0.10,0.40,0.65],[0.05,0.10,0.35,0.60],[0.05,0.10,0.30,0.55],[0.05,0.05,0.25,0.50],[0.05,0.05,0.25,0.45],[0.00,0.05,0.20,0.35],[0.00,0.05,0.15,0.30],[0.00,0.05,0.10,0.25],[0.00,0.00,0.10,0.20],[0.00,0.00,0.05,0.10],[0.00,0.00,0.00,0.05]],
    "aiu_isole_aue_isole": [[0.80,0.90,0.95,1.00],[0.65,0.80,0.95,1.00],[0.55,0.70,0.90,0.95],[0.50,0.65,0.90,0.95],[0.45,0.60,0.90,0.95],[0.35,0.45,0.80,0.95],[0.30,0.40,0.80,0.90],[0.25,0.35,0.75,0.90],[0.20,0.35,0.70,0.90],[0.20,0.30,0.70,0.85],[0.15,0.25,0.60,0.80],[0.10,0.20,0.55,0.75],[0.10,0.15,0.45,0.70],[0.05,0.10,0.40,0.65],[0.05,0.05,0.25,0.45],[0.00,0.05,0.10,0.30]],
    "garage_aue_non_isole_ratio_0_25_a_0_5": { "mur_maison_garage_non_isole": 0.80, "mur_maison_garage_isole": 0.95 },
    "garage_aue_non_isole_ratio_max_0_25": { "mur_maison_garage_non_isole": 0.90, "mur_maison_garage_isole": 1.00 },
    "garage_aue_non_isole_ratio_0_5_a_0_75": { "mur_maison_garage_non_isole": 0.75, "mur_maison_garage_isole": 0.95 }
  },
  "ponts_thermiques": {
    "_pages": "32-37",
    "_isolation_mur": ["non_isole", "ITI", "ITE", "ITR", "ITI+ITE", "ITI+ITR", "ITE+ITR"],
    "kpb": {
      "_colonnes_plancher_bas": ["non_isole", "ITI", "ITE", "ITI+ITE"],
      "non_isole": [0.39, 0.47, 0.8, 0.47],
      "ITI": [0.31, 0.08, 0.71, 0.08],
      "ITE": [0.49, 0.48, 0.64, 0.48],
      "ITR": [0.35, 0.1, 0.45, 0.1],
      "ITI+ITE": [0.31, 0.08, 0.45, 0.08],
      "ITI+ITR": [0.31, 0.08, 0.45, 0.08],
      "ITE+ITR": [0.35, 0.1, 0.45, 0.1]
    },
    "kpi": { "non_isole": 0.86, "ITI": 0.92, "ITE": 0.13, "ITR": 0.24, "ITI+ITE": 0.13, "ITI+ITR": 0.24, "ITE+ITR": 0.13, "_regle": "moitié si le plancher ne sépare pas deux niveaux du lot ; plancher léger négligé" },
    "kph_lourd": {
      "_colonnes_plancher_haut": ["non_isole", "ITI", "ITE", "ITI+ITE"],
      "non_isole": [0.3, 0.83, 0.4, 0.4],
      "ITI": [0.27, 0.07, 0.75, 0.07],
      "ITE": [0.55, 0.76, 0.58, 0.58],
      "ITR": [0.4, 0.3, 0.48, 0.3],
      "ITI+ITE": [0.27, 0.07, 0.58, 0.07],
      "ITI+ITR": [0.27, 0.07, 0.48, 0.07],
      "ITE+ITR": [0.4, 0.3, 0.48, 0.3]
    },
    "krf": { "non_isole": 0.73, "ITI": 0.82, "ITE": 0.13, "ITR": 0.2, "ITI+ITE": 0.13, "ITI+ITR": 0.2, "ITE+ITR": 0.13, "_regle": "moitié si le refend ne sépare pas deux volumes du lot ; refend léger : 0" },
    "kmen": {
      "_colonnes": ["nu_ext_lp5", "nu_ext_lp10", "tunnel_lp5", "tunnel_lp10", "nu_int_lp5", "nu_int_lp10"],
      "non_isole": [0.43, 0.29, 0.31, 0.19, 0.38, 0.25],
      "ITI_avec_retour": [0.22, 0.18, 0.16, 0.13, 0, 0],
      "ITI_sans_retour": [0.43, 0.29, 0.31, 0.19, 0, 0],
      "ITE_avec_retour": [0, 0, 0.19, 0.15, 0.25, 0.2],
      "ITE_sans_retour": [0, 0, 0.45, 0.4, 0.9, 0.8],
      "ITR": [0.2, 0.2, 0.2, 0.2, 0.2, 0.2],
      "ITI+ITE_avec_retour": [0, 0, 0.16, 0.13, 0, 0],
      "ITI+ITE_sans_retour": [0, 0, 0.31, 0.19, 0, 0],
      "ITI+ITR_avec_retour": [0.2, 0.18, 0.16, 0.13, 0, 0],
      "ITI+ITR_sans_retour": [0.2, 0.2, 0.2, 0.19, 0, 0],
      "ITE+ITR_avec_retour": [0, 0, 0.19, 0.15, 0.2, 0.2],
      "ITE+ITR_sans_retour": [0, 0, 0.2, 0.2, 0.2, 0.2],
      "_regle": "appuis + tableaux + linteau ; seuils exclus (comptés en plancher bas/mur) ; structure bois et fenêtres de toit négligées"
    }
  },
  "lambda": {
    "3cl_mur_et_plafond": 0.04,
    "3cl_plancher_bas": 0.042,
    "ademe_fourchette_isolants_courants": [0.025, 0.05],
    "thu_ex_existant_pur_ou_xps": 0.03,
    "thu_ex_existant_autres_laine_minerale_pse": 0.04,
    "thbat_defaut_laine_de_verre_par_masse_vol": { "7-10": 0.055, "10-15": 0.047, "15-20": 0.044, "20-30": 0.041, "30-40": 0.039, "40-80": 0.038, "80-120": 0.039, "120-150": 0.040 },
    "thbat_defaut_laine_de_roche_par_masse_vol": { "15-25": 0.050, "25-40": 0.044, "40-100": 0.042, "100-125": 0.044, "125-150": 0.046, "150-175": 0.047, "175-200": 0.048 },
    "thbat_defaut_laine_minerale_vrac": { "soufflage_comble": 0.056, "epandage_manuel": 0.065, "insufflation_mur_rampant": 0.060 },
    "thbat_defaut_pse_par_masse_vol": { "7-10": 0.056, "10-13": 0.050, "13-15": 0.047, "15-19": 0.044, "19-24": 0.042, "24-29": 0.040, "29-40": 0.039, "40-60": 0.038 },
    "thbat_defaut_xps": { "air_co2_e_le_60mm": 0.041, "air_co2_e_gt_60mm": 0.046, "hfc_e_le_60mm": 0.039, "hfc_e_gt_60mm": 0.044 },
    "thbat_defaut_pur": { "parement_permeable": 0.035, "parement_alu_etanche": 0.030, "decoupe_bloc": 0.041, "sans_gaz_air_co2": 0.040 },
    "rt2012_annexe_IX_defaut_cellulose": 0.049,
    "rt2012_annexe_IX_defaut_panneaux_fibres_bois_NF_EN_316": { "<=200": 0.07, "200-350": 0.10, "350-550": 0.14, "550-750": 0.18, "750-1000": 0.20 },
    "_sources": {
      "ademe": "https://librairie.ademe.fr/index.php?controller=attachment&id_attachment=7357 (p. 10)",
      "thu_ex": "https://rt-re-batiment.developpement-durable.gouv.fr/IMG/pdf/thu-ex_5_fascicules.pdf (fasc. 2/5, p. 5/5)",
      "thbat": "https://rt-re-batiment.developpement-durable.gouv.fr/IMG/pdf/2-fascicule_materiaux.pdf (p. 18-21)",
      "rt2012_annexe_IX": "https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000022962033 (à revérifier à l'écran)"
    }
  }
}
```

---

## 10. Non trouvé, ou à trancher

1. **Unité de e** dans e/0,04 et e/0,042 : l'annexe 1 ne la donne pas. Le mètre est déduit de la cohérence dimensionnelle et de la pratique d'Open3CL, qui n'est pas une source officielle.
2. **Interpolation de Umur0** entre deux épaisseurs : l'annexe ne donne pas de règle. Elle n'en donne que pour Ue (p. 18), Uw (p. 26) et Ujn (p. 30).
3. **Ug « par défaut » d'un triple vitrage** : il n'existe pas. Seul le remplissage argon est imposé par défaut à partir de 2006 (p. 25). Aucune règle par défaut pour la couche peu émissive ni pour l'épaisseur de lame.
4. **Position par défaut de la menuiserie** (nu intérieur, tunnel, nu extérieur) et **retour d'isolant par défaut** : l'annexe ne donne ni l'un ni l'autre (§3.4.5).
5. **Le mot « parpaing »** n'apparaît pas ; le tableau correspondant est « blocs de béton creux » (p. 15). Le **béton cellulaire** n'a pas de valeur hors de la plage 15 à 37,5 cm.
6. **Combles perdus** : ce n'est pas un type de plafond dans l'annexe. La valeur retenue vient du plafond en plaque de plâtre, 2,5.
7. **Valeurs contradictoires pour un plafond ou un plancher « inconnu »** : le pictogramme « ? » donne 1,45, le schéma donne 2,5 (plafond) et 2 (plancher bas).
8. **Choix Combles / Terrasse pour Uph_tab** sous des combles perdus non chauffés : la phrase de la p. 21 est ambiguë.
9. **λ « typique » ou certifié par isolant** (laine de verre, laine de roche, PSE, XPS, PUR, fibre de bois, ouate) : aucune fourchette par isolant trouvée chez l'ADEME, France Rénov', le CSTB ou Effinergie. On a seulement :
   - la fourchette globale de l'ADEME, 0,025 à 0,05 ;
   - les valeurs **par défaut** pénalisantes de Th-U Ex et de Th-bât ;
   - celles de l'annexe IX de la RT 2012 pour les biosourcés.
10. **Fibre de bois isolante souple ou rigide** : aucune valeur par défaut officielle lue. L'annexe IX ne vise que les panneaux de fibres NF EN 316, d'après une lecture via WebFetch. La norme NF EN 13171 n'apparaît pas dans l'extrait obtenu.
11. **Annexe IX de la RT 2012** : les chiffres ont été obtenus via WebFetch, sans lecture directe du texte (Légifrance bloque le téléchargement). Ils sont à vérifier avant de les coder.

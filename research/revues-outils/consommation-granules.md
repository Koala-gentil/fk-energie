# Revue de l'outil `/outils/consommation-granules/`

Revue faite le 1er octobre 2026 sur le serveur de dev (http://localhost:4321) : HTML récupéré avec curl, calculs refaits en Node et en Python. Aucun fichier du projet n'a été modifié.

Scripts de vérification (dans le scratchpad) :
- `calc.mjs` : reproduit les calculs de la page.
- `cg-revue/3cl.py` et `cg-revue/cases.py` : calcul 3CL complet (apports gratuits, DH19, intermittence, rendements d'installation) pour la maison de référence de `research/coefficient-g-3cl.md`.

---

## 0. Synthèse

- Le code est juste : les calculs sont **exacts par rapport à la formule annoncée**, et les valeurs rendues au build (résultat initial, tableau, FAQ) sont identiques à celles du script client.
- Le problème est **le modèle**. On prend un G de dimensionnement 3CL (apports gratuits ignorés par construction), on le multiplie par des DJU base 18, sans intermittence, et on divise par le seul rendement du générateur. Cela donne :
  - 5,2 t (350 sacs) pour une maison de 100 m² de 1975-1988 ;
  - 10,3 t (687 sacs) pour 100 m² d'avant 1975.
- Ces valeurs dépassent :
  - le calcul 3CL officiel complet de la même maison, de 20 à 32 % ;
  - les consommations mesurées publiées, d'un facteur 1,5 à 2,5 : ADEME 2022-2023, Propellet/Viavoice, CEREN, CAE.
- C'est un **bloquant** : le chiffre phare de la page (FAQ, résultat par défaut, tableau) est 2 à 3 fois plus élevé que ce que publient l'ADEME et les concurrents. C'est aussi le premier chiffre que voit un prospect.

---

## 1. Justesse des calculs (vérification à la main)

Formules du code :
- besoin = G × S × h × DJU × 24 / 1000 × part ;
- kg = besoin / (4,6 × η) ;
- sacs = kg / 15 ;
- palettes = sacs / 65 ;
- budget = t × prix, arrondi à la dizaine.

DJU = 2 592,6 (Lille-Lesquin). η poêle = 0,87 ; η chaudière = 0,94.

| Cas | H (W/K) | Besoin (kWh) | kg | Sacs | Palettes | Budget (385 €/t) | Page |
|---|---|---|---|---|---|---|---|
| 100 m², 1975-1988, poêle, 100 % | 337,5 | 21 000 | 5 247 | 350 | 5,4 | 2 020 € | identique (résultat initial, FAQ, tableau ligne 100 m²) |
| 100 m², 1975-1988, chaudière | 337,5 | 21 000 | 4 857 | 324 | 5 | 1 870 € | identique (script) |
| 60 m², depuis 2013, poêle, 100 % | 97,5 | 6 067 | 1 516 | 101 | 1,6 | 580 € | identique (tableau 60 m² / Depuis 2013 = 101) |
| 150 m², avant 1975 rénovée, appoint 50 % | 731,3 | 22 750 | 5 685 | 379 | 5,8 | 2 190 € | identique (script) |
| 100 m², avant 1975 jamais isolée | 662,5 | 41 222 | 10 300 | 687 | 10,6 | 3 970 € | identique (tableau = 687) |

Tableau de la page (60 à 150 m², 6 classes) : les 30 cellules sont toutes identiques au recalcul. Exemples :
- 60 m² : 412 / 303 / 210 / 171 / 140 / 101 ;
- 150 m² : 1 030 / 758 / 525 / 428 / 350 / 253.

Consommation horaire, kg/h = kW / (4,6 × 0,87) :

| kW | kg/h | Autonomie d'un sac |
|---|---|---|
| 4 | 1 | 15 h |
| 5 | 1,2 | 12 h |
| 6 | 1,5 | 10 h |
| 7 | 1,7 | 8,6 h |
| 8 | 2 | 7,5 h |
| 9 | 2,2 | 6,7 h |
| 10 | 2,5 | 6 h |
| 12 | 3 | 5 h |

Les valeurs sont identiques à la page. Mini-calculateur, 8 kW × 10 h : 2 kg/h, 20 kg/j, 1,3 sac. Identique au texte rendu côté serveur.

**Conclusion du point 1 : aucune erreur arithmétique.** Le code reproduit fidèlement la méthode annoncée. Les problèmes sont dans la méthode (§2) et dans les hypothèses (§3).

---

## 2. Réalisme : constat bloquant et correction proposée

### 2.1 Les ordres de grandeur publiés

| Source | Donnée | Comparaison avec la page |
|---|---|---|
| **ADEME, « Situation du chauffage domestique au bois en 2022-2023 » (juin 2024), tableau 9, p. 60** ([PDF](http://fibois-idf.fr/sites/default/files/inline-files/2024.06%20Rapport%20%C3%A9tude%20chauffage%20domestique%20ADEME.pdf), [librairie ADEME](https://librairie.ademe.fr/energies/7443-situation-du-chauffage-domestique-au-bois-en-2022-2023.html)) | Consommation moyenne par ménage : **poêle 1,2 à 1,3 t**, **chaudière 2,2 à 2,8 t** (EnL 2020 : poêle 1,25-1,35 t, chaudière 2,9-3,6 t). Tous équipements à granulés : 1,2 t ± 0,2 t par maison (§3.5.3.3). L'étude ne retient « pas de consommation au-delà […] de 2,5 tonnes de granulés » (p. 21). | La page annonce 5,2 t pour un poêle « tout le chauffage » sur 100 m² de 1975-1988. C'est **4 fois la moyenne nationale des poêles** et **2 fois celle des chaudières**, qui chauffent pourtant toute la maison et l'eau chaude. |
| Même étude, enquête Propellet/Viavoice 2023 | Chaudière **3,5 t**, poêle **1,5 t** | idem |
| ADEME, guide « Se chauffer au bois » (2016), encadré silo | « il est prudent de prévoir un silo de 4 à 5 tonnes », soit « une consommation moyenne annuelle plus une réserve de sécurité » | La page dépasse ce silo, réserve comprise, pour une simple maison de 100 m² chauffée par poêle. |
| ADEME (cité dans `src/content/conseils/poele-a-granules-ou-poele-a-bois.md`, l. 81) | Deux ramonages par an en cas de « forte consommation (au-delà de […] 2,5 tonnes de granulés) » | Pour l'ADEME, 2,5 t est déjà une forte consommation. La page en affiche le double par défaut. |
| **CEREN pour l'ADEME, Base Carbone, documentation « Chauffage »** ([lien](https://prod-basecarbonesolo.ademe-dri.fr/documentation/UPLOAD_DOC_FR/chauffage.htm)) | Chauffage seul, maisons, énergie finale : fioul avant 1975 **187 kWh/m²**, fioul après 1975 **171 kWh/m²**, gaz avant 1975 201, gaz après 1975 166 | La page calcule **241 kWh/m²** d'énergie finale pour 1975-1988 et **474 kWh/m²** avant 1975. Les chiffres CEREN sont des moyennes nationales, et le Nord est plus froid. Mais même +30 % sur le CEREN (fioul après 1975 : environ 220) reste sous les 241 de la page, avec un rendement de chaudière fioul plus faible que celui du poêle. Avant 1975, l'écart est de **× 2 à × 2,5**. |
| ADEME Batizoom, SDES ([lien](https://batizoom.ademe.fr/indicateurs/consommation-surfacique-des-batiments-residentiels-par-usage)) | Résidences principales en 2024 : 134 kWhef/m² tous usages, dont 66 % pour le chauffage, soit environ 88 kWh/m² | Ordre de grandeur général, tous logements confondus. |
| **CAE, Focus n° 103 (janvier 2024)** ([PDF](https://cae-eco.fr/static/pdf/focus-103-dpe-230110.pdf)) | Données bancaires de 178 110 ménages. La consommation réelle des logements G dépasse celle des AB de **85 %**, contre **560 %** d'écart théorique selon la 3CL : « divisé par six ». En maison individuelle, l'écart AB → G n'est que de **+27 à +40 %**. | Plus le logement est mauvais, plus la méthode conventionnelle surestime la consommation réelle (« effet prebound »). La page l'amplifie : 687 sacs avant 1975, contre 168 depuis 2013, soit × 4,1. |
| Concurrents (non sourcés, donnés pour le contexte) | Effy : 2 à 3 t pour 100 m² bien isolés, « 3 t voire plus » pour une maison ancienne. Experts Chaleur Bois : environ 1,8 t (120 sacs) pour 100 m². | Un internaute qui compare verra que FK annonce 2 à 3 fois plus. |

### 2.2 Pourquoi la méthode surestime : quatre écarts avec la 3CL

`research/coefficient-g-3cl.md` (§7, point 4) le dit lui-même : le G 3CL comprend les infiltrations conventionnelles et **ignore les apports gratuits**. C'est un coefficient de déperdition, pas de besoin. Or la 3CL (annexe 1 de l'arrêté du 31/03/2021, fichier `annexe1.txt` du scratchpad) calcule la consommation ainsi :

1. **Besoin (§2 et §9.1.1)** : BVj = GV × (1 − Fj), puis Bch = Σ BVj × DH19j / 1000, sur les mois de chauffe uniquement. En zone H1a sous 400 m, ΣDH19 = 60 585 °C·h, contre DJU18 × 24 = 62 222 °C·h : à peu près équivalent.
2. **Apports gratuits (§6.1)** : Fj = (Xj − Xj^2,9) / (1 − Xj^2,9) en inertie moyenne, avec Xj = (Asj + Aij) / (GV × DHj).
   - Ai = [(3,18 + 0,34) × Sh + 90 × 132/168 × Nadeq] × Nrefj ;
   - As = 1000 × Sse × Ej.
3. **Intermittence (§8)** : INT = I0 / (1 + 0,1 × (G − 1)).
   - I0 = 0,84 pour une maison individuelle en chauffage divisé, régulation pièce par pièce, sans programmation. La 3CL précise : « Un poêle sera modélisé comme un radiateur/convecteur ».
   - Pour G = 1,35 : INT = 0,812.
4. **Rendements d'installation (§9.1.2 et §12)** : Cch = Bch × INT / (Rg × Re × Rd × Rr).
   - Poêle : Rg 0,87, Re 0,95 (« Autres équipements »), Rd 1, Rr 0,8 (« Poêle charbon / bois / fioul / GPL ou insert »).
   - Chaîne poêle : **0,661**, et non 0,87.

La page applique 1 (avec DJU18) mais pas 2 ni 3. Elle n'applique de 4 que Rg.

### 2.3 Calcul 3CL complet de la maison de référence

Hypothèses :
- maison de référence de `research/coefficient-g-3cl.md`, 100 m², vitrage = Sh/6, réparti sur les quatre orientations, Fe = 1 ;
- Sw de la 3CL selon la menuiserie de l'époque (0,52 / 0,47 / 0,44 / 0,38) ;
- inertie moyenne, Nadeq = 1,975 ;
- données H1a < 400 m (§18.2) et C1 H1a (§18.5).

| Classe (G) | Page : besoin, puis kg | 3CL : Bch (part des apports gratuits) | INT | **3CL complet (Re·Rr inclus)** | 3CL sans Re·Rr | Facteur 3CL / page |
|---|---|---|---|---|---|---|
| Avant 1975 (2,65) | 41 222 kWh, 10 300 kg | 34 698 (13,6 %) | 0,721 | **8 226 kg (548 sacs)** | 6 251 kg | **0,80** |
| Avant 1975 rénovée (1,95) | 30 333 kWh, 7 580 kg | 24 867 (15,8 %) | 0,767 | **6 272 kg (418 sacs)** | 4 767 kg | **0,83** |
| 1975-1988 (1,35) | 21 000 kWh, 5 247 kg | 15 657 (23,4 %) | 0,812 | **4 178 kg (279 sacs)** | 3 175 kg | **0,80** |
| 1989-2000 (1,10) | 17 092 kWh, 4 276 kg | 12 072 (27,5 %) | 0,832 | **3 306 kg (220 sacs)** | 2 512 kg | **0,77** |
| 2001-2012 (0,90) | 14 000 kWh, 3 498 kg | 9 446 (30,7 %) | 0,848 | **2 635 kg (176 sacs)** | 2 003 kg | **0,75** |
| Depuis 2013 (0,65) | 10 018 kWh, 2 527 kg | 5 910 (39,4 %) | 0,870 | **1 714 kg (114 sacs)** | 1 303 kg | **0,68** |

Les trois cas demandés :

| Cas | Page | 3CL complet | 3CL sans Re·Rr |
|---|---|---|---|
| 100 m², 1975-1988, 100 % | 5 247 kg, 350 sacs, 5,4 palettes, 2 020 € | **4 178 kg, 279 sacs, 4,3 palettes, 1 610 €** | 3 175 kg, 212 sacs, 1 220 € |
| 60 m², depuis 2013 | 1 516 kg, 101 sacs, 580 € | **1 003 kg, 67 sacs, 390 €** | 762 kg, 51 sacs, 290 € |
| 150 m², rénovée, 50 % | 5 685 kg, 379 sacs, 2 190 € | **4 732 kg, 315 sacs, 1 820 €** | 3 597 kg, 240 sacs, 1 380 € |

À noter :
- La 3CL elle-même surestime le réel pour les classes basses : écart divisé par 6 selon le CAE. Même corrigé, le cas « avant 1975 jamais isolée » reste très haut (8,2 t). Le G de cette classe est un majorant d'après `coefficient-g-3cl.md` §7 : +50 % par rapport à la puissance ADEME, maison isolée de tous côtés, Umur plafonné à 2,5.
- La part « appoint 25 % » de la page correspond exactement au coefficient 0,25 de la 3CL §9.3 : c'est sourcé, il faut le dire dans le texte.
- La 3CL §9.4 (poêle chauffant toute la maison, salle de bains électrique) affecte **0,9 × Bch** au poêle.

### 2.4 Correction recommandée (chiffrée et sourcée)

**R1, à faire : remplacer le modèle « G × V × DJU18 » par la chaîne 3CL complète dans `src/lib/thermique.ts`.** C'est aussi utile pour `comparateur-cout-chauffage.astro`, qui utilise la même formule (l. 16 et 226).

```
besoin (kWh) = G × V × DH19 / 1000 × (1 − F̄)        DH19 H1a < 400 m = 60 585 °C·h (3CL §18.2)
INT          = I0 / (1 + 0,1 × (G − 1))             I0 poêle = 0,84 ; chaudière, radiateurs à robinets thermostatiques = 0,88 (3CL §8)
consommation = besoin × part × INT / (Rg × Re × Rd × Rr)
```

- **F̄ par classe** : fraction annuelle des besoins couverts par les apports gratuits, 3CL §6.1. Elle se calcule une fois pour la maison de référence, dans un script de recherche du type `research/calculs/coefficient-g-3cl.py`, et se stocke dans `isolations` (`data/thermique.ts`) avec ses hypothèses (vitrage Sh/6, quatre orientations, inertie moyenne) :
  - avant 1975 : **0,136** ;
  - avant 1975 rénovée : **0,158** ;
  - 1975-1988 : **0,234** ;
  - 1989-2000 : **0,275** ;
  - 2001-2012 : **0,307** ;
  - depuis 2013 : **0,394**.
- F dépend peu de la surface : Ai et GV sont tous deux proportionnels à Sh, seul Nadeq varie. Une constante par classe suffit.
- **Rendements du poêle** : Rg 0,87 × Re 0,95 × Rd 1 × Rr 0,8 = 0,661 (3CL §12.1, §12.3, §13.1).
- **Rendements de la chaudière** :
  - Rg entre Rpint = 88 + 2 log Pn = 0,906 et Rpn = 91 + 2 log Pn = 0,936 (chaudière à granulés après 2019, Pn ≤ 20 kW, 3CL tableau p. 89) ;
  - Re 0,95 ; Rd 0,92 (réseau individuel haute température isolé) ; Rr 0,95 (robinets thermostatiques) ;
  - chaîne d'environ 0,75 à 0,78.
- Effet : **−20 % sur le cas par défaut (5,2 → 4,2 t ; 350 → 279 sacs ; 2 020 → 1 610 €)**, et **−32 % sur une maison récente**.
- Tous les coefficients viennent du même texte que les G : aucun chiffre inventé.

**R2, conseillé : afficher le résultat comme une « estimation conventionnelle (méthode du DPE) », avec une phrase sourcée sur l'écart au réel.** Exemple : « En pratique, l'ADEME mesure en moyenne 1,2 à 1,3 t par an pour un poêle et 2,2 à 2,8 t pour une chaudière à granulés (enquête 2022-2023), car on chauffe rarement toutes les pièces à 19 °C. » Sources : ADEME 2024, tableau 9 ; CAE Focus 103.

**R3, option à trancher : afficher une fourchette au lieu d'un chiffre unique.**
- Borne haute : 3CL complète.
- Borne basse : 3CL sans le Rr de 0,8. Ce Rr modélise la surchauffe de la pièce du poêle. Un poêle à granulés à thermostat d'ambiance la limite, mais **aucune source ne le chiffre** : à présenter comme une hypothèse, ou à ne pas retenir.
- Cas par défaut : 3,2 à 4,2 t (210 à 280 sacs).

**R4, bloquant tant que R1 n'est pas fait :**
- signaler en clair que la ligne « Avant 1975, jamais isolée » est un majorant ;
- ou proposer la variante mitoyenne (G 2,2 à 2,3, `coefficient-g-3cl.md` §6.1). Une part importante des maisons anciennes du Nord est mitoyenne, mais aucune proportion n'est sourcée.

Variante non retenue : un simple coefficient global d'environ 0,62 (= (1 − F) × INT pour 1975-1988) appliqué au calcul actuel. C'est plus simple, mais moins honnête, car il varie de 0,52 à 0,63 selon la classe.

---

## 3. Constats classés par gravité

### Bloquant

**B1. Consommation surestimée de × 1,25 à × 2,5 (méthode).**
- Où : `src/pages/outils/consommation-granules.astro:13-15` (kgParAn), `:238-239` (script), `src/lib/thermique.ts:13` (besoinAnnuelKwh), `src/data/thermique.ts:109-116` (G).
- Preuve : §2 ci-dessus.
- Correction : R1, plus R2 et R4.

**B2. La FAQ et les données structurées publient « 5,2 tonnes / 350 sacs » pour 100 m² de 1975-1988.**
- Où : `consommation-granules.astro:26`, reprise dans le JSON-LD FAQPage.
- Problème : c'est l'extrait que Google peut afficher pour « combien de sacs de granulés par an ». La valeur est 4 fois la moyenne ADEME des poêles et dépasse le silo de 4 à 5 t (réserve comprise) que l'ADEME conseille pour une chaudière.
- Correction : elle est automatique après R1 (environ 4,2 t / 280 sacs). Il faut aussi :
  - remplacer « chauffe seul » par « chauffe toute la maison (cas rare : un poêle chauffe surtout la pièce de vie) » ;
  - ajouter la moyenne mesurée par l'ADEME.

### Important

**I1. Rendement chaudière de 94 % = Rpn à pleine charge, et non un rendement annuel.**
- Où : `src/data/thermique.ts:131-132`, `consommation-granules.astro:145`.
- Problème : le texte dit « le rendement retenu par la méthode officielle du DPE ». C'est faux. La 3CL applique Rpint et Qp0 selon le taux de charge (§13.2.1), puis Re × Rd × Rr. Résultat : la page affiche une chaudière qui consomme **moins** qu'un poêle (4,9 t contre 5,2 t), alors que la 3CL donne environ 3,7 t pour la chaudière contre 4,2 t pour le poêle. L'écart réel tient surtout à l'intermittence et aux rendements d'installation.
- Correction : chaîne chaudière d'environ 0,75 à 0,78 (voir R1). Corriger aussi la phrase de la l. 145.

**I2. « Le vrac […] revient en général moins cher à la tonne » est contredit par les sources du projet.**
- Où : `consommation-granules.astro:34`.
- Preuve : Propellet T2 2026, vrac **388 €/t** contre sac **385 €/t**. SDES 2026-06 : 387,68 contre 385,23 €/t (`data/thermique.ts:126-127`, `research/donnees-outils.md` §4c).
- Correction : « Aux prix moyens actuels, vrac et sacs coûtent à peu près le même prix à la tonne (388 € et 385 €, Propellet, 2e trimestre 2026). » Ou supprimer la comparaison.

**I3. Le mode chaudière garde les unités et le prix des sacs.**
- Où : `consommation-granules.astro:87-96`, `:102`, `:111`, `:241-244`.
- Problème : une chaudière se livre en vrac. Afficher « 324 sacs » et « 5 palettes » n'a pas de sens, et le budget utilise le prix en sacs (385) au lieu du vrac (388, `granules.prixVrac`).
- Correction : en mode chaudière, mettre les tonnes en tête (« 4,9 t de vrac »), masquer sacs et palettes (ou les mettre en équivalent), et basculer le prix par défaut et le hint sur `prixVrac`, sauf si l'utilisateur a saisi un prix.

**I4. La « consommation par heure » ne répond pas à la requête « consommation poêle à granulés par jour ».**
- Où : `consommation-granules.astro:183-217`.
- Problème : le mini-calculateur ne donne que le maximum à pleine puissance (8 kW × 10 h = 20 kg/j). Ce n'est ni réaliste ni sourcé comme usage typique, et l'utilisateur doit inventer « heures par jour ».
- Correction : ajouter une consommation moyenne par jour et par mois, tirée du résultat annuel et de la répartition mensuelle des degrés-heures 3CL (DH19 H1a par mois, `research/donnees-outils.md` §3b) ou des DJU mensuels Météo-France (§3d).
  - Exemple après R1, cas par défaut : janvier = 19,3 % de ΣDH19, soit 4 178 × 0,193 / 31 ≈ **26 kg/jour (1,7 sac)** ; octobre ≈ 8 kg/jour.
  - Garder le tableau à pleine puissance comme « maximum ».

**I5. Le texte de méthode est inexact par rapport au calcul.**
- Où : `consommation-granules.astro:137-146` et FAQ `:38`.
- Problème : la FAQ dit « Le calcul suppose […] une température de 19 °C ». Or le calcul utilise des DJU base 18 et ignore apports gratuits et intermittence.
- Correction : décrire la chaîne 3CL après R1 (consigne 19 °C, apports gratuits, réduits de nuit), et citer la 3CL §6, §8 et §9.

### Mineur

**M1. « achetez votre stock avant l'hiver, quand les prix sont souvent plus doux »** (`:151`) : affirmation non sourcée. À sourcer, par exemple avec l'historique trimestriel de l'indice Propellet, ou à supprimer. Ajouter en revanche le conseil sourcé de l'ADEME, déjà cité dans le guide (`bien-choisir-ses-granules-de-bois.md:16`) : ne pas acheter pour plus d'une année.

**M2. « certifiés (ENplus A1, DINplus ou NF) »** (`:34`) : c'est sourcé dans le guide (ADEME), mais pas sur cette page. Ajouter un lien vers `/conseils/bien-choisir-ses-granules-de-bois/` dans la réponse, ou la source ADEME dans `sources`. « Le vrac […] est réservé aux chaudières » (`:34`) est un peu absolu : « alimente surtout les chaudières à silo », comme dans le guide (l. 82).

**M3. Champs vides ou invalides** (`:237`, `:260`) : si la surface est vide, nulle ou négative, `update()` sort sans rien changer. L'ancien résultat reste affiché, sans aucun message.
- Correction : afficher « — » et un message dans la zone `aria-live`, par exemple « Indiquez une surface ».
- Les limites `max=600` et `max=6` ne sont pas appliquées : 100 000 m² est calculé. Borner ou signaler.

**M4. Valeur de repli `?? 1`** (`:238`) : un G inventé (1) si l'isolation n'est pas trouvée. C'est inatteignable avec des boutons radio, mais c'est un chiffre non sourcé. Préférer `return`.

**M5. Second formulaire** (`:254-268`) : `update()` n'est pas appelé au chargement. Si le navigateur restaure des valeurs (retour arrière), le texte affiché correspond toujours à 8 kW / 10 h. Appeler `update()` comme pour le premier formulaire.

**M6. `aria-live="polite"` sur tout le panneau de résultats** (`:99`) : le lecteur d'écran relit tout (titre, 4 cartes, détail, lien) à chaque frappe. Mettre `aria-live` sur une seule phrase de synthèse, par exemple « Environ 279 sacs, soit 4,2 tonnes et 1 610 € par an » (en sr-only), et retirer l'attribut du conteneur.

**M7. Lien « Demander une étude »** (`:246-247`) : il est compatible avec `ContactForm.astro` :
- `projet` vaut `granules` ou `chaudiere`, deux valeurs qui existent (l. 7-14) ;
- `surface` est lue si ≥ 20, arrondie à la dizaine et plafonnée à 300 ;
- `note` va dans `#message`.

Améliorations possibles :
- ajouter l'isolation et la part de chauffage dans `note` (« 100 m², 1975-1988, tout le chauffage, poêle : environ 4,2 t/an ») ;
- passer `actuel=Granulés` si l'appareil existe déjà. Ce n'est pas déductible de l'outil : à ne faire que si on ajoute une question.

Le `href` du rendu serveur (`/contact/?projet=granules`) est correct sans JavaScript.

**M8. Hauteur sous plafond** : la page fixe 2,5 m pour le tableau et la FAQ. C'est dit l. 160, c'est correct. Mais G a été calculé pour 2,5 m : multiplier V par une hauteur de 3 m augmente aussi le plafond et le plancher, ce qui est faux physiquement. L'écart est faible et acceptable ; on peut le mentionner dans le hint.

**M9. Droits Météo-France** : `donnees-outils.md` (l. 11-15) signale que la rediffusion des fiches est interdite sans accord. La page affiche « 2 593 degrés-jours ». Une valeur unique utilisée dans un calcul est sans doute acceptable. Si l'on adopte R1, la DH19 de la 3CL (arrêté, texte public) supprime la question.

**M10. Une seule station (Lille-Lesquin)** : c'est la plus froide des trois stations sourcées (Dunkerque 2 382 et Boulogne 2 545 DJU), donc l'hypothèse est prudente. Cohérent : le texte dit « hiver moyen à Lille-Lesquin ».

### Suggestions

**S1. SEO.**
- Title, 61 caractères : « Consommation de granulés : sacs par an et budget | FK Énergie ». Correct.
- H1 « Combien de granulés allez-vous consommer ? » : il ne contient ni « poêle à granulés » ni « sacs ». Proposer : « Consommation d'un poêle à granulés : combien de sacs par an ? ».
- Ajouter des H2 qui reprennent les requêtes : « Combien de sacs de granulés pour une maison de 100 m² ? », « Consommation d'un poêle à granulés par jour » (voir I4), « Combien de palettes stocker pour l'hiver ? ».
- Le tableau surface × isolation est un vrai atout indexable : le garder, avec une légende chiffrée en phrases, par exemple « une maison de 100 m² des années 1990 : environ 220 sacs ».

**S2. Ce que les concurrents ont et que la page n'a pas** (pages consultées sans copie : [Effy](https://www.effy.fr/travaux-energetique/chauffage/poele/consommation-granules), [Experts Chaleur Bois](https://www.expertschaleurbois.fr/poele-a-granules/consommation/), [Proxi TotalEnergies](https://proxi.totalenergies.fr/particuliers/actualites/quelle-consommation-de-pellets-pour-une-maison-de-100-m2)) :
- une consommation par jour et par mois en usage courant ;
- le prix au sac (5,78 € d'après Propellet) et à la palette (environ 375 €), en plus du prix à la tonne ;
- une section « Comment réduire sa consommation » (entretien, granulés secs, programmation : les sources ADEME du guide existent déjà) ;
- un exemple pour 100 m².

Leurs chiffres (1,8 à 3 t pour 100 m²) ne sont pas sourcés. FK peut se différencier avec la méthode 3CL et la comparaison à l'enquête ADEME.

**S3. Maillage.**
- L'outil est lié depuis `/poele-a-granules/` et `/chaudieres/` (via `RelatedTools`) et depuis `/outils/`. Il ne l'est pas depuis les guides `bien-choisir-ses-granules-de-bois` et `poele-a-granules-ou-poele-a-bois`, qui parlent de stockage, de sacs et de 2,5 t : ajouter un lien contextuel.
- Ajouter un lien depuis cette page vers `/outils/calcul-puissance-poele/` dans le texte de méthode (même G).

**S4. Mobile.**
- Sous `lg`, le résultat s'affiche après 5 blocs de saisie : l'utilisateur ne voit pas l'effet de ses choix. Mettre un bandeau compact (« ≈ 279 sacs/an ») collé en bas d'écran, ou le résultat avant le prix.
- Le tableau à 7 colonnes défile horizontalement (`overflow-x-auto`, c'est correct) : rendre la 1re colonne sticky.

**S5. Saisie du prix** : proposer « € par sac » à côté de « € par tonne ». Les particuliers achètent au sac.

**S6. Sources** : ajouter à `sources` de la page :
- l'enquête ADEME 2022-2023 (si R2) ;
- la 3CL §6, §8 et §12 (déjà couverte par `methode3CL`, à compléter dans le libellé : « apports gratuits, intermittence, rendements ») ;
- Flamme Verte, pour le 87 %.

---

## 4. Robustesse : tests des cas limites (relecture du script client)

| Entrée | Comportement | Verdict |
|---|---|---|
| Surface vide, 0 ou négative | `return`, l'ancien résultat reste | M3 |
| Hauteur vide | `return` | M3 |
| Prix vide, 0 ou négatif | budget « — », le reste est calculé | correct |
| Poêle → chaudière | recalcul avec η 0,94, unités de sacs conservées | I1, I3 |
| Part 25 % | ÷ 4, conforme à la 3CL §9.3 (0,25) | correct |
| Second formulaire : kW ou heures vides ou à 0 | `return`, texte figé | mineur |
| Singulier et pluriel | « 1,3 sac » / « 2 sacs » | correct |
| JavaScript désactivé | valeurs par défaut rendues côté serveur, lien de contact valide | correct |

---

## 5. Verdict global

**À corriger avant mise en ligne.** Le code est propre, le rendu serveur et le script client concordent, l'accessibilité de base est correcte (fieldset/legend, libellés, aria-live) et le lien vers le formulaire de contact fonctionne.

Mais le chiffre central est surestimé. La page annonce 350 sacs pour 100 m² de 1975-1988 et 687 sacs avant 1975. Le modèle omet les apports gratuits et l'intermittence que la méthode 3CL, dont il tire ses G, applique pourtant. Les chiffres sont aussi 2 à 4 fois au-dessus des consommations mesurées par l'ADEME.

Correction minimale :
1. R1 : chaîne 3CL complète, environ −20 % en défaut, −32 % en récent ;
2. R2 : mention sourcée de l'écart au réel ;
3. I1 : rendement chaudière ;
4. I2 : phrase sur le vrac ;
5. I3 : mode chaudière en vrac.

Ensuite, la consommation par jour (I4) et le H1 (S1) donneront à la page l'avantage SEO visé.

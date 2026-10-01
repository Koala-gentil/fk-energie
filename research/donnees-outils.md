# Données sourcées pour les calculateurs de chauffage FK Énergie

Recherche faite le 1er octobre 2026. Chaque valeur a une source vérifiable. Les documents PDF ont été téléchargés et lus (pdftotext) ; les citations sont extraites du texte réel.

**Niveaux de confiance**
- **A** : texte officiel ou norme lu dans la source primaire
- **B** : source professionnelle reconnue (fabricant, centre technique, interprofession) lue dans la source primaire
- **C** : source secondaire, ou valeur que nous avons calculée à partir de valeurs sourcées (le calcul est indiqué)
- **✗** : aucune source fiable trouvée

> **Droits de diffusion, à lire avant publication**
> - Les fiches climatologiques Météo-France portent la mention « La vente, redistribution ou rediffusion des informations reçues […] est strictement interdite sans l'accord de METEO-FRANCE ».
> - Le bulletin du CEEB (prix du bois bûche) indique « Diffusion interdite sans l'autorisation expresse du CEEB ».
>
> Utiliser ces chiffres dans un calcul est sans doute acceptable. Les afficher tels quels sur le site, en tableau, demanderait une autorisation. À trancher.

---

## 1. Température extérieure de base et température intérieure

### 1a. Valeur réglementaire librement consultable : méthode 3CL-DPE 2021 (arrêté du 31 mars 2021, annexe 1)

| Donnée | Valeur | Source |
|---|---|---|
| Zone climatique du Nord (59) | **H1a** | Annexe 1, §18.1, ligne « 59 Nord H1a » |
| Zone climatique du Pas-de-Calais (62) | **H1a** | ligne « 62 Pas-de-Calais H1a » |
| Tbase, zones H1a/H1b/H1c, altitude < 400 m | **−9,5 °C** | tableau « Température extérieure de base - Tbase (°C) » |
| Tbase H1, altitude de 400 à 800 m | **−11,5 °C** | idem |
| Tbase H1, altitude ≥ 800 m | **−13,5 °C** | idem |

- URL : https://rt-re-batiment.developpement-durable.gouv.fr/IMG/pdf/consolide_annexe_1_arrete_du_31_03_2021_relatif_aux_methodes_et_procedures_applicables.pdf
- Date : version consolidée « Dernière mise à jour - Octobre 2021 ». Des arrêtés modificatifs plus récents existent peut-être ; ce tableau n'a pas été revérifié dans une version postérieure.
- Citation : « H1a, H1b, H1c -9,5 -11,5 -13,5 »
- **Confiance : A** pour la méthode DPE.
- Correction d'altitude (3CL) : seulement trois paliers (< 400 m, de 400 à 800 m, ≥ 800 m). À notre connaissance, aucune commune du 59 ou du 62 ne dépasse 400 m, ce qui donnerait −9,5 °C partout. Ce point d'altitude n'est pas sourcé ici.

### 1b. NF EN 12831 et annexe nationale NF P 52-612/CN (méthode de dimensionnement « métier »)

- La norme est payante : le tableau D.1a/D.1b n'a pas pu être lu dans la source primaire.
- La page INEX confirme seulement la méthode. Température de base « donnée par le Tableau D.1a) de la NF P 52-612/CN », puis corrigée selon l'altitude via le tableau D.1b.
  - URL : https://www.inex.fr/ingenierie-thermique-et-environnementale/expertise-energetique/etude-reglementaire-rt-2012/zones-climatiques-et-temperature-exterieure-de-base/
- Valeur −9 °C pour le 59 et le 62 au niveau de la mer : elle n'apparaît que dans des sources secondaires (résumés de recherche, blogs).
- Tableau des « 9 zones » (A à I) reproduit par H. Silve (site pédagogique) : zone F donne −9 °C de 0 à 200 m et −10 °C de 201 à 400 m.
  - L'attribution du Nord-Pas-de-Calais à une zone se fait sur une carte image, non lisible : **non vérifiée**.
  - URL : https://apalis.fr/herve.silve/deperditions/temp_base.htm
- **Confiance : C.** Recommandation : utiliser **−9 °C** (pratique métier, NF EN 12831) si l'on affiche « méthode NF EN 12831 ». Sinon, utiliser **−9,5 °C** (3CL, texte officiel gratuit) et citer l'arrêté. L'écart est faible (0,5 K, environ 2 % sur la puissance).

### 1c. Température intérieure de référence : 19 °C

- La méthode 3CL calcule la consommation « pour une consigne de température à 19°C » (annexe 1, §9.1.1, même URL que 1a). **A**
- Code de l'énergie, art. R241-26 : cité dans la réponse ministérielle publiée au JO Sénat du 26/01/2023. Citation : « limiter la température de chauffage à 19° C en moyenne ».
  - URL : https://www.senat.fr/questions/base/2022/qSEQ220701514.html
  - **Confiance : A** (texte de l'article lu de seconde main, via le JO Sénat)

---

## 2. Coefficient G (W/m³·K) selon l'époque

### 2a. Ce qui existe officiellement : l'arrêté du 10 avril 1974

Il définit G et fixe des **valeurs maximales** pour les logements neufs.

- URL : https://www.legifrance.gouv.fr/loda/id/JORFTEXT000000853955/
- Définition : « déperditions thermiques de ce logement pour un degré d'écart […] divisées par son volume habitable »
- Zonage : « Nord : Tous cantons : B » et « Pas-de-Calais : Tous cantons : B »
- Valeurs G max, zone B, en W/m³·°C :

| Classe de logement | 1re phase (1/5/1974) | 2e phase (1/7/1975) |
|---|---|---|
| I | 2,65 | 1,75 |
| II | 2,50 | 1,60 |
| III | 2,30 | 1,45 |
| IV | 2,05 | 1,35 |
| V | 1,85 | 1,20 |
| VI | 1,65 | 1,05 |
| VII | 1,45 | 0,95 |

- Les classes dépendent du caractère individuel ou collectif, du rapport surfaces horizontales / surface habitable et du volume. Le tableau détaillé des classes n'est pas reproduit sur Légifrance (« Tableau non reproduit »).
- **Confiance : A** pour ces maxima réglementaires. Ce n'est pas un barème « par époque » : ce sont des plafonds pour les constructions de 1974-1975 et après.

### 2b. Barème « par époque » (avant 1974, années 1980, RT 2005, RT 2012, etc.)

- **✗ Aucune source officielle, normative ou fabricant vérifiable trouvée.**
- Les valeurs qui circulent ont été trouvées uniquement sur des sites commerciaux ou personnels, sans référence normative :
  - « non isolé 1,6 à 1,8 », « RT 2012 0,35-0,40 » (abcclim.net, site d'un technicien) ;
  - « Ancien très mal isolé 1,79 / RT 2005 élec 0,94 » (infoenergie.eu, éditeur non identifié).
- Ces valeurs se contredisent entre sites. **Ne pas les utiliser.**
- Alternatives propres :
  - (1) Calculer un GV à partir des **U par défaut selon la période de construction** de la méthode 3CL (annexe 1, §3.2 à 3.4, tables de Umur, Upb, Uph et Uw par année de construction ; même URL qu'en 1a). Plus long, mais entièrement sourcé.
  - (2) Utiliser les maxima de 1974 (zone B) comme borne pour l'après-1975, en le disant explicitement.

---

## 3. Degrés-jours unifiés (DJU) et calcul du besoin annuel

### 3a. DJU annuels, normales Météo-France 1991-2020 (fiches climatologiques éditées le 06/06/2025)

| Station | Indicatif | Altitude | DJU annuel | URL |
|---|---|---|---|---|
| Lille-Lesquin | 59343001 | 47 m | **2 592,6** | https://donneespubliques.meteofrance.fr/FichesClim/FICHECLIM_59343001.pdf |
| Boulogne-sur-Mer | 62160001 | 73 m | **2 545,2** | https://donneespubliques.meteofrance.fr/FichesClim/FICHECLIM_62160001.pdf |
| Dunkerque | 59183001 | 11 m | **2 382,3** | https://donneespubliques.meteofrance.fr/FichesClim/FICHECLIM_59183001.pdf |

- Citation (fiche de Lille) : « Degrés Jours Unifiés (moyenne en °C) » … « 2592.6 »
- Base 18 °C. La fiche ne précise pas la base, mais la définition est donnée par le COSTIC : « calculés pour la température de base de 18 °C ».
  - URL : https://www.costic.com/sites/default/files/media/document/2024-06/Plaquette-degres-jours-unifies_0.pdf
  - Le COSTIC explique que les apports gratuits ajoutent 2 à 3 °C, d'où une ambiance courante de 20 à 21 °C.
- **Confiance : A** pour les valeurs. Base 18 : **B**.

### 3b. Valeur conventionnelle de zone (DPE) pour H1a, altitude ≤ 400 m

- Annexe 3CL, tableau « DH19 (°Ch) » ; somme des mois de chauffe : **60 585,1 °C·h**, soit **≈ 2 524 °C·j base 19** (calcul C : somme des mois, puis division par 24).
- Mois retenus par le DPE (DH19, °C·h) :

| Jan | Fév | Mar | Avr | Mai | Sep | Oct | Nov | Déc |
|---|---|---|---|---|---|---|---|---|
| 11 712,4 | 9 966,8 | 7 922,7 | 5 877,4 | 2 762,0 | 2 264,1 | 3 645,4 | 6 861,0 | 9 573,3 |

- Juin, juillet et août : « - ».
- **Confiance : A**

### 3c. Formule du besoin annuel

- **Formule officielle (3CL, §9.1.1)** : Bch_j = BV_j × DH_j / 1000 − (pertes récupérées)/1000, en kWh PCI, avec BV en W/K et DH en °C·h.
  - Citation : « BVj : besoin de chauffage d'un logement par kelvin sur le mois j (W/K) »
  - **Confiance : A**
- **Forme simplifiée « degrés-jours »** (convention métier) : besoin (kWh/an) = G × V × DJU18 × 24 / 1000, puis consommation = besoin / rendement global.
  - C'est la transposition directe de la formule 3CL : DH = DJU × 24, et GV × V = BV.
  - Le choix de la base 18 tient compte des apports gratuits, d'après le COSTIC.
  - **Confiance : B/C**. Aucun texte officiel trouvé qui écrive littéralement « G×V×DJU×24 ».

### 3d. (Point 11) DJU mensuels de Lille-Lesquin (normales 1991-2020) et répartition de la consommation

Source : fiche Météo-France 59343001 (URL en 3a). Les parts sont un calcul C : DJU du mois / 2 592,6.

| Mois | DJU | Part |
|---|---|---|
| Janv. | 430 | 16,6 % |
| Févr. | 375,6 | 14,5 % |
| Mars | 325,7 | 12,6 % |
| Avril | 226,1 | 8,7 % |
| Mai | 136,9 | 5,3 % |
| Juin | 60,5 | 2,3 % |
| Juil. | 23,2 | 0,9 % |
| Août | 22 | 0,8 % |
| Sept. | 77,3 | 3,0 % |
| Oct. | 189,3 | 7,3 % |
| Nov. | 312,3 | 12,0 % |
| Déc. | 413,7 | 16,0 % |
| **Année** | **2 592,6** | 100 % |

Boulogne-sur-Mer et Dunkerque ont aussi leurs DJU mensuels dans leurs fiches respectives :

| Station | Janv. | Févr. | Mars | Avril | Mai | Juin | Juil. | Août | Sept. | Oct. | Nov. | Déc. |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Boulogne | 395,1 | 357,5 | 329,4 | 246,1 | 167,8 | 91,9 | 41,4 | 28 | 72,1 | 168,3 | 276,2 | 371,4 |
| Dunkerque | 388 | 346,2 | 317,8 | 232,6 | 149 | 68,1 | 20,6 | 13,3 | 56,1 | 156,1 | 269,6 | 364,9 |

---

## 4. Granulés

### 4a. PCI minimal

- **ENplus A1, A2 et B** : PCI « as received » **≥ 4,6 kWh/kg**, soit **≥ 16,5 MJ/kg**. Humidité ≤ 10,0 %. Cendres A1 ≤ 0,70 %.
  - Source : ENplus® ST 1001:2022 (en vigueur le 01/01/2023), tableau 4.
  - URL : https://enplus-pellets.eu/wp-content/uploads/Documents/ENplus-ST-1001-ENplus-wood-pellets-Requirements-for-companies-5.pdf
  - Citation : « Net calorific value (as received) ≥ 4,6 (h) » et « (h) Equal ≥ 16,5 MJ/kg as received. »
  - **Confiance : A**
- **Convention de l'indice Propellet** : 4 600 kWh/t. Citation : « exprimés pour un PCI (Pouvoir Calorifique Inférieur) de 4600 kWh/t ». **A**
- **Convention de l'arrêté DPE** : « Granulés, briquettes » = 4 600 kWh PCI par tonne (voir section 10). **A**
- **ADEME** (guide « Se chauffer au bois », 2016) : « d'au moins 4 600 kWh par tonne pour une humidité inférieure à 10 % ». **A**

### 4b. Sac et palette

- **Sac de 15 kg.**
  - Propellet : « 5,78 € le sac de 15 kg ».
  - ADEME 2016 : « en grands sacs de 500, 750 ou 1 000 kg, ou en sacs de 15 kg ».
  - URL ADEME : https://www.cancer-environnement.fr/app/uploads/2023/03/ADEME-2016_Chauffage_au_bois.pdf (guide ADEME hébergé par un tiers). **A/B**
- **Palette : environ 65 sacs, soit environ 975 kg** (le poids est un calcul). Propellet : « Palette de granulés (environ 65 sacs) ». **B**. Des revendeurs parlent aussi de 66 ou 70 sacs ; il n'existe pas de norme.

### 4c. Prix actuels

**Indice Propellet du 2e trimestre 2026** (dernier publié au 01/10/2026). Enquête du CEEB, prix TTC.

- URL : https://www.propellet.fr/le-granule-de-bois/le-prix-du-granule/
- Vrac : **388 €/t livrée**. Sac : **385 €/t**, soit **5,78 €/sac de 15 kg**. Palette d'environ 65 sacs : environ **375 €**.
- En énergie : **8,43 c€/kWh** en vrac, **8,37 c€/kWh** en sacs. Citation : « 8,37 c€/kWh en sacs et 8,43 c€/kWh en vrac »
- **Confiance : A/B**

**SDES, conjoncture mensuelle de l'énergie** (millésime 2026-09, diffusé le 11/09/2026), série « Prix ménages Bois », dernière période 2026-06 :

| Série | Valeur |
|---|---|
| Granulés vrac | **387,68 €/t TTC**, soit **8,4278 €/100 kWh PCI** |
| Granulés sacs | **385,23 €/t TTC**, soit **8,3746 €/100 kWh PCI** |

- URL : https://www.statistiques.developpement-durable.gouv.fr/catalogue?page=datafile&datafileRid=0bf930dc-bfac-4e6f-a063-ec1774c6d029
- CSV : https://data.statistiques.developpement-durable.gouv.fr/dido/api/v1/datafiles/0bf930dc-bfac-4e6f-a063-ec1774c6d029/csv?millesime=2026-09&withColumnName=true
- Libellé de colonne : « Prix au détail de 100 kWh PCI de bois en vrac »
- **Confiance : A**

**CEEB, prix et indices nationaux du 2e trimestre 2026** (parution le 26/08/2026), distributeurs :

- Granulés vrac : 387,7 € TTC/t, « par 5 tonnes livrées à 50 km ».
- Granulés en sacs : 385,2 € TTC/t, « par palette complète départ distributeur ».
- URL : https://observatoire.franceboisforet.com/wp-content/uploads/2014/06/CEEB_Site-web_2026_T2_sciages-et-bois-energie_web.pdf
- **Confiance : A** (diffusion soumise à autorisation du CEEB)

---

## 5. Prix des énergies

### 5a. Source homogène : SDES, conjoncture mensuelle (successeur de la base Pégase)

- Jeu de données « Conjoncture mensuelle de l'énergie », millésime 2026-09, diffusé le 11/09/2026.
- Fichiers « 1.1 Prix ménages Pétrole », « 1.2 Électricité », « 1.3 Gaz » et « 1.4 Bois ».
- API : https://data.statistiques.developpement-durable.gouv.fr/dido/api/v1/datafiles/{rid}/csv?millesime=2026-09
  - Pétrole : rid daf4715a-0795-4098-bdb1-d90b6e6a568d
  - Électricité : cd28227c-bc1e-401b-8d42-3073497c2973
  - Gaz : 9bb3b4e5-91e7-4ee5-95d9-aef38471ee75
  - Bois : 0bf930dc-bfac-4e6f-a063-ec1774c6d029

| Énergie | Dernière valeur | Période | Unité | Remarque |
|---|---|---|---|---|
| Fioul domestique (tarif C1) | **16,9971** | août 2026 | € TTC / 100 kWh PCI | 168,475 € TTC / 100 L ; PCI implicite 9,91 kWh/L (calcul C). Le libellé SDES dit « 10 kWh », coquille évidente. |
| Propane | **18,1846** | juillet 2026 | € TTC / 100 kWh PCI | 2 323,99 €/t TTC ; « Prix au détail de 100 kWh PCI de propane » |
| Granulés vrac | **8,4278** | 2e trim. 2026 | € TTC / 100 kWh PCI | voir 4c |
| Granulés sacs | **8,3746** | 2e trim. 2026 | € TTC / 100 kWh PCI | voir 4c |
| Électricité, toutes tranches | **24,8119** | 2e sem. 2025 | c€ TTC/kWh, abonnement inclus | Prix moyen semestriel (bandes Eurostat), pas le prix marginal. Cohérent avec 254,6 €/MWh en 2025 publié par le SDES. |
| Gaz naturel, toutes tranches | **15,0082** | 2e sem. 2025 | c€ TTC/kWh **PCS**, abonnement inclus | Semestriel. Cohérent avec 141,4 €/MWh PCS en 2025 (SDES). |
| Bois bûche | **✗** | — | — | Absent du SDES. Voir 5d. |

- **Confiance : A.** Les séries électricité et gaz du SDES s'arrêtent au 2e semestre 2025 : pour l'automne 2026, utiliser les tarifs CRE ci-dessous.

### 5b. Électricité : Tarif Bleu (TRVE), option Base, au 1er août 2026

- Grille EDF « Tarif Bleu » applicable au 1er août 2026 : https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/Grille_prix_Tarif_Bleu.pdf

| Puissance (option Base) | Abonnement | Prix du kWh |
|---|---|---|
| 3 kVA | 12,13 €/mois TTC | **20,01 c€ TTC/kWh** |
| 6 kVA | 15,86 €/mois TTC | **20,01 c€ TTC/kWh** |
| 9 à 36 kVA (en extinction) | — | 19,85 c€ TTC/kWh |

- Heures creuses : HP 21,42 c€, HC 15,89 c€.
- Accise de 3,062 c€/kWh HTVA.
- Tarif proposé par la CRE, délibération n° 2026-147 du 15/07/2026 (+2,5 % TTC en moyenne) :
  - https://www.cre.fr/fileadmin/Documents/Deliberations/2026/260715_2026-147_TRVE.pdf
  - Citation du communiqué CRE du 16/07/2026 : « évolution du niveau moyen des TRVE de + 2,5 % TTC au 1er août 2026 »
- **Confiance : A**

### 5c. Gaz : prix repère de vente (PRVG) CRE au 1er octobre 2026, zone GRDF

- Profil **chauffage** : abonnement **360,79 € TTC/an**. Part variable moyenne **0,14557 € TTC/kWh**, fourchette de 0,13594 à 0,16436 selon la zone.
- PRVG moyen : 182,88 €/MWh TTC (+6,3 %).
- URL : https://www.cre.fr/consommateurs/prix-reperes-et-references/prix-repere-de-vente-de-gaz-naturel-a-destination-des-clients-residentiels.html
- Actualité : https://www.cre.fr/actualites/toute-lactualite/le-prix-repere-de-vente-de-gaz-augmente-de-63-ttc-au-1er-octobre-2026.html
- Citation : « 182,88 €/MWh TTC contre 172,05 €/MWh TTC au 1er septembre »
- **Unité :** le kWh facturé est un kWh **PCS** (l'arrêté DPE dit « kWh PCS : diviser par 1,11 »). En kWh PCI : 14,557 × 1,11 ≈ **16,16 c€/kWh PCI**, hors abonnement (calcul C).
- **Confiance : A** (prix) ; **C** pour la conversion en PCI.

### 5d. Fioul domestique : relevé hebdomadaire DGEC

Note DGEC « Cours, prix et marges des produits pétroliers », semaine du 25/09/2026 :

- Livraisons de 2 000 à 4 999 L : **193,73 c€/L TTC**, soit **≈ 19,43 c€/kWh PCI** à 9,97 kWh/L (calcul C).
- Moyenne sur l'année mobile : **145,43 c€/L TTC**, soit **≈ 14,59 c€/kWh PCI** (calcul C).
- Le prix est très volatil en 2026 : 111,10 c€/L un an plus tôt ; Brent à 117,81 $/b.
- URL : https://www.ecologie.gouv.fr/sites/default/files/documents/NPG-2026.09.25.pdf
- Citation : « fioul domestique (livraisons > 2 m3 et < 5 m3) 193,73 »
- **Confiance : A.** Pour un calculateur, la moyenne mobile sur 12 mois (ou la valeur SDES mensuelle) est sans doute plus pertinente que le pic hebdomadaire.

### 5e. Bois bûche : CEEB, 2e trimestre 2026

- Prix **HT** (« Les prix s'entendent hors TVA, par camion départ »), moyenne nationale.
- H1 = humidité ≤ 20 %. Groupe d'essences : chêne, charme, orme, hêtre, frêne, érable.

| Produit | Prix T2 2026 (€ HT/stère) |
|---|---|
| Vrac, 33-40 cm H1 | **88,7** |
| Vrac, 33-40 cm H2 | 71,7 |
| Vrac, 50 cm H1 | **77,3** |
| Vrac, 50 cm H2 | 69,0 |
| Vrac, 1 m H2 | 65,1 |
| Palette, 33-40 cm H1 | 136,0 |
| Palette, 50 cm H1 | 105,2 |

- URL : https://observatoire.franceboisforet.com/wp-content/uploads/2014/06/CEEB_Site-web_2026_T2_sciages-et-bois-energie_web.pdf
- **Confiance : A** (diffusion soumise à autorisation).
- En c€/kWh (calcul C) : 88,7 € HT / 1 680 kWh par stère (arrêté) = **5,3 c€ HT/kWh**. Avec 1 500 kWh/stère (ADEME) : 5,9 c€ HT/kWh.
- Le taux de TVA applicable au bois de chauffage **n'a pas été vérifié** ici. Il faut l'ajouter pour obtenir un TTC.

### 5f. Synthèse en c€/kWh PCI, automne 2026

| Énergie | c€/kWh PCI | Base | Confiance |
|---|---|---|---|
| Électricité, Tarif Bleu Base 6 kVA | 20,01 (hors abonnement) | EDF/CRE, 01/08/2026 | A |
| Gaz naturel, PRVG chauffage | 14,56 PCS, soit ≈ 16,16 PCI (hors abonnement) | CRE, 01/10/2026 | A/C |
| Fioul | 17,00 (août 2026, SDES) ; 19,43 (DGEC, 25/09/2026) ; 14,59 (moyenne mobile 12 mois) | SDES / DGEC | A/C |
| Propane | 18,18 (juillet 2026) | SDES | A |
| Granulés vrac | 8,43 | SDES / Propellet, T2 2026 | A |
| Granulés sacs | 8,37 | SDES / Propellet, T2 2026 | A |
| Bois bûche 33-40 cm sec | ≈ 5,3 à 5,9 **HT** | CEEB T2 2026, divisé par le PCI par stère | C |

---

## 6. Rendements

### 6a. Label Flamme Verte : exigences actuelles

Règlement et référentiel « Appareils indépendants », version validée le 15/10/2024 :
https://www.flammeverte.org/IMG/pdf/flammeverte_reglement-et-referentiel-technique_appareils-independants-2025.pdf

- Depuis le 01/03/2022, et inchangé au 01/01/2025 et au 01/01/2028 :
  - **Poêles et inserts à bûches** : efficacité énergétique saisonnière **ηs ≥ 65 %**.
  - **Poêles et inserts à granulés** : **ηs ≥ 79 %**.
- Le label raisonne désormais en **ηs** (au sens du règlement UE 2015/1185), et non plus en rendement nominal.
- Citation : « vaut respect des anciennes classes 7 étoiles précédemment utilisées »
- **Historique des seuils en rendement nominal** (annexe 4 du même document) : niveau 2020 « ≥ 75 % » pour les inserts et poêles à bûches, « ≥ 87 % » pour les poêles à granulés.
  - Ce sont les chiffres « 75 % / 87 % » qui circulent pour le « 7 étoiles ».
- **Chaudières bois** : référentiel « Section chaudières domestiques au bois », version du 06/07/2022.
  - **ηs ≥ 77 %** pour les chaudières ≤ 20 kW, **ηs ≥ 79 %** pour les chaudières > 20 kW (critère passé de 78 à 79 % au 01/01/2022). Calcul selon le règlement (UE) 2015/1189.
  - URL : https://www.flammeverte.org/IMG/pdf/fv_referentiel-chaudieres-bois.pdf
- **Confiance : A**

### 6b. Rendements conventionnels des générateurs (méthode 3CL-DPE, annexe 1, URL en 1a)

**Poêles et inserts** (Rg, §13.1) :

| Appareil | Rg |
|---|---|
| Poêle à bûches / insert installé avant 1990 | 0,5 |
| Poêle à bûches / insert 1990-2004 | 0,60 |
| Poêle à bûches / insert Flamme Verte 2007-2017 | 0,70 |
| Poêle à bûches / insert Flamme Verte à partir de 2018 | 0,75 |
| Poêle à granulés installé avant 2012 ou sans Flamme Verte | 0,8 |
| Poêle à granulés Flamme Verte 2012-2019 | 0,85 |
| Poêle à granulés Flamme Verte à partir de 2020 | 0,87 |

**Chaudières fioul** (valeurs par défaut, en PCI) :

| Type | Rpn | Rpint |
|---|---|---|
| Classique (avant 1970 jusqu'à 2015) | 84 + 2 log Pn | 80 + 3 log Pn |
| Basse température 1991-2015 | 87,5 + 1,5 log Pn | 87,5 + 1,5 log Pn |
| Condensation 1996-2015 | 91 + log Pn | 97 + log Pn |
| Condensation à partir de 2016, Pn ≤ 70 kW | 91 + 3 log Pn | 98 + 3 log Pn |

- Pertes à l'arrêt Qp0 : 4 % de Pn avant 1970, 3 % en 1970-1975, 2 % en 1976-1980, 1 % ensuite.

**Chaudières gaz** :

| Type | Rpn | Rpint |
|---|---|---|
| Classique | 84 + 2 log Pn | 80 + 3 log Pn |
| Condensation, Pn ≤ 70 kW, à partir de 2016 | 91 + 3 log Pn | 103 + 2,5 log Pn |

**Rendements d'installation** (multiplient le rendement de génération) :

- Émission (Re) : radiateurs à eau 0,95 (« Autres équipements ») ; plancher chauffant 1.
- Distribution (Rd), réseau individuel haute température (≥ 65 °C) : 0,88 non isolé, 0,92 isolé.
- Régulation (Rr) : radiateurs à eau avec robinets thermostatiques 0,95, sans 0,9 ; « Poêle charbon / bois / fioul / GPL ou insert » 0,8.

- **✗ Aucun chiffre unique et sourcé de « rendement saisonnier d'une vieille chaudière fioul »** (page ADEME inaccessible : erreur 403).
- Le plus propre : calculer avec la méthode 3CL. Exemple d'ordre de grandeur, calcul C : chaudière fioul classique de 25 kW, Rpn = 84 + 2 log 25 ≈ 86,8 % PCI, puis multiplier par Re × Rd × Rr ≈ 0,95 × 0,88 × 0,9. Les pertes à l'arrêt ne sont pas comptées dans cet exemple.
- **Confiance : A** pour les formules.

### 6c. PAC : exigences et valeurs par défaut

**Règlement (UE) 813/2013 (écoconception), annexe II**, à partir du 26/09/2017 :

- ηs ≥ **110 %** pour les PAC (moyenne température) ; ηs ≥ **125 %** pour les PAC basse température.
- Lu sur la copie de la version adoptée publiée par legislation.gov.uk, EUR-Lex étant inaccessible depuis l'outil : https://www.legislation.gov.uk/eur/2013/813/annex/II/adopted
- Citation : « shall not fall below 110 % » / « shall not fall below 125 % »
- ηs = SCOP / CC, corrigé (CC = 2,5) : https://www.legislation.gov.uk/eur/2013/813/annex/III/adopted
  - La correction de régulation habituellement retenue (−3 points pour une PAC air/eau) **n'a pas été lue dans la source primaire** (C).
- **Confiance : A**

**Règlement (UE) 206/2012 (climatiseurs et PAC air/air < 12 kW)**, annexe I, à partir du 01/01/2014, saison de chauffage « moyenne » :

- **SCOP ≥ 3,80** si le PRP du fluide est > 150, **≥ 3,42** si le PRP est ≤ 150.
- URL : https://www.legislation.gov.uk/eur/2012/206/annex/I/adopted
- **Confiance : A.** Une révision de ce règlement est en cours au niveau européen ; vérifier qu'aucun nouveau texte n'est entré en application.

**Aides 2026** (guide Anah « Les aides financières en 2026 », édition septembre 2026) :

- PAC air/eau : ηs « ≥ à 126 % » en basse température, « ≥ à 111 % » en moyenne et haute température.
- PAC air/air (CEE) : SCOP ≥ 3,9.
- URL : https://www.anah.gouv.fr/sites/default/files/2026-08/202609_guide-aides-financieres_WEB.pdf
- **Confiance : A**

**SCOP par défaut de la méthode 3CL** (zones H1 et H2, valeurs conventionnelles si le SCOP réel est inconnu) :

| Type de PAC | Avant 2008 | 2008-2014 | 2015-2016 | À partir de 2017 |
|---|---|---|---|---|
| Air/eau, radiateurs (« Autres ») | 2,2 | 2,4 | 2,6 | **2,8** |
| Air/eau, plancher | 2,4 | 2,6 | 2,9 | **3,2** |

| Type de PAC | Avant 2008 | 2008-2014 | À partir de 2015 |
|---|---|---|---|
| Air/air | 2,2 | 2,3 | **3** |

- **Confiance : A** (valeurs conventionnelles du DPE, prudentes).

### 6d. Facteur d'énergie primaire de l'électricité

- **1,9**, d'après l'arrêté du 15 septembre 2006, annexe 3, dans sa version en vigueur du 01/01/2026 au 01/01/2027.
- Citation : « 1,9 pour l'électricité »
- URL : https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000043357653
- **Confiance : A**

---

## 7. Bois bûche

### 7a. Stère, mètre cube apparent et longueur des bûches

- **Le stère** n'est plus une unité légale depuis le 1er janvier 1978.
  - FCBA, NF 444 : « n'est plus autorisé depuis le 1er janvier 1978 ».
  - Il correspond à 1 m³ apparent de bûches de 1 m bien empilées.
  - L'unité de référence est le **m³ apparent bois (MAB)**, ou m³ apparent rangé.
- **Attention :** « MAP » signifie mètre cube apparent de **plaquettes**, pas « m³ apparent plein ». Le FCBA (Mémento 2020) le dit : « bien différencié du map qui est le mètre cube apparent de plaquettes ».
- **Volume apparent d'un stère (bûches de 1 m recoupées)**, d'après les prescriptions techniques NF 444 Bois de chauffage (FCBA, 2019) : https://www.fcba.fr/wp-content/uploads/2020/10/prescriptions_techniques_-_bois_de_chauffage.pdf

| Longueur des bûches | 1 m | 50 cm | 45 cm | 40 cm | 33 cm | 30 cm | 25 cm | 20 cm |
|---|---|---|---|---|---|---|---|---|
| m³ apparent pour 1 stère | 1 | **0,80** | 0,77 | 0,74 | **0,70** | 0,66 | **0,60** | 0,57 |

- Mêmes valeurs à 1 m, 50, 33 et 25 cm dans le guide ADEME/DREAL Hauts-de-France de 2017 :
  - Citation : « 0,8 m3 de bûches de 50 cm, 0,7 m3 de bûches de 33 cm »
  - URL : https://www.hauts-de-france.developpement-durable.gouv.fr/IMG/pdf/guide-pratique-choisir-chauffage-bois-fevrier-2017.pdf
- Table inverse ADEME 2016 : 1 MAB de bûches de 0,50 m = 1,25 stère ; 0,33 m = 1,43 stère ; 0,25 m = 1,67 stère. Les valeurs 1/0,8 et 1/0,7 sont cohérentes.
- **Confiance : A/B**
- **Bois plein (m³ réel) dans un stère** : deux sources diffèrent.
  - CIBE (Mémento de conversion, 2008) : 1 stère = **0,7 m³** de bois plein.
    - URL : https://cibe.fr/wp-content/uploads/2018/08/conversionsboisenergie2008marwb.pdf
  - ADEME 2016 : « de manière très approximative 0,6 m3 ou 500 kg de bois ou 1500 kWh ».
  - **B**

### 7b. PCI selon l'humidité

- **Formule** (CIBE, synthèse n° 6, 2013) : PCI(Hb) = PCI(0 %) × (100 − Hb)/100 − 6,8 × Hb, en kWh par tonne brute. Hb est l'humidité sur masse brute, en %.
  - PCI anhydre : **5 000 kWh/t** pour les feuillus, **5 300 kWh/t** pour les résineux.
  - URL : https://cibe.fr/wp-content/uploads/2018/08/Synthese_6_Unites_du_BE_v_2013_10_16.pdf
  - Citation : « Pour les feuillus, PCI (0%) = 5.000 kWh/t »
  - **Confiance : B**
- **Tableau ADEME / CTBA / CRITT Bois / FIBOIS** (juin 2001), PCI en kWh/t brute :

| Humidité | 0 % | 10 % | 15 % | 20 % | 25 % | 30 % | 40 % | 50 % |
|---|---|---|---|---|---|---|---|---|
| Feuillus | 5 068 | 4 492 | 4 204 | **3 915** | 3 627 | 3 339 | 2 762 | 2 186 |
| Résineux | 5 330 | 4 727 | 4 426 | **4 124** | 3 823 | 3 522 | 2 919 | 2 316 |

- URL : https://cibe.fr/wp-content/uploads/2017/02/21-Mesures-PCI-bois-combustible-CRITT-bois-FIBOIS-CTBA.pdf
- **Confiance : B**
- **Valeur conventionnelle par stère** :
  - Arrêté DPE : « Bois – Bûches » = **1 680 kWh PCI par stère** (section 10). **A**
  - ADEME : ≈ 1 500 kWh par stère.

### 7c. Masse d'un stère selon l'essence

- **✗ Aucune table officielle ou professionnelle de « kg par stère » par essence trouvée.**
  - Les valeurs qui circulent sur des blogs (chêne 430 kg, hêtre 400 kg, charme 450 kg…) ne sont pas sourcées.
- Données sourcées utilisables :
  - **ADEME** : environ 500 kg par stère, sans distinction d'essence.
  - **FCBA, Mémento 2020** : masses volumiques à 12 % d'humidité (basse / moyenne / haute), en kg/m³ :

| Essence | Basse | Moyenne | Haute |
|---|---|---|---|
| Chêne | 620 | **720** | 820 |
| Hêtre | 605 | **670** | 740 |
| Épicéa | 360 | 440 | 525 |
| Sapin | 380 | 450 | 520 |
| Douglas | 400 | 500 | 600 |
| Pin sylvestre | 440 | 555 | 670 |

  - Charme : absent du tableau.
  - URL : https://www.fcba.fr/wp-content/uploads/2020/10/memento_2020.pdf
- **Estimation (calcul C, à présenter comme telle)** : masse ≈ masse volumique × 0,7 m³ plein par stère (CIBE).
  - Chêne : ≈ 500 kg. Hêtre : ≈ 470 kg. Épicéa : ≈ 310 kg.
  - Ces masses correspondent à environ 12 % d'humidité. Avec 0,6 m³ (ADEME), compter 15 % de moins.

### 7d. Humidité recommandée et garanties des labels

- **ADEME** : « Le taux d'humidité ne doit pas dépasser 20 % pour le bois ».
  - Source : guide « Le chauffage au bois, mode d'emploi », 2019.
  - URL : https://www.notre-environnement.gouv.fr/IMG/pdf/guide-pratique-chauffage-au-bois-mode-emploi.pdf
  - **A**
- **NF Bois de chauffage** (NF 444, FCBA, prescriptions du 08/01/2023) :
  - Humidité certifiée de 10 à 20 % sur masse humide.
  - Essences du groupe 1 : « Chêne / Charme / Hêtre / Frêne / Érable ».
  - URL : https://www.fcba.fr/wp-content/uploads/2023/02/NF444-BOIS-DE-CHAUFFAGE-V6.pdf
  - **A**
- **France Bois Bûche** : catégories « extra sec < 18 % », « sec 18-23 % », « mi-sec 23-30 % ».
  - Lues seulement via un résumé de recherche ; le site franceboisbuche.com n'a pas été lu directement.
  - **C, à vérifier**

---

## 8. Émission des radiateurs (EN 442)

### 8a. Formule et régime nominal

- Φ = Φn × (Δt / Δtn)^n, avec **Δtn = 50 K** au régime **75/65/20 °C**.
- Δt logarithmique si c = (tp − ti)/(tz − ti) < 0,7 ; sinon, Δt arithmétique = (tz + tp)/2 − ti.
- Source : catalogue technique Purmo, panneaux acier, 10/2021.
  - URL : https://www.purmo.com/docs/Purmo-technical-catalogue-full-panel-radiators-10_2021_EN.pdf
  - Citation : « The temperatures of 75/65/20 °C were accepted as reference values. »
- **Confiance : A/B**

### 8b. Radiateurs acier à panneaux Purmo Compact : W par mètre (longueur de 1 000 mm) à 75/65/20 °C (ΔT 50 K)

| Type | 300 mm | 450 mm | 600 mm | 900 mm |
|---|---|---|---|---|
| 11 | 546 W (n 1,2981) | 790 W (n 1,3048) | 1 018 W (n 1,3115) | 1 427 W (n 1,3170) |
| 21s | 761 W (n 1,2803) | 1 060 W (n 1,3008) | 1 340 W (n 1,3213) | 1 861 W (n 1,3390) |
| 22 | 961 W (n 1,3094) | 1 347 W (n 1,3226) | 1 709 W (n 1,3358) | 2 388 W (n 1,3561) |
| 33 | 1 347 W (n 1,3140) | 1 869 W (n 1,3313) | 2 356 W (n 1,3486) | 3 260 W (n 1,3600) |

- Source : même catalogue Purmo (version anglaise destinée à la Pologne), tableaux « Thermal output of the radiators [W] in accordance with EN 442 ». **Confiance : B**
- L'exposant n va de 1,28 à 1,36 : la valeur 1,3 est une bonne approximation par défaut.

### 8c. Radiateurs en fonte : W par élément à ΔT 50 (75/65/20)

- **Viadrus Kalor**, catalogue fabricant de 2016, essais selon EN 442-2. Puissance par élément selon la hauteur totale et la profondeur :

| Hauteur × profondeur | W par élément |
|---|---|
| 580 mm, profondeur 70 mm | 53 |
| 580 mm, profondeur 110 mm | 73 |
| 580 mm, profondeur 160 mm | 94 |
| 580 mm, profondeur 220 mm | 120 |
| 680 mm, profondeur 160 mm | 110 |
| 980 mm, profondeur 70 mm | 89 |
| 980 mm, profondeur 160 mm | 152 |
| 430 mm, profondeur 160 mm | 70 |

  - URL (catalogue hébergé par un distributeur) : https://www.hydronicsupplies.com.au/wp-content/uploads/2015/04/Viadrus-Catalogue-2016.pdf
  - Citation : « verified experimentally in compliance with EN 442-2 »
  - **Confiance : B**
- **Idéal Classic (fonte, modèles français historiques)**, d'après le distributeur Frédéric Matt, à ΔT 50 :

| Hauteur | 4 colonnes | 6 colonnes |
|---|---|---|
| 46 cm | 60 W | 90 W |
| 61 cm | 85 W | 117 W |
| 76 cm | 112 W | 167 W |
| 92 cm | 135 W | 190 W |

  - URL : https://www.fredericmatt.com/radiateurs/tech-ideal-classic
  - **Confiance : C** (distributeur, non fabricant)
- Aucun catalogue Chappée ou Ideal Standard actuel n'a été trouvé en ligne.

### 8d. Températures de départ d'une PAC

- **Règlement 813/2013, annexe I** : application basse température = sortie à **35 °C** ; moyenne température = sortie à **55 °C**. Climat moyen de référence : Strasbourg.
  - URL : https://www.legislation.gov.uk/eur/2013/813/annex/I/adopted
  - Citation : « indoor heat exchanger outlet temperature of 35 °C » / « … of 55 °C »
  - **A**
- **3CL** : seuil de 65 °C entre réseau « haute température » et « moyenne ou basse température ».
  - Citation : « Réseau individuel eau chaude haute température (≥ 65°C) »
  - **A**
- « 45 °C pour des radiateurs basse température » : **✗ pas de source primaire lue** (page ADEME infos.ademe.fr bloquée, erreur 403). À présenter comme un ordre de grandeur, ou à ne pas chiffrer.

---

## 9. MaPrimeRénov' 2026 (pour information)

Source : guide Anah « Les aides financières en 2026 », édition septembre 2026. URL en 6c.

- **Changement majeur pour FK Énergie.** « À partir du 1er septembre 2026, seule l'installation d'un mode de chauffage décarboné (n'utilisant ni fioul ni gaz) est financée. »
- La liste des équipements du parcours par geste ne contient plus que :
  - le raccordement à un réseau de chaleur ;
  - la **PAC air/eau** : 5 000 € (ménages très modestes), 4 000 € (modestes), 3 000 € (intermédiaires), non éligible pour les revenus supérieurs ; dépense plafonnée à 12 000 € ;
  - la PAC géothermique ou solarothermique ;
  - l'audit énergétique et la dépose de cuve à fioul.
- **Les poêles, inserts et chaudières bois ne figurent plus dans le parcours par geste.**
- Pour les CEE (« Coup de pouce »), le remplacement d'un équipement au fioul ou au gaz par une « chaudière biomasse » reste cité, ainsi que le remplacement d'un chauffage au charbon par un appareil Flamme Verte.
- Le Fonds Air Bois reste cité, jusqu'à 3 000 €.
- **Confiance : A.** À intégrer prudemment sur le site : les pages d'aides et les simulateurs ne doivent plus annoncer MaPrimeRénov' pour un poêle ou une chaudière bois posé après le 01/09/2026.

---

## 10. (Ajout) Facteurs de conversion en kWh PCI

Source principale : **arrêté du 15 septembre 2006** (DPE des bâtiments autres que d'habitation), **annexe 3**, version en vigueur du 01/01/2026 au 01/01/2027.
URL : https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000043357653

| Énergie | Unité | kWh PCI | Confiance |
|---|---|---|---|
| Fioul domestique | 1 litre | **9,97** | A |
| Gaz naturel | 1 kWh PCS | **÷ 1,11** (soit 0,901 kWh PCI) | A |
| Gaz naturel | 1 m³(n) | 11,628 | A |
| Propane | 1 litre | **6,9** | A |
| Propane | 1 tonne | **12 600** (soit 12,6 par kg) | A |
| Butane | 1 tonne | 12 570 | A |
| Granulés, briquettes | 1 tonne | **4 600** | A |
| Bois bûches | 1 stère | **1 680** | A |
| Plaquettes forestières | 1 tonne | 2 700 | A |
| Électricité, énergie primaire | — | coefficient **1,9** | A |

**Recoupements**

- **Rapport PCS/PCI de la méthode 3CL** (annexe 1, §13.2.1.4) : gaz naturel 1,11 ; GPL 1,09 ; fioul 1,07 ; bois 1,08 ; électricité 1.
  - Citation : « Coefficient de conversion k PCS/PCI »
  - **A**
- **PCI implicites dans les séries SDES** (calcul C) :
  - fioul : 9,91 kWh/L (168,475 € pour 100 L ↔ 16,9971 € pour 100 kWh) ;
  - propane : ≈ 12 780 kWh PCI/t et ≈ 13 800 kWh PCS/t.
  - Ces valeurs sont cohérentes avec l'arrêté, à 1-2 % près.

---

## Points restés sans source fiable (✗)

1. Barème du coefficient G **par époque de construction** (au-delà des maxima de 1974).
2. Masse d'un stère **par essence** (uniquement une estimation calculée, voir 7c).
3. Rendement saisonnier « typique » d'une vieille chaudière fioul en **un seul chiffre** (seulement les formules 3CL).
4. Prix du bois bûche **TTC** : le CEEB publie en HT, et le taux de TVA n'a pas été vérifié.
5. Tableau officiel NF P 52-612/CN de la température de base par département (norme payante ; −9 °C uniquement via des sources secondaires).
6. Température de 45 °C pour les radiateurs basse température (aucune source primaire lue).
7. Catégories d'humidité France Bois Bûche (non lues sur le site officiel).

# Revue : `/outils/convertisseur-bois-stere/`

Relecture du 1er octobre 2026. Aucun fichier du projet n'a été modifié.

Matériel utilisé :
- HTML servi par `http://localhost:4321` (curl) ;
- logique client réexécutée telle quelle sous Node (`scratchpad/verif.mts`) ;
- calculs refaits en Python (`scratchpad/verif_bois.py`) ;
- sources lues : ADEME 2016, 2019 et 2020, FCBA (prescriptions NF 444 et Mémento 2020), CIBE (2008 et 2013), CRITT/CTBA, Lignum, OFEN (Suisse), Energie+/Valbiom.

## Verdict global

Ce qui tient :
- La mécanique de conversion est **juste** : stère ↔ MAB d'après la table FCBA, PCI d'après la formule CIBE, équivalents fioul et granulés d'après l'arrêté.
- Le script, les tableaux générés au build et la FAQ concordent entre eux, à l'arrondi près.

Ce qui bloque :
1. **Le chiffre phare** (« 1 stère de chêne à 20 % ≈ 1 860 kWh et 480 kg ») s'écarte de la valeur conventionnelle que la page cite elle-même : 1 680 kWh/stère dans l'arrêté. Il contredit aussi le comparateur du même site, qui utilise 1 680 kWh/stère. Il vient d'un modèle de densité biaisé vers le haut pour le chêne.
2. **Un chiffre faux dans la FAQ**, repris dans le JSON-LD : « 0,7 m³ en 40 cm » au lieu de 0,74.

Le reste est du sourçage, du vocabulaire, de la plage d'humidité et de la mise en page mobile.

**À publier après correction des 2 bloquants et des points importants I1 à I6.**

---

## 1. Justesse : cas recalculés

Modèle du code :
- masse sèche par stère = ρ12 × 0,6 ÷ 1,12, soit chêne 385,7 kg, hêtre 358,9 kg, résineux 235,7 kg ;
- masse brute = masse sèche ÷ (1 − h) ;
- PCI = A(1 − h) − 0,68 h ;
- fioul : 9,97 kWh/L ; granulés : 4,6 kWh/kg, sacs de 15 kg.

| Cas | Stères | MAB | kg | kWh | Fioul | Sacs 15 kg | Script (Node) |
|---|---|---|---|---|---|---|---|
| 1 stère chêne, 50 cm, 20 % | 1 | 0,80 | 482,1 → 480 | 1 863 → 1 860 | 186,9 → 187 | 27,0 → 27 | identique |
| 3 MAB hêtre, 33 cm, 25 % | 4,286 → 4,29 | 3 | 2 051 → 2 050 | 7 343 → 7 340 | 736,5 → 736 | 106,4 → 106 | identique |
| 500 kg résineux, 15 % (50 cm) | 1,803 → 1,8 | 1,442 → 1,44 | 500 | 2 201 → 2 200 | 220,8 → 221 | 31,9 → 32 | identique |
| 2 stères chêne, 45 % | 2 | 1,6 | 1 402,6 → 1 400 | 3 428 → 3 430 | 343,8 → 344 | 49,7 → 50 | identique |

Contrôles complémentaires :
- **Tableau de l'énergie par humidité (build)** : identique au recalcul.

  | Humidité | Chêne | Hêtre | Résineux |
  |---|---|---|---|
  | 15 % | 1 880 | 1 750 | 1 220 |
  | 20 % | 1 860 | 1 730 | 1 210 |
  | 25 % | 1 840 | 1 710 | 1 200 |
  | 30 % | 1 820 | 1 690 | 1 180 |
  | 40 % | 1 750 | 1 630 | 1 140 |
  | 50 % | 1 670 | 1 550 | 1 090 |

- **Tableau des longueurs** : 1 / 0,8 / 0,74 / 0,7 / 0,6 et inverses 1 / 1,25 / 1,35 / 1,43 / 1,67. Conforme à FCBA NF 444. L'ADEME 2016 donne 1,36 pour 40 cm, ce qui est négligeable.
- **FAQ dynamique** :
  - « 1 860 kWh » : OK ;
  - « 3,9 kWh / 2,2 kWh » : OK (3,864 et 2,16) ;
  - « 0,7 m³ en 40 cm » : **faux** (voir B2).
- **Formule PCI** : identique à CIBE synthèse n° 6 (3 864 kWh/t à 20 % pour les feuillus). L'écart avec le tableau CTBA/CRITT de 2001 (3 915 kWh/t) est de 1,3 %.

---

## Constats

### BLOQUANT

#### B1. Énergie et masse par stère surestimées pour le chêne, et incohérentes avec la source citée et avec le comparateur

- **Où** :
  - `src/data/thermique.ts:238-246` (commentaire et `masseSeche`) ;
  - `src/pages/outils/convertisseur-bois-stere.astro:30` (FAQ), `:85` et `:98` (valeurs initiales), `:129-132` (texte de méthode) ;
  - à rapprocher de `src/data/thermique.ts:149` (`energies.bois.pci: 1680`, utilisé par le comparateur).

- **Problème** : la page annonce 1 860 kWh et 480 kg pour un stère de chêne à 20 %. Or :
  - l'arrêté du 15/09/2006 (source « conversions », listée sur la page) donne **1 680 kWh/stère** ;
  - l'ADEME 2016 donne « de manière très approximative 0,6 m³ ou 500 kg de bois ou 1500 kWh » ;
  - le comparateur du site utilise 1 680 kWh/stère.

  Un visiteur qui passe d'un outil à l'autre voit donc 11 % d'écart sur le même stère, et un lecteur qui ouvre la source Légifrance lit 1 680.

- **Analyse physique du modèle** `ρ12 ÷ 1,12 × 0,6` :
  - **Le ÷ 1,12 est juste pour la masse.** Les 12 % du Mémento FCBA sont une humidité sur masse sèche (convention du bois d'œuvre), donc m0 = m12 ÷ 1,12.
  - **Le volume, lui, est faux.** ρ12 se rapporte au volume du bois sec à l'air, donc rétracté. Le stère est empilé et cubé sur du bois frais ou mi-sec, au-dessus ou près du point de saturation des fibres. La bonne grandeur est l'**infradensité** (masse anhydre ÷ volume à l'état saturé).
  - Le Mémento FCBA 2020 (p. 28, coefficients des bois ronds) permet de la calculer : masse volumique brute × siccité.
    - chêne : 950 × 0,61 = **580 kg/m³** (le code prend 720 ÷ 1,12 = 643, soit **+11 %**) ;
    - hêtre : 1 025 × 0,60 = **615 kg/m³** (le code prend 598, soit −3 %) ;
    - épicéa-sapin : 790 × 0,47 = **371 kg/m³** (le code prend 393, soit +6 %).
  - Recoupement avec Lignum (ρ0 anhydre et retrait par point d'humidité) : chêne 0,65 ÷ (1 + 0,515 × 0,30) ≈ 0,56. C'est cohérent avec l'infradensité FCBA.
  - **Conséquence** : le modèle actuel classe le chêne au-dessus du hêtre (1 860 contre 1 730 kWh), alors que les sources donnent l'inverse ou l'égalité :
    - FCBA : infradensité 615 pour le hêtre contre 580 pour le chêne ;
    - Energie+/Valbiom : hêtre de 1 641 à 2 176 kWh/stère, chêne de 1 302 à 1 922 ;
    - Lignum : ρ0 de 0,64 à 0,72 pour le hêtre, de 0,60 à 0,70 pour le chêne.

- **Facteur 0,6 ou 0,7** :
  - FCBA Mémento 2020, p. 29 : « Billons empilés (enstérés), longueur 1 m : 1 m3 réel = 1,3 à 1,6 m3a », soit **0,63 à 0,77 m³ plein par stère**. Le Mémento ajoute que ce volume est d'autant plus faible que les bois sont « longs, flexueux, mal empilés et de petits diamètres ».
  - CIBE 2008 : 0,7.
  - ADEME 2015/2016 : 0,6, « très approximatif ».
  - Energie+/Valbiom (ADEME 1999, Carré 1991) : chêne de 0,46 à 0,68 ; hêtre de 0,58 à 0,77 ; épicéa de 0,62 à 0,76.
  - Pour des bûches fendues avec écorce, **0,6 est la valeur prudente à garder**. Avec 0,7, le chêne monterait à 1 960 kWh, loin de l'arrêté et de l'ADEME.

- **Correction recommandée**, chiffrée et sourcée (voir aussi la synthèse en fin de document) :

  ```ts
  /**
   * Masse anhydre par stère (kg) = infradensité × 0,6 m³ de bois plein par stère (ADEME 2016).
   * Infradensité = masse volumique du bois frais × siccité (FCBA, Mémento 2020, p. 28) :
   * chêne 950 × 0,61 ; hêtre 1 025 × 0,60 ; épicéa-sapin 790 × 0,47.
   */
  { value: 'chene',    label: 'Chêne',    masseSeche: 950 * 0.61 * 0.6,  pciAnhydre: 5.0 }, // 347,7 kg
  { value: 'hetre',    label: 'Hêtre',    masseSeche: 1025 * 0.60 * 0.6, pciAnhydre: 5.0 }, // 369 kg
  { value: 'resineux', label: 'Résineux (épicéa, sapin)', masseSeche: 790 * 0.47 * 0.6, pciAnhydre: 5.3 }, // 222,8 kg
  ```

  Résultats à 20 % :
  - **chêne : 430 kg, 1 680 kWh**, soit exactement la valeur de l'arrêté, et cohérent avec le comparateur ;
  - hêtre : 460 kg, 1 780 kWh ;
  - résineux : 280 kg, 1 140 kWh.

  Ces valeurs tombent au milieu des fourchettes Energie+/Valbiom : chêne de 1 302 à 1 922 kWh (milieu 1 612), hêtre de 1 641 à 2 176 (milieu 1 908), épicéa de 1 029 à 1 259 (milieu 1 144). Elles sont aussi cohérentes avec l'ordre de grandeur ADEME (500 kg, 1 500 kWh).

  À faire en même temps :
  - Remplacer le texte `:129-132` par : « … à partir de l'infradensité de l'essence (masse de bois sec par m³ de bois frais, FCBA) et d'environ 0,6 m³ de bois plein par stère (ADEME). »
  - Ajouter la mention : « Selon le rangement et la grosseur des bûches, comptez ± 15 % (FCBA : 0,63 à 0,77 m³ plein par stère). » On peut aussi afficher la fourchette, de 1 540 à 1 960 kWh pour le chêne avec 0,55 à 0,7 m³.
  - Ajouter la source ADEME 2016 (voir I4).
  - Mettre à jour `research/donnees-outils.md` §7c, qui recommande encore « × 0,7 ».

#### B2. FAQ et JSON-LD : « 0,7 m³ en 40 cm »

- **Où** : `convertisseur-bois-stere.astro:26`, avec `fmt(l.map, 1)`.
- **Preuve** : le HTML rendu contient « 0,8 m³ en 50 cm, **0,7 m³ en 40 cm**, 0,7 m³ en 33 cm, 0,6 m³ en 25 cm ». La valeur FCBA est 0,74, et le tableau de la même page affiche « 0,74 ». Ce texte est repris dans le `FAQPage` du JSON-LD.
- **Correction** : `fmt(l.map, 2)`.

### IMPORTANT

#### I1. Base de l'humidité non précisée, et piège de l'humidimètre

- **Où** : `:74-78` (curseur) et `:38` (FAQ sur l'humidimètre).
- **Problème** : le calcul suppose une humidité **sur masse brute** (CIBE, NF 444). Or les humidimètres à pointes affichent l'humidité **sur masse sèche**. NF 444, prescriptions 2023, §b : « Les appareils de mesure d'humidité de type résistif affichent l'humidité sur masse sèche », avec un tableau de correspondance (25 % sur sec = 20 % sur brut ; 30 % = 23 %). La FAQ conseille l'humidimètre sans le dire : un lecteur qui lit 25 % se croira hors norme alors qu'il est à 20 %.
- **Correction** :
  - libellé : « Humidité du bois (sur masse brute) » ;
  - aide reliée par `aria-describedby` : « Un humidimètre à pointes affiche l'humidité sur masse sèche : 25 % à l'appareil correspondent à 20 % ici (FCBA, NF Bois de chauffage). Mesurez au cœur d'une bûche fraîchement fendue. »
  - Ajouter `sourcesThermique` NF 444 2023 (URL déjà dans la recherche, §7d).

#### I2. Curseur de 10 à 60 % : non physique au-delà d'environ 50 % pour les feuillus, et « bois vert à 50 % » exagéré pour le chêne

- **Où** : `:77` (`max="60"`), `:19` (ligne 50 % du tableau), `:21` (`pciVert` à 0,5) et `:34` (FAQ).
- **Preuve** :
  - à 60 %, le modèle donne 960 kg pour un stère de chêne, soit 960 ÷ 0,6 = **1 607 kg par m³ de bois plein**. C'est plus que la densité de la paroi cellulaire elle-même (environ 1 500 kg/m³), donc impossible ;
  - le chêne frais est à **39 %** sur brut (FCBA : siccité 61 %), le hêtre à 40 %, l'épicéa-sapin à 53 % ;
  - la formule PCI reste valable mathématiquement jusqu'à 70 % (table CIBE), mais l'hypothèse « masse sèche constante par stère » ne l'est plus.
- **Correction** :
  - `max="50"` ;
  - FAQ : « contre 2,7 kWh pour du bois fraîchement abattu, à environ 40 % (FCBA) », avec `pciVert = pciBois(…, 0.4)`, soit 2,73 ;
  - éventuellement une ligne « bois vert » à 40 % dans le tableau.

#### I3. Message sur l'humidité contradictoire avec les résultats de l'outil

- **Où** : `:30` (« en fournit nettement moins »), `:131` (« C'est pourquoi l'humidité pèse autant sur le résultat ») et le tableau `:167-190`.
- **Preuve** : par stère, le modèle ne perd que 2,5 % entre 20 et 30 %, 6 % à 40 % et 11 % à 50 %. C'est physiquement correct : même matière sèche, seule l'évaporation coûte. Un lecteur qui bouge le curseur voit donc 1 860 puis 1 750 kWh, pas « nettement moins ».

  La vraie perte est ailleurs, et elle est sourcée par l'ADEME 2019, déjà citée : « Des bûches à 40 % d'humidité provoquent une perte de rendement d'environ 25 % par rapport à des bûches à 20 % d'humidité ».

  Par kilo, en revanche, l'écart est fort. C'est ce que dit l'ADEME 2016 : « acheter le bois au poids est moins judicieux ».
- **Correction** :
  - FAQ « Combien de kWh » : « … un stère de bois plus humide contient un peu moins d'énergie (environ 6 % de moins à 40 %), mais surtout l'appareil la restitue mal : environ 25 % de rendement en moins à 40 % d'humidité (ADEME). »
  - Texte `:131` : remplacer « pèse autant » par « Au kilo, l'humidité pèse lourd : un kilo de bois à 40 % fournit 30 % d'énergie de moins qu'à 20 %. »
  - En mode « kilos », ajouter : « Au poids, vous payez aussi l'eau. »

#### I4. Sources manquantes ou mal attribuées, formulations à reprendre

| Où | Affirmation | État | Correction |
|---|---|---|---|
| `:129` et `thermique.ts:239-240` | « environ 0,6 m³ de bois plein par stère (ADEME) » | **Non couvert par les sources listées.** Le guide ADEME 2020 cité ne contient que « 0,6 m3 de bûches de 25 cm ». Le 0,6 m³ plein vient du guide ADEME « Se chauffer au bois » 2015/2016. | Ajouter cette source (URL de `research/donnees-outils.md` l. 179, hébergée par un tiers ; chercher une URL ADEME si possible), ou citer le FCBA Mémento p. 29 (« 1 m3 réel = 1,3 à 1,6 m3a »). |
| `:38` | « humidimètre, vendu quelques euros » | Chiffre non sourcé, et sous-estimé. | « un humidimètre à pointes, peu coûteux » (sans prix). L'ADEME 2016 dit « petit appareil d'usage simple ». |
| `:38` | « des fentes aux extrémités, un son clair…, une écorce qui se détache » | Couvert par l'ADEME 2019 (source déjà listée), mais la formulation s'en écarte. | Reprendre la formulation ADEME : « de petites fissures qui partent du cœur, des bûches légères qui résonnent quand on les cogne, une écorce qui se détache facilement, sans teinte verte dessous ». |
| `:26` | « le bois se vend **de plus en plus** au m³ apparent » | Tendance non sourcée. | « Le m³ apparent (MAB) est l'unité de référence pour la vente du bois bûche (ADEME) ; il permet de comparer des offres de longueurs différentes. » |
| `:119-120` | « plus une unité légale depuis 1978, mais **tout le monde** l'utilise encore » | 1978 sourcé : FCBA NF 444, note 1, « n'est plus autorisé depuis le 1er janvier 1978 » (décret 61-501). « Tout le monde » est une généralisation. | « Son emploi comme unité de vente n'est plus autorisé depuis le 1er janvier 1978, mais il reste très utilisé (ADEME). » |
| `:34` et `:78` | « L'ADEME recommande 20 % au maximum » | Sourcé par l'ADEME 2019. Mais le guide ADEME 2020, aussi cité, indique **23 %** pour les bûches. | Garder 20 % en citant la 2019 et NF 444. Retirer la mention « dimensionnement » du libellé ADEME 2020 si elle ne sert pas, ou préciser dans le libellé que le 20 % vient de la 2019. |
| Source `pciBois` | PCI anhydre 5,0 et 5,3 | OK (CIBE). | — |

#### I5. Ambiguïté commerciale « stère de 33 cm »

- **Où** : `:58-71`, choix de l'unité et de la longueur.
- **Problème** : en unité « stères », la longueur ne change pas les kWh. C'est **juste** selon la définition FCBA : 1 stère recoupé en 33 cm donne 0,7 m³ apparent et la même quantité de bois. Mais beaucoup d'acheteurs ont une facture « 1 stère en 33 cm » pour un tas de 1 m³. Sans explication, l'outil sous-estime alors leur bois de 30 %, et le fait que la longueur ne bouge pas les kWh ressemble à un bug.
- **Correction** : ajouter une aide sous « Unité » : « Stère = bois d'un tas de 1 m³ en bûches de 1 m. Si l'on vous a livré un tas de 1 m³ de bûches de 33 cm, choisissez "m³ apparents" : cela fait 1,43 stère. » On peut aussi afficher « (en bûches de 1 m) » à côté de « stères ».

#### I6. Mobile : les 3 tuiles de résultats débordent

- **Où** : `:87`, `grid grid-cols-3 gap-3` avec des tuiles `p-4 text-xl`.
- **Preuve** (calcul sur les classes, sans navigateur) : à 375 px, le panneau fait 343 px, moins `p-7` (56 px), soit 287 px. Moins 2 gouttières de 12 px, cela laisse 88 px par tuile et **56 px de contenu**.
  - « 2 050 kg » en 20 px semi-gras mesure environ 80 px et passe sur 2 lignes. « 12 340 kg » ne peut pas se couper (l'espace fine de `fmt` est insécable) et **déborde**.
  - « m³ apparents » en 14 px mesure environ 85 px et passe sur 2 lignes.
  - À 320 px, il reste environ 37 px de contenu : même « 4,29 » déborde.
  - Le chiffre principal en `text-6xl` déborde aussi au-delà d'environ 8 chiffres.
- **Correction** :
  - tuiles : `grid-cols-1 min-[400px]:grid-cols-3`, ou `grid-cols-3` avec `p-3`, `text-lg`, `min-w-0`, `tabular-nums` et `break-words` ;
  - chiffre principal : `text-5xl sm:text-6xl` ;
  - plafonner la quantité (`max`, par exemple 1 000).

#### I7. Charme absent

- **Pourquoi l'ajouter** :
  - le charme fait partie du **groupe 1 NF 444** (« Chêne / Charme / Hêtre / Frêne / Érable ») ;
  - il est dans le groupe d'essences du prix CEEB ;
  - l'ADEME 2019 le cite parmi les feuillus denses à privilégier (« hêtre, charme, châtaignier, chêne, frêne, robinier ») ;
  - il est très présent dans le Nord-Est et le Nord : la fiche essence du ministère de l'Agriculture le dit « commun dans le Nord-Est ».
- **Sources pour le chiffrer** :
  - PCI anhydre : **4 970 kWh/t** (tableau CTBA/CRITT/FIBOIS, déjà dans la recherche, URL cibe.fr/21-Mesures-PCI…). On peut aussi garder 5,0 (CIBE feuillus) par cohérence.
  - Densité : absente du Mémento FCBA. Lignum, « Propriétés physiques du bois » (https://www.lignum.ch/files/_migrated/content_uploads/Propri%C3%A9t%C3%A9s_physiques_du_bois_02.pdf), donne ρ0 de 0,70 à 0,79 et un retrait radial de 0,19 à 0,26 et tangentiel de 0,30 à 0,40 %/%.
  - Infradensité estimée : 0,745 ÷ (1 + 0,575 × 0,30) ≈ **635 kg/m³**. C'est un **calcul de niveau C**, à présenter comme tel.
- **Valeur proposée** : `masseSeche: 635 * 0.6` (381 kg), soit **480 kg et 1 840 kWh à 20 %**.
- **Plus simple, et sans chiffre dérivé** : regrouper en « Hêtre, charme » ou en « Feuillus durs (chêne, charme, hêtre, frêne) », le groupe 1 NF 444 et CEEB, calé sur 1 680 kWh (arrêté).

#### I8. SEO : la requête « 1 stère de bois combien de kg » n'a pas de réponse indexable

- **Constat** :
  - la page a un tableau des kWh par humidité, mais **aucun tableau ni phrase sur le poids** (le kg n'apparaît que dans la tuile dynamique, avec 480 kg dans le HTML initial) ;
  - la description et le H1 parlent de « kilos ».
  - Les concurrents (Selectra, bois-de-chauffage-energie.fr) ont tous un tableau « poids d'un stère par essence, sec ou vert », mais sans sources.
- **Correction** :
  - ajouter un tableau « Poids d'un stère selon l'humidité » généré comme celui des kWh. Avec B1 corrigé :

    | Humidité | Chêne | Hêtre | Charme | Résineux |
    |---|---|---|---|---|
    | 20 % | 430 kg | 460 kg | 480 kg | 280 kg |
    | 30 % | 500 kg | 530 kg | 540 kg | 320 kg |
    | 40 % | 580 kg | 620 kg | 640 kg | 370 kg |

  - ajouter une **phrase-réponse en tête du contenu** (pour l'extrait de recherche) : « 1 stère = 1 m³ de bûches de 1 m, soit 0,8 m³ apparent en 50 cm et 0,7 en 33 cm ; environ 430 à 480 kg et 1 700 à 1 800 kWh pour un feuillu dur sec à 20 %. »

#### I9. Vocabulaire : « volume réel du tas »

- **Où** : `:120-121`.
- **Problème** : dans la filière, « m³ réel » veut dire bois **plein** (FCBA, CIBE). Le MAB est au contraire le volume **apparent**, vides compris.
- **Correction** : « Le mètre cube apparent de bois (MAB) mesure le volume extérieur du tas, vides compris, avec les bûches à leur longueur de livraison. » Ajouter une phrase sur le **m³ plein** (environ 0,6 à 0,7 par stère) : c'est une requête fréquente, et le terme est utilisé dans la méthode.

### MINEUR

1. **Écho de la saisie en kilos arrondi** (`:215` et `:219`). La saisie de 504 kg affiche « 500 kg » dans la tuile (Node : `504 kg → 500 kg`), alors que les kWh correspondent bien à 504 kg. En mode kilos, afficher la saisie telle quelle (`fmt(kg, 0)`).
2. **Quantité négative ou invalide** (`:209`). Le `return` laisse affichés les anciens résultats, sans message (Node : `-1 → STALE`). Un champ vide donne 0 partout. Afficher « — » et un message court, ou ramener à 0 avec `aria-invalid`.
3. **Petites quantités** : 0,004 stère donne « 0 st » et « 2 kg ». Sans enjeu.
4. **`aria-live="polite"` sur tout le panneau** (`:82`). À chaque cran du curseur, les tuiles, les équivalents, le bouton et la note peuvent être relus. Limiter la zone vivante à une phrase de synthèse (par exemple « 1 860 kWh, 480 kg, 0,8 m³ apparent »), avec `aria-atomic="true"`, mise à jour avec un léger délai.
5. **Curseur** (`:74-77`) :
   - l'`<output>` est dans le `<label>`, donc le nom accessible change à chaque mouvement ;
   - pas d'`aria-valuetext` : le lecteur d'écran annonce « 20 » sans « % » ;
   - l'aide n'est pas reliée au curseur.

   Sortir l'`<output>` du label, mettre `aria-valuetext="20 %"` à jour dans `update()` et ajouter `aria-describedby="humidite-aide"`.
6. **« 20 % »** (`:75`, `:208`) : espace normale, qui peut se couper en fin de ligne. Utiliser ` `, comme `fmt`.
7. **Clé interne `map`** (`thermique.ts:231-236` et `:66`, `:212`, `:218`). En bois énergie, « map » désigne le m³ apparent de **plaquettes** (FCBA Mémento). Le libellé visible « MAB » est juste ; renommer la clé en `mab` évitera la confusion.
8. **Longueurs manquantes** : FCBA donne aussi 45 cm (0,77), **30 cm (0,66)**, courant pour les petits poêles, et 20 cm (0,57). On peut au moins ajouter 30 cm.
9. **Équivalents** : préciser « en énergie contenue (PCI) ». La note `:110` va dans ce sens, mais on peut lire « 187 L de fioul » comme « remplace 187 L ». Or, à la sortie de l'appareil, les rendements diffèrent : poêle à bois 75 %, chaudière fioul 87 % et poêle à granulés 87 % selon la méthode 3CL, déjà dans `systemes`.
10. **Changement d'unité** : la valeur saisie garde son nombre (1 stère devient 1 kg). Convertir la saisie dans la nouvelle unité garderait le même tas de bois.
11. **Arrondi `round10`** : cohérent entre le build et le client (`Math.round(x/10)*10` au build, `round10` côté client, avec des valeurs toujours supérieures ou égales à 100 au build). Aucun écart.

### SUGGESTIONS

- **Maillage** :
  - lien « Combien de stères pour un hiver ? » vers `/outils/calcul-puissance-poele/` et `/outils/comparateur-cout-chauffage/` (coût du stère) ;
  - guide futur « Bien choisir et stocker son bois de chauffage » (pendant de `bien-choisir-ses-granules-de-bois`).
  - Les pages `/poele-a-bois/` et `/inserts-cheminees/` renvoient déjà à l'outil (vérifié dans le HTML).
- **Title** : « Convertisseur stère, m³, kg et kWh (bois de chauffage) », qui place « stère » en premier pour la requête « stère en m3 ». Le H1 actuel est bon.
- **Tableau des longueurs** : ajouter une colonne « bois plein (m³) », environ 0,6 ou de 0,6 à 0,7. Les concurrents l'ont.
- **Fourchette** sous le résultat principal, comme en B1.
- **Pages concurrentes** (Selectra, bois-de-chauffage-energie.fr, concept-flamme) :
  - elles couvrent en plus le prix du stère, la consommation par hiver, une liste longue d'essences (charme, frêne…) et le poids sec ou vert ;
  - elles n'ont **aucune source** primaire (bois-de-chauffage-energie.fr cite même des humidités « 120 % ») ;
  - l'avantage de FK Énergie, c'est le sourçage : garder la liste des sources en évidence.

---

## Synthèse de la recommandation chiffrée (point 2)

| Grandeur (stère, 20 % sur brut) | Actuel | Recommandé | Références |
|---|---|---|---|
| Chêne : masse anhydre | 386 kg | **348 kg** (580 × 0,6) | FCBA infradensité 950 × 0,61 ; ADEME 0,6 m³ |
| Chêne : masse brute | 480 kg | **430 kg** | ADEME « 500 kg » (approximatif) ; Valbiom 334 à 493 kg |
| Chêne : énergie | 1 860 kWh | **1 680 kWh** | **Arrêté DPE 1 680** ; Valbiom 1 302 à 1 922 ; ADEME 1 500 |
| Hêtre | 450 kg, 1 730 kWh | **460 kg, 1 780 kWh** | FCBA 1 025 × 0,60 ; Valbiom 1 641 à 2 176 |
| Charme (nouveau, calcul C) | — | **480 kg, 1 840 kWh** | Lignum ρ0 et retrait ; NF 444 groupe 1 |
| Résineux | 290 kg, 1 210 kWh | **280 kg, 1 140 kWh** | FCBA 790 × 0,47 ; Valbiom 1 029 à 1 259 |
| Équivalents, chêne | 187 L, 27 sacs | **168 L, 24 sacs** | 9,97 kWh/L ; 4,6 kWh/kg |
| Fourchette affichée | aucune | ± 15 % (0,55 à 0,7 m³ plein : 1 540 à 1 960 kWh pour le chêne) | FCBA 0,63 à 0,77 ; Valbiom |

Pourquoi ce choix :
- **Une seule hypothèse change** (la densité), et la nouvelle est **mieux fondée physiquement**.
- Le chêne retombe **exactement** sur la valeur conventionnelle de l'arrêté (1 680), ce qui rend le site cohérent avec le comparateur et avec la source citée.
- Le hêtre et les résineux tombent au milieu des fourchettes publiées.

Le recalage pur sur 1 680 kWh, sans distinguer les essences, est l'alternative la plus simple. Elle donne le même chiffre pour le chêne, mais perd la nuance entre essences.

## Sources consultées (hors projet)

- FCBA, Mémento 2020, p. 28-29 (coefficients de conversion, billons enstérés) : https://www.fcba.fr/wp-content/uploads/2020/10/memento_2020.pdf
- FCBA, prescriptions NF 444 2019 et 2023 (stère et 1978 ; humidimètre résistif sur masse sèche, tableau 1)
- ADEME, « Le chauffage au bois, mode d'emploi », 2019 : indices de bois sec, 20 %, −25 % de rendement à 40 %
- ADEME, « Se chauffer au bois », 2015/2016 : 0,6 m³ / 500 kg / 1 500 kWh ; table MAB → stère
- ADEME, « Adopter le chauffage au bois », 2020 : table stère → m³ ; 23 % pour les bûches
- CIBE, synthèse n° 6, 2013 (formule PCI) et conversions 2008 (0,7 m³ plein)
- CTBA/CRITT/FIBOIS, mesures de PCI (charme 4 970 kWh/t anhydre)
- Lignum, « Propriétés physiques du bois » : https://www.lignum.ch/files/_migrated/content_uploads/Propri%C3%A9t%C3%A9s_physiques_du_bois_02.pdf
- Energie+ (UCLouvain), « Bois-énergie : les points clés », tableau Valbiom : https://energieplus-lesite.be/theories/bois-energie/bois-energie/
- OFEN (Suisse), « Détermination de la puissance du générateur de chaleur » : bois dur 2 500 kWh **PCS**/stère, soit environ 2 190 kWh PCI à 20 % (borne haute) : https://pubdb.bfe.admin.ch/fr/publication/download/2781
- Concurrents (structure seulement) : https://climate.selectra.com/fr/energie-verte/stere-de-bois ; https://bois-de-chauffage-energie.fr/poids-stere-bois/

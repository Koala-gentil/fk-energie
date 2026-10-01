# Revue : `/outils/dimensionnement-pompe-a-chaleur/`

Relecture du 1er octobre 2026. Aucun fichier du projet n'a été modifié.
Fichiers lus : `src/pages/outils/dimensionnement-pompe-a-chaleur.astro`, `src/lib/thermique.ts`, `src/data/thermique.ts`, `src/layouts/OutilLayout.astro`, `src/components/outils/*.astro`, `src/components/ContactForm.astro`, `research/donnees-outils.md` (§1, §6c, §8), `research/coefficient-g-3cl.md`.
HTML rendu récupéré avec curl sur http://localhost:4321. Calculs refaits en Node, avec les vraies fonctions et données TS importées (`node --experimental-strip-types`), et vérifiés en Python.

## Verdict global

Les formules sont justes : déperditions G × V × 28,5 K, loi d'émission EN 442 en (ΔT/50)^1,3, inversion pour obtenir la température. Les tableaux du build et la FAQ chiffrée correspondent exactement au code.

**L'outil n'est pas publiable en l'état**, pour trois raisons.

1. **Au chargement**, la page affiche « il faut une eau à 374 °C ».
2. **Aucun garde-fou** ne prévient l'utilisateur quand le résultat est physiquement absurde, ni quand il n'a déclaré qu'une partie de ses radiateurs.
3. **Le verdict est sévère et peu nuancé.** Dans les trois cas réalistes testés, y compris une maison de 1980 bien équipée, il conclut que les radiateurs sont « trop justes pour une pompe à chaleur ». Or :
   - le seuil de 65 °C est emprunté à une classification 3CL des réseaux de distribution, pas à une limite des PAC ;
   - la FAQ (« Souvent, oui ») et le test « chaudière à 55 °C », trop indulgent, contredisent ce verdict.

Le reste se corrige vite : écart départ/retour à sourcer, fonte, unités, SEO « fonte », accessibilité.

---

## 1. Justesse : cas chiffrés

Hypothèses du code : hauteur 2,5 m, Tint 19 °C, Tbase −9,5 °C (ΔT 28,5 K), n = 1,3, ambiance radiateur 20 °C, écart départ/retour 10 K.
Formules : départ = moyenne + 5, avec moyenne = 20 + 50 × (P/P50)^(1/1,3).

| Cas | H (W/K) | Besoin P | P50 déclaré | P/P50 | T moyenne | Départ | Verdict du script |
|---|---|---|---|---|---|---|---|
| (a) 100 m², 1975-1988 (G 1,35), 6 × acier 22, 600 × 1000 mm (1 709 W/m) | 337,5 | 9 619 W (9,6 kW) | 10 254 W | 0,938 | 67,6 °C | **72,6 °C** | « trop justes, plus de 65 °C » |
| (b) 120 m², avant 1975 (G 2,65), 8 × fonte épais 680 mm, 12 éléments (110 W) | 795 | 22 658 W (22,7 kW) | 10 560 W | 2,146 | 110,0 °C | **115,0 °C** | « trop justes » ; affiche « eau à 115 °C » |
| (c) 90 m², depuis 2013 (G 0,65), 5 × acier 11, 450 × 800 mm (790 W/m) | 146,25 | 4 168 W (4,2 kW) | 3 160 W | 1,319 | 81,9 °C | **86,9 °C** | « trop justes » ; affiche « eau à 87 °C » |
| État au chargement : 1 × acier 22, **300 mm** (1re option), 80 cm | 337,5 | 9 619 W | 769 W | 12,5 | 369 °C | **374 °C** | « trop justes » ; affiche « eau à 374 °C » |

- Calcul manuel du cas (a) : 0,938^0,769 = 0,952, d'où moyenne = 20 + 47,6 = 67,6 °C. Le script donne la même valeur (identique à 0,01 K près dans les trois cas).
- Tableau « part de la puissance nominale » (build) : 35 °C → 20,9 % ; 40 → 30,4 ; 45 → 40,6 ; 50 → 51,5 ; 55 → 62,9 ; 60 → 74,8 ; 65 → 87,2 ; 70 → 100. L'affichage arrondi (21, 30, 41, 51, 63, 75, 87, 100 %) est juste.
- Tableau des puissances (build) et FAQ « 100 m² » : 9,6 kW (1975-1988) et 4,6 kW (depuis 2013). C'est cohérent : 100 × 2,5 × 1,35 × 28,5 = 9 619 W et 100 × 2,5 × 0,65 × 28,5 = 4 631 W.
- Repère utile pour la rédaction, avec l'écart de 10 K du code : pour un départ à 55 °C, il faut une puissance nominale (ΔT 50) de radiateurs égale à **1,94 fois** le besoin. Il faut 1,34 fois pour 65 °C, 3,3 fois pour 45 °C et 8,1 fois pour 35 °C. Avec un écart de 5 K : 1,75 / 1,24 / 2,8 / 6,1.

---

## BLOQUANT

### B1. La page affiche « eau à 374 °C » dès le chargement
- **Où** :
  - `dimensionnement-pompe-a-chaleur.astro:301-302` : `addRow(); update();` ;
  - `:117` : la 1re hauteur proposée est 300 mm ;
  - `:122` et `:126` : 80 cm et 1 exemplaire par défaut.
- **Problème** : la ligne pré-remplie (un seul radiateur 22 de 300 × 800 mm, soit 769 W) est comparée aux 9,6 kW de la maison par défaut. Le panneau de résultat affiche « 0,8 kW de radiateurs (à 70 °C) : il faut une eau à 374 °C environ par grand froid » et le verdict « trop justes ». Googlebot exécute le JS : ce texte peut aussi être indexé.
- **Preuve** : tableau ci-dessus, ligne « État au chargement ».
- **Correction** : ne pas créer de ligne au chargement. On garde l'état vide « Ajoutez vos radiateurs… » ; le clic sur « Ajouter » crée la première ligne et lui donne le focus.
  - Si une ligne pré-remplie est voulue, prendre une hauteur représentative (600 mm), avec un « Nombre » vide et sans verdict tant que l'utilisateur n'a rien saisi.
  - B2 s'applique dans tous les cas.

### B2. Pas de garde-fou : températures absurdes, verdict faux si l'utilisateur ne déclare qu'une partie des radiateurs
- **Où** :
  - `dimensionnement-pompe-a-chaleur.astro:280-286` (calcul et affichage de `tDepart` sans borne) ;
  - `:74-77` (consigne de saisie) ;
  - `:151` (avertissement « toute la maison », placé loin, sous l'outil).
- **Problème** :
  1. Le script compare les déperditions de **toute** la surface saisie à la somme des radiateurs **déclarés**. Si l'utilisateur ne décrit que son séjour, par exemple trois radiateurs sur huit, ou si une partie de la maison est chauffée autrement (poêle, plancher chauffant, sèche-serviettes électrique), le départ calculé est très surestimé et le verdict est faux.
  2. Il affiche sans broncher « eau à 115 °C » (cas b) ou « 87 °C » (cas c). C'est impossible, et c'est même au-dessus du régime nominal de 75 °C de ces radiateurs : la maison ne serait donc pas chauffée aujourd'hui avec la chaudière.
- **Preuve** : cas (b) et (c) ci-dessus. Le verdict « Vos radiateurs sont trop justes… On les complète, ou on isole d'abord la maison » s'affiche alors comme s'il était fiable.
- **Correction** :
  - Ajouter à `data/thermique.ts` une constante sourcée : `departNominal: 75`, régime 75/65/20 de l'EN 442 (`sourcesThermique.radiateurs`, déjà cité).
  - Dans `update()` :
    ```ts
    if (tDepart > pac.departNominal) {
      out('rads').textContent = `${fmt(p50 / 1000)} kW de radiateurs déclarés pour un besoin estimé à ${fmt(kw)} kW : il faudrait une eau à plus de ${pac.departNominal} °C.`;
      out('verdict').textContent = 'C’est plus que la température pour laquelle vos radiateurs sont prévus. Avez-vous bien déclaré tous les radiateurs de la maison ? Si oui, notre estimation des déperditions est sans doute trop forte pour votre maison (travaux déjà faits, pièces chauffées autrement) : l’étude sur place le vérifiera.';
    }
    ```
  - Remplacer la consigne `:74-77` par : « Déclarez **tous** les radiateurs de la maison, avec le nombre d'exemplaires identiques. Si une partie de la maison est chauffée autrement, indiquez seulement la surface chauffée par ces radiateurs. »
  - Ajouter un indice (hint) sous « Surface chauffée » (`Field` accepte `hint`) : « surface chauffée par vos radiateurs à eau ».

---

## IMPORTANT

### I1. Seuils 55-65 °C et « au-delà de 65 °C » : la source est détournée et la règle métier inexacte
- **Où** :
  - `src/data/thermique.ts:205-213` (niveau « De 55 à 65 °C » et `verdictInsuffisant`) ;
  - `research/donnees-outils.md` §8d.
- **Problème** :
  - Les seuils de 35 et 55 °C sont bien sourcés : règlement 813/2013, annexe I, définitions « low-temperature application » et « medium-temperature application », départ à 35 et 55 °C. J'ai relu le texte sur legislation.gov.uk.
  - En revanche, la limite de 65 °C provient de la méthode 3CL : « Réseau individuel eau chaude haute température (≥ 65°C) ». C'est une **classe de réseau de distribution** (pertes de distribution du DPE), pas la limite de ce que produit une PAC.
  - Côté métier, une PAC dite « haute température » se vend justement pour des départs **au-delà** de 65 °C (souvent jusqu'à 70-75 °C, selon les fiches fabricants ; non sourcé dans la recherche). Écrire « il faudrait de l'eau à plus de 65 °C » pour dire « trop juste pour une pompe à chaleur » est donc faux.
  - Inversement, « de 55 à 65 °C, il faut une PAC haute température » est trop affirmatif : beaucoup de PAC moyenne température dépassent 55 °C, avec une puissance et un COP réduits. Ce point n'est pas sourcé non plus.
- **Correction** :
  - Ne chiffrer que ce qui est sourcé, avec des formulations prudentes :
    - ≤ 35 °C : inchangé.
    - 35-55 °C : « Vos radiateurs conviennent à une pompe à chaleur air/eau en moyenne température (55 °C, le régime de référence européen). »
    - 55-75 °C : « Il faut une eau plus chaude que le régime de référence de 55 °C : soit une pompe à chaleur capable de produire cette température (haute température), au prix d'un rendement plus faible, soit le remplacement des radiateurs les plus justes, ou une meilleure isolation. Nous comparons les deux lors de l'étude. »
    - Au-delà de 75 °C : message B2.
  - Dans le commentaire de la donnée, garder la référence 3CL uniquement pour dire que le DPE classe ces réseaux « haute température », pas comme limite de la PAC.

### I2. FAQ « test de la chaudière à 55 °C » : trop indulgent, sauf s'il fait vraiment −9,5 °C
- **Où** : `dimensionnement-pompe-a-chaleur.astro:35-36`.
- **Problème** : le besoin de chauffage diminue avec la température extérieure. Avec le modèle même de l'outil (n = 1,3, écart de 10 K), une maison qui demande 55 °C de départ par −9,5 °C n'a besoin que de :

  | Dehors | Charge | Départ équivalent |
  |---|---|---|
  | −5 °C | 84 % | 51 °C |
  | 0 °C | 67 % | 47 °C |
  | +3 °C | 56 % | 44 °C |
  | +5 °C | 49 % | 42 °C |
  | +8 °C | 39 % | 39 °C |

  « Par temps froid » dans le Nord, cela veut souvent dire de 0 à +5 °C. Calcul : une maison qui demande **70 °C** au point de base reste confortable à 55 °C de départ quand il fait +3 °C dehors. Le test valide donc à tort des radiateurs trop justes. De plus, faire tourner quelques jours une vieille chaudière **non à condensation** avec une eau de retour basse peut la faire condenser ; cette mise en garde vient de la pratique métier, pas d'une source citée, donc à formuler prudemment.
- **Correction** : remplacer par une version qui dépend de la température extérieure, avec des chiffres issus du calcul de l'outil :
  > « Un test simple : un jour où il fait environ 0 °C dehors, réglez la température de départ de votre chaudière vers 47 °C (vers 44 °C s'il fait +3 °C). Si la maison reste confortable, vos radiateurs devraient permettre de chauffer avec une eau à 55 °C par grand froid. Si certaines pièces deviennent fraîches, leurs radiateurs sont à surveiller. Demandez conseil avant de baisser la température d'une ancienne chaudière non à condensation. »

  Générer ces valeurs au build à partir de `puissanceRadiateur` et `climat`, sans les écrire en dur.

### I3. Le chiffre affiché en kW n'est pas la puissance « catalogue » de la PAC ; appoint et bivalence ne sont pas évoqués
- **Où** :
  - `dimensionnement-pompe-a-chaleur.astro:45` (H1 « Quelle pompe à chaleur ») ;
  - `:89` (« Puissance de chauffage par -9,5 °C ») ;
  - `:23-24` (FAQ « Quelle puissance de pompe à chaleur pour 100 m² ? » répondue en déperditions).
- **Problème** : un particulier lira « 9,6 kW » comme la puissance de la PAC à acheter. Or la puissance commerciale est souvent annoncée à +7 °C dehors et 35 °C d'eau. Par −10 °C et 55 °C, la même machine fournit nettement moins. Rien ne parle non plus de la résistance d'appoint, ni du fait qu'on ne couvre pas forcément 100 % du besoin au point de base. Les concurrents en parlent (calculpro.fr : point de bivalence, appoint ; pompe-a-chaleur-info.fr : couverture de 80 à 120 %).
- **Source exploitable** (vérifiée), règlement 813/2013, annexe I :
  - définition (37) : la « design load for heating » (Pdesignh) est la puissance thermique nominale **Prated** de la PAC **à la température de conception de référence** ;
  - annexe III, tableau 4 : Tdesignh = **−10 °C** pour le climat moyen.

  La fiche produit ErP donne donc Prated, en climat moyen et en moyenne température : c'est directement comparable au chiffre de l'outil (calculé par −9,5 °C).
- **Correction** :
  - Libellé `:89` : « Puissance à fournir par −9,5 °C ».
  - Ajouter sous le chiffre, ou dans la FAQ 100 m² :
    > « À comparer à la puissance thermique nominale (Prated) indiquée sur la fiche produit européenne de la pompe à chaleur, en climat moyen et à la température d'eau nécessaire (55 °C pour des radiateurs) : elle est calculée par −10 °C. Une résistance d'appoint peut compléter la pompe à chaleur les jours les plus froids ; la répartition se décide lors de l'étude. »
  - Ne pas écrire de règle « 80 à 120 % » : elle ne se trouve que dans des sources secondaires.

### I4. Écart départ/retour de 10 K : la justification n'est pas la bonne, alors qu'une source primaire existe
- **Où** : `src/data/thermique.ts:190-191` (« celui du régime nominal des radiateurs (75/65 °C) ») ; `dimensionnement-pompe-a-chaleur.astro:282`.
- **Problème** : le régime d'essai des radiateurs ne dit rien du fonctionnement d'une PAC. Le règlement 813/2013, annexe III, tableau 3 (conditions nominales des PAC air/eau, relu sur legislation.gov.uk) donne :
  - entrée/sortie **47/55 °C** (écart de **8 K**) en moyenne température ;
  - **30/35 °C** (écart de **5 K**) en basse température.
- **Effet sur le verdict** : à température moyenne égale, le départ affiché baisse de 1 K avec 8 K, et de 2,5 K avec 5 K. Dans le cas (a), le départ passe de 72,6 à 71,6 °C (8 K) ou à 70,1 °C (5 K). Le verdict ne change pas ici, mais il bascule pour les cas proches d'un seuil : avec 10 K, il faut 1,94 fois le besoin pour 55 °C ; avec 8 K, 1,86 fois.
- **Correction** : `ecartDepartRetour: 8`, avec le commentaire « conditions nominales des PAC air/eau en moyenne température, entrée 47 °C / sortie 55 °C, règlement 813/2013, annexe III, tableau 3 ». Ou bien garder 10 K en l'assumant comme hypothèse prudente, dans le code et dans le texte (« avec un écart de 10 °C entre départ et retour, hypothèse prudente »).

### I5. Radiateurs en fonte : la marge d'erreur va de −30 à +40 %, sans avertissement
- **Où** : `src/data/thermique.ts:182-183` ; `dimensionnement-pompe-a-chaleur.astro:116-122`.
- **Problème** :
  - Les hauteurs proposées (430 / 580 / 680 / 980 mm) sont celles de Viadrus (fabricant tchèque). Les fontes françaises courantes, de type Idéal Classic (`research/donnees-outils.md` §8c), mesurent 46 / 61 / 76 / 92 cm.
  - Exemple : un radiateur de 76 cm doit être saisi en 680 mm (110 W) ou en 980 mm (152 W). L'erreur va de −28 % à +36 % selon le choix.
  - Le nombre de colonnes pèse autant. Pour Idéal Classic en 76 cm, une fonte à 4 colonnes donne 112 W et une à 6 colonnes 167 W, soit +49 %. La ligne « épais (environ 16 cm) » sous-estime donc d'environ 30 % les fontes à 5-6 colonnes, qui sont fréquentes dans les maisons d'avant 1975 de la région.
- **Correction** :
  - Ajouter une catégorie « Fonte, très épais (environ 22 cm, 5 à 6 colonnes) » : Viadrus 580 × 220 mm = 120 W (B) et Idéal Classic 6 colonnes (C, à signaler comme tel).
  - Ou au minimum un indice sous la ligne : « Les radiateurs en fonte varient beaucoup selon leur épaisseur et leur nombre de colonnes : choisissez la hauteur la plus proche, en dessous par prudence, ou indiquez la puissance si vous la connaissez. »
  - Pour l'acier, proposer aussi 500 et 700 mm : à extraire du même catalogue Purmo si ces hauteurs y figurent, ou à interpoler en le signalant.

### I6. « Puissance connue » : risque de saisir une puissance d'ancienne notice à ΔT 60
- **Où** : `dimensionnement-pompe-a-chaleur.astro:75-77` et `:264`.
- **Problème** : l'outil suppose que la puissance saisie est celle de l'EN 442 (75/65/20). Une notice ancienne, ou un catalogue qui annonce 90/70/20 (ΔT 60), donne une valeur supérieure de (60/50)^1,3 = **1,27**. L'outil surestime alors ces radiateurs de 27 %.
- **Correction** : indice sous le champ, conditionnel (aucun fait inventé) :
  > « Puissance pour une eau à 75/65 °C (ΔT 50). Si votre notice indique 90/70 °C (ΔT 60), divisez-la par 1,27. »

  Le facteur 1,27 vient de la formule EN 442 déjà sourcée.

### I7. Unités mélangées (hauteur en mm, longueur en cm) : risque d'erreur d'un facteur 10
- **Où** : `dimensionnement-pompe-a-chaleur.astro:117` (« 600 mm ») et `:121-122` (« Longueur (cm) »).
- **Problème** : un utilisateur qui lit « 600 × 1000 » sur son radiateur saisira 1000 dans le champ en cm. Le radiateur compte alors 10 m, et le résultat devient « Excellent ».
- **Correction** : afficher les deux en cm (« 60 cm ») ou les deux en mm. Ajouter un garde-fou : si la longueur dépasse 300 cm, afficher un indice « Longueur en cm : 1 000 mm = 100 cm » sous le champ.

### I8. Verdict très sensible à l'estimation G, présenté comme certain
- **Où** : `dimensionnement-pompe-a-chaleur.astro:284-285` ; `src/data/thermique.ts:109-116`.
- **Problème** :
  - Le cas (a), une maison de 1980 avec 10,3 kW de radiateurs acier type 22, ce qui est un équipement courant, voire généreux, est jugé « trop juste ».
  - G vient des valeurs par défaut de la méthode 3CL (U de murs, de vitrages et débits d'air prudents) et ne tient pas compte des travaux déjà faits (fenêtres, combles).
  - Même avec des déperditions inférieures de 20 %, le cas (a) demande 65 °C, et 61 °C avec 30 % de moins.
  - L'outil conclura donc le plus souvent à « PAC haute température » ou « trop justes », alors que la FAQ dit « Souvent, oui ».
- **Correction** : conserver le calcul, mais :
  - formuler « d'après notre estimation des déperditions » ;
  - afficher une fourchette, par exemple « si votre maison perd 20 % de moins (combles ou fenêtres refaits) : X °C » (calcul simple, sans chiffre inventé, à présenter comme une sensibilité) ;
  - renvoyer au test de I2 comme vérification sur place.

### I9. SEO : « fonte » absent du contenu indexable ; H1, title et maillage à renforcer
- **Où** :
  - `dimensionnement-pompe-a-chaleur.astro:43-46` (title, description, H1) ;
  - `:106-132` (les options « Fonte » sont dans un `<template>`, contenu inerte, non rendu au chargement) ;
  - `src/content/conseils/pompe-a-chaleur-air-eau-ou-air-air.md:66-69`.
- **Preuve** : dans le HTML servi, hors `<template>` et `<script>`, le mot « fonte » n'apparaît qu'une seule fois, dans la liste des sources. On trouve 0 occurrence de « appoint », « bivalence » ou « Prated », et une seule de « existants ». Le H1 ne contient ni « puissance », ni « air/eau », ni « radiateurs existants ». Les guides PAC et « remplacer chaudière fioul » ne lient pas l'outil ; seules les pages `/pompes-a-chaleur/` et `/chaudieres/` le font, via RelatedTools.
- **Correction** :
  - Title : « Puissance de pompe à chaleur air/eau et radiateurs : calcul » (environ 60 caractères avec la marque, à vérifier).
  - H1 : « Pompe à chaleur air/eau : quelle puissance, et vos radiateurs suffisent-ils ? »
  - Description : citer « radiateurs en fonte ou en acier existants ».
  - Ajouter une FAQ « Peut-on mettre une pompe à chaleur avec des radiateurs en fonte ? ». Leur grande inertie ne change pas la puissance émise ; tout dépend de leur taille : réponse avec le tableau des pourcentages et I5.
  - Ajouter un paragraphe sur le dimensionnement d'une PAC air/eau (I3).
  - Lien depuis le guide PAC, ligne 69 (« après vérification de la puissance des radiateurs ») vers l'outil, et depuis le guide « remplacer chaudière fioul ».
  - Repères concurrents, sans les copier :
    - calculpro.fr/outils/chauffage/dimensionnement-pac-air-eau : point de bivalence, appoint, ballon tampon, écart de 5 K ;
    - pompe-a-chaleur-info.fr/simulateur : couverture et appoint ;
    - quelleenergie.fr : contenu long sur la puissance au m².

    Aucun ne vérifie les radiateurs ligne par ligne : c'est un vrai différenciateur, à mettre en avant dans le lead.

---

## MINEUR

- **M1 (19 °C contre 20 °C)**, `src/data/thermique.ts:94` et `:176`.
  - Les déperditions sont calculées à 19 °C (3CL) et l'émission des radiateurs pour une pièce à 20 °C : l'incohérence vaut **+1 K** sur le départ affiché (cas a : 72,6 contre 71,6 °C). L'erreur va dans le sens prudent.
  - Calculer les déperditions à 20 °C ajouterait 3,5 % au besoin (environ +0,9 K sur la moyenne à 55 °C).
  - Correction : soit `tAmbiante: climat.tInterieure` (cohérent, sourcé), soit garder 20 °C avec le commentaire « par prudence : pièces de vie à 20 °C, salle de bains plus chaude ».
- **M2 (moyenne arithmétique contre écart logarithmique)**, `src/lib/thermique.ts:25-26`. Avec un écart de 10 K, la moyenne arithmétique surestime la puissance émise de :
  - 1,2 % pour un départ à 55 °C (c = 0,71, seuil EN 442 respecté) ;
  - 2,8 % à 45 °C (c = 0,60) ;
  - 13 % à 35 °C (c = 0,33).

  En température de départ, l'écart avec une résolution exacte (bisection sur l'écart logarithmique, ΔT nominal 49,83 K) reste ≤ 0,4 K entre 45 et 65 °C. Acceptable ; le noter en commentaire. Avec un écart de 5 ou 8 K (I4), l'erreur devient négligeable.
- **M3 (tableau « Eau » ambigu)**, `dimensionnement-pompe-a-chaleur.astro:183-197`. Le tableau donne la température **moyenne**, mais les seuils et la FAQ parlent de **départ**. La ligne « 55 °C : 63 % » correspond à un départ de 60 °C. En-tête à remplacer par « Eau (moyenne) », avec une colonne « Départ (écart de 10 °C) ».
- **M4 (changement de type)**, `:248-251`. La taille est réinitialisée même quand le mode de mesure ne change pas : passer de l'acier 22 à l'acier 11 efface une longueur de 120 cm. Ne réinitialiser que si `mesure` change.
- **M5 (grille de ligne)**, `:107`.
  - En « Puissance connue », la colonne Hauteur masquée décale les cellules de la grille `sm:grid-cols-[1.6fr_1fr_1fr_0.8fr_auto]` : la puissance tombe sous « Hauteur » des autres lignes. Utiliser `invisible` au lieu de `hidden`, ou des positions explicites (`sm:col-start-*`).
  - De 640 à 767 px, et à `lg` dans la colonne de gauche (environ 480 px utiles), le select « Acier, 2 panneaux, 1 rang d'ailettes (type 21) » est tronqué. Raccourcir les libellés (« Acier type 21 ») ou passer à `sm:grid-cols-2 md:grid-cols-[…]`.
  - Sur mobile (`grid-cols-2`, Type sur deux colonnes), le rendu est correct.
- **M6 (accessibilité)**, `:107-131`, `:244-247`, `:87`.
  - Toutes les lignes portent les mêmes noms (« Type », « Nombre », « Retirer ce radiateur ») : numéroter (`aria-label="Retirer le radiateur 2"`, `<li aria-label="Radiateur 2">`).
  - Après une suppression, le focus est perdu (l'élément est retiré) : le déplacer vers la ligne suivante ou vers le bouton « Ajouter ».
  - `aria-live="polite"` sur tout le panneau, CTA compris, déclenche une annonce à chaque frappe : restreindre aux `data-out="rads"` et `"verdict"`.
- **M7 (lignes incomplètes)**, `:287-289`. Quand des lignes existent mais sont invalides (longueur vide ou à 0), le message reste « Ajoutez vos radiateurs », ce qui est trompeur. Afficher plutôt « Complétez la longueur et le nombre ».
- **M8 (saisie de la surface)**, `:273`. La surface invalide fait sortir de la fonction sans rien effacer, donc le résultat précédent reste affiché. `max=600` n'est pas appliqué : 10 000 m² donne 962 kW. Borner, ou afficher un message.
- **M9 (signe moins)**. `fmt(-9.5)` produit « -9,5 » avec un trait d'union, visible dans le HTML. Utiliser le vrai signe moins (U+2212) dans `fmt` pour les négatifs, ou dans le gabarit.
- **M10 (textes des niveaux)**, `src/data/thermique.ts:196` et `:202`. « Régime de référence des PAC **sur plancher chauffant** » et « **sur radiateurs** » : le règlement 813/2013 parle d'« application basse / moyenne température », sans viser d'émetteur. Écrire « la basse température (35 °C), adaptée au plancher chauffant », sans l'attribuer au règlement. Ajouter aussi à la liste `:147-149` un 4e item « Au-delà », aujourd'hui absent.
- **M11 (lien de contact)**, `:279-291`. Le lien est compatible avec `ContactForm.astro:346-388` : `projet=pac` coche « Pompe à chaleur » ; `surface` est arrondie à la dizaine et bornée entre 20 et 300 m² ; `note` est copiée dans `#message`, tronquée à 1 000 caractères. Suggestion : ajouter à la note l'époque d'isolation (libellé) et la liste des radiateurs (« 6 × acier 22, 600 × 100 cm »), utile au technicien. Ne pas y reporter un départ supérieur à 75 °C (B2).
- **M12 (sans JavaScript)**. Le bouton « Ajouter un radiateur » s'affiche mais ne fait rien. Le masquer sans JS (attribut `hidden` retiré par le script).

---

## SUGGESTIONS

- Afficher le ratio « radiateurs / besoin » (par exemple « vos radiateurs : 1,07 fois le besoin ; il en faudrait 1,9 fois pour 55 °C »). Le repère est parlant et se calcule sans chiffre ajouté.
- Mode pièce par pièce optionnel, plus tard. L'avertissement `:151` (« une pièce peut manquer de radiateur ») est juste, mais il arrive après l'outil : le remonter sous le verdict.
- Eau chaude sanitaire : préciser que la puissance affichée ne couvre que le chauffage.
- Note dans le code : n vaut 1,3 pour tous les modèles, alors que Purmo donne de 1,28 à 1,36. L'écart vaut environ 3 % de puissance à 50 °C de moyenne : négligeable.
- Mise à l'échelle linéaire des W/m Purmo selon la longueur : correcte, le catalogue publie des puissances proportionnelles à la longueur. L'incertitude réelle vient des autres marques (Finimetal, Chappée, etc.) : ±10 % est un ordre de grandeur non sourcé, donc à formuler sans chiffre (« les radiateurs d'autres marques peuvent différer un peu »).

## Sources vérifiées pendant la revue

- Règlement (UE) 813/2013 :
  - annexe I, définitions (37) Pdesignh = Prated à la température de conception, (39) Tbiv, applications 35 et 55 °C : https://www.legislation.gov.uk/eur/2013/813/annex/I/adopted
  - annexe III, tableau 3, conditions nominales air/eau 47/55 et 30/35 °C ; tableau 4, Tdesignh −10 °C : https://www.legislation.gov.uk/eur/2013/813/annex/III/adopted
- Concurrents consultés :
  - https://calculpro.fr/outils/chauffage/dimensionnement-pac-air-eau
  - https://pompe-a-chaleur-info.fr/simulateur/
  - https://www.quelleenergie.fr/pompe-a-chaleur/puissance

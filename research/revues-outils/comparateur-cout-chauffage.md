# Revue : /outils/comparateur-cout-chauffage/

Relecture du 1er octobre 2026. Aucun fichier du projet n'a été modifié.

Fichiers relus : `src/pages/outils/comparateur-cout-chauffage.astro`, `src/lib/thermique.ts`, `src/data/thermique.ts`, `src/layouts/OutilLayout.astro`, `src/components/outils/{Field,Choices}.astro`, `src/components/ContactForm.astro`, `src/data/outils.ts`, `research/donnees-outils.md`, `research/coefficient-g-3cl.md`.

Sources primaires relues pour cette revue : le PDF 3CL (annexe 1 de l'arrêté du 31/03/2021, § 12, 13.1 et 13.2) et le bulletin CEEB du 2e trimestre 2026, tous deux téléchargés et passés dans pdftotext. Les calculs ont été refaits en Python (`calc.py` et `rg3cl.py` dans le scratchpad).

---

## Verdict global

**À corriger avant publication.**

- **Ce qui est juste :**
  - L'arithmétique est exacte. Les valeurs calculées au build et celles du navigateur sont identiques.
  - Le tableau et la FAQ correspondent aux calculs.
  - Les prix sont bien sourcés.
  - L'exclusion des abonnements est dite clairement.
- **Ce qui pose problème :**
  - La comparaison mélange des rendements de natures différentes. Les écarts favorisent les produits vendus par FK (PAC air/air, chaudière à granulés, poêles) et pénalisent le gaz et l'électrique.
  - La phrase d'économie met en avant une PAC air/air face à un chauffage central de toute la maison. C'est trompeur pour un installateur qui vend ce produit.
  - Un bug de changement d'unité affiche des factures absurdes. Exemple : 770 000 €.
  - L'affichage des prix CEEB pose une question de droits.

---

## 1. Vérification chiffrée (justesse)

### (a) Mode « maison » par défaut (100 m², 2,5 m, 1975-1988)

- H = 100 × 2,5 × 1,35 = 337,5 W/K
- Besoin = 337,5 × 2 592,6 × 24 / 1000 = **21 000 kWh/an**. La page affiche « 21 000 kWh ». Exact.

| Système | Rendement | c€/kWh utile (calcul) | Tableau | Coût/an (calcul) | Affiché |
|---|---|---|---|---|---|
| PAC air/air | 3,8 | 5,27 | 5,3 | 1 105,8 € | 1 110 € |
| PAC air/eau | 2,8 | 7,15 | 7,1 | 1 500,8 € | 1 500 € |
| Poêle à bois | 0,75 | 7,75 | 7,7 | 1 626,7 € | 1 630 € |
| Chaudière granulés (vrac) | 0,94 | 8,97 | **9** | 1 884,4 € | 1 880 € |
| Poêle à granulés (sacs) | 0,87 | 9,62 | 9,6 | 2 020,2 € | 2 020 € |
| Gaz à condensation | 0,95 | 17,01 | 17 | 3 572,6 € | 3 570 € |
| Fioul | 0,87 | 19,37 | 19,4 | 4 067,4 € | 4 070 € |
| Radiateurs électriques | 1 | 20,01 | **20** | 4 202,1 € | 4 200 € |

- La FAQ « Combien économise-t-on… » annonce 4 070, 1 880 et 1 500 €. Conforme.
- Le message par défaut annonce 4 067 − 1 106 = **2 960 €** (fioul → PAC air/air).
- Le besoin de 21 000 kWh équivaut à environ 2 420 L de fioul, 16,7 stères en poêle à bois ou 5,2 t de granulés en poêle.

### (b) Mode « consommation »

Méthode : besoin = quantité × PCI × rendement actuel, puis coût = besoin / (PCI × rendement) × prix. Les montants sont arrondis à la dizaine.

| Cas | Besoin | PAC air/air | PAC air/eau | Poêle bois | Ch. granulés | Poêle granulés | Gaz | Fioul | Élec. | Message |
|---|---|---|---|---|---|---|---|---|---|---|
| 2 000 L fioul | 17 348 | 910 | 1 240 | 1 340 | 1 560 | 1 670 | 2 950 | **3 360** | 3 470 | PAC air/air : économie 2 450 € |
| 15 000 kWh PCS gaz | 12 838 | 680 | 920 | 990 | 1 150 | 1 240 | **2 180** | 2 490 | 2 570 | PAC air/air : économie 1 510 € |
| 1,5 t granulés (poêle) | 6 003 | 320 | 430 | 460 | 540 | **580** | 1 020 | 1 160 | 1 200 | PAC air/air : économie 260 € |
| 8 stères (poêle bois) | 10 080 | 530 | 720 | **780** | 900 | 970 | 1 710 | 1 950 | 2 020 | PAC air/air : économie 250 € |

- Le coût de l'énergie actuelle est toujours égal à quantité × prix (2 000 × 1,68 = 3 360 €). Correct.
- Le gaz (PCS ÷ 1,11) est bien traité.
- Le code (L.221-232) fait exactement ce calcul.

---

## 2. Constats

### BLOQUANT

#### B1. Les rendements comparés ne sont pas de même nature, et les écarts favorisent les produits FK

Références : `src/data/thermique.ts:150-168` et `:129-132`, `comparateur-cout-chauffage.astro:143-146`.

**Problème.** Le texte affirme : « Les rendements sont ceux de la méthode officielle du DPE pour des appareils récents ». C'est inexact, pour quatre raisons.

1. **Chaudières : rendement à pleine charge au lieu du rendement saisonnier.** Le code utilise Rpn, le rendement à pleine charge. Le DPE n'utilise jamais Rpn seul : il calcule un rendement annuel de génération Rg à partir de Rpn, Rpint, QP0 et d'un profil de charge (3CL § 13.2.1 à 13.2.4). Or l'écart entre Rpn et Rpint va dans des sens opposés selon les chaudières :
   - gaz à condensation : Rpint = 103 + 2,5 log 20 ≈ **106 % PCI**, contre Rpn 94,9 % ;
   - fioul classique : Rpint = 80 + 3 log 20 ≈ 83,9 %, contre Rpn 86,6 % ;
   - granulés après 2019 : Rpint = 88 + 2 log 20 ≈ 90,6 %, contre Rpn 93,6 % (3CL § 13.2.2.3).

   J'ai recalculé Rg avec la méthode 3CL pour la maison par défaut (GV 337,5 W/K, Pn 20 kW, émetteurs 1981-2000) :
   - **fioul classique 1981-90 : 0,81** (0,79 si QP0 = 2 %, 0,73-0,75 avant 1970) ;
   - **gaz à condensation depuis 2016 : 1,03 à 1,04** ;
   - **chaudière granulés après 2019 : 0,84 à 0,90**, selon l'unité de QP0 = 0,085·Pn·Pn^-0,4 (à confirmer).

   Le choix de Rpn sous-estime donc le gaz d'environ 8 %, qui n'est pas vendu par FK. Il flatte la chaudière à granulés, vendue par FK, de 4 à 12 %.
2. **PAC : deux sources différentes.** Pour l'air/eau, le SCOP de 2,8 est la valeur par défaut 3CL. Pour l'air/air, 3,8 est le minimum réglementaire (UE 206/2012), mesuré en climat moyen. Or le même tableau 3CL (§ 12.4.2, zones H1-H2) donne **3,0** pour une PAC air/air installée depuis 2015. Le choix de 3,8 flatte la PAC air/air de **27 %**, et c'est elle qui sort toujours en tête.
3. **Poêles et pertes d'installation.** Les poêles reçoivent Rg, un rendement de génération, alors que les chaudières reçoivent Rpn. Les pertes d'installation sont ignorées partout, mais elles ne sont pas symétriques (3CL § 12.1 à 12.3) :

   | Système | Re × Rd × Rr |
   |---|---|
   | Chauffage central à eau | 0,95 × 0,92 × 0,95 = **0,83** |
   | PAC air/eau | ≈ 0,86 |
   | PAC air/air (Rd = 1, fluide frigorigène) | ≈ 0,91 |
   | Panneau électrique | 0,97 × 0,99 = **0,96** |
   | Poêle (Rr « Poêle … ou insert » = 0,8) | 0,95 × 0,8 = **0,76** |

   En les ignorant, on flatte les poêles d'environ 9 % face au chauffage central et de 26 % face à l'électrique.
4. **Effet sur le classement.** Avec des rendements 3CL saisonniers (générateur seul : fioul 0,81, gaz 1,03, granulés 0,87, air/air 3,0) :
   - le fioul passe de 19,4 à **20,8 c€/kWh** et devient plus cher que l'électrique (20,0) ;
   - le gaz passe de 17,0 à **15,7** ;
   - la PAC air/air passe de 5,3 à **6,7** ;
   - la chaudière à granulés passe de 9,0 à **9,7**. Elle devient plus chère que le poêle à granulés (9,6).

**Point sur le fioul à 0,87 (vieille chaudière).** Ce rendement est trop flatteur. L'effet reste prudent pour les économies annoncées :
- En mode maison, le coût du fioul est sous-estimé d'environ 7 % (4 070 € contre 4 370 € avec 0,81).
- En mode consommation, le besoin est surestimé de 7 %, donc les coûts des autres systèmes aussi. Pour 2 000 L, l'économie vers la PAC air/eau passe de 2 120 € à 2 206 € avec 0,81.

Ce n'est pas un biais commercial. Mais le texte « appareils récents » est faux pour une chaudière fioul, interdite à l'installation depuis juillet 2022.

**Correction proposée.** Il faut un seul référentiel, et le dire.

- **Option A, minimale et cohérente** (générateur seul, 3CL saisonnier) :
  - fioul 0,81 (classique, 20 kW, 1981-2015) ;
  - gaz à condensation 1,03 ;
  - chaudière granulés 0,87 (à recalculer après vérification de l'unité de QP0) ;
  - PAC air/eau 2,8 ;
  - **PAC air/air 3,0** ;
  - poêles 0,87 et 0,75.

  Mettre la source « 3CL § 13.2.4 / 12.4.2 » en commentaire dans `systemes`.
- **Option B, plus juste** : multiplier par Re × Rd × Rr (3CL § 12) pour tous les systèmes, avec les valeurs du tableau ci-dessus. Il faut alors recaler le besoin du mode maison : avec la chaîne complète, le fioul monte à 5 260 €/an, soit environ 3 100 L pour 100 m², ce qui semble élevé.
- **Mieux encore :** ajouter un choix « âge de la chaudière actuelle » qui reprend les tableaux 3CL du fioul (avant 1970, 1970-1990, basse température, condensation).
- **Remplacer le texte L.143-146** par une description exacte. Proposition : « rendements annuels conventionnels de la méthode du DPE (3CL) ; pertes du réseau de chauffage non comptées ».

#### B2. La phrase d'économie et le choix du « meilleur » système sont trompeurs

Référence : `comparateur-cout-chauffage.astro:248-254`.

**Problème.** `meilleur = couts.find(c => c.s.fk)` retient le système FK le moins cher, quel que soit l'usage. Aux prix par défaut, c'est **toujours la PAC air/air**, avec le SCOP de 3,8 contesté en B1. Exemples :

- Fioul 2 000 L : « Par rapport à votre chauffage actuel, pompe à chaleur air/air ferait économiser environ **2 450 €** par an d'énergie ». Or une PAC air/air ne produit pas l'eau chaude sanitaire. Elle ne chauffe toute la maison qu'en multi-split, et ne remplace pas un chauffage central à radiateurs. De plus, la consommation de fioul saisie inclut souvent l'eau chaude (voir I4). L'économie réaliste à proposer est celle d'une PAC air/eau ou d'une chaudière à granulés : 2 120 € ou 1 800 €.
- Chauffage actuel = PAC air/eau (5 000 kWh) : la page conseille une PAC air/air, « économie 260 € ». C'est absurde.
- Chauffage actuel = poêle à bois (8 stères) : la page conseille de remplacer le poêle par une PAC air/air (250 €).
- Si l'utilisateur baisse le prix du bois (par exemple 60 €/stère), le « meilleur » devient le poêle à bois, présenté comme remplaçant le chauffage de toute la maison.
- En mode maison, la référence est toujours le fioul, même si l'utilisateur se chauffe à l'électricité.

Pour un professionnel qui vend ces appareils, une économie chiffrée sans ces réserves expose à la qualification de pratique commerciale trompeuse (code de la consommation, art. L121-2). Elle contredit aussi la règle du projet : ne pas promettre.

**Correction proposée.**
- Ne comparer que des systèmes interchangeables :
  - chauffage actuel central (fioul, gaz, chaudière granulés, PAC air/eau) → meilleur parmi PAC air/eau et chaudière à granulés ;
  - électrique ou poêle → tous les systèmes, en signalant « poêle et PAC air/air : chauffage de la pièce de vie ou appoint ».
- Ne pas afficher de message si le chauffage actuel est déjà un système FK de même famille.
- Formuler au conditionnel, avec un article et les réserves. Exemple : « Avec ces hypothèses, une pompe à chaleur air/eau coûterait environ 1 240 € d'énergie par an, soit environ 2 100 € de moins. Hors abonnement, entretien et installation. »
- En mode maison, laisser l'utilisateur choisir son chauffage actuel (le `select` existe déjà, il suffit de le sortir du bloc « conso »).

---

### IMPORTANT

#### I1. Changer de chauffage actuel garde la quantité : factures absurdes

Référence : `comparateur-cout-chauffage.astro:93, 217-222`.

**Problème.** Le libellé d'unité suit bien le choix (`uniteQuantite`, L.218), mais la valeur reste 2000. Si l'on passe de « Chaudière fioul » à « Poêle à granulés », le calcul porte sur 2 000 tonnes :
- besoin de 8 004 000 kWh ;
- liste de 421 470 € à 1 601 600 € ;
- « économie environ 348 530 € ».

Même chose avec le bois : 2 000 stères.

**Correction.** Ajouter une quantité type par système (`data-defaut` sur chaque `<option>`) et la réinjecter au `change` du select, si l'utilisateur n'a pas encore saisi de valeur. Valeurs : fioul 2 000 L, gaz 15 000 kWh, électricité 10 000 kWh, granulés 2 t, bois 8 stères. Ce sont des exemples de saisie, pas des statistiques : les présenter comme tels.

#### I2. Saisie vide, à 0 ou prix à 0 : résultat périmé ou faux, sans message

Références : `:228` et `:213-216`.

**Problème.**
- `if (!(besoin > 0)) return;` laisse affichés la liste, le besoin, le message et le lien du calcul précédent. Cela arrive avec une quantité vide, à 0 ou négative, une surface ou une hauteur vide, ou une virgule refusée par certains claviers mobiles.
- Un prix vidé ou à 0 reprend en silence le prix par défaut. C'est un cas réel : un ménage qui coupe son propre bois saisit 0 €/stère et voit quand même 97,6 € appliqués.

**Correction.**
- Si besoin ≤ 0 : vider la liste, afficher « Indiquez une consommation » et remettre le lien vers `/contact/`.
- Accepter un prix de 0 (`p >= 0` quand le champ n'est pas vide). Si le champ est vide, afficher le prix par défaut en placeholder pour que la valeur utilisée reste visible.

#### I3. Bois bûche : prix départ HT, unité ambiguë, droits de diffusion

Références : `src/data/thermique.ts:37-40, 145-146`, `:105` de la page.

**Problème.**
- **Prix départ.** Le CEEB précise : « Les prix s'entendent hors TVA, par camion départ » (bulletin 2026-T2, p. 1). Les 88,7 € HT sont donc un prix sans livraison. Le prix livré payé par un particulier est plus élevé : le coût du poêle à bois est sous-estimé.
- **Unité.** Le bulletin indique « 33-40cm (H1) stère » sans définir ce stère. S'il s'agit d'un stère de bûches de 1 m recoupées, le PCI conventionnel de 1 680 kWh/stère (arrêté de 2006) convient. S'il s'agit d'un m³ apparent de bûches de 33 cm, il contient environ 1/0,7 = 1,43 stère selon le FCBA (`bois.longueurs`). L'écart est d'environ 30 %.
- **Unité côté utilisateur.** Un particulier qui saisit « 8 stères » ne sait pas lequel il compte. L'ADEME retient d'ailleurs environ 1 500 kWh/stère (`research/donnees-outils.md` § 7b).
- **Droits.** Le bulletin porte trois fois la mention « Diffusion interdite sans l'autorisation expresse du CEEB ». La recherche le signale déjà (« À trancher »). La page affiche pourtant 97,6 €, nomme le CEEB et renvoie à son PDF. Même question pour la fiche Météo-France des DJU (2 593 affichés).

**Correction.**
- Demander l'autorisation du CEEB, ou prendre une source librement diffusable.
- Indiquer « prix départ, hors livraison ».
- Ajouter sous le champ quantité une aide : « 1 stère = 1 m³ de bûches de 1 m empilées ; en 33 cm, environ 0,7 m³ ». Mettre un lien vers `/outils/convertisseur-bois-stere/`.

#### I4. Eau chaude incluse dans la consommation de fioul ou de granulés

Référence : `:94`.

**Problème.** L'aide ne dit de retirer l'eau chaude que « pour l'électricité et le gaz ». Or les chaudières fioul et granulés produisent très souvent l'eau chaude sanitaire. Le besoin est alors surestimé, et donc l'économie face à un système qui ne fait pas d'eau chaude (PAC air/air, poêles).

**Correction.** Remplacer par : « Si votre chaudière produit aussi l'eau chaude, la consommation saisie l'inclut : le résultat est alors un peu surestimé ». Écrire cette phrase sans chiffre non sourcé. Ce point est lié à B2.

#### I5. Prix non datés près du résultat, fioul très volatil

Références : `:105, 134, 169`, description de la page.

**Problème.**
- Les dates ne figurent que dans le bloc replié « Modifier les prix ».
- Le tableau dit « aux prix par défaut » sans date, et la description dit « aux prix 2026 ».
- Le fioul retenu (1,68 €/L, SDES août 2026) est bien en dessous du relevé DGEC du 25/09/2026 : **1,9373 €/L** (`research/donnees-outils.md` § 5d). Un lecteur qui compare à sa dernière facture verra l'écart.
- Petite coquille L.105 : « gaz octobre 2026 (prix repère CRE) (kWh facturé) », avec deux parenthèses de suite.
- Les granulés sont attribués à « (CEEB) » par le `prixDate` du bois, alors que la source citée est Propellet.

**Correction.**
- Afficher sous le titre du résultat : « Prix moyens au 1er octobre 2026, hors abonnement ».
- Mettre la même mention dans un `<caption>` du tableau.
- Ajouter une phrase sur la volatilité du fioul, avec la fourchette sourcée : moyenne sur 12 mois 1,45 €/L, relevé de fin septembre 1,94 €/L.
- Utiliser `energies.granulesVrac.prixDate` pour les granulés.

#### I6. Phrases générées : articles manquants, et réponse FAQ fragile

Références : `:27` et `:253, 257`.

**Problème.**
- Le texte rendu, repris dans le JSON-LD `FAQPage`, dit : « …, pompe à chaleur air/air et pompe à chaleur air/eau produisent la chaleur la moins chère, autour de 5,3 à 7,1 centimes le kWh ». Les articles manquent.
- Même défaut dans « Par rapport au fioul, pompe à chaleur air/air ferait économiser… ».
- Le contenu de cette réponse repose sur le SCOP de 3,8 contesté en B1.
- Aucune précision (« hors abonnement… ») ne figure dans la phrase d'économie elle-même.

**Correction.** Ajouter un champ `article` (« la ») ou un `labelPhrase` (« la pompe à chaleur air/air ») dans `systemes`. Formuler par exemple : « Aux prix moyens d'octobre 2026, et pour l'énergie seule, la pompe à chaleur air/eau et le poêle à bois produisent la chaleur la moins chère… ».

#### I7. Accessibilité : unité absente du nom accessible, zone live trop bavarde

Références : `Field.astro:19-36`, `:110`.

**Problème.**
- L'unité (`<span>litre</span>`, qui change selon le système) n'est pas dans le nom accessible du champ. Un lecteur d'écran entend « Consommation pour le chauffage, par an », sans savoir s'il s'agit de litres, de tonnes ou de stères.
- Pour les prix, le nom accessible est seulement « Fioul » ou « Électricité », sans « € / litre ».
- L'aide `data-out="unite-hint"` n'est pas reliée par `aria-describedby`.
- `aria-live="polite"` porte sur tout le panneau : à chaque frappe, il annonce 8 lignes, le besoin, le message et le bouton.

**Correction.**
- Donner un `id` au span d'unité et l'ajouter à `aria-describedby`, ou mettre l'unité dans le `<label>` en `sr-only`.
- Placer `aria-live` sur une seule phrase de synthèse : « Besoin X kWh ; le moins cher : … ». Ajouter un délai d'environ 400 ms avant l'annonce.

#### I8. SEO : le H1 ne vise pas les requêtes, il manque des contenus que les concurrents ont

Références : `:46-49, 168`, `src/content/conseils/remplacer-chaudiere-fioul.md`.

**Constats.**
- Title : « Comparateur du coût de chauffage par énergie | FK Énergie », 57 caractères. Correct, mais sans « 2026 », « prix du kWh » ni ancrage local.
- H1 : « Combien coûte votre chauffage, et combien coûterait un autre ? ». Aucune des requêtes cibles n'y figure.
- La description ne mentionne ni le Nord ni le Pas-de-Calais.
- Le tableau des c€/kWh est indexable, ce qui est bien pour « prix kWh granulés vs électricité ». Mais il n'a pas de colonne « prix de l'énergie achetée » (c€/kWh PCI avant rendement).
- Le guide « Remplacer sa chaudière fioul » ne renvoie pas vers le comparateur. Le lien n'existe que dans l'autre sens.

**Comparaison avec des concurrents** (sans reprise de texte) :
- [7monenergie.fr/comparatif-energie](https://7monenergie.fr/comparatif-energie/) :
  - tableau prix achat → PCI → rendement → kWh utile ;
  - coût annuel avec abonnement et entretien ;
  - investissement et durée de vie, coût sur 10 ans ;
  - aides au 30/09/2026 ;
  - « duels » énergie contre énergie, profils, CO₂.
- [fournisseurs-electricite.com](https://www.fournisseurs-electricite.com/renovation-energetique/chauffage) :
  - classement de 8 modes ;
  - fourchettes d'installation ;
  - CO₂ ;
  - 6 questions de FAQ.
- D'autres guides chiffrent un cas « fioul → PAC » avec une date et une fourchette.

**Ce qui manque ici :** une colonne « prix de l'énergie », un bloc « abonnement et entretien » chiffré et sourcé (par exemple l'abonnement gaz du prix repère CRE, profil chauffage : 360,79 €/an, `research` § 5c), les émissions de CO₂, une section « PAC ou fioul : quelle économie ? » et un ancrage local.

**Correction.**
- H1 : « Comparateur du coût du chauffage : fioul, gaz, électricité, granulés, bois, PAC ».
- Garder la question actuelle en accroche.
- Title : « Coût du chauffage 2026 : comparatif des énergies | FK Énergie ».
- Description : ajouter « pour une maison du Nord et du Pas-de-Calais ».
- Ajouter une H2 « Pompe à chaleur ou fioul : quelle économie ? » avec le cas chiffré au build.
- Faire de chaque système du tableau un lien vers sa page produit.
- Ajouter le lien depuis le guide fioul.

---

### MINEUR

- **M1** `:184-185`, `lib/thermique.ts:36` : le tableau affiche « 9 » et « 20 » à côté de « 7,7 ». Utiliser `minimumFractionDigits: 1` pour cette colonne.
- **M2** `data/thermique.ts:139-146` : unités au singulier (« 2000 litre », « tonne », « stère »). Afficher « L », « t », « stères ». Pour les granulés, proposer aussi le nombre de sacs de 15 kg, que les particuliers connaissent mieux.
- **M3** `:207` : la table `actuels` oublie `chaudiere-granules`. Il faut la faire correspondre à « Granulés » (option existante de `ContactForm.astro:15`). Le reste est compatible : `projet` = pac, chaudiere, granules ou bois existent bien ; `surface` est arrondie et bornée de 20 à 300 ; `note` est tronquée à 1 000 caractères.
- **M4** `:81` : sans JS, le mode « consommation » reste masqué. Le bouton radio s'affiche mais ne fait rien, et la touche Entrée envoie un GET sur la page. Correction : afficher ou masquer en CSS (`form:has(input[name=mode][value=conso]:checked) [data-mode=conso]{display:flex}`) au lieu de `hidden`, ou laisser le bloc visible et le masquer en JS.
- **M5** Mobile : le résultat est sous le formulaire et rien ne signale qu'il change. Ajouter un lien « Voir le résultat » ou un résumé collant d'une ligne en bas d'écran sous `lg`.
- **M6** Saisie décimale avec une virgule (« 1,5 » t) sur `type=number` : tester sur iOS Safari et Android Chrome en français. En cas d'échec, on retombe sur I2.
- **M7** `:12` : `centimesUtiles` utilise `prix/pci/rendement`, sans arrondi intermédiaire. C'est correct. Le tableau compare toutefois des granulés en vrac (chaudière) et en sacs (poêle) : le préciser dans la colonne « Système ».

### SUGGESTIONS

- **S1.** Afficher une fourchette plutôt qu'un chiffre unique. Par exemple, pour le fioul : rendement 0,73 à 0,87 selon l'âge (3CL), et prix entre la moyenne sur 12 mois et le dernier relevé.
- **S2.** Séparer « chauffage central » et « chauffage d'une pièce ou appoint » dans la liste, avec la mention : « un poêle chauffe surtout la pièce où il est installé ». En mode maison, le poêle à bois devrait brûler 16,7 stères par an pour 21 000 kWh.
- **S3.** Ajouter une ligne facultative « abonnement supprimé ou ajouté » : gaz −360,79 €/an (prix repère CRE, profil chauffage) ; passage de 6 à 9 kVA pour une PAC, à sourcer sur la grille Tarif Bleu.
- **S4.** Ajouter une option « heures pleines / heures creuses » pour l'électricité. Les prix sont déjà dans la recherche : 21,42 et 15,89 c€.
- **S5.** Mettre un `<caption>` au tableau, avec la date des prix et le référentiel des rendements.

---

## Annexe : recalcul avec rendements cohérents

| Système | Actuel (c€/kWh) | Option A : 3CL saisonnier, générateur seul | Option B : A × Re × Rd × Rr |
|---|---|---|---|
| PAC air/air | 5,27 (SCOP 3,8) | 6,67 (3,0) | 7,31 |
| PAC air/eau | 7,15 | 7,15 | 8,34 |
| Poêle à bois | 7,75 | 7,75 | 10,19 |
| Poêle à granulés | 9,62 | 9,62 | 12,66 |
| Chaudière granulés | 8,97 (0,94) | 9,70 (0,87) | 11,68 |
| Gaz à condensation | 17,01 (0,95) | 15,69 (1,03) | 18,90 |
| Radiateurs électriques | 20,01 | 20,01 | 20,84 |
| Fioul | 19,37 (0,87) | 20,80 (0,81) | 25,05 |

Pour 2 000 L de fioul, l'économie vers une PAC air/eau est de 2 120 € (actuel), 2 206 € (A) et 2 242 € (B). Ce chiffre est robuste : c'est lui qu'il faut mettre en avant, plutôt que la PAC air/air.

**Limite de la vérification.** Les valeurs Rg (0,81 ; 1,03 ; 0,84-0,90) viennent de ma propre mise en œuvre des § 13.2.1 à 13.2.4 de la méthode 3CL. Il faut les recalculer avec un moteur DPE de référence avant de les publier.

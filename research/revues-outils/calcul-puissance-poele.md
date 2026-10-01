# Revue : `/outils/calcul-puissance-poele/`

Revue faite le 1er octobre 2026 sur le serveur de dev (`curl http://localhost:4321/outils/calcul-puissance-poele/`, HTTP 200). Le script client a été réimplémenté en Node : `scratchpad/test-poele.mjs`. Aucun fichier du projet n'a été modifié.

Fichiers relus :
- `src/pages/outils/calcul-puissance-poele.astro`
- `src/lib/thermique.ts`
- `src/data/thermique.ts`
- `src/layouts/OutilLayout.astro`
- `src/components/outils/Field.astro` et `Choices.astro`
- `src/components/ContactForm.astro`
- `research/coefficient-g-3cl.md` et `research/donnees-outils.md` (§1 et 2)
- `scratchpad/ademe-bois.txt` (p. 15)

---

## 0. Vérification des calculs (3 cas types et contrôles)

Formule du code : P (kW) = S × h × G × (19 − (−9,5)) / 1000, avec ΔT = 28,5 K.

| Cas | Calcul à la main | Calculateur (Node) | Tableau | FAQ | Conseil affiché |
|---|---|---|---|---|---|
| 30 m², depuis 2013 (G 0,65) | 75 m³ × 0,65 = 48,75 W/K × 28,5 = 1 389 W | 1,4 kW (pertes 49 W/K) | 1,4 ✓ | – | « environ **3** kW » (plancher arbitraire, voir I-3) |
| 80 m², 1975-1988 (G 1,35) | 200 × 1,35 = 270 W/K × 28,5 = 7 695 W | 7,7 kW (valeur initiale rendue côté serveur : 7,7 ✓) | 7,7 ✓ | – | « environ 8 kW » |
| 120 m², avant 1975 non isolée (G 2,65) | 300 × 2,65 = 795 W/K × 28,5 = 22 658 W | 22,7 kW | 22,7 ✓ | – | « Un poêle à granulés à air d'environ **23 kW** nominaux » (voir B-1) |
| 100 m², 1975-1988 / depuis 2013 | 9 619 W / 4 631 W | 9,6 / 4,6 | 9,6 / 4,6 ✓ | « environ 9,6 kW », « environ 4,6 kW » ✓ | 10 / 5 kW |

Contrôles :
- **Arithmétique** : juste. Tableau, FAQ, valeur initiale et script utilisent les mêmes fonctions (`deperditions`, `puissanceKw`) et donnent les mêmes résultats.
- **Unités** : cohérentes, m² × m × W/(m³·K) × K = W, puis ÷ 1000.
- **Valeurs de G** : conformes à `research/coefficient-g-3cl.md` §6.1.
  - 1,35 = moyenne de 1,45 et 1,25.
  - 0,9 = moyenne de 0,95 et 0,80 (arrondi de 0,875).
  - 2,65 = moyenne de 2,70 et 2,60.
- **Constantes de climat** : −9,5 °C et 19 °C sont sourcées (3CL, §18.1 et §9.1.1).

**Le calcul est juste. Ce qui pose problème, c'est son usage pour conseiller un poêle.**

---

## BLOQUANT

### B-1. Le conseil propose des poêles qui n'existent pas, ou dangereusement surdimensionnés (aucun plafond de puissance)
- **Où** : `src/pages/outils/calcul-puissance-poele.astro:199` (conseil), `:152-158` (tableau), `:92` (conseil rendu côté serveur).
- **Problème** : le conseil reprend le besoin brut, arrondi au kW supérieur, sans borne haute. Exemples :
  - 120 m² avant 1975 → « Un poêle à granulés à air d'environ 23 kW nominaux » ;
  - même cas en bois → « Un poêle à bois d'environ 23 kW nominaux » ;
  - 80 m² sous 6 m de plafond → 19 kW ;
  - 400 m² → 76 kW.
- **Le tableau a le même défaut** : 8 cellules sur 54 dépassent 12 kW, jusqu'à 28,3 kW (150 m², avant 1975).
- **Preuve** :
  - ADEME, guide « Adopter le chauffage au bois », p. 15 : « Les puissances classiques pour un appareil de chauffage domestique (type poêle à bûches) oscillent en général entre 4 et 12 kW ». Une maison mal isolée a besoin « par exemple » de 12 kW.
  - Un poêle à granulés à air de 23 kW n'existe pas dans les gammes courantes.
  - Pour le bois, pousser vers un très gros poêle va à l'encontre de l'argument « pas le plus gros » de la page. Un poêle à bûches surdimensionné tourne au ralenti, ce qui augmente le bistre dans le conduit, et donc le risque de feu de cheminée.
  - Le rapport G lui-même (§7) dit que la valeur « jamais isolée » est « plus haut que les 12 kW de l'ADEME, d'environ 50 % ».
- **Correction** :
  1. Ajouter dans `data/thermique.ts` une constante sourcée, par exemple `poeleDomestique = { min: 4, max: 12 }`, avec la source `sourcesThermique.ademeBois` (« puissances classiques… entre 4 et 12 kW »).
  2. Dans le script, si `kw > poeleDomestique.max`, remplacer le conseil par un message du type : « Votre besoin (22,7 kW) dépasse ce qu'un poêle fournit (4 à 12 kW en général, selon l'ADEME). Un poêle peut chauffer la pièce de vie, en complément d'un chauffage central. Pour chauffer toute la maison, isolez d'abord (combles, fenêtres) ou étudiez une chaudière à granulés ou une pompe à chaleur. » Ajouter des liens vers `/chaudieres/` et `/pompes-a-chaleur/`, et un CTA qui garde `projet=granules`.
  3. Dans le tableau, afficher les cellules > 12 kW autrement : grisées avec la mention « > 12 », plus une légende « au-delà, un poêle seul ne suffit pas ».
  4. Appliquer la même règle au conseil rendu côté serveur (`:92`).

---

## IMPORTANT

### I-1. La méthode dimensionne pour le jour le plus froid, puis arrondit au-dessus, alors que la page dit le contraire
- **Où** : `:127-131` (paragraphe ADEME), `:26-27` (FAQ 2), `:199` (`Math.ceil`), `src/data/thermique.ts:96` (tBase).
- **Problème** : la page reprend l'ADEME : mieux vaut un poêle proche du besoin, avec un autre chauffage en appoint pour les grands froids. Mais le calcul fait l'inverse :
  - il couvre 100 % des déperditions à −9,5 °C ;
  - il ne compte aucun apport gratuit (occupants, appareils, soleil) ;
  - il s'appuie sur une maison de référence défavorable (non mitoyenne, 4 façades, voir I-2) ;
  - il arrondit encore au kW supérieur (4,1 → 5 kW, soit +22 %).
  Plusieurs majorations s'additionnent, et le message affiché contredit le calcul.
- **Preuve** :
  - ADEME p. 15 : « Mieux vaut donc opter pour un 2e système de chauffage utilisé comme appoint en cas de grand froid ».
  - `research/coefficient-g-3cl.md` §8, point 14 : « Pas de surpuissance de relance, pas de déduction des apports internes ou solaires ».
  - Même document, §7, point 4 : « La méthode 3CL n'est pas une méthode de dimensionnement ».
- **Correction** (au choix) :
  - (a) arrondir au kW le plus proche (`Math.round`) au lieu du kW supérieur ;
  - (b) mieux, afficher une fourchette, par exemple « entre 7 et 8 kW », bornée par [4 ; 12], avec la phrase : « calcul pour −9,5 °C, le froid le plus rare : un poêle un peu en dessous suffit si vous gardez un appoint ».
  Dans les deux cas, écrire dans le texte « Méthode » que le résultat est un majorant : maison individuelle non mitoyenne, apports gratuits non déduits.

### I-2. Les G sont ceux d'une maison non mitoyenne, alors que les maisons en bande sont très courantes dans le Nord
- **Où** : `src/data/thermique.ts:103-116`, `calcul-puissance-poele.astro:121-123`.
- **Problème** : le texte parle d'une « maison type de chaque époque », sans dire laquelle. Or ce sont des G de maison de 100 m² à étage, **non mitoyenne**, quatre façades exposées. Le rapport de recherche a calculé les variantes mitoyennes et recommandait de :
  - « signaler que c'est un majorant » ;
  - ou « proposer un choix mitoyenne / isolée » (§7, conclusion).
  Aucune de ces deux options n'a été reprise.
- **Preuve** : `coefficient-g-3cl.md` §6.1, G mitoyenne d'un côté :

  | Époque | G isolée | G mitoyenne | Puissance pour 100 m² |
  |---|---|---|---|
  | Avant 1975, jamais isolée | 2,65 | 2,30 / 2,20 | 18,9 → 16,0 kW |
  | 1975-1988 | 1,35 | 1,10 à 1,25 | 9,6 → 8,4 kW |
  | Depuis 2013 | 0,65 | 0,60 | 4,6 → 4,3 kW |

- **Correction** : ajouter un choix « Maison : individuelle / mitoyenne d'un côté » et les G mitoyens dans `isolations` : 2,25 ; 1,55 ; 1,175 (ou 1,2) ; 0,95 ; 0,75 ; 0,60, tous déjà calculés dans la recherche. Au minimum, compléter `:122-123` ainsi : « …pour une maison individuelle de 100 m² à étage, non mitoyenne : en maison mitoyenne, le besoin est 10 à 15 % plus faible ».

### I-3. Le plancher de 3 kW est un chiffre inventé
- **Où** : `calcul-puissance-poele.astro:199` (`Math.max(3, Math.ceil(kw))`).
- **Problème** : le chiffre 3 n'est sourcé ni dans `data/thermique.ts` ni dans la recherche, ce qui enfreint la règle de CLAUDE.md « Ne pas inventer de chiffres ».
  - Exemple : 30 m² en maison récente → besoin affiché 1,4 kW, conseil « environ 3 kW ».
  - Le lecteur voit un conseil qui ne correspond pas au besoin, sans explication.
  - 20 cellules du tableau sur 54 sont sous 4 kW.
- **Correction** : supprimer le `Math.max(3, …)`. Si `kw < poeleDomestique.min` (4 kW, source ADEME, voir B-1), afficher : « Votre besoin est inférieur à la puissance des poêles courants (4 à 12 kW selon l'ADEME). Choisissez un modèle de petite puissance qui module bien, ou chauffez aussi les pièces voisines. »

### I-4. Le conseil « poêle à bois bouilleur » ne correspond pas à l'offre, et l'hydro n'est pas expliqué
- **Où** : `calcul-puissance-poele.astro:184` et `:179`.
- **Problème** :
  - (a) Bouilleur bois : `research/fiche-entreprise.md` §3 liste l'hydro uniquement pour les **granulés**. Pour le bois bûche, l'offre est poêles à bois, poêles de masse et chaudières à bûches (RTB/NBE). Recommander un « poêle à bois bouilleur » pousse vers un produit que FK ne met pas en avant. Ce montage est aussi délicat : il demande un ballon tampon et une sécurité thermique, car le feu de bûches ne se coupe pas.
  - (b) Hydro : un poêle hydro répartit sa puissance entre l'eau et l'air de la pièce. La « puissance nominale » totale ne dit donc pas ce qui part vers les radiateurs. Avec le choix « Toute la maison, avec des radiateurs », la surface saisie doit être celle de toute la maison. L'aide du champ dit pourtant « Les pièces que le poêle doit chauffer », sans lien avec ce choix.
- **Correction** :
  - pour `bois.radiateurs` : « Pour alimenter des radiateurs au bois, une chaudière à bûches ou un poêle à granulés hydro est plus adapté », avec des liens vers `/chaudieres/` et `/poele-a-granules/#hydro` ;
  - pour `granules.radiateurs` : ajouter « puissance totale, eau et air compris : nous vérifions la part envoyée aux radiateurs » ;
  - quand `pieces === 'radiateurs'`, changer l'aide du champ surface en « Surface de toute la maison ».

### I-5. Le lien « Demander une étude » transmet une surface qui n'a pas le même sens dans le formulaire, et perd l'isolation
- **Où** : `calcul-puissance-poele.astro:200-201`, `src/components/ContactForm.astro:379-382` et `:387`.
- **Problème** : `projet=granules|bois` est bien lu, la présélection fonctionne. Mais trois défauts :
  - (a) `surface` désigne ici la surface **à chauffer par le poêle**, alors que le formulaire de contact la présente comme la surface du logement. 30 m² de pièce de vie deviennent « Surface 30 m² » dans le devis, sans contexte.
  - (b) Sous 20 m², le formulaire ignore la valeur (`preSurface >= 20`) et garde son défaut de 100 m². Avec 15 m² saisis, le lead arrive donc avec **100 m²**.
  - (c) La note ne contient ni l'isolation (époque), ni les pièces à chauffer, ni le conseil donné. Ce sont pourtant les informations les plus utiles au rappel. Exemple de note produite : « Calculateur de puissance : 80 m² × 2,5 m, besoin estimé 7,7 kW (poêle à granulés). »
- **Preuve** : simulation Node, cas 15 m² → `formSurface = 100 (défaut, non prérempli)`.
- **Correction** :
  - ne pas transmettre `surface` quand la surface saisie est celle d'une partie de la maison (`pieces !== 'radiateurs'`), ou la mettre seulement dans la note ;
  - enrichir la note : `Calculateur de puissance : pièce(s) à chauffer ${surface} m² × ${h} m, maison ${isolation.label}, ${piecesLabel}, besoin estimé ${kw} kW, conseil : ${conseil}.`

---

## MINEUR

### M-1. Saisies invalides : le résultat garde l'ancienne valeur, sans message
- **Où** : `:194`.
- **Problème** : avec un champ vide, 0 ou négatif, `return` laisse affichés l'ancien résultat **et l'ancien lien** du CTA. Aucun message, pas d'`aria-invalid`.
  - `min=5` et `max=400` (surface), `min=2` et `max=6` (hauteur) ne sont pas appliqués par le script.
  - Résultats obtenus : 10 000 m² → 1 888,1 kW, conseil 1 889 kW ; hauteur 0,3 m → 0,9 kW.
- **Correction** : borner les valeurs (`Math.min(max, Math.max(min, v))`) ou afficher « Indiquez une surface entre 5 et 400 m² » à la place du chiffre, et mettre `aria-invalid` sur le champ.

### M-2. Le conseil rendu côté serveur n'applique pas la même règle que le script
- **Où** : `:92` (`Math.ceil(initial)`) et `:199` (`Math.max(3, Math.ceil(kw))`).
- **Problème** : pas de différence visible avec les valeurs par défaut (8 kW des deux côtés), mais deux règles coexistent. Le texte de détail diffère aussi entre le serveur (`:87`) et le script (`:198`). Le texte change donc juste après le chargement.
- **Correction** : écrire une seule fonction `conseil(kw, appareil, pieces)` dans `lib/thermique.ts`, appelée au build et dans le navigateur.

### M-3. Guillemets qui laissent croire à une citation de l'ADEME
- **Où** : `:128`.
- **Problème** : « « pour les grands froids » » ressemble à une citation. Le guide dit en réalité « en prévision de températures très basses ». Le reste du paragraphe, la FAQ 2 et la durée de vie réduite sont conformes à la p. 15.
- **Correction** : retirer les guillemets, ou citer exactement : « en prévision de températures très basses ».

### M-4. « En trois réponses » est inexact
- **Où** : `:45`.
- **Problème** : le formulaire pose 5 questions : projet, surface, hauteur, isolation, pièces.
- **Correction** : « En quelques réponses… ».

### M-5. Précision trompeuse
- **Problème** : afficher « 7,7 kW » ou « environ 9,6 kW » (FAQ) avec une décimale suggère une précision que la méthode n'a pas (±20 à 30 % selon la mitoyenneté, le type de mur, le plancher intermédiaire : voir recherche §6.3).
- **Correction** : afficher le besoin arrondi à 0,5 kW, ou une fourchette (voir I-1). Dans la FAQ, écrire « environ 9 à 10 kW ».

### M-6. Grande hauteur sous plafond
- **Problème** : avec G × V, 6 m de plafond double le besoin (80 m² : 7,7 → 18,5 kW). Or plafond, plancher et ventilation ne dépendent pas de la hauteur, donc G × V surestime. La stratification de l'air chaud joue en sens inverse. Le résultat n'est pas aberrant, mais il est très incertain.
- **Correction** : au-delà de 3 m, ajouter une remarque : « pièce cathédrale ou mezzanine : calcul approximatif, à vérifier sur place ».

### M-7. Signe moins typographique
- **Problème** : `Intl.NumberFormat('fr-FR')` produit « -9,5 » avec un trait d'union, sur le site et dans le détail du script.
- **Correction** : `fmt(...).replace('-', '−')` pour obtenir « −9,5 ».

### M-8. Mobile
- **Problème** : `text-6xl` (60 px) dans un panneau de 375 − 32 − 56 ≈ 287 px. « 22,7 kW » tient, mais un résultat à 4 chiffres (« 1 888,1 kW », cas M-1) déborde.
- **Correction** : la borne haute (B-1, M-1) suffit. Sinon, `text-5xl sm:text-6xl`.

### M-9. `aria-live` trop large
- **Où** : `:81`.
- **Problème** : `aria-live="polite"` est posé sur tout le panneau (titre, chiffre, détail, conseil, bouton). Chaque frappe peut déclencher plusieurs annonces partielles. Les labels, eux, sont corrects : `label for`, `fieldset/legend`, radios dans leur label avec focus visible.
- **Correction** : retirer `aria-live` du conteneur. Le mettre avec `aria-atomic="true"` sur un seul bloc qui regroupe le chiffre et le conseil.

---

## SUGGESTIONS (SEO et contenu)

### S-1. Title
- **Problème** : le title actuel est « Calcul de la puissance d'un poêle (kW par m²) | FK Énergie ». Il ne contient ni « granulés » ni « bois », alors que les requêtes visées les contiennent (« quelle puissance poêle à granulés pour 100 m² », « calcul puissance poêle à bois »).
- **Correction** : « Puissance poêle à granulés ou à bois : calcul en kW/m² ». La meta description est bonne.

### S-2. Tenir la promesse « kW par m² »
- **Problème** : la page ne donne jamais de ratio en W/m², alors que les concurrents répondent tous avec un ratio (« 1 kW pour 10 m² »).
- **Correction** : ajouter une ligne ou une colonne « W par m² » calculée à partir des G, donc sourcée :

  | Époque | W/m² (2,50 m de plafond) |
  |---|---|
  | Avant 1975 | 189 |
  | Avant 1975 rénovée | 139 |
  | 1975-1988 | 96 |
  | 1989-2000 | 78 |
  | 2001-2012 | 64 |
  | Depuis 2013 | 46 |

  Ajouter aussi une FAQ « La règle de 1 kW pour 10 m² est-elle juste ? ». Réponse : elle correspond à une maison des années 1975-1988 ; elle est deux fois trop forte pour une maison récente et deux fois trop faible pour une maison ancienne jamais isolée.

### S-3. Comparaison avec les concurrents
- **Sites regardés** (sans reprendre leur contenu) :
  - chaleurdouce.fr/guides/quelle-puissance-poele-a-granules
  - 7monenergie.fr/calculateur-puissance-chauffage/
  - quelleenergie.fr/magazine/puissance-poele-granules
- **Ce qu'ils ont en plus** :
  - un tableau inverse « puissance du poêle → surface chauffée » (6, 8, 10, 12 kW) ;
  - un renvoi explicite vers le canalisable ou l'hydro au-delà d'environ 120 m², c'est-à-dire un plafond (voir B-1) ;
  - la température de confort ou le code postal en entrée ;
  - des exemples de modèles du commerce.
- **Ce que FK a de mieux** :
  - une méthode sourcée et transparente ;
  - le climat local ;
  - l'avertissement ADEME contre le surdimensionnement ;
  - une FAQ calculée au build.
- **Correction proposée** : ajouter le tableau inverse « Quelle surface chauffe un poêle de 6, 8, 10, 12 kW ? », qui vise une requête fréquente. Ajouter une FAQ « Poêle à granulés pour 100 m² » formulée exactement comme la requête.

### S-4. Maillage interne
- **Constat** : `/poele-a-granules/`, `/poele-a-bois/`, `/inserts-cheminees/` et `/outils/` pointent vers l'outil ✓.
- **Problème** : le guide `/conseils/poele-a-granules-ou-poele-a-bois/` est lié depuis l'outil, mais ne renvoie pas vers lui.
- **Correction** :
  - ajouter ce lien retour ;
  - dans le résultat, ajouter un lien contextuel « Combien de granulés par an pour ce poêle ? » vers `/outils/consommation-granules/`, en transmettant éventuellement la surface et l'isolation.

### S-5. Afficher les repères de l'ADEME
- **Correction** : afficher dans la page les repères de la p. 15 : 4 à 12 kW ; environ 12 kW pour une maison mal isolée ; 5 à 9 kW pour une maison isolée ; au plus 5 kW pour une maison RT 2012 / RE 2020. Ils sont déjà sourcés et rassurent le lecteur. Préciser que l'ADEME ne donne pas de surface.

### S-6. Lisibilité
- **Problème** : « pertes 270 W par degré d'écart » est du jargon pour un particulier.
- **Correction** : « Volume chauffé 200 m³. Calcul fait pour −9,5 °C dehors (le froid de référence du Nord) et 19 °C dedans. »

---

## Verdict global

La **justesse arithmétique** est bonne :
- formule correcte ;
- G par époque calculés de façon traçable (3CL) ;
- constantes sourcées ;
- tableau, FAQ, valeur initiale et script cohérents entre eux, vérifiés sur 4 cas.

La **pertinence métier** n'est pas encore au niveau pour mettre l'outil en ligne :
- **Aucune borne** : l'outil peut recommander « un poêle à granulés à air de 23 kW », voire 76 kW. Le tableau affiche jusqu'à 28 kW, alors que l'ADEME situe les poêles entre 4 et 12 kW (B-1).
- **Le calcul contredit le message de la page** : dimensionnement au froid de base, maison non mitoyenne, aucun apport gratuit, arrondi au-dessus, alors que la page plaide « le bon poêle, pas le plus gros » (I-1, I-2).
- **Un plancher de 3 kW non sourcé**, contraire aux règles du projet (I-3).
- **Un conseil « poêle à bois bouilleur »** hors de l'offre de FK Énergie (I-4).
- **Des leads incomplets ou faux** : surface par défaut à 100 m², isolation absente de la note (I-5).

Une fois B-1 et I-1 à I-5 corrigés, l'outil sera juste et utile, avec un bon potentiel SEO local : contenu indexable, FAQ et WebApplication en JSON-LD, sources affichées. Le plus gros gain SEO viendrait de S-1 à S-3 : mots-clés granulés et bois dans le title, ratio W/m², tableau inverse.

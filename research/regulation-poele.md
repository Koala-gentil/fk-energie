# Fonctionnement du poêle selon sa puissance (simulateur de plan)

Utilisé dans `src/lib/plan/temperatures.ts` (régimes) avec `regulationPoele` (`src/data/plan-thermique.ts`).

## Le constat de départ

Un poêle qui suffit à tenir sa consigne ne chauffe pas plus la maison s'il est plus puissant : son thermostat (granulés)
ou l'utilisateur (bûches) règle la chaleur sur le besoin. Le simulateur donnait donc les mêmes températures pour 4 kW et
13 kW par 3 °C dehors, ce qui est juste en moyenne mais ne disait rien de la taille du poêle.

## Plage de fonctionnement

| Type                  | Allure minimale        | Trop puissant pour le besoin                                         |
| --------------------- | ---------------------- | -------------------------------------------------------------------- |
| Granulés (+ canalisable) | 30 % de la puissance nominale | reste à l'allure minimale tant que la pièce ne dépasse pas la consigne de plus de 1 °C, sinon marche/arrêt avec la pièce à consigne + 1 °C en moyenne |
| Bûches                | 50 % de la puissance nominale | pas de thermostat : flambées courtes et espacées, températures moyennes à la valeur visée, avec de fortes variations |

Sources :

- **ADEME (2023)**, *Performances réelles de poêles à granulés* (rapport, mars 2023 ; copie consultée :
  https://www.actu-environnement.com/media/pdf/news-41406-etude-ademe-performance-poele-granule-mars-2023.pdf) :
  allure réduite « correspondant en général à 30 % de la puissance nominale » ; consigne « globalement bien respectée dans
  le salon », avec « un léger excès de température de 1 °C en moyenne » ; en mode modulation, le poêle continue à puissance
  réduite après la consigne puis s'éteint si l'écart devient trop grand ; en mode marche/arrêt, il s'éteint puis redémarre.
  Allures réduites et surdimensionnement : rendement plus faible et émissions plus fortes pour une partie des appareils.
- **IEA Bioenergy Task 32 (2018)**, *Advanced Test Methods for Firewood Stoves* : les essais à charge partielle se font à
  50 % au plus de la puissance nominale (exigence autrichienne ; protocole beReal à 50 % de la masse de bûches).

## Ce qu'affiche l'onglet Poêle

- le régime au jour choisi (modulation, trop petit, trop puissant : allure minimale, marche/arrêt ou flambées) ;
- le même réglage par grand froid (−9,5 °C) : c'est là que la puissance fait la différence (trop juste, ou part de la
  puissance utilisée) ;
- un avertissement quand le poêle est surdimensionné.

Exemple (maison à étage bien isolée, besoin 6,3 kW par −9,5 °C, réglage 20 °C, 3 °C dehors) :

| Poêle         | 3 °C dehors                                   | Grand froid (−9,5 °C)          |
| ------------- | --------------------------------------------- | ------------------------------ |
| Granulés 4 kW | tient 20 °C à 70 %                            | ne tient que 14 °C : trop juste |
| Granulés 8 kW | tient 20 °C à 35 %                            | tient 20 °C à 63 %             |
| Granulés 13 kW | marche/arrêt, séjour 21 °C en moyenne        | tient 20 °C à 39 %             |
| Bûches 13 kW  | flambées espacées (au ralenti, plus de 30 °C) | encore au ralenti : surdimensionné |

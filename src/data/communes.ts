/**
 * Communes proposées dans le formulaire, avec le showroom le plus proche (estimation par distance routière).
 * Validé avec FK Énergie (octobre 2026) : Lumbres, Bourbourg et Gravelines sont rattachées à Ardres.
 */
export type Commune = { name: string; cp: string; showroom: 'aire-sur-la-lys' | 'ardres' | 'rexpoede' };

const c = (name: string, cp: string, showroom: Commune['showroom']): Commune => ({ name, cp, showroom });

export const communes: Commune[] = [
  c('Aire-sur-la-Lys', '62120', 'aire-sur-la-lys'),
  c('Isbergues', '62330', 'aire-sur-la-lys'),
  c('Lillers', '62190', 'aire-sur-la-lys'),
  c('Saint-Venant', '62350', 'aire-sur-la-lys'),
  c('Thérouanne', '62129', 'aire-sur-la-lys'),
  c('Saint-Omer', '62500', 'aire-sur-la-lys'),
  c('Arques', '62510', 'aire-sur-la-lys'),
  c('Longuenesse', '62219', 'aire-sur-la-lys'),
  c('Fruges', '62310', 'aire-sur-la-lys'),
  c('Norrent-Fontes', '62120', 'aire-sur-la-lys'),
  c('Béthune', '62400', 'aire-sur-la-lys'),
  c('Hazebrouck', '59190', 'aire-sur-la-lys'),
  c('Merville', '59660', 'aire-sur-la-lys'),
  c('Ardres', '62610', 'ardres'),
  c('Calais', '62100', 'ardres'),
  c('Guînes', '62340', 'ardres'),
  c('Licques', '62850', 'ardres'),
  c('Audruicq', '62370', 'ardres'),
  c('Marck', '62730', 'ardres'),
  c('Oye-Plage', '62215', 'ardres'),
  c('Coquelles', '62231', 'ardres'),
  c('Tournehem-sur-la-Hem', '62890', 'ardres'),
  c('Éperlecques', '62910', 'ardres'),
  c('Nordausques', '62890', 'ardres'),
  c('Louches', '62610', 'ardres'),
  c('Lumbres', '62380', 'ardres'),
  c('Bourbourg', '59630', 'ardres'),
  c('Gravelines', '59820', 'ardres'),
  c('Rexpoëde', '59122', 'rexpoede'),
  c('Hondschoote', '59122', 'rexpoede'),
  c('Bergues', '59380', 'rexpoede'),
  c('Wormhout', '59470', 'rexpoede'),
  c('Dunkerque', '59140', 'rexpoede'),
  c('Cassel', '59670', 'rexpoede'),
  c('Esquelbecq', '59470', 'rexpoede'),
  c('Bierne', '59380', 'rexpoede'),
];

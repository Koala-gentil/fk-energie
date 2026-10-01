/**
 * Pages locales « installateur chauffage à … » pour les grandes villes du secteur sans showroom.
 * Distances et temps de trajet : itinéraire routier depuis l'adresse du showroom jusqu'au centre de la commune
 * (OSRM / OpenStreetMap, octobre 2026), arrondis. Communes voisines : à valider avec FK Énergie.
 */
import type { Showroom } from './site';

export type Ville = {
  slug: string;
  name: string;
  postalCode: string;
  department: 'Pas-de-Calais' | 'Nord';
  /** Slug du showroom le plus proche. */
  showroom: Showroom['slug'];
  km: number;
  minutes: number;
  /** Paragraphe d'introduction propre à la ville. */
  intro: string;
  /** Communes voisines desservies depuis le même showroom. */
  nearby: string[];
  /** Ville citée dans `realisations.ts` (champ `place`) pour afficher les poses locales. */
  place?: string;
};

export const villes: Ville[] = [
  {
    slug: 'saint-omer',
    name: 'Saint-Omer',
    postalCode: '62500',
    department: 'Pas-de-Calais',
    showroom: 'aire-sur-la-lys',
    km: 20,
    minutes: 25,
    intro:
      'Saint-Omer et l’Audomarois font partie de notre secteur historique : notre showroom d’Aire-sur-la-Lys est à une vingtaine de kilomètres. Nous y posons des poêles à granulés, des poêles à bois, des inserts et des pompes à chaleur, et nous en assurons ensuite l’entretien.',
    nearby: ['Arques', 'Longuenesse', 'Blendecques', 'Wizernes', 'Lumbres', 'Éperlecques'],
    place: 'Saint-Omer',
  },
  {
    slug: 'calais',
    name: 'Calais',
    postalCode: '62100',
    department: 'Pas-de-Calais',
    showroom: 'ardres',
    km: 12,
    minutes: 15,
    intro:
      'Pour les habitants de Calais et du Calaisis, notre showroom d’Ardres est à un quart d’heure de route. Vous y voyez nos poêles à granulés et à bois en exposition, et nos équipes viennent ensuite chez vous pour l’étude, la pose et l’entretien.',
    nearby: ['Coquelles', 'Marck', 'Coulogne', 'Sangatte', 'Guînes', 'Oye-Plage'],
  },
  {
    slug: 'hazebrouck',
    name: 'Hazebrouck',
    postalCode: '59190',
    department: 'Nord',
    showroom: 'aire-sur-la-lys',
    km: 15,
    minutes: 20,
    intro:
      'Hazebrouck n’est qu’à une quinzaine de kilomètres de notre showroom d’Aire-sur-la-Lys, de l’autre côté de la limite du Nord. Poêle à granulés canalisable, poêle à bois, insert ou pompe à chaleur : nous intervenons dans toute la Flandre intérieure.',
    nearby: ['Morbecque', 'Steenbecque', 'Merville', 'Cassel', 'Renescure', 'Thiennes'],
  },
  {
    slug: 'dunkerque',
    name: 'Dunkerque',
    postalCode: '59140',
    department: 'Nord',
    showroom: 'rexpoede',
    km: 24,
    minutes: 25,
    intro:
      'Avec l’ouverture de notre agence de Rexpoëde en 2026, Dunkerque et son agglomération sont désormais à vingt-cinq minutes d’un showroom FK Énergie. Pompes à chaleur Atlantic et poêles à granulés Palazzetti y sont exposés.',
    nearby: ['Coudekerque-Branche', 'Grande-Synthe', 'Téteghem', 'Bergues', 'Bourbourg', 'Gravelines'],
  },
  {
    slug: 'bethune',
    name: 'Béthune',
    postalCode: '62400',
    department: 'Pas-de-Calais',
    showroom: 'aire-sur-la-lys',
    km: 26,
    minutes: 30,
    intro:
      'Notre siège est à Drouvin-le-Marais, aux portes de Béthune, et notre showroom d’Aire-sur-la-Lys à une demi-heure de route. Nous accompagnons les habitants du Béthunois pour leur poêle, leur chaudière à granulés ou leur pompe à chaleur.',
    nearby: ['Beuvry', 'Annezin', 'Lillers', 'Isbergues', 'Bruay-la-Buissière', 'Drouvin-le-Marais'],
  },
];

export const villeUrl = (v: Ville) => `/installateur-chauffage/${v.slug}/`;

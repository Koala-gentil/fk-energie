import type { ImageMetadata } from 'astro';
import facadeAire from '../assets/images/showrooms/facade-aire-sur-la-lys.jpg';
import facadeArdres from '../assets/images/showrooms/facade-ardres.jpg';
import showroomPac from '../assets/images/produits/showroom-pompe-a-chaleur-atlantic.jpg';

export const site = {
  name: 'FK Énergie',
  legalName: 'FK ENERGIE',
  url: 'https://www.fk-energie-chauffage.fr',
  phone: '03 21 88 88 60',
  phoneHref: 'tel:+33321888860',
  phoneIntl: '+33 3 21 88 88 60',
  email: 'fkenergie@orange.fr',
  foundingDate: '2008-07',
  foundingYear: 2008,
  facebook: 'https://www.facebook.com/fkenergie',
  tagline: 'Depuis 2008, votre confort est notre priorité',
  description:
    "Installateur RGE de poêles à granulés, poêles à bois, chaudières, inserts et pompes à chaleur dans le Pas-de-Calais et le Nord. 3 showrooms : Aire-sur-la-Lys, Ardres et Rexpoëde.",
  legal: {
    form: 'SAS au capital de 5 000 €',
    siren: '505 132 175',
    rcs: 'RCS Arras 505 132 175',
    vat: 'FR69505132175',
    naf: '43.22B',
    headOffice: '176 rue du Bois Villain, 62131 Drouvin-le-Marais',
    director: 'Sylvie Faltin',
  },
  certifications: ['RGE QualiBois', 'RGE QualiPAC'],
  areaServed: [
    'Aire-sur-la-Lys',
    'Saint-Omer',
    'Isbergues',
    'Hazebrouck',
    'Béthune',
    'Lillers',
    'Ardres',
    'Calais',
    'Guînes',
    'Licques',
    'Audruicq',
    'Dunkerque',
    'Bergues',
    'Hondschoote',
    'Wormhout',
    'Rexpoëde',
  ],
} as const;

/** Années d'expérience, calculées à partir de la date de création (juillet 2008). */
export const yearsOfExperience = (() => {
  const now = new Date();
  return now.getFullYear() - site.foundingYear - (now.getMonth() < 6 ? 1 : 0);
})();

export type OpeningHours = { days: string; dayCodes: string[]; slots: [string, string][] };

/** Horaires communs aux trois showrooms (flyers 2026). */
export const openingHours: OpeningHours[] = [
  { days: 'Lundi', dayCodes: ['Monday'], slots: [['10:00', '12:00'], ['14:00', '18:00']] },
  {
    days: 'Mardi – Vendredi',
    dayCodes: ['Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    slots: [['09:00', '12:00'], ['14:00', '18:00']],
  },
  { days: 'Samedi', dayCodes: ['Saturday'], slots: [['09:00', '12:00'], ['14:00', '17:00']] },
  { days: 'Dimanche', dayCodes: [], slots: [] },
];

export const formatSlot = ([from, to]: [string, string]) =>
  `${from.replace(':00', 'h').replace(/^0/, '')} – ${to.replace(':00', 'h').replace(/^0/, '')}`;

export type Showroom = {
  slug: string;
  name: string;
  city: string;
  shortName: string;
  street: string;
  postalCode: string;
  department: string;
  landmark?: string;
  isNew?: boolean;
  email?: string;
  intro: string;
  highlights: string[];
  nearby: string[];
  image?: ImageMetadata;
  imageAlt?: string;
  mapsQuery: string;
};

export const showrooms: Showroom[] = [
  {
    slug: 'aire-sur-la-lys',
    name: 'Showroom d’Aire-sur-la-Lys',
    city: 'Aire-sur-la-Lys',
    shortName: 'Aire-sur-la-Lys',
    street: '14 rue de Paris',
    postalCode: '62120',
    department: 'Pas-de-Calais',
    landmark: 'à côté de Delalleau',
    email: 'fkenergie@orange.fr',
    intro:
      "Notre magasin historique : 300 m² d'exposition entièrement dédiés au chauffage au bois et aux granulés. Vous y découvrez des poêles en fonctionnement, dont un système de poêle à granulés canalisable qui chauffe tout le magasin.",
    highlights: [
      '300 m² d’exposition dédiés au bois et aux granulés',
      'Poêles Palazzetti, HETA, Lotus et Contura en démonstration',
      'Pompes à chaleur et climatisation Atlantic',
      'Système canalisable en fonctionnement',
    ],
    nearby: ['Saint-Omer', 'Isbergues', 'Lillers', 'Hazebrouck', 'Béthune', 'Thérouanne', 'Lumbres'],
    image: facadeAire,
    imageAlt: 'Façade du showroom FK Énergie, 14 rue de Paris à Aire-sur-la-Lys',
    mapsQuery: 'FK Energie 14 rue de Paris 62120 Aire-sur-la-Lys',
  },
  {
    slug: 'ardres',
    name: 'Showroom d’Ardres',
    city: 'Ardres',
    shortName: 'Ardres',
    street: '677 avenue de la Censé Hébron',
    postalCode: '62610',
    department: 'Pas-de-Calais',
    landmark: 'Bois-en-Ardres',
    email: 'ardres.fkenergie@gmail.com',
    intro:
      "Ouvert en 2018 pour les 10 ans de l'entreprise, notre showroom d'Ardres accueille les habitants du Calaisis et de l'Audomarois. Poêles à granulés, poêles à bois et inserts y sont exposés pour vous aider à choisir.",
    highlights: [
      'Hall d’exposition poêles à granulés et à bois',
      'Conseil et étude personnalisée de votre projet',
      'Accompagnement pour les aides financières',
    ],
    nearby: ['Calais', 'Guînes', 'Licques', 'Audruicq', 'Saint-Omer', 'Marck', 'Oye-Plage'],
    image: facadeArdres,
    imageAlt: 'Façade du showroom FK Énergie à Ardres (Bois-en-Ardres)',
    mapsQuery: 'FK Energie 677 avenue de la Censé Hébron 62610 Ardres',
  },
  {
    slug: 'rexpoede',
    name: 'Showroom de Rexpoëde',
    city: 'Rexpoëde',
    shortName: 'Rexpoëde',
    street: '8 place de la Mairie',
    postalCode: '59122',
    department: 'Nord',
    isNew: true,
    intro:
      "Notre nouvelle agence, ouverte en 2026 au cœur de Rexpoëde, pour accompagner les habitants de la Flandre maritime et des Hauts de Flandre dans leurs projets de pompe à chaleur et de poêle à granulés.",
    highlights: [
      'Pompes à chaleur Atlantic air/eau et air/air',
      'Poêles à granulés Palazzetti',
      'Étude gratuite et accompagnement aux aides',
    ],
    nearby: ['Bergues', 'Hondschoote', 'Wormhout', 'Dunkerque', 'Bourbourg', 'Cassel', 'Hazebrouck'],
    image: showroomPac,
    imageAlt: 'Pompes à chaleur Atlantic et poêles Palazzetti exposés dans un showroom FK Énergie',
    mapsQuery: 'FK Energie 8 place de la Mairie 59122 Rexpoëde',
  },
];

export const mapsUrl = (s: Showroom) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.mapsQuery)}`;

export type NavItem = { label: string; href: string; description?: string };

export const productNav: NavItem[] = [
  { label: 'Poêles à granulés', href: '/poele-a-granules/', description: 'Air, canalisables, gain de place, hydro' },
  { label: 'Poêles à bois', href: '/poele-a-bois/', description: 'Bûches, poêles de masse, mixtes' },
  { label: 'Pompes à chaleur', href: '/pompes-a-chaleur/', description: 'Air/eau, air/air et climatisation' },
  { label: 'Chaudières', href: '/chaudieres/', description: 'Granulés et bûches' },
  { label: 'Inserts & cheminées', href: '/inserts-cheminees/', description: 'Foyers fermés et habillages' },
];

export const serviceNav: NavItem[] = [
  { label: 'Entretien & ramonage', href: '/entretien-ramonage/', description: 'SAV, entretien annuel, dépannage' },
  { label: 'Aides financières', href: '/aides-financieres/', description: 'MaPrimeRénov’, CEE, TVA réduite' },
  { label: 'Nos réalisations', href: '/realisations/', description: 'Nos poses chez nos clients' },
];

export const mainNav: NavItem[] = [
  { label: 'Nos showrooms', href: '/showrooms/' },
  { label: 'L’entreprise', href: '/entreprise/' },
];

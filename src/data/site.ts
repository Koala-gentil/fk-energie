import type { ImageMetadata } from 'astro';
import facadeAire from '../assets/images/showrooms/facade-aire-sur-la-lys.jpg';
import facadeArdres from '../assets/images/showrooms/facade-ardres.jpg';
import facadeRexpoede from '../assets/images/showrooms/facade-rexpoede.jpg';

export const site = {
  name: 'FK Énergie',
  legalName: 'FK ENERGIE',
  url: 'https://www.fk-energie.fr',
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
    /** Médiateur de la consommation (obligatoire pour les ventes aux particuliers, art. L612-1 du code de la consommation). */
    mediator: {
      name: 'CNPM Médiation Consommation',
      address: 'Immeuble L’Horizon, Esplanade de France, 3 rue J. Constant Milleret, 42000 Saint-Étienne',
      email: 'contact-admin@cnpm-mediation-consommation.eu',
      url: 'https://cnpm-mediation-consommation.eu',
    },
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

/** Horaires des showrooms (flyers 2026), sauf ceux qui ont les leurs (`Showroom.hours`). */
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

/** Rexpoëde : mêmes horaires, mais fermé le lundi (confirmé par FK Énergie, octobre 2026). */
const closedMonday: OpeningHours[] = openingHours.map((h) => (h.dayCodes.includes('Monday') ? { ...h, slots: [] } : h));

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
  /** Reçoit aussi les demandes du formulaire pour ce showroom. */
  email: string;
  /** Horaires propres, sinon `openingHours`. */
  hours?: OpeningHours[];
  /** Écart aux horaires communs, affiché sous ceux-ci (« fermé le lundi »). */
  hoursNote?: string;
  intro: string;
  highlights: string[];
  nearby: string[];
  image?: ImageMetadata;
  imageAlt?: string;
  mapsQuery: string;
  /** Coordonnées GPS de l'adresse (Base Adresse Nationale), pour les données structurées. */
  geo: { lat: number; lng: number };
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
    email: 'agence.fkenergie@gmail.com',
    intro:
      "Notre magasin historique : 300 m² d'exposition entièrement dédiés au chauffage au bois et aux granulés. Vous y découvrez des poêles en fonctionnement, dont un système de poêle à granulés canalisable qui chauffe tout le magasin.",
    highlights: [
      '300 m² d’exposition dédiés au bois et aux granulés',
      'Poêles Palazzetti, Stovax, Lotus et Contura en démonstration',
      'Pompes à chaleur et climatisation Atlantic',
      'Système canalisable en fonctionnement',
    ],
    nearby: ['Saint-Omer', 'Isbergues', 'Lillers', 'Hazebrouck', 'Béthune', 'Thérouanne', 'Lumbres'],
    image: facadeAire,
    imageAlt: 'Façade du showroom FK Énergie, 14 rue de Paris à Aire-sur-la-Lys',
    mapsQuery: 'FK Energie 14 rue de Paris 62120 Aire-sur-la-Lys',
    geo: { lat: 50.635318, lng: 2.391029 },
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
    nearby: ['Calais', 'Guînes', 'Licques', 'Audruicq', 'Saint-Omer', 'Marck', 'Oye-Plage', 'Lumbres', 'Bourbourg', 'Gravelines', 'Nordausques', 'Louches'],
    image: facadeArdres,
    imageAlt: 'Façade du showroom FK Énergie à Ardres (Bois-en-Ardres)',
    mapsQuery: 'FK Energie 677 avenue de la Censé Hébron 62610 Ardres',
    geo: { lat: 50.876156, lng: 1.975381 },
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
    email: 'rexpoede.fkenergie@gmail.com',
    hours: closedMonday,
    hoursNote: 'fermé le lundi',
    intro:
      "Notre nouvelle agence, ouverte en 2026 au cœur de Rexpoëde, pour accompagner les habitants de la Flandre maritime et des Hauts de Flandre dans leurs projets de pompe à chaleur et de poêle à granulés.",
    highlights: [
      'Pompes à chaleur Atlantic air/eau et air/air',
      'Poêles à granulés Palazzetti',
      'Étude gratuite et accompagnement aux aides',
    ],
    nearby: ['Bergues', 'Hondschoote', 'Wormhout', 'Dunkerque', 'Bourbourg', 'Cassel', 'Hazebrouck'],
    image: facadeRexpoede,
    imageAlt: 'Façade du showroom FK Énergie, 8 place de la Mairie à Rexpoëde',
    mapsQuery: 'FK Energie 8 place de la Mairie 59122 Rexpoëde',
    geo: { lat: 50.938994, lng: 2.540296 },
  },
];

/** « de » élidé devant une voyelle : « d’Aire-sur-la-Lys », « d’Ardres », « de Rexpoëde ». */
export const prepDe = (ville: string) => (/^[aeiouyàâéèêîôû]/i.test(ville) ? 'd’' : 'de ');
export const deVille = (ville: string) => `${prepDe(ville)}${ville}`;

export const showroomHours = (s: Showroom) => s.hours ?? openingHours;

/** Jours d'ouverture en toutes lettres : « du lundi au samedi ». */
export const openDays = (hours: OpeningHours[]) => {
  const open = hours.filter((h) => h.slots.length);
  const first = open[0].days.split(' – ')[0].toLowerCase();
  const last = open[open.length - 1].days.split(' – ').at(-1)!.toLowerCase();
  return `du ${first} au ${last}`;
};

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
  { label: 'Conseils', href: '/conseils/', description: 'Guides pour bien choisir et entretenir' },
  { label: 'Outils de calcul', href: '/outils/', description: 'Simulateur sur plan, puissance, consommation, coût' },
];

export const mainNav: NavItem[] = [
  { label: 'Nos showrooms', href: '/showrooms/' },
  { label: 'L’entreprise', href: '/entreprise/' },
];

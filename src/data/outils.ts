import type { IconName } from '../components/Icon.astro';

/** Outils de calcul (`/outils/<slug>/`). Les hypothèses chiffrées et leurs sources sont dans `data/thermique.ts`. */
export type Outil = {
  slug: string;
  /** Nom court (cartes, fil d'Ariane). */
  name: string;
  /** Question à laquelle l'outil répond, affichée sur les cartes. */
  question: string;
  icon: IconName;
  /** Pages du site où l'outil est proposé. */
  related: string[];
  /** Outil mis en avant : premier, en grand sur `/outils/` et dans les listes d'outils. */
  vedette?: boolean;
};

export const outils: Outil[] = [
  {
    slug: 'plan-maison',
    name: 'Simulateur de chauffage sur plan',
    question: 'Quelle température dans chaque pièce avec votre poêle, vos radiateurs ou votre pompe à chaleur ?',
    icon: 'home',
    related: ['/poele-a-granules/', '/poele-a-bois/', '/inserts-cheminees/', '/pompes-a-chaleur/', '/chaudieres/'],
    vedette: true,
  },
  {
    slug: 'calcul-puissance-poele',
    name: 'Puissance de poêle',
    question: 'Quelle puissance de poêle à granulés ou à bois pour ma surface ?',
    icon: 'flame',
    related: ['/poele-a-granules/', '/poele-a-bois/', '/inserts-cheminees/'],
  },
  {
    slug: 'consommation-granules',
    name: 'Consommation de granulés',
    question: 'Combien de sacs de granulés par an, et pour quel budget ?',
    icon: 'pellets',
    related: ['/poele-a-granules/', '/chaudieres/'],
  },
  {
    slug: 'comparateur-cout-chauffage',
    name: 'Comparateur de coût',
    question: 'Fioul, électricité, granulés, pompe à chaleur : combien coûte chaque chauffage ?',
    icon: 'euro',
    related: ['/chaudieres/', '/pompes-a-chaleur/', '/poele-a-granules/', '/aides-financieres/'],
  },
  {
    slug: 'dimensionnement-pompe-a-chaleur',
    name: 'Pompe à chaleur et radiateurs',
    question: 'Quelle puissance de pompe à chaleur, et mes radiateurs conviennent-ils ?',
    icon: 'thermometer',
    related: ['/pompes-a-chaleur/', '/chaudieres/'],
  },
  {
    slug: 'convertisseur-bois-stere',
    name: 'Convertisseur bois',
    question: 'Stère, m³, kilos, kWh : combien d’énergie dans mon bois ?',
    icon: 'ruler',
    related: ['/poele-a-bois/', '/inserts-cheminees/', '/chaudieres/'],
  },
];

export const outilUrl = (o: Outil) => `/outils/${o.slug}/`;
export const getOutil = (slug: string) => outils.find((o) => o.slug === slug)!;

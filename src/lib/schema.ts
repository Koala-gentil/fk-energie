import { site, showrooms, openingHours, mapsUrl, productNav, type Showroom } from '../data/site';

const abs = (path: string) => new URL(path, site.url).toString();

export const organizationId = `${site.url}/#organization`;
export const websiteId = `${site.url}/#website`;
export const showroomId = (slug: string) => `${site.url}/showrooms/${slug}/#business`;
export const serviceId = (path: string) => `${abs(path)}#service`;

const hoursSpec = openingHours.flatMap((h) =>
  h.slots.map(([opens, closes]) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.dayCodes.map((d) => `https://schema.org/${d}`),
    opens,
    closes,
  })),
);

const departments = [
  { '@type': 'AdministrativeArea', name: 'Pas-de-Calais' },
  { '@type': 'AdministrativeArea', name: 'Nord' },
];

/** Prestations proposées, reliées aux nœuds `Service` des pages produits. */
const offerCatalog = () => ({
  '@type': 'OfferCatalog',
  name: 'Vente, installation et entretien d’appareils de chauffage',
  itemListElement: [...productNav, { label: 'Entretien & ramonage', href: '/entretien-ramonage/' }].map((p) => ({
    '@type': 'Offer',
    itemOffered: { '@id': serviceId(p.href), '@type': 'Service', name: p.label },
  })),
});

/** @param image URL absolue d'une photo du showroom (générée par la page). */
export const showroomSchema = (s: Showroom, image?: string) => ({
  '@type': 'HVACBusiness',
  '@id': showroomId(s.slug),
  name: `FK Énergie ${s.city}`,
  url: abs(`/showrooms/${s.slug}/`),
  image: image ?? abs('/og-default.jpg'),
  logo: abs('/icon-512.png'),
  telephone: site.phoneIntl,
  ...(s.email ? { email: s.email } : {}),
  priceRange: '€€',
  currenciesAccepted: 'EUR',
  address: {
    '@type': 'PostalAddress',
    streetAddress: s.street,
    postalCode: s.postalCode,
    addressLocality: s.city,
    addressRegion: s.department,
    addressCountry: 'FR',
  },
  geo: { '@type': 'GeoCoordinates', latitude: s.geo.lat, longitude: s.geo.lng },
  hasMap: mapsUrl(s),
  openingHoursSpecification: hoursSpec,
  areaServed: [s.city, ...s.nearby].map((name) => ({ '@type': 'City', name })),
  hasOfferCatalog: offerCatalog(),
  parentOrganization: { '@id': organizationId },
});

export const organizationSchema = () => ({
  '@type': 'Organization',
  '@id': organizationId,
  name: site.name,
  legalName: site.legalName,
  url: site.url,
  logo: { '@type': 'ImageObject', url: abs('/icon-512.png'), width: 512, height: 512 },
  image: abs('/og-default.jpg'),
  description: site.description,
  slogan: site.tagline,
  foundingDate: site.foundingDate,
  telephone: site.phoneIntl,
  email: site.email,
  vatID: site.legal.vat,
  taxID: site.legal.siren.replace(/\s/g, ''),
  naics: '238220',
  isicV4: '4322',
  address: {
    '@type': 'PostalAddress',
    streetAddress: '176 rue du Bois Villain',
    postalCode: '62131',
    addressLocality: 'Drouvin-le-Marais',
    addressRegion: 'Pas-de-Calais',
    addressCountry: 'FR',
  },
  areaServed: departments,
  knowsAbout: ['Poêle à granulés', 'Poêle à bois', 'Pompe à chaleur', 'Chaudière à granulés', 'Insert de cheminée', 'Ramonage'],
  sameAs: [site.facebook],
  hasCredential: site.certifications.map((name) => ({
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'certification',
    name,
    recognizedBy: { '@type': 'Organization', name: 'Qualit’EnR', url: 'https://www.qualit-enr.org/' },
  })),
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: site.phoneIntl,
    contactType: 'customer service',
    areaServed: 'FR',
    availableLanguage: 'French',
  },
  hasOfferCatalog: offerCatalog(),
  subOrganization: showrooms.map((s) => ({ '@id': showroomId(s.slug) })),
});

export const websiteSchema = () => ({
  '@type': 'WebSite',
  '@id': websiteId,
  url: `${site.url}/`,
  name: site.name,
  alternateName: 'FK Énergie Chauffage',
  inLanguage: 'fr-FR',
  publisher: { '@id': organizationId },
});

export type PageType = 'WebPage' | 'AboutPage' | 'ContactPage' | 'CollectionPage' | 'ImageGallery' | 'ItemPage';

export const webPageSchema = (opts: {
  url: string;
  type?: PageType;
  name: string;
  description: string;
  image?: string;
  hasBreadcrumb: boolean;
}) => ({
  '@type': opts.type ?? 'WebPage',
  '@id': `${opts.url}#webpage`,
  url: opts.url,
  name: opts.name,
  description: opts.description,
  inLanguage: 'fr-FR',
  isPartOf: { '@id': websiteId },
  about: { '@id': organizationId },
  ...(opts.image ? { primaryImageOfPage: { '@type': 'ImageObject', url: opts.image } } : {}),
  ...(opts.hasBreadcrumb ? { breadcrumb: { '@id': `${opts.url}#breadcrumb` } } : {}),
});

export type Crumb = { label: string; href: string };

export const breadcrumbSchema = (crumbs: Crumb[], pageUrl: string) => ({
  '@type': 'BreadcrumbList',
  '@id': `${pageUrl}#breadcrumb`,
  itemListElement: [{ label: 'Accueil', href: '/' }, ...crumbs].map((c, i) => ({
    '@type': 'ListItem',
    position: i + 1,
    name: c.label,
    item: abs(c.href),
  })),
});

export type Faq = { q: string; a: string };

export const faqSchema = (faqs: Faq[]) => ({
  '@type': 'FAQPage',
  mainEntity: faqs.map((f) => ({
    '@type': 'Question',
    name: f.q,
    acceptedAnswer: { '@type': 'Answer', text: f.a },
  })),
});

export const serviceSchema = (opts: {
  name: string;
  description: string;
  path: string;
  serviceType: string;
  brands?: string[];
  /** Fournisseur : un showroom (pages locales) plutôt que l'organisation. */
  providerId?: string;
  /** Zone desservie : les deux départements par défaut. */
  areaServed?: Record<string, unknown>[];
}) => ({
  '@type': 'Service',
  '@id': serviceId(opts.path),
  name: opts.name,
  description: opts.description,
  serviceType: opts.serviceType,
  url: abs(opts.path),
  provider: { '@id': opts.providerId ?? organizationId },
  ...(opts.brands?.length ? { brand: opts.brands.map((name) => ({ '@type': 'Brand', name })) } : {}),
  areaServed: opts.areaServed ?? departments,
});

export const articleSchema = (opts: {
  url: string;
  headline: string;
  description: string;
  image?: string;
  datePublished: Date;
  dateModified?: Date;
  section?: string;
}) => ({
  '@type': 'Article',
  '@id': `${opts.url}#article`,
  headline: opts.headline,
  description: opts.description,
  ...(opts.image ? { image: opts.image } : {}),
  datePublished: opts.datePublished.toISOString().slice(0, 10),
  dateModified: (opts.dateModified ?? opts.datePublished).toISOString().slice(0, 10),
  ...(opts.section ? { articleSection: opts.section } : {}),
  inLanguage: 'fr-FR',
  author: { '@id': organizationId },
  publisher: { '@id': organizationId },
  mainEntityOfPage: { '@id': `${opts.url}#webpage` },
});

/** Photo d'une pose, pour Google Images (date, lieu, auteur). */
export const imageObjectSchema = (opts: { url: string; caption: string; date: string; place?: string }) => ({
  '@type': 'ImageObject',
  contentUrl: opts.url,
  caption: opts.caption,
  datePublished: opts.date,
  creator: { '@id': organizationId },
  creditText: site.name,
  copyrightHolder: { '@id': organizationId },
  ...(opts.place ? { contentLocation: { '@type': 'Place', name: `${opts.place}, France` } } : {}),
});

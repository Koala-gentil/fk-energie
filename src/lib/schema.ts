import { site, showrooms, openingHours, type Showroom } from '../data/site';

const abs = (path: string) => new URL(path, site.url).toString();

export const organizationId = `${site.url}/#organization`;

const hoursSpec = openingHours.flatMap((h) =>
  h.slots.map(([opens, closes]) => ({
    '@type': 'OpeningHoursSpecification',
    dayOfWeek: h.dayCodes.map((d) => `https://schema.org/${d}`),
    opens,
    closes,
  })),
);

export const showroomSchema = (s: Showroom) => ({
  '@type': 'HVACBusiness',
  '@id': `${site.url}/showrooms/${s.slug}/#business`,
  name: `FK Énergie ${s.city}`,
  url: abs(`/showrooms/${s.slug}/`),
  image: abs('/og-default.jpg'),
  logo: abs('/icon-512.png'),
  telephone: site.phoneIntl,
  ...(s.email ? { email: s.email } : {}),
  priceRange: '€€',
  address: {
    '@type': 'PostalAddress',
    streetAddress: s.street,
    postalCode: s.postalCode,
    addressLocality: s.city,
    addressRegion: s.department,
    addressCountry: 'FR',
  },
  openingHoursSpecification: hoursSpec,
  areaServed: s.nearby.map((name) => ({ '@type': 'City', name })),
  parentOrganization: { '@id': organizationId },
});

export const organizationSchema = () => ({
  '@type': 'Organization',
  '@id': organizationId,
  name: site.name,
  legalName: site.legalName,
  url: site.url,
  logo: abs('/icon-512.png'),
  image: abs('/og-default.jpg'),
  description: site.description,
  foundingDate: site.foundingDate,
  telephone: site.phoneIntl,
  email: site.email,
  vatID: site.legal.vat,
  sameAs: [site.facebook],
  hasCredential: site.certifications.map((name) => ({
    '@type': 'EducationalOccupationalCredential',
    credentialCategory: 'certification',
    name,
  })),
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: site.phoneIntl,
    contactType: 'customer service',
    areaServed: 'FR',
    availableLanguage: 'French',
  },
  subOrganization: showrooms.map((s) => ({ '@id': `${site.url}/showrooms/${s.slug}/#business` })),
});

export const websiteSchema = () => ({
  '@type': 'WebSite',
  '@id': `${site.url}/#website`,
  url: site.url,
  name: site.name,
  inLanguage: 'fr-FR',
  publisher: { '@id': organizationId },
});

export type Crumb = { label: string; href: string };

export const breadcrumbSchema = (crumbs: Crumb[]) => ({
  '@type': 'BreadcrumbList',
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

export const serviceSchema = (opts: { name: string; description: string; path: string; serviceType: string }) => ({
  '@type': 'Service',
  name: opts.name,
  description: opts.description,
  serviceType: opts.serviceType,
  url: abs(opts.path),
  provider: { '@id': organizationId },
  areaServed: [
    { '@type': 'AdministrativeArea', name: 'Pas-de-Calais' },
    { '@type': 'AdministrativeArea', name: 'Nord' },
  ],
});

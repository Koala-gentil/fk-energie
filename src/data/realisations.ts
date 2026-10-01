import type { ImageMetadata } from 'astro';

export type Category = 'granules' | 'bois';

export type Realisation = {
  image: ImageMetadata;
  title: string;
  category: Category;
  /** Date de publication de la pose (AAAA-MM-JJ), issue de la page Facebook. */
  date: string;
  brand?: string;
  place?: string;
  alt: string;
};

const img = import.meta.glob<{ default: ImageMetadata }>('../assets/images/realisations/*.jpg', { eager: true });
const get = (name: string) => {
  const mod = img[`../assets/images/realisations/${name}.jpg`];
  if (!mod) throw new Error(`Image de réalisation introuvable : ${name}`);
  return mod.default;
};

const r = (file: string, title: string, category: Category, date: string, extra: Partial<Realisation> = {}): Realisation => ({
  image: get(file),
  title,
  category,
  date,
  alt: `${title}${extra.place ? ` à ${extra.place}` : ''}, installé par FK Énergie`,
  ...extra,
});

/** Poses réalisées par les équipes FK Énergie (photos et dates issues de la page Facebook). Du plus récent au plus ancien. */
export const realisations: Realisation[] = [
  r('poele-granules-palazzetti-anna-pro-3', 'Palazzetti Anna Pro 3', 'granules', '2026-09-29', { brand: 'Palazzetti' }),
  r('poele-bois-rond-blanc', 'Poêle à bois habillage blanc', 'bois', '2026-07-24'),
  r('poele-bois-pierre-ollaire', 'Poêle à bois en pierre ollaire', 'bois', '2026-07-21'),
  r('poele-granules-gain-de-place', 'Poêle à granulés gain de place', 'granules', '2026-06-19'),
  r('poele-bois-saint-omer', 'Poêle à bois en céramique', 'bois', '2026-04-30', { place: 'Saint-Omer' }),
  r('poele-bois-lotus-orbis-2', 'Lotus Orbis 2, pierre Indian Night', 'bois', '2026-03-11', { brand: 'Lotus', place: 'Aire-sur-la-Lys' }),
  r('poele-granules-licques', 'Poêle à granulés', 'granules', '2026-02-28', { place: 'Licques' }),
  r('poele-bois-lotus-jubilee-25m', 'Lotus Jubilee 25M en pierre ollaire', 'bois', '2026-02-13', { brand: 'Lotus' }),
  r('poele-granules-palazzetti-vivi-us', 'Palazzetti Vivi US 9 kW', 'granules', '2026-02-02', { brand: 'Palazzetti' }),
  r('poele-bois-colonne-blanc', 'Poêle à bois colonne blanc', 'bois', '2026-07-24'),
  r('poele-bois-fonte-niche', 'Poêle à bois en fonte', 'bois', '2026-07-21'),
  r('poele-granules-gain-de-place-2', 'Poêle à granulés gain de place', 'granules', '2026-06-19'),
  r('poele-bois-saint-omer-2', 'Poêle à bois en pierre', 'bois', '2026-04-30', { place: 'Saint-Omer' }),
  r('poele-granules-licques-2', 'Poêle à granulés', 'granules', '2026-02-28', { place: 'Licques' }),
  r('poele-bois-lotus-jubilee-25', 'Lotus Jubilee 25', 'bois', '2025-07-02', { brand: 'Lotus' }),
  r('poele-bois-heta-scan-line-1000', 'HETA Scan-Line 1000', 'bois', '2025-04-11', { brand: 'HETA' }),
  r('poele-granules-blanc', 'Poêle à granulés blanc', 'granules', '2025-03-15'),
  r('poele-granules-noir', 'Poêle à granulés noir', 'granules', '2025-03-15'),
  r('poele-granules-palazzetti-marianne', 'Palazzetti Marianne 9 kW', 'granules', '2024-09-19', { brand: 'Palazzetti' }),
  r('poele-bois-contura', 'Poêle à bois Contura', 'bois', '2024-09-11', { brand: 'Contura' }),
  r('poele-granules-palazzetti', 'Poêle à granulés Palazzetti', 'granules', '2024-08-22', { brand: 'Palazzetti' }),
  r('poele-granules-blanc-2', 'Poêle à granulés blanc', 'granules', '2024-08-22'),
  r('poele-granules-parquet', 'Poêle à granulés sur parquet', 'granules', '2024-08-22'),
  r('poele-bois-heta-serie-8', 'HETA Série 8', 'bois', '2024-07-25', { brand: 'HETA' }),
  r('poele-granules-gris', 'Poêle à granulés', 'granules', '2024-07-18'),
  r('poele-bois-rond-noir', 'Poêle à bois rond', 'bois', '2024-07-18'),
  r('poele-bois-habillage-bois', 'Poêle à bois d’angle', 'bois', '2024-07-05'),
  r('poele-bois-habillage-bois-2', 'Poêle à bois habillage pierre', 'bois', '2024-07-05'),
];

/** Carnet : une photo par pose, la plus récente d'abord. */
export const carnet = [...realisations].sort((a, b) => b.date.localeCompare(a.date));

export const byCategory = (c: Category) => poses.filter((x) => x.category === c);

export const formatMonth = (iso: string) => {
  const s = new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(`${iso}T12:00:00`));
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** Une entrée par pose (plusieurs photos d'une même pose partagent la même date). */
export const poses = carnet.filter((r, i, all) => all.findIndex((x) => x.date === r.date) === i);

import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/** Guides pratiques (`/conseils/`) : un fichier Markdown par article, sources obligatoires. */
const conseils = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/conseils' }),
  schema: ({ image }) =>
    z.object({
      /** Titre affiché (H1). */
      title: z.string(),
      /** Balise <title>, sans le nom de l'entreprise (ajouté automatiquement). */
      seoTitle: z.string().max(50),
      description: z.string().max(160),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      category: z.enum(['Choisir son chauffage', 'Entretien', 'Aides et réglementation']),
      /** Pages du site liées : le guide y est proposé en lecture complémentaire. */
      related: z.array(z.string().regex(/^\/.*\/$/)).default([]),
      /** Photo d'illustration (chemin relatif au fichier Markdown), aussi utilisée pour le partage. */
      image: image(),
      imageAlt: z.string(),
      faq: z.array(z.object({ q: z.string(), a: z.string() })).default([]),
      sources: z.array(z.object({ label: z.string(), url: z.url() })).min(1),
    }),
});

export const collections = { conseils };

import type { ImageMetadata } from 'astro';
import { getImage } from 'astro:assets';
import { site } from '../data/site';

/** URL absolue d'une version JPEG d'une image importée, pour les données structurées. */
export const absoluteImage = async (src: ImageMetadata, width = 1200) =>
  new URL((await getImage({ src, width, format: 'jpeg', quality: 80 })).src, site.url).toString();

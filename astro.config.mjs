// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Les redirections 301 de l'ancien site (src/data/redirects.json) sont injectées dans la config
// Vercel après le build par scripts/vercel-redirects.mjs.

// https://astro.build/config
export default defineConfig({
  site: 'https://www.fk-energie-chauffage.fr',
  trailingSlash: 'always',

  vite: {
    plugins: [tailwindcss()],
  },

  integrations: [
    sitemap({
      // Pages non indexées : confirmation de contact, simulateur plein écran (sa page de présentation l'est)
      filter: (page) => !page.includes('/contact/merci/') && !page.includes('/outils/plan-maison/simulateur/'),
      i18n: { defaultLocale: 'fr', locales: { fr: 'fr-FR' } },
    }),
  ],

  adapter: vercel(),

  // Variables d'environnement du formulaire de contact (à définir dans Vercel > Settings > Environment Variables)
  env: {
    schema: {
      RESEND_API_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
      CONTACT_EMAIL_TO: envField.string({ context: 'server', access: 'secret', default: 'fkenergie@orange.fr' }),
      CONTACT_EMAIL_FROM: envField.string({
        context: 'server',
        access: 'secret',
        default: 'Site FK Énergie <site@fk-energie-chauffage.fr>',
      }),
    },
  },
});

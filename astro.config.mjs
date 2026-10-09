// @ts-check
import { defineConfig, envField } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Les redirections 301 de l'ancien site (src/data/redirects.json) sont injectées dans la config
// Vercel après le build par scripts/vercel-redirects.mjs.

// https://astro.build/config
export default defineConfig({
  site: 'https://www.fk-energie.fr',
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
      // Destinataire quand le showroom n'est pas identifié (sinon : e-mail du showroom, src/data/site.ts)
      CONTACT_EMAIL_TO: envField.string({ context: 'server', access: 'secret', default: 'agence.fkenergie@gmail.com' }),
      CONTACT_EMAIL_FROM: envField.string({
        context: 'server',
        access: 'secret',
        default: 'Site FK Énergie <site@fk-energie.fr>',
      }),
      // Anti-robot Cloudflare Turnstile : actif seulement si les deux clés sont définies
      PUBLIC_TURNSTILE_SITE_KEY: envField.string({ context: 'client', access: 'public', optional: true }),
      TURNSTILE_SECRET_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});

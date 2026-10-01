## Projet

Site vitrine de FK Énergie (Astro 7 + Tailwind 4, déployé sur Vercel). Voir `README.md` pour la structure et
`research/fiche-entreprise.md` pour toutes les informations sur l'entreprise (source de vérité du contenu).

- Coordonnées, showrooms, horaires, navigation : `src/data/site.ts` uniquement, sans rien dupliquer en dur dans les pages.
- Toutes les URL se terminent par `/` (`trailingSlash: 'always'`).
- Les anciennes URL sont redirigées via `src/data/redirects.json` + `scripts/vercel-redirects.mjs` (post-build). Ne pas utiliser
  l'option `redirects` d'Astro : avec l'adaptateur Vercel, ces redirections ne s'appliquent pas (voir le script).
- Tout le texte du site est en français. Ne pas inventer de chiffres ni d'avis clients.
- Vérifier avec `npm run build && npx astro check` avant de livrer.

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)

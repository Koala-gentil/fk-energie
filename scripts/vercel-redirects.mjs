// Injecte les redirections 301 de l'ancien site dans la config Vercel générée par @astrojs/vercel.
//
// Pourquoi un script : avec `trailingSlash: 'always'`, l'adaptateur place sa règle 308 « ajout du /
// final » AVANT les redirections et génère des motifs sans slash final. Les anciennes URL finissaient
// donc en 404. Ici, on place les 301 en tête et on accepte l'URL avec ou sans slash final.
import { readFileSync, writeFileSync, existsSync } from 'node:fs';

const CONFIG = '.vercel/output/config.json';
if (!existsSync(CONFIG)) {
  console.log('[redirects] pas de sortie Vercel, rien à faire');
  process.exit(0);
}

const redirects = JSON.parse(readFileSync('src/data/redirects.json', 'utf8'));
const config = JSON.parse(readFileSync(CONFIG, 'utf8'));
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const routes = Object.entries(redirects).map(([from, { status, destination }]) => ({
  src: `^${escape(from.replace(/\/+$/, ''))}/?$`,
  headers: { Location: destination },
  status,
}));

const firstRedirect = config.routes.findIndex((r) => 'status' in r);
config.routes.splice(firstRedirect === -1 ? 0 : firstRedirect, 0, ...routes);
writeFileSync(CONFIG, JSON.stringify(config, null, 2));
console.log(`[redirects] ${routes.length} redirections 301 ajoutées à ${CONFIG}`);

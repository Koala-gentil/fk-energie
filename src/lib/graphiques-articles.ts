/**
 * Graphiques insérables dans les guides `/conseils/` : un article Markdown place `<div data-graphique="<nom>">` (avec
 * un texte de repli) et la page le remplit avec le même code que les outils, pour que les chiffres restent identiques.
 */
import { bois } from '../data/thermique';
import { energieStere } from './graphiques-outils';
import { fmt } from './thermique';

/**
 * Température moyenne des trois chambres de l'étage selon le réglage du poêle, résultats du simulateur
 * `/outils/plan-maison/` (modèle « Maison à étage » bien isolé, poêle à granulés de 8 kW dans le séjour, portes des
 * chambres ouvertes, aucun autre chauffage). Valeurs figées : le simulateur est trop lourd pour être chargé dans
 * chaque guide. Scénarios et hypothèses : `research/article-puissance-poele.md`.
 */
const chambresSelonConsigne = [
  { consigne: 20, doux: 16.5, froid: 12.6 },
  { consigne: 21, doux: 17.2, froid: 13.3 },
  { consigne: 22, doux: 17.8, froid: 14.1 },
  { consigne: 23, doux: 18.5, froid: 14.8 },
];

/** Barres de température, graduées de 10 à 24 °C, avec un repère à 18 °C. */
const temperaturesEtage = () => {
  const min = 10;
  const max = 24;
  const cible = 18;
  const pct = (t: number) => ((Math.min(max, Math.max(min, t)) - min) / (max - min)) * 100;
  const barre = (label: string, t: number, classe: string) => `<li class="flex flex-col gap-1">
  <div class="flex items-baseline justify-between gap-3 text-sm">
    <span class="text-ink-700">${label}</span>
    <span class="shrink-0 font-semibold tabular-nums text-ink-900">${fmt(t)} °C</span>
  </div>
  <div class="relative h-3" aria-hidden="true">
    <span class="absolute inset-y-0 left-0 rounded-r ${classe}" style="width:${pct(t)}%"></span>
    <span class="absolute -top-1 h-5 w-0.5 rounded-full bg-ink-900" style="left:${pct(cible)}%"></span>
  </div>
</li>`;
  const groupes = chambresSelonConsigne
    .map(
      (c) => `<li>
  <p class="font-bold text-ink-900">Poêle réglé à ${c.consigne} °C</p>
  <ul class="mt-2 flex flex-col gap-2">${barre('Par 3 °C dehors', c.doux, 'bg-ember-500')}${barre('Par −9,5 °C dehors', c.froid, 'bg-ink-700')}</ul>
</li>`,
    )
    .join('');
  return `<ul class="flex flex-col gap-6">${groupes}</ul>
<p class="mt-5 flex items-center gap-2 text-sm text-ink-600"><span class="h-4 w-0.5 rounded-full bg-ink-900" aria-hidden="true"></span>18 °C dans les chambres (barres graduées de ${min} à ${max} °C)</p>`;
};

export const graphiquesArticles: Record<string, () => string> = {
  /** Où part l'énergie d'un stère de chêne sec ou humide, dans un poêle récent. */
  'energie-stere': () => energieStere(bois.essences[0]),
  /** Température des chambres de l'étage selon le réglage du poêle, par temps doux et par grand froid. */
  'temperatures-etage': temperaturesEtage,
};

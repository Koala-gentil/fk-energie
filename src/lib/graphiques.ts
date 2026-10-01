/**
 * Graphiques des outils `/outils/` : fonctions pures qui renvoient du HTML (barres, colonnes, jauge) ou du SVG (courbe).
 * Elles servent au build, pour l'état initial affiché sans JavaScript, et dans le navigateur, pour la mise à jour en
 * direct (`element.innerHTML = barres(...)`). Couleurs de la charte : braise pour ce qui concerne le visiteur, encre
 * pour le reste. Chaque valeur est aussi écrite en texte : la couleur ne porte jamais seule l'information.
 */

/** Rôle d'une barre : `accent` = le cas du visiteur, `fort` = repère (chauffage actuel), `neutre` = le reste. */
export type Ton = 'accent' | 'neutre' | 'fort' | 'discret';
/** Fond clair (cartes) ou sombre (panneau de résultat). */
export type Theme = 'clair' | 'sombre';
/** Zones d'une jauge ou d'une courbe : du plus favorable au hors limite. */
export type Zone = 'bien' | 'moyen' | 'attention' | 'hors' | 'neutre';

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
const clamp = (x: number, min: number, max: number) => Math.min(max, Math.max(min, x));

const fonds: Record<Theme, Record<Ton, string>> = {
  clair: { accent: 'bg-ember-500', neutre: 'bg-ink-300', fort: 'bg-ink-700', discret: 'bg-ink-200' },
  sombre: { accent: 'bg-ember-400', neutre: 'bg-ink-600', fort: 'bg-ink-200', discret: 'bg-ink-700' },
};
const zones: Record<Theme, Record<Zone, string>> = {
  clair: { bien: 'bg-moss-500', moyen: 'bg-ember-200', attention: 'bg-ember-400', hors: 'bg-danger-700', neutre: 'bg-ink-300' },
  sombre: { bien: 'bg-moss-400', moyen: 'bg-ember-200', attention: 'bg-ember-400', hors: 'bg-danger-500', neutre: 'bg-ink-600' },
};
/** Même code couleur, en SVG (fonds de zone très pâles derrière la courbe). */
const zonesSvg: Record<Zone, string> = { bien: 'fill-moss-100', moyen: 'fill-ember-50', attention: 'fill-ember-100', hors: 'fill-danger-50', neutre: 'fill-ink-100' };
const textes: Record<Theme, { label: string; fort: string; note: string; ligne: string }> = {
  clair: { label: 'text-ink-700', fort: 'text-ink-900', note: 'text-ink-600', ligne: 'border-ink-200' },
  sombre: { label: 'text-ink-200', fort: 'text-white', note: 'text-ink-300', ligne: 'border-ink-700' },
};

export type Barre = { label: string; valeur: number; texte: string; ton?: Ton; note?: string };

/**
 * Barres horizontales, une par ligne : libellé et valeur au-dessus, barre dessous. `repere` trace un trait vertical
 * sur chaque barre (ex. : la puissance maximale d'un poêle), expliqué sous le graphique.
 */
export const barres = (items: Barre[], o: { max?: number; repere?: { valeur: number; label: string }; theme?: Theme } = {}) => {
  const theme = o.theme ?? 'clair';
  const t = textes[theme];
  const max = o.max ?? Math.max(...items.map((i) => i.valeur), o.repere?.valeur ?? 0) * 1.04;
  const pct = (v: number) => (max > 0 ? clamp((v / max) * 100, 0, 100) : 0);
  const repere = o.repere && o.repere.valeur <= max ? o.repere : undefined;
  const tick = repere
    ? `<span class="absolute -top-1 h-5 w-0.5 rounded-full ${theme === 'clair' ? 'bg-ink-900' : 'bg-white'}" style="left:${pct(repere.valeur)}%"></span>`
    : '';
  const lignes = items
    .map((i) => {
      const ton = i.ton ?? 'neutre';
      const mis = ton === 'accent' || ton === 'fort';
      return `<li class="flex flex-col gap-1.5">
  <div class="flex items-baseline justify-between gap-3">
    <span class="${mis ? `font-bold ${t.fort}` : t.label}">${esc(i.label)}</span>
    <span class="shrink-0 font-semibold whitespace-nowrap tabular-nums ${t.fort}">${esc(i.texte)}</span>
  </div>
  <div class="relative h-3" aria-hidden="true">
    <span class="absolute inset-y-0 left-0 rounded-r ${fonds[theme][ton]}" style="width:${i.valeur > 0 ? Math.max(pct(i.valeur), 0.8) : 0}%"></span>${tick}
  </div>${i.note ? `\n  <span class="text-sm ${t.note}">${esc(i.note)}</span>` : ''}
</li>`;
    })
    .join('');
  const legende = repere
    ? `<p class="mt-4 flex items-center gap-2 text-sm ${t.note}"><span class="h-4 w-0.5 rounded-full ${theme === 'clair' ? 'bg-ink-900' : 'bg-white'}" aria-hidden="true"></span>${esc(repere.label)}</p>`
    : '';
  return `<ul class="flex flex-col gap-4">${lignes}</ul>${legende}`;
};

/** `fantome` : contour en pointillé d'une valeur de comparaison (ex. : ce qu'on pourrait croire). */
export type Colonne = Barre & { court?: string; fantome?: number };

/** Colonnes verticales, valeur au sommet, libellé dessous (`court` sur mobile). */
export const colonnes = (items: Colonne[], o: { max?: number; hauteur?: number; theme?: Theme } = {}) => {
  const theme = o.theme ?? 'clair';
  const t = textes[theme];
  const hauteur = o.hauteur ?? 170;
  const zone = hauteur - 22;
  const max = o.max ?? Math.max(...items.map((i) => i.valeur));
  const cols = items
    .map((i) => {
      const px = (v: number) => (max > 0 && v > 0 ? Math.max(3, (v / max) * zone) : 0);
      const h = px(i.valeur);
      const hf = i.fantome ? px(i.fantome) : 0;
      const mis = i.ton === 'accent' || i.ton === 'fort';
      return `<div class="flex min-w-0 flex-1 flex-col items-center justify-end">
  <span class="mb-1 text-[11px] whitespace-nowrap tabular-nums sm:text-xs ${mis ? `font-bold ${t.fort}` : `font-semibold ${t.label}`}" aria-hidden="true">${esc(i.texte)}</span>
  <span class="relative flex w-full max-w-6 flex-col justify-end" style="height:${Math.max(h, hf)}px" aria-hidden="true">${
    hf ? `<span class="absolute -inset-x-1 bottom-0 rounded-t-md border-2 border-b-0 border-dashed ${theme === 'clair' ? 'border-ink-500' : 'border-ink-300'}" style="height:${hf}px"></span>` : ''
  }<span class="relative w-full rounded-t ${fonds[theme][i.ton ?? 'neutre']}" style="height:${h}px"></span></span>
  <span class="sr-only">${esc(i.label)} : ${esc(i.texte || '0')}</span>
</div>`;
    })
    .join('');
  const labels = items
    .map(
      (i) =>
        `<span class="min-w-0 flex-1 text-center text-[11px] leading-tight sm:text-xs ${i.ton === 'accent' ? `font-bold ${t.fort}` : t.note}">${
          i.court ? `<span class="sm:hidden">${esc(i.court)}</span><span class="hidden sm:inline">${esc(i.label)}</span>` : esc(i.label)
        }</span>`,
    )
    .join('');
  return `<div class="flex items-end gap-1 sm:gap-2" style="height:${hauteur}px">${cols}</div>
<div class="mt-0 flex gap-1 border-t-2 pt-2 sm:gap-2 ${t.ligne}" aria-hidden="true">${labels}</div>`;
};

export type SegmentJauge = { jusqua: number; label: string; zone: Zone };

/**
 * Jauge horizontale découpée en zones (ex. : petit besoin, un poêle suffit, trop pour un poêle), avec un repère sur la
 * valeur du visiteur. Une valeur hors de l'échelle se cale au bord.
 */
export const jauge = (o: { min: number; segments: SegmentJauge[]; valeur: number; texte: string; graduations: { valeur: number; texte: string }[]; theme?: Theme }) => {
  const theme = o.theme ?? 'clair';
  const t = textes[theme];
  const max = o.segments[o.segments.length - 1].jusqua;
  const pos = (v: number) => clamp(((v - o.min) / (max - o.min)) * 100, 0, 100);
  const x = pos(o.valeur);
  const decalage = x < 14 ? '0' : x > 86 ? '-100%' : '-50%';
  let debut = o.min;
  const bandes = o.segments
    .map((s) => {
      const b = `<span class="${zones[theme][s.zone]}" style="flex:${s.jusqua - debut} 1 0"></span>`;
      debut = s.jusqua;
      return b;
    })
    .join('');
  const grads = o.graduations
    .map((g) => {
      const p = pos(g.valeur);
      return `<span class="absolute whitespace-nowrap tabular-nums" style="left:${p}%;transform:translateX(${p < 3 ? '0' : p > 97 ? '-100%' : '-50%'})">${esc(g.texte)}</span>`;
    })
    .join('');
  const legende = o.segments
    .map((s) => `<li class="flex items-center gap-1.5"><span class="size-2.5 shrink-0 rounded-full ${zones[theme][s.zone]}" aria-hidden="true"></span>${esc(s.label)}</li>`)
    .join('');
  return `<div class="pt-8">
  <div class="relative">
    <div class="flex h-3 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">${bandes}</div>
    <span class="absolute -top-2 h-7 w-1.5 -translate-x-1/2 rounded-full ${theme === 'clair' ? 'bg-ink-900 ring-2 ring-white' : 'bg-white ring-2 ring-ink-900'}" style="left:${x}%" aria-hidden="true"></span>
    <span class="absolute -top-8 text-sm font-bold whitespace-nowrap ${t.fort}" style="left:${x}%;transform:translateX(${decalage})">${esc(o.texte)}</span>
  </div>
  <div class="relative mt-2 h-4 text-xs ${t.note}" aria-hidden="true">${grads}</div>
  <ul class="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs ${t.note}">${legende}</ul>
</div>`;
};

/** Pas de graduation « rond » (1, 2, 2,5 ou 5 × 10ⁿ) pour couvrir `etendue` en environ `n` intervalles. */
export const pasRond = (etendue: number, n = 4) => {
  const brut = etendue / n;
  const p = Math.pow(10, Math.floor(Math.log10(brut)));
  return ([1, 2, 2.5, 5, 10].find((m) => m * p >= brut) ?? 10) * p;
};

type Axe = { min: number; max: number; pas: number; format: (v: number) => string };

/** Géométrie d'une courbe, pour convertir la position du pointeur en valeur (survol). */
export const margesCourbe = { gauche: 46, droite: 14, haut: 14, bas: 30 };

/**
 * Courbe (SVG, à la taille réelle du conteneur pour garder un texte lisible) : une série, une ligne horizontale de
 * référence, des zones colorées le long de l'axe horizontal et un point remarquable.
 */
export const courbe = (o: {
  largeur: number;
  hauteur: number;
  x: Axe;
  y: Axe;
  points: [number, number][];
  horizontale?: { y: number; label: string };
  zones?: { de: number; a: number; zone: Zone }[];
  point?: { x: number; y: number; label: string };
  titre: string;
}) => {
  const m = margesCourbe;
  const w = o.largeur - m.gauche - m.droite;
  const h = o.hauteur - m.haut - m.bas;
  const X = (v: number) => m.gauche + ((clamp(v, o.x.min, o.x.max) - o.x.min) / (o.x.max - o.x.min)) * w;
  const Y = (v: number) => m.haut + h - ((clamp(v, o.y.min, o.y.max) - o.y.min) / (o.y.max - o.y.min)) * h;
  const r = (n: number) => Math.round(n * 10) / 10;
  const parts: string[] = [];
  for (const z of o.zones ?? []) {
    parts.push(`<rect x="${r(X(z.de))}" y="${m.haut}" width="${r(X(z.a) - X(z.de))}" height="${h}" class="${zonesSvg[z.zone]}"/>`);
  }
  for (let v = o.y.min; v <= o.y.max + 1e-9; v += o.y.pas) {
    parts.push(`<line x1="${m.gauche}" x2="${m.gauche + w}" y1="${r(Y(v))}" y2="${r(Y(v))}" class="stroke-ink-200" stroke-width="1"/>`);
    parts.push(`<text x="${m.gauche - 8}" y="${r(Y(v)) + 4}" text-anchor="end" class="fill-ink-600 text-xs tabular-nums">${esc(o.y.format(v))}</text>`);
  }
  for (let v = o.x.min; v <= o.x.max + 1e-9; v += o.x.pas) {
    parts.push(`<text x="${r(X(v))}" y="${m.haut + h + 20}" text-anchor="middle" class="fill-ink-600 text-xs tabular-nums">${esc(o.x.format(v))}</text>`);
  }
  if (o.horizontale) {
    const y = r(Y(o.horizontale.y));
    parts.push(`<line x1="${m.gauche}" x2="${m.gauche + w}" y1="${y}" y2="${y}" class="stroke-ink-900" stroke-width="2"/>`);
    parts.push(`<text x="${m.gauche + 8}" y="${y - 8}" class="fill-ink-900 text-[13px] font-bold">${esc(o.horizontale.label)}</text>`);
  }
  const d = o.points
    .filter(([, y]) => y <= o.y.max * 1.5)
    .map(([x, y], i) => `${i ? 'L' : 'M'}${r(X(x))},${r(Y(y))}`)
    .join('');
  parts.push(`<path d="${d}" fill="none" class="stroke-ember-600" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>`);
  if (o.point) {
    const px = r(X(o.point.x));
    const py = r(Y(o.point.y));
    parts.push(`<line x1="${px}" x2="${px}" y1="${py}" y2="${m.haut + h}" class="stroke-ember-600" stroke-width="1"/>`);
    parts.push(`<circle cx="${px}" cy="${py}" r="6" class="fill-ember-600 stroke-white" stroke-width="2"/>`);
    // Sous la ligne, à droite du point (zone libre : la courbe y est au-dessus) ; calé au bord droit si le texte (14 px,
    // gras, largeur approximative) déborderait.
    const deborde = px + 10 + o.point.label.length * 7.6 > o.largeur - m.droite;
    parts.push(
      `<text x="${deborde ? o.largeur - m.droite : px + 10}" y="${py + 22}" text-anchor="${deborde ? 'end' : 'start'}" class="fill-ink-900 text-sm font-bold">${esc(o.point.label)}</text>`,
    );
  }
  parts.push(`<line data-curseur x1="0" x2="0" y1="${m.haut}" y2="${m.haut + h}" class="stroke-ink-500" stroke-width="1" visibility="hidden"/>`);
  return `<svg viewBox="0 0 ${o.largeur} ${o.hauteur}" width="${o.largeur}" height="${o.hauteur}" role="img" aria-label="${esc(o.titre)}" class="block max-w-full overflow-visible font-sans">${parts.join('')}</svg>`;
};

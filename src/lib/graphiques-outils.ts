/**
 * Graphiques de chaque outil `/outils/`, construits avec `lib/graphiques.ts`. Une seule fonction par graphique, appelée
 * au build (état initial) et dans le navigateur (mise à jour en direct), pour que les deux affichent toujours la même chose.
 */
import { climat, isolations, poele, granules, energies, bois, radiateurs, pac, systemes, type Systeme } from '../data/thermique';
import { deperditions, puissanceKw, consommationMaison, puissanceRadiateur, pciBois, fmt, euros } from './thermique';
import { barres, colonnes, jauge, courbe, pasRond, type Ton } from './graphiques';

const G = (i: (typeof isolations)[number], maison: unknown) => (maison === 'mitoyenne' ? i.Gmitoyen : i.G);
const kwMaison = (surface: number, hauteur: number, g: number) => puissanceKw(deperditions(surface, hauteur, g), climat.tInterieure, climat.tBase);

/* ---------- Puissance de poêle ---------- */

/** Où se situe le besoin par rapport aux poêles du marché (4 à 12 kW). */
export const jaugePoele = (kw: number) => {
  const max = 20;
  return jauge({
    min: 0,
    theme: 'sombre',
    valeur: kw,
    texte: kw > max ? `Vous : plus de ${max} kW` : `Vous : ${fmt(kw)} kW`,
    segments: [
      { jusqua: poele.puissanceMin, label: 'Petit besoin', zone: 'neutre' },
      { jusqua: poele.puissanceMax, label: 'Un poêle suffit', zone: 'bien' },
      { jusqua: max, label: 'Trop pour un poêle seul', zone: 'hors' },
    ],
    graduations: [0, poele.puissanceMin, poele.puissanceMax, max].map((v) => ({ valeur: v, texte: `${v} kW` })),
  });
};

/** Puissance nécessaire par grand froid pour la même surface, selon l'isolation. */
export const puissanceParIsolation = (surface: number, hauteur: number, maison: unknown, choisie: string, repere?: { valeur: number; label: string }) =>
  barres(
    isolations.map((i) => {
      const kw = kwMaison(surface, hauteur, G(i, maison));
      return { label: i.short, valeur: kw, texte: `${fmt(kw)} kW`, ton: (i.value === choisie ? 'accent' : 'neutre') as Ton };
    }),
    { repere },
  );

export const poeleParIsolation = (surface: number, hauteur: number, maison: unknown, choisie: string) =>
  puissanceParIsolation(surface, hauteur, maison, choisie, { valeur: poele.puissanceMax, label: `${poele.puissanceMax} kW : à peu près le plus gros poêle du marché` });

/** Surface (m²) qu'un poêle de `kw` kW chauffe par grand froid. */
export const surfacePourPoele = (kw: number, hauteur: number, g: number) => (kw * 1000) / (hauteur * g * (climat.tInterieure - climat.tBase));

/** Surface chauffée par un poêle de `kw` kW, selon l'isolation. */
export const surfaceParIsolation = (kw: number, hauteur: number, maison: unknown, choisie: string) =>
  barres(
    isolations.map((i) => {
      const s = Math.round(surfacePourPoele(kw, hauteur, G(i, maison)) / 5) * 5;
      return { label: i.short, valeur: s, texte: `${fmt(s, 0)} m²`, ton: (i.value === choisie ? 'accent' : 'neutre') as Ton };
    }),
  );

/* ---------- Consommation de granulés ---------- */

const moisCourts = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];
const mois = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

/** Répartition de la consommation annuelle (kg) sur les mois, au prorata des degrés-heures. */
export const kgParMois = (kgAn: number) => climat.dh19Mois.map((dh) => (kgAn * dh) / climat.dh19);

/** Sacs (poêle) ou kilos (chaudière) mois par mois. */
export const granulesParMois = (kgAn: number, chaudiere: boolean) => {
  const valeurs = kgParMois(kgAn).map((kg) => (chaudiere ? kg : kg / granules.sacKg));
  const max = Math.max(...valeurs);
  const texte = (v: number) => (v === 0 ? '' : chaudiere ? fmt(Math.round(v / 10) * 10, 0) : v < 0.5 ? '< 1' : fmt(Math.round(v), 0));
  return colonnes(
    valeurs.map((v, i) => ({ label: mois[i], court: moisCourts[i], valeur: v, texte: texte(v), ton: (v === max ? 'accent' : 'neutre') as Ton })),
    { hauteur: 190 },
  );
};

/** Granulés par an pour la même surface, selon l'isolation. */
export const granulesParIsolation = (
  surface: number,
  hauteur: number,
  maison: unknown,
  choisie: string,
  s: Systeme,
  part: number,
  chaudiere: boolean,
) =>
  barres(
    isolations.map((i) => {
      const kg = (consommationMaison(surface, hauteur, { G: G(i, maison), apports: i.apports }, s, climat.dh19).kwh * part) / granules.pci;
      return {
        label: i.short,
        valeur: kg,
        texte: chaudiere ? `${fmt(kg / 1000)} t` : `${fmt(Math.round(kg / granules.sacKg), 0)} sacs`,
        ton: (i.value === choisie ? 'accent' : 'neutre') as Ton,
      };
    }),
  );

/* ---------- Comparateur de coût ---------- */

export type CoutSysteme = { s: Systeme; cout: number };

/** Facture annuelle de chaque chauffage : le chauffage actuel en foncé, nos solutions en braise. */
export const coutsChauffage = (couts: CoutSysteme[], actuel: string) =>
  barres(
    couts.map(({ s, cout }) => ({
      label: `${s.label}${s.portee === 'piece' ? ' *' : ''}${s.id === actuel ? ' (votre chauffage)' : ''}`,
      valeur: cout,
      texte: `${euros(cout)} / an`,
      ton: (s.id === actuel ? 'fort' : s.fk ? 'accent' : 'neutre') as Ton,
    })),
  );

/** Prix du kWh de chaleur (c€), rendements compris. */
export const centimesChaleur = (s: Systeme, prix = energies[s.energie].prix) => (prix / energies[s.energie].pci / (s.rendement * s.installation)) * 100;

export const prixChaleur = (systemes: Systeme[]) =>
  barres(
    [...systemes]
      .sort((a, b) => centimesChaleur(a) - centimesChaleur(b))
      .map((s) => ({
        label: `${s.label}${s.portee === 'piece' ? ' *' : ''}`,
        valeur: centimesChaleur(s),
        texte: `${fmt(centimesChaleur(s))} c€`,
        ton: (s.fk ? 'accent' : 'neutre') as Ton,
      })),
  );

/* ---------- Pompe à chaleur et radiateurs ---------- */

/** Température de départ d'eau nécessaire, sur l'échelle des régimes de pompe à chaleur. */
export const jaugeDepart = (tDepart: number) => {
  const max = 90;
  return jauge({
    min: 25,
    theme: 'sombre',
    valeur: tDepart,
    texte: tDepart > max ? `Plus de ${max} °C` : `Eau à ${fmt(tDepart, 0)} °C`,
    segments: [
      { jusqua: pac.niveaux[0].max, label: 'Idéal', zone: 'bien' },
      { jusqua: pac.niveaux[1].max, label: 'Pompe à chaleur classique', zone: 'moyen' },
      { jusqua: pac.niveaux[2].max, label: 'Haute température', zone: 'attention' },
      { jusqua: max, label: 'Trop chaud', zone: 'hors' },
    ],
    graduations: [35, 55, 75].map((v) => ({ valeur: v, texte: `${v} °C` })),
  });
};

/** Puissance (W) que donnent des radiateurs de puissance nominale `p50`, selon la température de départ de l'eau. */
export const puissanceAuDepart = (p50: number, depart: number) => puissanceRadiateur(p50, depart - pac.ecartDepartRetour / 2, radiateurs.tAmbiante, radiateurs.n);

export const departMin = 30;
export const departMax = 80;

/** Chaleur donnée par les radiateurs du visiteur selon la température de l'eau, face au besoin de la maison. */
export const courbeRadiateurs = (p50: number, besoinW: number, tDepart: number, largeur: number) => {
  const kwMax = Math.max(besoinW * 1.35, Math.min(puissanceAuDepart(p50, departMax), besoinW * 2)) / 1000;
  const pas = pasRond(kwMax, 4);
  const points: [number, number][] = [];
  for (let t = departMin; t <= departMax; t += 1) points.push([t, puissanceAuDepart(p50, t) / 1000]);
  return courbe({
    largeur,
    hauteur: largeur < 480 ? 260 : 300,
    titre: `Chaleur donnée par vos radiateurs selon la température de l’eau, de ${departMin} à ${departMax} °C, face au besoin de ${fmt(besoinW / 1000)} kW de la maison.`,
    x: { min: departMin, max: departMax, pas: 10, format: (v) => `${v} °C` },
    y: { min: 0, max: Math.ceil(kwMax / pas) * pas, pas, format: (v) => `${fmt(v)} kW` },
    points,
    horizontale: { y: besoinW / 1000, label: `${largeur < 480 ? 'Besoin' : 'Besoin de la maison'} : ${fmt(besoinW / 1000)} kW` },
    zones: [
      { de: departMin, a: pac.niveaux[0].max, zone: 'bien' },
      { de: pac.niveaux[0].max, a: pac.niveaux[1].max, zone: 'moyen' },
      { de: pac.niveaux[1].max, a: pac.niveaux[2].max, zone: 'attention' },
      { de: pac.niveaux[2].max, a: departMax, zone: 'hors' },
    ],
    point: tDepart <= departMax ? { x: tDepart, y: besoinW / 1000, label: largeur < 480 ? `Dès ${fmt(tDepart, 0)} °C` : `Assez chaud à partir de ${fmt(tDepart, 0)} °C` } : undefined,
  });
};

/** Graphique vide tant qu'aucun radiateur n'est déclaré. */
export const courbeVide = (message: string) =>
  `<div class="grid min-h-56 place-items-center rounded-2xl border-2 border-dashed border-ink-200 p-6 text-center text-ink-600">${message}</div>`;

/** Part de sa puissance qu'un radiateur garde quand l'eau refroidit (température moyenne de l'eau). */
export const temperaturesRadiateur = [70, 60, 50, 45, 40, 35];
export const partRadiateur = (tEau: number) => puissanceRadiateur(1, tEau, radiateurs.tAmbiante, radiateurs.n);
/** Ce qu'on pourrait croire : une puissance proportionnelle à l'écart entre l'eau et la pièce. */
export const partProportionnelle = (tEau: number) => (tEau - radiateurs.tAmbiante) / 50;
export const radiateurQuiRefroidit = () =>
  colonnes(
    temperaturesRadiateur.map((t) => ({
      label: `eau à ${t} °C`,
      court: `${t} °C`,
      valeur: partRadiateur(t),
      texte: `${fmt(partRadiateur(t) * 100, 0)} %`,
      ton: (t === 45 ? 'accent' : t === 70 ? 'fort' : 'neutre') as Ton,
      fantome: t === 45 ? partProportionnelle(t) : undefined,
    })),
    { hauteur: 200 },
  );

/* ---------- Convertisseur bois ---------- */

type Essence = (typeof bois.essences)[number];

/** Énergie (kWh) d'un stère d'une essence à l'humidité `h` (0 à 1). */
export const kwhStere = (e: Essence, h: number) => (e.masseSeche / (1 - h)) * pciBois(e.pciAnhydre, bois.chaleurVaporisation, h);

/** Énergie d'un stère selon l'essence, à l'humidité choisie. */
export const boisParEssence = (h: number, choisie: string) =>
  barres(
    bois.essences.map((e) => {
      const kwh = Math.round(kwhStere(e, h) / 10) * 10;
      return { label: e.label, valeur: kwh, texte: `${fmt(kwh, 0)} kWh`, ton: (e.value === choisie ? 'accent' : 'neutre') as Ton };
    }),
  );

/** Rendement d'un poêle à bûches récent avec du bois sec (Flamme Verte, méthode 3CL). */
const rendementPoeleBois = systemes.find((s) => s.id === 'poele-bois')!.rendement;

/**
 * Où part l'énergie d'un stère, dans un poêle, à l'humidité `h` (%) : chaleur dans la pièce, énergie dépensée à évaporer
 * l'eau du bois, pertes du poêle (fumées). L'énergie du bois sec est la même quelle que soit l'humidité. `perteRendement` :
 * baisse relative du rendement du poêle (sourcée seulement à 40 %, voir `bois.bucheHumide`).
 */
export const bilanStere = (e: Essence, h: number, perteRendement = 0) => {
  const total = e.masseSeche * e.pciAnhydre;
  const eau = (e.masseSeche * h) / (100 - h);
  const evaporation = eau * bois.chaleurVaporisation;
  const piece = (total - evaporation) * rendementPoeleBois * (1 - perteRendement);
  return { total, eau, evaporation, piece, fumees: total - evaporation - piece };
};

/** Bilan d'un stère sec (20 %) et humide (40 %), barres empilées de même longueur. */
export const energieStere = (e: Essence) => {
  const lignes = [
    { h: bois.humiditeIdeale, perte: 0, label: `Bois sec (${bois.humiditeIdeale} %)` },
    { h: bois.bucheHumide.humidite, perte: bois.bucheHumide.perteRendement, label: `Bois humide (${bois.bucheHumide.humidite} %)` },
  ];
  const segments = [
    { cle: 'piece', label: 'Chauffe la pièce', classe: 'bg-ember-500' },
    { cle: 'evaporation', label: 'Sert à évaporer l’eau du bois', classe: 'bg-ink-700' },
    { cle: 'fumees', label: 'Part dans les fumées', classe: 'bg-ink-300' },
  ] as const;
  const k = (v: number) => `${fmt(Math.round(v / 10) * 10, 0)} kWh`;
  const rows = lignes
    .map(({ h, perte, label }) => {
      const b = bilanStere(e, h, perte);
      const barres = segments.map((sg) => `<span class="${sg.classe} first:rounded-l last:rounded-r" style="width:${(b[sg.cle] / b.total) * 100}%"></span>`).join('');
      return `<li class="flex flex-col gap-1.5">
  <div class="flex items-baseline justify-between gap-3">
    <span class="font-bold text-ink-900">${label}</span>
    <span class="shrink-0 text-right"><span class="font-display text-2xl font-semibold tabular-nums text-ink-900">${k(b.piece)}</span> <span class="text-sm text-ink-600">dans la pièce</span></span>
  </div>
  <div class="flex h-5 gap-0.5" aria-hidden="true">${barres}</div>
  <span class="text-sm text-ink-600">${k(b.evaporation)} pour évaporer ${fmt(Math.round(b.eau / 10) * 10, 0)} litres d’eau, ${k(b.fumees)} dans les fumées</span>
</li>`;
    })
    .join('');
  const legende = segments
    .map((sg) => `<li class="flex items-center gap-1.5"><span class="size-2.5 rounded-full ${sg.classe}" aria-hidden="true"></span>${sg.label}</li>`)
    .join('');
  return `<ul class="flex flex-col gap-6">${rows}</ul><ul class="mt-5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-600">${legende}</ul>`;
};

/** Volume d'un stère une fois les bûches recoupées. */
export const stereRecoupe = (choisie: string) =>
  barres(
    bois.longueurs.map((l) => ({
      label: `Bûches de ${l.label}`,
      valeur: l.mab,
      texte: `${fmt(l.mab, 2)} m³`,
      ton: (l.value === choisie ? 'accent' : 'neutre') as Ton,
    })),
    { max: 1 },
  );

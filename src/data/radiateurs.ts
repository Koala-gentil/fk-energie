/**
 * Catalogues de radiateurs à eau, pour le dimensionnement pièce par pièce (étape « Résultat » du simulateur de plan).
 * Puissances au régime nominal 75/65/20 °C (ΔT 50 K, EN 442) : par élément, ou par mètre pour les panneaux.
 * Recherche et niveau de confiance : `research/donnees-outils.md` (§ 8) et `research/dimensionnement-radiateurs.md`.
 */

export type GammeRadiateur = {
  id: string;
  label: string;
  /** Radiateur à éléments (nombre d'éléments), ou à panneaux (longueur). */
  mesure: 'elements' | 'longueur';
  /** Épaisseurs proposées : colonnes d'un radiateur à éléments, type d'un panneau. */
  variantes: { id: string; label: string }[];
  /** Puissance à ΔT 50 : W par élément (avec la largeur d'un élément, mm), ou W par mètre de panneau. */
  modeles: { variante: string; hauteur: number; puissance: number; pas?: number }[];
  /** Longueur ajoutée à celle des éléments (bouchons, mm). */
  ajout?: number;
  /** Longueur au-delà de laquelle on propose deux radiateurs ou plus (mm). */
  longueurMax: number;
  source: { label: string; url: string };
};

/** Idéal Néo-Classic (fonte), d'après le distributeur Frédéric Matt. */
const neoClassic: GammeRadiateur['modeles'] = [
  { variante: '2', hauteur: 460, puissance: 34, pas: 50 },
  { variante: '2', hauteur: 610, puissance: 45, pas: 50 },
  { variante: '2', hauteur: 760, puissance: 58, pas: 50 },
  { variante: '2', hauteur: 910, puissance: 72, pas: 50 },
  { variante: '2', hauteur: 1050, puissance: 79, pas: 50 },
  { variante: '3', hauteur: 760, puissance: 84, pas: 50 },
  { variante: '3', hauteur: 1060, puissance: 120, pas: 55 },
  { variante: '4', hauteur: 330, puissance: 41, pas: 50 },
  { variante: '4', hauteur: 460, puissance: 60, pas: 50 },
  { variante: '4', hauteur: 610, puissance: 85, pas: 50 },
  { variante: '4', hauteur: 780, puissance: 112, pas: 55 },
  { variante: '4', hauteur: 930, puissance: 135, pas: 55 },
  { variante: '6', hauteur: 330, puissance: 64, pas: 50 },
  { variante: '6', hauteur: 460, puissance: 90, pas: 50 },
  { variante: '6', hauteur: 610, puissance: 117, pas: 50 },
  { variante: '6', hauteur: 780, puissance: 167, pas: 55 },
  { variante: '6', hauteur: 930, puissance: 190, pas: 55 },
  { variante: '6', hauteur: 1070, puissance: 241, pas: 60 },
];

/** Zehnder Charleston (acier tubulaire), fiche produit du fabricant (V20200518) : hauteur (mm) → W par élément. */
const charleston: Record<string, [number, number][]> = {
  '2': [[292, 23.6], [392, 31.2], [492, 38.4], [592, 45.3], [742, 55], [892, 63.9], [992, 69.5], [1192, 82.7], [1492, 104], [1792, 124], [1992, 138]],
  '3': [[300, 32], [400, 41.9], [500, 51.6], [600, 60.9], [750, 74.3], [900, 87], [1000, 95.1], [1200, 115], [1500, 140], [1800, 166], [2000, 183]],
  '4': [[300, 41.9], [400, 54.9], [500, 67.6], [600, 79.8], [750, 97.4], [900, 114], [1000, 125], [1200, 147], [1500, 180], [1800, 213], [2000, 234]],
  '5': [[300, 51.7], [400, 67.9], [500, 83.5], [600, 98.6], [750, 120], [900, 141], [1000, 154], [1200, 179], [1500, 219]],
  '6': [[300, 61.3], [400, 80.5], [500, 99], [600, 117], [750, 143], [900, 167], [1000, 183], [1200, 210], [1500, 256]],
};

export const gammesRadiateurs: GammeRadiateur[] = [
  {
    id: 'neo-classic',
    label: 'Fonte, Idéal Néo-Classic',
    mesure: 'elements',
    variantes: [
      { id: '2', label: '2 colonnes, 6,7 cm' },
      { id: '3', label: '3 colonnes, 10 cm' },
      { id: '4', label: '4 colonnes, 14,3 cm' },
      { id: '6', label: '6 colonnes, 22 cm' },
    ],
    modeles: neoClassic,
    longueurMax: 1600,
    source: { label: 'Frédéric Matt (distributeur) : fiche technique du radiateur fonte Idéal Néo-Classic, puissances à ΔT 50', url: 'https://www.fredericmatt.com/radiateurs/tech-ideal-neoclassic' },
  },
  {
    id: 'classic',
    label: 'Fonte, Idéal Classic (ancien modèle)',
    mesure: 'elements',
    variantes: [
      { id: '4', label: '4 colonnes, 14,3 cm' },
      { id: '6', label: '6 colonnes, 22 cm' },
    ],
    modeles: [
      { variante: '4', hauteur: 460, puissance: 60, pas: 50 },
      { variante: '4', hauteur: 610, puissance: 85, pas: 50 },
      { variante: '4', hauteur: 760, puissance: 112, pas: 50 },
      { variante: '4', hauteur: 920, puissance: 135, pas: 50 },
      { variante: '6', hauteur: 460, puissance: 90, pas: 50 },
      { variante: '6', hauteur: 610, puissance: 117, pas: 50 },
      { variante: '6', hauteur: 760, puissance: 167, pas: 50 },
      { variante: '6', hauteur: 920, puissance: 190, pas: 50 },
    ],
    longueurMax: 1600,
    source: { label: 'Frédéric Matt (distributeur) : caractéristiques techniques du radiateur fonte Idéal Classic, puissances à ΔT 50', url: 'https://www.fredericmatt.com/radiateurs/tech-ideal-classic' },
  },
  {
    id: 'charleston',
    label: 'Acier tubulaire, Zehnder Charleston',
    mesure: 'elements',
    variantes: [
      { id: '2', label: '2 colonnes, 6,2 cm' },
      { id: '3', label: '3 colonnes, 10 cm' },
      { id: '4', label: '4 colonnes, 13,6 cm' },
      { id: '5', label: '5 colonnes, 17,3 cm' },
      { id: '6', label: '6 colonnes, 21 cm' },
    ],
    modeles: Object.entries(charleston).flatMap(([variante, lignes]) => lignes.map(([hauteur, puissance]) => ({ variante, hauteur, puissance, pas: 46 }))),
    ajout: 26,
    longueurMax: 1600,
    source: { label: 'Zehnder : fiche produit du radiateur Charleston (V20200518), puissance par élément à 75/65/20 °C selon EN 442', url: 'https://www.etaz.rs/imgDocuments/424/Tehni%C4%8Dke%20karakteristike%20CHARLSTON.pdf' },
  },
  {
    id: 'panneau',
    label: 'Acier à panneaux, Purmo Compact',
    mesure: 'longueur',
    variantes: [
      { id: '11', label: 'Type 11 (1 panneau)' },
      { id: '21', label: 'Type 21 (2 panneaux, 1 rang d’ailettes)' },
      { id: '22', label: 'Type 22 (2 panneaux, 2 rangs d’ailettes)' },
      { id: '33', label: 'Type 33 (3 panneaux)' },
    ],
    modeles: [
      { variante: '11', hauteur: 300, puissance: 546 },
      { variante: '11', hauteur: 450, puissance: 790 },
      { variante: '11', hauteur: 600, puissance: 1018 },
      { variante: '11', hauteur: 900, puissance: 1427 },
      { variante: '21', hauteur: 300, puissance: 761 },
      { variante: '21', hauteur: 450, puissance: 1060 },
      { variante: '21', hauteur: 600, puissance: 1340 },
      { variante: '21', hauteur: 900, puissance: 1861 },
      { variante: '22', hauteur: 300, puissance: 961 },
      { variante: '22', hauteur: 450, puissance: 1347 },
      { variante: '22', hauteur: 600, puissance: 1709 },
      { variante: '22', hauteur: 900, puissance: 2388 },
      { variante: '33', hauteur: 300, puissance: 1347 },
      { variante: '33', hauteur: 450, puissance: 1869 },
      { variante: '33', hauteur: 600, puissance: 2356 },
      { variante: '33', hauteur: 900, puissance: 3260 },
    ],
    longueurMax: 2000,
    source: { label: 'Purmo : catalogue technique des radiateurs à panneaux (10/2021), puissance d’un mètre de radiateur à 75/65/20 °C selon EN 442', url: 'https://www.purmo.com/docs/Purmo-technical-catalogue-full-panel-radiators-10_2021_EN.pdf' },
  },
];

/** Longueur de panneau proposée : arrondie aux 10 cm au-dessus, 40 cm au moins (simplification : les longueurs en stock dépendent du fabricant). */
export const PAS_LONGUEUR_PANNEAU = 100;
export const LONGUEUR_MIN_PANNEAU = 400;

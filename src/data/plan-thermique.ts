/**
 * Valeurs de la méthode 3CL-DPE 2021 (arrêté du 31 mars 2021, annexe 1) pour le calcul pièce par pièce de
 * `/outils/plan-maison/`. Pages citées : PDF consolidé (octobre 2021), numéro de page = numéro imprimé.
 * Extraction détaillée : `research/valeurs-3cl-pieces.md`.
 *
 * Choix prudents là où l'annexe ne donne pas de règle (documentés dans la recherche) :
 * - épaisseur de mur entre deux colonnes du tableau Umur0 : on prend l'épaisseur tabulée inférieure (U plus élevé) ;
 * - Ue hors du tableau : on ne prolonge pas au-delà des valeurs extrêmes.
 */
import type { Parametres } from '../lib/plan/deperditions';
import type { Regulation } from '../lib/plan/temperatures';
import type { DonneesSoleil } from '../lib/plan/solaire';
import { climat, radiateurs, pac } from './thermique';
import { puissanceRadiateur } from '../lib/thermique';

/** Tableau U selon l'épaisseur (cm) : valeur de l'épaisseur tabulée immédiatement inférieure ou égale. */
const parEpaisseur = (ep: number[], u: number[]) => (e: number) => {
  let i = 0;
  while (i + 1 < ep.length && ep[i + 1] <= e) i++;
  return u[i];
};

/** Umur0 des murs non isolés (§3.2.1.2, p. 14 à 16). */
const umur0: Record<string, (e: number, annee: string) => number> = {
  pierre: parEpaisseur([20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80], [3.2, 2.85, 2.65, 2.45, 2.3, 2.15, 2.05, 1.9, 1.8, 1.75, 1.65, 1.55, 1.5]),
  'brique-pleine': parEpaisseur([9, 12, 15, 19, 23, 28, 34, 45, 55, 60, 70], [3.9, 3.45, 3.05, 2.75, 2.5, 2.25, 2, 1.65, 1.45, 1.35, 1.2]),
  'brique-creuse': parEpaisseur([15, 18, 20, 23, 25, 28, 33, 38, 43], [2.15, 2.05, 2, 1.85, 1.7, 1.68, 1.65, 1.55, 1.4]),
  /** « Blocs de béton creux » (p. 15) */
  parpaing: parEpaisseur([20, 23, 25], [2.8, 2.65, 2.3]),
  /** « Béton banché » (p. 15) */
  beton: parEpaisseur([20, 22.5, 25, 28, 30, 35, 40, 45], [2.9, 2.75, 2.65, 2.5, 2.4, 2.2, 2.05, 1.9]),
  'beton-cellulaire': (e, annee) =>
    annee === 'depuis-2013'
      ? parEpaisseur([15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5], [0.69, 0.6, 0.53, 0.48, 0.43, 0.4, 0.36, 0.3, 0.28, 0.22])(e)
      : parEpaisseur([15, 17.5, 20, 22.5, 25, 27.5, 30, 32.5, 35, 37.5], [0.9, 0.79, 0.7, 0.63, 0.57, 0.53, 0.49, 0.45, 0.42, 0.4])(e),
  /** Ossature bois avec isolant (p. 16), selon l'époque. */
  'ossature-bois': (e, annee) => {
    const ep = [10, 15, 20, 25, 30, 35, 40, 45];
    if (['2006-2012', 'depuis-2013'].includes(annee)) return parEpaisseur(ep, [0.45, 0.35, 0.26, 0.21, 0.17, 0.15, 0.13, 0.11])(e);
    if (annee === '2001-2005') return parEpaisseur(ep, [0.52, 0.41, 0.3, 0.24, 0.2, 0.17, 0.15, 0.13])(e);
    return parEpaisseur(ep, [0.65, 0.45, 0.34, 0.28, 0.23, 0.2, 0.18, 0.16])(e);
  },
};

/** Périodes de construction et colonne des tableaux U_tab (§3.2, zone H1, chauffage « autres »). */
const colonne: Record<string, number> = {
  'avant-1948': 0,
  '1948-1974': 0,
  '1975-1977': 1,
  '1978-1982': 2,
  '1983-1988': 3,
  '1989-2000': 4,
  '2001-2005': 5,
  '2006-2012': 6,
  'depuis-2013': 7,
};
const uTab = {
  mur: [2.5, 1, 1, 0.8, 0.5, 0.4, 0.36, 0.23],
  plancher: [2, 0.9, 0.9, 0.8, 0.5, 0.3, 0.27, 0.23],
  combles: [2.5, 0.5, 0.5, 0.3, 0.25, 0.23, 0.2, 0.14],
  terrasse: [2.5, 0.75, 0.75, 0.55, 0.4, 0.3, 0.27, 0.14],
};

/** Tableaux Ue (§3.2.2.1) : lignes 2S/P, colonnes Upb. */
type TableUe = { upb: number[]; ue: number[][] };
const lignes2SP = [3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20];
const ueTables: Record<string, TableUe> = {
  /** Vide sanitaire ou sous-sol non chauffé (p. 18) */
  'vide-sanitaire': {
    upb: [3.33, 1.43, 0.83, 0.45, 0.41, 0.37, 0.34, 0.31],
    ue: [
      [0.45, 0.42, 0.39, 0.36, 0.33, 0.3, 0.28, 0.26],
      [0.43, 0.4, 0.37, 0.34, 0.31, 0.29, 0.27, 0.25],
      [0.38, 0.36, 0.34, 0.32, 0.3, 0.28, 0.26, 0.25],
      [0.37, 0.35, 0.33, 0.31, 0.29, 0.27, 0.25, 0.24],
      [0.36, 0.34, 0.32, 0.3, 0.28, 0.26, 0.24, 0.23],
      [0.35, 0.33, 0.31, 0.29, 0.27, 0.25, 0.24, 0.22],
      [0.34, 0.32, 0.3, 0.28, 0.26, 0.24, 0.23, 0.22],
      [0.33, 0.31, 0.29, 0.27, 0.25, 0.24, 0.22, 0.21],
      [0.28, 0.27, 0.26, 0.25, 0.24, 0.22, 0.21, 0.2],
      [0.28, 0.27, 0.26, 0.24, 0.23, 0.21, 0.2, 0.19],
      [0.28, 0.27, 0.25, 0.23, 0.21, 0.2, 0.19, 0.18],
      [0.28, 0.26, 0.24, 0.22, 0.2, 0.19, 0.19, 0.18],
      [0.24, 0.23, 0.22, 0.21, 0.2, 0.19, 0.18, 0.17],
    ],
  },
  /** Terre-plein, bâtiment construit avant 2001 (p. 19) */
  'terre-plein-avant-2001': {
    upb: [3.4, 1.5, 0.85, 0.59, 0.46],
    ue: [
      [0.78, 0.56, 0.43, 0.35, 0.3],
      [0.68, 0.51, 0.4, 0.33, 0.28],
      [0.6, 0.46, 0.38, 0.32, 0.27],
      [0.54, 0.43, 0.35, 0.3, 0.26],
      [0.49, 0.39, 0.33, 0.28, 0.25],
      [0.45, 0.37, 0.31, 0.27, 0.24],
      [0.42, 0.34, 0.29, 0.26, 0.23],
      [0.39, 0.32, 0.28, 0.24, 0.22],
      [0.35, 0.29, 0.25, 0.22, 0.2],
      [0.31, 0.26, 0.23, 0.2, 0.19],
      [0.28, 0.24, 0.21, 0.19, 0.17],
      [0.26, 0.22, 0.2, 0.18, 0.16],
      [0.24, 0.21, 0.18, 0.17, 0.15],
    ],
  },
  /** Terre-plein, bâtiment construit à partir de 2001 (p. 19) */
  'terre-plein-depuis-2001': {
    upb: [3.4, 1.5, 0.85, 0.6, 0.46, 0.37, 0.31],
    ue: [
      [0.7, 0.6, 0.49, 0.39, 0.33, 0.28, 0.25],
      [0.65, 0.55, 0.45, 0.36, 0.31, 0.26, 0.23],
      [0.58, 0.5, 0.42, 0.34, 0.29, 0.25, 0.22],
      [0.52, 0.45, 0.38, 0.32, 0.27, 0.24, 0.21],
      [0.48, 0.42, 0.36, 0.3, 0.26, 0.23, 0.2],
      [0.45, 0.39, 0.33, 0.28, 0.25, 0.22, 0.2],
      [0.39, 0.35, 0.31, 0.27, 0.24, 0.21, 0.19],
      [0.38, 0.34, 0.3, 0.26, 0.23, 0.2, 0.18],
      [0.35, 0.31, 0.27, 0.23, 0.21, 0.19, 0.17],
      [0.3, 0.27, 0.24, 0.21, 0.19, 0.17, 0.16],
      [0.26, 0.24, 0.22, 0.2, 0.18, 0.16, 0.15],
      [0.25, 0.24, 0.21, 0.18, 0.17, 0.15, 0.14],
      [0.23, 0.21, 0.19, 0.17, 0.16, 0.14, 0.13],
    ],
  },
};

/**
 * Interpolation linéaire dans une liste de points (x croissants ou décroissants). Hors du tableau, la valeur est
 * bornée, sauf sous le premier x si `prolongerBas` (extrapolation autorisée par la 3CL, p. 18).
 */
const interpoler = (xs: number[], ys: number[], x: number, prolongerBas = false) => {
  const asc = xs[0] < xs[xs.length - 1];
  const X = asc ? xs : [...xs].reverse();
  const Y = asc ? ys : [...ys].reverse();
  if (x < X[0] && prolongerBas) return Y[0] + ((Y[1] - Y[0]) * (x - X[0])) / (X[1] - X[0]);
  if (x <= X[0]) return Y[0];
  if (x >= X[X.length - 1]) return Y[Y.length - 1];
  const i = X.findIndex((v) => v >= x);
  return Y[i - 1] + ((Y[i] - Y[i - 1]) * (x - X[i - 1])) / (X[i] - X[i - 1]);
};

/**
 * Ue : 2S/P arrondi à l'entier (p. 18), interpolation linéaire entre lignes et entre colonnes. Sous 2S/P = 3, on
 * prolonge la tendance du tableau (Ue augmente quand 2S/P diminue) ; ailleurs, on reste aux valeurs extrêmes.
 */
const ue = (table: TableUe, upb: number, deuxSsurP: number) => {
  const sp = Math.max(1, Math.round(deuxSsurP));
  const parLigne = table.ue.map((ligne) => interpoler(table.upb, ligne, upb));
  return interpoler(lignes2SP, parLigne, sp, true);
};

/**
 * Coefficient b d'un local non chauffé (garage, cellier : UV,ue = 3), selon Aiu/Aue et l'isolation de la paroi
 * qui le sépare du logement, parois du local vers l'extérieur supposées non isolées (3CL § 3.1, p. 9-10). b = 0
 * si le local n'a aucune paroi vers l'extérieur (p. 8).
 */
const bornesAiuAue = [0.25, 0.5, 0.75, 1, 1.25, 2, 2.5, 3, 3.5, 4, 6, 8, 10, 25, 50, Infinity];
const bLncAiuIsole = [1, 0.95, 0.95, 0.95, 0.9, 0.9, 0.85, 0.85, 0.8, 0.8, 0.7, 0.65, 0.6, 0.5, 0.35, 0.2];
const bLncAiuNonIsole = [0.9, 0.8, 0.75, 0.7, 0.65, 0.5, 0.45, 0.4, 0.4, 0.35, 0.25, 0.2, 0.2, 0.15, 0.05, 0.05];
export const bLocalNonChauffe = (aiu: number, aue: number, aiuIsole: boolean) => {
  if (aue <= 0) return 0;
  const i = bornesAiuAue.findIndex((borne) => aiu / aue <= borne);
  return (aiuIsole ? bLncAiuIsole : bLncAiuNonIsole)[i];
};


const avant2001 = (annee: string) => colonne[annee] <= 4;

export const parametres: Parametres = {
  tInterieure: climat.tInterieure,
  tBase: climat.tBase,
  /** Umur_nu = min(Umur0 ; 2,5), 2,5 si le type de mur est inconnu (p. 13). */
  umurNu: (matiere, e, annee) => Math.min(2.5, umur0[matiere]?.(e, annee) ?? 2.5),
  uTab: (paroi, annee, plafond) => {
    // Bâtiment d'avant 1975 isolé à une date inconnue : colonne 1975-1977 (schémas p. 13, 17, 21)
    const c = Math.max(1, colonne[annee] ?? 0);
    if (paroi === 'mur') return uTab.mur[c];
    if (paroi === 'plancher') return uTab.plancher[c];
    return plafond === 'terrasse' ? uTab.terrasse[c] : uTab.combles[c];
  },
  /**
   * λ de l'isolant : 0,03 pour le polyuréthane et le polystyrène extrudé, 0,04 pour les autres (règles Th-U Ex,
   * fascicule 2) ; 0,042 pour les autres isolants en plancher bas (3CL, p. 17).
   */
  lambda: (isolant, paroi) => (['polyurethane', 'polystyrene-extrude'].includes(isolant) ? 0.03 : paroi === 'plancher' ? 0.042 : 0.04),
  /** Uph0 = 2,5 pour un plafond en plâtre, des rampants ou une dalle béton (p. 21-22). */
  uph0: () => 2.5,
  upb0: 2,
  /** b des combles perdus fortement ventilés : 0,85 non isolés, 1 isolés (p. 10, voir coefficient-g-3cl.md §2.4) ; 1 sinon. */
  bPlafond: (plafond, isole) => (plafond === 'combles-perdus' ? (isole ? 1 : 0.85) : 1),
  ue: (plancher, upb, deuxSsurP, annee) => {
    if (plancher === 'terre-plein') return ue(ueTables[avant2001(annee) ? 'terre-plein-avant-2001' : 'terre-plein-depuis-2001'], upb, deuxSsurP);
    return ue(ueTables['vide-sanitaire'], upb, deuxSsurP);
  },
  /** Uw fenêtre battante (p. 28-30) : bois simple vitrage, PVC 4/12/4 air, PVC 4/16/4 argon peu émissif, PVC triple 4/12/4/12/4 argon peu émissif. */
  uw: (vitrage) => ({ simple: 5.4, 'double-ancien': 2.7, 'double-recent': 1.4, triple: 1.2 })[vitrage] ?? 2.7,
  /** Porte opaque pleine en bois ou PVC (p. 32). */
  uPorte: 3.5,
  bLocalNonChauffe,
  /** U d'une cloison de plâtre (p. 16), pour les parois vers une pièce non chauffée intérieure. */
  uCloison: 3.33,
  /** U du plancher entre deux niveaux (p. 20) : plancher bois sur solives bois 1,6 ; dalle béton 2. */
  uPlancherIntermediaire: (nature) => (nature === 'beton' ? 2 : 1.6),
  /** Liaison plancher bas / mur (p. 35) : plancher non isolé ou isolé par l'extérieur ; murs légers négligés. */
  psiPlancherBas: (cat, plancherIsole) =>
    ({ 'non-isole': plancherIsole ? 0.8 : 0.39, ITI: plancherIsole ? 0.71 : 0.31, ITR: plancherIsole ? 0.45 : 0.35, leger: 0 })[cat],
  /** Liaison menuiserie / mur (p. 37) : en tunnel sur mur non isolé, au nu intérieur sur mur ITI ; structure bois négligée. */
  psiMenuiserie: (cat) => ({ 'non-isole': 0.31, ITI: 0, ITR: 0.2, leger: 0 })[cat],
  /** Liaison plancher intermédiaire lourd / mur (p. 35). */
  psiPlancherIntermediaire: (cat) => ({ 'non-isole': 0.86, ITI: 0.92, ITR: 0.24, leger: 0 })[cat],
  /** Liaison plancher haut lourd (toit-terrasse) / mur (p. 36) : plafond non isolé ou isolé par l'extérieur. */
  psiPlancherHaut: (cat, plafondIsole) =>
    ({ 'non-isole': plafondIsole ? 0.4 : 0.3, ITI: plafondIsole ? 0.75 : 0.27, ITR: plafondIsole ? 0.48 : 0.4, leger: 0 })[cat],
  /** Débits conventionnels (p. 40), selon l'époque d'installation supposée égale à celle de la construction. */
  ventilation: (type, annee) => {
    const c = colonne[annee] ?? 0;
    switch (type) {
      case 'fenetres':
        return { qvarep: 1.2, qvasouf: 1.2, smea: 0 };
      case 'naturelle':
        return { qvarep: 2.23, qvasouf: 0, smea: 4 };
      case 'vmc-hygro':
        return { qvarep: c >= 7 ? 1.09 : c >= 5 ? 1.24 : 1.36, qvasouf: 0, smea: 1.5 };
      case 'vmc-double-flux':
        return c >= 7 ? { qvarep: 0.26, qvasouf: 0.26, smea: 0 } : { qvarep: 0.6, qvasouf: 0.6, smea: 0 };
      default:
        return { qvarep: c <= 2 ? 1.97 : c <= 4 ? 1.65 : c <= 6 ? 1.5 : 1.32, qvasouf: 0, smea: 2 };
    }
  },
  /** Perméabilité conventionnelle d'une maison individuelle (p. 39). */
  q4paConv: (annee, isole) => {
    if (annee === 'avant-1948') return isole ? 2 : 3.3;
    if (annee === '1948-1974') return isole ? 1.9 : 2.2;
    if (annee === '2006-2012') return 1.3;
    if (annee === 'depuis-2013') return 0.6;
    return 1.9;
  },
  /** Plusieurs façades exposées (p. 39). */
  protection: { e: 0.07, f: 15 },
};

/**
 * Puissance nominale (à 75/65 °C) d'un radiateur qui fournit `besoin` W avec une eau à 55 °C au départ (pompe à
 * chaleur, écart départ/retour du règlement 813/2013) dans une pièce à 20 °C.
 */
export const radiateurPourPac = (besoin: number) =>
  besoin / puissanceRadiateur(1, 55 - pac.ecartDepartRetour / 2, radiateurs.tAmbiante, radiateurs.n);

/** Échanges entre pièces chauffées (températures par pièce). */
/**
 * Plage de fonctionnement des poêles.
 * - Granulés : allure minimale « en général 30 % de la puissance nominale » ; une fois la consigne atteinte, le poêle
 *   continue à allure réduite (légère surchauffe) puis s'éteint si l'écart devient trop grand. Dépassement moyen de la
 *   consigne mesuré dans le salon : 1 °C (ADEME, Performances réelles de poêles à granulés, 2023).
 * - Granulés hydro : même plage ; il est piloté par la demande des radiateurs. Part de la puissance cédée à l'eau par défaut :
 *   80 % (Edilkamin Blade2 H 18 Up : 15,5 kW à l'eau sur 19,2 kW de puissance utile, soit 81 %), réglable.
 * - Bûches : pas de thermostat ; les essais à charge partielle se font à 50 % au plus de la puissance nominale (IEA
 *   Bioenergy Task 32, Advanced Test Methods for Firewood Stoves, 2018) : en dessous, la combustion se dégrade.
 */
export const regulationPoele: Regulation['poeles'] = {
  granules: { allureMinimale: 0.3, depassementMax: 1 },
  canalisable: { allureMinimale: 0.3, depassementMax: 1 },
  hydro: { allureMinimale: 0.3, depassementMax: 1 },
  bois: { allureMinimale: 0.5, depassementMax: null },
};

/**
 * Appareils du calcul des températures. Radiateurs à eau : émission P = P50 · (ΔT/50)^n, n = 1,3 (EN 442, catalogue
 * Purmo). Écart départ / retour par grand froid : 10 K pour une chaudière (régime nominal 75/65 °C de l'EN 442), 8 K pour
 * une pompe à chaleur (55/47 °C, règlement 813/2013).
 */
export const regulation: Regulation = {
  poeles: regulationPoele,
  ecartDepartRetour: { chaudiere: 10, pac: pac.ecartDepartRetour },
  nRadiateur: radiateurs.n,
};

/**
 * Soleil en janvier, zone H1a (Nord, Pas-de-Calais), méthode 3CL-DPE 2021 : ensoleillement E d'une paroi verticale au
 * sud 38,36 kWh/m² sur les 744 heures du mois (§ 18) ; coefficients d'orientation C1 des parois verticales (§ 18.5) ;
 * facteurs solaires Sw par défaut (§ 6.2.1) d'une menuiserie PVC au nu intérieur : fenêtre battante et porte-fenêtre
 * battante sans soubassement ; « double vitrage récent » pris à isolation renforcée (VIR).
 */
export const soleilJanvier: DonneesSoleil = {
  eSud: 38.36,
  heures: 744,
  c1: { sud: 1, ouest: 0.43, nord: 0.31, est: 0.4 },
  sw: {
    fenetre: { simple: 0.49, 'double-ancien': 0.44, 'double-recent': 0.39, triple: 0.38 },
    'porte-fenetre': { simple: 0.51, 'double-ancien': 0.46, 'double-recent': 0.4, triple: 0.39 },
  },
};

/**
 * Journée type de janvier pour le calcul heure par heure.
 * - Température : moyenne choisie ± 2,45 K, maximum à 14 h. Écart moyen entre maximales (6,6 °C) et minimales (1,7 °C)
 *   de janvier à Lille-Lesquin, normales 1991-2020 (Météo-France, fiche climatologique 59343001) ; forme sinusoïdale.
 * - Soleil : du lever (8 h 43) au coucher (17 h 10), heures légales calculées pour le 15 janvier à Lille (formules NOAA).
 * - Température réduite des thermostats : 16 °C, celle du scénario conventionnel du DPE (3CL, § 1).
 */
export const journeeJanvier = { amplitude: 2.45, heureMax: 14, lever: 8.72, coucher: 17.16, tReduit: 16 };

export const physiqueEchanges = {
  /**
   * U d'un plancher entre deux niveaux, valeurs des planchers non isolés de la 3CL (p. 20) : plancher bois sur solives
   * bois 1,6 ; dalle béton 2.
   */
  uPlancherIntermediaire: { bois: 1.6, beton: 2 } as Record<string, number>,
  /**
   * Échange d'air par un escalier ouvert entre deux niveaux : débit Q = Cd · A · √(g · H · ΔT / T), A surface de la trémie,
   * H hauteur d'étage. Coefficient de débit moyen 0,23 mesuré dans une maison à étages (Peppes, Santamouris et
   * Asimakopoulos, 2002) ; la maquette d'escalier de Zohrabian (1989) donne un échange environ deux fois plus faible.
   * La corrélation d'Epstein d'une ouverture dans un plancher fin, utilisée auparavant, le sous-estimait environ 4 fois.
   * Détail dans `research/echanges-escalier.md`.
   */
  cdEscalier: 0.23,
  /** Cloison de plâtre : Umur0 = 3,33 W/m²·K (3CL, p. 16). */
  uCloison: 3.33,
  /** Porte intérieure fermée, opaque pleine (3CL, p. 32). */
  uPorte: 3.5,
  /** Coefficient de débit d'une porte ouverte, environ 0,43 (Pelletret et al., 1991, cité par Karava et al.). */
  cdPorte: 0.43,
  /**
   * Air plus chaud sous le plafond de la pièce du poêle quand il fonctionne : +3 K. Calage, faute de mesure publiée
   * exploitable : valeur qui redonne l'écart d'environ 3 °C entre chambres et séjour « à accepter » avec un poêle à
   * granulés (Persson, Nordlander, Rönnelid, 2005). Détail dans `research/stratification-poele.md`.
   */
  stratificationPoele: 3,
  /**
   * Air et mobilier : 10 000 J/K par m² de plancher, valeur par défaut rapportée de l'EN ISO 52016-1 (tableau A.17 ; texte
   * de la norme non consulté). L'air seul en représente environ 3 000 (1,2 kg/m³ × 1 005 J/kg·K × 2,5 m).
   */
  capaciteAirMobilier: 10_000,
};

/**
 * Apports internes moyens en période de chauffe (W/m²), 3CL § 6.1 (p. 42-43) : appareils 3,18 W/m², éclairage
 * 0,34 W/m², occupants 90 W par adulte équivalent présent 132 h sur 168, avec Nadeq selon la surface (§ 11.1, p. 69-70).
 */
export const apportsInternesParM2 = (sh: number) => {
  if (sh <= 0) return 0;
  const nmax = sh < 30 ? 1 : sh < 70 ? 1.75 - 0.01875 * (70 - sh) : 0.025 * sh;
  const nadeq = nmax < 1.75 ? nmax : 1.75 + 0.3 * (nmax - 1.75);
  return 3.18 + 0.34 + (90 * (132 / 168) * nadeq) / sh;
};

/** Température extérieure moyenne de janvier : 19 °C moins les degrés-heures de janvier (3CL § 18.2) répartis sur le mois. */
export const tJanvier = Math.round(climat.tInterieure - climat.dh19Mois[0] / (31 * 24));

export const postesLabels = {
  murs: 'Murs extérieurs',
  fenetres: 'Fenêtres et portes-fenêtres',
  portes: 'Portes',
  plafond: 'Plafond',
  plancher: 'Plancher',
  nonChauffe: 'Vers les pièces non chauffées',
  pontsThermiques: 'Ponts thermiques',
  air: 'Renouvellement d’air',
} as const;

export const sourcesPlan = [
  {
    label: 'Méthode de calcul 3CL-DPE 2021 (arrêté du 31 mars 2021, annexe 1) : température de base (−9,5 °C) et consigne (19 °C), degrés-heures de janvier, coefficients U et b, ponts thermiques, renouvellement d’air, apports internes, cloison de plâtre',
    url: 'https://rt-re-batiment.developpement-durable.gouv.fr/IMG/pdf/consolide_annexe_1_arrete_du_31_03_2021_relatif_aux_methodes_et_procedures_applicables.pdf',
  },
  {
    label: 'Règles Th-U Ex (bâtiments existants), fascicule 2 : conductivité conventionnelle des isolants',
    url: 'https://rt-re-batiment.developpement-durable.gouv.fr/IMG/pdf/thu-ex_5_fascicules.pdf',
  },
  {
    label: 'Règlement (UE) n° 813/2013 : régime de référence des pompes à chaleur à moyenne température (55 °C)',
    url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32013R0813',
  },
  {
    label: 'Karava, Stathopoulos, Athienitis (Concordia University) : Natural ventilation openings, a discussion of discharge coefficients (débit d’air par une porte ouverte)',
    url: 'https://www.irbnet.de/daten/iconda/CIB1749.pdf',
  },
  {
    label: 'Peppes, Santamouris, Asimakopoulos (2002) : Experimental and numerical study of buoyancy-driven stairwell flow in a three storey building, Building and Environment 37 (échange d’air par un escalier)',
    url: 'https://doi.org/10.1016/S0360-1323(01)00060-9',
  },
  {
    label: 'ADEME (2023) : Performances réelles de poêles à granulés (allure minimale, respect de la consigne, fonctionnement à allure réduite)',
    url: 'https://www.ademe.fr/presse/communique-national/les-poele-a-granules-de-bonnes-performances-en-conditions-reelles-et-des-pistes-pour-mieux-les-installer-et-les-utiliser/',
  },
  {
    label: 'IEA Bioenergy Task 32 (2018) : Advanced Test Methods for Firewood Stoves (essais à charge partielle, 50 % de la puissance nominale)',
    url: 'https://www.ieabioenergy.com/wp-content/uploads/2018/11/IEA_Bioenergy_Task32_Test-Methods.pdf',
  },
  {
    label: 'Edilkamin, fiche technique du poêle hydro Blade2 H 18 Up : 19,2 kW de puissance utile, dont 15,5 kW cédés à l’eau',
    url: 'https://www.edilkamin.com/fr/blade2-h-18-up-blade-h-23-evo-ceramique',
  },
  {
    label: 'Météo-France : fiche climatologique de Lille-Lesquin, normales 1991-2020 (températures de janvier)',
    url: 'https://donneespubliques.meteofrance.fr/FichesClim/FICHECLIM_59343001.pdf',
  },
  {
    label: 'EN ISO 13790 : méthode horaire simplifiée (modèle 5R1C), paramètres décrits dans la bibliothèque Modelica Buildings (LBNL)',
    url: 'https://simulationresearch.lbl.gov/modelica/releases/v10.1.0/help/Buildings_ThermalZones_ISO13790_Zone5R1C.html',
  },
  {
    label: 'Persson, Nordlander, Rönnelid (2005) : Electrical savings by use of wood pellet stoves and solar heating systems in electrically heated single-family houses, Energy and Buildings 37 (écart de température entre chambres et séjour)',
    url: 'https://doi.org/10.1016/j.enbuild.2004.10.013',
  },
  {
    label: 'Zohrabian (1989), Brunel University : An experimental and theoretical study of buoyancy driven air-flow in a half-scale stairwell model (thèse)',
    url: 'https://bura.brunel.ac.uk/handle/2438/5349',
  },
  {
    label: 'Purmo : catalogue technique des radiateurs (émission selon EN 442)',
    url: 'https://www.purmo.com/docs/Purmo-technical-catalogue-full-panel-radiators-10_2021_EN.pdf',
  },
];

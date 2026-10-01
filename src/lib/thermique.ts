/**
 * Calculs des outils `/outils/` : fonctions pures, utilisées à la fois au build (tableaux de référence
 * des pages) et dans le navigateur (calculateurs). Les constantes sourcées sont dans `data/thermique.ts`.
 */

/** Déperditions du logement (W/K), méthode du coefficient G : volume chauffé × G. */
export const deperditions = (surface: number, hauteur: number, G: number) => surface * hauteur * G;

/** Puissance de chauffage nécessaire (kW) pour tenir `tInt` quand il fait `tBase` dehors. */
export const puissanceKw = (H: number, tInt: number, tBase: number) => (H * (tInt - tBase)) / 1000;

/** Besoin annuel de chauffage (kWh) : déperditions × degrés-heures, moins la part couverte par les apports gratuits (3CL § 9.1). */
export const besoinAnnuelKwh = (H: number, degresHeures: number, apports: number) => ((H * degresHeures) / 1000) * (1 - apports);

/** Facteur d'intermittence (3CL § 8) : baisses de température la nuit, en cas d'absence… */
export const intermittence = (I0: number, G: number) => I0 / (1 + 0.1 * (G - 1));

/** Énergie à acheter (kWh PCI) pour couvrir un besoin, avec l'intermittence et les rendements de génération et d'installation. */
export const consommationKwh = (besoin: number, int: number, s: { rendement: number; installation: number }) =>
  (besoin * int) / (s.rendement * s.installation);

/**
 * Consommation annuelle d'un logement d'après sa surface (méthode 3CL simplifiée) : besoin après apports gratuits, puis
 * énergie à acheter avec l'intermittence et les rendements du système de chauffage.
 */
export const consommationMaison = (
  surface: number,
  hauteur: number,
  isolation: { G: number; apports: number },
  systeme: { rendement: number; installation: number; I0: number },
  degresHeures: number,
) => {
  const besoin = besoinAnnuelKwh(deperditions(surface, hauteur, isolation.G), degresHeures, isolation.apports);
  return { besoin, kwh: consommationKwh(besoin, intermittence(systeme.I0, isolation.G), systeme) };
};

type SystemeChauffage = { rendement: number; installation: number; I0: number };

/**
 * Énergie à acheter (kWh PCI) avec `vers` pour fournir la même chaleur que `kwhAchetes` (kWh PCI) consommés avec `depuis` :
 * chaleur réellement fournie, puis rendements du nouveau système (l'intermittence dépend du type de chauffage).
 */
export const kwhEquivalents = (kwhAchetes: number, depuis: SystemeChauffage, vers: SystemeChauffage) =>
  (kwhAchetes * depuis.rendement * depuis.installation * (vers.I0 / depuis.I0)) / (vers.rendement * vers.installation);

/** Puissance émise par un radiateur à eau (W) à partir de sa puissance nominale à ΔT 50 K (norme EN 442). */
export const puissanceRadiateur = (p50: number, tEauMoyenne: number, tAmbiante: number, n: number) => {
  const dt = tEauMoyenne - tAmbiante;
  return dt <= 0 ? 0 : p50 * Math.pow(dt / 50, n);
};

/** Température moyenne de l'eau (°C) pour que des radiateurs de puissance nominale `p50` émettent `besoin` W. */
export const temperatureEauNecessaire = (besoin: number, p50: number, tAmbiante: number, n: number) =>
  tAmbiante + 50 * Math.pow(besoin / p50, 1 / n);

/** PCI du bois (kWh/kg) selon son humidité sur masse brute `h` (0 à 1). */
export const pciBois = (pciAnhydre: number, chaleurVaporisation: number, h: number) => pciAnhydre * (1 - h) - chaleurVaporisation * h;

const nf = (max: number) => new Intl.NumberFormat('fr-FR', { maximumFractionDigits: max });
/** Nombre au format français (espaces fines, virgule, vrai signe moins). */
export const fmt = (x: number, max = 1) => nf(max).format(x).replace('-', '−');
/** Montant en euros arrondi à la dizaine. */
export const euros = (x: number) => `${nf(0).format(Math.round(x / 10) * 10)} €`;

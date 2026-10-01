/**
 * Classe d'inertie de chaque niveau selon la méthode 3CL-DPE 2021 (§ 7) : plancher bas lourd, plancher haut lourd,
 * paroi verticale lourde, puis tableau du § 7.4. Les réglages de l'outil ne disent pas tout (structure exacte des
 * planchers, faux plafonds…) : on applique les règles « par défaut » de la méthode quand l'information manque.
 */
import type { Enveloppe } from './deperditions';

export type ClasseInertie = 'legere' | 'moyenne' | 'lourde' | 'tres-lourde';
export const classesInertie: { value: ClasseInertie; label: string }[] = [
  { value: 'legere', label: 'Légère' },
  { value: 'moyenne', label: 'Moyenne' },
  { value: 'lourde', label: 'Lourde' },
  { value: 'tres-lourde', label: 'Très lourde' },
];

/** Matériaux de mur lourds (§ 7.3) : blocs béton, béton plein, brique pleine, pierre. La brique creuse n'y figure pas. */
const mursLourds = new Set(['parpaing', 'brique-pleine', 'pierre', 'beton']);

export const classeInertieNiveau = (env: Enveloppe, niveau: number, niveaux: number): ClasseInertie => {
  const dalle = env.plancherIntermediaire === 'beton';
  // Plancher bas : au rez-de-chaussée, inconnu donc lourd (« autre que sur terre-plein ») et une dalle sur terre-plein
  // est en béton ; aux étages, face supérieure du plancher intermédiaire
  const basLourd = niveau === 0 ? true : dalle;
  // Plancher haut : sous combles, inconnu donc léger ; toit-terrasse ou logement au-dessus, dalle ; sous un autre
  // niveau, sous-face du plancher intermédiaire
  const hautLourd = niveau < niveaux - 1 ? dalle : env.plafond === 'terrasse' || env.plafond === 'etage-chauffe';
  // Murs : lourds s'ils ne sont pas isolés par l'intérieur (isolant inconnu : on suppose une isolation intérieure)
  const mursLourd = mursLourds.has(env.murMatiere) && env.murIsolant === 'aucun';
  const n = [basLourd, hautLourd, mursLourd].filter(Boolean).length;
  return n === 3 ? 'tres-lourde' : n === 2 ? 'lourde' : n === 1 ? 'moyenne' : 'legere';
};

/**
 * Capacité thermique intérieure (J/K par m² de plancher) : valeurs Cin de la 3CL (§ 8) ; surface de la masse efficace
 * (m² par m² de plancher) : EN ISO 13790, tableau 12 (2,5 léger ou moyen, 3 lourd, 3,5 très lourd).
 */
export const parametresInertie: Record<ClasseInertie, { capacite: number; surfaceMasse: number }> = {
  legere: { capacite: 110_000, surfaceMasse: 2.5 },
  moyenne: { capacite: 165_000, surfaceMasse: 2.5 },
  lourde: { capacite: 260_000, surfaceMasse: 3 },
  'tres-lourde': { capacite: 260_000, surfaceMasse: 3.5 },
};

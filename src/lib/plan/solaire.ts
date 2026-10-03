/**
 * Apports solaires par les fenêtres et portes-fenêtres, pièce par pièce, selon la méthode 3CL-DPE 2021 (§ 6.2) :
 * Sse = A · Sw · Fe · C1 (surface sud équivalente), apport = Sse · E, E étant l'ensoleillement reçu par une paroi
 * verticale orientée au sud. Sans masques (Fe = 1) : le plan ne décrit ni balcons ni bâtiments voisins.
 * Les portes ne comptent pas (« La surface vitrée des portes n'est pas prise en compte »).
 */
import { classerMurs, ouverturesDuNiveau, segmentsOuverture, lireCle, PAS, type Plan, type Ouverture, type TypeOuverture } from './geometrie';

export type Orientation = 'nord' | 'est' | 'sud' | 'ouest';

/** Côté du plan (haut, droite, bas, gauche) → point cardinal, selon le côté du plan qui regarde vers le nord. */
const cotes = ['haut', 'droite', 'bas', 'gauche'] as const;
const cardinaux: Orientation[] = ['nord', 'est', 'sud', 'ouest'];
export const orientationDuCote = (cote: (typeof cotes)[number], nord: Plan['nord']): Orientation =>
  cardinaux[(cotes.indexOf(cote) - cotes.indexOf(nord) + 4) % 4];

/** Pièce chauffée derrière une ouverture d'un mur extérieur, et orientation de ce mur (vers l'extérieur). */
export const orientationOuverture = (plan: Plan, o: Ouverture) => {
  const murs = classerMurs(plan, o.niveau);
  const [premier] = segmentsOuverture(o);
  const mur = murs.get(premier);
  if (!mur || mur.classe !== 'exterieur') return null;
  const piece = mur.pieces[0];
  const { sens, x, y } = lireCle(premier);
  const cote = sens === 'h' ? (piece.y === y ? 'haut' : 'bas') : piece.x === x ? 'gauche' : 'droite';
  return { piece, orientation: orientationDuCote(cote, plan.nord) };
};

export type DonneesSoleil = {
  /** Ensoleillement du mois sur une paroi verticale au sud (kWh/m²) et nombre d'heures du mois. */
  eSud: number;
  heures: number;
  /** Coefficient d'orientation C1 d'une paroi verticale. */
  c1: Record<Orientation, number>;
  /** Facteur solaire Sw selon le type d'ouverture et le vitrage. */
  sw: Record<'fenetre' | 'porte-fenetre', Record<string, number>>;
};

/** Apport solaire moyen de chaque pièce sur le mois (W), d'après ses fenêtres et portes-fenêtres. */
export const apportsSolaires = (plan: Plan, vitrage: string, d: DonneesSoleil) => {
  const apports = new Map<string, number>();
  for (let n = 0; n < plan.niveaux; n++)
    for (const o of ouverturesDuNiveau(plan, n)) {
      if (o.type === 'porte' || o.type === 'passage') continue;
      const r = orientationOuverture(plan, o);
      if (!r) continue;
      const sw = d.sw[o.type as Exclude<TypeOuverture, 'porte' | 'passage'>][vitrage] ?? d.sw[o.type as Exclude<TypeOuverture, 'porte' | 'passage'>]['double-ancien'];
      const surface = o.longueur * PAS * o.hauteur;
      const watts = (surface * sw * d.c1[r.orientation] * d.eSud * 1000) / d.heures;
      apports.set(r.piece.id, (apports.get(r.piece.id) ?? 0) + watts);
    }
  return apports;
};

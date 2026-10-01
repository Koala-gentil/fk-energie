/**
 * Déperditions pièce par pièce, d'après la méthode 3CL-DPE 2021 (arrêté du 31 mars 2021, annexe 1).
 * Les valeurs (U, b, ψ, débits) sont fournies par `data/plan-thermique.ts` ; ce module ne contient que les formules.
 *
 * Pour chaque pièce chauffée : H = Σ b·U·A (murs, fenêtres, portes, plafond, plancher) + ponts thermiques + air,
 * puis P = H × (Tint − Tbase). Les murs mitoyens (b = 0) et les cloisons entre pièces chauffées ne comptent pas.
 */
import { PAS, classerMurs, contour, segmentsOuverture, estChauffee, intersection, surface as aire, piecesDuNiveau, ouverturesDuNiveau, type Plan, type Piece, type Ouverture, type Murs } from './geometrie';

export type Enveloppe = {
  hauteur: number;
  annee: string;
  murMatiere: string;
  murEpaisseur: number;
  murIsolant: string;
  murIsolantEpaisseur: number;
  plafond: string;
  plafondIsolant: string;
  plafondIsolantEpaisseur: number;
  plancher: string;
  plancherIsolant: string;
  plancherIsolantEpaisseur: number;
  vitrage: string;
  ventilation: string;
  /** Plancher entre deux niveaux : bois (léger) ou béton (lourd). */
  plancherIntermediaire: string;
};

/** Valeurs de la méthode, injectées par `data/plan-thermique.ts`. */
export type Parametres = {
  tInterieure: number;
  tBase: number;
  /** U d'un mur non isolé (W/m²·K), plafonné par la méthode. */
  umurNu: (matiere: string, epaisseurCm: number, annee: string) => number;
  /** U d'une paroi isolée dont l'isolation est inconnue, selon l'époque de construction. */
  uTab: (paroi: 'mur' | 'plafond' | 'plancher', annee: string, plafond?: string) => number;
  /** Conductivité de l'isolant (W/m·K). */
  lambda: (isolant: string, paroi: 'mur' | 'plafond' | 'plancher') => number;
  uph0: (plafond: string) => number;
  upb0: number;
  /** b du plafond : combles perdus non isolés ou isolés, rampants, terrasse ; 0 si un étage chauffé est au-dessus. */
  bPlafond: (plafond: string, isole: boolean) => number;
  /** U équivalent du plancher bas sur terre-plein, vide sanitaire ou sous-sol (Ue), selon Upb et 2S/P. */
  ue: (plancher: string, upb: number, deuxSsurP: number, annee: string) => number;
  uw: (vitrage: string) => number;
  uPorte: number;
  /** b d'un local non chauffé selon Aiu/Aue (m²) et l'isolation de la paroi qui le sépare du logement. */
  bLocalNonChauffe: (aiu: number, aue: number, aiuIsole: boolean) => number;
  /** U d'une cloison intérieure (W/m²·K). */
  uCloison: number;
  /** U d'un plancher entre deux niveaux selon sa nature (W/m²·K). */
  uPlancherIntermediaire: (nature: string) => number;
  /** Ponts thermiques (W/m·K), selon le type de mur. */
  psiPlancherBas: (cat: CategorieMur, plancherIsole: boolean) => number;
  psiMenuiserie: (cat: CategorieMur) => number;
  psiPlancherIntermediaire: (cat: CategorieMur) => number;
  psiPlancherHaut: (cat: CategorieMur, plafondIsole: boolean) => number;
  /** Débits conventionnels de la ventilation (m³/h par m² habitable) et perméabilité de l'enveloppe. */
  ventilation: (type: string, annee: string) => { qvarep: number; qvasouf: number; smea: number };
  q4paConv: (annee: string, isole: boolean) => number;
  protection: { e: number; f: number };
};

/** Type de mur pour les ponts thermiques (3CL p. 33) : non isolé, isolé par l'intérieur, isolation répartie, mur léger. */
export type CategorieMur = 'non-isole' | 'ITI' | 'ITR' | 'leger';

export type Postes = {
  murs: number;
  fenetres: number;
  portes: number;
  plafond: number;
  plancher: number;
  nonChauffe: number;
  pontsThermiques: number;
  air: number;
};

export type ResultatPiece = { piece: Piece; surface: number; postes: Postes; H: number; puissance: number };

const somme = (p: Postes) => Object.values(p).reduce((a, b) => a + b, 0);
const isolee = (isolant: string) => isolant !== 'aucun';

/** U d'une paroi : non isolée, isolée d'une épaisseur connue (1/(1/U0 + e/λ)), ou isolée d'une façon inconnue (U tabulé de l'époque). */
const uParoi = (u0: number, isolant: string, epaisseurCm: number, paroi: 'mur' | 'plafond' | 'plancher', annee: string, p: Parametres, plafond?: string) => {
  if (!isolee(isolant)) return u0;
  if (isolant === 'inconnu') return Math.min(u0, p.uTab(paroi, annee, plafond));
  return 1 / (1 / u0 + epaisseurCm / 100 / p.lambda(isolant, paroi));
};

/** Surface d'une ouverture (m²), d'après sa largeur et sa hauteur. */
export const surfaceOuverture = (o: Ouverture) => o.longueur * PAS * o.hauteur;

export function deperditions(plan: Plan, env: Enveloppe, p: Parametres) {
  const dT = p.tInterieure - p.tBase;
  const mursParNiveau: Murs[] = Array.from({ length: plan.niveaux }, (_, n) => classerMurs(plan, n));
  const chauffees = plan.pieces.filter((x) => estChauffee(x.type));
  const nonChauffees = plan.pieces.filter((x) => !estChauffee(x.type));
  const surfaceChauffee = chauffees.reduce((s, x) => s + aire(x), 0);
  const hsp = env.hauteur;

  // U des parois, communs à toute la maison
  const umurNu = p.umurNu(env.murMatiere, env.murEpaisseur, env.annee);
  const umur = uParoi(umurNu, env.murIsolant, env.murIsolantEpaisseur, 'mur', env.annee, p);
  const etageAuDessus = env.plafond === 'etage-chauffe';
  const plafondIsole = isolee(env.plafondIsolant);
  const uph = etageAuDessus ? 0 : uParoi(p.uph0(env.plafond), env.plafondIsolant, env.plafondIsolantEpaisseur, 'plafond', env.annee, p, env.plafond);
  const bPlafond = etageAuDessus ? 0 : p.bPlafond(env.plafond, plafondIsole);
  const etageEnDessous = env.plancher === 'etage-chauffe';
  const upb = uParoi(p.upb0, env.plancherIsolant, env.plancherIsolantEpaisseur, 'plancher', env.annee, p);
  const uw = p.uw(env.vitrage);
  const uPi = p.uPlancherIntermediaire(env.plancherIntermediaire);
  // Type de mur pour les ponts thermiques : ossature bois = mur léger ; béton cellulaire sans isolant ajouté = isolation répartie ;
  // mur isolé = isolation par l'intérieur, position par défaut de la méthode à partir de 1975 (p. 33)
  const categorie: CategorieMur =
    env.murMatiere === 'ossature-bois' ? 'leger' : isolee(env.murIsolant) ? 'ITI' : env.murMatiere === 'beton-cellulaire' ? 'ITR' : 'non-isole';
  const murIsole = categorie !== 'non-isole';
  const plancherIsole = isolee(env.plancherIsolant);
  const plancherLourd = env.plancherIntermediaire === 'beton';

  /** Partie d'une pièce couverte par des pièces chauffées ou non chauffées d'un autre niveau (m²), et les non chauffées concernées. */
  const recouvrement = (piece: Piece, niveau: number) => {
    let chauffee = 0;
    const nonChauffees: { piece: Piece; aire: number }[] = [];
    for (const autre of piecesDuNiveau(plan, niveau)) {
      const a = intersection(piece, autre);
      if (a <= 0) continue;
      if (estChauffee(autre.type)) chauffee += a;
      else nonChauffees.push({ piece: autre, aire: a });
    }
    return { chauffee, nonChauffees, nonChauffee: nonChauffees.reduce((s, x) => s + x.aire, 0) };
  };

  // Locaux non chauffés : surfaces vers le logement (Aiu) et vers l'extérieur (Aue), d'où leur coefficient b (3CL § 3.1)
  const bLnc = new Map<string, number>();
  const lncAvecExterieur = new Set<string>();
  for (const lnc of nonChauffees) {
    const murs = mursParNiveau[lnc.niveau];
    const segs = contour(lnc);
    const longueurVers = (f: (m: { classe: string; pieces: Piece[] }) => boolean) => segs.filter((k) => { const m = murs.get(k); return m && f(m); }).length * PAS;
    const murExt = longueurVers((m) => m.classe === 'exterieur') * hsp;
    const murLogement = longueurVers((m) => m.classe === 'non-chauffe') * hsp;
    const dessus = recouvrement(lnc, lnc.niveau + 1);
    const dessous = lnc.niveau > 0 ? recouvrement(lnc, lnc.niveau - 1) : null;
    const toitExpose = etageAuDessus ? 0 : Math.max(0, aire(lnc) - dessus.chauffee - dessus.nonChauffee);
    const solExpose = lnc.niveau === 0 ? (etageEnDessous ? 0 : aire(lnc)) : Math.max(0, aire(lnc) - dessous!.chauffee - dessous!.nonChauffee);
    const aiu = murLogement + dessus.chauffee + (dessous?.chauffee ?? 0);
    const aue = murExt + toitExpose + solExpose;
    bLnc.set(lnc.id, p.bLocalNonChauffe(aiu, aue, murIsole));
    if (murExt > 0) lncAvecExterieur.add(lnc.id);
  }

  // Plancher bas du rez-de-chaussée : Ue selon 2S/P, avec P le périmètre donnant sur l'extérieur ou un local non chauffé (p. 18)
  const rdc = piecesDuNiveau(plan, 0).filter((x) => estChauffee(x.type));
  const surfaceRdc = rdc.reduce((s, x) => s + aire(x), 0);
  const perimetre =
    [...mursParNiveau[0].values()].filter((m) => (m.classe === 'exterieur' && estChauffee(m.pieces[0].type)) || m.classe === 'non-chauffe').length * PAS;
  const deuxSsurP = perimetre > 0 ? (2 * surfaceRdc) / perimetre : 0;
  const uPlancher = etageEnDessous ? 0 : p.ue(env.plancher, upb, deuxSsurP, env.annee);

  // Surfaces de plafond donnant sur les combles ou la toiture (pour la perméabilité à l'air)
  const plafondsExposes = chauffees.reduce((s, x) => {
    const dessus = recouvrement(x, x.niveau + 1);
    return s + Math.max(0, aire(x) - dessus.chauffee - dessus.nonChauffee);
  }, 0);

  // Renouvellement d'air de toute la maison (§4), réparti au prorata des surfaces ; Hsp × Sh = volume habitable
  const v = p.ventilation(env.ventilation, env.annee);
  const sh = surfaceChauffee;
  const surfacesDeperditives =
    chauffees.reduce((s, x) => s + contour(x).filter((k) => { const c = mursParNiveau[x.niveau].get(k)?.classe; return c === 'exterieur' || c === 'non-chauffe'; }).length * PAS * hsp, 0) +
    (etageAuDessus ? 0 : plafondsExposes);
  const q4pa = p.q4paConv(env.annee, murIsole || plafondIsole) * surfacesDeperditives + 0.45 * v.smea * sh;
  const n50 = sh > 0 ? q4pa / (Math.pow(4 / 50, 2 / 3) * hsp * sh) : 0;
  const { e, f } = p.protection;
  const qvinf = sh > 0 ? (hsp * sh * n50 * e) / (1 + (f / e) * Math.pow((v.qvasouf - v.qvarep) / (hsp * n50), 2)) : 0;
  const hAirParM2 = sh > 0 ? (0.34 * v.qvarep * sh + 0.34 * qvinf) / sh : 0;

  const resultats: ResultatPiece[] = chauffees.map((piece) => {
    const murs = mursParNiveau[piece.niveau];
    const segs = contour(piece);
    const surface = aire(piece);
    const longueur = (classe: string) => segs.filter((k) => murs.get(k)?.classe === classe).length * PAS;
    // Ouvertures sur les murs extérieurs (et portes vers un local non chauffé) de la pièce
    const ouvertures = ouverturesDuNiveau(plan, piece.niveau).filter((o) => segmentsOuverture(o).every((k) => segs.includes(k)));
    const surExterieur = ouvertures.filter((o) => murs.get(segmentsOuverture(o)[0])?.classe === 'exterieur');
    const aVitree = surExterieur.filter((o) => o.type !== 'porte').reduce((s, o) => s + surfaceOuverture(o), 0);
    const aPortes = surExterieur.filter((o) => o.type === 'porte').reduce((s, o) => s + surfaceOuverture(o), 0);
    const aMurExt = Math.max(0, longueur('exterieur') * hsp - aVitree - aPortes);

    // Murs vers des locaux non chauffés : mur de façade pour un garage ou un cellier qui a des murs extérieurs, cloison sinon
    let nonChauffe = 0;
    for (const k of segs) {
      const m = murs.get(k);
      if (m?.classe !== 'non-chauffe') continue;
      const lnc = m.pieces.find((x) => !estChauffee(x.type))!;
      const porte = ouverturesDuNiveau(plan, piece.niveau).find((o) => segmentsOuverture(o).includes(k));
      const aPorte = porte ? PAS * porte.hauteur : 0;
      const uMur = lncAvecExterieur.has(lnc.id) ? umur : p.uCloison;
      nonChauffe += (bLnc.get(lnc.id) ?? 0) * (uMur * Math.max(0, PAS * hsp - aPorte) + p.uPorte * aPorte);
    }

    // Plafond : seule la partie sans pièce au-dessus donne sur les combles ; au-dessus d'une pièce non chauffée, plancher intermédiaire et b
    const dessus = recouvrement(piece, piece.niveau + 1);
    const plafondExpose = Math.max(0, surface - dessus.chauffee - dessus.nonChauffee);
    for (const x of dessus.nonChauffees) nonChauffe += (bLnc.get(x.piece.id) ?? 0) * uPi * x.aire;
    // Plancher : au rez-de-chaussée, Ue ; à l'étage, rien au-dessus d'une pièce chauffée, plancher intermédiaire et b au-dessus
    // d'un local non chauffé, U plein en porte-à-faux
    let plancher: number;
    if (piece.niveau === 0) plancher = uPlancher * surface;
    else {
      const dessous = recouvrement(piece, piece.niveau - 1);
      plancher = upb * Math.max(0, surface - dessous.chauffee - dessous.nonChauffee);
      for (const x of dessous.nonChauffees) nonChauffe += (bLnc.get(x.piece.id) ?? 0) * uPi * x.aire;
    }

    // Ponts thermiques : plancher bas / mur au rez-de-chaussée, plancher intermédiaire lourd / mur à l'étage, toit-terrasse / mur,
    // pourtour des fenêtres
    const lExt = longueur('exterieur');
    const lPlancherBas = piece.niveau === 0 && !etageEnDessous ? lExt : 0;
    const lPlancherInter = piece.niveau > 0 && plancherLourd ? lExt : 0;
    const lPlancherHaut = env.plafond === 'terrasse' && plafondExpose > 0 ? lExt : 0;
    const lMenuiseries = surExterieur
      .filter((o) => o.type !== 'porte')
      .reduce((s, o) => s + 2 * o.hauteur + (o.type === 'fenetre' ? 2 : 1) * o.longueur * PAS, 0);

    const postes: Postes = {
      murs: umur * aMurExt,
      fenetres: uw * aVitree,
      portes: p.uPorte * aPortes,
      plafond: bPlafond * uph * plafondExpose,
      plancher,
      nonChauffe,
      pontsThermiques:
        p.psiPlancherBas(categorie, plancherIsole) * lPlancherBas +
        p.psiPlancherIntermediaire(categorie) * lPlancherInter +
        p.psiPlancherHaut(categorie, plafondIsole) * lPlancherHaut +
        p.psiMenuiserie(categorie) * lMenuiseries,
      air: hAirParM2 * surface,
    };
    const H = somme(postes);
    return { piece, surface, postes, H, puissance: H * dT };
  });

  const H = resultats.reduce((s, r) => s + r.H, 0);
  const volume = surfaceChauffee * hsp;
  return {
    pieces: resultats,
    H,
    puissance: H * dT,
    surfaceChauffee,
    volume,
    /** Coefficient G équivalent (W/m³·K), pour comparaison avec les autres outils. */
    G: volume > 0 ? H / volume : 0,
    u: { mur: umur, plafond: uph, plancher: uPlancher, fenetre: uw },
    deuxSsurP,
  };
}

/**
 * Géométrie de l'éditeur de plan (`/outils/plan-maison/`). Le plan est une grille de pas `PAS` mètres ; pièces et
 * ouvertures sont exprimées en cases, sur un ou plusieurs niveaux (0 = rez-de-chaussée). Les murs sont découpés en
 * segments d'une case et classés, niveau par niveau, selon les pièces qui les bordent : extérieur, mitoyen,
 * intérieur, ou vers un local non chauffé. Un escalier relie une pièce d'un niveau à celle du niveau supérieur.
 */

/** Pas de la grille, en mètres. */
export const PAS = 0.5;
/** Nombre maximal de niveaux (rez-de-chaussée et deux étages). */
export const NIVEAUX_MAX = 3;
/** Nom d'un niveau : « Étage » s'il n'y en a qu'un au-dessus du rez-de-chaussée, sinon « 1er étage », « 2e étage ». */
export const nomNiveau = (n: number, total = 2) => (n === 0 ? 'Rez-de-chaussée' : total <= 2 ? 'Étage' : n === 1 ? '1er étage' : `${n}e étage`);
/** Nom précédé de son article : « le rez-de-chaussée », « l’étage », « le 2e étage ». */
export const niveauAvecArticle = (n: number, total = 2) => {
  const nom = nomNiveau(n, total).toLowerCase();
  return /^[aeiouyéè]/.test(nom) ? `l’${nom}` : `le ${nom}`;
};

export type TypePiece = 'sejour' | 'cuisine' | 'chambre' | 'sdb' | 'circulation' | 'bureau' | 'non-chauffe';

export const typesPiece: { value: TypePiece; label: string; chauffee: boolean }[] = [
  { value: 'sejour', label: 'Séjour', chauffee: true },
  { value: 'cuisine', label: 'Cuisine', chauffee: true },
  { value: 'chambre', label: 'Chambre', chauffee: true },
  { value: 'sdb', label: 'Salle de bain', chauffee: true },
  { value: 'circulation', label: 'Entrée, couloir, palier', chauffee: true },
  { value: 'bureau', label: 'Bureau', chauffee: true },
  { value: 'non-chauffe', label: 'Non chauffée (garage, cellier…)', chauffee: false },
];

export const estChauffee = (t: TypePiece) => typesPiece.find((x) => x.value === t)?.chauffee ?? true;

export type Rect = { x: number; y: number; w: number; h: number };
export type Piece = Rect & { id: string; nom: string; type: TypePiece; niveau: number };

/** `passage` : ouverture complète entre deux pièces chauffées (cloison supprimée sur cette longueur, toute hauteur). */
export type TypeOuverture = 'fenetre' | 'porte-fenetre' | 'porte' | 'passage';
/** Largeur par défaut (cases) et hauteur proposée (m), modifiables pour chaque ouverture. */
export const typesOuverture: { value: TypeOuverture; label: string; longueur: number; hauteur: number }[] = [
  { value: 'fenetre', label: 'Fenêtre', longueur: 2, hauteur: 1.25 },
  { value: 'porte-fenetre', label: 'Porte-fenêtre', longueur: 4, hauteur: 2.15 },
  { value: 'porte', label: 'Porte', longueur: 2, hauteur: 2.15 },
  { value: 'passage', label: 'Ouverture entre deux pièces', longueur: 4, hauteur: 2.5 },
];
export const hauteurParDefaut = (t: TypeOuverture) => typesOuverture.find((x) => x.value === t)!.hauteur;

/** Ouverture posée sur une ligne de la grille : horizontale de (x, y) à (x + longueur, y), verticale de (x, y) à (x, y + longueur). */
export type Ouverture = {
  id: string;
  type: TypeOuverture;
  niveau: number;
  sens: 'h' | 'v';
  x: number;
  y: number;
  longueur: number;
  hauteur: number;
  /** Porte intérieure ouverte (par défaut) ou fermée. */
  ouverte?: boolean;
};

/** Trémie d'escalier, dessinée au niveau `niveau` et débouchant au niveau supérieur. */
export type Escalier = Rect & { id: string; niveau: number };

export type NaturePoele = 'granules' | 'canalisable' | 'hydro' | 'bois';
export const naturesPoele: { value: NaturePoele; label: string }[] = [
  { value: 'granules', label: 'Poêle à granulés à air' },
  { value: 'canalisable', label: 'Poêle à granulés canalisable' },
  { value: 'hydro', label: 'Poêle à granulés hydro (chauffe les radiateurs)' },
  { value: 'bois', label: 'Poêle à bois' },
];
/** Radiateur à eau, radiateur électrique, ou unité intérieure murale d'une pompe à chaleur air/air (split). */
export type NatureRadiateur = 'eau' | 'electrique' | 'split';
export const naturesRadiateur: { value: NatureRadiateur; label: string }[] = [
  { value: 'eau', label: 'Radiateur à eau (chauffage central)' },
  { value: 'electrique', label: 'Radiateur électrique' },
  { value: 'split', label: 'Unité intérieure de PAC air/air (split)' },
];

/** Poêle posé dans une pièce (centre en cases), régulé sur sa consigne dans cette pièce. */
export type Poele = {
  id: string;
  genre: 'poele';
  piece: string;
  x: number;
  y: number;
  nature: NaturePoele;
  /** Puissance nominale (kW). */
  puissance: number;
  /** Consigne du thermostat, ou température visée pour un poêle à bois (°C). */
  consigne: number;
  /** Poêle canalisable : pièces desservies par les gaines et part de la puissance envoyée (%). */
  gaines: string[];
  partGaines: number;
  /** Poêle hydro : part de sa puissance cédée à l'eau des radiateurs (%), le reste chauffant sa pièce. */
  partEau: number;
};
/** Radiateur posé dans une pièce, avec son robinet thermostatique ou son thermostat. */
export type Radiateur = {
  id: string;
  genre: 'radiateur';
  piece: string;
  x: number;
  y: number;
  nature: NatureRadiateur;
  /** Puissance (W) : nominale (eau à 75 °C, régime 75/65/20) pour un radiateur à eau. */
  puissance: number;
  consigne: number;
  /** Posé le long d'un mur horizontal (h) ou vertical (v) du plan. */
  sens: 'h' | 'v';
};
export type Emetteur = Poele | Radiateur;

export type Generateur = 'aucun' | 'chaudiere' | 'pac';
export const generateurs: { value: Generateur; label: string }[] = [
  { value: 'aucun', label: 'Pas de chauffage central' },
  { value: 'chaudiere', label: 'Chaudière (gaz, fioul, bois)' },
  { value: 'pac', label: 'Pompe à chaleur air/eau' },
];
/** Chauffage central qui alimente les radiateurs à eau. */
export type ChauffageCentral = {
  generateur: Generateur;
  /** Puissance du générateur (kW). */
  puissance: number;
  /** Température de départ de l'eau par grand froid (°C), loi d'eau jusqu'à 20 °C quand il fait 20 °C dehors. */
  depart: number;
  /** Emplacement de la chaudière ou de la pompe à chaleur sur le plan (pièce, chauffée ou non, et centre en cases). */
  piece?: string;
  x?: number;
  y?: number;
};
export const centralParDefaut = (): ChauffageCentral => ({ generateur: 'aucun', puissance: 24, depart: 70 });
export const poeleParDefaut = (id: string, piece: string, x: number, y: number): Poele => ({
  id,
  genre: 'poele',
  piece,
  x,
  y,
  nature: 'granules',
  puissance: 8,
  consigne: 20,
  gaines: [],
  partGaines: 40,
  partEau: 80,
});
/** Un poêle hydro alimente les radiateurs à eau, comme une chaudière. */
export const poelesHydro = (plan: Plan) => plan.emetteurs.filter((e): e is Poele => e.genre === 'poele' && e.nature === 'hydro');
/** Les radiateurs à eau ont-ils de l'eau chaude : chaudière, pompe à chaleur ou poêle hydro ? */
export const aChauffageEau = (plan: Plan) => plan.central.generateur !== 'aucun' || poelesHydro(plan).length > 0;

export type Plan = {
  pieces: Piece[];
  ouvertures: Ouverture[];
  escaliers: Escalier[];
  /** Segments de mur marqués mitoyens : `niveau|clé`. */
  mitoyens: string[];
  /** Nombre de niveaux du plan. */
  niveaux: number;
  /** Direction du haut du plan. */
  nord: 'haut' | 'droite' | 'bas' | 'gauche';
  /** Poêles et radiateurs. */
  emetteurs: Emetteur[];
  central: ChauffageCentral;
};

export const planVide = (): Plan => ({ pieces: [], ouvertures: [], escaliers: [], mitoyens: [], niveaux: 1, nord: 'haut', emetteurs: [], central: centralParDefaut() });
export const poeles = (plan: Plan) => plan.emetteurs.filter((e): e is Poele => e.genre === 'poele');
export const radiateurs = (plan: Plan) => plan.emetteurs.filter((e): e is Radiateur => e.genre === 'radiateur');

const nombre = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const entier = (v: unknown, min: number, max: number) => nombre(v) && Number.isInteger(v) && v >= min && v <= max;
const identifiant = (v: unknown): v is string => typeof v === 'string' && /^[\w-]{1,40}$/.test(v);

/**
 * Relit un plan sauvegardé (éventuellement par une version précédente de l'outil, à un seul niveau) en ne gardant que
 * des données valides : un plan abîmé ne doit jamais bloquer l'éditeur.
 */
export const migrerPlan = (brut: unknown): Plan => {
  const b = (brut && typeof brut === 'object' ? brut : {}) as Record<string, unknown>;
  const liste = (v: unknown) => (Array.isArray(v) ? v.filter((x) => x && typeof x === 'object') : []) as Record<string, unknown>[];
  const pieces: Piece[] = liste(b.pieces)
    .filter((p) => identifiant(p.id) && typeof p.nom === 'string' && typesPiece.some((t) => t.value === p.type) && [p.x, p.y].every((v) => entier(v, 0, 200)) && [p.w, p.h].every((v) => entier(v, 2, 200)) && (p.niveau === undefined || entier(p.niveau, 0, NIVEAUX_MAX - 1)))
    .map((p) => ({ id: p.id as string, nom: String(p.nom).slice(0, 40), type: p.type as TypePiece, x: p.x as number, y: p.y as number, w: p.w as number, h: p.h as number, niveau: (p.niveau as number) ?? 0 }));
  const ouvertures: Ouverture[] = liste(b.ouvertures)
    .filter((o) => identifiant(o.id) && typesOuverture.some((t) => t.value === o.type) && (o.sens === 'h' || o.sens === 'v') && [o.x, o.y].every((v) => entier(v, 0, 200)) && entier(o.longueur, 1, 100) && (o.niveau === undefined || entier(o.niveau, 0, NIVEAUX_MAX - 1)))
    .map((o) => ({
      id: o.id as string,
      type: o.type as TypeOuverture,
      niveau: (o.niveau as number) ?? 0,
      sens: o.sens as 'h' | 'v',
      x: o.x as number,
      y: o.y as number,
      longueur: o.longueur as number,
      hauteur: nombre(o.hauteur) && o.hauteur > 0 && o.hauteur <= 3 ? o.hauteur : hauteurParDefaut(o.type as TypeOuverture),
      ...(typeof o.ouverte === 'boolean' ? { ouverte: o.ouverte } : {}),
    }));
  const escaliers: Escalier[] = liste(b.escaliers)
    .filter((e) => identifiant(e.id) && [e.x, e.y].every((v) => entier(v, 0, 200)) && [e.w, e.h].every((v) => entier(v, 1, 200)) && entier(e.niveau, 0, NIVEAUX_MAX - 2))
    .map((e) => ({ id: e.id as string, niveau: e.niveau as number, x: e.x as number, y: e.y as number, w: e.w as number, h: e.h as number }));
  const mitoyens = (Array.isArray(b.mitoyens) ? b.mitoyens : [])
    .filter((k): k is string => typeof k === 'string' && /^(\d\|)?[hv]:\d+:\d+$/.test(k))
    .map((k) => (k.includes('|') ? k : `0|${k}`));
  const niveaux = Math.min(NIVEAUX_MAX, Math.max(1, entier(b.niveaux, 1, NIVEAUX_MAX) ? (b.niveaux as number) : 1, ...pieces.map((p) => p.niveau + 1)));
  const nord = (['haut', 'droite', 'bas', 'gauche'] as const).find((n) => n === b.nord) ?? 'haut';
  const borne = (v: unknown, min: number, max: number, defaut: number) => (nombre(v) ? Math.min(max, Math.max(min, v)) : defaut);
  const emetteurs: Emetteur[] = [];
  // Ancien format : un seul poêle (`poele`), réglé hors du plan
  const ancien = b.poele as Record<string, unknown> | undefined;
  if (ancien && identifiant(ancien.piece) && nombre(ancien.x) && nombre(ancien.y))
    emetteurs.push({ ...poeleParDefaut('poele1', ancien.piece, ancien.x, ancien.y), gaines: Array.isArray(ancien.gaines) ? ancien.gaines.filter(identifiant) : [] });
  for (const e of liste(b.emetteurs)) {
    if (!identifiant(e.id) || !identifiant(e.piece) || !nombre(e.x) || !nombre(e.y) || emetteurs.some((x) => x.id === e.id)) continue;
    if (e.genre === 'poele')
      emetteurs.push({
        ...poeleParDefaut(e.id, e.piece, e.x, e.y),
        nature: naturesPoele.find((n) => n.value === e.nature)?.value ?? 'granules',
        puissance: borne(e.puissance, 1, 30, 8),
        consigne: borne(e.consigne, 10, 28, 20),
        gaines: Array.isArray(e.gaines) ? e.gaines.filter(identifiant) : [],
        partGaines: borne(e.partGaines, 0, 80, 40),
        partEau: borne(e.partEau, 50, 95, 80),
      });
    else if (e.genre === 'radiateur')
      emetteurs.push({
        id: e.id,
        genre: 'radiateur',
        piece: e.piece,
        x: e.x,
        y: e.y,
        nature: naturesRadiateur.find((n) => n.value === e.nature)?.value ?? 'eau',
        puissance: borne(e.puissance, 100, 10000, 1000),
        consigne: borne(e.consigne, 10, 28, 19),
        sens: e.sens === 'v' ? 'v' : 'h',
      });
  }
  const c = (b.central && typeof b.central === 'object' ? b.central : {}) as Record<string, unknown>;
  const central: ChauffageCentral = {
    generateur: generateurs.find((g) => g.value === c.generateur)?.value ?? 'aucun',
    puissance: borne(c.puissance, 1, 100, 24),
    depart: borne(c.depart, 30, 90, 70),
    ...(identifiant(c.piece) && nombre(c.x) && nombre(c.y) ? { piece: c.piece, x: c.x, y: c.y } : {}),
  };
  return nettoyerOuvertures({ nord, niveaux, pieces, ouvertures, escaliers, mitoyens, emetteurs, central });
};

/** Clé d'un segment de mur d'une case. */
export const cle = (sens: 'h' | 'v', x: number, y: number) => `${sens}:${x}:${y}`;
export const lireCle = (k: string) => {
  const [sens, x, y] = k.split(':');
  return { sens: sens as 'h' | 'v', x: Number(x), y: Number(y) };
};

/** Segments d'une case qui forment le contour d'une pièce. */
export const contour = (p: Rect) => {
  const segs: string[] = [];
  for (let i = 0; i < p.w; i++) segs.push(cle('h', p.x + i, p.y), cle('h', p.x + i, p.y + p.h));
  for (let j = 0; j < p.h; j++) segs.push(cle('v', p.x, p.y + j), cle('v', p.x + p.w, p.y + j));
  return segs;
};

export const surface = (r: Rect) => r.w * r.h * PAS * PAS;

/** Surface commune à deux rectangles (m²). */
export const intersection = (a: Rect, b: Rect) => {
  const w = Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x);
  const h = Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y);
  return w > 0 && h > 0 ? w * h * PAS * PAS : 0;
};

/** Deux rectangles se chevauchent-ils (bords communs autorisés) ? */
export const chevauche = (a: Rect, b: Rect) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;

/** Le point (x, y) est-il dans le rectangle ? */
export const contient = (r: Rect, x: number, y: number) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

export const piecesDuNiveau = (plan: Plan, niveau: number) => plan.pieces.filter((p) => p.niveau === niveau);
export const ouverturesDuNiveau = (plan: Plan, niveau: number) => plan.ouvertures.filter((o) => o.niveau === niveau);

export type ClasseMur = 'exterieur' | 'mitoyen' | 'interieur' | 'non-chauffe';
export type Murs = Map<string, { classe: ClasseMur; pieces: Piece[] }>;

/** Classe chaque segment de mur d'un niveau selon les pièces qui le bordent. */
export const classerMurs = (plan: Plan, niveau: number): Murs => {
  const bord = new Map<string, Piece[]>();
  for (const p of piecesDuNiveau(plan, niveau)) for (const k of contour(p)) bord.set(k, [...(bord.get(k) ?? []), p]);
  const mitoyens = new Set(plan.mitoyens.filter((k) => k.startsWith(`${niveau}|`)).map((k) => k.slice(k.indexOf('|') + 1)));
  const murs: Murs = new Map();
  for (const [k, pieces] of bord) {
    let classe: ClasseMur;
    if (pieces.length === 1) classe = mitoyens.has(k) ? 'mitoyen' : 'exterieur';
    else classe = estChauffee(pieces[0].type) === estChauffee(pieces[1].type) ? 'interieur' : 'non-chauffe';
    murs.set(k, { classe, pieces });
  }
  return murs;
};

/** Segments couverts par une ouverture. */
export const segmentsOuverture = (o: Pick<Ouverture, 'sens' | 'x' | 'y' | 'longueur'>) =>
  Array.from({ length: o.longueur }, (_, i) => (o.sens === 'h' ? cle('h', o.x + i, o.y) : cle('v', o.x, o.y + i)));

/**
 * Une ouverture peut-elle être posée ici ? Fenêtres sur mur extérieur uniquement, portes aussi entre pièces, ouverture
 * complète seulement entre deux pièces chauffées.
 */
export const ouverturePossible = (plan: Plan, o: Pick<Ouverture, 'type' | 'niveau' | 'sens' | 'x' | 'y' | 'longueur'>, ignorer?: string) => {
  const murs = classerMurs(plan, o.niveau);
  const occupes = new Set(ouverturesDuNiveau(plan, o.niveau).filter((x) => x.id !== ignorer).flatMap(segmentsOuverture));
  const segs = segmentsOuverture(o);
  // Une ouverture ne chevauche pas deux pièces : tous ses segments bordent les mêmes pièces
  const pieces = (k: string) => (murs.get(k)?.pieces ?? []).map((p) => p.id).sort().join('|');
  if (segs.some((k) => pieces(k) !== pieces(segs[0]))) return false;
  return segs.every((k) => {
    const mur = murs.get(k);
    if (!mur || occupes.has(k) || mur.classe === 'mitoyen') return false;
    if (o.type === 'passage') return mur.classe === 'interieur';
    return o.type === 'porte' || mur.classe === 'exterieur';
  });
};

/** Pièce du niveau qui contient le centre d'un rectangle (escalier, poêle). */
export const pieceSous = (plan: Plan, niveau: number, x: number, y: number) => piecesDuNiveau(plan, niveau).find((p) => contient(p, x, y));

/**
 * Remet le plan en cohérence après une modification : ouvertures qui ne reposent plus sur un mur, murs mitoyens
 * disparus, escaliers sans pièce en haut ou en bas, poêles et radiateurs qui restent dans une pièce chauffée.
 */
export const nettoyerOuvertures = (plan: Plan): Plan => {
  const gardees: Ouverture[] = [];
  for (const o of plan.ouvertures) if (o.niveau < plan.niveaux && ouverturePossible({ ...plan, ouvertures: gardees }, o)) gardees.push(o);
  const mitoyens = plan.mitoyens.filter((k) => {
    const [n, seg] = k.split('|');
    return classerMurs(plan, Number(n)).has(seg);
  });
  const escaliers = plan.escaliers.filter((e) => {
    const cx = e.x + e.w / 2;
    const cy = e.y + e.h / 2;
    return e.niveau + 1 < plan.niveaux && pieceSous(plan, e.niveau, cx, cy) && pieceSous(plan, e.niveau + 1, cx, cy);
  });
  const emetteurs: Emetteur[] = [];
  for (const e of plan.emetteurs) {
    const piece = plan.pieces.find((p) => p.id === e.piece && p.niveau < plan.niveaux && estChauffee(p.type));
    if (!piece) continue;
    const place = { ...e, x: Math.min(Math.max(e.x, piece.x + 0.5), piece.x + piece.w - 0.5), y: Math.min(Math.max(e.y, piece.y + 0.5), piece.y + piece.h - 0.5) };
    emetteurs.push(place.genre === 'poele' ? { ...place, gaines: place.gaines.filter((id) => id !== piece.id && plan.pieces.some((p) => p.id === id && estChauffee(p.type))) } : place);
  }
  // Chaudière : elle suit sa pièce (chauffée ou non) ; si la pièce disparaît, la chaudière aussi
  const lieu = plan.central.piece ? plan.pieces.find((p) => p.id === plan.central.piece && p.niveau < plan.niveaux) : undefined;
  const central: ChauffageCentral = lieu
    ? { ...plan.central, x: Math.min(Math.max(plan.central.x!, lieu.x + 0.5), lieu.x + lieu.w - 0.5), y: Math.min(Math.max(plan.central.y!, lieu.y + 0.5), lieu.y + lieu.h - 0.5) }
    : plan.central.piece
      ? { generateur: 'aucun', puissance: plan.central.puissance, depart: plan.central.depart }
      : plan.central;
  return { ...plan, ouvertures: gardees, mitoyens, escaliers, emetteurs, central };
};

/** Récapitulatif géométrique, en m et m². */
export const recapitulatif = (plan: Plan, hauteur: number) => {
  const parPiece = plan.pieces.map((p) => {
    const murs = classerMurs(plan, p.niveau);
    const segs = contour(p);
    const longueur = (classe: ClasseMur) => segs.filter((k) => murs.get(k)?.classe === classe).length * PAS;
    const ouvertures = ouverturesDuNiveau(plan, p.niveau).filter((o) => segmentsOuverture(o).some((k) => segs.includes(k) && murs.get(k)?.classe === 'exterieur'));
    const vitree = ouvertures.filter((o) => o.type !== 'porte').reduce((s, o) => s + o.longueur * PAS, 0);
    return {
      piece: p,
      surface: surface(p),
      murExterieur: longueur('exterieur'),
      murMitoyen: longueur('mitoyen'),
      murNonChauffe: longueur('non-chauffe'),
      /** Largeur cumulée des fenêtres et portes-fenêtres sur les murs extérieurs (m). */
      largeurVitree: vitree,
    };
  });
  const chauffees = parPiece.filter((r) => estChauffee(r.piece.type));
  const total = (f: (r: (typeof parPiece)[number]) => number, liste = chauffees) => liste.reduce((s, r) => s + f(r), 0);
  return {
    parPiece,
    surfaceChauffee: total((r) => r.surface),
    surfaceNonChauffee: total((r) => r.surface, parPiece.filter((r) => !estChauffee(r.piece.type))),
    murExterieur: total((r) => r.murExterieur),
    murMitoyen: total((r) => r.murMitoyen),
    murNonChauffe: total((r) => r.murNonChauffe),
    largeurVitree: total((r) => r.largeurVitree),
    volume: total((r) => r.surface) * hauteur,
  };
};

/** Contour englobant de toutes les pièces (cases), pour cadrer la vue. */
export const emprise = (plan: Plan): Rect | null => {
  if (!plan.pieces.length) return null;
  const x = Math.min(...plan.pieces.map((p) => p.x));
  const y = Math.min(...plan.pieces.map((p) => p.y));
  return { x, y, w: Math.max(...plan.pieces.map((p) => p.x + p.w)) - x, h: Math.max(...plan.pieces.map((p) => p.y + p.h)) - y };
};

/**
 * Déplace une pièce de (ddx, ddy) cases avec ce qui lui appartient : ses ouvertures, ses escaliers, ses murs
 * mitoyens, ses poêles et radiateurs. Utilisé par le glisser et par les flèches du clavier.
 */
export const deplacerPiece = (plan: Plan, p: Piece, ddx: number, ddy: number): Plan => {
  const segs = new Set(contour(p));
  const dedans = (e: Escalier) => e.niveau === p.niveau && contient(p, e.x, e.y) && contient(p, e.x + e.w, e.y + e.h);
  const decaler = (k: string) => {
    const [n, seg] = k.split('|');
    const c = lireCle(seg);
    return `${n}|${cle(c.sens, c.x + ddx, c.y + ddy)}`;
  };
  return {
    ...plan,
    pieces: plan.pieces.map((q) => (q.id === p.id ? { ...q, x: q.x + ddx, y: q.y + ddy } : q)),
    ouvertures: plan.ouvertures.map((o) => (o.niveau === p.niveau && segmentsOuverture(o).every((k) => segs.has(k)) ? { ...o, x: o.x + ddx, y: o.y + ddy } : o)),
    escaliers: plan.escaliers.map((e) => (dedans(e) ? { ...e, x: e.x + ddx, y: e.y + ddy } : e)),
    mitoyens: plan.mitoyens.map((k) => (k.startsWith(`${p.niveau}|`) && segs.has(k.slice(k.indexOf('|') + 1)) ? decaler(k) : k)),
    emetteurs: plan.emetteurs.map((e) => (e.piece === p.id ? { ...e, x: e.x + ddx, y: e.y + ddy } : e)),
    central: plan.central.piece === p.id ? { ...plan.central, x: plan.central.x! + ddx, y: plan.central.y! + ddy } : plan.central,
  };
};

export type Cote = 'haut' | 'bas' | 'gauche' | 'droite';

/**
 * Ouverture de type `type` posée sur un côté de la pièce, au plus près du milieu, là où le mur le permet
 * (utilisé pour ajouter une fenêtre ou une porte sans pointeur). `null` si le côté n'a pas de place.
 */
export const ouvertureSurCote = (plan: Plan, p: Piece, cote: Cote, type: TypeOuverture): Omit<Ouverture, 'id'> | null => {
  const horizontal = cote === 'haut' || cote === 'bas';
  const longueurCote = horizontal ? p.w : p.h;
  const defaut = typesOuverture.find((t) => t.value === type)!.longueur;
  const longueur = Math.min(defaut, longueurCote);
  const debutMilieu = Math.round((longueurCote - longueur) / 2);
  for (let ecart = 0; ecart <= longueurCote; ecart++) {
    for (const signe of [1, -1]) {
      const d = debutMilieu + signe * ecart;
      if (d < 0 || d + longueur > longueurCote) continue;
      const o = {
        type,
        niveau: p.niveau,
        sens: horizontal ? ('h' as const) : ('v' as const),
        x: horizontal ? p.x + d : cote === 'gauche' ? p.x : p.x + p.w,
        y: horizontal ? (cote === 'haut' ? p.y : p.y + p.h) : p.y + d,
        longueur,
        hauteur: hauteurParDefaut(type),
      };
      if (ouverturePossible(plan, o)) return o;
    }
  }
  return null;
};

/**
 * Radiateur posé contre le mur de la pièce le plus proche du point (x, y), à 25 cm du mur (son centre) et à au moins 80 cm des angles :
 * position (centre, au demi-pas) et sens.
 */
export const placerRadiateur = (p: Rect, x: number, y: number) => {
  const distances = { gauche: x - p.x, droite: p.x + p.w - x, haut: y - p.y, bas: p.y + p.h - y };
  const mur = (Object.keys(distances) as (keyof typeof distances)[]).reduce((a, b) => (distances[b] < distances[a] ? b : a));
  const demi = (v: number) => Math.round(v * 2) / 2;
  const le = (v: number, min: number, max: number) => (min > max ? (min + max) / 2 : Math.min(max, Math.max(min, v)));
  if (mur === 'haut' || mur === 'bas')
    return { sens: 'h' as const, x: le(demi(x), p.x + 0.8, p.x + p.w - 0.8), y: mur === 'haut' ? p.y + 0.5 : p.y + p.h - 0.5 };
  return { sens: 'v' as const, y: le(demi(y), p.y + 0.8, p.y + p.h - 0.8), x: mur === 'gauche' ? p.x + 0.5 : p.x + p.w - 0.5 };
};

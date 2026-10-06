/**
 * Éditeur de plan (`/outils/plan-maison/`) : pièces sur une grille, sur un ou plusieurs niveaux, ouvertures, murs
 * mitoyens, escaliers, parois, poêle. Calcule la puissance nécessaire par pièce et les températures avec le poêle.
 * Le rendu est un SVG reconstruit à chaque changement ; l'état est gardé dans le navigateur (localStorage).
 */
import {
  PAS,
  NIVEAUX_MAX,
  nomNiveau,
  niveauAvecArticle,
  typesPiece,
  typesOuverture,
  classerMurs,
  contour,
  chevauche,
  segmentsOuverture,
  ouverturePossible,
  ouvertureSurCote,
  deplacerPiece,
  nettoyerOuvertures,
  recapitulatif,
  planVide,
  migrerPlan,
  estChauffee,
  hauteurParDefaut,
  lireCle,
  pieceSous,
  piecesDuNiveau,
  ouverturesDuNiveau,
  emprise,
  surface,
  naturesPoele,
  naturesRadiateur,
  aChauffageEau,
  poelesHydro,
  poeleParDefaut,
  placerRadiateur,
  generateurs,
  type Plan,
  type Piece,
  type Emetteur,
  type Poele,
  type Radiateur,
  type Ouverture,
  type Escalier,
  type Rect,
  type Cote,
  type TypeOuverture,
  type TypePiece,
} from '../lib/plan/geometrie';
import { modeles, planExemple } from '../lib/plan/modeles';
import { deperditions, type Enveloppe, type Postes } from '../lib/plan/deperditions';
import { parametres, radiateurPourPac, postesLabels, physiqueEchanges, apportsInternesParM2, regulation, soleilJanvier, journeeJanvier } from '../data/plan-thermique';
import { apportsSolaires } from '../lib/plan/solaire';
import { gammesRadiateurs, LONGUEUR_MIN_PANNEAU, PAS_LONGUEUR_PANNEAU } from '../data/radiateurs';
import { pac as pacDonnees } from '../data/thermique';
import { classeInertieNiveau, classesInertie, parametresInertie, type ClasseInertie } from '../lib/plan/inertie';
import { temperatures, journee, type Conditions, type Regime, type Inertie } from '../lib/plan/temperatures';

const COLS = 60;
const ROWS = 44;
/** Marge (en cases) que la vue peut montrer autour de la grille, pour cadrer la maison sous les éléments posés sur le plan. */
const MARGE = 16;
const STOCKAGE = 'fk-plan-maquette';
/** Remplissage d'un appareil à fond (il ne peut pas donner plus). */
const ROUGE_A_FOND = 'var(--color-danger-300)';
const NS = 'http://www.w3.org/2000/svg';

type Outil = 'selection' | 'piece' | TypeOuverture | 'mitoyen' | 'escalier' | 'poele' | 'radiateur' | 'split' | 'chaudiere' | 'pac';
/** Étapes du simulateur : chacune a ses outils, ce que montre le plan et son panneau. */
type Etape = 'plan' | 'maison' | 'chauffage' | 'resultat';
const ETAPES: Etape[] = ['plan', 'maison', 'chauffage', 'resultat'];
/** Outils de chaque étape (les autres étapes n'en ont pas : on y choisit seulement les pièces). */
const outilsEtape: Record<Etape, Outil[]> = {
  plan: ['selection', 'piece', 'fenetre', 'porte-fenetre', 'porte', 'passage', 'escalier', 'mitoyen'],
  maison: ['selection'],
  chauffage: ['selection', 'poele', 'radiateur', 'split', 'chaudiere', 'pac'],
  resultat: ['selection'],
};
type Selection = { genre: 'piece' | 'ouverture' | 'escalier' | 'emetteur' | 'generateur'; id: string } | null;
type Vue = { x: number; y: number; w: number; h: number };
type Glisser =
  | { genre: 'dessin'; quoi: 'piece' | 'escalier'; x0: number; y0: number; x1: number; y1: number }
  | { genre: 'deplacer'; id: string; dx: number; dy: number; cx: number; cy: number; seuil: number; moved: boolean }
  | { genre: 'emetteur' | 'generateur'; id: string; cx: number; cy: number; seuil: number; moved: boolean }
  | { genre: 'redim'; id: string; coin: string; origine: Piece }
  | { genre: 'pan'; cx: number; cy: number; vue: Vue }
  | { genre: 'pinch'; distance: number; centre: { x: number; y: number }; vue: Vue }
  | { genre: 'clic'; x: number; y: number; cx: number; cy: number }
  | null;

const aides: Record<Outil, string> = {
  selection: 'Cliquez sur une pièce pour la modifier, faites-la glisser pour la déplacer, tirez un coin pour l’agrandir.',
  piece: 'Cliquez-glissez (ou faites glisser le doigt) sur la grille pour dessiner une pièce. Une case = 50 cm.',
  fenetre: 'Approchez le pointeur d’un mur extérieur (trait épais) jusqu’à voir l’aperçu vert, puis cliquez pour poser une fenêtre. Sur téléphone, touchez le mur.',
  'porte-fenetre': 'Approchez le pointeur d’un mur extérieur (trait épais) jusqu’à voir l’aperçu vert, puis cliquez pour poser une porte-fenêtre. Sur téléphone, touchez le mur.',
  porte: 'Cliquez sur un mur pour poser une porte : porte d’entrée, ou porte entre deux pièces.',
  passage: 'Cliquez sur une cloison entre deux pièces pour les ouvrir l’une sur l’autre (cuisine ouverte…) : toute la cloison commune disparaît. Réduisez sa largeur dans le détail si besoin.',
  mitoyen: 'Cliquez sur un mur extérieur pour le déclarer mitoyen (collé au voisin), et recliquez pour annuler.',
  escalier: 'Cliquez-glissez (ou faites glisser le doigt) dans une pièce pour dessiner la trémie de l’escalier qui monte à l’étage.',
  poele: 'Placez le poêle dans une pièce chauffée (aperçu vert), puis cliquez. Vous pouvez en mettre plusieurs.',
  radiateur: 'Approchez le pointeur du mur où poser le radiateur (aperçu vert), puis cliquez : sa puissance est proposée d’après le besoin de la pièce.',
  split: 'Approchez le pointeur du mur où poser l’unité intérieure de la pompe à chaleur air/air (aperçu vert), puis cliquez : sa puissance est proposée d’après le besoin de la pièce.',
  chaudiere: 'Cliquez dans une pièce (chaufferie, garage, cellier…) pour y poser la chaudière, puis réglez-la dans le détail.',
  pac: 'Cliquez dans une pièce (garage, cellier, buanderie…) pour y poser le module intérieur de la pompe à chaleur air/eau, puis réglez-la dans le détail.',
};
/** Aides courtes du téléphone, où le texte passe par-dessus le plan. */
const aidesTelephone: Record<Outil, string> = {
  selection: '',
  piece: 'Faites glisser le doigt sur la grille pour dessiner une pièce.',
  fenetre: 'Touchez un mur extérieur pour poser une fenêtre.',
  'porte-fenetre': 'Touchez un mur extérieur pour poser une porte-fenêtre.',
  porte: 'Touchez un mur pour poser une porte.',
  passage: 'Touchez une cloison pour ouvrir deux pièces l’une sur l’autre.',
  mitoyen: 'Touchez un mur extérieur pour le déclarer mitoyen.',
  escalier: 'Faites glisser le doigt dans une pièce pour dessiner la trémie de l’escalier.',
  poele: 'Touchez une pièce chauffée pour y installer un poêle.',
  radiateur: 'Touchez une pièce près du mur où poser le radiateur.',
  split: 'Touchez une pièce près du mur où poser l’unité de PAC air/air.',
  chaudiere: 'Touchez une pièce pour y poser la chaudière.',
  pac: 'Touchez une pièce pour y poser la pompe à chaleur.',
};
const accueil =
  'Voici une maison d’exemple : cliquez sur une pièce pour la modifier, ou partez d’un modèle plus proche de chez vous (menu « ⋯ »).';
/** Aide de l'outil « Choisir » à l'étape du chauffage. */
const aideChauffage = 'Cliquez sur un appareil pour le régler, sur une porte pour l’ouvrir ou la fermer. À côté de chaque appareil : la puissance qu’il fournit en moyenne ; en rouge, il est à fond.';

const couleurs: Record<TypePiece, string> = {
  sejour: 'var(--color-ember-100)',
  cuisine: 'var(--color-ember-50)',
  chambre: 'var(--color-moss-100)',
  sdb: '#e3edf3',
  circulation: 'var(--color-ink-100)',
  bureau: '#efe7f5',
  'non-chauffe': 'var(--color-ink-200)',
};
const directions: Record<Plan['nord'], string> = { haut: 'nord', droite: 'ouest', bas: 'sud', gauche: 'est' };

const racine = document.querySelector<HTMLElement>('[data-plan]');
if (racine) {
  const $ = <T extends Element = HTMLElement>(sel: string) => racine.querySelector<T>(sel)!;
  const svg = $<SVGSVGElement>('[data-plan-svg]');
  const panneau = $('[data-panneau-selection]');
  const recap = $('[data-recap]');
  const aide = $('[data-aide]');
  const erreur = $('[data-erreur]');
  const enveloppe = $<HTMLFormElement>('[data-enveloppe]');
  const formDim = $<HTMLFormElement>('[data-dim-form]');
  const chauffageForm = $<HTMLFormElement>('[data-chauffage]');
  const resultatPoele = $('[data-resultat-poele]');
  const etatPoele = $('[data-etat-poele]');
  const barreNiveaux = $('[data-niveaux]');
  const nord = $<HTMLSelectElement>('[data-nord]');
  const volet = $('[data-volet]');
  const dialogues = {
    demarrage: $<HTMLDialogElement>('[data-dialogue="demarrage"]'),
    aide: $<HTMLDialogElement>('[data-dialogue="aide"]'),
    envoi: $<HTMLDialogElement>('[data-dialogue="envoi"]'),
    radiateurs: $<HTMLDialogElement>('[data-dialogue="radiateurs"]'),
  };
  /** Sous cette largeur, les outils passent en bas et le panneau devient un volet. */
  const petitEcran = window.matchMedia('(max-width: 1023px)');
  /** Branche une action sur tous ses boutons (certaines sont à la fois dans l'en-tête et dans le menu du téléphone). */
  const surAction = (nom: string, action: () => void) =>
    racine.querySelectorAll<HTMLElement>(`[data-action="${nom}"]`).forEach((b) => b.addEventListener('click', action));

  let plan: Plan = planExemple();
  let niveau = 0;
  let selection: Selection = null;
  let outil: Outil = 'selection';
  let etape: Etape = 'plan';
  let glisser: Glisser = null;
  type ApercuAppareil = { appareil: 'poele' | 'radiateur' | 'split' | 'chaudiere' | 'pac'; x: number; y: number; sens: 'h' | 'v'; ok: boolean };
  /** `remplace` : portes absorbées par une ouverture complète posée sur la même cloison. */
  let survol: (Omit<Ouverture, 'id'> & { ok: boolean; remplace?: string[] }) | { mitoyen: string[] } | ApercuAppareil | null = null;
  let vue: Vue = { x: 0, y: 0, w: COLS, h: ROWS };
  /** L'utilisateur a-t-il zoomé ou déplacé la vue ? Sinon, elle se recadre sur la maison quand le plan change de taille. */
  let vueManuelle = false;
  /** Le plan d'exemple n'a pas encore été modifié : un message d'accueil le présente. */
  let exempleIntact = true;
  const historique: string[] = [];
  /** États annulés, que « Rétablir » rejoue ; vidé à chaque nouvelle modification. */
  const futur: string[] = [];
  const pointeurs = new Map<number, { x: number; y: number }>();

  // --- État persistant -------------------------------------------------------------------------------------------
  const etatFormulaire = (form: HTMLFormElement) => Object.fromEntries(new FormData(form));
  const sauver = () => {
    try {
      localStorage.setItem(STOCKAGE, JSON.stringify({ plan, enveloppe: etatFormulaire(enveloppe), chauffage: etatFormulaire(chauffageForm), etape, dimensionnement: etatFormulaire(formDim) }));
    } catch {
      /* stockage indisponible : on continue sans sauvegarde */
    }
  };
  /** Remplit un formulaire avec des valeurs enregistrées, en ignorant celles qui ne correspondent à aucune option. */
  const remplir = (form: HTMLFormElement, valeurs: Record<string, unknown>) => {
    for (const [k, v] of Object.entries(valeurs)) {
      const champ = form.elements.namedItem(k);
      if (champ instanceof HTMLSelectElement) {
        if ([...champ.options].some((o) => o.value === String(v))) champ.value = String(v);
      } else if (champ instanceof HTMLInputElement && (champ.type === 'number' || champ.type === 'range')) {
        if (String(v) !== '' && Number.isFinite(Number(v))) champ.value = String(v);
      }
    }
  };
  const objet = (v: unknown) => (v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null);
  let lu: Record<string, unknown> | null = null;
  let premiereVisite = true;
  try {
    lu = objet(JSON.parse(localStorage.getItem(STOCKAGE) ?? 'null'));
  } catch {
    lu = null;
  }
  try {
    if (lu?.plan) {
      premiereVisite = false;
      const migre = migrerPlan(lu.plan);
      // Pièces enregistrées toutes illisibles : on garde le plan d'exemple plutôt qu'un plan vide
      const avaitDesPieces = Array.isArray(objet(lu.plan)?.pieces) && (objet(lu.plan)!.pieces as unknown[]).length > 0;
      if (migre.pieces.length || !avaitDesPieces) {
        plan = migre;
        exempleIntact = false;
      }
    }
  } catch {
    plan = planExemple();
  }
  if (ETAPES.includes(lu?.etape as Etape)) etape = lu!.etape as Etape;
  try {
    remplir(enveloppe, objet(lu?.enveloppe) ?? modeles[0].enveloppe);
    remplir(chauffageForm, objet(lu?.chauffage) ?? {});
    // Plan d'une version précédente (un seul poêle, réglé dans l'onglet Poêle) : ses réglages passent sur le poêle
    const ancien = objet(lu?.chauffage);
    if (ancien && objet(lu?.plan)?.poele) {
      plan = {
        ...plan,
        emetteurs: plan.emetteurs.map((e) =>
          e.genre === 'poele' && e.id === 'poele1'
            ? {
                ...e,
                nature: naturesPoele.find((n) => n.value === ancien.typePoele)?.value ?? e.nature,
                puissance: Number(ancien.puissance) > 0 ? Math.min(30, Number(ancien.puissance)) : e.puissance,
                consigne: Number(ancien.consigne) > 0 ? Math.min(28, Math.max(10, Number(ancien.consigne))) : e.consigne,
                partGaines: Number(ancien.partGaines) >= 0 ? Math.min(80, Number(ancien.partGaines)) : e.partGaines,
              }
            : e,
        ),
      };
    }
  } catch {
    /* réglages illisibles : on garde les valeurs de la page */
  }

  /** Historique : le plan, et les réglages de la maison quand une action les change (modèle, champ de l'étape Maison). */
  const empiler = (entree: string) => {
    historique.push(entree);
    if (historique.length > 80) historique.shift();
    futur.length = 0;
  };
  const memoriser = (avecEnveloppe = false) => empiler(JSON.stringify({ plan, enveloppe: avecEnveloppe ? etatFormulaire(enveloppe) : undefined }));
  /** Applique une modification du plan, avec une entrée d'historique seulement si quelque chose change. */
  const modifier = (suivant: Plan, options: { memoriser?: boolean } = {}) => {
    const propre = nettoyerOuvertures(suivant);
    if (JSON.stringify(propre) !== JSON.stringify(plan)) {
      if (options.memoriser !== false) memoriser();
      plan = propre;
      exempleIntact = false;
    }
    rendre();
  };
  /** Revient à un état de l'historique, en gardant l'état actuel dans l'autre pile (annuler ↔ rétablir). */
  const revenir = (depuis: string[], vers: string[], vide: string) => {
    const brut = depuis.pop();
    glisser = null;
    if (!brut) {
      signaler(vide);
      return rendre();
    }
    vers.push(JSON.stringify({ plan, enveloppe: etatFormulaire(enveloppe) }));
    const etat = JSON.parse(brut) as { plan: Plan; enveloppe?: Record<string, unknown> };
    plan = etat.plan;
    if (etat.enveloppe) {
      remplir(enveloppe, etat.enveloppe);
      syncIsolants();
    }
    nord.value = plan.nord;
    niveau = Math.min(niveau, plan.niveaux - 1);
    selection = null;
    survol = null;
    rendre();
  };
  const annuler = () => revenir(historique, futur, 'Rien à annuler.');
  const retablir = () => revenir(futur, historique, 'Rien à rétablir.');

  /** Message d'erreur affiché par-dessus le plan (sans décaler la mise en page), effacé après quelques secondes. */
  let minuterie: ReturnType<typeof setTimeout> | undefined;
  const signaler = (message: string) => {
    clearTimeout(minuterie);
    erreur.textContent = message;
    erreur.hidden = !message;
    if (message) minuterie = setTimeout(() => (erreur.hidden = true), 7000);
  };

  // --- Utilitaires ------------------------------------------------------------------------------------------------
  const el = <K extends keyof SVGElementTagNameMap>(tag: K, attrs: Record<string, string | number>, texte?: string) => {
    const e = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, String(v));
    if (texte !== undefined) e.textContent = texte;
    return e;
  };
  const point = (ev: { clientX: number; clientY: number }) => {
    const p = svg.createSVGPoint();
    p.x = ev.clientX;
    p.y = ev.clientY;
    const r = p.matrixTransform(svg.getScreenCTM()!.inverse());
    return { x: r.x, y: r.y };
  };
  const borne = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
  const nf1 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 });
  const fmt = (x: number) => nf1.format(x);
  const m = (cases: number) => `${fmt(cases * PAS)} m`;
  const watts = (x: number) => `${new Intl.NumberFormat('fr-FR').format(Math.round(x / 10) * 10)} W`;
  const kw = (x: number) => `${nf1.format(x / 1000)} kW`;
  const tBaseTexte = `${fmt(parametres.tBase).replace('-', '−')} °C`;
  const degres = (t: number) => `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(t).replace('-', '−')} °C`;
  const pieceDe = (id: string) => plan.pieces.find((p) => p.id === id);
  const escalierDe = (id: string) => plan.escaliers.find((e) => e.id === id);
  const nomDuNiveau = (n: number) => nomNiveau(n, plan.niveaux);
  /** Emplacement libre sur un niveau (dans la grille, sans chevaucher d'autre pièce). */
  const libre = (r: Rect, ignorer?: string, n = niveau) =>
    r.x >= 0 && r.y >= 0 && r.x + r.w <= COLS && r.y + r.h <= ROWS && piecesDuNiveau(plan, n).every((p) => p.id === ignorer || !chevauche(p, r));
  const nouvelId = (prefixe: string) => `${prefixe}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
  const nomAvecNiveau = (p: Piece) => (plan.niveaux > 1 ? `${p.nom} (${nomDuNiveau(p.niveau).toLowerCase()})` : p.nom);
  /** Texte de l'option choisie d'une liste, en minuscules (pour le résumé de la demande). */
  const libelle = (form: HTMLFormElement, name: string) => {
    const t = (form.querySelector<HTMLSelectElement>(`[name="${name}"]`)?.selectedOptions[0]?.textContent ?? '').trim();
    // Minuscule initiale, sauf pour un sigle (« VMC »)
    return /^\p{Lu}{2}/u.test(t) ? t : t.charAt(0).toLowerCase() + t.slice(1);
  };
  const messageOuverture = (type: TypeOuverture) =>
    type === 'passage'
      ? 'Une ouverture complète se fait sur une cloison entre deux pièces chauffées, là où il n’y a ni porte ni autre ouverture.'
      : type === 'porte'
      ? 'Une porte se pose sur un mur, sans chevaucher une fenêtre ou une autre porte, ni deux pièces à la fois.'
      : 'Une fenêtre se pose sur un mur extérieur (trait épais), sans chevaucher une autre ouverture ni deux pièces à la fois.';
  const messageEscalier = () => (plan.niveaux === 1 ? 'Ajoutez d’abord un étage : l’escalier relie deux niveaux.' : 'L’escalier se dessine au niveau d’où il monte.');

  /** Mur le plus proche du pointeur (près d'un angle, les deux lignes de grille sont à égale distance). */
  const murProche = (x: number, y: number) => {
    const murs = classerMurs(plan, niveau);
    const tolerance = Math.max(0.35, vue.w / 120);
    const candidats = [
      { sens: 'h' as const, ligne: Math.round(y), pos: x, d: Math.abs(y - Math.round(y)), k: `h:${Math.floor(x)}:${Math.round(y)}` },
      { sens: 'v' as const, ligne: Math.round(x), pos: y, d: Math.abs(x - Math.round(x)), k: `v:${Math.round(x)}:${Math.floor(y)}` },
    ]
      .filter((c) => c.d <= tolerance && murs.has(c.k))
      .sort((a, b) => a.d - b.d);
    return candidats[0] ?? null;
  };

  // --- Vue : zoom et déplacement ----------------------------------------------------------------------------------
  const ratio = () => {
    const r = svg.getBoundingClientRect();
    return r.width > 0 && r.height > 0 ? r.height / r.width : 4 / 5;
  };
  /** Position de la vue sur un axe : dans la grille, ou centrée si la vue est plus grande que la grille. */
  const caler = (v: number, taille: number, total: number) => (taille > total + 2 * MARGE ? (total - taille) / 2 : borne(v, -MARGE, total - taille + MARGE));
  const appliquerVue = () => {
    if (![vue.x, vue.y, vue.w].every(Number.isFinite) || vue.w <= 0) vue = { x: 0, y: 0, w: COLS, h: ROWS };
    const h = vue.w * ratio();
    vue = { x: caler(vue.x, vue.w, COLS), y: caler(vue.y, h, ROWS), w: vue.w, h };
    svg.setAttribute('viewBox', `${vue.x} ${vue.y} ${vue.w} ${vue.h}`);
  };
  /**
   * Cadre la vue sur toutes les pièces (tous niveaux), avec une marge, dans la partie du plan que ne couvrent pas
   * les éléments posés dessus (niveaux en haut, total et zoom en bas).
   */
  const ajusterVue = () => {
    const e = emprise(plan);
    const r = ratio();
    const cadre = svg.getBoundingClientRect();
    const hauteurPx = cadre.height;
    // Encarts du bas (légende, zoom) : sur un écran étroit, ils occupent toute la largeur, on cadre la maison au-dessus.
    // Ils sont masqués quand le volet du téléphone est ouvert : la maison prend alors toute la hauteur
    const encarts = racine!.querySelector<HTMLElement>('[data-masquable]')?.getBoundingClientRect();
    const visibles = !!encarts && encarts.height > 0;
    const sousEncarts = !visibles ? 12 : cadre.width < 640 ? cadre.bottom - encarts!.top + 8 : 64;
    // En haut : barres posées sur le plan (niveaux, ouvertures, température dehors), sur une ou deux lignes, et l'aide sur téléphone
    const barres = [...racine!.querySelectorAll<HTMLElement>(petitEcran.matches ? '[data-haut], [data-aide]' : '[data-haut]')].map((b) => b.getBoundingClientRect()).filter((b) => b.height > 0);
    const sousBarres = barres.length ? Math.max(...barres.map((b) => b.bottom)) - cadre.top + 8 : 12;
    const [hautPx, basPx] = hauteurPx > 300 ? [Math.min(sousBarres, hauteurPx * 0.4), Math.min(sousEncarts, hauteurPx * 0.6)] : [0, 0];
    const utile = hauteurPx > 0 ? (hauteurPx - hautPx - basPx) / hauteurPx : 1;
    if (!e) vue = { x: 0, y: 0, w: COLS, h: COLS * r };
    else {
      const w = borne(Math.max(e.w + 4, (e.h + 3) / (r * utile)), 16, COLS + 8);
      const parPx = hauteurPx > 0 ? (w * r) / hauteurPx : 0;
      const centre = (hautPx + (hauteurPx - hautPx - basPx) / 2) * parPx || (w * r) / 2;
      vue = { x: e.x + e.w / 2 - w / 2, y: e.y + e.h / 2 - centre, w, h: w * r };
    }
    vueManuelle = false;
    appliquerVue();
  };
  const zoomer = (facteur: number, centre = { x: vue.x + vue.w / 2, y: vue.y + vue.h / 2 }) => {
    const w = borne(vue.w * facteur, 10, COLS + 8);
    const k = w / vue.w;
    vue = { x: centre.x - (centre.x - vue.x) * k, y: centre.y - (centre.y - vue.y) * k, w, h: vue.h * k };
    vueManuelle = true;
    appliquerVue();
  };

  // --- Calcul -----------------------------------------------------------------------------------------------------
  const lireEnveloppe = (): Enveloppe => {
    const d = new FormData(enveloppe);
    const t = (k: string) => String(d.get(k) ?? '');
    const n = (k: string, defaut: number) => (Number(d.get(k)) > 0 ? Number(d.get(k)) : defaut);
    return {
      hauteur: borne(n('hauteur', 2.5), 2, 6),
      annee: t('annee'),
      murMatiere: t('murMatiere'),
      murEpaisseur: n('murEpaisseur', 20),
      murIsolant: t('murIsolant'),
      murIsolantEpaisseur: n('murIsolantEpaisseur', 1),
      plafond: t('plafond'),
      plafondIsolant: t('plafondIsolant'),
      plafondIsolantEpaisseur: n('plafondIsolantEpaisseur', 1),
      plancher: t('plancher'),
      plancherIsolant: t('plancherIsolant'),
      plancherIsolantEpaisseur: n('plancherIsolantEpaisseur', 1),
      vitrage: t('vitrage'),
      ventilation: t('ventilation'),
      plancherIntermediaire: t('plancherIntermediaire') || 'bois',
    };
  };
  const calculer = () => deperditions(plan, lireEnveloppe(), parametres);
  type Calcul = ReturnType<typeof calculer>;

  /** Conditions du calcul des températures : température dehors choisie (ou grand froid, sans soleil). */
  const conditions = (calcul: Calcul, grandFroid = false): Conditions => {
    const d = new FormData(chauffageForm);
    const t = Number(d.get('tExterieure'));
    return {
      tExterieure: grandFroid ? parametres.tBase : Number.isFinite(t) ? borne(t, -20, 20) : 3,
      tBase: parametres.tBase,
      apportsInternesParM2: apportsInternesParM2(calcul.surfaceChauffee),
      apportsSolaires: grandFroid || d.get('soleil') !== 'on' ? undefined : apportsSolaires(plan, lireEnveloppe().vitrage, soleilJanvier),
    };
  };
  /** Inertie de chaque niveau : réglée à l'étape Maison, ou déduite des parois selon la méthode du DPE. */
  const classeChoisie = () => String(new FormData(enveloppe).get('inertie') ?? 'auto');
  const classeDuNiveau = (n: number): ClasseInertie => {
    const choix = classeChoisie();
    return classesInertie.some((c) => c.value === choix) ? (choix as ClasseInertie) : classeInertieNiveau(lireEnveloppe(), n, plan.niveaux);
  };
  const inertie = (calcul: Calcul): Inertie => new Map(calcul.pieces.map((r) => [r.piece.id, parametresInertie[classeDuNiveau(r.piece.niveau)]]));

  type Simulation = ReturnType<typeof temperatures>;
  /** Simulations mémorisées (jour choisi, grand froid) : recalculées seulement si le plan ou un réglage change, jamais pendant un geste. */
  const memo = new Map<string, { cle: string; sim: Simulation }>();
  const simuler = (calcul: Calcul, grandFroid = false): Simulation => {
    const env = lireEnveloppe();
    const cond = conditions(calcul, grandFroid);
    const cle = JSON.stringify([plan, env, cond]);
    const nom = grandFroid ? 'grand-froid' : 'jour';
    const m = memo.get(nom);
    if (m?.cle === cle) return m.sim;
    const sim = temperatures(plan, calcul.pieces, env.hauteur, env.plancherIntermediaire, cond, physiqueEchanges, regulation, inertie(calcul));
    memo.set(nom, { cle, sim });
    return sim;
  };
  const simulerGrandFroid = (calcul: Calcul) => simuler(calcul, true);
  /** Journée type de janvier, heure par heure (soleil, inertie, température plus basse la nuit), chauffage continu. */
  type Jour = ReturnType<typeof journee>;
  let memoJour: { cle: string; jour: Jour } | null = null;
  const simulerJournee = (calcul: Calcul): Jour => {
    const env = lireEnveloppe();
    const cond = conditions(calcul);
    const cle = JSON.stringify([plan, env, cond.tExterieure, [...(cond.apportsSolaires ?? [])], classeChoisie()]);
    if (memoJour?.cle === cle) return memoJour.jour;
    const jour = journee(plan, calcul.pieces, env.hauteur, env.plancherIntermediaire, cond, { ...journeeJanvier, programme: 'continu' }, physiqueEchanges, regulation, inertie(calcul));
    memoJour = { cle, jour };
    return jour;
  };
  const moyenne = (a: number[]) => a.reduce((x, y) => x + y, 0) / Math.max(1, a.length);
  type Etiquette = { texte: string; aFond: boolean };
  /** Radiateur à fond : il donne tout ce qu'il peut (selon la température de l'eau) et sa pièce reste sous son réglage. */
  const radiateurAFond = (e: Radiateur, sim: Simulation) => {
    const r = sim.emetteurs.get(e.id);
    return r?.capacite !== undefined && r.puissance >= r.capacite - 1 && (sim.temperatures.get(e.piece) ?? Infinity) < e.consigne - 0.5;
  };
  /**
   * Puissance moyenne fournie sur la journée par chaque appareil (kW), et par la chaudière ; « à fond » quand l'appareil ne
   * peut pas donner plus (pour un radiateur à eau : avec l'eau de ce jour-là, moins chaude que 75 °C). Sa puissance maximale
   * est dans son détail.
   */
  const etiquettesAppareils = (jour: Jour, sim: Simulation | null) => {
    const k = (w: number) => nf1.format(w / 1000);
    const textes = new Map<string, Etiquette>();
    let eauHydro = 0;
    for (const e of plan.emetteurs) {
      const moy = moyenne(jour.puissances.get(e.id) ?? []);
      if (e.genre === 'poele' && e.nature === 'hydro') eauHydro += (moy * e.partEau) / 100;
      const aFond = !!sim && (e.genre === 'radiateur' ? radiateurAFond(e, sim) : sim.emetteurs.get(e.id)?.regime === 'maximum');
      textes.set(e.id, { texte: `${k(moy)} kW`, aFond });
    }
    if (plan.central.generateur !== 'aucun') {
      const aFond = !!sim?.generateurLimite;
      textes.set('central', { texte: `${k(Math.max(0, moyenne(jour.puissanceCentral) - eauHydro))} kW`, aFond });
    }
    return textes;
  };
  /** Températures affichées : moyenne de la journée. */
  const tempsAffichees = (jour: Jour) => new Map([...jour.temperatures].map(([id, a]) => [id, moyenne(a)]));

  /** Couleur d'une pièce selon sa température : bleu froid, crème vers 19 °C, orange au-delà de 21 °C. */
  const echelle: [number, [number, number, number]][] = [
    [10, [143, 184, 224]],
    [15, [223, 233, 242]],
    [18.5, [247, 239, 227]],
    [21, [242, 196, 164]],
    [23, [229, 122, 60]],
  ];
  const couleurTemperature = (t: number) => {
    if (t <= echelle[0][0]) return `rgb(${echelle[0][1].join(',')})`;
    for (let i = 1; i < echelle.length; i++) {
      const [t1, c1] = echelle[i];
      const [t0, c0] = echelle[i - 1];
      if (t <= t1) {
        const k = (t - t0) / (t1 - t0);
        return `rgb(${c0.map((c, j) => Math.round(c + (c1[j] - c) * k)).join(',')})`;
      }
    }
    return `rgb(${echelle[echelle.length - 1][1].join(',')})`;
  };

  // --- Dessin d'un niveau (aussi utilisé pour l'export en image) ---------------------------------------------------
  /** `valeurs` : puissance ou température sous le nom de chaque pièce (pas à l'étape du plan, où l'on dessine). */
  type OptionsDessin = { interactif: boolean; calcul: Calcul; temps: Map<string, number> | null; valeurs?: boolean; etiquettes?: Map<string, Etiquette> | null };
  function dessinerNiveau(cible: SVGSVGElement, n: number, o: OptionsDessin) {
    const murs = classerMurs(plan, n);
    // Ce qui se choisit sur le plan dépend de l'étape : le dessin au plan, les appareils au chauffage
    const iPieces = o.interactif && etape !== 'resultat';
    const iDessin = o.interactif && etape === 'plan';
    const iAppareils = o.interactif && etape === 'chauffage';

    // Pièces (fonds), puis escaliers, puis textes des pièces par-dessus
    const textes: SVGGElement[] = [];
    for (const p of piecesDuNiveau(plan, n)) {
      const g = el('g', iPieces ? { 'data-piece': p.id, class: 'cursor-pointer' } : {});
      const gt = el('g', { 'pointer-events': 'none' });
      textes.push(gt);
      const sel = o.interactif && selection?.genre === 'piece' && selection.id === p.id;
      const tPiece = o.temps?.get(p.id);
      g.append(el('rect', { x: p.x, y: p.y, width: p.w, height: p.h, fill: tPiece !== undefined ? couleurTemperature(tPiece) : couleurs[p.type], stroke: sel ? 'var(--color-ember-600)' : 'none', 'stroke-width': 0.15 }));
      if (!estChauffee(p.type)) g.append(el('rect', { x: p.x, y: p.y, width: p.w, height: p.h, fill: 'url(#hachures)' }));
      const taille = Math.min(0.9, Math.max(0.5, Math.min(p.w, p.h) / 4));
      // Le nom tient dans la largeur de la pièce (environ 0,58 em par caractère)
      const tailleNom = Math.min(taille, (p.w * 0.9) / Math.max(1, p.nom.length * 0.58));
      gt.append(el('text', { x: p.x + p.w / 2, y: p.y + p.h / 2 - taille * 0.2, 'text-anchor': 'middle', 'font-size': tailleNom, 'font-weight': 700, fill: 'var(--color-ink-900)' }, p.nom));
      gt.append(el('text', { x: p.x + p.w / 2, y: p.y + p.h / 2 + taille * 0.95, 'text-anchor': 'middle', 'font-size': taille * 0.8, fill: tPiece !== undefined ? 'var(--color-ink-900)' : 'var(--color-ink-600)' }, `${fmt(surface(p))} m²`));
      const res = o.calcul.pieces.find((r) => r.piece.id === p.id);
      const valeur = o.valeurs === false ? '' : tPiece !== undefined ? degres(tPiece) : res ? watts(res.puissance) : '';
      if (valeur && (Math.min(p.w, p.h) >= 4 || tPiece !== undefined))
        gt.append(el('text', { x: p.x + p.w / 2, y: p.y + p.h / 2 + taille * 2, 'text-anchor': 'middle', 'font-size': taille * (tPiece !== undefined ? 1.1 : 0.85), 'font-weight': 700, fill: tPiece !== undefined ? 'var(--color-ink-900)' : 'var(--color-ember-800)' }, valeur));
      cible.append(g);
    }

    // Escaliers : trémie dessinée au niveau du bas, rappelée en pointillé au niveau du haut
    for (const e of plan.escaliers) {
      if (e.niveau !== n && e.niveau + 1 !== n) continue;
      const bas = e.niveau === n;
      const sel = iDessin && selection?.genre === 'escalier' && selection.id === e.id;
      const g = el('g', iDessin && bas ? { 'data-escalier': e.id, class: 'cursor-pointer' } : { 'pointer-events': 'none' });
      g.append(el('rect', { x: e.x, y: e.y, width: e.w, height: e.h, fill: bas ? 'var(--color-white)' : 'none', 'fill-opacity': 0.55, stroke: sel ? 'var(--color-ember-600)' : 'var(--color-ink-700)', 'stroke-width': sel ? 0.15 : 0.08, ...(bas ? {} : { 'stroke-dasharray': '0.3 0.2' }) }));
      const long = e.h >= e.w;
      const marches = Math.max(2, Math.round((long ? e.h : e.w) / 0.5));
      if (bas)
        for (let i = 1; i < marches; i++) {
          const t = i / marches;
          g.append(long ? el('line', { x1: e.x, y1: e.y + e.h * t, x2: e.x + e.w, y2: e.y + e.h * t, stroke: 'var(--color-ink-400)', 'stroke-width': 0.04 }) : el('line', { x1: e.x + e.w * t, y1: e.y, x2: e.x + e.w * t, y2: e.y + e.h, stroke: 'var(--color-ink-400)', 'stroke-width': 0.04 }));
        }
      g.append(el('text', { x: e.x + e.w / 2, y: e.y + 0.9, 'text-anchor': 'middle', 'font-size': Math.min(0.8, Math.min(e.w, e.h) * 0.45), 'font-weight': 700, fill: 'var(--color-ink-800)' }, bas ? '↑' : '↓'));
      cible.append(g);
    }
    cible.append(...textes);

    // Murs, par segment d'une case
    const gMurs = el('g', { 'pointer-events': 'none' });
    const styles = {
      exterieur: { stroke: 'var(--color-ink-900)', w: 0.4, dash: '' },
      mitoyen: { stroke: 'var(--color-ink-500)', w: 0.4, dash: '0.3 0.15' },
      'non-chauffe': { stroke: 'var(--color-ink-700)', w: 0.22, dash: '' },
      interieur: { stroke: 'var(--color-ink-600)', w: 0.12, dash: '' },
    } as const;
    for (const [k, mur] of murs) {
      const { sens, x, y } = lireCle(k);
      const s = styles[mur.classe];
      gMurs.append(
        el('line', {
          x1: x, y1: y, x2: sens === 'h' ? x + 1 : x, y2: sens === 'v' ? y + 1 : y,
          stroke: s.stroke, 'stroke-width': s.w, 'stroke-linecap': 'square', ...(s.dash ? { 'stroke-dasharray': s.dash } : {}),
        }),
      );
    }
    cible.append(gMurs);

    // Ouvertures
    for (const ouv of ouverturesDuNiveau(plan, n)) {
      const bascule = iAppareils && ouv.type === 'porte' && segmentsOuverture(ouv).some((k) => murs.get(k)?.classe === 'interieur');
      cible.append(dessinOuverture(ouv, iDessin && selection?.genre === 'ouverture' && selection.id === ouv.id, undefined, bascule ? 'bascule' : iDessin));
    }

    // Chaudière, poêles et radiateurs
    const c = plan.central;
    if (c.piece && c.generateur !== 'aucun' && pieceDe(c.piece)?.niveau === n) {
      const g = el('g', iAppareils ? { 'data-generateur': '', class: 'cursor-pointer' } : { 'pointer-events': 'none' });
      dessinChaudiere(g, c.x!, c.y!, c.generateur, iAppareils && selection?.genre === 'generateur', o.etiquettes?.get('central')?.aFond ? ROUGE_A_FOND : undefined);
      cible.append(g);
    }
    for (const e of plan.emetteurs) {
      if (pieceDe(e.piece)?.niveau !== n) continue;
      const sel = iAppareils && selection?.genre === 'emetteur' && selection.id === e.id;
      const g = el('g', iAppareils ? { 'data-emetteur': e.id, class: 'cursor-pointer' } : { 'pointer-events': 'none' });
      // Appareil à fond : teinté de rouge (le poêle, sombre, est cerclé de rouge)
      const aFond = !!o.etiquettes?.get(e.id)?.aFond;
      if (e.genre === 'poele') {
        dessinPoele(g, e.x, e.y, sel, undefined, e.nature === 'hydro');
        if (aFond && !sel) g.append(el('rect', { x: e.x - 0.85, y: e.y - 0.85, width: 1.7, height: 1.7, rx: 0.42, fill: 'none', stroke: 'var(--color-danger-500)', 'stroke-width': 0.14, 'pointer-events': 'none' }));
      } else dessinRadiateur(g, e.x, e.y, e.sens, e.nature, sel, aFond ? ROUGE_A_FOND : undefined);
      cible.append(g);
    }

    // Puissance de chaque appareil, du côté de la pièce
    if (o.etiquettes) {
      type Place = { x: number; y: number; ancre: 'start' | 'middle' | 'end' };
      /**
       * Étiquette sur une pastille claire, à la première place proposée qui reste dans la pièce (sinon la première) :
       * à côté de l'appareil plutôt que vers le centre, où sont le nom et la température de la pièce.
       */
      const etiquette = (id: string, piece: Piece, places: Place[]) => {
        const etq = o.etiquettes!.get(id);
        if (!etq) return;
        const texte = etq.texte;
        const largeur = texte.length * 0.25 + 0.1;
        const boite = (pl: Place) => ({ gauche: pl.ancre === 'start' ? pl.x : pl.ancre === 'end' ? pl.x - largeur : pl.x - largeur / 2, haut: pl.y - 0.42 });
        const dedans = (pl: Place) => {
          const b = boite(pl);
          return b.gauche >= piece.x + 0.15 && b.gauche + largeur <= piece.x + piece.w - 0.15 && b.haut >= piece.y + 0.15 && b.haut + 0.55 <= piece.y + piece.h - 0.15;
        };
        const choisie = places.find(dedans) ?? places[0];
        cible.append(
          el('text', { x: choisie.x, y: choisie.y, 'text-anchor': choisie.ancre, 'font-size': 0.45, 'font-weight': 700, fill: etq.aFond ? 'var(--color-danger-700)' : 'var(--color-ink-700)', stroke: 'var(--color-white)', 'stroke-width': 0.16, 'stroke-linejoin': 'round', 'paint-order': 'stroke', 'pointer-events': 'none' }, texte),
        );
      };
      const pieceC = c.piece ? pieceDe(c.piece) : undefined;
      if (pieceC && c.generateur !== 'aucun' && pieceC.niveau === n) {
        const demi = c.generateur === 'pac' ? 1 : 0.65;
        const bas = c.generateur === 'pac' ? 0.7 : 0.8;
        etiquette('central', pieceC, [
          { x: c.x! + demi + 0.25, y: c.y! + 0.17, ancre: 'start' },
          { x: c.x! - demi - 0.25, y: c.y! + 0.17, ancre: 'end' },
          { x: c.x!, y: c.y! + bas + 0.6, ancre: 'middle' },
          { x: c.x!, y: c.y! - bas - 0.3, ancre: 'middle' },
        ]);
      }
      for (const e of plan.emetteurs) {
        const p = pieceDe(e.piece);
        if (!p || p.niveau !== n) continue;
        if (e.genre === 'poele')
          etiquette(e.id, p, [
            { x: e.x + 0.95, y: e.y + 0.17, ancre: 'start' },
            { x: e.x - 0.95, y: e.y + 0.17, ancre: 'end' },
            { x: e.x, y: e.y + 1.25, ancre: 'middle' },
            { x: e.x, y: e.y - 0.95, ancre: 'middle' },
          ]);
        // Radiateur : le long de son mur, d'un côté ou de l'autre, sinon juste à l'intérieur de la pièce
        else if (e.sens === 'h') {
          const interieur = e.y > p.y + p.h / 2 ? e.y - 0.55 : e.y + 0.95;
          etiquette(e.id, p, [
            { x: e.x + 0.95, y: e.y + 0.16, ancre: 'start' },
            { x: e.x - 0.95, y: e.y + 0.16, ancre: 'end' },
            { x: e.x, y: interieur, ancre: 'middle' },
            { x: Math.max(p.x + 0.2, e.x - 0.8), y: interieur, ancre: 'start' },
            { x: Math.min(p.x + p.w - 0.2, e.x + 0.8), y: interieur, ancre: 'end' },
          ]);
        } else {
          const interieurX = e.x > p.x + p.w / 2 ? { x: e.x - 0.45, ancre: 'end' as const } : { x: e.x + 0.45, ancre: 'start' as const };
          etiquette(e.id, p, [
            { ...interieurX, y: e.y + 0.17 },
            { x: e.x > p.x + p.w / 2 ? e.x + 0.1 : e.x - 0.1, y: e.y + 1.4, ancre: interieurX.ancre },
            { x: e.x > p.x + p.w / 2 ? e.x + 0.1 : e.x - 0.1, y: e.y - 1.05, ancre: interieurX.ancre },
          ]);
        }
      }
    }

    // Motif des pièces non chauffées
    const defs = el('defs', {});
    const motif = el('pattern', { id: 'hachures', width: 1, height: 1, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' });
    motif.append(el('line', { x1: 0, y1: 0, x2: 0, y2: 1, stroke: 'var(--color-ink-400)', 'stroke-width': 0.08 }));
    defs.append(motif);
    cible.prepend(defs);
  }

  /** Goutte d'eau (appareils qui chauffent l'eau des radiateurs). */
  const goutte = (g: SVGGElement, x: number, y: number, r: number) =>
    g.append(el('path', { d: `M${x} ${y - r} C${x + r * 0.9} ${y} ${x + r * 0.75} ${y + r} ${x} ${y + r} C${x - r * 0.75} ${y + r} ${x - r * 0.9} ${y} ${x} ${y - r} Z`, fill: '#4a8cc8', stroke: 'var(--color-white)', 'stroke-width': 0.05, 'pointer-events': 'none' }));
  /** Poêle : corps sombre et flamme ; goutte bleue pour un poêle hydro. */
  function dessinPoele(g: SVGGElement, x: number, y: number, sel: boolean, couleur?: string, hydro = false) {
    g.append(el('rect', { x: x - 0.7, y: y - 0.7, width: 1.4, height: 1.4, rx: 0.3, fill: couleur ?? 'var(--color-ink-900)', stroke: sel ? 'var(--color-ember-500)' : 'none', 'stroke-width': 0.2 }));
    g.append(el('path', { d: `M${x} ${y - 0.45} C${x + 0.45} ${y - 0.05} ${x + 0.35} ${y + 0.45} ${x} ${y + 0.45} C${x - 0.35} ${y + 0.45} ${x - 0.45} ${y} ${x} ${y - 0.45} Z`, fill: 'var(--color-ember-400)', 'pointer-events': 'none' }));
    if (hydro) goutte(g, x + 0.62, y + 0.55, 0.32);
  }
  /**
   * Radiateur le long d'un mur : corps et ailettes (à eau), corps plein et éclair (électrique). Unité de PAC air/air :
   * boîtier mural plus long, bleuté, avec sa grille de soufflage côté pièce.
   */
  function dessinRadiateur(g: SVGGElement, x: number, y: number, sens: 'h' | 'v', nature: Radiateur['nature'], sel: boolean, couleur?: string) {
    if (nature === 'split') {
      const [w, h] = sens === 'h' ? [2, 0.55] : [0.55, 2];
      g.append(el('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 0.2, fill: couleur ?? '#e6f0f8', stroke: sel ? 'var(--color-ember-600)' : '#3f6f99', 'stroke-width': sel ? 0.14 : 0.07 }));
      const trait = { stroke: '#3f6f99', 'stroke-width': 0.05, 'stroke-linecap': 'round', 'pointer-events': 'none' };
      for (const d of [-0.35, 0, 0.35])
        g.append(sens === 'h' ? el('line', { x1: x - 0.75, y1: y + d * 0.4, x2: x + 0.75, y2: y + d * 0.4, ...trait }) : el('line', { x1: x + d * 0.4, y1: y - 0.75, x2: x + d * 0.4, y2: y + 0.75, ...trait }));
      return;
    }
    const [w, h] = sens === 'h' ? [1.6, 0.5] : [0.5, 1.6];
    const electrique = nature === 'electrique';
    g.append(el('rect', { x: x - w / 2, y: y - h / 2, width: w, height: h, rx: 0.12, fill: couleur ?? (electrique ? 'var(--color-ink-200)' : 'var(--color-white)'), stroke: sel ? 'var(--color-ember-600)' : 'var(--color-ink-700)', 'stroke-width': sel ? 0.14 : 0.07 }));
    if (!electrique)
      for (const d of [-0.4, 0, 0.4])
        g.append(sens === 'h' ? el('line', { x1: x + d, y1: y - 0.17, x2: x + d, y2: y + 0.17, stroke: 'var(--color-ink-500)', 'stroke-width': 0.05, 'pointer-events': 'none' }) : el('line', { x1: x - 0.17, y1: y + d, x2: x + 0.17, y2: y + d, stroke: 'var(--color-ink-500)', 'stroke-width': 0.05, 'pointer-events': 'none' }));
    else g.append(el('path', { d: `M${x + 0.07} ${y - 0.18} L${x - 0.1} ${y + 0.02} L${x + 0.05} ${y + 0.02} L${x - 0.07} ${y + 0.2}`, fill: 'none', stroke: 'var(--color-ember-700)', 'stroke-width': 0.06, 'pointer-events': 'none' }));
  }
  /**
   * Chaudière : boîtier mural clair, goutte d'eau et bandeau de commande. Pompe à chaleur : unité plus large, ventilateur
   * et grille. Bien distincts du poêle, sombre avec sa flamme.
   */
  function dessinChaudiere(g: SVGGElement, x: number, y: number, generateur: string, sel: boolean, couleur?: string) {
    const trait = { stroke: sel ? 'var(--color-ember-600)' : 'var(--color-ink-800)', 'stroke-width': sel ? 0.16 : 0.09 };
    const fin2 = { stroke: 'var(--color-ink-700)', 'stroke-width': 0.07, 'pointer-events': 'none', fill: 'none', 'stroke-linecap': 'round' };
    if (generateur === 'pac') {
      g.append(el('rect', { x: x - 1, y: y - 0.7, width: 2, height: 1.4, rx: 0.15, fill: couleur ?? 'var(--color-white)', ...trait }));
      g.append(el('circle', { cx: x - 0.4, cy: y, r: 0.48, ...fin2 }));
      for (const a of [0, 120, 240]) {
        const r = (a * Math.PI) / 180;
        g.append(el('line', { x1: x - 0.4, y1: y, x2: x - 0.4 + 0.4 * Math.sin(r), y2: y - 0.4 * Math.cos(r), ...fin2 }));
      }
      for (const dy of [-0.35, 0, 0.35]) g.append(el('line', { x1: x + 0.35, y1: y + dy, x2: x + 0.75, y2: y + dy, ...fin2 }));
    } else {
      g.append(el('rect', { x: x - 0.65, y: y - 0.8, width: 1.3, height: 1.6, rx: 0.12, fill: couleur ?? 'var(--color-white)', ...trait }));
      g.append(el('line', { x1: x - 0.65, y1: y + 0.35, x2: x + 0.65, y2: y + 0.35, ...fin2 }));
      g.append(el('rect', { x: x - 0.4, y: y + 0.47, width: 0.4, height: 0.16, rx: 0.04, fill: 'var(--color-ink-700)', 'pointer-events': 'none' }));
      goutte(g, x, y - 0.25, 0.38);
    }
  }

  /** Ouverture complète : la cloison s'efface, un pointillé marque seulement la limite entre les deux pièces. */
  function dessinPassage(o: Ouverture, sel: boolean, couleur: string | undefined, interactif: boolean) {
    const g = el('g', interactif ? { 'data-ouverture': o.id, class: 'cursor-pointer' } : { 'pointer-events': 'none' });
    const x2 = o.sens === 'h' ? o.x + o.longueur : o.x;
    const y2 = o.sens === 'v' ? o.y + o.longueur : o.y;
    if (interactif) g.append(el('line', { x1: o.x, y1: o.y, x2, y2, stroke: 'transparent', 'stroke-width': 1 }));
    // On masque la cloison (sans toucher aux murs qui la croisent aux extrémités)
    const r = 0.08;
    g.append(el('line', { x1: o.x + (o.sens === 'h' ? r : 0), y1: o.y + (o.sens === 'v' ? r : 0), x2: x2 - (o.sens === 'h' ? r : 0), y2: y2 - (o.sens === 'v' ? r : 0), stroke: couleur ?? 'var(--color-ink-50)', 'stroke-opacity': couleur ? 0.5 : 1, 'stroke-width': 0.2 }));
    g.append(el('line', { x1: o.x, y1: o.y, x2, y2, stroke: sel ? 'var(--color-ember-600)' : couleur ?? 'var(--color-ink-400)', 'stroke-width': sel ? 0.12 : 0.06, 'stroke-dasharray': '0.25 0.18' }));
    return g;
  }

  /** `interactif` : choisie au clic (étape du plan), ou « bascule » : porte intérieure qui s'ouvre ou se ferme au clic. */
  function dessinOuverture(o: Ouverture, sel: boolean, couleur?: string, interactif: boolean | 'bascule' = true) {
    if (o.type === 'passage') return dessinPassage(o, sel, couleur, interactif === true);
    const g = el(
      'g',
      interactif === 'bascule' ? { 'data-porte-bascule': o.id, class: 'cursor-pointer' } : interactif ? { 'data-ouverture': o.id, class: 'cursor-pointer' } : { 'pointer-events': 'none' },
    );
    if (interactif === 'bascule') g.append(el('title', {}, o.ouverte === false ? 'Porte fermée : cliquez pour l’ouvrir' : 'Porte ouverte : cliquez pour la fermer'));
    const x2 = o.sens === 'h' ? o.x + o.longueur : o.x;
    const y2 = o.sens === 'v' ? o.y + o.longueur : o.y;
    const c = couleur ?? (sel ? 'var(--color-ember-600)' : o.type === 'porte' ? 'var(--color-ink-50)' : '#bcd9ea');
    if (interactif) g.append(el('line', { x1: o.x, y1: o.y, x2, y2, stroke: 'transparent', 'stroke-width': 1 }));
    g.append(el('line', { x1: o.x + (o.sens === 'h' ? 0.1 : 0), y1: o.y + (o.sens === 'v' ? 0.1 : 0), x2: x2 - (o.sens === 'h' ? 0.1 : 0), y2: y2 - (o.sens === 'v' ? 0.1 : 0), stroke: c, 'stroke-width': 0.3 }));
    if (o.type !== 'porte') g.append(el('line', { x1: o.x, y1: o.y, x2, y2, stroke: sel ? 'var(--color-ember-800)' : 'var(--color-ink-700)', 'stroke-width': 0.05 }));
    else if (o.ouverte === false) {
      // Porte fermée : vantail dans l'axe du mur
      g.append(el('line', { x1: o.x, y1: o.y, x2, y2, stroke: sel ? 'var(--color-ember-700)' : 'var(--color-ink-700)', 'stroke-width': 0.18 }));
    } else {
      // Battant de porte : quart de cercle
      const r = o.longueur;
      const d = o.sens === 'h' ? `M${o.x} ${o.y} L${o.x} ${o.y + r} A${r} ${r} 0 0 0 ${o.x + r} ${o.y}` : `M${o.x} ${o.y} L${o.x + r} ${o.y} A${r} ${r} 0 0 1 ${o.x} ${o.y + r}`;
      g.append(el('path', { d, fill: 'none', stroke: sel ? 'var(--color-ember-700)' : 'var(--color-ink-500)', 'stroke-width': 0.05, 'stroke-dasharray': '0.15 0.1' }));
    }
    return g;
  }

  const rectDessin = (g: { x0: number; y0: number; x1: number; y1: number }) => ({ x: Math.min(g.x0, g.x1), y: Math.min(g.y0, g.y1), w: Math.abs(g.x1 - g.x0), h: Math.abs(g.y1 - g.y0) });

  /** Un escalier peut-il occuper ce rectangle ? Dans une pièce du niveau, sous une pièce du niveau supérieur. */
  const escalierPossible = (r: Rect) => {
    const cx = r.x + r.w / 2;
    const cy = r.y + r.h / 2;
    const dans = pieceSous(plan, niveau, cx, cy);
    return (
      r.w >= 1 && r.h >= 1 && niveau + 1 < plan.niveaux && !!dans &&
      r.x >= dans.x && r.y >= dans.y && r.x + r.w <= dans.x + dans.w && r.y + r.h <= dans.y + dans.h &&
      !!pieceSous(plan, niveau + 1, cx, cy) &&
      plan.escaliers.every((e) => e.niveau !== niveau || !chevauche(e, r))
    );
  };

  // --- Rendu ------------------------------------------------------------------------------------------------------
  /** Sélecteur de l'élément qui a le focus dans les panneaux, pour le lui rendre après leur reconstruction. */
  const cleFocus = () => {
    const actif = document.activeElement;
    if (!(actif instanceof HTMLElement) || !racine.contains(actif)) return null;
    const d = actif.dataset;
    for (const k of ['f', 'choix', 'niveau', 'gaine', 'action'] as const) {
      const v = d[k];
      if (v) return `[data-${k}="${CSS.escape(v)}"]`;
    }
    return null;
  };

  function rendre() {
    const focus = cleFocus();
    svg.replaceChildren();
    const calcul = calculer();
    // Pendant un geste, seul le plan est redessiné ; les panneaux et la simulation attendent la fin du geste
    const enGeste = glisser !== null && glisser.genre !== 'clic';
    const simulation = plan.emetteurs.length ? (enGeste && memo.get('jour') ? memo.get('jour')!.sim : simuler(calcul)) : null;
    const jour = plan.emetteurs.length ? (enGeste && memoJour ? memoJour.jour : simulerJournee(calcul)) : null;
    const temps = temperaturesVisibles() && jour ? tempsAffichees(jour) : null;

    // Grille : une ligne par case, plus marquée tous les mètres
    const grille = el('g', { 'aria-hidden': 'true', 'pointer-events': 'none' });
    // Grille dessinable, prolongée en plus clair sur la marge que la vue peut montrer autour
    for (let i = -MARGE; i <= COLS + MARGE; i++) {
      const dedans = i >= 0 && i <= COLS;
      grille.append(el('line', { x1: i, y1: -MARGE, x2: i, y2: ROWS + MARGE, stroke: 'var(--color-ink-200)', 'stroke-width': i % 2 ? 0.02 : 0.05, opacity: dedans ? 1 : 0.5 }));
    }
    for (let j = -MARGE; j <= ROWS + MARGE; j++) {
      const dedans = j >= 0 && j <= ROWS;
      grille.append(el('line', { x1: -MARGE, y1: j, x2: COLS + MARGE, y2: j, stroke: 'var(--color-ink-200)', 'stroke-width': j % 2 ? 0.02 : 0.05, opacity: dedans ? 1 : 0.5 }));
    }
    svg.append(grille);

    // Niveau inférieur en filigrane, pour aligner l'étage
    if (niveau > 0) {
      const fantome = el('g', { 'pointer-events': 'none', opacity: 0.6 });
      for (const p of piecesDuNiveau(plan, niveau - 1)) {
        fantome.append(el('rect', { x: p.x, y: p.y, width: p.w, height: p.h, fill: 'none', stroke: 'var(--color-ink-400)', 'stroke-width': 0.08, 'stroke-dasharray': '0.4 0.25' }));
        fantome.append(el('text', { x: p.x + 0.4, y: p.y + 0.9, 'font-size': 0.55, fill: 'var(--color-ink-500)' }, p.nom));
      }
      svg.append(fantome);
    }

    const etiquettes = (etape === 'chauffage' || etape === 'resultat') && jour ? etiquettesAppareils(jour, simulation) : null;
    dessinerNiveau(svg, niveau, { interactif: true, calcul, temps, valeurs: etape !== 'plan', etiquettes });

    // Aperçus de dessin
    if (glisser?.genre === 'dessin') {
      const r = rectDessin(glisser);
      const ok = glisser.quoi === 'piece' ? r.w >= 2 && r.h >= 2 && libre(r) : escalierPossible(r);
      svg.append(el('rect', { x: r.x, y: r.y, width: r.w, height: r.h, fill: ok ? 'var(--color-ember-200)' : 'var(--color-danger-50)', 'fill-opacity': 0.7, stroke: ok ? 'var(--color-ember-600)' : 'var(--color-danger-700)', 'stroke-width': 0.1, 'stroke-dasharray': '0.3 0.2', 'pointer-events': 'none' }));
      svg.append(el('text', { x: r.x + r.w / 2, y: r.y - 0.4, 'text-anchor': 'middle', 'font-size': 0.7, fill: 'var(--color-ink-700)', 'pointer-events': 'none' }, `${m(r.w)} × ${m(r.h)}`));
    }
    if (survol && 'appareil' in survol) {
      // Aperçu de l'appareil à poser : vert s'il peut aller là, rouge sinon
      const g = el('g', { 'pointer-events': 'none', opacity: 0.75 });
      const couleur = survol.ok ? 'var(--color-moss-100)' : 'var(--color-danger-50)';
      if (survol.appareil === 'poele') dessinPoele(g, survol.x, survol.y, false, survol.ok ? 'var(--color-moss-700)' : 'var(--color-danger-700)');
      else if (survol.appareil === 'radiateur' || survol.appareil === 'split')
        dessinRadiateur(g, survol.x, survol.y, survol.sens, survol.appareil === 'split' ? 'split' : aChauffageEau(plan) ? 'eau' : 'electrique', false, couleur);
      else dessinChaudiere(g, survol.x, survol.y, survol.appareil, false, couleur);
      g.append(el('rect', { x: survol.x - 1, y: survol.y - 1, width: 2, height: 2, rx: 0.4, fill: 'none', stroke: survol.ok ? 'var(--color-moss-700)' : 'var(--color-danger-700)', 'stroke-width': 0.08, 'stroke-dasharray': '0.25 0.15' }));
      svg.append(g);
    } else if (survol && 'mitoyen' in survol) {
      for (const k of survol.mitoyen) {
        const { sens, x, y } = lireCle(k.slice(k.indexOf('|') + 1));
        svg.append(el('line', { x1: x, y1: y, x2: sens === 'h' ? x + 1 : x, y2: sens === 'v' ? y + 1 : y, stroke: 'var(--color-ember-500)', 'stroke-width': 0.5, 'stroke-opacity': 0.7, 'pointer-events': 'none' }));
      }
    } else if (survol) {
      svg.append(dessinOuverture({ ...survol, id: 'apercu' }, false, survol.ok ? 'var(--color-moss-700)' : 'var(--color-danger-700)', false));
    }

    rendreEtape();
    rendreSurcouche();
    rendreNiveaux();
    if (!enGeste) {
      rendrePanneau(calcul, simulation, jour);
      rendreRecap(calcul);
      rendreDimensionnement(calcul);
      rendreChauffage(calcul, simulation, jour);
      preparerDemande(calcul, jour);
      sauver();
      $('[data-total-kw]').textContent = kw(calcul.puissance);
      majPanneau();
      const classes = Array.from({ length: plan.niveaux }, (_, n) => classeInertieNiveau(lireEnveloppe(), n, plan.niveaux));
      const nomClasse = (c: ClasseInertie) => classesInertie.find((x) => x.value === c)!.label.toLowerCase();
      $('[data-inertie-auto]').textContent =
        new Set(classes).size === 1
          ? `Automatique : inertie ${nomClasse(classes[0])}.`
          : `Automatique : ${classes.map((c, n) => `${nomClasse(c)} ${niveauAvecArticle(n, plan.niveaux).replace(/^le /, 'au ').replace(/^l’/, 'à l’')}`).join(', ')}.`;
      $('[data-total-detail]').textContent = `nécessaires par ${tBaseTexte}, pour ${fmt(calcul.surfaceChauffee)} m² chauffés`;
      racine!.querySelectorAll<HTMLButtonElement>('[data-action="retablir"]').forEach((b) => (b.disabled = !futur.length));
      const t = texteAide();
      if (aide.textContent !== t) {
        aide.textContent = t;
        // Sur téléphone, l'aide est en haut du plan : la maison se cadre dessous
        if (petitEcran.matches && !vueManuelle) {
          ajusterVue();
          rendreSurcouche();
        }
      }
    }
    if (focus && document.activeElement === document.body) racine!.querySelector<HTMLElement>(focus)?.focus({ preventScroll: true });
  }

  /** Éléments qui dépendent de la vue : cotes et poignées de la pièce sélectionnée, rose des vents. */
  function rendreSurcouche() {
    svg.querySelector('[data-surcouche]')?.remove();
    const g = el('g', { 'data-surcouche': '' });
    const choisie = selection?.genre === 'piece' ? pieceDe(selection.id) : undefined;
    if (choisie && choisie.niveau === niveau && etape === 'plan') {
      g.append(el('text', { x: choisie.x + choisie.w / 2, y: choisie.y - 0.45, 'text-anchor': 'middle', 'font-size': 0.65, fill: 'var(--color-ember-800)', 'font-weight': 700, 'pointer-events': 'none' }, m(choisie.w)));
      g.append(el('text', { x: choisie.x - 0.45, y: choisie.y + choisie.h / 2, 'text-anchor': 'middle', 'font-size': 0.65, fill: 'var(--color-ember-800)', 'font-weight': 700, transform: `rotate(-90 ${choisie.x - 0.45} ${choisie.y + choisie.h / 2})`, 'pointer-events': 'none' }, m(choisie.h)));
      if (outil === 'selection') {
        const r = Math.max(0.45, vue.w / 90);
        for (const [coin, cx, cy] of [['nw', choisie.x, choisie.y], ['ne', choisie.x + choisie.w, choisie.y], ['sw', choisie.x, choisie.y + choisie.h], ['se', choisie.x + choisie.w, choisie.y + choisie.h]] as const) {
          g.append(el('circle', { cx, cy, r, fill: 'var(--color-white)', stroke: 'var(--color-ember-600)', 'stroke-width': 0.15, 'data-coin': coin, class: coin === 'nw' || coin === 'se' ? 'cursor-nwse-resize' : 'cursor-nesw-resize' }));
        }
      }
    }
    // Rose des vents : au plan et à la maison (où se règle l'orientation) ; ensuite, la température dehors prend sa place
    if (etape !== 'plan' && etape !== 'maison') return svg.append(g);
    const angle = { haut: 0, droite: 90, bas: 180, gauche: 270 }[plan.nord];
    const echelleRose = vue.w / 40;
    const rose = el('g', { transform: `translate(${vue.x + vue.w - 2 * echelleRose} ${vue.y + 2.2 * echelleRose}) scale(${echelleRose}) rotate(${angle})`, 'pointer-events': 'none' });
    rose.append(el('circle', { cx: 0, cy: 0, r: 1.2, fill: 'var(--color-white)', stroke: 'var(--color-ink-300)', 'stroke-width': 0.06 }));
    rose.append(el('path', { d: 'M0 -0.9 L0.35 0.3 L0 0.1 L-0.35 0.3 Z', fill: 'var(--color-ember-600)' }));
    rose.append(el('text', { x: 0, y: -1.5, 'text-anchor': 'middle', 'font-size': 0.7, 'font-weight': 700, fill: 'var(--color-ink-900)' }, 'N'));
    g.append(rose);
    svg.append(g);
  }
  const vueChangee = () => {
    appliquerVue();
    rendreSurcouche();
  };

  // --- Barre des niveaux ------------------------------------------------------------------------------------------
  function rendreNiveaux() {
    const signature = JSON.stringify([plan.niveaux, niveau, piecesDuNiveau(plan, niveau).length > 0]);
    if (barreNiveaux.dataset.signature === signature) return;
    barreNiveaux.dataset.signature = signature;
    const elements: HTMLElement[] = Array.from({ length: plan.niveaux }, (_, n) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.dataset.niveau = String(n);
      // Sur téléphone, « RDC » pour que la barre des niveaux tienne sur une ligne
      b.innerHTML = n === 0 ? '<span class="sm:hidden">RDC</span><span class="hidden sm:inline">Rez-de-chaussée</span>' : '';
      if (n === 0) b.setAttribute('aria-label', nomDuNiveau(0));
      else b.textContent = nomDuNiveau(n);
      b.setAttribute('aria-pressed', String(n === niveau));
      b.className = 'min-h-10 rounded-full px-3 text-sm font-bold text-ink-600 aria-pressed:bg-ink-900 aria-pressed:text-white sm:px-4';
      b.addEventListener('click', () => changerNiveau(n));
      return b;
    });
    const ajout = document.createElement('button');
    ajout.type = 'button';
    ajout.dataset.niveau = 'ajout';
    ajout.className = 'min-h-10 rounded-full px-3 text-sm font-bold text-ember-700 disabled:opacity-40';
    ajout.innerHTML = '+ <span class="sm:hidden">Étage</span><span class="hidden sm:inline">Ajouter un étage</span>';
    ajout.setAttribute('aria-label', 'Ajouter un étage');
    ajout.disabled = plan.niveaux >= NIVEAUX_MAX;
    ajout.addEventListener('click', () => {
      modifier({ ...plan, niveaux: plan.niveaux + 1 });
      changerNiveau(plan.niveaux - 1);
      signaler('Nouvel étage : dessinez ses pièces en vous aidant du niveau du dessous, en pointillé, ou utilisez « Ajouter une pièce ».');
    });
    elements.push(ajout);
    if (plan.niveaux > 1 && niveau === plan.niveaux - 1) {
      const suppr = document.createElement('button');
      suppr.type = 'button';
      suppr.dataset.niveau = 'suppr';
      suppr.className = 'min-h-10 rounded-full px-3 text-sm font-semibold text-danger-700';
      suppr.innerHTML = 'Supprimer<span class="hidden sm:inline"> ce niveau</span>';
      suppr.setAttribute('aria-label', 'Supprimer ce niveau');
      suppr.addEventListener('click', () => {
        if (piecesDuNiveau(plan, niveau).length && !confirm('Supprimer ce niveau et toutes ses pièces ? Vous pourrez revenir en arrière avec « Annuler ».')) return;
        const n = niveau;
        selection = null;
        niveau = n - 1;
        modifier({ ...plan, niveaux: n, pieces: plan.pieces.filter((p) => p.niveau !== n), ouvertures: plan.ouvertures.filter((o) => o.niveau !== n), mitoyens: plan.mitoyens.filter((k) => !k.startsWith(`${n}|`)) });
      });
      elements.push(suppr);
    }
    barreNiveaux.replaceChildren(...elements);
  }
  function changerNiveau(n: number) {
    niveau = n;
    selection = null;
    survol = null;
    rendre();
  }

  // --- Étapes ------------------------------------------------------------------------------------------------------
  /** Le plan montre les températures aux étapes du chauffage et du résultat, dès qu'il y a un appareil. */
  const temperaturesVisibles = () => (etape === 'chauffage' || etape === 'resultat') && plan.emetteurs.length > 0;
  const textesSuivant: Record<Etape, string> = { plan: 'Suivant : votre maison', maison: 'Suivant : le chauffage', chauffage: 'Voir le résultat', resultat: 'Envoyer mon plan' };
  const textesPrecedent: Record<Etape, string> = { plan: '', maison: 'Retour au plan', chauffage: 'Retour', resultat: 'Retour' };
  /** Ce qui dépend de l'étape autour du plan : barres d'étapes, outils, barres posées sur le plan, légende. */
  function rendreEtape() {
    racine!.dataset.etape = etape;
    const rang = ETAPES.indexOf(etape);
    racine!.querySelectorAll<HTMLButtonElement>('[data-etape-bouton]').forEach((b) => {
      const i = ETAPES.indexOf(b.dataset.etapeBouton as Etape);
      if (i === rang) b.setAttribute('aria-current', 'step');
      else b.removeAttribute('aria-current');
      b.toggleAttribute('data-fait', i < rang);
    });
    racine!.querySelectorAll<HTMLButtonElement>('[data-outil]').forEach((b) => {
      if (b.dataset.etapes) b.hidden = !b.dataset.etapes.split(' ').includes(etape);
      b.setAttribute('aria-pressed', String(b.dataset.outil === outil));
    });
    const dehors = $('[data-dehors]');
    const avant = dehors.hidden;
    dehors.hidden = etape !== 'chauffage' || !plan.emetteurs.length;
    $('[data-legende-temperatures]').hidden = !temperaturesVisibles();
    // Une barre apparaît ou disparaît en haut du plan : on recadre la maison, sauf si l'utilisateur a réglé la vue
    if (dehors.hidden !== avant && !vueManuelle) ajusterVue();
  }
  /** Panneau : le détail de ce qui est choisi (et, au plan, la liste des pièces), sinon le contenu de l'étape. */
  function majPanneau() {
    const section = selection || etape === 'plan' ? 'detail' : etape;
    racine!.querySelectorAll<HTMLElement>('[data-section]').forEach((x) => (x.hidden = x.dataset.section !== section));
    const prec = $<HTMLButtonElement>('[data-etape-prec]');
    prec.textContent = textesPrecedent[etape];
    prec.hidden = etape === 'plan';
    $('[data-etape-suiv-texte]').textContent = textesSuivant[etape];
    $('[data-etape-suiv]').toggleAttribute('data-envoi', etape === 'resultat');
  }
  function choisirEtape(e: Etape) {
    if (e === etape) return;
    etape = e;
    selection = null;
    // Sur téléphone, les étapes sans outils ont leur volet ouvert
    if (petitEcran.matches) ouvrirVolet(e === 'maison' || e === 'resultat');
    choisirOutil('selection');
    $('[data-volet-contenu]').scrollTop = 0;
  }

  // --- Onglet Chauffage ------------------------------------------------------------------------------------------
  const nomGenerateur = () => (plan.central.generateur === 'pac' ? 'la pompe à chaleur' : 'la chaudière');
  /** Ce qui chauffe l'eau des radiateurs, avec sa puissance : chaudière ou pompe à chaleur, poêles hydro. */
  const sourcesEau = () => [
    ...(plan.central.generateur !== 'aucun' ? [`${nomGenerateur()} de ${fmt(plan.central.puissance)} kW`] : []),
    ...poelesHydro(plan).map((e) => `le poêle hydro de « ${pieceDe(e.piece)?.nom ?? ''} » (${fmt((e.puissance * e.partEau) / 100)} kW à l’eau)`),
  ];
  const nomSourceEau = () => sourcesEau().join(' et ');
  const tropJuste = () => (sourcesEau().length > 1 ? 'sont trop justes' : 'est trop juste');
  const messageSansEau = 'Les radiateurs à eau n’ont rien pour chauffer leur eau : posez une chaudière ou une pompe à chaleur (outil « Chaudière »), ou choisissez un poêle hydro.';
  /** Nom court de chaque type de poêle, pour les listes et les textes. */
  const nomsPoele: Record<Poele['nature'], string> = { granules: 'Poêle à granulés', canalisable: 'Poêle canalisable', hydro: 'Poêle hydro', bois: 'Poêle à bois' };
  const nomChaudiere = () => {
    const c = plan.central;
    const ou = c.piece ? `« ${pieceDe(c.piece)?.nom ?? ''} »` : 'pas encore posée sur le plan';
    return `${c.generateur === 'pac' ? 'Pompe à chaleur' : 'Chaudière'} de ${fmt(c.puissance)} kW, ${ou}`;
  };
  /** Nom court d'un émetteur, pour les listes et le résumé de la demande. */
  const nomEmetteur = (e: Emetteur) => {
    const ou = `« ${pieceDe(e.piece)?.nom ?? ''} »`;
    return e.genre === 'poele'
      ? `${nomsPoele[e.nature]} de ${fmt(e.puissance)} kW, ${ou}`
      : `${e.nature === 'eau' ? 'Radiateur à eau' : e.nature === 'split' ? 'PAC air/air' : 'Radiateur électrique'} de ${watts(e.puissance)}, ${ou}`;
  };
  /** Ce que fait un poêle au jour choisi. */
  const textePoele = (e: Poele, sim: Simulation, tExt: number) => {
    if (e.nature === 'hydro') return texteHydro(e, sim, tExt);
    const r = sim.emetteurs.get(e.id);
    const nomPiece = pieceDe(e.piece)?.nom ?? '';
    const t = sim.temperatures.get(e.piece) ?? 0;
    const dehors = `Par ${degres(tExt)} dehors`;
    const pMax = e.puissance * 1000;
    const pMin = regulation.poeles[e.nature].allureMinimale * pMax;
    const p = r?.puissance ?? 0;
    const tAuMin = r?.tPieceAuMinimum ?? t;
    // Au-delà de 30 °C, le chiffre exact n'a pas de sens : personne ne laisserait monter la pièce jusque-là
    const auMin = tAuMin > 30 ? 'plus de 30 °C' : degres(tAuMin);
    const textes: Record<Regime, string> = {
      arret: `${dehors}, il fait déjà ${degres(t)} dans « ${nomPiece} » : le poêle y reste à l’arrêt.`,
      modulation: `${dehors}, le poêle de « ${nomPiece} » tient ${degres(e.consigne)} en fournissant ${kw(p)}, soit ${Math.round((p / pMax) * 100)} % de sa puissance.`,
      maximum: `${dehors} et à pleine puissance (${kw(pMax)}), le poêle de « ${nomPiece} » ne tient que ${degres(t)} : il est trop juste.`,
      minimum: `${dehors}, le poêle de « ${nomPiece} » est trop puissant : même à son allure minimale (${kw(pMin)}), il dépasse un peu son réglage (${degres(t)}).`,
      'marche-arret': `${dehors}, le poêle de « ${nomPiece} » est trop puissant : même à son allure minimale (${kw(pMin)}), la pièce monterait à ${auMin}. Son thermostat l’arrête et le rallume sans cesse, pour ${degres(t)} en moyenne.`,
      flambees: `${dehors}, le poêle à bois de « ${nomPiece} » est trop puissant : même au ralenti (${kw(pMin)}), la pièce monterait à ${auMin}. Il faudrait faire des flambées courtes et espacées : les températures sont des moyennes sur la journée, avec de fortes variations.`,
    };
    return textes[r?.regime ?? 'arret'];
  };
  /** Poêle hydro : piloté par les radiateurs, il partage sa chaleur entre l'eau et sa pièce. */
  const texteHydro = (e: Poele, sim: Simulation, tExt: number) => {
    const r = sim.emetteurs.get(e.id);
    const nomPiece = pieceDe(e.piece)?.nom ?? '';
    const radiateursEau = plan.emetteurs.some((x) => x.genre === 'radiateur' && x.nature === 'eau');
    if (!radiateursEau) return `Le poêle hydro de « ${nomPiece} » chauffe l’eau des radiateurs : posez des radiateurs à eau (outil « Radiateur »), sinon il reste éteint.`;
    const p = r?.puissance ?? 0;
    if (p <= 0) return `Par ${degres(tExt)} dehors, les radiateurs ne demandent pas de chaleur : le poêle hydro de « ${nomPiece} » reste à l’arrêt.`;
    const eau = r?.eau ?? 0;
    const texte = `Par ${degres(tExt)} dehors, le poêle hydro de « ${nomPiece} » fournit ${kw(p)}, soit ${Math.round((p / (e.puissance * 1000)) * 100)} % de sa puissance : ${kw(eau)} à l’eau des radiateurs et ${kw(p - eau)} dans la pièce.`;
    if (r?.regime === 'maximum') return `${texte} Il est à pleine puissance : les radiateurs en voudraient plus.`;
    if (r?.regime === 'marche-arret') return `${texte} C’est moins que son allure minimale : il s’arrête et se rallume, c’est la moyenne.`;
    return texte;
  };
  const surdimensionne = (sim: Simulation, e: Poele) => ['minimum', 'marche-arret', 'flambees'].includes(sim.emetteurs.get(e.id)?.regime ?? '');

  function rendreChauffage(calcul: Calcul, simulation: Simulation | null, jour: Jour | null) {
    $('[data-poele-absent]').hidden = plan.emetteurs.length > 0;
    // Liste des poêles et radiateurs : chacun ouvre son détail (utile au clavier et sur téléphone)
    const liste = $('[data-liste-emetteurs]');
    const chaudiere = plan.central.generateur === 'aucun' ? null : nomChaudiere();
    const signature = JSON.stringify([chaudiere, plan.emetteurs.map((e) => [e.id, nomEmetteur(e)])]);
    if (liste.dataset.signature !== signature) {
      liste.dataset.signature = signature;
      liste.replaceChildren(
        ...(chaudiere ? [Object.assign(document.createElement('li'), {})] : []).map((li) => {
          li.append(bouton(chaudiere!, 'text-left text-sm font-semibold text-ember-800 underline underline-offset-2', () => selectionner({ genre: 'generateur', id: 'central' }), 'generateur'));
          return li;
        }),
        ...plan.emetteurs.map((e) => {
          const li = document.createElement('li');
          li.append(bouton(nomEmetteur(e), 'text-left text-sm font-semibold text-ember-800 underline underline-offset-2', () => selectionner({ genre: 'emetteur', id: e.id }), `emetteur-${e.id}`));
          return li;
        }),
      );
    }
    const tablePieces = $('[data-temperatures-pieces]');
    if (!simulation) {
      resultatPoele.replaceChildren();
      etatPoele.replaceChildren();
      tablePieces.replaceChildren();
      return;
    }
    const sim = simulation;
    const tExt = conditions(calcul).tExterieure;
    const lesPoeles = plan.emetteurs.filter((e): e is Poele => e.genre === 'poele');
    const lesRadiateurs = plan.emetteurs.filter((e): e is Radiateur => e.genre === 'radiateur');
    const aEau = lesRadiateurs.some((e) => e.nature === 'eau');

    // État au jour choisi : chaque poêle, puis le chauffage central et les radiateurs électriques
    const lignes = lesPoeles.map((e) => textePoele(e, sim, tExt));
    if (aEau && !aChauffageEau(plan)) lignes.push(messageSansEau);
    else if (aEau)
      lignes.push(
        `Par ${degres(tExt)} dehors, les radiateurs à eau reçoivent ${kw(sim.puissanceCentral)}, avec une eau à ${degres(sim.tEau ?? 0)} en moyenne${sim.generateurLimite ? ` : ${nomSourceEau()} ${tropJuste()}` : ''}.`,
      );
    const electrique = lesRadiateurs.filter((e) => e.nature === 'electrique').reduce((s2, e) => s2 + (sim.emetteurs.get(e.id)?.puissance ?? 0), 0);
    if (lesRadiateurs.some((e) => e.nature === 'electrique')) lignes.push(`Par ${degres(tExt)} dehors, les radiateurs électriques fournissent ${kw(electrique)}.`);
    const splits = lesRadiateurs.filter((e) => e.nature === 'split');
    if (splits.length) lignes.push(`Par ${degres(tExt)} dehors, ${splits.length > 1 ? 'les unités de PAC air/air fournissent' : 'l’unité de PAC air/air fournit'} ${kw(splits.reduce((s2, e) => s2 + (sim.emetteurs.get(e.id)?.puissance ?? 0), 0))}.`);
    const signatureEtat = lignes.join('\n');
    if (etatPoele.dataset.texte !== signatureEtat) {
      etatPoele.dataset.texte = signatureEtat;
      etatPoele.replaceChildren(...lignes.map((l) => Object.assign(document.createElement('p'), { textContent: l })));
    }

    // Par grand froid : c'est là que la puissance des appareils se voit
    const gf = tExt <= parametres.tBase ? null : simulerGrandFroid(calcul);
    const lignesGf: string[] = [];
    if (gf) {
      for (const e of lesPoeles) {
        const r = gf.emetteurs.get(e.id);
        const nomPiece = pieceDe(e.piece)?.nom ?? '';
        if (e.nature === 'hydro') {
          if (r && r.puissance > 0) lignesGf.push(`Par grand froid (${tBaseTexte}), le poêle hydro de « ${nomPiece} » fonctionnerait à ${Math.round((r.puissance / (e.puissance * 1000)) * 100)} % de sa puissance${r.regime === 'maximum' ? ' : il est trop juste pour les radiateurs' : ''}.`);
          continue;
        }
        if (r?.regime === 'maximum') lignesGf.push(`Par grand froid (${tBaseTexte}), le poêle de « ${nomPiece} » ne tiendrait que ${degres(gf.temperatures.get(e.piece) ?? 0)} même à pleine puissance : il est trop juste.`);
        else if (r?.regime === 'modulation') lignesGf.push(`Par grand froid (${tBaseTexte}), le poêle de « ${nomPiece} » tiendrait ${degres(e.consigne)} à ${Math.round((r.puissance / (e.puissance * 1000)) * 100)} % de sa puissance.`);
        else if (surdimensionne(gf, e)) lignesGf.push(`Même par grand froid (${tBaseTexte}), le poêle de « ${nomPiece} » fonctionnerait encore au ralenti : il est surdimensionné.`);
      }
      // (poêles hydro seuls : leur ligne le dit déjà)
      if (aEau && plan.central.generateur !== 'aucun') {
        // Ce que fournit la chaudière ou la PAC (les poêles hydro servent l'eau en premier) : c'est par grand froid qu'on la dimensionne
        const eauHydroGf = lesPoeles.reduce((s2, e) => s2 + (gf.emetteurs.get(e.id)?.eau ?? 0), 0);
        lignesGf.unshift(`Par grand froid (${tBaseTexte}), ${nomGenerateur()} fournirait ${kw(Math.max(0, gf.puissanceCentral - eauHydroGf))} sur ses ${fmt(plan.central.puissance)} kW${lesPoeles.length ? `, ${lesPoeles.length > 1 ? 'les poêles faisant' : 'le poêle faisant'} le reste` : ''} : c’est ce jour-là qu’on la dimensionne.`);
      }
      if (aEau && gf.generateurLimite && plan.central.generateur !== 'aucun') lignesGf.push(`Par grand froid, ${nomSourceEau()} ${tropJuste()} pour tous les radiateurs.`);
      // Pièces équipées de radiateurs qui restent sous leur réglage
      const froides = calcul.pieces.filter((r) => {
        const ems = plan.emetteurs.filter((e) => e.piece === r.piece.id && e.genre === 'radiateur');
        return ems.length > 0 && (gf.temperatures.get(r.piece.id) ?? 0) < Math.max(...ems.map((e) => e.consigne)) - 0.5;
      });
      if (froides.length)
        lignesGf.push(`Par grand froid, ${froides.length > 1 ? 'ces pièces restent sous le réglage de leurs radiateurs' : 'cette pièce reste sous le réglage de ses radiateurs'} : ${froides.map((r) => `${nomAvecNiveau(r.piece)} à ${degres(gf.temperatures.get(r.piece.id) ?? 0)}`).join(', ')}. Des radiateurs plus puissants ou une eau plus chaude l’amèneraient à température.`);
      else if (lesRadiateurs.length && !(aEau && gf.generateurLimite)) lignesGf.push(`Par grand froid (${tBaseTexte}), chaque pièce équipée de radiateurs atteint son réglage.`);
    }

    resultatPoele.innerHTML = `
      <div class="mb-2 flex flex-col gap-1.5 rounded-2xl bg-ink-50 p-3 text-sm font-semibold text-ink-800 empty:hidden" data-grand-froid></div>
      <p class="rounded-2xl bg-ember-50 p-3 text-sm text-ink-800 empty:hidden" data-surdimensionne></p>`;
    // Tableau des températures : à l'étape du résultat
    tablePieces.innerHTML = `
      <h3 class="font-bold">Températures avec votre chauffage</h3>
      <div class="overflow-x-auto rounded-2xl border border-ink-200">
        <table class="w-full text-left text-sm">
          <thead class="bg-ink-100"><tr><th scope="col" class="px-3 py-2">Pièce</th><th scope="col" class="px-3 py-2">Température</th><th scope="col" class="px-3 py-2">Chauffage</th></tr></thead>
          <tbody></tbody>
        </table>
      </div>
      <p class="text-xs text-ink-500" data-note-poele></p>`;
    resultatPoele.querySelector('[data-grand-froid]')!.replaceChildren(...lignesGf.map((l) => Object.assign(document.createElement('p'), { textContent: l })));
    resultatPoele.querySelector('[data-surdimensionne]')!.textContent = lesPoeles.some((e) => surdimensionne(sim, e))
      ? 'Un poêle trop puissant fonctionne souvent au ralenti ou par à-coups : son rendement baisse et il émet plus de polluants (ADEME, 2023). Un appareil plus petit, qui tient encore son réglage par grand froid, fonctionnerait mieux.'
      : '';
    tablePieces.querySelector('[data-note-poele]')!.textContent =
      `Par ${degres(tExt)} dehors : moyennes d’une journée de janvier en chauffage continu, plus froide la nuit que l’après-midi : soleil moyen par les fenêtres selon leur orientation, chaleur des occupants et des appareils, masse des murs et des planchers qui lisse les variations. Chaque appareil suit son réglage dans la limite de sa puissance. Le calcul tient compte de l’air plus chaud sous le plafond de la pièce d’un poêle. Les échanges entre pièces dépendent beaucoup de la disposition : nous les vérifions chez vous.` +
      (sim.converge && (jour?.converge ?? true) ? '' : ' Calcul approché : ce plan n’a pas permis un calcul complet.');
    const tbody = tablePieces.querySelector('tbody')!;
    for (const r of calcul.pieces) {
      const tr = document.createElement('tr');
      tr.className = 'border-t border-ink-100';
      const ems = plan.emetteurs.filter((e) => e.piece === r.piece.id);
      // Puissance moyenne sur la journée de chaque appareil de la pièce
      const chauffage = ems.length
        ? ems.map((e) => `${e.genre === 'poele' ? 'poêle' : e.nature === 'split' ? 'PAC air/air' : 'radiateur'} ${watts(jour ? moyenne(jour.puissances.get(e.id) ?? []) : (sim.emetteurs.get(e.id)?.puissance ?? 0))}`).join(' · ')
        : '—';
      const t = jour?.temperatures.get(r.piece.id) ?? [sim.temperatures.get(r.piece.id) ?? 0];
      const ecart = Math.max(...t) - Math.min(...t) >= 0.5 ? `de ${Math.round(Math.min(...t))} à ${Math.round(Math.max(...t))}` : '';
      [nomAvecNiveau(r.piece), degres(moyenne(t)), chauffage].forEach((texte, i) => {
        const td = document.createElement(i === 0 ? 'th' : 'td');
        if (i === 0) td.setAttribute('scope', 'row');
        td.className = `px-3 py-2 ${i === 0 ? 'font-semibold' : 'tabular-nums'}`;
        td.textContent = texte;
        // Variation sur la journée, sous la moyenne
        if (i === 1 && ecart) td.append(Object.assign(document.createElement('span'), { className: 'block text-xs font-normal text-ink-500', textContent: ecart }));
        tr.append(td);
      });
      tbody.append(tr);
    }
  }

  // --- Panneau « Détail » -----------------------------------------------------------------------------------------
  const champ = 'h-11 w-full rounded-xl border border-ink-300 bg-white px-3 font-semibold text-ink-900 focus:border-ember-600 focus:ring-4 focus:ring-ember-600/15 focus:outline-none';
  const nomsCotes: Record<Cote, string> = { haut: 'Mur du haut', bas: 'Mur du bas', gauche: 'Mur de gauche', droite: 'Mur de droite' };
  const bouton = (texte: string, classe: string, onClick: () => void, cle: string) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = classe;
    b.textContent = texte;
    b.dataset.choix = cle;
    b.addEventListener('click', onClick);
    return b;
  };
  const selectionner = (s: Selection) => {
    selection = s;
    rendre();
  };
  function rendrePanneau(calcul: Calcul, simulation: Simulation | null, jour: Jour | null = memoJour?.jour ?? null) {
    const piece = selection?.genre === 'piece' ? pieceDe(selection.id) : undefined;
    const ouverture = selection?.genre === 'ouverture' ? plan.ouvertures.find((o) => o.id === selection!.id) : undefined;
    const escalier = selection?.genre === 'escalier' ? escalierDe(selection.id) : undefined;
    const emetteur = selection?.genre === 'emetteur' ? plan.emetteurs.find((e) => e.id === selection!.id) : undefined;
    if (piece && etape === 'plan') {
      panneau.innerHTML = `
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate font-display text-2xl leading-tight font-semibold" data-titre-piece></p>
            <p class="text-sm text-ink-600" data-sous-titre-piece></p>
          </div>
        </div>
        <label class="flex flex-col gap-1.5"><span class="text-sm font-bold">Nom</span><input data-f="nom" class="${champ}" maxlength="40" /></label>
        <label class="flex flex-col gap-1.5"><span class="text-sm font-bold">Usage</span><select data-f="type" class="${champ}">${typesPiece.map((t) => `<option value="${t.value}">${t.label}</option>`).join('')}</select></label>
        <div class="grid grid-cols-2 gap-3">
          <label class="flex flex-col gap-1.5"><span class="text-sm font-bold">Largeur (m)</span><input data-f="w" type="number" step="0.5" min="1" class="${champ}" /></label>
          <label class="flex flex-col gap-1.5"><span class="text-sm font-bold">Profondeur (m)</span><input data-f="h" type="number" step="0.5" min="1" class="${champ}" /></label>
        </div>
        <fieldset class="flex flex-col gap-2 rounded-2xl border border-ink-200 p-3">
          <legend class="px-1 text-sm font-bold">Fenêtres et portes</legend>
          <div class="grid grid-cols-2 gap-2">
            <select data-f="ajout" class="${champ}" aria-label="Type d’ouverture">${typesOuverture.map((t) => `<option value="${t.value}">${t.label}</option>`).join('')}</select>
            <select data-f="cote" class="${champ}" aria-label="Sur quel mur">${(Object.keys(nomsCotes) as Cote[]).map((c) => `<option value="${c}">${nomsCotes[c]}</option>`).join('')}</select>
          </div>
          <div class="flex flex-wrap gap-x-4 gap-y-2" data-actions-piece></div>
          <ul class="flex flex-col gap-1 text-sm empty:hidden" data-ouvertures-piece></ul>
        </fieldset>
        <button type="button" data-action="supprimer" class="btn-secondary min-h-11 self-start text-danger-700">Supprimer la pièce</button>`;
      const nom = panneau.querySelector<HTMLInputElement>('[data-f="nom"]')!;
      const type = panneau.querySelector<HTMLSelectElement>('[data-f="type"]')!;
      const w = panneau.querySelector<HTMLInputElement>('[data-f="w"]')!;
      const h = panneau.querySelector<HTMLInputElement>('[data-f="h"]')!;
      panneau.querySelector('[data-titre-piece]')!.textContent = piece.nom;
      panneau.querySelector('[data-sous-titre-piece]')!.textContent = `${plan.niveaux > 1 ? `${nomDuNiveau(piece.niveau)} · ` : ''}${fmt(piece.w * PAS)} × ${fmt(piece.h * PAS)} m · ${fmt(surface(piece))} m²`;
      nom.value = piece.nom;
      type.value = piece.type;
      w.value = String(piece.w * PAS);
      h.value = String(piece.h * PAS);
      nom.addEventListener('change', () => modifier({ ...plan, pieces: plan.pieces.map((p) => (p.id === piece.id ? { ...p, nom: nom.value.trim().slice(0, 40) || p.nom } : p)) }));
      type.addEventListener('change', () => modifier({ ...plan, pieces: plan.pieces.map((p) => (p.id === piece.id ? { ...p, type: type.value as TypePiece } : p)) }));
      const redim = () => {
        const nw = Math.round(Number(w.value) / PAS);
        const nh = Math.round(Number(h.value) / PAS);
        const r = { ...piece, w: nw, h: nh };
        if (!(nw >= 2 && nh >= 2) || !libre(r, piece.id, piece.niveau)) {
          signaler('Dimensions impossibles : une pièce mesure au moins 1 m de côté, reste dans la grille et ne chevauche pas une autre pièce.');
          return rendrePanneau(calcul, simulation);
        }
        modifier({ ...plan, pieces: plan.pieces.map((p) => (p.id === piece.id ? r : p)) });
      };
      w.addEventListener('change', redim);
      h.addEventListener('change', redim);
      panneau.querySelector('[data-action="supprimer"]')!.addEventListener('click', supprimerSelection);

      // Ouvertures sans pointeur (clavier, petits écrans)
      const ajout = panneau.querySelector<HTMLSelectElement>('[data-f="ajout"]')!;
      const cote = panneau.querySelector<HTMLSelectElement>('[data-f="cote"]')!;
      const actions = panneau.querySelector<HTMLElement>('[data-actions-piece]')!;
      actions.append(
        bouton('Ajouter', 'link-arrow', () => {
          const t = ajout.value as TypeOuverture;
          const o = ouvertureSurCote(plan, piece, cote.value as Cote, t);
          if (!o) return signaler(t === 'porte' ? 'Pas de place pour une porte sur ce mur.' : 'Pas de place pour une fenêtre sur ce mur : il doit donner sur l’extérieur et avoir assez de longueur libre.');
          modifier({ ...plan, ouvertures: [...plan.ouvertures, { ...o, id: nouvelId('o') }] });
        }, 'ajouter-ouverture'),
      );
      const liste = panneau.querySelector<HTMLElement>('[data-ouvertures-piece]')!;
      const segs = new Set(contour(piece));
      for (const o of ouverturesDuNiveau(plan, piece.niveau).filter((x) => segmentsOuverture(x).every((k) => segs.has(k)))) {
        const li = document.createElement('li');
        const nomType = typesOuverture.find((t) => t.value === o.type)!.label;
        li.append(bouton(`${nomType} de ${m(o.longueur)}${o.type === 'porte' && o.ouverte === false ? ' (fermée)' : ''}`, 'font-semibold text-ember-800 underline underline-offset-2', () => selectionner({ genre: 'ouverture', id: o.id }), `ouv-${o.id}`));
        liste.append(li);
      }

    } else if (piece) {
      // Maison : d'où vient le besoin de la pièce ; chauffage : sa température et ses appareils
      panneau.innerHTML = `
        <div class="flex items-start justify-between gap-3">
          <div class="min-w-0">
            <p class="truncate font-display text-2xl leading-tight font-semibold" data-titre-piece></p>
            <p class="text-sm text-ink-600" data-sous-titre-piece></p>
          </div>
          <p class="shrink-0 text-right"><span class="block font-display text-2xl leading-tight font-semibold text-ember-800" data-valeur-piece></span><span class="text-xs text-ink-600" data-valeur-legende></span></p>
        </div>
        <div class="flex flex-col gap-2" data-chauffage-piece hidden>
          <ul class="flex flex-col gap-1.5 text-sm empty:hidden" data-appareils-piece></ul>
          <div class="flex flex-wrap gap-x-4 gap-y-2" data-actions-piece></div>
        </div>
        <div data-pertes></div>`;
      panneau.querySelector('[data-titre-piece]')!.textContent = piece.nom;
      panneau.querySelector('[data-sous-titre-piece]')!.textContent = `${plan.niveaux > 1 ? `${nomDuNiveau(piece.niveau)} · ` : ''}${fmt(surface(piece))} m²`;
      const resPiece = calcul.pieces.find((r) => r.piece.id === piece.id);
      const tPiece = etape === 'chauffage' && jour ? moyenne(jour.temperatures.get(piece.id) ?? []) : undefined;
      panneau.querySelector('[data-valeur-piece]')!.textContent = tPiece !== undefined && resPiece ? degres(tPiece) : resPiece ? watts(resPiece.puissance) : '';
      panneau.querySelector('[data-valeur-legende]')!.textContent = !resPiece ? 'non chauffée' : tPiece !== undefined ? 'en moyenne' : 'nécessaires';
      if (etape === 'chauffage' && resPiece) {
        panneau.querySelector<HTMLElement>('[data-chauffage-piece]')!.hidden = false;
        const appareils = panneau.querySelector<HTMLElement>('[data-appareils-piece]')!;
        for (const e of plan.emetteurs.filter((x) => x.piece === piece.id)) {
          const li = document.createElement('li');
          li.append(bouton(nomEmetteur(e).replace(/, « .* »$/, ''), 'font-semibold text-ember-800 underline underline-offset-2', () => selectionner({ genre: 'emetteur', id: e.id }), `emetteur-piece-${e.id}`));
          appareils.append(li);
        }
        if (!appareils.childElementCount) appareils.append(Object.assign(document.createElement('li'), { className: 'text-ink-600', textContent: 'Aucun appareil dans cette pièce : elle est chauffée par les pièces voisines.' }));
        // Sans pointeur (clavier, petits écrans)
        panneau.querySelector('[data-actions-piece]')!.append(
          bouton('Installer un poêle ici', 'link-arrow', () => installerPoele(piece, piece.x + piece.w / 2, piece.y + piece.h / 2), 'poele-ici'),
          bouton('Ajouter un radiateur', 'link-arrow', () => ajouterRadiateur(piece, piece.x + piece.w / 2, piece.y + piece.h - 0.6), 'radiateur-ici'),
        );
      }
      const res = etape === 'maison' ? resPiece : undefined;
      const pertes = panneau.querySelector<HTMLElement>('[data-pertes]')!;
      if (res) {
        const postes = (Object.entries(res.postes) as [keyof Postes, number][]).filter(([, x]) => x > 0.05).sort((a, b) => b[1] - a[1]);
        const max = Math.max(...postes.map(([, x]) => x), 1);
        const dT = parametres.tInterieure - parametres.tBase;
        pertes.innerHTML = `
          <div class="rounded-2xl bg-ink-900 p-4 text-ink-100">
            <p class="text-sm text-ember-300">Puissance de chauffage nécessaire</p>
            <p class="mt-1 text-sm text-ink-300"><strong class="text-white">${watts(res.puissance)}</strong>, soit ${fmt(res.puissance / res.surface)} W par m², pour garder ${parametres.tInterieure} °C par ${tBaseTexte} dehors.</p>
            <dl class="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div class="rounded-xl bg-ink-800 p-2.5"><dt class="text-ink-300">Radiateur (eau à 75 °C)</dt><dd class="font-semibold text-white">${watts(res.puissance)}</dd></div>
              <div class="rounded-xl bg-ink-800 p-2.5"><dt class="text-ink-300">Radiateur (pompe à chaleur, 55 °C)</dt><dd class="font-semibold text-white">${watts(radiateurPourPac(res.puissance))}</dd></div>
            </dl>
          </div>
          <p class="mt-4 text-sm font-bold">D’où vient la perte de chaleur</p>
          <ul class="mt-2 flex flex-col gap-2 text-sm">
            ${postes
              .map(
                ([k, x]) => `<li><div class="flex justify-between gap-2"><span>${postesLabels[k]}</span><span class="tabular-nums font-semibold">${watts(x * dT)}</span></div><div class="mt-1 h-1.5 rounded-full bg-ember-400" style="width:${Math.max(3, (x / max) * 100)}%"></div></li>`,
              )
              .join('')}
          </ul>`;
      } else if (!resPiece) {
        pertes.innerHTML = `<p class="rounded-2xl bg-ink-50 p-3 text-sm text-ink-600">Pièce non chauffée : les murs et planchers qu’elle partage avec les pièces chauffées comptent dans leurs pertes.</p>`;
      }
    } else if (ouverture) {
      panneau.innerHTML = `
        <p class="font-display text-xl font-semibold">${ouverture.type === 'passage' ? 'Ouverture entre deux pièces' : 'Ouverture'}</p>
        <label class="flex flex-col gap-1.5"><span class="text-sm font-bold">Type</span><select data-f="type-ouverture" class="${champ}">${typesOuverture.map((t) => `<option value="${t.value}">${t.label}</option>`).join('')}</select></label>
        <div class="grid grid-cols-2 gap-3">
          <label class="flex flex-col gap-1.5"><span class="text-sm font-bold">Largeur (m)</span><input data-f="longueur" type="number" step="0.5" min="0.5" class="${champ}" /></label>
          <label class="flex flex-col gap-1.5" ${ouverture.type === 'passage' ? 'hidden' : ''}><span class="text-sm font-bold">Hauteur (m)</span><input data-f="hauteur" type="number" step="0.05" min="0.3" max="3" class="${champ}" /></label>
        </div>
        <p class="-mt-1 text-sm text-ink-600" ${ouverture.type === 'passage' ? '' : 'hidden'}>Pas de cloison sur cette largeur, du sol au plafond : l’air circule librement entre les deux pièces.</p>
        <label class="flex items-center gap-3 font-semibold" data-porte-interieure hidden><input data-f="ouverte" type="checkbox" class="size-5 accent-ember-600" /> Porte laissée ouverte</label>
        <button type="button" data-action="supprimer" class="btn-secondary min-h-11 self-start text-danger-700">Supprimer</button>`;
      const type = panneau.querySelector<HTMLSelectElement>('[data-f="type-ouverture"]')!;
      const longueur = panneau.querySelector<HTMLInputElement>('[data-f="longueur"]')!;
      const hauteur = panneau.querySelector<HTMLInputElement>('[data-f="hauteur"]')!;
      type.value = ouverture.type;
      longueur.value = String(ouverture.longueur * PAS);
      hauteur.value = String(ouverture.hauteur);
      const maj = () => {
        const nouveauType = type.value as TypeOuverture;
        // Hauteur restée à la valeur proposée : elle suit le changement de type
        const h = Number(hauteur.value) === hauteurParDefaut(ouverture.type) ? hauteurParDefaut(nouveauType) : Number(hauteur.value);
        const o = { ...ouverture, type: nouveauType, longueur: Math.round(Number(longueur.value) / PAS), hauteur: h > 0 ? Math.min(3, h) : ouverture.hauteur };
        if (!(o.longueur >= 1) || !ouverturePossible(plan, o, o.id)) {
          signaler(messageOuverture(o.type));
          return rendrePanneau(calcul, simulation);
        }
        modifier({ ...plan, ouvertures: plan.ouvertures.map((x) => (x.id === o.id ? o : x)) });
      };
      type.addEventListener('change', maj);
      longueur.addEventListener('change', maj);
      hauteur.addEventListener('change', maj);
      // Porte entre deux pièces : ouverte ou fermée (températures avec le poêle)
      const murs = classerMurs(plan, ouverture.niveau);
      const interieure = ouverture.type === 'porte' && segmentsOuverture(ouverture).some((k) => murs.get(k)?.classe === 'interieur');
      const ouverte = panneau.querySelector<HTMLInputElement>('[data-f="ouverte"]')!;
      panneau.querySelector<HTMLElement>('[data-porte-interieure]')!.hidden = !interieure;
      ouverte.checked = ouverture.ouverte !== false;
      ouverte.addEventListener('change', () => modifier({ ...plan, ouvertures: plan.ouvertures.map((x) => (x.id === ouverture.id ? { ...x, ouverte: ouverte.checked } : x)) }));
      panneau.querySelector('[data-action="supprimer"]')!.addEventListener('click', supprimerSelection);
    } else if (emetteur) {
      rendreEmetteur(emetteur, calcul, simulation);
    } else if (selection?.genre === 'generateur' && plan.central.generateur !== 'aucun') {
      rendreChaudiere(calcul, simulation);
    } else if (escalier) {
      panneau.innerHTML = `
        <p class="font-display text-xl font-semibold">Escalier</p>
        <p class="text-ink-600" data-texte-escalier></p>
        <button type="button" data-action="supprimer" class="btn-secondary min-h-11 self-start text-danger-700">Supprimer l’escalier</button>`;
      panneau.querySelector('[data-texte-escalier]')!.textContent = `Trémie (ouverture dans le plancher) de ${m(escalier.w)} × ${m(escalier.h)}, entre ${niveauAvecArticle(escalier.niveau, plan.niveaux)} et ${niveauAvecArticle(escalier.niveau + 1, plan.niveaux)}. L’air chaud monte par cette ouverture.`;
      panneau.querySelector('[data-action="supprimer"]')!.addEventListener('click', supprimerSelection);
    } else {
      // Rien de sélectionné (étape du plan) : ce qu'il y a à faire, et la liste des pièces du niveau, utilisable au clavier
      const pieces = piecesDuNiveau(plan, niveau);
      panneau.innerHTML = `
        <div class="flex flex-col gap-1">
          <h2 class="font-display text-2xl font-semibold">Votre plan</h2>
          <p class="text-sm text-ink-600">Dessinez les pièces, puis posez les fenêtres et les portes sur les murs. Une case de la grille mesure 50 cm.</p>
        </div>
        <p class="text-sm font-bold" data-titre-liste></p>
        <p class="-mt-2 text-sm text-ink-600">${pieces.length ? 'Touchez une pièce sur le plan, ou choisissez-la ici :' : 'Aucune pièce pour l’instant : dessinez-en une avec l’outil « Pièce », ou ajoutez-la ici.'}</p>
        <ul class="flex flex-col gap-1.5 empty:hidden" data-liste-pieces></ul>
        <button type="button" data-action="ajouter" class="btn-secondary min-h-11 self-start">Ajouter une pièce de 4 × 4 m</button>`;
      panneau.querySelector('[data-titre-liste]')!.textContent = plan.niveaux > 1 ? `Pièces · ${nomDuNiveau(niveau)}` : 'Pièces';
      panneau.querySelector('[data-action="ajouter"]')!.addEventListener('click', ajouterPiece);
      const liste = panneau.querySelector<HTMLElement>('[data-liste-pieces]')!;
      for (const p of pieces) {
        const li = document.createElement('li');
        li.append(bouton(`${p.nom} · ${fmt(surface(p))} m²`, 'link-arrow', () => selectionner({ genre: 'piece', id: p.id }), `piece-${p.id}`));
        liste.append(li);
      }
    }
    // Retour au contenu de l'étape
    if (selection) {
      const retour = bouton(etape === 'plan' ? 'Toutes les pièces' : etape === 'maison' ? 'Toute la maison' : 'Tout le chauffage', 'inline-flex min-h-9 items-center gap-1 self-start rounded-full pr-3 text-sm font-bold text-ink-700 hover:text-ember-800', () => selectionner(null), 'retour-etape');
      retour.prepend('← ');
      panneau.prepend(retour);
    }
  }

  /** Modifie un poêle ou un radiateur. */
  const majEmetteur = (id: string, changements: Partial<Poele> | Partial<Radiateur>) =>
    modifier({ ...plan, emetteurs: plan.emetteurs.map((e) => (e.id === id ? ({ ...e, ...changements } as Emetteur) : e)) });
  /** Puissance proposée pour un radiateur : besoin de la pièce par grand froid, avec l'eau du chauffage central. */
  const puissanceConseillee = (pieceId: string, nature: Radiateur['nature'], calcul: Calcul) => {
    const besoin = calcul.pieces.find((r) => r.piece.id === pieceId)?.puissance ?? 1000;
    if (nature === 'electrique' || nature === 'split') return Math.max(100, Math.ceil(besoin / 100) * 100);
    const ecart = regulation.ecartDepartRetour[plan.central.generateur === 'pac' ? 'pac' : 'chaudiere'];
    const facteur = Math.pow(Math.max(plan.central.depart - ecart / 2 - parametres.tInterieure, 1) / 50, regulation.nRadiateur);
    return Math.min(10000, Math.max(100, Math.ceil(besoin / facteur / 100) * 100));
  };

  /** Détail de la chaudière ou de la pompe à chaleur : type, puissance, température de l'eau, ce qu'elle fournit. */
  function rendreChaudiere(calcul: Calcul, simulation: Simulation | null) {
    const c = plan.central;
    const pac = c.generateur === 'pac';
    panneau.innerHTML = `
      <div><p class="font-display text-2xl leading-tight font-semibold">${pac ? 'Pompe à chaleur' : 'Chaudière'}</p><p class="text-sm text-ink-600" data-sous-titre></p></div>
      <p class="rounded-2xl bg-ink-900 p-4 text-sm font-semibold text-white empty:hidden" data-resultat-emetteur></p>
      <label class="flex flex-col gap-1.5"><span class="text-sm font-bold">Type</span><select data-f="generateur" class="${champ}">${generateurs.filter((g) => g.value !== 'aucun').map((g) => `<option value="${g.value}">${g.label}</option>`).join('')}</select></label>
      <div class="grid grid-cols-2 gap-3">
        <label class="flex flex-col gap-1.5"><span class="text-sm font-bold">Puissance (kW)</span><input data-f="puissance-generateur" type="number" min="1" max="100" step="0.5" value="${c.puissance}" class="${champ}" /></label>
        <label class="flex flex-col gap-1.5"><span class="text-sm font-bold">Eau au départ par grand froid (°C)</span><input data-f="depart" type="number" min="30" max="90" step="1" value="${c.depart}" class="${champ}" /></label>
      </div>
      <p class="-mt-1 text-sm text-ink-600">Puissance proposée : le besoin de la maison par ${tBaseTexte}, arrondi au kW supérieur.${pac ? ` Sur les fiches des pompes à chaleur, comparez-la à la puissance « Prated », donnée pour ${degres(pacDonnees.tConceptionPrated)} en climat moyen.` : ''} L’eau au départ est un réglage de votre installation, moins chaude quand il fait plus doux (loi d’eau).</p>
      <div class="flex flex-wrap gap-x-4 gap-y-2" data-actions-emetteur></div>
      <button type="button" data-action="supprimer" class="btn-secondary min-h-11 self-start text-danger-700">Retirer ${pac ? 'la pompe à chaleur' : 'la chaudière'}</button>`;
    panneau.querySelector('[data-sous-titre]')!.textContent = c.piece ? `Dans « ${pieceDe(c.piece)?.nom ?? ''} »` : 'Pas encore posée sur le plan : outil « Chaudière ».';
    const aEau = plan.emetteurs.some((e) => e.genre === 'radiateur' && e.nature === 'eau');
    const tExt = conditions(calcul).tExterieure;
    panneau.querySelector('[data-resultat-emetteur]')!.textContent = !aEau
      ? 'Aucun radiateur à eau pour l’instant : posez-en avec l’outil « Radiateur », ou d’un coup dans chaque pièce.'
      : simulation
        ? `Par ${degres(tExt)} dehors, elle fournit ${kw(simulation.puissanceCentral)} aux radiateurs, avec une eau à ${degres(simulation.tEau ?? 0)} en moyenne${simulation.generateurLimite ? ` : avec ${fmt(c.puissance)} kW, elle est trop juste` : ''}.${tExt > parametres.tBase ? ` Par grand froid (${tBaseTexte}), il lui faudrait fournir ${kw(simulerGrandFroid(calcul).puissanceCentral)} : c’est ce chiffre qui fixe sa puissance.` : ''}`
        : '';
    const type = panneau.querySelector<HTMLSelectElement>('[data-f="generateur"]')!;
    type.value = c.generateur;
    type.addEventListener('change', () => modifier({ ...plan, central: { ...plan.central, generateur: type.value as typeof c.generateur } }));
    for (const [cle, champ2, min, max] of [['puissance-generateur', 'puissance', 1, 100], ['depart', 'depart', 30, 90]] as const) {
      const input = panneau.querySelector<HTMLInputElement>(`[data-f="${cle}"]`)!;
      input.addEventListener('change', () => {
        const v = Number(input.value);
        if (!Number.isFinite(v) || input.value === '') return rendrePanneau(calcul, simulation);
        modifier({ ...plan, central: { ...plan.central, [champ2]: borne(v, min, max) } });
      });
    }
    const propose = puissanceProposee();
    const actions = panneau.querySelector('[data-actions-emetteur]')!;
    if (propose !== c.puissance) actions.append(bouton(`Ajuster au besoin de la maison (${propose} kW)`, 'link-arrow', () => modifier({ ...plan, central: { ...plan.central, puissance: propose } }), 'ajuster-generateur'));
    actions.append(bouton('Mettre un radiateur dans chaque pièce', 'link-arrow', radiateursPartout, 'radiateurs-partout-detail'));
    panneau.querySelector('[data-action="supprimer"]')!.addEventListener('click', supprimerSelection);
  }

  function rendreEmetteur(e: Emetteur, calcul: Calcul, simulation: Simulation | null) {
    const nomPiece = pieceDe(e.piece)?.nom ?? '';
    const nombre = (cle: string, libelle: string, valeur: number, min: number, max: number, pas: number) =>
      `<label class="flex flex-col gap-1.5"><span class="text-sm font-bold" data-lib="${cle}">${libelle}</span><input data-f="${cle}" type="number" min="${min}" max="${max}" step="${pas}" value="${valeur}" class="${champ}" /></label>`;
    const choix = (cle: string, options: { value: string; label: string }[]) =>
      `<label class="flex flex-col gap-1.5"><span class="text-sm font-bold">Type</span><select data-f="${cle}" class="${champ}">${options.map((o) => `<option value="${o.value}">${o.label}</option>`).join('')}</select></label>`;
    const tExt = conditions(calcul).tExterieure;
    if (e.genre === 'poele') {
      panneau.innerHTML = `
        <div><p class="font-display text-2xl leading-tight font-semibold">Poêle</p><p class="text-sm text-ink-600" data-sous-titre></p></div>
        <p class="rounded-2xl bg-ink-900 p-4 text-sm font-semibold text-white empty:hidden" data-resultat-emetteur></p>
        ${choix('nature-poele', naturesPoele)}
        <div class="grid grid-cols-2 gap-3">
          ${nombre('puissance-poele', 'Puissance (kW)', e.puissance, 1, 30, 0.5)}
          ${e.nature === 'hydro' ? nombre('part-eau', 'Part à l’eau (%)', e.partEau, 50, 95, 5) : nombre('consigne-poele', e.nature === 'bois' ? 'Température visée (°C)' : 'Réglé à (°C)', e.consigne, 10, 28, 0.5)}
          ${e.nature === 'hydro' ? nombre('depart-hydro', 'Eau au départ par grand froid (°C)', plan.central.depart, 30, 90, 1) : ''}
        </div>
        <p class="-mt-1 text-sm text-ink-600" data-aide-bois ${e.nature === 'bois' ? '' : 'hidden'}>Un poêle à bois n’a pas de thermostat : le calcul suppose que vous réglez l’allure du feu pour garder cette température en moyenne.</p>
        <p class="-mt-1 text-sm text-ink-600" ${e.nature === 'hydro' ? '' : 'hidden'}>Un poêle hydro chauffe l’eau des radiateurs : il brûle ce que les radiateurs demandent, et sa pièce reçoit le reste de sa chaleur. Environ 80 % de sa puissance va à l’eau sur les fiches des fabricants. L’eau est moins chaude quand il fait plus doux (loi d’eau).</p>
        <fieldset class="flex flex-col gap-2 rounded-2xl border border-ink-200 p-3" ${e.nature === 'canalisable' ? '' : 'hidden'}>
          <legend class="px-1 text-sm font-bold">Gaines vers</legend>
          <div class="flex flex-wrap gap-2" data-gaines-pieces></div>
          ${nombre('part-gaines', 'Part de la puissance envoyée dans les gaines (%)', e.partGaines, 0, 80, 5)}
          <span class="text-xs text-ink-500">Réglage à adapter au modèle : selon les poêles, une ou deux sorties de gaines, réglables séparément ou non.</span>
        </fieldset>
        <button type="button" data-action="supprimer" class="btn-secondary min-h-11 self-start text-danger-700">Supprimer le poêle</button>`;
      panneau.querySelector('[data-sous-titre]')!.textContent = `Dans « ${nomPiece} »`;
      panneau.querySelector('[data-resultat-emetteur]')!.textContent = simulation ? textePoele(e, simulation, tExt) : '';
      const nature = panneau.querySelector<HTMLSelectElement>('[data-f="nature-poele"]')!;
      nature.value = e.nature;
      nature.addEventListener('change', () => majEmetteur(e.id, { nature: nature.value as Poele['nature'] }));
      const num = (cle: string, champ2: 'puissance' | 'consigne' | 'partGaines' | 'partEau', min: number, max: number) => {
        const input = panneau.querySelector<HTMLInputElement>(`[data-f="${cle}"]`);
        input?.addEventListener('change', () => {
          const v = Number(input.value);
          if (!Number.isFinite(v) || input.value === '') return rendrePanneau(calcul, simulation);
          majEmetteur(e.id, { [champ2]: borne(v, min, max) });
        });
      };
      num('puissance-poele', 'puissance', 1, 30);
      num('consigne-poele', 'consigne', 10, 28);
      num('part-gaines', 'partGaines', 0, 80);
      num('part-eau', 'partEau', 50, 95);
      // Température de l'eau : réglage du circuit, commun avec la chaudière
      const depart = panneau.querySelector<HTMLInputElement>('[data-f="depart-hydro"]');
      depart?.addEventListener('change', () => {
        const v = Number(depart.value);
        if (!Number.isFinite(v) || depart.value === '') return rendrePanneau(calcul, simulation);
        modifier({ ...plan, central: { ...plan.central, depart: borne(v, 30, 90) } });
      });
      const gaines = panneau.querySelector<HTMLElement>('[data-gaines-pieces]')!;
      for (const r of calcul.pieces.filter((x) => x.piece.id !== e.piece)) {
        const label = document.createElement('label');
        label.className = 'inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-ink-300 bg-white px-3 text-sm font-semibold has-checked:border-ember-600 has-checked:bg-ember-100';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.dataset.gaine = r.piece.id;
        input.className = 'size-4 accent-ember-600';
        input.checked = e.gaines.includes(r.piece.id);
        input.addEventListener('change', () => majEmetteur(e.id, { gaines: input.checked ? [...e.gaines, r.piece.id] : e.gaines.filter((id) => id !== r.piece.id) }));
        label.append(input, document.createTextNode(nomAvecNiveau(r.piece)));
        gaines.append(label);
      }
    } else {
      const eau = e.nature === 'eau';
      panneau.innerHTML = `
        <div><p class="font-display text-2xl leading-tight font-semibold">${e.nature === 'split' ? 'PAC air/air' : 'Radiateur'}</p><p class="text-sm text-ink-600" data-sous-titre></p></div>
        <p class="rounded-2xl bg-ink-900 p-4 text-sm font-semibold text-white empty:hidden" data-resultat-emetteur></p>
        ${choix('nature-radiateur', naturesRadiateur)}
        <div class="grid grid-cols-2 gap-3">
          ${nombre('puissance-radiateur', eau ? 'Puissance nominale (W)' : e.nature === 'split' ? 'Puissance à −10 °C (W)' : 'Puissance (W)', e.puissance, 100, 10000, 50)}
          ${nombre('consigne-radiateur', 'Réglé à (°C)', e.consigne, 10, 28, 0.5)}
        </div>
        <p class="-mt-1 text-sm text-ink-600">${
          eau
            ? 'Puissance donnée par le fabricant pour une eau à 75 °C (régime 75/65/20 de la norme EN 442). Le robinet thermostatique limite la chaleur au réglage.'
            : e.nature === 'split'
              ? 'Unité intérieure murale : elle souffle de l’air chaud et suit son réglage. Prenez sur la fiche la puissance de chauffage « Pdesignh », donnée pour −10 °C dehors (climat moyen, règlement 206/2012) : la puissance mise en avant, mesurée par temps plus doux, est souvent plus élevée. Le calcul garde cette puissance quel que soit le temps.'
              : 'Puissance de l’appareil. Son thermostat limite la chaleur au réglage.'
        }</p>
        <div class="flex flex-wrap gap-x-4 gap-y-2" data-actions-emetteur></div>
        <button type="button" data-action="supprimer" class="btn-secondary min-h-11 self-start text-danger-700">Supprimer ${e.nature === 'split' ? 'l’unité' : 'le radiateur'}</button>`;
      panneau.querySelector('[data-sous-titre]')!.textContent = `Dans « ${nomPiece} »`;
      const r = simulation?.emetteurs.get(e.id);
      const tPiece = simulation?.temperatures.get(e.piece);
      let resultat = '';
      if (eau && !aChauffageEau(plan)) resultat = messageSansEau;
      else if (r && simulation && tPiece !== undefined) {
        // L'unité de PAC air/air est au féminin
        const il = e.nature === 'split' ? 'elle' : 'il';
        resultat = `Par ${degres(tExt)} dehors, ${il} fournit ${watts(r.puissance)}${r.capacite !== undefined ? ` sur ${watts(r.capacite)} possibles` : ''}${eau && simulation.tEau !== null ? ` avec une eau à ${degres(simulation.tEau)}` : ''}.`;
        if (radiateurAFond(e, simulation))
          resultat += eau
            ? ` Il est à fond et la pièce reste à ${degres(tPiece)} : ses ${watts(e.puissance)} sont donnés pour une eau à 75 °C, et l’eau n’est qu’à ${degres(simulation.tEau ?? 0)} par ce temps. Pour plus de chaleur : un radiateur plus grand, ou une eau plus chaude (réglage de la chaudière).`
            : ` ${il === 'elle' ? 'Elle' : 'Il'} est à fond et la pièce reste à ${degres(tPiece)} : il faudrait ${e.nature === 'split' ? 'une unité' : 'un radiateur'} plus puissant${e.nature === 'split' ? 'e' : ''}.`;
      }
      panneau.querySelector('[data-resultat-emetteur]')!.textContent = resultat;
      const nature = panneau.querySelector<HTMLSelectElement>('[data-f="nature-radiateur"]')!;
      nature.value = e.nature;
      nature.addEventListener('change', () => majEmetteur(e.id, { nature: nature.value as Radiateur['nature'] }));
      for (const [cle, champ2, min, max] of [['puissance-radiateur', 'puissance', 100, 10000], ['consigne-radiateur', 'consigne', 10, 28]] as const) {
        const input = panneau.querySelector<HTMLInputElement>(`[data-f="${cle}"]`)!;
        input.addEventListener('change', () => {
          const v = Number(input.value);
          if (!Number.isFinite(v) || input.value === '') return rendrePanneau(calcul, simulation);
          majEmetteur(e.id, { [champ2]: borne(v, min, max) });
        });
      }
      panneau.querySelector('[data-actions-emetteur]')!.append(
        bouton('Ajuster au besoin de la pièce', 'link-arrow', () => majEmetteur(e.id, { puissance: puissanceConseillee(e.piece, e.nature, calcul) }), 'ajuster-radiateur'),
      );
    }
    panneau.querySelector('[data-action="supprimer"]')!.addEventListener('click', supprimerSelection);
  }

  // --- Bilan ------------------------------------------------------------------------------------------------------
  function rendreRecap(calcul: Calcul) {
    const r = recapitulatif(plan, lireEnveloppe().hauteur);
    recap.innerHTML = `
      <div class="rounded-2xl bg-ink-900 p-4 text-ink-100">
        <p class="text-sm text-ember-300">Puissance de chauffage de la maison</p>
        <p class="font-display text-4xl font-semibold text-white" data-total></p>
        <p class="mt-1 text-sm text-ink-300" data-recap-detail></p>
      </div>
      <div class="mt-4 overflow-x-auto rounded-2xl border border-ink-200">
        <table class="w-full text-left text-sm">
          <thead class="bg-ink-100"><tr><th scope="col" class="px-3 py-2">Pièce</th><th scope="col" class="px-3 py-2">Surface</th><th scope="col" class="px-3 py-2">Puissance</th><th scope="col" class="px-3 py-2">Radiateur PAC</th></tr></thead>
        </table>
      </div>
      <p class="mt-2 text-xs text-ink-500">Radiateur PAC : puissance nominale (à 75 °C) d’un radiateur qui suffirait avec une eau à 55 °C, régime d’une pompe à chaleur classique. Touchez le nom d’une pièce pour voir d’où viennent ses pertes, à l’étape « Maison ».</p>
      <dl class="mt-4 grid grid-cols-2 gap-2 text-sm" data-mesures></dl>`;
    recap.querySelector('[data-total]')!.textContent = kw(calcul.puissance);
    recap.querySelector('[data-recap-detail]')!.textContent = `${fmt(calcul.surfaceChauffee)} m² chauffés, soit ${fmt(calcul.surfaceChauffee ? calcul.puissance / calcul.surfaceChauffee : 0)} W par m², pour ${parametres.tInterieure} °C par ${tBaseTexte} dehors.`;
    const table = recap.querySelector('table')!;
    for (let n = 0; n < plan.niveaux; n++) {
      const tbody = document.createElement('tbody');
      if (plan.niveaux > 1) {
        const tr = document.createElement('tr');
        const th = document.createElement('th');
        th.colSpan = 4;
        th.scope = 'colgroup';
        th.className = 'bg-ink-50 px-3 py-1.5 text-xs font-bold tracking-wide text-ink-600 uppercase';
        th.textContent = nomDuNiveau(n);
        tr.append(th);
        tbody.append(tr);
      }
      for (const x of calcul.pieces.filter((y) => y.piece.niveau === n)) {
        const tr = document.createElement('tr');
        tr.className = 'border-t border-ink-100';
        const th = document.createElement('th');
        th.scope = 'row';
        th.className = 'px-3 py-2';
        th.append(
          bouton(x.piece.nom, 'text-left font-semibold text-ember-800 underline underline-offset-2', () => {
            niveau = x.piece.niveau;
            choisirEtape('maison');
            selectionner({ genre: 'piece', id: x.piece.id });
          }, `bilan-${x.piece.id}`),
        );
        tr.append(th);
        for (const texte of [`${fmt(x.surface)} m²`, watts(x.puissance), watts(radiateurPourPac(x.puissance))]) {
          const td = document.createElement('td');
          td.className = 'px-3 py-2 tabular-nums';
          td.textContent = texte;
          tr.append(td);
        }
        tbody.append(tr);
      }
      table.append(tbody);
    }
    const mesures = recap.querySelector('[data-mesures]')!;
    for (const [k, v] of [
      ['Murs extérieurs', `${fmt(r.murExterieur)} m`],
      ['Vitrages (largeur)', `${fmt(r.largeurVitree)} m`],
      ['Murs mitoyens', `${fmt(r.murMitoyen)} m`],
      ['Vers non chauffé', `${fmt(r.murNonChauffe)} m`],
    ]) {
      const div = document.createElement('div');
      div.className = 'rounded-xl bg-ink-50 p-2.5';
      div.innerHTML = '<dt class="text-ink-600"></dt><dd class="font-semibold tabular-nums"></dd>';
      div.querySelector('dt')!.textContent = k;
      div.querySelector('dd')!.textContent = v;
      mesures.append(div);
    }
  }

  // --- Dimensionnement des radiateurs (étape Résultat) --------------------------------------------------------------
  const champDim = (nom: string) => formDim.elements.namedItem(nom) as HTMLSelectElement;
  const gammeDim = () => gammesRadiateurs.find((g) => g.id === champDim('gamme').value) ?? gammesRadiateurs[0];
  const cm = (mm: number) => `${fmt(mm / 10)} cm`;
  /** Épaisseurs et hauteurs du modèle choisi ; on garde le choix précédent s'il existe encore, sinon le plus proche. */
  function majOptionsDim(prefere: { variante?: unknown; hauteur?: unknown } = {}) {
    const g = gammeDim();
    const variante = champDim('variante');
    const avantV = String(prefere.variante ?? variante.value);
    const variantes = g.variantes.filter((v) => g.modeles.some((x) => x.variante === v.id));
    variante.replaceChildren(...variantes.map((v) => new Option(v.label, v.id)));
    // Sinon, l'épaisseur la plus courante : 4 colonnes, ou panneau de type 22
    variante.value = (variantes.find((v) => v.id === avantV) ?? variantes.find((v) => v.id === '4' || v.id === '22') ?? variantes[0]).id;
    const hauteur = champDim('hauteur');
    const avantH = Number(prefere.hauteur ?? hauteur.value) || 600;
    const hauteurs = g.modeles.filter((x) => x.variante === variante.value).map((x) => x.hauteur);
    hauteur.replaceChildren(...hauteurs.map((h) => new Option(cm(h), String(h))));
    hauteur.value = String(hauteurs.reduce((a, b) => (Math.abs(b - avantH) < Math.abs(a - avantH) ? b : a), hauteurs[0]));
  }
  /** Départ proposé le plus proche d'une température d'eau. */
  function caleDepartDim(voulu: number) {
    const departs = [...champDim('depart').options].map((o) => Number(o.value));
    champDim('depart').value = String(departs.reduce((a, b) => (Math.abs(b - voulu) < Math.abs(a - voulu) ? b : a), departs[0]));
  }
  /** Ce qu'il faut du modèle choisi pour une puissance nominale (ΔT 50) : éléments ou longueur, en un ou plusieurs radiateurs. */
  function quantiteDim(p50: number) {
    const g = gammeDim();
    const modele = g.modeles.find((x) => x.variante === champDim('variante').value && x.hauteur === Number(champDim('hauteur').value)) ?? g.modeles[0];
    if (g.mesure === 'elements') {
      const n = Math.max(1, Math.ceil(p50 / modele.puissance));
      const longueur = (k: number) => k * (modele.pas ?? 50) + (g.ajout ?? 0);
      const radiateurs = Math.ceil(longueur(n) / g.longueurMax);
      const parRadiateur = Math.ceil(n / radiateurs);
      return {
        texte: radiateurs > 1 ? `${radiateurs} × ${parRadiateur} éléments` : `${n} élément${n > 1 ? 's' : ''}`,
        detail: `${radiateurs > 1 ? 'chacun ' : ''}${fmt(longueur(parRadiateur) / 1000)} m de long`,
        radiateurs,
        elements: parRadiateur,
        longueur: longueur(parRadiateur),
        pas: modele.pas ?? 50,
        total: radiateurs * parRadiateur,
      };
    }
    const mm = (p50 / modele.puissance) * 1000;
    const radiateurs = Math.max(1, Math.ceil(mm / g.longueurMax));
    const parRadiateur = Math.max(LONGUEUR_MIN_PANNEAU, Math.ceil(mm / radiateurs / PAS_LONGUEUR_PANNEAU) * PAS_LONGUEUR_PANNEAU);
    return {
      texte: `${radiateurs > 1 ? `${radiateurs} × ` : ''}${fmt(parRadiateur / 1000)} m`,
      detail: `${radiateurs > 1 ? 'panneaux' : 'panneau'} de ${cm(Number(champDim('hauteur').value))} de haut`,
      radiateurs,
      elements: 0,
      longueur: parRadiateur,
      pas: 0,
      total: radiateurs * parRadiateur,
    };
  }
  /** Température moyenne de l'eau par grand froid et facteur d'émission par rapport au régime nominal (ΔT 50). */
  const regimeDim = () => {
    const ecart = regulation.ecartDepartRetour[plan.central.generateur === 'pac' ? 'pac' : 'chaudiere'];
    const tEau = Number(champDim('depart').value) - ecart / 2;
    return { tEau, facteur: Math.pow(Math.max(tEau - parametres.tInterieure, 1) / 50, regulation.nRadiateur) };
  };
  /**
   * Radiateur dessiné à l'échelle (même échelle pour toutes les pièces : 2 m de large) : ses éléments, ou un panneau.
   */
  function dessinRadiateurDim(q: ReturnType<typeof quantiteDim>, hauteur: number) {
    const k = 0.11; // px par mm
    const h = hauteur * k;
    const svgDim = document.createElementNS(NS, 'svg') as SVGSVGElement;
    svgDim.setAttribute('viewBox', `0 0 250 ${h + 22}`);
    svgDim.setAttribute('class', 'block w-full');
    svgDim.setAttribute('aria-hidden', 'true');
    const x0 = 4;
    if (q.elements) {
      const w = q.pas * k;
      for (let i = 0; i < q.elements; i++) svgDim.append(el('rect', { x: x0 + i * w + 0.4, y: 4, width: Math.max(w - 0.8, 0.6), height: h, rx: Math.min(2, w / 3), fill: 'var(--color-ink-100)', stroke: 'var(--color-ink-500)', 'stroke-width': 0.6 }));
    } else {
      const w = q.longueur * k;
      svgDim.append(el('rect', { x: x0, y: 4, width: w, height: h, rx: 2, fill: 'var(--color-ink-100)', stroke: 'var(--color-ink-500)', 'stroke-width': 0.8 }));
      for (let y = 4 + h / 6; y < 4 + h; y += h / 6) svgDim.append(el('line', { x1: x0 + 3, y1: y, x2: x0 + w - 3, y2: y, stroke: 'var(--color-ink-300)', 'stroke-width': 0.6 }));
    }
    const largeur = q.longueur * k;
    // Cote : longueur d'un radiateur, et nombre de radiateurs
    svgDim.append(el('line', { x1: x0, y1: h + 12, x2: x0 + largeur, y2: h + 12, stroke: 'var(--color-ink-400)', 'stroke-width': 0.6 }));
    svgDim.append(el('text', { x: x0 + largeur / 2, y: h + 21, 'text-anchor': 'middle', 'font-size': 9, fill: 'var(--color-ink-600)' }, `${fmt(q.longueur / 1000)} m`));
    if (q.radiateurs > 1) svgDim.append(el('text', { x: x0 + largeur + 8, y: 4 + h / 2 + 5, 'font-size': 14, 'font-weight': 700, fill: 'var(--color-ink-800)' }, `× ${q.radiateurs}`));
    return svgDim;
  }
  function rendreDimensionnement(calcul: Calcul) {
    const { tEau, facteur } = regimeDim();
    const g = gammeDim();
    const hauteur = Number(champDim('hauteur').value);
    const lignes = calcul.pieces.map((r) => ({ r, p50: r.puissance / facteur, q: quantiteDim(r.puissance / facteur) }));
    // Récapitulatif : puissance nominale, éléments ou longueur au total, radiateurs
    const total = $('[data-dim-total]');
    const bloc = (titre: string, valeur: string, detail: string) => {
      const div = document.createElement('div');
      div.append(
        Object.assign(document.createElement('p'), { className: 'text-sm text-ember-300', textContent: titre }),
        Object.assign(document.createElement('p'), { className: 'font-display text-3xl font-semibold text-white', textContent: valeur }),
        Object.assign(document.createElement('p'), { className: 'text-sm', textContent: detail }),
      );
      return div;
    };
    const nbRadiateurs = lignes.reduce((s2, l) => s2 + l.q.radiateurs, 0);
    const variante = g.variantes.find((v) => v.id === champDim('variante').value)?.label ?? '';
    total.replaceChildren(
      bloc('Puissance nominale à installer', kw(lignes.reduce((s2, l) => s2 + l.p50, 0)), `à 75/65 °C, pour ${kw(calcul.puissance)} de besoin par grand froid`),
      g.mesure === 'elements'
        ? bloc('Éléments au total', String(lignes.reduce((s2, l) => s2 + l.q.total, 0)), `${nbRadiateurs} radiateur${nbRadiateurs > 1 ? 's' : ''}, ${variante}, ${cm(hauteur)} de haut`)
        : bloc('Longueur totale', `${fmt(lignes.reduce((s2, l) => s2 + l.q.total, 0) / 1000)} m`, `${nbRadiateurs} radiateur${nbRadiateurs > 1 ? 's' : ''}, ${variante}, ${cm(hauteur)} de haut`),
      bloc('Eau dans les radiateurs', degres(tEau), `en moyenne par grand froid, départ à ${champDim('depart').value} °C`),
    );
    // Une carte par pièce
    const cartes = $('[data-dim-cartes]');
    cartes.replaceChildren(
      ...lignes.map(({ r, p50, q }) => {
        const li = document.createElement('li');
        li.className = 'flex flex-col gap-2 rounded-2xl border border-ink-200 p-4';
        const tete = document.createElement('div');
        tete.className = 'flex items-baseline justify-between gap-2';
        tete.append(
          Object.assign(document.createElement('h3'), { className: 'min-w-0 truncate font-bold', textContent: nomAvecNiveau(r.piece) }),
          Object.assign(document.createElement('span'), { className: 'shrink-0 text-sm text-ink-600 tabular-nums', textContent: `besoin ${watts(r.puissance)}` }),
        );
        // Radiateurs à eau déjà posés dans la pièce : leur puissance nominale suffit-elle ?
        const poses = plan.emetteurs.filter((e): e is Radiateur => e.genre === 'radiateur' && e.nature === 'eau' && e.piece === r.piece.id).reduce((s2, e) => s2 + e.puissance, 0);
        const ok = poses >= p50 * 0.98;
        li.append(
          tete,
          dessinRadiateurDim(q, hauteur),
          Object.assign(document.createElement('p'), { className: 'font-display text-2xl font-semibold', textContent: q.texte }),
          Object.assign(document.createElement('p'), { className: 'text-sm text-ink-600', textContent: `${q.detail} · ${watts(p50)} à 75/65 °C` }),
          Object.assign(document.createElement('p'), {
            className: `text-sm font-semibold ${!poses ? 'text-ink-500' : ok ? 'text-moss-700' : 'text-danger-700'}`,
            textContent: !poses ? 'Pas de radiateur à eau sur le plan.' : `Sur le plan : ${watts(poses)} à 75/65 °C, ${ok ? 'suffisant' : 'trop juste'}.`,
          }),
        );
        return li;
      }),
    );
    const note = $('[data-dim-note]');
    note.textContent = `Puissances du catalogue au régime 75/65/20 °C (EN 442), ramenées à une eau à ${degres(tEau)} en moyenne et ${parametres.tInterieure} °C dans la pièce, arrondies à l’élément ${g.mesure === 'elements' ? '' : '(ou aux 10 cm) '}au-dessus ; au-delà de ${fmt(g.longueurMax / 1000)} m, plusieurs radiateurs. Dessins à l’échelle. Estimation à confirmer lors de l’étude chez vous. Source : `;
    note.append(Object.assign(document.createElement('a'), { href: g.source.url, textContent: g.source.label, className: 'underline underline-offset-2', target: '_blank', rel: 'noopener' }), '.');
  }
  /** Ligne du résumé de la demande : le modèle choisi et ce qu'il faudrait dans chaque pièce. */
  function texteDimensionnement(calcul: Calcul) {
    const g = gammeDim();
    const { facteur } = regimeDim();
    const variante = g.variantes.find((v) => v.id === champDim('variante').value)?.label ?? '';
    return `Radiateurs à eau, dimensionnement indicatif (${g.label}, ${variante}, ${cm(Number(champDim('hauteur').value))} de haut, départ à ${champDim('depart').value} °C par grand froid) : ${calcul.pieces.map((r) => `${nomAvecNiveau(r.piece)} ${quantiteDim(r.puissance / facteur).texte}`).join(', ')}.`;
  }

  {
    // Réglages enregistrés ; sinon fonte Néo-Classic, et l'eau du chauffage du plan (au départ proposé le plus proche)
    const enregistre = objet(lu?.dimensionnement) ?? {};
    remplir(formDim, { gamme: enregistre.gamme ?? 'neo-classic' });
    majOptionsDim({ variante: enregistre.variante ?? '4', hauteur: enregistre.hauteur ?? 610 });
    caleDepartDim(Number(enregistre.depart) || (aChauffageEau(plan) ? plan.central.depart : 70));
  }
  formDim.addEventListener('change', (ev) => {
    const nom = (ev.target as HTMLSelectElement).name;
    if (nom === 'gamme' || nom === 'variante') majOptionsDim();
    rendre();
  });
  formDim.addEventListener('submit', (ev) => ev.preventDefault());

  // --- Demande d'étude ---------------------------------------------------------------------------------------------
  /** Résumé écrit du plan, joint à la demande d'étude, et projet proposé par défaut. */
  let noteDemande = '';
  let projetDemande = 'granules';
  function preparerDemande(calcul: Calcul, jour: Jour | null) {
    const d = new FormData(enveloppe);
    const isolant = (nom: string, epaisseur: string) =>
      d.get(nom) === 'aucun' ? 'sans isolant' : d.get(nom) === 'inconnu' ? 'isolé, isolant non précisé' : `isolant ${libelle(enveloppe, nom)} ${d.get(epaisseur)} cm`;
    const lignes = [
      `Plan dessiné en ligne (${plan.niveaux > 1 ? `${plan.niveaux} niveaux` : 'plain-pied'}, haut du plan vers le ${directions[plan.nord]}) : ${fmt(calcul.surfaceChauffee)} m² chauffés, besoin estimé ${kw(calcul.puissance)} par ${tBaseTexte}.`,
      `Pièces : ${calcul.pieces.map((x) => `${nomAvecNiveau(x.piece)} ${fmt(x.surface)} m² ${watts(x.puissance)}`).join(', ')}.`,
      `Construction : ${libelle(enveloppe, 'annee')}, ${fmt(lireEnveloppe().hauteur)} m sous plafond. Murs : ${libelle(enveloppe, 'murMatiere')} de ${d.get('murEpaisseur')} cm, ${isolant('murIsolant', 'murIsolantEpaisseur')}. Plafond : ${libelle(enveloppe, 'plafond')}, ${isolant('plafondIsolant', 'plafondIsolantEpaisseur')}. Plancher : ${libelle(enveloppe, 'plancher')}, ${isolant('plancherIsolant', 'plancherIsolantEpaisseur')}.${plan.niveaux > 1 ? ` Entre les étages : ${libelle(enveloppe, 'plancherIntermediaire')}.` : ''} Fenêtres : ${libelle(enveloppe, 'vitrage')}. Ventilation : ${libelle(enveloppe, 'ventilation')}.`,
    ];
    const lesPoeles = plan.emetteurs.filter((e): e is Poele => e.genre === 'poele');
    for (const e of lesPoeles) {
      const gaines = e.nature === 'canalisable' ? e.gaines.map((id) => pieceDe(id)?.nom).filter(Boolean) : [];
      lignes.push(`Poêle : ${nomEmetteur(e)}, ${e.nature === 'hydro' ? `${e.partEau} % de sa puissance à l’eau des radiateurs` : `réglé à ${fmt(e.consigne)} °C`}${gaines.length ? `, gaines vers ${gaines.join(', ')} (${e.partGaines} %)` : ''}.`);
    }
    const lesRadiateurs = plan.emetteurs.filter((e): e is Radiateur => e.genre === 'radiateur');
    if (lesRadiateurs.length)
      lignes.push(`Radiateurs : ${lesRadiateurs.map((e) => `${nomEmetteur(e)} (réglé à ${fmt(e.consigne)} °C)`).join(' ; ')}.`);
    if (plan.central.generateur !== 'aucun')
      lignes.push(`Chauffage central : ${plan.central.generateur === 'pac' ? 'pompe à chaleur' : 'chaudière'} de ${fmt(plan.central.puissance)} kW, eau à ${fmt(plan.central.depart)} °C au départ par grand froid.`);
    if (jour)
      lignes.push(
        `Températures moyennes estimées par ${degres(conditions(calcul).tExterieure)} dehors : ${calcul.pieces
          .map((x) => {
            const a = jour.temperatures.get(x.piece.id) ?? [0];
            return `${nomAvecNiveau(x.piece)} ${degres(moyenne(a))} (${degres(Math.min(...a))} à ${degres(Math.max(...a))})`;
          })
          .join(', ')}.`,
      );
    if (calcul.pieces.length) lignes.push(texteDimensionnement(calcul));
    noteDemande = lignes.join('\n').slice(0, 3000);
    // Projet proposé : le premier poêle, sinon le générateur du chauffage central
    const avecSplit = plan.emetteurs.some((e) => e.genre === 'radiateur' && e.nature === 'split');
    projetDemande = lesPoeles.length ? (lesPoeles[0].nature === 'bois' ? 'bois' : 'granules') : plan.central.generateur === 'pac' || avecSplit ? 'pac' : plan.central.generateur === 'chaudiere' ? 'chaudiere' : 'granules';
  }

  // --- Export en image (pièces jointes de la demande, téléchargement) ----------------------------------------------
  const resoudreCouleurs = (texte: string) => {
    const styles = getComputedStyle(document.documentElement);
    return texte.replace(/var\((--[\w-]+)\)/g, (_, nom: string) => styles.getPropertyValue(nom).trim() || '#000');
  };
  /** Image PNG d'un niveau, avec son titre, prête à joindre ou à télécharger. */
  async function imageNiveau(n: number): Promise<Blob | null> {
    const pieces = piecesDuNiveau(plan, n);
    if (!pieces.length) return null;
    const e = { x: Math.min(...pieces.map((p) => p.x)), y: Math.min(...pieces.map((p) => p.y)), w: 0, h: 0 };
    e.w = Math.max(...pieces.map((p) => p.x + p.w)) - e.x;
    e.h = Math.max(...pieces.map((p) => p.y + p.h)) - e.y;
    const marge = 3;
    const vb = { x: e.x - marge, y: e.y - marge - 2, w: Math.max(e.w + 2 * marge, 24), h: e.h + 2 * marge + 2 };
    const cible = document.createElementNS(NS, 'svg') as SVGSVGElement;
    cible.setAttribute('xmlns', NS);
    cible.setAttribute('viewBox', `${vb.x} ${vb.y} ${vb.w} ${vb.h}`);
    const largeur = 1600;
    const hauteur = Math.round((largeur * vb.h) / vb.w);
    cible.setAttribute('width', String(largeur));
    cible.setAttribute('height', String(hauteur));
    cible.setAttribute('font-family', 'Figtree, Arial, sans-serif');
    cible.append(el('rect', { x: vb.x, y: vb.y, width: vb.w, height: vb.h, fill: '#fffbf6' }));
    const calcul = calculer();
    const avecTemperatures = temperaturesVisibles();
    const jourImage = avecTemperatures ? simulerJournee(calcul) : null;
    dessinerNiveau(cible, n, { interactif: false, calcul, temps: jourImage ? tempsAffichees(jourImage) : null, etiquettes: jourImage ? etiquettesAppareils(jourImage, simuler(calcul)) : null });
    const tExt = conditions(calcul).tExterieure;
    const titre = `${nomDuNiveau(n)} · ${avecTemperatures ? `températures moyennes par ${degres(tExt)} dehors` : `puissance nécessaire par ${tBaseTexte} dehors`} · haut du plan : ${directions[plan.nord]}`;
    cible.append(el('text', { x: vb.x + 1, y: vb.y + 1.6, 'font-size': Math.min(1.1, (vb.w - 2) / (titre.length * 0.55)), 'font-weight': 700, fill: 'var(--color-ink-900)' }, titre));
    // Les puissances des appareils dépendent du temps qu'il fait : on le dit sous le titre
    if (avecTemperatures) {
      const legende = `À côté de chaque appareil : puissance moyenne fournie par ${degres(tExt)} dehors ; en rouge, appareil à fond. La puissance à prévoir se lit par grand froid (${tBaseTexte}).`;
      cible.append(el('text', { x: vb.x + 1, y: vb.y + 2.7, 'font-size': Math.min(0.62, (vb.w - 2) / (legende.length * 0.5)), fill: 'var(--color-ink-700)' }, legende));
    }
    const source = resoudreCouleurs(new XMLSerializer().serializeToString(cible));
    const image = new Image();
    image.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(source)}`;
    await image.decode();
    const canvas = document.createElement('canvas');
    canvas.width = largeur;
    canvas.height = hauteur;
    canvas.getContext('2d')!.drawImage(image, 0, 0);
    return new Promise((ok) => canvas.toBlob(ok, 'image/png'));
  }
  const nomFichier = (n: number) => `plan-${nomDuNiveau(n).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-')}.png`;
  // --- Envoi du plan pour une étude (dans l'outil) ------------------------------------------------------------------
  const formEnvoi = $<HTMLFormElement>('[data-envoi-form]');
  const erreurEnvoi = $('[data-envoi-erreur]');
  const boutonEnvoi = $<HTMLButtonElement>('[data-envoi-bouton]');
  let imagesEnvoi: File[] = [];
  let apercusEnvoi: string[] = [];
  async function ouvrirEnvoi() {
    if (!plan.pieces.length) return signaler('Le plan est vide : dessinez au moins une pièce, ou partez d’un modèle.');
    fermerMenu();
    $('[data-envoi-formulaire]').hidden = false;
    $('[data-envoi-merci]').hidden = true;
    erreurEnvoi.hidden = true;
    $('[data-envoi-resume]').textContent = noteDemande;
    const projet = formEnvoi.elements.namedItem('project') as HTMLSelectElement;
    projet.value = projetDemande;
    const conteneur = $('[data-envoi-images]');
    const attente = document.createElement('p');
    attente.className = 'col-span-2 rounded-2xl bg-ink-50 p-4 text-sm text-ink-600';
    attente.textContent = 'Préparation des images du plan…';
    conteneur.replaceChildren(attente);
    dialogues.envoi.showModal();
    // Images du plan, une par niveau, jointes à la demande comme des photos
    apercusEnvoi.forEach((u) => URL.revokeObjectURL(u));
    imagesEnvoi = [];
    apercusEnvoi = [];
    const figures: HTMLElement[] = [];
    for (let n = 0; n < plan.niveaux; n++) {
      try {
        const b = await imageNiveau(n);
        if (!b) continue;
        imagesEnvoi.push(new File([b], nomFichier(n), { type: 'image/png' }));
        const url = URL.createObjectURL(b);
        apercusEnvoi.push(url);
        const figure = document.createElement('figure');
        figure.className = 'flex flex-col gap-1.5';
        const img = document.createElement('img');
        img.src = url;
        img.alt = `Plan : ${nomDuNiveau(n).toLowerCase()}`;
        img.className = 'aspect-[4/3] w-full rounded-xl border border-ink-200 bg-ink-50 object-contain';
        const legendeImage = document.createElement('figcaption');
        legendeImage.className = 'text-sm text-ink-600';
        legendeImage.textContent = nomDuNiveau(n);
        figure.append(img, legendeImage);
        figures.push(figure);
      } catch {
        /* sans cette image, la demande garde le résumé écrit du plan */
      }
    }
    if (!figures.length) attente.textContent = 'Votre navigateur n’a pas pu créer les images du plan : le résumé écrit sera envoyé.';
    else conteneur.replaceChildren(...figures);
  }
  formEnvoi.addEventListener('submit', async (ev) => {
    ev.preventDefault();
    const telephone = formEnvoi.elements.namedItem('phone') as HTMLInputElement;
    telephone.setCustomValidity(telephone.value.replace(/\D/g, '').length >= 10 || !telephone.value ? '' : 'Indiquez un numéro de téléphone complet.');
    if (!formEnvoi.reportValidity()) return;
    const donnees = new FormData(formEnvoi);
    const precisions = String(donnees.get('precisions') ?? '').trim();
    donnees.delete('precisions');
    donnees.set('message', [precisions, noteDemande].filter(Boolean).join('\n\n'));
    donnees.set('surface', String(Math.round(calculer().surfaceChauffee)));
    imagesEnvoi.forEach((f) => donnees.append('photos', f));
    erreurEnvoi.hidden = true;
    boutonEnvoi.disabled = true;
    boutonEnvoi.textContent = 'Envoi en cours…';
    try {
      const reponse = await fetch('/api/contact/', { method: 'POST', body: donnees, headers: { Accept: 'application/json' } });
      const resultat = (await reponse.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
      if (!reponse.ok || !resultat?.ok) throw new Error(resultat?.message || 'L’envoi a échoué. Réessayez, ou appelez-nous.');
      $('[data-envoi-formulaire]').hidden = true;
      $('[data-envoi-merci]').hidden = false;
      formEnvoi.reset();
    } catch (e) {
      erreurEnvoi.textContent = e instanceof Error && e.message !== 'Failed to fetch' ? e.message : 'L’envoi a échoué : vérifiez votre connexion, ou appelez-nous.';
      erreurEnvoi.hidden = false;
    } finally {
      boutonEnvoi.disabled = false;
      boutonEnvoi.textContent = 'Envoyer ma demande d’étude';
      // Jeton anti-robot à usage unique : un nouveau pour un éventuel second envoi
      (window as Window & { turnstile?: { reset(): void } }).turnstile?.reset();
    }
  });
  racine.querySelectorAll('[data-cta]').forEach((b) =>
    b.addEventListener('click', () => {
      fermerMenu();
      void ouvrirEnvoi();
    }),
  );

  surAction('telecharger', async () => {
    fermerMenu();
    if (!plan.pieces.length) return signaler('Le plan est vide : dessinez au moins une pièce, ou partez d’un modèle.');
    for (let n = 0; n < plan.niveaux; n++) {
      try {
        const b = await imageNiveau(n);
        if (!b) continue;
        const a = document.createElement('a');
        a.href = URL.createObjectURL(b);
        a.download = nomFichier(n);
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 2000);
      } catch {
        signaler(`Votre navigateur n’a pas pu créer l’image du niveau « ${nomDuNiveau(n)} ».`);
      }
    }
  });

  // --- Fenêtres de dialogue, menu du téléphone, volet -------------------------------------------------------------
  Object.values(dialogues).forEach((d) => {
    d.querySelectorAll('[data-fermer]').forEach((b) => b.addEventListener('click', () => d.close()));
    // Clic sur le fond assombri : on ferme
    d.addEventListener('click', (ev) => {
      if (ev.target === d) d.close();
    });
  });
  dialogues.envoi.addEventListener('close', () => {
    apercusEnvoi.forEach((u) => URL.revokeObjectURL(u));
    apercusEnvoi = [];
  });
  const menu = $('[data-menu]');
  const boutonMenu = $('[data-action="menu"]');
  function fermerMenu() {
    menu.hidden = true;
    boutonMenu.setAttribute('aria-expanded', 'false');
  }
  surAction('menu', () => {
    menu.hidden = !menu.hidden;
    boutonMenu.setAttribute('aria-expanded', String(!menu.hidden));
  });
  document.addEventListener('click', (ev) => {
    if (!menu.hidden && !(ev.target as Element).closest('[data-menu], [data-action="menu"]')) fermerMenu();
  });
  document.addEventListener('keydown', (ev) => {
    if (ev.key === 'Escape' && !menu.hidden) {
      // Échap ferme seulement le menu (pas d'autre effet sur le plan)
      ev.preventDefault();
      fermerMenu();
      boutonMenu.focus();
    }
  });
  surAction('aide', () => {
    fermerMenu();
    dialogues.aide.showModal();
  });
  surAction('radiateurs', () => {
    fermerMenu();
    dialogues.radiateurs.showModal();
  });
  surAction('modeles', () => {
    fermerMenu();
    dialogues.demarrage.showModal();
  });
  /** Volet du téléphone : replié (en-tête de la pièce visible) ou ouvert. Sans effet sur ordinateur. */
  const boutonVolet = $('[data-action="volet"]');
  function ouvrirVolet(ouvert: boolean) {
    volet.dataset.volet = ouvert ? 'ouvert' : 'ferme';
    boutonVolet.setAttribute('aria-expanded', String(ouvert));
    boutonVolet.setAttribute('aria-label', ouvert ? 'Réduire le volet' : 'Agrandir le volet');
  }
  surAction('volet', () => ouvrirVolet(volet.dataset.volet !== 'ouvert'));

  // --- Actions -----------------------------------------------------------------------------------------------------
  function supprimerSelection() {
    if (!selection) return;
    const s = selection;
    selection = null;
    if (s.genre === 'piece') {
      // Les ouvertures posées sur les murs de la pièce disparaissent avec elle (sinon une porte intérieure deviendrait une porte d'entrée)
      const p = pieceDe(s.id);
      const segs = new Set(p ? contour(p) : []);
      modifier({ ...plan, pieces: plan.pieces.filter((x) => x.id !== s.id), ouvertures: plan.ouvertures.filter((o) => !(p && o.niveau === p.niveau && segmentsOuverture(o).some((k) => segs.has(k)))) });
    } else if (s.genre === 'ouverture') modifier({ ...plan, ouvertures: plan.ouvertures.filter((o) => o.id !== s.id) });
    else if (s.genre === 'emetteur') modifier({ ...plan, emetteurs: plan.emetteurs.filter((e) => e.id !== s.id) });
    else if (s.genre === 'generateur') modifier({ ...plan, central: { generateur: 'aucun', puissance: plan.central.puissance, depart: plan.central.depart } });
    else modifier({ ...plan, escaliers: plan.escaliers.filter((e) => e.id !== s.id) });
    if (!racine!.contains(document.activeElement) || document.activeElement === document.body) svg.focus({ preventScroll: true });
  }

  const auDemiPas = (v: number) => Math.round(v * 2) / 2;
  /** Emplacement d'un appareil au point visé : pièce, position (radiateur contre le mur le plus proche), et validité. */
  function positionAppareil(appareil: 'poele' | 'radiateur' | 'split' | 'chaudiere' | 'pac', x: number, y: number) {
    const p = pieceSous(plan, niveau, x, y);
    const dans = (marge: number, piece: Piece) => ({
      x: borne(auDemiPas(x), piece.x + marge, piece.x + piece.w - marge),
      y: borne(auDemiPas(y), piece.y + marge, piece.y + piece.h - marge),
    });
    if (!p) return { piece: undefined, x: auDemiPas(x), y: auDemiPas(y), sens: 'h' as const, ok: false };
    if (appareil === 'radiateur' || appareil === 'split') return { piece: p, ...placerRadiateur(p, x, y), ok: estChauffee(p.type) };
    if (appareil === 'poele') return { piece: p, ...dans(0.7, p), sens: 'h' as const, ok: estChauffee(p.type) };
    return { piece: p, ...dans(0.75, p), sens: 'h' as const, ok: true };
  }
  /**
   * Pose (ou déplace) la chaudière ou la pompe à chaleur : un seul chauffage central par maison. Eau au départ par grand
   * froid proposée : 70 °C pour une chaudière, 55 °C pour une pompe à chaleur (moyenne température, règlement 813/2013).
   */
  function poserChaudiere(p: Piece, x: number, y: number, type: 'chaudiere' | 'pac') {
    const avant = plan.central;
    const dejaPosee = !!avant.piece && avant.generateur !== 'aucun';
    const depart = avant.generateur === type ? avant.depart : type === 'pac' ? 55 : 70;
    // Nouvel appareil : puissance proposée d'après le besoin de la maison par grand froid
    const puissance = avant.generateur === type ? avant.puissance : puissanceProposee();
    selection = { genre: 'generateur', id: 'central' };
    // Le dimensionnement des radiateurs suit l'eau du nouveau générateur
    caleDepartDim(depart);
    modifier({ ...plan, central: { ...avant, generateur: type, depart, puissance, piece: p.id, x, y } });
    const nom = (g: string) => (g === 'pac' ? 'la pompe à chaleur' : 'la chaudière');
    if (dejaPosee && avant.generateur === type) signaler(`${type === 'pac' ? 'La pompe à chaleur a été déplacée' : 'La chaudière a été déplacée'} : il n’y a qu’un chauffage central par maison.`);
    else if (dejaPosee) signaler(`${nom(type).replace(/^l/, 'L')} remplace ${nom(avant.generateur)} : il n’y a qu’un chauffage central par maison.`);
  }
  /** Besoin de la maison par grand froid, arrondi au kW supérieur : puissance proposée pour une chaudière ou une PAC. */
  function puissanceProposee() {
    return Math.max(3, Math.ceil(calculer().puissance / 1000));
  }
  /** Ajoute un poêle (on peut en mettre plusieurs) et ouvre son détail. */
  function installerPoele(p: Piece, x: number, y: number) {
    if (!estChauffee(p.type)) return signaler('Un poêle s’installe dans une pièce chauffée.');
    const pos = positionAppareil('poele', x, y);
    const poele = poeleParDefaut(nouvelId('poele'), p.id, pos.x, pos.y);
    selection = { genre: 'emetteur', id: poele.id };
    modifier({ ...plan, emetteurs: [...plan.emetteurs, poele] });
  }
  /** Ajoute un radiateur dimensionné sur le besoin de la pièce : à eau s'il y a un chauffage central, électrique sinon. */
  /** Radiateur (à eau s'il y a de quoi chauffer l'eau, électrique sinon) ou unité de PAC air/air. */
  function ajouterRadiateur(p: Piece, x: number, y: number, ouvrir = true, choisie?: Radiateur['nature']) {
    if (!estChauffee(p.type)) return signaler(choisie === 'split' ? 'Une unité de PAC air/air se pose dans une pièce chauffée.' : 'Un radiateur se pose dans une pièce chauffée.');
    const nature: Radiateur['nature'] = choisie ?? (aChauffageEau(plan) ? 'eau' : 'electrique');
    const radiateur: Radiateur = { id: nouvelId('rad'), genre: 'radiateur', piece: p.id, ...placerRadiateur(p, x, y), nature, puissance: puissanceConseillee(p.id, nature, calculer()), consigne: parametres.tInterieure };
    if (ouvrir) selection = { genre: 'emetteur', id: radiateur.id };
    modifier({ ...plan, emetteurs: [...plan.emetteurs, radiateur] });
  }

  function texteAide() {
    if (etape === 'resultat') return '';
    // Sur téléphone, l'aide (en haut du plan) n'apparaît que pour les outils de pose, pour laisser le plan visible
    if (petitEcran.matches) return aidesTelephone[outil];
    if (etape === 'maison') return selection ? '' : 'Cliquez sur une pièce pour voir d’où viennent ses pertes de chaleur.';
    if (etape === 'chauffage' && outil === 'selection') return plan.emetteurs.length ? aideChauffage : '';
    return exempleIntact && outil === 'selection' && !selection ? accueil : aides[outil];
  }

  function choisirOutil(o: Outil) {
    outil = outilsEtape[etape].includes(o) ? o : 'selection';
    survol = null;
    svg.style.cursor = outil === 'selection' ? 'grab' : outil === 'piece' || outil === 'escalier' ? 'crosshair' : 'pointer';
    if (outil === 'escalier' && niveau + 1 >= plan.niveaux) signaler(messageEscalier());
    rendre();
  }

  /** Ajoute une pièce de 4 × 4 m au plus près des pièces existantes (utile au clavier et sur téléphone). */
  function ajouterPiece() {
    const ici = piecesDuNiveau(plan, niveau);
    const dessous = niveau > 0 ? piecesDuNiveau(plan, niveau - 1) : [];
    const reference = emprise({ ...plan, pieces: ici.length ? ici : dessous });
    const depart = reference ? (ici.length ? { x: reference.x + reference.w, y: reference.y } : { x: reference.x, y: reference.y }) : { x: 4, y: 4 };
    const positions: { x: number; y: number }[] = [];
    for (let y = 0; y + 8 <= ROWS; y++) for (let x = 0; x + 8 <= COLS; x++) positions.push({ x, y });
    positions.sort((a, b) => Math.hypot(a.x - depart.x, a.y - depart.y) - Math.hypot(b.x - depart.x, b.y - depart.y));
    const pos = positions.find((q) => libre({ ...q, w: 8, h: 8 }));
    if (!pos) return signaler('Plus de place libre sur le plan.');
    const noms = new Set(plan.pieces.map((p) => p.nom));
    let i = plan.pieces.length + 1;
    while (noms.has(`Pièce ${i}`)) i++;
    const p: Piece = { id: nouvelId('p'), nom: `Pièce ${i}`, type: 'chambre', niveau, ...pos, w: 8, h: 8 };
    selection = { genre: 'piece', id: p.id };
    modifier({ ...plan, pieces: [...plan.pieces, p] });
  }

  /** Segments du côté de pièce qui contient le segment visé, s'ils sont extérieurs ou mitoyens. */
  function bordMitoyen(sens: 'h' | 'v', ligne: number, pos: number) {
    const murs = classerMurs(plan, niveau);
    const k = sens === 'h' ? `h:${Math.floor(pos)}:${ligne}` : `v:${ligne}:${Math.floor(pos)}`;
    const mur = murs.get(k);
    if (!mur || (mur.classe !== 'exterieur' && mur.classe !== 'mitoyen')) return [];
    return contour(mur.pieces[0])
      .filter((s) => {
        const c = lireCle(s);
        const memeLigne = sens === 'h' ? c.sens === 'h' && c.y === ligne : c.sens === 'v' && c.x === ligne;
        const classe = murs.get(s)?.classe;
        return memeLigne && (classe === 'exterieur' || classe === 'mitoyen');
      })
      .map((s) => `${niveau}|${s}`);
  }

  function actualiserSurvol(x: number, y: number) {
    const mur = murProche(x, y);
    if (outil === 'poele' || outil === 'radiateur' || outil === 'split' || outil === 'chaudiere' || outil === 'pac') {
      const pos = positionAppareil(outil, x, y);
      survol = { appareil: outil, x: pos.x, y: pos.y, sens: pos.sens, ok: pos.ok };
      return;
    }
    if (!mur || outil === 'selection' || outil === 'piece' || outil === 'escalier') {
      survol = null;
      return;
    }
    if (outil === 'mitoyen') {
      survol = { mitoyen: bordMitoyen(mur.sens, mur.ligne, mur.pos) };
      return;
    }
    if (outil === 'passage') {
      survol = passageSur(mur.sens, mur.ligne, Math.floor(mur.pos));
      return;
    }
    const longueur = typesOuverture.find((t) => t.value === outil)!.longueur;
    const debut = Math.round(mur.pos - longueur / 2);
    const o: Omit<Ouverture, 'id'> = { type: outil, niveau, sens: mur.sens, x: mur.sens === 'h' ? debut : mur.ligne, y: mur.sens === 'h' ? mur.ligne : debut, longueur, hauteur: hauteurParDefaut(outil) };
    survol = { ...o, ok: ouverturePossible(plan, o) };
  }

  /**
   * Ouverture complète : toute la cloison commune aux deux mêmes pièces, autour du segment visé. Les portes de cette cloison
   * disparaissent avec elle (elles sont remplacées) ; une fenêtre ou une autre ouverture complète l'arrête.
   */
  function passageSur(sens: 'h' | 'v', ligne: number, pos: number): Omit<Ouverture, 'id'> & { ok: boolean; remplace: string[] } {
    const murs = classerMurs(plan, niveau);
    const occupant = new Map<string, Ouverture>();
    for (const o of ouverturesDuNiveau(plan, niveau)) for (const k of segmentsOuverture(o)) occupant.set(k, o);
    const k = (i: number) => (sens === 'h' ? `h:${i}:${ligne}` : `v:${ligne}:${i}`);
    const paire = (i: number) => (murs.get(k(i))?.pieces ?? []).map((p) => p.id).sort().join('|');
    const reference = paire(pos);
    const libre = (i: number) => murs.get(k(i))?.classe === 'interieur' && paire(i) === reference && (occupant.get(k(i))?.type ?? 'porte') === 'porte';
    let debut = pos;
    let fin = pos;
    if (libre(pos)) {
      while (libre(debut - 1)) debut--;
      while (libre(fin + 1)) fin++;
    }
    const o = { type: 'passage' as const, niveau, sens, x: sens === 'h' ? debut : ligne, y: sens === 'h' ? ligne : debut, longueur: fin - debut + 1, hauteur: hauteurParDefaut('passage') };
    // Portes entièrement sur cette cloison : remplacées (une porte qui déborde l'arrêterait, elle est gardée)
    const remplace = [...new Set(segmentsOuverture(o).map((x) => occupant.get(x)).filter((x): x is Ouverture => !!x))];
    const dedans = new Set(segmentsOuverture(o));
    const debordent = remplace.some((p) => segmentsOuverture(p).some((x) => !dedans.has(x)));
    const sans = { ...plan, ouvertures: plan.ouvertures.filter((x) => !remplace.includes(x)) };
    return { ...o, ok: libre(pos) && !debordent && ouverturePossible(sans, o), remplace: remplace.map((x) => x.id) };
  }

  /** Action d'un outil « au clic » (poêle, ouvertures, murs mitoyens), appliquée au relâchement du pointeur. */
  function appliquerOutil(x: number, y: number) {
    if (outil === 'poele' || outil === 'radiateur' || outil === 'split' || outil === 'chaudiere' || outil === 'pac') {
      survol = null;
      const pos = positionAppareil(outil, x, y);
      if (!pos.piece)
        return signaler(outil === 'chaudiere' || outil === 'pac' ? `Cliquez dans une pièce pour y poser ${outil === 'pac' ? 'la pompe à chaleur' : 'la chaudière'}.` : `Cliquez dans une pièce chauffée pour y ${outil === 'poele' ? 'installer un poêle' : outil === 'split' ? 'poser une unité de PAC air/air' : 'poser un radiateur'}.`);
      if (outil === 'chaudiere' || outil === 'pac') return poserChaudiere(pos.piece, pos.x, pos.y, outil);
      return outil === 'poele' ? installerPoele(pos.piece, x, y) : ajouterRadiateur(pos.piece, x, y, true, outil === 'split' ? 'split' : undefined);
    }
    actualiserSurvol(x, y);
    const vise = survol && 'appareil' in survol ? null : survol;
    survol = null;
    if (!vise) {
      signaler(outil === 'mitoyen' ? 'Cliquez sur un mur extérieur (trait épais).' : 'Cliquez sur un mur, pas au milieu d’une pièce : approchez le pointeur du trait jusqu’à voir l’aperçu.');
      return rendre();
    }
    if ('mitoyen' in vise) {
      if (!vise.mitoyen.length) {
        signaler('Seuls les murs extérieurs (trait épais) peuvent être mitoyens.');
        return rendre();
      }
      const deja = new Set(plan.mitoyens);
      const tous = vise.mitoyen.every((k) => deja.has(k));
      return modifier({ ...plan, mitoyens: tous ? plan.mitoyens.filter((k) => !vise.mitoyen.includes(k)) : [...new Set([...plan.mitoyens, ...vise.mitoyen])] });
    }
    if (!vise.ok) {
      signaler(messageOuverture(vise.type));
      return rendre();
    }
    const { ok: _ok, remplace = [], ...o } = vise;
    const nouvelle = { ...o, id: nouvelId('o') };
    selection = { genre: 'ouverture', id: nouvelle.id };
    modifier({ ...plan, ouvertures: [...plan.ouvertures.filter((x) => !remplace.includes(x.id)), nouvelle] });
    if (remplace.length) signaler(`${remplace.length > 1 ? `Les ${remplace.length} portes de cette cloison sont remplacées` : 'La porte de cette cloison est remplacée'} par l’ouverture.`);
  }

  // --- Pointeur ----------------------------------------------------------------------------------------------------
  svg.addEventListener('pointerdown', (ev) => {
    if (ev.pointerType === 'mouse' && ev.button !== 0) return;
    if (pointeurs.size >= 2) return;
    pointeurs.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    try {
      svg.setPointerCapture(ev.pointerId);
    } catch {
      /* pointeur déjà relâché : le geste continue sans capture */
    }
    svg.focus({ preventScroll: true });
    // Deux doigts : zoom et déplacement de la vue ; le geste en cours est abandonné
    if (pointeurs.size === 2) {
      const g = glisser;
      glisser = null;
      if (((g?.genre === 'deplacer' || g?.genre === 'emetteur' || g?.genre === 'generateur') && g.moved) || (g?.genre === 'redim' && JSON.stringify(pieceDe(g.id)) !== JSON.stringify(g.origine))) annuler();
      else if (g?.genre === 'redim') historique.pop();
      const [a, b] = [...pointeurs.values()];
      glisser = { genre: 'pinch', distance: Math.hypot(a.x - b.x, a.y - b.y), centre: point({ clientX: (a.x + b.x) / 2, clientY: (a.y + b.y) / 2 }), vue: { ...vue } };
      return rendre();
    }
    const { x, y } = point(ev);
    const cible = ev.target as Element;
    if (outil === 'piece' || outil === 'escalier') {
      if (outil === 'escalier' && niveau + 1 >= plan.niveaux) return signaler(messageEscalier());
      const gx = borne(Math.round(x), 0, COLS);
      const gy = borne(Math.round(y), 0, ROWS);
      glisser = { genre: 'dessin', quoi: outil, x0: gx, y0: gy, x1: gx, y1: gy };
      return rendre();
    }
    if (outil !== 'selection') {
      glisser = { genre: 'clic', x, y, cx: ev.clientX, cy: ev.clientY };
      return;
    }
    // Porte intérieure, à l'étape du chauffage : elle s'ouvre ou se ferme
    const porte = cible.closest('[data-porte-bascule]')?.getAttribute('data-porte-bascule');
    if (porte) return modifier({ ...plan, ouvertures: plan.ouvertures.map((o) => (o.id === porte ? { ...o, ouverte: o.ouverte === false } : o)) });
    const coin = cible.getAttribute('data-coin');
    const idEmetteur = cible.closest('[data-emetteur]')?.getAttribute('data-emetteur');
    const surChaudiere = !!cible.closest('[data-generateur]');
    const idOuverture = cible.closest('[data-ouverture]')?.getAttribute('data-ouverture');
    const idEscalier = cible.closest('[data-escalier]')?.getAttribute('data-escalier');
    const idPiece = cible.closest('[data-piece]')?.getAttribute('data-piece');
    if (coin && selection?.genre === 'piece' && pieceDe(selection.id)) {
      memoriser();
      glisser = { genre: 'redim', id: selection.id, coin, origine: { ...pieceDe(selection.id)! } };
    } else if (surChaudiere) {
      if (selection?.genre !== 'generateur') selectionner({ genre: 'generateur', id: 'central' });
      glisser = { genre: 'generateur', id: 'central', cx: ev.clientX, cy: ev.clientY, seuil: ev.pointerType === 'mouse' ? 3 : 8, moved: false };
    } else if (idEmetteur) {
      // Poêle ou radiateur : sélection, puis glisser pour le déplacer (dans une pièce chauffée)
      if (selection?.genre !== 'emetteur' || selection.id !== idEmetteur) selectionner({ genre: 'emetteur', id: idEmetteur });
      glisser = { genre: 'emetteur', id: idEmetteur, cx: ev.clientX, cy: ev.clientY, seuil: ev.pointerType === 'mouse' ? 3 : 8, moved: false };
    } else if (idOuverture) selectionner({ genre: 'ouverture', id: idOuverture });
    else if (idEscalier) selectionner({ genre: 'escalier', id: idEscalier });
    else if (idPiece) {
      if (selection?.genre !== 'piece' || selection.id !== idPiece) selectionner({ genre: 'piece', id: idPiece });
      if (etape !== 'plan') return;
      const p = pieceDe(idPiece)!;
      glisser = { genre: 'deplacer', id: idPiece, dx: x - p.x, dy: y - p.y, cx: ev.clientX, cy: ev.clientY, seuil: ev.pointerType === 'mouse' ? 3 : 8, moved: false };
    } else {
      // Fond : on déplace la vue
      if (selection) selectionner(null);
      glisser = { genre: 'pan', cx: ev.clientX, cy: ev.clientY, vue: { ...vue } };
      svg.style.cursor = 'grabbing';
    }
  });

  svg.addEventListener('pointermove', (ev) => {
    if (pointeurs.has(ev.pointerId)) pointeurs.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
    const g = glisser;
    if (g?.genre === 'pinch') {
      if (pointeurs.size < 2) return;
      const [a, b] = [...pointeurs.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y);
      if (d < 10) return;
      const w = borne((g.vue.w * g.distance) / d, 10, COLS + 8);
      const k = w / g.vue.w;
      vue = { x: g.centre.x - (g.centre.x - g.vue.x) * k, y: g.centre.y - (g.centre.y - g.vue.y) * k, w, h: g.vue.h * k };
      vueManuelle = true;
      return vueChangee();
    }
    if (g?.genre === 'pan') {
      const r = svg.getBoundingClientRect();
      if (!r.width) return;
      const echelle = g.vue.w / r.width;
      vue = { ...g.vue, x: g.vue.x - (ev.clientX - g.cx) * echelle, y: g.vue.y - (ev.clientY - g.cy) * echelle };
      vueManuelle = true;
      return vueChangee();
    }
    if (g?.genre === 'clic') return;
    const { x, y } = point(ev);
    if (g?.genre === 'dessin') {
      const nx = borne(Math.round(x), 0, COLS);
      const ny = borne(Math.round(y), 0, ROWS);
      if (nx === g.x1 && ny === g.y1) return;
      g.x1 = nx;
      g.y1 = ny;
      return rendre();
    }
    if (g?.genre === 'emetteur' || g?.genre === 'generateur') {
      if (!g.moved && Math.hypot(ev.clientX - g.cx, ev.clientY - g.cy) < g.seuil) return;
      if (g.genre === 'generateur') {
        const pos = positionAppareil('chaudiere', x, y);
        const c = plan.central;
        if (!pos.piece || (pos.x === c.x && pos.y === c.y && pos.piece.id === c.piece)) return;
        if (!g.moved) memoriser();
        g.moved = true;
        plan = { ...plan, central: { ...c, piece: pos.piece.id, x: pos.x, y: pos.y } };
        rendre();
        return;
      }
      const e = plan.emetteurs.find((x2) => x2.id === g.id);
      if (!e) return;
      const pos = positionAppareil(e.genre === 'poele' ? 'poele' : 'radiateur', x, y);
      if (!pos.piece || !pos.ok || (pos.x === e.x && pos.y === e.y && pos.piece.id === e.piece)) return;
      if (!g.moved) memoriser();
      g.moved = true;
      plan = { ...plan, emetteurs: plan.emetteurs.map((x2) => (x2.id === e.id ? ({ ...x2, piece: pos.piece!.id, x: pos.x, y: pos.y, ...(x2.genre === 'radiateur' ? { sens: pos.sens } : {}) } as Emetteur) : x2)) };
      rendre();
      return;
    }
    if (g?.genre === 'deplacer') {
      if (!g.moved && Math.hypot(ev.clientX - g.cx, ev.clientY - g.cy) < g.seuil) return;
      const p = pieceDe(g.id);
      if (!p) return;
      const nx = Math.round(x - g.dx);
      const ny = Math.round(y - g.dy);
      if ((nx !== p.x || ny !== p.y) && libre({ ...p, x: nx, y: ny }, p.id)) {
        if (!g.moved) memoriser();
        g.moved = true;
        plan = deplacerPiece(plan, p, nx - p.x, ny - p.y);
        rendre();
      }
      return;
    }
    if (g?.genre === 'redim') {
      const o = g.origine;
      let x0 = o.x;
      let y0 = o.y;
      let x1 = o.x + o.w;
      let y1 = o.y + o.h;
      const gx = borne(Math.round(x), 0, COLS);
      const gy = borne(Math.round(y), 0, ROWS);
      if (g.coin.includes('w')) x0 = Math.min(gx, x1 - 2);
      if (g.coin.includes('e')) x1 = Math.max(gx, x0 + 2);
      if (g.coin.includes('n')) y0 = Math.min(gy, y1 - 2);
      if (g.coin.includes('s')) y1 = Math.max(gy, y0 + 2);
      const r = { x: x0, y: y0, w: x1 - x0, h: y1 - y0 };
      const actuelle = pieceDe(o.id);
      if (actuelle && libre(r, o.id) && (r.x !== actuelle.x || r.y !== actuelle.y || r.w !== actuelle.w || r.h !== actuelle.h)) {
        plan = { ...plan, pieces: plan.pieces.map((q) => (q.id === o.id ? { ...q, ...r } : q)) };
        rendre();
      }
      return;
    }
    // Survol à la souris : aperçu de l'ouverture ou du mur mitoyen, redessiné seulement s'il change
    if (ev.pointerType === 'mouse') {
      const avant = JSON.stringify(survol);
      actualiserSurvol(x, y);
      if (JSON.stringify(survol) !== avant) rendre();
    }
  });

  const finGlisser = (ev: PointerEvent) => {
    if (!pointeurs.has(ev.pointerId)) return;
    pointeurs.delete(ev.pointerId);
    const annulation = ev.type !== 'pointerup';
    const g = glisser;
    if (g?.genre === 'pinch') {
      if (pointeurs.size === 0) {
        glisser = null;
        rendre();
      }
      return;
    }
    glisser = null;
    if (!g) return;
    if (g.genre === 'pan') {
      svg.style.cursor = 'grab';
      return;
    }
    if (g.genre === 'clic') {
      if (!annulation && Math.hypot(ev.clientX - g.cx, ev.clientY - g.cy) < 8) appliquerOutil(g.x, g.y);
      return;
    }
    if (g.genre === 'dessin') {
      const r = rectDessin(g);
      if (annulation) return rendre();
      if (g.quoi === 'piece') {
        if (r.w >= 2 && r.h >= 2 && libre(r)) {
          const noms = new Set(plan.pieces.map((p) => p.nom));
          let i = plan.pieces.length + 1;
          while (noms.has(`Pièce ${i}`)) i++;
          const premier = plan.pieces.length === 0;
          const p: Piece = { id: nouvelId('p'), nom: premier ? 'Séjour' : `Pièce ${i}`, type: premier ? 'sejour' : 'chambre', niveau, ...r };
          selection = { genre: 'piece', id: p.id };
          modifier({ ...plan, pieces: [...plan.pieces, p] });
          return;
        }
        if (r.w || r.h) signaler(r.w < 2 || r.h < 2 ? 'Une pièce doit mesurer au moins 1 m de côté.' : 'Une pièce ne peut pas en chevaucher une autre.');
      } else {
        if (escalierPossible(r)) {
          const e: Escalier = { id: nouvelId('e'), niveau, ...r };
          selection = { genre: 'escalier', id: e.id };
          modifier({ ...plan, escaliers: [...plan.escaliers, e] });
          return;
        }
        if (r.w || r.h) signaler('L’escalier se dessine entièrement dans une pièce de ce niveau, sous une pièce du niveau du dessus, sans chevaucher un autre escalier.');
      }
      return rendre();
    }
    // Déplacement ou redimensionnement d'une pièce, déplacement d'un poêle ou d'un radiateur
    const bouge = g.genre === 'redim' ? JSON.stringify(pieceDe(g.id)) !== JSON.stringify(g.origine) : g.moved;
    if (annulation && bouge) return annuler();
    if (g.genre === 'redim' && !bouge) historique.pop();
    if (bouge) {
      plan = nettoyerOuvertures(plan);
      exempleIntact = false;
    }
    rendre();
  };
  svg.addEventListener('pointerup', finGlisser);
  svg.addEventListener('pointercancel', finGlisser);
  svg.addEventListener('lostpointercapture', (ev) => {
    // Capture perdue sans pointerup (fenêtre qui perd le focus…) : le geste est annulé
    if (pointeurs.has(ev.pointerId)) finGlisser(new PointerEvent('pointercancel', { pointerId: ev.pointerId, clientX: ev.clientX, clientY: ev.clientY }));
  });
  svg.addEventListener('pointerleave', (ev) => {
    if (ev.pointerType === 'mouse' && !glisser && survol) {
      survol = null;
      rendre();
    }
  });
  // Zoom à la molette avec Ctrl (ou au pincement du pavé tactile), sans gêner le défilement de la page
  svg.addEventListener(
    'wheel',
    (ev) => {
      if (!ev.ctrlKey && !ev.metaKey) return;
      ev.preventDefault();
      zoomer(Math.exp(ev.deltaY * 0.01), point(ev));
      rendreSurcouche();
    },
    { passive: false },
  );

  // --- Clavier ----------------------------------------------------------------------------------------------------
  // Échap, où que soit le focus (sauf dans une fenêtre ou le menu, qui se ferment) : abandonne le geste en cours, sinon
  // revient à l'outil « Choisir », sinon désélectionne
  document.addEventListener('keydown', (ev) => {
    if (ev.key !== 'Escape' || ev.defaultPrevented || !menu.hidden || racine!.querySelector('dialog[open]')) return;
    // Dans un champ du panneau, Échap ne fait rien d'autre (on ne ferme pas le détail en cours de saisie)
    if ((ev.target as HTMLElement).closest?.('input, select, textarea')) return;
    const g = glisser;
    if (g) {
      // Geste en cours : il est abandonné et la pièce revient à sa place
      glisser = null;
      if (((g.genre === 'deplacer' || g.genre === 'emetteur' || g.genre === 'generateur') && g.moved) || g.genre === 'redim') return annuler();
      return rendre();
    }
    if (outil !== 'selection') return choisirOutil('selection');
    if (selection) selectionner(null);
  });
  // Raccourcis du plan : seulement quand le plan a le focus (après un clic dessus, ou avec Tab)
  svg.addEventListener('keydown', (ev) => {
    if (!selection || glisser) return;
    if (ev.key === 'Delete' || ev.key === 'Backspace') {
      // On supprime ce que l'étape permet de modifier : le dessin au plan, les appareils au chauffage
      const supprimable = etape === 'plan' ? ['piece', 'ouverture', 'escalier'] : etape === 'chauffage' ? ['emetteur', 'generateur'] : [];
      if (!supprimable.includes(selection.genre)) return;
      ev.preventDefault();
      return supprimerSelection();
    }
    const fleches: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
    if (fleches[ev.key] && selection.genre === 'piece' && etape === 'plan') {
      ev.preventDefault();
      const p = pieceDe(selection.id);
      if (!p) return;
      const [ddx, ddy] = fleches[ev.key];
      // Touche maintenue : une seule entrée d'historique pour tout le déplacement
      if (libre({ ...p, x: p.x + ddx, y: p.y + ddy }, p.id)) modifier(deplacerPiece(plan, p, ddx, ddy), { memoriser: !ev.repeat });
    }
  });
  // Annuler (Ctrl/⌘ + Z) et rétablir (Ctrl/⌘ + Maj + Z, ou Ctrl + Y), hors des champs de saisie et des fenêtres de dialogue
  document.addEventListener('keydown', (ev) => {
    if (!(ev.ctrlKey || ev.metaKey) || ev.altKey) return;
    const touche = ev.key.toLowerCase();
    const action = touche === 'z' ? (ev.shiftKey ? retablir : annuler) : touche === 'y' && !ev.shiftKey ? retablir : null;
    const cible = ev.target as HTMLElement;
    if (!action || cible.closest('input, select, textarea, dialog')) return;
    ev.preventDefault();
    action();
  });

  // --- Boutons ----------------------------------------------------------------------------------------------------
  racine.querySelectorAll<HTMLButtonElement>('[data-outil]').forEach((b) => b.addEventListener('click', () => choisirOutil(b.dataset.outil as Outil)));
  surAction('annuler', annuler);
  surAction('retablir', retablir);
  // Un radiateur dans chaque pièce chauffée qui n'en a pas, dimensionné sur son besoin, près du mur du bas
  surAction('radiateurs-partout', () => radiateursPartout());
  /** Un radiateur dans chaque pièce chauffée qui n'en a pas, dimensionné sur son besoin, contre le mur du bas. */
  function radiateursPartout() {
    const calcul = calculer();
    const nature: Radiateur['nature'] = aChauffageEau(plan) ? 'eau' : 'electrique';
    const nouveaux: Radiateur[] = calcul.pieces
      .filter((r) => !plan.emetteurs.some((e) => e.genre === 'radiateur' && e.piece === r.piece.id))
      .map((r) => ({
        id: nouvelId('rad'),
        genre: 'radiateur',
        piece: r.piece.id,
        ...placerRadiateur(r.piece, r.piece.x + r.piece.w / 2, r.piece.y + r.piece.h),
        nature,
        puissance: puissanceConseillee(r.piece.id, nature, calcul),
        consigne: parametres.tInterieure,
      }));
    if (!nouveaux.length) return signaler('Chaque pièce chauffée a déjà au moins un radiateur.');
    modifier({ ...plan, emetteurs: [...plan.emetteurs, ...nouveaux] });
    signaler(`${nouveaux.length} radiateur${nouveaux.length > 1 ? 's' : ''} ${nature === 'eau' ? 'à eau' : 'électrique' + (nouveaux.length > 1 ? 's' : '')} ajouté${nouveaux.length > 1 ? 's' : ''}, dimensionné${nouveaux.length > 1 ? 's' : ''} sur le besoin de chaque pièce par grand froid.`);
  }
  racine.querySelectorAll<HTMLButtonElement>('[data-zoom]').forEach((b) =>
    b.addEventListener('click', () => {
      if (b.dataset.zoom === 'plus') zoomer(0.8);
      else if (b.dataset.zoom === 'moins') zoomer(1.25);
      else ajusterVue();
      rendreSurcouche();
    }),
  );
  /** Remplace le plan par un modèle (ou un plan vierge) ; « Annuler » ramène le plan précédent. */
  function chargerModele(id: string) {
    const modele = modeles.find((mo) => mo.id === id);
    const avaitUnPlan = !exempleIntact && plan.pieces.length > 0;
    memoriser(true);
    selection = null;
    survol = null;
    niveau = 0;
    if (modele) remplir(enveloppe, modele.enveloppe);
    syncIsolants();
    enveloppeAvant = etatFormulaire(enveloppe);
    plan = nettoyerOuvertures(modele ? modele.plan() : planVide());
    nord.value = plan.nord;
    exempleIntact = false;
    etape = 'plan';
    ajusterVue();
    choisirOutil(modele ? 'selection' : 'piece');
    if (avaitUnPlan) signaler('Modèle chargé. « Annuler » ramène votre plan précédent.');
  }
  racine.querySelectorAll<HTMLButtonElement>('[data-choix-modele]').forEach((b) =>
    b.addEventListener('click', () => {
      dialogues.demarrage.close();
      chargerModele(b.dataset.choixModele!);
    }),
  );
  nord.value = plan.nord;
  nord.addEventListener('change', () => modifier({ ...plan, nord: nord.value as Plan['nord'] }));

  // Isolant « aucun » ou inconnu : l'épaisseur n'a pas de sens
  function syncIsolants() {
    enveloppe.querySelectorAll<HTMLSelectElement>('[data-isolant]').forEach((s) => {
      const epaisseur = enveloppe.querySelector<HTMLElement>(`[data-epaisseur="${s.name}"]`);
      if (epaisseur) epaisseur.hidden = s.value === 'aucun' || s.value === 'inconnu';
    });
  }
  // Une modification des réglages de la maison est annulable : on garde l'état d'avant chaque changement
  let enveloppeAvant = etatFormulaire(enveloppe);
  enveloppe.addEventListener('input', (ev) => {
    const cible = ev.target as HTMLSelectElement;
    if (cible === nord) return;
    // Ossature bois : l'isolant entre montants est déjà compris dans la valeur du mur
    if (cible.name === 'murMatiere' && cible.value === 'ossature-bois') remplir(enveloppe, { murIsolant: 'aucun' });
    syncIsolants();
    exempleIntact = false;
    rendre();
  });
  enveloppe.addEventListener('change', (ev) => {
    if (ev.target === nord) return;
    empiler(JSON.stringify({ plan, enveloppe: enveloppeAvant }));
    enveloppeAvant = etatFormulaire(enveloppe);
  });
  enveloppe.addEventListener('submit', (ev) => ev.preventDefault());
  syncIsolants();

  chauffageForm.addEventListener('input', (ev) => {
    if ((ev.target as HTMLInputElement).name === 'soleil') rendre();
  });
  // Le curseur est dans la légende, rattaché au formulaire par l'attribut form : ses événements ne remontent pas jusqu'à lui
  const curseurText = chauffageForm.elements.namedItem('tExterieure') as HTMLInputElement;
  curseurText.addEventListener('input', () => {
    majTexterieure();
    rendre();
  });
  /** Valeur affichée à côté du curseur de température extérieure. */
  function majTexterieure() {
    racine!.querySelectorAll<HTMLButtonElement>('[data-preset-text]').forEach((b) => b.setAttribute('aria-pressed', String(Number(b.dataset.presetText) === Number(curseurText.value))));
    racine!.querySelectorAll('[data-texterieure]').forEach((o) => (o.textContent = `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 1 }).format(Number(curseurText.value)).replace('-', '−')} °C`));
  }
  racine.querySelectorAll<HTMLButtonElement>('[data-preset-text]').forEach((b) =>
    b.addEventListener('click', () => {
      curseurText.value = b.dataset.presetText!;
      majTexterieure();
      rendre();
    }),
  );
  majTexterieure();
  chauffageForm.addEventListener('submit', (ev) => ev.preventDefault());
  racine.querySelectorAll<HTMLButtonElement>('[data-portes]').forEach((b) =>
    b.addEventListener('click', () => {
      const ouvrir = b.dataset.portes === 'ouvrir';
      const interieures = new Set<string>();
      for (let n = 0; n < plan.niveaux; n++) {
        const murs = classerMurs(plan, n);
        for (const o of ouverturesDuNiveau(plan, n)) if (o.type === 'porte' && segmentsOuverture(o).some((k) => murs.get(k)?.classe === 'interieur')) interieures.add(o.id);
      }
      modifier({ ...plan, ouvertures: plan.ouvertures.map((o) => (interieures.has(o.id) ? { ...o, ouverte: ouvrir } : o)) });
    }),
  );

  // Étapes : barre du haut, et boutons Retour / Suivant du panneau
  racine.querySelectorAll<HTMLButtonElement>('[data-etape-bouton]').forEach((b) => b.addEventListener('click', () => choisirEtape(b.dataset.etapeBouton as Etape)));
  $('[data-etape-prec]').addEventListener('click', () => choisirEtape(ETAPES[Math.max(0, ETAPES.indexOf(etape) - 1)]));
  $('[data-etape-suiv]').addEventListener('click', () => (etape === 'resultat' ? void ouvrirEnvoi() : choisirEtape(ETAPES[ETAPES.indexOf(etape) + 1])));

  // La vue suit la taille du plan à l'écran ; tant que l'utilisateur ne l'a pas réglée, elle reste cadrée sur la maison
  new ResizeObserver(() => {
    if (vueManuelle) appliquerVue();
    else ajusterVue();
    rendreSurcouche();
  }).observe(svg);

  try {
    ajusterVue();
    choisirOutil('selection');
  } catch {
    // Plan enregistré inutilisable : on repart de l'exemple plutôt que de bloquer l'outil
    try {
      localStorage.removeItem(STOCKAGE);
    } catch {
      /* stockage indisponible */
    }
    plan = planExemple();
    niveau = 0;
    selection = null;
    exempleIntact = true;
    ajusterVue();
    choisirOutil('selection');
    signaler('Votre plan enregistré était illisible : le plan d’exemple a été rechargé.');
  }
  petitEcran.addEventListener('change', () => rendre());
  if (petitEcran.matches) ouvrirVolet(etape === 'maison' || etape === 'resultat');
  // Première visite (aucun plan enregistré) : choix d'un modèle ; fermer la fenêtre garde le plan d'exemple
  if (premiereVisite) dialogues.demarrage.showModal();
}

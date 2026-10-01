/**
 * Températures d'équilibre des pièces chauffées par des poêles et des radiateurs (chauffage central ou électriques).
 *
 * Chaque pièce i vérifie : apports_i + Σ_j G_ij (T_j − T_i) − H_i (T_i − T_ext) = 0
 * - H_i : pertes de la pièce vers l'extérieur (W/K), issues du calcul des déperditions ;
 * - G_ij : échanges entre pièces voisines par la cloison, une porte fermée, une porte ouverte ou un escalier (circulation
 *   d'air naturelle, qui dépend de l'écart de température, d'où une résolution par itérations) ;
 * - apports : chaleur des occupants et appareils, et des émetteurs de la pièce. Chaque émetteur suit son thermostat
 *   (ou la température visée pour un poêle à bois) dans la limite de sa puissance : poêles entre leur allure minimale et
 *   leur puissance nominale, radiateurs à eau selon la température de l'eau (loi d'eau du chauffage central), radiateurs
 *   électriques jusqu'à leur puissance. Dans une même pièce, l'émetteur réglé le plus haut chauffe en premier.
 * Quand un poêle fonctionne, l'air sous le plafond de sa pièce est plus chaud que la zone où l'on vit (celle de la
 * consigne) : c'est cet air qui part par le haut des portes, monte l'escalier et chauffe le plancher de l'étage. Les
 * échanges de cette pièce avec les pièces du même niveau et du dessus se font donc à sa température + ce surplus.
 * Les pièces non chauffées (garage…) restent traitées comme dans le calcul des déperditions.
 */
import { PAS, classerMurs, segmentsOuverture, estChauffee, intersection, pieceSous, ouverturesDuNiveau, poelesHydro, aChauffageEau, type Plan, type Emetteur, type NaturePoele } from './geometrie';
import type { ResultatPiece } from './deperditions';

/** Conditions du calcul. */
export type Conditions = {
  /** Température extérieure (°C) : moyenne du jour pour le calcul heure par heure. */
  tExterieure: number;
  /** Température extérieure de base (°C), point haut de la loi d'eau du chauffage central. */
  tBase: number;
  /** Apports internes (appareils, éclairage, occupants), en W par m² habitable. */
  apportsInternesParM2: number;
  /** Apports solaires moyens de chaque pièce (W) ; absents par grand froid (calcul de dimensionnement). */
  apportsSolaires?: Map<string, number>;
};

/** Inertie de chaque pièce : capacité (J/K par m² de plancher) et surface de masse efficace (m² par m² de plancher). */
export type Inertie = Map<string, { capacite: number; surfaceMasse: number }>;

/**
 * Programme de chauffage : continu, baisse la nuit (23 h - 6 h), ou absence en journée (8 h - 17 h) et baisse la nuit.
 * Aux heures réduites, les thermostats passent à la température réduite et les poêles à bois ne sont pas allumés.
 */
export type Programme = 'continu' | 'nuit' | 'absence';

/** Journée type pour le calcul heure par heure. */
export type Journee = {
  /** Demi-amplitude de la température extérieure (K) et heure du maximum. */
  amplitude: number;
  heureMax: number;
  /** Lever et coucher du soleil (heures décimales). */
  lever: number;
  coucher: number;
  programme: Programme;
  /** Température réduite des thermostats (°C). */
  tReduit: number;
};

/** Heures où la maison est occupée (chauffage normal) selon le programme. */
export const heureOccupee = (programme: Programme, h: number) =>
  programme === 'continu' ? true : programme === 'nuit' ? h >= 6 && h < 23 : (h >= 6 && h < 8) || (h >= 17 && h < 23);

/** Comportement des appareils (sources dans `data/plan-thermique.ts`). */
export type Regulation = {
  poeles: Record<NaturePoele, {
    /** Allure la plus basse, en part de la puissance nominale. */
    allureMinimale: number;
    /**
     * Poêle à thermostat : dépassement de la consigne au-delà duquel il s'arrête quand il est trop puissant, même à son
     * allure minimale (K). null : pas de thermostat (poêle à bois).
     */
    depassementMax: number | null;
  }>;
  /** Écart départ / retour de l'eau par grand froid (K), selon le générateur. */
  ecartDepartRetour: { chaudiere: number; pac: number };
  /** Exposant de la courbe d'émission des radiateurs à eau (EN 442). */
  nRadiateur: number;
};

export type PhysiqueEchanges = {
  /** U du plancher entre deux niveaux, selon sa nature (W/m²·K). */
  uPlancherIntermediaire: Record<string, number>;
  /** Coefficient de débit d'un escalier ouvert (échange d'air par la trémie). */
  cdEscalier: number;
  /** U d'une cloison intérieure (W/m²·K). */
  uCloison: number;
  /** U d'une porte intérieure fermée (W/m²·K). */
  uPorte: number;
  /** Coefficient de débit d'une porte intérieure ouverte. */
  cdPorte: number;
  /** Surplus de température de l'air sous le plafond de la pièce d'un poêle quand il fonctionne (K). */
  stratificationPoele: number;
  /** Capacité thermique de l'air et du mobilier (J/K par m² de plancher), pour le calcul heure par heure. */
  capaciteAirMobilier: number;
};

/**
 * Fonctionnement d'un poêle : à l'arrêt (assez chaud sans lui), en modulation (il tient la consigne), au maximum (trop
 * petit), au minimum (trop puissant, il dépasse un peu la consigne), en marche/arrêt (trop puissant, son thermostat
 * l'éteint et le rallume), ou par flambées espacées (poêle à bois trop puissant même au ralenti : températures moyennes
 * sur la journée, avec de fortes variations).
 */
export type Regime = 'arret' | 'modulation' | 'maximum' | 'minimum' | 'marche-arret' | 'flambees';

export type ResultatEmetteur = {
  /** Puissance fournie (W). */
  puissance: number;
  /** Poêle : fonctionnement, et température qu'atteindrait sa pièce en continu à l'allure minimale s'il est trop puissant. */
  regime?: Regime;
  tPieceAuMinimum?: number;
  /** Radiateur : puissance maximale qu'il peut donner dans ces conditions (W). */
  capacite?: number;
  /** Poêle hydro : part de sa puissance cédée à l'eau des radiateurs (W). */
  eau?: number;
};

export type ResultatJournee = {
  /** Valeurs heure par heure (0 h à 23 h) de la journée type, une fois le régime établi. */
  temperatures: Map<string, number[]>;
  puissances: Map<string, number[]>;
  regimes: Map<string, (Regime | undefined)[]>;
  occupe: boolean[];
  tExterieure: number[];
  tEau: (number | null)[];
  puissanceCentral: number[];
  generateurLimite: boolean;
  converge: boolean;
};

export type ResultatTemperatures = {
  temperatures: Map<string, number>;
  emetteurs: Map<string, ResultatEmetteur>;
  /** Température moyenne de l'eau des radiateurs (°C) ; null sans chauffage central. */
  tEau: number | null;
  /** Puissance fournie par le chauffage central (W), et limitée par la puissance du générateur ? */
  puissanceCentral: number;
  generateurLimite: boolean;
  converge: boolean;
};

const RHO_CP = 1.2 * 1005; // air : masse volumique (kg/m³) × capacité thermique (J/kg·K)
const G = 9.81;

/** Réseau thermique de la maison : pièces (modèle EN ISO 13790 à 5 résistances et 1 capacité), échanges, appareils. */
function reseau(
  plan: Plan,
  pieces: ResultatPiece[],
  hauteurPlafond: number,
  plancherIntermediaire: string,
  phy: PhysiqueEchanges,
  reg: Regulation,
  inertie?: Inertie,
) {
  const ids = pieces.map((r) => r.piece.id);
  const niveauDe = new Map(pieces.map((r) => [r.piece.id, r.piece.niveau]));
  // Liaisons entre pièces chauffées voisines : cloison ou plancher (fixe), portes ouvertes, trémie d'escalier
  type Tremie = { bas: string; aire: number };
  type Liaison = { a: string; b: string; fixe: number; portesOuvertes: { largeur: number; hauteur: number }[]; tremies: Tremie[] };
  const liaisons = new Map<string, Liaison>();
  const lien = (a: string, b: string) => {
    const k = a < b ? `${a}|${b}` : `${b}|${a}`;
    if (!liaisons.has(k)) liaisons.set(k, { a, b, fixe: 0, portesOuvertes: [], tremies: [] });
    return liaisons.get(k)!;
  };
  const portesVues = new Set<string>();
  for (let niveau = 0; niveau < plan.niveaux; niveau++) {
  const murs = classerMurs(plan, niveau);
  const segPortes = new Map<string, (typeof plan.ouvertures)[number]>();
  for (const o of ouverturesDuNiveau(plan, niveau)) if (o.type === 'porte') for (const k of segmentsOuverture(o)) segPortes.set(k, o);
  for (const [k, mur] of murs) {
    if (mur.classe !== 'interieur' || mur.pieces.length < 2) continue;
    const [pa, pb] = mur.pieces;
    if (!estChauffee(pa.type) || !estChauffee(pb.type)) continue;
    const l = lien(pa.id, pb.id);
    const porte = segPortes.get(k);
    const surface = PAS * hauteurPlafond;
    if (!porte) {
      l.fixe += phy.uCloison * surface;
      continue;
    }
    // Segment de porte : la partie au-dessus de la porte reste une cloison
    l.fixe += phy.uCloison * PAS * Math.max(0, hauteurPlafond - porte.hauteur);
    if (portesVues.has(porte.id)) continue;
    portesVues.add(porte.id);
    const largeur = porte.longueur * PAS;
    if (porte.ouverte === false) l.fixe += phy.uPorte * largeur * porte.hauteur;
    else l.portesOuvertes.push({ largeur, hauteur: porte.hauteur });
  }
  }

  // Planchers entre niveaux : conduction entre une pièce et celles qu'elle recouvre
  const uPi = phy.uPlancherIntermediaire[plancherIntermediaire] ?? phy.uPlancherIntermediaire.bois;
  for (const bas of plan.pieces) {
    if (!estChauffee(bas.type)) continue;
    for (const haut of plan.pieces) {
      if (haut.niveau !== bas.niveau + 1 || !estChauffee(haut.type)) continue;
      // Surface commune, moins la trémie d'escalier éventuelle (déjà comptée comme ouverture)
      const tremies = plan.escaliers.filter((e) => e.niveau === bas.niveau).reduce((s, e) => s + Math.min(intersection(e, bas), intersection(e, haut)), 0);
      const a = intersection(bas, haut) - tremies;
      if (a > 0) lien(bas.id, haut.id).fixe += uPi * a;
    }
  }
  // Trémies d'escalier : la pièce du bas et celle du haut échangent de l'air
  for (const e of plan.escaliers) {
    const cx = e.x + e.w / 2;
    const cy = e.y + e.h / 2;
    const bas = pieceSous(plan, e.niveau, cx, cy);
    const haut = pieceSous(plan, e.niveau + 1, cx, cy);
    if (!bas || !haut || !estChauffee(bas.type) || !estChauffee(haut.type)) continue;
    lien(bas.id, haut.id).tremies.push({ bas: bas.id, aire: e.w * e.h * PAS * PAS });
  }

  /** Échange par une porte ouverte (W/K) : débit d'air dans chaque sens Cd/3 · L · √(g·h³·ΔT/T). */
  const gPorte = (p: { largeur: number; hauteur: number }, dT: number, tMoy: number) =>
    RHO_CP * (phy.cdPorte / 3) * p.largeur * Math.sqrt((G * p.hauteur ** 3 * Math.max(Math.abs(dT), 0.05)) / (tMoy + 273.15));

  /**
   * Échange par un escalier ouvert (W/K) : débit dans chaque sens Cd · A · √(g·H·ΔT/T), A surface de la trémie et H hauteur
   * d'étage (prise égale à la hauteur sous plafond), quand le bas est plus chaud que le haut ; aucun échange dans le cas
   * contraire, l'air chaud restant en haut.
   */
  const gTremie = (t: Tremie, tBas: number, tHaut: number) => {
    const dT = tBas - tHaut;
    if (dT <= 0) return 0;
    return RHO_CP * phy.cdEscalier * t.aire * Math.sqrt((G * hauteurPlafond * Math.max(dT, 0.05)) / ((tBas + tHaut) / 2 + 273.15));
  };

  const voisins = new Map<string, Liaison[]>(ids.map((id) => [id, []]));
  for (const l of liaisons.values()) {
    voisins.get(l.a)?.push(l);
    voisins.get(l.b)?.push(l);
  }

  // Émetteurs des pièces chauffées ; dans une pièce, l'émetteur réglé le plus haut chauffe en premier (poêle d'abord à égalité)
  const emetteurs = plan.emetteurs.filter((e) => ids.includes(e.piece));
  const emetteursDe = new Map<string, Emetteur[]>(ids.map((id) => [id, []]));
  for (const e of emetteurs) emetteursDe.get(e.piece)!.push(e);
  // Un poêle hydro passe avant : la chaleur qu'il donne à sa pièce ne dépend pas d'un réglage de la pièce
  const hydro = (x: Emetteur) => x.genre === 'poele' && x.nature === 'hydro';
  for (const liste of emetteursDe.values()) liste.sort((a, b) => Number(hydro(b)) - Number(hydro(a)) || b.consigne - a.consigne || (a.genre === 'poele' ? -1 : 1));
  // Poêles hydro : ils chauffent l'eau des radiateurs en priorité sur la chaudière, chacun selon sa puissance à l'eau
  const lesHydro = poelesHydro(plan).filter((e) => ids.includes(e.piece));
  const partEau = (e: Emetteur) => (e.genre === 'poele' ? Math.min(0.95, Math.max(0.5, e.partEau / 100)) : 0);
  const capaciteHydro = lesHydro.reduce((s2, e) => s2 + partEau(e) * e.puissance * 1000, 0);
  // Part de la puissance d'un poêle canalisable envoyée dans chacune des pièces desservies
  const gainesVers = new Map<string, { poele: string; part: number }[]>(ids.map((id) => [id, []]));
  const partDansSaPiece = new Map<string, number>();
  for (const e of emetteurs) {
    if (e.genre !== 'poele') continue;
    const desservies = e.nature === 'canalisable' ? e.gaines.filter((id) => ids.includes(id) && id !== e.piece) : [];
    const part = desservies.length ? Math.min(0.8, Math.max(0, e.partGaines / 100)) : 0;
    partDansSaPiece.set(e.id, 1 - part);
    for (const id of desservies) gainesVers.get(id)!.push({ poele: e.id, part: part / desservies.length });
  }

  // Paramètres EN ISO 13790 (méthode horaire simplifiée) de chaque pièce : nœuds air, surfaces et masse.
  // Ventilation vers l'air, fenêtres et portes vers les surfaces, parois opaques et ponts thermiques vers la masse.
  const iso = new Map(
    pieces.map((r) => {
      const af = r.surface;
      const inn = inertie?.get(r.piece.id) ?? { capacite: 165_000, surfaceMasse: 2.5 };
      const am = inn.surfaceMasse * af;
      const at = 4.5 * af;
      const his = 3.45 * at;
      const hms = 9.1 * am;
      const hve = r.postes.air;
      const hw = r.postes.fenetres + r.postes.portes;
      const hop = Math.max(0, r.H - hve - hw);
      const hem = hop > 0 ? (hop * hms) / Math.max(hms - hop, 1e-6) : 0;
      return [r.piece.id, { af, am, at, his, hms, hve, hw, hem, cm: inn.capacite * af }];
    }),
  );

  // Chauffage central : température moyenne de l'eau par une loi d'eau linéaire, de 20 °C (20 °C dehors) au départ choisi
  // par grand froid, moins la moitié de l'écart départ / retour
  // (poêle hydro seul : même loi d'eau et même écart qu'une chaudière)
  const central = plan.central;
  const avecEau = aChauffageEau(plan);
  const ecart = reg.ecartDepartRetour[central.generateur === 'pac' ? 'pac' : 'chaudiere'];
  const tEauPour = (tExt: number, tBase: number) =>
    !avecEau ? null : 20 + (central.depart - ecart / 2 - 20) * Math.max(0, (20 - tExt) / (20 - tBase));

  type Entrees = {
    tExt: number;
    tBase: number;
    soleil?: Map<string, number>;
    interneParM2: number;
    /** Fraction de leur émission que reçoivent les radiateurs à eau (générateur trop juste). */
    k: number;
    /** Pas de temps (s) ; Infinity : régime permanent. */
    dt: number;
    /** Réglage de chaque appareil à cette heure ; null : éteint. */
    consigne: (e: Emetteur) => number | null;
  };

  /** Résout une heure (ou le régime permanent) : températures de l'air par Gauss-Seidel, puis surfaces et masse. */
  const pas = (e: Entrees, tDepart: Map<string, number>, tMasse: Map<string, number>) => {
    const T = new Map(tDepart);
    const P = new Map(emetteurs.map((x) => [x.id, 0]));
    // Heure par heure, l'air et le mobilier gardent une partie de leur chaleur de l'heure précédente
    const kappaAir = (id: string) => (Number.isFinite(e.dt) ? (phy.capaciteAirMobilier * iso.get(id)!.af) / e.dt : 0);
    const details = new Map<string, ResultatEmetteur & { voulu?: number }>();
    const tEau = tEauPour(e.tExt, e.tBase);
    // Nœuds surfaces et masse de chaque pièce, ramenés à une conductance K vers une température équivalente Teq
    const equivalent = new Map<string, { k: number; teq: number; c0: number; E: number; alpha: number; beta: number }>();
    for (const id of ids) {
      const p = iso.get(id)!;
      const interne = e.interneParM2 * p.af;
      const solaire = e.soleil?.get(id) ?? 0;
      const ref = 0.5 * interne + solaire;
      const phiM = (p.am / p.at) * ref;
      const phiSt = (1 - p.am / p.at - p.hw / (9.1 * p.at)) * ref;
      const kappa = Number.isFinite(e.dt) ? p.cm / e.dt : 0;
      const D = kappa + p.hms + p.hem;
      const alpha = (kappa * (tMasse.get(id) ?? T.get(id)!) + phiM + p.hem * e.tExt) / D;
      const beta = p.hms / D;
      const E = p.his + p.hw + p.hms * (1 - beta);
      const c0 = p.hw * e.tExt + p.hms * alpha + phiSt;
      const k = p.his * (1 - p.his / E);
      equivalent.set(id, { k, teq: k > 0 ? (p.his * c0) / (E * k) : e.tExt, c0, E, alpha, beta });
    }
    let converge = false;
    for (let iter = 0; iter < 500; iter++) {
      let ecartMax = 0;
      // Air plus chaud sous le plafond des pièces où un poêle fonctionne, vu par les pièces du même niveau et du dessus
      // (sauf poêle hydro : il donne l'essentiel de sa chaleur à l'eau)
      const chaudes = new Set(emetteurs.filter((x) => x.genre === 'poele' && !hydro(x) && P.get(x.id)! > 0).map((x) => x.piece));
      // Demande des radiateurs à eau (dernière estimation), servie d'abord par les poêles hydro
      const demandeEau = emetteurs.filter((x) => x.genre === 'radiateur' && x.nature === 'eau').reduce((s2, x) => s2 + P.get(x.id)!, 0);
      const eauHydro = Math.min(demandeEau, capaciteHydro);
      const surplus = (de: string, vers: string) => (chaudes.has(de) && niveauDe.get(vers)! >= niveauDe.get(de)! ? phy.stratificationPoele : 0);
      for (const id of ids) {
        const p = iso.get(id)!;
        const q = equivalent.get(id)!;
        let base = 0.5 * e.interneParM2 * p.af;
        for (const g of gainesVers.get(id)!) base += P.get(g.poele)! * g.part;
        let somme = p.hve * e.tExt + q.k * q.teq + kappaAir(id) * tDepart.get(id)!;
        let coef = p.hve + q.k + kappaAir(id);
        for (const l of voisins.get(id)!) {
          const autre = l.a === id ? l.b : l.a;
          const tj = T.get(autre)! + surplus(autre, id);
          const ti = T.get(id)! + surplus(id, autre);
          const g =
            l.fixe +
            l.portesOuvertes.reduce((s2, po) => s2 + gPorte(po, ti - tj, (ti + tj) / 2), 0) +
            l.tremies.reduce((s2, t) => s2 + (t.bas === id ? gTremie(t, ti, tj) : gTremie(t, tj, ti)), 0);
          somme += g * (tj - surplus(id, autre));
          coef += g;
        }
        let fourni = 0;
        for (const em of emetteursDe.get(id)!) {
          const c = e.consigne(em);
          if (c === null) {
            P.set(em.id, 0);
            details.set(em.id, em.genre === 'poele' ? { puissance: 0, regime: 'arret' } : { puissance: 0, capacite: 0 });
            continue;
          }
          // Puissance qui amènerait la pièce au réglage de cet appareil
          const besoin = coef * c - (base + somme + fourni);
          if (em.genre === 'poele' && em.nature === 'hydro') {
            // Piloté par les radiateurs : il brûle de quoi fournir sa part de leur demande ; sa pièce reçoit le reste
            const pMax = em.puissance * 1000;
            const f = partEau(em);
            const eau = capaciteHydro > 0 ? (eauHydro * f * pMax) / capaciteHydro : 0;
            const puissance = eau / f;
            const pMin = reg.poeles.hydro.allureMinimale * pMax;
            const regime: Regime = puissance <= 0 ? 'arret' : puissance >= pMax * 0.999 ? 'maximum' : puissance >= pMin ? 'modulation' : 'marche-arret';
            P.set(em.id, puissance);
            details.set(em.id, { puissance, regime, eau });
            fourni += puissance * (1 - f);
          } else if (em.genre === 'poele') {
            const r = reg.poeles[em.nature];
            const f = partDansSaPiece.get(em.id)!;
            const pMax = em.puissance * 1000;
            const pMin = r.allureMinimale * pMax;
            const voulu = besoin / f;
            let puissance: number;
            let regime: Regime;
            let tPieceAuMinimum: number | undefined;
            if (voulu <= 0) [puissance, regime] = [0, 'arret'];
            else if (voulu >= pMax) [puissance, regime] = [pMax, 'maximum'];
            else if (voulu >= pMin) [puissance, regime] = [voulu, 'modulation'];
            else {
              // Trop puissant, même à son allure minimale : sur l'heure, il fonctionne une partie du temps (puissance moyenne)
              tPieceAuMinimum = (base + somme + fourni + pMin * f) / coef;
              if (r.depassementMax === null) [puissance, regime] = [voulu, 'flambees'];
              else if (tPieceAuMinimum <= c + r.depassementMax!) [puissance, regime] = [pMin, 'minimum'];
              else [puissance, regime] = [(coef * (c + r.depassementMax!) - (base + somme + fourni)) / f, 'marche-arret'];
            }
            P.set(em.id, puissance);
            details.set(em.id, { puissance, regime, tPieceAuMinimum, voulu });
            fourni += puissance * f;
          } else {
            const capacite =
              em.nature === 'electrique'
                ? em.puissance
                : tEau === null
                  ? 0
                  : e.k * em.puissance * Math.pow(Math.max(0, tEau - T.get(id)!) / 50, reg.nRadiateur);
            const puissance = Math.min(Math.max(besoin, 0), capacite);
            P.set(em.id, puissance);
            details.set(em.id, { puissance, capacite });
            fourni += puissance;
          }
        }
        const t = (base + somme + fourni) / coef;
        const ancien = T.get(id)!;
        const nouveau = ancien + 0.8 * (t - ancien);
        ecartMax = Math.max(ecartMax, Math.abs(nouveau - ancien));
        T.set(id, nouveau);
      }
      // Les poêles hydro ont servi la demande d'eau du début du tour : on continue tant qu'elle change
      const demandeFin = emetteurs.filter((x) => x.genre === 'radiateur' && x.nature === 'eau').reduce((s2, x) => s2 + P.get(x.id)!, 0);
      const eauStable = capaciteHydro === 0 || Math.abs(Math.min(demandeFin, capaciteHydro) - eauHydro) < 1;
      if (ecartMax < 1e-4 && eauStable) {
        converge = true;
        break;
      }
    }
    // Température de la masse à la fin du pas
    const masse = new Map(
      ids.map((id) => {
        const p = iso.get(id)!;
        const q = equivalent.get(id)!;
        const ts = (p.his * T.get(id)! + q.c0) / q.E;
        return [id, q.alpha + q.beta * ts];
      }),
    );
    const eau = emetteurs.filter((x) => x.genre === 'radiateur' && x.nature === 'eau').reduce((s2, x) => s2 + P.get(x.id)!, 0);
    return { T, masse, details, converge, eau, tEau };
  };

  return { ids, emetteurs, pas, pGen: (central.generateur === 'aucun' ? 0 : central.puissance * 1000) + capaciteHydro, avecCentral: avecEau };
}

/** Températures d'équilibre (régime permanent), chaque appareil à son réglage. */
export function temperatures(
  plan: Plan,
  pieces: ResultatPiece[],
  hauteurPlafond: number,
  plancherIntermediaire: string,
  cond: Conditions,
  phy: PhysiqueEchanges,
  reg: Regulation,
  inertie?: Inertie,
): ResultatTemperatures {
  const res = reseau(plan, pieces, hauteurPlafond, plancherIntermediaire, phy, reg, inertie);
  const depart = new Map(res.ids.map((id) => [id, 18]));
  const resoudre = (k: number) =>
    res.pas({ tExt: cond.tExterieure, tBase: cond.tBase, soleil: cond.apportsSolaires, interneParM2: cond.apportsInternesParM2, k, dt: Infinity, consigne: (e) => e.consigne }, depart, depart);
  // Générateur trop juste : les radiateurs à eau ne reçoivent qu'une partie de ce qu'ils demandent (recherche par dichotomie)
  let r = resoudre(1);
  let generateurLimite = false;
  if (res.avecCentral && r.eau > res.pGen) {
    generateurLimite = true;
    let bas = 0;
    let haut = 1;
    for (let i = 0; i < 20; i++) {
      const k = (bas + haut) / 2;
      r = resoudre(k);
      if (r.eau > res.pGen) haut = k;
      else bas = k;
    }
  }
  return { temperatures: r.T, emetteurs: r.details, tEau: r.tEau, puissanceCentral: r.eau, generateurLimite, converge: r.converge };
}

/**
 * Journée type, heure par heure : température extérieure sinusoïdale autour de la moyenne, soleil réparti du lever au
 * coucher, programme de chauffage, masse des parois qui stocke et restitue la chaleur. On enchaîne plusieurs journées
 * identiques jusqu'à un régime établi et on garde la dernière.
 */
export function journee(
  plan: Plan,
  pieces: ResultatPiece[],
  hauteurPlafond: number,
  plancherIntermediaire: string,
  cond: Conditions,
  j: Journee,
  phy: PhysiqueEchanges,
  reg: Regulation,
  inertie?: Inertie,
): ResultatJournee {
  const res = reseau(plan, pieces, hauteurPlafond, plancherIntermediaire, phy, reg, inertie);
  const tExt = (h: number) => cond.tExterieure + j.amplitude * Math.cos((2 * Math.PI * (h + 0.5 - j.heureMax)) / 24);
  // Soleil : demi-sinusoïde du lever au coucher, de même énergie sur la journée que l'apport moyen
  const forme = Array.from({ length: 24 }, (_, h) => Math.max(0, Math.sin((Math.PI * (h + 0.5 - j.lever)) / (j.coucher - j.lever))) * (h + 0.5 > j.lever && h + 0.5 < j.coucher ? 1 : 0));
  const sommeForme = forme.reduce((a, b) => a + b, 0) || 1;
  const soleil = (h: number) => new Map([...(cond.apportsSolaires ?? new Map<string, number>())].map(([id, w]) => [id, (w * 24 * forme[h]) / sommeForme]));
  const consigne = (h: number) => (e: Emetteur) => {
    if (heureOccupee(j.programme, h)) return e.consigne;
    // Heures réduites : pas de feu dans un poêle à bois, thermostats à la température réduite
    if (e.genre === 'poele' && e.nature === 'bois') return null;
    return Math.min(e.consigne, j.tReduit);
  };

  // Départ : régime permanent aux conditions moyennes, programme continu
  const moyen = res.pas({ tExt: cond.tExterieure, tBase: cond.tBase, soleil: cond.apportsSolaires, interneParM2: cond.apportsInternesParM2, k: 1, dt: Infinity, consigne: (e) => e.consigne }, new Map(res.ids.map((id) => [id, 18])), new Map());
  let T = moyen.T;
  let masse = moyen.masse;
  const jours = 5;
  const resultat: ResultatJournee = {
    temperatures: new Map(res.ids.map((id) => [id, []])),
    puissances: new Map(res.emetteurs.map((e) => [e.id, []])),
    regimes: new Map(res.emetteurs.map((e) => [e.id, []])),
    occupe: [],
    tExterieure: [],
    tEau: [],
    puissanceCentral: [],
    generateurLimite: false,
    converge: true,
  };
  const veille = new Map<string, number[]>();
  for (let jour = 0; jour < jours; jour++) {
    const dernier = jour === jours - 1;
    for (let h = 0; h < 24; h++) {
      const entrees = { tExt: tExt(h), tBase: cond.tBase, soleil: soleil(h), interneParM2: cond.apportsInternesParM2, dt: 3600, consigne: consigne(h) };
      let k = 1;
      let r = res.pas({ ...entrees, k }, T, masse);
      // Générateur trop juste : on réduit l'émission des radiateurs à eau jusqu'à sa puissance
      for (let i = 0; i < 4 && res.avecCentral && r.eau > res.pGen * 1.001; i++) {
        k *= res.pGen / r.eau;
        r = res.pas({ ...entrees, k }, T, masse);
      }
      T = r.T;
      masse = r.masse;
      if (!dernier) {
        if (jour === jours - 2) for (const id of res.ids) (veille.get(id) ?? veille.set(id, []).get(id)!).push(T.get(id)!);
        continue;
      }
      resultat.converge &&= r.converge;
      if (r.eau >= res.pGen * 0.999 && k < 1) resultat.generateurLimite = true;
      for (const id of res.ids) resultat.temperatures.get(id)!.push(T.get(id)!);
      for (const e of res.emetteurs) {
        resultat.puissances.get(e.id)!.push(r.details.get(e.id)?.puissance ?? 0);
        resultat.regimes.get(e.id)!.push(r.details.get(e.id)?.regime);
      }
      resultat.occupe.push(heureOccupee(j.programme, h));
      resultat.tExterieure.push(entrees.tExt);
      resultat.tEau.push(r.tEau);
      resultat.puissanceCentral.push(r.eau);
    }
  }
  // Régime établi : la dernière journée ressemble à la veille
  for (const id of res.ids) {
    const a = veille.get(id) ?? [];
    const b = resultat.temperatures.get(id)!;
    if (a.some((v, h) => Math.abs(v - b[h]) > 0.5)) resultat.converge = false;
  }
  return resultat;
}

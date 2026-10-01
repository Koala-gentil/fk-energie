/**
 * Hypothèses chiffrées des outils `/outils/`, chacune avec sa source (`sourcesThermique`).
 * Ne rien ajouter sans source. Prix à mettre à jour chaque trimestre (voir `prixDate`).
 */

type Source = { label: string; url: string };

export const sourcesThermique = {
  methode3CL: {
    label: 'Méthode de calcul 3CL-DPE 2021 (arrêté du 31 mars 2021, annexe 1) : température de base, degrés-heures, valeurs U par défaut, apports gratuits, intermittence, rendements',
    url: 'https://rt-re-batiment.developpement-durable.gouv.fr/IMG/pdf/consolide_annexe_1_arrete_du_31_03_2021_relatif_aux_methodes_et_procedures_applicables.pdf',
  },
  ademeConsommation: {
    label: 'ADEME : situation du chauffage domestique au bois en 2022-2023 (consommations moyennes mesurées, tableau 9)',
    url: 'http://fibois-idf.fr/sites/default/files/inline-files/2024.06%20Rapport%20%C3%A9tude%20chauffage%20domestique%20ADEME.pdf',
  },
  granules: {
    label: 'ENplus : exigences de qualité des granulés de bois (ST 1001:2022), pouvoir calorifique minimal',
    url: 'https://enplus-pellets.eu/wp-content/uploads/Documents/ENplus-ST-1001-ENplus-wood-pellets-Requirements-for-companies-5.pdf',
  },
  prixGranules: {
    label: 'Propellet : indice du prix des granulés de bois, 2e trimestre 2026',
    url: 'https://www.propellet.fr/le-granule-de-bois/le-prix-du-granule/',
  },
  prix: {
    label: 'SDES (ministère de la Transition écologique) : conjoncture mensuelle de l’énergie, prix pour les ménages, septembre 2026',
    url: 'https://www.statistiques.developpement-durable.gouv.fr/catalogue?page=datafile&datafileRid=0bf930dc-bfac-4e6f-a063-ec1774c6d029',
  },
  prixElectricite: {
    label: 'EDF : grille du Tarif Bleu (tarif réglementé) au 1er août 2026, d’après la délibération CRE n° 2026-147',
    url: 'https://particulier.edf.fr/content/dam/2-Actifs/Documents/Offres/Grille_prix_Tarif_Bleu.pdf',
  },
  prixGaz: {
    label: 'CRE : prix repère de vente de gaz naturel aux particuliers, octobre 2026',
    url: 'https://www.cre.fr/consommateurs/prix-reperes-et-references/prix-repere-de-vente-de-gaz-naturel-a-destination-des-clients-residentiels.html',
  },
  prixBois: {
    label: 'CEEB : prix et indices nationaux du bois bûche, 2e trimestre 2026 (prix hors TVA)',
    url: 'https://observatoire.franceboisforet.com/wp-content/uploads/2014/06/CEEB_Site-web_2026_T2_sciages-et-bois-energie_web.pdf',
  },
  tvaBois: {
    label: 'BOFiP : taux de TVA de 10 % sur le bois de chauffage (article 278 bis du code général des impôts)',
    url: 'https://bofip.impots.gouv.fr/bofip/14499-PGP.html/identifiant=BOI-ANNX-000509-20250528',
  },
  conversions: {
    label: 'Légifrance : arrêté du 15 septembre 2006, annexe 3 (pouvoir calorifique conventionnel des énergies)',
    url: 'https://www.legifrance.gouv.fr/loda/article_lc/LEGIARTI000043357653',
  },
  scopAirAir: {
    label: 'Règlement (UE) n° 206/2012 : exigences d’écoconception des climatiseurs et pompes à chaleur air/air (SCOP minimal)',
    url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32012R0206',
  },
  pacTemperatures: {
    label: 'Règlement (UE) n° 813/2013 : écoconception des dispositifs de chauffage, applications à basse (35 °C) et moyenne (55 °C) température',
    url: 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32013R0813',
  },
  flammeVerte: {
    label: 'Flamme Verte : règlement et référentiel technique des appareils indépendants (2025)',
    url: 'https://www.flammeverte.org/IMG/pdf/flammeverte_reglement-et-referentiel-technique_appareils-independants-2025.pdf',
  },
  ademeBois: {
    label: 'ADEME : guide « Adopter le chauffage au bois » (octobre 2020), dimensionnement et conversion stère / m³',
    url: 'https://librairie.ademe.fr/ged/7199/guide-adopter-chauffage-bois.pdf',
  },
  cae: {
    label: 'Conseil d’analyse économique : Focus n° 103 (janvier 2024), performance énergétique du logement et consommation réelle',
    url: 'https://cae-eco.fr/static/pdf/focus-103-dpe-230110.pdf',
  },
  ademeBois2016: {
    label: 'ADEME : guide « Se chauffer au bois » (2016), volume de bois plein et masse d’un stère',
    url: 'https://www.cancer-environnement.fr/app/uploads/2023/03/ADEME-2016_Chauffage_au_bois.pdf',
  },
  nfBoisChauffage: {
    label: 'FCBA : référentiel NF Bois de chauffage (NF 444, 2023), humidité sur masse brute et sur masse sèche',
    url: 'https://www.fcba.fr/wp-content/uploads/2023/02/NF444-BOIS-DE-CHAUFFAGE-V6.pdf',
  },
  decretHumidite: {
    label: 'Décret n° 2022-446 du 30 mars 2022 : information sur l’humidité du bois de chauffage (bois sec : 23 % sur masse brute au plus)',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000045441771',
  },
  ademeBien: {
    label: 'ADEME : guide « Comment bien se chauffer au bois ? » (juin 2026), humidité du bois et bonnes pratiques',
    url: 'https://librairie.ademe.fr/energies/7322-comment-bien-se-chauffer-au-bois--9791029726286.html',
  },
  ademeBoisHumidite: {
    label: 'ADEME : guide « Le chauffage au bois, mode d’emploi » (2019), humidité du bois et rendement',
    url: 'https://www.notre-environnement.gouv.fr/IMG/pdf/guide-pratique-chauffage-au-bois-mode-emploi.pdf',
  },
  fcbaStere: {
    label: 'FCBA : prescriptions techniques NF Bois de chauffage (volume d’un stère selon la longueur des bûches)',
    url: 'https://www.fcba.fr/wp-content/uploads/2020/10/prescriptions_techniques_-_bois_de_chauffage.pdf',
  },
  fcbaDensite: {
    label: 'FCBA : Mémento 2020 (masse volumique des essences à 12 % d’humidité)',
    url: 'https://www.fcba.fr/wp-content/uploads/2020/10/memento_2020.pdf',
  },
  pciBois: {
    label: 'CIBE : les unités du bois énergie (synthèse n° 6, 2013), pouvoir calorifique selon l’humidité',
    url: 'https://cibe.fr/wp-content/uploads/2018/08/Synthese_6_Unites_du_BE_v_2013_10_16.pdf',
  },
  radiateurs: {
    label: 'Purmo : catalogue technique des radiateurs à panneaux (puissances selon EN 442, régime 75/65/20 °C)',
    url: 'https://www.purmo.com/docs/Purmo-technical-catalogue-full-panel-radiators-10_2021_EN.pdf',
  },
  radiateursFonte: {
    label: 'Viadrus : catalogue des radiateurs en fonte Kalor (puissances selon EN 442-2)',
    url: 'https://www.hydronicsupplies.com.au/wp-content/uploads/2015/04/Viadrus-Catalogue-2016.pdf',
  },
} satisfies Record<string, Source>;

const dh19Mois = [11712.4, 9966.8, 7922.7, 5877.4, 2762.0, 0, 0, 0, 2264.1, 3645.4, 6861.0, 9573.3];

/** Climat du Nord et du Pas-de-Calais (zone H1a). */
export const climat = {
  /** Consigne de chauffage de référence (méthode 3CL). */
  tInterieure: 19,
  /** Température extérieure de base, zone H1, altitude < 400 m (méthode 3CL). */
  tBase: -9.5,
  tBaseLabel: 'la température extérieure de base retenue par la méthode officielle du DPE pour le Nord et le Pas-de-Calais',
  /** Degrés-heures base 19 °C de la saison de chauffe, zone H1a sous 400 m (3CL § 18.2), de janvier à décembre. */
  dh19Mois: dh19Mois,
  /** Somme annuelle des degrés-heures (°C·h). */
  dh19: dh19Mois.reduce((a, b) => a + b, 0),
};

/**
 * Coefficient G (W/m³·K) par période de construction. Aucun barème officiel n'existe : G est calculé avec les valeurs U,
 * ponts thermiques et débits d'air par défaut de la méthode 3CL, pour une maison de référence de 100 m² à étage
 * (`research/coefficient-g-3cl.md`, script `research/calculs/coefficient-g-3cl.py`). `G` : maison non mitoyenne,
 * `Gmitoyen` : mitoyenne d'un côté. Tranches regroupées : 1975-1988 = moyenne de 1975-82 et 1983-88 ; 2001-2012 =
 * moyenne de 2001-05 et 2006-12.
 * `apports` : part annuelle du besoin couverte par les apports gratuits (soleil, occupants), 3CL § 6.1, calculée pour
 * la même maison (`research/calculs/apports-gratuits-3cl.py`).
 */
export const isolations: { value: string; label: string; short: string; hint: string; G: number; Gmitoyen: number; apports: number }[] = [
  { value: 'ancienne', label: 'Avant 1975, jamais isolée', short: 'Avant 1975', hint: 'Murs sans isolant, simple vitrage', G: 2.65, Gmitoyen: 2.25, apports: 0.136 },
  { value: 'ancienne-renovee', label: 'Avant 1975, en partie rénovée', short: 'Avant 1975 rénovée', hint: 'Combles isolés et double vitrage, murs d’origine', G: 1.95, Gmitoyen: 1.55, apports: 0.158 },
  { value: 'annees-80', label: 'Construite de 1975 à 1988', short: '1975-1988', hint: 'Premières réglementations thermiques', G: 1.35, Gmitoyen: 1.175, apports: 0.234 },
  { value: 'annees-90', label: 'Construite de 1989 à 2000', short: '1989-2000', hint: 'Isolation des murs et des combles d’origine', G: 1.1, Gmitoyen: 0.95, apports: 0.275 },
  { value: 'annees-2000', label: 'Construite de 2001 à 2012', short: '2001-2012', hint: 'RT 2000 et RT 2005', G: 0.9, Gmitoyen: 0.75, apports: 0.307 },
  { value: 'recente', label: 'Construite depuis 2013', short: 'Depuis 2013', hint: 'RT 2012, RE 2020', G: 0.65, Gmitoyen: 0.6, apports: 0.394 },
];

export const maisons = [
  { value: 'isolee', label: 'Non mitoyenne' },
  { value: 'mitoyenne', label: 'Mitoyenne' },
];

/** Isolation choisie et coefficient G correspondant (maison non mitoyenne par défaut). */
export const isolationDe = (value: unknown, maison?: unknown) => {
  const isolation = isolations.find((i) => i.value === value) ?? isolations[2];
  return { ...isolation, G: maison === 'mitoyenne' ? isolation.Gmitoyen : isolation.G };
};

/** Poêles domestiques : « entre 4 et 12 kW » en général (ADEME, Adopter le chauffage au bois, 2020, p. 15). */
export const poele = { puissanceMin: 4, puissanceMax: 12 };

/** Granulés de bois. */
export const granules = {
  /** PCI minimal ENplus A1 (kWh/kg). */
  pci: 4.6,
  sacKg: 15,
  /** Palette « d'environ 65 sacs » (Propellet). */
  sacsParPalette: 65,
  /** Prix TTC (€/t), Propellet / SDES, 2e trimestre 2026. */
  prixSac: 385,
  prixVrac: 388,
  prixDate: '2e trimestre 2026',
  /** Poêle à granulés Flamme Verte installé depuis 2020 (3CL, Rg), pour la consommation horaire à pleine puissance. */
  rendementPoele: 0.87,
  /**
   * Consommations moyennes mesurées (t/an) : enquête ADEME 2022-2023 (poêle 1,2 à 1,3 t, chaudière 2,2 à 2,8 t) et
   * enquête Propellet / Viavoice 2023 (poêle 1,5 t, chaudière 3,5 t).
   */
  mesures: { poele: [1.2, 1.3], chaudiere: [2.2, 2.8] },
};

export type EnergieId = 'fioul' | 'gaz' | 'electricite' | 'granulesVrac' | 'granulesSac' | 'bois';

/** Énergies achetées : pouvoir calorifique (kWh PCI par unité, arrêté du 15/09/2006) et prix moyen TTC par unité. */
export const energies: Record<EnergieId, { label: string; unite: string; pci: number; prix: number; prixDate: string }> = {
  fioul: { label: 'Fioul', unite: 'litre', pci: 9.97, prix: 1.68, prixDate: 'août 2026 (SDES)' },
  /** Le gaz est facturé en kWh PCS : 1 kWh PCS = 1/1,11 kWh PCI. */
  gaz: { label: 'Gaz naturel', unite: 'kWh', pci: 1 / 1.11, prix: 0.1456, prixDate: 'octobre 2026 (prix repère CRE)' },
  electricite: { label: 'Électricité', unite: 'kWh', pci: 1, prix: 0.2001, prixDate: 'août 2026 (Tarif Bleu, option Base)' },
  granulesVrac: { label: 'Granulés en vrac', unite: 'tonne', pci: 4600, prix: 388, prixDate: '2e trimestre 2026 (Propellet)' },
  granulesSac: { label: 'Granulés en sacs', unite: 'tonne', pci: 4600, prix: 385, prixDate: '2e trimestre 2026 (Propellet)' },
  /** CEEB, bûches 33-40 cm sèches, prix départ (hors livraison) 88,7 € HT + TVA 10 %. */
  bois: { label: 'Bois bûche', unite: 'stère', pci: 1680, prix: 97.6, prixDate: '2e trimestre 2026 (CEEB, hors livraison)' },
};

/**
 * Systèmes comparés, avec un seul référentiel, la méthode 3CL :
 * - `rendement` : rendement annuel de génération (§ 13.2 pour une chaudière de 20 kW, § 13.1 pour les poêles Flamme Verte
 *   récents) ou SCOP par défaut des pompes à chaleur (§ 12.4.2, zones H1-H2) ;
 * - `installation` : émission × distribution × régulation (§ 12.1 à 12.3) ;
 * - `I0` : intermittence de base, maison individuelle sans équipement d'intermittence (§ 8) : 0,88 en chauffage central
 *   sur radiateurs, 0,84 en chauffage divisé.
 * `portee` : `central` chauffe toute la maison (et peut remplacer un chauffage central), `piece` surtout la pièce de vie.
 * `fk` : solution installée par FK Énergie. `defaut` : exemple de consommation annuelle proposé à la saisie.
 */
export type Systeme = {
  id: string;
  label: string;
  nom: string;
  energie: EnergieId;
  rendement: number;
  installation: number;
  I0: number;
  portee: 'central' | 'piece';
  fk: boolean;
  defaut: number;
};

/** Radiateurs à eau, réseau individuel isolé : haute température (chaudières) ou moyenne/basse (pompe à chaleur). */
const radiateursEauHT = 0.95 * 0.92 * 0.95;
const radiateursEauBT = 0.95 * 0.95 * 0.95;

export const systemes: Systeme[] = [
  /** Chaudière fioul classique : rendement annuel ≈ 0,81 (Rpn 84 + 2 log Pn, Rpint 80 + 3 log Pn, pertes à l'arrêt). */
  { id: 'fioul', label: 'Chaudière fioul', nom: 'la chaudière fioul', energie: 'fioul', rendement: 0.81, installation: radiateursEauHT, I0: 0.88, portee: 'central', fk: false, defaut: 2000 },
  /** Chaudière gaz à condensation depuis 2016 : ≈ 1,03 sur PCI (Rpint 103 + 2,5 log Pn). */
  { id: 'gaz', label: 'Chaudière gaz à condensation', nom: 'la chaudière gaz à condensation', energie: 'gaz', rendement: 1.03, installation: radiateursEauHT, I0: 0.88, portee: 'central', fk: false, defaut: 15000 },
  /** Radiateurs électriques NF : émission 0,97, régulation 0,99. */
  { id: 'electrique', label: 'Radiateurs électriques', nom: 'les radiateurs électriques', energie: 'electricite', rendement: 1, installation: 0.97 * 0.99, I0: 0.84, portee: 'central', fk: false, defaut: 10000 },
  /** SCOP par défaut 3CL, PAC air/eau sur radiateurs installée depuis 2017. */
  { id: 'pac-air-eau', label: 'Pompe à chaleur air/eau', nom: 'la pompe à chaleur air/eau', energie: 'electricite', rendement: 2.8, installation: radiateursEauBT, I0: 0.88, portee: 'central', fk: true, defaut: 5000 },
  /** SCOP par défaut 3CL, PAC air/air installée depuis 2015 ; soufflage 0,95, fluide frigorigène sans pertes, air soufflé 0,96. */
  { id: 'pac-air-air', label: 'Pompe à chaleur air/air', nom: 'la pompe à chaleur air/air', energie: 'electricite', rendement: 3, installation: 0.95 * 0.96, I0: 0.84, portee: 'piece', fk: true, defaut: 3000 },
  /** Chaudière granulés après 2019 : rendement annuel ≈ 0,87 (Rpn 91 + 2 log Pn, Rpint 88 + 2 log Pn, pertes à l'arrêt). */
  { id: 'chaudiere-granules', label: 'Chaudière à granulés', nom: 'la chaudière à granulés', energie: 'granulesVrac', rendement: 0.87, installation: radiateursEauHT, I0: 0.88, portee: 'central', fk: true, defaut: 4 },
  /** Poêle à granulés Flamme Verte installé depuis 2020 (Rg 0,87) ; émission 0,95, régulation d'un poêle 0,8. */
  { id: 'poele-granules', label: 'Poêle à granulés', nom: 'le poêle à granulés', energie: 'granulesSac', rendement: 0.87, installation: 0.95 * 0.8, I0: 0.84, portee: 'piece', fk: true, defaut: 2 },
  /** Poêle à bûches Flamme Verte installé depuis 2018 (Rg 0,75) ; émission 0,95, régulation d'un poêle 0,8. */
  { id: 'poele-bois', label: 'Poêle à bois', nom: 'le poêle à bois', energie: 'bois', rendement: 0.75, installation: 0.95 * 0.8, I0: 0.84, portee: 'piece', fk: true, defaut: 8 },
];

export const systeme = (id: string) => systemes.find((s) => s.id === id)!;

type Hauteur = { h: number; w: number };

/** Radiateurs à eau : puissance à ΔT 50 K (régime 75/65/20 °C, EN 442). */
export const radiateurs = {
  /** Exposant de la courbe d'émission : de 1,28 à 1,36 selon les modèles Purmo. */
  n: 1.3,
  tAmbiante: 20,
  types: [
    { value: 'acier-22', label: 'Acier, 2 panneaux (type 22)', mesure: 'longueur', hauteurs: [{ h: 300, w: 961 }, { h: 450, w: 1347 }, { h: 600, w: 1709 }, { h: 900, w: 2388 }] },
    { value: 'acier-11', label: 'Acier, 1 panneau (type 11)', mesure: 'longueur', hauteurs: [{ h: 300, w: 546 }, { h: 450, w: 790 }, { h: 600, w: 1018 }, { h: 900, w: 1427 }] },
    { value: 'acier-21', label: 'Acier, 2 panneaux, 1 rang d’ailettes (type 21)', mesure: 'longueur', hauteurs: [{ h: 300, w: 761 }, { h: 450, w: 1060 }, { h: 600, w: 1340 }, { h: 900, w: 1861 }] },
    { value: 'acier-33', label: 'Acier, 3 panneaux (type 33)', mesure: 'longueur', hauteurs: [{ h: 300, w: 1347 }, { h: 450, w: 1869 }, { h: 600, w: 2356 }, { h: 900, w: 3260 }] },
    { value: 'fonte', label: 'Fonte, épais (environ 16 cm)', mesure: 'elements', hauteurs: [{ h: 430, w: 70 }, { h: 580, w: 94 }, { h: 680, w: 110 }, { h: 980, w: 152 }] },
    { value: 'fonte-fine', label: 'Fonte, fin (environ 7 cm)', mesure: 'elements', hauteurs: [{ h: 580, w: 53 }, { h: 980, w: 89 }] },
    { value: 'fonte-large', label: 'Fonte, très épais (environ 22 cm)', mesure: 'elements', hauteurs: [{ h: 580, w: 120 }] },
    { value: 'connue', label: 'Puissance connue', mesure: 'puissance', hauteurs: [] },
  ] as { value: string; label: string; mesure: 'longueur' | 'elements' | 'puissance'; hauteurs: Hauteur[] }[],
};

/** Pompe à chaleur air/eau : température de départ d'eau selon les radiateurs. */
export const pac = {
  /** Écart départ / retour des essais en moyenne température : 55/47 °C (règlement 813/2013, annexe III, tableau 3). */
  ecartDepartRetour: 8,
  /** Départ du régime nominal des radiateurs (75/65/20 °C, EN 442) : au-delà, ils sont plus sollicités que prévu. */
  departNominalRadiateurs: 75,
  /** Température de conception en climat moyen pour la puissance « Prated » des fiches produits (règlement 813/2013). */
  tConceptionPrated: -10,
  niveaux: [
    {
      max: 35,
      label: 'Jusqu’à 35 °C',
      texte: 'la basse température, régime de référence des pompes à chaleur sur plancher chauffant, où elles sont le plus efficaces',
      verdict: 'Excellent : d’après notre estimation, vos radiateurs suffisent même à basse température, le régime où la pompe à chaleur est la plus efficace.',
    },
    {
      max: 55,
      label: 'De 35 à 55 °C',
      texte: 'la moyenne température, régime de référence européen des pompes à chaleur sur radiateurs',
      verdict: 'D’après notre estimation, vos radiateurs conviennent à une pompe à chaleur air/eau classique, en moyenne température.',
    },
    {
      max: 75,
      label: 'De 55 à 75 °C',
      texte: 'il faut une pompe à chaleur haute température, dont le rendement est plus faible, ou remplacer les radiateurs les plus justes',
      verdict: 'D’après notre estimation, il faudrait une pompe à chaleur haute température, au rendement plus faible, ou remplacer les radiateurs les plus justes.',
    },
  ],
  verdictHorsNorme:
    'C’est plus chaud que le régime pour lequel des radiateurs sont prévus (75 °C). Avez-vous déclaré tous les radiateurs de la maison ? Si oui, notre estimation des déperditions, volontairement prudente, est peut-être trop forte : faites le test décrit plus bas, et parlons-en.',
};

/** Bois bûche. */
export const bois = {
  /** Énergie perdue à évaporer l'eau : 6,8 kWh par tonne et par point d'humidité (CIBE), soit 0,68 kWh/kg. */
  chaleurVaporisation: 0.68,
  /** Humidité idéale, sur masse brute : 20 % au plus (ADEME 2019, NF Bois de chauffage). Référence du bois « sec ». */
  humiditeIdeale: 20,
  /** Humidité maximale d'un bois « sec » : 23 % sur masse brute (décret n° 2022-446, repris par l'ADEME en 2026). */
  humiditeMax: 23,
  /**
   * « Des bûches à 40 % d'humidité provoquent une perte de rendement d'environ 25 % par rapport à des bûches à 20 % »
   * (ADEME 2019). Lu comme une baisse relative du rendement de l'appareil, la lecture la plus prudente.
   */
  bucheHumide: { humidite: 40, perteRendement: 0.25 },
  /** Volume apparent (m³) d'un stère recoupé (FCBA, NF Bois de chauffage). */
  longueurs: [
    { value: '100', label: '1 m', mab: 1 },
    { value: '50', label: '50 cm', mab: 0.8 },
    { value: '40', label: '40 cm', mab: 0.74 },
    { value: '33', label: '33 cm', mab: 0.7 },
    { value: '25', label: '25 cm', mab: 0.6 },
  ],
  /**
   * Masse de bois sec par stère (kg) : infradensité (masse sèche par m³ de bois frais = masse volumique du bois vert ×
   * siccité, FCBA, Mémento 2020) × 0,6 m³ de bois plein par stère (ADEME 2016). PCI du bois sec (kWh/kg) : 5,0 pour les
   * feuillus, 5,3 pour les résineux (CIBE).
   */
  essences: [
    { value: 'chene', label: 'Chêne', masseSeche: 950 * 0.61 * 0.6, pciAnhydre: 5.0 },
    { value: 'hetre', label: 'Hêtre', masseSeche: 1025 * 0.6 * 0.6, pciAnhydre: 5.0 },
    { value: 'resineux', label: 'Résineux (épicéa)', masseSeche: 790 * 0.47 * 0.6, pciAnhydre: 5.3 },
  ],
  /** Humidité maximale du curseur : un chêne fraîchement abattu est autour de 39 % (siccité 0,61, FCBA). */
  humiditeCurseurMax: 50,
};

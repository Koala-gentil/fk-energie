/**
 * Plans de départ de l'éditeur. Les réglages d'enveloppe proposés sont des exemples de saisie, à adapter par
 * l'utilisateur ; ils ne décrivent pas une maison réelle.
 */
import { centralParDefaut, poeleParDefaut, type Plan, type Ouverture } from './geometrie';

type O = Omit<Ouverture, 'id' | 'hauteur'> & { hauteur?: number };
const ouvertures = (liste: O[]): Ouverture[] =>
  liste.map((o, i) => ({ id: `o${i + 1}`, hauteur: o.hauteur ?? (o.type === 'fenetre' ? 1.25 : o.type === 'porte' && o.ouverte !== undefined ? 2.05 : 2.15), ...o }));

/** Murs mitoyens sur toute la hauteur d'un côté vertical (x fixe, de y0 à y1) d'un niveau. */
const mitoyenVertical = (niveau: number, x: number, y0: number, y1: number) => Array.from({ length: y1 - y0 }, (_, i) => `${niveau}|v:${x}:${y0 + i}`);

export type Modele = { id: string; label: string; plan: () => Plan; enveloppe: Record<string, string> };

export const modeles: Modele[] = [
  {
    id: 'plain-pied',
    label: 'Maison de plain-pied avec garage',
    enveloppe: { annee: '1978-1982', murMatiere: 'parpaing', murEpaisseur: '20', murIsolant: 'inconnu', murIsolantEpaisseur: '8', plafond: 'combles-perdus', plafondIsolant: 'inconnu', plafondIsolantEpaisseur: '20', plancher: 'terre-plein', plancherIsolant: 'aucun', vitrage: 'double-ancien', ventilation: 'vmc-autoreglable', plancherIntermediaire: 'bois' },
    plan: () => ({
      nord: 'haut',
      niveaux: 1,
      mitoyens: [],
      escaliers: [],
      pieces: [
        { id: 'p1', nom: 'Séjour', type: 'sejour', niveau: 0, x: 4, y: 4, w: 16, h: 10 },
        { id: 'p2', nom: 'Cuisine', type: 'cuisine', niveau: 0, x: 20, y: 4, w: 8, h: 10 },
        { id: 'p3', nom: 'Couloir', type: 'circulation', niveau: 0, x: 4, y: 14, w: 24, h: 2 },
        { id: 'p4', nom: 'Chambre 1', type: 'chambre', niveau: 0, x: 4, y: 16, w: 8, h: 8 },
        { id: 'p5', nom: 'Salle de bain', type: 'sdb', niveau: 0, x: 12, y: 16, w: 6, h: 8 },
        { id: 'p6', nom: 'Chambre 2', type: 'chambre', niveau: 0, x: 18, y: 16, w: 10, h: 8 },
        { id: 'p7', nom: 'Garage', type: 'non-chauffe', niveau: 0, x: 28, y: 4, w: 10, h: 12 },
      ],
      ouvertures: ouvertures([
        { type: 'porte-fenetre', niveau: 0, sens: 'h', x: 8, y: 4, longueur: 4 },
        { type: 'fenetre', niveau: 0, sens: 'v', x: 4, y: 7, longueur: 3 },
        { type: 'fenetre', niveau: 0, sens: 'h', x: 22, y: 4, longueur: 2 },
        { type: 'porte', niveau: 0, sens: 'v', x: 28, y: 14, longueur: 2 },
        { type: 'fenetre', niveau: 0, sens: 'v', x: 4, y: 18, longueur: 3 },
        { type: 'fenetre', niveau: 0, sens: 'h', x: 14, y: 24, longueur: 2 },
        { type: 'porte-fenetre', niveau: 0, sens: 'h', x: 21, y: 24, longueur: 4 },
        { type: 'fenetre', niveau: 0, sens: 'v', x: 28, y: 19, longueur: 3 },
        { type: 'porte', niveau: 0, sens: 'v', x: 4, y: 14, longueur: 2 },
        { type: 'fenetre', niveau: 0, sens: 'h', x: 6, y: 24, longueur: 3 },
        { type: 'porte', niveau: 0, sens: 'h', x: 10, y: 14, longueur: 2, ouverte: true },
        { type: 'porte', niveau: 0, sens: 'h', x: 24, y: 14, longueur: 2, ouverte: true },
        { type: 'porte', niveau: 0, sens: 'h', x: 9, y: 16, longueur: 2, ouverte: true },
        { type: 'porte', niveau: 0, sens: 'h', x: 14, y: 16, longueur: 2, ouverte: false },
        { type: 'porte', niveau: 0, sens: 'h', x: 21, y: 16, longueur: 2, ouverte: true },
        { type: 'porte', niveau: 0, sens: 'v', x: 20, y: 9, longueur: 2, ouverte: true },
      ]),
      emetteurs: [poeleParDefaut('poele1', 'p1', 17, 6)],
      central: centralParDefaut(),
    }),
  },
  {
    id: 'etage',
    label: 'Maison à étage',
    enveloppe: { annee: '1989-2000', murMatiere: 'parpaing', murEpaisseur: '20', murIsolant: 'inconnu', murIsolantEpaisseur: '10', plafond: 'combles-perdus', plafondIsolant: 'inconnu', plafondIsolantEpaisseur: '20', plancher: 'vide-sanitaire', plancherIsolant: 'inconnu', vitrage: 'double-ancien', ventilation: 'vmc-autoreglable', plancherIntermediaire: 'beton' },
    plan: () => ({
      nord: 'haut',
      niveaux: 2,
      mitoyens: [],
      escaliers: [{ id: 'e1', niveau: 0, x: 17, y: 11, w: 2, h: 5 }],
      pieces: [
        { id: 'p1', nom: 'Séjour', type: 'sejour', niveau: 0, x: 4, y: 4, w: 12, h: 13 },
        { id: 'p2', nom: 'Cuisine', type: 'cuisine', niveau: 0, x: 16, y: 4, w: 6, h: 7 },
        { id: 'p3', nom: 'Entrée', type: 'circulation', niveau: 0, x: 16, y: 11, w: 6, h: 6 },
        { id: 'p4', nom: 'Chambre 1', type: 'chambre', niveau: 1, x: 4, y: 4, w: 8, h: 7 },
        { id: 'p5', nom: 'Chambre 2', type: 'chambre', niveau: 1, x: 12, y: 4, w: 6, h: 7 },
        { id: 'p6', nom: 'Salle de bain', type: 'sdb', niveau: 1, x: 18, y: 4, w: 4, h: 7 },
        { id: 'p7', nom: 'Chambre 3', type: 'chambre', niveau: 1, x: 4, y: 11, w: 6, h: 6 },
        { id: 'p8', nom: 'Palier', type: 'circulation', niveau: 1, x: 10, y: 11, w: 12, h: 6 },
      ],
      ouvertures: ouvertures([
        { type: 'porte-fenetre', niveau: 0, sens: 'h', x: 7, y: 17, longueur: 4 },
        { type: 'fenetre', niveau: 0, sens: 'v', x: 4, y: 7, longueur: 3 },
        { type: 'fenetre', niveau: 0, sens: 'h', x: 8, y: 4, longueur: 3 },
        { type: 'fenetre', niveau: 0, sens: 'h', x: 18, y: 4, longueur: 2 },
        { type: 'porte', niveau: 0, sens: 'v', x: 22, y: 13, longueur: 2 },
        { type: 'porte', niveau: 0, sens: 'v', x: 16, y: 7, longueur: 2, ouverte: true },
        { type: 'porte', niveau: 0, sens: 'v', x: 16, y: 14, longueur: 2, ouverte: true },
        { type: 'porte', niveau: 0, sens: 'h', x: 19, y: 11, longueur: 2, ouverte: true },
        { type: 'fenetre', niveau: 1, sens: 'h', x: 6, y: 4, longueur: 3 },
        { type: 'fenetre', niveau: 1, sens: 'v', x: 4, y: 6, longueur: 2 },
        { type: 'fenetre', niveau: 1, sens: 'h', x: 14, y: 4, longueur: 2 },
        { type: 'fenetre', niveau: 1, sens: 'h', x: 19, y: 4, longueur: 2 },
        { type: 'fenetre', niveau: 1, sens: 'v', x: 4, y: 13, longueur: 2 },
        { type: 'fenetre', niveau: 1, sens: 'h', x: 6, y: 17, longueur: 2 },
        { type: 'fenetre', niveau: 1, sens: 'h', x: 14, y: 17, longueur: 2 },
        { type: 'porte', niveau: 1, sens: 'h', x: 10, y: 11, longueur: 2, ouverte: true },
        { type: 'porte', niveau: 1, sens: 'h', x: 14, y: 11, longueur: 2, ouverte: true },
        { type: 'porte', niveau: 1, sens: 'h', x: 19, y: 11, longueur: 2, ouverte: false },
        { type: 'porte', niveau: 1, sens: 'v', x: 10, y: 14, longueur: 2, ouverte: true },
      ]),
      emetteurs: [poeleParDefaut('poele1', 'p1', 13, 8)],
      central: centralParDefaut(),
    }),
  },
  {
    id: 'maison-de-ville',
    label: 'Maison de ville mitoyenne (à étage)',
    enveloppe: { annee: 'avant-1948', murMatiere: 'brique-pleine', murEpaisseur: '23', murIsolant: 'aucun', plafond: 'combles-perdus', plafondIsolant: 'laine-verre', plafondIsolantEpaisseur: '10', plancher: 'cave', plancherIsolant: 'aucun', vitrage: 'double-ancien', ventilation: 'fenetres', plancherIntermediaire: 'bois' },
    plan: () => ({
      nord: 'haut',
      niveaux: 2,
      mitoyens: [...mitoyenVertical(0, 4, 4, 24), ...mitoyenVertical(0, 14, 4, 24), ...mitoyenVertical(1, 4, 4, 24), ...mitoyenVertical(1, 14, 4, 24)],
      escaliers: [{ id: 'e1', niveau: 0, x: 5, y: 13, w: 2, h: 5 }],
      pieces: [
        { id: 'p1', nom: 'Salon', type: 'sejour', niveau: 0, x: 4, y: 4, w: 10, h: 8 },
        { id: 'p2', nom: 'Salle à manger', type: 'sejour', niveau: 0, x: 4, y: 12, w: 10, h: 6 },
        { id: 'p3', nom: 'Cuisine', type: 'cuisine', niveau: 0, x: 4, y: 18, w: 10, h: 6 },
        { id: 'p4', nom: 'Chambre 1', type: 'chambre', niveau: 1, x: 4, y: 4, w: 10, h: 8 },
        { id: 'p5', nom: 'Palier', type: 'circulation', niveau: 1, x: 4, y: 12, w: 4, h: 6 },
        { id: 'p6', nom: 'Salle de bain', type: 'sdb', niveau: 1, x: 8, y: 12, w: 6, h: 6 },
        { id: 'p7', nom: 'Chambre 2', type: 'chambre', niveau: 1, x: 4, y: 18, w: 10, h: 6 },
      ],
      ouvertures: ouvertures([
        { type: 'porte', niveau: 0, sens: 'h', x: 5, y: 4, longueur: 2 },
        { type: 'fenetre', niveau: 0, sens: 'h', x: 9, y: 4, longueur: 3 },
        { type: 'porte', niveau: 0, sens: 'h', x: 9, y: 12, longueur: 3, ouverte: true },
        { type: 'porte', niveau: 0, sens: 'h', x: 9, y: 18, longueur: 2, ouverte: true },
        { type: 'porte-fenetre', niveau: 0, sens: 'h', x: 5, y: 24, longueur: 3 },
        { type: 'fenetre', niveau: 0, sens: 'h', x: 10, y: 24, longueur: 2 },
        { type: 'fenetre', niveau: 1, sens: 'h', x: 6, y: 4, longueur: 3 },
        { type: 'fenetre', niveau: 1, sens: 'h', x: 6, y: 24, longueur: 3 },
        { type: 'porte', niveau: 1, sens: 'h', x: 5, y: 12, longueur: 2, ouverte: true },
        { type: 'porte', niveau: 1, sens: 'v', x: 8, y: 13, longueur: 2, ouverte: false },
        { type: 'porte', niveau: 1, sens: 'h', x: 6, y: 18, longueur: 2, ouverte: true },
      ]),
      emetteurs: [poeleParDefaut('poele1', 'p1', 12, 10)],
      central: centralParDefaut(),
    }),
  },
];

export const planExemple = () => modeles[0].plan();

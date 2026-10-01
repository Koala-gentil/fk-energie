import { poele } from '../data/thermique';

export type Appareil = 'granules' | 'bois';
export type Pieces = 'ouverte' | 'plusieurs' | 'radiateurs';

const types: Record<Appareil, Record<Pieces, string>> = {
  granules: {
    ouverte: 'Un poêle à granulés à air',
    plusieurs: 'Un poêle à granulés canalisable',
    radiateurs: 'Un poêle à granulés hydro, raccordé aux radiateurs,',
  },
  bois: {
    ouverte: 'Un poêle à bois',
    plusieurs: 'Un poêle à bois, portes ouvertes vers les autres pièces,',
    radiateurs: '',
  },
};

/** Conseil affiché sous la puissance calculée (kW), et projet à préselectionner dans le formulaire de contact. */
export const conseilPoele = (kw: number, appareil: Appareil, pieces: Pieces): { texte: string; projet: string } => {
  if (appareil === 'bois' && pieces === 'radiateurs') {
    return {
      texte: 'Pour chauffer toute la maison au bois par les radiateurs, on installe plutôt une chaudière à bûches, plus adaptée qu’un poêle.',
      projet: 'chaudiere',
    };
  }
  if (kw > poele.puissanceMax) {
    return {
      texte: `C’est plus qu’un poêle ne peut fournir : les poêles domestiques font en général ${poele.puissanceMin} à ${poele.puissanceMax} kW. Mieux vaut isoler d’abord, ou étudier une chaudière ou une pompe à chaleur, avec le poêle en complément.`,
      projet: appareil,
    };
  }
  const hydro = appareil === 'granules' && pieces === 'radiateurs' ? ' Sa puissance se partage entre l’eau des radiateurs et la pièce où il est installé.' : '';
  if (kw < poele.puissanceMin) {
    return {
      texte: `Votre besoin est faible : ${types[appareil][pieces].replace(/^Un /, 'un ')} parmi les plus petits du marché, autour de ${poele.puissanceMin} kW, suffira.${hydro}`,
      projet: appareil,
    };
  }
  return { texte: `${types[appareil][pieces]} d’environ ${Math.round(kw)} kW.${hydro}`, projet: appareil };
};

export type Slot = [string, string];

/** open : ouvert ; soon : ferme ou ouvre dans moins de 30 min ; break : pause du midi ; closed : fermé jusqu'au lendemain ou plus. */
export type OpenState = 'open' | 'soon' | 'break' | 'closed';

/** Délai (en minutes) sous lequel on annonce « ferme bientôt » / « ouvre bientôt ». */
const SOON = 30;

const DAYS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
const hm = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
const fmt = (t: string) => t.replace(/^0/, '').replace(':00', 'h').replace(':', 'h');

/**
 * État des showrooms à un instant donné.
 * `schedule` : créneaux par jour (0 = dimanche) ; `day` et `now` (minutes depuis minuit) à l'heure de Paris.
 */
export function openStatus(schedule: Slot[][], day: number, now: number): { state: OpenState; short: string; long: string } {
  const slots = schedule[day] ?? [];
  const i = slots.findIndex(([from, to]) => now >= hm(from) && now < hm(to));

  if (i >= 0) {
    const close = slots[i][1];
    const reopen = slots[i + 1]?.[0]; // réouverture le jour même : la fermeture n'est qu'une pause
    if (hm(close) - now <= SOON) {
      return reopen
        ? { state: 'soon', short: `Pause à ${fmt(close)}`, long: `Pause à ${fmt(close)} · réouvre à ${fmt(reopen)}` }
        : { state: 'soon', short: 'Ferme bientôt', long: `Ferme bientôt · à ${fmt(close)}` };
    }
    return reopen
      ? { state: 'open', short: 'Ouvert', long: `Ouvert · pause de ${fmt(close)} à ${fmt(reopen)}` }
      : { state: 'open', short: 'Ouvert', long: `Ouvert · jusqu’à ${fmt(close)}` };
  }

  const next = slots.find(([from]) => hm(from) > now);
  if (next) {
    const isBreak = slots.some(([, to]) => hm(to) <= now);
    const verb = isBreak ? 'Réouvre' : 'Ouvre';
    if (hm(next[0]) - now <= SOON) {
      return { state: 'soon', short: `${verb} bientôt`, long: `${verb} bientôt · à ${fmt(next[0])}` };
    }
    return isBreak
      ? { state: 'break', short: 'Pause déjeuner', long: `Pause déjeuner · réouvre à ${fmt(next[0])}` }
      : { state: 'closed', short: 'Fermé', long: `Fermé · ouvre à ${fmt(next[0])}` };
  }

  for (let d = 1; d <= 7; d++) {
    const first = schedule[(day + d) % 7]?.[0];
    if (first) {
      const when = d === 1 ? 'demain' : DAYS[(day + d) % 7];
      return { state: 'closed', short: 'Fermé', long: `Fermé · ouvre ${when} à ${fmt(first[0])}` };
    }
  }
  return { state: 'closed', short: 'Fermé', long: 'Fermé' };
}

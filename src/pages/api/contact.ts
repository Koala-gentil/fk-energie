import type { APIRoute } from 'astro';
import { RESEND_API_KEY, CONTACT_EMAIL_TO, CONTACT_EMAIL_FROM, TURNSTILE_SECRET_KEY } from 'astro:env/server';
import { site, showrooms } from '../../data/site';
import { communes } from '../../data/communes';

// Fonction serverless (Vercel) : le reste du site est statique.
export const prerender = false;

const PROJECTS: Record<string, string> = {
  granules: 'Poêle à granulés',
  bois: 'Poêle à bois',
  pac: 'Pompe à chaleur',
  chaudiere: 'Chaudière',
  insert: 'Insert / cheminée',
  entretien: 'Entretien / SAV',
};
const MAX_PHOTOS = 6;
const MAX_TOTAL_BYTES = 4_200_000; // limite de corps des fonctions Vercel : 4,5 Mo

// Limite par adresse IP, gardée en mémoire de l'instance : Vercel réutilise ses instances (Fluid compute), ce qui arrête
// les rafales d'un même robot. Seuls les envois réussis comptent, pour qu'une erreur puisse être corrigée et renvoyée.
const PER_IP = [
  { ms: 3_600_000, max: 2 },
  { ms: 24 * 3_600_000, max: 3 },
];
const sentByIp = new Map<string, number[]>();

const recentSends = (ip: string, now: number) => (sentByIp.get(ip) ?? []).filter((t) => now - t < PER_IP[PER_IP.length - 1].ms);
const overLimit = (ip: string, now = Date.now()) => {
  const list = recentSends(ip, now);
  return PER_IP.some(({ ms, max }) => list.filter((t) => now - t < ms).length >= max);
};
const recordSend = (ip: string, now = Date.now()) => {
  if (sentByIp.size > 5000) sentByIp.clear(); // garde-fou mémoire face à beaucoup d'adresses différentes
  sentByIp.set(ip, [...recentSends(ip, now), now]);
};

// Vérification Cloudflare Turnstile, active seulement si TURNSTILE_SECRET_KEY est définie
const humanVerified = async (token: FormDataEntryValue | null, ip: string) => {
  if (!TURNSTILE_SECRET_KEY) return true;
  if (typeof token !== 'string' || !token) return false;
  try {
    const res = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      body: new URLSearchParams({ secret: TURNSTILE_SECRET_KEY, response: token, ...(ip ? { remoteip: ip } : {}) }),
      signal: AbortSignal.timeout(5000),
    });
    return ((await res.json()) as { success?: boolean }).success === true;
  } catch (e) {
    // Cloudflare injoignable : on ne perd pas la demande, la limite par adresse IP reste active
    console.error('[contact] Turnstile injoignable', e);
    return true;
  }
};

const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z]+/g, ' ').trim();

/** Showroom destinataire : celui choisi dans le formulaire, sinon celui de la commune (`communes.ts`). */
const showroomFor = (slug: string, commune: string) =>
  showrooms.find((s) => s.slug === slug) ??
  showrooms.find((s) => s.slug === communes.find((c) => norm(c.name) === norm(commune))?.showroom);

const clean = (v: FormDataEntryValue | null, max = 160) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');

export const POST: APIRoute = async ({ request, redirect, clientAddress }) => {
  const wantsJson = request.headers.get('accept')?.includes('application/json');
  const reply = (ok: boolean, message: string, status = ok ? 200 : 400) =>
    wantsJson
      ? new Response(JSON.stringify({ ok, message }), { status, headers: { 'Content-Type': 'application/json' } })
      : redirect(ok ? '/contact/merci/' : `/contact/?erreur=${encodeURIComponent(message)}#devis-form`, 303);

  let ip = '';
  try {
    ip = clientAddress;
  } catch {
    /* adresse indisponible (dev) */
  }
  if (overLimit(ip || 'inconnue')) return reply(false, `Votre demande a déjà été envoyée. Pour la compléter, appelez-nous au ${site.phone}.`, 429);

  // Corps refusé avant lecture s'il dépasse ce que le formulaire peut envoyer
  if (Number(request.headers.get('content-length')) > MAX_TOTAL_BYTES + 300_000) {
    return reply(false, 'Formulaire invalide ou photos trop lourdes.', 413);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return reply(false, 'Formulaire invalide ou photos trop lourdes.', 413);
  }

  // Pot de miel anti-spam : champ invisible pour les humains
  if (clean(form.get('website'))) return reply(true, 'Merci !');

  const d = {
    project: PROJECTS[clean(form.get('project'), 20)] ?? '',
    home: clean(form.get('home'), 20),
    surface: Number(clean(form.get('surface'), 4)) || null,
    current: clean(form.get('current'), 40),
    when: clean(form.get('when'), 40),
    name: clean(form.get('name'), 120),
    phone: clean(form.get('phone'), 40),
    email: clean(form.get('email'), 160),
    commune: clean(form.get('commune'), 120),
    callback: clean(form.get('callback'), 40),
    message: typeof form.get('message') === 'string' ? String(form.get('message')).trim().slice(0, 5000) : '',
    consent: form.get('consent') === 'on',
  };

  if (!d.project) return reply(false, 'Choisissez votre projet.');
  if (d.name.length < 2) return reply(false, 'Indiquez votre nom.');
  if (d.phone.replace(/\D/g, '').length < 10) return reply(false, 'Indiquez un numéro de téléphone complet.');
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(d.email)) return reply(false, 'L’adresse e-mail semble invalide.');
  if (d.commune.length < 2) return reply(false, 'Indiquez votre commune.');
  if (!d.consent) return reply(false, 'Merci d’accepter d’être recontacté.');
  const showroom = showroomFor(clean(form.get('showroom'), 40), d.commune);

  if (!(await humanVerified(form.get('cf-turnstile-response'), ip))) {
    return reply(false, `La vérification anti-robot a échoué. Rechargez la page et réessayez, ou appelez-nous au ${site.phone}.`, 403);
  }

  // Photos jointes (déjà compressées dans le navigateur)
  const attachments: { filename: string; content: string }[] = [];
  let total = 0;
  for (const entry of form.getAll('photos').slice(0, MAX_PHOTOS)) {
    if (!(entry instanceof File) || entry.size === 0) continue;
    if (!entry.type.startsWith('image/') && !/\.(heic|heif)$/i.test(entry.name)) continue;
    if (total + entry.size > MAX_TOTAL_BYTES) break;
    total += entry.size;
    const safeName = entry.name.replace(/[^\w.\-]+/g, '_').slice(0, 80) || `photo-${attachments.length + 1}.jpg`;
    attachments.push({ filename: safeName, content: Buffer.from(await entry.arrayBuffer()).toString('base64') });
  }

  if (!RESEND_API_KEY) {
    console.error('[contact] RESEND_API_KEY manquante : demande non envoyée', { commune: d.commune, project: d.project });
    return reply(false, `L’envoi est momentanément indisponible. Appelez-nous au ${site.phone}.`, 503);
  }

  const line = (label: string, value: string | number | null) => `${label} : ${value || '-'}`;
  const text = [
    `Nouvelle demande d’étude depuis ${new URL(site.url).hostname}`,
    '',
    line('Projet', d.project),
    line('Logement', [d.home, d.surface ? `${d.surface} m²` : ''].filter(Boolean).join(' · ')),
    line('Chauffage actuel', d.current),
    line('Échéance', d.when),
    '',
    line('Nom', d.name),
    line('Téléphone', d.phone),
    line('E-mail', d.email),
    line('Commune', d.commune),
    line('Showroom', showroom?.city ?? ''),
    line('Rappel de préférence', d.callback),
    line('Photos jointes', attachments.length),
    '',
    'Message :',
    d.message || '-',
  ].join('\n');

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: CONTACT_EMAIL_FROM,
      // Demande envoyée au showroom concerné ; à défaut (commune hors liste, pas de choix), à CONTACT_EMAIL_TO
      to: showroom ? [showroom.email] : CONTACT_EMAIL_TO.split(',').map((s) => s.trim()),
      ...(d.email ? { reply_to: d.email } : {}),
      subject: `Demande d’étude : ${d.project} · ${d.commune} (${d.name})`,
      text,
      ...(attachments.length ? { attachments } : {}),
    }),
  });

  if (!res.ok) {
    console.error('[contact] échec Resend', res.status, await res.text());
    return reply(false, `L’envoi a échoué. Réessayez ou appelez-nous au ${site.phone}.`, 502);
  }

  recordSend(ip || 'inconnue');
  return reply(true, 'Merci, votre demande a bien été envoyée.');
};

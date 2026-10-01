import type { APIRoute } from 'astro';
import { RESEND_API_KEY, CONTACT_EMAIL_TO, CONTACT_EMAIL_FROM } from 'astro:env/server';
import { showrooms } from '../../data/site';

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

const clean = (v: FormDataEntryValue | null, max = 160) => (typeof v === 'string' ? v.replace(/\s+/g, ' ').trim().slice(0, max) : '');

export const POST: APIRoute = async ({ request, redirect }) => {
  const wantsJson = request.headers.get('accept')?.includes('application/json');
  const reply = (ok: boolean, message: string, status = ok ? 200 : 400) =>
    wantsJson
      ? new Response(JSON.stringify({ ok, message }), { status, headers: { 'Content-Type': 'application/json' } })
      : redirect(ok ? '/contact/merci/' : `/contact/?erreur=${encodeURIComponent(message)}#devis-form`, 303);

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
    showroom: showrooms.find((s) => s.slug === clean(form.get('showroom'), 40))?.city ?? '',
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
    return reply(false, 'L’envoi est momentanément indisponible. Appelez-nous au 03 21 88 88 60.', 503);
  }

  const line = (label: string, value: string | number | null) => `${label} : ${value || '-'}`;
  const text = [
    'Nouvelle demande d’étude depuis fk-energie-chauffage.fr',
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
    line('Showroom', d.showroom),
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
      to: CONTACT_EMAIL_TO.split(',').map((s) => s.trim()),
      ...(d.email ? { reply_to: d.email } : {}),
      subject: `Demande d’étude : ${d.project} · ${d.commune} (${d.name})`,
      text,
      ...(attachments.length ? { attachments } : {}),
    }),
  });

  if (!res.ok) {
    console.error('[contact] échec Resend', res.status, await res.text());
    return reply(false, 'L’envoi a échoué. Réessayez ou appelez-nous au 03 21 88 88 60.', 502);
  }

  return reply(true, 'Merci, votre demande a bien été envoyée.');
};

# FK Énergie : site vitrine

Nouveau site de **FK Énergie** (poêles, chaudières, pompes à chaleur, Aire-sur-la-Lys / Ardres / Rexpoëde), publié sur
`www.fk-energie.fr` (remplace `www.fk-energie-chauffage.fr`).

- **Stack** : [Astro 7](https://astro.build) + Tailwind CSS 4, déployé sur **Vercel**
- **Rendu** : 100 % statique (HTML pré-généré, quasi sans JavaScript), sauf `/api/contact/` (fonction serverless)
- **Images** : optimisées au build (WebP, AVIF pour les photos d'en-tête, `srcset` responsive) via `astro:assets`
- **Charte « Au coin du feu »** : papier chaud, encre brun-noir, orange braise (`src/styles/global.css`) ; Fraunces (titres),
  Figtree (texte), Caveat (notes manuscrites). Exploration et maquettes : https://claude.ai/artifact/Qjx768RxVkEQZtkzznH1Ys
- **Polices** : auto-hébergées dans `src/assets/fonts/`, allégées (graisses et caractères du français seulement) par
  `scripts/subset-fonts.sh` à partir des paquets Fontsource. À relancer si l'on ajoute une graisse ou un style.

## Démarrer

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # build de production + injection des redirections Vercel
npx astro check    # vérification TypeScript
```

## Déployer sur Vercel

1. Pousser le dépôt sur GitHub, puis dans Vercel : *Add New… > Project > Import*. Le preset **Astro** est détecté automatiquement.
2. Dans *Settings > Environment Variables* :

| Variable | Obligatoire | Rôle |
|---|---|---|
| `RESEND_API_KEY` | oui, pour le formulaire | clé API [Resend](https://resend.com), qui envoie les e-mails du formulaire |
| `CONTACT_EMAIL_TO` | non | destinataire(s) quand le showroom n'est pas identifié, séparés par des virgules (défaut : `agence.fkenergie@gmail.com`). Sinon, la demande part à l'e-mail du showroom choisi ou de la commune (`site.ts`, `communes.ts`). |
| `CONTACT_EMAIL_FROM` | non | expéditeur (défaut : `Site FK Énergie <site@fk-energie.fr>`). Le domaine doit être validé dans Resend. |
| `PUBLIC_TURNSTILE_SITE_KEY` et `TURNSTILE_SECRET_KEY` | non, recommandé | anti-robot [Cloudflare Turnstile](https://developers.cloudflare.com/turnstile/) (gratuit), invisible pour la plupart des visiteurs. Les deux clés ensemble, puis redéployer : la clé publique est intégrée au build. |

3. *Settings > Domains* : ajouter `www.fk-energie.fr` (principal) et `fk-energie.fr` (redirigé vers www). Si l'on récupère les
   anciens domaines, les ajouter aussi en redirection vers `www.fk-energie.fr` : `fk-energie-chauffage.fr`, `www.fk-energie-chauffage.fr`,
   `fkenergie-chauffage.fr` et `www.fkenergie-chauffage.fr`. Vercel conserve le chemin, puis les 301 de `redirects.json` s'appliquent.
   Mettre à jour les DNS chez OVH, ou dans Cloudflare s'il reste devant, avec le mode SSL **Full (strict)** ou le proxy désactivé.

Sans `RESEND_API_KEY`, le formulaire affiche un message invitant à appeler le 03 21 88 88 60 : rien n'est perdu silencieusement.

### Protection du formulaire contre le spam

`/api/contact` combine un champ pot de miel, l'anti-robot Turnstile (variables ci-dessus, à activer) et une limite de 2 envois par heure et
3 par jour pour une même adresse IP (seuls les envois réussis comptent). Ce compteur vit en mémoire de l'instance Vercel : efficace contre
les rafales, pas partagé entre instances. Pour un compteur partagé, dans Vercel, *Firewall > Configure > New Rule* : si *Request Path*
égal à `/api/contact/` et *Method* égal à `POST`, alors *Rate Limit* (par exemple 10 requêtes par minute et par IP).

## Structure

```
src/
  data/site.ts            ← coordonnées, showrooms, horaires, navigation (source unique)
  data/realisations.ts    ← carnet des poses : photo, date, commune (photos dans assets/images/realisations)
  data/communes.ts        ← communes du formulaire et showroom le plus proche
  data/villes.ts          ← pages locales /installateur-chauffage/<ville>/ (distance, communes voisines)
  content/conseils/       ← guides pratiques en Markdown (/conseils/), sources obligatoires
  data/outils.ts          ← liste des outils de calcul (/outils/) et pages où ils sont proposés
  data/thermique.ts       ← hypothèses chiffrées des outils (climat, coefficients G, prix, rendements…), chacune sourcée
  lib/thermique.ts        ← formules des outils, partagées entre le build (tableaux, FAQ) et le navigateur
  data/redirects.json     ← 317 redirections 301 des anciennes URL (archives 2017-2026)
  lib/schema.ts           ← données structurées schema.org (Organization, HVACBusiness, Service, Article, FAQ…)
  layouts/BaseLayout.astro← <head> SEO : title, description, canonical, Open Graph, JSON-LD
  components/             ← Header, Footer, PageHero, ContactForm, Faq…
  pages/                  ← une page = un fichier (URL avec slash final)
  components/ContactForm.astro ← demande d’étude : champs natifs (fonctionne sans JS) enrichis en JS
  pages/api/contact.ts    ← envoi du formulaire (Resend), photos en pièces jointes
scripts/vercel-redirects.mjs ← injecte les 301 dans .vercel/output/config.json après le build
public/                   ← favicon, icônes, image Open Graph, robots.txt
assets/raw/               ← photos brutes récupérées (Facebook, archives de l'ancien site), non publiées
research/                 ← fiche entreprise et recherches (brief du projet)
```

### Modifier le contenu courant

- **Horaires, adresses, téléphone, e-mails** : `src/data/site.ts`, répercutés partout (pages, pied de page, JSON-LD).
- **Ajouter une pose au carnet** : déposer la photo dans `src/assets/images/realisations/` puis ajouter une ligne (titre, catégorie,
  date, commune) dans `src/data/realisations.ts`. L’accueil affiche automatiquement les 4 plus récentes.
- **Formulaire** : les photos sont compressées dans le navigateur (1600 px, JPEG) pour rester sous la limite de 4,5 Mo des fonctions
  Vercel, puis jointes à l’e-mail. Les liens `/contact/?projet=granules|bois|pac|chaudiere|insert|entretien` préselectionnent le projet.
- **Statut d’ouverture** (« Ouvert · jusqu’à 18h ») : calculé dans le navigateur à l’heure de Paris, à partir des horaires de `site.ts`.

## SEO

- Les URL principales de l'ancien site sont conservées : `/poele-a-granules/`, `/poele-a-bois/`, `/chaudieres/`, `/inserts-cheminees/`,
  `/pompes-a-chaleur/`, `/contact/`, `/mentions-legales/`.
- Les autres anciennes URL (catalogue produits, sous-pages, site 2019-2022…) sont redirigées en **301** vers la page équivalente.
  Les redirections sont injectées après le build, car l'adaptateur Vercel les place sinon après sa règle de slash final et elles
  ne s'appliquent jamais (voir le commentaire du script).
- Pages locales par showroom (`/showrooms/aire-sur-la-lys/`, `/ardres/`, `/rexpoede/`) avec données structurées `HVACBusiness`
  (adresse, coordonnées GPS, horaires, photo, prestations). Leur titre reprend le nom de la fiche Google (« FK Énergie Ardres »).
- Pages par ville sans showroom (`/installateur-chauffage/saint-omer/`, `calais`, `hazebrouck`, `dunkerque`, `bethune`), reliées
  au showroom le plus proche, et page « Zone d'intervention » (`/installateur-chauffage/`). Les anciennes URL « près de Calais /
  Saint-Omer / Hazebrouck » y sont redirigées. Pour ajouter une ville : une entrée dans `src/data/villes.ts`, avec un texte
  d'introduction propre (pas de copier-coller entre villes, Google pénalise les pages « satellites »).
- Outils de calcul `/outils/` : puissance de poêle, consommation de granulés, comparateur de coût, pompe à chaleur et
  radiateurs, convertisseur bois. Méthode conventionnelle du DPE (3CL) ; recherche et calculs dans `research/donnees-outils.md`,
  `research/coefficient-g-3cl.md` et `research/calculs/`, revues de chaque outil dans `research/revues-outils/`. Balisage
  `WebApplication` + `FAQPage`. Le résultat de chaque outil préremplit le formulaire de devis (`?projet=`, `?surface=`,
  `?actuel=`, `?note=`).
- Simulateur de plan : `/outils/plan-maison/` est la page de présentation (référencée) ; l'outil lui-même est en plein écran
  sur `/outils/plan-maison/simulateur/` (gabarit `AppLayout`, `noindex`, hors sitemap). Logique dans `scripts/plan-editeur.ts`,
  calculs dans `lib/plan/`. Le plan est envoyé depuis l'outil vers `/api/contact` (images PNG jointes + résumé écrit).
  Parcours en 4 étapes (Plan, Maison, Chauffage, Résultat) : chaque étape n'affiche que ses outils et son panneau,
  le plan montre les surfaces, puis la puissance nécessaire, puis les températures.
  Étape Résultat : dimensionnement des radiateurs pièce par pièce (nombre d'éléments ou longueur) d'après les catalogues
  de `data/radiateurs.ts` (fonte Idéal, Zehnder Charleston, Purmo) ; voir `research/dimensionnement-radiateurs.md`.
  Chauffage : poêles (plusieurs possibles, dont poêle hydro qui chauffe l'eau des radiateurs), unités de PAC air/air et radiateurs à eau ou électriques placés pièce par pièce, chauffage central
  (chaudière ou PAC, loi d'eau) ; hypothèses dans `research/regulation-poele.md`, `research/chauffage-central.md`.
  Journée type de janvier heure par heure (EN ISO 13790), soleil par fenêtre et inertie selon la 3CL : `research/soleil-inertie.md`.
- Guides `/conseils/` (Markdown dans `src/content/conseils/`) : chaque guide cite ses sources officielles (frontmatter `sources`)
  et apparaît automatiquement sur les pages listées dans `related`. Balisage `Article` + `FAQPage`.
- Chaque page : titre ≤ 60 caractères et description ≤ 160 (le build affiche `[seo]` en cas de dépassement), canonical, image
  Open Graph propre à la page (recadrée en 1200 × 630 au build), nœud `WebPage` relié à l'organisation et au fil d'Ariane.
- Carnet de poses balisé en `ImageGallery` (date, commune et auteur de chaque photo) pour Google Images.
- `sitemap-index.xml` généré automatiquement, `robots.txt`, polices visibles dès l'ouverture préchargées.
- Après la mise en ligne : déclarer le sitemap dans Google Search Console, mettre à jour les fiches Google Business Profile
  (lien vers la page du showroom concerné) et créer la fiche de Rexpoëde.

## À valider avec le client avant la mise en ligne

- [ ] Domaine `fk-energie.fr` : à récupérer, puis mettre à jour les liens des fiches Google Business Profile.
- [ ] Simulateur sur plan : le garder (en insistant sur la visite et l'étude) ou le retirer.
- [ ] Nouvelle photo de la façade d'Aire-sur-la-Lys (l'actuelle montre l'ancienne enseigne) et photo de l'équipe (accueil).
- [ ] Photos de poses sans date (envoyées en octobre 2026) : date approximative pour les ajouter au carnet.
- [ ] Logo : fichier vectoriel (le PNG fourni en octobre 2026 est utilisé, recadré sans le slogan, dans `src/assets/brand/`).

## Maintenance

- Outils de calcul : mettre à jour les prix de l'énergie chaque trimestre dans `src/data/thermique.ts` (`energies`, `granules`).
- Renouvellement QualiBois « Eau » (expire le 08/12/2026), suivi par le client.

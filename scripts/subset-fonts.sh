#!/usr/bin/env bash
# Génère les polices allégées de src/assets/fonts/ à partir des paquets Fontsource (devDependencies).
# À relancer seulement si l'on change de police, de graisse ou de jeu de caractères.
#
# Prérequis : pip install fonttools brotli
#
# Gains (woff2) : Fraunces 67 → 49 Ko, Fraunces italique 82 → 34 Ko, Figtree 20 → 13 Ko, Caveat 51 → 22 Ko.
# - Fraunces : axe de taille optique (opsz) conservé, graisses limitées à ce que le site utilise
#   (400 à 700 en romain, 400 seul en italique : les <em> des titres sont en font-normal).
# - Caveat : sans les alternates contextuelles (calt), invisibles sur les quelques mots des sur-titres.
# - Caractères : ceux du français uniquement (ASCII, lettres accentuées, œ æ, « », °, ², ³, ×, ©), ponctuation
#   typographique, espaces fines, €, −, ≤, ≥, ₂, →. Un caractère absent (ñ, ß…) s'affiche dans la police de secours.
set -euo pipefail

cd "$(dirname "$0")/.."
SRC=node_modules
OUT=src/assets/fonts
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
mkdir -p "$OUT"

LATIN_FR="U+0020-007E,U+00A0,U+00A9,U+00AB,U+00B0-00B3,U+00B7,U+00BB,U+00C0,U+00C2,U+00C4,U+00C6-00CB,U+00CE-00CF,U+00D4,U+00D6-00D7,U+00D9,U+00DB-00DC,U+00E0,U+00E2,U+00E4,U+00E6-00EB,U+00EE-00EF,U+00F4,U+00F6,U+00F9,U+00FB-00FC,U+00FF,U+0152-0153,U+0178"
PONCTUATION="U+2009,U+2013-2014,U+2018-201E,U+2022,U+2026,U+202F,U+2039-203A,U+20AC,U+2082,U+2192,U+2212,U+2264-2265"
UNICODES="$LATIN_FR,$PONCTUATION"

subset() { # entrée, sortie, fonctionnalités OpenType
  pyftsubset "$1" --unicodes="$UNICODES" --layout-features="$3" --flavor=woff2 --no-hinting --desubroutinize --output-file="$OUT/$2"
}

fonttools varLib.instancer -q "$SRC/@fontsource-variable/fraunces/files/fraunces-latin-opsz-normal.woff2" wght=400:700 -o "$TMP/fraunces.ttf"
fonttools varLib.instancer -q "$SRC/@fontsource-variable/fraunces/files/fraunces-latin-opsz-italic.woff2" wght=400 -o "$TMP/fraunces-italic.ttf"
fonttools varLib.instancer -q "$SRC/@fontsource-variable/figtree/files/figtree-latin-wght-normal.woff2" wght=400:800 -o "$TMP/figtree.ttf"

subset "$TMP/fraunces.ttf" fraunces-opsz-400-700.woff2 'kern,liga,rvrn'
subset "$TMP/fraunces-italic.ttf" fraunces-opsz-italic-400.woff2 'kern,liga,rvrn'
subset "$TMP/figtree.ttf" figtree-400-800.woff2 'kern,liga,rvrn,ccmp,locl,mark,mkmk,tnum,pnum'
subset "$SRC/@fontsource/caveat/files/caveat-latin-600-normal.woff2" caveat-600.woff2 'kern,liga,ccmp,locl,mark,mkmk'

ls -l "$OUT"

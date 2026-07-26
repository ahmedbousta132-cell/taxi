#!/bin/bash
# ============================================================
# Injecte LA MÊME clé Google Maps dans les deux sites.
#
#   bash deploy/set-gmaps-key.sh AIzaSy...votre_cle...
#
# Une seule clé suffit pour City Taxis et Taxi Drive, à condition
# que ses restrictions "Référents HTTP" listent LES DEUX domaines
# (voir le rappel affiché en fin de script).
#
# Pour revenir au placeholder :  bash deploy/set-gmaps-key.sh --reset
# ============================================================

set -euo pipefail

PLACEHOLDER="VOTRE_CLE_GOOGLE_MAPS"
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
FILES=(
    "$REPO_ROOT/deploy/citytaxis/index.html"
    "$REPO_ROOT/deploy/taxidrive/index.html"
)

if [[ $# -ne 1 ]]; then
    echo "Usage : bash deploy/set-gmaps-key.sh <CLE_GOOGLE_MAPS>"
    echo "        bash deploy/set-gmaps-key.sh --reset"
    exit 1
fi

if [[ "$1" == "--reset" ]]; then
    NEW_KEY="$PLACEHOLDER"
else
    NEW_KEY="$1"
    # Les clés Google commencent par "AIza" et font ~39 caractères.
    if [[ ! "$NEW_KEY" =~ ^AIza[0-9A-Za-z_-]{30,}$ ]]; then
        echo "ERREUR : « $NEW_KEY » ne ressemble pas à une clé Google Maps."
        echo "         Format attendu : AIza suivi d'environ 35 caractères."
        exit 1
    fi
fi

for f in "${FILES[@]}"; do
    [[ -f "$f" ]] || { echo "ERREUR : fichier introuvable — $f"; exit 1; }
    # Remplace la valeur quelle qu'elle soit (placeholder ou ancienne clé).
    perl -pi -e 's{(window\.GMAPS_KEY=")[^"]*(")}{$1'"$NEW_KEY"'$2}' "$f"
    echo "  mis à jour : ${f#"$REPO_ROOT/"}"
done

echo
if [[ "$NEW_KEY" == "$PLACEHOLDER" ]]; then
    echo "Clé réinitialisée au placeholder : Google Maps reste désactivé"
    echo "(les sites fonctionnent, la distance se saisit à la main)."
    exit 0
fi

cat <<'EOF'

Clé injectée dans les deux sites.

RAPPEL IMPORTANT — restrictions de la clé
-----------------------------------------
Une clé Maps côté navigateur est VISIBLE dans le code source de la page :
c'est normal et prévu par Google. Ce qui la protège d'un usage abusif,
c'est la restriction par référent, PAS son secret.

Dans https://console.cloud.google.com/ > API et services > Identifiants,
sur cette clé, section « Restrictions relatives aux applications » >
« Référents HTTP », déclarez EXACTEMENT ces entrées :

    https://taxiscity.ch/*
    https://www.taxiscity.ch/*
    https://taxidrive.ch/*
    https://www.taxidrive.ch/*

Si la clé servait déjà à l'ancien site, ses référents pointent encore vers
les anciens domaines : sans ces nouvelles entrées, Maps renverra
"RefererNotAllowedMapError" sur les nouveaux sites.

Section « Restrictions relatives aux API » : limitez à
    Maps JavaScript API  +  Directions API

EOF

#!/bin/zsh
# qa.sh <style> [format] [spec.js]  → qa/<style>[-v]/ stills per scene + qa/<style>.jpg contact sheet
st=$1; fmt=${2:-16:9}; spec=${3:-video.js}; suf=""; [ "$fmt" = "9:16" ] && suf="-v"; [ "$spec" != "video.js" ] && suf="$suf-${spec%.js}"
rm -rf "qa/$st$suf"; node render.mjs --scenes --query "style=$st&format=$fmt&spec=$spec" --outdir "qa/$st$suf" 2>&1 | grep -v "404" | grep -v "^$"
python3 contact.py "qa/$st$suf" "qa/$st$suf.jpg" $([ "$fmt" = "9:16" ] && echo 5 || echo 3) >/dev/null && echo "qa/$st$suf.jpg"

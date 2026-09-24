#!/bin/zsh
# catalog.sh [style ...] → catalogo/<id>.jpg (hook) + catalogo/<id>-2.jpg (lista) y catalogo.jpg (todas)
mkdir -p catalogo
styles=("$@"); [ ${#styles} -eq 0 ] && styles=(${(f)"$(ls styles/*.js | xargs -n1 basename | sed 's/\.js$//')"})
for st in $styles; do
  rm -rf /tmp/cat_$st; node render.mjs --stills 3.4,6.9 --query "style=$st&spec=catalogo.js" --outdir /tmp/cat_$st 2>&1 | grep -v 404 | grep -iv "^stills"
  mv /tmp/cat_$st/s_003.40.jpg catalogo/$st.jpg; mv /tmp/cat_$st/s_006.90.jpg catalogo/$st-2.jpg; echo "✓ $st"
done

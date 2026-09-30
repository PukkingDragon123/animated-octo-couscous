#!/bin/bash
# Assembles prete-simulator/index.html from the source in dev/src.
#   head.html  the page, up to and including <script>
#   game.js    the game as it stood when it was one file
#   fx/*.js    everything added since, in name order, after the game
#   tail.html  </script> and the rest of the page
# then checks that it parses and that no function is declared twice
# (every part is one script, so a second declaration silently wins).
set -e
cd "$(dirname "$0")"
OUT=../index.html
PARTS="src/game.js $(ls src/fx/*.js 2>/dev/null | sort)"
cat $PARTS > /tmp/prete-script.js
node --check /tmp/prete-script.js
# These 27 were declared twice long before this script existed; the later one
# is the live one. Anything else declared twice fails the build.
KNOWN=" bubble drawAct drawDialog drawGive drawGlows drawHUD drawHintLine drawLedger drawLighting drawNewFore drawPosopBubble drawSigns drawSky drawTaskHUD drawTitle padIcon paddyPrompt panel plotPrompt say stepDlg stepFarm stepPlayer stepTree tLayout toast wishBubble "
DUP=$(grep -ohE '^function [A-Za-z_$][A-Za-z0-9_$]*' $PARTS | sed 's/^function //' | sort | uniq -d)
NEW=""; for d in $DUP; do case "$KNOWN" in *" $d "*) ;; *) NEW="$NEW $d";; esac; done
if [ -n "$NEW" ]; then echo "declared twice:$NEW"; exit 1; fi
cat src/head.html /tmp/prete-script.js src/tail.html > $OUT
ls -la $OUT

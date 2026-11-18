#!/usr/bin/env bash
# Reproduzierbarer Browser-Rauchtest: simuliert Upload (Revision 2), PWA-Attrappe mit echter image-profiles.js,
# 3D-Attrappe in zwei Verzeichnissen, Katalog. Benötigt python3, Pillow, playwright (python) und Chrome.
set -euo pipefail
cd "$(dirname "$0")/.."
W=$(mktemp -d)
mkdir -p "$W/wunderhaus/home/3d/claude/v2/src/bridge" "$W/wunderhaus/home/3d/codex/v1"
cp -r media "$W/wunderhaus/media"
cp 3d-integration/src/bridge/media.js "$W/wunderhaus/home/3d/claude/v2/src/bridge/media.js"
python3 -I tools/emfd_media.py scan-dir "$W/wunderhaus/media" --out "$W/scan.json"
python3 -I tools/emfd_media.py build --handoff input/handoff --staged reports/staging.json --inventory "$W/scan.json" --revision 2 --label sim-upload --out "$W/wunderhaus/media/manifest.json"
echo 'const CARDS = Array.from({length: 24}, (_, i) => ({ id: "O" + String(i + 1).padStart(2, "0") }));' > "$W/wunderhaus/home/data.js"
cp input/handoff/quellen/app__home__image-profiles.js "$W/wunderhaus/home/image-profiles.js"
cp pwa-migration/home/media-bridge.js "$W/wunderhaus/home/media-bridge.js"
cp tests/fixtures/pwa-index.html "$W/wunderhaus/home/index.html"
cp tests/fixtures/3d-index.html "$W/wunderhaus/home/3d/claude/v2/index.html"
sed "s#'./src/bridge/media.js'#'../../claude/v2/src/bridge/media.js'#" tests/fixtures/3d-index.html > "$W/wunderhaus/home/3d/codex/v1/index.html"
(cd "$W" && python3 -m http.server 8766 >/dev/null 2>&1) & SRV=$!
trap 'kill $SRV' EXIT
sleep 1
python3 tests/browser_smoke.py

#!/usr/bin/env bash
# Alle Tests ohne Server und ohne Browser: baut das Testmanifest (Revision 1, clean) nach work/ und prüft Loader + Werkzeug.
# Aufruf aus dem Repo-Wurzelordner:  bash tests/run_tests.sh
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p work
python3 -I tools/emfd_media.py build --handoff input/handoff --staged reports/staging.json --room-music-map live/home/room-music-map.json --mode clean --revision 1 --label test --out work/manifest.json
python3 -I tools/emfd_media.py validate work/manifest.json --schema media/manifest.schema.json
node --test tests/*.test.mjs
python3 -m unittest discover -s tests -p 'test_*.py'
python3 tools/media_check.py --nur-anzeigen

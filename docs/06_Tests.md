# EMFD-MEDIA-CORE-01 · Tests und Prüfwerkzeuge

| Test | Befehl | Prüft |
|---|---|---|
| Loader (15 Fälle) | `node --test tests/*.test.mjs` | identische URLs aus `/home/`, `/home/3d/claude/v1/`, `/v2/`, `/codex/v1/`, tiefer Verschachtelung · 24 O-IDs, 25 Playlist-IDs, 35 Audio-Pfade, keine O25 · Motiv/Song/Cover je ID · Fallback vor Upload, aktuelle Fassung danach · alte Vorderseite nie als aktuell · fehlende Medien mit Grund, `url:null` · Testmedien nur intern · `no-cache`-Revalidierung, geteilte Anfragen · Offline-Start aus letztem Stand · HTML statt JSON · neue Revision ohne Codeänderung · Pfadschutz · Merge-Form · altes v1 abgewiesen · Gerätezuordnung |
| Werkzeug (13 Fälle) | `python3 -m unittest discover -s tests -p 'test_*.py'` | Validierungsregeln (O25, Testmedium in Playlist, veraltete Vorderseite, falsches Cover, `../`, doppelte Pfade, Release-Sperre), Signaturerkennung PNG/WebP/HTML, Pfadnormalisierung |
| Browser-Rauchtest | `bash tests/run_browser_smoke.sh` | simulierter Upload → Revision 2 · PWA-Attrappe mit echter `image-profiles.js` (vorher/nachher, Cache-Start, Notbremse) · 3D-Brücke aus zwei Versionsordnern, Textur 896 px, sRGB · Katalog inkl. Serverprüfung |
| Manifest | `python3 tools/emfd_media.py validate <manifest> --schema deploy/wunderhaus/media/manifest.schema.json [--release]` | Schema + Projektregeln; `--release` verlangt geprüfte Dateien |

Ergebnis 18.11.2026: 15/15, 13/13, Rauchtest bestanden; `validate` Entwicklungsmodus 0 Fehler, Release-Modus blockiert erwartungsgemäß (Dateien noch nicht hochgeladen bzw. ungeprüft).

Nicht geprüft: echter Server (kein Zugriff), echtes iPhone/Safari, echte MP3-Wiedergabe, Live-PWA-Code.

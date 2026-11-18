# Kompositionsgeschichten v0.4 – Änderungsprotokoll

## Ergebnis

Der bestehende Bereich `Musikzimmer → Kompositionsgeschichten` wurde vom technischen Playlist-Text getrennt und als illustriertes Geschichtenbuch umgesetzt. Der vorhandene Playlist-Katalog bleibt unverändert die Musikquelle; `composition-stories.json` ist die einzige Laufzeitquelle für die 24 Geschichten.

## Geänderte und ergänzte Dateien

- `music-room.js` – Datenladung, Übersicht, Detailroute und Verknüpfungen
- `music-room.css` – Buchgestaltung, responsive Karten und lesbare Buchseite
- `app.js` – Detailrouten `#musik/geschichten/O01` bis `O24`
- `composition-stories.json` – vollständiges versioniertes Geschichtenmodell
- `composition-story-media.json` – Medienmanifest für 24 spätere Illustrationen
- `content/EMFD_Kompositionsgeschichten_v0.4.md` – verbindliche Textquelle
- `content/EMFD_Gestaltungsuebergabe_v0.4.md` – Gestaltungs- und Redaktionsvorgaben
- `scripts/import-composition-stories.mjs` – reproduzierbarer Import ohne Textumschreibung
- `tests/composition-stories-v04.test.cjs` – Text-, Status-, Medien- und Routingprüfung
- `tests/music-room-v0.6.19.test.cjs` und `tests/package-layout.test.cjs` – angepasste Regressionen
- Versionsangaben und lokale Cache-Buster auf `0.6.42`

Originalkarten, Audiozuordnungen, übrige Räume und Backend-Schnittstellen wurden nicht verändert. Es erfolgte keine Veröffentlichung.

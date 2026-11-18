# Übergabe · EMFD-MEDIA-CORE-01 · Zentrale Medienarchitektur

Stand 18.11.2026, 17:20 · Projekt „Ein Moment für dich · Das Haus der kleinen Wunder“
Für die Fortsetzung in einer neuen Sitzung (z. B. Claude Code im GitHub-Repo). **Am Live-Server wurde nichts verändert.**

## 1. Ziel

Alle 2D- und 3D-Anwendungen greifen auf **einen** zentralen Medienbestand zu, unabhängig von Ordner und Version. Einzige dauerhafte Schnittstelle:
`https://flowisaurus.de/wunderhaus/media/manifest.json` + `media-loader.js` daneben.

Verbindlich: keine doppelten Medienablagen, keine Abhängigkeit von der Ordnertiefe, keine erfundenen Pfade oder Medien, keine alten Kartenbilder statt der neuen Vorderseiten, aktualisierte Medien werden automatisch übernommen, eine einheitliche Cache-Strategie, bestehende Funktionen bleiben erhalten, „verfügbar / fehlt / nicht freigegeben“ klar unterschieden, **keine Live-Änderung ohne ausdrückliche Freigabe der Nutzerin**.

## 2. Beschlossene Zielstruktur (STRATO, Webspace)

```
/wunderhaus/
├── media/            EIN gemeinsamer Medienbestand (manifest.json, media-loader.js, cards/, covers/, audio/, …)
├── home/             2D-App „wunderhaus“ – BLEIBT unter diesem Namen
└── wunderhaus_3d/    3D-App (neu, Ordner noch anzulegen)
```

- `home/` wird **nicht** umbenannt: Der QR-Code auf der Geschenkkarte zeigt fest auf `https://flowisaurus.de/wunderhaus/home/#ankommen`, und die installierte iPhone-App (PWA-`id`/`scope` `/wunderhaus/home/`) würde sonst als neue App gelten, mit möglichem Verlust gespeicherter Daten.
- Beide Apps binden die Medien **relativ** ein: `../media/media-loader.js`. Absolute Pfade (`/wunderhaus/...`) vermeiden.
- Domain `haus-der-wunder.de` zeigt derzeit auf `/wunderhaus/home/`. Dann ist `../media/` unter dieser Domain nicht erreichbar. **Offen:** prüfen, ob unter haus-der-wunder.de Kartenbilder erscheinen; falls nicht, das Domainziel auf `/wunderhaus/` ändern und dort eine `index.html` mit Weiterleitung nach `home/` anlegen.
- Unter `/wunderhaus/home/3d/wunderhaus/` liegt eine Testkopie (eigenständige Version samt `media/`-Kopie mit den neuen Dateien). Sie wird nach dem Umzug in die Zielstruktur überflüssig.

## 3. Bestand (Ergebnis der Prüfung)

- **Live-Manifest** `/wunderhaus/media/manifest.json`: schemaVersion 1.0 + PERF-01-Overlay (`items[]`, `assets[]`), ca. 266 KB. Enthält nur Altbestand, keine neuen Vorderseiten, Cover, Audio oder Objekte.
- **Die 2D-App v0.6.66 liest dieses Manifest selbst** (`media-recovery.js` liest `items`/`assets`). → Das neue Manifest muss **additiv** sein: Altinhalt unverändert lassen, Neues unter dem Schlüssel `mediaCore` (Modus `merge`).
- **Neu vorhanden** (Projektdateien): Vorderseiten **O01–O18** (896×1536), CD-Cover **O04, O06, O24** (Datei `C024.png` = O24, Zuordnung über den Bildinhalt).
- **Fehlen:** Vorderseiten O19–O24, 22 Cover (inkl. Main Theme T03), Nachweis aller 35 MP3 (25 Primär + 10 intern), 24 freigestellte Objekt-Sprites, 3D-Modelle, Kompositionsgeschichten-Bilder, Geschenk-Deckblatt.
- **Neue Medien der Nutzerin (noch einzuordnen):** `media/raumgeraete/P01–P08.webp` (von v0.6.66 in `room-music-map.json` referenziert), Raumplayer-Bildebenen (`Bildregister.json`, P01–P08 je Ebenen + `Raum.webp`/`Raumansicht.webp`, `Gemeinsam/*.svg`). Für die Bildebenen gibt es noch keine Referenz in der App; vorgeschlagene Ablage `media/raumplayer/P01/…` (nicht bestätigt).
- **Auffällig in v0.6.66:** `home/assets/recovery/` enthält 30 Kopien alter Kartenbilder (Rückfall zeigt alte Fassung); Alt-Texte in `data.js` beschreiben die alten Bilder (z. B. O06 „Uhr mit Ziffern und Zeigern“); der Service Worker `image-service-worker.js` cacht nur Bilder aus einer festen Liste, neue `-r2-`-Dateien also nicht offline.

## 4. Was gebaut ist (Paket `EMFD-MEDIA-CORE-01_v1.1.0.zip`)

| Teil | Datei | Stand |
|---|---|---|
| Manifest v2 | `deploy/wunderhaus/media/manifest.json` (Schema `emfd-media-core` 2.0.0) | Revision 1 „vorab“, clean; 338 Assets / 585 Varianten mit `availability` (verified, listed, referenced, staged, archived, missing, broken) und `release` (approved, internal, review, test, superseded, archive) |
| Schema | `manifest.schema.json` | JSON Schema 2020-12 |
| Loader | `media-loader.js` 1.1.0 (+ `.mjs`) | nimmt **das manifest.json neben sich**; Revalidierung `no-cache`, Last-known-good-Cache, markierte Fallbacks, Pfad-/Origin-Schutz, kein Autoplay |
| Werkzeug | `tools/emfd_media.py` | `stage`, `build` (`--mode merge`, `--assign`, mehrere `--inventory`), `scan-dir`, `import-list`, `http-check` (lesend), `reconcile`, `validate --release` |
| Katalog | `media/katalog/index.html` | Sichtkontrolle 24 Karten / 25 Stücke / Objekte / Räume, Serverprüfung per Knopf |
| 2D-Brücke | `pwa-migration/home/media-bridge.js` | ersetzt Kartenbilder nur bei aktueller, nutzbarer Fassung; Notbremse `?emfd-media-bridge=off` |
| 3D-Brücke | `3d-integration/src/bridge/media.js` | Texturen nach Karten-ID, Audio nur auf Tippen; Umgebung über `<meta name="emfd-media-base" content="../media/">` |
| Neue Dateien | `cards/fronts/` (18 PNG), `covers/` (3 PNG), `optimized/cards/*-r2-*` (54 WebP), `optimized/covers/` (9 WebP) | versionierte Namen mit Hash, überschreiben nichts |
| Doku | `docs/01–06`, `MEDIEN-KONVENTION.md` | Bestandsbericht, Schnittstelle, Deployment/Rollback, PWA, 3D, Tests |

Tests: Loader 15/15, Werkzeug 13/13, Browser-Rauchtest bestanden. Mit der echten 2D-App v0.6.66 getestet: neue Vorderseite O06 erscheint, keine Seitenfehler, App-eigene Tests unverändert (38 Fehlschläge bestanden schon vorher).

Weitere Ausgaben: `EMFD-v0.6.66-MEDIA01-home-Patch.zip` (nur `home/index.html` mit 2 Zusatzzeilen nach `image-profiles.js` + `home/media-bridge.js`), `EMFD-media-Upload-Teil1von4.zip` … `Teil4von4.zip` (je < 20 MB, enthalten `media/…`, in `/wunderhaus/` entpacken, **ohne** manifest.json).

## 5. Nächste Schritte (in dieser Reihenfolge)

1. **Live-Manifest besorgen**: `https://flowisaurus.de/wunderhaus/media/manifest.json` herunterladen (wird für den Merge benötigt).
2. **Neue Medien nach `/wunderhaus/media/`** ⚠ Freigabe: im STRATO-Dateimanager aus `home/3d/wunderhaus/media/` verschieben (`cards/fronts`, `covers`, `optimized/covers`, Inhalt von `optimized/cards`, `katalog`, Loader-Dateien, Schema, Konvention) oder die vier Upload-ZIPs nutzen. `raumgeraete/` hochladen, falls noch nicht live.
3. **Prüfen**: `http-check` bzw. den Katalog `…/wunderhaus/media/katalog/?staged=1` → Knopf „Dateien auf dem Server prüfen“.
4. **Manifest Revision 2 bauen** (additiv):
   `python3 tools/emfd_media.py build --handoff input/handoff --staged reports/staging.json --inventory <inventare…> --live-manifest live/manifest.json --mode merge --revision 2 --out live/manifest.json.neu`
   dann `validate --release`.
5. **Veröffentlichen** ⚠ Freigabe: als `manifest.json.neu` hochladen und im Dateimanager auf `manifest.json` umbenennen. Vorher Sicherung `manifest-v1-perf01-2026-11-18.json` anlegen.
6. **2D-Patch einspielen** ⚠ Freigabe: `home/index.html` + `home/media-bridge.js`.
7. **3D-App nach `/wunderhaus/wunderhaus_3d/`**: Quellordner der Nutzerin abwarten; Brücke `src/bridge/media.js` einbauen, `<meta name="emfd-media-base" content="../media/">`, keine Medienkopien unter `assets/`.
8. Danach: Testkopie `home/3d/wunderhaus/` entfernen (nur mit Zustimmung); Folgeschritte für die 2D-App (Cover in `music-room.js` über `EMFDImages.cover(id)`, Service-Worker-Muster für `-r2-`, Alt-Texte, `assets/recovery` bereinigen).

## 5a. Stand 18.11.2026 abends (Claude-Code-Sitzung, Repo)

- Schritt 1 erledigt: Live-Manifest in `live/manifest.json`, unverändert seit 04.11.
- Serverprüfung (lesend) erledigt: [`07_Live-Bestand-2026-11-18.md`](07_Live-Bestand-2026-11-18.md). Wichtigste Befunde: `cards/O01–O18.png` enthalten **bereits** die neuen Vorderseiten (am 17.11. ersetzt), O19–O24 sind Altstand, **keine MP3 live**, Rückseite v1.2 fehlt (`rueckseite.jpeg` vorhanden), kein `Cache-Control`. Die Testkopie `home/3d/wunderhaus/media/` ist unter diesem Pfad nicht erreichbar.
- Schritt 4 vorgezogen: Kandidat Revision 2 in [`../release/manifest.json.neu`](../release/manifest.json.neu). Er übernimmt die Live-Gerätezuordnung v0.6.66 (Namen und Bilder P01–P08) und führt die alte Rückseite als markierten Ersatz. Die Release-Prüfung bleibt bis zum Upload gesperrt.
- Weiter mit Schritt 2 (Upload, ⚠ Freigabe) nach [`../release/README.md`](../release/README.md).

Rollback: altes Manifest zurück (Upload als `.neu` + Umbenennen); Notbremse 2D `?emfd-media-bridge=off`; neue Dateien bleiben unschädlich liegen. Revisionen nur hochzählen, nie zurückzählen.

## 6. Offene Fragen an die Nutzerin

- Erscheinen unter `haus-der-wunder.de` heute die Kartenbilder? (entscheidet über die Umstellung des Domainziels)
- Liefert sie die Vorderseiten O19–O24 und 22 Cover nach, oder liegen sie schon irgendwo auf dem Server?
- Zielordner der Raumplayer-Bildebenen bestätigen (`media/raumplayer/…`?).
- Welcher Ordner ist die Quelle für `wunderhaus_3d`?

## 7. Regeln für jede weitere Sitzung

- Medien nur über `getCard / getPlaylist / getRoom / getDevice / getAsset` des Loaders, nie über Pfade im Code.
- Neue Fassung = neue Datei unter neuem Namen + neue Manifest-Revision. Nie überschreiben, nie löschen ohne Freigabe.
- IDs stabil: O01–O24, T03, Geräte P01–P08 (`devices`), 2D-Räume über `rooms` (Namensraum getrennt). Keine O25.
- Architektur v0.4.4 (3D) nicht ohne Zustimmung ändern; keine automatischen Änderungen am produktiven Server.
- Ausführliche Kurzregeln: `MEDIEN-KONVENTION.md` (auch im Claude-Projekt „Haus Der Wunder“ abgelegt, zusammen mit dem Bestandsbericht).

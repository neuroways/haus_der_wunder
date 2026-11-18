# EMFD-MEDIA-CORE-01 · Zentrale Medienarchitektur · v1.0.0

„Ein Moment für dich · Das Haus der kleinen Wunder“ · Stand 18.11.2026 · **nichts live verändert**

Alle 2D-/3D-Anwendungen – egal in welchem Ordner und welcher Version – lesen ihre Medien über eine Schnittstelle:
`https://flowisaurus.de/wunderhaus/media/manifest.json` + `media-loader.js`.

## Ergebnis in Zahlen (Manifest-Entwurf Revision 1)

| | |
|---|---|
| Karten | 24 (O01–O24), Vorderseiten **18 neu** (O01–O18, vorbereitet), 6 nur Altfassung (O19–O24, Update erwartet) |
| CD-Cover | **3 von 25** (O04, O06, O24); 22 fehlen, Fallback alter Playlist-Ausschnitt (markiert) |
| Musik | 25 Primärstücke + 10 interne Testmedien = 35 Pfade, alle ungeprüft (Server nicht erreichbar) |
| Objekte | 24 Referenz-WebPs nur im Archiv; 0 freigestellte Sprites; 0 Modelle |
| Assets gesamt | 338 mit 585 Varianten, jede mit Verfügbarkeit und Freigabestatus |

Details: `docs/01_Bestandsbericht.md`.

## Paketinhalt

```
deploy/wunderhaus/media/        exaktes Abbild der geplanten Server-Ergänzungen
  manifest.json                 befülltes Manifest (Revision 1, clean) – Veröffentlichung erst als Revision 2 nach Upload
  manifest.schema.json          JSON-Schema 2020-12
  media-loader.js / .mjs        MediaLoader (klassisch + ES-Modul)
  MEDIEN-KONVENTION.md          Kurzregeln für Claude/Codex/ChatGPT
  katalog/index.html            Medienkatalog zur Sichtkontrolle (24 Karten, 25 Cover/Stücke, Objektstatus, Serverprüfung)
  cards/fronts/, covers/        21 neue Originale (versionierte Namen mit Hash)
  optimized/cards/, /covers/    63 WebP-Varianten
  htaccess-vorschlag.txt        Cache-/MIME-Regeln (nur ergänzen)
tools/emfd_media.py             stage · build · scan-dir · import-list · http-check · reconcile · validate
pwa-migration/home/media-bridge.js   rückwärtskompatible Brücke für die PWA v0.6.56
3d-integration/src/bridge/media.js   Medienbrücke für die 3D-App (Texturen nach ID, Audio nur auf Tippen)
docs/                           Bestandsbericht, Schnittstelle, Deployment/Rollback, PWA, 3D, Tests
reports/                        staging.json, medienstatus.csv (alle Varianten), abgleich.json
tests/                          Node-, Python- und Browsertests
input/handoff/                  unveränderte Übergabedaten (Quelle für build)
```

## Nächste Schritte (deine Entscheidung)

1. Server-Dateiliste von `/wunderhaus/media/` schicken → Abgleich, damit nichts doppelt hochgeladen wird.
2. Fehlende Vorderseiten O19–O24 und 22 Cover nachliefern bzw. ihre Serverpfade nennen.
3. Freigabe für Upload + Manifest Revision 2 nach `docs/03_Deployment_Rollback.md`.
4. Separate Freigabe für die PWA-Brücke (eine Zeile in `home/index.html`).

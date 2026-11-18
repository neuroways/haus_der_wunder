# EMFD-BIB-FE-01 – Änderungsbericht v0.6.60

Stand: 04.11.2026  
Basis: EMFD v0.6.59 NOTE-03  
Status: lokale Integrationsfassung, nicht veröffentlicht

## Ergebnis

Die Bibliothek 2.0 wurde selektiv in P02 integriert. Es wurde keine ältere vollständige Anwendung über v0.6.59 kopiert. Karten-, Musik-, Teezimmer-, Atelier- und Gedankenblattfunktionen der Basis bleiben erhalten. `media/` wurde nicht verändert.

## Neue Dateien

- `library/catalog.js`: Metadaten für fünf Bücher und sichtbare Inhaltsstatus.
- `library/library.js`: Regal, Buchauswahl und Konzeptansichten.
- `library/library.css`: vollständig gekapselte Regal- und Coverdarstellung.
- `library/library-entry.js`: Adapter zu P02, Geschichten-Reader, Karten- und Musikroute.
- `tests/library-bib-fe-01.test.cjs`: fünf Tests aus dem Bibliothekszweig.
- `tests/library-integration-v0.6.60.test.cjs`: fünf Ziel- und Schutztests.
- `qa/EMFD-BIB-FE-01-v0.6.53.md`: historischer Bibliotheksnachweis.
- `qa/browser-library-check.cjs` und vier Browser-Screenshots: lokale responsive Prüfung.

## Geänderte Dateien

- `app.js`: P02-Regalcontainer, Sprungaktion, fehlertolerantes Mounting und verständlicher Ladefehler; nur für P02.
- `origin-story.js`: öffentliche gefilterte Reader-API, dynamisches Inhaltsverzeichnis, horizontales Wischen, Fokus-Rückkehr und Dialogkoordination. Die 19 Originalabschnitte bleiben unverändert.
- `origin-storybook.css`: gekapselte Farbakzente für Weltenweberin und Musik.
- `house-grundausbau.css`: P02-Sprungaktion und Scrollziel.
- `library/library.css`: Schutz vor der globalen `header`-Flexregel, damit Überschrift und Reader auf kleinen und großen Displays korrekt bleiben.
- `index.html`: Bibliotheks-CSS und Modul-Entry, Cache-Kennungen für geänderte Ressourcen; NOTE-03-, TEA-01- und Kartenbuchressourcen bleiben eingebunden.
- `README.md`, `package.json`, `manifest.webmanifest`, `deployment-layout.json`: Version und additive Dokumentation v0.6.60.
- Zwei bestehende Regressionstests: ausschließlich Versionsziel von v0.6.59 auf v0.6.60 angehoben.
- `file-hashes.json`: nach Fertigstellung vollständig neu erzeugt.

## Schnittstellen und Entscheidungen

- `window.EMFDLibrary.mount(element)` mountet das P02-Regal wiederholbar.
- `window.EMFDOriginStory.open({trigger, bookIds, title, theme})` öffnet den vorhandenen Reader gefiltert; es gibt keine zweite Buch-Engine.
- Weltenweberin: sechs Originalkapitel aus `idee` und `character_worldweaver`.
- Klangwelten: dreizehn Originalkapitel aus `musik`.
- Globaler Altzugang: neunzehn Kapitel.
- Kartenbuch und Gedankenblatt bleiben eigenständige Module.
- Bibliotheksaktionen erzeugen weder Audioinstanzen noch Autoplay.

## Nicht geändert

- Keine Karten-, Musik-, Raum- oder Buchtexte redaktionell geändert.
- Keine Medien erzeugt, kopiert, umbenannt oder in das App-ZIP aufgenommen.
- Keine Live-Anwendung verändert und keine Veröffentlichung durchgeführt.
- Die bestehende Konfigurationsabweichung von 20 MiB im Deployment-Layout zu 64 MiB im Bild-Service-Worker wurde dokumentiert, aber ohne Architekturfreigabe nicht verändert.

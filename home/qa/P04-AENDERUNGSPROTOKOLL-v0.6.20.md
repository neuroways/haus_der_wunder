# EMFD-P04 – Änderungsprotokoll v0.6.20

## Neu

- `atelier.js`: Atelier-Hauptansicht, interaktiver Kartentisch, unabhängige Kartenübersicht, Filter, Zufallsauswahl, Vor/Zurück und einstiegsabhängige Rücknavigation.
- `atelier.css`: responsive P04-Darstellung für Hoch-/Querformat, Safe-Area-kompatible bestehende Shell und reduzierte Animationen.
- `tests/atelier-p04.test.cjs`: P04-Vertragsprüfungen.
- `qa/P04-*.md`: Bestand, Tests und offene Punkte.

## Geändert

- `app.js`: Routen `#atelier` und `#atelier/tisch/Oxx`, Flurzugang und P04-Aktion ergänzt; Kartenübersicht an gemeinsame Atelierkomponente angebunden.
- `index.html`: Atelier-Runtime und Styles integriert; Version auf 0.6.20 angehoben.
- `data.js`: acht dokumentierte vertauschte Bildzuordnungen bereinigt; alle Karten verwenden kanonisch `/media/cards/Oxx.png` und `imageSourceId=Oxx`.
- `emfd-ui-runtime.js`: Kartentisch als Karten-Hauptzugang markiert.
- `package.json`, `deployment-layout.json`, `playlist-catalog.json`: Entwicklungsfassung 0.6.20.
- `tests/card-texts-v1.3.test.cjs`: historische Identitätsprüfung berücksichtigt die bestätigten Bildpfadkorrekturen.

Bestehende Karten-, Text-, Licht-, Musik- und Raumfunktionen wurden nicht entfernt.

# EMFD-P04 – Technische Bestandsaufnahme

Basis ist der lokale Entwicklungsstand v0.6.19 auf Grundlage von v0.6.18. Die Anwendung ist eine statische PWA unter `home/` mit Hash-Routen und gemeinsam genutzten Medien unter `/media/`.

- Karten: 24 stabile Datensätze O01–O24 in `data.js`, je sechs Karten in Ruhe, Kraft, Halt und Freude.
- Texte: sechs optionale Textfelder je Karte vorhanden; Anzeige erfolgt erst nach bewusster Auswahl.
- Navigation: Haus, Karten und Musik sind gleichwertige Hauptzugänge; P01–P08 bleiben unverändert.
- UI: vorhandenes modulares EMFD-UI v0.3, goldene Rahmen, bestehende Karten-, Dialog- und Navigationskomponenten.
- Licht: Flurzustand liegt in der laufenden SPA-Sitzung und wird durch Ateliernavigation nicht verändert.
- Audio: eine zentrale `EMFDAudioSession`; das Atelier erzeugt und beendet keine Audioinstanz.
- Medien: P04-Raumbild und zwei P04-Varianten liegen als WebP vor. Karten O01–O24 wurden vollständig und lückenlos unter `/media/cards/` bereitgestellt.
- Tests: bestehende Node-Tests wurden beibehalten und um P04-Vertragstests ergänzt.
- Offline: kein Service Worker im Basisstand; vollständiges Offline-Verhalten ist daher nicht zugesichert.

Architekturentscheidung: Atelier und unabhängige Kartenübersicht verwenden ausschließlich `window.CARDS`; es wurde kein zweites Kartenmodell eingeführt.

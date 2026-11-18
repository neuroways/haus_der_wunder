# EMFD-ARCH-01 · Architektur und Migration

Referenz: **EMFD-v0.6.64-MUSIC03-v0.6.1-LIBRARY02a**. Die 279 Dateien des Ausgangsordners wurden vor der Bearbeitung mit dem genannten vollständigen ZIP verglichen: identisch. Anwendungsversion bleibt 0.6.64; Integrationsstand: ARCH-01, Schnittstellenversion 1.

- [Tatsächlicher Ausgangszustand](IST-ZUSTAND.md)
- [Abhängigkeiten und Modulgrenzen](ABHAENGIGKEITEN.md)
- [Verbindliche Schnittstellen](SCHNITTSTELLEN.md)
- [Migration und weitere Aufteilung](MIGRATION.md)
- [Prüfungen und Grenzen](TESTERGEBNISSE.md)

Die Anwendung bleibt eine bestehende Hash-PWA. Grammophon, Coverauswahl und Geschichtenregal erhalten eigenständige Stationsverträge; ihre Darstellung verbleibt vorerst in den vorhandenen Dateien. Die Bibliothek verwendet dieselben Verträge und denselben Buchleser. Keine Veröffentlichung, keine neuen Medien, keine geänderten Karten-IDs oder Kompositionstexte.

Die zuvor besprochene Musikzimmer-Übersicht mit „Kompositionsgeschichten lesen“ / „Musik hören“, der direkte Buchzugang vom Grammophon und die Entfernung der allgemeinen Entdeckungsfelder gehören zum anschließenden Oberflächenauftrag. Dieser ARCH-01-Stand verändert diese Flächen bewusst noch nicht. Die dafür benötigten Stationsgrenzen sind jetzt vorbereitet.

Prüfbefehle aus `home/`: `npm run test:arch` und `npm run test:arch:regression`. Der ältere Gesamttestsatz bleibt über `npm test` verfügbar; seine bereits vorhandenen Fehler sind im Prüfbericht separat ausgewiesen.

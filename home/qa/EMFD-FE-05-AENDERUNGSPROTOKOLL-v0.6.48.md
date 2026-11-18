# EMFD-FE-05 – Änderungsprotokoll v0.6.48

## Nutzerfluss

Beim ersten Öffnen von `#karten` erscheint die Leitfrage „Wie möchtest du heute schauen?“. Es ist keine Gruppe vorausgewählt. Die Besucherin kann „Alle entdecken“, „Ruhe“, „Kraft“, „Halt“ oder „Freude“ wählen.

Nach der Auswahl erscheint die vorhandene zweispaltige Kartengalerie. Die kompakte Gruppenleiste bleibt erreichbar und zeigt den aktuellen Zustand. „Alle entdecken“ enthält 24 Karten; jede Bedürfnisgruppe enthält sechs Karten. Beim Öffnen einer Karte werden Gruppe und Scrollposition in der Sitzung gespeichert. Der Rückweg zu `#karten` stellt beides wieder her. Direkte Links wie `#karte/O07` umgehen die Einladungsansicht weiterhin.

Kartentexte werden erst in der vorhandenen Kartenansicht bewusst geöffnet. Audio wird durch diese Änderung weder gestartet noch gestoppt.

## Geänderte Dateien

- `atelier.js`: freiwillige Erstauswahl, Gruppenwechsel, Zustands- und Scrollwiederherstellung.
- `atelier.css`: atmosphärische Einladungsansicht, kompakte Gruppenleiste, mobile Zwei-Spalten-Galerie und Safe-Area-Regeln.
- `index.html`, `package.json`, `manifest.webmanifest`: Version und Cache-Busting auf v0.6.48.
- `file-hashes.json`: aktualisierte Integritätsangaben.
- `tests/fe05-needs-gallery.test.cjs`: neue fachliche Regressionstests.
- `tests/package-layout.test.cjs`: erwartete Build-Version aktualisiert.

## Verwendete Medien

- Galeriehintergrund: `../media/rooms/varianten/P04-atelier-kartenauslage-v1.webp`
- Karten: `../media/cards/O01.png` bis `../media/cards/O24.png`, ausschließlich gemäß bestehendem Kartenregister.

Die weiteren geprüften Ateliermedien `P04-atelier.webp`, `P04-atelier-arbeitsflaeche-v1.webp` und `P04-atelier-treppenblick-v1.webp` bleiben unverändert. Es wurden keine Bilder erzeugt oder kopiert.

## Backend-Kompatibilität

Die vorhandenen Felder `id`, `name`, `group`, `image`, `impulse` und `imageSourceId` reichen für den Nutzerfluss aus. API-Verträge und Datenstruktur wurden nicht verändert. Es besteht kein nachgewiesener Backend-Änderungsbedarf.

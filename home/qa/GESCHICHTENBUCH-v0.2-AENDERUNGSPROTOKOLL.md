# Geschichtenbuch v0.2 – Änderungsprotokoll

## Umsetzung

- Das bestehende Buch wurde gezielt weiterentwickelt; Texte, drei Beiträge und 19 Abschnitte blieben unverändert.
- Das Weltenweberin-Porträt wird auf breiten Ansichten als linke Buchillustration und auf schmalen Ansichten innerhalb der scrollbaren Pergamentseite dargestellt.
- Eine weich kalibrierte CSS-Maske entfernt den rechteckigen Fotoabschluss an allen vier Seiten.
- Die sichtbare Bildunterschrift wurde entfernt. Der vorhandene Alternativtext bleibt in der Einzelseitenansicht einmal zugänglich; die dekorative Doppelseitenkopie ist für Hilfstechnologien ausgeblendet.
- Feste Porträthöhen, Bildrahmen und harte Bildschatten wurden entfernt.
- Buchkopf, Kapitelsteuerung und Seitennavigation bleiben stehen; ausschließlich der Buchinhalt scrollt.
- Unter 900 px wird eine Einzelseite verwendet, ab 900 px eine Doppelseite und ab 1200 px ein dauerhaftes Inhaltsverzeichnis.
- Geringe Bildschirmhöhen, dynamische Viewport-Höhe, 44-Pixel-Trefferflächen und reduzierte Bewegung sind berücksichtigt.
- Das magische Kartenbuch wurde nicht verändert.

## Geänderte Dateien

- `origin-story.js`
- `origin-storybook.css`
- `tests/origin-storybook.test.cjs`
- `index.html`
- `package.json`
- `manifest.webmanifest`
- `file-hashes.json`

Keine Veröffentlichung vorgenommen.

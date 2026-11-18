# EMFD-TEA-01 · Teezimmer / Gedankenblatt – Korrektur v0.6.58

**Basis:** `EMFD-v0.6.57-home-KOMPLETT-NOTE-UX(1).zip`  
**Status:** lokal implementierte und gezielt getestete Entwicklungsfassung; **keine Veröffentlichung / keine finale Geräteabnahme**.  
**Lieferumfang:** vollständiges `home/`, keine Bilder oder Audiodateien.

## Behobene Probleme

1. **Vierter Einstieg im regulären Navigationsblock.** `data-teezimmer-paper` befindet sich als vierte Aktion in `.teezimmer-actions`. Das zuvor separat platzierte `.teezimmer-note-access` wurde entfernt. Die drei vorhandenen Kartenaktionen bleiben unverändert verlinkt.
2. **Erreichbarkeit auf kleinen und quer gehaltenen Bildschirmen.** Statt starrer Abstände (`46dvh`, `18dvh`, `310px`) besitzt das Teezimmer eine in der Raumbühne begrenzte, bei Bedarf vertikal scrollbar bedienbare `.teezimmer-content`-Fläche. `max-height:100dvh` verhindert, dass die Bühnenhöhe auf sehr niedrigen Viewports über den sichtbaren Bereich wächst. Der Bildhintergrund bleibt als eigene Ebene stehen.
3. **Sichere Abstände und Tastatur-/Fokus-Grundlagen.** Touch-Ziele mindestens 44/58 px, seitliche und untere `safe-area-inset-*`, Tastatur-Fokus mit sichtbarer Kontur, per Tastatur fokussierbare Scrollregion. Das Gedankenblatt bleibt ein separates natives `<dialog>` und stellt beim Schließen den Fokus auf den auslösenden Button zurück.
4. **Kein stilles Scheitern bei fehlendem Modul.** Falls `EMFDThoughtPaper.open` nicht geladen wurde, erscheint im Teezimmer eine sichtbare Statusmeldung.
5. **Bild-Fallback ohne neue Medien.** Primärpfad bleibt `../media/rooms/teezimmer_p08_background.webp`. Bei Ladefehler wird einmalig `../media/rooms/P08-teezimmer.webp` (vorhandener Altbestand aus der bereitgestellten Medienablage) ausprobiert. Schlägt auch dieser fehl, folgt die vorhandene textliche Bildausfallmeldung. Kein neues Bild und kein neuer Medienpfad außerhalb des bekannten Bestands erforderlich.
6. **Cache-Versionierung.** `teezimmer.css`, `teezimmer.js` und das angepasste `thought-paper.css` sind in `index.html` mit `?v=0.6.58` eingebunden. `package.json`, `deployment-layout.json` und die App-Version sind auf `0.6.58` angehoben. Datei-Hash-Verzeichnis nachgeführt.
7. **Keine zweite Notizfunktion.** Weiterhin dasselbe flüchtige `EMFDThoughtPaper` mit `mode:'free'`, ohne Pflichtfrage oder Datenbank. Rückweg zu `#teezimmer` und vorhandener Musikzugang bleiben bestehen. Bildmaterial, Audiomodell und andere Raumrouten wurden nicht verändert.

## Teststand

- Bestehende Tee-/Buchtests + fünf neue TEA-01-Regressionstests: **18/18 bestanden**.
- Chromium-Komponenten-Browsertest (JavaScript und CSS der Anwendung, ohne vollständige Netz-/PWA-Installation): **5/5 Bildschirmgrößen** – 393×852, 320×568, 844×390, 768×1024, 1440×900. Geprüft: vier Aktionen, Scrollbarkeit bei Platzmangel, Öffnen/Schließen der freien Notiz, freier Modus ohne Frage, Bestätigungsdialog bei Text, Verwerfen ohne Speicherung, Fokus-Rückkehr, vorhandener Musik-Button. **Alle diese Prüfungen bestanden**.
- Gesamttestsuite: **136 bestanden, 23 fehlgeschlagen, 1 übersprungen (160 insgesamt)**. Die 23 Fehlschläge stammen aus älteren, versions- oder medienabhängigen Prüfungen bzw. weiteren schon vor v0.6.58 vorhandenen Bereichen; die Anzahl ist gegenüber dem Eingangspaket v0.6.57 nicht gestiegen. Sie sind **kein Gesamt-PASS**.

**Browsergrenze:** Die Containerumgebung blockierte die direkte URL-Navigation des Browsers; daher wurden die Teezimmer-Komponenten mit lokal geladenem Original-JavaScript/-CSS in einem Chromium-Dokument getestet. Das ersetzt **keinen** vollständigen Test der gesamten PWA, des iPhone-Safari-Systems, der Tastatur bei echter Gerätebedienung oder des Systemexports.

## Noch erforderlich / außerhalb dieses Auftrags

- **Tatsächliche Installation und Geräteabnahme** unter einer echten HTTPS-URL: Safari auf iPhone (Hoch-/Querformat, Tastatur geöffnet), Android Chrome, Escape/VoiceOver, PNG-/PDF-Dateiablage und Scan des exportierten QR-Codes. Der Export verlangt eine HTTPS-Zieladresse und kann in HTTP-Testumgebungen blockieren.
- **Medienbestand des Zielservers:** Im neu beigefügten `v0.6.55-media`-Archiv befindet sich nur die Kartenrückseite. Die ursprüngliche `EMFD_Media_Ablage_v1.0` enthält `media/rooms/P08-teezimmer.webp`; die neue primäre Datei `teezimmer_p08_background.webp` ist in den aktuell bereitgestellten Medienarchiven nicht nachweisbar. Die Fallback-Datei muss auf dem Zielserver vorhanden sein, falls die neue primäre Datei fehlt. Für diese Korrektur wurden **keine Medien neu erstellt oder verändert**.
- **Separat beauftragte visuelle Neugestaltung des Teezimmers:** nicht Gegenstand von TEA-01; neue Illustration/Anordnung erst nach gesonderter Freigabe integrieren.
- **Andere offene Themen:** Buch-Wischbereich, originärer HTTPS-Export, ältere Gesamttestsuite und eventuelle Performance-/Medienprobleme wurden hier nicht verändert.

## Installation

Das Archiv enthält ausschließlich den vollständigen Ordner `home/` auf der obersten ZIP-Ebene. Ziel: `Root/moments/home/` (nicht `home/home/`). Bereits vorhandenes `media/` **nicht** löschen oder überschreiben. Nach Austausch die App-Version `0.6.58` prüfen und neu laden. Nicht veröffentlicht.

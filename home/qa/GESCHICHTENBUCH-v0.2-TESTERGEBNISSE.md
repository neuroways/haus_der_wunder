# Geschichtenbuch v0.2 – Testergebnisse

## Automatisiert

- PASS – drei unveränderte Beiträge und exakt 19 Abschnitte
- PASS – Inhaltsverzeichnis und aktiver Abschnitt
- PASS – vorheriger/nächster Abschnitt über Beitragsgrenzen hinweg
- PASS – Scrollposition beginnt nach Abschnittswechsel oben
- PASS – Porträt besitzt genau eine zugängliche Beschreibung
- PASS – keine sichtbare doppelte Bildunterschrift
- PASS – fehlendes Porträt entfernt nur das Bild, niemals den Text
- PASS – Einzelseite, Doppelseite und Desktop-Inhaltsverzeichnis
- PASS – 44-Pixel-Trefferflächen und reduzierte Bewegung
- PASS – Fokus-Rückgabe und bestehende Audio-Pause
- PASS – übrige PWA einschließlich magischem Kartenbuch

Gesamtergebnis: **115 PASS, 0 FAIL, 1 SKIPPED**. Der Skip betrifft ein nicht geliefertes gemeinsames MP3-Testmedium.

## Tatsächlich visuell/interaktiv geprüft

- PASS – schmale Chromium-Ansicht: keine horizontale Überlagerung, nur Buchinhalt scrollt
- PASS – Porträt geht weich in das Pergament über
- PASS – Kapitelwahl öffnet alle drei Gruppen und 19 Abschnitte
- PASS – Navigation 19 / 19 → 18 / 19 über die Beitragsgrenze
- PASS – Schließen setzt den Fokus auf „Über dieses Geschenk“ zurück
- PASS – Alternativtext enthält Frau, Katze, Laterne, Bücher, Tasse, Notizbuch, Kamera und Galerien
- BLOCKED – echtes iPhone Safari, Android Chrome, Tablet und 200-%-Gerätezoom standen in dieser lokalen Testumgebung nicht zur Verfügung
- BLOCKED – abschließender VoiceOver-/TalkBack-Gerätetest; Browsersemantik wurde geprüft

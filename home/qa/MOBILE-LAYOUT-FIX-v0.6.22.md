# Mobile Layout Fix – v0.6.22

## Ursache

- Startseite und Flur erzwangen auf Smartphones ein inneres 9:16-Element zusätzlich zu Header und Hauptnavigation.
- Dadurch war das Dokument höher als der verfügbare Safari-Viewport und musste innerhalb der Anwendung gescrollt werden.
- Das Startbild lag ausschließlich im gemeinsamen Medienpaket. Fehlte diese einzelne Serverdatei, blieb die Startseite ohne Illustration.
- Die allgemeine mobile Primary-Button-Regel und eine spätere Transform-Regel verschoben die beiden Startaktionen.

## Korrektur

- Startseite und Flur verwenden auf Mobilgeräten `100dvh` und füllen exakt den Bereich zwischen Header und Hauptnavigation.
- Innerer Rand, Rundung und Schatten wurden in diesen beiden mobilen Vollbildansichten entfernt.
- Das Startbild wird zusätzlich als `home/assets/rooms/startseite-haustuer-v1.webp` ausgeliefert.
- Tür- und Geschenkaktion besitzen begrenzte, kollisionsfreie mobile Positionen.
- Andere Räume, Karten, Musik, Lichtzustand und Desktopdarstellung bleiben unverändert.

## Prüfung

- PASS: Browserprüfung bei 393 × 852 px.
- PASS: `document.documentElement.scrollHeight === window.innerHeight` im Flur (852 px).
- PASS: Startbild sichtbar.
- PASS: Beide Startaktionen vollständig sichtbar und getrennt.
- PASS: Flur-Hotspots und Hauptnavigation ohne Scrollen erreichbar.
- PASS: automatisierte Tests ohne Fehler.

Final result: passed

# Testprotokoll · BOOK-01d / EMFD-UX-TUT-02 · App v0.6.72

Datum: 20.11.2026 · Build: Branch `claude/book-01d-tutorial` (Basis 838cc57 + Arbeitsstand dieses Commits) · lokaler Server `home/server.mjs` mit Service Worker
Werkzeug: Chromium (Playwright). Geräteprofile: iPhone 13 (Emulation, Touch), Desktop 1440×900, dazu 320×568, 768×1024, 1024×768, 844×390, 1920×1080, reduzierte Bewegung, gesperrter Speicher. Skript: Arbeitsverzeichnis der Sitzung (`proto.cjs`), Ergebnisse unten unverändert übernommen.

**Nicht geprüft (NOT_RUN):** echtes iPhone/Safari, echtes Android, VoiceOver/TalkBack, STRATO-Server. Musik: lokal liegen keine MP3 (nur nach Freigabe auf STRATO) – O15 meldet daher „nicht verfügbar“; auch auf STRATO fehlt `O15-M01.mp3`. Glockenton: kein Medium vorhanden.

| ID | Umgebung | Prüfung | Ergebnis | Beleg / Ist |
|---|---|---|---|---|
| T01 | phone | Erster Besuch, Tür direkt | **PASS** | Willkommen=true, danach #flur, Starttour-Dialog offen=false, play()=0 |
| T16 | phone | Nach Eintritt + Reload: normaler Einstieg (Flur), kein Neustart | **PASS** | #flur |
| T02 | phone | Einführung bewusst starten | **PASS** | {"hint":"look","seg":"M"} |
| T03 | phone | Umschauen per Pfeil; Randhinweis erst am Rand; kein automatisches Drehen | **PASS** | {"seg":"L","hint":"turn","scene":"EXT-C01"} |
| T03b | phone | Wischen (Scroll) aktualisiert Ausschnitt und Punkte | **PASS** | M |
| T04 | phone | Umdrehen in die Gegenansicht (Richtung) | **PASS** | von L → EXT-C02 R |
| T06a | phone | Garten: Hinweis „Der Garten“, nichts geöffnet, keine Musik | **PASS** | garden |
| T06 | phone | Prinzip zeigt Brücke und Tor ohne Öffnen/Audio | **PASS** | ["EXT-C02-BRUECKE","EXT-C02-GARTENTOR"] |
| T08 | phone | O09: Originalkarte öffnen, Rückweg in Szene und Ausschnitt | **PASS** | {"back":"#raum/EXT/C02","seg":"R","hint":null} |
| T07 | phone | O15 Musik: erst Play startet, Pause, Rückkehr in Ausschnitt | **PASS** | {"playsBefore":0,"track":"O15","state":"unavailable","paused":"unavailable","seg":"L"} |
| T10a | phone | Hilfehinweis markiert Fragezeichen, Install-Hinweis dezent | **PASS** | installLink=true |
| T10 | phone | Hilfe öffnen; Einführung, Geschenk, „Das Haus griffbereit“ erreichbar | **PASS** | ["Einführung erneut starten (führt zum Eingang)","Geschenkbrief und Geschenkkarte","Das Haus griffbereit"] |
| T09 | phone | Hinweise schließen ohne Sperre bis „Zurück zum Haus“ | **PASS** | ["bridge","more","help"] → return |
| T04b | phone | Zurückdrehen zum Haus | **PASS** | {"seg":"R","hint":"letter"} |
| T12 | phone | Licht an/aus, Blickwechsel: Zustand bleibt | **PASS** | vorher true, danach false, nach 2× Umdrehen false; Lichtmaske = Platzhalter |
| T13 | phone | Brief öffnen (Animation, Originaltext), Geschenkkarte mit QR, Rückkehr | **PASS** | gift-completed=1 |
| T14 | phone | Glocke MP-EXT: Ortsmusik/Musikentscheidung, kein Autoplay | **PASS** | nicht gemerkt→session=off, gemerkt→local=off; kein Glockenton (Medium fehlt) |
| T11 | phone | Vorzeitig/zurück am Haus: alle Aktionen nutzbar, Hinweise frei | **PASS** | Hinweis jetzt: null |
| T15 | phone | Tür in der Einführung: direkter Eintritt in den Flur, kein Abschlussdialog, keine Starttour | **PASS** | #flur |
| T15b | phone | Browser-Zurück aus dem Flur führt zum Eingang | **PASS** | #raum/EXT/C01 |
| ERR | phone | Keine Skriptfehler im Ablauf | **PASS** | [] |
| T01 | desktop | Erster Besuch, Tür direkt | **PASS** | Willkommen=true, danach #flur, Starttour-Dialog offen=false, play()=0 |
| T16 | desktop | Nach Eintritt + Reload: normaler Einstieg (Flur), kein Neustart | **PASS** | #flur |
| T02 | desktop | Einführung bewusst starten | **PASS** | {"hint":"look","seg":"M"} |
| T03 | desktop | Breit: keine Pflicht-Wischgeste; Umdrehen an beiden Seiten | **PASS** |  |
| T03c | desktop | Nach „Umschauen“ folgt „Umdrehen“ | **PASS** | turn |
| T04 | desktop | Umdrehen in die Gegenansicht (Richtung) | **PASS** | von M → EXT-C02 M |
| T06a | desktop | Garten: Hinweis „Der Garten“, nichts geöffnet, keine Musik | **PASS** | garden |
| T06 | desktop | Prinzip zeigt Brücke und Tor ohne Öffnen/Audio | **PASS** | ["EXT-C02-BRUECKE","EXT-C02-GARTENTOR"] |
| T07 | desktop | O15 Musik: erst Play startet, Pause, Rückkehr in Ausschnitt | **PASS** | {"playsBefore":0,"track":"O15","state":"unavailable","paused":"unavailable","seg":"M"} |
| T10a | desktop | Hilfehinweis markiert Fragezeichen, Install-Hinweis dezent | **PASS** | installLink=true |
| T10 | desktop | Hilfe öffnen; Einführung, Geschenk, „Das Haus griffbereit“ erreichbar | **PASS** | ["Einführung erneut starten (führt zum Eingang)","Geschenkbrief und Geschenkkarte","Das Haus griffbereit"] |
| T09 | desktop | Hinweise schließen ohne Sperre bis „Zurück zum Haus“ | **PASS** | ["bridge","gate","more","help"] → return |
| T04b | desktop | Zurückdrehen zum Haus | **PASS** | {"seg":"M","hint":"light"} |
| T12 | desktop | Licht an/aus, Blickwechsel: Zustand bleibt | **PASS** | vorher true, danach false, nach 2× Umdrehen false; Lichtmaske = Platzhalter |
| T13 | desktop | Brief öffnen (Animation, Originaltext), Geschenkkarte mit QR, Rückkehr | **PASS** | gift-completed=1 |
| T14 | desktop | Glocke MP-EXT: Ortsmusik/Musikentscheidung, kein Autoplay | **PASS** | nicht gemerkt→session=off, gemerkt→local=off; kein Glockenton (Medium fehlt) |
| T11 | desktop | Vorzeitig/zurück am Haus: alle Aktionen nutzbar, Hinweise frei | **PASS** | Hinweis jetzt: enter |
| T15 | desktop | Tür in der Einführung: direkter Eintritt in den Flur, kein Abschlussdialog, keine Starttour | **PASS** | #flur |
| T15b | desktop | Browser-Zurück aus dem Flur führt zum Eingang | **PASS** | #raum/EXT/C01 |
| ERR | desktop | Keine Skriptfehler im Ablauf | **PASS** | [] |
| T17 | phone | Cache gelöscht, localStorage erhalten: kein Tutorialzwang | **PASS** | #flur |
| T18 | phone | Speicher verweigert: optionaler Einstieg, Tür erreichbar, keine Fehler | **PASS** | {"hint":"welcome","after":"#flur","errs":[]} |
| MIG | phone | Migration: Altnutzer (Geschenk+Einführung abgeschlossen) | **PASS** | #flur; Werte unverändert on,off,1 |
| MIG | phone | Migration: Nur Tutorial erledigt | **PASS** | #flur; Werte unverändert on,off,1 |
| MIG | phone | Migration: Nur Brief gelesen (alter Erstbesuch) | **PASS** | ; Werte unverändert on,off,1 |
| T19 | desktop | Hilfe → Einführung erneut starten: nur Tutorialzustand | **PASS** | #raum/EXT/C01, look; übrige Werte gleich=true |
| T16b | desktop | Reload in aktiver Einführung: Angebot statt Automatik | **PASS** | Route #flur (Folgebesuch → Flur); im Eingang: – |
| T16c | desktop | Aktive Einführung nach Reload im Eingang | **PASS** | look |
| GIFT | phone | Geschenkbereich aus dem Flur (alte Verknüpfung) ohne Navigation | **PASS** |  |
| INST | phone | Installation: nie automatisch, manuell über Hilfe, „Später“ dauerhaft | **PASS** | auto=false, manuell=true, gespeichert=1 |
| T21 | desktop | Tastatur/Screenreader: Aktionsliste, echte Buttons mit Beschriftung | **PASS** | ["Wandlaterne ein- oder ausschalten","Eingangsglocke","Brief öffnen","Haus betreten","Linke Bodenlaterne","Rechte Bodenlaterne","Umdrehen: Garten"] |
| T21b | phone | Reduzierte Bewegung: Umdrehen ohne lange Animation | **PASS** | {"seg":"L"} |
| T20 | browser | Größe iPhone SE 320×568 | **PASS** | {"overflow":false,"inside":true,"wide":false,"stageW":1009,"stageH":568,"hintCoversDoorCenter":true} |
| T20 | browser | Größe Tablet hoch 768×1024 | **PASS** | {"overflow":false,"inside":true,"wide":false,"stageW":1818,"stageH":1024,"hintCoversDoorCenter":false} |
| T20 | browser | Größe Tablet quer 1024×768 | **PASS** | {"overflow":false,"inside":true,"wide":true,"stageW":1024,"stageH":577,"hintCoversDoorCenter":false} |
| T20 | browser | Größe Phone quer 844×390 | **PASS** | {"overflow":false,"inside":true,"wide":true,"stageW":693,"stageH":390,"hintCoversDoorCenter":true} |
| T20 | browser | Größe PC 1920 1920×1080 | **PASS** | {"overflow":false,"inside":true,"wide":true,"stageW":1920,"stageH":1080,"hintCoversDoorCenter":false} |
| T22 | desktop | Fehlendes Medium: Platzhalter mit ID, Hotspots bleiben | **PASS** | scene.EXT-C01.placeholder |
| T05 | desktop | Desktop: ganze 16:9-Szene, keine Seitenleiste/Fortschritt/Kursnavigation | **PASS** | {"ratio":"1.776","cover":"0.90","progress":false,"aside":false,"stepText":false} |

Summe: 60 PASS, 0 FAIL.

## Zuordnung zum Katalog 04_TEST_UND_ABNAHME.md
T01–T16, T19–T22 und T05 wie oben. T17 (Cache gelöscht) und T18 (Speicher verweigert: `Storage`-Methoden werfen) PASS.
T23 Regression: `npm test` 365 bestanden / 0 fehlgeschlagen / 1 übersprungen. Zusätzlich im Browser: Flur, Karte O09, Rückwege, Hilfe, Einstellungen-Aufruf, Geschenk aus dem Flur.
T24 (eine Engine, W1): Brückenmusik und Hauptthema laufen über `EMFDAudio`; ein Hinweis stoppt nichts (Code-Test). Gleichzeitiges Abspielen mit echter Musik: NOT_RUN (keine MP3 lokal).
T25 (Hinweise überdecken Ziel nicht): Hinweise weichen auf breiten Bildschirmen seitlich aus bzw. stehen oben, wenn das Ziel unten liegt. Ausnahme: Auf sehr kleinen Ansichten (320×568, 844×390) überdeckt die Willkommenskarte den unteren Teil der großen Tür; die Tür bleibt oberhalb antippbar und „Haus betreten“ steht im Hinweis selbst.

## Beobachtung außerhalb des Auftrags
Wird der Zugriff auf `window.localStorage` selbst vollständig gesperrt (Eigenschaft wirft), meldet die Seite einen Skriptfehler aus einem bestehenden Modul. Das trat schon im Zwischenstand vor dem Eingangsmodul auf; die Ursache ist noch nicht eingegrenzt. Der Einstieg bleibt trotzdem bedienbar. Normale Fälle (privater Modus, Methoden werfen) sind fehlerfrei.

# EMFD-Rückmeldung · EMFD-CACHE-01 · Bilder und Musik dauerhaft offline
Datum: 19.11.2026 · Ergebnis: umgesetzt (im Code; auf dem iPhone noch nicht getestet) · Commit: 227192c (+ Rückmeldung) auf claude/cache-01-offline-medien (Basis: claude/modest-galileo-ifo41b 3792448, v0.6.70)

## Was sich für die Person ändert
- Beim ersten Öffnen lädt die App alle App-Dateien und die Startbilder, bevor sie startet. Direkt danach werden alle übrigen Bilder des Hauses im Hintergrund geladen, ohne Anzeige. Ab dann kommen Bilder ausschließlich aus dem Gerät; Dateien mit Hash im Namen werden nie wieder geladen.
- Die bisherige Grenze von 20 MB fällt weg. Sie hatte bisher ältere Bilder wieder verdrängt, die dann erneut aus dem Netz kamen.
- Musik: Beim ersten Abspielen eines Stücks läuft es wie bisher direkt aus dem Netz. Ca. 4 s später wird die Datei einmal vollständig im Hintergrund gespeichert. Jedes weitere Abspielen kommt aus dem Gerät, auch im Flugmodus. Ändert sich eine Datei auf dem Server unter gleichem Namen, wird das erkannt und das Stück einmal neu geladen.
- Die App startet auch ohne Netz (App-Dateien und Startseite aus dem Cache).
- Beim Update wird der vorhandene Bildcache übernommen, nichts wird doppelt geladen.

## Abweichungen vom Auftrag (mit Grund)
- Musik wird nicht vorab geladen. MEDIEN-KONVENTION und D-05 verbieten „Audio-Precache“. Speichern beim ersten Abspielen erfüllt „nicht immer wieder runterladen“ ohne Regeländerung.
- Kosten: Beim ersten Abspielen fällt das Datenvolumen eines Stücks einmalig doppelt an (Streaming + Speicherung).
- Keine sichtbare Lade- oder Fortschrittsanzeige (feste Regel). Diagnose nur über `EMFDOffline.status()` in der Konsole.
- App-Version nicht erhöht (bleibt 0.6.70), um Konflikte mit parallelen BOOK-01-Aufträgen zu vermeiden. Beim Zusammenführen erhöhen.

## Antworten auf die offenen Fragen
- Welche Bilder? Die 219 Dateien der bisherigen PERF-01-Liste (Karten in allen Größen, Rückseite, Räume, Hintergründe, Startbilder) plus die aktuellen r2-Vorderseiten, die `media-bridge.js` aus dem zentralen Manifest meldet. Superseded-Originale aus dem Katalog werden bewusst nicht geladen (nur Rückfall).
- Größe? Kartenbilder laut Profil ca. 13 MB; die Raumbilder sind im Repo nicht enthalten, Gesamtgröße deshalb nicht geprüft (Schätzung 25–40 MB einmalig).

## Tests
- npm test: 348 bestanden, 0 fehlgeschlagen, 1 übersprungen (vorher 339/0/1).
- Neu: tests/cache-01-offline.test.cjs, 9 Verhaltenstests in simulierter Worker-Umgebung: Installation ohne Musik, alle Hausbilder ohne Verdrängung über 20 MB, Cache-Treffer offline, Musik erst Netz dann 206 aus Cache (Bytes geprüft), 416 bei ungültigem Bereich, ETag-Wechsel verwirft Datei, Übernahme des alten Caches, Offline-Start, generierte Liste aktuell.
- Angepasst (alte PERF-01-Politik): fix01, start-02, card-back-01, ui-architecture-v0.6.64, fe08.
- tests/run_tests.sh: unverändert gegenüber Basis (32 Medien-Fehler bereits vorher).
- **Nicht geprüft:** echter Browser, iPhone, STRATO-Server.

## Neue offene Punkte / Fragen an die Planung
1. ⚪ Optionaler Knopf „Musik offline speichern“ (alle Stücke auf einmal) braucht eine Änderung von D-05. Die Technik ist vorhanden, die Entscheidung liegt bei der Nutzerin.
2. 🟡 STRATO-`.htaccess` in `/wunderhaus/media/` empfohlen: `immutable` für Dateien mit Hash, `no-cache` für `manifest.json`. In `/wunderhaus/home/` `no-cache` für `image-service-worker.js` und `offline-*.js` (siehe PR).
3. ⚪ iPhone-Abnahme: siehe PR-Beschreibung.

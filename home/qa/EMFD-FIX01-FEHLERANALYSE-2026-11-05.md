# EMFD-FIX01 · Fehleranalyse, Korrekturen und Abnahme

**Stand:** 05.11.2026  
**Auftrag:** Aus den Rückmeldungen 13:21–13:37 Uhr die verantwortlichen Dateien prüfen und Fehler abarbeiten.  
**Ausgangspakete:** `home.zip` und `EMFD-v0.6.61-home-KOMPLETT-START02-DESKTOP-MUSIK.zip`  
**Korrigiertes Build:** `home/` v0.6.62 · **keine Veröffentlichung durchgeführt**.

## 1. Paketvergleich (vor Änderungen)

- Referenz v0.6.61: **201 Dateien** in `home/`.
- Angeliefertes `home.zip`: **240 Dateien** in `home/`.
- **189** Dateien bitidentisch, **12** unterschiedliche Dateien, **39** nur in `home.zip`, keine gegenüber der Referenz fehlenden Dateien.
- Die 39 zusätzlichen Dateien enthalten insbesondere 24 lokale Karten-Fallbacks, eine lokale Rückseite, ein Medienregister und Wiederherstellungslogik. Diese Dateien wurden **nicht verworfen**.
- Die mitgelieferte `file-hashes.json` war für `home.zip` veraltet. Im neuen Paket wurde sie anhand des tatsächlichen Bestands vollständig erneuert.

## 2. Fehlerliste nach Ursprungstext

**Statusschlüssel:** KORRIGIERT = Code gezielt geändert; VORHANDEN = Anforderungen bereits im angelieferten Code berücksichtigt; TEILWEISE = bestmögliche Korrektur, echte Website-/Gerätetests stehen aus; BLOCKIERT = fehlende Originalmedien oder notwendiger Live-Test.

| ID | Beanstandung / Abnahmepunkt | Betroffene Datei / Ursache | Ergebnis / Status |
|---|---|---|---|
| F01 | „Über dieses Geschenk“ auf Startseite übergroß (323 px), überlagert Türbutton | `start-gate-v0.6.61.css`, `desktop-layout.css`, `emfd-ui/css/emfd-ui.css`, Dekoration über `emfd-ui-runtime.js`: Grid-Layout und gemeinsame Button-Mindestmaße können sich addieren | **KORRIGIERT:** Zwei inhaltsgroße Aktionszeilen, explizite Höhenbegrenzung und Größenregeln in `desktop-layout.css`. Live-Messung offen. |
| F02 | Live-Seite ist alter Versionsstand | `index.html`, `package.json`, `deployment-layout.json`, `image-profiles.js`; ursprünglich gemischte v0.6.61- und v0.6.62-auto1-Cache-Parameter | **KORRIGIERT** im neuen Paket v0.6.62; Veröffentlichung ausdrücklich **nicht durchgeführt**. |
| F03 | Bilder vom Medienarchiv gegen die App prüfen | `media-catalog.js`, `media-catalog.json`, `media-core.js`, `media-recovery.js`: Register enthält logische Motivgruppen, aber ein Archiv-Eintrag ist kein Ladebeleg | **VORHANDEN:** 63 Motivgruppen. **KORRIGIERT:** Kandidaten aus einer alten 404-Momentaufnahme werden nicht dauerhaft ausgeschlossen. |
| F04 | Fehlende Bilder automatisiert nachladen; keine andere Karte einsetzen | `media-recovery.js`, `card-preload.js`, `image-service-worker.js`: asynchrone Ersatzpfade, Laufzeitfehler und Retry | **TEILWEISE:** dieselben Motivvarianten + lokales Fallback + Netzwerk-Retry; Bilder ohne vorhandene Datei bleiben technisch nicht reparierbar. |
| F05 | Kartenrückseite v1.2 und sechs START-02-Bilder prüfen | `image-profiles.js`, `media-catalog.json`, `start-gate.js`, `qa/EMFD-START-02-MEDIENPFADE-v0.6.61.md` | **Rückseite VORHANDEN:** `../media/cards/rueckseite.jpeg`, lokales Fallback `assets/recovery/rueckseite.jpeg`. **A01–A06 BLOCKIERT**, da nicht enthalten. |
| F06 | Bilder früh vorbereiten und Ladeverzögerung abfangen | `card-preload.js` hatte `initialize()` ohne tatsächlichen Download; `start-gate.js` klassifizierte Verzögerungen bereits nach 1,8 s als Fehler | **KORRIGIERT:** 24 kompakte Kartenvorschauen + Rückseite begrenzt parallel im Hintergrund; Starttür spätestens nach 2,5 s bedienbar, Bildprüfung bis 10 s. |
| F07 | Kein Button „Mit Handybewegung“; Sensornutzung automatisch | `card-motion.js`, `device-light.js`, `index.html` | **KORRIGIERT:** keine separate Entscheidung; auf iOS wird die systemseitig nötige Berechtigungsanfrage bei einer vorhandenen Kartenberührung versucht. Ohne Erlaubnis Touch/Maus. |
| F08 | Karte reagiert auch ohne Sensor auf Berührung/Maus | `app.js`, `card-motion.js` | **VORHANDEN:** Pointer-Interaktion als Fallback, Bewegung im Ruhemodus deaktiviert. Reale Touch-Prüfung offen. |
| F09 | Kurzer Erklärhinweis beim ersten Kartenkontakt | `card-motion.js`, `desktop-layout.css` | **VORHANDEN:** ein erstmals gezeigter Hinweis je Gerätetyp, nach rund 5,5 s entfernt. |
| F10 | Kartengrafik vollständig ohne unfreiwilligen Beschnitt | `card-interaction.css`, `card-interaction.js`, `app.js` | **VORHANDEN:** `object-fit:contain` und Verhältnisberechnung. Reale Bildschirmprüfung offen. |
| F11 | Teezimmer-Buttons viel zu breit | `teezimmer.css` enthält 650px Rasterbreite; `desktop-layout.css` hatte eine spätere 360px-Überschreibung | **KORRIGIERT/ABGESICHERT:** maximal 360 px, auf sehr kleinen Displays 310 px, feste Mindesthöhe. Visuelle Abnahme offen. |
| F12 | „Eine Karte aussuchen“ führt zur Übersicht | `teezimmer.js` | **VORHANDEN:** Link `#karten`. |
| F13 | „Tageskarte ziehen“ zieht zufällig | `teezimmer.js`, `card-draw.js` | **VORHANDEN:** zufällige Auswahl O01–O24 und verdeckte Karte. |
| F14 | Gedankenblatt im Teezimmer entfernen | `teezimmer.js` | **VORHANDEN:** nur zwei Auswahlaktionen; Gedankenblattmodul selbst für Karten weiterhin erhalten. Ältere Tests widersprechen dieser neuen UX-Entscheidung. |
| F15 | Hilfe oben erklärt beide Wege, Zweck Tageskarte | `index.html`, `card-interaction.js` | **VORHANDEN:** Teezimmer-Hilfe mit eigenem Kontext. |
| F16 | In `#karten` Hintergrundmusik stoppen | `music-player.js` | **VORHANDEN:** `hashchange` stoppt Session auf `#karten`. Interaktionstest offen. |
| F17 | In `#flur` Hintergrundmusik wieder einsetzen | `music-player.js` | **VORHANDEN:** Rückkehr startet das Theme erneut, sofern keine bewusste Pause/Stille oder andere Sperre besteht. Browser-Autoplay-Regeln sind zu beachten. |
| F18 | Kein Audio-Konflikt zwischen Hausmusik, Kartenmusik, Pausen | `music-player.js`, `audio-session.js` | **VORHANDEN:** zentrale Session, globale Stille und Nutzerpause. Übergänge im Live-Browser noch testen. |
| F19 | Verdeckte Karte zeigt `cards/rueckseite.jpeg` | `image-profiles.js`, `app.js`, `card-interaction.js` | **VORHANDEN:** identischer Rückseitenpfad in allen drei Bildprofilen; lokale Kopie vorhanden. |
| F20 | Impuls/Vertiefung/Frage in einem Buchsymbol bündeln | `app.js` (`cardDock()`), `music-player.js` (Audiosymbol) | **KORRIGIERT:** ein Buchbutton anstelle der drei Textaktionen. |
| F21 | Tonsymbol erhalten | `music-player.js` (`ensureDock`) | **VORHANDEN:** separates Tonsymbol wird dynamisch ergänzt. |
| F22 | Doppelklick auf Kartenansicht öffnet Buch; Einzelklick dreht | `app.js` (`bindMotion()`): alter Doppelklick-Handler war leer, Pointerup drehte sofort | **KORRIGIERT:** Einzelklick nach kurzer Unterscheidungszeit; Doppelklick öffnet Kartenbuch. Verdeckte Karten verraten ihren Titel nicht vor der Aufdeckung. |
| F23 | Im Buch Icon-Tabs statt Wörter | `app.js` (`showReadingPage()`), `desktop-layout.css` | **VORHANDEN:** drei SVG-Icons und per CSS visuell versteckte Beschriftungen; Screenreader-Labels bleiben. |
| F24 | Fünf speicherbare Textgrößen für Buch-/Textseiten | `book-reading.js`, `desktop-layout.css` | **KORRIGIERT/ERWEITERT:** 16/18/20/23/26 px, lokale Speicherung, gemeinsame CSS-Variable und dynamische Montage. |
| F25 | Schriftart und Kontrast/Umbrüche auf Endgeräten | `desktop-layout.css`, `reading.css`, `book-v2.css` | **TEILWEISE:** System-/Fallback-Schriften, erweiterte Typografieregeln und Zeilenabstand. Visuelle Prüfung bei 200 % Zoom und realen Geräten offen. |
| F26 | Alle 24 Karten berücksichtigen, nicht nur O23 | `app.js`, `image-profiles.js`, `card-preload.js`, `tests/fix01-user-requirements.test.cjs` | **KORRIGIERT:** eine gemeinsame Komponentenlogik für alle IDs und 24 vorhandene lokale Wiederherstellungsbilder; keine separaten O23-Sonderregeln. |

## 3. Fehlende Dateien: eigener Blocker

Das aktuelle `home.zip` sowie das Referenz-ZIP enthalten keine sechs fertigen START-02-Bilder. Es gibt *keinen* belastbaren Nachweis, dass diese mittlerweile unter `/media/start/` live vorhanden sind. Die mitgelieferte frühere Prüfung führte sie als nicht verfügbar.

1. `../media/start/EMFD-START-02-A01-tisch.webp`
2. `../media/start/EMFD-START-02-A02-umschlag-koerper.webp`
3. `../media/start/EMFD-START-02-A03-umschlag-lasche.webp`
4. `../media/start/EMFD-START-02-A04-herzsiegel.webp`
5. `../media/start/EMFD-START-02-A05-briefpapier.webp`
6. `../media/start/EMFD-START-02-A06-geschenkkarte-vorderseite.webp`

**Keine Ersatzillustrationen erfunden.** Der Schriftinhalt und die Hausnavigation bleiben bei Ausfall erreichbar. Die fehlenden Originale müssen separat geliefert und nach dem vorgesehenen `media/`-Pfad kopiert werden. Besonders A03 benötigt gemäß Gestaltungsvorgabe eine goldverzierte Umschlaglasche.

## 4. Prüfungen

- Alle JavaScript-Quelldateien: `node --check` **PASS**.
- 55 aus `index.html` referenzierte lokale Dateien: **alle vorhanden**.
- 24 lokale Kartenfallbacks: **vorhanden und im Medienkatalog registriert**.
- Lokale Kartenrückseite: **JPEG 958 × 1642 px vorhanden**.
- Eigene FIX01-Regressionsprüfung: **14 von 14 Tests bestanden** (Quellcode-/Strukturtests, keine echten Browserinteraktionen).
- Bestehende ältere Testsuite vor FIX01: **161 bestanden, 26 fehlgeschlagen, 1 übersprungen** bei 188 Tests.
- Bestehende ältere Testsuite nach FIX01: **156 bestanden, 31 fehlgeschlagen, 1 übersprungen** bei 188 Tests. Fünf zusätzliche Abweichungen ergeben sich aus geänderten Implementierungen und Versionsannahmen (darunter die nun tatsächlich ausgelöste Hintergrundvorladung der 24 Karten-Vorschaubilder); die vorhandenen Tests setzen teils ausdrücklich das mittlerweile abgewählte Teezimmer-Gedankenblatt und ältere Kartenaktionen voraus. Ausstehende oder alte Tests dürfen nicht als neue Funktionsfehler gleichgesetzt werden; einzelne Prüfungen zu Dateipfaden bleiben unabhängig nachzuverfolgen.
- Visuelle/browserbasierte QA wurde versucht, konnte aber nicht ausgeführt werden: Chromium verweigert in dieser Umgebung sogar lokale und `data:`-URLs mit `ERR_BLOCKED_BY_ADMINISTRATOR`. Deshalb **keine Behauptung einer erfolgreichen Live- oder Mobilabnahme**.

## 5. Übergaberegeln

- `home/` **vollständig** auf Basis des beigestellten `home.zip` liefern und beim Deployment kontrolliert ersetzen.
- `media/` nur neue oder geänderte Medien separat liefern. **In dieser Korrektur wurden keine neuen Medien produziert**, deshalb kein zusätzliches Medien-ZIP.
- Die 39 bereits vorhandenen Zusatzdateien aus `home.zip` (einschließlich Recovery-Assets) bleiben enthalten.
- Nach Deployment auf dem tatsächlichen Ziel `flowisaurus.de/wunderhaus/home/` zunächst Startseite, #teezimmer, #karten, #flur, #karte/verdeckt und #karte/O23 auf Desktop und iPhone/Android prüfen; anschließend O01–O24 im Buch.
- Cache und Service Worker auf v0.6.62 kontrollieren. Keine automatische Veröffentlichung.

**Gesamtstatus:** Codekorrekturen integriert; Live-/Geräteabnahme ausstehend; sechs START-02-Medien weiterhin blockiert.

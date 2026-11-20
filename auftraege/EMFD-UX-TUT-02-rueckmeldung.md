# EMFD-Rückmeldung · EMFD-UX-TUT-02 (BOOK-01d) · Eingang, freiwillige Einführung, gemeinsame Bedienelemente
Datum: 20.11.2026 · Ergebnis: umgesetzt als Testversion (nicht live) · Commit: siehe PR-Branch `claude/book-01d-tutorial` (Repository neuroways/haus_der_wunder); Register: Branch `claude/book-01d-tutorial` in neuroways/haus-der-wunder
Ausgangsversion: v0.6.71 (CACHE-01, PR #1, noch nicht gemergt) · Zielversion: v0.6.72 · Live unverändert v0.6.69

## Was sich für die Person ändert
- **Erstbesuch:** Die App öffnet die Eingangsszene EXT-C01. Auf dem Smartphone ist die Tür im mittleren Ausschnitt zu sehen, am PC die ganze Illustration fast bildschirmfüllend. Unten steht eine kleine Willkommenskarte: „Du darfst ankommen, ohne dich verändern zu müssen.“ mit „Haus betreten“ und „Bedienung kennenlernen“. Sie lässt sich schließen. Es gibt keine leuchtende Türkontur, keine Schrittzählung und keinen Fortschrittsbalken.
- **Folgebesuch:** Die App geht wie bisher direkt in den Flur. Wer den früheren Einstieg abgeschlossen hat (gespeicherte Werte von v0.6.66 bis v0.6.71), gilt ebenfalls als Folgebesucher.
- **Einführung (freiwillig):** Kleine Hinweise erscheinen direkt in der Szene, höchstens einer zur gleichen Zeit, jeder schließbar. Ablauf:
  - Umschauen (Wischen oder Pfeile, Punkte zeigen L/M/R).
  - Am Rand erscheint der Hinweis „Umdrehen“; gedreht wird nur auf Tippen.
  - Garten, das Prinzip der kleinen Wunder, dann Brücke (O15, Musik) und Gartentor (O09, Karte) in beliebiger Reihenfolge, sobald sie sichtbar sind.
  - Weitere Entdeckungen, Hilfe, „Zum Haus umdrehen“.
  - Licht, Brief und Glocke in beliebiger Reihenfolge, zuletzt „Eintreten“.
  - Die Tür funktioniert in jeder Phase. Ein Abschlussdialog folgt nicht.
- **Umdrehen:** Smartphone L→R, R→L, M→M als weiche Bewegung in Blickrichtung mit Überblendung. Am PC gibt es „Umdrehen“ an beiden Seiten. Bei reduzierter Bewegung wird nur kurz überblendet.
- **Brief:** Der grüne Umschlag öffnet den bisherigen Geschenkbereich (Animation und Originaltexte) als Ebene über der Szene. Zum Geschenkbereich gehört auch die Geschenkkarte. Ihre Rückseite zeigt den QR-Rückkehrlink, und die Karte dreht sich auf Tippen. Nach dem Schließen ist man an derselben Stelle wie vorher. Der Geschenkbereich ist außerdem über die Hilfe und den Geschenk-Hotspot im Flur erreichbar.
- **Glocke (MP-EXT):** Text „Dieses Haus hat seine eigene Musik. Du kannst es mit Musik oder in Stille entdecken.“ Aktionen: Hauptthema abspielen, Mit Musik entdecken, In Stille entdecken, Meine Auswahl merken, Schließen. Musik läuft über die zentrale Engine und startet nur auf Tippen. Beim Betreten startet nichts, auch nicht mit gemerkter Auswahl.
- **Gegenstände:** Brücke und Tor öffnen ein kleines Paneel mit „Karte ansehen“ (bestehende Kartenansicht mit Rückweg in Szene und Ausschnitt), eigenem Musikstück (Play/Pause/Stopp, Zustand als Text) und „Geschichte lesen“ (bestehender Leser).
- **Licht:** Wandlaterne und beide Bodenlaternen lassen sich schalten. Der Zustand bleibt beim Blickwechsel und nach einem Neuladen erhalten. Bis die Lichtmasken von Work fertig sind, ist der Aus-Zustand ein gekennzeichneter Platzhalter.
- **Hilfe oben rechts** in der Szene, dazu Einstellungen und „Alles in dieser Ansicht“ (alle Gegenstände als Liste, auch per Tastatur). Die Hilfe enthält „Einführung erneut starten (führt zum Eingang)“, „Geschenkbrief und Geschenkkarte“ und „Das Haus griffbereit“.
- **Installation** wird nie automatisch angeboten. Man erreicht sie über die Hilfe, im Hilfehinweis der Einführung steht einmal ein leiser Textlink. „Später“ bleibt dauerhaft gespeichert.
- **Starttour:** Die bisherige automatische Starttour im Flur gibt es nicht mehr.

## Abweichungen vom Auftrag (mit Grund)
- **Abhängigkeit BOOK-01b/01c:** BOOK-01d setzt laut Plan 01b (Szenenkomponente) und 01c (Raumwechsel) voraus. Den Kern von 01b habe ich hier mit umgesetzt (`shared/scene.js`), weil der Eingang ihn braucht. 01c ist nicht umgesetzt: Die Tür führt über die Szenenkonfiguration (Ziel H00-C01) per Register-Umleitung in den bisherigen Flur. Sobald H00 als Szene integriert ist, genügt ein Registereintrag.
- **Medien (K-21):** Die Hotspots aus v0.2 sind an den Referenzbildern `references/EXT-C01.jpeg` und `EXT-C02.jpeg` (1536×865) gemessen. Im Medienregister sind als Kandidaten andere Dateien eingetragen (PNG 1671×941, REVIEW). Die liegen nicht im Repository (LFS-Upload ausstehend). Deshalb nutzt die Testversion die **unveränderten Referenzbilder** als Testmedium (`media/rooms/szenen/…-tut02-ref-<sha8>.jpeg`, `freigabe: test`). Das ist keine Produktionsfreigabe. Sie sind über einen Szenen-Override in den App-Feldern eingebunden, sodass der Austausch ohne Codeänderung möglich ist.
- **Neue Texte, die nicht im Auftrag stehen:**
  - das Fortsetzungsangebot nach Neuladen: „Einführung fortsetzen?“ – „Du warst mitten in der Einführung. Du kannst weitermachen oder sie beenden.“
  - die Paneeltitel und Kurztexte („Die Eingangsglocke“, „Dieser Gegenstand hat sein eigenes Musikstück.“, „Zu diesem Gegenstand gehört eine Karte mit einem Gedanken für dich.“)
  - die Beschriftungen „Alles in dieser Ansicht“, „Hilfe und Orientierung“ und „Geschenkbrief und Geschenkkarte“.
  - Bitte in der Planung bestätigen oder ersetzen.
- **Reihenfolge im Geschenkbereich:** Bisher folgten Umschlag, Karte, Musikfrage und Brief aufeinander. Jetzt ist die Reihenfolge Umschlag → Brief → Geschenkkarte, weil die Musikfrage zur Glocke gewandert ist und der Hinweis den Brief als Erklärung des Hauses ankündigt.
- **Gemerkte Musikauswahl „mit Musik“** startet beim Eintritt keine Musik mehr, wie es v0.3 verlangt („keine automatische Musikwiedergabe beim … Betreten“). Bisher startete sie beim Türklick. Die Auswahl wirkt jetzt nur noch als Einstellung.
- **Glockenton:** Es gibt kein Medium dafür, also bleibt die Glocke ohne Ton (kein erfundener Klang).
- **Hotspot-Geometrie:** Die Werte aus v0.2 sind unverändert übernommen und im Browser gegen die Referenz geprüft: Alle Hotspots liegen im Bild und wandern mit. Feinmaße auf echten Geräten stehen noch aus.

## Antworten auf die offenen Fragen
- **Speicherwerte:**
  - Neu ist `emfd.entrance.v1` mit `welcomeDismissed`, `entered` und `tutorial{active,seen,gardenVisited}`.
  - Gelesen werden weiterhin `gift-completed`, `tutorial-completed`, `intro-completed`, `install-dismissed`, `music.entryPreference` und `house.light`. Das Beenden der Einführung setzt `tutorial-completed`/`intro-completed`, damit auch ältere Stände rückwärtskompatibel bleiben. Den Brief setzt es **nicht**.
  - Der Neustart über die Hilfe ändert ausschließlich den Tutorialzustand. Das ist im Browser verglichen: Alle übrigen Schlüssel waren vorher und nachher identisch.
  - Ohne Speicher (privater Modus, verweigert) bleibt die Einführung freiwillig, und die Tür ist erreichbar.
- **Register:**
  - Die Hotspots stehen jetzt in `manifests/scenes.json`. Erzeugt werden sie vom Generator aus der konsolidierten Quelle `manifests/quellen/szenen-hotspots.json`, mit stabilen IDs (`EXT-C01-TUER` …) und konkreten Zielen (Licht-ID, Gerät MP-EXT, Objekt O09/O15, Szene H00-C01).
  - In derselben Quelle stehen die 14 Tutorialtexte und die Glockentexte. Die App übernimmt sie über `tools/build-registry.mjs`.
  - Ein zweites Runtime-Manifest gibt es nicht.
- **Gemeinsame Bedienbibliothek:**
  - Die vorhandene `emfd-ui` ist auf v0.4 erweitert, mit primären und sekundären Textbuttons, Iconbuttons, Bild-Hotspots, Hinweisen, Umschaupfeilen, Positionspunkten, Umdrehen, Chips, Aktionsliste, Paneel, Musiksteuerung und Lichtschalter.
  - Für klassische Skripte gibt es den Einstieg `emfd-ui-kit.js`. Das ES-Modul nutzt dieselben Icons.
  - Die Referenzseite liegt unter `home/emfd-ui/referenz.html`.
- **Offline (CACHE-01):** Die Eingangsbilder gehören zur ersten Offline-Stufe. Die App-Liste ist neu erzeugt, die Offline-Version ist `cache01-v3`.

## Tests
- **npm test:** 365 bestanden, 0 fehlgeschlagen, 1 übersprungen.
- **Neu:** `tests/book-01d-entrance.test.cjs` mit 14 Tests. Sie prüfen:
  - Migration
  - Erst- und Folgebesuch
  - kein Selbststart
  - Hinweisfolge am Eingang, im Garten und am Haus
  - wörtliche Texte aus dem Register
  - Register-Hotspots und Platzhalter
  - Adressen
  - Drehrichtungen
  - Lichter
  - Bedienbibliothek
  - Starttour und Hilfe
  - Musikentscheidung ohne Autoplay
  - Offline-Stufe
- **Ersetzt:** 6 Tests des früheren Geschenkablaufs in `start-adventure.test.cjs` prüfen jetzt den Geschenkbereich als Ebene: Brief, QR-Karte, Rückkehr, Abbruch, reduzierte Bewegung, Wiederaufruf. 7 weitere Tests suchten den früheren Türablauf im Quelltext; sie prüfen jetzt das neue Verhalten.
- **Browser-Testprotokoll:** `auftraege/EMFD-UX-TUT-02-testprotokoll.md`, 60 PASS, 0 FAIL.
- **Nicht geprüft:** echtes iPhone und Android, Screenreader und STRATO.

## Neue offene Punkte / Fragen an die Planung
1. **K-21 Szenenmaster EXT-C01/C02:** Gelten die TUT-02-Referenzen (JPEG 1536×865) oder die Register-Kandidaten (PNG 1671×941, nicht im Repo)? Die Hotspots passen zu den Referenzen. Bei einem Wechsel des Masters müssen sie neu gemessen werden.
2. **Upload der Testversion:** Für eine Prüfung auf dem iPhone braucht es zwei Medien unter `/wunderhaus/media/rooms/szenen/` und die App in einem eigenen Testordner. Ein Paket ist vorbereitet, hochgeladen wird erst nach deiner Freigabe.
3. **Fehlende Medien:** Lichtmasken EXT-Wandlaterne und -Bodenlaternen, Glockenton MP-EXT, finale Szenenbilder, H00-C01 als Ziel der Tür. Musik: `O15-M01.mp3` fehlt auf STRATO, die Brücke meldet deshalb „nicht verfügbar“.
4. **Neue Texte** (siehe Abweichungen) bestätigen.
5. **CACHE-01 (PR #1)** ist die Basis dieser Testversion und muss zuerst gemergt werden.

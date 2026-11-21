# EMFD-Rückmeldung · EMFD-CARD-MUSIC-01 · Karten-Cover-Verwandlung mit Glühwürmchen
Datum: 21.11.2026 · Ergebnis: umgesetzt (Cover außer O20 offen, siehe unten) · Commit: COMMIT auf `claude/card-music-01` · App v0.6.87 (Testversion, Grundlage `claude/maeppchen-02` v0.6.86)

## 1. Geprüfter Bestand (Code, Medien, Zustände)
- **Kartenansicht und Begleitung:** `home/app.js` (Karten-Dock mit „Mitnehmen“).
- **Mäppchen:** `home/maeppchen.js` und `home/maeppchen.css` (Mäppchen v0.2).
  - Zustände: `view.scene` (folder, detail, listen), `view.ff` (hand, flying, perched).
  - Speicher: `emfd.maeppchen.v1`.
- **Musik:** `home/shared/audio.js` (`EMFDAudio`: `select`, `command`, `subscribe`), `home/music-player.js` (der einzige Player, `EMFDMusic`), `home/audio-session.js`.
- **Cover:** `home/media-bridge.js` (`EMFDImages.cover`, nur bei aktuellem Musikkatalog), `home/device-station.js` (`coverFor`: Katalog, Arbeitscover, Kartenvorderseite).
- **Bestand Cover:**
  - Live-`manifest.json` auf STRATO: kein Cover.
  - Repository: nur O04, O06 und O24 (`media/covers/`).
  - Das Player-Gesamtpaket mit 25 Covern ist bisher nicht angekommen.
  - Das einzige Originalcover für O20 ist `02_Originalcover_O20_Das_Windspiel.jpeg` aus dieser Übergabe.
- **Glühwürmchen:** freigegebene Serie v0.2 (`media/maeppchen/gluehwuermchen-v0.2/`), nur eine Figur in drei Zuständen: Papier, Flug, Sitzen.

## Was sich für die Person ändert
- **Ablauf:**
  - Im Hörmoment kommt die Hand mit dem Papierfalter.
  - Nach Berührung fliegt das Glühwürmchen los. Während des Anflugs dreht sich die Karte zu ihrem **Originalcover**.
  - Das Glühwürmchen setzt sich auf den **oberen Coverrahmen** (rechts) und ruht dort mit warmem Halo, ohne Flattern.
- **Cover:**
  - Fast bildschirmfüllend und quadratisch, vollständig, nicht verzerrt (`object-fit: contain`).
  - iPhone 13: 360 px bei 390 px Breite; iPhone SE: 278 von 320 px.
  - Über dem Cover bleibt Platz für die Figur.
- **Musik:**
  - Landung und Bildwechsel starten **keine** Musik. Das Lied beginnt erst mit „Lied abspielen“.
  - Danach gibt es „Pausieren“ und „Weiterhören“ an derselben Stelle.
  - Während das Lied spielt, schimmert der Goldrahmen sehr ruhig (nur Licht, keine Größenänderung). In der Pause dimmt der Halo einmal sanft.
- **„Zurück ins Mäppchen“** (ein Knopf unter dem Cover, mit Mäppchen-Symbol, ohne zweites Glühwürmchen):
  1. Das Lied stoppt **sofort**, auch während des Ladens und in der Pause.
  2. **Dasselbe** Glühwürmchen hebt ab und fliegt mit kleiner Lichtspur zum Mäppchen: auf dem Smartphone zum Mäppchen-Symbol, im Wide-Layout in die Lasche.
  3. Das Cover verwandelt sich zurück in die Karte und sinkt ab.
  4. Das Mäppchen erscheint, der Fokus liegt auf dem Papierfalter. Es gibt keinen Neustart des Lieds.
  - Doppeltes Tippen löst nur einen Rückflug aus.
- **Keine doppelte Zurück-Navigation:** Im Hörmoment zeigt die Kopfzeile kein „Zurück zum Mäppchen“ und kein „Schließen“. Escape führt über denselben Rückweg.
- **Zentraler Abbruch:** Schließen des Mäppchens, „In die Schachtel zurücklegen“ und jeder Adresswechsel (Browser-Zurück, Raumwechsel) beenden den Hörmoment. Das Lied stoppt, es bleibt kein hängendes Audio.
- **Erneute Wahl:** Der Hörmoment beginnt immer im Ausgangszustand: Hand, Karte, kein Cover, kein Schein, kein Audio.
- **iPhone quer:** Steuerung und Knopf stehen neben dem Cover, damit es groß bleibt.
- **Reduzierte Bewegung:** ohne Flug und ohne Schein, direkt Cover mit ruhendem Glühwürmchen; der Rückweg geht sofort.

## Abweichungen vom Auftrag (mit Grund)
1. **Originalcover nur für O20:**
   - O20 ist unverändert eingebunden (`media/covers/O20-cover-original-bf9d76ee.jpeg`, 1254 × 1254, sha256 `bf9d76ee…`, Register `cover.O20`).
   - Weitere Cover werden ohne Code eingebunden: Musikkatalog (aktuell) → Register `cover.<ID>` → bisherige Kette (Arbeitscover, Kartenvorderseite). Die Gerätestation im Musikzimmer nutzt dieselbe Registerstufe, also dasselbe Cover in beiden Ansichten.
   - Ohne Cover zeigt der Hörmoment die Kartenvorderseite vollständig im Quadrat (z. B. O08). Die Anwendung kennt keine fest eingetragene Karte.
2. **Ersetzt Teile von EMFD-MAEPPCHEN-02:**
   - Nach dieser Übergabe startet das Lied nicht mehr automatisch nach der Landung (vorher Punkt 3.1).
   - Beim Verlassen des Hörmoments läuft es nicht weiter (vorher 3.2); das verlangt Abschnitt 6, der zentrale Audio-Stopp bei „anderer Navigation“.
   - „Noch behalten“ in der Rückgabe-Rückfrage hält die Wiedergabe daher nicht mehr: Wer aus dem Hörmoment zurücklegen will, beendet ihn zuerst.
   - Die Musikzeile in Mäppchen und Details bleibt für andere Musik, z. B. das Radio.
3. **Platzhaltertexte:** Die Meldung „Platte verloren“ erscheint nicht unter dem Cover. Fehlt das Lied, steht dort neutral: „Das Lied ist gerade nicht erreichbar. Das Cover bleibt hier.“
4. **Glühwürmchen-Atem:** nicht umgesetzt (laut Auftrag optional). Die Figur ruht mit gleichmäßigem Halo.

## Antworten auf die offenen Fragen
- **Referenzen nach Rolle:**
  - 01 (Istzustand): Grundlage für Kopfzeile und Hintergrund, nicht nachgebaut.
  - 02: als Produktionsdatei unverändert übernommen.
  - 03 und 04: Größen- und Layoutvorbild (Cover groß, Figur am oberen Rahmen, ein Knopf darunter).
  - 05: nur Flugrichtung; die Zweitfigur ist nicht übernommen.
  - Die Safari-Leisten der Mockups sind Browserchrome und nicht nachgebaut.
- **Geänderte Dateien** (Patch = Commit auf `claude/card-music-01`):

| Datei | Änderung |
|---|---|
| `home/maeppchen.js` | Hörmoment neu: Cover-Box und Verwandlung, Sitzpose am Coverrand, kein Autoplay, `returnToFolder`, `stopMine`, `endListen`, `coverOf`, Kopfzeile ohne zweiten Rückweg, Querformat, Adresswechsel |
| `home/maeppchen.css` | Layout Cover, Knopf und Steuerung (hoch, quer, Wide), Drehung, Gold-Schein, Lichtspur, reduzierte Bewegung |
| `home/device-station.js` | Registerstufe `cover.<ID>` in `coverFor` |
| `home/data/registry-app.json`, `home/data/registry.js`, `home/shared/registry.js` | Medium `cover.O20` (Notfallbestand neu erzeugt) |
| `media/covers/O20-cover-original-bf9d76ee.jpeg` | Originalcover O20, unverändert |
| `home/tests/maeppchen.test.cjs` | Tests für Hörmoment, Rückweg und Cover |
| Versionsstellen | `index.html`, `package.json`, `manifest.webmanifest`, `deployment-layout.json`, `app.js` (`start-gate.js?v`), `offline-policy.js` `cache01-v18`, `image-profiles.js`, `offline-precache.js` |
| Doku | `docs/CODEKARTE.md` 4e, `auftraege/EMFD-CARD-MUSIC-01*.md` |

## Tests
- **`npm test`:** 424 bestanden, 0 fehlgeschlagen, 1 übersprungen.
  - Neu bzw. ersetzt in `tests/maeppchen.test.cjs`: Hörmoment (kein Play-Trigger bei der Landung, nur Licht-Puls, quadratisch/contain), Rückweg (Stopp vor Flug, idempotent, zentraler Abbruch, eine Figur) und Cover (Prüfsumme O20, Zuordnung über die ID, Gerätestation, offline).
- `python3 tools/media_check.py`: keine neuen Fehler. `bash tests/run_tests.sh`: 0 Fehler.
- **Browser-Testbericht: 28 bestanden, 0 fehlgeschlagen, 2 nicht getestet.**
  - Umgebung: Chromium, iPhone 13 (390 × 664), iPhone SE (320 × 568), iPhone quer (844 × 390), Desktop 1440 × 900.
  - Medien: echte Mäppchen- und Glühwürmchen-Medien, Originalcover O20, lokale Test-MP3.

| Kriterium (Abschnitt 7) | Ist | Ergebnis |
|---|---|---|
| O20 unverändertes Originalcover vollständig | Datei 1254², angezeigt 370 × 370 contain, ganz im Bild | PASS |
| Cover fast bildschirmfüllend, unverzerrt, Knopf sichtbar | iPhone 13 360/390 px, SE 278/320, quer 257 px hoch, Desktop 551 px; Knopf 73 px hoch | PASS (4 Geräte) |
| Genau ein Glühwürmchen, auf dem Rand, ruhend, Halo | 1 sichtbare Figur, Aufsetzpunkt auf der Oberkante (82 % Breite), keine laufende Animation | PASS (4 Geräte) |
| Zuordnung über die Karten-ID, keine O20-Hardcodierung | O08 zeigt eigenes Bild und eigenes Lied | PASS |
| Lied nur nach bewusster Play-Aktion | nach Landung `silent`, 0 `play()`-Aufrufe; nach „Lied abspielen“ `playing` | PASS (4 Geräte) |
| Zurück stoppt sofort: beim Spielen / in der Pause / beim Laden | `stopped` nach 39 ms / `paused` → `stopped` / `starting` → `stopped`, kein späterer Start | PASS |
| Dieselbe Figur fliegt zurück, Karte abgelegt, Mäppchen erscheint | Mitte: nur Flugfigur sichtbar; Ende: Mäppchen, Fokus Papierfalter | PASS |
| Danach kein Audio, kein Rest-Puls, keine Figur, kein falscher Status; Doppel-Tap | alles aus, keine Musikzeile, ein Rückweg | PASS |
| Erneute Wahl im Ausgangszustand | Hand, Karte, ohne Cover und Audio | PASS |
| Browser-Zurück / Adresswechsel | Hörmoment beendet, Lied `stopped` | PASS |
| Reduzierte Bewegung und Tastatur | ohne Flug direkt Zielzustand, kein Puls; Enter: Papierfalter → Lied abspielen → Zurück ins Mäppchen | PASS |
| Keine JS-Fehler | – | PASS |
| Safari/iOS-PWA (WebKit, dynamische Leisten, echte Safe Area) | nur Chromium im Container; `env(safe-area-inset-*)` und `dvh` sind berücksichtigt | **nicht getestet** |
| Screenreader (VoiceOver) | Beschriftungen geprüft, VoiceOver selbst nicht | **nicht getestet** |

- **Regression:** Mäppchen-Details, Schreiben, Export und Zurücklegen sind durch die bestehenden Unit-Tests abgedeckt; deren Code habe ich nicht geändert. Die Browser-Abnahme von Mäppchen v0.2 erwartet beim Hörmoment noch den alten Ablauf (Lied nach der Landung) und ist durch diesen Auftrag abgelöst.

## Neue offene Punkte / Fragen an die Planung
1. **Die übrigen 24 Originalcover** (O01–O24 ohne O20, dazu T03) fehlen weiterhin. Bitte das Player-Gesamtpaket liefern oder die Cover in den Musikkatalog übernehmen. Ein Registereintrag `cover.<ID>` je Datei genügt.
2. **Upload für die Testversion:** `media/covers/O20-cover-original-bf9d76ee.jpeg` nach STRATO `/wunderhaus/media/covers/` (derzeit 404). Liegt im Medien-ZIP des Testpakets.
3. **Echte iPhone-Prüfung:** Safari und Home-Bildschirm-App mit Notch, Leisten, Querformat, außerdem VoiceOver.
4. **Bitte bestätigen:** Musik endet beim Verlassen des Hörmoments, auch Richtung Gedankenbuch (Abschnitt 6). Das hebt „Lied läuft beim Lesen/Schreiben weiter“ aus Mäppchen v0.2 auf.

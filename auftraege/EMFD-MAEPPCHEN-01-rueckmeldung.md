# EMFD-Rückmeldung · EMFD-MAEPPCHEN-01 · Mäppchen der Begleiterkarte
Datum: 20.11.2026 · Ergebnis: umgesetzt (Entwicklungsstand, nicht veröffentlicht) · Commit: 774eec9 auf `claude/maeppchen-01` (App v0.6.79, Grundlage: `claude/kue-dev-01` v0.6.78)

## Was sich für die Person ändert
- **Mitnehmen:** Nach dem Aufdecken einer gezogenen Karte steht im Karten-Dock „Mitnehmen“. Danach öffnet sich das Mäppchen: Der Riemen gleitet aus der Schlaufe, die Klappe öffnet sich an der mittleren Falz, und die Inhalte gleiten hinter ihren Fachkanten hervor. Es gibt genau eine Begleitung, ohne Ablaufdatum.
- **Erreichbar aus jedem Raum:**
  - In Szenen (Eingang, Halle, Küche): „Dein Moment“ → „Begleiter“.
  - In Ansichten ohne Szene (Innenhof, Teezimmer, Karten, Musik, Kartenseite): ein fester runder „Begleiter“-Knopf unten rechts.
  - Das Mäppchen liegt als Ebene über der Ansicht. Beim Schließen bleibt man an derselben Stelle, auch im gleichen Bildausschnitt.
- **Inhalt (über die aktive Karten-ID):**
  - die Karte
  - Impuls- und Fragekärtchen mit den Originaltexten, einzeln herausnehmbar
  - das Gedankenbuch: Smartphone mit einer Seite und der Frage darüber, die beim Schreiben stehen bleibt; Wide als Doppelseite mit der Frage links
  - das Geschichtenheft: die Hausgeschichte der Karte, mit Link zur „Geschichte der Melodie“
  - der Papierfalter in der Lasche
- **Falter und Lied:**
  - Erstes Antippen: Der Falter kommt matt auf die Hand, ohne Ton.
  - Zweites Antippen: Licht und Verwandlung. Beim Abheben startet das Kartenlied über den bestehenden Player, danach erscheint das quadratische Cover.
  - Antippen des fliegenden Falters oder eine Pause im globalen Player: Das Cover verblasst, der Falter landet und kehrt als Papier in die Lasche zurück.
  - Bei reduzierter Bewegung wird nur überblendet.
- **Entwurf:** Er bleibt beim Schließen und nach einem Neustart erhalten, nur auf diesem Gerät.
- **Sichern:** Karte als PNG (Motiv, Name, Impuls), Gedankenblatt als PDF, Geschichtenheft als PDF und eine Mäppchen-Sicherung (JSON), die sich wieder laden lässt.
  - Einen Ablageordner gibt es nur, wo der Browser Ordnerzugriff unterstützt.
  - Auf iPhone und iPad laufen Export und Import über „Teilen“ bzw. die Dateiauswahl.
- **In die Schachtel zurücklegen:**
  - Wenn Text da ist, werden Gedankenblatt-PDF und Sicherung freiwillig angeboten.
  - Nach der Bestätigung sind Begleitung und Entwurf gelöscht.
  - Wird dieselbe Karte später wieder mitgenommen, beginnt ein leerer Entwurf.
- **Dabei behoben:** Wer eine Szene (Halle, Küche) in eine Ansicht ohne Szene verließ, behielt den Szenenmodus. Dadurch waren dort Elemente unsichtbar.

## Abweichungen vom Auftrag (mit Grund)
1. **Ziehen bleibt frei** (Entscheidung der Nutzerin vom 20.11.). Der Zieh-Einstieg führt auch bei aktiver Begleitung zum Ziehen und nicht ins Mäppchen. Wer eine andere Karte mitnimmt, wird gefragt, ob die bisherige zurückgelegt wird; vorher sind Sichern oder „behalten“ möglich.
2. **Entwürfe lokal gespeichert** (Entscheidung der Nutzerin). Das ergänzt W6 und die Regel „keine dauerhafte Speicherung von Notizen“; eingetragen in `docs/ENTSCHEIDUNGEN.md` und `CLAUDE.md`. Das freie Gedankenblatt bleibt flüchtig.
3. **Feste Navigation:**
   - Der Build hat in Ansichten ohne Szene keine sichtbare feste Leiste: Die alte Kopfzeile ist ausgeblendet, eine untere Leiste gibt es nicht.
   - Deshalb gibt es dort einen runden „Begleiter“-Knopf unten rechts, in Szenen gilt „Dein Moment“.
   - Die endgültige Form gehört zu BOOK-01h. Im Teezimmer liegt der Knopf am Listenende knapp an „Tageskarte ziehen“.
4. **Geschichtenheft:** Der Inhalt ist die Hausgeschichte der Karte (`houseStory`). Die Kompositionsgeschichte öffnet der vorhandene Buchleser. Der Auftrag legt den Inhalt nicht genau fest.
5. **Wide-Hintergründe:** Der Tisch (00) wird zugeschnitten, der Himmel (22) wird während des Flugs eingeblendet, wie für den Test erlaubt.
6. **Kleinere Ergänzungen:**
   - Symbol `download` in der Bedienbibliothek.
   - `EMFDThoughtPaperTools` stellt PDF-Erzeugung, Teilen und Zeilenumbruch für das Mäppchen bereit; das Gedankenblatt selbst ist unverändert.
   - Bei zwei bestehenden Tests ist die Erwartung angepasst: Begleiter öffnet jetzt das Mäppchen; neue Version von `thought-paper.js`.

## Antworten auf die offenen Fragen
- **Ziehvorgang:** `EMFDCardDraw` (verdeckt → aufdecken) bleibt unverändert. „Mitnehmen“ hängt am Karten-Dock (`cardDock`), das beim Aufdecken erscheint.
- **Karten- und Musikkatalog:**
  - Bild über `EMFDImages.card`, Texte aus `CARDS`.
  - Cover über `EMFDImages.cover`, also aus dem Katalog. Fehlt es dort, nimmt das Mäppchen das Playlist-Vorschaubild der Kartenvorderseite; laut `playlist-catalog.json` ist das bei O08 ohnehin das Cover (`existing_card_front`).
  - Lied über `EMFDAudio.select(<Karte>,{explicit:true})`; dabei wird nur ein Player verwendet.
- **Generische Zuordnung:** Alle 24 Karten liefern Karte, Impuls, Frage und Geschichte. Im Test wurde O03 im Mäppchen geöffnet. `EMFDMaeppchen.missingFor(id)` meldet fehlende Zuordnungen.

## Tests
- **`npm test`:** 397 bestanden, 0 fehlgeschlagen, 1 übersprungen. Neu ist `tests/maeppchen.test.cjs` mit 8 Verhaltenstests:
  - Zustand und frischer Entwurf
  - Sicherung hin und zurück
  - Zuordnung für 24 Karten
  - 26 Register-Medien, offline aufgenommen
  - Falter-Anker
  - Ablauf von Falter und Lied
  - Einstiege
  - Zurücklegen
- **Browser-Abnahme** (Chromium, iPhone 13 und 1366×900, echtes O08-Lied lokal von STRATO): 18 von 18 bestanden.
  - M-01: „Mitnehmen“ nach dem Aufdecken.
  - M-02: genau eine Begleitung.
  - M-03: aus der Küche über „Dein Moment“, Rückkehr an dieselbe Stelle (`#raum/KUE/C01`, Ausschnitt L).
  - M-04: Begleiter-Knopf in `#musik`.
  - M-05: Originaltexte.
  - M-06: Frage beim Schreiben sichtbar, auch nach Scrollen.
  - M-07: Neustart mit Entwurf.
  - M-08: Hand ohne Ton, Flug mit Lied O08 und quadratischem Cover.
  - M-09: Smartphone ↔ Wide während des Flugs; Entwurf, offene Buchseite und Wiedergabe bleiben.
  - M-10: Pause → Landung in der Lasche.
  - M-11: PNG, zwei PDFs und Sicherung.
  - M-12: Import der Sicherung.
  - M-13: Zurücklegen mit Exportangebot.
  - M-14: erneut ziehen, gleiche Karte mit frischem Entwurf.
  - M-15: Wechsel fragt nach.
  - M-16: generisch (O03).
  - M-17: reduzierte Bewegung.
  - Keine JS-Fehler.
- **Regression:**
  - Eingang/Einführung: 60/60.
  - Küche und Halle: siehe Nachtrag unten.
- **`tools/media_check.py`:** unverändert 32 Fehler (alte Kopien in `home/assets/`). Die 26 neuen Dateien erzeugen nur den Hinweis „neuer Medientyp“.

## Fehlende Medienpfade
| ID | fehlender Pfad | Wirkung |
|---|---|---|
| `card.O08.cover` | `media/covers/O08-cover-r1-*.png` (Katalog-Cover; im Bestand nur O04, O06, O24) | Statt des Covers erscheint das Playlist-Vorschaubild `media/optimized/playlist/O08-160-v1-86b01bbb7e.webp` (Kartenvorderseite, laut Katalog `existing_card_front`). |
| `card.O01…O24.cover` außer O04/O06/O24 | `media/covers/<Karte>-cover-r1-*.png` | wie oben |
| Wide-Hintergründe | im Medienpaket nicht enthalten (laut Auftrag später) | Tisch und Himmel aus dem Hochformat zugeschnitten |

Die Mäppchen-Grafiken selbst sind vollständig (26 von 26).

## Neue offene Punkte / Fragen an die Planung
1. Freigabe der Mäppchen-Grafiken; sie stehen auf `freigabe:test`. Dazu die zwei Wide-Hintergründe.
2. Freigegebene Kartencover (Musik) für die übrigen 21 Karten.
3. Form der festen Navigation (BOOK-01h) statt des runden Begleiter-Knopfs.
4. Soll das Geschichtenheft zusätzlich die Kompositionsgeschichte enthalten (als zweites Kapitel im PDF)?
5. Soll ein fliegender Falter beim Schließen des Mäppchens weiterfliegen? Bisher läuft die Musik weiter (W1), und beim nächsten Öffnen liegt der Falter wieder in der Lasche.

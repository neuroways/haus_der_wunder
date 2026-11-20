# EMFD-Rückmeldung · EMFD-H00-DIREKT-01 · H00 Direkteintritt und Bildwechsel
Datum: 20.11.2026 · Ergebnis: umgesetzt (Bild: angehängte Fassung statt der beschriebenen JPEG, siehe unten) · Commit: 8e13b5a auf `claude/h00-direkt` (Grundlage `claude/kue-dev-01` b93ef4e, geprüft als HEAD) · App v0.6.80, Testversion

## Was sich für die Person ändert
- **Direkt eintreten:** Wer beim ersten Besuch auf der Willkommenskarte „Haus betreten“ wählt, steht sofort in der Halle H00-C01, mobil im Ausschnitt M. Es erscheinen keine Begrüßung, kein Musik- und kein „Dein Moment“-Hinweis und keine Hervorhebungen. Türen, Hotspots, Musik, Hilfe und „Dein Moment“ sind sofort bedienbar. Das gilt auch beim Gang durch die Tür, wenn keine Einführung läuft.
- Das bleibt so nach Zurück, Umdrehen, Raumwechsel (Küche, Teezimmer), Rückkehr und Reload. Auch wenn andere Dialoge geschlossen werden (Musik, „Dein Moment“, Hilfe), rücken keine Hinweise nach.
- **Hilfe → „Hinweise der Halle erneut zeigen“** öffnet die drei Hinweise bewusst nacheinander; danach ist es wieder ruhig.
- Wer die freiwillige Einführung macht und durch die Tür eintritt, bekommt die Hallenhinweise wie bisher.
- **Neues Bild H00-C01:** Nordblick, links die Küche mit Radio, in der Mitte der Innenhof mit Windspiel, rechts das Teezimmer. H00-C02 ist unverändert.

## Abweichungen vom Auftrag (mit Grund)
1. **Bilddatei:** Die beschriebene JPEG-Fassung `D0009185-576A-41FF-B222-BD5CC32D5624.jpeg` (1536 × 864, SHA256 `496233b6…`) ist nicht angekommen. Angehängt war dasselbe Motiv als **PNG 1672 × 941**, SHA256 `0cd60aa446bf23184e16661987c30b5993b398123c93bd8f9cefddf27662fbae`.
   - Diese Datei ist unverändert eingebunden: `media/rooms/szenen/H00-C01-h00-v2-0cd60aa4.png`, Medien-ID `scene.H00-C01.h00-v2`, `freigabe:test`.
   - Das Seitenverhältnis ist identisch (16:9), deshalb gelten die normierten Hotspots unverändert.
   - Kommt die JPEG nach, genügt ein Registereintrag, ohne Code.
2. **Beschriftung:** Auf der Willkommenskarte heißt die Aktion weiterhin „Haus betreten“; das ist der „Direkt eintreten“-Weg des Auftrags. Soll die Beschriftung „Direkt eintreten“ lauten?

## Antworten auf die offenen Fragen
- **Eintrittsmodus:** `entrance.js` bestimmt ihn vor jeder Zustandsänderung (`entryModeFor`), allein aus Aktion und laufender Einführung:
  - „Haus betreten“ auf der Willkommenskarte → `direct`
  - Tür ohne laufende Einführung → `direct`
  - Tür oder „Haus betreten“ während der Einführung → `guided`
  - Musikpräferenz und alte Completion-Flags spielen keine Rolle.
- **Weitergabe:** Der Modus geht vor dem Routenwechsel an `EMFDHall.setEntryMode()` und wird im vorhandenen Zustand `emfd.hall.v1` als `skipHints` gespeichert. Ein Eintritt aus der Einführung setzt ihn zurück.
- **Zentrale Unterdrückung:** Sie sitzt in `showNext()` von `hall.js`. Das betrifft alle automatischen Aufrufe: Eintritt, nach dem Schließen eines Hinweises oder Dialogs, nach dem Abschied.
- **Ausdrücklicher Pfad:** Die Hilfeaktion `resetHints()` setzt `explicitHints` und zeigt die Kette trotzdem.
- **Hotspots am neuen Bild:** Alle 8 bestehenden C01-Hotspots liegen richtig (Küche, Hof, Teezimmer, Treppe, Decken-, Wand-, Tischlampe, Bodenlaterne). Die angeschnittene Laterne rechts bekommt keinen Hotspot, O08 bleibt in C02. Lichter laufen über die gekennzeichnete Ersatzdarstellung.

## Tests
- `npm test`: 390 bestanden, 0 fehlgeschlagen, 1 übersprungen. Neu: Verhaltenstest Eintrittsmodus und zentrale Unterdrückung (`h00-hall.test.cjs`). Angepasst: `normalize` kennt `skipHints`.
- Browser-Abnahme auf iPhone 13 und PC 1440 × 900: 13/13 bestanden.
  - D-01: frischer Besuch → Haus betreten → sofort interaktiv, ohne Hinweise
  - D-02: Zurück, Umdrehen, Küche, Teezimmer, Rückkehr, Reload
  - D-03: Dialoge schließen
  - D-04: Hilfe → Hinweise erneut (Begrüßung → Musik → Dein Moment, danach ruhig, auch nach Reload)
  - D-05: neues Bild mobil L/M/R und Wide; C02 unverändert; kein O08 in C01
  - D-06: Regression – Tutorialpfad zeigt die Hinweise; Licht und Musik bleiben
  - keine JS-Fehler

## Neue offene Punkte / Fragen an die Planung
1. Bitte die JPEG-Fassung (SHA `496233b6…`) nachreichen, falls sie die gültige Datei ist; sonst gilt die PNG als Testmedium.
2. Lichtebenen und Aus-Basis von Work auf die neue C01-Fassung anpassen.
3. Beschriftung „Haus betreten“ oder „Direkt eintreten“?

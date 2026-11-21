Bitte implementiere EMFD-CARD-MUSIC-01 für „Ein Moment für dich · Das Haus der kleinen Wunder“.

Lies zuerst 00_CLAUDE_START_HIER.md im beigefügten ZIP und verwende die fünf Bildreferenzen entsprechend ihrer beschriebenen Rollen.

Prüfe die bestehende Kartenansicht, Musikengine und Mäppchen-Navigation. Setze die Coververwandlung, das einzelne ruhende Glühwürmchen, das dezente Leuchten und den Rückflug ins Mäppchen um.

Beim Zurücklegen muss die Musik sofort stoppen. Verwende das vorhandene Originalcover und erhalte alle bestehenden Funktionen.

Prüfe die responsive Darstellung insbesondere auf dem iPhone. Liefere die geänderten Dateien und einen Testbericht. Keine Veröffentlichung ohne Freigabe.

---
Beigefügt: EMFD-CARD-MUSIC-01_Claude_Uebergabepaket.zip. Inhalt von 00_CLAUDE_START_HIER.md (unverändert):

# EMFD-CARD-MUSIC-01 · Karten-Cover-Verwandlung mit Glühwürmchen

**Projekt:** Ein Moment für dich · Das Haus der kleinen Wunder  
**Übergabe:** 21.11.2026  
**Adressat:** Claude / Claude Code  
**Status:** Verbindliche Nutzerentscheidung für die gewünschte UX; **noch keine Codeintegration, kein technischer Test und keine Live-Freigabe**.

## 1. Ziel und verbindliche Interaktion

In der Begleiterkarten-/Mäppchenansicht wird das zur Karte gehörige **originale musikalische Cover** gezeigt, sobald das Glühwürmchen gelandet ist. Das Cover erscheint **fast bildschirmfüllend**, ohne es zu verzerren, und mit ruhigem, leichtem Pulsieren. Das Glühwürmchen setzt sich sichtbar und gut erkennbar auf **den Rand des Covers**, ruht dort und leuchtet dezent weiter. Unterhalb des Covers befindet sich **ein eindeutig beschrifteter Rücklege-Button: „Zurück ins Mäppchen“**.

Bei Betätigung dieses Buttons gilt **sofort: Audio stoppen**. Das *eine* Glühwürmchen verlässt danach den Coverrand, fliegt mit einer kleinen, zurückhaltenden Lichtspur **zurück zum Mäppchen**, während sich das Cover zurück in die Karte verwandelt und im Mäppchen abgelegt wird. Danach erscheint die Mäppchenansicht. Kein Auto-Restart des Lieds.

**Kritische Korrektur der letzten Visualisierung:** Das jüngste Mockup zeigt scheinbar **zwei Glühwürmchen** (eins am Cover und ein weiteres beim Button). Es gibt in der wirklichen Anwendung **nur eine Figur**, die ihre Position animiert wechselt. Eine zusätzliche Glühwürmchen-Ikone am Button darf nicht als zweite eigenständige Figur erscheinen. Der Button braucht nur ein verständliches Mäppchen-/Rücklege-Symbol.

## 2. Quelle, Referenzen und Asset-Prioritäten

| Datei im ZIP | Rolle | Verbindlichkeit |
| --- | --- | --- |
| `referenzen/01_Istzustand_iPhone.jpeg` | Bestehender mobiler Bildschirm, Header-/Hintergrundsprache und ehemalige kleine Karte | Referenz für vorhandene App, kein Ziel-Layout |
| `referenzen/02_Originalcover_O20_Das_Windspiel.jpeg` | **Original-Cover O20 „Das Windspiel“**, inklusive Text, Goldrahmen, Objektidentität | **Authoritatives Artwork: unverändert wiederverwenden**, nicht aus Mockups rekonstruieren |
| `referenzen/03_Mockup_Cover_gross_Gluehwuermchen.png` | Große Coverfläche, atmosphärisches Leuchten, Glühwürmchen am Coverrand | Größen-/Stimmungsreferenz, keine Produktionsgrafik |
| `referenzen/04_Mockup_Cover_und_Ruecklegebutton.png` | Cover, lesbarer einzelner Rücklege-Button, vertikale Bildhierarchie | Layoutreferenz; zeigt bereits eine Figur am Cover |
| `referenzen/05_Mockup_Rueckflug_Illustration.png` | Glühwürmchen und Mäppchen als erzählerische Verbindung | **Nur Referenz für Flugbewegung**: Zweitfigur im Mockup nicht übernehmen |

Falls das Projekt bereits eine freigegebene **Glühwürmchen-Serie** als transparente Sprites/Assets besitzt, ist diese vorrangig zu nutzen. Figurenidentität aus den freigegebenen Bildern bewahren. Keine neue, abweichende Figur erzeugen.

Das Original-Cover bleibt exakt quadratisch (`object-fit: contain`, kein Stretching, kein Beschneiden von Text, Goldrahmen, „FREUDE“ und „O20“). Alle 25 vorhandenen musikalischen Cover (24 Orakelkarten + Main Theme) sollen über bestehende Zuordnungen unterstützt werden; O20 dient als Abnahmetest.

## 3. Zustand und Ablauf

```text
MÄPPCHEN / KARTE
  └─ [bereits vorhandene Karten-/Glühwürmchen-Interaktion]
        → GLÜHWÜRMCHEN LANDET AM COVERRAND
        → KARTENBILD WECHSELT IN ZUGEORDNETES ORIGINALCOVER
        → COVER BEREIT (fast bildschirmfüllend, dezentes Leuchten)
              ↔ MUSIK SPIELT / PAUSIERT (nur nach Nutzeraktion)
              └─ [Zurück ins Mäppchen]
                    1. Audio sofort stoppen und Wiedergabestatus zurücksetzen
                    2. Glühwürmchen vom Rand abheben lassen, zur Mappe fliegen
                    3. Cover sanft zurück in Karte verwandeln
                    4. Karte ins Mäppchen legen
                    5. Mäppchenansicht darstellen, Audio bleibt aus
```

**Keine selbstständige Musikwiedergabe:** Bildwechsel und Landung sind **kein Play-Trigger**. Bereits vorhandene bewusste Play-/Pause-Aktionen und Audiosteuerungen bleiben erreichbar. Wenn der Player noch nicht startet oder die Datei fehlt, das Cover dennoch korrekt anzeigen; echte Fehlerbehandlung getrennt davon implementieren. Alte Platzhaltermeldungen („Platte verloren“) nicht einfach unter ein vorhandenes Cover setzen.

Bei erneuter Kartenwahl startet die Animation aus dem definierten Ausgangszustand, nicht mit zurückgebliebenem Glow/Audio. Doppel-Taps auf „Zurück“ sperren oder idempotent behandeln, damit keine doppelten Flugbahnen oder konkurrierenden Navigationen entstehen.

## 4. Layout

- **Smartphone hoch:** Original-Cover im nutzbaren Contentbereich maximal groß: fast gesamte **verfügbare Breite**; dabei Platz für oberen App-Kontext, Button und untere Safe Area. Stets quadratisch und vollständig sichtbar.
- **Rücklegeaktion direkt unterhalb** des Coverrahmens, mit ausreichendem Abstand und gut tastbarer Fläche (mindestens 44 × 44 CSS-px; vorzugsweise größer).
- **Keine doppelte Zurück-Navigation:** Doppelte große „Zurück zum Mäppchen“-Schaltfläche im Header vermeiden. Bereits vorhandene generelle App-Navigation darf die Rücklegelogik nicht umgehen; Zustands-/Audio-Cleanup ist zentral.
- **iPhone Safari/PWA:** `env(safe-area-inset-*)`, dynamische Browserleisten, kleine Displayhöhen und `dvh` beachten. Die Safari-Leiste in Mockups ist **Browserchrome**, darf nicht in die App nachgebaut werden.
- **Tablet/Desktop und Querformat:** Cover weiter klar im Vordergrund, angemessen begrenzte Maximalgröße; keine Überlagerung von Controls oder Abschneiden des Covers.
- Layout, Button und Glühwürmchen als **separate DOM-/Animationsebenen**; niemals komplette Mockup-Screens als Hintergrund implementieren.

## 5. Bewegungs- und Lichtregeln

- **Cover:** sehr kleiner, langsamer optischer Pulse (z. B. Helligkeit/Gold-Glow, keine auffällige Skalierung). Im Zustand „Audio spielt“ leicht sichtbar, bei Pause optional ruhig. Keine ständig wechselnde Größenänderung, keine heftigen Lichtpartikel.
- **Glühwürmchen bei Landung:** kurze gezielte Flugbewegung, setzt sich **auf den Coverrahmen**. Gut erkennbar, mit einem leisen warmen Halo.
- **Glühwürmchen im Ruhezustand:** bleibt sitzen; kein permanentes Schweben, Flattern oder Dauerschlagen der Flügel. Allenfalls subtiler Lichtatem, getrennt von Audiofunktionen.
- **Glühwürmchen bei Rückgabe:** ein gerichteter Rückflug mit sanfter Spur. Nach der Rückkehr ist es nicht mehr am Cover sichtbar.
- **Barrierearmut:** `prefers-reduced-motion` respektieren; dann ohne Flug oder Pulse unmittelbar und verständlich in den Zielzustand wechseln. Übergänge dürfen keine Klicks blockieren oder zum Navigationsverlust führen.

## 6. Integrations- und Architekturvorgaben

- Vor Änderungen: **aktuellste tatsächlich bereitgestellte Codebasis und Medienzuordnungen prüfen**. Versionsnummer und Pfade nicht aus der Übergabe erraten.
- Bestehenden zentralen Musikplayer, gespeicherte Coverzuordnung, Begleiterkarte, Mäppchen und Buch/Funktionsnavigation **weiterverwenden**, nicht durch einen zweiten Player ersetzen.
- Ein zentraler Audio-Stop für „Zurück ins Mäppchen“ und für Abbruch/Unmount/andere Navigation; keine hängenden Audioinstanzen.
- Originalcover und Glühwürmchen als eigenständige Medien verwenden; kein Text in ein neu generiertes Cover umsetzen.
- Änderungen isoliert als Patch/Diff dokumentieren. **Keine Änderungen am Live-System ohne separate Freigabe.**

## 7. Abnahmekriterien (als Tests durchzuführen)

- [ ] O20 zeigt das **unveränderte Originalcover** mit „Das Windspiel“, „Freude“ und „O20“ vollständig.
- [ ] Cover ist auf dem iPhone beinahe bildschirmfüllend und nicht verzerrt; Button bleibt sichtbar.
- [ ] **Genau ein** Glühwürmchen landet auf dem Cover, bleibt dort **ruhend** und leuchtet dezent.
- [ ] Die Originalcover-Zuordnung funktioniert für alle vorhandenen Karten; keine feste O20-Hardcodierung.
- [ ] Der zugehörige Song beginnt **nur nach einer bewussten Play-Aktion**.
- [ ] Betätigung von „Zurück ins Mäppchen“ stoppt Audio **sofort** und zuverlässig, auch während Lade-/Pausezuständen.
- [ ] **Dasselbe** Glühwürmchen fliegt zurück; Karte/Cover wird abgelegt; Mäppchen erscheint.
- [ ] Nach Rückkehr kein Audio, kein Rest-Puls, kein zweites Glühwürmchen, kein falscher Weiter-Status.
- [ ] Reduzierte Bewegung, Bedienung per Tastatur/Screenreader, doppelte Eingabe, Browser-Zurück und Safari-PWA geprüft.
- [ ] Kein früheres Karten-, Musik-, Tagebuch- oder Buchverhalten unbeabsichtigt beschädigt.

## 8. Erbetenes Ergebnis von Claude

1. Auflistung der analysierten aktuellen Code-/Assetdateien und vorhandener Zustandsverwaltung.
2. Implementierung als gezielte Änderungen an den bestehenden Komponenten, **ohne Live-Deployment**.
3. Kurzer Testbericht mit Ist/Soll, Gerät/Breite, Audiofällen und Animationen, inklusive offener Punkte.
4. Übergabe des Patches bzw. der geänderten Dateien an den zentralen Integrationsprozess.

**Wichtig:** Visualisierungen in diesem Paket sind stilistische Mockups. Sie belegen keine echte PWA-Funktion und ersetzen weder das originale Cover noch ein freigegebenes Glühwürmchen-Sprite.

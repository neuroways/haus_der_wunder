# EMFD-UI-ARCH-01 – Integrations- und Abnahmebericht

Projekt: Haus der kleinen Wunder  
Version: v0.6.64  
Datum: 05.11.2026  
Ausgangsstand: vollständiges home/-ZIP v0.6.63  
Freigabestatus: **nicht veröffentlicht, reale Endgeräteabnahme offen**.

## 1. Implementierte Änderungen

| Thema | Verantwortliche Dateien | Änderung |
|---|---|---|
| UI-Typografie | `design-system-v0.6.64.css`, `index.html` | Einheitliche Systemschrift für Bedienelemente, Überschriften und Navigation; reduziert wechselnde Schriftgrößen. Für die erzählerischen Inhalte bleibt die Serifenschrift erhalten. |
| Einheitliche Buttons | `design-system-v0.6.64.css` | 48px Mindesthöhe, 16px Beschriftung, gemeinsame Radien/Abstände. Vorhandene goldene Rahmen und Dekoration bleiben. |
| Fünf Lesestufen | `reading-preferences.js`, `book-reading.js`, `design-system-v0.6.64.css` | 16 / 18 / 20 / 23 / 26px, bestehender localStorage-Schlüssel bleibt erhalten; Größenvoreinstellung vor CSS-Zeichnung. |
| Dynamische Verknüpfung | `feature-registry.js`, `app.js`, `emfd-ui-runtime.js`, `teezimmer.js` | Zentrales Funktionsregister statt mehrfacher Programmlogik; dieselbe Kartenübersicht und Musik aus mehreren Zimmern; Geschichten aus Bibliothek/Galerie; Quelle für Rücknavigation. |
| Wiederverwendbares Buch | `app.js` | `EMFDReader.open()` und `EMFDCardBook.open()` als gemeinsamer Einstieg zur bisherigen Kartenbuch- und Geschichtenfunktion, ohne doppelte Rendering-Engine. |
| START-02-Ladefehler | `media-catalog.json`, `media-catalog.js`, `media-core.js`, `start-gate.js`, `image-service-worker.js` | Sechs getrennte Bildidentitäten, Abgleich mit beiden Medienmanifestformaten, gleiche Motivvarianten, erneuter Ladeversuch und Wiederanzeige bei erfolgreichem Laden. |
| Cache/Release | `manifest.webmanifest`, `image-profiles.js`, `image-service-worker.js`, `package.json`, `deployment-layout.json`, `index.html` | Version v0.6.64, Cache `emfd-images-recovery-v8`, veränderte Skripte cache-busted. |

## 2. Verbindliche bestehende Funktionen

- Musikplayer und Musikhoheit werden nicht neu implementiert.
- Die 24 bestehenden Karten, ihre Inhalte und Illustrationen bleiben unverändert.
- Atelier behält seine spezielle Karten-/Galerieansicht.
- Teezimmer behält exakt die zwei gewählten Funktionen: „Eine Karte aussuchen“ und „Tageskarte ziehen“. Keine neue Gedankenblatt-Schaltfläche im Teezimmer.
- Buch und längere Texte teilen die Leseschriftsteuerung. Unterschiedliche Buchinhalte behalten jeweils ihre spezifische Inhaltsdarstellung; eine vollständige Zusammenlegung aller Buchrenderer ist **nicht** behauptet.
- Manifest-Startadresse bleibt `/wunderhaus/home/` ohne Hash; der PWA-Name „Haus der kleinen Wunder“ bleibt erhalten.

## 3. Tests

- 8/8 neue Architektur- und Design-Regressionstests bestanden (`tests/ui-architecture-v0.6.64.test.cjs`).
- 26/26 gezielte Tests für UI-Architektur, Audio, Musik und Installation bestanden.
- Gesamte vorhandene Testsuite inklusive 8 neuer Tests: 176 bestanden, 36 fehlgeschlagen, 1 übersprungen. Der ältere Stand v0.6.63 hatte 174 bestandene, 30 fehlgeschlagene und 1 übersprungene Tests. Sechs zusätzliche Fehlprüfungen sind neu; acht alte Erwartungstexte schlagen wegen geänderter Integrationspunkte, neuer Version oder verlegter Teezimmer-Handler fehl und zwei ältere Prüfungen wurden grün. Diese Unterschiede sind für die spätere Testsuite-Aktualisierung dokumentiert, nicht als bestandene Browserabnahme gewertet.
- Alle JavaScript-Dateien wurden mit `node --check` auf Syntax geprüft.
- CSS-Syntax der neuen Designsystemdatei geprüft.
- Bestehende Testsuite enthält viele alte Erwartungen auf frühere UX- und Versionsstände (z. B. Gedankenblatt im Teezimmer). Ihre Fehlschläge sind nicht pauschal als behoben zu deklarieren.
- **Browserprüfung konnte nicht durchgeführt werden:** Chromium wurde im bereitgestellten Prüfcontainer bei lokalen HTTP- und `file://`-Adressen mit `ERR_BLOCKED_BY_ADMINISTRATOR` blockiert.

## 4. Nicht gelöste Medienlücke

Die folgenden Dateien werden benötigt, sofern sie auf dem echten Server nicht bereits genau unter diesem Namen (oder einer gleichnamigen Formatvariante) existieren:

- `media/start/EMFD-START-02-A01-tisch.webp`
- `media/start/EMFD-START-02-A02-umschlag-koerper.webp`
- `media/start/EMFD-START-02-A03-umschlag-lasche.webp`
- `media/start/EMFD-START-02-A04-herzsiegel.webp`
- `media/start/EMFD-START-02-A05-briefpapier.webp`
- `media/start/EMFD-START-02-A06-geschenkkarte-vorderseite.webp`

**Das in dieser Sitzung vorliegende `EMFD_Media_Ablage_v1.0(1).zip` enthält kein Verzeichnis `media/start/`.** Daraus kann nicht abgeleitet werden, ob die Nutzerin diese Dateien inzwischen direkt auf den Server hochgeladen hat. Die automatische Wiederherstellung ersetzt fehlende Quelldateien nicht und garantiert keine erfolgreiche Darstellung bei HTTP-404.

## 5. Abnahme nach dem Deployment (noch offen)

1. iPhone Safari und Android Chrome: Startansicht, Brief A01–A06, erneutes Laden, Installationsadresse.
2. 390px / 768px / 1440px sowie 200% Textvergrößerung: Buttons und Überschriften ohne Beschnitt.
3. Teezimmer → Karte aussuchen → zurück; Teezimmer → Tageskarte ziehen → zurück.
4. P01/P03/P06 → Kartenübersicht → zurück in den ursprünglichen Raum.
5. P02/P06 → dieselbe Geschichtenbuchfunktion; Leseschrift-Stufen wechseln, schließen, wieder öffnen.
6. Buch O01/O23, Kartenrückseite, Kartenmusik, Flurmusik und bewusste Pause.
7. Reale Medienfehler und neu hochgeladene Bilder erneut prüfen; `EMFDMedia.report()` in Entwicklerkonsole auswerten.
8. Alte Tests nach Abgleich mit den **neuen, bestätigten** UX-Anforderungen schrittweise aktualisieren; keine bestehenden Schutztests ungeprüft löschen.

## 6. Auslieferung

- `home/` **immer vollständig** im neuen ZIP.
- `media/` unverändert, daher **kein neues Medien-ZIP**.
- Keine Veröffentlichung / kein Überschreiben des Live-Systems ohne separate Freigabe.

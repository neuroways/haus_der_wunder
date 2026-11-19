# Entscheidungsprotokoll

> Maßgeblich ist seit 19.11.2026 das Entscheidungsregister im gemeinsamen Repository `neuroways/haus-der-wunder` (`docs/decisions/`, W1–W7 = D-13). Diese Datei bleibt als Verlauf.

Verbindliche Planungsentscheidungen für die Entwicklung. Neuere Einträge ersetzen ältere ausdrücklich. Quelle der fachlichen Entscheidung ist die Planung in ChatGPT; Claude Code dokumentiert und versioniert sie hier.

## 19.11.2026 · Neue Oberfläche, Funktionen bleiben

Festgelegt von der Projektinhaberin am 19.11.2026 (an Claude Code):
- **Frontend und Backend werden getrennt.** Die Funktionen bleiben erhalten. Dazu gehören Musik und Gerätestationen, Karten, Gedankenblatt, Bücher, Navigation mit Rückwegen, Hilfe, Einstellungen und Register. Neu werden die Bilder und die Steuerung.
- **Das Frontend wird neu gedacht.** Von der bisherigen Oberfläche werden auch keine Buttons übernommen, weil sie nicht einheitlich sind. Alle Bedienelemente sind einheitlich und kommen aus einem gemeinsamen Satz.
- Umgesetzt wird streng nach dem jeweiligen Auftrag. Bei Unklarheiten fragt Claude Code nach, statt selbst zu gestalten.
- Die bisherigen Ansichten bleiben erreichbar, bis die neue Oberfläche sie ersetzt. Alte Adressen und QR-Codes bleiben gültig.

## 19.11.2026 · EMFD-DEV-BOOK-01 · Entscheidungsrunde W1–W7

Quelle: ChatGPT-Entscheidungsrunde „EMFD-DEV-BOOK-01 · Entscheidungsrunde W1–W7“, von der Projektinhaberin am 19.11.2026 an Claude Code übermittelt. Grundlage: `docs/PLANUNG-UMBAU-BILDERBUCH.md`.

| ID | Entscheidung | Ersetzt |
|---|---|---|
| W1 | **Musik läuft bei Raum-, Blickrichtungs- und Bildausschnittwechsel weiter.** Ein anderes Gerät zu betrachten ändert nichts. Ein bewusst gestartetes neues Stück beendet die bisherige Wiedergabe. Küchenradio: Einschalten startet ein zufälliges Programm, Ausschalten beendet es. Globaler Stopp beendet jede Wiedergabe. Eine Audio-Engine; der Wiedergabekontext merkt sich das aktive Gerät (z. B. Radio bleibt „an“, auch außerhalb der Küche). | PLAYER-01 Abschnitt 4 (PLA-D07b/f, Tabelle „Pause beim Verlassen“) und Abnahme P07/P08 |
| W2 | **Gedankenblatt im neuen Teezimmer** über die Kartenfunktionen erreichbar: Kartentisch → Karte ziehen / Begleiterkarte ansehen → Kartendetail (Impuls · Frage · Geschichte · Musik · Gedankenblatt). Kein dritter prominenter Knopf auf dem Kartentisch; ein separates Papierobjekt im Raum ist möglich. **Das bisherige Teezimmer bleibt bis zur Ablösung unverändert** (zwei Aktionen). | Entscheidung 19.11.2026 „kein Gedankenblatt im Teezimmer“ gilt nur noch für das bisherige Teezimmer |
| W3 | **Globale Navigation** (Haus, Karten, Musik, Begleiter) aus jedem Raum erreichbar, als eigener UX-Auftrag **BOOK-01h**; ruhige, platzsparende Variante, nicht die alte Leiste. Layout noch nicht freigegeben. | NAV-01 „keine neue untere Hauptnavigation“ gilt bis BOOK-01h |
| W4 | Gerät P08: **Anzeigename „Teespieluhr“**, Geräte-ID **MP-P08**, Objektbeschreibung „Porzellan-Spieluhr mit blauem floralem Dekor und goldener Mechanik“, Modus Playlist. Allgemein: Anzeigename, technische ID und Objektbeschreibung werden getrennt geführt. | – |
| W5 | **Raum-IDs:** EXT Eingang und Außengarten · H00 Halle (bisheriger Flur) · KUE Küche · M01 Musikzimmer · P01–P08 unverändert · SCH Schlafzimmer · BAD Badezimmer. Alte Adressen bleiben als Aliase gültig (insbesondere `#flur` → H00), ebenso QR- und Rückkehrlinks. | – |
| W6 | **Begleiterkarte dauerhaft lokal speichern:** nur die Karten-ID, auf dem jeweiligen Gerät, ohne Registrierung oder Server. Kein automatischer Tages- oder Objektwechsel; nur bewusstes Ziehen oder Auswählen ersetzt sie. Gedankenblatt bleibt flüchtig und exportierbar; ein Tagebuch wäre ein eigener späterer Auftrag. | Tageskarte nur für die Sitzung |
| W7 | **Medienstatus mit EMFD-MEDIA-CORE konsolidieren**, kein zweites Manifest. Getrennte Dimensionen: Availability (Datei vorhanden), Release (darf ausgeliefert werden), Production (Entwurf/Prüfung/freigegeben), Integration (Platzhalter oder Original eingebunden), Verification (Darstellung geprüft). Feldnamen und Werte stimmt Claude Code mit `media/manifest.schema.json` und dem Medienregister ab. | Statusliste PLACEHOLDER…VERIFIED aus BOOK-01 §16 als einzelnes Feld |

**Auftragsfolge:** PLAYER-01 (W1) → BOOK-01a Register, Medienstatus, Routen → 01b Szenenkomponente → 01c Raumwechsel und gemeinsame Zustände → 01d Außenbereich und Tutorial / 01e Halle, Küche, Innenhof, Teezimmer / 01h Globale Navigation (je nach 01c) → 01f Radio, Windspiel, Teespieluhr (nach PLAYER-01, 01e) → 01g Begleiterkarte und Kartentisch (nach 01e) → 01i Integration, Regression, Abnahme.

## 19.11.2026 · Teezimmer (bisheriges)

Genau zwei Aktionen („Eine Karte aussuchen“, „Tageskarte ziehen“), kein Gedankenblatt-Knopf. Gilt bis zur Ablösung durch das Bilderbuch-Teezimmer (siehe W2).

## 19.11.2026 · EMFD-NAV-01

Ein Rückweg pro Ansicht, tatsächliche Herkunft, Ersatzziele laut Matrix, App-Rückweg nutzt den Browserverlauf. Details: `auftraege/EMFD-NAV-01.md`, Rückmeldung `auftraege/EMFD-NAV-01-rueckmeldung.md`.

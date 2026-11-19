# EMFD-Rückmeldung · EMFD-PLAYER-01 · Gemeinsamer Geräteplayer
Datum: 19.11.2026 · Ergebnis: umgesetzt (mit W1 statt Abschnitt 4 „Pause beim Verlassen“; Medienmanifest offen) · Commit: 153621b auf claude/modest-galileo-ifo41b (Repository neuroways/haus_der_wunder)
Ausgangsversion: v0.6.67 (= Live v0.6.66 + NAV-01) · Zielversion: v0.6.68 · Live unverändert v0.6.66

## Was sich für die Person ändert
- Jeder Raum P01–P08 zeigt im Bereich „Musik dieses Zimmers“ das Gerät mit **„<Gerät> ansehen“**. Antippen öffnet die Gerätestation, **ohne Musik zu starten**. Atelier und Teezimmer erreichen ihr Gerät über die Kopfzeile („♫“ bzw. „Teespieluhr“); das Teezimmer behält genau seine zwei Aktionen.
- **Gerätestation** (eine für alle acht Geräte): Gerätebild, Name, aktuelles bzw. erstes Stück mit Cover, Titel und Kategorie, „Geschichte lesen“, Steuerung (vorheriges Stück, Abspielen/Pause, Stopp, nächstes Stück, Wiederholen), Zustand als Text („Still – wähle ein Stück oder starte die Teespieluhr.“, „Lädt …“, „Spielt“, „Pausiert“, „Gestoppt“, „Nicht verfügbar“ mit Grund), Stückliste mit „Abspielen“ und „Geschichte lesen“, Knopf „Lautstärke“ (öffnet den gemeinsamen Musikdialog). Hochformat untereinander, ab Tabletbreite nebeneinander; Gerätebild nie beschnitten oder gestreckt.
- **Erst „Abspielen“ bindet die Musik an dieses Gerät.** Ein anderes Gerät zeigt währenddessen „Still“ und ändert nichts an der laufenden Musik.
- **Musik läuft bei Raumwechsel, Rückweg, Geschichte und Karte weiter (W1).** Kein automatischer Start beim Betreten, kein Autoplay nach Reload oder Direktlink.
- **„Geschichte lesen“ öffnet den Buchleser als Dialog über der Station bzw. dem Raum**; man bleibt im Raum. Die Adressen `#musik/geschichten/…` funktionieren unverändert.
- Screenreader hören die Gerätenamen („Teespieluhr – Wiedergabe steuern“, „Musikschatulle pausieren“, „Nächstes Stück am Windspiel“), nicht mehr „Schallplattenspieler“.

## Abweichungen vom Auftrag (mit Grund)
- **Musikverhalten:** Abschnitt 4 (Gerätemusik pausiert beim Verlassen, Abnahme P07/P08) ist durch Entscheidung **W1** ersetzt: Musik läuft weiter. Umgesetzt ist der Wiedergabekontext (Quelle, Gerät, Raum), der das aktive Gerät kennzeichnet; er pausiert nie wegen Navigation.
- **Raumaktion:** Statt eines zusätzlichen Knopfes „[Gerät] ansehen“ wurde der bisherige Gerätestart im Raum in diesen Link umgewandelt; die Stückliste mit „Musik abspielen“ blieb als ausdrückliche Abspielaktion erhalten (PLA-D01 erlaubt das).
- **Medienmanifest:** Die acht Gerätebilder sind **nicht** ins zentrale Medienmanifest eingetragen. Das Manifest-Werkzeug (`tools/emfd_media.py`) kennt Geräte bereits (ohne Bild), wird aber in einer parallelen Sitzung (`claude/bold-feynman-nekhwz`) umgebaut; eine Änderung hier hätte Konflikte erzeugt. Die Station nutzt bis dahin die Pfade aus dem Geräteregister. 🔴 offen.
- **Eigene Cover (O04, O06, O24):** werden bevorzugt, sobald `EMFDImages.cover()` sie liefert. Das setzt das Medienmanifest v2 auf dem Server voraus (noch nicht live). Bis dahin erscheint die Kartenvorderseite; ohne Bild ein beschrifteter Platzhalter.
- **Gerätenamen:** Anzeigenamen aus der App übernommen (Fensterdose, Musikschatulle, Klangschale, Atelier-Spieluhr, Windspiel, Klangkästchen, Windharfe, Teespieluhr). Das Register im gemeinsamen Repository nennt teils andere Namen (Baum-Musikschatulle, Karussell-Spieluhr, Hofwindspiel, Porzellanspieluhr); nach W4 sind das Objektbeschreibungen, nicht Anzeigenamen. Abgleich in BOOK-01a.

## Antworten auf die offenen Fragen
- **Gerätebilder (Medientabelle):** `media/raumgeraete/P01–P08.webp`, je 504 px breit, **ohne Transparenz**, Seitenverhältnis 2,03–2,26 (P01–P03 504×227, P04–P06 504×223, P07–P08 504×248). Es sind Ausschnitte mit Umgebung, **keine freigestellten Geräte**. Für PLAYER-02 (Bewegung, Nahansicht) reichen sie nicht.
- **Cover/Ersatzcover:** Kartenvorderseiten aus `EMFDImages.card(id,'card-view')` (7:12), proportional angezeigt.
- **Startquellen und Wiedergabekontext:** Gerät (Station oder Raumliste) setzt `{source:'device',deviceId,roomId}`. Alle anderen Starts (Hintergrundmusik, Karte, Grammophon, Plattensammlung, Starttour) löschen den Gerätekontext; sie sind als „nicht Gerät“ erkennbar, aber noch nicht einzeln benannt (für W1 nicht nötig, für das Radio in BOOK-01f vorgesehen).
- **Adressen:** `#ort/P01/geraet` … `#ort/P07/geraet` (P04 auch `#ort/P04/geraet`), `#atelier/geraet`, `#teezimmer/geraet` (auch `#ort/P08/geraet`). Ohne Herkunft führt der Rückweg in den zugehörigen Raum.

## Tests
- `npm test`: **329 bestanden, 0 fehlgeschlagen, 1 übersprungen** (MP3-Test). Neu: `tests/player-01-devices.test.cjs` (Register = bestätigte Zuordnung mit 26 Einträgen und O15/O16 doppelt, Adressen und Rückwege, Geräte nur aktiv bei eigenem Kontext, Zustandstexte inkl. Grammatik, Stücklisten, Coverreihenfolge, Port-Kontext, kein Start beim Öffnen, Geschichte ohne Ortswechsel, Gerätenamen in der Steuerung).
- Browser (Chromium, 390 × 844 und 1280 × 800), mit lokal eingespielten Testtönen statt fehlender Audiodateien: Öffnen still → Abspielen (Kontext MP-P02) → Pause → Fortsetzen → Weiter → Geschichte (Dialog, Musik läuft, gleiche Adresse) → Rückweg → anderer Raum (läuft weiter) → anderes Gerät („Still“) → eigenes Gerät (zeigt laufendes Stück) → Stopp → Reload (still). Keine JavaScript-Fehler.

| ID | Status |
|---|---|
| P01–P04, P06, P09, P11–P14, P16, P19 | bestanden |
| P05 | bestanden (Raumwechsel ohne Unterbrechung) |
| P07, P08 | ersetzt durch W1 (Musik läuft weiter) – entsprechend bestanden |
| P10 | bestanden im Test (Kontext wird bei Kartenstart gelöscht), im Browser nicht separat geprüft |
| P15 | teilweise: fehlende Audiodatei → „Leider ist die Platte verloren gegangen …“ geprüft; abgelehnte Wiedergabe, schneller Wechsel nicht im Browser geprüft |
| P17, P18 | teilweise: Hochformat und Desktop geprüft; Querformat, Tablet, Screenreader, Graustufen nicht |
| P20 | nicht testbar (keine Raumverbindungen) |
| P21 | bestanden (globaler Musikdialog bleibt erreichbar) |

## Neue offene Punkte / Fragen an die Planung
1. **Auf dem Server fehlen alle 25 Audiodateien** unter `/wunderhaus/media/audio/` (O01–O24, THEME: 404). Live ist Musik derzeit überall stumm. Bitte Bestand und Ablageort klären (betrifft auch BOOK-01f Radio).
2. Gerätebilder ins Medienmanifest: nach Abschluss der Medienarbeit (`claude/bold-feynman-nekhwz` bzw. gemeinsames Repository) nachziehen.
3. Freigestellte Geräte, Ebenen und Nahansichten für PLAYER-02 fehlen (siehe Medientabelle).
4. Gerätenamen zwischen App und gemeinsamem Register abgleichen (Anzeigename vs. Objektbeschreibung, W4).
5. Prüfung auf dem iPhone steht aus.

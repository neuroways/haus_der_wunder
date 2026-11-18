# Prompt: Wissensübergabe der 2D-Welt aus ChatGPT

In dem ChatGPT-Projekt bzw. Chat einfügen, in dem die 2D-Welt entwickelt wurde.
Wenn das Wissen auf mehrere Chats verteilt ist, den Prompt in jedem Chat ausführen
(jeder Chat kennt nur seinen eigenen Verlauf, Projekt-Dateien und Erinnerungen).
Die Antworten als Dateien unter `input/chatgpt-2d/` ablegen (Dateinamen gibt ChatGPT vor).

---

Du übergibst die Weiterentwicklung der 2D-Welt von „Haus der kleinen Wunder · Ein Moment für dich“ an ein anderes Entwicklungsteam (Claude Code). Dieses Team hat das Git-Repository, aber **nicht** diesen Chatverlauf. Alles, was nicht in deiner Übergabe steht, geht verloren. Ziel: Das Team setzt **genau dort an, wo wir aufgehört haben**, ohne bereits getroffene Entscheidungen neu zu verhandeln oder Verworfenes wieder einzubauen.

## Was das Team schon kennt (nicht wiederholen, nur ergänzen oder korrigieren)

- Die 2D-Welt ist die PWA unter `/wunderhaus/home/` (= haus-der-wunder.de), zuletzt v0.6.66, für das iPhone als Home-Bildschirm-App.
- Im Repo liegt davon nur `home/index.html` und `home/media-bridge.js`. Eingebunden, aber **nicht vorhanden** sind u. a.: `reading-preferences.js`, `data.js`, `image-profiles.js`, `media-core.js`, `media-catalog.js`, `media-recovery.js`, `card-motion.js`, `card-preload.js`, `card-draw.js`, `device-light.js`, `card-tap.js`, `atelier-hand.js`, `atelier.js`, `teezimmer.js`, `shared/navigation.js`, `shared/stations.js`, `shared/audio.js`, `shared/content.js`, `shared/readers.js`, `shared/help.js`, `shared/help-dialog.js`, `music-discovery.js`, `music-device.js`, `music-books.js`, `music-room.js`, `room-music.js`, `feature-registry.js`, `app.js`, `settings.js`, `audio-session.js`, `music-player.js`, `start-tour.js`, `music-entry.js`, `card-interaction.js`, `origin-story.js`, `library/library-entry.js`, `emfd-ui-runtime.js`, `thought-qr.js`, `thought-paper.js`, `book-reading.js`, `music-help.js`, `navigation-icons.js`, `style.css`, `manifest.webmanifest`, `assets/icons/`, `emfd-ui/`.
- Zentrale Medien liegen unter `/wunderhaus/media/` (Karten O01–O18 in Revision r2, Cover O04/O06/O24, Manifest, `media-loader.js`). Medienregeln und Loader sind fertig (EMFD-MEDIA-CORE-01).
- Parallel gibt es eine begehbare 3D-Welt (`home_3d/`, v0.5.2) mit den Räumen Teezimmer, Küche, Wintergarten, Bibliothek, Fensterzimmer, Schlafzimmer, Bewegungsraum.

## Arbeitsregeln für deine Übergabe

1. **Nichts erfinden.** Nur, was in diesem Chat, in Projekt-Dateien oder in deinen Erinnerungen tatsächlich vorkommt. Lücken als `[UNBEKANNT]` markieren, Vermutungen als `[UNSICHER: …]`.
2. **Status zu jeder Aussage:** `BESCHLOSSEN` · `UMGESETZT (vX.Y.Z)` · `IN ARBEIT` · `IDEE` · `VERWORFEN (Grund)`. Bei Widersprüchen gilt der jüngste Stand; den älteren als überholt nennen.
3. **Wortlaute wörtlich übernehmen:** Raumtexte, Kartentexte, Begrüßungen, Hilfetexte, Button-Beschriftungen, Tonalitätsregeln. Nicht zusammenfassen, nicht glätten.
4. **Code:** Hast du den aktuellen Stand einer der fehlenden Dateien (siehe Liste oben) im Chat oder in Projekt-Dateien, gib ihn **vollständig** wieder, mit Version und Herkunft. Nur Ausschnitte → so kennzeichnen. Keinen Code neu schreiben, um Lücken zu füllen.
5. **Konkret statt allgemein:** IDs, Dateinamen, Versionsnummern, CSS-Klassen, localStorage-Schlüssel, Ereignisnamen, Routen/Hashes, Maße, Farbwerte, Schriftarten, Zeiten/Dauern.
6. **Ausgabeformat:** Jede Datei als eigener Markdown-Codeblock, davor eine Zeile `Datei: input/chatgpt-2d/<name>.md`. Wenn die Antwort zu lang wird: an einer Abschnittsgrenze stoppen, `— FORTSETZUNG FOLGT (nächste Datei: …) —` schreiben und auf „weiter“ warten. Niemals kürzen, um in eine Antwort zu passen.

## Zu liefernde Dateien

### `00_ueberblick.md`
- Idee, Zweck, Zielgruppe, Gefühl/Wirkung („Ein Moment für dich“), was die App bewusst **nicht** sein soll.
- Begriffe/Glossar (z. B. Weltenweberin, Stationen, Atelier, Gedankenpapier, Karten O/T, Raumplayer …) mit Bedeutung.
- Versionsgeschichte: je Version (so weit bekannt bis v0.6.66) Datum, was neu/geändert/repariert wurde, Kürzel wie `arch01`, `music04`, `fix01`, `auto1`, `intro01`.

### `01_raeume.md` – ein Abschnitt je Raum/Station (Teezimmer, Atelier, Musikzimmer, Bibliothek, Startbereich/Eingang, und alle weiteren)
Für jeden Raum genau diese Gliederung:
- Name, interne ID/Route, Status
- Zweck und Stimmung, Rolle im Rundgang
- Aufbau: Hintergrund/Raumhauptbild, Ebenen, Objekte und ihre Position, was antippbar ist
- Abläufe Schritt für Schritt (Betreten, Interaktionen, Verlassen), inkl. Animationen, Dauer, Ton
- Inhalte: welche Karten (O01–O24, T03), Bücher, Musikstücke, Texte (wörtlich)
- Zustände und Speicherung (was merkt sich die App, wo)
- Verbindungen zu anderen Räumen, Navigation, Icons
- Offene Punkte, bekannte Fehler, verworfene Varianten
- Bezug zur 3D-Welt: Entsprechung im 3D-Haus? Was soll gleich bleiben?

### `02_funktionen.md` – je Funktion/Modul
Kartenziehen, Kartenbewegung/Tippen, Gerätelicht, Lesen/Vorlesen und Lesevorlieben, Musikplayer/Musikentdeckung/Musikbücher/Raummusik, Audio-Sitzung, Starttour, Ursprungsgeschichte, Gedanken-QR und Gedankenpapier, Hilfe, Einstellungen, Feature-Registry, Navigation, Medienwiederherstellung, Vorladen, Offline/Service Worker.
Je Funktion: Zweck, Verhalten, Auslöser, beteiligte Dateien, öffentliche Schnittstellen (globale Objekte, Funktionen, Ereignisse), Speicher-Schlüssel, Abhängigkeiten, Status, offene Punkte.

### `03_anforderungen.md`
- Pflichtanforderungen (z. B. iPhone/Safari-PWA, offline, kein Autoplay, Barrierefreiheit, Schriftgrößen, Bewegung reduzieren, Datenschutz, Performance-Budget, Startzeit).
- Gestaltungssprache: Farben (Werte), Schriften, Abstände, Rundungen, Bildstil, Lichtstimmung, Animationsregeln, Tonalität der Texte (Du/Sie, Wortwahl, Verbote).
- Technische Regeln: Versionierung/Cache-Busting (`?v=`), Dateiorganisation, keine Build-Tools?, Bibliotheken, Deployment-Ablauf, Rollback.
- Abnahmekriterien und Tests, die früher vereinbart wurden.

### `04_inhalte.md`
Tabelle aller Karten O01–O24 und T03 (Titel, Text wörtlich, Raum, Audio, Status der Vorderseite/Cover), Bücher, Musikstücke, sonstige Texte. Nur was bekannt ist.

### `05_stand_und_naechste_schritte.md`
- Wo genau wir aufgehört haben: letzter Arbeitsschritt, letzte Entscheidung, letzte offene Frage an mich.
- Priorisierte Aufgabenliste (was als Nächstes, warum, Abnahme).
- Bekannte Fehler mit Gerät/Version/Reproduktion.
- Entscheidungen, die ich noch treffen muss, mit den diskutierten Optionen.
- Liste „Nicht wieder tun“: verworfene Ansätze und warum.

### `06_code/<dateiname>` (nur falls vorhanden)
Je verfügbarer Quelldatei ein Codeblock mit Zeile `Datei: input/chatgpt-2d/06_code/<originalpfad>`, darüber Version und Herkunft (Chat-Datum / Projekt-Datei).

## Abschluss
Zum Schluss eine Selbstprüfung: Liste der Themen, die du im Verlauf erkennst, aber nicht vollständig übergeben konntest, und welche Fragen ich dir noch stellen sollte, um sie herauszuholen.

Beginne jetzt mit `00_ueberblick.md`.

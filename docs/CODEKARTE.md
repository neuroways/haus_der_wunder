# Codekarte · 2D-PWA `home/` (v0.6.66, korrigiert)

Arbeitskarte für Claude Code: **zuerst hier nachsehen, dann direkt an die genannte Stelle springen.** Stand 19.11.2026. Bei jedem Auftrag, der Struktur, Routen, Dienste, Speicher-Schlüssel oder Ereignisse ändert, diese Karte im selben Commit mitpflegen.

Ergänzende Quellen in `home/`:
- `architecture/SCHNITTSTELLEN.md`: genaue Verträge der gemeinsamen Dienste (Navigation, Stationen, Audio, Inhalte, Leser, Hilfe). Gilt weiterhin.
- `architecture/MIGRATION.md`: was ARCH-01 (`arch01`) umgebaut hat.
- `README.md` (in `home/`): Änderungsverlauf v0.6.18 bis v0.6.65. `qa/`: Prüfberichte je Arbeitspaket.

## 1. Grundaufbau

- Kein Build-Schritt, kein Framework. Klassische Skripte (`defer`) in fester Reihenfolge aus `index.html`, dazu zwei ES-Module (`library/library-entry.js`, `emfd-ui-runtime.js`). Jedes Modul ist eine IIFE und hängt sein API als `globalThis.EMFD…` an. Viele Module exportieren für Tests zusätzlich per `module.exports`.
- Ein einziges `<main>`. `app.js` rendert pro Hash-Route den Inhalt hinein (`render()` auf `hashchange`). Dialoge (`<dialog>`) liegen in `index.html` oder werden von Modulen erzeugt.
- Pfade: App unter `home/`, Medien immer relativ als `../media/…` (siehe Abschnitt 7).
- Lokal starten: `cd home && npm run dev` (`server.mjs`, liefert auch `../media/` aus). Tests: `npm test`.

## 2. Ladereihenfolge (`index.html`)

1. `reading-preferences.js` (synchron, setzt Schriftgröße vor dem ersten Zeichnen)
2. Daten und Medien: `data.js` (`window.CARDS`) → `image-profiles.js` (`EMFDImages`) → `../media/media-loader.js` (Loader) → `media-bridge.js` → `media-core.js` → `media-catalog.js` → `media-recovery.js`
3. Karten: `card-motion.js`, `card-preload.js`, `card-draw.js`, `device-light.js`, `card-tap.js`
4. Räume: `atelier-hand.js`, `atelier.js`, `teezimmer.js`
5. Gemeinsame Dienste: `shared/navigation.js`, `shared/stations.js`, `shared/audio.js`, `shared/content.js`, `shared/readers.js`, `shared/help.js`
6. Musik: `music-discovery.js`, `music-device.js`, `music-books.js`, `music-room.js`, `room-music.js`
7. `feature-registry.js` → **`app.js`** (lädt `start-gate.js` dynamisch nach) → `settings.js` → `audio-session.js` → `music-player.js` → `start-tour.js` → `music-entry.js` → `card-interaction.js` → `origin-story.js`
8. Module: `library/library-entry.js`, `emfd-ui-runtime.js`
9. `thought-qr.js`, `thought-paper.js`, `book-reading.js`, `music-help.js`, `shared/help-dialog.js`, `navigation-icons.js`

Wichtig: `app.js` läuft **vor** `music-player.js`. Code in `app.js`, der `EMFDMusic` braucht, muss optional zugreifen (`window.EMFDMusic?.…`) oder auf `emfd:music-ready` warten.

## 3. Routen → Renderer

Router: `app.js` `render()` (ca. Zeile 181). Erlaubte Routen prüft zusätzlich `shared/navigation.js` `route()`. **Eine neue Route muss an beiden Stellen ergänzt werden.**

| Route | Renderer | Bemerkung |
|---|---|---|
| `#ankommen` (leer) | `start-gate.js` `renderRoute()` → `renderDoor()` / `renderGift()` | `app.js` rendert erst eine Startseite, `start-gate.js` überschreibt sie (Timeout 0). |
| `#flur`, `#haus` | `app.js` `renderHall()` | Hotspots: Atelier, Teezimmer, Musik, Alle Räume, Geschenk. Lichtschalter → `EMFDHallLight`. |
| `#raeume` | `app.js` `renderRoomDirectory()` | Kacheln P01–P08 + Musikzimmer. |
| `#ort/P01…P07` | `app.js` `renderRoomDetail(id)` | Raumdaten in `ROOMS` (app.js, Zeile 21). P02 hängt das Bibliotheksregal ein. Danach `EMFDFeatures.mountRoom()` (Funktionsknöpfe). |
| `#atelier`, `#ort/P04`, `#atelier/tisch/Oxx` | `atelier.js` `renderAtelier` / `renderTable` → `renderGallery` | Zyklischer Wandrundgang O01–O24, Gesten, Bildvergrößerung. |
| `#teezimmer`, `#ort/P08` | `teezimmer.js` `render()` | Genau zwei Aktionen (Entscheidung). |
| `#karten` | `atelier.js` `renderGrid()` | Kartengalerie mit Gruppenwahl „Wie möchtest du heute schauen?“. Fallback `room()` in app.js. |
| `#karte/Oxx`, `#karte/Oxx/frage` | `app.js` (Zweig `isCard`) | Karte in der Hand (`heldCard`), Dock mit Buch (`cardDock`), `/frage` öffnet direkt die Frageseite. |
| `#karte/verdeckt` | `app.js` + `card-draw.js` | Gezogene Karte zuerst verdeckt; Ziel-ID in sessionStorage. |
| `#musik` | Station `gramophone` (`music-room.js` `renderRoom`) | Grammophon des Musikzimmers. |
| `#musik/playlist` | Station `records` (`music-room.js` `renderPlaylist`) | Plattensammlung mit Kategorie-, Stil- und Instrumentfilter. |
| `#musik/geschichten`, `…/Oxx` | Station `compositions` (`music-room.js` → `music-books.js` → `library/library.js`) | Regal mit 24 Kompositionsgeschichten. |

Nach jedem Render (Ende von `render()`): Raummusik einhängen (`EMFDRoomMusic.mount` für P01–P08), Kontext-Zurück (`EMFDFeatures.addContextBack`), Seitentitel, `EMFDUI.enhance`, Kartenbewegung, `EMFDNavigation.ready()`.

## 4. Gemeinsame Dienste (nur einmal vorhanden, nie duplizieren)

| Global | Datei | Zweck |
|---|---|---|
| `EMFDNavigation` | `shared/navigation.js` | Routen prüfen, `go(route,{origin,returnTo,kind,trigger})`, `back()`, `returnRoute()`, Rückkehr mit Fokus/Scroll. Sendet `emfd:navigation`. |
| `EMFDStations` | `shared/stations.js` | Lebenszyklus für Ansichten mit `render/leave`. Registriert: `gramophone`, `records`, `compositions`, `library`. |
| `EMFDAudio` | `shared/audio.js` | Lese-Port und Befehle (`command('play'|'pause'|'stop'|'next'|'previous'|'repeat'|'volume'|'silence')`, `select`, `playlist`, `subscribe`). Eigentümer ist `EMFDMusic`. |
| `EMFDMusic` | `music-player.js` | **Der einzige Player** (Dialog `#music-dialog`, Hintergrundmusik, Raum-Warteschlange, Stille, Lautstärke, verdeckte Karte still). Nutzt `EMFDAudioSession` (`audio-session.js`). |
| `EMFDContent` | `shared/content.js` | Lädt und cached JSON: `music()`, `compositions()`, `story(id)`, `musicForCard(id)`, `musicSources()`. |
| `EMFDReaders` | `shared/readers.js` | Bücher öffnen: `openBook('weltenweberin'|'klangwelten')`, `openComposition(id)`. |
| `EMFDReader` / `EMFDCardBook` | `app.js` | Kartenbuch (`#reading-dialog`): `open({type:'card',cardId,section})`, `type:'story'` → `EMFDOriginStory`. |
| `EMFDOriginStory` | `origin-story.js` | Gemeinsamer Buchleser (Dialog) für „Hinter dem Haus“, Weltenweberin, Klangwelten, Kompositionsgeschichten. |
| `EMFDHelp` | `shared/help.js` + `shared/help-dialog.js` | Kontexthilfe: `register(id,{matches,title,sections,priority})`. Einträge in `music-help.js`, `library/library-entry.js`; Fallback ist der alte Hilfedialog. |
| `EMFDFeatures` | `feature-registry.js` | **Einzige Zuordnung Raum → Funktion** (`roomFeatures`), Funktionsknöpfe (`mountRoom`), Tageskarte/Zufall, Klick-Delegation über `data-house-feature`/`data-feature-room`, Herkunft merken. |
| `EMFDThoughtPaper` | `thought-paper.js` | Gedankenblatt (Dialog, nur im Speicher), Export PNG/PDF mit QR (`thought-qr.js`). Modi `card` und `free`. |
| `EMFDCardDraw` | `card-draw.js` | Verdeckte Ziehung: `begin(id,returnTarget)`, `current`, `reveal`, `cancel`. |
| `EMFDCardView` | `card-interaction.js` | Nahansicht einer Karte (`#card-closeup`). |
| `EMFDImages` | `image-profiles.js` (+ `media-bridge.js`) | Bild-URLs je Zweck: `card(id,purpose)`, `back(purpose)`, `cover(id)`, `cardBack`. |
| `EMFDMedia` | `media-recovery.js` | Ersatzbild bei Ladefehler aus derselben Mediengruppe (`resolve`, `hydrate`, `retry`). **Achtung:** gleicher Name wie der Medien-Loader, siehe Fallstricke. |
| `EMFDHallLight` | `app.js` | Licht im Flur (`value`, `set`), Ereignis `emfd:hall-light-change`. |
| `EMFDHouse` | `app.js` | Raumliste mit Funktionen (nur lesend). |
| `EMFDUI` | `emfd-ui-runtime.js` | Bibliothekskomponenten (`emfd-ui/`) auf vorhandenes Markup anwenden: `enhance(root)`. |
| `EMFDReadingSize` | `book-reading.js` | Leseschriftgröße (5 Stufen), Bedienelement in allen Lesern. |

Weitere Modul-APIs: `EMFDAtelier` (atelier.js: `renderAtelier`, `renderTable`, `renderGrid`, `returnTarget`, `rememberReturn`, `selectGroup`), `EMFDTeezimmer`, `EMFDRoomMusic` (`mount`), `EMFDMusicRoom`, `EMFDMusicDevice` (Plattenspieler-Markup, Icons), `EMFDMusicDiscovery` (Filter, Varianten), `EMFDMusicBooks`, `EMFDMusicEntry` (Musikfrage beim ersten Besuch), `EMFDStartTour`, `EMFDStart02` (Start, Geschenkbrief), `EMFDLibrary`, `EMFDHandy`/`EMFDCardMotion` (Bewegung), `EMFDCardAssets` (Vorladen), `EMFDCardTap`.

## 5. Bereiche im Detail

### Karten
- Daten: `data.js` → `window.CARDS` (24 Einträge). Felder: `id, name, group, image, alt, imageWidth, imageHeight, imageSourceId, impulse, interpretation, depth, houseStory, question, anchor, textStatus …`. `image-profiles.js` ersetzt beim Laden `image`/`imageOverview`/`imageDetail` durch PERF-01-Varianten; `media-bridge.js` danach durch r2-Vorderseiten aus dem Manifest v2 (falls vorhanden).
- Karte in der Hand: `app.js` `heldCard`, `bindMotion` (Antippen dreht nach 280 ms, Doppeltipp öffnet Buch, Wischen/Bewegen kippt). Nahansicht: `card-interaction.js`.
- Kartenbuch: `app.js` `openCardText`/`showReadingPage`, Seiten `impulse`, `depth`, `question` (`readingKeys`). Frageseite enthält den Gedankenblatt-Einstieg (`data-thought-card`).
- Zufall/Tageskarte: `EMFDFeatures.randomCard()` → `EMFDCardDraw.begin()` → `#karte/verdeckt` → Umdrehen → `EMFDMusic.revealCard`.
- Rückweg aus der Karte: `EMFDAtelier.returnTarget()` (sessionStorage `emfd.card.return`) bzw. `returnTarget` der verdeckten Ziehung.

### Räume
- Raumdaten P01–P08: `ROOMS` in `app.js` (Name, Orientierungssatz, Alt-Text) + Bildpfade aus `EMFD_ROOM_PROFILES` (Zeile 1).
- Funktionen pro Raum: `feature-registry.js` `roomFeatures`. P04 und P08 rendern ihre Knöpfe selbst, die anderen bekommen sie über `mountRoom`.
- Musik pro Raum: `room-music.js` + `room-music-map.json` (Karten-Stücke, Gerätename, Gerätebild). Gerät öffnet den gemeinsamen Plattenspieler (`EMFDMusicDevice.device`), Wiedergabe über `EMFDMusic`.
- Bibliothek P02: `library/library-entry.js` (Station `library`) + `library/library.js` + `library/catalog.js` (Bücher, Status).
- Flur: `renderHall()` in `app.js`; Starttour beim ersten Betreten: `start-tour.js` (6 Schritte).

### Musik
- Daten: `music-manifest.json` (Audiospuren), `card-music-map.json` (Karte → Spur), `playlist-catalog.json` (25 Einträge: T03 + O01–O24), `music-discovery.json` (Stile, Instrumente, Cover, Varianten), `composition-stories.json` (24 Geschichten), `composition-story-media.json`.
- Ablauf: Auswahl → `EMFDAudio.select(id,{play})` → `EMFDMusic` → `EMFDAudioSession`. Nie Autoplay; `globalSilence` hat Vorrang.
- Erster Besuch: `music-entry.js` fragt „mit/ohne Hintergrundmusik“ (Speichern nur auf Wunsch).

### Start und Ankommen
- `start-gate.js`: Phasen `closed → opening → letter-visible → gift-card-visible → world-opening → sound-choice → completed`; erster Besuch mit Geschenkbrief, Folgebesuche direkt in den Flur. Bilder START-02 A01–A06 fehlen auf dem Server (Fehlerzustand vorhanden).
- `start-tour.js`: Einführung im Flur (Laterne, Grammophon, Türen, Geschenkkarte, Fragezeichen, Installation).

### Gedankenblatt
- `thought-paper.js`: `open({mode:'card',cardId}|{mode:'free'})`. Keine Speicherung, kein Netzwerk. Export: Canvas → PNG oder selbst gebautes PDF (`pdfFromCanvases`), QR mit Rückkehrlink (`thought-qr.js`).
- Einstieg nur über die Frageseite einer Karte. Modus `free` ist ohne Einstieg (Entscheidung).

## 6. Speicher-Schlüssel und Ereignisse

**localStorage:** `emfd.house.light.v1` (app.js) · `emfd.reading.size.v1` (book-reading.js, reading-preferences.js) · `emfd.music.mode`, `emfd.music.startOnEntry`, `emfd.music.volume`, `emfd.music.globalSilence` (music-player.js) · `emfd.music.entryPreference` (music-entry.js) · `emfd.start02.gift-completed.v1`, `emfd.start02.tutorial-completed.v1`, `emfd.start02.install-dismissed.v1`, `emfd.start03.intro-completed.v1` (start-gate.js) · `emfd.card.motionHint.v1.*` (card-motion.js) · `emfd-media-bridge` (Notbremse, media-bridge.js).

**sessionStorage:** `emfd.cardDraw.concealed` · `emfd.card.return` · `emfd.atelier.current|direction|gridScroll|group` · `emfd.music.entryPreference.session`.

**Ereignisse (window):** `emfd:navigation` · `emfd:music-ready` · `emfd:music-state` · `emfd:music-availability` · `emfd:card-concealed` · `emfd:card-revealed` · `emfd:hall-light-change` · `emfd:start-gate-rendered` · `emfd-media-updated`. Am Kartenelement: `cancel-card-tap`.

## 7. Medien

- Regeln: `media/MEDIEN-KONVENTION.md`. Ausschließlich relative Pfade `../media/…`.
- Schichten: `image-profiles.js` (feste PERF-01-Varianten, generiert) → `media-bridge.js` (r2-Vorderseiten und Cover aus `../media/manifest.json` v2, falls vorhanden) → bei Ladefehler `media-recovery.js` mit Gruppen aus `media-catalog.js` (`media-core.js` sucht Alternativen) → zuletzt Ersatzbilder in `home/assets/recovery/`.
- Service Worker `image-service-worker.js`: nur Bilder, Cache `emfd-images-recovery-v8`, max. 20 MB. Erlaubte URLs: feste Liste + alle Pfade aus `media-catalog.js`. Neues Bild außerhalb des Katalogs wird nicht gecacht.
- Raumgeräte-Bilder: `../media/raumgeraete/P0x.webp` (noch nicht im Manifest).

## 8. CSS-Schichten

Reihenfolge in `index.html`; spätere Dateien überschreiben frühere. Zuletzt geladen und damit bestimmend: `desktop-layout.css` → `design-system-v0.6.64.css` (einheitliche Größen/Typografie) → `music-device.css` → `arrival-cleanup-v0.6.65.css`. `app.js` lädt zusätzlich `emfd-fe07.css` und `immersive-v0.6.32.css`. Raumspezifisch: `atelier.css`, `teezimmer.css`, `room-music.css`, `music-room.css`, `library/library.css`, `thought-paper.css`, `book-v2.css`, `card-text-v1.3.css`, `card-interaction.css`, `start-gate-v0.6.61.css`, `start-tour.css`. Grundrahmen: `emfd-shell.css`, `emfd-scene.css`, `emfd-ui/css/emfd-ui.css`. Neue Regeln in die zuständige Raumdatei oder `design-system-v0.6.64.css`, nicht in eine weitere Datei.

## 9. Tests (`home/tests/`, `npm test`)

Reine Node-Tests (`node:test`), kein Browser. Viele lesen Quelltext per Regex, neuere laden Module per `vm` (`tests/helpers/arch-runtime.cjs`). Zuordnung nach Bereich:
- Architektur/Dienste: `architecture-*`, `runtime-render`
- Karten: `card-*`, `card-texts-v1.3`, `fe05-needs-gallery`, `fe08-entry-preload`
- Atelier: `atelier-*`; Teezimmer: `teezimmer-*`; Häuser/Räume: `house-01-integration`, `immersive-navigation`, `navigation-regression`
- Musik: `music-*`, `audio-session`, `app-theme-t03`, `room-music-integration`, `composition-stories-v04`
- Bücher/Bibliothek: `library-*`, `origin-storybook`, `reading-choice-icons`, `thought-book-v0.6.56`
- Gedankenblatt: `thought-paper-*`; Start: `start-*`, `arrival-cleanup-v0.6.65`; PWA/Paket: `pwa-install-01`, `package-layout`, `server`, `ui-architecture-v0.6.64`, `fix01-user-requirements`
- Medien-Tests prüfen echte Dateien unter `../media/` (seit 19.11.2026 im Repo).

Versionsangaben in Tests nie fest eintragen, sondern aus `package.json` lesen.

## 10. Wo setze ich an? (Rezepte)

- **Funktion in einem Raum ergänzen/entfernen:** `feature-registry.js` `roomFeatures` (und ggf. `features`). Für P04/P08 das Markup in `atelier.js`/`teezimmer.js`.
- **Neuen Raum P09 o. Ä.:** `ROOMS` in `app.js`, `EMFD_ROOM_PROFILES`, `roomFeatures`, Routenmuster in `shared/navigation.js` (`ort\/P0[1-8]`) und `feature-registry.js` (`roomFromHash`), Raumübersicht, ggf. `room-music-map.json`. Tests `house-01-integration` prüfen derzeit „kein P09“.
- **Texte einer Karte:** `data.js` (eine Zeile JSON). Buchseiten zeigen `impulse`, `depth`, `question`.
- **Musik einem Raum zuordnen:** `room-music-map.json` (`cardIds`, `deviceName`, `deviceImage`).
- **Hilfetext:** `EMFDHelp.register` im zuständigen Modul (siehe `music-help.js`).
- **Neue Route:** `app.js` `render()` + `shared/navigation.js` `route()`/`station()`; Titel in `titles`.
- **Neue Ansicht mit Lebenszyklus:** als Station über `EMFDStations.register(id,{render,leave})`.
- **Rückwege vereinheitlichen:** `EMFDNavigation.returnRoute()`/`back()` nutzen statt fester `href`. Heute noch feste Ziele in `app.js` (`renderRoomDetail`: „Alle Räume“ und „Zum Flur“), `atelier.js` `renderGrid`, Karten-Zweig in `render()`.

## 11. Fallstricke

- **Zwei Globale namens `EMFDMedia`:** `../media/media-loader.js` setzt den Loader, `media-bridge.js` greift ihn sofort ab, danach überschreibt `media-recovery.js` den Namen mit dem Ersatzbild-Dienst. Reihenfolge in `index.html` nicht ändern.
- `app.js` ist ein großes Skript mit sehr langen Zeilen; Änderungen mit eindeutigen Textstücken vornehmen und danach `node --check app.js`.
- `start-gate.js` rendert `#ankommen` nach `app.js` neu; Änderungen am Start dort, nicht im Startseiten-Zweig von `app.js`.
- Alte Pfade wie `../media/cards/Oxx.png` und `rooms/varianten/` stehen noch in Daten und Katalogen; tatsächlich angezeigt werden die optimierten Varianten aus `image-profiles.js`.
- Kartenrückseite: App nutzt `../media/cards/rueckseite.jpeg`; die in Katalog/Fallback genannte v1.2 fehlt auf dem Server.
- `home/assets/recovery/` enthält Medienkopien (Konventionsverstoß, bewusst noch nicht entfernt).
- Geänderte Dateien brauchen einen neuen `?v=` in `index.html` (bzw. in `app.js` für `start-gate.js`, `emfd-fe07.css`, `immersive-v0.6.32.css`; in `room-music.js` für `room-music-map.json`; in `shared/content.js` für die Musik-JSON).

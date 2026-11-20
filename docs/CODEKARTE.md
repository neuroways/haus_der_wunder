# Codekarte · 2D-PWA `home/` (v0.6.72)

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
2. Daten und Medien: `data.js` (`window.CARDS`) → `image-profiles.js` (`EMFDImages`, registriert den Service Worker) → `../media/media-loader.js` (Loader) → `media-bridge.js` → `offline-ready.js` → `media-core.js` → `media-catalog.js` → `media-recovery.js`
3. Karten: `card-motion.js`, `card-preload.js`, `card-draw.js`, `device-light.js`, `card-tap.js`
4. Räume: `atelier-hand.js`, `atelier.js`, `teezimmer.js`
5. Gemeinsame Dienste: `data/registry.js` (Registerdaten, erzeugt) → `shared/registry.js` (Registerdienst) → `emfd-ui/js/emfd-ui-kit.js` (Bedienelemente, klassisch) → `shared/lights.js` → `shared/scene.js` (Szenenkomponente) → `shared/devices.js` (Geräteregister, vor der Navigation), `shared/navigation.js`, `shared/stations.js`, `shared/audio.js`, `shared/content.js`, `shared/readers.js`, `shared/help.js`
6. Musik: `music-discovery.js`, `music-device.js`, `music-books.js`, `music-room.js`, `room-music.js`, `device-station.js` (Station `device`)
7. `entrance.js` (Eingang + Einführung) → `feature-registry.js` → **`app.js`** (lädt `start-gate.js` dynamisch nach) → `settings.js` → `audio-session.js` → `music-player.js` → `start-tour.js` → `music-entry.js` → `card-interaction.js` → `origin-story.js`
8. Module: `library/library-entry.js`, `emfd-ui-runtime.js`
9. `thought-qr.js`, `thought-paper.js`, `book-reading.js`, `music-help.js`, `shared/help-dialog.js`, `navigation-icons.js`

Wichtig: `app.js` läuft **vor** `music-player.js`. Code in `app.js`, der `EMFDMusic` braucht, muss optional zugreifen (`window.EMFDMusic?.…`) oder auf `emfd:music-ready` warten.

## 3. Routen → Renderer

Router: `app.js` `render()` (ca. Zeile 181). Erlaubte Routen prüft zusätzlich `shared/navigation.js` `route()`. **Eine neue Route muss an beiden Stellen ergänzt werden.** Raum- und Geräteadressen (`#flur`, `#ort/P0x`, `#atelier`, `#teezimmer`, `#musik`, Gerätestationen samt Aliasen) stehen seit BOOK-01a im Register (Abschnitt 4a), nicht mehr im Code.

**Neue Adressen (BOOK-01a):** `#raum/<RAUM>/<ANSICHT>` (z. B. `#raum/H00/C01`, `#raum/P05/C02`), `#raum/<RAUM>` (= erste Ansicht) und `#geraet/<GERÄT>` (z. B. `#geraet/MP-P04`). `render()` ersetzt sie am Anfang über `EMFDRegistry.redirect()` durch die Adresse der Ansicht, die sie heute zeigt (`#flur`, `#ort/P05`, `#atelier/geraet` …), mit `EMFDNavigation.replace` ohne Verlaufseintrag. Räume ohne bisherige Ansicht (EXT, KUE, SCH, BAD) und unbekannte IDs führen in den Flur. Die Navigation behandelt die neuen Adressen wie ihr Ziel (`canon()` in `shared/navigation.js`). Mit der Szenenkomponente (BOOK-01b/c) dreht sich das um: dann sind `#raum/…` die eigentlichen Adressen.

| Route | Renderer | Bemerkung |
|---|---|---|
| `#ankommen` (leer) | `app.js` → `EMFDEntrance.render(main,{sceneId:'EXT-C01',arrival:true})` | Seit BOOK-01d: Erstbesuch = Eingangsszene EXT-C01 (Mitte) mit Willkommenskarte; Folgebesuch (`EMFDEntrance.isReturning()`) → `#flur` ohne Verlaufseintrag. |
| `#raum/EXT/C01`, `#raum/EXT/C02` | `EMFDEntrance.render` (Szenenansicht) | Eingang und Garten; Umdrehen ersetzt die Adresse (`EMFDNavigation.replace`), eine Ansicht = ein Rückweg. Szenenfähige Räume erkennt `EMFDRegistry.isSceneRoute()` (Raumadresse beginnt mit `#raum/`). |
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
| `#ort/P0x/geraet`, `#atelier/geraet`, `#teezimmer/geraet` | Station `device` (`device-station.js`), Gerät aus `EMFDDevices.forRoute()` | Gerätestation (PLAYER-01). Öffnen startet nichts. Ersatz-Rückweg: zugehöriger Raum. |
| `#musik/geschichten`, `…/Oxx` | Station `compositions` (`music-room.js` → `music-books.js` → `library/library.js`) | Regal mit 24 Kompositionsgeschichten. |

Nach jedem Render (Ende von `render()`): Raummusik einhängen (`EMFDRoomMusic.mount` für P01–P08), Kontext-Zurück (`EMFDFeatures.addContextBack`), Seitentitel, `EMFDUI.enhance`, Kartenbewegung, `EMFDNavigation.ready()`.

## 3a. Rückwege (EMFD-NAV-01, v0.6.67)

- **Jede untergeordnete Ansicht hat genau einen Rückweg**, erzeugt mit `EMFDNavigation.backLinkMarkup(fallback)` (in `app.js` über die Hilfsfunktion `backLink(fallback)`). Sichtbar: Pfeil (`assets/music-icons/arrow-left.svg`) + Zielname; zugänglich: „Zurück zum/zur …“ (`describe()` in `shared/navigation.js`). Stil: `body a.emfd-back` in `design-system-v0.6.64.css`. Keine festen Rücklinks mehr; `EMFDFeatures.addContextBack` ist leer, `navigation-icons.js` macht aus Rücklinks keine Türen mehr.
- **Ziel:** tatsächliche Herkunft aus dem Navigationskontext. Blättern innerhalb derselben Ansicht (`sameView`, z. B. `#atelier/tisch/O02 → O03`, `#karte/verdeckt → #karte/O07`) behält den Rückweg der Ansicht. Ohne gültige Herkunft greift `fallbackFor()`: Räume P01–P08 → `#raeume`, `#raeume`/`#karten`/`#musik` → `#flur`, `#musik/playlist` und Geschichten → `#musik`, Einzelkarte → `#karten`. Der Fallback der aufrufenden Ansicht wird als Argument übergeben.
- **Browserverlauf:** `createHistoryMirror` spiegelt den Verlauf des Tabs (Index in `history.state.emfdNav`, Liste in sessionStorage `emfd.nav.history.v1`). Klick auf `[data-emfd-back]` → `EMFDNavigation.back()`: Ist das Ziel der vorherige Eintrag (Schritte derselben Ansicht übersprungen), `history.go(-n)`; sonst `location.replace` (kein neuer Eintrag). Back/Forward werden über `history.state` als Wechsel im Verlauf erkannt und nie erneut gepusht. Nach einem Reload ist die Herkunft aus dem gespiegelten Verlauf bekannt.
- URL ersetzen ohne Verlaufseintrag: `EMFDNavigation.replace(route)` (nicht `history.replaceState(null,…)`, das löscht die Markierung).
- Neue Ansicht mit Rückweg: im Markup `backLinkMarkup('<fallback>')` einsetzen, Fallback in `fallbackFor` ergänzen, ggf. `viewKey`/`describe` erweitern. Tests: `tests/nav-01-back-navigation.test.cjs` (simulierter Browserverlauf).

## 4. Gemeinsame Dienste (nur einmal vorhanden, nie duplizieren)

| Global | Datei | Zweck |
|---|---|---|
| `EMFDNavigation` | `shared/navigation.js` | Routen prüfen, `go(route,{origin,returnTo,kind,trigger})`, `back(fallback)`, `returnRoute(fallback)`, `backLink(fallback)` → `{target,name,label}`, `backLinkMarkup(fallback)`, `replace(route)` (URL ersetzen ohne neuen Eintrag), `place(route)` (Ort P01–P08/flur/raeume/musik/ankommen oder `null` für Karten, Galerie, Geschichten), `fallbackFor(route)`, Rückkehr mit Fokus/Scroll. Sendet `emfd:navigation`. Siehe Abschnitt 3a. |
| `EMFDStations` | `shared/stations.js` | Lebenszyklus für Ansichten mit `render/leave`. Registriert: `gramophone`, `records`, `compositions`, `library`. |
| `EMFDAudio` | `shared/audio.js` | Lese-Port und Befehle (`command('play'|'pause'|'stop'|'next'|'previous'|'repeat'|'volume'|'silence')`, `select`, `playlist(ids,{explicit,startId,context})`, `subscribe`). `snapshot().context` = Wiedergabekontext. Eigentümer ist `EMFDMusic`. |
| `EMFDRegistry` | `shared/registry.js` | **Registerdienst** (BOOK-01a), siehe 4a. |
| `EMFDDevices` | `shared/devices.js` | **Geräteregister** (einzige Liste der Musikgeräte, Daten aus `EMFDRegistry`; nur Geräte mit App-Adresse): `list`, `get(id)`, `forRoom(roomId)`, `forRoute(hash)`. Felder: `id` (MP-P0x), `roomId`, `route`, `roomRoute`, `name`, `to`/`article`/`at` (Grammatik), `mode`, `image`, `tracks`, `description`. Zusätzlich `objectName` (Objektbeschreibung aus dem Register) und `mediaId`. Muss mit `room-music-map.json` (bestätigte Zuordnung) übereinstimmen; Test prüft das. |
| `EMFDDeviceStation` | `device-station.js` | Gemeinsame Gerätestation (`render/leave`, `start(deviceId,{startId})` = bewusster Start mit Wiedergabekontext, `view(snapshot,device)`). |
| `EMFDMusic` | `music-player.js` | **Der einzige Player** (Dialog `#music-dialog`, Hintergrundmusik, Raum-Warteschlange, Stille, Lautstärke, verdeckte Karte still). Nutzt `EMFDAudioSession` (`audio-session.js`). **Wiedergabekontext** `playContext` (`{source:'device',deviceId,roomId,queueKey}` oder `null`): gesetzt nur bei bewusstem Start mit `context`, bleibt beim Weiterschalten derselben Gerätewarteschlange, wird bei jeder anderen Titelwahl gelöscht. Pausiert nie wegen Navigation (W1). |
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

## 4b. Szenen und Bedienelemente (BOOK-01b-Kern / BOOK-01d, v0.6.72)

- **`EMFDScene.mount(host,{sceneId,segment,onAction,onSegment,onTurn,lights})`** (`shared/scene.js`): Bildmaster per Medien-ID (`EMFDRegistry.sceneMedia`) oder Platzhalter; Hotspots normalisiert (wandern mit dem Bild); ab 900 px Breite ganze 16:9-Illustration (`is-wide`), sonst drei überlappende Ausschnitte L/M/R (frei wischbar, sanftes Einrasten, Pfeile, Punkte nur zur Orientierung); Umdrehen L→R, R→L, M→M in die `gegenansicht`, nur auf Klick; Aktionsliste „Alles in dieser Ansicht“. Controller: `segment`, `setSegment`, `turn`, `visibility(id)`, `mark(ids)`, `setLight`, `hintHost()`, `barHost()`.
- **Gemeinsame Bedienelemente** (`emfd-ui/css/emfd-ui.css` v0.4 + `emfd-ui/js/emfd-ui-kit.js` → `EMFDUIKit`): Text-/Iconbuttons, Hotspot, Hinweis, Umschaupfeile, Positionspunkte, Umdrehen, Chips, Aktionsliste, Paneel, Musiksteuerung. Referenz und Regeln: `emfd-ui/referenz.html`. **Neue Ansichten nutzen nur diese Komponenten** (Entscheidung „Neue Oberfläche“). 48 × 48 px, Fokus, ARIA-Zustände.
- **Lichter** `EMFDLights` (`shared/lights.js`): `get/set/toggle(id)` je physischer Licht-ID (`LIGHT-…`), Standard an; Flurlicht bleibt `EMFDHallLight`. Sichtbarer Aus-Zustand ist bis zu den Lichtmasken von Work ein Platzhalter (`data-placeholder="lichtmaske"`).
- **Szenenmedien des Eingangs**: `scene.EXT-C01.tut02-referenz` / `scene.EXT-C02.tut02-referenz` (`media/rooms/szenen/…-tut02-ref-<sha8>.jpeg`, unveränderte Referenzen aus TUT-02, `freigabe:'test'`), gesetzt über `registry-app.json` → `szenen` (Override, K-21). Hotspots sind an diesem Master gemessen (`hotspotMaster`).

## 4a. Register (EMFD-BOOK-01a, v0.6.70)

- **Quelle:** die gemeinsamen Register in `neuroways/haus-der-wunder` (`manifests/rooms.json`, `scenes.json`, `music-devices.json`, `objects.json`, `media.json`) plus die App-Felder in `home/data/registry-app.json` (Adressen und Aliase, Artikel/Präpositionen für Ansagen, Texte der bisherigen Raumansichten, Stücklisten, ausgelieferte Mediendateien unter `../media/`).
- **Erzeugen:** `node tools/build-registry.mjs [--manifests <Pfad>]` (Standard: `../haus-der-wunder/manifests` neben dem App-Repo) schreibt `home/data/registry.js` (`EMFD_REGISTRY`) und den Notfallbestand zwischen `FALLBACK:BEGIN/END` in `home/shared/registry.js`. `--check` meldet veraltete Dateien. Das Werkzeug bricht ab, wenn App-Felder auf unbekannte Räume, Geräte, Objekte oder Medien zeigen oder eine Adresse doppelt vergeben ist. **Nie von Hand ändern.**
- **Auslieferung:** als Skript mit der App (kein Nachladen zur Laufzeit). Fehlt `data/registry.js` oder ist es ungültig, gilt der Notfallbestand (Räume und Geräte mit Adresse, deren Bilder); ungültige Einzeleinträge werden übersprungen (`EMFDRegistry.warnings`). `EMFDRegistry.source` = `register` | `notfall`.
- **API:** `rooms()`, `room(id)`, `directory()` (Raumübersicht P01–P08), `scenes(roomId)`, `scene(id)`, `devices()`, `device(id)`, `deviceForRoom`, `deviceForRoute`, `roomForRoute`, `objects()`, `media(id)`, `resolveMedia(id)` → `{type:'file',src,width,height}` oder `{type:'placeholder',id,width,height,ratio}`, `sceneMedia(sceneId)`, `mediaMarkup(id,{alt})`, `placeholderMarkup(id)`, `resolveRoute(hash)` (→ `canonical`, `target`), `redirect(hash)`, `create(data)` (für Tests).
- **Medien:** Ansichten kennen nur Medien-IDs. Ohne Datei zeichnet `placeholderMarkup` eine beschriftete SVG-Fläche (Medien-ID, Pixelmaß, Seitenverhältnis), keine Bilddatei. Fertiges Bild einsetzen = `datei` in `registry-app.json` → `medien` eintragen (mit `register`-Verweis auf die Medien-ID) und neu erzeugen; kein Code.
- **Medienstatus (D-13/W7):** je Medium `produktion` (Skala aus `media.json`), `verfuegbarkeit` (`vorhanden`/`fehlt`, aus der Auslieferung), `integration` (`original`/`platzhalter`). Freigabe und Verifikation folgen (Vorschlag K-16).
- **Namen:** Raumname aus `rooms.json`, Anzeigename des Flurs (H00) „Flur“ aus den App-Feldern; Geräte: `anzeigename` aus `music-devices.json` (W4), `name` dort ist die Objektbeschreibung.

Weitere Modul-APIs: `EMFDAtelier` (atelier.js: `renderAtelier`, `renderTable`, `renderGrid`, `returnTarget`, `rememberReturn`, `selectGroup`), `EMFDTeezimmer`, `EMFDRoomMusic` (`mount`), `EMFDMusicRoom`, `EMFDMusicDevice` (Plattenspieler-Markup, Icons), `EMFDMusicDiscovery` (Filter, Varianten), `EMFDMusicBooks`, `EMFDMusicEntry` (Musikfrage beim ersten Besuch), `EMFDStartTour`, `EMFDStart02` (Start, Geschenkbrief), `EMFDLibrary`, `EMFDHandy`/`EMFDCardMotion` (Bewegung), `EMFDCardAssets` (Vorladen), `EMFDCardTap`.

## 5. Bereiche im Detail

### Karten
- Daten: `data.js` → `window.CARDS` (24 Einträge). Felder: `id, name, group, image, alt, imageWidth, imageHeight, imageSourceId, impulse, interpretation, depth, houseStory, question, anchor, textStatus …`. `image-profiles.js` ersetzt beim Laden `image`/`imageOverview`/`imageDetail` durch PERF-01-Varianten; `media-bridge.js` danach durch r2-Vorderseiten aus dem Manifest v2 (falls vorhanden).
- Karte in der Hand: `app.js` `heldCard`, `bindMotion` (Antippen dreht nach 280 ms, Doppeltipp öffnet Buch, Wischen/Bewegen kippt). Nahansicht: `card-interaction.js`.
- Kartenbuch: `app.js` `openCardText`/`showReadingPage`, Seiten `impulse`, `depth`, `question` (`readingKeys`). Frageseite enthält den Gedankenblatt-Einstieg (`data-thought-card`).
- Zufall/Tageskarte: `EMFDFeatures.randomCard()` → `EMFDCardDraw.begin()` → `#karte/verdeckt` → Umdrehen → `EMFDMusic.revealCard`.
- Rückweg aus der Karte: `EMFDAtelier.returnTarget()` (sessionStorage `emfd.card.return`) bzw. `returnTarget` der verdeckten Ziehung.

### Räume
- Raumdaten P01–P08: `ROOMS` in `app.js` wird aus `EMFDRegistry.directory()` gebaut (Name, Adresse, Orientierungssatz, Alt-Text, Bild, Vorschau); Musikzimmer-Kachel aus `EMFDRegistry.room('M01')`.
- Funktionen pro Raum: `feature-registry.js` `roomFeatures`. P04 und P08 rendern ihre Knöpfe selbst, die anderen bekommen sie über `mountRoom`.
- Musik pro Raum (seit PLAYER-01): `room-music.js` zeigt „<Gerät> ansehen“ (Link zur Gerätestation) und die Stückliste; „Musik abspielen“ = `EMFDDeviceStation.start`, „Geschichte lesen“ = Buchdialog. Daten aus `EMFDDevices`. Frühere Fassung: `room-music.js` + `room-music-map.json` (Karten-Stücke, Gerätename, Gerätebild). Antippen des Geräts baut den gemeinsamen Plattenspieler (`EMFDMusicDevice.device`) und tauscht dessen Korpus gegen das Gerätebild; im Modus `.room-device-art` (`room-music.css`) sind Plattenteller, Tonarm und Cover ausgeblendet, darunter Titelschild und Steuerung (zurück, Start, Stopp, weiter, Wiederholen). Startet die Raum-Playlist. Wiedergabe über `EMFDMusic`. Die Gruppe heißt für Screenreader noch „Schallplattenspieler“.
- Bibliothek P02: `library/library-entry.js` (Station `library`) + `library/library.js` + `library/catalog.js` (Bücher, Status).
- Flur: `renderHall()` in `app.js`; Starttour beim ersten Betreten: `start-tour.js` (6 Schritte).

### Musik
- Audiodateien (seit v0.6.69, Musikmanifest v1.2): Schema `<Karte>-M<Stück>[-V<Version>].mp3`. `M01` gibt es für jede Karte; `M02`, `M03` … nur, wenn eine Karte mehrere Stücke hat; `-V02`, `-V03` … sind weitere Versionen desselben Stücks, die erste Version (V01) steht ohne Zusatz im Namen (z. B. `O16-M01.mp3`, `O16-M01-V02.mp3`). Die App spielt je Karte `../media/audio/O##-M01.mp3`, Hauptthema `THEME-M01.mp3`; Asset-IDs in der App bleiben `O01`…`O24`, `T03`. Zusatzfassungen O03-M02, O16-M02, O16-M01-V02 liegen auf dem Server, sind aber noch nicht eingebunden. Audio liegt nicht im Repository (öffentlich; Musik nicht freigegeben, `.gitignore`).
- Daten: `music-manifest.json` (Audiospuren), `card-music-map.json` (Karte → Spur), `playlist-catalog.json` (25 Einträge: T03 + O01–O24), `music-discovery.json` (Stile, Instrumente, Cover, Varianten), `composition-stories.json` (24 Geschichten), `composition-story-media.json`.
- Ablauf: Auswahl → `EMFDAudio.select(id,{play})` → `EMFDMusic` → `EMFDAudioSession`. Nie Autoplay; `globalSilence` hat Vorrang.
- Erster Besuch: `music-entry.js` fragt „mit/ohne Hintergrundmusik“ (Speichern nur auf Wunsch).

### Start und Ankommen (seit BOOK-01d / EMFD-UX-TUT-02, v0.6.72)
- **Eingang** `entrance.js` (`EMFDEntrance`): Szenen EXT-C01 (Fassade: Tür, Wandlaterne, Bodenlaternen, Glocke, Brief) und EXT-C02 (Garten: Brücke O15, Gartentor O09) über `EMFDScene`. Hotspots, Ziele und Tutorialtexte kommen aus dem Register (`scenes.json` → `hotspots`, `manifests/quellen/szenen-hotspots.json` → `tutorial`, `glocke`).
- **Einführung**: nur nach „Bedienung kennenlernen“ (Willkommenskarte) oder Hilfe → „Einführung erneut starten“. `nextHint(tutorial,ctx)` wählt den nächsten Hinweis (Empfehlung, kein Gate): Umschauen → Umdrehen am Rand bzw. breit → Garten → Prinzip → Brücke/Tor (sichtbar, beliebige Reihenfolge) → Weiteres → Hilfe → Zurück → Licht/Brief/Glocke (sichtbar, beliebig) → Eintreten. Höchstens ein Hinweis; jeder schließbar, ohne die Funktion auszulösen. „Einführung beenden“ oben rechts.
- **Aktionen** (vorhandene Module): Licht → `EMFDLights`; Brief → `EMFDStart02.openGift()`; Glocke → Paneel mit Hauptthema (`EMFDAudio.select('T03')`) und Musikentscheidung (`EMFDMusicEntry.apply`); Brücke/Tor → Gegenstandspaneel (Karte `#karte/Oxx`, Musik über `EMFDAudio`, Geschichte `EMFDReaders.openComposition`); Tür → `enterHouse()`: Ziel aus der Szenenkonfiguration (`H00-C01`), bis die Halle szenenfähig ist per Register-Umleitung `#flur`. Kein Autoplay beim Betreten.
- **Geschenkbereich** `start-gate.js` (`EMFDStart02`): Ebene `#start02-gift-dialog` über der aktuellen Ansicht: Umschlag → Brief (setzt `emfd.start02.gift-completed.v1`) → Geschenkkarte mit QR-Rückkehrlink (Rückseite, `EMFDStartTour.qrSVG`) → Schließen (Szene und Ausschnitt bleiben). Aufrufe: Brief-Hotspot, Hilfe („Geschenkbrief und Geschenkkarte“), Flur-Hotspot `data-start-gift-open`. Installationshilfe `showInstallHelp()` nur manuell (Hilfe „Das Haus griffbereit“, einmaliger Textlink im Hilfehinweis).
- `start-tour.js` startet nicht mehr automatisch; es liefert nur noch `qrSVG`/`giftURL` für die Geschenkkarte. Die frühere Haustür (`renderDoor`) und die Musikfrage im Ablauf sind entfernt; der Musikdialog `music-entry.js` bleibt für die Einstellungen.

### Gedankenblatt
- `thought-paper.js`: `open({mode:'card',cardId}|{mode:'free'})`. Keine Speicherung, kein Netzwerk. Export: Canvas → PNG oder selbst gebautes PDF (`pdfFromCanvases`), QR mit Rückkehrlink (`thought-qr.js`).
- Einstieg nur über die Frageseite einer Karte. Modus `free` ist ohne Einstieg (Entscheidung).

## 6. Speicher-Schlüssel und Ereignisse

**localStorage:** `emfd.entrance.v1` (entrance.js: `welcomeDismissed`, `entered`, `tutorial:{active,seen,gardenVisited}` – nur Eingang/Einführung) · `emfd.lights.v1` (shared/lights.js: Ein/Aus je Licht-ID) · `emfd.house.light.v1` (app.js) · `emfd.reading.size.v1` (book-reading.js, reading-preferences.js) · `emfd.music.mode`, `emfd.music.startOnEntry`, `emfd.music.volume`, `emfd.music.globalSilence` (music-player.js) · `emfd.music.entryPreference` (music-entry.js) · `emfd.start02.gift-completed.v1`, `emfd.start02.tutorial-completed.v1`, `emfd.start02.install-dismissed.v1`, `emfd.start03.intro-completed.v1` (start-gate.js) · `emfd.card.motionHint.v1.*` (card-motion.js) · `emfd-media-bridge` (Notbremse, media-bridge.js).

**sessionStorage:** `emfd.scene.view.v1` (Szene + Ausschnitt für die Rückkehr) · `emfd.nav.history.v1` (Verlaufsspiegel, nur Routen) · `emfd.cardDraw.concealed` · `emfd.card.return` · `emfd.atelier.current|direction|gridScroll|group` · `emfd.music.entryPreference.session`.

**Ereignisse (window):** `emfd:light-change` · `emfd:gift-closed` · `emfd:install-dismissed` · `emfd:navigation` · `emfd:music-ready` · `emfd:music-state` · `emfd:music-availability` · `emfd:card-concealed` · `emfd:card-revealed` · `emfd:hall-light-change` · `emfd:start-gate-rendered` · `emfd-media-updated` · `emfd-offline-progress`. Am Kartenelement: `cancel-card-tap`.

## 7. Medien

- Regeln: `media/MEDIEN-KONVENTION.md`. Ausschließlich relative Pfade `../media/…`.
- Schichten: `image-profiles.js` (feste PERF-01-Varianten, generiert) → `media-bridge.js` (r2-Vorderseiten und Cover aus `../media/manifest.json` v2, falls vorhanden) → bei Ladefehler `media-recovery.js` mit Gruppen aus `media-catalog.js` (`media-core.js` sucht Alternativen) → zuletzt Ersatzbilder in `home/assets/recovery/`.
- Offline-Cache (EMFD-CACHE-01), Service Worker `image-service-worker.js` (Registrierung in `image-profiles.js`, `updateViaCache:'none'`). Regeln in `offline-policy.js`, Listen in `offline-precache.js` (App-Dateien, **generiert**: `node scripts/build-offline-precache.mjs` nach jeder Änderung an `index.html`/Dateistruktur; Test prüft Aktualität) und `offline-images.js` (Bildliste der App, Stufe `start`/`house`). Seitenseite `offline-ready.js` (`EMFDOffline.status()`, Ereignis `emfd-offline-progress`, keine sichtbare Anzeige).
  - Caches: `emfd-shell-<VERSION>` (App-Dateien, Netz-zuerst für HTML/`manifest.json`), `emfd-media-images-v1` und `emfd-media-audio-v1` (versionsübergreifend, keine Größengrenze). Alte `emfd-images-*` werden beim Update übernommen.
  - **Bilder aus dem Register:** Der Worker lädt zusätzlich `data/registry.js` und nimmt über `EMFDOfflinePolicy.registerImages()` alle Medien auf, die als Original ausgeliefert sind (`integration:'original'`, `verfuegbarkeit:'vorhanden'`, `datei` gesetzt). Platzhalter werden nie aufgenommen. Medien von Räumen der Ebene AUSSEN (Eingang) kommen in Stufe `start`, alle übrigen in `house`. Ein neues Szenenbild wird damit offline verfügbar, sobald es im Register ausgeliefert ist: `registry-app.json` eintragen und `node tools/build-registry.mjs` laufen lassen. `offline-images.js` bleibt nur für Karten, Rückseiten und Startbilder (PERF-01) zuständig.
  - App-eigene Grafik unter `assets/` liegt im App-Cache. Der Bild-Handler sieht dort nach, bevor er das Netz fragt; das betrifft z. B. den Rückweg-Pfeil.
  - Installation: alle App-Dateien + Startbilder. Nach dem Start: alle Hausbilder im Hintergrund (plus aktuelle Vorderseiten aus `media-bridge.js`). Hash-Dateinamen werden nie erneut geladen.
  - Musik: kein Vorab-Laden. Erste Wiedergabe streamt aus dem Netz, parallel einmalige Speicherung; danach Wiedergabe aus dem Cache mit Range/206. HEAD-Prüfung (ETag/Länge) verwirft geänderte Dateien gleichen Namens.
  - Neue App-Version: `VERSION` in `offline-policy.js` und `?v=` der Registrierung erhöhen, dann Liste neu erzeugen (seit v0.6.71: `cache01-v2`).
  - **Feste Regeln:** Nach jeder Änderung an `index.html` oder der Dateistruktur `node scripts/build-offline-precache.mjs` ausführen. Cache-Namen `emfd-media-images-v1`/`emfd-media-audio-v1` nie umbenennen. Kein Audio-Vorabladen. Keine Lade- oder Fortschrittsanzeige.
  - Größe (Browserprüfung 19.11.2026): 223 Bilder, rund 42 MB einmalig. 4 Dateien fehlen auf dem Server und werden übersprungen (Kartenrückseite v1.2 in drei Größen und als JPEG).
- Raumgeräte-Bilder: `../media/raumgeraete/P0x.webp`, als Medien-IDs `app.device.MP-P0x` im Register (noch nicht im Medienmanifest).
- Raumbilder P01–P08 und Musikzimmer: Medien-IDs `app.room.<RAUM>` / `app.room.<RAUM>.thumb` im Register, verknüpft mit den Einträgen in `media.json`. Szenenbilder (`scene.<RAUM>-C0x.kandidat`) liegen nur im gemeinsamen Repo, nicht auf dem Server → Platzhalter.

## 8. CSS-Schichten

Reihenfolge in `index.html`; spätere Dateien überschreiben frühere. Zuletzt geladen und damit bestimmend: `desktop-layout.css` → `design-system-v0.6.64.css` (einheitliche Größen/Typografie) → `music-device.css` → `arrival-cleanup-v0.6.65.css`. `app.js` lädt zusätzlich `emfd-fe07.css` und `immersive-v0.6.32.css`. Raumspezifisch: `atelier.css`, `teezimmer.css`, `room-music.css`, `music-room.css`, `library/library.css`, `thought-paper.css`, `book-v2.css`, `card-text-v1.3.css`, `card-interaction.css`, `start-gate-v0.6.61.css`, `start-tour.css`. Grundrahmen: `emfd-shell.css`, `emfd-scene.css`, `emfd-ui/css/emfd-ui.css`. Neue Regeln in die zuständige Raumdatei oder `design-system-v0.6.64.css`, nicht in eine weitere Datei.

## 9. Tests (`home/tests/`, `npm test`)

Reine Node-Tests (`node:test`), kein Browser. Viele lesen Quelltext per Regex, neuere laden Module per `vm` (`tests/helpers/arch-runtime.cjs`). Zuordnung nach Bereich:
- Architektur/Dienste: `architecture-*`, `runtime-render`
- Karten: `card-*`, `card-texts-v1.3`, `fe05-needs-gallery`, `fe08-entry-preload`
- Atelier: `atelier-*`; Teezimmer: `teezimmer-*`; Häuser/Räume: `house-01-integration`, `immersive-navigation`, `navigation-regression`
- Musik: `music-*`, `audio-session`, `app-theme-t03`, `room-music-integration`, `composition-stories-v04`
- Eingang/Einführung/Szene/Bedienelemente: `book-01d-entrance`, Geschenkbereich: `start-adventure`
- Register/Routen: `book-01a-registry` (Alias-Matrix, neue Adressen, Platzhalter, Rückfall, Notfallbestand), `nav-01-back-navigation`, `player-01-devices`
- Bücher/Bibliothek: `library-*`, `origin-storybook`, `reading-choice-icons`, `thought-book-v0.6.56`
- Gedankenblatt: `thought-paper-*`; Start: `start-*`, `arrival-cleanup-v0.6.65`; PWA/Paket: `pwa-install-01`, `package-layout`, `server`, `ui-architecture-v0.6.64`, `fix01-user-requirements`
- Medien-Tests prüfen echte Dateien unter `../media/` (seit 19.11.2026 im Repo).

Versionsangaben in Tests nie fest eintragen, sondern aus `package.json` lesen.

## 10. Wo setze ich an? (Rezepte)

- **Funktion in einem Raum ergänzen/entfernen:** `feature-registry.js` `roomFeatures` (und ggf. `features`). Für P04/P08 das Markup in `atelier.js`/`teezimmer.js`.
- **Neuen Raum / neue Ansicht:** Eintrag in den gemeinsamen Registern (`rooms.json`, `scenes.json`), App-Felder (Adresse, Texte, Bilder) in `home/data/registry-app.json`, dann `node tools/build-registry.mjs`. Funktionen in `feature-registry.js` `roomFeatures`. Eine eigene Ansicht braucht bis BOOK-01b noch einen Renderer in `app.js`. Tests `house-01-integration` prüfen derzeit „kein P09“.
- **Texte einer Karte:** `data.js` (eine Zeile JSON). Buchseiten zeigen `impulse`, `depth`, `question`.
- **Musik einem Raum zuordnen:** `registry-app.json` → `geraete.<ID>.stuecke`, neu erzeugen; `room-music-map.json` (bestätigte Zuordnung) muss übereinstimmen (Test).
- **Hilfetext:** `EMFDHelp.register` im zuständigen Modul (siehe `music-help.js`).
- **Neues Musikgerät:** Eintrag in `music-devices.json` (mit `anzeigename`), App-Felder (Adresse, Artikel, Bild, Stücke) in `registry-app.json` → `geraete`, neu erzeugen; Navigation, Station und Raumansicht übernehmen es automatisch.
- **Neue Route:** `app.js` `render()` + `shared/navigation.js` `route()`/`station()`; Titel in `titles`.
- **Neue Ansicht mit Lebenszyklus:** als Station über `EMFDStations.register(id,{render,leave})`.
- **Rückweg einer Ansicht:** `backLinkMarkup(fallback)`, siehe 3a. Keine festen `href`-Rücklinks.

## 11. Fallstricke

- **Zwei Globale namens `EMFDMedia`:** `../media/media-loader.js` setzt den Loader, `media-bridge.js` greift ihn sofort ab, danach überschreibt `media-recovery.js` den Namen mit dem Ersatzbild-Dienst. Reihenfolge in `index.html` nicht ändern.
- Registerdaten nie von Hand ändern; `tools/build-registry.mjs` erzeugt `data/registry.js` und den Notfallbestand gemeinsam (Test `book-01a-registry` prüft die Gleichheit).
- `app.js` ist ein großes Skript mit sehr langen Zeilen; Änderungen mit eindeutigen Textstücken vornehmen und danach `node --check app.js`.
- Start: `#ankommen` und `#raum/EXT/…` rendert `entrance.js` (über `app.js`); `start-gate.js` rendert keine Startseite mehr, nur den Geschenkbereich als Ebene.
- Szenenmodus (`body.scene-mode`) macht `main` vollflächig (`emfd-scene.css`); Musikmeldungen rücken dort nach oben, damit sie keine Hinweise verdecken.
- Alte Pfade wie `../media/cards/Oxx.png` und `rooms/varianten/` stehen noch in Daten und Katalogen; tatsächlich angezeigt werden die optimierten Varianten aus `image-profiles.js`.
- Kartenrückseite: App nutzt `../media/cards/rueckseite.jpeg`; die in Katalog/Fallback genannte v1.2 fehlt auf dem Server.
- `home/assets/recovery/` enthält Medienkopien (Konventionsverstoß, bewusst noch nicht entfernt).
- Geänderte Dateien brauchen einen neuen `?v=` in `index.html` (bzw. in `app.js` für `start-gate.js`, `emfd-fe07.css`, `immersive-v0.6.32.css`; in `room-music.js` für `room-music-map.json`; in `shared/content.js` für die Musik-JSON).

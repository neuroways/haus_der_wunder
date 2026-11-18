# Tatsächlicher Ausgangszustand

Untersucht wurde der ausgelieferte Referenzordner, nicht nur eine Entwurfsspezifikation. Die folgenden Angaben beschreiben den Zustand **vor ARCH-01**; Änderungen stehen im Migrationsprotokoll.

## Module und Schnittstellen

| Modul | Tatsächliche Aufgabe / Aufrufe |
|---|---|
| `app.js` | Zentraler Hash-Router, ersetzt `main.innerHTML`, Fokus und Seitentitel; ruft `EMFDMusicRoom.render(main, view)` sowie `EMFDLibrary.mount(root)` auf. |
| `music-room.js` | Lädt Playlist und Beschreibungen, erweitert Varianten über `EMFDMusicDiscovery.expand`; lädt Geschichten/Medien und ergänzt Cover. Rendert Grammophon, Sammlung, Regal und Direktgeschichte. Registriert Stücke und bindet den zentralen Player; ruft das gemeinsame Bibliotheksmodul über `EMFDMusicBooks.mount` auf. |
| `music-device.js` | HTML für Gerät und Icons; `bind(host,data)`, `device(item)`, `sync(host,session,id,ready,recordPlaced)`. Die gebundenen Stücke lagen modulweit in einem einzigen Array, auch für das Tutorialgerät. |
| `music-books.js` | `createBook(story,cover)`, `openStory(story,cover,trigger)`, `mount(host,stories,media,selectedId)`. Teilt originale Absätze auf Buchseiten auf; importiert `library/library.js`, öffnet `EMFDOriginStory.open` mit `books` und `pageNavigation:true`. Kein eigener Leser. |
| `music-help.js` | Ersetzt `#help-open.onclick` durch eine Hülle um den vorhandenen Handler; wählt drei Musiktexte anhand des Hashs. Verwendet denselben Hilfedialog. |
| `audio-session.js` | Zustandsmaschine mit `select`, `play`, `pause`, `stop`, `setVolume`. Eine `media`-Instanz wird beim ersten Vorbereiten erzeugt und wiederverwendet. Epochenschutz verwirft veraltete Wiedergabeversprechen und Events. |
| `music-player.js` | Einziger produktiver `new Audio()`-Aufruf als Factory einer einzigen `AudioSession`. Besitzt Auswahl, Lautstärke, Stille, Wiederholmodus, Playlist, Verfügbarkeitsprüfung und Gerätebindung. Globales `EMFDMusic` bietet Befehle und einen unverdeckten `session`-Zugriff. |
| `library/library.js` | Eigenständiger Regal-/Buchrückseitenrenderer mit `mountLibrary(root,options)` und Rückgabe `showShelf`, `openBook`, `destroy`. Eigener übergebener DOM-Bereich; Buchöffnung und Kartenöffnung per Callback. |
| `library/library-entry.js` | P02-Adapter mit WeakMap, verbindet zwei lesbare Bücher mit `EMFDOriginStory.open`; Kartenbuch setzt Hash. Bücher ohne freigegebenen Volltext zeigen die bestehende Inhaltsvorschau. |
| `origin-story.js` | Bestehender gemeinsamer Buchleser, `EMFDOriginStory.open(options)`. Ursprünglich drei Bücher mit 5/13/1 Abschnitten; Kompositionsbücher werden als Daten übergeben. Schließt auf Routenwechsel. |
| `feature-registry.js` | Raum-Funktionszuordnungen und `activate`, `roomRoute`, `roomFromHash`; eigener letzter Herkunftsraum für Kontextlinks. |
| `navigation-icons.js` | Präsentationsadapter für Tür-/Platten-/Hilfezeichen; MutationObserver, keine Routing- oder Audiohoheit. |

## Tatsächliche Routen

| Hash | Vorhandene Darstellung / Vertrag |
|---|---|
| `#ankommen` | Startablauf mit Umschlag, Karte, Musikentscheidung, Brief und Tutorial |
| `#flur`, `#haus` | Flur; `haus` ist Darstellungsalias |
| `#raeume` | Raumverzeichnis |
| `#ort/P01` bis `#ort/P08` | Zimmer; P02 enthält Bibliothek, P04/P08 leiten in ihrer Darstellung an Atelier/Teezimmer weiter |
| `#atelier` | Atelier |
| `#atelier/tisch/O01` bis `O24` | Ateliergalerie mit einer konkreten Karte, keine Kategorien im Pfad |
| `#teezimmer` | Bestehendes Teezimmer |
| `#karten` | Bildkartenübersicht |
| `#karte/verdeckt` | Gezogene verdeckte Karte; ohne Ziehzustand zurück zur Übersicht |
| `#karte/O01` bis `O24` | Kartenansicht |
| `#karte/Oxx/frage` | Kartenansicht mit Frage im vorhandenen Leser |
| `#musik` | Bereits geöffnetes Grammophon, noch keine vorgeschaltete Raumübersicht |
| `#musik/playlist` | Covergalerie und kombinierte Filter, Playliststart |
| `#musik/geschichten` | Regal der 24 Kompositionsgeschichten |
| `#musik/geschichten/O01` bis `O24` | Dasselbe Regal, passende Geschichte direkt im gemeinsamen Leser geöffnet |

`#musik/player` existiert in diesem Referenzstand nicht und wurde durch ARCH-01 nicht stillschweigend eingeführt. Buchrückseiten und Buchseiten sind Dialogzustände, keine zusätzlichen Hash-Routen. Externe Links und `#main` sind keine Fachrouten.

## Zustände, Daten und festgestellte Kopplungen

- 25 kanonische Musikeinträge: Theme plus O01–O24. Die vorhandene Beschreibung erzeugt zusätzlich sieben Fassungen: 32 Sammlungseinträge, weiterhin 24 Karten-IDs und 24 Kompositionstexte. Nicht zugeordnete Fassungen haben kein bestätigtes `audioAssetId`.
- Quellen: `playlist-catalog.json`, `music-discovery.json`, `music-manifest.json`, `card-music-map.json`, `composition-stories.json`, `composition-story-media.json`; keine dieser Datenquellen wurde durch ARCH-01 inhaltlich geändert.
- Der Player und Raumrenderer luden Quellen selbst. Story-Cover-Ermittlung hing indirekt vom Playerkatalog ab. Leserzuordnungen waren im Bibliotheksadapter eingebaut; Hilfeauswahl war ein fester Musik-Hash-Schalter.
- Herkunft und Rückkehr waren mehrere getrennte Zustände: Feature-Registry, Atelier-Rückkehr und feste Musik-Links. Eine gemeinsame Tür-/Stationskennzeichnung fehlte.
- Der Audio-Hash-Handler konnte bei `#flur` ein Theme anstoßen und bei `#karten` eine laufende Sitzung stoppen. Das widerspricht den neuen ARCH-01-Grenzen.
- Musik-Renderanfragen hatten einen Zähler; ein vollständiger Austritt in eine andere Fachstation invalidierte ihn nicht durchgehend. Späte Ergebnisse konnten fremden Seiteninhalt bzw. Fokus berühren.
- Die Audiodateien sind im gelieferten lokalen Medienbestand nicht vorhanden. Transportprüfungen verwenden kontrollierte Audio-Doubles; reale Klang-, Codec- und iPhone-Audioprüfung ist damit nicht nachgewiesen.

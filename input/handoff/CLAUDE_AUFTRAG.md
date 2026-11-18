# EMFD-MEDIA-CORE-01 · Entwicklungsauftrag an Claude
Stand 18.11.2026 · Projekt Ein Moment für dich · Das Haus der kleinen Wunder

## 1. Ziel und Abgrenzung
Entwickle eine zentrale, versionsunabhängige Medienarchitektur für die bestehende 2D-PWA und alle zukünftigen 2D-/3D-Versionen. Die produktive App liegt unter https://flowisaurus.de/wunderhaus/home/; weitere Apps z. B. unter /wunderhaus/home/3d/claude/v1/, /v2/ oder /wunderhaus/home/3d/codex/v1/. Alle konsumieren dieselbe stabile URL https://flowisaurus.de/wunderhaus/media/manifest.json. Keine Medienkopien in Versionsordnern. Ziel ist eine einzige Zuordnung pro Asset-ID, keine neue Bildproduktion oder Neugestaltung der Anwendung. Keine Live-Änderung ohne gesonderte Freigabe. Die beigefügten Register sind Eingangsdaten, kein veröffentlichtes Manifest.

## 2. SERVER-FIRST – Bestandsaufnahme
1. Lies ausschließlich zuerst die aktuellen Live-Dateien /wunderhaus/home/ und vorhandene Medienmanifeste aus. Ältere Archive sind nur Vergleichsquellen; niemals rückspielen. Prüfe ob das bestehende /media/manifest.json bereits existiert; migriere additiv oder stelle eine kompatible Schnittstelle bereit. Alte Archivbasis Root/moments/ ist **nicht** der aktuelle öffentliche URL-Prefix.
2. Nutze bei Zugriff auf Serverdateien rekursive Dateiliste; andernfalls JSON, App-Referenzen, bekannte URLs und eine HTTP-Prüfung. Kein blindes Erraten von neuen Cover-Dateinamen. Falls Verzeichnislisting fehlt, fordere eine Server-Dateiliste an und kennzeichne unbekannten Bestand. Keine falschen Vollständigkeitsbehauptungen.
3. Prüfe Status, endgültige URL, Content-Type, echte Signatur/Decodierbarkeit, Größe, Bildmaße, Alpha und ggf. SHA-256; bei MP3 Range/206 und Wiedergabe testen. 200 HTML als Fehler erkennen. Rechte-/Freigabestatus nicht aus Erreichbarkeit ableiten. Unverifizierte Assets nicht als freigegeben veröffentlichen. Keine Test-Stems versehentlich in öffentlicher Playlist.
4. Prüfe aktuell vom Nutzer ersetzte Kartenvorderseiten O01–O24, neue eigenständige CD-Cover, Musik und Objektstudien gemeinsam. Aktualisierte Vorderseiten haben Vorrang vor alten PNG-/Thumbnail-Referenzen. Behalte historische Dateipfade für bestehende Anwendungen erreichbar, solange diese sie benötigen. Kein Überschreiben oder Löschen ohne Zustimmung.

## 3. Vollständiger Soll-Bestand (Stand der zugänglichen Quellen)
| Medienrolle | Anzahl | Nachweis / Erwartung |
|---|---:|---|
| Aktuelle Kartenvorderseiten | 24 | Nutzer aktualisiert; genaue neue Pfade/Dateien unbekannt. Archiv: cards/O01.png–O24.png (alt). |
| Gemeinsame Rückseite | 1 | Aktuelle Alt-App referenziert cards/EMFD_Kartenrueckseite_v1.2.jpeg; älterer Kandidat cards/rueckseite.jpeg. Nicht zwei neue Rückseiten erzeugen. |
| Eigenständige quadratische CD-Cover | 25 | O01–O24 + Main Theme T03; neueste Pfade unbekannt. Alte 160px Playlist-Thumbnails sind nur Prüf-/Fallbackkandidaten. |
| Primäre Musikstücke | 25 | audio/O01.mp3–O24.mp3 + audio/THEME.mp3 (T03). |
| Weitere Klang-/Wintervarianten | 10 | acht S01-Spuren + W01-A/B; interne Testmedien laut Altmanifest. |
| Objektbilder / Objektstudien | 24 + 24 | Projektarchiv 17.11.; unterschiedliche Ansichts- und Freigabestände. Kein fertiger 3D-Modellbestand nachgewiesen. |
| Objekt-Referenz-WebPs | 24 | objects/reference/O01.webp–O24.webp im lokalen Paket v0.1, nicht freigestellt. |
| Transparente Objekt-WebPs | 24 Ziel-IDs | Noch nicht nachgewiesen; pro Motiv Eignung prüfen. Architektur, Licht- und Bewegungsobjekte brauchen ggf. mehrere Layer oder eine Szene/3D-Geometrie statt einfacher Sprites. Keine Platzhalter als final ausgeben. |
| Kompositionsgeschichten | 24 | v0.4 in Alt-App vorhanden; neuester Textstand separat abgleichen. KG-O01–KG-O24 Bildziele, alte Bildreferenzen sind Karten-Fallbacks. |
| Raumhauptbilder im alten Medienarchiv | 14 | inkl. Flur-Zustände, Eingang, Halle und Musikzimmer; exakte Pfade in Inventar. |
| Raumvarianten im alten Medienarchiv | 19 | exakte Pfade in Inventar. Nicht automatisch aktuelle Rundgangs-Master. |
| Neue Raumproduktion | 26 Wide / 78 mobile Crops | 13 Räume × A/B, je 3 Smartphone-Ausschnitte. Planung, nicht vorhandene Dateien. |
| Player-/Detailmedien | 9 Player-Nahansichten + 1 Tisch + 4 Ausstellungsgruppen | Bestehende Musikgeräte, Layer, Animationen und Integrationen ermitteln, nicht neu erfinden. |
| Weitere gemeinsame Assets | nach Bestand | Haustür, Geschenkum­schlag/Deckblatt, Portrait, Hintergründe, Rahmen, Icons, optimierte Bilder, Geräteatlas, Texturen, GLB/GLTF, ggf. Texte. Inventar vollständig ergänzen. |

### IDs und verbindliche Beziehungen
| ID | Motiv | Gruppe | bisheriger Audio-Pfad |
|---|---|---|---|
| O01 | Der freie Sessel | Ruhe | `audio/O01.mp3` |
| O02 | Der Vorhang | Ruhe | `audio/O02.mp3` |
| O03 | Das unbeschriebene Blatt | Ruhe | `audio/O03.mp3` |
| O04 | Das Kissen | Ruhe | `audio/O04.mp3` |
| O05 | Die geschlossene Blüte | Ruhe | `audio/O05.mp3` |
| O06 | Die ruhende Uhr | Ruhe | `audio/O06.mp3` |
| O07 | Der Funke | Kraft | `audio/O07.mp3` |
| O08 | Die Laterne | Kraft | `audio/O08.mp3` |
| O09 | Das Gartentor | Kraft | `audio/O09.mp3` |
| O10 | Der Samen | Kraft | `audio/O10.mp3` |
| O11 | Der Werkzeugkasten | Kraft | `audio/O11.mp3` |
| O12 | Das bewegliche Mobile | Kraft | `audio/O12.mp3` |
| O13 | Die Wurzel | Halt | `audio/O13.mp3` |
| O14 | Die Bank | Halt | `audio/O14.mp3` |
| O15 | Die Brücke | Halt | `audio/O15.mp3` |
| O16 | Der Faden | Halt | `audio/O16.mp3` |
| O17 | Das Dach | Halt | `audio/O17.mp3` |
| O18 | Der Kiesel | Halt | `audio/O18.mp3` |
| O19 | Der Lichtpunkt | Freude | `audio/O19.mp3` |
| O20 | Das Windspiel | Freude | `audio/O20.mp3` |
| O21 | Der Tanz der Blätter | Freude | `audio/O21.mp3` |
| O22 | Das offene Fenster | Freude | `audio/O22.mp3` |
| O23 | Die Sternenspur | Freude | `audio/O23.mp3` |
| O24 | Die schräge Tasse | Freude | `audio/O24.mp3` |

T03 = Main Theme, `audio/THEME.mp3`. Keine O25 erzeugen. O11 Werkzeugkasten und O12 bewegliches Mobile haben Vorrang vor historischen Audiotiteln „Das Werkzeug“/„Die Kurbel“. O16 Variante A (loser Faden) laut neuer Nutzerentscheidung; alte A/B-Studie ist nicht aktuell. O20/O21 ausdrücklich freigegeben, O24 verbindliche Objektidentität laut Objektregister; nicht pauschal alle anderen Master freigeben. O01 blauer Cord, nicht Samt. O22 korrigierte Fensteridentität, nicht historische Hofsicht.

### Weitere Audio-Dateien (genau 10)
- `audio/S01-D-B.mp3` — Percussion (B)
- `audio/S01-D-A.mp3` — Percussion (A)
- `audio/S01-E-B.mp3` — Harfe und Handpan gemeinsam (B)
- `audio/S01-E-A.mp3` — Harfe und Handpan gemeinsam (A)
- `audio/S01-F-P-B.mp3` — Handpan einzeln (B)
- `audio/S01-F-P-A.mp3` — Handpan einzeln (A)
- `audio/S01-F-H-B.mp3` — Harfe einzeln (B)
- `audio/S01-F-H-A.mp3` — Harfe einzeln (A)
- `audio/W01-A.mp3` — Winterstille (A)
- `audio/W01-B.mp3` — Winterstille (B)

### Bestehende Musikzuordnung (historisch vom Nutzer bestätigter Stand 04.11.)
- P01: O01, O02, O22
- P02: O03, O18, O16
- P03: O21, O13, O10, O05
- P04: O07, O11, O12
- P05: O09, O14, O15
- P06: O08, O15, O16, O19
- P07: O20, O17, O23
- P08: O24, O04, O06

Diese Zuordnungen sind keine festen Objektstandorte. Live aktuellere Zuordnung beibehalten. Flur T03, Musikzimmer vollständige 25er-Playlist. Zusätzliche Räume H00, M01, KUE, SCH, BAD mit tatsächlichen IDs abgleichen. Keine automatische Wiedergabe.

## 4. Umsetzung: stabiles Manifest + Loader
- Ein einziges dauerhaftes öffentliches Manifest unter `/wunderhaus/media/manifest.json`. Bestehende Manifestverbraucher prüfen. Schema versionieren (`schemaVersion`, `revision`, `updatedAt`); kompatible Erweiterungen vor destruktiver Migration. Alle Medienpfade relativ zum Manifest, nicht zur HTML-Seite. `new URL(asset.path, manifestUrl)`; dieselbe Origin und Media-Root erzwingen bzw. zugelassene externe Origins explizit konfigurieren. Keine `../media` Abhängigkeit in neuen Apps.
- Stabile IDs (O01–O24, T03, Raum-/Geräte-ID); getrennte Asset-Rollen front, back, cover, audio, objectReference, objectSprite, model, layers, room, background, story. Varianten/Größen separat; zentraler Asset-Datensatz mit `path`, MIME, Maße, bytes, hash/revision, Status und Herkunft. Referenzen einer Karte verweisen auf Asset-IDs, nicht auf neue Dateikopien. Fehlende Pfade `null` + Status, nicht synthetischer URL. Eine neue Manifestrevision verweist auf aktualisierte versionierte Dateien; ältere URLs bleiben gegebenenfalls erhalten. Keine harte Bindung an Hash-Dateinamen in Anwendungscode.
- Loader `media-loader.js` (gemeinsam bereitstellbar, z. B. `/wunderhaus/media/media-loader.js`), mit `init`, `getCard(id)`, `getAsset(id, variant)`, `getPlaylist()`, `getRoom(id)`, `resolveUrl(asset)`, `refresh`. Unterstützt fehlende Medien, lesbare Fehler, parallele Anfragen teilen, schema validation, Last-known-good Cache mit Status. Konfigurationswechsel für lokale/Stage-Umgebung. Kein Zwang zu einem JS-Framework. 3D-Texturen referenzieren IDs; WebP ist Textur/Sprite, kein 3D-Mesh.
- Manifest per Revalidierung (ETag/Last-Modified, `Cache-Control: no-cache`); gehashte Dateien langfristig cachebar, nicht gehashte Legacy-Dateien revalidieren. Keine URL-Version pro App-Build. Service Worker je App begrenzen, keine fremden Versionen kontrollieren, keine Cache-Namenskollisionen; Audio nicht ungefragt precachen; Offline-Fallback nur für tatsächlich gespeicherte Inhalte. iPhone-PWA-Neustart und Update prüfen.
- Same-Origin genügt für alle Unterordner. Externe Claude-Preview-Origin nur bei Bedarf per gezielter CORS-Konfiguration erlauben; 3D-WebGL/CORS, Range-Requests, MIME und HTTPS prüfen. Keine Geheimnisse in öffentlichen Dateien. Keine öffentliche Freigabe interner Medien durch das Manifest.

## 5. Konkrete Umsetzung und Abnahme
Liefere: (1) LIVE-Bestandsbericht mit vorhandenen, unklaren, fehlenden, veralteten und doppelt referenzierten Assets, (2) tatsächlich befülltes manifest.json + JSON-Schema + MediaLoader, (3) reproduzierbaren Scanner/Validator mit CLI und rein lesendem Standardmodus, (4) Migration der gewünschten neuen 3D-Version sowie getrennten Vorschlag/Patch für bestehende PWA, (5) Testseite mit allen 24 Karten, 25 Covern, 25 Primärstücken und Objekt-Status, (6) Deployment-/Rollback-Anleitung, (7) kompakte Claude/Codex/ChatGPT-Konvention für nachfolgende Versionen. Das Manifest zuletzt und atomar publizieren, erst nach Upload/Prüfung der referenzierten Dateien. Keine Live-Veröffentlichung im Rahmen dieses Auftrags.

Akzeptanztests: identische resolved URLs aus `/home/`, `/home/3d/claude/v1/`, `/home/3d/claude/v2/`, weiteren verschachtelten Versionen; 24 eindeutige O-IDs, 25 eindeutige Playlist-IDs, 35 erwartete Audio-Pfade; richtige Motiv-/Song-/Cover-Zuordnung; keine 404 oder HTML-Fallbacks als Medien; neue Kartenrevision für alle Apps sichtbar ohne Änderung ihres Codes; alter Cache wird korrekt revalidiert; fehlende Assets werden angezeigt, kein Autoplay, kein Bruch der bestehenden PWA. Bei neueren Live-Medien Soll-Register erweitern, nicht auf 35 Dateien künstlich beschränken. 2D und 3D müssen nicht dieselben Raumhintergründe benutzen, aber dieselbe Medienbibliothek.

## 6. Eingabedateien und Grenzen
- `Soll-Medienregister.json`: maschinenlesbare Soll-IDs, Legacy-Kandidaten, alle 35 Audiometadaten. **Kein runtime-fertiges Manifest.**
- `Karten-Medienmatrix.csv`: alle 24 IDs, Titel, Rolle, alte Pfade, leere Felder für neue Pfade.
- `Dateipfad-Inventar.csv`: sämtliche Dateien des Medienarchivs 29.10. und statisch aus App v0.6.56 ermittelte konkrete Medienpfade, zusätzlich Referenz-WebPs. Enthält auch historische Originale/Mockups; diese nicht produktiv verwenden.
- `quellen/`: extrahierte unveränderte Originalmanifeste, App-Zuordnungen, Objektregister, Bildprofile und Kompositionsgeschichten zum Vergleich. Keine Audiodateien oder Bilder in diesem Übergabepaket. Bei Bedarf separat anfordern: EMFD_Media_Ablage_v1.0(1).zip, EMFD-v0.6.56-home-KOMPLETT-BOOK-NOTE(1).zip, EMFD-Objektstudien-O01-O24(2).zip, EMFD-MEDIA-OBJ-01_Referenz-WebP_v0.1.zip. Live-Server in dieser Übergabe nicht verifizierbar; beide URL-Aufrufe lieferten keinen zugänglichen Inhalt. Aktuelle Vorderseiten, neue Cover, neue Raumplayer-Assets und aktuelle Live-App liegen hier nicht als verifizierte Binärdateien vor. Keine Anmeldedaten vorhanden. Claude soll bei fehlender Zugriffsmöglichkeit einen vollständigen lokalen Scanner und einen konkreten Dateilisten-Import liefern, nicht raten.

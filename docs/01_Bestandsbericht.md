# EMFD-MEDIA-CORE-01 · Bestandsbericht (SERVER-FIRST)

Stand 18.11.2026 · Manifest-Entwurf Revision 1 (`2026-11-18.r1-vorab`) · nichts auf dem Server verändert

## 1. Was geprüft werden konnte – und was nicht

| Quelle | Zugriff | Ergebnis |
|---|---|---|
| `https://flowisaurus.de/wunderhaus/media/manifest.json` | gelesen (Abruf über zusammenfassenden Webzugriff, **nicht bytegenau**) | existiert, JSON, ca. 266 KB, `schemaVersion` 1.0 + PERF-01-Overlay (`optimizationJob` EMFD-PERF-01, `createdDate` 2026-11-04). Kein `revision`. |
| `/wunderhaus/home/` (Live-App) | **nicht erreichbar** (URL-Freigabe der Sitzung) | Live-Code nicht geprüft; App-Referenzen stammen aus v0.6.56 im Übergabepaket |
| Mediendateien, Verzeichnislisting | **nicht erreichbar** (Shell-Netz für flowisaurus.de gesperrt) | keine HTTP-, Signatur-, Range- oder Hash-Prüfung möglich |
| Übergabe-ZIP (Register, Inventar, 15 Originalmanifeste) | vollständig gelesen | Basis des Soll-Abgleichs |
| Projekt „Haus Der Wunder“ (Dateien) | vollständig gelesen, SHA-256 berechnet | **18 neue Vorderseiten, 3 neue CD-Cover** gefunden |

Folge: Kein Medium ist in diesem Entwurf als `verified` geführt. Die Prüfung holt `tools/emfd_media.py http-check` (lesend) nach; der Befehl läuft auf jedem Rechner mit Python und Internetzugang.

## 2. Inhalt des Live-Manifests (laut Abruf)

Enthalten: `cards/O01–O24.png`, `_originale/karten/O01–O24-original.jpeg`, 14 Raumhauptbilder, 19 Raumvarianten, 25 Hintergrund-Originale, 3 Hintergründe, 21 UI-Mockups, 2 SVG-Rahmen, Portrait, alle PERF-01-WebPs (`optimized/cards`, `optimized/playlist` inkl. `main-theme-house-160`, `optimized/rooms`, `optimized/backgrounds`), zwei CSV-Metadaten.

**Nicht enthalten:** neue Vorderseiten, CD-Cover, Audio, Objektbilder, Kartenrückseite `EMFD_Kartenrueckseite_v1.2.jpeg`, `rooms/thumbs/`. Statusfelder: „Interne Testmedien – keine Veröffentlichungsfreigabe“, Kartenposten „ausstehend“, `deploymentTarget` noch `Root/moments/media/` (veraltet).

Die App v0.6.56 lädt dieses Manifest nicht (keine Referenz im Inventar). Es ist ein QA-Dokument; trotzdem wird additiv migriert (Abschnitt 6).

## 3. Neue Nutzerdateien (Projekt, 18.11.2026)

| Datei | Maße | Zuordnung | Nachweis |
|---|---|---|---|
| O01–O18.png | je 896×1536, RGB | neue Vorderseiten O01–O18 | SHA-256 weicht bei allen 18 vom Altbestand `cards/Oxx.png` ab; Sichtprüfung: Motiv = ID (O06 ohne Ziffern/Zeiger, O11 Werkzeugkasten, O12 Papiermobile, O16 loser Faden A) |
| C04.png | 1254×1254 | Cover O04 Das Kissen | Bildtitel „Das Kissen · O04“ |
| C06.png | 1254×1254 | Cover O06 Die ruhende Uhr | Bildtitel „Die ruhende Uhr · O06“ |
| C024.png | 1254×1254 | Cover O24 Die schräge Tasse | Bildtitel „Die schräge Tasse · O24“; Dateiname mit Tippfehler, Zuordnung über Bildinhalt |

Diese 21 Dateien sind mit Varianten als Upload-Bündel vorbereitet (`staged`, 84 Dateien, 54 MB). Ob sie bereits irgendwo auf dem Server liegen, ist unbekannt – deshalb vor dem Upload der Duplikat-Abgleich (Deployment-Anleitung, Schritt 2).

## 4. Abgleich je Karte

| ID | Titel | Vorderseite | neue Datei (geplanter Pfad) | CD-Cover | Musik | Objekt |
|---|---|---|---|---|---|---|
| O01 | Der freie Sessel | neu r2 (staged) | `cards/fronts/O01-front-r2-21eca783.png` | fehlt | `audio/O01.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: review |
| O02 | Der Vorhang | neu r2 (staged) | `cards/fronts/O02-front-r2-512eeca7.png` | fehlt | `audio/O02.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: review |
| O03 | Das unbeschriebene Blatt | neu r2 (staged) | `cards/fronts/O03-front-r2-855957b9.png` | fehlt | `audio/O03.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: review |
| O04 | Das Kissen | neu r2 (staged) | `cards/fronts/O04-front-r2-4c1f37fb.png` | `covers/O04-cover-r1-d7ace5fa.png` | `audio/O04.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: review |
| O05 | Die geschlossene Blüte | neu r2 (staged) | `cards/fronts/O05-front-r2-8ad22072.png` | fehlt | `audio/O05.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: review |
| O06 | Die ruhende Uhr | neu r2 (staged) | `cards/fronts/O06-front-r2-ba9ec012.png` | `covers/O06-cover-r1-8e23a947.png` | `audio/O06.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: review |
| O07 | Der Funke | neu r2 (staged) | `cards/fronts/O07-front-r2-1b0edb88.png` | fehlt | `audio/O07.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: review |
| O08 | Die Laterne | neu r2 (staged) | `cards/fronts/O08-front-r2-1bd052f1.png` | fehlt | `audio/O08.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: review |
| O09 | Das Gartentor | neu r2 (staged) | `cards/fronts/O09-front-r2-a8c90829.png` | fehlt | `audio/O09.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: review |
| O10 | Der Samen | neu r2 (staged) | `cards/fronts/O10-front-r2-b8fd07b7.png` | fehlt | `audio/O10.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: review |
| O11 | Der Werkzeugkasten | neu r2 (staged) | `cards/fronts/O11-front-r2-81deeae0.png` | fehlt | `audio/O11.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: review |
| O12 | Das bewegliche Mobile | neu r2 (staged) | `cards/fronts/O12-front-r2-44b7e744.png` | fehlt | `audio/O12.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: review |
| O13 | Die Wurzel | neu r2 (staged) | `cards/fronts/O13-front-r2-84b39927.png` | fehlt | `audio/O13.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: review |
| O14 | Die Bank | neu r2 (staged) | `cards/fronts/O14-front-r2-dfc3bc61.png` | fehlt | `audio/O14.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: review |
| O15 | Die Brücke | neu r2 (staged) | `cards/fronts/O15-front-r2-7da93928.png` | fehlt | `audio/O15.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: review |
| O16 | Der Faden | neu r2 (staged) | `cards/fronts/O16-front-r2-89bb7806.png` | fehlt | `audio/O16.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: review |
| O17 | Das Dach | neu r2 (staged) | `cards/fronts/O17-front-r2-4636421b.png` | fehlt | `audio/O17.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: review |
| O18 | Der Kiesel | neu r2 (staged) | `cards/fronts/O18-front-r2-c2a2f9d8.png` | fehlt | `audio/O18.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: review |
| O19 | Der Lichtpunkt | nur Alt r1 (Update erwartet) | — | fehlt | `audio/O19.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: review |
| O20 | Das Windspiel | nur Alt r1 (Update erwartet) | — | fehlt | `audio/O20.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: approved |
| O21 | Der Tanz der Blätter | nur Alt r1 (Update erwartet) | — | fehlt | `audio/O21.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: approved |
| O22 | Das offene Fenster | nur Alt r1 (Update erwartet) | — | fehlt | `audio/O22.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: review |
| O23 | Die Sternenspur | nur Alt r1 (Update erwartet) | — | fehlt | `audio/O23.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: review |
| O24 | Die schräge Tasse | nur Alt r1 (Update erwartet) | — | `covers/O24-cover-r1-054b4da2.png` | `audio/O24.mp3` · referenced | Referenz-WebP: archived · Sprite: missing · Studie: approved |

T03 Main Theme: Audio `audio/THEME.mp3` (referenced), Cover **fehlt** (Fallback: `optimized/playlist/main-theme-house-160-v1-edfa2ea0a4.webp`).

## 5. Einordnung nach Status

**Vorhanden (laut Live-Manifest, Bytes ungeprüft · `listed`):** 24 Alt-Vorderseiten + 72 PERF-01-Kartenvarianten, 25 Playlist-Ausschnitte, 14 Raumhauptbilder + 19 Varianten mit 3er-WebP-Sätzen, 3 Hintergründe, Portrait, Originale und Referenzen (Archiv).

**Unklar (nur von App v0.6.56 referenziert · `referenced`):**
- alle **35 MP3** (`audio/O01–O24.mp3`, `THEME.mp3`, 8 × S01, 2 × W01) – im Live-Manifest nicht geführt, Existenz ungeprüft
- Kartenrückseite `cards/EMFD_Kartenrueckseite_v1.2.jpeg` + 3 optimierte WebPs
- `rooms/thumbs/*-thumb.webp` (9), `rooms/teezimmer_p08_background.webp`
- Vorderseiten O19–O24: von dir als aktualisiert angekündigt, Datei nicht auffindbar
- 22 weitere CD-Cover: Pfade unbekannt – **bitte Server-Dateiliste schicken**, dann werden sie per `import-list` + `--assign` übernommen statt neu hochgeladen

**Fehlend (`missing` / `archived`):** `cards/deckblatt.jpeg` (Geschenk-Deckblatt), 22 Cover, 24 freigestellte Objekt-Sprites, 24 3D-Modelle, 24 Kompositionsgeschichten-Bilder (KG-O01–KG-O24; Fallback Vorderseite), 24 Referenz-WebPs nur im Paket OBJ-01 v0.1 (nicht auf Server), Objektstudien nur im Studienarchiv. Geplant, aber ohne Dateien und daher ohne Asset-ID: 26 Wide-/78 Mobile-Raumbilder, 9 Player-Nahansichten, 1 Tisch, 4 Ausstellungsgruppen.

**Veraltet (`superseded`, nur als ausdrücklicher Fallback):** Alt-Vorderseiten O01–O18 (`cards/O01–O18.png` + PERF-01-Varianten), 25 Playlist-Ausschnitte als Cover-Ersatz, `rooms/flur.webp`, Altverweis `cards/rueckseite.jpeg`, historische Audiotitel „Das Werkzeug“/„Die Kurbel“ (Titel jetzt O11 Werkzeugkasten, O12 bewegliches Mobile), O16-Variante B, O22-Hofsicht.

**Doppelt referenziert / doppelt abgelegt:**
- `portraits/weltenweberin.jpeg` und `home/assets/weltenweberin.jpeg` (laut README bytegleich) – App-Kopie später auf zentrale ID umstellen
- `cards/Oxx.png` und `_originale/karten/Oxx-original.jpeg` (gleiches Motiv, Archivoriginal) – gewollt, Rolle `archive`
- 10 Gruppen identischer JPEG-Uploads im Altarchiv (`_metadata/doppelte-uploads.csv`)
- Live-Manifest: mehrere Raumbilder mit doppelten `logicalMediaIds`
- Musik: O15 (P05 + P06) und O16 (P02 + P06) – erlaubt laut `trackReuseAcrossRooms`, keine Dateidublette
- Raum-ID **P01–P08 kollidiert** mit Geräte-ID P01–P08: im Manifest getrennte Bereiche `rooms` und `devices`; für die 3D-Welt eigene Ort-IDs (H00, KUE, SCH, BAD …) empfohlen

## 6. Offene Entscheidungen für dich

1. Server-Dateiliste von `/wunderhaus/media/` (STRATO-Dateimanager-Export oder `ls -lR`), damit Cover/Vorderseiten nicht doppelt hochgeladen werden.
2. Vorderseiten O19–O24 und 22 Cover nachliefern (oder Pfade nennen).
3. Freigabe für die erste Veröffentlichung: Upload der 84 neuen Dateien in **neue** Pfade + additives Manifest (Revision 2). Kein Überschreiben, kein Löschen.

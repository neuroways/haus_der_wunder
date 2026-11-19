# STRATO-Upload · App v0.6.69

Stand 19.11.2026. Ersetzt live v0.6.66. Enthält EMFD-NAV-01 (Rückwege), EMFD-PLAYER-01 (Gerätestationen) und die Umstellung auf die neuen Audio-Dateinamen (Musikmanifest v1.2).

## Pakete (je unter 20 MB)

| Datei | Größe | Entpacken nach | Inhalt |
|---|---|---|---|
| `EMFD-v0.6.69-1-home.zip` | 11,4 MB | `Root/wunderhaus/` | Ordner `home/` (170 Dateien, ohne Tests/Prüfberichte) |
| `EMFD-v0.6.69-2-media-loader.zip` | 7 KB | `Root/wunderhaus/` | `media/media-loader.js`, `media/media-loader.mjs` (fehlen bisher auf dem Server) |

Erzeugt aus Branch `claude/modest-galileo-ifo41b` (Repository `neuroways/haus_der_wunder`), Ablage im Arbeitsverzeichnis unter `dist/strato-v0.6.69/` (nicht im Git).

## Schritte

1. **Sicherung:** Den bisherigen Ordner `Root/wunderhaus/home/` umbenennen, z. B. in `home_v0.6.66_sicherung` (nicht löschen). Rückfall = Ordner zurückbenennen.
2. `EMFD-v0.6.69-1-home.zip` nach `Root/wunderhaus/` hochladen und dort entpacken. Es entsteht `Root/wunderhaus/home/`.
3. `EMFD-v0.6.69-2-media-loader.zip` nach `Root/wunderhaus/` hochladen und entpacken. Es kommen nur zwei Dateien in den vorhandenen Ordner `media/` hinzu; vorhandene Medien bleiben unverändert.
4. Die ZIP-Dateien danach vom Server löschen.
5. Auf dem iPhone die Home-Bildschirm-App einmal schließen und neu öffnen (alle geänderten Dateien haben neue Versionsparameter).

## Musik (liegt bereits auf dem Server)

Die App sucht jetzt `media/audio/<Karte>-M01.mp3` und `media/audio/THEME-M01.mp3`. Geprüft am 19.11.2026:

- Vorhanden: O01–O04, O06, O08, O10, O11, O13, O14, O16–O24 (jeweils `-M01`), `THEME-M01.mp3`, zusätzlich `O03-M02`, `O16-M02`, `O16-M01-V02`.
- **Fehlen auf dem Server:** `O05-M01.mp3`, `O07-M01.mp3`, `O09-M01.mp3`, `O12-M01.mp3`, `O15-M01.mp3`, `O16-M02-V02.mp3` → hochladen nach `Root/wunderhaus/media/audio/`. Bis dahin zeigt die App für diese Stücke „Leider ist die Platte verloren gegangen …“; alles andere funktioniert.
- Die Zusatzfassungen O03-M02, O16-M02, O16-M01-V02 sind in der App noch nicht auswählbar (eigener Auftrag).

## Bilder

**Für v0.6.69 müssen keine Bilder hochgeladen werden.** Alle Bilder, die die App anzeigt, liegen bereits auf dem Server (einschließlich `media/raumgeraete/P01–P08.webp`). Die App kennt zusätzlich Ausweichbilder, die auf dem Server fehlen; sie werden nur benutzt, wenn ein Hauptbild nicht lädt:

| Zielordner auf dem Server | Dateien | Quelle |
|---|---|---|
| `Root/wunderhaus/media/rooms/varianten/` | 18 Raumvarianten (`P01-fensterzimmer-abend-v1.webp` …, `flur-gang-v1.webp`) | im Branch `claude/bold-feynman-nekhwz` unter `media/rooms/varianten/` |
| `Root/wunderhaus/media/cards/` | `EMFD_Kartenrueckseite_v1.2.jpeg` | nicht vorhanden; App nutzt `rueckseite.jpeg` |
| `Root/wunderhaus/media/optimized/cards/` | `EMFD_Kartenrueckseite-v1.2-{210x360,630x1080,896x1536}-….webp` | nicht vorhanden |
| `Root/wunderhaus/media/_originale/…` | Originale von Karten und Hintergründen | optional, nur Archiv |

## Kurzer Test nach dem Upload

- Startseite öffnet, Flur, „Alle Räume“, ein Raum: oben genau ein Rückweg mit Pfeil und Zielname.
- Raum → „<Gerät> ansehen“ → Gerätestation öffnet ohne Musik; „Abspielen“ startet Musik; Raumwechsel lässt sie weiterlaufen.
- Musikzimmer und Plattensammlung spielen; Hauptthema im Flur startet nur auf Tippen.
- Karte ziehen, umdrehen, Kartenbuch, Gedankenblatt exportieren.

# Ein Moment fuer dich – Medienablage v1.0

**Arbeitsstand:** 29.10.2026 · Basis App v0.6.18 · **NICHT freigegeben / nur Testmedien.**

## Deployment

Entpacke diese ZIP **in `Root/moments/`**, sodass die erste Ebene dort `media/` heisst.
Die App liegt weiter separat unter `Root/moments/home/`; das App-ZIP wird hiermit **nicht** ersetzt.

### Produktive Medien

- `media/cards/O01.png` bis `media/cards/O24.png`: alle 24 Karten nach eindeutigem Motiv zugeordnet, JPEG-Daten als echte PNG gespeichert. Keine Hochskalierung. Identische ID fuer Karte, Bild und Song.
- `media/rooms/P01-fensterzimmer.webp` bis `P08-teezimmer.webp`: 8 bestehende Raumdateien aus v0.6.12, bytegleich erhalten.
- `media/rooms/flur-v2.webp`, `flur-v2-dim.webp`: bestehende Flurzustandsbilder, bytegleich erhalten.
- `media/rooms/startseite-haustuer-v1.webp`: neue UI-freie Eingangsgrafik; entspricht dem von App v0.6.18 erwarteten Pfad.
- `media/rooms/musikzimmer-v1.webp`: UI-freier Musikzimmerhintergrund, fuer die kuenftige Playlist vorgesehen.
- `media/rooms/haus-zentrale-halle-v1.webp`: zusaetzliche Hausillustration, noch keine verbindliche Route.
- `media/backgrounds/`: mehrere UI-freie Schreibtisch- und Pergamentmotive fuer Karten-/Briefansichten.
- `media/portraits/weltenweberin.jpeg`: Projektportraet; liegt im aktuellen App-ZIP bereits identisch unter `home/assets/weltenweberin.jpeg`.

### Varianten, Originale, Referenzen

- `media/rooms/varianten/`: weitere UI-freie Raumvarianten. Sie ersetzen die bestehenden P01-P08-Dateien **nicht automatisch**.
- `media/_originale/karten/`: die 24 Nutzer-JPEGs, unveraendert, mit sprechenden Namen.
- `media/_originale/hintergruende/`: die Nutzer-JPEGs aller neu uebertragenen Hintergruende und Varianten, unveraendert.
- `media/_referenzen/mockups/`: 21 verschiedene UI-Mockups, jeweils einmal. **Nicht als produktive Hintergruende verwenden**, da UI/Text im Bild eingebrannt ist.
- `media/_referenzen/button-bibliothek-v0.3/`: gesamte separat angelieferte Button-Bibliothek. Die App v0.6.18 hat die Bibliothek bereits unter `home/emfd-ui/` integriert; beim Deploy **nicht blind mit den Referenzdateien ueberschreiben** (kleine CSS-Abweichung).

### Audio fehlt

**Es liegen keine Audio-Binaerdateien vor.** Die App erwartet 35 MP3-Pfade, darunter `/media/audio/O01.mp3`–`O24.mp3` und `/media/audio/THEME.mp3`.
Die vorgesehenen Pfade stehen in `media/audio/manifest-erwartete-tracks.json`.
Keine Dummy-MP3 wurden erzeugt. Um alle Medien tatsaechlich vollstaendig abzulegen, muessen die Original-MP3s separat geliefert werden.

### Wichtige Integrationshinweise

1. **Acht bestehende App-Verweise sind nicht ID-konsistent.** Die neue Ablage ordnet Bilder nach echten Kartenmotiven korrekt zu. In der App v0.6.18 zeigt `data.js` jedoch bei O03/O06/O09/O12/O14/O18/O20/O24 auf andere Bild-IDs. Siehe `media/_metadata/app-acht-kartenpfade-korrigieren.csv`. Auch `imageSourceId`, die alten Bildabmessungen und die Alttexte muessen pro Karte aktualisiert werden. Dieses Paket veraendert den App-Code nicht.
2. Die App erwartet zusaetzlich `/media/cards/deckblatt.jpeg` und `/media/cards/rueckseite.jpeg`. Diese beiden separaten Bilddateien wurden nicht bereitgestellt und nicht erfunden.
3. O06 zeigt **Ziffern und Zeiger**, obwohl die aktuelle Text-/Designvorgabe eine ruhende Uhr ohne beides verlangt. Das Originalmotiv ist unveraendert archiviert; **Bild-Text-Pruefung offen**.
4. O11 und O12 heissen redaktionell **Der Werkzeugkasten** und **Das bewegliche Mobile** (nicht die alten Namen). Mediennamen bleiben O11 und O12.
5. Die eingebauten Kartenbeispiele in UI-Mockups sind teils andere Kartenmotive; sie sind keine Quellen fuer die 24 verbindlichen Karten. Alle sichtbaren UI-Texte/Buttons sollen im Frontend liegen.
6. Keine Loeschung bestehender funktionierender PWA-Dateien vor dem technischen Abgleich, keine automatische Veroeffentlichung.

### Verzeichnisse fuer QA

- `media/manifest.json`: alle Medien mit Originaldateiname, Zweck, Groesse, Aufloesung, SHA256.
- `media/cards/karten-manifest.json`: O01-O24 mit Titel, Gruppe, Bildpfad und geplanter Audio-URL.
- `media/rooms/manifest.json`: P01-P08 und Zusatzzugaenge.
- `media/_metadata/datei-zuordnung.csv`: vollstaendige Umbenennungs-/Quellenliste.
- `media/_metadata/doppelte-uploads.csv`: Originaldateien mit identischem SHA256.
- `media/_metadata/app-acht-kartenpfade-korrigieren.csv`: erforderliche App-Korrekturen.

**Bildzaehlung:** 24 Kartengrafiken, 25 ergaenzende UI-freie Hintergruende / Varianten, 21 eindeutige Mockups, 10 Gruppen identischer JPEG-Uploads. Acht Raumillustrationen und drei Flurversionen aus bestehenden Paketen. MP3-Dateien: 0.

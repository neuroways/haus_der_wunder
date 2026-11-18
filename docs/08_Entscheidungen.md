# Entscheidungen der Nutzerin (Gestaltung und Medien)

Fortlaufendes Protokoll. Jüngere Einträge haben Vorrang. Jede Entscheidung gilt für alle Apps (2D und 3D), sofern nicht anders vermerkt.

| Datum | Bereich | Entscheidung | Folgen im Repo |
|---|---|---|---|
| 18.11.2026 | Atelier P04 · Hauptbild | **Werkbank** (Original vom 29.10., 1086×1448). Die Kartenauslage, die seit 05.11. unter `rooms/P04-atelier.webp` auf dem Server liegt, gilt **nicht**. | Manifest: Altpfad als `broken` (Maße weichen ab) und mit Notiz. Der Loader liefert die optimierten Werkbank-Varianten. Original archiviert: `input/bilder/raeume/R-ATELIER_p04_atelier_v1.webp`. Upload auf den Server steht noch aus (⚠ Freigabe). |
| 18.11.2026 | Teezimmer P08 · Stil im 3D-Haus | **Variante „Rundtisch“** (`rooms/varianten/P08-teezimmer-rundtisch-v1.webp`): Bogenfenster mit Blick auf beleuchtete Türme, runder geschnitzter Holztisch mit Läufer, Teeservice Blau/Gold, Bodenkissen, Fensterbank mit Kissen (Mondsichel), Regal in Bogennische, Laternen in Messing. Die Variante „Mond“ (rundes Mondfenster, asiatisch anmutend) ist **keine** Stilvorgabe. | Manifest: Notiz am Asset `room.P08-teezimmer-rundtisch-v1.r1`. Original archiviert: `input/bilder/raeume/varianten/R-TEE_p08_teezimmer_rundtisch_v1_v1.webp`. Das 2D-Hauptbild des Teezimmers (`teezimmer_p08_background`) bleibt unverändert. Möbel und Maße richten sich weiter nach dem Hausmodell v0.4.4 und dem Objektregister (O04 Kissen auf der Sitzbank, O24 Tasse). |
| 18.11.2026 | Wintergarten P03 · Licht | **Hell, Tagesraum.** Der Wintergarten ist bewusst der eine helle Raum im sonst abendlichen Haus. Hauptbild und beide Varianten (Brunnen, Werkbank) bleiben Tagesansichten. | Im 3D-Haus: Tageslicht durch Glasdach und -wände (sonnige, kühl-helle Grundstimmung, Schattenwurf der Sprossen), keine Nachtfassung. Übergänge in die abendlichen Nachbarräume (offener Durchgang zum Teezimmer, 2,80 m) bewusst gestalten. |
| 18.11.2026 | Übergabe ChatGPT · Räume | `01_raeume.md` freigegeben und unverändert abgelegt. | `input/chatgpt-2d/3d-haus-entwickeln/01_raeume.md` |
| 18.11.2026 | Server · Upload | **Freigabe** für den Upload der 18 fehlenden Raumvarianten und des Werkbank-Originals. | Dateien liegen in `media/rooms/` bzw. `media/rooms/varianten/`. Paket und Reihenfolge: `release/README.md`. Hochladen muss die Nutzerin selbst (STRATO-Dateimanager); es wird nichts überschrieben. |

## Noch offen

- Teezimmer im 3D-Haus: Das Modell v0.4.4 hat einen Kartentisch mit Stuhl (T01/T03); die Stilreferenz „Rundtisch“ zeigt einen niedrigen runden Tisch mit Bodenkissen. Klärung über das Mockup des Teezimmers (Pilot).

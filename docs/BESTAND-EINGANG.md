# Bestand · Ablauf vor dem Eingang ins Haus (App v0.6.70)

Stand 19.11.2026. Grundlage für die Neuplanung von Eingang und Tutorial. Die **Oberfläche** wird vollständig ersetzt; die **Funktionen** in Abschnitt 2 bleiben erhalten (Entscheidung „Neue Oberfläche, Funktionen bleiben“).

## 1. Heutiger Ablauf (wird ersetzt)

**Erster Besuch** (`#ankommen`, `start-gate.js`):
1. **Haustür**: Titel „Das Haus der kleinen Wunder“, „Ein Moment für dich“ und „Eine Tür für dich“. Knöpfe „Umschlag öffnen“ bzw. „Zur Haustür“ und „Überspringen“.
2. **Geschenkbrief**: Umschlag auf dem Tisch, Herzsiegel, Lasche öffnet sich („Der Umschlag öffnet sich.“), Briefpapier mit Brieftext, Knopf „Weiter“.
   - Phasen: `closed → opening → letter-visible → gift-card-visible → world-opening → sound-choice → completed`.
3. **Geschenkkarte**: „Deine Karte wartet auf dich. Öffne hier deine kleine Welt.“
4. **Musikfrage** (`music-entry.js`): mit oder ohne Hintergrundmusik. Die Wahl wird nur gespeichert, wenn die Person das möchte.
5. **Eintritt in den Flur** (`#flur`).
6. **Starttour** im Flur (`start-tour.js`, Dialog mit 6 Schritten):
   - Laterne
   - Grammophon
   - Türen
   - Deine Geschenkkarte (mit QR-Code)
   - Das Fragezeichen
   - Das Haus griffbereit (Installation)
   - Bedienung: Zurück, Weiter, Überspringen.
7. **Installationshinweis** „Das Haus griffbereit“: „Installieren“, auf iPhone „Teilen“ → „Zum Home-Bildschirm“, „Später“.

**Folgebesuch**: Der Geschenkbrief ist erledigt, die Person kommt direkt in den Flur. Brief und Tour lassen sich erneut öffnen (Hilfe bzw. `data-start-gift-open`).

**Bilder heute:**
- Haustür: `home/assets/rooms/startseite-haustuer-v1.webp`. Das ist eine Medienkopie im App-Ordner und verstößt gegen die Konvention.
- START-02:
  - A01 Tisch, A02 Umschlagkörper, A03 Lasche, A05 Briefpapier, A06 Geschenkkarte: unter `../media/start/`, sie **fehlen auf dem Server als JPG/PNG-Varianten; die WebP-Fassungen sind vorhanden**.
  - A04 Siegel liegt in `home/assets/gift/`.
- Register: Außenbereich EXT mit den Szenen `EXT-C01` (Eingang) und `EXT-C02` (Garten). Die Bildkandidaten liegen nur im gemeinsamen Repository. Dazu gehören das Musikgerät MP-EXT (Eingangsglocke, nur Konzeptboard) und die Orakelobjekte O09, O15, O17.

## 2. Funktionen, die bleiben müssen (Verhalten, nicht Aussehen)

| Funktion | Heute | Schnittstelle |
|---|---|---|
| Erster Besuch / Folgebesuch unterscheiden | localStorage `emfd.start02.gift-completed.v1` | – |
| Tutorial erledigt | `emfd.start02.tutorial-completed.v1`, `emfd.start03.intro-completed.v1` | – |
| Installationshinweis nicht erneut zeigen | `emfd.start02.install-dismissed.v1` | `beforeinstallprompt` (Android/Chrome), Anleitung für iPhone |
| Musikentscheidung beim ersten Besuch, kein Autoplay | `emfd.music.entryPreference` (nur auf Wunsch gespeichert) | `EMFDMusicEntry`, `EMFDMusic.setBackgroundPreference` |
| Hauptthema hören (Tutorial-Grammophon) | gemeinsamer Player | `EMFDAudio` / `EMFDMusic` |
| Licht im Flur | `emfd.house.light.v1` | `EMFDHallLight.set()` |
| Geschenkkarte mit QR-Rückkehrlink | QR aus `thought-qr.js` | `EMFDStartTour.giftURL`, `qrSVG()` |
| Brief/Tutorial erneut aufrufen | Hilfe und Geschenk-Hotspot | `EMFDStart02` |
| Fehlende Bilder: Hinweis und erneutes Laden | „Illustrationen erneut laden“ | künftig: Platzhalter aus dem Register (`EMFDRegistry`) |
| Adressen | `#ankommen` (Start), `#flur` (Ziel), QR-Links | Alte Adressen bleiben gültig. Neu wären z. B. `#raum/EXT/C01` |
| Ohne Ton, ohne Animation bedienbar | `prefers-reduced-motion` | – |

## 3. Was der Auftrag festlegen sollte

1. **Ablauf:** Welche Stationen hat er, in welcher Reihenfolge? Was ist beim ersten Besuch anders als bei Folgebesuchen? Kann man überspringen oder zurückgehen?
2. **Szenen:** Welche Bilder gehören zu jeder Station (Medien-ID, z. B. `scene.EXT-C01.kandidat`), welche Hotspots gibt es, und welche Funktion aus Abschnitt 2 löst jeder aus?
3. **Texte:** wörtlich, je Station.
4. **Bedienelemente:** der einheitliche Satz (Arten, Zustände, Größen, Beschriftung). Er gilt danach für das ganze Haus.
5. **Bisheriger Brief und Tour:** Was entfällt, was wird ersetzt? Behalten Erstbesucher und Wiederkehrer ihre gespeicherten Zustände? Die vorhandenen Schlüssel werden weiter gelesen, damit niemand den Einstieg ungewollt erneut sieht.
6. **Musik:** Bleibt die Musikfrage beim Eintritt? Spielt die Eingangsglocke (MP-EXT) etwas, und wenn ja, nur auf Antippen?
7. **Übergang:** Endet der neue Ablauf im bisherigen Flur, oder wird gleichzeitig die neue Halle (H00) gebraucht?

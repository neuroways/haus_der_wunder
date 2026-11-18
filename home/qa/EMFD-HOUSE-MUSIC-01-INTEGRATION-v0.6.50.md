# EMFD-HOUSE-MUSIC-01 – Umsetzung v0.6.50

## Freigabe

Die Nutzerin bestätigt alle 24 Raum-Musik-Zuordnungen am 04.11.2026.
Das ist eine **inhaltliche Zuordnungsfreigabe**, keine Freigabe der Tondateien oder Veröffentlichung.

## Integration

- `room-music-map.json`: acht P-Räume mit insgesamt 26 Zuordnungen und 24 eindeutigen O-IDs; Flur mit T03.
- `room-music.js`/`.css`: sechs Grundräume zeigen Bilder, Titel, Kartenkategorien und freiwillige Musik-Auswahl.
- Bestehendes Atelier und Teezimmer erhalten nur kleine Öffner für die raumeigene Auswahl.
- Zentraler Player wird wiederverwendet und wählt Stücke ohne Wiedergabe aus.
- Kompositionsgeschichten bleiben über bestehende Routen erreichbar.
- Im Musikzimmer bleiben alle 25 Katalogeinträge.

## Medien / technische Grenzen

Keine Audiodateien im ausgelieferten Paket; vorhandene gemeinsame Musikdateien unter `/media/audio/` werden nicht überschrieben.
Die Quellen-MP3s sind lokal nicht verifizierbar, deswegen ist eine reale Hörprobe vor Veröffentlichung erforderlich.
Alle Kartenbilder und Raumillustrationen bleiben unverändert. Keine Änderung an UX-Basiskategorien oder Grundriss.

## Tests

Node-Tests + ergänzte Mapping-Tests. Visuelle Tests und Hörprobe auf iPhone/Android nach Upload ausstehend.

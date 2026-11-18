# EMFD – Navigationsprüfung v0.6.23

Stand: 02.11.2026

## Geprüfte Wege

| Bereich | Prüfung | Ergebnis |
|---|---|---|
| Start | Tür zum Flur, Herkunftsdialog öffnen/schließen | PASS |
| Flur | Atelier, Teezimmer, Musik, Raumübersicht, Licht | PASS |
| Atelier | Hauptansicht, Tisch, vor/zurück, Kartenansicht | PASS |
| Karten | Übersicht, Filter, Detail, kontextbezogener Rückweg | PASS |
| Teezimmer | Tageskarte, Kartenübersicht, Rückweg | PASS |
| Musik | Musikzimmer, Playlist, Geschichten, Kartenrückweg | PASS |
| Räume | P01–P08, Raumdetail, zurück zur Übersicht/Flur | PASS |
| Dialoge | Hilfe, Musik, Einstellungen, Herkunft, Kartentext, Nahansicht | PASS |
| Tastatur | Enter, Escape, Fokus nach Dialogschluss | PASS |

## Korrigierte Fehler

- Die Klickfläche „Über dieses Geschenk“ konnte auf der Startseite die Türaktion überlagern. Die beiden mobilen Berührungsflächen besitzen nun feste, getrennte Grenzen und eine eindeutige Ebenenreihenfolge.
- Hilfe und Musikauswahl wurden bei einem Routenwechsel nicht zuverlässig geschlossen. Beide Dialoge reagieren nun auf `hashchange`.
- Wiederholtes Öffnen von Hilfe oder Musikauswahl konnte `showModal()` erneut aufrufen. Die Aufrufe sind nun zustandssicher.
- Karten aus den Kompositionsgeschichten führten beim Zurückgehen gelegentlich in einen früheren Raum. Der Einstieg `#musik/geschichten` wird nun ausdrücklich gespeichert.

## Prüfgrenzen

- Browserprüfung im eingebauten Chromium-Browser durchgeführt.
- Echte Geräteprüfungen mit iPhone Safari, VoiceOver und Android Chrome bleiben offen.
- Audiowiedergabe blieb aus Freigabegründen stumm; geprüft wurden Navigation und Dialogzustände, nicht die redaktionelle Audiofreigabe.

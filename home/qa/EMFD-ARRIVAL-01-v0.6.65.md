# EMFD-ARRIVAL-01 – reduzierter Ankommensbildschirm v0.6.65

Stand: 12.11.2026  
Basis: EMFD v0.6.64 / MUSIC03 v0.6.1 / LIBRARY02a / ARCH01  
Status: lokale Integrationsfassung, nicht veröffentlicht

## Änderung

- Auf `#ankommen` wurde „Über dieses Geschenk“ aus der Türansicht entfernt.
- Die untere Hauptnavigation wird im bestehenden `start-gate-mode` abschließend ausgeblendet.
- Der für das Menü reservierte untere Abstand wurde aus der Ankunftsansicht entfernt.
- Die Hauptnavigation und „Über dieses Geschenk“ im Flur bleiben unverändert erreichbar.
- Keine Medien-, Text-, Audio- oder Routenänderung außerhalb dieser Abgrenzung.

## Abnahme

- Automatisierter Quell- und Metadatentest: `tests/arrival-cleanup-v0.6.65.test.cjs`.
- Browserprüfung bei 390 × 844, 844 × 390 und 1440 × 900.
- Geprüft: kein Geschenkbutton auf der Türansicht, Navigation dort `display:none`, keine horizontale Überbreite, Navigation und Geschenkzugang im Flur weiter sichtbar, keine neuen JavaScript-Seitenfehler.

## Grenze

Keine Veröffentlichung und kein Test auf einem physischen iPhone. Der gemeinsame externe Medienbestand bleibt erforderlich.

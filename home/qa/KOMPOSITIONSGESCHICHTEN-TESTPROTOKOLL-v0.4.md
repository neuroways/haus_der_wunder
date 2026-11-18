# Kompositionsgeschichten v0.4 – Testprotokoll

## Automatisiert

- PASS – genau 24 Geschichten in stabiler Reihenfolge O01–O24
- PASS – Titel, Untertitel und vollständige Textkörper stimmen zeichengetreu mit der Markdown-Quelle überein
- PASS – Entwurf A: O13–O17 und O19–O24
- PASS – Entwurf B: O01–O12 und O18
- PASS – alle geforderten Modellfelder und `publicationStatus: draft`
- PASS – 24 Medienmanifest-Einträge; finale Illustrationspfade bleiben bis zur Lieferung leer
- PASS – unveränderte Originalkarten als ausdrücklicher Fallback
- PASS – Übersicht, Detailrouten, Originalkarten-Rückweg und freiwilliger Musiköffner
- PASS – keine automatische Audiowiedergabe durch den Geschichtenbereich
- PASS – responsive Regeln, Mindesttrefferflächen und reduzierte Bewegung
- PASS – bestehende Atelier-, Karten-, Musik-, Navigations- und PWA-Regressionen

Gesamtergebnis: **113 PASS, 0 FAIL, 1 SKIPPED**. Der übersprungene Bestandstest betrifft ein nicht geliefertes gemeinsames MP3-Testmedium.

## Visuell und semantisch

- PASS – Chromium-Übersicht mit 24 fokussierbaren Geschichtenlinks
- PASS – Detailansicht O15 mit semantischer Hauptüberschrift und vollständigen Absätzen
- PASS – Originalkarten-Fallback unverzerrt und mit aussagekräftigem Alternativtext
- PASS – eindeutige Rücknavigation und sichtbare freiwillige Musikaktion
- BLOCKED – echte iPhone-Safari- und Android-Chrome-Geräte standen in der lokalen Testumgebung nicht zur Verfügung
- BLOCKED – abschließender Screenreader-Gerätetest; die Browser-Zugänglichkeitsstruktur wurde geprüft

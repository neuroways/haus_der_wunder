# EMFD-HOUSE-01 – Integration v0.6.49

Ausgangsfassung: EMFD-P0-U01-v0.6.48-Beduerfnisgalerie-home.zip
Medienquelle: EMFD_Media_Ablage_v1.0(1).zip

## Implementiert

- Flur: Link **Alle Räume ansehen** wieder sichtbar, neben **Über dieses Geschenk**, ohne Raumillustration zu verändern.
- Raumübersicht: P01–P08 und Musikzimmer. Vorhandene P04/P08/Musik-Routen unverändert.
- Grundansichten: #ort/P01, P02, P03, P05, P06, P07 mit bestehender WebP-Illustration, Bildalternativtext, Rückweg zur Übersicht und zum Flur.
- Sechs Räume: neutrale, anklickbare Kategorien Ruhe/Kraft/Halt/Freude öffnen die bestehende Bildkartengalerie mit vorausgewählter Gruppe. Das ist **keine** kuratierte Kategorie-Raum-Zuordnung.
- Raumübersicht: neun optimierte Vorschaubilder unter media/rooms/thumbs/; Originalbilder unverändert.
- Mobile Grundansichten sind scrollbar; die bestehenden fortgeschrittenen Räume und Audiosteuerung bleiben unangetastet.
- Client-Hausregister enthält leere Räume-Kategorien- und Raumverbindungen-Strukturen für einen späteren Ausbau. Es gibt noch keinen Backend-API-Endpunkt und keine räumliche Grundrissfestlegung.

## Auslieferung / Upload

- App-Paket `home/`: nach `Root/moments/home/`.
- Medienergänzung `media/rooms/`: nach `Root/moments/media/rooms/`, nicht in `home/` kopieren.
- Ziel-URL der App bleibt `/home/` und die Hashrouten bleiben erhalten.
- Ein bestehendes, neueres Medienmanifest / vorhandene Bilder nicht ungeprüft überschreiben. Die hinzugefügten Vorschauen unter `thumbs/` sind neu.
- Der bestehende P08-Teezimmer-Interaktionshintergrund `teezimmer_p08_background.webp` ist **nicht** Bestandteil der verfügbaren Medienablage; die bestehende Live-Datei muss erhalten bleiben.
- Audiodateien (u.a. THEME.mp3) sind nicht Bestandteil der verfügbaren Medienablage, kein Audio wurde verändert oder neu erzeugt.
- Medien aus der Ablage gelten weiterhin als interne Testmedien, nicht automatisch als final freigegeben.

## Grenzen

Kein Live-Deployment, keine mobile Geräteabnahme, keine Freigabe eines Grundrisses. Browserdarstellung wird separat dokumentiert.

## Lokale Prüfung

`npm test`: 132 Tests, 130 bestanden, 0 fehlgeschlagen, 2 nachvollziehbar übersprungen (separater Root-Service-Worker fehlt im home-only-Paket und Audio-Beispieldatei fehlt in den bereitgestellten Medien). JavaScript-Syntax geprüft, neue Hauptmotive bytegleich gegenüber dem Medienarchiv. Eine grafische Browserprüfung war in dieser Umgebung blockiert; die reale visuelle Abnahme auf iPhone/Android bleibt ausstehend.
